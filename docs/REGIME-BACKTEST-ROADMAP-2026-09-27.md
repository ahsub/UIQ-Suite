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

**Stand 27.09.2026: ✅ abgeschlossen** – `ahsub/regime-test` Commit `88a0d12`
(`src/datalayer/`, `run_phase1.py`, `tests/test_datalayer.py`, Snapshot
`data/raw/cboe/2026-09-27/` mit `SHA256SUMS.txt`). Kalender: NYSE über Paket
`holidays` (inkl. Sonderschließungen). QC-Status WARN, vollständig erklärt:
(1) Cboe-VIX-Historie enthält 34 Zeilen an NYSE-Feiertagen (u. a. 11.06.2004,
seit 2022 nahezu jeder US-Feiertag) → verworfen; die bisherigen
`regime-test`-Skripte haben diese Zeilen als Handelstage behandelt;
(2) VVIX 2006 lückenhaft (59 Tage) → faktisch ab 2007 nutzbar;
(3) VIX1Y fehlt an Columbus/Veterans Day (Anleihemarkt geschlossen) → bleibt
NaN. Abgleich mit dem Snapshot vom 30.08.2026: 0 Abweichungen bei VIX, VIX3M,
VVIX, SKEW (keine Revisionen). Tests laufen unter pandas 2.3 und 3.0.

## Phase 2 – Baseline reproduzieren

1. **Quellen-Parität:** VIX, VIX3M, VVIX, SKEW aus Cboe gegen die bisher genutzte Quelle (yfinance) abgleichen. Abweichungen erklären, bevor weitergemacht wird.
2. **`classify_regime_v2()` unverändert** auf 2011–2026 laufen lassen → muss die Ergebnisse aus `08_STRATEGY_COMPARISON.md` (Sharpe ≈ 0,75) reproduzieren.
3. **Erweiterung auf 2007/2008–2026** mit identischer Logik → neue Referenz inkl. Finanzkrise.

**Gate:** Reproduktion innerhalb kleiner, erklärter Toleranz. Sonst Fehlersuche statt neuer Hypothesen.

**Stand 27.09.2026: ✅ abgeschlossen** – `ahsub/regime-test` Commit `cfcab55`
(`run_phase2_baseline.py`, `results/phase2/baseline_2026-09-27.md`; Snapshots
`data/raw/yahoo/2026-09-27/` für ^GSPC, `data/raw/squeezemetrics/2026-08-30/` für GEX).

| Fenster | Sharpe | B&H Sharpe | Max DD | B&H DD | Trades |
|---|---|---|---|---|---|
| 20.10.2011 – 27.08.2026 (bisher, exakte Replik) | 0,75 | 0,71 | −20,3 % | −33,9 % | 261 |
| 03.01.2011 – 28.08.2026 | 0,66 | 0,65 | −20,3 % | −33,9 % | 285 |
| 18.09.2009 – 25.09.2026, ohne GEX | 0,62 | 0,65 | −23,8 % | −33,9 % | 265 |

Befunde: (1) Replik exakt (0,753 / 403,18 % / −20,29 % / 261). (2) Das bisherige
Fenster begann wegen HMM-Anlauf erst am 20.10.2011 – nach dem Downgrade-Einbruch.
(3) **Kein belastbarer Sharpe-Vorteil ggü. Buy & Hold; der Nutzen ist
Drawdown-Schutz** (Covid −7 % vs. −34 %, 2018 Q4 −13 % vs. −19 %), aber kein Schutz
bei schnellen Schocks (2011, 08/2015, 08/2024) und noch ohne Kosten.
(4) Rückwärts aufgefülltes GEX in `market_data.csv` ohne Einfluss; GEX-Filter
+0,02 Sharpe, v. a. 2022. (5) Cboe-VIX3M-Historie beginnt erst 18.09.2009 → die
Baseline selbst kann 2008 nicht abdecken; 2008 nur über H1 (VIX1Y/VIX6M).
**Konsequenz für Phase 3:** Erfolgskriterium aller Hypothesen = inkrementeller
**Drawdown-/Tail-Schutz ggü. B&H im selben Fenster** (Max DD, Stressphasen,
Ulcer/CVaR), Sharpe nur ergänzend. README `regime-test` entsprechend korrigiert.

## Phase 3 – Hypothesentests (nach erwartetem Nutzen geordnet)

