# UIQ ÜBERGABE — 2026-07-21
*Erstellt: 21.07.2026, ~16:00 UTC | Session-Dauer: ~9h | Version bei Abschluss: v390*

> ⚠️ ÜBERGABE-PROTOKOLL-PFLICHT: Alle Angaben gelten als UNVERIFIED bis zur expliziten Browser-Verifikation. Claude hat keinen direkten Zugriff auf Live-UIQ.

---

## AKTIVER PAT
`ghp_***SESSION-PAT-REDACTED***`
Scope: repo (7 Tage), nach Session löschen.

---

## SESSION-ZUSAMMENFASSUNG

Heute war eine der produktivsten Sessions. Drei vollständige Sprints:

1. **MCM-Parität Sprint** (Aggregator v5.13.0 + ko-indicators-loader v1.3.2)
2. **ko-prompts-registry Sprint** (ko-prompts.js v2.1.x, index.html v387-v390)
3. **Breakout-Leaderboard + Trendfolge-Qualität** (Aggregator v5.14.0-v5.15.0)

---

## BLOCK 1: MCM-PARITÄT (ABGESCHLOSSEN ✅)

### Was deployed wurde

**ko-aggregator v5.13.0** (Commit `2e0c895e`):
- 4 neue Python-Funktionen: `calc_mcm_ndx_breadth()`, `calc_mcm_intermarket_score()`, `calc_mcm_treasury_stress()`, `calc_mcm_bull_indicator()`
- `build_server_market_context()` ruft jetzt alle 9 MCM-Faktoren auf (vorher 5)
- `hist_data` via `master["_hist_data"]` injiziert (kein Signatur-Eingriff in `generate_daily_snapshot()`)
- Unit-Tests alle grün: ndx_breadth 66.7%, treasury_stress 0/55, bull_indicator 71, intermarket_score 9

**ko-indicators-loader.js v1.3.2** (Commit `4de8824`):
- **Bugfix parseFloat x/100**: DOM-Elemente `#intermarket-score` + `#bull-score` schrieben `'55/100'` → Regex produzierte `55100` → fälschliche RISK-Klassifizierung → 3 Phantom-Downgrades (momentum/vcp/swing amber→red). Fix: `.split('/')[0]` vor Regex.

**axel-scanner v386** (Commit `f82e4f0b`):
- CDN-Hash ko-indicators-loader aktualisiert

### Verifikation
- Run #130 (04:35 UTC, nach Deploy): `marketContext.factors` zeigt 9 Faktoren ✅
- Live-Ampel nach v386: momentum/vcp/swing jetzt korrekt amber statt rot ✅
- Residuale Rot-Ampeln (ko, breakout): korrekt — bull_indicator=34 (caution) + ndx_breadth=43% (caution) = zweiter Downgrade ✅

---

## BLOCK 2: KIMI-ANALYSE-REFLEXION (DOKUMENTIERT)

KIMI (externes LLM) analysierte UIQ-index.html und produzierte TypeScript-Refactoring-Proposal (`McmStore.ts` v2.0).

**Bewertung:**
- Architektur-Voraussetzungen falsch (setzt React/Vite voraus — UIQ ist Single-HTML-File)
- Datenhalluzinationen: McClellan, NYSE A/D, AAII, VIX9D nicht in UIQ verfügbar
- Overkill für Phase-0-Ziel (Circuit Breaker, Flash-Crash-Detection = Phase-3-Features)
- **3 destillierbare echte Backlog-Items → SUITE.md v3.0 eingetragen:**
  - Backlog #20: `dataQuality`-Flag — Post-Phase-0.5
  - Backlog #21: `regimeConfidence` — Phase-1-Einstieg (~September)
  - Backlog #22: `sizingMultiplier` in Ampel — Phase-1-Einstieg (~September)
- Backlog #17 (MCM-Parität) als ✅ ERLEDIGT markiert

---

## BLOCK 3: ko-prompts-registry SPRINT (ABGESCHLOSSEN ✅)

**ko-prompts.js v2.1.2** (Commit `012a89f`):

*Strukturelle Änderungen:*
- `getSystemPrompt(context, eic)` NEU — Public/EIC-Split aus index.html externalisiert
- `getMorningPrompt(lines, eic, dixReal)` NEU — MB-Prompt + STRATEGIE_MATRIX aus index.html externalisiert (~87 Inline-Zeilen entfernt)
- STRATEGIE_MATRIX auf kanonische 12 UIQ-Strategien bereinigt

