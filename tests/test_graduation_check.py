"""Pytest cases for ``app.services.graduation_check.check_graduation``.

Each test exercises exactly one rule or edge case so a failure tells you
immediately which behavior regressed. Fixtures live in ``conftest.py``.
"""
from __future__ import annotations

from decimal import Decimal

from sqlalchemy.orm import Session

from app.services.graduation_check import check_graduation


# ====== local helpers (multi-line course setups) ======


def _enroll_full_required(make_course, enroll, student) -> None:
    """Enroll the student in 13 x 3-credit 必修 courses (= 39 credits)."""
    for _ in range(13):
        enroll(student, make_course("必修", credits=3.0))


def _enroll_full_groups(make_course, enroll, student) -> None:
    """Enroll in 2A + 1B + 1C 群修 courses to satisfy rules 2-4."""
    enroll(student, make_course("群修", "A", 3.0))
    enroll(student, make_course("群修", "A", 3.0))
    enroll(student, make_course("群修", "B", 3.0))
    enroll(student, make_course("群修", "C", 3.0))


def _enroll_full_electives(make_course, enroll, student, count: int = 15) -> None:
    """Enroll in ``count`` x 3-credit 選修 courses (default 15 = 45 credits)."""
    for _ in range(count):
        enroll(student, make_course("選修", credits=3.0))


def _enroll_minimum_general(make_course, enroll, student) -> None:
    """Enroll just enough 通識 courses to satisfy every GE sub-rule.

    Hits every minimum exactly: 中文 3 + 外文 6 + 人文 6 (3 一般 + 3 核心)
    + 社會 6 + 自然 3 = 24 credits, under the 28 cap. Core GE spans 人文
    and 社會 so rule 1-3 (>= 2 domains) is satisfied.
    """
    enroll(student, make_course("一般通識", "中文通識", 3.0))
    enroll(student, make_course("一般通識", "外文通識", 3.0))
    enroll(student, make_course("一般通識", "外文通識", 3.0))
    enroll(student, make_course("一般通識", "人文通識", 3.0))
    enroll(student, make_course("一般通識", "社會通識", 3.0))
    enroll(student, make_course("一般通識", "自然通識", 3.0))
    enroll(student, make_course("核心通識", "人文通識", 3.0))
    enroll(student, make_course("核心通識", "社會通識", 3.0))


def _enroll_minimum_pe(make_course, enroll, student) -> None:
    """Enroll in 4 x 1-credit 體育/必修 courses to satisfy rule 14."""
    for _ in range(4):
        enroll(student, make_course("體育", "必修", credits=1.0))


def _enroll_exam(make_course, enroll, student) -> None:
    """Enroll in one 檢定 course to satisfy rule 5 (pass_fail)."""
    enroll(student, make_course("檢定", credits=0.0))


def _rule(report, rule_id: int):
    """Return the ``RuleResult`` for the given rule_id from a report."""
    return next(r for r in report.rules if r.rule_id == rule_id)


# ====== sanity / fixture tests ======


def test_seeded_rules_inserts_14_rows(session: Session, seeded_rules):
    """The seeded_rules fixture should insert exactly 14 rule rows."""
    from app.models import GraduationRule

    assert len(seeded_rules) == 14
    assert session.query(GraduationRule).count() == 14


# ====== happy path ======


def test_happy_path_passes(
    session, seeded_rules, make_course, make_student, enroll
):
    """A student that meets every rule and exceeds 128 credits should graduate."""
    student = make_student("HappyStudent")
    _enroll_full_required(make_course, enroll, student)
    _enroll_full_groups(make_course, enroll, student)
    # 17 electives = 51 credits -> total 124 + 6 extra = 130 (passes 128 floor).
    _enroll_full_electives(make_course, enroll, student, count=17)
    _enroll_minimum_general(make_course, enroll, student)
    _enroll_minimum_pe(make_course, enroll, student)
    _enroll_exam(make_course, enroll, student)
    session.commit()

    report = check_graduation(student.student_id, session=session)

    assert report.passed is True, (
        f"Expected pass but failed rules: "
        f"{[r.rule_id for r in report.rules if not r.passed]}"
    )
    assert all(r.passed for r in report.rules)
    assert report.total_earned >= Decimal("128")


# ====== empty / minimal student ======


def test_empty_student_fails(session, seeded_rules, make_student):
    """A student with zero enrollments cannot graduate."""
    student = make_student("EmptyStudent")
    session.commit()

    report = check_graduation(student.student_id, session=session)

    assert report.passed is False
    assert report.total_earned == Decimal("0")


# ====== rule 1: 必修 (credit_min 39) ======


