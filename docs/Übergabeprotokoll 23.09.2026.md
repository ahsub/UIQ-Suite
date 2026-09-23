# UIQ — Übergabeprotokoll 23.09.2026 → 24.09.2026

**Datum:** 23.09.2026
**Status:** Session-Ende, sauberer Schnitt nach Phase A+B der TICKER_MASTER-Migration
**Zweck:** Kontext-Übergabe für den nächsten Chat (dieser Chat ist mehrfach komprimiert und sehr voll)

---

## Pflicht-Header (bitte am Anfang der neuen Session lesen)

* **Never guess, always correctly diagnose:** ein plausibler Fix ohne verifizierten Root-Cause-Beleg gilt als Vermutung, kein Fix. Siehe SUITE.md Grundgesetz #9.
* **Verifikations-Disziplin:** jeder Commit wird per `web_fetch` gegen die echte GitHub-Diff geprüft (Zeilenzahl UND Inhalt wo möglich), nie blind als "erledigt" angenommen.
* **Rate-Limit-Workaround:** `github.com/<repo>/commit/<sha>` (nicht `.patch`) als Fetch-URL, funktioniert zuverlässig für Diff-Verifikation.
* **CDN-Cache-Falle:** `raw.githubusercontent.com` kann 1-2min veraltet sein.
* **Datei-Commit-Methode:** bei größeren Dateien Löschen→Upload oder direkter Web-Upload, kein Web-Editor-Copy-Paste bei >1000 Zeilen.
* **Cloudflare Worker ≠ GitHub Commit:** `wrangler deploy` zusätzlich nötig.
* **Vendor-Drift-Konstante** (`KO_MODULES_VENDOR_DRIFT_COMMIT` in `generate_public_recommendations.js`) IMMER mitziehen, wenn `ko-prompts.js` einen neuen Commit bekommt — heute gleich zweimal vergessen und nachträglich gefixt. Checkliste bei jedem `ko-prompts.js`-Update: Quelle (`ko-modules`) → Vendor-Kopie (`UIQ-Suite`) → CDN-Pin (`axel-scanner/index.html`) → `KO_MODULES_VENDOR_DRIFT_COMMIT` (`generate_public_recommendations.js`). **Vier Stellen, nicht drei.**

---

## Stand nach heutiger Session (23.09.2026)

### 1. UIQ-Kernbetrieb (v2.54.2, Root-Cause-Fix top3-ticker-konsistenz)
→ committed, live verifiziert (15/15 Strategien, 23.09. 03:51 UTC)
→ Concurrency-Guard in `market-aggregator.yml` aktiv
→ SUITE.md Grundgesetz #9 erweitert
→ **Status: STABIL, kein offener Punkt**

### 2. earnings_invest — Phase 0 Feasibility CLOSURE abgeschlossen (A/B/C)
→ `EARNINGS-INVEST-STRATEGY.md` + `EARNINGS-INVEST-PHASE0-FEASIBILITY.md` in `UIQ-Suite/docs/` committed
→ `earnings_estimates_archive.py` (v0.3) + Tests in `ko-aggregator` committed, Free-Tier-sicher (Tagesbudget-Tracking statt fixer Zahl)
→ **Noch offen:** erster echter (Nicht-Dry-Run-)Archivlauf, dann Phase 1 (Feature Specification)

### 3. Prompt Caching (`ko-prompts.js` v2.54.3, `generate_public_recommendations.js` v1.21)
→ committed, verifiziert
→ `SHARED_STATIC_PREFIX` (~7.200 Token, identisch über alle 15 Strategien) wird jetzt gecacht (Anthropic Prompt Caching, bis 90% Rabatt auf Cache-Hits)
→ **Noch offen:** Live-Test — Budget-Log des nächsten Nachtlaufs prüfen, ob Kosten tatsächlich sinken

