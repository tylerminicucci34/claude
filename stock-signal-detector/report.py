"""
report.py - terminal output formatter.

Renders the post-scan summary using only the standard library: a header, a
table of newly detected signals, a table of the all-time top signals with
their graded outcomes, and running accuracy statistics. Tables are plain ASCII.
"""

from datetime import datetime, timezone

import db


def _fmt(value, spec="{}"):
    """
    Format a possibly-None value for table display.

    Inputs:
        value - the value to format (any, may be None)
        spec  - a str.format spec applied when value is not None
    Outputs: str - the formatted value, or "-" when value is None
    """
    if value is None:
        return "-"
    try:
        return spec.format(value)
    except (ValueError, TypeError):
        return str(value)


def _render_table(headers, rows):
    """
    Build a plain ASCII table from headers and string rows.

    Inputs:
        headers - list of column header strings
        rows    - list of rows, each a list of cell strings (same length as
                  headers)
    Outputs: str - the full table (including a trailing newline), or a short
             "(none)" line if there are no rows.
    """
    if not rows:
        return "  (none)\n"

    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(str(cell)))

    def line(cells):
        return "| " + " | ".join(
            str(c).ljust(widths[i]) for i, c in enumerate(cells)
        ) + " |"

    sep = "+" + "+".join("-" * (w + 2) for w in widths) + "+"

    out = [sep, line(headers), sep]
    for row in rows:
        out.append(line(row))
    out.append(sep)
    return "\n".join(out) + "\n"


def _signal_row(sig):
    """
    Convert a signal row into a list of display cells for the tables.

    Inputs:  sig - sqlite3.Row from the signals table
    Outputs: list of formatted string cells
    """
    return [
        sig["ticker"],
        _fmt(sig["composite_score"], "{:.1f}"),
        _fmt(sig["velocity_score"], "{:.1f}"),
        _fmt(sig["obscurity_score"], "{:.1f}"),
        _fmt(sig["sentiment_score"], "{:.1f}"),
        _fmt(sig["mention_count_1h"]),
        _fmt(sig["price_at_detection"], "{:.2f}"),
        _fmt(sig["price_72h_later"], "{:.2f}"),
        _fmt(sig["outcome"]),
    ]


SIGNAL_HEADERS = [
    "TICKER", "COMP", "VEL", "OBS", "SENT",
    "M/1h", "PX@DET", "PX+72h", "OUTCOME",
]


def render_report(conn, scan_count, new_signals, now=None):
    """
    Build the full terminal report string for one scan.

    Inputs:
        conn        - open sqlite3.Connection
        scan_count  - 1-based index of the current scan (int)
        new_signals - list of signal dicts saved during this scan
        now         - optional reference datetime (defaults to UTC now)
    Outputs: str - the complete multi-section report ready to print
    """
    if now is None:
        now = datetime.now(timezone.utc)

    lines = []
    lines.append("=" * 70)
    lines.append(
        f" STOCK SENTIMENT SIGNAL DETECTOR  |  scan #{scan_count}  |  "
        f"{now.isoformat()}"
    )
    lines.append("=" * 70)

    # New signals this scan.
    lines.append("")
    lines.append(f"NEW SIGNALS THIS SCAN ({len(new_signals)}):")
    new_rows = [_signal_row(s) for s in new_signals]
    lines.append(_render_table(SIGNAL_HEADERS, new_rows))

    # Top 10 all-time by composite score.
    lines.append("TOP 10 ALL-TIME SIGNALS (by composite score):")
    top = db.get_top_signals(conn, limit=10)
    top_rows = [_signal_row(s) for s in top]
    lines.append(_render_table(SIGNAL_HEADERS, top_rows))

    # Running accuracy stats.
    stats = db.get_outcome_stats(conn)
    lines.append("RUNNING ACCURACY:")
    lines.append(
        f"  resolved={stats['total_resolved']}  "
        f"wins={stats['wins']}  losses={stats['losses']}  "
        f"flats={stats['flats']}"
    )
    lines.append(f"  win rate: {stats['win_rate'] * 100:.1f}%")
    lines.append(
        "  avg composite | wins: "
        f"{_fmt(stats['avg_score_wins'], '{:.1f}')}  "
        f"losses: {_fmt(stats['avg_score_losses'], '{:.1f}')}"
    )
    lines.append("")

    return "\n".join(lines)


def print_report(conn, scan_count, new_signals, now=None):
    """
    Render and print the report to stdout.

    Inputs:
        conn        - open sqlite3.Connection
        scan_count  - 1-based index of the current scan (int)
        new_signals - list of signal dicts saved during this scan
        now         - optional reference datetime (defaults to UTC now)
    Outputs: none (side effect: prints to stdout)
    """
    print(render_report(conn, scan_count, new_signals, now))
