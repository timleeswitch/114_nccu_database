from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel

class GraduationRuleCreate(BaseModel):
    category: str
    sub_category: Optional[str] = None
    required_credits: int

class GraduationSummaryItem(BaseModel):
    category: str
    sub_category: Optional[str] = None
    required: Decimal
    completed: Decimal
    remaining: Decimal

class GraduationCheckResponse(BaseModel):
    is_eligible: bool
    total_completed: Decimal
    total_required: Decimal
    summary: List[GraduationSummaryItem]
