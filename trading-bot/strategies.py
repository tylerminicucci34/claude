"""The three strategy modules. Each takes (bars, cfg, position) and returns
a signal dict or None.

Signals:
  {"action": "enter", "side": "long"|"short", "reason": str}
  {"action": "exit", "reason": str}

`position` is the bot's open-position record for the symbol (or None):
  {"side", "qty", "entry", "stop", "high_water", "low_water"}

Each market gets its own game (per the playbook): indices snap back,
crypto trends hard, commodities move in slow waves.
"""

from indicators import sma, zscore, ema_series, atr


def mean_reversion(bars, cfg, position):
    """SPY/QQQ 15-min: price stretches beyond entry_z sigma from the
    20-period average -> fade it; exit at the mean."""
    closes = [b["c"] for b in bars]
    z = zscore(closes, cfg["lookback"])
    mean = sma(closes, cfg["lookback"])
    if z is None:
        return None
    if position:
        if position["side"] == "long" and closes[-1] >= mean:
            return {"action": "exit", "reason": f"reverted to mean ({mean:.2f})"}
        if position["side"] == "short" and closes[-1] <= mean:
            return {"action": "exit", "reason": f"reverted to mean ({mean:.2f})"}
        return None
    if z <= -cfg["entry_z"]:
        return {"action": "enter", "side": "long",
                "reason": f"z={z:.2f} (below -{cfg['entry_z']}σ), fading the stretch"}
    if z >= cfg["entry_z"]:
        return {"action": "enter", "side": "short",
                "reason": f"z={z:.2f} (above +{cfg['entry_z']}σ), fading the stretch"}
    return None


def momentum_breakout(bars, cfg, position):
    """BTC 1-hour: break of the 20-period high on 1.5x average volume ->
    ride it with a trailing stop (handled by the risk layer). Long-only on
    spot crypto; a breakdown exits."""
    if len(bars) < cfg["lookback"] + 2:
        return None
    window = bars[-(cfg["lookback"] + 1):-1]          # exclude current bar
    hi = max(b["h"] for b in window)
    lo = min(b["l"] for b in window)
    avg_vol = sum(b["v"] for b in window) / len(window)
    cur = bars[-1]
    if position:
        if cur["c"] < lo:
            return {"action": "exit", "reason": f"breakdown below 20-bar low ({lo:.2f})"}
        return None
    if cur["c"] > hi and avg_vol > 0 and cur["v"] >= cfg["volume_mult"] * avg_vol:
        return {"action": "enter", "side": "long",
                "reason": f"breakout above {hi:.2f} on {cur['v']/avg_vol:.1f}x volume"}
    return None


def trend_follow(bars, cfg, position):
    """GLD/USO 4-hour: 50/200 EMA crossover -> long above, exit (or short)
    below. Trailing stop handled by the risk layer."""
    closes = [b["c"] for b in bars]
    fast = ema_series(closes, cfg["ema_fast"])
    slow = ema_series(closes, cfg["ema_slow"])
    if slow[-1] is None or fast[-1] is None or slow[-2] is None or fast[-2] is None:
        return None
    golden_now = fast[-1] > slow[-1]
    golden_prev = fast[-2] > slow[-2]
    if position:
        if position["side"] == "long" and not golden_now:
            return {"action": "exit", "reason": "50 EMA crossed below 200 EMA"}
        if position["side"] == "short" and golden_now:
            return {"action": "exit", "reason": "50 EMA crossed above 200 EMA"}
        return None
    if golden_now and not golden_prev:
        return {"action": "enter", "side": "long", "reason": "golden cross (50 EMA over 200)"}
    if not golden_now and golden_prev:
        return {"action": "enter", "side": "short", "reason": "death cross (50 EMA under 200)"}
    return None


STRATEGIES = {
    "mean_reversion": mean_reversion,
    "momentum_breakout": momentum_breakout,
    "trend_follow": trend_follow,
}