Jede Hypothese wird **vor** dem Test mit Definition, Schwellen-Kalibrierungsfenster und Erfolgskriterium registriert (Kandidaten-Register), um Überanpassung durch Nachjustieren zu vermeiden.

| # | Hypothese | Daten | Erfolgskriterium |
|---|---|---|---|
| H1 | VIX1Y/VIX- bzw. VIX6M/VIX-Ratio als Regime-Gate verbessert Drawdown-Schutz, besonders 2008 | Cboe | inkrementeller Nutzen ggü. VIX3M-Logik (Punkt 34); eigene Schwellenkalibrierung, getrennt von Produktion |
| H2 | PCR (in UIQ-Definition) trägt Information über die Vol-Struktur hinaus | Cboe PCR | Verbesserung out-of-sample, Zeitraum gemäß Phase 0 |
| H3 | Implied Correlation (COR1M) als exogene 2. Achse (Zwei-Achsen-Hypothese) | Cboe COR | wie H2 |
| H4 | Makro-Achse (Kurvensteilheit, Claims, OFR FSI) | ALFRED, OFR | wie H2; nur Vintage-Daten |
| H5 | VIX-Futures-Kurve (Basis, Slope, Curvature) | Bloomberg-Dump (nur Research) bzw. CFE | wie H2; Ergebnis nicht veröffentlichen, solange Quelle nicht lizenzsauber |
| H6 | Marktbreite-Divergenz (kapital- vs. gleichgewichtet, Anteil über EMA50/200, Sektorstreuung) | Kurshistorie Index-/Sektor-ETFs; UIQ-Snapshot-Archiv nur beschreibend | Forschungsnotiz 29.09.2026, **nicht präregistriert, nicht getestet**; Einordnung als Phase-4-Kanal (Prognosegüte ggü. VIX-Benchmark) |

**H1 · Stand 27.09.2026: ❌ nicht bestätigt (abgeschlossener negativer Primärtest).**
Präregistrierung `regime-test/docs/preregistration/H1_laufzeit_gate.md` Rev. 3 (Commit `8e05c0a`,
13:40, vor Auswertung; nach externem Review: Daten-Vintage, Versuchsprotokoll, feste
Stressphasen, ein primärer Kandidat, keine Ersatzauswahl). Auswertung `run_phase3_h1.py`,
Bericht `results/phase3/H1_bericht.md`. Primärer Kandidat O-6M (Overlay, VIX6M/VIX < 1,05 →
Position 0), im Entwicklungsfenster 2009–2016 gewählt. Bestätigungsfenster 2017–2026 gegen
Baseline: Max DD −27,3 % vs. −24,6 % (Kriterium ≥ 3 Pp besser verfehlt), Calmar 0,27 vs. 0,43,
CAGR 7,4 % vs. 10,6 %; Stressphasen 5 von 5 nicht schlechter. Sekundär 0 von 3 erfüllt.
**Konsequenz:** kein Laufzeit-Filter in der UIQ-Logik.
**Fehleranalyse 2022 (eigenständiger Befund):** Beide Varianten erreichen den maximalen
Drawdown im Bärenmarkt 2022 (Baseline: Hoch 03.01.2022 → Tief 12.10.2022; Filter: Hoch
18.11.2021 → Tief 28.12.2022). Der Filter stieg in 2022 mehrfach aus und wieder ein und vertiefte
so den Verlust über die fest abgegrenzte Stressphase (bis 12.10.2022) hinaus. Zugleich zeigt
2022 eine Schwäche der bestehenden Marketstate-Logik: eine langsame, lang anhaltende
Abwärtsphase ohne ausgeprägte Laufzeit-Inversion wird kaum abgefangen (Baseline −24,1 % vs.
B&H −24,9 % in der Phase).
**Forschungsnotiz H1b (kein Produktivfilter):** Schockschutz ist real (Covid −1 % vs. −7 %,
Volmageddon −3 % vs. −7 %, 2008 im Methodentest −0,5 % vs. −47 %), wird aber durch Whipsaw und
verpasste Erholungen überkompensiert (Zeit im Markt 87 %, 229 statt 162 Wechsel). Weiterverfolgung
nur als neu präregistrierte Hypothese mit eigener Wiedereinstiegs-/Haltedauerregel und
unberührtem Bestätigungsdesign – derzeit nicht priorisiert.

