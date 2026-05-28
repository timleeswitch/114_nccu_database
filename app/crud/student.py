from sqlalchemy.orm import Session

from app.models.student import Student


def get_student(db: Session, student_id: int) -> Student | None:
    return db.query(Student).filter(Student.student_id == student_id).first()
