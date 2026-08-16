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
   den zugehörigen CDN-Hash-Pin in `index.html` prüfen/aktualisieren
   (`ko-indicators.json` hängt am selben Pin wie `ko-indicators-loader.js` —
   das war heute mehrfach relevant).

7. **Markdown-Überschriften nie in Chat-Diffs neben Code-Blöcken** (Copy-
   Paste-Risiko, s. gestriges Protokoll §2).

8. **NEU (aus dieser Session gelernt): "Daten liegen im Aggregator vor" oder
   "Client-Registry hat einen Eintrag dafür" beweist NICHT, dass diese Daten
   tatsächlich im KI-Prompt-Text landen.** Bei jeder neuen Metrik: explizit
   prüfen, ob sie (a) in `mlines`/`messwerteLines` gepusht wird UND (b) über
   eine STRUKTUR-Anweisung oder PFLICHTREGEL tatsächlich zur Erwähnung
   verpflichtet, nicht nur "verfügbar" ist. Heute mehrfach gefunden: Daten
   lagen vor, wurden aber nie in den Prompt-Pfad verdrahtet (Distribution
   Days: nie; MOVE Index/SKEW-VVIX-Div/Breadth-Oszillator: nur im Client,
   nie im Server — dem eigentlichen Normalfall).

9. **NEU: Bei Multi-Symbol-`yf.download()`-Calls (mehrere Ticker in einem
   Call) besteht ein reales Risiko, dass EIN Ticker degradierte/minimale
   Historie liefert, während die anderen normal funktionieren — Symptom:
   eine Schnittmenge/Intersection kollabiert auf sehr wenige Punkte, obwohl
   die einzelnen Rohserien lang aussehen.** Bei Verdacht: auf Einzel-Downloads
   pro Ticker umstellen (Muster aus `fetch_vix_term()` ist der bewährte
   Referenzfall) statt an der Intersection-Logik selbst zu suchen — das war
   heute zwei Fehlversuche lang die falsche Fährte.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*
*Committed ist nicht deployed. Im Repo ist nicht live. Im Aggregator ist
nicht im Prompt.*

---

# UEBERGABE-2026-08-16

**Session-Schwerpunkt:** Fortsetzung des größten offenen Punkts aus dem
Vortag (§5 des 15.08.-Protokolls: Python-seitiger Morning-Briefing-Prompt
kannte DIX/GEX gar nicht) — daraus entwickelte sich, ausgelöst durch zwei
gezielte Axel-Rückfragen ("wie verifiziere ich das in der App?" und später
"kann das auch bei anderen Metriken passiert sein?"), eine vollständige
Audit-Kette quer durch die MCM-Faktoren-Architektur (Server- und
Client-Pfad), die einen systemischen, seit Wochen bestehenden Blind-Fleck
aufdeckte: mehrere real berechnete, sauber implementierte Metriken erreichten
die eigentliche KI-Bewertung nie oder nur unzuverlässig. Session endete mit
einer sorgfältigen Abgrenzung, ob diese Lücke auch die bestehende
Regime-Backtest-Validierung kontaminiert haben könnte (Ergebnis: nein,
strukturell ausgeschlossen, aber eine eigenständige, lohnende
Forschungsfrage für später identifiziert).

**Repos berührt:** `ahsub/ko-aggregator` (`market_aggregator.py`
v5.36.2→v5.36.11, 12 Commit-Runden), `ahsub/ko-modules` (`ko-indicators.json`
v2.4.0→v2.4.1, `ko-indicators-loader.js`→v1.3.3), `ahsub/axel-scanner`
(`index.html` v465→v467), `ahsub/UIQ-Suite` (`REGIME-BACKTEST-VALIDIERUNG.md`
ergänzt).

---

## 1. §5-Fortsetzung: Server-seitiger DIX/GEX-Fix abgeschlossen (v5.36.3)

`generate_daily_snapshot()` kannte DIX/GEX bis dahin überhaupt nicht — Werte
lagen längst in `master.market.dixGex` vor, flossen aber nie in `mlines`.
Fix: DIX (SqueezeMetrics)/GEX (inkl. Gamma-Flip-Hinweis bei negativem
Wert)/DIX (ETF-Korb) ergänzt, STRUKTUR-Punkt 2 um "DIX/GEX" erweitert.
**Vollständig live verifiziert:** GHA-Lauf manuell getriggert, `head_sha`
gegen Commit geprüft, generierter Text per direktem KV-Fetch gegengelesen
(Browser, da `ko-sync.ahildebrand.workers.dev` nicht in Claudes
Netzwerk-Freigabe liegt — Zugriff lief über `claude-in-chrome`).

