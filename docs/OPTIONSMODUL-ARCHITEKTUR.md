# UIQ Optionsmodul — Kognitive Architektur v1.0

*Erstellt: 09.08.2026 — Konzeptdokument, kein Code. Reine Vorarbeit für
OptionsDoktor/OptionsCoach (ROADMAP 2.12, SUITE.md №37, Trigger 01.10.2026).*

---

## §1 — Leitidee: UIQ als diagnostisches System

UIQ ist kein Dashboard, kein Scanner und keine Indikator-Sammlung.
Es ist ein **mehrstufiges Entscheidungsmodell** — strukturiert wie ein
klinischer Diagnoseprozess:

```
Patient / Investor
       ↓
Symptome erheben / Markt-Metriken erheben
       ↓
   ┌─────────────────────┐
   │  VIX    │ Breadth   │
   │  DIX    │ VVIX      │
   │  Treasury│ Liquidity │
   │  Sentiment           │
   └─────────────────────┘
       ↓
Diagnose (Market State / Regime)
       ↓
Differentialdiagnose
(Welche Strategien haben momentan
 die höchste Erfolgswahrscheinlichkeit?)
       ↓
Individuelle Empfehlung
       ↓
Monitoring / Follow-Up
```

Diese Kaskade ist keine Metapher — sie beschreibt die tatsächliche
Verarbeitungskette, an der sich die technische Architektur und die
Produktentwicklung orientieren.

---

## §2 — Die 6-Stufen-Kaskade

### Stufe 1: Markt verstehen

**Bestehende UIQ-Infrastruktur:**
- 4-Regime Market State Engine (BULL_QUIET, BULL_FRAGILE,
  POST_PANIC_REVERSION, STRESS_UNSTABLE)
- Decision Confidence Engine (DCE) mit Brier-Score-Kalibrierung
- ~35 Metriken in der Unified Data Foundation (Backlog №44)

**Erweiterung für Optionsmodul (Backlog №46/47):**
- VIX/VIX3M Term Structure (Contango/Backwardation)
- Put/Call Ratio (CBOE CPC/PCC)
- Volatilitäts-Kegel (IV-Perzentile, s. §5)

### Stufe 2: Investor verstehen

Typisches Profil des UIQ-Zielnutzers (aus STRATEGIE.md):
- Alter: 45+
- Anlagehorizont: langfristig orientiert
- Depotgröße: eher größeres Depot (>50k EUR)
- Optionsstrategie: primär Einkommensstrategie (Wheel, CSP, Covered Call)
- Aktienauswahl: Qualitätsaktien (nicht Meme-Stocks)
- Priorität: Risikomanagement > maximale Rendite

**Offene Frage:** Brauchen wir einen initialen Fragenkatalog (Onboarding),
oder reicht die implizite Profilierung über die tatsächlichen Trades
(Flex-XML → OptionsDoktor-Lernmuster-Engine)?

### Stufe 3: Underlying verstehen (KI-assistiert)

Einzeltitel-Analyse vor der Strategieauswahl:
- Fundamentaldaten (roic.ai, Backlog №31 Stufe 3a)
- Charttechnische Situation (Support/Resistance, s. §4)
- Earnings-Kalender und anstehende Events
- IV-Rang relativ zum eigenen historischen Bereich (IV-Rank/Percentile)

### Stufe 4: Strategie auswählen (KI-assistiert)

→ Strategiekatalog (§3) × Entscheidungsmatrix (§6)

### Stufe 5: Trade begleiten (KI-assistiert)

- Entry-Signal aus UIQ (Regime + Underlying-Check + IV-Position)
- Laufende Überwachung: Regime-Wechsel, IV-Crush nach Events, Theta-Verfall
- Handlungsoptionen bei Problemen: Rollen, Rückkauf, Hedge

### Stufe 6: Aus Fehlern lernen (KI-assistiert)

→ OptionsDoktor-Lernmuster-Engine (ROADMAP 2.12)
- Retrospektive Diagnose abgeschlossener Positionen
- Systematische Fehler über ≥20 Positionen erkennen
- Datenbasis: Flex-XML + UIQ-Kontext zum Entry-Zeitpunkt
- **Konkreter Datenpunkt:** 2025 Rückkauf/Prämien-Verhältnis 92,5 % vs.
  2024 28,7 % — „zu viele schlechte Trades" (Gegenprüfung 09.08.2026)

