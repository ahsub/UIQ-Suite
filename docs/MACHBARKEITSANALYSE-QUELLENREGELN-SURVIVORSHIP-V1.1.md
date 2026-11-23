# UIQ — Quellenbasierte Regelwerke & Survivorship-Analyse (Review-Unterlage v1.1)

**Datum:** 23.11.2026
**Status:** Version 1.1 nach externem Review und P0-Code-Audit; Autor Dr. Axel Hildebrand
**Zweck:** Machbarkeitsanalyse zur Ableitung backtestfähiger Regeln aus Praktiker-Interviews und zur Survivorship-Datenlage; Grundlage für die Go/No-Go-Entscheidung im Dezember 2026

> Quellenhinweis: Export aus der Claude-Docs-Fassung vom 23.11.2026 (Rev. 53). Das Balkendiagramm der Survivorship-Lücke ist nicht enthalten; dieselben Zahlen stehen in der Tabelle im Abschnitt „Datengrundlage: Survivorship-Messung“. Verweise wie „§4.3“ oder „Frage 2“ beziehen sich auf das externe Review vom 23.11.2026, das nicht im Repo liegt. Der Auditbericht liegt unter `docs/AUDIT-GO-K2-SURVIVORSHIP-2026-11-23.md`.

## Zweck und Kurzfassung

Dieses Dokument legt einen Untersuchungsansatz zur externen Prüfung vor: Aus Interviews und Podcasts mit Praktikern sollen backtestfähige Handelsregeln abgeleitet und nur bei nachgewiesener Wirksamkeit in das Analysesystem UIQ übernommen werden. Der Ansatz ist in einem Pilot mit drei Transkripten erprobt; parallel wurde die Datengrundlage für spätere Backtests vermessen.

**Version 1.1 (23.11.2026)** arbeitet das externe Review und den P0-Code-Audit zu Go-Kriterium 2 ein. Aussagen sind als *nachgewiesen* (gemessen oder im Code belegt), *plausibel* (begründet, aber nicht getestet) oder *offen* gekennzeichnet. Die Änderungen stehen am Ende im Abschnitt „Änderungen gegenüber Version 1.0“.

**Ergebnisse bis 23.11.2026:**

- **Nachgewiesen:** Die Werkzeugkette (Transkription → Regel-Extraktion → Hypothese) funktioniert; aus drei Transkripten entstanden vier prüfbare Hypothesen zu einer Dividendenstrategie. Das ist ein Machbarkeits-, kein Wirksamkeitsnachweis.
- **Plausibel:** Der wertvollste Fund kam aus dem Abgleich zweier Interviews derselben Person: Eine Ausstiegsregel misst relativ zum Heimatmarkt, nicht absolut.
- **Nachgewiesen:** Ein heutiges US-Aktienuniversum, rückwärts verwendet, verfehlt ab 2012 rund **47,6 %** der damals gelisteten Titel; bei S&P-500-Mitgliedern mindestens 26,5 % (untere Schätzung, da die Indexdatei unvollständig ist; bis 33 % plausibel, nicht nachgewiesen), also rund 2 % pro Jahr. Das ist die Listing-Lücke; wie stark sie Renditen verzerrt, ist **offen**.
- **Nachgewiesen (Audit 23.11.2026):** Die Backtests zu Go-Kriterium 2 arbeiten auf Indexebene und sind von Survivorship nicht betroffen; eine Neuberechnung vor Dezember ist nicht nötig.
- **Plausibel:** Einzeltitel-Backtests aus dem heutigen Universum sind ohne einen Datenbestand mit delisteten Titeln und Delisting-Renditen nicht belastbar.
- **Offen:** Ob validierte Regeln die Entscheidungsqualität von UIQ verbessern, ist noch nicht untersucht.

Das Review trennt drei Bewertungsebenen, die nicht miteinander verwechselt werden dürfen:

| Ebene | Frage | Stand 23.11.2026 |
|---|---|---|
| 1. Technische Machbarkeit | Funktioniert die Quellenextraktion reproduzierbar? | nachgewiesen für einen Pilot (3 Transkripte, 1 Person); Reproduzierbarkeit (zwei unabhängige Läufe, mindestens fünf unterschiedliche Gesprächspartner und Anlagestile) offen |
| 2. Methodische Validität | Sind Hypothesen, Daten, Tests und Benchmarks belastbar? | Methodik nach Review festgelegt; Datenbasis für Einzeltitel fehlt; Go-K2-Backtests geprüft |
| 3. Wirtschaftlicher Nutzen | Verbessern validierte Regeln die Entscheidungsqualität von UIQ? | offen, keine Ergebnisse |

Die Fragen an den Review stehen im vorletzten Abschnitt, die Änderungen gegenüber Version 1.0 im letzten.

## Kontext

UIQ (UnderlyingIQ) ist ein privat entwickeltes, nicht kommerzielles Analysesystem für Aktien und Optionen mit Marktregime-Erkennung, 14 Strategie-Scores und KI-gestützten Auswertungen. Das Universum umfasst rund 735 Titel, überwiegend US- und deutsche Large Caps.

