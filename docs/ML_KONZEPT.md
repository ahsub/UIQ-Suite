# ML_KONZEPT.md — Maschinelles Lernen als Signal-Kalibrierung in UIQ

**Version:** 1.0  
**Datum:** August 2026  
**Status:** Konzept — Implementierung phasenweise ab September 2026  
**Verantwortlich:** Dr. Axel Hildebrand  

---

## 1. Leitprinzip: UIQ als Decision Support System

UIQ ist keine Aktien-Software. UIQ ist ein **Decision Support System (DSS) für rationale Investitionsentscheidungen**.

Die vollständige DSS-Kette:

```
MARKT
  ↓
Decision Engine          ← BN + HMM setzen hier an
  ↓
Strategie-Auswahl        ← Regime-Prior aus HMM fließt hier ein
  ↓
Anlegerprofil
  ↓
Opportunity Engine
  ↓
Trade Assistant
  ↓
Positionsmanagement
  ↓
Lernen & Optimieren      ← NN (selektiv) setzt hier an
```

**Die Filterregel für jede neue Idee:**

> Wenn eine neue Methode, ein neues Feature oder ein neuer Indikator keinen expliziten Platz in dieser DSS-Kette findet — kommt sie nicht ins Produkt, oder muss heraus.

UIQ wird nicht besser durch mehr Metriken. UIQ wird besser, wenn die Entscheidungsqualität steigt bei gleichzeitig reduzierter Komplexität. Das ist das eigentliche Optimierungsziel.

---

## 2. Das Kernproblem: Signal-Redundanz

UIQ berechnet derzeit ~30 Felder pro Ticker. Diese werden in Score-Funktionen additiv kombiniert. Das impliziert eine Annahme, die fast sicher falsch ist:

**Alle Felder liefern unabhängige Informationen.**

Tatsächlich bestehen starke Abhängigkeiten:

| Abhängigkeit | Problem |
|---|---|
| `trendScore` enthält ADX intern | `adx`-Feld liefert redundante Information |
| `confluenceScore` enthält `trendScore` | doppelte Gewichtung des EMA-Stacks |
| `rsScore` korreliert mit `pctFromHigh52` in Trends | beide messen dasselbe Phänomen |
| `chopIndex` und `efficiencyRatio` sind invers korreliert | einer ist ausreichend |
| `hvp` und `atr` messen verwandte Volatilitätsdimensionen | im selben Score doppelt gewichtet |

**Konsequenz:** Additive Score-Funktionen überschätzen die Evidenz, wenn Signale korreliert sind. Ein Titel mit hohem `trendScore` UND hohem `rsScore` UND hohem `pctFromHigh52` wird dreifach für dasselbe Merkmal belohnt.

Das Bayesian Network löst dieses Problem strukturell.

---

## 3. Methoden-Überblick: Stärken und UIQ-Rolle

### 3.1 Bayesian Networks (BN) — "Ursachen-Detektive"

**Was BNs leisten:**
- Modellieren kausale Abhängigkeiten zwischen Variablen explizit
- Zeigen, welche Felder bedingt unabhängig sind (und damit echte Zusatzinformation liefern)
- Erlauben Inferenz: "Wenn RSI > 70 UND ADX < 20 — wie hoch ist P(Breakdown in 10 Tagen)?"

**UIQ-Rolle: Decision Engine — Kalibrierung**

BN wird *nicht* als Produktions-Runtime eingesetzt. Es ist ein einmaliges (später periodisches) Analyse-Tool:

1. Snapshot-Daten einlesen (711 Ticker × ~30 Felder)
2. DAG (Directed Acyclic Graph) der Feldabhängigkeiten lernen
3. Redundante Felder identifizieren → aus Score-Funktionen entfernen oder zusammenfassen
4. Verbleibende unabhängige Signale neu gewichten

**Erwartetes Ergebnis:** Reduktion von ~30 auf 12–15 wirklich unabhängige Signale. Bessere Scores durch Entkorrelierung.

**Tools:** `pgmpy` (Python), offline als Jupyter Notebook. Kein Produktionscode.

---

### 3.2 Hidden Markov Models (HMM) — "Phasen-Wechsler"

