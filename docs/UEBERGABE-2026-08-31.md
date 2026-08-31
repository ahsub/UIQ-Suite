# UEBERGABE-2026-08-31.md

Fortsetzung von `UEBERGABE-2026-08-30.md`. Heute: die vier Reviewer-/Regex-/
Kanonisierungs-Prioritäten (0–3) aus dem Plan von gestern additiv umgesetzt
und live verifiziert, ein regime_v2-Missverständnis aus dem eigenen
Gedächtnis aufgeklärt (Code war korrekt, die Notiz veraltet), ein
Sicherheitsvorfall (geleakter Anthropic-API-Key) durchgängig bis zur
Behebung begleitet, und ein umfangreiches, mehrstufiges Review eines
parallelen Regime-Vergleichsprojekts (`ahsub/regime-test`) durchgeführt.
Priorität 4 (Live-Tests der vier verbleibenden Options-Strategien) konnte
wegen eines im Rahmen der Fehlersuche aufgebrauchten Tageslimits nicht
mehr durchgeführt werden — auf morgen verschoben.

---

## 1. Prioritäten 0–3 aus dem Plan vom 30.08. — additiv umgesetzt

### 1.1 Priorität 0 — `ko-prompts.js` v2.16.0 → v2.17.0

Externes Reviewer-Feedback zu Collar-Live-Test 2 (s. §6 im 30.08.-Protokoll)
vollständig eingearbeitet, ausschließlich am Collar-Prompt:

- **Marktrisiko-vs.-Positionsrisiko-Trennsatz** — als PFLICHT-SATZ wörtlich
  direkt nach der Überschrift, VOR der Titelliste (nicht nur in `rolle` —
  Lehre aus dem 30.08.-Fund: das Modell folgt der AUFGABE-Struktur, nicht
  der Rollenbeschreibung).
- **Ranking-Anmutungs-Fix** — bloße Namensaufzählung ("LMT / PH / NUE")
  verboten, Pflicht-Satzrahmen ("Reihenfolge ohne Wertung") vorgegeben.
- **HVP-Kompressionsregel zusätzlich strukturell verankert** — direkt in
  Unterpunkt b) jeder Kandidatenzeile, nicht mehr nur als allgemeines
  Wortverbot weiter oben (Reviewer: reines Wortverbot allein reicht
  nachweislich nicht, zwei unabhängige NUE/HVP95%-Belege vom 30.08.).
- **RSI-Kombinationslogik korrigiert** (`STRATEGIES.collar.focus[0]` +
  EIC-Zweig): RSI (hoch oder niedrig) zählt nur noch in Kombination mit
  hoher HVP + intaktem Trend, nie allein — vorher konzeptionell
  widersprüchlich möglich (RSI niedrig + Protective Put bei bereits
  gefallenem Titel).
- **"Gewinnmitnahme" ersetzt** durch neutralere Formulierung, an beiden
  Fundstellen (Public-Fokuskriterium + EIC-Zweig).

Geprüft, keine Änderung nötig: "Strategy Fit"-Vermeidung bei Collar
(Reviewer bestätigt), "Model Decision Boundary" (deckt sich inhaltlich
bereits mit Punkt d) "Modell-Grenze:"). Bewusst zurückgestellt: das
9-Punkte-Strukturschema für alle vier Options-Strategien — laut Reviewer
selbst ein größerer, eigenständiger Qualitätssprung, kein Teil dieses
Einzelzyklus.

**Verifikation:** isoliert per Node gegen Testdaten — alle neuen Elemente
im Collar-Public-Output nachgewiesen, EIC-Zweig entsprechend angepasst,
die vier scan-Strategien (csp_wheel/atmna/weekly_income/cc) strukturell
exakt unverändert (kein `holding_review`-Leck). Live verifiziert: Datei
auf `main` identisch zur vorbereiteten Version, CDN-Hash-Pin in
`index.html` zeigte korrekt auf den neuen Commit.

### 1.2 Priorität 1 — `ko-ai.js` v1.15 → v1.16

Compliance-Scanner-Regex-Lücke geschlossen (~5 Min-Fix wie geplant). Das
Pattern `strukturell\s+(unnötig|nicht\s+erforderlich)` verlangte zwingend
"strukturell" davor — beide Live-Belege vom 30.08. enthielten dieses
Präfix nicht (1. Beleg: "nicht nötig", andere Wortform; 2. Beleg:
"nicht erforderlich" ohne Präfix). Fix: Pflicht-Präfix entfernt, Pattern
auf reine Wortgrenzen-Suche verengt:
`/\b(unnötig|nicht\s+n(ö|oe)tig|nicht\s+erforderlich)\b/i`.