---

## §3 — Strategiekatalog

### A. Directional-Neutral / Income (Seitwärtsmarkt)

**Covered Call (Buy-Write)**
- Erwartung: Leicht bullisch bis neutral
- Chart-Kontext: Aktie in Konsolidierung oder moderatem Aufwärtstrend,
  Widerstand nahe Call-Strike
- Greeks-Optimum: Theta positiv (Zeitverfall für Sie), hohe IV = höhere
  Prämie (niedrige IV = geringe Prämie, ungünstig)

**Collar**
- Erwartung: Neutral bis leicht bullisch, mit Absicherungsbedarf
- Chart-Kontext: Aktie nahe Unterstützung (Put-Strike) und Widerstand
  (Call-Strike)
- Greeks-Optimum: Delta-Reduktion durch Kombination, Volatilitäts-Skew
  oft günstig (OTM Puts teurer als OTM Calls → teure Vola verkaufen,
  billige kaufen)

### B. Directional Strategies (Moderate Richtungserwartung)

**Vertical Spreads (Debit)**
- Bull Call Spread: Kauf niedriger Strike / Verkauf höherer Strike
- Bear Put Spread: Kauf hoher Strike / Verkauf niedrigerer Strike
- Erwartung: Moderater Anstieg (Bull Call) oder Rückgang (Bear Put)
- Chart-Kontext: Aktie sollte sich auf den Strike zubewegen
- Greeks-Optimum: Netto-Delta bestimmt Richtung, Breakeven = niedriger
  Strike + Debit
- **Merkposten (Backlog №48):** Bei Bear Put Spread-Backtests auf
  Lookback-Monotonie (Strike-Auswahl) und TP/SL-Asymmetrie gegen
  Trendrichtung achten

**Vertical Spreads (Credit)**
- Bear Call Spread: Verkauf niedriger Strike / Kauf höherer Strike
- Bull Put Spread: Verkauf hoher Strike / Kauf niedrigerer Strike
- Erwartung: Neutral bis leicht bärisch/bullisch
- Chart-Kontext: Aktie handelt unter (Bear Call) bzw. über (Bull Put)
  dem verkauften Strike
- Greeks-Optimum: Theta positiv, maximaler Gewinn = erhaltene Gutschrift

### C. Volatility Strategies (Starke Bewegung oder Stagnation)

**Long Straddle / Strangle**
- Erwartung: Große Bewegung oder IV-Anstieg
- Chart-Kontext: Vor Earnings/FDA/Übernahme, Breakout aus enger Spanne
- Greeks-Optimum: Long Vega (IV-Anstieg gewünscht), Delta anfangs ≈ 0

**Short Straddle / Strangle**
- Erwartung: Stagnation oder IV-Rückgang
- Chart-Kontext: Seitwärtsmarkt innerhalb Support/Resistance, keine
  anstehenden Events
- Greeks-Optimum: Theta positiv (größter Verbündeter), Short Vega
  (IV muss fallen/gleich bleiben)

### D. Directionless / Range-Bound (Präzise Preisfindung)

**Long Butterfly**
- Erwartung: Aktie schließt exakt auf mittlerem Strike bei Verfall
- Chart-Kontext: Starker Widerstand oben + starke Unterstützung unten,
  Seitwärtshandel
- Greeks-Optimum: Hohes Gamma am mittleren Strike, definierte
  Breakeven-Punkte

**Long Condor**
- Erwartung: Aktie bleibt zwischen den zwei mittleren Strikes
- Chart-Kontext: Breitere Seitwärtsspanne als Butterfly
- Greeks-Optimum: Theta positiv solange Aktie im „Körper" bleibt,
  maximaler Gewinn = Strike-Differenz − Debit

### E. Volatility Spreads (Fortgeschritten, Risikomanagement-pflichtig)

**Ratio Spread**
- Erwartung: Aktie bleibt beim verkauften Strike, niedrige IV
- Chart-Kontext: Exakter Support/Widerstand auf dem Strike der
  verkauften Optionen
