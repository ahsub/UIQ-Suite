## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v1.2 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Das Finden von Lücken ist keine Kritik an der Vorarbeit — es ist der Job
   dieser Session. **Heute (10.09.) war das der eigentliche Kern des Tages,
   s. Punkt 3 unten — nicht nur Theorie.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug,
   nie für eine schnelle Plausibilitäts-Antwort.**

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# UEBERGABE-2026-09-10

**Für die nächste Session. Schließt an das Übergabeprotokoll vom
09.09.2026 an.**

---

## 1. Deployed/Live-Stand (Stichtag Ende 10.09.2026)

| Datei | Version | Repo | Status |
|---|---|---|---|
| `market-aggregator.yml` | **v1.1** | ko-aggregator | Committed, SHA-256-validiert, live getestet (Run #293, s. Punkt 2) |
| `generate_public_recommendations.js` | **v1.2** | UIQ-Suite | Committed, SHA-256-validiert (zwei Commits heute) |
| `scripts/vendor/ko-prompts.js`/`ko-markov.js` | unverändert | UIQ-Suite | Byte-identisch zu `ko-modules@a5473ac` verifiziert (kein Drift) |

## 2. Heute abgeschlossen: AI_delivery_public — GHA-Integration live, inkl. zwei Nachbesserungen

Die beiden aus dem 09.09.-Protokoll offenen Punkte (Punkt 10/11) sind erledigt:

- **GHA-Workflow-Schritt gebaut und live getestet** (Run #293, manuell
  getriggert, 24m 22s, **10/10 Strategien erfolgreich**, Exit Code 0).
  Drei neue Steps in `market-aggregator.yml`: Checkout UIQ-Suite (öffentliches
  Repo, kein PAT nötig), Node.js Setup, Generate Public Recommendations.
  Frequenz-Guard (`MORNING_RUN_CRON`-Vergleich) verhindert, dass der 2x/Tag
  feuernde Job versehentlich 2x/Tag statt der beschlossenen 1x/Tag einen
  Public Digest erzeugt.
- **Kostenfaktor-Fix (Axel-Fund während des Testlaufs):** Trading-Day-Skip-Check
  ergänzt (`readFromCloudflareKV()`, Baustein 16b) — vergleicht `snapshot.date`
  gegen das zuletzt veröffentlichte Digest-Datum, überspringt alle zehn
  Anthropic-Calls, wenn kein neuer Handelstag vorliegt (Wochenende, jeder
  Börsenfeiertag in jedem Markt — bewusst kein Feiertagskalender, rein
  datengetrieben über `market_aggregator.py`s `get_last_trading_day()`,
  SPY-basiert). `FORCE_REGENERATE=true` als Escape-Hatch. Fail-open bei
  KV-Lesefehlern (Axel-Entscheidung, bestätigt) — **noch nicht in der Praxis
  auf einen echten Fehlerfall getestet**, nur der Erfolgspfad.
- **Vendor-Kopie-Wartungsrisiko (Punkt 11, 09.09.) gelöst:** `checkVendorDrift()`
  ergänzt — vergleicht `scripts/vendor/ko-prompts.js`/`ko-markov.js` beim
  Start gegen `ko-modules@a5473ac`, warnt LAUT bei Abweichung statt still zu
  veralten. Bewusst KEIN reiner Fetch-at-Runtime-Ersatz (hätte dieselbe
  "Pin muss von Hand nachgezogen werden"-Schwäche wie `KO_INDICATORS_JSON_COMMIT`
  und würde eine neue harte Netzwerk-Abhängigkeit für etwas zwingend
  Benötigtes einführen). Beide Pfade (OK/Drift) isoliert getestet, nicht nur
  syntaktisch geprüft.

Alle Änderungen SHA-256-validiert gegen den tatsächlich committeten
GitHub-Stand, nicht nur gegen die lokal erzeugte Datei.

## 3. Wichtigster Fund des Tages: die Backlog-Liste (mein Gedächtnis) war an mehreren Stellen veraltet

Auf Axels Bitte ("welche Prioritäten würdest du setzen") wurden mehrere als
"offen" notierte Punkte systematisch gegen den echten Code geprüft — mit
überraschendem Ergebnis: **die meisten waren bereits erledigt**, teils
deutlich durchdachter als in meinen Notizen beschrieben.

**Bereits erledigt, fälschlich als offen geführt:**
- **Watchdog Dual-Slot-Freshness-Check** — `ko-aggregator/workers/ko-watchdog/ko-watchdog.js`,
  Fix bereits vom 09.09.2026. Zwei Cron-Slots (04:15 UTC Lauf 1, 13:45 UTC
  Lauf 2), `event.cron`-basierte Zuordnung, Slot-spezifische ISO-Schwelle
  statt reinem Datumsvergleich — vollständig gelesen und nachvollzogen, nicht
  nur Kommentar geglaubt. **Zusatzfund:** es gibt einen zweiten, unabhängigen
  Absicherungs-Worker (`ahsub/workers/cron-trigger/ko-cron-trigger.js`),
  unbedingter Redundanz-Trigger nur für Lauf 1 — überschneidet sich harmlos.
- **Server-seitige Ticker-Scope-Sperre + "stabil"-Zweitkontrolle** —
  `scanForTickerScopeViolations()`/`COMPLIANCE_PATTERNS` in `ko-ai-worker.js`,
  v1.13 vom 06.09.2026, vollständig verdrahtet (`scanForComplianceViolations(text).concat(scanForTickerScopeViolations(text))`,
  Log unter `[COMPLIANCE]`, sichtbar via `/logs?flagged=1`). **Zusatzfund:**
  ein dritter Scanner `scanForNumericFabrication()` (v1.20, EIC-Modus,
  §23-Zahlenerfindungs-Check) war in keiner meiner Notizen erwähnt.
- **Ebene-A-KV-Endpunkt** (09.09. entschieden) — `pushToCloudflareKV(snapshot, 'public/marketstate/latest')`
  steht bereits in `generate_public_recommendations.js`, war schon vor den
  heutigen Patches Teil des Codes.
- **IVP `days_percentile`-Integration** — vollständig gebaut, `market_aggregator.py`-Kommentar
  datiert 07.09.2026.
- **`my-cors-proxy` in GitHub versioniert** — liegt in `ahsub/workers/my-cors-proxy-worker.js`,
  inhaltlich vermutlich erledigt, aber ohne die Changelog-Dokumentation der
  übrigen Dateien (stilistischer Nachholbedarf, keine fehlende Versionierung).

**Existiert, aber veraltet (kein Neubau, aber Auffrischung fällig):**
- **`RUNBOOK.md`** — 151 Zeilen, "Version 1.3, Stand 14.07.2026", referenziert
  Aggregator v5.8.2 (aktuell v5.41.0) und `ko-ai`-Worker v1.5 (aktuell
  deutlich höher). Zwei Monate Rückstand.

**Echt offen, jetzt zweifelsfrei geprüft:**
- **Backlog №64 — `score_options_atmna()`.** Es gibt `score_options_csp()`/`score_options_covered_call()`/`score_options_credit_spread()`/`score_options_collar()`
  in `market_aggregator.py`, aber keine ATMNA-Entsprechung — nur
  `_get_atmna_flag()` (regime-weiter Ampel-Tag, kein Score pro Ticker, exakt
  wie im ursprünglichen Backlog-Eintrag vom 28.08. beschrieben).

**Noch NICHT gegen den Code geprüft** (ungeprüft lassen, nicht als erledigt
oder offen behaupten): Ticker-Onboarding-Skript, CBOE-PCR-Parsing-Anomalie,
Compliance-Scanner-Fehlalarm-Bewertung (`/logs?flagged=1`), Morning-Briefing-Performance-Ursache,
`ko-ai-worker.js`-Duplikat-Entscheidung (zwei Repos: `ahsub/ko-aggregator/workers/ko-ai.js`
und `ahsub/workers/ko-ai-worker.js`).

**Konsequenz für künftige Sessions:** Vor jeder "X ist noch offen"-Aussage
den tatsächlichen Code prüfen, nicht gespeicherten Notizen vertrauen — s.
Pflicht-Header oben, heute mehrfach der Unterschied zwischen "gefühlt
erledigt" und "tatsächlich geprüft erledigt".

## 4. Wichtigste Klarstellung heute: Public Digest ist NICHT an die UI angebunden

Axel fragte gezielt nach, ob eine KI-Strategie-Empfehlung im Public-Modus
jetzt den vorproduzierten Digest statt eines frischen Anthropic-Calls
nutzt. **Antwort, verifiziert per grep über das komplette `index.html`:
Nein.** Weder `openKiBriefing()` (Scanner-Tab) noch `runAlphaLbKI()`
(Alpha Desk) enthalten irgendeine Referenz auf `public/digest/latest` o.ä.
— null Treffer. Beide bauen weiterhin `topResults` live aus `tickerData`
und callen bei Cache-Miss (bestehender kurzlebiger `_kiCache`, unabhängig
von heute) live den `ko-ai`-Worker.

**Das ist der eigentliche, noch nicht eingelöste Zweck des ganzen heutigen
Sprints** — Axels Worte: *"wir wollten eine einmal täglich generierte /
vorproduzierte rapid-response-Antwort im Public-Mode ohne zusätzliche
Kosten anstelle eines frischen, ad-hoc generierten Anthropic-Calls mit den
vollen Kosten pro Abruf"*. Der heutige Kostenfaktor-Fix (Punkt 2) spart
nur unnötige Calls **innerhalb des GHA-Laufs** — das größere Kostenproblem
(volle Live-Kosten pro Nutzeraufruf) bleibt ungelöst, bis die Frontend-
Anbindung steht.

**Das Konzeptdokument sieht diesen Schritt bereits explizit vor** (`UIQ
Public-Betanutzung: Vorab generierte Tages-KI-Empfehlungen — Konzeptdokument
v2`, Abschnitt 8, Schritt 7: *"Frontend-Änderung an `openKiBriefing()`
(Public-Modus fragt zuerst den Vorab-Store ab) als eigener, klar
abgegrenzter Arbeitsschritt"*) — inkl. zwei bereits im Konzept getroffenen
Vorentscheidungen, die morgen direkt nutzbar sind:
- **Nur EIN Standard-Preset pro Options-Strategie, KEIN Live-Fallback** bei
  individuellen Filtern in v1 — klare "aktuell nicht verfügbar"-Meldung
  statt zwei parallele Pfade gleichzeitig zu debuggen (Abschnitt 4.2/8.6).
  Passt zum heutigen Fund, dass der Digest ohnehin nur 10 von 14 Strategien
  abdeckt (die 5 Options-Strategien fehlen).
- **EIC bleibt ausdrücklich live/on-demand**, unberührt von der Umstellung
  (Abschnitt 2, mehrfach betont) — nur der Public-Pfad wird umgestellt.

**Wichtiger, noch ungeklärter Vorbehalt aus demselben Konzeptdokument
(Abschnitt 5/8, Schritt 2):** Der Reviewer empfiehlt die rechtliche
Kurzprüfung **vor** der Architekturfestlegung, nicht erst vor dem Rollout —
Begründung: der Wechsel von individueller On-Demand-Antwort zu
systematischer, identischer öffentlicher Tages-Kommunikation ist laut
Reviewer eine andere regulatorische Ausgangslage (ESMA/MAR-Einordnung,
von Claude nicht verifizierbar, reine Reviewer-Charakterisierung). Die
laufende Anwalts-Review (27.08., Abschnitte 9-11 korrekturbedürftig) ist
weiterhin nicht abgeschlossen. **Einschätzung für morgen:** Da Axel aktuell
alleiniger Nutzer ist (keine Beta-Nutzer, s. 09./10.09.-Notizen), spricht
nichts dagegen, die Frontend-Anbindung technisch zu bauen und zu testen —
aber sie sollte nicht als Signal für eine Beta-Öffnung an echte Nutzer
missverstanden werden, bevor die rechtliche Prüfung abgeschlossen ist.
Diese Unterscheidung explizit mit Axel klären, nicht stillschweigend
annehmen.

## 5. DCE/Fair-Value-Integration — keine neue Entscheidung, nur Einordnung bestätigt

Aus der Session direkt vor dieser: Axels Wunsch, DCE von Anfang an mit
Fair-Value als Eingabedimension zu bauen, wurde nicht abgelehnt, sondern
sequenziert und von Axel bestätigt (*"vollkommen mit deinem Plan
einverstanden"*): **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung (07.09.,
weiterhin offen) → Fair-Value-Engine + eigenständiger Backtest → DCE-Design
(inkl. Fair-Value als validierte Dimension)**. Der tatsächlich nächste
actionable Schritt in dieser Kette ist die Ontologie-Entscheidung — die
war bisher in keiner Backlog-Liste explizit als eigener Punkt geführt.

---

## Für den Einstieg morgen: vorgeschlagene Reihenfolge

1. **Frontend-Anbindung `openKiBriefing()`/`runAlphaLbKI()` an den Public
   Digest** (Punkt 4) — der eigentliche Sinn des gesamten heutigen Sprints,
   höchste Priorität. Vorher kurz mit Axel klären: technisch bauen ja,
   Beta-Öffnung an echte Nutzer erst nach rechtlicher Klarheit (s. Vorbehalt
   oben) — nicht stillschweigend vermischen.
2. **Backlog №64 — `score_options_atmna()`** (Punkt 3) — einzige zweifelsfrei
   bestätigte offene Code-Baustelle aus der alten Liste.
3. **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung** (Punkt 5) — Grundsatzfrage,
   verdient frischen Kopf, schaltet die Fair-Value-Kette frei.
4. Bei Gelegenheit, nicht dringend: die vier noch ungeprüften Backlog-Punkte
   (Punkt 3, letzter Absatz) gegen den Code verifizieren, bevor sie erneut
   als "offen" behauptet werden.
5. `RUNBOOK.md`-Auffrischung (Versionsnummern nachziehen) — klein, aber
   sollte nicht beliebig lange liegen bleiben (Bus-Factor-Dokument).

---

**Axels Einschätzung zum Tag:** Guter, in sich abgeschlossener Ertrag (zwei
saubere, hash-validierte Deployments) — aber der wichtigste Fund war nicht
Code, sondern dass die Backlog-Verfolgung selbst reparaturbedürftig war.
Für morgen: Prüfen vor Behaupten, konsequent.
