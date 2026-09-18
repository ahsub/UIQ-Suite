# UIQ CoT Module v1.0 — Status & Abschluss (Acquisition Layer)

**Datum:** 18.09.2026
**Status:** ✅ **Acquisition v1.0 abgeschlossen.** Feature Engineering und fachliche
Konsolidierung sind bewusst NICHT Bestandteil dieser Version.

Dieses Dokument ersetzt/ergänzt `UIQ-COT-MODULE-DATA-ACQUISITION-SPEC-v1.0-2026-09-17.md`
um den tatsächlich erreichten Stand nach Implementierung und echtem Backfill — die
ursprüngliche Spec war Planung vor der Umsetzung, dieses Dokument ist der verifizierte
Ist-Zustand danach. Beide Dokumente ergänzen sich; die Spec bleibt für die
methodischen Grundsätze (Zwei-Schichten-Speicherung, Look-Ahead-Bias-Schutz,
Fehlerphilosophie) die Referenz.

## Architektur — wie gebaut

```
CFTC (Socrata-API, gpe5-46if)
        │
        ▼
   cot_layer.py (passiver Data-Collector, GHA-Job cot-weekly.yml)
        │
        ├── Raw Layer        data/cot/raw/{instrument_id}.jsonl
        └── Normalized Layer data/cot/normalized/{instrument_id}.jsonl
                │
                ▼
        Historische Qualitätsprüfung (NÄCHSTER Schritt, s.u. — noch nicht begonnen)
                │
                ▼
        Feature Research (v1-Kennzahlen, s.u. — noch nicht begonnen)
                │
                ▼
        MCM-Validierung: liefert CoT inkrementelle Information
        gegenüber VIX/HY-Spread/MOVE/SKEW-VVIX/Net-Liquidity/Breadth/
        QQQ-Markov/Treasury-Stress? (die eigentliche Forschungsfrage,
        noch nicht beantwortet)
                │
                ▼
        ggf. Integration (Score/MCM/Strategie-Gates) — NICHT Teil von v1.0
```

**Ausdrücklich NICHT:** `CFTC → irgendein CoT-Score → Trading-Signal`. Jede Stufe
oberhalb der Normalized-Layer-Zeile ist noch nicht gebaut.

## Korrektur gegenüber der ursprünglichen Spec

Die historische TFF-Datenabdeckung reicht für die hier verwendeten Instrumente unter
Einbeziehung historischer `market_and_exchange_names` teilweise bis 2006 zurück — aber
nicht über die aktuellen Bezeichnungen allein abrufbar. Die
CFTC hat am 08.02.2022 mehrere Marktbezeichnungen umbenannt (nahtlos, alte Bezeichnung
endet 2022-02-01, neue beginnt 2022-02-08). `cot_layer.py` v1.1 fragt deshalb pro
Instrument ALLE bekannten historischen Bezeichnungen ab (`INSTRUMENT_SOURCE_NAMES`),
nicht nur die aktuelle. Diese Namen wurden 18.09.2026 per Ad-hoc-Recherche gegen echte
Daten gefunden (LIKE-Suche), nicht aus einer offiziellen CFTC-Variablennamen-
Dokumentation — bei Bedarf periodisch gegenprüfen.

**Russell 2000 — historical source overlap preserved intentionally; no source
preference or consolidation applied in Acquisition Layer.** Drei historische
Bezeichnungen (ICE 2008–2018, CME-Zwischenname 2017–2022, aktueller CME-Name ab 2022),
mit einer echten Venue-Überlappung 2017-08-15 bis 2018-06-05 (ICE und CME parallel,
unterschiedliche Open-Interest-Pools). Beide Quellen bleiben in diesem Fenster
erhalten, markiert über `historical_source_overlap=true` — keine "CME ist
richtiger"-Annahme, keine Konsolidierung. Das ist eine spätere, separate
Datenvalidierungsfrage.

## Ergebnis des ersten echten Vollbackfills (18.09.2026, GHA-Runs #1+#2, Commits
`b20b534` + `49f1efe`)

| Instrument | Datensätze | Bezeichnungen | Älteste Beobachtung | Jüngste Beobachtung | Besonderheit |
|---|---|---|---|---|---|
| SP500 | 1057 | 2 | 2006-06-13 | 2026-09-08 | |
| NASDAQ100 | 1057 | 2 | 2006-06-13 | 2026-09-08 | |
| RUSSELL2000 | 990 | 3 | 2008-07-22 | 2026-09-08 | 86 Datensätze im ICE/CME-Overlap-Fenster (Quellen separat erhalten) |
| VIX | 1016 | 1 (Name nie geändert) | 2006-08-29 | 2026-09-08 | |
| UST10Y | 1057 | 2 | 2006-06-13 | 2026-09-08 | |
| UST2Y | 1057 | 2 | 2006-06-13 | 2026-09-08 | |
| **Gesamt** | **6234** | | | | |

