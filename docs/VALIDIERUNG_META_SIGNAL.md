# UIQ — Validierungsrahmen Meta-Signal-Architektur

**Version:** 1.0
**Stand:** 07.08.2026
**Ablage:** `ahsub/UIQ-Suite/docs/VALIDIERUNG_META_SIGNAL.md`
**Kontext:** Backlog №29 (Regime-History-Flag), №30 (Meta-Signal-Architektur), ML_KONZEPT.md §3b

---

## 1. Warum Validierung jetzt konzipieren?

Der Meta-Signal-Ansatz (5 Dimensionen: Makro / Mikro / Vektor / Breite / Universum)
ist ohne Validierungsrahmen nicht falsifizierbar — und damit wertlos. Die Fragen die
wir beantworten müssen:

1. **Ist der Übergangsvektor (regimeContext) besser als kein Vektor?**
   → Erzeugen RECOVERING/DETERIORATING/STABLE statistisch unterschiedliche Forward-Returns?

2. **Verbessert macroRegime die Gate-Qualität?**
   → Reduziert `macroRegime=STRESS_BUILDING` die Drawdowns, auch wenn mseRegime noch ruhig ist?

3. **Ist das Meta-Signal kalibriert?**
   → Wenn metaSignal.confidence=80, gewinnen ~80% der Positionen innerhalb des Zeithorizonts?

4. **Ist die Sequenz Regelbasiert → HMM besser?**
   → Verbessert der HMM-Vektor (Phase 2) die Brier Scores gegenüber rule_based_v1?

---

## 2. Validierungsebenen

### Ebene 1 — Regime-History-Flag (Backlog №29, sofort messbar)

**Was wird gemessen:** Unterscheiden sich Forward-Returns je nach `vector`-Wert?

**Metrik:** Mittlerer 10T-Forward-Return der Shortlist je vector-Wert
```
vector=RECOVERING:    E[R_10T] = ?  (Hypothese: positiv, höher als STABLE)
vector=DETERIORATING: E[R_10T] = ?  (Hypothese: negativ oder niedriger)
vector=STABLE:        E[R_10T] = ?  (Hypothese: neutral, nahe Marktrendite)
```

**Datenquelle:** Track-Record (tr:snap:* KV-Keys) — Empfehlung + 10T-Forward-Return
**Mindest-n:** 20 je vector-Kategorie (~01.10.2026 bei täglichem Betrieb)
**Test:** Welch-t-Test (ungleiche Varianzen) zwischen RECOVERING und DETERIORATING
**Schwellwert:** p < 0.10 gilt als schwacher Beleg, p < 0.05 als Beleg

**Messung täglich ab sofort:** `regimeContext.vector` wird mit jedem tr:snap gespeichert
→ beim Evaluation-Run (tr_layer.run_evaluation) Forward-Return je vector-Gruppe ermitteln.

---

### Ebene 2 — Makro-Regime-Kontext (Backlog №30, ab Implementation)

**Was wird gemessen:** Senkt `macroRegime=STRESS_BUILDING` den Max-Drawdown,
auch wenn mseRegime noch BULL_QUIET ist?

**Metrik A — Drawdown-Reduktion:**
```
Kohorte A: macroRegime=STRESS_BUILDING + mseRegime=BULL_QUIET
           → Erwartung: höherer Drawdown als Gate-Modell suggeriert
Kohorte B: macroRegime=EXPANSION + mseRegime=BULL_QUIET
           → Baseline: normaler Drawdown für BULL_QUIET
Vergleich: Mann-Whitney-U-Test auf Max-Drawdown-Verteilungen
```

**Metrik B — Frühwarnwert (Lead-Time):**
```
Wie viele Tage BEVOR mseRegime auf STRESS_UNSTABLE wechselt,
zeigt macroRegime=STRESS_BUILDING bereits?
Erwartung: 5–15 Handelstage Vorsprung (strukturelle Makro-Signale reagieren langsamer)
```

