# UIQ — Übergabeprotokoll 17.09.2026

## Pflicht-Header

- **Verifikations-Disziplin weiterhin zentral:** Heute mehrfach direkt erlebt — die erste
  Analyse zu "ko_long/options_csp haben keine Track-Record-Daten" war zu pauschal (richtig:
  keine *Trade-Simulation*, aber vollständige Forward-Performance-Daten). Reviewer hat das
  korrigiert, echte Zahlen haben es bestätigt. Lektion: bei jeder "X existiert nicht"-Aussage
  genau prüfen, OB und WAS genau fehlt, nicht nur pauschal verneinen.
- **Zwei Token-Rotationen aus dem 16.09.-Protokoll weiterhin offen** (Cloudflare-Worker-Bearer-
  Token, `STATIC_TOKEN`) — heute nicht adressiert, nicht vergessen.
- **Offene GHA-Laufzeit-Frage vom 16.09.** (>27min statt der erwarteten ~2-3min für 15 statt 10
  Strategien) — nie wirklich geklärt, nur relativiert. Kein akutes Problem, aber ungeklärt.

---

## Heute abgeschlossen

### 1. FOMC/Event-Risk — Track-Record-Realitätscheck vertieft und korrigiert
Export-Skript (`export_tr_data.py`) lokal ausgeführt (nach `base64.py`-Namenskollision im
Downloads-Ordner behoben), echte Track-Record-Daten (51 Tage, 02.07.-17.09.) ausgewertet.
**Wichtige Korrektur gegenüber gestern:** `ko_long`/`options_csp`/`options_cc` haben vollständige
Forward-Performance-Daten (`r7`/`mfe7`/`mae7`, 340/340) — nur echte Trade-Simulation
(`trade.st`) fehlt, und die nur weil dafür KI-Trigger/SL/Target-Parameter nötig sind, die nur
Master-Shortlist-Strategien bekommen. `atmna`/`weekly_income`/`collar` fehlen im Track Record
komplett (weder Forward-Performance noch Trade-Simulation) — neuer, unabhängiger Backlog-Punkt
("Track-Record Coverage: ATMNA/Weekly/Collar"), dokumentiert in der Fair-Value-Spec.

Ergebnis mit echten Daten:
- `long_minervini` nahe Juli-FOMC (n=34, 21 eindeutige Ticker): 50% Zieltrefferquote vs. 33% sonst
  — **besser**, nicht schlechter.
- `ko_long` nahe Juli-FOMC (n=50, 19 eindeutige Ticker): `r7` Ø -1,39% vs. -0,07% sonst —
  **schlechter**, intuitiv erwartete Richtung.
- Zwei Strategien, entgegengesetzte Richtung, **eine** einzelne Ereignis-Stichprobe — explizit als
  "noch keine Evidenzbasis für eine Regel" eingestuft, keine Regel abgeleitet.

**Dokument:** `docs/EVENT-RISK-FRAMEWORK-VORSTUFE-2026-09-17.md`, UIQ-Suite, committet
(`7f570ce1...`), verifiziert. Enthält KO-Trade-Simulations-Spezifikation (zweischichtig:
Underlying-Simulation getrennt von KO-Translation) und FOMC-Event-Study-Datenstruktur
(T-5...T+5, `n_unique_tickers` als Pflichtfeld, `event_publish_time_utc` für präzises T0) — beides
nur spezifiziert, nicht implementiert.

### 2. Fair-Value — Research v0 tatsächlich gegen echte Daten gefahren
27 archivierte historische Snapshots (22.07.-31.08., öffentlich im `ko-aggregator`-Repo) mit
Track-Record-Export verknüpft — 312 Datensätze, 89 eindeutige Ticker.

**Befunde:** FCF-Yield (ρ=+0,20, p=0,002) und Forward-Earnings-Yield (ρ=+0,17, p=0,04) zeigen
schwaches, unter Ticker-Dedupe robustes Signal (Richtung bleibt, Signifikanz sinkt wegen kleinerer
Stichprobe — kein Artefakt weniger sich wiederholender Ticker). ROE/Analyst-Upside/Book-Yield: kein
Signal. **`ownerEarningsYield` komplett untestbar** (0/312 — Feld erst seit 09.09., alle 27
Snapshots liegen davor). Nur `r7` vollständig auswertbar, `r30`/`r90` noch zu jung.

