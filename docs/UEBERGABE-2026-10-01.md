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

# UIQ — Übergabeprotokoll 01.10.2026 → 02.10.2026

**Datum:** 01.10.2026, Sessionende ca. 07:40 MESZ
**Status:** Runmap 2 (DCE-Trennung) abgeschlossen · Nachtlauf 01./02.10.: ausschließlich Generator v1.29 (`tie_group`) · P1 #3 Schritt 1 getestet, auf `main` zurückgerollt, Rollout um eine Nacht verschoben
**Zweck:** Morgencheck 02.10. und Fortsetzung ohne Rückgriff auf den Arbeitsbereich dieser Session (jeder Chat hat einen eigenen; alles Relevante liegt auf GitHub `main`, den Branches oder in diesem Dokument)

## 1. Regelkonflikt erkannt und vor dem Produktionslauf korrigiert (Pflicht-Header Punkt 8)

P1 #3 Schritt 1 war am 01.10. früh bereits auf `main` gemergt. Damit wären im Nachtlauf 01./02.10. zwei Produktionsänderungen gemeinsam live gegangen: Generator v1.29 (`tie_group`, erster Digest-Lauf) und P1 #3. Beim Planen übersehen, beim Abgleich mit diesem Header erkannt.

**Entscheidung Axel 01.10.:** Regel einhalten, keine Ausnahme. P1 #3 per `git revert` zurückgerollt, Reihenfolge Aggregator → Suite:

| Repo | main | Ergebnis |
|---|---|---|
| `ahsub/ko-aggregator` | `fe5e000` → **`28f7c4b`** (Revert von `fe5e000` + `7e35a3e`) | inhaltsgleich mit `b4572dc`, `AGGREGATOR_VERSION = "5.46.0"` |
| `ahsub/UIQ-Suite` | `dba9277` → **`0995b97`** (Revert von `53c389d` + `851b1b5`) | `scripts/` inhaltsgleich mit `d6ddf40`, Generator v1.29, `test_tie_group.js` grün |

Der getestete P1-#3-Stand bleibt erhalten: Branches `p1-3-earnings-status` (ko-aggregator, `fe5e000`) und `p1-3-earnings-state` (UIQ-Suite, `53c389d`), dazu die beiden `.patch`-Dateien aus dem Chat vom 01.10.

## 2. P1 #3 Schritt 1 — getesteter Stand (wartet auf Rollout)

| Repo | Branch / Commits | Inhalt |
|---|---|---|
| `ahsub/UIQ-Suite` | `p1-3-earnings-state`: `851b1b5`, `53c389d` | Generator **v1.30**: `earnings_state` {state, dte, window_days, source_status} in Decision Snapshot, Digest, Ledger (über `decision`); Test `scripts/test_earnings_state.js` (T1–T7) |
| `ahsub/ko-aggregator` | `p1-3-earnings-status`: `7e35a3e`, `fe5e000` | Aggregator **v5.47.0**: `earningsStatus` je Ticker (`earnings_status.py`), `earningsLookup` in `compute_earnings_calendar()`; Test `tests/test_earnings_status.py`; CI-Schritte in `market-aggregator.yml` |

**Wiedereinspielen (nach erfolgreichem v1.29-Check):** Reihenfolge **UIQ-Suite → ko-aggregator** (der Aggregator-Workflow ruft `test_earnings_state.js` aus Suite-main auf). Weg: jeweils „Revert of Revert“ auf main (`git revert 0995b97` bzw. `git revert 28f7c4b`). Vorher Tests erneut gegen den dann aktuellen main laufen lassen. Version-Lint verlangt bei Änderung an `market_aggregator.py` eine `+AGGREGATOR_VERSION`-Zeile; beim Revert-of-Revert ist sie enthalten (5.47.0).

Bewusst unverändert: Earnings-Gate, Scores, Rang, Auswahl, Rationale-Text, Frontend.

**Semantik**
- Intern `earningsStatus`: `KNOWN_FUTURE` | `STALE_PAST` | `NOT_QUERIED` | `NO_DATE` | `LOOKUP_ERROR`
- Öffentlich `earnings_state.state`: `BLOCKED` (DTE 1–7) | `IN_WINDOW_SOFT` (8–14) | `NONE_IN_WINDOW` (Termin bekannt, DTE > 14) | `UNKNOWN` (kein belastbarer Termin). `UNKNOWN` ≠ `NONE_IN_WINDOW`.
- Ledger trägt `state` (öffentlich) und `source_status` (interner Grund).

**Testnachweis 01.10. (Sandbox, nicht live)**
- Aggregator: 122/122 grün; isoliert in nachgebauter CI-Umgebung (frische venv, Workflow-`pip install`, identischer Aufruf) 6/6 grün.
- Snapshot 2026-10-01: `STALE_PAST 116 / KNOWN_FUTURE 84 / NOT_QUERIED 538` (aus Altfeldern klassifiziert); Invarianz Gate/Scores/Leaderboards bestätigt.
- Generator: T1–T7 grün; Altsnapshot → 738× `UNKNOWN`; simuliert → 73 `NONE_IN_WINDOW` / 10 `IN_WINDOW_SOFT` / 1 `BLOCKED`; bestehende Suite-Tests grün.
- Die rote Isolations-Prüfung am 01.10. war ein Sandbox-Artefakt (pytest in eigener uv-Umgebung ohne `requests`), per Interpreter-Vergleich bestätigt.

