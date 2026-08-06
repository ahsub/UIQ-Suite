# ÜBERGABE 2026-08-07 — UIQ Suite + Refundex Session

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 07.08.2026 Abend)

| Komponente | Stand | Commit |
|---|---|---|
| **Aggregator** | **v5.29.0** | `e1e87e9` |
| **Frontend (axel-scanner)** | **v453** | `314b475` (unverändert) |
| **ko-prompts.js** | **v2.6.0** | `@610192d` (unverändert) |
| **ko-ai Worker** | **v1.9** | unverändert |
| **SUITE.md** | **v3.6** | `f53b4d1` (Backlog №29) |
| **ML_KONZEPT.md** | **v1.2** | `a7e37dd` (§3b Staffel-Sequenz) |
| **Refundex ROADMAP** | **v1.6** | `db45d98` (unverändert) |
| **GHA Run** | nächster Lauf | morgen früh ~06:10 UTC |

---

## Was heute passiert ist

### MSE — Regime-History-Flag (Backlog №29) ✅

**Analyse:**
- Aktuell 4 MSE-Regime (kein `NEUTRAL` im Produktivcode — nur Default-Parameter)
- Problem identifiziert: MSE ist zustandslos — gleicher Ratio=1.03 kann
  Erholung aus Stress oder Abschwächung aus Bull bedeuten → gleiche Gates, falsch
- `NEUTRAL` als 5. Regime diskutiert → entschieden: History-Flag eleganter

**Implementierung `calc_regime_history_flag()` — Aggregator v5.29.0:**
```
vector:        RECOVERING | DETERIORATING | STABLE | UNKNOWN
consecutive:   Tage im aktuellen Regime in Folge
stressDaysAgo: Handelstage seit letztem STRESS_UNSTABLE
prevRegimes:   letzten 5 Labels (Kontext)
ratioTrend:    RISING | FALLING | FLAT (5T VIX3M/VIX-Slope)
method:        "rule_based_v1"  ← HMM-ready (ab Okt. → "hmm_v1")
```
- Datenbasis: `mse_history.vixRatio` (bereits vorhanden, 252T)
- Output: `master.market.regimeContext` im KV-Store
- 5 Szenarien getestet: RECOVERING ✅ DETERIORATING ✅ STABLE ✅ UNKNOWN ✅ NEUTRAL-Proxy ✅
- Fehlerisoliert: `UNKNOWN`-Fallback bei Datenlücke

**Architektur-Dokumentation:**
- `SUITE.md` v3.6: Backlog №29 vollständig spezifiziert
- `ML_KONZEPT.md` v1.2: §3b — Staffel-Sequenz
  №29 (regelbasiert) → BN Sept. → HMM Okt. → NN Q1/2027

### Wichtige konzeptuelle Erkenntnisse heute

1. **MSE ist zustandslos** — Regime-History-Flag löst das elegant ohne neues Label
2. **NEUTRAL überflüssig** — entsteht implizit als `STABLE + consecutive≥5`
3. **HMM-ready by design** — `method`-Feld vorbereitet für nahtlosen Übergang
4. **BN → HMM Sequenz** — BN-Entkorrelierung verbessert HMM-Features

---

## Programm morgen: Refundex

### Priorität 1 — `DATENMODELL_JOURNAL.md` korrigieren (~30 min)

Aus der gestrigen Flex-XML-Analyse sind Korrekturen nötig:

| Was | Korrektur |
|---|---|
| `ClosedLots`-Sektion | **Entfernen** — nicht in CapTrader-Query vorhanden |
| `OptionEAE` | **Neu ergänzen** als primäre Datenquelle für Assignment/Expiry/Exercise |
| Teilfill-Aggregation | Explizit über `ibOrderID` (nicht `tradeID`) dokumentieren |
| notes-Codes | `Ep`, `A`, `P`, `MLG`, `MLG;P` mit Bedeutung ergänzen |
| `CashTransactions` | Als neue Sektion ergänzen (129 Einträge verifiziert) |

### Priorität 2 — `parseActivityXML()` in `ko-flex.js` (Kern-Sprint)

Datenbasis vollständig bekannt aus gestern — jetzt implementieren.

**Zu parsende Sektionen (Reihenfolge):**
1. `Trades` → Fills mit `fifoPnlRealized` bei Close-Trades
2. `OptionEAE` → Assignment/Expiry/Exercise-Paare (OPT + STK)
3. `CashTransactions` → Dividenden (`DIV`) + Quellensteuer (`FRTAX`)

**Bekannte Besonderheiten:**
- Teilfills: mehrere `<Trade>`-Einträge mit gleicher `ibOrderID` → aggregieren
- OPT notes: `Ep`=Verfall, `A`=Assignment, `P`=Combo, `MLG`=Manual Leg
- Doppelzeilen in StmtFunds: nur `BaseCurrency`-Zeilen verwenden
- FRTAX ist negativ (Abzug), DIV ist positiv (Brutto)

**Stub bereits vorhanden in `ko-flex.js`:**
```javascript
case 'activity_xml': return { format, error: 'Activity XML Parser — coming soon' };
```
→ diesen Stub ersetzen

### Priorität 3 — ko-flex-proxy Worker deployen (optional, wenn Zeit)

```bash
cd ~/uiq/refundex
wrangler deploy workers/ko-flex-proxy.js --name ko-flex-proxy
```
Voraussetzung: Wrangler installiert (`npm install -g wrangler`)

---

## ⏳ Zeitgesteuert

| Wann | Was |
|---|---|
| 08.08. (morgen) | GHA Run #193 — v5.29.0 erstmals live, regimeContext im KV |
| 09.08. (Sa) | fin:-Backup: erste Shard-Sichtbarkeit |
| ~12.08. | IV-Rank ab 30 Archiv-Tagen automatisch aktiv |
| ~27.08. | IWV Holdings CSV aktualisieren |
| ~01.09. | h30 Track-Record / BN-Analyse / DCE Brier Score |
| ~01.10. | MCM-HMM — ersetzt rule_based_v1 durch hmm_v1 |

---

## Offene To-dos Axel (lokal)

| # | Aufgabe | Status |
|---|---|---|
| A6 | Worker deployen: `wrangler deploy ko-flex-proxy` | ⏳ offen |
| A7 | `ahsub/ibkr-tax-tool` archivieren (GitHub → Settings) | ⏳ offen |

---

*UIQ Suite + Refundex Übergabe 07.08.2026 Abend*
*Aggregator v5.29.0 · SUITE.md v3.6 · ML_KONZEPT.md v1.2*
*Heute: MSE-Zustandslosigkeit analysiert → Regime-History-Flag implementiert → Staffel-Architektur dokumentiert*
*Morgen: Refundex — DATENMODELL_JOURNAL korrigieren + parseActivityXML() implementieren*
