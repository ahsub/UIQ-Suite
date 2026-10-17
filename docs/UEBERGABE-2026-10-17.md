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
