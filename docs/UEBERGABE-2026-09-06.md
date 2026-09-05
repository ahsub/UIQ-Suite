# UEBERGABE-2026-09-06.md

Fortsetzung von `UEBERGABE-2026-09-05.md`. Zweiter voller Arbeitstag am
9-Punkte-Migrationssprint: P0 (veraltete Pflichtformulierungen) und P2
(Equity-Migration) vollständig abgeschlossen, danach ein grundlegender
Architektur-Umbau (Single Source of Truth über alle UI-Entry-Points),
eine serverseitige Zweitkontrolle etabliert, und zwei zuvor nicht
funktionsfähige Leaderboards reaktiviert. Insgesamt einer der
umfangreichsten Sprints bisher — heute wurden vier verschiedene
Dateien bearbeitet (`ko-prompts.js`, `index.html`, `market_aggregator.py`,
`ko-ai.js`), nicht nur eine.

---

## 1. P0 abgeschlossen: systematischer Audit aller 7 migrierten Strategien

Auslöser: der `ko`-Adversarial-Test vom 05.09. zeigte, dass der Fix im
gemeinsamen `PUBLIC_REGULATORY_GUARDRAIL` (v2.28.0) strategie-eigene
Textstellen nicht mit abdeckte. Audit über `focus[]`/`risikenText`/
`principle` aller 7 Strategien ergab **3 Funde in 2 Strategien**:

- `ko` (doppelt): `focus[1]` UND `risikenText` enthielten wortwörtlich
  "…das Rückschlagrisiko im Modell erhöhen" — unverändert seit v2.22.4,
  nie an die später eingeführten REASONING-GUARDRAILS angepasst.
- `cc`: `focus[2]` war selbst als Kriterium **namens** "Stabilitaet/
  Etabliertheit" definiert — wahrscheinlicher Hauptursprung der
  wiederholten "stabil"/"vorhersehbar"-Funde bei `cc`/`collar`.
- `csp_wheel`: `focus[0]` enthielt "Wie attraktiv ist die aktuelle
  Prämie" — Verstoß gegen ein bereits bestehendes explizites Verbot.

`atmna`, `weekly_income`, `collar`, `momentum` sauber befunden.
Zweiter P0-Punkt (Score-Flatting-Regel bei `ko` griff nicht) — kein
Code-Fund, als statistische Restfehlerquote eingeordnet.

**Proaktiver Audit der 7 noch unmigrierten Strategien** (dieselbe
Methodik, vor der eigentlichen Migration): `swing`/`fading_short`
hatten konkrete Stop-Loss-Einladungen (gefixt), `dividend`/`value`
hatten CSP-Strike-Empfehlung bzw. "fairen Wert"-Berechnung eingeladen
(gefixt). `breakout`/`vcp`/`meanrev` sauber.

---

## 2. P2 vollständig abgeschlossen: 14/14 Strategien migriert

`breakout`, `vcp`, `swing`, `meanrev`, `fading_short`, `dividend`,
`value` migriert — jeweils mit strategie-eigenem `principle`/
`risikenText`/`tradeoffKontext`, nicht nur Struktur-Copy-Paste:

- **`breakout`**: verhindert proaktiv "Überdehnung"-Framing aus
  EMA200-Abstand (Fund im alten Fünf-Abschnitte-Output sichtbar,
  bevor migriert). `tradeoffKontext`: "Ausbruchsfrische ↔
  Bestätigungsrisiko".
- **`vcp`**: klärt SEPA/EMA200 als Proxy, NICHT Ersatz für echte VCP-
  Kontraktionsdaten (die im Datenpfad tatsächlich fehlten, mehrfach
  bestätigt). `tradeoffKontext`: "Kontraktionstiefe ↔ Ausbruchs-
  Bestätigungsspielraum".
- **`swing`**: `tradeoffKontext` reflektiert die drei Mustertypen
  (Pullback/Breakout/Reversal) statt eines einzelnen Zielkonflikts.
- **`meanrev`**: fixt eine live beobachtete Strategie-/Indikator-
  Verwechslung (EMA200-Abstand fälschlich als RSI-Überverkauftheit
  interpretiert).
