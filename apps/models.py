# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps import db
from datetime import datetime

class Lesson(db.Model):
    __tablename__ = 'lessons'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)
    in_progress = db.Column(db.Boolean, default=False, nullable=False)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.Column(db.Integer, default=0)  # 0-100 to represent percentage completion
    completed = db.Column(db.Boolean, default=False, nullable=False)  # True if the lesson is completed
    difficulty = db.Column(db.String(50), nullable=False)  # New column for difficulty level


    def __init__(self, title, description, image_path, difficulty):
        self.title = title
        self.description = description
        self.image_path = image_path
        self.difficulty = difficulty  # Include difficulty in constructor
        

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_path': self.image_path,
            'in_progress': self.in_progress,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'progress': self.progress,
            'completed': self.completed,
            'difficulty': self.difficulty  # Include difficulty in to_dict output
        }

    def __repr__(self):
        return f'<Lesson {self.title} | Difficulty: {self.difficulty}>'


# Book Sample
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64))
 