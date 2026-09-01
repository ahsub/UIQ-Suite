# UEBERGABE-2026-09-01.md

Fortsetzung von `UEBERGABE-2026-08-31.md`. Heute: Priorität 0 aus dem
gestrigen Plan (`OWNER_TOKEN` sauber einrichten) abgeschlossen — inkl.
eines bisher unbekannten zweiten Betroffenen (`ko-sync-worker.js`) und
zweier Klartext-Token-Vorfälle im Zuge der Diagnose (`OWNER_TOKEN`,
Finnhub-Key), beide rotiert. Anschließend Priorität 1 (Live-Tests
csp_wheel/atmna/weekly_income/cc gegen `ko-prompts.js` v2.18.0)
vollständig durchgeführt. Priorität 2 (Collar `risikoBegriff`/
`risikenText`) war durch einen Live-Aufruf im Rahmen der Token-Diagnose
bereits inhaltlich mit abgedeckt. Kein neuer Code-Fix deployed — alle
heutigen Funde sind für morgen vorgemerkt.

---

## 1. Priorität 0 — OWNER_TOKEN sauber eingerichtet

### 1.1 Ursprüngliches Problem

Laut 31.08.-Protokoll erkannte `ko-ai.js` den im Frontend hinterlegten
KI-Zugangs-Token als `STATIC_TOKEN` statt als `OWNER_TOKEN`, obwohl Axel
Owner ist — dadurch lief das reguläre 6/Tag-Limit für `ki_briefing`
gestern leer und blockierte Priorität 4.

### 1.2 Diagnose-Weg

