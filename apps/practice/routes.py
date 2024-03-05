# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import request, jsonify, send_file
from apps.models import Lesson, SubLesson

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
    global current_lesson

    # Retrieve the lesson number from the form data
    lesson_num = request.form.get('lesson_num')

    # Fetch the lesson from the database using the lesson number
    lesson = Lesson.query.filter_by(id=lesson_num).first()

    if not lesson:
        return jsonify({'error': 'Lesson not found', 'error_num': 404})

    # Fetch associated scenarios for the lesson
    scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).all()

    # Prepare scenarios data
    scenarios_data = {}
    for index, scenario in enumerate(scenarios, start=1):
        scenarios_data[str(index)] = scenario.to_dict()

    # Prepare the lesson data
    lesson_data = {
        'lesson_name': lesson.title,  # Assuming 'title' is an attribute of Lesson model
        'lesson_num': lesson.id,
        'scenarios': scenarios_data
    }

    current_lesson = lesson_data  # Set the global variable if needed

    return jsonify(lesson_data)


def calculate_score(scenario_num):
    
    global current_lesson, user_sentiments

    score = 1

    print(current_lesson)
    expected_sentiments = current_lesson['scenarios'][str(scenario_num)]['expected_sentiments']


    formatted_user_sentiments = {}
    for sentiment in user_sentiments[0]:
        formatted_user_sentiments[sentiment['label']] = sentiment['score']

    
    first_item = True
    for exp_sentiment_label, exp_sentiment_score in expected_sentiments.items():
        user_sentiment_score = formatted_user_sentiments[exp_sentiment_label]
        difference = abs(exp_sentiment_score - user_sentiment_score)
        
        # Penalize user for only the first expected sentiment, as it is the most important
        if first_item:
            score -= difference
            first_item = False
        else:
            # Give bonus to user if they are within 5% of the rest of the sentiments
            if abs(difference) <= 0.2:
                score += difference
        
        

    return score * 10


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
def analyze_speech():
    global user_sentiments
    user_sentiments = None
    try:
        files = request.files
        file = files.get('file')
        scenario_num = request.form['scenario_num']
        # Save the audio file received into disk & convert it to .wav format (speech_recognition doesn't work with .mp3 format)
        new_path = get_wav_path(file)

        try:
            text = transcribe_text(new_path)
        except (sr.UnknownValueError, sr.RequestError):
            # 209 is a speech recognition error
            return jsonify({"error": "Speech recognition could not understand audio", "code": 209})
    
        # Delete the WAV  file as we don't need it anymore
        os.remove(new_path)

        # Try 3 times if it's not getting the sentiment
        attempt_nums = 0
        while not user_sentiments and attempt_nums < 3:
            attempt_nums += 1
            user_sentiments = get_sentiments(text)
            time.sleep(1)
        if not user_sentiments:
            # 309 is a sentiment analysis API error
            return jsonify({"error":"Error occurred while connecting to Hugging Face API; {0}".format(e), "code": 309})
        
        score = calculate_score(scenario_num=scenario_num)

        return {'user_speech':text, 'user_sentiments': user_sentiments, 'score':score}
    except Exception as e:
        print(traceback.print_exc())
        return jsonify({"error": "An unknown error has occured", "code": 404})
    








# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
