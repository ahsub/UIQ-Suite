# ÜBERGABE 2026-07-30 — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 30.07.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v415** | `b82b3a429e` |
| ko-prompts.js | v2.5.0 | `84611613` |
| ko-modules letzter Commit | `84611613` | feat(prompts): lbKey + getLbKey/stratFromLb |
| SUITE.md | v3.1 | `3f54638fd2` |
| GHA letzter Run | #167 — ✅ success | 29.07.2026 15:31 UTC |
| Aggregator | v5.x (unverändert) | `427f9295df` |
| IWV Holdings | 24.07.2026 | `d63d29e9b5` |

---

## Heutige Session — Was wurde gebaut (alle Commits verifiziert)

### ko-modules (2 Commits)
- `422f28ce` — **ko-prompts.js v2.4.0**: `getIntermarketPrompt` + `getOversoldPrompt` + `getMetaAnalysisPrompt`
- `84611613` — **ko-prompts.js v2.5.0**: `lbKey`-Felder in allen 14 Strategien + `getLbKey`/`stratFromLb`/`getStratToLbMap`

### axel-scanner (3 Commits)
- `c352f64c` — **v414**: ko-prompts-registry Sprint 2 — 3 Inline-Prompts externalisiert
- `7f70a1e8` — **v414 fix**: CDN-Hash korrigiert (blob-SHA → Commit-SHA)
- `b82b3a42` — **v415**: ko-indicators-registry Sprint — STRATEGY_TO_LB + _lbToStrat entfernt

### ko-aggregator
- `d63d29e9` — IWV Holdings CSV aktualisiert (Stand 24.07.2026)

### UIQ-Suite
- `3f54638f` — SUITE.md v3.1 — Backlog #23+24 als erledigt markiert

---

## Backlog-Status nach dieser Session

### ✅ Heute erledigt
| # | Was |
|---|---|
| #23 | ko-prompts-registry Sprint 2: alle KI-Prompts externalisiert (v414) |
| #24 | ko-indicators-registry Sprint: STRATEGY_TO_LB + _lbToStrat → Single Source of Truth (v415) |
| — | IWV Holdings CSV Update 24.07.2026 |

### ⏳ Nächste Sprints (Prio-Reihenfolge)
| Prio | Was |
|---|---|
| 🟡 P1 | **DE-Modus** via Tradegate-API (Pre-Market Scanner 08:00–22:00 MEZ) |
| 🟡 P2 | **MCM-Parität**: `build_server_market_context()` 4 fehlende Faktoren |
| 🟡 P3 | Strategie-Ampel-Reihenfolge (#13a) + CC als 12. Slot — kosmetisch, kein eigener Sprint nötig |
| 🟡 P3 | **Track-Record Phase C**: Papertrading Modus A+B (ab ~02.08.) |
| ⏳ | OpenBB IV-Rank (#15) — erst ab 12.08. |
| ⏳ | sizingMultiplier (#22) + regimeConfidence (#21) — September |

### 📅 Zeitkritisch
- **Track-Record Tag 30**: ~01.08.2026 — erste `hit30`-Metriken auswertbar
- **IWV Holdings** ✅ erledigt (Stand 24.07.2026)

---

## Technische Hinweise für nächste Session

### CDN-Hashes (aktuell)
| Modul | Hash |
|---|---|
| ko-prompts.js | `84611613` |
| ko-strategies.js | `5dc8356088` (unverändert) |
| ko-indicators-loader.js | v1.4.0 (unverändert) |

### Neue API in ko-prompts.js v2.5.0
```js
KoPrompts.getLbKey('ko')           // → 'ko_long'
KoPrompts.getLbKey('atmna')        // → null (kein LB-Tab)
KoPrompts.stratFromLb('ko_long')   // → 'ko'
KoPrompts.getStratToLbMap()        // → { ko: 'ko_long', momentum: 'long_minervini', ... }
KoPrompts.getIntermarketPrompt(ctx) // → Makro-Analyse-Prompt-String
KoPrompts.getOversoldPrompt(ctx)    // → Oversold-Scan-Prompt-String
KoPrompts.getMetaAnalysisPrompt(ctx) // → Meta-Analyse-Prompt-String
```

### Bekannte Altlast (kein Bug, kein Handlungsbedarf heute)
- `ko-strategies.js` hat `options` als Key statt `csp_wheel` — Alias-Altlast,
  funktioniert da `KI_STRAT_CONFIG` aus `ko-prompts.js` (mit `csp_wheel`) kommt.
  Bei Gelegenheit bereinigen, kein eigener Sprint.

### Bestandsaufnahme-Lernpunkt (für zukünftige Modularisierungs-Sprints)
- Geplanter "DOM-Reads → getIndicatorValue()"-Umbau ergab nach Analyse:
  `getIndicatorValue()` macht intern ebenfalls `getElementById()` — kein Gewinn
  für reine DOM-Reads ohne aggregatorKey-Fallback. Scope rechtzeitig umgelenkt.
- Methode: Erst Bestandsaufnahme + Nutzwert-Analyse, dann Bau. Bewährt.

---

## PAT-Verwaltung
- **Heutiger PAT** `[REVOKE-SOFORT]`:
  **SOFORT REVOKEN** → https://github.com/settings/tokens
- Nächste Session: frischen PAT generieren, als erstes mitteilen