## №XX — BACKLOG: Quellenbasierte Regelwerke (Pilot: Dividendenstrategie nach D. Eckert)

**Stand:** 23.11.2026 · **Status:** BACKLOG, nicht vor Go/No-Go (Dezember 2026) · **Typ:** Forschung/Backtest, keine Feature-Arbeit
**Zweck:** Aus Interviews/Podcasts erfolgreicher Praktiker backtestfähige Regeln ableiten, vorab festgelegt testen und nur nachweislich wirksame Elemente in UIQ übernehmen.
**Quellen (Pilot):** 3 Transkripte (MacWhisper) mit Daniel Eckert, Finanzjournalist: Interview „Finanzexperten im Interview“ (Nov. 2026), EchtgeldTV Spezialfolge Teil 2 (ca. Mai 2025), „Alles auf Aktien“ vom 01.06.2026.
**Ablageregel:** Dieser Abschnitt ist bewusst ticker-frei. Beispieltitel aus den Quellen stehen nur in den internen Transkript-Auswertungen.

---

### A. Methodik (gilt für alle Hypothesen dieses Abschnitts und für künftige Quellen)

1. **Pipeline:** Quelle → Regel-Extraktion (wörtlich belegt, mit Zeitstempel/Zeile) → Operationalisierung (messbare Schwellen) → Vorab-Festlegung der Parameter → Backtest → Übernahme nur bei bestandenem Abbruchkriterium.
2. **Auswahlverzerrung:** Interviewt werden Erfolgreiche. Die Erfolgsbilanz der Quelle selbst ist nicht geprüft. Eine Regel gilt als Hypothese, nicht als Beleg. Die Quelle selbst nennt Fehlschläge (Screening-Trefferquote „3 von 10“).
3. **Keine Parameter-Optimierung:** Schwellen werden vor dem Lauf festgelegt (aus der Quelle oder konservativ gesetzt). Höchstens 2 vorab benannte Varianten je Parameter. Bei mehreren Varianten wird die Signifikanzschwelle für Mehrfachtests korrigiert.
4. **Stichprobentrennung:** In-Sample 2006–2018, Out-of-Sample 2019–2026 (Vorschlag, vor dem Lauf fixieren). Übernahme nur bei Bestätigung Out-of-Sample.
5. **Survivorship-Bias (kritisch):** Das aktuelle UIQ-Universum enthält nur heute noch existierende Titel. Gerade Dividenden- und Qualitätsfilter profitieren davon künstlich, weil die gescheiterten Dividendenzahler fehlen. → Vor jedem Lauf klären, ob ein historisches Universum inklusive delisteter Titel verfügbar ist. Wenn nicht: Ergebnis ausdrücklich als nach oben verzerrt kennzeichnen, keine Übernahme allein darauf stützen.
6. **Point-in-Time:** Gezahlte Dividenden sind historische Fakten (geringes PIT-Risiko). Fundamentaldaten (Ausschüttungsquote, Verschuldung, KGV, Schätzungen) nur mit dem damals bekannten Datenstand (vgl. №70).
7. **Kosten:** pauschale Transaktionskosten je Umschichtung. Steuern werden nicht modelliert (Hinweis im Ergebnis).
8. **Benchmarks:** siehe Abschnitt D (doppelter Vergleich).

---

### B. Hypothesen Dividenden-STYLE

**H-DIV-1 — Einstiegsfilter „Dividendenqualität“**
- *Quelle:* Dividende als Qualitätsanker (Zahlung durch Krisen hindurch). Dividendenwachstum über viele Jahre von ca. 5 % p. a., in den letzten 3 Jahren nicht gesenkt, bevorzugt beschleunigt. Moderate Ausschüttungsquote, keine übermäßige Verschuldung, moderates KGV, mindestens 10 Jahre Datenhistorie, ausreichende Handelbarkeit.
- *Operationalisierung:*
  - Dividendenwachstum p. a. über 5 Jahre ≥ 5 %
  - keine Dividendenkürzung in den letzten 36 Monaten
  - Variante B: Dividendenwachstum p. a. über 3 Jahre ≥ Dividendenwachstum p. a. über 5 Jahre
  - Dividendenhistorie ≥ 10 Jahre
  - Ausschüttungsquote ≤ 70 % (Annahme, in der Quelle ohne Zahl)
  - Nettoverschuldung/EBITDA ≤ 3 (Annahme, in der Quelle ohne Zahl)
  - Liquiditätsuntergrenze (bestehender UIQ-Liquiditätsfilter)
