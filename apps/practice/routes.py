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

@blueprint.route('/practice')
def practice():
    return render_template('practice/practice.html', segment='practice', API_GENERATOR=len(API_GENERATOR))


def get_speech_score(num):
    return num - 10


@blueprint.route('/analyze_speech', methods=['POST'])
def analyze_speech():

    requestData = request.get_json()  # Retrieve requestData from the POST request

    # Use the requestData as needed
    # For example, pass it to get_speech_score function
    num = requestData['num']

    return jsonify(get_speech_score(num))


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
