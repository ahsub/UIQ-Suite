#!/usr/bin/env python3
"""
equity_inventory_check.py — Equity-Strategien: Sättigung, Gleichstände, Datenlücken, Nachrechnung
================================================================================================
SUITE №72 Equity-Inventur (read-only). Liest einen Snapshot (data/snapshots/*.json.gz) und den
Aggregator-Quelltext (Import der echten Score-Funktionen); schreibt nichts in Produktivdateien.

Aufruf:  UIQ_SNAPSHOT=<datei.json.gz> [UIQ_AGGREGATOR_DIR=/home/claude/ko-aggregator] python3 equity_inventory_check.py
Ausgabe: JSON auf stdout (--json) oder Textbericht.

Prüfungen
  A  Sättigung/Gleichstand je Leaderboard (LB-Zeilen) und je Strategiefeld (alle Ticker)
  B  Datenlücken der Eingangsfelder je Strategie (Anteil fehlend), inkl. Fundamentaldaten
  C  Nachrechnung der echten Score-Funktionen gegen die Snapshot-Werte; Abweichungen werden gegen
     die Hypothese "IOS-Leader-Boost (+10, Deckel 100)" geprüft (Konsistenz, kein Beweis)
  D  Wirkung des unerreichbaren Liquiditäts-Zweigs (avgVol20 < 250k) bei Minervini/Breakout
"""
import gzip, json, os, sys, logging, collections

logging.disable(logging.CRITICAL)
AGG = os.environ.get("UIQ_AGGREGATOR_DIR", "/home/claude/ko-aggregator")
sys.path.insert(0, AGG)
import market_aggregator as ma  # noqa: E402

SNAP = os.environ["UIQ_SNAPSHOT"]
d = json.load(gzip.open(SNAP))
md = d.get("masterData") or d
T = [r for r in md["tickers"] if not r.get("error") and r.get("price")]
LB = md["leaderboards"]

# Leaderboard -> (Sortierfeld, min_score laut build_leaderboards/_rebuild_fundamental_lb)
STRATS = {
    "long_minervini": ("sMinervini", 40), "long_swing": ("sSwing", 35), "long_mr": ("sMrLong", 30),
    "long_breakout": ("sBreakout", 40), "short_breakdown": ("sBreakdown", 35), "short_fading": ("sFading", 35),
    "ko_long": ("sKoLong", 50), "vcp_setups": ("sVcp", None), "long_dividend": ("sDividend", None), "long_value": ("sValue", None),
}
FUNCS = {"sMinervini": ma.score_long_minervini, "sSwing": ma.score_long_swing, "sMrLong": ma.score_long_mean_reversion,
         "sBreakout": ma.score_long_breakout, "sBreakdown": ma.score_short_breakdown, "sFading": ma.score_short_fading,
         "sVcp": ma.score_vcp, "sDividend": ma.score_long_dividend, "sValue": ma.score_long_value}
INPUTS = {
    "sMinervini": ["ema50", "ema200", "sma150", "ema200SlopeUp", "pctFromHigh52", "low52", "dist200", "volRatio", "obvTrend", "macdHist", "rsRating", "hvp", "bbPos", "avgVol20", "distToAvwapPct", "avwapAbove"],
    "sBreakout": ["ema50", "ema200", "pctFromHigh52", "volRatio", "obvTrend", "macdHist", "rsRating", "avgVol20"],
    "sSwing": ["ema200", "ema50", "rsi", "bbPos", "obvTrend", "macdHist", "hvp"],
    "sMrLong": ["ema200", "atr", "rsi", "bbPos", "volRatio", "hvp", "overheat"],
    "sBreakdown": ["ema200", "ema50", "atr", "rsi", "macdHist", "obvTrend", "bbPos", "hvp", "regime"],
    "sFading": ["ema200", "atr", "rsi", "bbPos", "overheat", "high52", "squeezeRisk", "hvp", "_sector_rs5"],
    "sVcp": ["vcpDetected", "vcpContractions", "vcpLastPct", "vcpVolContraction", "vcpBreakoutVol"],
    "sDividend": ["divYield", "payoutRatio", "fcfYield", "debtToEquity", "roe"],
    "sValue": ["peForward", "pb", "fcfYield", "roe", "analystUpside", "debtToEquity"],
}
out = {"snapshot": os.path.basename(SNAP), "tickers": len(T), "A_leaderboards": {}, "A_fields": {}, "B_gaps": {}, "C_recompute": {}, "D_dead_branch": {}}

