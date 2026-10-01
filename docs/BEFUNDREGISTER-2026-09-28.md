# UIQ — Befundregister „Großreinemachen“

**Stand:** 28.09.2026 · **Status:** Bestandsaufnahme, nichts gefixt
**Grundlage:** axel-scanner `9f016bd` · ko-modules `e82508a` · ko-aggregator `d980e76` · UIQ-Suite `75717b6` · workers `7b714e8` · ko-sync `1255425` · Live-Ausgaben MB-Briefing und Makro-Tab vom 28.09.2026
**Methode:** (1) maschineller Scan aller Repos nach direktiver Sprache, Positionsgrößen, Zielen/Trefferquoten und veralteten Statustexten (Kommentare ausgeschlossen, Treffer in Verbotslisten der Prompts herausgefiltert), jeder Treffer von Hand eingeordnet; (2) Live-Funde gegen den Code zurückverfolgt.
**Fortschreibungsregel:** Dieses Register ist die eingefrorene Ausgangsbasis vom 28.09.2026. Die Befunde R, D, U und S werden nicht rückwirkend geändert. Korrekturen, Laufzeitergebnisse und Abnahmen kommen als datierte Einträge in den Abschnitt „Nachträge“ am Ende.
**Belegstatus:** ✅ im Code verifiziert · 🔎 Ursache eingegrenzt, Laufzeitprüfung offen · ❓ Diagnose offen (nach Regel „Never guess, always correctly diagnose“ kein Fix vor Ursachenbeleg)

Ergänzt `PUBLIC-UI-BEREINIGUNG-PLAN.md`; dortige Nummern (2.x, 4.x) sind referenziert.

**Ursachen-Taxonomie (gilt für alle D-Befunde):** Jede Ursachenanalyse ordnet den Fehler genau einer Ebene zu — **Quelle** (externer Abruf) · **Transformation** (Berechnung im Aggregator/Client) · **Cache** (KV, localStorage, Snapshot) · **Prompt-Binding** (Wert erreicht die KI nicht oder falsch beschriftet) · **Darstellung** (UI-Label/Formatierung). Gefixt wird auf der Ebene, auf der der Fehler entsteht, nicht dort, wo er sichtbar wird.

---

## ADR-1 — DCE: intern vollständig, öffentlich nur Marktdiagnostik (Beschluss 28.09.2026, präzisiert)

**Intern (unverändert weiter berechnet, versioniert, protokolliert, Track Record):** gesamte DCE einschließlich Confidence, Ampel, Richtung (BUY/SELL/HOLD), Positionsgröße und Go/No-Go-Logik.

**Öffentlich zulässig — ausschließlich nachweislich berechnete Messwerte, jeweils mit Methode, Stichprobe/Fenster und Datenstand:**

| Messwert | Öffentliche Aussage | Pflichtgrenzen der Darstellung |
|---|---|---|
| Signalbreite (Ticker-Konsens) | „x % von n Titeln erfüllen das definierte Score-Kriterium (Score > 55)“ | Stichprobe, Schwelle, Zeitpunkt nennen; keine Deutung als Kaufwahrscheinlichkeit |
| CUSUM | „Strukturbruch in der VIX-Zeitreihe erkannt / nicht erkannt“ | Fenster (50 Läufe), VIX-Datenstand, Methodengrenzen; kein Hinweis auf Crash oder Handelszeitpunkt |
| EVT-VaR(95) | „Geschätzter Tagesverlust im 5-%-Extrembereich der modellierten SPY-Verlustverteilung“ | Schätzfenster (60 Tage), Konfidenzniveau, Modellannahme (GPD); ausdrücklich **keine Verlustobergrenze** und **keine Prognose** |

**Nicht öffentlich:** Confidence, Ampel, Richtung, Positionsgröße, Warnungstexte mit Handlungsbezug.

**Technische Sperren:**
1. **Eigenes, enges Ausgabeschema** (`dce_public`, Whitelist der drei Messwerte plus Metadaten), serverseitig im Aggregator erzeugt. Das vollständige interne DCE-Objekt wird **nicht** in öffentlich ausgelieferte Daten (KV/`master_market_data`, Digest) geschrieben — nicht angezeigt reicht nicht, es darf den Browser gar nicht erreichen.
2. **Keine stillen Fallbacks:** fehlende oder veraltete Eingangsdaten → `n/v` mit Ursache; unzureichende Stichprobe → keine Berechnung; widersprüchliche Eingangsdaten → keine Veröffentlichung des abgeleiteten Werts. Keine Ersatzwerte (bisher VIX = 20, VaR = −5 %). Ein Ausfall darf auch nicht indirekt über Confidence/Ampel sichtbar werden.
3. **Neuklassifizierung (intern dokumentieren):** die bisherige BUY-Logik (Mittelwert der Strategie-Scores > 0,55) ist eine Eignungs-/Schwellenquote, keine Richtungswahrscheinlichkeit — Teil des späteren Validierungsplans.

**Zwei getrennte Freigabestufen:**
- **Stufe 1 (Marktdiagnostik):** Veröffentlichung nach erfolgreicher Daten-, Methoden- und Darstellungsprüfung.
- **Stufe 2 (Confidence, Ampel, operative Entscheidung):** bleibt intern, bis (1) echte, dokumentierte Modelloutputs statt Platzhalter bzw. Heuristik vorliegen, (2) Out-of-sample-Validierung und nachvollziehbare Kalibrierung erfolgt sind und (3) deterministische Tests verhindern, dass nicht verfügbare oder nicht validierte Werte als belastbar veröffentlicht werden.
- Die Freigabe von Stufe 1 löst **keine** Freigabe von Stufe 2 aus.

