# UIQ ÜBERGABE — 2026-07-23
*Erstellt: 23.07.2026, Abend | Version bei Abschluss: v395*

> ⚠️ Alle Angaben gelten als UNVERIFIED bis zur expliziten Browser-Verifikation.

---

## AKTIVER PAT
`ghp_***SESSION-PAT-REDACTED***`
Neuen 7-Tage-PAT zu Sessionbeginn erstellen unter:
GitHub → Settings → Developer Settings → Personal access tokens → Fine-grained → ahsub, scope: repo

---

## VERSIONS-STAND
```
axel-scanner (index.html):  v395
ko-aggregator:              v5.19.0 (Commit 77f430f)
ko-prompts.js:              v2.2.1  (Commit ab084ec)
ko-indicators-loader.js:    v1.3.2  (Commit 4de8824)
tr_layer.py:                v1.2    (Commit 775b086)
SUITE.md:                   v3.0    (Commit 40bc7c96)
```

---

## HEUTE ERLEDIGTE SPRINTS (23.07.2026)

### 1. Snapshot-Verifikation + Root-Cause scoreCc=0 ✅
- NYSE-Snapshot `2026-07-22_15.json.gz` (715 KB) verifiziert: 680 Ticker, Regime BULL_QUIET
- **Root Cause gefunden:** `scoreCsp`/`scoreCc` wurden in `build_leaderboards()` zwar berechnet
  (in `scored[]`), aber nie in `results` (= tickers-Output) zurückgemergt
- Fix: 2 Zeilen im Merge-Block (Zeile ~2855), Commit `d7c0656`
- Gleichzeitig `AGGREGATOR_VERSION` 5.12.4 → 5.18.0 (war vergessen worden)

### 2. Tightness-Metrik in Aggregator (v5.19.0) ✅
- `tightnessPct` = 5-Tage-Range / Kurs × 100 in `calc_vcp()` eingebaut
- Schwellwerte: <3% = "Tight" (Minervini-Ideal), <5% = akzeptabel
- In alle Return-Pfade + Merge-Block ergänzt
- Commit `77f430f`

### 3. ko-prompts.js v2.2.0 → v2.2.1 ✅
- **VCP-Prompt:** `vcpVolContraction` + `vcpBreakoutVol` als eigene Felder mit Schwellwerten
  (<0.6 = ausgetrocknet; ≥2.0 = Ausbruchsvolumen)
- **Breakout-Prompt:** `tightnessPct` (<3%=Tight), `vcpVolContraction`, `vcpBreakoutVol`
  als Felder + Tightness-Check in Aufgabe 2
- Commit `a2a813e` (v2.2.0), `ab084ec` (v2.2.1)

### 4. tr_layer.py v1.2 ✅
- `_ctx()`: `tightnessPct`, `vcpVolContraction`, `vcpBreakoutVol` als active_metrics_at_entry
- `_sim_trade()`: `exitDate` (Kalenderdatum) + `returnPct` (richtungsger. %) im Output
- Commit `775b086`

### 5. index.html v394 → v395 ✅
- CDN-Hash ko-prompts: `012a89f` → `a2a813e` → `ab084ec`

---

## P0 — SOFORT VERIFIZIEREN (nächste Session)

### Snapshot-Verifikation (nach GHA-Lauf heute Nacht ~04:00 UTC)
- `data/snapshots/2026-07-24_04.json.gz` oder `_06.json.gz` vorhanden?
- **Kritisch:** `scoreCc > 0` bei mindestens einigen Tickern? (war heute 0/680)
- `tightnessPct` im Ticker-Objekt befüllt?
- Meta zeigt `version: "5.19.0"`?
- Alpha Desk CC-Leaderboard zeigt jetzt andere Kandidaten als CSP?

---

## NÄCHSTE SPRINTS (P1 vollständig abgeschlossen)

### P1 — daily_market_snapshot Cache-Architektur ⭐ WICHTIGSTER BLOCKER VOR BETA
- Owner triggert alle Tier-1-API-Calls, Ergebnis in KV
- Beta-Tester lesen **nur** aus KV — kein direkter API-Zugriff
- Verhindert API-Quota-Erschöpfung bei mehreren Beta-Nutzern

### P2 — DE-Modus via Tradegate API
- Pre-Market-Scanner für US-Stocks auf GETTEX/Tradegate, 08:00–22:00 MEZ
- ~60 liquide US-Titel mit ISIN-Mapping

### P2 — ko-indicators-registry
- Zentrales JSON/JS-Modul in ko-modules
- Generischer Polling-Gate + Prompt-Building

### P3 — Track-Record erste hit30-Auswertung
- Frühestens Ende Juli (nach ~30 Handelstagen seit 02.07.2026)
- `tr:stats` KV-Key prüfen ob Daten aufgelaufen

---

## CDN-HASHES (aktuell)
```
ko-prompts.js            → ko-modules@ab084ec  (v2.2.1)
ko-indicators-loader.js  → ko-modules@4de8824
ko-market-state.js       → ko-modules@8838fb4
ko-home.js               → ko-modules@749e790
ko-scanner.js            → ko-modules@f6e398e
ko-darkpool.js           → ko-modules@99277ac
ko-data.js               → ko-modules@c3fa765
```

---

## IWV-UPDATE
Fällig Anfang August (letzte Aktualisierung 02.07.2026).
Monatspflicht: ishares.com → IWV → Holdings → CSV → `ko-aggregator/data/iwv_holdings.csv`

---

## STEHENDE REGELN
- IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
- Hast du das verifiziert oder übernommen? (bei Angaben aus Übergabeprotokoll)
- PAT nach Session löschen
- IWV-Update: erste August-Session nicht vergessen
