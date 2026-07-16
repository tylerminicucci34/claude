"""Pure-python indicators over bar lists. A bar is a dict with keys
t (ISO time), o, h, l, c, v. No numpy needed at this scale."""


def sma(closes, n):
    if len(closes) < n:
        return None
    return sum(closes[-n:]) / n


def stdev(closes, n):
    if len(closes) < n:
        return None
    window = closes[-n:]
    m = sum(window) / n
    var = sum((x - m) ** 2 for x in window) / n
    return var ** 0.5


def ema_series(closes, n):
    """Full EMA series (leading None until enough data)."""
    out = [None] * len(closes)
    if len(closes) < n:
        return out
    seed = sum(closes[:n]) / n
    out[n - 1] = seed
    k = 2 / (n + 1)
    for i in range(n, len(closes)):
        out[i] = closes[i] * k + out[i - 1] * (1 - k)
    return out


def atr(bars, n=14):
    """Wilder's average true range over the last n bars."""
    if len(bars) < n + 1:
        return None
    trs = []
    for i in range(len(bars) - n, len(bars)):
        h, l, pc = bars[i]["h"], bars[i]["l"], bars[i - 1]["c"]
        trs.append(max(h - l, abs(h - pc), abs(l - pc)))
    return sum(trs) / n


def zscore(closes, n):
    m = sma(closes, n)
    s = stdev(closes, n)
    if m is None or not s:
        return None
    return (closes[-1] - m) / s
