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

# UIQ — Übergabeprotokoll 06.10.2026 → 07.10.2026

**Datum:** 06.10.2026 (Dienstag), Sessionende abends (Fortsetzung der Sitzung vom 04.10.; Stand dieses Protokolls: 17:10 Uhr MESZ)
**Status:** D26 diagnostiziert und dokumentiert (Register Teil 4, `0040ddc`). **Eine Produktionsänderung ist gepusht, aber noch nicht gelaufen:** `ko-aggregator` **v5.48.0** (A-1, rein diagnostisch) als Commit `655d649` auf `main`. Erster Lauf mit v5.48.0 ist der Nachtlauf 22:00 UTC (00:00 MESZ). **Freeze bis zur Auswertung dieses Laufs.** Keine Änderung an `regime-test`. D26 bleibt **P0, offen** (A-1 erkennt, repariert nicht).
**Zweck:** Fortsetzung ohne Rückgriff auf den Arbeitsbereich dieser Session — alles Relevante liegt auf GitHub `main` oder in diesem Dokument.

> Quellenhinweis: Ich (Claude) habe in dieser Session nichts committet oder gepusht und habe keinen Schreibzugriff auf `UIQ-Suite`/`ko-aggregator`; Commits und Pushes macht Axel (auch `0040ddc` und `655d649`). GitHub-Actions-Logs sind von hier nicht abrufbar (403); Aussagen zu Läufen stützen sich auf die Jobs-/Steps-API (Laufzeiten) und auf Archiv-Snapshots. Yahoo und Cloudflare-KV sind von hier nicht erreichbar: das Diagnoseskript (Yahoo-Rohzeilen) und die KV-Abrufe (`wrangler kv key get … --remote`) hat Axel lokal ausgeführt; ich habe nur die Ausgaben gelesen.

## 1. Stand der Repos

| Repo | Stand | Anmerkung |
|---|---|---|
| `ahsub/UIQ-Suite` | `main` `0040ddc` (Register Teil 4 + Protokoll 06.10.) | Registerdatei `docs/BEFUNDREGISTER-2026-09-28.md` (nur **eine** Registerdatei); dieses Protokoll ersetzt die Fassung von `0040ddc` (gleiches Datum, eine Datei pro Sessiondatum) |
| `ahsub/ko-aggregator` | `main` `655d649` (Axel gepusht, 17:07 Uhr; Vorgänger `c4d160f`) | **v5.48.0** (A-1): `market_aggregator.py`, Workflow-Zeile, `tests/test_data_integrity.py`, zwei Fixtures. Basis der Änderung war `561a6f0` (für diese Dateien identisch mit `c4d160f`) |
| `ahsub/uiq-archive` (privat) | gelesen (u. a. Snapshots `2026-10-03_01`, `2026-10-04_13`, `2026-10-05_04_2`, `2026-10-06_02`) | nur lesend; muss in einer neuen Session erneut angehängt werden |
| `ahsub/regime-test` | `main` `4abb177` | **unverändert** (Zugriff mit Schreibrechten war erteilt, nichts geschrieben) |

## 2. Ergebnisse dieser Session (Details und Belegstufen im Register, Teil 4)

