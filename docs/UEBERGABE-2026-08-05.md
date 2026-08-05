# ÜBERGABE 2026-08-05 — UIQ Suite Session (Final)

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 05.08.2026)

| Komponente | Stand | SHA |
|---|---|---|
| **Aggregator** | **v5.28.0** | `42f4dd750f` (unverändert) |
| **Frontend** | **v451** | `cb8d203` |
| **ko-prompts.js** | **v2.6.0** @610192d | `610192d` |
| **ko-kv-state.js** | v1.0.1 @de329ba | `de329ba3b4` (unverändert) |
| **GHA Run** | #190 — ✅ success | 04.08.2026 12:53 UTC (letzter) |

---

## Was heute passiert ist

### Morning Briefing Coaching-Ton (ko-prompts v2.6.0, v451)

Der einzige offene Punkt der Übergabe wurde umgesetzt.

**EIC-Modus** (`getMorningPrompt(..., true)`):
- Abschnittsüberschrift 1 betont Handelsbereitschaft explizit
- Neue COACHING-STIL-Regeln: Metrik-Erklärungspflicht ("VIX-Z +1.8 — bedeutet X"),
  Handlungshaltung je Abschnitt (handeln/abwarten/absichern + Begründung),
  kein akademischer Stil
- Abschnitt 5 (SENTIMENT) mit Einschätzungspflicht ("kontraindikatorisch oder trendbestätigend → eindeutige Aussage")

**Public-Modus** (`getMorningPrompt(..., false)`):
- Erklär-Pflicht für jeden Messwert ("Zahl bekommt Bedeutung im Halbsatz")
- TOP-KANDIDATEN: "warum?" jetzt explizit gefordert
- BaFin-REGEL-Formulierung präzisiert (auch nicht implizit durch Ampel-Priorisierung)

**Kein API-Break**: `getMorningPrompt(lines, eic, dixReal)` unverändert.

---

## CDN jsDelivr Status

Beide Fallbacks vollständig aktiv — kein Handlungsbedarf:
- `ko-kv-state`: Inline-Fallback (v445) ✅
- `ko-prompts`: Polling + getKiSystemPrompt Inline-Fallback (v449) ✅

UIQ läuft ohne CDN fehlerfrei. Punkt geschlossen.

---

## Was heute passiert ist (finalisiert)

### ko-ai Worker v1.9 versioniert (commit 4fd9184)
SPOF UIQ-STRATEGIE §7 behoben — Worker erstmals in `workers/ko-ai.js`:
morning 2000→3000 · deep_dive 800→2500 · eic 1200→2000 (Coaching-Ton v2.6 Abbruch-Fix).
CF Dashboard bleibt Source of Truth; Datei ist versionierte Referenz.

### help.html aktualisiert auf v451 / Aggregator v5.28 (commit c7243e7)
Neue Sektion „Aktuelle Indikatoren v5.9–v5.28" eingefügt:
RS-Rank Score · Distribution Days · Anchored VWAP · Order Block Detector ·
TVA-Indikatoren (trendScore/confluenceScore/tvaRegime/chopIndex/sellProbability) ·
IV-Rank/IVP-Archiv · Earnings Calendar · DCE · DE-Modus · Coaching-KI · Modularisierung.
Navigation erweitert (MCM + neue Sektion). Header: v328 → v451.

---

## Was heute passiert ist (Nachtrag Abend)

### finArchive/ivArchive-Fix + fin:-Backup (ko-aggregator 9da6169)
- **Fix 1** `market_aggregator.py`: `generate_daily_snapshot()` Success-Return
  um `finArchive` + `ivArchive` aus `master` erweitert — Russell3000-Shard-Status
  und IV-Archiv-Status jetzt im `daily_market_snapshot`-KV-Key sichtbar.
- **Fix 2** `tr_backup.py` v1.1: `fin:`-Präfix ergänzt (neben `tr:` und `market:`);
  ab nächstem Samstag-Backup sichtbar ob fin:shard:1–5 korrekt befüllt werden.

### Track-Record erste Erkenntnisse (Backup Stand 01.08.2026, h7, BULL_QUIET)
Alle Zellen n≥20, Minervini-Regime: ko_long 74% hitFresh (n=50), long_minervini
59% (n=220), vcp_setups 67% (n=40, klein). h30 reift ab ~01.09.2026.
Alle anderen Regime noch unter Mindest-n=20.

---

## Nächste Session

### 🟡 Offen
- DCE Kalibrierung: Brier Score ab ~01.09.2026 (zeitgesteuert)

### ⏳ Zeitgesteuert
- IV-Rank: ab ~12.08.2026
- BN-Analyse: ab ~01.09.2026 (60 Snapshot-Tage)
- MCM-HMM: ab ~01.10.2026
- IWV Holdings: nächste Fälligkeit ~27.08.2026

---

## IWV Holdings
✅ Aktualisiert am 27.07.2026 — nächste Fälligkeit ~27.08.2026

---

*UIQ Suite Übergabe 05.08.2026 · Aggregator v5.28.0 · Frontend v451 · ko-prompts v2.6.0*
*Morning Briefing spricht jetzt überall wie ein Coach — EIC + Public*
