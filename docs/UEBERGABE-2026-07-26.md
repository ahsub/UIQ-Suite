# ÜBERGABE 2026-07-26 (Sonntag)

## ⚠️ UEBERGABE-HEADER-REGEL

Alle Aussagen in diesem Dokument sind **unverifizierte Behauptungen einer
vergangenen Session**, bis sie in der neuen Session unabhängig bestätigt
wurden. Claude muss beim Wiedergeben dieser Inhalte proaktiv daran erinnern:
**„hast du das verifiziert oder übernommen?"**

Aussagen sind unten explizit markiert:
- **[V]** = in dieser Session gegen echte Daten/Logs verifiziert
- **[U]** = unverifiziert / nur committet, nicht in Betrieb bestätigt

---

## 0. Session-Start-Checkliste

- [ ] PAT vom 26.07. revoken, neues Session-PAT anlegen
- [ ] **IWV-Holdings-CSV überfällig** — `ahsub/ko-aggregator/data/iwv_holdings.csv`
      zuletzt 02.07.2026 aktualisiert. August-Update aus iShares-Produktseite fällig.
- [ ] Ergebnis des nächsten Nachtlaufs prüfen (siehe §5)

---

## 1. Kernergebnis des Tages

Ausgangspunkt war ein Feature-Wunsch (Aggregator-Daten für ein Zweitprojekt
nutzbar machen). Der eigentliche Ertrag liegt woanders: **zwei echte Bugs im
Track-Record-Layer** — dem einzigen nicht regenerierbaren Datenbestand des
Systems — wurden gefunden und behoben. Beide lagen seit Wochen latent.

Die Feature-Arbeit selbst erwies sich am Ende als weitgehend überflüssig
(siehe §4).

---

## 2. Behobene Bugs

### 2.1 `tr:eval` — Serialisierungsfehler **[V]**

