from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

class CourseResponse(BaseModel):
    course_id: str
    name: str
    credits: Decimal
    category: str
    sub_category: Optional[str] = None

    class Config:
        from_attributes = True