Die regulatorische Einordnung der konkreten öffentlichen Darstellung bleibt von der Umsetzung und der schriftlichen Rückmeldung der Aufsicht abhängig.

## Prioritäten

- **P0** — vor jeder Beta zwingend: gegenüber der Aufsicht zugesagt, oder falsche Zahlen werden als echte Befunde ausgegeben
- **P1** — vor Beta-Start
- **P2** — Aufräumen, kein Beta-Blocker

---

## R — Regulatorik: direktive Sprache, Positionsgrößen, Performance-Angaben

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| R1 | **P0** | `ko-aggregator/dce_layer.py` `_derive_action()` (~Z. 448) → `index.html` Alpha-Desk-DCE-Anzeige in `renderAlphaDashboard()` (~Z. 26210) und MB-Client-Prompt (~Z. 24231) | Die DCE trifft laut eigenem Docstring eine „operative Entscheidung: Ampel → Positionsgröße → Richtung“ und liefert `position_size` sowie `direction` = BUY/SELL/HOLD. Beides wird im UI angezeigt, als „Position-Sizing: x % · Richtung: BUY“ in den Morning-Briefing-Prompt gespeist und von `generate_public_recommendations.js` (`buildDecisionSnapshot()`, ~Z. 1329) mit `confidence`/`mode`/`direction` in den öffentlichen Digest übernommen. Das ist das direktivste Element des Systems und die wahrscheinliche Quelle von „nur kleinste Positionsgröße“ im Briefing. | ✅ |
| R2 | **P0** | `dce_layer.py` `_collect_warnings()` (~Z. 471) | „ROTE AMPEL: Keine neuen Positionen — Kapitalschutz“, „GELBE AMPEL: Reduzierte Positionsgrößen, selektiv vorgehen“, „defensive Positionierung“ — erscheinen in UI und Briefing-Prompt (= Plan 2.12) | ✅ |
| R3 | **P0** | `market_aggregator.py` Server-MB-Prompt (~Z. 9937) | Keine einzige Regel gegen direktive Sprache; heutiges Briefing: „Selektivität ist Pflicht, keine Vollinvestition“, „nur kleinste Positionsgröße“, „enger Stopp“, „Strike mit Puffer wählen“ (= Plan 2.14) | ✅ |
| R4 | **P0** | `ko-prompts.js` `_getMorningPrompt()` (~Z. 3294–3299, Client-MB-Pfad) | Prompt-Anweisungen „Delta-positive Strategien bevorzugen“, „CSP/Wheel … bevorzugen“, „Schwache Sektoren meiden“ | ✅ |
| R5 | **P0** | `index.html` `renderCard()` (~Z. 10405), Scanner-Sortierung (~Z. 9657), `renderBacktestResults()`, `renderBacklogTracking()` | „Signal-Qualität A · 78 % Trefferquote“ je Scanner-Karte sowie Trefferquoten-Tabellen. Widerspricht der Entscheidung vom 26.09.2026 „extern keine Backtest-Kennzahlen“; Trefferquoten wirken im Public-UI wie Performance-Versprechen. | ✅ |
| R6 | P1 | `market_aggregator.py` Regime-`action`-Texte (~Z. 254, 270, 9207, 9223) und `ko-market-state.js` (~Z. 401–509) | „Positionen absichern · Fading-Short prüfen“, „Selektiv vorgehen · Nur höchste Qualität · Kein Leverage“, Gate-Notizen „Pullbacks kaufen“, „Breakouts bevorzugen“, „enger Stop“ — erscheinen als Regime-Aktion und Ampel-Notizen | ✅ |
| R7 | P1 | `market_aggregator.py` `calc_score_divergences()` (~Z. 10134, 10176) | „Swing- und MR-Strategien bevorzugen, Momentum-Setups abwarten“, „Positionsgrößen reduzieren, Breakout-Setups pausieren“ (= Plan 2.11) | ✅ |
| R8 | P1 | `index.html` Einzelstellen | `calcBullIndicator()`: „Panik-Niveau = Kontraindikator **kaufen!**“ · `updateScoreDivergenceDisplay()`: „Hebel reduzieren“, „Breakout-Setups bevorzugen“ · `ivpLabel()`: „IV niedrig — CSP meiden“ · `renderVixAmpel()`: „Selektiv vorgehen“ · Sektor-Rotationstext „selektiv vorgehen“ · Admin-Hinweis „Bei Correction: nur Scores ≥70 handeln“ · Institutional-Flow-Fazit „Erhöhte Selektivität bei Positionseingängen angezeigt“ · Treasury Stress „ERHÖHTES RISIKO — Selektiv“ (= Plan 2.15) | ✅ |
| R9 | P1 | `generate_public_recommendations.js` (~Z. 2176, 2198) | Digest-Prompt-Kontext „CSP meiden“, Sektortext „selektiv vorgehen“ | ✅ |
| R10 | P1 | `help.html` (~Z. 493, 863, 1081) | „Abwarten oder enger Stop“, „(handeln / abwarten / absichern)“, „Positionsgrößen reduzieren … defensiv“ | ✅ |
| R11 | P1 | Fibo-Tab, KO-Rechner, Deep-Dive, EIC-Quick-Analysis | bereits geplant: Plan 2.3, 2.5, 2.6, 4.2 (Batch 2/3) | ✅ |
| R12 | P2 | `ko-prompts.js` VCP-Prinzip (~Z. 5965) | Methodikbeschreibung „so nah wie möglich am Pivot kaufen“ — Minervini-Zitat im Prinzip-Text, im Output umformulieren lassen | ✅ |

