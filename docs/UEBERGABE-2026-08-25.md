# UEBERGABE-2026-08-25.md

Zwei völlig unterschiedliche Baustellen heute: ein tiefer, mehrstufiger
VIX-Datenkonsistenz-Bug im Morning Briefing (deutlich mehr Aufwand als
erwartet, ein kleiner Rest bleibt bewusst offen), und danach der
eigentlich geplante Tagespunkt — die CapTrader/IBKR-Live-Anbindung —,
die am Ende erfolgreich gegen Axels echtes Konto verifiziert wurde.

---

## 1. VIX-Diskrepanz im Morning Briefing — dreistufige Fehlersuche

**Ausgangsmeldung (Axel):** Oben im Briefing stand VIX 16.01, im KI-Text
15.13 — unterschiedliche Werte für denselben Zeitpunkt.

**Stufe 1 — Root-Cause-Analyse:** Zwei komplett unabhängige Daten-
pipelines fütterten denselben Spot-VIX-Wert in zwei verschiedene
`ctx.factors`-Objekte: `factors.vix` (live via Yahoo/CORS-Proxy, DOM-
Pfad `#m-vix`) und `factors.vix_term.vix` (separat aus dem Aggregator-
KV-Snapshot gelesen). Je nach Abrufzeitpunkt unterschiedlich weit
"nachgezogen" — Yahoos 5-Tage-Chart hatte den aktuellsten Handelstag
teils noch nicht, der KV-Snapshot war teils noch der Vortageslauf.

**Fix v478:** `vix_term` übernimmt jetzt immer denselben Spot-Wert wie
`factors.vix` (Fallback auf Aggregator nur wenn `factors.vix` fehlt),
Spread wird bei Übernahme konsistent neu berechnet. Zusätzlich (Axel-
Wunsch): Datum des tatsächlich verwendeten VIX-Closes wird jetzt immer
erfasst (`data-asof`-Attribut auf `#m-vix`) und als "(Stand: ...)" an
beide Faktor-Labels angehängt. Commits: `ko-indicators-loader.js` Hash
`1027955ef928f5fd2e5a9dd715623a6e358e3fff`, `index.html` (CDN-Pin-Update
+ `fetchVix()`-Zeitstempel) Hash `4382c425b98e213f20c4d949cc3f1a7637a80d7c`.
Beide byteidentisch verifiziert.

**Stufe 2 — Diskrepanz bestand weiter (16.01 vs. 15.85):** Live-
Debugging direkt in Axels Browser-Session (Claude-in-Chrome) ergab den
eigentlichen zweiten Bug: `renderMakro()` (Makro-Panel, manueller/KI-
gestützter Cache `localStorage['ko_makro']`, z. B. via "Makro heute"-
Button) schrieb ebenfalls in `#m-vix` — **dasselbe** Element wie
`fetchVix()`. `runMorningBriefing()` ruft `loadMakro()` als Schritt
"0/9" auf (Zweck: DOM-Kontext für Intermarket/Bull-Indikator
bereitstellen, nicht um VIX zu setzen), direkt **vor** Schritt "1/9",
wo `_getVixRobust()` `#m-vix` liest — jede Briefing-Generierung
überschrieb den frisch geholten Live-Wert deterministisch mit dem
womöglich tagealten manuellen Cache-Eintrag.

**Fix v479:** `renderMakro()` schreibt `#m-vix` nicht mehr — alleinige
Zuständigkeit von `fetchVix()` (v283-Prinzip: eine Quelle pro Wert).
Commit: `index.html` Hash `b104314617169510e408496649119fb23f0daf0a`,
byteidentisch verifiziert.

**Stufe 3 — Live gegen Axels echtes Konto getestet, Briefing neu
generiert:** Diskrepanz auf 15,83 (live) vs. 15,85 (Aggregator-
Vortagesschluss) geschrumpft — 0,02 Punkte, zwei rechnerisch legitim
unterschiedliche Werte (Live-Intraday vs. offizieller Schlusskurs).
**Woher genau die 15,85 im KI-Text kommt, konnte nicht mehr gefunden
werden** — `buildPromptSection()` und `ctx.factors` liefern beide
nachweislich 15,83; die Quelle liegt vermutlich in `ko-prompts.js`
oder dem `ko-ai.js`-Worker (heute nicht mehr geprüft). Netzwerk-
Interception-Versuche (mehrere Techniken) blieben erfolglos.

