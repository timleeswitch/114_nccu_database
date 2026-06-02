from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class CourseResponse(BaseModel):
    course_id: str
    name: str
    credits: Decimal
    category: str
    sub_category: Optional[str] = None

    class Config:
        from_attributes = True