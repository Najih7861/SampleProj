"""Analytics endpoints.

All data endpoints require a valid Admin JWT (Depends(require_admin)); /health is
open so the service can be probed without a token. The dashboard is composed in a
single call to keep the frontend simple — it can be split into per-section
endpoints later without changing the response contract.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.engine import Connection

from .. import charts, queries
from ..db import get_conn
from ..schemas import AnalyticsDashboard
from ..security import require_admin

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/health")
def health() -> dict:
    """Liveness probe — no auth required."""
    return {"status": "ok", "service": "analytics"}


@router.get("/dashboard", response_model=AnalyticsDashboard)
def dashboard(
    _user: dict = Depends(require_admin),
    conn: Connection = Depends(get_conn),
) -> dict:
    """Full analytics payload: KPIs, matplotlib-rendered charts, tables, insights."""
    kpis = queries.get_kpis(conn)
    dead_inventory = queries.get_dead_inventory(conn)
    lowest_rated = queries.get_lowest_rated(conn)
    aged_pending = queries.get_aged_pending(conn)

    # Pull the series, then render each one server-side into a PNG data URI.
    chart_images = charts.build_charts(
        revenue_trend=queries.get_revenue_trend(conn),
        status_breakdown=queries.get_status_breakdown(conn),
        top_packages=queries.get_top_packages(conn),
        destination_performance=queries.get_destination_performance(conn),
        rating_distribution=queries.get_rating_distribution(conn),
        signups=queries.get_signups(conn),
        seasonality=queries.get_seasonality(conn),
    )

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "kpis": kpis,
        "charts": chart_images,
        "deadInventory": dead_inventory,
        "lowestRated": lowest_rated,
        "insights": queries.build_insights(kpis, dead_inventory, lowest_rated, aged_pending),
    }
