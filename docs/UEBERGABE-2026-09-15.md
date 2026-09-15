# UIQ — Übergabeprotokoll 15.09.2026

## Pflicht-Header (bitte am Anfang jeder neuen Session lesen)

- **Verifikations-Disziplin:** Jede Behauptung über den Code-Stand in diesem Dokument wurde heute tatsächlich geprüft (Byte-Vergleich committeter Dateien gegen gelieferte Fassung, `py_compile`/`node --check`, teils gegen echte Live-Logs/Rohdaten). Wo etwas NICHT live verifiziert ist, steht das explizit dabei — nicht als "erledigt" behandeln, ohne selbst nachzuschauen.
- **Rate-Limit-Workaround:** `api.github.com` war heute mehrfach rate-limited (unauthenticated). Funktionierender Workaround: `https://github.com/<repo>/commit/<sha>.patch` oder `https://github.com/<repo>/raw/<branch>/<pfad>` statt der API — beide ohne Rate-Limit-Probleme.
- **CDN-Cache-Falle:** `raw.githubusercontent.com` zeigte heute nach einem Commit kurzzeitig einen veralteten Stand (Fastly-CDN-Propagationsverzögerung, keine Sekunden, eher 1-2 Minuten). Bei Verifikations-Zweifeln: `github.com/<repo>/raw/<branch>/<pfad>` (anderer Cache-Layer) oder kurz warten und erneut abrufen, bevor man einen echten Fehler vermutet.
- **Datei-Commit-Methode:** Der GitHub-Web-Editor (Copy-Paste in die Editier-Ansicht) hat heute bei `market_aggregator.py` zweimal zu einer kompletten Datei-Duplizierung geführt (alter Inhalt nicht vollständig ersetzt, neuer davor eingefügt — Datei am Ende ~3× so lang wie erwartet). **Zuverlässig funktioniert hat:** Datei löschen → "Add file" → "Upload files" (Drag & Drop der lokalen Datei, kein Text-Copy-Paste). Bei großen Dateien (>1000 Zeilen) diesen Weg bevorzugen.
- **Cloudflare Worker ≠ GitHub Commit:** Ein Commit auf `ahsub/workers` aktualisiert NICHT automatisch den laufenden Worker — zusätzlich `wrangler deploy` bzw. den Cloudflare-Dashboard-Weg nötig. Heute passiert (Axel hat es selbst nachgezogen), aber als Fußangel für künftige Worker-Änderungen im Kopf behalten.

---

## Heute abgeschlossen und verifiziert

### 1. `market_aggregator.py` (`ahsub/ko-aggregator`) — jetzt `AGGREGATOR_VERSION = "5.42.3"`
Finaler, sauber verifizierter Stand: `https://github.com/ahsub/ko-aggregator/commit/bc33d872c3a5510bb613057b6e26738c93d2a809` (Upload-Methode, byte-identisch mit gelieferter Fassung, keine Duplizierung, `py_compile` grün).

Drei echte Bugs gefunden und behoben, alle live gegen echte Daten verifiziert (nicht nur synthetisch):

