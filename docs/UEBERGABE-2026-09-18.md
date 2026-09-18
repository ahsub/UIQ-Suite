# UIQ — Übergabeprotokoll 18.09.2026

## Pflicht-Header

- **Zwei Token-Rotationen aus dem 16.09.-Protokoll weiterhin offen** (Cloudflare-Worker-
  Bearer-Token, `STATIC_TOKEN`) — heute wieder nicht adressiert, jetzt 2 Tage länger
  überfällig als am 17.09. Sicherheitsthema, sollte nicht noch eine weitere Session
  liegen bleiben.
- **GHA-Laufzeitfrage vom 16.09.** (>27min statt der erwarteten ~2-3min) weiterhin
  ungeklärt, weiterhin nicht akut.
- **Erste Guardrail-Verstärkung reicht selten beim ersten Versuch** — heute erneut
  bestätigt (s. Punkt 5): zwei von drei neu eingeführten Pflicht-Zusätzen fehlten im
  ersten Live-Test trotz expliziter Prompt-Vorgabe. Bei künftigen neuen Guardrails von
  vornherein eine SCHLUSS-SELBSTPRÜFUNG-Verstärkung mit einplanen, nicht erst nach dem
  ersten Fehlschlag nachziehen.

---

## Heute abgeschlossen

### 1. Reviewer-Feedback zur ATM/NA-CSP-Tagesempfehlung umgesetzt (`ko-prompts.js` v2.53.26)
Reviewer-Kritik an der gestrigen CSP-Tagesempfehlung (IVP wurde textlich zu stark
gegenüber Grade gewichtet, Ludwig-Kriterien aus dem STRATEGIEPRINZIP tauchten in der
konkreten Bewertung nicht mehr auf) in zwei gezielten Fixes in `_publicNinePointPrompt()`
umgesetzt, wirkt auf alle 5 Optionsstrategien:
- Abschnitt 3 bekommt bei Optionsstrategien einen Pflicht-Zusatz zum nicht verifizierten
  Options-Validierungsstatus (Strike-Staffelung/OI-Volumen/Wochenoptionen).
- Neuer REASONING-GUARDRAIL i) gegen implizite Einzelkriteriums-Dominanz (z.B. IVP),
  wenn ein anderes genanntes Kriterium (z.B. Grade) bei denselben Titeln divergiert.

**Committed:** `6e2e9f2`, in `index.html` nachgezogen.

### 2. ATMNA-Explainability-Gap behoben (`ko-prompts.js` v2.53.27)
Backlog-Fund aus `generate_public_recommendations.js` v1.5 (16.09.2026) im selben Zug
mitgenommen: neuer generischer Hook `o.expliziteFaktorenPflicht` in Abschnitt 4, nur bei
`atmna` befüllt — fordert explizite Nennung von Bollinger-Position und Tightness als
eigene Ranking-Begründung statt nur generischer Faktoren (RSI/Grade/D200/IVP). Wirkt
nicht auf die anderen 4 Options-Strategien oder den EIC-Zweig.

**Committed:** `a539e30`, in `index.html` nachgezogen.

### 3. Fair-Value-Engine V2 — Phase A (Mechanik) implementiert
Nach Klärung "Mechanik jetzt bauen, Kalibrierung erst nach mehr Daten" (Reviewer-
Vorschlag, deckt sich mit der Spec-Sperre vom 17.09.): `compute_fair_value_v2()` +
`compute_fair_value_v2_for_universe()` in `market_aggregator.py`. Renditegrößen-
Reframing (OE-/FCF-/Forward-Earnings-Yield gegen provisorische Referenzrenditen),
Median statt Gewichtung, `fair_value_data_completeness`/`fair_value_agreement`/
`fair_value_dispersion_pct` als getrennte Dimensionen, `calibration_status:
"PROVISIONAL_NOT_CALIBRATED"` sowie `fair_value_model`/`fair_value_model_version` als
Pflichtfelder (Reviewer-Ergänzung, Provenienz für spätere Kalibrierungsänderungen).
Ergebnis landet in einem eigenen, isolierten Top-Level-Key `master["fairValueV2"]` —
NICHT in `results[]`/Leaderboards, damit kein Score/Prompt/Digest versehentlich
mitliest. Gegen synthetische Daten getestet (inkl. Reviewers eigenem Dispersions-
Beispiel OE=$180/FCF=$190/PE=$410 → korrekt LOW agreement).

