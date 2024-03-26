# -*- encoding: utf-8 -*-

# Import Enum from SQLAlchemy for column definitions
from sqlalchemy import Enum as SQLEnum
from sqlalchemy import JSON, and_, case, func, event

# Import the enum module for creating enumerations in Python
import enum
from apps import db
from datetime import datetime
from flask_login import login_required, current_user
from sqlalchemy.orm import relationship
from sqlalchemy.sql.expression import func
from apps.authentication.models import Users
from flask_sqlalchemy import SQLAlchemy


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


class LessonImage(db.Model):
    __tablename__ = "lesson_images"

    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey("lessons.id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)

    # Relationship to the Lesson model
    lesson = relationship("Lesson", back_populates="images")


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.Integer, primary_key=True)
    num = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_path = db.Column(db.String(255), nullable=True)
    last_accessed = db.Column(db.DateTime, default=datetime.utcnow)
    difficulty = db.Column(SQLEnum(DifficultyLevel), nullable=False)

    images = relationship(
        "LessonImage", order_by=LessonImage.id, back_populates="lesson"
    )

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
    date = db.Column(db.DateTime)


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
    format = db.Column(db.String(50))


# # Give the new user default progress data
# @event.listens_for(Users, "after_insert")
# def create_user_progress(mapper, connection, target):
#     new_user_id = target.id
#     # Check if UserProgress entry already exists for this user
#     existing_progress = UserProgress.query.filter_by(user_id=new_user_id).first()
#     if existing_progress is None:
#         # If not, create a new entry in UserProgress with default values
#         new_user_progress = UserProgress(user_id=new_user_id)
#         db.session.add(new_user_progress)
#         db.session.commit()


class UserProgress(db.Model):
    __tablename__ = "user_progress"

    def get_lessons_in_progress(user_id):
        lessons_in_progress = (
            Lesson.query.join(SubLesson, Lesson.id == SubLesson.lesson_id)
            .outerjoin(
                UserScenarioProgress,
                and_(
                    SubLesson.id == UserScenarioProgress.scenario_id,
                    UserScenarioProgress.user_id == user_id,
                ),
            )
            .group_by(Lesson.id)
            .having(
                and_(
                    func.count(SubLesson.id)
                    > func.count(UserScenarioProgress.scenario_id),
                    func.sum(case((UserScenarioProgress.completed == True, 1), else_=0))
                    > 0,
                )
            )
            .count()
        )
        return lessons_in_progress

    def get_lessons_completed(user_id):
        lessons_completed = (
            Lesson.query.join(SubLesson, Lesson.id == SubLesson.lesson_id)
            .outerjoin(
                UserScenarioProgress,
                SubLesson.id == UserScenarioProgress.scenario_id
                and UserScenarioProgress.user_id == user_id
                and UserScenarioProgress.completed == True,
            )
            .group_by(Lesson.id)
            .having(
                func.count(SubLesson.id) == func.count(UserScenarioProgress.scenario_id)
            )
            .count()
        )

        return lessons_completed

    def calculate_level_progress(user_id):
        # Define the number of lessons required to complete each level
        lessons_per_level = 3

        # Get the number of completed lessons for each difficulty level
        completed_lessons_counts = (
            db.session.query(Lesson.difficulty, func.count(Lesson.id))
            .join(SubLesson, Lesson.id == SubLesson.lesson_id)
            .join(
                UserScenarioProgress, SubLesson.id == UserScenarioProgress.scenario_id
            )
            .filter(UserScenarioProgress.user_id == user_id)
            .filter(UserScenarioProgress.completed == True)
            .group_by(Lesson.difficulty)
            .all()
        )

        # Convert to a dictionary for easier access
        completed_lessons_dict = {
            difficulty.name: count for difficulty, count in completed_lessons_counts
        }

        # Determine the current level based on completed lessons
        current_level = "beginner"
        level_progress = 0

        # Check progress within the beginner level
        beginner_completed = completed_lessons_dict.get("beginner", 0)

        if beginner_completed < lessons_per_level:
            level_progress = round((beginner_completed / lessons_per_level) * 100, 1)
        else:
            current_level = "intermediate"
            intermediate_completed = completed_lessons_dict.get("intermediate", 0)
            if intermediate_completed < lessons_per_level:
                level_progress = round(
                    (intermediate_completed / lessons_per_level) * 100, 1
                )
            else:
                current_level = "advanced"
                advanced_completed = completed_lessons_dict.get("advanced", 0)
                if advanced_completed < lessons_per_level:
                    level_progress = round(
                        (advanced_completed / lessons_per_level) * 100, 1
                    )
                else:
                    current_level = "master"
                    level_progress = 100  # Assuming 'master' is the highest level

        return current_level, round(level_progress, 1)

    def check_streak(user_id):
        pass

    def update_progress(user_id):
        # Get lessons completed and lessons in progress
        lessons_completed = UserProgress.get_lessons_completed(user_id)
        lessons_in_progress = UserProgress.get_lessons_in_progress(user_id)

        # Calculate level progress and current level
        current_level, level_progress = UserProgress.calculate_level_progress(user_id)

        # Update user data
        user_data = UserProgress.query.filter_by(user_id=user_id).first()
        if user_data:
            user_data.lessons_completed = lessons_completed
            user_data.lessons_in_progress = lessons_in_progress
            user_data.current_level = current_level
            user_data.level_progress = level_progress
        else:
            # If user data doesn't exist, create new entry
            user_data = UserProgress(
                user_id=user_id,
                lessons_completed=lessons_completed,
                lessons_in_progress=lessons_in_progress,
                user_level=current_level,
                progress_to_next_level=level_progress,
            )
            db.session.add(user_data)

        db.session.commit()

    def create_new_progress(user_id):
        new_user_progress = UserProgress(user_id=user_id)
        db.session.add(new_user_progress)
        db.session.commit()
        UserProgress.update_progress(user_id=user_id)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"), nullable=False)
    lessons_completed = db.Column(db.Integer, default=0)
    lessons_in_progress = db.Column(db.Integer, default=0)
    streak = db.Column(db.Integer, default=0)
    current_level = db.Column(db.Text, nullable=False, default="beginner")
    level_progress = db.Column(db.Float, default=0)