## D — Datenintegrität: falsche oder irreführende Zahlen

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| D1 | **P0** | `index.html` `calcBullIndicator()` (~Z. 11721) | Makro-Tab zeigt „Zweig-Breadth 0,00 %“ und gleichzeitig „% über 50-EMA 100,00 %“ sowie Markov-Signal „0,0000 σ0,00“; Confluence-Score 38/100 wird daraus trotzdem berechnet. Code: beide Werte aus `tickerData` (aktuell gescannte Titel) via `processData()`; „Zweig“ ist in Wahrheit der Anteil MACD-bullischer Titel, **kein** Zweig Breadth Thrust. Ursache der 0/100-Extremwerte (fehlende Felder? Mini-Stichprobe?) zur Laufzeit prüfen. | 🔎 |
| D2 | **P0** | Server-MB-Prompt | „Termstruktur ist invers: VIX3M liegt darüber“ — sachlich falsch, VIX3M > VIX ist Contango (JSON selbst: `CONTANGO`). Prompt übergibt nur Rohwerte ohne berechnetes Label; Covered-Call-Begründung baut auf dem Fehler auf. | ✅ |
| D3 | **P0** | Server-MB-Prompt | Metrik-Zweckentfremdung: „ARM … erhöhte Implied Volatility (MOVE-Umfeld)“ — MOVE ist Treasury-Volatilität. Server-Prompt hat keinen §3a-Guardrail wie der EIC-Master-Prompt. | ✅ |
| D4 | **P0** | `dce_layer.py` `_calculate_confidence()` / `_derive_action()` + MB-Prompt-Hinweis (`index.html` ~Z. 24235) | Präzisiert nach Code-Prüfung: Die BN/HMM/NN-Platzhalter fließen derzeit **nicht** ein (`run_dce()` wird ohne `bn_data`/`hmm_data` aufgerufen). Die Confidence ist eine **handgewichtete Heuristik** (Score-Konsistenz 70 % + Regime 30 %, feste Abzüge für CUSUM, VaR, VIX) — nicht kalibriert, der Prompt nennt sie trotzdem „kalibriertes Vertrauensmaß“. Zusätzlich: `direction` = BUY, sobald der **Mittelwert der Strategie-Scores** > 0,55 ist — das ist keine Richtungswahrscheinlichkeit. Stille Fallbacks bei fehlenden Daten (VIX = 20, VaR = −5 %) erzeugen Abzüge, ohne als „n/v“ sichtbar zu sein. | ✅ |
| D5 | P1 | Server-MB | Datumskopf „2026-09-26“ bei Erstellung 28.09., Datenbasis 25.09. — vom Modell erfunden, gehört app-seitig templatet | ✅ |
| D6 | P1 | Makro-Tab Live-Preise | „S&P 500 771,35 · Nasdaq 744,5 (KV)“ sind nach Größenordnung SPY-/QQQ-ETF-Kurse; die KI übernimmt sie als Indexstände | 🔎 |
| D7 | P1 | Makro-Tab Intermarket | Alle Tagesveränderungen „— (1T)“; KI schreibt deshalb „ohne Veränderungsdaten“, während der Rohstoffblock daneben Gold −3,27 % zeigt | ❓ |
| D8 | P1 | Makro-Tab | Zinskurve zweimal mit verschiedenen Werten (2J/10J 0,18 % vs. FRED +0,31 %); KI meldet trotzdem „fehlende Daten zur Yield Curve“ → Wert erreicht den Prompt nicht | ❓ |
| D9 | P1 | Institutional Flow | Kopfzeile Score 48, KI-Text Score 51; Score rechnet mit „DIX-Proxy 45 %“ (Volumen-Heuristik), obwohl echte DIX-Werte (SqueezeMetrics, täglich frisch, verifiziert) vorliegen | ❓ |
| D10 | P1 | MB-JSON-Export | Live-Metriken (heute 14:10) und Briefing (Datenbasis Freitag) ohne Zeitstempel pro Block nebeneinander | ✅ |
| D11 | P2 | NDX Breadth | Makro: „63 % über EMA20, 25/40 Titel“; MB: „46,1 % über 50T-Linie“ — unterschiedliche Definition und Stichprobe unter ähnlichem Namen | ✅ |
| D12 | — | ARM | Score 100 als CSP-Kandidat im Briefing — Überschneidung mit laufendem Audit №72 | ✅ |

**Geprüft und entlastet:** DIX 48,2 / GEX 7,636 sind **korrekt** — `fetch_dix_gex()` bezieht täglich frische Werte kostenlos von SqueezeMetrics (Snapshots 22.–25.09. mit wechselnden Werten und korrektem Datum).