**Verifikation:** beide Live-Belege schlagen jetzt an, Alt-Fall mit
"strukturell ... nicht erforderlich" weiterhin erfasst (keine Regression),
harmloser Gegentest bleibt leer (kein Fehlalarm), gegen `ko-prompts.js`
v2.17.0 geprüft (keine legitime Verwendung dieser Begriffe im Prompt-Text
selbst). Live deployed (Cloudflare Worker — Hinweis: **kein**
GitHub-Actions-Workflow für diesen Worker gefunden, Deploy läuft manuell/
separat von Git-Commits, s. §3 zu offenen Backlog-Punkten).

### 1.3 Priorität 2 — `market_aggregator.py` v5.39.0 → v5.40.0

VVIX/SKEW-Kanonisierung, exakt nach dem Muster des VIX-Fixes von gestern.
Neue Funktion `fetch_vvix_skew_live()` (unabhängiger Live-Einzelwert-Fetch
für `^VVIX`/`^SKEW`, analog `fetch_vix_term()`, ohne Ratio/Spread-Konzept).
`calc_macro_zscores()` bekommt neuen optionalen Parameter
`vvix_skew_term`; `current` für beide Serien läuft jetzt kanonisch
darüber, vor dem SKEW/VVIX-Divergenz-Detektor. Log-Warnung bei >10%
Abweichung, nicht blockierend — wie beim VIX-Fix.

Hintergrund: der 30.08.-Root-Cause-Fix (`fetch_mse_history()`-
Intersection-Kopplung) schützt VIX/VVIX/SKEW zwar bereits gemeinsam, aber
nur VIX bekam zusätzlich eine unabhängige Live-Einzelwert-Kanonisierung —
VVIX/SKEW hingen weiterhin ausschließlich an `vals[-1]` der 252T-Historie.

**Verifikation:** isoliert per AST-Extraktion, echte Yahoo-Daten (`VVIX
90.26 | SKEW 149.77`) + synthetische Historie (Normalfall, >10%-Abweichung,
Fetch-Ausfall — alle drei Fälle grün). Diff gegen `main`: nur die
beabsichtigten Blöcke geändert. **Live verifiziert** über einen echten
Aggregator-Lauf: `VVIX (Live): 90.18 | SKEW (Live): 149.77` im Log an
erwarteter Stelle, `Makro Z-Scores (175T): VIX Z=-0.88 P14 | SKEW Z=0.99
P83 | VVIX Z=-0.78 P23` ohne Abweichungswarnung (alle drei Live-vs.-
Historie-Abweichungen lagen unter 10%, wie erwartet).

### 1.4 Priorität 3 — `ko-prompts.js` v2.17.0 → v2.18.0

Collar `risikoBegriff`/`risikenText` sauber getrennt (analog CC-Fund vom
29.08., fachlich anders begründet). Collar nutzte bislang den generischen
Fallback "Andienung" — falsch, weil Collar zwei unterschiedliche Seiten
hat: Protective Put (Kauf, kein Andienungsrisiko, nur Prämienkosten) vs.
voller Collar (zusätzlicher Short Call, CC-analoges Ausübungsrisiko auf
der Call-Seite). Neuer `risikoBegriff`: "Ausübung/Assignment des Short
Calls beim vollen Collar (Kursbewegung ÜBER den Call-Strike)" +
`risikenText`, der beide Fälle explizit trennt.

**Verifikation:** isoliert per Node — Collar nutzt "Andienung" nirgends
mehr generisch, CC unverändert (eigener risikoBegriff von 29.08. bleibt
exakt bestehen), csp_wheel/atmna/weekly_income nutzen weiterhin korrekt
den generischen Fallback (dort fachlich richtig). Live deployed
(Axel-Bestätigung "v2.28.0" war ein Tippfehler, live tatsächlich korrekt
v2.18.0 — per Diff gegen `main` und CDN-Pin bestätigt).

---

## 2. regime_v2-Gedächtnis-Klärung (kein Code-Fund, reine Recherche)

