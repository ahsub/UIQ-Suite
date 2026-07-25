# UIQ Übergabeprotokoll — 25.07.2026

> ⚠️ **UEBERGABE-HEADER-REGEL:** Alle Angaben aus diesem Protokoll gelten als UNVERIFIED
> bis zur eigenständigen Verifikation (Console, GitHub, Browser). Keine Behauptung aus
> einem Protokoll ohne Beweis übernehmen.

---

## SESSION-ÜBERBLICK

| | |
|---|---|
| **Datum** | 25.07.2026 |
| **Frontendversion** | v401 |
| **Aggregatorversion** | v5.19.0 (unverändert) |
| **ko-indicators-loader** | v1.4.0 (neu heute) |
| **GHA-Runs heute** | keine (reine Frontend/Modul-Session) |
| **Repos berührt** | axel-scanner, ko-modules |

---

## ERLEDIGTE AUFGABEN (chronologisch)

### 1. Backlog #13b als hinfällig markiert

Dividende/Value-Scan-Logik war durch v371 (Entfernung beider Strategien aus UIQ,
17.07.2026) ohnehin obsolet. Keine Code-Änderung, nur Backlog-Klärung.

---

### 2. Backlog #13a — `STRATEGY_TO_LB` vervollständigt — v399 (`85658fb0`)

**Problem:** `breakout` und `vcp` fehlten in der `STRATEGY_TO_LB`-Map in
`renderGateWidget()`. Beide Ampel-Chips waren optisch als Button gestaltet
(LB-Tab existiert), navigierten aber nirgendwo hin.

**Fix:** Zwei Zeilen in index.html (~Zeile 5494):
```javascript
breakout: 'long_breakout',   // NEU
vcp:      'vcp_setups',      // NEU
```

**Vollständige Map jetzt:**
- `ko` → `ko_long` ✅
- `momentum` → `long_minervini` ✅
- `breakout` → `long_breakout` ✅ NEU
- `vcp` → `vcp_setups` ✅ NEU
- `swing` → `long_swing` ✅
- `meanrev` → `long_mr` ✅
- `fading_short` → `short_fading_ko` ✅
- `csp_wheel` → `options_csp` ✅
- `cc` → `options_cc` ✅
- `atmna` / `weekly_income` / `collar` → kein LB-Tab → bleiben Info-Pillen ✅

---

### 3. Backlog #20 — `dataQuality`-Flag — ko-indicators-loader v1.4.0 + v400 (`aa858e0` / `3fd4d2f4`)

**ko-modules Commit `aa858e0` (ko-indicators-loader v1.4.0):**

Neuer Block am Ende von `buildMarketContext()`, nach `risk_level`-Aggregation:

```javascript
// Kern-Indikatoren: promptWeight 'hoch' oder 'sehr_hoch' (10 Stück)
ctx.dataQuality = pct >= 0.8 ? 'full' : pct >= 0.4 ? 'partial' : 'minimal';
ctx._dataQualityDetail = { filled, total, pct, missing[] };
```

Kern-Indikatoren (10): `vix`, `vix_term`, `intermarket_score`, `bull_indicator`,
`treasury_stress`, `tnx`, `ios_market`, `mse_regime`, `hy_spread`, `net_liquidity`

Console-Log jetzt: `[MCM] ... | dataQuality: partial (7/10 Kern) | fehlend: hy_spread,tnx`

**index.html v400 (`3fd4d2f4`):**

Tearsheet-Header-Subtitle zeigt Badge wenn `partial` oder `minimal`:
- `⚠️ Teildaten` (gelb) — 40–79% Kern-Faktoren befüllt
- `🔴 Minimaldaten` (rot) — <40% Kern-Faktoren befüllt
- Tooltip: `"Datenbasis: 7/10 Kern-Indikatoren befüllt · Fehlend: hy_spread, tnx"`
- Bei `full` kein Badge (kein Rauschen)

**CDN-Hash aktualisiert:** `ko-indicators-loader`: `4de8824` → `aa858e0`

---

### 4. Backlog #13c/f — Pattern/Entry-Engine im DeepDive — v401 (`d488683e`)

**Kontext:** `ios_pattern_entry_engine.py` (VCP/Pocket-Pivot/Darvas-Mustererkennung +
Entry-Timing) war seit 10.07.2026 im Aggregator verdrahtet und läuft in jedem
Nacht-Run. `patternEntry` sitzt in den KV-Daten — wurde aber nirgendwo im
Frontend genutzt.

**Drei Änderungen in index.html:**

**(A) `kvToScannerState()` (~Zeile 7617):**
```javascript
patternEntry: r.patternEntry || null,
```
Durchreichung KV → State-Objekt. Graceful: `null` wenn Engine nicht lief
(z.B. zu wenig Historien-Bars).

