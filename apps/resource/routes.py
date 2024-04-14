# -*- encoding: utf-8 -*-

from apps.home import blueprint
from apps.config import API_GENERATOR
from flask import render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import CheckConstraint
from apps import db
from flask_login import login_required, current_user
from flask import redirect, url_for
from datetime import datetime
from apps.models import UserActionLog
from apps.authentication.models import Users


@blueprint.route('/resource')
@login_required
def resource():
    UserActionLog.log_user_action(f'Viewed Resources')  # Logging action
    return render_template('resource/resource.html', segment='resource', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/api/articles')
@login_required
def get_articles():
    content_level = request.args.get('content_level')
    articles = Article.query.filter(Article.content_level == content_level) if content_level else Article.query.all()
    articles_list = [
        {
            'id': article.id, 
            'name': article.name, 
            'link': article.link, 
            'content_level': article.content_level,
            'click_count': article.click_count,
            'image_url': article.image_url,
            'time_to_completion': article.time_to_complete,
            'description': article.description,
            'favorite_count': article.favorite_count 
        } 
        for article in articles
    ]
    return jsonify(articles_list)

@blueprint.route('/api/videos')
@login_required
def get_videos():
    content_level = request.args.get('content_level')
    videos = Video.query.filter(Video.content_level == content_level) if content_level else Video.query.all()
    videos_list = [
        {
            'id': video.id, 
            'name': video.name, 
            'link': video.link, 
            'content_level': video.content_level,
            'click_count': video.click_count,
            'image_url': video.image_url,
            'time_to_completion': video.time_to_complete, 
            'description': video.description,
            'favorite_count': video.favorite_count 
        } 
        for video in videos
    ]
    return jsonify(videos_list)


@blueprint.route('/api/expert_insights')
@login_required
def get_expert_insights():
    content_type = request.args.get('content_type')
    expert_insights = ExpertInsight.query.filter(ExpertInsight.content_type == content_type) if content_type else ExpertInsight.query.all()
    expert_insights_list = [
        {
            'id': insight.id, 
            'name': insight.name, 
            'link': insight.link, 
            'content_type': insight.content_type,
            'click_count': insight.click_count,
            'image_url': insight.image_url,
            'time_to_completion': insight.time_to_complete,
            'description': insight.description,
            'favorite_count': insight.favorite_count
        } 
        for insight in expert_insights
    ]
    return jsonify(expert_insights_list)

@blueprint.route('/articles/all')
@login_required
def all_articles():
    articles = Article.query.all() 
    return render_template('resource/articles_all.html', articles=articles, segment='articles_all', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/videos/all')
@login_required
def all_videos():
    videos = Video.query.all()
    return render_template('resource/videos_all.html', videos=videos, segment='videos_all', API_GENERATOR=len(API_GENERATOR))

@blueprint.route('/expert/all')
@login_required
def all_expert_insights():
    expert_insights = ExpertInsight.query.all() 
    return render_template('resource/expert_insights_all.html', expert_insights=expert_insights, segment='expert_insights_all', API_GENERATOR=len(API_GENERATOR))

#----------------------------------------------------------------------------------------------------------------------
# Function to increment click count

@blueprint.route('/increment_click/<string:resource_type>/<int:item_id>', methods=['POST'])
@login_required
def increment_click(resource_type, item_id):
    model_map = {'articles': Article, 'videos': Video, 'expert_insights': ExpertInsight}
    model = model_map.get(resource_type)

    if not model:
        return jsonify({'error': 'Invalid resource type'}), 400

    item = model.query.filter_by(id=itemId).first()
    if item is None:
        return jsonify({'error': 'Item not found'}), 404

    item.click_count += 1
    db.session.commit()
    # UserActionLog.log_user_action(f'User {current_user.get_id()} clicked on {resource_type} ID {item_id}')  # Logging action
    return jsonify({'success': True, 'new_click_count': item.click_count})


# Function to update featured items
@blueprint.route('/api/featured')
@login_required
def get_featured_items():
    # Fetch top 2 most-clicked articles
    top_articles = Article.query.order_by(Article.click_count.desc()).limit(2).all()

    # Fetch top 2 most-clicked videos
    top_videos = Video.query.order_by(Video.click_count.desc()).limit(2).all()

    # Fetch top 2 most-clicked expert insights
    top_expert_insights = ExpertInsight.query.order_by(ExpertInsight.click_count.desc()).limit(2).all()

    # Combine and serialize the data to send as a response
    featured_items = {
        'articles': [{'id': a.id, 'name': a.name, 'link': a.link, 'click_count': a.click_count} for a in top_articles],
        'videos': [{'id': v.id, 'name': v.name, 'link': v.link, 'click_count': v.click_count} for v in top_videos],
        'expert_insights': [{'id': ei.id, 'name': ei.name, 'link': ei.link, 'click_count': ei.click_count} for ei in top_expert_insights]
    }

    return jsonify(featured_items)


# ----------------------------------------------------------------------------------------------------------------------
# Resource Page models

class Article(db.Model):
    __tablename__ = 'articles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    link = db.Column(db.String(512), nullable=False)
    content_level = db.Column(db.String(50))
    click_count = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(512), nullable=False)  # New column for image URL
    time_to_complete = db.Column(db.String(50), nullable=False)  # New column for duration
    description = db.Column(db.Text, nullable=True)  # New column for description
    favorite_count = db.Column(db.Integer, default=0)  # New column for favorite count
    __table_args__ = (CheckConstraint("content_level IN ('beginner', 'intermediate', 'advanced')"),)

    def __init__(self, name, link, content_level, image_url, time_to_complete, description, click_count=0):
        self.name = name
        self.link = link
        self.content_level = content_level
        self.click_count = click_count
        self.image_url = image_url
        self.time_to_complete = time_to_complete
        self.description = description

class Video(db.Model):
    __tablename__ = 'videos'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    link = db.Column(db.String(512), nullable=False)
    content_level = db.Column(db.String(50), nullable=False)
    click_count = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(512), nullable=False)  # New column for image URL
    time_to_complete = db.Column(db.String(50), nullable=False)  # New column for duration
    description = db.Column(db.Text, nullable=True)  # New column for description
    favorite_count = db.Column(db.Integer, default=0)  # New column for favorite count
    __table_args__ = (CheckConstraint("content_level IN ('beginner', 'intermediate', 'advanced')"),)

    def __init__(self, name, link, content_level, image_url, time_to_complete, description, click_count=0):
        self.name = name
        self.link = link
        self.content_level = content_level
        self.click_count = click_count
        self.image_url = image_url
        self.time_to_complete = time_to_complete
        self.description = description

class ExpertInsight(db.Model):
    __tablename__ = 'expert_insights'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(256), nullable=False)
    link = db.Column(db.String(512), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)
    click_count = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(512), nullable=False)  # New column for image URL
    time_to_complete = db.Column(db.String(50), nullable=False)  # New column for duration
    description = db.Column(db.Text, nullable=True)  # New column for description
    favorite_count = db.Column(db.Integer, default=0)  # New column for favorite count
    __table_args__ = (CheckConstraint("content_type IN ('article', 'video')"),)

    def __init__(self, name, link, content_type, image_url, time_to_complete, description, click_count=0):
        self.name = name
        self.link = link
        self.content_type = content_type
        self.click_count = click_count
        self.image_url = image_url
        self.time_to_complete = time_to_complete
        self.description = description

class UserFavorite(db.Model):
    __tablename__ = 'user_favorites'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    resource_id = db.Column(db.Integer, nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)
    __table_args__ = (CheckConstraint("resource_type IN ('articles', 'videos', 'expert_insights')"),)

    def __init__(self, user_id, resource_id, resource_type):
        self.user_id = user_id
        self.resource_id = resource_id
        self.resource_type = resource_type
# ----------------------------------------------------------------------------------------------------------------------


