from sqlalchemy.orm import Session

from app.models.course import Course


def get_course(db: Session, course_id: str) -> Course | None:
    return db.query(Course).filter(Course.course_id == course_id).first()