- Greeks-Optimum: Theta extrem positiv, Delta kippt bei starker Bewegung
- **⚠️ Unbegrenztes Risiko** — nur mit aktivem Risikomanagement

**Backspread**
- Erwartung: Starke Trendbewegung oder IV-Anstieg
- Chart-Kontext: Breakout aus Spanne oder Trendwechsel
- Greeks-Optimum: Vega positiv, unbegrenzter Gewinn bei Trendbewegung

---

## §4 — Charttechnische Trigger

Seitwärtsmärkte sind die häufigste Marktphase und damit das Kernterrain
für Optionseinkommensstrategien. Das Modul muss drei Basismuster erkennen:

### 4.1 Support/Resistance (Seitwärts)

- **Trigger:** Aktie pendelt >30 Tage zwischen zwei Preispunkten
- **Strategien:** Butterflies oder Short Strangles in der Mitte der Spanne,
  Bull Put Spreads an der Unterstützung
- **UIQ-Anschluss:** Erkennbar über Bollinger-Band-Squeeze, ATR-Kompression,
  niedrige ADX-Werte (<20) — Teile davon bereits in der Data Foundation

### 4.2 Breakout (Ausbruch)

- **Trigger:** Preis schließt über Widerstand oder unter Unterstützung
  mit **erhöhtem Volumen**
- **Strategien:** Long Straddles (Richtung unklar) oder Call/Put
  Backspreads (Richtung bekannt) — profitieren von steigender Volatilität
- **UIQ-Anschluss:** Volumebestätigung + ADX > 25 + Regime-Wechsel-Signal

### 4.3 Earnings / News Events

- **Trigger:** Feststehendes Datum (Quartalszahlen, FDA, Übernahme)
- **Strategie:** Long Straddle vor dem Event (Vega steigt während der
  Erwartungsphase), Exit sofort nach dem Event (IV-Crush)
- **Merksatz:** „Kaufe das Gerücht, verkaufe die Nachricht"
- **UIQ-Anschluss:** Earnings-Gate ist bereits in allen Options-Scorern
  implementiert. Ausbau: automatischer Countdown + IV-Rank-Tracking
  relativ zum Earnings-Termin
- **Datenquelle:** CapTrader/IBKR Earnings-Dates (s. offene Frage §7)

---

## §5 — Volatilitäts-Kegel (Volatility Cones)

**Konzept:** Der Volatilitäts-Kegel zeigt die historische Spanne der
impliziten Volatilität für verschiedene Laufzeiten (30, 60, 90 Tage).
Er beantwortet die Frage: „Ist die aktuelle IV hoch oder niedrig
*relativ zur historischen Norm dieses Titels*?"

**Entscheidungslogik:**
- IV > 90. Perzentil: → **Optionen verkaufen** (Short Vega)
  Iron Condor, Short Straddle, Bear Call Spread
- IV < 10. Perzentil: → **Optionen kaufen** (Long Vega)
  Long Straddle, Long Call
- IV 30.–70. Perzentil: → IV-neutralere Strategien
  Vertical Spreads, Covered Calls

