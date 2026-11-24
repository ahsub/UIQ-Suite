## №XX — Quellenregeln: Plattform-Konsens als Watchlist-Filter und Short-Put-Auswahl (Quelle: Videos eines Finfluencers, Dez. 2021, Sept.–Nov. 2024 und Nov. 2026)

**Status:** Backlog, kein Testauftrag vor der Go/No-Go-Entscheidung. Methodik wie bei den Dividenden-Hypothesen (H-DIV): Regel mit Beleg → messbare Schwellen → Parameter vorab fixiert → Test → Übernahme nur bei bestandenem Abbruchkriterium Out-of-Sample.

**Kontext:** Videoanalyse eines Einzeltitels (US-Small-Cap, Gesundheitssektor) durch einen Moderator (Trader/Kursanbieter) und einen Gast (Analyst eines Datenanbieters). Einzeltitel und Kursziele sind hier bewusst nicht genannt. Urheberschaft je Regel unten.

### A. Regeln aus der Quelle

| ID | Regel | Urheber | Konkretheit | Beleg (Transkript) |
|---|---|---|---|---|
| R1 | Ein Titel kommt nur auf die Watchlist, wenn mehrere unabhängige Bewertungsplattformen ihn übereinstimmend positiv sehen | Moderator | qualitativ (Beispielwerte 4,46/5 · 4,38/5 · „gut“ · 75 %) | „quer durch die Bank … als positiv bewertet“ (Z. 9) |
| R2 | Zwei Insolvenz-Indikatoren rot → deutlich vorsichtiger; ein roter neben einem grünen „neutralisiert sich“ | Moderator | qualitativ (Zonen) | „Hätte ich hier zwei rote Flächen …“ (Z. 22) |
| R3 | Niedriger Manipulations-Score (Beneish M) als Entlastung | Moderator | qualitativ | (Z. 23) |
| R4 | Großer Abstand zwischen trailing und forward EV/EBITDA = Markt hält Gewinnniveau für nicht nachhaltig → genauer prüfen | Gast | qualitativ | (Z. 46) |
| R5 | ROIC weit über Kapitalkosten = effizientes Unternehmen | Gast | Beispielwerte (44 % vs. 11 %) | (Z. 45) |
| R6 | Titel mit Konsens, aber regulatorischem Klumpenrisiko höchstens als kleine Beimischung | Moderator | qualitativ | „vielleicht eine kleine Wette“ (Z. 81) |

**Selbstkritik der Quelle:** Der Gast relativiert die eigenen Scores: Das Gewinnniveau der letzten zwölf Monate sei nicht nachhaltig; die Bewertungsmodelle streuen stark. Die Quelle nennt keine Trefferquote ihrer Watchlist.

**Notizen ohne Regelcharakter:** steigende Aktienzahl (Verwässerung) als Abzug; „klein und wenig beachtet“ als positiv (Gast); Trend über 40-Wochen-Linie als Bestätigung.

### B. Hypothesen

#### H-FIN-1 — Konsens-Regel (UND-Verknüpfung) statt Durchschnitts-Score

**Kern der Regel:** Nicht der Mittelwert der Bewertungen zählt, sondern dass *keine* Dimension negativ ist. Testbar ist genau dieser Unterschied.

**Problem:** Die Original-Scores der Drittplattformen gibt es nicht als Point-in-Time-Historie. Deshalb zwei Varianten:

**H-FIN-1a — Forward-Shadow-Log mit Original-Plattformen**
- Operationalisierung: Für eine feste Titelliste (UIQ-Watchlist + Zufallsstichprobe gleicher Größe aus dem Universum) je Stichtag die Scores der Plattformen protokollieren. „Konsens positiv“ = alle Plattformen ≥ 4/5 bzw. höchste oder zweithöchste Stufe (**Annahme**).
- Test: Konsens-Titel vs. Nicht-Konsens-Titel, Haltedauer 3 und 6 Monate (vorab festgelegt).
- Messgrößen: Überrendite gegenüber breitem Index und Sektor-Index, maximaler Verlust vom Hoch, Trefferquote.
- Abbruch: Nach 12 Monaten keine positive Überrendite der Konsens-Gruppe gegenüber der Kontrollgruppe → verwerfen.
- Datenbedarf / vorab prüfen: AGB/Lizenz der Plattformen für automatisierte Abfrage (sonst manuell, kleine Stichprobe); Protokollformat im Archiv-Repo.
- Einschränkung: statistisch dünn; liefert eher Plausibilität als Signifikanz.

