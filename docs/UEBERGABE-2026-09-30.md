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

# UIQ — Übergabeprotokoll 30.09.2026 → 01.10.2026

**Datum:** 30.09.2026 (nachträglich am 01.10.2026 verfasst; die Session hat am 30.09. kein Protokoll geschrieben)
**Status:** Runmap 2 / Batch 1b Nacht A (DCE-Trennung, ADR-1) gebaut, getestet und am Abend ausgerollt (Worker v2.5, Aggregator v5.46.0, Generator v1.28); Frontend v515 an dem Tag committet, aber erst am 01.10. morgens live · Equity-Inventur №72 (EQ1–EQ12) geliefert und als Befundregister-Nachtrag dokumentiert · Generator v1.29 (`tie_group`) fertig, erst nach grünem T8 auf `main` (01.10.) · keine Score-, Gewichts- oder Schwellenänderung
**Zweck:** Nachträgliche Lücke im Protokollverlauf schließen (zwischen `UEBERGABE-2026-09-29.md` und `UEBERGABE-2026-10-01.md`). Die Zeiten stammen aus `git log` (Autor-/Commit-Datum); wo es um Live-Zustand geht, steht die Quelle dabei. Alles, was die Vorsession nicht selbst geprüft hat, ist als ungeprüft markiert.

## 1. Zeitleiste 30.09.2026 (MESZ, laut `git log` und Sessionverlauf)

| Zeit | Ereignis | Beleg |
|---|---|---|
| früh | Nachzügler vom 29.09. auf `main`: Generator v1.26 (`strategy_score` ohne Composite-Rückfall), №74 (historische `strategy_score`-Semantik), №75 (Alpha-Discovery-Framework, nur Forschungs-Backlog) | UIQ-Suite `bf31921`, `444c6fd`, `b223108` (alle 30.09. 07:01–07:19) |
| 07:52 | Aggregator **v5.45.0**: `leaderboardMeta` (Gleichstandsgröße der Spitzengruppe, vor der 20er-Kürzung) | ko-aggregator `4480fe4` |
| Vormittag | Inventur des Feldflusses `dce` (read-only), danach Entscheidungsrunde E1–E4 | `FELDFLUSS-DCE-TRENNUNG-2026-09-30.md` (außerhalb des Repos, im Chat geliefert) |
| 08:29–08:32 | Nacht-A-Pakete lokal gebaut: Aggregator v5.46.0, Worker v2.5, Generator v1.28, Frontend v515 | `f79a278`, `88f160f`, `ad28e40`, `2785a02` (Autordatum; nach main erst später, s. u.) |
| 09:05 | Befundregister-Nachtrag 30.09. (D15, D13-Bestätigung, E1–E4, EQ1–EQ12) | UIQ-Suite `a27e11c` |
| 12:46 | Vollständiger Equity-Auditbericht mit Prüfskript und Ergebnis nach `docs/`; Freigabestatus im Register | UIQ-Suite `e19e7f8` |
| 12:55 | Frontend v515, zweite Stufe: interner DCE-Block im KI-Prompt nur für Owner (aus `/owner/dce`), nie Fallback | axel-scanner `84fb72f` |
| 19:18 | Worker v2.5, Aggregator v5.46.0 und Generator v1.28 auf `main` (Commit-Datum) | `88f160f`, `f79a278`, `ad28e40` |
| abends | Payload-Referenz „vorher“ mit Static-Token, Worker v2.5 im Cloudflare-Dashboard eingespielt, erneute Prüfung | s. Abschnitt 4 |
| 22:00 UTC | Nachtlauf (Aggregator v5.46.0 + Generator v1.28), Ende ca. 01:15 UTC | Snapshot `2026-10-01_01` |

## 2. Entscheidungen (Axel + Review) am 30.09.

