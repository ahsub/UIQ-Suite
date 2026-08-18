# UEBERGABE 2026-08-15 (REKONSTRUIERT 18.08.2026)

⚠️ **HINWEIS ZUR ENTSTEHUNG DIESES DOKUMENTS:** Diese Datei existierte nicht
im `docs`-Ordner, obwohl mehrere Code-Kommentare in `ko-prompts.js`,
`ko-strategy-registry.js`, `axel-scanner/index.html` und
`market_aggregator.py` explizit auf "UEBERGABE-2026-08-15.md" verweisen —
die Session hat also stattgefunden und wurde in Commit-Messages/Code-
Changelogs sorgfältig dokumentiert, das eigentliche Protokoll wurde aber
nie committed (vermutlich schlicht vergessen). Dieses Dokument ist eine
**nachträgliche Rekonstruktion (18.08.2026)** ausschließlich aus den
Code-Changelog-Kommentaren der betroffenen Dateien — KEIN Original-
Protokoll. Es fehlt daher zwangsläufig: der genaue Gesprächsverlauf,
Zwischenüberlegungen, ggf. verworfene Ansätze, und die exakte
chronologische Reihenfolge innerhalb des Tages. Was hier steht, ist auf
Code-Ebene verifizierbar (Diffs, Versionsnummern, Kommentare); was NICHT
mehr rekonstruierbar ist, wird als solches markiert.

**Repos betroffen (laut Code-Spuren):** `ahsub/ko-modules`
(`ko-prompts.js` v2.5.0→v2.5.2, `ko-strategy-registry.js` v1.0→v1.2),
`ahsub/axel-scanner` (`index.html` v460→v465), `ahsub/ko-aggregator`
(`market_aggregator.py` v5.36.2→v5.36.3).

---

## 1. DTE-Zielwert-Korrektur 30-45 (statt 21-45) + Strategie-Registry
   Schritt 1 der Migration nachgeholt (v463)

**Ausgangspunkt:** Der am 13.08.2026 über drei Runden (v458-v460) sorgfältig
verifizierte DTE-Zielwert `21` für CSP_WHEEL/CC war selbst inhaltlich
falsch — Marktstandard-Recherche (Theta-Decay-Begründung: Theta-Decay
beschleunigt sich exponentiell ab ~45 Tagen vor Verfall, unter 30 Tagen
steigt das Gamma-Risiko überproportional) ergab: korrekt ist **30-45**,
nicht 21-45. Vollständig dokumentiert in `UEBERGABE-2026-08-13.md` §4,
dort aber bewusst nicht mehr umgesetzt.

**Umsetzung (keine reine Zahlenkorrektur, strukturelle Lösung):**
`ko-strategy-registry.js` — bereits am 13.08. angelegt, aber nie
tatsächlich eingebunden — wurde jetzt erstmals als Single Source of Truth
aktiviert (Schritt 1 der Migration aus `MIGRATION-strategy-registry.md`
nachgeholt): neue `<script>`-Zeile in `axel-scanner/index.html`
(Commit-Hash `25a3294`), MUSS vor `ko-strategies.js` UND `ko-prompts.js`
laden.

Neue Helper-Funktion `getEffectiveRules()` in `ko-prompts.js`: liest
Delta/DTE aus der Registry, überschreibt NUR die DTE-untere-Grenze mit dem
nutzerseitig einstellbaren `optsCfg.dte` (außer bei `atmna`, bleibt
strategie-intrinsisch fix bei 30). Delta bleibt IMMER aus der Registry,
bewusst NICHT nutzerkonfigurierbar (Architektur-Entscheidung, bereits am
13.08. begründet: Delta ist strategie-definierende Konstante, keine
situative Markteinstellung).

**Konkrete Änderungen:**
- `ko-strategy-registry.js`: `csp_wheel.rules.deltaRange` `[0.20,0.30]→
  [0.15,0.30]`, `csp_wheel.rules.dteRange` `[21,45]→[30,45]`,
  `cc.rules.dteRange` `[21,45]→[30,45]` (Delta CC unverändert korrekt)
- `ko-prompts.js`: csp_wheel/cc-Prompts bekommen dadurch eine NEUE, bisher
  fehlende Delta-Zeile (CSP 0.15-0.30 ≈70-85% rechnerische
  Gewinnwahrscheinlichkeit, CC 0.20-0.30 unverändert)
- 4 Default-Stellen `dte:21→30` korrigiert: HTML-Eingabefeld, `getOptionsCfg()`
  Try+Catch-Fallback, `saveOptionsCfg()`-Parse-Fallback, `ko-strategies.js`
  `DEFAULT_OPTS_CFG`
