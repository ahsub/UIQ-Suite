## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ist eine Aussage der vorherigen Session über sich selbst —
   nicht dein eigenes Wissen. Behandle es wie eine Behauptung eines Kollegen,
   nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug, nie
   für eine schnelle Plausibilitäts-Antwort.**

6. **Bei jeder `ko-*.js`-Änderung in `ko-modules` IMMER auch prüfen, ob der
   CDN-Hash-Pin (`@HASH` in `index.html`) auf den neuen Commit zeigt.**

7. **NEU (18.08.2026): `raw.githubusercontent.com` cached teils mehrere
   Minuten, auch mit Cache-Busting-Query-Parametern.** Wenn ein gerade
   committeter Datei-Inhalt über `raw.githubusercontent.com` leer oder
   veraltet erscheint, nicht sofort von einem echten Fehler ausgehen — erst
   über die GitHub-Weboberfläche (`github.com/.../blob/main/...`) direkt
   gegenprüfen, das umgeht den Cache zuverlässig. `cdn.jsdelivr.net` (die
   Produktions-CDN) ist davon separat zu betrachten — dort gilt weiterhin
   der Hash-Pin als eigener, bewusster Cache-Mechanismus (s. Punkt 6).

8. **NEU (18.08.2026): Case-sensitive Dateisuche.** `Uebergabe-2026-08-15.MD`
   (Großbuchstaben-Präfix + `.MD`-Endung) wurde bei einer `grep`-Suche nach
   `\.md"` (klein) fälschlich als "fehlend" eingestuft, obwohl die Datei die
   ganze Zeit im Repo lag — führte zu einer unnötigen, fehlerhaften
   Rekonstruktion, die wieder verworfen werden musste. Bei
   Verzeichnis-Listings IMMER case-insensitive nach Dateiendungen suchen.

9. **NEU (18.08.2026): Downloads aus der Chat-Oberfläche können den
   Anzeige-Titel statt des echten Dateinamens verwenden** (z.B.
   "Ko trade doktor evaluator · JS" statt `ko-trade-doktor-evaluator.js`).
   Nach jedem Datei-Upload ins Repo den tatsächlichen Dateinamen im
   Web-Editor prüfen, nicht nur den Inhalt.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*
*Committed ist nicht deployed. Im Repo ist nicht live.*

---

# UEBERGABE-2026-08-18

**Session-Schwerpunkt:** Vormittags multivariate Voranalyse (Korrelation/VIF/
Feature-Importance) über die 7 neuen Konjunkturindikatoren + DIX/GEX-
Vollhistorie, dabei zwei echte Datenquellen-Probleme live gefunden und
behoben (FRED-Lizenzänderung bei `hy_spread`, eigener Truncation-Bug durch
gemeinsame `dropna()`). Mittags ein isolierter GEX<0-Regime-Backtest — Ergebnis
negativ, keine Produktionsänderung, sauber dokumentiert statt verworfen.
Nachmittags DTE-21→30-Verifikation (5 von 6 Punkten waren bereits erledigt,
nur ein Rest-Fund + Dead-Code-Cleanup `ko-strategies.js`). Den Rest des Tages
Trade-Doktor Block B-E komplett gebaut und getestet (37 Tests grün), inkl.
zweier Literatur-Cross-Checks (Lawrence für `weekly_income`, Ludwig für
`atmna` — beide bestätigten bestehende Werte weitgehend, lieferten aber auch
echte Ergänzungen). Zum Schluss eine Prioritäten-Klärung zu `premium-options`
(Warnpflicht ausgeübt, Axel hat sich für "bei UIQ bleiben" entschieden).