- **Leitlinie seit 24.09.2026:** mehr Beweisbarkeit statt neuer Features.
- **Go/No-Go-Entscheidung im Dezember 2026**. Go-Kriterium 2 (Fassung 4.33) definiert den Vorsprung formal: täglicher Überschuss gegenüber Buy & Hold, Newey-West-Standardfehler mit 5 Lags, einseitig 5 %, Lag 1 mit 5 bp Kosten, zusätzlich positiver Mittelwert bei Lag 2 und 20 bp. Status seit 26.09.2026: nicht bestanden.
- **Vorgeschichte:** Ein früherer Regime-Gate-Backtest zeigte nach Korrektur eines Look-ahead-Fehlers keinen Vorsprung. Methodische Sauberkeit hat daher Vorrang vor Geschwindigkeit.

Grundsatz: Der Ansatz ist ein unabhängiger Forschungsprozess und kein neues UIQ-Feature. Ergebnisse fließen erst nach erfolgreicher Validierung und nur in bestehende Scores ein.

## Untersuchungsansatz

Praktiker-Interviews dienen als **Hypothesenquelle, nicht als Beleg**. Jede Regel durchläuft dieselbe Kette und wird nur übernommen, wenn sie ihr vorab festgelegtes Abbruchkriterium besteht.

1. **Quelle:** Transkript eines Interviews oder Podcasts.
2. **Regel-Extraktion:** Jede Regel mit kurzem wörtlichem Beleg, Urheber (Gast oder Moderator), Konkretheitsgrad (Schwelle genannt / qualitativ / Anekdote) und den Fehlschlägen, die die Quelle selbst nennt. Zwei getrennte Extraktionsläufe, die einander nicht sehen (getrennte Sitzungen oder verschiedene Modelle), werden abgeglichen; die Übereinstimmungsquote wird gemessen, dazu eine eigene Stichprobe. Jede Aussage erhält eine Quellenreferenz mit Zeitstempel. Widersprüchliche Aussagen derselben Person werden dokumentiert, echte Handelsregeln von nachträglichen Begründungen getroffener Entscheidungen getrennt und die Übertragbarkeit auf UIQ bewertet.
3. **Operationalisierung:** Übersetzung in messbare Bedingungen. Fehlende Schwellen werden konservativ gesetzt und als „Annahme“ markiert.
4. **Vorab-Festlegung:** Parameter vor dem Lauf fixiert, höchstens zwei Varianten je Parameter. Eine kleine, vorab benannte Familie von Haupttests wird mit Holm korrigiert, die explorative Suche mit Benjamini-Hochberg; dazu die Wahrscheinlichkeit der Überanpassung (PBO nach Bailey et al.). Berichtet werden Effektgröße und Konfidenzintervall, nicht nur Signifikanz.
5. **Backtest:** Walk-Forward plus ein unberührter Holdout statt einer festen Grenze 2018/2019. Für alles Regimebezogene ist 2011–2026 bereits „gesehen“ (regime_v2 wurde darauf validiert); ein echter Holdout liegt daher vor 2011 oder in der Zukunft (Paper-Trading ab Dezember 2026). Pauschale Transaktionskosten, Total Return mit reinvestierten Dividenden, Delisting-Renditen für ausgeschiedene Titel, Benchmarks doppelt (breiter Index und stilgleicher Vergleich), Auswertung je Marktregime.
6. **Übernahme:** Gate-System: Hypothese → empirisch geprüft → unabhängig bestätigt → Integrationstest. Erst danach fließt eine Regel ein, und zwar nur als Verbesserung bestehender Scores, nicht als neue Strategie.

**Qualitätsmaße der Extraktion:** Bevor Regeln getestet werden, wird die Pipeline an mindestens fünf unabhängigen Gesprächspartnern mit unterschiedlichen Anlagestilen erprobt. Gemessen wird je Quelle der Anteil der Regeln (1) mit eindeutigem Originalbeleg, (2) ohne zusätzliche Annahmen operationalisierbar, (3) mit gleicher Operationalisierung durch zwei Prüfer und (4) mangels Daten nicht testbar.

**Erfolgsmaßstab:** Ein „signifikanter Vorsprung“ verlangt mehr als Rendite: risikoadjustierte Rendite und Sharpe Ratio, maximaler Drawdown, Umschlag und Transaktionskosten, Stabilität über Marktregime, statistische Unsicherheit (Effektgröße, Konfidenzintervall) und der inkrementelle Nutzen gegenüber der bestehenden UIQ-Strategie. Ein signifikanter, aber kleiner Vorteil (etwa 0,3 Prozentpunkte p. a.) kann wirtschaftlich bedeutungslos sein.

**Quellenhierarchie:**

1. Bereits nachgeprüfte Effekte aus der Forschung (z. B. offene Replikationsdaten zu Renditeprädiktoren).
2. Schriftlich veröffentlichte Regelwerke von Praktikern.
3. Interviews für das, was dort fehlt: Ausnahmen, Marktphasen, Fehlschläge. Eigene Annahmen nur ausdrücklich gekennzeichnet.

**Negativfilter:** Eine Regel, die nur durch eine überzeugende Geschichte plausibel wirkt, aber keine objektiv messbare Operationalisierung erlaubt, bleibt außerhalb des Backtest-Prozesses.

