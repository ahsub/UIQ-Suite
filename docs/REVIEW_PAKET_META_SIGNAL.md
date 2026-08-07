# UIQ Meta-Signal-Architektur — Externer Review-Auftrag

## Kontext

Ich entwickle eine Trading-Intelligence-Plattform (UIQ) und habe in den letzten
24 Stunden eine neue Architektur konzipiert. Ich bitte um einen kritischen,
adversarialen Review — bitte NICHT bestätigen was gut ist, sondern aktiv suchen
was fehlt, falsch ist oder scheitern wird.

## Was reviewt werden soll

### Konzept 1 — Regime-History-Flag (implementiert)

Der MSE (Market State Engine) klassifiziert täglich das Marktregime aus VIX3M/VIX-Ratio:
- BULL_QUIET (Ratio ≥ 1.05, VIX ≤ 25)
- BULL_FRAGILE (Ratio ≥ 1.05, VIX > 25)
- POST_PANIC_REVERSION (Ratio 0.98–1.05)
- STRESS_UNSTABLE (Ratio < 0.98)

**Problem:** Der MSE ist zustandslos — zwei Tage mit gleichem Ratio=1.03 können
Erholung aus Stress (RECOVERING) oder Abschwächung aus Bull (DETERIORATING) sein,
bekommen aber identische Strategie-Gates.

**Lösung:** `calc_regime_history_flag()` aus 252T VIX-History:
```python
regime_context = {
    "current":       "POST_PANIC_REVERSION",
    "vector":        "RECOVERING",   # RECOVERING | DETERIORATING | STABLE | UNKNOWN
    "consecutive":   4,              # Tage im Regime
    "stressDaysAgo": 2,              # Tage seit letztem STRESS_UNSTABLE
    "ratioTrend":    "RISING",       # 5T Slope des VIX3M/VIX-Ratio
    "method":        "rule_based_v1" # ab Okt. 2026: "hmm_v1"
}
```

### Konzept 2 — Meta-Signal-Architektur (geplant)

5-dimensionaler Vektor für alle Marktanalyse-Ebenen:

```
Dimension 1 (Makro):    macroRegime      — HY-Spread, Net Liquidity, Zinsstruktur
Dimension 2 (Mikro):    mseRegime        — VIX-Termstruktur (täglich)
Dimension 3 (Vektor):   regimeContext    — Übergangsvektor (heute implementiert)
Dimension 4 (Breite):   breadthContext   — McClellan, Distribution Days, IOS-Score
Dimension 5 (Universum):universeContext  — RS-Rank-Median, VCP-Dichte, Score-Trend
                              ↓
                         metaSignal      — Konfidenz 0-100 + narrative Erklärung
```

**6 Makro-Regime:**
EXPANSION / LATE_CYCLE / STRESS_BUILDING / ACUTE_STRESS / RECOVERY / NEUTRAL_MACRO

**Meta-Signal-Beispiele:**
```
macroRegime=STRESS_BUILDING + mseRegime=BULL_QUIET + vector=STABLE
→ "Oberfläche trügt" — Gate-Reduktion auch bei ruhigem MSE

macroRegime=EXPANSION + mseRegime=BULL_FRAGILE + vector=RECOVERING
→ "Kurze Volatilitätsspitze im strukturellen Bull" — weniger defensiv
```

### Konzept 3 — Validierungsrahmen (konzipiert)

**Ebene 1:** Unterscheiden sich 10T-Forward-Returns je vector-Wert?
→ Welch-t-Test, p < 0.10, Mindest-n=20, ~01.10.2026

**Ebene 2:** Warnt macroRegime früher als MSE?
→ Lead-Time ≥ 5 Handelstage, False-Positive-Rate < 40%

**Ebene 3:** Ist das Meta-Signal kalibriert?
→ Brier Score < 0.25, Reliability Diagram

**Ebene 4:** HMM besser als regelbasiert?
→ A/B-Vergleich, 60 Tage je Gruppe, ab Oktober 2026

**Abbruchkriterium:** Februar 2027, wenn keine Ebene Zielwert erreicht.

### Datenbasis

- VIX/VIX3M/VVIX/SKEW: 252 Tage täglich (yfinance)
- HY-Spread: FRED BAMLH0A0HYM2, wöchentlich
- Net Liquidity: FRED (Fed BS - TGA - RRP), wöchentlich
- Track-Record läuft seit 02.07.2026 (~25 Handelstage bisher)
- Universum: ~700 Ticker (US Large/Mid Cap + DE)

## Review-Fragen

Bitte beantworte strukturiert:

1. **Methodische Fehler:** Was ist statistisch/mathematisch falsch oder problematisch?
2. **Fehlende Annahmen:** Was nehmen wir implizit an, ohne es zu validieren?
3. **Infrastruktur-Lücken:** Was braucht die Implementierung die wir nicht erwähnt haben?
4. **Alternativen:** Gibt es einfachere Ansätze die denselben Zweck erfüllen?
5. **Priorisierung:** Was davon ist wirklich wichtig, was ist nice-to-have?
6. **Showstopper:** Was könnte das gesamte Konzept zum Scheitern bringen?

Sei maximal kritisch. Bestätigungsbias ist hier nicht hilfreich.
