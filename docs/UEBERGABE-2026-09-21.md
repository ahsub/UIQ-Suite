UIQ — Übergabeprotokoll 21.09.2026

## Pflicht-Header

Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:

1. Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten. Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen. Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.
2. Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad: Prüfe die Verbindung, nicht nur die Existenz. "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert. "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet. Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor du sagst "das funktioniert".
3. Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft. Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt "erledigt". Der Unterschied ist der ganze Punkt.
4. Skepsis ist keine Unhöflichkeit gegenüber der Vorsession. Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.
5. Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle Plausibilitäts-Antwort. Nicht raten, woran es liegen könnte — nachsehen, woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt ist, gilt sie als gefunden.

Kurzform, die für den Rest der Session gilt: Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.

**Thema:** LLM-Auswahl-Drift-Fix (direkte Fortsetzung des ATMNA-Explainability-Gap-Fixes vom 20.09.2026, s. `docs/UEBERGABE-2026-09-20.md`)
**Beteiligte Dateien:** `ko-modules/ko-prompts.js`, `UIQ-Suite/scripts/generate_public_recommendations.js` (inkl. `scripts/vendor/ko-prompts.js`), `axel-scanner/workers/ko-ai.js`

---

## Ausgangslage

Ein am 20.09. gepostetes, live erzeugtes atmna-Briefing zeigte eine neue, bis dahin unbekannte Fehlerklasse: Abschnitt 3 nannte "JNJ, CSCO, MDT" (inkl. aktiver Begründung, warum MRK "die Kriterien nicht erfüllt"), während der deterministische Faktor-Block (Abschnitt 4) für "JNJ, MRK, MDT" echte BB-/Tightness-Werte auswies. Mittels neuem Diagnose-Logging (v1.9, `[ATMNA-CANDIDATES]`/`[ATMNA-FACTORS]`, s. Vortagesprotokoll) wurde zweifelsfrei bewiesen: `top3Syms` und der Faktor-Block waren korrekt — das Modell hat eigenmächtig einen der drei vorgegebenen Kandidaten ersetzt. Kein Datenfluss-Bug, sondern freie Modell-Neuinterpretation trotz bereits abgeschlossener Score-Rang-Entscheidung ("LLM-Auswahl-Drift").

---

## Architekturentscheidung (mit Reviewer abgestimmt)

**Candidate Selection Integrity**: Die Score-Engine bestimmt die Kandidaten deterministisch; das LLM darf diese Auswahl nicht durch eine eigene Auswahlentscheidung ersetzen — es darf ausschließlich erklären, kontextualisieren, vergleichen. Umgesetzt für die fünf Options-Strategien (Scope-Entscheidung, s. u.), NICHT generalisiert auf Equity/KO — bewusst zurückgestellt, s. Folge-Ticket 1.

---

## Umgesetzt, getestet, committet und live verifiziert

### `ko-prompts.js` v2.53.30
Commit: `ahsub/ko-modules@aa8521c` (+ Vendor-Sync nach `UIQ-Suite@2c037f6`, dort ergänzt um Löschung einer fehlerhaft mit hochgeladenen `scripts/vendor/generate_public_recommendations.js`)
- `_deterministicOptionsFactBlock()`: neue Pflichtzeile "VERBINDLICHE TOP-3-KANDIDATEN FÜR ABSCHNITT 3" aus `o.top3Syms`, für alle 5 Options-Strategien
- Abschnitt-3-Instruktion: explizites Verbot, Kandidaten zu ersetzen oder als "erfüllt Kriterien nicht" auszuschließen
- `top3Syms: ctx.top3Syms || null` an allen 10 Aufrufstellen (5 Strategien × Public/EIC)
- `_validateBriefingCompliance()`: neuer optionaler 3. Parameter `options.expectedTop3`, Mengenvergleich via `_extractSection3Tickers()`, rückwärtskompatibel (ohne Parameter: Check übersprungen)
- **Verifiziert (von mir selbst per Node-Skript gegen den committeten Stand):** 6 Testfälle (PASS, Ticker-Ersatz, fehlender/zusätzlicher Ticker, Rückwärtskompatibilität, Generalisierung auf csp_wheel)

### `ko-ai.js` v1.26
Commit: `ahsub/axel-scanner@ec1cc79`, deployt (von Axel im CF-Dashboard bestätigt)
- `_extractExpectedTop3FromPayload()`: liest die Kandidatenliste direkt aus dem Prompt-Text (kein neues Frontend-Feld nötig)
- `validateBriefingCompliance()`-Kopie um denselben Top-3-Check erweitert
- `buildRepairPrompt()`: neue Fehlerklasse `top3-ticker-konsistenz` mit konkretem Ersetzungshinweis ("Ersetze CSCO durch MRK")
- **Live verifiziert (Beleg: `/logs`-Eintrag `log:def1d4b95cc8b12d:1789974497097`, `2026-09-21T07:08:17Z`):** `complianceFlags: ["TICKER-SCOPE:BB", "REPAIR-ATTEMPTED", "REPAIR-SUCCESS"]` — kompletter Ablauf (Extraktion aus payload → Validator erkennt Fehler → Repair-Call → PASS) am echten System bestätigt, nicht nur lokal

### `generate_public_recommendations.js` v1.10
Commit: `ahsub/UIQ-Suite@2c037f6`
- `ctx.top3Syms` in `buildOptionsPromptForStrategy()` für alle 5 Options-Strategien
- `expectedTop3` an beide `validateBriefingCompliance()`-Aufrufe in `runStrategy()` (Erst- und Repair-Check)
- `buildRepairPrompt()` identisch zu `ko-ai.js` erweitert
- **Verifiziert:** vollständiger End-to-End-Test mit dem exakt reproduzierten Live-Bug (CSCO statt MRK, mit Ausschluss-Begründung) — Repair-Prompt enthält korrekten Hinweis, Ergebnis `repair_status: REPAIR-SUCCESS`. **Noch NICHT gegen einen echten GHA-Lauf verifiziert** — nächster GHA-Lauf steht als Bestätigung für den Batch-Pfad noch aus.

