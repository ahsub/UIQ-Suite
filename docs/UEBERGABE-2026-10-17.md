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

## 15. Ergebnis Läufe B und C (Handelstage Mittwoch 21.10. und Donnerstag 22.10.2026), Fehlstart 21.10., Aussetzer 22.10. (nur Lesen, nur angehängt; Abschnitte 1–14 unverändert)

### 15.1 Läufe: Dateien und Technik
* **Lauf B** `20261021T052129Z` (gestartet 21.10. 05:21:30Z, c3 v1.1 `d81a01dfdd176690`, Watchlist `17f366b05532637a`): Fenster 21.10. 15:35Z bis 18:00Z und 22.10. 08:00Z bis 10:00Z, 20 Slots, Ende 22.10. 10:00:18Z („ende“ im Log). Serie-CSV `1ecfa2f27fc3945e` (1 960 Zeilen), alle `ok`; Log: 20 Slots mit je 28 Abrufen, 98 Zeilen, 0 nicht ok, Verspätung 0 s. Die am 21.10. abends hochgeladene Teil-CSV (`8c539c41f8dc81df`, 1 078 Zeilen) ist damit ersetzt.
* **Lauf C** `20261021T201717Z` (gestartet 21.10. 20:17:17Z, 22:17 MESZ, früher Start mit Wartezeit bis zum ersten Slot, wie bei Lauf B): Fenster 22.10. 15:35Z bis 18:00Z und 23.10. 08:00Z bis 10:00Z, 20 Slots, Ende 23.10. 10:00:09Z. Serie-CSV `46852f688c31bff7` (1 954 Zeilen), davon 1 952 `ok` und 2 `empty` (siehe 15.4). Die Teil-CSV vom 22.10. (`a3d1497f07a54283`, 1 072 Zeilen) ist ersetzt.
* **Lauf D** `20261022T212036Z` (gestartet 22.10. 21:20:37Z, 23:20 MESZ; Fenster 23.10. 15:35Z bis 18:00Z und 24.10. 08:00Z bis 10:00Z): läuft; Ergebnis folgt nach Ende (Sa 24.10. ca. 12:05 MESZ).
* Auswertung wie in 14: `tag_auswertung.py` (`79fb975c307c2060`, Axel committed es am 21.10. nach `ahsub/uiq-devtools` unter `datenreife/`, Commit `af6f4a4`; von mir am 21.10. per Hash gegen den Klon verifiziert, zusammen mit c3 `d81a01dfdd176690` und c2_zeitverlauf `efa2174ed6caed25`).

### 15.2 Fehlstart `20261021T200823Z` (21.10. 22:08 MESZ)
* Axel glaubte, das Fenster von Lauf B versehentlich geschlossen zu haben, und startete nach meinem Neustart-Befehl einen Lauf nur mit dem Morgenfenster 22.10. 08:00Z bis 10:00Z (Startzeile `Serie 20261021T200823Z`, 9 Slots, 20:08:23Z). Die Prüfung der Prozessliste (22:06 und 22:10 MESZ) zeigte, dass Lauf B (PID 74657, Terminal s001) lief, das geschlossene Fenster war ein anderes (vermutlich das von Lauf A, bereits beendet). Der Neustart (PID 41041) wurde auf meine Anweisung beendet; die Prozessliste um 22:15 MESZ zeigt nur noch Lauf B.
* Der Fehlstart hat keinen Slot gemessen (erster Slot wäre 22.10. 08:00Z gewesen); seine Dateien (Meta und Log mit der Startzeile, evtl. leere CSV) liegen in `~/uiq-c2-lokal` und gehen nicht in die Auswertung ein. Hochgeladen wurden sie nicht [offen, ob sie angelegt wurden]. Ursache: Missverständnis bei einem geschlossenen Fenster; ein Doppelstart mit derselben Run-ID hat nicht stattgefunden (die doppelte Ausgabe in Axels Nachricht war ein doppeltes Einfügen).

### 15.3 Mittwoch 21.10. (Lauf B) [belegt]
* **Verfügbarkeit des Yahoo-Tagesschlusses:** im Morgenfenster 22.10. bei den 13 europäischen Tickern im Slot 08:45Z (14 von 14 mit Close), davor 08:00Z bis 08:30Z nur ORG.AX (1 von 14); danach unverändert bis 10:00Z (14 von 14 stabil).
* **Letzter regulärer 15-Minuten-Balken gegen den Tagesschluss:** erster Wert (Slot 15:35Z) −0,51 % bis +0,23 % (5 von 13 europäischen Tickern unter dem Tagesschluss); finaler Wert −0,30 % bis +0,35 %, exakt gleich nur bei SAAB-B.ST (1 von 13). Korrektur zwischen erstem und finalem Wert −0,33 % (UCB.BR) bis +0,61 % (RHM.DE), gemischtes Vorzeichen; letzte Änderung bei 12 von 13 im Slot 16:00Z (bzw. früher), bei DTE.DE im Slot 15:45Z.
* Balken nach Schluss: UCB.BR 17:30 (ab 16:15Z) 213,00 und ORG.AX 16:00 (ab 15:35Z) 12,05, beide exakt gleich dem Yahoo-Tagesschluss.

### 15.4 Donnerstag 22.10. (Lauf C) [belegt, wo nicht anders gekennzeichnet]
* **Verfügbarkeit des Yahoo-Tagesschlusses:** im Morgenfenster 23.10. wieder im Slot 08:45Z für alle 13 europäischen Ticker, ORG.AX ab 08:00Z; stabil bis 10:00Z (14 von 14). **Ausnahme:** siehe unten (zwei Ticker bereits im Slot 16:00Z am 22.10.).
* **Balken gegen den Tagesschluss:** erster Wert −0,49 % bis +0,22 % (6 von 13 unter dem Tagesschluss); finaler Wert −0,52 % bis +0,17 %, exakt gleich bei 2 von 13 (DTE.DE und SAAB-B.ST); Korrektur −0,35 % (UCB.BR) bis +0,16 % (SAAB-B.ST), gemischtes Vorzeichen. Balken nach Schluss (UCB.BR 17:30: 259,10; ORG.AX 16:00: 12,09) wieder exakt gleich dem Yahoo-Tagesschluss.
* **Aussetzer im Slot 16:00Z (22.10.):** Für IFX.DE und DTE.DE lieferte der Intraday-Abruf `empty` („keine Intraday-Balken“, Abrufdauer rund 10 s); das Log vermerkt „92 Zeilen, nicht ok 2“. Alle anderen Slots der Serie sind lückenlos. Für diese zwei Ticker fehlt damit der 16:00Z-Balken: die Aussage „letzte Änderung“ (Spalte der Auswertung) ist bei ihnen nur auf die vorhandenen Slots bezogen (DTE.DE ohne Änderung, IFX.DE 16:15Z), also unscharf.
* **Auffälligkeit [belegt]:** Im selben Slot enthielt die tägliche Yahoo-Antwort für IFX.DE und DTE.DE bereits eine Zeile des laufenden UTC-Tages (22.10.) mit einem Close (IFX.DE 49,885; DTE.DE 26,18); der tägliche Abruf dauerte 11,7 s bzw. 11,5 s. Beide Werte sind identisch mit dem Yahoo-Tagesschluss, der am Folgemorgen ab 08:45Z gilt (stabil, kein Unterschied). Bei den übrigen 12 Tickern gab es im Slot 16:00Z keine Zeile des 22.10., und in keinem anderen Slot der Serie. Das widerspricht in diesem Einzelfall der Annahme aus der Abrufkonstruktion (heutiger UTC-Tag ausgeschlossen, `end` exklusiv).
* **[Hypothese]:** Eine verzögerte oder abweichende Yahoo-Antwort in diesem Slot (beide Abrufe langsam, Intraday leer, Tageszeile mit Wert des Tages); die Ursache ist nicht belegt. **[offen]:** ob das wiederkehrt (Lauf D) und ob der Wert in dieser Form im Produktivpfad ankäme; ein einzelner Fall.
* **Folge für die Auswertung:** In der Zählung „erster Slot mit Close je Ticker“ erscheinen für den 22.10. 11 Ticker bei 08:45Z, 2 bei 16:00Z (die beiden Ausnahmeticker) und ORG.AX bei 08:00Z; für die Aussage zur Verfügbarkeit ist der Slot 16:00Z als Ausnahme zu behandeln, nicht als zweite Verfügbarkeitsgrenze. Die Zahl „13 von 13 bei 08:45Z“ gilt für den Morgen nach dem Handelstag weiterhin (die zwei Ticker hatten den Close dort ebenfalls, unverändert).

### 15.5 Zwischenbilanz: vier Handelstage (Mo 19., Di 20., Mi 21., Do 22.10.) [belegt, Beobachtung, keine allgemeine Regel]
* **Verfügbarkeit:** Yahoo-Tagesschluss der 13 europäischen Ticker an allen vier Tagen im Slot 08:45Z (nicht in 08:30Z), danach stabil; ORG.AX (AU) an allen vier Tagen ab 08:00Z (bis dahin keine feinere Messung). Das Ergebnis ist reproduziert (vier Tage, Montag bis Donnerstag); Freitag (Lauf D, Messung am Samstag 24.10.) steht aus, ebenso ein Wochenende/Feiertag und die Zeit nach der Zeitumstellung (25.10.).
* **Balken als Ersatz:** an allen vier Tagen ungeeignet: finaler Wert weicht um bis zu etwa ein halbes Prozent ab (−0,55 % bis +0,35 % über die Tage), exakt gleich nur bei 1 bis 2 von 13 Tickern pro Tag; Vorzeichen der Korrektur wechselt (Montag einheitlich positiv, danach gemischt); Balken nach Schluss (UCB.BR, ORG.AX) stimmen an allen Tagen exakt mit dem Tagesschluss überein.
* **Auktionshypothese:** unverändert [Hypothese, nicht belegt]; ohne unabhängigen Referenzwert nicht prüfbar.
* **Einmaliger Datenausfall:** in den Läufen A bis C (60 Slots) ein Slot mit zwei leeren Intraday-Abrufen (15.4); alle übrigen Abrufe `ok`.

### 15.6 Status
* Kein Test von Referenzquellen beauftragt (EODHD und weitere Kandidaten unverändert Desk-Research, 13.3 und 14.4). Lauf D läuft (Fenster Fr 23.10. 15:35Z bis 18:00Z und Sa 24.10. 08:00Z bis 10:00Z). Danach: Auswertung von Lauf D, Abschlussabschnitt der Serie, README für `datenreife/` in `uiq-devtools` (nur auf Axels Go, ohne Roh-CSVs im öffentlichen Repo) und die Planung der Nachtmessungen nach der US-Zeitumstellung (01.11.). `~/uiq-c2` bleibt bis zum Ende von Lauf D unangetastet. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 16. Ergebnis Lauf D (Freitag 23.10.2026) und Lauf E (Montag 26.10.2026, erster Handelstag nach der europäischen Zeitumstellung); Korrektur zu 15.4 (nur angehängt; Abschnitte 1–15 unverändert)

### 16.1 Läufe: Dateien und Technik
* **Lauf D** `20261022T212036Z` (c3 v1.1 `d81a01dfdd176690`, Watchlist `17f366b05532637a`), Fenster 23.10. 15:35Z bis 18:00Z und 24.10. 08:00Z bis 10:00Z, 20 Slots, Ende 24.10. 10:00:00Z. Serie-CSV `ad34f77c05af2e05` (1 330 Zeilen). **Nachmittag 23.10.: 11 Slots ohne Fehler** (je 28 Abrufe, 98 Zeilen, 0 nicht ok, Verspätung 0 s). **Morgenfenster 24.10. 08:00Z bis 10:00Z: alle 9 Slots ohne Daten** (je 28 Abrufe, 28 Zeilen, 28 nicht ok; je Slot 14 × `fetch_failed` „keine Daten“ beim Tagesabruf und 14 × `empty` „keine Intraday-Balken“). Die Prozesse liefen weiter und schrieben die Fehlzeilen (Prozessliste 24.10. 09:36 MESZ: beide Läufe aktiv); die Zeitstempel der Fehlslots (jeweils exakt zur Slotsekunde, kein Abrufaufwand) passen zu einer fehlenden Netzverbindung am Mac. Axel meldete am 24.10. um 09:33 MESZ, der Rechner sei „versehentlich vom Netz getrennt“ worden; der Zusammenhang zwischen dieser Meldung und den Fehlslots ist plausibel, der genaue Zeitraum der Trennung ist nicht belegt [offen].
* **Folge [belegt]:** Die Verfügbarkeit des Yahoo-Tagesschlusses vom **Freitag 23.10.** wurde **nicht gemessen** (der Freitag wäre der erste Test eines Freitags und des Wochenendübergangs gewesen). Der Nachmittag des Freitags (Balkenwerte) liegt vollständig vor.
* **Lauf E** `20261023T204403Z` (gestartet 23.10. 20:44:03Z, früher Start mit Wartezeit; zweite Fassung mit Morgenfenster ab 07:00Z, siehe 16.2), Fenster 26.10. 16:35Z bis 19:00Z und 27.10. 07:00Z bis 10:00Z, 24 Slots, Ende 27.10. 10:00:12Z. Serie-CSV `f8c0d6f75727faa3` (2 353 Zeilen inkl. Kopf, 2 352 Datenzeilen), alle `ok`; Log: 24 Slots mit je 28 Abrufen, 98 Zeilen, 0 nicht ok, Verspätung 0 s.
* Teildateien von Lauf E und vom Fehlstart vom 24.10. (nur Startzeilen) sind durch diese Dateien ersetzt.

### 16.2 Fehlstart `20261023T203942Z` (23.10. 22:39 MESZ)
* Axel startete Lauf E zunächst in der ersten Fassung mit Morgenfenster 27.10. 08:00Z bis 10:00Z (20 Slots, Startzeile `Serie 20261023T203942Z`, 20:39:42Z), vor meiner Empfehlung eines früheren Morgenfensters (ab 07:00Z, falls Yahoo den Tagesschluss nach der Umstellung an der Ortszeit festmacht, also eine Stunde früher). Auf meine Anweisung wurde der Prozess (PID 68167) mit `kill` beendet (Prozessliste 23.10. 22:43 MESZ: nur noch Lauf D), danach startete Axel die zweite Fassung (`20261023T204403Z`, Startzeile 22:44 MESZ, 24 Slots). Der Fehlstart hat keinen Slot gemessen; seine Meta-Datei, sein Log und seine CSV (nur Kopfzeile) liegen vor und gehen nicht in die Auswertung ein.

### 16.3 Montag 26.10. (Lauf E): erster Handelstag nach der Zeitumstellung [belegt]
* **Zeiten:** Seit Sonntag 25.10. gilt in Europa die Winterzeit; die Börsenschlüsse der europäischen Ticker liegen jetzt um 16:30Z (bisher 15:30Z). Die Slots wurden entsprechend ab 16:35Z gesetzt.
* **Verfügbarkeit des Yahoo-Tagesschlusses (Tageszeile des 26.10., Morgenfenster 27.10.):** In den Slots 07:00Z bis 08:45Z hatte nur ORG.AX einen Close (1 von 14, bereits im ersten Slot 07:00Z; ORG.AX schloss in der früheren Serie ab 08:00Z, dort war der erste Slot 08:00Z). **Im Slot 09:00Z hatten alle 13 europäischen Ticker den Close** (14 von 14), danach unverändert bis 10:00Z (14 von 14 stabil). Gegenüber den vier Handelstagen vor der Umstellung (Slot 08:45Z, in 08:30Z noch nicht) ist das **ein Slot später (09:00Z statt 08:45Z)**, die Grenze liegt hier zwischen 08:45Z und 09:00Z.
* **Einordnung:** Die Ortszeit-Hypothese (Yahoo füllt den Close in Ortszeit zum gleichen Zeitpunkt wie vor der Umstellung, also 07:45Z) ist damit widerlegt: um 07:45Z war der Close nicht da. Ebenso unwahrscheinlich ist ein fester Abstand zum Börsenschluss (dann wäre 09:45Z zu erwarten). Beobachtet ist ein Zeitpunkt, der in UTC nahe dem bisherigen liegt (08:45Z bis 09:00Z); die Abweichung um einen Slot ist an einem Tag nicht von Tagesschwankung zu trennen. **Ein Handelstag nach der Umstellung, keine allgemeine Regel [offen]:** weitere Tage nach der Umstellung stehen aus.
* **Letzter regulärer 15-Minuten-Balken gegen den Tagesschluss:** erster Wert (Slot 16:35Z) −0,70 % (UCB.BR) bis +0,58 % (IFX.DE), 4 von 13 unter dem Tagesschluss; finaler Wert −0,60 % (BA.L) bis +0,56 % (IFX.DE), exakt gleich nur bei SAAB-B.ST (1 von 13). Korrektur −0,50 % (TEF.MC) bis +0,22 % (UCB.BR), gemischtes Vorzeichen; letzte Änderung bei allen im Slot 16:45Z oder 17:00Z (15 bis 30 Minuten nach dem neuen Schluss 16:30Z), wie vor der Umstellung (damals 16:00Z bei Schluss 15:30Z). Balken nach Schluss: UCB.BR 17:30 (ab 17:15Z) 270,30 und ORG.AX 16:00 (ab 16:35Z) 12,09, beide exakt gleich dem Yahoo-Tagesschluss.

### 16.4 Freitag 23.10. (Lauf D, Balken) [belegt; ohne Verfügbarkeitsmessung, siehe 16.1]
* Erster Wert des letzten regulären Balkens (Slot 15:35Z) −1,58 % (UCB.BR) bis +0,12 % (TEF.MC), 11 von 13 europäischen Tickern unter dem Tagesschluss; finaler Wert −0,88 % (UCB.BR) bis +0,20 % (TEF.MC), exakt gleich nur bei SAAB-B.ST (1 von 13). **Korrektur zwischen erstem und finalem Wert 0 % bis +0,71 %, bei keinem Ticker negativ** (nur nach oben oder unverändert), letzte Änderung im Slot 16:00Z (HO.PA 15:45Z). Das entspricht dem Montag 19.10. (Abschnitt 10); Dienstag bis Donnerstag hatten gemischte Vorzeichen. Balken nach Schluss (UCB.BR 17:30: 272,70; ORG.AX 16:00: 12,18) wieder exakt gleich dem Tagesschluss. Die Balkenabweichungen sind am Freitag etwas größer (UCB.BR −0,88 % im Endwert) als an den anderen Tagen; ein Muster ist mit sechs Tagen nicht belegt.

