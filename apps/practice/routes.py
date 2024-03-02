# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify

from apps.config import API_GENERATOR

import speech_recognition as sr
import traceback    
from transformers import pipeline


@blueprint.route('/practice')
def practice():
    return render_template('practice/practice.html', segment='practice', API_GENERATOR=len(API_GENERATOR))


def get_speech_score(num):
    return num - 10

# @blueprint.route('/<path:blob_id>')
# def serve_blob(blob_id):
#     try:
#         # Process blob_id if needed
#         # Serve the appropriate content
#     except Exception as e:
#         # Handle exceptions
#         return str(e), 500


@blueprint.route('/analyze_speech', methods=['POST'])
def analyze_speech():
    try:
        files = request.files

        file = files.get('file')

        blob_content = file.read()

        # Define the path where you want to save the .wav file
        save_path = 'saved_file.mp3'

        # Write the content into a .wav file
        with open(save_path, 'wb') as f:
            f.write(blob_content)

        new_path = "new_file.wav"
 
        sound = AudioSegment.from_file(save_path)
        sound.export(new_path, format="wav")

        # Initialize the recognizer
        recognizer = sr.Recognizer()

        with sr.AudioFile(new_path) as source:
            # Record the audio
            audio_data = recognizer.record(source)

        # Use the recognizer to transcribe the audio from the WAV file
        text = recognizer.recognize_google(audio_data=audio_data, language='en-US')

        classifier = pipeline(task="text-classification", model="SamLowe/roberta-base-go_emotions", top_k=None)

        sentences = [text]

        model_outputs = classifier(sentences)

        return jsonify(text, model_outputs)
    
    

    except Exception as e:
        return jsonify(str(traceback.format_exc()))

    
        




# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
