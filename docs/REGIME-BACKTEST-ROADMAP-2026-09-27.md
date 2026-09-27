# Roadmap-Konzept – Daten-Backtest der Marketstate-/Regime-Analysen

Stand: 27.09.2026 · Research-Repo: `ahsub/regime-test` · Datenbasis: siehe `REGIME-DATENQUELLEN.md`

**Bezug:** Erweitert `REGIME-BACKTEST-VALIDIERUNG.md` (10.08.2026). Deren Datensatz war auf 2011-05 bis 2025-05 begrenzt (VVIX/SKEW-Verfügbarkeit). Mit den offiziellen Cboe-Historien reicht die Basis jetzt bis 2007 (inkl. Finanzkrise). Liefert zugleich die Backtest-Pflicht für die Backlog-Punkte №52/№54 (SUITE.md).

**Ziel:** Die Regime-Logik auf einer langen, sauberen Tagesdaten-Historie (2007 – heute, inkl. Finanzkrise 2008) testen und neue Features nur dann übernehmen, wenn sie **inkrementellen**, out-of-sample belegten Nutzen gegenüber der bestehenden Logik zeigen.

**Abgrenzung:** Reine Research im Repo `regime-test`. Keine Änderung an UIQ während des Codefreeze (SUITE №72). Transfer in UIQ erst in Phase 5 über SUITE.md.

**Ökonomie-Prinzip:** Erst billige Prüfungen mit hohem Informationswert (Datenverfügbarkeit, Baseline-Reproduktion), dann Hypothesen nach erwartetem Nutzen ordnen. Jede Phase hat ein Abbruchkriterium, damit kein Aufwand in tote Pfade fließt.

---

## Phase 0 – Datenverfügbarkeit bestätigen (manuell, ~30 Min., kein Code)

| # | Prüfung | Ergebnis bestimmt |
|---|---|---|
| 0.1 | VIX1Y / VIX6M: laufen die Reihen bis heute? | Umfang H1 |
| 0.2 | totalpc / equitypc: Enddatum? `indexpc.csv` vorhanden? | ob PCR-Lückenfüller nötig ist |
| 0.3 | Welche PCR-Definition nutzt UIQ produktiv (Equity/Total/Index), aus welcher Quelle? | welche Datei maßgeblich ist |
| 0.4 | COR1M & Co.: Historienbeginn | Umfang H3 |
| 0.5 | CFE: freie Settlement-Historie je VIX-Futures-Kontrakt? | ob H5 lizenzsauber möglich ist |

**Stand 27.09.2026:** 0.1 ✅ (VIX1Y/VIX6M bis 25.09.2026), 0.2 ✅ geprüft – PCR nur bis 04.10.2019, `indexpc.csv` vorhanden, 0.4 ✅ (COR1M ab 2006); 0.3 und 0.5 offen. Zusatzbefund: `regime-test` nutzt den PutWrite-Index `PUT` als Feature – Klärung nötig.

**Gate:** Ergebnisse in `REGIME-DATENQUELLEN.md` eintragen. Fällt die PCR nach 2019 aus, entscheidet 0.3 über Plan B (Anschlussquelle suchen oder PCR-Test auf 2006–2019 begrenzen und das offen ausweisen).

## Phase 1 – Datenschicht (reproduzierbar, point-in-time)

1. **Rohdaten-Snapshot:** Download einmalig lokal, Ablage als Rohdatei mit Abrufdatum und SHA-256 (`data/raw/<quelle>/<datum>/`). Rohdateien nie überschreiben – jeder Backtest referenziert einen Snapshot-Hash.
2. **Loader je Quelle:** Cboe-Indizes (302-Redirect folgen), Cboe-PCR (Disclaimer-Kopf überspringen, unterschiedliche Spaltennamen), FRED/ALFRED (Vintage).
3. **Kalender:** Einheitlicher NYSE-Handelskalender; Feiertags-/Forward-Fill-Zeilen entfernen, nicht auffüllen.
4. **Point-in-time-Regel:** Signal an Tag *t* nutzt nur Werte, die bis Handelsschluss *t* veröffentlicht waren; Ausführung frühestens *t+1*. Makrodaten mit Veröffentlichungsdatum aus ALFRED.
5. **Datenqualitäts-Checks:** Lücken, Duplikate, Ausreißer; Stresstag-Stichproben (27.10.2008, 05.02.2018, 16.03.2020, 05.08.2024).
6. **PCR-Sonderbehandlung:** Strukturbruch 31.05.2012 markieren; Normierung relativ (rollierendes Perzentil / Abweichung vom MA) statt absoluter Schwellen.