**Pflicht-Warnhinweise je Auswertung:** Auswahlverzerrung (interviewt werden Erfolgreiche), Survivorship-Bias, Mehrfachtests und Überanpassung, geglättete Renditereihen. Veröffentlichte Effekte werden nach Bekanntwerden erfahrungsgemäß schwächer; erwartete Vorteile werden deshalb konservativ angesetzt.

**Auswahlkriterien für Sprecher:** nachprüfbare Erfolgsbilanz (Publikumsfonds, geprüfte Zahlen), regelbasierte Vorgehensweise, Regeln zusätzlich schriftlich veröffentlicht, offener Umgang mit Verlustphasen, kein Hauptgeschäft mit Kursverkäufen, langes Gesprächsformat, Passung zu einer bestehenden UIQ-Strategie. Ein Teil der Quellen soll ausdrücklich gescheiterte oder aufgegebene Strategien behandeln, um die Auswahl Erfolgreicher auszugleichen. Zusätzlich: unterschiedliche Investmentstile, dokumentierte Interessenkonflikte und wirtschaftliche Anreize, möglichst unabhängig überprüfbare Erfolgsbilanz, Trennung nachträglicher Erfolgserzählungen von zeitgenössisch dokumentierten Regeln. „Kein Hauptgeschäft mit Kursverkäufen“ ist ein Warnsignal, kein automatischer Ausschlussgrund.

## Werkzeugkette

Die Transkription läuft lokal, die Auswertung strukturiert per KI-Skill mit fester Vorlage.

| Schritt | Werkzeug | Anmerkung |
|---|---|---|
| Quelle beschaffen | YouTube-Link oder Podcast-MP3 direkt; sonst Aufzeichnung des Systemtons | keine beschleunigte Wiedergabe, da sie die Erkennung verschlechtert |
| Transkription | MacWhisper Pro auf Apple Silicon (Parakeet v3 bzw. Whisper large-v3), Sprache fest, Sprechererkennung an | Audio verlässt den Rechner nicht |
| Auswertung | KI-Skill „audio-protokoll“, Vorlage „Regelwerk-Extraktion“ (7 Schritte) | Ausgabe: Regeltabelle, Hypothesenblöcke, Prüfliste |
| Qualitätskontrolle | Liste „Bitte prüfen“ je Transkript | Transkriptionsfehler, unsichere Sprecherzuordnung, ungeprüfte Zahlen |

Im Pilot zeigten sich typische Fehler der Spracherkennung: falsch erkannte Eigen- und Firmennamen, vertauschte Sprecherwechsel und eine halluzinierte englische Zeile in einem deutschen Gespräch. Sachangaben der Gesprächspartner werden nicht ungeprüft übernommen.

## Pilot: Quellen und extrahierte Regeln

Der Pilot nutzte drei Transkripte mit demselben Gesprächspartner, einem Finanzjournalisten und Dividendeninvestor. Die Auswahl war bewusst ein Machbarkeitstest, nicht qualitätsoptimiert: Die Erfolgsbilanz der Quelle ist ungeprüft.

| Quelle | Format | Aufnahmedatum | Ertrag |
|---|---|---|---|
| Interview (YouTube) | Einzelinterview, ca. 60 min | Nov. 2026 | Kernregeln R1–R10 |
| Interview (EchtgeldTV) | Einzelinterview mit Moderator | ca. Mai 2025 | Präzisierung von R4 und R6 am Fallbeispiel |
| Podcast (täglich) | Nachrichtenformat | 01.06.2026 | keine neuen Regeln; Hinweise zu Benchmark und Ereignistypen |

**Extrahierte Regeln:**

| ID | Regel | Konkretheit |
|---|---|---|
| R1 | Einstieg: Dividendenwachstum ca. 5 % p. a. über viele Jahre, keine Kürzung in 3 Jahren, moderate Ausschüttungsquote, moderate Verschuldung, moderates KGV | Schwellen teilweise genannt |
| R2 | Mindestens 10 Jahre Datenhistorie | eindeutig |
| R3 | Ausreichende Handelbarkeit für Anleger in Deutschland | qualitativ |
| R4 | Ausstieg: junge Position fällt im steigenden Markt um 20–25 % → Prüfung, häufig Verkauf; kein Nachkaufen | gut; „jung“ ohne Zahl |
| R5 | Keine Trailing Stops (Ausstieg bei normalen Korrekturen) | Erfahrungswert |
| R6 | Keine Turnaround-Wetten auf Einzelabstürze; Marktabschläge dagegen zulässig | qualitativ |
| R7 | Anteil zyklischer Werte begrenzen | ohne Zahl |
| R8 | Dividendenrendite gegen Staatsanleihen-Rendite abwägen | gut operationalisierbar |
| R9 | Hohe Quellensteuer als Hemmnis | eindeutig |
| R10 | Aufbauphase eher Wachstum, später Cashflow | Grundsatz |

**Präzisierung aus Quelle 2:** Ein Titel lag rund 20 % unter seinem Hoch, wurde aber nicht verkauft. Der Heimatmarkt fiel im selben Zeitraum ebenfalls um rund 20 %, und die Position war über 20 Jahre alt. R4 misst also relativ zum Heimatmarkt und gilt nur für junge Positionen. R6 unterscheidet Einzelabstürze von länder- oder marktweiten Abschlägen.

