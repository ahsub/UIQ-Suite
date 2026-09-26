# UIQ Fair Value Engine — Research & Methodology Specification (17.09.2026, v2)

Status: **Spezifikation + erste echte Datenauswertung (Phase 0), kein
Produktionscode.** Ersetzt die erste Fassung vom selben Tag — Reviewer-
Feedback hat die Reihenfolge sauberer gemacht (Research vor Formel-Bau),
nicht nur Details ergänzt.

**Fortschreibung v2.1 (26.09.2026, Claude + Axel):** neuer verbindlicher
Abschnitt „Point-in-Time-Regel“ (Umsetzung SUITE.md №69 A). Anlass: der am
26.09. gefundene Look-ahead-Fehler im Regime-Gate-Backtest (SUITE.md №34) —
dieselbe Fehlerklasse darf in der Fair-Value-Forschung nicht auftreten. Die
übrigen Abschnitte sind unverändert.

## Revidierte Reihenfolge (wichtigste Änderung gegenüber v1)

```
RESEARCH v0 (Phase 0)
   │  Rohmetriken (OE-Yield, FCF-Yield, Forward-Earnings-Yield,
   │  Analyst-Upside) einzeln gegen Forward Return prüfen —
   │  noch KEIN Fair-Value-Konstrukt.
   ▼
Empirische Information vorhanden?
   ▼
Modell spezifizieren (Anker-Kombination, Ensemble-Logik)
   ▼
Parameter kalibrieren — NUR auf einem Discovery-Zeitraum
   ▼
OUT-OF-SAMPLE-TEST — auf einem NICHT zur Kalibrierung genutzten Zeitraum
   ▼
Fair-Value-Engine (Produktionscode)
   ▼
später, separate Entscheidung: DCE-Integration
```

**Warum diese Reihenfolge kritisch ist:** Ohne einen sauberen Discovery-
/Out-of-Sample-Split würde jede Parameter-Kalibrierung auf den Backtest-
Daten selbst zwangsläufig zu einem zu optimistischen Ergebnis führen
(Overfitting) — "Parameter ausprobieren → bestes Ergebnis auswählen →
denselben Zeitraum als Backtest präsentieren" ist keine Validierung. Dieser
Split wird verbindlich **vor** jeder Parameter-Festlegung eingezogen, nicht
erst am Ende geprüft.

## Terminologie-Korrektur

Die drei Bewertungsanker (Owner Earnings, FCF, Forward-PE) heißen ab jetzt
**komplementäre**, nicht **unabhängige** Anker. Mathematisch korrekt: Owner
Earnings basiert auf Net Income, FCF ist ebenfalls Cashflow-basiert, Forward
PE auf erwarteten Earnings — sie können erheblich korrelieren. Das ist kein
Problem der Methodik, aber "unabhängige Bestätigung" wäre eine falsche
Interpretation, wenn alle drei übereinstimmen.

## Reframing: drei Renditegrößen statt drei Bewertungsformeln

Wichtiger methodischer Punkt: `Fair Value_PE = Price × benchmark_PE /
peForward` ist mathematisch äquivalent zu einer Forward-Earnings-Yield-
Betrachtung (`1/peForward`). Damit lassen sich alle drei Anker in der
Forschungsphase einheitlich als **Renditegrößen** behandeln, nicht als drei
unterschiedliche Bewertungslogiken:

- **Owner-Earnings-Yield** (`ownerEarningsYield`, bereits vorhanden)
- **FCF-Yield** (`fcfYield`, bereits vorhanden)
- **Forward-Earnings-Yield** (`1/peForward`, aus vorhandenem `peForward`
  abgeleitet)

Erst nachdem diese drei (plus Analyst-Upside als Kontrollgröße) einzeln
untersucht sind, wird daraus überhaupt ein Fair-Value-Konstrukt gebaut.

## Phase 0 — Research v0: ERSTE ECHTE AUSWERTUNG (17.09.2026)