- *Test:* Gleichgewichtetes Portfolio aller Titel, die den Filter bestehen, jährlich neu zusammengesetzt, gegen das gleichgewichtete Gesamtuniversum und gegen die Benchmarks aus Abschnitt D.
- *Messgrößen:* jährliche Rendite (CAGR), maximaler Verlust vom Hoch (Max. Drawdown), Sharpe Ratio, Anteil späterer Dividendenkürzer, Ergebnis je Marktregime (regime_v2).
- *Abbruch:* kein signifikanter Vorsprung gegenüber dem gleichgewichteten Universum nach Kosten (Out-of-Sample) → verwerfen.
- *Vorab zu prüfen:* Welche dieser Felder nutzt `sDividend` bereits? (Code-Check, nicht annehmen.)

**H-DIV-2 — Ausstieg „Eckert-Regel“ (relativer Verlust bei jungen Positionen)**
- *Quelle:* Fällt ein junges Investment in steigendem Markt um 20–25 %, gilt das als Alarm: Investment Case prüfen, häufig Verkauf bei −25 %. Kein Nachkaufen. Keine Anwendung auf alte, vervielfachte Positionen. Ein Kursrückgang im mitfallenden Gesamtmarkt löst die Regel nicht aus (Präzisierung aus Quelle 2).
- *Operationalisierung:*
  - Position jung = Haltedauer ≤ 24 Monate (Variante: ≤ 12)
  - Verlust gegenüber dem Heimatmarkt-Index seit Einstieg ≥ 20 % (Variante: ≥ 25 %)
  - Trigger = Ausstieg zum nächsten Schlusskurs. Die menschliche Prüfung ist nicht simulierbar; der Backtest bildet die Obergrenze „immer verkaufen“ ab.
- *Test:* auf den Einstiegen aus H-DIV-1. Vergleich von vier Varianten:
  - (a) Halten
  - (b) Eckert-Regel
  - (c) Trailing Stop −33 % (von der Quelle abgelehnte Alternative)
  - (d) absoluter Stop −25 %
- *Messgrößen:* Rendite, maximaler Verlust vom Hoch, Anteil der Positionen mit Endstand ≤ −60 % (vermiedene „Totalverluste im Depot“), Anteil der Ausstiege, nach denen sich der Kurs später erholte (Fehlausstiege), Umschlagshäufigkeit.
- *Abbruch:* Variante (b) nicht besser als (a) bei Rendite UND nicht besser bei Drawdown/Totalverlust-Anteil → verwerfen.
- *Datenbedarf:* Heimatmarkt-Zuordnung (`homeMarket` vorhanden) plus Indexreihe je Heimatmarkt. Zu prüfen: Rechnet RS-Rank gegen den Heimatindex oder gegen ein anderes Referenzuniversum?

**H-DIV-3 — Ausschluss „einzelner Absturz“ (Turnaround-Filter)**
- *Quelle:* Keine Wetten auf Turnarounds bei einzelnen Unternehmen. Hohe Dividendenrendite nach Absturz gilt als Warnsignal. Kaufen bei Abschlägen auf einen ganzen Markt oder ein Land ist dagegen zulässig.
- *Operationalisierung:* Titel ≥ 40 % unter dem 52-Wochen-Hoch (Variante: ≥ 50 %) UND Heimatindex ≤ 10 % unter seinem 52-Wochen-Hoch → als Einzelabsturz ausschließen. Fallen Titel und Index gemeinsam, gilt das als Marktabschlag und bleibt zulässig.
- *Test:* H-DIV-1 mit und ohne diesen Filter.
- *Abbruch:* kein Unterschied bei Dividendenkürzungsquote und Drawdown → verwerfen.
- *Hinweis:* Dieselbe Kennzahl (Verlust gegenüber dem Heimatindex) wie in H-DIV-2 → einmal bauen, zweimal nutzen.

