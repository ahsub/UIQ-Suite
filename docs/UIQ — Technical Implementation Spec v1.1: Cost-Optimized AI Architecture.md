# UIQ — Technical Implementation Spec v1.2: Regime-Differenzierung & Quality-Layer

**Datum:** 14.09.2026
**Autoren:** Axel + Claude, unter Einbeziehung einer Reviewer-Analyse der
Makrolage (September 2026)
**Bezug:** ergänzt v1.0 (Grundarchitektur) und v1.1 (Kostenoptimierung) um
vier architektonische Verbesserungen der Decision Engine. Betrifft NICHT
die AI-/Kostenseite (s. v1.1), sondern die deterministische Entscheidungs-
und Scoring-Logik selbst.

**Wichtiger Rahmen, bewusst eingehalten:** Diese Spec übernimmt aus der
zugrundeliegenden Reviewer-Analyse ausschließlich die vier strukturellen
Vorschläge (Regime-Granularität, CSP-Qualitätsscore, thematisches
Clustering, Position-Re-Evaluation). Sie übernimmt NICHT die darin
enthaltenen Markteinschätzungen, Einzeltitel-Calls oder tagesaktuellen
Wirtschaftsdaten (Fed-Wahrscheinlichkeiten, Ölpreis, Einzelfirmenzahlen) —
diese sind weder verifizierbar noch für eine Regime-Engine geeignet, die
über den aktuellen Tag hinaus Bestand haben soll. Alle vier Punkte werden
ausschließlich auf bereits in UIQ vorhandene, messbare Datenfelder gestützt.

**Status:** Entwurf für eine zukünftige Coding-Session. Noch nicht
umgesetzt. Keine der vier Änderungen ist von den anderen abhängig — jede
kann einzeln umgesetzt und getestet werden.

---

## 0. Verifizierter Ausgangszustand (13./14.09.2026 gegen `market_aggregator.py` geprüft)

Vor der Formulierung dieser Spec wurde der tatsächliche Code-Stand
geprüft, um keine bereits vorhandene Logik als "neu" misszuverstehen:

- **`BULL_FRAGILE` existiert bereits** als Regime-Label in
  `classify_regime_v2()` (Zeile 8263 ff.), Definition aktuell rein
  VIX-basiert: `"BULL_FRAGILE" if vix > 25 else "BULL_QUIET"`.
- Es wird bereits für **eine** Differenzierung genutzt:
  `score_options_collar()` (Zeile 2607 ff.) gewichtet Collar-Absicherungen
  bei `BULL_FRAGILE` deutlich höher (Prioritäts-1-Lücke laut dortigem
  Kommentar, "Regime-Coverage-Analyse").
- Die zentrale Master-Shortlist-Logik (`build_leaderboards()`, Zeile
  5490 ff., Momentum/Minervini/Swing-Präferenz) unterscheidet
  `BULL_QUIET` und `BULL_FRAGILE` **nicht** — beide erfüllen denselben
  Substring-Match `is_bull = any(x in regime_upper for x in ["BULL", ...])`.
- **Kein bestehendes CSP-Assignment-Quality-Feld** — nur der bestehende,
  prämienorientierte `sCsp`-Score.
