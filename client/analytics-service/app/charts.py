"""Server-side chart rendering with matplotlib.

Each function turns a query result into a colorful PNG and returns it as a
``data:image/png;base64,...`` URI, so the authenticated /dashboard response can
carry the rendered charts inline (no separate, unauthenticated image URLs).

We use the object-oriented Figure API (not pyplot) so there is no global state —
safe when FastAPI serves requests from its threadpool — and the colors mirror the
React app's CSS palette so the dashboard matches the rest of the project.
"""
import base64
import io

from matplotlib.backends.backend_agg import FigureCanvasAgg
from matplotlib.figure import Figure
from matplotlib.ticker import FuncFormatter, MaxNLocator

# --- brand palette (mirrors client/src/index.css custom properties) ----------
PRIMARY = "#0f6fb5"
PRIMARY_DARK = "#0a4d80"
ACCENT = "#ef6234"
WARM = "#f5a623"
SUCCESS = "#1f8a5b"
DANGER = "#d23b34"
MUTED = "#6a798c"
INK = "#112338"
BORDER = "#d9e2ed"

# A harmonious, colorful cycle for categorical charts (brand colors first).
CYCLE = [PRIMARY, ACCENT, SUCCESS, WARM, PRIMARY_DARK, DANGER, "#7b5cd6", "#0fa3a3"]

STATUS_COLORS = {"Pending": WARM, "Confirmed": SUCCESS, "Cancelled": DANGER}


def _money_fmt(value, _pos=None) -> str:
    if abs(value) >= 1000:
        return f"${value / 1000:.0f}k"
    return f"${value:.0f}"


def _style_axes(ax, *, grid_axis: str = "y") -> None:
    """Flat, modern look: no spines, muted ticks, soft gridlines."""
    ax.tick_params(colors=MUTED, labelsize=9, length=0)
    for spine in ax.spines.values():
        spine.set_visible(False)
    if grid_axis:
        ax.grid(axis=grid_axis, color=BORDER, linewidth=0.8, alpha=0.8)
        ax.set_axisbelow(True)


def _empty(ax, message: str) -> None:
    ax.text(0.5, 0.5, message, ha="center", va="center", color=MUTED, fontsize=11, transform=ax.transAxes)
    ax.axis("off")


def _to_data_uri(fig: Figure) -> str:
    FigureCanvasAgg(fig)
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=110, bbox_inches="tight", transparent=True)
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def revenue_trend_chart(trend: list[dict]) -> str:
    """Realized revenue (filled line) vs booking volume (secondary axis)."""
    labels = [p["label"] for p in trend]
    revenue = [p["revenue"] for p in trend]
    bookings = [p["bookings"] for p in trend]

    fig = Figure(figsize=(9.2, 3.5))
    ax = fig.add_subplot(111)
    ax.fill_between(labels, revenue, color=PRIMARY, alpha=0.13)
    ax.plot(labels, revenue, color=PRIMARY, linewidth=2.6, marker="o", markersize=4, label="Revenue")
    ax.yaxis.set_major_formatter(FuncFormatter(_money_fmt))
    _style_axes(ax)

    ax2 = ax.twinx()
    ax2.plot(labels, bookings, color=ACCENT, linewidth=2.4, marker="s", markersize=4, label="Bookings")
    ax2.yaxis.set_major_locator(MaxNLocator(integer=True))
    _style_axes(ax2, grid_axis="")

    lines1, labels1 = ax.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax.legend(lines1 + lines2, labels1 + labels2, loc="upper left", frameon=False, fontsize=9)
    return _to_data_uri(fig)


def status_pie_chart(status: list[dict]) -> str:
    """Donut of booking outcomes."""
    labels = [s["status"] for s in status]
    counts = [s["count"] for s in status]
    colors = [STATUS_COLORS.get(s["status"], MUTED) for s in status]

    fig = Figure(figsize=(4.8, 3.6))
    ax = fig.add_subplot(111)
    if sum(counts) == 0:
        _empty(ax, "No bookings yet")
        return _to_data_uri(fig)

    wedges, _texts, autotexts = ax.pie(
        counts,
        colors=colors,
        autopct=lambda p: f"{p:.0f}%" if p >= 1 else "",
        startangle=90,
        counterclock=False,
        pctdistance=0.78,
        wedgeprops=dict(width=0.42, edgecolor="white", linewidth=2),
        textprops=dict(color="white", fontsize=10, fontweight="bold"),
    )
    ax.legend(wedges, [f"{l} ({c})" for l, c in zip(labels, counts)], loc="center", frameon=False, fontsize=9)
    ax.set_aspect("equal")
    return _to_data_uri(fig)


