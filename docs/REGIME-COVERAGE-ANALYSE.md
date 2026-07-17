# Regime-Coverage-Analyse — Strategie-Fundus kritische Prüfung
**Version 1.0 — 17.07.2026**
**Auftrag:** Kritische Prüfung des UIQ-Strategie-Portfolios nach dem Grundsatz:
*"Eine Strategie ist nur wertvoll wenn sie evidenzbasiert erfolgversprechend
in einem für sie handelbaren Marktregime einsetzbar ist. Sonst ist sie verzichtbar."*

---

## 1. Die 5 MSE-Regime (aus ko-market-state.js, Ground Truth)

| Regime | Bedingung | Charakter |
|---|---|---|
| **BULL_QUIET** | Contango, GEX>0, DIX≥-0.5 | Stabil, Vol komprimiert, Trendfolge |
| **BULL_FRAGILE** | Contango, hoher Skew, VVIX steigend | Bull mit Air-Pocket-Risiko |
| **STRESS_UNSTABLE** | Backwardation oder VVIX-Stress+Short-Gamma | Krise, Gamma-Flip, fallende Kurse |
| **POST_PANIC_REVERSION** | Flat Term, DIX-Akkumulation, VVIX fallend | Erholung nach Panik, Vol-Crush |
| **NEUTRAL** | Keine klare Bedingung erfüllt | Gemischte Signale, Fallback |

---

## 2. Coverage-Matrix: Strategie × Regime

🟢 = Priorität 1/2, aktiv empfohlen | 🟡 = möglich/selektiv | 🔴 = gesperrt/nicht empfohlen

| Strategie | BULL_QUIET | BULL_FRAGILE | STRESS_UNSTABLE | POST_PANIC | NEUTRAL |
|---|---|---|---|---|---|
| Momentum/Minervini | 🟢 P1 | 🟡 | 🔴 | 🔴 | 🟡 |
| Breakout | 🟢 P1 | 🔴 | 🔴 | 🔴 | 🔴 |
| Swing-Trading | 🟢 P1 | 🟡 | 🔴 | 🔴 | 🟡 |
| KO-Zertifikat (Long) | 🟢 P2 | 🔴 | 🔴 | 🔴 | 🔴 |
| CSP/Wheel | 🟢 P2 | 🟡 | 🟡 | 🟢 P1 | 🟡 |
| CSP (ATM/NA) | 🟢 P2 | 🟡 | 🔴 | 🟢 P1 | 🟡 |
| CSP (Weekly) | 🟢 P2 | 🟡 | 🔴 | 🟢 P2 | 🟡 |
| Covered Call | 🟢 P2 | 🟡 | 🟡 | 🟢 P2 | 🟡 |
| Value | 🟡 | 🟡 | 🟡 | 🟢 P2 | 🟡 |
| Dividend Growth | 🟡 | 🟢 | 🟡 | 🟡 | 🟡 |
| Mean Reversion | 🔴 | 🔴 | 🟡 | 🟢 P1 | 🔴/🟡 |
| Fading Short (KO) | 🔴 | 🔴 | 🟢 P1 | 🔴 | 🔴 |
| **VCP** (neu) | — nicht in MSE — | — | — | — | — |

---

## 3. Kritische Befunde

### 3.1 Value & Dividend Growth — Axels Einwand bestätigt sich vollständig
Beide Strategien sind in JEDEM Regime nur 🟡 (möglich/selektiv) — sie haben
**in keinem einzigen Regime eine Priorität-1-Rolle**. Das ist der objektive
Beweis für Axels These: Sie sind keine *Timing*-Strategien, sondern
*Buy-and-Hold*-Philosophien, die in jedem Marktumfeld "irgendwie gehen" aber
nirgendwo eine klare Edge haben. Das Regime-System selbst signalisiert:
diese Strategien gehören konzeptuell nicht in ein Timing-Tool.

**Empfehlung: Aus UIQ entfernen, Migration zu DepotIQ.**
DepotIQ ist der richtige Ort für "ist dieser Titel fundamental gut" —
unabhängig vom aktuellen Marktregime. UIQ beantwortet "ist JETZT der
richtige Zeitpunkt" — das ist eine andere Frage.

### 3.2 Fading Short (KO) — einzige Strategie mit echter Regime-Exklusivität
Fading Short ist die EINZIGE Strategie die nur in EINEM Regime (STRESS_UNSTABLE)
eine Priorität-1-Rolle hat und sonst überall gesperrt ist. Das ist strukturell
gesund — eine Strategie mit klarem Anwendungsfenster. ABER: Bewertungsmetriken
sind laut vorherigem Audit "unvollständig" (siehe NOMENKLATUR-TAXONOMIE.md).

