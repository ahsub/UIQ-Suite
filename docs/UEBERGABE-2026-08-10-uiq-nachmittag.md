## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ist eine Aussage der letzten Session über sich selbst —
   nicht dein eigenes Wissen. Behandle es wie eine Behauptung eines
   Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug,
   nie für eine schnelle Plausibilitäts-Antwort.**

**Diese Session selbst liefert ein Beispiel dafür, warum das gilt** (s. §4
unten): Ein einzelner Browser-Test führte zu einer falschen "endgültig tot"-
Behauptung über eine Datenquelle, die zwei Minuten später durch einen
zweiten, aus dem tatsächlich relevanten Kontext (GitHub Actions statt
Browser) durchgeführten Test widerlegt wurde. Die falsche Aussage wurde in
der Doku nicht gelöscht, sondern sichtbar korrigiert — als Beleg, dass
"einmal geprüft" nicht "verifiziert" heißt.

---

# Übergabeprotokoll 10.08.2026 (Nachmittag/Abend) — UIQ-Fokus

**Kontext:** Fortsetzung derselben Session wie
`UEBERGABE-2026-08-10-refundex-ganztag.md` (dort: der komplette
Refundex-Teil des Tages — kap.html-Bugfixes, Trade-Detail-Report,
Z.8/Z.9-Fix). Dieses Dokument deckt den Nachmittags-/Abendteil ab, der sich
auf UIQ verlagerte. **Governance-Hinweis:** UIQ Phase 0 hat laut SUITE.md §4
absolute Bauprio — alles hier Beschriebene ist damit ohnehin im Rahmen,
keine Ausnahme-Situation wie beim Refundex-Teil des Tages.

**PAT-Hinweis:** Für den Nachmittag wurde ein zweiter, neuer Session-PAT
verwendet (`ghp_3819...`, von Axel nach Abschluss des Refundex-Teils neu
bereitgestellt). **Wird nach diesem Protokoll von Axel widerrufen** — wie
immer: nicht als bereits erledigt annehmen, sondern bei Bedarf selbst
prüfen, ob der PAT in der nächsten Session noch gültig ist (sollte er nicht
sein).

---

## 1. Ehrliche Tagesbilanz (auf Axel-Nachfrage, nicht schöngeredet)

**Wichtigster Fund des Tages war eigentlich im Refundex-Teil:** Z.8/Z.9
(Aktienveräußerungsgewinne/-verluste) lieferte über Wochen eine
materiell falsche Formel (Käufe wurden als Verluste gezählt). Gefunden,
gefixt, gegen echte PWC-Reports validiert (2023/2025 exakt, 2024 auf
0,03 % genau). Das allein wäre ein guter Tag gewesen.

**Im UIQ-Teil (dieses Dokument):** Quantitative Regime-Mapping-Validierung
war kein Selbstläufer — musste Datenquellen zusammensuchen (öffentliche
GitHub-Archive, da Primärquellen-Zugriff unklar war), einen Klassifikator
1:1 aus `ko-market-state.js` portieren, gegen bekannte Krisenereignisse und
echte CBOE-Strategie-Indizes prüfen. Ergebnis überwiegend bestätigend.

**Was NICHT glattgelaufen ist, zur Ehrlichkeit:**
- Ich habe SqueezeMetrics fälschlich für "endgültig tot" erklärt (Browser-
  Test zeigte 503), das dokumentiert, und die Aussage dann selbst wieder
  korrigieren müssen, als ein Test aus der echten GitHub-Actions-Umgebung
  200 zeigte. Kein Beinbruch (genau dafür ist der Verifikations-Grundsatz
  da), aber eben kein makelloser Ablauf.
- Das Kontoprofil-Modal-Problem (Refundex, früher am Tag gemeldet) wurde
  nie wirklich als "kein Bug" bestätigt — nur mein eigener
  Automatisierungs-Tool-Fehler wurde ausgeschlossen. Falls Axel das
  Problem weiterhin hat: nicht als erledigt behandeln.
- Die IBKR-Live-API-Anbindung ist reine Recherche, kein Code. Das war
  auch so vereinbart (bewusst auf eine eigene Session verschoben), aber
  zur Einordnung wichtig: "heute besprochen" ≠ "heute gebaut".

**Fazit:** Überdurchschnittlich produktiver Tag mit echtem materiellem
Nutzen (nicht nur Aktivität) — aber mit den üblichen Unschärfen unterwegs,
von denen mindestens eine (SqueezeMetrics) live im Dokument sichtbar
korrigiert wurde statt verschwiegen.

---

## 2. Quantitative Regime-Mapping-Validierung (löst offenen Punkt aus
   `UEBERGABE-2026-08-09-ganztag.md`)

**Auftrag:** aus dem 09.08.-Protokoll offener Punkt "Quantitative
Regime-Mapping-Validierung gegen 2007-2026-Backtest".