## 2. Deep-Debug auf Axels Screenshots (5 Bilder, v464-Stand vom 14.08.)

Drei gemeldete Verdachtsmomente einzeln root-gecausalt:

- **DIX-Z-Score/GEX-AAPL-Proxy-Z "keine Historie":** Feldpfad-Bug in
  `updateMarketWeatherWidget()` — las `dpData.gex.value`/`dpData.dix.value`,
  aber `ko-darkpool.js` liefert die Werte verschachtelt unter
  `dpData.dix.gex`/`dpData.dix.dix`. Strukturell seit Einführung des Widgets
  IMMER `null` → lokale Z-Score-Historie blieb dauerhaft leer. Betrifft nur
  die lokale Volumen-Heuristik (kein Bezug zur echten SqueezeMetrics-DIX-
  Anzeige, die funktioniert), fließt aber in `determineRegime()` ein
  (POST_PANIC_REVERSION-Zweig strukturell nie erreichbar gewesen).
- **Distribution Days "seit 2 Wochen eingefroren":** Kein Datenbug — durch 4
  historische Snapshots (04./07./13./16.08.) widerlegt, Werte ändern sich
  durchaus. Ursache des eingefrorenen *Scores*: Boden-Effekt der Formel
  (`100 - dd_max*15` sättigt bei jedem `dd_max≥7` auf 0). Fix: Skala auf
  `dd_max=12` linear erweitert.
- **Fear & Greed fehlt im Tagesstart-Übersichtsbereich:** Seit v368
  (17.07., CNN→alternative.me-Umstellung) schrieb `fetchCnnFearGreed()` nie
  mehr ins DOM (`KoData.fetchCnnFearGreed()` liefert nur einen Rückgabewert,
  der am Aufrufort nie konsumiert wurde) — betraf nicht nur die
  Home-Kachel, sondern auch die MCM-Ampel-Logik (Faktor fehlte komplett in
  `ctx.summary.caution_flags`). Fix: Registry-Eintrag von
  `source:"computed"/domId` auf `source:"aggregator"/aggregatorKey` auf
  dieselbe (stets korrekt funktionierende) Quelle wie der Modal-Text
  umgestellt, statt den fragilen Live-Fetch zu reparieren.

Alle drei live verifiziert (`ko-indicators.json` v2.4.0, `index.html` v466,
`market_aggregator.py` v5.36.4).

## 3. MCM-Paritäts-Audit (ausgelöst durch Axels Rückfrage "kann das auch
   woanders passiert sein?") — der eigentliche Kern der Session

Vollständiger Abgleich: welche vom Aggregator berechneten Metriken erreichen
tatsächlich den KI-Prompt (Server- UND Client-Pfad)? Ergebnis, teils
erschreckend systematisch:

- **`MCM-PARITAET-KONZEPT.md` (20.07., Sprint 21.07.) hatte das Problem
  bereits einmal dokumentiert und behoben** (4 Faktoren: ndx_breadth,
  intermarket_score, treasury_stress, bull_indicator) — aber seither nie
  aktualisiert, obwohl drei neue Client-Faktoren dazukamen (v2.2.0/v2.3.0,
  20./27.07.), die serverseitig nie nachgezogen wurden. Eine einmalige
  Reparatur, kein gelebter Prozess.
- **`breadth_osc` (McClellan) war strukturell komplett blind** — derselbe
  "market."-Präfix-Doppelverschachtelungsfehler wie einst bei PCR, aber
  ohne den rettenden Sonderfall-Block, den PCR hatte. Nie erreichbar, auf
  keinem Pfad, seit 27.07.
- **`move_index`** hatte einen eigenständigen Feldpfad-Bug im
  Client-Sonderfall-Block (`_mkt.zscores.move` existiert strukturell nie —
  echte Daten liegen unter `_mkt.moveIndex`) UND fehlte komplett server-
  seitig. Beide Pfade waren blind, seit Einführung (20.07.).
- **`skew_vvix_div`** hatte einen dritten, subtileren Bug: `signal_eq`-
  Stringvergleich gegen `"WARNUNG"` exakt, aber das Feld liefert einen
  ganzen Satz — Caution-Flag feuerte nie, obwohl der Rohwert im Prompt
  landete. Auf numerischen Vergleich umgestellt.
