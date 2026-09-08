# UEBERGABE-2026-09-08.md

Zweiter Tag der EIC-Master-Prompt-Migration, direkte Fortsetzung von
UEBERGABE-2026-09-07.md. Der Tag zerfällt in drei Blöcke: (1) Abschluss der
gestern begonnenen Härtung der fünf Optionsstrategien samt neuem
serverseitigen Zahlen-Erfindungs-Scanner, (2) Erweiterung der gesamten
Master-Prompt-Architektur auf Aktienstrategien (bisher options-exklusiv),
(3) Migration von 8 der 9 geplanten Equity-Strategien mit umfangreicher,
größtenteils erstmals verifizierter Literaturarbeit. Am Ende des Tages ein
wichtiger, wiederkehrender methodischer Fund: mehrere eigene Dateifehler
(Datei-Duplikation, `risikenText` wird von `_eicMasterPrompt()` nicht
gelesen) wurden erst durch eigene Tests vor dem Deploy gefangen — das
Muster lohnt sich, morgen bei jeder neuen Migration bewusst zu prüfen.

**Wichtig zum Einstieg:** Der zuletzt bereitgestellte Stand (`ko-prompts.js`
v2.53.10, `dividend`-Literaturanreicherung) war beim Schreiben dieses
Protokolls noch NICHT deployed — der bestätigte Live-Stand war v2.53.8.
Bitte als Erstes prüfen/deployen, bevor an `breakdown`/`fading_short`
weitergearbeitet wird.

---

## 1. Serverseitige Guardrail gegen Zahlen-Erfindung gebaut (`ko-ai-worker.js`)

