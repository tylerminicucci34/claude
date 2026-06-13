"""
db.py - SQLite schema + queries for the stock signal detector.

Owns the on-disk SQLite database that stores raw StockTwits mentions and the
derived signals. All timestamps are stored as ISO8601 UTC strings.
"""

import sqlite3
from datetime import datetime, timezone

DB_PATH = "signals.db"


def utc_now_iso():
    """
    Return the current time as an ISO8601 UTC string.

    Inputs:  none
    Outputs: str, e.g. "2026-06-13T12:34:56+00:00"
    """
    return datetime.now(timezone.utc).isoformat()


def get_connection(db_path=DB_PATH):
    """
    Open a SQLite connection with row access by column name.

    Inputs:  db_path - path to the SQLite file (str)
    Outputs: sqlite3.Connection with row_factory set to sqlite3.Row
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db(db_path=DB_PATH):
    """
    Create the mentions and signals tables if they do not already exist.

    Inputs:  db_path - path to the SQLite file (str)
    Outputs: none (side effect: schema created on disk)
    """
    conn = get_connection(db_path)
    try:
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS mentions (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker          TEXT NOT NULL,
                message_id      INTEGER NOT NULL UNIQUE,
                scraped_at      TEXT NOT NULL,
                created_at      TEXT NOT NULL,
                body            TEXT,
                user_id         INTEGER,
                user_followers  INTEGER,
                user_following  INTEGER,
                account_age_days INTEGER,
                sentiment       TEXT
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS signals (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                ticker              TEXT NOT NULL,
                detected_at         TEXT NOT NULL,
                mention_count_1h    INTEGER,
                mention_count_24h   INTEGER,
                velocity_score      REAL,
                obscurity_score     REAL,
                sentiment_score     REAL,
                composite_score     REAL,
                price_at_detection  REAL,
                price_24h_later     REAL,
                price_48h_later     REAL,
                price_72h_later     REAL,
                outcome             TEXT
            )
            """
        )
        # Indexes that speed up the common lookups in signals.py.
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_mentions_ticker_created "
            "ON mentions (ticker, created_at)"
        )
        cur.execute(
            "CREATE INDEX IF NOT EXISTS idx_signals_score "
            "ON signals (composite_score)"
        )
        conn.commit()
    finally:
        conn.close()


def insert_mention(conn, mention):
    """
    Insert a single mention row, ignoring duplicates by message_id.

    Inputs:
        conn    - open sqlite3.Connection
        mention - dict with keys matching the mentions table columns
                  (ticker, message_id, scraped_at, created_at, body,
                   user_id, user_followers, user_following,
                   account_age_days, sentiment)
    Outputs: bool - True if a new row was inserted, False if it was a duplicate
    """
    cur = conn.cursor()
    cur.execute(
        """
        INSERT OR IGNORE INTO mentions
            (ticker, message_id, scraped_at, created_at, body, user_id,
             user_followers, user_following, account_age_days, sentiment)
        VALUES (:ticker, :message_id, :scraped_at, :created_at, :body,
                :user_id, :user_followers, :user_following,
                :account_age_days, :sentiment)
        """,
        mention,
    )
    return cur.rowcount > 0


def get_mentions_since(conn, ticker, since_iso):
    """
    Fetch all mentions for a ticker created at or after a cutoff time.

    Inputs:
        conn      - open sqlite3.Connection
        ticker    - ticker symbol (str)
        since_iso - ISO8601 UTC cutoff string; only mentions with
                    created_at >= this value are returned
    Outputs: list of sqlite3.Row for the matching mentions
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT * FROM mentions
        WHERE ticker = ? AND created_at >= ?
        ORDER BY created_at ASC
        """,
        (ticker, since_iso),
    )
    return cur.fetchall()