Durchgeführt gegen echte historische Daten, keine Simulation: 27 archivierte
Tages-Snapshots (`data/snapshots/*.json.gz`, öffentlich im `ko-aggregator`-
Repo, 22.07.-31.08.2026) mit `long_value`/`long_dividend`-Leaderboard-
Einträgen (inkl. Fundamentalfeldern) gegen den Track-Record-Export vom
17.09. (`tr:eval:*`) verknüpft — 312 Datensätze, 89 eindeutige Ticker.

### Datenabdeckung (wichtiger Realitätscheck)

| Feld | Abdeckung | Bemerkung |
|---|---|---|
| `peForward` | 147/312 | |
| `fcfYield` | 242/312 | |
| `roe` | 303/312 | |
| `analystUpside` | 147/312 | |
| `ownerEarningsYield` | **0/312** | Feld erst seit 09.09.2026 — alle 27 Snapshots liegen davor. **OE-vs-FCF-Redundanzfrage aktuell NICHT beantwortbar**, muss auf mehr Historie seit 09.09. warten. |
| `r7` | 312/312 | einzig vollständig abgedeckter Horizont |
| `r30` | 34/312 | zu wenig für belastbare Aussage |
| `r90` | 0/312 | Daten noch zu jung |

**Konsequenz:** Phase 0 kann aktuell nur den 7-Tage-Horizont sinnvoll
testen. Das ist eine reale Einschränkung, keine methodische Wahl — analog
zum FOMC-Befund vom 16.09. (Track Record ist noch jung).

### Ergebnisse: Spearman-Korrelation vs. r7

| Metrik | n | ρ | p |
|---|---|---|---|
| FCF-Yield | 242 | **+0,200** | 0,002 *** |
| Forward-Earnings-Yield (1/PE) | 147 | **+0,168** | 0,042 ** |
| ROE | 303 | +0,034 | 0,560 (nicht signifikant) |
| Analyst-Upside | 147 | −0,100 | 0,230 (nicht signifikant) |
| 1/PB (Book-Yield) | 145 | −0,038 | 0,648 (nicht signifikant) |

**Robustheitsprüfung (Ticker-Dedupe, je Ticker nur der früheste Eintrag,
n=89 statt 312 — echte Unabhängigkeit statt Mehrfachzählung derselben
Aktie):** Beide signifikanten Befunde bleiben in dieselbe Richtung und sogar
leicht stärker (FCF-Yield ρ=+0,217, Forward-Earnings-Yield ρ=+0,211),
allerdings mit p=0,06–0,08 (kleinere Stichprobe → weniger Power) — **kein
Artefakt weniger sich wiederholender Ticker**, aber auch noch keine robuste
Signifikanz.

Quantil-Buckets (Forward-Earnings-Yield, Q1=teuerste bis Q4=günstigste,
n≈36 je Bucket): mittlere r7-Rendite steigt sauber monoton von +0,02%
(Q1) auf +2,40% (Q4).

### Vorläufige Einordnung (NICHT final, nur Discovery-Phase)

- **FCF-Yield und Forward-Earnings-Yield zeigen ein plausibles, in die
  ökonomisch erwartete Richtung weisendes Signal** — schwach, aber nicht
  völlig informationslos, und unter Dedupe-Kontrolle stabil in der
  Richtung.
- **ROE, Analyst-Upside, Book-Yield zeigen aktuell keine nennenswerte
  Korrelation** mit dem 7-Tage-Forward-Return in dieser Stichprobe.
- **Owner-Earnings-Yield ist aktuell schlicht nicht testbar** — der
  eigentlich interessanteste Anker (Reviewer-Priorität) muss warten, bis
  genug Historie seit dem 09.09.2026 vorliegt.
- Diese Ergebnisse stammen aus **7-Tage-Returns** — für eine "Fair Value"-
  These, die eher mittelfristige Konvergenz behauptet, ist das ein kurzer
  Horizont. `r30`/`r90` müssen abgewartet werden, bevor daraus irgendeine
  Kalibrierung folgt.
