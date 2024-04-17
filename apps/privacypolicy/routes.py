# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound

from apps.models import (Profile)
import base64

@blueprint.route("/privacypolicy")
def privacypolicy():
    if current_user.is_authenticated:
        current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
        if current_profile and current_profile.profile_picture:
            current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
        else:
            current_base64_encoded_image = None
        return render_template(
            "privacypolicy/privacypolicy.html",
            segment="privacypolicy",
            current_base64_encoded_image=current_base64_encoded_image,
        )
    else:
        return render_template(
            "privacypolicy/privacypolicy-fullscreen.html",
            segment="privacypolicy",
        )




# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None
