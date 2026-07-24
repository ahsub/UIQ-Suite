# UIQ Übergabeprotokoll — 24.07.2026

> ⚠️ **UEBERGABE-HEADER-REGEL:** Alle Angaben aus diesem Protokoll gelten als UNVERIFIED
> bis zur eigenständigen Verifikation (Console, GitHub, Browser). Keine Behauptung aus
> einem Protokoll ohne Beweis übernehmen.

---

## SESSION-ÜBERBLICK

| | |
|---|---|
| **Datum** | 24.07.2026 |
| **Frontendversion** | v398 |
| **Aggregatorversion** | v5.19.0 |
| **GHA-Runs heute** | #141 (06:12 UTC, auto) + #142 (08:31 UTC, manuell getriggert) |
| **Repos berührt** | axel-scanner, ko-aggregator, UIQ-Suite |

---

## ERLEDIGTE AUFGABEN (chronologisch)

### 1. `tightnessPct`-Bugfix im Aggregator — `57b3a16`

**Problem:** `tightnessPct` war 680/680 = `null` im Snapshot, obwohl `calc_vcp()` den Wert korrekt berechnet.

**Root Cause:** In `market_aggregator.py` Zeile ~3571 wurden im `result`-Dict `vcpVolContraction` und `vcpBreakoutVol` aus dem `vcp`-Dict übertragen, `tightnessPct` wurde schlicht vergessen.

**Fix:** Eine Zeile in `market_aggregator.py` ergänzt:
```python
"tightnessPct": vcp["tightnessPct"] if vcp else None,  # NEU (23.07.2026)
```

**Verifikation nach manuellem GHA-Run #142:**
- `tightnessPct` befüllt: **673 / 680** ✅
- `tightnessPct = None`: 7 / 680 (legitim: zu wenig Bars)

---

### 2. P1 abgeschlossen — Cache-Architektur Beta-tauglich

#### v396 — US-Indizes KV-first (`b092ec4`)

**Problem:** SPY/QQQ-Kacheln im Makro-Tab blieben leer wenn kein Finnhub-Key vorhanden → Beta-Tester sah leere Werte ohne Erklärung.

**Fix in `index.html` Zeile ~9456:**
```
// 2. US Indizes — KV-first (v396, 24.07.2026)
```
Logik in drei Stufen:
1. `_kvMasterData.bySymbol['SPY']` / `['QQQ']` → Preis anzeigen + `(KV)` Badge (grau)
2. Finnhub live → überschreibt mit aktuellem Preis + Tages-% in grün/rot (wenn Key vorhanden)
3. Kein Key, kein KV → stille Degradierung (kein Crash)

**Hinweis:** `_kvMasterData` kann beim ersten `refreshLivePrices()`-Aufruf noch `null` sein (async). Daher: `await loadKVMasterData(false)` als lazy-Fallback direkt im Block.

#### v397 — Onboarding-Hint + `_kvMasterData.bySymbol` Fix (`35f4906`)

**Bugfix v396:** v396 hatte `_kvData.tickers` verwendet — beides falsch. Korrekte Variable: `_kvMasterData.bySymbol` (O(1)-Map).

**Onboarding-Hint:** Einmaliger Toast 3 Sekunden nach App-Start, wenn weder `fhKey` noch `tdKey` gesetzt:
```
ℹ️ Für Live-Kurse: API-Keys in Einstellungen hinterlegen. Scanner & Briefing laufen ohne Keys.
```
Gespeichert in `localStorage` Key `ko_onboarding_keys_hint_shown` → erscheint nie wieder.

**Code-Stelle:** in `unlockApp()` direkt nach `startLiveRefresh()`.

#### help.html aktualisiert (`22bdf87`)

Drei Ergänzungen:
- **Schnellübersicht-Tabelle:** Finnhub + TwelveData als „Optional"-Zeilen ergänzt
- **Neue Notice-Box** (blau): erklärt welche Features ohne Keys laufen (Scanner, Briefing, Ampel) vs. welche Keys brauchen (Live-Kurse, Charts)
- **Neuer FAQ-Eintrag:** „Was bedeutet das `(KV)`-Kürzel bei SPY/QQQ?"

---

