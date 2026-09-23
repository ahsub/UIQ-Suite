# TICKER_MASTER-Migration — Phase A+B: Ergebnis und Phase C: Plan

**Datum:** 23.09.2026
**Status:** Phase A + B abgeschlossen und verifiziert. Phase C bewusst zurückgestellt — eigene Session.
**Ausgangspunkt:** Ursprünglicher Wunsch nach einem Skript zum einfachen Hinzufügen neuer Ticker (Dedup + korrekte Sektorzuordnung, ggf. mehrfach). Beim Klären der Vorfrage ("wie viele unabhängige Stellen gibt es überhaupt?") stellte sich heraus, dass `market_aggregator.py` bereits selbst einen Migrationswunsch dokumentiert: *"Mittelfristig (eigene Session): Migration zu `TICKER_SECTOR_MAP` als echter Single Source of Truth."*

---

## 1. Kernbefund — was jetzt als gesichert gelten kann

**`TICKER_MASTER` ist eine nachweislich verlustfreie Abbildung des aktuellen Zustands.** Nicht nur als Architekturentwurf — durch fünf konkrete, gegen die echte `market_aggregator.py` gelaufene Tests belegt:

| Test | Ergebnis |
|---|---|
| 1. Universe (OLD vs. NEW) | 679 = 679 ✅ |
| 2. Sector Tags (OLD vs. NEW) | 217 Ticker geprüft, identisch ✅ |
| 3. Leaderboard Tags (OLD vs. NEW) | 561 Ticker geprüft, identisch ✅ |
| 4. Pro-Ticker-Volldatensatz-Diff | 818 Ticker geprüft, alle identisch ✅ |
| 5. Mutationstest (synthetischer Test-Ticker) | 4/4 Propagationen korrekt ✅ |

Damit ist die ursprüngliche Architekturfrage im Wesentlichen beantwortet: **Die drei bisher getrennten ticker-abhängigen Strukturen (Scan-Universum, thematische Sektor-Tags, Leaderboard-Kategorisierung) lassen sich aus einer einzigen gemeinsamen Masterstruktur reproduzieren, ohne das aktuelle Verhalten zu verändern.**

Test 5 ist dabei der eigentlich wichtigste Beweis — er zeigt nicht nur, dass die Migration des Ist-Zustands gelingt, sondern dass die neue Architektur *funktioniert*: Ein synthetisch hinzugefügter Ticker propagiert korrekt in Universum und Sektor-Tags, rein aus `TICKER_MASTER` abgeleitet.

---

## 2. Warum Phase A 767 und Phase B 818 Ticker zeigt — kein Widerspruch

**Phase A** erfasste die tatsächlichen Scan-Universumsquellen (die Listen, die `build_ticker_universe()`s `all_sources` speisen) plus die thematischen Sektor-Watchlists — insgesamt 767 Ticker.

**Phase B** erfasst zusätzlich sechs Listen, die **ausschließlich für die Leaderboard-Kategorisierung** verwendet werden, nicht für die Scan-Universums-Aufnahme selbst: `DAX40_TICKERS`, `MDAX_TICKERS`, `TECDAX_TICKERS`, `EUROSTOXX_TICKERS_LEGACY`, `FTSE100_TICKERS`, `STOXX_EU_EXTRA`. Deshalb umfasst die Master-Inventur in Phase B 818 Ticker, während das tatsächliche Scan-Universum weiterhin 679 Ticker enthält (nur der statische Anteil — ohne die zur Laufzeit aus Cloudflare KV/CSV nachgeladenen dynamischen Quellen `fetch_approved_extra_tickers()`/ex-IWV-Ticker).

**Kurz:** 679 = tatsächlich gescannte Ticker. 767 = Phase-A-Inventur (Universum + Sektoren). 818 = Phase-B-Inventur (zusätzlich die sechs reinen Leaderboard-Listen). Keine der drei Zahlen ist falsch — sie messen unterschiedliche Mengen.

---

## 3. Wichtiger struktureller Befund — bewusst nicht korrigiert, nur dokumentiert

**Known structural inconsistency: Leaderboard-only membership without scan-universe membership.**

Sechs Listen (`DAX40_TICKERS`, `MDAX_TICKERS`, `TECDAX_TICKERS`, `EUROSTOXX_TICKERS_LEGACY`, `FTSE100_TICKERS`, `STOXX_EU_EXTRA`) enthalten Ticker, die größtenteils **nicht** im tatsächlichen Scan-Universum stehen:

| Liste | Mitglieder gesamt | Davon NICHT im Scan-Universum |
|---|---|---|
| DAX40_TICKERS | 40 | 27 |
| MDAX_TICKERS | 34 | 29 |
| TECDAX_TICKERS | 19 | 14 |
| EUROSTOXX_TICKERS_LEGACY | 29 | 27 |
| FTSE100_TICKERS | 40 | 33 |
| STOXX_EU_EXTRA | 23 | 22 |

Der reale Leaderboard-Code filtert `[r for r in results if r["sym"] in DAX40_TICKERS]` — `results` enthält aber nur tatsächlich gescannte Ticker. Für die meisten "eigentlichen" Mitglieder dieser sechs Listen bleibt der jeweilige Leaderboard-Tab damit praktisch leer.

**In `TICKER_MASTER` (Phase B) korrekt und unverändert abgebildet:**
```text
TICKER_MASTER["ADS.DE"]
   ├── in_universe = false
   └── leaderboard_tags = ["dax40"]
```