**Was HMMs leisten:**
- Schätzen latente (nicht direkt beobachtbare) Zustände aus beobachteten Sequenzen
- Unterscheiden sich vom Markov-Automat: HMM lernt die Zustände aus Daten, statt sie regelbasiert zu definieren
- Geben Wahrscheinlichkeitsverteilungen über Zustände zurück, nicht nur einen Zustand

**UIQ besteht bereits aus:**
- Ticker-spezifischer Markov (4 Regime, regelbasiert auf Close-Preisen)
- `tvaRegime` (8 Regime, regelbasiert auf ADX+ER+BB)

**Was HMM ergänzt — Markt-Makrozustand:**

Ein HMM auf *Markt-Querschnittsdaten* (MCM-Zeitreihen: VIX, HY-Spread, Net Liquidity, Move Index, SKEW) schätzt den **latenten globalen Marktzustand** — unabhängig von Einzel-Tickers.

Dieser Makrozustand ist ein Prior für die Strategie-Auswahl:
- Latenter Zustand "Risk-Off" → Defensive-Strategien bevorzugen, Sizing reduzieren
- Latenter Zustand "Expansion" → Momentum-Strategien bevorzugen
- Latenter Zustand "Transition" → Abwarten, reduzierte Positionsgrößen

**UIQ-Rolle: Decision Engine → Strategie-Auswahl**

Output: neues MCM-Feld `mcmHmmRegime` (Wahrscheinlichkeitsvektor über 3–4 Zustände).

**Tools:** `hmmlearn` (leichtgewichtig, keine GPU, läuft im GHA-Workflow).

---

### 3.3 Kleine Neuronale Netze (NN) — "Muster-Erkenner"

**Warum mit Vorsicht:**
- Overfitting-Risiko bei kleinen Datensätzen (UIQ hat erst ~32 Handelstage History)
- Fehlende Interpretierbarkeit — widerspricht dem DSS-Prinzip ("Was hat zu dieser Entscheidung geführt?")
- Dynamische Märkte: Regime-Wechsel invalidieren trainierte Gewichte ohne Warnung

**Der einzig sinnvolle UIQ-Use-Case:**

Nicht Preisprognose. Nicht Score-Berechnung. Sondern:

**Regime-Transition-Timing:** Ein kleines LSTM erkennt, wenn sich der MCM-HMM-Zustand (Phase 2) zu ändern beginnt — 1–3 Tage früher als der regelbasierte Markov. Trainiert auf den Regime-Labels aus Phase 2, nicht auf Returns.

Architektur wenn implementiert:
```
Input:  MCM-Zeitreihen (letzte 20 Tage × 6 Features)
Layer:  LSTM(32) → Dense(16, ReLU) → Dense(4, Softmax)
Output: P(Regime_0..3) für nächsten Tag
```

**UIQ-Rolle: Lernen & Optimieren** (letzter Schritt in der DSS-Kette)

**Go-Bedingung:** Nur wenn Phase 2 (HMM) nach 60 Tagen Live-Betrieb nachweisbare Timing-Lücken zeigt.

---

## 4. Umsetzungsplan

### Phase 1 — BN-Analyse (September 2026)

**Voraussetzung:** ~60 Snapshot-Tage (ca. 01.09.2026)  
**Aufwand:** 1–2 Sessions, kein Produktionscode  
**Deliverable:** `docs/BN_ANALYSE_2026-09.md` mit Redundanz-Report + neuen Score-Gewichtungen  

```
Schritt 1: Snapshot-Aggregation
  data/snapshots/*.json.gz → pandas DataFrame (711 Ticker × 30 Felder × N Tage)
  
Schritt 2: Korrelationsmatrix
  Identifikation stark korrelierter Paare (|r| > 0.7)
  
Schritt 3: DAG-Lernen
  pgmpy HillClimbSearch + BicScore
  → welche Felder sind bedingt unabhängig vom Score-Output?
  
Schritt 4: Redundanz-Entscheidung
  Pro redundantes Feld: entfernen / zusammenfassen / Gewicht halbieren
  
Schritt 5: Score-Rekalibrierung
  Neue Gewichtungen in confluenceScore + score_long_minervini
```

