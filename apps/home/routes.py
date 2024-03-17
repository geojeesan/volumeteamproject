# -*- encoding: utf-8 -*-

import random
from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from flask import jsonify
from datetime import datetime, timedelta

from apps.config import API_GENERATOR
from apps.models import db, Event, Lesson, UserScenarioProgress, UserProgress, LessonImage
from apps.authentication.models import Users
from sqlalchemy.sql.expression import func
from sqlalchemy import and_, case


def get_daily_index(total_items, start_date=datetime(2024, 1, 1)):
    days_since_start = (datetime.utcnow() - start_date).days
    return days_since_start % total_items


@blueprint.route('/index')
@login_required
def index():
    # Get the current day's featured lesson
    lessons = Lesson.query.all()
    lesson_index = get_daily_index(len(lessons), datetime(2024, 1, 1))
    featured_lesson = lessons[lesson_index]

    # Fetch the images for the featured lesson from lesson_images table
    featured_images = LessonImage.query.filter_by(
        lesson_id=featured_lesson.id).all()

    # Construct the full URLs for the images
    featured_image_urls = ['/static/assets/img/' +
                           image.image_path for image in featured_images]

    return render_template(
        'home/index.html',
        segment='index',
        API_GENERATOR=len(API_GENERATOR),
        featured_lesson=featured_lesson,
        # Pass the image URLs list to the template
        featured_image_urls=featured_image_urls
    )


# Test scores chart
@blueprint.route('/test-scores')
@login_required
def test_scores():
    scores_query = UserScenarioProgress.query.order_by(
        UserScenarioProgress.score.asc()).limit(6).all()

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

# 3 cards on top


@blueprint.route('/user-progress')
@login_required
def user_progress():
    user_id = current_user.get_id()

    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    if not user_progress:
        UserProgress.create_new_progress(user_id=user_id)
        user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    lessons_completed = user_progress.lessons_completed
    lessons_in_progress = user_progress.lessons_in_progress
    current_level = user_progress.current_level
    level_progress = user_progress.level_progress
    streak = user_progress.streak  # Fetch the streak from the database

    return jsonify({
        'lessons_completed': lessons_completed,
        'lessons_in_progress': lessons_in_progress,
        'current_level': current_level,
        'level_progress': level_progress,
        'streak': streak  # Include the streak in the response

    })


# leaderboard
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
        user_progress = UserProgress.query.filter_by(
            user_id=user.user_id).first()

        # We create a new progress row for the user if he doesn't have one.
        if not user_progress:
            UserProgress.create_new_progress(user_id=user.user_id)
            user_progress = UserProgress.query.filter_by(
                user_id=user.user_id).first()

        current_level = user_progress.current_level
        level_progress = user_progress.level_progress
        leaderboard_data.append({
            'rank': idx + 1,
            'username': user.username,
            'score': user.best_score,
            'level': current_level,
            'level_progress': level_progress
        })

    return jsonify(leaderboard_data)

# upcoming events


@blueprint.route('/index/upcoming-events')
@login_required
def upcoming_events():
    current_time = datetime.utcnow()
    events = Event.query.filter(Event.end_utc > current_time).order_by(
        Event.start_utc.asc()).limit(5).all()
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