**Prüffrage:** Gibt es eine plausible Edge-These für Fading Short, oder ist
es reine Spekulation ohne Backtest? Muss geklärt werden bevor wir die
Metriken vervollständigen — sonst bauen wir Infrastruktur für eine Strategie
die wir nicht verantworten können.

### 3.3 VCP — Regime-Blindfleck (neu entdeckt bei dieser Analyse)
VCP wurde in ko-strategies.js/ko-prompts.js/index.html aktiviert (v369/v370),
ist aber **komplett unbekannt in ko-market-state.js getStrategyGates()**.
Das bedeutet: Die Strategie-Ampel im Übersicht/Scanner zeigt für VCP GAR
NICHTS an — sie fehlt in allen 5 Regime-Objekten.

**Konsequenz:** VCP braucht einen Nacharbeit-Schritt: Regime-Zuordnung in
getStrategyGates() ergänzen (voraussichtlich BULL_QUIET P1, da VCP per
Definition ein Stage-2-Aufwärtstrend-Setup ist — ähnlich Momentum/Breakout).

### 3.4 Echte Regime-Lücken — die eigentliche Frage
Prüfung: gibt es ein Regime OHNE eine einzige Priorität-1-Strategie?

- BULL_QUIET: ✅ 3 P1-Strategien (Momentum, Breakout, Swing)
- BULL_FRAGILE: ⚠️ KEINE P1-Strategie — nur 🟡/🟢(Dividend). Das ist eine
  echte Lücke: das "Vorsicht geboten"-Regime hat keine dedizierte
  Vorsichts-Strategie mit hoher Priorität.
- STRESS_UNSTABLE: ✅ 1 P1 (Fading Short) — aber Metriken unvollständig
- POST_PANIC_REVERSION: ✅ 2 P1 (Mean Reversion, CSP/Wheel, ATM/NA)
- NEUTRAL: ⚠️ KEINE P1-Strategie — das ist by design (Fallback-Regime,
  "Selektiv vorgehen" ist die korrekte Haltung, keine Lücke)

**Echte Lücke identifiziert: BULL_FRAGILE.**
Das Regime "Bull mit Air-Pocket-Risiko" hat aktuell keine Strategie die
GENAU für dieses Fenster gebaut ist — nur abgeschwächte Varianten von
Bull-Quiet-Strategien (Momentum/Swing "möglich, aber vorsichtiger"). Eine
evidenzbasierte Strategie für "Trend intakt aber fragil" wäre z.B. eine
**Protective-Put-Overlay-Strategie** oder **Collar-Strategie** — im
Aktien-Depot bereits long, zusätzlicher Schutz gegen Air-Pocket-Korrektur.
Das wäre eine echte, evidenzbasierte Lücke — nicht Feature-Vollständigkeit,
sondern eine Marktsituation die wir aktuell nicht abdecken.

---

## 4. Handlungsempfehlungen (Priorität)

1. **Value + Dividend Growth aus UIQ entfernen** → Migration zu DepotIQ-Konzept
   (SUITE.md-Entscheidung nötig, DepotIQ ist aktuell "frozen bis Phase 3" —
   das ändert nichts an der Entfernung aus UIQ, nur an der Wiederverwendung)
2. **Fading Short — Edge-These klären** bevor Metriken vervollständigt werden
3. **VCP — Regime-Zuordnung nachtragen** in getStrategyGates() (technische Lücke,
   kein konzeptueller Fehler)
4. **BULL_FRAGILE — echte Lücke** — evaluieren ob Collar/Protective-Put als
   neue Strategie sinnvoll UND baubar ist (Datenverfügbarkeit prüfen)

---

## 5. Prinzip für zukünftige Strategie-Entscheidungen

> Eine neue Strategie wird nur aufgenommen wenn:
> (a) sie ein Marktregime abdeckt das aktuell keine oder nur unzureichende
>     Priorität-1-Abdeckung hat, UND
> (b) eine plausible, wenn möglich publizierte Evidenzbasis existiert, UND
> (c) die notwendigen Datenfelder für sinnvolles Scoring bereits verfügbar
>     sind oder mit vertretbarem Aufwand ergänzt werden können.
>
> Nicht ausreichend: "Konkurrenz-Tools haben das auch" oder
> "Vervollständigt die Liste".
