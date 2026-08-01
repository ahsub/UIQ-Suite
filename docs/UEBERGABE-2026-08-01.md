# ÜBERGABE 2026-08-01 (final) — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 01.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v420** | `da8289e3be` |
| ko-trackrecord.js | bugfix (export entfernt) | `ac331b8f7b` |
| ko-prompts.js | v2.5.0 | `84611613` |
| **SUITE.md** | **v3.2** | `d74325c19f` |
| **Aggregator** | **v5.20.0** | `bb569023d9` |
| GHA letzter Run | #174 — ✅ success | 01.08.2026 06:15 UTC |
| IWV Holdings | 24.07.2026 | `d63d29e9b5` |

---

## Session 01.08.2026 — vollständige Commit-Liste

### axel-scanner (5 Commits)
- `665ab4556f` — **v417**: DE-Modus: TRADEGATE_MAP +18, TG-Preset IWV Top-100
- `f2afbbcebc` — **v418**: ko-trackrecord CDN-Hash `a3d667c9`→`ac331b8f`
- `5cf9104afa` — **v419**: autoSyncOnStart 401 Fix
- `da8289e3be` — **v420**: updateScoreDivergenceDisplay TypeError Fix

### ko-modules (1 Commit)
- `ac331b8f7b` — ko-trackrecord.js: `export{}` entfernt (SyntaxError fix)

### ko-aggregator (1 Commit)
- `bb569023d9` — **v5.20.0**: net_liquidity MCM-Parität geschlossen

### UIQ-Suite (2 Commits)
- `e59333706d` — UEBERGABE-2026-08-01.md (Zwischen-Protokoll)
- `d74325c19f` — SUITE.md v3.2

---

## Was wurde gebaut

### Feature: DE-Modus Erweiterung (v417)
- TRADEGATE_MAP: +18 verifizierte Einträge
- TG-Premarket Preset: IWV Top-100 statt nur TRADEGATE_MAP-Keys
- Live verifiziert im Browser: `getTradegateSym('KO')` → CCC3 ✅ etc.

### Feature: MCM-Parität vollständig (aggregator v5.20.0)
- `net_liquidity` als letzter fehlender Faktor ergänzt
- `_MCM_SIGNAL_RULES["net_liquidity"]`: caution wenn trend_4w ≤ 0
- `build_server_market_context()`: liest `fredMacro.net_liquidity.trend_4w`
- Alle 10 Kern-Faktoren + 3 Calendar jetzt Server↔Client-parität

### Bugfixes (v418–v420)
| Bug | Root-Cause | Fix |
|---|---|---|
| SyntaxError ko-trackrecord | `export{}` im classic `<script>` | Zeile entfernt |
| 401 autoSyncOnStart | kein Auth-Header + kein hasToken()-Guard | `_headers()` + Guard |
| TypeError updateScoreDivergenceDisplay | `divs.slice()` self-reference | vollständiger Pfad |

---

## CDN-Hashes (aktuell)

| Modul | Hash |
|---|---|
| ko-trackrecord.js | `ac331b8f` |
| ko-prompts.js | `84611613` |
| ko-strategies.js | `5dc8356088` |
| ko-indicators-loader.js | v1.4.0 |

---

## Backlog-Status nach dieser Session

### ✅ Heute erledigt
| # | Was |
|---|---|
| #25 | DE-Modus: TRADEGATE_MAP +18 + IWV Top-100 Preset |
| #17 | MCM-Parität vollständig (net_liquidity als letztes Puzzlestück) |
| — | 3 Bugfixes (v418–v420) |

### ⏳ Nächste Sprints (Prio-Reihenfolge)
| Prio | Was |
|---|---|
| 🟡 P1 | **Track-Record Phase C live prüfen** — EIC-Modus → Track-Record-Tab öffnen, tr:stats Matrix prüfen (h30-Daten ab 01.08. vorhanden?) |
| 🟡 P2 | **vix/vix_term/mse_regime KV-Datenlücken** — Client-MCM zeigt 7/10 Kern (fehlend: vix,vix_term,mse_regime); erhöht dataQuality auf 10/10 |
| 🟡 P3 | Strategie-Ampel-Reihenfolge (#13a) + CC als 12. Slot |
| ⏳ | OpenBB IV-Rank (#15) — erst ab 12.08. |

### 📋 Neu identifiziert (noch kein Backlog-Item)
- `[sendMacroState] Breadth null` — Timing-Problem, `_nasdaqBreadthData`
  beim ersten Aufruf noch nicht geladen; kein kritischer Bug

---

## Technische Hinweise

### TRADEGATE_MAP Verifikation
18 neue Einträge aus institutionellem Wissen — live verifiziert:
KO→CCC3 ✅, CSCO→CSC0 ✅, BRKB→BRY ✅, PG→PGG ✅, T→RHAT ✅
Bei nächstem TG-Scan weiter stichprobenartig prüfen.

### MCM Console-Log Erwartung (nach v5.20.0 nächster GHA-Lauf)
`net_liquidity` sollte nicht mehr als `caution`-Flag ohne Server-Pendant erscheinen.
dataQuality bleibt bei 7/10 bis vix/vix_term/mse_regime-Lücken geschlossen werden.

---

## PAT-Verwaltung
- **Heutiger PAT** `[REVOKE-SOFORT]`:
  **SOFORT REVOKEN** → https://github.com/settings/tokens
- Nächste Session: frischen PAT generieren, als erstes mitteilen
