# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from flask import request, jsonify, redirect
from apps.models import db, ApiKeys, Profile
import secrets
import base64

current_lesson = None
user_sentiments = None


@blueprint.route("/download-app/")
def downloadapp():
    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    return render_template("download-app/download-app.html", segment="download-app", current_base64_encoded_image=current_base64_encoded_image)
