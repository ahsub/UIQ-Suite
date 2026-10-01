# P1 #3 — Earnings-Gate: `UNKNOWN` ≠ `NONE_IN_WINDOW` (Befund, read-only)

**Stand:** 01.10.2026 · Snapshot `2026-10-01_01` (Aggregator v5.46.0, 738 Ticker) · Quellen: `market_aggregator.py` (`compute_earnings_calendar`, `_earnings_gate`, Zuweisung ~Z. 10660), `generate_public_recommendations.js` v1.29 (`buildEarningsLookup`, `applyEligibilityGate`). **Nichts geändert.**

## 1. Datenfluss heute
1. `compute_earnings_calendar(sym)` (yfinance): Methode 1 nimmt `info["earningsTimestamp"]` **ohne Prüfung, ob das Datum in der Zukunft liegt**; Methode 2 (`get_earnings_dates`) nimmt nur künftige Termine. Jeder Fehler → alle Felder `None` (nur Debug-Log).
2. Abgefragt werden nur die **ersten 200** Ergebnisse, die keine Sektor-ETFs/Krypto sind (`[:200]`, Timeout-Schutz). Alle anderen behalten den Platzhalter `earningsDTE = None`.
3. Aggregator-Gate `_earnings_gate`: `None` oder `DTE ≤ 0` → „kein Block“; 1–7 → harte Sperre (Score 0); 8–Fenster → Malus; Fenster 14 (CSP/Collar/ATM-NA), 7 (Weekly), 21 (CC).
4. Generator-Gate `applyEligibilityGate` (separat, `earningsExclusionDays = 7`): `dte != null && dte < 7` → **ausgeschlossen** (`EARNINGS_TOO_CLOSE`).

## 2. Messung am Snapshot (738 Ticker)
| Zustand von `earningsDTE` | Ticker |
|---|---|
| `None` | **538** (davon 13 Krypto) |
| ≤ 0 (Datum vergangen/heute; 21–71 Tage alt, z. B. AMZN −63, TSLA −71, META −64) | **116** |
| 1–7 (harte Sperre) | 1 |
| 8–14 | 10 |
| 15–21 | 21 |
| > 21 | 52 |

- Lückenlos die Positionen 0–199 haben ein Datum, alle anderen keins: **`None` bedeutet „nicht abgefragt“, nicht „keine Earnings“**. „Abgefragt, nichts gefunden“ kommt heute nicht vor (0 Fälle, 200/200) — Fehler und fehlende Daten sind aber auch nicht unterscheidbar.
- **58 % der abgefragten Titel (116/200) tragen ein veraltetes Datum.** Das nächste Datum ist dort unbekannt, das Gate behandelt es wie „kein Block“.
- Belastbar (zukünftiges Datum) haben nur **84 von 738 (11 %)**.
- Spitzengruppe CSP (53 Titel bei 100): 8 mit künftigem Datum, 3 veraltet, **42 `None` → 45 von 53 (85 %) ohne belastbare Earnings-Information**. Kandidaten `sCsp ≥ 50`: 259 von 295 (88 %). CC `sCc ≥ 30`: 245 von 279 (88 %).
- Kontrolle: Kein Titel mit DTE 1–7 hat `sCsp > 0` — die harte Sperre wirkt dort, wo ein Datum bekannt ist.

## 3. Zweiter Befund: zwei Gates mit entgegengesetzter Semantik bei DTE ≤ 0
Im Generator gilt `dte < 7` **ohne Untergrenze**: veraltete Daten (negativ) werden als „Earnings zu nah“ **ausgeschlossen**, `None` wird nie ausgeschlossen. Auf dem Snapshot, alle 15 Strategien: **68 Ausschlüsse, alle mit DTE ≤ 0, keiner mit DTE 1–6** (z. B. AAPL −63 bei VCP, TSLA −71 bei Breakdown, META −64 bei CC, XOM/CVX −62 bei Dividend/Value). Folge: Der Ausschlussgrund „EARNINGS_TOO_CLOSE“ trifft in der Praxis nur veraltete Termine, nicht nahe; Titel ohne Datum bleiben unberührt. Der Aggregator behandelt dieselben Titel entgegengesetzt (kein Block). Wirkung: Auswahl `eligible/secondary/reserve` im Digest.

## 4. Vorschlag Zustandsmodell (Schritt 1, rein additiv)
Intern (Aggregator, neues Feld `earningsStatus`): `KNOWN_FUTURE` · `STALE_PAST` (Datum ≤ 0, nächster Termin unbekannt) · `NOT_QUERIED` (Cap/Assetklasse) · `NO_DATE` / `LOOKUP_ERROR` (heute nicht trennbar, 0 Fälle; Fehlerpfad soll zählen statt schweigen).
Öffentlich (Generator, je Options-Chance): `BLOCKED` (1–7) · `IN_WINDOW_SOFT` (8–Fenster) · `NONE_IN_WINDOW` (**bekanntes künftiges** Datum jenseits des Fensters) · `UNKNOWN` (= `STALE_PAST` ∪ `NOT_QUERIED` ∪ `NO_DATE`/Fehler). Rationale nennt „Earnings-Termin unbekannt“, statt zu schweigen.
**Invarianten:** `earningsDTE`, alle Scores, Leaderboards, Filter, Gates und die Kandidatenauswahl bleiben bit-identisch (Test: Vorher/Nachher auf dem Snapshot). Keine Fensterkopplung an die Kontrakt-Laufzeit (zweiter Schritt, eigene Entscheidung).

## 5. Testplan
Zustandstabelle mit Grenzfällen (−1, 0, 1, 7, 8, 14, 15, 21, 22, `None`, fehlendes Feld, falscher Typ) · Scores/Leaderboards/Selektion unverändert (Snapshot-Vergleich) · Zählungen am echten Snapshot (116 `STALE_PAST`, 538 `NOT_QUERIED`, …) · `UNKNOWN` darf nie als `NONE_IN_WINDOW` erscheinen · Fehlerpfad (Exception) → `LOOKUP_ERROR`, nicht `NOT_QUERIED`.

## 6. Entscheidungen für dich (nicht von mir entschieden)
- **a) Generator-Gate** (Ausschluss bei DTE ≤ 0, 68 Fälle): in diesem Paket **nur ausweisen, nicht ändern** (Empfehlung; Änderung verschiebt die Digest-Auswahl) und als eigenes Paket entscheiden.
- **b) 200er-Cap:** nicht anfassen (Abdeckung zu erhöhen ist eine Laufzeit-/Datenänderung, eigenes Paket).
- **c) Frontend** (Scanner zeigt `earningsDTE` im Fenster −2…45): getrennt vom Aggregator/Generator-Paket.
- **d) Wortlaut** der Zustände und der Rationale (`UNKNOWN` / „Earnings-Termin unbekannt“).
- **e) Befundregister:** die Befunde als D16/D17 aufnehmen (Doku, nach deiner Freigabe).
