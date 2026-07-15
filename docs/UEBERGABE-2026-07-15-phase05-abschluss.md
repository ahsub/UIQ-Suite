## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v348 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   Mehrere der heutigen Fixes wurden funktional mit Node-Skripten getestet
   (isolierte Logik, gemockte DOM/localStorage) — das ist NICHT dasselbe wie
   ein echter Browser-Test. Axel hat einen Teil davon im Laufe des Tages
   bestätigt (v332, v336 F&G/PCR-Untersuchung, v344-Revert), den Rest (v337-343,
   v345-348) hat er NICHT explizit rückgemeldet — als "vermutlich funktioniert,
   node-getestet, browser-ungeprüft" behandeln.

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. Axel: bitte bei nächster Gelegenheit fragen "hast du das verifiziert oder
   übernommen?", wenn ich etwas aus diesem Protokoll unkritisch wiederhole.

5. **PAT-Hinweis:** Der heutige Session-PAT wird nach dieser Übergabe gelöscht.
   Der ko-watchdog-eigene PAT (`GH_WATCHDOG_PAT`, Cloudflare-Secret, gestern
   erneuert) bleibt unabhängig davon bestehen — nicht verwechseln.

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# ÜBERGABEPROTOKOLL — 15.07.2026, Watchdog-Fix + Dead-Code-Audit + Phase 0.5 (A-J)

## Kontext

