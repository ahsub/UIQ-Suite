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

# UIQ — Übergabeprotokoll 02.10.2026 → 03.10.2026

**Datum:** 02.10.2026, Sessionende ca. 06:45 MESZ (Fortsetzung der Session vom 01.10.)
**Status:** Generator v1.29 (`tie_group`) live und inhaltlich geprüft · P1 #3 Schritt 1 (Generator v1.30 + Aggregator v5.47.0) um 06:28 MESZ per „Revert of Revert“ auf beide `main` gepusht, **geht im Nachtlauf 02./03.10. (Fr 22:00 UTC) erstmals live** · keine Score-, Gewichts-, Schwellen- oder Gate-Änderung · Earnings-Gate unangetastet
**Zweck:** Echtdatencheck des P1-#3-Nachtlaufs am Morgen des 03.10. und Fortsetzung ohne Rückgriff auf den Arbeitsbereich dieser Session (alles Relevante liegt auf GitHub `main` oder in diesem Dokument)

> Quellenhinweis: Terminalausgaben (`payload_snapshot.sh`, Digest-Greps, `SHA256SUMS`, `digest.json`) stammen von Axel; die Prüfung von `digest.json` und den Tests habe ich selbst ausgeführt. Alles Übrige ist laut Session berichtet und nach Pflicht-Header Punkt 1 vom nächsten Chat zu verifizieren.

## 1. Runmap (Reihenfolge der nächsten Läufe, je eine Produktionsänderung pro Nacht)

| Lauf | Inhalt | Status |
|---|---|---|
| Nacht 30./01.10. | Runmap 2 / Nacht A: DCE-Trennung (Worker v2.5, Aggregator v5.46.0, Generator v1.28) | abgeschlossen, live geprüft (01.10.) |
| Nacht 01./02.10. | **ausschließlich** Generator v1.29 (`tie_group`) | abgeschlossen, **inhaltlich geprüft 02.10.** (Abschnitt 2) |
| **Nacht 02./03.10. (Fr→Sa)** | **ausschließlich P1 #3 Schritt 1** (Generator v1.30 + Aggregator v5.47.0, `earningsStatus` / `earnings_state`) | **gepusht, wartet auf Lauf** (Abschnitt 3) |
| Morgen 03.10. | Echtdatencheck P1 #3 (Abschnitt 4), Register-Nachtrag | offen |
| nächster Lauf | **P1 #5 `ki_eic`** — nur nach sauberem P1-#3-Check | nicht begonnen |
| danach, einzeln | Rationale „Earnings-Termin unbekannt“ · P1 #3 Schritt 2 (Earnings-Gate, mit Präregistrierung, verändert potenziell die Auswahl) · `tie_group` für Equity · Equity Q1–Q10 · P2 | nicht begonnen |

Hinweis zum Takt: Der Aggregator läuft laut Beschreibung per Cron werktags 22:00 UTC. Der Lauf Fr 02.10. endet in der Nacht auf Sa 03.10.; ein weiterer planmäßiger Lauf wäre erst Mo 05.10. 22:00 UTC. Ob ein manueller Lauf (Pflicht-Header Punkt 8) für P1 #5 am Wochenende nötig/gewünscht ist, ist **nicht entschieden und nicht geprüft**.

## 2. Generator v1.29 (`tie_group`) — Nachtlauf 01./02.10., inhaltlich geprüft

Geprüfte Datei: `payload_nachher_20261002T0416Z/digest.json`, SHA-256 `d064c879…adbf` (identisch mit Axels `SHA256SUMS`). Snapshot-Lauf 341, `generated` 2026-10-02T01:27:17Z, `last_trading_day` 2026-10-01, Aggregator 5.46.0, 738 Ticker.

| Strategie | Gruppengröße | Score | `tie_check` |
|---|---|---|---|
| csp_wheel / weekly_income / collar | 48 | 100 | TOP_GROUP_ONLY |
| atmna / cc | 19 | 100 | TOP_GROUP_ONLY |

