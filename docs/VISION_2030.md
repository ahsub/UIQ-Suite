# VISION_2030.md — UIQ Produktvision

**Version:** 1.0  
**Datum:** 03.08.2026  
**Autor:** Dr. Axel Hildebrand  
**Status:** Strategisches Leitdokument — verbindlich für Architekturentscheidungen  

---

## Das Leitbild

> UIQ ist kein Analyse-Tool. UIQ ist ein diagnostisches Entscheidungssystem — ein persönlicher Investment Coach, der Marktzustand, Entscheidungssicherheit und Anlegerprofil miteinander verbindet.

**Der Unterschied zur Konkurrenz:**

TradingView, Koyfin, FinViz, MarketSurge, TrendSpider — all diese Systeme beantworten dieselbe Frage: *"Was macht der Markt?"* Sie sind universell, datenreich und anonym. UIQ 2030 stellt drei andere Fragen — und beantwortet sie in dieser Reihenfolge:

```
1. Was macht der Markt?              → Market Intelligence Engine
2. Wie sicher bin ich mir?           → Decision Confidence Engine  ← der fehlende Algorithmus
3. Was bedeutet das für diesen Investor?  → Investor Profile Engine
```

UIQ wird nie mit den großen Anbietern auf ihren Gebieten konkurrieren. UIQ konkurriert auf einem Gebiet, das keiner dieser Anbieter besetzt: **die personalisierte Entscheidungsbegleitung des selbstentscheidenden Privatanlegers.**

---

## Die Drei-Engine-Architektur

### Engine 1 — Market Intelligence Engine (MIE)
*"Was macht der Markt?"*

**Heute bereits produktiv.** Beantwortet die Frage nach dem Marktzustand durch:
- Market State Engine (4 Regime: BULL_QUIET / BULL_FRAGILE / STRESS_UNSTABLE / POST_PANIC)
- MCM (Market Context Module): Makro, Breadth, Volatilität, Dark Pools, Sektoren, Kalender
- Ticker-Level: RS-Rank, Distribution Days, AVWAP, Order Blocks, trendScore, confluenceScore
- Strategy Router: Regime → Strategie-Auswahl → Opportunity Leaderboards

**Ausbaurichtung bis 2030:** BN-Kalibrierung (Signal-Redundanz eliminieren), MCM-HMM (latenter Makrozustand), IV-Rank vollständig. Aber: *keine weitere Feature-Inflation* — die MIE ist im Wesentlichen fertig. Die nächsten zwei Engines sind der eigentliche Hebel.

---

### Engine 2 — Decision Confidence Engine (DCE)
*"Wie sicher bin ich mir?"*

**Noch nicht gebaut. Der wichtigste fehlende Algorithmus.**

Die MSE sagt "BULL_QUIET". Das klingt präzise — ist aber eine Verdichtung von 12+ Signalen, von denen manche widersprechen. Der Nutzer sieht das Ergebnis, nicht den Widerspruch. Die DCE macht den Widerspruch sichtbar.

#### Das Konzept

Ein einziger Konfidenzwert 0–100 mit transparenter Herleitung:

```
Decision Confidence: 91%

Makro           ★★★★★   Klares Risk-On Signal
Breadth         ★★★★★   >70% Ticker über EMA50
Volatilität     ★★★★☆   VIX niedrig, leicht steigend
Dark Pools      ★★★★★   Netto-Akkumulation
Sektoren        ★★★★☆   Zykliker führen, aber uneinheitlich
Kalender        ★★★★★   Kein FOMC/CPI in 14 Tagen
```

vs.

```
Decision Confidence: 42%

Makro widersprüchlich      HY-Spread steigt, Equity bullisch
Dealer-Positionierung unklar   GEX-Proxy neutral
Breadth neutral            52% Ticker über EMA50 — kein Signal
VIX neutral                Weder niedrig noch hoch
Dark Pools schwach         Kein klares Akkumulations-Signal
```

**Warum das UIQ einzigartig macht:**

Investoren lernen nicht nur, was UIQ denkt — sondern *wie belastbar diese Einschätzung ist*. Ein Konfidenzwert von 42% sagt: "Das Regime-Label stimmt vielleicht, aber die Evidenz ist zu dünn für neue Positionen." Das ist ehrlicher als jedes andere Signal und verhindert den "Black Box"-Eindruck.

**Die medizinische Analogie:** Ein erfahrener Arzt sagt nicht nur "Diagnose X". Er sagt: "Diagnose X — aber die Befundlage ist uneindeutig. Ich würde noch eine Woche beobachten." Das ist DCE.

