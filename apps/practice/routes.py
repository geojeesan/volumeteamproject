# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from flask import request, jsonify
from apps.models import db, Lesson, SubLesson, UserScenarioProgress, UserProgress
from speech_recognition import UnknownValueError
from apps.config import API_GENERATOR
import speech_recognition as sr
import traceback
from pydub import AudioSegment
import requests
import os
import parselmouth
import numpy as np
import time

current_lesson = None
user_sentiments = None


@blueprint.route('/practice/<int:lesson_num>-<int:scenario_num>')
@login_required
def practice(lesson_num, scenario_num):
    return render_template('practice/practice.html', segment='practice',
                           lesson_number=lesson_num, scenario_number=scenario_num, API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/get_lesson', methods=['POST'])
def get_lesson():
    # Explicitly convert lesson_num to integer
    try:
        lesson_num = int(request.form.get('lesson_num'))
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid lesson number format', 'error_num': 400}), 400

    lesson = Lesson.query.filter_by(num=lesson_num).first()

    if not lesson:
        return jsonify({'error': 'Lesson not found', 'error_num': 404}), 404

    scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).all()
    # Sort scenarios based on the "order_in_lesson" attribute
    sorted_scenarios = sorted(scenarios, key=lambda x: x.order_in_lesson)

    # Create a dictionary where the keys are the order_in_lesson and values are scenario dictionaries
    scenarios_data = {str(scenario.order_in_lesson): scenario.to_dict()
                      for scenario in sorted_scenarios}

    lesson_data = {
        'lesson_name': lesson.title,
        'lesson_num': lesson.num,
        'scenarios': scenarios_data
    }

    return jsonify(lesson_data)


def calculate_user_progress(user_id, lesson_id):
    """Calculates the user's progress for a specific lesson based on completed scenarios."""
    total_scenarios = SubLesson.query.filter_by(lesson_id=lesson_id).count()
    completed_scenarios = UserScenarioProgress.query.filter_by(user_id=user_id, scenario_id=SubLesson.id, completed=True).join(
        SubLesson).filter(SubLesson.lesson_id == lesson_id).count()

    progress_percentage = (completed_scenarios /
                           total_scenarios) * 100 if total_scenarios else 0
    return progress_percentage


def update_user_scenario_progress(user_id, scenario_id, score):
    """Update or create progress entry for a user's scenario."""

    # Validate scenario_id
    scenario_exists = db.session.query(SubLesson.id).filter_by(
        id=scenario_id).first() is not None
    if not scenario_exists:
        print(f"Scenario with id {scenario_id} does not exist.")
        return False

    progress_entry = UserScenarioProgress.query.filter_by(
        user_id=user_id, scenario_id=scenario_id).first()

    if progress_entry:
        progress_entry.score = score  # Update score if already exists
        progress_entry.completed = True
    else:
        new_progress = UserScenarioProgress(
            user_id=user_id, scenario_id=scenario_id, completed=True, score=score)
        db.session.add(new_progress)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()  # Rollback in case of an exception
        print(f"Database commit failed: {e}")


def convert_lesson_to_dict(lesson, user_id=None):
    lesson_dict = lesson.to_dict(user_id=user_id)
    lesson_dict['scenarios'] = {
        scenario.id: scenario.to_dict() for scenario in lesson.scenarios}
    return lesson_dict


def calculate_score(scenario_num, lesson, sentiments):
    score = 1
    # Sort scenarios by ID for consistent ordering
    scenarios = sorted(lesson.scenarios, key=lambda x: x.id)

    # Convert scenario_num from 1-based to 0-based index for Python list indexing
    index = scenario_num - 1

    if index >= len(scenarios) or index < 0:
        raise ValueError("Scenario number out of range.")

    scenario_data = scenarios[index]

    expected_sentiments = scenario_data.expected_sentiments

    # Process sentiments (remaining logic stays the same)
    formatted_user_sentiments = {}
    for sentiment in sentiments:
        if 'label' in sentiment and 'score' in sentiment:
            formatted_user_sentiments[sentiment['label']] = sentiment['score']

    first_item = True
    for exp_sentiment_label, exp_sentiment_score in expected_sentiments.items():
        user_sentiment_score = formatted_user_sentiments.get(
            exp_sentiment_label, 0)
        difference = abs(exp_sentiment_score - user_sentiment_score)

        if first_item:
            score -= difference
            first_item = False
        else:
            score += max(0, 0.2 - difference)  # Adjusted scoring logic

    return max(score, 0) * 10