def lead_run(rows, f):
    if not rows: return 0
    top = rows[0].get(f); n = 0
    for r in rows:
        if r.get(f) != top: break
        n += 1
    return n

# A: Leaderboards
for lb, (f, mn) in STRATS.items():
    rows = LB.get(lb) or []
    vals = [r.get(f) for r in rows if isinstance(r.get(f), (int, float))]
    out["A_leaderboards"][lb] = {
        "field": f, "min_score": mn, "rows": len(rows), "rows_with_field": len(vals),
        "top3": [(r.get("sym"), r.get(f)) for r in rows[:3]],
        "lead_tie_run": lead_run(rows, f) if vals else None,
        "rows_at_100": sum(1 for v in vals if v == 100), "distinct_scores": len(set(vals)),
        "min_row": min(vals) if vals else None,
    }
# A: Felder über alle Ticker
for f in FUNCS:
    v = [r[f] for r in T if isinstance(r.get(f), (int, float))]
    if not v: out["A_fields"][f] = {"in_tickers": False}; continue
    top = max(v)
    out["A_fields"][f] = {"in_tickers": True, "n": len(v), "max": top, "at_max": v.count(top), "at_100": v.count(100),
                          "ge_75": sum(1 for x in v if x >= 75), "ge_50": sum(1 for x in v if x >= 50), "zero": v.count(0)}

# B: Lücken (Anteil None/fehlend über alle Ticker; bei Score-Kandidaten >0 zusätzlich)
for f, cols in INPUTS.items():
    cand = [r for r in T if isinstance(r.get(f), (int, float)) and r[f] > 0] if f in T[0] else []
    row = {}
    for c in cols:
        miss = sum(1 for r in T if r.get(c) is None)
        m2 = sum(1 for r in cand if r.get(c) is None) if cand else None
        row[c] = {"missing_all": round(100 * miss / len(T), 1), "missing_among_score_gt0": (round(100 * m2 / len(cand), 1) if cand else None)}
    out["B_gaps"][f] = {"n_score_gt0": len(cand) if cand else None, "fields": row}

# C: Nachrechnung
for f, fn in FUNCS.items():
    if f not in T[0]: out["C_recompute"][f] = {"in_tickers": False}; continue
    n = diff = 0; ex = []; boost_consistent = 0
    for r in T:
        if not isinstance(r.get(f), (int, float)): continue
        n += 1
        try: v = fn(r)
        except Exception: v = None
        if v != r[f]:
            diff += 1
            if f == "sMinervini" and v is not None and r[f] == min(100, v + 10): boost_consistent += 1
            if len(ex) < 6: ex.append({"sym": r["sym"], "snapshot": r[f], "recomputed": v})
    out["C_recompute"][f] = {"n": n, "abweichend": diff, "beispiele": ex}
    if f == "sMinervini": out["C_recompute"][f]["abweichung_gleich_min(100,raw+10)"] = boost_consistent

# D: unerreichbarer Zweig (elif avg_vol < 250_000 nach if avg_vol < 500_000)
lowv = [r for r in T if isinstance(r.get("avgVol20"), (int, float)) and r["avgVol20"] < 250_000]
def s_pos(r, f): return isinstance(r.get(f), (int, float)) and r[f] > 0
out["D_dead_branch"] = {
    "tickers_avgVol20_lt_250k": len(lowv),
    "davon_sMinervini_gt0": sum(1 for r in lowv if s_pos(r, "sMinervini")),
    "davon_sBreakout_gt0": sum(1 for r in lowv if s_pos(r, "sBreakout")),
    "hinweis": "Bei avgVol20 < 250k greift nur der erste Zweig (-20 bzw. -15); die Zweige -35/-25 sind unerreichbar.",
}

if "--json" in sys.argv:
    print(json.dumps(out, ensure_ascii=False, indent=1, default=str))
else:
    print(json.dumps(out, ensure_ascii=False, indent=1, default=str))
