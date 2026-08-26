# UEBERGABE-2026-08-26.md

Vier Themen heute: ein Blindalarm beim Morning-Briefing-Start (Netzwerk,
kein Code-Bug), die erste Anwendung des gestern vereinbarten
Backlog-Punkt-19-Analyse-Skripts samt Verankerung in einem neuen eigenen
Repo, die Aufklärung und der reale Testlauf von Backlog Punkt 34
(Regime-Gate-Backtest), sowie zwei SUITE.md-Versionsschritte (4.17, 4.18).

---

## 1. Blindalarm — Morning-Briefing-"Aufhängen" beim Programmstart

**Meldung (Axel):** UIQ hängt sich beim Start der Morning-Briefing-
Routine auf, keine Konsolenfehler in Chrome.

**Auflösung:** Lag an Axels Internetzugang/Router, nicht am Code —
nach Routerwechsel und Chrome-Update lief alles sauber. Kein
Zusammenhang mit dem gestrigen v478/v479-VIX-Fix. Zur Bestätigung:
frisches Morning-Briefing vom 26.08. geprüft — VIX (15,45) ist oben im
Panel und im KI-Text jetzt durchgängig konsistent, keine Diskrepanz
mehr sichtbar. Die gestern vereinbarte "einige Tage beobachten"-Frist
läuft trotzdem weiter (siehe Offene Punkte).

---

## 2. Backlog Punkt 19 — Analyse-Skript gebaut, angewendet, verankert

**Gebaut:** Zwei Node.js-Skripte (`analyze.js`, `refine.js`, acorn-
basierter echter JS-Parser statt Regex-Heuristik) gegen
`axel-scanner/index.html` + `ko-modules/*.js` +
`ko-aggregator/workers/**/*.js`:
- **§1** Funktionsaufrufe vs. Aufrufstellen (toter Code / undefinierte
  Aufrufe)
- **§2** `getElementById()` vs. echte IDs, verfeinert in `refine.js` auf
  IDs mit **mehreren automatisch erreichbaren** Schreibern (das
  eigentliche VIX-Bug-Muster, per Call-Graph-BFS von
  `setInterval`/`load`-Listenern/Top-Level-Aufrufen aus)
- **§3** duplizierte Funktionskörper (Hash-Vergleich normalisierter
  Bodies)

**Ergebnis nach manueller Tiefenprüfung aller Top-Kandidaten:** Kein
zweiter VIX-Klon gefunden. Alle auffälligen Treffer erklärt als
entweder bewusste Fallback-/Bootstrap-Muster (z.B. `pinClear`-Stub/
Vollversion, `_vixFallbackFromKV()` als dokumentierter Fallback-Pfad
von `fetchVix()`, `kvToScannerState`/`loadScannerFromKV` explizit als
"Scope-Isolation"-Kopien kommentiert) oder als Artefakt einer
methodischen Lücke im Skript selbst: `showPanel(id)` ist ein
branch-unsensitiv analysierter Dispatcher — der einmalige automatische
Boot-Aufruf `showPanel('home')` lässt das Skript fälschlich *alle*
Zweige (`if(id==='makro')`, `if(id==='admin')` etc.) als "automatisch"
markieren, obwohl die meisten nur bei Nutzer-Klick auf den jeweiligen
Tab laufen. Als bekannte Grenze im README dokumentiert (siehe unten),
keine akute Fix-Notwendigkeit.

**Ein echter, kleiner Aufräum-Fund:** `renderHomeLanding()` liest
Regime/VIX/F&G/PCR-GEX zu Beginn noch aus einer älteren, durch
`_refreshHomeStatusTiles()` (v334, 15.07.) eigentlich abgelösten
DOM-Kopien-Logik — tote Vorarbeit mit einer Edge-Case-Ausnahme
(GEX-Feld wird nicht überschrieben, wenn kein MCM-Faktor vorhanden ist
→ theoretisch könnte dort ein veralteter Wert stehen bleiben).