6/6 Instrumente vollständig geladen, 5/6 mit ~20 Jahren Historie, keine Fehler, keine
übersprungenen Quellen. Idempotenz praktisch bestätigt: der zweite SP500-Lauf (Run #2,
nach bereits erfolgtem Run #1) erzeugte 0 neue Zeilen, 0 Duplikate.

## Was jetzt belastbar feststeht

- Raw Layer und Normalized Layer sind vorhanden und befüllt
- Idempotenz-Schlüssel (`uiq_instrument_id + market_and_exchange_names + report_date`)
  funktioniert nachweislich, auch im Russell-Überlappungsfall
- Historische Umbenennungen werden korrekt über mehrere Bezeichnungen pro Instrument
  abgedeckt
- `uiq_effective_date_type` (`observed`/`backfill_estimate`) trennt sauber laufenden
  Betrieb von der historischen Näherung
- Workflow (`cot-weekly.yml`) ist automatisiert, `workflow_dispatch` getestet
  (Secrets/Permissions/Pfade im echten Runner verifiziert), für den Samstag-Cron
  vorbereitet
- Commits `b20b534` und `49f1efe` sind reproduzierbar im Repository (`ko-aggregator`)

## Ausdrücklich NICHT Teil von v1.0

- Keine Berechnung von Net Position, Net Position/Open Interest, Percentile,
  4-/12-Wochen-Veränderung oder anderen abgeleiteten Kennzahlen
- Keine Konsolidierung der Russell-ICE/CME-Überlappung
- Keine Integration in MCM, Bayesian Network, HMM, Strategy Gates, Public Digest
  oder AI-Prompts
- Kein CoT-Score, keine Gewichtung, kein Einfluss auf irgendein bestehendes
  UIQ-Ranking

## Nächste Schritte (NICHT jetzt, erst nach einigen Wochen weiterer Wochenläufe)

**Phase 1 — Data Quality / Coverage Analysis** (bevor irgendein Feature gebaut wird):
1. Hat jede der sechs Reihen jeden erwarteten wöchentlichen Report?
2. Gibt es unerwartete zeitliche Lücken?
3. Wie verhalten sich die Russell-ICE/CME-Overlap-Werte zueinander (praktisch
   identisch, systematisch unterschiedlich, oder tatsächlich verschiedene
   Information)?
4. Sind Kategorien und Feldstrukturen über die gesamte Historie stabil?
5. Gibt es Veränderungen der CFTC-Schemata bzw. Marktdefinitionen, die die
   Normalized-Layer-Feldliste (`EXPLICIT_FIELDS`/`PREFIX_FIELDS` in `cot_layer.py`)
   betreffen?

**Phase 2 — Feature Research**, erst nach Phase 1, beschränkt auf die vier vom
Reviewer priorisierten Basis-Kennzahlen (nicht die volle ursprünglich vorgeschlagene
Liste):
6. Net Position
7. Net Position / Open Interest
8. Historisches Perzentil
9. 4-/12-Wochen-Veränderung

**Phase 3 — die eigentliche Forschungsfrage**, erst nach Phase 1+2: Liefert CoT
gegenüber dem bereits vorhandenen MCM (VIX, HY-Spread, MOVE, SKEW/VVIX, Net
Liquidity, Breadth, QQQ-Markov, Treasury Stress) einen messbaren inkrementellen
Informationsgewinn? Nicht "kann man aus CoT ein Signal machen?", sondern "bringt es
UIQ tatsächlich zusätzliche Information?"

**Integrations-Gate:** CoT wird nur dann in einen produktiven UIQ-Baustein übernommen,
wenn ein reproduzierbarer Backtest/Out-of-Sample-Vergleich einen belastbaren
inkrementellen Informationsgewinn gegenüber dem bestehenden MCM zeigt. Andernfalls
bleibt CoT als passive Datenquelle ohne Einfluss auf UIQ-Entscheidungen erhalten —
"nicht signifikant nützlich" ist ein gültiges Forschungsergebnis, CoT muss nicht
zwanghaft in UIQ eingebaut werden.

**Bis dahin:** CoT ruht. Kein Feature-Engineering, keine Anbindung, bis die
Acquisition sich über mehrere reguläre Wochenläufe bewährt hat.
