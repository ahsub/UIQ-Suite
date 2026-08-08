# ÜBERGABE 2026-08-08 (Abend) — Refundex + UIQ

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 08.08.2026 Abend)

| Komponente | Stand | Commit |
|---|---|---|
| **ko-flex.js** | **v1.3** | `c6ebbc9b` |
| **kap.html** | CDN→v1.3 + Badge | `fe371da5` |
| **ROADMAP** | **v2.2** | `ae1a673b` |
| **CODING-RULES.md** | **v1.2** | `a6937d4` |
| **SUITE.md** | Backlog №39–43 | `00f8492` |

---

## Was heute passiert ist

### Session 1 (Morgen) — UIQ Regelwerk-Sprint
- CODING-RULES v1.1→v1.2: §2.4–2.8 aus SWOT-Review + Pine-Script-Analyse
- SUITE.md Backlog №39–43: RS-Neuhoch, OBV, Portfolio-Heat/Capping, Extension-Penalty, Leadership (zurückgestellt)
- Architekturentscheidungen C+D (Portfolio-Heat = DCE-Baustein) und E (Leadership post-01.10.)

### Session 2 (Nachmittag) — Refundex To-dos + XML-Validierung
- KiSt-Ergebnisanzeige (`getKiStSummary()`) in kap.html integriert
- ROADMAP 2.8–2.11 + 1.3 als ✅ markiert (v1.8→v1.9)
- SWOT-Konsolidierung (Stub), CLIENT-MSE-DOKU.md v1.0

### Session 3 (Abend) — XML-Parser + Steuerrechtliche Klarstellung

**Validierung XML vs. PWC German Tax Report 2024:**
3 XML-Files (2023–2025) gegen PWC-PDF verglichen.

**Kernerkenntnis §20 EStG:**
- Z.21 = alle SELL-OPT-netCashEur (Stillhalterprämien, sofort steuerpflichtig im Jahr der Einnahme)
- Z.24 = alle BUY-OPT-netCashEur (Schließungskosten, im Jahr der Zahlung)
- Cash-Basis, kein FIFO-Matching nötig
- Validiert vs. PWC 2024: **Δ = 0,01 EUR** (Rundungsdifferenz)
- Gemeinschaftskonto-Split ÷2 bereits in `projiziereErgebnis()`

**Commits:**
| Commit | Was |
|---|---|
| `c181491` | ko-flex.js v1.2 — Z.21/Z.24 Cash-Basis in buildActivitySummary |
| `c6ebbc9b` | ko-flex.js v1.3 — yearlyResults mit optGainEur/optLossEur befüllt |
| `fe371da5` | kap.html — CDN→v1.3 + Modus-A-Badge |
| `ae1a673b` | ROADMAP v2.2 — FIFO 2.13 entfällt, Cash-Basis dokumentiert |

**Dual-Mode-Strategie (ROADMAP v2.0):**
- Modus A: Cash-Flow-Ansicht (implementiert, Badge aktiv)
- Modus B: Eigenberechnung (Gate-Kriterien offen, FIFO entfällt dank §20-Klarstellung)
- 2.14/2.15 geparkt bis weiterer Bedarf klar

---

## Offene To-dos

| Was | Wer | Wann |
|---|---|---|
| Browser-Test kap.html mit 2024_Complete.xml | Axel | nächste Session |
| Rechtsgutachten WpHG/WpIG (UIQ) | Axel | diese Woche |
| Beta-Tokens aktivieren (UIQ) | Axel | diese Woche |
| №43 Leadership-Faktor MSE prüfen | Claude | **01.10.2026** |
| IWV Holdings CSV Update | Axel | ~27.08.2026 |

---

## Nächstes Projekt: CapTrader Portfolio & Options

**Axel freut sich drauf** — das ist das nächste große Thema.
Vermutlich: ko-journal.js-Integration, OptionsDoktor-Datenbasis,
Portfolio-Heat (SUITE.md Backlog №41).

---

## STEHENDE REGELN
- IMMER zuerst Konsolen-Check, dann Code anfassen
- Hast du das verifiziert oder übernommen?
- PAT nach Session löschen
- №43 Leadership-Faktor: Erinnerung 01.10.2026

---

## Abend-Addendum (späte Session)

### UIQ — Morning-Briefing-Bug v454 behoben
**Symptom:** SENTIMENT-Abschnitt zeigte `[object Object]` für IOS Market Score
und `n/v` für Fear & Greed — obwohl beide Werte im KV vorhanden.

**Root Cause:** Server-Briefing (`generate_daily_snapshot()`) hatte IOS Market
Score nie in `mlines` — KI erfand ihn aus Training. Fear & Greed: `fg.get('score')`
lieferte `None` bei leerem Dict → kein Eintrag → KI schrieb `n/v`.

**Fix:** `market_aggregator.py` v5.36.0 — `772549b`
- IOS Market Score in `mlines` ergänzt (Score + Rating + Decision)
- Fear & Greed robuster Check (`is not None` statt Truthy-Check)
- Prompt-Sentinel um IOS Score erweitert

### UIQ Data Foundation — Backlog №44 verankert
**Strategische Erkenntnis:** Der Bug hat offenbart dass wir ~35 Metriken ohne
einheitliches Schema, ohne Freshness-Garantie und ohne strukturierte History haben.
Das ist der fehlende Unterbau für Meta-Signal (№30), BN/HMM/NN (ML_KONZEPT §3b)
und DCE.

**Entscheidung (Axel + Claude, 08.08.2026):**
- Pareto: täglich, SQLite, Validator, Zeitreihen-Kontext im Briefing
- Container: KV (Live) + SQLite `data/metrics.db` (History/Backtest)
- 35 Zeitreihen in 3 Klassen
- **Trigger: nach Phase-0 (~01.10.2026), vor BN-Training**

Commits: SUITE.md №44 `60a94c0` · ML_KONZEPT v1.1 `fc7faff`

### Commits heute gesamt (chronologisch)
| Commit | Repo | Was |
|---|---|---|
| `1161ff2` | UIQ-Suite | CODING-RULES v1.1 |
| `a6937d4` | UIQ-Suite | CODING-RULES v1.2 |
| `00f8492` | UIQ-Suite | SUITE.md №39–43 |
| `518e185` | refundex | ROADMAP v1.8 |
| `c334a56` | UIQ-Suite | SWOT-Stub |
| `54f8c41` | UIQ-Suite | CLIENT-MSE-DOKU v1.0 |
| `2367883` | refundex | kap.html KiSt-Box |
| `c181491` | refundex | ko-flex.js v1.2 |
| `c6ebbc9b` | refundex | ko-flex.js v1.3 |
| `fe371da5` | refundex | kap.html CDN+Badge |
| `ae1a673b` | refundex | ROADMAP v2.2 |
| `772549b` | ko-aggregator | market_aggregator v5.36.0 |
| `60a94c0` | UIQ-Suite | SUITE.md №44 Data Foundation |
| `fc7faff` | UIQ-Suite | ML_KONZEPT v1.1 §2b |

**Nächste Session: CapTrader Portfolio & Options-Projekt**
