# UIQ — Datenreife und Quellenvergleich (Strang A, Themendokument)

**Datum:** 17.10.2026 (Stand; laufend fortzuschreiben)
**Status:** Zusammenfassung zu Strang A (Zeitpunkt der Tagesschlusskurse, Datenreife-Gate als Papiermodell, Quellenvergleich Non-US und Krypto). **Keine Entscheidung wird hier getroffen.** Quelle der Wahrheit sind die Abschnitte 8–27 von `UEBERGABE-2026-10-07.md` (Stand `2d2c1cf`) und die dort genannten Messdateien. Freeze besteht, nichts in Produktion geändert, Gate nicht aktiviert, Messserie des Quellenvergleichs nicht freigegeben.
**Zweck:** Ein Ort für Frage, Messstand, Annahmen und Planung, damit Tagesprotokolle darauf verweisen können, statt Messdaten zu wiederholen. Markierung: [belegt] gemessen oder aus Datei belegt, [Hypothese] Deutung, [offen] ungeklärt.

## 1. Frage

Zu welchem Zeitpunkt sind die Tagesschlusskurse bei der Datenquelle (Yahoo über `yfinance` 1.5.2) für US-, Non-US- und Krypto-Ticker vollständig, und wann sollte der Aggregator-Lauf stattfinden (oder ein Gate ihn verschieben), damit die letzte Zeile nicht unvollständig ist?

## 2. Ausgangsbefund [belegt]

* Die letzte Tageszeile bei Yahoo existiert, hat aber OHLC = NaN, bis der Tag abgeschlossen ist. Der Aggregator holt `start`/`end` in UTC; `end` ist exklusiv (Abschnitt 21, A1). Geplante Läufe starten 2 h 11 min bis 4 h 54 min nach 22:00Z.
* Die Produktionsläufe 356 bis 358 (00:11Z bis 00:22Z) trafen die unvollständige Phase: rund 92 % der US-Zeilen unvollständig, Flag `LAST_ROW_INCOMPLETE` (Abschnitt 25).

## 3. US-Messung, drei Nächte (Mac, 47 Messticker, nur Lesen) [belegt]

* Mindestens 46 von 47 Tickern vollständig bis 01:40Z in allen drei Nächten (14./15., 15./16., 16./17.10.).
* Früher Übergang um 00:30Z bis 00:40Z nur in zwei der drei Nächte (14.→15.10., 15.→16.10.); nicht in der Nacht 16.→17.10. und nicht in der Produktionsnacht 13.→14.10. (rund 100 % unvollständig um 00:59Z).
* Nachzügler: META, ETSY, FIVE (bis 01:40Z), SHEL (je Nacht zwischen 00:10Z und 03:00Z). Keine Rückfälle; Werte nach Vervollständigung stabil.
* [offen] Ursache der Unterschiede zwischen den Nächten; Verhalten von SHEL; Wirkung der Zeitumstellung; Unterschied Runner gegenüber Mac.

## 4. Gate-Entwurf (Papiermodell, Abschnitte 24 und 26) [Arbeitsannahme, nicht validiert]

* Bedingungen: UTC-Datum nach dem Handelstag; SPY-Zeile vollständig; mindestens 95 % (45 von 47) der festen US-Messticker vollständig; Obergrenze 02:00Z (dann laufen und dokumentieren).
* 90 % abgelehnt: würde den unzuverlässigen frühen Übergang begünstigen.
* Nicht aktiviert, nicht implementiert. Eine Umsetzung wäre eine eigene Produktionsentscheidung (Pflicht-Header Punkt 8). Begleitfragen: Trading-Day-Skip (A6) fixiert den Digest bei einem frühen unvollständigen Lauf; Watchdog (Cloudflare-Crons 04:15/13:45, A12); Abhängigkeit des FIN-Archivs vom Wochentag (A8).
* Messplanung: Nächte Mo→Di 02./03.11. und Di→Mi 03./04.11., Fenster 00:10Z bis 04:30Z (nach der US-Umstellung am 01.11. schließt der US-Handel um 21:00Z).