Sehr langer, produktiver Tag über mehrere Themenblöcke:
1. Watchdog-PAT-Reparatur (morgens)
2. Systematischer Dead-Code-/Konsistenz-Audit (Backlog #19, SUITE.md)
3. Phase 0.5 UX-Reifung — alle neun Arbeitspakete A-I bearbeitet + J neu verankert

**Aggregator-Version am Ende: v5.10.0** (war v5.9.0 zu Sessionbeginn)
**axel-scanner-Version am Ende: v348** (war v329 zu Sessionbeginn)
**ko-modules Einzelversionen:** ko-market-state.js v2.2, ko-scanner.js v1.1.0, ko-strategies.js (getFocus/getLabelList entfernt), ko-indicators.js v2.1.1, ko-indicators-loader.js (Race-Condition-Fix)

---

## 1. Watchdog-PAT-Reparatur (morgens, vor Dead-Code-Audit)

**Problem:** Nächtlicher Aggregator-Cron (03:37 UTC) UND ko-watchdog-Fallback
(04:15 UTC) beide nicht gefeuert — Cloudflare-Dashboard zeigte `4xx` bei
`api.github.com`-Unteranfrage.

**Root Cause:** `ko-watchdog`s eigener GitHub-PAT (Secret `GH_WATCHDOG_PAT`,
separat von den taeglichen Session-PATs) war abgelaufen/ungueltig.

**Fix:** Axel hat einen neuen PAT erzeugt und ins Cloudflare-Secret eingetragen
(von mir angeleitet, nicht selbst ausgefuehrt — Credential-Eingabe). Verifiziert
per manuellem `/trigger`-Aufruf + GitHub-Actions-API-Check: neuer Run erschien
korrekt. **Als funktionierend bestaetigt (Axel hat den Trigger selbst
ausgefuehrt und die JSON-Antwort geteilt).**

**Verbleibend offen:** Der urspruengliche GRUND fuer den GHA-Cron-Ausfall
selbst (03:37 UTC) wurde NICHT untersucht — nur der Fallback (Watchdog)
repariert. Falls das oefter vorkommt, lohnt sich eine tiefere Untersuchung
des GHA-Schedulers selbst.

---

## 2. Dead-Code-/Konsistenz-Audit (SUITE.md Backlog #19)

Dreiteiliges Analyse-Skript gebaut und ausgefuehrt (nicht mehr im Dateisystem
vorhanden — war in `/home/claude/audit/`, temporaer):
- Teil 1: 557 Funktionsdefinitionen vs. Aufrufstellen
- Teil 2: 47 `getElementById()`-Referenzen vs. tatsaechliche DOM-IDs
- Teil 3: 343 Duplikat-Code-Fenster (sliding window)

**Wichtigster Fund:** `calcMarkovRegime()`/`buildTransitionMatrix()`/
`verifyMarkovLabels()`/`calcMarkovSignal()` waren komplett INLINE in
`index.html` dupliziert, byte-identisch zur CDN-Version aus `ko-markov.js`.
Da JS-Funktionsdeklarationen im selben Scope sich gegenseitig ueberschreiben
und die Inline-Kopie SPAETER im Dokument stand, lief AUSSCHLIESSLICH die
Inline-Kopie — die CDN-Version war toter Code, obwohl geladen. Jede kuenftige
Aenderung an `ko-markov.js` haette OHNE Wirkung geblieben. **Behoben:**
Inline-Kopie entfernt (axel-scanner v330).

**Weitere Funde (alle behoben, siehe Commits):**
- `updateRegimeCockpit()` — totes Legacy-Widget, lief bei jedem Morning
  Briefing unnoetig mit (echter Yahoo-VIX-API-Call). Entfernt.
- `m-oil` → `m-oil2` Namensdrift — WTI-Oelpreis war in 2 aktiven Funktionen
  immer "—" statt Live-Kurs.
- 27 bestaetigt tote Funktionen entfernt (mehrstufig gegen False Positives
  verifiziert: `setTimeout(fn)`/`.map(fn)`/`.onclick=fn`-Referenzen wurden
  korrekt als "in Benutzung" erkannt und NICHT geloescht).
- 2 ungenutzte `ko-strategies.js`-Exports entfernt (`getFocus`, `getLabelList`).
- Bewusst NICHT entfernt: `listIndicators()` (Debug-Konsolen-Tool, Kommentar
  "für Debugging"), `listByCategory()` (Kommentar "für zukünftige Module").

**Prioritaet 4 (rein kosmetisch, in SUITE.md vermerkt, NICHT behoben):**
`r-portfolio-rec`/`r-port-details`, `list-select`, `ki-dropdown-wrap`,
`overheat-text`/`sektor-overheat-content`, Reste der `preset-select`-
Namensdrift. Alle sicher geguardet (kein Crash-Risiko), nur kosmetisch.

**Commits:** axel-scanner `3ca4f08`→`f332ea2` (v330), ko-modules `02644b8`,
UIQ-Suite/SUITE.md `fce9b65` (v2.9).

---

## 3. Phase 0.5 — alle Arbeitspakete A-J

**STRATEGIE.md jetzt v1.12.** Vollstaendiger Stand aller Arbeitspakete dort
dokumentiert — dieses Protokoll fasst nur die WICHTIGSTEN/riskantesten Fixes
zusammen, fuer Details siehe STRATEGIE.md §4 direkt.

### A — Homescreen/Landing (axel-scanner v332)
Sidebar-Titel-Klick + echter Nutzer-Changelog (vorher nur nackte Versionsnummer).

### B — Trigger-/Cache-Disziplin (axel-scanner v333)
**Root Cause gefunden:** `runMorningBriefing()` loeschte den Cache
UNCONDITIONAL bei jedem Aufruf, unabhaengig vom (nie tatsaechlich
weitergereichten) `forceRefresh`-Parameter. Fix: Bestaetigungsdialog VOR dem
Cache-Wipe, deckt beide vorherigen Trigger-Pfade (normaler Button + EIC-
Direktaufruf) mit einer Aenderung ab. Gleiches Muster fuer `autoMakro()`.

### C — Sprache/Beschriftung (axel-scanner v339-v341)
- Icon-only-Buttons (TV-Button war Axels Ausgangsbeispiel) bekommen sichtbare
  Text-Labels.
- **Echter Bug gefunden:** "Kurz und bündig" sollte laut Spec Default sein,
  war aber fuer neue Nutzer (kein localStorage-Wert) faelschlich die
  technische Zahlen-Ansicht. Gefixt.
- Modell-Herkunft ("Claude") aus 9 Kunden-UI-Stellen entfernt, generisch "KI".
  `help.html` bleibt bewusst unveraendert (dedizierte Programm-Beschreibungsstelle).

### D — Button-vs-Info-Konsistenz (axel-scanner v342, ko-modules@c72b7bf)
Strategie-Ampel-Chips: 7 mit **bestaetigter** Leaderboard-Zuordnung (aus der
bereits etablierten `_lbToStrat`-Umkehr-Zuordnung, NICHT geraten) bekommen
echte Klick-Navigation. 4 ohne eindeutige Zuordnung verlieren die Button-Optik.
Regime-Action-Texte bekommen "Gesamteinschätzung: "-Praefix.

### E — Alpha Desk (axel-scanner v343, dann v344 REVERT)
**Wichtig fuer naechste Session:** In v343 wurde die Leaderboard-Leiste
eingeklappt (Spec-Wortlaut "Beim Öffnen zunächst nur Master-Shortlist
zeigen"). Axel hat das als Missverstaendnis korrigiert — die Leiste soll
IMMER sichtbar bleiben, der neue "Beste Chance"-Button kommt nur ZUSAETZLICH
dazu. **v344 hat das zurueckgebaut.** Falls in einer kuenftigen Session
erneut über Punkt 2 der E-Spec nachgedacht wird: dieser Revert ist Absicht,
nicht ruecksichtsloses Weglassen der Spec-Vorgabe.

Neuer Button `runBestOpportunityKI()`: durchsucht alle Leaderboards nach
hoechstem Score uebergreifend. "Strategie-Nerds"-Punkt (Punkt 5) bewusst
zurueckgestellt (Pareto-Entscheidung, dokumentiert).

### F — Options Desk (axel-scanner v345, ko-aggregator v5.10.0)
**Wichtigster Einzelfund des Tages im Options-Bereich:** Options-Watchlist
hatte GAR KEINE KI-Anreicherungsfelder serverseitig (im Gegensatz zur Master-
Shortlist). Eine reine Client-Badge waere irrefuehrend gewesen. Stattdessen:
neue `enrich_options_watchlist_with_ai()` im Aggregator gebaut (analog zur
bestehenden Shortlist-Anreicherung), Top-15 bekommen jetzt echte Strike/DTE/
Delta/Praemie-Vorschlaege. **Diese Funktion braucht einen echten Aggregator-
Lauf mit gueltigem `ANTHROPIC_API_KEY`, um sich zu bewaehren — bisher nur mit
Fail-Safe-Pfaden (kein Key/leere Liste/HTTP-401) getestet, NICHT mit einem
echten erfolgreichen KI-Call.** Empfehlung: nach dem naechsten reinen
Aggregator-Lauf pruefen, ob `optionsWatchlist[i].ki` tatsaechlich befuellt ist.

### G — Scanner-Tab (axel-scanner v346-v347, ko-modules@c52bac1)
**Wichtiger Fund:** Scanner zeigte MSE-Regime (client, VVIX/SKEW-basiert),
Alpha Desk zeigte Aggregator-Regime (server, Markov-basiert) — zwei legitime,
aber unterschiedliche Systeme, dadurch teils widerspruechliche gleichzeitige
Anzeige. Axel-Entscheidung: NUR die Anzeige vereinheitlichen (beide zeigen
jetzt MSE-Regime), die Aggregator-interne Markov-Regime bewusst NICHT
anfassen (steuert die tatsaechliche Leaderboard-Ticker-Auswahl serverseitig
— ein Risiko, das vermieden wurde). Auto-Watchlist-Empfehlung + Caching neu
gebaut (`ko_last_watchlist_us`/`_de` in localStorage).

### H — "Wolf-im-Schafspelz"-Modus (nur Konzept-Skizze, wie von Spec vorgesehen)
Keine Code-Aenderung. Konzept in STRATEGIE.md §4 dokumentiert: CSS-Klassen-
Toggle-Mechanismus (`.nerd-only` + `body.investor-mode`), Grobskizze was
aus-/eingeblendet wuerde, explizite Begruendung warum Umsetzung Phase 1
vorbehalten bleibt (Umfang, fehlendes Beta-Tester-Feedback).

### I — Fehler-Kommunikation KI-Aufrufe (axel-scanner v348)
Basis-Fehlerbehandlung (`showKiError()`, unterscheidbare 429-Meldungen) war
bereits aus einer FRUEHEREN Session (v245) vorhanden — STRATEGIE.md-Eintrag
war veraltet. Neu ergaenzt: Retry-Countdown (20s) + Pro-Ticker-Cache-Fallback
mit Alters-Anzeige. **Zusatzfund:** `generateDeepDiveKI()` nutzte die
zentrale Fehlerbehandlung bisher GAR NICHT (nur rohe Fehlermeldung) — jetzt
konsistent umgestellt.

### J — Mobile-Tauglichkeit (nur verankert, nicht bearbeitet)
Eigenes Arbeitspaket in STRATEGIE.md angelegt (Axel-Initiative, Nutzer
verlangen es). Ist-Zustand: ein funktionierender Breakpoint (Navigation),
Tabellen/Touch-Targets/Modals ungeprueft. **Braucht eigene, dedizierte
Session** — nicht in Phase-0.5-Sprint mit hineingezogen.

---

## Infrastruktur-Stand (Ende Session, 15.07.2026)

| Komponente | Version/Hash |
|---|---|
| axel-scanner | v348, Commit `463303c` |
| ko-aggregator (Python) | v5.10.0, Commit `db42377` (STRATEGIE.md), Code selbst in `f320dcf` |
| ko-market-state.js | v2.2, Commit `c72b7bf` |
| ko-scanner.js | v1.1.0, Commit `c52bac1` |
| ko-indicators.js | v2.1.1 (PCR-Feldpfad-Fix), Commit `1f40df0` |
| ko-strategies.js | Commit `02644b8` (getFocus/getLabelList entfernt) |
| UIQ-Suite/SUITE.md | v2.9, Commit `fce9b65` |
| ko-watchdog (Cloudflare Worker) | GH_WATCHDOG_PAT erneuert, funktionsfaehig |

**Aktive Crons:** GHA 03:37 + 13:30 UTC; ko-watchdog 04:15 + 13:45 UTC
(Fallback-Absicherung jetzt wieder funktionsfaehig).

---

## Pendente Punkte fuer naechste Session

1. **[PENDING]** Options-Watchlist-KI-Anreicherung (F) nach echtem Aggregator-
   Lauf verifizieren — bisher nur Fail-Safe-Pfade getestet, kein echter
   erfolgreicher KI-Call beobachtet.
2. **[PENDING]** Mobile-Tauglichkeit (J) — eigene Session, Ist-Zustand-Audit
   zuerst (welche Kernansichten brechen auf schmalen Viewports).
3. **[PENDING]** Dead-Code-Audit Prioritaet 4 (kosmetisch, siehe SUITE.md) —
   niedrige Dringlichkeit, bei Gelegenheit.
4. **[PENDING]** Ursprung des GHA-Cron-Ausfalls (03:37 UTC) selbst nie
   untersucht, nur der Watchdog-Fallback repariert.
5. **[PENDING]** Alle heutigen Fixes (v330-v348) sind Node-getestet, aber
   GROSSTEILS nicht im echten Browser durch Axel verifiziert (Ausnahmen:
   v332 Home-Button, v336 Toast-Feedback, v337 F&G/PCR teilweise, v344-Revert-
   Bestaetigung). Bei naechster Gelegenheit: Hard-Refresh + Durchklicken der
   Panels empfehlenswert, bevor mit neuen Features weitergemacht wird.

---

## NACHTRAG (15.07.2026, Abend) — zwei kritische Bugs per Browser-Konsole gefunden

Axel hat noch vor dem Schlafengehen v348 im echten Browser getestet (genau
die in Punkt 5 oben empfohlene Verifikation) und ZWEI Fehler gefunden, die
beide aus der heutigen Session stammen und von den node-basierten Tests
NICHT gefangen wurden:

1. **`Uncaught ReferenceError: switchToPanel is not defined`** — in
   `renderGateWidget()` (Arbeitspaket D) wurde eine nicht-existente Funktion
   `switchToPanel()` aufgerufen statt der tatsaechlich existierenden
   `showPanel()`. Betraf ALLE 8 klickbaren Strategie-Ampel-Chips (Value +
   die 7 aus AP D) — jeder Klick loeste den Fehler aus statt zu navigieren.

2. **`Uncaught SyntaxError: Export 'getFocus' is not defined in module`**
   (ko-strategies.js) — beim Entfernen von `getFocus()`/`getLabelList()` im
   heutigen Dead-Code-Audit wurde nur die `const`-Definition entfernt, NICHT
   die `export {...}`-Zeile am Dateiende, die diese Namen weiterhin
   auflistete. Das ist im Browser (ES-Modul-Kontext) ein FATALER Ladefehler
   beim Modul-Parse — betraf vermutlich saemtliche KI-Strategie-Buttons quer
   durchs Interface.

**Beide behoben, Commits:** axel-scanner `2653aec` (v349), ko-modules
`6b69795`.

**Wichtige Lektion fuer kuenftige Sessions:** `node --check` reicht NICHT
aus, um ES-Modul-Export-Fehler (`export {...}`-Statements) zuverlaessig zu
pruefen — Node behandelt `.js`-Dateien standardmaessig als CommonJS und
prueft `export`-Syntax nicht wie ein echter Browser-Modul-Loader. Bei
Aenderungen an `<script type="module">`-Dateien (aktuell: `ko-strategies.js`,
evtl. andere) kuenftig zusaetzlich pruefen: `node --input-type=module -e "$(cat datei.js)"`
oder eine `.mjs`-Kopie mit `node --check`. Reines `node --check` auf der
`.js`-Datei haette diesen Fehler nicht gefangen (wurde in dieser Session
faelschlich als ausreichend behandelt).

**Positiv zu vermerken:** Genau der in Punkt 5 oben empfohlene Schritt
("Hard-Refresh + Durchklicken der Panels") hat beide Bugs sofort sichtbar
gemacht — die Empfehlung war richtig, und Axel hat sie noch am selben Abend
befolgt, bevor Schaden im laufenden Betrieb entstehen konnte.

## Strategische Entscheidungen dieser Session (zur Erinnerung)

- **Watchdog-PAT ≠ Session-PAT** — unabhaengige Credentials, nicht verwechseln.
- **Regime-Anzeige vs. Regime-Logik getrennt** (G): Anzeige vereinheitlicht,
  serverseitige Stock-Selection bewusst unangetastet gelassen.
- **Keine vorgetaeuschten Features** (F): lieber echte serverseitige Arbeit
  bauen (Options-KI-Anreicherung) als eine Client-Badge ohne Datenbasis.
- **Pareto-Entscheidungen dokumentiert, nicht stillschweigend uebersprungen**
  (E Punkt 5, F Punkt 4): "Strategie-Nerds"-Features fuer wiederkehrende
  Power-User zurueckgestellt zugunsten der Beta-Neulinge, um die es in
  Phase 0.5 primaer geht.
