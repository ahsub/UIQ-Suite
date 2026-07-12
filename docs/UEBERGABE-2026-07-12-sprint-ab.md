## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v5.8.1 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   Die Aussage "Feld X ist im JSON" wurde für diese Session per direkter
   Diagnose auf hochgeladenen `master_market_data.json`-Dateien verifiziert
   (siehe Diagnose-Ergebnisse unten) — das ist eine echte Ausnahme vom
   Default-Misstrauen, weil die Zahlen unten aus echten Runs stammen, nicht
   aus Behauptung. Trotzdem: die Frontend-Integration dieser Felder ist
   **nicht** erfolgt und **nicht** geprüft.

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. Axel: bitte bei nächster Gelegenheit fragen "hast du das verifiziert oder
   übernommen?", wenn ich etwas aus diesem Protokoll unkritisch wiederhole.

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# ÜBERGABEPROTOKOLL — 12.07.2026, Sprint A + B (PINE-Script-Portierung)

## Kontext

Fortsetzung der Session vom 12.07.2026 (PINE-Script-Review von 12 Scripts,
Prioritätsliste erstellt). Dieses Protokoll deckt die Implementierungsphase ab:
Sprint A, Sprint B, Diagnose Run #92/93/94, KSI-Bugfix.

**Aggregator-Version am Ende der Session: v5.8.1**
**Commits (in Reihenfolge):** `c72d500` → `495361e` → `7f2bdbdc` → `e555c56`

---

## Was in dieser Session gebaut wurde

### Sprint A — Aggregator v5.7 (Commit `c72d500ca158`)

1. **`calc_ksi()`** — Kinetic Slippage Index (HPotter). Effizienz-Indikator:
   `TrueRange² / (Volume × EMA_Vol20) × 1_000_000`. Neue Felder: `ksi`,
   `ksiSignal`, `ksiSpike`, `ksiRatio` (letzteres erst in v5.8.1 hinzugefügt,
   siehe Bugfix unten).

2. **`calc_markov()` erweitert** — gibt jetzt 4-Tupel zurück:
   `(regime, p_bull2bear, bull_pct, warn_level)`. `warnLevel` 0-3 basiert auf
   Bull-/Bear-Stickiness vs. Schwellenwert (60%/55%). **Wichtig für Folge-
   Sessions:** jeder Aufrufer von `calc_markov()` im Code muss auf die neue
   4-Tupel-Signatur geprüft werden — bei dieser Session wurde nur der eine
   bekannte Aufruf in `process_ticker()` angepasst.

3. **`calc_yang_zhang_sigma()` + `calc_ics_trend()`** — ST-EP06 Isotropic
   Trend Channel (Ata Sabanci). 6-Skalen-Konsens (Bars 3,7,13,19,29,47),
   Block-Pipeline mit Geo-Mean, log-linearer Kanal-Fitting. Neue Felder:
   `icsDirection`, `icsAngle`, `icsConsensus`, `icsConsBull`, `icsConsBear`,
   `icsChUpper`, `icsChLower`, `icsBoState`, `icsChannelPos`, `icsSigma`.

### Sprint B — Aggregator v5.8 (Commits `495361e`, `7f2bdbdc`)

4. **`reg_vp_layer.py` v1.0** (neu, 152 Zeilen) — BigBeluga Polynomial
   Regression Volume Profile. OLS Grad-2 auf `hl2×200` Bars, Volume-Bins
   relativ zur Regressionskurve. Felder: `zScore`, `pocLevel`,
   `distToPocPct`, `regTrend`, `regBaseline`, `chanHigh3sd`, `chanLow3sd`.

5. **`cluster_layer.py` v1.0** (neu, 179 Zeilen) — LuxAlgo Cluster Volume
   Profile. Volumengewichteter K-Means (k=5, 50 Iterationen), Volume Profile
   pro Cluster mit Wick-Intersect-Gewichtung. Felder:
   `nearestClusterPocDist`, `dominantClusterVol`, `clusterDelta`,
   `priceAboveDominant`, `nearestClusterPoc`.

6. **Stop Loss Clustering (Daily-Extrakt)** — direkt in `process_ticker()`,
   kein eigener Layer. Lokale Swing-Maxima/-Minima (2-Bar-Nachbarn), Cluster
   bei Swing±ATR/4. Felder: `nearestSellStopPct`, `nearestBuyStopPct`.