**Live-Check nach dem P1-#3-Nachtlauf (später):** CI-Schritte beider Tests grün + Logzeile `[Earnings] Status: {…}`; Größenordnung ~116 / 84 / 538 mit getrenntem `NO_DATE` / `LOOKUP_ERROR`; jede Chance im Digest mit `earnings_state`, nicht flächendeckend `UNKNOWN`; Gate-Ausschlüsse weiter allein aus `earningsDTE` (live nur Plausibilität, keine Invarianz-Behauptung).

## 3. Morgencheck 02.10. — nur Generator v1.29 (`tie_group`)

1. **Nachtlauf:** Workflow `market-aggregator.yml` grün, Schritt „Generate Public Recommendations“ ohne Fehler. Aggregator-Version im Lauf 5.46.0.
2. **Digest:** `tie_group` erstmals vorhanden; `dce_public` weiter vorhanden, kein `"dce":`; **kein** `earnings_state` (wäre ein Hinweis, dass P1 #3 doch live ging).
3. **Inhalt `tie_group`** (Header Punkt 7: Inhalt, nicht nur Struktur): Spitzengruppen-Größen plausibel zu den Vortagswerten (laut Vorsession, Snapshot 01.10.: CSP/Weekly/Collar 53, ATM/NA 25, CC 27 am Deckel 100 — von dieser Session nicht nachgeprüft); `in_top_group`, `size`, `score` je Chance stimmig mit `strategy_score`.
4. **Frontend:** `rank`-Anzeige mit Spitzengruppe — bisher ungeprüfter Restpunkt aus T8.

Prüfweg (Mac, `~/Downloads`):
```bash
read -s UIQ_STATIC_TOKEN; export UIQ_STATIC_TOKEN     # danach NUR den Static-Token einfügen
./payload_snapshot.sh nachher
D=$(ls -d payload_nachher_* | tail -1)
grep -c '"tie_group"' $D/digest.json        # > 0
grep -c '"earnings_state"' $D/digest.json   # 0
grep -c '"dce_public"' $D/digest.json       # >= 1
grep -c '"dce":' $D/digest.json             # 0
```
Fehler 01.10.: Bei `read -s` erscheint nichts; versehentlich eingefügter Befehlstext landete als Token in der Variable → alle Routen 401.

Nach sauberem v1.29-Check: P1 #3 Schritt 1 wieder einspielen (Abschnitt 2), Nachtlauf 02./03.10.

## 4. Runmap 2 (DCE-Trennung) — abgeschlossen 01.10. (live geprüft)
- Payload mit Static-Token: 5× HTTP 200, `/owner/dce` → 403, keine internen DCE-Felder, `dce_public` im Digest (1), kein `"dce":` (0).
- Owner (Frontend v515): Ampel grün 72 %, Signalbreite 12,2 % (n = 738), CUSUM n/v, VaR n/v.
- Tester (Inkognito + Static-Token): keine Ampel, keine 72 %, nur Signalbreite/CUSUM/VaR; keine EIC-Zeile; Watchlist nach Reload vorhanden.

## 5. Befundregister-Nachträge (Doku-Commit am 02.10. zusammen mit dem Check-Ergebnis)
1. Frontend v515 war nach dem Rollout nicht live (Seite zeigte v514, Owner-Ampel fehlte); 01.10. ~07:20 nachgeholt.
2. Options-Watchlist lädt nach Token-Eingabe nicht automatisch nach (zunächst `KV HTTP 401`, nach Reload ok). P2.
3. `_MCM_REGIME_GATES` doppelt definiert in `market_aggregator.py` (Z. 236 und 9260), Inhalt per Parser-Vergleich identisch; Drift-Risiko, die zweite gilt still. P2.
4. „Grüne CSP-Ampel“ im KI-Text = regimeabhängiger Festwert aus `_MCM_REGIME_GATES` (`_get_atmna_flag`, BULL_QUIET → green), kein DCE-Leck.
5. CI-Echtdatenfall in `test_earnings_status.py` meldet ohne Snapshot „PASSED“ statt skip → später `pytest.skip` mit Meldung. Backlog.
6. Grundgesetz-8-Konflikt: erkannt am 01.10. vor dem Produktionslauf, P1 #3 per Revert um eine Nacht verschoben (Abschnitt 1). Keine Ausnahme.
7. Erste Fassung dieses Protokolls (`docs/UEBERGABE-2026-10-02.md`, falscher Dateiname, ohne Pflicht-Header) durch diese Fassung ersetzt.

## 6. Danach (einzeln, je eigener Test, je eine Nacht)
- **P1 #3 Schritt 1 Rollout** — nach bestätigtem v1.29 (Abschnitt 2).
- **P1 #5 `ki_eic`** — nach bestätigtem P1-#3-Lauf. Eingang: EIC-Zeile im Owner-EIC-Modus sichtbar, in Tester-Sicht nicht.
- **P1 #3 Schritt 2 (Earnings-Gate)** — eigenes Paket mit Präregistrierung (verändert potenziell die Auswahl).
- **Rationale-Text „Earnings-Termin unbekannt“** — später, eigenes kleines Paket.
- **Equity Q1–Q10** (`docs/AUDIT-72-EQUITY-INVENTUR-2026-09-30.md`), offen v. a. Q7 (Squeeze-Gate für Breakdown gewollt?), Q4 (`UNKNOWN`-Semantik analog Earnings), Q8 (ETF/Krypto in Aktienstrategien).
- Restliche P2-Punkte.

## 7. Entscheidungen Axel 01.10.
`earnings_state` im Ledger: ja · Rationale: später, separat · gemeinsamer Nacht-Rollout Aggregator+Generator (als eine Änderung): ja · neue Tests in CI: ja · Earnings-Gate: unverändert · Grundgesetz 8 eingehalten: P1 #3 erst nach bestätigtem v1.29-Lauf.
