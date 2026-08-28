# UEBERGABE-2026-08-28.md

Fortsetzung von `UEBERGABE-2026-08-27.md`. Heute: Stichprobenprüfung der
Options-Desk-Ausgaben im Public-Toggle-Zustand, dabei wichtigsten Folgefund
des gesamten Audits entdeckt und behoben, ein Versions-Zwischenfall
(Kollision + verlorener Fix) sauber aufgelöst, neues Suite-Grundgesetz
verankert, und ein Nutzerfehler (`help.html` überschrieben) korrigiert.

---

## 1. Stichprobe Options-Desk (Public-Toggle AUS) — CSP ATM/NA und Covered Call

Axel hat zwei Live-Outputs im UI mit **ausgeschaltetem EIC-Toggle** geprüft:

- **CSP ATM/NA:** Vollständige "HANDLUNGSEMPFEHLUNG"-Sektion mit "AKTION:
  Limit-Orders auf 60% Profit-Taking setzen" — erklärbar über den bekannten
  hartverdrahteten `expert_mode: true` für `strat === 'atmna'`
  (`runOptionsKiBriefing`), zusätzlich verschärft durch einen fest im
  Template einprogrammierten Text-Marker "⛔⛔⛔ EIC-MODUS ⛔⛔⛔" in
  `ko-prompts.js::atmna.prompt()`.
- **Covered Call:** Ebenfalls konkrete Strike/Delta/Prämien-Zahlen +
  explizite Rangfolge ("Fazit: AFL > GOOG >> CIFR") — **obwohl
  `expert_mode` hier korrekt `false` gesendet wurde** (`strat !== 'atmna'`).
  Das war der Auslöser für den heutigen Kernfund (s. Abschnitt 2).

**Wichtige Randnotiz:** Beide Tests liefen über Axels eigenen `OWNER_TOKEN`
— kein Beweis für ein aktuelles Leck an echte Beta-Tester (die sind seit
№60 serverseitig korrekt auf den Public-Systemprompt beschränkt), aber ein
Beweis, dass die zugrundeliegenden Prompt-Templates strukturell weiterhin
"Handlungsempfehlungscharakter" haben — genau das Muster, das der Anwalt
kritisiert hat.

---

## 2. Backlog №65 — Kernfund: Clientseitig eingebetteter EIC-Instruktionsblock

**Warum Covered Call trotz `expert_mode: false` trotzdem direktiv war:**
`getKiSystemPrompt()` (genutzt vom "Beste Chance"-Button) und
`getMorningBriefingPrompt()` (genutzt vom **täglichen Morning Briefing
selbst**) entscheiden ihre Text-Rahmung rein anhand von
`_expertModeActive && _eicUnlocked` — beides Client-Variablen, exakt der
PIN-Mechanismus, den №60 absichern sollte. Das baute Text wie *"gib
KONKRETE, DIREKTE Handlungsempfehlungen"* **direkt in den User-Prompt-Text**
ein, bevor er überhaupt beim Worker ankommt. Der `isOwner`-Fix von gestern
entscheidet nur, welchen **Systemprompt** der Worker wählt — er sieht den
fertigen `prompt`-Text nur als gewöhnlichen Payload-Inhalt, unabhängig
davon was darin steht. Ein Beta-Tester mit selbstgesetztem EIC-PIN hätte
also weiterhin handlungsempfehlungsartigen Text bekommen können, obwohl der
Systemprompt korrekt auf Public stand — das Modell folgt in der Praxis eher
der konkreten Aufgabenstellung im User-Text (empirisch am Covered-Call-Fall
bestätigt).

**Fix:** `ko-prompts.js` v2.5.6→v2.5.7 — `_getSystemPrompt()` und
`_getMorningPrompt()` liefern jetzt IMMER die deskriptive Coaching-Variante,
unabhängig vom `eic`-Parameter. Die Public/Expert-Unterscheidung liegt
ausschließlich noch serverseitig (bereits isOwner-gehärtet seit №60). Für
Axel als Owner ändert sich die Ausgabequalität nicht — die Experten-Rahmung
kommt zuverlässig vom Server (gestern verifiziert). `index.html` v483:
`getKiSystemPrompt()`-Fallback-Kopie entsprechend mitgezogen.

**Noch offen, separater Befund:** Die eigentlichen Options-Desk-Templates
(`cc`, `atmna`, `csp_wheel`, `weekly_income` in `ko-prompts.js`) verlangen
**unabhängig** vom heutigen Fix weiterhin explizit konkrete
Strike/Delta/Prämien-Zahlen und TOP-3-Rangfolgen in ihrer `AUFGABE`-Sektion
— das ist ein anderer Mechanismus (Aktions-Template, kein
`_getSystemPrompt()`-Aufruf). Die von Axel ursprünglich angeforderte
14-Template-Bestandsaufnahme wurde nur **teilweise** durchgeführt (6 von 14
Templates einzeln gelesen, Rest nur per Keyword-Scan grob klassifiziert) —
s. Backlog №65 in `SUITE.md` für die vollständige Einordnung und offene
Fragen.

---

## 3. Versions-Zwischenfall — Kollision und verlorener Fix