- **Das ist Discovery, kein Ergebnis, auf dem man Parameter kalibrieren
  sollte** — dafür fehlt noch der Out-of-Sample-Split (s.u.) und die
  Stichprobe ist mit n=89-312 (23 Tage) für eine robuste Kalibrierung zu
  klein.

## Confidence — jetzt zwei getrennte Dimensionen (Reviewer-Korrektur)

Ursprünglich in v1: reine Datenvollständigkeit (Anzahl verfügbarer Anker).
**Das reicht nicht** — drei vorhandene Anker bedeuten nicht automatisch
hohe Sicherheit (z.B. wenn FCF stark schwankt, OE aus einem
Ausreißer-Jahr stammt, oder Forward-PE auf stark fallenden
Analystenschätzungen basiert). Ab jetzt zwei getrennte Felder:

```
fair_value_data_completeness  ∈ { A, B, C, N/A }   // wie viele Anker verfuegbar
fair_value_agreement          ∈ { HIGH, MEDIUM, LOW }  // wie einig sich die Anker sind
```

`fair_value_dispersion_pct = (max_anchor - min_anchor) / median_anchor` —
neues Pflichtfeld. Beispiel aus der Reviewer-Diskussion: OE=$180, FCF=$190,
PE=$410 → Dispersion=121% → sofort erkennbar "die Modelle sind sich
fundamental nicht einig", auch wenn `data_completeness = A` (alle drei
Anker technisch vorhanden) fälschlich hohe Sicherheit suggerieren würde.

## Backtest-Struktur, revidiert

**A. Phase 0 (Discovery) — s.o., bereits begonnen.** Für jede Rendite-
größe: Datenabdeckung, Verteilung, Spearman ρ vs. r7/r30/r90, Quantil-
Buckets, Stabilität über Zeit. Sektor-Aufsplittung erst als sekundäre
Analyse (Zellengröße bei n=312 sonst zu klein).

**B. Cross-Signal-Analyse** (nach ausreichend OE-Historie): OE-Yield vs.
FCF-Yield, OE-Yield vs. Forward-Earnings-Yield, FCF-Yield vs. Forward-
Earnings-Yield — zentrale Frage: liefert Owner Earnings tatsächlich
zusätzliche Information gegenüber FCF, oder ist es weitgehend redundant?

**C. Modell spezifizieren** — erst wenn A (und möglichst B) informativ
sind. Ensemble-Logik, Dispersion, Confidence/Agreement-Trennung (s.o.).

**D. Parameter kalibrieren** — ausschließlich auf einem klar abgegrenzten
Discovery-Zeitraum (z.B. 22.07.-31.08., der hier bereits genutzte).

**E. Out-of-Sample-Test** — auf einem Zeitraum, der NICHT für D verwendet
wurde (z.B. September/Oktober-Daten, sobald genug r7/r30 vorliegen). Erst
wenn E die Richtung/Größenordnung aus D bestätigt, gilt das Modell als
validiert.

**F. Analyst-Upside läuft in A-E immer als Kontrollgröße mit** (bereits in
der Phase-0-Tabelle oben enthalten) — Referenzfrage: liefert UIQs eigene
Fundamentalbewertung zusätzliche Information gegenüber dem bereits
vorhandenen Analysten-Konsens, oder wiederholt sie ihn nur?

## Point-in-Time-Regel (verbindlich, v2.1 — 26.09.2026)

Jede Auswertung in den Phasen A–F und jede spätere Validierung darf nur
Informationen verwenden, die **zum Entscheidungszeitpunkt tatsächlich
vorlagen**. Die Regel gilt für Fair Value und sinngemäß für jede andere
UIQ-Forschung mit Fundamental- oder Schätzdaten (u. a. №70 earnings_invest).

**PIT-1 — Nur archivierte Werte, nie nachträglich abgerufene.**
Zulässige Quellen für historische Zeitpunkte sind ausschließlich die
zum jeweiligen Zeitpunkt geschriebenen Archive:
- `ko-aggregator/data/snapshots/*.json.gz` (täglich, u. a. `fairValueV2`,
  Leaderboards mit Fundamentalfeldern),