1. **H18-Entwurf (nur Vermerk).** `docs/preregistration/H18_vol_skalierung_ENTWURF.md` liegt bereits auf `regime-test` `main` (Commit `f4c6bb8`), nicht auf einem Entwurfsbranch. Axel entschied (Variante 1): **nichts ändern**, nur dokumentieren. Zeile 4 der Datei („Nummer vorläufig … Vor dem Commit erneut gegen alle Branches prüfen“) ist durch den Stand auf `main` überholt (die Datei liegt bereits dort, `f4c6bb8`); sie wird **bewusst nicht** stillschweigend korrigiert, und die Historie wird nicht „aufgeräumt“. H18 ist weiterhin Entwurf (nicht präregistriert). Kein Branch `h18-vol-skalierung-entwurf`, kein neuer H18-Commit. Falls später ein Hinweis in Befundregister oder `SUITE.md` gewünscht wird: nur ein kurzer Verweis auf den Entwurf in `regime-test`, kein Inhalt.
2. **D26 — Ursache am Rohdatum belegt.** Letzte yfinance-Tageszeile mit Datum und `Volume`, aber `Open/High/Low/Close = NaN` (BMW.DE 04:54–06:35 UTC am 06.10.; HUBB 02:08 UTC). `Close.dropna()` entfernt sie, `Volume.fillna(0)` behält sie → Vortagespreis unter Folgetag-Label, Volumen des Label-Tages. Pro Ticker erkennbar an `_bars_raw − bars ≥ 1`.
3. **D26 — Erkennung.** SPY trägt die Extra-Zeile in allen 13 Nacht-Snapshots (15.09.–03.10.) → `meta.last_trading_day` = Label → `validate_data_freshness()` kann D26 nicht melden.
4. **D26 — Ausmaß.** Vier Nacht/Tag-Paare: Grade geändert bei 202–238 von ca. 645 Titeln, Score ≥ 10 bei 231–254, `top40` gemeinsam 14–27 von 40; Werte sind Obergrenzen (kleine Kontrollgruppe). Track-Record: 12 von 50 Tagen aus D26-Nächten; Rendite selbst nicht verzerrt (Bewertung aus frischer Historie, kein Look-ahead), aber Selektion/Scores/`p0` inkonsistent. Breadth-Archiv: Nacht- und Tageswerte gemischt, McClellan trägt es weiter.
5. **D26 — öffentliche Wirkung am Label 2026-10-02 empirisch geprüft** (KV-Archivkeys, write-once): Ledger-Signale, KI-Text und Digest tragen die Nachtwerte (Digest „Abstand EMA200“ 18 von 18 = Nachtwert, 0 von 18 = Tageswert; NTAP `volRatio` 1,90 gegen 2,02 im Tageslauf). Der archivierte Digest hat **kein `price`-Feld**; `data_quality` steht trotz D26 auf `ok`. Die frühere Formulierung „durch Codelage wahrscheinlich“ gilt für dieses Label nicht mehr; für andere Labels bleibt sie bestehen.
6. **D27 (nur Kandidat, nicht untersucht):** `meta.last_trading_day` einen Tag vor/nach den Ticker-Daten auch ohne Extra-Zeile (11 Snapshots seit 13.09., 5 mit Track-Record-Tag); Hypothese `period="5d"` (SPY) gegen `end=heute` (Ticker), ungeprüft.

7. **A-1 (v5.48.0) — D26-Datenintegritäts-Diagnose, geliefert und gepusht.** Entscheidung Axel: **A ja (diagnostisch), B nein (verworfen), C später als eigener Produktionsschritt** (erst nach einer Nacht Beobachtung von A, getrennter Diagnose von D27 und Klärung des Zusammenspiels mit `get_last_trading_day()`; flagged Läufe nie einfach blockieren). Inhalt: je Ticker `_lastRowIncomplete` (letzte Zeile: `Close` = NaN) und `_lastCloseDate` (Datum des letzten gültigen Closes), nur im Ticker-Dict (erreichen **keine** Prompts); `meta.data_integrity` (Schema `data_integrity/1`: `lastRowIncomplete` für US/Nicht-US/SPY, `labelAheadOfTickerData` US, `flags`); Flags `LAST_ROW_INCOMPLETE` (SPY gesetzt **oder** US-Anteil ≥ 50 %) und `LABEL_AHEAD_OF_TICKER_DATA` (US-Anteil `_dataAsOf != last_trading_day` ≥ 50 %, **nur Beobachtungsflag**); Log `[D26-DIAG]`, `warning` bei Flags; Fehler in der Diagnose → Fallback-Dict, Lauf geht normal weiter. **Verhalten sonst unverändert:** kein Score, kein Datum, kein Ticker, kein Lauf, kein TR-Tag, kein Public-Output, kein `last_trading_day` wird verändert. `data_quality` im Digest → **A-2 (später)**.
8. **A-1 — Prüfung vor dem Commit.** Konsumenten geprüft (keine verbrauchen die neuen Felder; Digest/Prompts unberührt). Invarianz-Fixture aus unverändertem 5.47.0 (9 synthetische Fälle, `tests/fixtures_data_integrity_golden.json`); Archivprüfung gegen 182 Läufe (26 mit D26-Signatur, 91,8–97,5 % US-Anteil; 156 sonst ≤ 7,9 %; `tests/fixtures_data_integrity_runs.json`); 8 neue Tests (T1–T6) plus 8 bestehende Suites in der Sandbox grün, Mutationsproben (u. a. Schwelle 95 %) werden erkannt. Auf Axels Mac (Python 3.13, andere numpy/pandas) anfangs **T3 rot** wegen letzter Gleitkommastelle (`…105` gegen `…106`): Ursache war mein exakter Float-Vergleich gegen eine versionsabhängige Golden-Fixture — im Workflow mit ungepinnten numpy/pandas hätte das irgendwann den Test-Schritt und damit den Aggregator-Lauf blockiert. Korrektur: T3 vergleicht Floats mit relativer Toleranz 1e-9 (Nicht-Floats, Struktur exakt). Danach 8/8 grün auf dem Mac. SHA-256 (Stand `655d649`): `market_aggregator.py` `3c31d1f4…b257`, `test_data_integrity.py` `0fa6c123…a2e3`, Workflow `6acb5943…84cb`. Commit-Trailer: `Co-Authored-By: Claude Sonnet 5.5`, `Claude-Session`. Lokale Umgebung: Venv `/tmp/ko-venv` (nur für Testläufe).

