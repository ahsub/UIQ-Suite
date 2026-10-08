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

**Datum:** 07.10.2026 (Mittwoch), Sessionende abends (Stand: 20:00 Uhr MESZ); **Nachtrag 08.10.2026 (Donnerstag) 05:40 Uhr MESZ** (Auswertung des Nachtlaufs `2026-10-08_01`, siehe 2.7 und 2.8)
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
3. **Nachtlauf 09.10. abwarten** und `2026-10-09_0x` auswerten: `meta.data_integrity`, Gruppierung nach `homeMarket`, Zuordnung zu den vier Fällen (≈92 % US / Zwischenwert / 0–4 / Nicht-US separat); zusätzlich Abstand `generated` → Archiv-Commit (≈22 min = Public-Teil gelaufen, ≈5 min = Skip).
4. **Danach gemeinsam entscheiden** über A-2 und C; D27 separat. Kein manueller Tageslauf vor Klärung des Public-Digest-Effekts.

## 5. Offene Punkte

* D26: Ursache der zusätzlichen, noch nicht abgeschlossenen Zeile nicht bekannt; Reparaturentscheidung offen; Frontend-Preisanzeige ungeprüft; Breadth-/McClellan-Nachwirkung nicht quantifiziert.
* A-1: Schwelle 50 % kalibriert an 182 Archivläufen; der 07.10. zeigt einen Fall außerhalb dieser Bimodalität.
* Krypto-Ticker in der US-Statistik (13 von 710) verzerren `labelAheadOfTickerData`; kein Handlungsauftrag, nur vermerkt.
* GitHub-Actions-Laufzeit des manuellen Laufs 27:31 min bei `elapsed_s` 116,7 s des Aggregators: sehr wahrscheinlich der Public-Teil (ca. 22 min, siehe 2.8); Logs nicht verfügbar, daher nicht bestätigt.
* Public-Digest im KV: Datum 07.10., Datenstand 06.10. (2.9). Der nächste planmäßige Nachtlauf (09.10.) ersetzt ihn, weil dort ein neuer Handelstag vorliegt; bis dahin bleibt er online. Korrekturentscheidung offen.
* Bis zum 10.10.: **D21** TR-Backup am Sa 10.10. prüfen (Fix `9603858`); übrige Punkte aus dem Protokoll vom 06.10. unverändert (D22, D23, S6/№73, `ko-cron-trigger`, Watchdog).
* Bundesbank/BaFin-Voranfrage: Antwortmail vom 06.10. laut Protokoll noch nicht ausgewertet.
* **SUITE.md-Integration der „Merk- und Anregungspunkte"** (Repo-Evaluierungen vom Abend des 06.10.) ist weiterhin offen; sie folgt, wenn der D26-Strang abgeschlossen ist. Liste der Punkte: ThetaGang (Decision-Provider-Muster für Event & Surprise Gate; Choppiness/Efficiency als Research-Baseline neben Faber-10M-SMA); Alpha Forge (Governance-Muster: Manifest/JSON-Sidecar, Start-Assertions, ein Verify-Gate in `uiq-devtools`, Evidence-Paket vor Release; Behauptungen ungeprüft); Stocksera als Quellenkatalog (nach Dezember); `ib_fundamental` (lokale Zweitquelle für Fair-Value-Validierung; Point-in-Time-Fähigkeit und Lizenz offen); `ibkr-steuer` (Refundex-Referenz); `ibkrclaw` (Zusatznutzer ohne Handelsrechte, Read-Only-API-Test, Auto-Restart + Health-Check); `ib_async` (BSD-2, Pflichtcheck `placeOrder`); IBKR-Connector (funktioniert lesend, nur Order-Instructions; CapTrader-Login offen); MCP-Server-Idee (nach Dezember, evtl. obsolet). Negativbefunde als Einzeiler: ibkr-docker, IBeam, option-data-service, ibkr-historical-data-downloader, stock-trend-analysis-bot, mcf-long-short-Straddle-Repo, IBKR-AIHedge, ibkr-mcp-server (als Basis), claude-ibkr-trading-panels. Alles frühestens nach Dezember bzw. Go/No-Go (Drift-Warnung).

## 6. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

* Ich (Claude) hatte zunächst geschrieben, der Aggregator-Lauf enthalte keine Anthropic-Calls; das war falsch: `market_aggregator.py` ruft die Anthropic-API selbst auf (u. a. Morning Briefing / KI-Enrichment), unabhängig von `force_regenerate`. Auf die Auswertung hatte das keinen Einfluss.
* Die Aussage, mit `force_regenerate=false` werde der Public-Teil beim manuellen Tageslauf übersprungen, war zu eng (siehe 2.8): das Label kann am Nachmittag schon auf den heutigen Tag springen, dann greift der Skip nicht. Wirkung noch nicht verifiziert.
* Die Eingabe „KI-Enhancement" gibt es im Workflow auf `655d649` nicht; gemeint war `force_regenerate` (Standard `false`, erzwingt `generate_public_recommendations.js`).
* Die „13 D27-Kandidaten" hatte ich zunächst als Aktien-Kandidaten beschrieben; es sind Krypto-Ticker.
* Der lokale `uiq-archive`-Klon hatte kurzzeitig eine gestagte Kopie des Tages-Snapshots (für den Stop-Hook als „uncommitted" sichtbar); entfernt, nichts committet oder gepusht.
* Zeitangabe korrigiert: im Oktober gilt MESZ (UTC+2), 15:30 Uhr = 13:30 UTC.

## 7. Verweise

* `docs/UEBERGABE-2026-10-06.md` (Vorgänger), `docs/BEFUNDREGISTER-2026-09-28.md` (Teil 4), `docs/UEBERGABE-HEADER-TEMPLATE.md`
* `ko-aggregator` `655d649`: `market_aggregator.py` (`calc_data_integrity`, ab ca. Zeile 1767), `.github/workflows/market-aggregator.yml` (Eingaben `force_backup`, `force_regenerate`; Cron `00 22 * * 1-5`), `tests/test_data_integrity.py`
* `uiq-archive`: Snapshots `2026-10-07_01`, `2026-10-07_17`, Reihe ab `2026-09-13`
