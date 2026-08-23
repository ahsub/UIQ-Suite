# Regime-Mapping — Quantitative Backtest-Validierung (10.08.2026)

**Status:** Erstmalige quantitative Prüfung des Regime-Mappings aus
`OPTIONSMODUL-ARCHITEKTUR.md` (Abschnitt 4, Entwurf 09.08.2026). Vorherige
Prüfung (Punkt B, 09.08.) war rein qualitativ (Abgleich gegen
`REGIME-COVERAGE-ANALYSE.md`, 17.07.2026). Dies ist der dort als offen
vermerkte nächste Schritt.

**Auftrag:** aus UEBERGABE-2026-08-09-ganztag.md, offener Punkt "Quantitative
Regime-Mapping-Validierung gegen 2007-2026-Backtest".

## Datengrundlage

Der ursprünglich referenzierte "2007-2026-Backtest mit Sharpe 1,66" (Gate A)
hat nach Prüfung von `market_aggregator.py`, `dce_layer.py`, `tr_layer.py`
sowie `TRACK_RECORD_SPEC.md` **keine Regime-Dimension** — er validiert die
DCE-Composite-Score-Ranking-Qualität, nicht regime-spezifische
Strategie-Performance. Der Track-Record mit Regime-Tags läuft laut Spec
erst seit 03.07.2026 (zu kurz für belastbare Validierung).

Stattdessen wurde ein eigenständiger historischer Datensatz aus
öffentlichen Quellen zusammengestellt (Details unten). **Dies ersetzt NICHT**
den offiziellen Gate-A-Backtest, sondern ist eine unabhängige, zusätzliche
Prüfung speziell des Regime-Mappings.

**Zeitraum:** 2011-05-02 bis 2025-05-09 (~14 Jahre, 3.528 Handelstage,
begrenzt durch VVIX/SKEW-Datenverfügbarkeit). Enthält reale Stress-Episoden:
2011 US-Downgrade, 2015 China-Crash, 2018 Volmageddon, 2018-Q4-Ausverkauf,
2020 COVID-Crash, 2022 Bärenmarkt, 2023 SVB-Krise, Aug-2024 Yen-Carry-Unwind.

**Quellen (öffentliche GitHub-Archive, keine Primärlizenz-Daten):**
- GEX/DIX: `marcusdrewry/gex-forward-returns` (SqueezeMetrics-Ursprung,
  `squeezemetrics.com/monitor/static/DIX.csv` laut deren eigenem
  Report — **möglicherweise eine frei zugängliche statische Historie,
  unabhängig von der UIQ-seitig blockierten Live-API. Separat zu prüfen,
  s. Hinweis am Ende.**)
- VIX/VVIX/SKEW/SPX: `Pj-354/Python-Notebooks--Mine-` (2006-2025)
- VIX3M: `rtkyboba/vrp-regime-detection-strategy` (2006-2026)
- **CBOE-Benchmark-Indizes als Strategie-Proxy** (echte Performance-Indizes,
  nicht nur SPX-Kursnäherung): PUT-Index (CSP/Wheel), BXM-Index (Covered
  Call), CLL-Index (Collar) — direkt von `cdn.cboe.com` bezogen.

**Methodik:** Regime-Klassifikator 1:1 aus `ko-market-state.js`
(`determineRegime()`, `THRESHOLDS`, `zScore()`/`percentileRank()` mit
20-Tage-Rolling-Window) in Node.js portiert. Datenqualität stichprobenartig
gegen bekannte Ereignisse geprüft (GEX-Vorzeichen an Krisentagen,
SPX-Kursstände) — plausibel, aber nicht Punkt-für-Punkt gegen
CBOE/SqueezeMetrics-Primärquelle abgeglichen.

## Ergebnis 1 — Krisentag-Erkennung: 11/13 (84,6%)

Alle großen Liquiditäts-Panik-Ereignisse korrekt erkannt (2011, 2015, 2018×2,
2020×3, 2023, 2024). Zwei Fehltreffer: 2022-09-13 (CPI-Schock-Tag) und
2022-10-13 (Jahres-Tiefpunkt nahe) — beide als NEUTRAL statt
STRESS_UNSTABLE klassifiziert.