### 16.5 Korrektur zu 15.4: die Tageszeile des laufenden Tages in Einzelslots ist ein Fallback-Effekt der Abruffunktion [belegt]
* In 15.4 stand als [Hypothese] „verzögerte oder abweichende Yahoo-Antwort“ und als offen die Ursache der Tageszeile des laufenden UTC-Tags in einzelnen Slots. Der Vorfall hat sich am 26.10. wiederholt (Lauf E, Slot 17:45Z): bei **SAAB-B.ST und UCB.BR** enthielt die Tagesantwort bereits die Zeile des 26.10. mit genau dem späteren Tagesschluss (651,90 bzw. 270,30), der Tagesabruf dauerte 11,2 s (in Lauf E sonst Median 0,9 s, 95 % unter 3,9 s, höchstens 7,6 s). Intraday war diesmal in Ordnung (kein `empty`).
* **Ursache [belegt aus Code und CSV]:** `fetch_yahoo_daily` in c3 probiert drei Versuche nacheinander: (1) `start=jetzt−730 Tage, end=heutiges UTC-Datum exklusiv`, (2) `period="1y"`, (3) `period="6mo"`. Versuch (2) und (3) haben **kein `end`**, die Antwort enthält dort die Zeile des laufenden Tages. Die Spalte `flags` der CSV trägt den Versuch: In allen Serien (Kurztest bis Lauf E) ist `versuch=1y_fallback` genau in diesen zwei Fällen aufgetreten (22.10. 16:00Z IFX.DE und DTE.DE; 26.10. 17:45Z SAAB-B.ST und UCB.BR, je 3 Zeilen), sonst überall `versuch=2y_explicit`. Der erste Versuch scheiterte also bei diesen vier Abrufen (Dauer um 11 s, Ursache des Scheiterns nicht bekannt, vermutlich Zeitüberschreitung oder leere Antwort [Hypothese]), der Fallback lieferte die Zeile des laufenden Tages. Damit ist die frühere Annahme „heutiger UTC-Tag wird durch die Abrufkonstruktion ausgeschlossen“ nur für Versuch (1) richtig; sie gilt nicht für die Fallbacks.
* **Folge für die Auswertung:** Diese vier Fälle sind **keine Verfügbarkeitsbefunde von Yahoo**, sondern eine Eigenschaft unseres Abrufs. Für die Verfügbarkeit zählen nur Zeilen aus Versuch (1). Die Zählung „erster Slot mit Close“ der Auswertung enthält diese Fälle als frühe Slots (für den 22.10. und den 26.10. je 2 Ticker); die in 15.5 und 16.3 genannte Verfügbarkeit (08:45Z bzw. 09:00Z) bezieht sich auf die übrigen Abrufe und wird dadurch nicht verändert. Das Hilfsskript `tag_auswertung.py` unterscheidet noch nicht nach Versuch; ein Filter auf `versuch=2y_explicit` wäre eine kleine Änderung (Hash ändert sich, daher nur auf Axels Go).
* **[offen]:** Ob der Produktivpfad (`market_aggregator.py`, u. a. `fetch_batch` mit `period="1y"`) ähnlich eine Zeile des laufenden Tages liefern kann; dazu wurde nichts geprüft (Freeze, nur Lesen möglich, auf Axels Go).

### 16.6 Zwischenbilanz Verfügbarkeit (Beobachtung, keine allgemeine Regel)
* Yahoo-Tagesschluss der 13 europäischen Ticker: Montag 19. bis Donnerstag 22.10. (Sommerzeit) im Slot 08:45Z; Montag 26.10. (Winterzeit) im Slot 09:00Z. ORG.AX (AU): an allen Tagen im ersten Slot des Morgenfensters (bis 22.10. 08:00Z, am 26.10. 07:00Z). Freitag 23.10. ungemessen (Netzausfall), Wochenende und Feiertag ungemessen, weitere Tage nach der Umstellung ungemessen.
* Balken als Ersatz des Tagesschlusses bleibt ungeeignet (finale Abweichung bis −0,88 % bis +0,56 % über sechs gemessene Handelstage, exakt gleich nur bei 1 bis 2 von 13); Balken nach Schluss stimmen an allen sechs Tagen exakt mit dem Tagesschluss überein.

### 16.7 Status und offene Entscheidungen
* Keine Messung läuft. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell. `~/uiq-c2` kann jetzt wieder angefasst werden (Lauf D und E beendet); c3 und `tag_auswertung.py` bleiben bis zu einer Entscheidung unverändert.
* **Zur Entscheidung durch Axel (Vorschläge, nichts beauftragt):** (a) zusätzlicher Verfügbarkeitslauf nur mit Morgenfenster Mi 28.10. 07:00Z bis 10:00Z (zweiter Handelstag nach der Umstellung, Dienstag 27.10.), 13 Slots; (b) Wiederholung für einen Freitag (Nachmittag Fr 30.10., Morgenfenster Sa 31.10.), um die Lücke vom 23.10. zu schließen; (c) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (d) README für `datenreife/` in `uiq-devtools`; (e) Nachtmessungen US nach dem 01.11. (02./03. und 03./04.11., Fenster 00:10Z bis 04:30Z, Befehl vorher eigens).

## 17. Ergebnis Lauf F (Morgenfenster Mittwoch 28.10.2026, Tageszeile des Dienstags 27.10.) (nur angehängt; Abschnitte 1–16 unverändert)

### 17.1 Lauf und Technik
* **Lauf F** `20261027T194812Z` (gestartet 27.10. 19:48:13Z = 20:48 MEZ, c3 v1.1 `d81a01dfdd176690`, Watchlist `17f366b05532637a`), nur Morgenfenster 28.10. 07:00Z bis 10:00Z, 13 Slots, Ende 10:00:05Z („ende“ im Log). Serie-CSV `62e585fd2230a584` (1 274 Datenzeilen), alle `ok`; Log: 13 Slots mit je 28 Abrufen, 98 Zeilen, 0 nicht ok, Verspätung 0 s. Alle Tagesabrufe mit `versuch=2y_explicit` (546 von 546), **kein Fallback beteiligt**. Beauftragt von Axel auf Empfehlung des Reviewers (Priorität 1 der Abschnitt-16-Liste, Abschnitt 16.7 (a)); Messung nur des Morgenfensters, kein Nachmittag (der Handelstag 27.10. wurde nicht am Nachmittag gemessen).

### 17.2 Yahoo-Tagesschluss der Tageszeile 27.10. [belegt]
* In den Slots 07:00Z bis 08:30Z hatte nur ORG.AX einen Close (1 von 14, bereits im ersten Slot 07:00Z). **Im Slot 08:45Z hatten alle 13 europäischen Ticker den Close** (14 von 14), danach unverändert bis 10:00Z (14 von 14 stabil). Also **wieder 08:45Z**, nicht 09:00Z wie am Montag 26.10. (Abschnitt 16.3).
* **Einordnung:** Von sechs gemessenen Handelstagen liegt der erste Zeitpunkt an fünf im Slot 08:45Z (19., 20., 21., 22. und 27.10.), an einem im Slot 09:00Z (26.10.); 23.10. ist ungemessen. Die beiden Handelstage nach der Zeitumstellung (26. und 27.10.) unterscheiden sich um einen Slot. Der Befund vom 26.10. („ein Slot später als vor der Umstellung“) ist damit **nicht reproduziert** und als Einzelabweichung um 15 Minuten zu lesen; die Ortszeit-Hypothese (07:45Z) bleibt widerlegt (an beiden Tagen nach der Umstellung war der Close um 07:45Z nicht da). **[Hypothese]:** Der Zeitpunkt hängt an einer Yahoo-Aktualisierung in UTC (etwa 08:30Z bis 09:00Z) und nicht an Börsenschluss oder Ortszeit; belegt ist nur die Beobachtung an sechs Tagen. **[offen]:** Freitag, Wochenende und Feiertag.
* Der Auswertungsteil der Balken in der Ausgabe von `tag_auswertung.py` ist für den 27.10. nicht verwertbar (es gibt keine Nachmittagsslots des 27.10.) und wird nicht ausgewertet.

### 17.3 Status
* Keine Messung läuft. Offen zur Entscheidung durch Axel (nichts beauftragt): Freitagswiederholung (Nachmittag Fr 30.10. 16:35Z bis 19:00Z, Morgenfenster Sa 31.10. 07:00Z bis 10:00Z; Befehl wird vorher vorgelegt), Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash), README für `datenreife/`, US-Nachtmessungen 02./03. und 03./04.11. (Befehl vorher eigens). Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 18. Ergebnis Lauf G (Morgenfenster Samstag 31.10.2026, Tageszeile des Freitags 30.10.) und Zwischenfazit Verfügbarkeit (nur angehängt; Abschnitte 1–17 unverändert)

### 18.1 Lauf und Technik
* **Lauf G** `20261028T220244Z` (gestartet 28.10. 22:02:45Z = 23:02 MEZ, c3 v1.1 `d81a01dfdd176690`, Watchlist `17f366b05532637a`), nur Morgenfenster 31.10. 07:00Z bis 10:00Z, 13 Slots, Ende 10:00:14Z („ende“ im Log). Serie-CSV `e4a0b507b18bdab9` (1 274 Datenzeilen), alle `ok`; Log: 13 Slots mit je 28 Abrufen, 98 Zeilen, 0 nicht ok, Verspätung 0 s. Alle Tagesabrufe `versuch=2y_explicit` (546 von 546), kein Fallback. Beauftragt von Axel am 28.10. auf Empfehlung (Samstagsmessung zur Messung des Freitags, 16.7 (b) in der schlanken Fassung ohne Nachmittag). Axel lud zuerst einen Zwischenstand (3 von 13 Slots) hoch, ersetzt durch die vollständigen Dateien.

### 18.2 Yahoo-Tagesschluss der Tageszeile 30.10. (Freitag) [belegt]
* In den Slots 07:00Z bis 08:45Z hatte nur ORG.AX einen Close (1 von 14, im ersten Slot 07:00Z). **Im Slot 09:00Z hatten alle 13 europäischen Ticker den Close** (14 von 14), danach unverändert bis 10:00Z (14 von 14 stabil, kein Ticker mit wechselndem Wert). Der Freitag, abgefragt am Samstagmorgen, verhält sich damit nicht auffällig anders als die Wochentage; ein Wochenende zwischen Handelstag und Abruf ändert den Zeitpunkt nicht (Samstag, einen Tag nach dem Handelstag).

### 18.3 Zwischenfazit Verfügbarkeit: sieben gemessene Handelstage [belegt als Beobachtung, keine allgemeine Regel]
* Erster Slot mit Close der 13 europäischen Ticker, nach Handelstag: Mo 19.10., Di 20., Mi 21., Do 22. (Sommerzeit) je **08:45Z**; Mo 26.10. **09:00Z**; Di 27.10. **08:45Z**; Fr 30.10. **09:00Z** (Winterzeit ab 25.10.). Damit liegt der Zeitpunkt an allen sieben Tagen **zwischen 08:30Z (noch nicht da) und 09:00Z (da)**; an fünf Tagen im Slot 08:45Z, an zwei im Slot 09:00Z. Freitag 23.10. blieb ungemessen (Netzausfall, 16.1), dafür liegt jetzt der Freitag 30.10. vor. ORG.AX (AU) an allen Tagen im ersten Slot des Morgenfensters (bis 22.10. 08:00Z, danach 07:00Z).
* **Muster nach der Umstellung [Hypothese, nicht belegt]:** Vor der Umstellung 4 von 4 Tagen im Slot 08:45Z, danach 1 von 3 (zwei Tage im Slot 09:00Z). Ein Unterschied von höchstens einem Slot (15 Minuten) ist bei sieben Tagen nicht von Tagesschwankung zu trennen; ein fester Verschiebungseffekt der Zeitumstellung ist weder belegt noch ausgeschlossen. Die Ortszeit-Hypothese (07:45Z) bleibt an allen Tagen nach der Umstellung widerlegt.
* **Praktische Folge für das Papiermodell des Gates [Vorschlag Claude, nicht entschieden]:** Frühester sicherer Zeitpunkt, an dem an allen bisher gemessenen Tagen die europäischen Tageszeilen vollständig waren, ist **09:00Z**; für eine Reserve gegen Tagesschwankung wäre ein Zeitpunkt nach 09:00Z (z. B. 09:15Z oder später) zu wählen. Gemessen wurden nur Yahoo-Tageszeilen von 14 Non-US-Tickern in einem Zeitraum von drei Wochen; Feiertage, Halbtage und andere Märkte sind nicht abgedeckt. Eine Aussage zur Richtigkeit des Schlusskurses folgt daraus nicht (kein unabhängiger Referenzwert).

### 18.4 Status
* Keine Messung läuft. Die Europa-Reihe zur Datenreife (Läufe A bis G) ist damit für die Verfügbarkeitsfrage abgeschlossen; offen bleiben: Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (nur auf Axels Go, neuer Hash), README für `datenreife/` in `uiq-devtools`, **US-Nachtmessungen** nach der US-Zeitumstellung (02./03. und 03./04.11., Fenster 00:10Z bis 04:30Z, US-Watchlist `4ae78a056ea74362`, Skript c2_zeitverlauf `efa2174ed6caed25`; Befehl wird vorher eigens vorgelegt) sowie die getrennt zu führende Frage nach einer unabhängigen Referenzquelle (EODHD u. a., Desk-Research 13.3/14.4, kein Test beauftragt). Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 19. Ergebnis der US-Nächte nach der US-Zeitumstellung (Handelstage Mo 02.11. und Di 03.11.2026) (nur angehängt; Abschnitte 1–18 unverändert)

### 19.1 Läufe und Technik
* Werkzeug `c2_zeitverlauf.py` v2 (`efa2174ed6caed25`), Watchlist `watchlist_us_20261015_v2.csv` (`4ae78a056ea74362`, 47 Ticker), Hashes auf Axels Mac am 31.10.2026 geprüft. Beide Nächte mit Fenster 00:10Z bis 04:30Z im Abstand von 10 Minuten (27 Slots); die Börse in New York schließt seit der US-Zeitumstellung (Sonntag 01.11.2026) um 21:00Z statt 20:00Z.
* **Nacht 1** `20261102T215430Z` (Handelstag Montag 02.11., gestartet 02.11. 21:54:30Z = 22:54 MEZ): alle 27 Slots ohne Abruffehler, Median der Abrufdauer 0,6 s bis 0,7 s, Verspätung 0 s, Ende 03.11. 04:30:09Z. Serie-CSV `95ec7e60b26d0eaa` (1 269 Datenzeilen). D27-CSV vorhanden (SPY-5d-Probe: Label gleich dem Handelstag 02.11. in allen Slots, Differenz zur SPY-Zeile 0).
* **Nacht 2** `20261104T012420Z` (Handelstag Dienstag 03.11., Wahltag in den USA, Börse geöffnet): Der Lauf startete erst um 01:24:20Z (Startzeile des Logs); die ersten 7 Slots (00:10Z bis 01:10Z) wurden mit dem Log-Vermerk „übersprungen“ markiert und nicht gemessen. Gemessen sind 20 Slots (01:20Z bis 04:30Z), der erste mit 261 s Verspätung, alle ohne Abruffehler, Ende 04:30:08Z. Serie-CSV `49e014e0a34e9797` (940 Datenzeilen). Die Messung ab 00:10Z fehlt damit für diese Nacht; warum der Lauf erst um 01:24Z begann, ist hier nicht belegt [offen].
* Abruffolge: Je Nacht liefen einzelne Tagesabrufe über `versuch=1y_fallback` (Nacht 1: WMT, HD, CAT und GE im Slot 00:10Z, Abrufdauer rund 12 s; Nacht 2: GE, UNH und MA im Slot 03:40Z, rund 10,5 s). Die Zeile des Handelstags war dabei vorhanden und entspricht dem Zustand der übrigen Ticker im selben Slot (Fallback-Effekt wie in 16.5, hier ohne Folge für die Aussagen unten).

### 19.2 Ergebnis [belegt, je Slot: V = Zeile des Handelstags da und Close gültig, L = Zeile da, Close leer, F = Zeile des Handelstags fehlt]
* **Nacht 1 (Handelstag Mo 02.11.):** Slots **00:10Z bis 00:50Z: 47 von 47 V**; Slots **01:00Z bis 02:20Z: 47 von 47 L** (Close leer, Zeile des Handelstags aber da); Slots **ab 02:30Z bis 04:30Z: 47 von 47 V**, danach unverändert. Der Verlauf ist für alle 47 Ticker einschließlich SPY, QQQ und ETF identisch (kein Nachzügler, kein einzelner Ticker mit abweichender Zeit). Kein F in der ganzen Nacht.
* **Nacht 2 (Handelstag Di 03.11.), ab 01:20Z gemessen:** Slots **01:20Z bis 02:20Z: 47 von 47 L**; Slots **ab 02:30Z bis 04:30Z: 47 von 47 V**, danach unverändert. Gleiches Muster wie Nacht 1, ebenfalls für alle 47 Ticker im Gleichschritt.
* **Werte:** Der Close in den frühen V-Slots (Nacht 1, 00:10Z bis 00:50Z) ist bei allen 47 Tickern identisch mit dem Endwert ab 02:30Z; der Close wechselt über die Nacht also nicht. **Das Volumen ist in der frühen Phase nicht endgültig:** Es unterscheidet sich bei allen 47 Tickern vom Endwert (00:10Z gegenüber 04:30Z: −0,03 % bis 9,99 % des Endwerts, Median 0,77 %) und ändert sich ein weiteres Mal beim Wechsel von L zu V (Beispiel AAPL: 58,2 Mio. um 00:10Z, 64,7 Mio. in der L-Phase, 63,8 Mio. ab 02:30Z). In beiden Nächten sind Close und Volumen ab 02:30Z bis 04:30Z bei allen 47 Tickern unverändert (47 von 47).
* Rückfälle im Sinne der Oktobernächte (einzelne Ticker, die nach V wieder unvollständig werden) gab es nicht; die L-Phase betrifft alle Ticker gleichzeitig und endet bei allen im selben Slot.

### 19.3 Vergleich mit den Oktobernächten (Abschnitte 22 bis 25 der Sammlung; EDT, Schluss 20:00Z) [belegt als Beobachtung]
* Oktober: Vollständigkeit aller 47 Ticker (bzw. 46 von 47) **ab 01:40Z** (in Slot 01:30Z noch nicht), in zwei von drei Nächten ein früher Übergang um 00:30Z bis 00:40Z (in der Nacht 15./16.10. 44 von 47 Titeln von 00:40Z bis 01:30Z), Nachzügler META, ETSY, FIVE und SHEL. November: Vollständigkeit aller 47 Ticker **ab 02:30Z** (in Slot 02:20Z noch nicht), also **50 Minuten später als im Oktober** (Grenze: Oktober zwischen 01:30Z und 01:40Z, November zwischen 02:20Z und 02:30Z; bei 10-Minuten-Raster zwischen 40 und 60 Minuten). Das entspricht der Verschiebung des US-Börsenschlusses um eine Stunde.
* **Neu im November:** eine Phase mit leerem Close bei allen Tickern (01:00Z bis 02:20Z), die in den Oktobernächten nicht beobachtet wurde, und davor (00:10Z bis 00:50Z) eine Phase mit gültigem Close und vorläufigem Volumen bei allen 47 Tickern (Nacht 1). In den Oktobernächten lag der erste Slot (00:10Z) bereits 10 Minuten nach 00:00Z = 20:10 ET; die Zeit vor 20:00 ET war damit nicht gemessen.
* **[Hypothese, nicht belegt]:** Die Zeitpunkte hängen an der Uhr in New York (Östliche Zeit) und nicht an der UTC-Uhr: Das Ende der L-Phase liegt in beiden Jahreszeiten bei etwa 21:30 ET (Oktober 21:30 bis 21:40 EDT, November 21:20 bis 21:30 EST), der Beginn der L-Phase im November bei etwa 20:00 ET (zwischen 00:50Z und 01:00Z = 19:50 bis 20:00 EST; im Oktober läge er bei 00:00Z, vor dem ersten Slot). Zwei Nächte nach der Umstellung, eine davon ab 01:20Z, tragen diese Aussage nicht allein. **Im Gegensatz dazu** blieb der Zeitpunkt für die europäischen Tageszeilen (Abschnitt 18) in UTC nahe 08:45Z bis 09:00Z.