*Strategie-Korrekturen:*
- `options` → `csp_wheel` (Umbenennung, Konsistenz mit STRATEGY_ORDER)
- `ludwig` → `atmna` (überfälliger P1-Rename)
- `cc` (Covered Call) NEU geschrieben
- `breakout`: Scope-Klarstellung (Swing/Tagesschluss, NICHT Intraday Gap&Go)
- `momentum`: Pullback-Timing-Tipp ergänzt (EMA50-Rücksetzer als profitablerer Einstieg)
- STRATEGIE_MATRIX: Breakout + VCP + CC ergänzt, Breakdown Short + Tail-Risk-Hedge entfernt
- Collar: kein STRATEGIE_MATRIX-Eintrag (kein Positions-Kontext in UIQ → Options-Doktor)
- `fading_short`: jetzt auch Prompt vorhanden (für Notfälle)

*Bugfixes in index.html:*
- `_lbToStrat`: `options_csp` → `csp_wheel`, `options_cc` → `cc` (Prompts wurden nie aufgerufen — null)
- KI-Modal-Strategie-Liste: STRATEGY_ORDER-konform neu sortiert, `cc` ergänzt
- `getKiSystemPrompt()` + `getMorningBriefingPrompt()` → dünne Wrapper auf KoPrompts

**axel-scanner v387-v390** (Commits `863c80ca`, `0fc50c4a`, `1c1ab93b`, `4efa25ca`)

### Verifikation
- v387 MB mit neuen Prompts läuft korrekt ✅ (Screenshot 14:31 Uhr)
- Covered Call 🟢 in Live-Ampel und Tearsheet ✅
- KI-Text kongruent mit Live-Ampel ✅

---

## BLOCK 4: BREAKOUT-LEADERBOARD + TRENDFOLGE-QUALITÄT (ABGESCHLOSSEN ✅, NACHTLAUF AUSSTEHEND)

**ko-aggregator v5.14.0** (Commit `cba0e6af`):
- `score_long_breakout(r)` NEU: Stage-2-Gate + 52W-Hoch-Nähe (≤5% = 30 Pts, ≤10% = 18, ≤15% = 8, sonst 0) + volRatio + OBV + MACD + RS-Rating, Mindest-Score 40
- `long_breakout` Leaderboard in Aggregator-Pipeline
- `sBreakout` in scored-Dict + r-Transfer

**ko-aggregator v5.15.0** (Commit `06c9da41`):
- `avgVol20` (20-Tage-Durchschnittsvolumen absolut) berechnet und in r-Dict gespeichert
- Liquiditäts-Soft-Gate in `score_long_minervini()`: <500k/Tag = -20 Pts, <250k = -35 Pts
- Liquiditäts-Soft-Gate in `score_long_breakout()`: <500k = -15 Pts, <250k = -25 Pts
- Rationale: Trendfolge braucht institutionelle Beteiligung (>1M/Tag ideal, 500k Minimum)

**axel-scanner v388** (Commit `0fc50c4a`):
- Tab "🚀 Breakout" in Alpha Desk Leaderboard-Leiste (data-lb="long_breakout")
- `_lbToStrat` Bugfixes: `options_csp`→`csp_wheel`, `options_cc`→`cc`, `long_breakout`→`breakout` NEU

### Noch ausstehend
- **Nachtlauf**: Erstes `long_breakout`-Leaderboard wird heute Nacht (04:xx UTC) befüllt
- Verifikation: Tab anklicken → zeigt Breakout-Kandidaten?
- Verifikation: `avgVol20` in Leaderboard-Chips sichtbar?

---

## OFFENE PUNKTE / NÄCHSTE SESSION

### P1 (sofort beim nächsten Start)
- **Breakout-Leaderboard verifizieren** nach Nachtlauf: Tab klicken, Kandidaten vorhanden?
- **Datenlücken Alpha Desk Prompts**: KI sagt "MACD/OBV/volRatio fehlen" — aber Felder sind im scored-Dict vorhanden. Root Cause: `runAlphaLbKI()` baut den Messwert-String, der diese Felder nicht übergibt. Analyse der Prompt-String-Konstruktion in `runAlphaLbKI()` steht noch aus.

### P2 (diese Woche)
- IWV_holdings.csv Update fällig (letzte Aktualisierung 02.07.2026, Monatspflicht)
- NYSE-Lauf Verifikation: Nach 13:30 UTC `daily_market_snapshot_us` im KV vorhanden?