**H3 · Stand 27.09.2026: ❌ nicht bestätigt (knapp) · eigenständige Informationsachse nachgewiesen.**
Präregistrierung `regime-test/docs/preregistration/H3_implied_correlation.md` Rev. 2 (Commit
`e40226f`, 13:54, vor Auswertung; nach Review: Familie B mathematisch präzisiert, Redundanz vom
Erfolgskriterium getrennt). Auswertung `run_phase3_h3.py` (Commit `78c0edc`), Bericht
`results/phase3/H3_bericht.md`. Regeln über rollierende 252-Tage-Perzentile (COR1M-Niveau
nicht stationär: Median 2010 61,5 → 2026 10,5). Primärer Kandidat O-A (Risiko-aus bei
COR1M-Perzentil ≥ 0,95): Max DD −22,8 % vs. −24,6 % = **+1,8 Pp (Kriterium ≥ 3 Pp verfehlt)**,
Calmar 0,437 vs. 0,429, Stressphasen 4 von 5. Sekundär 0 von 3. Kostenempfindlich (0 Bp:
Calmar 0,50 vs. 0,47; 10 Bp: 0,38 vs. 0,39). Informationsmehrwert: nur 50 % der
Risiko-aus-Tage überlappen mit Baseline-Ausstiegen → COR1M ist **keine Kopie des VIX-Signals**
(eigenständige Information ≠ nachgewiesener Anlagenutzen). Familie B (Perzentil-Differenz zum
VIX) praktisch wirkungslos (31 aktive Tage). Daten-Vintage: COR1M bis 17.03.2022 vermutlich
rückberechnet; Live-Teilfenster ab 03/2022 für O-A günstiger (DD −17,1 % vs. −19,9 %) – nur
sekundär. **Konsequenz:** kein COR1M-Filter in UIQ; **keine Nachoptimierung** von O-A.
**Option (nicht beschlossen):** O-A exakt eingefroren als Vorwärtstest (Shadow Mode) ab
10/2026 auf neuen Daten, ohne Handel und ohne Anpassung.

**H2 · Stand 27.09.2026: Informationshypothese bestätigt · Wirtschaftshypothese nicht getestet.**
Statt Renditetest ein deskriptives Daten-/Informationsaudit (`regime-test/run_h2_audit.py`,
`results/h2_audit/H2_audit.md`), Fenster 18.09.2009 – 04.10.2019, Proxy = UIQ
`calc_pcr_proxy()` wörtlich. Befunde: ρ(echte Total-PCR, Proxy) 0,39; ρ(echte PCR, VIX) 0,31;
Zustände mit produktiven UIQ-Schwellen: Übereinstimmung 42 %, **κ 0,08 (≈ Zufall)**;
**Skalen-/Kalibrierungsproblem:** Overlay meldet mit Proxy an 51 % der Tage „Gier“, mit echter
Total-PCR an 6,5 %; schnelle Vol-Schocks meldet der Proxy früher, 2018 Q4 die echte PCR.
Ein Renditetest auf 2009–2019 (5 Stressphasen, ohne Covid/2022/2024, nur Cboe-Volumen mit
Strukturbrüchen 2012) wäre aussageschwach – positive wie negative Ergebnisse kaum belastbar;
daher bewusst **nicht** durchgeführt. **Konsequenz:** kein PCR-Filter in UIQ; kein
„Widerlegen“ der PCR durch einen schwachen Test; UIQ-Proxy ist als eigenständiger
**VIX-Stress-Proxy** zu dokumentieren und darf nicht als Put/Call-Ratio bezeichnet oder
interpretiert werden (→ SUITE.md №72); echte PCR bleibt Daten-/Forschungsoption.

**H2-Ext · Stand 29.09.2026: Replikation des H2-Informationsaudits auf 07.10.2019 – 25.09.2026.**
Präregistrierung `regime-test/docs/preregistration/H2_EXTENSION_2020_2026.md` Rev. 3 (Commit
`d9fe86f`, vor Auswertung; zwei externe Reviews), Skript `run_h2_extension.py` 1.1.0 (`b804a0e`,
Selbsttest reproduziert `H2_audit.json` exakt), ein Lauf, Bericht `results/h2_extension/H2_ext.md`.
Datenquelle neu: Cboe Daily Market Statistics (PCR-Anschluss ab 07.10.2019), 1.752 Tage, 0 Ausschlüsse.
Deskriptiv, kein Renditetest; **keine Gesamtbewertung von H2** (§7b) – Einzelaussagen:
- **Aussage 1 Rangassoziation mit dem VIX: repliziert** – |ρ(Total-PCR, VIX)| 0,21 (Original 0,31);
  alle bestimmbaren Teilbefunde < 0,50 (Bärenmarkt 2022: 0,48). Zulässig nur: die geringe
  Rangassoziation bleibt bestehen – **kein** Nachweis eigenständiger Information (§7c).