### Phase 2 — MCM-HMM (Oktober 2026)

**Voraussetzung:** ≥90 Tage MCM-Zeitreihen (3–5 Regime-Zyklen nötig)  
**Aufwand:** 1 Sprint (~2 Sessions)  
**Deliverable:** `mcmHmmRegime` als neues KV-Feld im Market-Snapshot  

```python
# Technisches Konzept
from hmmlearn.hmm import GaussianHMM

# Features: VIX, HY-Spread, Net Liquidity (normiert), Move Index, SKEW
X = mcm_timeseries_matrix  # shape: (N_tage, 5)

model = GaussianHMM(n_components=4, covariance_type="full", n_iter=100)
model.fit(X)

# Im GHA-Workflow täglich:
regime_probs = model.predict_proba(X[-1:])  # P(state_0..3) für heute
```

Integration: neuer Block in `market_aggregator.py` parallel zu `_calc_markov_regime()`.

### Phase 3 — Selektives NN (frühestens Q1 2027)

**Go/No-Go:** Explizite Entscheidung nach 60 Tagen Phase-2-Betrieb  
**Bedingung:** HMM zeigt messbares Regime-Timing-Problem  
**Architektur:** LSTM(32) → Dense(16) → Dense(4, Softmax), Training auf HMM-Labels  
**Anti-Overfitting:** Walk-Forward-Validation, max. 6 Monate Trainingsset rollierend  

---

## 4b. DCE — Interface-Definition und Pseudocode

> *Externe Validierung (August 2026): "Die DCE ist bei Ihnen nicht nur ein weiteres Modell, sondern die Meta-Instanz."*

### Terminologie-Klarstellung

**MCM** in UIQ = **Market Context Module** (Daten-Aggregations-Schicht: VIX, HY-Spread, Net Liquidity, Move Index, SKEW).  
**MCM** ≠ **MCMC** (Markov Chain Monte Carlo — das ist eine Sampling-Methode in PyMC).  
Das MCM-HMM ist: Market-Context-Daten als Input → Hidden Markov Model als Regime-Detektor.

### DCE als Schaltzentrale

Die DCE nimmt die Outputs aller drei Phasen entgegen und produziert einen einzigen operativen Entscheid:

```
Phase 1 (BN)  ──→ P(Marktanstieg)        ──→
Phase 2 (HMM) ──→ P(Regime_0..3)         ──→  DCE  ──→ confidence_score (0-1)
Phase 3 (NN)  ──→ Regime-Transition-P    ──→         ──→ mode (GREEN/YELLOW/RED)
CUSUM-Alarm   ──→ Strukturbruch-Flag     ──→         ──→ position_size (0.0-1.0)
EVT-VaR       ──→ Extremrisiko-Schätzung ──→         ──→ direction (BUY/HOLD/SELL)
```

Die Methode `_calculate_confidence()` ist der Kern — hier laufen alle Signale zusammen:
- **Konsistenz** der Modell-Outputs (hohe Streuung → niedrigeres Vertrauen)
- **Sicherheitsabzüge** bei CUSUM-Alarm und hohem VaR
- **Regime-Anpassung** (Crash-Modus: alle Modelle gedämpft)
- **Discounting** (Sekerke): ältere Daten werden automatisch abgewertet

### Pseudocode (Python, UIQ-adaptiert)

