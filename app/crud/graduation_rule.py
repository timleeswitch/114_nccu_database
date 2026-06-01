from sqlalchemy.orm import Session

from app.models.graduation_rule import GraduationRule


def get_graduation_rule(db: Session, rule_id: int) -> GraduationRule | None:
    return db.query(GraduationRule).filter(GraduationRule.rule_id == rule_id).first()


def get_graduation_rules(
    db: Session,
    category: str | None = None,
    sub_category: str | None = None,
    rule_type: str | None = None,
) -> list[GraduationRule]:
    query = db.query(GraduationRule)
    if category is not None:
        query = query.filter(GraduationRule.category == category)
    if sub_category is not None:
        query = query.filter(GraduationRule.sub_category == sub_category)
    if rule_type is not None:
        query = query.filter(GraduationRule.rule_type == rule_type)
    return query.order_by(GraduationRule.rule_id).all()