7. **Rohdaten-Cache** — `_closes`/`_highs`/`_lows`/`_volumes` (+`_cl`-Varianten
   für Cluster-Layer) werden temporär im result-Dict abgelegt, damit
   `reg_vp_layer.run()` und `cluster_layer.run()` Zugriff auf die Preisreihen
   haben. Werden via `.pop()` **vor** dem KV-Push wieder entfernt — **geprüft:
   Run #94-JSON enthält keine `_closes`-Keys** (siehe Diagnose unten).

### Bugfix — v5.8.1 (Commit `e555c56fb7df`)

8. **KSI-Rundungsbug.** Erste Diagnose (Run #92, manuell getriggert) zeigte
   561/660 Ticker mit `ksi=0.0` und wurde fälschlich als "Volumen-Lücke am
   letzten Bar" diagnostiziert (Fix v1: non-zero-Lookback, kommittiert, hat
   das eigentliche Problem aber **nicht** behoben — Run #94-Diagnose zeigte
   weiterhin 561×0.0). **Echte Ursache:** bei liquiden Large Caps ist der
   KSI-Rohwert ≈1e-8, `round(x, 4)` rundet das auf 0. Fix v2:
   - `round(x, 4)` → `round(x, 10)`
   - Neues Feld `ksiRatio` = KSI/Signal (dimensionslos, tickerübergreifend
     vergleichbar — das sollte in Prompts/Frontend verwendet werden, **nicht**
     der absolute `ksi`-Wert)
   - Spike-Logik von 5-Bar-Fenster-Scan zurück auf strikte Kreuzung am
     letzten non-zero Bar (Fenster-Version hatte 331 statt 117 Spikes erzeugt)
   - `calc_ksi()` Signatur geändert: gibt jetzt 4-Tupel zurück
     `(ksi, signal, spike, ratio)` statt 3-Tupel — **relevant für jeden der
     diese Funktion künftig aufruft**

---

## Diagnose-Ergebnisse (verifiziert auf echten Runs)

**WICHTIG zur Run-Nummerierung:** GitHub Actions und die Session-internen
Bezeichnungen sind auseinandergelaufen. Verifizierte Fakten unten sind an
die tatsächliche GitHub-Run-ID gebunden, nicht an das Label "#92/93/94" das
im Gespräch verwendet wurde.

### Run 29195735913 (erster manueller Trigger, v5.7 Stand, hochgeladen als "Run #92")
- 660/660 Ticker mit allen v5.7-Feldern befüllt (ksi, warnLevel, ics*)
- `warnLevel`: {0: 524, 1: 14, 2: 40, 3: 82}
- `icsDirection`: {-1: 274, 0: 13, 1: 373}
- `icsConsensus`: Median 4/6, keine 1/6-Werte
- `icsBoState`: {INSIDE: 542, BO_UP: 58, BO_DN: 60}
- **KSI-Problem entdeckt:** 561/660 Ticker mit `ksi=0.0` — zunächst als
  Volumen-Lücke fehldiagnostiziert

### Run 29196079430 (nach Sprint B + KSI-Fix-v1, hochgeladen als "Run #94" im Gespräch)
- Sprint-B-Felder alle 656-660/660 befüllt, Rohdaten-Leak-Check sauber
  (keine `_closes` etc. im JSON)
- **KSI-Fix v1 hat NICHT geholfen:** weiterhin 561/660 mit `ksi=0.0` —
  führte zur korrekten Diagnose (Rundungsproblem, nicht Volumen-Lücke)
- `ksiSpike` bei diesem Zwischenstand: 331 (durch zu lockeren 5-Fenster-Scan)

### Run 29196491464 (nach KSI-Fix-v2/v5.8.1, GitHub-Run "#94", hochgeladen als "Run #94")
- **`ksi=0.0`: 24/660** (von 561) — Fix verifiziert
- **`ksi>0`: 636/660**
- `ksiRatio`: 658/660 befüllt
- `ksiSpike`: **117** (zurück auf plausiblen Ausgangswert)
- Sprint-B-Felder unverändert stabil bei 656-660/660

**Fazit: KSI-Fix v2 ist auf einem echten Produktions-Run verifiziert, nicht
nur auf synthetischen Testdaten.** Alle Zahlen oben stammen aus tatsächlich
hochgeladenen JSON-Dateien, die programmatisch ausgewertet wurden — nicht aus
Behauptung.

---

## Offen / nicht in dieser Session erledigt

