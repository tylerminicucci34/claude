#!/usr/bin/env python3
"""
Fetch real smart-money data from public filings for the Marrow app.

- Superinvestors: latest 13F-HR holdings for Berkshire Hathaway (Buffett),
  Pershing Square (Ackman), and Scion Asset Management (Burry) from SEC EDGAR.
- Insiders: recent Form 4 filings for notable people, with a parsed
  transaction summary (buy/sell, shares, price) where the XML allows.
- Congress: the most recent House periodic transaction reports (PTRs) from
  the Clerk's financial-disclosure index, linking to the official PDFs.

Writes marrow/smartmoney.json which the front-end reads. Each section is
independent — a failure in one leaves the others intact and is recorded in
the "errors" list.
"""

import io
import json
import os
import time
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone

HEADERS = {
    "User-Agent": "Marrow Smart Money Bot tyler@example.com",
}

INVESTORS = [
    ("Warren Buffett — Berkshire Hathaway", "0001067983"),
    ("Bill Ackman — Pershing Square", "0001336528"),
    ("Michael Burry — Scion Asset Mgmt", "0001649339"),
]

# (display name, CIK, substring that must appear in EDGAR's registered name —
#  a safety check so a wrong CIK can never mislabel someone else's filings)
INSIDERS = [
    ("Elon Musk", "0001494730", "MUSK"),
    ("Donald J. Trump", "0000947033", "TRUMP"),
    ("Warren Buffett", "0000315090", "BUFFETT"),
]

# Best-effort issuer-name → ticker map for click-through in the app.
NAME_TO_TICKER = {
    "APPLE INC": "AAPL", "AMERICAN EXPRESS CO": "AXP", "COCA COLA CO": "KO",
    "BANK AMERICA CORP": "BAC", "BANK OF AMERICA CORP": "BAC",
    "CHEVRON CORPORATION": "CVX", "CHEVRON CORP": "CVX",
    "OCCIDENTAL PETE CORP": "OXY", "ALPHABET INC": "GOOGL",
    "CHUBB LTD SWITZ": "CB", "CHUBB LIMITED": "CB", "MOODYS CORP": "MCO",
    "KRAFT HEINZ CO": "KHC", "AMAZON COM INC": "AMZN", "VISA INC": "V",
    "MASTERCARD INC": "MA", "NU HLDGS LTD": "NU", "DAVITA INC": "DVA",
    "CITIGROUP INC": "C", "KROGER CO": "KR", "SIRIUS XM HOLDINGS INC": "SIRI",
    "VERISIGN INC": "VRSN", "AON PLC": "AON", "CAPITAL ONE FINL CORP": "COF",
    "HILTON WORLDWIDE HLDGS IN": "HLT", "HILTON WORLDWIDE HLDGS INC": "HLT",
    "CHIPOTLE MEXICAN GRILL INC": "CMG", "RESTAURANT BRANDS INTL INC": "QSR",
    "HOWARD HUGHES HOLDINGS INC": "HHH", "CANADIAN PAC KANSAS CITY LTD": "CP",
    "NIKE INC": "NKE", "BROOKFIELD CORP": "BN", "ALIBABA GROUP HLDG LTD": "BABA",
    "JD COM INC": "JD", "ESTEE LAUDER COMPANIES INC": "EL",
    "UBER TECHNOLOGIES INC": "UBER", "TESLA INC": "TSLA",
}


def fetch_bytes(url):
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def fetch_json(url):
    return json.loads(fetch_bytes(url).decode("utf-8"))


def fetch_text(url):
    return fetch_bytes(url).decode("utf-8", errors="replace")


def find_latest_filing(cik, form_type):
    """Return (accession_no, filing_date, primary_doc) for the most recent filing."""
    data = fetch_json(f"https://data.sec.gov/submissions/CIK{cik}.json")
    recent = data["filings"]["recent"]
    for i, f in enumerate(recent["form"]):
        if f == form_type:
            return (
                recent["accessionNumber"][i],
                recent["filingDate"][i],
                recent.get("primaryDocument", [None] * len(recent["form"]))[i],
            )
    return None, None, None


