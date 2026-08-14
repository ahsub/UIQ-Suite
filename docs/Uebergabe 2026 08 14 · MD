## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ist eine Aussage der vorherigen Session über sich selbst —
   nicht dein eigenes Wissen. Behandle es wie eine Behauptung eines Kollegen,
   nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug, nie
   für eine schnelle Plausibilitäts-Antwort.**

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# UEBERGABE-2026-08-14

**Session-Schwerpunkt:** Vormittags 14-Tage-Rückschau über alle Protokolle
01.–13.08. (separates Dokument, s. §1). Nachmittags/Abends ein mehrstufiger
Bugfix der DIX/GEX-Datenquellen-Priorität in `ko-aggregator`, ausgelöst durch
einen Faktencheck von Axels ursprünglicher Annahme — endete nach vier
Korrekturrunden bei einem tatsächlich funktionierenden Fix, vollständig live
verifiziert. Zusätzlich ein von der Rückschau selbst entdeckter, unabhängiger
Frontend-Bug in `axel-scanner` behoben. Beide Repos am Ende sauber versioniert.

**Repos berührt:** `ahsub/ko-aggregator` (`market_aggregator.py`, 4 Commits
+ 2 Versionierungs-Commits), `ahsub/axel-scanner` (`index.html`, 1 Commit für
Code-Fix + Versionierung in einem).

