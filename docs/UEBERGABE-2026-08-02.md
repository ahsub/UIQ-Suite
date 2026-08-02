# ÜBERGABE 2026-08-02 — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 02.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v408** (axel-scanner) | `6ee2f32bb1` |
| **Aggregator** | **v5.24.0** | `cbb1b7f419` |
| **UIQ-Suite docs** | TVA_MATHLIB_ANALYSE.md neu | `18100e1e8b` |
| GHA letzter Run | #177 — ✅ success | 02.08.2026 09:02 UTC |
| IWV Holdings | 24.07.2026 (aktuell, kein Update nötig) | — |

---

## Vollständige Commit-Liste heute

### ko-aggregator (5 Commits)
| SHA | Version | Was |
|---|---|---|
| `451f43d304` | v5.21.0 | RS-Rank Score (SPY+IWM) + Distribution Days |
| `201e069ded` | v5.22.0 | Anchored VWAP (Zeiierman EWMA, 52W-Tief-Anker) |
| `cccd3fe72b` | v5.23.0 | AVWAP ETF-Filter + Minervini Sigmoid (TVA) |
| `cbb1b7f419` | v5.24.0 | Order Block Detector (Zeiierman+BigBeluga+Flux) |

### axel-scanner (7 Commits)
| SHA | Version | Was |
|---|---|---|
| `665d1e84c6` | v402 | RS-Rank Badge + DD-Warnblock Tearsheet |
| `a8ca5accfe` | v403 | RS-Rank DeepDive rs001–rs006 Checkboxen |
| `ae89619eb7` | v404 | AVWAP DeepDive Block + CSP-Zone Hinweis |
| `fed4b63a12` | v405 | AVWAP Badge in Ticker-Cards |
| `7fa3a31da3` | v406 | Order Block Zones DeepDive Modal |
| `57d446c7ed` | v407 | OB-Badge in Ticker-Cards |
| `6ee2f32bb1` | v408 | DE-Modus: TG-Delta + TRADEGATE_MAP +25 |

### UIQ-Suite (2 Commits)
| SHA | Was |
|---|---|
| `18100e1e8b` | TVA_MATHLIB_ANALYSE.md (Referenzdokument Sprint A/B) |
| (dieses Protokoll) | UEBERGABE-2026-08-02.md |

---

## Neue Features im Detail

