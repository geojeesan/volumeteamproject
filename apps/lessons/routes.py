# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from apps.config import API_GENERATOR
from apps.models import Lesson
from sqlalchemy import desc
from apps.models import Lesson, UserScenarioProgress, SubLesson

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



@blueprint.route('/api/lessons/completion', methods=['GET'])
@login_required
def get_lessons_completion():
    total_lessons = Lesson.query.count()
    user_id = current_user.id

    completed_lessons = 0
    for lesson in Lesson.query.all():
        total_scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).count()
        completed_scenarios = UserScenarioProgress.query.filter_by(
            user_id=user_id,
            scenario_id=SubLesson.id,
            completed=True
        ).join(SubLesson, SubLesson.lesson_id == lesson.id).count()

        if total_scenarios > 0 and total_scenarios == completed_scenarios:
            completed_lessons += 1

    completion_percentage = (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0

    # Ensure the response is always a float rounded to two decimal places
    completion_percentage = round(completion_percentage, 2)

    return jsonify({
        'completionPercentage': completion_percentage
    })


@blueprint.route('/api/lessons/status', methods=['GET'])
@login_required
def get_lessons_status():
    try:
        # Get all lessons accessed by the current user ordered by last accessed
        lessons = Lesson.query.join(SubLesson, Lesson.id == SubLesson.lesson_id)\
                              .join(UserScenarioProgress, SubLesson.id == UserScenarioProgress.scenario_id)\
                              .filter(UserScenarioProgress.user_id == current_user.id)\
                              .order_by(desc(UserScenarioProgress.id))\
                              .all()
        
        for lesson in lessons:
            # Determine the progress for the lesson
            progress = lesson.calculate_progress(current_user.id)

            # Consider the lesson in progress if any progress is made but not 100%
            if progress > 0 and progress < 100:
                last_accessed_lesson_data = lesson.to_dict(user_id=current_user.id)
                return jsonify({'lastAccessed': last_accessed_lesson_data})
        
        # If no lessons are in progress, return message
        return jsonify({'lastAccessed': None, 'message': 'No ongoing lessons'})

    except Exception as e:
        print(e)  # For debugging purposes
        return jsonify({'error': str(e)}), 500


@blueprint.route('/api/latest_pace_data', methods=['GET'])
def latest_pace_data():
    # Assuming paceData is stored globally or retrieved from a database
    global paceData
    if paceData:
        return jsonify(paceData)
    else:
        return jsonify({'error': 'No pace data available'}), 404
    

@blueprint.route('/api/lessons/<int:lesson_id>/next_scenario_after_last_completed', methods=['GET'])
@login_required
def get_next_scenario_after_last_completed(lesson_id):
    # Find the highest id of a completed scenario in the given lesson
    last_completed_scenario = UserScenarioProgress.query \
        .join(SubLesson, SubLesson.id == UserScenarioProgress.scenario_id) \
        .filter(
            UserScenarioProgress.user_id == current_user.id,
            UserScenarioProgress.completed == True,
            SubLesson.lesson_id == lesson_id
        ) \
        .order_by(UserScenarioProgress.scenario_id.desc()) \
        .first()

    if last_completed_scenario:
        last_completed_scenario_id = last_completed_scenario.scenario_id
    else:
        # If no scenarios are completed, we start from the beginning
        last_completed_scenario_id = 0

    # Now find the next scenario
    next_scenario = SubLesson.query \
        .filter(
            SubLesson.lesson_id == lesson_id,
            SubLesson.id > last_completed_scenario_id
        ) \
        .order_by(SubLesson.id) \
        .first()

    if next_scenario:
        # Find the lesson to get its 'num' attribute
        lesson = Lesson.query.filter_by(id=lesson_id).first()
        if lesson:
            # If there's a next scenario, return its details along with lesson number
            return jsonify({
                'id': next_scenario.lesson_id,  # This is actually redundant, given we already have lesson_id
                'scenario_id': next_scenario.id,
                'lesson_num': lesson.num  # Add the lesson number to the response
            })
        else:
            # If lesson is not found, return an error message
            return jsonify({'message': 'Lesson not found'}), 404
    else:
        # If there are no more scenarios, return an appropriate message
        return jsonify({'message': 'No more scenarios in the lesson or lesson is complete'}), 404




# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