**Zugriffsweg heute:** `curl`/`tar` gegen öffentliche Repos (kein PAT) +
`claude-in-chrome` mit Axels Browser-Zugriff, genutzt für: Cloudflare-KV-
Lookup (`master_market_data`, `daily_market_snapshot`), GitHub-Actions-Log-
Analyse (mehrfach, inkl. manuellem Scrollen durch virtualisierte Log-Ansicht
und gezielter Suche), manuelles Workflow-Triggering durch Axel selbst
(vier Läufe: #210, #211 fehlgeschlagen, #212, #213 erfolgreich).

---

## 1. 14-Tage-Rückschau (Vormittag)

Auf Axels Wunsch: alle 13 Übergabeprotokolle vom 01.–13.08. gemeinsam
durchgegangen, als separates Dokument konsolidiert:
`UEBERGABE-2026-08-14-14-tage-rueckschau.md` (dem Chat beigefügt, Status
unklar ob ins Repo committed — bei Bedarf nachfragen). Enthält Arbeitsstrang-
Übersicht (Aggregator-Version-Historie, Frontend-Version-Historie, Track-
Record, Options-Modul, Refundex, DE-Modus) sowie eine priorisierte Liste
offener Punkte. **Wichtigster Fund daraus, der den Rest des Tages bestimmt
hat:** Axels Erinnerung "wir haben jetzt verlässlichen Zugang zu Squeezemetrics
GEX/DIX" stimmte so nicht — tatsächlicher Code-Stand war eine FlashAlpha-
Priorität mit Squeezemetrics nur als (fälschlich als unzuverlässig
eingestuftem) Fallback. Auslöser für den gesamten Nachmittag/Abend, s. §2.

**Aus der Rückschau selbst noch nicht abgearbeitet** (nicht Teil der
heutigen Session, für nächstes Mal vormerken): `tr:stats`-404-Status seit
01.08. ungeklärt, IV-Rank-Trigger (~12.08.) verstrichen ohne Bestätigung,
Rechtsgutachten WpHG/Beta-Tokens seit 10.08. nicht mehr erwähnt.

## 2. DIX/GEX-Datenquellen-Fix — vier Korrekturrunden, am Ende erfolgreich

**WICHTIG für die nächste Session: dieser Abschnitt wurde innerhalb der
heutigen Session VIER Mal korrigiert. Das Endergebnis (Run #213) ist per
Live-Snapshot verifiziert — aber lies trotzdem genau, was sich WARUM
geändert hat, nicht nur das Endergebnis.**

### Ausgangslage (Vormittag/früher Nachmittag, aus §1)

`fetch_dix_gex()` in `market_aggregator.py` hatte FlashAlpha (Free-Tier,
nur AAPL-Test, kein echtes SPY/QQQ) als Priorität 1, Squeezemetrics nur als
Fallback mit Code-Kommentar "historisch, meist 403". Historische Recherche
ergab: diese Einschätzung stammte aus dem allerersten FlashAlpha-Einführungs-
Commit vom 09.07.2026 (v4.8) — und wurde nie aktualisiert, obwohl am
10.08.2026 ein eigens eingerichteter 3-Tage-Stability-Check (2×/Tag,
`data/datasource_stability/log.jsonl`) durchgehend 100% Erfolgsquote für
Squeezemetrics zeigte. Entscheidung (Axel): Priorität umkehren,
Squeezemetrics zu Quelle 1, FlashAlpha als Sekundärquelle für
`gamma_flip`/`call_wall`/`put_wall` erhalten (falls Basic-Tier später
aktiviert wird).

### Runde 1 — Custom-Header entfernt (Commit `ed755f0`, Run #210)

Erster Verdacht: `requests.get(url, headers={"User-Agent": "Mozilla/5.0",
"Referer": "..."})` wirkt wie ein halbgarer Bot-Erkennungs-Trigger.
Header komplett entfernt. **Ergebnis: weiterhin `source: "flashalpha_free"`**
im Live-Snapshot (`data/snapshots/2026-08-14_14.json.gz`), trotz Commit
klar vor dem Lauf. Squeezemetrics-Stability-Check lief zur selben Zeit
parallel erfolgreich — also kein echter Serverausfall.

### Runde 2 — `curl`-User-Agent explizit gesetzt + fehlendes Logging ergänzt
(Commits `b1ed53c` fehlerhaft/IndentationError, dann korrigiert, Run #211
schlug mit `IndentationError: unexpected indent` fehl — Einrückung der
`try:`-Zeile einen Space zu viel gegenüber der Zeile davor)

Kernerkenntnis dieser Runde: der ursprüngliche Code hatte **kein `else`**
zum `if r.status_code == 200 and len(r.text) > 100:` — jede Nicht-200-
Antwort lief komplett ungeloggt durch, weder Erfolg noch Warnung. Das
erklärte, warum eine Log-Suche nach "squeezemetrics" im Run-#210-Log **0/0
Treffer** ergab (verifiziert durch vollständiges Scrollen durch die
virtualisierte GitHub-Actions-Log-Ansicht, 578 Zeilen, bis
`Exit Code: 0`). Fix: `User-Agent: "curl/8.5.0"` explizit gesetzt (mimt
den nachweislich funktionierenden Stability-Check), plus neues
`else: log.warning(f"squeezemetrics unerwartete Antwort: HTTP {r.status_code},
{len(r.text)} Bytes")`.

### Runde 3 — Einrückung korrigiert (Run #212, erfolgreich durchgelaufen)

Die neue `else`-Logzeile deckte den eigentlichen Fehler sofort auf:
**`HTTP 404, 146 Bytes`**. Kein Blocking, keine Exception — einfach eine
falsche URL.

### Runde 4 — Groß-/Kleinschreibung der URL korrigiert (Commit mit
`DIX.csv` statt `dix.csv`, Run #213)

Unsere URL: `squeezemetrics.com/monitor/static/dix.csv` (klein).
Stability-Check-URL (nachweislich funktionierend seit 10.08.):
`squeezemetrics.com/monitor/static/DIX.csv` (**groß**). Vermutlich
case-sensitives Hosting (typisch für S3-artige statische Auslieferung).
Fix: Großschreibung angeglichen.

### Ergebnis, live verifiziert

`data/snapshots/2026-08-14_17.json.gz` (Run #213, generiert 17:19 UTC):
**`"source": "squeezemetrics"`** — korrekt. **Bekannte, nicht abschließend
geklärte Einschränkung:** `"gex": 0.0` im selben Snapshot — Vermutung:
Squeezemetrics' öffentliches `DIX.csv` enthält vermutlich gar keine
`gex`-Spalte (historisch war GEX bei Squeezemetrics restriktiver behandelt
als DIX), unser Code nutzt `row.get("gex", 0)` mit Default 0 bei fehlender
Spalte. **NICHT verifiziert** — `squeezemetrics.com` liegt außerhalb des
Sandbox-Netzwerkzugriffs, konnte die CSV-Kopfzeile nicht selbst einsehen.
Für die eigentliche Zielfrage unkritisch, da der `dix`-Wert ohnehin
nachgelagert von der unabhängigen FINRA-ETF-Korb-Quelle überschrieben wird
(`dixSource: "finra_regshodaily"`, seit vorheriger Session etabliert).

## 3. Frontend-Folgefehler behoben (von der Rückschau/Prioritätsumkehr
    verursacht, noch vor der eigentlichen Backend-Fehlersuche entdeckt)

`axel-scanner/index.html`, GEX-Textbaustein im KI-Prompt-Kontext
(`messwerteLines`, Morning-Briefing/Marktkontext-Aufbau): prüfte
hartcodiert nur `_dg.source === 'flashalpha_free'` für die GEX-Zeile. Nach
der Prioritätsumkehr (§2) lieferte `dixGex.source` neu häufig
`"squeezemetrics"` — dieser Fall wurde von der bestehenden Bedingung nicht
abgedeckt, GEX-Zeile blieb leer, obwohl echte Daten vorlagen. Fix: neuer
`else if`-Zweig für `source === 'squeezemetrics'` ergänzt
("GEX (SPY-Markt-Level, SqueezeMetrics — ECHTE Daten): X Mrd"),
FlashAlpha-Zweig als Free-Tier-Proxy-Fallback unverändert erhalten.
Geprüft: **kein weiteres Vorkommen** von `'flashalpha_free'`-Checks in
`ko-prompts.js`, `ko-strategies.js`, `ko-darkpool.js`, `ko-market-state.js`,
`ko-scanner.js`, `ko-home.js` — dieser eine Fix ist vollständig, keine
Geschwisterstelle übersehen.

**Antwort auf Axels Ausgangsfrage vom Vormittag** ("wird der aktualisierte
DIX/GEX bei der Analyse der Marktsituation durch die KI gewürdigt?"): Ja,
seit diesem Fix korrekt — DIX war bereits vorher quellenunabhängig korrekt
eingebunden (FINRA-Zweig), GEX ist jetzt für beide möglichen Quellen
(`squeezemetrics` und `flashalpha_free`) korrekt abgedeckt.

## 4. Versionierung — beide Repos, alle drei Versionsstellen konsistent

| Datei/Konstante | Alt | Neu | Verifiziert |
|---|---|---|---|
| `axel-scanner/index.html` Meta-Tag | v460 | **v461** | ✅ per `curl` |
| `axel-scanner/index.html` Changelog | — | v461-Eintrag | ✅ per `curl` |
| `market_aggregator.py` Docstring-Titel | v5.36.0 | **v5.36.1** | ✅ per `curl` + `ast.parse` |
| `market_aggregator.py` Changelog (Docstring) | — | Version-5.36.1-Eintrag | ✅ |
| `market_aggregator.py` `AGGREGATOR_VERSION`-Konstante | "5.36.0" | **"5.36.1"** | ✅ per Commit-Hash-Abruf 
(CDN-Cache von `raw.githubusercontent.com/main` zeigte zunächst veralteten Stand 
— Vorsicht bei künftigen Schnell-Verifikationen direkt nach Commit, 
im Zweifel über den Commit-Hash statt `main` abrufen) |

**Hinweis aus dem Code selbst, nicht ignorieren:** Der Kommentar über
`AGGREGATOR_VERSION` warnt bereits, dass diese Konstante zwischen v5.31.0
und v5.36.0 (07./08.08.) schon einmal unbemerkt aus dem Tritt geraten war,
und dass die eigentlich verlässliche Codestand-Zuordnung im Track Record
seit 12.08. über `aggSha` (echter Git-Commit-Hash) läuft, nicht über diese
Konstante. Konsistenzpflege trotzdem sinnvoll, aber diese Konstante ist
laut eigenem Kommentar nicht mehr die primäre Wahrheitsquelle.

## 5. Nicht bearbeitet / offen für nächste Session

- Alle Punkte aus der 14-Tage-Rückschau (§1), die dort schon als offen
  markiert waren — unverändert offen, s. separates Rückschau-Dokument für
  Details (`tr:stats`-404, IV-Rank-Trigger, Rechtsgutachten/Beta-Tokens,
  Priorisierungsfrage Strategie-Modul-Scope).
- Ob `squeezemetrics`' öffentliches `DIX.csv` tatsächlich keine `gex`-Spalte
  enthält (§2, Vermutung, nicht verifiziert) — falls Axel Zugriff auf die
  Rohdaten hat (z.B. via Browser, da `squeezemetrics.com` außerhalb des
  Sandbox-Netzwerkzugriffs liegt), lohnt ein kurzer Blick auf die
  tatsächliche CSV-Kopfzeile.
- Strategie-Registry-Korrektur (DTE 30-45/Delta-Aufsplittung) aus
  UEBERGABE-2026-08-13.md §4 — weiterhin nicht begonnen, unverändert seit
  gestern.
- Axel wollte eine Literatur-Zusammenfassung (Options-Strategiewahl nach
  Marktsituation, gestützt auf eigene Fachbücher/PDFs) mitbringen — noch
  nicht eingetroffen, s. gestriges Protokoll §7 für Kontext.

---

*Verifiziert vor behauptet. §2 und §3 sind vollständig live verifiziert
(Snapshot-Daten direkt aus KV/Repo gelesen, nicht nur Commit-Diffs
geprüft). §4 ist per direktem Abruf bestätigt (mit dem Cache-Hinweis oben).
§1 verweist auf ein separates Dokument, dessen Repo-Status ich nicht
bestätigt habe — bei Bedarf nachfragen, ob es committed wurde.*
