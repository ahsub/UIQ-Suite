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

Über alle sechs live getesteten Ticker (IBKR, MPC, MRK, NVDA, CAT, STNG) hinweg wurden **drei unterschiedliche Anomalie-Muster** gefunden — kein Einzelfall, sondern ein wiederkehrendes Bild. Für die Sanity-Check-Logik (s. Abschnitt 5c/8) bedeutet das: mindestens drei verschiedene Prüfmuster nötig, nicht nur eines.

**Muster 1 — Wiederholter Platzhalterwert (MPC):** `revenue_estimate_high` steht über sieben aufeinanderfolgende Quartale (2025-03-31 bis 2026-06-30) exakt bei `40000000000.00` — auffällig rund, identisch wiederholt. Sieht nach einem Stale-Value im Vendor-Datensatz aus, nicht nach echter Analystenschätzung.

**Muster 2 — Stock-Split-Artefakte (NVDA):** Zwei Stellen zeigen scheinbar dramatische Revisionssprünge, die tatsächlich reine Split-Bereinigungs-Artefakte sind — 2024-07-31 (`eps_estimate_average_90_days_ago = 5.86` vs. aktuell `0.64`, Faktor ~9x, deckt sich mit NVDAs 10:1-Split Juni 2024) und 2021-10-31 (Faktor ~4x, deckt sich mit dem 4:1-Split Juli 2021). Die "Tage-zuvor"-Vergleichswerte scheinen nicht durchgängig split-bereinigt zu sein.

**Muster 3 — Kompletter Nullwert-Ausreißer (NVDA):** Das Quartal 2022-07-31 zeigt `eps_estimate_analyst_count: "0.0000"` und `eps_estimate_average: "0.0000"`, während `eps_estimate_average_7_days_ago` noch einen validen Wert (`1.2500`) zeigt — eine komplette Nullwert-Zeile trotz befüllter Nachbarfelder.

**Konsequenz für die geplante Sanity-Check-Logik** (analog zu bestehenden Sanity-Filtern wie `iv_layer.py`): mindestens drei Prüfregeln nötig — (a) Erkennung wiederholter Werte über mehrere Perioden hinweg, (b) Erkennung von Near-Integer-Multiplikator-Sprüngen (2x, 4x, 10x — typische Split-Verhältnisse) um bekannte Split-Termine, idealerweise abgeglichen gegen die ohnehin im UIQ-Aggregator vorhandenen Split-Daten, (c) Erkennung kompletter Nullwert-Zeilen bei gleichzeitig befüllten Nachbarfeldern. Kein Blocker für Phase 0, aber ein konkreter, belegter Umfang für die Implementierung in Phase 1/2 statt einer vagen "Sanity Checks nötig"-Notiz.

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

**Effekt auf die Rate-Limit-Rechnung (Abschnitt 6) — jetzt mit echten Zahlen statt Schätzung:** Live gegen das tatsächliche 737-Ticker-Universum getestet (`EARNINGS_CALENDAR`, horizon=3month, abgeglichen mit einem `master_market_data.json`-Snapshot vom 22.09.2026):

- **15 von 737 UIQ-Tickern (2,0%)** fallen zum Testzeitpunkt ins 5-15-Handelstage-Fenster — darunter JNJ (bereits als ATMNA-Kandidat getestet), MU, BAC, JPM, GS, WFC.
- **416 von 737 UIQ-Tickern** berichten in der Haupt-Earnings-Season (Wochen +3 bis +7 ab Testdatum) — die Clustering-These aus diesem Abschnitt bestätigt sich damit auch marktweit: 93% aller 4.490 Kalender-Events im Gesamtmarkt liegen in genau diesem 5-Wochen-Fenster.
- **Einschränkung:** Nur 431 von 737 UIQ-Tickern hatten überhaupt einen Treffer im 3-Monats-Kalender. Die übrigen 306 sind größtenteils Symbol-Format-Mismatches (Auslandsnotierungen `.L`/`.DE`, Krypto `-USD`, ETFs) oder liegen außerhalb des 3-Monats-Horizonts (nächster Bericht erst nach dem 17.12.2026) — kein Datenproblem, aber relevant für eine vollständige Jahresabdeckung (dafür wäre `horizon=12month` nötig, nicht getestet).