**H-FIN-1b — Backtest mit UIQ-eigenem Proxy**
- Operationalisierung: Fünf Faktorfamilien analog den Plattform-Kategorien: Bewertung, Wachstum, Profitabilität, Momentum, Gewinnrevisionen. Je Familie Perzentil-Rang im Universum. **Konsens** = alle fünf Familien ≥ 60. Perzentil (**Annahme**; Variante 2: ≥ 50.). **Vergleich** = Mittelwert der fünf Ränge, gleiche Anzahl Titel.
- Test: Monatliche Umschichtung, gleichgewichtet; Varianten: (1) Universum, (2) Durchschnitts-Score Top-N, (3) Konsens-Filter, (4) beste Einzelfamilie Top-N.
- Benchmarks: breiter Index + stilgleicher Multi-Faktor-Vergleich.
- Messgrößen: Rendite, Sharpe Ratio, maximaler Verlust, Umschlag, Aufteilung nach Marktregime.
- In-/Out-of-Sample-Grenze vorab fixieren; pauschale Transaktionskosten.
- Abbruch: Konsens (3) schlägt Durchschnitt (2) Out-of-Sample nach Kosten nicht bei der Sharpe Ratio → verwerfen.
- Datenbedarf / vorab prüfen: Point-in-Time-Fundamentaldaten und Analystenschätzungen (PIT-Risiko hoch, vgl. №70); Revisionsfamilie ggf. weglassen, wenn keine PIT-Schätzungen → dann vier Familien, vorab so festlegen.

#### H-FIN-2 — Doppelrot-Ausschluss bei Insolvenz-Indikatoren

- Operationalisierung: Ausschluss, wenn Altman Z (Variante je Branche, **zu prüfen**: Z für Industrie, Z'' für Nicht-Industrie) in der Distress-Zone **und** Fulmer H < 0. Nur einer rot → kein Ausschluss (so die Quelle).
- Test: Universum mit vs. ohne Ausschluss; zusätzlich Ausschluss schon bei einem roten Indikator (naive Variante).
- Messgrößen: Anteil späterer Totalverluste/Delistings im Ausschluss-Korb, maximaler Verlust, Rendite.
- Abbruch: Doppelrot-Korb zeigt Out-of-Sample keine höhere Ausfall- bzw. Verlustrate als der Rest → verwerfen.
- Datenbedarf / vorab prüfen: Bilanzfelder (PIT-Risiko mittel); **Delisting-Daten zwingend** — ohne sie ist der Test wegen Survivorship-Bias wertlos.
- Bezug: Kennzahl einmal bauen, nutzbar auch als Warnhinweis im Event & Surprise Gate.

#### Notiz ohne Testauftrag — H-FIN-3 Gewinn-Nachhaltigkeit (R4)
Forward- zu trailing-EV/EBITDA als Warnsignal für Sonderergebnisse. Fachlich plausibel, scheitert vorerst an PIT-Schätzdaten (№70). Als Prüfhinweis für Fair-Value-Engine vormerken.

### B2. Optionen: Short Puts und Bull Put Spreads (Quelle: vierteilige Videoserie desselben Anbieters zu einem Optionsdienst, Sept.–Nov. 2024: Regeln, Dashboard, Strategien, Kundeninterview)

**Regeln aus der Quelle**

