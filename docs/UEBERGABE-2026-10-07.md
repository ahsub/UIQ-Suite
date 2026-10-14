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

# UIQ — Übergabeprotokoll 07.10.2026 → 08.10.2026

**Datum:** 07.10.2026 (Mittwoch), Sessionende abends (Stand: 20:00 Uhr MESZ); **Nachtrag 08.10.2026 (Donnerstag) 05:40 Uhr MESZ** (Auswertung des Nachtlaufs `2026-10-08_01`, siehe 2.7 und 2.8); **Nachtrag 09.10.2026 (Freitag) 05:10 Uhr MESZ** (Nachtlauf `2026-10-09_01` und `homeMarket`-Suffix-Tabelle, siehe 2.10 und 2.11)
**Status:** **Freeze besteht.** `ko-aggregator` v5.48.0 (A-1, rein diagnostisch, `655d649`) läuft unverändert. In dieser Session wurde **nichts committet, nichts gepusht, nichts im Code geändert** (Claude hatte nur Lesezugriff auf `UIQ-Suite` und `uiq-archive`; `ko-aggregator` war nicht angehängt, `market_aggregator.py` und `market-aggregator.yml` wurden über `raw.githubusercontent.com` auf `655d649` gelesen). Axel hat einen **manuellen Aggregator-Lauf** gestartet (17:23 UTC, `force_regenerate=false`, `force_backup=false`). D26 bleibt **P0, offen**; A-2 nicht begonnen; C vorgemerkt, nicht freigegeben. **Neu (08.10.):** möglicher Seiteneffekt des manuellen Tageslaufs auf den Public-Digest (2.8) — **durch KV-Lesung am 08.10. 05:57 bestätigt** (`public/digest/latest` ist der Digest des manuellen Tageslaufs, siehe 2.9); **keine Korrektur durchgeführt.**
**Zweck:** Fortsetzung der D26/D27-Auswertung nach dem ersten Nachtlauf mit A-1; der Nachtlauf 08.10. ist ausgewertet (Fall „0–4 US, Nicht-US separat”); offen ist die Prüfung des Public-Digest-Stands im KV, bevor irgendeine Produktionsentscheidung getroffen wird.

> Quellenhinweis: Alle Zahlen unten stammen aus Archiv-Snapshots in `ahsub/uiq-archive` (gelesen: `2026-10-07_01`, `2026-10-07_17` sowie die Reihe ab `2026-09-13`). Actions-Logs und Cloudflare-KV waren nicht erreichbar. Die Aussagen über das Aggregator-Verhalten stützen sich auf Snapshots und gelesenen Code, nicht auf Logs.

## 1. Stand der Repos

| Repo | Stand | Anmerkung |
|---|---|---|
| `ahsub/UIQ-Suite` | `main` `89010c4` (Stand beim Klonen, 06.10. 17:14 MESZ) | in dieser Session nur gelesen; `docs/UEBERGABE-2026-10-06.md` ist das Vorgängerprotokoll |
| `ahsub/ko-aggregator` | `main` `655d649` (v5.48.0) | unverändert; nur gelesen |
| `ahsub/uiq-archive` (privat) | zuletzt `c3881d5` (Snapshot `2026-10-07_17`, Lauf 348) | nur lesend angehängt; in einer neuen Session erneut anhängen |

## 2. Ergebnisse dieser Session

1. **Nachtlauf `2026-10-07_01` (Lauf 347, `generated` 01:17:53Z, v5.48.0):** `meta.data_integrity` ist vorhanden (Schema `data_integrity/1`), alle bisherigen Meta- und Top-Level-Felder sind unverändert, 742 Ticker, 22 Fehler (wie am Vortag), `elapsed_s` 101,7. **`flags == []`**, obwohl die Nacht nicht sauber war: US 188/710 (26,5 %) mit unvollständiger letzter Zeile, Nicht-US 30/31 (96,8 %), SPY nicht betroffen. Bei den 218 Betroffenen liegt `_lastCloseDate` auf dem 05.10., `_dataAsOf` aber auf dem 06.10.; `bars` 500, `_bars_raw` 501. Die 50-%-US-Schwelle wurde nicht erreicht. Betroffen sind u. a. GOOG, META, ABBV, ZTS, IQV, HLT, nicht betroffen u. a. TSLA, GOOGL, ORCL, AVGO, AMZN, MSFT, NVDA.
2. **Zählabweichung 711/710 geklärt:** 711 Ticker mit `homeMarket == 'US'` enthalten SPY; `calc_data_integrity` nimmt SPY bewusst aus (eigenes Feld `spy`), Nenner 710. Nicht-US = 31 (18 DE, 7 UK, 2 FR, 2 IT, 1 SE, 1 AU). Keine fehlenden oder doppelten Ticker, kein Klassifikationsproblem.
3. **Manueller Tageslauf `2026-10-07_17` (Lauf 348, `generated` 17:25:04Z):** `elapsed_s` 116,7, `errors` 22, gleiche Ticker-Menge. Alle 218 Nacht-Betroffenen sind sauber (`_lastRowIncomplete` false, `_lastCloseDate == _dataAsOf == 06.10.`, `bars`/`_bars_raw` 501/501); bei den 218 hat sich `price` in 218 von 218 Fällen gegenüber der Nacht geändert (bei den nachts sauberen Nicht-Krypto-Titeln in 30 von 511). Nachts saubere Titel bleiben sauber. `last_trading_day` steht auf 2026-10-07, aber bei allen 742 Tickern liegt `_dataAsOf` auf 2026-10-06, daher `labelAheadOfTickerData` US 710/710 und **Flag `LABEL_AHEAD_OF_TICKER_DATA`** (reines Beobachtungsflag).
4. **Die „13 D27-Kandidaten" der Nacht sind alle Krypto-Ticker** (`ADA/ATOM/AVAX/BCH/BNB/BTC/DOGE/DOT/LINK/LTC/SOL/XRP-USD`), die wegen `homeMarket == 'US'` in der US-Statistik mitgezählt werden; sie standen nachts mit `_dataAsOf` 05.10. gegen das Label 06.10. und sind tagsüber sauber. Ob das derselbe Mechanismus wie D27 ist, ist offen.
5. **Historische Reihe 13.09.–07.10.** (Metrik: `_bars_raw − bars ≥ 1` pro Ticker, US ohne SPY; die alten Snapshots haben die A-1-Felder nicht): 13 Snapshots in 12 Nächten (15., 16., 17., 22., 23. [00:10 und 03:45], 24., 25., 26., 30.09., 01., 02., 03.10.) mit 643–650 von 701–706 US-Titeln und 30/31 Nicht-US (SPY betroffen); diese 13 Snapshots decken sich mit den 13 im Protokoll vom 06.10. genannten. Nächte ohne US-Befall: 18.09. (0/701), 19.09. (2/701; Nicht-US 23/31), 29.09. (2/706; Nicht-US 30/31), 06.10. (4/710; Nicht-US 30/31). **07.10. (188/710) ist die einzige Nacht mit einem US-Teilbefall.** Nicht-US früher mit Zwischenwerten (23/31 am 18./19.09., 18/31 am 20.09.). Nicht-US ist häufig länger betroffen als US und erst im späteren Tageslauf sauber (z. B. 16.09.: 06:56 US 3, Nicht-US 30/31; 11:24 sauber). Recovery vollständig beobachtet in drei Nacht→Tag-Paaren (15.09., 22.09., 07.10.); in sechs Nächten gibt es keinen Folgesnapshot am selben Tag. **Die Uhrzeit allein trennt die Fälle nicht** (betroffen: 00:03–01:27 UTC und 03:45 UTC am 23.09.; sauber u. a. 29.09. 01:37 und 06.10. 02:09).
6. **D27 als eigener Befund:** Das Muster „Label = heutiger Handelstag, Daten = Vortag, Zeilen sauber" tritt in Tagesläufen an Handelstagen wiederkehrend auf (14.09., 15.09., 22.09., 07.10.) sowie in den Nächten 18.09. und 19.09. ohne unvollständige Zeilen. D26 (unvollständige Extra-Zeile mit `_lastCloseDate < Label`) und D27 (`last_trading_day > _dataAsOf` bei sauberen Zeilen) sind getrennt zu behandeln; ein gemeinsamer Fix wäre nicht gerechtfertigt.
7. **Nachtlauf `2026-10-08_01` (Lauf 349, `generated` 01:39:05Z, v5.48.0), ausgewertet am 08.10. morgens:** `last_trading_day` 2026-10-07, 742 Ticker, 22 Fehler, `elapsed_s` 83,7. `meta.data_integrity`: **US 4/710 (0,6 %), Nicht-US 30/31 (96,8 %; nur ORG.AX sauber), SPY nicht betroffen, `labelAheadOfTickerData` US 13/710, `flags == []`.** Das ist der Fall „0–4 US betroffen, Nicht-US separat” (wie 29.09. und 06.10.). Insgesamt 34 Ticker mit unvollständiger letzter Zeile (18 DE, 7 UK, 4 US, 2 FR, 2 IT, 1 SE); 32 davon waren schon in der Nacht vom 07.10. betroffen, 2 sind neu. `_dataAsOf`: 729 Ticker 07.10., 13 Ticker 06.10. (die 13 Krypto-Ticker, sauber); `bars`/`_bars_raw` 500/501 genau bei den 34. **Der US-Teilbefall vom 07.10. (188/710) hat sich nicht wiederholt und bleibt der einzige US-Zwischenwert.** Der D26-Befund ändert sich dadurch nicht; keine Ursachenhypothese.
8. **Möglicher Seiteneffekt des manuellen Tageslaufs auf den Public-Digest.** Kette (aus Code und Zeitstempeln abgeleitet; durch 2.9 bestätigt):
   * Der Workflow hat nach dem Aggregator den Schritt `Generate Public Recommendations` (`generate_public_recommendations.js`, 15 sequenzielle Anthropic-Calls, ggf. Repairs). Der Trading-Day-Skip-Check überspringt ihn nur, wenn `public/digest/latest.date` im KV gleich `meta.last_trading_day` ist und `FORCE_REGENERATE` nicht `true` ist.
   * Im manuellen Tageslauf (17:25 UTC) stand `last_trading_day` wegen des D27-Musters schon auf 2026-10-07, während der letzte Digest (vom Nachtlauf) auf 2026-10-06 stand: kein Skip. Zeitliche Indizien: Abstand `generated` → Archiv-Commit in diesem Lauf 22,7 min (nächtliche Läufe mit Public-Teil: 21,9–24,0 min; Läufe mit Skip am Wochenende 04./05.10.: 5,4 bzw. 5,5 min).
   * Im Nachtlauf 08.10. beträgt dieser Abstand nur 5,6 min (01:39:05 → 01:44:44): der Public-Teil wurde sehr wahrscheinlich übersprungen. Das passt dazu, dass `public/digest/latest.date` bereits 2026-10-07 war (nur der manuelle Tageslauf kann das geschrieben haben).
   * **Mögliche Folge:** In `public/digest/latest` liegt ein Digest mit `date` 2026-10-07, erzeugt aus Daten des 06.10. (alle 742 Ticker `_dataAsOf` 06.10.), und der Nachtlauf mit den korrekten Daten des 07.10. hat ihn nicht ersetzt. Der nächste Nachtlauf (09.10.) hat einen neuen Handelstag und würde den Public-Teil wieder ausführen.
   * Meine frühere Zusage (Session 07.10.), mit `force_regenerate=false` werde der Public-Teil übersprungen, solange `last_trading_day` unverändert bleibe, war zu eng: sie galt nur, solange das Label nicht schon auf den heutigen Tag gesprungen ist (siehe 6.).
   * **Nicht durchgeführt:** kein `force_regenerate=true`, keine KV-Änderung, keine Korrektur. KV und Actions-Logs konnte Claude nicht lesen.
9. **KV-Befund `public/digest/latest` (Axel, 08.10. 05:57 MESZ, `wrangler kv key get`, Felder ausgelesen):** `digest_id` `DIGEST-20261007`, `date` `2026-10-07`, `snapshot_id` `SNAP-20261007-173111Z`, **`generated_at` `2026-10-07T17:47:41Z`**, `market_regime` ohne Auffälligkeit (`mse_regime` BULL_QUIET, `qqq_markov_regime` BULL, `vix` 15.25), `dce_public.as_of` `2026-10-07` mit **`dce_public.generated` `2026-10-07T17:25:04Z`** (= `meta.generated` des manuellen Tageslauf-Snapshots `2026-10-07_17`), `data_quality`: `market_snapshot`, `equity_data`, `sector_data`, `qqq_markov` jeweils `ok`, 15 Strategien.
   * **Bestätigt:** Der aktuelle Public-Digest stammt aus dem manuellen Tageslauf (Erzeugung 17:47:41Z), nicht aus dem Nachtlauf 08.10. (01:39Z); der Nachtlauf hat ihn wegen des Skip-Checks nicht ersetzt. Er trägt das Datum 07.10., beruht aber auf dem Snapshot `2026-10-07_17`, in dem alle 742 Ticker `_dataAsOf` 06.10. hatten (Verknüpfung über `dce_public.generated`). Inhaltlich also Datenstand 06.10. unter dem Label 07.10.; die Daten des Tageslaufs selbst waren sauber (keine unvollständigen Zeilen).
   * **Nicht geprüft:** Inhalt der 15 Strategien im Detail; Auswirkung auf Frontend/Beta-Nutzer; ob der Digest inzwischen abgerufen wurde.
   * **`data_quality` im Digest** kennt nur vier Felder und weist weder Datenstand noch Label-Abweichung aus; sie steht trotz Label-voraus auf `ok` (Input für A-2).
   * **Zeitfenster für einen möglichen Korrekturlauf (Beobachtung, keine Entscheidung):** Das Label springt in Tagesläufen offenbar um den US-Handelsbeginn (ca. 13:30 UTC) auf den heutigen Tag (15.09. 12:50 UTC noch Vortag, 14.09. 13:54 UTC und 22.09. 13:42 UTC schon heutiger Tag). Läufe um 11:24 UTC (16.09.) und 12:50 UTC (15.09.) waren komplett sauber (US und Nicht-US 0 unvollständig, Label = letzter abgeschlossener Handelstag); Läufe zwischen 04:00 und 07:00 UTC hatten noch Nicht-US 30/31 unvollständig.

10. **Nachtlauf `2026-10-09_01` (Lauf 350, `generated` 01:52:43Z, v5.48.0, `last_trading_day` 2026-10-08), ausgewertet am 09.10. morgens:** `meta.data_integrity`: `lastRowIncomplete` US 4 von 710 (0,6 %), nicht-US 30 von 31 (96,8 %: DE 18, UK 7, IT 2, FR 2, SE 1), SPY nicht betroffen; `labelAheadOfTickerData` US 14 von 710 (2,0 %: `TIPS` und 13 Krypto-`-USD`-Ticker); `flags` leer. Einordnung: Fall „0–4 US, Nicht-US separat”; D27-Muster bekannt, kein neuer Befund. Abstand `generated` → Archiv-Commit `0e9c73c` (02:15:47Z) = 23,1 min, passt zu „Public-Teil gelaufen”. **Digest-Stand weiterhin offen:** Der Archiv-Zeitstempel macht die Ersetzung von `DIGEST-20261007` plausibel, belegt sie aber nicht. Als bestätigt gilt sie erst, wenn `date` und `generated_at` direkt aus `public/digest/latest` im KV gelesen wurden.
11. **Befund `homeMarket`-Suffix-Tabelle (09.10., rein lesend; Referenzstand `655d649`, Snapshot `2026-10-09_01`; keine Neuberechnung, keine Codeänderung). Vier Dinge getrennt:**
    * **a) Befund (belegt):** `homeMarket` entsteht nur in `process_ticker()` über `_derive_home_market(ticker)`, rein aus dem Ticker-Suffix. `_NON_US_EXCHANGE_SUFFIXES` (ca. Zeile 6806) kennt `.DE .PA .AS .MI .SW .L .CO .ST .AX`; `.MC` und `.BR` sind nicht enthalten, ohne Treffer gilt `'US'`. Deshalb stehen `TEF.MC` und `UCB.BR` im Snapshot auf `homeMarket` `'US'`. `SHEL` (NYSE-ADR ohne Suffix) bleibt zu Recht `'US'`. Im Snapshot sind das die einzigen zwei Ticker mit Suffix und `'US'`. Ob die Zuordnung der beiden beabsichtigt ist, lässt sich aus dem Code nicht belegen; belegt ist die Lücke in der Suffix-Tabelle. Woher die zwei Ticker ins Universum kommen, wurde nicht geprüft.
    * **b) Auswirkung auf D26/A-1:** `calc_data_integrity` zählt `(homeMarket or 'US') == 'US'` als US. Zwei Titel verfälschen den US-Nenner geringfügig (2 von 710, 0,3 %). Am 09.10. gehören 2 der 4 „US-unvollständigen” Ticker dazu (`TEF.MC`, `UCB.BR`), die übrigen sind `HUBB` und der ADR `SHEL`. Die bisherige Einordnung der Nachtläufe ändert sich dadurch nicht. Die Schwellenfrage für A-2 bleibt offen; A-2 sollte die Lücke berücksichtigen oder sie vorher dokumentieren.
    * **c) Eigenständiger Folgepunkt, ungeprüft:** `homeMarket` fließt laut Kommentar im Code auch in die Gap-/Overnight-Logik der KO-Longs (ca. Zeile 5892). Ob und wie sich die Zuordnung dort auswirkt, wurde nicht geprüft. Getrennt von D26/D27 zu führen; **kein Auftrag zur Umsetzung.**
    * **d) Prozessgrenzen:** Referenzstand `655d649`, Snapshot `2026-10-09_01`; keine Neuberechnung historischer Quoten, keine Codeänderung, kein Amend/Rebase; Archiv-Commit `e005f52` unangetastet.

## 3. Entscheidungslage (Axel, 07.10.)

* **A-1:** unverändert weiterlaufen lassen. **Freeze beibehalten.**
* **A-2** (`data_quality` im Digest): noch nicht. Später eher ticker-/datenbezogen als über eine abgesenkte Prozentschwelle; **keine spontane Änderung der 50-%-Schwelle**.
* **C** (Reparatur: unvollständige letzte Zeile nicht in die Berechnung einfließen lassen): als wahrscheinliche strukturelle Richtung **vorgemerkt, nicht freigegeben, kein Code**. Offen: Herkunft der zusätzlichen Zeile, Zusammenspiel mit `get_last_trading_day()`, flagged Läufe nie einfach blockieren.
* **D27:** separat führen.
* **Kein Gate-Mechanismus aus A-1.**
* **SUITE.md:** bewusst noch nicht angefasst (D26-Livebefund nicht abgeschlossen).
* **Public-Digest (08.10., Axel):** **zuerst `public/digest/latest` im KV lesen (`date` und Erzeugungszeitpunkt), dann Befund feststellen, dann entscheiden. KV gelesen (2.9). **Entscheidung (08.10. 06:00): Option 1, heute nichts tun, kein `force_regenerate`, kein manueller Korrekturlauf.** Begründung: Beobachtung und Reparatur getrennt halten; ein Lauf um 04:00 UTC wäre wegen Nicht-US 30/31 kein sauberer Vergleichspunkt und würde den Freeze brechen. Der Digest (Datum 07.10., Datenstand 06.10.) bleibt bis zum regulären Nachtlauf 08.→09.10. bestehen. Das ist kein D26-Fix und kein neuer Fehlerbefund, sondern das derzeitige Verhalten des Public-Generator-/Skip-Mechanismus. Drei Stränge getrennt führen: D26 (unvollständige letzte Zeile), D27 (Label vor Ticker-Datenstand), Public-Generator/Skip (hängt davon ab, welcher Snapshot zuletzt einen Digest geschrieben hat). `data_quality` ohne Datenstand-Feld → Input für A-2, nicht vorziehen.** Kein automatisches `force_regenerate=true`: das wäre eine eigene Produktionsentscheidung und soll wegen des D26-Risikos erst nach sauberer Prüfung fallen. Der 08.10.-Lauf ändert am D26-Befund nichts: A-1 unverändert, kein A-2, kein C, kein D27-Fix.
* **Archiv-Commit `e005f52`:** Workflow-Commit (`actions@users.noreply.github.com`); die „Unverified"-Warnung des Stop-Hooks wird **nicht** durch Amend/Rebase behandelt.