### 19.4 Folgerungen für das Papiermodell des Gates [Vorschlag Claude, nicht entschieden, kein Eingriff in die Produktion]
* Bei einem Produktionslauf um 00:10Z (so lag der Lauf 357 im Oktober, Abschnitt 22 bis 25) liegt der Abruf **seit der Umstellung vor 20:00 ET** (19:10 ET) statt wie im Oktober danach (20:10 ET). Nacht 1 zeigt für diesen Zeitpunkt vollständige Zeilen mit endgültigem Close und vorläufigem Volumen. Ob der Produktionspfad dasselbe sieht (im Oktober meldete das Archiv bei 00:11Z noch 653 von 712 US-Titeln mit unvollständiger letzter Zeile), ist **nicht geprüft** [offen]; dazu wäre ein Blick in die Archiv-Snapshots der Nächte 03.11. und 04.11. nötig (nur Lesen, auf Axels Go).
* Zeitfenster, in dem der Tageswert der US-Titel an beiden gemessenen Nächten stabil war: **ab 02:30Z** (Close und Volumen ab dort unverändert bis 04:30Z). Ein Lauf im Fenster 01:00Z bis 02:20Z würde nach den zwei Nächten bei allen Titeln eine leere letzte Zeile sehen. Gemessen sind zwei Nächte nach der Umstellung, nur eine davon über das ganze Fenster ab 00:10Z; der Zeitpunkt der Rückkehr zur Sommerzeit (März 2027) ist ungeprüft.

### 19.5 Status
* Keine Messung läuft. Axel pausierte aus familiären Gründen einige Tage (bis 09.11.2026). Europa-Reihe (Läufe A bis G) und US-Nächte (diese zwei) sind damit für die Verfügbarkeitsfrage abgeschlossen. Offen zur Entscheidung durch Axel (nichts beauftragt): (a) Abgleich mit den Produktions-Snapshots der Nächte 03.11. und 04.11. im Archiv (nur Lesen); (b) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (c) README für `datenreife/` in `uiq-devtools`; (d) Neubewertung der Gate-Parameter im Papiermodell mit den Daten aus 18 und 19; (e) die getrennt zu führende Frage nach einer unabhängigen Referenzquelle (kein Test beauftragt). Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 20. Abgleich mit den Produktions-Snapshots, Definition der Kennzahl und Startzeiten der Produktionsläufe (Stand 09.11.2026) (nur angehängt; Abschnitte 1–19 unverändert)

### 20.1 Quellen (alles nur Lesen, keine Messung, keine Änderung)
* **Archiv** `ahsub/uiq-archive` (privat), schreibgeschützter Klon, HEAD `a354da7`, `data/snapshots/YYYY-MM-DD_HH.json.gz`, Lauf-Felder `meta.generated`, `meta.last_trading_day`, `meta.data_integrity.lastRowIncomplete.{us,nonUs,spy}`, je Ticker `_lastRowIncomplete` und `_lastCloseDate`. Der Dateiname trägt die UTC-Stunde des Laufs, nicht den Handelstag. Ausgewertet sind die Snapshots 11.10. bis 09.11.2026.
* **Code** `ahsub/ko-aggregator` (öffentlich), schreibgeschützter Klon (`main`, letzter Commit `5b53ee5` vom 09.11.2026 04:24Z): `market_aggregator.py` (AGGREGATOR_VERSION 5.48.0) und `.github/workflows/*.yml`.
* **Lauflisten** von GitHub Actions: von meiner Umgebung aus nicht erreichbar (API gesperrt, HTTP 403). Axel rief am 09.11.2026 gegen 10:25 MEZ die öffentliche API ohne Token auf (`curl` auf `…/actions/workflows/market-aggregator.yml/runs?per_page=60`) und lud die Datei `runs_market_aggregator.json` hoch (SHA-256, Präfix `1826a61cbcb7ffe1`): 60 von 381 Läufen, 21.09. bis 09.11.2026 (35 `schedule`, 25 `workflow_dispatch`).

### 20.2 Definition der Kennzahl [belegt aus dem Code]
* `_lastRowIncomplete` ist wahr, wenn der **Close der letzten Zeile NaN** ist (Zeile mit Datum und Volumen, aber ohne Kurse); `_lastCloseDate` ist das Datum der letzten Zeile mit gültigem Close (`_last_row_diag`, v5.48.0, Befund D26). `calc_data_integrity` setzt das Lauf-Flag `LAST_ROW_INCOMPLETE`, wenn das SPY-Flag gesetzt ist oder der US-Anteil mindestens 50 % beträgt. Die Kennzahl ist rein beobachtend (kein Gate, keine Korrektur, kein Abbruch).
* Aggregator-Workflow: Der einzige Zeitplan in `market-aggregator.yml` ist `00 22 * * 1-5` (22:00Z, Montag bis Freitag). Die übrigen Workflows im Repo (CoT, Samstags-Backup, Datenquellen-Check, Schlüsselprüfung, Versionsprüfung) starten den Aggregator nicht.

### 20.3 Snapshots: Anteil unvollständiger letzter Zeilen [belegt]
Zeiten in UTC; „Tag“ ist `last_trading_day` des Snapshots; US und Non-US in Prozent der Ticker laut `meta.data_integrity` (Non-US 30 von 31, außer 13.10. mit 31 von 31).

| Snapshot | generated | Tag | US % | Non-US % |
|---|---|---|---|---|
| 10-13_03 | 02:56 | 12.10. | 0,6 | 100,0 |
| 10-14_01 | 00:59 | 13.10. | 92,0 | 96,8 |
| 10-15_00 | 00:22 | 14.10. | 92,1 | 96,8 |
| 10-16_00 | 00:11 | 15.10. | 91,7 | 96,8 |
| 10-17_00 | 00:14 | 16.10. | 92,0 | 96,8 |
| 10-20_01 | 00:59 | 19.10. | 92,2 | 96,8 |
| 10-21_00 | 00:28 | 20.10. | 92,0 | 96,8 |
| 10-22_00 | 00:32 | 21.10. | 91,9 | 96,8 |
| 10-23_00 | 00:29 | 22.10. | 91,9 | 96,8 |
| 10-24_00 | 00:25 | 23.10. | 92,0 | 96,8 |
| 10-27_01 | 01:19 | 26.10. | 92,1 | 96,8 |
| 10-28_01 | 01:05 | 27.10. | 92,2 | 96,8 |
| 10-29_01 | 01:40 | 28.10. | 0,4 | 96,8 |
| 10-30_01 | 01:44 | 29.10. | 0,6 | 96,8 |
| 10-31_01 | 01:29 | 30.10. | 0,6 | 96,8 |
| 11-03_03 | 03:24 | 02.11. | 0,3 | 96,8 |
| 11-04_02 | 02:02 | 03.11. | 92,1 (Flag gesetzt) | 96,8 |
| 11-05_02 | 02:04 | 04.11. | 92,1 | 96,8 |
| 11-06_02 | 02:06 | 05.11. | 92,2 | 96,8 |
| 11-07_01 | 01:44 | 06.11. | **26,7** | 96,8 |

* Die zehn Läufe sonntags und montags um 04:17Z bis 04:18Z (11.10., 12.10., 18.10., 19.10., 25.10., 26.10., 01.11., 02.11., 08.11., 09.11.; Tag jeweils der Freitag davor) zeigen **0 % US und 0 % Non-US**.

### 20.4 Befunde
* **US, Übereinstimmung mit den Nachtmessungen [belegt]:** Die Läufe um 02:02Z bis 02:06Z (04., 05., 06.11.) liegen im gemessenen Fenster mit leerem Close (01:00Z bis 02:20Z, Abschnitt 19.2) und zeigen 92 %. Der Lauf um 03:24Z (03.11.) liegt im Fenster ab 02:30Z und zeigt 0,3 %. Die Oktoberläufe von 00:11Z bis 01:19Z zeigen 92 %, die von 01:29Z bis 01:44Z 0,4 % bis 0,6 %. Für den 04.11. (Lauf 376, Start 01:59Z) liegt zudem die c2-Nacht 2 in derselben Nacht vor, beide stimmen überein; für den 05. und 06.11. wird die Phasenlage aus den zwei gemessenen Nächten übertragen [Hypothese].
* **Grenzfall Oktober [offen]:** Lauf `10-31_01` (generated 01:29Z) zeigt 0,6 %, die Oktobermessung nannte „vollständig ab 01:40Z“ (Abschnitt 19.3). Die Abweichung beträgt 10 bis 20 Minuten; mögliche Ursachen (Streuung zwischen Nächten, Zeitpunkt des Abrufs gegenüber `generated`) sind nicht geprüft.
* **Non-US [belegt als Beobachtung]:** In jedem Werktagslauf zeigen 32 von 33 Non-US-Aktien (alle außer ORG.AX) eine unvollständige letzte Zeile, und ihr `_lastCloseDate` liegt genau **einen Handelstag vor** dem `last_trading_day` des Laufs (Beispiel 11-04_02: Tag 03.11., letzter gültiger Close der Non-US-Aktien 02.11.). Das passt dazu, dass die europäischen Tageszeilen in der Nacht noch leer sind, nach den Messungen der Abschnitte 11 bis 18 (Yahoo-Tagesschluss der 13 europäischen Ticker am Folgemorgen zwischen 08:30Z und 09:00Z) [Hypothese, konsistent, nicht an denselben Zeilen geprüft]. Die 13 Krypto-Ticker und ORG.AX sind in diesen Läufen vollständig. Die Zählweise `meta` (31 Ticker) und die Ticker-Felder (33 Non-US-Symbole) wurde nicht abgeglichen.
* **Läufe sonntags/montags um 04:15Z [belegt: Auslöser; offen: Befund]:** Es sind `workflow_dispatch`-Läufe (15 der 25 Dispatch-Läufe in der Liste, 21.09. bis 09.11., nur sonntags und montags, Start 04:15Z bis 04:16Z, jede Woche; einer davon, Lauf 343 am 04.10., schlug fehl). Ihre Snapshots zeigen 0 % US und 0 % Non-US mit Tag Freitag. Dass am Montagmorgen (Asien handelt dann schon) keine unvollständige Montagszeile auftaucht, ist nicht untersucht [offen]. Wer diese Läufe auslöst (Cloudflare-Trigger oder Watchdog), ist aus der Liste nicht ersichtlich: Das Feld `actor` zeigt bei allen Läufen, auch bei `schedule`, `ahsub`.
* **Startzeiten der Produktionsläufe [belegt]:** Der Zeitplan steht auf 22:00Z, die `schedule`-Läufe wurden aber erst nach 2,1 bis 5,4 Stunden erzeugt (Differenz `run_started_at` gegen 22:00Z des Vortages; 35 Läufe): 21.09. bis 12.10. (15 Läufe) 2,1 bis 4,1 h, Mittel 3,1 h; 13.10. bis 25.10. (10 Läufe) 2,2 bis 4,9 h, Mittel 2,7 h; seit 26.10. (10 Läufe) 3,0 bis 5,4 h, Mittel 3,8 h (Spitze 03.11., Start 03:21Z). `meta.generated` liegt in den zwei geprüften Läufen (Lauf 376 und Lauf 379) 2 bis 3 Minuten hinter dem Start; ein Lauf dauert meist 25 bis 30 Minuten. Die Verspätung gehört zur Planung bei GitHub, die Uhrzeit im Zeitplan ist damit nur ein Mindestwert. Ursache (Last um die volle Stunde u. a.) ist nicht belegt [Hypothese]. Fehlschläge in der Liste: Lauf 343 (04.10.) und Lauf 330 (23.09.), abgebrochen 329 und 324.
* **Lauf 11-07_01 [belegt als Beobachtung, Ursache offen]:** Um 01:44Z (Lauf 379, Start 01:42Z, Tag Freitag 06.11.) sind **190 von 704 US-Tickern unvollständig** (26,7 %), das SPY-Flag ist nicht gesetzt, 514 sind vollständig. Die c2-Nächte 02./03. und 03./04.11. zeigen für diese Uhrzeit bei allen 47 Tickern einen leeren Close. Von neun geprüften Namen aus der c2-Watchlist (SPY, QQQ, AAPL, MSFT, NVDA, GE, WMT, HD, CAT) ist keiner unter den 190, die unvollständigen sind nicht alphabetisch verteilt (u. a. ABNB, AFRM, ARKK, COIN, CRWD, DASH, DDOG). Die Freitagsnacht 06./07.11. hat sich also anders verhalten als die zwei gemessenen Nächte (Montag und Dienstag); ob ein Wochentagseffekt, ein Übergangszustand oder ein Unterschied zwischen Produktionsabruf und c2-Abruf vorliegt, ist nicht geklärt [offen].

### 20.5 Folgerungen für das Papiermodell des Gates [Vorschlag Claude, nicht entschieden]
* Ergänzung zu 19.4: Produktion läuft seit Mitte Oktober nicht mehr um 00:10Z; die frühere Frage, ob ein Lauf um 00:10Z nach der Umstellung vollständige Zeilen sähe, ist praktisch gegenstandslos. Die tatsächlichen Läufe liegen seit der Umstellung zwischen 01:42Z und 03:21Z. Davon fielen drei (04., 05., 06.11., Start 01:59Z bis 02:04Z) in die leere Phase, einer (03.11.) dahinter.
* Eine bloße Verschiebung des Zeitplans in die Morgenstunden löst die Lage nach den bisherigen Daten nicht: Die Non-US-Tageszeilen sind erst gegen 09:00Z des Folgetags gefüllt (Abschnitt 18), US ab etwa 02:30Z (Winterzeit); ein Lauf nach 09:00Z fiele dagegen in den laufenden europäischen Handel, wo die Zeile des laufenden Tages unterschiedlich gefüllt sein kann (Anlass der Umstellung in v1.2) [Hypothese, hier nicht gemessen]. Zudem bestimmt GitHub die tatsächliche Startzeit mit 2 bis 5 Stunden Spielraum, und der Lauf 11-07_01 zeigt, dass die US-Phasengrenzen von Nacht zu Nacht schwanken können. Das Papiermodell sollte deshalb **je Markt die letzte vollständige Zeile** bestimmen (statt einer festen Uhrzeit) und den Zustand der letzten Zeile ausweisen; eine Änderung der Zeitplanung wäre nur zusammen mit `ko-watchdog` und `ko-cron-trigger` möglich (laut Kommentar v1.2 müssen alle drei synchron bleiben) und braucht Axels ausdrückliche Aufhebung des Freeze.

### 20.6 Status
* Keine Messung läuft; nichts verändert. Offen zur Entscheidung durch Axel (nichts beauftragt): (a) weitere c2-Nächte, vor allem **Freitag 13.11. auf Samstag 14.11.** (Handelstag Freitag, entspricht der Nacht des Laufs 11-07_01; die Nacht Freitag 06./07.11. selbst wurde nicht gemessen) und zum Vergleich Donnerstag 12.11. auf Freitag 13.11.; Befehl und Nebenwirkungen folgen vorher; (b) eine entsprechende Nachtmessung für die Non-US-Ticker (Fenster und Werkzeug noch zu prüfen); (c) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (d) README für `datenreife/` in `uiq-devtools`; (e) Neubewertung der Gate-Parameter im Papiermodell mit den Daten aus 18 bis 20; (f) die getrennt zu führende Frage nach einer unabhängigen Referenzquelle. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 21. Ergebnis der US-Nächte Do 12.11. und Fr 13.11.2026 und Abgleich mit dem Archiv bis 14.11. (Stand 14.11.2026) (nur angehängt; Abschnitte 1–20 unverändert)

### 21.1 Läufe und Technik
* Auf Axels Freigabe (Messnächte „heute auf morgen und morgen auf übermorgen“) lief das Werkzeug `c2_zeitverlauf.py` v2 (`efa2174ed6caed25`) mit der US-Watchlist (`4ae78a056ea74362`, 47 Ticker; beide Hashes am 12.11.2026 auf Axels Mac geprüft; der Dateiname im Prüfbefehl enthielt in der Nachricht einen Tippfehler, der Hash passte) in zwei Serien, **beide am 12.11.2026 vormittags gestartet** (Startzeilen 07:20:39Z und 07:21:13Z, also 08:20 MEZ) und mit fest vorgegebenem Fenster 00:10Z bis 04:30Z im Abstand von 10 Minuten (27 Slots je Nacht):
  * **Nacht A** `20261112T072039Z`: Handelstag Donnerstag 12.11., Messung Freitag 13.11. früh. Serie-CSV `f40717e2387cafcd` (1 269 Datenzeilen), D27-CSV `2da8009ee92ce778`, Log `b0575e606bdb7af5`.
  * **Nacht B** `20261112T072113Z`: Handelstag Freitag 13.11., Messung Samstag 14.11. früh (entspricht der Nacht des Produktionslaufs 11-07_01, Abschnitt 20.4). Serie-CSV `dfa0a3c7bcd06569` (1 269 Datenzeilen), D27-CSV `8e55c17a5a9ba141`, Log `5903aa503eba4e33`.
* **Qualität [belegt]:** In beiden Nächten alle 27 Slots gemessen, kein übersprungener Slot, Verspätung 0 s, alle 1 269 Abrufe je Serie `ok`, **kein Abruf über `1y_fallback`** (alle `2y_explicit`; der Fallback-Effekt aus 16.5 und 19.1 tritt in diesen Nächten nicht auf). Abrufdauer je Abruf: Median 0,55 s, 95. Perzentil 1,2 s, Maximum 1,5 s (A) bzw. 4,7 s (B). Beide Serien liefen unbeaufsichtigt über zwei Nächte auf dem Mac.

### 21.2 Ergebnis [belegt, je Slot: V = Zeile des Handelstags da und Close gültig, L = Zeile da, Close leer, F = Zeile des Handelstags fehlt; F kam in keinem Slot vor]
* **Nacht A (Handelstag Do 12.11.):** Slots **00:10Z bis 00:50Z: 47 von 47 V**; Slots **01:00Z bis 02:30Z: 47 von 47 L**; Slots **ab 02:40Z bis 04:30Z: 47 von 47 V**. Alle 47 Ticker im Gleichschritt. Der Übergang zu vollständig liegt zwischen den Slots 02:30Z (noch L) und 02:40Z (V).
* **Nacht B (Handelstag Fr 13.11.):** Slots **00:10Z bis 00:50Z: 47 V**; Slots **01:00Z bis 01:30Z: 47 L**; Slots **01:40Z bis 02:30Z: 43 V und 4 L** (die vier Nachzügler **ETSY, FIVE, META und SHEL**); Slots **ab 02:40Z: 47 von 47 V**. Die 43 anderen Ticker (einschließlich SPY, QQQ, AAPL) waren also schon im Slot 01:40Z vollständig; ihr Close und ihr Volumen waren dort bereits identisch mit dem Endwert (43 von 43). Bei den vier Nachzüglern blieb die Zeile von 01:40Z bis 02:30Z unverändert (leerer Close, Volumen unverändert) und wurde im Slot 02:40Z mit Close gefüllt; das Volumen änderte sich dabei nochmals leicht (z. B. META 15 088 458 auf 15 127 500, ETSY 1 771 976 auf 1 772 400, SHEL 3 432 440 auf 3 432 289).
* **Werte:** Der Close in der frühen V-Phase (00:10Z bis 00:50Z) ist in beiden Nächten bei **46 von 47** Tickern identisch mit dem Endwert; die Ausnahme ist AVD (Kurs unter 1 USD): Nacht A 0,9013 gegenüber 0,9000, Nacht B 0,8760 gegenüber 0,8800. Das Volumen in der frühen Phase weicht vom Endwert ab (|Abweichung| Median 0,14 % in A und 0,24 % in B, Maximum 15,8 % bei SAP in A und 24,7 % in B); in der L-Phase ist das Volumen der Zeile bei allen 47 Tickern gleich dem der frühen V-Phase (47 von 47 in beiden Nächten). Ab 02:40Z bis 04:30Z hat sich in keiner Nacht bei irgendeinem Ticker Close oder Volumen geändert (0 von 47).

