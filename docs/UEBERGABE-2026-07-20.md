## PFLICHT-HEADER

Dieses Dokument beschreibt einen behaupteten Zustand — nicht eigenes Wissen.
Axel: "hast du das verifiziert oder übernommen?" bei jedem Zitat.

**Arbeitsregel (unwiderruflich):** Bei Laufzeit-Bugs IMMER Konsolen-Check
zuerst, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.
(In SUITE.md Grundgesetz 9 verankert.)

---

# ÜBERGABEPROTOKOLL — 20.07.2026 (Tagesabschluss)

## Versionsverlauf heute

| Version | Was |
|---|---|
| v376 | BUGFIX Ampel-Diskrepanz MB-Tearsheet: `showMorningTearsheet()` las `getStrategyGates()` direkt — liefert Basis-Gates OHNE MCM-Context-Downgrades. Beide Pfade (frisch + Cache) auf `_lastMseResult` umgestellt. |
| v377 | BUGFIX KI-Prompts: 4 Prompt-Kontexte (Options beste Kombi, CSP/CC/Collar, Best-Opportunity, Leaderboard) nutzten `_lastQqqRegime` oder `mseRegime` ohne Gate-Farben. Neuer Helper `_getMcmContextForPrompt()` als Single Source of Truth. |
| v378 | BUGFIX Tearsheet-Timing: `openCachedBriefing()` öffnete sofort aus localStorage-Cache — `_lastMseResult` hatte noch keine MCM-Downgrades. Fix: wartet auf `ko:regimeChanged`, 3s-Fallback. |
| v379 | BUGFIX `STRATEGIE_MATRIX` Prioritätsregel: KI ignorierte MCM-Context-Downgrades weil STRATEGIE_MATRIX-Regeln expliziter waren. Neue PRIORITÄTSREGEL vor Drei-Stufen-Logik — MCM-Downgrades binden die KI zwingend. |
| v380 | Scanner-Karten-Badge nutzt `_lastMseResult` statt `getStrategyGates()`. Tearsheet-Disclaimer erweitert: erklärt Abweichungen zwischen KI-Text und Live-Ampel. |
| v381 | **ko-indicators-registry Konsolidierung** (Schritt 1-3): Registry v2.2.0 (5 neue Indikatoren: `hy_spread`, `net_liquidity`, `move_index`, `skew_vvix_div`, `qqq_markov`). Loader v1.3.0: `_evalSignalRules` um `zgte`/`signal_eq` erweitert, `buildMarketContext` FRED/Derived-Block. ZUSATZ-KONTEXT Duplikate bereinigt. CDN-Hash 1f40df0→4f1574b. |
| v382 | BUGFIX `renderCard`: `regime is not defined` — v380 hatte `regime` aus Badge-Fix entfernt aber Referenz in `badge.title` übersehen. |
| v383 | ko-indicators-registry Konsolidierung Abschluss: `qqq_markov` Timing-Fix (Patch nach `fetchQqqRegime`), `buildPromptSection` v1.3.1 (FRED/calendar-Kategorien), `_marketCtx` in `_lastMseResult` gespeichert, Prompt-Kategorien `fred`+`calendar` hinzugefügt. CDN-Hash 4f1574b→b0ec8e8. |
| v384 | BUGFIX `gates.label undefined` + Race Condition `openCachedBriefing`: `_lastMseResult` hat kein `.label` — Fix: label/action/color/description immer von `getStrategyGates()`, nur strategies von `_lastMseResult`. Race Condition: 500ms-Fallback + strengere Handler-Bedingung. |
| v385 | BUGFIX `gates.description` fehlte in v384 — zeigte `undefined` unter Regime-Label im Tearsheet. Beide Stellen korrigiert. |

---

## Block 1: KIMI-Analyse (extern, kein Code)

Axels Bekannter hat UIQ-index.html mit KIMI analysiert. Befunde durchgesehen und bewertet.

**Sofort relevant und heute adressiert:**
- `HANDLUNGSEMPFEHLUNGEN`-Label im YouTube-Analyzer — regulatorisch heikel → **Backlog #neu, nicht heute gefixt** (Browser-Verifikation ausstehend)
- Ampel-Bug (Hauptthema des Tages, siehe unten)

**Bekannt + bewusst geparkt (nach Phase-0-Evaluierung):**
- Inline-JS-Dominanz, globale Namespace-Pollution, Dead Code
- SecureStorage / Web Crypto für API-Keys (sinnvoll für Multi-User-SaaS, aktuell over-engineered)
- AppStore / State-Management-Refactoring (löst Ampel-Bug strukturell — aber funktional gefixt)
- Vite-Migration (8 Wochen Aufwand, nach ES6-Refactoring)

**Für spätere Zeitdimension:**
- DORA-Compliance, B2B-Vertragsvorlage (erst nach Monetarisierung relevant)

---

## Block 2: Ampel-Bug — vollständige Root-Cause-Analyse

**Gesamtdiagnose:** Der Ampel-Bug hatte nicht eine, sondern **vier separate Root Causes** auf verschiedenen Ebenen:

### Ebene 1: UI-Anzeige (v376)
`showMorningTearsheet()` rief `KoMarketState.getStrategyGates(regime)` direkt auf.
→ Basis-Gates ohne MCM-Context-Downgrades (Breadth/VIX/Calendar).
→ Betraf beide Pfade: frisches Briefing + Cache-Pfad.

