# UIQ CoT Module — Data Acquisition Spec v1.0

**Status:** Spezifikation für einen passiven Data-Collector. Bewusst KEINE Feature-Engineering-,
Score- oder Strategie-Integration — das ist explizit spätere, separate Arbeit (s. Abschnitt 9).
**Datum:** 17.09.2026

## 1. Zweck

Wöchentliche CFTC-Positionierungsdaten (Commitment of Traders, TFF-Report) für einen kleinen,
festen Satz an Finanz-Futures sammeln und roh, unverändert speichern — als Grundlage für eine
spätere, separate Untersuchung, ob diese Daten dem bestehenden UIQ-MCM (VIX, HY-Spread, Net
Liquidity, Breadth, Treasury Stress, QQQ-Markov) einen nachweisbaren zusätzlichen
Informationsgewinn liefern.

**Dieser Schritt trifft noch keine Aussage darüber, ob CoT jemals produktiv genutzt wird.**

## 2. Datenquelle — verifiziert, nicht angenommen

- **API:** CFTC Public Reporting Environment, Socrata-basiert (`publicreporting.cftc.gov`)
- **Dataset:** `gpe5-46if` — TFF (Traders in Financial Futures), Futures Only
- **Authentifizierung:** keine erforderlich (verifiziert: Live-Abfragen ohne Token/Key erfolgreich)
- **Format:** JSON (Socrata-Standard, `$where`/`$select`/`$limit`/`$order`-Query-Parameter)
- **Beispiel-Query (funktioniert nachweislich):**
  ```
  https://publicreporting.cftc.gov/resource/gpe5-46if.json?$where=market_and_exchange_names='E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE'&$order=report_date_as_yyyy_mm_dd DESC&$limit=1000
  ```

## 3. Instrumenten-Universum v1.0 (TFF-only, exakte Namen verifiziert)

| UIQ-Bezug | Exakter `market_and_exchange_names`-Wert (Pflichtfeld für Filter) |
|---|---|
| US Large Cap | `E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE` |
| US Growth/Tech | `NASDAQ MINI - CHICAGO MERCANTILE EXCHANGE` |
| US Small Cap | `RUSSELL E-MINI - CHICAGO MERCANTILE EXCHANGE` |
| Volatilität | `VIX FUTURES - CBOE FUTURES EXCHANGE` |
| Zinsen lang | `UST 10Y NOTE - CHICAGO BOARD OF TRADE` |
| Zinsen kurz | `UST 2Y NOTE - CHICAGO BOARD OF TRADE` |
| USD-Kontext | *pending* — `DOLLAR INDEX`-Suche noch nicht bestätigt; als 7. Instrument nachziehen, sobald der exakte Name verifiziert ist. **Blockiert v1.0 nicht.** |

**Ausdrücklich NICHT in v1.0:** Gold, Crude Oil, andere Rohstoffe. Diese laufen bei der CFTC über
den **Disaggregated Report** (anderer Endpoint, andere Kategorien: Producer/Merchant, Swap
Dealer, Managed Money statt Dealer/Asset Manager/Leveraged Money) — ein anderes Klassifikations-
schema, das v1.0 nicht vermischen soll. Vorgesehen als eigenständiges v1.1, erst nach einer
positiven v1.0-Validierung.

## 4. Zwei-Schichten-Speicherung — Raw Layer + Normalized Layer

**Grund für die Trennung:** Bei einer externen API kann sich das Schema ändern (neues Feld, Feld
umbenannt). Wenn nur vorab ausgewählte Felder gespeichert würden, wäre eine spätere Schema-
Änderung ein Problem — die Originalantwort wäre nicht mehr rekonstruierbar. Für einen
Ein-Personen-Betrieb ist die robustere Lösung, beide Ebenen zu halten:

### Raw Layer (`cot_raw`)

Die **unveränderte, komplette CFTC-API-Antwort** pro Zeile, als JSON-Blob gespeichert
(`raw_cftc_json`), plus reine UIQ-Metadaten:

```
raw_cftc_json          — die komplette, unveränderte API-Antwort dieser Zeile
uiq_instrument_id      — s. Abschnitt 5 (stabiler interner Bezeichner)
uiq_fetched_at         — Zeitstempel des tatsächlichen Abrufs (ISO 8601, UTC)
```

### Normalized Layer (`cot_tff_weekly`)

