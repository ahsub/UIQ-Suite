# Übergabeprotokoll — 09.08.2026 (ganztägig)
## Themen: Pine-Review, Refundex-Gegenprüfung 2023-2025, Optionsmodul-Architektur, kap.html PDF-Upload, ko-flex.js-Bugfixes

---

## 1. Kontext & Reihenfolge des Tages

1. Pine-Script-Review-Nachtrag aus Vormittags-Session committed
2. Refundex-Gegenprüfung: XML vs. PWC-PDF für alle drei Steuerjahre (2023/2024/2025)
3. Optionsmodul „Kognitive Architektur" — Grundsatzdokument (Axels Arzt-Metapher)
4. kap.html: PDF-Upload-Feature neu gebaut (deterministisch, ersetzt alte Claude-API-Variante)
5. ko-flex.js: zwei Bugfixes (activityCode/type, Nachtrag-Fix) + 2.14 + WHT-Trennung (Punkt A)
6. Regime-Mapping gegen unabhängige Coverage-Analyse gegengeprüft (Punkt B)

---

## 2. Commits heute (chronologisch, alle verifiziert)

### PINE-Skripts
- `7b616b59` / `bd3921b8` / `816f2205` — Fixed Pine-Skripte (Bear Put Spread v1/v2, ChartPrime Bayesian)

### UIQ-Suite
- `e361c84f` — UEBERGABE-2026-08-09-pine-review.md
- `f7b5b974` — SUITE.md v4.6: №46 VIX/VIX3M, №47 Put/Call Ratio
- `35325bbd` — SUITE.md v4.7: №48 Pine-Konzeptlehren
- `2d621908` — OPTIONSMODUL-ARCHITEKTUR.md v1.0 (Erstfassung)
- `a18ca448` — SUITE.md v4.8: №49 Optionsmodul-Architektur verankert
- `1bbee532` — Architektur-Doc: §7 Fragen 1+2 entschieden (Investorenprofil, CapTrader-Zweck)
- `8cf6d13b` — Architektur-Doc: §7 Frage 3 (Vola-Kegel 2-Phasen-Ansatz)
- `f7a82a79` — SUITE.md v4.9: alle §7-Fragen abgeschlossen
- `2deeea76` — Architektur-Doc: Regime-Mapping gegen REGIME-COVERAGE-ANALYSE.md gegengeprüft
- `b7805018` — SUITE.md v4.10: Regime-Mapping-Gegenprüfung vermerkt

### refundex
- `d876890b` — ROADMAP.md v2.3: Gegenprüfung 2023-2025, PWC-Summary-Bug 2025 dokumentiert
- `5c71d052` — kap.html: PDF-Upload deterministisch (PDF.js statt Claude-API)
- `6fedad97` — ko-flex.js: activityCode→type-Bugfix (äußerer Filter) + 2.14
- `7fb79f05` — ROADMAP.md v2.4: 2.14 + Bugfix dokumentiert
- `a533917f` — ko-flex.js: **Nachtrag-Bugfix** (innerer Konverter hatte denselben Fehler) + Punkt A (WHT-Trennung)

**Wichtig für nächste Session:** `a533917f` ist der Stand, der tatsächlich end-to-end
gegen echte Daten getestet wurde (Node+jsdom, `parseActivityXML` direkt aufgerufen).
Frühere Zwischenstände (`6fedad97`) hatten einen Folgefehler, der erst beim
Weiterbauen (Punkt A) auffiel — Lehre: bei Multi-Schritt-Fixes am Ende immer
end-to-end gegen die echte Funktion testen, nicht nur gegen isolierte Filterlogik.

---

## 3. Inhaltliche Kernergebnisse

### 3.1 Refundex-Validierung (alle drei Jahre bestätigt)
- 2023: 0 Options-Trades, PWC = 0,00 € — plausibel
- 2024: Δ=0,01 €/0,00 € gegen PWC Line 21/24 — vollständig bestätigt
- 2025: Δ=0,06 €/0,11 € gegen Transaktionsliste (PWC-Summary selbst fehlerhaft,
  s. u.) — bestätigt
- **FIFO endgültig bestätigt unnötig:** 0 Long-Options-Trades in 3 Jahren,
  Axel handelt ausschließlich Stillhalter-Geschäfte

### 3.2 PWC-Summary-Bug 2025 (echter Fund, nicht UIQ-Fehler)
Der PWC German Tax Report 2025 hat Line 21 (Optionsgewinne) komplett im Summary
fehlend, Line 24 (Optionsverluste) fälschlich unter Line 22 gelistet. Betrifft
~21.910 € Prämieneinnahmen, die im Kopf-Summary unsichtbar sind. Deshalb:
**Beta-User brauchen PDF-Upload neben XML** — jetzt gebaut (s. 3.3).

### 3.3 kap.html PDF-Upload — komplett neu
Alte Version sendete PDF an Anthropic API (API-Key nötig, Drittanbieter-Datenfluss,
keine Bestätigungs-Stufe trotz ROADMAP-Vorgabe, extrahierte nicht mal Line 21/24).
Neue Version: PDF.js-Textextraktion im Browser, kein API-Key, Bestätigungs-Dialog
vor Übernahme, automatischer Fallback auf Transaktionslisten-Summierung bei
fehlender Line 21/24 (genau der 2025-Bug). **End-to-end gegen alle drei echten
PDFs getestet, alle Werte exakt korrekt.**

