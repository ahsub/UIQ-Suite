# ÜBERGABE 2026-08-08 — UIQ Suite (Regelwerk-Sprint)

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 08.08.2026)

| Komponente | Stand | Commit |
|---|---|---|
| **Aggregator** | **v5.35.0** | `c618f42` (unverändert) |
| **Frontend (axel-scanner)** | **v454** | `fa9aad6` (unverändert) |
| **CODING-RULES.md** | **v1.2** | `a6937d4` |
| **SUITE.md** | Backlog №39–43 | `00f8492` |

---

## Was heute passiert ist

### Kein Code — reiner Regelwerk- und Backlog-Sprint

**Ausgangsmaterial:** 4 Pine Scripts (IOS IME v3.0, IOS Position & Risk v2.0,
IOS Market Engine v3.8, IOS Entry Score v2.0) analysiert und gegen UIQ-Bestand gemappt.

### CODING-RULES.md v1.1 → v1.2

| Version | Commit | Was |
|---|---|---|
| v1.1 | `1161ff2` | §2.4 Externe Gewichte/Server-seitig · §2.5 Ratio-Konvention · §2.6 Regime-Singularität · §2.7 Track-Record-Integrität · §7 Checkliste +8 Items |
| v1.2 | `a6937d4` | §2.8 Penalty-Capping-Architektur (Capping statt additiver Abzug bei Grenz-Verletzungen) |

### SUITE.md — Backlog №39–43

| № | Kandidat | Status | Trigger |
|---|---|---|---|
| 39 | RS-Linien-Neuhoch (`rsLineNewHigh: bool`) | Verankert, kein Code | Nächster Indicators-Sprint |
| 40 | OBV-Trend Akkumulation (`obvAboveMa`, `obvTrend`) | Verankert, kein Code | Mit №39 |
| 41 | Portfolio Heat + Hard-Penalty-Capping | DCE-RiskEstimator-Baustein | DCE-Refactoring ~Okt. 2026 |
| 42 | Extension-Penalty Chase-Schutz (`extensionPct`, `isExtended`) | Verankert, kein Code | Mit №39+40 |
| 43 | Leadership-Faktor MSE | ⚠️ ZURÜCKGESTELLT | **01.10.2026** — nach Backtest + TR-Review |

### Architektur-Entscheidungen heute

**C (Portfolio Heat):** Teil DCE-Refactoring, nicht freistehend.
Begründung: zweiter Positions-Sizing-Entscheider außerhalb DCE widerspräche
Singularitäts-Prinzip (analog §2.6). C + D gemeinsam als №41.

**D (Hard-Penalty-Capping):** Als §2.8 in CODING-RULES kodifiziert UND
als Teil von №41 im Backlog — untrennbares Paar.

**E (Leadership-Faktor):** Explizit zurückgestellt (№43).
Gründe: §2.6 (kein neuer MSE-Input vor Track-Record-Validierung),
§2.7 (Regeländerung kontaminiert laufenden TR), §2.4 (Gewichte unvalidiert).
Trigger: 01.10.2026.

---

## Offene To-dos (aus Übergabe 07.08. + heute)

| Was | Wer | Wann |
|---|---|---|
| Rechtsgutachten WpHG/WpIG | Axel | diese Woche |
| Beta-Aktivität messen (10 Tokens) | Axel | diese Woche |
| ✅ KiSt in Ergebnisanzeige (`getKiStSummary()`) | 08.08.2026 | kap.html `236788304e` |
| ✅ ROADMAP 2.8–2.11 als ✅ markiert | 08.08.2026 | ROADMAP v1.8 `518e185` |
| ✅ Refundex 1.3 Feedback-Kanal | bereits aktiv | ahildebrand@me.com + GitHub Issues, ROADMAP v1.8 |
| ✅ W3 Client-MSE Dokumentation | 08.08.2026 | CLIENT-MSE-DOKU.md v1.0 `54f8c41` |
| ✅ SWOT-Konsolidierung | 08.08.2026 | SWOT_2026_08_07.md zu Stub reduziert `c334a56` |

---

## ⏳ Zeitgesteuert

| Wann | Was |
|---|---|
| 11.08. (Mo) | GHA Run: ivRank aktiv (30 Handelstage erreicht) |
| ~01.09. | Track Record h30 / BN-Analyse / DCE Brier Score |
| **01.10.** | **№43 Leadership-Faktor prüfen** (Backtest + TR-Review Voraussetzung) |
| ~01.10. | MCM-HMM + val_layer.py + Validierung Ebene 1 |
| ~01.10. | OptionsDoktor Start (Trigger) |
| ~27.08. | IWV Holdings CSV → `python engine/update_iwv.py` |
| ~Q1 2027 | Counterfactual Engine |

---

## Aktiver Backlog-Überblick (Sprint-fähig)

**Nächster natürlicher Sprint: Indicators-Sprint №39+40+42**
(RS-Neuhoch + OBV + Extension-Penalty — alle drei server-seitig,
alle drei nur Felder ohne Score-Integration, gemeinsam ~1 Session)
**Voraussetzung:** kein Backtest nötig für die Feld-Implementierung,
Score-Gewichte erst nach №34.

---

## STEHENDE REGELN
- IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
- Hast du das verifiziert oder übernommen? (bei Angaben aus Übergabeprotokoll)
- PAT nach Session löschen
- IWV-Update: ~27.08.2026 nicht vergessen
- №43 Leadership-Faktor: Erinnerung 01.10.2026
