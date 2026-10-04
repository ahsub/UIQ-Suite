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

# UIQ — Übergabeprotokoll 04.10.2026 → 06.10.2026

**Datum:** 04.10.2026 (Sonntag), Sessionende ca. 17:00 MESZ (Fortsetzung der Sitzung vom 02./03.10.)
**Status:** Nur Dokumentation und Diagnose, **keine Produktionsänderung** außer den beiden von Axel committeten Korrekturen (Test-Seed `ac356e9`, TR-Backup-Abhängigkeit `9603858`). Befundregister um EIC7–EIC9, D20 (abgeschlossen), D24, D25 und **D26 (P0, offen)** erweitert. Kontrolllauf #344 grün.
**Zweck:** Fortsetzung nach dem Aggregator-Lauf Mo 05.10.2026 (22:00 UTC; läuft in der Nacht auf Di 06.10.) ohne Rückgriff auf den Arbeitsbereich dieser Session — alles Relevante liegt auf GitHub `main` oder in diesem Dokument.

> Quellenhinweis: Ich (Claude) habe in dieser Session nichts gepusht und habe keinen Schreibzugriff auf `UIQ-Suite`; alle Commits stammen von Axel und wurden von mir gegen die gelieferten Dateien (SHA-256) geprüft. GitHub-Actions-Logs sind von hier nicht abrufbar (403); Aussagen zu Läufen stützen sich auf die Jobs-/Steps-API, auf Archiv-Snapshots und auf von Axel eingefügte Log- und Terminalausgaben. Der Worker-Abruf (D20) und die Yahoo-Abfrage (D26) stammen von Axel.

## 1. Stand der Repos