### Ebene 2: KI-Prompts (v377)
4 KI-Prompt-Kontexte nutzten `_lastQqqRegime` (Aggregator-Markov, kein MCM)
oder `mseRegime` als String ohne Gate-Farben.
→ KI wusste nicht dass momentum/swing durch MCM rot gesetzt waren.
→ Fix: `_getMcmContextForPrompt()` als Single Source of Truth.

### Ebene 3: Timing (v378)
`openCachedBriefing()` öffnete Tearsheet sofort aus localStorage.
→ `_lastMseResult._context` noch nicht gesetzt (MCM-Startup-Gate noch nicht durch).
→ Fix: warten auf `ko:regimeChanged`.

### Ebene 4: KI-Instruktion (v379)
`STRATEGIE_MATRIX`-Regeln (z.B. Momentum grün wenn BULL_QUIET + IOS>65)
waren expliziter als der MCM-Downgrade-Hinweis.
→ KI schrieb trotz korrekter Gate-Info weiterhin `momentum:green`.
→ Fix: PRIORITÄTSREGEL vor Drei-Stufen-Logik — MCM-Downgrades absolut bindend.

**Verifikationsstatus:**
- Live-Ampel (Home, Scanner): ✅ korrekt rot für momentum/swing/vcp
- Tearsheet-Chips: ✅ korrekt (v385)
- KI-Text im MB: ⏳ wartet auf Nachtlauf (KV-Cache 06:35 Uhr eingefroren, KI-Text falsch weil vor v379 generiert)

---

## Block 3: ko-indicators-registry Konsolidierung (v381–v383)

**Ziel erreicht:** Registry ist Single Source of Truth für alle MB-relevanten Indikatoren.

### ko-indicators.json v2.2.0 (31 Indikatoren, war 26)
Neue Einträge: `hy_spread`, `net_liquidity`, `move_index`, `skew_vvix_div`, `qqq_markov`
- Alle bisher im ZUSATZ-KONTEXT des MB-Prompts hardcodiert
- `signalRules` erweitert: `zgte`/`zlte` für Z-Score-Regeln, `signal_eq` für String-Vergleich

### ko-indicators-loader.js v1.3.1
- `_evalSignalRules`: Z-Score + String-Vergleich-Regeln
- `buildMarketContext`: FRED/Derived-Block (hy_spread, net_liquidity, move_index, skew_vvix_div, qqq_markov)
- `buildPromptSection`: neue Kategorien `fred` + `calendar`
- `_marketCtx` wird in `_lastMseResult` gespeichert

### index.html
- ZUSATZ-KONTEXT Duplikate entfernt (VIX-Zone, termStruct, F&G, IOS Market, MSE Regime, QQQ Markov)
- Prompt-Kategorien: `['regime','volatility','sentiment','macro','commodity','fx','fred','calendar']`
- `qqq_markov` Timing-Fix: `fetchQqqRegime()` patcht `_lastMseResult._marketCtx` direkt

**Konsolen-Verifikation (v385):**
```
[ko-indicators-loader] v1.3.1 geladen
Registry geladen — 31 Indikatoren
market_context gebaut — 19 Faktoren | risk_level: high | caution: treasury_stress,ndx_breadth | RISK: intermarket_score
```
(19 statt 20: `qqq_markov` erscheint erst nach `fetchQqqRegime()` — korrekt)

---

## Block 4: Offene Punkte für morgen

### P0: Ko-sync `/public`-Endpoint (403)
`https://ko-sync.ahildebrand.workers.dev/public/daily_market_snapshot` gibt HTTP 403.
- Worker selbst läuft (korrekte NO_TOKEN Antwort auf `/`)
- Alle `Failed to fetch` Fehler heute kommen daher
- KV-Cache konnte nicht geladen werden → Briefing aus lokalem localStorage-Cache (06:35 Uhr)
- **Morgen als erstes fixen** — ohne das kein frisches Briefing möglich

### P1: KI-Text MB Ampel-Kongruenz
- Nachtlauf heute Nacht generiert neues Briefing mit v379-Prioritätsregel
- Morgen früh verifizieren: Abschnitt 4 muss momentum/swing 🔴 zeigen

### P2: ko-prompts-registry (geplanter Sprint morgen)
- Zentrales Prompt-Registry-Modul in ko-modules
- Public/EIC-Split
- Sync zwischen ko-ai-worker und index.html

### P3: `HANDLUNGSEMPFEHLUNGEN`-Label im YouTube-Analyzer
- Browser-Verifikation ausstehend ob Label noch vorhanden
- Wenn ja: umbenennen in "Mögliche Recherche-Schritte" oder hinter EIC-Schranke

---

## CDN-Hashes (aktuell)

| Modul | Hash |
|---|---|
| ko-config.js | 03ef406 |
| ko-indicators.js | 03ef406 |
| ko-scoring.js | 03ef406 |
| ko-markov.js | 03ef406 |
| ko-data.js | c3fa765 |
| ko-strategies.js | 4bcfe18 |
| ko-market-state.js | 8838fb4 |
| ko-darkpool.js | 99277ac |
| ko-scanner.js | f6e398e |
| ko-prompts.js | 4bcfe18 |
| ko-home.js | 749e790 |
| **ko-indicators-loader.js** | **b0ec8e8** |

---

## Aktuelle Deployments

- **UIQ Frontend:** v385 (axel-scanner/index.html, Cloudflare Pages)
- **ko-modules:** v1.3.1 (ko-indicators-loader.js), v2.2.0 (ko-indicators.json)
- **ko-aggregator:** v5.12.4 (letzter Stand 19.07.2026)
- **Track Record:** läuft seit 02.07.2026