## 3. Nächste Schritte (Freeze bis zur Auswertung des Nachtlaufs; je eine Produktionsänderung pro Nacht, Pflicht-Header Punkt 8)

**Heute Nacht und morgen (Mi 07.10.):**
1. **Nachtlauf 22:00 UTC (00:00 MESZ) abwarten.** In Actions zuerst die Tests (jetzt mit `test_data_integrity.py`), dann der Aggregator. Rot im Test-Schritt → Aggregator startet nicht → Fehler sofort melden.
2. **Auswertung ab ca. 00:30 MESZ** (Axel meldet „Nachtlauf durch"): `meta.data_integrity` aus dem Archiv-Snapshot/KV lesen. Erwartung: saubere Nacht → `flags == []`, Nicht-US-Anteil um 30 %, US-Anteil ≈ 0 %; D26-Nacht → `LAST_ROW_INCOMPLETE`, US-Anteil ≈ 92 %, SPY `true`. `LABEL_AHEAD_OF_TICKER_DATA` ist **nur Beobachtung**, kein Fehler. Unabhängig davon: `last_trading_day`, TR-, Public- und KV-Verhalten wie gewohnt. Neue Felder müssen vorhanden sein, bisherige Meta-/Ticker-Felder dürfen nicht fehlen. (Die Wert-Invarianz ist durch den Golden-Test gegen 5.47.0 belegt, nicht durch Live-Vergleich.)
3. **Manueller Lauf am Mittwoch tagsüber** (erst nach Schritt 2; ein Lauf zwischen 13 und 18 UTC kann `LABEL_AHEAD_OF_TICKER_DATA` setzen = erste Live-Messung von D27, kein Fehler). Erwartung: `flags []`, US 0 %, neue Felder vorhanden.
4. Danach über **A-2** (Digest `data_quality`), **D27** (getrennte Diagnose) und **C** (Reparatur, eigener Produktionsschritt) entscheiden — nicht vorher.

**Weiter offen (nur auf Axels Entscheidung):**
1. **D21:** Ergebnis des TR-Backups am **Sa 10.10.** prüfen (erster Lauf nach dem Fix `9603858`).
2. Übrige Punkte aus dem Protokoll vom 04.10. unverändert: D22 (KLAC-Marktabgleich), D23 (Gleichstände), S6/№73 (Git-Historie des öffentlichen Repos), `ko-cron-trigger`, Watchdog-Konfiguration (je eigene Produktionsänderung).

## 4. Offene Entscheidungen / offene Punkte

- D26: Reparaturentscheidung offen (nicht beschlossen); Zeitpunkt des Verschwindens der Extra-Zeile in der US-Nacht nicht gemessen (Messung bewusst nicht durchgeführt); Frontend-Preisanzeige ungeprüft; Breadth-/McClellan-Nachwirkung nicht quantifiziert; weitere Labels nur über Actions-Laufzeiten, nicht im KV geprüft.
- D27: Kandidat, ungeklärt (A-1 liefert mit `LABEL_AHEAD_OF_TICKER_DATA` erstmals eine Live-Messung; Auswertung erst nach dem Nachtlauf).
- A-1: Schwellen (50 % US-Anteil) sind aus 182 Archivläufen kalibriert; erste Live-Bestätigung steht aus. `data_quality` im Digest (A-2) und Variante C (Reparatur) offen; Variante B1 verworfen (für D26 blind: 0 von 13).
- Offene Randpunkte A-1: lokale Testumgebung nur über Venv `/tmp/ko-venv` (kein System-pytest); der Mac testet mit Python 3.13, der Workflow installiert numpy/pandas ungepinnt (nur `yfinance==1.5.2` gepinnt).
- Bundesbank/BaFin-Voranfrage: Antwortmail von Herrn Röder (Bundesbank) am 06.10. eingegangen, Inhalt zum Zeitpunkt dieses Protokolls noch nicht ausgewertet (siehe Memory „bafin-voranfrage"; nichts weiter vermerkt).
- Rückwirkung auf EIC7–EIC9: Eingabewerte stammen aus dem Nachtlauf `2026-10-03_01`; keine weitere Bewertung.

## 5. Entscheidungen Axel (06.10.)

H18: Variante 1 — nichts am Repository ändern, nur dokumentieren; Zeile 4 nicht stillschweigend korrigieren · D26 nur lesend untersuchen: **kein Pipeline-Eingriff, kein Fallback, keine Laufzeitverschiebung, keine Repo-Änderung, keine Backtests auf den betroffenen Archiv-Snapshots, keine weitere Nachtmessung** · Nacht/Tag-Paare sind eine Datenintegritätsprüfung, kein Performancevergleich · Wortlaut zur öffentlichen Wirkung strikt nach Belegstufe (Signal-Ebene am Label 02.10. bestätigt; Preisanzeige ungeprüft) · D27 getrennt als Kandidat · **A-1 (06.10., Go mit fünf Entscheidungen):** `data_quality` im Digest → A-2 später; `_lastCloseDate` ja; Version v5.48.0; Commit tagsüber, keine weitere Produktionsänderung, Beobachtung im folgenden Nachtlauf, manueller Lauf am Folgetag; Sichtbarkeit über `master_market_data` ohne Zusatzfilter akzeptiert; A-1 nur diagnostisch (kein Score, Datum, Ticker, Lauf, TR-Tag, Public-Output, `last_trading_day`), `LABEL_AHEAD_OF_TICKER_DATA` nur Beobachtungsflag; Commit erst nach gemeinsamer Prüfung des gelieferten Stands, nur durch Axel · **Variante A ja, B nein, C später** (nach einer Nacht Beobachtung, getrennter D27-Diagnose und Klärung von `get_last_trading_day()`; flagged Läufe nie einfach blockieren) · pro Registerstand genau eine Registerdatei ersetzen.

## 6. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

- Meine Annahme, SPY sei im Lauf `2026-10-06_02` sauber, weshalb die Frische-Prüfung aus anderem Grund passiere, war falsch: SPY trägt die Extra-Zeile in allen 13 Nacht-Snapshots.
- Meine frühere Zeithypothese (Yahoo-Daten „00:00–01:30 UTC“ betroffen) war zu eng: nicht rein zeitbestimmt, europäische Ticker teils bis in den Nachmittag.
- Eine Tabellenzeile in einer Zwischenauswertung (0835-Ausgabe) hatte durch meinen Awk-Filter falsch beschriftete Ticker (Werte korrekt); gemeldet.
- Das Diagnoseskript scheiterte lokal mit `SyntaxError`, weil `~/Downloads/base64.py` (eine falsch benannte RTF-Datei) die Standardbibliothek überdeckt; Lösung `python -I` aus dem venv.
- Der erste KV-Abruf des Digests lieferte 401 (nur Fehlermeldung in der Datei); Wiederholung erfolgreich.
- A-1: Mein T3-Test verglich Gleitkommawerte exakt gegen eine auf meiner Sandbox erzeugte Golden-Fixture; auf Axels Mac lief er wegen anderer numpy/pandas-Versionen rot (letzte Stelle). Korrigiert (Toleranz 1e-9), erneut grün auf Mac und Sandbox, vor Commit gefunden; im Workflow hätte er den Aggregator-Lauf blockieren können.
- A-1: Beim ersten Einspielen kopierte Axel versehentlich noch die alte `test_data_integrity.py` aus Downloads (die korrigierte Datei war nicht sichtbar); durch Prüfsumme sofort erkannt, danach korrekt.
- A-1: Mein Zwischenstand nannte „387 Einfügungen"; nach der T3-Korrektur sind es 407 (5 Dateien, 1 Löschung).
- Ein vorgeschlagener Commit-Trailer „OpenAI" war falsch; ersetzt durch den Trailer dieser Sitzung (Claude Sonnet 5.5 + Session-Link).
- Zwei kleine Skriptfehler in meinen Auswertungen (Typfehler bei fehlendem Label, `KeyError` `dce_public` in älteren Snapshots) sofort behoben; keine Auswirkung auf Befunde.

## 7. Verweise

- `docs/BEFUNDREGISTER-2026-09-28.md` (neuer Nachtrag „06.10.2026 (Teil 4)“)
- `docs/UEBERGABE-2026-10-04.md`, `docs/UEBERGABE-HEADER-TEMPLATE.md`
- `regime-test`: `docs/preregistration/H18_vol_skalierung_ENTWURF.md` (Commit `f4c6bb8`, unverändert)
- `ko-aggregator` `655d649` (v5.48.0): `market_aggregator.py` (`_last_row_diag`, `calc_data_integrity`, Block nach `validate_data_freshness()` in `main()`), `tests/test_data_integrity.py`, `tests/fixtures_data_integrity_golden.json`, `tests/fixtures_data_integrity_runs.json`, `.github/workflows/market-aggregator.yml` (Testschritt)
- Entwurfsdokumente (nicht committet, in Axels Downloads): `D26-REPARATURENTWURF-2026-10-06.md`, `D26-A-IMPLEMENTIERUNGSAUFTRAG-2026-10-06.md`
- Code (nur gelesen, Stand vor A-1): `ko-aggregator` `market_aggregator.py` (`get_last_trading_day()` ~L1683, `validate_data_freshness()` ~L1700, `process_ticker()` ~L6746, `fetch_batch()` ~L7135, `calc_breadth_oscillator()` ~L10255), `tr_layer.py`; `UIQ-Suite` `scripts/generate_public_recommendations.js` v1.30
