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

**Datum:** 06.10.2026 (Dienstag), Sessionende nachmittags (Fortsetzung der Sitzung vom 04.10.)
**Status:** Nur Dokumentation und Diagnose (lesend), **keine Produktionsänderung**, keine Änderung an `regime-test`. Befundregister um **D26 Teil 4** (Ursache belegt, Ausmaß, öffentliche Wirkung) und den **D27-Kandidaten** erweitert. D26 bleibt **P0, offen** (keine Reparatur beschlossen).
**Zweck:** Fortsetzung ohne Rückgriff auf den Arbeitsbereich dieser Session — alles Relevante liegt auf GitHub `main` oder in diesem Dokument.

> Quellenhinweis: Ich (Claude) habe in dieser Session nichts gepusht und habe keinen Schreibzugriff auf `UIQ-Suite`; Commits macht Axel. GitHub-Actions-Logs sind von hier nicht abrufbar (403); Aussagen zu Läufen stützen sich auf die Jobs-/Steps-API (Laufzeiten) und auf Archiv-Snapshots. Yahoo und Cloudflare-KV sind von hier nicht erreichbar: das Diagnoseskript (Yahoo-Rohzeilen) und die KV-Abrufe (`wrangler kv key get … --remote`) hat Axel lokal ausgeführt; ich habe nur die Ausgaben gelesen.

## 1. Stand der Repos

| Repo | Stand | Anmerkung |
|---|---|---|
| `ahsub/UIQ-Suite` | `main` `2234462` („Delete docs/H18_vol_skalierung_ENTWURF.md“) | In dieser Session gelesen; Registerdatei `docs/BEFUNDREGISTER-2026-09-28.md` wird durch die Fassung dieses Protokolls ersetzt (nur **eine** Registerdatei) |
| `ahsub/ko-aggregator` | `561a6f0` (lokal gelesen) | `market_aggregator.py` v5.47.0 unverändert; yfinance im Workflow auf 1.5.2 gepinnt |
| `ahsub/uiq-archive` (privat) | gelesen (u. a. Snapshots `2026-10-03_01`, `2026-10-04_13`, `2026-10-05_04_2`, `2026-10-06_02`) | nur lesend; muss in einer neuen Session erneut angehängt werden |
| `ahsub/regime-test` | `main` `4abb177` | **unverändert** (Zugriff mit Schreibrechten war erteilt, nichts geschrieben) |

## 2. Ergebnisse dieser Session (Details und Belegstufen im Register, Teil 4)

1. **H18-Entwurf (nur Vermerk).** `docs/preregistration/H18_vol_skalierung_ENTWURF.md` liegt bereits auf `regime-test` `main` (Commit `f4c6bb8`), nicht auf einem Entwurfsbranch. Axel entschied (Variante 1): **nichts ändern**, nur dokumentieren. Zeile 4 der Datei („Nummer vorläufig … Vor dem Commit erneut gegen alle Branches prüfen“) ist durch den Stand auf `main` überholt (die Datei liegt bereits dort, `f4c6bb8`); sie wird **bewusst nicht** stillschweigend korrigiert, und die Historie wird nicht „aufgeräumt“. H18 ist weiterhin Entwurf (nicht präregistriert). Kein Branch `h18-vol-skalierung-entwurf`, kein neuer H18-Commit. Falls später ein Hinweis in Befundregister oder `SUITE.md` gewünscht wird: nur ein kurzer Verweis auf den Entwurf in `regime-test`, kein Inhalt.
2. **D26 — Ursache am Rohdatum belegt.** Letzte yfinance-Tageszeile mit Datum und `Volume`, aber `Open/High/Low/Close = NaN` (BMW.DE 04:54–06:35 UTC am 06.10.; HUBB 02:08 UTC). `Close.dropna()` entfernt sie, `Volume.fillna(0)` behält sie → Vortagespreis unter Folgetag-Label, Volumen des Label-Tages. Pro Ticker erkennbar an `_bars_raw − bars ≥ 1`.
3. **D26 — Erkennung.** SPY trägt die Extra-Zeile in allen 13 Nacht-Snapshots (15.09.–03.10.) → `meta.last_trading_day` = Label → `validate_data_freshness()` kann D26 nicht melden.
4. **D26 — Ausmaß.** Vier Nacht/Tag-Paare: Grade geändert bei 202–238 von ca. 645 Titeln, Score ≥ 10 bei 231–254, `top40` gemeinsam 14–27 von 40; Werte sind Obergrenzen (kleine Kontrollgruppe). Track-Record: 12 von 50 Tagen aus D26-Nächten; Rendite selbst nicht verzerrt (Bewertung aus frischer Historie, kein Look-ahead), aber Selektion/Scores/`p0` inkonsistent. Breadth-Archiv: Nacht- und Tageswerte gemischt, McClellan trägt es weiter.
5. **D26 — öffentliche Wirkung am Label 2026-10-02 empirisch geprüft** (KV-Archivkeys, write-once): Ledger-Signale, KI-Text und Digest tragen die Nachtwerte (Digest „Abstand EMA200“ 18 von 18 = Nachtwert, 0 von 18 = Tageswert; NTAP `volRatio` 1,90 gegen 2,02 im Tageslauf). Der archivierte Digest hat **kein `price`-Feld**; `data_quality` steht trotz D26 auf `ok`. Die frühere Formulierung „durch Codelage wahrscheinlich“ gilt für dieses Label nicht mehr; für andere Labels bleibt sie bestehen.
6. **D27 (nur Kandidat, nicht untersucht):** `meta.last_trading_day` einen Tag vor/nach den Ticker-Daten auch ohne Extra-Zeile (11 Snapshots seit 13.09., 5 mit Track-Record-Tag); Hypothese `period="5d"` (SPY) gegen `end=heute` (Ticker), ungeprüft.