**Repo-Entscheidung:** Eigenes neues Repo **`ahsub/uiq-devtools`**
angelegt (Begründung: Skript analysiert über drei Repos hinweg, gehört
organisch zu keinem einzelnen; `ko-modules` wird per CDN-Pin in die
Produktions-App geladen und sollte kein Node-Tooling enthalten).
Enthält `backlog-19-analyse/{analyze.js,refine.js}`, `package.json`,
`.gitignore`, `README.md` (inkl. der Dispatcher-Branch-Lücke als
dokumentiertes TODO). Nach zwei Korrekturrunden (`.gitignore` zunächst
falsch im Unterordner statt Root committet) End-to-End validiert:
frischer Klon + `npm install` + beide Skripte laufen im vorgesehenen
Geschwister-Repo-Layout (`UIQ_WORKSPACE_ROOT`-Fallback via relativer
Pfadauflösung) fehlerfrei, `.gitignore` greift korrekt.

**SUITE.md v4.17:** Backlog №57 (renderHomeLanding-Altcode-Hinweis)
und №58 (kvToScannerState/loadScannerFromKV-Fallback-Sync-Hinweis)
ergänzt. Dabei eine vorbestehende Formatierungsanomalie bei Punkt 59
("Was wäre wenn"-Analyse, 07.08.) repariert — Markdown-Syntax
korrigiert, ohne den erkennbar verlorenen Titel-Anfang zu erfinden,
mit Hinweis im Dokument. Byte-genau gegen `origin/main` validiert
(Commit `72d4136`).

---

## 3. Backlog Punkt 34 — Regime-Gate-Backtest tatsächlich ausgeführt

**Ausgangslage (Aufklärung der Inkonsistenz aus der 25.08.-Übergabe):**
Zwei verschiedene Backtests wurden unter dem Label "Go-Kriterium 2"
vermischt:
1. Der **DCE-Score-Ranking-Backtest (Gate A)** — Sharpe 1,66 vs. 0,63
   — wurde am 07.08. durchgeführt, hat aber **keine Regime-Dimension**
   (bereits am 23.08. in `REGIME-BACKTEST-VALIDIERUNG.md` als
   Fehlzuordnung dokumentiert, aber nie zu Punkt 34 zurückgeführt).
2. Der **eigentliche, in Punkt 34 wörtlich beschriebene** Regime-Gate-
   Backtest — Skript `refundex/engine/backtest_2007_2026.py` existierte
   bereits seit 10.08., wurde aber nie mit verifizierten Ergebnissen
   ausgeführt/committet.

**Durchführung (in einer Parallel-Sitzung mit funktionierendem
`cdn.cboe.com`-Zugriff, hier nur ausgewertet und dokumentiert — siehe
Hinweis unten zu offenen Netzwerk-Fragen):** VIX/VIX3M aus CBOE-
Rohdaten (`ko-aggregator/data/raw_data/VIX3M_History.csv`), SPY via
yfinance. Ergebnis:

| Strategie | CAGR | Max DD | Sharpe | % investiert |
|---|---|---|---|---|
| Buy-and-Hold SPY (Baseline) | 14,45% | -33,7% | 0,88 | 99,7% |
| Regime-Gate A (kein STRESS) | 26,19% | -23,3% | **1,76** | 94,8% |
| Regime-Gate B (nur BULL_QUIET) | 37,26% | -8,5% | 3,26 | 76,3% |

**Go-Kriterium 2 erfüllt** (Sharpe 1,76 vs. 0,88), Krisenschutz sichtbar
(Eurokrise: SPY -4,4% vs. Gate-A +20,7%; COVID: -9,2% vs. +3,2%).