#### Architektur der DCE

```python
# Konzept — 6 Dimensionen, gewichtet nach Datenverfügbarkeit und Signalstärke

def calc_decision_confidence(mcm: dict, market_snapshot: dict) -> dict:
    """
    Berechnet Decision Confidence Score 0-100 aus 6 Markt-Dimensionen.
    Jede Dimension liefert Score 0-5 (Sterne) + kurze Begründung.
    Gewichtung: Makro 25%, Breadth 20%, Vola 20%, DarkPools 15%, Sektoren 10%, Kalender 10%
    """
    dimensions = {
        "makro":    _score_makro(mcm),          # HY-Spread, Net Liquidity, Move Index
        "breadth":  _score_breadth(mcm),         # McClellan, % über EMA50, Distribution Days
        "vola":     _score_volatility(mcm),      # VIX-Level, VIX-Term-Struktur, HVP-Median
        "darkpool": _score_darkpool(mcm),         # PCR als Proxy, OBV-Breadth
        "sektoren": _score_sectors(market_snap), # Sektor-RS-Divergenz
        "kalender": _score_calendar(mcm),        # Tage bis FOMC/CPI/NFP
    }
    weights = {"makro": 0.25, "breadth": 0.20, "vola": 0.20,
               "darkpool": 0.15, "sektoren": 0.10, "kalender": 0.10}
    
    confidence = sum(d["score"] * weights[k] * 20 for k, d in dimensions.items())
    return {
        "confidence": round(confidence),
        "dimensions": dimensions,
        "label": "Hoch" if confidence >= 75 else "Mittel" if confidence >= 50 else "Niedrig",
        "action_gate": confidence >= 60,  # Unter 60: keine neuen Positionen empfohlen
    }
```

#### DCE als Gate für Engine 3

Die DCE ist nicht nur Display — sie ist ein **echter Handlungs-Gate**:

- DCE ≥ 75: Voller Strategiefächer verfügbar
- DCE 50–74: Defensive Strategien bevorzugen, Sizing reduzieren
- DCE < 50: "Heute ist kein guter Tag für neue Positionen" — Engine 3 wird gedämpft

---

### Engine 3 — Investor Profile Engine (IPE)
*"Welche dieser Strategien passen zu diesem Investor?"*

**Noch nicht gebaut. Das personalisierende Herzstück.**

Dieselbe Marktanalyse, dieselbe Konfidenz — und trotzdem unterschiedliche Handlungsempfehlungen. Weil zwei Investoren nicht dieselbe Therapie brauchen.

#### Das Anlegerprofil (~15 Fragen)

```
Depotgröße:          150.000 €
Anlageziel:          Cashflow / Wachstum / Kapitalerhalt
Risikobereitschaft:  Konservativ / Mittel / Aggressiv
Optionserfahrung:    Keine / Grundkenntnisse / Fortgeschritten
Anlagehorizont:      < 5 Jahre / 5–15 Jahre / > 15 Jahre
Max. Drawdown:       10% / 15% / 25% / unbegrenzt
Steuersituation:     Privatanleger DE / AT / CH / andere
Bevorzugte Märkte:   US / DE / Global
Liquiditätsbedarf:   Kein / Mittel / Hoch (monatl. Entnahme)
```

#### Die Personalisierungslogik

```
Markt: BULL_QUIET    DCE: 78%    →    Voller Strategiefächer

Investor A (35J, Wachstum, keine Optionen, Horizont 20J):
→ Momentum-Long, Breakout-Setups, KO-Zertifikate Long
→ KEINE Optionsstrategien (Erfahrung fehlt)
→ Sizing: Voll (langer Horizont, hohe Risikotoleranz)

Investor B (66J, Cashflow, Wheel-erfahren, Horizont 8J):
→ Cash-Secured Puts auf Qualitätsunternehmen
→ Covered Calls auf bestehende Positionen
→ Defensive Basiswerte (hohe Dividendenrendite, niedriges Beta)
→ Sizing: 60% (Drawdown-Schutz, Entnahmephase naht)

Statt: "Der Markt ist bullisch."
Neu:   "Für Ihr Profil sind heute Cash-Secured Puts auf
        Qualitätsunternehmen mit IV-Rank > 50 die sinnvollste Option."
```

#### Die medizinische Analogie — vollständig