**Methodische Korrektur durch Reviewer, wichtig:** Discovery-/Out-of-Sample-Split jetzt verbindlich
VOR jeder Parameter-Kalibrierung (verhindert Overfitting-Falle: "Parameter ausprobieren → bestes
Ergebnis als Backtest präsentieren"). Neuer Forschungsgrundsatz: "Kein Optimieren auf ρ" — auch
bei mehreren informativen Signalen keine direkten Gewichtungen ableiten, erst prüfen ob überhaupt
ein Ensemble gerechtfertigt ist.

**Dokument:** `docs/FAIR-VALUE-ENGINE-V2-SPEC-2026-09-17.md`, UIQ-Suite, committet (`8578219c...`),
verifiziert, eingefroren. Enthält neuen Backlog-Punkt "Track-Record Coverage ATMNA/Weekly/Collar".

### 3. Projekt-Standortbestimmung ("Blick von außen")
`SUITE.md` (v4.25) und `SWOT-ANALYSE-2026-08-07.md` frisch gelesen, gegen die sechs
selbstgesetzten Go/No-Go-Kriterien (Dezember 2026, Schwelle 5-6/6 grün → Phase 2, ≤3 grün →
Eigen-Tool) geprüft. **Ehrlicher Zwischenstand: eher 1-2 klar grün** (Backtest 2007-2026 ✅, Test-
Abdeckung teilweise), **eines strukturell rot** (Beta-Aktivität: weiterhin 0 externe Nutzer),
Rest dünn/unklar. Reviewer-Ergänzung: UIQ hat hohe *Systemkomplexität*, aber noch nicht
entsprechend hohe *Evidenzkomplexität* — Hauptempfehlung: nicht weiter Features bauen, sondern
Beta-Nutzer UND Rechtsprüfung parallel jetzt angehen, nicht sequenziell abwarten.

**Axels Grund fürs Zögern bei Beta-Nutzern:** noch nicht überzeugend belegte Aussagekraft der
Empfehlungen. Aufgelöst als zwei getrennte Fragen (quantitative Systemvalidierung ≠ Produkt-/
Nutzervalidierung) — ein Beta-Test kann als reiner Decision-Support-Usability-Test laufen, ohne
dass Trefferquote-Überzeugung Voraussetzung ist.

### 4. UIQ Regulatory & Product Architecture Briefing — v0.1 → v0.2 "Legal Review Ready"
Vollständiges 19-Abschnitte-Dokument erstellt (Architektur, Datenfluss, Public/EIC/Owner-Trennung,
Options-Desk-Grenzen, KI-Rolle, Disclaimer, empirischer Validierungsstand, 14 konkrete Fragen an
den Rechtsberater). Zwei Korrekturrunden mit Reviewer:
- **Wichtige Korrektur:** EIC steht für "Editor in Chief" — rein private, vom Entwickler selbst
  genutzte Ebene, NICHT für Beta-Tester vorgesehen. Löst eine ursprünglich offene Frage auf
  (Beta-Tester sehen ausschließlich Public-Modus, keine Wahl zwischen Modi).
- v0.2: "Public darf"-Formulierung entschärft (keine eigene rechtliche Vorwegnahme mehr), MAR/
  Investment-Recommendation als eigener Fragenblock ergänzt, EMA200/ATR-Heuristik korrekt als
  Strike-Näherung statt Prämienschätzung beschrieben, Optionsketten-Widerspruch aufgelöst,
  "Validierungsstatus ≠ regulatorische Aussage" ergänzt, Beta-Frage als Prioritätsfrage 1
  vorangestellt, Anhang auf 6 definierte Outputs präzisiert.

**Datei:** `UIQ-REGULATORY-PRODUCT-BRIEFING-v0.2-2026-09-17.md` — als Datei geliefert, **NICHT
committet** (bewusst, da rechtsstrategisches Arbeitsdokument — falls doch ins Repo, dann
vermutlich eher privates Repo als öffentliches `UIQ-Suite` prüfen).

**Offen:** 6 reale Output-Beispiele für den Anhang (Morning Briefing, Public Equity Digest, Public
Options Digest, Ranking, EIC-Output zum Kontrast, "Dangerous Borderline"-Vorher/Nachher) — nur
Axel kann das aus der laufenden App zusammenstellen.

### 5. BaFin-Erlaubnispflicht-Voranfrage — verschickt/versandfertig
Als Privatperson, vor möglicher GmbH-Gründung, mit 10 konkreten Fragen (inkl. explizit der
GmbH-Notwendigkeits-Frage). Finale Fassung von Axel selbst mit Kontaktdaten und einer wichtigen
inhaltlichen Präzisierung ergänzt (Weekly-Income-Methodik-Quelle: T.R. Lawrence, "Weekly Cash
KaChing"). Geplante Sequenz: BaFin-Antwort abwarten → mit Antwort + Regulatory Briefing v0.2 zu
einer Kanzlei (Fachanwalt Bank-/Kapitalmarktrecht) → erst danach Entscheidung über Gesellschafts-
form und tatsächliche Beta-Freigabe.

### 6. CoT (Commitments of Traders) — neues Research-Thema, Data-Acquisition-Spec fertig
Ausführliche Reviewer-Diskussion zur Integration von CFTC-Positionierungsdaten als zusätzliche
MCM-Dimension (nicht als Einzelaktien-Indikator). Bestehende MCM-Komponenten (VIX, VVIX, SKEW,
HY-Spread, Net Liquidity, Treasury Stress, Markov) im Code verifiziert, nicht nur angenommen.

**Portfolio-Einwand eingebracht und aufgelöst:** CoT würde einen vierten parallelen Research-Track
neben Fair-Value und FOMC/Event-Risk bedeuten. Lösung: CoT startet nur als **passiver
Data-Collector** (Datenerfassung ohne Feature-Engineering/Score/Strategie-Einfluss), nicht als
gleichberechtigter Research-Track — "2 aktive Research-Projekte + 1 billiger Data-Collector".

**Technische Machbarkeit verifiziert, nicht angenommen:** CFTC Public Reporting API
(`publicreporting.cftc.gov`, Dataset `gpe5-46if`, TFF Futures Only) funktioniert ohne
Authentifizierung — live gegen echte Abfragen getestet. 6 von 7 Ziel-Instrumenten exakt
bestätigt (E-MINI S&P 500, NASDAQ MINI, RUSSELL E-MINI, VIX FUTURES, UST 10Y/2Y NOTE) — USD Index
("DOLLAR INDEX") noch nicht bestätigt, blockiert aber v1.0 nicht. **Gold/Crude Oil bewusst
ausgeschlossen** — anderer CFTC-Report-Typ (Disaggregated statt TFF), anderes Kategorienschema,
als eigenständiges v1.1 zurückgestellt.

**Dokument:** `UIQ-COT-MODULE-DATA-ACQUISITION-SPEC-v1.0-2026-09-17.md` — als Datei geliefert,
**NICHT committet**, noch NICHT implementiert. Enthält nach drei Reviewer-Korrekturen: Zwei-
Schichten-Speicherung (Raw JSON + normalisierte Tabelle, schützt vor CFTC-Schema-Änderungen),
stabile interne `uiq_instrument_id`s getrennt von rohen CFTC-Namen, robusten Idempotenz-Schlüssel
(`instrument_id + report_date`, nicht `report_date` allein), und `uiq_effective_date_type`
(`observed`/`backfill_estimate`) — verhindert, dass eine technische Backfill-Näherung später als
beobachtete Tatsache missverstanden wird. Look-Ahead-Bias-Schutz strukturell eingebaut.

---

## Für nächstes Mal

### Direkt umsetzbar, wartet nur auf grünes Licht
1. **CoT-Data-Collector implementieren** (`cot_layer.py` o.ä., neuer kleiner GHA-Job, unabhängig
   vom täglichen Aggregator-Lauf) — Spec ist fertig und eingefroren.
2. **Reale Outputs für den Regulatory-Briefing-Anhang** zusammenstellen (nur Axel kann das).

### Wartet auf externe Antworten (kein UIQ-Handlungsbedarf, nur Beobachten)
3. BaFin-Antwort abwarten.
4. Track Record läuft automatisch weiter — `r30`/`r90`-Abdeckung wächst von selbst, `atmna`-Score-
   Historie seit 16.09. sammelt sich, `ownerEarningsYield`-Historie seit 09.09. wächst. Kein Grund,
   Research v0 (Fair-Value) oder die FOMC-Event-Study jetzt erneut zu fahren — erst wenn spürbar
   mehr Daten da sind (z.B. nächster unabhängiger FOMC-Termin am 27.10.).

### Weiterhin offen, nicht vergessen
5. Zwei Token-Rotationen (Cloudflare-Worker-Bearer-Token, `STATIC_TOKEN`) aus dem 16.09.
6. ATMNA-Explainability-Gap — dokumentiert im Code (`generate_public_recommendations.js` v1.5),
   bewusst kein Prompt-Fix jetzt, erst bei der nächsten gezielten Options-Prompt-Qualitätsrunde.
7. GHA-Laufzeit-Frage (>27min) — ungeklärt, nicht akut.
8. Track-Record Coverage `atmna`/`weekly_income`/`collar` — reine Forward-Performance-Lücke,
   unabhängig von Thema 3, dokumentiert in der Fair-Value-Spec.
