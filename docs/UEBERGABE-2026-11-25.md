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

# UIQ — Übergabeprotokoll 25.11.2026 → 26.11.2026

**Datum:** 25.11.2026 (Mittwoch), Sessionstand ca. 23:45 Uhr MEZ; Session lief vom 24.11. bis 25.11.2026
**Status:** Keine Änderung an Produktionscode, Workflows, Worker, KV, Scores, Registry oder Gates. Freeze unverändert. Alle Auswertungen liefen **rein lesend**. Neu committet wurden ausschließlich Dokumentation, Präregistrierungen, abgeleitete Audit-Daten und Audit-Skripte; jeder Commit wurde gegen einen frischen Klon per SHA-256 geprüft.
**Zweck:** Festhalten von drei Strängen: (1) Track-Record-Audit im Marktstress (Bericht v2, Nachtrag, Backlog №77), (2) Präregistrierung Track-Record-Runde 2 (eingefroren), (3) Quellenregeln Eric Ludwig inkl. Nachtrag zu №64 (Optionsbewertung). Grundlage für die Go/No-Go-Entscheidung im Dezember 2026.

> Quellenhinweis: Repo-Stände aus frischen Klonen vom 25.11.2026, ca. 23:40 Uhr. Externe Reviews: mehrere Runden am 24./25.11.2026, von Axel als Text bzw. Datei übermittelt. Hashes sind vollständige bzw. 16-stellige SHA-256-Präfixe der committeten Dateien.

## 1. Stand der Repos und Dateien

| Repo | Stand `main` | Änderungen dieser Session |
|---|---|---|
| `ahsub/UIQ-Suite` | `d76fd3f` (25.11.) | `df8d2b7` Audit-Bericht v2 und Ludwig-Backlog in `docs/`; `9f3c9a1` Audit-Nachtrag; `7da2b5e` `SUITE.md` v4.45 (№77); `d76fd3f` `SUITE.md` v4.46 (Nachtrag zu №64) |
| `ahsub/regime-test` | `d9c382d` (25.11.) | `30bfcde` Ludwig-Entwürfe (auf `main` wieder gelöscht, liegen auf Branch `ludwig-praereg-entwurf`, Stand `661d883`); `d9c382d` Präregistrierung Runde 2 |
| `ahsub/uiq-devtools` | `1b53ebf` (24.11.) | `trackrecord-audit/`: 8 Skripte und README |
| `ahsub/uiq-archive` (privat) | `c4fe532` (25.11., nächtliche Snapshots) | `b84c812` `audits/trackrecord-2026-11-24/`: Spec, Manifest, 8 abgeleitete Eingangsdateien |
| `ahsub/ko-aggregator` | `284989e` (25.11.), nur gelesen | seit Audit-Stand `b1728e8` nur Archiv-/Log-Commits, keine Code-Änderung |
| `ahsub/ko-modules` | `e82508a` (28.09.), nur gelesen | unverändert |

| Datei | SHA-256 | Ablage |
|---|---|---|
| `AUDIT-TRACKRECORD-STRESS-2026-11-24.md` (v2) | `f9060d33cbb8cd98…` | `UIQ-Suite/docs/` (abgeschlossene Bestandsaufnahme, nicht mehr ändern) |
| `AUDIT-TRACKRECORD-STRESS-2026-11-24-NACHTRAG-2026-11-25.md` (Fassung 3) | `bad715e5a34becdb…` | `UIQ-Suite/docs/` |
| `PRAEREG-TR-RUNDE2-GATES-2026-11-24.md` (Fassung 8) | `9ce6279a890938ab8ceb7627560c61c4a22a6800fe809810d05ce4d185392b37` | `regime-test/docs/preregistration/`, Commit `d9c382d`, 25.11.2026 23:09:40 MEZ |
| `SUITE.md` v4.46 | `3435dffb19aaacc0…` | `UIQ-Suite/` |
| `SUITE-BACKLOG-QUELLENREGELN-LUDWIG.md` | `a105ec270b43b4d3…` | `UIQ-Suite/docs/`, trägt noch `№XX` |
| `PRAEREG-ENTWURF-ampel-konsens.md` / `-hedging-vix.md` | `27b35b6dc938f6f1…` / `716dcd636fc8351c…` | `regime-test`, Branch `ludwig-praereg-entwurf` |
| Review-Paket Track-Record-Audit | Manifest 19/19 über drei Repos geprüft | `uiq-archive` `b84c812`, `UIQ-Suite` `df8d2b7`, `uiq-devtools` `1b53ebf` |