def top_packages_chart(packages: list[dict]) -> str:
    """Horizontal bars of realized revenue per package (highest on top)."""
    fig = Figure(figsize=(5.6, 3.6))
    ax = fig.add_subplot(111)
    if not packages or all(p["revenue"] == 0 for p in packages):
        _empty(ax, "No revenue yet")
        return _to_data_uri(fig)

    rows = list(reversed(packages))  # barh draws bottom-up; reverse for top-down
    titles = [p["title"] for p in rows]
    revenue = [p["revenue"] for p in rows]
    colors = [CYCLE[i % len(CYCLE)] for i in range(len(rows))]

    bars = ax.barh(titles, revenue, color=colors, height=0.66)
    ax.xaxis.set_major_formatter(FuncFormatter(_money_fmt))
    _style_axes(ax, grid_axis="x")
    ax.bar_label(bars, labels=[_money_fmt(v) for v in revenue], padding=3, color=INK, fontsize=8)
    ax.margins(x=0.16)
    return _to_data_uri(fig)


def destination_chart(destinations: list[dict]) -> str:
    """Vertical bars of realized revenue per destination/place."""
    fig = Figure(figsize=(5.6, 3.6))
    ax = fig.add_subplot(111)
    if not destinations or all(d["revenue"] == 0 for d in destinations):
        _empty(ax, "No revenue yet")
        return _to_data_uri(fig)

    names = [d["name"].split(",")[0] for d in destinations]  # short label
    revenue = [d["revenue"] for d in destinations]
    colors = [CYCLE[i % len(CYCLE)] for i in range(len(destinations))]

    bars = ax.bar(names, revenue, color=colors, width=0.62)
    ax.yaxis.set_major_formatter(FuncFormatter(_money_fmt))
    _style_axes(ax)
    ax.bar_label(bars, labels=[_money_fmt(v) for v in revenue], padding=2, color=INK, fontsize=8)
    for label in ax.get_xticklabels():
        label.set_rotation(15)
        label.set_ha("right")
    return _to_data_uri(fig)


def rating_chart(buckets: list[dict]) -> str:
    """Star-rating distribution, colored by sentiment (red→amber→green)."""
    fig = Figure(figsize=(5.6, 3.6))
    ax = fig.add_subplot(111)
    if not buckets or all(b["count"] == 0 for b in buckets):
        _empty(ax, "No reviews yet")
        return _to_data_uri(fig)

    ratings = [f"{b['rating']}★" for b in buckets]
    counts = [b["count"] for b in buckets]
    tone = {1: DANGER, 2: DANGER, 3: WARM, 4: SUCCESS, 5: SUCCESS}
    colors = [tone.get(b["rating"], PRIMARY) for b in buckets]

    bars = ax.bar(ratings, counts, color=colors, width=0.6)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    _style_axes(ax)
    ax.bar_label(bars, padding=2, color=INK, fontsize=9)
    return _to_data_uri(fig)


def signups_chart(signups: list[dict]) -> str:
    """New-user signups over the last 12 months."""
    labels = [s["label"] for s in signups]
    counts = [s["count"] for s in signups]

    fig = Figure(figsize=(5.6, 3.6))
    ax = fig.add_subplot(111)
    ax.fill_between(labels, counts, color=PRIMARY_DARK, alpha=0.12)
    ax.plot(labels, counts, color=PRIMARY_DARK, linewidth=2.6, marker="o", markersize=4)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    _style_axes(ax)
    return _to_data_uri(fig)


def seasonality_chart(season: list[dict]) -> str:
    """Upcoming demand: travelers and bookings by travel-date month (grouped)."""
    import numpy as np

    labels = [s["label"] for s in season]
    travelers = [s["travelers"] for s in season]
    bookings = [s["bookings"] for s in season]
    x = np.arange(len(labels))
    width = 0.38

    fig = Figure(figsize=(5.6, 3.6))
    ax = fig.add_subplot(111)
    ax.bar(x - width / 2, travelers, width, label="Travelers", color=PRIMARY)
    ax.bar(x + width / 2, bookings, width, label="Bookings", color=ACCENT)
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.yaxis.set_major_locator(MaxNLocator(integer=True))
    _style_axes(ax)
    ax.legend(loc="upper right", frameon=False, fontsize=9)
    return _to_data_uri(fig)


def build_charts(
    revenue_trend: list[dict],
    status_breakdown: list[dict],
    top_packages: list[dict],
    destination_performance: list[dict],
    rating_distribution: list[dict],
    signups: list[dict],
    seasonality: list[dict],
) -> dict:
    """Render every dashboard chart and return a dict of data URIs."""
    return {
        "revenueTrend": revenue_trend_chart(revenue_trend),
        "statusBreakdown": status_pie_chart(status_breakdown),
        "topPackages": top_packages_chart(top_packages),
        "destinationPerformance": destination_chart(destination_performance),
        "ratingDistribution": rating_chart(rating_distribution),
        "signups": signups_chart(signups),
        "seasonality": seasonality_chart(seasonality),
    }
