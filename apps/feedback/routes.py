# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import render_template, request
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify

from apps.config import API_GENERATOR


@blueprint.route("/feedback")
def feedback():
    return render_template(
        "feedback/feedback.html", segment="feedback", API_GENERATOR=len(API_GENERATOR)
    )


def get_speech_score(num):
    return num - 10


def send_to_database(feedback):
    # Some code which sends feedback to database

    sent = False

    return sent


@blueprint.route("/send_feedback", methods=["POST"])
def send_feedback():

    requestData = request.get_json()  # Retrieve requestData from the POST request

    # Use the requestData as needed
    # For example, pass it to get_speech_score function
    feedback = requestData["feedback"]

    has_been_sent = send_to_database(feedback)

    if has_been_sent:
        return jsonify("Your feedback has been sent")
    else:
        return jsonify("Failed to send feedback")

    # to_return = f"Your feedback '{feedback}' has been submitted"

    to_return = f"Your feedback has been submitted"

    return jsonify(to_return)


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None