### 21.3 Vergleich der Nächte nach der US-Zeitumstellung [belegt als Beobachtung]
| Nacht (Handelstag) | letzter V-Slot vor L | L-Phase | früh vollständig (vor dem Ende der L-Phase der Übrigen) | alle 47 vollständig ab |
|---|---|---|---|---|
| Mo 02.11. | 00:50Z | 01:00Z bis 02:20Z | nein | 02:30Z |
| Di 03.11. | (erst ab 01:20Z gemessen) | bis 02:20Z | nein | 02:30Z |
| Do 12.11. | 00:50Z | 01:00Z bis 02:30Z | nein | 02:40Z |
| Fr 13.11. | 00:50Z | 01:00Z bis 01:30Z (alle), 01:40Z bis 02:30Z (4 Ticker) | ja, 43 von 47 ab 01:40Z | 02:40Z |
* Der Beginn der L-Phase liegt bei 01:00Z in allen Nächten, in denen der Zeitraum ab 00:10Z gemessen wurde (Mo, Do, Fr). Das Ende der L-Phase für alle Ticker liegt in vier Nächten zwischen 02:20Z und 02:40Z: im Slot 02:30Z (Mo, Di) schon vollständig, im Slot 02:30Z (Do) noch nicht. Bei einem Raster von 10 Minuten ist ein Unterschied der Grenze zwischen diesen Nächten von wenigen Sekunden bis zu 20 Minuten möglich.
* Die vier Nachzügler der Freitagsnacht (ETSY, FIVE, META, SHEL) sind dieselben, die in den Oktobernächten zuletzt vollständig wurden (Abschnitt 19.3).

### 21.4 Abgleich mit den Produktions-Snapshots bis 14.11. [belegt]
Archiv `ahsub/uiq-archive`, schreibgeschützter Klon, HEAD `74de96a` (14.11.2026 02:29:58Z). Neue Snapshots seit Abschnitt 20.3:

| Snapshot | generated (UTC) | Tag | US unvollständig | Non-US | SPY-Flag |
|---|---|---|---|---|---|
| 11-10_04 | 04:01 | 09.11. | 0,3 % | 96,8 % | nein |
| 11-11_01 | 01:47 | 10.11. | 26,8 % | 96,8 % | nein |
| 11-12_02 | 02:48 | 11.11. | 0,3 % | 96,8 % | nein |
| 11-13_02 | 02:30 | 12.11. | 92,1 % | 96,8 % | ja |
| 11-14_02 | 02:04 | 13.11. | 26,8 % | 96,8 % | nein |

* **Nacht A:** Die Produktion (generated 02:30Z, Tag 12.11.) zeigt 92,1 % und das Flag `LAST_ROW_INCOMPLETE`, in derselben Nacht ist der c2-Slot 02:30Z noch bei 47 von 47 L. **Übereinstimmung.**
* **Nacht B:** Die Produktion (generated 02:04Z, Tag 13.11.) zeigt 192 von 708 US-Tickern (26,8 %) unvollständig, das SPY-Flag ist nicht gesetzt; im c2-Slot 02:00Z/02:10Z der gleichen Nacht sind 4 von 47 unvollständig (8,5 %). Die Richtung stimmt überein (die Mehrzahl ist früh vollständig, eine Nachzüglergruppe nicht); der Anteil in der Produktion ist höher, weil das Universum (708 Ticker) und die c2-Watchlist (47 Ticker, überwiegend große Werte) verschieden zusammengesetzt sind.
* **Die Nachzüglergruppe der Produktion ist stabil:** Die unvollständigen US-Ticker sind am 07.11. 190, am 11.11. 192 und am 14.11. 192; die Mengen vom 11.11. und 14.11. sind **identisch**, die vom 07.11. unterscheidet sich nur durch DUOL und PBF (nicht in der Menge vom 07.11.). Die Gruppe enthält META und SHEL; SPY, QQQ, AAPL und die anderen Ticker der Frühphase gehören nicht dazu. Welche Eigenschaft die Gruppe verbindet, ist nicht untersucht [offen].
* **Frühe Vollständigkeit tritt nicht an jedem Abend auf [belegt als Beobachtung, Ursache offen]:** Früh vollständig (Mehrzahl vor 02:10Z) waren die Nächte der Handelstage Fr 06.11., Di 10.11. und Fr 13.11. (Produktion um 01:44Z, 01:47Z und 02:04Z mit 26,7 % bis 26,8 %; Fr 13.11. zusätzlich c2). Nicht früh vollständig waren Mo 02.11. und Di 03.11. (c2), Mi 04.11. und Do 05.11. (Produktion um 02:04Z und 02:06Z: 92 %) sowie Do 12.11. (c2 und Produktion). Ein reiner Wochentagseffekt erklärt das nicht (Di 03.11. nicht früh, Di 10.11. früh); der Zusammenhang mit Ereignissen oder anderen Einflüssen wurde nicht geprüft [offen].

### 21.5 Startzeiten der Produktionsläufe, Nachtrag zu Abschnitt 20.4 [Schätzung aus `meta.generated`]
* `meta.generated` abzüglich 2 bis 3 Minuten (in den zwei in 20.4 geprüften Läufen belegt) ergibt für die neuen Läufe Startzeiten von etwa 01:45Z (11-11_01) bis 03:58Z (11-10_04), das entspricht einer Verspätung gegenüber 22:00Z von etwa 3,8 h bis 6,0 h (11-10_04: etwa 6,0 h, neuer Höchstwert gegenüber 5,4 h am 03.11.). Die Run-Liste dieser Tage wurde nicht geladen [offen].

### 21.6 Folgerungen für das Papiermodell des Gates [Vorschlag Claude, nicht entschieden]
* Zustand der letzten Zeile in den vier Nächten (Winterzeit): bis 00:50Z gültiger Close (Volumen vorläufig), 01:00Z bis mindestens 01:30Z bei allen leerer Close, danach je nach Nacht entweder alle gleichzeitig vollständig zwischen 02:20Z und 02:40Z oder eine Mehrheit früh (ab 01:40Z) und eine Nachzüglergruppe (etwa 27 % des Produktionsuniversums) bis 02:40Z; ab 02:40Z in allen gemessenen Nächten vollständig und danach unverändert. Für US gilt also nach den bisherigen vier Nächten: **frühestens 02:40Z vollständig, mit Puffer erst ab etwa 03:00Z**; Sommerzeit (März 2027) ist ungeprüft.
* Die Produktionsläufe liegen seit der Umstellung zwischen etwa 01:45Z und 04:00Z und damit teils vor, teils nach diesem Zeitpunkt; eine feste Uhrzeit trifft die Phase nicht sicher (Abschnitt 20.5). Das Papiermodell sollte weiter **je Ticker und Markt die letzte vollständige Zeile** verwenden (leerer Close: Vortageszeile nehmen und kennzeichnen) und das Flag der Produktion als Eingang behalten. Keine Entscheidung, keine Änderung der Produktion.

### 21.7 Status
* Keine Messung läuft. Die c2-Reihe zu den US-Nächten ist mit vier Nächten nach der Zeitumstellung (Mo 02.11., Di 03.11., Do 12.11., Fr 13.11.) für die Verfügbarkeitsfrage ausreichend dokumentiert. Offen zur Entscheidung durch Axel (nichts beauftragt): (a) Nachtmessung für die Non-US-Ticker (Werkzeug c3 und Fenster noch zu prüfen); (b) Untersuchung der Nachzüglergruppe (Eigenschaften der rund 190 Ticker, nur Lesen im Archiv); (c) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (d) README für `datenreife/` in `uiq-devtools`; (e) Neubewertung der Gate-Parameter im Papiermodell mit den Daten aus 18 bis 21; (f) die getrennt zu führende Frage nach einer unabhängigen Referenzquelle; (g) Run-Liste und Ursache der Startverzögerung bei GitHub. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 22. Nachzüglergruppe im Archiv: deskriptive Untersuchung mit Kontrollgruppe und Reviewer-Einschätzung (Stand 14.11.2026) (nur angehängt; Abschnitte 1–21 unverändert)

### 22.1 Auftrag, Quellen, Methode
* Auf Axels Go (14.11.2026 16:25 MEZ) und nach der Priorisierung durch den Reviewer (Punkt 1 zuerst): **rein lesende** Untersuchung der in 21.4 gefundenen stabilen Gruppe unvollständiger US-Ticker. Kein Abruf, keine Änderung an Archiv, Produktion, Workflows oder Repos.
* **Daten:** Archiv `ahsub/uiq-archive`, schreibgeschützter Klon, HEAD `74de96a`, Snapshots `2026-11-07_01`, `2026-11-11_01`, `2026-11-14_02` (Felder je Ticker aus `tickers`, Zugehörigkeit zu Marktlisten aus `markets`, zu Sektor-Watchlists aus `sectorWatchlists`). US-Ticker = Symbole ohne `.`, `-` und `^`.
* **Gruppen:** **G** = US-Ticker, die in allen drei Snapshots `_lastRowIncomplete=True` haben (**190**); **Kontrolle C** = in allen drei `False` (**514**); gemeinsames Universum 704 Ticker, uneindeutige Ticker 0.
* **Vorab festgelegte Merkmale (vor dem Vergleich festgelegt, nicht nachträglich ergänzt):** Zugehörigkeit zu den Marktlisten und Sektor-Watchlists; Kursklassen; Quartile von `avgVol20` und von Dollarvolumen (Kurs mal `avgVol20`, Grenzen des gemeinsamen Universums); OTC-ADR-artiges Symbol (fünf Buchstaben, Ende auf Y oder F); Optionsdaten (`ivArchiveDays`>0); Länge der Historie; `earningsStatus`; sowie als Kontrolle auf einen Zeitartefakt die Verarbeitungszeit je Ticker (`updated`). Vergleich je Merkmal als Anteil in G und C mit zweiseitigem exakten Test nach Fisher. Das sind rund 50 verschiedene Vergleiche; die Sektor-Tags und die Sektor-Watchlists sind identisch und zählen einmal. Nach einer Korrektur für Mehrfachtests (Schwelle etwa p<0,001) bleiben nur die Befunde unten als auffällig; alle anderen p-Werte sind nicht belastbar.
* Auswertungsskript `nachzuegler.py` (Präfix `4ff8751e938dcee6`, nicht im Repo, schreibgeschützt gegen den Archivklon) und die Ausgabe wurden Axel als Dateien gegeben.

### 22.2 Ergebnis [belegt als Beobachtung]
| Merkmal | G (n=190) | C (n=514) | p (Fisher) |
|---|---|---|---|
| in Marktliste `bear_us` (48 Ticker insgesamt) | 35 (18,4 %) | 13 (2,5 %) | 7e-12 |
| OTC-ADR-artiges Symbol (5 Buchstaben, Ende Y/F) | 0 (0,0 %) | 42 (8,2 %) | 2e-6 |
| Kurs 100 bis 500 USD | 48 (25,3 %) | 223 (43,4 %) | 1e-5 |
| Kurs 5 bis 20 USD | 35 (18,4 %) | 44 (8,6 %) | 4e-4 |
| Sektor-Watchlist FINTECH | 9 (4,7 %) | 3 (0,6 %) | 7e-4 |
| Kurs 500 USD und höher | 2 (1,1 %) | 34 (6,6 %) | 0,0016 (nicht belastbar) |
| in Marktliste `sp500` | 77 (40,5 %) | 171 (33,3 %) | 0,08 |
| avgVol20, 4. Quartil (hoch) | 55 (28,9 %) | 121 (23,5 %) | 0,14 |
| Optionsdaten vorhanden | 181 (95,3 %) | 455 (88,5 %) | 0,006 (nicht belastbar) |

* **Die Gruppe lässt sich nicht durch ein einfaches Merkmal abtrennen.** In G sind überwiegend Ticker mit niedrigerem Kurs (Schwerpunkt 5 bis 100 USD) und überdurchschnittlich viele Wachstums- und Technologiewerte der Marktliste `bear_us` (z. B. ABNB, AFRM, COIN, CRWD, DASH, DDOG, HOOD, PLTR, SHOP, SNOW, UBER); in G fehlen die OTC-ADR-artigen Symbole (ADDYY, BASFY, SIEGY u. a.: 42 in C, 0 in G). Auch nach Entfernen der `bear_us`-Werte und der OTC-ADR-artigen Symbole bleiben 155 Ticker in G gegenüber 459 in C (25 %), die Gruppe ist also keine Folge dieser beiden Merkmale. Vom Volumen (`avgVol20`, Dollarvolumen), der Zugehörigkeit zu `sp500` und `etfs`, dem Optionsdatenstand und dem Earnings-Status trennt keines die Gruppen belastbar.
* **Verarbeitungsreihenfolge [belegt]:** `updated` liegt für alle Ticker innerhalb von 10 Sekunden (Median G 02:03:11, C 02:03:10); die Gruppenzugehörigkeit hängt nicht von der Verarbeitungszeit im Lauf ab.
* **Die c2-Nachzügler:** META und SHEL gehören zu G (META: `sp500` und Sektor-Watchlists AI_TECH und PICKS_SHOVELS; SHEL: `intl`). ETSY und FIVE sind **nicht** im US-Universum der Snapshots und konnten nicht eingeordnet werden.
* **[Hypothese, nicht belegt]:** Die Gruppe könnte aus Werten mit hoher Schwankung bestehen (Wachstums- und Technologiewerte mit niedrigerem Kurs). Volatilitätsfelder (`hv10`, `hvp`, `atr`) wurden vorab nicht festgelegt und daher nicht ausgewertet. Eine Ursache für das spätere Vollständigwerden bei Yahoo ist aus diesen Daten nicht ableitbar [offen]. Der Börsenplatz (Nasdaq oder NYSE) liegt in den Snapshots nicht vor; ein erster Blick auf die Beispiele (u. a. META an der Nasdaq, SHEL und ABBV an der NYSE) spricht nicht für den Börsenplatz als Ursache, ist aber nicht geprüft.

### 22.3 Präzisierung zu 21.4
* DUOL und PBF waren am 07.11. noch nicht im US-Universum der Snapshots (704 Ticker gegenüber 708 am 11. und 14.11.; neu seit dem 07.11.: ALX, DUOL, PBF, TREE). **Alle 190 Ticker des 07.11. waren auch am 11. und 14.11. unvollständig**; DUOL und PBF waren in den zwei neuen Snapshots ebenfalls dabei, ALX und TREE nicht. Die Gruppe ist damit über die drei Nächte nicht nur ähnlich, sondern in jedem Mitglied stabil.

### 22.4 Einschätzung des Reviewers (Text von Axel am 14.11.2026 16:24 MEZ eingefügt, Datei `747e9a74-attachment.txt`, SHA-256 Präfix `9db16d6fdc381a4d`)
* Inhalt in Kürze: Die Daten sprechen gegen eine feste Startuhrzeit und für eine tickerbezogene Prüfung der letzten vollständigen Tageszeile; 02:40Z sei nach vier Nächten der früheste beobachtete Zeitpunkt, an dem alle 47 Messticker vollständig waren, 03:00Z ein plausibler Sicherheitspuffer, aber keine validierte Garantie; das Produktions-Flag bleibe ein wichtiger zusätzlicher Befund. Die Wiederholung der vier Nachzügler deute eher auf eine tickerbezogene Besonderheit als auf einen Wochentagseffekt, beweise aber keine gemeinsame Ursache. Priorisierung: (1) Nachzüglergruppe im Archiv deskriptiv mit Kontrollgruppe, (2) GitHub-Run-Liste und Startverzögerung getrennt davon, (3) Non-US-Nachtmessung als eigener Strang, erst nach Prüfung des c3-Fensters (ein leerer Close darf nicht mit einer noch nicht vorhandenen Tageszeile verwechselt werden). Freeze, C1-Sperre und Produktionspipeline bleiben unangetastet; keine Implementierungsfreigabe.
* Die Untersuchung in 22.1 bis 22.3 folgt dieser Priorisierung (Punkt 1) und ist ein Ergebnis dieses Auftrags. Eine ausdrückliche Zustimmung des Reviewers zu früheren Freigaben (Abschnitt 6 des Themendokuments) bleibt unverändert undokumentiert [offen].
* Wortlaut-Klarstellung zu 21.6: Der Zeitpunkt „frühestens 02:40Z, mit Puffer ab etwa 03:00Z“ gilt für die **47 Messticker** und die in 21.4 genannten Produktionsbeobachtungen nach vier Nächten; er ist **keine allgemeine Garantie** und für die Sommerzeit (ab März 2027) ungeprüft.

### 22.5 Status
* Keine Messung läuft; nichts verändert. Offen zur Entscheidung durch Axel (nichts beauftragt): (a) Run-Liste der Produktionsläufe 10.11. bis 14.11. und Ursache der Startverzögerung (Schritt 2 der Priorisierung; Abruf wie am 09.11. per `curl`, rein lesend); (b) Vorbereitung der Non-US-Nachtmessung (c3-Fenster, Tageszeilen, Handelskalender prüfen, bevor etwas startet); (c) optional: eine zweite Auswertung der Gruppe mit **vorab festzulegenden** Volatilitätsmerkmalen (z. B. `hv10`, `hvp`, `atr` im Verhältnis zum Kurs); (d) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (e) README für `datenreife/` in `uiq-devtools`; (f) Neubewertung der Gate-Parameter im Papiermodell mit den Daten aus 18 bis 22; (g) die getrennt zu führende Frage nach einer unabhängigen Referenzquelle. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 23. Run-Liste der Produktionsläufe 03.11. bis 14.11. und Klarstellungen zu Abschnitt 22 (Stand 14.11.2026) (nur angehängt; Abschnitte 1–22 unverändert)