- **Aussage 2a Proxy bildet PCR nicht ab: repliziert** – κ Overlay 0,036 (Original 0,08);
  eine Abweichung (Bärenmarkt 2022: κ 0,26 = abgeschwächt).
- **Aussage 2b Skalenproblem: repliziert, aber uneinheitlich** – Δ „Gier“ Proxy − echt 21,7 Pp
  (Proxy 31,0 % vs. echt 9,3 %; Original 51 % vs. 6,5 %), knapp über der Schwelle 20 Pp.
  Drei Abweichungen: Teilfenster 2019–2022 Δ 2,0 Pp, Bärenmarkt 2022 Δ 1,5 Pp, Equity-PCR
  −57,4 Pp; Teilfenster 2023–2026 dagegen Δ 38,9 Pp → das Skalenproblem ist **phasenabhängig**
  (in Stress-/Hochvola-Phasen kaum vorhanden, in ruhigen Phasen ausgeprägt).
- Zusatz (§4): skalenbereinigt mit den Original-Schwellen 0,93/1,16 κ 0,11 (Original im eigenen
  Fenster 0,24) – die damalige Kalibrierung überträgt schlecht.
**Konsequenz:** keine automatische (§7b). Die Umbenennung des UIQ-Proxys in „VIX-Stress-Proxy“
(№72) wird durch 1 und 2a gestützt. Für die offene Frage „Overlay-Schwellen separat prüfen“ ist
2b relevant: Die „Gier“-Überzeichnung des Proxys ist nicht stabil, sondern regimeabhängig.
n_trials unverändert 42.

**H4 · Stand 27.09.2026: ❌ nicht bestätigt (Calmar verfehlt) · sehr eigenständige Information.**
Phase 0: Point-in-time-Audit ALFRED (Commit `a18778f`): Zinskurve aus Erstveröffentlichungen
der H.15-Bausteine DGS10/DGS3MO/DGS2 (Vintages ab 06/2005) rekonstruiert (Abgleich mit FRED
T10Y3M ab 2014: 3.180 von 3.181 Tagen identisch); Initial Claims nur Erstveröffentlichungen (ab
05/2009); **ausgeschlossen:** BAA10Y (DBAA erst ab 04/2014 point-in-time), NFCI (erst ab 06/2011,
Korrelation Erst-/heutiger Stand nur 0,85), STLFSI4 (erst ab 11/2022). Präregistrierung
`regime-test/docs/preregistration/H4_makro_achse.md` Rev. 2 (Commit `dc6df73`, 14:34; nach
Review: Eligibility ≥ 20 Handelstage als reine Zulassungsregel, keine Nachschub-Schwellen,
neutrale Primärbegründung, exaktes Timing). Auswertung `run_phase3_h4.py`, Bericht
`results/phase3/H4_bericht.md`. Eligibility: +5 % 546 Tage ✅, +10 % 129 ✅, +15 % 10 ❌.
Primär A-0,05 (Risiko-aus, wenn 4-Wochen-Mittel der Erstveröffentlichungen ≥ 5 % über seinem
52-Wochen-Tief): Max DD −16,3 % vs. −24,6 % (+8,3 Pp ✅), Stressphasen 5 von 5 ✅, **Calmar 0,15
vs. 0,43 ❌** – nur 35 % Zeit im Markt, CAGR 2,4 % vs. 10,6 % (lang anhaltendes Risiko-aus ab 2022
bei langsam steigenden Claims ohne Rezession). Entwicklungsfenster war stark (Calmar 0,85 vs.
0,45) – generalisiert nicht. Sekundär K (10J−3M < 0) und Z (10J−2J < 0): 0 von 2.
Informationsmehrwert: nur 6 % Überlappung mit Baseline-Ausstiegen.

