# Datenquellen – Regime-Detection-Research

Stand: 29.09.2026 (Rev. 2: PCR-Anschluss ab 10/2019, Europa/Japan-Kandidaten; Rev. 1: 27.09.2026) · Zweck: Backtests der Marketstate-/Regime-Analysen (Research in `ahsub/regime-test`) · Roadmap: `REGIME-BACKTEST-ROADMAP-2026-09-27.md`

## 1. Cboe – offizielle Index-Historien (frei, Primärquelle) ✅

URL-Schema:

```
https://cdn.cboe.com/api/global/us_indices/daily_prices/<SYMBOL>_History.csv
```

Leitet per HTTP 302 auf `https://cdn-api.cboe.com/api/global/us_indices/daily_prices/<SYMBOL>_History.csv` weiter
(Redirects im Loader folgen lassen). Format: `DATE,OPEN,HIGH,LOW,CLOSE`, Datum `MM/DD/YYYY`.

| Symbol | Inhalt | Historie ab | Verwendung |
|---|---|---|---|
| VIX | 30-Tage-Implied-Vol SPX | 1990 | Basis |
| VIX9D | 9-Tage | 2011 | kurzes Ende Term-Structure |
| VIX3M | 3 Monate | 2007 | Produktionslogik (Punkt 34) |
| VIX6M | 6 Monate | **02.01.2008** | VIX6M/VIX-Ratio-Test |
| VIX1Y | 1 Jahr | **03.01.2007** | VIX1Y/VIX-Ratio-Test inkl. 2008 |
| VVIX | Vol der Vol | – | Abgleich mit bestehender Quelle |
| SKEW | Tail-Risk | – | Abgleich mit bestehender Quelle |
| COR1M / COR3M / COR6M / COR1Y | Implied Correlation | – | Kandidat exogene 2. Achse |

Weitere Symbole im selben Schema (bei Bedarf): RVX, VXD, OVX, GVZ, EUVIX, JYVIX, VXAPL, VXAZN, VXEEM, VXEFA, VXFXI, DSPX, TNX, FVX, TYX, IRX, BXM u. a.
**Achtung:** Symbol `PUT` = Cboe S&P 500 PutWrite Index (Strategie-Kursindex, Werte 153 → 3.618), **keine** Put/Call-Ratio. In `ahsub/regime-test` wird `PUT_History.csv` als Feature `put_ma_20/put_ratio/put_signal` geladen → klären, ob dort eine PCR gemeint war (Stand 27.09.2026 offen).

Beispiel-URLs:
- https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX1Y_History.csv
- https://cdn.cboe.com/api/global/us_indices/daily_prices/VIX6M_History.csv
- https://cdn.cboe.com/api/global/us_indices/daily_prices/COR1M_History.csv

Verifiziert (27.09.2026): VIX1Y 27.10.2008 = 45,48; VIX6M 27.10.2008 = 52,29.

Phase-0-Prüfung (27.09.2026, Snapshot `regime-test/data/raw/cboe/2026-09-27/` inkl. `SHA256SUMS.txt`):

| Reihe | Zeitraum | Tage | Befund |
|---|---|---|---|
| VIX1Y | 03.01.2007 – 25.09.2026 | 4.958 | lückenlos, keine NaN/Duplikate/Wochenenden; max. 53,53 (20.11.2008) |
| VIX6M | 02.01.2008 – 25.09.2026 | 4.713 | lückenlos; max. 61,47 (20.11.2008); 05.08.2024 = 30,28 identisch mit Bloomberg-Dump |
| COR1M | 03.01.2006 – 25.09.2026 | 5.215 | lückenlos; 27.10.2008 = 90,88, 16.03.2020 = 86,71 |

Längste Lücke je 5 Kalendertage (Feiertage bzw. Börsenschließung Hurrikan Sandy 10/2012) – plausibel.

Hinweise:
- Reihen laufen aktuell durch (Stand 25.09.2026).
- Frühe Werte nur Schlusskurse (O = H = L = C).
- Frühe Jahre vermutlich rückwirkend nach aktueller Methodik berechnet – kein Kurs-Look-ahead, aber im Ergebnisbericht vermerken.

Fundstelle des Katalogs: github.com/Maggyee/Nishiki-Trader → `docs/progress/*data-sources*.json` (Repo selbst enthält keine Daten).

## 2. Cboe – Put/Call-Ratio (frei) ✅ 2006 – heute (CSV + Daily-Anschluss)

Basis-URL:

```
https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/<DATEI>
```

