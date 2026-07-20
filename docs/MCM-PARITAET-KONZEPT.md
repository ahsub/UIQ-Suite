# MCM-PARITÄT: AGGREGATOR ↔ CLIENT

**Erstellt:** 20.07.2026  
**Status:** Konzept — Sprint geplant für 21.07.2026  
**Priorität:** P0 — vor ko-prompts-registry  

---

## Problem

`build_server_market_context()` im Aggregator berechnet nur 5 von 9 MCM-Faktoren:

| Faktor | Server | Client | Downgrade-Regeln |
|---|---|---|---|
| vix | ✅ | ✅ | momentum, breakout |
| vvix | ✅ | ✅ | momentum |
| skew | ✅ | ✅ | — |
| pcr | ✅ | ✅ | momentum, breakout |
| fear_greed | ✅ | ✅ | momentum, breakout, ko |
| **ndx_breadth** | ❌ | ✅ | ko, momentum, breakout, swing |
| **intermarket_score** | ❌ | ✅ | ko, momentum, breakout, swing, value |
| **treasury_stress** | ❌ | ✅ | ko, momentum, breakout, swing, csp_wheel, atmna, weekly_income, cc |
| **bull_indicator** | ❌ | ✅ | ko, momentum, breakout, swing |

Resultat: `downgrades: []` im KV-Snapshot obwohl Client 3 Downgrades berechnet.
KI-Text im MB zeigt momentum/swing grün obwohl Live-Ampel rot.

---

## Datenquellen im Aggregator

Alle 4 fehlenden Indikatoren können aus bereits vorhandenen Aggregator-Daten berechnet werden:

### 1. ndx_breadth
**Client-Logik (loadIntermarket() in index.html):**
- Lädt Kurshistorie für alle NDX-100 Titel
- Berechnet % der Titel über ihrer 50d-MA
- Schwelle: caution ≤ 50%, risk ≤ 35%

**Aggregator-Datenquelle:**
- `hist_data` enthält bereits Kurshistorie für alle Scanner-Ticker
- NDX-Titel-Liste: aus `IWV_holdings.csv` oder feste Liste der Top-100
- **Einfacherer Proxy:** QQQ-Komponenten aus `sector_holdings["XLK"]` + weitere
- **Pragmatischster Ansatz:** `calc_macro_zscores()` hat bereits `mse_history["ndx_breadth"]` falls vom Watchdog befüllt — prüfen ob vorhanden

**Neue Funktion:** `calc_ndx_breadth(hist_data) -> float`
```python
# % der NDX-100 Titel über 50d-MA
# NDX_TICKERS = [...] # feste Liste, Top-100 NDX
def calc_ndx_breadth(hist_data):
    above = 0; total = 0
    for sym in NDX_TICKERS:
        df = hist_data.get(sym)
        if df is None or len(df) < 50: continue
        closes = df['Close'].dropna().tolist()
        if len(closes) < 50: continue
        sma50 = sum(closes[-50:]) / 50
        if closes[-1] > sma50: above += 1
        total += 1
    return round(above / total * 100, 1) if total > 0 else None
```

### 2. intermarket_score
**Client-Logik (loadIntermarket() in index.html):**
- Composite-Score 0-100 aus: HYG/TLT-Ratio, DXY-Trend, Kupfer/Gold-Ratio, SPY vs SMA200, VIX-Level
- Schwelle: caution ≥ 40, risk ≥ 60

**Aggregator-Datenquelle:**
- `market["snapshot"]`: SPY, Gold, Copper (bereits vorhanden)
- `market["vixTerm"]`: VIX (bereits vorhanden)
- `hist_data`: HYG, TLT, DXY (müssen ggf. zum fetch hinzugefügt werden)

**Neue Funktion:** `calc_intermarket_score(hist_data, market) -> int`
```python
# Port von loadIntermarket() aus index.html
# Score 0-100: höher = mehr Stress
def calc_intermarket_score(hist_data, market):
    score = 50  # Neutral-Basis
    vix = market.get("vixTerm", {}).get("vix", 20)
    if vix > 25: score += 15
    elif vix < 16: score -= 10
    # HYG/TLT Risk-Appetite
    hyg = _get_last(hist_data, "HYG")
    tlt = _get_last(hist_data, "TLT")
    if hyg and tlt:
        ratio = hyg / tlt
        # ... ratio vs 50d MA
    # Kupfer/Gold Ratio
    copper = market.get("snapshot", {}).get("copper", {}).get("price")
    gold = market.get("snapshot", {}).get("gold", {}).get("price")
    if copper and gold:
        cu_au = copper / gold * 1000
        # ... vs historischer Norm
    return max(0, min(100, score))
```

