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
import ffmpeg
import os


@blueprint.route('/practice')
def practice():
    return render_template('practice/practice.html', segment='practice', API_GENERATOR=len(API_GENERATOR))


def get_speech_score(num):
    return num - 10


@blueprint.route('/analyze_speech', methods=['POST'])
def analyze_speech():
    if 'audio' not in request.files:
        return 'No audio file provided', 400
    
    audio_file = request.files['audio']
    
    # Check if the file is of type audio/wav
    if audio_file.mimetype != 'audio/wav':
        # Save the audio file temporarily
        temp_audio_path = 'temp_audio' + os.path.splitext(audio_file.filename)[1]
        audio_file.save(temp_audio_path)
        
        # Convert the audio file to WAV using ffmpeg-python
        wav_audio_path = 'temp_audio.wav'
        try:
            ffmpeg.input(temp_audio_path).output(wav_audio_path).run()
        except ffmpeg.Error as e:
            return f'Error converting audio file to WAV: {str(e)}', 400
        finally:
            # Remove temporary audio file
            os.remove(temp_audio_path)
        
        audio_file = wav_audio_path
    
    # Initialize recognizer
    recognizer = sr.Recognizer()
    
    try:
        # Read the audio file
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
        
        # Use recognizer to transcribe audio to text
        text = recognizer.recognize_google(audio_data)
        return text
    except sr.UnknownValueError:
        return 'Speech recognition could not understand audio', 400
    except sr.RequestError as e:
        return f'Speech recognition service error: {str(e)}', 500
  
        




# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
