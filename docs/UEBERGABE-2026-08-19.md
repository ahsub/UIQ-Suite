# UIQ ÜBERGABEPROTOKOLL — 2026-08-19

**Kontext:** Ausgangspunkt war ein Bug-Report zum Morning Briefing (Regime-Badge, Trunkierung, DIX/GEX-Inkonsistenz). Der Tag endete deutlich tiefer als geplant — bei einer strukturellen Erkenntnis über konkurrierende Regime-Modelle im gesamten UIQ-Ökosystem.

**Skeptischer Hinweis wie gewohnt:** Vieles hier ist heute live verifiziert (Konsole, GHA-Logs, Yahoo-/Cboe-/Databento-Websites) — das ist im Text markiert. Wo etwas nur aus Code-Kommentaren oder Vermutung stammt, ist das ebenfalls markiert. Verify before assert.

---

## 1. AUSGANGSLAGE — DREI BUGS IM MORNING BRIEFING

- **Bug 1:** Regime-Badge zeigte "NEUTRAL", während Strategie-Ampel/KI-Text "BULL_QUIET" zeigten.
- **Bug 2:** MB brach unvermittelt ab (Strategie-Ampel-Tabelle nach "Covered Call", Dark-Pool-Analysetext mitten im Wort).
- **Bug 3:** DIX/GEX-Z-Scores liefen zwischen zwei Snapshots (06:48 vs. 06:54 Uhr) auseinander.

---

## 2. ROOT CAUSES — VOLLSTÄNDIG DIAGNOSTIZIERT

### Bug 2 (Trunkierung) — gelöst, noch nicht gefixt
`ko-ai-worker.js`: `max_tokens` zu knapp für `morning` (2000) und `dark_pool` (400). **Ein-Zeilen-Fix, noch nicht umgesetzt** — sollte morgen früh als Erstes miterledigt werden, unabhängig vom Rest.

### Bug 1 & 3 (Regime-Inkonsistenz) — Root Cause vollständig verstanden
Es existieren **drei unabhängige Regime-Klassifikatoren** im UIQ-Ökosystem:

1. **`market_regime_str`** (Server, `market_aggregator.py`, Z. ~8510–8540) — VIX3M/VIX-Termstruktur + VIX-Level. Läuft heute produktiv für die **Leaderboard-Selektion**.
2. **`KoMarketState.determineRegime()`** (Client, `ko-market-state.js`, MSE v2.3) — Multi-Faktor-Modell mit VVIX-Z-Score/GEX-Z-Score/DIX-Z-Score/SKEW-Perzentil. Speist das Live-Badge im Frontend.
3. **`regime_v1`/`regime_v2`** (`analysis/regime_v2_backtest.py`) — `regime_v1` ist eine **exakte Rekonstruktion von `market_regime_str`** (per Docstring bestätigt); `regime_v2` = `regime_v1` + eine validierte GEX<0-Override-Regel. **Einziges der drei Modelle mit echter statistischer Validierung** (Gate-A Sharpe 1.66 vs. 0.63 Baseline, aus `VALIDIERUNGSLAUF-2026-08-18.json`, Panel 2011-05-02 bis 2026-08-18, 3.826 Handelstage).

Badge (Client-MSE) und KI-Text (Server, nutzt eine dritte Quelle) zeigten deshalb regelmäßig unterschiedliche Werte — kein Zufall, sondern strukturell angelegt.

**Zusätzlich entdeckt: `^VVIX`/`^SKEW`-Historie bei Yahoo eingefroren seit 2026-07-17.**
- Live verifiziert (Browser-Konsole, GHA-Logs, drei unabhängige `yfinance`-Zugriffsmethoden: `period=`-String, `start=`/`end=`, `yf.Ticker().history()` — alle identisch betroffen).
- Yahoo-Website selbst zeigt aktuelle Daten (verifiziert: Close 92.87 am 18.08.2026) — das Problem betrifft nur die von `yfinance` genutzte `v8/finance/chart`-API, nicht Yahoo insgesamt.
- Betrifft nur `KoMarketState.determineRegime()` (Modell 2), da nur dieses VVIX/SKEW-Z-Scores braucht. Modelle 1 und 3 sind davon **nicht** betroffen.

---

## 3. HEUTE UMGESETZTE CODE-ÄNDERUNGEN (bereits committet)

In `market_aggregator.py`, Funktion `fetch_mse_history()`:
- Wechsel von `yf.download()` auf `yf.Ticker().history()` (robusterer Code-Pfad für CBOE-Sonderindizes, analog zu `analysis/voranalyse_regime.py::fetch_yf_series()`).
- `^VIX3M` optional statt Hard-Fail (Guard gelockert) — `VVIX`/`SKEW`/`VIX` bleiben nutzbar, auch wenn `^VIX3M`-Historie mal fehlschlägt.
- **Löst das Freeze-Problem NICHT** (verifiziert, drei Läufe getestet) — bleibt trotzdem im Code, da unabhängig davon eine echte Robustheitsverbesserung.

**Neu gebaut, aber ausdrücklich NICHT deployt:** `determine_mse_regime()` in `market_aggregator.py` — 1:1-Port von `KoMarketState.determineRegime()` nach Python. **Nach der heutigen Erkenntnis (Abschnitt 4) voraussichtlich hinfällig — nicht weiterverfolgen, es sei denn, morgige Diskussion kommt zu anderem Schluss.**

---

## 4. ZENTRALE ERKENNTNIS DES TAGES — MORGEN FRÜH ALS ERSTES

**Die Lösung liegt vermutlich nicht in einer neuen VVIX/SKEW-Datenquelle, sondern in der Konsolidierung auf das bereits validierte Modell:**

