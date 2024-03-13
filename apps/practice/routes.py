# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from flask import request, jsonify, send_file
from apps.models import db, Lesson, SubLesson, UserScenarioProgress
from speech_recognition import UnknownValueError
from apps.config import API_GENERATOR

import speech_recognition as sr
import traceback    
from pydub import AudioSegment
import requests
import os
import time


current_lesson = None
user_sentiments = None

@blueprint.route('/practice/<int:number>')
def practice(number):
    return render_template('practice/practice.html', segment='practice', lesson_number=number)

@blueprint.route('/get_lesson', methods=['POST'])
def get_lesson():
    lesson_num = request.form.get('lesson_num')
    lesson = Lesson.query.filter_by(num=lesson_num).first()

    if not lesson:
        return jsonify({'error': 'Lesson not found', 'error_num': 404}), 404

    scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).all()
    scenarios_data = {str(index): scenario.to_dict() for index, scenario in enumerate(scenarios, start=1)}

    lesson_data = {
        'lesson_name': lesson.title,
        'lesson_num': lesson.num,
        'scenarios': scenarios_data
    }

    return jsonify(lesson_data)

def calculate_user_progress(user_id, lesson_id):
    """Calculates the user's progress for a specific lesson based on completed scenarios."""
    total_scenarios = SubLesson.query.filter_by(lesson_id=lesson_id).count()
    completed_scenarios = UserScenarioProgress.query.filter_by(user_id=user_id, scenario_id=SubLesson.id, completed=True).join(SubLesson).filter(SubLesson.lesson_id==lesson_id).count()

    progress_percentage = (completed_scenarios / total_scenarios) * 100 if total_scenarios else 0
    return progress_percentage

def update_user_scenario_progress(user_id, scenario_id, score):
    """Update or create progress entry for a user's scenario."""
    progress_entry = UserScenarioProgress.query.filter_by(user_id=user_id, scenario_id=scenario_id).first()

    if progress_entry:
        progress_entry.score = score  # Update score if already exists
        progress_entry.completed = True
    else:
        new_progress = UserScenarioProgress(user_id=user_id, scenario_id=scenario_id, completed=True, score=score)
        db.session.add(new_progress)

    db.session.commit()

def convert_lesson_to_dict(lesson, user_id=None):
    lesson_dict = lesson.to_dict(user_id=user_id)
    lesson_dict['scenarios'] = {scenario.id: scenario.to_dict() for scenario in lesson.scenarios}
    return lesson_dict

def calculate_score(scenario_num, lesson, sentiments):
    score = 1
    # Find the specific scenario using the relationship between Lesson and SubLesson
    scenario_data = next((scenario for scenario in lesson.scenarios if scenario.id == scenario_num), None)
    
    if scenario_data is None:
        raise ValueError("Scenario data not found for the given scenario number.")
    
    expected_sentiments = scenario_data.expected_sentiments

    # Adjusted processing of sentiments to handle list of dictionaries
    formatted_user_sentiments = {}
    for sentiment in sentiments:
        if 'label' in sentiment and 'score' in sentiment:
            formatted_user_sentiments[sentiment['label']] = sentiment['score']

    first_item = True
    for exp_sentiment_label, exp_sentiment_score in expected_sentiments.items():
        user_sentiment_score = formatted_user_sentiments.get(exp_sentiment_label, 0)
        difference = abs(exp_sentiment_score - user_sentiment_score)
        
        if first_item:
            score -= difference
            first_item = False
        else:
            score += max(0, 0.2 - difference)  # Adjusted scoring logic to prevent adding differences greater than 0.2

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
    try:
        API_URL = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
        headers = {"Authorization": "Bearer REMOVED"}

        def query(payload):
            response = requests.post(API_URL, headers=headers, json=payload)
            return response.json()
            
        output = query({
            "inputs": text,
        })
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


@blueprint.route('/analyze_speech', methods=['POST'])
@login_required
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

        new_path = get_wav_path(file)
        try:
            text = transcribe_text(new_path)
        except UnknownValueError:
            os.remove(new_path)  # Clean up even in case of transcription failure
            return jsonify({"error": "Speech recognition could not understand the audio", "code": 209}), 400
        os.remove(new_path)  # Clean up after successful transcription

        sentiments = get_sentiments(text)
        if sentiments is None:
            return jsonify({"error": "Failed to get sentiments from the analysis API", "code": 309}), 400

        # Assuming your existing functions to calculate score and update progress...
        score = calculate_score(scenario_num, lesson, sentiments)
        update_user_scenario_progress(current_user.id, scenario_num, score)
        progress_percentage = calculate_user_progress(current_user.id, lesson.id)

        return jsonify({
            'user_speech': text,
            'user_sentiments': sentiments,
            'score': score,
            'progress': progress_percentage
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "An unknown error occurred", "code": 500}), 500
    
@blueprint.route('/api/skill_progress', methods=['GET'])
def get_skill_progress():
    # Retrieve lesson progress data from the database
    # For demonstration, I am using static values
    skill_progress = {
        'articulation': 70,  # Percentage of progress for the 'Articulation' skill
        'volume': 50,        # Percentage of progress for the 'Volume' skill
        'rhythm': 30,        # Percentage of progress for the 'Rhythm' skill
        'expression': 90     # Percentage of progress for the 'Expression' skill
    }
    return jsonify(skill_progress)







# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