- **sUaq-Fix (v5.42.0):** `score_underlying_assignment_quality()` lief in `build_leaderboards()` VOR dem Fundamental-Enrichment → Gate schlug für 100% der Kandidaten in allen 13 `top20()`-Leaderboards hart auf `0` zu; bei `long_dividend`/`long_value` sogar `None` (nie auf `results[]` zurückgeschrieben). Fix: `sUaq` nach Enrichment für alle `results[]` neu berechnen, auf `r` selbst schreiben, bereits gebaute Leaderboards nachsynchronisieren. **Live verifiziert:** zwei unabhängige Läufe (15.09., 12:56 und 14:46 Uhr), echte Wertstreuung (0/10/13/14/18/25/28/31/37/38/43/46/52/53/55) statt durchgängig 0.
- **Options-KI max_tokens-Fix (v5.42.1, teilweise überholt):** `enrich_options_watchlist_with_ai()`s erster Call hatte `max_tokens=500`, zu knapp für das volle Antwortschema → 24% Parse-Fehler (12/50). Erhöht auf 1000. Reduzierte Fehlerquote auf 12% (6/15 tatsächlich KI-behandelte Kandidaten, nicht 50 — nur `top15` der Watchlist bekommen KI-Enrichment).
- **Options-KI Fence-/Prompt-Fix (v5.42.2), zweite Iteration nach echtem Rohtext:** Erste Hypothese (nur überschüssige Fence-Zeile) war **falsch** — Diagnose-Logging zeigte zwei echte Muster: (a) valides JSON + Fence + lange Herleitung danach ("Extra data"), (b) Modell schreibt Herleitung VOR dem JSON, `max_tokens=150` beim zweiten Call (`strike_prompt`/EIC-Layer) reichte dann nicht mehr für das JSON selbst ("Expecting value"). Root Cause: `strike_prompt` hatte anders als der erste Call KEINE "kein Markdown"-Anweisung. Fix: Prompt verschärft + `_extract_json_object()` (Klammer-Extraktion statt Fence-Heuristik) statt `_strip_json_fence()`. **Live verifiziert:** 0/15 Fehler im Lauf danach (18:11-18:16 Uhr), inkl. aller vorher betroffenen Ticker.
- **Dritte Fundstelle behoben (v5.42.3):** Master-Shortlist-KI-Enrichment (`KI {sym}: Trigger=...`) hatte denselben alten Fence-Bug latent (heute keine Live-Fehler, da der Prompt hier bereits die starke Anweisung hatte — aber strukturell verwundbar). `_extract_json_object()` von lokal-verschachtelt auf **Modulebene** gehoben (verhindert dritte Code-Kopie), Master-Shortlist nutzt jetzt dieselbe Funktion + dasselbe Diagnose-Logging.
- **Freshness-Fix** (`_dataAsOf`, bereits vor heute committet) zusätzlich heute gegen echten Lauf bestätigt: `732 aktuell · 3 veraltet` (von 735) statt dem alten `0 aktuell · N veraltet`-Bug.

### 2. `Version-Lint.yml` → `version-lint.yml` (`ahsub/ko-aggregator/.github/workflows/`)
Neuer, eigenständiger GHA-Workflow — erzwingt (nicht nur dokumentiert) einen `AGGREGATOR_VERSION`-Bump bei jeder Änderung an `market_aggregator.py` (roter Check sonst). Grund: Der alte Warnkommentar im Code allein hat das wiederholte Vergessen (v5.31.0-v5.36.0, dann heute nochmal) nicht verhindert. Lokal gegen drei Szenarien getestet (Änderung ohne Bump → Fail, mit Bump → Pass, Datei unberührt → kein Trigger). Live verifiziert: `https://github.com/ahsub/ko-aggregator/commit/93e1c44567eee30132a52d6a69a8acb3a06fd6b2` (finaler Name nach Rename).

### 3. AI-Budget-Logging — zwei Teile, beide live bestätigt funktionsfähig
- **`generate_public_recommendations.js`** (`ahsub/UIQ-Suite/scripts/`, Baustein 8b): `AI_BUDGET_LOG`-Array, schreibt aggregiert nach `internal/ai_budget/{date}` in Cloudflare KV (Owner-only). Deckt den `public_digest`-Pfad ab. Commit: `60b51cdda199cc228004d231fdd429e252073fde`, verifiziert.
- **`ko-ai-worker.js`** (`ahsub/workers`, jetzt `v1.23`): `recordAiBudgetEntry()`, ein KV-Eintrag pro Call (`budget:{date}:{timestamp}`, bewusst nicht aggregiert wegen KV-Race-Conditions), neuer Lese-Zweig `/logs?budget=1` (optional `&date=`). Deckt die Live-Pfade ab (`morning`, `ki_briefing` inkl. EIC, `oversold`, `meta_analysis`, `deep_dive`, `dark_pool`, `eic`). Commit `7b714e8b97284828cbe53a114cc066c41d84d4e2`, **UND** in Cloudflare deployed (von Axel bestätigt) — **live getestet:** `curl .../logs?budget=1&token=...` zeigte nach einem echten `ki_briefing`-Call einen korrekten Eintrag (`tokenInput: 29140, tokenOutput: 2063`).
- Beide: Preis-Konstanten bewusst `null` (Anthropic-Preise in der Sandbox nicht verifizierbar) — `token_input`/`token_output` sind trotzdem ab sofort verlässlich, `estimated_cost_usd` erst nach manueller Befüllung der Konstanten.

