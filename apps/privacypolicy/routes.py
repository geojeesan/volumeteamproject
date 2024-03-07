# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound

from apps.config import API_GENERATOR

@blueprint.route('/privacypolicy')
def privacypolicy():
    return render_template('privacypolicy/privacypolicy.html', segment='privacypolicy', API_GENERATOR=len(API_GENERATOR))

# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split('/')[-1]

        if segment == '':
            segment = 'index'

        return segment

    except:
        return None