**Selbstkritik der Quelle:** Ihr eigenes Screening nach R1 brachte nach eigener Aussage „von zehn Top-Aktien nur drei“ Treffer.

## Abgeleitete Hypothesen

Aus den Regeln entstanden vier Hypothesen mit vorab definiertem Test und Abbruchkriterium. Schwellen ohne Quellenangabe sind als Annahme gekennzeichnet.

| ID | Hypothese | Operationalisierung | Test | Abbruch | Daten |
|---|---|---|---|---|---|
| H-DIV-1 | Einstiegsfilter Dividendenqualität (R1, R2, R3) | Dividendenwachstum 5 J. ≥ 5 % p. a.; keine Kürzung in 36 Mon.; Historie ≥ 10 J.; Ausschüttungsquote ≤ 70 % (Annahme); Nettoverschuldung/EBITDA ≤ 3 (Annahme); Dividenden um Splits und Sonderdividenden bereinigt; alle Kennzahlen zum damaligen Veröffentlichungszeitpunkt, nicht aus heute korrigierten Daten | gleichgewichtetes Portfolio, jährlich neu, gegen gleichgewichtetes Universum und Benchmarks, alles als Total Return | kein signifikanter Vorsprung Out-of-Sample nach Kosten | Point-in-Time-Fundamentaldaten, Universum mit delisteten Titeln |
| H-DIV-2 | Ausstieg nach R4 | Haltedauer ≤ 24 Mon. (Variante 12); Relativrendite seit Einstieg (1 + R Titel) / (1 + R Heimatindex) − 1 ≤ −20 % (Variante −25 %) → Ausstieg | auf H-DIV-1-Einstiegen: Halten vs. R4 vs. Trailing Stop −33 % vs. absoluter Stop −25 %; zusätzlich Fehlausstiege mit anschließender Erholung und entgangene Rendite nach Ausstieg | R4 weder bei Rendite noch bei Drawdown/Totalverlust-Anteil besser als Halten | Heimatindex je Titel |
| H-DIV-3 | Ausschluss Einzelabsturz nach R6 | Titel ≥ 40 % unter 52-W-Hoch und Heimatindex ≤ 10 % unter seinem Hoch | H-DIV-1 mit und ohne Filter; Schwelle 40 % fest, keine nachträgliche Schwellensuche; geprüft wird, ob der Filter Dividendenkürzungen vorhersagt oder nur bekannte Kursverluste erkennt, und ob er die Qualität des verbleibenden Universums verbessert | kein Unterschied bei Kürzungsquote und Drawdown | wie H-DIV-2 |
| H-DIV-4 | Kontextfeld nach R8 | Dividendenrendite des Stils minus Rendite 5-/10-jähriger Staatsanleihen | Stufe 1: Sagt die Differenz die relative 12-Monats-Rendite des Dividendenstils voraus? Stufe 2: Liefert sie einen Zusatzbeitrag gegenüber bekannten Markt-, Bewertungs- und Zinsfaktoren? | keine stabile Vorhersagekraft Out-of-Sample | Stilportfolios nach Dividendenrendite (Ken French Data Library), Zinsreihen |

**Reihenfolge:** H-DIV-4 zuerst. Sie hängt am wenigsten von einer einzelnen Quelle ab und lässt sich mit kostenlosen Forschungsdaten prüfen. H-DIV-1 bis H-DIV-3 folgen erst nach Klärung der Datenbasis. Abbruchkriterien stützen sich nicht allein auf die Gesamtrendite; eine Regel kann den Drawdown senken, ohne die Rendite zu verbessern.

**Messgrößen** je nach Hypothese: Rendite p. a., maximaler Drawdown, Sharpe Ratio, Anteil späterer Dividendenkürzer, Anteil Positionen mit Endstand ≤ −60 %, Fehlausstiege, Umschlag; jeweils nach Marktregime getrennt.

**Notizen ohne Testauftrag:**

- Bewertung gegen die eigene 10-Jahres-KGV-Spanne als Input für eine spätere Fair-Value-Kalibrierung.
- Revisionen der Gewinnschätzungen: in den Quellen widersprüchlich gedeutet; testbar erst mit Point-in-Time-Schätzdaten.
- Saisonale Sommerschwäche bei Rückversicherern: anekdotisch, niedrige Priorität.

**Benchmarkregel für Stilstrategien:** immer doppelt vergleichen, breiter Index und stilgleicher Vergleich, jeweils als Total Return mit reinvestierten Dividenden. Dazu ein Kontrollportfolio: gleichgewichtet, dasselbe historische Universum, gleiche Rebalancing-Termine und Transaktionskosten, keine Qualitätsfilter. So zeigt sich, ob ein Vorteil aus dem Filter oder nur aus der Portfoliozusammensetzung stammt. Begründung aus Quelle 3: Ein nach Börsenwert gewichteter Weltindex besteht zu rund drei Vierteln aus US-Aktien bei rund 1,5 % Dividendenrendite; ein Dividendenstil weicht strukturell ab.

**Ergänzung Ereignis-Prüfschicht:** Termine von Indexumstellungen (MSCI-Reviews, DAX Fast Entry/Exit), US-ISM-Index und US-Arbeitsmarktbericht als regelbasierte Ereignistypen im Beobachtungsmodus.

