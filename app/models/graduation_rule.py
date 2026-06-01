"""ORM model for the ``graduation_rule`` table."""
from __future__ import annotations

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class GraduationRule(Base):
    """A declarative graduation requirement row.

    ``rule_type`` controls how ``min_credits`` / ``max_credits`` are
    interpreted by ``app.services.graduation_check``:

    * ``credit_min``   - earned credits must be ``>= min_credits``.
    * ``credit_max``   - earned credits are capped at ``max_credits``.
    * ``credit_range`` - earned credits must be within ``[min, max]``.
    * ``pass_fail``    - student must have at least one enrollment.

    Sub-category rules (e.g. 通識 sub-areas) point to a parent rule via
    ``parent_rule_id`` to indicate the shared cap.

    Attributes:
        rule_id: Stable manual primary key (matches the seed file).
        category: Top-level bucket such as ``"必修"`` or ``"通識"``.
        sub_category: Optional sub-area such as ``"中文通識"``.
        rule_type: One of the four types listed above.
        min_credits: Lower bound, when relevant.
        max_credits: Upper bound, when relevant.
        parent_rule_id: Optional self-reference for hierarchical caps.
        parent: SQLAlchemy relationship to the parent rule, if any.
    """

    __tablename__ = "graduation_rule"

    rule_id = Column(Integer, primary_key=True, autoincrement=False)
    category = Column(String(50), nullable=False, index=True)
    sub_category = Column(String(50), nullable=True, index=True)
    rule_type = Column(String(20), nullable=False)
    min_credits = Column(Integer, nullable=True)
    max_credits = Column(Integer, nullable=True)
    parent_rule_id = Column(
        Integer, ForeignKey("graduation_rule.rule_id"), nullable=True
    )

    parent = relationship(
        "GraduationRule", remote_side=[rule_id], backref="children"
    )
