"""Alembic environment script.

Wires Alembic to our project layout:

* prepends the project root to ``sys.path`` so ``app.*`` is importable;
* overrides ``sqlalchemy.url`` from the ``DATABASE_URL`` env var;
* points ``target_metadata`` at the SQLAlchemy ``Base.metadata`` that all
  ORM models register against.
"""
from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool

from alembic import context

# Make `app` importable when alembic is invoked from the project root.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import DATABASE_URL, Base  # noqa: E402
from app import models  # noqa: F401, E402  # registers all models on Base.metadata

config = context.config
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL", DATABASE_URL))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations without an active DB connection.

    Emits SQL to ``stdout`` instead of executing it. Useful for generating
    a migration script that a DBA will run by hand.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations with a live DB connection (the normal path)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
