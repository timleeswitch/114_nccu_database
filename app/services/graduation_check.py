"""Graduation check engine.

Combines the 14 declarative rules in ``graduation_rule`` with the seven
computed rules below (numbered to match the project spec 1-1 ~ 1-7):

* 1-1  Elective exclusion: 選修 45 credits ignores 全民國防 / 軍事訓練 /
       體育 / 通識 courses.
* 1-2  Group requirements use ``min_credits`` only; the per-group "minimum
       number of courses" is implied because every 群修 course is 3 credits.
* 1-3  Core general education must cover >= 2 different domains among
       {人文, 社會, 自然}.
* 1-4  Cross-domain general courses are assigned as a whole block to the
       most under-filled domain, with the overflow above that domain's cap
       discarded.
* 1-5  Excess credits beyond per-sub or the overall 通識 cap (28) are not
       counted toward the 128 total.
* 1-6  Final credit total must be >= 128.
* 1-7  Only passed enrollments count. The current MVP assumes every row in
       ``Enrollment`` is a pass.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Course, Enrollment, GraduationRule

TOTAL_REQUIRED_CREDITS: Decimal = Decimal("128")

# Elective courses whose names contain any of these tokens are not counted.
ELECTIVE_NAME_EXCLUDE_KEYWORDS: tuple[str, ...] = ("全民國防", "軍事訓練")

# Both buckets feed the 通識 parent rule (rule_id 7).
GENERAL_LIKE_CATEGORIES: set[str] = {"一般通識", "核心通識"}

# Domains used by the "core general spans >= 2 domains" check (rule 1-3).
CORE_GENERAL_DOMAINS: set[str] = {"人文通識", "社會通識", "自然通識"}

# Maps a token inside "跨領域(...)" to the matching sub_category name.
CROSS_DOMAIN_MAP: dict[str, str] = {
    "人文": "人文通識",
    "社會": "社會通識",
    "自然": "自然通識",
    "資訊": "資訊通識",
}


@dataclass
class RuleResult:
    """Outcome of evaluating a single ``GraduationRule``.

    Attributes:
        rule_id: Primary key of the rule.
        category: Rule's category (e.g. "必修", "通識").
        sub_category: Sub-category, if any.
        rule_type: One of "credit_min" / "credit_max" / "credit_range" /
            "pass_fail".
        required: Human-readable text describing the requirement.
        earned: Credits actually counted toward this rule.
        short_by: Credits still missing (zero when ``passed`` is True).
        passed: Whether the rule is satisfied.
    """

    rule_id: int
    category: str
    sub_category: Optional[str]
    rule_type: str
    required: str
    earned: Decimal
    short_by: Decimal
    passed: bool

    def to_dict(self) -> dict:
        """Serialize the result for JSON responses.

        Returns:
            A plain-dict view of the result; ``Decimal`` values are cast
            to ``float`` so it is JSON-friendly.
        """
        return {
            "rule_id": self.rule_id,
            "category": self.category,
            "sub_category": self.sub_category,
            "rule_type": self.rule_type,
            "required": self.required,
            "earned": float(self.earned),
            "short_by": float(self.short_by),
            "passed": self.passed,
        }


@dataclass
class GraduationReport:
    """Aggregated graduation outcome for one student.

    Attributes:
        student_id: ID of the student being checked.
        total_required: Credit total required to graduate (128).
        total_earned: Credits counted after caps and exclusions.
        passed: True if every rule passes, core-general spans >= 2 domains,
            and ``total_earned >= total_required``.
        rules: Per-rule ``RuleResult`` entries.
        notes: Human-readable notes about cross-domain allocation, caps,
            and other side effects.
    """

    student_id: int
    total_required: Decimal = TOTAL_REQUIRED_CREDITS
    total_earned: Decimal = Decimal("0")
    passed: bool = False
    rules: list[RuleResult] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        """Serialize the report for JSON responses.

        Returns:
            A plain-dict view of the report; ``Decimal`` values are cast
            to ``float`` so it is JSON-friendly.
        """
        return {
            "student_id": self.student_id,
            "total_required": float(self.total_required),
            "total_earned": float(self.total_earned),
            "passed": self.passed,
            "rules": [r.to_dict() for r in self.rules],
            "notes": list(self.notes),
        }

    def summary(self) -> str:
        """Render a multi-line text summary for CLI / log output.

        Returns:
            A formatted string with one line per rule plus a final verdict.
        """
        lines = [f"=== Student {self.student_id} graduation check ==="]
        mark_total = (
            "OK" if self.total_earned >= self.total_required else "SHORT"
        )
        lines.append(
            f"Credits: {self.total_earned} / {self.total_required}  [{mark_total}]"
        )
        for r in self.rules:
            mark = "PASS" if r.passed else "FAIL"
            sub = f"/{r.sub_category}" if r.sub_category else ""
            short = f"  (short {r.short_by})" if r.short_by > 0 else ""
            lines.append(
                f"  [{mark}] #{r.rule_id:<2} {r.category}{sub}: "
                f"earned={r.earned}, need {r.required}{short}"
            )
        if self.notes:
            lines.append("--- notes ---")
            for n in self.notes:
                lines.append(f"  - {n}")
        lines.append(
            f"Verdict: {'GRADUATE' if self.passed else 'NOT YET'}"
        )
        return "\n".join(lines)


def check_graduation(
    student_id: int, *, session: Optional[Session] = None
) -> GraduationReport:
    """Run the full graduation check for a student.

    Args:
        student_id: Primary key of the student to check.
        session: Optional pre-opened session. When omitted, a session is
            opened from ``SessionLocal`` and closed before returning.

    Returns:
        A populated ``GraduationReport``.
    """
    own_session = session is None
    if own_session:
        session = SessionLocal()
    try:
        return _do_check(session, student_id)
    finally:
        if own_session:
            session.close()


# ===================== internal helpers =====================


def _category_value(cat) -> str:
    """Return the string value of a category whether it is an enum or str.

    Args:
        cat: Either a ``CourseCategory`` member or a plain string.

    Returns:
        The underlying string value (e.g. "必修").
    """
    return cat.value if hasattr(cat, "value") else str(cat)


def _dec(v) -> Decimal:
    """Coerce ``None`` / int / float / str to ``Decimal``.

    Args:
        v: Any numeric-like value, possibly ``None``.

    Returns:
        ``Decimal("0")`` for ``None``, otherwise the value as ``Decimal``.
    """
    if v is None:
        return Decimal("0")
    if isinstance(v, Decimal):
        return v
    return Decimal(str(v))


def _format_required(rule: GraduationRule) -> str:
    """Render a rule's requirement as a short human-readable string.

    Args:
        rule: The rule to describe.

    Returns:
        Strings like ``">= 39 credits"`` or ``"3~7 credits"``.
    """
    if rule.rule_type == "credit_min":
        return f">= {rule.min_credits} credits"
    if rule.rule_type == "credit_max":
        return f"<= {rule.max_credits} credits"
    if rule.rule_type == "credit_range":
        if rule.min_credits == rule.max_credits:
            return f"= {rule.min_credits} credits"
        return f"{rule.min_credits}~{rule.max_credits} credits"
    if rule.rule_type == "pass_fail":
        return "pass"
    return ""


def _parse_cross_domain(sub: str) -> list[str]:
    """Parse a ``跨領域(...)`` sub_category into a list of domain names.

    Example::

        "跨領域(人文、社會)" -> ["人文通識", "社會通識"]

    Args:
        sub: The raw sub_category string from ``Course.sub_category``.

    Returns:
        A list of mapped domain sub_category names. Empty when the input
        cannot be parsed or none of the tokens are known.
    """
    if not sub or not sub.startswith("跨領域"):
        return []
    if "(" not in sub or ")" not in sub:
        return []
    inner = sub[sub.find("(") + 1 : sub.rfind(")")]
    parts = inner.replace("、", ",").split(",")
    out: list[str] = []
    for p in parts:
        mapped = CROSS_DOMAIN_MAP.get(p.strip())
        if mapped:
            out.append(mapped)
    return out


def _load_distinct_courses(session: Session, student_id: int) -> list[Course]:
    """Load each unique course a student has enrolled in.

    Implements rule 1-7: when a student takes the same course twice it
    only counts once.

    Args:
        session: Active DB session.
        student_id: Student to load enrollments for.

    Returns:
        A list of unique ``Course`` rows.
    """
    rows = (
        session.query(Course)
        .join(Enrollment, Enrollment.course_id == Course.course_id)
        .filter(Enrollment.student_id == student_id)
        .all()
    )
    seen: set[str] = set()
    out: list[Course] = []
    for c in rows:
        if c.course_id in seen:
            continue
        seen.add(c.course_id)
        out.append(c)
    return out


def _do_check(session: Session, student_id: int) -> GraduationReport:
    """Run the check pipeline against an open session.

    Args:
        session: Active DB session.
        student_id: Student to check.

    Returns:
        A populated ``GraduationReport``.
    """
    report = GraduationReport(student_id=student_id)
    courses = _load_distinct_courses(session, student_id)
    rules = (
        session.query(GraduationRule)
        .order_by(GraduationRule.rule_id)
        .all()
    )

    by_cat: dict[str, list[Course]] = {}
    for c in courses:
        by_cat.setdefault(_category_value(c.category), []).append(c)

    counted_credits = Decimal("0")
    general_rules = [r for r in rules if r.category == "通識"]
    other_rules = [r for r in rules if r.category != "通識"]

    general_results, total_general_capped = _process_general(
        courses, general_rules, report.notes
    )
    for rule in general_rules:
        if rule.rule_id in general_results:
            report.rules.append(general_results[rule.rule_id])

    for rule in other_rules:
        result, credits_to_count = _evaluate_rule(rule, by_cat)
        report.rules.append(result)
        counted_credits += credits_to_count

    counted_credits += total_general_capped

    # Rule 1-3: core general must span at least 2 of the listed domains.
    core_domains = {
        c.sub_category
        for c in courses
        if _category_value(c.category) == "核心通識"
        and c.sub_category in CORE_GENERAL_DOMAINS
    }
    core_ok = len(core_domains) >= 2
    if not core_ok:
        report.notes.append(
            "Core general must cover >= 2 of (人文/社會/自然); "
            f"currently {len(core_domains)}: {sorted(core_domains)}"
        )

    report.total_earned = counted_credits
    all_rules_pass = all(r.passed for r in report.rules)
    report.passed = (
        all_rules_pass
        and core_ok
        and counted_credits >= TOTAL_REQUIRED_CREDITS
    )
    return report


def _evaluate_rule(
    rule: GraduationRule, by_cat: dict[str, list[Course]]
) -> tuple[RuleResult, Decimal]:
    """Evaluate a non-general rule (必修/群修/檢定/選修/體育).

    Args:
        rule: The rule to evaluate.
        by_cat: Courses grouped by category value.

    Returns:
        A 2-tuple of ``(RuleResult, credits_to_add_to_total)``.
    """
    cat = rule.category
    sub = rule.sub_category

    if cat == "必修":
        earned = sum(
            (c.credits for c in by_cat.get("必修", [])), Decimal("0")
        )
        return _credit_min_result(rule, earned), earned

    if cat == "群修":
        earned = sum(
            (
                c.credits
                for c in by_cat.get("群修", [])
                if c.sub_category == sub
            ),
            Decimal("0"),
        )
        return _credit_min_result(rule, earned), earned

    if cat == "檢定":
        taken = bool(by_cat.get("檢定"))
        return (
            RuleResult(
                rule_id=rule.rule_id,
                category=cat,
                sub_category=sub,
                rule_type=rule.rule_type,
                required="pass",
                earned=Decimal("1") if taken else Decimal("0"),
                short_by=Decimal("0") if taken else Decimal("1"),
                passed=taken,
            ),
            Decimal("0"),  # exam itself contributes no credits.
        )

    if cat == "選修":
        # Rule 1-1: drop excluded names from the elective tally.
        elective = [
            c
            for c in by_cat.get("選修", [])
            if not any(
                k in c.name for k in ELECTIVE_NAME_EXCLUDE_KEYWORDS
            )
        ]
        earned = sum((c.credits for c in elective), Decimal("0"))
        return _credit_min_result(rule, earned), earned

    if cat == "體育":
        # Rule 14 targets sub_category="必修"; pull only matching rows.
        pe = [
            c
            for c in by_cat.get("體育", [])
            if sub is None or c.sub_category == sub
        ]
        earned = sum((c.credits for c in pe), Decimal("0"))
        return _credit_min_result(rule, earned), earned

    return (
        RuleResult(
            rule_id=rule.rule_id,
            category=cat,
            sub_category=sub,
            rule_type=rule.rule_type,
            required=_format_required(rule),
            earned=Decimal("0"),
            short_by=Decimal("0"),
            passed=True,
        ),
        Decimal("0"),
    )


def _credit_min_result(
    rule: GraduationRule, earned: Decimal
) -> RuleResult:
    """Build a ``RuleResult`` for a ``credit_min`` style rule.

    Args:
        rule: The rule being checked.
        earned: Total credits earned toward the rule.

    Returns:
        A populated ``RuleResult``.
    """
    min_c = _dec(rule.min_credits)
    passed = earned >= min_c
    short = max(min_c - earned, Decimal("0"))
    return RuleResult(
        rule_id=rule.rule_id,
        category=rule.category,
        sub_category=rule.sub_category,
        rule_type=rule.rule_type,
        required=_format_required(rule),
        earned=earned,
        short_by=short,
        passed=passed,
    )


def _process_general(
    courses: list[Course],
    general_rules: list[GraduationRule],
    notes: list[str],
) -> tuple[dict[int, RuleResult], Decimal]:
    """Evaluate the general-education rules (rule_id 7-13).

    Handles cross-domain allocation (1-4), per-sub caps (1-5), and the
    parent cap of 28 credits (1-5).

    Args:
        courses: All unique courses taken by the student.
        general_rules: All rules in the "通識" category.
        notes: List that human-readable cap / allocation messages are
            appended to as a side effect.

    Returns:
        A 2-tuple ``(rule_id -> RuleResult, capped_general_total)``.
    """
    sub_rules: dict[str, GraduationRule] = {
        r.sub_category: r for r in general_rules if r.sub_category
    }
    parent = next((r for r in general_rules if r.sub_category is None), None)
    earned_by_sub: dict[str, Decimal] = {
        sub: Decimal("0") for sub in sub_rules
    }

    ge_courses = [
        c
        for c in courses
        if _category_value(c.category) in GENERAL_LIKE_CATEGORIES
    ]
    cross_courses: list[Course] = []
    for c in ge_courses:
        sub = c.sub_category
        if sub in earned_by_sub:
            earned_by_sub[sub] += c.credits
        elif sub and sub.startswith("跨領域"):
            cross_courses.append(c)

    # Rule 1-4: allocate cross-domain courses to the neediest matching domain.
    for c in cross_courses:
        candidates = [
            d for d in _parse_cross_domain(c.sub_category) if d in earned_by_sub
        ]
        if not candidates:
            notes.append(
                f"Cross-domain course {c.course_id} '{c.name}' "
                f"(sub={c.sub_category}) has no eligible domain; skipped"
            )
            continue

        def shortfall(d: str) -> Decimal:
            r = sub_rules[d]
            return max(_dec(r.min_credits) - earned_by_sub[d], Decimal("0"))

        def headroom(d: str) -> Decimal:
            r = sub_rules[d]
            if r.max_credits is None:
                return Decimal("999")
            return max(_dec(r.max_credits) - earned_by_sub[d], Decimal("0"))

        # Prefer domains short on their minimum, then on headroom, then name.
        candidates.sort(key=lambda d: (-shortfall(d), -headroom(d), d))
        target = candidates[0]
        space = headroom(target)
        usable = min(c.credits, space)
        if usable <= 0:
            notes.append(
                f"Cross-domain course {c.course_id} '{c.name}' "
                f"({c.credits} credits) targeted {target} but the domain "
                "is already capped; nothing counted"
            )
            continue
        earned_by_sub[target] += usable
        if usable < c.credits:
            r = sub_rules[target]
            notes.append(
                f"Cross-domain course {c.course_id} '{c.name}' "
                f"({c.credits} credits) allocated to {target}; only "
                f"{usable} counted (cap {r.max_credits})"
            )
        else:
            notes.append(
                f"Cross-domain course {c.course_id} '{c.name}' "
                f"({c.credits} credits) allocated to {target}"
            )

    # Rule 1-5: cap each sub at its max_credits and build the result rows.
    results: dict[int, RuleResult] = {}
    total_capped = Decimal("0")
    for sub, r in sub_rules.items():
        raw = earned_by_sub[sub]
        capped = (
            min(raw, _dec(r.max_credits))
            if r.max_credits is not None
            else raw
        )
        min_c = _dec(r.min_credits)
        passed = True
        short = Decimal("0")
        if r.rule_type in ("credit_range", "credit_min"):
            if raw < min_c:
                passed = False
                short = min_c - raw
        # credit_max rules always pass; the excess is simply not counted.
        results[r.rule_id] = RuleResult(
            rule_id=r.rule_id,
            category=r.category,
            sub_category=sub,
            rule_type=r.rule_type,
            required=_format_required(r),
            earned=capped,
            short_by=short,
            passed=passed,
        )
        total_capped += capped

    # Parent rule (rule 7): the overall 通識 cap of 28 credits.
    if parent:
        parent_max = _dec(parent.max_credits)
        total_uncapped = sum(earned_by_sub.values(), Decimal("0"))
        total_capped_final = min(total_capped, parent_max)
        if total_uncapped > parent_max:
            notes.append(
                f"General total {total_uncapped} exceeds cap {parent_max}; "
                f"counted {total_capped_final}"
            )
        results[parent.rule_id] = RuleResult(
            rule_id=parent.rule_id,
            category="通識",
            sub_category=None,
            rule_type=parent.rule_type,
            required=_format_required(parent),
            earned=total_capped_final,
            short_by=Decimal("0"),
            passed=True,
        )
        return results, total_capped_final

    return results, total_capped
