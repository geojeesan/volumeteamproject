# -*- encoding: utf-8 -*-

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
import base64

@blueprint.route('/resources')
def resources():
    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    
    return render_template('resources/resource.html', segment='resources', current_base64_encoded_image=current_base64_encoded_image)

@blueprint.route('/api/articles')
def get_articles():
    if current_user.is_authenticated:
        content_level = request.args.get('content_level')
        user_id = current_user.id  # Get the current logged-in user's ID

        articles = Article.query.filter(Article.content_level == content_level) if content_level else Article.query.all()
        articles = articles.outerjoin(UserFavorite, (UserFavorite.resource_id == Article.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'articles')).add_columns(UserFavorite.id.label('favorited'))

        articles_list = [
            {
                'id': article.Article.id,
                'name': article.Article.name,
                'link': article.Article.link,
                'content_level': article.Article.content_level,
                'click_count': article.Article.click_count,
                'image_url': article.Article.image_url,
                'time_to_completion': article.Article.time_to_complete,
                'description': article.Article.description,
                'favorite_count': article.Article.favorite_count,
                'is_favorited': article.favorited is not None
            }
            for article in articles
        ]
    else:
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
            }
            for article in articles
        ]
    return jsonify(articles_list)

@blueprint.route('/api/videos')
def get_videos():
    if current_user.is_authenticated:
        content_level = request.args.get('content_level')
        user_id = current_user.id

        videos = Video.query.filter(Video.content_level == content_level) if content_level else Video.query.all()
        videos = videos.outerjoin(UserFavorite, (UserFavorite.resource_id == Video.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'videos')).add_columns(UserFavorite.id.label('favorited'))

        videos_list = [
            {
                'id': video.Video.id,
                'name': video.Video.name,
                'link': video.Video.link,
                'content_level': video.Video.content_level,
                'click_count': video.Video.click_count,
                'image_url': video.Video.image_url,
                'time_to_completion': video.Video.time_to_complete,
                'description': video.Video.description,
                'favorite_count': video.Video.favorite_count,
                'is_favorited': video.favorited is not None
            }
            for video in videos
        ]
    else:
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
            }
            for video in videos
        ]
    return jsonify(videos_list)

@blueprint.route('/api/expert_insights')
def get_expert_insights():
    if current_user.is_authenticated:
        content_type = request.args.get('content_type')
        user_id = current_user.id

        expert_insights = ExpertInsight.query.filter(ExpertInsight.content_type == content_type) if content_type else ExpertInsight.query.all()
        expert_insights = expert_insights.outerjoin(UserFavorite, (UserFavorite.resource_id == ExpertInsight.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'expert_insights')).add_columns(UserFavorite.id.label('favorited'))

        expert_insights_list = [
            {
                'id': insight.ExpertInsight.id,
                'name': insight.ExpertInsight.name,
                'link': insight.ExpertInsight.link,
                'content_type': insight.ExpertInsight.content_type,
                'click_count': insight.ExpertInsight.click_count,
                'image_url': insight.ExpertInsight.image_url,
                'time_to_completion': insight.ExpertInsight.time_to_complete,
                'description': insight.ExpertInsight.description,
                'favorite_count': insight.ExpertInsight.favorite_count,
                'is_favorited': insight.favorited is not None
            }
            for insight in expert_insights
        ]
    else:
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
            }
            for insight in expert_insights
        ]
    return jsonify(expert_insights_list)

@blueprint.route('/articles/all')
@login_required
def all_articles():
    user_id = current_user.id  # Get the current logged-in user's ID
    articles = Article.query.outerjoin(UserFavorite, (UserFavorite.resource_id == Article.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'articles')).add_columns(UserFavorite.id.label('favorited'))

    articles_data = [{
        'id': article.Article.id,
        'name': article.Article.name,
        'link': article.Article.link,
        'content_level': article.Article.content_level,
        'click_count': article.Article.click_count,
        'image_url': article.Article.image_url,
        'time_to_completion': article.Article.time_to_complete,
        'description': article.Article.description,
        'favorite_count': article.Article.favorite_count,
        'is_favorited': article.favorited is not None
    } for article in articles]

    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    UserActionLog.log_user_action('Viewed Articles')
    return render_template('resources/articles_all.html', articles=articles_data, segment='articles_all', current_base64_encoded_image=current_base64_encoded_image)

