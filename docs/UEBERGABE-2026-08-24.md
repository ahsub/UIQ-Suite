# UEBERGABE-2026-08-24.md

Sehr langer, dichter Tag — von der Fortsetzung des Options-Modul-Siebs über
eine grundlegende Architektur-Korrektur (Trade-Journal/OptionsCoach gehören
zu Refundex, nicht in ein neues Repo) bis zu sechs bereinigten UIQ-Backlog-
Punkten und zwei kleineren Frontend-Fixes. Alle Commits einzeln gegen den
Live-Stand verifiziert (Byte-Diff + Syntax-Check + funktionaler Test).

---

## 1. Multi-Leg-Prefilter — Stufe 1 des zweistufigen Siebs

**Ausgangsfrage:** "Alle 700+ Ticker brauchen Volatilitätsdaten"-Problem aus
der 23.08.-Übergabe lösen, bevor CapTrader-Chain-Daten (Stufe 2) angebunden
werden.

**Umgesetzt:**
- `calc_multileg_season()` — Stufe 1a, marktweit, 1×/Lauf: VIX-Terminstruktur
  (`ratio_3m_spot`) + SKEW-Perzentil bestimmen, welche der 5 Multi-Leg-
  Strategien aus `multileg-strategien-konzept.md` heute strukturell infrage
  kommen
- `score_multileg_prefilter()` — Stufe 1b, pro Ticker: HVP-Band (Proxy für
  IV-Regime, kein echter IV-Rank — explizit im Code vermerkt), Earnings-Gate
  (`_earnings_gate()` wiederverwendet), Directional-Filter für Vertical
  Credit Spread mit **ADX-Hard-Gate (≥20)** — nachgeschärft nach Live-Test
  (vorher 371 Kandidaten bei `min_score=60`, mit ADX-Gate 200)
- `build_multileg_shortlist()` — Top-20 je Strategie, `min_score=60`
- Bekannte, bewusste Grenze dokumentiert: Iron Condor/Iron Butterfly liefern
  identische Ranglisten, weil UIQ keine echte Put/Call-Skew pro Ticker hat
  (nur CBOE-SKEW, ein marktweiter Index). Recherche ergab: keine günstige
  CBOE-Quelle dafür — wartet bewusst auf Stufe 2 (CapTrader-Chain-Daten)
- Getestet gegen echten Snapshot (`2026-08-24_04.json.gz`, 733 Ticker) vor
  UND nach Commit — Ranglisten identisch, Season-Logik korrekt

**Live verifiziert:** Manueller GHA-Lauf #245 (6m27s, "completed
successfully") → Snapshot `2026-08-24_06.json.gz` enthält
`master.multilegPrefilter` mit Season + Shortlist, Ende-zu-Ende bestätigt.

---

## 2. Sektor-Holdings-Match-Rate — Bindestrich/Apostroph-Bug

**Fund:** Match-Rate lag bei 94,7% (142/150) — über dem Soll (≥93%), aber 7
der 8 Fehlschläge folgten einem gemeinsamen, bisher unadressierten Muster:
Bindestrich im Quellnamen (`ARCHER-DANIELS-MIDLAND`) vs. Leerzeichen im
IWV-CSV (`ARCHER DANIELS MIDLAND`), sowie Apostroph (`O'REILLY` vs.
`OREILLY`) — andere Fehlerklasse als der `_norm()`-Fix vom 23.08.

**Fix:** `_norm()` um `s.replace("-", " ").replace("'", "")` vor der
Suffix-Entfernung erweitert. Match-Rate 94,7% → **98,0% (147/150)**.
Verbleibend offen (kein Formatierungsproblem): DoorDash ("Inc." mittendrin
verschiebt Präfix), Baker Hughes ("Company"-Suffix fehlt in der Liste),
Electronic Arts (fehlt komplett in `iwv_holdings.csv` — echtes Datenlücken-
Problem, kein Matching-Bug, ungeklärt ob Delisting/Indexereignis).