### Phase-3-Synthese (27.09.2026)

| Hypothese | Krisenschutz | Gesamtprofil ggü. Baseline | eigenständige Information |
|---|---|---|---|
| H1 Laufzeit-Gate (VIX6M/VIX, VIX1Y/VIX) | ja (Covid, Volmageddon) | ❌ Calmar 0,27 vs. 0,43 | – |
| H2 Put/Call-Ratio | nicht getestet | nicht getestet (Daten bis 10/2019) | ✅ (ρ 0,39 zum Proxy, κ 0,08) |
| H3 Implied Correlation (COR1M) | teilweise (4 von 5) | ❌ knapp (DD +1,8 statt ≥ 3 Pp) | ✅ (50 % eigenständige Ausstiege) |
| H4 Makro (Claims, Zinskurve) | ja, stark (5 von 5, DD +8,3 Pp) | ❌ deutlich (Calmar 0,15 vs. 0,43) | ✅ (94 % eigenständige Ausstiege) |

**Befund (durch die Experimente gedeckt, kein allgemeines Gesetz):** In den vier untersuchten
Filterfamilien zeigte sich konsistent ein Trade-off zwischen Krisenschutz und langfristiger
Investitionsquote. Keiner der getesteten Filter konnte den zusätzlichen Drawdown-Schutz mit einem
mindestens gleichwertigen Gesamtprofil verbinden.

**Informationsmehrwert ≠ wirtschaftlicher Mehrwert:** H2 – eigenständige Information
nachgewiesen, ökonomischer Test bewusst nicht durchgeführt; H3 – eigenständige Information,
begrenzter ökonomischer Effekt, Kriterium knapp verfehlt; H4 – sehr eigenständige Information,
starker Krisenschutz, deutlicher Rendite-/Calmar-Preis.

**Konsequenzen für UIQ (nach Freeze-Aufhebung, jeweils als eigener SUITE-Punkt):**
1. Die Baseline `classify_regime_v2()` bleibt unverändert; **kein** zusätzlicher binärer
   Ausstiegsfilter aus H1–H4.
2. Kommunikation der Marketstate-Logik: Nutzen = Drawdown-Schutz ggü. Buy & Hold, **kein**
   belastbarer Sharpe-Vorteil (Phase 2).
3. „PCR“ in UIQ als VIX-Stress-Proxy führen; Overlay-Schwellen separat prüfen (№72).
4. Eigenständige Informationskanäle (COR1M, Claims, echte PCR) nicht als Handelsfilter, allenfalls
   als beschreibender Kontext – jede weitergehende Nutzung (z. B. Teilreduktion statt Ausstieg)
   wäre eine **neue**, eigens präregistrierte Hypothesenfamilie.
5. Kein H5 „auf Verdacht“. H5 (VIX-Futures-Kurve) bleibt wegen Bloomberg-Lizenz ohnehin nur
   Research. Option: O-A (H3) als eingefrorener Shadow-Mode-Vorwärtstest ab 10/2026 – nicht
   beschlossen.

**Kumulierte Versuche Phase 2–3:** 5 frühere Kandidaten + 16 (H1) + 16 (H3) + 5 (H4) = 42.

### Nächste Stufe (Plan für die nächste Sitzung, 27.09.2026 – nicht beschlossen, nichts ausgewertet)

Leitfrage (Claude + Reviewer): **Was soll Marketstate prognostizieren – und wie messen wir das ohne
Trading-Bias?** Der bisherige Maßstab „S&P-500-Ein/Aus“ ist für UIQ (Strategiewahl CSP/CC/Spreads/KO,
Positionsgröße) zu eng.

- **Phase 4 (neu gefasst): Prognose statt Timing.** Zuerst Zielvariablen festlegen und
  präregistrieren, z. B. P(Drawdown ≥ 5 % in 20 Tagen), zukünftige 20-Tage-Realized-Volatility
  (Klasse). Bewertung mit Prognosegüte (Brier-Score, Kalibrierung), **gegen einen einfachen
  Benchmark** (nur VIX bzw. Baseline-Zustand) – die entscheidende Frage ist der *inkrementelle*
  Informationswert. Zuerst univariat je Kanal (Vol-Struktur, COR1M, Claims; PCR nur bis 10/2019),
  ohne Trading.
