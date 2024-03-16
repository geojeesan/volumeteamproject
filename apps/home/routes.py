# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from flask import jsonify
from datetime import datetime, timedelta

from apps.config import API_GENERATOR
from apps.models import db, Event, Lesson, UserScenarioProgress, SubLesson
from apps.authentication.models import Users
import random
from sqlalchemy.sql.expression import func
from sqlalchemy import and_, case, func

def calculate_level_progress(user_id):
    # Define the number of lessons required to complete each level
    lessons_per_level = 3
    
    # Get the number of completed lessons for each difficulty level
    completed_lessons_counts = db.session.query(
        Lesson.difficulty, func.count(Lesson.id)
    ).join(SubLesson, Lesson.id == SubLesson.lesson_id) \
     .join(UserScenarioProgress, SubLesson.id == UserScenarioProgress.scenario_id) \
     .filter(UserScenarioProgress.user_id == user_id) \
     .filter(UserScenarioProgress.completed == True) \
     .group_by(Lesson.difficulty) \
     .all()

    # Convert to a dictionary for easier access
    completed_lessons_dict = {difficulty.name: count for difficulty, count in completed_lessons_counts}

    # Determine the current level based on completed lessons
    current_level = 'beginner'
    level_progress = 0
    
    # Check progress within the beginner level
    beginner_completed = completed_lessons_dict.get('beginner', 0)
    if beginner_completed < lessons_per_level:
        level_progress = round((beginner_completed / lessons_per_level) * 100, 1)
    else:
        current_level = 'intermediate'
        intermediate_completed = completed_lessons_dict.get('intermediate', 0)
        if intermediate_completed < lessons_per_level:
            level_progress = round((intermediate_completed / lessons_per_level) * 100, 1)
        else:
            current_level = 'advanced'
            advanced_completed = completed_lessons_dict.get('advanced', 0)
            if advanced_completed < lessons_per_level:
                level_progress = round((advanced_completed / lessons_per_level) * 100, 1)
            else:
                current_level = 'master'
                level_progress = 100  # Assuming 'master' is the highest level

    return current_level, round(level_progress, 1)

# make a variable for lessons and use division 


def get_daily_index(total_items, start_date=datetime(2024, 1, 1)):
    days_since_start = (datetime.utcnow() - start_date).days
    return days_since_start % total_items


@blueprint.route('/index')
@login_required
def index():
    # Get a list of all lessons
    lessons = Lesson.query.all()
    # Calculate index for the featured lesson
    lesson_index = get_daily_index(len(lessons), datetime(2024, 1, 1))
    featured_lesson = lessons[lesson_index]

    # No need to calculate the featured image URL here anymore since JavaScript will handle it

    return render_template(
        'home/index.html',
        segment='index',
        API_GENERATOR=len(API_GENERATOR),
        featured_lesson=featured_lesson,

        # Note that we're not passing featured_image_url to the template anymore
    )

#Test scores chart
@blueprint.route('/test-scores')
@login_required
def test_scores():
    scores_query = UserScenarioProgress.query.order_by(UserScenarioProgress.score.asc()).all()
    scores_data = {
        # Generate labels dynamically based on the number of entries in scores_query
        'labels': [f'Test {i+1}' for i in range(len(scores_query))],
        'datasets': [{
            'label': 'Test Scores',
            'data': [score.score for score in scores_query],
            'fill': False,
            'borderColor': 'rgb(75, 192, 192)',
            'tension': 0.1
        }]
    }
    return jsonify(scores_data)

#3 cards on top 
@blueprint.route('/user-progress')
@login_required
def user_progress():
    user_id = current_user.get_id()  # Assumes current_user is set up with Flask-Login

    # Lessons Completed
    lessons_completed = Lesson.query \
        .join(SubLesson, Lesson.id == SubLesson.lesson_id) \
        .join(UserScenarioProgress, SubLesson.id == UserScenarioProgress.scenario_id) \
        .filter(UserScenarioProgress.user_id == user_id) \
        .filter(UserScenarioProgress.completed == True) \
        .group_by(Lesson.id) \
        .having(func.count(SubLesson.id) == func.count(UserScenarioProgress.scenario_id)) \
        .count()
    # so count the number of scenarios  for each lesson id if all scenarios are completed , increment 1 

    
    lessons_in_progress = Lesson.query \
        .join(SubLesson, Lesson.id == SubLesson.lesson_id) \
        .outerjoin(UserScenarioProgress, and_(SubLesson.id == UserScenarioProgress.scenario_id, UserScenarioProgress.user_id == user_id)) \
        .group_by(Lesson.id) \
        .having(
            and_(
                func.count(SubLesson.id) > func.count(UserScenarioProgress.scenario_id),
                func.sum(case((UserScenarioProgress.completed == True, 1), else_=0)) > 0
            )
        ) \
        .count()

    current_level, level_progress = calculate_level_progress(user_id)

    return jsonify({
        'lessons_completed': lessons_completed,
        'lessons_in_progress': lessons_in_progress,
        'current_level': current_level,
        'level_progress': level_progress
    })

#leaderboard
@blueprint.route('/leaderboard')
@login_required
def leaderboard():
    # Query top 6 users with their best scores, usernames, and level progress
    top_users = db.session.query(
        UserScenarioProgress.user_id,
        func.max(UserScenarioProgress.score).label('best_score'),
        Users.username
    ).join(Users, UserScenarioProgress.user_id == Users.id) \
     .group_by(UserScenarioProgress.user_id) \
     .order_by(func.max(UserScenarioProgress.score).desc()) \
     .limit(6).all()

    # Retrieve the level progress for each user
    leaderboard_data = []
    for idx, user in enumerate(top_users):
        current_level, level_progress = calculate_level_progress(user.user_id)
        leaderboard_data.append({
            'rank': idx + 1,
            'username': user.username,
            'score': user.best_score,
            'level': current_level,
            'level_progress': level_progress
        })

    return jsonify(leaderboard_data)

#upcoming events 
@blueprint.route('/index/upcoming-events')
@login_required
def upcoming_events():
    current_time = datetime.utcnow()
    events = Event.query.filter(Event.end_utc > current_time).order_by(Event.start_utc.asc()).limit(5).all()
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


