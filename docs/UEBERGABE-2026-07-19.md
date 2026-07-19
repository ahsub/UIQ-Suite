## PFLICHT-HEADER

Dieses Dokument beschreibt einen behaupteten Zustand — nicht eigenes Wissen.
Axel: "hast du das verifiziert oder übernommen?" bei jedem Zitat.

**Arbeitsregel (unwiderruflich):** Bei Laufzeit-Bugs IMMER Konsolen-Check
zuerst, dann Code anfassen.

---

# ÜBERGABEPROTOKOLL — 19.07.2026

## Versionsverlauf heute

| Version | Was |
|---|---|
| v374 | 4 Nomenklatur-/Konsistenz-Bugs aus visueller Verifikation |
| v375 | Options-Deck Collar-Tab + scoreCollar-Chip |
| Aggregator v5.12.0 | score_options_collar() — neue Scoring-Funktion |

---

## Session 1: Visuelle Verifikation + Nomenklatur-Fixes (v374)

4 Bugs aus Axels Screenshots identifiziert und gefixt:

### Bug 1 — Fading-Leaderboard öffnete Mean-Reversion-KI (KRITISCH)
- **Root Cause:** `_lbToStrat: short_fading: 'meanrev'` — falsches Mapping
  seit der Umbenennung, KoPrompts-Eintrag `fading_short` wurde nie aufgerufen
- **Fix:** `short_fading: 'fading_short'` (1 Zeichen geändert)

### Bug 2 — Fading-Tab-Label inkonsistent
- `🔝 Fading` → `🔝 Fading Short` (Taxonomie-Dokument v1.0)

### Bug 3 — KI-Briefing-Modal zeigte entfernte Strategien
- Dividend Growth + Value noch im Modal (seit v371 aus UIQ entfernt)
- VCP-Setup + Collar/PP fehlten
- Fix: beide entfernt, beide ergänzt — Modal zeigt jetzt nur aktive Strategien

### Bug 4 — Options-Desk KI-Buttons unvollständig + falsch beschriftet
- `Options-Wheel` → `🎯 CSP/Wheel`
- `Options ATM/NA` → `⚙️ CSP ATM/NA`
- Neuer `🛡️ Collar/PP`-Button ergänzt (greift auf KoPrompts.STRATEGIES.collar)
- Modal-Label-Mapping um collar erweitert

---

## Session 2: scoreCollar-Sprint (Aggregator v5.12.0 + Frontend v375)

### Aggregator v5.12.0 — market_aggregator.py
**Neue Funktion `score_options_collar(r: dict) -> int`:**
- Regime-Gate: BULL_FRAGILE → +50 (Prio-1, Regime-Coverage-Lücke), NEUTRAL → +20,
  STRESS_UNSTABLE/bear → return 0, BULL_QUIET → +5 (kein Edge)
- RSI > 75 → +30, > 65 → +20, > 55 → +10 (Überdehnung = Absicherungsbedarf)
- HVP 25-45 → +20 (ideal), 45-65 → +10, > 65 → -15 (Put zu teuer)
- dist200 > 20 → +10, > 10 → +5 (Gewinn zu schützen)
- ATR/Preis < 2% → +10, < 3.5% → +5, > 6% → -10 (Kosten-Proxy)
- Gate 1: price < ema200 → return 0 (keine Bestandsposition)
- Gate 2: hvp < 20 → return 0 (keine handelbare Prämie)

**Integration:**
- `s_collar = score_options_collar(r)` in der Options-Kandidaten-Schleife
- `"scoreCollar": s_collar` im Output-Dict
- `optsScore = max(s_csp, s_cc, s_spread, s_collar)` — Collar-Kandidaten
  tauchen jetzt auch in der Gesamt-Sortierung auf
- `apply_macro_risk_overlay()`: Collar +20% bei GEX < 0 (Absicherung bei Gamma-Flip)
- `apply_ios_market_overlay()`: Collar bewusst NICHT gedämpft bei "KAPITALSCHUTZ"
  (Absicherung ist in dieser Situation besonders sinnvoll)

**Wichtig:** scoreCollar ist erst nach dem nächsten Nachtlauf in den KV-Daten
verfügbar. Tagsüber noch 0 / nicht vorhanden.

### Frontend v375 — index.html
- Options-Deck Board: neuer Filter-Tab `Collar/PP` (`setOptionsSort('scoreCollar')`)
- `setOptionsSort` keyMap um `scoreCollar:'collar'` erweitert (Tab-Highlighting)
- Ticker-Chip: `Collar <b>XX</b>` neben CSP/CC/Spread wenn scoreCollar > 0

---

## Offene Punkte / Nächste Session

1. **scoreCollar visuell verifizieren** — erst nach Nachtlauf (Aggregator v5.12.0
   läuft nächste Nacht, dann Collar/PP-Tab prüfen)
2. **SUITE.md Debug-Protokoll-Regel** — "Konsolen-Check zuerst" noch nicht
   eingetragen (seit v364 offen)
3. **Fading Short Edge-These** — wenn Axel Backtest-Grundlage liefert,
   Metriken vervollständigen
4. **Optionsketten-Feed strategisch** — würde Collar (echte Strikes statt ATR-Proxy),
   Vertical Spreads und 4 CSP-Strategien verbessern; eigener Sprint-Entscheid

---

## Infrastruktur-Stand (19.07.2026)

| Komponente | Version |
|---|---|
| axel-scanner (index.html) | v375 |
| ko-aggregator (market_aggregator.py) | v5.12.0 |
| ko-modules | unverändert |
| Nächster Aggregator-Nachtlauf | ~00:00 MEZ → scoreCollar befüllt |
