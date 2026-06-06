from fastapi import APIRouter

from app.api import auth, courses, enrollments, graduation, students

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(students.router, prefix="/students", tags=["students"])
router.include_router(courses.router, prefix="/courses", tags=["courses"])
router.include_router(enrollments.router, prefix="/enrollments", tags=["enrollments"])
router.include_router(graduation.router, prefix="/graduation", tags=["graduation"])