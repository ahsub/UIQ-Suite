# Übergabeprotokoll — 09.08.2026
## Thema: Pine-Script Code-Review (Options-Signalgeber) + Marktsichtung Options-Indikatoren

---

## 1. Kontext

Adversariales Code-Review von drei Pine-Script-Indikatoren (zwei eigene Erstversuche, ein Drittanbieter-Skript) sowie eine gezielte Marktsichtung der TradingView-Bibliothek nach für das UIQ-Optionsmodul verwertbaren Konzepten. Keine Repo-Änderungen in dieser Session (kein PAT bereitgestellt) — reine Konzept-/Vorarbeit, gefixte Dateien liegen als Download vor, Commit steht noch aus.

**Nachtrag (Folge-Session 09.08.):** Die drei Fix-Dateien wurden ins Repo `ahsub/PINE-Skripts` committed; dieses Protokoll wurde in `UIQ-Suite/docs/` abgelegt.

---

## 2. Reviewte Skripte & Kernfunde

### 2.1 "Bear Put Spread - Clean Mode" (eigen, v1)
- **Kritisch:** Backtest simuliert nackten Aktien-Short, keine Spread-Ökonomie (Theta/IV nicht modelliert) — bleibt strukturell so (siehe §4).
- **Kritisch:** Vorzeichenfehler in `macdHistHigh` (`histLine > sma*1.5` kippt bei negativem SMA).
- **Kritisch:** Entry/Close-Kollision möglich (bearPutSignal schloss nur `conditionGreenTriangle` aus, nicht `conditionBlueTriangle`).
- **Relevant:** 1-Bar-Rauschen bei `isBearishMomentum` (`ta.falling(x,1)`).
- **Relevant:** Exit-Asymmetrie (SL 5% / TP 10%) gegen bestätigten Aufwärtstrend invertiert.
- **Fix-Datei:** `bear-put-spread-clean-mode-fixed.pine` — u. a. konfigurierbare Mindestdauer für Momentum-Filter (`momentumBars`), TP auf 6% korrigiert.

### 2.2 "Bear Put Spread Navigator PRO v2" (eigen, erweitert)
- Gleiche drei kritischen Bugs wie v1 (MACD-Vorzeichen, Entry/Close-Kollision, 1-Bar-Momentum).
- **Neuer kritischer Fund:** Strike-Berechnung mathematisch verkehrt — da `sixMonthLow ≤ sixWeekLow` *immer* gilt (längeres Lookback kann nur gleich/tiefer sein), war `spreadWidthPercent` **strukturell immer ≤ 0**, Long/Short-Strike-Zuordnung invertiert.
- **Neu:** `request.security()`-Aufruf für MTF-RSI ohne Repaint-Schutz (Live-Betrieb, nicht Backtest).
- **Regression:** `overheatThreshold` war in v2 hart auf 50 verdrahtet (v1 hatte konfigurierbaren Input).
- **Fix-Datei:** `bear-put-spread-navigator-pro-v2-fixed.pine` — Strike-Sortierung korrigiert (`math.max`/`math.min`), `[1]`-Offset für MTF-Fix, Threshold-Input wiederhergestellt.

### 2.3 "Bayesian Trend Indicator [ChartPrime]" (Drittanbieter, MPL-2.0)
- **Konzeptioneller Kritikpunkt:** Keine echte Bayes'sche Inferenz — Prior und Likelihood stammen aus stark korrelierten Quellen (langsame vs. schnelle Version derselben vier MAs). Eher nichtlineare Konsens-Verstärkung als kalibrierte Wahrscheinlichkeit.
- **Bug:** NaN-Fallback bei 0/0-Fällen war hart auf 0 (= künstlich bärisch) gesetzt statt neutral.
- **Klein:** Redundante dreifache `ta.ema(source,length)`-Neuberechnung in `dema_`.
- **Fix-Datei:** `bayesian-trend-indicator-chartprime-fixed.pine` — NaN-Fallback konfigurierbar (Default neutral 0.5), redundante Berechnung entfernt.
- **Einordnung für UIQ:** Als eigenständige DCE-Probability-Quelle **nicht geeignet** (würde §2.6 Regime-Singularität verletzen — zwei "Wahrheiten" nebeneinander). Allenfalls als eine von ~35 Metriken in Backlog Nr. 44 (Data Foundation), explizit nicht als Probability gelabelt.