### 4. Nebenbefund: EIC-Auto-Lock (kein Bug, aufgeklärt)
Ein KI-Briefing-Call im vermeintlichen EIC-Modus zeigte `expertMode:false` im Budget-Log. Ursache gefunden (`index.html`, `ahsub/axel-scanner`): `_eicUnlocked` sperrt sich automatisch nach 10 Minuten (`lockEicEditor()`), unabhängig vom sichtbaren Experten-Toggle — mit korrekter Nutzerbenachrichtigung (Toast "Expert-Modus deaktiviert — EIC gesperrt", Checkbox wird sichtbar zurückgesetzt). Kein Fix nötig, funktioniert wie gebaut.

---

## Für morgen — Arbeitsplanung, in Prioritätsreihenfolge

### Sofort, vor allem anderen: zwei Token rotieren
Beide sind im heutigen Chat-Verlauf im Klartext gelandet:
1. Cloudflare-Worker-Bearer-Token (`d64e3d9f...`)
2. `STATIC_TOKEN` für den `/logs`-Endpoint (`uiq-a7f3c9b2...`)

Reine Sicherheitshygiene, unabhängig vom Rest — sollte als Erstes erledigt werden, bevor inhaltlich weitergearbeitet wird.

### Hauptthema: Fairer-Preis-Integration — Kette, nicht Einzelpunkt
Vereinbarte Reihenfolge (bestätigt 10.09.2026, heute nochmal bekräftigt):

1. **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung** (Reviewer-Vorschlag vom 07.09.: Value=Style, VCP=Setup, KO Long=Vehicle) — der eigentliche nächste actionable Schritt, noch nicht begonnen. Fair-Value wäre architektonisch die Umsetzung der "Value"-Style-Ebene, deshalb muss diese Entscheidung zuerst stehen.
2. **Fair-Value-Engine + eigenständiger Backtest**, bevor sie irgendwo eingebaut wird — Reviewer-Vorbehalt: *"wenn Fair Value stark mit bestehenden UIQ-Signalen korreliert, fliegt es aus dem Modell"*.
3. **Erst danach** DCE-Design mit Fair-Value als validierter Eingabedimension.

→ Morgen realistisch: mit Schritt 1 (Ontologie-Entscheidung) beginnen, nicht direkt mit der Fair-Value-Engine.

### Zweites Thema: Backlog #64 — `score_options_atmna()`
Bestätigt fehlend (nur `_get_atmna_flag()` vorhanden, regime-weiter Ampel-Tag, kein Score pro Ticker). Eigenständig von der Fair-Value-Kette, kann parallel oder danach angegangen werden.

### Drittes Thema (heute Abend ergänzt): fünf Options-Strategien in den Digest aufnehmen
Aus der Digest-Cache-First-Entscheidung vom 13.09. explizit zurückgestellt: `csp_wheel`/`cc`/`collar`/`atmna`/`weekly_income` laufen bisher NICHT über den nächtlich generierten, gecachten Pfad (`generate_public_recommendations.js` → `public/ai_output/latest/{strategy}`) — nur die 10 Equity-/KO-Strategien wurden umgestellt. Diese fünf laufen weiterhin ausschließlich live bei Bedarf über `ko-ai-worker.js`. Streng genommen dieselbe Kosten-/Konsistenzlogik wie beim 13.09.-Umbau — noch nicht begonnen, kein Umsetzungsstand vorhanden. Sollte vor dem eigentlichen Umbau geklärt werden: hängt das mit Backlog #64 zusammen (macht ein fehlender `score_options_atmna()`-Score die Digest-Integration für `atmna` schwieriger), oder sind beide unabhängig genug, um in beliebiger Reihenfolge anzugehen?

### Optional, kein Muss
- Sauberer EIC-Test: PIN neu eingeben, **innerhalb** von 10 Minuten einen `ki_briefing`-Call auslösen, danach `/logs?budget=1` prüfen — sollte jetzt `expertMode:true` zeigen. Nur zur zusätzlichen Bestätigung, die Diskrepanz von heute ist bereits inhaltlich geklärt.

### Bewusst weiterhin zurückgestellt (nicht vergessen, nur nicht priorisiert)
- Öffentliches Literaturverzeichnis (seit 08.09. vorgemerkt)
- Bull Put Spread / Iron Condor / Calendar Spread (Reviewer-Vorschlag, explizit erst nach Bewährung der Master-Prompts)
- IWV-Holdings-Update (`ahsub/ko-aggregator/data/iwv_holdings.csv`) — regelmäßiger monatlicher Task, letzter Stand 27.07., wäre inzwischen fällig zu prüfen