## Datengrundlage: Survivorship-Messung

Wer Backtests mit einer heutigen Tickerliste rückwärts rechnet, verliert ab 2012 rund **47,6 %** des US-Markts und **26,5 %** der damaligen S&P-500-Mitglieder; die Ausfallrate bei Large Caps liegt stabil bei rund **2 % pro Jahr**.

**Methode:** Ein eigenes Skript (`survivorship_gap.py`, Python-Standardbibliothek) vergleicht für vier Stichtage die damals gelisteten US-Aktien mit den heute gelisteten. Quelle ist die Alpha-Vantage-Funktion LISTING_STATUS (Listings zum Stichtag plus Delisted-Liste mit Datum). Kategorien: überlebt, delistet, Symbol neu an ein anderes Unternehmen vergeben (Börsengang nach dem Stichtag), ungeklärt. Gesamtmarkt mit Stammaktien-Heuristik und SPAC-Namensfilter; Large Caps über eine öffentlich rekonstruierte Historie der S&P-500-Zusammensetzung.

| Stichtag | Gesamtmarkt: damals gelistet | heute noch gelistet | Ausfallrate p. a. | S&P 500: Mitglieder laut Datei | heute noch gelistet | Ausfallrate p. a. | heute nicht mehr im Index |
|---|---|---|---|---|---|---|---|
| 04.01.2021 | 5.455 | 3.864 | 5,7 % | 501 | 442 | 2,1 % | 17,0 % |
| 02.01.2018 | 5.162 | 3.129 | 5,5 % | 491 | 406 | 2,1 % | 25,3 % |
| 02.01.2015 | 4.916 | 2.619 | 5,2 % | 464 | 357 | 2,2 % | 31,9 % |
| 03.01.2012 | 4.255 | 2.230 | 4,2 % | 453 | 333 | 2,0 % | 35,5 % |

**Weitere Befunde:**

- Ein Abgleich nur über das Symbol hätte 98–159 Titel je Stichtag fälschlich als überlebt gezählt (Symbol neu vergeben).
- Der SPAC-Filter schloss bis zu 130 Börsenmäntel aus (Stichtag 2021) und senkte die Ausfallrate nur von 6,0 % auf 5,7 % p. a.; der Anstieg zu späteren Stichtagen ist überwiegend kein SPAC-Effekt.
- Die Lücke wächst mit sinkender Größe: Stichtag 2021 NYSE 23 %, NASDAQ 34 %, NYSE MKT 76 %.

**Grenzen der Messung:**

- Nur USA; Delisting-Gründe (Übernahme vs. Insolvenz) nicht unterscheidbar. Die Zahl misst die Listing-Lücke, nicht die Renditeverzerrung. Auch ein Universum mit delisteten Titeln bleibt verzerrt, wenn ausgeschiedene Titel am letzten Kurs verschwinden; Endwerte nach Insolvenz und Übernahmeerlöse (Delisting-Renditen, Shumway 1997) sind deshalb Pflicht.
- Die rekonstruierte Indexdatei enthält für 2012 und 2015 nur 453 bzw. 464 statt rund 500 Mitglieder. Fehlend sind vermutlich v. a. später ausgeschiedene Titel; die Large-Cap-Lücke 2012 liegt daher eher bei 26–33 %. 26,5 % ist eine untere Schätzung; vor Verwendung in Backtests sind die fehlenden Mitglieder zu ergänzen.
- „Ungeklärt“ (22–33 Large Caps je Stichtag) enthält vermutlich auch reine Tickerwechsel überlebender Unternehmen.

**Folgerung:** Backtests auf Index- und Marktebene (Regime-Erkennung, Volatilitäts-Gates, Trendfilter, H-DIV-4) sind nicht betroffen. Backtests, die Einzeltitel aus dem heutigen Universum auswählen oder rangieren (H-DIV-1 bis H-DIV-3, Fair-Value-Backtest), brauchen ein Universum mit delisteten Titeln und Delisting-Renditen. Die bestehenden Backtests zu Go-Kriterium 2 sind geprüft und nicht betroffen (nächster Abschnitt).

**Vor Verwendung in einem Backtest zu erweitern** (Review): Die Stichtagsmethode zeigt die Größenordnung, beweist aber keinen Backtest-Bias.

- Unternehmensidentität über stabile IDs statt Ticker und Name, mit Tickerwechseln, Übernahmen, Fusionen, Spin-offs, Börsenwechseln und Aktiengattungen.
- Feste Regeln für Insolvenz, Liquidation, Barübernahme, Aktientausch, freiwilligen Börsenrückzug und Wechsel in den OTC-Handel.
- Trennung von „nicht mehr gelistet“, „nicht mehr selbstständig notiert“ und „insolvenzbedingter Totalverlust“.
- Rekonstruktion der tatsächlichen historischen Anlageuniversen, nicht nur der damaligen Börsenlistings.

## Prüfung der Go-Kriterium-2-Backtests (P0-Audit)

Go-Kriterium 2 ist von Survivorship nicht betroffen (*nachgewiesen*, Code-Audit 23.11.2026, rein lesend). Der einzige gültige Go-2-Backtest arbeitet mit einer Indexreihe; einen Einzeltitel-Ranking-Backtest gibt es in keinem Repository.

