from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

class EnrollmentCreate(BaseModel):
    course_id: str
    semester: str

class EnrollmentUpdate(BaseModel):
    course_id: Optional[str] = None
    semester: Optional[str] = None

class EnrollmentResponse(BaseModel):
    enrollment_id: int
    course_id: str
    semester: str

    class Config:
        from_attributes = True

class EnrollmentDetail(BaseModel):
    enrollment_id: int
    course_id: str
    course_name: str
    credits: Decimal
    category: str
    sub_category: Optional[str] = None
    semester: str

    class Config:
        from_attributes = True
