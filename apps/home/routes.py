# -*- encoding: utf-8 -*-
import random
import base64
from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from flask import jsonify
from datetime import datetime, timedelta

from apps.models import (
    db,
    Event,
    Lesson,
    UserScenarioProgress,
    UserProgress,
    LessonImage,
    UserNotes, 
    UserActionLog,
    Profile
)
from apps.authentication.models import Users
from sqlalchemy.sql.expression import func


# Helper function to calculate daily index
def get_daily_index(total_items, start_date=datetime(2024, 1, 1)):
    days_since_start = (datetime.utcnow() - start_date).days
    return days_since_start % total_items

# User Progress Endpoint
@blueprint.route("/user-progress")
@login_required
def user_progress():
    user_id = current_user.get_id()
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()
    return jsonify({
        "lessons_completed": user_progress.lessons_completed,
        "lessons_in_progress": user_progress.lessons_in_progress,
        "current_level": user_progress.current_level,
        "level_progress": user_progress.level_progress,
        "streak": user_progress.streak,
    })


# Volume persona
@blueprint.route("/user-persona")
@login_required
def user_persona():
    user_id = current_user.get_id()
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    # Integrate the user_rank logic here
    leaderboard = db.session.query(
        UserProgress.user_id,
        UserProgress.total_score.label("best_score"),
        Users.username,
    ).join(Users, UserProgress.user_id == Users.id).order_by(UserProgress.total_score.desc()).all()

    
    rank = None
    for idx, user in enumerate(leaderboard):
        if user.user_id == int(user_id):
            rank = idx + 1
            break

    persona_data = {
        "level": user_progress.current_level,
        "streak": user_progress.streak,
        "rank": rank

    }
    return jsonify(persona_data)

# Personal Notes Endpoints
@blueprint.route('/get-notes', methods=['GET'])
@login_required
def get_notes():
    user_id = current_user.get_id()
    note = UserNotes.query.filter_by(user_id=user_id).first_or_404()
    return jsonify({"content": note.content})

@blueprint.route('/save-notes', methods=['POST'])
@login_required
def save_notes():
    content = request.json.get('content', '') # Get the content from JSON
    user_id = current_user.get_id()
    note = UserNotes.query.filter_by(user_id=user_id).first()
    
    if note:
        note.content = content # Update existing note content
    else:
        db.session.add(UserNotes(user_id=user_id, content=content)) # Create a new note
    
    db.session.commit()
    UserActionLog.log_user_action('Notes saved successfully!')
    return jsonify({"message": "Notes saved successfully"})


@blueprint.route("/view-full-notes")
@login_required
def view_full_notes():
    user_id = current_user.get_id()
    note = UserNotes.query.filter_by(user_id=user_id).first_or_404()
    return render_template("home/view-full-notes.html", note_content=note.content)

# Recent Activity Endpoint
@blueprint.route("/user-actions")
@login_required
def user_actions():
    user_id = current_user.get_id()
    actions = UserActionLog.query.filter_by(user_id=user_id).order_by(UserActionLog.timestamp.desc()).limit(5).all()
    actions_data = [{"action": action.action, "timestamp": action.timestamp.strftime("%Y-%m-%d %H:%M:%S")} for action in actions]
    return jsonify(actions_data)

# Test Scores Over Time Endpoint
@blueprint.route("/test-scores")
@login_required
def test_scores():
    user_id = current_user.get_id()  # Get the ID of the currently logged-in user
    # Query the latest 6 test scores for the logged-in user
    scores_query = UserScenarioProgress.query.filter_by(user_id=user_id).order_by(UserScenarioProgress.id.desc()).limit(6).all()
    scores_query.reverse()  # Reverse the list to have the oldest test first
    scores_data = {
            "labels": [f"Test {score.id}" for score in scores_query],
            "datasets": [{
                "label": "Test Scores",
                "data": [score.score for score in scores_query],
                "fill": False,
                "borderColor": "rgb(75, 192, 192)",  # Original color
                "tension": 0.1,
            }]
        }
    return jsonify(scores_data)



# Leaderboard Endpoint
@blueprint.route("/leaderboard")
@login_required
def leaderboard():
    top_users = db.session.query(
        UserProgress.user_id,
        UserProgress.total_score.label("best_score"),
        Users.username,
    ).join(Users, UserProgress.user_id == Users.id).order_by(UserProgress.total_score.desc()).limit(10).all()

    leaderboard_data = []
    for idx, user in enumerate(top_users):
        user_progress = UserProgress.query.filter_by(user_id=user.user_id).first()
        leaderboard_data.append({
            "rank": idx + 1,
            "username": user.username,
            "score": user.best_score,
            "level": user_progress.current_level,
            "level_progress": user_progress.level_progress,
            "user_id": user.user_id  

        })

    return jsonify(leaderboard_data)


# Upcoming Events Endpoint
@blueprint.route("/index/upcoming-events")
@login_required
def upcoming_events():
    current_time = datetime.utcnow()
    events = Event.query.filter(Event.end_utc > current_time).order_by(Event.start_utc.asc()).limit(5).all()
    events_data = [{"id": event.id, "name": event.name, "description": event.description, "start_utc": event.start_utc.strftime("%Y-%m-%d %H:%M:%S"), "end_utc": event.end_utc.strftime("%Y-%m-%d %H:%M:%S")} for event in events]
    return jsonify(events_data)


# Featured Lesson Endpoint
@blueprint.route("/index")
@login_required
def index():
    if UserProgress(user_id=current_user.id):
        UserProgress.update_progress(current_user.id)
    else:
        UserProgress.create_new_progress(current_user.id)
    
    lessons = Lesson.query.all()
    lesson_index = get_daily_index(len(lessons))
    featured_lesson = lessons[lesson_index]
    featured_images = LessonImage.query.filter_by(lesson_id=featured_lesson.id).all()
    featured_image_urls = ["/static/assets/img/" + image.image_path for image in featured_images]
    
    # Check if there are any images available, otherwise use the default image
    if featured_image_urls:
        image_url = featured_image_urls[0]
    else:
        # Use the provided default image path
        image_url = "/static/assets/img/lessonsPictures/speech.png"

    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None

    return render_template("home/index.html", segment="index", featured_lesson=featured_lesson, image_url=image_url, current_base64_encoded_image=current_base64_encoded_image)

@blueprint.route("/<template>")
def route_template(template):

    try:
        if not template.endswith(".html"):
            template += ".html"

        # Detect the current page
        segment = get_segment(request)

        # Serve the file (if exists) from app/templates/home/FILE.html
        return render_template(
            "home/" + template, segment=segment
        )

    except TemplateNotFound:
        return render_template("home/page-404.html"), 404

    except:
        return render_template("home/page-500.html"), 500


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None