**WICHTIG:** JS-Funktion in index.html vor Port genau lesen — exakte Gewichtungen übernehmen.

### 3. treasury_stress
**Client-Logik:**
- Composite aus: 10Y-2Y Spread, MOVE-Index-Level, TLT vs SMA50
- Schwelle: caution ≥ 35, risk ≥ 60

**Aggregator-Datenquelle:**
- `market["moveIndex"]`: bereits vorhanden
- `market["zscores"]["vix"]`: als Proxy
- `hist_data`: TLT (hinzufügen falls nicht vorhanden)
- TNX/IRX aus `market["snapshot"]` (10Y/2Y Treasury Yields)

**Neue Funktion:** `calc_treasury_stress(market, hist_data) -> int`

### 4. bull_indicator
**Client-Logik (calcBullIndicator() in index.html):**
- Confluence-Score 0-100 aus: SPY/QQQ Trend, Breadth, IOS-Market-Score, Fear&Greed
- Schwelle: caution ≤ 35

**Aggregator-Datenquelle:**
- `ios_market["iosMarketScore"]`: bereits vorhanden ✅
- `market["fearGreed"]["score"]`: bereits vorhanden ✅
- SPY/QQQ aus `hist_data`: bereits vorhanden ✅

**Neue Funktion:** `calc_bull_indicator(ios_market, fear_greed, hist_data) -> int`
— einfachste der vier, da alle Inputs bereits vorhanden.

---

## Implementierungsplan (Sprint 21.07.2026)

### Schritt 1: JS-Funktionen lesen (30 Min)
Exakte Logik aus index.html extrahieren:
- `loadIntermarket()` → intermarket_score
- `calcTreasuryStress()` → treasury_stress  
- `calcBullIndicator()` → bull_indicator
- NDX-Breadth-Berechnung in `loadIntermarket()`

### Schritt 2: Python-Funktionen implementieren (60 Min)
```python
calc_ndx_breadth(hist_data) -> float | None
calc_intermarket_score(hist_data, market) -> int | None
calc_treasury_stress(market, hist_data) -> int | None
calc_bull_indicator(ios_market, fear_greed, hist_data) -> int | None
```

### Schritt 3: build_server_market_context() erweitern (30 Min)
```python
# Nach den bestehenden _add()-Calls:
ios_mkt = master.get("market", {}).get("iosMarket", {})
fg      = master.get("market", {}).get("fearGreed", {})

ndx_b  = calc_ndx_breadth(hist_data)
im_s   = calc_intermarket_score(hist_data, market)
tr_s   = calc_treasury_stress(market, hist_data)
bull_i = calc_bull_indicator(ios_mkt, fg, hist_data)

_add("ndx_breadth",       ndx_b,  _MCM_SIGNAL_RULES["ndx_breadth"])
_add("intermarket_score", im_s,   _MCM_SIGNAL_RULES["intermarket_score"])
_add("treasury_stress",   tr_s,   _MCM_SIGNAL_RULES["treasury_stress"])
_add("bull_indicator",    bull_i, _MCM_SIGNAL_RULES["bull_indicator"])
```

### Schritt 4: KV-Snapshot Verifikation (15 Min)
Nach Deployment manuellen Aggregator-Run triggern und prüfen:
```json
"marketContext": {
  "factors": {
    "ndx_breadth": { "value": 40.0, "signal": "caution" },
    "intermarket_score": { "value": 55, "signal": "caution" },
    "treasury_stress": { "value": 40, "signal": "caution" },
    "bull_indicator": { "value": 32, "signal": "caution" }
  }
},
"strategyGates": {
  "downgrades": [
    { "strategy": "momentum", "from": "green", "to": "amber", "factor": "ndx_breadth" },
    ...
  ]
}
```

---

## Erwartetes Ergebnis

- KV-Snapshot enthält korrekte Downgrades
- KI-Text im MB ist konsistent mit Live-Ampel
- `build_server_market_context()` ≡ `buildMarketContext()` im JS
- Kein Divergenz mehr zwischen Nachtlauf-Briefing und Live-MCM

---

## Abhängigkeiten

- `hist_data` muss HYG, TLT, DXY enthalten (prüfen ob bereits geladen)
- NDX-100 Ticker-Liste definieren (oder QQQ-Holdings als Proxy)
- Aggregator v5.13.0 (nächste Version nach diesem Sprint)
