from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class GraduationRule(Base):
    __tablename__ = "graduation_rules"

    rule_id = Column(Integer, primary_key=True, autoincrement=True)
    category = Column(String(50), nullable=False)
    sub_category = Column(String(50), nullable=True)
    rule_type = Column(String(20), nullable=False)
    min_credits = Column(Integer, nullable=True)
    max_credits = Column(Integer, nullable=True)
    parent_rule_id = Column(
        Integer,
        ForeignKey("graduation_rules.rule_id"),
        nullable=True,
        index=True,
    )

    parent_rule = relationship(
        "GraduationRule",
        remote_side=[rule_id],
        back_populates="child_rules",
    )
    child_rules = relationship("GraduationRule", back_populates="parent_rule")
