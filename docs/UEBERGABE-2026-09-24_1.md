# UIQ — Übergabeprotokoll 24.09.2026 → 25.09.2026

**Datum:** 24.09.2026
**Status:** Session-Ende. v1.23 live und bestätigt. Phase C gebaut und getestet, **nicht committet** (bewusst).
**Zweck:** Kontext-Übergabe für den nächsten Chat
**Nachtrag:** 24.09.2026 nachmittags — GitHub-Recherche/Pareto-Roadmap (SUITE.md №69), s. Abschnitt „Nachtrag“ vor „Sonstiges“

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

* **Dateiname:** `UEBERGABEPROTOKOLL-JJJJ-MM-TT.md` — Großschreibung mit
  Bindestrichen, Datum am Ende im ISO-Format (Datum der Session, an deren
  Ende das Protokoll geschrieben wird — nicht des Folgetags, für den es
  gilt). Beispiel: `UEBERGABEPROTOKOLL-2026-09-23.md`.
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

## Technische Stolperfallen / Werkzeuge (Stand 24.09.2026)

* **GitHub-API Rate-Limit (60/h, unauthentifiziert):** Wiederholen hilft oft, weil
  wechselnde Egress-IPs eigene Limits haben. `raw.githubusercontent.com/<repo>/<sha>/<pfad>`
  hat kein Rate-Limit und keinen CDN-Cache-Versatz → ideal für Byte-Vergleich nach Commit.
* **CDN-Cache-Falle:** `raw.githubusercontent.com/.../main/...` kann 1–2 min veraltet sein.
* **Datei-Commit-Methode:** Dateien >1000 Zeilen per Löschen→Upload oder direktem
  Web-Upload, kein Web-Editor-Copy-Paste.
* **KV lesen (Axels Mac):**
  `npx wrangler kv key get "<key>" --namespace-id 86c05f66e32346b99e720d861fedd1de --remote > datei.json`
  Namespace = `KO_SYNC_KV` (ko-sync/wrangler.toml); schreibt nachweislich auch
  `generate_public_recommendations.js`. Bei Fehler landet nur eine wrangler-Meldung
  in der Datei (Dateigröße prüfen!). Gelegentlich transient → Befehl wiederholen.
* **`/public/ai_output/:strategy` (ko-sync-Worker) verlangt Auth** (`Unauthorized`
  ohne Token) — für Stichproben den KV-Weg nehmen. Keine Tokens eingeben.
* **Anthropic Console → Usage → Group by: Token type → Tabellenansicht** zeigt
  pro UTC-Tag Input / Output / Cache-Read / Cache-Write. Einzige Quelle für
  echte Cache-Werte, bis D2 umgesetzt ist. (Claude in Chrome kann das lesen,
  wenn Axel die Berechtigung erteilt.)
* **Archiv ist write-once** (`writeArchiveIfAbsent`): `archive/recommendations/<datum>/*`
  wird bei erneuten Läufen desselben Handelstags NICHT überschrieben;
  `public/ai_output/latest/*`, `public/digest/latest` und `internal/ai_budget/<datum>`
  dagegen schon.
* **Manueller GHA-Lauf:** nur EINMAL klicken (23.09. zwei parallele Läufe →
  Exit 128). `force_regenerate=true` nur, wenn der Digest für denselben
  Handelstag neu erzeugt werden soll (kostet ~1,60 $).
* **Cloudflare Worker ≠ GitHub Commit:** `wrangler deploy` zusätzlich nötig.
* **Vendor-Drift-Checkliste bei jedem `ko-prompts.js`-Update (vier Stellen):**
  Quelle (`ko-modules`) → Vendor-Kopie (`UIQ-Suite`) → CDN-Pin
  (`axel-scanner/index.html`) → `KO_MODULES_VENDOR_DRIFT_COMMIT`
  (`generate_public_recommendations.js`). Heute nicht betroffen (ko-prompts.js unverändert).

---

## Stand nach heutiger Session — laut Vorsession, von dir noch nicht verifiziert

