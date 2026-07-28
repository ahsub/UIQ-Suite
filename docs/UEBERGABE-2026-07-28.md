# ÜBERGABE 2026-07-28 (Dienstag)

## ⚠️ UEBERGABE-HEADER-REGEL

Alle Aussagen in diesem Dokument sind **unverifizierte Behauptungen einer
vergangenen Session**, bis sie in der neuen Session unabhängig bestätigt
wurden. Claude muss beim Wiedergeben dieser Inhalte proaktiv daran erinnern:
**„hast du das verifiziert oder übernommen?"**

- **[V]** = in dieser Session gegen echte Daten/Logs verifiziert
- **[U]** = unverifiziert / nur committet, nicht in Betrieb bestätigt

---

## 0. Session-Start-Checkliste

- [ ] PAT vom 28.07. revoken, neues Session-PAT anlegen
- [ ] Run #163 (morgen ~03:37 UTC) prüfen:
      `[BREADTH]`-Zeilen + `[DIVERGENCE]`-Zeile + `[#13b]`-Zeile im Log
- [ ] KV-Snapshot prüfen: divYield reale Werte? (erwartet: GD ~3–5%, JNJ ~3%)
- [ ] Frontend v408: `home-divergence-card` im Browser prüfen (Home-Panel)
- [ ] Breadth-Archiv: 28.07.-Eintrag mit `regimeUsed: BULL_QUIET`?

---

## 1. Kernergebnis des Tages

Intensive Sprint-Session mit 6 Commits über 2 Repos. Alle Backlog-Punkte
aus dem heutigen Plan abgearbeitet + 3 Bug-Fixes aus Live-Daten.

