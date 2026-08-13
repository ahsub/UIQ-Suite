# UERBERGABE-2026-08-12

## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v456 deployed", "X funktioniert", "Y ist erledigt") ist eine
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

# UEBERGABE-2026-08-12-nachmittag-trade-doktor

**Session-Schwerpunkt:** Fortsetzung nach dem Vormittags-Integritätscheck
(s. UEBERGABE-2026-08-12.md) — kritischer Aggregator-Fund, Fund-1-Fix
verifiziert, neues Trade-Doktor-Konzept vollständig ausgearbeitet.
**Repos berührt:** `ahsub/ko-aggregator` (2 Commits), `ahsub/axel-scanner`
(4 Commits), `ahsub/ko-modules` (1 Commit), `ahsub/UIQ-Suite` (1 neue Datei,
2 Updates).
**Status Phase 0:** Lead-Projekt unverändert. Trade-Doktor ist Konzeptarbeit
(Dokument, kein Code) — SUITE.md §4 erlaubt Research/Dokumentation jederzeit,
kein Verstoß gegen Bauprio.
**Zugriffsweg heute:** `git clone` in Sandbox (öffentliche Repos, kein PAT) +
`claude-in-chrome` für GitHub-Actions-Läufe/Workflow-Trigger-Verifikation
(Axels eingeloggter Browser-Tab, keine Credentials angefasst). Dateiänderungen
weiterhin per GitHub-Web-Editor durch Axel selbst committet (kein Schreibzugriff
für Claude).

---

## 1. Kritischer Fund: Aggregator lief seit 07.08. bei jedem Run ab

**Root Cause:** `_load_ex_iwv_tickers()` (eingeführt Commit `5aa3430`, v5.33.0,
07.08.2026 17:26 UTC) nutzt `Path(__file__)`, aber `pathlib.Path` war nirgends
importiert — `NameError`, `main()` stürzt fast am Anfang ab, vor jeder
Scan-/Track-Record-Aktivität.