**Repos berührt:** `ahsub/ko-modules` (`ko-strategy-registry.js` v1.2→v1.4,
4 neue Trade-Doktor-Dateien), `ahsub/axel-scanner` (`index.html` v469→v470),
`ahsub/UIQ-Suite` (`REGIME-BACKTEST-VALIDIERUNG.md` erweitert).
**Status Phase 0:** Lead-Projekt unverändert, läuft aktiv bis Dezember-
Go/No-Go (NICHT abgeschlossen — Klarstellung am Ende des Tages nötig, s. §7).
**Zugriffsweg heute:** `curl raw.githubusercontent.com` in Sandbox (öffentliche
Repos, kein PAT), kein `claude-in-chrome` genutzt. Dateiänderungen weiterhin
per GitHub-Web-Editor durch Axel selbst committet.

---

## 1. Multivariate Voranalyse (`voranalyse_regime.py`)

**Ziel:** Vollhistorie-Analyse (2007-2026 bzw. 2011-2026 mit DIX/GEX) der 7
neuen Konjunkturindikatoren + bestehender Regime-Inputs, vor einer
Backtest-Erweiterung (vereinbart im 17.08.-Protokoll §10).

**Zwei echte Bugs live gefunden, nicht nur vermutet:**
- **`hy_spread` (FRED `BAMLH0A0HYM2`) liefert seit April 2026 nur noch ein
  rollierendes 3-Jahres-Fenster** — Lizenzänderung von ICE Data Indices,
  direkt aus dem FRED-API-`notes`-Feld verifiziert (`curl` + `fred/series/
  search`). Zog per `dropna()` das gesamte Sample auf ~2,8 Jahre zusammen.
  Fix: `SHORT_HISTORY_FEATURES`-Mechanismus — Kurzhistorie-Features aus dem
  Hauptlauf ausgeschlossen, eigener Kurzfenster-Zusatzlauf.
- **Erste Vermutung (MOVE-Index) war falsch** — durch Panel-CSV-Diagnose
  korrigiert (echtes Prinzip: verifizieren statt übernehmen, s. Pflicht-
  Header Punkt 5).

**Ergebnisse (Vollhistorie, nach Fix):**
- **GEX ist zweitwichtigster Klassifikator** für `market_regime_str` in
  Fenster B (2011+), hinter VVIX, vor NFCI (Feature-Importance 0.287).
- **`oecd_cli`↔`core_cpi_yoy`-Kollinearität ist ECHT**, kein Forward-Fill-
  Artefakt — per Monats-VIF bestätigt (VIF blieb bei Monats-Auflösung
  genauso hoch wie täglich, teils höher). `oecd_cli` sollte aus dem
  Konjunktur-Kandidatenkreis gestrichen werden (offener Punkt, s. §7).
- **Forward-Return/Sharpe-Modellierung funktioniert nicht** — alle 8
  getesteten Regressionsläufe (4 Ziele × 2 Fenster) mit negativem
  `cv_r2_mean`, teils stark (bis −3,74). Nicht weiterverfolgen wie gebaut.
- Granger-Kausalität: keine robuste Frühindikator-Bestätigung für
  `oecd_cli`/`heavy_truck`.

## 2. GEX<0-Regime-Backtest (`regime_v2_backtest.py`)

**Test:** einfache Zusatzregel (GEX<0 bei v1-BULL-Klassifikation →
Override auf STRESS_UNSTABLE) gegen die dokumentierte 2022er-
Fehlklassifikation (nur 1 STRESS_UNSTABLE-Tag im ganzen Bärenmarktjahr).

**Ergebnis: negativ, sauber dokumentiert statt verworfen.** Regel behebt
das Symptom (2022: 1→36 STRESS_UNSTABLE-Tage), aber die 2022-
Reklassifikationen zeigten NIEDRIGEREN Forward-Drawdown als die Tage, die
BULL blieben — unspezifisch, nicht gezielt. Methodik-Korrektur unterwegs:
Forward-RETURN ist das falsche Trennschärfe-Kriterium für eine Risiko-
Klassifikation (Volatility Risk Premium lässt STRESS-Phasen oft mit hohen
Folge-Returns einhergehen) — korrigiert auf Forward-Vol/Max-Drawdown.
Damit: Monotonie-Test zeigt für v1 UND v2 identische Ergebnisse — GEX<0 als
starrer Schwellenwert verändert die Gesamttrennschärfe nicht messbar.