**Committed:** `64b47f3`. Phase B (OE-vs-FCF-Forschungsvorbereitung) bewusst noch nicht
begonnen — separater, späterer Schritt. Bewusst eingefroren, bis mehr `r30`/`r90`- und
`ownerEarningsYield`-Historie vorliegt.

### 4. CoT-Data-Collector v1.0 — Acquisition Layer abgeschlossen
Spec (`UIQ-COT-MODULE-DATA-ACQUISITION-SPEC-v1.0-2026-09-17.md`, nie committet)
umgesetzt in `cot_layer.py` + `cot-weekly.yml` (Repo `ko-aggregator`), mit einer
wichtigen Korrektur unterwegs gefunden: die CFTC hat am 08.02.2022 mehrere
`market_and_exchange_names`-Bezeichnungen umbenannt (nahtlos, alte Bezeichnung endet
2022-02-01, neue beginnt 2022-02-08) — verifiziert per Live-Recherche über Claude-in-
Chrome (nicht aus offizieller CFTC-Dokumentation). `cot_layer.py` v1.1 fragt deshalb pro
Instrument alle bekannten historischen Bezeichnungen ab (`INSTRUMENT_SOURCE_NAMES`),
Idempotenz-Schlüssel erweitert auf `instrument_id + market_and_exchange_names +
report_date`. RUSSELL2000 hat drei historische Bezeichnungen (ICE 2008–2018, CME-
Zwischenname 2017–2022, aktuell) mit einer echten Venue-Überlappung 2017-08-15 bis
2018-06-05 — beide Quellen bewusst nicht konsolidiert, sondern über
`historical_source_overlap=true` markiert (Reviewer-Vorgabe: keine unvalidierte
"CME ist richtiger"-Annahme).

Echter Vollbackfill über den echten GHA-Runner gefahren (zwei `workflow_dispatch`-Läufe,
erst SP500 allein zum Secrets-/Permissions-/Pfade-Test, dann alle sechs):
**6234 Datensätze insgesamt**, 5/6 Instrumente mit ~20 Jahren Historie ab 2006-06-13
bzw. 2006-08-29 (VIX), RUSSELL2000 ab 2008-07-22 (990 Datensätze, davon 86 im
Overlap-Fenster). Keine Fehler, keine übersprungenen Quellen. Idempotenz bestätigt: der
zweite SP500-Lauf erzeugte 0 neue Zeilen.

**Committed:** `3f9ba5a` (`cot_layer.py`), `bbee459` (`cot-weekly.yml`), `b20b534` +
`49f1efe` (automatische Commits der beiden Backfill-Läufe selbst). Status-Dokument
`UIQ_COT_MODULE_v1.0.md` erstellt (Architektur-Kette, Ergebnistabelle, Integrations-Gate:
"nicht signifikant nützlich" ist ein gültiges Forschungsergebnis) — geliefert,
Commit-Rückmeldung steht noch aus.

Bewusst eingefroren wie Fair-Value: kein Feature-Engineering (Net Position/Percentile/
Veränderung), keine MCM-/Score-/Digest-Integration, bis mehrere Wochen weiterer
Wochenläufe + eine Data-Quality-Prüfung vorliegen.

