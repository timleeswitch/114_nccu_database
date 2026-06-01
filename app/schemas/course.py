from pydantic import BaseModel
from typing import Optional

class CourseCreate(BaseModel):
    name: str
    credits: int
    category: str
    sub_category: Optional[str] = None

class CourseResponse(BaseModel):
    course_id: int
    name: str
    credits: int
    category: str
    sub_category: Optional[str] = None

    class Config:
        from_attributes = True