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

6. **Zwei Dateien mit fast identischem Namen sind KEINE dieselbe Datei.**
   `market-aggregator.yml` (GitHub-Actions-Workflow) und
   `market_aggregator.py` (das Kernscript) wurden am 11./12.09. zweimal
   verwechselt. **NEU (13./14.09.): derselbe Fehlermodus trat ein drittes
   Mal auf — diesmal bei zwei Dokumentationsdateien** im UIQ-Suite-Repo:
   `docs/UIQ — Technical Implementation Spec v1.1: Cost-Optimized AI
   Architecture.md` wurde versehentlich mit dem Inhalt der v1.2-Spec
   überschrieben, statt eine neue, eigene v1.2-Datei anzulegen (beide
   Namen beginnen identisch mit "UIQ — Technical Implementation Spec
   v1."). Beide Male: Ursache war ein sehr ähnlicher Dateiname, keine
   Böswilligkeit, kein Datenverlust (Git-Historie), aber jedes Mal erst
   durch expliziten Diff-Check gegen den erwarteten Inhalt gefunden, nie
   durch bloßes Anschauen des Commit-Links. **Bei Dateinamen, die sich nur
   in einer Versions-/Zahlenstelle oder Endung unterscheiden: immer den
   vollen Pfad UND den Inhalts-Anfang explizit gegenprüfen**, auch bei
   Markdown-Dokumenten, nicht nur bei Code.

7. **GitHub-API-Rate-Limits sind in dieser Sandbox real und häufig.**
   Unauthentifizierte `api.github.com`-Calls laufen oft in ein Rate-Limit
   (geteilte Sandbox-IP). Ausweichrouten, die zuverlässig funktioniert
   haben: `raw.githubusercontent.com/{repo}/{commit-sha}/{pfad}` für
   Datei-Inhalt bei einem exakten Commit: `github.com/{repo}/commit/
   {sha}.patch` für die geänderten Dateien/Diff-Zeilen eines Commits
   (funktioniert nicht immer sofort bei ganz frischen Commits — kurzer
   Propagations-Verzug möglich, einfach nach 10-20 Sek. erneut versuchen,
   bevor man einen echten Fehler vermutet); `github.com/{repo}/commits/
   {branch}/{pfad}` (HTML) für die Commit-Historie einer einzelnen Datei,
   wenn die API blockiert ist.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# UEBERGABE-2026-09-14

**Für die nächste Session. Schließt an das Übergabeprotokoll vom
12.09.2026 an.** Zwischen 13.09. und 14.09. lief eine einzige, sehr lange
Session ohne eigenes Zwischenprotokoll — dieses Dokument deckt beide Tage ab.

---

## 1. Deployed/Live-Stand (Stichtag Ende 14.09.2026)

| Datei | Version | Repo | Status |
|---|---|---|---|
| `ko-sync-worker.js` | v2.3 | `ahsub/ko-sync` **und** `ahsub/ko-aggregator/workers/` | Beide Kopien synchron, Inhalt verifiziert (`diff`), **und** live in Cloudflare deployed bestätigt (Dashboard-Screenshot von Axel, Bundle-Code stimmt mit Repo überein) |
| `generate_public_recommendations.js` | v1.3 | `ahsub/UIQ-Suite/scripts/` | Repo-Stand verifiziert. Neuer Pointer-Key `public/ai_output/latest/{strategy}` — **noch nie erfolgreich mit echtem Inhalt live getestet** (s. Punkt 3, größte offene Unbekannte) |
| `market-aggregator.yml` | v1.3 | `ahsub/ko-aggregator/.github/workflows/` | Repo-Stand verifiziert, YAML-Syntax geprüft. Neue Eingabe `force_regenerate` (Dropdown) — **noch nie tatsächlich mit `true` ausgeführt** |
| `market_aggregator.py` | 4 Commits heute (s. unten) | `ahsub/ko-aggregator` | Jeder einzelne Commit gegen `main`-HEAD verifiziert (`diff`, `py_compile`). **Kein einziger der drei Scoring-/Feld-Commits (§1.1/§3/§2.1) wurde seither durch einen echten Lauf bestätigt** — der letzte tatsächliche Lauf (#302) fand VOR diesen drei Commits statt |
| `index.html` | v511 | `ahsub/axel-scanner` | Repo-Stand verifiziert, live deployed laut Axel (von mir nicht selbst nachprüfbar, keine Domain-Kenntnis/Netzwerkzugriff) |
| `docs/…v1.1: Cost-Optimized AI Architecture.md` | — | `ahsub/UIQ-Suite/docs/` | Wiederhergestellt nach versehentlichem Überschreiben (s. Header Punkt 6), Inhalt gegen Original verifiziert |
| `docs/…v1.2: Regime-Differenzierung & Quality-Layer.md` | — | `ahsub/UIQ-Suite/docs/` | Neu angelegt, `.md`-Endung nachträglich ergänzt, Inhalt verifiziert |

**`market_aggregator.py`, die vier Commits von heute in chronologischer
Reihenfolge:**
1. `e3713614` — Freshness-Fix: `validate_data_freshness()` verglich
   fälschlich gegen `updated` (Verarbeitungszeitpunkt) statt gegen das
   echte Kerzendatum. Neues Feld `_dataAsOf`, `updated` bewusst
   unverändert (Frontend-`kvAge` hängt daran).
2. `23f6d1be` — UIQ Spec v1.2 §1.1: `REGIME_FIT`-Tabelle + `regime_fit()`,
   `BULL_QUIET`/`BULL_FRAGILE` jetzt strukturell unterscheidbar in
   `build_leaderboards()`. Alle Werte aktuell neutral (1.0) — reine
   Struktur, keine Verhaltensänderung.
3. `79d0e914` — UIQ Spec v1.2 §3: `sectors`/`sectorTagVersion`-Propagations-
   Lücke geschlossen (`scored.append()` + beide `_core`-Listen), neue
   `SECTOR_WATCHLISTS_VERSION`-Konstante.
4. `80182350` — UIQ Spec v1.2 §2.1: `score_underlying_assignment_quality()`
   (Feld `sUaq`), Contract Assignment Quality bewusst NICHT gebaut (keine
   echten Optionsketten-Daten vorhanden, s. Punkt 4 unten).

**Wichtig für morgen:** Punkte 2–4 sind ausschließlich gegen den
Quelltext geprüft (Syntax, isolierte Funktionstests mit synthetischen
Daten), **nicht gegen einen echten Lauf mit echten Marktdaten.** Das ist
eine andere, schwächere Verifikationsstufe als "live bestätigt".

---

## 2. Größte offene Unbekannte: Digest-Cache-First noch nie erfolgreich Ende-zu-Ende bestätigt

Das war schon am 12./13.09. die zentrale offene Frage und ist es immer
noch. Verlauf heute:

- Run #301 (12.09., vormittags) lief noch mit der ALTEN Code-Version —
  kein Beweis für irgendetwas Neues.
- Run #302 (13.09.) lief mit neuem Code, aber `generate_public_
  recommendations.js` hat den Trading-Day-Skip-Check ausgelöst ("kein
  neuer Handelstag seit letztem Digest") und **alle** Anthropic-Calls
  übersprungen — kein neuer `public/ai_output/latest/{strategy}`-Eintrag
  entstanden. Das ist kein Bug, sondern der bestehende Kostenschutz, der
  korrekt gearbeitet hat.
- Als Fix: `force_regenerate`-Eingabe in `market-aggregator.yml`
  ergänzt (s. Punkt 1, Commit `79bf9382`) — **aber ein Testlauf mit
  `force_regenerate=true` wurde bisher nicht durchgeführt.** Die Session
  ist stattdessen in die Kosten-Spec (v1.1) und die Regime-Spec (v1.2)
  abgebogen.

**Erste Aufgabe der nächsten Session, unverändert seit zwei Tagen:**
1. GHA-Run manuell mit `force_regenerate=true` auslösen.
2. `curl -H "Authorization: Bearer <Token>" https://ko-sync.ahildebrand.workers.dev/public/ai_output/momentum`
   — erwartet: `recommendation_text` gefüllt, `date` = aktueller
   `last_trading_day`.
3. Bei Erfolg: auch `openKiBriefing('momentum')` im Public-Modus im Browser
   testen (Netzwerk-Tab prüfen, ob `/public/ai_output/momentum` greift statt
   eines neuen Live-Calls).

---

## 3. Zweite offene Unbekannte: Freshness-Fix nie am tatsächlichen Log bestätigt

Der `_dataAsOf`-Fix (Commit `e3713614`) wurde nur gegen synthetische
Testdaten und den Quelltext geprüft. Run #302 fand zwar NACH diesem Fix
statt, aber die Log-Zeile `🗓️ Validiere Datenfreshe...` wurde für Run
#302 nie eingesehen — nur der Trading-Day-Skip und der Job-Status. **Bei
Gelegenheit im nächsten Lauf (z.B. demselben `force_regenerate`-Lauf aus
Punkt 2) mitprüfen:** `Datenfreshe: N aktuell · 0 veraltet` erwartet,
nicht mehr `0 aktuell · N veraltet`.

---

## 4. Dritte offene Unbekannte: `sUaq`/`sectors`/`sectorTagVersion` nie mit echten Daten gesehen

Alle drei Felder aus den UIQ-Spec-v1.2-Commits (§1.1/§3/§2.1) wurden nur
isoliert mit synthetischen Testfällen geprüft (s. Punkt 1). Wie die
echten Werte für reale Ticker aussehen (füllt `sUaq` sich sinnvoll? Ist
`sectors` für die meisten Ticker `[]` oder gut befüllt?), ist unbekannt.
Sollte im selben Lauf wie Punkt 2/3 mitgeprüft werden — ein Blick in die
Leaderboard-Ausgabe eines beliebigen Strategie-Ergebnisses genügt.

---

## 5. UIQ Spec v1.2 — Fortschritt

| Punkt | Status |
|---|---|
| §1.1 Regime-Fit-Struktur | Committed, unverifiziert live (s. Punkt 4) |
| §1.2 Regimedefinition erweitern | Bewusst zurückgestellt — gehört ins laufende `ahsub/regime-test`-Forschungsprojekt, kein aktiver Schritt |
| §2.1 Underlying Assignment Quality (UAQ) | Committed, unverifiziert live |
| §2.2 Contract Assignment Quality (CAQ) | Bewusst NICHT gebaut — UIQ hat keine echten Optionsketten-Daten (Strike/DTE/echte IV), wartet auf CapTrader-Architekturentscheidung (Stufe 2, bereits vor heute dokumentiert bei `calc_multileg_season()`) |
| §3 Thematisches Clustering | Committed, unverifiziert live. Bewusst KEINE neue Taxonomie — nutzt bestehende `SECTOR_WATCHLISTS`/`TICKER_SECTOR_TAG` |
| §4 Position-Re-Evaluation-Loop | **Nicht begonnen.** Verifikations-Fund heute: `market_aggregator.py` hat aktuell KEINE KV-Lesefunktion — nur Schreiben. `backlog_tracking` lebt komplett im Frontend/KV. §4 braucht als Voraussetzung eine neue Fähigkeit (KV-Read mit Auth aus Python), dann Ticker-Matching, dann Delta-Berechnung (`decision_snapshot`, `entry_snapshot`/`current_snapshot`, komponentenweise Deltas — Details in der Spec-Datei §4). Explizit für einen eigenen, frischen Tag zurückgestellt, nicht an einen vollen Tag drangehängt. |

Vollständige Spec: `docs/UIQ — Technical Implementation Spec v1.2:
Regime-Differenzierung & Quality-Layer.md` im `UIQ-Suite`-Repo.

---

## 6. UIQ Spec v1.1 (Kostenoptimierung) — weiterhin nicht begonnen

Vollständig spezifiziert (inkl. EIC-Ergänzung), aber **noch kein einziger
Umsetzungsschritt gemacht.** Reihenfolge laut Spec:
1. AI-Budget-Logging (sofort, unabhängig, kein Risiko) — **guter
   Kandidat, um morgen VOR §4 oder dem Force-Regenerate-Test kurz
   zwischengeschoben zu werden, falls Zeit ist — kostet nichts, macht die
   tatsächlichen API-Kosten endlich sichtbar.**
2. Kern-Patch als Vertical Slice für `momentum` (Score-Gate, Hash-Gate,
   Kurzprompt, `max_tokens`/Temperatur), erst danach Rollout auf die
   übrigen 9 Strategien.
3. Frontend-Anpassung für kürzeres Cache-Ergebnis.
4. Nach 1-2 Wochen Live-Betrieb: Kalibrierung.

Vollständige Spec: `docs/UIQ — Technical Implementation Spec v1.1:
Cost-Optimized AI Architecture.md` im `UIQ-Suite`-Repo.

---

## 7. Unverändert offen aus früheren Protokollen

- **Frontend-Anbindung `openKiBriefing()`/`runAlphaLbKI()` an den Public
  Digest** — technisch gebaut (s. Punkt 2), aber die eigentliche
  Bestätigung "funktioniert live" steht noch aus. Rechtlicher Vorbehalt
  weiterhin gültig: bauen/testen unproblematisch (Axel weiterhin einziger
  Nutzer), nicht mit Beta-Öffnung verwechseln, solange die Anwalts-Review
  offen ist.
- **Backlog №64 — `score_options_atmna()`** — **jetzt vollständig spezifiziert**
  (Nachtrag 14.09., abends): ein echtes EIC-Briefing (ACAD/HON/VMC) hat den
  Architekturfehler sichtbar gemacht — `options_atmna` ist aktuell nur ein
  Alias auf den generischen `sCsp`-Score, keine eigene Logik. Spec-Dokument:
  `docs/UIQ — Backlog #64: ATM/NA Specification v1.0.md` (UIQ-Suite-Repo,
  noch zu committen). Kernpunkte: ATM/NA ist eine eigenständige Assignment-
  Avoidance-Strategie (nicht csp_wheel-Variante), Downside-Risk dominant vor
  Premium Quality, Falling-Knife-Gate (`price < ema200 - 1.5*atr AND rsi <
  25`), Earnings-Gate mit tatsächlicher DTE statt Default-Fenster,
  Signal-Duplikations-Regel (RSI/EMA200-Abstand/HVP nicht unabhängig
  gewichten). **Bewusst noch nicht implementiert** — erst Spec-Freigabe,
  dann Code, wie vereinbart. Nach Implementierung: die drei heutigen
  Kandidaten rückwirkend mit der neuen Logik durchrechnen (konkreter
  Testfall statt synthetischer Daten).
- **STYLE/SETUP/VEHICLE-Ontologie-Entscheidung** — weiterhin offen,
  schaltet die Fair-Value-/DCE-Kette frei. Relevanz durch heutige
  Reviewer-Diskussion (Fair-Value-Layer, §2 der alten Regime-Spec-
  Diskussion) nochmal bestätigt, aber nicht neu bearbeitet.
- **Vier ungeprüfte Backlog-Punkte** (Ticker-Onboarding-Skript,
  CBOE-PCR-Parsing-Anomalie, Compliance-Scanner-Fehlalarm-Bewertung,
  Morning-Briefing-Performance-Ursache, `ko-ai-worker.js`-Duplikat-
  Entscheidung) — weiterhin unverändert.
- **`RUNBOOK.md`-Auffrischung** — weiterhin überfällig, jetzt zusätzlich
  zu allem aus dem 12.09.-Protokoll auch um die heutigen neuen Felder
  (`sUaq`, `sectors`, `sectorTagVersion`, `REGIME_FIT`) und den neuen
  `/public/ai_output/:strategy`-Endpunkt zu ergänzen.
- **`underlyingiq`-Cloudflare-Worker mit fehlgeschlagenem Build**
  (12.09.-Fund) — weiterhin nur bemerkt, nicht untersucht.
- **`market-aggregator.yml`/`market_aggregator.py`-Versionierungs-
  Diskrepanz bei `ko-sync-worker.js`** (informelles "v2.2" in
  `index.html`-Kommentaren vs. Datei-Header, der direkt von v2.1 auf die
  heutige Änderung sprang, jetzt als v2.3 geführt) — weiterhin als reine
  Doku-Lücke offen, keine Sicherheitsauswirkung.

---

## Für den Einstieg morgen: vorgeschlagene Reihenfolge

1. **`force_regenerate`-Testlauf + `curl`-Verifikation** (Punkt 2) — die
   seit zwei Tagen zentrale, einzige echte Unbekannte des gesamten
   Digest-Cache-First-Sprints.
2. **Im selben Lauf mitprüfen:** Freshness-Log-Zeile (Punkt 3) und
   `sUaq`/`sectors`/`sectorTagVersion`-Realdaten (Punkt 4) — kostet keinen
   zusätzlichen Lauf, nur zusätzliches Hinschauen.
3. **AI-Budget-Logging** (v1.1 §1.1) — kurzer, risikoloser Zwischenschritt,
   macht die eigentliche Kostenfrage endlich messbar, bevor mehr Architektur
   draufgesetzt wird.
4. **§4 Position-Re-Evaluation-Loop** — mit frischem Kopf, beginnend mit
   der KV-Read-Fähigkeit für `market_aggregator.py` als Voraussetzung.
5. Bei Gelegenheit: v1.1-Kern-Patch (Vertical Slice `momentum`),
   Backlog №64/ATM-NA-Implementierung (Spec steht, s. Punkt 7 oben —
   kompakt genug für einen Zwischenschritt, falls Zeit ist),
   `RUNBOOK.md`-Auffrischung, die übrigen unveränderten Backlog-Punkte.

---

**Axels Einschätzung zum Tag (14.09.):** Noch ein voller Tag — diesmal
nicht primär technischer Umbau, sondern viel Verifikationsarbeit und zwei
Reviewer-Runden, die zu zwei sauberen, coding-ready Specs (v1.1 Kosten,
v1.2 Regime/Quality) geführt haben. Drei Momente mit vertauschten
Dateien (zweimal Code, einmal Doku) — alle selbst gefunden und sauber
aufgelöst, aber ein wiederkehrendes Muster, das für morgen im Kopf
bleiben sollte (s. Pflicht-Header Punkt 6). Für morgen: zuerst der
längst überfällige Praxistest des Digest-Cache-First-Sprints, dann
zurück zur eigentlichen Weiterentwicklung.
