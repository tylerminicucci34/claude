"""The risk layer on top of every strategy — the part that keeps one bad
day from blowing up the account.

1. ATR-based position sizing: qty is chosen so a full stop-out loses
   exactly RISK_PCT of equity. Quiet market -> bigger position, wild
   market -> smaller one; risk stays constant across all five markets.
2. Hard stop on every trade, set at entry, never widened.
3. Trailing stop for momentum/trend positions (stop_atr x ATR off the
   best price since entry) — it only ever moves in your favor.
4. Correlation filter: SPY and QQQ both long? No new BTC long — that's
   one risk-on bet, not three.
"""

import config


def position_size(equity, atr_value, stop_atr, price):
    """Risk exactly RISK_PCT of equity if the stop (stop_atr x ATR) hits."""
    if not atr_value or atr_value <= 0 or price <= 0:
        return 0
    risk_dollars = equity * config.RISK_PCT
    stop_distance = stop_atr * atr_value
    qty = risk_dollars / stop_distance
    max_affordable = equity * 0.95 / price      # never exceed ~account size
    return round(min(qty, max_affordable), 6)


def initial_stop(side, entry_price, atr_value, stop_atr):
    d = stop_atr * atr_value
    return entry_price - d if side == "long" else entry_price + d


def update_trailing_stop(pos, bar, atr_value, stop_atr):
    """Ratchet the stop toward price as the trade works. Never loosens."""
    if pos["side"] == "long":
        pos["high_water"] = max(pos.get("high_water", pos["entry"]), bar["h"])
        candidate = pos["high_water"] - stop_atr * atr_value
        pos["stop"] = max(pos["stop"], candidate)
    else:
        pos["low_water"] = min(pos.get("low_water", pos["entry"]), bar["l"])
        candidate = pos["low_water"] + stop_atr * atr_value
        pos["stop"] = min(pos["stop"], candidate)
    return pos["stop"]


def stop_hit(pos, bar):
    if pos["side"] == "long":
        return bar["l"] <= pos["stop"]
    return bar["h"] >= pos["stop"]


def correlation_blocks_entry(symbol, side, open_positions):
    """PDF rule: SPY and QQQ both long -> no new BTC long."""
    if symbol == "BTC/USD" and side == "long":
        risk_on = sum(1 for s in ("SPY", "QQQ")
                      if open_positions.get(s, {}).get("side") == "long")
        if risk_on >= config.MAX_RISK_ON_LONGS:
            return "SPY and QQQ already long — one risk-on bet, not three"
    return None