- **Phase 4b: Kombination** der Kanäle zu einer kalibrierten „Market Risk Probability“ – erst wenn
  Phase 4 univariate Information belegt. Stufen/Schwellen für Aktionen („Risk Intensity“) erst
  danach und nur bei nachgewiesener monotoner Beziehung.
- **Multiple Testing klein halten:** ein primäres Ziel, wenige Horizonte, vorab fixiert.
- **Reihenfolge der Märkte (Reviewer):** zuerst eine eingefrorene US-Prognosearchitektur
  (Entwicklung + interne Bestätigung), **danach** Europa (DAX/VDAX, Euro Stoxx/VSTOXX) als externe
  Replikation – nicht als weiteres Optimierungsfeld. Hinweis: das US-Fenster 2017–2026 ist durch
  H1–H4 inhaltlich bekannt; die externe Replikation ist deshalb der eigentliche Härtetest.
- Danach erst die UIQ-Kette: Prognose → Strategiewahl → Positionsgröße.

**Nullhypothese Phase 4 (Reviewer):** H0 – COR1M, PCR, Claims und weitere Kanäle liefern über die
bereits im VIX enthaltene Information hinaus keinen relevanten zusätzlichen Prognosewert.

**Checkliste Präregistrierung Phase 4 (vor jedem Code):**
1. Zielvariablen exakt definiert (Horizonte, Ereignisschwellen)
2. Information Set: was ist zum Prognosezeitpunkt tatsächlich verfügbar (point-in-time)
3. Benchmark „VIX allein“, vollständig eingefroren
4. Zusatzmodelle: jeweils genau definierte Einzelkanäle
5. Messgrößen: Brier Score, Log Loss, Kalibrierung, ggf. AUC – nicht primär Rendite
6. Entscheidend: inkrementelle Verbesserung gegenüber dem VIX-Benchmark
7. Entwicklung/Bestätigung ohne nachträgliche Zielvariablen- oder Modellwahl
8. Europa von Anfang an als externe Replikation eingeplant

**Grundsatz:** Prognosegüte und ökonomische Verwertbarkeit sind zwei getrennte Hypothesen. Ein
besser kalibrierter Prognosewert muss keinen handelbaren Vorteil liefern; umgekehrt kann ein
kleiner, gut kalibrierter Informationsgewinn für die UIQ-Strategiewahl wertvoll sein.

Einstieg nächste Sitzung: „weiter mit Phase 4 der Regime-Roadmap“ – beginnt mit der
Präregistrierung, noch ohne Code.

### Forschungsnotiz H6 – Marktbreite-Divergenz (29.09.2026, nicht präregistriert, nichts getestet)

**Anlass.** Die DCE meldete im Nachtlauf 28.09. (Lauf 29.09. 01:35 UTC) `GREEN` + `SELL` bei
Regime BULL_QUIET. Nachrechnung über das Snapshot-Archiv (`uiq-devtools/breadth-divergenz/analyze.py`
1.0.0, 47 Handelstage 21.07.–28.09.2026, Selbsttest: Konsens exakt reproduziert):

- **Die DCE-Richtung ist ein Messartefakt, kein Marktsignal.** An allen 38 Handelstagen mit
  DCE-Objekt `SELL/GREEN`, Confidence 70–72, Konsens 0,203–0,325 (BUY erst > 0,55, SELL < 0,45).
  Der Konsens mittelt selektive Filter-Scores (Minervini, Breakout …), die für die meisten Titel
  immer niedrig sind → strukturell „SELL“. Ursache Transformation (Taxonomie Befundregister), D4.
- **Die Rohdaten zeigen dagegen eine echte Breite-Divergenz** (Handelstage 13.08. = SPY-Hoch im
  Archiv → 28.09.): SPY −1,6 %, RSP −5,8 % (Spread +4,3 Pp), QQQ +0,6 %, XLK +2,0 %, SMH +1,8 %;
  IWM −7,7 %, MDY −7,5 %, XLI −9,2 %, XLU −10,9 %, XLRE −8,4 %, ITA −16,2 %; TLT −4,8 %,
  GLD −5,3 %. Anteil Universum über EMA50 68 % → 34 %, über EMA200 70 % → 53 %.
  Sektor-Tags (gemeinsames Universum, Mehrfach-Tags je Tag): Edelmetalle 90 % → 10 %,
  Verteidigung 78 % → 19 %, Nuklear 69 % → 15 % über EMA50; AI_TECH 50 % → 83 %, SEMIS 62 % → 85 %.
  (Die Sektorzahlen im Chat vom 29.09. zählten nur den ersten Tag je Titel – maßgeblich sind die
  Skriptwerte.)
