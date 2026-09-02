# UEBERGABE-2026-09-02.md

Fortsetzung von `UEBERGABE-2026-09-01.md`. Heute: die vier Prioritäten aus
dem gestrigen Plan (HVP-Kompressionsregel ausweiten, Guardrail-Verstärkung
+ Regex-Nachzug für "attraktiv"/"Prämienerwartung", "solide...Umfeld"
beobachten, weekly_income-Struktur) bearbeitet — mit einem strukturellen
Fund, der die ursprüngliche Priorität-0-Prämisse korrigiert (kein
Vier-Strategien-Problem, sondern ein Ein-Funktion-Problem). Anschließend
drei Quick-Wins (ALLOWED_KEYS-Fix, RUNBOOK-Ergänzungsvorschlag,
`degraded_status`-Root-Cause geklärt), Klärung der Hash-Pin-Frage für
Cloudflare-Worker vs. jsDelivr-Module, ein zusätzlicher RSI-Begriffs-
Integritätsfund aus externem Reviewer-Feedback (mit Live-Verifikation
noch am selben Tag), zwei neue kleinere Funde aus einem Re-Review, und
ein neuer Architektur-Backlog-Punkt für v2.0/Phase 3 (kanonische
Metriken-Pipeline), ausgelöst durch eine SKEW-Dateninkonsistenz.

---

## 1. Priorität 0 — HVP-Kompressionsregel: struktureller Fund vor dem Fix

### 1.1 Ursprüngliche Prämisse widerlegt

Der 01.09.-Plan ging davon aus, dass csp_wheel/weekly_income/cc noch
"gezielt zu prüfen" seien, ob ihnen die HVP-Kompressionsregel fehlt —
als vier potenziell unabhängige Baustellen. Code-Abgleich (`ko-prompts.js`,
`ahsub/ko-modules`) zeigte: **csp_wheel, atmna, weekly_income und cc rufen
im Public-Modus alle dieselbe gemeinsame Funktion `_publicOptionsPrompt()`
mit `mode: 'scan'` auf.** Diese Funktion hat zwei Zweige:

- `mode === 'holding_review'` — nur von Collar benutzt, hatte die
  HVP-Regel bereits seit 30.08.
- `mode === 'scan'` (else-Zweig) — von allen vier anderen Strategien
  gemeinsam benutzt, hatte die Regel **nicht**

Kein Vier-Strategien-Problem, sondern ein Ein-Funktion-Problem: die Regel
wurde am 30.08. nur im holding_review-Zweig ergänzt, nie im scan-Zweig.

### 1.2 Architekturfrage geklärt: geteilte Struktur vs. vier separate Prompts

Axel warf die Frage auf, ob angesichts inhaltlicher Unterschiede zwischen
den Optionsstrategien nicht vier separate Prompts sinnvoller wären.
Entscheidung: **Nein, geteilte Struktur bleibt.** Begründung: die
strategie-spezifischen Unterschiede (Rolle, Marktumfeld-Frage,
Bewertungskriterien) sind bereits sauber parametrisiert; der geteilte Teil
(a-d-Compliance-Gerüst, Wortverbote) ist bewusst identisch, weil es sich
um regulatorische/strukturelle Vorgaben handelt, nicht um Strategie-Inhalt.
Vier separate Prompts hätten das Risiko wiederkehrender, unabhängig
auseinanderdriftender Kopien reproduziert (Symptom: der weekly_income-Fund
in §4). Leitlinie für künftige Fälle: **"wo Unterschiede bestehen, müssen
sie individuell identifiziert und differenziert aufgelöst werden"** — aber
nur dort, nicht als Standardvorgehen.

### 1.3 Patch deployt (in `ko-prompts.js` v2.18.1 eingespielt, s. §9)

HVP-BEGRIFFS-INTEGRITAET-Satzmuster (identisch zum holding_review-Zweig)
in den scan-Zweig übernommen — wirkt automatisch für csp_wheel, atmna,
weekly_income und cc gleichzeitig, keine Duplizierung nötig.