def transcribe_text(new_path):
    # Initialize the recognizer
    recognizer = sr.Recognizer()

    with sr.AudioFile(new_path) as source:
        # Record the audio
        audio_data = recognizer.record(source)

    # Use the recognizer to transcribe the audio from the WAV file
    text = recognizer.recognize_google(audio_data=audio_data, language='en-US')

    return text


def get_sentiments(text):
    API_URL = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
    headers = {"Authorization": "Bearer REMOVED"}
    num_attempts = 1

    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()

    def attempt_query():
        return query({
            "inputs": text,
        })

    try:
        output = attempt_query()
        # We will attempt 5 times, with each attempt waiting 3 times more than the last one.
        while 'error' in output and num_attempts < 5:
            print("Error in sentiment analysis, trying again...")
            time.sleep(3*num_attempts)
            num_attempts += 1
            output = attempt_query()

        return output
    except requests.exceptions.RequestException as e:
        return None


# - Takes the MP3 audio blob sent from the user
# - Saves MP3 file to disk
# - Converts MP3 to WAV and saves to disk
# - Returns the path of the WAV file
def get_wav_path(file):
    blob_content = file.read()
    save_path = 'saved_file.mp3'

    with open(save_path, 'wb') as f:
        f.write(blob_content)

    new_path = "new_file.wav"
    sound = AudioSegment.from_file(save_path)

    # Delete MP3 file as we don't need it anymore
    os.remove(save_path)

    sound.export(new_path, format="wav")
    return new_path


def analyze_tone(audio_file_path):
    """
    Calculate pitch variability in speech using the fundamental frequency (F0).

    Parameters:
        audio_file_path (str): Path to the audio file containing speech.

    Returns:
        float: Pitch variability score.
    """
    # Load audio file
    snd = parselmouth.Sound(audio_file_path)

    # Extract pitch information
    pitch = snd.to_pitch()
    if pitch is None:  # If unable to extract pitch information
        return None

    increment = 0.25  # Every 0.25s
    times = np.arange(0, snd.duration, increment)

    # Get pitch contour
    pitch_values = pitch.selected_array['frequency']

    # pitch_values_data = [pitch.get_value_at_time(t) for t in times]

    # Calculate standard deviation of pitch values
    pitch_std_dev = np.std(pitch_values)

    return pitch_std_dev, pitch_values, times


def get_audio_length(audio_file_path):
    # Load the audio file
    audio = AudioSegment.from_file(audio_file_path)

    # Get the length of the audio in milliseconds
    length_in_ms = len(audio)

    # Convert milliseconds to seconds
    length_in_seconds = length_in_ms / 1000

    return length_in_seconds


