## PFLICHT-HEADER

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**
Dieses Dokument beschreibt einen behaupteten Zustand — nicht dein eigenes Wissen.
Jede Aussage ist eine Behauptung der letzten Session. Verifiziere vor dem ersten
Code-Eingriff.

**Axel:** "hast du das verifiziert oder übernommen?" — bei jedem Protokoll-Zitat.

**Arbeitsregel (17.07.2026, unwiderruflich):**
> Bei UI-Bugs die Laufzeit-Daten betreffen: IMMER zuerst Konsolen-Check,
> dann Code anfassen. Kein Fix ohne bewiesene Root Cause. Kein Raten.

---

# ÜBERGABEPROTOKOLL — 17.07.2026 Abend (vollständiger Tagesbericht)

## Gesamtübersicht Deployments heute

| Version | Commit | Inhalt | Verifiziert |
|---|---|---|---|
| v354 | `56abebd84fb0` | Batch 1: B1/U2/U4/U8/U9/S1+S2/S3 | ✅ |
| v355 | `b9e44492d634` | Button ganz oben (U9b) | ✅ |
| v356 | `915f8078c1f7` | Taxonomie, S7, B4 | ✅ |
| v357 | `2b019fb76963` | Nomenklatur, U5/U7 No-Metrics | ✅ |
| v358 | `0c1162029734` | No-Metrics-Listen fix, Zeitstempel | ✅ |
| v359 | `894f181d16ee` | Zeitstempel-Text präzisiert | ✅ |
| v360 | `d8956fac6c5a` | renderHomeLanding Fallback entfernt | ✅ |
| v361 | `02d7b353b070` | _lastMseResult Schutz (Symptom) | ✅ |
| v362 | `66a4da66b1ed` | MCM in updateMarketWeatherWidget (falsch) | ✅ |
| v363 | `878f6c567ce6` | MCM-Startup-Gate (zu früh) | ✅ |
| v364 | `38c36b5ccbc4` | ko:regimeChanged nach calcStrategyGates ✓ | ✅ |
| v365 | `8ecb3e96ca80` | U3 KO-Zertifikat Nomenklatur + CDN-Hash | ⚠️ ungeprüft |
| v366 | `90260b309b45` | B3 KI-Modal zentriert | ⚠️ ungeprüft |
| v367 | `6f596b5dac13` | S6 TV Layout-Link | ⚠️ ungeprüft |
| v368 | `e9f358beaacb` | U10 F&G alternative.me | ⚠️ ungeprüft |

**Aktueller Stand: v368**

---

## Erledigte Punkte (vollständige Liste)

### Aus dem Durchklick-Test 16.07.2026
- ✅ B1 — DeepDive `j is not defined` — `var j = await r.json()` ergänzt
- ✅ U2 — „Markt-Einschätzung" → „KI-Strategieempfehlung"
- ✅ U4 — „Beste Chance" Top-5 Modal
- ✅ U8 — Versionstag unter Datum/Uhrzeit
- ✅ U9+U9b — Button ganz oben, vor Regime-Banner
- ✅ S1+S2 — Sidebar-Reihenfolge + Alpha Desk in Trading-Block
- ✅ S3 — KO-Rechner aus Navigation (Code erhalten)
- ✅ S4 — Fibonacci bereits korrekt im Mehr-Menü
- ✅ S7 — Rechner-Button aus Ticker-Karten
- ✅ B4 — WL-Button beschriftet „+ WL"
- ✅ U5/U7 — Leaderboards ohne Metriken: Hinweistext + KI-Button gedimmt
- ✅ U3 — Nomenklatur Scanner-Dropdown + ko-strategies.js „KO-Zertifikat"
- ✅ B3 — KI-Modal zentriert (alle 5 Bottom-Sheet-Modals)
- ✅ S6 — TradingView Layout-Link in Einstellungen
- ✅ U10 — F&G: CNN 418 → alternative.me

### Ampel-Bug (heute intensiv debuggt)
- Root Cause: `calcStrategyGates()` feuerte kein `ko:regimeChanged` nach
  `_lastMseResult`-Update in `runMorningBriefing()`
- Fix (v364): eine Zeile `window.dispatchEvent(new Event('ko:regimeChanged'))`
- Akzeptiertes Verhalten: Ampel korrekt erst nach Briefing-Button-Klick
- Lernregel: Konsolen-Check vor jedem Laufzeit-Bug-Fix

---

## Noch offen — nächste Session

### Fehlende Handelsstrategien (noch nicht begonnen)
Aus der Taxonomie (NOMENKLATUR-TAXONOMIE.md v1.0) — Strategien ohne
vollständige Metriken/Prompts:

| Strategie | Problem | Aufwand |
|---|---|---|
| **Breakout** | Kein eigener Prompt, kein Leaderboard-Key (teilt `long_swing`) | Mittel |
| **Dividend Growth** | KI-Prompt vorhanden, kein Leaderboard | Mittel |
| **Value** | Proxy-Metriken, kein vollständiges Scoring | Hoch |
| **Fading Short (KO)** | Leaderboard läuft, Metriken unvollständig | Mittel |
| **VCP** | Leaderboard läuft, kein eigener KI-Prompt | Mittel |

**Empfohlene Reihenfolge:** Breakout zuerst (eigener Key + Prompt),
dann VCP (Prompt ergänzen), dann Fading Short (Metriken vervollständigen).

### Offene Infrastruktur
- **Morning Briefing Gate** — vollständiger Sprint (alle Daten → KI → Cache)
- **SUITE.md §X Debug-Protokoll** — Arbeitsregel noch nicht eingetragen
- **ko-aggregator Python** — generate_daily_snapshot() field-path bugs
  (regime, VIX, PCR) — Root Cause bekannt, Fix = MCM-Port nach Python

---

## Infrastruktur-Stand (17.07.2026 Abend)

| Komponente | Version/Commit |
|---|---|
| axel-scanner | v368, `e9f358beaacb` |
| ko-aggregator | v5.11.0, `f38f3e4` (unverändert) |
| ko-modules / ko-strategies.js | Commit `d61f574` (KO-Zertifikat) |
| ko-modules / ko-data.js | Commit `c3fa765` (alternative.me F&G) |
| UIQ-Suite docs | NOMENKLATUR-TAXONOMIE.md v1.0 |

## Erste Schritte nächste Session

1. **Verifikation** — v365-v368 durchklicken:
   - F&G befüllt im Regime-Banner?
   - KI-Modals zentriert statt Bottom-Sheet?
   - TV-Modal: „Mein Layout"-Button sichtbar nach URL-Eingabe?
   - „KO-Zertifikat" korrekt in Scanner-Dropdown?
2. **SUITE.md** — Debug-Protokoll-Regel §X eintragen
3. **Fehlende Strategien** — mit Breakout beginnen
