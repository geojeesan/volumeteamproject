# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify

import requests
from apps.config import API_GENERATOR

@blueprint.route('/index')
@login_required
def index():
    return render_template('home/index.html', segment='index', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/api/index/events', methods=['GET'])
@login_required
def events():
    url = "https://www.eventbriteapi.com/v3/"
    headers = {
        "Authorization": "Bearer MDSVTTIPXDGH3ZNUIWW3",  # Make sure to use your actual API key
        "Content-Type": "application/json"
    }
    params = {
        "q": "public speaking",
        # Add any other parameters you might need
    }
    response = requests.get(url, headers=headers, params=params)
    
    if response.status_code == 200:
        events_data = response.json()
        # Check if the 'events' key is in the response data
        if 'events' in events_data:
            return jsonify(events=events_data['events'])
        else:
            # If the 'events' key isn't there, log the error and return an empty array
            print('No events key in response:', events_data)
            return jsonify(events=[])
    else:
        print('Failed to fetch events:', response.status_code, response.text)
        return jsonify(events=[{'name': 'Event 1', 'start': {'local': 'date and time'}, 'summary': 'Event 1 summary'}])


@blueprint.route('/<template>')
def route_template(template):

    try:
        if not template.endswith('.html'):
            template += '.html'

        # Detect the current page
        segment = get_segment(request)

        # Serve the file (if exists) from app/templates/home/FILE.html
        return render_template("home/" + template, segment=segment, API_GENERATOR=len(API_GENERATOR))

    except TemplateNotFound:
        return render_template('home/page-404.html'), 404

    except:
        return render_template('home/page-500.html'), 500


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None


