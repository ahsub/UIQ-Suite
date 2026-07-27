# ÜBERGABE 2026-07-27 (Montag)

## ⚠️ UEBERGABE-HEADER-REGEL

Alle Aussagen in diesem Dokument sind **unverifizierte Behauptungen einer
vergangenen Session**, bis sie in der neuen Session unabhängig bestätigt
wurden. Claude muss beim Wiedergeben dieser Inhalte proaktiv daran erinnern:
**„hast du das verifiziert oder übernommen?"**

- **[V]** = in dieser Session gegen echte Daten/Logs verifiziert
- **[U]** = unverifiziert / nur committet, nicht in Betrieb bestätigt

---

## 0. Session-Start-Checkliste

- [ ] PAT vom 27.07. revoken, neues Session-PAT anlegen
- [ ] Run #159 (heute 13:30 UTC) oder Run #160 (morgen 03:37 UTC) prüfen:
      `[BREADTH]`-Zeilen im Log — erwartet: 4T Archiv, erster echter Lauf
- [ ] Breadth-Oszillator im Browser prüfen (Makro-Tab → Widget, nicht mehr `—`)
- [ ] regimeConfidence im Home-Panel prüfen: `(~XX%)` neben Regime-Label

---

## 1. Kernergebnis des Tages

Intensive Sprint-Session mit 8 Commits über drei Repos. Kein Blocking-Bug,
kein Rückbau. Drei Themenblöcke:

**Block A — Cleanup & Offene Punkte:**
- VIX Term-Bug behoben (`61bcc084`)
- IWV-Holdings-CSV aktualisiert auf 24.07.2026 (`66334b1f`)
- TR_BACKUP_FORCE als `workflow_dispatch`-Input (`afa417c8`)
- Ko-sync gepatcht: `market:snapshot:*` öffentlich (`665772a8` im CF-Dashboard)