## 4. Nächste Schritte

0. **Heute nichts ändern (Entscheidung Axel, 08.10.).**
1. **KV gelesen (erledigt, 2.9).** Optional noch: Inhalt der Strategien bzw. `public/ai_output/latest/*` stichprobenartig prüfen.
2. **Entscheiden (Axel),** ob und wie der Digest korrigiert wird (z. B. einmaliger Lauf mit `force_regenerate=true`); das ist eine eigene Produktionsentscheidung (Pflicht-Header Punkt 8, ein Lauf pro Nacht; D26-Risiko beachten).
3. **Nachtlauf 09.10. abwarten (erledigt, siehe 2.10)** und `2026-10-09_0x` auswerten: `meta.data_integrity`, Gruppierung nach `homeMarket`, Zuordnung zu den vier Fällen (≈92 % US / Zwischenwert / 0–4 / Nicht-US separat); zusätzlich Abstand `generated` → Archiv-Commit (≈22 min = Public-Teil gelaufen, ≈5 min = Skip).
4. **Danach gemeinsam entscheiden** über A-2 und C (nach der Dokumentation der Suffix-Tabelle, 2.11); D27 separat. **Stand 09.10.:** Optionen aufbereitet und Reihenfolge vereinbart, siehe Offene Punkte („Vereinbarte Reihenfolge”); es gilt: A-2a, dann C2-lokal, dann Entscheidung C2-diag/C1; A-2b/c nur offline. Kein manueller Tageslauf vor Klärung des Public-Digest-Effekts.

## 5. Offene Punkte