**Entscheidungsregel** (vor dem Audit festgelegt):

- Backtest nicht betroffen: Das bisherige Ergebnis bleibt hinsichtlich Survivorship verwendbar.
- Backtest betroffen, Sharadar-Testmonat ausreichend: korrigierte Neuberechnung.
- Backtest betroffen, Datenbasis nicht rechtzeitig verfügbar: Go/No-Go mit ausdrücklichem Vorbehalt oder Verschiebung.

| Backtest | Universum | Survivorship / Look-ahead | Neuberechnung | Einstufung |
|---|---|---|---|---|
| Regime-Gate-Backtest v2.2 (maßgeblich für Go-K2) | S&P-500-Preisindex plus VIX/VIX3M, 2011–2026 | Survivorship ausgeschlossen; Signal t → Position t+1, Perturbationstest bestanden; Herkunft der festen Schwellen undokumentiert | nein | unbetroffen; Look-ahead-Rest eingeschränkt |
| Testfamilie №34 (DSR-, ökonomischer, Trennschärfe-Test) | Indexreihen | Survivorship ausgeschlossen | nein | unbetroffen |
| Ursprünglicher Backtest Aug. 2026 | Indexebene | Look-ahead-Fehler, seit 26.09.2026 ungültig | nein | überholt, nicht geprüft |
| Track Record hit30 (Go-K5) | Einzeltitel, prospektiv aufgezeichnet | Austritte ohne Kurs fallen als „noData“ aus der Statistik | nein; noData-Anteil vor Dezember sichten | eingeschränkt |

Folge: keine Neuberechnung und keine vorgezogene Datenlizenz vor Dezember. Go-Kriterium 2 bleibt *nicht bestanden*; eine Verzerrung zugunsten der Strategie könnte das nur bestätigen. „Nicht betroffen“ gilt nur für das Survivorship-Problem des Einzeltiteluniversums; Look-ahead, fehlerhafte Indexdaten und revidierte Makrodaten sind gesondert zu bewerten. Den vollständigen Bericht mit Fundstellen enthält `UIQ-Suite/docs/AUDIT-GO-K2-SURVIVORSHIP-2026-11-23.md`.

## Datenquellen und Stufenplan

Geplant ist ein dreistufiger Ausbau: zuerst kostenlose Quellen, nach der Go/No-Go-Entscheidung ein Datenbestand mit delisteten Titeln für rund 300–400 USD pro Jahr. Preise sind Herstellerangaben, Stand November 2026.

| Quelle | Delistete Titel | Point-in-Time-Fundamentaldaten | Märkte | Kosten | Rolle |
|---|---|---|---|---|---|
| Ken French Data Library | implizit (CRSP-Basis) | – (fertige Portfolios) | USA | kostenlos | Stufe 0: Stil-Benchmark, H-DIV-4 |
| Open Source Asset Pricing (Chen/Zimmermann) | implizit | – (Faktorrenditen) | USA | kostenlos | Stufe 0: Abgleich der UIQ-Faktoren mit nachgeprüften Effekten |
| Alpha Vantage LISTING_STATUS | nur Liste | – | USA | vorhandener Zugang | Stufe 0: Messung der Lücke (erledigt) |
| Valuein | ja | ja (Herstellerangabe) | USA | S&P 500 kostenlos, Gesamtmarkt 200 USD/Monat | Stufe 1, Datenqualität ungeprüft |
| Sharadar (Nasdaq Data Link) | ja | ja, über Datumsfeld | USA | Kurse 299–399 USD/Jahr, Fundamentaldaten extra | Stufe 1, bevorzugt; erst ein Testmonat (39 USD) |
| EODHD | ja, auch Xetra | unklar | weltweit | Kurse 199 USD/Jahr, Fundamentaldaten 59,99 USD/Monat | Stufe 1, Alternative für Europa |
| Norgate Platinum | ja, ab 1990 | nur aktuelle Werte | USA, AU, CA | 630 USD/Jahr | Stufe 2: historische Indexzusammensetzung |
| QuantConnect | ja, ab 1998 | ja, mit Einschränkung (vor 2013 ohne Veröffentlichungsdatum) | USA | Plattform | Alternative, aber eigene Backtest-Umgebung |

Für Deutschland und Europa ist die Datenlage dünn; Hypothesen sollen zuerst auf US-Daten getestet und Europa danach als Robustheitsprüfung genutzt werden. Lizenzfragen sind bewusst ausgeklammert, solange UIQ ein nicht kommerzielles Forschungsprojekt ist.

**Abnahmetest für Datenanbieter** (vor jeder Lizenz, z. B. im Testmonat): 10 bis 20 bekannte Fälle werden abgefragt: Insolvenzen (Enron, Lehman Brothers, Washington Mutual), Übernahmen (Bear Stearns, Twitter), die Abwicklung von SVB Financial sowie mehrere Tickerwechsel, Dividendenkürzungen und S&P-Auf- und Abstiege. Je Fall wird geprüft: Ist der Titel enthalten, stimmt die letzte Handelssitzung, sind Corporate Actions nachvollziehbar, stimmt die terminale Wertentwicklung, sind Fundamentaldaten tatsächlich Point-in-Time, ist der Datenstand reproduzierbar? Die Fälle sind keine abschließende Stichprobe, sondern decken offensichtliche Schwächen auf. Bestanden ist der Test nur, wenn der Anbieter diese Titel führt und Endwerte bzw. Übernahmeerlöse liefert. Fehlen die Endwerte, braucht es eine eigene, vorab festgelegte Regel.

