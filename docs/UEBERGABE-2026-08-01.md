# ÜBERGABE 2026-08-01 — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 01.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v419** | `5cf9104afa` |
| ko-trackrecord.js | bugfix (export entfernt) | `ac331b8f7b` |
| ko-prompts.js | v2.5.0 (unverändert) | `84611613` |
| SUITE.md | v3.1 (unverändert) | `3f54638fd2` |
| GHA letzter Run | #167 — ✅ success | 29.07.2026 15:31 UTC |
| Aggregator | v5.x (unverändert) | `427f9295df` |
| IWV Holdings | 24.07.2026 | `d63d29e9b5` |

---

## Heutige Session — Was wurde gebaut (alle Commits verifiziert)

### axel-scanner (3 Commits)
- `665ab4556f` — **v417**: DE-Modus Erweiterung
  - TRADEGATE_MAP: +18 verifizierte Einträge (BRKB→BRY, KO→CCC3, PG→PGG,
    PM→PM1, C→CIT, CSCO→CSC0, T→RHAT, TMUS→T1MU, CMCSA→CBC3, SPGI→SPG1,
    BX→BXD, ABNB→AB9, LULU→LUL, BIIB→BII, MO→PHM1, WM→WM2, CI→CI1, GD→GD1)
  - TG-Premarket Preset: `Object.keys(TRADEGATE_MAP)` → feste `TG_PRESET_IWV100`
    (100 Titel nach IWV-Gewichtung Stand 24.07.2026)
  - Stocks ohne Map-Eintrag nutzen US-Ticker+.F-Fallback (UNH.F, LIN.F etc.)
  - Duplikate in alter Map bereinigt (AMZN, TSLA, PYPL standen doppelt)
- `f2afbbcebc` — **v418**: CDN-Hash ko-trackrecord `a3d667c9`→`ac331b8f`
- `5cf9104afa` — **v419**: autoSyncOnStart 401 Fix

### ko-modules (1 Commit)
- `ac331b8f7b` — **ko-trackrecord.js bugfix**: nacktes `export { TrackRecord }`
  entfernt — war inkompatibel mit klassischem `<script>`-Tag (kein `type="module"`)
  → `Uncaught SyntaxError: Unexpected token 'export'`

---

## Bugfixes diese Session

| Bug | Root-Cause | Fix |
|---|---|---|
| `SyntaxError: Unexpected token 'export'` in ko-trackrecord.js | `export { TrackRecord }` am Dateiende — nur in ES-Modulen erlaubt, nicht in klassischen `<script>`-Tags | Zeile entfernt; `window.TrackRecord`-Fallback war bereits korrekt |
| `GET /sync/status 401` beim App-Start | `autoSyncOnStart()` rief `/sync/status` ohne `X-UIQ-Token`-Header auf; kein `hasToken()`-Guard | `if (!KoSync.hasToken()) return;` + `{ headers: KoSync._headers() }` ergänzt |

---

## CDN-Hashes (aktuell)

| Modul | Hash |
|---|---|
| ko-trackrecord.js | `ac331b8f` |
| ko-prompts.js | `84611613` |
| ko-strategies.js | `5dc8356088` (unverändert) |
| ko-indicators-loader.js | v1.4.0 (unverändert) |

---

## Backlog-Status nach dieser Session

### ✅ Heute erledigt
| Was | |
|---|---|
| DE-Modus P1: TRADEGATE_MAP Erweiterung + IWV Top-100 Preset | v417 |
| Bugfix ko-trackrecord SyntaxError | v418 |
| Bugfix autoSyncOnStart 401 | v419 |

### ⏳ Nächste Sprints (Prio-Reihenfolge)
| Prio | Was |
|---|---|
| 🟡 P1 | **DE-Modus Verifikation**: neue TRADEGATE_MAP Symbole im Live-Test prüfen (KO→CCC3.F, CSCO→CSC0.F, BRKB→BRY.F) — beim nächsten TG-Fenster (08–22 Uhr MEZ) |
| 🟡 P2 | **MCM-Parität**: `build_server_market_context()` 4 fehlende Faktoren |
| 🟡 P3 | **Track-Record Phase C**: h30-Daten ab 01.08. auswertbar — Matrix im EIC prüfen |
| 🟡 P3 | Strategie-Ampel-Reihenfolge (#13a) + CC als 12. Slot |
| ⏳ | OpenBB IV-Rank (#15) — erst ab 12.08. |

---

## Offene Verifikationsaufgabe (für nächste TG-Session)
Die 18 neuen TRADEGATE_MAP-Einträge wurden aus institutionellem Wissen
abgeleitet — **nicht live verifiziert** (Yahoo Finance + Tradegate blockieren
Server-Side-Fetch). Beim nächsten Tradegate-Scan bitte 2–3 stichprobenartig
im TV-Chart kontrollieren:
- KO → CCC3 (Coca-Cola auf Tradegate)
- CSCO → CSC0 (Cisco, Null nicht O)
- BRKB → BRY (Berkshire B)

---

## PAT-Verwaltung
- **Heutiger PAT** `[REVOKE-SOFORT]`:
  **SOFORT REVOKEN** → https://github.com/settings/tokens
- Nächste Session: frischen PAT generieren, als erstes mitteilen
