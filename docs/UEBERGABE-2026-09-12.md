## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v1.2 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Das Finden von Lücken ist keine Kritik an der Vorarbeit — es ist der Job
   dieser Session.

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug,
   nie für eine schnelle Plausibilitäts-Antwort.**

6. **NEU (11./12.09.): Zwei Dateien mit fast identischem Namen sind KEINE
   dieselbe Datei.** `market-aggregator.yml` (GitHub-Actions-Workflow) und
   `market_aggregator.py` (das ~11.000-Zeilen-Kernscript) wurden heute
   zweimal in Folge verwechselt — einmal wurde dabei versehentlich das
   komplette Python-Script mit YAML-Inhalt überschrieben (s. Punkt 3 unten).
   Bei Dateinamen, die sich nur in Bindestrich/Unterstrich oder Endung
   unterscheiden: **immer den vollen Pfad UND den Dateityp/Inhalt-Anfang
   explizit benennen**, nicht nur "die Datei".

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# UEBERGABE-2026-09-12

**Für die nächste Session. Schließt an das Übergabeprotokoll vom
10.09.2026 an** (dazwischen keine eigene Protokoll-Datei — die Session vom
Abend des 11.09. lief nahtlos in den 12.09. hinein).

---

## 1. Deployed/Live-Stand (Stichtag Ende 12.09.2026)

| Datei | Version | Repo | Status |
|---|---|---|---|
| `ko-sync-worker.js` | v2.1 | `ahsub/ko-sync` **und** `ahsub/ko-aggregator/workers/` | Live, per curl verifiziert (`/public/digest` liefert echten Digest-Inhalt) |
| `market_aggregator.py` | wiederhergestellt | `ahsub/ko-aggregator` | 11.136 Zeilen, per Code-Lesung verifiziert |
| `market-aggregator.yml` | v1.2 | `ahsub/ko-aggregator` | Neuer Cron (22:00 UTC Mo–Fr), per Code-Lesung verifiziert |
| `tr-backup-saturday.yml` | v1.0, neu | `ahsub/ko-aggregator` | Per Code-Lesung verifiziert |
| `ko-watchdog.js` + `wrangler.toml` | 1 Cron-Slot statt 2 | `ahsub/ko-aggregator` | GitHub verifiziert; laut Axel auch in Cloudflare deployed (von mir nicht selbst per Live-Call geprüft) |
| `index.html` | v510 (20260911-v510 im Meta-Tag) | `ahsub/axel-scanner` | `renderIntradayComparison()` entfernt, Changelog-Eintrag ergänzt — Commit von Axel gemeldet, von mir wegen Indexierungsverzögerung meines eigenen Such-Tools **noch nicht selbst nachverifiziert** |
| `ahsub/workers/cron-trigger/wrangler.toml` | Cron auf 22:00 UTC geändert | `ahsub/workers` | Nur im Repo geändert — **`ko-cron-trigger` existiert nachweislich nicht als Worker in Cloudflare** (vollständige Worker-Liste durchgesehen), reiner Repo-Code ohne Live-Wirkung |

**Zu prüfen zu Beginn der nächsten Session:** `index.html` v510 gegen den
tatsächlichen GitHub-Stand nachverifizieren (Meta-Tag `20260911-v510` +
neuer Changelog-Eintrag), da die eigene Tool-Indexierung am Ende der
Session noch hinterherhinkte.

## 2. Heute abgeschlossen: Public-Digest-Blocker vollständig aufgelöst

Der zentrale Blocker aus dem 10.09.-Protokoll (Punkt 4: Digest existierte,
aber keine Route lieferte ihn aus) ist behoben:

- **Fund:** `ko-sync-worker.js` existierte **doppelt und divergent** in zwei
  Repos — `ahsub/ko-sync` (Stand v2.0 vom 12.07., ganz ohne die
  Bearer-Token-Auth aus dem Legal-Briefing-Audit №61 vom 27.08.) und
  `ahsub/ko-aggregator/workers/ko-sync-worker.js` (aktuellerer Stand mit
  Auth, aber ohne die neue Digest-Route). Axel hatte zunächst versehentlich
  den veralteten `ko-sync`-Stand in Cloudflare deployed — die im August
  geschlossene Vertraulichkeitslücke war dadurch kurzzeitig wieder offen.
- **Fix:** korrigierte Datei gebaut (Bearer-Auth + Sanitize-Funktionen aus
  der `ko-aggregator`-Kopie + neue `/public/digest`-Route), in beiden
  Repos committed und in Cloudflare deployed.
- **Live-Verifikation:** `curl -H "Authorization: Bearer <Token>" .../public/digest`
  liefert den echten, vollständigen Digest-Inhalt (10 Strategien, Regime,
  Data-Quality-Block) zurück — nicht nur "Route existiert", sondern
  inhaltlich korrekt.
