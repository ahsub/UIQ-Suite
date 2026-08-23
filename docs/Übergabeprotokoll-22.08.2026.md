# Übergabeprotokoll — 22.08.2026 (Sa) → nächste Session

## PFLICHT-HEADER

**"committed ≠ deployed" — vor Übernahme verifizieren, nicht ungeprüft glauben.**

Erfahrungen aus dieser Session, die für die nächste relevant sind:

1. **`raw.githubusercontent.com` hat spürbaren CDN-Cache-Verzug.** Zweimal
   heute sah ein frisch committeter Fix dort noch nicht vorhanden aus,
   obwohl er im `main`-Branch längst korrekt lag. **Für Commit-Verifikation
   immer die reguläre GitHub-Oberfläche (Commit-Diff-Ansicht) nutzen, nicht
   die Raw-URL.**
2. **`market_aggregator.py` enthält Funktions-Duplikate.** `generate_daily_snapshot()`
   ist ZWEIMAL definiert (ca. Zeile 997 und ca. Zeile 8895). In Python gewinnt
   die SPÄTERE Definition — die erste ist toter, nie ausgeführter Code. Vor
   jedem Patch an dieser Datei prüfen, ob die Zielstelle in der aktiven
   (zweiten) Kopie liegt. Das hat heute einen halben Tag Debugging gekostet.
3. **Web-Editor-Bearbeitung dieser Datei (504 KB) ist fehleranfällig.**
   Manuelles Einfügen von Codeblöcken schlug mehrfach fehl (kaputte
   Einrückung, State-Sync-Probleme des Commit-Buttons, verlorener Editor-
   Zustand). **Bewährter Weg: komplette Datei fertig gepatcht bereitstellen,
   Axel ersetzt sie per Copy-Paste vollständig.**

---

## §1 Was heute erledigt wurde

### 1.1 Morning-Briefing-Truncation — GELÖST und live verifiziert

**Symptom:** Morning Briefing brach seit Tagen mitten in der Strategie-Ampel-
Tabelle ab ("...| 🟡 " oder "...Long-Positionen s"), reproduzierbar über
mehrere Stunden und Neuversuche hinweg.

**Zwei unabhängige Root Causes, beide gefixt:**

| Fix | Datei | Commit | Status |
|---|---|---|---|
| `max_tokens: 1200 → 4500` | `market_aggregator.py` (aktive, zweite `generate_daily_snapshot()`) | `c9e75f6` | ✅ live verifiziert |
| `timeout=30 → 90` (beide `_ur.urlopen(req2, ...)`) | `market_aggregator.py` | `75dfd89` | ✅ live verifiziert |
| Diagnose-Logging (`stop_reason`, `output_tokens`) | `market_aggregator.py` | `c9e75f6` | ✅ aktiv, s. §2.1 |

**Diagnose-Historie (wichtig für das Verständnis):**
- Der ganze Vortag (21.08.) mit `ko-ai.js`-Patches (v1.9/v1.10) war für das
  Morning Briefing **wirkungslos** — das serverseitige Briefing macht einen
  **eigenen, direkten** Anthropic-Call im Python-Aggregator, nicht über den
  Cloudflare-Worker. `koAiCall('morning', ...)` im Frontend ist nur ein
  selten genutzter Fallback-Pfad (Frontend liest normalerweise Cache-First
  aus KV-Key `daily_market_snapshot`).
- Die `ko-ai.js`-Fixes bleiben aber korrekt und nötig für die ANDEREN Aktionen
  (`eic`, `deep_dive`, `dark_pool`, `ki_briefing`) — die laufen tatsächlich
  über den Worker.
- Der `timeout=30`-Bug war vorher unsichtbar: Bei `max_tokens: 1200` war die
  Antwort immer rechtzeitig fertig. Erst die Token-Erhöhung legte ihn frei
  (`[SNAPSHOT] Fehler: The read operation timed out`).