**Offen:** Echter Browser-Test durch Axel selbst steht noch aus (bisher nur
Node-Simulation mit pdfjs-dist + jsdom, sollte sich identisch verhalten, aber
nicht 100% browser-verifiziert).

### 3.4 ko-flex.js — zwei kritische Bugfixes
1. **activityCode existiert nicht im echten Flex-XML-Schema** (CashTransaction
   nutzt `type`, nicht `activityCode`) — `dividends`-Array war bei echten
   Daten IMMER leer. Betraf komplette Divi/WHT-Pipeline (Säule 2/QSt-Cockpit),
   nicht nur 2.14. Zwei Fixstufen nötig (äußerer Filter + innerer Konverter
   hatten denselben Fehler unabhängig).
2. **2.14 Buchungs-Datums-Filter:** implementiert, defensiv, 0 Treffer bei
   Axels echten Daten (systematisch geprüft) — bleibt als Sicherheitsnetz aktiv.

### 3.5 Punkt A — WHT-Trennung (Zins- vs. Dividenden-Quellensteuer)
Neue Felder `isDividendWht`/`isInterestWht`, `divWhtEur`/`interestWhtEur` in
`yearlyResults`. Nur `divWhtEur` ist für Z.41 (anrechenbare ausländische QSt)
relevant. Verifizierte Werte:
- 2023: divWht 7,05 € / interestWht 0,00 €
- 2024: divWht 206,18 € / interestWht 33,96 €
- 2025: divWht 328,74 € / interestWht 9,56 €

### 3.6 Punkt B — Regime-Mapping gegengeprüft
Heutiger Vorschlag (Lehrbuch-Logik) gegen `REGIME-COVERAGE-ANALYSE.md` (17.07.2026,
unabhängige Coverage-Gap-Analyse) abgeglichen:
- **BULL_FRAGILE:** beide Analysen empfehlen unabhängig Collar/Protective-Put —
  starkes konvergentes Signal (17.07. identifizierte es als „echte Lücke",
  ohne heutigen Vorschlag zu kennen)
- **STRESS_UNSTABLE:** heutiger Entwurf war zu pauschal („keine neuen Short-
  Positionen") — Coverage-Matrix differenziert: generisches CSP/Wheel bleibt
  🟡 selektiv möglich (weit OTM/lang), nur ATM/Weekly-Varianten 🔴 gesperrt
- **BULL_QUIET:** aufgewertet von „nur moderat" auf 🟢 P2 (echte Sekundär-Priorität)
- **POST_PANIC_REVERSION:** stärkste Übereinstimmung beider Analysen

**Wichtig:** Beide Analysen (heute + 17.07.) sind qualitativ, kein P&L-Backtest.
Quantitative Validierung gegen die Gate-A-Sharpe-1,66-Infrastruktur steht
weiterhin aus — nächster sinnvoller Schritt für das Regime-Mapping.

---

## 4. Offene Punkte (priorisiert)

### Sofort/Hygiene
- [ ] Session-PAT widerrufen (`ghp_nBJV...`)
- [ ] Leeres Repo `ahsub/refundex-taxdata-private` löschen (nie genutzt)

### Diese Woche (aus früheren Sessions, unverändert offen)
- [ ] Rechtsgutachten WpHG/WpIG (~800€)
- [ ] Beta-Tokens verifizieren/ausgeben
- [ ] IWV Holdings CSV aktualisieren (fällig ~27.08.2026)

### Direkte Folgeschritte aus heutiger Arbeit
- [ ] **Echter Browser-Test** kap.html PDF-Upload durch Axel (nur Node-simuliert bisher)
- [ ] WHT-Split (Punkt A) in UI/QSt-Cockpit (2.7) tatsächlich anzeigen — Datenfelder
      existieren jetzt, UI nutzt sie noch nicht
- [ ] Quantitative Regime-Mapping-Validierung gegen 2007-2026-Backtest
- [ ] IBKR TWS API anbinden (Greeks/Earnings/Optionsketten) — Voraussetzung für
      Optionsmodul-Stufe 3+5, Ziel-Repo-Entscheidung UIQ (`ko-ibkr-live.js`) noch
      nicht final bestätigt von Axel, nur Claude-Vorschlag
- [ ] VCP-Regime-Zuordnung in `getStrategyGates()` nachtragen (aus Coverage-
      Analyse 17.07., nicht Teil des Optionsmoduls, aber verwandter Fund)

### Mittelfristig
- CapTrader-Portfolio/Options-Journal-Integration (aus 08.08-Übergabe)
- OptionsDoktor selbst — bewusst geparkt bis 01.10.2026

---

## 5. Sicherheitshinweis

PAT wurde in dieser Session mehrfach im Klartext verwendet (Axel hat ihn bewusst
für Session-Zwecke bereitgestellt). Wie in Punkt 4 vermerkt: **Widerruf nach
Session-Ende nicht vergessen.**

---

*Erstellt: 09.08.2026, Ende Session. Bereit zur Ablage in `UIQ-Suite/docs/`.*
