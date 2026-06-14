"""
finnhub_source.py - Finnhub-backed data source (drop-in for scraper.py).

This adapter exists because the original StockTwits public endpoints are not
reachable from the hosted environment (network egress allowlist) and Finnhub
offers a free API key. It exposes the SAME interface the rest of the pipeline
expects from scraper.py -- scrape_all_trending() returning
{ticker: [mention dict, ...]} -- so signals.py / db.py / report.py are unchanged.

Data-shape caveats (be honest about these):
  * Finnhub has no "trending tickers" endpoint on the free tier, so this module
    scans a configurable watchlist (FINNHUB_WATCHLIST env var) instead.
  * The free tier exposes company news, not per-user social posts. Each news
    article is mapped to one "mention". News carries no follower counts or
    account ages, so user_followers / account_age_days are None -- which means
    the obscurity sub-score degrades toward its max. The /stock/social-sentiment
    endpoint (which would restore mention velocity) is premium; dry_run() probes
    whether this key can reach it.
  * Sentiment is not tagged by Finnhub, so it is inferred with a small keyword
    lexicon over each headline+summary.

The API key is read from the FINNHUB_API_KEY environment variable and is never
written to disk or committed.
"""

import os
import time
from datetime import datetime, timezone

import requests
from dateutil import parser as date_parser

BASE = "https://finnhub.io/api/v1"
REQUEST_DELAY_SECONDS = 2
REQUEST_TIMEOUT_SECONDS = 15

# Finnhub has no free "trending" feed; scan this watchlist instead. Override
# with a comma-separated FINNHUB_WATCHLIST env var.
DEFAULT_WATCHLIST = [
    "AAPL", "TSLA", "NVDA", "AMD", "AMZN",
    "MSFT", "META", "GOOGL", "GME", "PLTR",
]

# Tiny sentiment lexicon used to infer bullish/bearish from news text, since
# Finnhub does not tag sentiment on the free tier.
_BULL_WORDS = {
    "surge", "soar", "rally", "beat", "beats", "upgrade", "upgraded", "jump",
    "jumps", "gain", "gains", "record", "bullish", "outperform", "buy",
    "growth", "rises", "rise", "tops", "strong", "boom", "high",
}
_BEAR_WORDS = {
    "plunge", "plummet", "drop", "drops", "fall", "falls", "miss", "misses",
    "downgrade", "downgraded", "cut", "cuts", "bearish", "underperform",
    "sell", "weak", "slump", "loss", "losses", "sinks", "warning", "lawsuit",
}


def get_api_key():
    """
    Read the Finnhub API key from the environment.

    Inputs:  none
    Outputs: str API key, or None if FINNHUB_API_KEY is unset/empty.
    """
    key = os.environ.get("FINNHUB_API_KEY", "").strip()
    return key or None


def get_watchlist():
    """
    Resolve the list of tickers to scan.

    Inputs:  none (reads FINNHUB_WATCHLIST env var)
    Outputs: list of uppercased ticker strings; DEFAULT_WATCHLIST if unset.
    """
    raw = os.environ.get("FINNHUB_WATCHLIST", "").strip()
    if not raw:
        return list(DEFAULT_WATCHLIST)
    return [t.strip().upper() for t in raw.split(",") if t.strip()]


def _get_json(url, params):
    """
    Perform a GET request against Finnhub and return parsed JSON, or None.

    Inputs:
        url    - full endpoint URL (str)
        params - dict of query params (the token is added by the caller)
    Outputs: parsed JSON (dict/list) on HTTP 200, else None. Never raises.
             Prints the status (and a hint) on non-200 so allowlist/premium/
             rate-limit errors are visible.
    """
    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code != 200:
            hint = ""
            if resp.status_code == 403 and "allowlist" in resp.text:
                hint = " (host not allowlisted in this environment)"
            elif resp.status_code == 401:
                hint = " (bad/expired API key)"
            elif resp.status_code == 403:
                hint = " (premium endpoint not on free tier?)"
            elif resp.status_code == 429:
                hint = " (rate limit: 60 req/min on free tier)"
            print(f"[finnhub] {url} -> HTTP {resp.status_code}{hint}")
            return None
        return resp.json()
    except (requests.RequestException, ValueError) as exc:
        print(f"[finnhub] request failed for {url}: {exc}")
        return None


def _infer_sentiment(text):
    """
    Infer bullish/bearish/None from free text using the keyword lexicon.

    Inputs:  text - headline+summary string (may be empty/None)
    Outputs: "bullish", "bearish", or None when the text is neutral/empty.
             Only returns a tag when one side clearly outweighs the other, so
             sentiment_score still only counts confidently-tagged items.
    """
    if not text:
        return None
    words = {w.strip(".,!?:;\"'()").lower() for w in text.split()}
    bull = len(words & _BULL_WORDS)
    bear = len(words & _BEAR_WORDS)
    if bull > bear:
        return "bullish"
    if bear > bull:
        return "bearish"
    return None


