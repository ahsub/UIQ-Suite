# UEBERGABE-2026-09-05.md

Fortsetzung von `UEBERGABE-2026-09-03.md`. Zwei Arbeitstage in einer
Session: zuerst P0 (KO-5-Guardrail-Fund samt `homeMarket`-Fix) sauber
abgeschlossen, dann P1 (Equity-Migration) mit `momentum` als erster
von 8 verbleibenden Equity-Strategien gestartet — und von dort aus in
einen ausführlichen, mehrstufigen Prompt-Härtungs-Sprint übergegangen,
der schließlich zu einem systematischen adversarialen Test aller 7
bereits migrierten Strategien wurde. Anstrengender Tag, aber mit
deutlichem Erkenntnisgewinn: mehrere strukturelle Schwachstellen in
der 9-Punkte-Architektur selbst gefunden und behoben, nicht nur
Einzelfall-Formulierungen.

---

## 1. P0 abgeschlossen: KO-5-Guardrail-Fund (`homeMarket`)

Der erste echte 9-Punkte-Live-Test von `ko` (v2.22.4) zeigte KO-5
(Gap-/Overnight-Risiko) komplett fehlend — die Regel "bei US-Titeln"
verlangte reine Text-Inferenz aus dem Tickersymbol statt einen
gelieferten Fakt (Ticker "DE" kollidiert z.B. mit dem Länderkürzel
Deutschland). Root Cause diagnostiziert und behoben:

- **`market_aggregator.py`**: neues Feld `homeMarket` (US/DE/FR/NL/IT/
  CH/UK/DK/SE/AU), aus Ticker-Suffix abgeleitet über
  `_derive_home_market()`. Wichtige Erkenntnis dabei: die meisten
  "EU-Titel" im UIQ-Universum sind ADRs, die selbst auf NYSE/NASDAQ
  handeln (SAP, ASML, RIO, NVO etc.) — maßgeblich ist die
  Handelsboerse, nicht der Firmensitz.
- **`ko-prompts.js`**: KO-5 nutzt jetzt `homeMarket=US` statt
  Ticker-Raten (v2.22.5), danach Politur-Fix, da das Modell die
  interne Feldnotation "homeMarket=US" wörtlich übernahm statt sie zu
  verbalisieren (v2.22.6).
- **`index.html`** (Repo `axel-scanner`): `homeMarket` in
  `topResults`/`tickerList`/`DATA_LEGENDE` an die KI weitergereicht
  (v487→v488).

Alle drei Dateien committed, Aggregator-Lauf durchgeführt, KO-Retest
bestätigte den Fix: KO-5 griff korrekt bei US-notierten Kandidaten,
Politur-Fix verifiziert (natürlichsprachliche Verbalisierung statt
Feldnotation).

---

## 2. P1: Equity-Migration — `momentum` migriert und mehrfach gehärtet

`momentum` von `_publicEquityPrompt()` auf `_publicNinePointPrompt()`
migriert (v2.23.0). Vor dem ersten Live-Test proaktiv auf bekannte
Problemwörter geprüft — keine gefunden, aber ein neuer struktureller
Fund: ein `focus[]`-Kriterium hätte das Modell zu einem konkreten
Stop-Loss-Prozentwert eingeladen (verstößt gegen Grundgesetz #11,
EIC-exklusiv) — vor dem Test auf rein qualitative Formulierung
umgestellt.

Danach vier Live-Test-Runden mit externem Reviewer-Feedback
(v2.23.0 → v2.26.0), die den **wichtigsten generischen Zugewinn des
Tages** hervorgebracht haben: den `REASONING-GUARDRAILS`-Block im
gemeinsamen 9-Punkte-Builder, der rückwirkend für alle migrierten
Strategien gilt. Kernpunkte (a) bis (d) entstanden hier:

- **(a) Kausalitäts-/Wahrscheinlichkeitsverbot**: "macht
  wahrscheinlicher"/"führt zu"/"erhöhtes Risiko" → "ist konsistent
  mit"/"signalisiert" (später mehrfach nachgeschärft, s. Abschnitt 3).
- **(b) Numerische Plausibilitätsprüfung**: Live-Test zeigte einen
  echten Interpretationsfehler (−31,89% Abstand fälschlich als
  "extreme Nähe" wie −0,57% bezeichnet) — Daten-/Mappingproblem, kein
  Wortverbot.
- **(c) Keine automatische Extremwert-Wertung**: "Überdehnung" ohne
  Einschränkung verboten.
- **(d) Drei-Ebenen-Trennung** (Reviewer-Kernprinzip): Beobachtung →
  Modellinterpretation → Prognose/Handlung; Ebene 3 nur mit
  explizitem Backtesting-Beleg. Zusätzlich: Verbot, aus einem
  einzelnen Datenpunkt mehrere unverbundene Hypothesen als
  Kausalkette darzustellen.