**Live-Beweis (GHA-Lauf #239 bzw. Folgelauf, 05:59 UTC):**
```
[SNAPSHOT-DIAG] stop_reason=end_turn | output_tokens=1633 | input_tokens=2078 | max_tokens_limit=4500
[SNAPSHOT] Morning Briefing generiert (4038 Zeichen)
```
Frontend-Prüfung bestätigt: alle 5 Pflichtabschnitte vollständig, inkl.
kompletter 7-zeiliger Strategie-Ampel-Tabelle, Top-5-Kandidaten und
Risiko-Disclaimer am Ende. `stop_reason=end_turn` bei 1633/4500 Tokens =
Modell war regulär fertig, kein Limit-Abbruch mehr.

### 1.2 `ko-ai.js` (Cloudflare Worker) — v1.10, versioniert

- `ki_briefing` 2048→3000, `eic` 2000→3500, `dark_pool` 400→1000,
  `morning` 3000→4500, `deep_dive` 2500→3200
- **SPOF behoben:** Worker-Quellcode erstmals tatsächlich im Repo versioniert
  unter `workers/ko-ai.js` (der Eintrag in `docs/STRATEGIE.md`
  "ko-ai-Worker-Quellcode nicht versioniert" kann jetzt geschlossen werden).
  Die Session vom 05.08. hatte das behauptet, aber nie getan — verifiziert.
- Cloudflare-Deployment `1e8452fa` aktiv (100% Traffic).

---

## §2 Offene Punkte für die nächste Session

### 2.1 Diagnose-Logging wieder entfernen (klein, kein Zeitdruck)

Der `[SNAPSHOT-DIAG]`-Block in `market_aggregator.py` (aktive
`generate_daily_snapshot()`) war laut eigenem Kommentar "nur für die
nächsten 1-2 Läufe gedacht". Er hat seinen Zweck erfüllt und kann bei
Gelegenheit raus — schadet aber auch nicht, wenn er bleibt.

### 2.2 Market-State: drei konkurrierende Regime-Berechnungen (ARCHITEKTUR)

**Das ist der nächste inhaltliche Hauptpunkt** — verstößt gegen die
Single-Source-of-Truth-Regel und erzeugt widersprüchliche Regime-Anzeigen.

**A) `market_regime_str`** (`market_aggregator.py`, server)
- Treibt die **echten Handelsentscheidungen**: Leaderboards,
  `score_options_collar()`, `calc_breadth_oscillator()`, Track Record
- Nur **2 Inputs**: VIX3M/VIX-Ratio + VIX-Niveau
  ```
  ratio < 0.98            → STRESS_UNSTABLE
  ratio < 1.05            → POST_PANIC_REVERSION
  ratio ≥ 1.05, VIX > 25  → BULL_FRAGILE
  ratio ≥ 1.05, VIX ≤ 25  → BULL_QUIET
  ```
- **Kennt kein NEUTRAL** — landet immer in einem der vier Zustände
- Bewusst nicht angetastet (Track-Record-Risiko, s. Übergabe 19.08.)

**B) `determine_mse_regime()`** (`market_aggregator.py`, server)
- **Nur** für den KI-Briefing-Text (Python-Port vom 19.08.)
- **5 Inputs**: VVIX-Z, GEX-Z, DIX-Z, SKEW-Perzentil, Term-Structure
- Hat expliziten **NEUTRAL-Fallback** bei Uneindeutigkeit
- Laut eigenem Docstring: **"NOCH NICHT VALIDIERT"** — sollte vor
  produktivem Vertrauen gegen historische Client-Regime-Werte gedifft
  werden (analog `REGIME-BACKTEST-VALIDIERUNG.md`)

**C) `KoMarketState.determineRegime()`** (`ko-market-state.js`, client)
- Identische Logik wie B (B ist 1:1-Port davon), aber **unabhängig zur
  Laufzeit im Browser** mit potenziell anderen/aktuelleren Live-Daten