@blueprint.route('/videos/all')
@login_required
def all_videos():
    user_id = current_user.id
    videos = Video.query.outerjoin(UserFavorite, (UserFavorite.resource_id == Video.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'videos')).add_columns(UserFavorite.id.label('favorited'))

    videos_data = [{
        'id': video.Video.id,
        'name': video.Video.name,
        'link': video.Video.link,
        'content_level': video.Video.content_level,
        'click_count': video.Video.click_count,
        'image_url': video.Video.image_url,
        'time_to_completion': video.Video.time_to_complete,
        'description': video.Video.description,
        'favorite_count': video.Video.favorite_count,
        'is_favorited': video.favorited is not None
    } for video in videos]

    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    UserActionLog.log_user_action('Viewed Videos')
    return render_template('resources/videos_all.html', videos=videos_data, segment='videos_all', current_base64_encoded_image=current_base64_encoded_image)

@blueprint.route('/expert/all')
@login_required
def all_expert_insights():
    user_id = current_user.id
    expert_insights = ExpertInsight.query.outerjoin(UserFavorite, (UserFavorite.resource_id == ExpertInsight.id) & (UserFavorite.user_id == user_id) & (UserFavorite.resource_type == 'expert_insights')).add_columns(UserFavorite.id.label('favorited'))

    expert_insights_data = [{
    'id': insight.ExpertInsight.id,
    'name': insight.ExpertInsight.name,
    'link': insight.ExpertInsight.link,
    'content_type': insight.ExpertInsight.content_type,
    'click_count': insight.ExpertInsight.click_count,
    'image_url': insight.ExpertInsight.image_url,
    'time_to_completion': insight.ExpertInsight.time_to_complete,
    'description': insight.ExpertInsight.description,
    'favorite_count': insight.ExpertInsight.favorite_count,
    'is_favorited': insight.favorited is not None
    } for insight in expert_insights]

    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    UserActionLog.log_user_action('Viewed Expert Insights')
    return render_template('resources/expert_insights_all.html', expert_insights=expert_insights_data, segment='expert_insights_all', current_base64_encoded_image=current_base64_encoded_image)

#----------------------------------------------------------------------------------------------------------------------
# Function to toggle favorite

@blueprint.route('/api/toggle_favorite/<int:resource_id>', methods=['POST'])
@login_required
def toggle_favorite(resource_id):
    resource_type = request.json.get('resource_type')

    # Map resource type to model
    model_map = {
        'articles': Article,
        'videos': Video,
        'expert_insights': ExpertInsight
    }
    resource_model = model_map.get(resource_type)

    if not resource_model:
        return jsonify({'error': 'Invalid resource type'}), 400

    # Find the specific resource
    resource = resource_model.query.filter_by(id=resource_id).first()
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404

    # Check if user has already favorited this resource
    favorite = UserFavorite.query.filter_by(
        user_id=current_user.id,
        resource_id=resource_id,
        resource_type=resource_type
    ).first()

    if favorite:
        # User is unfavoriting the resource
        db.session.delete(favorite)
        resource.favorite_count = resource.favorite_count - 1 if resource.favorite_count > 0 else 0
        UserActionLog.log_user_action('Unfavorited a Resource')
    else:
        # User is favoriting the resource
        new_favorite = UserFavorite(
            user_id=current_user.id,
            resource_id=resource_id,
            resource_type=resource_type
        )
        db.session.add(new_favorite)
        resource.favorite_count += 1
        UserActionLog.log_user_action('Favorited a Resource')


    db.session.commit()

    return jsonify({
        'success': True,
        'favorite_count': resource.favorite_count,
        'is_favorited': not favorite
    })

#----------------------------------------------------------------------------------------------------------------------
# Function to log user action on clicking any link

@blueprint.route('/log_action', methods=['POST'])
def log_user_action():
    description = request.json.get('action', 'Viewed a Resource')
    UserActionLog.log_user_action('Viewed a Resource', user_id=current_user.get_id())
    return jsonify({'message': 'Action logged successfully', 'success': True})

#----------------------------------------------------------------------------------------------------------------------
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

@blueprint.route('/api/isAuthenticated')
def isAuthenticated():
    return jsonify({'isAuthenticated': current_user.is_authenticated})