- **Blinder Fleck:** `regimeUsed` war an 46 von 47 Handelstagen BULL_QUIET. Das VIX-Termstruktur-
  Modell misst Volatilitätsstress, keine Breite – kein Fehler, aber eine fehlende Achse.
- **Datenlücke:** 494 von 706 Titeln (70 %) ohne Sektor-Tag → Sektorsicht derzeit nur über die
  GICS-Sektor-ETFs (XL*) belastbar.

**Hypothese (Entwurf, vor jedem Test präzise zu registrieren).** H6: Eine Marktbreite-Divergenz
(kapitalgewichteter Index nahe Hoch bei sinkender Breite) liefert über die im VIX enthaltene
Information hinaus Prognosewert für eine vorab festgelegte Zielvariable (z. B. P(SPY-Drawdown
≥ 5 % in 20 Tagen) oder Rendite RSP − SPY über 20/60 Tage). **H0:** kein inkrementeller
Prognosewert gegenüber dem eingefrorenen VIX-Benchmark (Phase-4-Checkliste Punkte 1–8 gelten
unverändert).

**Einordnung / Vorbehalte.**
- Schmale Führung kann lange anhalten (2023/24) oder brechen; aus 47 Tagen folgt nichts über
  Prognosewert. Das UIQ-Archiv (90 Tage, wechselndes Universum) dient nur der Beschreibung.
- Testbasis muss eine lange, point-in-time rekonstruierbare Historie sein: Kurse der Index- und
  Sektor-ETFs (RSP ab 2003, XL* ab 1998) – Breite des eigenen Universums ist wegen
  Survivorship-Bias nicht rückwirkend rekonstruierbar.
- Kein Handelsfilter „auf Verdacht“ (Phase-3-Konsequenz 4/5 gilt). n_trials unverändert 42.

**Berechnungsebene (Frage Axel 29.09.: DCE sektoral oder Einzelticker → Sektoren?).**
Auf Einzeltickerebene rechnen, dann nach Sektoren aggregieren – **nicht** die DCE je Sektor
laufen lassen. Begründung: (1) Der Fehler sitzt in der Aggregation (Mittelwert selektiver
Scores); eine DCE je Sektor erbte ihn und lieferte pro Sektor dieselbe konstante Richtung.
(2) Nur die Tickerebene erlaubt, bullische Einzelsignale ihrem Sektor zuzuordnen und
Mehrfachzugehörigkeit sauber zu behandeln. (3) Geeignete Sektormaße sind Anteile und
Verteilungen (Anteil über EMA50/200, Anteil mit Strategie-Score über fester Schwelle,
Streuung, gleich- vs. kapitalgewichtete Rendite) – jeweils relativ zur eigenen Historie
(Perzentil), weil die Niveaus je Sektor verschieden sind. (4) Voraussetzung ist eine
vollständige Sektor-Zuordnung (GICS über die XL*-Zugehörigkeit oder Stammdaten) statt der
heutigen thematischen Tags mit 70 % Lücke. Eine fusionierte „Confidence“ je Sektor bleibt
– wenn überhaupt – intern (ADR-1); öffentlich nur die deskriptiven Maße.

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

## Separater Track – Signal-Diskrepanzen systematisch suchen und auflösen (ab 29.09.2026)

**Auftrag (Axel, 29.09.):** Scheinbare Widersprüche zwischen UIQ-Signalen gezielt suchen,
methodisch auflösen und – soweit validierbar – nutzbar machen.

**Grundsatz:** Jede Diskrepanz ist zuerst ein **Befund**, kein Signal. Bisher waren die meisten
gefundenen Widersprüche Mess- oder Darstellungsfehler (DCE-Richtung, Termstruktur-Label,
PCR-Proxy, ARM-SEPA). Erst was die Klärung als echte Marktdivergenz übersteht, wird
Hypothese – und erst eine validierte Hypothese darf eine Handlungsregel werden.

**Dreistufiges Verfahren**