**Entscheidung:** keine Produktionsänderung. In `REGIME-BACKTEST-
VALIDIERUNG.md` als Nebenfund 3 dokumentiert (bereits committed). Kein
weiteres Threshold-Tuning — Data-Dredging-Risiko bei viertem Testlauf auf
demselben Datensatz.

**Nebenfund 4 (eigenständig, unabhängig von GEX):** `BULL_FRAGILE` zeigt in
allen 4 Vol/Drawdown-Metriken durchgehend HÖHERE Forward-Vol als
`POST_PANIC_REVERSION` — trotz der Namensgebung. Ursache der "falschen"
Monotonie oben, nicht GEX. Offener Punkt für eigene Session (s. §7).

## 3. DTE-21→30-Verifikation + Dead-Code-Cleanup

**Ausgangslage:** 6-Punkte-Plan aus `UEBERGABE-2026-08-13.md` §4 sollte
umgesetzt werden — Verifikation ergab: **5 von 6 Punkten waren bereits
erledigt**, vermutlich in einer Session am 15.08.2026, deren Protokoll
zunächst nicht auffindbar schien (s. §6). Nur Punkt 3 (EIC-System-Prompt-
Zeile in `ko-prompts.js`, "Delta 0.20–0.30 · DTE 21–45 Tage") war noch alt
— korrigiert auf "Delta 0.15–0.30 (CSP) / 0.20–0.30 (CC/Spread) · DTE
30–45 Tage". `ko-prompts.js` v2.5.4→v2.5.5.

**Dead-Code-Fund (eigenständig, während der Verifikation entdeckt):**
`ko-strategies.js` wurde weiterhin per `<script type="module">` geladen,
aber seit dem v456-Namespace-Fix (12.08.2026) von NICHTS mehr konsumiert
— `window.KoStrategies` hatte null Aufrufstellen in `index.html`. Enthielt
zudem die veraltete, nicht aufgesplittete `Strategies.options`-Kombieintrag
(Ursprung des DTE-Drift-Bugs vom 13.08.). Script-Tag entfernt (`index.html`
v470), Original-Diff geprüft (nur die beabsichtigte Änderung, keine
Kollateralschäden), Tag-Balance-Delta exakt −1 Script-Paar wie erwartet.

## 4. Trade-Doktor Block B-E — komplett gebaut, 37 Tests grün

**Ausgangslage:** `TRADE-DOKTOR-KONZEPT.md` (12./13.08.2026) — Block B
("Design fertig, Bau offen"), Block C/D/E waren noch offen.

**Block B (`ko-trade-doktor-parser.js`):** Freitext-Parser, exakt nach
§4.1-Pseudocode. `parseTradeIdea(text, scanUniverse)` — Ticker/Strategie/
Strike/DTE/Delta extrahieren, `UNVOLLSTAENDIG`/`NICHT_IM_SCAN_UNIVERSUM`-
Fehlerzweige. 17 Tests, inkl. Referenzfall aus dem Konzeptdokument.

**Block C (`ko-trade-doktor-context.js`):** Scan-Universum-Anreicherung +
Orchestrierung (`runTradeDoktorAnalysis()` — B→C→D in einem Aufruf).

**Block D (`ko-trade-doktor-evaluator.js`):** deterministische Bewertung
gegen `KoStrategyRegistry.getRules()` (NICHT `ko-strategies.js`, das
existiert seit §3 nicht mehr) + `KoMarketState.getStrategyGates()`. Vier
Schweregrade: `GATE_VERSTOSS`, `PARAMETER_ABWEICHUNG`, `IM_ZIELBEREICH`,
und neu (nicht im Original-Konzept) **`REGELWERK_FEHLT`** — wichtiger Fund:
von den 4 möglichen Block-B-Strategien hatte ursprünglich nur `csp_wheel`/
`cc`/`atmna` ein Regelwerk in der Registry, `collar` explizit `rules:null`
(bewusst, Options-Doktor Phase 3), `weekly_income` fehlte komplett — ohne
den `REGELWERK_FEHLT`-Zweig hätte die Funktion beide Fälle stillschweigend
als "unauffällig" gemeldet.

