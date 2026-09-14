# UIQ — Backlog #64: CSP-ATMNA Specification v1.0

**Datum:** 14.09.2026
**Autoren:** Axel + Reviewer + Claude, ausgelöst durch ein konkretes EIC-Briefing
(ACAD/HON/VMC, 14.09.2026), das den Architekturfehler sichtbar machte.
**Status:** Spezifikation. Noch nicht implementiert — erst nach Freigabe coden,
wie vereinbart.

---

## 0. Verifizierter Ausgangszustand

- **`score_options_atmna()` existiert nicht.** `"options_atmna": top20("sCsp", 50)`
  (`market_aggregator.py`, Zeile ~5705) — ATM/NA ist aktuell ein reiner Alias
  auf den generischen CSP-Premium-Score, identisch zu `csp_wheel`/
  `weekly_income`/`collar`.
- Der in EIC-Briefings gezeigte "Strike (EMA200-1,5×ATR)" ist eine
  **Frontend**-Heuristik (`index.html`, mehrere Stellen), kein
  Backend-Score-Bestandteil — reiner Sicherheitsabstands-Vorschlag fürs
  Prompt-Building, nicht ATM/NA-spezifisch entworfen. Bereits korrekt gegen
  "Strike über Kurs" abgesichert (n/a-Anzeige).
- **Bereits vorhandene, wiederverwendbare Bausteine:**
  - `_earnings_gate(r, dte_window)` — Hard-Block ≤7T, weicher Malus 8–14T,
    konfigurierbares Fenster.
  - `_get_atmna_flag(regime)` liest einen bereits bestehenden, regimeweiten
    ATM/NA-Ampelwert aus `_MCM_REGIME_GATES` (grün/gelb/rot) — marktweit,
    nicht pro Ticker.
  - `REGIME_FIT`-Infrastruktur (UIQ Spec v1.2 §1.1) — Muster für
    regimeabhängige Multiplikatoren, aktuell neutral.

---

## 1. Strategieziel (verbindlich, Reviewer-Präzisierung)

**ATM/NA ist keine Variante von `csp_wheel`, sondern eine eigenständige
Assignment-Avoidance-Strategie.**

| | `csp_wheel` | `atmna` |
|---|---|---|
| Ziel | Hohe Prämie bei akzeptabler Assignment-Wahrscheinlichkeit | Prämie vereinnahmen, Assignment möglichst **vermeiden** |
| Leitfrage | "Ist die Prämie attraktiv?" | "Wie wahrscheinlich fällt der Kurs innerhalb der Laufzeit so weit, dass die Position gefährlich wird?" |
| Gewichtung | Premium-Metriken dominant | **Downside-Risiko dominant**, Premium nachrangig |

**Kernregel:** Premium Quality darf Downside Risk nicht überstimmen. Ein
hoher Score in "Premium Quality" kompensiert keinen harten Downside-Risk-Treffer.

---

## 2. Hard Gates (blockieren vollständig, Score = 0)

Alle Gates werden **vor** der eigentlichen Score-Berechnung geprüft, analog
zum bestehenden Muster in `score_options_csp()`.

1. **Earnings innerhalb DTE — hart, nicht nur 7-Tage-Fenster.**
   Wiederverwendung von `_earnings_gate()`, aber mit `dte_window` =
   tatsächliche DTE der geprüften Position (nicht der Default 14) und
   **hartem Block statt weichem Malus** über das gesamte Fenster — Ziel ist
   Assignment-Vermeidung, ein Earnings-Gap 20 Tage vor Verfall ist für
   ATM/NA genauso gefährlich wie einer in 5 Tagen.
2. **Falling-Knife-Gate** (Reviewer-Präzisierung, Claudes ATR-Konsistenz-
   Punkt übernommen — **ein** Multiplikator, nicht zwei):
   ```
   IF price < (ema200 - 1.5 * atr) AND rsi < 25:
       → ATM/NA BLOCK
   ```
   Derselbe Faktor (1,5×ATR) wie die bestehende Strike-Heuristik — bewusst
   keine zweite, abweichende Konstante im selben Feature.
3. **Regime STRESS_UNSTABLE** → Block. Nutzt den bereits vorhandenen
   `_get_atmna_flag()`/`_MCM_REGIME_GATES`-Mechanismus — kein neuer
   Regime-Datenpfad.
