# Marrow — Personal AI Investment Terminal

A self-hosted, single-file take on AI stock-research apps like [Barebone AI](https://barebone.ai/):
live market data, a four-pillar quality rating, smart-money tracking from public filings, an AI
analyst you can chat with about any ticker, and a private portfolio tracker — with no subscription,
no account, and no data leaving your browser except to APIs you hold the keys for.

## What's inside

| Tab | What it does | Data source |
|---|---|---|
| **Dashboard** | Index ETFs (SPY/QQQ/DIA/IWM), a watchlist that auto-refreshes every 30s, market headlines | Finnhub (your free key) |
| **Research** | Live quote + 52-week range, **Marrow Quality Rating** (Growth / Business Quality / Financial Health / Valuation, each 0–100 with a composite), an **About & Why This Rating** section (Wikipedia company description + plain-English pillar-by-pillar score explanation + a smart-money callout when tracked investors/insiders are in the stock), key TTM stats, Wall Street analyst consensus, EPS-vs-estimate history, company news, and a streaming **AI analyst chat** that knows all the data on screen | Finnhub + Wikipedia + Anthropic API (your keys) |
| **Smart Money** | Superinvestor 13F holdings (Buffett, Ackman, Burry), insider Form 4 activity with parsed buy/sell summaries (Musk, Trump, Buffett — extend via `INSIDERS` in the script; each CIK is name-verified against EDGAR before use), and the latest House congress-trade reports (PTRs) with high-profile members starred (Pelosi, Greene, Gottheimer, …) and a link to the Senate's separate EFD search | SEC EDGAR + House Clerk, refreshed daily by GitHub Actions |
| **Portfolio** | Manual positions with live market value, day P&L, total P&L, return %, and allocation bars | localStorage + Finnhub |
| **Trading Bot** | Control room for the paper-trading bot in `trading-bot/` — mode, equity, open positions with stops, last-pass activity, trade log, and the 5-step setup guide. The bot itself (5 markets, 3 strategies, ATR risk layer) runs as Python on your machine/server and writes the state this tab reads | trading-bot/state (written by the bot) |
| **Top 10** | The strongest 12-month-outlook stocks from an editable candidate pool, ranked by outlook score (analyst consensus 45% + Marrow quality rating 35% + revenue growth 20%). Remove a stock with ✕ when something changes and the next-ranked candidate fills in (restorable); add candidates anytime; "Pressure-test with AI" hands the list to Claude for per-stock risks and removal triggers. Rankings cache for the day; re-rank on demand | Finnhub (your key) |

## Setup

1. Open `index.html` (works from `file://` or any static host).
2. Tap **SET API KEY** and paste a free [Finnhub](https://finnhub.io/register) key (60 calls/min).
   If you already saved one in Stock Analysis or Signal Scout, Marrow reuses it automatically.
3. (Optional) Paste an [Anthropic](https://console.anthropic.com/) key to enable the AI analyst chat.

Keys live only in your browser's localStorage. Nothing is uploaded anywhere.

## Smart-money data pipeline

`scripts/fetch-smart-money.py` writes `marrow/smartmoney.json` from:

- **SEC EDGAR 13F-HR** — latest holdings for each configured manager (edit `INVESTORS` in the script).
- **SEC EDGAR Form 4** — recent insider filings with transaction summaries (edit `INSIDERS`).
- **House Clerk financial disclosures** — latest periodic transaction reports with PDF links.

The existing `update-holdings.yml` workflow runs it every day at 08:00 UTC and commits changes. Run it
manually anytime with `python3 scripts/fetch-smart-money.py` (SEC asks for a real contact in the
`User-Agent` — update it in the script).

## Notes

- Marrow is a research and education tool for personal use — not investment advice, and it never
  executes trades.
- Free Finnhub covers US-listed symbols; candles/charts are premium-only, which is why Marrow
  sticks to quotes, fundamentals, news, and estimates.
- The AI analyst has no web access; it grounds itself in the live JSON pulled seconds earlier and
  labels anything it can't verify.