**Block E (`ko-trade-doktor-prompt.js`):** dritter Prompt-Zweig (EIC-
Direktheit + Public-Erklärpflicht, kein BaFin-Hedging — Output ist privat).
Konsumiert ausschließlich das fertige Block-D-Ergebnis, wirft einen Fehler
statt einen falschen Prompt zu bauen, wenn versehentlich ein Block-B/C-
Fehlerobjekt reinkommt.

**Literatur-Cross-Checks (beide von Axel bereitgestellt, kritisch geprüft):**
- **T.R. Lawrence, "Options Trading... Weekly Options"** (Kap. 5-7): Die
  bereits bestehende `weekly_income`-Prompt-Definition in `ko-prompts.js`
  (Diagonal-Put-Spread: 120-DTE-Long-Put + 7-DTE-Short-Put) deckte sich
  fast exakt mit dem Buch — nur nie ins `rules`-Format übertragen. Jetzt
  nachgezogen (Registry v1.2→v1.3), plus ein neues, bisher fehlendes
  `riskPerTrade`-Feld (max 5%, empfohlen 3% des Portfolios, Buch Kap.7).
  Struktur-Entscheidung (Axel bestätigt): `dteRange`/`deltaRange` erfassen
  NUR das kurze Weekly-Bein, das lange Versicherungs-Bein bekommt ein
  separates `longPutInsurance`-Kontextfeld (Discord-Posts nennen es
  praktisch nie).
- **Eric Ludwig, "Optionen unschlagbar handeln"**: 6 unabhängige
  Zahlenwerte der bestehenden `atmna`-Regeln EXAKT bestätigt (ATM/30 DTE,
  alle 3 Roll-Stufen, `maxRollDte:90`). Drei echte Ergänzungen aufgenommen
  (Registry v1.3→v1.4): `expirationPreference` (monatlich vor Weekly),
  `checkpointDaysBeforeExpiry:5`, `postAssignmentEndgame` (asymmetrische
  1-ATM-Call-auf-200-Aktien-Technik nach Andienung — komplett neu, noch
  NICHT von Block D ausgewertet, reine Referenz-Dokumentation für später).

**Alle 4 neuen Dateien + 3 Testdateien im Repo verifiziert** (Byte-für-
Byte-Diff gegen finale Versionen) — ein Zwischenfall dabei: Datei-Downloads
aus der Chat-Oberfläche nutzten den Anzeige-Titel statt des echten
Dateinamens (`Ko trade doktor evaluator · JS` statt `ko-trade-doktor-
evaluator.js`), musste umbenannt werden; `ko-trade-doktor-context.js` kam
beim ersten Versuch leer im Repo an, zweiter Upload erfolgreich (s.
Pflicht-Header Punkte 7-9).

**NICHT eingebunden:** keine der 4 neuen Dateien ist per `<script>`-Tag in
`index.html` referenziert — bewusst, Block F (UI) fehlt noch.

## 5. Priorisierungsklärung: `premium-options` (Warnpflicht ausgeübt)

Axel fragte, ob Trade-Doktor stattdessen in `premium-options` weiterentwickelt
werden sollte (Begründung: UIQ-Arbeit "zunächst abgeschlossen"). Zwei Funde
dagegen gehalten:
1. `SUITE.md` §4 listet `premium-options` explizit als "Geparkt — Kein Build
   bis definiertem Trigger (frühestens UIQ Phase 1)".