```python
import numpy as np
import pandas as pd
from scipy.stats import genpareto
# Phase 2: from hmmlearn import hmm
# Phase 1: import pymc as pm

class DecisionConfidenceEngine:
    """
    UIQ DCE — Meta-Instanz über MIE, Phase 1-3 und Schutzmechanismen.
    Input:  täglich MCM-Felder (VIX, HY-Spread, Net Liquidity, Move, SKEW)
    Output: confidence_score, mode (GREEN/YELLOW/RED), position_size, direction
    
    Phasen-Integration:
      Phase 1 (BN,  Sept. 2026): _get_bn_signal()   → P(Kursteigerung)
      Phase 2 (HMM, Okt.  2026): _get_hmm_state()   → P(Regime_0..3)
      Phase 3 (NN,  Q1    2027): _get_nn_signal()    → Transition-Timing
    """
    def __init__(self, config: dict):
        self.bn_model     = None   # Phase 1: PyMC-Modell (BN)
        self.hmm_model    = None   # Phase 2: hmmlearn.GaussianHMM
        self.nn_model     = None   # Phase 3: LSTM(32), erst Q1 2027

        self.confidence_score    = 0.5
        self.current_regime      = 'UNKNOWN'  # BULL / BEAR / CRASH / RECOVERY
        self.regime_probabilities = {}

        self.volatility_buffer   = []
        self.var_95              = 0.0

        # Sekerke-Discounting: ältere Daten werden abgewertet
        self.discount_factor  = config.get('discount_factor', 0.98)
        self.cusum_threshold  = config.get('cusum_threshold', 3.0)

    def update_daily(self, mcm_data: pd.Series) -> dict:
        """
        Täglicher Update-Cycle. mcm_data = MCM-Felder aus ko-aggregator.
        Entspricht dem daily market_context aus ko-indicators-loader.js.
        """
        # 1. Phasen-Modelle abfragen
        bn_signal  = self._get_bn_signal(mcm_data)  if self.bn_model  else 0.5
        hmm_state, hmm_probs = self._get_hmm_state(mcm_data) if self.hmm_model else (0, {})
        nn_signal  = self._get_nn_signal(mcm_data)  if self.nn_model  else 0.5

        # 2. Regime bestimmen (Phase 2 Kern)
        self.current_regime, self.regime_probabilities = \
            self._determine_regime(hmm_state, hmm_probs)

        # 3. Schutzmechanismen
        cusum_alarm = self._check_cusum(mcm_data.get('vix', 15.0))
        self.var_95 = self._calculate_evt_var(mcm_data.get('returns_history', []))

        # 4. Confidence fusionieren (Meta-Intelligenz)
        self.confidence_score = self._calculate_confidence(
            bn_signal, hmm_probs, nn_signal, cusum_alarm, self.var_95
        )

        # 5. Operative Entscheidung
        return self._derive_action(
            consensus=np.mean([bn_signal, nn_signal]),
            confidence=self.confidence_score,
            var=self.var_95
        )

    # ── Phasen-Schnittstellen (Platzhalter bis Phase implementiert) ──────────

    def _get_bn_signal(self, data) -> float:
        """Phase 1: BN liefert P(Kursteigerung) aus Markt-Querschnittsdaten."""
        # → PyMC posterior predictive auf BN-Feldern (rsScore, confluenceScore,
        #   trendScore, adx, chopIndex, distToAvwapPct)
        return 0.65  # Platzhalter

    def _get_hmm_state(self, data) -> tuple[int, dict]:
        """Phase 2: HMM liefert latenten Makrozustand aus MCM-Zeitreihen."""
        # → GaussianHMM(n_components=4) auf VIX, HY-Spread, NetLiq, Move, SKEW
        # → state: 0=Expansion, 1=Risk-Off, 2=Crash, 3=Transition
        return 0, {0: 0.70, 1: 0.20, 2: 0.05, 3: 0.05}  # Platzhalter

    def _get_nn_signal(self, data) -> float:
        """Phase 3: LSTM(32) schätzt Regime-Transition 1-3 Tage früher."""
        # → Erst aktivieren wenn Phase 2 Timing-Lücken zeigt (Go/No-Go Q1 2027)
        return 0.5  # Neutral-Platzhalter

    # ── Schutzmechanismen ────────────────────────────────────────────────────

    def _check_cusum(self, new_vix: float) -> bool:
        """CUSUM-Alarm: struktureller Bruch in VIX-Zeitreihe."""
        self.volatility_buffer.append(new_vix)
        if len(self.volatility_buffer) > 50:
            self.volatility_buffer.pop(0)
        if len(self.volatility_buffer) < 10:
            return False
        mean   = np.mean(self.volatility_buffer)
        cumsum = np.sum([x - mean for x in self.volatility_buffer])
        std    = np.std(self.volatility_buffer) or 1.0
        return cumsum > self.cusum_threshold * std

    def _calculate_evt_var(self, returns: list) -> float:
        """EVT-basierter VaR (Extremwerttheorie, Generalized Pareto Distribution)."""
        if len(returns) < 20:
            return -0.05
        arr       = np.array(returns)
        threshold = np.percentile(arr, 5)
        excess    = arr[arr < threshold] - threshold
        if len(excess) > 3:
            shape, loc, scale = genpareto.fit(-excess)
            return threshold - genpareto.ppf(0.95, shape, loc=loc, scale=scale)
        return np.percentile(arr, 1)

    # ── Kern-Logik DCE ───────────────────────────────────────────────────────

    def _determine_regime(self, state: int, probs: dict) -> tuple[str, dict]:
        """HMM-Zustand → UIQ-Regime-Label."""
        names = {0: 'EXPANSION', 1: 'RISK_OFF', 2: 'CRASH', 3: 'TRANSITION'}
        regime = names.get(max(probs, key=probs.get), 'UNKNOWN') if probs else 'UNKNOWN'
        return regime, probs

    def _calculate_confidence(self, bn, hmm_probs, nn, alarm, var) -> float:
        """
        Sekerke-inspirierte Fusion: Konsistenz × (1 - Risiko) × Regime-Dämpfer.
        
        Konsistenz: niedrige Streuung der Modell-Outputs = hohes Vertrauen
        Risiko:     CUSUM-Alarm (-30%), hoher VaR (-20%)
        Regime:     CRASH dämpft alle Modelle auf 50%
        """
        signals     = [bn, nn] + list(hmm_probs.values())
        consistency = max(0.0, 1.0 - np.std(signals))

        risk_penalty = 0.0
        if alarm:       risk_penalty += 0.30
        if var < -0.03: risk_penalty += 0.20

        if self.current_regime == 'CRASH':
            consistency *= 0.50

        return float(np.clip(consistency * (1.0 - risk_penalty), 0.0, 1.0))

    def _derive_action(self, consensus: float, confidence: float, var: float) -> dict:
        """
        Ampel-Logik → operative Entscheidung.
        Entspricht dem §0-Prinzip: Gate 1 (Ob) vor Gate 2 (Wie) vor Gate 3 (Was).
        """
        # Gate 1: Ob gehandelt werden soll
        if   confidence < 0.30 or var < -0.05: mode = 'RED'
        elif confidence < 0.60 or var < -0.02: mode = 'YELLOW'
        else:                                   mode = 'GREEN'

        # Gate 2: Wie (Positionsgröße)
        size_factor = {
            'GREEN':  1.0,
            'YELLOW': 0.50,
            'RED':    0.0
        }[mode]
        position_size = confidence * size_factor

        # Gate 3: Was (Richtung — nur wenn Gate 1+2 offen)
        if   consensus > 0.55 and mode != 'RED': direction = 'BUY'
        elif consensus < 0.45 and mode != 'RED': direction = 'SELL'
        else:                                     direction = 'HOLD'

        return {
            'mode':           mode,          # GREEN / YELLOW / RED
            'confidence':     confidence,    # 0.0 – 1.0
            'position_size':  position_size, # 0.0 – 1.0 (Anteil vom Max-Sizing)
            'direction':      direction,     # BUY / HOLD / SELL
            'regime':         self.current_regime,
            'regime_probs':   self.regime_probabilities,
            'var_95':         var,
            'cusum_alarm':    bool(self.volatility_buffer and
                                  self._check_cusum(self.volatility_buffer[-1])),
        }
```