| ID | Regel | Urheber | Konkretheit | Beleg (Transkript, Sammeldatei) |
|---|---|---|---|---|
| R12 | Backtest je Basiswert über bis zu 6 Jahre: Optionen mit vergleichbarem Delta und gleicher Laufzeit „zu allen möglichen Zeitpunkten“, Halten bis Verfall; Trefferquote = Anteil Trades mit positivem Ertrag; ca. 100 Datenpunkte je Kandidat | Anbieter | Schwellen genannt | (Z. 13–19) |
| R13 | Prämie ≥ 50 $ je Kontrakt | Anbieter | Schwelle genannt | (Z. 21–23) |
| R14 | Laufzeit 30–60 Tage | Anbieter | Schwelle genannt | (Z. 23) |
| R15 | Aktien ausgeschlossen, wenn Quartalszahlen in die Laufzeit fallen (ETFs ausgenommen); unbestätigte Termine beobachten | Anbieter | Schwelle genannt | (Z. 23–25, Z. 63) |
| R16 | Delta < 0,20 | Anbieter | Schwelle genannt | (Z. 25) |
| R17 | Trefferquote ≥ 80 %, bei zu vielen Kandidaten ≥ 90 % | Anbieter | Schwelle genannt, aber marktabhängig | (Z. 25–27) |
| R18 | Short Puts nur auf Basiswerte < 100 $; Bull Put Spreads mit engem Strike-Abstand (Margin) | Anbieter | Schwelle genannt | (Z. 27) |
| R19 | Sterne für die Top 5 je Kategorie (Gesamt-Score, Renditeerwartung, Sicherheitspolster, Trefferquote); Gleichstand → mehr Datenpunkte gewinnen | Anbieter | Schwelle genannt | (Z. 29–33, Z. 69–71) |
| R20 | Rendite = Prämie / maximaler Einsatz | Anbieter | Formel | (Z. 61) |
| R21 | Fünf Auswahlstrategien: Top 5 nach Score, nach Polster, nach Rendite, nach Trefferquote, individuell mit Chart/Fundamentalanalyse | Anbieter | Schwelle genannt (Top 5) | (Z. 85–93) |
| R22 | Gewinnmitnahme bei 80 % der Prämie statt Halten bis Verfall | Gast (Abonnentin), vom Anbieter befürwortet | Schwelle genannt | (Z. 125–127) |
| R23 | Positionsgröße nach freier Margin und Maximalverlust je Spread | Gast | qualitativ | (Z. 123) |

**Selbstkritik der Quelle:** Auch nach 100 % Trefferquote kann der nächste Trade ein Totalverlust sein (Z. 91); die Kandidaten sind frei von Chart- und Fundamentalanalyse, also nicht qualitätsgeprüft (Z. 93).

**Notizen ohne Regelcharakter:** Kontraktbeschreibung als Copy&Paste-Zeile für die Handelsplattform (relevant für ein späteres Options-Modul); statische Kurse zum Erstellungszeitpunkt; Mindestdepot 5.000 €; Wegfall der Verlustverrechnungsgrenze für Termingeschäfte (JStG 2024) als Argument für Spreads — Steuerfrage, keine Handelsregel.

#### H-FIN-5 — Sternekategorien gegen Zufallsauswahl

- **Kern:** Bei Delta < 0,20 ist eine Trefferquote um 80 % bereits eingebaut. Die Frage ist, ob die Sterne-Rangfolgen innerhalb der qualifizierten Kandidaten einen messbaren Vorteil bringen. Die fünf Strategien der Quelle liefern die Testarme direkt.
- Operationalisierung: Universum = alle Kandidaten, die R12–R18 erfüllen. Testarme: Top 5 nach Score, Polster, Rendite, Trefferquote; **Kontrolle:** 5 Zufallskandidaten aus demselben Universum (viele Ziehungen). Gleiche Positionsgröße je Kandidat (Kapital, nicht Kontrakte).
- Historische Trefferquote neu berechnen mit **nicht überlappenden** Trades (ein Einstieg je Verfallsmonat) als Variante 2 neben der Quelldefinition.
- Messgrößen: Ertrag je gebundenes Kapital und Kapitaltag, durchschnittlicher und schlimmster Verlust je Trade, Anteil Andienungen, Sharpe Ratio; Aufteilung nach Marktregime.
- Abbruch: Keine Kategorie schlägt die Zufallsauswahl Out-of-Sample bei Ertrag je Kapital oder Tail-Verlust → Sterne nur noch als Anzeige werten.
- Datenbedarf / vorab prüfen: historische Optionsdaten mit Geld-/Briefkurs (kostenpflichtig; Kosten vorab klären, Projekt-Ökonomie); Delisting- und Übernahmehistorie der Basiswerte (sonst Survivorship-Bias); gehebelte ETFs gesondert ausweisen. **Günstiger Vorlauf:** die wöchentlich veröffentlichten Kandidaten des Dienstes vollständig als Shadow-Log mitschreiben (alle, nicht nur gehandelte), Ergebnis bei Verfall nachtragen.

#### H-FIN-6 — Earnings-Ausschluss bei Short Puts