### 4. Abschnitt-7+8-Templating (`ko-prompts.js` v2.54.4, `generate_public_recommendations.js` v1.22)
→ committed, verifiziert
→ Abschnitt 7 ("Was UIQ ableiten kann") + Abschnitt 8 ("Modell-Grenze") werden nicht mehr vom LLM erzeugt, sondern deterministisch app-seitig eingefügt (spart Input+Output-Token zusätzlich zum Caching)
→ Golden-Test (alle 15 Strategien) + 5 Szenario-Tests + vollständiger E2E-Test grün
→ Nebenfund: `value.prompt(ctx)` baute bislang ein komplett neues ctx-Objekt statt das Original durchzureichen (Datenverlust bei allen ctx-Feldern außer `marktkontext`) — gefixt
→ **Noch offen:** Live-Test mit echtem Modell-Output (prüft insbesondere, ob das Modell den Übergangshinweis 6→9 zuverlässig befolgt)

### 5. TICKER_MASTER-Migration — Phase A + B abgeschlossen, Phase C zurückgestellt
→ Phase A: 767 Ticker auditiert, 0 echte Konflikte (Konflikt-Detektor selbst mit 4 synthetischen Fällen verifiziert)
→ Phase B: `TICKER_MASTER` automatisch generiert, 5/5 Tests grün (Universe 679=679, Sector Tags 217, Leaderboard Tags 561, Pro-Ticker-Volldiff 818, Mutationstest 4/4)
→ Wichtiger Befund, bewusst NICHT korrigiert, nur dokumentiert: DAX40/MDAX/TECDAX/EuroStoxx-Legacy/FTSE100/StoxxEuExtra sind überwiegend NICHT im tatsächlichen Scan-Universum (nur Leaderboard-Anzeige-Listen, ohne Wirkung auf `build_ticker_universe()`)
→ Dokumentiert in `TICKER-MASTER-MIGRATION-PHASE-AB.md`
→ **NOCH NICHT COMMITTED:** `audit_ticker_sources.py`, `migrate_ticker_master_phase_b.py`, `audit_result.json`, `ticker_master.json`, `TICKER-MASTER-MIGRATION-PHASE-AB.md`

**Zielpfade für die fünf ausstehenden Dateien:**

| Datei | Zielrepo/-pfad |
|---|---|
| `TICKER-MASTER-MIGRATION-PHASE-AB.md` | `UIQ-Suite/docs/` |
| `audit_ticker_sources.py` | `ko-aggregator/` (Repo-Root) |
| `migrate_ticker_master_phase_b.py` | `ko-aggregator/` (Repo-Root) |
| `audit_result.json` | `ko-aggregator/` (Repo-Root) |
| `ticker_master.json` | `ko-aggregator/` (Repo-Root) |

---

## Roadmap für 24.09.2026

*(Priorität, keine feste Reihenfolge — je nach Tagesform/Zeit)*

**A. Ticker-Migrationsdateien committen** (5 Minuten, sollte zuerst passieren, damit nichts verloren geht)

**B. Phase C der TICKER_MASTER-Migration** (die eigentlich riskante Phase — siehe `TICKER-MASTER-MIGRATION-PHASE-AB.md` Abschnitt 5 für den 10-Schritte-Plan). NICHT an einem Tag durchziehen, wenn wenig Zeit ist — lieber sauber Schritt 1-6 (Master als SSOT, alte Listen als abgeleitete Compatibility-Layer) an einem Tag, Schritt 7-10 (Vergleichstest, Entfernen der alten Quellen, E2E, echter GHA-Lauf) an einem anderen.

**C. DAX40/MDAX/TECDAX/FTSE100/EuroStoxx-Befund** — Entscheidung, ob/wie behoben wird (separat von Phase C selbst zu entscheiden)

**D. Live-Tests der beiden heutigen Kostenoptimierungen** (Prompt Caching + Abschnitt-7+8-Templating) — Budget-Log nach dem nächsten Nachtlauf prüfen

**E. earnings_invest:** erster echter Archivlauf (`earnings_estimates_archive.py`), danach Entscheidung über Phase 1 (Feature Specification)

**F. Falls Zeit bleibt:** `market_aggregator.py` — Earnings-Vorfilter-Frage für die dortigen KI-Enrichment-Funktionen (`enrich_shortlist_with_ai()`/`enrich_options_watchlist_with_ai()`, Backlog #61) — angefangen zu klären, nicht abgeschlossen (die Datei liegt inzwischen vor, s. heutigen Upload)

---

## Sonstiges

**BaFin-Voranfrage:** weiterhin Wartestand (Deutsche Bundesbank, Hauptverwaltung Hannover), keine Aktion nötig, nur zur Erinnerung.
