# UIQ — Kostenanalyse private Nutzung

**Stand:** 16.11.2026 · **Autor:** Claude mit Dr. Axel Hildebrand · **Arbeitsfassung:** Claude-Dokument „UIQ — Kostenanalyse private Nutzung“ (Export vom 16.11.2026)

## Kurzfazit

Der Normalbetrieb von UIQ kostet **rund 41 USD pro Monat** an Anthropic-API-Gebühren. Gemessen sind 44,81 USD im Oktober und 19,58 USD vom 1. bis 16. November (ohne 2,46 USD für ein anderes Projekt am 15.11.). Basis ist der Token-Export der Console, gerechnet zu Listenpreisen. Die Infrastruktur kostet nichts (GitHub Actions im öffentlichen Repo, Cloudflare Free-Plan).

Rund drei Viertel davon entfallen auf den nächtlichen Public Digest (etwa 1,46 USD pro Nacht). Der September (85,78 USD) war Entwicklungs- und Testphase und ist kein Maßstab.

Der verlinkte Rechner von gradually.ai passt nur für Axels eigene Claude-Nutzung beim Entwickeln (Abo). Die Produktions-Aufrufe von UIQ laufen über die API und werden nach Token abgerechnet; kein Abo deckt sie ab.

## Was der gradually.ai-Rechner abdeckt

