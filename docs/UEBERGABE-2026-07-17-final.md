## PFLICHT-HEADER

Dieses Dokument beschreibt einen behaupteten Zustand — nicht dein eigenes
Wissen. Axel: "hast du das verifiziert oder übernommen?" bei jedem Zitat.

**Arbeitsregel (unwiderruflich):** Bei Laufzeit-Bugs IMMER Konsolen-Check
zuerst, dann Code anfassen.

---

# ÜBERGABEPROTOKOLL — 17.07.2026 (Tagesabschluss)

## Versionsverlauf (v354 → v373)

| Version | Kernthema |
|---|---|
| v354-v364 | Durchklick-Test-Batches + Ampel-Diskrepanz-Fix (finale Lösung: ko:regimeChanged nach calcStrategyGates) |
| v365-v370 | U3 Nomenklatur, B3 Modal-Position, S6 TV-Layout, U10 F&G-Fix, VCP-Aktivierung |
| v371 | **Strategie-Fundus-Bereinigung**: Value/Dividend entfernt, VCP in Regime-Gates, Fading Short experimentell |
| v372 | Collar/Protective-Put für BULL_FRAGILE (Proxy-Version) |
| v373 | Breadth-Filter validiert (bereits korrekt), ATR-Positionsgröße Regime-Kopplung |

**Aktueller Stand: v373** — noch nicht visuell verifiziert.

---

## Wichtigste inhaltliche Entwicklung heute

### Strategie-Fundus kritisch geprüft (Axels Initiative)
Ausgangsfrage: "Ist jede Strategie evidenzbasiert erfolgversprechend in
einem für sie handelbaren Regime, oder ist sie verzichtbar?"

**Regime-Coverage-Analyse erstellt** (`UIQ-Suite/docs/REGIME-COVERAGE-ANALYSE.md`):
- Value & Dividend Growth: in KEINEM der 5 Regime Priorität 1 → entfernt,
  für DepotIQ vorgemerkt. Aggregator-Datensammlung (Russell3000/FIN-Archiv)
  läuft unverändert weiter — nur die UIQ-Timing-Strategie wurde entfernt.
- VCP: Regime-Blindfleck entdeckt (nur Frontend, nie in getStrategyGates())
  — nachgetragen, jetzt vollständig integriert.
- BULL_FRAGILE-Lücke identifiziert: keine Priorität-1-Strategie vorhanden
  → Collar/Protective-Put als Proxy-Version gebaut (kein echter
  Optionsketten-Feed nötig, ATR-basierte Näherung wie CSP/Wheel).
- Fading Short: Edge-These ungeklärt → als 🧪 experimentell markiert,
  Metriken-Vervollständigung zurückgestellt bis Axel Backtest liefert.

### Externe Gemini-Analyse zu BULL_FRAGILE eingearbeitet
Axel brachte Gemini-Recherche zu Bull-Fragile-Strategien ein:
- Bestätigt: Collar/Target-Range-Strategien sind der richtige Ansatz
- Breadth-Filter: bereits korrekt implementiert (ndx_breadth Downgrade-Faktor,
  Schwellenwerte praktisch identisch mit Gemini-Empfehlung) — nur VCP nachgetragen
- ATR-Positionsgrößen-Regime-Kopplung: neu gebaut — DeepDive-Rechner reduziert
  automatisch Risiko-% bei BULL_FRAGILE (-35%) und STRESS_UNSTABLE (-50%)
- Vertical Debit Spreads: zurückgestellt (braucht echten Optionsketten-Feed,
  gleiche Limitation wie Collar)

### Referenzdokument für Axel erstellt
`UIQ-Strategie-Marktlage-Matrix.md` — vollständige Coverage-Matrix aller
Strategien × 5 Regime, zum Download bereitgestellt für eigene Analyse.

---

## Infrastruktur-Stand (17.07.2026 Abend)

| Komponente | Version/Commit |
|---|---|
| axel-scanner | v373 |
| ko-modules/ko-strategies.js | Collar+VCP ergänzt, Value/Dividend entfernt |
| ko-modules/ko-prompts.js | Collar+VCP-Prompts, Value/Dividend-Prompts entfernt |
| ko-modules/ko-market-state.js | 5 Regime-Gates aktualisiert, CONTEXT_DOWNGRADE_RULES erweitert |
| ko-modules/ko-data.js | F&G via alternative.me (v368) |
| ko-aggregator | unverändert (Russell3000-Sammlung läuft weiter) |
| UIQ-Suite/docs | REGIME-COVERAGE-ANALYSE.md, NOMENKLATUR-TAXONOMIE.md |

---

## Nächste Session — erste Schritte

1. **v365-v373 vollständig visuell verifizieren** (nichts davon wurde heute
   im Browser bestätigt außer den Ampel-Fixes bis v364)
2. **VCP-Leaderboard prüfen** — zeigt es jetzt Kandidaten korrekt?
3. **Collar-Strategie im Scanner/Alpha-Desk testen** — Prompt-Qualität prüfen
4. **BULL_FRAGILE-Ampel prüfen** — zeigt Collar jetzt Priorität 1?
5. **Fading Short Edge-These** — wenn Axel Backtest-Grundlage hat, Metriken
   vervollständigen
6. **SUITE.md** — Debug-Protokoll-Regel (Konsolen-Check zuerst) noch nicht
   eingetragen, sollte nachgeholt werden
7. **Optionsketten-Feed** — strategische Entscheidung: eigener Sprint?
   Würde Collar, Vertical Spreads UND 4 bestehende CSP-Strategien verbessern
