"""
main.py - entry point that runs the scan loop.

Wires together the scraper, signal scorer, price fetcher/backfiller, database
and reporter. Each loop: scrape trending tickers -> store mentions -> score
each ticker -> persist qualifying signals (with entry price) -> backfill any
matured follow-up prices -> print a terminal report. Runs every 30 minutes.

Flags:
    --source {stocktwits,finnhub}
                      which data backend to use (default: stocktwits)
    --backfill-only   update follow-up prices/outcomes, then exit (no scraping)
    --report-only     print the current database state, then exit
    --dry-run         hit the selected source once, print the parse, then exit
"""

import argparse
import time
import traceback
from datetime import datetime, timezone

import db
import finnhub_source
import prices
import report
import scraper
import signals

SCAN_INTERVAL_SECONDS = 30 * 60  # 30 minutes


def get_source(name):
    """
    Resolve a source name to its scraper module and entry-price function.

    Inputs:  name - "stocktwits" or "finnhub"
    Outputs: tuple (source_module, price_fn) where source_module exposes
             scrape_all_trending()/dry_run() and price_fn(ticker) -> float|None.
    Notes: finnhub prices come from its own /quote endpoint because yfinance is
           also blocked by the egress allowlist in this environment.
    """
    if name == "finnhub":
        return finnhub_source, finnhub_source.get_quote
    return scraper, prices.get_current_price


def run_scan(conn, scan_count, source_mod, price_fn):
    """
    Execute one full scan: scrape, score, persist, backfill, report.

    Inputs:
        conn       - open sqlite3.Connection
        scan_count - 1-based index of this scan (int)
        source_mod - data-source module exposing scrape_all_trending()
        price_fn   - callable(ticker) -> entry price float or None
    Outputs: list of signal dicts saved during this scan (may be empty).
    Errors during scraping/scoring are logged and swallowed so the loop never
    crashes.
    """
    now = datetime.now(timezone.utc)
    new_signals = []

    try:
        scraped = source_mod.scrape_all_trending()
    except Exception:  # defensive: scraper should not raise, but never crash
        print("[main] scrape failed:")
        traceback.print_exc()
        scraped = {}

    # Store every new mention.
    for ticker, mentions in scraped.items():
        for mention in mentions:
            try:
                db.insert_mention(conn, mention)
            except Exception:
                print(f"[main] failed to store mention for {ticker}:")
                traceback.print_exc()
    conn.commit()

    # Score each ticker we have fresh data for.
    for ticker in scraped:
        try:
            signal = signals.evaluate_ticker(conn, ticker, now=now)
        except Exception:
            print(f"[main] scoring failed for {ticker}:")
            traceback.print_exc()
            continue
        if not signal:
            continue

        # Capture the entry price at detection time (source-specific).
        signal["price_at_detection"] = price_fn(ticker)
        try:
            db.insert_signal(conn, signal)
            new_signals.append(signal)
        except Exception:
            print(f"[main] failed to store signal for {ticker}:")
            traceback.print_exc()

    # Backfill matured follow-up prices for older signals.
    try:
        updated = prices.backfill_prices(conn, now=now)
        if updated:
            print(f"[main] backfilled prices for {updated} signal(s)")
    except Exception:
        print("[main] backfill failed:")
        traceback.print_exc()

    report.print_report(conn, scan_count, new_signals, now=now)
    return new_signals


def main():
    """
    Parse CLI flags and either run a one-shot mode or the continuous loop.

    Inputs:  none (reads sys.argv)
    Outputs: none. Runs until interrupted with Ctrl-C in loop mode.
    """
    parser = argparse.ArgumentParser(
        description="Stock market early sentiment signal detector."
    )
    parser.add_argument(
        "--source",
        choices=["stocktwits", "finnhub"],
        default="stocktwits",
        help="Data backend to use (default: stocktwits).",
    )
    parser.add_argument(
        "--backfill-only",
        action="store_true",
        help="Only backfill follow-up prices/outcomes, then exit.",
    )
    parser.add_argument(
        "--report-only",
        action="store_true",
        help="Only print the current database state, then exit.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Hit the selected source once, print the parsed result, then exit.",
    )
    args = parser.parse_args()

    source_mod, price_fn = get_source(args.source)

    # --dry-run needs no database; do it before touching disk.
    if args.dry_run:
        ok = source_mod.dry_run()
        raise SystemExit(0 if ok else 1)

    db.init_db()
    conn = db.get_connection()

    try:
        if args.report_only:
            report.print_report(conn, scan_count=0, new_signals=[])
            return

        if args.backfill_only:
            updated = prices.backfill_prices(conn)
            print(f"[main] backfilled prices for {updated} signal(s)")
            report.print_report(conn, scan_count=0, new_signals=[])
            return

        # Backfill once on startup so any matured signals are graded before the
        # first scan's report is printed.
        try:
            prices.backfill_prices(conn)
        except Exception:
            print("[main] startup backfill failed:")
            traceback.print_exc()

        scan_count = 0
        while True:
            scan_count += 1
            run_scan(conn, scan_count, source_mod, price_fn)
            print(f"[main] sleeping {SCAN_INTERVAL_SECONDS // 60} minutes...")
            time.sleep(SCAN_INTERVAL_SECONDS)
    except KeyboardInterrupt:
        print("\n[main] interrupted, shutting down.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
