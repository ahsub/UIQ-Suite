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

6. **CDN-Hash-Pin-Falle:** Bei jeder `ko-modules`-Datei-Änderung IMMER auch
   den zugehörigen CDN-Hash-Pin in `index.html` prüfen/aktualisieren — UND
   danach den tatsächlichen Deploy abwarten (bei Axel kein Auto-Deploy aus
   dem Git-Commit, sondern ein separater manueller Schritt auf CF Pages).
   Heute mehrfach: Commit war da, Live-Seite zeigte trotzdem die alte
   Version, bis der Deploy-Schritt selbst nachgeholt wurde. Immer mit
   Cache-Buster-Query-Param + `{cache:'no-store'}` direkt gegen den Server
   verifizieren, nicht nur den Browser-Tab neu laden.

7. **Markdown-Überschriften nie in Chat-Diffs neben Code-Blöcken**
   (Copy-Paste-Risiko in echten Code — bereits einmal als kaputter
   HTML-Kommentar-Öffner (`<!` + Zeilenumbruch + `-- CHANGELOG`) passiert,
   heute erneut aufgetreten und gefixt, s. §5).

8. **"Daten liegen im Aggregator vor" oder "Client-Registry hat einen
   Eintrag dafür" beweist NICHT, dass diese Daten tatsächlich im
   KI-Prompt-Text landen UND korrekt interpretiert werden.** Selbst wenn ein
   Faktor korrekt im Prompt ankommt, kann er trotzdem strukturell falsch
   sein — heute z. B. ein Skalen-Mismatch (Live-Wert aus einer ganz anderen
   Quelle als die Historie, s. §7), der einen technisch korrekten, aber
   inhaltlich bedeutungslosen Z-Score erzeugte und die Regime-Klassifikation
   verfälschte. Bei jeder neuen Zeitreihen-/Historie-Anbindung: prüfen, ob
   "heute" und "Historie" wirklich aus derselben Quelle/Skala stammen.

9. **NEU (aus dieser Session gelernt): KV-Worker-Routen können individuell
   unterschiedlich gecacht sein.** Ein KV-Key kann frisch geschrieben sein,
   während eine andere Route desselben Workers (z. B. `master_market_data`
   vs. `market:snapshot:latest`) noch veraltete Daten ausliefert. Bei
   Verdacht auf einen fehlgeschlagenen Schreibvorgang: erst einen ANDEREN,
   garantiert im selben Lauf geschriebenen Key gegenprüfen, bevor man einen
   Bug im Aggregator-Code selbst vermutet — und den verdächtigen Key direkt
   mit Cache-Buster + `no-store` erneut abfragen.

10. **NEU: GHA-Workflow "Success" bedeutet nicht zwingend "KV aktuell".**
    Der Aggregator hat einen bewussten Degraded-Mode-Exit (`sys.exit(0)` bei
    zu vielen fehlgeschlagenen Ticker-Downloads), der als "erfolgreich"
    grün markiert wird, aber die KV NICHT überschreibt. Bei "Lauf war grün,
    Daten sehen trotzdem alt aus": zuerst Cache-Effekt ausschließen (s.
    Punkt 9), erst danach einen echten Degraded-Mode-Verdacht verfolgen.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*
*Committed ist nicht deployed. Deployed ist nicht sofort live (Cache).
Live im Prompt ist nicht automatisch inhaltlich richtig (Skala/Quelle
prüfen).*

---

# UEBERGABE-2026-08-17

**Session-Schwerpunkt:** Direkte Fortsetzung des DIX/GEX-Themas aus dem
16.08.-Protokoll (§6-Nebenfund) — daraus entwickelte sich eine durchgehende
Kette: Wochenend-Datenlücke aufgeklärt → strukturelle MCM-Registry-Lücken
(`vix`/`vix_term`/`mse_regime`) gefunden und gefixt → PFLICHTREGEL- und
`rollRules`-Alt-Punkte aus dem 15./16.08.-Protokoll abgearbeitet → BaFin-
Formulierungsfix (IOS-Market-Decision-Strings) parallel zur Vorbereitung
eines Anwaltsgesprächs (Vorbereitungsdokument ergänzt, nicht im Repo) →
DIX/GEX-Bulk-Historie-Nebenfund verifiziert und vollständig nutzbar gemacht
(Server-Backfill + Client-Anbindung) → dabei einen bis dahin unsichtbaren
Skalen-Mismatch-Bug gefunden, der die Regime-Klassifikation verfälschte →
sieben neue Konjunktur-Indikatoren (NFCI, Core CPI YoY, Sahm-Rule, OECD
CLI, Heavy Truck Sales, Consumer Staples/Discretionary, Growth/Value)
vollständig durch Server und Client gezogen, live verifiziert. Session
endete mit Einigung auf multivariate statistische Voranalyse (Korrelation,
Feature-Importance, Granger-Kausalität) als nächsten Schritt, VOR einem
neuen Backtest.

