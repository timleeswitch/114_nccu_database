from fastapi import FastAPI

from app import models
from app.api import auth, courses, enrollments, graduation, students
from app.database import Base, engine


app = FastAPI(
    title="114 NCCU Database Project API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(courses.router)
app.include_router(enrollments.router)
app.include_router(graduation.router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "114 NCCU Database Project API"}
