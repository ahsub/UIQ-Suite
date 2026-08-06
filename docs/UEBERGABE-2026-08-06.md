# ÜBERGABE 2026-08-06 — UIQ Suite + Refundex Session (Abend-Update)

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub + lokal, 06.08.2026 Abend)

| Komponente | Stand | Commit/Ort |
|---|---|---|
| **Frontend (axel-scanner)** | **v453** | `314b475` |
| **Aggregator** | **v5.28.0** | `9da6169` (unverändert) |
| **ko-prompts.js** | **v2.6.0** | `@610192d` (unverändert) |
| **ko-ai Worker** | **v1.9** | `workers/ko-ai.js` (unverändert) |
| **Refundex ROADMAP** | **v1.6** | `db45d98` |
| **Refundex engine/** | `flex_client.py` v1.0.0 | `db45d98` |
| **Refundex workers/** | `ko-flex-proxy.js` v1.0.0 | `db45d98` |
| **Refundex lokal (Mac)** | geklont ✅ | `~/uiq/refundex` |
| **`.env` (Mac)** | konfiguriert ✅ | `~/uiq/refundex/.env` |
| **Flex-Pull** | funktioniert ✅ | `data/flex_test3.xml` |
| **GHA Run** | #192 ✅ success | 05.08. 06:10 UTC |

---

## Was heute passiert ist (Abend-Ergänzung)

### Lokales Setup Mac — vollständig abgeschlossen ✅

- Refundex-Repo korrekt geklont: `~/uiq/refundex`
- `.env` angelegt mit `IB_FLEX_TOKEN` + `IB_FLEX_QUERY_ID=1555982`
- `pip3 install requests python-dotenv` erfolgreich (Python 3.13.1)
- Erster Flex-Pull erfolgreich: `flex_client.py` → 4,9 MB XML in 5 Sekunden

### CapTrader Flex-Query „Steuerauswertung" — neu konfiguriert ✅

Änderungen im Client Portal:
- **Format:** XML ✅ (war bereits XML)
- **Zeitraum:** `Seit Jahresbeginn` (Year to Date) ✅ (war: Last Quarter)
- **Aufschlüsselung nach Tagen:** `Nein` ✅ (war: Ja → hatte 65 Statements erzeugt)
- **Bartransaktionen** (CashTransactions) aktiviert ✅
- **Abgeschlossene Positionen** (ClosedLots): nicht verfügbar bei CapTrader

### Flex-XML Struktur — finale Bestandsaufnahme (`flex_test3.xml`, 4,48 MB)

Verfügbare Sektionen — verifiziert gegen echtes XML:

| Sektion | Einträge | Verwendung |
|---|---|---|
| `Trades` | ~200+ | Fills, P&L, OPT-Lifecycle |
| `OptionEAE` | vorhanden ✅ | Assignment/Expiry/Exercise — **besser als ClosedLots** |
| `CashTransactions` | 129 ✅ | Dividenden + QSt mit `issuerCountryCode` |
| `StmtFunds` | vorhanden | Kapitalflussrechnung |
| `OpenPositions` | vorhanden | aktueller Depotstand |
| `PriorPeriodPositions` | vorhanden | Vorperioden-Positionen |
| `CorporateActions` | vorhanden | Splits, Mergers |
| `ClosedLots` | ❌ nicht verfügbar | bei CapTrader nicht lieferbar |

**Wichtige Erkenntnis `OptionEAE`:**
Liefert Assignment/Expiry/Exercise als Paare:
- OPT-Zeile: die Option (strike, expiry, putCall, transactionType)
- STK-Zeile: die daraus entstehende Aktienposition (costBasis, quantity, tradePrice)

Beispiel CLSK 14P Assignment (16.01.2026): 2 Kontrakte → 200 CLSK zu $14 übernommen.
→ Für Optionsverlaufs-Dokumentation und Journal **ideal**.

**Konsequenz für DATENMODELL_JOURNAL.md:**
- `ClosedLots`-Sektion komplett entfernen
- `OptionEAE` als eigene Datenquelle für Assignments/Expiries ergänzen
- P&L-Quelle: Close-Trades (`openCloseIndicator='C'`, `fifoPnlRealized`)

---

## Offene To-dos für Axel (erledigt / offen)

| # | Aufgabe | Status |
|---|---|---|
| A1 | `git pull` — aktuellen Stand holen | ✅ erledigt |
| A2 | `.env` anlegen mit Token + QueryID | ✅ erledigt |
| A3 | `pip install requests python-dotenv` | ✅ erledigt |
| A4 | Test: `python3 -m engine.flex_client` | ✅ erledigt |
| A5 | Flex-Query auf XML + Sektionen konfigurieren | ✅ erledigt |
| A6 | Worker deployen: `wrangler deploy ko-flex-proxy` | ⏳ offen |
| A7 | `ahsub/ibkr-tax-tool` archivieren | ⏳ offen |

---

## Nächste Session — klare Reihenfolge

**1. `DATENMODELL_JOURNAL.md` korrigieren** (30 min)
- ClosedLots-Sektion entfernen
- OptionEAE als Datenquelle ergänzen
- Feldmapping auf echte XML-Attribute aktualisieren

**2. `parseActivityXML()` in `ko-flex.js`** (Kern-Sprint)
- Datenbasis jetzt vollständig bekannt (echte CapTrader-Struktur)
- Sektionen: Trades + OptionEAE + CashTransactions
- OPT notes-Codes: `Ep`, `A`, `P`, `MLG`, `MLG;P`
- Teilfill-Aggregation über `ibOrderID`

**3. Danach:** `ko-journal.js` Modul (ROADMAP 2.9)

---

## ⏳ Zeitgesteuert

| Wann | Was |
|---|---|
| 09.08. (Sa) | fin:-Backup: erste Shard-Sichtbarkeit |
| ~12.08. | IV-Rank ab 30 Archiv-Tagen automatisch aktiv |
| ~27.08. | IWV Holdings CSV aktualisieren |
| ~01.09. | h30 Track-Record / BN-Analyse / DCE Brier Score |

---

*UIQ Suite + Refundex Übergabe 06.08.2026 Abend (Update)*
*Frontend v453 · Refundex ROADMAP v1.6 · flex_client.py v1.0.0*
*Heute gesamt: TR-Verifikation ✅ · Backlog #19 final ✅ · Flex-Infrastruktur ✅ · Mac-Setup ✅ · Query-Konfiguration ✅*
*Flex-Pull funktioniert vollautomatisch — kein manueller Download mehr nötig!*
