## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ist eine Aussage der vorherigen Session über sich selbst —
   nicht dein eigenes Wissen. Behandle es wie eine Behauptung eines Kollegen,
   nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug, nie
   für eine schnelle Plausibilitäts-Antwort.**

6. **NEU (aus dieser Session gelernt): "Commit erfolgreich + Syntax-Check
   bestanden" beweist NICHT, dass die Live-App den neuen Code auch tatsächlich
   lädt.** Bei jeder `ko-prompts.js`/`ko-strategies.js`/`ko-*.js`-Änderung in
   `ko-modules` IMMER auch prüfen, ob der CDN-Hash-Pin (`@HASH` in der
   `<script src="...">`-Zeile in `index.html`) auf den neuen Commit zeigt —
   sonst lädt die Live-App weiterhin die alte Version, unabhängig davon, was
   im Repo steht. Das hat uns heute zweimal kalt erwischt.

7. **NEU: Bei Diff-Vorschlägen im Chat niemals Markdown-Überschriften
   (`## 2. XYZ`) verwenden, wenn sie in der Nähe von Code-Blöcken stehen, die
   der Nutzer kopiert.** Eine reine Gliederungs-Überschrift kann versehentlich
   mit in den echten Code kopiert werden und dort zu einem schwer zu
   diagnostizierenden Syntax-Fehler führen (heute geschehen, s. §2).

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*
*Committed ist nicht deployed. Im Repo ist nicht live.*

---

# UEBERGABE-2026-08-15

**Session-Schwerpunkt:** Vormittags Abschluss der gestern begonnenen DIX/GEX-
Frontend-Korrektur (6 Stellen in `index.html`), danach die vollständige,
literaturgestützte Neufassung der `csp_wheel`-Rollregel (5 Fachquellen
ausgewertet), zwischendurch Vorbereitung eines Anwaltsgesprächs (WpHG/KWG-
Einordnung von UIQ), und am Abend ein selbst verursachter kritischer Bug
(EIC-Toggle tot) samt Ursachenfindung und Behebung — der wiederum einen
tieferliegenden, noch ungelösten Fund freilegte: das Morning Briefing hat
zwei komplett getrennte Erzeugungswege (client-seitig JS und server-seitig
Python), von denen heute nur einer gefixt wurde.

**Repos berührt:** `ahsub/ko-modules` (`ko-strategy-registry.js` v1.1→1.2,
`ko-prompts.js` v2.5.1→2.5.2, `ko-strategies.js` VERSION 2.4.0→2.4.1),
`ahsub/axel-scanner` (`index.html` v462→v465, vier Commit-Runden).

---

## 1. DIX-Feld-Nachzug im Frontend abgeschlossen (Fortsetzung von gestern)

Alle 6 Stellen in `index.html`, die noch auf die alte
`dixSource==='finra_regshodaily'`-Prüfung gesetzt hatten (aus der gestrigen
Backend-Umstrukturierung `dixEtfBasket*`), wurden auf die neuen Feldnamen
umgestellt: UI-Metrik-Widget, Morning-Briefing-KI-Prompt-Kontext (hier lag
der schwerwiegendste Fehler — Text behauptete "ETF-Korb", nutzte aber den
SqueezeMetrics-Wert), Sidebar-Widget, Dark-Pool-Tab-Box, Dark-Pool-KI-Prompt-
Kontext + Flag. Zusätzlich wurde der SqueezeMetrics-DIX (S&P-500-Basis) UND
— nach Axel-Entscheidung — SqueezeMetrics-GEX im Dark-Pool-Tab neu ergänzt
(vorher bewusst ausgeschlossen, Option-B-Entscheidung vom 10.07., die aber
nur der lokalen Volumen-Heuristik galt, nicht echten externen Quellen).
Versioniert als `index.html` v462. **Vollständig verifiziert, funktioniert.**

## 2. Kritischer Bug: EIC-Modus-Toggle komplett tot (selbst verursacht,
    gefunden, behoben)

**Ursache, offen benannt:** Bei der gemeinsamen Bearbeitung des Dark-Pool-
KI-Prompts (§1) hat Claude eine Markdown-Gliederungsüberschrift
("## 2. Fragenlisten + Abschluss-Anweisung im Prompt") in einer Chat-Antwort
geschrieben — dieser Text wurde versehentlich mit in den echten Code
kopiert, direkt vor `var prompt = getKiSystemPrompt(...)`. `"2."` wurde als
Zahl-Literal geparst, `Fragenlisten` direkt danach als unerwartetes Token
→ `SyntaxError` an Zeile 25899.