## 5. Non-US und Krypto: Quellenvergleich (Abschnitt 27)

* Universum in den Snapshots: 33 Non-US-Ticker (DE, L, MI, PA, BR, MC, ST, AX) und 13 Krypto-Ticker. Frühere Messungen [belegt, ältere Abschnitte]: Yahoo vervollständigt Non-US-Tageszeilen etwa 08:30–09:00Z, Krypto-Vortageszeilen etwa 07:00–07:30Z; die Börsen schließen rund 15:30Z (Europa) bzw. um 00:00Z (Krypto-Tageskerze).
* Kandidatenquellen: Krypto-Börsen Binance (USDT), Kraken (USD), Coinbase (USD); Yahoo-Intraday (15 Minuten) für Non-US; später ggf. EODHD, Twelve Data, Stooq (Konten und Lizenz offen).
* Paket c3 v1.1 (Hashes siehe Tagesprotokoll 17.10.): Langformat-CSV, frischer Prozess je Messpunkt, Statuswerte je Abruf, Meta-JSON ohne Pfade und Schlüssel.
* **Kurztest 17.10.2026 06:00Z [belegt aus den CSVs]:** Krypto 52 Abrufe, Non-US 28 Abrufe, alle `ok`. Alle drei Börsen liefern die geschlossene Tageskerze vom 16.10. für alle 13 Coins (39 von 39); Yahoo hatte noch den 15.10. Non-US: Yahoo-Tageszeile vom 16.10. bei 13 von 14 Tickern noch leer, nur ORG.AX vollständig. Letzter regulärer 15-Minuten-Balken liegt vor; bei UCB.BR (17:30 Ortszeit, Close 204,60 gegenüber 203,50) und ORG.AX (16:00 Ortszeit, Close 12,0600004 gleich Yahoo-Tagesschluss) gibt es einen Balken nach der angenommenen Schlusszeit. [Hypothese] Schlussauktion; die Serie prüft es.
* BNB gibt es auch bei Kraken und Coinbase (frühere Aussage „nur Binance“ war falsch).
* Währungs- und Handelsplatzunterschiede (USDT/USD, Börse gegen Yahoo-Aggregat) sind eine eigene Kennzahl und nicht Teil der Verfügbarkeitsfrage.

## 6. Messserie: Stand

* Freigabe durch Axel am 17.10.2026 08:32 Uhr MESZ (Zustimmung des Reviewers im Gespräch nicht belegt, [offen]). **Krypto-Serie `20261017T063627Z` abgeschlossen** (40 Slots 17.10. 23:50Z bis 18.10. 08:30Z, alle 6 240 Abrufe `ok`): Börsen liefern die geschlossene UTC-Tageskerze ab 00:00Z (Coinbase-Schluss läuft bei 12 von 13 Coins im Slot 00:05Z noch um bis zu 0,10 % nach), Yahoo hat die Zeile erst ab 07:10Z (nicht vorhanden bis 07:00Z, danach stabil); eine Nacht, Wochenende, Details in `UEBERGABE-2026-10-17.md` Abschnitt 9. **Non-US-Serie** (Montag 19.10. 15:35Z bis 18:00Z und Dienstag 20.10. 08:00Z bis 10:00Z) noch nicht gestartet. Jeweils nur lesende Abrufe öffentlicher Endpunkte.
* Auswertung danach mit `auswerten`; Ergebnisse werden hier und im nächsten Tagesprotokoll als eigener Nachtrag festgehalten.

## 7. Offen

* Wann Yahoo je Markt tatsächlich vollständig ist (Serie), und ob die Börsenschlusskerzen mit dem später eintreffenden Yahoo-Wert übereinstimmen.
* Lizenz: Yahoo-Nutzung im kommerziellen Betrieb (Go/No-Go) und Bedingungen der Börsen-APIs und weiterer Anbieter.
* Gate-Parameter nach den Messnächten nach der Zeitumstellung neu bewerten.
* Meta-JSONs des Kurztests nachreichen.
