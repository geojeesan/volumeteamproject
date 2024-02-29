# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from apps import db

'''
Add your models below
'''

class Lesson(db.Model):
    __tablename__ = 'lessons'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)

    def __init__(self, title, description, image_path):
        self.title = title
        self.description = description
        self.image_path = image_path

    def __repr__(self):
        return f'<Lesson {self.title}>'


# Book Sample
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64))
 