# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

# Import Enum from SQLAlchemy for column definitions
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import JSON
# Import the enum module for creating enumerations in Python
import enum
from apps import db
from datetime import datetime

# Define an enumeration for difficulty levels using Python's built-in enum
class DifficultyLevel(enum.Enum):
    beginner = 'beginner'
    intermediate = 'intermediate'
    advanced = 'advanced'

class SubLesson(db.Model):
    __tablename__ = 'scenarios'
    
    id = db.Column(db.Integer, primary_key=True)
    scenario_name = db.Column(db.String(150), nullable=False)
    scenario_details = db.Column(db.Text, nullable=True)
    expected_sentiments = db.Column(JSON, nullable=False)  # This will store the sentiments as a JSON object
    lesson_id = db.Column(db.Integer, db.ForeignKey('lessons.id'), nullable=False)
    
    # Relationship backref, allows access from the Lesson model
    lesson = db.relationship('Lesson', backref=db.backref('scenarios', lazy=True))

    def __init__(self, scenario_name, scenario_details, expected_sentiments, lesson_id):
        self.scenario_name = scenario_name
        self.scenario_details = scenario_details
        self.expected_sentiments = expected_sentiments
        self.lesson_id = lesson_id

    def to_dict(self):
        return {
            'id': self.id,
            'scenario_name': self.scenario_name,
            'scenario_details': self.scenario_details,
            'expected_sentiments': self.expected_sentiments,
            'lesson_id': self.lesson_id
        }
        
class Lesson(db.Model):
    __tablename__ = 'lessons'

    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.Integer, primary_key=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)
    in_progress = db.Column(db.Boolean, default=False, nullable=False)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.Integer, default=0)  # 0-100 to represent percentage completion
    completed = db.Column(db.Boolean, default=False, nullable=False)
    # Use SQLEnum (imported as Enum from sqlalchemy) for the column type, specifying the Python enum for allowed values
    difficulty = db.Column(SQLEnum(DifficultyLevel), nullable=False)

    def __init__(self, title, description, image_path, difficulty, num, in_progress=False, last_accessed=None, progress=0, completed=False):
        self.lesson_num = num
        self.title = title
        self.description = description
        self.image_path = image_path
        self.in_progress = in_progress
        self.last_accessed = last_accessed if last_accessed else datetime.utcnow()
        self.progress = progress
        self.completed = completed
        # Convert string difficulty to DifficultyLevel enum if necessary
        if isinstance(difficulty, str):
            difficulty = DifficultyLevel(difficulty)
        self.difficulty = difficulty

    def to_dict(self):
        return {
            'id': self.id,
            'num': self.num,
            'title': self.title,
            'description': self.description,
            'image_path': self.image_path,
            'in_progress': self.in_progress,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'progress': self.progress,
            'completed': self.completed,
            'difficulty': self.difficulty.name  # Return the name of the Enum member
        }

    def __repr__(self):
        return f'<Lesson {self.title} | Difficulty: {self.difficulty.name}>'



# Book Sample
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64))
 