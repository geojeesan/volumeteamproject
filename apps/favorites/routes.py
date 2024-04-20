# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from apps import db
from flask_login import login_required, current_user
from flask import redirect, url_for
from datetime import datetime
from apps.models import UserActionLog
from apps.authentication.models import Users
from flask import Flask
from flask import Blueprint, jsonify, render_template
from apps.resources.routes import UserFavorite, Article, Video, ExpertInsight


@blueprint.route("/favorites")
@login_required  # Ensures that only authenticated users can access this page
def favorites():
    # Since all users accessing this are authenticated (due to @login_required), always return the template.
    return render_template("favorites/favorites.html", segment="favorites")

import logging
def favorites():
    logging.debug("Rendering the favorites page for user: %s", current_user.id)
    try:
        return render_template("favorites/favorites.html", segment="favorites")
    except Exception as e:
        logging.error("Error rendering favorites template: %s", e)
        return "An error occurred", 500


favorites_blueprint = Blueprint('favorites', __name__, template_folder='templates/favorites', url_prefix='/favorites')

# Landing page for favorites
@favorites_blueprint.route('/')
@login_required
def favorites():
    try:
        return render_template("favorites.html", segment="favorites")
    except Exception as e:
        logging.error("Error rendering favorites template: %s", e)
        return "An error occurred", 500

# Favorite Articles
@favorites_blueprint.route('/articles')
@login_required
def favorite_articles():
    try:
        articles = Article.query.join(
            UserFavorite, (UserFavorite.resource_id == Article.id) & (UserFavorite.user_id == current_user.id)
        ).filter(
            UserFavorite.resource_type == 'articles'
        ).all()

        return jsonify([article.serialize() for article in articles])
    except Exception as e:
        logging.error("Failed to fetch favorite articles: %s", e)
        return jsonify({'error': 'Failed to fetch favorite articles'}), 500

# Favorite Videos
@favorites_blueprint.route('/videos')
@login_required
def favorite_videos():
    try:
        videos = Video.query.join(
            UserFavorite, (UserFavorite.resource_id == Video.id) & (UserFavorite.user_id == current_user.id)
        ).filter(
            UserFavorite.resource_type == 'videos'
        ).all()

        return jsonify([video.serialize() for video in videos])
    except Exception as e:
        logging.error("Failed to fetch favorite videos: %s", e)
        return jsonify({'error': 'Failed to fetch favorite videos'}), 500

# Favorite Expert Insights
@favorites_blueprint.route('/expert_insights')
@login_required
def favorite_expert_insights():
    try:
        insights = ExpertInsight.query.join(
            UserFavorite, (UserFavorite.resource_id == ExpertInsight.id) & (UserFavorite.user_id == current_user.id)
        ).filter(
            UserFavorite.resource_type == 'expert_insights'
        ).all()

        return jsonify([insight.serialize() for insight in insights])
    except Exception as e:
        logging.error("Failed to fetch favorite expert insights: %s", e)
        return jsonify({'error': 'Failed to fetch favorite expert insights'}), 500



    
# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None