# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound



@blueprint.route("/acknowledgements")
def acknowledgements():
    if current_user.is_authenticated:
        return render_template(
            "acknowledgements/acknowledgements.html",
            segment="privacypolicy",
        )
    else:
        return render_template(
            "acknowledgements/acknowledgements-fullscreen.html",
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
