## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v460 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug, nie
   für eine schnelle Plausibilitäts-Antwort.**

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# UEBERGABE-2026-08-13

**Session-Schwerpunkt:** Fortsetzung der Trade-Doktor-Vorarbeit (s. UEBERGABE-
2026-08-12-nachmittag-trade-doktor.md) — offene Verifikationspunkte abgearbeitet,
dabei einen mehrstufigen DTE-Bug aufgedeckt und behoben (3 Fix-Runden, v458→v460),
Strategie-Registry-Konzept (`ko-strategy-registry.js`) auf Wheel-Composite mit
eigenem Leaderboard-Tab erweitert und Schritt 0 der Migration umgesetzt (Datei
committed, noch nicht eingebunden). Am Abend zusätzlich einen inhaltlichen
Strategie-Fehler entdeckt (DTE-Zielbereich 21-45 war falsch, korrekt ist 30-45;
Delta fehlte strategie-spezifisch komplett) — Korrektur geplant, aber bewusst
NICHT mehr heute umgesetzt (Axel war müde nach langem Tag). Zum Abschluss
noch eine GEX/DIX-Datenlage-Recherche für die Marketstate-Engine (s. §6) —
reine Faktenklärung, keine Umsetzung.

**Repos berührt:** `ahsub/ko-modules` (`ko-strategy-registry.js` neu angelegt),
`ahsub/axel-scanner` (`index.html`, 3 Versionssprünge v458→v459→v460).
**Status Phase 0:** Lead-Projekt unverändert. Alle heutigen Arbeiten sind
Bugfixes + Konzeptarbeit an bestehender UIQ-Funktionalität, kein Verstoß gegen
SUITE.md §4 Bauprio.
**Zugriffsweg heute:** `git clone`/`curl raw.githubusercontent.com` in Sandbox
(öffentliche Repos, kein PAT) + **`claude-in-chrome` mit explizit gewährtem
Zugriff auf Axels eingeloggten Browser** — genutzt für (a) Cloudflare-KV-Lookup
(`tr:snap:2026-08-12`-Eintrag, `aggSha`-Feld gelesen) und (b) Live-Test der
`getTargetDteForStrategy()`-Funktion direkt in der Browser-Konsole auf
underlyingiq.com (`localStorage` gelesen, NICHT verändert). Dateiänderungen
weiterhin per GitHub-Web-Editor durch Axel selbst committet (kein Schreibzugriff
für Claude).

---

## 1. Verifikation der offenen Punkte aus der letzten Session — alle erledigt

- **v457 (schedulerStart-Fix):** per `git pull` bestätigt — nur noch eine
  `function schedulerStart() {`-Deklaration im Code. ✅
- **`tr:snap:2026-08-12` aggSha-Check:** per Cloudflare-KV-Dashboard-Zugriff
  gelesen — `aggSha: "c219c3ebf065"`, exakt der Aggregator-Fix-Commit, kein
  `"local"`-Fallback. Bestätigt: Run #205 lief tatsächlich mit dem gefixten
  Code. ✅
- **`Strategies`/`STRATEGIES`-Drift-Stichprobe (§3-Nebeneffekt):** ECHTE
  Divergenz gefunden und dokumentiert — `Strategies.options` (ko-strategies.js)
  war ein kombinierter CSP+CC-Eintrag ohne `lbKey`, während `STRATEGIES`
  (ko-prompts.js) `csp_wheel`/`cc` bereits getrennt mit eigenen lbKeys
  (`options_csp`/`options_cc`) führte. Grundlage für die heutige
  Registry-Arbeit (s. §2). ✅ dokumentiert, ✅ durch Registry strukturell gelöst.

## 2. Strategie-Registry-Konzept (`ko-strategy-registry.js`)

**Entstehungsgrund:** Die Drift-Stichprobe (§1) zeigte, dass Strategie-
Metadaten an mehreren Stellen unabhängig gepflegt wurden — Wurzel des
DTE-Bugs (§3) und ein grundsätzliches Architekturproblem.