**Auswirkung:** Da es sich um einen einzigen, sehr großen `<script>`-Block
handelt, ließ der Syntax-Fehler den **gesamten** restlichen Block scheitern
— nichts darin wurde definiert. Betroffen: `toggleExpertMode` (Funktion
komplett undefiniert → `ReferenceError`), `_optionsMaxPrice` (Variable
undefiniert → `ReferenceError` in `_initUICache()`). Symptom für Axel: PIN-
Eingabe wurde akzeptiert, aber der Toggle-Schalter blieb inaktiv.

**Fehlgeleitete Zwischenhypothese (dokumentiert, damit sie nicht erneut
verfolgt wird):** Vor Fund des echten Syntax-Fehlers wurde vermutet,
`eicPinSubmit()` würde nach korrekter PIN-Eingabe nur `unlockEicEditor()`
aufrufen, nie `toggleExpertMode()` erneut — das ist strukturell zwar
korrekt beobachtet, war aber **nicht** die eigentliche Ursache des
gemeldeten Bugs. Nicht separat gefixt, da durch den Syntax-Fix bereits
behoben. Falls der Toggle-Bug jemals wieder auftritt UND kein Syntax-Fehler
vorliegt, könnte diese Beobachtung trotzdem relevant werden.

**Fix:** Fehlerhafte Zeile entfernt, per echtem Node.js-Parser verifiziert
(nicht nur Sichtprüfung — genau das war die Lehre aus dem Fehler selbst).
Live im Browser bestätigt: `toggleExpertMode` und `_optionsMaxPrice` wieder
definiert, keine Konsolenfehler mehr beim Laden.

## 3. CDN-Hash-Pin-Falle — zweiter kritischer Fund am selben Tag

Nach dem Toggle-Fix wurde versucht, den Morning-Briefing-DIX/GEX-Fix (§5)
live zu verifizieren — drei aufeinanderfolgende Versuche zeigten
byte-identischen alten Text trotz frischer Generierung. Ursache:
`index.html` band `ko-prompts.js` weiterhin über `@3361e99` ein (Stand vom
13.08.) — **alle heutigen `ko-prompts.js`-Änderungen (§4 Registry-Anbindung,
§5 Morning-Briefing-Fix) liefen im Repo korrekt, wurden aber von der Live-
App nie geladen**, da der CDN-Hash-Pin nie aktualisiert wurde. Auf
`@5446c8f` korrigiert, per direktem CDN-Fetch aus der Browser-Konsole
verifiziert (`fetch(...).then(t => t.indexOf(...))`, nicht nur Hash-String-
Vergleich). **Das erklärt vermutlich auch, warum der komplette CSP-Wheel-
Registry-Fix aus §4 heute nie live im Browser getestet wurde** — es gab
keine Gelegenheit dazu, da der alte Code bis zu diesem Fund geladen wurde.

**Wichtige neue Regel für künftige Sessions** (auch in den Pflicht-Header
oben aufgenommen): Bei jeder Änderung an einer `ko-modules`-Datei IMMER
auch den zugehörigen CDN-Hash-Pin in `index.html` prüfen/aktualisieren,
nicht nur den Quelldatei-Commit.

## 4. CSP-Wheel-Rollregel — literaturgestützte Neufassung (5 Quellen)

Fünf Fachbücher ausgewertet (PDF/EPUB, direkt von Axel hochgeladen, Inhalte
gezielt per Volltext-/Seitensuche extrahiert, nicht erraten):

- **Jabbour/Budwick, "The Option Trader Handbook"** (S. 311-315): kritisiert
  "roll down and out" bei bedrängtem CSP explizit als "flawed thinking" —
  eliminiert typischerweise den gesamten Credit, verlängert die
  Risikoexposition. Empfiehlt stattdessen: bei reiner Einkommensabsicht
  schließen, bei Erwerbsabsicht bis Andienung halten, Rollen nur bei
  tatsächlich größerem Credit.
- **Natenberg** (Hauptwerk + Workbook): **kein Cross-Check möglich** —
  behandelt ausschließlich Market-Maker-Delta-Hedging-Adjustments, nicht die
  praktische Retail-Frage. Ehrlich als "nicht anwendbar" dokumentiert, nicht
  künstlich als Bestätigung/Widerspruch gewertet.
