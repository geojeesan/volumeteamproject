# -*- encoding: utf-8 -*-

import base64
from apps.home import blueprint
from flask import Flask, render_template, request, jsonify, Blueprint, redirect, url_for, flash
from flask_login import current_user, login_required
from jinja2 import TemplateNotFound

from PIL import Image
from io import BytesIO

from apps.models import (
    db,
    Event,
    Lesson,
    SubLesson,
    UserScenarioProgress,
    UserProgress,
    LessonImage,
    Profile,
    Follows,
    UserActionLog
)

from sqlalchemy import join, func
from apps.authentication.models import Users
import datetime

@blueprint.route('/editprofile')
@login_required
def editprofile():

    if request.method == 'POST':
        full_name = request.form.get('fullname')
        location = request.form.get('location')
        bio = request.form.get('bio')
        profile_pic = request.files.get('profilepic').read() if 'profilepic' in request.files else None
        user_id = 1  # You need to replace this with actual user id
        
        # Check if the user already has a profile
        profile = Profile.query.filter_by(user_id=user_id).first()
        if profile:
            # Update existing profile
            profile.full_name = full_name
            profile.location = location
            profile.bio = bio
            if profile_pic:
                profile.profile_picture = profile_pic
        else:
            # Create new profile
            profile = Profile(user_id=user_id, full_name=full_name, location=location, bio=bio, profile_picture=profile_pic)
            db.session.add(profile)
        
        db.session.commit()
    return render_template('profilepage/editprofile.html', segment='editprofile')

@blueprint.route('/update_profile', methods=['POST'])
def update_profile():
    user_id = current_user.get_id()
    user = Users.query.filter_by(id=user_id).first()  # Get the user object to access the username
    # if user is None:
    #     flash('User not found.')
    #     return redirect(url_for('home_blueprint.index'))
    full_name = request.form.get('full_name')
    location = request.form.get('location')
    bio = request.form.get('bio')
    
    # Get profile picture file from request
    profile_picture_file = request.files.get('profilepic')

    # Process profile picture if it exists
    if profile_picture_file:
        # Read image data
        profile_picture_data = profile_picture_file.read()

        # Open image using Pillow
        image = Image.open(BytesIO(profile_picture_data))

        # Convert image to RGB mode if it has an alpha channel (RGBA)
        if image.mode == 'RGBA':
            image = image.convert('RGB')

        # Resize and crop image to match profile pic dimensions
        image = image.resize((150, 150))
        image = image.crop((0, 0, 150, 150))  # Adjust cropping as necessary
        
        # Save image data back to BytesIO buffer
        output_buffer = BytesIO()
        image.save(output_buffer, format='JPEG')  # Save as JPEG, adjust format if needed
        profile_picture_data = output_buffer.getvalue()

    profile = Profile.query.filter_by(user_id=user_id).first()
    if profile:
        # Update existing profile
        profile.full_name = full_name
        profile.location = location
        profile.bio = bio
        if profile_picture_file:
            profile.profile_picture = profile_picture_data
    else:
        # Create new profile
        profile = Profile(
            user_id=user_id,
            full_name=full_name,
            location=location,
            bio=bio,
            profile_picture=profile_picture_data if profile_picture_file else None
        )
        db.session.add(profile)
    
    db.session.commit()
    flash('Changes Saved | You have successfully edited your profile')
    UserActionLog.log_user_action('Profile Edited')
    return redirect(url_for('profilepage.profilepage', username=user.username))


