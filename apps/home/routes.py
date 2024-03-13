# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from flask import jsonify

import requests
from apps.config import API_GENERATOR
from apps.models import db, Event

@blueprint.route('/index')
@login_required
def index():
    return render_template('home/index.html', segment='index', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/api/index/events', methods=['GET'])
@login_required
def events_api():
    # Retrieve the event_id from the query string
    event_id = request.args.get('event_id')
    
    # Ensure an event_id was provided
    if not event_id:
        return jsonify({'error': 'No event_id provided'}), 400

    # Construct the URL using the provided event_id
    url = f"https://www.eventbriteapi.com/v3/events/{event_id}/"
    headers = {
        "Authorization": "Bearer MDSVTTIPXDGH3ZNUIWW3",
        "Content-Type": "application/json"
    }
    
    # Make the GET request to the Eventbrite API
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        event_data = response.json()
        
        # Process and save the fetched event to the database
        new_event = Event(
            id=event_data['id'],
            name=event_data['name']['text'],
            description=event_data.get('description', {}).get('text', ''),
            url=event_data['url'],
            start_utc=event_data['start']['utc'],
            end_utc=event_data['end']['utc'],
            status=event_data['status'],
            online_event=event_data.get('online_event', False),
            logo_url=event_data.get('logo', {}).get('url', ''),
            user_id=current_user.id  # Assuming you have user authentication set up
        )
        db.session.add(new_event)
        db.session.commit()
        
        # Respond with the newly added event
        return jsonify(new_event.to_dict())
    else:
        print(f'Failed to fetch event: {response.status_code}', response.text)
        return jsonify({'error': response.text}), response.status_code



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