**Symptom (Log #154):**
```
[TR] kv_put(tr:eval:2026-07-09) fehlgeschlagen:
     Object of type date is not JSON serializable
```

**Ursache:** `tr_layer.py` Z.371 schrieb `out["exitDate"] = dates[exit_i]`.
`dates` stammt aus Z.275 (`[d.date() for d in cl.index]`) und enthält
`datetime.date`-Objekte, die `json.dumps()` in `kv_put()` nicht serialisieren
kann.

**Fix:** `.isoformat()` → Commit `332d6c2b`

**Verifiziert in Run #155:**
```
[TR] Bewertet 2026-07-09: Horizonte [7] | 60 Empfehlungen
[TR] Bewertet 2026-07-10: Horizonte [7] | 60 Empfehlungen
[TR] ✅ Evaluation: 2 Tag(e) | tr:stats: 6 Zellen aktualisiert
```

**Schadensumfang:** 2 Tage, nur Horizont h7. Deutlich kleiner als zunächst
angenommen. Track Record ist wieder lückenlos.

> **Merke für künftige Diagnosen:** Aus dem Datum im Key (`tr:eval:2026-07-09`)
> darf **nicht** auf den Ausfallzeitpunkt geschlossen werden. Der Fehler trat
> erst auf, als h7 für diesen Tag fällig wurde — also ~20.07., nicht 09.07.

### 2.2 `tr:index` — Flag-Reihenfolge (latent) **[V, vorbeugend]**

**Gefunden beim Lesen von `evaluate_open_days()`.** Der Code setzte:

```python
for H in due:
    drec[f"h{H}"] = True        # ← VOR dem Write
if kv_put(f"tr:eval:{d}", ev):
    changed.append(d)
...
kv_put("tr:index", index)       # ← persistiert ALLE Flags
```

Bei gemischtem Batch (ein Tag erfolgreich, einer nicht) wurden die
Horizont-Flags auch für den **gescheiterten** Tag persistiert. Dieser gilt
dann dauerhaft als bewertet, hat aber keinen `tr:eval`-Key →
**stille, irreversible Lücke im Track Record.**

Bisher nicht eingetreten (nur ein Tag war fällig, `changed` blieb leer,
`tr:index` wurde nicht geschrieben). Wäre nach Fix 2.1 beim ersten
gemischten Batch aufgetreten.

**Fix:** Flags nur im erfolgreichen `kv_put`-Zweig, plus Warnung im `else`.
Commit `332d6c2b`.

> Der Pfad „kein Snapshot vorhanden → abhaken statt ewig retryen" bleibt
> bewusst unverändert.

---

## 3. Frontend: erweitertes KV-Mapping **[U — Browser-Test steht aus]**

`master_market_data.tickers` enthält bereits das vollständige `results[]`
(101 Felder/Ticker). `kvToScannerState()` reichte davon aber nur einen Teil
in den State durch. **36 Felder waren vorhanden, aber unerreichbar.**

Ergänzt in **beiden** `kvToScannerState()`-Instanzen (Scanner + Value-Tab):

| Gruppe | Felder |
|---|---|
| VCP | `vcpDetected`, `vcpContractions`, `vcpLastPct`, `vcpAvgPrevPct`, `vcpVolContraction`, `vcpBreakoutVol`, `tightnessPct` |
| EMA/SMA | `sma150`, `ema200SlopeUp` |
| MACD | `macdLine`, `macdSignal` |
| KSI | `ksi`, `ksiSignal`, `ksiSpike`, `ksiRatio` |
| ICS | `icsDirection`, `icsAngle`, `icsConsensus`, `icsConsBull/Bear`, `icsChUpper/Lower`, `icsBoState`, `icsChannelPos` |
| Distanz | `dist50`, `dist200`, `nearestSellStopPct`, `nearestBuyStopPct` |
| Performance | `perf6m`, `perfRsRaw` |
| Volumen/Risiko | `avgVol20`, `bullPct`, `warnLevel`, `squeezeRisk` |
| Sektor | `sectors` |

**Praktische Folge:** Im VCP-Leaderboard waren `vcpVolContraction` und
`vcpBreakoutVol` bereits referenziert, kamen aber als `undefined` an.

Commit `d1fcc81e`, Version-Tag `bfdce748` → **v403**.

---

## 4. Market Snapshot — Rückblick und Bewertung

### Was gebaut wurde **[V]**

`_write_market_snapshot()` schreibt nach jedem Lauf zwei KV-Keys:
- `market-snapshot-{tday}` (letzter Handelstag)
- `market-snapshot-latest` (Alias, immer aktuellster Lauf)

Der Alias-Key war die Antwort auf die Wochenend-/Feiertagsfrage: kein
Sonderfall-Code nötig, `latest` zeigt immer auf den letzten erfolgreichen
Lauf. Das Feld `tday` im Payload nennt den echten Handelstag.

Verifiziert in Log #154:
```
✅ KV-Upload erfolgreich! (key=market-snapshot-2026-07-24)  844.8 KB
✅ KV-Upload erfolgreich! (key=market-snapshot-latest)      844.8 KB
[MARKET] _write_market_snapshot returned: True
```

### Schema v3 **[U — committet, noch nicht deployed]**

Commit `11ee8926`. Im KV liegt aktuell noch **v2**. Der nächste Lauf
deployed v3.

- **Raus (8 Felder, im Aggregator nie berechnet, konstant `null`):**
  `ema20`, `sma50`, `sma200`, `adx`, `macd`, `bbWidth`, `sector`, `marketCap`
- **Rein:** `scoreCsp`/`scoreCc`, `ivAtm`/`ivDte`/`ivExpiry`,
  `chanHigh3sd`/`chanLow3sd`, `high52`/`low52`/`pctFromHigh52`,
  `nearestSellStopPct`/`nearestBuyStopPct`, `dist50`/`dist200`,
  `warnLevel`/`overheat`, `sma150`/`ema200SlopeUp`, `macdLine`/`macdHist`,
  `bbPos`, `hv10`, `volRatio`, `avgVol20`, `grade`
- Per-Ticker-`timestamp` entfernt (700× identisch, steht im Header als `run`)
- `patternEntry` entfernt (für Optionen ohne Wert)

Netto: **40 Felder bei ~514 KB** statt 25 bei 845 KB. Trockentest gegen die
echten #154-Daten: alle Felder lösen auf.

`ivRank`/`ivPercentile` bleiben vorerst `null` — das IV-Archiv braucht 30
Handelstage, Stand 26.07. sind es 15. Füllen sich ab **ca. Mitte August**
selbst. Bis dahin ist `ivAtm` + `ivExpiry` der Ersatz (588/700 Ticker).

### Bewertung: für den ursprünglichen Zweck überflüssig

Der Anwendungsfall (CapTrader-App für Optionsketten mit Portfolioeinbindung)
ist mit **`master_market_data` besser bedient**:

| | `master_market_data` | `market-snapshot-latest` |
|---|---|---|
| Felder/Ticker | **101** | 40 |
| `optionsWatchlist` inkl. KI-Strike + DTE | ja | nein |
| `sectorRS`, Leaderboards, `valueScanner` | ja | nein |
| Makro-/Regime-Block | ja | nein |
| Größe | 4,8 MB | 514 KB |
| Lesepfad | **erprobt** (Frontend nutzt ihn seit Monaten) | ungeklärt |

Endpunkt: `https://ko-sync.ahildebrand.workers.dev/public/master_market_data`
— ohne Auth, ohne Token.

**Entscheidung:** Snapshot läuft mit (Kosten: <1s pro Lauf, 514 KB im KV),
CapTrader-App nutzt `master_market_data`. Der Snapshot bleibt als
versionierter, stabiler Vertrag (`v: 3` im Header) verfügbar, falls
`master_market_data` sich strukturell ändert.

---

## 5. Offene Punkte

| Prio | Punkt | Status |
|---|---|---|
| 🔴 | **Schema v3 deployen** — nächster Nachtlauf (Mo 03:37 UTC) | committet, nicht live |
| 🟡 | **Lesepfad `market-snapshot-latest`** — Browser-Test steht aus | ungeklärt |
| 🟡 | **`tr_backup.py` gegen `market-*`** — läuft erst Samstag | ungetestet |
| 🟢 | `TR_BACKUP_FORCE`-Input im Workflow → Backup jederzeit testbar | Idee |
| 🟡 | **Verwaiste KV-Keys löschen** (siehe unten) | offen |

**Orphans im KV nach dem Schema-Rückbau — manuell im CF-Dashboard löschen:**
`market-snapshot-latest`, `market-snapshot-2026-07-24`, `marketping`,
`market_ping`, `market-ping`. Sie werden von nichts mehr geschrieben oder
gelesen, tauchen aber im Samstags-Backup auf, solange sie existieren
(Prefix `market:` greift bei ihnen allerdings **nicht** — sie landen also
auch nicht im Backup). Reine Aufräumarbeit, kein Funktionsrisiko.

### Zum Lesepfad

Der Browser-Test gab `{"error","hint","code"}` zurück — der lief allerdings
mit Doppelpunkt-Key **und** bevor der Key existierte. Beide Gründe reichen
für die Fehlermeldung, der Test war wertlos. Vermutung: `ko-sync` hat eine
Allowlist, auf der `master_market_data` steht und `market-snapshot-*` nicht.
Der Worker-Code liegt **nicht** im Repo (`workers/` enthält nur `ko-watchdog`).

---

## 6. Lessons Learned — teuer bezahlt

### 6.1 `tr_backup.py` läuft NUR SAMSTAGS

```python
# tr_backup.py, Z.27-30
if now.isoweekday() != 6 and os.environ.get("TR_BACKUP_FORCE") != "1":
    print(f"[TR-BACKUP] {now.strftime('%A')} — Backup läuft nur samstags, übersprungen.")
    return 0
```

Das stand die ganze Zeit in Zeile 27. Der Workflow-Step heißt sogar
**„Track-Record Backup (nur samstags aktiv)"** und braucht 0s.

`backups/tr_backup_latest.json` mit `exported: 2026-07-25T06:07:57Z` ist
**korrektes Verhalten**, kein Fehler.

**Kosten:** Auf dieser Fehlannahme wurde eine ganze Beweiskette aufgebaut
(„keine `market-*`-Keys im Backup → KV-Write schlägt fehl"), die von Anfang
an ungültig war. Daraus folgten **zwei Fixes auf Verdacht** und **vier
überflüssige Aggregator-Läufe**.

**Ursache des Fehlers:** `tr_backup.py` wurde ab Zeile 40 gelesen (der
Export-Loop). Zeilen 1–40 mit Docstring und Wochentag-Guard wurden
übersprungen.

### 6.2 Doppelpunkte in CF-KV-Keys funktionieren

Der Diagnose-Ping in Run #154 hat das endgültig geklärt:

```
[MARKET] Ping marketping (kein Sonderzeichen): True
[MARKET] Ping market_ping (Unterstrich):       True
[MARKET] Ping market-ping (Bindestrich):       True
```

Zusätzlich: `tr:snap:*`, `tr:eval:*`, `tr:index` funktionieren seit Monaten
mit Doppelpunkten.

**Konsequenz:** Beide Fixes (URL-Encoding via `quote()`, dann
Doppelpunkt→Bindestrich) waren Lösungen für ein Problem, das es nie gab.
Der KV-Write hat **nie** versagt.

**Schema-Entscheidung — REVIDIERT am selben Tag (Run #156, 20:00 UTC):**

Zunächst sollte `market-*` bei Bindestrichen bleiben („Rückbau lohnt nicht").
Das war falsch begründet. Der Rückbau auf `market:snapshot:*` wurde
durchgeführt, weil:

1. Der Snapshot hatte **noch keine Consumer** — die CapTrader-App nutzt
   `master_market_data`. Das Zeitfenster war offen und wird nie billiger.
2. Eine spätere Umbenennung hätte einen **stillen Fehlermodus** erzeugt:
   `push_to_cloudflare_kv()` löscht keine alten Keys. Consumer auf dem alten
   Namen bekämen den letzten Snapshot vor der Umbenennung — dauerhaft
   eingefroren, ohne 404, ohne Warnung. Für eine Trading-App der
   unangenehmste denkbare Fehler.
3. Eine dokumentierte Inkonsistenz bleibt eine Inkonsistenz. Der Anlass war
   ein Denkfehler, kein Designgedanke.

**Wichtige Präzisierung zum Beweis:** Der Ping-Test in #154 testete
`marketping`/`market_ping`/`market-ping` — **keiner davon enthält
Doppelpunkte**. Was Doppelpunkte belegt, ist `tr_layer.py`: `_kv_url()`
(Z.50-53) baut die URL **ohne jedes Encoding** und schreibt/liest damit seit
Wochen `tr:snap:*`, `tr:eval:*`, `tr:index`, `tr:stats`.

Deshalb wurde `push_to_cloudflare_kv()` exakt auf dieses Verhalten
zurückgesetzt — **URL-Encoding entfernt**, ebenso in `tr_backup.py`. Eine
`%3A`-Kodierung wäre eine ungetestete Abweichung vom bewiesenen Pfad gewesen.

Ebenfalls bereinigt: das Prefix-Tupel in `tr_backup.py` war durch die
Diagnose-Commits auf `("tr:", "market", "marketping", "market_")` angewachsen
→ zurück auf `("tr:", "market:")`.

### 6.3 Grundgesetz 9 (Konsolen-Check) gilt auch für Aggregator-Läufe

Die Regel „kein Code-Change vor bewiesener Root Cause" wurde zweimal
verletzt. Der richtige erste Schritt wäre gewesen, das **GHA-Job-Log** zu
lesen — dort standen alle Antworten. Aus der Sandbox sind die Log-Domains
(`productionresultssa4.blob.core.windows.net`,
`results-receiver.actions.githubusercontent.com`) allerdings **geblockt**.

**Konsequenz für künftige Sessions:** Wenn ein Aggregator-Verhalten
diagnostiziert werden muss, ist der Log-Auszug vom Nutzer der **erste**
Schritt, nicht der letzte. Die Suchfunktion „Search logs" auf der Run-Seite
filtert direkt auf Präfixe wie `[MARKET]` oder `[TR]`.

---

## 7. Weitere Beobachtungen aus Log #154

- `Datenfreshe: 0 aktuell · 700 veraltet` + `⚠ Viele veraltete Daten` —
  **normal am Wochenende**, `last_trading_day` steht korrekt auf 2026-07-24.
- `FlashAlpha API: HTTP 429 | Quota: 0/5` — Rate Limit, Retry-After 49323s
  (~13,7 h). Quota erneuert sich 2026-07-31.
- `CBOE PCR nicht verfügbar` → VIX-Proxy greift, PCR=0.900 NEUTRAL.
- `VIX Term nicht verfügbar: 'numpy.float64' object has no attribute 'dropna'`
  — sieht nach einem echten kleinen Bug aus, **nicht untersucht**.
- `errors: 18` von 718 Tickern (MMC, CFLT, EXAS, MRUS, ABB, VOLVY, NTT,
  BRKM, CYBR, MAG, POL-USD u.a.) — teils Yahoo-401 („Invalid Crumb"),
  teils tatsächlich delisted.

---

## 8. Commit-Übersicht 26.07.2026

### `ahsub/ko-aggregator`

| Commit | Zeit | Inhalt |
|---|---|---|
| `a3c74d3c` | 07:58 | `_write_market_snapshot()` — erste Fassung (v2) |
| `df954abd` | 07:58 | `tr_backup.py` archiviert `market:*` |
| `6e48346e` | 08:04 | `market:snapshot:latest` Alias-Key |
| `d4095b7f` | 08:53 | URL-Encoding `push_to_cloudflare_kv()` — *unnötig, harmlos* |
| `58e79b9f` | 08:53 | URL-Encoding `tr_backup.py` — *unnötig, harmlos* |
| `b33ab102` | 09:00 | Key-Schema `market:snapshot` → `market-snapshot` |
| `b4997628` | 09:00 | `tr_backup.py` Prefix `market:` → `market-` |
| `abd93b03`–`66ee2cd2` | 09:11–10:16 | Diagnose-Logging + Ping-Keys |
| `332d6c2b` | 11:05 | **`tr_layer.py`: exitDate + Flag-Reihenfolge** ⭐ |
| `11ee8926` | 11:28 | **Schema v3 — Options-Feldset** |
| `e633f269` | 20:00 | **Key-Schema zurück auf `market:snapshot:*`** + Encoding raus ⭐ |
| `8cdf4cba` | 20:00 | `tr_backup.py` Prefix `("tr:", "market:")`, Encoding raus |

### `ahsub/axel-scanner`

| Commit | Zeit | Inhalt |
|---|---|---|
| `92f4cc56` | 08:04 | `loadMarketSnapshot()` / `getMarketSnapshotTicker()` |
| `d1fcc81e` | 08:09 | **36 KV-Felder in `kvToScannerState()`** ⭐ |
| `bfdce748` | 08:38 | Version-Tag → `20260726-v403` |
| `cd247a72` | 09:00 | Bridge auf `market-snapshot-*` |
| `3e02eef0` | 20:00 | **Bridge zurück auf `market:snapshot:*` — v404** |

> **Hinweis:** In `ko-aggregator` gab es um 14:27–14:32 drei Commits zu
> `src/components/koAggregatorBridge.js` (angelegt, geändert, gelöscht).
> Nicht aus dieser Session — **Herkunft und Zweck in der nächsten Session klären.**

---

## 9. CapTrader-App — Einstiegshinweise

Endpunkt (ohne Auth):
```javascript
const r = await fetch('https://ko-sync.ahildebrand.workers.dev/public/master_market_data');
const master = await r.json();
const byTicker = Object.fromEntries((master.tickers || master.data?.tickers).map(t => [t.sym, t]));
const ideen = master.optionsWatchlist;   // 50 Kandidaten inkl. KI-Strike + DTE
```

**Drei Punkte beim Bauen beachten:**

1. **Antwortstruktur ungeprüft** — ob `ko-sync` das KV-Objekt direkt oder
   als `{data: …}` zurückgibt, ist nicht verifiziert. Obiger Code fängt beides ab.
2. **Universum ist kuratiert** (718 Titel, nicht „alles"). Portfoliopositionen
   außerhalb erscheinen nicht in `tickers`. Lücken schließt
   `fetch_approved_extra_tickers()` (Admin-Review-KV) — in #154 waren das 40 Ticker.
3. **`meta.last_trading_day` anzeigen, nicht „heute" annehmen.** Sonst wirken
   Freitagskurse am Montagmorgen wie Live-Daten. Ebenfalls in `meta`:
   `errors` (18 in #154) — fehlende Symbole dürfen die App nicht umwerfen.

**Makro-/Regime-Daten** liegen im `market`-Block: MSE-Regime, VIX/SKEW/VVIX
mit 252-Tage-Z-Scores, FRED HY-Spread, Net Liquidity, Zinskurve, MOVE, DIX,
PCR-Proxy, Fear & Greed, IOS Market Score. Für CSP-Timing potenziell
wertvoller als die Ticker-Ebene.

---

## 10. Erwartung an den nächsten Lauf

Nachtlauf Montag 03:37 UTC. Im Log zu prüfen:

```
[MARKET] ✅ market:snapshot:{tday} + market:snapshot:latest — 700 Ticker, 40 Felder/Ticker
```

- **40 Felder** (nicht 25) → Schema v3 ist live
- **~514 KB** (nicht 845 KB) → Feldbereinigung greift
- Keine `[TR] kv_put(...) fehlgeschlagen`-Zeilen mehr
- Ping-Keys tauchen nicht mehr auf (Diagnose entfernt)
