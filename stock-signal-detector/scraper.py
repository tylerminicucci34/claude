"""
scraper.py - StockTwits public API calls.

Pulls the trending symbols list and the message stream for each trending
ticker, normalizing each message into a flat dict ready for the mentions
table. No authentication is required for these public endpoints; a 2 second
delay is inserted between calls to stay under the ~200 req/hour rate limit.
"""

import time
from datetime import datetime, timezone

import requests
from dateutil import parser as date_parser

TRENDING_URL = "https://api.stocktwits.com/api/2/trending/symbols.json"
STREAM_URL = "https://api.stocktwits.com/api/2/streams/symbol/{ticker}.json"

REQUEST_DELAY_SECONDS = 2
REQUEST_TIMEOUT_SECONDS = 15
USER_AGENT = "stock-signal-detector/1.0 (research)"


def _get_json(url):
    """
    Perform a GET request and return parsed JSON, or None on any error.

    Inputs:  url - the URL to fetch (str)
    Outputs: dict/list parsed JSON on success, or None if the request failed
             or returned a non-200 status. Never raises.
    """
    try:
        resp = requests.get(
            url,
            headers={"User-Agent": USER_AGENT},
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        if resp.status_code != 200:
            print(f"[scraper] {url} returned HTTP {resp.status_code}")
            return None
        return resp.json()
    except (requests.RequestException, ValueError) as exc:
        print(f"[scraper] request failed for {url}: {exc}")
        return None


def get_trending_tickers():
    """
    Fetch the list of currently trending StockTwits ticker symbols.

    Inputs:  none
    Outputs: list of ticker symbol strings (possibly empty on error)
    """
    data = _get_json(TRENDING_URL)
    time.sleep(REQUEST_DELAY_SECONDS)
    if not data:
        return []
    symbols = data.get("symbols", [])
    return [s.get("symbol") for s in symbols if s.get("symbol")]


def _account_age_days(join_date_str, now=None):
    """
    Compute how many days old an account is from its join date.

    Inputs:
        join_date_str - the user's join_date as returned by StockTwits,
                        which may be a date string or None
        now           - optional reference datetime (defaults to UTC now)
    Outputs: int number of days, or None if join_date_str is missing/unparsable
    """
    if not join_date_str:
        return None
    if now is None:
        now = datetime.now(timezone.utc)
    try:
        joined = date_parser.parse(join_date_str)
        if joined.tzinfo is None:
            joined = joined.replace(tzinfo=timezone.utc)
        return max(0, (now - joined).days)
    except (ValueError, TypeError, OverflowError):
        return None


def _normalize_message(ticker, msg, scraped_at):
    """
    Convert one raw StockTwits message into a flat mention dict.

    Inputs:
        ticker     - the ticker this stream belongs to (str)
        msg        - one message dict from the StockTwits stream response
        scraped_at - ISO8601 UTC string for when we scraped it
    Outputs: dict matching the mentions table columns, or None if the message
             is malformed (missing id/user/created_at)
    """
    try:
        user = msg.get("user", {}) or {}
        created_raw = msg.get("created_at")
        if not msg.get("id") or not created_raw:
            return None

        # Normalize created_at to ISO8601 UTC.
        created_dt = date_parser.parse(created_raw)
        if created_dt.tzinfo is None:
            created_dt = created_dt.replace(tzinfo=timezone.utc)
        created_iso = created_dt.astimezone(timezone.utc).isoformat()

        # Sentiment is only present when the author tagged the message.
        sentiment = None
        entities = msg.get("entities") or {}
        basic = entities.get("sentiment") or {}
        if isinstance(basic, dict):
            sentiment = basic.get("basic")  # "Bullish" / "Bearish"
        if sentiment:
            sentiment = sentiment.lower()

        return {
            "ticker": ticker,
            "message_id": msg["id"],
            "scraped_at": scraped_at,
            "created_at": created_iso,
            "body": msg.get("body"),
            "user_id": user.get("id"),
            "user_followers": user.get("followers"),
            "user_following": user.get("following"),
            "account_age_days": _account_age_days(user.get("join_date")),
            "sentiment": sentiment,
        }
    except (ValueError, TypeError, KeyError) as exc:
        print(f"[scraper] failed to normalize message for {ticker}: {exc}")
        return None


def get_ticker_messages(ticker):
    """
    Fetch and normalize the recent message stream for one ticker.

    Inputs:  ticker - the ticker symbol to fetch (str)
    Outputs: list of normalized mention dicts. Returns an empty list if the
             API returns no data or errors out (skipped silently upstream).
    """
    url = STREAM_URL.format(ticker=ticker)
    data = _get_json(url)
    time.sleep(REQUEST_DELAY_SECONDS)
    if not data:
        return []

    messages = data.get("messages") or []
    scraped_at = datetime.now(timezone.utc).isoformat()
    mentions = []
    for msg in messages:
        norm = _normalize_message(ticker, msg, scraped_at)
        if norm:
            mentions.append(norm)
    return mentions


def scrape_all_trending():
    """
    Scrape every trending ticker's message stream in one pass.

    Inputs:  none
    Outputs: dict mapping ticker symbol -> list of normalized mention dicts.
             Tickers that return no data are omitted.
    """
    result = {}
    tickers = get_trending_tickers()
    print(f"[scraper] {len(tickers)} trending tickers found")
    for ticker in tickers:
        mentions = get_ticker_messages(ticker)
        if mentions:
            result[ticker] = mentions
    return result
