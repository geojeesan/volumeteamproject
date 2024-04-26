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


@blueprint.route("/access-api/")
def accessapi():
    if current_user.is_authenticated:
        current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
        if current_profile and current_profile.profile_picture:
            current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
        else:
            current_base64_encoded_image = None
        user_id = current_user.id
    
        # Check if the user has an API key
        api_key = ApiKeys.query.filter_by(user_id=user_id).first()
    
        return render_template("access-api/api.html", api_key=api_key, current_base64_encoded_image=current_base64_encoded_image)
    
    else:
        return render_template("access-api/api.html")

def generate_api_key():
    return secrets.token_hex(16)

@blueprint.route("/register-api/")
def register_api():
    # Assuming you have access to the current user's ID
    user_id = current_user.id  # Replace with your actual method to get user ID
    
    # Check if the user already has an API key
    existing_api_key = ApiKeys.query.filter_by(user_id=user_id).first()
    
    if existing_api_key:
        # User already has an API key, no need to register a new one
        return redirect('/access-api') # Redirect to dashboard or any other page
        
    # Generate a new API key
    new_api_key = generate_api_key()  # Replace with your actual method to generate API keys
    
    # Create a new ApiKeys record for the user
    api_key_entry = ApiKeys(api_key=new_api_key, user_id=user_id)
    
    # Add the new ApiKeys record to the database session and commit
    db.session.add(api_key_entry)
    db.session.commit()
    
    # Redirect to the dashboard or any other page
    return redirect('/access-api')

@blueprint.route("/delete-api/")
def delete_api_keys():
    try:
        # Query all API keys associated with the user ID
        api_keys = ApiKeys.query.filter_by(user_id=current_user.id).all()
        
        # Delete each API key
        for api_key in api_keys:
            db.session.delete(api_key)
        
        # Commit the changes
        db.session.commit()
        
        return True  # Return True to indicate successful deletion
    except Exception as e:
        # If an error occurs during deletion, rollback the session and return False
        db.session.rollback()
        print(f"Error deleting API keys: {str(e)}")
        return False