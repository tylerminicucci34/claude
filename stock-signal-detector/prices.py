"""
prices.py - yfinance price fetcher and backfiller.

Provides the spot price at signal-detection time and, after enough time has
elapsed, fills in the 24h/48h/72h follow-up prices so each signal's outcome
(win/loss/flat) can be graded for backtesting.
"""

from datetime import datetime, timedelta, timezone

from dateutil import parser as date_parser

import db

try:
    import yfinance as yf
except ImportError:  # pragma: no cover - dependency missing
    yf = None

# Outcome thresholds: +3% within 72h is a win, -3% is a loss, else flat.
WIN_THRESHOLD = 1.03
LOSS_THRESHOLD = 0.97

# How long to wait past each milestone before we trust the data point. Markets
# are closed overnight/weekends, so we give a generous window before backfill.
BACKFILL_GRACE = timedelta(hours=2)


def _parse_iso(ts):
    """
    Parse an ISO8601 string into a timezone-aware UTC datetime.

    Inputs:  ts - ISO8601 string
    Outputs: datetime in UTC, or None if ts is missing/unparsable
    """
    if not ts:
        return None
    try:
        dt = date_parser.parse(ts)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except (ValueError, TypeError):
        return None


def get_current_price(ticker):
    """
    Fetch the latest available price for a ticker.

    Inputs:  ticker - ticker symbol (str)
    Outputs: float last close price, or None if unavailable/on error.
             Never raises.
    """
    if yf is None:
        print("[prices] yfinance not installed")
        return None
    try:
        hist = yf.Ticker(ticker).history(period="1d")
        if hist is None or hist.empty:
            return None
        return float(hist["Close"].iloc[-1])
    except Exception as exc:  # yfinance raises a variety of errors
        print(f"[prices] current price failed for {ticker}: {exc}")
        return None


def get_price_at(ticker, target_dt):
    """
    Fetch the price closest to a target datetime in the past.

    Inputs:
        ticker    - ticker symbol (str)
        target_dt - timezone-aware datetime to price at
    Outputs: float price of the closest available bar, or None on error / if no
             data covers that time. Never raises.
    Notes: uses hourly bars when the target is recent enough for yfinance to
           serve intraday data, otherwise falls back to daily bars.
    """
    if yf is None:
        print("[prices] yfinance not installed")
        return None
    try:
        now = datetime.now(timezone.utc)
        age_days = (now - target_dt).days

        # yfinance only serves intraday history for the last ~730 days, and
        # 1h granularity for the last ~730 days too; for our short horizons a
        # daily fallback is plenty when intraday is empty.
        interval = "1h" if age_days <= 700 else "1d"
        start = (target_dt - timedelta(days=2)).date()
        end = (target_dt + timedelta(days=2)).date()

        hist = yf.Ticker(ticker).history(
            start=start.isoformat(),
            end=end.isoformat(),
            interval=interval,
        )
        if hist is None or hist.empty:
            # Retry once with daily bars in case intraday was unavailable.
            hist = yf.Ticker(ticker).history(
                start=start.isoformat(),
                end=end.isoformat(),
                interval="1d",
            )
        if hist is None or hist.empty:
            return None

        # Find the bar whose timestamp is closest to the target.
        closest_price = None
        closest_delta = None
        for ts, row in hist.iterrows():
            bar_dt = ts.to_pydatetime()
            if bar_dt.tzinfo is None:
                bar_dt = bar_dt.replace(tzinfo=timezone.utc)
            delta = abs((bar_dt - target_dt).total_seconds())
            if closest_delta is None or delta < closest_delta:
                closest_delta = delta
                closest_price = float(row["Close"])
        return closest_price
    except Exception as exc:
        print(f"[prices] historical price failed for {ticker}: {exc}")
        return None


def grade_outcome(price_at_detection, price_72h_later):
    """
    Classify a signal's result from its entry and 72h price.

    Inputs:
        price_at_detection - price when the signal fired (float)
        price_72h_later    - price 72h later (float)
    Outputs: 'win' if up >3%, 'loss' if down >3%, else 'flat'. Returns None if
             either price is missing/non-positive.
    """
    if not price_at_detection or not price_72h_later:
        return None
    if price_at_detection <= 0:
        return None
    if price_72h_later > price_at_detection * WIN_THRESHOLD:
        return "win"
    if price_72h_later < price_at_detection * LOSS_THRESHOLD:
        return "loss"
    return "flat"


def backfill_prices(conn, now=None):
    """
    Fill in any due 24h/48h/72h prices and grade outcomes for open signals.

    Inputs:
        conn - open sqlite3.Connection
        now  - optional reference datetime (defaults to UTC now)
    Outputs: int - number of signals updated this pass.
    Behavior: for every signal with a NULL future-price column whose milestone
              time (plus a grace period) has passed, fetch the price and store
              it. Once the 72h price is known, compute and store the outcome.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    milestones = (
        ("price_24h_later", 24),
        ("price_48h_later", 48),
        ("price_72h_later", 72),
    )

    updated = 0
    for sig in db.get_signals_needing_backfill(conn):
        detected = _parse_iso(sig["detected_at"])
        if detected is None:
            continue

        fields = {}
        for column, hours in milestones:
            if sig[column] is not None:
                continue  # already filled
            target = detected + timedelta(hours=hours)
            if now < target + BACKFILL_GRACE:
                continue  # milestone hasn't matured yet
            price = get_price_at(sig["ticker"], target)
            if price is not None:
                fields[column] = price

        if not fields:
            continue

        # Determine the 72h price we will end up with (existing or new) so we
        # can grade the outcome in the same update when it's available.
        price_72h = fields.get("price_72h_later", sig["price_72h_later"])
        if price_72h is not None and sig["outcome"] is None:
            outcome = grade_outcome(sig["price_at_detection"], price_72h)
            if outcome is not None:
                fields["outcome"] = outcome

        db.update_signal_prices(conn, sig["id"], fields)
        updated += 1

    return updated