- **Nebenfund bei der Verifikation:** Digest-Datum stand auf dem Vortag,
  obwohl der Aggregator schon mehrfach am selben Tag gelaufen war (s.
  Punkt 3 — das war kein Bug, sondern der eigentliche Auslöser für die
  Cron-Umstellung).

## 3. Größte Umstellung heute: Aggregator-Zeitplan auf einen einzigen Nachbörsen-Lauf

**Root Cause:** `get_last_trading_day()` (`market_aggregator.py`) liest die
letzte SPY-Tageskerze via yfinance — die existiert erst NACH US-Börsenschluss
(20:00 UTC EDT / 21:00 UTC EST). Die bisherigen zwei täglichen Läufe
(Xetra-Vormarkt 03:37 UTC, NYSE-Öffnung 13:30 UTC) lagen beide strukturell
davor — der Public Digest war dadurch **immer** auf den Vortag datiert,
nie auf den tatsächlichen Handelstag. Kein Einzelfall-Bug, sondern eine
architektonische Eigenschaft des bisherigen Zeitplans.

**Axel-Entscheidung (Kostenabwägung, aktueller Anthropic-Spend
~$25-40/Monat, klar steigender Trend):** kein dritter Zusatzlauf, sondern
kostenneutraler Tausch — Xetra-Vormarkt-Lauf ersatzlos gestrichen, dafür
ein einziger Lauf um 22:00 UTC Mo–Fr (sicher nach Schluss, ganzjährig).

**Vier synchron zu haltende Stellen umgesetzt** (alle unter Punkt 1
gelistet): `market-aggregator.yml`, `ko-watchdog` (wrangler.toml +
RUN_SCHEDULES in ko-watchdog.js), `ahsub/workers/cron-trigger/wrangler.toml`
(Redundanz-Trigger löst via `workflow_dispatch` IMMER die
Digest-Generierung aus, unabhängig von der Uhrzeit — musste daher
zwingend synchron bleiben, sonst wäre der alte Vor-Schluss-Digest-Lauf
durch die Hintertür zurückgekommen).