`regime_v2` (VIX-Termstruktur + roher GEX-Schwellenwert, **keine** VVIX/SKEW-Abhängigkeit) ist das einzige der drei Modelle mit Sharpe-Validierung. Vorschlag, mit dem morgen gestartet werden soll:

1. `market_regime_str` (Server) um die validierte GEX<0-Override-Regel erweitern (`regime_v1` → `regime_v2`) — kleine, bereits geprüfte Ergänzung.
2. `KoMarketState.determineRegime()` (Client) auf dieselbe `regime_v2`-Formel umstellen statt der eigenen Multi-Faktor-Logik — eliminiert VVIX/SKEW-Abhängigkeit **und** das Live-Drift-Problem im Widget vollständig (da `regime_v2` nur rohe, zuverlässig verfügbare Werte braucht: VIX, VIX3M, GEX).
3. Heutigen `determine_mse_regime()`-Port verwerfen (nicht deployen).
4. Damit lösen sich Bug 1 und Bug 3 strukturell auf — Client und Server rechnen dieselbe Formel, keine getrennten Quellen mehr.

**Offene Frage für morgen:** `regime_v2`s JS-Portierung für den Client sauber bauen (kleiner als der heutige Versuch, da einfachere Formel) + `market_regime_str`-Erweiterung im Server. Kein externer Datenquellen-Fix mehr nötig.

**Nicht vergessen:** Fragen, ob wirklich verifiziert wurde oder nur aus dem Chatverlauf/Docstring übernommen — insbesondere die Sharpe-1.66-Zahl selbst stammt aus Erinnerung/vorherigen Sessions, wurde heute nicht neu nachgerechnet.

---

## 5. BACKLOG — GEPRÜFT UND VERWORFEN (nicht erneut versuchen)

- **VVIX/SKEW-Proxy-Substitution** (realisierte VIX-Vola als VVIX-Ersatz, VIX3M/VIX-Spread als SKEW-Ersatz): Korrelation zu schwach (r=0,359 bzw. r=0,180 gegen echte historische Werte aus `data/snapshots/`). Verworfen.
- **Cboe DataShop Direktkauf:** Live verifiziert — $250/Monat für kompletten CGI-Channel (200+ Indizes), kein Einzelkauf von VVIX/SKEW möglich. Unverhältnismäßig. Verworfen.
- **Cboe Content-Lizenz-Antrag** (permissions@cboe.com): Für Redistribution/Publikation gedacht, nicht für privaten Gebrauch — falscher Prozess. Nicht weiterverfolgt.
- **Databento:** Live verifiziert — kein fertiges VVIX/SKEW-Produkt im Angebot, nur rohe OPRA-Optionsdaten (VIX-/SPX-Ketten). Würde eigene Nachbildung der Cboe-Berechnungsmethodik erfordern (hoher Entwicklungs-/Validierungsaufwand). Verworfen für diesen Zweck.
- **Quantopian-Dataset-Vorschlag** (aus einer externen Analyse): Plattform seit 2020 eingestellt, nicht existent. Verworfen.

## 6. BACKLOG — OFFEN, ECHTER BEDARF (unabhängig von Abschnitt 4)

- **IBKR/CapTrader-Datenanbindung:** $3,50/Monat für Cboe-Indizes, an bestehendes Konto gebunden. **Von Axel bestätigt: wird für das Options-Modul ohnehin gebraucht, unabhängig vom Regime-Themenkomplex.** Erfordert TWS-API-Dauerverbindung (Login/2FA, ggf. eigener Server/Docker-Container) — nicht ohne Weiteres im ephemeren GitHub-Actions-Runner unterzubringen. **Nächster Schritt:** API-Aktivierung bei IBKR/CapTrader, dann Architekturfrage klären (Dauerbetrieb vs. periodischer Abruf).
- **Reduziertes Regime-Modell ohne VVIX/SKEW** (heute getestet: 84,2–94,7% Übereinstimmung mit Vollmodell auf 38 Tagen, `BULL_FRAGILE` nicht rekonstruierbar): Nach Erkenntnis aus Abschnitt 4 wahrscheinlich obsolet, da `regime_v2` ohnehin nie VVIX/SKEW brauchte. Nicht weiterverfolgen, außer Abschnitt 4 wird morgen verworfen.
- **`max_tokens`-Fix** (Bug 2): Trivial, noch nicht umgesetzt.

---

## 7. CODE-STAND ZUM SESSIONENDE

- `market_aggregator.py`: `fetch_mse_history()`-Fixes committet (siehe Abschnitt 3). `determine_mse_regime()` im Code vorhanden, aber nicht in `generate_daily_snapshot()` scharf — **bewusst nicht deployen, bis Abschnitt 4 entschieden ist.**
- `ko-ai-worker.js`: `max_tokens`-Fix noch offen.
- `KoMarketState.determineRegime()` (Client): unverändert, weiterhin von VVIX/SKEW abhängig — wird durch Abschnitt-4-Entscheidung ggf. komplett ersetzt.

---

## FÜR MORGEN FRÜH, IN DIESER REIHENFOLGE

1. **Abschnitt 4 diskutieren und entscheiden:** `regime_v2` als kanonisches Modell für Client + Server + Backtest?
2. Falls ja: Migrationsplan (JS-Port für Client, Server-Erweiterung, `determine_mse_regime()` verwerfen).
3. `max_tokens`-Fix (Bug 2) — unabhängig, klein, direkt erledigen.
4. IBKR/CapTrader API-Aktivierung fürs Options-Modul anstoßen (separates Vorhaben, siehe Abschnitt 6).
