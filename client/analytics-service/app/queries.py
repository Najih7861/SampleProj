"""SQL aggregation functions for the analytics dashboard.

All queries read the same PostgreSQL schema the .NET API created via EF Core, so
table and column identifiers are PascalCase and must be double-quoted. Booking
revenue is Price x NumberOfTravelers; "realized" revenue counts only Confirmed
bookings (Status = 1), "pipeline" counts Pending (Status = 0).

Status int mapping (Models/BookingStatus.cs):  Pending=0, Confirmed=1, Cancelled=2
"""
from sqlalchemy import text
from sqlalchemy.engine import Connection

STATUS_NAMES = {0: "Pending", 1: "Confirmed", 2: "Cancelled"}


def _pct_delta(current, previous) -> float | None:
    """Percent change current vs previous, or None when there is no baseline."""
    current = float(current or 0)
    previous = float(previous or 0)
    if previous == 0:
        return None
    return round((current - previous) / previous * 100, 1)


def get_kpis(conn: Connection) -> dict:
    rev = conn.execute(
        text(
            """
            SELECT
              COALESCE(SUM(CASE WHEN b."Status"=1 THEN p."Price"*b."NumberOfTravelers" END),0) AS realized,
              COALESCE(SUM(CASE WHEN b."Status"=0 THEN p."Price"*b."NumberOfTravelers" END),0) AS pipeline,
              COALESCE(SUM(CASE WHEN b."Status"=1 AND date_trunc('month',b."CreatedAt")=date_trunc('month',now())
                                THEN p."Price"*b."NumberOfTravelers" END),0) AS realized_this,
              COALESCE(SUM(CASE WHEN b."Status"=1 AND date_trunc('month',b."CreatedAt")=date_trunc('month',now()-interval '1 month')
                                THEN p."Price"*b."NumberOfTravelers" END),0) AS realized_last
            FROM "Bookings" b
            JOIN "TourPackages" p ON p."Id" = b."TourPackageId"
            """
        )
    ).mappings().one()

    bk = conn.execute(
        text(
            """
            SELECT
              COUNT(*) AS total,
              COUNT(*) FILTER (WHERE "Status"=1) AS confirmed,
              COUNT(*) FILTER (WHERE "Status"=0) AS pending,
              COUNT(*) FILTER (WHERE "Status"=2) AS cancelled,
              COALESCE(SUM("NumberOfTravelers"),0) AS travelers,
              COUNT(*) FILTER (WHERE date_trunc('month',"CreatedAt")=date_trunc('month',now())) AS this_month,
              COUNT(*) FILTER (WHERE date_trunc('month',"CreatedAt")=date_trunc('month',now()-interval '1 month')) AS last_month
            FROM "Bookings"
            """
        )
    ).mappings().one()

    rt = conn.execute(
        text('SELECT COALESCE(AVG("Rating"),0) AS avg, COUNT(*) AS cnt FROM "Reviews"')
    ).mappings().one()

    pk = conn.execute(
        text(
            'SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE "IsAvailable") AS active FROM "TourPackages"'
        )
    ).mappings().one()

    us = conn.execute(
        text(
            """
            SELECT
              COUNT(*) FILTER (WHERE date_trunc('month',"CreatedAt")=date_trunc('month',now())) AS this_month,
              COUNT(*) FILTER (WHERE date_trunc('month',"CreatedAt")=date_trunc('month',now()-interval '1 month')) AS last_month
            FROM "Users"
            """
        )
    ).mappings().one()

    total = int(bk["total"])
    confirmed = int(bk["confirmed"])
    cancelled = int(bk["cancelled"])
    realized = float(rev["realized"])

    return {
        "realizedRevenue": round(realized, 2),
        "realizedRevenueDelta": _pct_delta(rev["realized_this"], rev["realized_last"]),
        "pipelineRevenue": round(float(rev["pipeline"]), 2),
        "totalBookings": total,
        "totalBookingsDelta": _pct_delta(bk["this_month"], bk["last_month"]),
        "avgBookingValue": round(realized / confirmed, 2) if confirmed else 0.0,
        "totalTravelers": int(bk["travelers"]),
        "conversionRate": round(confirmed / total, 4) if total else 0.0,
        "cancellationRate": round(cancelled / total, 4) if total else 0.0,
        "avgRating": round(float(rt["avg"]), 2),
        "totalReviews": int(rt["cnt"]),
        "newUsersThisMonth": int(us["this_month"]),
        "newUsersDelta": _pct_delta(us["this_month"], us["last_month"]),
        "activePackages": int(pk["active"]),
        "totalPackages": int(pk["total"]),
        "confirmedBookings": confirmed,
        "pendingBookings": int(bk["pending"]),
        "cancelledBookings": cancelled,
    }