* D26: Ursache der zusätzlichen, noch nicht abgeschlossenen Zeile nicht bekannt; Reparaturentscheidung offen; Frontend-Preisanzeige ungeprüft; Breadth-/McClellan-Nachwirkung nicht quantifiziert.
* A-1: Schwelle 50 % kalibriert an 182 Archivläufen; der 07.10. zeigt einen Fall außerhalb dieser Bimodalität.
* Krypto-Ticker in der US-Statistik (13 von 710) verzerren `labelAheadOfTickerData`; kein Handlungsauftrag, nur vermerkt.
* GitHub-Actions-Laufzeit des manuellen Laufs 27:31 min bei `elapsed_s` 116,7 s des Aggregators: sehr wahrscheinlich der Public-Teil (ca. 22 min, siehe 2.8); Logs nicht verfügbar, daher nicht bestätigt.
* Public-Digest im KV: Datum 07.10., Datenstand 06.10. (2.9). Der nächste planmäßige Nachtlauf (09.10.) ersetzt ihn, weil dort ein neuer Handelstag vorliegt; bis dahin bleibt er online. Korrekturentscheidung offen.
* Bis zum 10.10.: **D21** TR-Backup am Sa 10.10. prüfen (Fix `9603858`); übrige Punkte aus dem Protokoll vom 06.10. unverändert (D22, D23, S6/№73, `ko-cron-trigger`, Watchdog).
* Bundesbank/BaFin-Voranfrage: Antwortmail vom 06.10. laut Protokoll noch nicht ausgewertet.
* **Anregungspunkt für die SUITE.md-Sammlung (08.10.): Datenquellen für №71 Event & Surprise Gate; Reuters als Nachrichtenquelle.** *(Alles Recherchestand ohne eigene Prüfung bei den Anbietern; vor Umsetzung Code/Bedingungen lesen und verifizieren. Frühestens nach Dezember/Go-No-Go, Drift-Warnung beachten.)*
  * **Reuters (`reuters.com/markets/`, `/commentary/breakingviews/`) als Daten-/Newsquelle: nicht nutzen.** Webseiten, keine Datenschnittstelle; Scraping und Weiterverwendung sind bei großen Agenturen üblicherweise durch die Nutzungsbedingungen ausgeschlossen (Reuters-Bedingungen konnte Claude nicht lesen, Abruf in der Umgebung gesperrt); UIQ ist kommerziell (BaFin-Voranfrage), Public-Digest = Weitergabe an Dritte; Breakingviews ist Kommentar/Meinung, als „Daten" ungeeignet. Legaler Weg wäre eine Lizenz (Reuters Connect bzw. LSEG), Unternehmensvertrag, vor Dezember unverhältnismäßig.
  * **Brauchbar als Kandidaten (Quellenkatalog aus einer KI-Recherche ohne Quellenangaben, von uns gegen №71 und `EARNINGS-INVEST-PHASE0-FEASIBILITY.md` gespiegelt):** SEC EDGAR (8-K-Erkennung per Atom-Feed/Submissions-API, User-Agent-Pflicht, ≤10 Requests/s), FRED (US-Makro, freier Key), EZB-Datenportal (SDMX/REST, vgl. `UIQ EZB-Makrodaten — Architektur-Vorschlag`), BLS/BEA (freier Key). Passt zu №71 Sprint 1 (kostenfrei, deterministisch, Shadow Mode).
  * **Einwände / nicht übernehmen:**
    1. „Zeitstempel auf Millisekunden-Ebene" bei 8-K: nicht belegt, EDGAR-Annahmezeit vermutlich nur sekundengenau — vor jeder Zusage prüfen.
    2. Ist-Werte aus 8-K Item 2.02 sind nicht strukturiert (steht im Fließtext der Anlage; XBRL-API liefert 10-Q/10-K verzögert) — für Ist−Konsens ist eine andere Quelle nötig.
    3. Minutengenaue Sperrfenster (−30/+60 min, „Strategy Gate", „PAUSE") passen nicht zu №71 (Tagesbasis, separater Shadow-Step nach dem Nachtlauf, keine Wirkung auf den Digest); das wäre eine andere, Echtzeit-Architektur.
    4. Aussage „nur Sentiment-Score nutzen umgeht Urheberrechtsprobleme" (LSEG/MRN) ist zu optimistisch: auch abgeleitete Scores unterliegen dem Datenlizenzvertrag. Finnhub („kommerzielle Nutzung klar geregelt") und Benzinga-Produktnamen unbestätigt; Gratis-Pläne solcher Anbieter gelten oft nur für private Nutzung. Lizenz je Anbieter auf Weitergabe und KI-Nutzung prüfen.
    5. Konsensquellen: Der Text empfiehlt FMP und Trading Economics. Im Repo ist **Alpha Vantage** als einzige Quelle mit Point-in-Time-fähigen Konsenswerten live getestet; FMP nur per Dokumentation geprüft (Zugriffsebene offen, „nur Snapshot"). Entscheidung nach Alpha-Vantage-Ergebnis, FMP/TE erst nach eigenem Test und Lizenzcheck.
    6. Konsenswerte müssen **vor** dem Ereignis archiviert werden (Point-in-Time-Regel), sonst sind sie hinterher überschrieben; im Text nicht erwähnt.
* **Repo-Evaluierungsrunde 08.10. (Sammlung für SUITE.md; Stand jeweils nur README gelesen, Code nicht geprüft; alles frühestens nach Dezember/Go-No-Go):**
  * **Mit Nutzen (Anregungspunkte):**
    1. `simonlin1212/global-stock-data` (Apache-2.0, Skill-Datei, 21 Commits): Quellenkatalog mit Rechte-Einstufung durch den Autor (Stufe S: SEC EDGAR, US Treasury, CFTC frei und für kommerzielle Nutzung vorgesehen; B: FINRA mit Einschränkung für kommerzielle Nutzung; C: Yahoo „nur private Nutzung", CBOE nur mit Genehmigung, Nasdaq/Eastmoney/Sina/Tencent). Einstufung ist die Lesart eines Einzelnen, kein Rechtsrat. **Wichtigster Befund: Nutzungsbedingungen von Yahoo/yfinance für den kommerziellen Betrieb des Aggregators prüfen, als Punkt für das Go/No-Go.** Stufe-S-Quellen als Prüfkandidaten für №71 und COT-Ausbau; FINRA bei Ausbau der Leerverkaufsdaten mit Lizenzprüfung.
    2. `star23/Day1Global-Skills` (MIT): fünf Analyse-Skills ohne Validierung und ohne Datenangaben. Anregung nur als Kandidatenliste für den Makro-/Stimmungskontext: Fed Net Liquidity, SOFR, MOVE, Yen-Carry; NAAIM-Exposure, Forward-KGV. **Von Axel am 08.10. bestätigt (Vorschlag Claude): als Hypothesenkandidat für `regime-test` vorgemerkt, nicht bauen:** Rohindikatoren einzeln gegen Baseline (z. B. Faber-10M-SMA), Point-in-Time (FRED-Archiv/ALFRED, nach Wissensstand, ungeprüft), Datenrechte vorab klären, nicht den Mischscore der Skills.
    3. `olaxbt/ai-market-maker` (AGPL-3.0, Krypto-Multi-Agent, LLM-Pflicht, nicht verwendbar): bestätigt Muster, die UIQ schon verfolgt: Risk Guard mit echtem Vetorecht (vgl. №71 `would_block`), gepinnte Historie mit SHA-256-Manifest, ausdrückliche Warnung, dass ein einzelner Backtest keinen Edge belegt.
    4. `facioquo/stock-indicators-dotnet` (Apache-2.0, C#): nicht im Stack verwendbar; höchstens Idee einer unabhängigen Gegenprobe der Aggregator-Indikatoren in `uiq-devtools`, besser mit einem Python-Pendant. Validierung der Bibliothek selbst in der README nicht belegt.
    5. `TNT-Likely/PanWatch` (MIT): nur das UND/ODER-Muster für Alarmregeln (Marktzeiten, Abkühlzeit, Tageslimit, Ablaufdatum) als spätere Idee; sonst Negativbefund.
    6. `shi-rudo/awesome-stock-trading`: kuratierte Linkliste, Startpunkt für einen späteren Anbietervergleich (Stock-APIs, Backtesting-Plattformen), selbst nicht belegbar.
    7. `sstklen/trump-code` (MIT): nicht verwendbar, aber Lehrbeispiel gegen Mehrfachtests (31,5 Mio. Kombinationen, 551 „Überlebende", umgedrehte Regeln, keine Baseline, keine Out-of-Sample-Belege); stützt Präregistrierung statt nachträglicher Suche.
  * **Negativbefunde (je eine Zeile):**
    * `oxylabs/1688-scraper`: Marketing-README für einen bezahlten Scraping-Dienst, thematisch irrelevant.
    * `smitkunpara/tv-scraper` (MIT): inoffizielle TradingView-Zugriffe, Datenrechte ungeklärt (MIT gilt nur für den Code).
    * `ZhuLinsen/daily_stock_analysis` (MIT) und `TNT-Likely/PanWatch`: LLM erzeugt Bewertungen/Kauf-Verkauf-Signale selbst, keine Validierung belegt, Datenrechte ungeklärt.
    * `Open-Dev-Society/OpenStock` (AGPL-3.0): Privatanleger-Frontend mit Finnhub und TradingView-Widgets.
    * `StockSharp/StockSharp`: C#-Handelsplattform mit Orderausführung, anderer Stack, Lizenz auf der Seite nicht genannt.
    * Kursvorhersage per Netz bzw. Reinforcement Learning und Twitter-Stimmung: `jaungiers/LSTM-…` (AGPL-3.0), `achillesrasquinha/bulbea`, `lilianweng/stock-rnn`, `kaushikjadhav01/Stock-Market-Prediction-Web-App…` (Zugangsdaten in der README, Sicherheitsmangel), `shirosaidev/stocksight` (Stand 2020), `kh-kim/stock_market_reinforcement_learning`: kein Prüfrahmen, veraltete Stacks, nicht verwendbar.
    * `martinshkreli/models`: Excel-Modelle ohne Lizenz, Autorschaft unbestätigt, keine Methodik.
    * `TickDB/tickdb-unified-realtime-marketdata-api`: Begleit-Repo eines jungen gehosteten Datendienstes, Datenrechte und Preise unklar, Echtzeit nicht benötigt.
* **Vier Codebefunde zur Berechnungskette (09.10., rein lesend, Referenzstand `655d649`; Codebefund und vermutete Auswirkung bewusst getrennt; keine dieser Beobachtungen ist als Produktionsfehler nachgewiesen, keine rechtfertigt allein einen Eingriff):**
    1. **SPY-Label.** *Codebefund:* `get_last_trading_day()` leitet das Datum aus `spy.index[-1]` ab (Zeile 1707), ohne vorheriges `dropna()` auf `Close`. *Vermutete Auswirkung (ungeprüft):* Bei unvollständiger letzter SPY-Zeile könnte das Label vor den bereinigten Kursen liegen; die Auswirkung ist nicht gesondert geprüft. *Prüfstatus:* Code gelesen; A-1 weist SPY separat aus (`lastRowIncomplete.spy`), in den vier Snapshots mit A-1-Feldern `false`. *Nächster Schritt:* im C2-lokal-Probelauf SPY mitprüfen (Zeilenmuster, Zeitpunkt); keine Codeänderung.
    2. **Zwei SPY-Downloads.** *Codebefund:* `validate_data_freshness()` (Zeile 1715, aufgerufen Zeile 11264) ruft `get_last_trading_day()` auf; `meta.last_trading_day` (Zeile 11366) kommt aus einem zweiten, eigenständigen Aufruf. Breadth und `calc_data_integrity` nutzen den Wert des ersten Aufrufs. *Vermutete Auswirkung (ungeprüft):* Beide Werte könnten bei einem Labelwechsel zwischen den Downloads auseinanderlaufen. *Prüfstatus:* Ob die Werte auseinanderlaufen können und ob das schon vorkam, ist offen. *Nächster Schritt:* offline aus dem Archiv prüfen, ob `meta.last_trading_day` und das in `data_integrity`/Breadth verwendete Datum in vorhandenen Läufen je abweichen (soweit diese Felder erhalten sind); keine Codeänderung.
    3. **Reihenlängen.** *Codebefund:* In `process_ticker()` entsteht `closes` über `dropna()` (Zeile 6866), `volumes` über `fillna(0)` (Zeile 6883). Bei einer unvollständigen oder NaN-Zeile können beide Reihen unterschiedlich lang bzw. gegeneinander verschoben sein. *Vermutete Auswirkung (ungeprüft):* mögliche Verschiebung volumenbasierter Größen gegenüber Kursen. *Prüfstatus:* Welche Scores oder Signale tatsächlich betroffen sind, ist nicht geprüft. *Nächster Schritt:* im Code lesend nachvollziehen, wo `volumes` und `closes` gemeinsam verwendet werden (nur Inventar); keine Neuberechnung, keine Codeänderung.
    4. **Keine Roh-OHLCV im Archiv.** *Befund:* Die Snapshots enthalten Ergebnisse, aber keine Roh-OHLCV-Zeilen. *Folge:* Die Ursache der unvollständigen Zeilen (welche Spalten fehlen, ob `Volume` einen Wert hat, Zeilenzeitpunkt) lässt sich aus dem Archiv nicht rekonstruieren; ein Counterfactual-Replay eines C-Fixes ist ebenfalls nicht möglich. *Prüfstatus:* geprüft für die gelesenen Snapshots. *Nächster Schritt:* C2-lokal (siehe Reihenfolge), erzeugt die fehlenden Rohdaten außerhalb der Produktion.
* **Vereinbarte Reihenfolge (Axel, 09.10.):** (1) A-2a: Dokumentation präzisieren, ohne Codeänderung; (2) C2-lokal: Ursache und Spaltenmuster lokal untersuchen, Produktionscode unberührt; (3) erst danach Entscheidung, ob C2-diag oder C1 sinnvoll ist; (4) A-2b/c: vorerst keine Schemaänderung, vorhandene Snapshots offline auswerten; (5) `homeMarket`-Lücke getrennt von D26, D27 und C weiterführen. Bis zu einer ausdrücklichen Freigabe bleiben Freeze, `SUITE.md`, Produktionscode und Archivhistorie (`e005f52`) unberührt.
* **C2-lokal-Sonde bereitgestellt (09.10.; Messdaten ausstehend):**
    * **Status:** Eigenständiges, rein lesendes Skript `c2_lokal_sonde.py`, Tickerliste `universe_20261009.csv` (742 Symbole mit `homeMarket`, aus Snapshot `2026-10-09_01`, inkl. SPY) und Mac-Anleitung `ANLEITUNG-C2-lokal.md` bereitgestellt. Die Dateien liegen **nicht** in einem Repo.
    * **Testumfang:** Nur mit Yahoo-Ersatzdaten (Stub) geprüft: NaN-Zeile mit gesetztem Volume, Abruf-Exception, leere Antwort, MultiIndex-Spalten, SPY zuerst, Git-Repo-Sperre für das Ausgabeverzeichnis, Vergleich zweier Läufe. **Echtes Yahoo-Fetching ist nicht verifiziert.**
    * **Abruf:** Yahoo Finance über `yfinance` (Produktion pinnt 1.5.2) und `pandas`; Abrufparameter wie `fetch_one` des Aggregators (`start`/`end` in UTC, Fallbacks `1y`, `6mo`). Lokal 6 Worker statt 12 in der Produktion.
    * **Diagnoseumfang:** Je Ticker Abrufzeitpunkt und Abrufstatus (`ok`, `ok_fallback`, `failed`; ein fehlgeschlagener Abruf ist kein Datenbefund), `homeMarket`, Zeilenzahl, Zeitstempel der letzten Zeile, OHLC und Volume der letzten Zeile, fehlende Spalten, letzter gültiger Close samt Datum und Zeilen danach, Anzahl NaN-Close-Zeilen, SPY-Kontext in jeder Zeile; zusätzlich die letzten drei Rohzeilen je Ticker (OHLCV) in einer Tail-CSV. Mit `compare` lassen sich zwei Läufe vergleichen (vervollständigt / weiter unvollständig / Zeile nicht mehr vorhanden).
    * **Schreibgrenzen:** Ausgabe ausschließlich unter `~/uiq-c2-lokal`. Keine Änderung an Aggregator, Worker, Generator, KV, Archiv oder `SUITE.md`; keine Neuberechnung von Scores, Breadth oder Track Records; keine Bereinigung oder Korrektur von Daten; kein Hostname, Benutzername oder Pfad in den Dateien.
    * **Versuchsplan (nicht bestätigte Ursache, keine gesicherten Fenster):** Beobachtet ist nur, dass Produktionsläufe gegen ca. 01–02 Uhr UTC unvollständige Zeilen zeigten und der manuelle Tageslauf um 17:25 UTC für die betroffenen US-Titel vollständig war. Vorgesehen: (1) Nachlauf am Morgen des 09.10., (2) eine oder zwei Kontrollen am selben Tag, (3) optional ein Lauf im Produktionsfenster in der Nacht zum 10.10. mit anschließender Kontrolle. Der Lauf in der Nacht zum Samstag betrifft den Freitag-Datensatz bei geschlossenem Handel und ist **kein direkter Vergleich** mit einem regulären Handelstag.
    * **Aussagegrenze:** Ein erfolgreicher lokaler Abruf ist zunächst nur ein Befund zur lokalen Abrufumgebung (anderer Rechner, Netz, Workerzahl), kein Beleg für die Ursache im GitHub-Produktionslauf. Ein abweichendes Ergebnis lokal gegenüber Produktion wäre selbst ein Befund.
    * **Nächster Schritt:** Echte Abrufe durchführen (Axel), CSVs bzw. `compare`-Ausgabe zurückgeben, gemeinsam auswerten; Ergebnisse werden hier **separat nachgetragen**.
    * **Entscheidungsgrenze:** **C1 bleibt gesperrt**, bis die Diagnose ausgewertet und die weitere Vorgehensweise ausdrücklich beschlossen wurde. Die Bereitstellung der Sonde gibt weder C1 noch C2-diag frei und ist keine Produktionsänderung.
* **Suffix-Tabelle `_NON_US_EXCHANGE_SUFFIXES` ohne `.MC`/`.BR` (09.10., Details 2.11):** Lücke belegt, Absicht und Auswirkungen auf die KO-Gap-/Overnight-Logik ungeprüft. Nur dokumentiert; Änderung (falls gewollt) wäre eine eigene Produktionsänderung mit eigener Nacht (Pflicht-Header Punkt 8), nicht Teil von A-2/C/D27.
* **SUITE.md-Integration der „Merk- und Anregungspunkte"** (Repo-Evaluierungen vom Abend des 06.10.) ist weiterhin offen; sie folgt, wenn der D26-Strang abgeschlossen ist. Liste der Punkte: ThetaGang (Decision-Provider-Muster für Event & Surprise Gate; Choppiness/Efficiency als Research-Baseline neben Faber-10M-SMA); Alpha Forge (Governance-Muster: Manifest/JSON-Sidecar, Start-Assertions, ein Verify-Gate in `uiq-devtools`, Evidence-Paket vor Release; Behauptungen ungeprüft); Stocksera als Quellenkatalog (nach Dezember); `ib_fundamental` (lokale Zweitquelle für Fair-Value-Validierung; Point-in-Time-Fähigkeit und Lizenz offen); `ibkr-steuer` (Refundex-Referenz); `ibkrclaw` (Zusatznutzer ohne Handelsrechte, Read-Only-API-Test, Auto-Restart + Health-Check); `ib_async` (BSD-2, Pflichtcheck `placeOrder`); IBKR-Connector (funktioniert lesend, nur Order-Instructions; CapTrader-Login offen); MCP-Server-Idee (nach Dezember, evtl. obsolet). Negativbefunde als Einzeiler: ibkr-docker, IBeam, option-data-service, ibkr-historical-data-downloader, stock-trend-analysis-bot, mcf-long-short-Straddle-Repo, IBKR-AIHedge, ibkr-mcp-server (als Basis), claude-ibkr-trading-panels. Alles frühestens nach Dezember bzw. Go/No-Go (Drift-Warnung).

## 6. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

* Ich (Claude) hatte zunächst geschrieben, der Aggregator-Lauf enthalte keine Anthropic-Calls; das war falsch: `market_aggregator.py` ruft die Anthropic-API selbst auf (u. a. Morning Briefing / KI-Enrichment), unabhängig von `force_regenerate`. Auf die Auswertung hatte das keinen Einfluss.
* Die Aussage, mit `force_regenerate=false` werde der Public-Teil beim manuellen Tageslauf übersprungen, war zu eng (siehe 2.8): das Label kann am Nachmittag schon auf den heutigen Tag springen, dann greift der Skip nicht. Wirkung noch nicht verifiziert.
* Die Eingabe „KI-Enhancement" gibt es im Workflow auf `655d649` nicht; gemeint war `force_regenerate` (Standard `false`, erzwingt `generate_public_recommendations.js`).
* Die „13 D27-Kandidaten" hatte ich zunächst als Aktien-Kandidaten beschrieben; es sind Krypto-Ticker.
* Der lokale `uiq-archive`-Klon hatte kurzzeitig eine gestagte Kopie des Tages-Snapshots (für den Stop-Hook als „uncommitted" sichtbar); entfernt, nichts committet oder gepusht.
* Zeitangabe korrigiert: im Oktober gilt MESZ (UTC+2), 15:30 Uhr = 13:30 UTC.
* Befund, kein Fehler im Sinne einer Fehlzuordnung (09.10., 2.11): Die frühere Formulierung „US = `homeMarket` 'US'” (2.2) setzte stillschweigend voraus, dass die Suffix-Tabelle alle Nicht-US-Suffixe der Universumsticker enthält. Das trifft für `.MC` (`TEF.MC`) und `.BR` (`UCB.BR`) nicht zu. Zählweise und Zahlen aus 2.2 bleiben rechnerisch richtig für die vorhandene Gruppierung; die Aussagekraft für reine US-Datenqualität ist um 0,3 % eingeschränkt.

## 7. Verweise

* `docs/UEBERGABE-2026-10-06.md` (Vorgänger), `docs/BEFUNDREGISTER-2026-09-28.md` (Teil 4), `docs/UEBERGABE-HEADER-TEMPLATE.md`
* `ko-aggregator` `655d649`: `market_aggregator.py` (`calc_data_integrity`, ab ca. Zeile 1767), `.github/workflows/market-aggregator.yml` (Eingaben `force_backup`, `force_regenerate`; Cron `00 22 * * 1-5`), `tests/test_data_integrity.py`
* `uiq-archive`: Snapshots `2026-10-07_01`, `2026-10-07_17`, Reihe ab `2026-09-13`

## 8. Nachtrag 09.10.2026 abends: C2-lokal-Messergebnisse (nur angehängt, bisherige Abschnitte unverändert)

**Kennzeichnung:** [belegt] = aus den CSVs der Sonde bzw. den Archiv-Snapshots nachgerechnet; [Hypothese] = nicht getestet; [offen] = nicht geklärt. Referenzstand Code `655d649`, Produktions-Snapshot `2026-10-09_01` (generated 01:52:43Z). **Keine Empfehlung zu C, keine Codeänderung, keine neuen Schemafelder, keine neue Schwelle.**

### 8.0 Datenbasis
* [belegt] Drei Sondenläufe mit `c2_lokal_sonde.py` auf Axels Mac (`yfinance` 1.5.2, 6 Worker, Universum 742 Ticker inkl. SPY, in allen Läufen identisch): `nachlauf1` 04:06:27Z bis 04:12:34Z, `kontrolle1` 12:00:08Z bis 12:01:29Z, `kontrolle2` 17:30:18Z bis 17:31:41Z. In allen drei Läufen Abrufstatus `ok` für alle 742 Ticker (kein Abruffehler).
* [belegt] Abrufparameter wie in `fetch_one` des Aggregators (`start`/`end`, `end` = heutiges UTC-Datum, exklusiv). In allen Läufen ist die letzte Zeile deshalb höchstens der 08.10.; die Zeile des laufenden Tages wird nicht abgerufen.
* [belegt] Der Lauf `nachlauf1` dauerte ca. 6 Minuten, die beiden Kontrollen je ca. 1,5 Minuten. Grund nicht untersucht.
* [belegt] `kontrolle1` und `kontrolle2` sind für alle 742 Ticker identisch (`last_close`, `last_volume`); nach 12:00Z ändert sich in diesen Läufen nichts mehr.

### 8.1 D26: unvollständige Schlusszeilen
* [belegt] `nachlauf1` (04:06Z): 32 Ticker mit leerer letzter Zeile (Open, High, Low, Close fehlen, Volume gesetzt, Zeilendatum 08.10.; in den Tails: die zwei Zeilen davor vollständig). Verteilung: DE 18, UK 7, IT 2, FR 2, SE 1 sowie `TEF.MC` und `UCB.BR` (beide in der Produktion und in der Sonde mit `homeMarket` US, siehe 2.11). `ORG.AX` (AU) vollständig.
* [belegt] `kontrolle1` (12:00Z) und `kontrolle2` (17:30Z): 0 unvollständige Zeilen. Dieselben 32 Ticker sind um 12:00Z vollständig.
* [belegt] Produktion `2026-10-09_01`: 34 unvollständige Ticker (30 nicht-US plus `SHEL`, `TEF.MC`, `UCB.BR`, `HUBB`); dieselbe Menge wie in `2026-10-08_01`. `SHEL` und `HUBB` waren um 04:06Z auf dem Mac bereits vollständig, die übrigen 32 nicht.
* [belegt] Bei allen 34 Produktionstickern entspricht der Produktionspreis dem vorletzten Close der Kontrolle (Kurs vom 07.10. unter dem Label 08.10.; Toleranz 0,1 %).
* [belegt] Abweichung des später festgestellten Schlusskurses vom 08.10. gegenüber dem Produktionspreis, in % des Produktionspreises: **Median 1,56 %, Spanne 0,00 % bis 5,28 %** (Maximum `SRT.DE`; Beispiel `SHEL` 96,85 gegen 100,20). Bei einzelnen Titeln praktisch null (z. B. `HUBB`).
* [belegt] A-1 in dieser Nacht: `lastRowIncomplete` US 4 von 710 (0,6 %), nicht-US 30 von 31 (96,8 %), `flags` leer. Nach der A-1-Definition (SPY gesetzt oder US-Anteil ≥ 50 %) ist das erwartet; der Teilbefall der 34 Ticker erscheint nicht als Laufproblem.

### 8.2 Volume der unvollständigen Zeile, börsenabhängig
* [belegt] Faktor `last_volume` (12:00Z gegen 04:06Z) für die 32 Ticker: London (`.L`, 7 Ticker) 6,4- bis ca. 450.000-fach (Median ca. 4.000-fach, z. B. `VOD.L` 7.308 gegen 45.969.797, `GLEN.L` 700 gegen 31.958.539, `IAG.L` 2.930 gegen 11.772.077, `BA.L` 115.000 gegen 3.762.719); Madrid (`TEF.MC`) 560 gegen 7.907.878; Xetra (`.DE`, 18) ca. 1,0 (z. B. `DTE.DE` 4.754.652 gegen 4.755.444); Paris, Mailand, Brüssel (je ca. 1,0, bei 8 Ticker exakt unverändert: `DHER.DE`, `EVT.DE`, `SRT.DE`, `ENEL.MI`, `RNO.PA`, `UCB.BR`, `HO.PA`, `LDO.MI`); Stockholm (1) 1,04. Insgesamt war das Volume bei 24 von 32 Tickern um 12:00Z verschieden.
* Einordnung: beobachteter Datenqualitätsbefund. [offen] Ursache. [Hypothese, nicht getestet] Das Volume der unvollständigen Zeile ist bei einem Teil der Börsen vorläufig. Zusammenhang mit der Reihenlängen-Verschiebung aus den vier Codebefunden (Offene Punkte, Punkt 3) nicht geprüft.

### 8.3 D27: vollständig fehlende Schlusszeile (getrennt von D26)
* [belegt] 14 Ticker (`TIPS` und 13 Krypto-`-USD`-Ticker: `SOL`, `BNB`, `XRP`, `ETH`, `BTC`, `ADA`, `DOGE`, `AVAX`, `DOT`, `LINK`, `LTC`, `ATOM`, `BCH`): in der Produktion `2026-10-09_01` `_dataAsOf` 07.10.; auf dem Mac um 04:06Z letzte Zeile ebenfalls 07.10.; um 12:00Z und 17:30Z der 08.10.
* [belegt] Hier liegt keine unvollständige OHLC-Zeile vor, sondern eine fehlende Zeile mit gültigem Close des Vortags (deshalb in `nachlauf1` nicht als unvollständig geflaggt; A-1 zählt sie über `labelAheadOfTickerData`, US 14 von 710 = 2,0 %).
* [belegt] Der Produktionspreis der 13 Krypto-Ticker entspricht dem Close des 07.10.; Betrag der Abweichung zum später festgestellten Close des 08.10.: 1,96 % bis 11,20 % (`BTC-USD` 1,96 %, `BCH-USD` 11,20 %). `TIPS` wegen sehr kleiner Zahlenwerte (0,0007 gegen 0,0006) ohne Prozentangabe.
* [offen] Warum die Zeile um 04:06Z noch fehlt und bis 12:00Z da ist.

### 8.4 OTC-Abweichungen (nicht D26/D27)
* [belegt] 22 Ticker (21 mit Endung `Y`, dazu `MBGAF`; keine unvollständige Zeile, `_dataAsOf` 08.10.) haben in der Produktion einen 08.10.-Wert, der um 0,12 % bis 0,58 % vom Mac-Wert abweicht. `nachlauf1` und `kontrolle1` sind für diese 22 Ticker identisch; für alle 694 übrigen Ticker ohne Krypto/`TIPS`/Unvollständige ebenfalls (694 von 694).
* [offen] Die Differenz lässt sich bisher nicht zwischen Abrufzeitpunkt (ca. 01:50Z gegen ab 04:06Z) und Umgebungsunterschied (GitHub-Runner gegen Mac, 12 gegen 6 Worker) aufteilen. [Hypothese, nicht getestet] vorläufige Kurse bei dünn gehandelten OTC-Titeln.
* [belegt] Für die übrigen 672 von 708 nicht betroffenen Ticker stimmen Produktionspreis und Kontrolle auf 0,1 % überein (die 36 Abweichler: 22 OTC, 13 Krypto, `TIPS`).

### 8.5 Hypothesen (alle ungetestet)
* [Hypothese] D27: Das Label `last_trading_day` stammt aus `get_last_trading_day()` mit `period="5d"` (enthält die Zeile des laufenden Tages), die Ticker-Daten aus `fetch_one` mit `end` = heute (exklusiv, ohne laufenden Tag). Das würde ein Label vor den Ticker-Daten erklären. Ein Test würde den SPY-Abruf mit `period="5d"` im selben Lauf erfassen; nicht durchgeführt.
* [Hypothese] Das Volume der unvollständigen Zeile ist bei London und Madrid vorläufig (8.2).

### 8.6 Offene Fragen und Grenzen der Aussagekraft
* [offen] Ursache der D26-/D27-Muster nicht abschließend geklärt.
* [offen] Genaue Vervollständigungszeit zwischen 04:06Z und 12:00Z unbekannt (nur zwei Messzeitpunkte nach dem Produktionslauf).
* [offen] Produktion und Mac sind nicht als identische Abrufbedingungen nachgewiesen (andere Umgebung, Worker, Zeitpunkt). Die Mengen der unvollständigen Ticker stimmen überein; das ist kein Beleg für identische Ursachen.
* [offen] Es gibt noch keinen belastbaren Nachweis, welcher technische Eingriff das Problem am sichersten beheben würde (späterer Abruf, gezielter Nachholabruf oder Verwerfen unvollständiger Zeilen).
* Die vorgeschlagenen weiteren Messfenster (06:00Z, 08:00Z, 10:00Z; Nacht zum Samstag als Vergleich zur Produktion) werden getrennt entschieden, und zwar danach, ob sie die Wahl zwischen den drei Eingriffsarten tatsächlich unterscheiden helfen.

### 8.7 Korrekturen an Aussagen aus dem Gespräch vom 09.10.
* Ein erster Wert „Median 2,0 %“ für die Kursabweichung bei den 34 Tickern war falsch (oberer statt echter Median bei gerader Anzahl); richtig ist 1,56 % (siehe 8.1).
* Die erste Zahl „23 OTC-Ticker“ enthielt `SHEL` (aus einem Vergleich gegen die Mac-Menge statt gegen die Produktionsmenge); richtig sind 22 (siehe 8.4).

### 8.8 Stand und Entscheidungsgrenze
* Freeze besteht. C1 bleibt gesperrt, C2-diag nicht freigegeben. Keine Änderung an `market_aggregator.py`, KV, Archiv, `SUITE.md`; `e005f52` unangetastet. Das Digest-Stand-KV-Lesen (`date`, `generated_at` aus `public/digest/latest`) bleibt offen, soweit nicht bereits durch Axel erledigt.
* Nächster Schritt: Entscheidung (Axel), ob und welche weiteren Messfenster sinnvoll sind; danach gemeinsame Entscheidung über C.

## 9. Messplan Zeitverlauf (Freigaben Axel, 09.10.2026 abends; Messdaten ausstehend; nur angehängt)

**Kennzeichnung:** [belegt] / [Hypothese] / [offen] wie in Abschnitt 8. Der Freeze bleibt vollständig bestehen; keine Änderung an `market_aggregator.py`, Produktionslogik, Schwellenwerten, öffentlichen Ausgaben, Workflows, `SUITE.md` oder `e005f52`. Keine Entscheidung für oder gegen das Verwerfen unvollständiger Zeilen; C1 bleibt gesperrt.

### 9.1 Websuche zum Zeitpunkt der Vervollständigung
* [belegt] Die Suche (09.10.) ergab keine belastbare Aussage, wann Yahoo die Tageszeile vollständig liefert. Gefunden wurden nur Einzelberichte: Tagesbalken mit `Close = NaN` bei gefüllten Open/High/Low/Volume ohne Zeitangabe (Smart-Portfolio PR #6, anderes Muster als hier: bei uns fehlen alle vier Kurse), NaN-Zeilen um Splits und Dividenden (yfinance Issue #134) und ein Forumsbericht von 2015 über zeitweise nachhinkende Yahoo-Daten (Wealth-Lab). Der Zeitpunkt ist daher nur durch eigene Messung zu bestimmen. [offen]

### 9.2 Freigabe 1: Teilmengenmessung im 30-Minuten-Takt (Vorbedingung erfüllt)
* [belegt] Skript `c2_zeitverlauf.py` (neue Datei, getrennt von `c2_lokal_sonde.py`), Anleitung `ANLEITUNG-Zeitverlauf.md`. Schreibt nur nach `--out-dir` (Standard `~/uiq-c2-lokal`), verweigert den Lauf in einem Git-Arbeitsverzeichnis; liest nur und schreibt nur CSV und Log.
* [belegt] Vorbedingung „erst mit dem Ersatzskript testen“: Test mit Yahoo-Ersatzdaten (Stub) durchgeführt. Geprüft: Serie mit kurzem Takt und absoluten Slots, Wartelogik, Rückfall- und Vervollständigungsmuster, Abruffehler eines Tickers (als Abrufstatus, nicht als Datenbefund), Ausfall eines ganzen Messpunkts (Serie läuft weiter), überlange Messung (Folgeslot wird mit Log-Eintrag übersprungen), Git-Sperre des Ausgabeverzeichnisses, Auswertung mit Rückfall (der Eingabedatei wird nie überschrieben; ein dabei gefundener Fehler wurde behoben). Der Dateibestand außerhalb des Testordners war vor und nach dem Test identisch (Prüfsumme über `/home/claude` und die Ausgabeordner), `git status` von `uiq-archive` unverändert. **Echtes Yahoo-Fetching der neuen Sonde ist nicht verifiziert** (Kurztest mit echtem Yahoo steht aus, Anleitung Schritt 2).
* [belegt] Feste Ticker-Liste `watchlist_20261010.csv` (59 Ticker; vor dem Lauf fixiert, nicht während der Serie zu ändern; SHA-256 `b720d5414e5fb4b7bccf233c331227aa25d8ce62a884b62984feb513f4fe70d6`): 34 D26-Ticker (Produktion `2026-10-09_01`, `_lastRowIncomplete=True`), 14 D27-Ticker (`TIPS` und 13 Krypto, `_dataAsOf` 07.10.), SPY, 6 US-Kontrollen (`AAPL`, `MSFT`, `JPM`, `XOM`, `PG`, `KO`), 1 AU-Kontrolle (`ORG.AX`), 3 OTC-Kontrollen (`SIEGY`, `DHLGY`, `BAYRY`). Die Listen der D26/D27-Kandidaten sind aus den dokumentierten Befunden (Abschnitt 8) abgeleitet und gelten nicht als dauerhaft relevant; die Kontrollen sollen allgemeine Abrufprobleme von ticker- oder börsenspezifischen Mustern unterscheiden.
* Zeitplan (UTC): Erstlauf 01:40 am 10.10., danach alle 30 Minuten auf :00 und :30 bis einschließlich 12:00, 22 Messpunkte. Je Messpunkt und Ticker: Zeitstempel, Datum der letzten Zeile, OHLC-Vollständigkeit, Volume, letzter gültiger Close, Abrufstatus. Auswertung getrennt nach Börse/Gruppe; erfasst werden nicht nur der erste vollständige Messpunkt, sondern „stabil vollständig ab“ und Rückfälle (Zustände V/L/F/?).
* **Der Samstag (10.10.) ist ausdrücklich eine Zeitverlaufsbeobachtung und kein repräsentativer Handelstag** (Freitag-Datensatz bei geschlossenem Handel).

### 9.3 Freigabe 2: D27-Zusatzdiagnose, getrennt auszuwerten
* [belegt] Eigene Ausgabedatei `c2_d27_*.csv`; ausschließlich diagnostisch. Bildet `get_last_trading_day()` (`655d649`, Zeilen 1704–1707: `yf.download("SPY", period="5d", ...)`, `spy.index[-1].date()`) nach und vergleicht mit dem SPY-Abruf per `start`/`end` aus derselben Messung; zusätzlich Min/Max des letzten Zeilendatums der 14 D27-Ticker.
* Auswertung getrennt in drei Teile: (1) Beobachtung: welches Datum liefern die beiden Abrufwege; (2) [Hypothese] unterschiedliche Abruffenster erklären, weshalb das Label den Datenstand überholt; (3) Nachweisgrenze: ein SPY-Vergleich belegt nicht, dass dieselbe Ursache die 14 D27-Ticker erklärt (SPY ist Referenz, keine stellvertretende Messung für Krypto/`TIPS`). Keine gemeinsame Schlussfolgerung mit D26, solange die Evidenz das nicht trägt.
* [belegt, Code und Logik] Am Samstag existiert keine Zeile eines laufenden Handelstags; beide SPY-Wege liefern dort dasselbe Datum. Der Samstag ist für die Label-Hypothese daher nur eine Nullkontrolle. Prüfbar ist sie nur an einem Handelstag nach Beginn des US-Handels. Dafür liegt `watchlist_d27_spy_20261012.csv` (SPY plus 14 D27-Ticker) bereit; **dieser Lauf ist noch nicht freigegeben** und wird gesondert beschlossen.
* Fehlende Krypto-/`TIPS`-Zeile (Abschnitt 8.3): deren Zeitverlauf wird in der Hauptserie über den Zustand F erfasst.

### 9.4 Nächster Schritt
* Axel führt den Kurztest mit echtem Yahoo aus und startet danach die Serie (Anleitung Schritte 2 und 3); die Ergebnisse (`c2_serie_*.csv`, `c2_d27_*.csv`, `c2_serie_log_*.txt`) werden gemeinsam ausgewertet und in einem eigenen Nachtrag dokumentiert. Die Ergebnisse können das Vervollständigungsfenster eingrenzen; sie rechtfertigen für sich allein keine Produktionsänderung.

### 9.5 Nachtrag 09.10.2026 abends: Kurztest mit echtem Yahoo, Cache-Befund, Handelstags-Beobachtung D27 (nur angehängt)
* [belegt] Kurztest (Axel, Mac, 09.10. 18:27–18:29Z, 3 Messpunkte, 59 Ticker, 0 Abruffehler). In der Serien-CSV beendeten die Messpunkte 2 und 3 die Abrufe aller 59 Ticker innerhalb derselben Sekunde (Messpunkt 1 brauchte Sekunden).
* [belegt, Quellcode] Ursache gefunden im Quellcode von `yfinance` 1.5.2: In `history.py` (ca. Zeilen 211–218) wird für Abrufe, deren `end` mindestens 30 Minuten zurückliegt, `self._data.cache_get` genutzt; `cache_get` ist in `data.py` (ca. Zeilen 475–477) mit `@lru_cache(maxsize=64)` je Prozess versehen. Ein lang laufender Prozess hätte damit bei späteren Messpunkten die Antwort des ersten wiederholt (Zeitverlauf wäre unsichtbar geblieben). [Hypothese] Dass die Zeiten im Test tatsächlich aus diesem Cache stammten, ist durch die Quellcodelektüre und das Zeitmuster gestützt, aber nicht durch einen Gegenversuch auf dem Mac belegt (Wiederholung steht aus).
* [belegt] Betrifft nur die Messsonde, nicht die Produktion (dort läuft ein Prozess je Lauf, kein Zeitverlauf). Die früheren Sonden-Läufe (`nachlauf1`, `kontrolle1`, `kontrolle2`) sind nicht betroffen, weil jeder Lauf ein frischer Prozess war.
* [belegt] Korrektur in `c2_zeitverlauf.py`: je Messpunkt ein eigener Prozess (`serie` ruft intern `_messpunkt` auf), neue Spalte `fetch_ms`; Slot-Absturz wird protokolliert, die Serie läuft weiter. Test mit Stub, der den Cache nachbildet: 5 von 5 Messpunkten mit unterschiedlichen Werten, absichtlich abgestürzter Messpunkt als Fehler geloggt. **Echtes Yahoo mit der korrigierten Version ist noch nicht verifiziert** (Wiederholung des Kurztests, Ordner `~/uiq-c2-test2`).
* [belegt] `yfinance` hat zusätzlich eigene Cookie- und Zeitzonen-Caches im Benutzer-Cache-Verzeichnis, außerhalb von `--out-dir`; sie betreffen keine Kursdaten.
* [belegt, Beobachtung] D27 an einem Handelstag (Freitag 09.10., 18:27Z): SPY mit `period="5d"` (Weg des Labels) liefert als letzte Zeile 2026-10-09; derselbe Wert per `start`/`end` (Weg der Produktionsabrufe) liefert 2026-10-08; Differenz +1 Tag (`label_minus_spy_startend = 1`). Gleiches Ergebnis in allen drei Messpunkten (Messpunkte 2 und 3 laut Cache-Befund nicht unabhängig). Das letzte Zeilendatum der D27-Gruppe lag in dieser Messung bei 2026-10-08 (Min und Max; der Kurztest enthielt nur die 59-Ticker-Liste).
* [Hypothese] Das Label (`last_trading_day`) kann den Datenstand der per `start`/`end` geholten Reihen um einen Tag überholen, weil die beiden Abrufwege unterschiedliche Fenster haben (`end` exklusiv). Für SPY durch die Beobachtung gestützt. [offen] Nicht gezeigt ist, dass dies die 14 D27-Ticker (`TIPS`, 13 Krypto; dort fehlt die Zeile nachts) erklärt; das ist ein anderes Muster (fehlende Zeile bei 04:06Z, vollständig um 12:00Z).
* Folge für 9.3: Die Aussage „nur am Samstag prüfbar bzw. Samstag nur Nullkontrolle“ ist durch diese Beobachtung teilweise überholt. Ein getrennter Handelstagslauf (Mo 12.10., `watchlist_d27_spy_20261012.csv`) bleibt **nicht freigegeben** und wird gesondert entschieden.
* Unverändert: Freeze, C1-Sperre, keine Änderung an `market_aggregator.py`, KV, Archiv, `SUITE.md`; `e005f52` unangetastet; keine Entscheidung zum Verwerfen unvollständiger Zeilen.
* Nächster Schritt: Axel wiederholt den Kurztest mit der korrigierten Version (Messpunkte brauchen jetzt Sekunden, `fetch_ms` plausibel im Bereich einiger hundert ms je Ticker); danach Start der Serie (erste Messung 01:40Z).

### 9.6 Nachtrag 10.10.2026 mittags: VORLÄUFIGER Zwischenstand der Samstags-Serie bis 08:30Z (nur angehängt; wird durch den Endstand ergänzt, nicht ersetzt)

**Kennzeichnung:** [belegt] / [Hypothese] / [offen]. Datenbasis: Serie `20261009T185743Z` (Mac, `yfinance` 1.5.2, je Messpunkt ein frischer Prozess), 15 Messpunkte 01:40Z bis 08:30Z, 59 Ticker, 0 Abruffehler, Verspätung 0 s, Abrufdauer 579–954 ms je Ticker. Die Serie läuft bis 12:00Z weiter; der Endstand (22 Messpunkte) liegt erst nach Upload der Dateien vor. **Alle Aussagen gelten nur für diesen Samstag, den Freitag-Datensatz, und nur bis 08:30Z; der Samstag ist keine repräsentative Handelstagsmessung.** Freeze, C1-Sperre, `SUITE.md`, `e005f52` unverändert; keine Entscheidung zu A-2/C.

* [belegt] Kurztest zuvor: Korrektur der Cache-Ursache mit echtem Yahoo bestätigt. 3 Messpunkte (18:47–18:49Z), je 11–13 s, 699–737 ms Median, statt Sekundenbruchteilen im ersten Test (siehe 9.5). Die Serie selbst zeigt in allen 15 Messpunkten echte Abrufe.
* **D26, nicht-US-Börsen:** [belegt] 31 Ticker haben von 01:40Z bis 08:30Z unverändert die Freitag-Zeile (09.10.) mit leeren OHLC und gesetztem Volume (`last_row_close_nan`, letzter gültiger Close 08.10.): DE 18/18, UK 7/7, IT 2/2, FR 2/2, SE 1/1, BE 1/1 (`UCB.BR`). Rückfälle: 0 (kein Wechsel). Eine Vervollständigung über Nacht fand bis 08:30Z nicht statt. [offen] Das Vervollständigungsfenster liegt damit nach 08:30Z (am 09.10. waren die Donnerstag-Zeilen um 12:00Z vollständig); Messpunkte 09:00–12:00Z stehen aus. [offen] Ob das Muster an Handelstagen und in der Produktion gleich aussieht.
* **D26, bereits vollständige Ticker:** [belegt] `TEF.MC` (Madrid), `SHEL` und `HUBB` waren ab 01:40Z vollständig. `SHEL`/`HUBB` passen zum Mac-Befund vom 09.10. `TEF.MC` weicht ab: am 09.10. 04:06Z war die Zeile auf dem Mac unvollständig. [offen] Ursache des Unterschieds (anderer Tag, anderes Verhalten).
* **Kontrollen:** [belegt] 6 US-Kontrollen, `ORG.AX` und `SPY` ab 01:40Z vollständig und unverändert.
* **D27, Krypto (13 Ticker):** [belegt] Bis 07:00Z war die letzte Zeile der 08.10.; zwischen 07:00 und 07:30Z kam bei allen 13 die Zeile für den 09.10. dazu (z. B. `BTC-USD` 729→730 Zeilen), danach stabil. Die Zeile fehlt also nicht dauerhaft, erscheint aber erst rund 7 Stunden nach Tagesende (UTC). [offen] Ob die Produktion nachts (≈01:15–01:55Z) dasselbe sieht und wie dies mit dem Befund 8.3 (07.10.-Zeile am 09.10. 04:06Z) zusammenhängt. [Hypothese] Zeitverzögerung beim Anlegen der Tageszeile; Ursache bei Yahoo unbekannt.
* **D27, `TIPS`:** [belegt] Letzte Zeile bleibt bis 08:30Z der 08.10. (500 Zeilen unverändert), während `SPY` die 09.10.-Zeile hat. Verhalten unterscheidet sich von den Krypto-Tickern; keine gemeinsame Ursache behauptet. Siehe eigener Punkt unten.
* **D27, Label:** [belegt] `SPY` liefert am Samstag in beiden Abrufwegen denselben Tag (`label_minus_spy_startend = 0`, 09.10.) — erwartetes Ergebnis der Nullkontrolle. Am Freitag (09.10., 18:27–18:49Z) war die Differenz +1. [Hypothese] Das Label überholt den Datenstand an Handelstagen (nur für SPY gestützt). Ein Handelstagslauf (Mo 12.10.) ist weiterhin nicht freigegeben.
* **OTC-ADRs:** [belegt] Die Freitag-Zeile der drei OTC-Kontrollen ändert sich nach 01:40Z: Close um 03:30Z (`SIEGY` 152,84→152,89; `DHLGY` 31,45→31,43; `BAYRY` 12,25→12,24), Volume um 04:00Z (`SIEGY` 12.068→138.900; `DHLGY` 4.143→104.300; `BAYRY` 132.706→715.200); danach stabil bis 08:30Z. [Hypothese] Die Produktionsabweichung 0,12–0,58 % (8.4) kann ein Zeiteffekt sein (Produktion läuft ≈01:15–01:55Z, also vor der Aktualisierung). Belegt ist nur die Änderung der Werte im Zeitverlauf, nicht, dass sie die Produktionsabweichung erklärt.

### 9.7 Eigener Punkt (kein D26/D27): Symbol `TIPS` im Universum
* [belegt, Axel, Yahoo-Seite 10.10.] `TIPS` ist bei Yahoo Tianrong Internet Products and Services, Inc. (OTC, Pennystock; letzter Kurs 08.10. 0,0006), **nicht** der iShares TIPS Bond ETF (Symbol `TIP`, NYSE Arca).
* [belegt, Snapshot `2026-10-09_01`] `TIPS` steht im Produktions-Universum (`homeMarket` US) mit `price` 0,0007; in einem Block mit `regime: bull`, `score: 87`, `prefilterScore: 90` und `earningsDTE: null` sowie in einem weiteren Block mit VCP-Feldern. Welcher Auswertungsteil das ist, wurde nicht geprüft.
* [offen] Ob `TIPS` bewusst im Universum steht oder `TIP` gemeint war. [offen] Volume-Abweichung: Messreihe 296,7 Mio. für den 08.10. gegenüber 20,2 Mio. auf Axels Seite (anderer Tag oder andere Feldbedeutung; nicht geklärt).
* Keine Bewertung, keine Änderung; bis zur Freigabe Freeze. Die D27-Aussage stützt sich nur auf die 13 Krypto-Ticker; `TIPS` wird getrennt ausgewertet.

### 9.8 Stand
* Serie läuft bis 12:00Z; Mac bleibt bis Montag eingeschaltet; Upload von `c2_serie_*.csv`, `c2_d27_*.csv`, `c2_serie_log_*.txt` danach. Endauswertung mit `auswerten`, Ergebnisabschnitt als eigener Nachtrag (der Zwischenstand bleibt stehen).
* Nach dem Endstand gemeinsam zu entscheiden: weitere Messfenster (Wochentagsnacht, z. B. Di 13.10.), Handelstagslauf D27, A-2/C. Digest-Stand im KV bleibt offen.

## 10. Endergebnis der Samstags-Serie (Messung 10.10.2026, Upload und Auswertung 11.10.2026; nur angehängt, Abschnitte 9.6–9.8 bleiben als Zwischenstand stehen)

**Kennzeichnung:** [belegt] / [Hypothese] / [offen]. **Datenbasis:** Serie `20261009T185743Z`, Mac, `yfinance` 1.5.2, je Messpunkt ein frischer Prozess; 22 Messpunkte 01:40Z bis 12:00Z (Log endet mit „ende“), 59 Ticker, 1.298 Zeilen (22 × 59), alle Messpunkte mit Verspätung 0 s, keine übersprungenen Messpunkte, 0 Abruffehler; Abrufdauer 579–954 ms Median je Ticker. Auswertung mit `auswerten`; Detailtabelle `c2_auswertung_20261009T185743Z.csv`. **Grenzen:** Ein Tag, ein Datensatz (Freitag-Zeile, gemessen am Samstag, kein Handelstag), Auflösung 30 Minuten (Ereignisse sind nur auf das Intervall zwischen zwei Messpunkten eingegrenzt), nur 59 ausgewählte Ticker und Mac statt GitHub-Runner. Freeze, C1-Sperre, `SUITE.md`, `e005f52` unverändert; keine Entscheidung zu A-2/C, keine Bewertung des Verwerfens unvollständiger Zeilen.

### 10.1 D26 — Zeitpunkt der Vervollständigung (offene Frage aus 9.6 beantwortet, soweit der Samstag trägt)
* [belegt] Alle 31 zuvor unvollständigen Freitag-Zeilen (DE 18, UK 7, IT 2, FR 2, SE 1, BE 1) waren von 01:40Z bis einschließlich 08:30Z unverändert unvollständig (OHLC leer, Volume gesetzt) und waren **im Messpunkt 09:00Z alle gleichzeitig vollständig**. Das Intervall ist 08:30–09:00Z. Es gibt keinen Unterschied zwischen den Börsen (kein Staffelmuster nach Handelsschluss), keine Rückfälle (0), kein Ticker wurde später vollständig.
* [belegt] Das Volume der unvollständigen Zeile war am Samstag bereits fast final: Verhältnis Volume (09:00Z) zu Volume (08:30Z) Minimum 1,0000, Median 1,0004, Maximum 1,058 (Börse für Börse nahe 1). Das unterscheidet sich vom Muster am 09.10. um 04:06Z (London teils Faktor 6 bis ≈450.000, z. B. `VOD.L` 7.308 → 45.969.797; Abschnitt 8.2). [offen] Ob der Unterschied am Wochentag (Freitag-Zeile am Samstag) oder an der Tageszeit/Umgebung liegt; nicht entscheidbar mit einem Tag.
* [belegt] Abstand des neuen Close zum zuvor letzten gültigen Close (08.10.): Median 1,53 %, Maximum 7,94 % (`DTE.DE`), Minimum 0,07 % (31 Ticker). Das passt größenordnungsmäßig zum Befund vom 09.10. (Median 1,56 %, Maximum 5,28 %; 8.1). [Hypothese] Wer in der Produktion den Preis der unvollständigen Zeile durch den vorherigen Close ersetzt, liegt in diesem Umfang daneben; ausdrücklich keine Bewertung der Auswirkung auf Scores.
* [belegt] `TEF.MC` (Madrid), `SHEL`, `HUBB` waren durchgehend ab 01:40Z vollständig. [offen] Ursache für `TEF.MC` (am 09.10. 04:06Z auf dem Mac unvollständig).
* [Hypothese] Ein einzelnes Ereignis auf Yahoo-Seite zwischen 08:30 und 09:00Z vervollständigt die Vortageszeilen der nicht-US-Börsen gemeinsam. Nicht belegt: Ursache, ob das Ereignis täglich um dieselbe Zeit stattfindet, und ob es an Handelstagen gleich liegt. Die 09.10.-Beobachtung (unvollständig 04:06Z, vollständig 12:00Z) ist damit verträglich, beweist es aber nicht.

### 10.2 D27 — fehlende Schlusszeile (Krypto und `TIPS` getrennt)
* [belegt] **Krypto (13 Ticker):** Tageszeile für den 09.10. fehlte bis 07:00Z (letzte Zeile 08.10.) und war ab 07:30Z bei allen 13 da (729 → 730 Zeilen), danach unverändert bis 12:00Z (Close/Volume stabil). Intervall 07:00–07:30Z, ≈7,5 Stunden nach Tagesende (UTC), ein eigenes, früheres Ereignis als in 10.1. Keine Rückfälle.
* [belegt] **`TIPS`:** Zeile für den 09.10. fehlte bis 08:30Z (500 Zeilen) und war ab 09:00Z da (501), im selben Intervall wie die D26-Zeilen. Close unverändert 0,0006; Volume der neuen Zeile 105.264.732 (die 08.10.-Zeile hatte 296.710.848). Siehe 9.7 zur Symbolfrage. Keine gemeinsame Ursache mit den Krypto-Tickern behauptet.
* [belegt] **Label:** `label_minus_spy_startend` war in allen 22 Messpunkten 0 (SPY in beiden Abrufwegen 09.10.), Nullkontrolle wie erwartet. Am Freitag 09.10. (18:27–18:49Z) war die Differenz +1 (Abschnitt 9.5). [Hypothese] Das Label überholt den Datenstand nur an Handelstagen (für SPY gestützt). [offen] Ob dies die D27-Befunde in der Produktion erklärt; Krypto/`TIPS` sind ein anderes Muster (fehlende Zeile bis zum Morgen, nicht Label-Differenz). Handelstagslauf (Mo 12.10.) weiterhin nicht freigegeben.

### 10.3 OTC-ADRs (Kontrollen, getrennt von D26/D27)
* [belegt] Die Freitag-Zeile von `SIEGY`, `DHLGY`, `BAYRY` wurde in zwei Schritten aktualisiert: Close im Intervall 03:00–03:30Z (`SIEGY` 152,84 → 152,89; `DHLGY` 31,45 → 31,43; `BAYRY` 12,25 → 12,24), Volume im Intervall 03:30–04:00Z (`SIEGY` 12.068 → 138.900; `DHLGY` 4.143 → 104.300; `BAYRY` 132.706 → 715.200); danach unverändert bis 12:00Z. Ein drittes Ereignis, anders als 10.1 und 10.2.
* [Hypothese] Die Produktionsabweichung der 22 OTC-Ticker von 0,12–0,58 % (8.4) kann auf dieser Aktualisierung beruhen, weil die Produktion vor dem Update läuft. Belegt ist die zeitliche Änderung, nicht ihr Zusammenhang mit der Abweichung. Nur 3 OTC-Ticker gemessen.

### 10.4 Weitere Beobachtungen
* [belegt] Nur ein Abruf wich vom Normalpfad ab: `UCB.BR` im Messpunkt 11:30Z, Status `ok_fallback`/`1y_fallback`, 256 statt 510 Zeilen (Letzte Zeile und OHLC identisch; um 12:00Z wieder 510 Zeilen). 1 von 1.298 Abrufen. [offen] Ursache; Relevanz: derselbe Abrufpfad (`period="1y"` nach dem 2y-Versuch) existiert in `fetch_one`, daher kann die Reihenlänge einzelner Ticker zwischen Läufen schwanken (Bezug zu offener Frage „Auswirkung ungleicher Reihenlängen“, 8.6). Keine Aussage zur Produktion ohne Auswertung der Produktionsdaten.
* [belegt] Kontrollgruppen (6 US-Ticker, `ORG.AX`, `SPY`): in allen 22 Messpunkten vollständig und unverändert.
* [belegt] Gesamtbild der Änderungen im Zeitverlauf, nach Ticker gezählt: 31 Ticker ändern sich genau einmal im Intervall 08:30–09:00Z (30 D26-Ticker plus `TIPS`), `UCB.BR` (ebenfalls D26) ändert sich um 09:00Z und danach durch den Fallback um 11:30Z und die Rückkehr um 12:00Z, 13 Krypto-Ticker genau einmal in 07:00–07:30Z, 3 OTC-Ticker zweimal in 03:00–04:00Z; alle übrigen Ticker blieben unverändert.

### 10.5 Was die Messung nicht zeigt, und Stand
* [offen] Ob die Ereigniszeiten (03:30/04:00, 07:30, 09:00Z) an Wochentagen gleich sind; ob GitHub-Runner und Mac dasselbe sehen; ob die Zeitpunkte an anderen Tagen schwanken; die Verteilung über alle 742 Ticker (nur 59 gemessen). Samstag ist kein Handelstag; die Freitag-Zeile wurde am Samstag gemessen.
* [belegt] Relevanz für den Zeitplan der Produktion, nur für diese Messung: Die Produktion läuft laut Abschnitt 2 etwa 01:15–01:55Z; in dieser Messung lagen alle drei Aktualisierungsereignisse (OTC, Krypto, nicht-US-Börsen) **nach** dem Produktionszeitpunkt. Daraus folgt keine Empfehlung; die Wahl zwischen späterem Abruf, gezieltem Nachholabruf und Verwerfen unvollständiger Zeilen bleibt eine getrennte Entscheidung (A-2/C), die zusätzliche Wochentagsdaten braucht.
* Freeze besteht. C1 bleibt gesperrt; C2-diag nicht freigegeben. Keine Änderung an `market_aggregator.py`, KV, Archiv, `SUITE.md`; `e005f52` unangetastet. Digest-Stand im KV (`date`, `generated_at`) weiterhin offen, soweit nicht von Axel gelesen.
* Nächster Schritt (Entscheidung Axel): ob eine Wochentagsmessung gewünscht wird (z. B. eine Nacht Di 13.10. auf Mi 14.10., engeres Raster 07:30–10:00Z plus 03:00–04:30Z), ob der D27-Handelstagslauf (Mo 12.10.) freigegeben wird, und wie die Symbolfrage `TIPS` weiterverfolgt wird; danach gemeinsame Entscheidung A-2/C.

## 11. Entscheidungen Axel 11.10.2026 abends (nur angehängt; keine Empfehlung zu A-2/C)

* **Beschlossen (Axel, in der Rückfrage am 11.10.):** D27-Handelstagslauf am Montag, 12.10.2026, rein lesend und diagnostisch, wie geplant. Grenzen: nur SPY und die 14 dokumentierten D27-Ticker (`watchlist_d27_spy_20261012.csv`); keine Änderung an Produktionscode, Freeze, Workflows, kein manueller Produktionslauf; Rohresultate mit Zeitstempel sichern; Krypto, `TIPS` und `SPY` getrennt auswerten; ein fehlender Tagesbalken wird als Beobachtung dokumentiert, nicht als Datenfehler oder Beleg einer gemeinsamen Ursache. Befehl und Zeitraster in `ANLEITUNG-Zeitverlauf.md`, Schritt 4 (Messpunkte 12:30–15:00Z im 15-Minuten-Takt, 11 Messpunkte).
* **Beschlossen:** Auswertung der Montagsdaten am Dienstag, 13.10., nach dem US-Schluss (der Tagesbalken vom Montag ist erst dann beurteilbar). Die Wochentagsmessung (Nacht Di 13.10. auf Mi 14.10.; Raster 03:00–04:30Z für OTC, 07:30–10:00Z für nicht-US-Börsen, Krypto, `TIPS`; SPY und Kontrollen enthalten; dieselbe dokumentierte Teilmenge; kein Produktionspfad) wird **erst nach** dieser Auswertung entschieden; vorher kein Start. Vorbereitung und Stubtest sind dafür zulässig, Stubtest soll Zeitraster, nicht stillschweigend übersprungene Messpunkte und die Abwesenheit jedes Produktionspfads prüfen.
* **Beschlossen:** `TIPS` bleibt unverändert; keine automatische Umbenennung und keine stillschweigende Ersetzung durch `TIP`. Zu klären sind erst: Instrument bei Yahoo (Name, Börse, Typ, Währung; teilweise belegt in 9.7), ursprünglich vorgesehenes Instrument im UIQ-Universum, bewusste Aufnahme oder Verwechslung mit `TIP`, nachgelagerte Berechnungen und Strategien mit dem Symbol. Erst danach Entscheidung über eine Korrektur.
* [belegt] Abgrenzung: Die Hypothese „Label überholt Datenstand“ wird an einem Handelstag bereits während der US-Sitzung sichtbar (so am Freitag 09.10., 18:27Z, +1); die Dienstagsauswertung betrifft den vollständigen Tagesbalken, nicht die Frage, ob das Label an einem Handelstag voraus ist. [offen] Ob die beiden Fragen am Montag trennbar sind, zeigen die Messpunkte.
* Unverändert: Freeze, C1-Sperre, `SUITE.md`, `e005f52`; keine Änderung an `market_aggregator.py`. A-2/C werden nach beiden Auswertungen gemeinsam entschieden.

## 12. Ergebnis D27-Handelstagslauf Montag 12.10.2026 (Teilauswertung; nur angehängt)

**Kennzeichnung:** [belegt] / [Hypothese] / [offen]. **Datenbasis:** Serie `20261011T165542Z` (Mac, `yfinance` 1.5.2), 11 Messpunkte 12:30Z bis 15:00Z im 15-Minuten-Takt, 15 Ticker (13 Krypto, `TIPS`, `SPY`), 165 Zeilen, 0 Abruffehler, keine übersprungenen Messpunkte. Der Dienstag-Teil (Beurteilung des vollständigen Montag-Tagesbalkens nach dem US-Schluss) steht aus und wird getrennt angehängt. Freeze, C1-Sperre, `SUITE.md`, `e005f52` unverändert; keine Änderung am Produktionscode; keine Entscheidung zu A-2/C.

### 12.1 SPY — Label gegen Datenstand an einem Handelstag
* [belegt] `SPY` mit `period="5d"` (Weg von `get_last_trading_day()`): letztes Datum 09.10. in den Messpunkten 12:30–13:15Z; **ab 13:30Z (US-Handelsbeginn, 9:30 ET) bis 15:00Z das Datum 12.10.** (7 von 7 Messpunkten, Fenster 06.10.–12.10.). Der Wechsel liegt im Intervall 13:15–13:30Z.
* [belegt] `SPY` per `start`/`end` (Weg der Produktionsabrufe): letzte Zeile in allen 11 Messpunkten 09.10. (499 Zeilen, unverändert), auch nach Handelsbeginn.
* [belegt] `label_minus_spy_startend` (Kalendertage): 0 bis 13:15Z, ab 13:30Z 3 (= ein Handelstag Vorsprung über das Wochenende). Die am Freitag 09.10. gemessene +1 und der Samstags-Nullwert (10.10.) passen dazu. Die 5d-Zeile für 12.10. hat gesetzte Kurswerte (`spy5d_last_row_close_nan = False`); sie ist die laufende Handelstageszeile.
* [Hypothese] Mechanismus: `period="5d"` enthält ab Handelsbeginn die laufende Tageszeile, `start`/`end` mit exklusivem `end` (heutiges Datum) nicht. Für SPY an drei Handelsbeobachtungen (09.10. abends, 12.10. ab 13:30Z) gestützt; Ursache bei Yahoo/`yfinance` selbst nicht geprüft.

### 12.2 Archivprüfung (rein lesend, `uiq-archive` HEAD nach `git pull`)
* [belegt] Tagläufe: Snapshot `2026-10-07_17`: `meta.last_trading_day` = 2026-10-07, `_dataAsOf` bei allen 1.632 Vorkommen = 2026-10-06. Snapshot `2026-09-15_17`: Label 2026-09-15, `_dataAsOf` 1.655 Vorkommen = 2026-09-14 (6 weitere = 2026-07-17). Der Label-Vorsprung von einem Handelstag ist damit in beiden auswertbaren Tagläufen vorhanden. (`2026-09-10_17` und `2026-09-11_17` enthalten noch kein `_dataAsOf`; nicht auswertbar.) Gezählt werden Vorkommen des Feldes im Snapshot, nicht Ticker.
* [belegt] Nachtläufe: Label und `_dataAsOf` stimmen für die Mehrheit überein (`2026-10-07_01`, `-08_01`, `-09_01`, `-10_01`, `-11_04`, `-12_04`); Ausnahmen jeweils eine kleine Gruppe (z. B. `2026-10-09_01`: 28 Vorkommen mit 07.10. bei Label 08.10.).
* [belegt] Snapshot `2026-10-12_04`: Label 2026-10-09; alle 13 Krypto-Ticker mit `_dataAsOf` 2026-10-10, obwohl am Montag um 12:30Z die Zeile 11.10. vorliegt (12.3).
* [Hypothese] Die Label-Differenz ist ein **Tagslauf-Phänomen** (nach US-Handelsbeginn), das D27-Muster der Nachtläufe (Krypto-Zeile fehlt morgens) ist davon zu trennen. [offen] Welche Folgen der Label-Vorsprung im Tagslauf in der Pipeline hat (z. B. `validate_data_freshness`, Anzeige von `last_trading_day`, Verbraucher des Feldes); nicht geprüft, keine Bewertung.

### 12.3 Krypto und TIPS
* [belegt] Alle 13 Krypto-Ticker hatten bereits im ersten Messpunkt (12:30Z) die Sonntag-Zeile 11.10. (730 Zeilen) und blieben bis 15:00Z in Close/Volume/Zeilenzahl unverändert; kein `NaN`, keine Rückfälle. Die laufende Tageszeile 12.10. ist wegen exklusivem `end` nicht enthalten. Der Zeitpunkt, zu dem die Zeile 11.10. erschien, ist am Montag nicht gemessen (nur: vor 12:30Z). Zusammen mit Abschnitt 10.2 (09.10.-Zeile erschien Samstag zwischen 07:00 und 07:30Z) und dem Snapshot vom 12.10. 04Z (Stand 10.10.) passt das zu einer täglichen Verzögerung bis morgens; [offen] ob sie an Wochentagen und Montag gleich liegt.
* [belegt] `TIPS`: letzte Zeile 09.10. in allen 11 Messpunkten (499 Zeilen), unverändert; keine Zeile für 12.10. (erwartungsgemäß, siehe `end` exklusiv) und für `TIPS` auch keine neuere als 09.10. (Wochenende). Keine Aussage zu `TIPS` über die Symbolfrage (9.7) hinaus.

### 12.4 Grenzen und Stand
* [offen] Vollständigkeit der Montagszeilen nach dem US-Schluss (Dienstag-Teil). [offen] Verhalten des GitHub-Runners; Mac-Messung, 15 Ticker. [offen] Wann die Krypto-Tageszeile an Wochentagen erscheint (nicht gemessen).
* Nächste Schritte (Entscheidung Axel): Dienstag-Auswertung; danach Entscheidung über die Wochentagsmessung (Nacht Di→Mi); `TIPS`-Identität; danach gemeinsame Entscheidung A-2/C. Freeze besteht.

## 13. Ergebnis Dienstag 13.10.2026: Montagsbalken, Wochentags-Vergleich D27 und Produktions-Nachtlauf (nur angehängt; Abschnitte 1–12 unverändert)

**Kennzeichnung:** [belegt] / [Hypothese] / [offen]. **Datenbasis:** (a) Serie `20261012T151911Z` (Mac, `yfinance` 1.5.2), 7 Messpunkte 06:00Z bis 09:00Z am 13.10. im 30-Minuten-Takt, 15 Ticker (13 Krypto, `TIPS`, `SPY`; Watchlist `watchlist_d27_spy_20261012.csv`), 105 Zeilen, 0 Abruffehler, Verspätung 0 s, Abrufdauer 534–841 ms Median je Ticker; (b) Produktions-Snapshot `2026-10-13_03` (`generated` 02:56:42Z, `uiq-archive`, rein lesend). Freeze, C1-Sperre, `SUITE.md`, `e005f52` unverändert; keine Änderung am Produktionscode; keine Entscheidung zu A-2/C.

### 13.1 SPY und Label
* [belegt] Die Montagszeile (12.10.) von `SPY` lag per `start`/`end` bereits im ersten Messpunkt (06:00Z) vor: 500 Zeilen, vollständig (Close 778,10), in allen 7 Messpunkten unverändert. Der Zeitpunkt, zu dem sie vollständig wurde, liegt vor 06:00Z und ist nicht gemessen.
* [belegt] `SPY` mit `period="5d"`: Label 12.10. in allen 7 Messpunkten, `label_minus_spy_startend` = 0. Nachts/morgens stimmen Label und Datenstand überein; der Label-Vorsprung aus Abschnitt 12.1 tritt nur während der laufenden US-Sitzung auf.

### 13.2 Krypto (13 Ticker): Wochentags-Wiederholung des Samstagsbefunds
* [belegt] Letzte Zeile 11.10. (729 Zeilen) in den Messpunkten 06:00, 06:30, 07:00Z; **bei allen 13 Tickern im Messpunkt 07:30Z die Zeile 12.10. (730 Zeilen)**, danach bis 09:00Z unverändert (Close, Volume, Zeilenzahl), kein `NaN`, keine Rückfälle. Intervall 07:00–07:30Z, identisch mit dem Samstag (10.10.: 07:00–07:30Z).
* Zwei Beobachtungen (Samstag, Dienstag) mit gleichem Intervall. [Hypothese] tägliche Verzögerung der Tageszeile bei Yahoo von ≈7,5 Stunden nach Tagesende (UTC). Keine Regel belegt (zwei Tage, 30-Minuten-Raster).

### 13.3 TIPS
* [belegt] Letzte Zeile 09.10. (499 Zeilen) in den Messpunkten 06:00–08:30Z; **im Messpunkt 09:00Z die Zeile 12.10. (500 Zeilen)**, vollständig: Open/High/Low 0,0006/0,0006/0,0005, Close 0,0005, Volume 41.358.499. Intervall 08:30–09:00Z, identisch mit dem Samstag (10.10.: Freitagszeile 08:30–09:00Z) und mit dem Intervall, in dem am Samstag die 31 nicht-US-Zeilen (D26) vollständig wurden.
* [Hypothese] `TIPS` (OTC-Pennystock, 9.7) folgt demselben Ereignis wie die nicht-US-Börsenzeilen, nicht dem Kryptomuster. Nicht belegt: ob die nicht-US-Zeilen auch an Wochentagen im Intervall 08:30–09:00Z vollständig werden (diese Ticker waren in dieser Watchlist nicht enthalten). Keine Aussage zur Symbolfrage über 9.7 hinaus.

### 13.4 Produktions-Nachtlauf `2026-10-13_03` (Dienstag)
* [belegt] `meta.last_trading_day` = 2026-10-12; `data_integrity`: `lastRowIncomplete` US 4 von 712 (0,6 %), nicht-US 31 von 31 (100 %), `spy` false; `labelAheadOfTickerData` US 14 von 712 (2,0 %); `flags` leer (A-1 meldet nur das US-Verhältnis ab 50 %).
* [belegt] `_lastRowIncomplete = True` bei 35 Tickern: die bisherigen 34 (DE 18, UK 7, FR 2, IT 2, SE 1 sowie `HUBB`, `SHEL`, `TEF.MC`, `UCB.BR` mit `homeMarket` US) **und neu `ORG.AX`** (AU). Beispiele: `VOD.L`, `SHEL`, `ORG.AX` mit `_dataAsOf` 2026-10-12 und `_lastCloseDate` 2026-10-09, Preis = Close vom 09.10. (118,35 / 100,18 / 11,37).
* [belegt] `_dataAsOf`: 13 Krypto-Ticker 2026-10-11, `TIPS` 2026-10-09, übrige 2026-10-12. Die 14 Ticker mit `labelAheadOfTickerData` sind damit genau die D27-Gruppe (13 Krypto plus `TIPS`).
* [belegt] Das D26-Muster (alle nicht-US-Montagszeilen unvollständig) und das D27-Muster (Krypto-Zeile fehlt, `TIPS`) treten damit auch in einem **Wochentags-Produktionslauf** auf; Erzeugungszeit 02:56Z, also vor den am Samstag/Dienstag gemessenen Ereignissen (OTC 03:00–04:00Z, Krypto 07:00–07:30Z, nicht-US/`TIPS` 08:30–09:00Z).
* [offen] `HUBB`, `SHEL`, `TEF.MC` sind in der Produktion in jedem betrachteten Nachtlauf (09.10., 13.10.) unvollständig, waren auf dem Mac aber vollständig (`SHEL`/`HUBB` am 09.10. 04:06Z, alle drei am 10.10. 01:40Z). Ursache (Umgebung Mac gegenüber Runner, Zeit, Tag) nicht geklärt; die Hypothese „Mac sieht dasselbe wie der Runner“ ist für diese Ticker nicht gestützt.
* [offen] `ORG.AX`: in `2026-10-09_01` und auf dem Mac am 10.10. vollständig, am 13.10. 02:56Z unvollständig. Ursache nicht geklärt (Tag, Zeit, Börse; `homeMarket` AU).

### 13.5 Was damit gestützt ist, und was nicht
* [belegt] Drei zeitlich getrennte Aktualisierungsereignisse der Vortageszeile wurden gemessen (Samstag; Krypto und `TIPS` zusätzlich am Dienstag): OTC (Close 03:00–03:30Z, Volume 03:30–04:00Z), Krypto (07:00–07:30Z), nicht-US-Börsen und `TIPS` (08:30–09:00Z, nicht-US nur am Samstag). Der Produktions-Nachtlauf läuft vor allen dreien (02:56Z am 13.10.; bisher 01:15–01:55Z).
* [offen] Wochentagszeit der nicht-US-Börsenzeilen und der OTC-Aktualisierung; Verhalten des GitHub-Runners gegenüber dem Mac; Verteilung über alle 742 Ticker; Auswirkungen der unvollständigen Zeilen auf Scores (nicht untersucht). Keine Aussage zu A-2/C.

### 13.6 Aussage Axel (12.10.) zu `TIPS` und `TIP`, nicht entschieden
* [stated Axel] Sobald Klarheit besteht, solle `TIPS` im Aggregator-Lauf gegen den korrekten Ticker `TIP` getauscht werden. Das Protokoll hält dies als Absicht fest. Voraussetzungen vor einer Änderung: Freeze-Ausnahme, eine Produktionsänderung pro Nacht (Pflicht-Header Punkt 8), Klärung der Quelle von `TIPS` (`ticker_master.py`, KV `approved_extra_tickers` oder `data/ex_iwv_tickers.csv`; in `market_aggregator.py` kommt `TIPS` nicht vor; `TIP` ist im Universum nicht vorhanden), Vorgeschichte (bewusste Aufnahme oder Verwechslung), Umgang mit der Historie und mit ETF-spezifischem Scoring. Keine Änderung vorgenommen.

### 13.7 Nächster Schritt (Entscheidung Axel)
* Wochentagsmessung für die Gruppen, die am Dienstag nicht enthalten waren: die 31 nicht-US-Börsenzeilen und die OTC-Kontrollen (volle Watchlist `watchlist_20261010.csv`, 59 Ticker), z. B. Nacht Di 13.10. auf Mi 14.10., Messpunkte 03:00–10:00Z. Danach gemeinsame Entscheidung A-2/C. Nicht begonnen.

## 14. Ergänzungen 13.10.2026 (Quelle `TIPS`, Repo-Prüfung, Bars-Befund, Abgleich Master/Snapshot)

### 14.1 Quelle von `TIPS` im Code
* [belegt] `ko-aggregator` @ `4aa0d15` (13.10.2026, read-only): `TIPS` steht in `ticker_master.py` Zeile 751 (`"TIPS": {"lists": {"SECTOR_ETFS_US": 95}, "sectors": {}}`, Block Bonds) und in `ticker_master.json` (Zeile 6070). Sonst kein Treffer als Symbol (ohne `backups/`). `TIP` kommt im Repo nirgends als Symbol vor; ein Tausch erzeugt keine Dublette.
* [belegt] `ticker_master.json` ist ein Migrationsüberbleibsel (geschrieben von `migrate_ticker_master_phase_b.py --json`, anderes Schema). Der Aggregator importiert nur `ticker_master.py`; kein anderer Leser im Repo. Beim Tausch wäre die JSON für den Betrieb nicht zu ändern.
* [belegt] Folge eines Tauschs für Snapshot und Archiv: Die Historie unter `TIPS` ist ein anderes Instrument (Tianrong Internet Products and Services, OTC); `TIP` begänne ohne Historie. [Hypothese] Effekt auf Scores/Ranglisten nicht geprüft.

### 14.2 Konsumenten (`uiq-suite`, Klon Stand `89010c4`, 06.10.; Remote `bee8435`, 12.10., nicht gezogen)
* [belegt] `scripts/vendor/ko-prompts.js` Zeilen 3113, 7043, 7071: `imTip` ist Doku bzw. Prompt-Text („TIPS ETF (Inflationserwartungen)“), gemeint der Bond-ETF. Keine Stelle in `uiq-suite` oder `ko-aggregator` setzt `imTip`.
* [Hypothese] Befüllung im Frontend-Repo über einen eigenen Pfad, unabhängig vom Aggregator-Universum. [offen] Nicht gesehen.
* [offen] `regime-test` (Branch `h5-saisonalitaet-entwurf`, `H6_tip_canary_ENTWURF.md`, geparkter Entwurf „TIP-Canary“): Abhängigkeit von der TIP-Zeitreihe nicht geprüft.
* [offen] Vor einer Freeze-Ausnahme: Frontend-Repo und `regime-test` auf `imTip`, `'TIPS'`, `TIP` prüfen.

### 14.3 `add_ticker.py`
* [belegt] Existiert in `ko-aggregator` @ `4aa0d15` nicht (kein Dateiname `add_ticker*`, `*ticker*upload*`, `*ticker_add*`; keine Erwähnung außer im Docstring von `ticker_master.py`: „GOVERNANCE — NEUEN TICKER AUFNEHMEN (bis add_ticker.py existiert)“). `docs/TICKER-MASTER-MIGRATION-PHASE-AB.md` Zeile 104: erst nach stabiler Phase C geplant, „deutlich einfacher als ursprünglich gedacht“.
* [belegt] Seit Phase C (24.09.2026) liegen statisches Universum, Sektor-Watchlists und Referenzlisten nur in `ticker_master.py`. Weitere Quellen zur Laufzeit: KV `approved_extra_tickers`, `data/ex_iwv_tickers.csv`, `BAD_SYMS`-Filter.
* [Hypothese] Axels Erinnerung an ein Skript stammt aus der Vor-Phase-C-Zeit (mehrere Eintragsstellen) bzw. aus den Migrationsskripten `audit_ticker_sources.py` und `migrate_ticker_master_phase_b.py`.

### 14.4 Bars-Befund `2026-10-13_03`
* [belegt] `bars` je Nachtlauf (`AAPL`): 09.10._01 501; 10.10._01 501; 11.10._04 500; 12.10._04 499; **13.10._03 251**. `_dataAsOf` am 13.10. 2026-10-12.
* [belegt] In `2026-10-13_03` haben nur `AAPL` (251) und `SLDE` (331; vorher 329–330) weniger als 400 Bars; in den vier Vorläufen nur `SLDE`.
* [offen] Ursache der 251 Bars (Fallback `period="1y"` in `fetch_one`? [Hypothese], nicht belegt) und Wirkung auf den `AAPL`-Score. Keine Aussage.

### 14.5 Abgleich Master gegen Snapshot `2026-10-13_03`
* [belegt] 86 Ticker im Snapshot, nicht in `ticker_master.py`; 26 Ticker im Master, nicht im Snapshot (Datei `ticker_abgleich_master_snapshot_20261013.csv`, 112 Zeilen).
* [offen] Ursachen nicht geklärt (Laufzeitquellen KV/ex-IWV für die 86 [Hypothese]; Fetch-Ausfall, `BAD_SYMS` oder Delisting für die 26). Die Datei bleibt lokal, nicht in Repos.

### 14.6 Offene Entscheidungen Axel (unverändert)
* Wochentagsmessung Nacht Di 13.10. → Mi 14.10. (59er-Watchlist). Nicht gestartet.
* Read-only Identity-Audit-Skript für Symbolverwechslungen (Stub-Test zuerst). Nicht begonnen.
* `TIPS`→`TIP`: Freeze-Ausnahme, eigene Nacht, vorher 14.2-Prüfung. Keine Änderung vorgenommen.

## 15. Nachtrag 14.10.2026: AAPL-Bars, Wochentagsserie, Produktionslauf `2026-10-14_01`

Quellenhinweis: Alle Zahlen dieses Abschnitts hat Claude am 14.10.2026 selbst aus den hochgeladenen Dateien der Serie `20261013T153143Z` (sha256-Anfang: `c2_serie` 7c8ca452…, `c2_d27` fb2c6e10…, `c2_serie_log` f1154328…) und aus dem Archivstand `origin/main` @ `b11d786` (Snapshot `2026-10-14_01.json.gz`, sha256-Anfang 44bd8340…) nachgerechnet. Sie sind Befunde dieser Dateien, keine Aussagen Dritter. Eine unabhängige zweite Prüfung durch Axel oder einen Reviewer steht aus.

### 15.1 Nachtrag zu 14.4 (`AAPL`-Bars)
* [belegt] `2026-10-14_01`: `AAPL` `bars` 500, `_bars_raw` 501. Die 251 Bars aus `2026-10-13_03` (14.4) blieben damit ein Einzelereignis in einem Lauf; sie werden hier nicht überschrieben, 14.4 bleibt gültig.
* [belegt] Archivscan 22.07.–13.10. (190 Snapshots, 137.425 Ticker-Snapshots mit `bars`): Sprünge von mindestens 400 auf weniger als Vorwert minus 100 gab es 7-mal in 6 Läufen: `MSFT` 16.08._06 (251), `TIPS` und `MSFT` 01.09._09 (250, 251), `NVDA` 03.09._16 (253), `AAPL` 08.09._08 (252), `AXS` 25.09._00 (249), `AAPL` 13.10._03 (251). Jeweils ein bis zwei Ticker pro Lauf, im folgenden Lauf wieder etwa 500 (außer 13.10., dort 14.10._01 wieder 500). Kein Wert um 125.
* [belegt] Wirkung in den Ereignisläufen: Preis gleich, `ema200`/`dist200` abweichend (`MSFT` 16.08.: ema200 428,38 gegenüber 440,55); `NVDA` 03.09._16: `confluenceScore` 58 gegenüber 48, Note A+ gegenüber A. `meta.errors` in den Ereignisläufen unverändert (Fallback wird nicht gemeldet).
* [Hypothese] Fallback `period="1y"` in `fetch_one` (Zeilen 7261 ff. @ `4aa0d15`): vereinbar mit den Daten, nicht belegt (Snapshot hält nicht fest, welcher Versuch griff). Alternative (verkürzte Yahoo-Antwort auf den 2y-Aufruf) nicht ausgeschlossen. [offen] Warum der erste Aufruf bei diesen Tickern scheitert.
* [belegt] Auf dem Mac in der Wochentagsserie: 885 Abrufe, alle `attempt_used = 2y_explicit`, alle `ok`; kein Fallback aufgetreten. (Mac, 30-Minuten-Raster, andere Abrufart als der 12-Thread-Lauf des Aggregators.)
* [belegt] `SLDE` (273 Bars am 22.07., 331 am 13.10., wächst um etwa 1 je Handelstag) ist kein Fallback-Muster. [Hypothese] junges Listing; Erstnotiz nicht im Archiv.

### 15.2 Wochentagsserie Mi 14.10.2026 (Run `20261013T153143Z`)
* [belegt] Messpunkte 03:00 bis 10:00Z, 15 Slots, 59 Ticker (`watchlist_20261010.csv`), 885 Abrufe, 0 Abruffehler, Verspätung je Slot 0 s, Median Abrufdauer 550–670 ms. Python 3.13.1, yfinance 1.5.2, je Slot frischer Prozess.
* [belegt] 31 nicht-US-Börsenzeilen (DE 18, UK 7, FR 2, IT 2, SE 1, `UCB.BR`): letzte Zeile 13.10. mit `Close=NaN` in den Slots 03:00–08:30Z (Log: 31), vollständig ab 09:00Z (Log: 0), kein Rückfall. Fenster 08:30–09:00Z, identisch mit dem Samstagsbefund (10.1).
* [belegt] 13 Krypto-Ticker: letzte Zeile bis 07:00Z der 12.10., ab 07:30Z der 13.10., kein Rückfall. Fenster 07:00–07:30Z; dritte Beobachtung (Sa, Di, Mi).
* [belegt] `TIPS`: letzte Zeile bis 08:30Z der 12.10., ab 09:00Z der 13.10. Fenster 08:30–09:00Z; dritte Beobachtung.
* [belegt] `label_minus_spy_startend` 0 in allen 15 Slots; `spy5d_label_date` 2026-10-13. Die D27-Gruppe liegt (Minimum des letzten Indexdatums) bis 07:00Z einen Handelstag hinter SPY, danach nur noch `TIPS` bis 08:30Z.
* [belegt] SPY, 6 US-Kontrollen (`AAPL`, `JPM`, `KO`, `MSFT`, `PG`, `XOM`), 3 OTC-ADRs (`BAYRY`, `DHLGY`, `SIEGY`), `ORG.AX`, `TEF.MC`, `HUBB`, `SHEL`: Zeile vom 13.10. schon im ersten Slot 03:00Z vollständig. Das ist eine obere Schranke. [offen] Der tatsächliche Zeitpunkt liegt vor 03:00Z und ist nicht beobachtet.
* [belegt] Vergleichswerte: `AAPL` Close 13.10. auf dem Mac 341,27 (Vortag 340,97), `JPM` 331,43, `KO` 90,11, `MSFT` 543,45, `PG` 153,04, `XOM` 174,08.
* [Hypothese] Die OTC-Aktualisierung liegt an Wochentagen früher als am Samstag (dort Close 03:00–03:30Z, Volume 03:30–04:00Z, 10.3). Belegt ist nur: Samstag zweistufig im Fenster, Mittwoch schon bei 03:00Z vollständig und im Produktionslauf 00:59Z noch fehlend (15.3).
* Grenzen: ein Wochentag, 30-Minuten-Raster, 59 Ticker, Mac statt GitHub-Runner, Beginn erst 03:00Z.

### 15.3 Produktionslauf `2026-10-14_01`
* [belegt] Erzeugt 2026-10-14T00:59:44Z (`elapsed_s` 79,2), Version 5.48.0, `last_trading_day` 2026-10-13, `total` 744, `errors` 22. Das ist früher als alle seit A-1 betrachteten Nachtläufe (01:17Z bis 02:56Z).
* [belegt] `data_integrity`: `lastRowIncomplete` US 655 von 712 (92,0 %), nicht-US 30 von 31 (96,8 %), `spy` true; `labelAheadOfTickerData` US 56 von 712 (7,9 %); **`flags` = `LAST_ROW_INCOMPLETE`**. Erstmalige Auslösung eines A-1-Flags in den betrachteten Läufen.
* [belegt] Die 56 `labelAhead`-Ticker haben `_dataAsOf` 2026-10-12: 13 Krypto, `TIPS`, 42 weitere (OTC-ADRs und `AIVAF`). Auf dem Mac ist die OTC-Zeile des 13.10. um 03:00Z vorhanden, im Produktionslauf (00:59Z) fehlte sie.
* [belegt] Von 686 Tickern mit `_lastRowIncomplete` haben 653 den gleichen `price` wie in `2026-10-13_03`, sind also einen Handelstag alt. `AAPL` 340,97 (Mac 13.10.: 341,27); gleiche Lage bei `JPM`, `KO`, `MSFT`, `PG`, `XOM`, SPY.
* [belegt] Verlauf `lastRowIncomplete` US je Nachtlauf (jeweils anderer Tag): 07.10._01 (01:17Z) 188 von 710; 08.10._01 (01:39Z) 4; 09.10._01 (01:52Z) 4; 10.10._01 (01:36Z) 1; 13.10._03 (02:56Z) 4 von 712; 14.10._01 (00:59Z) 655 von 712.
* [Hypothese] Die Vervollständigung der US-Vortageszeilen bei Yahoo geschieht in einer Welle zwischen etwa 01:00 und 01:40Z. Die Folge der Läufe passt dazu, ist aber kein Mechanismusbeleg: verschiedene Tage, ein Datenpunkt je Zeit, die Mac-Serie beginnt erst 03:00Z.
* [offen] Warum der Lauf um 00:59Z entstand (Auslösung, Zeitplan, Verzögerung). Ob die öffentlichen Ausgaben (`generate_public_recommendations`, KV, Digest) auf diesen Snapshot gebaut wurden oder ein späterer Lauf ihn ersetzte (im Archiv bis `b11d786` nur `_01`). Wirkung auf Scores und Ranglisten. Ob A-1 die nachgelagerten Ausgaben geschützt hat: A-1 meldet nur (Diagnosefeld), schützt nicht.
* [belegt, Verfeinerung zu 13.4] `HUBB` und `SHEL` sind US-Aktien; ihre Unvollständigkeit im Produktionslauf passt zum US-Muster aus diesem Abschnitt. `TEF.MC` war in `2026-10-14_01` vollständig (letzte Schlusszeile 13.10.), `ORG.AX` ebenfalls. [offen] Warum beide am 13.10. um 02:56Z unvollständig waren.

### 15.4 `UNI-USD`
* [belegt] `UNI-USD` stand 22.07.–10.09.2026 im Universum mit Preis 0,0002 (kein plausibler Uniswap-Kurs, [Hypothese] anderes Instrument) und `bars` von 270 auf 220 fallend (etwa 1 je Tag). Ab `2026-09-11_04` nicht mehr im Snapshot (Anzahl 735 auf 734). [offen] Ursache der abnehmenden Bars; Verbindung zu einer Universumsänderung nicht geprüft.

### 15.5 Identity-Audit und ABR-Idee (Stand 14.10.2026, abends)
* [belegt] `uiq_identity_audit.py` v1 (391 Zeilen) von Claude geschrieben, liegt bei Axel in `~/Downloads`. Stub-Test (10 Prüfungen) bestanden. Offline-Lauf auf `2026-10-13_03` (Claude, kein Netz): 744 Symbole, 4 mit Hinweis (`TIPS` `PRICE_SUBCENT`; `AIVAF` 675, `CNRG` 9.420, `SRT.DE` 4.131 `VOLUME_TINY`), 904 Nähe-Paare ohne Namen nicht auswertbar. Preise unter 1 nur bei `TIPS`, `ADA-USD`, `DOGE-USD`.
* [offen] Online-Lauf (Yahoo-Stammdaten) nicht ausgeführt; Ergebnisse stehen aus. Hinweise sind Prüfhinweise, keine Urteile.
* [stated Axel] ABR-Idee (Zacks-ABR als Außenprüfung der Kandidaten): erst nach dem Identity-Audit, rein lokal; Eingangsliste `masterShortlist` (20), `top40` als Vergleich; Quelle Yahoo-Konsens (`recommendationMean`, `numberOfAnalystOpinions`) ausdrücklich getrennt vom Zacks-ABR; keine Wirkungsbehauptungen ohne Point-in-Time-Daten; keine Änderung an Aggregator, Workflows, KV, Archiv. Nicht gestartet.

### 15.6 Entscheidungsstatus
* Freeze und C1-Sperre unverändert; keine Produktionsänderung freigegeben; A-2/C offen, keine Empfehlung.
* `TIPS`→`TIP` weiter offen (Freeze-Ausnahme, eigene Nacht, Prüfung Frontend-Repo und `regime-test`).
* Optional, nicht entschieden: Nachtserie 00:30–03:30Z (US-Aktien, OTC, `ORG.AX`, `TEF.MC`, `HUBB`, `SHEL`, SPY) für das bisher unbeobachtete Fenster.
* Offen aus der Liste: Verwendung der öffentlichen Ausgaben aus `_01` (15.3), Ursache früher Laufzeit, KV `public/digest/latest` (`date`, `generated_at`) ungelesen.

## 16. Identity-Audit 14.10.2026 (Instrumentidentität im Universum)

### 16.1 Umfang und Reproduzierbarkeit
* [belegt] Geprüft wurden 744 Symbole des Snapshots `2026-10-14_01.json.gz` (erzeugt 2026-10-14T00:59:44Z, Version 5.48.0; sha256-Anfang 44bd8340…, 1.053.417 Byte). Archivstand `uiq-archive` @ `b11d786`; Master `ko-aggregator/ticker_master.py` @ `7c1c510` (65.941 Byte; zwischen `4aa0d15` und `7c1c510` unverändert); Skript `uiq_identity_audit.py` v1 (391 Zeilen, sha256-Anfang 148f0cd0…).
* [belegt] Ablauf auf dem Mac (Axel): Stub-Test bestanden (10 Prüfungen), Offline-Lauf, Online-Probelauf mit 5 Symbolen, voller Online-Lauf am 14.10. (Abruf gegen Yahoo gegen 20:14 deutscher Zeit); Laufzeit 11 Min. 21 Sek. (`real`), 744 Abfragen, Pause 0,3 s. Ergebnisdateien (sha256-Anfang): `identity_online_20261014T181449Z.csv` 8dc9f282…, `identity_naehe_…csv` 3649eac2…, `identity_zusammenfassung_…txt` 43264a1d… Sie bleiben lokal in `~/uiq-audit-lokal`, nicht in Repos.
* [belegt] Der Offline-Lauf von Claude und der von Axel auf `_01` stimmen überein (744 Symbole, 4 Hinweise: `TIPS` `PRICE_SUBCENT`; `AIVAF`, `CNRG`, `SRT.DE` `VOLUME_TINY`; 904 Nähe-Paare).
* Methode und Grenzen: Die Auswertung der Namen (alle 744) ist eine Sichtprüfung von Claude anhand der Yahoo-Angaben (`quoteType`, `shortName`/`longName`, Börse, Währung, Land) und seines Wissensstandes bis Mitte 2026. Keine ISIN-, FIGI- oder Registerprüfung (Yahoo liefert keine ISIN), keine unabhängige Zweitprüfung. Die Hinweise des Skripts sind Prüfhinweise, keine Urteile. Der Audit beantwortet „Welches Instrument meint das Symbol heute bei Yahoo?“, nicht „Was wollte UIQ?“.

### 16.2 Ergebnis des Skripts (Online)
* [belegt] 4 Symbole mit Hinweis. Je Art: `PRICE_DEVIATION` 1, `PRICE_SUBCENT` 1, `QUOTETYPE_MISMATCH` 1, `VOLUME_TINY` 3. Kein `INFO_FEHLER`, `NAME_FEHLT`, `CURRENCY_MISMATCH`, `MARKETCAP_TINY`.
* [belegt] Typen: 585 `EQUITY`, 146 `ETF`, 13 `CRYPTOCURRENCY`. Alle ETF-Listen enthalten nur ETFs, `CRYPTO_TICKERS` nur Kryptowerte. Einziger Typkonflikt: `TIPS`.

### 16.3 Instrumentidentität
* [belegt] `TIPS`: Tianrong Internet Products and Services, Inc. (OTC `OID`), Marktkapitalisierung 2.137.205, Yahoo-Preis 0,0009 gegenüber 0,0005 im Snapshot; Master `SECTOR_ETFS_US` Position 95. Verwechslung mit dem gemeinten Bond-ETF `TIP` bestätigt (siehe 9.7, 13.6, 14.1). Der `PRICE_DEVIATION`-Hinweis ist bei einem Sub-Cent-Wert Rauschen.
* [belegt] `CNRG`: State Street SPDR S&P Kensho Clean Power ETF, Volumen 9.176; Identität unauffällig, nur dünn gehandelt.
* [belegt] `AIVAF`: Aviva plc, OTC-Stammaktie (`OQX`), Volumen 675; Identität unauffällig. [Hypothese] Liquider wäre das ADR `AVVIY` (Wissensstand Claude, nicht geprüft).
* [belegt] `SRT.DE`: Sartorius Aktiengesellschaft, Stammaktie, Volumen 4.138; Identität unauffällig. [Hypothese] Die liquidere Gattung wären die Vorzugsaktien `SRT3.DE` (analog `VOW3.DE`; nicht geprüft).
* [belegt] `GOLD`: Yahoo meldet Gold.com, Inc.; `B` meldet Barrick Mining Corporation. Im Master steht `GOLD` in `SP500_TICKERS` Position 217 zwischen `NEM` und `ALB`/`MP` ohne Kommentar; `B` ist nicht im Master, sondern kommt über eine Zusatzquelle ins Universum (86 Snapshot-Symbole ohne Master-Eintrag, 14.5). `avgVol20` von `GOLD` lag in den Stichproben 22.07.–13.10. bei 0,37–0,77 Mio., der von `B` bei 7,9–12,7 Mio.; die Zeile `GOLD` war damit im ganzen Archivzeitraum nicht Barrick.
  [Hypothese] Der Master meinte Barrick, dessen früherer Ticker `GOLD` war (Wissensstand Claude). Belegt ist nur die heutige Identität, nicht die ursprüngliche Absicht. Dafür braucht es den historischen Kontext des Master-Eintrags oder die Bestätigung von Axel. [offen]
* [belegt] `USD`: ProShares Ultra Semiconductors (ETF mit zweifacher Hebelwirkung), `SECTOR_ETFS_US` Position 8 neben `SOXX` (6) und `SOXQ` (7). [Hypothese] bewusste Aufnahme als Halbleiter-ETF. Der Ticker entspricht dem Währungskürzel; mögliche Verwechslungen in Code und Auswertungen nicht geprüft. Bewertung offen. [offen]
* [belegt, Einzelfall] `MX` (INTL_TIER1 Position 60, Master-Kommentar „Suedkorea“ davor `SSNLF`): Yahoo meldet Magnachip Semiconductor. Passt zu einer koreabezogenen Aufnahme [Hypothese]; kein Hinweis auf Fehler.

### 16.4 Universumsstruktur (keine automatischen Fehler)
* [belegt] Zehn Paare mit gleichem Emittenten (normalisierter Name): `GOOG`/`GOOGL`, `BAYN.DE`/`BAYRY`, `DTE.DE`/`DTEGY`, `ENEL.MI`/`ENLAY`, `IFX.DE`/`IFNNY`, `MBG.DE`/`MBGAF`, `RHM.DE`/`RNMBY`, `RWE.DE`/`RWEOY`, `VOD`/`VOD.L`, `VOW3.DE`/`VWAGY`. Die Namensnormalisierung ist grob, weitere Paare sind möglich. [offen] Ob die Doppelung Ranglisten und Kandidatenlisten beeinflusst, hängt von der Bewertungs- und Deduplizierungslogik ab; der Audit beantwortet das nicht.
* [belegt] Listenbezeichnung und Inhalt weichen ab (Land laut Yahoo): `EU_ADR_TICKERS` enthält 7 US-Emittenten (`FCX`, `MLM`, `NUE`, `RSG`, `URI`, `VMC`, `WM`); `INTL_TIER1` enthält 3 (`GTLB`, `KEYS`, `SCCO`); `SP500_TICKERS` (248 Symbole) enthält 33 Emittenten mit Yahoo-Land außerhalb der USA (u. a. `ACN`, `ARM`, `BABA`, `NIO`, `TM`, `STLA`). Der Master-Kommentar bei `FCX` („Materials — liquid Options“) zeigt, dass Listen auch für andere Zwecke als den Namen genutzt werden. Das ist keine Identitätsverwechslung und nicht automatisch ein Fehler.
* [belegt] `homeMarket`: `TEF.MC` (Börse Madrid) und `UCB.BR` (Börse Brüssel) tragen `homeMarket` US; bekannte Lücke der Suffix-Tabelle (separat geführt).
* [belegt] `LTC` (LTC Properties, REIT) und `LTC-USD` (Litecoin) sind beide im Universum; unterschiedliche Instrumente mit gleicher Basis ohne Suffix.
* [belegt] Nähe-Liste: 904 Paare mit Edit-Abstand 1 auf Basis-Symbolen, überwiegend bedeutungslose Namensähnlichkeit (z. B. die `EW?`- und `IY?`-ETFs). Ein Fall nach dem Muster `TIP`/`TIPS` ist nicht enthalten, weil `TIP` im Universum fehlt.
* Hinweis: Alle Befunde dieses Unterabschnitts sind Beschreibungen, keine Fehler und keine Änderungsempfehlungen.

### 16.5 Grenzen und offene Prüfungen
* [offen] 26 Master-Ticker fehlen im Snapshot und sind vom Audit nicht abgedeckt (er fragt nur Snapshot-Symbole ab): `MMC`, `CFLT`, `EXAS`, `MRUS`, `BMWYY`, `AZSEY`, `HBMRY`, `PDRDY`, `ABB`, `VOLVY`, `TAG.DE`, `1COV.DE`, `STLAM.MI`, `GLPG.BR`, `ARND.DE`, `WDP.BR`, `NTT`, `KYOCY`, `SSNLF`, `BRKM`, `CYBR`, `IRBO`, `EMSG`, `POL-USD`, `UNI-USD`, `MAG` (aus dem Abgleich 13.10., 14.5). Ein Yahoo-Lauf nur für diese 26 wäre ein separater, optionaler Read-only-Schritt, nicht gekoppelt an eine Änderung des Master-Universums. Ursachen des Fehlens (Fehlschlag, Delisting, Übernahme, Ticker-Änderung) nicht geklärt.
* [offen] Zusatzquellen-Namen, die Claude nicht verifizieren konnte (neuere Namen jenseits seines Wissensstandes): u. a. `HAPN`, `PLGO`, `VISN`, `XRN`, `CIFR` (umbenannt). Keine Aussage zur Richtigkeit.
* [offen] Die Namensprüfung ist eine einmalige Sichtprüfung; ein erneuter Lauf an einem anderen Tag wurde nicht gemacht.

### 16.6 Entscheidungsstatus
* Axel entscheidet: `TIPS` → `TIP` (Freeze-Ausnahme, eigene Nacht, vorher Prüfung des Frontend-Repos und von `regime-test`, 14.2); gegebenenfalls `GOLD` → `B`; Behandlung von `USD`. Keine Empfehlung von Claude. Keine Änderung am Master, am Aggregator oder an Workflows vorgenommen oder freigegeben.
* Freeze und C1-Sperre unverändert; A-2/C offen. Der ABR-Test (15.5) folgt erst nach diesem Audit und bleibt rein lokal.

## 17. Nachtrag 14.10.2026 abends: Startzeit des Produktionslaufs, Digest-Befund, Archivvergleich (nur angehängt; keine Empfehlung zu A-2/C)

### 17.1 Läufe laut GitHub Actions (von Axel gemeldet)
* [belegt, von Axel übernommen] `KO-Scanner Market Aggregator` Lauf #354: Auslöser *Scheduled*, `main`, „Oct 13, 04:54 GMT+2“ (= 02:54Z), Dauer 26 min 21 s. Lauf #355: *Scheduled*, `main`, „Today at 02:57“ (am 14.10. gemeldet; Zeitzone nicht ausdrücklich genannt, als MESZ gelesen, also 00:57Z), Dauer 24 min 36 s. Die Läufe sind fortlaufend nummeriert; dazwischen lag kein weiterer Lauf dieses Workflows, also auch keiner per `workflow_dispatch`.
* [belegt] Workflow `market-aggregator.yml` (Stand `7c1c510`): einziger Zeitplan `cron '00 22 * * 1-5'` (22:00 UTC, Kommentar „Nachbörsen-Lauf“) plus `workflow_dispatch`. `ko-watchdog` (`workers/ko-watchdog/wrangler.toml`): `cron '45 22 * * 1-5'`.
* [belegt, abgeleitet] Verspätung gegenüber 22:00Z: #354 (Soll Mo 12.10.) 4 h 54 min; #355 (Soll Di 13.10.) 2 h 57 min. In der Sitzung wurde zunächst irrtümlich „3 h 57 min“ genannt; maßgeblich ist 2 h 57 min.
* [belegt] Zu den Snapshots: `13.10_03` `generated` 02:56:42Z, `elapsed_s` 105,3; `14.10_01` `generated` 00:59:44Z, `elapsed_s` 79,2. `generated` wird am Ende des Abrufs gesetzt (`market_aggregator.py:11361`). Das Abruffenster (`generated` minus `elapsed_s`) ist abgeleitet, nicht gemessen: #354 02:54:56–02:56:42Z, #355 00:58:24–00:59:44Z. Es passt zu den gemeldeten Startzeiten.
* [offen] Ob GitHub die Verspätung regelmäßig oder nur zufällig erzeugt, ist mit zwei Läufen nicht entschieden. Die `generated`-Zeiten früherer Nächte (29.09.–10.10.: 01:01Z–02:09Z) legen Verspätungen von etwa 3 bis 4 Stunden nahe, belegen aber keine Startzeiten. Die Läufe vom 29.09. bis 12.10. wurden nicht abgefragt.

### 17.2 Befund Tages-Digest (Abruf durch Axel am 14.10. gegen 20:00Z)
* [belegt] Abruf `GET https://ko-sync.ahildebrand.workers.dev/public/digest` (liest KV `public/digest/latest`; Bearer-Token `OWNER_TOKEN` oder `STATIC_TOKEN`, `ko-sync-worker.js:187–192`, `321–330`). Datei `digest_20261014T200028Z.json`, 26.694 Byte, sha256-Anfang 1885766e8f59f510. Das Token steht nicht in der Datei.
* [belegt] Inhalt: `digest_id` `DIGEST-20261013`, `date` 2026-10-13, `snapshot_id` `SNAP-20261014-010515Z`, `generated_at` 2026-10-14T01:22:06Z; `dce_public.generated` 2026-10-14T00:59:44Z, `as_of` 2026-10-13.
* [belegt] Der Digest stammt aus dem Snapshot `2026-10-14_01`: `dce_public.generated` ist gleich `meta.generated`; die Signale stimmen mit dem Snapshot überein (Beispiel AAPL: Digest „RSI 51.3“, Snapshot `rsi` 51,3). `generated_at` 01:22:06Z liegt im Laufzeitfenster von #355 (Start 00:57Z + 24 min 36 s); der Digest wurde also in diesem Lauf neu erzeugt.
* [belegt] Von den 33 Symbolen, die im Digest als Top-3 je Strategie vorkommen, haben im Snapshot 32 `_lastCloseDate` 2026-10-12 (27 davon mit `_lastRowIncomplete` True); nur `TEF.MC` hat 2026-10-13. Beispiel AAPL: `price` 340,97 (Schluss vom 12.10.), `_dataAsOf` 2026-10-13. Der Digest trägt also das Datum 13.10., seine Auswahl beruht für fast alle genannten Titel auf Kursen vom 12.10. Ein Kurs ist im Digest selbst nicht enthalten; was die öffentliche Seite anzeigt, wurde nicht geprüft.
* [offen] `snapshot_id` nennt 01:05:15Z und passt nicht zu `generated` 00:59:44Z; welcher Schritt diese Zeit setzt, ist nicht gelesen.
* [offen, Randbeobachtung] Im Digest steht in *meanrev* AVD auf Rang 1 mit „RSI 0.0“ (Score 90). Ob das ein echter Wert oder ein Datenartefakt ist, wurde nicht geprüft.
* [offen] Ob auch der Digest vom 13.10. (Lauf #354, Abruf 02:54Z) vollständige Daten nutzte, ist nicht belegt; dazu liegt keine Digest-Datei vor. Der zugehörige Snapshot `13.10_03` hat 3 veraltete US-Aktien (17.3).

### 17.3 Archivvergleich über Nächte (rein lesend, `uiq-archive` `origin/main` @ `b11d786`, 191 Snapshots)
* Methode: Das Feld `_lastCloseDate` gibt es erst ab Version 5.48.0 (Snapshot `07.10_01`). „US-Aktien“ = `homeMarket` US, ohne Symbole auf `-USD` und ohne Börsensuffix aus mindestens zwei Großbuchstaben (696 bis 698 Symbole; schließt Krypto, `TEF.MC`, `UCB.BR` aus). „Veraltet“ = `_lastCloseDate` kleiner als `meta.last_trading_day`. Abruffenster wie in 17.1 abgeleitet. Ergebnisdatei lokal: `/tmp/claude-0/out/ar/stale_nights.csv`, sha256-Anfang eaf37b4bc200d06c.
* [belegt] Ergebnis (US-Aktien):

| Snapshot | Abruffenster (Z) | n | veraltet | `_lastRowIncomplete` |
|---|---|---|---|---|
| 07.10_01 | 01:16:11–01:17:53 | 696 | 186 (27 %) | 186 |
| 08.10_01 | 01:37:41–01:39:05 | 696 | 2 (0 %) | 2 |
| 09.10_01 | 01:50:31–01:52:43 | 696 | 3 (0 %) | 2 |
| 10.10_01 | 01:34:52–01:36:29 | 696 | 1 (0 %) | 0 |
| 13.10_03 | 02:54:56–02:56:42 | 698 | 3 (0 %) | 2 |
| 14.10_01 | 00:58:24–00:59:44 | 698 | 698 (100 %) | 655 |

  Wiederkehrende Reste: `HUBB`, `SHEL`, `TIPS` (aus früheren Abschnitten bekannt). Nicht vergleichbar und ausgeschlossen: `07.10_17` (Tageslauf mitten am Handelstag, 17:25Z) sowie die Wochenend- und Montagsläufe um 04:17Z (Handelstag liegt schon Tage zurück: 0 veraltet).
* [belegt] Zusatzprüfung ohne das Feld, über Preisgleichheit (`price` im Frühlauf gegen den späteren Snapshot mit vollständigem Freitagsschluss): `03.10_01` (generated 01:01:35Z, Freitagssitzung) gegen `04.10_13` bzw. `05.10_04`: bei 692 US-Aktien nur 18 gleich (3 %). Kalibrierung: `10.10_01` (01:36Z) gegen `11.10_04`: 674 von 696 gleich (97 %). Kontrolle aufeinanderfolgende Handelstage `08.10_01` gegen `09.10_01`: 7 gleich (1 %). Der Lauf vom 03.10. um 01:01Z zeigte also ebenfalls fast durchgehend den Vortagesschluss. Annahme: Der Sonntags- und Montagsstand enthält den Freitagsschluss.
* [belegt] Über die sechs Nächte mit Feld plus die Nacht 03.10. fällt der Anteil veralteter US-Zeilen mit späterem Abruf: etwa 100 % bei Abruf um 00:58–01:02Z, 27 % um 01:16–01:18Z, höchstens 0,5 % ab 01:35Z. In `07.10_01` ist der Anteil über die Listenposition nicht gleichmäßig verteilt und zeigt keinen Verlauf entlang der Liste.
* [Hypothese] Yahoo ergänzt die Tageszeile der US-Aktien in einem Fenster etwa zwischen 01:00Z und 01:35Z. Die Grenze ist nicht bestimmt (keine Daten zwischen 01:18 und 01:35Z, keine zwischen 01:02 und 01:16Z). Auf dem Mac waren die US-Zeilen um 03:00Z vollständig (Wochentagsserie 15.2, obere Schranke).
* [Hypothese] Ein Start pünktlich um 22:00Z läge vor allen beobachteten Abrufen und würde danach regelmäßig veraltete US-Zeilen liefern. Aktuell hängt die Datenvollständigkeit davon ab, wann GitHub den Zeitplanlauf tatsächlich startet. Zwei der sieben Nächte (03.10., 14.10.) liefen früh und waren fast vollständig veraltet. Das ist nicht gemessen, sondern aus den Zeitpunkten gefolgert.
* Grenzen: sieben Nächte; vor dem 07.10. nur über die Preisgleichheit prüfbar, und dort nur dann, wenn ein späterer Snapshot mit Freitagsschluss existiert (nur `03.10_01`, `10.10_01`). Die Krypto- und Nicht-US-Zeilen sind nachts bekanntermaßen noch nicht vollständig (Messungen Abschnitt 10 und 15.2) und wurden hier nicht bewertet. Ursachen auf Yahoo-Seite sind nicht geprüft.

### 17.4 Entscheidungsstatus
* Keine Änderung an Aggregator, Workflows, KV, Archiv oder `SUITE.md` vorgenommen oder freigegeben. Freeze und C1-Sperre unverändert. Der Befund (17.3) ist kein Votum für A-2/C und keine Empfehlung zu Startzeit, Cron oder Verzögerungslogik.
* Offen für Axel: wie mit dem Befund umgegangen wird (nur zur Kenntnis nehmen, weitere Messung, später gemeinsam mit A-2/C); Abfrage der Läufe 29.09.–12.10. in der Actions-Liste; `snapshot_id`-Quelle im Code lesen; Git-Historie zu `GOLD`; optionale Nachtserie 00:30–03:00Z für die genaue Fenstergrenze; optionaler Yahoo-Lauf für die 26 fehlenden Master-Ticker; ABR-Test.

## 18. Nachtrag 14.10.2026 abends: `ko-watchdog` (Cloudflare), Dispatch-Läufe und Verzögerung (nur angehängt; keine Empfehlung zu A-2/C)

### 18.1 Cloudflare: Cron-Ereignisse und Deployment (von Axel gemeldet, Screenshots 14.10.2026 gegen 22:25 und 22:32 deutscher Zeit)
* [belegt, von Axel übernommen] Der Worker `ko-watchdog` hat in Cloudflare die Cron-Trigger `15 04 * * 1-6` (04:15 UTC) und `45 13 * * 1-5` (13:45 UTC). Der Ausdruck `45 22 * * 1-5` aus `workers/ko-watchdog/wrangler.toml` (Repo) ist dort **nicht** eingetragen. Verlauf der Cron-Ereignisse (UTC, alle Status „Erfolg“; „Erfolg“ heißt nur, dass der Worker ohne Fehler endete): Mi 14.10. 13:45:46 und 04:15:46; Di 13.10. 13:46:02 und 04:15:43; Mo 12.10. 13:45:45 und 04:15:43; So 11.10. 13:45:46 und 04:15:41; Fr 09.10. 04:15:42; Do 08.10. 13:45:44 (Anzeige „1 bis 10 von 11 Ereignisse“).
* [belegt, abgeleitet] Wochentagszählung bei Cloudflare: `1-5` lief am Sonntag 11.10. und Donnerstag 08.10., nicht am Freitag; `1` ist dort der Sonntag. (GitHub zählt `1` = Montag.)
* [belegt, von Axel übernommen] Deployments: aktive Version `2d985319`, 100 % Traffic, Fehlerrate 0 %, mittlere CPU-Zeit 17,78 ms; **letzte Bereitstellung 2026-09-12T15:31:00.468Z**, „Manuell bereitgestellt“ über das Dashboard von `ahildebrand`. Davor zwei weitere Dashboard-Bereitstellungen (`927cb6d4`, `c0338310`), drei Aktualisierungen des Secrets `GH_WATCHDOG_PAT` (vor ein bis zwei Monaten) und Wrangler-Bereitstellungen vor etwa drei Monaten.
* [belegt] Der von Axel gezeigte Code der aktiven Version (207 Zeilen, sha256-Anfang 31ac5bead6de9676) ist inhaltlich identisch mit `ko-aggregator/workers/ko-watchdog/ko-watchdog.js` @ `7c1c510` (208 Zeilen, sha256-Anfang 348f29feb7e6c512; Unterschied nur das fehlende Zeilenende nach der letzten Klammer). `RUN_SCHEDULES` enthält nur `"45 22 * * 1-5"` (Schwelle 22:00 UTC). Das ist v1.2 vom 11.09.2026; die Bereitstellung im Dashboard folgte einen Tag danach.

### 18.2 Wirkung des Deployments
* [belegt] Die beiden in Cloudflare eingetragenen Crons sind in `RUN_SCHEDULES` nicht enthalten. Dann gilt der Rückfall „unbekannter Cron“ (`ko-watchdog.js:81–99`): Dispatch nur, wenn das UTC-Datum von `master_market_data.meta.generated` in KV nicht dem heutigen UTC-Datum entspricht (`checkFreshness(env, null)`). Das 22:45-Fenster mit der Schwelle 22:00Z ist in Cloudflare nicht im Einsatz.
* [belegt, Actions-Liste, von Axel gemeldet] Lauf #352 „Oct 11, 06:15 GMT+2“ (= 04:15Z), Dauer 7 min 55 s, und Lauf #353 „Oct 12, 06:15 GMT+2“ (= 04:15Z), Dauer 7 min 56 s. Axels Meldung nennt die Auslöser-Bezeichnung (Scheduled oder Manually run) nicht; die Startzeit entspricht dem Cloudflare-Ereignis (04:15:41Z bzw. 04:15:43Z) und dem Archiv-Muster, es handelt sich daher mit hoher Wahrscheinlichkeit um Dispatch-Läufe des Watchdogs [Hypothese, eng]. Die Läufe #352 bis #355 sind fortlaufend nummeriert; am Di 13.10. und Mi 14.10. (04:15Z und 13:45Z) gab es keinen Dispatch-Lauf, KV war an diesen Tagen schon vom selben UTC-Tag.
* [belegt] Die zugehörigen Snapshots `2026-10-11_04` (generated 04:17:59Z, `elapsed_s` 100,6) und `2026-10-12_04` (generated 04:17:56Z, `elapsed_s` 94,1) liegen 2 min 18 s bzw. 2 min 13 s nach dem Cloudflare-Ereignis. Für die geplanten Läufe lag der Abruf 2 h 57 min bis 4 h 54 min nach dem Soll (17.1).
* [Hypothese] Die kurze Laufzeit der Dispatch-Läufe (rund 8 min gegenüber 24 bis 26 min der geplanten Nachtläufe) kommt von einem Trading-Day-Skip der Anthropic-Aufrufe, wenn sich der Handelstag nicht geändert hat (`generate_public_recommendations.js`). Nicht gelesen und nicht geprüft.
* [belegt] Der PAT `GH_WATCHDOG_PAT` war am 11.10. und 12.10. gültig (der Dispatch kam durch). Ein Ablaufdatum ist nicht bekannt. [offen]
* Zur Einordnung früherer Aussagen: In dieser Sitzung wurde zunächst angenommen, der Watchdog dispatche jede Nacht um 22:45Z und das könne die veralteten Daten erklären. Das trifft für den tatsächlich eingesetzten Stand nicht zu.
* Der Watchdog wirkt im jetzigen Stand nur als Sicherheitsnetz gegen einen ganzen Tag ohne Lauf (um 04:15Z und 13:45Z). Er hebt die Verspätung des Zeitplanlaufs nicht auf und verhindert nicht, dass ein früher Lauf veraltete US-Zeilen liefert.

### 18.3 Weitere Beobachtungen
* [belegt] `docs/RUNBOOK.md:30` hält fest, dass der GitHub-Cron nur „best effort“ läuft; dokumentiert ist eine Verzögerung von 3 h 23 min am 02.07.2026. Die Runbook-Zeilen zu 04:15 + 13:45 stammen vom 13.07.2026 und beschreiben die frühere Ausgangslage mit zwei Läufen.
* [belegt] Dateikopf und der HTTP-Pfad `/status?slot=1` von `ko-watchdog.js` beschreiben das 22:45-Fenster, das in Cloudflare nicht eingetragen ist.
* [offen] Ob der Ausdruck `45 22 * * 1-5` bei Einsatz in Cloudflare (Zählung 1 = Sonntag) Sonntag bis Donnerstag statt Montag bis Freitag bedeuten würde, ist eine Folgerung aus 18.1, kein Test.
* [offen] Startzeiten der geplanten Läufe 29.09.–10.10. (Actions-Liste, Filter `event:schedule`) wurden noch nicht übermittelt; Inhalte der Worker-Logs (`console.log`) wurden nicht eingesehen.

### 18.4 Entscheidungsstatus
* Keine Änderung an Aggregator, Workflow, Worker, Secrets, Cron-Triggern, KV, Archiv oder `SUITE.md` vorgenommen oder freigegeben. Freeze und C1-Sperre unverändert. Keine Empfehlung von Claude zu Startzeit, Cron, Watchdog-Logik oder Teilläufen.
* Offen für Axel (jeweils Produktionsänderung, Punkt 8, und nicht Teil dieses Protokolls): wie mit der Abweichung zwischen Repo (`45 22`) und Cloudflare (`15 04`, `45 13`) umgegangen wird; ob und wann die Startzeit des Aggregators ein Thema für A-2/C wird; ob für Nicht-US-Titel und Krypto (Zeilen erst 07:00–09:00Z vollständig) eine eigene Behandlung gebraucht wird. Lesende Vorarbeiten, nur auf Axels Go: Abhängigkeitsliste zur Laufzeit 22:00Z (Watchdog, Digest-Skript, Konsumenten, Datumslogik); Lesen von `fetch_one` und `_lastRowIncomplete` für die Tageszeile offener Märkte; Git-Historie zu `GOLD`.

## 19. Nachtrag 14.10.2026 abends: Startzeiten der geplanten Läufe, Commit-Stand, Folge für den Digest (nur angehängt; keine Empfehlung zu A-2/C)

### 19.1 Commit-Stand
* [belegt] Axel hat das Protokoll mit Commit `b411b2a` (`ahsub/UIQ-Suite`, Mi 14.10.2026 22:50:43 +0200, „Add files via upload“, `docs/UEBERGABE-2026-10-07.md`, +221 Zeilen) eingecheckt. Der committete Stand (607 Zeilen, sha256-Anfang d7c6b58178256eba) ist byteweise identisch mit der Fassung nach Abschnitt 18; er enthält also die Abschnitte 15 bis 18. Abschnitt 19 folgt erst im nächsten Commit.

### 19.2 Geplante Läufe laut Actions-Liste (Filter `event:schedule`, von Axel gemeldet; Anzeige GMT+2, hier in UTC; Soll jeweils 22:00Z des Vortags)
| Lauf | Start (Z) | Verspätung | Dauer | Snapshot `generated` (Z) |
|---|---|---|---|---|
| (Nr. nicht lesbar) 26.09. | 00:25 | 2 h 25 min | nicht lesbar | 00:27:56 |
| #338 29.09. | 01:35 | 3 h 35 min | 25 m 48 s | 01:37:45 |
| #339 30.09. | 01:09 | 3 h 09 min | 27 m 48 s | 01:12:43 |
| #340 01.10. | 01:08 | 3 h 08 min | 24 m 42 s | 01:10:51 |
| #341 02.10. | 01:24 | 3 h 24 min | 25 m 27 s | 01:27:17 |
| #342 03.10. | 00:59 | 2 h 59 min | 25 m 30 s | 01:01:35 |
| #346 06.10. | 02:07 | 4 h 07 min | 25 m 48 s | 02:09:40 |
| #347 07.10. | 01:15 | 3 h 15 min | 24 m 34 s | 01:17:53 |
| #349 08.10. | 01:37 | 3 h 37 min | **8 m 13 s** | 01:39:05 |
| #350 09.10. | 01:49 | 3 h 49 min | 26 m 18 s | 01:52:43 |
| #351 10.10. | 01:34 | 3 h 34 min | 25 m 38 s | 01:36:29 |
| #354 13.10. | 02:54 | 4 h 54 min | 26 m 21 s | 02:56:42 |
| #355 14.10. (früher gemeldet) | 00:57 | 2 h 57 min | 24 m 36 s | 00:59:44 |

* [belegt] Alle 13 sichtbaren geplanten Läufe starteten zwischen 2 h 25 min und 4 h 54 min nach dem Soll (Median 3 h 24 min). Die Verspätung ist in diesem Zeitraum also keine Ausnahme, sondern der Normalfall. Die `generated`-Zeiten liegen jeweils 2 bis 3 Minuten nach dem Start. [Hypothese] Ursache ist die Last bei GitHub um 22:00 UTC (`docs/RUNBOOK.md:30`: „best effort“); nicht geprüft.
* [belegt] In der gefilterten Liste fehlen die Nummern #343 bis #345, #348, #352 und #353: Das sind Läufe anderer Auslöser. #352 und #353 sind in 18.2 behandelt; zu #343 bis #345 und #348 liegt keine Angabe vor [offen]. Für #348 passt der Snapshot `07.10_17` (Tageslauf 17:25Z) [Hypothese].

### 19.3 Startzeit und Datenvollständigkeit (Ergänzung zu 17.3)
* [belegt] Weitere Preisgleichheitsprüfung wie in 17.3 (US-Aktien, Frühlauf gegen den späteren Snapshot mit vollständigem Freitagsschluss): `19.09_00` (generated 00:02:38Z) gegen `20.09_04`: 6 von 687 gleich (1 %); `26.09_00` (00:27:56Z) gegen `27.09_04`: 21 von 690 gleich (3 %). Zusammen mit `03.10_01` (3 %) und `14.10_01` (100 % veraltet nach Feld) lieferten alle vier getesteten Läufe mit Abruf vor etwa 01:03Z fast durchgehend den Vortagesschluss, Abruf um 01:16–01:18Z (`07.10_01`) 27 % veraltet, Abruf ab 01:35Z etwa 0 % (17.3).
* [belegt] Unter den 13 geplanten Läufen der Tabelle lag der Abruf bei fünf Läufen (26.09., 30.09., 01.10., 03.10., 14.10.) vor etwa 01:12Z. Davon sind 26.09., 03.10. und 14.10. als veraltet belegt; `30.09` und `01.10` sind nicht prüfbar (kein Feld, kein Freitagsvergleich). Wie oft der Zeitplanlauf zu früh abruft, schwankt also mit der GitHub-Verzögerung.
* [Hypothese] Die Grenze, ab der Yahoo die US-Tageszeilen liefert, liegt zwischen etwa 01:02Z und 01:35Z. Genauer ist sie nicht bestimmt.

### 19.4 Folge für den öffentlichen Digest (Code gelesen, `uiq-suite` `scripts/generate_public_recommendations.js` @ `89010c4`, Zeilen 3876–3896)
* [belegt] Trading-Day-Skip-Check: Ist `date` im zuletzt veröffentlichten KV-`public/digest/latest` gleich `snapshot.date` (= `meta.last_trading_day`), werden alle Anthropic-Aufrufe übersprungen und das Skript beendet sich (außer `FORCE_REGENERATE=true`; bei KV-Lesefehler „fail-open“, also normaler Lauf).
* [belegt, aus Code und 17.2] Der Digest vom 14.10. trägt `date` 13.10., stammt aus dem frühen Lauf `_01` mit überwiegend veralteten US-Zeilen. Ein späterer Lauf mit demselben `last_trading_day` (13.10.) würde ihn **nicht** neu erzeugen. Der Digest bliebe bis zum nächsten Handelstag auf diesem Stand, sofern niemand `FORCE_REGENERATE` setzt.
* [Hypothese, eng] Die Dispatch-Läufe #352 und #353 (7 m 55 s / 7 m 56 s, Wochenende und Montag, gleicher `last_trading_day` 09.10.) und der geplante Lauf #349 (8 m 13 s) wurden durch diesen Skip verkürzt. Bei #349 passt, dass der Snapshot `07.10_17` (Tageslauf, `last_trading_day` 07.10.) denselben Handelstag trug wie `08.10_01`; dann stammte der Digest zum 07.10. aus dem Tageslauf vom 07.10. um 17:25Z, also aus Daten mitten im Handelstag. Nicht belegt: Weder der Digest zum 07.10. noch die Läufe #343 bis #345 und #348 wurden eingesehen. [offen]
* Hinweis: Die Skip-Regel ist als Kostenschutz dokumentiert (Dateikopf v1.1, 10.09.2026). Dass sie bei zu frühem Lauf einen veralteten Digest festhält, ist eine Folge der Kombination, keine Absicht im Code.

### 19.5 Entscheidungsstatus
* Keine Änderung an Aggregator, Workflows, Worker, Digest-Skript, KV, Archiv oder `SUITE.md` vorgenommen oder freigegeben. Freeze und C1-Sperre unverändert; keine Empfehlung zu Startzeit, Skip-Regel, `FORCE_REGENERATE`, Watchdog oder A-2/C.
* Offen für Axel: wie mit den Befunden 17 bis 19 umgegangen wird (nur zur Kenntnis, weitere Messung, gemeinsame Entscheidung mit A-2/C). Lesende Vorarbeiten auf Axels Go: Abhängigkeitsliste zur Laufzeit 22:00Z; `fetch_one` und `_lastRowIncomplete` bei offenen Märkten; Git-Historie zu `GOLD`; Einsicht in die Läufe #343 bis #345 und #348 und in den Digest zum 07.10. (nur falls ein Archiv des Digests existiert).
