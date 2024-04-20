# -- encoding: utf-8 --

from apps.home import blueprint
from flask import render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from apps import db
from flask_login import login_required, current_user
from flask import redirect, url_for
from datetime import datetime
from apps.models import UserActionLog, Profile
from apps.authentication.models import Users
from flask import Flask
from flask import Blueprint, jsonify, render_template
from apps.resources.routes import UserFavorite, Article, Video, ExpertInsight
import base64


@blueprint.route("/favorites")
@login_required  # Ensures that only authenticated users can access this page
def favorites():
    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    
    # Fetch articles, videos, and expert insights that the user has favorited
    articles = Article.query.join(
        UserFavorite, (UserFavorite.resource_id == Article.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'articles').all()

    videos = Video.query.join(
        UserFavorite, (UserFavorite.resource_id == Video.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'videos').all()

    expert_insights = ExpertInsight.query.join(
        UserFavorite, (UserFavorite.resource_id == ExpertInsight.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'expert_insights').all()

    return render_template('favorites/favorites.html', 
                           segment='favorites',
                           current_base64_encoded_image=current_base64_encoded_image,
                           articles=articles,
                           videos=videos,
                           expert_insights=expert_insights)



    
# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None