- `OWNER_TOKEN` existierte in Cloudflare (`ko-ai`) bereits als eigener,
  separater Secret-Eintrag — die erste Hypothese ("noch gar nicht
  gesetzt") war damit widerlegt. Cloudflare zeigt Secret-Werte nicht im
  Klartext an, ein direkter Vergleich war also nicht möglich.
- Statt zu vergleichen: `OWNER_TOKEN` und `STATIC_TOKEN` beide neu
  gesetzt (unterschiedliche, frische Werte), im Frontend nachgezogen.
- `ko-ai.js`-Code gemeinsam durchgesehen: die `isOwner`-Verzweigung
  selbst (`const isOwner = !!env.OWNER_TOKEN && token === env.OWNER_TOKEN`,
  danach `rl = isOwner ? {...Infinity} : await checkRateLimit(...)`) war
  strukturell korrekt — kein Logikfehler.
- Erkenntnis: die Erfolgs-Response (`{ text, model }`) verrät nie, ob
  `isOwner` gegriffen hat — nur die 429-Antwort enthält `rl.limit`/
  `rl.used`. Ein normaler Live-Test allein kann die Frage also nicht
  beantworten.
- Verifikationsweg gefunden: `/logs?rl=1` liefert `rateLimitsToday`
  (alle KV-Zähler des Tages). Da `checkRateLimit()` bei `isOwner: true`
  gar nicht erst aufgerufen wird, taucht ein Owner-Request dort nicht
  auf.
- Erster Versuch scheiterte mit "Unauthorized" — Ursache: `/logs` prüft
  laut Code (`if (!env.STATIC_TOKEN || adminToken !== env.STATIC_TOKEN)`)
  ausschließlich gegen `STATIC_TOKEN` als Query-Parameter, unabhängig
  von `OWNER_TOKEN` — ein separater, dritter Auth-Pfad im selben Worker.
  Kein Bug, schlicht der falsche Token für diesen speziellen
  Admin-Endpoint. Zusätzlich hatte ein Copy-Paste-Fehler (Platzhalter-
  Spitzklammern `< >` versehentlich mit eingetippt) den ersten
  Korrekturversuch verhindert.
- Zur endgültigen Absicherung ein temporärer, sensibler Debug-Log
  (`ko-ai.js`, direkt vor dem `STATIC_TOKEN`-Vergleich in `/logs`)
  eingebaut — bewusst nur Längen + Boolean-Match, kein Klartext-Token.
  Deployed, Testaufruf, Log geprüft, danach sofort wieder entfernt
  (bereinigte v1.16 redeployed).

### 1.3 Ergebnis — Owner-Pfad verifiziert

Ein Live-`ki_briefing`-Aufruf über das Frontend (Owner-Token) erschien
anschließend **nicht** in `rateLimitsToday` (`[]`) — bestätigt: der
`isOwner`-Pfad greift korrekt, `checkRateLimit()` wird für Axel korrekt
übersprungen. **Priorität 0 damit abgeschlossen.**

### 1.4 Unerwarteter zweiter Betroffener — ko-sync-worker.js

Nach der `OWNER_TOKEN`-Rotation traten neue, bis dahin nicht aufgetretene
401-Fehler auf: `ko-sync.ahildebrand.workers.dev/public/master_market_data`
und `/public/degraded_status`. Ursache: `ko-sync-worker.js` verwendet
für seine `/public/*`-Routen (`master_market_data`, `options_watchlist`,
`daily_market_snapshot`, `daily_market_snapshot_us`) exakt denselben
`Authorization: Bearer <OWNER_TOKEN|STATIC_TOKEN>`-Mechanismus wie
`ko-ai.js` — aber als **eigenständiges, komplett separates** Cloudflare-
Secret-Paar. Die Rotation bei `ko-ai` hatte `ko-sync` nicht mitgezogen.
Nach Nachziehen des neuen `OWNER_TOKEN`-Werts auch bei `ko-sync`:
zunächst weiterhin 401 (vermutlich kurze Cloudflare-Propagations-
verzögerung nach Redeploy, ähnliches Muster wie beim `STATIC_TOKEN`-
Edge-Delay im 31.08.-Protokoll §3), löste sich nach kurzer Zeit von
selbst — beim nächsten Reload lud `master_market_data` sauber (735
Ticker, frische VVIX/SKEW/VIX-Ratio-Werte).

**Neuer Backlog-Punkt (Konsequenz):** `OWNER_TOKEN`/`STATIC_TOKEN`
existieren jetzt nachweislich als zwei unabhängige Secret-Paare in zwei
Workern (`ko-ai`, `ko-sync`). Eine künftige Rotation muss beide
Worker berücksichtigen — bisher nirgends dokumentiert. Sollte in
`RUNBOOK.md`/`STRATEGIE.md` festgehalten werden.

### 1.5 ko-sync-worker.js — weitere Beobachtungen (Nebenfunde, nicht Teil des Token-Problems)

- `ko-sync-worker.js` hat einen **dritten**, komplett separaten
  Auth-Mechanismus für seine `/sync/*`-Routen: ein `X-UIQ-Token`-Header
  ("UIQ-Sync-Token"), 6–32 Zeichen, eigenes Format (`a-zA-Z0-9_-`),
  unabhängig von `OWNER_TOKEN`/`STATIC_TOKEN`. `degraded_status` (im
  aktuell gesehenen Worker-Stand keine `/public/*`-Route) fällt durch
  zu diesem Zweig und scheitert mit "Kein UIQ-Sync-Token gesetzt" — das
  ist kein Owner/Static-Problem, sondern eine fehlende/falsch
  geroutete Frontend-Anfrage. Ursache noch nicht untersucht.
- `market_strip_snapshot` (400, nicht 401): der Key
  `"market_strip_snapshot"` steht nicht in der `ALLOWED_KEYS`-Liste
  des Workers (`watchlist`, `backlog_winners`, `backlog_oversold`,
  `backlog_tracking`, `scan_results`, `admin_settings`,
  `alert_watchlist`). Frontend/Worker-Mismatch, unabhängig von unserem
  Token-Thema — noch nicht behoben, für morgen vorgemerkt.
- `ko-auth.ahildebrand.workers.dev/verify` liefert weiterhin 401 mit
  Fallback "admin (Phase 1)" — laut 31.08.-Protokoll bekannter, bewusster
  Dummy-Zustand, kein neuer Fund.

### 1.6 Zwei Klartext-Token-Vorfälle im Zuge der Diagnose (beide behoben)

- Der neu gesetzte `OWNER_TOKEN`-Wert erschien im Klartext in einem
  Browser-URL-Screenshot (`/logs?rl=1&token=...`) während der
  gemeinsamen Diagnose. Rotiert (zweites Mal), an beiden Stellen
  (Cloudflare `ko-ai` **und** `ko-sync` — s. §1.4) sowie im Frontend
  nachgezogen.
- Der Finnhub-API-Key erschien im Klartext in `my-cors-proxy`-
  Fehler-URLs (403/429 bei Earnings-Calendar-Abrufen für mehrere Ticker,
  z. B. AAL.L, RWE.DE, VRTX, GLEN.L, BKR, COP). Rotiert (Finnhub-
  Dashboard).
- Beide Vorfälle vom gleichen Grundmuster wie der Anthropic-Key-Leak
  vom 31.08. — Klartext-Secrets in URLs, die für Debug-Zwecke geteilt
  wurden. Kein Root-Cause-Fix am zugrundeliegenden Verhalten (Frontend
  hängt Tokens weiterhin als Query-Parameter an) vorgenommen — bleibt
  ein latentes Muster, s. Backlog unten.

---

## 2. Priorität 1 — Live-Tests csp_wheel/atmna/weekly_income/cc gegen v2.18.0

Alle vier durchgeführt (Public-Modus), strukturell gegen den "UIQ
Options Coaching Standard" (Model Signal→Evidence→Risk→Trade-off→
Model Boundary→External Validation, s. 30.08.-Protokoll) sowie gegen
`COMPLIANCE_PATTERNS` geprüft.