### Kalibrierings-Prioritäten

Die wichtigsten Parameter die mit historischen Snapshot-Daten kalibriert werden müssen:

| Parameter | Default | Kalibrierung via |
|---|---|---|
| `discount_factor` | 0.98 | Sekerke Kap. 4 — Backtest auf Regime-Wechseln |
| `cusum_threshold` | 3.0 | VIX-Zeitreihe 2020–2026, Sensitivity-Analyse |
| `risk_penalty` CUSUM | 0.30 | Walk-Forward auf Track-Record-Daten |
| `risk_penalty` VaR | 0.20 | EVT-Kalibrierung auf Returns-Verteilung |
| HMM `n_components` | 4 | BIC-Score-Vergleich (3 vs 4 vs 5 Zustände) |

### Integration in UIQ ko-aggregator

```python
# In market_aggregator.py — täglich nach process_ticker():
dce = DecisionConfidenceEngine(config={"discount_factor": 0.98})
mcm_data = pd.Series({
    "vix": market_context["vix"],
    "hy_spread": market_context["hy_spread"],
    "net_liquidity": market_context["net_liquidity"],
    "returns_history": spy_returns_60d,
})
dce_output = dce.update_daily(mcm_data)
# → dce_output["confidence"] → neues KV-Feld "dceConfidence"
# → dce_output["mode"]       → neues KV-Feld "dceMode" (GREEN/YELLOW/RED)
```

