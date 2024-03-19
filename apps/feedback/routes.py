# -*- encoding: utf-8 -*-

from apps.home import blueprint
from apps import db
from flask import render_template, request, redirect, url_for, jsonify
from flask_login import login_required
from jinja2 import TemplateNotFound
from flask import jsonify
from apps.config import API_GENERATOR
from apps.models import Feedback


@blueprint.route('/thank-you')
def thank_you():
    return render_template('feedback/thank-you.html', segment='feedback', API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/feedback')
def feedback():
    return render_template('feedback/feedback.html', segment='feedback', API_GENERATOR=len(API_GENERATOR))


@blueprint.route('/submit_feedback', methods=['POST'])
def submit_feedback():
    rating = request.form.get('rating')
    frequency = request.form.get('frequency')
    clarity = request.form.get('clarity')
    issues = request.form.get('issues')
    updates = request.form.get('updates')
    dashboard = request.form.get('dashboard')
    breakdown = request.form.get('breakdown')
    lessons = request.form.get('lessons')
    track = request.form.get('track')
    support = request.form.get('support')
    life_impact = request.form.get('life-impact')
    feature_assist = request.form.get('feature-assist')
    interface_design = request.form.get('interface-design')

    # Check if rating is not None and can be converted to an integer
    if rating is not None:
        rating = int(rating)
    else:
        # If rating is None, you can set a default value, for example:
        rating = 0
        
    feedback = Feedback(
        rating=rating,
        frequency = frequency,
        clarity = clarity,
        issues = issues,
        updates = updates,
        dashboard = dashboard,
        breakdown = breakdown,
        lessons = lessons,
        track = track,
        support = support,
        life_impact = life_impact,
        feature_assist = feature_assist,
        interface_design = interface_design
    )

    db.session.add(feedback)
    db.session.commit()

    return redirect(url_for('feedback.thank_you'))

@blueprint.route('/get_feedback_data')
def get_feedback():
    feedback_data = Feedback.query.all()
    feedback_list = []

    for feedback in feedback_data:
        feedback_list.append({
            'id': feedback.id,
            'rating': feedback.rating,
            'frequency': feedback.frequency,
            'clarity': feedback.clarity,
            'issues': feedback.issues,
            'updates': feedback.updates,
            'dashboard': feedback. dashboard,
            'breakdown': feedback.breakdown,
            'lessons': feedback.lessons,
            'track': feedback.track,
            'support': feedback.support,
            'life_impact': feedback.life_impact,
            'feature_assist': feedback.feature_assist,
            'interface_design': feedback.interface_design
        })

    return jsonify({'feedback': feedback_list})