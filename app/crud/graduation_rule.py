from sqlalchemy.orm import Session

from app.models.graduation_rule import GraduationRule


def get_graduation_rules(db: Session) -> list[GraduationRule]:
    return db.query(GraduationRule).order_by(GraduationRule.rule_id).all()