### NN-Aktivierungsregel (Gate für Phase 3)

Das NN (`_get_nn_signal`) wird **nicht** aktiviert bis:
1. Phase 2 (HMM) ≥ 60 Tage Live-Betrieb hat
2. Messbare Timing-Lücke im HMM nachgewiesen ist (≥ 2 Tage Verzug bei Regime-Wechsel)
3. Explizite Go/No-Go-Entscheidung in dieser Codebase dokumentiert

In unsicheren Phasen (DCE-Mode RED) bleibt das NN immer deaktiviert — interpretierbare Modelle (BN/HMM) übernehmen.

---

## 5. Qualitätssicherung & Validierung

### Das "Misstrauens-Prinzip"

Jedes ML-Modell in UIQ muss drei Tests bestehen:

1. **Plausibilitätstest:** Stimmt der Output mit dem überein, was erfahrene Marktbeobachter sehen?
2. **Regime-Bruch-Test:** Wurde das Modell auf Daten vor einem bekannten Regime-Wechsel trainiert und danach validiert? (z.B. Zinserhöhungsphase 2022)
3. **Degradations-Alert:** Hat das Modell einen automatischen Alert, wenn seine Vorhersagequalität unter Schwellenwert fällt?

### Datenbasis-Constraints

| Phase | Benötigte History | Heute verfügbar | Startdatum |
|---|---|---|---|
| BN-Analyse | 60 Handelstage Cross-Section | 32 Tage | ca. 01.09.2026 |
| HMM | 90 Tage Zeitreihe | 32 Tage | ca. 01.10.2026 |
| NN | 250+ Tage + ausreichend Regime-Wechsel | 32 Tage | frühestens Q1 2027 |

---

## 6. Was nicht implementiert wird (und warum)

| Idee | Ausschlussgrund |
|---|---|
| Deep Learning auf Kursreihen | Kein expliziter Platz in DSS-Kette; Overfitting-Falle; widerspricht Interpretierbarkeits-Prinzip |
| BN als Produktions-Runtime | Overhead nicht gerechtfertigt; einmalige Kalibrierung reicht |
| Sentiment-NN auf News-Texten | Außerhalb DSS-Kette; Datenbeschaffung komplex; kein klarer Vorteil vs. bestehende MCM-Felder |
| Reinforcement Learning | Datenbedarf enorm; Reward-Signal in realen Märkten instabil |
| Mehr Indikatoren zur Score-Verbesserung | Löst das Redundanz-Problem nicht — verschlimmert es |

---

## 7. Beziehung zu bestehenden UIQ-Komponenten

```
Bestehend                    ML-Ergänzung            Wirkung
─────────────────────────────────────────────────────────────
calc_std_trend_score()   ←── BN-Kalibrierung     → Gewichtungen entkorreliert
confluenceScore()        ←── BN-Kalibrierung     → Redundante Faktoren entfernt
_calc_markov_regime()    ←── HMM parallel        → Makro-Prior ergänzt Ticker-Regime
score_long_minervini()   ←── BN-Kalibrierung     → Gate-Gewichtungen optimiert
Strategy-Router          ←── mcmHmmRegime         → Regime-Auswahl datengetrieben
calcDdPosition()         ←── NN (Phase 3)         → Sizing antizipiert Transition
```