## 2. Ergebnisse

1. **Track-Record-Audit im Stress (Bericht v2, extern abgenommen 24.11.):**
   - Erkennung: erstes POST_PANIC 16.10. (8 Handelstage nach dem Hoch am 06.10.), erstes STRESS 05.11.; neun Regimewechsel in 25 Handelstagen; einen PANIC-Zustand gibt es nicht, MCM-HMM ist nicht aktiv (`hmm_state` leer in 233/233 Snapshots).
   - Gates: nur beschreibender Selektionsvergleich, keine Wirkungsanalyse; „nur grün“ lag vor und nach dem 26.10. unter „alle“.
   - Benchmarks: in BULL_QUIET (h30) Trendstrategien negativ, Mean Reversion, Fading Short und CSP (Basiswert) positiv gegenüber dem gleichgewichteten Index.
   - Go-Kriterium 5 **nicht erfüllt**. Votum des Reviewers: „Derzeit kein Go“.
2. **Audit-Nachtrag (25.11.):** Zwischenbereich 50–94 % belegt leer; veraltete Tage (Umsetzungsverzug) und nicht prüfbare Tage (Nachweislücke) getrennt; Aggregationsregel von `gate_effect.py` offengelegt. Neu festgehalten: Der Selektionsvergleich rechnet mit richtungsgerechten Rohrenditen (`r7`/`r30`), nicht mit Indexüberschüssen.
3. **Gate-Historie nicht rekonstruierbar:** `daily_market_snapshot`/`_us` werden je Lauf überschrieben, stehen nicht im KV-Backup, und die Archiv-Snapshots enthalten kein `strategyGates`. Daher B1 als dringender P0-Punkt.
4. **Präregistrierung Runde 2 eingefroren (Fassung 8):** dokumentierte Basis-Gate-Auswahl gegen Zufallssperre gleicher Quote; Primärtest nur Long, h7-Überschuss gegenüber RSP; Stichprobe ab Signaltag 09.11.2026 bis zum 60. auswertbaren Tag, spätestens 26.02.2027; Beta aus yfinance-Kursen (60 Renditen, mindestens 40), Mindestabdeckung 80 %; Seed 20261124.
5. **Nachtrag zu №64 (Fassung 4, extern abgenommen):** `score_options_atmna()` ist seit 16.09.2026 implementiert, weicht aber an mehreren Stellen von der Primärquelle ab (Einstieg, Qualität, Volatilitätsmetrik, Gewinnmitnahme 50 % statt 70 %, Earnings-Gate gilt auch für ATM/NA). Identische Options-Ranglisten (B3) sind Absicht im Code (`top20("sCsp")`), kein Datenfehler.
6. **Quellenregeln Eric Ludwig:** Hypothesen H-FIN-1 bis H-FIN-13; zwei Präregistrierungs-Entwürfe (Börsenampel/Konsens, Hedging/VIX). Sammlung als Claude-Doc „Erik/Eric Ludwig – Aktienanalysen (Sammlung)“.

## 3. Entscheidungslage

- **Go/No-Go Dezember 2026:** Ergebnisse von Runde 2 liegen frühestens im Januar (beschreibend) bzw. Februar/März 2027 (primär) vor und können die Dezember-Entscheidung nicht stützen.
- **Freeze:** unverändert. Aus keinem Review folgt eine Produktions-, Score-, Registry- oder Gate-Änderung.
- **Ticker in öffentlichen Repos:** Axel hat am 25.11. entschieden, dass das Benchmark-Kürzel RSP in der Präregistrierung genannt wird. Die Regel „keine Tickernamen“ gilt für Einzeltitel.

## 4. Nächste Schritte

1. **Auswertungsskript Runde 2** schreiben, committen und gegen §5a der Präregistrierung prüfen lassen, **bevor** irgendein Ergebnis von Signalen ab 09.11.2026 angesehen wird (Präregistrierung §5a Nr. 11). Erste beschreibende Auswertung frühestens ca. 06.01.2027.
2. **B1 und B2 spezifizieren** (gemeinsam, getrennte Felder). Umsetzung erst nach Freigabe außerhalb des Freezes; jeder Tag ohne Gate-Protokoll geht verloren.
3. **B4:** Kennzeichnung „Basiswert-Referenz, keine Options-P&L“, sobald der Freeze Kennzeichnungen zulässt.
4. **Ludwig-Backlog** in `SUITE.md` integrieren (würde №78).
5. Optional: Status von №64 auf „umgesetzt 16.09.2026 (Implementierung; nicht validiert)“ setzen.

