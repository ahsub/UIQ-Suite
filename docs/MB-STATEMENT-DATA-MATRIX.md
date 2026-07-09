# Morning Briefing — Statement→Data-Matrix

**Version:** 0.2 — §4.3 gefüllt und eingefroren (unter Revisionsvorbehalt), §8 Evidenz-Register ergänzt
**Datum:** 08.07.2026
**Status:** Konzept — keine Freigabe für Code. Zitate in §8 vor Publikation gegenprüfen (Revisionsvorbehalt)
**Ziel-Repo:** `ahsub/UIQ-Suite` (Referenz aus SUITE.md) oder `ahsub/ko-modules/docs`

---

## 1. Zweck

Diese Matrix definiert für jede Aussageklasse des strukturierten Morning Briefings:
welche Daten sie erfordert, nach welchen Regeln sie deterministisch erzeugt wird,
und welchen Datenstatus sie heute hat.

**Grundprinzip (Palantir-Anspruch):** Jede Aussage im Briefing zeigt auf benannte
Datenpunkte (`basedOn`-Array mit Indikator-IDs). Wo Daten fehlen, entfällt die
Aussageklasse — die KI füllt keine Lücken. Die KI ist reine Verbalisierungsschicht
über validierten, deterministisch bewerteten Inputs (Strict Extraction Mode,
analog GuidelineIQ).

---

## 2. Legende

**Datenstatus**

| Code | Bedeutung |
|---|---|
| ✅ | vorhanden und produktiv (Aggregator v4.7 / Frontend v278) |
| ⚠️ | vorhanden, aber Proxy-Qualität → Konfidenz-Markierung im Output |
| 🔧 | zu bauen, Daten frei verfügbar (kein API-Blocker) |
| ❌ | Lücke — externe Datenquelle erforderlich (Folgesprint) |
| 📐 | reine Regelwerk-/Kalibrierarbeit, kein Datenproblem |

**Quality-Flags (je Datenobjekt in ko-indicators-registry)**

| Flag | Bedeutung |
|---|---|
| `primary` | Originalquelle, direkt gemessen |
| `proxy` | Ersatzmetrik (z. B. PCR/GEX-Proxy nach Squeezemetrics-Wegfall) |
| `derived` | aus Primärdaten berechnet (Z-Scores, Ratios, Ranks) |
| `static` | gepflegte statische Quelle (macro-calendar.json, IWV-CSV) |

---

## 3. Die Matrix

### AK-1 · Marktlage (Regime)

| | |
|---|---|
| **Output-Typ** | Enum: `BULL_QUIET` \| `BULL_FRAGILE` \| `STRESS_UNSTABLE` \| `POST_PANIC_REVERSION` |
| **Beispiel** | „Marktlage: Bull ruhig — Regime seit N Tagen stabil." |
| **Inputs** | MSE-Engine: VIX, VIX/VIX3M-Ratio, Breadth (Nasdaq), Intermarket-Z-Scores |
| **Regel** | Bestehende MSE-Klassifikation (4-Regime-Modell, Z-Score-normalisiert) — unverändert übernehmen |
| **KI-Anteil** | Nur Begründungsfeld: darf ausschließlich die übergebenen Z-Scores/Werte referenzieren |
| **Status** | ✅ — vollständig vorhanden |
| **basedOn** | `mse_regime`, `vix`, `vix_ratio`, `nasdaq_breadth`, `intermarket` |

### AK-2 · Marktstimmung

| | |
|---|---|
| **Output-Typ** | Enum: `RISK_ON` \| `NEUTRAL` \| `VORSICHT` \| `RISK_OFF` + Konfidenz `hoch` \| `eingeschränkt` |
| **Beispiel** | „Stimmung: Neutral/Vorsicht — F&G bei X, PCR erhöht (Proxy-Daten, eingeschränkte Konfidenz)." |
| **Inputs** | Fear & Greed (CNN), VIX-6-Zonen-Modell, PCR/GEX-Proxy |
| **Regel** | Scoring-Tabelle: jeder Input liefert −1/0/+1, Summe → Enum. Schwellen: **[zu kalibrieren]** |
| **Konfidenz-Regel** | Wenn PCR/GEX-Proxy das Zünglein an der Waage ist (Summe ohne Proxy ergäbe anderes Enum) → Konfidenz `eingeschränkt` + Fußnote |
| **Status** | ✅ / ⚠️ — F&G und VIX primary, PCR/GEX ist `proxy` |
| **basedOn** | `fear_greed`, `vix_zone`, `pcr_gex_proxy` |