---

## 2. Priorität 1 — Guardrail-Verstärkung + Regex-Nachzug

### 2.1 Diagnose

"Prämienerwartung" hatte bereits seit 29.08. ein Negativbeispiel +
Alternativformulierung in `PUBLIC_REGULATORY_GUARDRAIL` — trotzdem 4
Live-Belege am 01.09. "attraktiv" hatte gar keine Alternative, nur die
nackte Verbotsliste. Schluss: ein Wortverbot allein reicht bei diesen
zwei Begriffen nachweislich nicht, auch die Nähe/Prominenz der
Gegenformulierung im Prompt scheint eine Rolle zu spielen (bestehendes
Prämienerwartung-Beispiel stand >100 Zeilen von der Verbotsliste entfernt).

### 2.2 Zwei getrennte Verteidigungslinien (Axels eigener Ansatz, umgesetzt)

1. **Guardrail-Verstärkung** (`ko-prompts.js`): direktes NIEMALS/
   STATTDESSEN-Beispielpaar unmittelbar neben der Wortliste in
   `PUBLIC_REGULATORY_GUARDRAIL` ergänzt (Salienz durch Nähe), statt nur
   entfernt im Prompt.
2. **Scanner-Regex-Nachzug** (`ko-ai.js`): `attraktiv`-Pattern von fester
   Endungsliste (`/\battraktiv(?:e|er|es|en)?\b/i`, deckte "attraktiveren"
   nicht ab) auf Stamm-Matching umgestellt (`/\battraktiv\w*/i`) — deckt
   jede Flexionsform ab, ohne künftige Endungslücken. Getestet gegen
   attraktiv/attraktive/attraktiver/attraktives/attraktiven/attraktiveren/
   Attraktivität (alle `true`) sowie unattraktiv (`false`, zu Recht nicht
   erfasst).

Beide Fixes deployt (s. §9/§14 für Versionsstand).

---

## 3. Priorität 2 — "solide[s] ... Umfeld"

Unverändert: weiter beobachten, kein Regex-Fix ohne zweiten unabhängigen
Live-Beleg (Risiko der Übergeneralisierung bei nur einem Fund vom 01.09.).

---

## 4. Priorität 3 — weekly_income-Struktur: kein Code-Fix

Code-Abgleich zeigte: `weekly_income` ruft `_publicOptionsPrompt()` exakt
wie csp_wheel/atmna/cc auf — keine eigene `risikoBegriff`/`risikenText`-
Überschreibung (im Gegensatz zu `cc`). Der komplette a-d-Block ist
wortidentisch mit den anderen drei Strategien. Die am 01.09. beobachtete
Model-Boundary/External-Validation-Vertauschung kann bei identischem
Prompt-Text kein Prompt-Bug sein — sie war Output-Stochastik dieses einen
Laufs. **Entscheidung: kein Code-Fix, stattdessen beobachten**, ob sich
das bei künftigen Live-Tests wiederholt (dann eigenständiger Fund) oder
nicht (dann bestätigt: einmaliger Ausreißer).

---

## 5. 9-Punkte-Prompt-Architektur — Scope auf alle 14 Strategien erweitert