## U — Veraltete UI-Texte, Labels, toter Code

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| U1 | P1 | `index.html` (~Z. 2770) | „Echtes Markt-Level-GEX … weiterhin kostenpflichtig — Umstellung geplant sobald finanzierbar“ — überholt, SqueezeMetrics ist live | ✅ |
| U2 | P1 | Server-MB-Prompt STRUKTUR-Liste | „KO-Short“ fest verdrahtet — Konzept seit 09.09. zurückgestellt, Strategie heißt „Fading Short“ | ✅ |
| U3 | P2 | Treasury-Stress-Quellenzeile | Tippfehler „Kein Anlageberatung“ | ✅ |
| U4 | P2 | `ko-modules/ko-strategies.js` | Wird von `index.html` nicht mehr geladen, enthält aber weiter die persönlichen €2.000-/„Starter/Aufstockung“-Regeln — toter Code im öffentlichen Repo; archivieren oder entfernen | ✅ |
| U5 | P2 | `ko-ai-worker.js` (~Z. 779) | Token-Preise `null // TODO(Axel): verifizieren` — Kostenlog damit ohne $-Werte | ✅ |

## S — Sicherheit und Architektur (aus Umbauplan, zur Vollständigkeit)

| # | P | Befund | Plan |
|---|---|---|---|
| S1 | **P0** | EIC-Freischaltung per `localStorage`-PIN, beim ersten Aufruf frei setzbar | 4.1/4.2 — gegenüber Aufsicht zugesagt |
| S2 | P1 | App-PIN mit Default im öffentlichen Quelltext | 4.4 |
| S3 | erledigt | `verifyUserToken()` fail-open → fail-closed (v514) | 4.3 |
| S4 | P2 | Tier-System (`_userTier`/`_userFeatures`) existiert, wird aber nirgends ausgewertet | Beta-Nutzerverwaltung |
| S5 | **P0** | **Reale Depotangaben im öffentlichen Quelltext:** NAV-Größenordnung, Broker und Liste aktiver Positionen stehen im Prompt-Text von `workers/ko-ai-worker.js` (Repo `workers`, ~Z. 531–660) und in der Kopie `axel-scanner/workers/ko-ai.js`. Serverseitig an den Owner gebunden, aber für jeden im Repo lesbar. Entfernen aus HEAD reicht nicht vollständig — die Git-Historie behält die Angaben (Bezug №73). | neu, Batch 2 |

---

## Vorgeschlagene Batch-Zuordnung

| Batch | Inhalt | Repos | Hinweis |
|---|---|---|---|
| **1b** | R1–R4, R6, R7, R9, D2–D5, U2 | ko-aggregator, ko-modules, axel-scanner, UIQ-Suite | Kern: ADR-1 umsetzen (`dce_public`-Schema, internes DCE-Objekt aus öffentlichen Daten, keine stillen Fallbacks); beide MB-Prompts mit Prinzip-Regel gegen direktive Sprache, berechnetem Termstruktur-Label, Metrik-Bindung, templatetem Datumskopf |
| **1c** | R5, R8, R10, U1, U3 | axel-scanner | Trefferquoten aus Public-UI (Entscheidung 26.09.), Resttexte |
| **2** | S1, S2, S5, R11 (Rechner, Fibo, EIC-Quick) | axel-scanner, Worker | Owner-Gate — Zusage an die Aufsicht |
| **3** | R11 (Deep-Dive, Watchlisten + Risikohinweise), MAR-Offenlegungsblock | axel-scanner, ko-modules | Anforderung aus dem Gespräch vom 28.09. |
| **Audit** | D1, D6–D9, D11, D12 | alle | Ursachenanalyse zuerst, dann Fix — gehört zu №72 |
| **Aufräumen** | U4, U5, R12, S4 | diverse | kein Beta-Blocker |

**Nicht abgedeckt durch diesen Scan:** Inhalte, die erst zur Laufzeit von der KI erzeugt werden, jenseits der beiden geprüften Live-Ausgaben (Deep-Dive, Options-Desk, Alpha-Desk-Narrative, Digest-Texte). Dafür nach Batch 1b eine Stichprobe echter Ausgaben je Strategie.

---

## Abnahmekriterien (festgelegt 28.09.2026, vor Beginn von Batch 1b)

**AK-1 — ADR-1 Veröffentlichungsschutz, geprüft am tatsächlich Ausgelieferten.** Das interne DCE-Objekt (Confidence, Ampel, Richtung, Positionsgröße, Warnungen mit Handlungsbezug) ist in keiner öffentlichen Payload enthalten: `master_market_data`, sonstige KV-Keys hinter öffentlichen Routen, Digest, Snapshot-Archiv im Repo, API-Antworten der Worker. Auch abgeleitete Texte (Warnungen, Ampeltexte, Prompt-Kontexte) dürfen gesperrte Werte nicht rekonstruierbar machen. Der Test prüft die real ausgelieferte Antwort (Abruf der Endpunkte, Inhalt der Snapshot-Dateien), nicht das Objekt, das der Renderer verwendet.

**AK-2 — Sprachbereinigung erst nach Stichprobe echter KI-Ausgaben abgeschlossen.** Nach Batch 1b wird je Bereich mindestens eine echte Ausgabe geprüft: Morning Briefing (Server- und Client-Weg getrennt), Makroanalyse (auch mit fehlenden oder widersprüchlichen Eingangsdaten), Optionen (CSP, Wheel, Covered Call, KO-bezogene Inhalte), Alpha Desk (Narrative und DCE-Marktdiagnostik). Geprüft wird ausdrücklich auch, ob die KI aus deskriptiven Messwerten selbst wieder Handlungsempfehlungen ableitet. Vorher gilt die Bereinigung als nicht abgeschlossen.

