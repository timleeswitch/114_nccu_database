from pydantic import BaseModel
from typing import Optional

class EnrollmentCreate(BaseModel):
    course_id: int
    semester: str

class EnrollmentResponse(BaseModel):
    enrollment_id: int
    course_id: int
    semester: str

    class Config:
        from_attributes = True

class EnrollmentDetail(BaseModel):
    enrollment_id: int
    course_id: int
    course_name: str
    credits: int
    category: str
    sub_category: Optional[str] = None
    semester: str

    class Config:
        from_attributes = True