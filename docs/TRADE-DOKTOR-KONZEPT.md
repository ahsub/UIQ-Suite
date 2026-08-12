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

**Geprüft und bewusst nicht übernommen (13.08.2026):** Ein "Discord-Vorsicht-
Reminder" am Ende der KI-Erklärschicht (z.B. "formuliere das vorsichtiger") wurde
vorgeschlagen, von Axel aber begründet abgelehnt — gelebte Forum-Praxis ist, dass
jeder Trade-Ideen auf eigenes Risiko teilt, ohne Rechtsbeistand-Formulierungshilfe.
Vermerkt, damit der Punkt nicht in einer späteren Session erneut aufgeworfen wird,
ohne zu wissen, dass er bereits entschieden ist.

**Bestätigter Non-Issue (13.08.2026, ad6):** Axels Standardregel — nur
veroptionierbare Qualitätsaktien mit Mindestmarktkapitalisierung — ist durch das
Scan-Universum (IWV-Konstituenten) bereits strukturell abgedeckt. Kein
zusätzlicher Filter nötig.

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
→ { schweregrad, deltaAbweichung, dteAbweichung, regimeGateStatus, ivRankKontext, ... }

**Schweregrad (13.08.2026 ergänzt)** — explizites Feld, damit die KI-Erklärschicht
   nicht "Regime sperrt die Strategie komplett" und "Delta liegt 0.05 daneben"
   gleich gewichtet:
   - `GATE_VERSTOSS` — Strategie im aktuellen Regime laut `getStrategyGates()`
     komplett gesperrt (🔴). Botschaft: "mach das grundsätzlich nicht".
   - `PARAMETER_ABWEICHUNG` — Strategie im Regime erlaubt, aber Strike/DTE/Delta
     weicht vom `rules`-Zielbereich (s.u.) ab. Botschaft: "mach's etwas anders".
   - `IM_ZIELBEREICH` — keine Beanstandung.

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

