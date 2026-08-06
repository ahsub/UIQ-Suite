# ÜBERGABE 2026-08-06 — UIQ Suite + Refundex Session

## ⚠️ ÜBERGABE-HEADER-REGEL
Alle Angaben sind **unverified** bis zur eigenständigen Bestätigung.
Claude muss proaktiv fragen: **„hast du das verifiziert oder übernommen?"**

---

## Verifizierbarer Stand (GitHub, 06.08.2026 Abend)

| Komponente | Stand | Commit |
|---|---|---|
| **Frontend (axel-scanner)** | **v453** | `314b475` |
| **Aggregator** | **v5.28.0** | `9da6169` (unverändert) |
| **ko-prompts.js** | **v2.6.0** | `@610192d` (unverändert) |
| **ko-ai Worker** | **v1.9** | `workers/ko-ai.js` (unverändert) |
| **Refundex ROADMAP** | **v1.6** | `db45d98` |
| **Refundex engine/** | `flex_client.py` v1.0.0 | `db45d98` |
| **Refundex workers/** | `ko-flex-proxy.js` v1.0.0 | `db45d98` |
| **GHA Run** | #192 ✅ success | 05.08. 06:10 UTC (letzter Lauf) |

---

## Was heute passiert ist

### UIQ — Verifikation + Cleanup

**P1 — ko-trackrecord.js Frontend-Verifikation ✅**
- CDN-Hash `@e4f93297` in index.html = letzter ko-modules-Commit → aktuell ✅
- EIC-Guard doppelt abgesichert (Tab unsichtbar + Panel nie direkt erreichbar) ✅
- `tr:stats` KV-Zugriff korrekt über `window.TrackRecord.load()` ✅
- DOM vollständig: `tr-matrix-container`, Refresh-Button, `switchAlphaTab` ✅
- **Kein Fix nötig.** Frontend ist bereit für h30-Daten (~01.09.)

**P2 — Backlog #19 finaler Abschluss ✅ → Frontend v453 (`314b475`)**
- 2 redundante `/* fix #19: war preset-select */`-Kommentare entfernt
- Z.17315: OR-Fallback-Tautologie (`getElementById() || getElementById()`) bereinigt
- Z.24931: Herkunftskommentar entfernt
- Changelog-Eintrag v453 committed
- **Backlog #19 vollständig geschlossen** (v412 Migration → v452 Dead-Code → v453 Kommentare)

### Refundex — Architektur + Infrastruktur-Sprint

**P3 — Datenmodell + ROADMAP (`e195e1f`)**
- `docs/DATENMODELL_JOURNAL.md` v1.0: vollständiges JSON-Schema für Trade-Journal
  (automatische Felder aus Flex-XML + manuelle subjektive Dimension)
- `docs/ROADMAP.md` v1.5 → v1.6: Items 2.8–2.11 ergänzt

**Flex-XML Analyse (echte CapTrader-Daten 2023–2026)**

Kritische Erkenntnisse aus 4 XML-Files:
- **Keine `ClosedLots`-Sektion** vorhanden (war Annahme in DATENMODELL) → P&L kommt aus
  Close-Trades (`openCloseIndicator='C'`, `fifoPnlRealized`)
- **OPT notes-Codes** entschlüsselt: `Ep`=Verfall, `A`=Assignment, `P`=Combo-Teil, `MLG`=Manual Leg
- **Teilfills** über `ibOrderID` aggregieren (nicht `tradeID`)
- **Quellensteuer** vorhanden: `FRTAX`-Einträge in `StmtFunds` (Brutto-DIV + FRTAX = Netto)
- `DATENMODELL_JOURNAL.md` muss ClosedLots-Sektion korrigiert werden (nächste Session)

**Empfohlene Flex-Query-Anpassungen (noch nicht umgesetzt — Axel macht zuhause):**
- Format auf **XML** umstellen (falls noch CSV)
- Sektion **`ClosedLots`** aktivieren → fertig gematchte FIFO-Paare
- Sektion **`CashTransactions`** aktivieren → Dividenden mit `country`-Feld direkt

**`engine/flex_client.py` v1.0.0 (`db45d98`)**
- Zwei-Schritt-Pull: SendRequest → ReferenceCode → GetStatement + Retry-Logik
- Credentials aus `.env` (`IB_FLEX_TOKEN`, `IB_FLEX_QUERY_ID`), nie im Code
- CLI: `python -m engine.flex_client --output data/flex_latest.xml`
- `engine/requirements.txt` aktualisiert (requests + python-dotenv)
- `.env.example` als Vorlage committed

**`workers/ko-flex-proxy.js` v1.0.0 (`db45d98`)**
- Cloudflare Worker als CORS-Bridge für Browser-Pull
- `POST /flex` mit `{ token, queryId }` → XML-Rückgabe
- Rate-Limit 10 Req/h, Token-Maskierung, `GET /health`
- Deployment: `wrangler deploy workers/ko-flex-proxy.js --name ko-flex-proxy`

**ibkr-tax-tool (`ahsub/ibkr-tax-tool`) — Python-Sandkasten**
- Befund: nur Scaffolding (2 Commits vom 05.08.), kein echter Steuer-Code
- Entscheidung: **archivieren** (GitHub Settings → Archive)
- Fachlich vollständig in Refundex aufgegangen

---

## Offene To-dos für Axel (zuhause am Mac)

| # | Aufgabe | Wo |
|---|---|---|
| A1 | `cd refundex && git pull` — aktuellen Stand holen | Terminal |
| A2 | `cp .env.example .env` → Token + QueryID aus CapTrader Client Portal eintragen | Terminal/Editor |
| A3 | `pip install requests python-dotenv` | Terminal |
| A4 | Test: `python -m engine.flex_client --output data/flex_test.xml` | Terminal |
| A5 | Flex-Query in CapTrader auf **XML** umstellen + `ClosedLots` + `CashTransactions` aktivieren | IBKR Client Portal |
| A6 | Worker deployen: `wrangler deploy workers/ko-flex-proxy.js --name ko-flex-proxy` | Terminal |
| A7 | `ahsub/ibkr-tax-tool` archivieren (GitHub → Settings → Archive) | GitHub Web |

---

## Offene UIQ Backlog-Punkte (Prioritäten)

| Prio | Item | Status |
|---|---|---|
| 🔴 | **AVP (Anchored Volume Profile)** — nächster geplanter Sprint | noch nicht gestartet |
| 🔴 | **`parseActivityXML()`** in `ko-flex.js` (ROADMAP 2.8) | Stub vorhanden |
| 🟡 | Backlog #27 Mindest-Volumen-Filter AVWAP/OB-Detector | niedrige Prio |
| 🟡 | Backlog #16 Calendar-Buffer strategie-spezifisch | Track-Record-getriggert |
| 🟡 | Backlog #22 sizingMultiplier Strategie-Ampel | nach Track-Record-Review |
| 🟡 | VCP Sprint 2 — Volumen-Bestätigung | nach Sprint-1-Praxiserfahrung |
| 🔵 | `DATENMODELL_JOURNAL.md` korrigieren (ClosedLots-Sektion raus) | nächste Refundex-Session |
| 🔵 | ko-journal.js Modul implementieren (ROADMAP 2.9) | nach 2.8 + 2.10 |
| ⏳ | h30 Track-Record reift | ~01.09.2026 |
| ⏳ | IWV Holdings CSV aktualisieren | ~27.08.2026 |

---

## ⏳ Zeitgesteuert

| Wann | Was |
|---|---|
| 09.08. (Sa) | fin:-Backup: erste Shard-Sichtbarkeit nach finArchive-Fix |
| ~12.08. | IV-Rank ab 30 Archiv-Tagen automatisch aktiv |
| ~27.08. | IWV Holdings CSV aktualisieren (ishares.com → IWV → Holdings → CSV) |
| ~01.09. | h30 Track-Record / BN-Analyse / DCE Brier Score |
| ~01.10. | MCM-HMM |

---

*UIQ Suite + Refundex Übergabe 06.08.2026 Abend*
*Frontend v453 · Refundex ROADMAP v1.6 · flex_client.py v1.0.0 · ko-flex-proxy v1.0.0*
*Heute: Verifikation TR-Frontend ✅ · Backlog #19 final ✅ · Journal-Datenmodell · Flex-XML-Analyse · Pull-Infrastruktur gebaut*
