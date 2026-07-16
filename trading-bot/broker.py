"""Alpaca REST wrapper (stdlib only) + a synthetic data source for offline
demo/backtesting without keys.

Paper vs live is decided by config.PAPER — see the safety note in config.py.
"""

import json
import random
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

import config

TRADE_BASE = ("https://paper-api.alpaca.markets" if config.PAPER
              else "https://api.alpaca.markets")
DATA_BASE = "https://data.alpaca.markets"


def _request(url, method="GET", body=None):
    req = urllib.request.Request(url, method=method, headers={
        "APCA-API-KEY-ID": config.ALPACA_KEY,
        "APCA-API-SECRET-KEY": config.ALPACA_SECRET,
        "Content-Type": "application/json",
    }, data=json.dumps(body).encode() if body else None)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def have_keys():
    return bool(config.ALPACA_KEY and config.ALPACA_SECRET)


# ---- account / orders ------------------------------------------------------

def get_account():
    return _request(f"{TRADE_BASE}/v2/account")


def get_equity():
    return float(get_account()["equity"])


def list_positions():
    return _request(f"{TRADE_BASE}/v2/positions")


def submit_order(symbol, qty, side):
    """Plain market order; stops are managed by the bot itself so the same
    logic works for stocks and crypto (Alpaca crypto lacks bracket orders)."""
    body = {
        "symbol": symbol.replace("/", ""),
        "qty": str(qty),
        "side": side,
        "type": "market",
        "time_in_force": "gtc" if "/" in symbol else "day",
    }
    return _request(f"{TRADE_BASE}/v2/orders", method="POST", body=body)


def market_open():
    try:
        return bool(_request(f"{TRADE_BASE}/v2/clock").get("is_open"))
    except Exception:
        return False


# ---- historical bars --------------------------------------------------------

def _parse_bars(raw):
    return [{"t": b["t"], "o": b["o"], "h": b["h"], "l": b["l"], "c": b["c"], "v": b["v"]}
            for b in raw]


def get_bars(symbol, timeframe, limit=300, start=None, end=None):
    """Recent bars, oldest first. 4Hour is aggregated from 1Hour (Alpaca has
    no native 4-hour timeframe)."""
    native_tf = "1Hour" if timeframe == "4Hour" else timeframe
    fetch_limit = limit * 4 if timeframe == "4Hour" else limit
    params = {"timeframe": native_tf, "limit": min(fetch_limit, 10000), "sort": "asc"}
    if start:
        params["start"] = start
    if end:
        params["end"] = end

    if "/" in symbol:  # crypto
        params["symbols"] = symbol
        url = f"{DATA_BASE}/v1beta3/crypto/us/bars?" + urllib.parse.urlencode(params)
        raw = _request(url).get("bars", {}).get(symbol, [])
    else:
        params["symbols"] = symbol
        params["feed"] = "iex"          # free feed
        params["adjustment"] = "split"
        url = f"{DATA_BASE}/v2/stocks/bars?" + urllib.parse.urlencode(params)
        raw = _request(url).get("bars", {}).get(symbol, [])

    bars = _parse_bars(raw)
    if timeframe == "4Hour":
        bars = aggregate(bars, 4)
    return bars[-limit:]


def aggregate(bars, n):
    out = []
    for i in range(0, len(bars) - len(bars) % n, n):
        chunk = bars[i:i + n]
        out.append({
            "t": chunk[0]["t"],
            "o": chunk[0]["o"],
            "h": max(b["h"] for b in chunk),
            "l": min(b["l"] for b in chunk),
            "c": chunk[-1]["c"],
            "v": sum(b["v"] for b in chunk),
        })
    return out


# ---- synthetic bars (offline demo — clearly not real market data) -----------

def synthetic_bars(symbol, timeframe, limit=300, seed=None):
    """Random-walk bars with drift + volatility clustering, deterministic per
    symbol so demo runs are repeatable. FOR DEMO/TESTING ONLY."""
    rng = random.Random(seed if seed is not None else hash(symbol) & 0xffff)
    base = {"SPY": 520, "QQQ": 470, "BTC/USD": 68000, "GLD": 220, "USO": 75}.get(symbol, 100)
    minutes = {"15Min": 15, "1Hour": 60, "4Hour": 240}.get(timeframe, 60)
    t = datetime.now(timezone.utc) - timedelta(minutes=minutes * limit)
    price, vol = base, 0.004
    bars = []
    for _ in range(limit):
        vol = max(0.001, min(0.02, vol + rng.gauss(0, 0.0006)))
        drift = rng.gauss(0.00005, 0)
        o = price
        c = o * (1 + rng.gauss(drift, vol))
        h = max(o, c) * (1 + abs(rng.gauss(0, vol / 2)))
        l = min(o, c) * (1 - abs(rng.gauss(0, vol / 2)))
        v = abs(rng.gauss(1_000_000, 400_000))
        bars.append({"t": t.isoformat(), "o": o, "h": h, "l": l, "c": c, "v": v})
        price = c
        t += timedelta(minutes=minutes)
    return bars


def fetch_bars(symbol, timeframe, limit=300, demo=False):
    if demo or not have_keys():
        return synthetic_bars(symbol, timeframe, limit)
    return get_bars(symbol, timeframe, limit)