### 1. RS-Rank Score (v5.21.0 + v402/v403)
- **Funktion:** `compute_rs_rank_score()` — 6 Bedingungen (rs001–rs006) analog IOS
- **Benchmark:** Dual SPY + IWM parallel, kombinierter Score = Durchschnitt
- **KV-Felder:** `rsScore`, `rsScoreSpy`, `rsScoreIwm`, `rsNewHigh`, `rsGrade`
- **Frontend:** Badge in Card-Header + DeepDive rs001–rs006 Checkboxen
- **Live:** 703/711 Ticker berechnet (Run #175)

### 2. Distribution Days (v5.21.0 + v402)
- **Funktion:** `compute_distribution_days()` — O'Neil/IBD 25T-Lookback
- **Aktueller Status:** SPY 7 DD / QQQ 9 DD = 🔴 **DANGER**
- **Frontend:** Tearsheet-Warnblock (amber/rot je Severity)
- **MCM:** `distributionDays` als neues MCM-Feld

### 3. Anchored VWAP (v5.22.0 + v404/v405)
- **Funktion:** `compute_anchored_vwap()` — EWMA nach Zeiierman, Anker = 52W-Tief
- **Formel:** `alpha = 1 - e^(-ln(2)/apt)`, apt=20 → α=0.034
- **ETF-Filter:** SECTOR_ETFS + CRYPTO_TICKERS ausgenommen (v5.23.0)
- **KV-Felder:** `avwap`, `avwapAnchorDate`, `avwapAnchorPrice`, `distToAvwapPct`, `avwapAbove`, `avwapSlope`
- **Frontend:** Badge ⚡🔥⚓⚠ + DeepDive-Block + KI-Prompt

### 4. Minervini Sigmoid (v5.23.0)
- **Quelle:** TVA MathLibrary `f_buyProbability`-Konzept
- **Formel:** `s_sigmoid = 100 / (1 + e^(-0.06 × (raw-50)))`
- **Wirkung:** Verhindert extreme Score-Sprünge, belohnt Signalhäufung

### 5. Order Block Detector (v5.24.0 + v406/v407)
- **Hybrid:** Zeiierman (Detection+Ranking) + BigBeluga (VolPct) + Flux (Bull/Bear-Split)
- **Detection:** Candle-Flip + ATR-Body-Filter (min_body_atr=0.3)
- **Ranking:** `qualityScore = size×100 + volScore×10 + trendScore×20 - mit×50 - age×0.1`
- **KV-Felder:** 17 Felder (obBullHigh/Low/Date/Score/DistPct/MitPct/VolPct + Bear-Pendant + Counts)
- **Frontend:** DeepDive-Block + Confluence-Matrix (AVWAP+OB) + OB-Badge
- **Live:** 507/711 Ticker mit Bull-OB (Run #177)
- **CSP-Confluence heute:** 12 Titel mit AVWAP-Zone + OB-Zone gleichzeitig

### 6. DE-Modus Verbesserungen (v408)
- **TG-Delta:** `closes[-1]/closes[-2]-1` in EUR — Badge `🇩🇪 TG +1.23%` (grün/rot)
- **TRADEGATE_MAP +25:** IWV Top-100 jetzt ~96% abgedeckt
  - Kritische Korrekturen: `CTAS→CTS`, `CB→CBE` (hätten .F-Fallback falsch geliefert)
  - Neue direkte Mappings: UNH, MDT, BSX, SYK, ZTS, DHR, ETN, MMC, NEE, LIN, AMT, PLD, LOW, TJX, u.a.

### 7. TVA MathLibrary Referenzdokument
- **Datei:** `ahsub/UIQ-Suite/docs/TVA_MATHLIB_ANALYSE.md`
- **Inhalt:** 14 Funktionen analysiert, Python-Port-Snippets, Sprint-Einteilung
- **Status Sigmoid:** bereits in v5.23.0 aktiv → **Sprint A noch offen**

---

## Noch offene Sprints

### 🔴 Sprint A — TVA MathLibrary (nächste Session, docs vorhanden)
Siehe `docs/TVA_MATHLIB_ANALYSE.md` für vollständige Spezifikation.

| Funktion | Was | UIQ-Heimat |
|---|---|---|
| `f_stdTrendScore` | Trend Score −100..+100 (EMA+RSI+ADX) | neues Feld `trendScore` in process_ticker |
| `f_marketRegime` | 8 Regime + 3-Bar Hold | Ergänzung zu Markov |
| `f_chopIndex` | Chop Index 0–100 (ADX+DI+ER+BB) | MCM-Faktor |
| `f_sellProbability` | Sigmoid für score_short_breakdown | analog Minervini |

**Offene Lücken für f_buyProbability-Vervollständigung:**
- ADX-Wert pro Ticker fehlt noch in process_ticker
- `distToAvwapPct` als Support-Distanz in Minervini nutzen (AVWAP ist live!)

### 🟡 Mittelfristig
- **DE-Modus:** TG-Delta auch im DeepDive anzeigen (`raw._tgDelta` bereits gesetzt)
- **OB-Detector:** Bearish OB-Badge in Ticker-Cards (nur Bull bisher)
- **VCP Sprint 2:** Volumen-Bestätigung (Backlog #18)
- **Track-Record Phase C:** Papertrading Modus A+B

### ⏳ Zeitgesteuert
- **IV-Rank:** ab ~12.08.2026 (30 Archiv-Tage)
- **regimeConfidence:** ab Sept. 2026 (60 Track-Record-Tage)
- **sizingMultiplier:** ab Sept. 2026

---

## Monatliche Aufgabe
- **IWV Holdings Update:** nächstes Fälligkeitsdatum ~02.09.2026
  (Stand 24.07.2026 — monatlich von iShares neu laden)

---

## GHA Run-Verifikation
- Run #175: v5.21.0 — RS-Rank 703/711 ✅, DD SPY 7/QQQ 9 DANGER ✅
- Run #176: v5.22.0 — AVWAP 705/711 ✅ (ETF-Anomalien TIPS/VCSH behoben in v5.23.0)
- Run #177: v5.24.0 — OB 507/711 ✅, 12 CSP-Confluence-Kandidaten ✅
- Snapshot: `data/snapshots/2026-08-02_09.json.gz` (914 KB)

---

*UIQ Suite Übergabe 02.08.2026 · Aggregator v5.24.0 · Frontend v408*
