## PFLICHT-HEADER

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**
Dieses Dokument beschreibt einen behaupteten Zustand. Jede Aussage ist eine
Behauptung der letzten Session — nicht dein eigenes Wissen. Verifiziere vor
dem ersten Code-Eingriff.

**Axel:** "hast du das verifiziert oder übernommen?" — bei jedem Protokoll-Zitat.

**Neue Arbeitsregel (17.07.2026):**
> Bei UI-Bugs die Laufzeit-Daten betreffen: IMMER zuerst Konsolen-Check,
> dann Code anfassen. Kein Fix ohne bewiesene Root Cause. Kein Raten.

---

# ÜBERGABEPROTOKOLL — 17.07.2026

## Versionsverlauf heute

| Version | Commit | Inhalt | Status |
|---|---|---|---|
| v358 | `0c1162029734` | No-Metrics-Listen fix, Tearsheet Zeitstempel | ✅ |
| v359 | `894f181d16ee` | Tearsheet Zeitstempel präzisiert | ✅ |
| v360 | `d8956fac6c5a` | renderHomeLanding Fallback entfernt | ✅ |
| v361 | `02d7b353b070` | _lastMseResult Schutz (Symptom, nicht Root Cause) | ✅ |
| v362 | `66a4da66b1ed` | MCM in updateMarketWeatherWidget (falsch) | ✅ |
| v363 | `878f6c567ce6` | MCM-Startup-Gate in renderHomeLanding (zu früh) | ✅ |
| v364 | `38c36b5ccbc4` | ko:regimeChanged nach calcStrategyGates — finale Lösung | ✅ |

**Aktueller Stand: v364**

---

## Ampel-Bug — vollständige Dokumentation

### Root Cause (bewiesen via Konsolen-Diagnose)
`calcStrategyGates()` mit MCM-Context lief korrekt in `runMorningBriefing()`
und setzte `_lastMseResult` mit den richtigen Farben — aber danach wurde
**kein `ko:regimeChanged`** gefeuert. Die Ampeln blieben auf dem alten Stand.

### Fix (v364)
Eine Zeile nach dem `_lastMseResult`-Update in `runMorningBriefing()`:
```javascript
window.dispatchEvent(new Event('ko:regimeChanged'));
```

### Akzeptiertes Verhalten (Axel-Entscheidung 17.07.2026)
- **Ohne Briefing-Button-Klick:** Ampel zeigt Basis-Gates (amber) — akzeptabel
- **Nach Briefing-Button-Klick:** MCM-Gates korrekt, alle Ampeln synchron
- Das entspricht dem Morning-Briefing-Gate-Konzept (SUITE.md §7)
- Automatischer MCM-Startup ohne Button wurde bewusst NICHT implementiert

### Lernregel
Vier Fixes (v360-v363) waren Symptombehandlungen weil ohne Konsolen-Diagnose
gearbeitet wurde. v364 ist die einzige Zeile die wirklich nötig war.
Regel: **Konsolen-Check vor jedem Code-Eingriff bei Laufzeit-Bugs.**

---

## Was heute sonst umgesetzt wurde (v354-v357, gestern Abend)

Bereits im Protokoll 16.07.2026 dokumentiert — hier nur Zusammenfassung:
- v354-v355: Batch 1+2 Mobile/Desktop (B1 DeepDive-Fix, Navigation, Button-Position)
- v356: Batch 3 (Taxonomie, Rechner-Button, WL-Button)
- v357: Batch 4 (Nomenklatur, U5/U7 No-Metrics-Guard)
- v358-v364: Ampel-Diskrepanz-Bug (heute)

---

## Neue Arbeitsregel — in SUITE.md aufnehmen

**§X Debug-Protokoll (17.07.2026):**
Bei allen Bugs die Laufzeit-Zustand betreffen (Farben, Daten, State):
1. Konsolen-Check ZUERST — Laufzeit-Variablen ausgeben
2. Root Cause BEWEISEN — nicht annehmen
3. Dann erst Code anfassen
4. Eine saubere Reparatur — kein flicken

---

## Offene Punkte (Backlog)

| # | Priorität | Beschreibung |
|---|---|---|
| U3 | Mittel | ko-strategies.js: `ko`-Label „KO-Trading" → „KO-Zertifikat" (ko-modules + CDN-Hash) |
| B3 | Niedrig | „Beste Chance"-Modal: Position mit Top-5 neu prüfen |
| S6 | Niedrig | TradingView Deep-Link mit Ticker-Parameter |
| U10 | Sprint | F&G fehlt im Regime-Block — CNN-Fetch 418-Fehler |
| S5 | Sprint | Morning Briefing Gate vollständig (alle Daten → KI → Cache) |

## Infrastruktur-Stand (17.07.2026 Mittag)

| Komponente | Version |
|---|---|
| axel-scanner | v364, Commit `38c36b5ccbc4` |
| ko-aggregator | v5.11.0 (unverändert) |
| ko-modules | Commit `f6e398e` (unverändert) |
| UIQ-Suite docs | NOMENKLATUR-TAXONOMIE.md v1.0 |

## Erste Schritte nächste Session

1. v364 visuell verifizieren: Briefing-Button klicken → Ampeln rot für
   Momentum/Swing/Value?
2. SUITE.md §X Debug-Protokoll Regel eintragen
3. U3: ko-strategies.js `ko`-Label fixen
4. Strategische Entscheidung: wann Morning Briefing Gate Sprint?