### 23.1 Klarstellungen zu Abschnitt 22 (zweite Einschätzung des Reviewers, 14.11.2026 17:36 MEZ, Datei `aace77a0-attachment.txt`)
* **`bear_us` ist eine UIQ-interne Marktliste**, kein unabhängiges Merkmal von Börse oder Datenanbieter. Der Befund (18,4 % in G gegenüber 2,5 % in C) beschreibt, welche Ticker UIQ dort einsortiert hat; er erklärt nicht, warum Yahoo deren Tageszeile später vervollständigt. Ebenso können Kursniveau, Unternehmensgröße, Börsenplatz, Handelsaktivität und Tickeruniversum zusammenhängen.
* **Die Schwelle p<0,001 in 22.1 ist keine Korrektur für Mehrfachtests**, sondern eine konservative Vorsichtsgrenze bei rund 50 Vergleichen; die Merkmale sind zudem nicht unabhängig (`bear_us`, Sektor-Watchlists und Kursverteilung überschneiden sich). Die Formulierung „nach einer Korrektur für Mehrfachtests“ in 22.1 ist in diesem Sinn zu lesen.
* **Die Auswertung ist rein univariat.** Ob `bear_us` und Kursniveau nach Kontrolle für andere Merkmale noch unabhängig wirken, ist nicht untersucht; das wäre eine multivariate Analyse und eine andere Fragestellung, die nicht nachträglich als Bestätigung der Studie aus 22 ausgegeben werden darf.
* „Volumen und Dollarvolumen trennen die Gruppen nicht“ gilt für die gewählte Auswertung (Quartile von `avgVol20` und Dollarvolumen), nicht für jede denkbare Form von Liquidität.
* **Volatilität als Ursache bleibt eine Hypothese und ist zurückgestellt.** Falls sie später geprüft wird, dann nur mit vorab festgelegten Variablen, Schwellen und Auswertungskriterien (keine nachträgliche Merkmalsauswahl).
* Die 03:00Z-Marke bleibt eine beobachtungsbasierte Orientierung für die 47 Messticker, keine Garantie.

### 23.2 Quelle der Run-Liste [belegt]
* Axel rief am 14.11.2026 gegen 17:38 MEZ die öffentliche Actions-API ohne Token auf (`…/actions/workflows/market-aggregator.yml/runs?per_page=30`, rein lesend) und lud die Datei `runs_market_aggregator_1114.json` hoch (SHA-256 Präfix `c2f5468c570b147f`; 30 von 386 Läufen, Lauf 357 vom 16.10. bis Lauf 386 vom 14.11.2026). Zusammen mit der Liste vom 09.11. (Abschnitt 20.1) sind 40 `schedule`-Läufe vom 22.09. bis 14.11. ausgewertet.

### 23.3 Startzeiten der Läufe 10.11. bis 14.11. [belegt]
| Lauf | Start (UTC) | Verspätung gegenüber 22:00Z | Dauer | Snapshot generated | US unvollständig |
|---|---|---|---|---|---|
| 382 (Di 10.11.) | 03:59:02 | 5,98 h | 27,0 min | 04:01 | 0,3 % |
| 383 (Mi 11.11.) | 01:45:09 | 3,75 h | 26,2 min | 01:47 | 26,8 % |
| 384 (Do 12.11.) | 02:45:21 | 4,76 h | 27,5 min | 02:48 | 0,3 % |
| 385 (Fr 13.11.) | 02:28:02 | 4,47 h | 26,1 min | 02:30 | 92,1 % (Flag) |
| 386 (Sa 14.11.) | 02:02:02 | 4,03 h | 28,5 min | 02:04 | 26,8 % |
* Alle fünf Läufe `schedule`, alle erfolgreich. Die in 21.5 aus `meta.generated` geschätzten Startzeiten (generated abzüglich 2 bis 3 Minuten) stimmen: `generated` liegt in allen fünf Läufen 2 bis 3 Minuten hinter dem Start. Der Lauf 382 (5,98 h) ist die **größte Verspätung** in den 40 ausgewerteten Läufen (bisher 5,36 h am 03.11.).
* **Verspätung je Kalenderwoche (Mittel, kleinste bis größte):** KW 39 (22.–26.9.) 2,4 h (2,1 bis 2,7); KW 40 3,3 h (3,0 bis 3,6); KW 41 3,7 h (3,3 bis 4,1); KW 42 (12.–17.10.) 2,9 h (2,2 bis 4,9); KW 43 2,5 h (2,4 bis 3,0); KW 44 3,4 h (3,0 bis 3,7); KW 45 4,2 h (3,7 bis 5,4); KW 46 (bis 14.11.) 4,6 h (3,8 bis 6,0). Die Verspätung schwankt von Woche zu Woche, die letzten zwei Wochen liegen am höchsten; ein klarer Trend ist aus 40 Läufen nicht ableitbar. Die Ursache (Planung bei GitHub, Last um die volle Stunde) ist nicht belegt [Hypothese]. Ein Lauf (22.09., Lauf 324) wurde abgebrochen, die übrigen 39 sind erfolgreich.
* **Dispatch-Läufe sonntags und montags:** Start 04:15:15Z bis 04:15:47Z, Dauer 8,0 bis 9,1 Minuten (die `schedule`-Läufe dauern 24,5 bis 30,0 Minuten). Die kürzere Dauer passt zu einem Lauf ohne neuen Handelstag, bei dem laut Workflow-Kommentar die Anthropic-Aufrufe entfallen (Skip-Check) [Hypothese, nicht am Lauflog geprüft]. Der Auslöser des Dispatches ist aus der Liste nicht ersichtlich (Feld `actor` überall `ahsub`).

### 23.4 Einordnung gegen die c2-Messungen und die Produktions-Snapshots [belegt als Beobachtung]
* **Nacht Do 12.11. (Handelstag Do):** Lauf 385 startete um 02:28Z, der Abruf lag vor dem Ende der leeren Phase (c2: bis 02:30Z noch bei 47 von 47 leer, ab 02:40Z vollständig); Produktion 92,1 % mit Flag. **Nacht Fr 13.11.:** Lauf 386 startete um 02:02Z, in der Phase mit früher Vollständigkeit der Mehrheit (c2: 43 von 47 ab 01:40Z); Produktion 26,8 % ohne Flag. Beide Paare stimmen mit den c2-Messungen derselben Nacht überein.
* **Lauf 384 (Start 02:45Z, Handelstag Mi 11.11.)** lag nach der in der Nacht Do 12.11. gemessenen Grenze (02:40Z) und zeigt vollständig (0,3 %); **Lauf 382 (Start 03:59Z, Handelstag Mo 09.11.)** ebenfalls. Für die Nächte Mo 09.11. und Mi 11.11. liegt keine c2-Messung vor.
* **Alle zehn `schedule`-Läufe seit dem Handelstag 02.11. (Läufe 375 bis 386, ohne die Dispatch-Läufe):** vollständig (unter 1 %): 3 (03.11., 10.11., 12.11.); nur teilweise unvollständig (26,7 % bis 26,8 %): 3 (07.11., 11.11., 14.11.); weitgehend unvollständig (92 %): 4 (04.11., 05.11., 06.11., 13.11.). **Sieben von zehn Läufen lieferten damit für mindestens 27 % der US-Ticker eine unvollständige letzte Zeile.**
* **Das Lauf-Flag `LAST_ROW_INCOMPLETE` erfasst nur die vier Läufe mit 92 %**, nicht die drei Läufe mit 26,7 % bis 26,8 %: Der Code setzt das Flag, wenn das SPY-Flag gesetzt ist oder der US-Anteil mindestens 50 % beträgt (Abschnitt 20.2), und in den drei Läufen mit Teilvollständigkeit war SPY vollständig. Damit gehen in diesen Läufen rund 190 US-Ticker mit leerem Close der letzten Zeile ohne Lauf-Flag durch (nur das Ticker-Feld `_lastRowIncomplete` markiert sie). Das ist eine Beobachtung zum bestehenden diagnostischen Flag, keine Änderung und keine Bewertung der Berechnungen dahinter [offen: Auswirkung auf Scores und Ausgaben, nicht untersucht].

### 23.5 Status
* Keine Messung läuft; nichts verändert. Reviewer-Priorisierung (14.11., 17:36 MEZ): (1) Run-Liste, **erledigt in diesem Abschnitt**; (2) c3-Nachtfenster prüfen (Non-US-Messung als eigener Strang; vor jedem Start wird Axel Befehl und Nebenwirkungen vorgelegt); (3) Volatilität zurückgestellt. Offen zur Entscheidung durch Axel (nichts beauftragt): (a) c3-Nachtfenster für die Non-US-Ticker prüfen; (b) Filter auf `versuch=2y_explicit` in `tag_auswertung.py` (neuer Hash); (c) README für `datenreife/` in `uiq-devtools`; (d) Neubewertung der Gate-Parameter im Papiermodell mit den Daten aus 18 bis 23, darunter die Frage, wie die Teilvollständigkeit (26,7 % bis 26,8 %) im Papiermodell zu behandeln wäre; (e) die getrennt zu führende Frage nach einer unabhängigen Referenzquelle. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 24. Messdesign der Non-US-Nachtmessung (c3), vor Beginn der Messungen festgelegt, ohne Ergebnisse (Stand 14.11.2026) (nur angehängt; Abschnitte 1–23 unverändert)

### 24.1 Zweck, Freigabe und Grenze
* **Frage:** In welchem Zustand befindet sich die letzte Tageszeile der Non-US-Aktien (zuletzt in der Nacht gemessen: gültig, leer oder fehlend) zwischen 00:10Z und 10:00Z nach dem Börsentag D, und wann wird sie gültig? Das schließt die bisher nie gemessene Lücke zwischen den Nachmittagsfenstern (15:35Z bis 18:00Z) und den Morgenfenstern (08:00Z bis 10:00Z) der Läufe A bis G; in dieser Lücke liegen die Produktionsläufe (Abschnitte 20 und 23: bei 32 von 33 Non-US-Aktien leerer Close der letzten Zeile).
* **Freigaben (Axel, 14.11.2026 20:05 und 20:07 MEZ, mit den Ergänzungen in 24.4):** Messdesign und Abschnitt 24 freigegeben. **Die Messstarts sind nicht freigegeben**: Nacht A und Nacht B brauchen je ein ausdrückliches Go, nach Vorlage der unmittelbar vor dem Start erfolgreich geprüften Befehle (24.3). Nicht freigegeben: Änderung an c3-Skript oder Watchlist, Commit durch Claude, Änderung an Produktionskomponenten. Das Auswertungsskript wird vor der Auswertung zur Ansicht vorgelegt.
* **Grenze:** Die zwei Nächte sind eine **erste Reproduzierbarkeitsprüfung mit 14 Tickern** (13 europäische plus ORG.AX), keine vollständige Untersuchung der 33 Non-US-Aktien der Produktion. Die bestehende Watchlist bleibt unverändert, damit die Vergleichbarkeit mit den Vormittagsmessungen (Abschnitte 11 bis 18) erhalten bleibt.

### 24.2 Messdesign
* **Werkzeug:** `c3_quellenvergleich.py` v1.1 (`d81a01dfdd176690`, 984 Zeilen, Repo `uiq-devtools`, `datenreife/`), Modus `nonus`, Watchlist `watchlist_c3_nonus_20261017.csv` (`17f366b05532637a`, Mac `~/uiq-c2`), 4 Worker, 10-Minuten-Raster, je Slot 28 Abrufe (je Ticker Tageszeile und Intraday).
* **Nacht A:** Börsentag D = Montag 16.11.2026, Messdatum D+1 = Dienstag 17.11.2026, Fenster 00:10Z bis 10:00Z (60 Slots). **Nacht B:** D = Dienstag 17.11.2026, D+1 = Mittwoch 18.11.2026, gleiches Fenster. Keine parallele c2-Messung.
* **Warum das Fenster nach Mitternacht beginnt:** Der Tagesabruf `2y_explicit` endet exklusiv am heutigen UTC-Datum; die Zeile des Börsentags D ist deshalb frühestens ab 00:00Z des Folgetags im Abruf enthalten.
* **Befehle** (unverändert gegenüber den bisherigen c3-Läufen, Datumsangaben UTC):
  * Nacht A: `caffeinate -i ~/uiq-c2-venv/bin/python3 -I ~/uiq-c2/c3_quellenvergleich.py serie --mode nonus --watchlist ~/uiq-c2/watchlist_c3_nonus_20261017.csv --fenster 2026-11-17T00:10,2026-11-17T10:00,10 --out-dir ~/uiq-c2-lokal`
  * Nacht B: gleicher Befehl mit `--fenster 2026-11-18T00:10,2026-11-18T10:00,10`.
* **Nebenwirkungen:** nur lesende Abrufe öffentlicher Yahoo-Endpunkte (60 Slots mal 28 Abrufe je Nacht, ohne Konto und Schlüssel); je Nacht drei Dateien (Serie-CSV, Meta-JSON, Log) nur in `~/uiq-c2-lokal`; der Mac muss vom Start bis 10:00Z des Messtags wach, am Netzteil und online sein; keine Änderung am Repo.

### 24.3 Prüfung unmittelbar vor jedem Start (muss erfolgreich sein)
* Hashprüfung auf dem Mac: `shasum -a 256 ~/uiq-c2/c3_quellenvergleich.py ~/uiq-c2/watchlist_c3_nonus_20261017.csv | awk '{print substr($1,1,16), $2}'` (erwartet `d81a01dfdd176690` und `17f366b05532637a`).
* yfinance-Version: `~/uiq-c2-venv/bin/python3 -c "import yfinance; print(yfinance.__version__)"` (erwartet `1.5.2`).
* Trockenlauf ohne Netz: `~/uiq-c2-venv/bin/python3 -I ~/uiq-c2/c3_quellenvergleich.py trockenlauf` (erwartet alle Prüfungen bestanden, 31 wie bei der Einführung). Weicht etwas ab, wird nicht gestartet.

### 24.4 Auswertungsregeln (vor Kenntnis der Messdaten festgelegt)
* **Zwei Datumsangaben getrennt:** Börsentag D (Indexdatum der Tageszeile in der Ortszeit der Börse; bei ORG.AX das Sydneyer Datum) und Messdatum D+1 (UTC-Datum des Slots) werden in getrennten Spalten geführt; Slot-Zeiten bleiben UTC. Snapshot-Datum, UTC-Datum und Börsentag werden nicht vermischt.
* **Zustände je Ticker und Slot, ausschließlich aus Zeilen mit `versuch=2y_explicit`:** **V** = Zeile des Tages D vorhanden, Close gültig; **L** = Zeile des Tages D vorhanden, Close leer (`close_nan`); **F** = Zeile des Tages D fehlt unter den gelieferten letzten drei Tageszeilen. **F bedeutet nur, dass das erwartete Datum nicht geliefert wurde, nicht, dass Yahoo keine Daten für diesen Börsentag besitzt.**
* **Fallback-Abrufe** (`1y_fallback`, `6mo_fallback`) werden **getrennt als Kategorie U ausgewiesen** und gehen nicht in V, L oder F ein; eine vorzeitig erscheinende Zeile des laufenden Tages darf nicht als Verfügbarkeit gewertet werden (Abschnitt 16.5).
* **Börsenkalender je Börse:** Der erwartete Börsentag D wird je Ticker aus dem Kalender seiner Börse bestimmt (DE, UK, IT, FR, SE, BE, AU). Fällt D für eine Börse auf einen Feiertag oder Nicht-Handelstag, wird der Ticker für diese Nacht **nicht** als F gewertet, sondern ausgeschlossen und namentlich aufgeführt. Mir sind für den 16. und 17.11.2026 keine Feiertage dieser Börsen bekannt; das ist nicht geprüft und wird in der Auswertung anhand der Zeilendaten kontrolliert.
* **Messausfälle getrennt dokumentiert (Kategorie A) und nicht in V, L oder F gezählt:** übersprungene Slots und Prozessabbrüche (aus dem Log), Abruffehler (`status` ungleich `ok`, z. B. `fetch_failed`), leere Antworten. Je Nacht wird die Anzahl der Slots und Abrufe je Kategorie (V, L, F, U, A) ausgewiesen.
* **ORG.AX getrennt:** Seine Tageszeile mit Datum D wird wegen der Zeitzone bereits vor Fensterbeginn erwartet; er wird gesondert ausgewertet und nicht mit den 13 europäischen Tickern zusammengefasst.
* **Kenngrößen je Nacht und Ticker:** erster Slot mit V (Übergang), letzter Slot mit L, Anzahl F-Slots, ob der Close nach dem ersten V unverändert bleibt (stabil ab Slot), Anteil der Abrufe in U. Je Nacht Zählung der Ticker je Zustand und Slot; Gegenüberstellung mit dem Start der Produktionsläufe dieser Nächte (Run-Liste) und dem Anteil unvollständiger Non-US-Ticker in den Snapshots. Zeiten der Vormittagsserien (08:45Z bis 09:00Z) dienen als Vergleich.
* **Reproduzierbarkeit:** Beschreibend, je Ticker Unterschied des ersten V-Slots zwischen den zwei Nächten (Unterschiede über einen Slot hinaus werden benannt); keine Signifikanztests, keine nachträgliche Auswahl von Tickern oder Slots.
* **Nicht zulässig:** Änderung der Zustandsdefinitionen oder der Ticker nach Kenntnis der Daten; Ableitung einer Garantie oder einer Produktionsänderung aus zwei Nächten mit 14 Tickern.
* **Auswertungsskript:** eigenes kleines Skript (kein Eingriff in c3, kein neuer c3-Hash), wird vor der Auswertung zur Ansicht vorgelegt und nicht gegen die Messdaten nachjustiert.

### 24.5 Status
* Keine Messung läuft; nichts gestartet, nichts verändert. Offene Freigaben durch Axel: Nacht A (Messtag 17.11.), Nacht B (Messtag 18.11.), je nach Vorlage der Befehle und erfolgreicher Prüfung nach 24.3; Auswertungsskript zur Ansicht. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 25. Stand der Ablage und Übergabe an eine neue Sitzung (Stand 14.11.2026, abends) (nur angehängt; Abschnitte 1–24 unverändert)

### 25.1 Ablage (belegt, per Hash gegen den Remote-Stand geprüft)
* **`UIQ-Suite`, Commit `c159d0b` (Axel, 14.11.2026 20:30 MEZ):** `docs/UEBERGABE-2026-10-17.md` mit Abschnitt 24 (581 Zeilen, Hash-Präfix `b815aa63a7f9fbe6`; Pflicht-Header, erste 78 Zeilen, unverändert `f9c951568fc52222`) und `docs/DATENREIFE-UND-QUELLENVERGLEICH.md` (49 Zeilen, `be8a1a83c7c591f9`). Der vorangehende Commit `b3695a7` enthielt noch die 545-Zeilen-Fassung ohne Abschnitt 24; die Messregeln liegen damit vor Beginn der Messungen im Repo.
* **`uiq-devtools`, Commit `b205b38` (Axel, 14.11.2026 20:22 MEZ):** neue Datei `datenreife/nachzuegler.py` (207 Zeilen, `ab1af8e09189b550`), nur diese eine Datei im Commit. Die bis dahin lokal verwendete Fassung hatte den Hash-Präfix `4ff8751e938dcee6`; sie wurde nie im Repo geführt. Die neue Fassung (v1.1) ist bereinigt (Pfade als Parameter, Kopf-Docstring, keine Tickernamen ohne `--mit-ticker`, Schreibsperre für Git-Arbeitsverzeichnisse bei `--gruppen-dateien`); die Logik ist unverändert. Nachweis: Ausgabe auf den drei Snapshots 07.11., 11.11. und 14.11. mit `--mit-ticker` identisch (`diff`) mit der Ausgabe des Originals (Hash-Präfix der Originalausgabe `802301676afd34a8`). Die Originalausgabe und die Gruppendateien G und C enthalten Tickernamen und gehören nicht in ein öffentliches Repo.
* Stand `datenreife/` in `uiq-devtools`: `c2_zeitverlauf.py`, `c3_quellenvergleich.py`, `nachzuegler.py`, `tag_auswertung.py`. Eine README gibt es nicht; sie ist nicht freigegeben.

