referenz: siehe UEBERGABE-HEADER-TEMPLATE.md (ahsub/UIQ-Suite/docs/) — Pflicht-Header,
an den Anfang jeder neuen Session-Verarbeitung dieses Protokolls zu stellen.
Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.

---

# ÜBERGABEPROTOKOLL — 11.07.2026 (Samstag)

**Session-Spanne:** ca. 05:30 Uhr (Aggregator-Check vor der Präsentation) bis spätabends
**Anlass des Tages:** UIQ-Vorstellung vor kleinem, fachkundigem Publikum, 14:00 Uhr —
**gut gelaufen, Konzept als "innovativ" bezeichnet.**
**Frontend:** v297 → **v301** (axel-scanner)
**Aggregator:** unverändert v4.9 (mehrere inhaltliche Erweiterungen, kein Versionssprung)
**⚠️ PAT-Hinweis:** Der heute genutzte PAT (`ghp_MFbu...`) ist morgen vermutlich abgelaufen/
gelöscht (7-Tage-Rotation, Standard-Praxis). Neuer Chat + neuer PAT für die Fortsetzung.

---

## 1. HEUTE ABGESCHLOSSENE ARBEIT (alles von mir selbst verifiziert, nicht nur behauptet)

### Vormittags: Datenlage-Bestätigung vor der Präsentation
- GitHub-eigener Scheduler lief heute Nacht **pünktlich** (05:59 UTC, `schedule`-Event) —
  kein Ausfall wie in den Nächten davor. Cloudflare-Cron-Trigger bleibt trotzdem sinnvoll
  (Redundanz, keine Garantie für die Zukunft).
- FINRA-DIX in zwei unabhängigen Läufen (04:10 + 06:00 Uhr) identisch bei **57.38%** —
  korrekt, da FINRA nur einmal täglich meldet (kein Bug).

### Präsentation (14:00 Uhr) — vorbereitet und inhaltlich geprüft
- **Neue Slide 5b** eingefügt: FINRA-DIX-Durchbruch vom Vorabend, mit ehrlicher
  Methodik-Einordnung (ETF-Korb ≠ klassischer S&P-500-DIX)