- Operationalisierung: gleiche Trades wie H-FIN-5 ohne R15, getrennt nach „Earnings-Termin innerhalb der Laufzeit“ ja/nein (angekündigter Termin Point-in-Time, nicht tatsächlicher).
- Test: Ertrag und Tail-Verlust je Kapital in beiden Gruppen; Variante: Ausschluss nur bei bestätigtem Termin.
- Abbruch: kein Unterschied im Tail-Verlust je Kapital → Regel nur als Hinweis führen.
- Datenbedarf / vorab prüfen: historische Earnings-Termine inkl. Ankündigungsstand (PIT-Risiko hoch); bis dahin Auswertung im eigenen Trade-Journal.

#### H-FIN-7 — Vorzeitige Gewinnmitnahme

- Operationalisierung: identische Einstiege; Ausstieg (a) Verfall, (b) bei 80 % der Prämie (Quelle 2024), (c) bei 50 % (naive Variante), (d) Jahresrendite-Regel aus dem Livestream (Buch: ≥ 70 % der Prämie in der ersten Laufzeithälfte bzw. 75 %-Gewinnstopp): schließen, sobald die sicherbare Rendite p. a. die geplante um ≥ 10 Prozentpunkte übersteigt (**Annahme** für „deutlich“, Beispiel der Quelle 15 % → 25 %). Freigewordenes Kapital wird beim nächsten Signal neu eingesetzt, sonst Geldmarktzins.
- Messgrößen: Ertrag je Kapitaltag, Tail-Verlust, Anzahl Trades und Kosten (Geld-Brief-Spanne beim Schließen).
- Abbruch: (b) zeigt weder höheren Ertrag je Kapitaltag noch geringeren Tail-Verlust als (a) nach Kosten → verwerfen.
- Datenbedarf: tägliche Optionskurse während der Laufzeit (höher als für H-FIN-5); im eigenen Trade-Journal sofort auswertbar, wenn Schließkurse und Daten erfasst sind.

### B3. Optionen: Cash-gedeckte Puts am Geld mit systematischem Rollen (Quellen: Buch desselben Anbieters, 2021, Primärquelle; Livestream Dez. 2021, ergänzend)

**Chronologie:** Älteste Quelle (2021), vor dem Bärenmarkt 2022. Der Optionsdienst von 2024 (B2) verfolgt einen fast gegensätzlichen Ansatz (keine Chart-/Fundamentalprüfung, Delta < 0,20, Earnings-Ausschluss, Halten bis Verfall). Gemeinsam ist beiden nur die vorzeitige Gewinnmitnahme. Regeln deshalb getrennt testen, nicht vermischen. Bei Abweichungen zwischen Buch und Livestream gilt das Buch.

