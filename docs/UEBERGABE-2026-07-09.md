# Übergabeprotokoll — Session 09.07.2026

**Erstellt:** 09.07.2026  
**Frontend:** v278 | **Aggregator:** v4.7 | **Track-Record:** Tag 7 (Start 02.07.2026)  
**Nächste Session:** Phase-0.5-UX-Abschluss (Übergabeliste 07.07.2026)

---

## 1. Was diese Session war

Reine Konzept- und Strategie-Session — kein Code, kein Deploy.  
Ergebnis: Das Fundament für das strukturierte Morning Briefing (Palantir-Ansatz)  
ist vollständig dokumentiert und versioniert in `ahsub/UIQ-Suite`.

---

## 2. Sofort weitermachen — Phase 0.5 UX-Abschluss

**Das ist die Priorität. Übergabeliste vom 07.07.2026 abarbeiten:**

| Tab | Offene Punkte |
|---|---|
| **Home** | Verbesserungen laut Axel-Liste 07.07. |
| **Übersicht** | Makro-Kondensat oben (neu!), Briefing darunter — Info-Flow-konform |
| **Makro** | Bleibt als Detail-/Audit-Ansicht erhalten (Nerd-View) |
| **Scanner** | Verbesserungen laut Axel-Liste 07.07. + KI-Datums-Halluzination (Phase-0-Blocker!) |

**Kritischer Blocker noch offen:**  
KI-Scanner produziert halluzinierte/inkonsistente Daten über sukzessive Calls für denselben Ticker  
→ muss vor Beta-Launch gelöst sein.

---

## 3. Was nach Phase 0.5 kommt (geordnet nach Priorität)

### 3.1 Diese Phase noch (vor Beta-Launch zwingend)

| # | Was | Warum jetzt |
|---|---|---|
| A | **macro-calendar.json** anlegen in `ahsub/ko-modules` | Impulsgeber-Block im Briefing — fail-closed ohne diese Datei |
| B | **daily_market_snapshot Cache-Architektur** | Beta-Tester dürfen keine eigenen Twelve-Data-Calls machen |
| C | **ko-prompts-registry Sprint** | Single Source of Truth für alle KI-Prompts |

### 3.2 Folgesprints (nach Phase 0.5, dokumentiert in SUITE.md §7)

| SUITE №| Was | Abhängigkeit |
|---|---|---|
| №9 | Track-Record-Phase-C (Papertrading Modus A+B) | Logging-Zusatz im nightly Snapshot; Evaluator nach Phase 0.5 |
| №10 | IV/Earnings-Folgesprint (Twelve Data prüfen) | Für AK-6 Options-Ticker-Ebene im Briefing |

---

## 4. Morning-Briefing-Architektur (Kern-Ergebnis dieser Session)

### 4.1 Konzeptdokument
→ `docs/MB-STATEMENT-DATA-MATRIX.md` v0.2

### 4.2 Übersicht-Tab neuer Aufbau
```
OBEN:   Makro-Kondensat (deterministisch, kein KI-Anteil)
        MSE-Regime · IOS · VIX-Zone · F&G · PCR/GEX-Proxy
        Sektor Top-3 / Flop-3 (RS + Overheat)
        → jede Kachel verlinkt in Makro-Tab (Detail)

UNTEN:  Morning Briefing (KI-Verbalisierungsschicht)
        Input: fertige Sektor-Zuordnung + alle Kennzahlen
        Output: strukturiertes JSON, Strict Extraction Mode
```

### 4.3 Strategie-Matrix §4.3 — EINGEFROREN (unter Revisionsvorbehalt)

