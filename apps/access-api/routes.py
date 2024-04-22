# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required, current_user
from flask import request, jsonify
from apps.models import db, Lesson, SubLesson, UserScenarioProgress, UserProgress, Profile
from speech_recognition import UnknownValueError
import speech_recognition as sr
import traceback
from pydub import AudioSegment
import requests
import os
import parselmouth
import numpy as np
import time
import base64

current_lesson = None
user_sentiments = None


@blueprint.route("/access-api/")
@login_required
def accessapi():

    return render_template("access-api/api.html")

