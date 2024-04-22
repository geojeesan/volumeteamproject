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


@blueprint.route("/favorites", methods=['GET', 'POST'])
@login_required
def favorites():
    if request.method == 'POST':
        resource_id = request.json['resource_id']
        resource_type = request.json['resource_type']
        # Check if the resource is currently favorited
        favorite = UserFavorite.query.filter_by(
            user_id=current_user.id,
            resource_id=resource_id,
            resource_type=resource_type
        ).first()

        if favorite:
            # Unfavorite if already favorited
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({'success': True, 'favorited': False})
        else:
            # Favorite if not already favorited
            new_favorite = UserFavorite(
                user_id=current_user.id,
                resource_id=resource_id,
                resource_type=resource_type
            )
            db.session.add(new_favorite)
            db.session.commit()
            return jsonify({'success': True, 'favorited': True})

    search_query = request.args.get('search', '').strip()
    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8') if current_profile and current_profile.profile_picture else None

    # Filter articles, videos, and expert insights based on the search query
    articles = Article.query.join(
        UserFavorite, (UserFavorite.resource_id == Article.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'articles',
             Article.name.ilike(f'%{search_query}%') | Article.description.ilike(f'%{search_query}%')).all()

    videos = Video.query.join(
        UserFavorite, (UserFavorite.resource_id == Video.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'videos',
             Video.name.ilike(f'%{search_query}%') | Video.description.ilike(f'%{search_query}%')).all()

    expert_insights = ExpertInsight.query.join(
        UserFavorite, (UserFavorite.resource_id == ExpertInsight.id) & (UserFavorite.user_id == current_user.id)
    ).filter(UserFavorite.resource_type == 'expert_insights',
             ExpertInsight.name.ilike(f'%{search_query}%') | ExpertInsight.description.ilike(f'%{search_query}%')).all()

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