**Anbieter-Rangfolge nach Review:**

1. Sharadar als mögliche zentrale Datenbasis. Die Angabe von rund 99 % survivorship-freier Fundamentaldaten-Abdeckung ist eine Herstellerangabe und ungeprüft.
2. Norgate als Ergänzung für historische Indexmitgliedschaften und Kursvalidierung.
3. EODHD als günstige Alternative, aber nur mit eigener Datenprüfung: Die Historie ist nicht versioniert (Korrekturen überschreiben frühere Werte), Delisting-Reihen können unvollständig sein.

Kostenangaben gelten erst mit verbindlichem Angebot; kein Jahresvertrag auf Basis einer Anbieterbeschreibung. Europa bleibt zurückgestellt, bis klar ist, welche europäischen UIQ-Strategien ein historisches Universum brauchen. LSEG Datastream wäre eine Forschungsreferenz, ist für das Budget aber unverhältnismäßig.

## Bekannte Schwächen und offene Punkte

Die bisher größte offene Frage ist geklärt: Die Backtests zu Go-Kriterium 2 haben kein heutiges Einzeltitel-Universum rückwärts verwendet. Offen bleiben die unten genannten Punkte.

- **Quellenauswahl im Pilot:** drei Transkripte derselben Person, Erfolgsbilanz ungeprüft; ein Nachrichtenpodcast ohne Regelgehalt.
- **Fehlende Schwellen:** Ausschüttungsquote, Verschuldung und „junge Position“ sind gesetzte Annahmen, nicht Quellenangaben.
- **Menschliches Ermessen:** Die Prüfung des Investment Case in R4 ist nicht simulierbar; der Backtest bildet die Obergrenze „immer verkaufen“ ab.
- **Universum:** UIQ enthält nur heute existierende Titel; ein Universum mit delisteten Titeln und Delisting-Renditen ist noch nicht beschafft.
- **Indexhistorie:** öffentlich rekonstruiert, für ältere Jahre unvollständig.
- **Mehrfachtests:** Mit wachsender Zahl an Quellen steigt das Risiko zufälliger Treffer. Gegenmittel: Obergrenze von drei offenen Hypothesen je UIQ-Strategie, Holm/Benjamini-Hochberg, PBO, Walk-Forward und unberührter Holdout.
- **Europa:** kaum kostengünstige Daten mit delisteten Titeln; Ergebnisse gelten zunächst nur für US-Werte.
- **Regime-Schwellen:** Die festen Schwellen des Regime-Klassifikators (0,98 / 1,05 / VIX 25) haben keine dokumentierte Herkunft; möglich ist eine Wahl im Testzeitraum.
- **Track Record:** Für Titel ohne Kurs bei Fälligkeit fehlt eine Endbewertungsregel; vor externer Nutzung als Beleg lösen.
- **Nicht geprüfte Repositories:** zwei weitere Repositories mit früheren Backtests; zu klären, ob dort Go-relevante Auswertungen liegen.
- **Unabhängigkeit des Reviews:** Stammt es von einem KI-Modell, ist es eine Plausibilitätsprüfung, kein unabhängiger Fachbeleg; für Mehrfachtests und Stichprobentrennung lohnt ein menschlicher Quant-Praktiker.

**Nächste Schritte:**

1. **P0, vor der Dezemberentscheidung:** ~~Go-Kriterium-2-Backtests inventarisieren, Universumsbildung im Code prüfen, Survivorship und Look-ahead getrennt dokumentieren~~ (erledigt 23.11.2026: nicht betroffen, keine Neuberechnung). Offen: noData-Anteil im Track Record sichten (nur lesen).
2. **P1, kostenlose Forschungsphase:** H-DIV-4 mit Ken-French-Daten testen (Total Return, zweistufig); UIQ-Faktoren mit Open Source Asset Pricing vergleichen; Extraktionspipeline an fünf unabhängigen Quellen validieren; Testprotokoll und Mehrfachtestfamilie verbindlich festlegen.
3. **P2, nach Go/No-Go:** Sharadar-Testmonat; Abnahmetest mit Delisting-Fällen; Point-in-Time-Prüfung der Fundamentaldaten; erst danach H-DIV-1 bis H-DIV-3 mit Delisting-Renditen.
4. **P3, langfristig:** Out-of-Sample-Bestätigung, Robustheit gegenüber Kosten und Marktregimen, Vergleich mit bestehenden UIQ-Scores; Integration nur bei nachgewiesenem Zusatznutzen.

## Fragen an den Review

Die acht Fragen hat das Review vom 23.11.2026 beantwortet; die übernommenen Antworten sind in die Abschnitte eingearbeitet (Übersicht unten). Die Fragen bleiben zur Nachvollziehbarkeit im Wortlaut von Version 1.0 stehen.

