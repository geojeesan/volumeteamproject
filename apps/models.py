# -*- encoding: utf-8 -*-

# Import Enum from SQLAlchemy for column definitions
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import JSON

# Import the enum module for creating enumerations in Python
import enum
from apps import db
from datetime import datetime
from flask_login import login_required, current_user
from sqlalchemy.orm import relationship

# Define an enumeration for difficulty levels using Python's built-in enum
class DifficultyLevel(enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class SubLesson(db.Model):
    __tablename__ = "scenarios"

    id = db.Column(db.Integer, primary_key=True)
    scenario_name = db.Column(db.String(150), nullable=False)
    scenario_details = db.Column(db.Text, nullable=True)
    expected_sentiments = db.Column(
        JSON, nullable=False
    )  # This will store the sentiments as a JSON object
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    order_in_lesson = db.Column(db.Integer, nullable=True)

    # Relationship backref, allows access from the Lesson model
    lesson = db.relationship("Lesson", backref=db.backref("scenarios", lazy=True))

    def __init__(
        self,
        scenario_name,
        scenario_details,
        expected_sentiments,
        lesson_id,
        order_in_lesson,
    ):
        self.scenario_name = scenario_name
        self.scenario_details = scenario_details
        self.expected_sentiments = expected_sentiments
        self.lesson_id = lesson_id
        self.order_in_lesson = order_in_lesson

    def to_dict(self):
        return {
            "id": self.id,
            "scenario_name": self.scenario_name,
            "scenario_details": self.scenario_details,
            "expected_sentiments": self.expected_sentiments,
            "lesson_id": self.lesson_id,
            "order_in_lesson": self.order_in_lesson,
        }


class DifficultyLevel(enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    difficulty = db.Column(SQLEnum(DifficultyLevel), nullable=False)

    def __init__(
        self, title, description, image_path, difficulty, num, last_accessed=None
    ):
        self.num = num
        self.title = title
        self.description = description
        self.image_path = image_path
        self.last_accessed = last_accessed if last_accessed else datetime.utcnow()
        if isinstance(difficulty, str):
            difficulty = DifficultyLevel(difficulty)
        self.difficulty = difficulty

    def calculate_progress(self, user_id):
        # Ensure there's at least one scenario to avoid division by zero
        total_scenarios = len(self.scenarios)
        if total_scenarios == 0:
            return 0

        # Query the database for the count of completed scenarios for this lesson and user
        completed_scenarios = (
            UserScenarioProgress.query.filter_by(user_id=user_id, completed=True)
            .join(SubLesson, SubLesson.id == UserScenarioProgress.scenario_id)
            .filter(SubLesson.lesson_id == self.id)
            .count()
        )

        progress_percentage = (completed_scenarios / total_scenarios) * 100
        return progress_percentage

    def to_dict(self, user_id=None):
        progress = self.calculate_progress(user_id) if user_id else None
        return {
            "id": self.id,
            "num": self.num,
            "title": self.title,
            "description": self.description,
            "image_path": self.image_path,
            "last_accessed": self.last_accessed,
            "progress": progress,  # Use the calculated progress
            "difficulty": self.difficulty.name,
        }

    def __repr__(self):
        return f"<Lesson {self.title} | Difficulty: {self.difficulty.name}>"


class UserScenarioProgress(db.Model):
    __tablename__ = "user_scenario_progress"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"), nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey("scenarios.id"), nullable=False)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    score = db.Column(db.Float, nullable=True)  # Store the scenario score here

    user = relationship("Users", backref="scenario_progress")
    scenario = relationship("SubLesson", backref="user_progress")


# Event database
class Event(db.Model):
    __tablename__ = "events"

    id = db.Column(db.String(150), primary_key=True)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_utc = db.Column(db.DateTime, nullable=False)
    end_utc = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    online_event = db.Column(db.Boolean, default=False, nullable=False)
    format = db.Column(
        db.String(50)
    )  # Changed to a simple string column without ForeignKey


# Book Sample
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64))