- **Distribution Days** (s. §2) — nie an irgendeinen Prompt angebunden
  gewesen, weder Client noch Server.

**Fixes:** `ko-indicators.json` v2.4.1 (breadth_osc-Präfix,
skew_vvix_div-Regel), `ko-indicators-loader.js` v1.3.3 (move_index- und
skew_vvix_div-Feldpfade), `market_aggregator.py` v5.36.5
(`build_server_market_context()` um alle 4 Faktoren erweitert, `_add()`
um optionales Label-Argument erweitert für lesbarere Prompt-Zeilen,
`compute_distribution_days()` liefert jetzt `dd_max` explizit).

**Nebenfunde bei der Live-Verifikation dieses Fixes** (jeweils eigener
Commit, eigene Root-Cause-Suche):
- `fetch_move_index()`: `squeeze()` konnte bei nur 1 Rohdatenpunkt zu einem
  nackten Skalar kollabieren (kein `.values` mehr) → AttributeError, durch
  try/except bereits abgefangen, aber kryptisch. Klare Diagnose-Meldung
  ergänzt (v5.36.6).
- `fetch_mse_history()`: `vvix`/`skew`-Z-Scores lieferten "nur 1 Werte"
  statt ~180-250 Handelstagen trotz `period=257d`. **Zwei Fehlversuche**,
  bevor die echte Ursache gefunden wurde — erste Hypothese (Timestamp/TZ-
  Mismatch bei der Index-Intersection, v5.36.7) war falsch und wirkungslos.
  Da Claude keinen Zugriff auf GHA-Job-Logs hat (Azure Blob Storage nicht in
  der Netzwerk-Freigabe), wurde ein temporäres `_debug`-Feld direkt ins
  KV-Ergebnis eingebaut (v5.36.8), um die Diagnose über den normalen
  KV-Abruf sichtbar zu machen. Das zeigte die echte Ursache: der gebündelte
  4-Symbol-`yf.download(group_by="ticker")`-Call lieferte für `^VIX3M`
  zuverlässig nur 1 Tag, während die anderen drei Ticker 245-254 Tage
  lieferten — die Schnittmenge war dadurch zwangsläufig auf 1 limitiert,
  unabhängig von jeder Zeitstempel-Frage. Fix: vier separate Einzel-
  Downloads statt einem Batch (Muster aus `fetch_vix_term()` übernommen),
  v5.36.9. **Vollständig live verifiziert** (v5.36.10): `^VIX3M` liefert
  jetzt 237 Tage, Schnittmenge 227 Tage, beide Z-Scores `ok:true`, alle 14
  MCM-Faktoren gleichzeitig im selben Lauf bestätigt.

## 4. "Wird das auch tatsächlich gewürdigt?" — Datenpfad ist nicht gleich
   Analyse-Pflicht

Axels Anschlussfrage, ob die (jetzt korrekt ankommenden) Werte auch
tatsächlich in der KI-Prosa berücksichtigt werden, wurde empirisch am
echten generierten Text geprüft (nicht nur theoretisch beantwortet):
Distribution Days, McClellan, NDX-Breadth, Intermarket-Score und die
VIX3M-Termstruktur-Inversion wurden korrekt diskutiert — VVIX, SKEW,
MOVE Index, SKEW/VVIX-Divergenz nicht, weil sie an diesem Tag alle
`signal:"ok"` waren. Das Muster ist eigentlich wünschenswert (Auffälliges
wird betont, Unauffälliges kurz gehalten), war aber **nicht durch die
STRUKTUR-Vorgabe garantiert**, sondern reines Modell-Ermessen. Neue
PFLICHTREGEL ergänzt (v5.36.11): jeder Faktor mit Signal `[CAUTION]`/`[RISK]`
MUSS explizit genannt werden, unabhängig von der fixen 5-Punkte-STRUKTUR-
Liste, die jetzt als Mindestanforderung markiert ist, nicht als
abschließende Aufzählung. **Nicht live verifiziert** — nächster GHA-Lauf
sollte das bestätigen (auf einen Tag mit tatsächlichem caution/risk-Signal
bei einem der bisher unerwähnten Faktoren warten, oder synthetisch prüfen).

**Bekannter, unbehobener Folgepunkt:** dieselbe PFLICHTREGEL fehlt im
Client-Fallback-Prompt (`ko-prompts.js`, `_getMorningPrompt()`) — seltener
genutzter Pfad (nur bei KV-Cache-Miss oder EIC-Force-Refresh), daher nicht
mehr in dieser Session angefasst.