**Block B — Breadth-Oszillator (McClellan, Backlog #12):**
- Aggregator: `advance`-Flag + `calc_breadth_oscillator()` + `master.market.breadthOsc` (`453320c0`)
- Workflow: `data/breadth_history/` archivieren (`b467c014`)
- ko-indicators.json v2.3.0: `breadth_osc`-Indikator (`2eac6a85`)
- Frontend v405: Widget im Makro-Tab + `loadBreadthOsc()` (`fbde7a8c`)
- Backfill: 3 Tage aus Snapshot-Vergleich, direkt ins Archiv gepusht (`f7c2ff0b`, `1e71e940`, `48b936bc`)
- Aggregator Update: `regimeUsed` + `regimeStreak` im Breadth-Archiv (`b06f5fd6`)

**Block C — regimeConfidence (Backlog #21):**
- `calcRegimeConfidence()`: Regime-Basis + Downgrade-Abzug + dqFactor + **Z-Score Clarity** (`da360fdb`)
- Frontend v407: Anzeige `(~XX%)` neben Regime-Label, `window._lastMcmCtx`-Store
- Z-Score-Ansatz aus `_alphaData.market.zscores` (252T-Fenster) — echte historische Basis
- Heute: BULL_QUIET ~80% (statt 85%) — avgZ ≈ 0.4 → −5% Clarity-Abzug

---

## 2. Commit-Übersicht 27.07.2026

### `ahsub/ko-aggregator`
| Commit | Inhalt |
|---|---|
| `61bcc084` | fix(vix-term): dropna auf numpy.float64-Skalar |
| `66334b1f` | data: IWV Holdings 24.07.2026 |
| `afa417c8` | feat(workflow): TR_BACKUP_FORCE als workflow_dispatch-Input |
| `453320c0` | feat(breadth): McClellan Breadth-Oszillator |
| `b467c014` | feat(workflow): breadth_history/ in Archive-Commit |
| `b06f5fd6` | feat(breadth): regimeUsed + regimeStreak im Archiv |
| `f7c2ff0b` / `1e71e940` / `48b936bc` | data(breadth): Backfill 22./23./24.07. |

### `ahsub/ko-modules`
| Commit | Inhalt |
|---|---|
| `2eac6a85` | feat(indicators): breadth_osc v2.3.0 |

### `ahsub/axel-scanner`
| Commit | Inhalt |
|---|---|
| `fbde7a8c` | feat(frontend): Breadth-Oszillator Widget v405 |
| `b50068e2` | feat(frontend): regimeConfidence v406 |
| `da360fdb` | feat(frontend): Z-Score Clarity in regimeConfidence v407 |

---

## 3. Breadth-Oszillator — Stand & Erwartung **[U — erster produktiver Lauf steht aus]**

### Archiv (4 Tage nach Backfill)
| Datum | ▲ Adv | ▼ Dec | NetAD | Quelle |
|---|---|---|---|---|
| 2026-07-22 | 331 | 340 | −9 | Snapshot-Backfill |
| 2026-07-23 | 230 | 444 | −214 | Snapshot-Backfill |
| 2026-07-24 | 375 | 283 | +92 | Snapshot-Backfill |
| 2026-07-25 (nächster LTD) | ? | ? | ? | Live — Run #159/160 |

### Erwarteter McClellan nach Run #159/160
Nach 4 Archivtagen: EMA19 ≈ EMA39 ≈ Gewichteter Mittelwert der NetAD-Serie.
NetAD-Serie = [−9, −214, +92, **neu**].
EMA noch nicht eingeschwungen — realer Wert ab ~39 Tagen stabil.
archiveDays = 4 → Aufbauphase-Hinweis im Widget aktiv (Farbe amber).

### Log-Zeilen zu erwarten
```
[BREADTH] 2026-07-25: ▲XXX ▼XXX ≡XXX | NetAD=±XXX
[BREADTH] McClellan=X.X | EMA19=X.X EMA39=X.X | Signal=... | 4T Archiv | Streak=4T
```

---

## 4. regimeConfidence — Stand **[V Formel, U Kalibrierung]**

### Formel (vorläufig, kalibrierbar)
```
Konfidenz = (Regime-Basis − 8% × Downgrades) × dqFactor + Z-Score-Bonus
Clamp: 25–92%
```

| Parameter | Wert heute | Kalibrierung |
|---|---|---|
| Regime-Basis BULL_QUIET | 85 | Sept. 2026 |
| Downgrade-Abzug | 8% pro Downgrade | Sept. 2026 |
| dqFactor | full=1.0, partial=0.88, minimal=0.72 | Sept. 2026 |
| Z-Score Bonus | avgZ(VIX+Ratio+VVIX)/3: >1.5σ=+10%, <0.5σ=−5% | Sept. 2026 |
| **Heute (BULL_QUIET, 0 DG, avgZ≈0.4)** | **~80%** | — |

### Was September bringt (was jetzt noch fehlt)
- Outcome-Korrelation: regimeConfidence × Strategy-Performance
- Cross-Regime-Basis: erster Regimewechsel zur Validierung der Basis-Werte
- Backfill-Kandidat: `regimeUsed` ist ab heute im Breadth-Archiv → Zeitreihe wächst

---

## 5. Offene Punkte

| Prio | Punkt | Status |
|---|---|---|
| 🔴 | Run #159/160 Breadth-Log prüfen (erster echter Lauf) | nach nächstem GHA-Run |
| 🟡 | TR_BACKUP_FORCE testen: GHA → Run workflow → force_backup: true | optional |
| 🟡 | CF-Dashboard: 5 verwaiste KV-Keys wurden gelöscht **[V]** | erledigt |
| 🟢 | regimeConfidence Sept.-Kalibrierung | nach 60 TR-Tagen |
| 🟢 | Backlog #13b: Scan-Logik Dividend/Value | nächster Sprint |
| 🟢 | CapTrader-Projekt: Optionsstrategie-Metriken einbinden | parallel |

---

## 6. CapTrader-Projekt — Einstieg **[Information, kein Code]**

Public Endpoint (kein Auth):
```
https://ko-sync.ahildebrand.workers.dev/public/master_market_data
```

Relevante Blöcke:
- `master.optionsWatchlist` — 50 Kandidaten mit KI-Strike + DTE
- `master.tickers[i].scoreCsp` / `.scoreCc` / `.ivAtm` / `.ivDte` / `.ivExpiry`
- `master.tickers[i].chanHigh3sd` / `.chanLow3sd` — 3σ-Band (Strike-Anker)
- `master.tickers[i].ivRank` / `.ivPercentile` — ab ~12.08. (30 Archivtage)
- `master.market.vixTerm` — Regime-Kontext für Options-Timing
- `master.market.breadthOsc` — neu: McClellan für Breitenkontext

Code-Orte in UIQ:
- Scoring: `market_aggregator.py` → `score_long_csp()` / `score_long_cc()`
- Prompts: `ko-modules/ko-prompts.js` → `KoPrompts.get('csp_wheel', ctx)`
- Regelwerk: `ko-modules/ko-strategies.js` → `atmna`-Checkliste

Architektur-Grenze (SUITE.md Funnel-Regel): Positions-Tracking, Flex-Query
und broker-spezifisches Lifecycle-Management gehören in Premium Options,
nicht in UIQ oder CapTrader-Frontend.

---

## 7. Lessons Learned

- **Snapshot-Backfill**: Nur 04h/06h-Morgen-Snapshots haben echte Schlusskurse
  (15h-Snapshots sind intraday → viele "unchanged"). Für künftige Backfills:
  `last_trading_day` als Schlüssel, frühesten Snapshot pro LTD verwenden.
- **Z-Score Clarity statt Streak**: Der Regime-Streak aus 19 Snapshots
  (alle BULL_QUIET) hat keine Kalibrierungskraft — kein Regimewechsel sichtbar.
  Der 252T-Z-Score-Ansatz ist robuster, weil unabhängig vom Archivstart.
- **OpenBB-Entscheidung**: Kein struktureller Vorteil für IV-Rank — weder
  Tradier noch CBOE liefern historische IV. iv_layer.py-Archivansatz bleibt
  richtig. Backlog #15 bis nach 12.08. parken.