**Entscheidung (Axel):** Beobachten, wie sich die Differenz über die
nächsten Tage entwickelt. Bleibt sie klein/stabil → vermutlich normal,
höchstens Beschriftungsfrage. Wird sie wieder groß/tagealt → echter
Bug, dann Single-Source-of-Truth-Umstellung nötig (vermutlich `ko-
prompts.js`/`ko-ai.js` untersuchen).

---

## 2. CapTrader/IBKR-Live-Anbindung — `broker/`-Modul gebaut und verifiziert

**Kontext-Check vor dem Bauen:** `ko-journal.js` (Refundex) deckt
explizit nur **abgeschlossene** Trades aus Flex-XML ab
(`DATENMODELL_JOURNAL.md` § 6: "Offene Positionen werden nicht als
Journal-Einträge behandelt") — reines Browser-JS, `localStorage`,
kein Server-Upload (Datensouveränität, Grundgesetz 3). Die Live-
Anbindung ist zwangsläufig ein separates Python-Modul.

**Gebaut:** `refundex/broker/` — neuer, nach Domäne benannter Ordner
(analog `engine/`/`modules/`/`workers/`), intern nach Single-
Responsibility aufgeteilt:
- `connection.py` — On-Demand-Verbindung zu IB Gateway (`readonly=True`
  per Default, Context-Manager, kein Dauerbetrieb)
- `positions.py` — offene Positionen abrufen
- `greeks.py` — Live-Greeks via `ib.reqTickers()` (Snapshot, nicht
  Streaming — passt zum On-Demand-Prinzip)
- `export.py` — JSON-Export, camelCase (an `DATENMODELL_JOURNAL.md`-
  Schema angeglichen)
- `health.py` (nachträglich ergänzt) — regelbasierte Health-Checks:
  DTE-Warnung (Default 21 Tage) + Delta-Warnung (Default 0,40 Betrag),
  bewusst ohne KI (unabhängig vom Oktober-Gate aus ROADMAP 2.12)
- `__main__.py` — Orchestrierung, CLI-Einstiegspunkt (`python -m broker`)

**Bibliothek:** `ib_async` 2.1.0 (aktiv gepflegter Nachfolger von
`ib_insync`, dessen Maintainer verstorben ist) — API live gegen die
offizielle Doku verifiziert, nicht aus dem Training geraten.

**Getestet:** Erst mit echten `ib_async`-Objekten (Mocks für die IB-
Gateway-Verbindung selbst), dann — nach Axels lokalem Setup (IB
Gateway installiert, "IB API" statt "FIX-CTCI" gewählt, CapTrader-
Login) — **live gegen Axels echtes Konto**: 21 offene Positionen (16
Aktien, 5 Optionen), alle 5 Optionen mit vollständigen Live-Greeks,
Delta-Vorzeichen korrekt (Puts negativ, Call positiv), Preise plausibel
zur jeweiligen Moneyness/IV. Health-Checks gegen dieselben echten Daten:
2 Delta-Warnungen korrekt ausgelöst (NBIX Δ-0,56, LQD Δ-0,41), 0 DTE-
Warnungen (korrekt, 24 Tage Restlaufzeit, über der 21-Tage-Schwelle) —
zusätzlich mit simuliertem späteren Datum verifiziert, dass der DTE-
Check bei Unterschreiten der Schwelle auch wirklich greift.

**Alle Commits byteidentisch + funktional gegen den Live-Repo-Code
verifiziert** (kein Hash von Axel mitgeteilt, Verifikation über
direkten Fetch + Diff).

**Praktische Lektion unterwegs:** Axels lokaler `refundex`-Checkout war
seit dem 7.08. nicht synchronisiert — `git pull` nötig, um die Vortags-
Uploads (inkl. `broker/`, geretteter Referenzdateien) lokal zu sehen.

---

## 3. UIQ-Backlog-Sichtung (SUITE.md v4.16)

Kurzer Rundgang auf Axels Wunsch. Wichtigste Funde:

- **Punkt 36 (Rechtsgutachten, WpHG/WpIG-Grenze, ~800€)** — weiterhin
  der einzige echte Kommerzialisierungs-Blocker, nicht-technisch.
  Passt direkt zu Axels heutigem Kontext (befreundeter Anwalt prüft
  gerade die UIQ-Ausgabetexte vor dem IHK-Gang, Rückmeldung in den
  nächsten Tagen — informativer Kontext, keine heutige Aktion).
- **Punkt 34 (Backtest-Skript 2007–2026, Go-Kriterium 2) — mögliche
  Backlog-Inkonsistenz:** In SUITE.md weiterhin unmarkiert offen,
  widerspricht aber der Aussage aus der 23.08.-Übergabe ("Go-Kriterium
  2 ✅ erfüllt, Sharpe 1,66 vs. 0,63"). **Nicht heute geklärt** — beim
  nächsten Mal verifizieren, ob nur der Haken fehlt oder tatsächlich
  eine Lücke zwischen Backtest-Ergebnis und Suite-Dokumentation besteht.
- Kleinere unblockierte Punkte notiert: Nr. 27 (Mindest-Volumen-Filter,
  niedrige Priorität), Nr. 29/30 (Regime-History-Flag + Meta-Signal-
  Architektur, größer, aber nicht blockiert).

---

## 4. Nachtrag — Grundsatzfrage zu "Single-Source-of-Truth"-Bugs

Axels Beobachtung nach dem VIX-Tag: Wie viele ähnliche Bugs schlummern
noch im Monolithen? Verweis auf **Backlog Punkt 19** (14.07.2026,
ausgelöst durch einen ähnlich fundreichen Tag) — dort bereits die
ehrliche Einschätzung dokumentiert, dass Vollständigkeit bei dieser
Codegröße realistisch nicht erreichbar ist, aber ein automatisiertes
Analyse-Skript (Funktionsaufrufe gegen echte Aufrufstellen prüfen,
`getElementById()`-Referenzen gegen tatsächlich existierende IDs
validieren, duplizierte Codeblöcke erkennen) systematisch statt
zufällig finden würde, was heute (VIX über vier Stellen) und am
14.07. (vier duplizierte Ampel-Renderer, toter Namespace, neun
fehlende Cache-Buster) nur zufällig als Nebenprodukt auftauchte.

**Entscheidung: Punkt 19 (das Analyse-Skript) ist der Startpunkt der
nächsten Session.**

---

## Infrastruktur-Stand (25.08.2026 Abend)

| Komponente | Hash/Version |
|---|---|
| `ko-modules/ko-indicators-loader.js` | Hash `1027955` |
| `axel-scanner/index.html` | v479, Hash `b104314` (final) |
| `refundex/broker/` (8 Dateien + health.py/export.py/__main__.py-Update) | committed, byteidentisch verifiziert |
| `UIQ-Suite/SUITE.md` | v4.16 (unverändert seit gestern) |
| Axels lokaler `refundex`-Checkout | synchronisiert (`git pull` heute) |

---

## Offene Punkte für morgen / die nächste Session

1. **Analyse-Skript aus Backlog Punkt 19 bauen** — vereinbarter
   Startpunkt der nächsten Session. Funktionsaufrufe vs. echte
   Aufrufstellen, `getElementById()` vs. echte IDs, Duplikat-Erkennung.
2. **VIX-Restdiskrepanz beobachten** (15,83 vs. 15,85) — falls sie
   über mehrere Tage groß/stale bleibt statt klein/stabil: `ko-
   prompts.js`/`ko-ai.js`-Worker untersuchen, echte Single-Source-of-
   Truth-Umstellung erwägen.
3. **Backlog Punkt 34 (Backtest-Status) verifizieren** — Inkonsistenz
   zwischen SUITE.md (offen) und 23.08.-Übergabe (als erfüllt
   berichtet) auflösen.
4. **CapTrader-`broker/`-Modul ist einsatzbereit** — kein akuter
   Handlungsbedarf, aber als Grundlage für spätere Erweiterungen
   (weitere Health-Checks, evtl. Integration Richtung Refundex-Journal)
   im Hinterkopf behalten.
5. Rückmeldung vom Anwalts-Freund zu den UIQ-Ausgabetexten abwarten
   (erwartet in den nächsten Tagen) — betrifft mittelbar Backlog-Punkt
   36 (Rechtsgutachten).
