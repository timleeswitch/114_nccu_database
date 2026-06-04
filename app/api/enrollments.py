from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.auth import get_current_student_id
from app.crud import enrollment as enrollment_crud
from app.database import get_db
from app.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentDetail,
    EnrollmentResponse,
    EnrollmentUpdate,
)

router = APIRouter()


@router.get("/", response_model=list[EnrollmentDetail])
def list_my_enrollments(
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id),
):
    return enrollment_crud.get_enrollments_by_student(db, student_id)


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    payload: EnrollmentCreate,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id),
):
    try:
        return enrollment_crud.create_enrollment(
            db,
            student_id=student_id,
            course_id=payload.course_id,
            semester=payload.semester,
        )
    except IntegrityError as e:
        error_msg = str(e.orig).lower() if e.orig else ""
        if "foreign key" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Course {payload.course_id} not found",
            )
        # unique constraint 違反：同學期重複選課
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already enrolled in this course for the semester",
        )

@router.patch("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment(
    enrollment_id: int,
    payload: EnrollmentUpdate,
    db: Session = Depends(get_db),
    student_id: int = Depends(get_current_student_id),
):
    try:
        enrollment = enrollment_crud.update_enrollment(
            db,
            enrollment_id=enrollment_id,
            student_id=student_id,
            course_id=payload.course_id,
            semester=payload.semester,
        )
    except IntegrityError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Already enrolled in this course for the semester",
        ) from e

    if enrollment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found",
        )
    return enrollment


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    student_id: str = Depends(get_current_student_id),
):
    deleted = enrollment_crud.delete_enrollment(db, enrollment_id, student_id)
    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found",
        )
