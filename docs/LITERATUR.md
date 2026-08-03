# LITERATUR.md — UIQ Referenzbibliothek

**Stand:** August 2026  
**Scope:** Alle gesichteten Referenzwerke für UIQ ML-Konzept, Trading-Algorithmen und Investmentmethodik  
**Format:** Bewertung ★1–5 nach UIQ-Relevanz · Kategorie · Lektüre-Timing

---

## Kategorie A — Bayesian Methods & Machine Learning

### ★★★★★ Sekerke, Matt
**Bayesian Risk Management: A Guide to Model Risk and Sequential Learning in Financial Markets**  
Wiley, 2015 · 240 Seiten · Englisch

**Kernthema:** Sequenzielle Bayesianische Inferenz in Finanzmärkten. Einziges Buch in der Bibliothek das Bayes-Methoden *spezifisch* für Echtzeit-Marktentscheidungen unter strukturellen Brüchen entwickelt.

**UIQ-Relevanz (direkt):**
- Kap. 1: Models for Discontinuous Markets → Regime-Wechsel formalisiert
- Kap. 2: Prior Knowledge & Parameter Uncertainty → Prior-Wahl für BN-Phase 1
- Kap. 4: Sequential Bayesian Inference + **Discounting** → löst Datenbasis-Problem (kein 90-Tage-Minimum nötig)
- Kap. 5: Dynamic Linear Models → State-Space Basis für MCM-HMM (Phase 2)
- Kap. 6: Sequential Monte Carlo → Fallback wenn HMM nichtlinear wird

**Kernzitat:** *"Discounting reflects uncertainty about the degree of continuity between the past and the future, and prevents the accumulation of data from destroying model flexibility."*

**Lektüre-Timing:** Kap. 1+2+4 vor Sept. 2026 · Kap. 5+6 vor Okt. 2026

---

### ★★★★☆ Candy, James V.
**Bayesian Signal Processing: Classical, Modern, and Particle Filtering Methods**, 2. Aufl.  
Wiley, 2016 · 631 Seiten · Englisch · Kein Python-Code

**Kernthema:** Bayesianische Signalverarbeitung für Ingenieure. Mathematisch tiefste Behandlung von Kalman-Filter, HMM und Particle Filters. Aus der Militärtechnik (Lawrence Livermore), keine Finance-Beispiele — aber direkt auf MCM-Zeitreihen übertragbar.

**UIQ-Relevanz (direkt):**
- Kap. 4: State-Space Models + Gauss-Markov → Basis für MCM-HMM
- Kap. 5: Kalman Filter (lineare Bayes-Prozessoren) → einfachste DCE-Implementierung
- **Kap. 9: Discrete HMM Bayesian Processors** → Forward-Backward, Viterbi — Kern-Kapitel für Phase 2
- **Kap. 10: Sequential Bayesian Detection** → Wald's SPRT, Regime-Wechsel in Echtzeit → formale Basis für DCE
- Kap. 7: Particle Filters → für Phase 3 wenn HMM nicht ausreicht

**Lektüre-Timing:** Kap. 9+10 vor Okt. 2026

---

### ★★★★☆ Martin, Osvaldo & Park, Joon (Joonsuk)
**Bayesian Analysis with Python**, 3. Aufl.  
Packt Publishing, 2024 · ca. 350 Seiten · Englisch · **Python (PyMC + ArviZ)**

**Kernthema:** Praktisches PyMC-Lehrbuch. Das praktische Gegenstück zu Sekerke. Community-Standard für Bayesianische Modellierung in Python.

**UIQ-Relevanz (direkt):**
- Kap. 2: PyMC Grundlagen → direkte Implementierungsreferenz Phase 1
- Kap. 3: Hierarchical Models → IPE (Investoren als Gruppen mit gemeinsamen Priors)
- **Kap. 7: Mixture Models** → Finite Mixture als HMM-Alternative (~30 Zeilen PyMC-Code)
- Kap. 8: Gaussian Processes → DCE Konfidenz-Intervalle über Zeit
- Kap. 9: BART → confluenceScore Kalibrierung (nicht-lineare Beziehungen)
- Kap. 10: Inference Engines + MCMC-Diagnostik → Konvergenz-Prüfung

**Lektüre-Timing:** Kap. 2+7 vor Sept. 2026 · Kap. 8+9+10 vor Q1 2027

---

### ★★★☆☆ Zwanzig, Silvelyn & Ahmad, Rauf
**Bayesian Inference: Theory, Methods, Computations**  
Chapman & Hall/CRC, 2024 · 347 Seiten · Englisch · **R-Code**

**Kernthema:** Akademisches Master-Lehrbuch. Vollständige, rigorose Behandlung der Bayes-Grundlagen mit Beweisen. Primär als Nachschlagewerk für theoretische Fragen.