---

## 8. Literaturbewertung — Bayesian Methods für UIQ

Systematische Bewertung der gesichteten Referenzwerke nach UIQ-Relevanz (August 2026).
Bewertungskriterien: Python-Ökosystem, Finanzmarkt-Bezug, Direkte Implementierbarkeit, Theoretische Tiefe.

### ★★★★★ Pflichtlektüre — unmittelbar relevant

**Sekerke, Matt: *Bayesian Risk Management: A Guide to Model Risk and Sequential Learning in Financial Markets* (Wiley, 2015)**

Das wichtigste Buch für UIQ ML-Konzept. Behandelt sequenzielle Bayesianische Inferenz *spezifisch in Finanzmärkten* — nicht als abstraktes Lehrbuch, sondern als operatives Framework für Echtzeit-Entscheidungen unter strukturellen Brüchen.

Direkte UIQ-Relevanz:
- Kap. 1: *Models for Discontinuous Markets* — formalisiert unser Regime-Wechsel-Problem
- Kap. 2: *Prior Knowledge, Parameter Uncertainty* — Prior-Wahl für BN-Kalibrierung
- Kap. 4: *Sequential Bayesian Inference + Discounting* — löst das Datenbasis-Problem: kein Mindest-Trainingsset nötig, ältere Daten werden automatisch abgewertet. Das ist der formalisierte "Misstrauens-Faktor" aus unserem Konzept.
- Kap. 5: *Dynamic Linear Models* — State-Space Basis für MCM-HMM (Phase 2)
- Kap. 6: *Sequential Monte Carlo* — Alternative wenn HMM nichtlinear wird

Kernzitat: *"Discounting reflects uncertainty about the degree of continuity between the past and the future, and prevents the accumulation of data from destroying model flexibility."*

Lektüre-Timing: Kap. 1+2+4 vor Phase 1 (Sept. 2026), Kap. 5+6 vor Phase 2 (Okt. 2026)

---

### ★★★★☆ Pflichtlektüre — Implementierung

**Candy, James V.: *Bayesian Signal Processing: Classical, Modern, and Particle Filtering Methods*, 2. Aufl. (Wiley, 2016)**

631 Seiten, sehr mathematisch, aus der Ingenieurswissenschaft (Lawrence Livermore). Kein Python-Code, keine Finance-Beispiele — aber die technisch tiefste Behandlung der Algorithmen die UIQ Phase 2 und DCE braucht.