**Ursache identifiziert, kein Klassifikator-Fehler:** Die VIX-Terminstruktur
blieb an beiden Tagen FLAT (vixRatio 0,996–1,025), VIX nur 27–32 (vs. 82+ im
COVID-Crash). Der 2022er-Bärenmarkt war ein "trockener", zinsgetriebener
Abwärtstrend ohne Liquiditäts-Panik-Dynamik — die Terminstruktur invertierte
nie. **STRESS_UNSTABLE erkennt spezifisch Gamma-Panik-Dynamik (Backwardation
+ VVIX-Spitze + negatives Gamma), nicht einfach "Markt fällt stark".** Das
ist architektonisch korrekt für das, was der Klassifikator misst, aber eine
wichtige Nuance: grindende Bärenmärkte wie 2022 lösen STRESS_UNSTABLE
möglicherweise nicht zuverlässig aus.

## Ergebnis 2 — Vorwärtsrenditen je Regime, echte CBOE-Strategie-Indizes

Sharpe-artige Kennzahl (Mittelwert/Standardabweichung, annualisiert) je
Regime und Horizont:

| Regime | PUT h5/h10/h21 | BXM h5/h10/h21 | CLL h5/h10/h21 |
|---|---|---|---|
| POST_PANIC_REVERSION | 1,33 / 1,34 / 0,39 | 1,65 / 1,62 / 0,55 | 2,53 / 1,49 / 1,34 |
| BULL_FRAGILE | 1,08 / 0,86 / 0,94 | 0,06 / 0,27 / 0,69 | 0,96 / 0,52 / 1,11 |
| STRESS_UNSTABLE | 0,77 / 0,63 / 0,78 | 0,84 / 0,67 / 0,75 | 0,84 / 1,09 / 1,01 |
| NEUTRAL | 0,75 / 0,84 / 0,90 | 0,66 / 0,73 / 0,78 | 0,66 / 0,67 / 0,75 |
| BULL_QUIET | 0,70 / 0,79 / 0,50 | 0,39 / 0,59 / 0,38 | 0,79 / 0,99 / 0,80 |

n je Regime (Handelstage / eigenständige Episoden): NEUTRAL 1908/574,
BULL_QUIET 991/416, STRESS_UNSTABLE 428/176, BULL_FRAGILE 119/71,
POST_PANIC_REVERSION 79/44.

### Einordnung gegen die Architektur-Behauptungen

**POST_PANIC_REVERSION als "beste Selling-Phase" (CSP/Wheel, Covered Call):
✅ stark bestätigt, aber horizontabhängig.** Bei 5-10 Handelstagen mit
Abstand beste Sharpe-Werte in allen drei Indizes (PUT 1,33-1,34, BXM
1,62-1,65, CLL bis 2,53). Der Effekt zerfällt bis Tag 21 fast vollständig —
ökonomisch plausibel: IV-Crush nach einer Panik ist schnell, die Prämie wird
in den ersten 1-2 Wochen geerntet, nicht gleichmäßig über einen Monat
verteilt. **Praktische Konsequenz für die Architektur:** die Empfehlung
sollte einen kurzen Aktions-Horizont betonen, nicht nur "beste
Selling-Phase" allgemein.

**BULL_FRAGILE als Collar/Protective-Put-Bedarf: ✅ bestätigt bei 21 Tagen**
(CLL-Sharpe 1,11, höchster Wert unter den "ruhigen" Regimes, vor BULL_QUIET
0,80 und NEUTRAL 0,75), **uneinheitlich bei kürzeren Horizonten** (h5=0,96,
h10=0,52 — nicht monoton). Insgesamt stützend, aber weniger sauber als der
POST_PANIC_REVERSION-Befund.

**STRESS_UNSTABLE als "selektiv defensiv":** Sharpe-Werte solide positiv in
allen drei Indizes (0,63-1,09), keine Katastrophen-Werte — stützt die
Architektur-Entscheidung, dieses Regime NICHT pauschal zu sperren, sondern
strukturabhängig zu differenzieren.

## Ehrliche Einschränkungen

- Datenquellen sind öffentliche GitHub-Archive (SqueezeMetrics-Ursprung,
  CBOE-CDN direkt), nicht durchgängig gegen die offizielle Primärquelle
  Punkt-für-Punkt abgeglichen — stichprobenartig gegen bekannte Ereignisse
  plausibilisiert (s. oben).
- POST_PANIC_REVERSION und BULL_FRAGILE haben die kleinsten Stichproben
  (79/119 Tage, 44/71 Episoden) — Ergebnisse in diese Richtung tendenziell
  weniger robust als NEUTRAL/BULL_QUIET/STRESS_UNSTABLE.
