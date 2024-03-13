# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from apps.config import API_GENERATOR
from apps.models import Lesson


@blueprint.route('/lessons')
def lessons():
    return render_template('lessons/lessons.html', segment='lessons', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/api/lessons', methods=['GET'])
@login_required
def get_lessons():
    lessons = Lesson.query.all()
    lessons_data = [{
        'id': lesson.id,
        'num': lesson.num,
        'title': lesson.title,
        'description': lesson.description,
        'image_path': lesson.image_path,
        'difficulty': lesson.difficulty.name,
        'progress': lesson.calculate_progress(current_user.id)  # Calculate progress for the current user
    } for lesson in lessons]
    return jsonify(lessons_data)

from apps.models import Lesson, UserScenarioProgress, SubLesson

@blueprint.route('/api/lessons/completion', methods=['GET'])
@login_required
def get_lessons_completion():
    total_lessons = Lesson.query.count()
    user_id = current_user.id  # Assuming current_user is correctly set up

    # Calculate the number of lessons where all scenarios are completed by the current user
    completed_lessons = 0
    for lesson in Lesson.query.all():
        total_scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).count()
        completed_scenarios = UserScenarioProgress.query.filter_by(
            user_id=user_id, 
            scenario_id=SubLesson.id,
            completed=True
        ).join(SubLesson).filter(SubLesson.lesson_id == lesson.id).count()

        if total_scenarios > 0 and total_scenarios == completed_scenarios:
            completed_lessons += 1

    if total_lessons > 0:
        completion_percentage = (completed_lessons / total_lessons) * 100
    else:
        completion_percentage = 0  # To handle division by zero if no lessons are present

    return jsonify({
        'completionPercentage': completion_percentage
    })


@blueprint.route('/api/lessons/status', methods=['GET'])
@login_required
def get_lessons_status():
    try:
        last_accessed_lesson = Lesson.query.filter_by(in_progress=True, user_id=current_user.id).order_by(Lesson.last_accessed.desc()).first()

        if last_accessed_lesson:
            last_accessed_lesson_data = last_accessed_lesson.to_dict(user_id=current_user.id)
            return jsonify({'lastAccessed': last_accessed_lesson_data})
        else:
            return jsonify({'message': 'No last accessed lesson found.'}), 200
    except Exception as e:
        return jsonify({'error': 'An error occurred while fetching the last accessed lesson.'}), 200


@blueprint.route('/api/latest_pace_data', methods=['GET'])
def latest_pace_data():
    # Assuming paceData is stored globally or retrieved from a database
    global paceData
    if paceData:
        return jsonify(paceData)
    else:
        return jsonify({'error': 'No pace data available'}), 404
    
# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
