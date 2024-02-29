# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import login_required
from jinja2 import TemplateNotFound
#from apps.models import Lesson
from apps.config import API_GENERATOR

@blueprint.route('/lessons')
def lessons():
    return render_template('lessons/lessons.html', segment='lessons', API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/get-lessons', methods=['GET']) # how tf do i add this to the blueprint, i don't have a path called api/lessons
def get_lessons():
    # lessons = Lesson.query.all()
    # lessons_list = [{'id': lesson.id, 'title': lesson.title, 'description': lesson.description, 'image_path': lesson.image_path} for lesson in lessons]
    # print(lessons_list, jsonify(lessons_list))
    lessons_list = {'title': 'testTitle', 'description': 'testDescription', 'image_path': 'static/assets//img/shoe.jpg'}
    return jsonify(lessons_list)


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