- **Befundregister-Nachtrag:** Inhalt freigegeben (A: Nachtrag nach `main` ✅ · B: vollständiger Equity-Audit in `docs/` ✅ · C: Code-/Scoreänderungen aus EQ1–EQ12 ❌ keine Freigabe · D: P1/P2 bleiben Entscheidungs- und Arbeitsplan · E: D13 bleibt bestehender Befund, D15 neu).
- **DCE-Trennung (ADR-1), E1–E4:**
  - E1 Stufe 1 öffentlich nur Signalbreite; CUSUM „n/v — Implementierung derzeit nicht funktionsfähig“, VaR „n/v — bestehender EVT-Zweig nicht aktiv“. **Keine Korrektur** von CUSUM/EVT im Rahmen dieser Feldfluss-Änderung (eigenes Paket mit Präregistrierung, SUITE №75).
  - E2 interner Key `dce_internal`, Route `GET /owner/dce`.
  - E3 Beta-Tester verlieren Ampel/Confidence/Richtung (beabsichtigt).
  - E4 Fallback-Dict intern mit `fallback: true`, nie öffentlich.
- **Nacht A freigegeben** mit zwei Punkten: (1) DCE-Block in den KI-Prompts bleibt, aber nur als interner Owner-/Systemkontext; (2) `market_regime.dce` → `dce_public` im Digest: ja.
- **Reihenfolge Nacht A:** Payload-Snapshot → Worker → Frontend tolerant → Aggregator → Generator → AK-1-Abnahme. Generator v1.27/`tie_group` erst nach grünem T8 am echten Snapshot.
- **Rahmenregeln (unverändert):** keine neuen Gewichte/Schwellen; kein Optionen-Backtest als Strategie-Return; P0/P1 nicht mischen; je P1-Paket eigener Test; produktiver Rollout erst nach Review/Freigabe; №75: Keine Zahl aus einem externen Papier wird zur UIQ-Schwelle, Gewichtung oder Score-Komponente ohne eigene Präregistrierung und Validierung.

## 3. Nacht A — gebaute Pakete (Teststand laut Release-Notiz der Vorsession)

| Repo | Commit(s) | Inhalt | Tests (Sandbox, nicht live) |
|---|---|---|---|
| ko-aggregator | `f79a278` | **Aggregator v5.46.0**: neues `dce_public.py`; öffentliche Kopie (Datei + KV) ohne `dce` und ohne `meta.dce_cusum_buffer`, dafür `dce_public`; internes Objekt → KV `dce_internal` und privates Archiv; `fallback: true` in `dce_layer._fallback` und im Aggregator-Fallback | `tests/test_dce_public.py` (7); gesamte pytest-Suite zum Zeitpunkt 116 grün |
| ko-aggregator | `88f160f` | **Worker v2.5** (`ko-sync`): `GET /owner/dce` (401 ohne/ungültig, 403 Static, 200 Owner, `no-store`); `sanitizeMasterMarketData` löscht `dce` + Puffer für Nicht-Owner | `tests/test_worker_dce.mjs` (8) |
| UIQ-Suite | `ad28e40` | **Generator v1.28**: Digest `market_regime.dce_public` (Whitelist) statt `dce`; `masterData.dce` wird nicht mehr gelesen | `scripts/test_dce_digest.js` (inkl. Negativkontrolle gegen den alten Code) |
| axel-scanner | `2785a02`, `84fb72f` | **index.html v515**: `loadDceInternalOwner()`; Ampel/Banner nur aus internem Objekt, kein stiller `YELLOW`-Default, Fallback als „DCE-Fallback“; Signalbreite/CUSUM n/v/VaR n/v für alle; Owner-Prompt mit internem DCE-Block nur aus `/owner/dce` | `test_frontend_dce_helpers.js` (11) |

Kettenprüfung (`chain_check.js`, echter Snapshot 2026-09-30_01): Aggregator-Ausgabe → Worker (Static/Owner) → Digest; im Nicht-Owner-Pfad keine internen Felder (`position_size`, `cusum_alarm`, `var_95`, `regime_probs`, `dce_cusum_buffer`, `"dce":`); Static auf `/owner/dce` = 403; Digest-`dce_public` == Aggregator-`dce_public`. Reale `dce_public` damals: Signalbreite 13,1 % (n = 738).

