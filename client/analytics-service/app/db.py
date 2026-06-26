"""Database access for the analytics service.

A single SQLAlchemy engine over the same PostgreSQL database the .NET API owns.
This service only ever reads, so we expose a plain connection dependency and run
aggregation queries against it — no ORM models, no writes.
"""
from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.engine import Connection

from .config import settings

# pool_pre_ping avoids handing out stale connections after the DB restarts.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)


def get_conn() -> Iterator[Connection]:
    """FastAPI dependency yielding a read-only connection per request."""
    with engine.connect() as conn:
        yield conn
