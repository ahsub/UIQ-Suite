# UIQ — Übergabeprotokoll 26.09.2026 → 28.09.2026

**Datum:** 26.09.2026
**Status:** Session-Ende. v1.25 (Regime-Feldpfad-Fix) committet, noch NICHT live bestätigt. Forschungspaket Backtest/DSR committet. Code und Public-Ausgaben bis nach dem Telefonat am 28.09. bewusst eingefroren.
**Zweck:** Kontext-Übergabe für den nächsten Chat

---

## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert.
   "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet.
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können
   Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben
   sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher
   Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.

5. **Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt
   nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle
   Plausibilitäts-Antwort.** Nicht raten, woran es liegen könnte — nachsehen,
   woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt
   ist, gilt sie als gefunden.

6. **Never guess, always correctly diagnose (SUITE.md Grundgesetz #9).**
   Ein plausibler Fix ohne verifizierten Root-Cause-Beleg gilt als Vermutung,
   nicht als Fix — unabhängig davon, wie überzeugend die Erklärung klingt oder
   wie oft ein ähnliches Muster schon funktioniert hat. Präzedenzfall
   (23.09.2026): `ko-prompts.js` v2.54.1 (Fettdruck-Anweisung für Ticker) war
   gut begründet, aber unverifiziert — und schlug live fehl. Erst reines
   Diagnose-Logging (ohne jede Verhaltensänderung) deckte die tatsächliche
   Ursache auf (v2.54.2: fett geschriebene Markdown-Überschriften brachen die
   Ticker-Extraktions-Regex). Erst danach griff der gezielte Fix nachweislich.
   Konsequenz für diese Session: bei unerwartetem Verhalten lieber einen Lauf
   in reine Diagnose investieren (Logging, kein Verhaltenseingriff), als aus
   der ersten plausiblen Hypothese sofort einen Fix zu bauen — auch wenn das
   einen Zyklus länger dauert.

7. **Tests für öffentlichen Output prüfen den Inhalt, nicht nur die Struktur.**
   "Überschrift 7 ist vorhanden" beweist nicht, dass unter Überschrift 7 der
   richtige Text steht. Präzedenzfall (24.09.2026):
   `generate_public_recommendations.js` v1.22 bestand Golden-Test,
   Szenario-Tests und E2E-Test — alle prüften nur, ob die Abschnitts-
   Überschriften vorhanden waren. Live standen in Abschnitt 7+8 aller 15
   Strategien die Prompt-Anweisungen an das Modell ("PFLICHT-SATZMUSTER",
   "Grundgesetz #11", "EIC-exklusiv") statt fertigem Text. Root Cause: derselbe
   String wurde für zwei Rollen benutzt (Anweisung ans Modell UND öffentlicher
   Text). Konsequenz: Prüfungen für öffentlichen Text gegen echte historische
   Outputs kalibrieren — mit positiven Fällen (gültige Texte müssen bestehen)
   UND negativen Fällen (bekannt fehlerhafte Texte müssen durchfallen), bevor
   sie live Strategien blockieren dürfen. Und: Prompt-Anweisung ≠ Output — nie
   denselben String für beide Rollen verwenden.

8. **Pro Nacht nur eine Produktionsänderung.**
   Wenn zwei Änderungen gemeinsam in denselben Nachtlauf gehen und etwas
   abweicht, lässt sich die Abweichung keiner der beiden eindeutig zuordnen.
   Weitere fertige Änderungen warten, bis die vorherige live bestätigt ist —
   notfalls über einen manuellen Lauf, damit nicht auf den nächsten Nachtlauf
   gewartet werden muss. Präzedenzfall (24.09.2026): Phase C der
   TICKER_MASTER-Migration wurde fertig gebaut und getestet, aber bewusst erst
   nach der Live-Bestätigung von v1.23 zum Commit freigegeben.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

## Namenskonvention

* **Dateiname:** `UEBERGABE-JJJJ-MM-TT.md` — Großschreibung mit
  Bindestrichen, Datum am Ende im ISO-Format (Datum der Session, an deren
  Ende das Protokoll geschrieben wird — nicht des Folgetags, für den es
  gilt). Beispiel: `UEBERGABE-2026-09-24.md`. Kurzform bewusst gewählt
  (Axel, 24.09.2026: übersichtlicher in der Dateiliste). Die Vorlage selbst
  heißt `UEBERGABE-HEADER-TEMPLATE.md`.
* **Ablageort:** `UIQ-Suite/docs/`, neben den anderen Konzept-/Status-
  Dokumenten (`EARNINGS-INVEST-*.md`, `TICKER-MASTER-MIGRATION-*.md`) —
  gleiches Muster, gleiche Groß-mit-Bindestrich-Schreibweise.
* **Überschrift im Dokument selbst:** `# UIQ — Übergabeprotokoll TT.MM.JJJJ →
  TT.MM.JJJJ` (Session-Enddatum → Folgedatum, mit Bindestrich-Pfeil).
* **Kopf-Metadaten direkt darunter:** `**Datum:**`, `**Status:**`,
  `**Zweck:**` — jeweils als eigene Zeile, passend zum Header-Stil der
  übrigen `docs/`-Dokumente dieser Session.
* Dieser PFLICHT-HEADER-Block (inkl. der Punkte 6–8) wird **unverändert** an
  den Anfang jedes neuen Übergabeprotokolls kopiert, vor den eigentlichen
  Session-Inhalt (Stand/Roadmap) — er ist die feste Vorlage, nicht Teil des
  tagesspezifischen Inhalts. Neue Punkte kommen nur hinzu, wenn Axel sie
  freigibt.

---

## Technische Stolperfallen / Werkzeuge (Stand 26.09.2026)

* **Cloudflare-Cron zählt Wochentage anders als GitHub:** In Cloudflare Cron
  Triggers ist `1` = **Sonntag** (Dashboard zeigt `15 04 * * 1-6` als „Sunday
  through Friday“; durch Logs bestätigt). In GitHub-Actions-Cron ist `0` =
  Sonntag, `1-5` = Mo–Fr. Dieselbe Zeichenkette bedeutet also auf beiden
  Plattformen etwas anderes — bei jeder Cron-Angabe prüfen, wo sie gilt.
* **Watchdog-Dispatches erscheinen in GitHub als „Manually run by ahsub“**
  (PAT läuft auf Axels Konto) — nicht mit Axels eigenen Nachstarts verwechseln.
* **Web-Upload in Unterordner:** GitHub „Upload files“ legt die Datei in den
  Ordner, in dem man gerade steht. 26.09.: `dsr_check.py` landete in
  `analysis/` statt `analysis/regime_compare/` (neue Datei statt Ersatz) —
  behoben (`8860ea0`, `22c113b`). Nach jedem Upload Pfad im Commit prüfen.
* **Private Repos (`uiq-legal`) kann Claude nicht einsehen** — Commits dort
  nicht verifizierbar; Integrität über SHA-256 der Quelldateien prüfen.
* **Öffentliche Repos:** Claude liest per `git clone`/`git fetch` (anonym);
  die GitHub-REST-API ist in der Sandbox nicht freigegeben. Byte-Vergleich
  nach Commit per `git show origin/main:<pfad> | cmp - <datei>`.
* **Public-Endpunkte lokal abrufen (Axels Mac):** Token verdeckt einlesen
  (`read -s -p "UIQ-Token: " T`), Befehle in einer Zeile mit `;` getrennt
  (mehrzeiliges Einfügen verlor Zeilenumbrüche), danach `unset T`.

---

## Stand nach heutiger Session — laut Vorsession, von dir noch nicht verifiziert

### A. Produktion: `generate_public_recommendations.js` v1.25 — committet, NICHT live bestätigt

* Commit `cba63d6` (UIQ-Suite). Einzige Codeänderung:
  `mcm_regime: masterData.strategyMeta?.regimeUsed ?? masterData.meta?.regimeUsed ?? null`
  (vorher `strategyMeta?.regime` — Feld existiert im Aggregator nicht; Folge bis
  v1.24: `Regime: null` im Log, `market_regime.mse_regime = null` im Digest,
  `regime = null` in allen Decision-/Ledger-Snapshots, meanrev ohne Regime).
  `mcm_context_downgrades` bewusst unverändert (Feld wird vom Aggregator nie
  geliefert → immer `[]`, im Code kommentiert).
* **Erster Lauf mit v1.25** voraussichtlich **So 27.09. ~04:15 UTC** (Watchdog-
  Dispatch, s. D). Trading-Day-Skip greift (gleicher Handelstag 25.09.) → keine
  Anthropic-Calls, aber der Snapshot wird vorher gebaut → Log-Zeile
  `SNAP-… — Regime: <Wert>` ist die erste Verifikation.
* **Vollständige Verifikation** erst nach dem Lauf Mo 28.09. 22:00 UTC (neuer
  Handelstag): `public/digest/latest → market_regime.mse_regime` belegt,
  neuer Decision-Snapshot mit `regime != null`.
* Prompts waren nie betroffen (lesen `mcm_regime` nicht). Separater Befund:
  Die Prompts enthalten das MSE-regime_v2 überhaupt nicht — eigene
  Entscheidung, nicht Teil des Fixes.

### B. Externes Telefonat am 28.09.

* Telefonat mit der Bundesbank am 28.09.; Vorbereitung, Unterlagen und
  Audit-Mappe im privaten Repo `uiq-legal`.
* **Bis nach dem Telefonat keine Änderungen an Code, Public-UI oder
  Public-Ausgaben** (Ist-Zustand bleibt reproduzierbar). Danach Umsetzung der
  Bereinigung (s. „Diagnostiziert, nicht behoben“, Punkt 1) unter
  Berücksichtigung des Gesprächsergebnisses.

### C. Backtest / Go-Kriterium 2 (№34) und №70(b) — Forschung + Doku, committet

* **Look-ahead-Fehler** in `refundex/engine/backtest_2007_2026.py`: Regime aus
  VIX/VIX3M-Schluss von Tag t auf die Rendite desselben Tages t angewendet.
  Die zitierten Sharpe-Werte 1,76 (26.08.) und sehr wahrscheinlich auch 1,66
  (07.08.) stammen aus diesem Fehler. Skript als ÜBERHOLT markiert, startet
  nur noch mit `--legacy-lookahead` (`e8187a2`).
* **DSR-Modul v1 hatte Einheitenfehler** (annualisierte Sharpe mit täglicher
  Beobachtungszahl im Standardfehler; Default-Streuung 1,0) → alle bisherigen
  DSR-Werte (18.08., 23.08., SUITE 4.32) sind Rechenartefakte. Korrigiert:
  `ko-aggregator/analysis/deflated_sharpe_ratio.py` v2.0 mit Selbsttest
  (`python3 deflated_sharpe_ratio.py --selftest`).
* **Forschungsfassung** `analysis/regime_gate_backtest_v2.py` v2.2 und
  `analysis/regime_compare/dsr_check.py` v2.0 (`98cc7f2`, `22c113b`).
  Hauptkennzahl = Differenzrendite gegenüber Buy & Hold (Newey-West,
  einseitig). Ergebnis: **keine geprüfte Variante schlägt Buy & Hold**
  (Gate A Lag 1: IR −0,25, p 0,90; regime_v2: IR −0,19, p 0,82; alle
  Vorzeichen negativ). Keine allgemeine Widerlegung des Regime-Moduls — nur
  der Long/Flat-Gate-Verwendung.
* **SUITE.md 4.32/4.33** (`eec2e56`, `649e6cf`): №34 „WIEDER GEÖFFNET — NICHT
  VALIDIERT“, dann Korrektur 4.33 mit **neu gefasstem Go-Kriterium 2**
  (signifikant besser als Buy & Hold bei Lag 1/5 bp **und** Vorzeichen positiv
  bei Lag 2 und 20 bp; DSR/CAGR/MaxDD nur berichtend). №70(b) beantwortet.
  Offene Entscheidung (Axel): eigenes Kriterium für reine
  Risikofilter-Eigenschaft (weniger Drawdown ohne Renditevorteil)?
* **Doku-Nachträge** zu 18.08./23.08. (`33fba99`).
* **Extern:** keine Backtest-Kennzahlen nennen, bis ein Test nach dem neuen
  Go-Kriterium bestanden ist.

### D. Fair-Value-Spec v2.1 — Point-in-Time-Regel (`28292aa`)

* Neuer verbindlicher Abschnitt PIT-1 bis PIT-7 in
  `docs/FAIR-VALUE-ENGINE-V2-SPEC-2026-09-17.md` (nur archivierte Werte,
  Erfassungszeitpunkt maßgeblich, Signal Schluss t → Rendite danach, Join über
  `meta.last_trading_day`, damaliges Universum, unveränderliche Archive,
  Look-ahead-Selbsttest in jedem Backtest). Gilt sinngemäß für №70.

### E. SUITE.md-Stand

* 4.31 (№70 nachgetragen), 4.32 (№34 wieder geöffnet), 4.33 (DSR-Korrektur,
  Go-Kriterium 2 neu). Kosmetik aus 4.31 (doppelte Tabellenkopfzeile) in 4.32
  behoben.

---

## Diagnostiziert, NICHT behoben (Backlog-Kandidaten, alle ungeprüft durch dich)

### 1. Public-Output-/UI-Bereinigung (Umsetzung nach dem 28.09.)

* **Oberfläche (`axel-scanner/index.html` v513):** Rechner mit Eingaben für
  Depotgröße/Cash/Risiko-% (Deep-Dive „ATR-Positionsgröße“ Z. ~4165,
  `calcDdPosition()` Z. ~23040; Einstellungen „Portfolio & Risiko“ Z. ~3533;
  KO-Hebelrechner Panel `rechner`) im Public-Modus sichtbar; Kennzeichnungen
  „Kaufsignal / Kein Einstieg“ (Z. ~9650, 9689, 10112, 10506); feste
  Handlungshinweise im Markt-Urteil (Z. ~13150–13156, u. a. „max. €2.000 pro
  Position“, „Positionsgrößen auf 50 % reduzieren“) und Z. ~20273.
* **Zugang:** Browser-PIN im Quelltext (`DEFAULT_PIN`, Fallback `'1234'`);
  EIC-PIN wird beim ersten Aufruf vom Besucher selbst gesetzt (nur UI,
  serverseitig über `isOwner` geschützt).
* **Öffentliches Repo `ko-aggregator`:** tägliche Snapshots (alle Ranglisten,
  `fairValueV2` mit Upside %) und Track-Record-Backup öffentlich.
  `ko-ai-worker.js` (Repo `workers`) enthält persönliche Depotangaben im
  Prompt-Text.
* **Ausgaben (Lauf 25.09., geprüft):** Morning Briefing mit „Top-Kandidaten“
  und handlungsnahen Formulierungen (anderer Erzeugungsweg,
  `generate_daily_snapshot()` im Aggregator, Sprachregeln greifen nicht);
  STRATEGIEPRINZIP-Block bei Momentum/Value mit internen Anweisungen und
  Handelsregeln (Fix war ohnehin geplant); Strike-Näherungswert im
  Public-Text CSP/Wheel; `dce.direction: "SELL"` im Digest;
  `strategyGates.action` „… voll freigegeben“.
* **Disclaimer:** verweisen auf „§ 1 WpHG“ und teils „keine
  Anlageempfehlung“; Richtung: Pflichtangaben (Identität, Methodik,
  Interessenkonflikte) statt Disclaimer — abhängig vom Gesprächsergebnis.

### 2. Datenfehler Optionsstrategien (B1/B2/B2b)

* **B1 — Preisfilter wirkungslos:** `DEFAULT_OPTS_CFG.maxPrice = 150` wird in
  `selectOptionsCandidates()` (v1.25 Z. ~1837–1853) nie angewendet (nur Prompt
  + `filter_preset`-Ausgabe); Client filtert (index.html Z. ~19339).
  Paritätslücke. Fix: Filter nachziehen oder `filter_preset` nicht ausgeben
  (Designfrage: Kursgrenze hängt eigentlich am Kapital des Nutzers).
* **B2 — falscher Score im Digest/Ledger:** `top20()` (Aggregator
  Z. ~5812–5829) übernimmt `sCsp`/`sAtmna`/`sCc` nicht in `_core` →
  `buildDecisionSnapshot()` fällt still auf den Composite-Score zurück.
  Betrifft Digest und Ledger aller fünf Options-Strategien seit v1.4
  (16.09.). Fix: Felder in `_core` (7-Stellen-Checkliste), stiller Fallback →
  Warnung; Ledger nicht rückwirkend ändern.
* **B2b — CSP-Ranking faktisch willkürlich:** `score_options_csp()` sättigt
  bei 100 (am 25.09. 48 Titel), stabile Sortierung → Reihenfolge der
  Titelliste entscheidet (GS/CME/SPGI/ABT = erste 100er). Methodik-
  Entscheidung (Tie-Breaker oder ungekappter Rohwert), Track-Record-relevant,
  vor Umsetzung dem Reviewer vorlegen.
* Weitere: Value und KO-Long zeigen dieselben drei Titel; meanrev
  MBGAF + MBG.DE (gleicher Emittent); PFE-Payout 2,3 % bei 6 % Rendite
  unplausibel.

### 3. Zeitsteuerung & Redundanz (Reihenfolge ist entscheidend)

* **GitHub-Scheduler-Verzug** betrifft alle zeitgesteuerten Workflows
  (Aggregator 22:00 → ~00:20 UTC; Datenquellen-Check bis ~4 h 50; TR-Backup
  3 h 15; CoT 5 h 07). Kein UIQ-Codeproblem.
* **`ko-cron-trigger` ist in Cloudflare nicht deployt** (Code/Doku im Repo
  `workers` beschreiben eine nicht existierende Redundanz).
* **`ko-watchdog` deployt mit altem Zeitplan** `15 04 * * 1-6` und
  `45 13 * * 1-5` (Repo: `45 22 * * 1-5`), Code erwartet den neuen →
  „unbekannter Cron, Fallback auf Datums-Check“. Wegen Cloudflare-Wochentag
  (1 = Sonntag) feuert er So–Fr → **dispatcht jeden Sonntag und Montag früh
  einen Aggregator-Lauf** (Datum veraltet). Kosten: keine (Trading-Day-Skip).
* **FIN-Archiv hängt an diesem Zufall:** Shard-Wochentag und Samstags-Merge
  folgen dem UTC-Wochentag der Laufzeit (`fin_layer.run()`). Shard 1 kommt
  nur aus dem Montags-Dispatch des Watchdogs, Shards 2–5 aus den verspäteten
  Nachtläufen, der Merge aus dem nach Mitternacht startenden Freitagslauf.
  **Wer Verzug oder Watchdog repariert, ohne vorher zu entkoppeln, erzeugt
  stille Archivlücken** (vgl. fehlende Woche W32).
* **Reihenfolge:** (1) FIN-Shard/Merge von der Wanduhr entkoppeln
  (Handelstag bzw. `tr-backup-saturday.yml`) → (2) Watchdog mit korrekter
  Cloudflare-Syntax neu deployen → (3) `ko-cron-trigger` deployen oder aus
  dem Repo entfernen (bei Deploy: Trading-Day-Skip/`concurrency` gegen
  Doppelläufe prüfen) → (4) Kommentare in `wrangler.toml`, cron-trigger und
  `market-aggregator.yml` bereinigen.

### 4. Sonstiges Technisches

* **Runner-Pin vor dem 19.10.2026:** `ubuntu-latest` → `ubuntu-24.04`
  (Umstellung auf Ubuntu 26); Node-20-Deprecation-Warnung im Log.
* `mcm_context_downgrades` wird nie geliefert — entscheiden: im Aggregator
  befüllen oder im Skript entfernen.

---

## Roadmap ab 27./28.09.2026 (in dieser Reihenfolge)

1. **So 27.09. vormittags (optional, Axel):** Watchdog-Lauf in GitHub Actions
   („Manually run“) → Log `SNAP-… — Regime:` ≠ `null`? Erste Bestätigung v1.25.
2. **Mo 28.09.:** Telefonat. Gesprächsnotiz → `uiq-legal`. Daraus
   SUITE.md-Backlog-Eintrag (Public-Bereinigung + B1/B2/B2b + Zeitsteuerung)
   mit Priorisierung nach Gesprächsergebnis; im öffentlichen Repo nur knapper
   Verweis.
3. **Di 29.09. früh:** Lauf vom Montagabend prüfen → `mse_regime` im Digest
   belegt, Decision-Snapshots mit `regime` → v1.25 vollständig bestätigt.
4. **Danach, eine Produktionsänderung pro Nacht:** zuerst FIN-Entkopplung
   (Voraussetzung für die Zeitsteuerung), dann STRATEGIEPRINZIP-Fix, B2
   (Score-Feld), Runner-Pin (vor 19.10.), Watchdog/cron-trigger, B1;
   Public-Bereinigung nach Gesprächsergebnis einplanen. B2b erst nach
   Methodik-Entscheidung.

---

## Sonstiges

* №71 Event & Surprise Gate und №70 earnings_invest (Prüfung (a) PIT bei
  Alpha Vantage) bleiben geparkt.
* Alle heutigen Commits wurden von der Vorsession per Byte-Vergleich gegen die
  gelieferten Dateien geprüft (ausgenommen `uiq-legal`, privat).