**H-DIV-4 — Kontextfeld „Dividendenrendite minus Anleihenrendite“**
- *Quelle:* Die Attraktivität einer Dividendenrendite hängt von der sicheren Alternative ab (Beispiel aus der Quelle: 3 % Dividende gegen 5 % für Staatsanleihen mit 5–7 Jahren Laufzeit).
- *Operationalisierung:* Differenz aus der Dividendenrendite des H-DIV-1-Portfolios (bzw. eines Dividenden-Stilindex) und der Rendite 5- bzw. 10-jähriger Staatsanleihen.
- *Test:* Sagt die Differenz die relative 12-Monats-Rendite des Dividenden-Stils gegenüber dem breiten Index voraus? (Rangkorrelation, Out-of-Sample)
- *Abbruch:* keine stabile Vorhersagekraft → nur als beschreibendes Kontextfeld ohne Gewicht führen.
- *Aufwand:* gering, reine Arithmetik aus vorhandenen Makrodaten. **Empfohlener Einstieg.**

---

### C. Notizen ohne aktuellen Testauftrag

- **N-1 Bewertung gegen die eigene Historie:** KGV im Verhältnis zur eigenen 10-Jahres-Spanne als Kaufanker (Quelle 2, Moderator). → Input für die spätere Kalibrierung der Fair-Value-Engine (Strang bleibt eingefroren).
- **N-2 Revisionen der Gewinnschätzungen:** In Quelle 2 als Warnsignal gedeutet, in Quelle 3 als positiv. Die Literatur stützt überwiegend „positiv“ (earnings revision momentum). → Testbar erst mit PIT-Schätzdaten (blockiert durch №70).
- **N-3 Saisonale Sommerschwäche** bei Rückversicherern (Hurrikansaison, Preisrunden), anekdotisch. → Allenfalls als Branchenhypothese, niedrige Priorität.
- **N-4 Eigentümerstruktur** (familiengeführt vs. staatlich) als Qualitätsmerkmal → keine Daten in UIQ, nicht verfolgen.

---

### D. Benchmark-Wahl für Go-Kriterium 2 (Vorsprung gegenüber Buy & Hold)

- Stilstrategien immer **doppelt** vergleichen: (1) breiter Index nach Börsenwert gewichtet (Weltindex), (2) stilgleicher Vergleichsindex (für Dividend z. B. ein Dividenden-Stilindex oder das gleichgewichtete UIQ-Universum).
- **Begründung (Quelle 3):** Der Weltindex nach Börsenwert ist zu rund drei Vierteln US-Aktien, die zehn größten Werte machen rund 28 % aus, die Dividendenrendite liegt bei rund 1,5 %. Ein Dividendenstil liegt strukturell anders und gewinnt oder verliert gegen ihn je nach Marktphase systematisch. Ein einziger Vergleich mit dem Weltindex misst dann den Stilunterschied, nicht die Qualität der Strategie.
- Ergebnisse zusätzlich **nach Regime aufteilen** (regime_v2).
- **Bewertungsglättung beachten:** Renditereihen mit seltener Kursfeststellung (z. B. Private Equity) unterschätzen die Schwankung und blähen die Sharpe Ratio auf (vgl. №70, DCE-Prüfung). Gilt auch für Benchmarks.

---

### E. Ergänzung Event & Surprise Gate (Sprint 1, Shadow Mode, ohne Wirkung auf den Digest)

- Neue regelbasierte Ereignistypen, Termine vorab bekannt:
  - Indexumstellungen: MSCI-Reviews (große Reviews Mai und November, kleine Februar und August, jeweils zum letzten Handelstag), Überprüfungen der DAX-Indexfamilie inklusive Fast Entry/Fast Exit
  - US-ISM-Index
  - US-Arbeitsmarktbericht (falls nicht schon neben FOMC und CPI erfasst)
- Prinzip für Sprint 2 (Surprise-Logik), aus Quelle 3: Die Kursreaktion hängt an der Abweichung von der Erwartung, nicht am Ereignis selbst. Vorweggenommene Ereignisse können bei Eintritt negativ wirken („sell the news“).

---

### F. Reihenfolge (nach Go/No-Go)

1. H-DIV-4 (geringer Aufwand, vorhandene Daten)
2. Universum klären (Survivorship-Bias, A.5) und `sDividend`-Felder prüfen (Code-Check)
3. H-DIV-1
4. Kennzahl „Verlust gegenüber dem Heimatindex“ bauen → H-DIV-2 und H-DIV-3
5. Abschnitt E bei Start von Sprint 1 einplanen

**Übernahmeregel:** Ein Strategieelement wandert nur dann in UIQ-Scores oder -Prompts, wenn es sein Abbruchkriterium Out-of-Sample besteht. Public-Texte formulieren es nur als Prüfhinweis, nie als Handlungsanweisung.