def fetch_13f(name, cik, top_n=12):
    acc, date, _ = find_latest_filing(cik, "13F-HR")
    if not acc:
        raise RuntimeError(f"No 13F-HR found for {name}")
    base = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{acc.replace('-', '')}"

    # The information table XML has no fixed name — try every .xml in the
    # filing directory and use the first one with infoTable entries.
    index = fetch_json(f"{base}/index.json")
    entries = []
    for item in index["directory"]["item"]:
        fname = item["name"]
        if not fname.lower().endswith(".xml"):
            continue
        try:
            root = ET.fromstring(fetch_text(f"{base}/{fname}"))
        except Exception:
            continue
        found = root.findall(".//{*}infoTable")
        if found:
            entries = found
            break
    if not entries:
        raise RuntimeError(f"No infoTable entries found in 13F {acc} for {name}")

    aggregated = {}  # NAME -> [display_name, value_usd]
    for e in entries:
        def t(tag):
            el = e.find(f".//{{*}}{tag}")
            return (el.text or "").strip() if el is not None else ""

        issuer = t("nameOfIssuer")
        try:
            value = int(float(t("value") or 0))  # reported in whole USD since 2023
        except ValueError:
            value = 0
        if not issuer:
            continue
        key = issuer.upper()
        if key in aggregated:
            aggregated[key][1] += value
        else:
            aggregated[key] = [issuer, value]

    holdings = []
    for display, value in sorted(aggregated.values(), key=lambda x: -x[1])[:top_n]:
        h = {"name": display, "value_usd": value}
        ticker = NAME_TO_TICKER.get(display.upper())
        if ticker:
            h["ticker"] = ticker
        holdings.append(h)

    return {
        "name": name,
        "cik": cik,
        "filing_date": date,
        "accession": acc,
        "source": f"SEC EDGAR 13F-HR — {name}",
        "holdings": holdings,
    }


def summarize_form4(base_url, primary_doc):
    """Parse a Form 4 primary XML into a one-line transaction summary, or None."""
    if not primary_doc:
        return None
    fname = primary_doc.split("/")[-1]  # strip any xsl viewer prefix
    try:
        root = ET.fromstring(fetch_text(f"{base_url}{fname}"))
    except Exception:
        return None

    def txt(node, path):
        el = node.find(path)
        return (el.text or "").strip() if el is not None and el.text else ""

    symbol = txt(root, ".//issuerTradingSymbol")
    parts = []
    for tx in root.findall(".//nonDerivativeTransaction")[:3]:
        code = txt(tx, ".//transactionCoding/transactionCode")
        shares = txt(tx, ".//transactionShares/value")
        price = txt(tx, ".//transactionPricePerShare/value")
        ad = txt(tx, ".//transactionAcquiredDisposedCode/value")
        verb = {"P": "bought", "S": "sold", "A": "acquired", "G": "gifted", "F": "tax-withheld"}.get(
            code, "acquired" if ad == "A" else "disposed of" if ad == "D" else "traded")
        try:
            sh_str = f"{float(shares):,.0f} sh"
        except (TypeError, ValueError):
            sh_str = "shares"
        px = ""
        try:
            if price:
                px = f" @ ${float(price):,.2f}"
        except ValueError:
            pass
        parts.append(f"{verb} {sh_str}{px}")
    if not parts:
        return f"{symbol}: see filing" if symbol else None
    return (f"{symbol}: " if symbol else "") + "; ".join(parts)