def get_revenue_trend(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            WITH months AS (
              SELECT date_trunc('month', now()) - (interval '1 month' * gs) AS m
              FROM generate_series(0, 11) AS gs
            )
            SELECT to_char(months.m, 'YYYY-MM') AS month,
                   to_char(months.m, 'Mon')    AS label,
                   COALESCE(SUM(CASE WHEN b."Status"=1 THEN p."Price"*b."NumberOfTravelers" END),0) AS revenue,
                   COUNT(b."Id") AS bookings
            FROM months
            LEFT JOIN "Bookings" b ON date_trunc('month', b."CreatedAt") = months.m
            LEFT JOIN "TourPackages" p ON p."Id" = b."TourPackageId"
            GROUP BY months.m
            ORDER BY months.m
            """
        )
    ).mappings().all()
    return [
        {
            "month": r["month"],
            "label": r["label"],
            "revenue": round(float(r["revenue"]), 2),
            "bookings": int(r["bookings"]),
        }
        for r in rows
    ]


def get_status_breakdown(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text('SELECT "Status" AS status, COUNT(*) AS count FROM "Bookings" GROUP BY "Status"')
    ).mappings().all()
    counts = {int(r["status"]): int(r["count"]) for r in rows}
    return [{"status": name, "count": counts.get(code, 0)} for code, name in STATUS_NAMES.items()]


def get_top_packages(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            SELECT p."Id" AS id, p."Title" AS title, p."Destination" AS destination,
                   COUNT(b."Id") AS bookings,
                   COALESCE(SUM(b."NumberOfTravelers"),0) AS travelers,
                   COALESCE(SUM(CASE WHEN b."Status"=1 THEN p."Price"*b."NumberOfTravelers" END),0) AS revenue
            FROM "TourPackages" p
            LEFT JOIN "Bookings" b ON b."TourPackageId" = p."Id"
            GROUP BY p."Id", p."Title", p."Destination"
            ORDER BY revenue DESC, bookings DESC
            LIMIT 8
            """
        )
    ).mappings().all()
    return [
        {
            "id": int(r["id"]),
            "title": r["title"],
            "destination": r["destination"],
            "bookings": int(r["bookings"]),
            "travelers": int(r["travelers"]),
            "revenue": round(float(r["revenue"]), 2),
        }
        for r in rows
    ]


def get_dead_inventory(conn: Connection) -> list[dict]:
    """Available packages that have never been booked — live but unsold inventory."""
    rows = conn.execute(
        text(
            """
            SELECT p."Id" AS id, p."Title" AS title, p."Destination" AS destination,
                   p."Price" AS price, COUNT(b."Id") AS bookings
            FROM "TourPackages" p
            LEFT JOIN "Bookings" b ON b."TourPackageId" = p."Id"
            WHERE p."IsAvailable" = true
            GROUP BY p."Id", p."Title", p."Destination", p."Price"
            HAVING COUNT(b."Id") = 0
            ORDER BY p."Price" DESC
            """
        )
    ).mappings().all()
    return [
        {
            "id": int(r["id"]),
            "title": r["title"],
            "destination": r["destination"],
            "price": round(float(r["price"]), 2),
            "bookings": int(r["bookings"]),
        }
        for r in rows
    ]


def get_destination_performance(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            SELECT pl."Id" AS id, pl."Name" AS name,
                   COUNT(b."Id") AS bookings,
                   COALESCE(SUM(CASE WHEN b."Status"=1 THEN p."Price"*b."NumberOfTravelers" END),0) AS revenue
            FROM "Places" pl
            LEFT JOIN "TourPackages" p ON p."PlaceId" = pl."Id"
            LEFT JOIN "Bookings" b ON b."TourPackageId" = p."Id"
            GROUP BY pl."Id", pl."Name"
            ORDER BY revenue DESC
            """
        )
    ).mappings().all()
    return [
        {
            "id": int(r["id"]),
            "name": r["name"],
            "bookings": int(r["bookings"]),
            "revenue": round(float(r["revenue"]), 2),
        }
        for r in rows
    ]


def get_rating_distribution(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            WITH buckets AS (SELECT gs AS rating FROM generate_series(1, 5) AS gs)
            SELECT buckets.rating AS rating, COUNT(r."Id") AS count
            FROM buckets
            LEFT JOIN "Reviews" r ON r."Rating" = buckets.rating
            GROUP BY buckets.rating
            ORDER BY buckets.rating
            """
        )
    ).mappings().all()
    return [{"rating": int(r["rating"]), "count": int(r["count"])} for r in rows]