- Statischer "21-45 DTE"-Text im CC-Grundlagentext (`ko-prompts.js`) auf
  "30-45 DTE" korrigiert
- Axels persönlich gespeicherter `optsCfg.dte`-Wert (33) bleibt
  unverändert — betrifft nur Neuinstallationen/geleerten `localStorage`

**NICHT in dieser Session erledigt** (erst am 18.08.2026 nachgezogen, s.
`UEBERGABE-2026-08-18.md`): die EIC-System-Prompt-Zeile
("• OPTIONS (CSP/CC/Spread): Delta 0.20–0.30 · DTE 21–45 Tage") blieb
unkorrigiert — vermutlich schlicht übersehen, da sie an einer anderen
Stelle der Datei liegt als die übrigen fünf Fundstellen.

`ko-strategy-registry.js` v1.0→v1.1, `ko-prompts.js` v2.5.0→v2.5.1.

## 2. csp_wheel-Rollregel literaturgestützt neu strukturiert (v464)

**Nicht rekonstruierbar:** der genaue Anlass/die genaue Fragestellung, die
zu dieser Recherche geführt hat.

**Ergebnis (aus Code-Kommentar):** nach 5 unabhängigen Fachquellen
(Jabbour/Budwick "The Option Trader Handbook" S.311-315, Spina "Erfolgreich
Optionen Handeln" S.98/179-196, Thomsett "Conservative Options Trading",
Friedenheim "Optionen handeln mit Köpfchen" S.37, Saliba "Option Spread
Strategies" S.29-33) wurde die bisher pauschale "roll down and out"-Regel
durch ein zweistufiges, prämienneutrales System ersetzt (`maxRollDte: 90`,
analog zu ATMNA), das nach ursprünglicher Handelsabsicht verzweigt (reine
Prämieneinnahme vs. Erwerbsabsicht).

**Kernbefund:** Jabbour/Budwick kritisieren reaktives "roll down and out"
bei bereits bedrängten CSPs explizit als Netto-Verlustgeschäft (eliminiert
Credit, verlängert Risiko); Saliba zeigt aber, dass PROAKTIVES,
prämienneutrales Rollen (wie es ATMNA bereits lebt) legitim ist — daher
`premiumNeutral` als harte Bedingung statt generellem Verbot.

**Neu:** `stopLoss: -200%` (zwei unabhängige Quellen, Spina S.194 und
Friedenheim S.37, exakt übereinstimmender Wert).

`ko-strategy-registry.js` v1.1→v1.2. **Wichtig:** `rollRules` wurde zu
diesem Zeitpunkt von KEINER Funktion konsumiert — das wurde erst am
17.08.2026 als eigener Befund entdeckt und bewusst NICHT verdrahtet
(gehört strukturell in den geplanten Options-Doktor, nicht den
Kandidaten-Scanner). Zum 15.08. war dieser Baustein also reine, noch
folgenlose Datenstruktur.

## 3. Morning-Briefing DIX/GEX-Prompt-Fix (Client + teilweise Server)

**Befund:** DIX/GEX standen im Morning-Briefing-Prompt (`_getMorningPrompt`,
`ko-prompts.js`) nur in einer nachgelagerten Stilregel, nicht in der
eigentlichen Abschnitts-Aufgabenstellung — die KI erwähnte sie dadurch
praktisch nie, obwohl die Werte im Kontext vorlagen. GEX-Text zusätzlich
von veralteter "AAPL-Proxy"-Formulierung auf "SqueezeMetrics SPY-Markt-
Level" korrigiert (EIC+Public). DIX-Text erweitert auf "S&P-500-Basis UND
ETF-Korb" (vorher nur ETF-Korb). `_dixReal`-Berechnung in `index.html`
erweitert (erkennt jetzt beide DIX-Quellen).

**Bekannter, damals offener Rest-Punkt (§5 im Original, hier aus dem
ko-aggregator-Changelog rekonstruiert):** Der serverseitige Python-Pfad
(`market_aggregator.py`, KV-gecachtes Briefing) hat eine eigene,
unabhängige Prompt-Logik — der Client-Fix deckte nur den JS-Pfad ab.
Dieser Rest-Punkt wurde NOCH AM SELBEN TAG nachgezogen: `market_aggregator.py`
v5.36.3 — `generate_daily_snapshot()` kannte DIX/GEX bis dahin serverseitig
überhaupt nicht, obwohl die Rohdaten längst in `master["market"]["dixGex"]`
vorlagen. Fix: DIX/GEX-Zeilen in `mlines`/den Prompt aufgenommen
("DIX (SqueezeMetrics, SPY-marktweit): X%").

`ko-prompts.js` v2.5.1→v2.5.2, `market_aggregator.py` v5.36.2→v5.36.3.

## 4. DIX-Feld-Nachzug für Backend-Umstrukturierung dixEtfBasket (v462)

**Ausgangspunkt:** Nach der `ko-aggregator`-Änderung vom 14.08.2026
(v5.36.2 — `dix_gex["dix"]` wird nicht mehr vom FINRA-ETF-Korb-Wert
überschrieben, stattdessen getrennt unter `dixEtfBasket*` geführt) mussten
6 Frontend-Stellen nachgezogen werden, die noch auf die alte
`dixSource==='finra_regshodaily'`-Prüfung setzten.

**Betroffene Stellen:** UI-Metrik-Widget "DIX (ETF-Korb)", Morning-
Briefing-KI-Prompt-Kontext (hier lag der schwerwiegendste Fehler — der
Text behauptete "DIX (ETF-Korb)", nutzte aber `_dg.dix`, was seit dem
Backend-Fix bereits der SqueezeMetrics-S&P-500-Wert war — inhaltlich
falsche Zuordnung, nicht nur fehlende Anzeige), Sidebar-Metriken-Widget,
Dark-Pool-Tab FINRA-DIX-Box, Dark-Pool-KI-Prompt-Kontext, `_dpDixReal`-Flag.

An allen Stellen zusätzlich NEU ergänzt (vorher gar nicht vorhanden): der
SqueezeMetrics-DIX (S&P-500-Basis) UND — nach Axel-Entscheidung — auch
SqueezeMetrics-GEX im Dark-Pool-Tab, der zuvor bewusst ausgeschlossen war
(Option-B-Entscheidung vom 10.07.2026 — galt nur der lokalen
Volumen-Heuristik, nicht echten externen Datenquellen).

## 5. Drei Nachbesserungen am selben Tag (v465)

**a) CDN-Hash-Pin ko-prompts.js nachgezogen:** war seit dem 13.08. auf
`@3361e99` eingefroren — die heutigen `ko-prompts.js`-Änderungen (§1-3
oben) liefen dadurch im Repo korrekt, wurden aber von der Live-App nie
geladen. Auf `@5446c8f` aktualisiert, per direktem CDN-Fetch verifiziert.

