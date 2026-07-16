## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v357 deployed", "X funktioniert") ist eine Aussage der
   letzten Session über sich selbst — nicht dein eigenes Wissen. Behandle es
   wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **v354 und v355 wurden von Axel visuell bestätigt. v356 und v357 wurden
   deployed aber noch nicht visuell verifiziert** — Axel prüft beim nächsten
   Login.

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. Axel: bitte bei nächster Gelegenheit fragen "hast du das verifiziert oder
   übernommen?", wenn ich etwas aus diesem Protokoll unkritisch wiederhole.

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# ÜBERGABEPROTOKOLL — 16.07.2026 (vollständiger Tagesbericht)

## Kontext

Vollständiger Durchklick-Test + 4 Batches in einer Session.
Ausgangspunkt war v353, Endpunkt v357.

---

## Gesamtübersicht der heutigen Deployments

| Version | Commit | Inhalt | Verifiziert |
|---|---|---|---|
| v354 | `56abebd84fb0` | Batch 1: B1 DeepDive-Fix, U2, U4, U8, U9, S1+S2, S3 | ✅ Axel |
| v355 | `b9e44492d634` | Button ganz nach oben (U9b) | ✅ Axel |
| v356 | `915f8078c1f7` | Batch 3: Taxonomie, S7, B4 | ⚠️ ungeprüft |
| v357 | `2b019fb76963` | Batch 4: Nomenklatur, U5/U7, LB-Button | ⚠️ ungeprüft |

---

## Was umgesetzt wurde

### Batch 1 — v354 (verifiziert)
- **B1** — `fetchSingleForDeepDive()`: `var j = await r.json()` ergänzt →
  „j is not defined" behoben
- **U2** — Scanner-Button → „KI-Strategieempfehlung"
- **U4** — „Beste Chance"-Modal: Top-5 mit Strategie + Score-Karte
- **U8** — Versionstag unter Datum/Uhrzeit in Sidebar
- **U9** — Button in Briefing-Card nach oben verschoben
- **S1+S2** — Sidebar: Übersicht → Makro → Alpha Desk → Scanner → Fibonacci
- **S3** — KO-Rechner aus Navigation entfernt, Code erhalten

### Batch 2 — v355 (verifiziert)
- **U9b** — Button ganz nach oben, vor Regime-Banner, direkt nach Header

### Batch 3 — v356 (ungeprüft)
- **Taxonomie** — `UIQ-Suite/docs/NOMENKLATUR-TAXONOMIE.md` v1.0 erstellt
- **S4** — Fibonacci bereits korrekt im Mehr-Menü, kein Eingriff nötig
- **S7** — Rechner-Button aus Ticker-Karten + Alpha Desk Options-Setup entfernt
- **B4** — WL-Button beschriftet: „⭐ + WL"

### Batch 4 — v357 (ungeprüft)
- **Nomenklatur** — Scanner KI-Dropdown: „KO-Trading" → „KO-Zertifikat",
  „Options-Wheel" → „CSP/Wheel"
- **LB-Button** — „KI-Strategieempfehlung für dieses Leaderboard"
- **U5/U7** — `runAlphaLbKI()` bricht mit klarem Hinweis ab für
  Leaderboards ohne Metriken (short_breakdown, short_fading, vcp_setups)
- **Visual** — `switchAlphaLB()` dimmt KI-Button auf 40% + Tooltip

---

## Noch offene Punkte (Backlog für nächste Session)

| # | Priorität | Beschreibung |
|---|---|---|
| U3 | Mittel | Nomenklatur in ko-strategies.js: `ko`-Label von „KO-Trading" → „KO-Zertifikat" (ko-modules Commit + CDN-Hash-Update) |
| U6 | Niedrig | CSP/ATM und CSP Weekly im AlphaDesk: funktionieren, aber nicht vollständig belegt |
| U10 | Sprint | F&G fehlt im Regime-Block — CNN-Fetch läuft, Wert landet nicht im Home-Cache |
| B3 | Niedrig | „Beste Chance"-Modal klebt am unteren Rand — mit Top-5 neu prüfen ob weiterhin |
| S5 | Sprint | Morning Briefing Gate: erst alle Daten → KI → Cache (eigener Sprint) |
| S6 | Niedrig | TradingView Deep-Link mit Ticker-Parameter aus Einstellungs-Tab |

## Strategische Entscheidungen (offen)
- **Nomenklatur ko-strategies.js**: `ko`-Label ändern erfordert ko-modules
  Commit + CDN-Hash in index.html — kleiner aber vollständiger Zyklus,
  für nächste Session einplanen
- **Morning Briefing Gate + F&G**: nach Phase-0-Stabilisierung als Sprint

## Bekannte Altlasten (nicht in diesem Batch)
- `showMSEDetail()` ruft noch `getStrategyGates()` direkt auf
  (Home/Modal-Farbdiskrepanz, dokumentiert seit v323.1)
- Python-Aggregator `generate_daily_snapshot()` field-path bugs
  für regime, VIX, PCR (Root Cause bekannt, Fix = MCM-Port nach Python)

## Infrastruktur-Stand (Ende 16.07.2026)

| Komponente | Version/Hash |
|---|---|
| axel-scanner | v357, Commit `2b019fb76963` |
| ko-aggregator (Python) | v5.11.0, Commit `f38f3e4` |
| ko-modules | Commit `f6e398e` |
| UIQ-Suite docs | Taxonomie v1.0, Commit `d74aba395de1` |

## Erste Schritte nächste Session

1. v356 + v357 visuell verifizieren
2. U3: ko-strategies.js `ko`-Label fixen (ko-modules + CDN-Hash)
3. B3: Modal-Position mit Top-5 neu beurteilen
4. S6: TradingView Deep-Link evaluieren
5. Strategische Entscheidung: wann Morning Briefing Gate Sprint?