## 3. Nächste Schritte (nur lesend, bis Axel anders entscheidet; je eine Produktionsänderung pro Nacht, Pflicht-Header Punkt 8)

1. **D26 abschließen (Diagnose):** (a) Frontend-Preisanzeige: aus welcher Quelle stammt der angezeigte Kurs (Snapshot, Digest, Live)? (b) Optional: ein weiteres D26-Label im KV prüfen (z. B. 2026-09-30 oder 2026-10-01), wenn für den Befund nötig. (c) Erst danach über eine Reparatur sprechen; Richtungen sind im Register nur erfasst, nicht bewertet.
2. **D27** nur auf Axels Entscheidung hin untersuchen.
3. **D21:** Ergebnis des TR-Backups am **Sa 10.10.** prüfen (erster Lauf nach dem Fix `9603858`).
4. Übrige Punkte aus dem Protokoll vom 04.10. unverändert: D22 (KLAC-Marktabgleich), D23 (Gleichstände), S6/№73 (Git-Historie des öffentlichen Repos), `ko-cron-trigger`, Watchdog-Konfiguration (je eigene Produktionsänderung).

## 4. Offene Entscheidungen / offene Punkte

- D26: Reparaturentscheidung offen (nicht beschlossen); Zeitpunkt des Verschwindens der Extra-Zeile in der US-Nacht nicht gemessen (Messung bewusst nicht durchgeführt); Frontend-Preisanzeige ungeprüft; Breadth-/McClellan-Nachwirkung nicht quantifiziert; weitere Labels nur über Actions-Laufzeiten, nicht im KV geprüft.
- D27: Kandidat, ungeklärt.
- Rückwirkung auf EIC7–EIC9: Eingabewerte stammen aus dem Nachtlauf `2026-10-03_01`; keine weitere Bewertung.

## 5. Entscheidungen Axel (06.10.)

H18: Variante 1 — nichts am Repository ändern, nur dokumentieren; Zeile 4 nicht stillschweigend korrigieren · D26 nur lesend untersuchen: **kein Pipeline-Eingriff, kein Fallback, keine Laufzeitverschiebung, keine Repo-Änderung, keine Backtests auf den betroffenen Archiv-Snapshots, keine weitere Nachtmessung** · Nacht/Tag-Paare sind eine Datenintegritätsprüfung, kein Performancevergleich · Wortlaut zur öffentlichen Wirkung strikt nach Belegstufe (Signal-Ebene am Label 02.10. bestätigt; Preisanzeige ungeprüft) · D27 getrennt als Kandidat · pro Registerstand genau eine Registerdatei ersetzen.

## 6. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

- Meine Annahme, SPY sei im Lauf `2026-10-06_02` sauber, weshalb die Frische-Prüfung aus anderem Grund passiere, war falsch: SPY trägt die Extra-Zeile in allen 13 Nacht-Snapshots.
- Meine frühere Zeithypothese (Yahoo-Daten „00:00–01:30 UTC“ betroffen) war zu eng: nicht rein zeitbestimmt, europäische Ticker teils bis in den Nachmittag.
- Eine Tabellenzeile in einer Zwischenauswertung (0835-Ausgabe) hatte durch meinen Awk-Filter falsch beschriftete Ticker (Werte korrekt); gemeldet.
- Das Diagnoseskript scheiterte lokal mit `SyntaxError`, weil `~/Downloads/base64.py` (eine falsch benannte RTF-Datei) die Standardbibliothek überdeckt; Lösung `python -I` aus dem venv.
- Der erste KV-Abruf des Digests lieferte 401 (nur Fehlermeldung in der Datei); Wiederholung erfolgreich.
- Zwei kleine Skriptfehler in meinen Auswertungen (Typfehler bei fehlendem Label, `KeyError` `dce_public` in älteren Snapshots) sofort behoben; keine Auswirkung auf Befunde.

## 7. Verweise

- `docs/BEFUNDREGISTER-2026-09-28.md` (neuer Nachtrag „06.10.2026 (Teil 4)“)
- `docs/UEBERGABE-2026-10-04.md`, `docs/UEBERGABE-HEADER-TEMPLATE.md`
- `regime-test`: `docs/preregistration/H18_vol_skalierung_ENTWURF.md` (Commit `f4c6bb8`, unverändert)
- Code (nur gelesen): `ko-aggregator` `market_aggregator.py` (`get_last_trading_day()` ~L1683, `validate_data_freshness()` ~L1700, `process_ticker()` ~L6746, `fetch_batch()` ~L7135, `calc_breadth_oscillator()` ~L10255), `tr_layer.py`; `UIQ-Suite` `scripts/generate_public_recommendations.js` v1.30
