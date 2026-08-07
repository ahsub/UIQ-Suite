# ÜBERGABE 2026-08-07 — UIQ Suite + Refundex (Langer Tag)

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 07.08.2026 Abend)

| Komponente | Stand | Commit |
|---|---|---|
| **Aggregator** | **v5.35.0** | `c618f42` |
| **Frontend (axel-scanner)** | **v454** | `fa9aad6` |
| **SUITE.md** | **v4.3** | rebased |
| **ML_KONZEPT.md** | **v1.2** | `a7e37dd` |
| **SWOT** | **v1.0** | `bba459b` |
| **Refundex kap.html** | Profil+KiSt+ETF+Journal | `ccf79f3` |
| **Refundex ROADMAP** | **v1.7** | `0d0d1fc` |
| **ko-flex-proxy** | live | `d42c050` |

---

## Was heute passiert ist — Vollständige Liste

### UIQ — Aggregator (v5.29 → v5.35)

| Version | Was |
|---|---|
| v5.29.0 | Regime-History-Flag `calc_regime_history_flag()` |
| v5.30.0 | `regimeContext` in tr:snap |
| v5.31.0 | SWOT №32/33/35: 25 Tests, Ratio-Konvention, yfinance gepinnt |
| v5.32.0 | W3 Regime-Transparenz: `regimeMeta` |
| v5.33.0 | T3 Survivorship-Fix: `update_iwv.py` + `ex_iwv_tickers.csv` |
| v5.34.0 | DIX Stufe 2: FINRA Reg SHO CSV-Download |
| v5.35.0 | Earnings-Gate in allen 4 Options-Scorern |

### UIQ — Frontend
- v454: W5 IP-Schutz — `compositeScore` aus KV, JS-Gewichte unsichtbar

### UIQ — Dokumentation
- SUITE.md v3.6→v4.3: Backlog №29–38
- ML_KONZEPT.md v1.2: §3b Staffel-Sequenz
- SWOT v1.0 (Claude Mythos Preview)
- VALIDIERUNG_META_SIGNAL.md v1.0
- Backtest 2007–2026: Sharpe 1.66 vs. 0.63 → Go-Kriterium 2 ✅

### Refundex — ROADMAP vollständig

| ROADMAP | Was |
|---|---|
| 2.8 | `parseActivityXML()` ✅ |
| 2.9 | `ko-journal.js` + Detail-View ✅ |
| 2.10 | `flex_client.py` + Bugfix _is_flex_data ✅ |
| 2.11 | `ko-flex-proxy` Worker live ✅ |
| 2.12 | OptionsCoach + OptionsDoktor (Konzept, Trigger 01.10.) |

### Refundex — kap.html
- `⚙ Kontoprofil`-Modal: Broker, Konto-ID
- Inhaber 1+2: Name, Kirchensteuer (0/8/9%), Bundesland (auto-füllt KiSt), Steuer-ID
- Kirchensteuer-Berechnung: Schachtelformel, `calcKirchensteuer()`, `getKiStSummary()`
- ETF-Positionen: dynamisch, Vorabpauschale Live-Berechnung (§18 InvStG)
- Basiszins 2019–2026 in JS integriert, KAP-INV-Zeile je Fondstyp
- `tests/test_flex_2025.xml` + `tests/README.md` mit Erwartungswerten

### Diverses
- `ibkr-tax-tool` archiviert ✅
- CP Gateway erklärt, IBKR CP API Bewertungsmatrix
- FINRA DIX CSV-Implementierung (kein OAuth2)
- FlashAlpha für GEX als nächste Stufe identifiziert
- OptionsCoach + OptionsDoktor + Counterfactual Engine konzipiert (№37+38)

---

## Offene To-dos

| Was | Wer | Wann |
|---|---|---|
| Rechtsgutachten WpHG/WpIG | Axel | diese Woche |
| Beta-Aktivität messen (10 Tokens) | Axel | diese Woche |
| KiSt in Ergebnisanzeige integrieren (`getKiStSummary()`) | nächste Session | |
| ROADMAP 2.8–2.11 als ✅ markieren | nächste Session | |
| Refundex 1.3 Feedback-Kanal | nächste Session | |
| W3 Client-MSE Dokumentation | nächste Session | |
| `update_iwv.py` erstmals nutzen | Axel am 27.08. | |

---

## ⏳ Zeitgesteuert

| Wann | Was |
|---|---|
| 11.08. (Mo) | GHA Run: ivRank aktiv (30 Handelstage erreicht) |
| ~27.08. | IWV Holdings CSV → `python engine/update_iwv.py` |
| ~01.09. | Track Record h30 / BN-Analyse / DCE Brier Score |
| ~01.10. | MCM-HMM + val_layer.py + Validierung Ebene 1 |
| ~01.10. | OptionsDoktor Start (Trigger) |
| ~Q1 2027 | Counterfactual Engine |

---

## Neue Backlog-Punkte heute (№29–38)

29. MSE Regime-History-Flag ✅ implementiert
30. Makro-Regime-Trendanalyse + Meta-Signal-Architektur
31. IBKR CP API (Hybrid-Strategie, Stufen Q4/2026–Q2/2027)
32. Testgürtel Regime-Pfad ✅ implementiert
33. Ratio-Konvention ✅ implementiert
34. Backtest 2007–2026 ✅ ausgeführt, Go-Kriterium 2 erfüllt
35. yfinance gepinnt ✅ implementiert
36. Rechtsgutachten → Axel
37. OptionsCoach + OptionsDoktor (Trigger 01.10.)
38. Counterfactual Performance Engine (Trigger Q1/2027)

---

*UIQ Suite + Refundex Übergabe 07.08.2026 — Sehr langer, sehr produktiver Tag*
*Aggregator v5.35.0 · Frontend v454 · SUITE.md v4.3 · Refundex ROADMAP v1.7*
*Heute: Regime-History-Flag · SWOT · Go-Kriterium 2 · Survivorship-Fix · DIX Stufe 2*
*Earnings-Gate · IP-Schutz · Flex-Infrastruktur · Journal · Kirchensteuer · ETF*
*OptionsCoach + OptionsDoktor + Counterfactual Engine konzipiert*
*Fable hat Schwächen aufgedeckt — 6 davon heute behoben. Nicht übermütig werden!*