def test_required_short_fails(
    session, seeded_rules, make_course, make_student, enroll
):
    """5 x 3-credit 必修 = 15 credits, short 24 of the required 39."""
    student = make_student("RequiredShort")
    for _ in range(5):
        enroll(student, make_course("必修", credits=3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_1 = _rule(report, 1)

    assert rule_1.passed is False
    assert rule_1.earned == Decimal("15.0")
    assert rule_1.short_by == Decimal("24")


# ====== rule 1-1: elective exclusions ======


def test_elective_excludes_civil_defense(
    session, seeded_rules, make_course, make_student, enroll
):
    """選修 courses named '全民國防...' should not count toward rule 6."""
    student = make_student("CivilDefense")
    enroll(student, make_course("選修", credits=3.0, name="全民國防教育"))
    enroll(student, make_course("選修", credits=3.0, name="一般選修課"))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_6 = _rule(report, 6)

    assert rule_6.earned == Decimal("3.0")  # only the non-excluded course


def test_elective_excludes_military_training(
    session, seeded_rules, make_course, make_student, enroll
):
    """選修 courses named '軍事訓練...' should not count toward rule 6."""
    student = make_student("MilTrain")
    enroll(student, make_course("選修", credits=2.0, name="軍事訓練基礎"))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_6 = _rule(report, 6)

    assert rule_6.earned == Decimal("0")


# ====== rule 14: 體育/必修 only ======


def test_pe_only_counts_sub_category_required(
    session, seeded_rules, make_course, make_student, enroll
):
    """rule 14 targets sub_category='必修'; 體育/選修 rows must be ignored."""
    student = make_student("PEFilter")
    enroll(student, make_course("體育", "必修", credits=1.0))
    enroll(student, make_course("體育", "選修", credits=1.0))  # excluded
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_14 = _rule(report, 14)

    assert rule_14.earned == Decimal("1.0")
    assert rule_14.passed is False
    assert rule_14.short_by == Decimal("3")


# ====== rule 1-5: general-education caps ======


def test_general_total_capped_at_28(
    session, seeded_rules, make_course, make_student, enroll
):
    """Total general credits above 28 are truncated by rule 7's cap."""
    student = make_student("GECap")
    # Raw enrollment: 中 6 + 外 6 + 人 9 + 社 9 + 自 6 = 36 raw credits.
    for _ in range(2):
        enroll(student, make_course("一般通識", "中文通識", 3.0))
    for _ in range(2):
        enroll(student, make_course("一般通識", "外文通識", 3.0))
    for _ in range(3):
        enroll(student, make_course("一般通識", "人文通識", 3.0))
    for _ in range(3):
        enroll(student, make_course("一般通識", "社會通識", 3.0))
    for _ in range(2):
        enroll(student, make_course("一般通識", "自然通識", 3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_7 = _rule(report, 7)

    assert rule_7.earned == Decimal("28")  # capped
    assert any("exceeds cap" in n for n in report.notes)


def test_sub_category_max_capped(
    session, seeded_rules, make_course, make_student, enroll
):
    """Rule 8 max=6; enrolling 12 credits of 中文通識 should count only 6."""
    student = make_student("ChineseCap")
    for _ in range(4):
        enroll(student, make_course("一般通識", "中文通識", 3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_8 = _rule(report, 8)

    assert rule_8.earned == Decimal("6")
    assert rule_8.passed is True


# ====== rule 1-7: duplicate-course deduplication ======


def test_duplicate_course_counted_once(
    session, seeded_rules, make_course, make_student, enroll
):
    """Same course enrolled in two semesters counts once toward 必修."""
    student = make_student("Dup")
    course = make_course("必修", credits=3.0)
    enroll(student, course, semester="111-1")
    enroll(student, course, semester="111-2")
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_1 = _rule(report, 1)

    assert rule_1.earned == Decimal("3.0")  # not 6.0


# ====== rule 1-3: core general needs >= 2 different domains ======


def test_core_general_one_domain_fails(
    session, seeded_rules, make_course, make_student, enroll
):
    """A student with all other rules passing but only 1 core-GE domain cannot graduate."""
    student = make_student("CoreSingle")
    _enroll_full_required(make_course, enroll, student)
    _enroll_full_groups(make_course, enroll, student)
    _enroll_full_electives(make_course, enroll, student, count=17)
    _enroll_minimum_pe(make_course, enroll, student)
    _enroll_exam(make_course, enroll, student)
    # GE: full sub-rule coverage but only 1 core-GE domain.
    enroll(student, make_course("一般通識", "中文通識", 3.0))
    enroll(student, make_course("一般通識", "外文通識", 3.0))
    enroll(student, make_course("一般通識", "外文通識", 3.0))
    enroll(student, make_course("一般通識", "人文通識", 3.0))
    enroll(student, make_course("一般通識", "社會通識", 3.0))
    enroll(student, make_course("一般通識", "自然通識", 3.0))
    enroll(student, make_course("核心通識", "人文通識", 3.0))  # only 人文
    session.commit()

    report = check_graduation(student.student_id, session=session)

    assert report.passed is False
    assert any("人文" in n or "社會" in n or "自然" in n for n in report.notes)


# ====== rule 1-4: cross-domain allocation ======


def test_cross_domain_goes_to_neediest_domain(
    session, seeded_rules, make_course, make_student, enroll
):
    """跨領域(人文、社會) credits should flow to whichever side is short of min."""
    student = make_student("CrossDomain")
    # 社會 already at 6 (>= min 3); 人文 still at 0 (short).
    enroll(student, make_course("一般通識", "社會通識", 3.0))
    enroll(student, make_course("一般通識", "社會通識", 3.0))
    enroll(student, make_course("一般通識", "跨領域(人文、社會)", 3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_10 = _rule(report, 10)  # 人文
    rule_11 = _rule(report, 11)  # 社會

    assert rule_10.earned == Decimal("3.0")  # cross-domain landed here
    assert rule_11.earned == Decimal("6.0")  # unchanged


def test_cross_domain_with_info_excludes_info(
    session, seeded_rules, make_course, make_student, enroll
):
    """跨領域(人文、資訊) should give all credits to 人文 because 資訊通識 has no rule."""
    student = make_student("CrossInfo")
    enroll(student, make_course("一般通識", "跨領域(人文、資訊)", 3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_10 = _rule(report, 10)

    assert rule_10.earned == Decimal("3.0")


# ====== rule 5: 檢定 pass_fail ======


def test_exam_missing_fails(session, seeded_rules, make_student):
    """No 檢定 enrollment => rule 5 fails."""
    student = make_student("NoExam")
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_5 = _rule(report, 5)

    assert rule_5.passed is False


def test_exam_with_enrollment_passes(
    session, seeded_rules, make_course, make_student, enroll
):
    """Any single 檢定 enrollment => rule 5 passes."""
    student = make_student("HasExam")
    enroll(student, make_course("檢定", credits=0.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_5 = _rule(report, 5)

    assert rule_5.passed is True


# ====== rule 1-6: total >= 128 ======


def test_total_below_128_fails_even_when_rules_pass(
    session, seeded_rules, make_course, make_student, enroll
):
    """When every rule's minimum is met but the sum falls under 128, cannot graduate."""
    student = make_student("MinOnly")
    _enroll_full_required(make_course, enroll, student)        # 39
    _enroll_full_groups(make_course, enroll, student)          # 12
    _enroll_full_electives(make_course, enroll, student, 15)   # 45
    _enroll_minimum_general(make_course, enroll, student)      # 24
    _enroll_minimum_pe(make_course, enroll, student)           # 4
    _enroll_exam(make_course, enroll, student)                 # 0
    session.commit()
    # Total = 39 + 12 + 45 + 24 + 4 = 124, just shy of 128.

    report = check_graduation(student.student_id, session=session)

    assert all(r.passed for r in report.rules), (
        f"Setup mismatch; failed rules: "
        f"{[r.rule_id for r in report.rules if not r.passed]}"
    )
    assert report.total_earned == Decimal("124.0")
    assert report.passed is False


# ====== rule 9: 外文通識 (credit_range with min == max) ======


def test_foreign_general_must_equal_six(
    session, seeded_rules, make_course, make_student, enroll
):
    """Rule 9 demands exactly 6 credits; 3 credits fails, 6 passes, 9 caps at 6."""
    student = make_student("ForeignShort")
    enroll(student, make_course("一般通識", "外文通識", 3.0))
    session.commit()

    report = check_graduation(student.student_id, session=session)
    rule_9 = _rule(report, 9)

    assert rule_9.earned == Decimal("3.0")
    assert rule_9.passed is False
    assert rule_9.short_by == Decimal("3")


# ====== report.to_dict shape sanity ======


def test_report_to_dict_has_expected_shape(
    session, seeded_rules, make_course, make_student, enroll
):
    """to_dict() output must be a flat, JSON-serializable structure."""
    student = make_student("DictShape")
    enroll(student, make_course("必修", credits=3.0))
    session.commit()

    payload = check_graduation(student.student_id, session=session).to_dict()

    assert set(payload.keys()) == {
        "student_id",
        "total_required",
        "total_earned",
        "passed",
        "rules",
        "notes",
    }
    assert isinstance(payload["rules"], list)
    assert isinstance(payload["notes"], list)
    assert len(payload["rules"]) == 14
    for rule_dict in payload["rules"]:
        assert set(rule_dict.keys()) >= {
            "rule_id", "category", "rule_type", "earned", "short_by", "passed"
        }
