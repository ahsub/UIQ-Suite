# UIQ-Suite — SWOT-Analyse (technisch + strategisch)

**Version:** 1.2
**Stand:** 07.08.2026 (v1.2: Backtest-Status Parallel-Session eingearbeitet; v1.1: Business-Fakten, Matrix terminiert)
**Hinweis Konsolidierung:** Parallel existiert `docs/SWOT_2026_08_07.md` (zweite Session, 07.08. vormittags) mit weitgehend deckungsgleichen Befunden — eine der beiden Dateien sollte zur kanonischen erklärt, die andere als Querverweis-Stub reduziert werden.
**Autor:** Claude (externe Review-Session), auf Basis Read-only-Zugriff auf `ahsub/{axel-scanner, ko-aggregator, UIQ-Suite, refundex}` + Websuche Wettbewerb
**Vorgänger:** SWOT in `ko-aggregator/docs/STRATEGIE.md` §3 (v1.12, 15.07.2026) — dieses Dokument vertieft und aktualisiert mit Code-Evidenz
**Prüfstein laut Auftrag:** Kommerzialisierung nur bei ausreichender Perspektive

---

## 0. Evidenzbasis und Grenzen

Gesichtet: SUITE.md v3.9, STRATEGIE.md v1.12, FINANZIERUNG-KONZEPT.md v1.0, VALIDIERUNG_META_SIGNAL.md v1.0, REGIME-COVERAGE-ANALYSE.md, ML_KONZEPT-Verweise; `market_aggregator.py` (8.242 Zeilen) mit Fokus MSE/Regime-Pfad; `calc_regime_history_flag()` vollständig; GitHub-Actions-Workflow; Daten-Snapshot 2026-08-06; Track-Record-Backup; Refundex-Strategiedokument (Überblick); Frontend nur strukturell.

**Nicht geprüft:** Cloudflare-KV-Live-Zustand (tr:snap/tr:eval-Keys), Worker-Deployments, tatsächliche Beta-Nutzung. **Offen, da unbeantwortet:** die fünf Business-Fragen (Kosten/Monat, Beta-Aktivität, Preismodell-Präferenz, Wochenstunden-Budget, Stand Rechtsberatung) — wo relevant, arbeite ich mit gekennzeichneten Annahmen.

---

## 1. Stärken

**S1 — Die Architektur-These ist real und im Code eingelöst.** Die Kette Regime → Strategie → Underlying → Instrument existiert nicht nur als Slogan: Regime-Klassifikation im Aggregator, Strategie-Gates je Regime (Coverage-Matrix mit expliziten Sperren, z.B. Collar-Scoring mit `return 0` bei STRESS_UNSTABLE), 10 Leaderboards, Options-Watchlist mit serverseitiger Anreicherung. Die Websuche bestätigt die Positionierungsthese: stock3/Guidants/TraderFox bedienen im DACH-Raum Screener + KO-Rechner, TrendSpider/Option Samurai (~30–80 €/Monat) Charting/Options-Scanning — ein Regime-*Router* mit Strategie-Sperrlogik ist in keinem der gesichteten Angebote das Kernprodukt. Jedes einzelne Kettenglied hat Wettbewerber; die Kette als Produkt bislang nicht.

**Korrektur 09.08.2026:** Diese Aussage war zu pauschal — Eric Ludwigs
5-Star-Options/Planet Options (deutschsprachig, LYNX-Partnerschaft, 20 Jahre
Erfahrung, 45–47 €/Monat) bietet mit dem "Kassandra-Indikator" (40+
Sub-Indikatoren zu einem Ampel-Score kombiniert) ein Markt-Regime-Signal,
kombiniert mit kuratierten Short-Put/Bull-Put-Spread-Wochenlisten. Kein
adaptives, probabilistisch kalibriertes Strategie-Gating wie UIQs
4-Regime-Modell, aber strukturell näher an "Regime-Router" als anfangs
angenommen. Details: `docs/WETTBEWERBSANALYSE-LUDWIG.md`. Kernunterschied
bleibt: Push-Liste (alle Abonnenten identisch) vs. UIQs Diagnose-Ansatz
(individuell je Nutzer/Position). Positives Nebensignal: Ludwigs Preis
(45–47 €/Monat) für einen strukturell einfacheren Dienst validiert
indirekt UIQs eigene Preis-Hypothese (30–50 €/Monat).