Beim Versuch, den `ko-prompts.js`-Fix zu deployen, zeigte sich: Axel hatte
parallel bereits eine eigene v482-Änderung committet (Options-Desk-Redesign
mit `t.ki_eic`, `ko-sync-worker.js` v2.2, `market_aggregator.py` v5.38.0 —
passend zur heute früher besprochenen Entscheidung "gemeinsame
Analyseschicht + numerischer Owner-Extra-Layer"). Meine eigene, gleichzeitig
vorbereitete v482-Änderung wurde dadurch faktisch verworfen, und mein
`ko-prompts.js`-CDN-Pin-Update ging beim Zusammenführen zunächst verloren.

**Klärung mit Axel:** Kein Parallel-Session-Problem — derselbe,
durchgehende Chat, aber so lang, dass frühere Gesprächsteile (in denen das
Options-Desk-Redesign besprochen/umgesetzt wurde) nicht mehr im sichtbaren
Kontext lagen. Ursache: kein `git log`-Check vor der Änderung.

**Lösung:** Fix als eigener v483-Eintrag oben draufgesetzt, ohne Axels
Options-Desk-Redesign anzutasten. `getKiSystemPrompt()`-Fix erneut
eingepflegt (war in der committeten Version nicht mehr vorhanden), CDN-Pin
korrekt gesetzt. Vollständig verifiziert: 0 Treffer für die gefährliche
Instruktion, Pin auf richtigem Hash.

**Prozess-Konsequenz — neues Suite-Grundgesetz №10** (`SUITE.md`, s.u.).

---

## 4. Neues Suite-Grundgesetz №10 — Sync- und Versionierungs-Pflicht

Verbindlich ab sofort, mit heutigem Vorfall als Herleitung dokumentiert:

- **Vor jeder Code-Änderung an einer bereits versionierten Datei:** zuerst
  `git fetch`/`git log origin/main` gegen den lokalen Stand prüfen.
- **Jede geänderte Datei bekommt im selben Schritt:** (a) neuen
  Versions-Header/Meta-Tag, (b) Changelog-Eintrag, (c) bei CDN-Hash-
  gepinnten `ko-modules`-Dateien die sofortige Pin-Aktualisierung in
  `index.html` — nicht als spätere Nacharbeit.

Auslöser: Heute gleich zweifach durch versäumten Pin-Sync live 401er bzw.
kurzzeitig reaktivierte Sicherheitslücken ausgelöst (`ko-market-state.js`
gestern, `ko-prompts.js` heute), zusätzlich die v482-Kollision.

---

## 5. Nutzerfehler behoben — `help.html` versehentlich mit `index.html` überschrieben

Axel hatte `help.html` im GitHub-Repo `axel-scanner` versehentlich mit dem
Inhalt von `index.html` überschrieben (Commit `c94b7e1`, 26.405 Zeilen statt
der erwarteten ~1.120). Wiederhergestellt aus dem Commit direkt davor
(`b104314`) — Titel-Check bestätigt "UnderlyingIQ — Bedienungsanleitung".
Von Axel committed und byte-genau verifiziert (SHA256 identisch).
**Hinweis, falls relevant:** Zwischen `b104314` und dem fehlerhaften Commit
gab es keine weiteren `help.html`-Commits — falls Axel zwischenzeitlich
manuell (außerhalb von Git) Änderungen an der Hilfeseite vorgenommen hat,
sind diese mit der Wiederherstellung nicht erfasst.

---

## Infrastruktur-Stand (28.08.2026 Abend)

| Komponente | Stand |
|---|---|
| `UIQ-Suite/SUITE.md` | v4.22, committed |
| `ko-modules/ko-prompts.js` | v2.5.7, Commit `13041af`, committed + verifiziert |
| `axel-scanner/index.html` | v483, committed + verifiziert (byte-genau) |
| `axel-scanner/help.html` | wiederhergestellt, committed + verifiziert (byte-genau) |
| `ko-modules/ko-market-state.js` | v2.5 (von gestern, unverändert) |
| `ko-aggregator/workers/ko-ai.js` | v1.11 (von gestern, unverändert) |
| `ko-sync/ko-sync-worker.js` | v2.2 (von Axel parallel aktualisiert — Details nicht vollständig geprüft, s. offene Punkte) |
| `ko-aggregator/market_aggregator.py` | v5.38.0 laut Changelog-Referenz (von Axel parallel aktualisiert — nicht im Detail geprüft) |

---

## Offene Punkte für morgen / die nächste Session

1. **Erste Aufgabe: Abgleichen, was von Backlog №65 durch Axels bereits
   umgesetztes Options-Desk-Redesign (`t.ki_eic`, `ko-sync-worker.js` v2.2,
   `market_aggregator.py` v5.38.0) erledigt ist** — unklar, ob dieses
   Redesign nur die Daten-/Rendering-Schicht abdeckt oder auch die
   Prompt-Text-Ebene in `ko-prompts.js`.
2. **14-Template-Bestandsaufnahme fortsetzen/abschließen** (`ko`, `breakout`,
   `vcp`, `swing`, `meanrev`, `dividend`, `value`, `fading_short` noch nicht
   einzeln gelesen, nur grob per Keyword-Scan eingeordnet).
3. **Backlog №62 (UI-Terminologie) umsetzen** — weiterhin zurückgestellt bis
   Rückmeldung vom Fachanwalt zu №36 (Grundsatzfrage Interpretation vs.
   Datenbereitstellung).
4. **Backlog №64:** `score_options_atmna()` — eigener Ticker-Score für
   CSP(ATM/NA), separate Session, reine Vormerkung.
5. **Aus 27.08. weiterhin offen:** `[HomeSektorKondensat] nicht verfügbar:
   KV nicht erreichbar` (vermutlich ein weiterer ungeprüfter KV-Key-Aufruf
   ohne Auth-Header), die drei toten `/public/*`-Pfade in `index.html`
   (`market:snapshot:latest`, `market:snapshot:{date}`, `degraded_status`).
6. **Rückmeldung vom Fachanwalt** zu Punkt 36 abwarten (jetzt mit 5
   konkreten Fragen) — weiterhin einziger echter Kommerzialisierungs-Blocker.
7. **Neu, Prozess:** Ab sofort Grundgesetz №10 beachten — `git log`-Check
   vor jeder Änderung, Versionierung nie als Nacharbeit.