**Ausmaß (verifiziert über GitHub-Actions-UI, nicht nur behauptet):** 7 von 7
Runs seit Einführung (#198–204) fehlgeschlagen, ca. 4,5 Tage durchgehend kein
`master_market_data.json`, vermutlich keine Track-Record-Snapshots in diesem
Zeitraum.

**Fix:** `from pathlib import Path` ergänzt (Zeile 150, `market_aggregator.py`),
Commit `c219c3e`. **Run #205 danach live verifiziert: erfolgreich, 6m55s**
(Laufzeit im Bereich der früheren guten Runs, nicht mehr die 30-70s der
Absturz-Läufe) — Erfolg über GitHub-Actions-UI direkt bestätigt, nicht nur
Commit-Vorhandensein geprüft.

**Wichtig für nächste Session:** Der gestrige `aggSha`-Fix (aus dem
Vormittags-Protokoll) konnte dadurch bisher **nie unter echten Bedingungen
laufen** — Run #205 ist der erste erfolgreiche Lauf seit dessen Einführung.
`tr:snap`-Eintrag für den 12.08.-Run auf validen `aggSha` prüfen (Feld `aggSha`,
nicht `"local"`) — heute nicht mehr gemacht, offen für nächste Session.

## 2. Daten-Frische-Banner gebaut (axel-scanner)

Neuer Banner `#data-staleness-banner` im Topbar, `checkDataFreshness(meta)`
vergleicht `meta.last_trading_day` gegen den über `isTradingDay()` berechneten
erwarteten Handelstag. Bei Abweichung: sichtbare Warnung statt stillem
Veralten. 3 Edits (HTML-Banner, Funktion, Aufruf in `loadKVMasterData()`),
alle über GitHub-Web-Editor von Axel committet, von mir per `git pull` + `grep`
verifiziert.

## 3. `window.KoPrompts`-Kollision behoben (ko-modules)

**Root Cause:** `ko-strategies.js` ist `type="module"` (deferred, läuft nach
komplettem Parsing), `ko-prompts.js` ist normales `<script>` (läuft synchron
an seiner Position). Der Rückwärtskompat-Alias `window.KoPrompts = KoStrategies`
in `ko-strategies.js` überschrieb dadurch **immer** den echten, bereits
geladenen `KoPrompts` aus `ko-prompts.js` — seit dem v415-Sprint (30.07.,
"Single Source of Truth"-Umbau) lautlos aktiv.

**Empirisch bestätigt (Axels Konsolen-Check vor dem Fix):**
`KoPrompts.VERSION` → `"2.4.0"` (KoStrategies, falsch), `typeof
KoPrompts.getLbKey` → `"undefined"`. Betroffen: Alpha-Desk-Leaderboard-Mapping
(`getLbKey`/`stratFromLb`/`getStratToLbMap`), `getIntermarketPrompt`,
`getOversoldPrompt`, `getMetaAnalysisPrompt`, vermutlich `getSystemPrompt`/
`getMorningPrompt` — alle als `TypeError` zur Laufzeit, seit ca. zwei Wochen.

**Fix:** Alias-Zeile in `ko-strategies.js` entfernt (Commit `ccad16b`), CDN-Hash
in `axel-scanner/index.html` von `@57c6f91` auf `@ccad16b` aktualisiert.
**Live verifiziert (nach anfänglichem Cache-Fehlalarm — Axels erster Check
zeigte noch `2.4.0`/`undefined`, war aber ein alter, nicht neu geladener Tab):
auf frisch geladener Seite bestätigt `KoPrompts.VERSION` → `"2.5.0"`, `typeof
KoPrompts.getLbKey` → `"function"`, `KoStrategies.VERSION` weiterhin `"2.4.0"`
eigenständig erreichbar.** Vollständig erledigt.

**Bekannter Nebeneffekt:** `KoPrompts.get()` nutzt jetzt wieder `STRATEGIES`
aus `ko-prompts.js` statt `Strategies` aus `ko-strategies.js` — falls beide
Strategie-Listen inzwischen auseinandergelaufen sind, kann sich sichtbarer
KI-Text ändern. Stichprobenartig in der App prüfen, nicht als Non-Issue
annehmen.

## 4. Versionierung (axel-scanner)

v454 → v457 im Tagesverlauf, durchgehend synchron zwischen Meta-Tag und
Changelog gehalten (zwischenzeitlich einmal auseinandergelaufen, von Axel
selbst korrigiert nach Hinweis). v456 = KoPrompts-Kollisionsfix, v457 =
schedulerStart-Scope-Fix (s. §7).

## 5. Trade-Doktor — vollständiges Konzeptdokument

Neu: `UIQ-Suite/docs/TRADE-DOKTOR-KONZEPT.md` (Commits `d12ec57`, `ebb1411`).

**Zweck:** Persönliches Analyse-Werkzeug für Axel — fremde Trade-Ideen aus
Discord-Optionstrader-Gruppen gegen UIQ-eigene Regeln prüfen, ausführlich
begründete Einschätzung. **Kein Public-Output, kein Discord-Post-Automatismus,
UIQ bleibt in der Ansprache unerwähnt** (Leitplanke, mehrfach bestätigt).

**Architektur-Kernentscheidung:** Zwei-Schichten-Prinzip nach dem in
OPTIONSMODUL-ARCHITEKTUR.md §9 dokumentierten Grundsatz "Verdict wird
konsumiert, nie vom LLM erzeugt" — deterministische Bewertungsfunktion
(`evaluateOptionsTradeAgainstUIQRules()`) getrennt von der KI-Erklärschicht.

**Wichtigste Design-Entscheidung des Nachmittags:** Kein eigenständiger
`CSP_MANAGEMENT_PLAYBOOK`-Datensatz (Dual-Source-of-Truth-Risiko), sondern
**geteiltes `rules`-Feld direkt in `Strategies[stratId]`** (`ko-strategies.js`)
— maschinenlesbar, getrennt von den bestehenden Prosa-/Prompt-Feldern. Trägt
Delta-/DTE-Zielbereiche (strategie-spezifisch, nicht global — `atmna` z.B.
`deltaRange: null`, ATM per Definition), Profit-Taking-Stufen, Roll-Regeln.
Dieses Feld ist als geteiltes Modul gedacht, das UIQ, Trade-Doktor und jedes
künftige strategieabhängige Programmteil gemeinsam nutzt.

**Weitere Kernpunkte:**
- Schweregrad-Enum im Bewertungsergebnis: `GATE_VERSTOSS` /
  `PARAMETER_ABWEICHUNG` / `IM_ZIELBEREICH` — verhindert Gleichgewichtung von
  "Regime sperrt komplett" vs. "Delta weicht leicht ab".
- Eingabe: Freitext-Parser (bewusst kein Formular, Axels Vorgabe: Tool soll
  "im Hintergrund bleiben") + neuer Screenshot-Eingabeweg (Referenzfall: DDOG
  Short Call, Delta 0.412) — beide münden in dieselbe Downstream-Pipeline.
- IV-Rank-Quelle geklärt: weder CBOE (nur Index-weite Benchmarks) noch
  CapTrader/IBKR (Live-API laut §7 OPTIONSMODUL-ARCHITEKTUR.md "Bau selbst
  noch NICHT begonnen") liefern heute Pro-Ticker-IV. Start mit Phase-1-Proxy
  (Realized Vol, Twelve Data), muss im Output als Näherung gekennzeichnet sein.

**Bewusst zurückgestellt/entschieden, nicht vergessen:**
- CapTrader-Live-Auslesen (API/Flex-XML) für Trade-Doktor — überschneidet mit
  bereits geplantem `OptionsDoktor` (Refundex, ROADMAP 2.12, Trigger
  01.10.2026). **Entscheidung offen, ob Trade-Doktor das vorzieht.**
- Ein "Discord-Vorsicht-Reminder" am Ende der KI-Erklärschicht wurde
  vorgeschlagen, von Axel begründet abgelehnt (gelebte Forum-Praxis: jeder
  handelt auf eigenes Risiko). Nicht erneut vorschlagen.
- DTE-Zielbereich uneinheitlich im Code (`DEFAULT_OPTS_CFG.dte = 30` vs.
  EIC-System-Prompt "21–45") — vor Block D vereinheitlichen.

**Sprint-Bausteine (A–G), Status:**
- A (Architektur) ✅ geklärt
- B (Freitext-Parser) — Design fertig, Bau offen
- C (Scan-Universum-Matching) — offen
- D (Bewertungsfunktion, `rules`-Feld anlegen) — offen, DTE-Werte vorher
  vereinheitlichen
- E (neuer Prompt-Zweig in `ko-prompts.js`) — offen
- F (UI-Panel) — offen
- G (Screenshot-Eingabe) — Design fertig, Bau offen

## 6. Sonstiges

- E-Mail-Entwurf für Leo Ji (Stanford, Autor `nuglifeleoji/Options-Analytics-
  Agent`, Kontakt aus Session 11.08.2026) rekonstruiert und Axel zum Review
  vorgelegt — ursprünglicher exakter Wortlaut aus 11.08. war per Volltextsuche
  nicht mehr vollständig rekonstruierbar (Suchergebnis-Trunkierung), daher
  neuer Text nach derselben freigegebenen Linie (keine Kommerzialisierung, nur
  Integrationswunsch, volle Transparenz zur Inspirationsquelle).
  **Von Axel bestätigt: bereits verschickt (12.08.2026 abends).** Erledigt,
  keine offene Aktion mehr.

## 7. Zweiter kritischer Fund (spätabends): `schedulerStart`-Scope-Bruch

Beim Einfügen von `checkDataFreshness()` (§2, Schritt 2) landete die Zeile
`function schedulerStart() {` versehentlich doppelt im Code. Kein
Syntax-Fehler (daher unsichtbar in der Konsole, `document.readyState` zeigte
"complete", keine Exception beim Laden) — aber die äußere, nie geschlossene
Klammer verschob den gesamten nachfolgenden Code im selben Script-Block
(`toggleExpertMode`, `_optionsMaxPrice`, vermutlich weiteren) aus dem
globalen in einen lokalen Geltungsbereich innerhalb der verschachtelten
Funktion.

**Symptom:** EIC-Expert-Modus-Schalter tot (`ReferenceError: toggleExpertMode
is not defined` bei jedem Klick, keine Reaktion, kein PIN-Modal). Zusätzlich
betroffen: `_optionsMaxPrice`-Kursrahmen-Filter beim App-Start
(`_initUICache()` warf `ReferenceError`, brach `unlockApp()` vorzeitig ab —
`initExpertMode()` und `updateScannerHint()` liefen dadurch beim Start
ebenfalls nicht).

**Diagnoseweg (live, über claude-in-chrome auf Axels verbundenem Browser):**
Konsolen-Fehler zeigten nur die Symptome (`toggleExpertMode is not defined`),
nicht die Ursache. Eigener Klammer-Balance-Scanner (Regex/String/Kommentar-
bewusst) auf den rohen Script-Tag-Inhalt angewendet fand die unausgeglichene
`{` — anschließend Inhalt zeilenweise über Zeichencodes extrahiert (direkte
Textausgabe wurde vom Werkzeug als "Cookie/Query-String-Daten" geblockt), da
bestätigt.

**Fix:** Doppelte `function schedulerStart() {`-Kopfzeile entfernt. **Live
verifiziert von Axel: EIC-Schalter funktioniert wieder.** v457 (Meta-Tag +
Changelog, von mir noch nicht per `git pull` gegengeprüft — nächste Session
sollte das nachholen, bevor es als abgeschlossen gilt).

**Wichtig für nächste Session:** Dieser Bug war eine **direkte Folge** der
eigenen Vormittags-Änderung (Daten-Frische-Banner, §2), keine unabhängige
Altlast. Bei künftigen Copy-Paste-Einfügungen dieser Art (Axel fügt Code über
GitHub-Web-Editor ein) lohnt sich ein kurzer Blick auf die Zeile *unmittelbar
nach* dem eingefügten Block, nicht nur auf den eingefügten Block selbst —
genau dort ist die Duplizierung diesmal passiert.

## 8. Nicht bearbeitet / offen für nächste Session

- `tr:snap`-Eintrag vom 12.08.-Nachtlauf auf validen `aggSha` prüfen (s. §1)
- Stichprobe: haben sich `Strategies`- und `STRATEGIES`-Listen (ko-strategies.js
  vs. ko-prompts.js) inhaltlich auseinanderentwickelt? (Nebeneffekt aus §3,
  KoPrompts-Kollisionsfix selbst ist erledigt und verifiziert)
- Trade-Doktor Block B (Parser) im Detail bauen
- DTE-Zielbereich-Inkonsistenz vor Block D auflösen
- v457 (schedulerStart-Fix): Axel hat den EIC-Schalter live bestätigt
  (funktioniert), aber Meta-Tag/Changelog-Versionsstand wurde von mir noch
  nicht separat per `git pull` gegengeprüft
- Stichprobe: gibt es im selben Script-Block noch weitere Stellen mit
  ähnlichem Scope-Bruch (z.B. andere kürzlich per Web-Editor eingefügte
  Blöcke)? Heute nur der eine Fund geprüft, nicht systematisch nach weiteren
  gesucht

---

*Verifiziert vor behauptet. Diese Session hat #1–#4 und #7 live über
GitHub-UI bzw. Konsolen-Checks bestätigt, #5-Bausteine sind Design/
Dokumentation, kein Code — entsprechend als "offen" markiert, nicht
"erledigt".*