Das kann historisch durchaus so gewollt entstanden sein (z. B. als vorbereitete Liste für ein noch nicht umgesetztes Feature) — das ist an dieser Stelle nicht bewertet. Wichtig ist die empirische Feststellung selbst, und dass Test 4 (Pro-Ticker-Volldiff) diesen Zustand korrekt reproduziert hat, statt ihn heimlich zu "reparieren". Eine Entscheidung, ob/wie das behoben wird, ist bewusst **nicht** Teil dieser Migration.

---

## 4. Methodik — wie Phase A und B zu diesem Ergebnis kamen

Beide Phasen arbeiten **read-only** gegen `market_aggregator.py`: Die Ticker-Listen werden per Python-`ast`-Modul aus dem Quelltext extrahiert (kein `import`, keine Ausführung, keine Seiteneffekte) — sicher für eine 12.068-Zeilen-Produktionsdatei mit Netzwerk-Calls an anderer Stelle.

**Phase A** (`audit_ticker_sources.py`) klassifiziert jeden Ticker in drei Klassen (Eindeutig / Mehrfach-aber-gewollt / Echter Konflikt) und wurde dabei zweimal gegen synthetische Testfälle verifiziert, bevor das reale Ergebnis (0 Konflikte bei 767 Tickern) als belastbar galt. Ein Selbstkorrektur-Fund währenddessen: `CEG` zeigte zunächst fälschlich `universes: []`, weil Mitgliedschaft in `SECTOR_WATCHLISTS` selbst eine Universums-Quelle ist (`market_aggregator.py`, Zeile 2182) — im Skript nachgezogen, bevor die Schlussfolgerung gezogen wurde.

**Phase B** (`migrate_ticker_master_phase_b.py`) generiert `TICKER_MASTER` automatisch aus denselben Rohquellen (nicht von Hand geschrieben) und vergleicht die daraus abgeleiteten Strukturen gegen das originale Verhalten — exakte Mengen-/Mapping-Gleichheit, nicht nur Anzahl, plus ein Pro-Ticker-Volldatensatz-Diff und ein Mutationstest.

**Dateien (dieser Stand, nicht committed — liegen als Download vor):**
- `audit_ticker_sources.py` — Phase-A-Skript
- `audit_result.json` — vollständiges Phase-A-Ergebnis (767 Ticker, 3 Klassen)
- `migrate_ticker_master_phase_b.py` — Phase-B-Skript
- `ticker_master.json` — generierter `TICKER_MASTER`-Datensatz (818 Ticker)

---

## 5. Phase C — geplantes Vorgehen (nächste Session, NICHT heute)

Phase C ist qualitativ etwas anderes als A/B: Bis hierhin lief alles read-only, ohne Wirkung auf den produktiven Nachtlauf. Phase C ändert `market_aggregator.py` selbst — die erste Phase, in der ein Fehler tatsächlich den nächsten GHA-Lauf beeinflussen kann.

```text
Phase A: Ist-Zustand untersuchen        → SAFE (read-only)
Phase B: Ist-Zustand reproduzieren      → SAFE (read-only, kein Produktivcode geändert)
Phase C: Produktivcode umstellen        → ERSTE PHASE MIT ECHTEM RISIKO
```

**Geplante Schritte für Phase C:**

1. `TICKER_MASTER` wird Single Source of Truth
2. Bestehende Listen (`SP500_TICKERS`, `SECTOR_WATCHLISTS` etc.) werden zunächst nur noch **abgeleitet**, nicht mehr von Hand gepflegt
3. `build_ticker_universe()` liest den Master
4. Sector Tags werden aus dem Master erzeugt
5. Leaderboard Tags werden aus dem Master erzeugt
6. Die bisherigen Listen bleiben zunächst als **Compatibility Layer** bestehen, falls andere Funktionen sie noch referenzieren
7. Erneuter `OLD == NEW`-Vergleichstest — diesmal gegen den tatsächlich umgestellten Produktivcode, nicht nur gegen ein separates Migrationsskript
8. Erst danach alte statische Quellen entfernen
9. Lokaler End-to-End-Test
10. Erst dann echter GHA-/Nachtlauf

**Erst wenn Phase C stabil läuft**, wird das ursprünglich gewünschte Ticker-Editierskript gebaut (`add_ticker.py`) — dann aber deutlich einfacher als ursprünglich gedacht:

```text
add_ticker.py → TICKER_MASTER → alles andere automatisch abgeleitet
```

Damit wäre das ursprüngliche Ziel erreicht: neue Ticker einfach hinzufügen, redundante Einträge automatisch verhindern, beliebig viele thematische Zuordnungen pflegen — ohne mehrere Stellen im 12.000-Zeilen-Skript von Hand anfassen zu müssen.

---

## 6. Offene Punkte für die nächste Session

- Phase C selbst (s. Abschnitt 5)
- Entscheidung zum DAX40/MDAX/TECDAX/FTSE100/EuroStoxx-Befund (Abschnitt 3) — beheben, bewusst so belassen, oder erst später bewerten
- Das ursprünglich gewünschte `add_ticker.py`-Editierskript (nach Phase C)
- Fachliche Neubewertung der Sektor-Tag-Zuordnung für die bislang ungetaggten Ticker (separates Thema, ausdrücklich nicht Teil dieser Migration)