**Entwurf heute vollständig ausgearbeitet, Schritt 0 der Migration
umgesetzt:**
- `ko-strategy-registry.js` in `ahsub/ko-modules` angelegt und committed —
  **inhaltlich per `diff` gegen den Entwurf verifiziert, funktional per
  `node -e`-Test verifiziert** (alle API-Methoden: `getLbKey`,
  `getStratToLbMap`, `getCompositeOf`, `nextCompositeState`, `getRules`
  funktionieren wie vorgesehen).
- Enthält `strategies.csp_wheel`, `strategies.cc`, `strategies.atmna`,
  `strategies.collar` sowie `composites.wheel` (Zyklus-Zustandsmaschine
  CSP→Assignment→CC→Called Away→CSP, Cost-Basis-Tracking-Datenstruktur nur
  skizziert, NICHT implementiert).
- **Entscheidung (von Axel bestätigt):** Wheel-Composite bekommt einen
  **eigenen Leaderboard-Tab/lbKey** (`options_wheel`) — dritte Kachel neben
  CSP und CC, kein rein internes Konstrukt.

**NICHT umgesetzt, weiterhin offen:**
- Schritt 1-5 der Migration (Ladereihenfolge in `index.html`, Umstellung von
  `ko-prompts.js`/`ko-strategies.js` auf die Registry als Datenquelle,
  Trade-Doktor-Anbindung). Vollständige Anleitung in
  `MIGRATION-strategy-registry.md` (bereits erstellt, dem Chat beigefügt,
  aber NICHT ins Repo committed — nur als Referenzdokument für Axel).
- **Registry-Werte für `deltaRange`/`dteRange` bei `csp_wheel`/`cc` sind
  VERALTET** — enthalten noch die heute als falsch erkannten Platzhalter
  (`dteRange:[21,45]`, `deltaRange:[0.20,0.30]` für beide). Muss vor
  Schritt-1-Einbindung korrigiert werden (s. §4).

## 3. DTE-Bug — drei Fix-Runden, jetzt vollständig verifiziert (v458→v460)

**WICHTIG für nächste Session: dieser gesamte Abschnitt wurde INNERHALB der
heutigen Session dreimal korrigiert, weil frühere Annahmen sich als
unvollständig herausstellten. Das Endergebnis (v460) ist geprüft — aber lies
trotzdem genau, was sich WARUM geändert hat, bevor du etwas als "sowieso
klar" annimmst.**

**Runde 1 (v458) — oberflächlicher Fund:** `DEFAULT_OPTS_CFG.dte = 30` wurde
in Templates wie `'${dte}-45 DTE'` als UNTERE Grenze gerendert
("30-45 DTE"), obwohl überall sonst "21-45 DTE" dokumentiert war (EIC-System-
Prompt). Fix: `dte: 30 → 21` an 4 Stellen (`ko-strategies.js` 1×,
`ko-prompts.js` 3×). **Zeigte KEINE Live-Wirkung** (s. Runde 2).

**Runde 2 (v459) — eigentliche Ursache:** `ctx.optsCfg` ist in der Live-App
so gut wie nie `null`/`undefined` — der Fallback aus Runde 1 griff daher
praktisch nie. Die tatsächlich wirksamen Defaults lagen komplett in
`axel-scanner/index.html`: HTML-Eingabefeld-Default, `getOptionsCfg()`
(Try+Catch), `saveOptionsCfg()`-Parse-Fallback, sowie — als konkreter
Verursacher eines fehlerhaften Live-Testfalls (ATM/NA-Briefing zeigte 36
statt der erwarteten ~8 DTE) — ein hardcodierter Options-Desk-Pfad, der
`getOptionsCfg()` komplett umging. Fix: `dte: 30 → 21` an 5 weiteren
Stellen. **Zeigte teilweise falsche Live-Wirkung** (s. Runde 3).