**S2 — Außergewöhnliche Engineering-Ehrlichkeit.** Der Code dokumentiert eigene Fehler forensisch (v4.3-Kommentar zum Ratio-Konventions-Bug inkl. Fehlerbild und Marktfolge; KV-Retry-Historie; yfinance-Squeeze-Fallbacks mit Begründung). SUITE.md-Changelog protokolliert auch Rückbauten und revidierte Entscheidungen. Das ist die Kultur, aus der ein glaubwürdiger Track-Record entstehen kann — und sie ist bei Solo-Projekten selten.

**S3 — Governance-Disziplin als struktureller Vorteil.** DSS-Leitprinzip (§0) mit Filtertest, Funnel-Regel (keine harte IBKR-Abhängigkeit im UIQ-Kern), Batch-Deployment, Verifikations-Standing-Rule, Backtest-Ergebnisse explizit als "niemals Marketing" klassifiziert. Letzteres ist zugleich Compliance-Voraussicht.

**S4 — Kostenstruktur passt zum Nischenmodell.** Zentraler Aggregator-Lauf → Marktdaten-Kosten nutzerzahl-unabhängig (Block A); Finanzierungskonzept mit MRR-Trigger (1,5× Kostendeckung) statt Bauchgefühl. Bei 20–50 €/Monat Zielpreis und der Kalkulation im Finanzierungskonzept ist Break-even bei grob 10–20 Abonnenten plausibel *(Annahme; gegen echte Kosten verifizieren)*.

**S5 — Suite-Synergie mit Refundex.** Identische Zielgruppe (IBKR-Typ-Broker, deutsche Steuerpflicht), sauber getrennte Wertschöpfung (Entscheiden vs. Bewirtschaften), Bundle-Argument im DACH-Kernmarkt. Refundex ist zudem das Modul mit dem am besten getesteten Engine-Kern (99 pytest-Tests laut Protokoll).

**S6 — Track-Record-Infrastruktur läuft seit 02.07.2026** mit spezifizierter Methodik (TRACK_RECORD_SPEC v1.1, hit30-Leitmetrik, Strategie×Regime-Auswertung) — das künftige zentrale Verkaufsargument ist nicht nur geplant, sondern im Betrieb.

## 2. Schwächen

**W1 — Test-Lücke im Kern (gravierendste technische Schwäche).** Von ~11.700 Zeilen Python im ko-aggregator ist ausschließlich `dce_layer.py` testabgedeckt (427 Testzeilen). `market_aggregator.py` — 8.242 Zeilen, monolithisch, enthält Regime-Klassifikation, alle Scoring-Funktionen und den KV-Upload — hat **null Tests**. Die im Changelog dokumentierten Bugklassen (Return-Arity, Feldpfade, Konventionen) sind genau die, die Unit-Tests abfangen. Für ein Produkt, dessen Verkaufsargument ein *belegter* Track-Record ist, ist ungetesteter Scoring-Code ein Glaubwürdigkeitsrisiko: Jeder künftig entdeckte Scoring-Bug kontaminiert rückwirkend den Track-Record.

**W2 — Die Ratio-Konventions-Falle lebt noch.** `fetch_vix_term()` liefert `ratio` als VIX/VIX3M, die Regime-Klassifikation rechnet VIX3M/VIX aus den Rohwerten. Der v4.3-Bug (ruhiger Contango-Markt als STRESS_UNSTABLE klassifiziert, Master-Shortlist im Bärenmodus) ist gefixt und vorbildlich dokumentiert — aber beide Konventionen koexistieren weiter im selben Datenobjekt. Auch `pcr.components.ratio` (0.834 im Snapshot 06.08.) ist die VIX/VIX3M-Konvention. Jede neue Funktion, die `ratio` konsumiert, kann denselben Fehler erneut machen.

