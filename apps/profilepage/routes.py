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
    UserScenarioProgress,
    UserProgress,
    LessonImage,
)

from apps.config import API_GENERATOR
from apps.models import Lesson, Profile, UserScenarioProgress, SubLesson, db, Follows, UserActionLog  
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

    UserActionLog.log_user_action(' username edited profile page')
    return render_template('profilepage/editprofile.html', segment='editprofile', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/update_profile', methods=['POST'])
def update_profile():
    user_id = current_user.get_id()
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
    UserActionLog.log_user_action('Profile Edited')
    return redirect(url_for('profilepage.profilepage', user_id=current_user.get_id()))


@blueprint.route('/profilepage/<int:user_id>', methods=['GET', 'POST'])
@login_required
def profilepage(user_id):
    user = Users.query.filter_by(id=user_id).first()
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    if not user_progress:
        UserProgress.create_new_progress(user_id=user_id)
        user_progress = UserProgress.query.filter_by(user_id=user_id).first()
    
    profile = Profile.query.filter_by(user_id=user_id).first()

    if profile and profile.profile_picture:
        base64_encoded_image = base64.b64encode(profile.profile_picture).decode('utf-8')
    else:
        base64_encoded_image = None

    streak = user_progress.streak
    current_level = user_progress.current_level
    return render_template('profilepage/profilepage.html', segment='profilepage', API_GENERATOR=len(API_GENERATOR), streak=streak, current_level=current_level, user=user, profile=profile, base64_encoded_image=base64_encoded_image)


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
