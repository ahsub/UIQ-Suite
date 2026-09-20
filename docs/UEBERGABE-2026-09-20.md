UIQ — Übergabeprotokoll 20.09.2026

## Pflicht-Header

Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:

1. Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten. Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen. Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.
2. Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad: Prüfe die Verbindung, nicht nur die Existenz. "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert. "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet. Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor du sagst "das funktioniert".
3. Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft. Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt "erledigt". Der Unterschied ist der ganze Punkt.
4. Skepsis ist keine Unhöflichkeit gegenüber der Vorsession. Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.
5. Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle Plausibilitäts-Antwort. Nicht raten, woran es liegen könnte — nachsehen, woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt ist, gilt sie als gefunden.

Kurzform, die für den Rest der Session gilt: Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.

**Thema:** ATMNA-Explainability-Gap-Fix — Bausteine A, B, Nachträge
**Beteiligte Dateien:** `ko-modules/ko-prompts.js`, `UIQ-Suite/scripts/generate_public_recommendations.js` (inkl. `scripts/vendor/ko-prompts.js`), `axel-scanner/workers/ko-ai.js`, `axel-scanner/index.html`

---

## Ausgangslage

Live-Test-Fund (aus einer Vorsession): ATM/NA-Public-Briefings ließen die Pflichtangaben zu Optionsmarkt-Validierungsstatus, Bollinger-Position und Tightness aus, obwohl `ko-prompts.js` v2.53.29 bereits einen deterministischen Faktor-Block (`_deterministicOptionsFactBlock()`) sowie einen Post-hoc-Validator (`validateBriefingCompliance()`) eingeführt hatte. Ziel der heutigen Session: die Datenanbindung für den Faktor-Block fertigstellen (Baustelle A) und einen REPAIR-Loop bauen, der bei Bedarf automatisch nachbessert (Baustelle B) — für beide Erzeugungspfade (Live-On-Demand über `ko-ai.js` UND den nächtlichen Batch über `generate_public_recommendations.js`).

---

## Baustelle A — echte BB-/Tightness-Datenanbindung

**`generate_public_recommendations.js` v1.6**
Commit: `ahsub/UIQ-Suite@c68db33`
- Neue Funktion `buildAtmnaFactorsSummary(top10, top3Syms)` — baut `"SYM: BB X%, Tightness Y%"`-Summary über die Top-3-Kandidaten
- Reviewer-Korrekturen umgesetzt: fehlender Top-3-Kandidat in `top10` wirft kontrolliert (Datenintegritätsfehler, kein stilles Weglassen), Plausibilitätswarnung bei `bbPos > 1.5` statt blinder ×100-Umrechnung
- `buildOptionsPromptForStrategy()` erweitert um `top10`/`top3Syms`-Parameter, setzt `ctx.atmnaFactors = { summary }` nur bei `strategy === 'atmna'`

**`ko-prompts.js` v2.53.29, Patch A2**
Commit: `ahsub/ko-modules@c4f7c93`
- `_deterministicOptionsFactBlock()` liest jetzt `o.atmnaFactors.summary` (fertiger String) statt der ursprünglich vorgesehenen einzelnen Skalarwerte `bbPos`/`tightnessPct` — Formänderung war nötig, weil bei drei Kandidaten ein einzelnes Wertepaar ohnehin falsch modelliert gewesen wäre

**Verifikation (in dieser Session per Node-Skript/Diff selbst durchgeführt):** Vollständiger End-to-End-Test (echtes `ko-prompts.js` v2.53.29 + echtes `generate_public_recommendations.js` v1.6) bestanden — Summary-String kommt korrekt im atmna-Prompt an, `csp_wheel` bleibt unberührt, Fallback bei fehlenden Kandidaten funktioniert.

---

## Baustelle B — REPAIR-Loop

### Live-Pfad: `ko-ai.js`

**v1.24** (Commit `ahsub/axel-scanner@8d33e9b`, Pfad `workers/ko-ai.js`)
- `validateBriefingCompliance()` + `_OPTIONS_STRATEGY_IDS` als notwendige Kopie aus `ko-prompts.js` dupliziert (dieser Worker importiert `ko-prompts.js` nicht — Einzeldatei-Cloudflare-Worker ohne Build-Schritt)
- `buildRepairPrompt(strategy, missing, originalText)` — baut Nachbesserungs-Prompt
- REPAIR-Loop im Haupthandler: genau ein Repair-Versuch bei `FAIL`, kein Repair-of-Repair
- Repair-Call bekommt eigenen Budget-Log-Eintrag (`<action>_REPAIR`)