### 2.1 csp_wheel — strukturell sauber, ein Compliance-Fund

a)-d)-Kette (Positive Faktoren/Risikofaktoren/Strategischer
Zielkonflikt/Modell-Grenze) korrekt in allen drei Titeln (RTX, SE,
SBGSY). Kein Leck aus dem Collar-`holding_review`-Modus.

**Fund:** "Prämienerwartung" im Fließtext (SBGSY, Risikofaktoren) —
wortwörtlich verbotener Begriff aus `PUBLIC_REGULATORY_GUARDRAIL`
(Guardrail-Instruktion allein reichte nicht). Zweiter unabhängiger
Live-Beleg desselben Wortes am selben Tag (s. §2.5) — deutet auf ein
systemisches, nicht einmaliges Vorkommen hin.

### 2.2 atmna — strukturell sauber, HVP-Kompressionsregel-Lücke bestätigt

a)-d)-Kette korrekt (RTX, SE, HON). Ein Compliance-Pattern-Treffer
("Volatilitätskompression") — bei erster Durchsicht fälschlich als
harmlos eingeordnet (Begründung: Satz spreche von künftigem IV-Rückgang,
nicht von HVP-Bedeutungsumkehr); nach Rückgriff auf das *ursprüngliche*
Reviewer-Feedback zum Collar-Test (s. §4) korrigiert: der Reviewer
verlangt explizit, dass "Kompression" **nirgends** aus HVP abgeleitet
werden darf, unabhängig vom Satzkontext. Fund bestätigt: die
HVP-Kompressionsregel wurde am 31.08. nur im Collar-Prompt verankert
(P0 des 31.08.-Zyklus), nicht in `ki_briefing_public`/atmna. Muss
morgen auf alle Strategie-Prompts ausgeweitet werden.

### 2.3 weekly_income — strukturelle Abweichung vom Coaching-Standard

Kein Compliance-Pattern-Treffer. Aber: der Satz "Das Modell liefert
hier keinen eindeutigen Hinweis..." (Model Boundary) steht bei allen
drei Titeln (RTX, SE, HON) im Fließtext des Zielkonflikt-Absatzes,
während der separate "Modell-Grenze"-Abschnitt stattdessen für External
Validation ("...im Broker zu prüfen") verwendet wird — bei csp_wheel/
atmna/cc sind diese beiden Schritte sauber getrennt. Isolierte
Abweichung, nur bei weekly_income beobachtet.