**Block A — Bugs aus Run #160/161:**
- `fix(breadth)`: regimeUsed = MCM-Regime statt Ticker-Markov-Mehrheitsvotum
  (`76e20a404d`) **[V — Run #162: "BULL_QUIET" korrekt]**
- `fix(scoring)`: mclellan-Key + Dividend/Value-LB nach Enrichment neu
  berechnen (`2465c2ea23`) **[V — Run #162: mclellan=10.18, 11 Div-Einträge]**
- `fix(enrichment)`: divYield/payoutRatio yfinance-Normalisierung
  (`65bdfb5c12`) **[U — wirkt ab Run #163]**

**Block B — Backlog #13b (Dividend + Value Scorer):**
- `enrich_with_fundamentals()` um 5 Felder erweitert:
  `divYield`, `payoutRatio`, `peForward`, `pb`, `roe`
- `score_long_dividend()`: 0–100, Gate divYield ≥1%, Payout-Nachhaltigkeit,
  FCF-Quality-Gate, ROE-Filter
- `score_long_value()`: 0–100, Gate Bewertungsanker + kein fallendes Messer,
  peForward + pb + fcfYield + ROE + Analyst-Upside
- `_rebuild_fundamental_lb()`: Beide LBs nach Enrichment neu aufgebaut
- **[V — Run #162: long_dividend 11 Einträge, long_value 7 Einträge]**

**Block C — Backlog #11 (Score-Paar-Divergenz):**
- `calc_score_divergences()`: 3 server-seitige Paare
  (1) Regime vs. IOS-Score — (2) IOS-Trend vs. IOS-Breadth — (3) McClellan vs. Regime
- severity: low/medium/high | type | delta | label | explanation
- `master.market.scoreDivergences[]` im KV-Snapshot
- **[V — Run #162: 0 Divergenzen bei BULL_QUIET + IOS 78 — korrekt]**
- Frontend v408: `home-divergence-card` + `updateScoreDivergenceDisplay()`
  **[U — noch kein Trigger-Event in Produktion gesehen]**

---

## 2. Commit-Übersicht 28.07.2026

### `ahsub/ko-aggregator`
| Commit | Inhalt |
|---|---|
| `76e20a404d` | fix(breadth): regimeUsed = MCM-Regime statt Ticker-Markov |
| `7f0e821573` | feat(scoring): score_long_dividend + score_long_value (#13b) |
| `24cbb38b63` | feat(divergence): Score-Paar-Divergenz-Detektor (#11) |
| `2465c2ea23` | fix(scoring): mclellan-Key + LB-Rebuild nach Enrichment |
| `65bdfb5c12` | fix(enrichment): divYield/payoutRatio yfinance-Normalisierung |

### `ahsub/axel-scanner`
| Commit | Inhalt |
|---|---|
| `18bd810e06` | feat(frontend): Score-Paar-Divergenz-Anzeige v408 (#11) |

---

## 3. Daten-Snapshot Run #162 **[V]**

| Feld | Wert |
|---|---|
| Regime | BULL_QUIET |
| IOS Score | 78/100 — SELEKTIV KAUFEN |
| IOS Trend | 30/35 |
| IOS Breadth | 25/25 (Maximum) |
| McClellan | +10.18 — BULLISH |
| Breadth Advances | 478 / Declines 222 / NetAD +256 |
| archiveDays | 4 (Aufbauphase) |
| regimeStreak | 4 |
| scoreDivergences | 0 (korrekt) |
| long_dividend | 11 Einträge (Top: GD, GE, JNJ) |
| long_value | 7 Einträge (Top: CB, BAC, JPM) |

**Bekanntes Problem Run #162 (behoben in #163):**
- divYield GD: 164%, JNJ: 203% — yfinance-Normalisierungsfehler
- Fix `65bdfb5c12` committed, wirkt ab Run #163

---

## 4. Score-Divergenz — Schwellen-Kalibrierung **[U]**

Noch kein echter Divergenz-Trigger in Produktion. Schwellen:

| Paar | Trigger |
|---|---|
| Regime vs. IOS | STRESS + IOS ≥65 / BULL + IOS ≤40 |
| Trend vs. Breadth | Normierte Lücke ≥35% |
| McClellan vs. Regime | STRESS + MCL ≥+40 / BULL + MCL ≤−40 |

Frontend-Card (`home-divergence-card`) wartet auf ersten echten Trigger.
Test-Möglichkeit in der Konsole:
```javascript
window._alphaData.market.scoreDivergences = [{
  type:'regime_vs_ios', severity:'high',
  scoreA:'STRESS_UNSTABLE', scoreB:72, delta:72,
  label:'Regime STRESS_UNSTABLE ↔ IOS 72/100',
  explanation:'Testdivergenz — Regime warnt, IOS kauft.'
}];
updateScoreDivergenceDisplay();
```

---

## 5. Offene Punkte

| Prio | Punkt | Status |
|---|---|---|
| 🔴 | Run #163: divYield-Fix verifizieren | nach nächstem GHA-Run |
| 🔴 | Frontend v408: Divergenz-Card testen (Konsolen-Test s.o.) | sofort möglich |
| 🟡 | Backlog #13b: Frontend-Integration Dividend/Value-Leaderboards | nächster Sprint |
| 🟡 | Score-Divergenz: client-seitige Paare ergänzen (Bull-Indicator, TSI) | nach Stabilisierung |
| 🟢 | sizingMultiplier (#22) | erst September |
| 🟢 | OpenBB IV-Rank (#15) | erst ab 12.08. |

---

## 6. Backlog-Status nach heute

| # | Titel | Status |
|---|---|---|
| #11 | Score-Paar-Divergenz | ✅ Server + Frontend — Trigger noch nicht gesehen |
| #12 | Breadth-Oszillator | ✅ vollständig |
| #13b | Dividend/Value Scorer | ✅ Aggregator — Frontend-LB-Tab ausstehend |
| #15 | OpenBB IV-Rank | ⏳ ab 12.08. |
| #21 | regimeConfidence | ✅ Kalibrierung September |
| #22 | sizingMultiplier | ⏳ September |

---

## 7. Lessons Learned

- **yfinance dividendYield-Inkonsistenz**: Wert kommt teils als Dezimal
  (0.032 = 3.2%), teils bereits als Prozentzahl (3.2). Fix: >0.25 = bereits
  in %, Sanity-Gate >25% = Datenfehler → None.
- **Enrichment-Reihenfolge**: build_leaderboards() läuft VOR Enrichment —
  Fundamental-Scorer müssen danach via _rebuild_fundamental_lb() neu berechnet
  werden. Gilt für alle zukünftigen Scorer die Fundamental-Felder nutzen.
- **Log-Zugriff**: Azure Blob (GHA-Logs) außerhalb des Claude-Netzwerks —
  Verifikation immer über KV-Snapshot (ko-sync public endpoint) oder
  Breadth-Archiv im Repo.