**Gate:** Datenqualitätsbericht grün, bevor eine einzige Strategie läuft.

## Phase 2 – Baseline reproduzieren

1. **Quellen-Parität:** VIX, VIX3M, VVIX, SKEW aus Cboe gegen die bisher genutzte Quelle (yfinance) abgleichen. Abweichungen erklären, bevor weitergemacht wird.
2. **`classify_regime_v2()` unverändert** auf 2011–2026 laufen lassen → muss die Ergebnisse aus `08_STRATEGY_COMPARISON.md` (Sharpe ≈ 0,75) reproduzieren.
3. **Erweiterung auf 2007/2008–2026** mit identischer Logik → neue Referenz inkl. Finanzkrise.

**Gate:** Reproduktion innerhalb kleiner, erklärter Toleranz. Sonst Fehlersuche statt neuer Hypothesen.

## Phase 3 – Hypothesentests (nach erwartetem Nutzen geordnet)

Jede Hypothese wird **vor** dem Test mit Definition, Schwellen-Kalibrierungsfenster und Erfolgskriterium registriert (Kandidaten-Register), um Überanpassung durch Nachjustieren zu vermeiden.

| # | Hypothese | Daten | Erfolgskriterium |
|---|---|---|---|
| H1 | VIX1Y/VIX- bzw. VIX6M/VIX-Ratio als Regime-Gate verbessert Drawdown-Schutz, besonders 2008 | Cboe | inkrementeller Nutzen ggü. VIX3M-Logik (Punkt 34); eigene Schwellenkalibrierung, getrennt von Produktion |
| H2 | PCR (in UIQ-Definition) trägt Information über die Vol-Struktur hinaus | Cboe PCR | Verbesserung out-of-sample, Zeitraum gemäß Phase 0 |
| H3 | Implied Correlation (COR1M) als exogene 2. Achse (Zwei-Achsen-Hypothese) | Cboe COR | wie H2 |
| H4 | Makro-Achse (Kurvensteilheit, Claims, OFR FSI) | ALFRED, OFR | wie H2; nur Vintage-Daten |
| H5 | VIX-Futures-Kurve (Basis, Slope, Curvature) | Bloomberg-Dump (nur Research) bzw. CFE | wie H2; Ergebnis nicht veröffentlichen, solange Quelle nicht lizenzsauber |

**Abbruchkriterium je Hypothese:** kein Nutzen im Entwicklungsfenster → nicht ins Bestätigungsfenster (spart Rechen- und Analyseaufwand, schützt das Bestätigungsfenster).

## Phase 4 – Validierung

1. **Zeitfenster:** Entwicklungsfenster und separates, bis dahin unberührtes Bestätigungsfenster; zusätzlich Walk-Forward über rollierende Fenster.
2. **Stress-Stratifizierung:** Ergebnisse getrennt für 2008, 2011, 2015, 2018, 2020, 2022, 2024 ausweisen.
3. **Kennzahlen nur aus realisierten, regelbasierten Trades** gegen Buy-and-Hold; Deflated Sharpe Ratio mit der **tatsächlichen Anzahl getesteter Varianten**; Transaktionskosten-Sensitivität.
4. **Optionale unabhängige Gegenprobe:** Performance je Marktphase mit `qis` (MIT, Artur Sepp).

**Gate:** Nur Hypothesen, die im Bestätigungsfenster und in den Stressphasen halten, gehen weiter.

## Phase 5 – Entscheidung & Transfer in UIQ

1. Ergebnisbericht mit Datenquellen, Snapshot-Hashes und Einschränkungen (Backfill, PCR-Bruch, Cboe-Marktanteil).
2. **Lizenzprüfung:** Cboe-Nutzungsbedingungen für kommerzielle Verwendung in UIQ; Bloomberg-Daten ausgeschlossen.
3. Aufnahme als SUITE.md-Punkt – **erst nach Ende des Codefreeze**; Einführung zunächst im Shadow Mode.

---

## Separater Track – Intraday

Nicht Teil dieser Roadmap. Validierung des 60-Min-Befunds (Sharpe 0,94) braucht Historie mit Stressphase → IBKR/TWS-API (ohnehin für das Options-Modul geplant) oder Bezahlanbieter. Kosten-Nutzen-Entscheidung, sobald Phase 2 steht.

## Offene Entscheidungen für Axel

- [ ] Ergebnis Phase 0.3: maßgebliche PCR-Definition
- [ ] Plan B, falls PCR ab ~2019 fehlt
- [ ] Wann Intraday-Track budgetieren?