**Nebenklärung:** RSI-Werte für BA/CARR/HII im Risiken-Abschnitt
(Ticker außerhalb der Top-3-Setups) — Scanner-Live-Abgleich bestätigt:
keine Datenvermischung, sondern korrekte aktuelle Watchlist-weite
RSI-Extremwerte (BA RSI 9, CARR RSI 12, HII RSI 16, exakt deckungsgleich
mit dem Scanner). Leichte Abweichung zum Collar-Output vom selben Tag
(BA RSI 11, HII RSI 15) durch normalen zeitlichen Versatz zwischen den
Aufrufen erklärt, kein Fehler.

### 2.4 cc (Covered Call) — strukturell sauber, zwei neue Compliance-Funde

a)-d)-Kette korrekt (RTX, ZBRA, SE), "Modell-Grenze" hier wieder korrekt
für Model Boundary verwendet (bestätigt: die weekly_income-Vertauschung
ist isoliert, kein generelles Problem).

**Fund 1 — Regex-Lücke:** "attraktiveren" (RTX, Positive Faktoren: "...
die typischerweise mit attraktiveren Optionsprämien korreliert") wird
vom `attraktiv`-Pattern (`/\battraktiv(?:e|er|es|en)?\b/i`) nicht
erfasst — die Endungsgruppe deckt `-eren` (Komparativ) nicht ab, das
Wort rutscht durch den Scanner. Gleicher Fundtyp wie der
"unnötig/nicht erforderlich"-Fix vom 31.08. (v1.16): Wortform-Lücke bei
sonst korrekt erkanntem Grundwort.

**Fund 2 — unsicher, mögliche Umgehung:** "solides Prämienumfeld" (SE)
und "solide Volatilitätsumfeld" (RTX, Marktumfeld) — inhaltlich
dieselbe ökonomische Tatsachenbehauptung wie das bereits verbotene
"günstiges Prämien-/Volatilitäts-Umfeld", aber mit "solide" statt
"günstig" formuliert, umgeht damit den bestehenden Regex
(`günstiges?\s+(Prämien|Volatilitäts)-?Umfeld`). Nicht abschließend
geklärt, ob Zufall oder beginnendes Ausweichmuster — für morgen
vorgemerkt, keine vorschnelle Regex-Erweiterung ohne weiteren Beleg.

### 2.4a Nachtrag — isOwner-Fehlschlag nach zweiter Rotation, aufgeklärt

Nach der zweiten `OWNER_TOKEN`-Rotation (Passwort-Safe, alter Wert
gelöscht, an beiden Stellen — `ko-ai` und `ko-sync` — neu gesetzt und
redeployed, Wert im Frontend nachweislich identisch) trat einmalig ein
"KI-Token ungültig"-Fehlschlag auf. Ein zweiter temporärer Debug-Log
(diesmal korrekt im Haupt-POST-Handler direkt nach der
`isOwner`-Zuweisung, nicht nur im `/logs`-Endpunkt wie beim ersten
Diagnosezyklus) zeigte beim nächsten erfolgreichen Aufruf:
`token.length=64 owner.length=64 isOwner=true matchesStatic=false` —
identische Längen, korrekter Owner-Match. Kein Zeichenfehler. Der
einzelne Fehlschlag war mit hoher Wahrscheinlichkeit eine kurze
Cloudflare-Edge-Propagationsverzögerung nach dem Redeploy (gleiches
Muster wie der `STATIC_TOKEN`-Edge-Delay im 31.08.-Protokoll §3), kein
struktureller Bug. Beide Debug-Logs danach entfernt, bereinigte v1.16
final redeployed.

**Wichtiger Nebenfund während dieses Zyklus:** Priorität-1-Live-Tests
liefen zwischenzeitlich unbemerkt über `STATIC_TOKEN` statt
`OWNER_TOKEN` (Frontend war zwischen den Rotationen offenbar
zurückgefallen/musste manuell auf `STATIC_TOKEN` gestellt werden, um
überhaupt Outputs zu bekommen) — bestätigt über `/logs?rl=1`:
`{"action":"ki_briefing","used":4}` von 6 Tageslimit bereits
verbraucht. Erklärt rückblickend, warum die vier Priorität-1-Outputs
durchweg Public-Modus waren (ohnehin erwartbar, aber jetzt auch über
den Token-Pfad bestätigt) und warum "noch 2 von 6 ki_briefing-Aufrufen"
für den Rest des Tages übrig blieben.

### 2.5 Priorität 2 (Collar risikoBegriff/risikenText) — durch Diagnose-Nebeneffekt mit abgedeckt

Ein Live-Aufruf im Zuge der `OWNER_TOKEN`-Diagnose lieferte einen
Collar/Protective-Put-Output (BA, HII, LMT). Geprüft:
- ✅ Ranking-Anmutungs-Fix ("Reihenfolge ohne Wertung") wörtlich vorhanden
- ✅ risikoBegriff/risikenText-Trennung (P3 vom 31.08.) korrekt: eigener
  Satz für Ausübungsrisiko des Short Calls beim vollen Collar vs.
  reiner Prämienkosten-Hinweis beim Protective Put
- ✅ "Gewinnmitnahme" kommt nirgends vor
- ⚠️ Marktrisiko-vs-Positionsrisiko-Trennsatz nicht wortidentisch
  verifizierbar (kein direkter Soll-Text zur Hand gehabt), aber
  sinngemäß vorhanden
- Derselbe `ki_briefing`-Aufruf (CF-Ray `a3454edfbb47c7bc`, 01.09.2026
  15:29:19 UTC) enthielt ebenfalls einen "Prämienerwartung"+"optimal"-
  Compliance-Treffer — dritter/vierter Beleg für dieselben zwei
  wiederkehrenden Begriffe am selben Tag.

---

## 3. Reviewer-Feedback erneut vorgelegt — Einordnung des heutigen Tages

Axel legte im Laufe der Live-Tests das ursprüngliche, vollständige
Reviewer-Feedback zum damaligen Collar-Test erneut vor (Quelle des
31.08.-P0-Zyklus). Zentrale Punkte, rückblickend gegen die heutigen
Funde abgeglichen:

- Reviewer bestätigt "Strategischer Zielkonflikt" + "Modell-Grenze"
  als das zentrale UIQ-Pattern, das er formal als "MODEL DECISION
  BOUNDARY" im Prompt verankert sehen möchte — deckt sich mit dem, was
  heute bei csp_wheel/atmna/cc konsistent beobachtet wurde, und
  erklärt, warum die weekly_income-Abweichung (§2.3) als Regression
  vom eigentlichen Ziel-Pattern zu werten ist, nicht als Kleinigkeit.
  - Reviewer schlägt zudem vor, "Strategy Fit" bei Protective Put/Collar
  durch "TITEL MIT MODELLBASIERTEM ABSICHERUNGS-HINWEIS" zu ersetzen
  (bereits umgesetzt, s. 31.08.-Protokoll §1.1) und das Ranking
  (LMT/PH/NUE als Liste) zugunsten einer neutraleren Formulierung
  abzuschwächen (ebenfalls bereits umgesetzt: "Reihenfolge ohne
  Wertung", heute live bestätigt, s. §2.5).
- **Zentraler, noch nicht umgesetzter Vorschlag:** eine gemeinsame
  9-Punkte-Prompt-Architektur für alle Optionsstrategien (1. Market
  Context → 2. Model Signal → 3. Candidate Fit → 4. Positive Factors →
  5. Risk Factors → 6. Strategic Trade-off → 7. Model Boundary →
  8. External Validation → 9. Neutral Summary), damit UIQ "wie ein
  konsistentes DSS wirkt, nicht wie vier unterschiedlich sprechende
  KI-Analysten". Laut Reviewer der nächste, größere Qualitätssprung
  nach den bisherigen Einzel-Prompt-Iterationen. Am 31.08. bewusst aus
  dem Umfang des damaligen Zyklus herausgehalten
  ("größerer, eigenständiger Qualitätssprung").
- **Heutige Einordnung:** die weekly_income-Strukturabweichung (§2.3)
  ist kein isolierter Bug, sondern ein konkreter Beleg dafür, dass die
  vier Strategie-Prompts bereits jetzt auseinanderdriften — genau das
  Symptom, vor dem der Reviewer gewarnt hatte. Spricht dafür, das
  9-Punkte-Schema nicht länger aufzuschieben, statt weekly_income
  isoliert zu flicken.

---

## 4. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Commit/Deploy |
|---|---|---|
| `ko-aggregator/workers/ko-ai.js` | 1.16 | unverändert zu gestern inhaltlich; zwei separate temporäre Debug-Log-Zyklen heute (`/logs`-Endpunkt, dann Haupt-POST-Handler), beide verifiziert und wieder entfernt, final bereinigt redeployed |
| `ko-sync-worker.js` | v2.2 (unverändert) | `OWNER_TOKEN`/`STATIC_TOKEN` neu gesetzt (zweimal, s. §1.4/§1.6) |
| `ko-modules/ko-prompts.js` | 2.18.0 (unverändert) | vier Live-Tests heute durchgeführt, kein neuer Fix deployed |
| Anthropic API Key | — | unverändert seit 31.08. |
| OWNER_TOKEN (`ko-ai` + `ko-sync`) | — | zweimal rotiert heute, aktuell aktiv, kein bekannter Leak mehr offen |
| Finnhub API Key | — | rotiert heute |

---

## 5. Plan für morgen

**Priorität 0 — HVP-Kompressionsregel auf alle Strategie-Prompts
ausweiten** (s. §2.2). Aktuell nur im Collar-Prompt verankert; heute in
atmna als fehlend bestätigt. Noch zu prüfen: csp_wheel/weekly_income/cc
(cc enthielt keinen "Kompression"-Treffer, aber noch nicht gezielt
gegen die Regel durchgesehen).

**Priorität 1 — Compliance-Scanner-Regex-Lücken schließen** (analog
dem "unnötig/nicht erforderlich"-Fix vom 31.08.):
- `attraktiv`-Pattern um Komparativ-/Steigerungsformen erweitern
  (mind. "attraktiveren", s. §2.4) — Regex-Endungsgruppe erweitern oder
  auf Wortstamm-Matching ohne feste Endungsliste umstellen. Zusätzlicher
  eigenständiger Live-Beleg für Grundform "attraktiv" (19:57:41 Uhr,
  `[COMPLIANCE] ki_briefing attraktiv`) — bestätigt, dass sowohl
  Grundform als auch Komparativ im Public-Output auftreten.
- "Prämienerwartung" — kein Regex-Problem (Pattern greift bereits
  korrekt), sondern ein Prompt-Befolgungsproblem: **4 unabhängige
  Live-Belege heute** (csp_wheel, 3× ki_briefing, davon einer erst
  19:53:32 Uhr während der zweiten Token-Diagnose). Das ist inzwischen
  der mit Abstand hartnäckigste Einzelfund des Tages — deutet auf ein
  strukturelles Prompt-Problem hin, kein Zufall. Reines
  Scanner-Logging ohne Blockierung (bewusste 29.08.-Designentscheidung)
  gibt dem Modell nie ein Korrektursignal; ein einzelnes Wortverbot im
  Guardrail konkurriert offenbar dauerhaft mit dem, was das Modell als
  "gute Finanzanalyse-Sprache" gelernt hat. Für morgen zwei
  unterschiedliche, nicht konkurrierende Ansatzpunkte:
  1. Guardrail-Text um ein explizites Negativbeispiel + vorgegebene
     Alternativformulierung ergänzen (nicht nur "NIEMALS X", sondern
     "schreibe Y statt X"), sowohl für "Prämienerwartung" als auch
     "attraktiv".
  2. Scanner-Regex-Lücken unabhängig davon schließen (s. oben) — zwei
     getrennte Verteidigungslinien, keine ersetzt die andere.

**Priorität 2 — "solide[s] ... Umfeld" beobachten, nicht vorschnell
fixen** (s. §2.4, Fund 2). Weiteren Live-Beleg abwarten, bevor der
`günstiges-Umfeld`-Regex erweitert wird — Risiko von Übergeneralisierung
bei nur einem Beleg.

**Priorität 3 — weekly_income-Struktur korrigieren** (s. §2.3): Model
Boundary und External Validation im Prompt-Text sauber trennen, analog
csp_wheel/atmna/cc. Kleiner, isolierter Fix — unabhängig vom größeren
9-Punkte-Vorhaben sinnvoll, schon jetzt umsetzbar.

**Strategische Priorität, neu terminiert:** die vom Reviewer
vorgeschlagene gemeinsame 9-Punkte-Prompt-Architektur für alle
Optionsstrategien (s. §3) — am 31.08. bewusst zurückgestellt, heute
durch die weekly_income-Abweichung als konkret beobachtbares Symptom
bestätigt. Kein Teil des morgigen Einzelzyklus, aber sollte als
nächster größerer Sprint eingeplant werden, bevor weitere
Einzel-Prompt-Nachbesserungen die Prompts noch weiter auseinanderlaufen
lassen.

**Neu ins Backlog (heute gefunden):**
- `OWNER_TOKEN`-Rotation muss künftig **beide** Worker (`ko-ai` UND
  `ko-sync`) berücksichtigen — in `RUNBOOK.md`/`STRATEGIE.md`
  dokumentieren (s. §1.4).
- Nach jedem Secret-Redeploy bei `ko-ai`/`ko-sync` mit kurzer Wartezeit
  rechnen, bevor ein Fehlschlag als struktureller Bug gewertet wird
  (zweiter bestätigter Fall einer Cloudflare-Edge-Propagations-
  verzögerung heute, s. §2.4a — sollte ebenfalls ins `RUNBOOK.md`).
- `ko-sync-worker.js` hat einen dritten, separaten Auth-Mechanismus
  (`X-UIQ-Token`) für `/sync/*` — Ursache für den `degraded_status`-
  401 noch nicht untersucht (s. §1.5).
- `market_strip_snapshot`-Key fehlt in `ALLOWED_KEYS` von
  `ko-sync-worker.js` — Frontend/Worker-Mismatch, 400-Fehler (s. §1.5).
- Wiederkehrendes Muster: Klartext-Secrets landen bei Debug-Sessions
  wiederholt in URLs/Screenshots (heute: OWNER_TOKEN, Finnhub-Key;
  gestern: Anthropic-Key). Root Cause (Frontend hängt Tokens als
  Query-Parameter an) nicht behoben — evtl. lohnt sich ein
  grundsätzlicherer Blick, ob sensible Admin-/Debug-Endpoints auf
  Header-basierte statt Query-Parameter-basierte Auth umgestellt
  werden können.

**Weiterhin offen aus dem 31.08.-Protokoll (heute nicht bearbeitet):**
- VIX/VVIX/SKEW Client/Server-Aufspaltung.
- CC-Wheel-Kontext-Flag.
- EIC-Schritt-7 "Handlungsempfehlung".
- Die ~38 verbleibenden Strategie-Ampel-Texte in `ko-market-state.js`.
- `my-cors-proxy` in GitHub versionieren (unverändert offen; heute
  zusätzlich durch mehrfache 403/429-Fehler bei Finnhub-Earnings-
  Abrufen aufgefallen — separates, noch nicht untersuchtes Thema,
  eventuell nur Finnhub-Rate-Limit, nicht Proxy-Bug).
- Legal Briefing an den Fachanwalt vorbereiten (Backlog №36) —
  weiterhin aufgeschoben.

**Parallel-Projekt (`ahsub/regime-test`):** unverändert seit 31.08.,
heute nicht bearbeitet — Ergebnis des Laufs mit `n_trials=5` weiterhin
ausstehend.