**Zwei Einschränkungen bewusst nicht geglättet, in SUITE.md
dokumentiert:**
- Effektiver Zeitraum real **18.09.2009–05.08.2026**, nicht 2007–2026
  (CBOE hat VIX3M nachweislich erst ab 18.09.2009 berechnet — die
  "2007"-Annahme im Original-Backlog-Eintrag war eine nie
  gegengeprüfte Yahoo-Notiz). Finanzkrise 2008/09 dadurch **nicht**
  im Test enthalten. Eine geprüfte Drittanbieter-Quelle für 2006–2009
  (`rtkyboba/vrp-regime-detection-strategy`) wurde bewusst **nicht**
  eingebunden — unklare Konstruktionsmethodik, Risiko einer Naht
  zwischen zwei Datenreihen genau an der Finanzkrise.
- Sharpe 1,76 ist ein neuer, unabhängiger Wert, ausdrücklich nicht zu
  verwechseln mit dem älteren "1,66" (reiner Namenszufall zwischen
  zwei verschiedenen "Gate A"-Bezeichnungen).

**SUITE.md v4.18:** Punkt 34 auf ✅ ERLEDIGT gesetzt, mit Tabelle und
beiden Einschränkungen im Volltext. Byte-genau gegen `origin/main`
(Commit `ec1e771`) validiert.

---

## 4. Nachtrag — offene Netzwerk-Frage (kein Blocker, aber ungeklärt)

In dieser Sitzung wurde versucht, den Backtest direkt selbst
auszuführen: `query1/query2.finance.yahoo.com` wurden von Axel korrekt
zur Domain-Allowlist hinzugefügt (Screenshot bestätigt), blieben aber
auch nach App-Neustart mit `x-deny-reason: host_not_allowed` blockiert
— derselbe Sandbox-Container (erkennbar an den bereits geklonten
Repos) war nach dem Neustart weiterhin aktiv, die Allowlist-Änderung
kam dort nie an. Der tatsächliche Backtest-Lauf mit Ergebnis kam am
Ende aus einer anderen Chat-Sitzung mit funktionierendem
`cdn.cboe.com`-Zugriff — dort scheint die Netzwerkkonfiguration anders
(korrekt?) geladen worden zu sein. **Nicht weiter untersucht**, da das
eigentliche Ziel (Punkt 34) erreicht wurde. Falls das Muster sich
wiederholt (Allowlist-Änderung wirkt nicht in laufender/neu gestarteter
Sitzung), wäre das ein Punkt für Anthropic-Support-Feedback.

---

## Infrastruktur-Stand (26.08.2026 Abend)

| Komponente | Stand |
|---|---|
| `UIQ-Suite/SUITE.md` | v4.18, Commit `ec1e771` |
| `ahsub/uiq-devtools` (neu) | Commit mit `.gitignore` im Root, End-to-End validiert |
| `refundex/engine/backtest_2007_2026.py` | ausgeführt, Ergebnis in SUITE.md §34 dokumentiert |
| `axel-scanner`/`ko-modules`/`ko-aggregator` | keine Code-Änderungen heute (nur Analyse, kein Patch) |

---

## Offene Punkte für morgen / die nächste Session

1. **VIX-Restdiskrepanz weiter beobachten** (aus 25.08.) — heute im
   frischen Briefing konsistent (15,45 überall), Beobachtungsfrist
   läuft weiter.
2. **Rückmeldung vom Anwalts-Freund** zu den UIQ-Ausgabetexten
   abwarten (Backlog Punkt 36, WpHG/WpIG-Rechtsgutachten) — betrifft
   den einzigen verbleibenden echten Kommerzialisierungs-Blocker.
3. **IWV-Holdings-Update** (`iwv_holdings.csv`) turnusmäßig ~27.08.
   fällig (aus `topics/recent-work`) — noch nicht erledigt, niedrige
   Priorität.
4. **uiq-devtools als Dauerwerkzeug:** branch-unsensitive
   Dispatcher-Lücke in `refine.js` (siehe README-TODO) — nur bei
   Bedarf für eine spätere, gründlichere Anwendung ausbauen, kein
   akuter Punkt.
5. Kein akuter Code-Patch aus der heutigen Sitzung offen — beide
   Aufräum-Hinweise (№57, №58) sind bewusst unpriorisierte
   Beobachtungsposten, keine Bugs.