def get_lowest_rated(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            SELECT p."Id" AS id, p."Title" AS title,
                   ROUND(AVG(r."Rating")::numeric, 2) AS avg_rating,
                   COUNT(r."Id") AS reviews
            FROM "TourPackages" p
            JOIN "Reviews" r ON r."TourPackageId" = p."Id"
            GROUP BY p."Id", p."Title"
            HAVING AVG(r."Rating") < 3
            ORDER BY avg_rating ASC
            LIMIT 5
            """
        )
    ).mappings().all()
    return [
        {
            "id": int(r["id"]),
            "title": r["title"],
            "avgRating": float(r["avg_rating"]),
            "reviews": int(r["reviews"]),
        }
        for r in rows
    ]


def get_signups(conn: Connection) -> list[dict]:
    rows = conn.execute(
        text(
            """
            WITH months AS (
              SELECT date_trunc('month', now()) - (interval '1 month' * gs) AS m
              FROM generate_series(0, 11) AS gs
            )
            SELECT to_char(months.m, 'YYYY-MM') AS month,
                   to_char(months.m, 'Mon')    AS label,
                   COUNT(u."Id") AS count
            FROM months
            LEFT JOIN "Users" u ON date_trunc('month', u."CreatedAt") = months.m
            GROUP BY months.m
            ORDER BY months.m
            """
        )
    ).mappings().all()
    return [{"month": r["month"], "label": r["label"], "count": int(r["count"])} for r in rows]


def get_seasonality(conn: Connection) -> list[dict]:
    """Upcoming demand: non-cancelled bookings by travel-date month, next 6 months."""
    rows = conn.execute(
        text(
            """
            WITH months AS (
              SELECT date_trunc('month', now()) + (interval '1 month' * gs) AS m
              FROM generate_series(0, 5) AS gs
            )
            SELECT to_char(months.m, 'YYYY-MM') AS month,
                   to_char(months.m, 'Mon')    AS label,
                   COUNT(b."Id") AS bookings,
                   COALESCE(SUM(b."NumberOfTravelers"),0) AS travelers
            FROM months
            LEFT JOIN "Bookings" b
              ON date_trunc('month', b."TravelDate") = months.m AND b."Status" <> 2
            GROUP BY months.m
            ORDER BY months.m
            """
        )
    ).mappings().all()
    return [
        {
            "month": r["month"],
            "label": r["label"],
            "bookings": int(r["bookings"]),
            "travelers": int(r["travelers"]),
        }
        for r in rows
    ]


def get_aged_pending(conn: Connection) -> int:
    """Pending bookings older than 7 days — revenue stuck awaiting follow-up."""
    return int(
        conn.execute(
            text(
                'SELECT COUNT(*) FROM "Bookings" WHERE "Status"=0 AND "CreatedAt" < now() - interval \'7 days\''
            )
        ).scalar()
        or 0
    )


def build_insights(
    kpis: dict,
    dead_inventory: list[dict],
    lowest_rated: list[dict],
    aged_pending: int,
) -> list[dict]:
    """Rule-based callouts that surface business drawbacks at a glance."""
    insights: list[dict] = []

    cr = kpis["cancellationRate"]
    if cr >= 0.20:
        insights.append({
            "level": "critical",
            "title": "High cancellation rate",
            "detail": f"{cr * 100:.0f}% of all bookings are cancelled. Investigate booking friction or package quality.",
        })
    elif cr >= 0.10:
        insights.append({
            "level": "warning",
            "title": "Rising cancellations",
            "detail": f"{cr * 100:.0f}% of bookings end up cancelled — worth keeping an eye on.",
        })

    delta = kpis["realizedRevenueDelta"]
    if delta is not None and delta < 0:
        insights.append({
            "level": "warning",
            "title": "Revenue down month-over-month",
            "detail": f"Realized revenue fell {abs(delta):.0f}% versus last month.",
        })
    elif delta is not None and delta > 0:
        insights.append({
            "level": "success",
            "title": "Revenue is growing",
            "detail": f"Realized revenue is up {delta:.0f}% versus last month.",
        })

    if kpis["pendingBookings"] > 0:
        insights.append({
            "level": "info",
            "title": "Pending revenue to convert",
            "detail": f"{kpis['pendingBookings']} pending booking(s) worth "
                      f"${kpis['pipelineRevenue']:,.0f} are awaiting confirmation.",
        })

    if aged_pending > 0:
        insights.append({
            "level": "warning",
            "title": "Aging pending bookings",
            "detail": f"{aged_pending} pending booking(s) are older than 7 days and need follow-up.",
        })

    if dead_inventory:
        insights.append({
            "level": "warning",
            "title": "Dead inventory",
            "detail": f"{len(dead_inventory)} available package(s) have no bookings yet.",
        })

    if lowest_rated:
        insights.append({
            "level": "warning",
            "title": "Low-rated packages",
            "detail": f"{len(lowest_rated)} package(s) average below 3 stars. Review traveler feedback.",
        })

    if not insights:
        insights.append({
            "level": "success",
            "title": "All clear",
            "detail": "No problem areas detected across bookings, revenue, inventory, or ratings.",
        })

    return insights