**Runde 3 (v460) — Architekturkorrektur:** `optsCfg.dte` wurde als EIN
geteilter Wert für zwei Strategien mit unterschiedlicher Zielsemantik
behandelt. ATM/NA hat einen eigenständigen, NICHT nutzerkonfigurierbaren
Zielwert (~30 Tage, historisch dokumentiert seit v350/Juli), während
CSP_WHEEL/CC den nutzerseitig einstellbaren Wert nutzen sollen. Live-Test
zeigte fälschlich 8 statt ~30 DTE für ATM/NA. Fix: neue Helper-Funktion
`getTargetDteForStrategy(stratId, optsCfg)` — liefert `30` fest für `atmna`,
sonst `optsCfg.dte`. An beiden Aufrufstellen (generischer Watchlist-Pfad
Z.~18261, Options-Desk-Pfad Z.~24336) eingesetzt, EINE zentrale Funktion
statt erneuter Duplizierung.

**Vollständig live verifiziert (Browser-Konsole, `claude-in-chrome`):**
```
csp_wheel mit simuliertem optsCfg.dte=21 → 21.08.2026 (7 DTE) ✅
csp_wheel mit Axels echtem optsCfg.dte=33 → 18.09.2026 (35 DTE) ✅
atmna, optsCfg ignoriert → immer 30 → 18.09.2026 (35 DTE) ✅
cc mit simuliertem optsCfg.dte=21 → 21 ✅ (verhält sich wie csp_wheel)
Axels echter localStorage-Wert (dte:33) — unverändert, nur gelesen ✅
```

**Wichtige Erkenntnis dabei:** Axels persönlich gespeicherter `optsCfg.dte`-
Wert ist **33**, nicht 21 und nicht 30 — ein bewusst von ihm gesetzter Wert
(Quelle: `localStorage['ko_options_cfg']`, Key bestätigt in
`axel-scanner/index.html` Z.19567). Das erklärte den scheinbar "gleichen"
Live-Testfall bei ATM/NA und CSP/Wheel (beide landeten zufällig auf
18.09.2026 — unterschiedliche Ursache, gleiches Kalenderdatum).

## 4. NEU — Strategie-Inhalts-Fehler entdeckt (Abend), NICHT MEHR GEFIXT

**Axels fachlicher Input (Marktstandard-Recherche, wörtlich im Chat):**
Wheel-Strategie (CSP+CC) — Sweet-Spot ist **30-45 DTE**, nicht 21-45 DTE
wie bisher im gesamten System dokumentiert. Begründung: Theta-Decay
beschleunigt sich exponentiell ab ~45 Tagen vor Verfall; unter 30 Tagen
steigt das Gamma-Risiko (Kursausschläge wirken überproportional auf den
Optionswert). Delta-Ranges: **CSP 0.15-0.30** (bisher im System 0.20-0.30,
zu eng), **CC 0.20-0.30** (deckt sich mit bisherigem System-Wert). Profit-
Taking bei 50% und Earnings-Vermeidung decken sich bereits mit dem
bestehenden System — keine Änderung nötig.

**Das bedeutet: der über drei Runden (v458-v460) sorgfältig verifizierte
DTE-Zielwert `21` für CSP_WHEEL/CC ist SELBST FALSCH — korrekt wäre `30`
als untere Grenze.** Das ist kein Widerspruch zur heutigen Fix-Arbeit
(die war technisch korrekt — sie hat den damals dokumentierten Wert
korrekt umgesetzt), sondern eine nachträgliche Korrektur des Zielwerts
selbst, die eine WEITERE Änderungsrunde erfordert.

