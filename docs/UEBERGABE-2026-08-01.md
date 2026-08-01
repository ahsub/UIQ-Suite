# ÜBERGABE 2026-08-01 (FINAL) — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 01.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v422** | `1d4b7c453c` |
| ko-trackrecord.js | v1.0.2 | `e4f9329721` |
| ko-prompts.js | v2.5.0 | `84611613` |
| **SUITE.md** | **v3.2** | `d74325c19f` |
| **Aggregator** | **v5.20.0** | `bb569023d9` |
| GHA letzter Run | #174 — ✅ success | 01.08.2026 06:15 UTC |
| IWV Holdings | 24.07.2026 | `d63d29e9b5` |

---

## Vollständige Commit-Liste heute

### axel-scanner (6 Commits)
- `665ab4556f` — v417: DE-Modus TRADEGATE_MAP +18, IWV Top-100 Preset
- `f2afbbcebc` — v418: ko-trackrecord CDN-Hash a3d667c9→ac331b8f
- `5cf9104afa` — v419: autoSyncOnStart 401 Fix
- `da8289e3be` — v420: updateScoreDivergenceDisplay TypeError Fix
- `7ee922c602` — v421: TrackRecord 401 Fix (/sync/ + X-UIQ-Token)
- `1d4b7c453c` — v422: TrackRecord CORS Fix (Cache-Control aus Headers)

### ko-modules (3 Commits)
- `ac331b8f7b` — ko-trackrecord.js v1.0.0: export{} SyntaxError behoben
- `5491c2b379` — ko-trackrecord.js v1.0.1: /sync/ + X-UIQ-Token
- `e4f9329721` — ko-trackrecord.js v1.0.2: Cache-Control CORS-Fix

### ko-aggregator (1 Commit)
- `bb569023d9` — v5.20.0: net_liquidity MCM-Parität geschlossen

### UIQ-Suite (3 Commits)
- `e59333706d` — UEBERGABE-2026-08-01.md (Zwischen-Protokoll)
- `d74325c19f` — SUITE.md v3.2
- (dieses Protokoll)

---

## CDN-Hashes (aktuell)

| Modul | Hash |
|---|---|
| ko-trackrecord.js | `e4f93297` |
| ko-prompts.js | `84611613` |
| ko-strategies.js | `5dc8356088` |
| ko-indicators-loader.js | v1.4.0 (unverändert) |

---

## Bugfixes dieser Session (5 Stück)

| v | Bug | Root-Cause | Fix |
|---|---|---|---|
| v418 | ko-trackrecord SyntaxError | `export{}` in classic `<script>` | Zeile entfernt |
| v419 | autoSyncOnStart 401 | kein Auth-Header + kein hasToken()-Guard | `_headers()` + Guard |
| v420 | updateScoreDivergenceDisplay TypeError | `divs.slice()` self-reference | vollständiger Pfad |
| v421 | TrackRecord 401 | `/public/tr:stats` kein Auth | `/sync/` + Token |
| v422 | TrackRecord CORS | `Cache-Control`-Header → Preflight | Header entfernt |

---

## Features dieser Session

### DE-Modus (v417) ✅ verifiziert
- TRADEGATE_MAP +18 Einträge (live getestet: KO→CCC3, CSCO→CSC0, BRKB→BRY, PG→PGG, T→RHAT ✅)
- TG-Premarket Preset: IWV Top-100 statt nur TRADEGATE_MAP-Keys

### MCM-Parität vollständig (aggregator v5.20.0)
- `net_liquidity` als letzter fehlender Faktor: caution wenn trend_4w ≤ 0
- Alle 10 Kern-Faktoren + 3 Calendar: Server↔Client parität

---

## Offene Punkte für nächste Session

### P1 — Track-Record tr:stats Diagnose (WICHTIG)
**Symptom:** Track-Record-Tab zeigt "HTTP 404" — `tr:stats` existiert nicht in KV.

**Analyse:**
- h7-Horizont wäre seit ~15.07. fällig (7 + 3 Buffer SPY-Bars)
- Heute: ~21 Handelstage seit Tag 0 → h7 MUSS längst bewertet sein
- `tr:stats` wird nur geschrieben wenn `changed` nicht leer in `run_evaluation()`
- Wahrscheinlich: h7-Flags bereits auf `True` in `tr:index`, aber `tr:stats`
  wurde beim damaligen Schreiben nie in KV gespeichert (KV-Fehler?)

**Nächste Session — Diagnose-Schritte:**
1. CF-Dashboard KV-Namespace öffnen → prüfen ob `tr:eval:2026-07-11` (o.ä.) existiert
2. Falls `tr:eval:*` vorhanden aber kein `tr:stats`: `_aggregate_stats()` manuell
   triggern oder `tr:index` resetten damit Evaluation nochmal läuft
3. GHA-Log Run #174 auf TR-Zeilen prüfen (im CF-Dashboard Worker-Logs)

### P2 — market_strip_snapshot 400 (CF-Dashboard)
Worker-Allowlist kennt `market_strip_snapshot` nicht → 400.
**Fix:** CF-Dashboard → ko-sync Worker → Key-Allowlist → `market_strip_snapshot` ergänzen.
Kein Code-Change nötig. Home-Strip läuft über Live-Fallback, kein Blocker.

### P3 — vix/vix_term/mse_regime KV-Datenlücken
Client-MCM: dataQuality 7/10 (fehlend: vix, vix_term, mse_regime).
Erhöht Qualität auf 10/10 — mittlerer Sprint.

### P4 — Strategie-Ampel-Reihenfolge (#13a) + CC als 12. Slot
Kosmetisch, kein eigener Sprint nötig.

---

## PAT-Verwaltung
- **Heutiger PAT** `[REVOKE-SOFORT]`:
  **SOFORT REVOKEN** → https://github.com/settings/tokens
- Nächste Session: frischen PAT generieren, als erstes mitteilen