### 5. Erster Live-Test von v2.53.26/27 — zwei von drei Fixes griffen nicht, Fix-Batch v2.53.28
Reviewer-Auswertung des ersten echten atmna-Outputs nach den heutigen Fixes: der
Options-Validierungsstatus-Satz (v2.53.26) und der BB-Position/Tightness-Zusatz
(v2.53.27) fehlten BEIDE ersatzlos — Regel-Existenz allein reichte nicht, bekanntes
Muster bei neuen Guardrails. Der IVP/Grade-Divergenz-Guardrail (v2.53.26, Punkt i) griff
nur teilweise: Abschnitt 9 benannte die Divergenz, aber mit falscher "teilt"-Sprache bei
tatsächlich unterschiedlichen Werten (PJP 84%ile vs. JNJ 87%ile als "teilt den höchsten
IVP-Bereich" bezeichnet). Zusätzlich vom Reviewer gefunden: IVP fälschlich als
"realisierte Volatilität" bezeichnet (ist echtes IV-Perzentil, vermutlich weil der
Options-Pfad anders als der Equity-Pfad keine Feld-Legende mitliefert), sowie die
Strike-Näherung (EMA200-1,5×ATR) fälschlich als "Rollschwelle" bezeichnet.

Vier Fixes in `ko-prompts.js` v2.53.28: (1) BEGRIFFS-KLARSTELLUNG PFLICHT in Abschnitt 4
— IVP muss als implizite Volatilität bezeichnet werden, HVP-Fallback explizit
kennzeichnen; EMA200-1,5×ATR heißt jetzt "modelliertes Referenzniveau". (2) Guardrail i)
um explizite Ergänzung erweitert: "teilt"/"gemeinsam" bleibt echten Zahlen-Gleichständen
vorbehalten, mit dem PJP/JNJ-Fund als Beleg. (3) Neuer SCHRITT 3 in der SCHLUSS-
SELBSTPRÜFUNG (conditional auf Optionsstrategien) — explizite Vor-Abgabe-Prüfung, ob
beide Pflicht-Zusätze aus Abschnitt 3/4 tatsächlich im Text stehen, analog zum bewährten
Muster von Schritt 1/2.

**Bewusst zurückgestellt** (Scope-Grenze am Abend): Terminologie-Umbenennung
"Strategy Fit" → "Kriterienübereinstimmung" (systemweit, größerer Umbau), Abschnitt-9-
Tabellenformat statt Mini-Ranking-Prosa, "Top-15"-Frontend-Wortlaut (vermutlich in
`index.html`/`generate_public_recommendations.js`), echte Options-DATA_LEGENDE analog
zum Equity-Pfad.

**Committed:** `45ed4e8`, in `index.html` nachgezogen.

---

## Für nächstes Mal

### Direkt umsetzbar, wartet nur auf grünes Licht
1. **Erneuter Live-Test** (atmna oder csp_wheel) — prüft gezielt, ob SCHRITT 3 die beiden
   Pflicht-Zusätze jetzt zuverlässig erzwingt, ob IVP korrekt als implizite Volatilität
   bezeichnet wird, ob "Rollschwelle" verschwunden ist, und ob "teilt"/"gemeinsam" nur
   noch bei echten Gleichständen auftaucht.
2. Die vier heute bewusst zurückgestellten Terminologie-/Struktur-Punkte aus v2.53.28
   (s.o.) — kein akuter Bedarf, aber nicht vergessen.

### Wartet auf externe Antworten (kein UIQ-Handlungsbedarf, nur Beobachten)
3. BaFin-Antwort abwarten.
4. Track Record läuft automatisch weiter. CoT-Wochenläufe laufen ab kommendem Samstag
   automatisch (Cron 06:00 UTC) — kein Grund, vor Ablauf mehrerer Wochen erneut
   hinzuschauen, außer ein Lauf schlägt fehl.

### Weiterhin offen, nicht vergessen
5. Zwei Token-Rotationen (Cloudflare-Worker-Bearer-Token, `STATIC_TOKEN`) — jetzt seit
   16.09., zunehmend überfällig.
6. GHA-Laufzeitfrage (>27min) — ungeklärt, nicht akut.
7. Fair-Value-Engine V2 Phase B (OE-vs-FCF-Forschungsvorbereitung) — separater,
   späterer Schritt, noch nicht begonnen.
8. CoT Data Quality/Coverage-Prüfung (6 Punkte, s. `UIQ_COT_MODULE_v1.0.md`) — erst nach
   mehreren Wochen weiterer Wochenläufe sinnvoll.
9. `UIQ_COT_MODULE_v1.0.md` — Commit-Rückmeldung noch offen, sonst inhaltlich fertig.