**v1.25** (Commit `ahsub/axel-scanner@94002be`)
- Live-Test-Fund direkt nach v1.24-Deploy: Bollinger-Position/Tightness wurden vom Repair zuverlässig nachgezogen, „optionsmarkt-validierungsstatus" blieb hängen (Modell schrieb „nicht verfügbar" statt der wörtlich geforderten Formulierung „nicht verifiziert")
- Fix: `buildRepairPrompt()` hängt jetzt pro fehlendem Punkt einen expliziten Wortlaut-Hinweis an
- **Live via `wrangler tail` verifiziert (Axel hat den Test ausgeführt und mir die Konsolenausgabe geschickt; ich habe sie ausgewertet, nicht selbst am System gemessen):** kompletter Ablauf (Erstversuch FAIL → Repair-Call → `REPAIR-SUCCESS`) bestätigt

**Frontend-Anbindung (`axel-scanner/index.html`)**
Commits: `ahsub/axel-scanner@c20c5fb`, `@7fbc11e`
- `koAiCall()` um optionalen 5. Parameter `strategy` erweitert
- Drei Aufrufstellen ergänzt (die drei mit fester Einzelstrategie): `_kiStrat`-Stelle (Zeile 19763), Options-Desk (26068), Alpha-Desk (26622)
- Fünf weitere `koAiCall('ki_briefing', ...)`-Stellen bewusst NICHT geändert (Textvereinfachung, Value-Desk mit fester `value`-Strategie außerhalb der 5 Optionsstrategien, zwei Mehrfach-Strategien-Vergleiche) — alle drei Fälle einzeln durchgesprochen und begründet
- **Ungeprüft:** ob `index.html` nach dem Commit tatsächlich live deployt ist (GitHub Pages automatisch vs. manueller Schritt) — wurde in der Session nicht abschließend geklärt, s. Deploy-Status unten

### Batch-Pfad: `generate_public_recommendations.js`

**Kritischer Nachtrag-Fund:** Ein echter Live-Output aus dem Digest-Cache (von Axel gepostet, von mir gegen `validateBriefingCompliance()` geprüft) zeigte denselben Fehler erneut — Ursache: der Batch-Pfad hatte gar keinen REPAIR-Mechanismus, UND die Vendor-Kopie von `ko-prompts.js` in `UIQ-Suite/scripts/vendor/` war bei `prompt_version: 2.53.25` hängengeblieben (vor dem gesamten heutigen Fix) — dieses `prompt_version`-Feld stammt direkt aus dem gezeigten KV-Eintrag, nicht aus eigener Einsicht in den Vendor-Ordner zu dem Zeitpunkt.

- **`ko-modules`-Vendor-Sync** (Commit `ahsub/UIQ-Suite@5ae24e3`) — Vendor-Kopie auf `ko-modules@c4f7c93` (v2.53.29) nachgezogen, byte-identisch verifiziert (selbst per Diff geprüft)
- **v1.7** (Commit `@0b0b063`, vorheriger Zwischenstand `c68db33`→`v1.7` in derselben Session) — REPAIR-Loop analog zu `ko-ai.js` in `runStrategy()` eingebaut, über `callAnthropicWithRetry()` (bekommt dadurch den bestehenden Truncation-Schutz kostenlos mit); neues Feld `aiOutput.repair_status`
- **v1.8** (Commit `@0b0b063`) — `KO_MODULES_VENDOR_DRIFT_COMMIT` von `a5473ac` auf `c4f7c93` nachgezogen (war seit dem 10.09. veraltet, hätte sonst nach jedem legitimen Update erneut fälschlich Alarm geschlagen)
- **v1.9** (Commit `@114525a`) — rein diagnostisches Logging (`[ATMNA-CANDIDATES]`, `[ATMNA-FACTORS]`), keine Verhaltensänderung

**Live-Verifikation nach v1.7/v1.8 (Axel hat den GHA-Lauf ausgelöst und mir den frischen Output geschickt; die `validateBriefingCompliance()`-Prüfung dagegen habe ich selbst per Node-Skript ausgeführt):** Frischer GHA-Lauf (`#321`) zeigte Abschnitt 4 („Optionsmarkt-Validierungsstatus... nicht verifiziert", „Bollinger-Position und Tightness... BB 53%, Tightness 4,2%") korrekt und vollständig — gegen `validateBriefingCompliance()` geprüft: **PASS**. Der eigentliche ATMNA-Explainability-Gap ist damit für beide Erzeugungspfade nachweislich behoben — soweit durch diese beiden Stichproben belegt, kein flächendeckender Test über alle fünf Optionsstrategien oder mehrere Läufe hinweg.

---

## Neuer, separater Fund (nicht heute behoben — bewusst zurückgestellt)

Im selben Live-Output (`#321`, von Axel gepostet) widersprachen sich zwei Ticker-Listen innerhalb desselben Dokuments:
- Abschnitt 3 (vom Modell frei formuliert): JNJ, **CSCO**, MDT
- Abschnitt 4 (mechanisch aus `top3Syms`/Faktor-Block): JNJ, **MRK**, MDT