- **Spina, "Erfolgreich Optionen Handeln"** (S. 98, 179-196): klassifiziert
  Short Put explizit als **undefiniertes Risiko** (nicht definiertes, wie
  zunächst angenommen) — das komplette empirisch-backgetestete
  Management-Framework (DTE-Laufzeitmitte, 50-75%-Gewinnschwelle,
  -200%-Stop-Loss) gilt damit direkt für CSPs. "Durchrollen" wird nur für
  Positionen mit definiertem Risiko als Option genannt — CSP gehört laut
  Spina nicht dazu.
- **Thomsett, "Conservative Options Trading"**: pro-Rollen für Covered
  Calls (bestätigt bestehende `cc`-Logik), aber für Short Puts eher
  Schließen+Neueröffnen statt Rollen derselben Position — keine explizite
  Kritik wie Jabbour/Budwick, aber auch keine Befürwortung von "roll down
  and out".
- **Friedenheim, "Optionen handeln mit Köpfchen"** (S. 37): konkrete,
  quantifizierte Regel — Delta 16-30, DTE 4-6 Wochen, Profit-Taking 50%,
  Stop-Loss -200% (zweifache Prämie). **Delta-Wert fast exakt deckungsgleich
  mit der gestrigen Korrektur (0,15-0,30)**, Stop-Loss-Wert **exakt
  identisch mit Spina** — zweite unabhängige Quelle für denselben Wert.
- **Saliba, "Option Spread Strategies"** (S. 29-33): bestätigt Put-Call-
  Paritäts-Äquivalenz (Covered-Write = synthetischer Short Put), empfiehlt
  aber bei fallendem Kurs aktiv "Down and Out"-Rollen des Covered-Writes
  (Short-Call-Seite) — dem Jabbour/Budwick-Fund zunächst scheinbar
  widersprechend. **Auflösung, von Axel bestätigt:** Salibas Kontext ist
  PROAKTIVER Schutzaufbau, nicht REAKTIVE Rettung einer bereits bedrängten
  Position — strukturell identisch zum bereits bestehenden, bewährten
  ATMNA-Rollsystem (mehrstufig, prämienneutral, `maxRollDte: 90`).

**Ergebnis — Registry aktualisiert** (`ko-strategy-registry.js` v1.1→1.2,
`csp_wheel.rules`):
- Neu: `stopLoss: -200%` (zwei unabhängige Quellen)
- `rollRules` komplett neu strukturiert: zweistufiges, prämienneutrales
  System (`maxRollDte: 90`, analog ATMNA) statt der alten pauschalen
  `evaluate_assignment_or_roll_down_and_out`-Formel. Verzweigt nach
  ursprünglicher Handelsabsicht (reine Einkommensabsicht → schließen bei
  Bedrängnis; Erwerbsabsicht → Andienung akzeptieren). Ausführliche
  Quellenangabe direkt im `note`-Feld der Registry hinterlegt.

**Nicht verifiziert:** Ob dieser neue `rollRules`-Aufbau tatsächlich von
irgendeiner Prompt-Funktion konsumiert wird — anders als `deltaRange`/
`dteRange` (über `getEffectiveRules()` in die `csp_wheel`/`cc`-Prompt-Texte
eingebunden, gestern) ist für `rollRules` noch **keine** entsprechende
Anbindung gebaut worden. Die Daten liegen in der Registry, fließen aber
möglicherweise noch nirgends in einen tatsächlichen KI-Prompt-Text ein.
**Für nächste Session zu prüfen.**

## 5. Morning-Briefing-Prompt: DIX/GEX waren nur Stilregel, keine
    Aufgabenstellung (`ko-prompts.js` v2.5.1→2.5.2)