## 5. Backtest-Kontaminationsprüfung: nein, aber eine echte neue Idee

Axels letzte Frage: könnten die neu gefundenen MCM-Faktoren das bestehende
Sharpe-1,66-Backtest-Ergebnis beeinträchtigt haben? Klärung: **zwei
verschiedene Backtests** werden leicht verwechselt — der Sharpe-1,66-
Backtest (Go-Kriterium 2) hat laut `REGIME-BACKTEST-VALIDIERUNG.md` **keine
Regime-Dimension** (validiert DCE-Score-Ranking, nicht Marketstate). Die
tatsächliche Regime-Validierung ist ein eigenständiges Dokument (10.08.).
Deren Klassifikator-Inputs (VVIX-Z/GEX-DIX-Z-Proxies/SKEW-Perzentil/VIX-
Termstruktur) enthalten keinen der 4 neuen MCM-Faktoren — strukturell keine
Kontamination möglich. `dix_z20`/`gex_z20` sind zwar echte Inputs, aber der
Backtest bezog sie aus einem unabhängigen historischen Archiv, nicht aus
der betroffenen Live-Pipeline. Als eigenständige, lohnende Folgeforschung
(nicht Korrektur) in `REGIME-BACKTEST-VALIDIERUNG.md` ergänzt: könnten
Distribution Days/Breadth-Oszillator als zusätzliche Klassifikator-Inputs
die dokumentierte 2022er-Fehlklassifikation (grindender Bärenmarkt ohne
Backwardation, fälschlich NEUTRAL statt STRESS_UNSTABLE) beheben? Nicht
begonnen, für eine eigene spätere Session vorgemerkt.

## 6. Nicht bearbeitet / offen für nächste Session

- **PFLICHTREGEL aus §4 im Client-Fallback-Prompt (`ko-prompts.js`)
  nachziehen** — Konsistenz zum Server-Prompt.
- **PFLICHTREGEL aus §4 noch nicht live verifiziert** — nächster
  aussagekräftiger Lauf (mit echtem caution/risk-Signal bei einem der
  bisher stillen Faktoren) abwarten oder gezielt synthetisch prüfen.
- **Backtest-Erweiterung um Distribution Days/Breadth-Oszillator** (§5) —
  eigenständiges Forschungsprojekt, Datenbeschaffung ungeklärt
  (Breadth-Oszillator-Historie 2011-2025 nicht trivial aus öffentlichen
  Quellen rekonstruierbar).
- **`csp_wheel.rollRules`-Anbindungsprüfung** aus dem 15.08.-Protokoll (§4
  dort) — in dieser Session nicht wieder aufgegriffen, weiterhin offen.
- **Rechtsgutachten-Screenshots** (Axel muss noch 3-5 Stück ergänzen,
  aus dem 15.08.-Protokoll, weiterhin offen) — das zugehörige Word-Dokument
  selbst wurde NICHT ins Repo committed (bewusst, wie Tochter-Briefing
  damals) und ist nur im Chat vom 15.08. verfügbar, nicht mehr in Claudes
  Erinnerung dieser Session.
- **IWV-Holdings-Update** ~27.08.2026 fällig (aus Standing-Instructions),
  in dieser Session nicht relevant.
- Nebenfund aus `REGIME-BACKTEST-VALIDIERUNG.md`: mögliche frei zugängliche
  GEX/DIX-Bulk-Historie (`squeezemetrics.com/monitor/static/DIX.csv`) im
  Widerspruch zur "DIX/GEX ist tot, HTTP 403"-Doku — separat zu verifizieren,
  könnte SUITE.md-Datenlücken-Punkt auflösen. Nicht in dieser Session
  untersucht.

---

*Verifiziert vor behauptet. §1-§3 sind vollständig live verifiziert (GHA-
Läufe getriggert, `head_sha` gegen Commits geprüft, KV-Inhalte per direktem
Browser-Fetch gegengelesen, teils inkl. temporärem Debug-Feld für sonst
unzugängliche Diagnosedaten). §4 (PFLICHTREGEL) ist committed, aber
ausdrücklich NICHT live verifiziert — das wird hier offen benannt, kein
Erfolg wird vorgetäuscht. §5 ist eine Analyse/Klärung, kein Code-Fix, und
entsprechend keine Live-Verifikation nötig — die Aussage stützt sich auf die
dokumentierte Backtest-Methodik, nicht auf eine eigene Sichtung des
(nicht mehr auffindbaren, nie committeten) Backtest-Skripts selbst.*