**AK-3 — D1 und D2: beide P0, getrennte Abnahme.**
- **D1:** Laufzeitursache der Extremwerte belegt (Taxonomie-Ebene benannt), fehlerhafte Eingangswerte ausgeschlossen, und ungültige Scores werden nicht veröffentlicht (`n/v` statt Score).
- **D2:** Termstruktur-Label stammt aus einer deterministisch getesteten Funktion (positive und negative Testfälle: Contango, Backwardation, Gleichstand, fehlender Wert); das Sprachmodell interpretiert die Rohwerte nicht mehr frei.

**AK-4 — Zusagen gegenüber der Aufsicht erst mit belegtem Deployment erfüllt.** EIC-Sperre, Entfernung der privaten Hilfsrechner und Positionsgrößen-Hinweise gelten erst dann als umgesetzt, wenn sie für einen gewöhnlichen Nutzer ohne Owner-Berechtigung nachweislich nicht erreichbar sind — dokumentiert mit Commit, Deployment-Stand und Testergebnis in der privaten Akte (`uiq-legal`).

---

## Nachträge

### 28.09.2026 abends — D13 (aus Literatur-Review Alexander, *Market Models*, gegen Code verifiziert)

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| D13 | **P0** (für ADR-1 Stufe 1) | `ko-aggregator/dce_layer.py` `_calculate_evt_var()` (~Z. 364), Eingabe `spy_returns_60d` aus `market_aggregator.py` (~Z. 11476, `[-60:]`) | Schwelle = 5-%-Quantil von 60 Tagesrenditen → genau 3 Werte darunter; GPD-Fit verlangt `len(excess) > 3` → greift praktisch nie (Simulation 2.000 × 60 Renditen: 0 % Fits). Tatsächlich geliefert wird immer der Fallback `np.percentile(arr, 1)` = empirisches 1-%-Quantil der letzten 60 Tage (≈ schlechtester Tag). Bezeichnung „EVT-VaR(95)“ doppelt unzutreffend (keine EVT, nicht 95 %). Ebene laut Taxonomie: **Transformation**. Vor jeder Veröffentlichung als DCE-Marktdiagnostik: entweder ausreichendes Schätzfenster mit validiertem GPD-Fit und Überschreitungs-Backtest oder ehrliche Bezeichnung („größter Tagesverlust der letzten 60 Handelstage“). | ✅ |

### 29.09.2026 früh — D14 (aus präregistrierter Replikation H2-Ext, `regime-test`)

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| D14 | P1 (für №72, Prüfung der Overlay-Schwellen) | `ko-aggregator/market_aggregator.py` `calc_pcr_proxy()` + `apply_macro_risk_overlay()` (Schwellen < 0,75 „Gier“ / > 1,10 „Panik“); Stand der Proxy-Formel wie im H2-Audit eingefroren (Commit `41a37fd`) | Die „Gier“-Überzeichnung des VIX-basierten PCR-Proxys gegenüber der echten Cboe-Total-PCR ist **nicht stabil, sondern regimeabhängig**. Anteil „Gier“ Proxy − echt: 2009–2019 +44,5 Pp (51 % vs. 6,5 %); 07.10.2019–25.09.2026 gesamt +21,7 Pp (31,0 % vs. 9,3 %), davon Teilfenster 2019–2022 nur +2,0 Pp und Bärenmarkt 2022 +1,5 Pp, Teilfenster 2023–2026 +38,9 Pp. In Stress-/Hochvola-Phasen kaum Überzeichnung, in ruhigen Phasen ausgeprägt. Die 2009–2019 skalenbereinigten Schwellen 0,93/1,16 übertragen schlecht (κ 0,11 statt 0,24). Folgerung für №72: Eine feste Schwellenverschiebung am Overlay korrigiert die Abweichung nicht zuverlässig; Overlay-Regeln auf dem Proxy erzeugen in ruhigen Märkten systematisch zu viele „Gier“-Zustände. Zustandsübereinstimmung Proxy ↔ echte PCR weiterhin ≈ Zufall (κ 0,036), Rangassoziation Total-PCR ↔ VIX gering (\|ρ\| 0,21) → stützt die Umbenennung in „VIX-Stress-Proxy“. Ebene laut Taxonomie: **Transformation** (Proxy-Formel/Schwellen) und **Darstellung** (Bezeichnung „PCR“). Belege: `regime-test/docs/preregistration/H2_EXTENSION_2020_2026.md` Rev. 3 (`d9fe86f`), `run_h2_extension.py` (`b804a0e`), Ergebnis `results/h2_extension/H2_ext.md` (`3e13c75`); Roadmap H2-Ext (`cad19bf`). Nur deskriptiv – keine Aussage über Renditen oder Handelsnutzen. | ✅ |

