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
