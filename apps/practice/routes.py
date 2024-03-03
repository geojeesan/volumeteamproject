# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify, send_file

from apps.config import API_GENERATOR

import speech_recognition as sr
import traceback    
from pydub import AudioSegment
import requests
import os
import base64


current_lesson = None
user_sentiments = None

@blueprint.route('/practice')
def practice():
    return render_template('practice/practice.html', segment='practice', API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/get_lesson', methods=['POST'])
def get_lesson():
    global current_lesson

    lesson_num = request.form.get('lesson_num')

    scenario_details = "Your friend John Doe is dealing with a lot of academic stress. Despite\
    having performed well in all other modules, he is now feeling pessimistic regarding this academic year.\
          Convince him that everything is still under his control."

    # User will send as a request the lesson number. 
    # Then we will return something like the following:
    lesson = {'lesson_name':'Instilling Confidence', 'lesson_num':'1', 'scenarios':{'1':{"scenario_name": 
    'A Wake-up Call', "scenario_details": scenario_details, "expected_sentiments": {'caring': 0.8, 'excitement': 0.4,  'optimism': 0.4}}}}

    current_lesson = lesson
    
    return lesson


def calculate_score(scenario_num):
    
    global current_lesson, user_sentiments

    score = 1

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
            if difference <= 0.05:
                score += difference
        
        

    return score * 10


@blueprint.route('/analyze_speech', methods=['POST'])
def analyze_speech():
    global user_sentiments

    try:
        print(1)
        files = request.files

        scenario_num = request.form['scenario_num']

        file = files.get('file')

        blob_content = file.read()

        # Define the path where you want to save the .wav file
        save_path = 'saved_file.mp3'

        # Write the content into a .wav file
        with open(save_path, 'wb') as f:
            f.write(blob_content)

        print(2)
        new_path = "new_file.wav"
 
        sound = AudioSegment.from_file(save_path)
        sound.export(new_path, format="wav")

        # Initialize the recognizer
        recognizer = sr.Recognizer()

        with sr.AudioFile(new_path) as source:
            # Record the audio
            audio_data = recognizer.record(source)

        print(3)
        # Use the recognizer to transcribe the audio from the WAV file
        text = recognizer.recognize_google(audio_data=audio_data, language='en-US')

        print("sending", text)

        API_URL = "https://api-inference.huggingface.co/models/SamLowe/roberta-base-go_emotions"
        headers = {"Authorization": "Bearer REMOVED"}

        def query(payload):
            response = requests.post(API_URL, headers=headers, json=payload)
            return response.json()
            
        output = query({
            "inputs": text,
        })
        
        user_sentiments = output

        print("output:", output)

        score = calculate_score(scenario_num=scenario_num)
        # score = 10

        return {'user_speech':text, 'user_sentiments': output, 'score':score}
    

    except Exception as e:
        # Must return proper error to client
        print(traceback.print_exc())
        return jsonify("ERROR")






# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