class UserNotes(db.Model):
    __tablename__ = 'user_notes'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    content = db.Column(db.Text, nullable=True)

class UserActionLog(db.Model):
    __tablename__ = 'user_action_log'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    action = db.Column(db.String(256), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def log_user_action(action_description):
        if not current_user or not current_user.is_authenticated:
            return  # Optionally, handle the case where the user is not logged in

        action = UserActionLog(
            user_id=current_user.get_id(),  # Assumes current_user is the logged-in user instance
            action=action_description,
            timestamp=datetime.utcnow()  # Automatically sets the timestamp to the current time
        )
        db.session.add(action)
        db.session.commit()
    def __repr__(self):
        return f'<UserActionLog {self.user_id} {self.action} {self.timestamp}>'
    
class Profile(db.Model):
    __tablename__ = "Profile"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("Users.id"), nullable=False)
    full_name = db.Column(db.String(150), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.LargeBinary, nullable=True)
    location = db.Column(db.String(50), nullable=True)
    last_online = db.Column(db.DateTime, default=datetime.utcnow)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)

class Follows(db.Model):
    __tablename__ = 'Follows'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    followed_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
class Notifications(db.Model):
    __tablename__ = 'Notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.id'), nullable=False)
    type_ = db.Column(db.Integer, nullable=False)
    about_user = db.Column(db.Integer, db.ForeignKey('Users.id'))
    content = db.Column(db.Text, nullable=False)
    action = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Book Sample
class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(64))

class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer)
    frequency = db.Column(db.String(50))
    clarity = db.Column(db.String(50))
    issues = db.Column(db.Text)
    updates = db.Column(db.Text)
    dashboard = db.Column(db.String(50))
    breakdown = db.Column(db.String(50))
    lessons = db.Column(db.Text)
    track = db.Column(db.String(50))
    support = db.Column(db.String(50))
    life_impact = db.Column(db.String(50))
    feature_assist = db.Column(db.String(50))
    interface_design = db.Column(db.String(50))


