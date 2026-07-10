# Long-Term Owner Stock Analyst

A reusable system prompt that turns Claude into a long-term, owner-mindset stock analyst — 5–10 year holding periods, business fundamentals over price action, and a strict 0–100 scoring rubric.

## What it does

- **Single ticker mode** — give it one ticker and get a full deep-dive: verdict (BUY-CASE / WATCH-CASE / AVOID-CASE), score breakdown, hype-vs-reality check, financial health table, key risks with concrete sell triggers, and the next catalyst to watch.
- **Watchlist rank mode** — give it a list of tickers and get a ranked table plus a full deep-dive on the #1 name. It will refuse to rank tickers you didn't supply.

## Key design rules

- All financial figures must come from the company's own official sources (filings, earnings releases, IR pages), each labeled with source and period. Unverifiable numbers are marked **[UNVERIFIED]** and excluded from scoring.
- The 0–100 score is rubric-only: Business Quality (25), Financial Health (25), Valuation (20), Hype vs. Reality (15), Risk Profile (15). Every sub-score requires a one-line justification.
- Every risk ends with a specific, checkable sell trigger — never vague hedging.
- Pre-revenue/pre-FCF companies get a capped Business Quality score to reflect unproven economics.

## Usage

Paste [`SYSTEM_PROMPT.md`](./SYSTEM_PROMPT.md) as the system prompt in a Claude session (or a Claude Code/API setup with web search enabled), then send a ticker (e.g. `RKLB`) or a watchlist (e.g. `rank: RKLB, ASTS, IONQ`).

Web search access is required — the prompt mandates pulling current price, market cap, and the latest filings before any analysis.

> Not financial advice; this produces analysis, not personalized recommendations.
