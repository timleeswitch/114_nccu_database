from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.enrollment import Enrollment


def create_enrollment(
    db: Session,
    student_id: int,
    course_id: str,
    semester: str,
) -> Enrollment:
    enrollment = Enrollment(
        student_id=student_id,
        course_id=course_id,
        semester=semester,
    )
    db.add(enrollment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(enrollment)
    return enrollment


def get_enrollments_by_student(db: Session, student_id: int) -> list[Enrollment]:
    return (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course))
        .filter(Enrollment.student_id == student_id)
        .order_by(Enrollment.enrollment_id)
        .all()
    )


def update_enrollment(
    db: Session,
    enrollment_id: int,
    student_id: int,
    course_id: str | None = None,
    semester: str | None = None,
) -> Enrollment | None:
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.enrollment_id == enrollment_id,
            Enrollment.student_id == student_id,
        )
        .first()
    )
    if enrollment is None:
        return None

    if course_id is not None:
        enrollment.course_id = course_id
    if semester is not None:
        enrollment.semester = semester

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(enrollment)
    return enrollment


def delete_enrollment(
    db: Session,
    enrollment_id: int,
    student_id: int,
) -> Enrollment | None:
    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.enrollment_id == enrollment_id,
            Enrollment.student_id == student_id,
        )
        .first()
    )
    if enrollment is None:
        return None

    db.delete(enrollment)
    db.commit()
    return enrollment