Reviewer-Empfehlung (Konsens): **erst beweisen, dann reparieren** — keine Architekturänderung vor gesichertem Root Cause. Mögliche Erklärung: `runStrategy()`/`buildOptionsPromptForStrategy()` liefern eine inkonsistente Kandidatenliste (dann Bug im Code), oder das Modell interpretiert die Top-10-Liste in Abschnitt 3 frei, unabhängig von der mechanisch vorgegebenen Top-3 (dann „LLM-Auswahl-Drift"). **Diese Ursachenfrage ist am Ende der Session weiterhin ungeklärt.**

**v1.9 (Commit `@114525a`) legt dafür die Diagnose-Infrastruktur:**
- `[ATMNA-CANDIDATES] top3Syms=... top10=...` — direkt nach `selectOptionsCandidates()`
- `[ATMNA-FACTORS] ...` — der tatsächlich gesendete Faktor-Block-Text, extrahiert aus dem fertigen Prompt

**Getestet (von mir selbst per Node-Skript mit gemocktem Anthropic-Call):** Regex zur Faktor-Block-Extraktion musste einmal korrigiert werden (erster Versuch traf eine unrelated Erwähnung von „Bollinger-Position" in den REASONING-GUARDRAILS) — nach Fix mit echtem `ko-prompts.js` gegengetestet, extrahiert jetzt zuverlässig die richtige Zeile in einem synthetischen Testfall. **Noch NICHT gegen einen echten GHA-Lauf verifiziert** — das ist der eigentliche offene Punkt für die nächste Session.

### Offener nächster Schritt
Nach dem nächsten GHA-Lauf (geplant oder mit `FORCE_REGENERATE=true`) die beiden `[ATMNA-...]`-Logzeilen mit dem tatsächlichen Abschnitt-3-Inhalt der resultierenden Antwort abgleichen. Je nach Ergebnis (Reviewer-Vorschlag):
- Falls `top3Syms` bereits von Abschnitt 3 abweicht → Bug in `runStrategy()`/Datenfluss, dort reparieren
- Falls `top3Syms` korrekt, aber Abschnitt 3 weicht trotzdem ab → LLM-Auswahl-Drift, dann: Abschnitt 3 im Prompt deterministisch auf exakt `top3Syms` festlegen + `validateBriefingCompliance()` um Top-3-Konsistenzprüfung erweitern (Abschnitt 3 vs. Faktor-Block) + entsprechenden Repair-Hinweis + Regressionstest

---

## Versionsstand am Ende der Session

**Hinweis (Pflicht-Header Punkt 1): Diese Tabelle ist eine Behauptung dieser Session, kein von der nächsten Session verifizierter Zustand. Vor Weiterarbeit gegen die tatsächlichen Repo-/Deploy-Stände prüfen.**

| Datei | Version (laut dieser Session) | Letzter Commit |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.53.29 | `c4f7c93` |
| `UIQ-Suite/scripts/vendor/ko-prompts.js` | 2.53.29 (synchronisiert) | `5ae24e3` |
| `UIQ-Suite/scripts/generate_public_recommendations.js` | v1.9 | `114525a` |
| `axel-scanner/workers/ko-ai.js` | v1.25 | `94002be` |
| `axel-scanner/index.html` | — | `7fbc11e` |

## Deploy-Status
- `ko-ai.js` v1.25: **deployt** — von Axel im Cloudflare-Dashboard bestätigt (Screenshot „Manuell bereitgestellt") und per `wrangler tail` live nachgewiesen; das ist der einzige Punkt in diesem Protokoll mit echtem Live-Beweis, nicht nur Commit-Verifikation
- `generate_public_recommendations.js` v1.9: **committet und syntaktisch verifiziert**, aber der Diagnose-Patch selbst noch nicht durch einen echten GHA-Lauf bestätigt (der letzte verifizierte Lauf war der v1.7/v1.8-Stand, `#321` — v1.9 kam danach)
- `index.html`: Commit `7fbc11e` — **ungeprüft**, ob und wie das live geht (GitHub Pages automatisch vs. manueller Schritt); vor dem nächsten Frontend-Test klären, nicht annehmen

## Bekannte, bewusst in Kauf genommene Wartungslast
`validateBriefingCompliance()`-Logik lebt jetzt an zwei Stellen (`ko-prompts.js` original, `ko-ai.js`-Kopie), `buildRepairPrompt()` an drei Stellen (`ko-ai.js`, `generate_public_recommendations.js` — Letztere zusätzlich dupliziert, da `KoPrompts` diese Funktion nicht exportiert). Bei künftigen Änderungen an der Compliance-/Repair-Logik müssen alle Kopien von Hand synchron gehalten werden — dieselbe Risikoklasse wie die bereits bestehende `scripts/vendor/`-Kopie von `ko-prompts.js` selbst (dafür existiert bereits `checkVendorDrift()`; für die Kopien in `ko-ai.js` gibt es aktuell keinen automatisierten Drift-Check).
