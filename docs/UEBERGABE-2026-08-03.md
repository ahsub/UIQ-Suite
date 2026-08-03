# ÜBERGABE 2026-08-03 — UIQ Suite Session (aktualisiert)

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 03.08.2026 18:20 UTC)

| Komponente | Stand | SHA |
|---|---|---|
| **Aggregator** | **v5.25.0** | `f8fe35ee59` |
| **Frontend** | **v431** | `e0737644d5` |
| **GHA Run** | #183 — ✅ success | 03.08.2026 11:36 UTC |
| **SUITE.md** | v3.2 | `298f1f3417` |
| **ML_KONZEPT.md** | v1.0 | `9aeb210395` |
| **VISION_2030.md** | v1.1 | `01b0e23bf8` |
| **TVA_MATHLIB_ANALYSE.md** | ML-Abschnitt | `7f0892c114` |

---

## Aggregator v5.25.0 — Live-Daten (Run #183 verifiziert)

| Feld | Coverage | Beispielwerte |
|---|---|---|
| `trendScore` | 711/711 | TSLA −34.4 / AMZN +14.5 / MSFT +26.1 |
| `confluenceScore` | 711/711 | PSA 82 / AMZN 65 / AAPL 52 |
| `adx`, `tvaRegime`, `chopIndex` | 711/711 | bereits seit v5.24.0 |

---

## Frontend v429–v431 — Commits heute

| Version | SHA | Was |
|---|---|---|
| v429 | `95e549368c` | trendScore-Badge (▲↗→↘▼) + confluenceScore-Badge (◈ ≥60) in Scanner-Cards. DeepDive TVA-Block +2 Felder. KI-Prompt erweitert. |
| v430 | `5f8d2afaac` | Alpha-Desk Options-Card: TS + CS in Kandidaten-Zeile. eicCandidates-Push ergänzt. |
| v431 | `e0737644d5` | **Bugfix:** Alpha-Desk lokaler `_kvToState`-Fallback hatte trendScore/confluenceScore nicht — jetzt ergänzt. Badges erscheinen jetzt auch in Master Shortlist Cards. |

---

## Architektur-Befund (für späteren Aufräum-Sprint)

`kvToScannerState()` ist zweimal definiert (pos 496520 + 1063608 in index.html) — bekannter Scope-Isolation-Duplikat aus früheren Sessions. Zusätzlich existiert ein lokaler `_kvToState`-Fallback in `renderAlphaDashboard` (pos 1376325) der greifen kann wenn `kvToScannerState` im lokalen Scope nicht sichtbar ist. Alle drei sind nach v431 inhaltlich synchron. Konsolidierung auf eine Definition = eigener Aufräum-Sprint, nicht heute.

---

## Strategische Dokumente heute (SUITE.md v3.2, VISION_2030.md v1.1)

### UIQ-Mission (unveränderlich, §0 SUITE.md)
> UIQ unterstützt Investoren dabei, in jeder Marktphase die zu ihrer persönlichen Situation passende Investmentstrategie zu finden und vermeidbare Fehler zu reduzieren – nicht indem es Entscheidungen ersetzt, sondern indem es den Entscheidungsprozess verbessert.

### UIQ Decision Pyramid (7 Ebenen)
Markt → Strategie → Investor → Underlying → Trade → Management → Lernen

### Drei-Engine-Architektur
- **MIE** (Market Intelligence Engine): heute produktiv
- **DCE** (Decision Confidence Engine): der fehlende Kern-Algorithmus, Q1 2027
- **IPE** (Investor Profile Engine): Personalisierung, Q2–Q3 2027

### Design-Regel (fast heilig)
Jede neue Funktion muss beantworten: Hilft sie den Markt zu verstehen / die Strategie zu wählen / Fehler zu vermeiden? Wenn nein: nicht bauen.

---

## Offene Punkte / Nächste Session

### 🔴 Sofort
- **Badge-Validierung**: Hard-Refresh + AMZN in Master Shortlist prüfen (v431 Bugfix)
- **kvToScannerState Duplikat**: Aufräum-Sprint (2× Definition → 1×)

### 🟡 Mittelfristig  
- BN-Analyse: ab ~01.09.2026 (60 Snapshot-Tage)
- DE-Modus: TG-Delta im DeepDive
- OB-Detector: Bearish OB-Badge in Cards
- Track-Record Phase C

### ⏳ Zeitgesteuert
- IV-Rank: ab ~12.08.2026
- BN-Analyse: ab ~01.09.2026
- MCM-HMM: ab ~01.10.2026

---

## IWV Holdings
Nächste Fälligkeit: ~02.09.2026 (Stand 24.07.2026 noch gültig)

---

*UIQ Suite Übergabe 03.08.2026 · Aggregator v5.25.0 · Frontend v431*
*Strategischer Meilenstein: Mission + Decision Pyramid + Drei-Engine-Architektur dokumentiert*