**Datenquelle-Frage:** Echte IV erfordert Options-Ketten-Daten (IBKR TWS API
oder externe Quelle). Pine Script kann nur synthetischen HV-Proxy liefern
(Backlog №46/47, Marktsichtung 09.08.2026: „Pine hat keinen Zugriff auf
Echtzeit-Optionsketten"). Für UIQ ist echte IV das Ziel.

---

## §6 — 2-Stufige Entscheidungsmatrix

### Stufe 1: Marktumfeld-Analyse

| Dimension | Methode | Ergebnis |
|---|---|---|
| Richtung | Support/Resistance + ADX + RSI | Seitwärts / Trend / Breakout |
| Volatilität | IV-Rang auf Volatilitäts-Kegel | Hoch (>70P) / Moderat / Niedrig (<30P) |

### Stufe 2: Strategiewahl

| Marktumfeld | Strategien |
|---|---|
| Niedrige IV + Trend | Long Straddle, Call/Put Backspread |
| Hohe IV + Seitwärts | Short Straddle, Iron Butterfly, Credit Spreads |
| Moderate IV + Moderater Trend | Vertical Spreads (Debit oder Credit) |
| Hohe IV + Breakout | Vorsicht — IV-Crush nach Breakout möglich, ggf. abwarten |
| Niedrige IV + Seitwärts | Covered Calls (Prämie gering aber Theta positiv) |

**UIQ-Integration:** Die MSE-Regime-Erkennung (4 Regimes) liefert die
Richtungsdimension; der Volatilitäts-Kegel (§5) liefert die IV-Dimension.
Die Kreuzung beider ergibt die Strategieempfehlung.

**Prüffrage aus Backlog №48:** Bei jeder Strategieempfehlung explizit
verifizieren, dass TP/SL-Ratio zur Trendrichtung passt (keine statischen
Defaults bei Gegen-Trend-Strategien).

---

## §7 — Offene Fragen

1. **Investoren-Profil (§2, Stufe 2):** Onboarding-Fragenkatalog vs.
   implizite Profilierung über Flex-XML-Trades? Oder beides?

2. **CapTrader/IBKR-Anbindung für Live-Daten (Stufe 3+5):**
   Flex Query liefert nur Transaktionsdaten (historisch). Für Live-Greeks,
   Options-Ketten, IV-Rang und Earnings-Dates braucht es eine andere
   Schnittstelle:
   - **IBKR TWS API** (Client Portal Web API): Optionsketten mit
     Greeks in Echtzeit, erfordert separate Authentifizierung
   - **IBKR Earnings Calendar:** Genaue Earnings-Dates pro Ticker
   - **Alternativen:** Twelve Data (bereits in UIQ), CBOE-Daten (Backlog №47)
   - **Entscheidung offen:** Primär für UIQ-Options-Scorer (Live-Entry)
     oder für Refundex/OptionsDoktor (retrospektive Analyse)?

3. **Volatilitäts-Kegel-Datenquelle (§5):** Echte IV braucht
   Optionsketten-Daten. Bis IBKR TWS API angebunden ist: Fallback auf
   synthetischen HV-Proxy (historische Volatilität als Schätzung)?

4. **Regime-Mapping (§6):** Welche MSE-Regimes mappen auf welche
   Strategiegruppen? Erster Entwurf:
   - BULL_QUIET → Covered Calls, Bull Put Spreads, Short Strangles
   - BULL_FRAGILE → Collars, engere Spreads, weniger Selling
   - STRESS_UNSTABLE → Long Straddles (vor Mean-Reversion-Hook),
     danach Short Vega mit VIX/VIX3M-Bestätigung (Backlog №46)
   - POST_PANIC_REVERSION → Aggressive Bull Put Spreads, Covered Calls
     bei IV > 70P (Premium-Ernte nach Stress)

---

## §8 — Abgrenzung zum bestehenden System

| Komponente | Rolle | Modul |
|---|---|---|
| Market State Engine (4 Regimes) | Stufe 1 — Markt-Diagnose | UIQ (ko-market-state.js) |
| Decision Confidence Engine | Wahrscheinlichkeits-Kalibrierung | UIQ (Backlog №44) |
| Entscheidungsmatrix (§6) | Stufe 4 — Strategiewahl | UIQ (neu, s. dieses Dokument) |
| Earnings Gate | Stufe 3 — Event-Check | UIQ (bereits implementiert) |
| Trade Journal (ko-journal.js) | Stufe 5/6 — Datenerfassung | Refundex (ROADMAP 2.9 ✅) |
| OptionsDoktor | Stufe 6 — Lernmuster-Analyse | Refundex (ROADMAP 2.12, Trigger 01.10.) |
| Flex-XML-Parser (ko-flex.js) | Datenbasis für Stufe 6 | Refundex (v1.3, Cash-Basis ✅) |
| Strategiekatalog (§3) | Referenz für Stufe 4 | Dieses Dokument |

---

*v1.0 — 09.08.2026. Konzeptdokument, kein Code.*
*Nächste Schritte: §7 klären, dann Backlog-Eintrag in SUITE.md für
Entscheidungsmatrix-Sprint.*
