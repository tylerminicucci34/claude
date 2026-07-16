#!/usr/bin/env python3
"""Morning/evening briefing — the 'two messages a day'.

  python3 briefing.py morning     what's on and what the bot is holding
  python3 briefing.py evening     how the day went

Prints to stdout; also sends to Telegram when TELEGRAM_BOT_TOKEN and
TELEGRAM_CHAT_ID are set. Schedule with cron, e.g.:
  0 7 * * 1-5  cd /path/to/trading-bot && python3 briefing.py morning
  0 21 * * 1-5 cd /path/to/trading-bot && python3 briefing.py evening
"""

import csv
import json
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

import broker
import config


def load_status():
    try:
        with open(config.STATUS_FILE, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def todays_trades():
    today = datetime.now(timezone.utc).date().isoformat()
    try:
        with open(config.TRADES_FILE, encoding="utf-8") as f:
            return [r for r in csv.DictReader(f) if r["time"].startswith(today)]
    except Exception:
        return []


def build(kind):
    s = load_status()
    lines = [f"{'☀️ MORNING' if kind == 'morning' else '🌙 EVENING'} BRIEFING — "
             f"{datetime.now(timezone.utc).strftime('%a %b %d')} ({s.get('mode', 'no runs yet')})"]

    if broker.have_keys() and not s.get("mode", "").startswith("DEMO"):
        try:
            acct = broker.get_account()
            eq, last_eq = float(acct["equity"]), float(acct["last_equity"])
            d = eq - last_eq
            lines.append(f"Equity ${eq:,.2f} ({'+' if d >= 0 else ''}{d:,.2f} vs yesterday)")
        except Exception as e:
            lines.append(f"(account fetch failed: {e})")
    elif s.get("equity"):
        lines.append(f"Equity ${s['equity']:,.2f}")

    pos = s.get("positions", {})
    if pos:
        lines.append(f"\nOpen positions ({len(pos)}):")
        for sym, p in pos.items():
            lines.append(f"  {sym}: {p['side']} {p['qty']} @ {p['entry']:.2f}, stop {p['stop']:.2f}")
    else:
        lines.append("\nNo open positions — flat.")

    trades = todays_trades()
    if kind == "evening":
        closed = [t for t in trades if t["action"] == "exit"]
        pnl = sum(float(t["pnl"] or 0) for t in closed)
        lines.append(f"\nToday: {len(trades)} orders, {len(closed)} closed, "
                     f"realized P&L {'+' if pnl >= 0 else ''}{pnl:,.2f}")
        for t in trades[-8:]:
            lines.append(f"  {t['time'][11:16]} {t['action']} {t['symbol']} {t['side']} — {t['reason']}")
    else:
        ev = s.get("last_run_events", [])
        if ev:
            lines.append("\nLast pass:")
            lines.extend(f"  {e}" for e in ev[-6:])

    lines.append("\nPaper account · educational · not financial advice.")
    return "\n".join(lines)


def send_telegram(text):
    if not (config.TELEGRAM_BOT_TOKEN and config.TELEGRAM_CHAT_ID):
        return False
    url = f"https://api.telegram.org/bot{config.TELEGRAM_BOT_TOKEN}/sendMessage"
    data = urllib.parse.urlencode({"chat_id": config.TELEGRAM_CHAT_ID, "text": text}).encode()
    with urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=20) as r:
        return r.status == 200


def main():
    kind = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ("morning", "evening") else "morning"
    text = build(kind)
    print(text)
    if send_telegram(text):
        print("\n(sent to Telegram)")


if __name__ == "__main__":
    main()