Trotz §1/§3-Fixes zeigte ein frisch generiertes Morning Briefing weiterhin
keinerlei Erwähnung von DIX/GEX im eigentlichen KI-Text. Ursache: die
5-Abschnitt-Struktur (Public) bzw. 6-Abschnitt-Struktur (EIC) der Aufgaben-
stellung in `_getMorningPrompt()` nennt VIX/PCR/HY-Spread/Net-Liquidity
explizit als Pflicht-Inhalt pro Abschnitt — DIX/GEX aber nirgends. Es gab
nur eine **nachgestellte Stilregel** ("falls DIX erwähnt wird, so
kennzeichnen"), keine **Aufforderung**, es überhaupt zu erwähnen.
Zusätzlich war die GEX-Formulierung veraltet ("nur als AAPL-Einzeltitel-
Proxy nennen, NIE als SPY/QQQ-Marktlevel" — beschreibt den Stand vor dem
gestrigen Backend-Fix). Fix: DIX/GEX explizit in Abschnitt 2 (SENTIMENT
bzw. VOLATILITÄT & FLOW) beider Modi verankert, GEX-Text korrigiert,
`_dixReal`-Berechnung in `index.html` erweitert (erkennt jetzt sowohl
`DIX (ETF-Korb` als auch `DIX (S&P-500-Basis`-Zeilen, vorher nur ersteres).

**WICHTIG, noch ungelöst — größter offener Punkt für morgen:** Nach dem
CDN-Hash-Fix (§3) wurde erneut getestet — Text weiterhin identisch, DIX/GEX
weiterhin nicht erwähnt. Grund: Browser-Konsolen-Log zeigte
`"[Morning] Briefing aus KV-Cache geladen (2026-08-15T04:08:26Z)"` — dieser
Zeitstempel ist identisch mit dem heutigen nächtlichen Aggregator-Lauf
(#215), dessen Log eine Zeile `"[SNAPSHOT] Morning Briefing generiert (2955
Zeichen)"` enthielt. **Es gibt offenbar zwei komplett getrennte
Erzeugungswege:**
1. **Client-seitig** (`ko-prompts.js`, heute gefixt) — für Live-
   Neuberechnung im Browser
2. **Server-seitig** (Python, `market_aggregator.py`, nächtlicher Cron) —
   generiert eigenständig einen fertigen Text, gespeichert in Cloudflare KV

Der "Neu"-Button lädt/zeigt vermutlich den KV-gecachten Server-Text, nicht
das Ergebnis des heute gefixten Client-Pfads. **Die Python-seitige Prompt-
Logik in `market_aggregator.py` wurde heute nicht gefunden oder angefasst
— unbekannt, ob sie dieselbe DIX/GEX-Lücke hat, vermutlich aber ja, da
noch nie explizit dafür gebaut.** Höchste Priorität für morgen früh.

## 6. Rechtsgutachten-Vorbereitung (Vormittag, zwischendurch)

Vollständiges Vorbereitungsdokument für Erstgespräch (IHK oder Fachanwalt
Bank-/Kapitalmarktrecht) erstellt und als Word-Datei bereitgestellt
(`UIQ-Vorbereitungsdokument-Anwaltsgespraech.docx`). Enthält: Ein-Satz-
Beschreibung (Public=coachend/deskriptiv, EIC=konkrete Empfehlungen, EIC
bleibt dauerhaft privat, keine Monetarisierung geplant), methodische
Fundierung (Backtest Sharpe 1,66 vs. 0,63, 2007-2026), Axels eigene
Arbeitshypothese (MAR-Anlageempfehlung statt KWG-Anlageberatung, da
systematisch/objektiv/gleichbehandelnd statt individualisiert), die
zentrale Kernfrage fürs Gespräch. **Offen:** Axel muss noch 3-5 Screenshots
der Public-Version-Ausgabe ergänzen, dann ist er gesprächsbereit.

## 7. Nicht bearbeitet / offen für nächste Session

- **Höchste Priorität:** Server-seitiger Python-Morning-Briefing-Prompt in
  `market_aggregator.py` finden und denselben DIX/GEX-Fix nachziehen (§5).
- Ob `csp_wheel.rollRules` (§4, neu strukturiert) tatsächlich von einer
  Prompt-Funktion konsumiert wird, oder nur ungenutzt in der Registry
  liegt — prüfen, ggf. `getEffectiveRules()`-artige Anbindung bauen.
- Rechtsgutachten: Axel muss noch Screenshots ergänzen (§6).
- Alle Punkte aus der 14-Tage-Rückschau vom 14.08., die dort noch offen
  waren (Rechtsgutachten/Beta-Tokens-Status, IWV-Holdings-Update ~27.08.).
- Restliche Literatur-Sammlung (Natenberg-Hauptwerk als Delta/Greeks-
  Fundament unabhängig von der CSP-Frage, Guy Cohen, Wolfinger u.a.) —
  nicht dringend, bei Gelegenheit.

---

*Verifiziert vor behauptet. §1-§3 sind vollständig live verifiziert
(Browser-Konsole, direkter CDN-Fetch, Node.js-Parser). §4 ist nur auf
Registry-Ebene verifiziert (Node.js-Test), NICHT live in einem generierten
Prompt-Text bestätigt — bewusst als offener Punkt markiert, nicht als
erledigt behauptet. §5 ist die Kernursache noch nicht behoben, nur
lokalisiert — das ist ausdrücklich so festgehalten, kein Erfolg wird hier
vorgetäuscht. §6 ist vollständig, nur auf Axels Screenshot-Beitrag
wartend.*