**W3 — Doppelte Regime-Wahrheit.** Client-MSE (VVIX/SKEW-basiert, ko-market-state.js, 5 Regime inkl. NEUTRAL) vs. Server-Regime (VIX3M/VIX-Ratio, 4 Regime + NEUTRAL-Fallback) sind zwei verschiedene Klassifikatoren mit identischen Labels. Die Anzeige wurde vereinheitlicht (v346/v347), die Logik bewusst nicht. Für die Meta-Signal-/Validierungspläne ist das ein Datenmodell-Problem: *Welches* Regime wird validiert? Der Track-Record loggt das Server-Regime, der Nutzer sieht das Client-Regime.

**W4 — Pipeline-Fragilität.** Der Nightly-Workflow installiert `yfinance` ungepinnt (`pip install yfinance` ohne Version) — jede Breaking-Change von yfinance schlägt ungefiltert auf den Produktionslauf durch, zusätzlich zum bekannten SLA-Risiko der Datenquelle selbst. Ein Lauf, keine Fallback-Quelle, KV-Upload mit nur einem Retry. Das 88-MB-Repo wächst durch Git-History-als-Archiv (Snapshots/Fundamentals committet) unbegrenzt weiter.

**W5 — Frontend-Altlast quantifiziert.** index.html ~2,2 MB Monolith; die Audit-Historie (557 Funktionen, byte-identische Duplikate von CDN-Modulen, Multiple-Sources-of-Truth beim Markov-Code) zeigt: Die v2.0-Migration ist keine Kosmetik, sondern Voraussetzung für externe Mitarbeit und IP-Schutz (Scoring-Logik liegt heute lesbar im Client).

**W6 — Kapazität und Bus-Faktor.** Solo-Entwicklung neben Praxis (Aktivrente mildert, beseitigt nicht). RUNBOOK und ko-ai-Worker-Versionierung haben den SPOF *dokumentarisch* verbessert; operativ bleibt: eine Person, alle Schlüssel, keine zweite, die deployen kann.

**W7 — Validierungsrahmen methodisch unterpowert** (Detail in REVIEW-Session 07.08.2026): überlappende Forward-Returns, n=20-Ziele bei ~65 Handelstagen, undefiniertes Brier-Zielereignis, HMM auf 252 Beobachtungen. Der Fix ist bekannt (historischer Backtest 2007–2026 statt prospektiv) und billig — aber Stand heute ist die geplante Ebene-1-Auswertung zum 01.10. nicht belastbar.

## 3. Chancen

**O1 — DACH-Marktlücke mit Preisreferenz.** Zahlungsbereitschaft der Zielgruppe ist durch US-Vergleichsprodukte belegt (TrendSpider-Basisstufe ~49 $/Monat plus KI-Aufpreise; Option Samurai kostenpflichtig nach Trial). Im deutschsprachigen Raum existiert kein Regime-Router; stock3/TraderFox besetzen Screener/KO-Rechner, nicht die Entscheidungsschicht darüber. Ein 20–50-€-Preis liegt *unter* der US-Referenz bei spezifischerem DACH-Nutzen (Tradegate/DE-Modus, KO-Kultur, deutsche Sprache, Steuersynergie).

**Korrektur 09.08.2026:** Eric Ludwig (5-Star-Options/Planet Options,
45–47 €/Monat) ist eine echte, deutschsprachige Preisreferenz *innerhalb*
der Zielgruppe (nicht nur US-Vergleich) — zusätzliches, direkteres
Validierungssignal für die 20–50-€-Preishypothese. Zugleich Korrektur an
"kein Regime-Router im DACH-Raum": Ludwigs Kassandra-Indikator ist ein
Markt-Regime-Signal, wenn auch ohne adaptives Strategie-Gating. Details:
`docs/WETTBEWERBSANALYSE-LUDWIG.md`.

**O2 — Track-Record als Burggraben mit Zeitvorteil.** Seit 02.07.2026 läuft die Uhr. Jeder Monat Betriebsdaten ist für Nachahmer nicht aufholbar. Der Backtest 2007–2026 (VIX3M-Historie) kann die Regime-Logik zusätzlich *sofort* validieren, ohne den Live-Track-Record zu belasten — beides zusammen ergibt die Story "historisch validiert + live belegt".