| ID | Regel | Urheber | Konkretheit | Beleg |
|---|---|---|---|---|
| R24 | Qualitätsauswahl (nicht alles muss erfüllt sein): Umsatz, Gewinn je Aktie, operativer und freier Cashflow über ca. 10 Jahre steigend; Dividende mit Ausschüttungsquote ≤ 60 % (REITs 90 %), Rückkäufe als Plus; KGV idealerweise < 20 (Tech höher); hochvolatile und medienpräsente Aktien meiden; Prüfung 1–2× jährlich | Anbieter | Schwellen genannt | Buch Kap. 4; Stream Z. 47, Z. 89 |
| R24b | Optionstechnische Auswahl: Kurs 15–80 $; Open Interest und Tagesvolumen dreistellig, enge Geld-Brief-Spanne; Basispreis-Abstand ≤ 5 % des Kurses (ideal 1 $); liquide Wochenoptionen als Plus | Anbieter | Schwellen genannt | Buch Kap. 4 |
| R25 | Einstieg: RSI-14 nicht > 70; im Bereich 30–70 steigend oder aus < 30 steigend; MACD-Histogramm ≥ 3 Tage in Folge steigend **oder** MACD-Kaufsignal in den letzten 7 Tagen | Anbieter | Schwellen genannt | Buch Kap. 5; Stream Z. 51, Z. 111–113 |
| R26 | Basispreis am Geld (im Zweifel leicht darunter); Unterstützung (≥ 2 Tests in 12 Monaten) v. a. für den Roll-Basispreis. Dienst 2021: mit Sicherheitsabstand | Anbieter | Schwelle genannt | Buch Kap. 3, 5; Stream Z. 93–99 |
| R27 | Laufzeit beim Einstieg ca. 30 Tage, bevorzugt Monatsverfall (3. Freitag); beim Rollen 30–60 Tage, höchstens 90 | Anbieter | Schwellen genannt | Buch Kap. 3 (Stream nannte „ca. 60, max. 90“ — dort vermutlich auf das Rollen bezogen) |
| R28 | Prüfung 5 Tage vor Verfall; vorzeitig schließen, z. B. bei ≥ 70 % der Prämie in den ersten 50 % der Laufzeit, Variante automatischer Gewinnstopp bei 75 %; Stream: Jahresrendite-Regel | Anbieter | Schwellen genannt | Buch Kap. 3; Stream Z. 53–55 |
| R29 | Rollen in drei Stufen, immer zuerst Stufe 1: (1) tieferer Basispreis mit Netto-Prämie, (2) gleicher Basispreis, (3) tieferer Basispreis mit mehr Kontrakten; Variante: Rollen gegen kleinen Debit, um Stufe 2/3 zu vermeiden | Anbieter | Reihenfolge genannt | Buch Kap. 3; Stream Z. 55–57 |
| R30 | Kein Stopp bei −100 % / −200 % der Prämie | Anbieter (vom Gastgeber gestützt) | Schwelle genannt (abgelehnt) | Stream Z. 61–65 |
| R31 | 100 % cash-gedeckt, nicht auf Margin; Dienst höchstens 80 % investiert, 20 % Reserve | Anbieter | Schwelle genannt | Buch Kap. 8; Stream Z. 69 |
| R32 | Nach Andienung: asymmetrischer Covered Call — 1 Call am Geld je 200 Aktien, ca. 30 Tage, Calls ebenfalls in drei Stufen rollen; Ausstieg, sobald Gesamttrade bei Gewinn oder minimalem Verlust | Anbieter | Schwellen genannt | Buch Kap. 3 |
| R32b | Quartalszahlen kein Ausschlussgrund; nur bei Aktien mit regelmäßigen Kurssprüngen > 10 % nach Zahlen überlegen | Anbieter | Schwelle genannt | Buch Kap. 7 |

**Ziele der Quelle:** ≥ 95 Gewinner aus 100 Trades, 15–20 % Rendite p. a.; implizite Volatilität „nur untergeordnet“.

**Selbstkritik der Quelle:** Wheel scheitert in Märkten ohne Erholung (Z. 25–27); Rollen mit Netto-Prämie „kann sich ändern, wenn die Märkte schwieriger werden“ (Z. 57); Puts am Geld erhöhen die Rollhäufigkeit (Z. 95); Buch: Stufe 3 widerspricht bewusst der Regel, Verlustpositionen nicht aufzustocken.

**Notizen ohne Regelcharakter:** Dienst-Performance ca. 14,7 % p. a. seit Mai 2020 und Trefferquote 97–99 % (nicht prüfbar; ein Trade wird gerollt, bis er mit Gewinn oder minimalem Verlust endet — die Quote entsteht also vor allem durch das Rollen); Mindestkapital 25.000 €; Dollar-Cash mit Collar gegen Währungsrisiko (Strafzins-Kontext 2021, überholt); ETFs selten wegen Prämien unter 10 % p. a.

#### H-FIN-8 — Rollen gegen Andienung und Stopp

- **Kern:** Die Trefferquote eines Roll-Systems zählt nicht realisierte Buchverluste nicht mit. Gemessen wird deshalb ausschließlich zum Tageskurs (mark-to-market) auf Depotebene.
- Operationalisierung: identische Einstiege (R24–R27). Management (a) Rollen nach R29 mit Prüfung 5 Tage vor Verfall und R32 nach Andienung, (b) Andienung zulassen + Covered Calls (Wheel), (c) Stopp bei −200 % der Prämie, (d) Halten bis Verfall ohne Eingriff. Kontrakterhöhung in (a) als eigene Variante (a′), weil sie das Risiko erhöht.
- Messgrößen: Ertrag je gebundenes Kapital, maximaler Verlust vom Hoch zum Tageskurs, Dauer bis zur Erholung, größte Einzelposition in % des Depots, Anzahl Rollvorgänge je Trade.
- **Stressphase Pflicht:** 2022 und März 2020 getrennt auswerten.
- Abbruch: (a) zeigt Out-of-Sample weder geringeren maximalen Verlust zum Tageskurs noch höheren Ertrag je Kapital als (b) und (c) → verwerfen; (a′) wird verworfen, wenn sie die größte Einzelposition über 20 % des Depots treibt (**Annahme**).
- Datenbedarf / vorab prüfen: tägliche Optionskurse (wie H-FIN-7); **sofort möglich** im eigenen Trade-Journal, wenn Rollvorgänge als Kette eines Trades erfasst werden (nicht als getrennte Gewinner).