**Zentraler Fund vorab:** Der referenzierte "2007-2026-Backtest mit Sharpe
1,66" (Gate A) hat **keine Regime-Dimension** — er validiert die
DCE-Composite-Score-Qualität, nicht regime-spezifische Strategie-
Performance. Der echte Track-Record mit Regime-Tags läuft laut
`TRACK_RECORD_SPEC.md` erst seit 03.07.2026 — zu kurz. Stattdessen wurde
ein unabhängiger historischer Datensatz aus öffentlichen Quellen
zusammengestellt (GEX/DIX, VIX/VVIX/SKEW/VIX3M, sowie echte CBOE-
Strategie-Benchmark-Indizes PUT/BXM/CLL — 2011-2025).

**Ergebnis, kurz:**
- Krisentag-Erkennung: 11/13 (84,6 %) — Fehltreffer erklärbar (2022er-
  Bärenmarkt hatte keine Terminstruktur-Inversion, Klassifikator erkennt
  spezifisch Gamma-Panik-Dynamik, nicht "Markt fällt stark" allgemein).
- POST_PANIC_REVERSION als "beste Selling-Phase": stark bestätigt bei
  kurzen Horizonten (5-10 Tage, Sharpe bis 2,53), zerfällt bis Tag 21
  fast vollständig (IV-Crush ist schnell).
- BULL_FRAGILE/Collar: bei 21 Tagen bestätigt (Sharpe 1,11), kurzfristig
  uneinheitlich.

**Vollständige Methodik, Zahlen, Einschränkungen:**
`UIQ-Suite/docs/REGIME-BACKTEST-VALIDIERUNG.md` (neu, Commit `9815a933`).
Verweis + Kurzfassung in `OPTIONSMODUL-ARCHITEKTUR.md` ergänzt (Commit
`0e1753c9`) — der dort seit 09.08. offene Punkt ist damit geschlossen.

**Ehrliche Einschränkung:** Datenquellen sind öffentliche GitHub-Archive
(SqueezeMetrics-Ursprung, CBOE-CDN direkt), nicht durchgängig gegen die
offizielle Primärquelle Punkt-für-Punkt abgeglichen — nur stichprobenartig
gegen bekannte Ereignisse plausibilisiert.

---

## 3. Datenquellen-Status SqueezeMetrics/CBOE — mit Selbstkorrektur

**Auslöser:** Bei der Regime-Backtest-Recherche fiel auf, dass
`marcusdrewry/gex-forward-returns` als Datenursprung
`squeezemetrics.com/monitor/static/DIX.csv` nennt — im Widerspruch zur
UIQ-Doku ("DIX/GEX ist tot, HTTP 403"). Axel bat um Verfolgung.

**Erster Test (Browser) — FALSCH, aber dokumentiert:** 503 bei 3 Versuchen,
`/monitor` zeigte nur eine Signup/Login-Seite → vorschnelle Schlussfolgerung
"endgültig geschlossen, kein Reaktivierungspfad", so auch in
`GEX-SCHEMA.md` v0.5 committed.

**Zweiter Test (aus echter GitHub-Actions-Umgebung, per Diagnose-Workflow,
2 unabhängige Läufe, unterschiedliche Runner-IPs) — KORRIGIERT:**
- SqueezeMetrics: **HTTP 200**, `Last-Modified: Fri, 07 Aug 2026 21:52:12
  GMT` (3 Tage alt zum Testzeitpunkt), Inhalt verifiziert (echte
  DIX/GEX-Werte 2011-05-02 bis 2026-08-07). Kostenlos, kein Auth nötig.
- CBOE: **HTTP 200** in allen 3 Testmethoden, echte VIX-Daten bestätigt.

**`GEX-SCHEMA.md` v0.6 (Commit `94e1f4da`)** korrigiert das explizit,
inklusive der falschen v0.5-Aussage als sichtbar stehen gelassenes
Beispiel. Konkrete Integrationsempfehlung in Abschnitt 3.2: beide Quellen
könnten den bisherigen VIX/VVIX-Proxy für PCR/GEX ablösen.

**Axel-Vorgabe:** vor festem Einbau einen mehrtägigen Stabilitäts-Check
laufen lassen. **Umgesetzt:**
`ko-aggregator/.github/workflows/datasource-stability-check.yml` — läuft
automatisch **2x täglich** (07:15/19:15 MEZ), protokolliert nach
`ko-aggregator/data/datasource_stability/log.jsonl`. Ersttest bereits
erfolgreich, Log-Datei bestätigt vorhanden. **Läuft eigenständig weiter,
kein Zutun nötig** — nach ~1-2 Wochen für die Fest-Einbau-Entscheidung
auswertbar. Log-Datei bei Bedarf in der nächsten Session prüfen, nicht
davon ausgehen dass es lückenlos lief.

Der einmalige Diagnose-Workflow (`cboe-diagnostic.yml`) wurde nach
Auswertung wieder gelöscht — nur der dauerhafte Stability-Check bleibt.

---

