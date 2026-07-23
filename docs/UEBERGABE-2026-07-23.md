# UIQ ÜBERGABE — 2026-07-23
*Erstellt: 23.07.2026, ~10:00 UTC | Version bei Abschluss: v393*

> ⚠️ Alle Angaben gelten als UNVERIFIED bis zur expliziten Browser-Verifikation.

---

## AKTIVER PAT
`ghp_***SESSION-PAT-REDACTED***`
Neuen 7-Tage-PAT zu Sessionbeginn erstellen unter:
GitHub → Settings → Developer Settings → Personal access tokens → Fine-grained → ahsub, scope: repo

---

## VERSIONS-STAND
```
axel-scanner (index.html):  v393
ko-aggregator:              v5.18.0 (Commit 2ce4d2ab)
ko-prompts.js:              v2.1.2  (Commit 012a89f, CDN-Hash: 012a89f)
ko-indicators-loader.js:    v1.3.2  (Commit 4de8824)
SUITE.md:                   v3.0    (Commit 40bc7c96)
snapshot_reader.py:         v1.0.0  (Commit 08409922)
```

---

## HEUTE ERLEDIGTE SPRINTS (22.07.2026)

### 1. Rolling-Window-Snapshot-Archiv (v5.16.0) ✅
- `data/snapshots/YYYY-MM-DD_HH.json.gz` — gzip'd master_market_data, 2×/Tag
- 90-Tage-Rotation automatisch im Aggregator
- GHA-Workflow commitet Snapshots nach jedem Run
- `snapshot_reader.py` für Cross-Repo-Zugriff (KV + GitHub-Archiv)
- **Verifikation:** `2026-07-22_04.json.gz` (688 KB) im Repo vorhanden ✅
- **Ausstehend:** Erster echter Snapshot mit Marktdaten (NYSE-Lauf 13:30 UTC)

### 2. CC-Scoring v2.0 (v5.17.0) ✅
`score_options_covered_call()` vollständig neu geschrieben:
- RSI-Optimum: 60-75 (war 55-70)
- Regime: Side +30 > Bull +20 (Seitwärts ideal)
- HVP Sweet Spot: 40-75 (war 30-65)
- Gate: Kurs 0.92-1.20 × EMA50
- BBPos 0.50-0.80: +15
- Fib: RETRACEMENT +12 (statt EXTENSION)

### 3. VCP-Volumen Sprint 2 (v5.17.0) ✅
- `vcpVolContraction`: Volumen Contraction vs. 20T-Schnitt (<0.6 = stark getrocknet, +15 Pts)
- `vcpBreakoutVol`: letzter Bar volRatio (≥2.0× = +15 Pts)
- Beide in `score_vcp()` und Leaderboard `extra_fields`
- Backlog #18 erledigt ✅

### 4. Alpha Desk Datenlücken-Fix (v5.18.0 + v391) ✅
**Root Cause war zweigeteilt:**
- `top20()` im Aggregator: nur 6 Felder → jetzt 21 Kern-Felder
  (MACD, OBV, volRatio, HVP, EMA50/200, pctFromHigh52, dist200, BBPos, rsRating, avgVol20, overheat)
- `runAlphaLbKI()` im Frontend: Prompt-String nur 6 Felder → jetzt alle Kern-Felder + VCP-spezifische

### 5. Options-Desk CC-Button + Bugfixes (v392/v393) ✅
- "📝 Covered Call" KI-Button im Options-Desk ergänzt
- `runOptionsKiBriefing('options')` → `'csp_wheel'` (alter Key-Bug)
- `runOptionsKiBriefing()`: KoPrompts-Check statt KI_STRAT_CONFIG-Check
  (war: `if (!stratCfg)` → schlug fehl weil KI_STRAT_CONFIG kein .label hat)
- Label-Variable um `cc` und `csp_wheel` erweitert

---

## OFFENE PUNKTE / NÄCHSTE SESSION

### P0 — sofort beim nächsten Start verifizieren
- **NYSE-Lauf Verifikation** (heute 13:30 UTC / 15:30 MEZ):
  - `data/snapshots/2026-07-22_13.json.gz` vorhanden?
  - Breakout-Tab im Alpha Desk zeigt Kandidaten?
  - VCP-Leaderboard: `vcpVolContraction` und `vcpBreakoutVol` befüllt?
  - CC-Leaderboard: andere Kandidaten als CSP nach v2.0?
  - Alpha Desk Prompts: MACD/OBV jetzt in KI-Text sichtbar?
- **Options-Desk nach Hard-Refresh testen:**
  - CSP/Wheel KI-Button funktioniert? (war: "Strategie unbekannt")
  - Covered Call KI-Button funktioniert?
  - CC-Score-Chips (`scoreCc`) auf Ticker-Karten sichtbar?

### P1 — diese Woche
- Breakout-Prompt: VCP-Prompt in ko-prompts.js um vcpVolContraction/vcpBreakoutVol ergänzen
- Breakout: Tightness-Metrik (5-Tage-Range <3-5%, Minervini "Tightness")
- Ausstehend aus KIMI-Analyse: Track-Record-Layer um exit_date/return_pct/active_metrics_at_entry erweitern (Voraussetzung für Bayes'sches Update später)

### IWV-Update
- Fällig Anfang August (letzte Aktualisierung 02.07.2026)
- Monatspflicht: ishares.com → IWV → Holdings → CSV → `ko-aggregator/data/iwv_holdings.csv`

---

## CDN-HASHES (aktuell)
```
ko-indicators-loader.js  → ko-modules@4de8824
ko-prompts.js            → ko-modules@012a89f  (v2.1.2)
ko-market-state.js       → ko-modules@8838fb4
ko-home.js               → ko-modules@749e790
ko-scanner.js            → ko-modules@f6e398e
ko-darkpool.js           → ko-modules@99277ac
ko-data.js               → ko-modules@c3fa765
```

---

## STEHENDE REGELN
- IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
- Hast du das verifiziert oder übernommen? (bei Angaben aus Übergabeprotokoll)
- PAT nach Session löschen
- IWV-Update: erste August-Session nicht vergessen