- **`sector`/`industry`-Felder existieren bereits** (aus yfinance, Zeile
  5163 ff.), aber kein thematisches Cluster-Tagging (z.B. "AI
  Infrastructure") darüber.
- **Kein bestehender Re-Evaluations-Mechanismus** für bereits offene/
  getrackte Positionen gegen die aktuelle Decision Engine gefunden.

Diese vier Lücken sind der eigentliche Umsetzungsgegenstand dieser Spec —
nicht die Einführung neuer Konzepte, sondern das Schließen bereits
identifizierter Lücken zwischen vorhandenem Label/Datenfeld und dessen
tatsächlicher Wirkung im System.

---

## 1. Regime-Differenzierung in der Master-Shortlist-Logik erweitern

### 1.1 Kalibrierung, nicht neue Logik (präzisiert 14.09.2026, Reviewer)

`build_leaderboards()` soll `BULL_QUIET` und `BULL_FRAGILE` innerhalb des
`is_bull`-Zweigs unterschiedlich gewichten, statt sie zu vereinheitlichen
— analog zum bereits etablierten Muster in `score_options_collar()`.

**Ausdrücklich kein pauschaler High-Beta-Ausschluss oder fester
Strafpunkte-Abzug bei `BULL_FRAGILE`.** Ein hoher Beta-Wert kann bei
außergewöhnlich starkem Earnings-Momentum/relativer Stärke weiterhin
gerechtfertigt sein — eine harte Ausschlussregel würde genau solche Fälle
fälschlich aussortieren. Stattdessen als multiplikativer Regime-Fit-Faktor
umsetzen:

```
MasterScore = BaseScore × RegimeFit
```

statt einer festen Bedingung wie "`BULL_FRAGILE` → High Beta raus".
`RegimeFit` ist dabei selbst ein empirisch zu kalibrierender Faktor (nicht
willkürlich gesetzt) — welche Eigenschaften in `BULL_FRAGILE` tatsächlich
schlechter performen, ist eine Backtest-Frage, keine Annahme. Kalibrierung
anhand von Backtests (`ahsub/regime-test`, bereits vorhandene
Infrastruktur), nicht anhand einer einzelnen Markteinschätzung.

### 1.2 Optionale Erweiterung der Regimedefinition selbst (separat, größerer Schritt)

Die aktuelle `BULL_FRAGILE`-Definition ist ein reiner VIX-Schwellenwert.
Eine Anreicherung um weitere, bereits in UIQ vorhandene Faktoren (Credit
Spreads/HY-Spread, Inflationstrend, Renditerichtung, Marktbreite — alle
bereits Teil der bestehenden Market-Context-Engine laut
`/areas/uiq.md`/RUNBOOK) wäre eine Verbesserung der Klassifikations-
qualität selbst. **Dies ist explizit als eigener, größerer Schritt zu
behandeln**, da er die Backtest-Infrastruktur in `ahsub/regime-test`
berührt (dort läuft bereits ein Vergleich `classify_regime_v2()` vs.
Ensemble-Modelle) — nicht leichtfertig parallel zur Produktions-Logik
ändern, sondern im Rahmen des laufenden Regime-Detection-Research-Projekts
evaluieren.

**Wichtig:** Punkt 1.2 NICHT mit einer spezifischen, tagesaktuellen
Markteinschätzung kalibrieren (z.B. "Fed restriktiv, Öl >$100 im
September 2026 → so gewichten"). Jeder neue Faktor muss anhand
historischer Daten über mehrere Regime-Zyklen hinweg validiert werden,
exakt nach der bereits etablierten Methodik dieses Forschungsprojekts
(Walk-Forward, DSR statt Sharpe, Persistenz-Baseline).

---

## 2. Underlying Assignment Quality (UAQ) — implementiert; Contract Assignment Quality (CAQ) zurückgestellt

**Status (14.09.2026):** §2.1/UAQ ist umgesetzt (`market_aggregator.py`,
`score_underlying_assignment_quality()`, Feld `sUaq`). §2.2/CAQ ist
bewusst **nicht** implementiert — s. Begründung unten.

**Ziel:** Ergänzung zum bestehenden `sCsp` (prämienorientiert) um die
Frage — wie gut wäre eine tatsächliche Zuteilung (Assignment) des
Basiswerts, unabhängig von der Prämienhöhe.

**Präzisierung 14.09.2026 (Reviewer):** Ein einzelner "Assignment
Quality"-Score vermischt zwei unterschiedliche Fragen — ist der
Basiswert selbst gut, UND ist gerade dieser konkrete Kontrakt (Strike/
Laufzeit) dafür geeignet. Ein exzellenter Titel mit einem 15 % unter dem
aktuellen Kurs liegenden Strike ist eine fundamental andere
Assignment-Situation als derselbe Titel mit 5 % Abstand. Deshalb Split
in zwei Teilscores statt einem — konsequent benannt als **Underlying
Assignment Quality (UAQ)** statt nur "Assignment Quality", damit die
spätere Dreiteilung von Anfang an klar ist:

| Ebene | Status | Aussage |
|---|---|---|
| CSP Premium Score (`sCsp`) | vorhanden | Wie attraktiv ist die Prämie? |
| **Underlying Assignment Quality (UAQ)** (`sUaq`) | **implementiert (14.09.2026)** | Wie gut wäre die Aktie, wenn ich sie tatsächlich übernehmen müsste? |
| Contract Assignment Quality (CAQ) | **zurückgestellt** | Wie gut ist dieser konkrete Put-Kontrakt (Strike/DTE/Earnings/IV)? |

### 2.1 Underlying Assignment Quality (UAQ) — implementiert

Reine Unternehmens-/Regime-Ebene, unabhängig vom konkreten Kontrakt.
Ausschließlich aus bereits in UIQ vorhandenen/berechenbaren Feldern:

- Fundamentale Qualität (`fcfYield`, `roe`, `ownerEarningsYield`)
- Bewertung (`peForward`, `pb`)
- Verschuldung (`debtToEquity`)
- Stabilität (`hvp` — bewusst **gegenteilig** zum Premium-Score gewichtet:
  niedrige historische Vola = gut für UAQ, hohe Vola = gut für die Prämie)
- Regime-Fit (dieselbe `REGIME_FIT`-Infrastruktur wie §1.1, neuer Key
  `csp_underlying`, aktuell neutral bis kalibriert)

**Kein IV/IV Rank in dieser Ebene** — IV ist ein Merkmal der
Options-Attraktivität, nicht der Unternehmensqualität. Hohe IV kann
gerade wegen erhöhten Risikos vorhanden sein; würde sie hier einfließen,
könnte ein Score fälschlich "hohe IV → hohe Assignment Quality"
suggerieren. IV/IV Rank bleibt entsprechend dem bestehenden
Premium-Score (`sCsp`) vorbehalten.

**Wichtige Design-Eigenschaft (Reviewer, 14.09.2026):** UAQ ist bewusst
**kontraktunabhängig** — keine "halbe" Contract Quality, sondern ein
eigenständiger DSS-Baustein. Eine hervorragende Firma bleibt eine
hervorragende Firma, auch bei einem ungünstig gewählten Strike. Wenn CAQ
später ergänzt wird, bleibt UAQ unverändert bestehen — es wird nicht neu
gebaut, sondern nur um eine zweite, separate Ebene erweitert:

```
Underlying → Underlying Assignment Quality (UAQ) → konkreter Put-Kontrakt
→ Contract Assignment Quality (CAQ) → CSP-Gesamtbeurteilung
```

### 2.2 Contract Assignment Quality (CAQ) — bewusst zurückgestellt

**Verifikations-Fund (14.09.2026):** UIQ hat aktuell **keine echten
Optionsketten-Daten** (Strike, DTE, Bid/Ask, echte IV) — bereits im Code
dokumentiert (Kommentar bei `calc_multileg_season()`: "Stufe 2, wartet
auf die CapTrader-Architekturentscheidung"). `ivRank` ist aktuell `None`
(kein IV-Archiv), `hvp` ist explizit als Näherung für echte implizite
Vola dokumentiert, keine echte IV. Es gibt auch keine echte Strike-
Distanz — `strikeSuggestion`/`dte`/`deltaTarget` sind KI-*vorgeschlagene*
Werte (Teil von `KI_SENSITIVE_OPTIONS_LEGACY`, bewusst aus dem
Public-Output gefiltert), keine Marktdaten.

**Entscheidung (Axel + Reviewer + Claude, 14.09.2026):** CAQ wird
**nicht** mit Ersatzdaten (KI-Vorschläge, `hvp`-Näherung) gebaut — das
wäre Scheingenauigkeit, keine Berechnung. CAQ bleibt bewusst offen, bis
echte Optionsketten-Daten vorliegen (Stufe 2/CapTrader, ohnehin bereits
als Abhängigkeit dokumentiert). Explizit ausgeschlossen für eine
zukünftige CAQ-Umsetzung:

- kein künstlicher Strike, kein künstliches DTE
- keine Verwendung von `strikeSuggestion`/KI-vorgeschlagenen Feldern
- keine Ableitung aus `hvp` als IV-Ersatz
- kein Rückgriff auf `KI_SENSITIVE_OPTIONS_LEGACY`-Felder

### 2.3 Ausgabeform

```
CSP Premium-Score:              87/100   (IV/IV-Rank-getrieben, unverändert)
Underlying Assignment Quality:  91/100   (Unternehmen/Regime/Valuation — implementiert)
Contract Assignment Quality:    —        (wartet auf CapTrader-Optionsketten-Daten)
```

Ein hoher Premium-Score bei niedriger UAQ ist ein legitimer, aber
bewusst anderer Anwendungsfall (reine Prämienjagd) als ein hoher Wert in
beiden Dimensionen — UIQ soll das zeigen, nicht vermischen.

---

## 3. Thematisches Sektor-/Branchen-Clustering

**Ziel:** Kandidaten anhand des bereits vorhandenen `sector`/`industry`-
Felds in grobe thematische Cluster einordnen (z.B. "AI-Infrastruktur:
Semiconductor, Networking, Power, Cooling, Datacenter, Electrical
Equipment, Industrial Automation" als eine mögliche Cluster-Definition
unter mehreren) — **als Anzeige-/Filter-Dimension, nicht als neuer Score
und nicht als neue Datenquelle.**

Ausdrücklich **kein** neuer "Theme Indicator" mit eigener Gewichtung oder
eigenem API-Call — reine Kategorisierung auf Basis dessen, was bereits
vorhanden ist. Cluster-Zuordnung als statische, versionierte
Zuordnungstabelle (sector/industry → Cluster-Label) im Code, keine
KI-gestützte Klassifikation nötig oder sinnvoll.

**Versionierung (präzisiert 14.09.2026, Reviewer):** Jede
Cluster-Zuordnung erhält ein Versionsfeld, z.B.:

```
theme_cluster = "AI_INFRASTRUCTURE"
theme_cluster_version = "1.0"
```

Damit bleibt nachvollziehbar, unter welcher Definition ein Titel an einem
bestimmten Datum klassifiziert wurde, und Cluster-Definitionen können
später verändert werden, ohne historische Daten rückwirkend semantisch
zu verfälschen — dieselbe Grundregel wie bei versionierten Prompts/
Workflows im übrigen Projekt.

---

## 4. Position-Re-Evaluation-Loop

**Ziel:** Bereits getrackte/offene Positionen (z.B. `backlog_tracking`-KV-
Key, bestehende Watchlist-Mechanismen) sollen periodisch durch dieselbe
Decision-Engine-Logik laufen wie ein Neukandidat — nicht nur beim
Erst-Scan bewertet werden. Langfristig der wertvollste Punkt dieser Spec
(Reviewer, 14.09.2026): der Übergang vom reinen Scanner zu einem Decision
Support System, das auch die Qualität seiner eigenen früheren
Entscheidungen überwacht.

### 4.1 Datenmodell-Grundlage: `decision_snapshot`

**Ergänzung 14.09.2026 (Reviewer):** kein zusätzlicher, fünfter
Implementierungspunkt, sondern eine Datenmodell-Voraussetzung für §4.1/4.2
unten. Bei Einstieg und bei jeder Re-Evaluation wird der relevante
Entscheidungszustand versioniert festgehalten:

```
POSITION
   │
   ├── entry_snapshot
   │     ├── regime
   │     ├── scores          (inkl. Underlying/Contract Assignment Quality bei CSPs, s. §2)
   │     ├── valuation
   │     ├── strategy
   │     └── timestamp
   │
   └── current_snapshot
         ├── regime
         ├── scores
         ├── valuation
         ├── strategy
         └── timestamp
```

Diese Struktur ist die Voraussetzung für die Delta-Bildung in §4.2 und
liefert später auch dem Prediction Ledger bzw. einer künftigen
Lernkomponente die nötige Grundlage ("was hat sich tatsächlich
verändert" statt nur "hat sich etwas verändert").

**Wichtige Umsetzungs-Randbedingung (Reviewer, 14.09.2026 — bewusst hier
mit aufgenommen statt nur mündlich vermerkt):** `entry_snapshot` muss den
zum Einstiegszeitpunkt tatsächlich verwendeten Entscheidungszustand
konservieren, nicht später aus aktuellen Daten/Regeln rekonstruiert
werden. Andernfalls würde eine historische Entscheidung rückwirkend mit
heute gültigen Berechnungsregeln "umgeschrieben" — für einen späteren
Prediction Ledger fatal, da er dann nicht mehr die tatsächliche
Entscheidungsgrundlage von damals auswerten würde, sondern eine
nachträglich geglättete Version davon. `entry_snapshot` daher als
einmalig geschriebenes, danach unveränderliches Feld implementieren
(write-once, nie durch spätere Recompute-Läufe überschrieben).

### 4.2 Prinzip

```
Bestehende Position (aus backlog_tracking o.ä.)
       │
       ▼
dieselbe Scoring-Pipeline wie ein Neukandidat
(Fundamental Quality, Regime-Fit [§1], Assignment Quality [§2] bei CSPs)
       │
       ▼
current_snapshot (§4.1) gegen entry_snapshot vergleichen —
nicht nur Gesamtscore, sondern komponentenweise:
   score_delta
   regime_delta
   fundamental_delta
   technical_delta
   valuation_delta
       │
       ▼
Kennzeichnung bei signifikanter Verschlechterung, mit Hauptursachen
statt einem einzelnen roten Flag, z.B.:

   Position Quality ↓ 14 Punkte
   Hauptursachen: Regime Fit −8 · Technical Quality −5 · Fundamental Quality −1

(kein automatisches Handeln — reine Kennzeichnung/Information für Axel)
```

**Präzisierung 14.09.2026 (Reviewer):** die komponentenweise Differenz
statt eines einzelnen Score-Deltas ist der eigentliche Mehrwert — sie
sagt nicht nur "diese Position hat sich verschlechtert", sondern WARUM,
und ist damit deutlich handlungsleitender als ein einzelnes rotes Flag.

### 4.3 Bewusste Einschränkung

Dies ist **ausschließlich eine Kennzeichnungs-/Informationsfunktion**,
keine automatisierte Handelsentscheidung — UIQ zeigt an, dass sich die
Bewertungsgrundlage einer bestehenden Position seit Ersteinstieg
verändert hat; die Entscheidung (halten/anpassen/schließen) bleibt bei
Axel. Passt zum bestehenden Grundsatz: UIQ als Decision Support System,
nicht als automatisierter Trader.

---

## 5. Umsetzungsreihenfolge (Vorschlag)

Alle vier Punkte sind unabhängig voneinander — Reihenfolge nach Aufwand/
Risiko, nicht nach Abhängigkeit:

1. **§1.1** ✅ implementiert & committed (14.09.2026) — kleinster Eingriff,
   nutzt ausschließlich bereits vorhandene Daten und ein bereits
   etabliertes Muster (`score_options_collar()`).
2. **§3** ✅ implementiert & committed (14.09.2026) — reine
   Kategorisierungstabelle, kein neuer Datenpfad.
3. **§2 (UAQ)** ✅ implementiert & committed (14.09.2026) — CAQ bewusst
   zurückgestellt, s. §2.2.
4. **§4** — größter Umfang (neue periodische Pipeline-Stufe), separat
   testen.
5. **§1.2** — bewusst zuletzt und als eigenständiges Forschungsthema
   behandelt, nicht als Teil des übrigen Patches — gehört inhaltlich zum
   laufenden Regime-Detection-Research-Projekt (`ahsub/regime-test`) und
   sollte dessen bereits etablierte Validierungsmethodik durchlaufen,
   nicht ad hoc in die Produktionslogik einfließen.

Jeder Punkt einzeln mit Live-Test, wie bei allen bisherigen Umbauten
dieses Projekts.