2. Phase 0 ist NICHT abgeschlossen — Track-Record-Uhr läuft aktiv bis zum
   Dezember-Go/No-Go, und der heutige Tag hat selbst mehrere neue offene
   UIQ-Punkte erzeugt (s. §7), kein Nullstand.

Interessanter Nebenfund dabei: `premium-options` ist bereits eine
eigenständige Ludwig-Strategie-App (README: "PWA für CSP/CC/Wheel nach Eric
Ludwig", eigener 3-Stufen-Roll-Manager) — nicht leer, ~2.878 Zeilen
bestehender Code (Screener, Tradier-API, IBKR-Proxy, Journal, Markt-
Dashboard). Für eine spätere Entscheidung wichtig, aber nicht heute vertieft.

**Ergebnis:** Axel hat sich nach der Klarstellung für "bei UIQ/ko-modules
bleiben" entschieden. Keine SUITE.md-Änderung nötig.

## 6. Nebenbefund: fehlendes 15.08.-Protokoll war ein Suchfehler, keine Lücke

Erste Vermutung (keine `UEBERGABE-2026-08-15.md` im Repo) war falsch —
eigener `grep`-Filter war case-sensitiv (`\.md"` statt `\.MD"`), die Datei
`Uebergabe-2026-08-15.MD` lag die ganze Zeit da. Eine bereits begonnene
Rekonstruktion aus Code-Kommentaren wurde verworfen, nachdem Axel die echte
Datei gefunden hatte — **nicht committen, falls sie noch irgendwo als
Download vorliegt.**

## 7. Nicht bearbeitet / offen für nächste Session

**UIQ (Priorität, laut Axel-Bestätigung heute):**
1. **GEX-Einbindung ins Regime** — Feature-Importance-Befund liegt vor,
   einfache Schwellenwert-Regel hat sich nicht bewährt (s. §2). Nächster
   Schritt: sauberere Modellierung (z.B. logistische Regression) oder
   endgültig zurückstellen.
2. **Forward-Return/Sharpe-Modellierung** — durchgehend negatives R² (s.
   §1). Methodischer Neuansatz oder fallenlassen.
3. **BULL_FRAGILE vs. POST_PANIC_REVERSION Vol-Anomalie** (s. §2,
   Nebenfund 4) — eigenständige Prüfung, ob die Regime-Grenzziehung die
   tatsächliche Risikoreihenfolge korrekt abbildet.
4. **`oecd_cli` streichen** — Kollinearität mit `core_cpi_yoy` bestätigt (s.
   §1), aus dem Konjunktur-Kandidatenkreis entfernen. Kleine, unkritische
   Aufräumarbeit, kein eigener Sprint nötig.

**Trade-Doktor:**
- Block F (UI/Panel) — noch nicht begonnen, andere Aufgabenart (UI-Bau)
- Block G (Screenshot-Eingabe) — noch nicht begonnen, andere Aufgabenart
  (Bild-Extraktion)
- CapTrader-Live-Auslesen — bewusst zurückgestellt (Überschneidung mit
  Refundex OptionsDoktor, Trigger 01.10.2026, Entscheidung offen)
- `postAssignmentEndgame` (Ludwig-Technik) noch nicht von Block D
  ausgewertet — reine Referenz-Dokumentation bisher

**Standing Tasks:**
- IWV-Holdings-CSV-Update — fällig ~27.08.2026, zuletzt 27.07. aktualisiert
- Rechtsgutachten WpHG/WpIG — Axel muss noch 3-5 Screenshots ergänzen
  (seit mehreren Protokollen offen)

---

*Alle heutigen Skripte (`voranalyse_regime.py`, `regime_v2_backtest.py`)
liegen im Chat vom 18.08.2026, nicht im Repo committed — Rohdaten-Panels
lokal bei Axel unter `~/voranalyse_output/` bzw. `~/regime_v2_output/`. Alle
Trade-Doktor-Dateien sind im Repo, Byte-für-Byte gegen die finalen Chat-
Versionen verifiziert (s. §4).*
