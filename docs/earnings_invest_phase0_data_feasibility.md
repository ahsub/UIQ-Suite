# UIQ Earnings Invest — Phase 0: Data Feasibility Report

**Bezug:** `UIQ Earnings Invest Strategy` v0.1 (Konzeptdokument), Layer 1 (Earnings Revision Momentum)
**Auftrag:** Reviewer-Vorgabe vom [Session-Datum] — "Prüfe ausschließlich die Datenmachbarkeit von Layer 1. Keine UIQ-Implementierung."
**Status:** Phase 0 — Data Feasibility bestanden, aber **noch nicht abgeschlossen** (kleiner Feasibility-Closure-Schritt offen, s. Abschnitt 7) — nicht zu verwechseln mit "Layer 1 produktionsreif". Reifegrad-Modell: `EPS_ONLY` (aktueller Stand) → `EPS_PLUS_PARTIAL_REVENUE` → `FULL_LAYER_1`, analog zum dreistufigen Research-Readiness-Muster.
**Durchgeführt von:** Claude, per Live-API-Abfrage durch Axel (Alpha Vantage) + Desk-Recherche (FMP)
**Getestete Ticker:** IBKR, MPC (2 von 10-15 geplanten — s. Einschränkungen unten)

---

## 1. Kernbefund

Die zentrale Sorge aus der ersten Einschätzung — dass Point-in-Time-Revisionsdaten praktisch nicht zugänglich sind — **hat sich nicht bestätigt**. Alpha Vantage liefert über den Endpoint `EARNINGS_ESTIMATES` echte, mehrfach zurückblickende Konsens-Snapshots (7/30/60/90 Tage) sowie eine analystenweise Revisions-Zählung — beides live gegen zwei strukturell unterschiedliche Ticker (IBKR: Finanzdienstleister, aktivitätsgetrieben; MPC: Raffinerie, rohstoffgetrieben) verifiziert, mit identischem, stabilem Schema.

**Die Lücke, die bleibt:** Revisionshistorie existiert bei beiden getesteten Quellen **nur für EPS, nicht für Revenue**. Das betrifft das Konzeptdokument in §4 (Layer 1 verlangt beide gleichrangig) und lässt sich nicht durch eine dritte Quelle umgehen, sondern nur durch ein eigenes, UIQ-seitiges Archiv schließen (siehe Abschnitt 5).

---

## 2. Methodik — Abweichung vom ursprünglichen Auftrag

Der Auftrag sah 10-15 Referenzticker vor. Aus Zeit-/Aufwandsgründen wurden **zwei** live getestet (IBKR, MPC) — bewusst als maximal unterschiedliches Paar gewählt (Financial Services vs. Commodity-Refining), um Schema-Stabilität über Branchen hinweg zu prüfen, nicht um eine repräsentative Stichprobe zu erzeugen. Pharma-/Biotech-Ticker, kleinere Marktkapitalisierungen und Ticker mit dünner Analysten-Coverage wurden **nicht** getestet — das bleibt eine offene Lücke vor einer Go-Entscheidung (s. Abschnitt 7).

FMP wurde ausschließlich per Desk-Recherche geprüft (Dokumentation + ein verifiziertes, echtes Python-Nutzungsbeispiel eines Dritten), nicht live mit eigenem Key — das Schema gilt daher als bestätigt, aber Kosten/Rate-Limits/Zugriffsebene für diesen spezifischen Endpoint bleiben ungetestet.

---

## 3. Feld-für-Feld-Checkliste (wie vom Reviewer verlangt)