---

## 3. Marktsichtung: Options-Indikatoren TradingView-Bibliothek

Ziel: brauchbare Konzepte für UIQ-Optionsmodul identifizieren. Wichtigster Architektur-Fund vorab: **Pine Script hat keinen Zugriff auf Echtzeit-Optionsketten** — alle GEX-/echten-IV-Indikatoren in Pine sind entweder (a) reine Visualisierungsschicht für extern vorberechnete Werte, oder (b) synthetische Historik-Proxys, keine echte optionspreisbasierte Größe.

| Kandidat | Datenqualität | Pareto-Einordnung | Status |
|---|---|---|---|
| VIX/VIX3M Term Structure (Contango/Backwardation) | Echt (reale Index-Ticker) | **Prio 1** | Reminder angelegt |
| Put/Call Ratio (CBOE CPC/PCC) | Echt (reale CBOE-Daten) | **Prio 1** | Reminder angelegt |
| Gamma Exposure (GEX Walls/Flip) | Nur Visualisierung, Berechnung extern nötig | Prio 2 (optional) | Reminder angelegt |
| IV Rank/Percentile (Pine-Varianten) | Synthetisch (HV-Proxy aus Preishistorie, **keine echte IV**) | Prio 2 (nur falls aktuell keine echte Options-IV vorhanden) | Reminder angelegt |

**Details Prio 1:**
- **VIX/VIX3M-Ratio:** <1.0 = Contango → struktureller Rückenwind für Premium-Selling (Wheel/CSP); >1.0 = Backwardation → Stress-Regime, Premium-Selling reduzieren; >1.10 = Deep Backwardation, historisch beste Selling-Chance, aber erst nach Mean-Reversion-"Hook" abwarten. Passt konzeptionell zur bestehenden 4-Regime-Engine (insb. STRESS_UNSTABLE). Kandidat für Backlog Nr. 44 oder eigenständigen DCE-Input.
- **Put/Call Ratio (CPC/PCC):** Ergänzt bestehenden FINRA Reg SHO DIX um zweite Sentiment-Dimension. Reale CBOE-Daten, keine Pine-spezifische Beschränkung.

Alle vier Punkte liegen mit genauen Quell-URLs und extrahierter Berechnungslogik als Reminders vor (Liste "Erinnerungen").

---

## 4. Offene / bewusst nicht behobene Punkte

- Aktien-Short-Proxy statt echter Put-Spread-Ökonomie (Theta/IV) bleibt in allen Backtest-Blöcken bestehen — Spread-Ökonomie sollte extern gegen UIQ-Optionsscorer validiert werden, nicht in Pine modelliert.
- ~~Keine der drei Fix-Dateien wurde bisher committed (kein PAT in dieser Session).~~ → erledigt in Folge-Session 09.08.

## 5. Workflow-Entscheidung

Frage geprüft, ob Umstieg auf Claude Code für das Gesamtprojekt sinnvoll wäre. Ergebnis: Grundsätzlich passend (lokaler Git-Zugriff, PAT bliebe in der Shell statt im Chat), aber **bewusst vertagt** — aktuelle Chat-basierte Praxis der letzten zwei Monate hat sich bewährt, kein Wechsel während der laufenden Track-Record-Phase vor dem Dezember-Go/No-Go.

**Sicherheitshinweis:** In dieser Session wurde versehentlich ein GitHub PAT im Klartext im Chat geteilt. Empfehlung: Token widerrufen/neu erzeugen, falls noch nicht geschehen. Für künftige Pushes: Dateien werden zum Download bereitgestellt, Push erfolgt durch Axel selbst.

---

*Erstellt: 09.08.2026 — committed in Folge-Session 09.08. nach `UIQ-Suite/docs/`.*
