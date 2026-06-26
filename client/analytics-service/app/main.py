"""Wanderlust analytics microservice (FastAPI).

A standalone service that reads the same PostgreSQL database the .NET API owns
and serves aggregated analytics to the admin dashboard. It validates the JWTs the
.NET backend issues (see app/security.py) and never writes to the database.

Run (from this folder):
    uvicorn app.main:app --port 8000 --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import analytics

app = FastAPI(title="Wanderlust Analytics Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)


@app.get("/")
def root() -> dict:
    return {"service": "Wanderlust Analytics", "docs": "/docs", "health": "/analytics/health"}