**Metrik C — False-Positive-Rate:**
```
Wie oft zeigt macroRegime=STRESS_BUILDING, ohne dass anschließend
eine Korrektur > 5% eintritt? (innerhalb 20T)
Zielwert: False-Positive-Rate < 40%
```

**Datenquelle:** KV-History (macroRegime täglich gespeichert) + SPY-Returns via yfinance
**Mindest-n:** 10 STRESS_BUILDING-Episoden (~6–12 Monate Betrieb, Marktzyklusabhängig)

---

### Ebene 3 — Meta-Signal-Kalibrierung (Brier Score, analog DCE)

**Was wird gemessen:** Ist metaSignal.confidence kalibriert?
Wenn confidence=70, sollten ~70% der Positionen im Zeithorizont positiv sein.

**Metrik — Brier Score:**
```python
# Analog compute_brier_score() in dce_layer.py
BS = (1/N) * Σ (confidence_i/100 - outcome_i)²

# outcome_i = 1 wenn Forward-Return(10T) > 0, sonst 0
# Zielwert: BS < 0.25 (gut), < 0.33 (akzeptabel), ≥ 0.33 (neu kalibrieren)
```

**Kalibrierungskurve (Reliability Diagram):**
```
Confidence-Bucket  Ø Realized Hit-Rate  n
60–70%             ?                    ?
70–80%             ?                    ?
80–90%             ?                    ?
> 90%              ?                    ?
Ideallinie: Bucket-Mitte = Realized Hit-Rate (perfekte Kalibrierung)
```

**Vergleichs-Baseline:** DCE-Brier-Score (bereits berechnet ab ~01.09.2026)
Meta-Signal muss DCE-Brier verbessern oder gleichen — sonst bringt die
zusätzliche Komplexität keinen Mehrwert.

---

### Ebene 4 — Regel-basiert vs. HMM (ab Oktober 2026)

**Was wird gemessen:** Verbessert der HMM-Vektor (`method="hmm_v1"`)
die Metriken aus Ebenen 1–3 gegenüber `method="rule_based_v1"`?

**A/B-Vergleich:**
```
Gruppe A: regimeContext.method="rule_based_v1" (Sept/Okt. 2026)
Gruppe B: regimeContext.method="hmm_v1"        (ab Okt. 2026)
Metrik: Brier Score, Drawdown, Lead-Time (identische Metriken wie oben)
Mindest-Laufzeit: 60 Tage je Gruppe für stabilen Vergleich
```

**HMM-interne Metriken:**
```
Log-Likelihood (hmmlearn): steigt mit besserem Modell
Viterbi-Konsistenz: wie oft ändert das HMM seinen State-Pfad bei neuem Tag?
  → hohe Konsistenz = stabiles Modell
Emissions-Überlappung: wie gut trennen die 4 Gaußians die Regime?
  → niedrige Überlappung = unterscheidbare Zustände
```

---

## 3. Validierungs-Infrastruktur

### Was jetzt sofort implementiert werden muss

**3.1 — regimeContext in tr:snap speichern**
Damit Forward-Return je vector-Kategorie messbar wird (Ebene 1):
```python
# in tr_layer.run_snapshot() — zusätzliches Feld
snap["regimeContext"] = regime_context  # aus market_aggregator.calc_regime_history_flag()
```
→ **Sofort: nächster GHA-Run nach v5.29.0**

**3.2 — macroRegime in KV-History (rolling 252T)**
Eigener KV-Key `macro:history` — täglich appended, älteste Einträge raus:
```json
{
  "date": "2026-08-08",
  "macroRegime": "EXPANSION",
  "macroVector": {"hy_trend": "STABLE", "nl_trend": "EXPANDING", ...},
  "mseRegime": "BULL_QUIET",
  "regimeContext": {"vector": "STABLE", "consecutive": 12}
}
```
→ **Bei Implementierung von calc_macro_regime_context()**