**Vollständiger Plan bereits erarbeitet, aber bewusst NICHT umgesetzt**
(Axel war müde, hat die Entscheidung "sauberer Weg jetzt oder als eigene
Session später" bewusst auf "später" gelegt):

1. `ko-strategies.js`: `DEFAULT_OPTS_CFG.dte`: `21 → 30`
2. `ko-prompts.js`: `csp_wheel`/`cc`-Fallback-Defaults: `dte: 21 → 30` (2×)
3. `ko-prompts.js` Z.158 (EIC-System-Prompt):
   `'Delta 0.20–0.30 · DTE 21–45 Tage'` →
   `'Delta 0.15–0.30 (CSP) / 0.20–0.30 (CC/Spread) · DTE 30–45 Tage'`
   (kein eigener Spread-Strategie-Eintrag existiert — diese Zeile bleibt der
   einzige KI-Anhaltspunkt für Credit-Spreads, daher bewusst nicht ersatzlos
   gestrichen)
4. `ko-prompts.js` Z.~613 (CC-Grundlagen, statischer Text, KEIN Template):
   `"bevorzugt 21-45 DTE"` → `"bevorzugt 30-45 DTE"`
5. `axel-scanner/index.html`: dieselben 3 Stellen aus Runde 2 (§3) nochmal:
   HTML-Default, `getOptionsCfg()`×2, `saveOptionsCfg()`: `21`/`\|\|21` →
   `30`/`\|\|30`. **Die Aufrufstellen selbst (Options-Desk-Pfad, generischer
   Pfad) müssen NICHT nochmal angefasst werden** — der Weg-B-Umbau aus
   Runde 3 zentralisiert das bereits über `getTargetDteForStrategy()`.
6. `ko-strategy-registry.js`: `csp_wheel.rules`: `dteRange:[21,45]→[30,45]`,
   `deltaRange:[0.20,0.30]→[0.15,0.30]`; `cc.rules`: `dteRange:[21,45]→
   [30,45]` (Delta bleibt `[0.20,0.30]`, unverändert)

**Architektur-Entscheidung für die Delta-Werte (von Axel bestätigt):**
Delta wird — anders als DTE — bewusst NICHT nutzerseitig konfigurierbar
gemacht (kein neues `optsCfg.delta`-Feld, kein neues Settings-UI-Feld).
Delta ist eine strategie-definierende Konstante (analog zu ATM/NAs
implizitem "ATM per Definition"), keine situative Markteinstellung.
Empfohlener Mechanismus (im Chat vollständig ausgearbeitet, NICHT
committed): neue Helper-Funktion `getEffectiveRules(stratId, optsCfg)` in
`ko-prompts.js`, liest Basis-Regeln aus `KoStrategyRegistry.getRules()`,
überschreibt NUR die DTE-untere-Grenze mit `optsCfg.dte` (falls vorhanden
und `stratId !== 'atmna'`), lässt Delta unverändert aus der Registry. Das
zieht **Schritt 1 der Migration (§2) faktisch vor** — Registry muss vor
`ko-prompts.js` geladen werden, damit `getEffectiveRules()` funktioniert.

**Zusätzlich neu, bisher fehlend:** `csp_wheel`- und `cc`-Prompt-Text haben
aktuell GAR KEINE eigene Delta-Zeile — Delta kam bisher ausschließlich aus
der geteilten EIC-System-Prompt-Zeile (Z.158). Plan sieht vor, das analog
zur bestehenden `cfg.dte`-Templatisierung zu ergänzen (`rules.deltaRange`
in den Kandidatenlisten-Text einzufügen, offene Frage: als eigener
Aufzählungspunkt `c2)` oder als separater Punkt am Ende — nicht final
entschieden).

## 5. Priorisierungsentscheidung für Strategie-Modul-Konzeption (Axel-Frage,
    Claude-Empfehlung, KEIN Beschluss — offen für nächste Session)

Axel fragte, ob das Strategie-Modul zunächst schmal (nur `csp_wheel`/`cc`
als Wheel-Composite, `atmna`, `weekly_income`) oder von Anfang an für alle
Optionsstrategien inkl. Multi-Leg/Spreads geplant werden soll.