4. **Fehlende Mindestdaten** (kein `ema200`, kein `atr`, oder `atr == 0`) →
   Score 0, analog zum bestehenden Gate-Stil in `score_options_csp()`.

**Explizit NICHT als Hard Gate (Datenlücke, bewusst offen):** klinische/
regulatorische Katalysator-Events (z.B. Trial-Readouts). UIQ hat dafür
keine Datenquelle — anders als Earnings, die bereits als Feld vorliegen.
Wird nicht mit einer Näherung/KI-Schätzung ersetzt (Scheingenauigkeits-
Vermeidung, gleiches Prinzip wie bei Contract Assignment Quality, UIQ Spec
v1.2 §2.2).

---

## 3. Score-Struktur (nach den Hard Gates)

```
ATMNA-Score (0-100)
│
├── Downside Risk (dominant, höchstes Gewicht)
│   ├── Trend vs. EMA200 (Distanz, Richtung)
│   ├── RSI (Kontext, nicht isoliert — s. §4 Signal-Duplikation)
│   └── ATR/Volatilität (Kontext, nicht isoliert)
│
├── Premium Quality (nachrangig zu Downside Risk)
│   └── HVP/IVP relativ zum bereits bewerteten Downside-Risiko
│
├── Market Context
│   └── Regime-Fit (REGIME_FIT-Infrastruktur, neuer Key "atmna",
│       analog zu "csp_underlying" aus UIQ Spec v1.2 §2.1)
│
└── Assignment Avoidance
    └── Strike-/Sicherheitsabstand (EMA200-1,5×ATR, serverseitig neu
        berechnet statt nur im Frontend — Numeric-Integrity-Prinzip,
        bereits als Vorbild in index.html dokumentiert)
```

## 4. Signal-Duplikations-Regel (Reviewer-Kernbefund, verbindlich)

RSI-Tiefstand, EMA200-Abstand und erhöhte HVP können **dasselbe
zugrundeliegende Ereignis** beschreiben (starker Kursrückgang), nicht drei
unabhängige positive Signale. Die Score-Funktion darf diese drei Felder
NICHT additiv/unabhängig gewichten (anders als `score_options_csp()`, wo
das für dessen andere Zielsetzung angemessen ist). Konkrete
Verrechnungslogik (z.B. gemeinsamer "Downside-Momentum"-Teilscore statt
dreier separater Boni) ist Umsetzungsdetail, aber das Prinzip ist
verbindlicher Teil dieser Spec — genau die Art von Signal-Redundanz, für
die später die geplante BN-Struktur eine sauberere Lösung liefern soll;
bis dahin manuell vermeiden, nicht ignorieren.

---

## 5. Output-Format

Analog zur bereits etablierten Mehrfach-Score-Darstellung (UIQ Spec v1.2
§2.3):

```
ATM/NA Score:        62/100
  Downside Risk:      Erhöht (Trend + RSI zeigen dasselbe Signal, s. §4)
  Premium Quality:    Hoch (HVP 98%ile) — NICHT ausschlaggebend
  Gates:              Falling-Knife-Gate: NICHT ausgelöst
                       Earnings-Gate: NICHT ausgelöst
```

Kein einzelner Gesamtscore ohne die Gate-/Downside-Transparenz — genau das
Problem, das das heutige EIC-Briefing zeigte (hohe IVP allein wirkte wie
ein starkes Signal).

---

## 6. Nicht Teil dieser Version

- Klinische/regulatorische Event-Erkennung (s. §2, Datenlücke).
- Echte Optionsketten-Daten (Delta/Bid-Ask) — wie bei Contract Assignment
  Quality (UIQ Spec v1.2 §2.2), wartet auf CapTrader-Architekturentscheidung.
- Rückwirkende Neuberechnung historischer ATM/NA-Empfehlungen — sinnvoller
  erster Test nach Implementierung (s. §7), aber kein Spec-Bestandteil.

---

## 7. Nach Implementierung: Validierungsschritt (Reviewer-Vorschlag)

Die drei heutigen Kandidaten (ACAD/HON/VMC) mit der neuen Logik
rückwirkend durchrechnen und prüfen, ob die Rangfolge plausibler wird als
der heutige `sCsp`-Alias — konkreter, bereits vorliegender Testfall statt
synthetischer Daten.