Reviewer-Urteil nach dem letzten Momentum-Retest: ≈9/10, Architektur
eingefroren, drei kleine Restbefunde bewusst NICHT gefixt (Reviewer
explizit: keine weitere Einzel-Optimierung, stattdessen adversarialer
Test der bereits migrierten Strategien).

**Migrationsstand: 7 von 14 Strategien** (csp_wheel, atmna,
weekly_income, cc, collar, ko, momentum).

---

## 3. Adversarialer Guardrail-Test über alle 7 migrierten Strategien

Nach Reviewer-Empfehlung: derselbe adversariale Test (Checkliste:
Prognose-Synonyme, Kausal-Adjektive, Hypothesenketten, verdeckte
Handlungsempfehlungen, Scheingenauigkeit, Strategie-/Indikator-
Verwechslung, Gleichstand→Rangfolge, Trade-off→Empfehlung,
Risiko-Synonyme) auf die 6 Options-Strategien plus `ko` angewendet.
Ergebnis: **v2.27.0 → v2.33.0**, sieben weitere Versions-Runden mit
insgesamt ca. 15 Einzelfixes. Die wichtigsten:

### 3.1 Ticker-Scope-Sperre (neuer Regel-Punkt f)
`csp_wheel`-Test deckte auf: der Datenkontext enthält für ALLE
Strategien den vollen Pool von bis zu 10 Kandidaten mit vollständigen
Kennzahlen (`index.html`, `tickerList`/`poolData`) — die Auswahl der
Top-3 passiert erst im Modell selbst. Ohne harte Sperre zitierte das
Modell Ticker aus dem Pool, die nie in Abschnitt 3 genannt wurden
(BA/HII/LHX-Fund, später PPRUY-Fund). Fix brauchte zwei Anläufe:
Text-Anweisung allein reichte nicht, erst eine explizite
**Schluss-Selbstprüfung** am Prompt-Ende (Abgleich aller in
Abschnitt 4-9 genannten Ticker gegen die Abschnitt-3-Liste) hat den
Fund zuverlässig verhindert.

### 3.2 Regelkonflikt RSI/Rückschlagrisiko (wichtigster Einzelfund)
Die alte `PUBLIC_REGULATORY_GUARDRAIL`-Regel "Andienungswahrschein-
lichkeit" (02.09.2026) schrieb als *korrektes Beispiel* exakt die
Formulierung vor ("RSI 75 … erhöhtes Rückschlagrisiko"), die der
neue REASONING-GUARDRAILS-Block inzwischen verbietet — erklärt einen
dreifachen Wiederholungsfund über zwei Strategien. Beide betroffenen
Altstellen umformuliert auf reine Ebene-1-Beschreibung. Regel später
zusätzlich auf Call-Assignment (nicht nur Put) und beliebige
Indikatoren (nicht nur RSI) verallgemeinert, nachdem ein CC-Test
denselben Fehler mit anderem Indikator/anderer Richtung zeigte — mit
der Lehre, dass eine Regel mit nur einem Beispiel vom Modell nicht
automatisch generalisiert wird; zwei parallele Beispiele verankern
robuster.

