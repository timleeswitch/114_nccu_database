from sqlalchemy.orm import Session

from app.models.course import Course


def get_course(db: Session, course_id: str) -> Course | None:
    return db.query(Course).filter(Course.course_id == course_id).first()


def get_courses(db: Session, category: str | None = None) -> list[Course]:
    query = db.query(Course)
    if category is not None:
        query = query.filter(Course.category == category)
    return query.order_by(Course.course_id).all()
