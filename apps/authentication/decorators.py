from datetime import datetime
from functools import wraps
import base64

import jwt
from flask import request, current_app

from apps.authentication.models import Users
from apps.models import Profile


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        if "Authorization" in request.headers:
            token = request.headers["Authorization"]
        else:
            return {"message": "Token is missing", "data": None, "success": False}, 403
        try:
            data = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )
            current_user = Users.query.filter_by(id=data["user_id"]).first()

            if current_user is None:
                return {"message": "Invalid token", "data": None, "success": False}, 403
            now = int(datetime.utcnow().timestamp())
            init_date = data["init_date"]

            # current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()

            # if current_profile and current_profile.profile_picture:
            #     current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
            # else:
            #     current_base64_encoded_image = None

            # if now - init_date > 24 * 3600:  # expire token after 24 hours
            #    return {
            #               'message': 'Expired token',
            #               'data': None,
            #               'success': False
            #           }, 403

        except Exception as e:
            return {"message": str(e), "data": None, "success": False}, 500
        return func(*args, **kwargs)

    return decorated