### A. Ticker-Migrationsdateien (Phase A+B) — erledigt
Alle fünf Dateien am 23.09. 19:45–19:52 UTC committet, heute per Raw-Abruf
verifiziert (audit_result.json: 767 = 563 + 204, 0 Konflikte; ticker_master.json: 818 Einträge).

### D. Kostenoptimierungen — Messung abgeschlossen, Befunde

**D1 Caching: live bewiesen.**
Console 24.09. (UTC): Cache-Write **10.544**, Cache-Read **147.616** = exakt 14 × 10.544
→ 1 Write + 14 Hits wie geplant. Gemessene Präfixgröße: **10.544 Token**
(Protokoll-Schätzung 7.200 war zu niedrig).
Echte Digest-Kosten: 22.09. 1,84 $ (ohne Retry) → 23.09. **~1,40 $ (−24 %)**, fast
vollständig input-seitig. Monatlich grob −9 $. Output-Effekt des Templatings war
nach einem Tag nicht messbar.

**Budget-Log ist ein unvollständiges Messinstrument (Code-verifiziert):**
`recordBudgetEntry()` liest nur `input_tokens`/`output_tokens`, verwirft
`cache_creation_input_tokens`/`cache_read_input_tokens` → Kosten im Log seit
v1.20 zu niedrig (~0,08 $/Tag). Zusätzlich: Budget-Summary wird nur am
Skript-Ende geschrieben → abgebrochene Läufe hinterlassen bezahlte, aber
ungeloggte Calls. Summary hat weder Zeitstempel noch Run-ID.
Lokale Kopien: `~/budget_0922.json`, `~/budget_0923.json` auf Axels Mac
(KV-Key `internal/ai_budget/2026-09-23` wurde durch den manuellen Lauf überschrieben).

**INCIDENT v1.22 (Produktionsfehler, behoben):**
```text
Lauf:        24.09.2026 00:18 UTC, GHA-Run 35937789295
Version:     generate_public_recommendations.js v1.22 / ko-prompts.js v2.54.4
Befund:      public output invalid — Abschnitt 7+8 enthielten die PROMPT-ANWEISUNGEN
             aus _buildAbschnitt78() statt fertigen Text ("PFLICHT-SATZMUSTER",
             "Grundgesetz #11", "EIC-exklusiv", "Kernanliegen des externen Reviewer-Feedbacks")
Umfang:      alle 15 Strategien
Dauerhaft:   archive/recommendations/2026/09/23/*_ai_output.json (write-once)
             → KEINE validen Golden Samples, nie als Referenz/Backtest-Text verwenden
Root Cause:  Denkfehler "derselbe String für Prompt-Anweisung UND Output"
Nicht erkannt, weil: Tests prüften nur Überschriften, nicht Inhalt
```

**Fix v1.23 (`generate_public_recommendations.js`) — committet, verifiziert:**
* Commits: `a1196938` (Hauptdatei), `f27bb54f` (+ `scripts/test_v123_abschnitt78.js`),
  beide Byte für Byte mit gelieferter Version identisch; `main` liefert v1.23.
* Rückbau: Abschnitt 7+8 schreibt wieder das Modell; `ko-prompts.js` unverändert;
  Caching unberührt.
* Neu: `validatePublicSections78Content()` (Inhaltsprüfung, 15 Canary-Marker,
  Längengrenzen; Fehler → Strategie wird nicht veröffentlicht; fehlender
  Modell-Grenze-Standardsatz → nur Warnung).
* Kalibriert gegen 45 archivierte Outputs: 18.09. 15/15 PASS, 22.09. 14/15 PASS
  (fading_short = korrekter Treffer, abgeschnittener Text), 23.09. 15/15 FAIL (korrekt).
  Modell-Grenze-Standardsatz in allen 29 gültigen Outputs vorhanden → Warnung
  könnte später zum Fehler hochgestuft werden.
