"""Runtime settings for the analytics service.

Read from environment variables (optionally loaded from a local ``.env``), with
dev defaults that mirror the .NET API's ``appsettings.json`` so the service runs
out of the box. The JWT_* values MUST match the .NET "Jwt" section exactly, or
tokens this service receives will fail validation.
"""
import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Same PostgreSQL database the .NET API uses. SQLAlchemy + psycopg2 URL.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg2://postgres:1234@localhost:5432/tourpackages",
    )

    # JWT validation parameters — identical to the .NET backend.
    # Must match the .NET API's "Jwt:Key" exactly (same string is used as the
    # HMAC secret on both sides). Kept in sync with appsettings.json for dev.
    JWT_KEY: str = os.getenv("JWT_KEY", "Ts/YwXwaSi3zu/UgSbxIteT/FKZyay8q8F3jpTM2CSM=")
    JWT_ISSUER: str = os.getenv("JWT_ISSUER", "WanderlustTours")
    JWT_AUDIENCE: str = os.getenv("JWT_AUDIENCE", "WanderlustToursClient")
    JWT_ALG: str = os.getenv("JWT_ALG", "HS256")

    # Origins permitted for direct (non-proxied) browser calls.
    CORS_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if o.strip()
    ]


settings = Settings()