| Repo | `main` | Inhalt dieser Session |
|---|---|---|
| `ahsub/UIQ-Suite` | **`f304cad`** | Befundregister-Nachträge 04.10. (`b156ffa`, `09b6c3f`, `955f057`, `ac8fd88`, `84c1ba0`, `f304cad`); es gibt nur **eine** Registerdatei `docs/BEFUNDREGISTER-2026-09-28.md` (SHA-256 `ed1f171df618176ee5870b4de83c8bd23fc2596ec68180efe8f373441b8e787a`) |
| `ahsub/ko-aggregator` | **`2554322`** (Archiv-Commit Lauf #344) | `9603858` (Workflow `tr-backup-saturday.yml`: Schritt `pip install requests`), `ac356e9` (`np.random.seed(2026)` im Fixture `market_bull`, `tests/test_dce_layer.py`); Aggregator v5.47.0 sonst unverändert |
| `ahsub/axel-scanner` | **`d3391e6`** | unverändert gegenüber Vorsession (Frontend v516) |
| `ahsub/ko-modules` | **`e82508a`** | nur gelesen (Prompt-Quellenprüfung EIC8) |
| `ahsub/uiq-archive` (privat) | **`352a55a`** (Snapshot `2026-10-04_13`) | nur gelesen; in dieser Session lesend angebunden (muss in einer neuen Session erneut angehängt werden) |

## 2. Ergebnisse dieser Session (Details und Belegstufen im Register)

1. **Lauf #343 (04.10., 04:15 UTC)** — `workflow_dispatch` durch den Watchdog (nicht von Axel). Fehlschlag in „Unit Tests (DCE + Regime)“: `test_green_mode` (`'YELLOW' == 'GREEN'`), Ursache **D24** (Fixture ohne Seed, ca. 0,28 % je Lauf). Fix `ac356e9`.
2. **Lauf #344 (13:45:52 UTC, `workflow_dispatch`)** — alle Schritte `success`, ca. 8 min, Stand `740a285` (enthält `ac356e9`). Ein grüner Lauf beweist die Wirkung des Seeds nicht.
3. **D25** — Watchdog-Dispatches: deployte Trigger 13:45 UTC (So–Do) und 04:15 UTC (So–Fr); das Repo-`wrangler.toml` (`45 22 * * 1-5`) ist nicht deployt; der Worker-Code im Repo stimmt mit dem eingefügten deployten Code überein. Genauer Codepfad nicht bewiesen, Zeitstempel konsistent.
4. **D20 abgeschlossen** — `daily_market_snapshot_us` wird nur bei Startstunde ≥ 12 UTC geschrieben; Worker-Abruf: `generated` 2026-10-04T13:48:00Z, passt zum Archiv-Snapshot.
5. **D21** — TR-Backup scheiterte an fehlendem `requests` (reproduziert, Log nicht gesehen); Fix `9603858`, **Wirkung unverifiziert bis zum ersten Samstagslauf (10.10.)**.
6. **EIC7–EIC9** (Breakout-EIC-Lauf, nur Diagnose): Abbruch des bereitgestellten Texts mitten im Wort (Ursache unverifiziert, Token-Grenze/`stop_reason` ungeprüft) · Schwellen und Prompt-Anweisungen im Text; Prompt-Fundstellen in `ko-modules/ko-prompts.js` belegt (300–400 %: L6060 Heuristik mit Buchquellen-Angabe; „85er“: L6048/L6060; `vcpBreakoutVol ≥ 2.0`: L6072; „Grundprinzip Punkt 1“ **nicht gefunden**) · Setup-Reife vs. Ausbruchsfrische (kein Feld „Tage seit Ausbruch“ in den Ticker-Keys). Beobachtungen zum EIC-Ausgabetext sind **nicht gegen den Rohtext geprüft**.
7. **D26 (P0, offen)** — **Nachtsnapshots (Start 00–01 UTC) führen unter dem `_dataAsOf`-Label des Folgetages den Schlusskurs des Vortages; das Volumen (`volRatio`) gehört näherungsweise zum Label-Tag.** NTAP direkt gegen Yahoo abgeglichen (215,05 = Schluss 01.10.; `volRatio` 1,90 passt näherungsweise zum Freitagsvolumen 02.10.). Archivhinweis: `_bars_raw − bars` ≥ 1 bei ca. 92 % der Ticker in Nachtläufen, bei den späteren Läufen meist 0 %; Preisänderung gegenüber dem späteren Lauf bei 677 von 681 Tickern mit Extra-Zeile. Die EIC-Eingabewerte stammen laut Abgleich aus `2026-10-03_01`. After-Market scheidet nach Codelage aus. **Offen:** technische Ursache (Hypothese: letzte Rohzeile ohne Close, mit Volumen — nicht direkt gesehen), Ausmaß über NTAP hinaus, betroffene Ausgaben (Digest, Empfehlungen, Scores; nicht geprüft), Verhalten von `validate_data_freshness()` im Lauf (nur aus Code abgeleitet). **Keine Codeänderung, kein Fix-Entwurf beschlossen.**
8. **D22 (KLAC)** — Archivreihe in sich konsistent (`high52` 301,71 → 301,3694; Kurs 217,56 → 168,02 → 206,89), Marktabgleich nicht erfolgt.
9. **S6** — Statuszeile überholt: Commit `c60fc39` entfernte die 175 Snapshot-Dateien aus dem öffentlichen Repo (Tree: 0 Dateien); Git-Historie bleibt offen (№73).

## 3. Nächste Schritte (nur lesend, bis Axel anders entscheidet; je eine Produktionsänderung pro Nacht, Pflicht-Header Punkt 8)

1. **Lauf Mo 05.10.2026 22:00 UTC** (real Start ca. 00:00–01:30 UTC am 06.10.). Es steht **keine** Produktionsänderung dafür an. Axels Check wie gewohnt: Lauf grün, `earnings_state` im Digest, `dce_public` vorhanden, kein `"dce":`, `/owner/dce` mit Static-Token → 403. Ich prüfe zusätzlich per Jobs-API, dass „Unit Tests (DCE + Regime)“ grün ist.
2. **D26-Test am Dienstagmorgen (nur lesend, Archiv):** (a) `_bars_raw − bars` im Nachtlauf-Snapshot — reproduzierbar (ca. 92 %)? (b) Falls ein späterer Lauf desselben Labels vorliegt (z. B. Watchdog-Dispatch 13:45 UTC): Preisvergleich Nachtlauf gegen späteren Lauf. Gibt es ihn noch nicht, bleibt (b) offen — keine Schlüsse darüber hinaus. (c) Optional: ein paar weitere Ticker gegen Yahoo-Tagesdaten (Axel liefert). Danach Ursache beweisen (Rohdaten der letzten Zeile in einer Werktagsnacht 00:10–01:30 UTC), erst dann über einen Fix sprechen.
3. **Danach, einzeln und jeweils nach Entscheidung Axel:** `ko-cron-trigger` prüfen (Quelle nicht im Repo; Zusammenhang mit unerklärten Dispatches #334/#302/#304) · Entscheidung zur Mo–Fr-Konfiguration des Watchdog-Triggers (eigene Produktionsänderung) · `uiq-devtools`-Regressionsfixtures je Strategie als read-only Ist-Zustandsbeleg · weitere offene Fragen aus Runmap und Register einzeln.
4. **D21:** Ergebnis des TR-Backups am **Sa 10.10.** prüfen (erster Lauf nach dem Fix).

## 4. Offene Entscheidungen / offene Punkte

- D26: Ursache, Ausmaß, betroffene Ausgaben (siehe Abschnitt 2, Nr. 7); Folgefrage Rückwirkung auf EIC7–EIC9 (nur Beobachtung, nicht bewertet).
- EIC7: Token-Grenze/`stop_reason` ungeprüft; EIC8: ob die „KORRIGIERT“-Passagen im Public-Ausgabetext erscheinen, ungeprüft; Provenienz „3–4×“ gegen die Bücher nicht geprüft; EIC9: Maß für Ausbruchsfrische erst definieren.
- D22: Marktabgleich KLAC; D23: Gleichstände ohne Kennzeichnung; D20-Folgen: keine.
- `Generate Public Recommendations` dauerte in #344 ca. 1 s (vermutlich Handelstag-Überspringen, nicht verifiziert).
- S6/№73: Git-Historie des öffentlichen Repos.
- Ungeklärt: Dispatches #334/#302/#304; Quelle von `ko-cron-trigger`.

## 5. Entscheidungen Axel (04.10.)

Nur Beobachtung und Dokumentation bis zum Kontrolllauf; **keine Prompt-, Score-, Strategie- oder Codeänderung** aus den bisherigen Befunden · EIC7–EIC9 und D26 ausdrücklich nur als Diagnose/Dokumentation, kein Änderungsauftrag · D26 als P0 · Wortlaut-Regeln: Belegstufen getrennt halten (Prompt-Fundstelle belegt / bereitgestellter EIC-Text bzw. Beobachtung als solche gekennzeichnet / nicht geprüfte Daten ausdrücklich offen), keine Aussage „kein Datenfehler“ · pro Registerstand genau **eine** Datei ersetzen (`docs/BEFUNDREGISTER-2026-09-28.md`), keine Nebenfassungen · Fixtures erst nach sauberem Lauf.

## 6. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

- Meine Registeraussage zu D24, der Watchdog würde um 22:45 UTC einen Ersatzlauf auslösen, war falsch (22:45-Trigger nicht deployt; nächster Trigger 04:15) — nach Axels Dashboard-Screenshot korrigiert.
- Meine aus dem Gedächtnis genannte Volumenangabe „etwa 40–50 % über dem Durchschnitt“ ist **ungeprüft** und widerspricht der im Repo zitierten Buchquelle; im Register zurückgenommen.
- Zwei Registerzeilen stellten Beobachtungen zum EIC-Ausgabetext zunächst wie Rohtextbefunde dar (EIC8 „85er“, EIC8-Hauptzeile; außerdem EIC7 und EIC9); nach der Abschlusssuche korrigiert.
- Doppelte Registerdatei (`.v2`) wurde von Axel entfernt/umbenannt (`20b677b`, `955f057`); verifiziert.
- Mein Skriptbeispiel für den Worker-Abruf nutzte Platzhalter in spitzen Klammern, die die Shell wörtlich nahm; der Yahoo-Test war als Python-Code in einer Bash-Shell gedacht. Beides korrigiert (Host `ko-sync.ahildebrand.workers.dev`, Token als Variable, `python3 -c`).
- Erste D26-Hypothese „After-Market“ nach Code- und Archivprüfung verworfen (Tagesdaten, kein Live-Preis; Abweichung zu groß und breit).
- Axels Archiv-Anhang war beim Einfügen beschädigt (gzip als Text) und unbrauchbar; stattdessen lesender Repo-Zugriff.
- Stop-Hook „uncommitted changes“: mein lokaler UIQ-Suite-Klon wurde verworfen und auf `b156ffa` gesetzt; nichts gepusht.

## 7. Verweise

- `docs/BEFUNDREGISTER-2026-09-28.md` (Nachträge 04.10.: Vorbereitung/D24/D25; nachmittags EIC7–EIC9; Teil 2 Archivprüfung; Teil 3 D20 abgeschlossen und D26 P0)
- `docs/UEBERGABE-2026-10-03.md`, `docs/UEBERGABE-HEADER-TEMPLATE.md`
- Commits: UIQ-Suite `b156ffa`, `09b6c3f`, `20b677b`, `955f057`, `ac8fd88`, `84c1ba0`, `f304cad`; ko-aggregator `9603858`, `ac356e9`; `ko-modules` `e82508a` (nur gelesen); `uiq-archive` `352a55a` (nur gelesen)
