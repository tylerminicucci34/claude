#!/usr/bin/env python3
"""
Fetch real public holdings from SEC EDGAR for the Brain Trust app.

- Buffett: latest 13F-HR for Berkshire Hathaway (CIK 1067983)
- Musk:    latest Form 4 filings for Elon Musk (CIK 1494730)
- Trump:   latest Form 4 filings for Donald J. Trump (CIK 1494730 → DJT)

Writes brain-trust/holdings.json which the front-end reads.
"""

import json
import os
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

HEADERS = {
    "User-Agent": "BrainTrust Holdings Bot tyler@example.com",
}

BERKSHIRE_CIK = "0001067983"
MUSK_CIK = "0001494730"
# Donald J Trump's personal reporting CIK (Form 4 filer for DJT/TMTG)
TRUMP_CIK = "0000947033"


def fetch_json(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))


def fetch_text(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def find_latest_filing(cik, form_type):
    """Return (accession_no, filing_date, primary_doc) for the most recent filing."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    data = fetch_json(url)
    recent = data["filings"]["recent"]
    for i, f in enumerate(recent["form"]):
        if f == form_type:
            return (
                recent["accessionNumber"][i],
                recent["filingDate"][i],
                recent.get("primaryDocument", [None] * len(recent["form"]))[i],
            )
    return None, None, None


def fetch_berkshire_13f():
    acc, date, _ = find_latest_filing(BERKSHIRE_CIK, "13F-HR")
    if not acc:
        raise RuntimeError("No 13F-HR found in Berkshire submissions")
    acc_clean = acc.replace("-", "")
    base = f"https://www.sec.gov/Archives/edgar/data/{int(BERKSHIRE_CIK)}/{acc_clean}"

    # Find the information table XML. Berkshire names it various things
    # ("infotable.xml", "form13fInfoTable.xml", etc), so try every .xml in
    # the directory and pick the first one that parses with infoTable entries.
    index = fetch_json(f"{base}/index.json")
    xml_candidates = [
        item["name"] for item in index["directory"]["item"]
        if item["name"].lower().endswith(".xml")
    ]

    entries = []
    used = None
    for cand in xml_candidates:
        try:
            xml = fetch_text(f"{base}/{cand}")
            root = ET.fromstring(xml)
        except Exception:
            continue
        # Try namespaced lookup, then any-namespace lookup
        ns = {"i": "http://www.sec.gov/edgar/document/thirteenf/informationtable"}
        found = root.findall("i:infoTable", ns) or root.findall(".//{*}infoTable")
        if found:
            entries = found
            used = cand
            break

    if not entries:
        raise RuntimeError(f"No infoTable entries found in any XML under {acc} (candidates: {xml_candidates})")

    aggregated = {}  # name -> (ticker_guess, value_thousands)
    for e in entries:
        def t(tag):
            el = e.find(f".//{{*}}{tag}")
            return el.text if el is not None else ""

        name = (t("nameOfIssuer") or "").strip()
        try:
            value = int(t("value") or 0)
        except ValueError:
            value = 0
        if not name:
            continue
        key = name.upper()
        if key in aggregated:
            aggregated[key] = (aggregated[key][0], aggregated[key][1] + value)
        else:
            aggregated[key] = (name, value)

    sorted_holdings = sorted(aggregated.values(), key=lambda x: -x[1])
    top = [{"name": n, "value_thousands": v} for (n, v) in sorted_holdings[:10]]

    return {
        "filing_date": date,
        "accession": acc,
        "source": "SEC EDGAR 13F-HR — Berkshire Hathaway",
        "top_holdings": top,
    }


def fetch_recent_form4s(cik, limit=5):
    """Return a list of recent Form 4 filings with date and a short summary."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    try:
        data = fetch_json(url)
    except Exception as e:
        return {"error": str(e), "filings": []}
    recent = data["filings"]["recent"]
    out = []
    for i, f in enumerate(recent["form"]):
        if f != "4":
            continue
        out.append({
            "date": recent["filingDate"][i],
            "accession": recent["accessionNumber"][i],
            "url": f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{recent['accessionNumber'][i].replace('-','')}/",
        })
        if len(out) >= limit:
            break
    return {"source": f"SEC EDGAR Form 4 filings (CIK {cik})", "filings": out}


def main():
    out_path = os.path.join(os.path.dirname(__file__), "..", "brain-trust", "holdings.json")
    out_path = os.path.normpath(out_path)

    result = {
        "updated_utc": datetime.now(timezone.utc).isoformat(),
        "buffett": None,
        "musk": None,
        "trump": None,
        "errors": [],
    }

    for label, fn in [
        ("buffett", fetch_berkshire_13f),
        ("musk", lambda: fetch_recent_form4s(MUSK_CIK)),
        ("trump", lambda: fetch_recent_form4s(TRUMP_CIK)),
    ]:
        try:
            result[label] = fn()
            time.sleep(0.3)  # polite to SEC
        except Exception as e:
            result["errors"].append(f"{label}: {e}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
