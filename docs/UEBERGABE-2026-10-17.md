## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert.
   "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet.
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können
   Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben
   sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher
   Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.

5. **Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt
   nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle
   Plausibilitäts-Antwort.** Nicht raten, woran es liegen könnte — nachsehen,
   woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt
   ist, gilt sie als gefunden.

6. **Never guess, always correctly diagnose (SUITE.md Grundgesetz #9).**
   Ein plausibler Fix ohne verifizierten Root-Cause-Beleg gilt als Vermutung,
   nicht als Fix — unabhängig davon, wie überzeugend die Erklärung klingt oder
   wie oft ein ähnliches Muster schon funktioniert hat. Präzedenzfall
   (23.09.2026): `ko-prompts.js` v2.54.1 (Fettdruck-Anweisung für Ticker) war
   gut begründet, aber unverifiziert — und schlug live fehl. Erst reines
   Diagnose-Logging (ohne jede Verhaltensänderung) deckte die tatsächliche
   Ursache auf (v2.54.2: fett geschriebene Markdown-Überschriften brachen die
   Ticker-Extraktions-Regex). Erst danach griff der gezielte Fix nachweislich.
   Konsequenz für diese Session: bei unerwartetem Verhalten lieber einen Lauf
   in reine Diagnose investieren (Logging, kein Verhaltenseingriff), als aus
   der ersten plausiblen Hypothese sofort einen Fix zu bauen — auch wenn das
   einen Zyklus länger dauert.

7. **Tests für öffentlichen Output prüfen den Inhalt, nicht nur die Struktur.**
   "Überschrift 7 ist vorhanden" beweist nicht, dass unter Überschrift 7 der
   richtige Text steht. Präzedenzfall (24.09.2026):
   `generate_public_recommendations.js` v1.22 bestand Golden-Test,
   Szenario-Tests und E2E-Test — alle prüften nur, ob die Abschnitts-
   Überschriften vorhanden waren. Live standen in Abschnitt 7+8 aller 15
   Strategien die Prompt-Anweisungen an das Modell ("PFLICHT-SATZMUSTER",
   "Grundgesetz #11", "EIC-exklusiv") statt fertigem Text. Root Cause: derselbe
   String wurde für zwei Rollen benutzt (Anweisung ans Modell UND öffentlicher
   Text). Konsequenz: Prüfungen für öffentlichen Text gegen echte historische
   Outputs kalibrieren — mit positiven Fällen (gültige Texte müssen bestehen)
   UND negativen Fällen (bekannt fehlerhafte Texte müssen durchfallen), bevor
   sie live Strategien blockieren dürfen. Und: Prompt-Anweisung ≠ Output — nie
   denselben String für beide Rollen verwenden.

8. **Pro Nacht nur eine Produktionsänderung.**
   Wenn zwei Änderungen gemeinsam in denselben Nachtlauf gehen und etwas
   abweicht, lässt sich die Abweichung keiner der beiden eindeutig zuordnen.
   Weitere fertige Änderungen warten, bis die vorherige live bestätigt ist —
   notfalls über einen manuellen Lauf, damit nicht auf den nächsten Nachtlauf
   gewartet werden muss. Präzedenzfall (24.09.2026): Phase C der
   TICKER_MASTER-Migration wurde fertig gebaut und getestet, aber bewusst erst
   nach der Live-Bestätigung von v1.23 zum Commit freigegeben.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---


# UIQ — Übergabeprotokoll 17.10.2026 → 18.10.2026

**Datum:** 17.10.2026 (Samstag), Sessionstand vormittags (ca. 08:30 Uhr MESZ)
**Status:** **Freeze besteht.** Keine Änderung an `market_aggregator.py`, Produktionslogik, Schwellen, öffentlichen Outputs, Workflows, Worker, KV, Archiv oder `SUITE.md`; Archiv-Commit `e005f52` unangetastet; C1 gesperrt. Das Gate (Datenreife vor Aggregatorlauf) ist ein **Papiermodell, nicht aktiviert, nicht implementiert**. **Die Messserie des Quellenvergleichs (Krypto Nacht Sa→So, Non-US Montag 19.10.) ist nicht freigegeben.**
**Zweck:** Neubeginn der Tagesprotokolle. Das Sammelprotokoll `UEBERGABE-2026-10-07.md` wuchs seit dem 07.10. auf 887 Zeilen und behandelt seit etwa einer Woche fast nur den Nachtlauf-Zeitpunkt und die Schlusskurse (Abschnitte 8–27). Es bleibt als append-only Quelle unverändert stehen; dieses Protokoll fasst den Stand zusammen und verweist auf die Abschnitte. Das Thema Datenreife und Quellenvergleich hat zusätzlich ein eigenes Dokument (`DATENREIFE-UND-QUELLENVERGLEICH.md`).

> Quellenhinweis: Stand und Hashes aus dem Klon von `ahsub/UIQ-Suite` (`origin/main` `2d2c1cf82c8f48d03bb90649a47e9ff6cabbb5eb`), geprüft am 17.10.2026. Alle inhaltlichen Aussagen unten sind Zusammenfassungen der genannten Abschnitte des Protokolls vom 07.10.; sie sind hier nicht neu gemessen.

## 1. Stand der Repos und Dateien

| Objekt | Stand | Anmerkung |
|---|---|---|
| `ahsub/UIQ-Suite` | `main` `2d2c1cf` (17.10.2026) | enthält `docs/UEBERGABE-2026-10-07.md` mit 887 Zeilen, Datei-Hash-Präfix `2f9b25f6aea98566`; Zeilen 1–78 (Pflicht-Header) unverändert `f9c951568fc52222`; die ersten 863 Zeilen unverändert `1a9b99fc15cebe17`; Abschnitte 25–27 enthalten |
| Quellenvergleich-Paket c3 (Mac `~/uiq-c2`, nicht im Repo) | c3 v1.1, 984 Zeilen, `d81a01dfdd176690` | Watchlists `18df1bf9f19cec04` (Krypto), `17f366b05532637a` (Non-US); Anleitung `027e4e5cb3c926a1`; auf dem Mac bestätigt (Hash, Trockenlauf 31 Prüfungen) |
| `ahsub/ko-aggregator` | `main` `4aa0d15` (17.10., nur gelesen) | unverändert |
| `ahsub/uiq-archive` (privat) | `main` `d3969fb` (nur gelesen) | Snapshot `2026-10-17_00` = Lauf 358 |

## 2. Ergebnisse (Kurzfassung; Details und Zahlen in den genannten Abschnitten von `UEBERGABE-2026-10-07.md`)

1. **US-Tagesschluss bei Yahoo (Abschnitte 22, 23, 25):** In drei Messnächten auf dem Mac (47 Messticker) waren mindestens 46 von 47 Tickern bis 01:40Z vollständig; ein früher Übergang um 00:30Z bis 00:40Z zeigte sich nur in zwei von drei Nächten. Nachzügler: META, ETSY, FIVE (01:40Z), SHEL (zwischen 00:10Z und 03:00Z je Nacht). Rückfälle gab es nicht. Die Produktionsläufe 356 bis 358 (00:11Z bis 00:22Z) trafen die unvollständige Phase (rund 92 % der US-Zeilen unvollständig, Flag `LAST_ROW_INCOMPLETE`).
2. **Gate-Entwurf (Abschnitte 24, 26):** Papiermodell: UTC-Datum nach dem Handelstag, SPY-Zeile vollständig, mindestens 95 % (45 von 47) der festen US-Messticker vollständig, Obergrenze 02:00Z (dann laufen und dokumentieren). Die Werte sind Arbeitsannahmen, nicht validiert; 90 % wurde abgelehnt, weil es den unzuverlässigen frühen Übergang begünstigt.
3. **Quellenvergleich Non-US und Krypto (Abschnitt 27):** Paket c3 v1.1 und Kurztest am 17.10. 06:00Z: alle 52 Krypto- und 28 Non-US-Abrufe `ok`; Binance, Kraken und Coinbase liefern die geschlossene Tageskerze vom 16.10. für alle 13 Coins (39 von 39), Yahoo hat um 06:00Z noch den 15.10. Non-US: Yahoo-Tageszeile vom 16.10. bei 13 von 14 Tickern um 06:00Z noch leer. Auktionsbalken bei UCB.BR und ORG.AX als [Hypothese].
4. **Korrektur:** Die Aussage, BNB gebe es nur bei Binance, war falsch (Kraken und Coinbase liefern BNB).

## 3. Entscheidungslage

* Freeze, C1-Sperre, `SUITE.md`, `e005f52`: unverändert. Keine Freeze-Ausnahme beantragt.
* Gate: nur Papier. Eine Umsetzung wäre eine eigene Produktionsentscheidung mit eigener Nacht (Pflicht-Header Punkt 8).
* Messserie Quellenvergleich: **nicht freigegeben**. Start erst nach ausdrücklichem Ja von Axel und Reviewer, mit vorher vorgelegtem Befehl, Nebenwirkungen und Startzeiten.
* Messnächte nach der US-Zeitumstellung (01.11.2026): Mo→Di 02./03.11. und Di→Mi 03./04.11., Fenster 00:10Z bis 04:30Z, dieselbe US-Watchlist (`4ae78a056ea74362`); Befehl wird vorher eigens vorgelegt.

## 4. Nächste Schritte

1. Axel: Entscheidung über die Freigabe der Messserie (Krypto-Nacht Sa→So ab 23:50Z; Non-US Montag 19.10. getrennt). Vorher Befehl, Nebenwirkungen und Startzeiten prüfen.
2. Die Meta-JSONs des Kurztests (`c3_meta_kurztest_20261017T060034Z.json`, `…T060040Z.json`) wären zur Vollständigkeit hilfreich.
3. Nach der Serie: Auswertung mit `auswerten`, Nachtrag im Themendokument und im nächsten Tagesprotokoll.
4. Optional zusätzliche US-Messnacht vor der Umstellung auf Wunsch von Axel.

## 5. Offene Punkte (unverändert aus dem bisherigen Protokoll; nicht neu geprüft)

* D26 (Ursache der unvollständigen letzten Zeile, Reparaturentscheidung), D27 (Label vor Datenstand), Public-Generator/Skip getrennt führen; A-2 und C nicht freigegeben; Digest-Stand der Nächte 15.–17.10. nur mit Bearertoken lesbar.
* Entscheidungen Axel offen: TIPS→TIP, GOLD→B, USD, A-2/C, ABR-Test, Yahoo-Lizenz Go/No-Go.
* TR-Backup-Step-Logs #342/#351, GOLD-Git-Historie, Wochentagsmenge Di–Sa, D21–D23, S6/№73, BaFin/Bundesbank-Antwort, SUITE.md-Integration nach Abschluss D26.
* Lizenz und Nutzungsbedingungen alternativer Quellen (Börsen-APIs, EODHD, Twelve Data, Stooq) offen.
* Mögliche Stränge B (lokale Gate-Simulation) und C (TR-Backup, Digest-Stand, GOLD-Historie) warten auf Axels Freigabe oder Material.

## 6. Fehler und Korrekturen dieser Session

* Abschnitt 25.4 (Schwelle in Nacht 2) wurde korrigiert: 44 von 47 liegt unter 45, die Schwelle wurde dort nicht erreicht.
* Die Aussage zu BNB (siehe 2.4) war falsch.
* Das Skript c3 hatte im Trockenlauf Fehler in den Testdaten (Uhrzeit-Bedingung, feste Epochen), vor der Auslieferung behoben.
* Der Stop-Hook meldete „Unverified“ bei `89010c4` und `0040ddc` (Axels Commits). Kein Amend, kein Rebase, kein Push; die Historie bleibt unverändert.

## 7. Verweise

* `docs/UEBERGABE-2026-10-07.md` (Sammelprotokoll, Abschnitte 8–27 zum Nachtlauf-Zeitpunkt, Gate und Quellenvergleich), `docs/DATENREIFE-UND-QUELLENVERGLEICH.md` (Themendokument), `docs/UEBERGABE-HEADER-TEMPLATE.md`

## 8. Nachtrag 17.10.2026 vormittags: Freigabe und Start der Krypto-Messserie (nur angehängt; Abschnitte 1–7 unverändert)

* **Freigabe:** Axel hat die Messserie am 17.10.2026 um 08:32 Uhr MESZ ausdrücklich freigegeben. Eine Zustimmung des Reviewers ist in diesem Gespräch nicht belegt [offen]; falls sie vorliegt, bitte hier nachtragen. Vorab vorgelegt waren Befehl, Nebenwirkungen und Startzeiten.
* **Start (Axel, Mac, rein lesend):** Run-ID `20261017T063627Z`, Modus `krypto`, c3 v1.1 (`d81a01dfdd176690`), Watchlist `18df1bf9f19cec04`, Python 3.13.1, Startzeit 06:36:27Z. 13 Ticker, 40 Slots: Fenster 1 von 23:50Z bis 02:00Z alle 5 Minuten, Fenster 2 von 06:30Z bis 08:30Z alle 10 Minuten (17./18.10.2026). Ausgabe in `~/uiq-c2-lokal` (außerhalb eines Git-Repos); Befehl mit `caffeinate -i`, Terminal offen. Das Skript wartet bis zum ersten Slot.
* **Noch ausstehend:** Fertigmeldung des Laufs (voraussichtlich gegen 08:35Z); danach Serie-CSV, Meta-JSON, Log und Konsolenausgabe zur Auswertung mit `auswerten`. Non-US-Läufe (Montag 19.10. 15:35Z bis 18:00Z, Dienstag 20.10. 08:00Z bis 10:00Z, je alle 15 Minuten) sind nicht gestartet.
* Unverändert: Freeze, C1-Sperre, keine Änderung an Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Gate Papiermodell.

## 9. Ergebnis der Krypto-Messserie `20261017T063627Z` (Nacht Sa→So 17./18.10.2026; Auswertung 19.10.; nur Lesen, nur angehängt; Abschnitte 1–8 unverändert)

* **Lauf und Dateien (Axel, Mac):** c3 v1.1 (Skript-Hash `d81a01dfdd176690…`, Watchlist-Hash `18df1bf9f19cec04…`, laut Meta-JSON), Python 3.13.1, yfinance 1.5.2, Darwin 27.0.0, 4 Worker. Fenster 17.10. 23:50Z bis 18.10. 02:00Z (5 min) und 18.10. 06:30Z bis 08:30Z (10 min): 40 Slots. Serie-CSV `f36ac5bd8622e00e` (6 240 Zeilen), Meta-JSON `c3_meta_20261017T063627Z.json`. Das Log (`c3_log_…txt`) liegt mir nicht vor [offen]. Zwischen 02:00Z und 06:30Z wurde nicht gemessen.
* **Vollständigkeit [belegt]:** Alle 6 240 Abrufe `ok` (je 1 560 Binance, Kraken, Coinbase, Yahoo); keine Fehlerklasse, kein `pair_unsupported`.
* **Börsen [belegt]:** Die UTC-Tageskerze vom 17.10. war um 23:50Z und 23:55Z bei allen 13 Coins und allen drei Börsen offen und im Slot 00:00Z (Abruf 00:00:00Z) bei allen drei geschlossen (39 von 39).
* **Nachträgliche Änderung der geschlossenen Kerze [belegt]:** Binance und Kraken: Schlusswerte der geschlossenen Kerze blieben ab 00:00Z unverändert. Coinbase: bei 12 von 13 Coins weicht der Schlusswert im Slot 00:05Z vom Slot 00:00Z ab (maximal 0,10 % bei ATOM-USD, sonst 0,001 % bis 0,05 %), danach stabil. Unverändert blieb nur XRP-USD. [Hypothese] Spätere Zuordnung von Handelsabschlüssen kurz nach dem UTC-Wechsel; Ursache nicht geprüft. Folge für eine Nutzung: ein Schlusswert unmittelbar um 00:00Z kann bei Coinbase noch um Zehntelprozent nachlaufen.
* **Yahoo [belegt]:** Für den 17.10. gab es bis 07:00Z keine Zeile (nicht leer, sondern nicht vorhanden); ab dem Slot 07:10Z war sie bei allen 13 Coins mit Close vorhanden und blieb bis 08:30Z unverändert (kein Ticker mit abweichendem Wert in den neun Slots). Der Übergang liegt also zwischen 07:00Z und 07:10Z, auf zehn Minuten genau; zwischen 02:05Z und 06:25Z wurde nicht gemessen.
* **Abweichung Börsenschluss zu Yahoo-Schluss [belegt]:** Median/Maximum: Binance (USDT) 0,128 %/0,175 % (DOGE-USD), Kraken 0,024 %/0,074 % (ADA-USD), Coinbase 0,013 %/0,082 % (ADA-USD). Das ist ein Preisniveau-Unterschied zwischen Handelsplätzen, kein Qualitätsurteil.
* **Einordnung:** Beobachtung einer einzigen Nacht, und zwar von Samstag auf Sonntag. Das Verhalten an Wochentagen und die Stabilität über mehrere Nächte sind nicht belegt [offen]. Kein Beschluss zu Gate, Aggregator oder Quellenwechsel; die Lizenzfragen (27.4) bleiben offen. Freeze, C1-Sperre und alle Schutzgrenzen unverändert.
* **Als Nächstes:** Non-US-Läufe Montag 19.10. 15:35Z bis 18:00Z und Dienstag 20.10. 08:00Z bis 10:00Z (je alle 15 Minuten, 28 Abrufe pro Slot); noch nicht gestartet.

## 10. Ergebnis der Non-US-Messserie, Montag 19.10.2026 (Lauf `20261019T053714Z`, Teil 1 von 2; nur Lesen, nur angehängt; Abschnitte 1–9 unverändert)

* **Lauf und Dateien (Axel, Mac):** c3 v1.1 (Skript-Hash `d81a01dfdd176690…`, Watchlist `17f366b05532637a…` laut Meta-JSON), Python 3.13.1, yfinance 1.5.2, 4 Worker. Start 05:37:15Z, 11 Slots 15:35Z bis 18:00Z (die Slots folgen dem Viertelstundenraster: 15:35, 15:45, 16:00, 16:15 … 18:00; der erste Abstand beträgt also 10 Minuten). Serie-CSV `9543100481aa21d9` (1 078 Zeilen), Meta-JSON, Log. Log: alle 11 Slots mit 28 Abrufen, 0 nicht ok, Verspätung 0 s.
* **Vollständigkeit [belegt]:** 1 078 Zeilen, alle `ok` (462 Yahoo-Tageswerte, 616 Yahoo-Intraday).
* **Yahoo-Tageszeile des 19.10. [belegt]:** Sie war in keinem Slot enthalten. Die letzte Tageszeile blieb bei allen 14 Tickern der 16.10. (auch um 18:00Z). Das folgt aus dem Abruf (`end` = heutiges UTC-Datum, exklusiv, siehe Abschnitt 21 A1) und ist keine Datenverzögerung bei Yahoo. Der Vergleich mit dem Tagesschluss des 19.10. ist deshalb erst mit dem Dienstagslauf möglich; die Spalten „Abweichung zum Yahoo-Tagesschluss“ der Auswertung sind für den 19.10. noch leer. Die Auswertungszeilen für den 14. bis 16.10. („erster Slot 15:35“) sind nur Tageswerte, die schon vorher vorlagen, und kein Befund.
* **Letzter regulärer 15-Minuten-Balken [belegt]:** Er lag bei allen 14 Tickern ab dem ersten Slot (5 Minuten nach Schluss) vor (Start 15:15Z bzw. 17:15 Ortszeit; London 16:15 Ortszeit; ORG.AX 15:45 Ortszeit).
* **Nachträgliche Änderung dieses Balkens [belegt]:** Bei allen 13 europäischen Tickern wurde der Schlusswert des letzten regulären Balkens nach dem ersten Slot noch geändert, immer nach oben: um +0,06 % (TEF.MC) bis +0,57 % (SAAB-B.ST), z. B. BMW.DE 56,64 → 56,80, RHM.DE 1 051,0 → 1 054,8, SAAB-B.ST 644,3 → 648,0. Die Änderungen traten in den Slots 15:45Z und 16:00Z auf (bis 30 Minuten nach Börsenschluss); ab 16:15Z bis 18:00Z blieb jeder Wert unverändert. ORG.AX (Schluss lange vorher) blieb unverändert (12,06). [Hypothese] Yahoo ergänzt den letzten Balken nachträglich um den Auktionsschlusswert; ob das der offizielle Schlusskurs ist, zeigt erst der Vergleich mit der Tageszeile des 19.10. [offen]. Folge: Der erste Wert nach Börsenschluss ist als Schlusskurs-Näherung bis zu etwa 0,6 % ungenau.
* **Balken nach Schluss [belegt]:** UCB.BR: Balken 17:30 Ortszeit (Close 205,20) ab dem Slot 16:15Z sichtbar, stabil bis 18:00Z; letzter regulärer Balken final 205,10. ORG.AX: Balken 16:00 Ortszeit, Close 12,0600004, ab dem ersten Slot sichtbar und stabil. Bei den übrigen Tickern gab es bis 18:00Z keinen Balken nach der angenommenen Schlusszeit.
* **Offen:** Dienstagslauf 20.10. 08:00Z bis 10:00Z (9 Slots) mit den Tageszeilen des 19.10.; danach gemeinsame Auswertung (`auswerten` mit beiden CSVs) und Vergleich der Balkenwerte mit dem Yahoo-Tagesschluss. Beobachtung eines einzigen Tages; Wochentage und Märkte sind nicht verallgemeinerbar.
* Unverändert: Freeze, C1-Sperre, keine Änderung an Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Gate Papiermodell; keine Quellenentscheidung.

## 11. Ergebnis der Non-US-Messserie, Dienstag 20.10.2026 (Lauf `20261019T203518Z`, Teil 2 von 2) und gemeinsame Auswertung mit dem Montagslauf (nur Lesen, nur angehängt; Abschnitte 1–10 unverändert)

* **Lauf und Dateien (Axel, Mac):** c3 v1.1 (Skript-Hash `d81a01dfdd176690…`, Watchlist `17f366b05532637a…` laut Meta-JSON), Start 19.10. 20:35:19Z, 9 Slots 20.10. 08:00Z bis 10:00Z im 15-Minuten-Abstand. Serie-CSV `d64fc9ea27e9cb86` (882 Zeilen: 378 Tageswerte, 504 Intraday), alle `ok`; Log: 9 Slots, 28 Abrufe, 0 nicht ok, Verspätung 0 s. Gemeinsame Auswertung mit `auswerten` über beide Serien-CSVs (Montag `9543100481aa21d9`, Dienstag `d64fc9ea27e9cb86`); Rechnungen in Python aus denselben CSVs nachvollzogen.
* **Yahoo-Tageszeile des Montags 19.10. [belegt]:** Sie war ab dem ersten Slot (08:00Z) bei allen 14 Tickern vorhanden, aber bei 13 von 14 ohne Close (nur ORG.AX, Schluss 05:00Z, war schon im Slot 08:00Z vollständig, 12,0600). Bei den 13 europäischen Tickern erschien der Close im Slot 08:45Z, in den Slots 08:00Z, 08:15Z und 08:30Z fehlte er; alle 13 gleichzeitig, danach unverändert bis 10:00Z. Der Übergang liegt also zwischen 08:30Z und 08:45Z (auf 15 Minuten genau), das sind rund 3 Stunden nach dem Börsenschluss um 15:30Z. Passt zu den früheren Messungen (ca. 08:30–09:00Z, Kurztest 17.10. 06:00Z: 13 von 14 ohne Close). Ein einziger Handelstag.
* **Vergleich der Balkenwerte mit dem Yahoo-Tagesschluss des 19.10. [belegt, Differenz des Balkens zum Tagesschluss]:** Erster Wert des letzten regulären Balkens (Slot 15:35Z, 5 Minuten nach Schluss): −0,83 % (RHM.DE) bis +0,08 % (DTE.DE, ENEL.MI); bei 11 von 13 europäischen Tickern liegt der Wert unter dem Tagesschluss. Finaler Wert (Slot 18:00Z, nach den Korrekturen von Abschnitt 10): −0,47 % (RHM.DE), −0,42 % (IFX.DE), −0,30 % (HO.PA), −0,18 % (BMW.DE) bis +0,19 % (ENEL.MI); exakt gleich bei GLEN.L und SAAB-B.ST; bei BA.L −0,05 %, UCB.BR −0,05 %, VOD.L +0,08 %, DTE.DE +0,16 %. Die nachträgliche Korrektur des Balkens (Abschnitt 10) bringt ihn also meist näher an den Tagesschluss, erreicht ihn aber nur bei zwei von 13 Tickern genau und überschreitet ihn bei einigen. Die Hypothese „Yahoo ergänzt den Auktionsschlusswert im letzten Balken“ ist damit nicht bestätigt [Hypothese verworfen oder zumindest unvollständig].
* **Balken nach Schluss [belegt]:** UCB.BR: der Balken 17:30 Ortszeit (Close 205,20) ist identisch mit dem Yahoo-Tagesschluss des 19.10. (205,20); ORG.AX: Balken 16:00 (12,06) ist identisch mit dem Tagesschluss (12,06). Bei den übrigen zwölf Tickern gab es keinen solchen Balken (auch nicht in den Dienstagsdaten). [offen] Ob der Yahoo-Tagesschluss mit dem offiziellen Börsenschlusskurs der jeweiligen Börse übereinstimmt, wurde nicht geprüft.
* **Folge für die Fragestellung (Beobachtung, keine Entscheidung):** Aus Yahoo allein ist für europäische Ticker ein vollständiger Tagesschluss erst gegen 08:45Z verfügbar; Zwischenwerte aus dem 15-Minuten-Balken stehen früher zur Verfügung, weichen aber um bis zu etwa 0,8 % (kurz nach Schluss) bzw. 0,5 % (nach 30 Minuten) vom Yahoo-Tagesschluss ab. Andere Quellen für Non-US-Ticker wurden in dieser Serie nicht gemessen (nur Yahoo); die Krypto-Börsen liefern den UTC-Tagesschluss dagegen ab 00:00Z (Abschnitt 9). Beobachtung eines einzigen Handelstags (Montag), keine Verallgemeinerung auf andere Wochentage oder Märkte.
* **Offen:** Quellen für Non-US-Schlusskurse außerhalb von Yahoo (Lizenz und Verfügbarkeit, 27.4); Wiederholung an weiteren Handelstagen; Wirkung auf den Produktionslauf nur auf Papier (Gate bleibt Entwurf, keine Umsetzung).
* Unverändert: Freeze, C1-Sperre, keine Änderung an Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Gate Papiermodell; keine Quellenentscheidung. Die Messserie des Quellenvergleichs (Krypto 17./18.10., Non-US 19. und 20.10.) ist damit abgeschlossen.

## 12. Bewertung der Messserie und geplanter nächster Schritt (Stand 20.10.2026 nachmittags; Befund, Bewertung und Plan getrennt; nur angehängt; Abschnitte 1–11 unverändert)

### 12.1 Befund (Messung; Zahlen aus Abschnitt 9 bis 11)
* Yahoo-Tageszeile des Montags 19.10.2026: Alle 13 europäischen Ticker lieferten den Close erstmals im Slot 08:45Z (in den Slots 08:00Z, 08:15Z und 08:30Z noch nicht), danach unverändert bis 10:00Z. ORG.AX war bereits im Slot 08:00Z vollständig. Erste Verfügbarkeit liegt damit bei den europäischen Tickern zwischen 08:30Z (noch nicht) und 08:45Z (ja), auf 15 Minuten genau.
* Balken: Nachträgliche Korrekturen des letzten regulären Balkens nach dem ersten Slot: +0,06 % bis +0,57 %, abgeschlossen bis 30 Minuten nach Börsenschluss (Abschnitt 10). Finale Restabweichung dieses Balkens zum Yahoo-Tagesschluss: −0,47 % bis +0,19 %; der erste Balkenwert kurz nach Schluss (Slot 15:35Z) lag bis −0,83 % unter dem Yahoo-Tagesschluss. Balken nach Schluss (UCB.BR, ORG.AX) waren identisch mit dem Yahoo-Tagesschluss.

### 12.2 Korrekturen gegenüber einer ersten Bewertung (Claude, 20.10.)
* Korrektur 1: Nicht 12, sondern alle 13 europäischen Ticker lieferten den Close erstmals im Slot 08:45Z; ORG.AX war bereits um 08:00Z vollständig.
* Korrektur 2: Die Spannen sind getrennt zu führen: Balkenkorrekturen nach Börsenschluss +0,06 % bis +0,57 %; finale Restabweichung zum Yahoo-Close −0,47 % bis +0,19 %; erster Balkenwert kurz nach Schluss bis −0,83 %.

### 12.3 Bewertung (Reviewer, von Axel am 20.10.2026 übermittelt; Axel stimmt in 12.4 zu)
* Bestätigte zeitliche Verfügbarkeit und Stabilität des Yahoo-Close für den untersuchten Handelstag (Montag), aber noch keine allgemeine Regel.
* Balkenwerte sind kein verlässlicher Ersatz für den Tagesschluss; die Ursache der Differenzen ist ungeklärt (die Hypothese „nachträglich eingerechneter Auktionsschlusswert“ ist durch Abschnitt 11 nicht bestätigt).
* Grenze: Die Messung belegt weder die Übereinstimmung mit dem offiziellen Börsenschlusskurs noch die Übertragbarkeit auf andere Handelstage, Märkte und Datenquellen. Drei Zeitpunkte sind zu trennen: erste Verfügbarkeit (belegt für diesen Tag), Stabilität (belegt für diesen Tag), Richtigkeit (offen).

### 12.4 Entscheidung Axel (20.10.2026 15:25 Uhr MESZ) und Plan
* Der Befund wird als abgeschlossene Beobachtung dokumentiert. Keine Änderung an Gate, Aggregator oder Quellenwahl.
* Reihenfolge: **zuerst** die Quellenfrage für einen unabhängigen Referenzschlusskurs klären (reine Untersuchung der Verfügbarkeit und der Nutzungsbedingungen, kein Messlauf), **danach** über die Messserie entscheiden. Grund: Eine Wiederholungsserie reproduziert Verfügbarkeit und Stabilität von Yahoo, kann aber die Richtigkeit gegenüber dem offiziellen Schlusskurs nicht beantworten.
* Entwurf der Reproduzierbarkeitsserie (**nicht freigegeben, keine Ausführung beauftragt**): drei Handelstage Mittwoch 21.10. bis Freitag 23.10.2026; unveränderte Messpunkte (Nachmittag 15:35Z bis 18:00Z und nächster Morgen 08:00Z bis 10:00Z, alle 15 Minuten); unveränderte Watchlist `17f366b05532637a` und unverändertes Skript `d81a01dfdd176690` (c3 v1.1). Die UTC-Zeiten bleiben bis einschließlich Samstag 24.10.2026 vergleichbar (Zeitumstellung in Europa Sonntag 25.10.2026, ab dem 26.10. verschieben sich die Börsenschlüsse in UTC um eine Stunde). Vor einem Start wären Befehl, Nebenwirkungen und Startzeiten vorzulegen und die Freigabe von Axel (und Reviewer) einzuholen.
* Freigabestatus: Es läuft keine Messung. Keine Änderung an Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 13. Nachtrag 20.10.2026 nachmittags: Start der Reproduzierbarkeitsserie, Eintrag zum Projektcharakter, Quellenrecherche Referenzschlusskurs (nur angehängt; Abschnitte 1–12 unverändert)

### 13.1 Reproduzierbarkeitsserie: Freigabe und Start
* **Entscheidung Axel (20.10.2026 15:28 bis 15:31 Uhr MESZ):** Die in 12.4 als Entwurf geführte Serie wird gestartet, und zwar schon am Dienstag 20.10. statt erst am Mittwoch („um keine Zeit zu verlieren“). Damit umfasst sie **vier Handelstage (Dienstag 20.10. bis Freitag 23.10.2026)** statt drei, als vier Läufe A bis D, jeder mit dem Nachmittagsfenster 15:35Z bis 18:00Z und dem Morgenfenster des Folgetags 08:00Z bis 10:00Z (je 15-Minuten-Raster, 20 Slots, 560 Abrufe je Lauf). Abweichend von der Reihenfolge in 12.4 („zuerst die Referenzquelle klären“) läuft die Quellenrecherche (13.3) parallel zur Serie. Zustimmung des Reviewers: in diesem Gespräch nicht belegt [offen].
* **Unverändert gegenüber 12.4:** c3 v1.1 (`d81a01dfdd176690`), Watchlist `17f366b05532637a`, Messpunkte; nur lesende Yahoo-Abrufe, Ausgabe nach `~/uiq-c2-lokal` (kein Git-Arbeitsverzeichnis). Die UTC-Zeiten bleiben bis einschließlich Samstag 24.10.2026 vergleichbar (europäische Zeitumstellung Sonntag 25.10.2026).
* **Lauf A gestartet (Axel, Mac, 20.10.2026 13:31:00Z):** Run-ID `20261020T133059Z`, 14 Ticker, 20 Slots von 20.10. 15:35Z bis 21.10. 10:00Z (Startzeile von Axel übermittelt; Python 3.13.1, c3 v1.1). Ergebnis ausstehend.
* **Läufe B bis D (geplant):** B (Mi 21.10. Nachmittag, Do 22.10. Morgen), C (Do 22.10., Fr 23.10.), D (Fr 23.10., Sa 24.10.). Jeder wird bis spätestens 17:30 MESZ des jeweiligen Nachmittags gestartet; ein früher Start in einem zweiten Terminal-Fenster (z. B. morgens vor der Praxis) ist zulässig, weil das Skript keine Einzelinstanz-Sperre hat, jeder Lauf eigene Dateien mit eigener Run-ID schreibt und sich die Abruffenster von Lauf A (Morgenfenster bis 10:00Z) und Lauf B (erster Slot 15:35Z) nicht überschneiden.

### 13.2 Projektcharakter und Lizenzfragen (Axel, 20.10.2026)
* **Aussage Axel:** UIQ ist derzeit ein rein privates Forschungsprojekt ohne Gewinnerzielungsabsicht; im Hinblick auf die kommerzielle Nutzbarkeit der Datenabfragen ist er „zum jetzigen Zeitpunkt sehr entspannt“. Die Lizenzfrage stellt sich für ihn erst, wenn sich dieser Charakter ändert. Er hielte UIQ auch in einer Betanutzerphase noch für ein privates Forschungsprojekt ohne Gewinnerzielungsabsicht.
* **Hinweis Claude (keine Rechtsauskunft, Nutzungsbedingungen nicht im Wortlaut geprüft):** Bei Datenanbietern ist oft nicht die Gewinnabsicht, sondern die Weitergabe von Daten oder abgeleiteten Inhalten an Dritte maßgeblich (bei Yahoo nach den im Protokoll zitierten Einordnungen „nur private Nutzung“). Ein Betatest mit fremden Nutzern, die den Digest sehen, kann deshalb auch ohne Einnahmen die Lizenzfrage berühren; die BaFin-Voranfrage ist weiterhin offen. Vorgeschlagener Auslöser für die Lizenzprüfung: Weitergabe an Dritte (z. B. Beta-Nutzer, öffentliche Ausgabe) oder Änderung des Projektcharakters. Diese Formulierung ist Claudes Vorschlag; Axels Einschätzung zur Betaphase (oben) weicht davon ab. [offen]
* **Folge:** Die Lizenzfrage ist nicht Teil der Quellenrecherche (13.3) und bleibt als geparkter Punkt bestehen.

### 13.3 Quellenrecherche Referenzschlusskurs (Desk-Research am 20.10.2026; nur Lesen von Webseiten, keine Abrufe vom Mac, keine Tests; ohne Lizenzfrage)
* **Fund zur Schlusszeit [belegt nach den Seiten der Börsen, teils nicht aktuell]:** Die in der Watchlist angenommenen Schlusszeiten (17:30 bzw. 16:30 Ortszeit) sind das Ende des fortlaufenden Handels. Der offizielle Schlusskurs entsteht in der Schlussauktion danach: London Auktion bis 16:35, Zuteilung kurz danach (Aquis); Euronext Milan Auktion 17:30 bis 17:35, Preisfeststellung 17:35:00 bis 17:35:30 (Borsa Italiana); Xetra Schlussauktion nach dem Handelsschluss, Trade-at-Close danach, genaue Zeiten im Auktionsplan (Deutsche Börse, nicht abgerufen); Euronext allgemein Auktion 17:35 (Quelle von 2007, nicht aktuell bestätigt). Der Auktionspreis entsteht damit etwa um 15:35Z, also in dem Moment, in dem unser erster Slot 15:35:05Z abgefragt wurde.
* **Folge für die Auswertung [Hypothese]:** Die in den Abschnitten 10 und 11 genannten „Minuten nach Schluss“ beziehen sich auf die angenommene Schlusszeit 15:30Z (Ende des fortlaufenden Handels), nicht auf den Auktionspreis. Die nachträgliche Korrektur des letzten Balkens und seine Restabweichung zum Yahoo-Tagesschluss sind mit einem Auktionseffekt vereinbar (letzter fortlaufender Kurs gegenüber Auktionspreis); belegt ist das nicht, weil dafür ein unabhängiger Referenzwert fehlt. Die in 11 notierte Verwerfung der Auktionshypothese ist damit nicht endgültig; sie bleibt offen.
* **Kandidaten (Angaben aus den Anbieterseiten und Foren, nicht getestet):**
  * EODHD: Free 20 Abrufe pro Tag, 1 Jahr Historie, Börsenabdeckung im Free-Plan nicht genannt; Historian 19,99 $/Monat, 100 000 Abrufe pro Tag. Laut Forum werden Börsen außer NYSE/NASDAQ 15 Minuten nach Schluss aktualisiert (aus dem Forumstext abgeleitet, für europäische Börsen nicht ausdrücklich).
  * Twelve Data: Basic (kostenlos) 8 Credits pro Minute, 800 pro Tag, nur US; EOD global ab Plan Grow (ab 29 $/Monat), Europa in Echtzeit ab Pro (99 $/Monat). Update-Zeit nicht genannt.
  * Alpha Vantage: Free 25 Abrufe pro Tag, 5 pro Minute; Abdeckung von XETRA, Euronext, ASX nicht bestätigt; Update-Zeit nicht genannt.
  * Stooq: kostenloser CSV-Download, deutsche Titel mit Endung `.DE`; Update-Zeit, Limits und Abdeckung für unsere Ticker nicht dokumentiert.
  * Börsen selbst: offizielle Schlusskurse über Webseiten und Datenprodukte; keine freie API gefunden (nicht weiter geprüft).
  * Nicht geprüft: Marketstack, Tiingo, Finnhub, Börse Frankfurt und weitere Anbieter.
* **Einordnung:** Keine dieser Quellen ist als amtlicher Börsenkurs belegt; sie wären eine zweite unabhängige Quelle, für die Richtigkeit zusätzlich Stichproben direkt von der Börse. Wenn getestet wird, dann als eigener, vorher freizugebender Schritt (Konto/Schlüssel, Befehl, Nebenwirkungen, Messpunkte).

### 13.4 Status
* Kein Test von Referenzquellen beauftragt. Lauf A läuft; Läufe B bis D stehen aus. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 14. Ergebnis Lauf A (Dienstag 20.10.2026, Reproduzierbarkeitsserie), Vergleich mit Montag 19.10.; Anregungspunkt EODHD (nur Lesen, nur angehängt; Abschnitte 1–13 unverändert)

### 14.1 Lauf A: Dateien und Technik
* Lauf `20261020T133059Z` (c3 v1.1, Watchlist `17f366b05532637a`), Fenster 20.10. 15:35Z bis 18:00Z und 21.10. 08:00Z bis 10:00Z, 20 Slots. Serie-CSV `6d8acca77fe06520` (1 960 Zeilen), alle `ok`; Log: 20 Slots mit 28 Abrufen, 0 nicht ok, Verspätung 0 s, Ende 21.10. 10:00:05Z. Auswertung mit dem Hilfsskript `tag_auswertung.py` (Handelstag je Aufruf; liest die Serien-CSVs, gleiche Zahlen für den 19.10. wie in Abschnitt 11 reproduziert).
* Lauf B (`20261021T052129Z`, Mi 21.10. Nachmittag, Do 22.10. Morgen) lief bei Abgabe der Teildateien noch (Log bis Slot 17:00Z, alle ok); Ergebnis folgt nach Ende des Laufs.

### 14.2 Yahoo-Tageszeile des Dienstags 20.10. [belegt]
* Wie am Montag: Im Morgenfenster (21.10.) war die Tageszeile des 20.10. ab dem ersten Slot (08:00Z) vorhanden, aber bei den 13 europäischen Tickern ohne Close; in den Slots 08:00Z, 08:15Z und 08:30Z hatte nur ORG.AX einen Close (1 von 14). **Im Slot 08:45Z hatten alle 13 europäischen Ticker den Close** (14 von 14), danach unverändert bis 10:00Z (14 von 14 Tickern stabil). Erste Verfügbarkeit damit an beiden bisher gemessenen Handelstagen (19.10. und 20.10.) zwischen 08:30Z und 08:45Z. Zwei Handelstage mit demselben Ergebnis; weitere Tage und andere Wochentage stehen aus.

### 14.3 Balkenwerte gegenüber dem Yahoo-Tagesschluss [belegt; Differenz des Balkens zum Tagesschluss des Tages]
* **Dienstag 20.10.:** Erster Wert des letzten regulären Balkens (Slot 15:35Z): −0,68 % (UCB.BR) bis +0,49 % (GLEN.L); nur bei 3 von 13 europäischen Tickern unter dem Tagesschluss. Finaler Wert (Slot 18:00Z): −0,55 % (UCB.BR) bis +0,35 % (TEF.MC); exakt gleich bei BMW.DE und SAAB-B.ST. Die Korrektur des Balkens zwischen erstem und finalem Wert lag zwischen −0,38 % (GLEN.L) und +0,24 % (SAAB-B.ST), mit gemischtem Vorzeichen; die letzte Änderung trat bei allen europäischen Tickern im Slot 16:00Z auf (30 Minuten nach der angenommenen Schlusszeit 15:30Z), danach unverändert.
* **Montag 19.10. zum Vergleich:** erster Wert −0,83 % bis +0,08 % (11 von 13 unter dem Tagesschluss), finaler Wert −0,47 % bis +0,19 %, alle Korrekturen positiv (+0,06 % bis +0,57 %).
* **Befund:** Die am Montag beobachtete einheitliche Aufwärtskorrektur („immer nach oben“, Abschnitt 10) ist am Dienstag **nicht reproduziert**: Vorzeichen und Größe der Korrektur und der Restabweichung wechseln von Tag zu Tag. Reproduziert sind dagegen: die Korrektur ist bis 16:00Z abgeschlossen; der finale Balkenwert weicht bei den meisten europäischen Tickern um Zehntelprozent bis gut ein halbes Prozent vom Yahoo-Tagesschluss ab (exakt gleich nur bei 2 von 13 an jedem der beiden Tage); ein Balken nach Schluss (UCB.BR 17:30, ab 16:15Z sichtbar, Close 219,00; ORG.AX 16:00, 12,05) ist an beiden Tagen identisch mit dem Yahoo-Tagesschluss.
* **Einordnung [Hypothese]:** Ein wechselndes Vorzeichen ist mit einem Auktionseffekt vereinbar (Auktionspreis kann über oder unter dem letzten fortlaufenden Kurs liegen), belegt ist das nicht; dafür fehlt weiter ein unabhängiger Referenzwert. Der Balkenwert bleibt als Ersatz für den Tagesschluss ungeeignet. Beobachtung an zwei Handelstagen, keine allgemeine Regel.

### 14.4 Anregungspunkt EODHD (für die SUITE.md-Sammlung; nur dokumentiert, `SUITE.md` unverändert; frühestens nach Dezember bzw. Go/No-Go; Angaben aus der Anbieterseite vom 20.10.2026, nicht getestet)
* Anlass (Axel, 20.10.): EODHD bietet neben Schlusskursen weitere, auch historische Finanzdaten, die für UIQ interessant sein können.
* Laut Anbieterseite: Tageskurse, Intraday (1-/5-Minuten-Historie), Live-Kurse, Dividenden und Splits; Fundamentaldaten (Fundamentals-Paket 59,99 $/Monat; ein Abruf kostet 10 Abrufe des Tageslimits), Insider-Transaktionen, Unternehmenskalender, Wirtschaftsdaten, Zinsen, historische Marktkapitalisierung, Screener, technische Indikatoren, Optionsdaten (EOD), Nachrichten; 60 Börsen, rund 150 000 Ticker; Historie über 30 Jahre bei großen US-Börsen, 15 bis 20 Jahre bei den meisten europäischen und asiatischen Märkten; Fundamentaldaten laut FAQ ab 1985 (große US-Firmen) bzw. 2000 (nicht-US). Preise (Monatszahlung): Free 0 $ (20 Abrufe pro Tag, 1 Jahr, ohne Fundamentals und Intraday), EOD Historical 19,99 $, EOD+Intraday 29,99 $, All-in-One 99,99 $.
* Mögliche Bezüge zu bestehenden Punkten: Referenzschlusskurs (Strang A), Fair-Value-Validierung (Zweitquelle für Fundamentaldaten), Event & Surprise Gate (Unternehmenskalender, Wirtschaftsdaten).
* **[offen]:** Ob die Fundamentaldaten Point-in-Time sind (frühere Stände unverändert erhalten), ob die Börsenabdeckung des Free-Plans unsere 14 Non-US-Ticker umfasst und wann EODHD Schlusskurse europäischer Börsen tatsächlich aktualisiert. Die Lizenzfrage ist nach 13.2 geparkt. Vor jeder Nutzung wäre ein eigener, vorher freizugebender Test nötig; die Point-in-Time-Regel (Konsenswerte vor dem Ereignis archivieren) gilt unabhängig von der Quelle.

### 14.5 Status
* Kein Test von Referenzquellen beauftragt. Lauf B läuft; Läufe C (Do 22.10./Fr 23.10.) und D (Fr 23.10./Sa 24.10.) stehen aus. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.
