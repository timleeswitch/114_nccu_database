"""Re-export ORM models so callers can do ``from app.models import X``.

Also ensures every model class is loaded onto ``Base.metadata`` so Alembic's
autogenerate sees the full schema.
"""
from app.models.course import Course, CourseCategory
from app.models.enrollment import Enrollment
from app.models.graduation_rule import GraduationRule
from app.models.student import Student

__all__ = [
    "Course",
    "CourseCategory",
    "Enrollment",
    "GraduationRule",
    "Student",
]