### 3.3 Methodenwechsel: "Konzept statt Wortliste" (neues Arbeitsprinzip)
Nach drei aufeinanderfolgenden Umgehungsfunden desselben Musters mit
jeweils neuem Wort ("erhöhte Sensitivität" → "stabil"/"stabilisiert"
→ "Trendfestigkeit") wurde Regel (e) von einer wachsenden
Wortverbotsliste auf ein **führendes Prinzip** umgebaut ("keine
Zeitreihen-/Dauerhaftigkeits-Zuschreibung aus einem Snapshot-
Einzelwert"), Wortliste nur noch als ausdrücklich nicht
abschließendes Beispielset. Als generelles Arbeitsprinzip in
`/areas/uiq.md` festgehalten: bei wiederholten Synonym-Umgehungen
künftig auf Prinzip-Ebene fixen statt die Liste nur zu erweitern.

Auch dieser Fix brauchte Nacharbeit: ein "vorhersehbar"-Fund (CC-Test)
zeigte, dass die Schluss-Selbstprüfung (Schritt 2) faktisch wie eine
Wortlisten-Suche funktionierte, obwohl das Prinzip textuell da war.
Schritt 2 wurde explizit auf "KEINE WORTLISTEN-SUCHE, SONDERN
FUNKTIONS-PRÜFUNG" umformuliert — Anweisung, die Prüffrage auf JEDES
eigenschaftszuschreibende Wort anzuwenden, nicht nur auf gelistete
Beispiele.

### 3.4 Weitere Funde/Fixes
- **Grade-Kohorte-Lücke**: die Kohorte-Pro-Wert-Regel (aus dem
  Momentum-Sprint) generalisierte nicht automatisch von Zahlenwerten
  auf Buchstaben-Grades (Grade A/B/C) — explizit ergänzt.
- **Keine zweckfremde Metrik-Verwendung** (neuer Punkt g): ATR
  fälschlich als Beleg für Optionsmarkt-Liquidität verwendet (ATR
  misst Kursvolatilität des Basiswerts, nicht Bid-Ask-Spread/OI).
- **Keine unbelegte Risiko-Abwesenheitsbehauptung** (neuer Punkt h):
  "ein wesentliches Risiko … liegt jedoch nicht vor" innerhalb des
  Risiko-Abschnitts selbst — strukturell verwandt mit dem längst
  verbotenen "keine strukturellen Hemmnisse"-Muster.

### 3.5 Testergebnis pro Strategie (Kurzfazit)
- **csp_wheel**: 2 Testrunden, mehrere Fixes, am Ende sauber.
- **atmna**: 1 Testrunde, bestätigte dieselben Funde wie csp_wheel
  (RSI-Risiko-Sprache, Kausal-Adjektive, Grade-Kohorte).
- **weekly_income**: 3 Testrunden (Scope-Sperre-Regression,
  Stabil-Regression, dann sauber).
- **cc**: 2 Testrunden (Call-Assignment-Fund, danach sauber — bester
  Lauf des gesamten Tests).
- **collar**: 1 Testrunde — "stabil"-Familie erneut aufgetreten
  (2× im selben Dokument) + Textkorruption in der PFLICHT-wörtlich-
  Einleitung ("hypothetischenischen" statt "hypothetischen").
  **Bewusst nicht weiter gepatcht** — Einschätzung: statistische
  Restfehlerquote von Prompt-Anweisungen erreicht, weitere
  Prompt-Schichten hätten abnehmenden Grenznutzen (s. Backlog unten).
- **ko**: 1 Testrunde, KO-1/4/5 sauber, KO-3 weiterhin ungetestet
  (HVP erscheint in keinem der bisherigen KO-Live-Tests). Zwei neue,
  noch nicht gefixte Funde (s. Abschnitt 4).

**Aktueller Versionsstand `ko-prompts.js`: v2.33.0**, committed.

---

## 4. Zwei offene Funde aus dem `ko`-Test (noch nicht gefixt)

1. **Veraltete strategie-eigene Pflichtformulierungen**: `ko`s
   eigener `risikenText` (aus v2.22.4, vor Einführung der
   REASONING-GUARDRAILS) schreibt wortwörtlich "…erhöht das
   Rückschlagrisiko im Modell" vor — genau die Formulierung, die wir
   im gemeinsamen `PUBLIC_REGULATORY_GUARDRAIL` bereits als
   Regelkonflikt identifiziert und gefixt hatten (s. 3.2). Der Fix
   von heute prüfte nur den *gemeinsamen* Guardrail-Text, nicht die
   *strategie-eigenen* `risikenText`/`focus`/`principle`-Inhalte der
   7 migrierten Strategien. Hoher Verdacht, dass es weitere solcher
   veralteten Pflichtformulierungen gibt, die bisher nur zufällig
   nicht in einem Live-Test aufgetaucht sind.
2. **Score-Flatting-Regel greift nicht überall**: die im
   Momentum-Sprint eingeführte Regel ("NIEMALS 'alle übrigen Titel
   erfüllen die Kriterien ebenfalls'") sitzt im gemeinsamen Builder,
   hat aber im `ko`-Test nicht gegriffen ("Alle übrigen Titel im Pool
   erfüllen die gleichen Score-Niveaus…"). Zeigt: eine Regel im
   gemeinsamen Code wird nicht automatisch von jeder Strategie gleich
   zuverlässig befolgt.

---

## 5. Neues Backlog-Item: serverseitige Zweitkontrolle für Sprachmuster

Aus dem `collar`-Befund (s. 3.5) abgeleitet: An einem Punkt liefern
weitere Prompt-Verschärfungen abnehmenden Ertrag gegenüber dem
Aufwand (Prompt-Länge wächst bereits erheblich, v2.20 → v2.33 fast
verdoppelt). Vorschlag: ein serverseitiger Scanner (analog zu den
bereits bestehenden `COMPLIANCE_PATTERNS` in `ko-ai.js`), der nach
Live-Generierung gezielt nach bekannten Restrisiko-Mustern sucht
("stabil"-Familie u.ä.) und entweder loggt oder nachbearbeitet — als
zweite Verteidigungslinie statt eines weiteren Prompt-Patches. Noch
nicht spezifiziert, nur als Idee festgehalten.

---

## 6. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.33.0 | Committed, verifiziert |
| `ko-aggregator/market_aggregator.py` | — (`homeMarket`-Fix) | Committed, Aggregator-Lauf durchgeführt |
| `axel-scanner/index.html` | v488 | Committed |

**Migrationsstand 9-Punkte-Schema: 7 von 14 Strategien** (csp_wheel,
atmna, weekly_income, cc, collar, ko, momentum) — alle 7 heute
adversarial getestet, 6 davon nach Fixes sauber, `ko` mit zwei noch
offenen Funden (s. Abschnitt 4).

---

## 7. Plan für morgen

**Priorität 0 — die zwei offenen `ko`-Funde systematisch angehen.**
Nicht nur `ko` punktuell fixen, sondern alle 7 migrierten Strategien
auf veraltete, strategie-eigene Pflichtformulierungen (`risikenText`/
`focus`/`principle`) durchsuchen, die vor Einführung der
REASONING-GUARDRAILS geschrieben wurden und ähnliche Regelkonflikte
enthalten könnten wie der RSI/Rückschlagrisiko-Fund. Zusätzlich
prüfen, warum die Score-Flatting-Regel bei `ko` nicht griff — Einzel-
fall oder Muster?

**Priorität 1 — Backlog-Item Server-Scanner spezifizieren (oder
bewusst zurückstellen).** Entscheiden, ob die serverseitige
Zweitkontrolle für Sprachmuster jetzt konkretisiert wird oder ob die
aktuelle Prompt-Absicherung (Wortliste + Konzept-Prinzip + zweistufige
Schluss-Selbstprüfung) als "gut genug" gilt und das Thema ruht, bis
sich weitere Funde häufen.

**Priorität 2 — Equity-Migration fortsetzen.** 7 verbleibende
Strategien (breakout, vcp, swing, meanrev, dividend, value,
fading_short) auf `_publicNinePointPrompt()` umstellen. Nach den
heutigen Erkenntnissen: proaktiv auf konkrete Stop-Loss-/Kursziel-
Einladungen in `focus[]`-Kriterien prüfen (wie beim Momentum-Fund),
UND auf veraltete Pflichtformulierungs-Konflikte (wie bei P0 heute)
— beides vor dem ersten Live-Test.

**Priorität 3 — KO-3 (HVP≠Hebel) weiterhin unverifiziert.** Bereits
dreimal in Folge nicht getestet, da HVP in keinem KO-Live-Test als
Faktor auftauchte. Kein aktiver Fehler, aber auch kein Beleg. Bei
Gelegenheit gezielt einen Lauf mit HVP-relevanten Kandidaten
anstoßen.

**Nach vollständiger 14/14-Migration** (weiterhin im Hinterkopf):
Cross-Strategy-Review (alle 14 Outputs nebeneinanderlegen, HVP/RSI/
D200/Strategy-Fit auf konsistente Interpretation prüfen).

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
- `degraded_status`-Route in `ko-sync-worker.js`.
- Finnhub/TwelveData serverseitig (Cloudflare-Worker-Secrets) —
  v2.0/Commercial-Launch-Backlog.
- Kanonische Metriken-Pipeline (v2.0/Phase 3).
- Repo-Privatstellung (`ko-modules` erst nach Auslieferungs-Umbau).
- Serverseitige zweite Verteidigungslinie in `ko-ai.js`
  (`ki_briefing_public()` etc. nur minimal gehärtet) — weiterhin
  keine Zeitnot laut Axel, aber vor Beta-Traffic zu schließen.
- VIX/VVIX/SKEW Client/Server-Aufspaltung, CC-Wheel-Kontext-Flag,
  EIC-Schritt-7, ~38 verbleibende Ampel-Texte, `my-cors-proxy`
  versionieren, Legal-Briefing-Vorbereitung.

**Parallel-Projekt (`ahsub/regime-test`):** unverändert, heute nicht
bearbeitet.

---

## 8. Methodische Erkenntnis des Tages (zur Erinnerung für künftige Sprints)

Zwei wiederkehrende Muster, die sich heute mehrfach bestätigt haben:

1. **Eine Prompt-Anweisung mitten im Text wird zuverlässiger befolgt,
   wenn zusätzlich eine explizite Schluss-Selbstprüfung existiert**
   (bewährt bei Ticker-Scope UND bei der diffuseren
   Zeitreihen-/Dauerhaftigkeits-Prüfung — generalisiert also über
   klar enumerierbare und semantisch unscharfe Fälle hinweg).
2. **Bei wiederholten Synonym-Umgehungen desselben Musters künftig
   auf Prinzip-/Konzept-Ebene fixen statt die Wortliste nur zu
   erweitern** — eine wachsende Verbotsliste schließt solche Lücken
   nie vollständig, da beliebig viele Synonyme existieren können.
