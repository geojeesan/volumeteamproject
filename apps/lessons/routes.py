# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import login_required
from jinja2 import TemplateNotFound
from apps.config import API_GENERATOR
from apps.models import Lesson


@blueprint.route('/lessons')
def lessons():
    return render_template('lessons/lessons.html', segment='lessons', API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/api/lessons', methods=['GET'])
def get_lessons():
    lessons = Lesson.query.all()
    in_progress_lesson = Lesson.query.filter_by(in_progress=True).order_by(Lesson.last_accessed.desc()).first()
    lessons_data = [{
        'id': lesson.id,
        'title': lesson.title,
        'description': lesson.description,
        'image_path': lesson.image_path,
        'difficulty': lesson.difficulty.name  # Include difficulty here
    } for lesson in lessons]
    return jsonify(lessons_data)

@blueprint.route('/api/lessons/status', methods=['GET'])
def get_lessons_status():
    # Get the last accessed lesson
    last_accessed_lesson = Lesson.query.filter_by(in_progress=True).order_by(Lesson.last_accessed.desc()).first()

    # Get lessons in order of progress that are not completed
    in_order_lessons = Lesson.query.filter_by(completed=False).order_by(Lesson.progress.desc()).all()

    # Get lessons with no or barely any progress
    no_progress_lessons = Lesson.query.filter(Lesson.progress <= 10, Lesson.completed == False).all()

    return jsonify({
        'lastAccessed': last_accessed_lesson and last_accessed_lesson.to_dict(),
        'orderedByProgress': [lesson.to_dict() for lesson in in_order_lessons],
        'noProgress': [lesson.to_dict() for lesson in no_progress_lessons]
    })

# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