**O3 — KI-Schicht als Differenzierung mit Kostenkontrolle.** Coaching-Ton-Briefings und Deep-Dives bieten klassische DACH-Screener nicht; die Cache-/Queue-Konzepte (Phase-1-Blocker) sind bereits durchdacht. Der Palantir-Grundsatz (data-bound, kein Halluzinieren) ist zugleich das Compliance-Schutzschild der KI-Features.

**O4 — GuidelineIQ als zweites Standbein derselben Maschine.** Die Extraktions-/Review-Gate-Architektur überträgt die UIQ-Methodik auf einen Markt (Praxen), in dem Axel selbst Domänenexperte *und* Zielkunde ist — Risikostreuung ohne neuen Tech-Stack.

**O5 — Beta-Kanal ohne Akquisekosten.** Investmentclub + Optionshandel-Community; 10 Tokens existieren. *(Aktivität unbekannt — Business-Frage 2 offen.)*

## 4. Risiken

**T1 — Regulatorik bleibt das existenzielle Risiko.** Die Grenze Finanzanalyse/Anlageberatung (WpHG/WpIG) ist konzeptionell adressiert (Public/EIC-Split, Disclaimer, "keine Empfehlung"-Sprache), aber ohne Rechtsgutachten nicht abgesichert. Verschärfend: Je besser das Produkt seine Kernaufgabe erfüllt ("beste Underlying × Strategie-Kombination"-Button), desto näher rückt es funktional an eine Empfehlung heran. Das Gutachten (~800 € laut STRATEGIE.md) ist der billigste Risiko-Abbau der gesamten Roadmap und sollte *vor* jedem zahlenden Kunden stehen. *(Stand Rechtsberatung unbekannt — Business-Frage 5 offen.)*

**T2 — yfinance-Abschaltung vor Migration.** Bekanntes Risiko, aber mit neuem Aspekt aus dem Code-Review: Es gibt keinen Feature-Flag-/Fallback-Pfad im Aggregator; ein yfinance-Ausfall ist heute ein Totalausfall des Nightly-Laufs, nicht ein degradierter Lauf. Die Migration ist als Phase 2 geplant — das Risiko läuft aber ab Tag 1 des Beta-Betriebs, nicht ab Kommerzialisierung.

**T3 — Track-Record-Kontamination.** Drei Wege, das zentrale Asset zu entwerten: (a) Scoring-Bugs, die rückwirkend entdeckt werden (→ W1); (b) Regeländerungen ohne Versionierung der Klassifikationslogik im Log (welche Regime-Definition galt am Tag X?); (c) Survivorship im Universum (IWV-Holdings monatlich ersetzt, historische Zusammensetzung nicht archiviert — die Monats-CSVs liegen zwar in der Git-History, werden aber nicht point-in-time referenziert).

**T4 — Nischengröße und Konversions-Unbekannte.** Zielgruppe zahlungskräftig, aber klein; oberhalb weniger hundert Abonnenten ungewiss (bereits in STRATEGIE.md benannt). Die eigentliche Unbekannte ist die Konversionsrate von "beeindruckt" zu "zahlt" — das UX-Review-Verdikt "Konzept beeindruckend, Bedienbarkeit abschreckend" ist teilweise abgearbeitet (Phase 0.5 A–J), aber ohne aktive Beta-Nutzung unfalsifiziert.

**T5 — Komplexitäts-Eigendynamik.** v5.9→v5.30 in fünf Wochen, 10+ Leaderboards, 17 KV-Felder allein für Order Blocks. Das ML_KONZEPT benennt das Gegenprinzip selbst ("Reduktion auf unabhängige Signale"), aber die Feature-Velocity zeigt in die andere Richtung. Jedes Feature vergrößert die ungetestete Fläche (W1) und die Erklärlast für Beta-Nutzer (T4). Der DSS-Filtertest existiert — das Risiko ist, dass er bei eigenen Ideen milder angewendet wird als bei fremden.