1. **KI-Prompts (`ko-prompts.js`) NICHT angepasst.** Die 23 neuen Felder aus
   Sprint A+B liegen im JSON, werden aber von keinem KI-Prompt referenziert.
   Explizit vertagt auf nächste Session, mit Vorgabe: **nur kuratierte
   Auswahl**, nicht alle 23 Felder. Vorgeschlagene Kandidaten (unverifiziert,
   da noch nicht umgesetzt): `icsChannelPos`, `icsBoState`, `ksiRatio`,
   `zScore`, `warnLevel`. Diese Auswahl wurde im Gespräch skizziert, aber
   **nicht** in `ko-prompts.js` eingebaut oder getestet.

2. **Frontend (Scanner-Karten, Alpha Desk) NICHT angepasst.** Keine der 23
   neuen Felder wird aktuell in `index.html` gerendert. Reine Backend-Arbeit
   in dieser Session.

3. **`calc_markov()`-Aufrufer-Audit nicht vollständig.** Nur der bekannte
   Aufruf in `process_ticker()` wurde auf die neue 4-Tupel-Signatur geprüft.
   Falls `calc_markov()` an anderer Stelle im Code aufgerufen wird (z.B. in
   einem der Layer-Module), würde das dort crashen. **Nicht geprüft.**

4. **SUITE.md nicht fortgeschrieben.** Diese Session hat funktional
   gearbeitet, aber die Governance-Dokumentation (SUITE.md v2.2 → v2.3 o.ä.)
   wurde nicht aktualisiert. PINE-Review-Ergebnis und Sprint A/B als
   "erledigt" sollten dort nachgetragen werden.

5. **Geparkte PINE-Ports** (aus der Prioritätsliste, unverändert offen):
   ML RSI (Zeiierman), NWO (Zeiierman), Swing Profile (BigBeluga),
   Cycloid S/R (ST-EP05), Session Edge (Daily-Extrakt).

6. **SWOT-Analyse** wurde im Gespräch erstellt (Financial-Palantir-Anspruch),
   aber **nicht** in ein Dokument (STRATEGIE.md) übertragen. Kernpunkte:
   yfinance-Single-Point-of-Failure als größte Einzelschwäche (Fallback
   Stooq/Tiingo empfohlen, nicht umgesetzt), unbesetzte Nische
   (Options-Timing + Minervini + KO-Zertifikate) als größte Stärke.

7. **`daily_market_snapshot`-Cache (SWOT-Punkt S5, Beta-Blocker) — wird
   13.07.2026 von Axel selbst implementiert, NICHT von einer Claude-Session
   aufgreifen.** Architektur-Hinweis für Konsistenz: sollte sich als
   weiterer Layer-Aufruf in `main()` einreihen (analog `reg_vp_layer`/
   `cluster_layer` von heute — try/import/`run()`/except-Fallback), vor dem
   finalen KV-Push. Owner triggert alle Tier-1-API-Calls, Ergebnis in KV,
   Beta-Tester lesen nur aus KV. **Falls eine künftige Session dies im
   Backlog vorfindet und der Cache bereits existiert: erst prüfen ob Axels
   Implementierung schon läuft, bevor irgendetwas daran verändert wird.**

---

## Technische Referenzen für Folge-Sessions

- **Layer-Aufrufreihenfolge in `main()`** (Zeile ~4770ff, ungefähr — bei
  Bearbeitung neu grep'en): `fin_layer` → `iv_layer` → `reg_vp_layer` →
  `cluster_layer` → `val_layer` → Backup/KV-Push
- **Layer-Integrationsmuster:** try/import/`run(results=results)`/except mit
  `setdefault(None)`-Fallback für alle neuen Felder — bei Erweiterung dieses
  Muster beibehalten
- **PAT dieser Session:** 7-Tage-Token (repo-scoped), **muss nach dieser
  Session gelöscht werden** — Axel bitte in GitHub-Settings prüfen und
  entfernen. Token-Wert bewusst nicht in diesem Dokument, da GitHub Secret
  Scanning den Commit sonst blockiert (siehe Push-Fehler dieser Session).
- Workflow-ID `298819243`, manuelle Trigger via
  `POST /repos/ahsub/ko-aggregator/actions/workflows/298819243/dispatches`

---

*Ende Übergabeprotokoll. Nächste Session: KI-Prompt-Integration (kuratierte
Feldauswahl) + SUITE.md-Fortschreibung + `calc_markov()`-Aufrufer-Audit.*