- `ko-aggregator/data/fundamentals/<YYYY-Www>.json.gz` (FIN-Archiv,
  wöchentlich, `fin_layer.py`),
- das Earnings-Estimates-Archiv (`earnings_estimates_archive.py`) und das
  IV-Archiv.
**Verboten** ist, Werte für vergangene Tage nachträglich per API zu holen
(yfinance `.info`, Alpha Vantage, FMP o. ä.): Diese liefern den **heutigen**
Stand inkl. nachträglicher Korrekturen (Restatements, revidierte
Schätzungen, geänderte Aktienzahlen). Kurshistorie ist davon ausgenommen,
Renditen dürfen aus konsistent adjustierter Historie berechnet werden
(so bereits `tr_layer._eval_horizon()`).

**PIT-2 — Maßgeblich ist der Erfassungszeitpunkt, nicht das Berichtsdatum.**
Ein Fundamentalwert gilt ab seinem Erfassungszeitstempel (`collected` im
FIN-Shard, `valuation_timestamp` in `fairValueV2`, Erzeugungszeit des
Snapshots) als bekannt — nicht ab dem Quartalsende oder Filing-Datum, auf
das er sich bezieht. Ein FIN-Wert kann dadurch bis zu ~7 Tage alt sein; das
ist bewusst konservativ und PIT-korrekt, wird aber in jeder Auswertung als
Datenalter ausgewiesen.

**PIT-3 — Signal bei Schluss t, Rendite ab Schluss t.**
Bewertungsgrößen mit dem Kurs von Tag t (z. B. FCF-Yield) werden nur mit
Forward-Renditen verknüpft, die **nach** Schluss t beginnen
(`close[t+H] / close[t] − 1`, wie `r7/r30/r90` im Track Record). Eine
Verknüpfung mit der Rendite, die den Tag t selbst enthält, ist ein
Look-ahead-Fehler (Muster aus SUITE.md №34). Handel zum Schluss t ist
eine idealisierte Annahme und wird als solche benannt.

**PIT-4 — Verknüpfungsschlüssel ist der Handelstag, nicht der Dateiname.**
Snapshot-Dateien tragen das UTC-Datum des Laufs (z. B.
`2026-09-26_00.json.gz` = Handelstag 25.09.). Verknüpft wird über
`meta.last_trading_day` bzw. `tday`, nie über das Dateidatum. (Eine
Verknüpfung über das Dateidatum wäre um einen Tag verschoben — hier
zufällig in die konservative Richtung, bei anderen Quellen nicht
zwingend.)

**PIT-5 — Universum zum damaligen Zeitpunkt.**
Auswertungen laufen auf dem Universum, das zum jeweiligen Zeitpunkt
archiviert wurde (FIN-Archiv: `iwvConstituents`, `universeMeta`; Snapshots:
`tickers`). Die heutige Tickerliste rückwirkend zu verwenden erzeugt
Survivorship-Bias und ist unzulässig.

**PIT-6 — Archive sind unveränderlich.**
Geschriebene Snapshots, Wochen-Merges und Shards werden nie überschrieben
oder rückwirkend korrigiert. Korrekturen erfolgen als neue, datierte
Version mit Verweis; die Git-Historie ist Teil des Nachweises. Ein
Bewertungsmodell-Wechsel (z. B. `fair_value_model_version`) gilt ab
Stichtag (harter Schnitt, wie beim Track Record), ohne Neuberechnung der
Vergangenheit im Archiv — Neuberechnungen sind nur als getrennt
gekennzeichnete Forschungsläufe zulässig.