- Je Chance `in_top_group: true`, `rank_semantics: LIST_POSITION`, Rationale: „…die Reihenfolge entspricht der Listenposition, nicht einem Qualitätsunterschied“. Größen gleich `topTieCount` aus `leaderboardMeta` des Snapshots.
- Alle anderen Strategien (ko, momentum, breakout, vcp, swing, meanrev, breakdown, fading_short, dividend, value): `tie_group: null` (erwartet, `leaderboardMeta` nur für Optionsstrategien).
- Payload-Check Axel: 5× HTTP 200, `/owner/dce` mit Static-Token → 403, keine internen DCE-Felder, kein `earnings_state` (richtig: P1 #3 war nicht live), `dce_public` vorhanden, kein `"dce":`. `grep -c` zählt Zeilen, nicht Vorkommen.
- Der Status des Schritts „Generate Public Recommendations“ in Lauf 341 wurde nicht gesehen; das Digest aus dem Live-Worker enthält `tie_group` (Generator lief also und lieferte aus).
- **Abweichung zur Vorprotokoll-Erwartung:** Das Protokoll vom 01.10. nennt aus dem Snapshot 01.10. (Vortag) Gruppen 53 / 25 / 27. Die geprüften Werte des Laufs 01./02.10. sind 48 / 19 / 19 (anderer Snapshot, anderer Tag, am Deckel 100). Die Vortagswerte wurden von keiner Session nachgeprüft; hier kein Befund, nur nicht gleichsetzen.
- **Nicht geprüft:** Frontend-Darstellung `rank` bei Spitzengruppe (Restpunkt aus T8, v515).

## 3. P1 #3 Schritt 1 — auf `main`, geht heute Nacht live

| Repo | `main` | Inhalt |
|---|---|---|
| `ahsub/UIQ-Suite` (Push 06:28) | `1d37dc5` → **`9d17500`** (Revert von `0995b97`) | Generator **v1.30**: `earnings_state` {state, dte, window_days=14, source_status} in Decision Snapshot, Digest, Ledger; `scripts/test_earnings_state.js` (T1–T4, T7) |
| `ahsub/ko-aggregator` (danach) | `817d166` → **`161cf9c`** (Revert von `28f7c4b`) | Aggregator **v5.47.0**: `earningsStatus` je Ticker (`earnings_status.py`), `earningsLookup` in `compute_earnings_calendar()`; `tests/test_earnings_status.py`; CI-Schritte in `market-aggregator.yml` |

- Reihenfolge Suite → Aggregator zwingend (der Aggregator-Workflow ruft `test_earnings_state.js` aus Suite-main auf). Die lokalen Branches `p1-3-reenable` sind gelöscht, nichts ungepusht.
- Vor dem Push gegen den aktuellen `main` erneut getestet: Aggregator pytest **122 passed**; Generator T1–T4, T7 grün; `ko-aggregator`-Stand identisch mit Axels getestetem Remote-Branch `p1-3-earnings-status` (kein Unterschied außerhalb `data`). Die Tests liefen in meiner Sandbox, nicht in der echten CI.
- **Semantik:** intern `earningsStatus` = `KNOWN_FUTURE` | `STALE_PAST` | `NOT_QUERIED` | `NO_DATE` | `LOOKUP_ERROR`. Öffentlich `earnings_state.state` = `BLOCKED` (DTE 1–7) | `IN_WINDOW_SOFT` (8–14) | `NONE_IN_WINDOW` (nur `KNOWN_FUTURE`, DTE > 14) | `UNKNOWN` (alles andere). `UNKNOWN` ≠ `NONE_IN_WINDOW`. Ledger trägt `state` und `source_status`.
- **Bewusst unverändert:** Earnings-Gate (`buildEarningsLookup` / `applyEligibilityGate`, Ausschluss weiter allein über `earningsDTE`), Scores, Rang, Auswahl, `tie_group`, Rationale-Text, Frontend. Die 68 Ausschlüsse mit DTE ≤ 0 (D17) bleiben eigenes späteres Paket.
- **Rollback vorbereitet** (nur nach Axels Freigabe): `git revert 161cf9c` (ko-aggregator) und `git revert 9d17500` (UIQ-Suite), Reihenfolge Aggregator → Suite. Revert-Auslöser: Rang/Auswahl/Gate-Ergebnis verändert, oder `earnings_state` greift in eine Entscheidung ein, oder flächendeckender Lookup-Fehler.
- **Simulation vom 01.10. (nicht live):** Snapshot 2026-10-01: `STALE_PAST 116 / KNOWN_FUTURE 84 / NOT_QUERIED 538`; Generator simuliert 73 `NONE_IN_WINDOW` / 10 `IN_WINDOW_SOFT` / 1 `BLOCKED` / 654 `UNKNOWN`. **Kein Sollwert**, nur Größenordnung.

## 4. Echtdatencheck P1 #3 (Morgen 03.10.)

Axel liefert: (1) `./payload_snapshot.sh nachher` mit Ordner und `digest.json`, (2) Log-Auszug mit `[Earnings] Status: {…}`, (3) Status der beiden neuen CI-Schritte.

1. CI: Schritte `test_earnings_status.py` und `test_earnings_state.js` grün; Workflow insgesamt grün, Aggregator-Version im Lauf 5.47.0.
2. Log `[Earnings] Status: {…}`: Summe der fünf Zustände = Tickerzahl (738 oder aktueller Wert); `NO_DATE` / `LOOKUP_ERROR` eigene Zustände, nicht in `STALE_PAST` / `KNOWN_FUTURE` eingerechnet; `NOT_QUERIED` größte Gruppe; Plausibilität statt Gleichheit mit 116/84/538; flächendeckender Lookup-Fehler wäre ein Befund.
3. Digest: jede Chance mit `earnings_state`; `UNKNOWN` nicht flächendeckend; `NONE_IN_WINDOW` nur aus `KNOWN_FUTURE`; `UNKNOWN` exakt = alle Zustände außer `KNOWN_FUTURE`.
4. Entscheidungsinvarianz: Rang, `strategy_score`, `tie_group`, Top-3-Auswahl gegenüber Gate-Ergebnis plausibel unverändert (im Echtlauf nur Plausibilität; Invarianz belegt der Test T4, nicht der Live-Lauf).
5. Gate: Ausschlüsse weiter aus `earningsDTE`. Rationale-Texte unverändert.
6. DCE: `dce_public` vorhanden, kein `"dce":` im Digest, `/owner/dce` mit Static-Token → 403.
7. Anschließend die Plausibilitätschecks aus Abschnitt 5; Ergebnis als Befundregister-Nachtrag.

Prüfweg (Mac, `~/Downloads`):
```bash
read -s UIQ_STATIC_TOKEN; export UIQ_STATIC_TOKEN     # nur den Static-Token einfügen (bei read -s erscheint nichts)
./payload_snapshot.sh nachher
D=$(ls -d payload_nachher_* | tail -1)
grep -c '"earnings_state"' $D/digest.json   # jetzt > 0 erwartet (zählt Zeilen, nicht Vorkommen)
grep -c '"dce_public"' $D/digest.json       # >= 1
grep -c '"dce":' $D/digest.json             # 0
```

## 5. Offene Punkte und Befunde (alle getrennt vom P1-#3-Rollout)

1. **Befundregister-Nachtrag 02.10.** (noch nicht geschrieben): v1.29-Ergebnis (Abschnitt 2), Beobachtung unten (a), (b).
   - (a) `tie_group` für Ko / Momentum / VCP: je drei Top-Chancen mit Score 100, `tie_group: null` (Swing 95/95, Breakout 90/90, Breakdown 95/95 ebenfalls gleichstehende Plätze). Eigener Scope, nicht Teil von v1.29.
   - (b) KLAC (Ko und Momentum, Score 100): „Abstand zum 52W-Hoch −35,32 %“ bei EMA200 +11,37 %, RS 85. Möglicherweise echt, möglicherweise Datenfehler bei `high52w`. Separater Daten-/Snapshot-Check, **ohne vorweggenommene Bewertung**.
2. **Frontend-Rangansicht (v515)** bei Spitzengruppe: Screenshot der Optionen-Tabelle (CSP/Weekly/Collar) steht aus.
3. **EIC / Prompt-Paket (nach P1 #3):** EIC-Befunde EIC1–EIC6 und Reviewer D.1/D.2 liegen im Befundregister (Nachtrag 01.10. EIC-Audit, `e19608b`); `SEPA 8/8` = `sepaProxy = round(sMinervini/100*8)`, Sättigung 102/738 mit sMinervini ≥ 94; Prompt-Labels `VCP✓(…letzte:X%)` / `Tightness:X%` / `IVP:XX%ile` / `HVP`. Offene Diagnosen aus dem 01.10.-Protokoll Punkte 8–12 (Regime NEUTRAL vs. BULL_QUIET im EIC-Kontext, Prompt-Regel wörtlich im Output, „Strategie-Gates n/v“, Earnings im EIC-Kontext, AIVAF-Datenplausibilität) bleiben offen.
4. **Scanner-Tab Live-Scan (D18/D19, Nachtrag 01.10. abends, `1d37dc5`):** Langfristkennzahlen im Live-Scan aus Intraday-Kerzen (Volumen 0/10 während des US-Fensters); US-Marktfenster 13:30–20:15 UTC ohne Sommerzeit-Behandlung. Beides dokumentiert, **keine Reparatur beschlossen**. Offener Fall: MPWR Vol 0/10 auch im Tageschart (echt < 80 % oder fehlend? „Volumen“-Pill von Axel zu prüfen).
5. **Research-Frage №75** (EMA200 / EMA50 / RSI) und **P2:** `_MCM_REGIME_GATES` doppelt definiert (`market_aggregator.py` Z. 236 und 9260); Options-Watchlist lädt nach Token-Eingabe nicht automatisch nach; Echtdatenfall in `test_earnings_status.py` meldet ohne Snapshot „PASSED“ statt skip. Optional: `test_dce_public.py` / `test_worker_dce.mjs` in die CI.

## 6. Entscheidungen Axel (02.10.)
Re-Enable P1 #3 Schritt 1 ausdrücklich freigegeben (06:27) und Push freigegeben (06:28) · Reihenfolge Suite → Aggregator · heute Nacht nur diese eine Produktionsänderung, danach bis zum Lauf keine weiteren · 116/84/538 ist keine harte Sollzahl · `earnings_state` beobachtet, steuert nichts · Earnings-Gate bleibt unangetastet · `tie_group` für Equity und KLAC separat, nicht in den v1.29-Abschluss ziehen · P1 #5 erst nach sauberem Echtdatencheck.

## 7. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)
- Behauptung „alle 2/3 falsch“ auf Basis der Aggregator-`bullSignals` vorschnell; nach Prüfung der Frontend-Berechnung eingegrenzt (8 Titel 3/3, SHEL/STNG 2/3).
- Falsche Annahme zum Marktfenster (Reload nach 22:00 MESZ ergebe Tagesmodus): Fenster endet 22:15 MESZ (20:15 UTC), der erste Reload zeigt noch US-Live; führte zu D19.
- Zeilenzahl eines Diffs falsch genannt (29 statt 21 hinzugefügte Zeilen), nach dem Push korrigiert.
- Die Vorversion dieses Protokolls (falscher Dateiname, ohne Pflicht-Header) wurde laut 01.10.-Protokoll bereits ersetzt; dies ist die einzige Fassung für 02.10.

## 8. Verweise
- `docs/BEFUNDREGISTER-2026-09-28.md` (Nachträge 30.09., 01.10., 01.10. EIC-Audit, 01.10. abends D18/D19)
- `docs/UEBERGABE-2026-10-01.md`, `docs/UEBERGABE-2026-09-30.md`, `docs/UEBERGABE-HEADER-TEMPLATE.md`
- Commits: UIQ-Suite `9d17500` (P1 #3 Re-Enable), `1d37dc5` (D18/D19), `e19608b` (EIC-Audit), `a84c7ef` (Übergabe 30.09.); ko-aggregator `161cf9c` (Re-Enable), `28f7c4b` (Revert vom 01.10.)
