"""Dump the current SQLAlchemy schema as a Mermaid ER diagram.

Reads ``Base.metadata`` (populated by importing ``app.models``) and writes
a Mermaid ``erDiagram`` block plus uniqueness footnotes to ``docs/erd.md``.

Re-run after any model change so the documentation stays in sync with the
code::

    python -m scripts.dump_erd
"""
from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy import MetaData, UniqueConstraint
from sqlalchemy.sql.schema import Column, Table

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from app.database import Base  # noqa: E402
from app import models  # noqa: F401, E402  # registers all tables on Base.metadata

OUTPUT_PATH = PROJECT_ROOT / "data" / "docs" / "erd.md"


def _mermaid_type(column: Column) -> str:
    """Map a SQLAlchemy column type to a short Mermaid-friendly name.

    Mermaid's attribute parser rejects commas inside parentheses (so
    ``decimal(3,1)`` blows up), so we substitute ``_`` as the precision
    separator. The label is otherwise cosmetic.

    Args:
        column: The column whose type should be rendered.

    Returns:
        A lowercase type label such as ``"int"`` or ``"decimal(3_1)"``.
    """
    t = column.type
    name = t.__class__.__name__.lower()
    if name == "integer":
        label = "int"
    elif name == "string":
        length = getattr(t, "length", None)
        label = f"varchar({length})" if length else "varchar"
    elif name == "numeric":
        precision = getattr(t, "precision", None)
        scale = getattr(t, "scale", None)
        if precision is not None and scale is not None:
            label = f"decimal({precision},{scale})"
        else:
            label = "decimal"
    else:
        label = name
    return label.replace(",", "_")


def _column_line(column: Column, unique_columns: set[str]) -> str:
    """Render one column row inside a Mermaid table block.

    Mermaid only allows a single key per attribute (PK / FK / UK), so this
    picks one with the priority ``PK > FK > UK``. Composite unique info is
    rendered separately as a footnote.

    Args:
        column: The column to render.
        unique_columns: Names of columns covered by a single-column
            ``UniqueConstraint``; used to emit the ``UK`` flag.

    Returns:
        A line like ``"int student_id FK"`` without leading indentation.
    """
    parts = [_mermaid_type(column), column.name]
    if column.primary_key:
        parts.append("PK")
    elif column.foreign_keys:
        parts.append("FK")
    elif column.name in unique_columns:
        parts.append("UK")
    return " ".join(parts)


def _unique_column_names(table: Table) -> set[str]:
    """Collect columns covered by a single-column ``UniqueConstraint``.

    Composite unique constraints are excluded because marking each member
    column with ``UK`` would falsely suggest each one is individually
    unique. Composite constraints are surfaced via ``_unique_constraint_notes``.

    Args:
        table: The SQLAlchemy table to inspect.

    Returns:
        A set of column names; empty when no single-column unique
        constraint exists.
    """
    return {
        next(iter(c.columns)).name
        for c in table.constraints
        if isinstance(c, UniqueConstraint) and len(c.columns) == 1
    }


def _table_block(table: Table) -> str:
    """Render one ``TableName { ... }`` block in Mermaid.

    Args:
        table: The SQLAlchemy table.

    Returns:
        A multi-line Mermaid block (no trailing newline).
    """
    unique_columns = _unique_column_names(table)
    lines = [f"    {table.name} {{"]
    lines.extend(
        f"        {_column_line(col, unique_columns)}" for col in table.columns
    )
    lines.append("    }")
    return "\n".join(lines)


def _relationship_lines(metadata: MetaData) -> list[str]:
    """Render every foreign-key relationship as a Mermaid edge.

    Cardinality is fixed at ``||--o{`` (one parent, zero-or-many children)
    which fits every FK currently in this project including the self-
    referencing ``graduation_rule.parent_rule_id``.

    Args:
        metadata: ``Base.metadata`` after every model has been imported.

    Returns:
        One line per FK, e.g. ``'    student ||--o{ enrollment : "student_id"'``.
    """
    out: list[str] = []
    seen: set[tuple[str, str, str]] = set()
    for table in metadata.sorted_tables:
        for col in table.columns:
            for fk in col.foreign_keys:
                parent = fk.column.table.name
                key = (parent, table.name, col.name)
                if key in seen:
                    continue
                seen.add(key)
                out.append(f'    {parent} ||--o{{ {table.name} : "{col.name}"')
    return out


def render_mermaid(metadata: MetaData) -> str:
    """Render the full Mermaid ``erDiagram`` block.

    Args:
        metadata: ``Base.metadata`` after every model has been imported.

    Returns:
        A string starting with ``"erDiagram"`` and ending with a newline.
    """
    parts = ["erDiagram"]
    parts.extend(_relationship_lines(metadata))
    parts.append("")
    for table in metadata.sorted_tables:
        parts.append(_table_block(table))
        parts.append("")
    return "\n".join(parts).rstrip() + "\n"


def _unique_constraint_notes(metadata: MetaData) -> list[str]:
    """Collect every named ``UniqueConstraint`` as a markdown bullet.

    Mermaid ER syntax has no native marker for composite uniqueness, so
    these are rendered as a footnote after the diagram.

    Args:
        metadata: ``Base.metadata`` after every model has been imported.

    Returns:
        Markdown bullet lines; empty when no unique constraints exist.
    """
    notes: list[str] = []
    for table in metadata.sorted_tables:
        for constraint in table.constraints:
            if isinstance(constraint, UniqueConstraint):
                cols = ", ".join(c.name for c in constraint.columns)
                name = constraint.name or "(unnamed)"
                notes.append(
                    f"- `{table.name}` unique `{name}`: ({cols})"
                )
    return notes


def build_document(metadata: MetaData) -> str:
    """Build the full ``erd.md`` content (diagram + uniqueness notes).

    Args:
        metadata: ``Base.metadata`` after every model has been imported.

    Returns:
        Full markdown document string ready to be written to disk.
    """
    lines = [
        "# Entity-Relationship Diagram",
        "",
        "_Auto-generated by `python -m scripts.dump_erd`. Do not edit by hand._",
        "",
        "```mermaid",
        render_mermaid(metadata).rstrip(),
        "```",
        "",
    ]
    notes = _unique_constraint_notes(metadata)
    if notes:
        lines.append("## Unique constraints")
        lines.append("")
        lines.extend(notes)
        lines.append("")
    return "\n".join(lines)


def main() -> None:
    """Render the ERD and write it to ``docs/erd.md``."""
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(build_document(Base.metadata), encoding="utf-8")
    print(f"wrote {OUTPUT_PATH.relative_to(PROJECT_ROOT)}")


if __name__ == "__main__":
    main()
