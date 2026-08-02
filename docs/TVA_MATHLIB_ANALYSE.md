# TVA MathLibrary — Analyse & UIQ-Portierungsnotizen

**Quelle:** Pine Script v6 Library `TVA_MathLibrary` (Build 1 V1 Launch Plan)  
**Erfasst:** August 2026  
**Status:** Referenzdokument — Implementierung beim nächsten Score-Refactoring Sprint

---

## Übersicht der Funktionen

| Funktion | Konzept | UIQ-Relevanz | Sprint |
|---|---|---|---|
| `f_htfBundle` | Multi-TF OHLCV via request.security | ⬜ TV-only | — |
| `f_htfBias` | HTF Bias Score 0–100 (EMA+ADX+RSI) | 🔶 Mittel | Sprint B |
| `f_stdTrendScore` | Trend Score −100..+100 | ✅ Hoch | Sprint A |
| `f_confirmationScore` | W/D/4H/1H Voting Score | 🔶 Mittel | Sprint B |
| `f_confluenceScore` | Confluence Score 0–100, 5 Faktoren | ✅ Hoch | Sprint A |
| `f_buyProbability` | Kauf-Wkt. mit Sigmoid, 6 Faktoren | ✅ Hoch | **Teilimpl. v5.23.0** |
| `f_sellProbability` | Verkauf-Wkt. mit Sigmoid, 6 Faktoren | ✅ Hoch | Sprint A |
| `f_marketRegime` | 8 Regime + 3-Bar Hold | ✅ Hoch | Sprint A |
| `f_chopIndex` | Chop Index 0–100 | ✅ Hoch | Sprint A |
| `f_volatilityClass` | 4-Level Vol-Regime + Hysterese | 🔶 Mittel | Sprint B |
| `f_emaSmooth2` | 2-Bar EMA Anti-Flicker | ⬜ trivial | — |
| `f_scoreColor` | Dashboard-Zellfarbe | ⬜ Frontend | — |
| `f_gaugeText` | Dashboard-Label | ⬜ Frontend | — |
| `f_alignmentBar` | ASCII Progress Bar | ⬜ Frontend | — |

---

## Sprint A — Hochprioritäre Portierungen

### 1. `f_stdTrendScore` → UIQ Composite Score Ersatz

**Pine Script Formel:**
```pine
emaDir = (c > e20 ? 1 : -1) + (c > e50 ? 1 : -1) + (e20 > e50 ? 1 : -1) + (c > e200 ? 1 : -1)
emaPart = emaDir / 4.0 * 50.0
rsiPart = (r - 50.0) * 1.0
adxWeight = min(adxv, 50.0) / 50.0
raw = (emaPart * 0.6 + clamp(rsiPart, -50, 50) * 0.4) * (0.5 + 0.5 * adxWeight)
result = clamp(raw, -100, 100)
```

**Python-Port für UIQ:**
```python
def calc_std_trend_score(price, ema20, ema50, ema200, rsi, adx):
    ema_dir = (
        (1 if price > ema20 else -1) +
        (1 if price > ema50 else -1) +
        (1 if ema20  > ema50 else -1) +
        (1 if price > ema200 else -1)
    )
    ema_part = ema_dir / 4.0 * 50.0
    rsi_part = max(-50.0, min(50.0, (rsi - 50.0)))
    adx_weight = min(adx, 50.0) / 50.0
    raw = (ema_part * 0.6 + rsi_part * 0.4) * (0.5 + 0.5 * adx_weight)
    return round(max(-100.0, min(100.0, raw)), 1)
```

**UIQ-Heimat:** `process_ticker()` → neues Feld `trendScore` (−100..+100)  
**Vorteil vs. aktuell:** Einheitlich skaliert, ADX als Konviktions-Multiplikator

---

### 2. `f_buyProbability` → Sigmoid-Upgrade score_long_minervini()

**Status: Teilweise implementiert in v5.23.0**

Die Sigmoid-Glättung wurde in `score_long_minervini()` eingebaut:
```python
s_sigmoid = round(100.0 / (1.0 + math.exp(-0.06 * (s - 50))))
```

**Noch ausstehend (Sprint A):** Die 6 TVA-Faktoren als explizite Adjuster:

| TVA Faktor | Pine Script | UIQ-Äquivalent | Vorhanden |
|---|---|---|---|
| EMA-Stack Adj | +20 wenn c>e20>e50>e200 | `ema50`, `ema200`, `sma150` | ✅ Gate 1 |
| RSI Adj | +15 wenn RSI 30–45 | `rsi` | ✅ Gate 8 |
| MACD-Crossover | +10 wenn MACD Kreuzung | `macdHist` | ✅ Gate 5 |
| Volumen Adj | +10 wenn vol>1.5×EMA | `volRatio` | ✅ Gate 4 |
| Support-Distanz | +15 wenn ≤1 ATR zu Unterstützung | `distToAvwapPct` | 🆕 neu |
| ADX Adj | +10 wenn ADX>35 steigend | fehlt in process_ticker | ❌ offen |

