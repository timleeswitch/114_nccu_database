from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import enrollments
from app.database import Base, engine
from app.models import Course, Enrollment, GraduationRule, Student


Base.metadata.create_all(bind=engine)

app = FastAPI(title="NCCU Graduation Check API - ORM Enrollment")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enrollments.router)