**UIQ-Rolle:** Referenz wenn bei BN-Kalibrierung theoretische Fragen zu Prior-Wahl, Bayes Factors oder Conjugate Priors entstehen.

**Relevante Kapitel:** Kap. 3 (Prior-Wahl: Subjektiv/Conjugate/Jeffreys), Kap. 4 (Bayesian Decision Theory), Kap. 8 (Bayes Factors für Modellvergleich), Kap. 9 (MCMC-Grundlagen)

**Einschränkung:** R statt Python. Kein Finanz- oder Zeitreihen-Bezug.

**Lektüre-Timing:** Kap. 3+8 bei Bedarf während Phase 1 (Nachschlagewerk)

---

### ★★☆☆☆ Campesato, Oswald
**Python 3 for Machine Learning**  
Mercury Learning and Information, 2020 · Englisch · Python

**Kernthema:** Allgemeines Python/ML-Einführungsbuch.

**UIQ-Relevanz:** Kap. 6.7 (Naïve Bayes, Einführungsniveau), Kap. 7.9 (Markov Chains, oberflächlich). Alle relevanten Inhalte sind in Martin/Park umfassender und praxisnäher abgedeckt.

**Empfehlung:** Nicht als UIQ-Referenz verwenden.

---

### ★★☆☆☆ Garnett, Roman
**Bayesian Optimization**  
Cambridge University Press, 2023 · 375 Seiten · Englisch

**Kernthema:** Optimierung teurer, nicht-analytisch bekannter Zielfunktionen (Hyperparameter-Tuning, experimentelles Design). Gaussian Processes als Surrogate-Modelle, Acquisition Functions.

**UIQ-Relevanz:** Falsches Werkzeug für das UIQ-Problem. Bayesian Optimization löst "Wo ist das Maximum einer teuren Funktion?" — UIQ braucht "Was ist der aktuelle Marktzustand?". Marktdaten sind nicht teuer in diesem Sinne.

**Eingeschränkt relevant:** Theoretisch für spätere Score-Gewichtungs-Kalibrierung via Backtesting (Phase 3+), aber keine operative Priorität.

---

## Kategorie B — Finance & Algorithmic Trading

### ★☆☆☆☆ Scheuch, Christoph; Voigt, Stefan; Weiss, Patrick
**Tidy Finance with R**  
Chapman & Hall/CRC, 2022 · 268 Seiten · Englisch · **R (tidyverse)**

**Kernthema:** Akademische empirische Finanzforschung — Fama-French-Faktoren, Beta-Schätzung, Portfolio-Sorts, CRSP/Compustat-Daten. Machine Learning für Factor Selection und Option Pricing.

**UIQ-Relevanz:** Nicht relevant. Zwei Ausschlussgründe:
1. R statt Python — nicht portierbar ohne erheblichen Aufwand
2. Institutionelle Forschung mit Jahrzehnte-langen Datensätzen — UIQ arbeitet mit Tages-Snapshots in Echtzeit

**Konzeptuell interessant** (ohne Code): Kap. 16 (Parametric Portfolio Policies) für spätere IPE.

---

## Literaturdatenbank — Weitere Referenzen (aus früheren Sessions)

### Strimpel, Stefan
**Python for Algorithmic Trading Cookbook**, 2. Aufl.  
O'Reilly · Top-Rating aus systematischer Buchbewertung (Session Juli 2026)  
UIQ-Relevanz: ★★★★★ — Direkteste technische Referenz für Aggregator-Algorithmen

---

## Bewertungsübersicht

| Autor | Titel (Kurzform) | Sterne | Kategorie | Timing |
|---|---|---|---|---|
| Sekerke | Bayesian Risk Management | ★★★★★ | Bayes/Finance | Sept. + Okt. 2026 |
| Strimpel | Python Algorithmic Trading | ★★★★★ | Trading/Tech | laufend |
| Candy | Bayesian Signal Processing | ★★★★☆ | Bayes/Technik | Okt. 2026 |
| Martin/Park | Bayesian Analysis with Python | ★★★★☆ | Bayes/Python | Sept. 2026 |
| Zwanzig/Ahmad | Bayesian Inference TMC | ★★★☆☆ | Bayes/Theorie | Nachschlagewerk |
| Campesato | Python 3 for ML | ★★☆☆☆ | Python/ML | — |
| Garnett | Bayesian Optimization | ★★☆☆☆ | Bayes/Optim. | Phase 3+ |
| Scheuch et al. | Tidy Finance with R | ★☆☆☆☆ | Finance/R | — |

---

*LITERATUR.md v1.0 · August 2026 · UIQ Suite*  
*6 Bayesian-Referenzwerke bewertet (August 2026) + Strimpel aus Juli-Session*  
*Nächste Ergänzung: nach Phase 1 BN-Analyse (September 2026)*