### 25.2 Maßgebliche Dateien und Hashes (Präfixe, SHA-256)
* Protokoll `UEBERGABE-2026-10-17.md` `b815aa63a7f9fbe6` (vor diesem Abschnitt); Themendokument `be8a1a83c7c591f9`.
* `c3_quellenvergleich.py` v1.1 `d81a01dfdd176690`; Watchlist `watchlist_c3_nonus_20261017.csv` `17f366b05532637a` (Mac `~/uiq-c2`); `c2_zeitverlauf.py` v2 `efa2174ed6caed25`; US-Watchlist `watchlist_us_20261015_v2.csv` `4ae78a056ea74362`; `tag_auswertung.py` `79fb975c307c2060`; `nachzuegler.py` `ab1af8e09189b550`.

### 25.3 Stand der Freigaben (unverändert gegenüber 24.1)
* Freigegeben: Messdesign und Regeln aus Abschnitt 24; Vorbereitung der Befehle; Ablage der Skripte und des Protokolls im Repo (durch Axel).
* **Nicht freigegeben:** Start von Nacht A (Messtag Di 17.11., Fenster 00:10Z bis 10:00Z, Börsentag D = Mo 16.11.) und von Nacht B (Messtag Mi 18.11., D = Di 17.11.); jeder Start braucht Axels einzelnes ausdrückliches Go nach Vorlage der unmittelbar vor dem Start erfolgreich geprüften Befehle (Hashprüfung, yfinance `1.5.2`, Trockenlauf mit 31 Prüfungen, siehe 24.3). Ebenfalls nicht freigegeben: Änderung an c3-Skript oder Watchlist, README, Filter `versuch=2y_explicit` in `tag_auswertung.py`, Volatilitätsanalyse, Gate-Neubewertung, jede Änderung an Produktionskomponenten. Das Auswertungsskript für die Non-US-Nächte wird vor der Auswertung zur Ansicht vorgelegt.
* Das Fenster von Nacht A beginnt am 17.11. um 00:10Z (= 01:10 MEZ). Wann genau der Start am Abend des 16.11. erfolgt, entscheidet Axel; der Mac muss vom Start bis 10:00Z des Messtags wach, am Netzteil und online sein (24.2).

### 25.4 Weiterhin offen (nichts beauftragt)
* Ursache der Nächte mit früher Vollständigkeit und der Nachzüglergruppe (Abschnitte 21 und 22; Volatilität nur [Hypothese]); Ursache der Startverzögerung der GitHub-Läufe (Run-Logs nicht gelesen); Wirkung unvollständiger Zeilen auf Scores und Ausgaben [offen]; Abdeckung der Non-US-Watchlist (14 von 33); Sommerzeit (März 2027) ungetestet; keine multivariate Analyse.
* Ältere offene Punkte unverändert: TIPS→TIP, GOLD→B, USD, A-2/C, ABR-Test, Yahoo-Lizenz Go/No-Go, D21 bis D23, S6/№73, BaFin/Bundesbank, `SUITE.md`-Integration nach D26, TR-Backup-Logs, GOLD-Historie, Wochentagsmenge, Stränge B und C, undokumentierte Reviewer-Freigabe früherer Schritte.

### 25.5 Einstieg für die nächste Sitzung
* Lesen: dieses Protokoll (Abschnitte 20 bis 25, Header zuerst) und das Themendokument. Regeln unverändert: Freeze, C1-Sperre, Gate nur Papiermodell, nichts ohne Axels ausdrückliches Go, Befehl und Nebenwirkungen vorher, [belegt]/[Hypothese]/[offen] getrennt, ganze Dateien zum Ersetzen, Axel committet selbst, Prüfung per Hash gegen einen schreibgeschützten Klon.
* Nächster Schritt: Vorbereitung der finalen Startbefehle für Nacht A (Mo 16.11. abends) mit den Prüfungen aus 24.3; danach, erst nach Go, Nacht B.
* Keine Messung läuft; nichts gestartet. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 26. Ergebnis der Non-US-Nachtmessung (c3, Nächte A und B), Netzdiagnose, Auswertungsskript, Kostenanalyse (Stand 18.11.2026) (nur angehängt; Abschnitte 1–25 unverändert)

### 26.1 Läufe und Technik [belegt]
* **Ausgangsstand:** Protokoll im Repo `UIQ-Suite` Commit `a9e009d` (16.11.2026), 606 Zeilen, Hash-Präfix `7ec913fa71e218a0`; identisch mit der zu Sitzungsbeginn hochgeladenen Fassung.
* **Nacht A** (Börsentag D = Mo 16.11., Messdatum Di 17.11.): Prüfung nach 24.3 am 16.11. um 20:04Z bestanden (Hashes `d81a01dfdd176690` und `17f366b05532637a`, yfinance 1.5.2, Python 3.13.1, Trockenlauf 31 Prüfungen, kein anderer Messprozess, Netzteil). Start nach Axels Go um 20:05:47Z, Lauf `20261116T200547Z`; `caffeinate`-Zusicherung `PreventUserIdleSystemSleep` für den Messprozess geprüft. Log: Slots 00:10Z bis 05:40Z (34) ohne Fehler; ab 05:50Z je Slot 9 bis 26 von 28 Abrufen nicht ok, Verspätungen bis 494 s, Abbruch durch `TimeoutExpired` in 08:40Z und 09:30Z, übersprungen 08:50Z und 09:40Z; Ende 10:06:52Z. Abrufe (je Ticker und Slot einmal gezählt): Tagesabruf 614 ok, 170 `fetch_failed`; Intraday 559 ok, 225 `empty`. Dateien: Serie-CSV `3c5ee46af0259a0d` (4 473 Datenzeilen), Meta `9742aadb9b24c39e`, Log `364896dfed4f8ee3`.
* **Nacht B** (D = Di 17.11., Messdatum Mi 18.11.): Prüfung nach 24.3 am 17.11. um 21:16Z bestanden (gleiche Werte; zusätzlich aktive Schnittstelle `en0` = WLAN). Start nach Axels Go um 21:17:04Z, Lauf `20261117T211704Z`; Zusicherung geprüft. Alle 60 Slots mit 28 Abrufen ok, Verspätung 0 s, Ende 10:00:05Z. Abrufe: Tagesabruf 840 ok, Intraday 840 ok. Dateien: Serie-CSV `c6c91172fe8dd37d` (5 880 Datenzeilen), Meta `d8794443a8bc9dfd`, Log `63a10f7e699b050c`.
* Beide Läufe: c3 v1.1 laut Meta, Modus `nonus`, 14 Ticker, 4 Worker, 60 Slots im 10-Minuten-Raster 00:10Z bis 10:00Z. Keine Änderung an c3, Watchlist, Repo oder Produktion.

### 26.2 Auswertungsskript `c3_nacht_auswertung.py` [belegt]
* **v1.0** (309 Zeilen, `b321fcee36a4ca8e`): vor der Auswertung am 17.11. zur Ansicht vorgelegt, Go durch Axel am 17.11. um 11:38 MEZ; danach unverändert für beide Nächte verwendet. Setzt 24.4 um (Zustände V/L/F nur aus `versuch=2y_explicit`, U für Fallback-Abrufe, A für Messausfälle, X für ausgeschlossene Ticker nur per Argument; AU-Ticker getrennt; Kenngrößen je Ticker und Zählung je Slot; Vergleich des ersten V-Slots zwischen den Nächten). Zusätzlich, beschreibend und vor der Auswertung offengelegt: „Rückfälle“ (Slot mit L oder F nach dem ersten V). Selbsttest mit künstlichen Daten: 10 von 10.
* **v1.1** (312 Zeilen, `60492d9a0757ef62`, 18.11., Freigabe Axel 18.11. 11:11 MEZ): gegenüber v1.0 ausschließlich der Name des separat ausgewerteten Tickers in Kopfkommentar, Aufrufbeispiel und Selbsttest durch einen Platzhalter ersetzt sowie die Versionsangabe geändert; Auswertungslogik, Parameter und Ausgabeformat unverändert (`diff` der beiden Skripte geprüft).
* **Nachweis der Gleichheit:** Beide Nächte mit v1.1 erneut ausgewertet. Bericht: einziger Unterschied ist die Versionszeile (Rest beider Berichte Hash-Präfix `0d6c731e78ce041e`); Zustandsmatrix identisch (`02f8c7f46f7ba7a5`, 1 680 Datenzeilen). Bericht v1.0 `b7d4906274d2639d` (338 Zeilen).
* **Aussagekraft des Selbsttests:** v1.1 besteht 10 von 10. Mutationsprüfung mit drei absichtlich eingebauten Fehlern an Kopien beider Fassungen, mit identischem Ergebnis: vertauschte Zustände L/V erkannt (6 von 10), fehlende Gruppentrennung erkannt (9 von 10); ein Fehler in den Kenngrößen der separaten Gruppe wird in **beiden** Fassungen nicht erkannt. Das ist eine Lücke des Selbsttests seit v1.0, keine Folge der Bereinigung; nicht behoben, weil eine Änderung des Tests nicht freigegeben ist.
* **Ablage:** vorgesehen `uiq-devtools/datenreife/c3_nacht_auswertung.py` (v1.1). `uiq-devtools` ist öffentlich; das Skript enthält keine Tickernamen mehr. Bericht und Zustandsmatrix enthalten Tickernamen und gehören nicht in ein öffentliches Repo; Abschnitt 26 nennt deshalb keine Tickernamen (Entscheidung Axel 18.11.). Commit durch Axel, noch nicht erfolgt (Stand `uiq-devtools` `b205b38`).

### 26.3 Ergebnis Nacht A (D = Mo 16.11.) [belegt]
* **13 europäische Ticker:** 00:10Z bis 05:40Z (34 Slots, alle Abrufe ok) bei allen 13 in jedem Slot **L** (Zeile von D vorhanden, Close leer); F kam nicht vor. Ab 05:50Z überwiegend Messausfälle: von 780 Ticker-Slots der Hauptgruppe 207 A und 79 U.
* Letztes L bei 11 Tickern um 08:30Z, bei je einem Ticker um 08:20Z und 06:50Z (jeweils wegen nachfolgender Lücken). Erstes V: 09:10Z bei 5 Tickern, 09:20Z, 09:50Z und 10:00Z bei je einem Ticker (die drei späten Werte jeweils hinter Messlücken). Bei 5 Tickern gibt es nach 08:30Z keinen gültigen Messpunkt; für sie ist der Übergang **nicht gemessen** (nicht: ausgeblieben). Die Slots 08:40Z und 08:50Z fehlen ganz, 09:00Z enthält nur U und A.
* **Übergang L → V in Nacht A: zwischen 08:30Z und 09:10Z**, wegen der Messlücken nicht enger bestimmbar.
* Nach dem ersten V blieb der Close unverändert, keine Rückfälle. Separat ausgewerteter AU-Ticker (24.4): V ab 00:10Z in allen gemessenen Slots.

### 26.4 Ergebnis Nacht B (D = Di 17.11.) [belegt]
* **13 europäische Ticker:** 00:10Z bis 08:40Z bei allen 13 in jedem Slot **L**; 08:50Z bis 10:00Z bei allen 13 **V**. Kein F, U oder A. Der Close blieb nach dem ersten V überall unverändert, keine Rückfälle.
* **Übergang L → V in Nacht B: zwischen 08:40Z (letzte Messung mit L) und 08:50Z (erste Messung mit V), bei allen 13 Tickern im selben Intervall.** 08:50Z ist der erste nachgewiesene gültige Messpunkt, nicht der tatsächliche Veröffentlichungszeitpunkt bei Yahoo.
* Separat ausgewerteter AU-Ticker: V in allen 60 Slots ab 00:10Z.

### 26.5 Gemeinsame Befunde und Vergleich der Nächte [belegt als Beobachtung]
* In beiden Nächten ist die Zeile des Börsentags D bei allen 13 europäischen Tickern ab 00:10Z vorhanden, aber ohne Close; das Fehlen der Zeile (F) kam in keinem Slot vor. Der Wechsel auf einen gültigen Close war in beiden Nächten danach stabil.
* Das Skript nennt bei 8 Tickern einen Unterschied des ersten V-Slots von mehr als einem Slot (2 bis 7 Slots, Nacht B früher). Diese Unterschiede sind eine Folge der Messlücken in Nacht A (letztes gemessenes L 08:30Z, keine gültige Messung bis 09:10Z), keine belegte Abweichung im Verhalten der Quelle; der Bereich von Nacht A (08:30Z bis 09:10Z) schließt das Intervall von Nacht B (08:40Z bis 08:50Z) ein. Für 5 Ticker entfällt der Vergleich (in Nacht A kein V). AU-Ticker: kein Unterschied.

### 26.6 Netzdiagnose zu Nacht A (Befund, Hypothese und Offenes getrennt)
* **Befund [belegt]:** Bruch zwischen Slot 05:40Z (28 Abrufe in 5 s) und Slot 05:50Z (22 nicht ok, fast 6 min). Median der Abrufdauer vorher 0,6 s (Tagesabruf) bzw. 0,5 s (Intraday), ab 05:50Z 30,0 s bzw. 10,0 s. Fehlertexte unspezifisch („keine Daten“, „keine Intraday-Balken“); c3 speichert die ursprüngliche Fehlermeldung von yfinance nicht. Die 79 U sind dasselbe Symptom (erster Versuch gescheitert, Fallback erfolgreich).
* **Mac [belegt]:** `pmset`-Log ohne Ruhezustand oder Aufwachen; die `caffeinate`-Zusicherung bestand durchgehend. Ab 06:37 MEZ Aktivität auf dem Mac (Kontakte, Audio, Xcode), um 06:49:44 MEZ Systemstatus „SysAct“. Netz-Log (`com.apple.network`, nur Verbindungen anderer Programme; der Verkehr von c3 erscheint dort vermutlich nicht [nicht geprüft]): Verbindung über WLAN `en0`, Qualität bis 06:49 MEZ fast durchgehend „moderate“, ab dem 10-Minuten-Block 06:50 MEZ wiederholt „minimal“; Zeitüberschreitungen anderer Programme im Block 06:40 bis 06:49 MEZ 65 (vorher 5 bis 28 je Block), ein Siri-Abbruch nach 30 s um 06:45 MEZ. Vor 05:10 MEZ enthält das Log fast keine Netz-Einträge, daher kein Vergleich mit der ruhigen Nachtphase.
* **WLAN-Momentaufnahme 17.11. 17:38 MEZ [belegt]:** 802.11n, 2,4 GHz, Kanal 1, 20 MHz, Signal −60 dBm, Rauschen −98 dBm, Senderate 104 Mbit/s. Netz laut Axel: Fritzbox am Vodafone-Kabelanschluss, dahinter Google-Mesh. Ein eingebauter LAN-Anschluss ist am Mac nach der Schnittstellenliste wahrscheinlich nicht vorhanden [nicht geprüft].
* **Hypothese:** Die Ausfälle in Nacht A passen zu einer vorübergehend verschlechterten WLAN- oder Mesh-Strecke ab etwa 06:45 MEZ; eine Drosselung durch Yahoo ist zur Erklärung nicht nötig, aber nicht ausgeschlossen. Nacht B lief über dieselbe WLAN-Verbindung ohne jeden Fehler; ein WLAN-Dauerproblem ist damit **unwahrscheinlich**.
* **Offen:** Die Ursache der Störung in Nacht A ist **ungeklärt**. Nicht geprüft: Ereignisprotokoll der Fritzbox (Abbruch oder Neuaufbau der Internetverbindung am 17.11. zwischen 06:30 und 10:40 MEZ) und Zustand der Mesh-Strecke in der Google-Home-App.

### 26.7 Diagnosebegriffe `ROW_PRESENT` und `CLOSE_VALID` (Anregung des Reviewers, 18.11.2026)
* Für das Diagnosemodell werden zwei Begriffe festgehalten: `ROW_PRESENT` = die Tageszeile des erwarteten Börsentags ist im Abruf enthalten; `CLOSE_VALID` = ihr Close ist gültig. Sie entsprechen den c3-Zuständen L (nur `ROW_PRESENT`) und V (`ROW_PRESENT` und `CLOSE_VALID`). Eine vorhandene Tageszeile allein ist kein ausreichendes Qualitätskriterium.
* Nur Begriffe im Diagnosemodell; keine Änderung an Produktionslogik, Aggregator, Gate oder `SUITE.md`.

### 26.8 Einordnung [empirischer Befund, keine Garantie]
* An den bisher gemessenen Handelstagen der 13 europäischen Ticker lag der Wechsel auf einen gültigen Close: an den sieben Vormittagstagen aus Abschnitt 18.3 im Slot 08:45Z oder 09:00Z (15-Minuten-Raster), in Nacht B zwischen 08:40Z und 08:50Z; in Nacht A wegen der Messlücken nur zwischen 08:30Z und 09:10Z eingrenzbar. **An acht der neun Tage ist ein gültiger Close spätestens um 09:00Z belegt; der neunte (Nacht A) widerspricht dem nicht, belegt es aber nicht.** 09:00Z ist damit ein empirischer Befund aus neun Handelstagen mit 14 Tickern, **keine technische Garantie**; Feiertage, Halbtage, andere Märkte und die Sommerzeit sind nicht abgedeckt.
* **Produktionsimplikation [nicht nachgewiesen]:** Ein Produktionslauf vor etwa 08:40Z des Folgetags kann nach diesen Messungen bei den europäischen Titeln keinen gültigen Close sehen; das ist mit den 32 von 33 unvollständigen Non-US-Zeilen in den Snapshots (Abschnitte 20 und 23) vereinbar. Die in 24.4 vorgesehene Gegenüberstellung mit den tatsächlichen Produktionsläufen dieser Nächte ist **nicht durchgeführt** (Entscheidung Axel 18.11.: späteres Go; bevorzugt Lesezugriff auf `uiq-archive` für diese Sitzung und Bereitstellung der Run-Liste von GitHub Actions). Offene Fragen dafür (Reviewer 18.11.): tatsächlicher Start der Läufe, Zeitpunkt der Yahoo-Abrufe (nach Abschnitt 21.5 nur aus `meta.generated` schätzbar), Zustand der europäischen Ticker zu diesem Zeitpunkt, Übernahme leerer Closes in die Snapshots, spätere Läufe mit korrekten Werten.
* **Keine Produktionsänderung:** kein 09:00Z-Guard, keine Verschiebung von Läufen (beides nicht freigegeben). Reviewer (18.11.) und Axel stimmen darin überein.