**Bekannte Inkonsistenz (für Block D zu klären):** Der DTE-Zielbereich ist aktuell
uneinheitlich hinterlegt — `DEFAULT_OPTS_CFG.dte = 30` (→ Prompt-Text „30–45 DTE")
vs. generische EIC-System-Prompt-Regel „DTE 21–45". Vor dem Bau von Block D
vereinheitlichen und ins `rules`-Feld (s.u.) übernehmen.

**Delta-Zielbereich ist strategie-spezifisch, kein globaler Wert (13.08.2026,
Axel-Korrektur ad1):** Ein CSP-Delta von 0.20–0.30 ist für `atmna` (ATM-CSP)
schlicht nicht erreichbar — die Strategien haben *naturgemäß* unterschiedliche
Zielbereiche. Gelöst durch das `rules`-Feld pro Strategie (s.u.), nicht durch
einen einzigen globalen Wert.

**Geteiltes `rules`-Feld statt Daten-Kopie (13.08.2026, Axel-Vorschlag ad4):**
Ursprünglich als eigene `CSP_MANAGEMENT_PLAYBOOK`-Konstante entworfen — das hätte
die `atmna`-Regeln dupliziert (Dual-Source-of-Truth-Risiko, CODING-RULES.md §2.6-
Prinzip). Bessere Lösung: `Strategies[stratId]` in `ko-strategies.js` um ein neues,
**rein maschinenlesbares** `rules`-Feld erweitern, getrennt von den bestehenden
Prosa-/Prompt-Feldern (`label`, `intro`, `basics` etc.):

```javascript
atmna: {
  // ... bestehende Felder (label, intro, basics, ...) unverändert ...
  rules: {
    deltaRange: null,           // ATM per Definition — kein Delta-Fensterziel
    dteRange: [21, 45],         // ~30 Tage, 3. Freitag
    profitTaking: [
      { restlaufzeitPct: '>50%',  zielGewinnPct: 50 },
      { restlaufzeitPct: '30-50%', zielGewinnPct: 60 },
      { restlaufzeitPct: '<30%',  zielGewinnPct: 70 },
    ],
    rollStufen: [
      { stufe: 1, aktion: 'Niedrigerer Strike, 30-60 DTE, prämienneutral' },
      { stufe: 2, aktion: 'Gleicher Strike, neue Laufzeit, prämienneutral' },
      { stufe: 3, aktion: 'Niedrigerer Strike, doppelte Kontrakte' },
    ],
    maxRollDte: 90,
    trigger: 'Bei Delta-Anstieg (Kurs nähert sich/unterschreitet Strike) oder bei '
           + 'schneller Gewinnentwicklung deutlich vor Verfall.',
  },
},
options: {
  // ... bestehende Felder unverändert ...
  rules: {
    deltaRange: [0.20, 0.30],
    dteRange: [21, 45],
    // kein Frühausstiegs-/Roll-Regelwerk hinterlegt — generischer CSP/Wheel-Fall
  },
},
```

**Tragweite:** Das ist kein Trade-Doktor-internes Detail, sondern ein **geteiltes
Modul für jedes strategieabhängige Programmteil** — UIQ selbst, Trade-Doktor,
und jede künftig geplante Optionsstrategie/Optionskette greift auf dieselbe
Quelle zu. Block D wird dadurch zu einer reinen Lookup-Funktion
(`Strategies[stratId].rules`) statt einer eigenen Datenhaltung — Duplizierung
strukturell ausgeschlossen, nicht nur vermieden.

**IV-Rank-Quelle — Klärung (13.08.2026, ad3):** Weder CBOE (bisher nur
Index-weite Benchmarks: PUT/BXM/CLL, s. REGIME-BACKTEST-VALIDIERUNG.md) noch
CapTrader/IBKR (Live-API laut §7 OPTIONSMODUL-ARCHITEKTUR.md "Bau selbst noch
NICHT begonnen") liefern heute echte Pro-Ticker-IV. `ivRankKontext` in Block D
startet daher mit **Phase 1** (Realized-Vol-Proxy aus Twelve Data, §5
OPTIONSMODUL-ARCHITEKTUR.md) — muss im Output als Näherung gekennzeichnet sein
("Realized Vol ≠ IV"), nicht als harter Fakt. Wechselt automatisch auf Phase 2
(echte ATM-IV), sobald die IBKR-Live-Anbindung unabhängig davon steht — kein
separates Warten, aber auch keine Abkürzung heute.

**Wichtige Einschränkung:** Trade-Doktor sieht die Position **nicht live** — kein
Delta-Tracking über Zeit, keine echte P&L-Verfolgung (das wäre On-Demand-Zugriff
auf fremde/eigene Depots, s. Leitplanken §2 bzw. CapTrader-Frage in §7). Das
`rules`-Playbook ist ein **statischer Referenzrahmen zum Analysezeitpunkt** —
"hierauf achten", nicht "ich beobachte deine Position". Muss im Output so
eingeordnet werden, um keine falsche Erwartung zu wecken.

**Scope-Erweiterung durch Screenshot-Eingabe (s. §4.2):** Reale Positionen aus
Trading-Apps sind nicht auf CSP beschränkt (Referenzfall 12.08.2026: DDOG Short
Call, Delta 0.412). Block D muss daher auch Covered-Call-/Short-Call-artige
Positionen bewerten können, nicht nur CSP.

### 3.3 Neuer Prompt-Zweig (statt Wiederverwendung von EIC oder Public)

Bestehende Zweige in `ko-prompts.js::getSystemPrompt()`:
- **EIC:** direkt, konkrete Zahlen — aber ohne Begründungstiefe.
- **Public:** Erklärpflicht für jede Metrik — aber bewusst BaFin-vorsichtig
  formuliert (§1 WpHG, „Die Datenlage spricht für...").

Trade-Doktor braucht einen **dritten Zweig**: EIC-Direktheit + Public-Erklärpflicht,
ohne BaFin-Hedging (Output ist nicht öffentlich, s. Leitplanken §2). Konkrete
Kritik *und* ausführliche Begründung für jede Abweichung von der UIQ-Regel.

## 4. Eingabe: Freitext-Parser (nicht Formular) + Screenshot

Bewusste Entscheidung (Axel, 12.08.2026): Ein Formular lenkt den Blick zu sehr auf
ein sichtbares „Analyse-Tool" — Trade-Doktor soll im Hintergrund bleiben. Freitext-
Paste des Discord-Posts ist das primäre Eingabeformat, Screenshot-Upload (s. §4.2)
ein zweiter, gleichwertiger Weg zum selben strukturierten Zwischenergebnis.

**Prinzip:** Bei Unklarheiten beim Parsen (z.B. Strategie-Typ nicht eindeutig,
Delta fehlt) **nachfragen statt raten** — konsistent mit dem systemweiten
No-Hallucination-Prinzip (KI_ANTI_HALLUZINATION, gilt für alle Prompt-Aufrufe seit v450).
Gilt für beide Eingabewege gleichermaßen.

### 4.1 Extraktionsregeln (Freitext)

Zu extrahierende Felder (Referenzfall Axel: „NVDA CSP 45 DTE Strike 160 Delta ~0,20"):

| Feld | Regel | Beispiel-Match |
|---|---|---|
| Ticker | Großbuchstaben-Token (1–5 Zeichen) gegen `bySymbol`-Keys (Scan-Universum) abgleichen — Strategie-Schlüsselwörter (CSP, DTE) explizit von der Ticker-Kandidatenliste ausgeschlossen | `NVDA` |
| Strategie-Typ | Schlüsselwort-Tabelle (s.u.) | `CSP` → `options` |
| Strike | `/Strike\s*[:=]?\s*\$?(\d+(?:[.,]\d+)?)/i`, Fallback `$`-präfigierte Zahl | `Strike 160` → `160` |
| DTE | `/(\d+)\s*DTE/i` oder Verfallsdatum parsen und DTE berechnen | `45 DTE` → `45` |
| Delta | `/Delta\s*[:=~]?\s*(0?[.,]\d+)/i`, Komma und Punkt als Dezimaltrenner | `Delta ~0,20` → `0.20` |

**Strategie-Schlüsselwort-Tabelle:**

| Forum-Begriff | UIQ-ID | Disambiguierung |
|---|---|---|
| CSP, Cash Secured Put, Wheel, Covered Call, CC | `options` | Standard — außer DTE ≤ 10 |
| CSP (DTE ≤ 10), Weekly | `weekly_income` | Nur bei explizit kurzer Laufzeit |
| Collar, Protective Put | `collar` | — |
| Explizite ATM/NA-Erwähnung im Text | `atmna` | Selten bei Fremd-Trades — sonst Standard-Fallback `options`, s. `rules`-Feld §3.2 |

**Nachfrage-Logik statt Raten (Pseudocode):**

```javascript
function parseTradeIdea(text, scanUniverse) {
  const result = { ticker: null, strategy: null, strike: null, dte: null, delta: null };
  const missing = [];
  // ... Extraktion wie oben ...
  if (!result.ticker) missing.push('ticker');
  if (!result.strike) missing.push('strike');
  if (!result.dte) missing.push('dte'); // Delta bleibt optional
  if (result.ticker && !scanUniverse[result.ticker]) {
    return { error: 'NICHT_IM_SCAN_UNIVERSUM', ticker: result.ticker };
  }
  if (missing.length > 0) {
    return { error: 'UNVOLLSTAENDIG', missing, partial: result };
  }
  return { ok: true, ...result };
}
```

Bei `UNVOLLSTAENDIG`/`NICHT_IM_SCAN_UNIVERSUM`: konkrete Rückfrage in der UI
("Welcher Strike?" / "NVDA ist nicht im aktuellen Scan-Universum"), nie mit
Lücken direkt in Block D.

### 4.2 Screenshot-Eingabe (12.08.2026, Axel-Vorschlag)

Zweiter Eingabeweg neben Freitext: Screenshot eines Trading-App-Bildschirms
(Referenzfall: DDOG Short Call, Delta 0.412, Position -1, Marktwert -$2,301).

- **Technisch:** Bild → strukturierte Extraktion (visuell, kein separates OCR-
  Preprocessing nötig) → dieselbe Zielstruktur wie der Freitext-Parser
  (`{ ticker, strategy, strike, dte, delta }`) → identische Downstream-Pipeline
  (Block C/D). Kein Parallelsystem, nur ein zweiter Eingang zum selben Trichter.
- **Konsequenz für Block D:** Reale App-Screenshots sind nicht auf CSP
  beschränkt — Bewertungsfunktion muss auch Covered-Call-/Short-Call-Positionen
  abdecken (s. Scope-Hinweis §3.2).
- **Nicht Teil davon (bewusst zurückgestellt, 12.08.2026):** Automatisches
  Live-Auslesen der CapTrader-Positionen per API/Flex-XML. Überschneidet sich
  mit dem bereits geplanten `OptionsDoktor` (Refundex, ROADMAP 2.12, Trigger
  01.10.2026). Entscheidung, ob Trade-Doktor das vorzieht oder beim
  01.10.-Termin bleibt, ist offen — **nicht heute entschieden.**
- **Datenschutz-Hinweis:** Screenshot kann kontonahe Daten zeigen (Marktwert,
  Kostenbasis, % Portfolio). Bleibt beim reinen Eigenbedarf-Prinzip aus §2 —
  keine Speicherung über die Analyse-Session hinaus vorgesehen, keine Weitergabe.

## 5. Bausteine (Sprint-Backlog)

| Block | Inhalt | Status |
|---|---|---|
| A | Architektur-Klärung (Erweiterungspunkt, Entkopplung von Scoring) | ✅ Geklärt 12.08.2026 |
| B | Freitext-Parser: Ticker/Strategie/Strike/DTE/Delta extrahieren, Rückfrage bei Unklarheit (§4.1) | Design fertig, Bau offen |
| C | Matching gegen Scan-Universum (`bySymbol`-Lookup), klare Fehlermeldung bei Nicht-Treffer | Offen |
| D | `evaluateOptionsTradeAgainstUIQRules()` — deterministische Bewertungsfunktion, Lookup gegen `Strategies[stratId].rules` (Schweregrad + Covered-Call-Fähigkeit, §3.2) | Offen — DTE-Zielwerte vorher vereinheitlichen, `rules`-Feld in `ko-strategies.js` anlegen |
| E | Neuer Prompt-Zweig in `ko-prompts.js` (EIC-Direktheit + Public-Erklärpflicht, kein BaFin-Hedging) | Offen |
| F | UI: eigenes Panel/Modal, kein Public-Output-Pfad | Offen |
| G | Screenshot-Eingabe (§4.2) — Bild → strukturierte Extraktion, gleiche Downstream-Pipeline wie Block B | Design fertig, Bau offen |
| — | CapTrader-Live-Auslesen (API/Flex-XML) | **Zurückgestellt** — überschneidet mit OptionsDoktor (Refundex, Trigger 01.10.2026), Entscheidung offen |

## 6. Abgrenzung zum bestehenden System

| Komponente | Rolle | Modul |
|---|---|---|
| Market State Engine (4 Regimes) | Liefert Regime-Kontext für die Bewertungsfunktion | UIQ (ko-market-state.js) |
| `getStrategyGates()` | Liefert Regime-Gate-Status je Strategie | UIQ (bestehend) |
| `Strategies[stratId].rules` | Geteiltes, maschinenlesbares Regelwerk (Delta-/DTE-Zielbereich, Management-Playbook) | `ko-strategies.js` (Erweiterung, §3.2) — von UIQ, Trade-Doktor und künftigen Strategiemodulen gemeinsam genutzt |
| `evaluateOptionsTradeAgainstUIQRules()` | Neue deterministische Bewertungsfunktion, reine Lookup-Funktion gegen `rules` (Block D) | Trade-Doktor (neu) |
| Neuer Prompt-Zweig (Block E) | KI-Erklärschicht | `ko-prompts.js` (Erweiterung) |
| UIQ Options Agent (§9, V2-Zielbild) | Voller Tool-orchestrierter Agent | Zukünftig — Trade-Doktor-Bewertungsfunktion wird dort wiederverwendet |

---

*v1.0 — 12.08.2026, ergänzt 13.08.2026 (Schweregrad, geteiltes `rules`-Feld,
IV-Rank-Klärung, Screenshot-Block). Konzeptdokument, kein Code.*
*Nächste Schritte: Block B (Parser-Design) im Detail ausarbeiten, dann Block D
(`rules`-Feld in `ko-strategies.js` anlegen, DTE-Zielwerte vereinheitlichen).*
