# UIQ — Leitbild & Positionierung

**Version:** 1.0  
**Stand:** August 2026  
**Autor:** Dr. Axel Hildebrand · Claude (Anthropic)  
**Ablage:** `ahsub/UIQ-Suite/docs/LEITBILD.md`  
**Geltung:** Verbindlich für alle Produkt- und Feature-Entscheidungen in UIQ.  
Bei Widerspruch zwischen diesem Dokument und SUITE.md gilt: LEITBILD für
Produkt-Identität und Feature-Priorisierung, SUITE.md für technische
Architektur-Standards.

---

## 1. Die eine Frage die UIQ beantwortet

> **"Was ist die beste Entscheidung für mein Portfolio heute —  
> basierend auf denselben Methoden die institutionelle Investoren nutzen?"**

Nicht: "Was passiert am Markt?"  
Nicht: "Welche Aktie steigt morgen?"  
Sondern: "Was soll ich in meiner konkreten Situation, mit meinem konkreten
Portfolio, im aktuellen Marktkontext tun?"

Das ist der fundamentale Unterschied zu Scannern, Screenern und
Marktanalyse-Tools. UIQ beantwortet nicht eine allgemeine Frage für alle
Nutzer gleichzeitig — UIQ beantwortet eine spezifische Frage für einen
konkreten Anleger in einem konkreten Moment.

---

## 2. Positionierung

### Was UIQ ist

**Investment Decision Support Platform**

Eine Plattform die anspruchsvollen Privatanlegern institutionelle und
mathematisch-basierte Entscheidungsprozesse zugänglich macht — ohne
institutionelles Kapital, ohne Research-Abteilung, ohne Vollzeit-Trading.

UIQ übersetzt die Methoden von Minervini, O'Neil, Zeiierman und
institutionellen Markttechnikern in konkrete, handlungsorientierte Signale
für den Privatanleger der:

- Aktien langfristig hält und Qualität über Spekulation stellt
- Einkommen mit Optionen (CSP, Covered Call, Wheel) generiert
- Risiken systematisch steuert statt intuitiv zu handeln
- nicht nur auf Kursbewegungen, sondern auf Marktstruktur achtet

### Was UIQ nicht ist

❌ Ein Trading-Scanner (TradingView, Finviz, MarketSurge)  
❌ Ein Options-Rechner (OptionStrat, ORATS)  
❌ Ein Broker (Ausführung findet woanders statt)  
❌ Ein Robo-Advisor (UIQ entscheidet nicht — UIQ unterstützt Entscheidungen)  
❌ Eine Vorhersagemaschine (Wahrscheinlichkeiten, keine Gewissheiten)

### Das Alleinstellungsmerkmal

Der Markt ist voll von Tools die *Daten zeigen*. UIQ zeigt *Entscheidungen*.

Der Unterschied:

| Andere Tools | UIQ |
|---|---|
| "NVDA RSI: 67" | "NVDA: B+ · RSI moderat bullish · CSP-Zone aktiv" |
| "Marktbreite: 58%" | "Regime: BULL_QUIET → Momentum-Strategien bevorzugen" |
| "IV-Rank: 34%" | "CSP-Timing: günstig · Zielstrike: $187 · annualisiert: ~22%" |
| "Volume: 1.8×" | "Institutionelle Aktivität: erhöht · Bull-Volumen: 67%" |

UIQ rechnet komplex und präsentiert einfach.

---

## 3. Der Entscheidungs-Pfad (UIQ-Architektur-Prinzip)

Jedes Feature in UIQ muss einem Schritt dieses Pfads dienen.
Features die keinem Schritt dienen sind nicht UIQ.

```
MARKTKONTEXT
Was passiert gerade im Markt als Ganzes?
(Regime, MCM, Distribution Days, VIX-Term-Struktur)
         ↓
KANDIDATEN-QUALITÄT
Welche Titel erfüllen institutionelle Mindeststandards?
(Minervini-Score, RS-Rank, Marktstruktur, Stage-II)
         ↓
INSTITUTIONELLE ZONEN
Wo wollen institutionelle Akteure kaufen/verkaufen?
(AVWAP, Order Blocks, POC/VAH/VAL, Confluence)
         ↓
INSTRUMENT-AUSWAHL
Welche Options-Strategie passt zu Kontext + Kandidat?
(CSP/CC/Wheel-Engine, IV-Rang, Strike-Empfehlung, CRV)
         ↓
ENTSCHEIDUNGS-OUTPUT
Was tue ich jetzt konkret, und warum?
(KI-Begründung, Handlungsempfehlung, Compliance-konform)
         ↓
NACHVERFOLGUNG ← (nächste Ausbaustufe)
Hat meine Entscheidung funktioniert?
(Track Record, Journal, Performance-Attribution)
```

**Aktueller Stand (August 2026):** Schritte 1–5 sind produktiv.
Schritt 6 (Nachverfolgung) ist in Phase A (Track Record) begonnen —
Journal-Modul und Performance-Attribution sind die nächsten Prioritäten
nach dem Score-Refactoring Sprint.

---

## 4. Feature-Gate

Bevor ein neues Feature gebaut wird, muss es diesen Filter bestehen:

**Frage 1 — Entscheidungs-Relevanz:**
Unterstützt dieses Feature einen konkreten Schritt des Entscheidungs-Pfads?
Wenn nein → nicht bauen.

**Frage 2 — 80/20-Test:**
Liefert dieses Feature ≥80% Nutzerwert bei ≤20% Aufwand?
Wenn nein → zurückstellen.

**Frage 3 — Verständlichkeit:**
Kann ein anspruchsvoller Privatanleger (kein Entwickler) den Output
ohne Anleitung interpretieren?
Wenn nein → erst UI/UX lösen, dann bauen.

**Frage 4 — Differenzierung:**
Tut das bereits ein etablierter Konkurrent besser?
Wenn ja → nur bauen wenn UIQ es entscheidungsrelevanter machen kann.

---

## 5. Zielgruppe

**Primär:** Der anspruchsvolle Privatanleger

- Investiert aktiv, aber nicht als Vollzeit-Trader
- Kombination aus Aktien-Langzeithalten und Options-Einkommen
- Versteht Grundlagen (P/E, IV, Delta) — braucht aber keinen
  Bloomberg-Terminal-Ersatz
- Sucht Systematik statt Intuition
- Hat begrenzte Zeit: will in 10-15 Minuten täglich die wichtigste
  Entscheidung treffen können

**Sekundär:** Der erfahrene Optionshändler

- Bereits systematisch unterwegs, sucht bessere Marktstruktur-Signale
- Schätzt institutionelle Methoden (GEX, Dark Pool, Order Blocks)
- Vergleicht UIQ mit professionellen Tools wie ORATS oder Unusual Whales

**Nicht primär:** Der Day-Trader, der Anfänger, der reine Technik-Chart-Leser

---

## 6. Sprache & Kommunikation

### Nach außen (Nutzer sieht)
- Handlungsorientiert: "Jetzt prüfen", "Vertretbar", "Abwarten"
- Begründet aber knapp: eine Zeile Kontext, keine Vorlesung
- Zahlen mit Einheit und Richtung: "+2.3% über AVWAP", "B+ (78/100)"
- Keine Fachjargon-Überfrachtung: "institutionelle Zone" statt
  "Bullish Order Block mit 67% Bull-Volumen-Anteil und 12% Mitigation"

### Nach innen (Berechnung dahinter)
- Mathematisch präzise: jede Zahl rückführbar auf Quelle und Formel
- Keine Halluzination: KI erklärt und formuliert, rechnet nicht frei
- Verifikations-Pflicht: jede Zahl aus verifizierbarer Datenquelle

### Compliance-Grenze
- Public-Bereich: "Statistische Kontext-Analyse" — nie "Empfehlung"
- EIC-Modus: konkretere Handlungshinweise, aber mit Disclaimer
- UIQ trifft keine Entscheidungen — UIQ unterstützt sie

---

## 7. Was als nächstes gebaut werden sollte

In Prioritätsreihenfolge, abgeleitet aus dem Entscheidungs-Pfad:

### Kurzfristig (nächste 4-8 Wochen)
1. **Score-Refactoring Sprint A** (TVA MathLibrary: ADX, f_marketRegime,
   f_chopIndex) — stärkt Schritt 1+2 des Pfads
2. **Entscheidungs-Output verbessern** — KI-Begründung klarer und
   handlungsorientierter formulieren, weniger technisch

### Mittelfristig (2-4 Monate)
3. **Journal-Modul** — "Warum habe ich diese Entscheidung getroffen?"
   → stärkt Schritt 6 (Nachverfolgung) entscheidend
4. **Portfolio Health Score** — Übersicht aller gehaltenen Positionen
   mit UIQ-Score → verbindet Einzeltitel-Analyse mit Portfolio-Kontext
5. **Szenario-Simulation** — "Was passiert bei -15% Nasdaq mit meinem
   Options-Portfolio?" → für Optionsinvestoren enorm wertvoll

### Langfristig (nach Beta-Phase)
6. **Regelbasierte Alerts** — "CSP bei NVDA erreicht 80% Gewinn →
   Rückkauf prüfen" (nicht: "Tesla steigt 5%")
7. **Performance-Attribution** — welche Entscheidungen haben funktioniert
   und warum?

---

## 8. Was bewusst nicht gebaut wird

❌ Noch mehr technische Indikatoren ohne Entscheidungs-Kontext  
❌ Intraday-Charts (UIQ ist Daily — Timing ist Nutzersache)  
❌ Eigene Charting-Engine (TradingView macht das besser)  
❌ KI-Chatbot als primäre Interaktion (UIQ ist kein Assistent,
   sondern ein strukturierter Prozess)  
❌ Broker-Integration / Ausführung (Compliance-Grenze)  
❌ Komplette Portfolio-Verwaltung (das ist DepotIQ, nicht UIQ)

---

## 9. Verhältnis zu SUITE.md

Dieses Dokument definiert **was** UIQ ist und **warum** Features gebaut werden.  
SUITE.md definiert **wie** gebaut wird (Architektur, ES6, Compliance).  
Bei Widerspruch: LEITBILD entscheidet über Richtung, SUITE.md über Methode.

---

*UIQ Leitbild v1.0 · August 2026 · Dr. Axel Hildebrand*