def get_quote(ticker, key=None):
    """
    Fetch the current price for a ticker via Finnhub /quote (free tier).

    Inputs:
        ticker - ticker symbol (str)
        key    - API key; falls back to FINNHUB_API_KEY env var if None
    Outputs: float current price (the "c" field), or None on error/missing key.
    """
    key = key or get_api_key()
    if not key:
        print("[finnhub] no API key (set FINNHUB_API_KEY)")
        return None
    data = _get_json(f"{BASE}/quote", {"symbol": ticker, "token": key})
    if not data:
        return None
    price = data.get("c")
    # Finnhub returns c=0 for unknown symbols / no data.
    return float(price) if price else None


def get_company_news_mentions(ticker, key, days=7):
    """
    Fetch recent company news for a ticker and map each article to a mention.

    Inputs:
        ticker - ticker symbol (str)
        key    - API key (str)
        days   - how many days back to request (int)
    Outputs: list of mention dicts matching the mentions table columns. Empty
             list on error or when no news is returned.
    """
    today = datetime.now(timezone.utc).date()
    start = today.fromordinal(today.toordinal() - days)
    data = _get_json(
        f"{BASE}/company-news",
        {
            "symbol": ticker,
            "from": start.isoformat(),
            "to": today.isoformat(),
            "token": key,
        },
    )
    if not data or not isinstance(data, list):
        return []

    scraped_at = datetime.now(timezone.utc).isoformat()
    mentions = []
    for art in data:
        try:
            ts = art.get("datetime")
            if not ts or not art.get("id"):
                continue
            created_iso = datetime.fromtimestamp(
                ts, tz=timezone.utc
            ).isoformat()
            headline = art.get("headline") or ""
            summary = art.get("summary") or ""
            body = f"{headline}. {summary}".strip()
            mentions.append({
                "ticker": ticker,
                "message_id": art["id"],
                "scraped_at": scraped_at,
                "created_at": created_iso,
                "body": body,
                # News has no per-user identity; use the outlet as a stand-in.
                "user_id": None,
                "user_followers": None,
                "user_following": None,
                "account_age_days": None,
                "sentiment": _infer_sentiment(body),
            })
        except (ValueError, TypeError, KeyError) as exc:
            print(f"[finnhub] skipped article for {ticker}: {exc}")
    return mentions


def scrape_all_trending():
    """
    Scrape the watchlist's news into the {ticker: [mentions]} shape.

    Drop-in replacement for scraper.scrape_all_trending(). Reads the API key and
    watchlist from the environment.

    Inputs:  none
    Outputs: dict mapping ticker -> list of mention dicts. Tickers with no news
             are omitted. Empty dict if the key is missing.
    """
    key = get_api_key()
    if not key:
        print("[finnhub] no API key (set FINNHUB_API_KEY); skipping scrape")
        return {}

    result = {}
    for ticker in get_watchlist():
        mentions = get_company_news_mentions(ticker, key)
        if mentions:
            result[ticker] = mentions
        time.sleep(REQUEST_DELAY_SECONDS)  # stay under 60 req/min free tier
    return result


def dry_run():
    """
    Probe the Finnhub key/endpoints once and print what this account can reach.

    Confirms (a) the host is allowlisted, (b) the key is valid, (c) which
    endpoints the free tier unlocks (quote, company-news, social-sentiment).

    Inputs:  none (reads FINNHUB_API_KEY)
    Outputs: bool - True if at least the quote endpoint returned data.
    """
    print("=== Finnhub dry run ===")
    key = get_api_key()
    if not key:
        print("FAIL: FINNHUB_API_KEY is not set")
        return False

    ok_quote = False

    # 1) Quote (free) -- also our price source.
    price = get_quote("AAPL", key)
    if price:
        print(f"OK  quote: AAPL = {price}")
        ok_quote = True
    else:
        print("FAIL quote: no price (allowlist? bad key?)")

    # 2) Company news (free) -- our mention source.
    news = get_company_news_mentions("AAPL", key, days=3)
    print(f"{'OK ' if news else 'WARN'} company-news: {len(news)} article(s) "
          "mapped to mentions")
    if news:
        s = news[0]
        print(f"     sample: [{s['created_at']}] sentiment={s['sentiment']} "
              f"| {(s['body'] or '')[:70]}")

    # 3) Social sentiment (often premium) -- would restore mention velocity.
    social = _get_json(
        f"{BASE}/stock/social-sentiment",
        {"symbol": "AAPL", "token": key},
    )
    if social and (social.get("reddit") or social.get("twitter")):
        r = len(social.get("reddit") or [])
        t = len(social.get("twitter") or [])
        print(f"OK  social-sentiment: reddit={r} twitter={t} buckets "
              "(free on this key!)")
    else:
        print("WARN social-sentiment: unavailable (premium) -- using news")

    print("\n" + ("OK: Finnhub reachable" if ok_quote
                  else "FAIL: could not reach Finnhub"))
    return ok_quote