@blueprint.route('/analyze_speech', methods=['POST'])
# @login_required
def analyze_speech():
    try:
        file = request.files.get('file')
        scenario_num = request.form.get('scenario_num', type=int)
        lesson_num = request.form.get('lesson_num', type=int)

        if not file or scenario_num is None or lesson_num is None:
            return jsonify({"error": "Missing required data", "code": 400}), 400

        lesson = Lesson.query.filter_by(num=lesson_num).first()
        if not lesson:
            return jsonify({"error": "Lesson not found", "code": 404}), 404

        scenario = SubLesson.query.filter_by(lesson_id=lesson.id).order_by(
            SubLesson.id).offset(scenario_num - 1).first()
        if not scenario:
            return jsonify({"error": "Scenario not found", "code": 404}), 404

        new_path = get_wav_path(file)

        pitch_variability, pitch_values, pitch_times = analyze_tone(new_path)

        pitch_values = list(pitch_values)
        pitch_times = list(pitch_times)

        audio_length = get_audio_length(new_path)

        try:
            text = transcribe_text(new_path)
        except UnknownValueError:
            # Clean up even in case of transcription failure
            os.remove(new_path)
            return jsonify({"error": "Speech recognition could not understand the audio. Please try again.", "code": 209}), 400
        os.remove(new_path)  # Clean up after successful transcription

        sentiments = get_sentiments(text)

        if not sentiments or 'error' in sentiments:
            return jsonify({"error": "Failed to get sentiments from the analysis API. Please try again", "code": 309}), 400

        # Assuming your existing functions to calculate score and update progress...
        score = calculate_score(scenario_num, lesson, sentiments)
        update_user_scenario_progress(current_user.id, scenario.id, score)
        progress_percentage = calculate_user_progress(
            current_user.id, lesson.id)

        # Update user's data after scenario completion.
        UserProgress.update_progress(current_user.id)

        return jsonify({
            'user_speech': text,
            'user_sentiments': sentiments,
            'score': score,
            'tone_data': pitch_values,
            'tone_times': pitch_times,
            'audio_length': audio_length,

            # Need to do this in a different function
            'progress': progress_percentage
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An unknown error occurred", "code": 500, "details": str(e)}), 500


@blueprint.route('/api/skill_progress', methods=['GET'])
@login_required
def get_skill_progress():
    sentiment_totals = {}  # Total scores per sentiment
    sentiment_counts = {}  # Count of occurrences per sentiment

    user_scenarios = UserScenarioProgress.query.filter_by(
        user_id=current_user.id, completed=True).all()
    for user_scenario in user_scenarios:
        scenario = SubLesson.query.filter_by(
            id=user_scenario.scenario_id).first()
        if scenario:
            # Assuming sentiment scores are between 0 and 1
            for sentiment, expected_score in scenario.expected_sentiments.items():
                # Convert user score back to 0-1 scale if stored as percentage
                actual_score = user_scenario.score / 100
                score_diff = abs(expected_score - actual_score)
                # Higher score for closer match
                sentiment_score = max(0, 1 - score_diff)

                if sentiment not in sentiment_totals:
                    sentiment_totals[sentiment] = 0
                    sentiment_counts[sentiment] = 0

                sentiment_totals[sentiment] += sentiment_score
                sentiment_counts[sentiment] += 1

    # Average out the scores for each sentiment
    for sentiment in sentiment_totals.keys():
        sentiment_totals[sentiment] /= sentiment_counts[sentiment]

    # Sort sentiments by total score and get top 4
    top_sentiments = sorted(sentiment_totals.items(),
                            key=lambda item: item[1], reverse=True)[:4]

    # Convert to a dict for JSON response, scaling scores up to percentage
    top_sentiments_dict = {sentiment: score *
                           100 for sentiment, score in top_sentiments}

    return jsonify(top_sentiments_dict)


@blueprint.route('/api/lessons/average_performance', methods=['GET'])
@login_required
def get_average_performance():
    # Get all lessons
    lessons = Lesson.query.all()
    # Dict to hold lesson id and its average score
    lesson_scores = {}

    for lesson in lessons:
        # Calculate the average score for each lesson
        user_scenarios = UserScenarioProgress.query\
            .join(SubLesson, UserScenarioProgress.scenario_id == SubLesson.id)\
            .filter(SubLesson.lesson_id == lesson.id, UserScenarioProgress.user_id == current_user.id, UserScenarioProgress.completed == True)\
            .all()
        if user_scenarios:
            average_score = sum(
                [scenario.score for scenario in user_scenarios]) / len(user_scenarios)
            lesson_scores[lesson.id] = average_score
        else:
            lesson_scores[lesson.id] = 0  # No scenarios or no score yet
    print(lesson_scores)
    return jsonify(lesson_scores)


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
