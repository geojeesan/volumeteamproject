# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify
from datetime import datetime

from apps.config import API_GENERATOR
from apps.models import Event



@blueprint.route('/index')
@login_required
def index():
    return render_template('home/index.html', segment='index', API_GENERATOR=len(API_GENERATOR))

#upcoming events 
@blueprint.route('/index/upcoming-events')
@login_required
def upcoming_events():
    current_time = datetime.utcnow()
    events = Event.query.filter(Event.end_utc > current_time).order_by(Event.start_utc.asc()).limit(4).all()
    events_data = [
        {
            'id': event.id,
            'name': event.name,
            'description': event.description,
            'start_utc': event.start_utc.strftime('%Y-%m-%d %H:%M:%S'),
            'end_utc': event.end_utc.strftime('%Y-%m-%d %H:%M:%S'),
        }
        for event in events
    ]

    return jsonify(events_data)


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