Zwei Patienten, dieselbe Diagnose (Hypertonie). Aber:
- Patient A, 35J, gesund, sportlich → Lebensstil-Änderung, abwarten
- Patient B, 68J, Diabetes, Niereninsuffizienz → sofort Medikament, niedrigere Zieldosis

Die Diagnose (MIE) ist dieselbe. Die Befundsicherheit (DCE) ist dieselbe. Die Therapie (IPE) ist unterschiedlich — weil der Patient unterschiedlich ist.

---

## Das Zusammenspiel der drei Engines

```
                    ┌─────────────────────────────┐
                    │   Market Intelligence Engine  │
                    │   "Was macht der Markt?"      │
                    │   Regime · MCM · Ticker-Scan  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │   Decision Confidence Engine  │
                    │   "Wie sicher bin ich mir?"   │
                    │   91% ★★★★★ / 42% ★★☆☆☆     │
                    │   + Handlungs-Gate            │
                    └──────────────┬───────────────┘
                                   │
         ┌─────────────────────────▼─────────────────────────┐
         │              Investor Profile Engine               │
         │    "Welche Strategien passen zu diesem Investor?"  │
         │    Profil · Erfahrung · Horizont · Risikoklasse   │
         └─────────────────────────┬─────────────────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │       Investment Coach        │
                    │    KI-Gespräch auf vollem     │
                    │    Kontext aller 3 Engines    │
                    │                               │
                    │  "Für Ihr Profil empfehle     │
                    │   ich heute CSP auf AAPL,     │
                    │   Konfidenz 78%, weil..."     │
                    └──────────────────────────────┘
```

---

## Warum UIQ 2030 verteidigbar ist

**Die Schutzlücke:** Kein großer Anbieter baut das, weil es sich für eine breite Masse nicht lohnt. TradingView braucht Millionen Nutzer — sie bauen universell. UIQ braucht tausend zahlende Nutzer, die bereit sind, für persönliche Entscheidungsbegleitung zu zahlen. Das ist eine andere Ökonomie, und eine verteidigbarere.

**Die Nische:** Selbstentscheidende Privatanleger mit 50.000–500.000 € investiertem Kapital, die keinen Bankberater wollen (zu teuer, zu wenig individuell), aber auch kein reines Data-Tool (zu komplex, zu anonym). Diese Gruppe ist groß, wächst, und ist today underserved.

**Das Vertrauensargument:** Ein System, das sagt "Konfidenz 42% — ich bin heute nicht sicher genug" ist vertrauenswürdiger als ein System, das immer eine Antwort hat. Das ist der Kern-Differenziator.

**Der Erfolgsmaßstab** (aus SUITE.md §0):
> *"UIQ hat mich nicht reich gemacht. Aber es hat mich mehrfach davor bewahrt, in den falschen Markt mit der falschen Strategie einzusteigen."*

---

## Roadmap zur Drei-Engine-Architektur

| Phase | Zeitraum | Inhalt |
|---|---|---|
| **Phase 0** | heute — Ende 2026 | MIE fertigstellen: BN-Kalibrierung, MCM-HMM, IV-Rank, Track Record |
| **Phase 1** | Q1 2027 | DCE v1.0: 6-Dimensionen-Konfidenz, Handlungs-Gate, UI-Integration |
| **Phase 2** | Q2–Q3 2027 | Anlegerprofil-Schema definieren + IPE v1.0: Profil-Onboarding, Strategie-Personalisierung |
| **Phase 3** | 2028 | Investment Coach: KI-Gespräche auf vollem Drei-Engine-Kontext |
| **Phase 4** | 2029–2030 | PortfolioIQ + Retirement Planner integriert, vollständiger Coach-Zyklus |

---

## Was nicht in UIQ 2030 gehört

| Idee | Ausschlussgrund |
|---|---|
| Echtzeit-Charts | TradingView kann das besser — kein Wettbewerb auf fremdem Terrain |
| Social Trading / Copy Trading | Widerspricht dem "selbstentscheidend"-Kern |
| Automatisierter Handel | Compliance-Risiko, BaFin-Grenze, Haftungsfragen |
| Kursprognosen | Widerspricht dem No-Hallucination-Grundsatz |
| Portfolio-Tracking in Echtzeit | Nur als Kontext-Input für IPE, nicht als Hauptfeature |

---

*VISION_2030.md v1.0 · 03.08.2026 · Dr. Axel Hildebrand*  
*Nächste Revision: nach DCE v1.0 Implementierung (Q1 2027)*