### 26.9 Kostenanalyse der Anthropic-API und beschlossener Plan (16.11.2026; übernommen wie dokumentiert)
* **Dokument:** „UIQ — Kostenanalyse private Nutzung“, Arbeitsfassung als Claude-Dokument (https://claude.ai/artifact/7A48EaejWy5jqC5CHBGWyu). Festgehaltener Stand als Markdown `KOSTENANALYSE-API-2026-11-16.md` (176 Zeilen, `d26e3fae5a89ea07`), Ablageort nach Entscheidung Axel `UIQ-Suite/docs/` (Axel ist bekannt, dass `UIQ-Suite` öffentlich ist). Im Repo noch nicht vorhanden (geprüft am 18.11. gegen Commit `a9e009d`).
* **Messgrundlage:** Token-Export der Anthropic Console 01.09. bis 16.11.2026, gerechnet zu Listenpreisen; Abgleich mit der Cost-Seite der Console offen. September 85,78 USD (Entwicklungs- und Testphase), Oktober 44,81 USD, 1. bis 16.11. 19,58 USD für UIQ (zusätzlich 2,46 USD am 15.11. für ein anderes Projekt Axels über denselben Key). **Normalbetrieb rund 41 USD pro Monat**: Public Digest etwa 1,46 USD pro Nacht (rund 31 USD pro Monat), Aggregator-Enrichment etwa 0,31 USD pro Lauf (rund 9 USD pro Monat), Live-Pfad nahezu 0; Infrastruktur 0 USD (GitHub Actions im öffentlichen Repo, Cloudflare Free-Plan laut Axel). Die Zuordnung der So/Mo-Kosten zu den Dispatch-Läufen ist eine Hypothese.
* **Beschluss Axel (16.11.2026, 22:18 MEZ), zwei getrennte Stränge:**
  * **Strang A, Batch-API für den Digest (ca. −15 USD/Monat):** (1) Offline-Test auf Axels Mac frühestens Do 19.11.2026, mit archivierter Master-Datei, ohne Cloudflare-Zugangsdaten und damit ohne KV-Schreiben; Befehl und Nebenwirkungen vorher, Start nur nach Go. (2) Absicherung im Skript (Rückfall auf den synchronen Weg bei Timeout, kein Veröffentlichen eines leeren Digests), Batch bleibt dabei aus; eigene Nacht, Freeze-Ausnahme durch Axel nötig. (3) Aktivierung `USE_BATCH_API=true`; eigene Nacht, Freeze-Ausnahme nötig. Code-Befunde (gelesen 16.11., nicht getestet): Batch-Pfad laut Changelog v1.13 nie live; bei Überschreitung der Wartezeit (20 min) fallen alle 15 Strategien aus; kein Schutz gegen 0 von 15 gefunden; abgeschnittene Antworten werden im Batch nicht wiederholt; Job-Limit 45 min.
  * **Strang B, Haiku 5.5 für das Aggregator-Enrichment (ca. −8 USD/Monat):** (1) Vorprüfung nur lesend im Archiv; (2) Schattentest offline nach dem Entwurf im Dokument, Skript, Prüfkriterien und Nächte vorher zur Freigabe; (3) Umstellung danach als eigene Entscheidung mit eigener Nacht.
  * **Zurückgestellt:** So/Mo-Läufe bleiben unverändert (sie liefern die einzigen Snapshots mit vollständigen US- und Non-US-Zeilen, Abschnitt 20.3). **Nicht verfolgt:** Batch-API für das Enrichment.
  * Regeln für beide Stränge: eine Produktionsänderung pro Nacht, nichts ohne Axels ausdrückliches Go, Befehl und Nebenwirkungen vorher, ganze Dateien, Axel committet selbst, Prüfung per Hash.
* **Reviewer-Einschätzung (16.11.2026, 22:23 MEZ, Datei `10f00d1f-attachment.txt`, `2b7d847ef604285f`):** bestätigt Plan und Reihenfolge. Die Präzisierungen von Claude dazu (Abnahmekriterien Batch, Zeitbudget, Bestehen je Aufrufart statt gewichtetem Mittel, eine Modellkonstante für den Rückweg, Kostenprognose 16 bis 17 USD, getrennter API-Key ohne Produktionseingriff, Warnschwelle erst nach Aktivierung) sind im Dokument festgehalten und **noch nicht von Axel entschieden**.
* Stand 18.11.: Keiner der Schritte ist gestartet.

### 26.10 Maßgebliche Dateien und Hashes (Präfixe, SHA-256)
* Messung: Nacht A Serie `3c5ee46af0259a0d`, Meta `9742aadb9b24c39e`, Log `364896dfed4f8ee3`; Nacht B Serie `c6c91172fe8dd37d`, Meta `d8794443a8bc9dfd`, Log `63a10f7e699b050c` (alle lokal auf Axels Mac in `~/uiq-c2-lokal`, nicht im Repo).
* Auswertung: Skript v1.0 `b321fcee36a4ca8e`, v1.1 `60492d9a0757ef62`; Bericht A+B (v1.0) `b7d4906274d2639d`; Zustandsmatrix A+B `02f8c7f46f7ba7a5` (beide mit Tickernamen, nicht im Repo).
* Diagnose und Reviewer: `pmset`-Ausschnitt `09e477e85a009a24`, Netz-Log-Ausschnitt `e14e8a4515e9c8e7`, Reviewer 18.11. `ce28178b7e19607a`, Reviewer 16.11. `2b7d847ef604285f`.
* Kosten: `KOSTENANALYSE-API-2026-11-16.md` `d26e3fae5a89ea07`.
* Unverändert: c3 `d81a01dfdd176690`, Watchlist `17f366b05532637a`, weitere Werte aus 25.2.

### 26.11 Stand der Freigaben und Status
* **Freigegeben und erledigt (18.11.):** bereinigte Fassung v1.1 des Auswertungsskripts mit Nachweis der Gleichheit; dieser Abschnitt 26.
* **Nicht freigegeben:** Commits oder Pushes durch Claude; Änderungen an produktiven Abläufen; Produktionsabgleich nach 24.4 (späteres Go); 09:00Z-Guard oder Verschiebung von Läufen; Änderung an c3, Watchlist oder am Selbsttest; Schritte der Kostenstränge ohne einzelnes Go.
* **Von Axel zu committen:** `uiq-devtools/datenreife/c3_nacht_auswertung.py` (v1.1); `UIQ-Suite/docs/KOSTENANALYSE-API-2026-11-16.md`; diese Fassung von `UIQ-Suite/docs/UEBERGABE-2026-10-17.md`. Danach Prüfung per Hash gegen einen schreibgeschützten Klon.
* **Offen (nichts beauftragt):** Ursache der Störung in Nacht A (Fritzbox-Protokoll, Mesh); Lücke des Selbsttests bei den Kenngrößen der separaten Gruppe; Produktionsabgleich; Abgleich der Kosten mit der Cost-Seite der Console; Entscheidung über die Präzisierungen zum Kostenplan; weiterhin die offenen Punkte aus 25.4.
* Keine Messung läuft. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 27. Nachtrag 18.11.2026: Auswertungsskript v1.2 und redaktionelle Korrekturen der Kostenanalyse (nur angehängt; Abschnitte 1–26 unverändert)

### 27.1 Anlass
* Prüfung der zum Commit vorgesehenen Dateien durch einen Reviewer (Text von Axel am 18.11.2026 übermittelt, Datei `88308406-attachment.txt`, `d815346d42c53776`): In v1.1 wird V vergeben, wenn das Datum vorhanden ist und das Flag `close_nan` fehlt; der Close-Wert selbst wird nicht geprüft. Ein leerer Close oder `"nan"` ohne Flag würde als V gezählt. Weitere Punkte: Stabilität als Zeichenkettenvergleich; Selbsttest ohne Prüfung der Kenngrößen der separaten Gruppe (bekannt aus 26.2); fehlende Prüfungen der Kommandozeile und Fehlerbehandlung.
* **Prüfung an den Messdaten [belegt]:** In beiden Nächten haben alle Tageszeilen mit Status `ok` ohne `close_nan` einen numerischen, endlichen Close größer 0 (Nacht A 1 313, Nacht B 1 844), alle mit `close_nan` keinen numerischen Close (529 bzw. 676); 0 Widersprüche. Derselbe Zahlenwert erscheint nie in unterschiedlicher Schreibweise. c3 setzt `close_nan`, wenn der Wert fehlt oder NaN ist. **Die Ergebnisse in Abschnitt 26 sind von der Lücke nicht betroffen;** sie ist eine Robustheitsschwäche für künftige Daten.

### 27.2 Skript v1.2 (Freigabe Axel 18.11.2026 11:25 MEZ, Umfang wie freigegeben) [belegt]
* `c3_nacht_auswertung.py` v1.2, 347 Zeilen, SHA-256 `9a56fe211cb6827558f8a6012f486f0173d48e1fe3889ae79073138e83797c7a`. Änderungen gegenüber v1.1 (`60492d9a0757ef62`):
  * V nur noch, wenn kein `close_nan` vorliegt **und** der Close numerisch, endlich und größer 0 ist.
  * Ein ungültiger Close ohne Flag wird als L gewertet (Detail „Close ungueltig ohne Flag“); das entspricht der Definition von L in 24.4 („Close leer“), die Zustandsdefinitionen sind unverändert.
  * Neue Berichtszeile je Nacht: `Flag-Verstöße: <Anzahl>`.
  * Stabilität numerisch statt als Zeichenkette verglichen.
  * Selbsttest von 10 auf 15 Prüfungen erweitert: leerer Close, `"nan"` und `"inf"` jeweils ohne Flag ergeben L und werden als Verstoß gezählt; derselbe Wert als `5` und `5.0` gilt als stabil; Kenngrößen der separaten Gruppe werden geprüft (schließt die Lücke aus 26.2).
  * Nicht enthalten (später): Prüfungen der Kommandozeile und gezielte Fehlermeldungen bei fehlerhaften Eingaben.
* **Selbsttest:** 15 von 15. **Mutationsprüfung** an Kopien, alle fünf eingebauten Fehler erkannt: vertauschte Zustände L/V (Abbruch des Tests mit Fehler), fehlende Kenngrößen der separaten Gruppe (14 von 15), fehlende Gruppentrennung (14 von 15), entfernte Close-Prüfung (Abbruch des Tests mit Fehler), Stabilität wieder als Zeichenkette (14 von 15). Die in 26.2 genannte unerkannte Mutation wird jetzt erkannt.
* **Abnahme (Kriterium Axel):** Beide Nächte mit v1.2 neu ausgewertet. Zustandsmatrix identisch mit v1.0 (`02f8c7f46f7ba7a5…`). Bericht gegenüber v1.0 nur mit geänderter Versionszeile und je Nacht der zusätzlichen Zeile `Flag-Verstöße: 0` (Bericht v1.2 `74691f30d1432ade…`). Keine weiteren Abweichungen.
* **Ablage:** Statt v1.1 (26.2, 26.11) wird v1.2 in `uiq-devtools/datenreife/c3_nacht_auswertung.py` abgelegt; v1.1 wurde nicht committet. Keine Tickernamen im Skript. Commit durch Axel nach seiner Prüfung, noch nicht erfolgt.

### 27.3 Kostenanalyse: zwei redaktionelle Korrekturen (Freigabe Axel 18.11.2026 11:25 MEZ) [belegt]
* Hebel-Tabelle, Zeile „Wechsel auf Sonnet 5.5“: „ca. −5 USD“ → „ca. −6 USD“ (einheitlich mit der Tabelle „Modellwahl“: 44,31 → ca. 38 USD).
* Hinweis unter der Monatstabelle ergänzt, nachdem die Rohdaten es bestätigt haben: Die Summen sind aus ungerundeten Einzelwerten gebildet (September 79,3565 + 6,4267 = 85,7832 → 85,78; Oktober 44,3120 + 0,4946 = 44,8066 → 44,81); daher bis zu 0,01 USD Abweichung von der Summe der gerundeten Spaltenwerte.
* Keine weiteren Änderungen; Beschluss, Plan und offene Punkte unverändert. Datei `KOSTENANALYSE-API-2026-11-16.md` jetzt 178 Zeilen, SHA-256 `2e6d3badce7a6c0f92d66b9e0f1bb760aff5bee2a1add20487dbed0add31207e` (vorher `d26e3fae5a89ea07…`, nie committet). Die Arbeitsfassung (Claude-Dokument) ist gleich geändert.

### 27.4 Status
* Zu committen durch Axel nach seiner Prüfung: `uiq-devtools/datenreife/c3_nacht_auswertung.py` (v1.2), `UIQ-Suite/docs/KOSTENANALYSE-API-2026-11-16.md` (neue Fassung), diese Fassung des Protokolls. Danach Prüfung per Hash gegen einen frischen Klon.
* Unverändert nicht freigegeben: Commit oder Push durch Claude, Produktionsabgleich nach 24.4, 09:00Z-Guard oder Verschiebung von Läufen, jede Änderung an Produktion, c3 oder Watchlist, Schritte der Kostenstränge ohne einzelnes Go.
* Keine Messung läuft. Keine Änderung an Gate, Aggregator, Workflows, Worker, Digest, KV, Archiv, `SUITE.md`; Freeze und C1-Sperre unverändert; Gate Papiermodell.

## 28. Abgleich der Non-US-Nachtmessung mit der Produktion, Läufe 389 bis 391, Nebenbefund Börsen-Suffixe (Stand 18.11.2026) (nur angehängt; Abschnitte 1–27 unverändert)

### 28.1 Freigabe, Quellen, Grenzen
* Freigabe Axel 18.11.2026 11:49 MEZ für den in 24.4 vorgesehenen Abgleich; Zugriff wie von Axel bevorzugt: `uiq-archive` nur lesend an diese Sitzung angehängt (Stand `ac57ef8`), Run-Liste von Axel ohne Token über die öffentliche Actions-API abgerufen (`runs_market_aggregator_1118.json`, Lauf 382 bis 391, SHA-256 Präfix `6aafb51c14fc5c66`). Ausgewertet: Snapshots `2026-11-17_04` (`40a824b6ae30a347`) und `2026-11-18_03` (`88469319a62a4288`) gegen die c3-Messungen aus Abschnitt 26; `market_aggregator.py` in `ko-aggregator` (`main`, v5.48.0) nur gelesen.
* Reichweite: zwei Produktionsläufe, 13 europäische Titel und ein AU-Titel der c3-Watchlist. Keine Aussage über andere Nächte, Titel oder Märkte. Reviewer-Einschätzung vom 18.11. (Datei `198ced0b-attachment.txt`, `0c5c673edfc392e0`) in die Formulierungen übernommen.

### 28.2 Läufe der beiden Nächte [belegt aus Run-Liste und Archiv-Commits]
| Lauf | Auslöser | erstellt (UTC) | Ergebnis | Snapshot im Archiv |
|---|---|---|---|---|
| 389 | `workflow_dispatch` | Di 17.11. 04:15:29 | success, Ende ca. 04:42Z | `2026-11-17_04` (Archiv-Commit „run 389“) |
| 390 | `schedule` (Plan Mo 22:00Z) | Di 17.11. 04:21:50 | failure, Ende ca. 04:51Z | keiner |
| 391 | `schedule` (Plan Di 22:00Z) | Mi 18.11. 03:25:13 | success | `2026-11-18_03` („run 391“) |
* **Korrektur einer Annahme:** Nacht A wurde nicht durch einen verspäteten planmäßigen Lauf abgedeckt, sondern durch den Dispatch-Lauf 389. Der planmäßige Lauf 390 wurde 6,36 h nach 22:00Z erzeugt (bisher größte Verspätung 5,98 h, Lauf 382) und schlug fehl. Lauf 391 (Nacht B): 5,42 h Verspätung, erfolgreich.
* Die in dieser Sitzung zuvor aus `meta.generated` geschätzten Startzeiten (ca. 04:15Z und 03:25Z) stimmen mit der Run-Liste überein.
* **Offen:** Wer den Dispatch 389 ausgelöst hat (`actor: ahsub` belegt nicht, dass es der Watchdog war; plausibel wegen der Uhrzeit 04:15Z wie bei den bekannten Sonntags-/Montagsläufen, nicht nachgewiesen). Die Ursache des Fehlschlags von 390: Der Workflow hat seit v1.5 eine `concurrency`-Sperre ohne Abbruch; ein Zusammenhang mit Lauf 389 ist denkbar, aber weder das Warten noch die Fehlerursache ist ohne Fehlerprotokoll belegt. Dass der 04:15Z-Dispatch auch an Werktagen einspringt, ist bisher **in dieser einen Nacht beobachtet**, kein belegtes Muster.

### 28.3 Ergebnis des Abgleichs [belegt für die zwei untersuchten Läufe]
| | Nacht A (D = Mo 16.11.), Lauf 389 | Nacht B (D = Di 17.11.), Lauf 391 |
|---|---|---|
| `meta.generated` | 04:18:14Z | 03:27:28Z |
| `updated` der 14 Titel (Verarbeitungszeitpunkt, als Abrufzeit nur Näherung) | 04:16:58Z bis 04:17:01Z | 03:26:28Z bis 03:26:29Z |
| c3-Zustand im Slot davor (04:10Z bzw. 03:20Z) | 13 europäische Titel L, AU-Titel V | 13 europäische Titel L, AU-Titel V |
| Snapshot, 13 europäische Titel | `_lastRowIncomplete = true`, `_lastCloseDate` = 13.11. | `_lastRowIncomplete = true`, `_lastCloseDate` = 16.11. |
| Kurs (`price`) gegen c3-Close desselben Datums | in allen 13 Fällen gleich (Abweichung 0,0 %) | in allen 13 Fällen gleich |
| Snapshot, AU-Titel | vollständig, `_lastCloseDate` = D | vollständig, `_lastCloseDate` = D |
* Beide untersuchten Snapshots entstanden 4,5 bis 5,5 h vor dem in Abschnitt 26 gemessenen Übergang von L nach V (Nacht B: 08:40Z bis 08:50Z).
* **In den beiden untersuchten Produktionsläufen wurde bei keinem der 13 europäischen Titel ein leerer Close als Kurs übernommen;** verwendet wurde der letzte gültige Close, die Unvollständigkeit ist je Titel gekennzeichnet. Im gesamten Non-US-Bestand dieser Läufe zeigt `data_integrity` 30 von 31 Titeln unvollständig.
* **In Nacht A ist die Übernahme des Montags-Close im Folgelauf vom 18.11. (Lauf 391) für alle 13 europäischen Titel nachgewiesen.** Für Nacht B wird die Übernahme des Dienstags-Close im Lauf vom 19.11. erwartet; sie ist **noch nicht geprüft**.
* **Offen [nicht untersucht]:** Bei diesen Titeln zeigt `_dataAsOf` den Börsentag D, der Kurs stammt vom vorherigen Handelstag. Ob Frontend oder Prompts dadurch einen falschen Datenstand anzeigen, ist nicht geprüft.
* Damit ist der Abgleich nach 24.4 für die zwei untersuchten Nächte abgeschlossen. Keine Produktionsänderung abgeleitet.

### 28.4 Nebenbefund: fehlende Börsen-Suffixe `.MC` und `.BR` [belegt]
* `_NON_US_EXCHANGE_SUFFIXES` in `market_aggregator.py` (`main`, v5.48.0) enthält `.DE .PA .AS .MI .SW .L .CO .ST .AX`, aber nicht `.MC` (Madrid) und `.BR` (Brüssel). `_derive_home_market()` gibt für unbekannte Suffixe `US` zurück. Je ein Titel mit diesen Suffixen erhält deshalb in allen geprüften Snapshots `homeMarket = 'US'`.
* **Folgen [belegt]:** Der Rest „US unvollständig n = 2 (0,3 %)“ in den Werktagsläufen vom 07.11. bis 18.11. besteht genau aus diesen beiden Titeln; die Non-US-Diagnostik zählt 31 statt 33 Titel (erklärt den Unterschied zu „32 von 33“ in Abschnitt 20.4). **Möglich, nicht geprüft:** Die KO-5-Guardrail (Gap-Risiko bei US-Titeln) und die Prompts behandeln beide Titel als US-Titel.
* Keine Änderung vorgenommen (Freeze; nicht freigegeben). Vor einer Korrektur ist das gesamte Ticker-Universum auf fehlende Börsen-Suffixe zu prüfen; eine Ergänzung wäre eine Produktionsänderung mit eigener Nacht und eigenem Go.

### 28.5 Ursache der Störung in Nacht A (Nachtrag zu 26.6)
* Nach Angabe von Axel (18.11.2026): Eine Umstellung eines Mesh-Routers führte zur Netzwerkstörung während Nacht A; die Konfiguration wurde inzwischen korrigiert. Nacht B verlief über die korrigierte Verbindung ohne weitere Störungen. Eine unabhängige technische Verifikation der Ursache liegt nicht vor.

### 28.6 Neue offene Punkte (Backlog, nichts beauftragt)
* Prüfung des Ticker-Universums auf fehlende Börsen-Suffixe, insbesondere `.MC` und `.BR`, und ihre Wirkung auf KO-5, Prompts und Diagnostik.
* Verhalten bei einem Dispatch-Lauf und einem nachfolgenden planmäßigen Lauf in derselben Nacht (Lauf 389/390); Ursache des Fehlschlags von 390 bleibt offen, bis Axel bei Bedarf die Fehlerzeilen aus GitHub Actions bereitstellt (keine Voraussetzung für diesen Abschnitt).
* Übernahme des Dienstags-Close (Nacht B) im Lauf vom 19.11. prüfen.
* Anzeige des Datenstands bei Non-US-Titeln (`_dataAsOf` gegenüber `_lastCloseDate`).

### 28.7 Status
* Keine Produktionsänderung, keine Änderung an `market_aggregator.py`, Workflows, Worker, Digest, KV, Archiv oder `SUITE.md`; keine neue Messung. `uiq-archive` nur gelesen. Freeze und C1-Sperre unverändert; Gate Papiermodell. Commit dieses Abschnitts durch Axel nach Prüfung.

## 29. Prüfung der Börsenzuordnung `homeMarket` (Suffix-Prüfung, Stand 18.11.2026) (nur angehängt; Abschnitte 1–28 unverändert)

### 29.1 Auftrag, Umfang und Quellen
* Freigabe Axel 18.11.2026 12:02 MEZ, nur lesend; Gliederung dieses Abschnitts nach Vorschlag Axel/Reviewer (12:06 MEZ). Anlass: Nebenbefund 28.4.
* Quellen (SHA-256-Präfixe): aktueller Snapshot `2026-11-18_03` aus `uiq-archive` (`88469319a62a4288`, 761 Titel, entspricht dem tatsächlich laufenden Bestand einschließlich dynamisch freigegebener Ticker); `ticker_master.json` (`f353cfc3b02a7ea0`, 818 Einträge) und `market_aggregator.py` (`3c31d1f44207caa6`, v5.48.0) aus `ko-aggregator` `main` Commit `330f07f`; `ko-prompts.js` (`c12bbd1ac26b73e7`, in `ko-modules` `e82508a` und als identische Kopie in `UIQ-Suite/scripts/vendor/`); `generate_public_recommendations.js` (`16ba91e3e05ea7d5`, `UIQ-Suite` `e8914cb`); `ko-kv-state.js` (`971e94a888361347`, `ko-modules`); `index.html` (`630e29c47531128a`, `axel-scanner` `d3391e6`). Für das Auftreten in Ausgaben: 50 Snapshots vom 01.10. bis 18.11.2026 aus `uiq-archive`.
* Keine Tickernamen in diesem Abschnitt; betroffene Titel werden über ihren Suffix bezeichnet.

### 29.2 Ergebnis der Suffix-Prüfung [belegt]
* Zuordnung: `_derive_home_market()` prüft das Ende des Symbols gegen `_NON_US_EXCHANGE_SUFFIXES` (`.DE .PA .AS .MI .SW .L .CO .ST .AX`) und gibt für jedes andere Symbol `US` zurück.

| Suffix | in der Tabelle | aktiv (im Snapshot) | nur in `ticker_master`, inaktiv | Zuordnung |
|---|---|---|---|---|
| `.DE .L .MI .PA .ST .AX` | ja | 18 / 7 / 2 / 2 / 1 / 1 | weitere | korrekt |
| `.SW .CO .AS` | ja | 0 | 11 / 5 / 5 | wäre korrekt |
| `.MC` (Madrid) | nein | 1 | – | **US, falsch** |
| `.BR` (Brüssel) | nein | 1 | 2 (`in_universe: false`, in `BAD_SYMS`) | **US, falsch** |
| `.HE` (Helsinki) | nein | 0 | 1 (`in_universe: false`) | wäre US, falsch (Vorsorgebefund) |
| `.HK`, `.TW` | nein | 0 | 5 (alle in `BAD_SYMS`) | wäre US, falsch (Vorsorgebefund) |
| `-USD` (Kryptowährungen) | – | 13 | – | **US, fachlich unzutreffend** (Handel rund um die Uhr, keine Börse mit Schlusszeit) |
* Ohne Bedeutung für die Zuordnung: der Dollar-Index mit Suffix `.NYB` (nur Marktkontext), eine Schreibweise mit `.B` nur in einer Namenszuordnung, Aktiengattungen mit Bindestrich (korrekt zugeordnet).
* **Ergebnis:** Im aktiven Bestand sind zwei Titel (je einer `.MC` und `.BR`) und 13 Kryptowährungen als `US` zugeordnet. Die Ursache ist nicht nur die fehlende Tabellenzeile, sondern der stille Rückfall auf `US` bei jedem unbekannten Symbol.

### 29.3 Verwendung von `homeMarket` [belegt aus dem Code]
| Stelle | Verwendung | Rückfallwert |
|---|---|---|
| `market_aggregator.py`, `_derive_home_market()` | Erzeugung des Felds je Titel | `US` |
| `market_aggregator.py`, `calc_data_integrity` | Trennung US/Non-US der Diagnostik (`is_us = (homeMarket or "US") == "US"`) | `US` |
| `market_aggregator.py`, Leaderboards, `topResults`, Shortlist-Pfade | Weitergabe des Felds | – |
| `ko-prompts.js` (KO-Strategien und Fading Short) | KO-5 „Gap-/Overnight-Risiko“ und „Marktzugang“: bei `homeMarket=US` wird das Modell angewiesen, Handel an US-Börsen mit Zeitzonen-Versatz und eingeschränkte Hebelprodukte für Privatanleger seit 2017 zu benennen | – |
| `generate_public_recommendations.js` (Public Digest) | `homeMarket: raw.homeMarket \|\| 'US'`, Kandidatenzeile „Markt:…“ | `US` |
| `ko-kv-state.js`, `index.html` (Frontend, 4 Stellen) | Übernahme in den Scanner-Zustand | `US` |
* Der Rückfall auf `US` ist damit in Aggregator, Digest und Frontend fest eingebaut; ein fehlender Eintrag fällt an keiner Stelle auf. Für die falsch zugeordneten Titel würden die KO-5-Hinweise (US-Börse, Zeitzonen-Versatz, Einschränkung bei Hebelprodukten) inhaltlich nicht zutreffen.

### 29.4 Auftreten in den Snapshots [belegt für 50 Snapshots vom 01.10. bis 18.11.2026]
* Titel `.MC`: in den Leaderboards `short_breakdown` (10 Snapshots), `options_csp`, `options_weekly`, `options_collar` (je 9), `options_atmna` (7), `long_mr` (2).
* Titel `.BR`: in `short_breakdown` (5) und `short_fading` (2).
* Kryptowährungen: in mehreren Leaderboards, u. a. `short_fading` (4), `long_mr`, `long_swing`, `short_breakdown` und den Options-Leaderboards; außerdem in `masterShortlist`.
* **Offen:** Ob für einen dieser Titel ein KI-Text mit unzutreffendem Gap- oder Marktzugangshinweis erzeugt oder veröffentlicht wurde, ist nicht geprüft; die Ausgaben des Digests und der KI-Briefings liegen nicht im Archiv. Es wird nicht behauptet, dass solche Texte entstanden sind.

### 29.5 Technische Einordnung und mögliche Maßnahmen [Vorschläge, nicht beschlossen, keine Architekturentscheidung]
* Die Ergänzung von `.MC` und `.BR` würde die zwei aktuellen Fehlzuordnungen beheben, aber nicht verhindern, dass das nächste unbekannte Symbol wieder als `US` behandelt wird (fehlender Sicherheitsmechanismus statt nur fehlender Eintrag).
* Mögliche Schritte, jeweils eigene Entscheidung, eigene Nacht und eigenes Go:
  1. **Zuerst:** vollständige, ausdrückliche Zuordnung aller aktiven Titel prüfen und dokumentieren (rein lesend vorbereitbar), bevor die Rückfall-Logik geändert wird.
  2. Länderzuordnung ergänzen (`.MC`, `.BR`, vorsorglich `.HE`).
  3. Kryptowährungen **als eigene Marktklasse** führen, nicht als weiteres Börsenland; die KO-5- und Marktzugangsformulierungen in `ko-prompts.js` wären dafür gesondert zu prüfen.
  4. Kein stiller Rückfall auf `US` für unbekannte Symbole, ergänzt um einen Test, der für jeden aktiven Titel eine ausdrückliche Zuordnung verlangt.
* Jede dieser Maßnahmen wäre eine Produktionsänderung (Aggregator, Prompts, Digest oder Frontend) und fällt unter Freeze und die Regel einer Änderung pro Nacht.

### 29.6 Freigabestatus
* Nur lesend untersucht. Keine Änderung an Aggregator, Prompts, Digest, Frontend, Workflows, KV, Archiv oder `SUITE.md`; keine Freigabe für eine Umsetzung. Freeze und C1-Sperre unverändert; Gate Papiermodell.
* Getrennt davon weiterhin offen (28.6): Prüfung der Übernahme des Dienstags-Close im Lauf vom 19.11.; Ursache des Fehlschlags von Lauf 390. Commit dieses Abschnitts durch Axel nach Prüfung.

## 30. Fehlschlag von Lauf 390, Vorprüfung Kostenstrang B, Anzeige des Datenstands (Stand 18.11.2026) (nur angehängt; Abschnitte 1–29 unverändert)

### 30.1 Lauf 390 (Nacht A, planmäßiger Lauf nach dem Dispatch-Lauf 389)
* **Quelle:** Logzeilen und Schrittangaben aus der GitHub-Actions-Seite von Lauf 390, von Axel am 18.11.2026 zwischen 12:13 und 12:22 MEZ in den Chat kopiert; öffentliche Job-Seite von Lauf 390 (Job `aggregate`, Run-ID 44016655602, Job-ID 133823818170), von Claude am 18.11. ohne Anmeldung gelesen (Logs dort nur angemeldet sichtbar); Workflow `market-aggregator.yml` in der Fassung von `f20b443` und `main` nur gelesen.
* **Fehler [belegt]:** Schritt „Archive committen“, `git pull --rebase --autostash`: Ausgangsstand des Laufs `f20b443` (17.11. 00:49Z), auf dem Remote inzwischen `dd5f7b6` (Archiv-Commit von Lauf 389, 04:42:27Z). Beide Läufe hatten `data/iv_history/2026-11-17.json` angelegt; das Wiederanwenden der lokalen Änderungen scheiterte mit einem Konflikt, Exit-Code 128. Gleiche Fehlerart wie am 23.09.2026 (Kommentar v1.5 im Workflow), gegen die damals die `concurrency`-Sperre eingeführt wurde; die Sperre war in der Fassung `f20b443` vorhanden.
* **Digest [belegt]:** Der Schritt „Generate Public Recommendations“ lief um 04:50:41Z (Exit-Code 0), übersprang aber die Anthropic-Aufrufe („Kein neuer Handelstag seit letztem Digest (2026-11-16)“). Kein zweiter Digest, keine doppelten Digest-Kosten, der Digest von Lauf 389 wurde nicht überschrieben. (Axel sah den Schritt in der Oberfläche grau; maßgeblich ist hier das Log.)
* **Aggregator [belegt]:** Der Digest-Schritt las um 04:50Z eine `master_market_data.json` mit 761 Tickern auf dem Runner. Die Datei liegt nicht im Repo; sie wurde vom Aggregator-Schritt dieses Laufs erzeugt. Der Aggregator schreibt selbst nach KV (`push_to_cloudflare_kv`, Schlüssel `master_market_data`) und hat keinen frühen Abbruchpfad vor den Downloads außer bei Download-Totalausfall.
* **Wartezeit [belegt aus der Job-Seite]:** Der Job `aggregate` von Lauf 390 dauerte **8 min 29 s** („failed Nov 17, 2026 in 8m 29s“). Bei Ende 04:51:02Z lag der Job-Start damit gegen 04:42:33Z, also unmittelbar nach dem Ende von Lauf 389 (ca. 04:42Z). Die Differenz zur Erzeugung um 04:21:50Z war Wartezeit. **Die `concurrency`-Sperre hat in dieser Nacht gegriffen;** Lauf 390 lief nicht parallel. (Eine zwischenzeitliche Vermutung von Claude, Lauf 390 sei parallel gelaufen, beruhte auf der Annahme, ein Aggregatorlauf dauere 24 bis 30 Minuten; das ist die Dauer ganzer Läufe mit Digest-Erzeugung. Läufe ohne Digest dauern wie die Sonntags- und Montagsläufe rund 8 bis 9 Minuten, Abschnitt 23.3.) Die von Axel abgelesene Dauer „2 s“ für „Run Market Aggregator“ ist damit nicht vereinbar und bleibt ungeklärt [offen].
* **Mögliche Folgen [Hypothese, nicht geprüft]:** Lauf 390 hat gegen 04:50Z die Live-Daten in KV überschrieben; der Inhalt dürfte wegen gleichen Börsentags und gleicher Yahoo-Lage nahezu gleich sein, der archivierte Snapshot (Lauf 389) entspricht dann aber nicht genau dem Live-Stand des 17.11. Das KI-Enrichment lief zweimal (ca. 0,31 USD zusätzlich).
* **Ursache des Konflikts [Hypothese, gut gestützt]:** Die Sperre serialisiert die Läufe, aktualisiert aber nicht ihren Ausgangsstand: `actions/checkout` holt den Stand zum Zeitpunkt des Auslösers (Lauf 390: `f20b443`, laut Run-Liste und Job-Seite), nicht den Stand nach dem vorherigen Lauf. Schreibt ein wartender Lauf dieselben Tagesdateien wie der Lauf davor, kommt es beim Archiv-Commit zum Konflikt. Keine Änderung vorgenommen; eine Korrektur am Workflow oder am Watchdog wäre eine eigene Produktionsänderung mit eigenem Go.

### 30.2 Vorprüfung Kostenstrang B (Haiku-Schattentest), nur lesend [belegt für 50 Snapshots vom 01.10. bis 18.11.2026]
* **Sonnet-Antworten als Vergleichsbasis vorhanden:** in allen 50 Snapshots Shortlist `ki` bei 15 von 15 Kandidaten, Options-Watchlist `ki` und `ki_eic` bei 15 von 15.
* **Prompt-Eingaben vorhanden:** Alle in die beiden Prompts eingesetzten Werte stehen im Snapshot (Shortlist: Symbol, Strategie, Kurs, ATR, RSI, Überhitzung, Score; Options: Kurs, HVP, Scores, RSI, Abstand EMA200). Der Marktkontext stammt laut Code (`enrich_context`) nur aus `vixTerm` und `regimeUsed`, beide im Snapshot.
* **Einschränkungen:** `_macroNote` fehlt in den Snapshots vom 10.11. bis 16.11.; der Code setzt das Feld nur bedingt und verwendet sonst den Standardtext „keine besonderen Auffälligkeiten“ (abgeleitet, nicht durch einen Lauf geprüft). Der Prompt-Text selbst ist nicht gespeichert; er muss aus dem Code nachgebaut werden, die wörtliche Gleichheit ist nicht beweisbar.
* **Vorschlag für das Testdesign (nicht beschlossen):** Neben Haiku in einer Nacht auch Sonnet mit den nachgebauten Prompts erneut aufrufen (ca. 0,30 USD), um den Nachbau zu prüfen und die Schwankung von Sonnet zwischen zwei Läufen als Maßstab für die Bewertung von Haiku zu erhalten.
* **Ergebnis:** Der Schattentest ist mit archivierten Daten durchführbar. Weiterer Schritt nach dem Plan in 26.9 nur mit eigenem Go (Skript, Prüfkriterien und Nächte vorher zur Freigabe).

### 30.3 Anzeige des Datenstands bei Non-US-Titeln (Punkt aus 28.6), nur lesend [belegt aus dem Code]
* `_dataAsOf`, `_lastCloseDate` und `_lastRowIncomplete` werden in keinem nachgelagerten Teil gelesen (geprüft: `index.html` in `axel-scanner` `d3391e6`, `ko-prompts.js` und `ko-kv-state.js` in `ko-modules` `e82508a`, `generate_public_recommendations.js` in `UIQ-Suite`, Worker-Repo `workers`). Die Felder sind rein diagnostisch.
* Angezeigt wird ein einziger Stand für alle Titel: im Frontend `meta.last_trading_day` (Banner zur Datenfrische, Tooltip „Stand: … (letzter Handelstag)“) und das Alter aus `updated` (Verarbeitungszeitpunkt); im Public Digest Datum = `meta.last_trading_day`.
* **Folge:** Bei den Non-US-Titeln mit unvollständiger letzter Zeile (in den Läufen 389 und 391 30 von 31) stammt der Kurs vom vorherigen Handelstag, wird aber unter dem US-Stichtag ausgegeben, ohne Kennzeichnung je Titel; auch das Modell erhält diese Information nicht. Der Kurs selbst ist korrekt (28.3), nur sein Datum ist nicht gekennzeichnet.
* **Offen:** Ob die ausgelieferte Fassung des Frontends dem Repo-Stand (letzter Commit 03.10.) entspricht; ob in Texten ein Non-US-Kurs ausdrücklich mit dem Stichtag genannt wurde.

### 30.4 Backlog (nichts beauftragt) und Status
* Neu: Verhalten zweier Läufe derselben Nacht trotz wirksamer Sperre (veralteter Ausgangsstand, Konflikt beim Archiv-Commit, mögliches Überschreiben von KV, Archiv ≠ Live-Stand) (30.1); Kennzeichnung des Kursdatums bei Non-US-Titeln (30.3).
* Weiterhin offen: Übernahme des Dienstags-Close im Lauf vom 19.11.; Zuordnung `homeMarket` (Abschnitt 29); Kostenstränge A und B nach 26.9.
* Keine Änderung an Workflow, Watchdog, Aggregator, Prompts, Digest, Frontend, KV, Archiv oder `SUITE.md`. Freeze und C1-Sperre unverändert; Gate Papiermodell. Commit dieses Abschnitts durch Axel nach Prüfung.