## 4. Rollout am Abend des 30.09. (Quelle: Terminalausgaben Axel, von der Vorsession nicht selbst ausgeführt)

1. `payload_snapshot.sh vorher` mit Static-Token: 5 Routen HTTP 200, `/owner/dce` 401 (Key damals noch nicht vorhanden), Treffer für das alte `dce` in `master_market_data.json` und `digest.json` erwartungsgemäß.
2. Worker v2.5 (Ganzdatei `ko-sync-worker_v2.5.js`) im Cloudflare-Dashboard eingespielt (Deploy ist manuell, nicht über GitHub).
3. Danach: `/owner/dce` mit Static-Token **403**, Zählung `"dce":` im Static-Payload **0**.
4. Nachtlauf mit Aggregator v5.46.0 und Generator v1.28 (eine fachliche Änderung ADR-1).
5. **Frontend v515 war nicht live** (Seite zeigte noch v514); erst am 01.10. ~07:20 nachgeholt. Siehe `UEBERGABE-2026-10-01.md` Abschnitt 4–5. Der Owner-KI-Prompt hatte in dieser einen Nacht keinen DCE-Block, weil `dce_internal` erst mit dem Nachtlauf entstand.

**Live-Ergebnis des Nachtlaufs** (Snapshot `2026-10-01_01`, am 01.10. früh geprüft): Version 5.46.0, 738 Ticker, `dce_public` vorhanden (Details und Ownersicht: `UEBERGABE-2026-10-01.md` Abschnitt 4). Die Prüfung `payload_snapshot.sh nachher` am Digest lief laut 01.10.-Protokoll erfolgreich.

Hinweis zu Pflicht-Header Punkt 8: In der Nacht 30./01. gingen Aggregator v5.46.0 und Generator v1.28 gemeinsam live. Sie bilden fachlich **eine** Änderung (ADR-1, der Generator liest nur das neue Feld); Worker lag vorher, Frontend und `tie_group` wurden bewusst nicht in dieselbe Nacht gelegt.

## 5. Befunde des Tages (Details im Befundregister, Nachtrag 30.09.)

- **D15 (neu): CUSUM** — `_check_cusum` prüft `Σ(x − mean) > 3·std`; die Summe ist mathematisch immer 0, der Alarm kann nie auslösen. Zusätzlich wird der Puffer nie persistiert (Länge 1 in allen 133 Archiv-Snapshots, `cusum_alarm` = False 133/133). Als öffentlicher Messwert nicht zulässig; keine Korrektur ohne Präregistrierung.
- **D13 (Bestätigung): EVT-VaR** — GPD-Zweig läuft bei n = 60 nie (nur 3 Werte unter dem 5-%-Perzentil, Bedingung `> 3`); ausgegeben wird das empirische 1-%-Quantil. Die Vorsession hatte das zunächst als neu gemeldet, obwohl bereits als D13 registriert — korrigiert; der Nachtrag sagt „unabhängig neu hergeleitet“.
- **Signalbreite:** `bullish_pct` ist Anteil der Titel mit Mittelwert aus bis zu vier Scores (sMinervini, sSwing, sBreakout, confluenceScore) über 55; die öffentliche Definition benennt genau das.
- **Equity-Inventur EQ1–EQ12** (`docs/AUDIT-72-EQUITY-INVENTUR-2026-09-30.md`, Prüfskript und Ergebnis in `docs/audit-72-equity/`): Entscheidungs-/Arbeitsplan, **keine** Codefreigabe. Offene Fragen Q1–Q10 stehen im Dokument; Q10 (Regressions-Fixtures) zuerst, noch nicht zur Umsetzung freigegeben.
- **P1-Reihenfolge ab hier:** #2 Spitzengruppe → #3 Earnings UNKNOWN → #5 `ki_eic`, jeweils isoliert (read-only → Befund → eigener Test → erst dann Änderung).

