# -*- encoding: utf-8 -*-

from apps.home import blueprint
from apps import db
from flask import request, redirect, url_for, jsonify, flash, render_template
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from apps.models import Contact, UserActionLog, Profile
import base64

@blueprint.route('/contact')
def contact():
    if current_user.is_authenticated:
        current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
        if current_profile and current_profile.profile_picture:
            current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
        else:
            current_base64_encoded_image = None
        return render_template(
            "contact/contact.html",
            segment="contact",
            current_base64_encoded_image=current_base64_encoded_image
        )
    else:
        return render_template(
            "contact/contact-fullscreen.html",
            segment="contact",
        )

@blueprint.route('/submit_contact', methods=['POST'])
def submit_contact():
    try:
        name = request.form.get('name')
        email = request.form.get('email')
        subject = request.form.get('subject')
        message = request.form.get('message')

        contact = Contact(
            name=name,
            email=email,
            subject=subject,
            message=message
        )

        db.session.add(contact)
        db.session.commit()

        flash('Your message has been submitted successfully!', 'success')
        flash('We will get back to you as soon as possible.')
    except Exception as e:
        db.session.rollback()
        flash('Error submitting message: {}'.format(str(e)), 'error')

    return redirect(url_for('contact.contact'))

@blueprint.route('/get_contact_data')
def get_contact():
    contact_data = Contact.query.all()
    contact_list = []

    for contact in contact_data:
        contact_list.append({
            'id': contact.id,
            'name': contact.name,
            'email': contact.email,
            'subject': contact.subject,
            'message': contact.message
        })

    return jsonify({'contact': contact_list})