| Feld | Alpha Vantage `EARNINGS_ESTIMATES` | Alpha Vantage `EARNINGS` | FMP `analyst-estimates` |
|---|---|---|---|
| EPS-Konsens (aktuell) | ✅ vorhanden | — | ✅ vorhanden |
| Revenue-Konsens (aktuell) | ✅ vorhanden | — | ✅ vorhanden |
| **EPS-Revision 7/30/60/90 Tage** | ✅ **vorhanden** (`eps_estimate_average_{7,30,60,90}_days_ago`) | — | ❌ nicht vorhanden |
| **Revenue-Revision 7/30/60/90 Tage** | ❌ **nicht vorhanden** | — | ❌ nicht vorhanden |
| Revisions-Zählung (Analysten, up/down) | ✅ vorhanden (`eps_estimate_revision_up/down_trailing_{7,30}_days`) — nur EPS | — | ❌ nicht vorhanden |
| Revision Breadth ("X von Y Analysten") | 🟡 teilweise — echte Zählung vorhanden, aber nicht als Anteil an Gesamt-Analystenzahl aufbereitet | — | ❌ nicht vorhanden |
| Analystenzahl | ✅ getrennt für EPS/Revenue | — | ✅ getrennt für EPS/Revenue |
| Estimate Dispersion (High/Low) | ✅ ableitbar aus `high`/`low`/`average` | — | ✅ ableitbar |
| Guidance vs. Consensus | ❌ nicht aufgetaucht | — | ❌ nicht aufgetaucht |
| Historische EPS-Surprise (Target A) | — | ✅ **vorhanden**, 19 Jahre Tiefe (bis 2007) | — |
| Report-Timing (pre-/post-market) | — | ✅ vorhanden (`reportTime`) — ermöglicht korrektes Kursreaktions-Fenster | — |
| Revenue-Surprise | — | ❌ nicht vorhanden | — |
| Point-in-Time-Fähigkeit | ✅ **ja**, das Kernkriterium ist erfüllt | ✅ ja (Report-Datum historisch) | ❌ nein, nur Snapshot |
| Historische Tiefe (Konsens) | ✅ bis 2017 (quartalsweise) | ✅ bis 2007 | unbekannt (nicht getestet) |
| Schema-Stabilität über Ticker-Typen | ✅ bestätigt (IBKR vs. MPC identisch) | — | unbekannt |

---

## 4. Datenqualitäts-Befund (nicht nur Feld-Verfügbarkeit)

Bei MPC steht `revenue_estimate_high` über **sieben aufeinanderfolgende Quartale** (2025-03-31 bis 2026-06-30) exakt bei `40000000000.00` — ein auffällig runder, identisch wiederholter Wert. Das sieht nach einem Platzhalter- oder Stale-Value im Vendor-Datensatz aus, nicht nach echter Analystenschätzung. Kein Blocker, aber ein konkreter Beleg dafür, dass Punkt 9 der Testpflicht ("Stabilität des Schemas") nicht nur abstrakte Vorsicht ist — vor jeder produktiven Nutzung müsste UIQ eine Sanity-Filter-Logik gegen genau solche Wertwiederholungen bauen (analog zu bestehenden Sanity-Filtern, z. B. `iv_layer.py`).

---

## 5. Empfehlung: dieselbe Architektur wie beim IV-Rank