**Lücke:** `distToAvwapPct` als Support-Distanz in Minervini nutzen (nächster Sprint)  
**Lücke:** ADX-Wert pro Ticker im Aggregator ergänzen

---

### 3. `f_marketRegime` → UIQ MCM/Markov-Ergänzung

**Pine Script Logik:**
- 8 Regime: Strong Trend Up/Down, Trend Up/Down, Choppy, Volatile, Range, Transitioning
- 3-Bar Hold: verhindert Regime-Flipping (Kandidat muss 3 Bars konsistent sein)
- Composite aus ADX-Score + Efficiency Ratio + Vol-Expansion + BB-Expansion

**UIQ aktuell:** 4 Markov-Regime (BULL_QUIET / BULL_FRAGILE / STRESS_UNSTABLE / POST_PANIC)  
**Mehrwert TVA:** Granularere Intraday-Unterscheidung + Anti-Noise durch Hold-Mechanismus

**Python-Port (Konzept):**
```python
def classify_market_regime(adx, efficiency_ratio, atr_ratio, bb_expanding, bb_squeezing):
    adx_score = 3 if adx > 35 else 1 if adx >= 20 else 0
    er_score  = 2 if efficiency_ratio > 0.60 else 1 if efficiency_ratio >= 0.30 else 0
    composite = adx_score + er_score + (1 if atr_ratio > 1.5 else 0) + (1 if bb_expanding else 0)
    trending_up = True  # aus Markov / close-Vergleich
    if composite >= 4: return "Strong Trend Up" if trending_up else "Strong Trend Down"
    if composite == 3: return "Trend Up"        if trending_up else "Trend Down"
    if bb_squeezing:   return "Choppy"
    if composite <= 1 and efficiency_ratio < 0.30: return "Range"
    return "Choppy"
```

**UIQ-Heimat:** Ergänzung zu `_calc_markov_regime()` oder als separates `tvaRegime`-Feld

---

### 4. `f_chopIndex` → MCM-Faktor

**Pine Script:**
```pine
adxChop    = max(0, 100 - min(adxv, 50) * 2) * 0.30
diCancel   = (100 - min(abs(diPlus - diMinus) * 2.5, 100)) * 0.25
erChop     = max(0, (1 - min(er, 1)) * 100) * 0.25
bbSqueeze  = max(0, (1 - bbWidth/bbWidthEma20) * 100) * 0.20
chop = adxChop + diCancel + erChop + bbSqueeze
```

**UIQ-Heimat:** Neues MCM-Feld `chopIndex` (0–100, hoch = choppy)  
**Vorteil:** Expliziter Chop-Score ersetzt implizite HVP/bbPos-Kombination

---

## Sprint B — Mittlere Priorität

### `f_volatilityClass` — Hysterese-Volatilätsklassifizierung

4 Klassen: Low / Normal / High / Extreme mit Hysterese-Schwellen (verhindert Flipping).  
`sizeMult`: Low=1.5×, Normal=1.0×, High=0.6×, Extreme=0.3×  

**UIQ-Anwendung:** Position-Sizing-Multiplikator in `calcDdPosition()` (DeepDive)

### `f_confirmationScore` — Multi-TF Bestätigung

Setzt W/D/4H/1H Scores voraus. UIQ ist Daily-only.  
**Machbar wenn:** Wöchentliche Daten via yfinance `period="5y", interval="1wk"` ergänzt werden.

---

## Nicht portierbar

- `f_htfBundle` — `request.security()` ist TradingView-exklusiv
- `f_scoreColor` / `f_gaugeText` / `f_alignmentBar` — reine TV-Dashboard-Helfer

---

## Referenz-Implementierung Sigmoid

Die Sigmoid-Funktion aus `f_buyProbability` ist der konzeptuelle Kern:

```python
import math

def sigmoid_smooth(raw_score: float, k: float = 0.06) -> int:
    """
    Glättet einen Rohscore (beliebiger Bereich, kalibriert auf 0-100) 
    durch Sigmoid-Funktion. k=0.06 für Daily, k=0.08 für Intraday (TVA-Original).
    Eigenschaften: raw=50→50, raw=80→82, raw=20→18, raw=100→98, raw=0→2
    """
    return round(100.0 / (1.0 + math.exp(-k * (raw_score - 50))))
```

**Bereits aktiv in:** `score_long_minervini()` seit v5.23.0  
**Geplant für:** `score_long_breakout()`, `score_long_swing()` (Sprint A)

---

*TVA MathLibrary Analyse v1.0 · August 2026 · UIQ Suite*
