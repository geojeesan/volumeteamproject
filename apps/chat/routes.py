# -*- encoding: utf-8 -*-

import base64
import chunk
from apps.home import blueprint
from flask import Flask, Response, render_template, request, jsonify, Blueprint, redirect, url_for, flash
from flask_login import current_user, login_required
from jinja2 import TemplateNotFound
import json

from PIL import Image
from io import BytesIO

import ollama

from apps.models import (
    db,
    Event,
    Lesson,
    SubLesson,
    UserScenarioProgress,
    UserProgress,
    LessonImage,
    Profile,
    Follows,
    UserActionLog
)

from sqlalchemy import join, func
from apps.authentication.models import Users
import datetime

@blueprint.route("/chat")
@login_required
def chat():
    return render_template(
        "chat/chat.html",
        segment="chat",
    )

@blueprint.route('/send_chat_query', methods=['POST'])
@login_required
def send_chat_query():
    query = request.form.get('query')
    if query is None or query == "" or query.isspace():
        flash("I am Volume Bot. I can help you enhance your public speaking skills. Feel free to ask me anything about public speaking.")
        return redirect(url_for('chat.chat'))

    try:
        # Send chat query using the example model
        response = ollama.chat(model='volumeBot', messages=[
            {
                'role': 'user',
                'content': query,
            },
        ])
        flash(response['message']['content'])
    except ollama._types.ResponseError as e:
        flash(f"Error in chat: {e}")
    
    return redirect(url_for('chat.chat'))


def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None