**T6 — Schlüsselperson.** Unverändert; dokumentarisch gemildert, operativ offen (W6).

---

## 5. Kommerzialisierungs-Perspektive: Bewertung gegen den Prüfstein

Die Frage war: Kommerzialisierung nur bei ausreichender Perspektive. Mein Urteil in drei Sätzen:

**Die Perspektive ist ausreichend, um Phase 1 (Beta) und die Phase-2-Vorbereitungen ernsthaft zu betreiben — sie ist nicht ausreichend belegt, um heute eine GmbH-Gründung oder Fixkosten-Verpflichtungen (Datenlizenzen) zu rechtfertigen.** Die Produktthese ist differenziert und im Code real (S1), der Burggraben-Mechanismus läuft (S6/O2), die Kostenstruktur trägt ein Nischenmodell (S4). Was fehlt, sind die drei Belege, die nur Betrieb liefern kann: aktive Beta-Nutzung, positiv validierte Regime-Logik (Backtest), und ein Rechtsgutachten ohne rote Linie.

**Go/No-Go-Kriterien für die Kommerzialisierungs-Entscheidung** (Vorschlag, Q4 2026 zu bewerten):

**Bewertungstermin: Dezember 2026** (verschoben von Q4-Anfang: Beta startet bei null, braucht Sep–Nov für 4-Wochen-Aktivitätsdaten).

| # | Kriterium | Schwelle | Status 07.08. | Zieltermin |
|---|---|---|---|---|
| 1 | Rechtsgutachten | keine strukturelle Umbau-Auflage | **nicht begonnen** (Fakt, Frage 5) | Erstberatung vor Beta-Start, Gutachten Okt. |
| 2 | Backtest 2007–2026 | Regime-Gates schlagen naive Baseline (200T×Vol) | **vorläufig ✅** — Parallel-Session 07.08. meldet Gate-A Sharpe 1.66 vs 0.63, MaxDD −23% vs −55% (SUITE.md v4.1); ABER: Skript nicht committet, Baseline-Definition/Annualisierung/Kosten ungeprüft → Reproduktion ausstehend | Skript-Commit + Gegenrechnung Aug./Sep. |
| 3 | Beta-Aktivität | ≥5 Nutzer mit ≥2 Sessions/Woche über 4 Wochen | **0 externe Nutzer** — Beta-Reife erst diese Woche erreicht (Fakt, Frage 2) | Nov. |
| 4 | Zahlungsbereitschafts-Signal | ≥3 Beta-Nutzer bejahen 30+ €/Monat konkret (Preis-Hypothese 30–50 €, Frage 3) | offen | Nov./Dez. |
| 5 | Track-Record hit30 | erste Auswertung ohne Kontaminations-Befund | läuft (seit 02.07.) | Okt./Nov. |
| 6 | Test-Abdeckung Scoring-Kern | Regime-Klassifikation + Top-3-Scorer unit-getestet | 0 % | Sep. |

Sind 5–6 von 6 grün → Phase 2 voll einleiten. Sind ≤3 grün → UIQ als exzellentes Eigen-Tool weiterbetreiben (das es heute schon ist) und die Kommerzialisierungs-Frage auf GuidelineIQ verlagern, wo Domänenvorsprung und Regulatorik-Vertrautheit größer sind. Ein "Eigen-Tool-Ausgang" ist kein Scheitern: Die Entwicklungskosten sind bereits durch den Eigennutzen gedeckt.

## 6. Priorisierte Empfehlungen (Pareto)

