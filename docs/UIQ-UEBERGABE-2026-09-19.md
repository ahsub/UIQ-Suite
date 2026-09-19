# UIQ — Übergabeprotokoll 19.09.2026

## Pflicht-Header

- **Zwei Token-Rotationen weiterhin offen** (Cloudflare-Worker-Bearer-Token, `STATIC_TOKEN`) — heute nicht adressiert (anderer Fokus), jetzt 3 Tage länger überfällig als am 16.09. Sicherheitsthema, sollte nicht noch eine weitere Session liegen bleiben.
- **GHA-Laufzeitfrage vom 16.09.** (>27min statt ~2-3min) weiterhin ungeklärt, weiterhin nicht akut.
- **ATMNA-Live-Test (v2.53.28) aus dem 18.09.-Protokoll steht weiterhin aus** — heute ebenfalls nicht adressiert (CoT-Fokus), s. "Für nächstes Mal".
- **Claude in Chrome funktioniert jetzt zuverlässig für CFTC-Recherche** (heute erstmals in dieser Form genutzt) — für die offene `traders_*`-Frage direkt einsetzbar, kein Setup-Aufwand mehr zu erwarten.

---

## Heute abgeschlossen

### 1. CoT Data Quality v1.0 — vollständiger Report über alle 6 Instrumente

Fünf-Blöcke-Prüfung (`cot_data_quality.py`) in der von Axel festgelegten Reihenfolge E→D→A→B→C gebaut und gegen die echten Normalized-Layer-Daten (6234 Datensätze) laufen lassen:

- **E (Temporal Integrity):** PASS bei allen 6 Instrumenten, 0 Verletzungen — kein Look-ahead-Risiko. `lookahead_filter()` als wiederverwendbare E2-Durchsetzung mitgeliefert (nicht nur dokumentiert).
- **D (Schema Stability):** WARN bei allen 6, aber differenziert in zwei Klassen — `REVIEW_REQUIRED` für `traders_*`-Felder (Schwellenwert-/Vertraulichkeits-Hypothese, unverifiziert) vs. `UNCLASSIFIED_GAP` für den 2010-07-20-Fund (alle `change_in_*`-Felder fehlen an genau diesem Termin bei 6/6 Instrumenten gleichzeitig — starkes Indiz für einen CFTC-seitigen Report-Ausfall an diesem einen Termin).
- **A (Coverage):** 5/6 nur MINOR_GAPS (Feiertage), VIX als einziges MATERIAL_GAPS.
- **B (Source Mapping):** sauber, nahtloser Übergang 2022-02-01→2022-02-08 bei 5 Instrumenten.
- **C (Russell ICE/CME Overlap):** exakt bestätigte 43×2=86 Zeilen, OI-Korrelation **-0,73**, Net-Position-Korrelationen je Kategorie durchweg schwach — keine Konsolidierung vorgenommen, `research_readiness.full_universe_research=false` bleibt deshalb bestehen.

**Committed:** `3677a709` (`cot_data_quality_report_baseline_2026-09-19.json`, Repo `ko-aggregator`, `data/cot/`).

### 2. VIX Historical Availability Audit — 168-Tage-Lücke cross-validiert

Auf Axels und Reviewers Verlangen die 2008-12-16→2009-06-02-Lücke gegen **drei unabhängige CFTC-Quellen** geprüft, nicht nur unsere eigene Socrata-Kopie:

- Axels Direktdownload `F_TFF_2006_2016.xls` (identische Lücke, Werte auf die Nachkommastelle deckungsgleich zu unseren Daten)
- CFTC Live-API, **Legacy**-Datensatz `6dca-aqww` (komplett andere Kategorisierung als TFF) — via Claude-in-Chrome gefunden über Story-Seite → echten Dataset-Code aus Netzwerk-Requests extrahiert (`yjak-hhbj` war nur die Story-ID, nicht der Resource-Code)
- Ergebnis: VIX existiert dort unter demselben Code `1170E1`, fehlt aber im selben Fenster

Zusätzlich `traders_other_rept_spread`-Sparsity-Muster (154/510 fehlende Termine) exakt gegen die offizielle TFF-Datei abgeglichen — identisch. Bestätigt: kein Collector-Bug bei beiden offenen Fragen, nur die Ursache bleibt Hypothese.

