# Session-Backlog: Marketstate-Analyse — Erweiterungen aus Literatur-Review

**Datum:** 2026-08-18
**Kontext:** Recherche zu Marketstate-Prognose-Instrumenten (Web-Suche + Volltext-Verifikation via Claude in Chrome)
**Bezug:** `ahsub/ko-aggregator` — `voranalyse_regime.py`, `regime_v2_backtest.py`
**Priorität gemäß SUITE.md §4:** Ergänzend zu UIQ Phase 0, nicht blockierend für Dezember-Milestone. Vor Umsetzung gegen Track-Record-Prioritäten abgleichen (Warnpflicht bei Drift vom Lead-Projekt beachten).

---

## Eintrag 1: Rolling/Online HMM als zusätzlicher Regime-Klassifikator

**Quelle:** Pagliaro, A. (2026). "Regime-Aware LightGBM for Stock Market Forecasting: A Validated Walk-Forward Framework with Statistical Rigor and Explainable AI Analysis." *Electronics*, 15(6), 1334. DOI: 10.3390/electronics15061334

**Was:**
Ein Gaussian Hidden Markov Model (K=3 Zustände: Bull/Sideways/Bear), das ausschließlich auf kausalen Daten trainiert wird (kein Look-Ahead-Bias) und alle 63 Handelstage neu gefittet wird. Regime-Decodierung per Viterbi-Algorithmus auf einem 120-Tage-Kontextfenster.

**Warum relevant:**
Ergänzt (nicht ersetzt) das bestehende 4-Regime-Z-Score-Modell um einen zweiten, methodisch unabhängigen Klassifikator zum Vergleich. Nutzt nur 4 Features (20-Tage-Rendite, 20-Tage-annualisierte Volatilität, VIX-Level, Marktbreite-Proxy) — geringe Datenanforderung.

**Voraussetzung / erster Schritt (VOR Implementierung klären):**
Prüfen, ob das bestehende Regime-Modell bereits rein kausal (nur Vergangenheitsdaten) klassifiziert oder ob hier tatsächlich eine Look-Ahead-Lücke besteht. Nur bei bestätigter Lücke lohnt sich der Aufwand.

**Aufwandsschätzung:**
- Prototyp (hmmlearn, 4 Features, Rolling-Fit-Logik): ~4–6h (1 fokussierte Session)
- Vergleichs-Backtest gegen bestehendes Regime-Modell: 1–2 zusätzliche Sessions

**Bekanntes Risiko (aus Quelle):**
Rolling-HMM zeigt in der Studie nur 56,6 % Übereinstimmung mit einem Offline-HMM (volle Zeitreihe) — die Labels werden konservativer/unsicherer, aber realistischer. Sollte im Vergleichs-Backtest explizit sichtbar gemacht werden.

**Status:** Nicht begonnen — vor Aufnahme in aktiven Sprint: Vorab-Check (siehe "Voraussetzung") durchführen.

---

## Eintrag 2: Bitcoin als Cross-Asset-Feature

**Quelle:** siehe Eintrag 1 (Pagliaro 2026), Ablationsstudie Abschnitt 4.5

**Was:**
BTC-Renditen (5/10/20 Tage), BTC-RSI, BTC-Momentum, BTC-Volatilität und rollierende 20-Tage-Korrelation zum Zielwert als zusätzliche Feature-Gruppe.

**Warum relevant:**
Im Ablationstest der Quelle war das Entfernen der BTC-Features der mit Abstand größte Performance-Verlust (ΔSharpe = −0,100; einzige Ablations-Variante mit p > 0,05 im Bootstrap-Test) — stärker als Makro-Features oder Regime-Feature selbst.

**Wichtiger Vorbehalt (vor Umsetzung zu klären):**
Der Effekt war spezifisch für High-Beta-Tech-Einzelaktien (NVDA, TSLA, AMD, MSTR) im NASDAQ-100-Universum der Studie — nicht für ein diversifiziertes Markt-Regime-Modell. Muss erst gegen das eigene SEPA-Screening-Universum geprüft werden (Korrelationsanalyse Ticker-Subset vs. BTC), bevor Featureaufwand investiert wird.

**Aufwandsschätzung:**
- Datenanbindung (yfinance, gleiche Pipeline wie bestehende Marktdaten): ~1–2h
- Vorab-Korrelationscheck SEPA-Universum vs. BTC: ~1h
- Nur bei positivem Befund: Feature-Integration + Ablationstest: ~2–3h

**Priorität:** Niedriger als Eintrag 1 — erst nach dessen Evaluation angehen, da Nutzen für UIQs Anwendungsfall unklar.

**Status:** Zurückgestellt bis Vorab-Korrelationscheck vorliegt.

---

## Eintrag 3: Validierung der Makro-Indikator-Selektionslogik (revisionsfrei, tägliche Frequenz)

**Quelle:** siehe Eintrag 1 (Pagliaro 2026), Abschnitt 3.2.5 "Rationale for indicator selection"

**Was:**
Kein neuer Code — Abgleich der bestehenden 7 Makroindikatoren gegen das in der Quelle explizit genannte Selektionsprinzip: (i) etablierter theoretischer Bezug zu Aktienrenditen, (ii) tägliche Verfügbarkeit ohne Revision, (iii) komplementärer Informationsgehalt. PMI, Jobless Claims, Sentiment-Umfragen wurden in der Quelle explizit wegen niedriger Frequenz/Revisionsrisiko ausgeschlossen.

**Warum relevant:**
Bestätigt methodisch das bereits erfolgte `oecd_cli`-Rauswurf-Vorgehen (Kollinearität mit `core_cpi_yoy`). Zusätzliche Frage: Sind alle 7 aktuellen Indikatoren tatsächlich revisionsarm/täglich, oder gibt es Kandidaten mit ähnlichem Risikoprofil wie `oecd_cli`?

**Aufwandsschätzung:**
- Kurzer Dokumentations-Check (kein Code): ~30–60 Min
- Bei Befund: ggf. STRATEGIE.md-Ergänzung mit Quellenverweis

**Status:** Kann direkt und unabhängig von Eintrag 1/2 erledigt werden — geringster Aufwand des Batches.

---

## Hinweis zur weiteren Verwendung

Alle drei Einträge referenzieren dieselbe Primärquelle (Pagliaro 2026), die im Gespräch am 2026-08-18 über Claude in Chrome direkt am Volltext (MDPI/Electronics) verifiziert wurde — kein Gemini-Sekundärzitat. Zwei weitere im selben Gespräch geprüfte Quellen (Haase & Neuenkirch 2021, CESifo WP 8828, AUC 0,828 für S&P-500-Regime-Klassifikation; Xie et al. 2025, De Gruyter, Realized Probability Index) wurden bereits in vorheriger Sitzung besprochen, sind aber nicht Teil dieses Backlogs — bei Bedarf separat aufnehmen.

**Erinnerung:** *Hast du das verifiziert oder übernommen?* — Für alle drei Einträge gilt: Quelle ist direkt am Volltext geprüft, nicht aus einer KI-Zusammenfassung übernommen.