## 6. Generator v1.29 (`tie_group`), Stand Ende 30.09.

- Fachlich fertig seit 30.09. früh (`c5851dc` „NICHT deployen bis T8 grün“, `f3efe5d` T8 verschärft); wegen Versionsfolge als v1.29 nach v1.28 rebased, auf `main` erst am 01.10. 03:41 (Commit-Datum).
- T8 am echten Snapshot beweist: `leaderboardMeta` vorhanden, `topScore` == Zeile 1, Untergrenze und Obergrenze gegen `tickers[]` (wo Feld vorhanden), Digest == Decision Snapshot. **Nicht** bewiesen: exakte Gruppengröße; ATM/NA-Obergrenze (`tickers[]` ohne `sAtmna`); Lücken unterhalb der Spitzengruppe; Frontend-Rangdarstellung.
- Alter Hinweis „NICHT deployen bis T8 grün“ in der Commit-Nachricht `c5851dc` bleibt bestehen (Historie wird nicht umgeschrieben).

## 7. Fehler und Korrekturen am 30.09. (zur Nachvollziehbarkeit)

- EVT-VaR zunächst als neuer Befund gemeldet, war D13 → offen korrigiert (s. o.).
- Erste Erinnerung für den Nachtlauf-Check war auf 23:30 UTC gesetzt, der Lauf endete aber erst ~01:15 UTC → neu auf 01:40 UTC.
- Push in `axel-scanner` zunächst 403 (Repo nicht im Sitzungsumfang) → Repo hinzugefügt, danach Push.
- Stop-Hook verlangte das Pushen eines Doku-Branches vor der Freigabe → nicht gepusht, erst nach Axels Freigabe gemergt.
- Generator-Rebase: Konflikte in Kopfzeile und Exportliste, durch Neunummerierung der Spitzengruppe auf v1.29 gelöst.

## 8. Offene Punkte am Ende des 30.09. (alle ungeprüft, soweit nicht anders vermerkt)

1. `/owner/dce` live mit Owner-Token (200, Inhalt) und Alpha-Desk-Ampel — am 01.10. früh nachgeholt (siehe `UEBERGABE-2026-10-01.md` Abschnitt 4).
2. Digest-KV nach dem Generatorlauf: `dce_public` vorhanden, `"dce":` 0 — laut 01.10.-Protokoll erfüllt.
3. Externe Leser der öffentlichen Digest-Route (Schlüssel `market_regime.dce` entfallen) — in unseren Repos keine weiteren Leser gefunden, externe nicht auszuschließen.
4. Öffentliche Git-Historie von `ko-aggregator` enthält weiter alte Snapshots mit `dce` (№73-Entscheidung unverändert).
5. CI führt nur `test_dce_layer.py` und `test_regime.py` aus; `test_dce_public.py` und `test_worker_dce.mjs` laufen nicht automatisch → Vorschlag der Vorsession, als eigene kleine Änderung (Stand 01.10.: für die neuen P1-#3-Tests entschieden, für die DCE-Tests noch offen).
6. Nacht B (Batch 1b): Prompt-Prinzipregel, Termstruktur-Label — nicht begonnen.
7. CUSUM-/EVT-Korrektur nur als präregistriertes Paket; keine Arbeit daran am 30.09.

## 9. Verweise

- `docs/BEFUNDREGISTER-2026-09-28.md` (Nachtrag 30.09.; Nachtrag 01.10. enthält D16/D17)
- `docs/AUDIT-72-EQUITY-INVENTUR-2026-09-30.md`, `docs/audit-72-equity/`
- `docs/UEBERGABE-2026-09-29.md` (Vorgänger), `docs/UEBERGABE-2026-10-01.md` (Nachfolger)
- Im Chat geliefert, nicht im Repo: `FELDFLUSS-DCE-TRENNUNG-2026-09-30.md`, Release-Notiz Nacht A, `payload_snapshot.sh`, `chain_check.js`