### 3. P2-A — DE Pre-Market Scanner via Tradegate (`f19b602`)

#### Was gebaut wurde

Neues Preset im Scanner-Dropdown: **„🇩🇪 US auf Tradegate (Pre-Market 08–22 Uhr)"**

#### Wo der Code sitzt (für Erweiterungen)

| Was | Wo in index.html | Beschreibung |
|---|---|---|
| **Ticker-Mapping** | `TRADEGATE_MAP` (~Zeile 12903) | US-Ticker → Tradegate-Kürzel, ~65 Einträge. **Hier einfach neue Zeile ergänzen.** |
| **Preset-Option** | `setMarket('us')` Block in `setMarket()` | Dropdown-Eintrag `tg-premarket` |
| **Ticker-Auflösung** | `getTickers()` (~Zeile 6542) | `tg-premarket`-Zweig gibt alle Keys aus `TRADEGATE_MAP` zurück |
| **Zeitfenster-Guard** | `runScan()` (~Zeile 6988) | MEZ-Check 08–22 Uhr, Toast bei Außerhalb |
| **Yahoo-Symbol-Logik** | Scanner-Kern (~Zeile 7125) | `window._tgPremarketMode` → `getTradegateSym(sym)+'.F'` als Primary, `.DE` als Fallback |
| **Währung** | Scanner-Kern (~Zeile 7195) | EUR statt USD wenn `_tgPremarketMode` |

#### Wie man einen Ticker ergänzt

```javascript
// In TRADEGATE_MAP (ca. Zeile 12903 in index.html):
var TRADEGATE_MAP = {
  // ...bestehende Einträge...
  'TICKER_US': 'TICKER_TG',   // ← neue Zeile hier
};
```
Tradegate-Kürzel auf [tradegate.de](https://www.tradegate.de) nachschlagen.

#### Bekannte Einschränkungen

- Kein TwelveData-Intraday für `.F`-Ticker (deaktiviert, `tdSym=null`)
- `scoreCsp`/`scoreCc` aus KV bleiben USD-basiert — für EUR-Kurse nur technische Signale (SEPA, VCP) auswertbar
- Zeitfenster-Toast ist nur ein Hinweis, kein harter Block (Scan läuft trotzdem)

---

## OFFENE PUNKTE / NÄCHSTE SESSION

### P2-B (morgen): ko-indicators-registry

Zentrales JSON/JS-Modul in ko-modules:
- Generischer Polling-Gate (ersetzt derzeit verteilte Logik)
- Prompt-Building zentral statt verstreut
- Alle Indikator-Definitionen an einer Stelle

### P3 — Track-Record hit30-Auswertung

Frühestens Ende Juli (nach ~30 Handelstagen seit 02.07.2026).
- `tr:stats` KV-Key prüfen ob Daten aufgelaufen sind
- `hit30-fresh` Lead-Metrik auswerten

### Sonstige Offene Punkte

- `window._tgPremarketMode` wird nie auf `false` zurückgesetzt wenn man das Preset wechselt ohne zu scannen → niedrige Priorität, schadet in der Praxis nicht

---

## CDN-HASHES (unverändert zu gestern)

```
ko-prompts.js            → ko-modules@ab084ec  (v2.2.1)
ko-indicators-loader.js  → ko-modules@4de8824
ko-market-state.js       → ko-modules@8838fb4
ko-strategies.js         → ko-modules@bf7c816
```

---

## COMMITS DIESER SESSION

| Commit | Repo | Beschreibung |
|---|---|---|
| `57b3a16` | ko-aggregator | fix: tightnessPct in result-Dict ergänzt |
| `b092ec4` | axel-scanner | v396: US-Indizes KV-first (SPY/QQQ aus master_market_data) |
| `35f4906` | axel-scanner | v397: _kvMasterData.bySymbol fix + Onboarding-Hint |
| `22bdf87` | axel-scanner | help.html: Finnhub/TwelveData + KV-only Hinweis + FAQ |
| `f19b602` | axel-scanner | v398: DE Pre-Market Scanner via Tradegate |

---

## IWV-REMINDER

📅 IWV_holdings.csv Update fällig Anfang **August 2026**
(letzte Aktualisierung: 02.07.2026 — noch wenige Tage)

