# UIQ — Client-MSE vs. Server-MSE (W3-Dokumentation)

**Version:** 1.0
**Stand:** 08.08.2026
**Ablage:** `ahsub/UIQ-Suite/docs/CLIENT-MSE-DOKU.md`
**Bezug:** SWOT W3 — Dual Regime Truth Problem
**Regel:** CODING-RULES §2.6 (Regime-Klassifikator-Singularität)

---

## 1. Das Problem (SWOT W3)

UIQ hat zwei Regime-Klassifikatoren mit identischen Label-Namen:

| | **Server-MSE** | **Client-MSE** |
|---|---|---|
| **Datei** | `market_aggregator.py` | `ko-market-state.js` |
| **Input** | VIX3M/VIX-Ratio + VIX-Wert | VVIX + SKEW |
| **Regime-Anzahl** | 4 + NEUTRAL-Fallback | 5 (inkl. NEUTRAL) |
| **Labels** | BULL_QUIET, BULL_FRAGILE, POST_PANIC_REVERSION, STRESS_UNSTABLE | dieselben + NEUTRAL |
| **Wo sichtbar** | Morning Briefing, Track Record, KV-Store | Browser-Dashboard (Echtzeit) |
| **Autorität** | ✅ Server = Single Source of Truth | ⚠️ Nur Anzeige-Ergänzung |

**Konsequenz:** Track-Record loggt Server-Regime. Der Nutzer sieht bei manueller
Auslösung das Client-Regime. An Divergenz-Tagen (VVIX/SKEW-Signal weicht von
VIX3M/VIX-Ratio ab) zeigen beide Systeme unterschiedliche Labels — ohne Erklärung.

---

## 2. Bewusste Designentscheidung (Stand 08.08.2026)

Die Anzeige wurde vereinheitlicht (v346/v347), die Logik bewusst **nicht**.

**Begründung:** Client-MSE (VVIX/SKEW) und Server-MSE (VIX3M/VIX-Ratio) messen
verschiedene Markt-Dimensionen:
- Server-MSE: strukturelle Stress-Einschätzung (Terminkurve, VIX-Niveau)
- Client-MSE: implizite Volatilitäts-Erwartung (VVIX) + Tail-Risk-Wahrnehmung (SKEW)

Beide Signale sind inhaltlich wertvoll und ergänzend — die Divergenz *selbst*
ist ein Informationsgehalt (vgl. SUITE.md Backlog №11: Score-Divergenz-Signal).

---

## 3. Erlaubte vs. verbotene Operationen (§2.6 CODING-RULES)

✅ **Erlaubt:**
- Client-MSE *zeigt* Server-Regime-Labels an (Darstellung)
- Client-MSE berechnet VVIX/SKEW-Signale als *ergänzende Indikatoren*
- Divergenz zwischen Client- und Server-Regime als eigenständiges Signal verwenden

❌ **Verboten:**
- Client-MSE *überschreibt* Server-Regime-Label
- Neue Regime-Logik im Frontend mit denselben Label-Namen
- Client-berechnetes Regime in Track-Record oder KV-Store schreiben

---

## 4. Validierungs-Roadmap

**Trigger 01.10.2026 (Track-Record-Review):**
Prüfen ob VVIX/SKEW-Divergenz-Tage systematisch andere Forward-Returns erzeugen
als Konsistenz-Tage → empirische Basis für Backlog №11 (Score-Divergenz-Signal).

**Trigger DCE-Refactoring (~Okt. 2026):**
Client-MSE-Signale als explizite Inputs in den DCE-RiskEstimator aufnehmen
(nicht als Regime-Klassifikator, sondern als Volatilitäts-Kontext-Vektor).

---

## 5. Referenzen

- SWOT-ANALYSE-2026-08-07.md §2 W3
- CODING-RULES.md §2.6 (Regime-Klassifikator-Singularität)
- SUITE.md Backlog №11 (Score-Divergenz-Signal)
- SUITE.md Backlog №43 (Leadership-Faktor, analog zurückgestellt)
- `ko-modules/ko-market-state.js` (Client-MSE Implementierung)
- `ko-aggregator/market_aggregator.py` → `_ratio_to_regime()` (Server-MSE)