**Empfehlung (Begründung im Chat vollständig ausgeführt):** Schmal beginnen.
Begründung: alle vier genannten Strategien sind Single-Leg-äquivalent
(auch Weekly-Diagonal hat zwei unabhängig bewertbare Legs, kein gekoppeltes
Multi-Leg-Risiko wie Iron Condor/Butterfly) — `rules.deltaRange`/`dteRange`
als flache Werte reichen aus. Analogie zu Premium Options' P4-Research-Gate
(Multi-Leg/LEAPs dort bereits bewusst zurückgestellt, 5-Bedingungen-Gate) —
konsistent mit etablierter Suite-Praxis, keine neue Ad-hoc-Entscheidung.
`composites`-Konzept (bereits gebaut, s. §2) ist der richtige Andockpunkt
für später — nicht heute erweitern, nur nicht verbauen.

**Keine Entscheidung von Axel dazu getroffen** — Frage bleibt für die
nächste Session offen, falls er das Konzept dort vertiefen will.

## 6. NEU — Marketstate-Engine mit GEX/DIX füttern? (Axel-Frage, Claude-
    Rechercheergebnis, KEINE Entscheidung — offen für nächste Session)

**Axels Ausgangsannahme** ("wir haben jetzt verlässlichen Zugang zu
GEX-/DIX-Daten von Squeezemetrics aus den Backtest-Arbeiten") war **nicht
korrekt** — per Code-Recherche in `market_aggregator.py` geprüft, nicht nur
behauptet. Wichtig: auch Claudes eigene, aus dem Gedächtnis zitierte
Gegenbehauptung (Squeezemetrics tot, PCR-Proxy als Interim) war ebenfalls
veraltet. **Beide Annahmen ungeprüft wären falsch gewesen** — Beleg dafür,
warum der "hast du das verifiziert oder nur übernommen?"-Reflex bei UIQ auf
BEIDEN Seiten gilt, nicht nur bei Axels Prämissen.

**Tatsächlicher Stand (verifiziert, Zeilen-Referenzen in `market_aggregator.py`):**

- **GEX:** dreistufige Fallback-Kette in `fetch_dix_gex()` (Z.4881):
  1. FlashAlpha API (`lab.flashalpha.com`) — Free-Tier aktiv, aber NUR
     Einzeltickertest (`AAPL`), **kein SPY/QQQ**. Basic-Tier (SPY/QQQ +
     alle Exposure-Endpoints) **von Axel bestätigt: nicht aktiviert.**
  2. Squeezemetrics (`dix.csv`) — Fallback, laut Code-Kommentar "historisch,
     meist 403 von GitHub Actions" — weiterhin unzuverlässig.
  3. `None` falls beides fehlschlägt.
  → **Kein verlässlicher marktweiter GEX-Wert aktuell verfügbar.**

- **DIX:** unabhängig und deutlich solider — `fetch_finra_dix_csv()`
  (Z.5637): eigene, dollar-gewichtete DIX-Berechnung nach SqueezeMetrics-
  Methodik ("Short is Long"-Whitepaper), aber auf öffentlichen FINRA-Reg-
  SHO-Daten (`cdn.finra.org/equity/regsho/daily/`) — kein API-Key, kein
  403-Risiko, S&P-500-Basket, täglich aktualisiert. **Real und zuverlässig.**

**ENTSCHEIDEND — wo diese Werte aktuell tatsächlich einfließen:**
Die Marktregime-Klassifikation selbst (`market_regime_str` — BULL_QUIET/
BULL_FRAGILE/STRESS_UNSTABLE/POST_PANIC_REVERSION, Z.7760-7787) nutzt
**ausschließlich VIX/VIX3M-Termstruktur**. `dix_gex` wird erst DANACH
berechnet und fließt ausschließlich in `apply_macro_risk_overlay()`
(Z.3601) ein — das skaliert nur Options-Kandidaten-Scores (Collar-
Aufwertung bei GEX<0), **nicht** das Markt-Regime selbst. GEX/DIX sind
also aktuell komplett entkoppelt vom Regime-Modell, das im validierten
Backtest (Sharpe 1.66, s. Top-of-mind) ausgewertet wurde.

**Differenzierte Antwort auf die eigentliche Frage:**
- DIX ins Regime-Modell aufnehmen: technisch machbar, Datenqualität
  ordentlich — wäre eine ECHTE Modellerweiterung (zusätzliches Feature),
  kein Ersatz für VIX-Ratio.
- GEX ins Regime-Modell aufnehmen: aktuell NICHT sinnvoll umsetzbar ohne
  FlashAlpha-Basic-Tier (SPY/QQQ) — ein einzelner Test-Ticker reicht nicht
  für ein marktweites Signal.

**Bewusst NICHT heute entschieden** (Axel war müde) — das wäre eine
nicht-triviale Modellierungsentscheidung (Gewichtung, Schwellenwerte,
Rückwirkung auf den bereits validierten Backtest), keine reine
"Daten anschließen"-Aufgabe. Nächste Session: Diskussion, ob/wie DIX als
zusätzliches Regime-Feature aufgenommen wird, und ob FlashAlpha-Basic-Tier-
Aktivierung (Kosten? SPY/QQQ-Abdeckung) für GEX überhaupt priorisiert
werden soll.

## 7. Referenzmaterial für spätere Phasen — Options-Strategiewahl-Literatur

Axel suchte am Abend nach einer guten Referenz für systematische Options-
strategiewahl in Abhängigkeit von der Marktsituation. Claude fand per
Websuche `tastylive.com` (IV-Level → Strategie-Klasse-Mapping: hohe IV →
Short-Premium/Credit-Spreads/Covered-Calls, niedrige IV → Long-Premium/
Debit-Spreads/Diagonals — deckt sich mit UIQs bestehender HVP-Regel) als
solide, kostenlose Quelle, sowie eine CFA-Institute-Refresher-Reading
"Options Strategies" (Level-III-Curriculum, vermutlich paywalled, nicht
tiefer geprüft).

**Ergiebiger:** Axel hat zwei einschlägige Fachbücher als PDF/EPUB in
eigenen Unterlagen — **"The Options Workbook" (3rd Edition, Anthony J.
Saliba)** und **"Selling Option Strangles for Earnings Announcements"
(Royal Ellinger)** — und hat KI-generierte Zusammenfassungen davon im Chat
geteilt (NICHT die Originalwerke selbst, s. Warnung unten).

**Was diese Zusammenfassungen inhaltlich hergeben (ungeprüft gegen Primär-
quelle, s. Warnhinweis):**
- Saliba: 2-stufige Entscheidungsmatrix (Marktumfeld: Richtung + IV-Position
  auf einem laufzeitabhängigen "Volatilitäts-Kegel" → Strategiewahl).
  Bestätigt methodisch UIQs bestehenden HVP-Percentile-Ansatz — DREI
  unabhängige Quellen (Saliba, tastylive, UIQ-Code) nutzen dieselbe
  Grundidee. Liefert aber eine ECHTE, bei UIQ noch fehlende Verfeinerung:
  IV-Percentile getrennt nach Laufzeit-Bucket (30/60/90 Tage) statt ein
  einzelner globaler HVP-Wert unabhängig von der gewählten DTE — würde sich
  sauber in die heute entworfene Registry einfügen (`rules` könnte pro
  Strategie/DTE-Bucket unterschiedliche HVP-Schwellen tragen).
- Ellinger: konkrete, datengetriebene Filter für Earnings-Short-Strangles
  (16-Delta-Regel statt Expected-Move-Strike, IVR/IVP-Ausschluss bei >85%,
  Formel für "Bad Actor"-Ticker anhand Earnings-Move-Varianz, BPR-Quotient
  als Risikofilter, Wochentag-Effekt). Bewusst NICHT im Detail geprüft oder
  übernommen — s. Warnhinweis.
- Beide Werke behandeln primär Multi-Leg-Strukturen (Butterfly, Condor,
  Ratio Spread, Backspread, Earnings-Strangle) — passt zur heute getroffenen
  "schmal beginnen"-Priorisierung (§5) als Referenzmaterial für PHASE 2,
  nicht für die aktuellen vier Strategien.

**WARNHINWEIS, unbedingt vor Codeübernahme beachten:** Die geteilten Texte
sind KI-generierte Zusammenfassungen der Bücher, NICHT von Claude selbst
gegen die Originalwerke verifiziert — eine Zusammenfassung einer
Zusammenfassung. Qualitative Konzepte (IV-Percentile-Logik, Greeks-
Bedeutung) sind risikoarm, da Standard-Optionstheorie, die sich mit
tastylive/CFA-Konventionen deckt. Die KONKRETEN Zahlen/Formeln (Ellingers
`y = 0.648x + 0.295`-Formel, "16-Delta"-Wert, "BPR < 3,5%"-Schwelle) sind
NICHT verifiziert — vor jeder Codeübernahme gegen die Originalquelle
prüfen. **Axel hat die Originalwerke als PDF/EPUB vorliegen** — gezielte
Analyse der Primärquellen für eine spätere Session vorgesehen, keine
Umsetzung heute.

## 8. Nicht bearbeitet / offen für nächste Session

- **Punkt-6-Plan aus §4 vollständig umsetzen** — DTE 21→30, Delta-
  Strukturierung, Registry-Werte korrigieren. Das ist die konkrete
  nächste Aufgabe, wahrscheinlich als eigener, in sich abgeschlossener
  Sprint (zieht Schritt 1 der Migration mit hinein).
- Trade-Doktor Block B (Freitext-Parser) — weiterhin nicht begonnen,
  unverändert seit UEBERGABE-2026-08-12-nachmittag-trade-doktor.md.
- Alpha-Desk-Leaderboard-Rendering für die neue `options_wheel`-Kachel —
  noch nicht geprüft, ob eine dritte Kachel automatisch erscheint oder ob
  Rendering-Code explizit erweitert werden muss (offener Punkt seit der
  ersten Registry-Konzeption heute Nachmittag).
- Entscheidung, was mit dem alten `Strategies.options`-Merge-Eintrag in
  `ko-strategies.js` passiert (löschen vs. Alias) — Schritt-4-Entscheidung
  der Migration, bisher nicht getroffen.
- Priorisierungsfrage aus §5 — keine Entscheidung, nur Empfehlung im Raum.
- Kosmetik, nicht blockierend: doppeltes Leerzeichen/Leerzeile nach
  `dte: d.dte != null ? d.dte : 21` in `getOptionsCfg()` (Axels eigener
  Edit, funktional irrelevant).

---

*Verifiziert vor behauptet. Diese Session hat §1 (alle drei Punkte) und §3
(alle drei Fix-Runden, inkl. finaler Live-Verifikation per Browser-Konsole)
lückenlos verifiziert. §2 ist teilweise verifiziert (Datei-Inhalt + isolierte
Funktionstests), NICHT live in der App getestet (Registry ist noch nicht
eingebunden). §4 ist reine Planung — NICHTS davon ist committed oder
verifiziert, obwohl der Plan detailliert ausgearbeitet ist. §5 ist eine
offene Frage, kein Beschluss. §6 ist Rechercheergebnis (per Code-Lektüre
verifiziert, keine Vermutung) zu einer NEUEN Frage — zeigt zugleich, dass
sowohl Axels Ausgangsannahme als auch Claudes eigene Gedächtnis-basierte
Gegenbehauptung ungeprüft beide falsch gewesen wären. Keine Entscheidung
getroffen, nur Faktenlage geklärt.*
