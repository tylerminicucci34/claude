# Trading Bot — 5 markets, 3 strategies, 1 risk rule

An automated trading bot built from the spec in the "trade while you sleep" playbook preview:
five instruments, each playing its own game on its own timeframe, with a constant-risk layer on
top. Pure-stdlib Python (no dependencies), Alpaca's free broker API, **paper trading by default**.

> **Educational project — not financial advice.** These are textbook strategies; assume the edge
> is modest at best and make the backtest + paper results prove otherwise before any real money.

## The system

| Instrument | Strategy | Chart | Trigger |
|---|---|---|---|
| SPY (S&P 500) | Mean reversion | 15-min | Price stretches >1.5σ from the 20-period average → fade it, exit at the mean |
| QQQ (Nasdaq) | Mean reversion | 15-min | Same play, wider 1.8σ entry — Nasdaq runs hotter |
| BTC/USD | Momentum breakout | 1-hour | Break of the 20-period high on 1.5× volume → ride it, 2×ATR trailing stop (long-only spot) |
| GLD (gold) | Trend following | 4-hour | 50/200 EMA crossover → long above, exit/short below, 3×ATR trailing stop |
| USO (oil) | Trend following | 4-hour | Same crossover — commodity waves are cleaner on the 4-hour |

**The risk layer (applies to every trade):**
1. **ATR position sizing** — qty chosen so a full stop-out loses exactly 1% of equity. Quiet market → bigger position, wild market → smaller one; risk constant across all five.
2. **Hard stop at entry, never widened**; momentum/trend stops trail the best price and only ratchet in your favor.
3. **Correlation filter** — SPY and QQQ both long? No new BTC long. One risk-on bet, not three.

The control-room dashboard for this bot is the **Trading Bot tab inside Marrow** (`marrow/index.html`), which renders the `state/status.json` this bot writes each pass.

## Files

- `bot.py` — the bot. One pass per run (cron-friendly) or `--loop` for every 15 minutes.
- `backtest.py` — walk-forward simulation with per-symbol and portfolio metrics (return, win rate, max drawdown, Sharpe-like score).
- `briefing.py` — the two messages a day (`morning` / `evening`), optional Telegram delivery.
- `strategies.py` / `risk.py` / `indicators.py` / `broker.py` / `config.py` — the modules.
- `state/` — positions, trade log (`trades.csv`), status. Git-ignored.

## Quick start

```bash
# 0) zero-setup smoke test on synthetic data (no keys, no orders):
python3 bot.py --demo && python3 backtest.py --demo

# 1) free Alpaca paper account -> https://alpaca.markets  (no funding needed)
export ALPACA_KEY=...  ALPACA_SECRET=...

# 2) backtest on real history — the gate everything else waits behind
python3 backtest.py

# 3) paper trade (fake money, real prices)
python3 bot.py --loop          # or one `python3 bot.py` per 15-min cron tick

# 4) briefings (optionally export TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID)
python3 briefing.py morning
python3 briefing.py evening
```

## Going live (deliberately hard)

The bot ships **locked to the paper account**. Live trading requires *both*:
1. editing `config.py`: `LIVE_TRADING_ACKNOWLEDGED = True`
2. running with `ALPACA_ENV=live`

Do neither until you have weeks of paper results you'd defend to a skeptic. The playbook's own
fine print applies: reported results are one person's, not typical; never trade money you can't
afford to lose.

## Notes & honest limitations

- Stock/ETF data uses Alpaca's free IEX feed (slightly thinner than the paid SIP feed); crypto data is free.
- Alpaca has no native 4-hour bars — the bot aggregates 1-hour bars.
- Stops are managed by the bot (not resting bracket orders) so stocks and crypto share one code path — if your bot process dies with positions open, the stops die with it. Keep the process supervised (systemd restart / `--loop` in tmux) or flatten before stopping it.
- Backtests ignore slippage, commissions on crypto spreads, and overnight gaps through stops — real results will be worse.
- The `--demo` mode uses synthetic random-walk bars: good for testing the plumbing, meaningless for judging the strategies.