* **Live-Lauf 24.09. ~05:13 UTC (manuell, force_regenerate):** 14/15 veröffentlicht,
  keine `[ABSCHNITT78-INHALT]`-Zeilen; Stichproben `vcp` und `weekly_income` sauber.
  **`fading_short` blockiert**: Antwort + Retry bei max_tokens (4096) abgeschnitten,
  Abschnitt 9 fehlte → korrekt nicht veröffentlicht.
  Budget: 16 Calls, 253.927 / 50.144 Token, Log 1,51 $ (real ~1,60 $).
* **Offen:** `public/ai_output/latest/fading_short` zeigt weiterhin auf den
  fehlerhaften Text vom 24.09. 00:18 UTC (im Digest fehlt fading_short korrekt).

**`fading_short`-Token-Limit — Hypothese, noch nicht belegt:**

| Lauf | 7+8 | Output fading_short |
|---|---|---|
| 22.09. | Modell | 4096, abgeschnitten (2×) |
| 23.09. (v1.22) | eingefügt | 3992 |
| 24.09. manuell (v1.23) | Modell | abgeschnitten (2×) |

Längster Prompt + längster Output; mit Modell-geschriebenen 7+8 passt es nicht
in 4096. Vor dem Fix im Budget-Log `token_output` beider Calls prüfen (Grundgesetz #9).
Naheliegender Fix: `max_tokens` anheben (kostet nur bei tatsächlicher Nutzung).

**D2 (Messkorrektur Budget-Log) — Design abgestimmt, NICHT gebaut:**
* Rohwerte behalten: `input_tokens`, `cache_creation_input_tokens`,
  `cache_read_input_tokens`, `output_tokens`, `total_input_tokens`
* Kosten getrennt: regular_input / cache_write (1,25×) / cache_read (0,1×) / output
* `cache_status` je Call: `WRITE` / `HIT` / `REQUESTED_NO_EFFECT` / `BYPASS_PREFIX_MISMATCH`;
  Fallback in `buildCacheableContent()` loggt sichtbar
* Summary mit `run_id`, `run_attempt`, Zeitstempel, `force_regenerate`
* Zu entscheiden: Budget-Einträge abbruchsicher schreiben (mehr KV-Writes)

**Option B (Templating neu) — Architekturregel festgelegt, NICHT gebaut:**
Drei strikt getrennte Rollen: `PromptInstruction78()` (Modell bekommt Anweisung) /
`BuildPublicSection78()` (App erzeugt fertigen Text) / `insertAbschnitt78()`
(fertigen Text einsetzen). Nie derselbe String für zwei Rollen. Fester
öffentlicher Wortlaut für `ko`/`fading_short` (bisher „sinngemäß“ vom Modell) ist
eine Produktentscheidung von Axel — nicht unter Zeitdruck.

### B. TICKER_MASTER Phase C, Schritte 1–6 — gebaut, getestet, NICHT committet

**Entscheidungen (Axel + Reviewer freigegeben):**
* E1: Master als `ticker_master.py` (Import, harter Fehler statt stiller Leere)
* E2: Reihenfolge erhalten — Position pro Quellliste und pro Sektor gespeichert
* E3: Kompatibilitätsschicht, alle Listennamen bleiben (abgeleitet); kein Asset-Class-Refactor
* E4: Laufzeitquellen (KV-Extras, ex-IWV, BAD_SYMS) bleiben im Aggregator
* Option B zum DAX-Befund umgesetzt (s. u.), separat dokumentiert

**Dateien (Download aus dem 24.09.-Chat, Ziel: `ko-aggregator/` Repo-Root):**

| Datei | Rolle |
|---|---|
| `market_aggregator.py` | v5.43.1 → **v5.44.0** (11.745 Zeilen), Changelog direkt unter `AGGREGATOR_VERSION` |
| `ticker_master.py` | NEU, 684 Ticker, `_validate()` beim Import |
| `test_phase_c.py` | optional (Audit-Trail), braucht `market_aggregator_old.py` daneben |
| `migrate_ticker_master_phase_c.py` | optional (Audit-Trail), Generator, reproduziert Master byte-identisch |

**Tests lokal (alle bestanden):** Mitgliedschaft (Universum 679 = 679, alle Listen/
22 Sektoren/8 markets-Gruppen), Reihenfolge (exakt, inkl. `sectors` je Ticker und
Universum), Pro-Ticker (684 Ticker, 0 Abweichungen), Laufzeitquellen (mit
simulierten KV-Extras/ex-IWV identisch, BAD_SYMS greift), Mutationstest,
4 Validierungs-Fehlerfälle, 2 Negativkontrollen (Test schlägt bei absichtlichem
Fehler korrekt fehl). 201 Kommentarzeilen aus den alten Listen-Literalen sind
in `ticker_master.py` den Tickern/Sektoren zugeordnet erhalten.
Einzige beabsichtigte Abweichung: Duplikate innerhalb einer Liste entfernt
(SP500: NEE/UPST/HOOD/AFRM/SOFI; INTL_TIER1: VALE/BHP/RIO) — ohne Wirkung.

**DAX/MDAX-Befund — entschieden (Option B):**
Die Heimatbörsen-Listen waren bewusst NICHT im Universum (Code-Kommentar: durch
`EU_ADR_TICKERS` ersetzt, wegen US-Optionen). Sie speisten nur sieben Gruppen im
`master["markets"]`-Block (dax40, mdax, tecdax, eurostoxx, intl_eu, ftse100,
stoxx_eu); „dax40“ bestand zu 12/13 aus BEAR_DE_EU-Titeln. Restsuche über
84 Code-Dateien in 6 Repos: **kein Leser** des markets-Blocks → Listen + Gruppen
in v5.44.0 entfernt. Wiederaufnahme deutscher Titel wäre ein eigenes Feature
(dann als Daten im Master).

**Commit A — Regeln (Reviewer-bestätigt):**
* `market_aggregator.py` + `ticker_master.py` **in EINEM Commit** — getrennt wäre
  es ein kaputter Deployment-Zustand (ImportError → keine Daten).
* Nichts anderes hineinmischen (kein ex-IWV-Fix, kein Aufräumen alter Skripte,
  keine Asset-Class-Architektur).
* Danach manueller Lauf **ohne** `force_regenerate` (Digest wird übersprungen,
  keine Anthropic-Kosten). Prüfpunkte:
  1. `Ticker-Universum: … Titel` = Wert des letzten Laufs vor dem Commit (NICHT
     679 — der Log-Wert enthält KV-Extras); Differenz nur durch geänderte
     KV-Extras erklärbar
  2. kein ImportError / `TICKER_MASTER ungueltig`, Lauf grün
  3. `master["markets"]` hat genau 8 Gruppen; Stichproben + `sectorWatchlists`-Reihenfolge unverändert
* Vergleichswert aus dem manuellen Digest-Lauf 24.09.: „737 Ticker geladen“.

Damit sind Phase-C-Schritte 7 (OLD==NEW gegen umgebauten Produktivcode) und
8 (alte statische Quellen entfernt) lokal erledigt; offen: 9 (E2E) und 10 (echter Lauf).

---

## Roadmap für 25.09.2026 (in dieser Reihenfolge)

**1. Nachtlauf 24.09. 22:00 UTC prüfen (v1.23 im Normalbetrieb):**
15/15 oder erneut fading_short blockiert? `[ABSCHNITT78-INHALT]`-Zeilen?
`Regime: null` im Snapshot auch hier? Startzeit (Verzögerung wie am 24.09. 00:18?)
Aus dem Aggregator-Schritt `Ticker-Universum: … Titel` notieren (Vergleichswert für Phase C).

**2. Commit A (Phase C) + manueller Lauf ohne force_regenerate + drei Prüfpunkte.**

**3. fading_short:** `internal/ai_budget/2026-09-24` lesen → `token_output` = 4096
bei beiden Calls? Dann `max_tokens`-Fix als eigene Änderung in
`generate_public_recommendations.js` (erst nach bestätigtem Phase-C-Lauf committen).

**4. Danach nach Tagesform:** D2 · Phase C Schritt 9/10 abschließen · Backlog.

---

## Backlog (neu oder bestätigt heute, alle ungeprüft wenn nicht anders vermerkt)

* **ex-IWV-Survivorship-Fix inaktiv (Code-verifiziert):** `_load_ex_iwv_tickers()`
  nutzt `Path(__file__).parent.parent` (aus `engine/update_iwv.py` übernommen, dort
  korrekt) → zeigt aus dem Repo heraus; zusätzlich existiert `data/ex_iwv_tickers.csv`
  nicht (nur `data/iwv_holdings.csv`). Nur den Pfad zu fixen reicht nicht. Erst
  klären, wie die Datei entstehen soll, dann separat fixen/testen. Log-Bestätigung
  (`[ex_iwv] … weiter getracked` fehlt?) steht aus.
* **STRATEGIEPRINZIP-Block mit internen Notizen im öffentlichen Text**
  (z.B. „KORRIGIERT 08.09.2026, Live-Test-Fund“, „NIEMALS …“) — belegt seit
  mindestens 18.09.; Modell übernimmt den Prompt-Text.
* **Preisfilter Options-Strategien greift offenbar nicht:** weekly_income hat
  `maxPrice: 150`, empfiehlt aber MELI (1.799 $) und CME (~270 $). Evtl. Ursache
  dafür, dass csp_wheel/weekly_income/collar identische Top-3 haben (CME, CSCO, MELI).
* **Top-3 für denselben Handelstag nicht reproduzierbar:** vcp Nachtlauf JNJ/MO/EOG,
  manueller Lauf 5 h später PG/MO/EOG (beide Datum 23.09.). Relevant für
  Track-Record-Reproduzierbarkeit (Archiv hält Nachtlauf, `latest` den neueren).
* **vcp: widersprüchliche Score-Angaben im Text** (Abschnitt 3 „MO Score 83“,
  Abschnitt 9 „MO VCP-Score 100“) — vermutlich zwei Felder, für Leser nicht unterscheidbar.
* **`dividend` mit nur 2 Top-Kandidaten** (VLO, PSX) im manuellen Lauf.
* **`Regime: null`** im Snapshot des manuellen Laufs (QQQ: BULL).
* **Archiv-Lücke 21.09.:** alle 15 `archive/recommendations/2026/09/21/*_ai_output.json`
  nicht abrufbar (vermutlich nicht vorhanden).
* **Nachtlauf-Verzögerung:** Cron 22:00 UTC, Start am 24.09. um 00:18 UTC.
* **Abschnitt 7 datiert „Snapshot-Zeitpunkt 24.09.“**, Daten stammen vom 23.09. (Unschärfe).
* **Phase-A/B-Werkzeuge** (`audit_ticker_sources.py`, `migrate_ticker_master_phase_b.py`,
  `ticker_master.json`) nach Phase C als historisch markieren — sie parsen Listen-
  Literale, die es nicht mehr gibt; `ticker_master.json` ist durch `ticker_master.py` abgelöst.
* **`add_ticker.py`** (ursprüngliches Ziel) erst nach stabilem Phase-C-Lauf.
* Aus dem 23.09. unverändert offen: **earnings_invest** erster echter Archivlauf,
  dann Phase 1; `market_aggregator.py` Earnings-Vorfilter für KI-Enrichment (Backlog #61).

## Nachtrag (Parallel-Chat 24.09.2026, nachmittags): GitHub-Recherche & Pareto-Roadmap — SUITE.md №69

*Ergänzt in einem separaten Recherche-Chat, **ohne** Änderung der obigen Inhalte. Die Roadmap für 25.09. oben bleibt vorrangig; №69 beginnt erst danach.*

### 1. Ergebnis dieser Session (Kurzfassung)

- 16 öffentliche GitHub-Repos zu Owner Earnings / Buffett-/Value-Tools gesichtet. Code und Inhalte jeweils selbst gelesen, **nichts ausgeführt**.
- Pareto-Auswahl gemeinsam mit Axel beschlossen und als **SUITE.md №69** verankert (Version 4.26 → 4.27).
- Leitlinie: **Beweisbarkeit und Determinismus vor neuen Features.**
- Sicherheitsfund: ein Repo war Malware (s. Abschnitt 4).

### 2. Beschlossene Reihenfolge (verbindlich, Details in SUITE.md №69)

| Schritt | Inhalt | Aufwand (Schätzung) | Status |
|---|---|---|---|
| 0 | Abschnitt-7/8-Templating abschließen — **siehe Klärungsbedarf unten** | offen | ungeprüft |
| A | Aggregator-Robustheit: RUN ≠ DATA ≠ DATA QUALITY SUCCESS; relative Mindestabdeckung vor KV-Write; Same-Date-Fallback; Heartbeat. Dazu Point-in-Time-Regel in der Fair-Value-Spec | ~1 Session | offen |
| B | Faber-10M-SMA vs. VIX3M/VIX-Gate vs. Buy-and-Hold, ohne Tuning, Erfolgskriterium vorab fixiert | ~0,5–1 Session | offen |
| C | Automatische Feldprüfung in `uiq-devtools` (PASS / MISSING / AMBIGUOUS) | ~1 Session | offen |
| D | JSON-Sidecar + deterministischer Prüfer (LLM liefert nur Behauptungen, Code setzt `match`) | ~1,5–2 Sessions | offen |

**Vor Schritt B schriftlich festzulegen:** Zeitraum (18.09.2009–05.08.2026), Faber-Regel (SPY-Monatsschluss, Umsetzung Folgemonat), Kostenannahme, Kennzahlen (Sharpe, Max Drawdown, Umschlag) und Entscheidungsregel.

### 3. Stoffsammlung (Bewertung je Repo)

| # | Repo | Lizenz | Urteil | Verwertbar für UIQ |
|---|---|---|---|---|
| 1 | ChenFindling/tragic-algebra-analyzer | keine | **Kern (Stufe C)** | SBC-Korrektur Ω, OE = N + G − Ω; implizite Rendite (IVB); EDGAR-Regeln (Jahresberichte, 330–400 Tage, Tag-Rangfolge mit Auffüllen, Splits); Look-ahead-Hinweis |
| 2 | TurtleDaddy69/owner-earnings-dcf | keine | streichen | nur Sensitivitätsmatrix als UI-Idee; OE-Definition fachlich falsch |
| 3 | quyaoshun/value-investing-research | keine | **Kern (Stufe B/C)** | Selbstwiderlegung mit Kippschwelle; Realitätsanker; [R]/[C]/[E]/[3P]-Kennzeichnung; Unsicherheit nicht im Diskontsatz verstecken |
| 4 | rogerbartumeu/quantamental-equity-value-screener | MIT | Randnotiz | zinsabhängige FCF-Hürde (nur README); README ≠ Code |
| 5 | 1998x-stack/buffett-value-investing | keine | streichen | Persona, direktiv; Owner-Earnings-Quelle falsch datiert (1984 statt 1986) |
| 6 | michaelgiovannisie/WormToDragon | keine | Randnotiz | Endwert doppelt (ewige Rente vs. Exit-Multiple); DCA-Signal direktiv → nicht übernehmen |
| 7 | agi-now/buffett-skills | keine | **Kern (Stufe B/C)** | Value-Fallen-Warnzeichen; Gewinnqualitäts-Warnsignale; Stresstest Umsatz −30 % |
| 8 | strapi/buffet | – | themenfremd | React-UI-Bibliothek |
| 9 | will2025btc/buffett-perspective | MIT | streichen | Ich-Persona einer realen Person |
| 10 | vikd1000/investment-council | MIT | **Kern (Schritt C)** | `validate.py`-Feldprüfung; Belege pro Kriterium + `missing_fields`; Uneinigkeit der Scores |
| 11 | ketan1741/Benjamin-Graham-and-Warren-Buffett-Model-Stock-Exchange- | GPL-3.0 | streichen | Indien, 5 feste Filter, Scraper veraltet; GPL → kein Code |
| 12 | j-poc/buffet-scanner | keine | **Kern (Schritt A)** | Mindestzeilen-Sperre; Universum aus Wikipedia/iShares IWB; sektorabhängige Schwellen; Veto-Deckel; yfinance-Insider-Datenfehler |
| 13 | Choppy-superfamilymuscoidea9021/buffett-skills | – | **⚠️ MALWARE** | s. Abschnitt 4 |
| 14 | kdtmac/buffett-engine | MIT | **Kern (A/B/C)** | OE-Spanne (gesamter Capex vs. Erhaltungs-Capex ≈ Abschreibungen); Herkunft pro Wert; Daten → Schema → Rechenschicht; Faber-10M-SMA; Heartbeat-Mail |
| 15 | 397367315-hub/ai-buffett-quant | keine | themenfremd | nur Datumsdisziplin: Quelldaten getrennt anzeigen, Ersatzquelle nur mit gleichem Datum |
| 16 | georgeztian/buffett-equity-research-graph | MIT | **Kern (Schritt D)** | JSON-Sidecar + Schemaprüfung + Text↔JSON-Abgleich; Aktualitätsprüfung; „Code owns control flow, LLM owns content" |

### 4. Sicherheitswarnung

`Choppy-superfamilymuscoidea9021/buffett-skills` ist eine Kopie von #7 mit einer ZIP-Datei `skills/skills-buffett-3.3.zip`. Inhalt: `Application.bat` (`start compiler.exe gc.txt`), `compiler.exe`, `lua51.dll` und ein verschleiertes `gc.txt`. Das ist das LuaJIT-Loader-Muster, über das Infostealer verteilt werden.

- In dieser Session nur gelesen, nicht entpackt; die lokale Kopie wurde gelöscht.
- **Falls irgendwo ausgeführt:** Rechner isolieren und scannen. Dann von einem sauberen Gerät aus alle Tokens wechseln (GitHub inkl. PAT „croncf", Cloudflare, Anthropic, Finnhub/TwelveData, OWNER_TOKEN, Broker) und alle Sitzungen abmelden.
- Prüfregel für künftige Repo-Sichtungen: Konto mit Zufallsnamen? Kopie eines bekannten Repos? ZIP/EXE im Repo? Anleitung, SmartScreen zu übergehen?

### 5. Klärungsbedarf: Stand des Abschnitt-7/8-Templatings (Schritt 0)

Zwei Quellen widersprechen sich, **beide ungeprüft**:

- **Dieses Protokoll (Vormittag):** Templating v1.22 → INCIDENT; v1.23 = **Rückbau**, das Modell schreibt Abschnitt 7+8 wieder selbst. Der Neuaufbau als „Option B“ (drei getrennte Rollen `PromptInstruction78()` / `BuildPublicSection78()` / `insertAbschnitt78()`) ist als Architekturregel festgelegt, aber **nicht gebaut**.
- **Aussage im Recherche-Chat (Nachmittag):** Templating „bereits begonnen, Restpunkt `finalizeStrategyResult()`“.

→ Vor Schritt 0 im Code klären: Gibt es `finalizeStrategyResult()`, gehört es zu Option B, und was ist committet? SUITE.md №69 (Stand 4.28) formuliert Schritt 0 entsprechend offen.

### 6. Berührungspunkte mit dem Stand oben

- **Schritt A (Aggregator-Robustheit)** passt zu den Commit-A-Prüfpunkten der Phase C (Universumszahl, `TICKER_MASTER ungueltig` → harter Fehler). Die relative Mindestabdeckung (Vorschlag ≥95 %) muss die Universumsgröße nach Phase C als Bezug nehmen, nicht 679/735.
- **Stufe C „Ticker-Universum automatisch pflegen“** ist mit TICKER_MASTER Phase C + `add_ticker.py` bereits in Arbeit → kein separates Vorhaben mehr.
- **Survivorship-Bias** (Hinweis aus #12) betrifft den offenen ex-IWV-Befund im Backlog oben.
- **Schritt D (JSON-Sidecar)** ist die strukturelle Fortsetzung von `validatePublicSections78Content()` (v1.23): Inhaltsprüfung gegen Snapshot statt nur Canary-Marker.

---

## Sonstiges

**BaFin-Voranfrage:** laut Vorsession weiterhin Wartestand (Deutsche Bundesbank,
Hauptverwaltung Hannover), heute nicht neu geprüft.
