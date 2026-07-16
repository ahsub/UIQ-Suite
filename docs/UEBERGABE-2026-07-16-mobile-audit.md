## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v355 deployed", "X funktioniert") ist eine Aussage der
   letzten Session über sich selbst — nicht dein eigenes Wissen. Behandle es
   wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **v354 wurde von Axel im Browser visuell bestätigt (Screenshot).**
   v355 wurde deployed aber noch nicht visuell verifiziert — Axel prüft
   beim nächsten Login von zuhause.

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. Axel: bitte bei nächster Gelegenheit fragen "hast du das verifiziert oder
   übernommen?", wenn ich etwas aus diesem Protokoll unkritisch wiederhole.

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# ÜBERGABEPROTOKOLL — 16.07.2026, Nachmittag/Abend — Durchklick-Test + Batch 1+2

## Kontext

Fortsetzung der Mobile-Audit-Session vom Vormittag. Axel hat in der Praxis
einen vollständigen Durchklick-Test durchgeführt und Feedback geliefert.
Daraus wurden zwei Batches umgesetzt.

**axel-scanner-Version am Ende: v355** (war v353 zu Sessionbeginn)
**ko-aggregator, ko-modules: unverändert**

---

## Durchklick-Test Befunde (vollständige Liste)

### Aus der Liste gestrichen (kein Bug):
- **U1** — Scanner-Strategie-Buttons öffnen AlphaDesk: das sind die Ampel-Chips
  im Market-Weather-Widget, die absichtlich zum passenden Leaderboard navigieren
  (Arbeitspaket D). Axel hatte eine Strategie-Auswahl erwartet — Missverständnis
  geklärt, kein Fix nötig.

### Umgesetzt in Batch 1 (v354, Commit 56abebd84fb0):
- **B1** — `fetchSingleForDeepDive()`: fehlende `var j = await r.json()` Zeile
  ergänzt → ReferenceError "j is not defined" beim DeepDive behoben
- **U2** — Scanner-Button „Markt-Einschätzung" → „KI-Strategieempfehlung"
- **U4** — „Beste Chance"-Modal: Top-5 statt Top-1, mit Strategie-Label + Score-
  Karte pro Kandidat; KI analysiert alle 5 und hebt den stärksten hervor
- **U8** — Versionstag linksbündig unter Datum/Uhrzeit in Sidebar (war inline
  neben „UnderlyingIQ"-Titel)
- **U9** — „Marktlage analysieren"-Button aus Card-Footer nach Card-Header
- **S1+S2** — Sidebar-Reihenfolge: Übersicht → [Markt-Kontext] Makro →
  [Trading] Alpha Desk → Scanner → Fibonacci (Desktop + Mobile)
- **S3** — KO-Rechner nav-Button entfernt; Panel-Code + JS vollständig erhalten

### Umgesetzt in Batch 2 (v355, Commit b9e44492d634):
- **U9b** — „Marktlage analysieren"-Button nochmals nach oben verschoben:
  jetzt ganz oben auf dem Home-Tab, direkt nach dem Header-Block, VOR dem
  Regime-Banner — kein Scrollen mehr nötig. Leicht vergrößert (13px, 10px
  Padding). **Noch nicht visuell verifiziert (Axel prüft zuhause).**

---

## Noch offene Punkte aus dem Durchklick-Test

| # | Priorität | Beschreibung |
|---|---|---|
| U5 | Mittel | AlphaDesk: Strategien ohne Metriken (Breakdown, Fading, VCP, KO-Short) zeigen trotzdem Leaderboards — irreführend |
| U6 | Niedrig | CSP/ATM und CSP Weekly im AlphaDesk: funktionieren, aber nicht vollständig belegt |
| U7 | Mittel | Breakout, Dividende, Value: keine Trading-Metrik hinterlegt |
| U10 | Sprint | F&G-Wert fehlt im Regime-Block — Datenpipeline-Lücke, gekoppelt mit Morning-Briefing-Gate |
| B3 | Niedrig | „Beste Chance"-Modal klebt am unteren Bildschirmrand (nun Top-5 — prüfen ob weiterhin) |
| B4 | Niedrig | Unbeschriftete Buttons: „Zur WL hinzufügen" (nur Icon), MACD-Timeframe |
| S4 | Niedrig | Fibonacci-Tab: aus Sidebar raus oder in „Weitere Tools" verstecken |
| S5 | Sprint | Morning Briefing Gate: erst wenn alle Daten → KI → Cache |
| S6 | Niedrig | TradingView Deep-Link mit Ticker-Parameter |
| S7 | Folgt S3 | Rechner-Button in Ticker-Karten entfernen (abhängig von KO-Rechner-Entscheidung ✓) |

## Strategische Entscheidungen (getroffen, noch nicht umgesetzt)

- **KO-Rechner:** Tab entfernt ✓ (v354). Modul-Code erhalten für spätere
  mögliche Nutzung als Inline-Block in DeepDive-Karte (Kontext: Ticker bereits
  bekannt, sinnvoller als separater Tab).
- **Fibonacci:** Aus Sidebar raus, aber nicht löschen — in „Mehr"-Menü oder
  ausklappbaren „Weitere Tools"-Block. Entscheidung noch nicht umgesetzt.
- **Nomenklatur-Taxonomie:** Inkonsistente Strategie-Namen (Momentum vs.
  Minervini etc.) — Taxonomie-Referenztabelle muss VOR weiteren Umbenennungen
  erstellt werden. Noch nicht begonnen.
- **Morning Briefing Gate:** Datenaggregations-Gate (alle Daten zuerst → dann
  KI) als separater Sprint nach Phase-0-Stabilisierung.

## Bekannte Bugs (offen, nicht in diesem Batch)

- **B2** — „Zu viele Anfragen gleichzeitig" beim Strategie-Test: kein echter
  Code-Bug, sondern Anthropic RPM-Limit bei schnell aufeinanderfolgenden Calls.
  Bestehende Retry-Logik (20s-Countdown) ist die richtige Antwort.
- **MCM-Altlast** — `showMSEDetail()`-Modal ruft noch `getStrategyGates()`
  direkt auf statt `_lastMseResult` (bekannt seit v323.1, dokumentiert in
  früherem Übergabeprotokoll).
- **Python-Aggregator** — `generate_daily_snapshot()` field-path bugs für
  regime, VIX, PCR (bekannt, Root Cause bestätigt, Fix erfordert MCM-Port
  nach Python).

## Infrastruktur-Stand (Ende Session, 16.07.2026 Abend)

| Komponente | Version/Hash |
|---|---|
| axel-scanner | v355, Commit `b9e44492d634` |
| ko-aggregator (Python) | v5.11.0, Commit `f38f3e4` (unverändert) |
| ko-modules (ko-scanner.js) | Commit `f6e398e` (unverändert) |

## Nächste Session

1. **[SOFORT]** v355 visuell verifizieren (Button-Position Home-Tab)
2. **[BATCH 3]** Nomenklatur-Taxonomie-Tabelle erstellen (Referenzdokument)
3. **[BATCH 3]** S4 Fibonacci aus Sidebar, S7 Rechner-Button weg, B4 WL-Button
   beschriften
4. **[SPRINT]** U5/U7 Strategien ohne Metriken aus Leaderboards ausblenden
5. **[STRATEGIC]** Morning Briefing Gate + F&G-Pipeline (nach Phase-0)
