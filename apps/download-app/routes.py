# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from flask import request, jsonify, redirect
from apps.models import db, ApiKeys
import secrets

current_lesson = None
user_sentiments = None


@blueprint.route("/download-app/")
def downloadapp():
    return render_template("download-app/download-app.html")
