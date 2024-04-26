# -*- encoding: utf-8 -*-

from apps.home import blueprint
from flask import Flask, render_template, request, jsonify
from flask_login import login_required, current_user
from jinja2 import TemplateNotFound
from apps.models import Lesson
from sqlalchemy import desc
from apps.models import Lesson, UserScenarioProgress, SubLesson, Profile
from apps.models import UserActionLog  
import base64


@blueprint.route("/lessons")
@login_required
def lessons():
    current_profile = Profile.query.filter_by(user_id=current_user.get_id()).first()
    if current_profile and current_profile.profile_picture:
        current_base64_encoded_image = base64.b64encode(current_profile.profile_picture).decode('utf-8')
    else:
        current_base64_encoded_image = None
    return render_template(
        "lessons/lessons.html", segment="lessons", current_base64_encoded_image=current_base64_encoded_image
    )


@blueprint.route("/api/lessons", methods=["GET"])
@login_required
def get_lessons():
    lessons = Lesson.query.all()
    lessons_data = [
        {
            "id": lesson.id,
            "num": lesson.num,
            "title": lesson.title,
            "description": lesson.description,
            "image_path": lesson.image_path,
            "difficulty": lesson.difficulty.name,
            "progress": lesson.calculate_progress(
                current_user.id
            ),  # Calculate progress for the current user
        }
        for lesson in lessons
    ]
    return jsonify(lessons_data)


@blueprint.route("/api/lessons/completion", methods=["GET"])
@login_required
def get_lessons_completion():
    total_lessons = Lesson.query.count()
    user_id = current_user.id
    completed_lessons = 0

    for lesson in Lesson.query.all():
        scenarios = SubLesson.query.filter_by(lesson_id=lesson.id).order_by(SubLesson.order_in_lesson).all()
        total_scenarios = len(scenarios)
        completed_scenarios = 0
        
        for scenario in scenarios:
            if UserScenarioProgress.query.filter_by(user_id=user_id, scenario_id=scenario.id, completed=True).first():
                completed_scenarios += 1
                UserActionLog.log_user_action(
                    f"Completed scenario {scenario.order_in_lesson} in the {lesson.title} lesson"
                )
        
        if total_scenarios > 0 and total_scenarios == completed_scenarios:
            completed_lessons += 1
            UserActionLog.log_user_action(f"Completed the {lesson.title} lesson")

    completion_percentage = (
        (completed_lessons / total_lessons) * 100 if total_lessons > 0 else 0
    )
    completion_percentage = round(completion_percentage, 2)
    
    return jsonify({"completionPercentage": completion_percentage})



@blueprint.route("/api/lessons/status", methods=["GET"])
@login_required
def get_lessons_status():
    try:
        # Get all lessons accessed by the current user ordered by last accessed
        lessons = (
            Lesson.query.join(SubLesson, Lesson.id == SubLesson.lesson_id)
            .join(
                UserScenarioProgress, SubLesson.id == UserScenarioProgress.scenario_id
            )
            .filter(UserScenarioProgress.user_id == current_user.id)
            .order_by(desc(UserScenarioProgress.id))
            .all()
        )

        for lesson in lessons:
            # Determine the progress for the lesson
            progress = lesson.calculate_progress(current_user.id)

            print(lesson, progress)

            # Consider the lesson in progress if any progress is made but not 100%
            if progress > 0 and progress < 100:
                last_accessed_lesson_data = lesson.to_dict(user_id=current_user.id)
                return jsonify({"lastAccessed": last_accessed_lesson_data})

        # If no lessons are in progress, return message
        return jsonify({"lastAccessed": None, "message": "No ongoing lessons"})

    except Exception as e:
        print(e)  # For debugging purposes
        return jsonify({"error": str(e)}), 500

@blueprint.route(
    "/api/lessons/<int:lesson_id>/next_scenario_after_last_completed", methods=["GET"]
)
@login_required
def get_next_scenario_after_last_completed(lesson_id):

    # Find the highest id of a completed scenario in the given lesson
    scenario_progress = (
        UserScenarioProgress.query.join(
            SubLesson, SubLesson.id == UserScenarioProgress.scenario_id
        )
        .filter(
            UserScenarioProgress.user_id == current_user.id,
            UserScenarioProgress.completed == True,
            SubLesson.lesson_id == lesson_id,
        )
        .order_by(UserScenarioProgress.scenario_id.desc())
        .first()
    )

    if scenario_progress:
        scenario_id = scenario_progress.scenario_id
    else:
        # If no scenarios are completed, we start from the beginning
        scenario_id = 0

    # Then, we will find the scenario's order in the lesson of the user's last completed scenario
    order_in_lesson = (
        SubLesson.query.filter(SubLesson.id == scenario_id)
        .order_by(SubLesson.id)
        .first()
        .order_in_lesson
    )

    # Now, we will check whether there is a scenario in the same lesson with a higher order
    # (If none, this means it's the last scenario)
    next_scenario = (
        SubLesson.query.filter(
            SubLesson.lesson_id == lesson_id,
            SubLesson.order_in_lesson > order_in_lesson,
        )
        .order_by(SubLesson.id)
        .first()
    )

    if next_scenario:
        # Find the lesson to get its 'num' attribute
        lesson = Lesson.query.filter_by(id=lesson_id).first()
        if lesson:
            # If there's a next scenario, return its details along with lesson number
            return jsonify(
                {"scenario_id": next_scenario.order_in_lesson, "lesson_num": lesson.num}
            )
        else:
            # If lesson is not found, return an error message
            return jsonify({"message": "Lesson not found"}), 404
    else:
        # If there are no more scenarios, return an appropriate message
        return (
            jsonify(
                {"message": "No more scenarios in the lesson or lesson is complete"}
            ),
            404,
        )


# Helper - Extract current page name from request
def get_segment(request):

    try:

        segment = request.path.split("/")[-1]

        if segment == "":
            segment = "index"

        return segment

    except:
        return None