### Backlog (nach Phase 0)
- #20 dataQuality-Flag, #21 regimeConfidence, #22 sizingMultiplier → alle September

---

## WICHTIGE CDN-HASHES (aktuell)
```
ko-indicators-loader.js  → ko-modules@4de8824
ko-prompts.js            → ko-modules@012a89f   (v2.1.2)
ko-market-state.js       → (unverändert, prüfen)
ko-indicators.js         → (unverändert, prüfen)
```

## VERSIONS-STAND
```
axel-scanner (index.html):  v390
ko-aggregator:              v5.15.0 (Commit 06c9da41)
ko-prompts.js:              v2.1.2  (Commit 012a89f)
ko-indicators-loader.js:    v1.3.2  (Commit 4de8824)
SUITE.md:                   v3.0    (Commit 40bc7c96)
```

---

## STEHENDE REGELN (Erinnerung)
- IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
- Hast du das verifiziert oder übernommen? (bei Angaben aus Übergabeprotokoll)
- PAT nach Session löschen: Einstellungen → Developer Settings → Personal access tokens
- IWV-Update: erste August-Session nicht vergessen


---

## BLOCK 5: KIMI SCORING-ANALYSE — DESTILLAT (Nachtrag, ~17:00 UTC)

KIMI analysierte UIQ-Scoring-System vollständig. Ausführliche Analyse mit Pseudocode und mathematischen Formulierungen (Bayes'scher Update-Mechanismus, Regime-Modifikatoren, VCP-Completeness-Index).

### Sofort verwertbar (P0 für nächste Session)

**1. CC-Scoring von CSP differenzieren** — echter Design-Fehler, beide Strategien nutzen aktuell `score_options_covered_call()` mit identischer Logik. KIMI-Analyse bestätigt: fundamental verschiedene Risikoprofile.

CC-spezifische Anpassungen (Pseudocode bereit):
- RSI-Optimum: 60-75 statt 45-55 (CC toleriert moderate Überhitzung, CSP will Überverkauf)
- HVP Sweet Spot: 40-75 statt 30-65 (CC profitiert von etwas höherer IV)
- Fib-Logik: RETRACEMENT bevorzugen (Bestandsmanagement), nicht EXTENSION (Einstieg)
- Neues Gate: Kurs 0.95-1.15 × EMA50 (CC braucht weder Crash noch Explosion)
- Regime: Side +25 > Bull +20 (Seitwärts = idealer CC-Kontext)

**2. VCP: Volumen-Contraction speichern** — heute durch Alpha-Desk-Tests bestätigt (KI sagt "MACD/Volumen fehlen"). KIMI-Analyse: VCP ohne Volumen-Bestätigung ist "nur ein schönes Chartbild".

Konkrete Ergänzungen in `calc_vcp()`:
- `vcpVolContraction`: Volumen während letzter Contraction / 20T-Durchschnitt (<0.6 = stark getrocknet → +15 Pts)
- `vcpBreakoutVol`: volRatio am letzten Bar (>2.0× = bestätigt → +15 Pts, >1.5× → +10, >1.2× → +5)
- Neue Maximalpunktzahl ~125 → Score bleibt auf 100 skaliert, LB-Schwelle prüfen

**3. Breakout: Tightness-Metrik** (P1, nach Backlog-Review):
- %Range der letzten 5-10 Tage < 3-5% = Mark Minervinis "Tightness"-Konzept
- Berechenbar aus vorhandenen `high/low`-Zeitreihen in `calc_vcp()`
- Ziel: +10 Pts für enge Konsolidierung vor Ausbruch

### Für späteren Zeitpunkt (nicht jetzt)

- Regime-abhängige Gate-Toleranzen → nach 60 Tagen Track Record (September)
- Meta-Layer Konvergenz-Scoring → Phase 3
- Bayes'scher Update-Mechanismus → frühestens nach 100 abgeschlossenen Trades mit Exit-Datum + Return-%

### Track-Record-Voraussetzung für Bayes

Track-Record-Layer (läuft seit 02.07.2026) muss für Bayes später folgende Felder pro Trade enthalten:
- `exit_date` (noch nicht implementiert — nur Entry-Snapshot)
- `return_pct` (berechnet aus Entry/Exit)
- `active_metrics_at_entry` (welche Score-Gates waren beim Entry erfüllt)

Das ist eine Backlog-Aufgabe für Phase 1 / September.