**3.3 — Validierungs-Modul `val_layer.py`**
Eigene Datei analog `tr_layer.py`:
```python
# val_layer.py — Validierungs-Layer für Meta-Signal-Architektur
def run_validation(kv_history: list, forward_returns: dict) -> dict:
    """
    Berechnet alle Metriken aus Ebenen 1–3.
    Läuft wöchentlich (nicht täglich — braucht Forward-Returns).
    Output: master['validation'] im KV-Store
    """
    results = {}
    results['regime_vector_returns'] = _calc_vector_returns(kv_history, forward_returns)
    results['brier_score']           = _calc_brier(kv_history, forward_returns)
    results['macro_lead_time']       = _calc_macro_lead_time(kv_history)
    results['false_positive_rate']   = _calc_fpr(kv_history, forward_returns)
    results['calibration_curve']     = _calc_calibration_curve(kv_history, forward_returns)
    return results
```
→ **Bei Mindest-n=20 (ca. 01.10.2026)**

---

## 4. Entscheidungsmatrix — wann weiter, wann stopp?

| Metrik | Zielwert | Wenn verfehlt |
|---|---|---|
| Vector-Return-Unterschied (Ebene 1) | p < 0.10, Δ > 0.5% | vector-Logik überarbeiten |
| Makro-Lead-Time (Ebene 2) | ≥ 5 Handelstage | macroRegime-Grenzen anpassen |
| False-Positive-Rate (Ebene 2) | < 40% | STRESS_BUILDING-Schwellen erhöhen |
| Brier Score Meta-Signal (Ebene 3) | < 0.25 | Dimensions-Gewichte neu kalibrieren |
| Brier Score vs. DCE-Baseline | ≤ DCE-Brier | Meta-Signal vereinfachen |
| HMM vs. Regelbasiert (Ebene 4) | Brier-Verbesserung > 0.02 | Bei rule_based_v1 bleiben |

**Abbruchkriterium:** Wenn nach 6 Monaten Betrieb (Februar 2027) keine der
Ebenen 1–3 den Zielwert erreicht, wird die Meta-Signal-Architektur auf
macroRegime + regimeContext reduziert (Komplexität nicht gerechtfertigt).

---

## 5. Zeitplan

| Wann | Meilenstein |
|---|---|
| 08.08.2026 | regimeContext in tr:snap (sofort nach v5.29.0) |
| ~01.09.2026 | Mindest-n=20 für Ebene 1 erreichbar |
| ~01.09.2026 | DCE-Brier-Score als Baseline verfügbar |
| ~01.10.2026 | val_layer.py implementieren, Ebene-1-Auswertung |
| ~01.10.2026 | HMM startet (method="hmm_v1") — A/B-Vergleich beginnt |
| ~01.12.2026 | Ebene-2-Auswertung (10 STRESS_BUILDING-Episoden nötig) |
| ~01.02.2027 | Ebene-3+4-Auswertung + Go/No-Go Meta-Signal |

---

## 6. Beziehung zu bestehenden Validierungen

| Bestehend | Neu | Verhältnis |
|---|---|---|
| DCE Brier Score (`dce_layer.py`) | Meta-Signal Brier Score | Baseline vs. Erweiterung |
| Track-Record (`tr_layer.py`) | Vector-Return-Analyse | Datenbasis für Ebene 1 |
| DCE Unit Tests (`test_dce_layer.py`) | val_layer Unit Tests | Analoges Testmuster |
| regimeConfidence (Backlog №21) | macroRegime + metaSignal | Subsignal vs. Komposition |

---

*UIQ Validierungsrahmen Meta-Signal-Architektur v1.0 — 07.08.2026*
*Kontext: Backlog №29 (Regime-History-Flag) + №30 (Meta-Signal)*
*Nächster Schritt: regimeContext in tr:snap speichern (v5.30.0)*
