# ÜBERGABE 2026-07-29 — UIQ Suite Session

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben in diesem Protokoll sind **unverified** bis zur eigenständigen
Bestätigung in der nächsten Session. Claude muss proaktiv fragen:
**"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (aus GitHub, 29.07.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Frontend** | **v413** | `4e1ff7d96a` |
| ko-strategies.js | v2.4.0 | `5dc8356088` |
| ko-prompts.js | v2.3.0 | `57c6f91695` |
| ko-modules letzter Commit | `57c6f91695` | feat(prompts): dividend + value |
| GHA letzter Run | #167 — ✅ success | 29.07.2026 15:31 UTC |
| Aggregator | v5.x (unverändert) | `427f9295df` |

---

## Heutige Session — Was wurde gebaut (alle Commits verifiziert)

### ko-modules (2 Commits)
- `5dc8356088` — **ko-strategies.js v2.4.0**: `dividend` + `value` Strategien
- `57c6f91695` — **ko-prompts.js v2.3.0**: `dividend` + `value` Prompts
  mit Felder-Legende (divYield/payoutRatio/fcfYield/ROE; peForward/pb/analystUpside)

### axel-scanner (5 Commits)
- `13d2811840` — **v410**: Backlog #13b vollständig
  - `kvToScannerState()`: stratScores um `long_dividend→sDividend` + `long_value→sValue`
  - `runAlphaLbKI()`: tickerLines um Fundamental-Felder ergänzt
  - CDN-Hashes: ko-strategies `4bcfe18→57c6f91`, ko-prompts `ab084ec→57c6f91`
- `ae096d7be3` — **v410 fix**: Meta-Tag vergessen → separater Commit
- `77cb9538cd` — **v411**: Score-Divergenz client-seitige Paare (#11b)
  - Paar 4: Bull-Indicator vs. IOS-Score (Δ≥30 medium / Δ≥45 high)
  - Paar 5: TSI vs. Regime (>40 medium / >60 high, nur bei BULL-Regime)
- `a44af54bc7` — **v412**: Backlog #19 Kosmetik-Rest
  - `list-select → eic-list-select`, `preset-select → ticker-preset` (je Namensdrift)
  - `calcPortfolioRec()` entfernt (r-portfolio-rec nie im HTML definiert)
- `4e1ff7d96a` — **v413**: Score-Divergenzen im Morning-Briefing-Prompt (#11b)
  - `messwerteLines`: neuer Block `--- SCORE-DIVERGENZEN ---`
  - Server + client-seitige Paare zusammengeführt, Severity-Label, Formulierungshinweis

---

## Backlog-Status nach dieser Session

### ✅ Heute erledigt
| # | Was |
|---|---|
| #13b | Dividend + Value: ko-strategies, ko-prompts, Frontend vollständig |
| #11b | Score-Divergenz: client-seitige Paare (v411) + Morning-Briefing (v413) |
| #19  | Dead-Code Kosmetik-Rest vollständig |

### ⏳ Nächste Sprints (Prio-Reihenfolge)
| Prio | Was |
|---|---|
| 🟡 P1 | **ko-indicators-registry** (zentrale JSON/JS in ko-modules) |
| 🟡 P1 | **ko-prompts-registry** (Single Source of Truth) |
| 🟡 P2 | **DE-Modus** via Tradegate-API (Pre-Market Scanner) |
| 🟡 P2 | **MCM-Parität**: `build_server_market_context()` 4 fehlende Faktoren |
| 🟡 P3 | Strategie-Ampel-Reihenfolge + CC als 12. Slot |
| 🟡 P3 | Track-Record Phase C: Papertrading Modus A+B (ab ~02.08.) |
| ⏳   | OpenBB IV-Rank (#15) — erst ab 12.08. |
| ⏳   | sizingMultiplier (#22) + regimeConfidence (#21) — September |

### 📅 Zeitkritisch
- **IWV Holdings CSV**: Update fällig Anfang August 2026
  (`ahsub/ko-aggregator/data/iwv_holdings.csv`, zuletzt 02.07.2026)
- **Track-Record Tag 30**: ~01.08.2026 — erste `hit30`-Metriken auswertbar

---

## Technische Hinweise für nächste Session

### CDN-Hashes
- Aktueller ko-modules CDN-Hash: **`57c6f91`**
- Pattern in index.html: `ko-modules@{7-char-hash}/ko-strategies.js` etc.
- Nach jedem ko-modules-Push: Hash in index.html manuell aktualisieren

### Divergenz-System — vollständiger Stand (5 Paare)
1. `regime_vs_ios` — Server
2. `trend_vs_breadth` — Server
3. `breadth_vs_regime` — Server
4. `bull_vs_ios` — Client (v411, nach Morning-Briefing-Gate)
5. `tsi_vs_regime` — Client (v411, nur BULL-Regime + TSI>40)

Morning-Briefing (v413): `--- SCORE-DIVERGENZEN ---`-Block mit KI-Formulierungshinweis.

### Lernpunkt v410
Meta-Tag + Changelog + CDN-Hashes = **Pflicht-Triple** bei jedem Frontend-Push.

---

## PAT-Verwaltung
- **Heutiger PAT** `[REVOKE-SOFORT]`:
  **SOFORT REVOKEN** → https://github.com/settings/tokens
- Nächste Session: frischen PAT generieren, als erstes mitteilen