**b) Kritischer Syntax-Bug behoben:** Beim gemeinsamen Editieren des
Dark-Pool-KI-Prompts (`generateDpKI()`) ist eine Markdown-Überschrift
("2. Fragenlisten + Abschluss-Anweisung im Prompt") aus einer Claude-
Chat-Antwort versehentlich mit in den echten Code kopiert worden — "2."
wurde als Zahl geparst, "Fragenlisten" als unerwartetes Token, SyntaxError
ließ den gesamten umgebenden `<script>`-Block scheitern. Folge:
`toggleExpertMode` und `_optionsMaxPrice` waren komplett undefiniert,
EIC-Modus-Toggle tot (PIN wurde zwar akzeptiert, Toggle blieb aber
inaktiv). Fehlerhafte Zeile entfernt, per echtem Node.js-Parser
verifiziert (nicht nur Sichtprüfung).

**c) Ausgangsvermutung geprüft und verworfen:** `eicPinSubmit()` ruft nach
korrekter PIN-Eingabe nur `unlockEicEditor()` auf (Editor-in-Chief-
Content-Bereich), nie `toggleExpertMode()` erneut — dieser strukturelle
Zusammenhang war ursprünglich die Ausgangsvermutung für den Toggle-Bug,
hat sich aber nach Fund des echten Syntax-Fehlers (b) als nicht die
tatsächliche Ursache herausgestellt. Nicht separat gefixt, da Symptom
bereits durch (b) behoben war.

`axel-scanner/index.html` v460→v465 (5 Versionssprünge an diesem Tag).

## Reproduzierbarkeit dieser Rekonstruktion

Alle oben genannten Fakten sind direkt aus Code-Changelog-Kommentaren in
den vier genannten Dateien zitiert/paraphrasiert (Stand 18.08.2026,
`git`/`curl raw.githubusercontent.com`, öffentliche Repos). Exakte
Uhrzeiten, Gesprächsverlauf, Zwischenschritte und ggf. verworfene Ansätze
sind NICHT rekonstruierbar und fehlen bewusst, statt spekulativ ergänzt zu
werden.
