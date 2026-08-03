# ÜBERGABE 2026-08-03 — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 03.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Aggregator** | **v5.25.0** | `f8fe35ee59` |
| **Frontend** | **v408** (unverändert) | `6ee2f32bb1` |
| **GHA Run** | #183 — ✅ success | 03.08.2026 11:36 UTC |
| **SUITE.md** | v3.1 | `d70a28f3cb` |
| **TVA_MATHLIB_ANALYSE.md** | ML-Abschnitt ergänzt | `7f0892c114` |
| **ML_KONZEPT.md** | v1.0 (neu) | `9aeb210395` |
| **VISION_2030.md** | v1.0 (neu) | `072fb019ab` |

---

## Technische Commits heute

### ko-aggregator (1 Commit)
| SHA | Version | Was |
|---|---|---|
| `f8fe35ee59` | v5.25.0 | TVA Sprint A: trendScore, confluenceScore, sellProbability Sigmoid, AVWAP-Gate Minervini |

### UIQ-Suite/docs (3 Commits)
| SHA | Datei | Was |
|---|---|---|
| `7f0892c114` | TVA_MATHLIB_ANALYSE.md | ML-Konzept-Abschnitt + DSS-Kette ergänzt |
| `9aeb210395` | ML_KONZEPT.md | Neu: BN/HMM/NN Phasenplan v1.0 |
| `d70a28f3cb` | SUITE.md | v3.1: §0 DSS-Leitprinzip |
| `072fb019ab` | VISION_2030.md | Neu: Drei-Engine-Architektur v1.0 |

---

## v5.25.0 — TVA Sprint A Details

### Neue Felder (alle 711/711 Ticker befüllt, Run #183 verifiziert)

| Feld | Typ | Beschreibung |
|---|---|---|
| `trendScore` | float −100..+100 | f_stdTrendScore: EMA-Stack (60%) + RSI (40%) × ADX-Konviktions-Multiplikator |
| `confluenceScore` | int 0–100 | f_confluenceScore: 5 Faktoren à 20 Punkte (Trend/Momentum/Volumen/AVWAP/OB) |

### Neue Funktionen
- `calc_std_trend_score(price, ema20, ema50, ema200, rsi, adx)` → TVA f_stdTrendScore portiert
- `calc_confluence_score(r)` → 5-Faktor Confluence (Trend+Momentum+Volumen+AVWAP+OB)
- Sigmoid in `score_short_breakdown()` → f_sellProbability (k=0.06, analog Minervini)
- Gate 9 in `score_long_minervini()` → distToAvwapPct als Support-Distanz (+15 in AVWAP-Zone)
- `ema20v` jetzt in `process_ticker()` berechnet (war vorher nicht als Einzelwert verfügbar)

### Validierte Live-Werte (Run #183)
- trendScore: min=−41.7, max=+47.8, median=+9.2 (ADX-Dämpfung korrekt — Markt niedrig-direktional)
- confluenceScore: min=0, max=82, median=41 — Top: PSA/F/STNG (82, AVWAP+OB-Confluence)
- Coverage: 711/711 trendScore ✅, 711/711 confluenceScore ✅

---

## Strategische Dokumente heute

### SUITE.md §0 — DSS-Leitprinzip (verbindlich, schlägt alle anderen Abschnitte)
- UIQ ist ein diagnostisches Entscheidungssystem
- Drei Fragen in Reihenfolge: **Ob → Wie → Was** (Gate-Architektur, kein Scanner-Bias)
- Filtertest für jede neue Idee: Hilft es ob/wie/was zu entscheiden? Sonst: nicht ins Produkt
- Erfolgsmaßstab: Schutz-Versprechen, nicht Rendite-Versprechen

### ML_KONZEPT.md v1.0
- BN (Phase 1, Sept. 2026): Cross-Section-Analyse, Redundanz eliminieren, Score-Kalibrierung
- HMM (Phase 2, Okt. 2026): MCM-Zeitreihen, `mcmHmmRegime` als neues KV-Feld
- NN (Phase 3, Q1 2027): nur wenn HMM Lücken zeigt, LSTM(32) auf Regime-Labels
- Datenbasis-Constraints: heute 32 Handelstage — BN sofort, HMM ab Okt., NN ab 2027

### VISION_2030.md v1.0 — Drei-Engine-Architektur
Die wichtigste strategische Entscheidung dieser Session:

**Engine 1 — Market Intelligence Engine (MIE):** heute produktiv, im Wesentlichen fertig
**Engine 2 — Decision Confidence Engine (DCE):** der fehlende Kern-Algorithmus
- Konfidenzwert 0–100 mit 6 Dimensionen (Makro/Breadth/Vola/DarkPool/Sektoren/Kalender)
- Jede Dimension: Score 0–5 Sterne + kurze Begründung (anti-Black-Box)
- Handlungs-Gate: DCE < 50 → keine neuen Positionen empfohlen
- Geplant: Q1 2027

**Engine 3 — Investor Profile Engine (IPE):** das personalisierende Herzstück
- ~15 Fragen: Depotgröße, Ziel, Risiko, Optionserfahrung, Horizont, max. Drawdown
- Gleiche Marktanalyse → unterschiedliche Handlungsempfehlungen je Profil
- Investor A (35J, Wachstum): Momentum/Breakout
- Investor B (66J, Cashflow, Wheel): CSP/CC/defensive Basiswerte
- Geplant: Q2–Q3 2027

**Investment Coach:** KI-Gespräche auf vollem Drei-Engine-Kontext (2028)

---

## Offene Punkte / Nächste Session

### 🔴 Frontend ausstehend (v409)
- `trendScore`-Badge in Ticker-Cards
- `confluenceScore`-Anzeige (DeepDive oder Card-Header)
- DCE-Konzept: kein Bau, aber UI-Skizze sinnvoll

### 🟡 Mittelfristig
- BN-Analyse: wartet auf ~60 Snapshot-Tage (ca. 01.09.2026)
- DE-Modus: TG-Delta auch im DeepDive (`raw._tgDelta` bereits gesetzt)
- OB-Detector: Bearish OB-Badge in Ticker-Cards
- Track-Record Phase C: Papertrading Modus A+B

### ⏳ Zeitgesteuert
- IV-Rank: ab ~12.08.2026 (30 Archiv-Tage)
- BN-Analyse: ab ~01.09.2026 (60 Snapshot-Tage)
- MCM-HMM: ab ~01.10.2026 (90 MCM-Tage)

---

## IWV Holdings
Nächste Fälligkeit: ~02.09.2026 (Stand 24.07.2026 noch gültig)

---

*UIQ Suite Übergabe 03.08.2026 · Aggregator v5.25.0 · Frontend v408*
*Strategischer Meilenstein: Drei-Engine-Architektur (MIE/DCE/IPE) konzipiert und dokumentiert*