- Versionslock ohne Automatik: bei Änderung an einer Seite MUSS die andere
  manuell nachgezogen werden (JS/Python-Sprachgrenze, kein Build-Artefakt)

**Warum das zwangsläufig widersprüchlich wirkt:**
- A vs. B/C sind **methodisch verschieden** (2 vs. 5 Faktoren), benutzen
  aber **dieselben fünf Label-Namen** → gleiche Wörter, andere Bedeutung.
  Das ist vermutlich die Hauptquelle der Verwirrung.
- B vs. C können durch **Timing** auseinanderlaufen (Server-Cron-Snapshot
  vs. Live-Client-Fetch) — dieselbe Grundursache wie der bereits gefixte
  Badge-Mismatch (v472, GEX/DIX-Skalen-Divergenz).
- Nur B/C kennen NEUTRAL → A wirkt in uneindeutigen Lagen fälschlich
  entschieden.
- Beobachtet im Log: `[SNAPSHOT] Regime-Divergenz: Aggregator=BULL_QUIET
  vs. MSE(client-aequivalent)=NEUTRAL — Briefing-Text nutzt MSE.`

**Empfohlenes Vorgehen (nicht vor der Präsentation anfangen):**
1. Zuerst entscheiden: Soll A durch B ersetzt werden (echte
   Vereinheitlichung, aber Track-Record-Bruch) oder bleibt die Trennung
   bewusst bestehen (dann: **unterschiedliche Label-Namen vergeben**, damit
   nicht dasselbe Wort zwei Dinge meint — der billigste Schritt mit dem
   größten Verwirrungs-Gewinn)?
2. Falls Vereinheitlichung: B zuerst validieren (Docstring-Hinweis
   beachten), dann Track-Record-Auswirkung abschätzen, erst dann umstellen.
3. B/C-Drift separat angehen: Server-Wert als führend definieren und im
   Client nur noch anzeigen statt neu berechnen (löst die Timing-Divergenz
   strukturell).

### 2.3 Weitere offene Punkte (aus Beobachtung, nicht bearbeitet)

- **Datumsanzeige im Briefing-Header:** Zeigte am 22.08. (Sa) noch
  "Freitag, 21. August" bei einem Briefing für den 22.08. Vermutlich
  Wochenend-/Handelsfrei-Sonderfall, harmlos, aber prüfenswert.
- **finnhub.io API-Key:** Durchgehend `401 Unauthorized` in der Browser-
  Console (SPY/QQQ-Quotes, Earnings-Kalender via CORS-Proxy), zusätzlich
  ein `429`. Key vermutlich abgelaufen/ungültig. Betrifft Live-Kurse und
  Earnings-Daten im Frontend.
- **`workers/ko-ai.js` Pfad:** War zwischenzeitlich versehentlich unter
  `workers/ko-watchdog/ko-ai.js` gelandet, inzwischen korrekt auf
  `workers/ko-ai.js` verschoben — verifiziert.

---

## §3 Kontext: laufende Nebenprojekte (nicht heute bearbeitet)

- **Regime-Detection-Forschungsprojekt** (entkoppelt von UIQ Phase 0,
  s. separates Dokument `Regime-Detection-Recherche_Zwischenstand.md`):
  11 Quellen gesichtet, Zwei-Ebenen-Modellskizze (Bayesian-HMM +
  Stickiness-Antizipations-Layer) und 7-Schritte-Umsetzungsplan stehen.
  Datenbasis durch die CBOE-Beschaffung vom 20.08. jetzt vorhanden.
- **CBOE-Daten (VVIX/SKEW/VIX/SKEW-Term-Structure):** committet in
  `data/raw_data/` + `data/cboe_vol_panel_daily.csv`, Loader
  (`cboe_vol_loader.py`) und Backfill-Modul (`cboe_backfill.py`) im
  Repo-Root. **Noch offen:** `cboe_backfill.py` ist noch nicht in
  `analysis/voranalyse_regime.py` eingebunden (nur erstellt und isoliert
  getestet).