### AK-3 · Sektoren grün / neutral / rot

| | |
|---|---|
| **Output-Typ** | Pro Sektor Enum: `GRUEN` \| `NEUTRAL` \| `ROT`, sortiert nach RS-Rank |
| **Beispiel** | „Fokus-Sektoren: A, B, C (RS-Rank Top, Overheat unauffällig). Zurückhaltung: D, E, F." |
| **Inputs** | Sektor-RS-Ranking, Sektor-Overheat, Supercycle-Promotion-Flag |
| **Regel (Vorschlag)** | GRÜN = RS-Rank ≤ Top-N **und** Overheat unter Warnschwelle. ROT = RS-Rank Bottom-N **oder** Overheat über kritischer Schwelle (überhitzt = auch bei starkem RS kein „grün"). Supercycle-Flag = Zusatzmarkierung, kein Override. **N und Schwellen: [zu kalibrieren]** |
| **KI-Anteil** | Null bei der Zuordnung. Nur ein Satz Kontext pro Sektor aus übergebenen Werten |
| **Status** | ✅ 📐 — Daten vorhanden, Schwellen festlegen |
| **basedOn** | `sektor_rs`, `sektor_overheat`, `supercycle` |

### AK-4 · Strategien-Zuordnung (pro Sektor-Status × Regime)

| | |
|---|---|
| **Output-Typ** | Feste Strategieliste je Zelle der Mapping-Tabelle (Enums, keine Freitexte) |
| **Beispiel** | „Grüne Sektoren im Regime Bull ruhig: Momentum-Longs, CSP. Rote Sektoren: meiden; im EIC-Modus: KO-Bear-Kandidaten." |
| **Inputs** | AK-1 (Regime) + AK-3 (Sektorstatus) — keine neuen Daten |
| **Regel** | Statische Mapping-Tabelle `regime × sektorstatus → [strategien]`, als JSON in ko-modules. **Inhalt der Tabelle: [von Axel zu definieren]** — das ist die fachliche Kernentscheidung dieses Konzepts |
| **Varianten** | `public`: BaFin-konforme Formulierung („Statistische Kontext-Analyse") ohne Empfehlungssprache. `eic`: explizite Empfehlungen. Getrennte Textbausteine, identische Datenbasis |
| **Status** | 📐 — reines Regelwerk |
| **basedOn** | `strategy_map` (static) + IDs aus AK-1/AK-3 |

### AK-5 · Options-Income-Umfeld (Stufe 1 — Umfeld-Ebene)

| | |
|---|---|
| **Output-Typ** | Enum: `ATTRAKTIV` \| `NEUTRAL` \| `UNATTRAKTIV` \| `GESPERRT` |
| **Beispiel** | „Prämien-Umfeld: attraktiv — erhöhte IV-Zone bei stabilem Regime, Term Structure in Contango. CSP-Kandidaten bevorzugt in grünen Sektoren suchen." |
| **Inputs** | VIX-Zone (Prämienniveau), VIX/VIX3M-Ratio (Term Structure), Regime als Gate |
| **Regel (Vorschlag)** | GESPERRT wenn Regime = `STRESS_UNSTABLE`. Sonst 2D-Matrix VIX-Zone × Term-Structure (Contango/Backwardation), siehe §4.2. **Zellenbelegung: [zu kalibrieren]** |
| **Explizit NICHT enthalten** | Ticker-Nennungen, konkrete Strikes, DTE-Angaben — Aussageklasse existiert in Stufe 1 nicht |
| **Status** | ✅ 📐 |
| **basedOn** | `vix_zone`, `vix_ratio`, `mse_regime` |

### AK-6 · Options-Income Ticker-Ebene (Stufe 2 — Folgesprint)

| | |
|---|---|
| **Output-Typ** | Liste: Ticker + Setup-Typ (CSP/CC) + IV-Rank + Earnings-Abstand |
| **Inputs (fehlend)** | IV Rank/Percentile je Ticker ❌, Earnings-Kalender ❌, Options-Liquidität ❌ |
| **Quellen-Evaluierung** | Reihenfolge: (1) Twelve Data — Abdeckung im bestehenden Plan prüfen, (2) Alternativen. Crosscheck-Referenz vor Go-Live: IBKR/CapTrader |
| **Regel (vorzudenken)** | Kandidat = Sektor GRÜN + IV-Rank > Schwelle + Earnings-Abstand > X Tage + Liquiditätsfilter |
| **Schema-Vorkehrung** | Block als **optionales Feld** im JSON-Schema ab v1 definiert → Stufe 2 ist Erweiterung, kein Umbau |
| **Status** | ❌ — dokumentierter Folgesprint (SUITE.md-Eintrag), **nicht vor Phase-0.5-Abschluss** |
| **basedOn** | `iv_rank` (künftig), `earnings_calendar` (künftig), `sektor_rs` |

### AK-7 · Impulsgeber (Makro-Kalender)

| | |
|---|---|
| **Output-Typ** | Liste kommender Events im Fenster [heute, heute + N Tage] mit Kategorie-Enum: `FOMC` \| `NFP` \| `CPI` \| `TREASURY` \| `SONSTIGE` |
| **Beispiel** | „Impulsgeber diese Woche: CPI (Do), FOMC-Protokoll (Mi). Erhöhte Volatilität um diese Termine einplanen." |
| **Inputs** | `macro-calendar.json` in ko-modules (🔧 diese Phase zu bauen) |
| **Regel** | Reiner Kalender-Lookup + Fenster-Filter. **Die KI nennt kein Event, das nicht in der Datei steht — Datei leer/veraltet → Block entfällt mit Hinweis „Kalender nicht verfügbar"** (fail-closed, nie fail-silent) |
| **Pflege** | FOMC: Fed publiziert Termine jährlich im Voraus. NFP: 1. Freitag (BLS-Kalender). CPI: BLS-Kalender. Pflegeaufwand ~1×/Jahr + Ausnahmen. Datei trägt `validUntil`-Feld → nach Ablauf greift fail-closed |
| **Status** | 🔧 |
| **basedOn** | `macro_calendar` (static) |

---

## 4. Regelwerk-Skizzen (Kalibrier-Vorlagen)

### 4.1 Scoring Marktstimmung (AK-2) — auszufüllen

| Input | −1 (Risk-off) | 0 (neutral) | +1 (Risk-on) |
|---|---|---|---|
| Fear & Greed | < __ | __–__ | > __ |
| VIX-Zone | Zone __+ | Zone __ | Zone __–__ |
| PCR/GEX-Proxy | > __ | __–__ | < __ |

Summen-Mapping: +2/+3 → RISK_ON · +1 → NEUTRAL · 0/−1 → VORSICHT · −2/−3 → RISK_OFF *(Vorschlag)*

### 4.2 Prämien-Umfeld-Matrix (AK-5) — auszufüllen

| | Contango (Ratio < 1) | Backwardation (Ratio ≥ 1) |
|---|---|---|
| **VIX niedrig** (Zone __) | NEUTRAL — Prämien mager | UNATTRAKTIV |
| **VIX mittel** (Zone __) | ATTRAKTIV | NEUTRAL |
| **VIX hoch** (Zone __) | ATTRAKTIV *(erhöhtes Risiko-Flag)* | UNATTRAKTIV |
| Regime = STRESS_UNSTABLE | GESPERRT | GESPERRT |

*(Zellenbelegung ist Vorschlag zur Diskussion — deine Wheel-Praxis entscheidet.)*

### 4.3 Strategie-Mapping (AK-4) — EINGEFROREN v0.2 (unter Revisionsvorbehalt, siehe §8)

**Meta-Regeln:**

1. **Regime = Gashebel, Sektor = Lenkrad.** Das Regime liefert den Positionsgrößen-Multiplikator: BULL_QUIET ×1.0 · BULL_FRAGILE ×0.5 · STRESS_UNSTABLE ×0 · POST_PANIC ×0.5. Der Wert 0.5 ist Konvention, keine Literaturableitung — Kalibrierung über Track-Record Modus A (§ Papertrading, SUITE.md).
2. **ROT ≠ Short.** Schwacher Sektor im Bullenmarkt = Meide-Signal. KO_BEAR nur in STRESS × ROT (Evidenz: §8.3).
3. **CC = Bestandsverwaltung, kein Entry.** Läuft orthogonal zur Tabelle (Fußnote F2), mit POST_PANIC-Ausnahme (F3).

**Die Tabelle** (⚡ = EIC-only, erscheint im Public-Modus nicht — Hebelprodukt-Nennung im öffentlichen Pfad ist Publikations-Blocker, analog Premium Options):

| Regime ↓ / Sektor → | GRÜN | NEUTRAL | ROT |
|---|---|---|---|
| **BULL_QUIET** (×1.0) | MOMENTUM_LONG · CSP · ⚡KO_BULL | CSP selektiv · POSITION_HALTEN | ABWARTEN |
| **BULL_FRAGILE** (×0.5) | MOMENTUM_LONG reduziert · CSP defensiver Strike · STOPS_STRAFFEN | POSITION_HALTEN · STOPS_STRAFFEN | ABWARTEN · CASH_AUFBAUEN |
| **STRESS_UNSTABLE** (×0) | POSITION_HALTEN (defensive RS-Leader, keine Neueinstiege) | CASH_AUFBAUEN | ⚡KO_BEAR · sonst ABWARTEN |
| **POST_PANIC_REVERSION** (×0.5) | MEAN_REVERSION · CSP | MEAN_REVERSION selektiv (Qualität + überverkauft) | ABWARTEN |

**Fußnoten-Regeln:**

- **F1 — Regime-Alter-Gate (POST_PANIC):** CSP/MEAN_REVERSION in POST_PANIC erst ab Regime-Alter ≥ 2–3 Handelstage (Frühzünder-Schutz; Evidenz: §8.1 — Vol-Prämie kehrt erst nach Stabilisierung zurück). Exakter Wert: [zu kalibrieren, Startwert 2].
- **F2 — CC-Grundregel:** Covered Calls sind regimeunabhängig auf Bestandspositionen zulässig; sie erscheinen im Briefing als Bestandshinweis, nicht als Zellen-Strategie.
- **F3 — CC-Ausnahme POST_PANIC:** CC nur auf Positionen nahe Einstand, nicht auf Positionen tief im Minus (Evidenz: §8.5 — Call deckelt die Erholung, auf die das Regime wettet).
- **F4 — Sektor-Konfidenz POST_PANIC:** Im Regime POST_PANIC trägt die Sektor-Zuordnung (AK-3) automatisch Konfidenz `eingeschränkt` — RS-Ranks unmittelbar nach Panik sind verzerrt („am wenigsten gefallen" ≠ künftiger Leader). Selektion läuft über Qualität + überverkauft.
- **F5 — Konsistenz zu AK-5:** STRESS_UNSTABLE sperrt Prämienstrategien global (GESPERRT-Gate); keine STRESS-Zelle enthält CSP/CC. ✓
- **F6 — MOMENTUM_LONG fehlt in POST_PANIC bewusst** (Evidenz: §8.2 — Momentum Crashes). Die Tabelle erzwingt damit Strategie-Rotation entlang des Zyklus Panik → Mean Reversion → Fragile → Momentum.

Strategie-Enums (geschlossene Liste): `MOMENTUM_LONG`, `CSP`, `CC`, `MEAN_REVERSION`, `KO_BULL`, `KO_BEAR`, `ABWARTEN`, `CASH_AUFBAUEN`, `POSITION_HALTEN`, `STOPS_STRAFFEN` — erweiterbar nur per Dokument-Revision, keine KI-erfundenen Strategien möglich.

---

## 5. JSON-Schema-Skizze (Strict Extraction, Tool Use)

```json
{
  "briefing_date": "2026-07-08",
  "variant": "public | eic",
  "marktlage": {
    "regime": "BULL_QUIET",
    "begruendung": "<KI-Text, nur Input-Werte>",
    "basedOn": ["mse_regime", "vix", "vix_ratio", "nasdaq_breadth"]
  },
  "marktstimmung": {
    "wert": "NEUTRAL",
    "konfidenz": "hoch | eingeschraenkt",
    "begruendung": "<KI-Text>",
    "basedOn": ["fear_greed", "vix_zone", "pcr_gex_proxy"]
  },
  "sektoren": [
    { "sektor": "…", "status": "GRUEN", "rs_rank": 0, "overheat": 0.0,
      "kontext": "<KI-Text, 1 Satz>", "basedOn": ["sektor_rs", "sektor_overheat"] }
  ],
  "strategien": {
    "gruen": ["MOMENTUM_LONG", "CSP"],
    "rot": ["ABWARTEN"],
    "basedOn": ["strategy_map", "mse_regime", "sektor_rs"]
  },
  "options_umfeld": {
    "wert": "ATTRAKTIV",
    "begruendung": "<KI-Text>",
    "basedOn": ["vix_zone", "vix_ratio", "mse_regime"]
  },
  "options_ticker": null,
  "impulsgeber": {
    "events": [ { "datum": "…", "kategorie": "CPI", "label": "…" } ],
    "kalender_status": "ok | veraltet | fehlt",
    "basedOn": ["macro_calendar"]
  }
}
```

**Validierungsregeln (Client, vor Rendern):** (1) Alle Enums gegen geschlossene Listen. (2) Jede Zahl im KI-Text muss im Input vorkommen (Regex-Abgleich gegen übergebene Werte). (3) `options_ticker` in Stufe 1 zwingend `null`. (4) `kalender_status ≠ ok` → Impulsgeber-Block wird nicht gerendert, Hinweis stattdessen. Validierung fehlgeschlagen → nicht anzeigen, neu anfordern (max. 2 Retries, dann Fehlerkarte).

---

## 6. Lückenregister & Folgesprints

| # | Lücke | Lösung | Wann |
|---|---|---|---|
| 1 | IV Rank/Percentile je Ticker | Quellen-Evaluierung (Twelve Data zuerst) | Folgesprint nach Phase 0.5 |
| 2 | Earnings-Kalender | vsl. gleiche Quelle wie #1 | Folgesprint (gemeinsam mit #1) |
| 3 | Options-Liquidität | gleiche Evaluierung | Folgesprint |
| 4 | macro-calendar.json | statische Datei, ko-modules | 🔧 diese Phase |
| 5 | Quality-Flags in Indikator-Objekten | Feld in ko-indicators-registry | mit Registry-Sprint |
| 6 | Schwellen §4.1–4.3 | Kalibrier-Session mit Axel | vor Prompt-Bau |

---

## 7. Offene Entscheidungen (Axel)

1. ~~Strategie-Mapping-Tabelle §4.3 füllen~~ — **erledigt v0.2**, eingefroren unter Revisionsvorbehalt (§8-Zitate gegenprüfen).
2. Schwellwerte §4.1 (Stimmungs-Scoring) und §4.2 (Prämien-Matrix) bestätigen oder korrigieren.
3. Top-N / Bottom-N und Overheat-Schwellen für Sektorstatus (AK-3).
4. Impulsgeber-Fenster: wie viele Tage vorausschauen? (Vorschlag: 5 Handelstage)
5. Ablageort dieses Dokuments (UIQ-Suite vs. ko-modules/docs).
6. F1 Regime-Alter-Gate: Startwert 2 Handelstage bestätigen.
7. Zitat-Gegenprüfung §8 (Google Scholar; Web-Suche stand in der Konzept-Session nicht zur Verfügung).

---

## 8. Evidenz-Register (unter Revisionsvorbehalt)

> **Revisionsvorbehalt:** Autoren, Kernbefunde und Journals nach bestem Wissen korrekt; exakte Jahrgänge/Titel vor Aufnahme in publikumsnahe Texte einmalig gegenprüfen. Kein Befund hier ist Grundlage einer Anlageempfehlung; das Register begründet *Regelwerk-Design*, nicht Prognosen.

### §8.1 POST_PANIC × CSP („Sternstunden-These")

- **Whaley (2002), „Risk and Return of the CBOE BuyWrite Monthly Index"**, J. of Derivatives; **Ungar & Moran (2009)** zum CBOE PUT-Index: systematischer Put-Verkauf erntet die Volatility Risk Premium; Überrendite stammt überproportional aus Hochvolatilitätsphasen.
- **Cheng (2019), „The VIX Premium"**, Review of Financial Studies: Die Vol-Prämie bricht *im Spike* ein/wird negativ und kehrt erst mit Stabilisierung zurück.
- **Abgeleitete Regeln:** Die Zelle funktioniert *wegen* des Regime-Gates (POST_PANIC triggert erst nach Umkehrbestätigung, nicht am Paniktief) → zusätzlich F1 Regime-Alter-Gate als Frühzünder-Schutz.

### §8.2 MOMENTUM_LONG-Ausschluss in POST_PANIC

- **Daniel & Moskowitz (2016), „Momentum Crashes"**, J. of Financial Economics: Momentum erleidet seine schlimmsten Verluste in Erholungen nach Einbrüchen (Junk Rally der zerprügelten Verlierer; 1932, 2009).
- **Barroso & Santa-Clara (2015), „Momentum has its moments"**, JFE: Vol-Skalierung vermeidet genau diese Crashes.
- Praktiker-Deckung: Minervini/SEPA — keine intakten Stage-2-Basen unmittelbar nach Panik.
- **Abgeleitete Regel:** F6; Momentum kehrt erst mit Regimewechsel nach BULL_* zurück.

### §8.3 BULL_QUIET × ROT = ABWARTEN (kein CSP auf schwache Sektoren)

- **Jegadeesh & Titman (1993)**, J. of Finance: Querschnitts-Momentum persistiert 3–12 Monate.
- **Moskowitz & Grinblatt (1999), „Do Industries Explain Momentum?"**, J. of Finance: gilt ausgeprägt auf Sektor-/Industrie-Ebene — Verlierer-Sektoren bleiben im Mittel Verlierer.
- **De Bondt & Thaler (1985)**: Reversal erst auf 3–5-Jahres-Horizonten — für ein tägliches Briefing irrelevant.
- **Abgeleitete Regel:** „Billige Einstiege im schwachen Sektor" ist auf Briefing-Horizont eine Underperformance-Wette; Zelle bleibt ABWARTEN. Qualitätstitel tauchen bei Stärke über RS in GRÜN auf.

### §8.4 Regime-Multiplikator

- **Moreira & Muir (2017), „Volatility-Managed Portfolios"**, J. of Finance: Exposure invers zur Volatilität verbessert Sharpe-Ratios über nahezu alle Faktorportfolios.
- **Kritzman, Page & Turkington (2012), „Regime Shifts: Implications for Dynamic Strategies"**, Financial Analysts Journal: Markov-Regime-Variante (gleiche Familie wie der Pine-Script-Regime-Indikator).
- **Abgeleitete Regel:** Diskrete Stufen ×1.0/×0.5/×0 als robuste, ehrliche Vereinfachung (keine Scheinpräzision); 0.5 wird über Track-Record Modus A kalibriert.

### §8.5 CC-Ausnahme in POST_PANIC

- **Israelov & Nielsen (AQR, ~2014), „Covered Calls Uncovered"**: CC-Rendite = Aktien-Beta + Short-Vol; Preis ist systematisch gekappte Aufwärtsbewegung.
- **Abgeleitete Regel:** F3 — in einem Aufwärtsreversion-Regime keinen Call auf tief im Minus liegende Positionen schreiben.

### §8.6 Historische Testfälle für POST_PANIC-Regeln (Backtest-Sollliste)

| Episode | Charakter | Prüft |
|---|---|---|
| Dez 2018 | V-Erholung, Lehrbuchfall | Basisfunktion |
| März 2020 | mehrere Panik-Schübe | F1 Frühzünder-Schutz |
| **2022** | Bärenmarkt-Rallyes — scheiternde POST_PANIC-Signale | **härtester Fall:** reicht das Regime-Gate oder braucht die Zelle eine Zusatzbedingung? |
| Aug 2024 | Yen-Carry-Blitz | Kurzpanik-Verhalten |
| Apr 2025 | Zoll-Schock, schnelle V-Erholung | Regime-Alter vs. Tempo |