#### H-FIN-9 — Momentum-Einstieg

- **Günstig, nur Kursdaten:** Ob der Einstiegsfilter hilft, lässt sich vor jedem Optionsbacktest an der Kursentwicklung prüfen.
- Operationalisierung: Einstiegstage mit R25 exakt nach Buch (RSI-14 ≤ 70 und steigend; MACD 12/26/9-Histogramm ≥ 3 Tage steigend oder Kaufsignal ≤ 7 Tage; „steigend“ beim RSI = über 3 Tage — **Annahme**) vs. alle Tage bzw. monatlicher fester Einstieg. Ergebnisgröße: Anteil der Fälle, in denen der Kurs nach 60 Tagen unter einem Basispreis von 5 % unter Einstiegskurs liegt; Verteilung der 60-Tage-Rendite, schlimmstes Perzentil.
- Abbruch: Filter senkt Out-of-Sample den Anteil der Unterschreitungen nicht und verbessert das 5-%-Perzentil der 60-Tage-Rendite nicht → verwerfen.
- Datenbedarf: tägliche Kurse; Universum mit Delisting-Historie.

#### H-FIN-10 — 10-Jahres-Qualitätsfilter

- Operationalisierung: R24 als Point-in-Time-Filter (jeweils die 10 Jahre vor dem Stichtag): Umsatz, Gewinn je Aktie, Dividende und operativer Cashflow mit positivem Trend (Steigung > 0 und höchstens 2 Rückgangsjahre — **Annahme**); Ausschüttungsquote ≤ 60 %, KGV < 20 (außer Tech) als Variante 2.
- Test: mit H-FIN-9 kombinierbar; Ergebnisgröße wie H-FIN-9, später Short-Put-Ertrag.
- Abbruch: kein geringerer Anteil tiefer Rückgänge gegenüber dem ungefilterten Universum.
- Bezug: deckt sich weitgehend mit dem Dividenden-Einstiegsfilter H-DIV-1 → **einmal bauen, mehrfach nutzen**. Survivorship-Risiko besonders hoch: Eine heute nach 10 guten Jahren ausgewählte Watchlist enthält nur Überlebende.

### C. Reihenfolge

1. H-FIN-1a sofort als Shadow-Log starten (Kosten sind vor allem Zeit), nach Lizenzklärung; parallel Shadow-Log für Optionskandidaten (H-FIN-5/6).
2. Datenprüfung: PIT-Fundamentaldaten, Delisting-Historie (gemeinsam mit H-DIV-Universumsfrage); Kosten historischer Optionsdaten.
3. H-FIN-2 (wenige Parameter, Kennzahlen mehrfach nutzbar).
4. H-FIN-1b.
5. H-FIN-7 und H-FIN-8 im eigenen Trade-Journal (sofort möglich; Rollketten als ein Trade erfassen).
6. H-FIN-9 mit reinen Kursdaten, danach H-FIN-10 zusammen mit H-DIV-1.
7. H-FIN-5/6/8 als Backtest nur, wenn sich die Optionsdaten wirtschaftlich rechtfertigen.

### D. Pflicht-Warnhinweise
- Auswahlverzerrung: Die Erfolgsbilanz der Quelle ist ungeprüft; das Format ist zugleich Werbeträger für einen der bewerteten Datenanbieter.
- Plattform-Scores sind keine unabhängigen Zeugen: Sie rechnen mit weitgehend denselben vergangenen Zahlen. Konsens kann deshalb ein Sonderergebnis mehrfach zählen.
- Trefferquoten von Short Puts sind bei niedrigem Delta strukturell hoch; ohne Höhe der Verluste sagen sie nichts über den Erwartungswert. Überlappende historische Trades blähen die „Anzahl Datenpunkte“ auf.
- Survivorship-Bias, Mehrfachtests (Varianten begrenzt auf die oben genannten), geglättete Renditereihen bei Small Caps.

**Übernahmeregel:** Ein Element wandert nur in UIQ-Scores oder -Prompts, wenn es sein Abbruchkriterium Out-of-Sample besteht. Öffentliche Texte formulieren es nur als Prüfhinweis, nie als Handlungsanweisung.
