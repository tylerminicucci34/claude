#!/usr/bin/env python3
"""The trading bot: 5 markets, 3 strategies, 1 risk rule.

Usage:
  python3 bot.py                 one pass over all 5 markets (cron-friendly)
  python3 bot.py --loop          run forever, one pass every 15 minutes
  python3 bot.py --demo          one pass on synthetic data, no keys/orders
                                 (writes state/ so the dashboard has data)

PAPER account by default — see config.py for the live-trading interlock.
Educational tool; not financial advice.
"""

import csv
import json
import os
import sys
import time
from datetime import datetime, timezone

import broker
import config
import risk
from indicators import atr
from strategies import STRATEGIES


def load_positions():
    try:
        with open(config.STATE_FILE, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def save_positions(positions):
    os.makedirs(config.STATE_DIR, exist_ok=True)
    with open(config.STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(positions, f, indent=2)


def log_trade(row):
    os.makedirs(config.STATE_DIR, exist_ok=True)
    new = not os.path.exists(config.TRADES_FILE)
    with open(config.TRADES_FILE, "a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["time", "symbol", "action", "side", "qty", "price", "reason", "pnl"])
        w.writerow(row)


def write_status(equity, positions, events, demo):
    os.makedirs(config.STATE_DIR, exist_ok=True)
    recent = []
    try:
        with open(config.TRADES_FILE, encoding="utf-8") as f:
            recent = list(csv.DictReader(f))[-15:]
    except Exception:
        pass
    with open(config.STATUS_FILE, "w", encoding="utf-8") as f:
        json.dump({
            "updated_utc": datetime.now(timezone.utc).isoformat(),
            "mode": "DEMO (synthetic data)" if demo else ("PAPER" if config.PAPER else "LIVE"),
            "equity": equity,
            "positions": positions,
            "last_run_events": events,
            "recent_trades": recent,
        }, f, indent=2)


def close_position(symbol, pos, price, reason, demo, events):
    side = "sell" if pos["side"] == "long" else "buy"
    if not demo:
        broker.submit_order(symbol, pos["qty"], side)
    pnl = (price - pos["entry"]) * pos["qty"] * (1 if pos["side"] == "long" else -1)
    log_trade([datetime.now(timezone.utc).isoformat(), symbol, "exit", pos["side"],
               pos["qty"], round(price, 4), reason, round(pnl, 2)])
    events.append(f"EXIT {symbol} {pos['side']} @ {price:.2f} — {reason} (P&L {pnl:+.2f})")


def run_once(demo=False):
    events = []
    positions = load_positions()

    if demo:
        equity = 100_000.0
    else:
        if not broker.have_keys():
            print("No ALPACA_KEY/ALPACA_SECRET set. Run with --demo, or export keys "
                  "from a (free) Alpaca paper account: https://alpaca.markets")
            sys.exit(1)
        equity = broker.get_equity()
        events.append(f"account equity ${equity:,.2f} ({'PAPER' if config.PAPER else 'LIVE'})")

    stocks_open = True if demo else broker.market_open()

    for symbol, cfg in config.INSTRUMENTS.items():
        if cfg["kind"] == "stock" and not stocks_open:
            events.append(f"{symbol}: market closed, skipped")
            continue
        try:
            bars = broker.fetch_bars(symbol, cfg["timeframe"], limit=300, demo=demo)
        except Exception as e:
            events.append(f"{symbol}: data fetch failed ({e})")
            continue
        if len(bars) < 30:
            events.append(f"{symbol}: not enough bars ({len(bars)})")
            continue

        a = atr(bars, config.ATR_PERIOD)
        price = bars[-1]["c"]
        pos = positions.get(symbol)

        # 1) risk layer first: trailing stop ratchet + stop-out check
        if pos and a:
            risk.update_trailing_stop(pos, bars[-1], a, cfg["stop_atr"])
            if risk.stop_hit(pos, bars[-1]):
                close_position(symbol, pos, pos["stop"], "stop hit", demo, events)
                del positions[symbol]
                pos = None

        # 2) strategy signal
        sig = STRATEGIES[cfg["strategy"]](bars, cfg, pos)
        if not sig:
            continue

        if sig["action"] == "exit" and pos:
            close_position(symbol, pos, price, sig["reason"], demo, events)
            del positions[symbol]

        elif sig["action"] == "enter" and not pos:
            side = sig["side"]
            if side == "short" and (not config.ALLOW_SHORTS or cfg["kind"] == "crypto"):
                continue
            block = risk.correlation_blocks_entry(symbol, side, positions)
            if block:
                events.append(f"{symbol}: entry blocked — {block}")
                continue
            qty = risk.position_size(equity, a, cfg["stop_atr"], price)
            if qty <= 0:
                continue
            if cfg["kind"] == "stock":
                qty = max(1, int(qty))    # whole shares for stocks
            if not demo:
                broker.submit_order(symbol, qty, "buy" if side == "long" else "sell")
            stop = risk.initial_stop(side, price, a, cfg["stop_atr"])
            positions[symbol] = {
                "side": side, "qty": qty, "entry": price, "stop": stop,
                "high_water": price, "low_water": price,
                "opened_utc": datetime.now(timezone.utc).isoformat(),
                "strategy": cfg["strategy"],
            }
            log_trade([datetime.now(timezone.utc).isoformat(), symbol, "enter", side,
                       qty, round(price, 4), sig["reason"], ""])
            events.append(f"ENTER {symbol} {side} {qty} @ {price:.2f} — {sig['reason']} "
                          f"(stop {stop:.2f}, risking {config.RISK_PCT*100:.0f}%)")

    save_positions(positions)
    write_status(equity, positions, events, demo)
    for e in events:
        print(e)
    if not events:
        print("No signals this pass.")
    return events


def main():
    demo = "--demo" in sys.argv
    if "--loop" in sys.argv:
        print(f"Bot loop started ({'DEMO' if demo else 'PAPER' if config.PAPER else 'LIVE'}). "
              "One pass every 15 minutes. Ctrl-C to stop.")
        while True:
            try:
                run_once(demo)
            except Exception as e:
                print("pass failed:", e)
            time.sleep(15 * 60)
    else:
        run_once(demo)


if __name__ == "__main__":
    main()
