# UIQ Optionsmodul — Kognitive Architektur v1.0

*Erstellt: 09.08.2026 — Konzeptdokument, kein Code. Reine Vorarbeit für
OptionsDoktor/OptionsCoach (ROADMAP 2.12, SUITE.md №37, Trigger 01.10.2026).
Update 10.08.2026: Regime-Mapping quantitativ validiert (§7 Punkt 4),
IBKR-Live-API-Recherche (§7 Punkt 2), IV-Rank/Strategie-Matrix-Referenz
übernommen (§7 Punkt 3a).*

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

**Datenquelle — 2-Phasen-Ansatz (entschieden 09.08.2026):**

Echte IV erfordert Options-Ketten-Daten. Pine Script kann nur synthetischen
HV-Proxy liefern (Backlog №46/47, Marktsichtung 09.08.2026: „Pine hat keinen
Zugriff auf Echtzeit-Optionsketten"). Statt auf die perfekte Quelle zu warten,
wird der Kegel stufenweise aufgebaut — ein Perzentil-Kegel braucht vor allem
eine konsistente 1–2-Jahres-Zeitreihe, das lässt sich schon mit vorhandenen
Daten beginnen.

*Phase 1 — sofort nutzbar: Realized-Volatility-Proxy.* Rolling-Window-
Standardabweichung der Log-Returns (20/30/60/90 Tage, annualisiert) aus
bereits angebundenen Twelve-Data-Kurshistorien, Perzentil-Rang gegen die
eigene 1–2-Jahres-Historie desselben Tickers. Kein zusätzlicher Anbieter,
kein zusätzliches Budget. **Einschränkung, die im UI sichtbar sein muss:**
Realized Vol ≠ IV — IV enthält die Volatilitäts-Risikoprämie und liegt daher
systematisch über der realisierten Vol. Absolute Schwellenwerte (>90.
Perzentil) wären mit diesem Proxy verzerrt, die *relative* Einordnung pro
Titel bleibt aber brauchbar, da sich der Bias über die Zeitreihe größtenteils
herauskürzt.

*Phase 2 — nach IBKR-TWS-API-Anbindung: echte ATM-IV.* Keine
Zusatzkosten, da dieselbe Verbindung ohnehin für Greeks/Earnings gebaut wird
(§7 Frage 2). At-the-Money-IV pro Expiry direkt aus der Optionskette, gleiche
Perzentil-Methodik, jetzt mit echten Werten. **Scope-Einschränkung
(Kostenkontrolle, Backlog №45):** nicht das volle 711-Ticker-Universum,
nur Journal-/Watchlist-Titel — Live-IV-Abruf pro Kette ist teurer als ein
Kurs-Abruf, lohnt sich nur für tatsächlich gehandelte/beobachtete Titel.

*Übergang:* Beide Phasen laufen parallel, sobald Phase 2 startet — ein
echter IV-Kegel braucht selbst wieder 6–12 Monate Historie, bevor sein
eigenes Perzentil aussagekräftig ist. Realized-Vol-Proxy bleibt aktiv, bis
genug echte IV-Historie pro Ticker vorliegt, dann stiller Wechsel auf die
echte Quelle.

| | Phase 1 (jetzt) | Phase 2 (nach TWS-API) |
|---|---|---|
| Quelle | Realized Vol (Twelve Data) | ATM-IV (IBKR TWS API) |
| Scope | Ganzes Universum möglich | Nur Journal/Watchlist |
| Kosten | 0 € | 0 € (Anbindung ohnehin geplant) |
| Genauigkeit | Näherung, Bias durch Vola-Risikoprämie | Exakt |
| Aufbauzeit | Sofort startklar | 6–12 Monate bis aussagekräftiges Perzentil |

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

1. **Investoren-Profil (§2, Stufe 2) — ENTSCHIEDEN (09.08.2026):**
   **Beides, zweistufig.** (a) Onboarding-Fragenkatalog erhebt
   Selbsteinschätzung (Alter, Horizont, Depotgröße, Risikoneigung —
   analog zum Profil in §2 Stufe 2). (b) UIQ prüft anhand der
   tatsächlichen Flex-XML-Trades, ob die Selbsteinschätzung zum realen
   Verhalten passt (z. B. „gibt an: konservativ" vs. „handelt: hohe
   Rückkauf-Quote, enge Strikes, viele Trades" → Diskrepanz-Flag).
   **Baubar erst mit OptionsDoktor-Lernmuster-Engine (Trigger 01.10.).**

2. **CapTrader/IBKR-Anbindung — ENTSCHIEDEN (09.08.2026):**
   **Beide Verwendungszwecke parallel**, eine Datenquelle:
   - **Metriken (Greeks, Earnings-Dates, Optionsketten)** → primär für
     UIQ-Options-Scorer (Live-Entry-Entscheidung, §3/§6)
   - **Dokumentation abgeschlossener/laufender Trades** → primär für
     Refundex-Journal (ROADMAP 2.9, bereits ✅) + OptionsDoktor (2.12)
   - **Technisch:** IBKR TWS API/Client Portal Web API liefert beides aus
     einer Schnittstelle (Optionsketten + Positions-Status). Flex Query
     bleibt für die reine Steuer-Historie zuständig (Refundex), TWS API
     kommt als *zusätzliche* Live-Schicht hinzu, ersetzt Flex Query nicht.
   - **Noch offen:** Konkrete Sprint-Einordnung (UIQ oder Refundex als
     Ziel-Repo für den API-Client) — Vorschlag: `ko-ibkr-live.js` in
     UIQ (da Live-Daten primär für Entry-Entscheidung gebraucht werden),
     Refundex konsumiert die Daten für Journal-Anreicherung. **Noch nicht
     final bestätigt von Axel (10.08.2026: "erst besprechen").**

   **Recherche 10.08.2026 — zwei externe Tools geprüft, Bau selbst noch
   NICHT begonnen (eigenständiges Vorhaben, für separate Session
   vorgesehen):**

   - **Grundsatzentscheidung Schnittstelle:** Axel präferiert **Client
     Portal Web API** (REST-basiert) gegenüber der klassischen TWS API
     (Socket-basiert, braucht laufende Desktop-App). Kernproblem beider
     Wege: anders als die heutigen CBOE/SqueezeMetrics-Anbindungen (simpler
     zustandsloser HTTP-Fetch) braucht IBKR einen **dauerhaft laufenden,
     authentifizierten Gateway-Prozess** mit periodischer Re-Authentifizierung
     (Client Portal Gateway: Session läuft nach ~24h ab).

   - **`Voyz/ibeam`** (Python, Apache-2.0, 845 Stars, aktiv gepflegt,
     zuletzt aktualisiert 10.08.2026) — Auth-/Maintenance-Tool speziell für
     die Client Portal Web API Gateway. Löst genau das Kernproblem:
     **PyOTP-Handler ermöglicht vollautomatisierte 2FA** (Time-based
     One-Time Password über Base32-Secret aus IBKRs Secure Login System),
     kombiniert mit automatisierter Credential-Injection und
     Headless-Docker-Betrieb — der komplette Login-Flow lässt sich damit
     ohne manuelles Eingreifen dauerhaft am Laufen halten. Verweist selbst
     auf `Voyz/ibind` (Python) als schlanken Web-API-Client, falls kein
     eigener Client gebaut werden soll.
     **Hosting-Empfehlung:** eigener Rechner scheidet aus (nicht 24/7 an,
     würde genau dann fehlen, wenn der Aggregator planmäßig läuft) — ein
     kleiner dauerhaft laufender VPS (~5€/Monat) mit IBeam+Gateway als
     Docker-Container ist das in der Community übliche, bewährte Muster.

   - **`sparkstartconsulting/IBKR-API-Rust`** (Rust, MIT, 175 Stars, aktiv
     gepflegt) — vollständiger Port der **klassischen TWS API** (nicht
     Client Portal Web API), verbindet sich direkt per Socket zu einer
     laufenden TWS/Gateway-Desktop-Instanz (`127.0.0.1:4002`). Nicht direkt
     nutzbar für den präferierten Client-Portal-Web-API-Weg (anderes
     Protokoll, andere Sprache als unser ES6-Zielstack) — aber als
     **Plan-B-Referenz** vorgemerkt, falls sich beim Bauen zeigt, dass die
     Client Portal Web API bei Greeks/Optionsketten-Feldern Lücken
     gegenüber der klassischen TWS API hat (kommt in der Praxis vor, nicht
     alle Datenfelder sind 1:1 gespiegelt — noch nicht selbst geprüft).

   - **Beide Lizenzen unproblematisch** (Apache-2.0 bzw. MIT) für Nutzung/
     Referenz in V2, analog zur Lizenz-Klärung für
     `uebber/ibkr-german-tax-declaration-engine` (s. Refundex ROADMAP.md
     2.18).

3. **Volatilitäts-Kegel-Datenquelle — ENTSCHIEDEN (09.08.2026):**
   2-Phasen-Ansatz, s. §5 im Detail. Phase 1 (Realized-Vol-Proxy aus
   Twelve Data, sofort startklar) läuft parallel zu Phase 2 (echte ATM-IV
   nach IBKR-TWS-API-Anbindung), bis genug echte IV-Historie pro Ticker
   für einen eigenen aussagekräftigen Kegel vorliegt.

3a. **IV-Rank/Strategie-Matrix — externe Referenz übernommen (10.08.2026,
    Axel-Entscheidung "integrieren und nutzen"):**

    Quelle: `zubair-trabzada/ai-trading-claude`, Skill `trade-options`
    (SKILL.md), MIT-Lizenz (Copyright (c) 2026 Zubair Trabzada, LICENSE-
    Datei direkt geprüft — keine rechtlichen Hürden, Bedingung war nur
    Copyright-Erhalt bei Übernahme).

    **Was übernommen wird (Dokumentations-/Architekturebene, kein Code-
    Dependency):** die Entscheidungslogik als Referenztabellen. **Was NICHT
    übernommen wird:** die WebSearch-basierte Live-Datenbeschaffung dieses
    Tools — passt architektonisch nicht zu UIQs Aggregator+KV-Cache-Pipeline
    und bleibt außen vor. UIQ speist diese Tabellen weiterhin aus der
    eigenen Datenpipeline, nicht aus Web-Suchen zur Laufzeit.

    **Ergänzt (nicht ersetzt) das marktweite MSE-Regime um eine
    Einzeltitel-Dimension:** MSE-Regime beantwortet "wie ist der
    Gesamtmarkt", IV-Rank/Percentile beantwortet "ist DIESER Titel gerade
    teuer oder billig gehandelt" — beide zusammen ergeben die vollständige
    Strategiewahl (Kreuzung, analog zum bestehenden §6-Prinzip
    Regime×Vola-Kegel).

    | IV-Umfeld | IV-Rank | Strategie-Bias |
    |---|---|---|
    | Sehr hoch | >70% | Prämie verkaufen |
    | Hoch | 50-70% | Verkaufen oder Spreads (begrenztes Risiko) |
    | Moderat | 30-50% | Neutral — Spreads/direktionale Trades |
    | Niedrig | 10-30% | Prämie kaufen |
    | Sehr niedrig | <10% | Prämie kaufen / Straddles |

    Zusätzlich IV-vs-HV-Interpretation: IV>HV+20% → Optionen teuer,
    Verkaufs-Bias; IV≈HV → fair bepreist, keine Vola-Kante; IV<HV-20% →
    Optionen billig, Kauf-Bias.

    **Strategie-Matrix (15 Strategien mit Einsatzbedingung/Max-Gewinn/
    -Verlust/Breakeven), Auszug — deckt mehr ab als UIQs aktuelle
    `getStrategyGates()`:**

    | Strategie | Wann einsetzen | Bei UIQ bereits als Gate vorhanden? |
    |---|---|---|
    | Long Call | Niedrige IV + starke Überzeugung | Nein |
    | Bull Call Spread | Moderate IV + definiertes Ziel | Nein |
    | Cash-Secured Put | Hohe IV + Bereitschaft zum Erwerb | Ja (CSP/Wheel) |
    | Bull Put Spread | Hohe IV + bullisch | Ja |
    | Call Diagonal | Moderate IV + graduelle Bewegung erwartet | Nein |
    | Long Put | Niedrige IV + starke Überzeugung | Nein |
    | Bear Put Spread | Moderate IV + definiertes Ziel | Nein |
    | Bear Call Spread | Hohe IV + bearish | Nein |
    | Iron Condor | Hohe IV + Seitwärtsmarkt | Nein |
    | Short Strangle | Sehr hohe IV + Seitwärts (unbegrenztes Risiko) | Nein |
    | Iron Butterfly | Hohe IV + Pinning nahe Strike | Nein |
    | Covered Call | Aktien im Bestand + hohe IV | Ja |
    | Calendar Spread | Steile IV-Terminstruktur | Nein |
    | Collar/Protective Put | (nicht in Quelle, UIQ-eigen) | Ja (2.15-Lücke) |

    **Einordnung:** Kein Aufruf, alle 9 fehlenden Strategien sofort zu
    bauen — aber eine saubere, vorgefertigte Referenztabelle, die beim
    nächsten Ausbau von `getStrategyGates()` Zeit spart (Einsatzbedingung/
    Max-Gewinn/-Verlust/Breakeven muss nicht neu hergeleitet werden).
    Priorisierung bleibt Axels Entscheidung, analog zum bestehenden
    Feature-Freeze-Prinzip.

    **Nebenhinweis:** Das Tool selbst ist als eigenständiges Claude-Code-
    Skill installierbar (`curl ... | bash` laut Repo-README) — Axel kann es
    unabhängig von UIQ für Ad-hoc-Einzeltitel-Checks nutzen, ohne dass das
    mit dieser Dokumentations-Übernahme zusammenhängt.

4. **Regime-Mapping — Entwurf 09.08.2026, gegengeprüft 09.08.2026 gegen
   `docs/REGIME-COVERAGE-ANALYSE.md` (v1.0, 17.07.2026):**

   Wichtige Einordnung: Die Coverage-Analyse ist eine **qualitative
   Prioritäts-Einstufung** (🟢/🟡/🔴 je Strategie×Regime) aus einer
   unabhängigen Session vom 17.07.2026, kein quantitativer P&L-Backtest
   wie die Gate-A-Sharpe-1,66-Zahlen. Sie ist trotzdem wertvoll: zwei
   unabhängige Wege (Lehrbuch-Logik heute vs. Coverage-Gap-Analyse vor
   drei Wochen) zur Gegenprüfung, bevor der eigentliche P&L-Backtest folgt.

   **Bemerkenswert:** Bei BULL_FRAGILE kommen beide Analysen unabhängig
   zum selben Schluss — die Coverage-Analyse identifizierte es bereits
   am 17.07. als „echte Lücke" (keine P1-Strategie) und empfahl exakt
   eine **Collar-/Protective-Put-Strategie**, ohne dass diese Session
   davon wusste. Zwei unterschiedliche Methoden, gleiches Ergebnis —
   ein brauchbares Signal, auch ohne quantitativen Beleg.

   **Zwei Korrekturen am ursprünglichen Entwurf (09.08.2026, nach Abgleich):**
   - **BULL_QUIET:** ursprünglich als „nur moderat" beschrieben — die
     Coverage-Matrix stuft CSP/Wheel und Covered Call hier als 🟢 P2 ein
     (echte Sekundär-Priorität, nicht nur „geht so"). Aufgewertet.
   - **STRESS_UNSTABLE:** ursprünglich pauschal „keine neuen
     Short-Positionen" — zu absolut. Die Coverage-Matrix differenziert:
     generisches CSP/Wheel bleibt 🟡 (selektiv möglich, z. B. weit OTM/
     lange Laufzeit), während enge Varianten (CSP ATM/Weekly) 🔴
     (gesperrt) sind. Nuance übernommen.

   | Regime | IV-Niveau | Strategie | Coverage-Matrix (17.07.) | Begründung |
   |---|---|---|---|---|
   | BULL_QUIET | Niedrig (Kegel-Boden) | Covered Calls/CSP, **weiter OTM** | 🟢 P2 (CSP/Wheel, Covered Call) | Ruhiger Trend = wenig Angst = wenig Prämie, aber solide Sekundär-Priorität, nicht nur Bestandspflege. |
   | BULL_FRAGILE | Moderat, tendenziell steigend | **Collar/Protective-Put** — unabhängig bestätigte Lücke | 🟡 (CSP/Wheel, Covered Call) — keine P1-Strategie vorhanden | Kurs steigt noch, aber Risiko-Signal — gefährlichster Moment für ungehedgte Stillhalter-Positionen. Coverage-Analyse 17.07. empfahl unabhängig dieselbe Lösung. |
   | POST_PANIC_REVERSION | Hoch, fallend | **Beste Selling-Phase:** Bull Put Spreads, CSP, Covered Calls | 🟢 P1 (CSP/Wheel, CSP ATM/NA), 🟢 P1 (Mean Reversion) | IV-Crush-Ernte, deckt sich mit VIX/VIX3M-Fund (№46) und der Coverage-Matrix — stärkste Übereinstimmung aller vier Regimes. |
   | STRESS_UNSTABLE | Hoch, weiter steigend/volatil | **Selektiv defensiv:** generisches CSP/Wheel weit OTM/lang möglich, ATM/Weekly gesperrt | 🟡 CSP/Wheel, Covered Call; 🔴 CSP ATM/NA, CSP Weekly | Boden noch nicht gefunden — aber nicht pauschal „nichts geht", sondern strukturabhängig. |

   **10.08.2026 — Quantitativ validiert** (s.
   `docs/REGIME-BACKTEST-VALIDIERUNG.md` für vollständige Methodik/Zahlen).
   Kurzfassung: Krisentag-Erkennung 11/13 (84,6%), POST_PANIC_REVERSION als
   "beste Selling-Phase" bei kurzen Horizonten (5-10 Handelstage) stark
   bestätigt (CBOE PUT/BXM/CLL-Indizes, Sharpe bis 2,53 — höchster Wert
   aller Regimes), zerfällt aber bis Tag 21 fast vollständig — Empfehlung
   sollte kurzen Aktions-Horizont betonen. BULL_FRAGILE/Collar bei 21 Tagen
   bestätigt (Sharpe 1,11), bei kurzen Horizonten uneinheitlich. Wichtige
   Nuance: der 2022er-Bärenmarkt (zinsgetrieben, keine Terminstruktur-
   Inversion) löst STRESS_UNSTABLE nicht zuverlässig aus — Klassifikator
   erkennt spezifisch Gamma-Panik-Dynamik, nicht "Markt fällt stark"
   allgemein. Datenbasis 2011-2025 (nicht der volle 2007-2026-Bereich,
   aus Datenverfügbarkeitsgründen), öffentliche Quellen statt Primärlizenz —
   Details und Einschränkungen im verlinkten Dokument.
   Zusätzlich: VCP fehlt laut Coverage-Analyse komplett in
   `getStrategyGates()` — nicht direkt Teil des Optionsmoduls, aber
   verwandter offener Punkt.

   **Merksatz:** Man verkauft Prämie nicht, wenn die IV hoch *ist* —
   sondern wenn sie hoch *war* und der Markt sich zu beruhigen beginnt.

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
