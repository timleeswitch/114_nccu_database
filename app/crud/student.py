from sqlalchemy.orm import Session

from app.models.student import Student


def get_student(db: Session, student_id: int) -> Student | None:
    return db.query(Student).filter(Student.student_id == student_id).first()


def create_student(
    db: Session,
    student_id: int,
    name: str,
    hashed_password: str,
) -> Student:
    student = Student(
        student_id=student_id,
        name=name,
        hashed_password=hashed_password,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student
