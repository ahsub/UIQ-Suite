# ÜBERGABE 2026-08-04 — UIQ Suite Session (Final)

## ⚠️ UEBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **"hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 04.08.2026 ~16:30 UTC)

| Komponente | Stand | SHA |
|---|---|---|
| **Aggregator** | **v5.28.0** | `42f4dd750f` |
| **Frontend** | **v450** | `6c0fd7924a` |
| **ko-prompts.js** | Coaching @9d24627 | `9d2462700c` |
| **ko-kv-state.js** | v1.0.1 @de329ba | `de329ba3b4` |
| **GHA Run** | #190 — ✅ success | 04.08.2026 12:53 UTC |

---

## Frontend-Commits heute (v437–v450)

| Version | Was |
|---|---|
| v437 | State-Konverter: kvToScannerState Duplikat → window-Referenz (zirkulär) |
| v438 | DCE-Ampel: weatherEl Badge + Warning-Banner + Morning Briefing |
| v439 | BUGFIX: window-Referenz zirkulär → vollständige Kopie wiederhergestellt |
| v440 | DCE-Badge bgMap-Fix + DeepDive TVA-Block (beide Pfade) |
| v441 | Debug try-catch (Diagnose-Sprint) |
| v442 | **BUGFIX Alpha-Desk leer**: DOM-ID-Konflikt → alpha-card-{sym} Prefix |
| v443 | Cleanup + KV-Injektion zweiter DeepDive-Pfad |
| v444 | ko-kv-state.js Modul angelegt |
| v445 | Vollständiger Inline-Fallback (CDN-Safety) |
| v446 | DeepDive Prompt: FAZIT/STÄRKEN/MARKTKONTEXT |
| v447 | Coaching-Prompt: MARKTLAGE/SETUP/EINSCHÄTZUNG + ko-prompts @993cd37 |
| v448 | Feinschliff: direkter Stil, kein Akademikerjargon |
| v449 | getKiSystemPrompt Fallback direkt (CDN-unabhängig) |
| **v450** | **Coaching-Grundhaltung global** — KI_ANTI_HALLUZINATION für alle 18 Prompts |

---

## Root Causes heute

**v439:** window-Referenz auf eigene Funktion = zirkulär (window.fn === fn im selben Block)

**v442:** getElementById('card-AMZN') gibt bei Duplikaten das erste zurück — Scanner-Card,
nicht Alpha-Desk-Card. Fix: Prefix alpha-card-{sym}

---

## Strategische Entscheidung heute: Coaching-Prompt global

Die wichtigste Änderung ist keine technische — es ist eine konzeptionelle:

**KI_ANTI_HALLUZINATION** (globales Präfix vor JEDEM Prompt) enthält jetzt die
Coaching-Grundhaltung. Gilt für alle 18 Prompt-Aufrufe:
Morning Briefing · DeepDive · alle 12 Strategie-Leaderboards · Scanner · Intermarket

Kern der Coaching-Grundhaltung:
- Handlungsorientiert: handeln oder abwarten — immer mit Begründung
- Verständlich: jede Metrik erklärt ("ADX 15 — kein Trend")
- Direkt: kein akademischer Stil, kein Jargon ohne Erklärung
- Strukturiert: Marktkontext → Titel-Situation → Einschätzung

Das ist §0 in der KI-Schicht: UIQ spricht jetzt überall wie ein Coach.

---

## Nächste Session

### 🟡 Offen
- CDN jsDelivr: ko-prompts @9d24627 + ko-kv-state @de329ba noch 403
  → sobald propagiert greifen Modul-Versionen statt Fallbacks
- Morning Briefing Coaching-Ton: noch nicht spezifisch angepasst
  (KI_ANTI_HALLUZINATION gilt aber bereits)
- DCE Kalibrierung: Brier Score ab ~30 Tagen Daten (~01.09.2026)

### ⏳ Zeitgesteuert
- IV-Rank: ab ~12.08.2026
- BN-Analyse: ab ~01.09.2026 (60 Snapshot-Tage)
- MCM-HMM: ab ~01.10.2026

---

## IWV Holdings
✅ Aktualisiert am 27.07.2026 — nächste Fälligkeit ~27.08.2026

---

*UIQ Suite Übergabe 04.08.2026 (Final) · Aggregator v5.28.0 · Frontend v450*
*Coaching-Grundhaltung global verankert — UIQ spricht jetzt überall wie ein Coach*