1. **Testgürtel um den Regime-Pfad** (W1/W2/T3): Unit-Tests für `_ratio_to_regime`-Äquivalent, Regime-Klassifikation inkl. beider Ratio-Konventionen, `calc_regime_history_flag`. Geschätzt 1–2 Sessions; schützt das wertvollste Asset.
2. **Ratio-Konvention härten** (W2): `vix_term['ratio']` umbenennen (z.B. `ratio_vix_vix3m`) oder zweites Feld `ratio_3m_1m` ergänzen — der Bug-Klasse den Namen wegnehmen.
3. **Backtest-Skript 2007–2026** (W7/O2/Go-Kriterium 2): wie in der Review-Session spezifiziert; ersetzt den unterpowerten prospektiven Rahmen.
4. **Rechtsgutachten beauftragen** (T1/Go-Kriterium 1): billigster existenzieller Risiko-Abbau; kein Grund zu warten, da unabhängig von Feature-Stand.
5. **yfinance pinnen + Degradations-Pfad** (W4/T2): Version im Workflow fixieren; bei Fetch-Fehlern Vortages-KV weiterverwenden statt Lauf-Abbruch.
6. **Beta aktivieren und messen** (T4/Go-Kriterien 3–4): ohne Nutzungsdaten bleibt die halbe SWOT Spekulation.
7. **Feature-Freeze-Fenster erwägen** (T5): z.B. September = Validierung + Tests + Beta statt neuer Indikatoren.

---

## 7. Business-Fakten (nachgetragen 07.08.2026, Quelle: Axel)

**Kosten:** Mai ~46 €, Juni ~159 €, Juli-Peak ~250 € (Anthropic, deckungsgleich mit intensivster Entwicklungsphase), August nach 6 Tagen 12,43 €; Cloudflare ~9 €/Monat; Claude-Abo ~220 €/Jahr (Entwicklungswerkzeug). **Einschränkung:** Entwicklungs- und Betriebskosten nicht getrennt messbar — Kosten-Telemetrie pro Feature/Nutzer fehlt (→ Empfehlung 8). Schätzung reiner Betrieb je aktivem Nutzer: 10–30 €/Monat KI-Kosten; bestätigt Notwendigkeit der Phase-1-Cache/Queue/Kontingent-Konzepte vor Beta-Skalierung.

**Beta:** 0 externe Nutzer; Beta-Reife nach Axels Einschätzung erst in dieser Woche erreicht. Alle Nutzungs- und Zahlungsbereitschafts-Aussagen sind damit Hypothesen (T4 verschärft, O5 unerschlossen).

**Preis-Hypothese:** 30–50 €/Monat (konsistent mit US-Referenzpreisen, unvalidiert).

**Kapazität:** 4–5 Std./Tag seit Projektbeginn Ende Mai 2026 (~10 Wochen Gesamtprojektalter). Doppelte Lesart: außergewöhnliche Velocity als Stärke; ~30 Wochenstunden als Dauerzustand ist die zentrale Tragfähigkeitsfrage (W6/T6 verschärft — das Projekt ist faktisch ein zweiter Beruf).

**Rechtsberatung:** Nichts unternommen ("erst sehen, wie sich das Projekt entwickelt"). Bewertung: nachvollziehbar für die Bauphase, aber jetzt inkonsistent mit dem Beta-Plan — Empfehlung: anwaltliche **Erstberatung vor Einladung externer Beta-Tester** (auch kostenlose Beta mit empfehlungsähnlichen Ausgaben an Dritte berührt die WpHG-Abgrenzung), Vollgutachten vor dem ersten Euro.

**Konsequenz für §5:** Urteil unverändert (Perspektive ausreichend für Beta + Phase-2-Vorbereitung, nicht für Verpflichtungen), aber Zeitachse konkretisiert: Go/No-Go Dez. 2026; erste Umsätze frühestens Q1/Q2 2027; Best Case Ende 2027: 50–150 Abonnenten / 1.500–5.000 € MRR. Drei-Szenarien-Rahmen (Geschäftsmodell mit Rollenteilung / Eigen-Tool / GuidelineIQ-Pivot) im Begleitdokument BRIEFING-GESCHAEFTSMODELL-2026-08-09.md.

## 8. Verbleibende offene Punkte

KV-Live-Prüfung tr:snap/tr:eval-Bestand; Client-MSE-Code (ko-modules) gegen Server-Regime abgleichen (W3); Wettbewerbs-Deep-Dive (Preisstufen verifizieren) vor Preisentscheidung; **neu:** Kosten-Telemetrie (API-Kosten je Feature/Nutzer taggen) als Voraussetzung sauberer Unit Economics.