- CBOE PUT/BXM/CLL sind SPX-weite Benchmark-Indizes (systematische,
  regelbasierte Strategien) — kein 1:1-Abbild der tatsächlichen
  UIQ-Optionsmodul-Signale (Einzeltitel-Selektion, Score-Filter, Timing).
  Bestätigt die *Regime-Logik*, nicht die *konkreten UIQ-Scoring-Regeln*.
- Zeitraum 2011-2025, nicht 2007-2026 (2008-Finanzkrise fehlt aus
  Datenverfügbarkeitsgründen).

## Nebenfund — separat zu prüfen (nicht Teil dieser Validierung)

Der Report von `marcusdrewry/gex-forward-returns` referenziert
`https://squeezemetrics.com/monitor/static/DIX.csv` als aktuell (gepullt
05.06.2026) funktionierende, freie Quelle für die komplette GEX/DIX-Historie
2011-2026. Das steht im Widerspruch zur UIQ-Doku ("DIX/GEX ist tot,
HTTP 403") — möglicherweise ist nur eine andere (Live-)API-Route blockiert,
während diese statische Bulk-Historie frei zugänglich ist. **Lohnt sich für
UIQ separat zu verifizieren** — könnte den dokumentierten Datenlücken-Punkt
in SUITE.md auflösen. Nicht in dieser Session weiter untersucht.

## Nebenfund 2 — Anschlussfrage 16.08.2026: können die MCM-Paritäts-Faktoren
   den Klassifikator verbessern?

**Auslöser:** Im Rahmen der UIQ-Session vom 16.08.2026 wurde eine
MCM-Paritäts-Lücke geschlossen (4 Faktoren — `move_index`, `skew_vvix_div`,
`breadth_osc`, `distribution_days` — waren im Client seit Wochen registriert,
aber nie server-seitig implementiert, s. `MCM-PARITAET-KONZEPT.md`). Axel
fragte, ob diese fehlenden Faktoren das hier dokumentierte Backtest-Ergebnis
beeinträchtigt haben könnten und ob eine Neuauflage mit erweitertem Datensatz
angezeigt ist.

**Antwort (geprüft, nicht vermutet):** Nein, keine Kontamination. Die vier
Faktoren waren nie Input des hier getesteten Regime-Klassifikators
(`determineRegime()` — Inputs sind ausschließlich VVIX-Z-Score,
GEX/DIX-Z-Score-Proxies, SKEW-Perzentil, VIX-Termstruktur-Ratio). Sie wirken
strukturell erst auf der nachgelagerten Strategie-Gates/Ampel-Ebene, nicht
auf die hier validierte Regime-Klassifikation selbst. `dix_z20`/`gex_z20`
(ebenfalls am 16.08. Gegenstand eines Live-App-Feldpfad-Bugfixes) sind zwar
echte Klassifikator-Inputs — aber dieser Backtest bezog DIX/GEX aus einem
unabhängigen historischen Archiv (`marcusdrewry/gex-forward-returns`), nicht
aus der betroffenen Live-Pipeline. Der Live-App-Bug betraf daher mit hoher
Wahrscheinlichkeit nicht diesen Backtest.

**Aber — eigenständige, lohnende Folgefrage (keine Korrektur, echte neue
Forschung):** Könnten `distribution_days` (O'Neil/IBD, institutioneller
Abverkauf) und `breadth_osc` (McClellan) als ZUSÄTZLICHE Klassifikator-
Inputs den dokumentierten Schwachpunkt oben beheben — die beiden
Fehlklassifikationen 2022-09-13/2022-10-13 (grindender, backwardation-freier
Bärenmarkt, fälschlich NEUTRAL statt STRESS_UNSTABLE)? Beide Metriken
erkennen Breiten-/Distributionsschwäche unabhängig von Terminstruktur-
Inversion — genau die Signalart, die dem Klassifikator in diesem Szenario
fehlte. **Für eine spätere, eigene Session:** historische Distribution-Days-
und Breadth-Oszillator-Zeitreihen für 2011-2025 beschaffen (Distribution
Days aus SPY/QQQ-OHLCV selbst rekonstruierbar, s. `compute_distribution_days()`
in `market_aggregator.py`; Breadth-Oszillator schwieriger — braucht
Advance/Decline auf Scan-Universum-Ebene, nicht trivial aus öffentlichen
Archiven), dann `determineRegime()`-Portierung um diese zwei Inputs
erweitern und Ergebnis 1 (Krisentag-Erkennung) speziell für die 2022er-
Fehlklassifikationen erneut prüfen. Nicht in dieser Session begonnen.

## Reproduzierbarkeit

Alle Skripte und Rohdaten-Zwischenstände liegen in der Claude-Sandbox dieser
Session (nicht committed — Ergebnistabellen oben sind der persistente
Nachweis). Bei Bedarf für eine spätere Session neu aufsetzbar: Datenquellen
und Methodik sind oben vollständig dokumentiert für Reproduktion.

## Nachtrag — 23.08.2026: Faire Neuvalidierung regime_v1 vs. regime_v2 vs. 5-Faktor-Modell

**Anlass:** Die Notiz "Sharpe 1,66 vs. 0,63 — regime_v2 validiert" (vielfach in
Uebergabeprotokollen und SUITE.md-Umfeld zitiert) ist eine Fehlzuordnung.
Der Sharpe-1,66-Wert gehoert zum DCE-Score-Ranking-Backtest (Gate A,
Go-Kriterium 2) und hat keine Regime-Dimension — das steht bereits weiter
oben in diesem Dokument (Abschnitt "Datengrundlage"), wurde aber seither
in mehreren Sessions faelschlich als regime_v2-Validierung weitergereicht.
**Korrektur: regime_v2 wurde vor dem 23.08.2026 nie quantitativ validiert.**

**Neuvalidierung (23.08.2026):** regime_v1 (= market_regime_str-Formel),
regime_v2 (= v1 + validierte GEX<0-Override-Regel) und das hier oben
dokumentierte 5-Faktor-Modell auf identischer, primaerquellenbasierter
Datenbasis (CBOE-CDN: VIX/VIX3M/VVIX/SKEW-History, SqueezeMetrics:
DIX/GEX-Bulk-History, alle committet in data/raw_data/) und identischem
Zeitraum (2011-05-02 bis 2026-08-19, 3.843 Handelstage) verglichen —
gleiche Methodik wie oben (echte CBOE-Strategie-Indizes PUT/BXM/CLL,
Sharpe-artige Kennzahl je Regime/Horizont).

**Ergebnis:**
- regime_v2 schlaegt regime_v1 konsistent bei BULL_FRAGILE (PUT h21:
  3,72 vs. 2,82; BXM h21: 2,96 vs. 2,14) — die GEX-Override-Regel filtert
  die schwaecheren BULL_FRAGILE-Tage zuverlaessig heraus.
- regime_v2 schlaegt das 5-Faktor-Modell bei BULL_FRAGILE ebenfalls
  (dessen PUT h21: 2,61, BXM h21: 2,01).
- Das 5-Faktor-Modell zeigt bei BULL_QUIET durchgehend schwaechere Werte
  als v1/v2 (z.B. BXM h21: 0,47 vs. 0,55-0,56).
- STRESS_UNSTABLE/POST_PANIC_REVERSION vergleichbar ueber alle drei Modelle.
- DSR-Check (echte n_trials=3, einfache Long-ausser-STRESS_UNSTABLE-Regel):
  keines der drei Modelle statistisch robust gegenueber Buy & Hold nach
  Mehrfachtest-Korrektur — aber regime_v2 hat von den dreien die hoechste
  rohe Sharpe Ratio (0,80 vs. 0,76 [v1] vs. 0,62 [5-Faktor]).

**Entscheidung:** regime_v2 ersetzt market_regime_str UIQ-weit (Server +
Client). determine_mse_regime() (Python-Port des 5-Faktor-Modells,
19.08.2026) wird verworfen. Track-Record-Handling: harter Schnitt (alte
Tage behalten die alte Klassifikation, ab Umstellungsdatum gilt regime_v2)
statt rueckwirkendem Umlabeln, zum Schutz der Track-Record-Integritaet.

**Reproduzierbarkeit dieses Nachtrags:** Die vier Analyse-Skripte
(`build_panel.py`, `classify.py`, `separation_test.py`, `economic_test.py`)
liegen — wie der Rest dieser Session — bisher NUR in der Claude-Sandbox
dieser Session, NICHT committed (s. Reproduzierbarkeits-Hinweis weiter
oben in diesem Dokument, der für den gesamten Nachtrag ebenso gilt).
Ohne Nachreichung dieser Skripte ist nur das Ergebnis dokumentiert, nicht
die Berechnung selbst reproduzierbar. **Korrektur (23.08.2026, nach
Doku-Review):** eine frühere Fassung dieses Nachtrags behauptete
fälschlich, die Skripte lägen bereits committed unter
`analysis/regime_compare/` — das war zum Zeitpunkt der Erstfassung nicht
der Fall und ist hiermit richtiggestellt.