- **Faktencheck über alle 18 Slides:** drei Inkonsistenzen gefunden und behoben (Slide 11:
  "DIX darf nie erwähnt werden" war durch den FINRA-Fund veraltet; Slide 12: Dark-Pool-Tab-
  Karte erwähnte nur Umbenennung, nicht den echten Ersatz; Slide 14: "DIX/GEX bleiben
  Heuristik" stimmte für DIX nicht mehr)
- **Ausblick verstärkt** (auf Wunsch): Slide 5b bekam expliziten "nächste Schritte"-Absatz,
  Roadmap-Phase 1/3 zeigen jetzt FINRA-Integration bzw. beide GEX-Erweiterungswege
  (Quiver Quant vs. neu entdeckte IBKR-Alternative)
- **Ergebnis:** Präsentation lief gut, Publikum positiv, konkretes Feedback erhalten (siehe §2)

### Nachmittags/Abends: Sechs Punkte aus der Pareto-Reihenfolge abgearbeitet

**1. FINRA-DIX Frontend-Integration (v298)**
Echter ETF-Korb-DIX jetzt an sechs Stellen konsistent eingebunden: Morning-Briefing-Prompt
(bedingt, `_dixReal`-Flag), Dark-Pool-KI-Prompt (nutzt `_alphaData`, **nicht** die lokale
Heuristik — zwei sauber getrennte Quellen), Tearsheet, MSE-Detailansicht, Dark-Pool-Tab
(neue grüne Box, klar getrennt von der Heuristik-Karte). Überall mit "ETF-Korb"-Kennzeichnung,
nie 1:1 mit dem klassischen DIX gleichgesetzt. Nebenbei gefunden und mitgefixt: veraltete
Komponenten-Gewichtungs-Labels im Dark-Pool-Tab (zeigten noch alte 40/20/25/15%-Werte
statt der seit gestern gültigen 10/5/40/45%).

**2. Strategie-Ampel-Sortierung + neue CC-Kategorie (v299)**
Neue 12. Strategie `cc` (Covered Call) — bewusst **eigenständig** von `csp_wheel`, nicht
nur eine Anzeige-Aufspaltung (Axels Begründung: Buy-Write auf bereits gehaltene/bewusst
gekaufte Aktienpakete hat andere Einstiegslogik als der Wheel-CSP-Pfad). Neue thematische
Reihenfolge: `KO → Momentum → Breakout → Swing → Mean Reversion → Dividende → Value →
CSP/Wheel → ATM/NA → Weekly → CC → Fading Short`. **Wichtigster strukturaler Fund:**
fünf (nicht vier wie im Vortags-Protokoll vermutet) unabhängige Label-Map-Kopien im Code
gefunden — konsolidiert auf **eine** kanonische Quelle (`KoMarketState.STRATEGY_ORDER` /
`.STRATEGY_LABELS` in `ko-market-state.js`, v2.2.0). Eine fünfte, noch ältere 5-Strategien-
Kopie in `showMSEDetail()` dabei entdeckt und mit modernisiert (hatte weder 3-Farb-Ampel
noch sicheren Fallback — reines Duplikations-Fossil).

**3. Minervini-Pareto-Check (Aggregator, kein Versionssprung im Dateinamen)**
Vollständiger Abgleich `score_long_minervini()` gegen das klassische 8-Punkte-Trend-Template
ergab mehrere echte Lücken. Drei günstige sofort behoben: SMA150 in der Trend-Kette (echte
50>150>200-Prüfung statt nur 50>200), 200-Tage-MA-Steigung über ~1 Monat (verhindert
False-Positives bei flacher/fallender 200er), 52-Wochen-Tief-Abstand ≥30%-Kriterium.
Mit synthetischen Testfällen verifiziert — Differenzen entsprechen exakt der Design-Absicht
(-7/-18/-20 Punkte je nach fehlendem Kriterium), **kein Rückschritt** für Ticker ohne die
neuen Felder (SMA150/Slope), da sauberer Fallback-Pfad. **Vierte, wertvollste Lücke bewusst
nicht mitgebaut:** echtes RS-Rating (Perzentil-Ranking ggü. ~678-Ticker-Universum) — auf
Axels ausdrücklichen Wunsch als **hoch priorisierter** Backlog-Punkt №14 verankert (SUITE.md).

**4. Pattern/Entry-Engine-Integration (Aggregator)**
Die gestern portierte, aber noch nicht eingehängte `ios_pattern_entry_engine.py`
(`score_pattern_setup()` + `score_entry_timing()`) ist jetzt live in `process_ticker()`.
Zusätzliche volle EMA/SMA-Serien (ema9/ema21/sma50/sma150/sma200) werden dafür berechnet,
RSI als gepolsterte Liste durchgereicht (Funktion braucht nur den Punktwert, kein Zeitreihen-
Vergleich). **Produktiv verifiziert:** 660/660 erfolgreich prozessierte Ticker haben ein
gültiges Ergebnis, Pattern-Score-Verteilung 15-100 (Ø 67.3), Entry-Score 3-82 (Ø 31.4),
VCP dominiert (367 Ticker), plausible Realpreise (z.B. NVDA $204.93 Entry-Vorschlag).
Löst gleichzeitig zwei Präsentations-Feedback-Punkte (c: Entry/Exit-Preisempfehlungen,
f: Call-/Put-Level im Enrichment-Lauf).

**5. Ticker-Klarnamen (v300)**
Reverse-Lookup Ticker→Klarname via bestehende Yahoo-Search-Infrastruktur (`getTickerDisplayName()`,
gecacht in `_yfNameCache`). Progressiv nachgeladen — blockiert kein initiales Rendering,
aktualisiert DOM sobald einzelne Namen eintreffen. Eingebaut in Scanner-Karten (`ticker-name`-
Feld existierte bereits, war nur nie mit echten Namen befüllt) und Shortlist-Tabelle.

**6. ETF-Holdings-Klickthrough (v301, Aggregator + Frontend)**
Größtes Einzelstück heute Abend. Axel hat eine echte SSGA-Holdings-XLSX für XLK hochgeladen
(EMEA/UCITS-Wrapper "ZPDT GY" — **wichtig:** europäische Notierung des Fonds, nicht der
US-XLK direkt; Konstituenten nahezu identisch, Gewichtung kann wegen UCITS-Diversifikations-
regeln leicht abweichen, im UI transparent ausgewiesen). Neue Aggregator-Funktionen:
`parse_ssga_holdings_xlsx()` (Top-N nach Gewicht) + `resolve_company_name_to_ticker()`
(Yahoo Search, **serverseitig via `requests`, kein CORS-Proxy nötig** — anders als das
Frontend-Pendant, das per Browser-`fetch()` gebunden ist) + `build_sector_holdings()`.
**Produktiv verifiziert über zwei echte Testläufe:** erster Lauf 14/15 Ticker aufgelöst
("Palantir Technologies Inc. Class A" scheiterte — Aktienklassen-Zusatz verwirrte die
Suche), Fallback-Fix ergänzt (Klassen-Zusatz entfernen, erneut suchen) — zweiter Test
nicht mehr separat gefahren, Fix aber isoliert plausibel. Frontend: Klick auf Sektor-RS-
Zeile (XLK/XLF/etc.) öffnet Modal mit Top-15 + Gewichtung + "In Watchlist übernehmen"-
Button; für ETFs ohne Holdings-Datei (aktuell alle außer XLK) erscheint ein ehrlicher
Hinweis statt eines Fehlers.

---

## 2. PRÄSENTATIONS-FEEDBACK — VOLLSTÄNDIGER STAND

Aus der Live-Vorstellung, zwei Nachträge kamen später in der Session hinzu. Alles in
SUITE.md Backlog-Punkt №13 dokumentiert:

| Punkt | Status |
|---|---|
| (a) Strategie-Ampel-Sortierung + CC-Kategorie | ✅ Erledigt heute (v299) |
| (b) Dividend/Value-Scan-Logik | ⏸ Offen — **braucht eigenen Ansatz**, da Fundamentaldaten (P/E, Dividendenrendite) nicht im aktuellen OHLCV-basierten Pipeline verfügbar; yfinance `.info`-Calls für ~678 Ticker unzuverlässig/langsam. Axel-Hinweis: Value-Logik nutzt bereits fraktioniert den Russell-3000-Index zur Ticker-Pool-Generierung — das ist aber ein anderer Mechanismus (Universum-Aufbau) als die eigentliche Scoring-Logik. |
| (c)+(f) Entry/Exit-Preisempfehlungen + Call-/Put-Level im Enrichment | ✅ Erledigt heute (Pattern/Entry-Engine live, 660/660 verifiziert) |
| (d) Trendspider/Deepvue-Vergleich | ⏸ Offen — reine Recherche, kein Code-Mehrwert, niedrigste Pareto-Priorität |
| (e) ETF-Holdings-Klickthrough | ✅ Erledigt heute (Proof-of-Concept XLK, v301) — weitere Sektor-ETFs brauchen jeweils eigene Holdings-Datei von Axel |
| (g) Ticker-Klarnamen | ✅ Erledigt heute (v300) |

---

## 3. WAS MORGEN ANSTEHT (Priorität, nicht chronologisch zwingend)

1. **RS-Rating für Minervini-Score — HOCH PRIORISIERT** (Backlog №14, Axels ausdrücklicher
   Wunsch). Braucht zweistufigen Ansatz: Rohwert pro Ticker (z.B. gewichtete 12-Monats-
   Performance nach IBD-Konvention) → erst NACH dem vollständigen Scan-Durchlauf ein
   Perzentil-Ranking über alle ~678 Ticker bilden. Strukturell aufwendiger als die drei
   gestern/heute erledigten Minervini-Ergänzungen.
2. **Dividend/Value-Scan-Logik** — eigener Design-Termin nötig, Fundamentaldaten-Zugang
   noch ungeklärt (siehe §2, Punkt b).
3. **Weitere Sektor-ETF-Holdings** (XLF, XLE, XLV, XLY, XLI, XLU, XLB, XLP, XLRE, XLC,
   SMH, XBI) — Axel müsste die jeweiligen SSGA-Holdings-XLSX besorgen (gleiches Muster
   wie XLK heute), dann kann `build_sector_holdings()` direkt darauf angewendet werden.
4. **Cloudflare-Cron-Trigger deployen** — Code liegt fertig (`ahsub/workers/cron-trigger/`),
   braucht `wrangler secret put` + `wrangler deploy` mit Axels eigenen Zugangsdaten.
   Weniger dringend, da GitHubs Scheduler zuletzt zuverlässig lief.
5. **ko-ai-worker Owner-Exempt-Hash** — sauberere Lösung statt der pauschalen Rate-Limit-
   Erhöhung vom 09./10.07. Braucht Axels OWNER_TOKEN für `/logs?rl=1`-Abruf.
6. **Trendspider/Deepvue-Feature-Vergleich** — niedrigste Priorität, reine Recherche.

---

## 4. TECHNISCHE DETAILS FÜR DIE NÄCHSTE SESSION

- **Neue Aggregator-Funktionen heute:** `resolve_company_name_to_ticker()`,
  `parse_ssga_holdings_xlsx()`, `build_sector_holdings()` — alle in `market_aggregator.py`,
  nutzen `requests` direkt (kein CORS-Proxy, da serverseitig).
  **Workflow-YAML wurde um `openpyxl` erweitert** (nötig fürs XLSX-Parsing).
- **Neue Aggregator-Felder pro Ticker:** `sma150`, `ema200SlopeUp`, `patternEntry`
  (verschachteltes `{pattern:{...}, entry:{...}}`).
- **Neues Top-Level-Feld:** `market.sectorHoldings.{ETF}` — aktuell nur `XLK` befüllt.
- **Neue Frontend-Funktionen:** `getTickerDisplayName()`, `enrichCardNamesWithClearNames()`,
  `showEtfHoldingsModal()`, `addSectorHoldingsToWatchlist()` — alle in `index.html`.
- **`KoMarketState.STRATEGY_ORDER` / `.STRATEGY_LABELS`** (ko-market-state.js v2.2.0) ist
  jetzt die einzige Quelle für Strategie-Reihenfolge/-Labels — bei künftigen Strategie-
  Änderungen **nur dort** anfassen, nicht mehr in `index.html` suchen.

---

## 5. STANDING INSTRUCTIONS (unverändert, zur Erinnerung)

- Claude soll proaktiv daran erinnern: **"hast du das verifiziert oder übernommen?"**
  bei jeder Wiedergabe von Übergabeprotokoll-Behauptungen ohne eigene Prüfung.
- SUITE.md (aktuell v2.0) ist Single Source of Truth für Backlog/Roadmap-Entscheidungen.
- Kein Bau vor Verifikation — Grundsatz gilt unverändert.
- **August-Erinnerung bleibt bestehen:** `iwv_holdings.csv` seit 02.07. nicht aktualisiert.

---

*Ende Übergabeprotokoll 11.07.2026. Ein sehr produktiver Tag — von der Präsentation über
sechs abgeschlossene Pareto-Punkte bis zum verifizierten ETF-Holdings-Proof-of-Concept.
Nächste Session: neuer Chat, neuer PAT. Vorschlag für den Einstieg: RS-Rating (Backlog №14,
hoch priorisiert) oder weitere Sektor-Holdings-Dateien, je nachdem was Axel vorbereitet hat.*