**PIT-7 — Prüfpflicht in jedem Backtest-Skript.**
Jedes Auswertungsskript dokumentiert im Kopf: Quellen mit Zeitstempel-
Feld, Signal- und Renditezeitpunkt, Umgang mit fehlenden Daten (kein
Forward-Fill ohne Begründung), Testfamilie (für DSR). Zusätzlich enthält
es einen automatischen Look-ahead-Selbsttest nach dem Muster von
`ko-aggregator/analysis/regime_gate_backtest_v2.py`
(`lookahead_selftest()`: Daten ab Tag k verändern → Positionen bzw.
Signale bis Tag k dürfen sich nicht ändern; bei Verletzung Abbruch).

**Bekanntes Risiko für PIT-1 (Beobachtung 26.09.2026, noch nicht
behoben):** Der Wochen-Merge des FIN-Archivs (`fin_layer.run()`) hängt am
UTC-Wochentag der Laufzeit (`isoweekday() == 6`). Seit der Umstellung auf
einen einzigen Lauf Mo–Fr 22:00 UTC (11.09.2026) gibt es keinen
planmäßigen Samstagslauf mehr; die Merges W38 (19.09., 00:07 UTC) und W39
(26.09., 00:32 UTC) entstanden nur, weil der Freitagslauf verspätet nach
Mitternacht startete. Startet ein Freitagslauf pünktlich, entfällt der
Merge dieser Woche, das Archiv bekäme eine Lücke (vgl. fehlende Woche
W32). Wer den Startverzug behebt, muss den Merge-Auslöser vorher
entkoppeln (z. B. Merge in `tr-backup-saturday.yml` oder an den Handelstag
statt an die Wanduhr koppeln). → Übergabe an die Diagnose des
Startverzugs (Lauf 36204811096).

## Was unverändert aus v1 gilt

- Datengrundlage-Verifikation gegen `market_aggregator.py` (Abschnitt 2 der
  Erstfassung) — `revenueGrowth`/`earningsGrowth`/`peg`/`evEbitda` weiterhin
  nicht verfügbar, DCF weiterhin zurückgestellt, Analyst-Upside weiterhin
  vom intrinsischen Fair Value getrennt gehalten (jetzt zusätzlich explizit
  als Kontrollgruppe im Backtest, s.o.).
- Explizites `N/A` bei fehlenden Voraussetzungen, kein Rateweit.
- Ausdrücklich NICHT Teil dieser Phase: DCE-Input, Strategiegewichtung,
  Kauf-/Verkaufssignal, Ranking, AI-Prompt-Integration, Public Digest,
  Portfolioentscheidung.

## Forschungsgrundsatz: kein Optimieren auf ρ (17.09.2026, Reviewer-Ergänzung)

Auch wenn später mehrere Renditegrößen unterschiedlich starke Korrelationen
zeigen (Beispiel: OE-Yield ρ=0,21, FCF-Yield ρ=0,18, PE-Yield ρ=0,16) —
**daraus NICHT automatisch Gewichtungen ableiten** (z.B. "OE 50%, FCF 30%,
PE 20%"). Das wäre bereits verdeckte Modell-Optimierung, nur eine Ebene
tiefer versteckt als eine direkt kalibrierte Formel. Die Reihenfolge bleibt
zweistufig, nicht vermischt:

1. Sind die Signale stabil genug, dass überhaupt ein Ensemble gerechtfertigt
   ist? (Frage von Phase A/B oben)
2. Erst danach, separat: wie sollte das Ensemble konstruiert werden? (Frage
   von Phase C/D oben)

ρ-Werte fließen in Frage 1 (informativ ja/nein, stabil ja/nein) ein, nicht
direkt als Gewichtungsparameter in Frage 2.

## Nächster Schritt

**Kein Produktionscode.** Sobald mehr `r30`/`r90`-Daten vorliegen (Track
Record läuft weiter) und genug Historie seit der `ownerEarningsYield`-
Einführung (09.09.) angesammelt ist: Phase 0 erneut fahren, insbesondere
für OE-Yield, dann Phase B (Cross-Signal-Analyse OE vs. FCF). Diese Datei
wird dann fortgeschrieben, nicht neu aufgesetzt.