Direkte UIQ-Relevanz:
- Kap. 4: *State-Space Models* — Gauss-Markov State-Space, Äquivalenz zu Time Series → direkte Basis für MCM-HMM
- Kap. 5: *Kalman Filter* — einfachste DCE-Implementierung: linearer Bayesianischer Prozessor auf MCM-Zeitreihen
- **Kap. 9: *Discrete Hidden Markov Model Bayesian Processors*** — HMM Theorie, Forward-Backward Algorithmus, Viterbi. Das ist das Kern-Kapitel für Phase 2.
- **Kap. 10: *Sequential Bayesian Detection*** — formale Theorie der Regime-Wechsel-Erkennung in Echtzeit (Wald's SPRT). Direkte Basis für DCE "Wie sicher bin ich?"
- Kap. 7: *Particle Filters* — für Phase 3 wenn HMM nicht ausreicht

Lektüre-Timing: Kap. 9+10 vor Phase 2 (Okt. 2026)

---

**Martin, Osvaldo & Park, Joon: *Bayesian Analysis with Python*, 3. Aufl. (Packt, 2024)**

Das praktische Gegenstück zu Sekerke. PyMC + ArviZ als primäre Werkzeuge. Keine Finance-Beispiele, aber direkt auf UIQ-Implementierung anwendbar.

Direkte UIQ-Relevanz:
- Kap. 2: *Programming Probabilistically* — PyMC Grundlagen, direkte Implementierungsreferenz für Phase 1
- Kap. 3: *Hierarchical Models* — für IPE (Investor Profile Engine): Investoren als Gruppen mit gemeinsamen Priors
- **Kap. 7: *Mixture Models*** — Finite Mixture Models als HMM-Alternative: einfacher, robuster, liefert dasselbe (Regime-Wahrscheinlichkeiten) in ~30 Zeilen PyMC-Code
- Kap. 8: *Gaussian Processes* — für DCE: Konfidenz-Intervalle über Zeit
- Kap. 9: *BART* — für `confluenceScore`-Kalibrierung: nicht-lineare Indikator-Beziehungen
- Kap. 10: *Inference Engines* — MCMC-Diagnostik, unverzichtbar für Konvergenz-Prüfung

Lektüre-Timing: Kap. 2+7 vor Phase 1 (Sept. 2026)

---

### ★★★☆☆ Referenzwerk — theoretisches Nachschlagewerk

**Zwanzig, Silvelyn & Ahmad, Rauf: *Bayesian Inference: Theory, Methods, Computations* (Chapman & Hall, 2024)**

Akademisches Master-Lehrbuch. Sehr mathematisch (Theoreme, Beweise), in R. Kein direkter Finanz- oder Zeitreihen-Bezug.

UIQ-Rolle: Nachschlagewerk für theoretische Fragen bei der BN-Kalibrierung. Wenn Prior-Wahl, Jeffreys Prior, Bayes Factors oder Conjugate Prior-Familien formal verstanden werden müssen — hier findet man die Antwort mit Beweis.

Relevante Kapitel: Kap. 3 (Prior-Wahl), Kap. 4 (Decision Theory), Kap. 8 (Bayes Factors für Modellvergleich), Kap. 9 (MCMC).

---

### ★★☆☆☆ Begrenzt nützlich

**Campesato, Oswald: *Python 3 for Machine Learning* (Mercury Learning, 2020)**

Allgemeines Python/ML-Einführungsbuch. Kap. 6.7 (Naïve Bayes) und Kap. 7.9 (Markov Chains) vorhanden, aber auf Einsteiger-Niveau. Für UIQ nicht nötig — alle relevanten Inhalte sind in Martin/Park besser abgedeckt.

---

**Garnett, Roman: *Bayesian Optimization* (Cambridge University Press, 2023)**

Behandelt ein anderes Problem: Optimierung teurer Zielfunktionen mit wenigen Auswertungen (Hyperparameter-Tuning). Für UIQ falsches Werkzeug — Marktdaten sind nicht "teuer" in diesem Sinne. Theoretisch interessant für spätere Score-Gewichtungs-Kalibrierung (Phase 3+), aber keine operative Priorität.

---

### ★☆☆☆☆ Nicht relevant für UIQ

**Scheuch, Christoph et al.: *Tidy Finance with R* (Chapman & Hall, 2022)**

Akademische empirische Finanzforschung (Fama-French, Beta-Schätzung, CRSP-Daten) in R. Falsches Ökosystem (R statt Python) und falsches Erkenntnisziel (institutionelle Forschung statt operative Echtzeit-Entscheidung). Für UIQ nicht relevant.

---

## 9. Lese-Roadmap für UIQ ML-Implementierung

```
SEPTEMBER 2026 — vor Phase 1 (BN-Analyse)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sekerke   Kap. 1, 2, 4    Theorie: discontinuous markets, discounting
Martin    Kap. 2, 7        Praxis: PyMC setup, Mixture Models
Zwanzig   Kap. 3, 8        Referenz: Prior-Wahl, Bayes Factors

OKTOBER 2026 — vor Phase 2 (MCM-HMM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sekerke   Kap. 4, 5, 6    Dynamic Linear Models, SMC
Candy     Kap. 9           HMM: Forward-Backward, Viterbi
Candy     Kap. 10          Sequential Detection → DCE Fundament

Q1 2027 — vor Phase 3 (NN / selektiv)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Martin    Kap. 8, 9, 10    GP, BART, Inference Engines
Candy     Kap. 7, 8        Particle Filters, Joint State/Parameter
```

---

*ML_KONZEPT.md v1.1 · August 2026 · UIQ Suite*  
*Literaturbewertung ergänzt: 6 Referenzwerke bewertet, Lese-Roadmap definiert*  
*Nächste Revision: nach BN-Analyse September 2026*