### Nebenbefund, behoben
`KO_MODULES_VENDOR_DRIFT_COMMIT` war vom 20.09. noch auf einen veralteten Stand von vor mehreren Tagen gesetzt (unabhängig vom heutigen Thema, aus derselben Session). War bereits am 20.09. korrigiert (`ko-modules@c4f7c93`) — heute nicht erneut angefasst, da nicht betroffen.

---

## Bewusst NICHT implementiert — drei dokumentierte Folge-Tickets

### 1. Candidate Selection Integrity — Equity/KO Audit
Kein Live-Beleg, dass Equity-/KO-Strategien vom selben Auswahl-Drift betroffen sind. Vorgehen für später: Diagnose-Logging analog zu `[ATMNA-CANDIDATES]` für mindestens eine Equity-Strategie ergänzen, mehrere reale Läufe beobachten, `top3Syms` gegen tatsächlichen Abschnitt-3-Inhalt abgleichen. Nur bei nachgewiesener Abweichung generalisieren (Mechanismus ist technisch vermutlich direkt übertragbar — Abschnitt-3-Textbaustein ist für Equity/Options bereits identisch formuliert).

### 2. Model-Refusal Detection im REPAIR-Loop
Ein synthetischer Adversarial-Test (bewusst datenloser payload, der das Modell zum Reproduzieren unbegründeter Werte auffordern sollte) löste zweimal in Folge eine vollständige Modell-Verweigerung aus ("Ich kann dieser Anweisung nicht folgen") — beide Male korrekt vom Modell erkannt, da mein Testaufbau tatsächlich keine Datenbasis lieferte. Live bestätigt (`log:def1d4b95cc8b12d:1789974659158`, `07:10:59Z`): `REPAIR-FAILED:bollinger-position+tightness+top3-ticker-konsistenz` — der Repair-Prompt zitiert die Verweigerung als "vorherige Antwort" zurück, was das Modell erneut zur Ablehnung bewegt. **Kein nachgewiesener Produktionsfehler** (im echten Pfad liegen immer echte Daten vor, der Testfall war künstlich datenlos) — aber ein reales, latentes Risiko, falls eine Verweigerung im Produktivbetrieb je auftritt. Kein Fix ohne echten Produktionsbeleg.

### 3. Repair Data Provenance Guard (architektonisch wichtigster der drei, aber ohne aktuellen Anlass)
Architekturregel, nur dokumentiert, nicht codiert: **Repair darf keine fehlenden Daten erzeugen.** Der Repair-Mechanismus darf ausschließlich bereits im ursprünglichen Prompt vorhandene deterministische Fakten erneut bzw. anders präsentieren. Fehlen die erforderlichen Daten im Ausgangskontext, darf Repair nicht versuchen, diese durch sprachliche Vorgaben zu ersetzen — sonst droht mittelfristig: Daten fehlen → Validator FAIL → Repair fordert Werte ein → Halluzinationsdruck. Passt zum bestehenden Prinzip `Daten → deterministische Fakten → LLM → Validator → Repair`.

---

## Versionsstand am Ende der Session

**Hinweis (Pflicht-Header Punkt 1): Diese Tabelle ist eine Behauptung dieser Session, kein von der nächsten Session verifizierter Zustand.**

| Datei | Version (laut dieser Session) | Letzter Commit |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.53.30 | `aa8521c` |
| `UIQ-Suite/scripts/vendor/ko-prompts.js` | 2.53.30 (synchronisiert) | `2c037f6` |
| `UIQ-Suite/scripts/generate_public_recommendations.js` | v1.10 | `2c037f6` |
| `axel-scanner/workers/ko-ai.js` | v1.26 | `ec1cc79` |

## Deploy-Status
- `ko-ai.js` v1.26: **deployt und live verifiziert** (echter `/logs`-Beleg für `REPAIR-SUCCESS` am 21.09., 07:08 UTC)
- `generate_public_recommendations.js` v1.10: **committet, lokal End-to-End getestet, noch KEIN echter GHA-Lauf-Beleg** — nächster Lauf sollte `[ATMNA-CANDIDATES]`/`[ATMNA-FACTORS]` UND (falls ein Mismatch auftritt) einen erfolgreichen Repair im Log zeigen

## Bekannter, separater Nebenbefund (nicht heute behoben)
`/logs?limit=N`-Route liefert bei zwei unterschiedlichen `tokenHash`-Präfixen in KV (`2af7e7...`, `def1d4...`) mit kleinem `limit` systematisch veraltete Ergebnisse — bestätigt durch direkten KV-Dashboard-Vergleich (Schreibvorgang selbst funktioniert nachweislich einwandfrei bis heute, nur die Lese-/Aggregationslogik der `/logs`-Route ist betroffen). Nicht Teil des heutigen Themas, aber real und reproduzierbar — eigenes Ticket wert.

## Bekannte, bewusst in Kauf genommene Wartungslast (aus dem 20.09.-Protokoll, weiterhin gültig, jetzt erweitert)
`validateBriefingCompliance()`-Logik lebt an zwei Stellen (`ko-prompts.js` Original, `ko-ai.js`-Kopie inkl. der neuen Top-3-Prüfung), `buildRepairPrompt()` an drei Stellen (`ko-ai.js`, `generate_public_recommendations.js`). Bei künftigen Änderungen müssen alle Kopien von Hand synchron gehalten werden.