def insert_signal(conn, signal):
    """
    Insert a computed signal row into the signals table.

    Inputs:
        conn   - open sqlite3.Connection
        signal - dict with keys matching the signals table columns. The
                 price_*_later and outcome fields may be None at insert time.
    Outputs: int - the new signal row id
    """
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO signals
            (ticker, detected_at, mention_count_1h, mention_count_24h,
             velocity_score, obscurity_score, sentiment_score,
             composite_score, price_at_detection, price_24h_later,
             price_48h_later, price_72h_later, outcome)
        VALUES (:ticker, :detected_at, :mention_count_1h, :mention_count_24h,
                :velocity_score, :obscurity_score, :sentiment_score,
                :composite_score, :price_at_detection, :price_24h_later,
                :price_48h_later, :price_72h_later, :outcome)
        """,
        signal,
    )
    conn.commit()
    return cur.lastrowid


def get_signals_needing_backfill(conn):
    """
    Find signals that still have at least one unfilled future price column.

    Inputs:  conn - open sqlite3.Connection
    Outputs: list of sqlite3.Row for signals where price_24h_later,
             price_48h_later, or price_72h_later is NULL
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT * FROM signals
        WHERE price_24h_later IS NULL
           OR price_48h_later IS NULL
           OR price_72h_later IS NULL
        ORDER BY detected_at ASC
        """
    )
    return cur.fetchall()


def update_signal_prices(conn, signal_id, fields):
    """
    Update a subset of the price/outcome columns for one signal.

    Inputs:
        conn      - open sqlite3.Connection
        signal_id - id of the signal row to update (int)
        fields    - dict mapping column name -> value. Only the keys
                    price_24h_later, price_48h_later, price_72h_later and
                    outcome are honored.
    Outputs: none (side effect: row updated and committed)
    """
    allowed = {
        "price_24h_later",
        "price_48h_later",
        "price_72h_later",
        "outcome",
    }
    updates = {k: v for k, v in fields.items() if k in allowed}
    if not updates:
        return
    set_clause = ", ".join(f"{col} = :{col}" for col in updates)
    params = dict(updates)
    params["signal_id"] = signal_id
    conn.execute(
        f"UPDATE signals SET {set_clause} WHERE id = :signal_id",
        params,
    )
    conn.commit()


def get_signals_detected_since(conn, since_iso):
    """
    Fetch signals detected at or after a given time, newest first.

    Inputs:
        conn      - open sqlite3.Connection
        since_iso - ISO8601 UTC cutoff string
    Outputs: list of sqlite3.Row
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT * FROM signals
        WHERE detected_at >= ?
        ORDER BY detected_at DESC
        """,
        (since_iso,),
    )
    return cur.fetchall()


def get_top_signals(conn, limit=10):
    """
    Fetch the highest composite-score signals of all time.

    Inputs:
        conn  - open sqlite3.Connection
        limit - maximum number of rows to return (int)
    Outputs: list of sqlite3.Row ordered by composite_score descending
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT * FROM signals
        ORDER BY composite_score DESC
        LIMIT ?
        """,
        (limit,),
    )
    return cur.fetchall()


def get_outcome_stats(conn):
    """
    Aggregate win/loss/flat counts and average composite scores.

    Inputs:  conn - open sqlite3.Connection
    Outputs: dict with keys:
        wins, losses, flats        - counts of each outcome (int)
        total_resolved             - wins + losses + flats (int)
        win_rate                   - wins / total_resolved, or 0.0 (float)
        avg_score_wins             - mean composite_score of wins (float|None)
        avg_score_losses           - mean composite_score of losses (float|None)
    """
    cur = conn.cursor()
    cur.execute(
        """
        SELECT outcome,
               COUNT(*)            AS n,
               AVG(composite_score) AS avg_score
        FROM signals
        WHERE outcome IS NOT NULL
        GROUP BY outcome
        """
    )
    stats = {
        "wins": 0,
        "losses": 0,
        "flats": 0,
        "avg_score_wins": None,
        "avg_score_losses": None,
    }
    for row in cur.fetchall():
        if row["outcome"] == "win":
            stats["wins"] = row["n"]
            stats["avg_score_wins"] = row["avg_score"]
        elif row["outcome"] == "loss":
            stats["losses"] = row["n"]
            stats["avg_score_losses"] = row["avg_score"]
        elif row["outcome"] == "flat":
            stats["flats"] = row["n"]

    total = stats["wins"] + stats["losses"] + stats["flats"]
    stats["total_resolved"] = total
    stats["win_rate"] = (stats["wins"] / total) if total else 0.0
    return stats