### 29.09.2026 — S6 (Snapshot-Archiv im öffentlichen Repo) und Beleg zu D4

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| S6 | **P0** | `ko-aggregator/.github/workflows/market-aggregator.yml` v1.5, Step „Archive committen“ (`git add data/snapshots/`) und Step „Upload artifact“; Schreiber `market_aggregator.py` ~Z. 11636 (Rolling-Window-Archiv v5.16.0) | Der Nachtlauf committete jeden vollständigen `master_market_data`-Snapshot ins **öffentliche** Repo (`data/snapshots/YYYY-MM-DD_HH.json.gz`, 175 Dateien 22.07.–29.09.2026) und lud ihn zusätzlich als Workflow-Artefakt hoch (7 Tage, für jeden eingeloggten GitHub-Nutzer abrufbar). Belegt am Snapshot `2026-09-29_01.json.gz`: `masterShortlist[].ki` bei 15 Titeln mit `positionPct`, `leverageRec`, `stopLoss`, `target`, `trigger`, `crv`, `holdingDays`, `direction`; `optionsWatchlist[].ki_eic` bei 15 Titeln mit `strikeSuggestion`, `deltaTarget`, `dte`, `premiumEstimate`; vollständiges DCE-Objekt (`direction`, `position_size`). Genau diese Felder entfernt `ko-sync` (`sanitizeMasterMarketData()`, Legal-Audit №61) für Nicht-Owner — der Filter wurde über Archiv und Artefakt vollständig umgangen. Geprüft und unauffällig: `data/fundamentals`, `data/iv_history`, `data/breadth_history`, `backups/tr_backup_latest.json` (keines der Felder). Keine weiteren Leser von `data/snapshots` außer dem ungenutzten `snapshot_reader.py` (geprüft: axel-scanner, ko-modules, UIQ-Suite, regime-test, refundex). Ebene laut Taxonomie: **Quelle** (Veröffentlichungsweg). **Maßnahme (Axel-Entscheidung 29.09.):** volles Objekt nur noch privat — Repo `ahsub/uiq-archive` (privat), Deploy Key `ko-aggregator nightly` (nur dieses Repo, Schreibrecht), Secret `ARCHIVE_DEPLOY_KEY`; Bestand übernommen (`uiq-archive` `df3921f`, Blob-Vergleich identisch); Workflow v1.6 entfernt Snapshots aus dem öffentlichen Repo-Stand und das Artefakt. **Offen:** Git-Historie des öffentlichen Repos behält die 175 Dateien — gemeinsam mit №73 (S5) entscheiden, nicht im Alleingang umschreiben. Abnahme gemäß AK-1: nach dem ersten Lauf mit v1.6 kein neuer Snapshot-Commit im öffentlichen Repo, Snapshot in `uiq-archive`, kein Artefakt am Lauf. | 🔎 Maßnahme vorbereitet, nicht live |

**Beleg zu D4 (DCE-Richtung), nachgerechnet 29.09.:** Über alle 38 Handelstage mit DCE-Objekt im Archiv (04.08.–28.09.2026) lieferte die DCE ausnahmslos `SELL` + `GREEN`, Confidence 70–72; der Konsens lag bei 0,203–0,325 (BUY erst > 0,55, SELL < 0,45). Der Konsens mittelt selektive Filter-Scores und ist dadurch strukturell niedrig; die Richtung trägt im gesamten Zeitraum keine Information. Selbsttest: gespeicherter Konsens aus Tickerdaten exakt reproduziert. Rechnung: `uiq-devtools/breadth-divergenz/analyze.py` 1.0.0 (`0377c72`). Ebene: **Transformation**. Die zugleich sichtbare echte Breite-Divergenz ist Forschungsnotiz H12 der Regime-Roadmap (angelegt als H6 in `4c88c0c`, umbenannt in `0fff17f` wegen Kollision mit H6 „TIP-Canary“), kein D-Befund.

### 30.09.2026 — DCE-Trennung (Runmap 2, Nacht A): neuer Befund D15, Bestätigung D13, Entscheidungen E1–E4

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| D15 | **P0** (für ADR-1 Stufe 1) | `ko-aggregator/dce_layer.py` `_check_cusum()` (~Z. 348) und Puffer-Persistenz (`market_aggregator.py` ~Z. 11531–11552, `meta.dce_cusum_buffer`) | **Zwei unabhängige Gründe, warum der CUSUM-Alarm nie auslösen kann.** (1) Die Statistik `Σ(x − mean) > 3·std` läuft über denselben Puffer, aus dem `mean` berechnet wird; diese Summe ist mathematisch immer 0 (Rundungsrauschen ~1e-14; Simulation 2.000 Puffer). (2) Der Puffer wird nie persistiert: `cusum_buffer` hat in allen 133 Archiv-Snapshots (54 Handelstage, 04.08.–30.09.) Länge 1; unter 10 Werten gibt die Funktion immer `False` zurück. `cusum_alarm = False` an 133/133 Snapshots. Ebene laut Taxonomie: **Transformation** (Statistik) und **Persistenz** (Puffer). „Kein Strukturbruch erkannt“ wäre eine Konstante, keine Messung. | ✅ belegt · öffentlich `n/v` (E1) · Korrektur nur als eigenes Paket mit Präregistrierung |
| D13 (Bestätigung) | – | s. D13 | Am Archiv bestätigt: `var_95` nimmt über 54 Handelstage nur 4 verschiedene Werte an (−1,36 % … −1,99 %); bei n = 60 liegen unter dem 5-%-Perzentil immer genau 3 Werte (`len(excess) > 3` nie erfüllt, 5.000 Simulationen). D13 war bereits registriert; Nacht A hat es unabhängig neu hergeleitet. | ✅ · öffentlich `n/v` (E1) |

**Entscheidungen Axel + Review, 30.09.2026:**
- **E1** Stufe 1 (ADR-1) = nur Signalbreite. CUSUM: „n/v — Implementierung derzeit nicht funktionsfähig“; VaR: „n/v — bestehender EVT-Zweig nicht aktiv“. Keine Korrektur und keine Umdefinition (auch nicht als „empirisches 1-%-Perzentil“) im Rahmen der Feldflussänderung — eigenes Paket mit Präregistrierung (SUITE №75).
- **E2** Internes DCE-Objekt: KV-Key `dce_internal`, Route `GET /owner/dce` (nur Owner-Token); zweite Sicherung im Worker.
- **E3** Nicht-Owner (auch Beta-Tester) erhalten keine Ampel, Confidence oder Richtung — weder in der UI noch in Payload, KV oder Digest.
- **E4** Fallback-DCE intern `fallback: true`, nie öffentlich; Test stellt sicher, dass ein Fallback nicht als Signal in `dce_public` landet.
- Umsetzung (lokal, Review): Aggregator v5.46.0, Worker v2.5, Generator v1.28, index.html v515. Reihenfolge: Payload-Referenz → Worker → Frontend tolerant → Aggregator → Generator → AK-1.

