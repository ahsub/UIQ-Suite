# TRADE-DOKTOR (OptionTrade-Doktor) — Konzept v1.0

**Erstellt:** 12.08.2026
**Status:** Konzept — Sprint geplant, kein Code
**Priorität:** Nach UIQ Phase 0 (kein Eingriff in Lead-Projekt-Prioritäten, s. CODING-RULES.md §4.2)
**Bezug:** OPTIONSMODUL-ARCHITEKTUR.md §9 (UIQ Options Agent, V2-Zielbild),
Block A der Session 12.08.2026 (`window.KoPrompts`-Kollision, s. UEBERGABE-2026-08-12.md)

---

## 1. Zweck

Axel ist aktiv in Discord-Gruppen für Optionstrader unterwegs, in denen Trade-Ideen
geteilt werden (z.B. „NVDA CSP 45 DTE Strike 160 Delta ~0,20"). Trade-Doktor soll
solche fremden Trade-Ideen gegen UIQs eigene Regeln (Regime, Delta-/DTE-Zielbereich,
Strategie-Gates) prüfen und eine ausführliche, begründete Einschätzung liefern —
als persönliches Analyse-Werkzeug, das Axels eigenes Fachwissen unterstützt, nicht ersetzt.

## 2. Leitplanken (bindend)

- **Reines Eigenbedarf-Werkzeug.** Kein automatischer Post, kein Share-Button, keine
  Discord-Integration. Axel liest die UIQ-Einschätzung und formuliert seine Antwort im
  Forum selbst, in eigenen Worten.
- **Kein Systemoutput in öffentlichen Threads; UIQ bleibt in der Ansprache unerwähnt**
  (bereits als bewusste Entscheidung in UEBERGABE-2026-08-12.md §7 festgehalten —
  Trade-Doktor darf diese Grenze nicht unterlaufen).
- **Kein On-Demand-Enrichment.** Der Ticker muss im bestehenden Scan-Universum liegen.
  Kein zusätzlicher Live-API-Call für beliebige, fremde Ticker außerhalb des Universums.
- **Kein neuer Regime-Klassifikator.** Nutzt ausschließlich den Server-MSE (CODING-RULES.md §2.6).

## 3. Architektur

### 3.1 Erweiterungspunkt (Block A, bereits geklärt)

- Liegt in `ko-prompts.js`, **nicht** in `ko-strategies.js` (Single Source of Truth
  seit v415, s. Fund-1-Fix vom 12.08.2026, Commit `ccad16b`).
- `buildPrompt(strat, ctx)` ist vom Scoring entkoppelt — `ctx.marktkontext` ist ein
  opaker String. Kein Eingriff in die Scoring-Suite nötig.

### 3.2 Zwei-Schichten-Prinzip (V2-Vorgriff, §9 OPTIONSMODUL-ARCHITEKTUR.md)

Nach dem dort dokumentierten Grundsatz **„Verdict wird konsumiert, nie vom LLM
erzeugt"** (Tool-orchestrierter Agent statt monolithischer Prompt):

1. **Deterministische Bewertungsfunktion** (kein LLM):
evaluateOptionsTradeAgainstUIQRules(ticker, strategy, strike, dte, delta, uiqContext)
→ { deltaAbweichung, dteAbweichung, regimeGateStatus, ivRankKontext, ... }

   Vergleicht geparste Nutzer-Werte gegen UIQ-eigene Zielbereiche (Delta 0.20–0.30,
   DTE 21–45, Regime-Gate-Status aus `getStrategyGates()`). Reine Berechnung,
   keine KI-Beteiligung — analog zum bestehenden Prinzip „Scores immer server-seitig"
   (CODING-RULES.md §2.4).

2. **KI-Erklärschicht** — bekommt ausschließlich das fertige, deterministische
   Ergebnis aus Schritt 1 als `ctx`. Aufgabe: erklären und begründen, nicht berechnen.

**Vorteil:** `evaluateOptionsTradeAgainstUIQRules()` ist bereits eine „Tool"-Funktion
im Sinne der geplanten Options-Agent-Architektur (§9) — beim späteren Ausbau zum
vollen Agent wird sie direkt wiederverwendet, kein Umbau nötig. Das erfüllt die
Vorgabe „möglichst geringe Anpassungen beim Übergang ins geplante Optionsmodul".

### 3.3 Neuer Prompt-Zweig (statt Wiederverwendung von EIC oder Public)

Bestehende Zweige in `ko-prompts.js::getSystemPrompt()`:
- **EIC:** direkt, konkrete Zahlen — aber ohne Begründungstiefe.
- **Public:** Erklärpflicht für jede Metrik — aber bewusst BaFin-vorsichtig
  formuliert (§1 WpHG, „Die Datenlage spricht für...").

Trade-Doktor braucht einen **dritten Zweig**: EIC-Direktheit + Public-Erklärpflicht,
ohne BaFin-Hedging (Output ist nicht öffentlich, s. Leitplanken §2). Konkrete
Kritik *und* ausführliche Begründung für jede Abweichung von der UIQ-Regel.

## 4. Eingabe: Freitext-Parser (nicht Formular)

Bewusste Entscheidung (Axel, 12.08.2026): Ein Formular lenkt den Blick zu sehr auf
ein sichtbares „Analyse-Tool" — Trade-Doktor soll im Hintergrund bleiben. Freitext-
Paste des Discord-Posts ist das primäre Eingabeformat.

**Prinzip:** Bei Unklarheiten beim Parsen (z.B. Strategie-Typ nicht eindeutig,
Delta fehlt) **nachfragen statt raten** — konsistent mit dem systemweiten
No-Hallucination-Prinzip (KI_ANTI_HALLUZINATION, gilt für alle Prompt-Aufrufe seit v450).

Zu extrahierende Felder (Referenzfall Axel: „NVDA CSP 45 DTE Strike 160 Delta ~0,20"):
- Ticker (Pflicht, Abgleich gegen Scan-Universum)
- Strategie-Typ (CSP/Wheel/Covered Call/Collar/... — Mapping auf UIQ-Strategie-IDs)
- Strike (Pflicht für Bewertungsfunktion)
- DTE oder Verfallsdatum (mind. eines von beiden)
- Delta (optional, aber wichtig für Zielbereich-Abgleich)

## 5. Bausteine (Sprint-Backlog)

| Block | Inhalt | Status |
|---|---|---|
| A | Architektur-Klärung (Erweiterungspunkt, Entkopplung von Scoring) | ✅ Geklärt 12.08.2026 |
| B | Freitext-Parser: Ticker/Strategie/Strike/DTE/Delta extrahieren, Rückfrage bei Unklarheit | Offen |
| C | Matching gegen Scan-Universum (`bySymbol`-Lookup), klare Fehlermeldung bei Nicht-Treffer | Offen |
| D | `evaluateOptionsTradeAgainstUIQRules()` — deterministische Bewertungsfunktion | Offen |
| E | Neuer Prompt-Zweig in `ko-prompts.js` (EIC-Direktheit + Public-Erklärpflicht, kein BaFin-Hedging) | Offen |
| F | UI: eigenes Panel/Modal, kein Public-Output-Pfad | Offen |

## 6. Abgrenzung zum bestehenden System

| Komponente | Rolle | Modul |
|---|---|---|
| Market State Engine (4 Regimes) | Liefert Regime-Kontext für die Bewertungsfunktion | UIQ (ko-market-state.js) |
| `getStrategyGates()` | Liefert Regime-Gate-Status je Strategie | UIQ (bestehend) |
| `evaluateOptionsTradeAgainstUIQRules()` | Neue deterministische Bewertungsfunktion (Block D) | Trade-Doktor (neu) |
| Neuer Prompt-Zweig (Block E) | KI-Erklärschicht | `ko-prompts.js` (Erweiterung) |
| UIQ Options Agent (§9, V2-Zielbild) | Voller Tool-orchestrierter Agent | Zukünftig — Trade-Doktor-Bewertungsfunktion wird dort wiederverwendet |

---

*v1.0 — 12.08.2026. Konzeptdokument, kein Code.*
*Nächste Schritte: Block B (Parser-Design) im Detail ausarbeiten, dann Block D
(Zielbereiche/Regeln je Strategie aus §3/§6 OPTIONSMODUL-ARCHITEKTUR.md ableiten).*