Bei der Frage "sollten wir auch die Nicht-Options-Strategien härten"
zeigte der Code-Abgleich: 9 Equity-Strategien (ko, momentum, breakout,
vcp, swing, meanrev, dividend, value, fading_short) laufen über eine
zweite Shared-Funktion `_publicEquityPrompt()` — strukturell einfacher
als der Options-Coaching-Standard (5-Punkte-Schema ohne gelabelte
a-d-Struktur, ohne explizites Modell-Grenze-Pflichtsatzmuster). Sie
erben zwar automatisch die gesamte `PUBLIC_REGULATORY_GUARDRAIL**
(Wortverbote, Trade-Off-Prinzip, HVP-Regel, RSI-Regel — s. §9), aber
nicht die strukturelle Härtung.

**Entscheidung (Axel):** Equity-Härtung nicht isoliert vorziehen, sondern
den ohnehin für diese Woche geplanten 9-Punkte-Architektur-Sprint von
vornherein auf **alle 14 Strategien** ausweiten, statt zwei parallel
driftende Schemata (Options-Coaching-Standard vs. altes Equity-5-Punkte-
Schema) zu riskieren.

---

## 6. Drei Quick-Wins

### 6.1 `market_strip_snapshot` in `ALLOWED_KEYS` ergänzt

`ko-sync-worker.js` (Quellcode war zunächst in keinem Repo auffindbar,
von Axel manuell bereitgestellt, danach unter
`ahsub/ko-aggregator/workers/ko-sync-worker.js` abgelegt — konsistent zu
den anderen beiden Cloudflare-Workern `ko-ai.js`/`ko-watchdog.js`, die
bereits dort liegen). Key ergänzt, behebt die seit 01.09. offenen
400-Fehler.

### 6.2 `degraded_status`-Root-Cause geklärt (war nur "vorgemerkt")

Mit dem tatsächlichen Code klargestellt: der Worker hat genau vier
definierte `/public/*`-Routen (master_market_data, options_watchlist,
daily_market_snapshot, daily_market_snapshot_us). Eine
`/public/degraded_status`-Route **existiert nicht** — der Aufruf fällt
durch bis zur generischen `X-UIQ-Token`-Prüfung, daher die beobachtete
401-Fehlermeldung. Root Cause: fehlende Route, kein Bug in einer
bestehenden. **Kein Code-Fix heute** (unklar, welcher KV-Key/welche
Struktur die Route liefern soll) — bleibt Backlog-Punkt, jetzt mit
klarer Ursache statt offener Diagnosefrage.

### 6.3 RUNBOOK.md-Ergänzungsvorschlag (Positionierung geliefert, noch nicht eingepflegt)

Neuer Abschnitt "5. Bekannte Betriebs-Fallstricke", direkt nach
"4. KV-Schlüsselverzeichnis" in `ahsub/ko-aggregator/docs/RUNBOOK.md`:

```markdown
## 5. Bekannte Betriebs-Fallstricke

**5.1 OWNER_TOKEN/STATIC_TOKEN — zwei unabhängige Secret-Paare**

`ko-ai` (Cloudflare Worker) und `ko-sync-worker.js` verwenden für ihre
`/public/*`-Routen denselben `Authorization: Bearer <OWNER_TOKEN|STATIC_TOKEN>`-
Mechanismus — aber als zwei **komplett separate** Cloudflare-Secret-Paare in
zwei verschiedenen Workern. Eine Rotation bei `ko-ai` zieht `ko-sync` NICHT
automatisch mit (bestätigter Vorfall 01.09.2026: 401-Fehler bei
`master_market_data`/`degraded_status`-Aufrufen nach einseitiger Rotation).

➡️ **Bei jeder OWNER_TOKEN/STATIC_TOKEN-Rotation: beide Worker aktualisieren
(`ko-ai` UND `ko-sync-worker.js`), nicht nur den, der gerade den Anlass gab.**

**5.2 Kurze Propagationsverzögerung nach Secret-Redeploy**

Nach einem Secret-Update + Redeploy bei `ko-ai` oder `ko-sync-worker.js` kann
für einen kurzen Zeitraum (typischerweise unter einer Minute) noch der alte
Secret-Wert an der Cloudflare-Edge aktiv sein — ein einzelner Fehlschlag
direkt nach dem Redeploy ist dadurch NICHT automatisch ein struktureller Bug.
Zweimal beobachtet (31.08.2026 STATIC_TOKEN, 01.09.2026 OWNER_TOKEN
zweite Rotation) — beide Male löste sich der Fehler beim nächsten Versuch
von selbst, ohne Codeänderung.

➡️ **Nach jedem Secret-Redeploy: einen zweiten Testaufruf nach kurzer
Wartezeit einplanen, bevor ein Fehlschlag als struktureller Bug untersucht
wird.**
```

`degraded_status` (§6.2) bewusst NICHT hier rein — RUNBOOK ist für
gelöste/verstandene Fallstricke, nicht offene To-dos; bleibt im Backlog.

---

## 7. Hash-Pin-Klärung: Cloudflare Worker vs. jsDelivr-Module

Zweimal die gleiche Frage, zweimal verifiziert (nicht nur vermutet):

- **`ko-ai.js`, `ko-sync-worker.js`** — Cloudflare Worker, feste URL
  (`ko-ai.ahildebrand.workers.dev`, `ko-sync.ahildebrand.workers.dev`),
  Redeploy liefert automatisch den neuesten Stand. **Kein `index.html`-
  Update nötig.** Die genannten Hashes (`3e2378c1`, `f7388655`) sind
  vermutlich Git-Commit-Hashes in `ahsub/ko-aggregator`, keine
  CDN-Pins.
- **`ko-prompts.js`** (Teil von `ko-modules`) — läuft über jsDelivr mit
  Hash-Pinning in `index.html`. **Hier IST nach jedem Commit ein
  Pin-Update in `index.html` nötig**, sonst bleibt die Live-App auf dem
  alten Hash eingefroren (bereits einmal passiert, 15.08.2026-Vorfall).

---

## 8. RSI-Begriffs-Integritätsfund (externes Reviewer-Feedback) — mit Live-Verifikation

### 8.1 Fund

Reviewer identifizierte im CSP-(ATM/NA)-Live-Output vom 02.09. eine
Bedeutungsumkehr, strukturell identisch zum HVP-Kompressionsfund vom
29./30.08.: RSI 70/77 (tatsächlich **überkauft**) wurde zweifach im
selben Output als "kurzfristige **Überverkauftheit**" bezeichnet (COP,
LPG). Die jeweilige Folgeaussage war inhaltlich korrekt ("Gegenbewegung
nicht auszuschließen") — nur das Etikett war verkehrt.

### 8.2 Patch (`ko-prompts.js` v2.18.2)

Analoge BEGRIFFS-INTEGRITAET-Regel direkt neben der bestehenden
HVP-Regel in `PUBLIC_REGULATORY_GUARDRAIL` ergänzt — wirkt automatisch
für alle 14 Strategien (Equity + Options teilen dieselbe Guardrail).
Bewusst nicht Teil dieses Fixes: die vom Reviewer vorgeschlagene
serverseitige RSI-Vorklassifizierung (overbought/oversold/neutral als
bereits gelabeltes Aggregator-Feld statt Modell-Interpretation) — das
ist ein Architektur-Punkt für den 9-Punkte-Schema-Sprint, kein Quick-Fix.

### 8.3 Noch am selben Tag live verifiziert

Zweiter CSP-(ATM/NA)-Lauf nach dem Patch zeigte den Fix wirksam:

- LPG: "RSI 77 → kurzfristige Überkauftheit" ✅
- COP: "RSI 70 → erhöhte kurzfristige Anfälligkeit für Korrekturen" ✅
- BBP: "RSI 64 → keine Extremsignale" ✅ (neutraler Bereich korrekt
  erkannt, kein Falsch-Positiv)

Reviewer bestätigt zusätzlich: der HVP-Fix hält ebenfalls weiterhin
("HVP 62% weist auf im Vergleich zur Eigenhistorie erhöhte realisierte
Volatilität hin" — korrekt, keine Kompressions-Sprache mehr).

---

## 9. Zwei neue, kleinere Funde aus dem Re-Review

### 9.1 "Andienungswahrscheinlichkeit" weiterhin zu stark formuliert

Im selben Live-Output (GILD-Ausschluss): "RSI 75 ... deutet eine erhöhte
Andienungswahrscheinlichkeit an." Reviewer-Einwand: RSI kann ein
Kurs-/Rückschlagrisiko beschreiben, aber nicht unmittelbar die
Assignment-Wahrscheinlichkeit einer konkreten Option — das ist derselbe
Fehlertyp wie die bereits gefixte "Prämienwahrscheinlichkeit"
(29.08.-Muster: eine Option hat keine "-wahrscheinlichkeit", die aus
einem Modellsignal direkt behauptet werden kann). Reviewer-Vorschlag:
"RSI 75 signalisiert ausgeprägte kurzfristige Überkauftheit und damit
innerhalb des Modells ein erhöhtes Rückschlagrisiko. Dies kann bei einem
ATM-Strike den Abstand zur möglichen Andienung schneller reduzieren."
**Noch nicht gepatcht — für morgen vorgemerkt.**

### 9.2 "maximiert" — bestehendes Wortverbot live verletzt, Scanner-Lücke

Im selben Output, Abschnitt "c) Strategischer Zielkonflikt" (LPG): "Ein
näherer ATM-Strike **maximiert** die verfügbare Prämie..." — das
Wort "maximiert" ist in genau diesem Abschnitt bereits seit 29.08.
explizit im Prompt-Text verboten ("Verboten: 'maximiert', 'optimiert'
oder ähnliche Superlative in dieser Gegenüberstellung"), wurde aber
trotzdem verwendet. **Strukturell derselbe Fund wie attraktiv/
Prämienerwartung am 01.09.:** ein Wortverbot im Prompt allein reicht
nicht zuverlässig. Zusätzlicher Befund: `COMPLIANCE_PATTERNS` in
`ko-ai.js` hat **keinen Scanner-Eintrag** für "maximiert"/"optimiert"
(Verbform) — nur "optimal" (Adjektiv) ist erfasst. Diese Verletzung wäre
also nicht einmal geloggt worden. **Für morgen vorgemerkt:** (1)
Guardrail-Verstärkung nach demselben Muster wie §2.2 (NIEMALS/
STATTDESSEN-Paar direkt im Abschnitt c), nicht nur als allgemeines
Verbot), (2) Scanner-Pattern für "maximiert"/"optimiert" ergänzen.

---

## 10. Neuer Architektur-Backlog-Punkt (v2.0/Phase 3): Kanonische Metriken-Pipeline

### 10.1 Auslöser

Konsolen-Log zeigte SKEW 149,23 (Header/Makro-Tab/Dark-Pool-Modul,
übereinstimmend) vs. SKEW 82 (KI-Marktanalyse-Text) im selben
Seitenaufruf — für SKEW eine strukturell zu große Differenz für reinen
Zeitversatz (die dokumentierte "Ampelfarben eingefroren bei
Erstellungszeit"-Erklärung reicht der Größenordnung nach nicht aus).

### 10.2 Wahrscheinliche Ursache — bereits bekannter, offener Punkt

Code-Fund in `market_aggregator.py` (v5.40.0-Kommentar, 31.08.2026):
VVIX/SKEW wurden serverseitig kanonisiert (`fetch_vvix_skew_live()`),
aber der Kommentar selbst vermerkt explizit als **bewusst offen
gelassen**: "Client/Server-Aufspaltung #m-vix + ~40 UI-Stellen —
separater, größerer Architektur-Punkt." Das ist derselbe Punkt, der im
01.09.-Protokoll unter "Weiterhin offen" als "VIX/VVIX/SKEW
Client/Server-Aufspaltung" gelistet ist. Vermutung: der KI-Text bezieht
SKEW (auch nur teilweise) aus einem der ~40 nicht-synchronisierten
Client-Pfade statt aus dem kanonischen Server-Snapshot — nicht
verifiziert (keine Log-/Payload-Einsicht), aber jetzt mit konkreter
Fundstelle statt offener Diagnosefrage.

### 10.3 Axels Vorschlag — generisches Prinzip für v2.0/Phase 3

Axel schlägt vor, das lokale VIX/VVIX/SKEW-Kanonisierungsmuster vom
30./31.08. zu einer generischen Pipeline für **alle** Metriken/Makro-/
Konjunkturdaten zu verallgemeinern:

1. Erhebung ALLER Metriken mit aktuellem Erhebungsdatum in einen
   Data-Container, differenziell geloggt
2. Mathematische Prozessierung (Quotienten etc.), ebenfalls geloggt
3. Erst danach: Gesamtbeurteilung im Rahmen der MarketState-/
   MacroState-Analyse

Vorteil: Vortagsvergleich/gleitender Durchschnitt "for free", Wieder-
verwendbarkeit für künftige MarketState-Iterationen, und strukturelle
Vorbeugung genau der Fehlerklasse, die UIQ bereits zweimal getroffen hat
(VIX 18,77 vs. 14,43 am 30.08., SKEW 82 vs. 149,23 heute).

**Einordnung:** Direkte Erweiterung der bereits am 06.07.2026
beschlossenen Single-Source-of-Truth-Anforderung (damals: Konfigurations-
daten/DRY-Verletzung, bewusst auf v2.0/Phase 3 verschoben — "Doppelarbeit,
hohes Regressionsrisiko, würde UIQ Phase 0 stören"). Gleiche Begründung,
gleiche Zuordnung: **v2.0/Phase 3, nicht aktueller Sprint.** Die 30./
31.08.-VIX/VVIX/SKEW-Fixes sind ein kleiner, bereits funktionierender,
aber nicht generalisierter Präzedenzfall für genau dieses Muster.

---

## 11. Sicherheitshinweis (offen, nicht bestätigt behoben)

Im Rahmen der Konsolen-Log-Analyse (§10.1-Auslöser) erschien erneut ein
Finnhub-API-Key im Klartext in einer geteilten Fehler-URL
(`my-cors-proxy...finnhub.io/...token=...`) — gleiches Muster wie die
bereits am 01.09. dokumentierten Vorfälle (OWNER_TOKEN ×2, Finnhub) und
der Anthropic-Key-Leak vom 31.08. **Empfehlung ausgesprochen: Key
vorsorglich erneut rotieren, falls es sich um den aktuell aktiven
handelt** — noch nicht bestätigt, ob das erfolgt ist. Root Cause
weiterhin unbehoben (Frontend hängt Tokens als Query-Parameter an,
bereits im 01.09.-Backlog vermerkt).

---

## 12. Offene Performance-Frage: MB-Generierungsdauer

Axel meldete erneut lange Wartezeit ("MB-Bericht-Generierung braucht
'ewig'"). Konsolen-Log zeigte eine Kette von ~26 sequenziellen
TwelveData-Abrufen für Sektor-Performance (`fetchSektorPerf`/
`loadSektorRS`/`tdThrottledFetch`, gedrosselt) — falls diese Kette
**vor** dem eigentlichen KI-Call blockierend läuft, wäre das eine
bisher unentdeckte zweite Ursache neben der reinen `callAnthropic()`-
Latenz (die am 30.08. mit 70,8s gemessen, aber selbst als nicht
ausreichend für die gemeldeten ~10 Minuten befunden wurde). **Nicht
verifiziert** — unklar, ob der vorliegende Konsolen-Dump aus einem
gezielten Morning-Briefing-Trigger stammt oder aus einem normalen
Seitenaufruf/Scan. Für morgen vorgemerkt: gezielt Zeit stoppen zwischen
Klick auf "Morning Briefing" und erster TwelveData-Anfrage in der
Konsole.

---

## 13. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.18.2 | Fertig gepatcht + geliefert (HVP scan-Zweig, Guardrail attraktiv/Prämienerwartung, RSI-Begriffs-Integrität); **Commit + jsDelivr-Hash-Pin-Update in `index.html` noch durch Axel durchzuführen** |
| `ko-aggregator/workers/ko-ai.js` | — | Fertig gepatcht + geliefert (attraktiv-Regex Stamm-Matching); von Axel auf Cloudflare deployt (Commit-Hash `3e2378c1`), kein `index.html`-Update nötig |
| `ko-aggregator/workers/ko-sync-worker.js` | v2.2 (unverändert) | Fertig gepatcht + geliefert (`market_strip_snapshot` in ALLOWED_KEYS); von Axel auf Cloudflare deployt (Commit-Hash `f7388655`), kein `index.html`-Update nötig; Datei heute erstmals ins Repo gebracht (`ahsub/ko-aggregator/workers/`) |
| `docs/RUNBOOK.md` | — | Ergänzungsvorschlag "5. Bekannte Betriebs-Fallstricke" geliefert (§6.3), noch nicht durch Axel eingepflegt |

Live-Test bestätigt: `[KoPrompts] v2.18.1 geladen` im Konsolen-Log vom
02.09. 15:57 Uhr — der scan-Zweig-HVP-Fix und die Guardrail-Verstärkung
waren zu diesem Zeitpunkt bereits aktiv. Der spätere RSI-Fix (v2.18.2)
wurde danach separat live verifiziert (§8.3).

---

## 14. Plan für morgen

**Priorität 0 — "Andienungswahrscheinlichkeit" entschärfen** (s. §9.1):
Guardrail-Ergänzung nach demselben Muster wie Prämienwahrscheinlichkeit
(29.08.) — Kausal-Konditional-Format statt impliziter Quantifizierung.

**Priorität 1 — "maximiert"/"optimiert" (Verbform) härten** (s. §9.2):
(1) Guardrail-Verstärkung direkt im Abschnitt c) "Strategischer
Zielkonflikt", (2) `COMPLIANCE_PATTERNS`-Scanner-Eintrag für
"maximiert"/"optimiert" (Verbform) ergänzen — bisher nur "optimal"
(Adjektiv) erfasst.

**Priorität 2 — 9-Punkte-Prompt-Architektur-Sprint starten** (s. §5):
diese Woche, Scope alle 14 Strategien (5 Options + 9 Equity). Kein
Quick-Fix-Zyklus mehr, sondern der eigentliche große Sprint — sollte
eigene Planungszeit bekommen, nicht nebenbei in einem Tagesabschluss
begonnen werden.

**Priorität 3 — RUNBOOK.md-Ergänzung einpflegen** (s. §6.3): Vorschlag
liegt fertig vor, nur noch Einfügen durch Axel.

**Priorität 4 — Sicherheitscheck** (s. §11): Bestätigen, ob der erneut
im Klartext aufgetauchte Finnhub-Key rotiert wurde.

**Bei Gelegenheit, kein fester Termin:**
- MB-Performance-Diagnose (s. §12): TwelveData-Sektor-Kette vs.
  Anthropic-Call-Timing sauber trennen.
- SKEW-Client/Server-Payload-Verifikation (s. §10.2): welcher konkrete
  Codepfad speist `ctx.marktkontext` mit SKEW — kanonischer
  Server-Snapshot oder einer der ~40 client-seitigen Pfade? (Würde den
  bisher unverifizierten Verdacht bestätigen oder widerlegen.)
- `degraded_status`-Route bauen (s. §6.2): jetzt mit bekannter Ursache,
  aber KV-Key/Struktur noch zu klären.

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
- VIX/VVIX/SKEW Client/Server-Aufspaltung (s. §10.2) — bleibt der
  separate, größere Architektur-Punkt, jetzt aber mit konkretem
  Symptom-Beleg statt nur als abstrakter Punkt.
- CC-Wheel-Kontext-Flag, EIC-Schritt-7 "Handlungsempfehlung", ~38
  verbleibende Strategie-Ampel-Texte in `ko-market-state.js`,
  `my-cors-proxy` in GitHub versionieren, Legal-Briefing-Vorbereitung.

**Neu ins v2.0/Phase-3-Backlog (heute, s. §10.3):**
- Kanonische Metriken-Pipeline für alle Metriken/Makro-/Konjunkturdaten
  (Erhebung → Rohdaten-Log → Prozessierung → Prozessierte-Werte-Log →
  Analyse-Layer) — Erweiterung der 06.07.2026-Single-Source-of-Truth-
  Entscheidung von Konfigurationsdaten auf Marktdaten.

**Parallel-Projekt (`ahsub/regime-test`):** unverändert, heute nicht
bearbeitet — Ergebnis des `n_trials=5`-Laufs weiterhin ausstehend.