**Commit:** `ko-aggregator/market_aggregator.py`, Hash `595d9dfc` (enthält
Multi-Leg-Prefilter aus Block 1 + diesen Fix zusammen) — verifiziert.

---

## 3. Options-Modul-Architektur — Grundsatzentscheidung + Korrektur

**Erste Entscheidung (Vormittag):** Options-Coach/-Doktor/Tradejournal
bleiben **außerhalb von UIQ** — UIQ behält Priorität, Trennung nach Concern
(Scanner-Logik bleibt UIQ, Live-Positions-Tooling + Steuer/Quellensteuer
bleiben getrennt). CapTrader-Technik: **IB Gateway + `ib_async`**
(`ib_insync` ist tot, Maintainer verstorben), On-Demand-Betrieb auf Axels
eigenem Rechner (kein VPS, kein Dauerbetrieb, kein IBC/wöchentlicher
2FA-Automatisierungsaufwand nötig, weil kein Hintergrundbetrieb gewünscht).

**Korrektur (Nachmittag, nach Repo-Audit):** Beim Versuch, mit der Umsetzung
zu starten, wurde entdeckt: `ibkr-tax-tool` (privates Repo) existierte
bereits, aktiv entwickelt bis 08.08.2026 (v0.5.0), mit funktionierendem
KI-Advisor (`ai_advisor.py`, ruft echte Anthropic API), Strategie-
Regelwerk (`options_strategies.py`, 9 Strategien mit Regime-Gates) und
Flex-Query-Batch-Import (`flex_parser.py`).

Daraufhin **Refundex ROADMAP.md** (Stand v2.10, 10.08.2026) geprüft — zeigt:
- **Punkt 2.9** (Architektur-Entscheidung 05.08.2026): Trade-Journal-Modul
  gehört **in Refundex**, nicht UIQ. `ko-journal.js` + Journal-Tab in
  `kap.html`, Journal-Detail-View v1.0 bereits gebaut (07.08.2026)
- **Punkt 2.12**: OptionsCoach + OptionsDoktor bereits vollständig
  spezifiziert (SUITE.md Backlog Nr. 37), mit bewusstem Trigger
  **"nach 01.10.2026"** (Track Record muss erst reif sein)
- **Punkt 2.10/2.11**: automatisierter Flex-Query-Pull
  (`flex_client.py` + `ko-flex-proxy` Worker) bereits fertig

**Finale Entscheidung:** `ibkr-tax-tool` ist redundant zu bereits reiferer,
gegen echte PWC-Steuerbescheinigungen validierter Refundex-Funktionalität.
Zwei Dateien gerettet (`ai_advisor.py`, `options_strategies.py`), mit
Herkunfts-Header versehen, nach `refundex/docs/reference/` committed
(unverdrahtet, kein Code-Aktivierungsschritt). **Wichtiger dokumentierter
Konflikt:** `options_strategies.py` bewertet Iron-Condor-Eignung nach dem
marktweiten MSE-Regime (`regime_v2`, nur in `POST_PANIC_REVERSION`
"optimal"), während der heutige Multi-Leg-Prefilter (Block 1) VIX-Term/SKEW
+ Pro-Ticker-Regime nutzt — **zwei unterschiedliche Philosophien, bewusst
ungelöst im Header vermerkt**, nicht stillschweigend überschrieben.

Repo `ibkr-tax-tool` anschließend von Axel gelöscht (bestätigt).

**Commit (Referenzdateien):** `refundex/docs/reference/ai_advisor.py` +
`options_strategies.py` — verifiziert (Byte-Diff gegen geprüfte Fassung,
kein Hash mitgeteilt, aber Inhalt direkt gegenkontrolliert).

---

## 4. UIQ-Backlog-Bereinigung (SUITE.md)

Auf Anfrage sechs Punkte durchgegangen — Ergebnis: **vier von sechs waren
bereits vollständig erledigt**, nur nicht im Backlog abgehakt:

| # | Thema | Status vor heute | Ergebnis heute |
|---|---|---|---|
| 32 | Testgürtel Regime-Pfad | Existierte (25 Tests, grün) | **Echte Lücke gefunden:** GEX<0-Override-Zweig komplett ungetestet. 6 neue Tests ergänzt, 31/31 grün. Commit `571d527e`, verifiziert |
| 33 | Ratio-Konvention härten | Bereits 07.08. erledigt | Nur verifiziert — zusätzlich bestätigt: altes `vix_term['ratio']` hat 0 Live-Konsumenten (Server + Client geprüft) |
| 35a | yfinance pinnen | Bereits erledigt (`==1.5.2`) | Nur verifiziert |
| 35b | Degradationspfad | KV-Erhalt funktionierte, aber `master['meta']['degraded']`-Flag war **strukturell nie erreichbar** (Exit vor Dict-Bau) — Frontend hatte keine Möglichkeit, veraltete Daten zu erkennen | Separater KV-Key `degraded_status` + Frontend-Erweiterung `checkDataFreshness()` mit präziser Meldung statt irreführender Generik-Warnung. Aggregator-Commit `3e62d94e`, Frontend-Commit `537b2067`, beide verifiziert |
| 13b | Dividend/Value-Scan | Scoring existiert (28./29.07.), aber Ampel-Gates entfernt (17.07., Regime-Coverage-Analyse: kein Timing-Fit) | Sauber gelöst, nur anders als Backlog-Text beschrieb — Leaderboard statt Ampel-Gate, architektonisch korrekt. Nur dokumentiert |
| 13c/13f | Pattern/Entry-Engine | Vollständig eingehängt seit 25.07. (v401) — Server (`patternEntry`-Feld) + Client (DeepDive-Renderer `#dd-pattern-entry` + KI-Prompt-Kontext) | Nur verifiziert |
| 13e | Weitere Sektor-ETF-Holdings | Alle 10 ETFs bereits vorhanden (`data/holdings_{ETF}.xlsx`, 19.07.2026) | Verifiziert — **Nebenfund:** Dateien 36 Tage alt trotz dokumentierter Monatspflicht. Neuer Backlog-Punkt 56 (Erinnerung + Quellentabelle) ergänzt |

**Neuer Punkt 56** (Sektor-Holdings-Erinnerung + Quellenreferenz):
Quellenfamilie identifiziert (State-Street-SPDR-"Select Sector UCITS
ETF", `ssga.com`), 3 von 10 UCITS-Proxy-Tickern verifiziert (ZPDT=XLK,
ZPDF=XLF, ZPDE=XLE). **Zwei Optionen für Erinnerungsmechanismus zur Wahl
gestellt, nicht entschieden:** (a) Alterscheck im Aggregator + Anbindung an
`degraded_status`, oder (b) rein prozessual über `RUNBOOK.md`.

**Commit:** `UIQ-Suite/SUITE.md`, v4.15 → v4.16 — **Diff präsentiert, aber
kein Upload-/Commit-Bestätigung von Axel erhalten.** Unklar, ob bereits
hochgeladen — **morgen zuerst prüfen.**

---

## 5. Sektor-RS-Labels + Hebel-ETF-Bereinigung

**Auslöser:** Axel bemerkte kryptische Ticker-Anzeigen in der
Sektor-RS-Tabelle (Screenshot).

**Fund:** `SEKTOREN`-Array im Frontend hatte nur 12 von 39 (später 38)
Einträgen. XLU fehlte komplett (echter Bug — serverseitig längst Teil der
Liste), 26 weitere Themen-/Länder-ETFs hatten nie ein Label.

**Fix:** Alle fehlenden Labels ergänzt (Themen-ETFs, Länder-ETFs). Dabei
**Nebenfund mit Substanz:** DFEN ist ein **3× täglich gehebelter** Fonds
(Direxion Daily Aerospace & Defense Bull 3X, verifiziert) — zunächst nur
im Label markiert, dann auf Axels Vorschlag hin **komplett aus dem
Ticker-Universum entfernt** (`SECTOR_ETFS_US` + `RS_SECTOR_ETFS`), nicht
nur aus der RS-Tabelle — Begründung: Hebel-Verzerrung beträfe Leaderboards/
technische Scores genauso wie die RS-Anzeige, halbe Lösung wäre
inkonsistent gewesen.