Die bekannten, tatsächlich benötigten Felder aus der Rohantwort geparst, für den praktischen
Zugriff in der späteren Research-Phase — u.a.:

```
uiq_instrument_id, report_date_as_yyyy_mm_dd, market_and_exchange_names,
open_interest_all,
dealer_positions_long_all, dealer_positions_short_all, dealer_positions_spread_all,
asset_mgr_positions_long, asset_mgr_positions_short, asset_mgr_positions_spread,
lev_money_positions_long, lev_money_positions_short, lev_money_positions_spread,
other_rept_positions_long, other_rept_positions_short, other_rept_positions_spread,
nonrept_positions_long_all, nonrept_positions_short_all,
change_in_open_interest_all, change_in_dealer_long_all, ... (alle change_in_*-Felder),
pct_of_open_interest_all, pct_of_oi_* (alle),
traders_tot_all, traders_* (alle),
conc_gross_le_4_tdr_long, conc_gross_le_8_tdr_long, ... (alle conc_*-Felder),
contract_units, futonly_or_combined,
uiq_fetched_at, uiq_effective_date, uiq_effective_date_type   — s. Abschnitt 6
```

Die normalisierte Tabelle wird aus dem Raw Layer abgeleitet (kann bei Bedarf komplett neu
generiert werden, ohne erneuten API-Abruf) — der Raw Layer bleibt die eigentliche
Quelle der Wahrheit.

## 5. Stabile interne Instrument-IDs und Idempotenz-Schlüssel

Die rohen CFTC-Namen (`market_and_exchange_names`) bleiben im Raw Layer unverändert erhalten —
aber intern verwendet UIQ einen stabilen, kurzen Bezeichner, damit sich die CFTC-Namensgebung
später ändern kann, ohne die interne Struktur zu beschädigen:

| `uiq_instrument_id` | `market_and_exchange_names` (Raw, unverändert) |
|---|---|
| `SP500` | `E-MINI S&P 500 - CHICAGO MERCANTILE EXCHANGE` |
| `NASDAQ100` | `NASDAQ MINI - CHICAGO MERCANTILE EXCHANGE` |
| `RUSSELL2000` | `RUSSELL E-MINI - CHICAGO MERCANTILE EXCHANGE` |
| `VIX` | `VIX FUTURES - CBOE FUTURES EXCHANGE` |
| `UST10Y` | `UST 10Y NOTE - CHICAGO BOARD OF TRADE` |
| `UST2Y` | `UST 2Y NOTE - CHICAGO BOARD OF TRADE` |
| `DXY` | *pending* — sobald `DOLLAR INDEX`-Name bestätigt |

**Idempotenz-Schlüssel:** `uiq_instrument_id + report_date_as_yyyy_mm_dd` (nicht `report_date`
allein — dieselbe CFTC-Tabelle enthält viele Märkte, ein Report-Date taucht pro Woche einmal je
Instrument auf, nicht einmal insgesamt). Ein Instrument darf für ein bestimmtes Report-Date genau
einmal vorhanden sein; ein wiederholter Lauf in derselben Woche darf keine Duplikate erzeugen.

## 6. Look-Ahead-Bias-Schutz — zwingend, nicht optional

CoT-Daten beschreiben die Positionierung zum **Dienstag**, werden aber typischerweise erst
**Freitag** veröffentlicht. Ein UIQ-Lauf am Mittwoch oder Donnerstag darf die Dienstagsdaten
NICHT so behandeln, als wären sie zum Zeitpunkt ihres `report_date` bereits verfügbar gewesen.

**Regel:** `uiq_effective_date` = Datum, ab dem UIQ die Daten als verfügbar behandelt (nicht
`report_date_as_yyyy_mm_dd`). Jede spätere Backtest-/Research-Nutzung dieser Daten muss
`uiq_effective_date` verwenden, niemals `report_date_as_yyyy_mm_dd`, um zu bestimmen, ab wann ein
Datenpunkt für eine historische Simulation "bekannt" gewesen wäre.

**Wichtige Präzisierung (17.09.2026):** `report_date + 3 Tage` ist NICHT als harte, allgemeingültige
Regel zu verstehen — "Freitag" ist nicht dasselbe wie "Report-Date + 3 Kalendertage", und die
tatsächliche Veröffentlichungszeit ist relevant, aber im historischen Datensatz nicht bekannt. UIQ
darf für vergangene Daten nicht behaupten, einen exakten Release-Zeitpunkt zu kennen, den es
tatsächlich nicht kennt. Deshalb zusätzliches Pflichtfeld:

```
uiq_effective_date_type ∈ { "observed", "backfill_estimate" }
```

- **`observed`:** für den laufenden wöchentlichen Betrieb (Abschnitt 7) — `uiq_effective_date` =
  tatsächlicher UIQ-Abrufzeitpunkt (`uiq_fetched_at`), da hier real beobachtet, nicht geschätzt.
- **`backfill_estimate`:** für den initialen historischen Vollimport (Abschnitt 7) —
  `uiq_effective_date` = `report_date_as_yyyy_mm_dd + 3 Kalendertage` als konservative Näherung,
  **explizit als Schätzung markiert**, nicht als beobachtete Tatsache.

Diese Trennung verhindert, dass eine heutige technische Näherung in einer späteren Research-Phase
versehentlich als historische Tatsache behandelt wird — die Research-Phase kann bei Bedarf gezielt
nur mit `observed`-Daten arbeiten, falls die Backfill-Schätzung sich als zu ungenau erweist.

**Für den initialen historischen Vollimport (Abschnitt 7):** s.o., `backfill_estimate` mit
`report_date + 3 Tage`.

## 7. Initialer Vollimport vs. laufender Betrieb

**Einmaliger Vollimport:** Komplette verfügbare Historie pro Instrument laden (TFF-Report-Historie
reicht laut CFTC-Dokumentation bis 2006 zurück), nicht erst ab heute sammeln. Das liefert sofort
eine ~20-jährige Zeitreihe für die spätere Research-Phase, statt Monate auf ausreichend Daten zu
warten.

**Laufender Betrieb danach:** Wöchentlicher Lauf (CFTC veröffentlicht freitags) — reicht als
eigener, kleiner Schritt im bestehenden GHA-Workflow, unabhängig vom täglichen Aggregator-Lauf.
Pro Lauf: neueste verfügbare Woche pro Instrument abrufen, nur anhängen wenn `report_date_as_yyyy_
mm_dd` noch nicht vorhanden ist (Idempotenz — ein doppelter Lauf in derselben Woche darf keine
Duplikate erzeugen).

## 8. Fehlerbehandlung

- Pro Instrument einzeln abrufen und einzeln behandeln — ein Fehler bei einem Instrument (z.B.
  Netzwerk-Timeout) darf die übrigen sechs nicht blockieren (gleiches Prinzip wie an anderen
  Stellen im Aggregator, z.B. Fundamental-Enrichment mit try/except je Ticker).
- Bei leerer/fehlender API-Antwort für ein Instrument: Lauf loggen und fortsetzen, nicht
  abbrechen — analog zum bestehenden `⚠️`-Logging-Muster im Aggregator.
- Keine Retry-Logik über einen einzelnen erneuten Versuch hinaus nötig — CoT-Daten sind nicht
  zeitkritisch (wöchentlich, kein Public-Digest-Bezug), ein fehlender Wochenpunkt kann beim
  nächsten Lauf nachgeholt werden.

## 9. Ausdrücklich NICHT Teil dieser Spec

- Keine Berechnung von Net Position, Percentile, Velocity, Divergence, Crowding oder irgendeinem
  anderen abgeleiteten Feature — das ist die nächste, separate Phase, erst nach Abschluss dieser
  Datenerfassung.
- Keine Integration in MCM, Bayesian Network, HMM, Strategy Gates, Public Digest oder AI-Prompts.
- Kein CoT-Score, keine Gewichtung, kein Einfluss auf irgendein bestehendes UIQ-Ranking.
- Keine Behandlung von Gold/Crude Oil/Disaggregated-Report-Daten (s. Abschnitt 3).

## 10. Nächster Schritt nach Abschluss dieser Spec

Erst wenn die historische Zeitreihe vollständig geladen und die wöchentliche Fortschreibung
zuverlässig läuft: **separate** Feature-Engineering-Phase, beschränkt auf die vier vom Reviewer
priorisierten Basis-Kennzahlen (Net Position, Net Position/Open Interest, historisches Perzentil,
4-/12-Wochen-Veränderung) — nicht die volle ursprünglich vorgeschlagene Kennzahlen-Liste
(Divergence/Crowding/Acceleration folgen erst, falls die Basis-Kennzahlen überhaupt etwas zeigen).