| Regime / Sektor | GRÜN | NEUTRAL | ROT |
|---|---|---|---|
| BULL_QUIET (×1.0) | MOMENTUM_LONG · CSP · ⚡KO_BULL | CSP selektiv · POSITION_HALTEN | ABWARTEN |
| BULL_FRAGILE (×0.5) | MOMENTUM_LONG red. · CSP def. Strike · STOPS_STRAFFEN | POSITION_HALTEN · STOPS_STRAFFEN | ABWARTEN · CASH_AUFBAUEN |
| STRESS_UNSTABLE (×0) | POSITION_HALTEN (defensiv, keine Neueinstiege) | CASH_AUFBAUEN | ⚡KO_BEAR · sonst ABWARTEN |
| POST_PANIC_REVERSION (×0.5) | MEAN_REVERSION · CSP | MEAN_REVERSION sel. (Qualität + überverkauft) | ABWARTEN |

⚡ = EIC-only. Fußnoten F1–F6 → siehe Matrix-Dokument §4.3.

### 4.4 Offene Kalibrierungen (vor Prompt-Bau nötig)
- §4.1 Scoring Marktstimmung: Schwellwerte F&G / VIX-Zone / PCR
- §4.2 Prämien-Umfeld-Matrix: Zellenbelegung VIX × Term-Structure
- AK-3: Top-N / Bottom-N für Sektorstatus, Overheat-Schwellen
- AK-7: Impulsgeber-Fenster (Vorschlag: 5 Handelstage)
- F1: Regime-Alter-Gate POST_PANIC (Startwert: 2 Handelstage)
- **Ablageort Konzeptdokumente:** UIQ-Suite bestätigt ✅

### 4.5 Daten-Lückenregister

| Lücke | Status | Wann |
|---|---|---|
| IV Rank/Percentile | ❌ externe Quelle nötig | Folgesprint №10 |
| Earnings-Kalender | ❌ externe Quelle nötig | Folgesprint №10 |
| macro-calendar.json | 🔧 statische Datei bauen | Diese Phase |
| Quality-Flags in ko-indicators-registry | 🔧 Feld ergänzen | Registry-Sprint |
| PCR/GEX-Proxy | ⚠️ Proxy (Squeezemetrics tot) | Dauerhaft mit Konfidenz-Flag |

---

## 5. SUITE.md-Änderungen diese Session (v1.4)

- §3.1: `POST_CRACK_REVERSION` → `POST_PANIC_REVERSION` (Produktiv-Code-Abgleich)
- §7 №9: Track-Record-Phase-C Papertrading
- §7 №10: IV/Earnings-Folgesprint
- `docs/MB-STATEMENT-DATA-MATRIX.md` als erstes Konzeptdokument committed

---

## 6. Wichtige offene Entscheidungen (Axel)

1. Zitat-Gegenprüfung §8 Evidenz-Register (Google Scholar) — unter Revisionsvorbehalt
2. Schwellwerte §4.1/§4.2 bestätigen (Kalibrier-Session)
3. IWV holdings.csv Update — **Reminder: August 2026 von iShares laden**

---

## 7. Technische Konstanten (für nächste Session)

```
CF Account:     2ee58f98cf0979e660841a0764b7f17d
KV Namespace:   86c05f66e32346b99e720d861fedd1de
ko-ai Worker:   ko-ai.ahildebrand.workers.dev
Workflow ID:    298819243
Cron:           37 03 * * 1-6 UTC
Frontend:       auto-deploy via Cloudflare Pages (push → main axel-scanner)
Workers:        manuell via Cloudflare Dashboard
PAT:            7-Tage repo-scope, frisch je Session, danach löschen
```

---

## 8. Sofort-Checkliste für nächste Session

- [ ] Frischen PAT erstellen
- [ ] Übergabeliste 07.07.2026 laden (Home/Übersicht/Makro/Scanner-Punkte)
- [ ] Mit Übersicht-Tab-Umbau starten (Makro-Kondensat oben)
- [ ] Scanner KI-Datums-Halluzination angehen (Phase-0-Blocker)
- [ ] macro-calendar.json nach Phase-0.5-Abschluss

**Parole: Phase 0.5 heute abschließen.**