**Repos berührt:** `ahsub/ko-aggregator` (`market_aggregator.py`
v5.36.11→v5.36.14), `ahsub/ko-modules` (`ko-prompts.js` v2.5.2→v2.5.4,
`ko-market-state.js` v2.2→v2.3, `ko-indicators.json` v2.4.1→v2.5.0,
`ko-indicators-loader.js` v1.4.1→v1.4.2), `ahsub/axel-scanner`
(`index.html` v467→v473, 6 Versionsschritte). Ein separates Word-Dokument
("Vorbereitungsdokument Anwaltsgespräch") wurde bearbeitet, bewusst NICHT
committed — nur im Chat vom 17.08. verfügbar.

---

## 1. DIX/GEX-Z-Score "keine Historie" — Wochenend-Lücke, kein Bug

Axels Meldung ("MB zeigt weiter DIX Z-Score n/v") wurde per Deep-Debug
geprüft, nicht plausibel weggeredet. Befund: Feldpfad-Fix aus dem
16.08.-Protokoll war korrekt und live wirksam (`fetchDIX()` lieferte
saubere Werte im Live-Test), aber die lokale Z-Score-Historie
(`KoMarketState._history.gex/.dix`) brauchte laut `zScore()`-Logik
mindestens 3 Punkte — durch das handelsfreie Wochenende (15./16.08.) war
seit dem Fix kein vollständiger Morning-Briefing-Lauf gelaufen, der neue
Punkte hätte pushen können. Ein manuell getriggerter echter Lauf am 17.08.
bestätigte: Mechanismus funktioniert, Historie wächst korrekt.
**Live verifiziert.**

## 2. MCM-Registry-Lücken: `vix`/`vix_term`/`mse_regime` strukturell nie
   befüllbar

Ausgelöst durch das "⚠️ Teildaten"-Badge im Briefing-Kopf. Drei
unabhängige Root Causes, alle Registry-Versprechen ohne Umsetzung:

- **`vix`**: `source:"aggregator"` ohne `aggregatorKey` (Pflichtfeld für
  den generischen Lesepfad) — UND `domId:"m-vix"` wurde nie gelesen, weil
  der DOM-Pfad nur bei `source:"dom"` aktiv ist. Fix: `source:"dom"`
  (Axel-Entscheidung: Live-Wert statt bis zu 24h altem Aggregator-
  Snapshot, konsistent mit dem v324-VIX-Cache-Fix aus der Frühgeschichte).
- **`vix_term`**: `computeFrom`-Feld deklariert, aber `getIndicatorValue()`
  wertet `computeFrom` nirgends aus — reine Doku ohne Wirkung. Fix:
  Spezial-Block analog `hy_spread`/`move_index`, liest `_mkt.vixTerm`
  direkt.
- **`mse_regime`**: `computeFn:"KoMarketState.getRegime"` verweist auf eine
  Methode, die im gesamten Code nicht existiert. Fix: Spezial-Block liest
  `KoMarketState._lastRegime` bzw. den bereits durchgereichten
  `ctx._regime`.

**Ergebnis:** `dataQuality` war dadurch strukturell **permanent** "partial",
unabhängig vom echten Datenstand. Nach Fix: `dataQuality: full (10/10)`,
Badge verschwindet. `ko-indicators.json` v2.4.1, `ko-indicators-loader.js`
v1.4.1, `index.html` v468. **Vollständig live verifiziert** (Screenshot von
Axel bestätigt: Badge weg).

## 3. Zwei Alt-Punkte aus dem 15./16.08.-Protokoll abgearbeitet

- **PFLICHTREGEL-Client-Sync** (`ko-prompts.js`, `_getMorningPrompt()`):
  Server-Fix vom 16.08. (jeder `[CAUTION]`/`[RISK]`-Faktor muss genannt
  werden) fehlte im seltener genutzten Client-Fallback-Pfad. Nachgezogen,
  identischer Wortlaut in beiden Branches (EIC + Public). **Live gegen
  einen echten API-Call verifiziert** (synthetischer BACKWARDATION-Faktor
  wurde von der KI korrekt erwähnt und eingeordnet) — nicht nur
  Code-Ebene, sondern tatsächliches Modellverhalten bestätigt.
  `ko-prompts.js` v2.5.3.