Direkte Umsetzung der gestern beschlossenen Strategie ("Sichtbarkeit statt
sechstem Prompt-Patch"): `scanForNumericFabrication()` + Hilfsfunktionen
ergänzt (v1.19→v1.20). Extrahiert den `HANDLUNGSEMPFEHLUNG`-Block, prüft
jeden $-/%-/Kontrakte-Wert gegen das tatsächlich gesendete Payload, loggt
Treffer unter `[COMPLIANCE]` — nicht blockierend, exakt wie die
bestehenden Scanner. Isoliert gegen alle fünf Live-Test-Funde vom Vortag
verifiziert.

**Zwei schnelle Nachschärfungen nach ersten neuen Live-Test-Funden:**
- v1.21: Cent-Angaben ergänzt (Modell wich von $-Zeichen auf "Cent" aus,
  um dem Muster zu entgehen).
- v1.22: `max_tokens` für EIC-`ki_briefing` von 5000 auf 7000 erhöht
  (zusätzlicher Hebel neben der Wortbudget-Präzisierung in Punkt 2).

**Aktueller Live-Stand:** v1.22, bestätigt deployed.

## 2. Verbleibende Nachschärfungen an den fünf Optionsstrategien

Mehrere gesammelte Live-Test-Funde (Axels ausdrücklicher Wunsch: "erst
sammeln, dann fixen, sonst verlieren wir uns im Kleinklein") ergaben vier
echte Korrekturen in `ko-prompts.js` (v2.52.0→v2.52.2):

- **weekly_income:** eigener Fehler entdeckt — "Strike ca. $4-5 unter
  Kurs" war Lawrences Dollar-Beispiel für eine $74-Aktie, keine
  kursunabhängige Regel. Korrigiert auf "5-7% unter Kurs" (aus dem
  SCHW-Beispiel hergeleitet). Derselbe Fehlertyp wie bei Ludwigs
  $2,50-Beispiel, diesmal selbst begangen.
- **collar:** fehlende Call-Strike-Näherung ergänzt (1-2× ATR über Kurs,
  UIQ-eigen, keinem Buch zugeschrieben) — ohne diese Vorgabe hatte das
  Modell eine erfundene "1-3% über Kurs"-Regel genannt.
- **§23 (geteilter Options-Schlussblock):** neue Sperre gegen FALSCHE
  AUTORENNENNUNG ergänzt (dritter Beleg: `collar` zitierte "Ludwig
  Standard" für eine Zerenner/Chupka-basierte Konvention).
- **Konkretes Wort-Budget** pro Kandidat ergänzt (max. 120-150 Wörter,
  alle Felder zusammen) — die bisherige "1-2 Sätze"-Vorgabe reichte nicht,
  drei von vier parallelen Tests brachen trotz erhöhtem Token-Limit erneut
  ab.

## 3. Equity-Architektur: `_eicMasterPrompt()` auf Aktienstrategien erweitert

Wichtigster Architektur-Schritt des Tages. Bisher hing der options-
exklusive §23-Schlussblock (Strike/DTE/Prämie) unbedingt an jede über
`_eicMasterPrompt()` migrierte Strategie — bei reinen Aktienstrategien
ohne Optionskomponente ergab das keinen Sinn.

**Fix:** `_eicMasterPrompt()` liest jetzt `istOptionsStrategie` (bisher nur
von `_publicNinePointPrompt()` ausgewertet) und wählt zwischen zwei
Schlussblöcken: `OPTIONS_FINAL_BLOCK_TEXT` (unverändertes §23) oder neu
`EQUITY_FINAL_BLOCK_TEXT` (konkreter Einstiegspunkt/Stop-Loss/Gewinn-
mitnahme statt Strike/DTE/Prämie, gleiche Sperren-Architektur wie §23,
direkt übernommen).

**Eigener, schwerwiegenderer Fehler dabei passiert und behoben:** Bei der
Restrukturierung wurde die GESAMTE Datei versehentlich dupliziert
(11439 statt ~5700 Zeilen, `module.exports` kam zweimal vor) — funktional
folgenlos (JS überschreibt einfach), aber unnötig aufgebläht. Bereinigt,
Byte-Identität beider Hälften vor dem Löschen verifiziert. **Lehre:**
Nach jeder größeren strukturellen Python-Skript-Bearbeitung die
Zeilenzahl der Datei gegenprüfen, nicht nur `node --check`.

## 4. Sieben Equity-Strategien migriert, mit Literaturarbeit

| Strategie | Quelle(n) | Kernfund/-korrektur |
|---|---|---|
| **momentum** | Minervini ("Think & Trade Like a Champion"), Antonacci (nur Hintergrund, Domänen-Mismatch) | Stop-Loss 7-8%/max.10%, Pivot-Point-Prinzip |
| **swing** | Spears ("Swing Trading Simplified"), Lowe (konzeptionell) | Chance-Risiko 7%/4%, Stop relativ zur eigenen Volatilität |
| **vcp** | Minervini ("Trade Like a Stock Market Wizard") | Halbierungsregel (jede Kontraktion ~halb der vorherigen); korrigierte Kontraktionszahl (2-4 statt "≥3") |
| **breakout** | beide Minervini-Bücher | RS-Rating korrigiert (≥70/idealerweise 80-90er statt starrer "≥85"); Ausbruchsvolumen korrigiert (300-400%/3-4x statt 1,2-2,0x) |
| **meanrev** | Chan ("Algorithmic Trading"), Leung/Li (nur Hintergrund, zu mathematisch) | Half-Life-Konzept als Unterbau der Momentum-Falle-Warnung, Z-Score-Framing |
| **ko** | Reviewer-Architekturvorschlag, gegen echten Aggregator-Code verifiziert | trendScore/ADX/chopIndex/rsRating mit verifizierten Schwellen (ADX≥35/≥20, ChopIndex≥55) konkretisiert; grosser 4-Gate-Vorschlag als Backlog |
| **value** | Carlin ("Modern Value Investing", Favorit), Bos (Hintergrund), Spier/Chang (nicht ergiebig) | Fama-French-Validierung (niedrigstes 30%-P/B-Perzentil schlägt höchstes um 4,6%-Punkte p.a.); Graham-Net-Net als Hintergrund dokumentiert |
| **dividend** | Carlson, Siegel, Wright (Hintergrund), Harrington/Edwards (nicht ergiebig) | Payout-Obergrenze ~60% MIT REIT/MLP-Ausnahme; Siegels Quintil-Fund als empirische Yield-Trap-Bestätigung |

**Noch offen:** `breakdown`, `fading_short` (beide Short-Strategien) —
keine Literatur dafür bisher gesammelt.

## 5. Systemischer Fund: fehlende Stop-Loss-Konvention als wiederkehrende Ursache

Nach Axels ausdrücklichem Wunsch ("erst sammeln, bevor wir uns im
Kleinklein verlieren") wurden vier parallele Live-Tests gesammelt, bevor
gefixt wurde — alle vier (`vcp`/`breakout`/`meanrev`/`ko`) zeigten
dasselbe Grundmuster: eine fehlende Stop-Loss-Konvention im tatsächlichen
`STRATEGIEPRINZIP` führt zuverlässig zu einer erfundenen Zahl, in jeweils
ANDERER Tarnung:

1. **Richtiger Autor, falsche Zahl** — `vcp` zitierte "2-3% ... Nach
   Minervini-Konvention", obwohl Minervinis echte Regel 7-8%/max.10% ist.
2. **Eigenes Kennzeichnungssystem als Tarnung** — `ko` labelte eine
   erfundene "-8%"-Schwelle explizit als "GENERAL DOMAIN KNOWLEDGE".
3. **Erfundene Referenzgröße mit widersprüchlicher Rechnung** — `meanrev`
   bezog sich auf "die gestrige Tagestiefst-Range" (kein UIQ-Feld) und
   rechnete zusätzlich falsch.

**Fix:** `vcp`/`breakout` bekamen Minervinis echte Zahlen tatsächlich ins
Prinzip geschrieben (vorher nur in einem Code-Kommentar behauptet, den
das Modell nie sieht). Die geteilte Equity-Sperre wurde um alle drei
Umgehungsmuster erweitert (gilt automatisch für alle sechs bis dahin
migrierten Equity-Strategien).

**Nachtest bestätigt teilweisen Erfolg:** `breakout` hielt beim
Nachtest vollständig (Stop-Loss UND Gewinnmitnahme korrekt). `vcp` hielt
beim Stop-Loss, erfand aber einen neuen "3×"-Gewinnmitnahme-Multiplikator
im bewusst offen gelassenen Gewinnmitnahme-Feld — als Scanner-abgedeckter
Restfall akzeptiert, nicht weiter gepatcht.

**Neuer, verwandter Fund bei `value` (noch nicht gefixt):** Stop-Loss
"7-8% ... Value-Konvention, Graham/Buffett" — inhaltlich unstimmig, da
Buffett/Graham explizit GEGEN feste technische Stop-Loss-Prozente stehen
(ihr Ansatz ist fundamentale Neubewertung, kein Kurs-Trigger). Zusätzlich
erstmals eine erfundene Positionsgrößen-Zahl ("max. 3-5% des Portfolios")
trotz expliziter Sperre. **Für morgen:** `value`s Prinzip sollte
klarstellen, dass Value-Investing keine feste Stop-Loss-Konvention kennt
(Ausstieg eher über fundamentale These-Widerlegung) — noch nicht
umgesetzt.

## 6. Drei Architektur-Backlog-Dokumente erstellt (alle im Repo abzulegen)

Bei drei Strategien kamen umfangreiche Reviewer-Vorschläge für NEUE
Aggregator-Felder/Score-Architekturen (nicht nur Prompt-Korrekturen) —
analog zum bereits am 07.09. zurückgestellten Optionsstrategie-Erweiterungs-
vorschlag als Backlog dokumentiert, NICHT umgesetzt:

- `UIQ_MeanReversion_Architecture_Proposal_2026-09-08.md` — Z-Score, ADF,
  Hurst, Half-Life, OU-θ, Variance Ratio als neue Felder; zwei-Phasen-
  Architektur ("MR-fähiges Underlying" vs. "aktuelles Setup").
- `UIQ_KOLong_Architecture_Proposal_2026-09-08.md` — 4-Gate-Funnel
  (Market/Stock-Quality/Entry/Extension), separates KO-Product-
  Suitability-Modul. Besonderheit: mehrere genannte Felder (`trendScore`,
  `chopIndex`, `patternEntry`, `iosScore`) wurden gegen den echten
  Aggregator-Code verifiziert und bestätigt — näher an umsetzbar als der
  Mean-Reversion-Vorschlag.
- `UIQ_Dividend_Architecture_Proposal_2026-09-08.md` — 3-Score-Split
  (Income/Quality/Entry), `sDividend`-Herkunft klären, gestufte Yield-
  Interpretation (2,5%-15%) als UNBELEGTE Kalibrierungs-Hypothese des
  Reviewers markiert, nicht übernommen.

**Alle drei Dokumente wurden Axel bereitgestellt, aber der Commit-Status
im UIQ-Suite-Repo ist unbekannt — bitte prüfen, ob sie dort abgelegt
wurden.**

## 7. Neuer Wunsch von Axel für morgen: öffentliches Literaturverzeichnis

Axel möchte ein für UIQ-Nutzer öffentlich einsehbares Literaturverzeichnis
anlegen, das alle für Strategieempfehlungen verwendeten Quellen auflistet.
Bisher nur als Wunsch geäußert, noch nicht spezifiziert (Format, Umfang,
Public-Zugänglichkeit innerhalb welcher UIQ-Oberfläche). Die heutige
Session hat bereits eine informelle Liste erzeugt (s. Tabelle in Punkt 4
oben) — als Ausgangspunkt nutzbar, aber noch keine strukturierte
Spezifikation.

**Mögliche erste Fragen für morgen:** Soll das Verzeichnis pro Strategie
gruppiert sein (wie in der Tabelle oben) oder alphabetisch nach Autor? Soll
es nur Bücher mit tatsächlich übernommenen Fakten listen, oder auch
konsultierte-aber-nicht-verwendete Quellen (z.B. Antonacci, Leung/Li)
transparent mit Begründung? Wo in der UIQ-Oberfläche soll es angezeigt
werden (eigener Menüpunkt, Fußzeile, Tooltip pro Strategie)?

---

## 8. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `ko-modules/ko-prompts.js` | v2.53.10 | **bereitgestellt, Deploy-Status unbestätigt** — bestätigter Live-Stand war zuletzt v2.53.8 |
| `workers/ko-ai-worker.js` | v1.22 | deployed, bestätigt |
| `UIQ_MeanReversion_Architecture_Proposal_2026-09-08.md` | — | bereitgestellt, Ablage im Repo unbestätigt |
| `UIQ_KOLong_Architecture_Proposal_2026-09-08.md` | — | bereitgestellt, Ablage im Repo unbestätigt |
| `UIQ_Dividend_Architecture_Proposal_2026-09-08.md` | — | bereitgestellt, Ablage im Repo unbestätigt |

**Equity-Migrationsstand:** 8 von 9 Strategien migriert (`momentum`,
`swing`, `vcp`, `breakout`, `meanrev`, `ko`, `value`, `dividend`).
Ausstehend: `breakdown`, `fading_short`.

---

## 9. Plan für morgen

**Priorität 0 — Deploy-Stand verifizieren.** v2.53.10 tatsächlich live?
Falls nicht, zuerst committen, bevor an `breakdown`/`fading_short`
weitergearbeitet wird (Lehre aus den wiederholten Sync-Verzögerungen
heute — `raw.githubusercontent.com` kann bis zu 5 Minuten hinter dem
echten Commit-Stand liegen, im Zweifel über die GitHub-Contents-API
statt Raw-CDN verifizieren).

**Priorität 1 — `value`-Stop-Loss-Formulierung fixen.** Value-Investing
kennt keine feste Kurs-Stop-Loss-Konvention (Buffett/Graham-Ansatz ist
fundamentale Neubewertung) — Prinzip sollte das explizit klarstellen,
statt eine Lücke offen zu lassen, die das Modell mit einer unpassenden
Zuschreibung füllt. Zusätzlich: die neue Positionsgrößen-Erfindung
("3-5% des Portfolios") beobachten, ob das bei weiteren Strategien
wiederkehrt (bisher einmaliger Beleg).

**Priorität 2 — verbleibende zwei Equity-Strategien migrieren.**
`breakdown` (Short-Pendant zu Breakout/VCP-Long?) und `fading_short`
(KO-Zertifikat, Short-Richtung, Pendant zur bereits migrierten `ko`-
Strategie) — noch keine Literatur dafür gesammelt, Axel um passende
Quellen bitten, gleiches Vorgehen wie bisher.

**Priorität 3 — Literaturverzeichnis-Spezifikation.** Mit Axel klären:
Gruppierung, Umfang (nur verwendete vs. auch konsultierte Quellen),
Darstellungsort in der UIQ-Oberfläche. Die Tabelle in Punkt 4 dieses
Protokolls als Rohmaterial nutzen.

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
kanonische Metriken-Pipeline (v2.0/Phase 3), Ticker-Integrations-Skript
(Backlog-Idee vom Vorabend, 07.09.), Repo-Privatstellung (`ko-modules`),
Legal-Briefing-Vorbereitung.

---

## 10. Methodische Erkenntnisse des Tages

1. **Sammeln vor Fixen funktioniert, wenn man diszipliniert bleibt.**
   Axels Anweisung ("erst mehrere Tests sammeln, sonst verlieren wir uns
   im Kleinklein") hat den systemischen Stop-Loss-Fund (Punkt 5) erst
   sichtbar gemacht — bei sofortigem Patchen nach dem ersten `meanrev`-
   Fund wäre nur EINE der drei Tarnvarianten behoben worden.
2. **Eine Behauptung im Code-Kommentar ist keine Umsetzung.** Zweimal
   heute (`vcp`/`breakout`s Stop-Loss, ursprünglich nur kommentiert) hat
   sich gezeigt: was nicht tatsächlich im `principle`-String steht, sieht
   das Modell nicht — unabhängig davon, wie klar die Absicht im
   umgebenden Code dokumentiert ist.
3. **`_eicMasterPrompt()` liest nur bestimmte Felder aus `o`** (`principle`,
   `rolle`, `stratName`, `focus`, `istOptionsStrategie`, `mode`) — NICHT
   `risikenText`/`risikoBegriff`/`tradeoffKontext`, die nur
   `_publicNinePointPrompt()` versteht. Bei `cc`, `collar` und `dividend`
   wäre wichtiger Inhalt sonst im EIC-Modus stillschweigend verschwunden
   — jedes Mal vor dem Deploy selbst gefunden, nicht erst live. Bei
   `breakdown`/`fading_short` von Anfang an daran denken.
4. **Ein Reviewer-Vorschlag ohne Zitat ist eine Hypothese, kein Fund.**
   Die Dividend- und Mean-Reversion-Vorschläge enthielten konkrete Zahlen
   (Yield-Stufen, Gewichtungen) ohne Quellenangabe — im Unterschied zu
   den Minervini/Ludwig/Lawrence-Funden wurden diese bewusst NICHT als
   belegte Fakten übernommen, sondern als "eigene Kalibrierungs-
   Hypothese des Reviewers" gekennzeichnet oder ganz weggelassen.
5. **Dateigröße nach strukturellen Python-Edits gegenprüfen.** Die
   ungewollte Volldopplung der Datei (Punkt 3) wäre durch einen simplen
   `wc -l`-Vergleich vor/nach sofort aufgefallen — `node --check` allein
   hätte den Fehler nie gefunden, da doppelter Code syntaktisch gültig
   bleibt.