- **`fading_short`**: erste vollständige KO-Style-Guardrail-Familie
  für die Short-Richtung (Underlying≠Produkt, RSI≠KO-Abstand,
  HVP≠Hebel, Gap-Risiko via `homeMarket`, Score≠Gewinnwahrscheinlichkeit).
- **`dividend`/`value`**: Yield-Trap- bzw. Value-Trap-Konzepte explizit
  verankert, `analystUpside` als externe (nicht UIQ-eigene) Kennzahl
  markiert.

**Wichtiger Fund unterwegs**: Zwei gespiegelte/generische Guardrail-
Erweiterungen aus Live-Tests — die numerische Plausibilitätsregel
wurde um den umgekehrten Fall ergänzt ("geteilt"/"identisch" nur bei
tatsächlich gleichen Werten, nicht nur ähnlicher Größenordnung,
Fund: VOD/GLEN.L bei `breakout`), und das Kausalitätsverbot wurde um
modal gehedgte Umgehungsformen erweitert ("kann … führen" ist genauso
verboten wie "führt zu", Fund bei `swing`).

Adversarialer Test aller live erreichbaren migrierten Strategien
durchgeführt (`breakout`, `vcp` je 2×, `swing` 2×, `meanrev` 2×) —
alle bestätigt sauber nach den jeweiligen Fixes. `fading_short` war
zunächst fälschlich als "live testbar" eingeschätzt worden (eigener
Fehler, unten unter „Korrekturen" vermerkt).

---

## 3. Architektur-Klarstellung: vier getrennte UI-Entry-Points

Wichtigste strukturelle Erkenntnis des Tages. Es gibt vier
unabhängige Wege, wie ein Nutzer eine KI-Strategieanalyse auslösen
kann:

| Pfad | Funktion | Prompt-Engine (vor heute) |
|---|---|---|
| Scanner-Tab "KI-Briefing" | `openKiBriefing()` | `KoPrompts.get()` ✅ |
| Options-Desk (5 Buttons) | `runOptionsKiBriefing()` | `KoPrompts.get()` ✅ |
| **Alpha Desk Leaderboard-Reihe (13 Tabs)** | `runAlphaLbKI()` | **`getKiSystemPrompt()`** ❌ |
| `runValueKiBriefing()` (separat) | — | `KoPrompts.get()` ✅ |

**Nur Alpha Desk lief noch auf der alten, deutlich schwächer
abgesicherten `_getSystemPrompt()`-Familie** — und zwar für **alle**
13 Leaderboard-Tabs, nicht nur Equity-Strategien: auch `options_csp`/
`options_cc` liefen hier parallel ungehärtet, obwohl für dieselben
zwei Strategien im separaten Options-Desk-Tab bereits ein sauberer
9-Punkte-Pfad existierte.

**Fix (`index.html` v491)**: `runAlphaLbKI()` ruft jetzt
`KoPrompts.get(strat, ctx)` auf. Gleichzeitig den stillen Fallback
auf `'momentum'` entfernt (Ursache des `short_fading`-Mislabeling-
Bugs, s. u.) — ein unbekanntes Leaderboard zeigt jetzt einen klaren
Fehler statt eine falsche Strategie-Config zu verwenden.

**Direkte Konsequenz**: `dividend`/`value` waren zuvor über
**keinen** funktionierenden UI-Pfad überhaupt erreichbar — durch
diesen Umbau zum ersten Mal live nutzbar.

---

## 4. Drei eigenständige Bugs gefunden und gefixt

1. **`short_fading`-Mislabeling** (`index.html` v490): eine Alt-Kachel
   ("🔝 Fading Short", ohne `_ko`-Suffix) hat keinen `STRATEGIES`-
   Eintrag — `stratFromLb()` gab `null` zurück, der alte Code fiel
   still auf `'momentum'` zurück. Titel/Instruktionen zeigten
   Momentum-Config, während der Datenkontext weiter "SHORT_FADING"
   hieß — das Modell erfand sich daraufhin selbst eine Strategie-
   beschreibung. Sofortmaßnahme: Button deaktiviert (`_noMetricsLBs`),
   Design-Frage (entfernen/zusammenführen/neu aufsetzen) bleibt offen.

2. **Fehlende Pflicht-Fußzeile im Alpha-Desk-Modal** (`index.html`
   v492): `runAlphaLbKI()` baute sein Modal komplett eigenständig auf
   und übernahm nie die statische Fußzeile ("Daten-Synthese · Keine
   Anlageberatung…"), die `openKiBriefing()`s Modal seit jeher fest
   hatte. Kein Prompt-Fehler — reines UI-Rendering-Versehen, gefixt.

3. **Fehlende Felder im Datenpfad** (`market_aggregator.py`, s.
   Abschnitt 5).

---

## 5. Datenfluss-Root-Cause: drei Ebenen in zwei Dateien

Fortsetzung des `homeMarket`-Themas vom Vortag. Diagnostiziert über
den Live-Test-Vergleich `ko_long` (funktionierte, zeigte `homeMarket`)
vs. `dividend` (funktionierte nicht, zeigte nur Fundamentaldaten):

- **`index.html`**: `topResults.push()` fehlten RSI/ATR/HVP/MACD/OBV/
  VCP-Felder — bereits am 05.09. gefixt (v489), betraf den Scanner-
  Tab-Pfad.
- **`market_aggregator.py`** (heute neu diagnostiziert, zwei Lücken):
  1. `scored.append()` (die Quelle für `top20()`) nahm `homeMarket`/
     `tightnessPct`/`sma150`/`rsRating` nie auf, obwohl `top20()`s
     `_core`-Liste sie längst referenzierte — betraf alle 11
     "generischen" Leaderboards.
  2. `long_dividend`/`long_value` werden nach dem Fundamental-
     Enrichment **komplett neu gebaut** (`_rebuild_fundamental_lb()`)
     mit einem noch kleineren, separaten Feldsatz — keine
     technischen Kern-Felder überhaupt. Live bestätigt: der erste
     `dividend`-Test zeigte ausschließlich Fundamentaldaten.
  Beide Stellen auf dieselbe `_core`-Feldliste umgestellt.

**Wichtige Fußnote, die zu einem eigenen Diagnose-Umweg führte**: Nach
dem Aggregator-Fix + GHA-Run zeigte ein erneuter `dividend`-Test
weiterhin das alte Fünf-Abschnitte-Format (obwohl `ko_long` im selben
Test bereits das neue 9-Punkte-Format zeigte). Root Cause: `index.html`
bindet `ko-prompts.js` über einen **hartcodierten jsDelivr-Commit-
Hash** ein (`@1e58ae7`, zeigte auf v2.43.0 — vor der dividend/value-
Migration). Nach Aktualisierung des Pins auf den v2.44.0-Commit lief
alles korrekt. **Dieser manuelle Schritt (Hash-Pin nach jedem
`ko-prompts.js`-Commit aktualisieren) ist ein wiederkehrender
Stolperstein und ein guter Kandidat für spätere Automatisierung.**

---

## 6. Serverseitige Zweitkontrolle etabliert (`ko-ai.js` v1.16 → v1.17)

Nach der Entscheidung, die Ticker-Scope-Sperre und die "stabil"-
Wortfamilie nicht weiter promptseitig zu härten (abnehmender
Grenznutzen nach vier bzw. drei Verteidigungsschichten), wurde der
bereits bestehende `COMPLIANCE_PATTERNS`-Mechanismus in `ko-ai.js`
erweitert statt neu erfunden:

- **"stabil"-Wortfamilie** ergänzt (4 neue Muster) — bewusst OHNE
  "nachhaltig" (legitimer, hochfrequenter Gebrauch bei dividend/value,
  würde das Signal-Rausch-Verhältnis zerstören).
- **Neue `scanForTickerScopeViolations()`-Funktion**: strukturelle
  Prüfung (kein einfacher Regex), ob Abschnitt 4-9 Ticker nennt, die
  nicht in Abschnitt 3 stehen. Beim Selbsttest sofort False Positives
  aus Abschnittsüberschriften entdeckt und gefixt, bevor ausgeliefert.
- Beide Scans bleiben **nicht blockierend, nur loggend** (bestehendes
  Prinzip), abrufbar über den bestehenden `/logs`-Endpunkt.
- Wichtiger Nebenfund: "attraktiv" wurde bereits seit Wochen erkannt
  (nicht neu) — der heutige `dividend`-Fund war also schon geloggt,
  nur nicht sichtbar für Axel im Gespräch.

---

## 7. Zwei bisher inaktive Leaderboards untersucht, eines reaktiviert

Bestandsaufnahme der drei verbliebenen deaktivierten Alpha-Desk-
Kacheln ergab drei strukturell unterschiedliche Situationen:

| Kachel | Echte Scoring-Funktion? | `STRATEGIES`-Eintrag? |
|---|---|---|
| **Breakdown** | ✅ `score_short_breakdown()` | ❌ → **heute ergänzt** |
| **Fading Short** (ohne `_ko`) | ✅ `score_short_fading()` | ❌ → offene Design-Frage |
| **KO-Short** (`_ko`) | ❌ keine Scoring-Funktion | ✅ (04.09. gebaut) |

**`breakdown` migriert** (`ko-prompts.js` v2.45.0) — erste **echte
Short-Equity-Strategie** (kein KO-Zertifikat). Zwei neue, strategie-
eigene Guardrail-Konzepte: **unbegrenztes Verlustrisiko** bei direkten
Leerverkaufspositionen (Gegensatz zu Long: max. Verlust = Kapital-
einsatz) und **Short-Squeeze-Risiko** (`squeezeRisk`-Feld, ≥70
kritisch — laut Aggregator-Kommentar "hartes Gate für alle Short-
Strategien", aber bisher in KEINER Strategie, auch nicht
`fading_short`, explizit abgebildet — **nicht rückwirkend
nachgetragen, für später vorgemerkt**). `index.html` v494: `short_
breakdown` aus allen drei betroffenen Deaktivierungslisten entfernt.

---

## 8. Korrekturen eigener Fehleinschätzungen (zur Ehrlichkeit vermerkt)

1. Ursprünglich angenommen, `fading_short` sei über den Scanner-Tab
   live testbar — beruhte auf ungeprüfter Übernahme von Axels erster,
   unpräziser Aussage. Per Screenshot widerlegt: die Scanner-Tab-
   Dropdown-Liste enthält `fading_short` gar nicht. Zwischenzeitlich
   korrigiert.
2. Bei der Migration von `meanrev` versehentlich den veralteten
   Remote-Stand über die lokale Arbeitskopie kopiert (hätte die
   `swing`-Migration überschrieben) — sofort bemerkt und aus dem
   letzten Output wiederhergestellt, bevor weitergearbeitet wurde.

---

## 9. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.45.0 | Fertig, **noch nicht committed** — Axel muss committen + jsDelivr-Hash-Pin danach aktualisieren |
| `axel-scanner/index.html` | v494 | Fertig, **noch nicht deployed** |
| `ko-aggregator/market_aggregator.py` | — (homeMarket/tightnessPct-Fix) | Committed, GHA-Lauf bereits durchgeführt |
| `ko-aggregator/workers/ko-ai.js` | 1.17 | Committed und deployed |

**Migrationsstand: 15 von 15 bekannten Strategien** (14 aus dem
9-Punkte-Sprint + `breakdown` neu).

---

## 10. Plan für morgen

**Priorität 0 — heutige Dateien deployen, falls noch nicht
geschehen.** `ko-prompts.js` v2.45.0 committen, jsDelivr-Hash-Pin in
`index.html` aktualisieren (nicht vergessen — das ist der Schritt,
der heute schon einmal übersehen wurde), `index.html` v494 deployen.
Danach `breakdown` live testen (adversarialer Erst-Test, analog zu
den anderen Equity-Strategien).

**Priorität 1 — offene Design-Frage `short_fading` (ohne `_ko`)
klären.** Entfernen, mit `short_fading_ko` zusammenführen, oder als
eigenständiges Konzept mit eigenem `STRATEGIES`-Eintrag neu aufsetzen
(hat bereits echte Scoring-Daten wie `breakdown` hatte).

**Priorität 2 — `short_fading_ko` (KO-Short) Scoring-Funktion.**
Einzige der drei Kacheln, die echte neue Python-Logik braucht
(`score_fading_short()` existiert nicht) — andere Art Arbeit als
heute, eher ein eigener kleiner Entwurfsschritt.

**Priorität 3 — Squeeze-Risiko-Nachtrag bei `fading_short` prüfen.**
Der Aggregator-Kommentar zu `calc_squeeze_risk()` besagt, das Gate
gelte für "alle Short-Strategien" — `breakdown` hat es jetzt, `fading_
short` (noch) nicht. Kurz prüfen, ob das nachgezogen werden sollte,
sobald `fading_short` selbst wieder relevant wird (aktuell weiterhin
ohne Entry-Point, s. Protokoll vom 05.09.).

**Priorität 4 — Evidenzregister-Ergänzungen vom 04.09. einarbeiten.**
Die fünf Punkte (Peer-Review-Tag, Stichproben-Unabhängigkeit, Faktor-
Zerfall-Limitation, Geo-Übertragbarkeit, Regime-Versionierung) stehen
weiterhin nur als Diskussionsgrundlage im Gesprächsverlauf, noch
nicht im Dokument selbst.

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
- Serverseitige zweite Verteidigungslinie in `ko-ai.js` für
  `getKiSystemPrompt()` selbst — durch den heutigen `runAlphaLbKI()`-
  Umbau kleiner geworden (Alpha Desk nutzt jetzt `KoPrompts.get()`),
  aber `getKiSystemPrompt()` wird vermutlich noch an anderer Stelle
  aufgerufen (nicht heute verifiziert, ob noch aktive Aufrufer
  existieren — falls nicht, könnte die ganze Funktion sogar
  entfernbar sein).
- `degraded_status`-Route in `ko-sync-worker.js`.
- Finnhub/TwelveData serverseitig (Cloudflare-Worker-Secrets).
- Kanonische Metriken-Pipeline (v2.0/Phase 3).
- Repo-Privatstellung (`ko-modules`).
- VIX/VVIX/SKEW Client/Server-Aufspaltung, CC-Wheel-Kontext-Flag,
  EIC-Schritt-7, ~38 verbleibende Ampel-Texte, `my-cors-proxy`
  versionieren, Legal-Briefing-Vorbereitung.

**Parallel-Projekt (`ahsub/regime-test`):** unverändert, heute nicht
bearbeitet.

---

## 12. UI-Parität Scanner-Tab ↔ Alpha Desk (später am Tag, `index.html` v494→v495)

Axel identifizierte eine grundsätzliche Anforderung: jede 9P-ready
Strategie soll in **beiden** UIs mit **identischer** Bezeichnung
erscheinen. Bestandsaufnahme ergab mehrere Lücken/Diskrepanzen:

- **Namenskonflikt**: Alpha Desk zeigte "🚀 Minervini" für dieselbe
  Strategie, die Scanner-Tab "📈 Momentum" nennt (bewusste, dokumentierte
  Entscheidung aus einem früheren Sprint, v342). Geeinigt auf
  "Momentum" als kanonischen Namen (Konsistenz-Argument: VCP/Breakout
  nutzen ebenfalls Minervini-Methodik, tragen aber keinen Methodennamen;
  "Momentum" ist zudem bereits die `ko-prompts.js`-Bezeichnung).
- **4 fehlende Scanner-Tab-Buttons** für bereits migrierte Strategien:
  Covered Call (`cc`), Value (`value`), Breakdown (`breakdown`),
  KO-Short (`fading_short`) — alle vier ergänzt, sofort funktionsfähig
  (Scanner-Tab braucht anders als Alpha Desk keine eigene Scoring-
  Funktion pro Strategie).
- **1 deaktivierter Platzhalter** für "Fading Short" (ohne `_ko`) —
  hat keinen `STRATEGIES`-Eintrag (offene Design-Frage), rein visuell,
  eigene CSS-Klasse (`ki-strat-btn-placeholder`), damit der Button-
  Reset-Loop ihn nicht mit-verändert.
- **Nebenbei-Bugfix**: `setKiStrat()` enthielt toten Sonderfall-Code
  für einen `value`-Button (dauerhaft gedimmt), der bis heute nie
  existierte — hätte den neuen `value`-Button fälschlich ausgegraut
  dargestellt. Entfernt.

**Bewusst zurückgestellt für morgen** (Axel-Entscheidung): Scanner-Tab
und Alpha Desk nutzen unterschiedliche Dateninfrastruktur für die
Kandidatenauswahl — `openKiBriefing()` (Scanner-Tab) sortiert für
**alle** Equity-Strategien nach demselben generischen `compositeScore`,
während `runAlphaLbKI()` (Alpha Desk) bereits die strategie-eigenen
Scores (`sMinervini`/`sSwing`/`sMrLong`/etc.) nutzt. Dieselbe Strategie
kann dadurch in beiden UIs unterschiedliche Kandidaten zeigen — button-
/label-mäßig jetzt vereinheitlicht, inhaltlich (welche Titel als "Top"
gelten) noch nicht. Vermutlich unaufwendig zu fixen, da die strategie-
eigenen Scores laut Aggregator-Kommentar bereits im client-seitigen
`tickerData` vorliegen. Zusatzfund dabei: `calc_ko_short_leverage()`
ist bereits an `sFading` gekoppelt — `KO-Short` (Priorität 2 von
morgen) braucht vermutlich **keine neue Scoring-Funktion**, nur einen
Leaderboard-Eintrag, der `sFading`-Kandidaten wiederverwendet.

---

## 13. Aktualisierter Versionsstand (nach Abschnitt 12)

| Datei | Version |
|---|---|
| `axel-scanner/index.html` | **v495** (weiterhin nicht deployed) |

---

## 14. Ergänzter Plan für morgen (ersetzt Priorität 0 aus Abschnitt 10)

**Priorität 0 — alle heutigen Dateien deployen.** `ko-prompts.js`
v2.45.0 committen + jsDelivr-Hash-Pin aktualisieren, `index.html`
v495 deployen (enthält bereits v494s `breakdown`-Aktivierung).

**Priorität 1** (wie zuvor) — offene Design-Frage `short_fading`.

**Priorität 2 — Dateninfrastruktur-Parität** (neu, aus Abschnitt 12):
`openKiBriefing()` so erweitern, dass es pro Strategie das passende,
bereits vorhandene Score-Feld nutzt statt immer `compositeScore`.
`KO-Short`-Leaderboard-Eintrag ergänzen (vermutlich `sFading`
wiederverwenden + `koShortLev` als Zusatzfeld, keine neue Scoring-
Funktion nötig).

Restliche Prioritäten (3-4) aus Abschnitt 10 unverändert gültig.

---

## 15. Methodische Erkenntnisse des Tages


1. **Ein einzelnes Beispiel in einer Guardrail-Regel generalisiert
   nicht zuverlässig.** Die Andienungswahrscheinlichkeits-Regel hatte
   nur ein RSI/Put-Beispiel — das Modell übertrug das nicht von
   selbst auf EMA200-Abstand/Call bei `cc`. Zwei parallele, strukturell
   ähnliche Beispiele verankern robuster als eines.
2. **Gespiegelte Fehler verdienen dieselbe Aufmerksamkeit wie die
   Originalfunde.** "Unterschiedliche Werte fälschlich gleich
   behandeln" und "unterschiedliche Werte fälschlich als geteilt
   behandeln" sind zwei Seiten derselben numerischen Plausibilitäts-
   lücke — beide gehören in dieselbe Regel.
3. **Modal-gehedgte Sprache umgeht Wortverbote, wenn das Verbot nur
   den ungehedgten Wortlaut abdeckt.** "Kann zu X führen" ist inhaltlich
   dieselbe Kausalbehauptung wie "führt zu X" — das Verbot muss auf
   den Inhalt zielen, nicht nur die exakte Grammatikform.
4. **Ein CDN-Hash-Pin ist ein stiller Single-Point-of-Failure.** Ein
   Code-Fix, der committed, aber dessen Pin nicht aktualisiert wurde,
   sieht von außen wie "gar kein Fix" aus — schwer zu diagnostizieren,
   wenn man nicht gezielt danach sucht (wie heute zweimal geschehen).
5. **Toter Code für eine geplante, aber nie gebaute Funktion kann
   Jahre unbemerkt bleiben, bis genau diese Funktion gebaut wird.**
   Der `value`-Sonderfall in `setKiStrat()` wartete vermutlich seit
   der ursprünglichen Anlage auf einen Button, der erst heute gebaut
   wurde — ein guter Grund, beim Hinzufügen neuer UI-Elemente kurz zu
   prüfen, ob bereits vorbereitender (evtl. veralteter) Code dafür
   existiert.