Der Rechner vergleicht einen geschätzten API-Gegenwert der eigenen Claude-Nutzung mit den Abopreisen (Stand der Seite 12.11.2026). Er rechnet mit Tagesbetrag × aktive Tage, zum Beispiel 13 $ × 20 Tage = 260 $ für die Stufe „Durchschnitt“. Modellpreise pro Token, Cache- und Batch-Preise nennt die Seite nicht. ([Quelle](https://www.gradually.ai/claude-kostenrechner/))

| Kostenblock | Abrechnung | Passt der Rechner? |
| --- | --- | --- |
| UIQ-Produktion (Aggregator, Digest, Worker) | API, pro Token, Monatsrechnung Anthropic | Nein, Abos decken API-Aufrufe nicht ab |
| Entwicklung mit Claude (Sessions wie diese) | Abo (Pro 20 $, Max 100 $, Ultra 200 $ laut Seite) | Ja, dafür ist er gebaut |

Für die Entwicklung hängt das Ergebnis vom gebuchten Abo und der Zahl aktiver Tage ab. Beides steht mir nicht zur Verfügung. Die Seite betont selbst, dass der API-Gegenwert keine Ersparnis ist und ihre Messspannen von einem Extremnutzer stammen.

## Preisgrundlage

UIQ nutzt in Aggregator und Digest durchgängig `claude-sonnet-4-6` (im Code geprüft: `market_aggregator.py` v5.48.0, `generate_public_recommendations.js`). Der Worker `ko-ai.js` mischt laut Backlog vom 21.09. Haiku und Sonnet; seinen aktuellen Code habe ich nicht gesehen.

| Modell | Input | Cache-Read | Output | Batch Input/Output | Einheit |
| --- | --- | --- | --- | --- | --- |
| Sonnet 4.6 (aktiv in UIQ) | 3,00 | 0,30 | 15,00 | 1,50 / 7,50 | US$ pro 1 Mio. Token |
| Sonnet 5.5 | 2,00 | 0,10 | 10,00 | 1,00 / 5,00 | US$ pro 1 Mio. Token |
| Haiku 5.5 (Prompt bis 100K) | 0,10 | 0,01 | 0,50 | 0,05 / 0,25 | US$ pro 1 Mio. Token |
| Haiku 4.5 | 1,00 | 0,10 | 5,00 | 0,50 / 2,50 | US$ pro 1 Mio. Token |

Cache-Schreiben kostet das 1,25-Fache des Input-Preises (5 Minuten). Batch und Caching lassen sich kombinieren. Modelle ab Claude 4.7 erzeugen für denselben Text etwa 30 % mehr Token als ältere. ([Anthropic-Preisseite](https://platform.claude.com/docs/en/about-claude/pricing), abgerufen 16.11.2026)

## Kostenblöcke im Betrieb

Die Kosten folgen seit Oktober einem festen Wochenmuster. Gerechnet ist mit den Listenpreisen aus dem Abschnitt Preisgrundlage, auf Basis des Console-Exports (alle Aufrufe über den Key `KO-APP-Key`, Region global, kein Aufschlag).

| Monat | Sonnet 4.6 | Haiku 4.5 | Sonnet 5.5 | Summe |
| --- | --- | --- | --- | --- |
| September 2026 | 79,36 USD | 6,43 USD | – | 85,78 USD |
| Oktober 2026 | 44,31 USD | 0,49 USD | – | 44,81 USD |
| 1. bis 16. November 2026 | 19,54 USD | 0,04 USD | 2,46 USD | 22,04 USD |

Die Summen sind aus den ungerundeten Einzelwerten gebildet und erst danach gerundet; deshalb weichen sie um bis zu 0,01 USD von der Summe der gerundeten Spaltenwerte ab (September 85,78 statt 85,79 USD, Oktober 44,81 statt 44,80 USD; geprüft an den Rohdaten am 18.11.2026).

| UTC-Tag | Was läuft | Kosten pro Tag | pro Monat | Beleg |
| --- | --- | --- | --- | --- |
| Di bis Sa (Nachtlauf nach den Handelstagen Mo bis Fr) | Aggregator-Enrichment und Public Digest | 1,73 bis 1,83 USD, typisch 1,77 USD | ca. 37 USD (21 Läufe) | \[belegt\] Token je Tag; Cache-Write 10 544 und Cache-Read 147 616 Token wie am 24.09. gemessen |
| So und Mo | ca. 30 000 Input- und 15 000 Output-Token Sonnet 4.6 | 0,31 USD | ca. 3 USD (9 Tage) | \[belegt\] Token; Zuordnung zu den Dispatch-Läufen um 04:15Z ist eine \[Hypothese\] |
| Live-Pfad `ko-ai.js` (Haiku 4.5) | Morning Briefing, Auto-Macro, EIC | fast null | 0,49 USD Okt., 0,04 USD Nov. | \[belegt\] |
| Infrastruktur | GitHub Actions, Cloudflare Free, Gratis-Datenquellen | 0 | 0 | Angabe Axel 16.11. und Protokolle |

Ableitung: Die 0,31 USD an So und Mo entsprechen sehr wahrscheinlich dem Aggregator-Enrichment ohne Digest, weil der Digest ohne neuen Handelstag übersprungen wird. Dann kostet der Digest etwa 1,77 − 0,31 = 1,46 USD pro Nacht (gemessen am 23.09.: ca. 1,40 USD) und das Enrichment etwa 0,31 USD pro Lauf. Meine frühere Schätzung für das Enrichment (0,30 bis 0,80 USD) lag damit am unteren Rand.

Zwei Auffälligkeiten: Am 15.11. (Sonntag) liefen 418 320 Input- und 161 929 Output-Token über **Sonnet 5.5** (2,46 USD, ohne Cache); laut Axel ein anderes Projekt, nicht UIQ, und deshalb nicht in den UIQ-Kosten enthalten. Im September gab es Tage bis 10,45 USD (22.09.), passend zur damaligen Entwicklungs- und Testarbeit.

## Hebel zur Kostensenkung

Der größte Hebel ohne Modellwechsel ist die Batch-API für den Digest: etwa −15 USD pro Monat, also gut ein Drittel der Gesamtkosten. Der Weg ist im Code schon gebaut (`USE_BATCH_API`, Opt-in), im Workflow aber nicht gesetzt. Alle Hebel sind Produktionsänderungen. Sie fallen unter den Freeze, brauchen Axels ausdrückliches Go und je eine eigene Nacht.

| Hebel | Wirkung pro Monat (Basis gemessen) | Risiko und Prüfbedarf |
| --- | --- | --- |
| Batch-API für den Digest (ca. 31 USD/Monat) | −50 %, ca. −15 USD | Antwort kommt asynchron (bis 24 h); ob Cache-Treffer im Batch gleich häufig sind, ist nicht gemessen |
| So/Mo-Läufe ohne neuen Handelstag ohne KI-Enrichment | ca. −3 USD | erst prüfen, ob die Aufrufe wirklich von diesen Läufen stammen und ob ihr Ergebnis gebraucht wird |
| Batch-API für das Aggregator-Enrichment (ca. 9 USD/Monat) | ca. −4 USD | Umbau in `market_aggregator.py`, Laufzeit des Jobs ändert sich |
| Wechsel auf Sonnet 5.5 | Preis −33 %, aber ca. 30 % mehr Token: netto etwa −13 %, ca. −6 USD | Ausgaben müssten gegen die bestehenden Guardrails neu geprüft werden |

Batch und Sonnet 5.5 zusammen brächten den Digest rechnerisch auf etwa 13 bis 14 USD pro Monat (31 × 0,5 × 0,87). Das ist eine Rechnung, keine Messung.

## Modellwahl

Ein anderes Modell kann die Kosten stark senken, gleichbleibende Qualität ist aber erst nach einem Test belegt. Der sinnvollste Kandidat ist Haiku 5.5 für das Aggregator-Enrichment, nicht für den Digest. Gerechnet mit den echten Sonnet-Token aus dem Oktober (44,31 USD), einschließlich ca. 30 % mehr Token bei Modellen ab Claude 4.7:

| Modell | Kosten Oktober | Veränderung | Einschätzung |
| --- | --- | --- | --- |
| Sonnet 4.6 (heute) | 44,31 USD | – | Referenz |
| Sonnet 5.5 | ca. 38 USD | ca. −14 % | spart wenig, Neuprüfung aller 15 Strategien nötig |
| Haiku 4.5 | ca. 15 USD | ca. −67 % | teurer als Haiku 5.5, kein Vorteil |
| Haiku 5.5 | ca. 2 USD | ca. −96 % | für das Enrichment prüfen; für den Digest höchstes Qualitätsrisiko |
| Opus 5.5 | ca. 76 USD | ca. +71 % | kein Kostenhebel |

Empfohlene Reihenfolge, je eine Produktionsänderung pro Nacht und nur auf Axels Go:

1. Batch-API für den Digest: gleiches Modell und gleiche Prompts, ca. −15 USD pro Monat.
2. Haiku 5.5 für das Enrichment, erst nach dem Schattentest unten: ca. −8 USD pro Monat.
3. Kein KI-Enrichment in den So/Mo-Läufen ohne neuen Handelstag, wenn sich die Zuordnung bestätigt: ca. −3 USD pro Monat.

Zusammen ergibt das rechnerisch etwa 16 bis 17 USD statt 41 USD pro Monat (rund −60 %), ohne das Modell des Digests zu wechseln.

## Schattentest Haiku 5.5 für das Enrichment (Entwurf, nicht freigegeben)

Der Test läuft offline gegen archivierte Eingaben und ändert nichts an der Produktion; er fällt damit nicht unter den Freeze. Start erst nach Axels Go, mit vorher vorgelegtem Befehl und Nebenwirkungen.

**Frage:** Liefert Haiku 5.5 bei denselben Eingaben Enrichment-Antworten, die so brauchbar sind wie die von Sonnet 4.6?

**Umfang:** die drei Aufrufarten in `market_aggregator.py` (v5.48.0): Shortlist-Bewertung (15 Aufrufe, max. 400 Token), Options-Watchlist (15 Aufrufe, max. 1000 Token) und Strike-Nachfrage (max. 150 Token). Der Tages-Snapshot-Aufruf (`generate_daily_snapshot`, max. 4500 Token) und der Digest gehören nicht dazu.

**Eingaben:** drei archivierte Nächte aus `uiq-archive` mit unterschiedlicher Lage, Vorschlag 11-04\_02, 11-13\_02 und 11-14\_02. Je Nacht gehen dieselben 15 + 15 Kandidaten an beide Modelle. \[offen\] Ob die Snapshots die vollständigen Eingaben für die Prompts enthalten (`enrich_context`, Kandidatenfelder) und ob dort die Sonnet-Antworten der Nacht gespeichert sind, wird vor dem Bau geprüft. Fehlen sie, wird Sonnet 4.6 im Test mit aufgerufen.

**Werkzeug:** ein eigenes kleines Skript in `uiq-devtools/datenreife/` (Arbeitstitel `schattentest_enrichment.py`). Es nutzt die Prompt-Bau-Funktionen des Aggregators unverändert und tauscht nur das Modell im Request. Kein Schreiben in KV, Archiv oder Repo-Arbeitsverzeichnis; die Ausgabe landet in einem lokalen Ordner. Das Skript wird vor dem Lauf zur Ansicht vorgelegt und von Axel committet.

**Prüfkriterien, vor dem Lauf festgelegt (Vorschlag, Axel entscheidet):**

| Prüfung | Art | Bestanden, wenn |
| --- | --- | --- |
| Antwort ist gültiges JSON nach dem bestehenden Fence-Stripping | automatisch | 100 % der Aufrufe |
| Pflichtfelder des Antwortschemas vollständig, kein Abbruch an der Token-Grenze | automatisch | 100 % |
| Zahlen in sich stimmig (z. B. CSP-Strike unter dem Kurs, Stop unter dem Einstieg bei Long) | automatisch | keine Verletzung |
| Keine direktive oder kausale Sprache im Public-Text (bestehende Regeln) | automatisch, mit positiven und negativen Kalibrierfällen | nicht mehr Treffer als Sonnet |
| Inhaltliche Brauchbarkeit | blinde Bewertung durch den Reviewer, Modell verdeckt | Haiku mindestens gleichwertig in der Mehrheit der Paare |

Die automatischen Prüfungen werden vor dem Lauf an bekannten guten und bekannt fehlerhaften Antworten kalibriert (Pflicht-Header Punkt 7).

**Kosten des Tests:** Haiku 5.5 für drei Nächte deutlich unter 0,10 USD; falls Sonnet-Referenzen nachgeholt werden müssen, ca. 1 USD. Der eigentliche Aufwand ist die Prüfzeit.

**Nicht Teil des Tests:** Modellwechsel im Digest, Sonnet 5.5, jede Produktionsänderung. Ein bestandener Test ist keine Freigabe; die Umstellung wäre eine eigene Entscheidung mit eigener Nacht.

## Plan (beschlossen von Axel am 16.11.2026, 22:18 Uhr)

Zwei getrennte Stränge: Batch-API für den Digest und Modellwechsel für das Enrichment. Die So/Mo-Läufe bleiben vorerst unverändert. Die Batch-API für das Enrichment wird nicht verfolgt (kein Code vorhanden, Eingriff in die Kernpipeline, nur ca. 4 USD Ersparnis).

**Strang A: Batch-API für den Digest (ca. −15 USD/Monat)**

Befunde aus dem Code von `generate_public_recommendations.js` (gelesen 16.11., nicht getestet): Der Batch-Pfad lief laut Changelog v1.13 nie live. Bei Überschreitung der Wartezeit (20 min) fallen alle 15 Strategien aus, ohne Rückfall auf den synchronen Weg. Ein Schutz gegen 0 von 15 erfolgreichen Strategien war nicht zu finden; ob dann ein leerer Digest veröffentlicht würde, ist offen. Abgeschnittene Antworten werden im Batch nicht wiederholt. Der Job hat 45 min, der Aggregator braucht davon 25 bis 30.

1. Offline-Test auf Axels Mac, frühestens Do 19.11.2026 (nach Ende von Nacht B): Batch-Pfad mit Anthropic-Key und einer archivierten Master-Datei, ohne Cloudflare-Zugangsdaten, also ohne KV-Schreiben. Geprüft werden Dauer, Cache-Treffer, Kosten und Gleichheit der Ausgabestruktur mit dem synchronen Lauf. Kosten ca. 1 USD. Befehl und Nebenwirkungen werden vorher vorgelegt; Start nur nach Axels Go.
2. Absicherung im Skript: Rückfall auf den synchronen Weg bei Timeout und kein Veröffentlichen eines leeren Digests; Batch bleibt dabei ausgeschaltet. Eigene Nacht, Freeze-Ausnahme durch Axel nötig.
3. Aktivierung `USE_BATCH_API=true` im Workflow. Eigene Nacht, Freeze-Ausnahme nötig; danach Kostenabgleich über den Console-Export.

**Strang B: Haiku 5.5 für das Aggregator-Enrichment (ca. −8 USD/Monat)**

1. Vorprüfung nur lesend im Archiv: Enthalten die Snapshots die vollständigen Prompt-Eingaben und die Sonnet-Antworten der Nacht?
2. Schattentest offline nach dem Entwurf oben; Skript, Prüfkriterien und Nächte werden vorher vorgelegt und von Axel freigegeben.
3. Eine Umstellung wäre danach eine eigene Entscheidung mit eigener Nacht.

**Zurückgestellt: So/Mo-Läufe (ca. −3 USD/Monat)**

Diese Läufe liefern die einzigen Snapshots mit vollständigen US- und Non-US-Zeilen (Protokoll Abschnitt 20.3) und bleiben bestehen. Ausgelöst werden sie offenbar über abweichende Cron-Trigger im bereitgestellten `ko-watchdog` (Befundregister 04.10.). Zuerst wird nur lesend geprüft, ob ihre Logs Anthropic-Aufrufe zeigen; danach wird entschieden.

**Regeln für beide Stränge:** eine Produktionsänderung pro Nacht, nichts ohne Axels ausdrückliches Go, Befehl und Nebenwirkungen vorher, ganze Dateien zum Ersetzen, Axel committet selbst, Prüfung per Hash. Die laufende Non-US-Messung (Nächte A und B, 17. und 18.11.) hat Vorrang und wird nicht berührt.

## Reviewer-Einschätzung und Präzisierungen (16.11.2026)

Der Reviewer bestätigt den Zwei-Stränge-Plan, den Offline-Test vor jeder Aktivierung und das Beibehalten der So/Mo-Läufe (Text von Axel am 16.11.2026 um 22:23 Uhr übermittelt). Seine Ergänzungen werden übernommen, mit folgenden Präzisierungen von Claude (noch nicht von Axel entschieden):

| Punkt des Reviewers | Präzisierung |
| --- | --- |
| Abnahme Batch: „15 von 15 erfolgreich“ | Für den Offline-Test passend. Im Betrieb kann auch der synchrone Weg einzelne Strategien verlieren (Repair gescheitert, Abbruch an der Token-Grenze); der Digest veröffentlicht heute bewusst nur die erfolgreichen. Vorschlag: Der Batch-Weg darf nie weniger Strategien liefern als der synchrone; scheitert eine Strategie im Batch, wird sie einzeln synchron nachgeholt; bei 0 erfolgreichen wird nichts veröffentlicht und der bisherige Digest bleibt stehen. „Nie unvollständig“ wäre eine Änderung des heutigen Verhaltens und eine eigene Entscheidung. |
| Abnahme Batch: „gültiges JSON“ | Die Digest-Antworten sind Text, kein JSON. Passender: Ergebnis „succeeded“, kein Abbruch an der Token-Grenze, dieselben Compliance-Prüfungen bestanden wie im synchronen Lauf. |
| Sicherer Rückfall bei Timeout | Zeitbudget beachten: Aggregator 25 bis 30 min + 20 min Batch-Wartezeit + synchroner Nachlauf passen nicht in das Job-Limit von 45 min. Die Wartezeit muss kürzer werden oder das Limit höher; das wird im Offline-Test anhand der echten Batch-Dauer festgelegt. |
| Protokoll, welcher Pfad geliefert hat | Übernommen; dabei die Cache-Token mitzählen, die das Budget-Log heute verwirft (Befund 24.09.). |
| Haiku: Gewichtung 40/40/20 | Statt eines gewichteten Mittels: jede der drei Aufrufarten muss für sich bestehen. Ein Mittelwert könnte genau die Schwäche einer Aufrufart verdecken, vor der der Reviewer warnt. |
| Haiku: Rückfall auf Sonnet jederzeit | Übernommen. Das Modell steht heute an fünf Stellen fest im Code; bei einer Umstellung eine einzige Konstante einführen, damit der Rückweg eine Zeile ist. |
| Kostenprognose „nach beiden Maßnahmen 18 USD“ | Die Einsparung durch Haiku liegt bei ca. 8,9 USD (9,3 auf 0,4), nicht 8. Ergebnis: Digest ca. 15,4 + Enrichment ca. 0,4 + Sonstiges ca. 1 = ca. 16 bis 17 USD, ohne Änderung der So/Mo-Läufe. Nach dem Haiku-Wechsel kostet das Enrichment an So/Mo nur noch Cent-Beträge; der Punkt So/Mo erledigt sich damit auch finanziell. |
| Getrennte API-Keys | Übernommen, ohne Produktionseingriff: Das andere Projekt bekommt einen neuen Key, `KO-APP-Key` bleibt bei UIQ. |
| Warnschwelle 20 USD | Erst nach Aktivierung beider Maßnahmen sinnvoll; heute liegt der Normalbetrieb bei 41 USD und würde jeden Monat auslösen. Vorschlag: bis dahin Prüfung ab 50 USD, danach die Stufen des Reviewers (bis 17 normal, über 20 prüfen, über 25 ungeplant). |
| Monatliches Kostenprotokoll, Überprüfung nach 30 Tagen | Übernommen; Grundlage ist der Console-Export, ausgewertet nach dem Wochenmuster (Di bis Sa gegen So/Mo). |

## Offene Punkte

Die Messung steht. Offen sind noch:

- [ ] Eigener API-Key für andere Projekte, damit der Export nur UIQ zeigt (am 15.11. lief ein anderes Projekt über KO-APP-Key)
- [ ] Abgleich der gerechneten Summen mit der Cost-Seite der Console (platform.claude.com/cost); mögliche Abweichungen durch Guthaben oder Steuern
- [ ] Gebuchtes Claude-Abo und grobe Zahl aktiver Entwicklungstage pro Monat (dafür ist der gradually.ai-Rechner gedacht)

Nicht Teil dieser Analyse: Kosten bei Beta-Nutzern oder kommerzieller Nutzung. Dort würden vor allem der Live-Pfad und mögliche Datenlizenzen wachsen.

## Quellen

- [gradually.ai — Claude-Kostenrechner](https://www.gradually.ai/claude-kostenrechner/) (Stand der Seite 12.11.2026)
- [Anthropic — Pricing](https://platform.claude.com/docs/en/about-claude/pricing) (abgerufen 16.11.2026)
- `ahsub/ko-aggregator` (`main`, gelesen 16.11.2026): `market_aggregator.py` v5.48.0, `.github/workflows/market-aggregator.yml`
- `ahsub/UIQ-Suite` (`main`, gelesen 16.11.2026): `scripts/generate_public_recommendations.js`, `docs/UEBERGABE-2026-09-21.md`, `docs/UEBERGABE-2026-09-24.md`, `docs/UIQ-BACKLOG-2026-09-21.md`
- Console-Export der Token-Nutzung 01.09. bis 16.11.2026 (drei CSV-Dateien, Archiv von Axel am 16.11.2026; die Kopien mit „(1)“ im Namen sind inhaltsgleich)