1. **Grundansatz:** Ist es methodisch sinnvoll, Praktiker-Interviews als Hypothesenquelle zu nutzen, oder sollte der Schwerpunkt ganz auf veröffentlichte Forschung und schriftliche Regelwerke verlagert werden?
2. **Mehrfachtests:** Reichen Vorab-Festlegung, höchstens zwei Varianten je Parameter, korrigierte Signifikanzschwelle und Out-of-Sample-Bestätigung? Welche Korrektur wäre angemessen?
3. **Stichprobentrennung:** Ist die Grenze 2018/2019 geeignet, oder wäre ein rollierendes Verfahren (Walk-Forward) vorzuziehen?
4. **Survivorship-Messung:** Ist die Methode (Stichtags-Listings gegen heutige Listings, Erkennung neu vergebener Symbole) tragfähig, und sind die Grenzen vollständig benannt?
5. **Benchmarks:** Ist der doppelte Vergleich (breiter Index und stilgleicher Vergleich) für Go-Kriterium 2 angemessen?
6. **Datenquellen:** Ist der Stufenplan sinnvoll, und gibt es kostengünstige Quellen mit delisteten Titeln für Deutschland und Europa, die fehlen?
7. **Priorität:** Sollte die Prüfung bestehender Go-Kriterium-2-Backtests auf Survivorship-Bias vor allem anderen stehen?
8. **Sprecherauswahl:** Sind die Auswahlkriterien (nachprüfbare Erfolgsbilanz, regelbasiert, schriftlich veröffentlicht, kein Kursverkauf) vollständig?

## Änderungen gegenüber Version 1.0

| Punkt | Herkunft im Review | Änderung | Abschnitt |
|---|---|---|---|
| Drei Nachweisstufen (Extraktion, Validierung, Nutzen), Kennzeichnung nachgewiesen / plausibel / offen | §2, Vorbemerkung | Ebenen-Tabelle, gekennzeichnete Ergebnisse | Zweck und Kurzfassung |
| S&P-500-Lücke 26,5 % nur untere Schätzung | §4.3 C | Kurzfassung und Grenzen präzisiert | Kurzfassung, Survivorship-Messung |
| Kein Feature, unabhängiger Forschungsprozess | §9, Schlussfolgerungen 4–5 | als Grundsatz formuliert | Kontext |
| Formale Definition von Go-Kriterium 2 und Erfolgsmaßstab | §8 | Testdefinition, Status, mehrdimensionaler Erfolgsmaßstab | Kontext, Untersuchungsansatz |
| Zweiter Prüfer, Zeitstempel, Widersprüche, Regel vs. Begründung, Übertragbarkeit | §3.1 | Extraktionsschritt erweitert; zweiter Prüfer als zwei getrennte Läufe umgesetzt | Untersuchungsansatz |
| Mindestens fünf unabhängige Quellen, vier Qualitätsmaße | §3.1 | neu | Untersuchungsansatz |
| Quellenhierarchie mit gekennzeichneten Annahmen, Negativfilter | Frage 1 | ergänzt | Untersuchungsansatz |
| Mehrfachtests: Holm, Benjamini-Hochberg, PBO, Effektgrößen | Frage 2 | Vorab-Festlegung erweitert | Untersuchungsansatz |
| Walk-Forward plus unberührter Holdout | Frage 3 | feste Grenze ersetzt; ergänzt: 2011–2026 regimebezogen bereits gesehen | Untersuchungsansatz |
| Gate-System | §2 | Übernahme-Schritt ersetzt | Untersuchungsansatz |
| Sprecherauswahl: gescheiterte Strategien, Stilvielfalt, Interessenkonflikte, zeitgenössische Regeln | Frage 8 | Auswahlkriterien erweitert | Untersuchungsansatz |
| H-DIV-1 bis H-DIV-4 präzisiert; H-DIV-4 zuerst | §3.2 | Bereinigung, Fehlausstiege, feste Schwelle, zweistufiger Test, Reihenfolge | Abgeleitete Hypothesen |
| Relativrendite als Quotient | §3.2 | H-DIV-2 umformuliert | Abgeleitete Hypothesen |
| Total Return und Kontrollportfolio | Frage 5 | Benchmarkregel erweitert | Abgeleitete Hypothesen |
| Lücke ist nicht Renditeverzerrung; Delisting-Renditen; stabile IDs; Begriffstrennung | §4.2–4.3, Frage 4 | Grenzen, Folgerung und Erweiterungsliste | Survivorship-Messung |
| P0-Prüfung Go-Kriterium 2; „nicht betroffen“ nur für Survivorship | Frage 7, §4.4 | neuer Abschnitt mit Entscheidungsregel; Ergebnis: nicht betroffen | Prüfung der Go-K2-Backtests |
| Abnahmetest, Anbieter-Rangfolge, verbindliches Angebot, Europa zurückgestellt | §5, Frage 6 | Abnahmetest konkretisiert, Rangfolge neu | Datenquellen und Stufenplan |
| Arbeitsplan P0 bis P3 | §7 | Nächste Schritte neu gegliedert | Bekannte Schwächen |

Abweichend umgesetzt: Den zweiten unabhängigen Prüfer ersetzen zwei getrennte Extraktionsläufe plus eigene Stichprobe (Solo-Projekt). Aufgelöst: der Widerspruch im Review zwischen Neuberechnung vor Dezember und keiner Datenlizenz vor Go/No-Go, durch die Entscheidungsregel.
