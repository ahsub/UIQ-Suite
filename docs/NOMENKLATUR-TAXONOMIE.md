# UIQ Strategie-Nomenklatur — Kanonische Taxonomie
**Version 1.0 — 16.07.2026**
**Status: Referenzdokument — alle neuen Implementierungen richten sich nach dieser Tabelle**

---

## Grundregel

Der **kanonische Name** (Spalte 3) ist die verbindliche Bezeichnung für alle
nutzersichtbaren Stellen. Abkürzungen (Spalte 4) sind nur dort zulässig, wo
Platzmangel herrscht (Tab-Buttons, Chips). Interne IDs (Spalte 2) sind
Code-only und niemals nutzersichtbar.

---

## Strategie-Tabelle

| # | Interne ID | Kanonischer Name | Kurzform | Leaderboard-Key | Metriken definiert? |
|---|---|---|---|---|---|
| 1 | `ko` | ⚡ KO-Zertifikat | KO-Long | `ko_long` | ✅ ja |
| 2 | `momentum` | 📈 Minervini/Momentum | Momentum | `long_minervini` | ✅ ja |
| 3 | `breakout` | 🚀 Breakout | Breakout | `long_swing` (*)  | ❌ keine Metrik |
| 4 | `swing` | 🔄 Swing-Trading | Swing | `long_swing` | ✅ ja |
| 5 | `meanrev` | ↩️ Mean Reversion | Mean Rev. | `long_mr` | ✅ ja |
| 6 | `dividend` | 💰 Dividend Growth | Dividende | — | ❌ keine Metrik |
| 7 | `value` | 🔍 Value | Value | — (Value Desk) | ⚠️ Proxy |
| 8 | `csp_wheel` | 🎯 CSP/Wheel | CSP/Wheel | `options_csp` | ✅ ja |
| 9 | `atmna` | ⚙️ CSP (ATM/NA) | ATM/NA | — | ✅ ja |
| 10 | `weekly_income` | 📅 CSP (Weekly) | Weekly | — | ✅ ja |
| 11 | `cc` | 📝 Covered Call | Cov. Call | `options_cc` | ✅ ja |
| 12 | `fading_short` | ⚠️ Fading Short (KO) | KO-Short | `short_fading_ko` | ⚠️ teilweise |
| 13 | — | 📉 Breakdown | Breakdown | `short_breakdown` | ❌ keine Metrik |
| 14 | — | 📐 VCP | VCP | `vcp_setups` | ⚠️ teilweise |

(*) Breakout nutzt aktuell denselben Leaderboard-Key wie Swing — eigener Key fehlt.

---

## Bekannte Inkonsistenzen (zu beheben)

| Stelle | Aktueller Name | Soll (kanonisch) | Priorität |
|---|---|---|---|
| Scanner KI-Dropdown | „KO-Trading" | „KO-Zertifikat" | Mittel |
| Scanner KI-Dropdown | „Options-Wheel" | „CSP/Wheel" | Mittel |
| Scanner KI-Dropdown | „Dividend Growth" | „Dividend Growth" ✓ | — |
| ko-strategies.js label | „⚡ KO-Trading" | „⚡ KO-Zertifikat" | Mittel |
| STRATEGY_LABELS (ko-market-state) | „⚡ KO-Zertifikat" | ✓ korrekt | — |
| AlphaDesk Tab | „🚀 Minervini" | ✓ korrekt (Kurzform OK) | — |
| DeepDive Button | „⚡ KO" | ✓ Kurzform OK | — |
| Strategie-Ampel Chip | nutzt STRATEGY_LABELS | ✓ Single Source | — |

---

## Strategie-Status (Metriken / Leaderboard-Reife)

| Strategie | Leaderboard | KI-Prompt | Scoring-Metrik | Einsatzbereit |
|---|---|---|---|---|
| KO-Zertifikat | ✅ | ✅ | ✅ | ✅ vollständig |
| Minervini/Momentum | ✅ | ✅ | ✅ | ✅ vollständig |
| Swing-Trading | ✅ | ✅ | ✅ | ✅ vollständig |
| Mean Reversion | ✅ | ✅ | ✅ | ✅ vollständig |
| CSP/Wheel | ✅ | ✅ | ✅ | ✅ vollständig |
| CSP (ATM/NA) | — | ✅ | ✅ | ✅ (kein Leaderboard) |
| CSP (Weekly) | — | ✅ | ✅ | ✅ (kein Leaderboard) |
| Covered Call | ✅ | ✅ | ✅ | ✅ vollständig |
| Fading Short (KO) | ✅ | ✅ | ⚠️ | ⚠️ Leaderboard läuft, Metriken unvollständig |
| VCP | ✅ | — | ⚠️ | ⚠️ Leaderboard läuft, kein eigener Prompt |
| Breakout | ✅ | — | ❌ | ❌ Leaderboard zeigt Daten, aber keine Metrik |
| Dividend Growth | — | ✅ | ❌ | ❌ KI-Prompt vorhanden, kein Leaderboard |
| Value | Value Desk | ✅ | ⚠️ Proxy | ⚠️ eigener Modus, Proxy-Metriken |
| Breakdown | ✅ | — | ❌ | ❌ Leaderboard läuft, keine Metrik |

---

## Konsequenzen für offene Punkte

- **U5/U7**: Leaderboard-Tabs für Breakdown, Fading (teilw.), VCP sollten
  einen Hinweis „Metriken in Entwicklung" zeigen statt leere KI-Analyse
  anzubieten — oder den KI-Button deaktivieren wenn kein Prompt verfügbar.
- **Scanner KI-Dropdown**: „KO-Trading" → „KO-Zertifikat" und
  „Options-Wheel" → „CSP/Wheel" in Batch 4 angleichen.
- **ko-strategies.js**: label `ko` von „KO-Trading" auf „KO-Zertifikat"
  ändern (Commit in ko-modules, danach CDN-Hash aktualisieren).