| Datei | Inhalt | Zeitraum (geprüft 27.09.2026) | Spalten |
|---|---|---|---|
| `totalpc.csv` | Total PCR (alle Cboe-Optionen) | 01.11.2006 – **04.10.2019** | DATE, CALLS, PUTS, TOTAL, P/C Ratio |
| `equitypc.csv` | Equity PCR | 01.11.2006 – **04.10.2019** | DATE, CALL, PUT, TOTAL, P/C Ratio |
| `indexpc.csv` | Index PCR | 01.11.2006 – **04.10.2019** | DATE, CALL, PUT, TOTAL, P/C Ratio |
| `totalpcarchive.csv` | Total PCR, Archiv | ab 17.10.2003 (nicht heruntergeladen) | Trade_date, Call, Put, Total, P/C Ratio |

Direkt-URLs:
- https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/totalpc.csv
- https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/equitypc.csv
- https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/indexpc.csv
- https://cdn.cboe.com/resources/options/volume_and_call_put_ratios/totalpcarchive.csv

Hinweise:
- **CSV-Reihen enden am 04.10.2019 (eingefroren)** → Anschluss über Cboe Daily Market Statistics, s. 2a.
- **Mehrzeiliger Disclaimer-Kopf** vor der Spaltenzeile; Werte mit führenden Leerzeichen (`skipinitialspace`).
- **Zwei Strukturbrüche laut Datei-Kopf:** (1) bis 31.05.2012 cleared volume (OCC), danach preliminary volume; (2) ab 11.06.2012 Equity/Index ohne exchange-traded products. Niveau-Effekt Equity PCR gering (Mittel 0,66 vor / 0,64 nach), trotzdem keine naiven Z-Scores über die Grenze.
- **Nur Cboe-Volumen**, nicht Gesamtmarkt → relative Signale (Perzentil, Abweichung vom MA) statt fester Schwellen.
- **Definition an UIQ-Produktion angleichen** (Equity / Total / Index?).

Fundstelle: github.com/chrmatique/vol-analysis → `src/data/cboe.rs` (Repo-Cache enthält keine PCR-Daten).

### 2a. Anschluss ab 07.10.2019: Cboe Daily Market Statistics ✅

```
https://www.cboe.com/us/options/market_statistics/daily/?dt=YYYY-MM-DD
```

- Eine Seite je Handelstag; Tabellen Sum of All Products, Index, Exchange Traded Products, Equity, VIX, SPX+SPXW (je Calls/Puts/Total) plus Ratios.
- **Gleiche Abgrenzung wie CSV ab 11.06.2012** (Equity ohne ETPs, nur Cboe-Börse); Summe = Index + ETP + Equity exakt.
- **Erster Datentag 07.10.2019** = Handelstag direkt nach CSV-Ende → lückenlos, aber **keine Überlappung** (04.10.2019: „No data“). Nahtstelle nur statistisch prüfbar.
- Kein stiller Rückfall: Tage ohne Daten liefern „No data available for the selected date.“
- Loader: `ahsub/regime-test` → `scripts/fetch_cboe_pcr_daily.py` (Branch `pcr-daily-loader`), Parser `src/datalayer/cboe_daily.py`, Snapshot `data/raw/cboe/<datum>_pcr_daily/` mit SHA-256 jeder Rohseite.
- **Erstlauf 28./29.09.2026:** 1.752 Datentage 07.10.2019 – 25.09.2026, 0 Lücken, 0 Parserfehler; alle Summen-/Ratio-Prüfungen bestanden.
- Im Panel: `pcr_total_full`, `pcr_equity_full`, `pcr_index_full` (CSV bis 04.10.2019, danach Daily); Daily-Spalten zusätzlich getrennt, inkl. ETP/VIX/SPX.

### 2b. Verworfen: github.com/TheSnoozer/putcallratio

Scraper auf die Seite „Cboe Exchange Market Statistics“, Daten ab 06.05.2022 (Branch `data`). **Intraday-Stände bis 15:15 CT statt finaler Tageswerte und andere Equity-Abgrenzung** (01.04.2024: Equity 0,77 vs. Cboe final 0,65; Total-Calls 2,28 Mio. vs. 3,37 Mio.) → nicht mit den CSV-Reihen mischbar; nur für Intraday-Verläufe interessant. Keine Lizenz.

## 3. Makro-Achse (frei) ✅

- **FRED / ALFRED** (St. Louis Fed): Zinskurve (10Y-2Y), Initial Claims, Breakevens u. a.
  Für Backtests **ALFRED-Vintage-Daten** verwenden (Stand am jeweiligen Tag), sonst Look-ahead durch Revisionen.
- **OFR Financial Stress Index** (Office of Financial Research): Makro-Stress-Referenz.

## 4. Bloomberg-Dump – nur interne Research ⚠️

Repo: github.com/joeyedi1/Systematic-VIX-Bull-Call-Spread → `outputs/cache/`