## 5. Offene Punkte

- **Entscheidung Axel:** Status-Kopfzeile von №64.
- **M3** (größter Buchverlust je Rollkette) ist spezifikationspflichtig: Verrechnung realisierter und offener Ergebnisse, Bewertung nach Andienung, Kapitalnenner. Erst danach in Auswertungen verwenden.
- **B3b:** Ist `sCsp` die geeignete Bewertungsfunktion für die Collar-Auswahl?
- **`SPY`/`RSP` in den öffentlichen Skripten** in `uiq-devtools/trackrecord-audit/`: Benchmark-ETFs, keine Einzeltitel. Die Entscheidung vom 25.11. (Benchmark-Kürzel in der Präregistrierung) spricht dafür, sie stehen zu lassen; ausdrücklich bestätigt hat Axel das für die Skripte noch nicht.
- **Claude-Doc-Titel** enthält noch „Erik“; die Umbenennung muss Axel auf claude.ai vornehmen.
- **Neues tr-Backup vom 25.11.** im `ko-aggregator` enthält Ergebnisse von Signalen ab 09.11.: nicht auswerten, bevor das Skript aus Schritt 1 committet ist.

## 6. Fehler und Korrekturen dieser Session

- **Crosscheck zunächst zu eng** (nur n/hit/avg, fehlende Zellen ignoriert): auf 6 Kennzahlen und fehlende Zellen in beide Richtungen erweitert; 60/60 übereinstimmend.
- **Gate-Abschnitt zunächst als Wirkung formuliert:** in „Selektionsvergleich (deskriptiv)“ umbenannt.
- **Datenqualität zunächst nicht reproduzierbar:** `quality_sensitivity.py` und `stale_share.py` ergänzt.
- **Indexaussage im Audit-Nachtrag C.1 mathematisch ungenau** („hebt sich bei Long auf, bei Short nicht“): nach Review korrigiert; entscheidend ist die Richtungszusammensetzung, und `gate_effect.py` zieht gar keinen Index ab.
- **Beta-Kursquelle zunächst Archiv-Snapshots:** Datierte Schlusskurse dort erst ab 11.09.2026, unvollständige Zeilen sind Intraday-Werte; nur ca. 21–27 Renditepaare je Signaltag. Auf yfinance umgestellt (Fassung 6).
- **Stichprobenende zunächst „60. vorhandener Signaltag“** bei gleichzeitig verlangten 60 auswertbaren Tagen: hätte fast sicher „nicht entscheidbar“ ergeben; auf „60. auswertbarer Tag, spätestens 26.02.2027“ geändert (Fassung 4).
- **№77 zunächst aus gerenderter Ansicht eingefügt** (Tabelle als Tab-Text, Formatierung verloren): durch vollständige `SUITE.md` v4.45 ersetzt.
- **Ludwig-Entwürfe beim Verschieben** zunächst doppelt bzw. am falschen Ort: über Umbenennen bereinigt; Endstand nur in `docs/preregistration/` auf dem Branch.

## 7. Verweise

- Präregistrierung Runde 2: `regime-test/docs/preregistration/PRAEREG-TR-RUNDE2-GATES-2026-11-24.md` (`d9c382d`)
- Audit: `UIQ-Suite/docs/AUDIT-TRACKRECORD-STRESS-2026-11-24.md` und `…-NACHTRAG-2026-11-25.md`
- Backlog: `SUITE.md` №77 (Track-Record-Audit) und Nachtrag unter №64 (Optionsbewertung)
- Spec: `ko-aggregator/docs/TRACK_RECORD_SPEC.md` v1.2 (Kopie in `uiq-archive/audits/trackrecord-2026-11-24/`)
- Audit-Skripte: `uiq-devtools/trackrecord-audit/`
- Code-Belege (Stand `b1728e8`): `market_aggregator.py` `calc_hv_percentile` Z. 2300, `_earnings_gate` Z. 2362, `_options_base_candidate_gates` Z. 2391, `score_options_atmna` Z. 2494, Leaderboards Z. 6019/6060/6061, Snapshot-Keys Z. 11936–11940
- Vorheriges Protokoll: `UIQ-Suite/docs/UEBERGABE-2026-11-23.md`