@blueprint.route('/profilepage/<string:username>', methods=['GET', 'POST'])
@login_required
def profilepage(username):
    user = Users.query.filter_by(username=username).first()
    if not user:
        return render_template("home/page-404.html"), 404
    
    user_id = user.id

    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    if not user_progress:
        UserProgress.create_new_progress(user_id=user_id)
        user_progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    is_following = Follows.query.filter_by(follower_id=current_user.get_id(), followed_id=user_id).first()

    follows = Follows.query.filter_by(follower_id=user_id).all()
    followers = Follows.query.filter_by(followed_id=user_id).all()

    # Query to get the names of people the user is following
    following_names_query = db.session.query(Users.username).\
                            join(Follows, Follows.followed_id == Users.id).\
                            filter(Follows.follower_id == user_id).\
                            all()

    # Extract the names from the query result
    following_names = [name for (name,) in following_names_query]

    # Query to get the names of people the user is following
    followers_names_query = db.session.query(Users.username).\
                            join(Follows, Follows.follower_id == Users.id).\
                            filter(Follows.followed_id == user_id).\
                            all()

    # Extract the names from the query result
    followers_names = [name for (name,) in followers_names_query]

    profile = Profile.query.filter_by(user_id=user_id).first()

    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    completed_lessons = []
    incomplete_lessons = []
    for lesson in Lesson.query.all():
        total_scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).count()
        completed_scenarios = (
            UserScenarioProgress.query.filter_by(
                user_id=user_id, scenario_id=SubLesson.id, completed=True
            )
            .join(SubLesson, SubLesson.lesson_id == lesson.id)
            .count()
        )
        scoresum = (
            UserScenarioProgress.query.with_entities(func.sum(UserScenarioProgress.score))
            .filter_by(user_id=user_id, completed=True)
            .join(SubLesson, SubLesson.id == UserScenarioProgress.scenario_id)
            .filter(SubLesson.lesson_id == lesson.id)
            .scalar() or 0 
        )
        scoreaverage = scoresum / total_scenarios if total_scenarios > 0 else 1

        if total_scenarios > 0 and total_scenarios == completed_scenarios:
            completed_lessons.append([lesson.title, lesson.image_path, scoreaverage])
        elif total_scenarios > 0 and total_scenarios > completed_scenarios > 0:
            incomplete_lessons.append(scoreaverage)
    
    completed_lessons.sort(key=lambda x: x[2], reverse=True)

    if profile and profile.profile_picture:
        base64_encoded_image = base64.b64encode(profile.profile_picture).decode('utf-8')
    else:
        base64_encoded_image = None

    if request.method == 'POST':
        search_term = request.form.get('searchTerm', '')  # Assuming search term is sent via POST
        search_results = Users.query.filter(Users.username.ilike(f"%{search_term}%")).all()

        # Format search results to send back to the frontend
        formatted_results = [{'id': user.id, 'username': user.username} for user in search_results]

        return jsonify(formatted_results)

    streak = user_progress.streak
    current_level = user_progress.current_level
    return render_template('profilepage/profilepage.html', 
                           segment='profilepage',  
                           streak=streak, 
                           current_level=current_level, 
                           user=user, 
                           profile=profile, 
                           base64_encoded_image=base64_encoded_image, 
                           is_following=is_following,
                           follows=follows,
                           followers=followers,
                           following_names=following_names,
                           followers_names=followers_names,
                           user_progress=user_progress,
                           completed_lessons=completed_lessons,
                           incomplete_lessons=incomplete_lessons)

def getUserId():
    return current_user.get_id()

@blueprint.route('/follow/<string:username>', methods=['POST'])
@login_required
def follow(username):
    # Find the user you want to follow by username
    followed_user = Users.query.filter_by(username=username).first()
    if followed_user is None:
        flash('User not found.')
        return redirect(url_for('home_blueprint.index'))  # Replace with your appropriate redirect

    # Create a new Follows entry
    follow = Follows(follower_id=current_user.id, followed_id=followed_user.id)
    db.session.add(follow)
    db.session.commit()

    flash(f'You have successfully followed @{username}')
    UserActionLog.log_user_action(f'Followed {username}')
    return redirect(url_for('profilepage.profilepage', username=username))


@blueprint.route('/unfollow/<string:username>', methods=['POST'])
@login_required
def unfollow(username):
    # Find the user you want to unfollow by username
    followed_user = Users.query.filter_by(username=username).first()
    if followed_user is None:
        flash('User not found.')
        return redirect(url_for('home_blueprint.index'))  # Replace with your appropriate redirect

    # Find the follow entry to remove
    follow = Follows.query.filter_by(follower_id=current_user.id, followed_id=followed_user.id).first()
    if follow:
        db.session.delete(follow)
        db.session.commit()
        flash(f'You have successfully unfollowed @{username}')
        UserActionLog.log_user_action(f'Unfollowed {username}')
    else:
        flash('Follow relationship not found.')

    return redirect(url_for('profilepage.profilepage', username=username))


@blueprint.route('/viewProfile/<string:username>', methods=['POST'])
def viewProfile(username):
    user = Users.query.filter_by(username=username).first()
    if user:
        user_id = user.id
        return redirect(url_for('profilepage.profilepage', user_id=user_id))
    else:
        return render_template("home/page-404.html"), 404

# @blueprint.route("/profile-user-progress")
# @login_required
# def profile_user_progress():
#     user_id = profilepage.user.user_id
#     user_progress = UserProgress.query.filter_by(user_id=user_id).first()
#     return jsonify({
#         "user_lessons_completed": user_progress.lessons_completed,
#         "user_lessons_in_progress": user_progress.lessons_in_progress,
#         "user_current_level": user_progress.current_level,
#         "user_level_progress": user_progress.level_progress,
#         "user_streak": user_progress.streak,
#     })

# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
