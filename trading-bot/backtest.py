#!/usr/bin/env python3
"""Backtest the 5-market system over historical bars.

  python3 backtest.py            real Alpaca history (needs free API keys)
  python3 backtest.py --demo     synthetic random-walk bars, no keys

The pass bar before even paper trading (per the playbook): positive total
return, Sharpe you believe, and a max drawdown you could sit through.
Synthetic-data results are for testing the plumbing, not judging the edge.
"""

import sys
from datetime import datetime, timedelta, timezone

import broker
import config
import risk
from indicators import atr
from strategies import STRATEGIES

START_EQUITY = 100_000.0
BARS = 2000        # per instrument


def run_symbol(symbol, cfg, bars):
    """Walk bars forward; risk sizing against a fixed notional equity so
    per-symbol results are comparable."""
    trades, pos = [], None
    warmup = max(cfg.get("ema_slow", 0), cfg.get("lookback", 0), config.ATR_PERIOD) + 2
    for i in range(warmup, len(bars)):
        window = bars[:i + 1]
        bar = window[-1]
        a = atr(window, config.ATR_PERIOD)
        if pos and a:
            risk.update_trailing_stop(pos, bar, a, cfg["stop_atr"])
            if risk.stop_hit(pos, bar):
                pnl = (pos["stop"] - pos["entry"]) * pos["qty"] * (1 if pos["side"] == "long" else -1)
                trades.append({"pnl": pnl, "exit": "stop"})
                pos = None
        sig = STRATEGIES[cfg["strategy"]](window, cfg, pos)
        if not sig:
            continue
        if sig["action"] == "exit" and pos:
            pnl = (bar["c"] - pos["entry"]) * pos["qty"] * (1 if pos["side"] == "long" else -1)
            trades.append({"pnl": pnl, "exit": "signal"})
            pos = None
        elif sig["action"] == "enter" and not pos and a:
            side = sig["side"]
            if side == "short" and (not config.ALLOW_SHORTS or cfg["kind"] == "crypto"):
                continue
            qty = risk.position_size(START_EQUITY, a, cfg["stop_atr"], bar["c"])
            if qty <= 0:
                continue
            pos = {"side": side, "qty": qty, "entry": bar["c"],
                   "stop": risk.initial_stop(side, bar["c"], a, cfg["stop_atr"]),
                   "high_water": bar["c"], "low_water": bar["c"]}
    if pos:  # mark open position to market at the end
        pnl = (bars[-1]["c"] - pos["entry"]) * pos["qty"] * (1 if pos["side"] == "long" else -1)
        trades.append({"pnl": pnl, "exit": "open@end"})
    return trades


def metrics(trades):
    if not trades:
        return {"trades": 0}
    pnls = [t["pnl"] for t in trades]
    total = sum(pnls)
    wins = [p for p in pnls if p > 0]
    equity, peak, max_dd = START_EQUITY, START_EQUITY, 0.0
    for p in pnls:
        equity += p
        peak = max(peak, equity)
        max_dd = max(max_dd, (peak - equity) / peak)
    mean = total / len(pnls)
    var = sum((p - mean) ** 2 for p in pnls) / len(pnls)
    sharpe_like = (mean / (var ** 0.5)) * (len(pnls) ** 0.5) if var > 0 else 0.0
    return {
        "trades": len(pnls),
        "total_pnl": round(total, 2),
        "return_pct": round(total / START_EQUITY * 100, 2),
        "win_rate": round(len(wins) / len(pnls) * 100, 1),
        "avg_trade": round(mean, 2),
        "max_drawdown_pct": round(max_dd * 100, 2),
        "sharpe_like": round(sharpe_like, 2),
    }


def main():
    demo = "--demo" in sys.argv or not broker.have_keys()
    if demo and "--demo" not in sys.argv:
        print("(no Alpaca keys found — falling back to --demo synthetic data)\n")
    print(f"Backtest — {'SYNTHETIC demo bars' if demo else 'Alpaca historical bars'}, "
          f"{BARS} bars per instrument, ${START_EQUITY:,.0f} notional, "
          f"{config.RISK_PCT*100:.0f}% risk per trade\n")

    grand = []
    start = (datetime.now(timezone.utc) - timedelta(days=365)).strftime("%Y-%m-%d")
    for symbol, cfg in config.INSTRUMENTS.items():
        try:
            bars = (broker.synthetic_bars(symbol, cfg["timeframe"], BARS) if demo
                    else broker.get_bars(symbol, cfg["timeframe"], limit=BARS, start=start))
        except Exception as e:
            print(f"{symbol:8s} data fetch failed: {e}")
            continue
        trades = run_symbol(symbol, cfg, bars)
        m = metrics(trades)
        grand.extend(trades)
        print(f"{symbol:8s} {cfg['strategy']:18s} bars={len(bars):5d} "
              f"trades={m.get('trades', 0):4d} pnl=${m.get('total_pnl', 0):>10,.2f} "
              f"win={m.get('win_rate', 0):5.1f}% maxDD={m.get('max_drawdown_pct', 0):5.2f}% "
              f"sharpe~{m.get('sharpe_like', 0):.2f}")

    print("\nPORTFOLIO " + "-" * 60)
    m = metrics(grand)
    for k, v in m.items():
        print(f"  {k:18s} {v}")
    print("\nPass bar: believable Sharpe, drawdown you could stomach, and enough "
          "trades to mean something. If it fails here, it does not go near money"
          + (" — and synthetic results only prove the code runs." if demo else "."))


if __name__ == "__main__":
    main()