def fetch_insider(name, cik, expect_name, limit=5):
    data = fetch_json(f"https://data.sec.gov/submissions/CIK{cik}.json")
    registered = (data.get("name") or "").upper()
    if expect_name.upper() not in registered:
        raise RuntimeError(
            f"CIK {cik} is registered to '{data.get('name')}', expected '{expect_name}' — skipping")
    recent = data["filings"]["recent"]
    filings = []
    for i, form in enumerate(recent["form"]):
        if form != "4":
            continue
        acc = recent["accessionNumber"][i]
        base_url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{acc.replace('-', '')}/"
        primary = recent.get("primaryDocument", [None] * len(recent["form"]))[i]
        entry = {
            "date": recent["filingDate"][i],
            "accession": acc,
            "url": base_url,
        }
        summary = summarize_form4(base_url, primary)
        if summary:
            entry["summary"] = summary
        filings.append(entry)
        time.sleep(0.2)
        if len(filings) >= limit:
            break
    return {
        "name": name,
        "cik": cik,
        "source": f"SEC EDGAR Form 4 filings (CIK {cik})",
        "filings": filings,
    }


def fetch_house_ptrs(limit=40):
    """Latest House periodic transaction reports from the Clerk's yearly index."""
    year = datetime.now(timezone.utc).year
    blob = None
    for y in (year, year - 1):  # early January: fall back to last year's index
        try:
            blob = fetch_bytes(
                f"https://disclosures-clerk.house.gov/public_disc/financial-pdfs/{y}FD.zip")
            year = y
            break
        except Exception:
            continue
    if blob is None:
        raise RuntimeError("House FD index ZIP unavailable")

    zf = zipfile.ZipFile(io.BytesIO(blob))
    xml_name = next(n for n in zf.namelist() if n.lower().endswith(".xml"))
    root = ET.fromstring(zf.read(xml_name))

    ptrs = []
    for m in root.findall(".//Member"):
        def txt(tag):
            el = m.find(tag)
            return (el.text or "").strip() if el is not None and el.text else ""

        if txt("FilingType") != "P":
            continue
        raw_date = txt("FilingDate")
        try:
            sort_key = datetime.strptime(raw_date, "%m/%d/%Y")
        except ValueError:
            continue
        doc_id = txt("DocID")
        ptrs.append({
            "_sort": sort_key,
            "name": f"{txt('First')} {txt('Last')}".strip(),
            "office": txt("StateDst"),
            "date": sort_key.strftime("%Y-%m-%d"),
            "doc_id": doc_id,
            "url": f"https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/{year}/{doc_id}.pdf",
        })
    ptrs.sort(key=lambda p: p["_sort"], reverse=True)
    for p in ptrs:
        del p["_sort"]
    return ptrs[:limit]


def main():
    out_path = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "marrow", "smartmoney.json"))

    # Start from the previous output so one failed section doesn't wipe good data.
    result = {"investors": [], "insiders": [], "congress": [], "errors": []}
    try:
        with open(out_path, encoding="utf-8") as f:
            prev = json.load(f)
        for k in ("investors", "insiders", "congress"):
            if isinstance(prev.get(k), list):
                result[k] = prev[k]
    except Exception:
        pass
    result["updated_utc"] = datetime.now(timezone.utc).isoformat()
    result["errors"] = []

    investors = []
    for name, cik in INVESTORS:
        try:
            investors.append(fetch_13f(name, cik))
        except Exception as e:
            result["errors"].append(f"13F {name}: {e}")
        time.sleep(0.3)  # polite to SEC
    if investors:
        result["investors"] = investors

    insiders = []
    for name, cik, expect in INSIDERS:
        try:
            insiders.append(fetch_insider(name, cik, expect))
        except Exception as e:
            result["errors"].append(f"Form4 {name}: {e}")
        time.sleep(0.3)
    if insiders:
        result["insiders"] = insiders

    try:
        result["congress"] = fetch_house_ptrs()
    except Exception as e:
        result["errors"].append(f"House PTRs: {e}")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)
    print(f"Wrote {out_path} "
          f"({len(result['investors'])} investors, {len(result['insiders'])} insiders, "
          f"{len(result['congress'])} PTRs, {len(result['errors'])} errors)")


if __name__ == "__main__":
    main()
