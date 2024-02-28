# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound

from apps.config import API_GENERATOR

@blueprint.route('/lessons')
def lessons():
    return render_template('home/lessons.html', segment='lessons', API_GENERATOR=len(API_GENERATOR))

#@app.route('/api/lessons', methods=['GET']) # how tf do i add this to the blueprint
#def get_lessons():
#    lessons = Lesson.query.all()
#    lessons_list = [{'id': lesson.id, 'title': lesson.title, 'description': lesson.description, 'image_path': lesson.image_path} for lesson in lessons]
#    return jsonify(lessons_list)


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
