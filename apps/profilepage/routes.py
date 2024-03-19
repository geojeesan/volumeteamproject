# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import current_user, login_required
from jinja2 import TemplateNotFound

from apps.models import (
    db,
    Event,
    Lesson,
    UserScenarioProgress,
    UserProgress,
    LessonImage,
)

from apps.config import API_GENERATOR
from apps.models import Lesson, Profile, UserScenarioProgress, SubLesson, db, Follows, User, UserActionLog  


@blueprint.route('/profilepage')
@login_required
def profilepage():
    user_id = current_user.get_id()
    user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    if not user_progress:
        UserProgress.create_new_progress(user_id=user_id)
        user_progress = UserProgress.query.filter_by(user_id=user_id).first()

    streak = user_progress.streak
    current_level = user_progress.current_level
    return render_template('profilepage/profilepage.html', segment='profilepage', API_GENERATOR=len(API_GENERATOR), streak=streak, current_level=current_level)

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
            #db.session.add(profile)
        
        #db.session.commit()

    UserActionLog.log_user_action(' username edited profile page')
    return render_template('profilepage/editprofile.html', segment='editprofile', API_GENERATOR=len(API_GENERATOR))

@blueprint.route("/completed_lessons")
@login_required
def completed_lessons():
    completed_lessons = Lesson.query.filter(
        Lesson.calculate_progress(current_user.id) == 100
    ).all()
    return render_template(
        "lessons/completed_lessons.html",
        segment="completed_lessons",
        completed_lessons=completed_lessons,
    )

@blueprint.route('/profile', methods=['GET'])
@login_required
def get_profile():
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if profile:
        return jsonify({
            'full_name': profile.full_name,
            'bio': profile.bio,
            'location': profile.location,
            'profile_picture': profile.profile_picture
        }), 200
    else:
        return jsonify({'message': 'Profile not found'}), 404

@blueprint.route('/profile', methods=['POST'])
@login_required
def update_profile():
    data = request.json
    profile = Profile.query.filter_by(user_id=current_user.id).first()
    if profile:
        # Update profile attributes if they exist in the request data
        if 'full_name' in data:
            profile.full_name = data['full_name']
        if 'bio' in data:
            profile.bio = data['bio']
        if 'location' in data:
            profile.location = data['location']
        if 'profile_picture' in data:
            profile.profile_picture = data['profile_picture']
        # Add other profile attributes as needed

        #db.session.commit()
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        # If profile doesn't exist, create a new one
        profile = Profile(
            user_id=current_user.id,
            full_name=data.get('full_name', None),
            bio=data.get('bio', None),
            location=data.get('location', None)
            # Add other profile attributes as needed
        )
        
        #db.session.add(profile)
        #db.session.commit()
        return jsonify({'message': 'Profile created successfully'}), 201

@blueprint.route('/profile/<int:user_id>')
def profile(user_id):
    user = User.query.get_or_404(user_id)
    followers = user.followers.all()
    following = user.following.all()
    return render_template('profilepage.html', user=user, followers=followers, following=following)

@blueprint.route('/follow', methods=['POST'])
def follow():
    followed_id = request.json.get('followed_id')
    follower_id = request.json.get('follower_id')
    
    if not (followed_id and follower_id):
        return jsonify({'error': 'Invalid data'}), 400
    
    new_follow = Follows(followed_id=followed_id, follower_id=follower_id)
    #db.session.add(new_follow)
    #db.session.commit()
    
    return jsonify({'message': 'User followed successfully'}), 200

@blueprint.route('/unfollow', methods=['POST'])
def unfollow():
    followed_id = request.json.get('followed_id')
    follower_id = request.json.get('follower_id')
    
    if not (followed_id and follower_id):
        return jsonify({'error': 'Invalid data'}), 400
    
    follow = Follows.query.filter_by(followed_id=followed_id, follower_id=follower_id).first()
    
    if not follow:
        return jsonify({'error': 'Follow relationship not found'}), 404
    
    #db.session.delete(follow)
    #db.session.commit()
    
    return jsonify({'message': 'User unfollowed successfully'}), 200

@blueprint.route('/search')
def search():
    query = request.args.get('query', '').strip()
    if query:
        users = User.query.filter(User.username.ilike(f'%{query}%')).all()
        return jsonify([{'id': user.id, 'username': user.username} for user in users])
    return jsonify([])


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