Axel fragte nach der Herkunft von `classify_regime_v2()` für ein
paralleles Marketstate-Vergleichsprojekt. Dabei ein Widerspruch zwischen
einem gespeicherten Gedächtniseintrag ("regime_v2-Umstellung UIQ-weit ist
PAUSIERT, wartet auf faire Neuvalidierung") und dem Code selbst
(v5.37.0-Changelog: "regime_v2 UIQ-weit übernommen") aufgefallen.

**Aufgelöst über `UIQ-Suite/docs/REGIME-BACKTEST-VALIDIERUNG.md`:** beide
Stände sind vom selben Tag (23.08.2026) — der Gedächtniseintrag war ein
veralteter Zwischenstand (nachdem der "Sharpe 1,66"-Wert als Fehlzuordnung
erkannt wurde, aber *bevor* die faire Neuvalidierung noch am selben Tag
abgeschlossen wurde). Die Neuvalidierung (regime_v1 vs. regime_v2 vs.
5-Faktor-Modell, identische CBOE-Daten, 2011–2026) bestätigte regime_v2
als besten Kandidaten (Sharpe 0,80, klar stärker bei BULL_FRAGILE) — die
Entscheidung für die UIQ-weite Umstellung war damit final, nicht pausiert.
Gedächtniseintrag entsprechend korrigiert.

**Für das Vergleichsprojekt zusätzlich bereitgestellt:** vollständige
`classify_regime_v2()`-Formel, Backtest-Historie (Krisentag-Erkennung
11/13, Sharpe je Regime/Horizont, n je Regime), der Dreiervergleich vom
23.08. inkl. DSR-Hinweis (kein Modell war DSR-signifikant gegenüber Buy &
Hold), und bekannte Limitierungen (nur 3 Rohsignale, 2008er-Krise fehlt,
Analyse-Skripte nicht committed).

---

## 3. Sicherheitsvorfall — geleakter Anthropic-API-Key

**Fund:** im Morning-Briefing-Konsolen-Log (von Axel wegen gefühlt langer
Ladezeit geteilt) fiel ein echter Anthropic-Key (`sk-ant-api03-...`) auf,
der als `token`-Parameter in Finnhub-Earnings-Calendar-Requests im
Klartext mitgeschickt wurde. Priorität sofort auf Sicherheitsvorfall
umgestellt, alles andere pausiert.

**Root Cause:** kein Code-Bug — `getFinnhubKey()`/`setFinnhubKey()` sind
reine `localStorage`-Passthrough-Funktionen ohne Vermischung. Der
Anthropic-Key war versehentlich ins "Finnhub API Key"-Feld in den
Einstellungen eingetragen worden (Copy-Paste-Verwechslung). TwelveData-
Feld war unabhängig geprüft und korrekt.

**Behebungsschritte, durchgeführt:**
1. Finnhub-Feld korrigiert (Axel).
2. Alter Anthropic-Key in der Console rotiert.
3. Neuer Key an beiden tatsächlichen Verwendungsstellen hinterlegt:
   Cloudflare-Secret `ANTHROPIC_API_KEY` am Worker `ko-ai`, und
   GitHub-Actions-Secret `ANTHROPIC_API_KEY` im Workflow
   `.github/workflows/market-aggregator.yml` (Repo `ko-aggregator`).
   Rundum-Check der übrigen Worker: `ko-sync-worker.js` nutzt keinen
   Anthropic-Bezug (nur `KO_SYNC_KV`/`OWNER_TOKEN`/`STATIC_TOKEN`),
   `ko-auth.js` ist laut Axel noch reiner Dummy, `my-cors-proxy` ist
   **nicht in GitHub versioniert** (echter Nebenfund, s. §5).

**Zwei Folgefehler beim Live-Test danach aufgetreten und behoben:**
- Neuer Anthropic-Key war ein "identity-linked" Personal/Service-Account-
  Key, nicht auf einen Workspace beschränkt → jeder Request brauchte
  zusätzlich den Header `anthropic-workspace-id` (Anthropic-Doku,
  `platform.claude.com/docs/en/manage-claude/authentication`, live
  nachgelesen). Gelöst durch Neuerstellung als workspace-scoped Key —
  kein Code-Fix nötig, bestehender Code funktioniert unverändert.
- `ko-ai`-Worker lehnte den KI-Zugangs-Token danach mit 401 ab, obwohl
  `STATIC_TOKEN` neu gesetzt wurde — Ursache war eine kurzzeitige
  Cloudflare-Edge-Propagationsverzögerung (durch mehrere Testaufrufe
  bestätigt: 4× 401, dann 1× erfolgreich durch mit anschließendem 429).
  Löste sich nach kurzer Wartezeit von selbst.

**Nebenfund, ungelöst:** der aktuell im Frontend hinterlegte
"KI-Zugangs-Token" wird vom Worker als `STATIC_TOKEN` erkannt, nicht als
`OWNER_TOKEN` (Owner-Tokens sind laut Code komplett unlimitiert —
`isOwner ? {limit:Infinity} : checkRateLimit(...)`). Axel hatte zwar den
Owner-Token eingetragen, aber der Rate-Limit-Test bestätigte eindeutig
den `STATIC_TOKEN`-Pfad. Entweder ist `OWNER_TOKEN` in Cloudflare noch
gar nicht separat gesetzt, oder es wurde versehentlich derselbe Wert wie
`STATIC_TOKEN` verwendet. **Für morgen offen.**

**Konsequenz für heute:** das reguläre Tageslimit für `ki_briefing`
(6/Tag, geteilter `STATIC_TOKEN`-Bucket) wurde durch die vielen
Testaufrufe im Rahmen der Fehlersuche aufgebraucht (6/6). Priorität 4
(Live-Tests csp_wheel/atmna/weekly_income/cc) konnte dadurch heute nicht
mehr durchgeführt werden — Reset erst um 00:00 UTC.

---

## 4. Paralleles Projekt — Regime-Vergleich (`ahsub/regime-test`)

Axel hat unabhängig ein Vergleichsprojekt aufgesetzt: `classify_regime_v2()`
gegen ein 3-Stufen-Ensemble (Markov-Switching + Rolling HMM, Pagliaro
2026). Mehrere Review-Runden eines KI-generierten Vergleichsberichts und
zugehöriger Python-Skripte durchgeführt (nicht selbst ausgeführt, keine
Zugriff auf die Projekt-CSV-Daten — durchgängig statische Code-Reviews).

**Erster Bericht (roh):** Sharpe 0,76 vs. 0,60, Rendite 417% vs. 221%
für classify_regime_v2(). Vier Einwände erhoben: (1) Renditevorsprung
vermutlich großteils Expositions-Artefakt (Ø-Position 92,7% vs. 61,9%),
(2) keine DSR/Signifikanzprüfung trotz bekanntem Mehrfachtest-Problem aus
der eigenen UIQ-Doku, (3) Drawdown-Nachteil (-20,2% vs. -16,3%) für
Optionsstrategien relevant, (4) unterschiedliche Positionsgrößen-Schemata
vermischen Regime-Erkennung mit Money-Management.

**Vier iterative Fix-Runden, jeweils mit neuen Funden:**
- v1 (`compare_approaches_fair.py`): DSR-Formel enthielt eine sich
  algebraisch selbst neutralisierende Zeile (`gamma·sr² - gamma·sr² = 0`);
  Expositions-Normierung nutzte `returns.abs().mean()` statt der
  tatsächlichen Positionsgröße; Ensemble blieb trotz Docstring-Behauptung
  bei eigenem 3-Stufen-Schema (nicht auf Collar-Position vereinheitlicht).
- v2 (`compare_approaches_fixed.py`): DSR-Formel jetzt strukturell anders,
  aber `sr_star = sr + z·se_sr` kürzte sich in der `psr`-Berechnung
  algebraisch komplett heraus (`psr = norm.cdf(-z)`, unabhängig von den
  Daten) — Signifikanztest de facto wirkungslos. Neue Normierung erzeugte
  `NaN` durch Division-durch-Null an `position==0`-Tagen (0/0 bei der
  Rendite-Rekonstruktion).
- v3 (`compare_approaches_final.py`): beide strukturellen Bugs behoben
  (SR* jetzt korrekt aus Kandidaten-Varianz, Normierung ohne
  Division-durch-Null). Neuer Fund: `scipy.stats.kurtosis()` liefert
  standardmäßig Exzess-Kurtosis, die Lo-(2002)-Formel im Skript zog
  fälschlich nochmal 3 ab (doppelte Verschiebung); `n_trials=4` und
  `len(candidate_sharpes)=5` widersprüchlich.
- v4 (`compare_approaches_final_v2.py`): beide Punkte korrekt behoben.
  Herkunft der 5 Kandidaten-Sharpes nachgefragt und von Axel
  nachgeliefert (Tabelle mit Quelle/Datum/Skript je Wert).

**Letzter noch offener methodischer Punkt (nicht mehr Code, sondern
Konzept):** mehrere der 5 Kandidaten-Sharpes stammen selbst aus internen
Grid-Search-Optimierungen (VIX-Strategie: 5 Schwellenwerte, geschätzt
~2.500 Kombinationen) — das eigentliche `n_trials` ist dadurch
wahrscheinlich weit höher als 5, aber `n_trials` und `var_sharpes`
dürfen nicht unabhängig voneinander hochskaliert werden (Axels erster
Vorschlag, `n_trials=4500` bei gleichbleibender Varianz aus den 5
Siegern einzusetzen, wäre intern inkonsistent — die Varianz der rohen
Grid-Search-Verteilung ist systematisch größer als die Varianz der
bereits selektierten Bestwerte). Vorgeschlagene, aber noch nicht
umgesetzte Lösung: zweistufige Korrektur (erst innerhalb jeder
Modellfamilie mit deren echtem internen n_trials, dann zwischen den 5
Familien-Siegern mit n_trials=5) — bräuchte die vollständigen
Grid-Search-Ergebnisverteilungen, nicht nur die Bestwerte. Für den
nächsten Lauf pragmatisch: `n_trials=5` beibehalten (intern konsistent
mit der verwendeten Varianz), aber Doku-Formulierung geschärft — n_trials=5
bewertet nur die Auswahl *zwischen* den 5 Familien, nicht die zusätzliche
Auswahl, die *innerhalb* der optimierten Familien bereits stattfand.

**Status:** Axel wollte das Skript mit `n_trials=5` und der geschärften
Formulierung laufen lassen — Ergebnis steht noch aus.

---

## 5. Neuer Backlog-Fund (heute, Nebenprodukt des Leak-Vorfalls)

`my-cors-proxy` (Cloudflare Worker, `my-cors-proxy.ahildebrand.workers.dev`)
ist **nicht in GitHub versioniert** — reiner Cloudflare-Deploy ohne
Quellcode-Historie. Kein akutes Sicherheitsproblem (kein
Anthropic-Bezug, s. §3), aber ein Bus-Factor-/Nachvollziehbarkeits-Risiko,
das ins allgemeine Backlog gehört (analog den ~38 offenen
Strategie-Ampel-Texten und dem Master-Shortlist-Python-Äquivalent aus dem
29.08.-Protokoll).

---

## 5a. Nachtrag — Dead-Code-Fund bei MCM-PARITÄT-Nachfrage

Axel fragte am Abend nach dem Umsetzungsstand von `MCM-PARITAET-KONZEPT.md`
(Konzept-Doc vom 20.07.2026, ursprünglich für den Sprint am 21.07.2026).
**Der ursprüngliche 4-Faktoren-Sprint ist vollständig umgesetzt** —
`build_server_market_context()` ruft alle vier geplanten Funktionen auf
(`calc_mcm_ndx_breadth`, `calc_mcm_intermarket_score`,
`calc_mcm_treasury_stress`, `calc_mcm_bull_indicator`) und ging seither in
zwei weiteren Nachzug-Runden (v5.14.0, v5.36.5) noch über den ursprünglichen
Plan hinaus (net_liquidity, move_index, skew_vvix_div, breadth_osc,
distribution_days).

**Dabei gefunden und noch am selben Abend gefixt:**
`build_server_market_context()` war **byte-identisch zweimal** in der Datei
definiert (Zeile 472 und Zeile 8773 im damaligen Stand). Python nutzte
durch Late-Binding ohnehin durchgängig die zweite Kopie — funktional
folgenlos, aber ein Drift-Risiko für künftige Bearbeitungen (eine
Änderung nur an der ersten, von einer Suche zuerst gefundenen Kopie hätte
beide Definitionen unbemerkt auseinanderlaufen lassen, ohne Fehler oder
Absturz). Herkunft des Duplikats unklar, vermutlich ein Merge-/
Copy-Paste-Rest aus einer der MCM-Paritäts-Nachzug-Runden.

**Fix — `market_aggregator.py` v5.40.0 → v5.41.0:** erste Kopie entfernt,
durch Verweis-Kommentar ersetzt. Verifiziert: `ast.parse()` syntaktisch
sauber, exakt eine Fundstelle für `build_server_market_context` übrig,
Diff gegen den Tagesausgangsstand zeigt nur die beabsichtigten Blöcke
(Dedup + Versionsbump, getrennt von den vier VVIX/SKEW-Blöcken aus §1.3).
Live auf `main` bestätigt: Datei identisch, `AGGREGATOR_VERSION = "5.41.0"`,
nur noch eine Definition im Live-Stand.

---

## 6. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Commit/Deploy |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.18.0 | committed, deployed (CDN-Pin `e2b75f2` bestätigt) |
| `ko-aggregator/workers/ko-ai.js` | 1.16 | committed; Deploy-Mechanismus für diesen Worker unklar (kein GHA-Workflow gefunden) — Axel bestätigt "deployed" |
| `ko-aggregator/market_aggregator.py` | 5.41.0 | committed, deployed; v5.40.0-Live-Lauf erfolgreich verifiziert, v5.41.0 (Dead-Code-Cleanup) auf `main` verifiziert, aber noch nicht durch einen eigenen Live-Lauf bestätigt (reiner strukturell-folgenloser Fix, kein neuer Lauf nötig) |
| `axel-scanner/index.html` | v486 | committed, deployed |
| Anthropic API Key (workspace-scoped) | — | rotiert, hinterlegt in Cloudflare `ko-ai` + GitHub Actions `ko-aggregator`, funktional bestätigt |
| `UIQ-Suite/SUITE.md` | — | *heute nicht angefasst, Nachzug weiterhin nötig* |

---

## 7. Plan für morgen

**Priorität 0 — `OWNER_TOKEN` sauber einrichten (s. §3).** Aktuell wird
der im Frontend hinterlegte KI-Zugangs-Token vom Worker als `STATIC_TOKEN`
erkannt, nicht als `OWNER_TOKEN` — Axel hat dadurch kein unlimitiertes
Kontingent, obwohl er Owner ist. In Cloudflare bei `ko-ai` einen
eigenständigen, von `STATIC_TOKEN` verschiedenen `OWNER_TOKEN`-Wert
setzen und denselben Wert ins Frontend eintragen. Klein, aber verhindert,
dass morgen erneut ein Tageslimit durch Testaufrufe aufgebraucht wird.

**Priorität 1 — csp_wheel/atmna/weekly_income/cc live gegen v2.18.0
testen** (ursprünglich Priorität 4 vom 30.08., heute wegen Tageslimit
nicht durchführbar). Strukturell unverändert laut isolierter Prüfung
(heute erneut bestätigt gegen v2.18.0), aber weiterhin nicht mit echtem
Modell-Output verifiziert — nur Collar durchlief bisher echte
Live-Test-Zyklen.

**Priorität 2 — Collar `risikoBegriff`/`risikenText` Live-Test.** Wurde
heute (v2.18.0) nur isoliert verifiziert, noch kein echter Live-Test mit
Modell-Output für die neue Formulierung — sinnvoll gemeinsam mit
Priorität 1 zu erledigen, da ohnehin ein frisches Tageskontingent
gebraucht wird.

**Weiterhin offen aus dem 30.08.-Protokoll (heute nicht bearbeitet):**
- VIX/VVIX/SKEW Client/Server-Aufspaltung (`#m-vix` + ~40 UI-Stellen,
  weiterhin bewusst zurückgestellt, größerer Architektur-Punkt).
- CC-Wheel-Kontext-Flag (Buy-to-Open-für-CC als Wheel-Fortsetzung).
- EIC-Schritt-7 "Handlungsempfehlung".
- Die ~38 verbleibenden Strategie-Ampel-Texte in `ko-market-state.js`.
- Deep-Dive-Live-Test, Master-Shortlist-Python-Äquivalent.

**Neu ins Backlog (heute gefunden, s. §5):** `my-cors-proxy` in GitHub
versionieren — aktuell nicht nachvollziehbar/wiederherstellbar außer über
Cloudflare selbst.

**Parallel-Projekt:** Ergebnis des `regime-test`-Laufs mit `n_trials=5`
und geschärfter Doku-Formulierung abwarten (s. §4) — kein UIQ-Kernprojekt,
aber von Axel aktiv verfolgt.

**Laufend:** `/logs?flagged=1` weiter beobachten (§3 vom 29.08. zur
Morning-Briefing-Performance bleibt ungeklärt — der heute geteilte Lauf
kam aus dem Cache, kein frischer `durationMs`-Messwert erhalten).

**Danach:** Legal Briefing an den Fachanwalt vorbereiten (Backlog №36) —
weiterhin aufgeschoben, bis die Options-Strategien einheitlich stabil und
live-getestet sind.
