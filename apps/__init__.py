# -*- encoding: utf-8 -*-

import os

from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from importlib import import_module
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
login_manager = LoginManager()

# Initialize Flask-Migrate
migrate = Migrate()


def register_extensions(app):
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)


def register_blueprints(app):
    for module_name in (
        "authentication",
        "home",
        "practice",
        "lessons",
        "feedback",
        "favorites",
        "resources",
        "profilepage",
        "privacypolicy",
        "acknowledgements",
        "contact",
        "access-api",
        "download-app"
    ):
        module = import_module("apps.{}.routes".format(module_name))
        app.register_blueprint(module.blueprint, name=module_name)


def configure_database(app):

    @app.before_first_request
    def initialize_database():
        """Create all tables before the first request if they don't exist."""
        try:
            db.create_all()
        except Exception as e:

            print("> Error: DBMS Exception: " + str(e))

            # Fallback to SQLite if there is an exception
            basedir = os.path.abspath(os.path.dirname(__file__))
            app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI = (
                "sqlite:///" + os.path.join(basedir, "db.sqlite3")
            )

            print("> Fallback to SQLite ")
            db.create_all()

    @app.teardown_request
    def shutdown_session(exception=None):
        """Remove the database session after each request."""
        db.session.remove()


from apps.authentication.oauth import github_blueprint


def create_app(config):
    """Application factory to create Flask app instances with given configs."""
    app = Flask(__name__)
    
    # Allow analyze_speech from any origin
    CORS(app)

    
    app.config.from_object(config)
    register_extensions(app)
    register_blueprints(app)
    configure_database(app)
    return app
