from pydantic import BaseModel
from typing import Optional, List

class GraduationRuleCreate(BaseModel):
    category: str
    sub_category: Optional[str] = None
    required_credits: int

class GraduationSummaryItem(BaseModel):
    category: str
    sub_category: Optional[str] = None
    required: int
    completed: int
    remaining: int

class GraduationCheckResponse(BaseModel):
    is_eligible: bool
    summary: List[GraduationSummaryItem]