Die fehlende Revenue-Revisionshistorie lässt sich nicht durch eine bessere Quelle lösen — sie ist strukturell bei Free-/Prosumer-APIs nicht vorhanden (echte Point-in-Time-IBES-Style-Revisionshistorien für Revenue sind institutionelles Terrain). Der pragmatische Weg ist derselbe, den UIQ bereits für IV-Rank gegangen ist (Backlog #15): **kein rückwirkendes Auftanken möglich → eigenes, taggenaues Archiv ab Tag 0 aufbauen.**

Konkret: täglicher Snapshot des aktuellen `revenue_estimate_average` (und, zur Konsistenz, auch der EPS-Felder als Redundanz zur AV-eigenen Revisionshistorie) in ein UIQ-eigenes Archiv (`data/earnings_estimates_history/`, analog `data/iv_history/`). Revenue-Revision 30/60/90 Tage wird dann **selbst berechnet**, sobald genug Archiv-Tage vorliegen — exakt dasselbe Reifungs-Muster wie beim IV-Rank (Tag 0 → ~30 Tage bis erste Revenue-Revision nutzbar → ~90 Tage bis volle Layer-1-Parität EPS/Revenue).

---

## 5b. Reifegrad-Modell — die EPS/Revenue-Asymmetrie als Architektur, nicht als Schwäche

**Wichtige Korrektur der eigenen Rahmung:** Die EPS/Revenue-Asymmetrie aus Abschnitt 1 sollte nicht als Mangel des Konzepts dargestellt werden, sondern als bewusst gestuftes Reifegradmodell — keine künstliche Symmetrie vortäuschen, nur damit das Datenmodell vollständig aussieht:

```text
Layer 1 – Earnings Revision Momentum

EPS
├── Current consensus             LIVE
├── Revision 7/30/60/90d          LIVE
├── Revision up/down              LIVE
├── Analyst count                 LIVE
└── Historical surprise           LIVE

Revenue
├── Current consensus             LIVE
├── Revision 7/30/60/90d          UIQ ARCHIVE (Reifung ~90 Tage)
├── Revision breadth              UIQ ARCHIVE / derived
└── Analyst count                 LIVE

Guidance vs Consensus             NOT YET AVAILABLE (bewusst aus Layer-1-Scope
                                   herausgelassen, solange keine belastbare
                                   Quelle gefunden ist)
```

Layer 1 läuft dabei nicht binär (verfügbar/nicht verfügbar), sondern über einen expliziten `research_readiness`-Status, analog zum bereits etablierten dreistufigen Research-Readiness-Muster:

```text
EPS_ONLY                    ← aktueller Stand nach diesem Bericht
EPS_PLUS_PARTIAL_REVENUE    ← sobald UIQ-Archiv genug Tage hat für erste Revenue-Deltas
FULL_LAYER_1                ← EPS und Revenue auf demselben Reifegrad
```

Die ~90 Tage Archivierungszeit sind damit **kein Grund, die gesamte Strategie zu verschieben** — Layer 1 kann im Status `EPS_ONLY` bereits genutzt/weiterentwickelt werden, während Revenue im Hintergrund reift.

## 5c. Kandidaten-Vorfilter — Kostensenkung ohne These-Verzerrung

Statt aller 737 Ticker den vollen `EARNINGS_ESTIMATES`-Call zu unterziehen, sollte ein deterministisches Eligibility-Gate vorgeschaltet werden — dasselbe Muster wie bei der Candidate-Selection-Integrity (Primary → Eligibility-Gate → Eligible Pool). Ziel: das Universum spürbar verkleinern, ohne systematisch die Kandidaten wegzufiltern, für die die Strategie eigentlich gebaut ist.

**Sichere Vorfilter (orthogonal zur These, keine neuen Kosten oder nur ein Bulk-Call):**

| Kriterium | Begründung | Kosten |
|---|---|---|
| Earnings-Datum im Zeitfenster (z. B. nächste 5-15 Handelstage) | Strukturell notwendig, betrifft nicht die Erwartungslücken-These | 1 Bulk-Call für den Gesamtmarkt (`EARNINGS_CALENDAR`, kein Symbol-Parameter nötig) |
| Market Cap ≥ 20 Mrd. USD | Bereits §3 des Konzepts, keine Richtungsannahme | 0 — bereits im Aggregator vorhanden |
| Positive operativer Cashflow | Bereits §3, reine Qualitätsschwelle | 0, falls schon in der Fundamentaldaten-Pipeline (zu prüfen) |
| Index-Mitgliedschaft (S&P 500 / Russell 1000) als Analysten-Coverage-Proxy | Löst das Henne-Ei-Problem: Analystenzahl ist laut Testergebnis erst NACH dem AV-Call bekannt — Index-Mitgliedschaft ist eine kostenlose Vorab-Näherung dafür, dass ausreichend Coverage existiert | 0 — IWV-Holdings-Liste bereits vorhanden (Backlog #24/#56) |
| Mindest-Liquidität (z. B. `avgVol20 ≥ 100.000`) | Reiner Handelbarkeits-/Datenqualitätsfilter | 0 — identisches Muster wie beim AVWAP/OB-Detector-Mindestvolumen-Filter (Backlog #27) |

**Bewusst NICHT als Vorfilter, mit Begründung:**

- **Momentum/relative Stärke** — würde die zentrale "Expectation Gap"-These direkt unterlaufen: genau ein Kandidat mit noch niedrigem Momentum, aber bereits steigenden Schätzungen, ist der Idealfall der Strategie (§2), kein Ausschlusskriterium. Gehört stattdessen als Auswertungsdimension in Layer 4 (Market/Technical Setup) — dort, wo das Konzept es ohnehin schon vorsieht.
- **Sektor-/Branchenausschluss** — widerspricht direkt §12 des Konzepts: *"The strategy should not automatically exclude entire sectors."* MPC/VLO/PSX sollen im Datensatz bleiben, nur mit External-Dependency-Flag versehen (Layer 6), nicht vorab herausgefiltert.

**Effekt auf die Rate-Limit-Rechnung (Abschnitt 6):** Earnings-Termine clustern typischerweise in mehrwöchigen Fenstern ("Earnings Season") statt sich gleichmäßig übers Quartal zu verteilen — die tatsächliche Kandidatenzahl an einem gegebenen Tag dürfte deutlich unter 737 liegen, vermutlich niedrige zweistellig bis knapp dreistellig. **Das ist eine Einschätzung, keine verifizierte Zahl** — nächster konkreter Schritt wäre, den `EARNINGS_CALENDAR`-Bulk-Call einmal live gegen das tatsächliche 737-Ticker-Universum laufen zu lassen und die vier weiteren Filter lokal anzuwenden, um eine echte Zahl statt einer Schätzung zu bekommen. Falls sich das bestätigt, sinkt der in Abschnitt 6 berechnete Premium-Bedarf voraussichtlich weiter, ggf. sogar unter die Schwelle, ab der überhaupt ein bezahlter Tarif nötig ist.

## 6. Kosten — inkl. konkreter Rate-Limit-Rechnung gegen das echte UIQ-Universum (737 Ticker)

**Korrektur gegenüber einer früheren Fassung dieses Berichts:** Dort stand fälschlich "500 API calls/day" für den AV-Free-Tier — das war eine veraltete Zahl aus einer älteren Quelle. Mehrere aktuelle, übereinstimmende 2026er-Quellen bestätigen: Alpha Vantage hat den Free-Tier zwischenzeitlich schrittweise gekürzt (500 → 100 → aktuell **25 Requests/Tag, 5/Minute**). Free-Key funktionierte in diesem Test zwar fehlerfrei für `EARNINGS_ESTIMATES` und `EARNINGS`, aber die 25/Tag-Grenze macht den Free-Tier für einen produktiven Nightly-Lauf über ein größeres Universum von vornherein ungeeignet — unabhängig vom sonstigen Funktionsumfang.

**Rechnung gegen das tatsächliche UIQ-Ticker-Universum (737 Ticker, Stand dieser Recherche):**

| Tarif | Preis | Requests/Min | 737 Ticker × 1 Endpoint | 737 × 2 Endpoints (Estimates + Surprise-Historie) |
|---|---|---|---|---|
| Free | 0 $ | 5/Min, 25/Tag Hard-Cap | ~30 Tage nötig | technisch unmöglich für Nightly |
| **Premium 75** | **49,99 $/Monat** | 75/Min, kein Tages-Cap | **~10 Min** | **~20 Min** |
| Premium 150 | 99,99 $/Monat | 150/Min | ~5 Min | ~10 Min |

**Ergebnis:** Free-Tier scheidet für den Nightly-Lauf klar aus (25/Tag << 737 Ticker). Der günstigste Premium-Tarif (49,99 $/Monat) deckt dagegen selbst beide Endpoints komfortabel in ~20 Minuten ab — passt in das bestehende 45-Minuten-Job-Timeout-Budget des `market-aggregator`-Workflows, müsste aber als zusätzlicher Zeitposten explizit mitgeplant werden, nicht nebenbei mitlaufen (dasselbe Timeout-Budget, das erst kürzlich wegen des Public-Digest-Schritts von 30 auf 45 Minuten erweitert wurde).

**Offen:** Ob `EARNINGS_ESTIMATES` einen Batch-Modus (mehrere Symbole pro Call) unterstützt, wurde nicht geprüft — falls ja, würde sich die Rechnung nochmal günstiger stellen. Aus der bisher gesichteten Dokumentation kein Hinweis auf Batch-Support für diesen Endpoint.

- **FMP:** `analyst-estimates`-Endpoint existiert, Zugriffsebene (Free/Starter/Premium) für diesen spezifischen Endpoint nicht verifiziert — offene Frage für einen eigenen Test, falls FMP als Sekundärquelle weiterverfolgt wird.

---

## 7. Offene Punkte vor einer Go/No-Go-Entscheidung

1. **Nur 2 von 10-15 Referenztickern getestet** — insbesondere ein Pharma-/Biotech-Ticker (hohe Relevanz für Binary-Event-Risk-Klassifikation, §10 des Konzepts) und ein Ticker mit dünner Analysten-Coverage (<5 Analysten) fehlen noch.
2. **Guidance-vs-Consensus-Daten** sind bei keiner der drei Abfragen aufgetaucht — separate Recherche nötig, falls dieses Feld für Layer 3 (Expectation Gap) als notwendig gilt.
3. ✅ **AV-Rate-Limits gegen das tatsächliche UIQ-Ticker-Universum gerechnet** (s. Abschnitt 6, Nachtrag) — Free-Tier ungeeignet, Premium-75-Tarif (49,99 $/Monat) deckt beide Endpoints über alle 737 Ticker in ~20 Minuten ab. Offen bleibt nur, ob ein Batch-Modus existiert, der das nochmal günstiger machen würde.
4. **FMP-Zugriffsebene für `analyst-estimates`** nicht verifiziert.

---

## 8. Fazit für die Phase-0-Entscheidung

**Präzisierung gegenüber einer früheren Fassung:** Dort stand "EPS-seitig: deutlich über 80%" — eine zu großzügige Formulierung, da sie nicht aus einer systematischen Abdeckung über eine repräsentative Stichprobe hergeleitet wurde, sondern aus zwei live getesteten Tickern. Methodisch sauberer:

> Die für Layer 1 benötigten EPS-Datenfelder sind für die beiden live getesteten Referenztitel weitgehend vollständig und Point-in-Time-fähig. Die Datenmachbarkeit ist damit hinreichend belegt, die sektorale und Coverage-robuste Generalisierbarkeit wird durch den Feasibility-Closure-Schritt noch überprüft.

**Revenue-seitig:** strukturelle Lücke, aber mit bekanntem, bereits bewährtem Lösungsweg (eigenes Archiv, IV-Rank-Muster) — kein Show-Stopper, aber ein Zeit-/Reifungsfaktor (~90 Tage bis volle Parität), der in die Phase-Planung gehört und **ab sofort parallel laufen sollte**, nicht erst nach Abschluss der übrigen Recherche (jeder verlorene Tag verlängert die Reifung 1:1).

### Aktueller Research-Status

```text
CONCEPT                         ✅
DATA FEASIBILITY                ✅
POINT-IN-TIME EPS               ✅
EPS REVISION 7/30/60/90         ✅
EPS SURPRISE HISTORY            ✅
REVENUE CURRENT CONSENSUS       ✅
REVENUE REVISION HISTORY        ⏳ UIQ ARCHIVE (Start sofort, parallel)
GUIDANCE vs CONSENSUS            ⏸ außerhalb Layer 1
DATA SANITY                     ⏳ muss implementiert werden
CROSS-SECTOR VALIDATION          ⏳ 3–5 Ticker
EARNINGS CALENDAR PRE-FILTER     ⏳ Live-Test (wichtigster nächster technischer Schritt)
COST MODEL                       🟢 weitgehend geklärt
PHASE 1 FEATURE SPECIFICATION    → danach
```

**Zur Sekundärquellen-Frage:** Alpha Vantage ist nach diesem Bericht die einzige Quelle, die für den zentralen Revisionsmechanismus live verifiziert wurde. FMP bleibt dokumentarisch bestätigt, aber praktisch nicht validiert — für den aktuellen Ein-Personen-Betrieb keine Multi-Vendor-Architektur bauen, solange AV allein trägt. FMP bleibt als Kandidat vermerkt, nicht als gleichwertige zweite Quelle behandelt.

**Empfehlung:** Phase 0 als bestanden werten, aber vor Phase 1 noch einen kleinen, gezielten **Feasibility-Closure-Schritt** einschieben — keine neue große Research-Phase, sondern das Schließen der in Abschnitt 7 benannten Lücken:

**A.** 3-5 weitere Testfälle (Schema-Stabilität an den Rändern, nicht statistische Repräsentativität): 1 Pharma/Large-Cap, 1 Titel mit geringer Analystenzahl, 1 Tech/AI, 1 zyklischer Titel, optional 1 weiterer Activity-driven-Titel wie IBKR

**B. Wichtigster nächster technischer Schritt:** `EARNINGS_CALENDAR`-Bulk-Call einmal live gegen das 737-Ticker-Universum testen + die vier weiteren sicheren Vorfilter (Market Cap, Cashflow, Index-Mitgliedschaft, Liquidität) lokal anwenden — ersetzt die Schätzung aus Abschnitt 5c durch eine echte Zahl und legt die tatsächliche API-Kosten-/Laufzeitarchitektur fest, statt mit der Annahme "737 × Endpoint" zu planen.

**C. Sofort, parallel, nicht nach den übrigen Punkten:** Revenue-Archiv starten — zunächst nur Rohdaten, keine abgeleiteten Revisionswerte:
```text
date, ticker, fiscal_period, revenue_estimate_average,
revenue_estimate_high, revenue_estimate_low, analyst_count,
source, snapshot_timestamp
```
Plus EPS-Felder als Redundanz. Die abgeleiteten `revenue_revision_{30,60,90}d` entstehen erst in einer späteren Schicht, sobald genug Archiv-Tage vorliegen. Jeder verlorene Tag verlängert die Reifung 1:1 — deshalb nicht auf den Abschluss der übrigen Punkte warten.

✅ Rate-Limit-Rechnung — erledigt (s. Abschnitt 6)
Guidance vs. Consensus bewusst aus dem Layer-1-Scope herausnehmen, solange keine belastbare Quelle gefunden ist.

Danach: Phase 1 — Feature Specification. Bis dahin bewusst **keine** Änderung an `STRATEGIES`, `ko-prompts.js` oder der produktiven Strategy Registry — Closure → Feature Specification → deterministische Daten-/Scoring-Spezifikation → erst dann Implementierung.

Die EPS/Revenue-Asymmetrie ist dabei kein Blocker, sondern über das Reifegrad-Modell aus Abschnitt 5b von Anfang an eingeplant.

---

*Nächster Schritt: der oben genannte Feasibility-Closure-Schritt, danach Phase 1 — Feature Specification.*
