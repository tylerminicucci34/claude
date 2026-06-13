"""
signals.py - velocity + scoring logic.

Given the stored mentions for a ticker, computes three sub-scores (velocity,
obscurity, sentiment) and a weighted composite score. Tickers that do not
clear the velocity gate or the composite threshold are not turned into signals.
"""

from datetime import datetime, timedelta, timezone

from dateutil import parser as date_parser

import db

# Tuning constants drawn directly from the spec.
VELOCITY_RATIO_GATE = 2.5      # raw 1h-vs-baseline ratio required to flag
OBSCURITY_FLOOR_FOLLOWERS = 100      # at/below this -> obscurity 100
OBSCURITY_CEIL_FOLLOWERS = 10000     # at/above this -> obscurity 0
YOUNG_ACCOUNT_DAYS = 180             # younger than this earns the age bonus
YOUNG_ACCOUNT_BONUS = 20
COMPOSITE_THRESHOLD = 60.0


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


def velocity_score(mentions_1h_count, mentions_24h_count):
    """
    Score how unusual the last hour's mention volume is vs the 24h baseline.

    Inputs:
        mentions_1h_count  - number of mentions in the last 1 hour (int)
        mentions_24h_count - number of mentions in the last 24 hours (int)
    Outputs: tuple (score, ratio, flagged) where
        score   - velocity score clamped to 0..100 (float)
        ratio   - raw mentions_1h / avg_hourly_24h (float)
        flagged - True if ratio exceeds the 2.5x gate (bool)
    Notes: avg_hourly_24h is the 24h count spread evenly over 24 hours. If the
           baseline is zero there is no meaningful ratio, so it is not flagged.
    """
    avg_hourly_24h = mentions_24h_count / 24.0
    if avg_hourly_24h <= 0:
        return 0.0, 0.0, False

    ratio = mentions_1h_count / avg_hourly_24h
    score = min(100.0, (ratio - 1) * 50.0)
    score = max(0.0, score)
    flagged = ratio > VELOCITY_RATIO_GATE
    return score, ratio, flagged


def _account_obscurity(followers, account_age_days):
    """
    Score a single account's obscurity from its follower count and age.

    Inputs:
        followers        - the account's follower count (int or None)
        account_age_days - account age in days (int or None)
    Outputs: float obscurity score in 0..100 for this one account
    Notes: followers below 100 score 100; the score falls linearly to 0 at
           10000 followers. Accounts younger than 180 days get a +20 bonus,
           capped at 100. Unknown follower counts are treated as 0 (maximally
           obscure) since a missing count usually means a tiny/new account.
    """
    f = followers if followers is not None else 0
    if f <= OBSCURITY_FLOOR_FOLLOWERS:
        base = 100.0
    elif f >= OBSCURITY_CEIL_FOLLOWERS:
        base = 0.0
    else:
        span = OBSCURITY_CEIL_FOLLOWERS - OBSCURITY_FLOOR_FOLLOWERS
        base = 100.0 * (OBSCURITY_CEIL_FOLLOWERS - f) / span

    if account_age_days is not None and account_age_days < YOUNG_ACCOUNT_DAYS:
        base += YOUNG_ACCOUNT_BONUS

    return min(100.0, max(0.0, base))


def obscurity_score(mentions_1h):
    """
    Average obscurity across all accounts mentioning in the last hour.

    Inputs:  mentions_1h - list of mention rows/dicts from the last 1h, each
                           with user_followers and account_age_days
    Outputs: float average obscurity score in 0..100 (0 if no mentions)
    """
    if not mentions_1h:
        return 0.0
    scores = [
        _account_obscurity(m["user_followers"], m["account_age_days"])
        for m in mentions_1h
    ]
    return sum(scores) / len(scores)


def sentiment_score(mentions_1h):
    """
    Score bullish vs bearish lean among tagged messages in the last hour.

    Inputs:  mentions_1h - list of mention rows/dicts from the last 1h, each
                           with a sentiment field ("bullish"/"bearish"/None)
    Outputs: float in 0..100: 50 when there are no tagged messages or the
             split is even, 100 when all tagged messages are bullish, 0 when
             all are bearish. Only messages with explicit tags are counted.
    """
    bullish = sum(1 for m in mentions_1h if m["sentiment"] == "bullish")
    bearish = sum(1 for m in mentions_1h if m["sentiment"] == "bearish")
    tagged = bullish + bearish
    if tagged == 0:
        return 50.0
    return 100.0 * bullish / tagged


def composite_score(vel, obs, sen):
    """
    Combine the three sub-scores into one weighted composite.

    Inputs:
        vel - velocity score (float)
        obs - obscurity score (float)
        sen - sentiment score (float)
    Outputs: float composite = vel*0.5 + obs*0.3 + sen*0.2
    """
    return (vel * 0.5) + (obs * 0.3) + (sen * 0.2)


def evaluate_ticker(conn, ticker, now=None):
    """
    Compute a signal for one ticker from its stored mentions, if it qualifies.

    Inputs:
        conn   - open sqlite3.Connection
        ticker - ticker symbol to evaluate (str)
        now    - optional reference datetime (defaults to UTC now), used so
                 the 1h/24h windows can be tested deterministically
    Outputs: dict ready for db.insert_signal (price/outcome fields None) if the
             ticker clears both the velocity gate and the composite threshold;
             otherwise None.
    """
    if now is None:
        now = datetime.now(timezone.utc)

    since_24h = (now - timedelta(hours=24)).isoformat()
    since_1h = (now - timedelta(hours=1)).isoformat()

    rows_24h = db.get_mentions_since(conn, ticker, since_24h)
    if not rows_24h:
        return None

    one_hour_ago = now - timedelta(hours=1)
    rows_1h = [
        r for r in rows_24h
        if (_parse_iso(r["created_at"]) or now) >= one_hour_ago
    ]

    count_1h = len(rows_1h)
    count_24h = len(rows_24h)

    vel, ratio, flagged = velocity_score(count_1h, count_24h)
    if not flagged:
        return None

    obs = obscurity_score(rows_1h)
    sen = sentiment_score(rows_1h)
    comp = composite_score(vel, obs, sen)

    if comp < COMPOSITE_THRESHOLD:
        return None

    return {
        "ticker": ticker,
        "detected_at": now.astimezone(timezone.utc).isoformat(),
        "mention_count_1h": count_1h,
        "mention_count_24h": count_24h,
        "velocity_score": round(vel, 2),
        "obscurity_score": round(obs, 2),
        "sentiment_score": round(sen, 2),
        "composite_score": round(comp, 2),
        "price_at_detection": None,
        "price_24h_later": None,
        "price_48h_later": None,
        "price_72h_later": None,
        "outcome": None,
    }