### 30.09.2026 — Equity-Strategien-Inventur (SUITE №72, nur Inventur, keine Änderung)

Grundlage: [`docs/AUDIT-72-EQUITY-INVENTUR-2026-09-30.md`](AUDIT-72-EQUITY-INVENTUR-2026-09-30.md) (vollständiger, unveränderter Auditbericht; Snapshot 2026-09-30_01, 738 Ticker, 14 Tage Verlauf) · Prüfskript, Ergebnis und Sättigungsverlauf: `docs/audit-72-equity/` (`equity_inventory_check.py`, `result_2026-09-30_01.json`, `saturation_history.txt`). Nichts geändert: keine Scoreänderung, keine neuen Schwellen, keine Rekalibrierung. Status: Befund, Entscheidung offen.
Unterscheiden: **Sättigung** (EQ1, EQ2) und **unvollständige Bewertungsgrundlage** (EQ4, EQ8) sind zwei getrennte Auditklassen. Ein unerreichbarer Zweig (EQ6, EQ9) ist zunächst ein Befund, kein automatischer Reparaturauftrag.

| # | Befund (Kurzfassung; Volltext im Bericht) | Vorschlag Review (P) |
|---|---|---|
| EQ1 | VCP-Leaderboard 20/20 bei 100 an 14/14 Tagen (heute 24 Titel am Deckel; Rohmaximum 130) — als Ranking nicht differenzierend | P1 |
| EQ2 | Minervini/KO-Long stark gesättigt (5–19 bzw. 1–16 Titel bei 100); `sKoLong` = Minervini-Score vor IOS-Boost ×1,0 bzw. ×0,7 ab Kurs 500, keine eigene KO-Bewertung | P1 |
| EQ3 | IOS-Leader-Boost (+10, Deckel 100, nach dem Sigmoid) erklärt alle Abweichungen der Nachrechnung (4/2/2 Titel in 3 Snapshots); `iosIsLeader` nicht persistiert → **konsistent, nicht unabhängig bewiesen**; im Docstring nicht dokumentiert | P1 (dokumentieren, `iosIsLeader` persistieren) |
| EQ4 | Dividend/Value: Fundamentaldaten für 16 von 738 Titeln; Ranking nur innerhalb Shortlist ∪ Options-Watchlist (≤ 50); Population, nicht Scorefunktion, ist das Thema | P1 (Rankingpopulation sichtbar machen) |
| EQ5 | ETF-/Krypto-Präfixfilter der Anreicherung schließt Einzeltitel aus (SHOP, SHW, SHEL, DASH, RGLD, FRSH) | P1 (Assetklassen/Population sichtbar) |
| EQ6 | Sektor-RS-Boost bei Fading toter Code (`_sector_rs5` gelesen, nie gesetzt). **Verhalten nicht ändern**, da jede Korrektur Scores verschiebt | P2 |
| EQ7 | Squeeze-Gate: Doku spricht von „allen Short-Strategien“; `score_short_fading` verwendet es, `score_short_breakdown` nicht. **Ob Absicht oder Lücke, ist unbekannt** — keine Interpretation, bis die historische Entscheidung geklärt ist | P2 |
| EQ8 | Fehlender Wert = kein Bonus, kein `UNKNOWN` (`distToAvwapPct` fehlt bei 26 % aller Titel, 30 % der Minervini-Kandidaten) | P1 (`UNKNOWN`-Semantik) |
| EQ9 | Liquiditäts-Malus (Minervini −35, Breakout −25) nie erreichbar; 60 Titel mit `avgVol20 < 250k`. **Verhalten nicht ändern** | P2 |
| EQ10 | 13 Krypto-/ETF-Ticker laufen durch Aktienstrategien (LINK-USD, LTC-USD an der Spitze von `long_breakout`). Zuerst Daten-/Universumssemantik klären, nicht als „falsche Empfehlung“ bewerten | P1 (Assetklasse sichtbar) |
| EQ11 | Herkunft: Konzeptquelle ≠ numerische Schwelle ≠ Implementierungsentscheidung. Konzepte im Prompt-Layer `CITED`; Zahlenschwellen überwiegend „Gemini-Blueprint/-Fix“ (`INHERITED`/`UNVERIFIED`); Registry `rules: null` für alle zehn Strategien | P2 (vollständiges Regel-/Provenienzregister) |
| EQ12 | Sechs Scorefunktionen (Swing, MR, Breakout, Breakdown, Fading, VCP) für alle 738 Titel exakt reproduziert. **Keine Qualitätsaussage:** bestätigt die technische Deterministik des Ist-Zustands, nicht fachliche Validität, Prognosequalität oder wirtschaftliche Sinnhaftigkeit | – (entlastend) |