**Commits:** `ko-aggregator/market_aggregator.py` Hash `4c2d2a51`,
`axel-scanner/index.html` Hash `c0c376e5` — beide verifiziert (Byte-Diff,
Syntax, funktionaler Test: 38/38 Ticker haben Label, DFEN nirgends mehr
aktiv referenziert außer im historischen Changelog-Kommentar).

---

## Infrastruktur-Stand (24.08.2026 Abend)

| Komponente | Version/Hash |
|---|---|
| `ko-aggregator/market_aggregator.py` | Hash `4c2d2a51` (final) |
| `ko-aggregator/tests/test_regime.py` | Hash `571d527e` |
| `axel-scanner/index.html` | Hash `c0c376e5` (final) |
| `UIQ-Suite/SUITE.md` | v4.16 — **Upload-Status unklar, prüfen** |
| `refundex/docs/reference/ai_advisor.py` + `options_strategies.py` | committed, verifiziert |
| `ibkr-tax-tool` | gelöscht (bestätigt) |
| Letzter verifizierter GHA-Lauf | #245 ✅ (manuell) |

---

## Offene Punkte für morgen

1. **SUITE.md-Upload verifizieren** — unklar, ob v4.16 tatsächlich
   hochgeladen wurde (keine Bestätigung von Axel erhalten). Vor allem
   anderen zuerst prüfen, sonst versehentlich doppelt bearbeiten.
2. **CapTrader/IB-Gateway-Anbindung noch nicht begonnen** — Architektur
   heute entschieden (IB Gateway + `ib_async`, on-demand, lokaler Rechner),
   aber kein Code geschrieben, keine Installation, keine erste
   Testverbindung. Vollständig offen für die nächste Session.
3. **Regime-Philosophie-Konflikt** (aus Block 3) — `options_strategies.py`
   (marktweites MSE-Regime) vs. heutiger Multi-Leg-Prefilter (VIX-Term/SKEW
   + Pro-Ticker-Regime) bewusst ungelöst dokumentiert. Muss geklärt werden,
   bevor `ai_advisor.py`/`options_strategies.py` je aktiviert werden.
4. **Options-Doktor-Konzept:** weiterhin offene Frage aus der 23.08.-
   Übergabe — wie kommen Positionsdaten rein (manuell vs. neues UI-
   Formular)? Unverändert ungeklärt, heute nicht angefasst.
5. **Sektor-Holdings-Erinnerungsmechanismus** (Backlog Nr. 56) — zwei
   Optionen vorgeschlagen, keine gewählt.
6. **Mouseover-URL-Tooltip für ETF-Holdings-Quellen** — explizit von Axel
   auf "nächste Session" vertagt ("reiner Comfort"). Stand: URL-Muster für
   SSGA-SPDR-UCITS-Familie bekannt (`ssga.com/de/de/intermediary/etfs/
   state-street-spdr-sp-us-{sektor}-select-sector-ucits-etf-acc-{ticker}-
   gy`), 5 von 10 Tickern verifiziert (ZPDT/XLK, ZPDF/XLF, ZPDH/XLV,
   ZPDI/XLI, ZPDE/XLE), 5 fehlen noch (XLY, XLP, XLB, XLC, XLRE, XLU).
   Für die übrigen 29 Nicht-Sektor-Ticker (ARKK, EWJ, SMH, ...) existiert
   **keine** vergleichbare EMEA-UCITS-Quelle — bei Bedarf eigene,
   heterogene Recherche pro Fondsfamilie nötig, nicht einfach das gleiche
   Muster fortsetzen.
7. **Electronic Arts fehlt weiterhin** in `iwv_holdings.csv` (aus Block 2)
   — echtes Datenlücken-Problem, nicht verifiziert ob Delisting/
   Indexereignis. Von Axel selbst zu prüfen, falls relevant.