- **`csp_wheel.rollRules`-Anbindungsprüfung**: Befund — `rollRules` wird
  von keiner Funktion konsumiert (`getEffectiveRules()` reichte nur
  `deltaRange`/`dteRange` durch; der in der Registry genannte zweite
  Konsument, `evaluateOptionsTradeAgainstUIQRules()`/Options-Doktor,
  existiert als Code nirgends). **Gemeinsam mit Axel entschieden:**
  `rollRules` bleibt bewusst unverdrahtet — die Intent-basierte
  Verzweigung setzt eine bestehende Position mit bekannter Handelsabsicht
  voraus, gehört strukturell zum geplanten Options-Doktor, nicht zum
  Kandidaten-Scanner. `stopLoss`/`profitTaking` dagegen WURDEN eingebunden
  (neuer Prompt-Punkt "g) EXIT-KRITERIEN") — Exit-Kriterien für eine neu zu
  eröffnende Position passen strukturell in den Scanner. **Live gegen
  echten API-Call verifiziert** (KI nannte korrekt "50% Gewinn... schließen,
  Stop: –200% Prämie"). `ko-prompts.js` v2.5.4.

## 4. IOS-Market-Score: Imperativ-Sprache entfernt (BaFin-Vorbereitung)

Axel bereitete parallel ein Anwaltsgespräch vor (Vorbereitungsdokument,
nicht im Repo). Dabei aufgefallen: der IOS-Market-Kasten zeigte
"SELEKTIV KAUFEN"/"KAUFEN ERLAUBT" — direkter Widerspruch zur eigenen
STRIKTEN BaFin-REGEL im Prompt-Code ("keine Empfehlungen, auch nicht
implizit"). Alle fünf Decision-Strings in `calc_ios_market_score()`
(`market_aggregator.py`) auf deskriptive, an Strategie-Klassen gebundene
Formulierungen umgestellt (z. B. "OFFENSIV — Trendfolge & Breakouts
begünstigt" statt "KAUFEN ERLAUBT"), konsistent mit dem bereits
vorhandenen `mode`-Feld. `apply_ios_market_overlay()`s String-Vergleiche
mitgezogen (sonst wäre die Confidence-Bonus/Dämpfungs-Logik nach dem
Rename stillschweigend nie mehr getriggert worden). `market_aggregator.py`
v5.36.12. **Committed, GHA-Lauf bestätigt neue Strings live in der KV.**

## 5. Rendering-Bug: kaputter HTML-Kommentar-Öffner (zweimal aufgetreten)

Beim manuellen Einpflegen der `index.html`-Changelog-Blöcke riss der
Kommentar-Öffner `<!--` zweimal in `<!` + Zeilenumbruch + `-- CHANGELOG`
auseinander (Editor-/Copy-Paste-Artefakt) — Browser fällt dadurch in
"Bogus Comment"-Modus und rendert Text bis zum nächsten zufälligen `>`
sichtbar über der UI. Beide Male von Axel per Screenshot gemeldet, beide
Male root-gecausalt (nicht geraten) und gefixt. **Vorschlag für die
Zukunft:** beim Einfügen von Changelog-Text in den bestehenden
Kommentarblock nie den `<!--`-Öffner selbst anfassen, nur Text dahinter
einfügen.

## 6. DIX/GEX-Bulk-Historie-Nebenfund — verifiziert und vollständig genutzt

Der seit dem 16.08.-Protokoll offene Nebenfund (`squeezemetrics.com/
monitor/static/DIX.csv`, im Widerspruch zur "DIX/GEX ist tot"-Doku) wurde
per Browser-Fetch (CORS-Proxy der App genutzt, da direkter `fetch()` an
CORS scheitert) verifiziert: **3.846 Zeilen echte tägliche DIX/GEX-Daten
von 2011-05-02 bis heute, komplett kostenlos, kein Auth.** Letzter Wert
deckte sich exakt mit dem, was die App bereits zeigte.

**Umgesetzt (Axel-Entscheidung: sofort bauen, nicht nur dokumentieren):**
- Server: `fetch_dix_gex()` liest zusätzlich die letzten 60 Handelstage
  und legt sie unter `dix_gex["history"]` ab (`market_aggregator.py`
  v5.36.13).
- Client: `KoMarketState.loadHistoryFromAggregator()` backfillt jetzt auch
  `_history.gex/.dix` daraus — nur wenn lokal noch leer, echte Live-Punkte
  werden nie überschrieben (`ko-market-state.js` v2.3).

**Vollständig live verifiziert:** lokale Historie zurückgesetzt, Backfill
lud 60 echte Punkte, Z-Scores sofort verfügbar (statt "keine Historie").
Löst das ursprüngliche Symptom aus §1 strukturell und dauerhaft, nicht nur
für den einen Tag.

## 7. Nebenfund beim Backfill-Test: Skalen-Mismatch verfälschte die
   Regime-Klassifikation

Axel meldete nach Deploy: MSE zeigt "NEUTRAL" statt "BULL_QUIET". **Deep-
Debug statt Plausibilitäts-Antwort** (Axel schickte echtes Konsolen-Log,
Pflicht-Header-Regel 5 galt hier direkt): `gex_raw: -0.005` in den
Live-Metriken, während die frisch gebackfillte Historie Werte wie `15.193`
(Milliarden) zeigte. Root Cause: `updateMarketWeatherWidget()` speiste den
täglichen Live-Push weiterhin aus `KoDarkPool.fetchDIX()` — einer
**client-seitigen Volumen-Heuristik** ("kein echter DIX/GEX —
SqueezeMetrics-Ersatz geplant", eigener Code-Kommentar), kleine Werte nahe
0 — während die Historie jetzt echte squeezemetrics-Werte (Milliarden-
Skala) enthält. Ein Vergleich zweier inkompatibler Skalen erzeugte einen
technisch korrekten, aber bedeutungslosen GEX-Z-Score (-1.98), der die
Klassifikation ohne echten Marktgrund Richtung NEUTRAL zog.

**Fix:** Live-Push bevorzugt jetzt `window._alphaData.market.dixGex`
(echter Server-Wert, dieselbe Quelle wie die Historie), alter
Heuristik-Proxy nur noch Fallback. `index.html` v472. **Vollständig live
verifiziert:** `gex_raw`/`dix_raw` jetzt exakt deckungsgleich mit dem
letzten Historie-Punkt, GEX-Z-Score plausibel (2.18), Regime wieder
korrekt `BULL_QUIET`.

## 8. Sieben neue Konjunktur-Indikatoren (Axel: "auf diesem Auge bislang
   blind")

Axel brachte eine Liste von Konjunkturindikatoren samt Quellenvorschlägen
mit (vermutlich extern vorrecherchiert). Vor jeder Umsetzung wurden alle
genannten FRED-Serien-IDs **live gegen die echte FRED-Datenbank geprüft**
(nicht aus dem Gedächtnis übernommen) — zwei falsch, eine erfunden/404:

| Indikator | Genannte ID | Verifiziert korrekt |
|---|---|---|
| NFCI (Chicago Fed) | `STLFSI` (falsch — anderer Index!) | `NFCI` |
| US Core CPI | `CPIAUCSL` (Headline, nicht Core!) | `CPILFESL` |
| Heavy Truck Sales | `TRUCKSUSSA` (existiert nicht, 404) | `HTRUCKSSAAR` |
| Arbeitslosenrate | `UNRATE` | korrekt |
| OECD CLI (USA) | — | `USALOLITOAASTSAM` |

Zwei genannte Drittanbieter-Tools ("CalcFi Open Data", "PublicFinance
MCP") ebenfalls live geprüft — beide real, aber bewusst NICHT verwendet
(Mirror bzw. falscher Werkzeugtyp für einen Cron-Job) — FRED bleibt
einzige Quelle, Begründung dokumentiert.

**Umgesetzt** (Server-Teil bei Session-Fortsetzung bereits weitgehend
vorgefunden, verifiziert + einen Nummerierungsfehler in den
Abschnitts-Kommentaren behoben; Client-Parity komplett neu gebaut):
- `nfci`, `sahm_rule` (offizielle FRED-Serie `SAHMREALTIME`, nicht
  approximiert) als Kern-Faktoren (`promptWeight: hoch`).
- `core_cpi_yoy`, `oecd_cli_score`, `heavy_truck_trend` als Kontext-Faktoren
  (`mittel` — monatlich, mit echtem Meldeverzug, bewusst NICHT im
  Kern-Faktor-Pool für `dataQuality`, um die Frequenz-Realität
  abzubilden).
- `staples_discretionary` (XLP/XLY), `growth_value` (IWF/IWD) — beide ohne
  einen einzigen neuen API-Call (XLP/XLY waren schon im Ticker-Universum,
  IWF/IWD nur 2 neue Ticker im bestehenden yfinance-Batch), rein
  informativ, kein Signal.

`market_aggregator.py` v5.36.14, `ko-indicators.json` v2.5.0,
`ko-indicators-loader.js` v1.4.2, `index.html` v473.

**Vollständig live verifiziert** — inkl. einer Nebenepisode: nach Deploy
zeigte die KV zunächst weiter alten Stand trotz "erfolgreichem" GHA-Lauf.
Root Cause NICHT vorschnell als Degraded-Mode-Fehlschlag angenommen,
sondern gegengeprüft: ein anderer KV-Key desselben Workers war frisch →
Schluss auf routen-spezifischen Cache statt Schreibfehler, per
Cache-Buster + `no-store` bestätigt. Danach alle sieben Faktoren mit
echten Werten bestätigt (u. a. Sahm-Rule -0.03, weit unter dem
Rezessions-Trigger 0.50 — aktuell kein Rezessionssignal).

## 9. Vorbereitungsdokument Anwaltsgespräch ergänzt (nicht im Repo)

Auf Axels Frage, ob der Screener selbst (Universum scannen + KI-Begründung
generieren) bereits eine Anlageempfehlung sei: Ja, wahrscheinlich — aber
das ist unproblematisch, MAR erlaubt das ohne Banklizenz. Die eigentliche
Grenze zu §32-KWG-Anlageberatung ist Individualisierung, nicht die
Existenz einer Trefferliste. Neuer Abschnitt 3 im Dokument ergänzt
(Screener-Einwand + zwei zu klärende Punkte: Trennung Suchparameter vs.
persönliche Umstände, Interessenkonflikt-Offenlegung), nachfolgende
Abschnitte umnummeriert (3→4/5/6), Abschnitt 6 (Screenshots) um eine
priorisierte Liste ergänzt (Pflicht/Ergänzend), direkt anknüpfend an die
heutigen Live-Fixes (IOS-Market-Wortwahl, EXIT-KRITERIEN). **Dokument
selbst bewusst nicht committed**, nur im Chat verfügbar.

## 10. Nicht bearbeitet / offen für nächste Session

- **Rechtsgutachten-Screenshots** — weiterhin Axels eigener Part, noch
  nicht erledigt (aus 15.08. und 16.08. wiederholt vorgemerkt).
- **IWV-Holdings-Update** ~27.08.2026 fällig, heute nicht relevant.
- **REGIME-BACKTEST-VALIDIERUNG.md** könnte einen Hinweis vertragen, dass
  der DIX/GEX-Bulk-Historie-Nebenfund (dort ursprünglich vermerkt) jetzt
  vollständig gelöst ist — nicht in dieser Session aktualisiert.
- **Backtest mit den neuen Konjunktur-Indikatoren + der jetzt tiefen
  DIX/GEX-Historie (2011+)** — von Axel explizit gewünscht, bewusst NICHT
  heute begonnen. Vereinbart: VOR einem neuen Backtest erst eine
  multivariate statistische Voranalyse (Korrelationsmatrix/
  Multikollinearitäts-Check zuerst, dann Feature-Importance via Random
  Forest/Gradient Boosting, dann gezielte Granger-Kausalitätstests für die
  "Frühindikator"-Behauptungen bei Heavy Truck/OECD CLI). Offener
  technischer Punkt, der vorher geklärt werden muss: Frequenz-Mismatch
  zwischen täglichen (DIX/GEX, NFCI) und monatlichen Serien mit echtem
  Meldeverzug (Core CPI, OECD CLI, Sahm-Rule) — Ausrichtung nach
  Veröffentlichungsdatum, nicht Berichtsdatum, sonst Look-Ahead-Bias. Auch
  ungeklärt: DIX/GEX sind erst ab 2011 tief, der bestehende Backtest läuft
  2007–2026 — Teilzeitraum-Test vs. verkürzter Gesamtzeitraum muss vor
  Beginn entschieden werden.

---

*Verifiziert vor behauptet. §1-§8 sind vollständig live verifiziert (echte
API-Calls, echte Browser-Konsolen-Checks, GHA-Läufe getriggert und per
direktem KV-Fetch mit Cache-Buster gegengelesen, teils gegen echte
Axel-Konsolen-Logs statt eigener Simulation). §9 ist reine Dokumentenarbeit
außerhalb des Repos, keine Code-Verifikation nötig oder möglich. §10 ist
vereinbarte Planung für die nächste Session, kein behaupteter
Umsetzungsstand.*