| Datei | Zeitraum | Inhalt |
|---|---|---|
| `vix_strategy_data.parquet` | 03.01.2022 – 18.03.2026 | VIX, VIX9D, VIX3M, VIX6M, VVIX, SKEW, **UX1–UX9** inkl. Volumen/OI, SPX, NQ |
| `vix_extended_history_2010_2021.parquet` | 2010 – 2021 | VIX, VIX9D (ab 2011), VIX3M, VVIX, UX1–UX3, SPX |
| `cot_vix_data.parquet` | 2022 – 03/2026 | CFTC-COT VIX-Futures (AM / LF / Dealer) |
| `vix_option_chains/*.parquet` | 2023 – 2026 | monatliche VIX-Call-Chains, Strikes 10–35, Bid/Ask/Mid |

Verifiziert gegen Stresstage (VIX 05.02.2018 = 37,32; 16.03.2020 = 82,69; 05.08.2024 = 38,57).

Einschränkungen:
- Feiertage forward-gefüllt → per Börsenkalender entfernen.
- UX1–UX9 = generische Rollkontrakte (Sprünge am Rolltag) → für Level/Slope ok, nicht für Renditen.
- **Keine Lizenz, Bloomberg-Terms** → nur private Research, **nicht in UIQ, Produkt oder veröffentlichte Ergebnisse**.

## 5. Geprüft, aber keine Daten / verworfen ❌

| Repo | Befund |
|---|---|
| github.com/moshesham/Economic-Dashboard | `sample_*.csv` synthetische Random Walks (`np.random.seed(123)`), Rest dünne yfinance/FRED-Snapshots bis 11/2025, Pickle-Caches (nicht laden) |
| github.com/ArturSepp/QuantInvestStrats (`qis`) | keine Daten; MIT-Bibliothek für Performance-/Regime-Auswertung → **Kandidat als Auswertungswerkzeug** |
| github.com/tradermonty/claude-trading-skills | keine Historie; PCR nur Tageswert per Websuche, feste unkalibrierte Schwellen |
| github.com/chrmatique/vol-analysis | keine PCR-Daten im Cache, aber Quelle der PCR-URLs (s. Abschnitt 2) |

## 6. Offene Lücken

- [x] Enddaten geprüft (27.09.2026): VIX1Y/VIX6M/COR1M bis 25.09.2026; totalpc/equitypc/indexpc nur bis 04.10.2019
- [x] **PCR ab 10/2019: Anschlussquelle** – Cboe Daily Market Statistics (Abschnitt 2a), Erstlauf 29.09.2026 ohne Lücken
- [ ] `regime-test`: Feature `PUT` (PutWrite-Index) vs. gemeinte PCR klären
- [ ] **Intraday mit Stressphase** – IBKR/TWS oder Bezahlanbieter (Polygon.io, Databento, Tiingo)
- [ ] VIX-Futures-Settlements je Kontrakt frei bei Cboe Futures Exchange (CFE)? – ungeprüft
- [ ] **Nutzungsbedingungen Cboe** für kommerzielle Verwendung in UIQ klären (Research ≠ Produkt)
- [ ] Einheitlicher Börsenkalender + Feiertagsregel beim Mischen der Quellen

## 7. Europa / Japan – Kandidaten für die externe Replikation (ungeprüft, Stand 29.09.2026)

Erst prüfen und laden, wenn die Europa-Replikation ansteht (nach Phase 4). Grundsatz wie bei Cboe: **Primärquelle mit nachvollziehbarer Herkunft**, Drittportale nur zum Gegenprüfen.

| Index | Primärquelle (Kandidat) | Drittquellen (nur Gegenprüfung) | Offene Punkte |
|---|---|---|---|
| VSTOXX (V2TX) | STOXX-Indexseite, Datendownload (https://stoxx.com/index/v2tx/) | Macroption (.txt ab 1999), Investing.com, Yahoo `V2TX.DE` | Reichweite/Format ungeprüft (stoxx.com blockt automatischen Abruf) |
| V-VSTOXX | STOXX-Indexseite | – | Existenz eines freien Downloads ungeprüft |
| VDAX-NEW | STOXX (Berechnung heute durch STOXX) | Investing.com (angeblich ab 02.01.1992) | Primärquelle und Reichweite ungeprüft |
| Nikkei 225 VI | indexes.nikkei.co.jp Download-Center | Investing.com | frei nur **3 Jahre Tagesdaten** (+10 J. Monatsdaten) → ohne Stressphase für Replikation zu kurz; längere Historie vermutlich nur kostenpflichtig (JPX/Nikkei) |

Investing.com: manueller Export, Nutzungsbedingungen untersagen automatisierten Abruf, Herkunft nicht belegbar → nicht als Primärquelle.
