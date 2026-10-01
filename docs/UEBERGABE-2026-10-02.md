# Übergabe UIQ — Stand 01.10.2026, 07:35 MESZ → Morgencheck 02.10.2026

**Hinweis für den neuen Chat:** Jeder Chat hat einen eigenen Arbeitsbereich. Alles Relevante liegt auf GitHub (`main`) oder in dieser Datei. Repos bei Bedarf neu klonen.

## 1. Was heute live gegangen ist (beides auf `main`, Fast-Forward)

| Repo | main vorher → nachher | Inhalt |
|---|---|---|
| `ahsub/uiq-suite` | `d6ddf40` → `53c389d` | Generator **v1.30**: `earnings_state` {state, dte, window_days, source_status} in Decision Snapshot, Digest und Ledger (über `decision`); Test `scripts/test_earnings_state.js` (T1–T7) |
| `ahsub/ko-aggregator` | `b4572dc` → `fe5e000` | Aggregator **v5.47.0**: Feld `earningsStatus` je Ticker (`earnings_status.py`), `earningsLookup` in `compute_earnings_calendar()`; Test `tests/test_earnings_status.py`; CI: beide Tests im Workflow `market-aggregator.yml` |

- Merge-Reihenfolge war Suite → Aggregator (der Aggregator-Workflow ruft `test_earnings_state.js` aus Suite-main auf).
- Branches `p1-3-earnings-state` / `p1-3-earnings-status` stehen identisch zu main auf GitHub.
- Version-Lint auf `fe5e000`: grün.
- **Unverändert (bewusst):** Earnings-Gate, Scores, Rang, Auswahl, Rationale-Text, Frontend.

### Semantik
- Intern (`earningsStatus`): `KNOWN_FUTURE` | `STALE_PAST` | `NOT_QUERIED` | `NO_DATE` | `LOOKUP_ERROR`
- Öffentlich (`earnings_state.state`): `BLOCKED` (DTE 1–7) | `IN_WINDOW_SOFT` (8–14) | `NONE_IN_WINDOW` (Termin bekannt, DTE > 14) | `UNKNOWN` (kein belastbarer Termin). `UNKNOWN` ≠ `NONE_IN_WINDOW`, nie zusammengelegt.
- Ledger trägt beides: `state` (öffentlich) und `source_status` (interner Grund).

### Testnachweis 01.10.
- Aggregator: 122/122 grün; isoliert in nachgebauter CI-Umgebung 6/6 grün.
- Echtdaten Snapshot 2026-10-01: `STALE_PAST 116 / KNOWN_FUTURE 84 / NOT_QUERIED 538`; Invarianz von Gate, Scores, Leaderboards bestätigt.
- Generator: T1–T7 grün; Altsnapshot → 738× `UNKNOWN` (kein Raten); simuliert → 73 `NONE_IN_WINDOW`, 10 `IN_WINDOW_SOFT`, 1 `BLOCKED`.

## 2. Morgencheck 02.10. (nach Nachtlauf 22:00 UTC / 00:00 MESZ)

1. **CI im Run:** Schritte „Unit Tests (DCE + Regime)“ inkl. `test_earnings_status.py` und „Unit Tests Generator (earnings_state)“ grün; Logzeile `[Earnings] Status: {…}` vorhanden.
2. **Live-Klassifikation:** Größenordnung ~116 / 84 / 538, jetzt mit `NO_DATE` und `LOOKUP_ERROR` getrennt. Abweichungen gegen Live-Daten prüfen, nicht automatisch als Fehler werten.
3. **Digest:** jede Chance mit `earnings_state`, nicht flächendeckend `UNKNOWN`; erstmals auch `tie_group` (Generator v1.29 läuft heute Nacht zum ersten Mal).
4. **Plausibilität (keine Invarianz-Behauptung live):** Gate-Ausschlüsse weiterhin allein aus `earningsDTE`, gewohnte Größenordnung; `earningsStatus` nie als Ausschlussgrund. Score-/Ranking-Änderungen durch Marktdaten sind erwartet.

Prüfweg Digest (Mac, `~/Downloads`):
```bash
read -s UIQ_STATIC_TOKEN; export UIQ_STATIC_TOKEN     # NUR den Static-Token einfügen
./payload_snapshot.sh nachher
D=$(ls -d payload_nachher_* | tail -1)
grep -c '"earnings_state"' $D/digest.json   # > 0
grep -c '"tie_group"' $D/digest.json        # > 0
grep -c '"dce":' $D/digest.json             # 0
```
Achtung: Bei `read -s` erscheint nichts — nicht versehentlich Befehle in die Variable einfügen (Fehler vom 01.10.: alle Routen 401).

Erst nach sauberem Check gilt **P1 #3 Schritt 1** als abgeschlossen.

## 3. Runmap 2 (DCE-Trennung) — abgeschlossen 01.10.
- Payload mit Static-Token: 5× HTTP 200, `/owner/dce` → 403, keine internen DCE-Felder, `dce_public` im Digest, kein `"dce":`.
- Owner (v515): Ampel grün 72 %, Signalbreite 12,2 % (n = 738), CUSUM n/v, VaR n/v.
- Tester (Inkognito + Static-Token): keine Ampel, keine 72 %, nur Signalbreite/CUSUM/VaR; keine EIC-Zeile.

## 4. Befundregister — Nachträge (Doku-Commit morgen, zusammen mit Check-Ergebnis)
1. Frontend v515 war nach dem Rollout nicht korrekt deployt (Seite zeigte v514, Owner-Ampel fehlte); am 01.10. ~07:20 nachgeholt.
2. Options-Watchlist lädt nach Token-Eingabe nicht automatisch nach (zunächst `KV HTTP 401`, nach Reload ok). P2.
3. `_MCM_REGIME_GATES` doppelt definiert in `market_aggregator.py` (Z. 236 und 9260), derzeit identisch; Drift-Risiko, die zweite gilt still. P2.
4. „Grüne CSP-Ampel“ im KI-Text = regimeabhängiger Festwert aus `_MCM_REGIME_GATES` (BULL_QUIET → green), **kein** DCE-Leck.
5. CI-Echtdatenfall in `test_earnings_status.py` meldet ohne Snapshot „PASSED“ statt skip → später `pytest.skip` mit Meldung. Backlog.

## 5. Danach (in dieser Reihenfolge, jeweils einzeln mit eigenem Test)
- **P1 #5 `ki_eic`** — erst nach erfolgreichem Morgencheck. Eingang: EIC-Zeile im Owner-EIC-Modus sichtbar, in der Tester-Sicht nicht.
- **P1 #3 Schritt 2 (Earnings-Gate)** — separates Paket mit Präregistrierung, weil es die Auswahl verändern kann.
- **Rationale-Text „Earnings-Termin unbekannt“** — später, eigenes kleines Paket.
- **Equity Q1–Q10** (`docs/AUDIT-72-EQUITY-INVENTUR-2026-09-30.md`), offen insbesondere Q7 (Squeeze-Gate für Breakdown gewollt?), Q4 (`UNKNOWN`-Semantik analog Earnings), Q8 (ETF/Krypto in Aktienstrategien).
- Restliche P2-Punkte.

## 6. Entscheidungen Axel 01.10.
`earnings_state` im Ledger: ja · Rationale: später, separat · gemeinsamer Nacht-Rollout: ja · neue Tests in CI: ja · Earnings-Gate selbst: unverändert.