**(B) `renderDeepDiveTech()` — neuer Block `dd-pattern-entry`:**

Neues DOM-Element zwischen Marktkontext und ATR-Positionsgröße (Zeile ~2926):
```html
<div id="dd-pattern-entry" style="display:none;..."></div>
```

JS-Block am Ende von `renderDeepDiveTech()`:
- Zeigt Pattern-Score + Muster-Name (VCP/Darvas/Pocket-Pivot) + Signal
  (STRONG_BUY / BUY / WATCH) mit Farbe
- Zeigt Entry-Timing-Score + Grade (A/B/C) + Action + Setup-Bezeichnung
- 6 Preis-Punkte als 3×2-Mini-Grid: BuyStop, Suggested, LimitPullback,
  NormalEntry, DeepPullback, MaxBuy — je mit % Abstand zum aktuellen Kurs
- Grün = Preis ≤ aktueller Kurs (erreichbar), Amber = Preis > Kurs (noch nicht)
- Block bleibt `display:none` wenn `patternEntry` null oder `ok:false`

**(C) `generateDeepDiveKI()` — KI-Prompt-Context:**
```
Pattern-Score: 72/100 · Bestes Muster: VCP · Signal: BUY
Entry-Preise: BuyStop $155.40 | Suggested $153.20 | LimPullback $151.80 | MaxBuy $157.00
Entry-Timing: Score 68/100 · B · WAIT_PULLBACK · Setup: Trend+Momentum
```
KI kann jetzt Entry-Preispunkte explizit in die Einschätzung einbeziehen.

---

## OFFENE PUNKTE / NÄCHSTE SESSION

### Sofort aktionierbar

- **Backlog #19 Prio 4** — kosmetische Restfunde (r-portfolio-rec, list-select,
  ki-dropdown-wrap, overheat-text/sektor-overheat-content, preset-select-Namensdrift).
  Niedrige Dringlichkeit, kein funktionaler Gewinn — bei Gelegenheit, kein eigener
  Sprint nötig. Könnten heute am Ende erledigt werden wenn Zeit.

### Neue Herausforderungen — Suite-Ebene

Der Backlog ist heute bis auf Prio-4-Kosmetik vollständig abgearbeitet.
Mögliche nächste Richtungen (zur Diskussion morgen):

1. **Track-Record-Review vorbereiten** — ab ~02.08.2026 (Tag 30) sind erste
   `hit30`-Metriken auswertbar. Frühzeitig `tr:stats` KV-Key prüfen ob Daten
   aufgelaufen sind; Auswertungs-Dashboard konzipieren.

2. **Beta-Readiness-Audit** — welche Punkte müssen noch vor Beta-Launch
   abgehakt sein? (daily_market_snapshot Cache-Architektur Owner-only, Beta-Token-
   Verwaltung, Rate-Limiting ko-ai-worker).

3. **DE-Modus Erweiterung (P2-A Follow-up)** — `_tgPremarketMode`-Reset-Bug
   (niedrige Prio); TRADEGATE_MAP ggf. um weitere Ticker erweitern.

4. **IWV-Update** — fällig Anfang August 2026 (letzte Aktualisierung 02.07.2026).
   Daran zu denken wenn die erste August-Session startet.

---

## CDN-HASHES (Stand v401)

```
ko-config.js             → ko-modules@03ef406
ko-indicators.js         → ko-modules@03ef406
ko-markov.js             → ko-modules@03ef406
ko-scoring.js            → ko-modules@03ef406
ko-home.js               → ko-modules@749e790
ko-market-state.js       → ko-modules@8838fb4
ko-darkpool.js           → ko-modules@99277ac
ko-indicators-loader.js  → ko-modules@aa858e0  ← HEUTE GEÄNDERT (v1.4.0)
ko-prompts.js            → ko-modules@ab084ec
ko-strategies.js         → ko-modules@4bcfe18
ko-data.js               → ko-modules@c3fa765
ko-scanner.js            → ko-modules@f6e398e
```

---

## COMMITS DIESER SESSION

| Commit | Repo | Beschreibung |
|---|---|---|
| `85658fb0` | axel-scanner | v399: STRATEGY_TO_LB breakout+vcp ergänzt (Backlog #13a) |
| `aa858e0` | ko-modules | ko-indicators-loader v1.4.0: dataQuality-Flag (Backlog #20) |
| `3fd4d2f4` | axel-scanner | v400: dataQuality-Badge im Tearsheet + CDN-Hash aa858e0 |
| `d488683e` | axel-scanner | v401: Pattern/Entry-Engine im DeepDive (Backlog #13c/f) |

---

## IWV-REMINDER

📅 IWV_holdings.csv Update fällig **Anfang August 2026**
(letzte Aktualisierung: 02.07.2026 — nächste Session könnte bereits August sein)