**Nebenkonsequenz gefunden und behoben:** `tr_backup.py` prüft intern
`isoweekday()==6` (Samstag) — lief bisher nur mit, weil der alte
Xetra-Lauf auch samstags feuerte. Ohne Gegenmaßnahme hätte das
wöchentliche Track-Record-Backup (laut RUNBOOK "kommerzielles
Kernasset") stillschweigend aufgehört zu laufen. Fix: neuer, schlanker
`tr-backup-saturday.yml`-Workflow (kein voller Aggregator-Lauf, keine
KI-/yfinance-Kosten).

**Frontend-Konsequenz:** `renderIntradayComparison()` (verglich Morgen-
vs. NYSE-Snapshot) hätte bei nur noch einem Lauf strukturell immer
"kein Unterschied" gezeigt — auf Axels Entscheidung entfernt statt als
totes Feature stehen zu lassen (`index.html` v510).

**Noch nicht verifiziert, da noch nicht gelaufen:** der erste echte
Nachbörsen-Lauf (heute Abend bzw. nächster Werktag, 22:00 UTC). **Erste
Aufgabe der nächsten Session:** `curl .../public/digest` prüfen, ob das
Digest-Datum jetzt tatsächlich den aktuellen Handelstag zeigt statt des
Vortags — das war der ursprüngliche Auslöser der ganzen Umstellung und
ist bisher nur in der Theorie, nicht in der Praxis bestätigt.

## 4. Vorfall: `market_aggregator.py` versehentlich überschrieben, wiederhergestellt

Bei der Umsetzung der Cron-Änderung wurde `market_aggregator.py` (Kernscript)
zweimal in Folge mit dem Inhalt von `market-aggregator.yml` (Workflow-Datei)
überschrieben — Namensverwechslung, s. Pflicht-Header Punkt 6. Über die
Commit-Historie identifiziert (`git log market_aggregator.py`) und auf den
letzten bekannten guten Commit vom 09.09. (`ba8a5776`, "NaN-Sanitizing vor
JSON-Export") zurückgesetzt. Per Code-Lesung verifiziert: echter,
vollständiger Python-Code wiederhergestellt (11.136 Zeilen, bekannte
Inhalte wie die "sieben Feldlisten"-Checkliste vorhanden). Kein
Datenverlust, da Git die volle Historie behält — aber ein Warnzeichen für
zukünftige Sessions, bei ähnlich benannten Dateien besonders genau zu sein.

## 5. Nebenfund: `underlyingiq`-Worker in Cloudflare mit fehlgeschlagenem Build

Bei der Durchsicht der vollständigen Cloudflare-Worker-Liste aufgefallen:
ein Worker namens `underlyingiq` (verknüpft mit `ahsub/axel-scanner`)
zeigt "Letzter Build fehlgeschlagen" und "Keine aktiven Routen". Passt zur
RUNBOOK-Dokumentation, dass das Frontend eigentlich per manuellem
ZIP-Upload auf Cloudflare **Pages** läuft, nicht über einen
Git-verknüpften **Worker**-Build — vermutlich ein alter, nie erfolgreich
gelaufener Deployment-Versuch, aktuell ohne Live-Wirkung. **Nicht
untersucht, nur bemerkt** — falls bei Gelegenheit Zeit ist, lohnt sich zu
klären, ob das gelöscht werden kann.

## 6. Unverändert offen aus dem 10.09.-Protokoll

Diese Punkte standen gestern auf der Liste und sind heute nicht
angefasst worden — weiterhin offen, nicht neu geprüft:

- **Frontend-Anbindung `openKiBriefing()`/`runAlphaLbKI()` an den Public
  Digest** — der eigentliche, ursprüngliche Zweck des gesamten Sprints.
  War gestern Priorität 1, ist es nach dem heutigen Tag **immer noch**,
  jetzt aber technisch tatsächlich einlösbar (Route lebt, Datum stimmt ab
  heute Abend). Rechtlicher Vorbehalt aus dem 10.09.-Protokoll weiterhin
  gültig: technisch bauen/testen unproblematisch (Axel weiterhin einziger
  Nutzer, keine Beta-Öffnung), aber nicht mit Beta-Öffnung verwechseln,
  solange die Anwalts-Review offen ist.
- **Backlog №64 — `score_options_atmna()`** — einzige zweifelsfrei
  bestätigte offene Code-Baustelle aus der alten Liste (10.09., Punkt 3).
- **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung** — schaltet die
  Fair-Value-/DCE-Kette frei.
- **Vier noch ungeprüfte Backlog-Punkte** (Ticker-Onboarding-Skript,
  CBOE-PCR-Parsing-Anomalie, Compliance-Scanner-Fehlalarm-Bewertung,
  Morning-Briefing-Performance-Ursache, `ko-ai-worker.js`-Duplikat-Entscheidung)
  — weiterhin nicht als offen oder erledigt behaupten, nur verifizieren.
- **`RUNBOOK.md`-Auffrischung** — durch den heutigen Umbau jetzt noch
  dringlicher: §2 Systemlandkarte (Digest-Route fehlt), §3 Nachtlauf-Zeitplan
  (beschreibt noch die alten zwei Cron-Zeiten) sind jetzt zusätzlich zum
  ohnehin schon zwei Monate alten Versionsstand veraltet.

---

## Für den Einstieg morgen: vorgeschlagene Reihenfolge

1. **Verifizieren, dass der erste Nachbörsen-Lauf funktioniert hat** (Punkt 3)
   — GHA-Run-Status prüfen + `curl .../public/digest` auf korrektes,
   aktuelles Datum. Das ist die einzige echte Unbekannte aus dem heutigen
   Umbau.
2. **`index.html` v510 nachverifizieren** (Punkt 1) — eigene Tool-Indexierung
   war am Sessionende noch nicht aktuell.
3. **Frontend-Anbindung `openKiBriefing()`/`runAlphaLbKI()` an den Public
   Digest** (Punkt 6) — höchste inhaltliche Priorität, jetzt tatsächlich
   entsperrt. Rechtliche Trennung (bauen ja, Beta-Öffnung nein) vorab kurz
   bestätigen, nicht stillschweigend vermischen.
4. **Backlog №64 — `score_options_atmna()`** (Punkt 6).
5. **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung** (Punkt 6) — verdient
   frischen Kopf.
6. Bei Gelegenheit: `RUNBOOK.md`-Auffrischung (Punkt 6) — Systemlandkarte
   und Nachtlauf-Abschnitt sind nach heute konkret veraltet, nicht nur
   pauschal "zwei Monate alt".
7. Bei Gelegenheit: die vier ungeprüften Backlog-Punkte (Punkt 6) gegen
   den Code verifizieren.

---

**Axels Einschätzung zum Tag:** Viel auf einmal — der eigentliche
Digest-Blocker wurde gelöst, aber unterwegs kamen zwei ungeplante
Nebenbaustellen dazu (Repo-Divergenz bei `ko-sync-worker.js`, die
Dateiverwechslung bei `market_aggregator.py`/`market-aggregator.yml`),
die beide selbst gefunden und sauber aufgelöst wurden. Für morgen:
zuerst den Praxistest des neuen Zeitplans bestätigen, dann zum
eigentlichen Kern zurück (Frontend-Anbindung).