**Neue Registry `KNOWN_CROSS_VALIDATED_GAPS`** in `cot_data_quality.py`: Befund (`cross_validated_sources`) und Ursache (`cause.status=HYPOTHESIS`, `confidence=MEDIUM`) strikt getrennte Felder, selbstverifizierend gegen Live-Daten (`live_reverification: CONFIRMED`/`STALE_NEEDS_REVIEW` — keine blinde Weitergabe eines einmal dokumentierten Befunds). `research_readiness.instrument_notes` neu: VIX bekommt `stable_series_start: 2009-06-02`, `usage_before_stable_start: RESEARCH_ONLY`.

**Reviewer-Korrektur umgesetzt:** "TFF-spezifisches Datenproblem ausgeschlossen" → abgeschwächt zu "Evidenz spricht deutlich gegen ein ausschließlich TFF-spezifisches Datenproblem" (Kommentar in `cot_data_quality.py`). Ebenso "Meldepflicht ausgesetzt" vermieden zugunsten von "erscheint in keinem der geprüften CFTC-COT-Publikationsformate" — dafür ein eigener Test (`test_cross_validated_gap_confirms_when_data_matches_registry`).

**Committed:** `0252ad54` (`cot_data_quality.py`), `b56ad1eb` (`tests/test_cot_data_quality.py`), Repo `ko-aggregator`. 26/26 Tests grün.

### 3. Globales `CONDITIONAL`-Gate als bewusst grob dokumentiert

Reviewer-Einwand: `regime_backtest=CONDITIONAL` wird aktuell global berechnet (`a_material = any(...)` über alle Instrumente) — ein einzelnes Instrument mit MATERIAL_GAPS (VIX) zieht das gesamte Universum auf CONDITIONAL, auch wenn ein konkretes Forschungsvorhaben das betroffene Instrument gar nicht braucht. Für v1.0 **nicht** umgebaut, sondern im Code als bewusste, dokumentierte Vereinfachung markiert — feature-/instrumentbezogene Freigabe (Beispiel: SP500-Feature stable ab 2006-06-13, VIX-Feature erst ab 2009-06-02) explizit als künftige Arbeit vorgemerkt, sobald der CoT Feature Layer gebaut wird.

**Status:** `feature_research=CONDITIONAL`, `regime_backtest=CONDITIONAL`, `full_universe_research=false` — Report als **"Data Quality v1.0 – Research Entry Gate"** eingefroren, Baseline datiert und committed.

---

## Für nächstes Mal

### Direkt umsetzbar, wartet nur auf grünes Licht

1. **`traders_*`-Schwellenwert-Hypothese gegen echte CFTC-Dokumentation verifizieren** — Claude in Chrome funktioniert jetzt zuverlässig, direkt einsetzbar.
2. **Russell-ICE/CME-Konsolidierungsentscheidung fachlich klären** — keine neuen Daten nötig, reine Entscheidung (getrennt lassen vs. eine Quelle bevorzugen vs. beide Feature-Sets parallel). OI-Korrelation -0,73 spricht eher gegen "identische Messgröße".
3. **ATMNA-Live-Test (v2.53.28)** — aus dem 18.09.-Protokoll übernommen, heute nicht bearbeitet: prüft ob SCHRITT 3 die beiden Pflicht-Zusätze zuverlässig erzwingt, IVP korrekt als implizite Volatilität bezeichnet wird, "Rollschwelle" verschwunden ist, "teilt"/"gemeinsam" nur bei echten Gleichständen auftaucht.

### Wartet auf externe Antworten (kein UIQ-Handlungsbedarf, nur Beobachten)

4. BaFin-Antwort abwarten.
5. Track Record läuft automatisch weiter. CoT-Wochenläufe laufen automatisch (Cron Samstag 06:00 UTC) — kein Grund für erneuten Blick vor Ablauf mehrerer Wochen, außer ein Lauf schlägt fehl.

### Weiterhin offen, nicht vergessen

6. Zwei Token-Rotationen (Cloudflare-Worker-Bearer-Token, `STATIC_TOKEN`) — jetzt seit 16.09., zunehmend überfällig.
7. GHA-Laufzeitfrage (>27min) — ungeklärt, nicht akut.
8. Fair-Value-Engine V2 Phase B (OE-vs-FCF-Forschungsvorbereitung) — separater, späterer Schritt, noch nicht begonnen.
9. Die vier am 18.09. zurückgestellten Terminologie-/Struktur-Punkte (Strategy Fit → Kriterienübereinstimmung, Abschnitt-9-Tabellenformat, "Top-15"-Frontend-Wortlaut, echte Options-DATA_LEGENDE) — kein akuter Bedarf.
10. CoT Phase 2 (Feature Research: Net Position, Net Position/OI, historisches Perzentil, Δ4W/Δ12W) — bewusst erst nach weiteren Wochen Datenakkumulation, nicht vor Punkt 1+2 oben.