**Damit ist die Kernaussage dieses Abschnitts empirisch bestätigt, nicht mehr nur plausibel:** Ein einzelner Tages-Vorfilter reduziert das Universum von 737 auf eine niedrige zweistellige Zahl — 15 im aktuellen Testfall. Die Premium-75-Rechnung aus Abschnitt 6 (~20 Minuten für alle 737 Ticker) war damit ohnehin schon ein sehr konservativer oberer Rahmen; mit Vorfilter liegt der tatsächliche tägliche Bedarf um eine Größenordnung niedriger.

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
REVENUE REVISION HISTORY        ⏳ UIQ ARCHIVE (Skript fertig, s. unten — Historie beginnt erst mit dem produktiven Betrieb)
GUIDANCE vs CONSENSUS            ⏸ außerhalb Layer 1
DATA SANITY                     ✅ implementiert, getestet gegen echte Anomalien (3 Muster, s. Abschnitt 4) — bewusst nur Flags, kein Auto-Filter
CROSS-SECTOR VALIDATION          ✅ 6 Ticker, 6 Kategorien getestet
EARNINGS CALENDAR PRE-FILTER     ✅ Live-Test bestanden (15/737 im 5-15d-Fenster, als Tagesbeobachtung — kein garantiertes Maximum)
API-TARIF                       ✅ bestätigt: nur Free-Tier (25/Tag, 5/Min), Skript entsprechend budget-bewusst gebaut
COST MODEL                       🟢 weitgehend geklärt
PHASE 1 FEATURE SPECIFICATION    → danach
```

**Feinaufschlüsselung Punkt C** (Revenue-Archiv, ab hier präziser als nur "🟡"):

```text
C  Archiv-Skript (v0.3)                  ✅ fertig, getestet, echtes Tagesbudget-Tracking statt fixem Limit
C  Nightly-Workflow-Integration          ⏳ bewusst noch NICHT verdrahtet (Empfehlung Reviewer, 23.09.2026)
C  Täglicher produktiver Betrieb         ⏳ noch nicht gestartet
C  30-Tage-Revenue-Historie              ⏳ Tag 0 noch nicht erreicht
C  90-Tage-Revenue-Historie              ⏳ Tag 0 noch nicht erreicht
```

**Architektur-Entscheidung (Reviewer, 23.09.2026, übernommen):** Das Skript läuft vorerst **separat, nicht in `market-aggregator.yml` verdrahtet** — kein Premium-Kauf, keine verfrühte Integration. Nach einigen Tagen produktivem Stand-alone-Betrieb wird neu entschieden, ob die Archivierung in den Nightly-Workflow gehört. Der Free-Tier-Sicherheitsmechanismus wurde dabei ausdrücklich verschärft: Statt einer fixen Obergrenze (die frühere Fassung hatte `max_tickers_per_run=10` als Konstante) berechnet das Skript jetzt das tatsächlich verbleibende Tagesbudget aus einem persistenten Usage-Log — die Beobachtung "15 Ticker passen heute unters Limit" war ein Tageswert, kein garantiertes Maximum, und wurde entsprechend nicht als feste Zahl in den Code geschrieben.

**Zur Sekundärquellen-Frage:** Alpha Vantage ist nach diesem Bericht die einzige Quelle, die für den zentralen Revisionsmechanismus live verifiziert wurde. FMP bleibt dokumentarisch bestätigt, aber praktisch nicht validiert — für den aktuellen Ein-Personen-Betrieb keine Multi-Vendor-Architektur bauen, solange AV allein trägt. FMP bleibt als Kandidat vermerkt, nicht als gleichwertige zweite Quelle behandelt.

**Empfehlung:** Phase 0 als bestanden werten, aber vor Phase 1 noch einen kleinen, gezielten **Feasibility-Closure-Schritt** einschieben — keine neue große Research-Phase, sondern das Schließen der in Abschnitt 7 benannten Lücken:

**A. ✅ Erledigt:** Sechs Ticker live getestet über sechs strukturell verschiedene Kategorien: IBKR (Financial/Activity-driven), MPC (Commodity), MRK (Pharma/Large-Cap), NVDA (Tech/AI, extremstes Revisionsmomentum, 53 Analysten), CAT (Zyklisch/Industrie), STNG (geringere Coverage, 6-10 Analysten). Schema blieb über alle sechs identisch und stabil — auch bei deutlich dünnerer Coverage (STNG) keine strukturellen Ausfälle. Nebenbei drei Datenqualitäts-Anomalie-Muster gefunden (s. Abschnitt 4) — wichtigster Fund: Stock-Split-Artefakte bei NVDA, die einer Sanity-Check-Logik ohne Split-Abgleich als scheinbar dramatische Fehlrevisionen erscheinen würden.

**B. ✅ Erledigt:** `EARNINGS_CALENDAR`-Bulk-Call live gegen das 737-Ticker-Universum getestet (s. Abschnitt 5c) — 15 von 737 Tickern im 5-15-Handelstage-Fenster, 416 von 737 in der Haupt-Season. Die vier weiteren sicheren Vorfilter (Market Cap, Cashflow, Index-Mitgliedschaft, Liquidität) wurden dabei noch nicht angewendet, da sie in `master_market_data.json` bereits vorliegen (die 737 Ticker sind bereits das kuratierte UIQ-Universum, nicht der Rohmarkt) — die zusätzliche Filterung wäre daher hier redundant, könnte aber bei einer Ausweitung des Universums relevant werden.

**C. 🟡 Skript fertig (v0.3), Produktivlauf noch offen:** `earnings_estimates_archive.py` gebaut (Python, analog `iv_layer.py`) — Revenue + EPS als Redundanz (Scope-Entscheidung Axel, 23.09.2026), plus die drei Sanity-Check-Muster aus Abschnitt 4 als Diagnose-Flags (keine automatische Filterung, Namen final: `REPEATED_PLACEHOLDER`/`POSSIBLE_SPLIT_ARTIFACT`/`ZERO_VALUE_ANOMALY`). Getestet gegen die echten Live-Antworten der sechs bereits abgefragten Ticker (IBKR/MPC/MRK/NVDA/CAT/STNG) — alle drei bekannten Anomalien werden erkannt, keine False Positives bei sauberen Tickern. **Ein Nebenfund beim Testen:** der Split-Artefakt-Detektor markiert bei MPC zwei zusätzliche Stellen, die vermutlich keine Splits sind, sondern echte Rohstoff-Volatilität (§14-Muster) — Verfeinerungskandidat für Phase 2/3 (Abgleich gegen echte Split-Kalenderdaten statt reiner Statistik-Heuristik), kein Blocker.

**v0.3-Korrektur (Reviewer, 23.09.2026):** Die erste Fassung hatte eine feste Sicherheits-Obergrenze (`max_tickers_per_run`) als Konstante — das war der am 23.09. *beobachtete* Wert (15 Ticker im 5-15-Tage-Fenster), kein garantiertes Tagesmaximum. In einer starken Earnings-Woche könnten deutlich mehr Kandidaten anfallen. Jetzt: ein persistentes Usage-Log zählt die tatsächlich heute bereits verbrauchten Requests, das für jeden Lauf effektiv verbleibende Tagesbudget wird live daraus berechnet (`daily_cap - bereits verbraucht`), nicht angenommen. Ticker, die wegen Budget-Erschöpfung nicht verarbeitet werden konnten, landen in einer `pending_candidates_<date>.json` statt stillschweigend zu verschwinden — der nächste Lauf entscheidet explizit, ob er sie aufgreift.

Rohdaten-Schema wie vorgeschlagen:
```text
date, ticker, fiscal_period, revenue_estimate_average,
revenue_estimate_high, revenue_estimate_low, analyst_count,
source, snapshot_timestamp
```
Plus EPS-Felder als Redundanz. Die abgeleiteten `revenue_revision_{30,60,90}d` entstehen erst in einer späteren Schicht, sobald genug Archiv-Tage vorliegen. Jeder verlorene Tag verlängert die Reifung 1:1 — deshalb nicht auf den Abschluss der übrigen Punkte warten.

**Noch offen, bevor die 90-Tage-Uhr tatsächlich läuft:** Einbindung in den Nightly-Workflow (`market-aggregator.yml`) — **bewusst noch nicht verdrahtet** (Architektur-Entscheidung Reviewer, 23.09.2026, s. Statustabelle oben). Die Tarif-Frage ist geklärt — **aktuell nur AV-Free-Tier aktiv** (Axel, 23.09.2026), kein Premium-Tarif. Skript entsprechend auf v0.3 aktualisiert: tier-bewusste Presets (`--tier free|premium75|premium150`) statt fester Konstanten, Default `free` mit `sleep_seconds=13.0` (statt der für Premium-75 kalibrierten 1.0s, die auf Free-Tier eine Rate-Limit-Sperre ausgelöst hätte). Die Tages-Obergrenze ist **keine feste Zahl mehr**, sondern wird pro Lauf live aus einem Usage-Log berechnet (verbleibendes Budget = 25 minus heute bereits verbrauchter Requests) — die ursprüngliche Annahme "15 Ticker passen unters Limit" war ein Tageswert, kein Versprechen für jeden Tag.

✅ Rate-Limit-Rechnung — erledigt (s. Abschnitt 6)
Guidance vs. Consensus bewusst aus dem Layer-1-Scope herausnehmen, solange keine belastbare Quelle gefunden ist.

Danach: Phase 1 — Feature Specification. Bis dahin bewusst **keine** Änderung an `STRATEGIES`, `ko-prompts.js` oder der produktiven Strategy Registry — Closure → Feature Specification → deterministische Daten-/Scoring-Spezifikation → erst dann Implementierung.

Die EPS/Revenue-Asymmetrie ist dabei kein Blocker, sondern über das Reifegrad-Modell aus Abschnitt 5b von Anfang an eingeplant.

---

*Nächster Schritt: der oben genannte Feasibility-Closure-Schritt, danach Phase 1 — Feature Specification.*