## 4. IBKR-Live-API-Anbindung — Recherche, kein Code

**Kontext:** offener Punkt aus 09.08.-Protokoll ("Ziel-Repo-Entscheidung
noch nicht final bestätigt von Axel, nur Claude-Vorschlag"). Axel: "machen
wir noch" — dann aber bewusst auf Recherche beschränkt, Bau für eine
eigene Session vorgesehen.

**Zwei externe Tools geprüft, in `OPTIONSMODUL-ARCHITEKTUR.md` §7 Punkt 2
dokumentiert (Commit `1e45ec4f`):**

1. **`Voyz/ibeam`** (Python, Apache-2.0, 845 Stars, aktiv) — löst das
   Kern-Automatisierungsproblem der von Axel präferierten Client Portal
   Web API: **PyOTP-Handler für vollautomatisierte 2FA**. Hosting-
   Empfehlung: kleiner dauerhaft laufender VPS (Axels eigener Rechner
   scheidet aus, nicht 24/7 an).
2. **`sparkstartconsulting/IBKR-API-Rust`** (Rust, MIT, 175 Stars, aktiv)
   — Port der klassischen (Socket-basierten) TWS API, nicht direkt
   nutzbar für den präferierten Weg, aber als Plan-B-Referenz vorgemerkt
   falls Client Portal Web API Datenlücken bei Greeks/Optionsketten hat.

**Offen für die nächste (eigene) Session:**
- Ziel-Repo-Entscheidung (UIQ vs. Refundex) — Axel wollte das erst
  besprechen, noch nicht entschieden.
- VPS-Einrichtung, Docker-Deployment, TOTP-Secret-Setup bei IBKR.
- Eigentlicher `ko-ibkr-live.js`-Client-Code — noch nichts geschrieben.

---

## 5. V2-Architektur — Lizenz-Klärung (Refundex ROADMAP.md, nicht UIQ,
   aber hier der Vollständigkeit halber vermerkt da im selben
   Recherche-Strang)

`uebber/ibkr-german-tax-declaration-engine` (das Referenzprojekt vom
Nachmittag, s. Refundex ROADMAP.md 2.18) steht unter **MIT-Lizenz**
(LICENSE-Datei direkt geprüft) — kein rechtliches Hindernis für Übernahme
von Architektur-Mustern in eine spätere Refundex-V2. Würdigungs-Plan
dokumentiert (THIRD-PARTY-NOTICES.md bei V2-Start). Details in
`refundex/docs/ROADMAP.md` Commit `e2849883`, nicht hier im UIQ-Repo.

---

## 6. Aktueller Commit-Stand (zur Verifikation, nicht blind übernehmen)

**UIQ-Suite/docs/:**
- `OPTIONSMODUL-ARCHITEKTUR.md`: zuletzt `1e45ec4f` (IBKR-Tools-Recherche)
- `REGIME-BACKTEST-VALIDIERUNG.md`: neu, `9815a933`
- `SUITE.md`: zuletzt `aca0e3c4` (Refundex-2.17-Verweis auf geschlossen
  aktualisiert — Vormittag, nicht dieser Nachmittagsteil)

**ko-aggregator/docs/:**
- `GEX-SCHEMA.md`: v0.6, `94e1f4da`

**ko-aggregator/.github/workflows/:**
- `datasource-stability-check.yml`: neu, `278669c5`, läuft automatisch
- `cboe-diagnostic.yml`: NICHT mehr vorhanden (nach Nutzung gelöscht)

**Bei Session-Start jeweils per `git log`/API selbst gegenprüfen, nicht
diesem Protokoll blind glauben (s. Pflicht-Header Punkt 1).**

---

## 7. Offene Punkte für nächste Session

1. **Datenquellen-Stabilitäts-Log auswerten** (sobald genug Tage
   vorliegen, ~1-2 Wochen ab 10.08.2026) → Entscheidung: SqueezeMetrics/
   CBOE fest in `market_aggregator.py` integrieren oder nicht.
2. **IBKR-Live-API-Anbindung** — eigene Session, Ziel-Repo-Entscheidung
   zuerst, dann VPS/IBeam-Setup, dann `ko-ibkr-live.js`-Code.
3. **Kontoprofil-Modal (Refundex)** — falls Axel das Problem weiterhin
   meldet, nicht als "kein Bug" abgehakt behandeln, weiter debuggen.
4. Aus dem 09.08.-Protokoll weiterhin unverändert offen (nicht heute
   berührt): Rechtsgutachten WpHG, Beta-Tokens, leeres Repo
   `refundex-taxdata-private` löschen, IWV-CSV-Update (~27.08. fällig).

---

## 8. PAT-Hygiene

Session-PAT (`ghp_3819...`) wird laut Ankündigung direkt nach diesem
Protokoll von Axel widerrufen.

---
*Erstellt am Ende der Session vom 10.08.2026 (Nachmittags-/Abendteil)
durch Claude, auf Axel-Anfrage.*
