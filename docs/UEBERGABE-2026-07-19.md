## PFLICHT-HEADER

Dieses Dokument beschreibt einen behaupteten Zustand — nicht eigenes Wissen.
Axel: "hast du das verifiziert oder übernommen?" bei jedem Zitat.

**Arbeitsregel (unwiderruflich):** Bei Laufzeit-Bugs IMMER Konsolen-Check
zuerst, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
(Jetzt auch in SUITE.md Grundgesetz 9 verankert.)

---

# ÜBERGABEPROTOKOLL — 19.07.2026 (Tagesabschluss)

## Versionsverlauf heute

| Version | Was |
|---|---|
| v374 | 4 Nomenklatur-/Konsistenz-Bugs (visuelle Verifikation) |
| v375 | Options-Deck Collar/PP-Tab + scoreCollar-Chip |
| Aggregator v5.12.0 | score_options_collar() — neue Scoring-Funktion |
| Aggregator v5.12.1 | Regime-Bug-Fix (market_regime_str statt Ticker-Markov) |
| Aggregator v5.12.2 | EMEA-UCITS-Parser für Sektor-ETF-Holdings |
| Aggregator v5.12.3 | SSGA-US-Download deaktiviert (falsches Format) |
| Aggregator v5.12.4 | SECTOR_ETF_LIST alle 10 ETFs — **FINAL VERIFIED** ✅ |
| SUITE.md | Grundgesetz 9: Debug-Protokoll-Regel eingetragen |

---

## Block 1: Visuelle Verifikation + Nomenklatur (v374)

4 Bugs aus Axels Screenshots:

1. `_lbToStrat: short_fading: 'meanrev'` → `'fading_short'` — Fading-LB öffnete MR-Analyse
2. Fading-Tab `🔝 Fading` → `🔝 Fading Short`
3. KI-Briefing-Modal: Dividend/Value raus, VCP/Collar rein
4. Options-Desk KI-Buttons: CSP/Wheel + CSP ATM/NA korrekt, Collar/PP neu

## Block 2: scoreCollar-Sprint (v375 + Aggregator v5.12.0–5.12.1)

**score_options_collar()** — neue Funktion nach CSP/CC/Spread-Muster:
- BULL_FRAGILE → +50 (Prio-1-Regime-Lücke), NEUTRAL → +20,
  STRESS_UNSTABLE/bear → 0
- RSI-Überdehnung als Absicherungsbedarf-Proxy
- HVP 25–65 ideal, ATR/Preis als Kosten-Proxy
- In optsScore, Macro-Overlay, IOS-Overlay integriert

**Regime-Bug (v5.12.0 → v5.12.1):**
market_regime_str-Berechnung lag nach dem Options-Loop — vor Verschiebung
nutzte score_options_collar() den Ticker-Markov-Regime (`side`) statt MSE.
Run #122 verifiziert: IWM=40 (BULL_QUIET +5, korrekt).

**Frontend v375:** Collar/PP-Tab im Options-Deck, scoreCollar im Ticker-Chip,
keyMap erweitert.

## Block 3: Sektor-ETF-Holdings (Aggregator v5.12.2–5.12.4)

**10 EMEA-UCITS-xlsx committed** (data/holdings_XLK/XLF/XLE/XLV/XLI/XLY/XLP/XLU/XLC/XLB.xlsx)
Mapping: ZPDT=XLK, ZPDF=XLF, ZPDE=XLE, ZPDH=XLV, ZPDI=XLI,
         ZPDD=XLY, ZPDS=XLP, ZPDU=XLU, ZPDK=XLC, ZPDM=XLB

**Parser-Entwicklung (3 Iterationen):**
- v5.12.2: EMEA-Parser (openpyxl, Header Zeile 5, Name-Matching via IWV+MANUAL_MAP)
- v5.12.3: US-SSGA-Download deaktiviert (GHA erreicht ssga.com, aber US-Format
  hat CUSIP statt Security Name → 0 Matches)
- v5.12.4: SECTOR_ETF_LIST auf alle 10 ETFs erweitert (XLP/XLC/XLB fehlten)

**Run #125 verifiziert:** 10/10 ETFs ✅, 139/150 Holdings (93%)

**Monatliches Update:** Analog IWV-Holdings — neue xlsx von SSGA EMEA herunterladen
und als data/holdings_{ETF}.xlsx committen. Fällig: ~19.08.2026.

## Block 4: SUITE.md Grundgesetz 9

Debug-Protokoll-Regel seit v364 offen — heute eingetragen:
"IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene
Root Cause." Mit Herleitung (Ampel-Farb-Diskrepanz, 4 Fehlversuche).

---

## Infrastruktur-Stand (19.07.2026 Abend)

| Komponente | Version |
|---|---|
| axel-scanner (index.html) | v375 |
| ko-aggregator | v5.12.4 |
| ko-modules | unverändert |
| UIQ-Suite/SUITE.md | Grundgesetz 9 ergänzt |
| data/holdings_XL*.xlsx | 10 ETFs committed |
| Letzter verifizierter Run | #125 ✅ |

---

## Offene Punkte nächste Session

1. **scoreCollar visuell im Browser prüfen** — Collar/PP-Tab im Options-Deck
   (erst nach heutigem Nachtlauf mit BULL_QUIET-Scores sichtbar)
2. **Fading Short Edge-These** — wenn Axel Backtest liefert, Metriken vervollständigen
3. **XLC Match-Rate 73%** — 4 fehlende Holdings; bei Bedarf MANUAL_NAME_MAP erweitern
4. **IWV-Holdings-Update** — fällig Anfang August (letztes Update 02.07.2026)
5. **Optionsketten-Feed** — strategische Entscheidung offen

---

## Lauf-Protokoll heute (5 manuelle Runs)

| Run | Version | Ergebnis |
|---|---|---|
| #121 | 5.12.0 | scoreCollar funktioniert, Regime-Bug entdeckt |
| #122 | 5.12.1 | Regime-Bug gefixt, IWM=40 ✅ |
| #123 | 5.12.2 | sectorHoldings leer (US-Download falsches Format) |
| #124 | 5.12.3 | 7/10 ETFs ✅ (XLP/XLC/XLB nicht in Liste) |
| #125 | 5.12.4 | 10/10 ETFs ✅, 139/150 (93%) — FINAL ✅ |