1. **Finden (maschinell, täglich, read-only).** Prüfer in `uiq-devtools`, der vorab definierte
   Widerspruchspaare je Lauf auswertet und auflistet – ohne Eingriff in Produktion. Startkatalog:
   Regime vs. Breite · Index vs. gleichgewichteter Index · Strategie-Score vs. Trendlage
   (z. B. hoher Momentum-Score unter EMA200, SEPA 100 bei großem Abstand zum 52W-Hoch) ·
   DCE-Ampel vs. DCE-Richtung · Anleihen/Gold/Aktien gleichgerichtet fallend · Sektor-ETF vs.
   Einzeltitel desselben Sektors · Morning-Briefing-Aussage vs. zugrunde liegender Messwert.
   Neue Paare werden vor ihrer ersten Auswertung in diesen Katalog eingetragen (nicht nachträglich).
2. **Klären (Ursache belegen, Grundgesetz #9).** Jede Diskrepanz wird einer Ursache aus der
   Taxonomie des Befundregisters zugeordnet (Quelle · Transformation · Cache · Prompt-Binding ·
   Darstellung) **oder** als echte Marktdivergenz belegt. Belegpflicht: Nachrechnung aus
   Rohdaten, bei Marktdivergenz Gegenprobe mit einer unabhängigen Quelle (z. B. ETF-Kurse statt
   eigener Scores). Artefakte gehen als D-Befund in №72, nicht in die Forschung.
3. **Nutzen (nur für echte Marktdivergenzen).** Präregistrierte Hypothese nach der
   Phase-4-Checkliste (Zielvariable, point-in-time, Benchmark VIX, Brier/Kalibrierung,
   Entwicklungs- und unberührtes Bestätigungsfenster, externe Replikation). Erst nach bestandenem
   Gate: Shadow Mode (eingefroren, ohne Anpassung), danach ggf. SUITE-Punkt.

**Handlungsempfehlungen – Grenzen.** Eine validierte Regel darf **intern** (Owner-Modus,
Alpha Desk) als Entscheidungshilfe erscheinen, mit Kennzeichnung von Methode, Testfenster und
Prognosegüte. **Öffentlich** bleiben alle Ausgaben deskriptiv (Zusagen gegenüber der Aufsicht,
Public-UI-Bereinigung, ADR-1): Die Divergenz selbst darf beschrieben werden
(„Signalbreite x %“, „gleichgewichteter Index −5,8 % vs. kapitalgewichtet −1,6 %“), eine daraus
abgeleitete Kauf-/Verkaufs- oder Gewichtungsaussage nicht.

**Stand 29.09.2026:**

| Diskrepanz | Klärung | Ergebnis |
|---|---|---|
| DCE `SELL` bei `GREEN`/BULL_QUIET | Transformation (Konsens-Aggregation) | Artefakt → D4 (Befundregister) |
| Index nahe Hoch, Breite halbiert | Marktdivergenz, Gegenprobe ETF-Kurse | echt → H6 (Forschungsnotiz) |
| Regime 46/47 Tage BULL_QUIET trotz Breitenverfall | Modellumfang (keine Breitenachse) | kein Fehler, fehlende Achse → H6 |
| PCR-Proxy „Gier“ vs. echte PCR | Transformation/Skala | Artefakt → №72, H2/H2-Ext |
| Termstruktur „invers“ bei Contango | Prompt-Binding (nur Rohwerte, kein berechnetes Label) | Artefakt → D2 |
| ARM SEPA 100 bei −30 % zum 52W-Hoch | offen | №72 A1 |
| Zweig 0 % / EMA50 100 % / Markov 0 | offen | D1 |

**Nächster Schritt:** Prüfer-Skelett für Stufe 1 in `uiq-devtools` (Paare aus dem Startkatalog,
Ausgabe als Liste je Handelstag) – nach Batch 1b, weil dessen Zusagen Vorrang haben.

## Offene Entscheidungen für Axel

- [ ] Ergebnis Phase 0.3: maßgebliche PCR-Definition
- [ ] Plan B, falls PCR ab ~2019 fehlt
- [ ] Wann Intraday-Track budgetieren?
- [ ] H6: Zielvariable und Testbasis (ETF-Historie) festlegen, bevor präregistriert wird
- [ ] Sektor-Zuordnung: GICS-Stammdaten ergänzen oder XL*-Zugehörigkeit als Ersatz