**Vorgeschlagene Prüf-Reihenfolge (Review 30.09.; Arbeitsplan, keine Implementierungsfreigabe):** P0 dokumentarisch einfrieren (dieser Nachtrag; keine Scoreänderung, keine neuen Schwellen, keine Rekalibrierung) → P1 Transparenz und Prüfbarkeit: (1) Regressions-Fixtures je Strategie, read-only in `uiq-devtools` (Input → echte Score-Funktion → erwarteter Output, inkl. Grenzfälle; Regressionstest des Ist-Zustands, kein Kalibrierungstest), (2) IOS-Boost dokumentieren + `iosIsLeader` persistieren, (3) Rohscore/Transformationsstufen sichtbar, (4) VCP-Spitzengruppe statt künstlicher Top-20-Differenzierung, (5) `UNKNOWN`-Semantik, (6) Asset- und Rankingpopulation sichtbar → P2 Semantikfragen (Sektor-RS, Liquiditätszweige, Squeeze-Gate, Regel-/Provenienzregister) → erst danach Veränderung. Leitlinie: erst beobachten → dann reproduzierbar machen → dann semantisch entscheiden → zuletzt verändern.

**Freigabestatus (Axel + Review, 30.09.2026):** Freigegeben sind ausschließlich die **Dokumentation** — dieser Nachtrag, der vollständige Equity-Auditbericht in `docs/` mit Prüfskript und Ergebnis — und die vorgeschlagene Prüf-Reihenfolge als Arbeitsplan. **Nicht freigegeben:** Code- oder Scoreänderungen aus EQ1–EQ12, VCP-Neukalibrierung, Änderung von Minervini-Schwellen, Änderung der KO-Logik, Implementierung von `UNKNOWN`, Änderung von Assetklassenfiltern. P1/P2 sind Entscheidungs- und Arbeitsplan, keine Implementierungsfreigabe. D13 bleibt als bestehender Befund unverändert; D15 ist der neue CUSUM-Befund („unabhängig neu hergeleitet“ ist nicht „neu entdeckt“).

### 01.10.2026 — Earnings-Gate (P1 #3): Inventurbefunde D16 und D17

Grundlage: [`docs/BEFUND-P1-3-EARNINGS-UNKNOWN-2026-10-01.md`](BEFUND-P1-3-EARNINGS-UNKNOWN-2026-10-01.md) (Snapshot `2026-10-01_01`, 738 Ticker; read-only). **Inventurbefunde, keine beschlossenen Fixes.**

| # | P | Fundstelle | Befund | Status |
|---|---|---|---|---|
| D16 | P1 | `ko-aggregator/market_aggregator.py` `compute_earnings_calendar()`, Zuweisung ~Z. 10660, `_earnings_gate()` (~Z. 2276) | **`earningsDTE = None` bedeutet „nicht abgefragt“, nicht „keine Earnings“ — ein unbekannter Zustand wird wie ein unkritischer behandelt.** Abgefragt werden nur die ersten 200 Nicht-ETF/Krypto-Ticker (`[:200]`); die Positionen 0–199 haben alle ein Datum, die übrigen 538 keins. Methode 1 (`earningsTimestamp`) prüft nicht auf Zukunft: 116 der 200 Daten sind vergangen/heute (21–71 Tage alt, z. B. AMZN −63, TSLA −71). Belastbares künftiges Datum nur bei 84 von 738 Titeln (11 %). Spitzengruppe CSP (53 bei 100): 45 von 53 (85 %) ohne belastbare Earnings-Information; Kandidaten `sCsp ≥ 50`: 259/295 (88 %). Fehler und „kein Datum“ sind nicht unterscheidbar (Debug-Log). Ebene laut Taxonomie: **Datenabdeckung / Zustandssemantik**. | Befund · Schritt 1 (additives `earningsStatus`) freigegeben, Umsetzung separat |
| D17 | P1 | `generate_public_recommendations.js` `applyEligibilityGate()` (`earningsExclusionDays = 7`) vs. `_earnings_gate()` | **Zwei Gates mit entgegengesetzter Semantik bei DTE ≤ 0.** Aggregator: `None`/DTE ≤ 0 → kein Block. Generator: `dte != null && dte < 7` ohne Untergrenze → Ausschluss `EARNINGS_TOO_CLOSE`. Am Snapshot über 15 Strategien: 68 Ausschlüsse, alle mit DTE ≤ 0, keiner mit DTE 1–6; `None` wird nie ausgeschlossen. Wirkung: Auswahl `eligible/secondary/reserve` im Digest. | Befund · **nicht ändern**, späteres eigenes Paket mit eigener Entscheidung |

**Entscheidungen Axel + Review, 01.10.2026:** (a) Generator-Gate nicht ändern, nur dokumentieren (die 68 Ausschlüsse würden die Digest-Auswahl verändern). (b) 200er-Abfragegrenze nicht ändern (Datenabdeckungs-/Laufzeitfrage). (c) Frontend separat, erst die Datensemantik im Backend. (d) Wortlaut: `UNKNOWN` = kein belastbarer Termin vorhanden; `NONE_IN_WINDOW` = Termin vorhanden, aber kein Earnings-Ereignis im geprüften Fenster; beide Fälle fallen nicht zusammen. (e) D16/D17 als Inventurbefunde. **Scope Schritt 1:** `earningsStatus` im Aggregator → definierte Zustände → Weitergabe an den Digest → deterministischer Vorher/Nachher-Test. **Nicht** Teil: Score, Ranking, Kandidatenauswahl, Generator-Gate, 200er-Grenze, Frontend-Darstellung. P1 #5 (`ki_eic`) erst nach Abschluss von Schritt 1.
