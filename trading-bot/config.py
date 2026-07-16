"""Trading bot configuration — instruments, strategies, risk, and mode.

SAFETY: The bot trades Alpaca's PAPER account (fake money, real prices)
unless BOTH of these are true:
  1. environment variable ALPACA_ENV=live
  2. LIVE_TRADING_ACKNOWLEDGED below is set to True by hand
Everything here is educational; nothing is financial advice.
"""

import os

# ---- mode ----------------------------------------------------------------
LIVE_TRADING_ACKNOWLEDGED = False   # flip by hand only after weeks of paper results
PAPER = not (os.environ.get("ALPACA_ENV") == "live" and LIVE_TRADING_ACKNOWLEDGED)

# ---- keys (never hardcode) ------------------------------------------------
ALPACA_KEY = os.environ.get("ALPACA_KEY", "")
ALPACA_SECRET = os.environ.get("ALPACA_SECRET", "")

TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# ---- risk layer (the one rule) --------------------------------------------
RISK_PCT = 0.01          # max loss per trade = 1% of account equity
MAX_RISK_ON_LONGS = 2    # correlation filter: SPY+QQQ long => no new BTC long
ALLOW_SHORTS = True      # mean-reversion fades both directions (stocks only)

# ---- instruments & strategies (from the 5-market playbook) ----------------
# stop_atr = ATR multiple used for the protective/trailing stop; position is
# sized so a full stop-out loses exactly RISK_PCT of equity.
INSTRUMENTS = {
    "SPY": {  # S&P 500 — mean reversion, 15-minute chart
        "kind": "stock", "strategy": "mean_reversion", "timeframe": "15Min",
        "lookback": 20, "entry_z": 1.5, "stop_atr": 1.0,
    },
    "QQQ": {  # Nasdaq 100 — mean reversion, wider band (Nasdaq runs hotter)
        "kind": "stock", "strategy": "mean_reversion", "timeframe": "15Min",
        "lookback": 20, "entry_z": 1.8, "stop_atr": 1.0,
    },
    "BTC/USD": {  # Bitcoin — momentum breakout, 1-hour chart (long-only spot)
        "kind": "crypto", "strategy": "momentum_breakout", "timeframe": "1Hour",
        "lookback": 20, "volume_mult": 1.5, "stop_atr": 2.0,
    },
    "GLD": {  # gold — trend following, 4-hour chart
        "kind": "stock", "strategy": "trend_follow", "timeframe": "4Hour",
        "ema_fast": 50, "ema_slow": 200, "stop_atr": 3.0,
    },
    "USO": {  # oil — same crossover, commodity waves are cleaner on the 4-hour
        "kind": "stock", "strategy": "trend_follow", "timeframe": "4Hour",
        "ema_fast": 50, "ema_slow": 200, "stop_atr": 3.0,
    },
}

ATR_PERIOD = 14

# ---- files ----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATE_DIR = os.path.join(BASE_DIR, "state")
STATE_FILE = os.path.join(STATE_DIR, "positions.json")
STATUS_FILE = os.path.join(STATE_DIR, "status.json")
TRADES_FILE = os.path.join(STATE_DIR, "trades.csv")
