# UIQ — Umbauplan Public-UI-Bereinigung

**Stand:** 28.09.2026 · Grundlage: `ahsub/axel-scanner` @ `72eea0d` (23.09.2026), `index.html` + `help.html`
**Status:** Bestandsaufnahme, kein Code geändert (Codefreeze bis nach dem Bundesbank-Gespräch / Audit №72)
**Zweck:** Alle Stellen der öffentlichen Oberfläche, die personalisieren, direktiv formulieren oder Positionsgrößen ableiten — mit vorgeschlagener Maßnahme. Reihenfolge folgt der beschlossenen Sequenz (persönliche Eingaben → imperative Sprache → Positionsgrößenlogik → EIC/PIN-Architektur → öffentliche Datenhaltung).

Zeilennummern beziehen sich auf den genannten Commit und verschieben sich bei jeder Änderung — beim Umbau per Funktionsname/Suchbegriff suchen.

Maßnahmen: **E** = entfernen · **U** = umformulieren (deskriptiv) · **G** = hinter echtes Owner-Gate legen · **P** = prüfen

---

## 0. Vorab-Befunde (für das Gespräch relevant)

| # | Befund | Bewertung |
|---|---|---|
| 0.1 | `ko-ibkr-live.js` wird in `index.html` **nicht** eingebunden (keine Referenz). Es gibt keine Order-Weiterleitung an einen Broker. | Aussage „keine Orderweiterleitung“ ist durch den Code gedeckt. |
| 0.2 | Der KO-Rechner (`panel-rechner`) enthält aber eine **Schritt-für-Schritt-Eingabeanleitung für eine Limit-Order in Trade Republic** inkl. berechnetem Limit-Preis. | Keine Vermittlung, aber offen benennen: ausführungsnahe Handlungsanleitung. |
| 0.3 | App-PIN (`getPin()`) fällt auf einen **im öffentlichen Quelltext hinterlegten Default-PIN** zurück. | Faktisch kein Zugangsschutz — „nur ich nutze es“ stimmt, „nur ich *kann* es nutzen“ nicht. |
| 0.4 | EIC-PIN (`eicPinSubmit()`) liegt in `localStorage`; beim **ersten Aufruf in einem neuen Browser wird jeder eingegebene PIN als neuer PIN gesetzt** → UI-EIC-Modus für jeden Besucher freischaltbar. | KI-Calls sind serverseitig an `isOwner` gebunden (v1.11), **clientseitig berechnete** EIC-Inhalte (Stops, Ziele, CSP-Strikes, direktive Deep-Dive-Blöcke) aber nicht. Bekannter Punkt (Entscheidung 10.08. als fehlerhaft anerkannt). |
| 0.5 | `verifyUserToken()` setzt bei nicht erreichbarem `ko-auth` den Tier auf **`admin`** („Fallback admin (Phase 1)“). | Fail-open. Vor jeder Testphase auf fail-closed (`free`) umstellen. |

---

## 1. Persönliche Eingaben

| # | Stelle | Inhalt | Maßnahme |
|---|---|---|---|
| 1.1 | `panel-admin` → „Portfolio & Risiko-Einstellungen“ (~Z. 3530) | Portfoliogröße, Cashbestand, Max. Risiko pro Trade, Max. Positionen — „für automatische Positionsgrößen-Empfehlung“ | **G** (nur Owner) oder **E** in Public |
| 1.2 | `panel-rechner` KO-Rechner (~Z. 2114–2195) | Kapitaleinsatz (€), mentaler Stop, TR-Produktdaten → Anzahl Turbos, Verlust bei Stop, Gewinn bei +10 % | **G** — persönlicher Trade-Rechner |
| 1.3 | Alpha Desk → `alpha-panel-trackrecord` „ATR-Positionsgröße“ (~Z. 4164) | Eingabe Depot € + Risiko % | **E** in Public / **G** |
| 1.4 | `useInRechner(sym)` (~Z. 10496) | Übernimmt Scanner-Titel in den Rechner, füllt KO −20 %/Stop −10 % vor | **G** (folgt 1.2) |
| 1.5 | `backlog`-Panel (Watchlist & Tracking), Journal, Sync | Persönliche Watchlisten/Journal, per KV synchronisiert | **P** — Datenhaltung pro Nutzer (→ Abschnitt 5) |

## 2. Imperative / direktive Sprache

| # | Stelle | Wortlaut (Auszug) | Maßnahme |
|---|---|---|---|
| 2.1 | `sortAndRenderCards()` (~Z. 9650, 9689), Scanner-Karten (~Z. 10112), `useInRechner()` (~Z. 10506) | „Kaufsignal — 3/3 bullisch“, „Kein Einstieg“ | **U** → „3/3 Indikatoren bullisch“ / „Signallage: stark / gemischt / schwach“ |
| 2.2 | `generateRuleBasedSummary()` Makro-Tagesfazit (~Z. 13115–13160) | „Positionsgrößen auf max. 50 % reduzieren“, „keine neuen Long-Positionen in Tech/Semis“, „Bestehende Positionen absichern“, „max. €2.000 pro Position“, „Nur 3/3 Signale … handeln“ — Kommentar im Code: *„mit konkreten Handlungsempfehlungen“* | **U** — höchste Priorität in diesem Abschnitt; deskriptive Regime-Beschreibung ohne Handlungsanweisung |
| 2.3 | `renderFiboCards()` Fibo-Tab (~Z. 17438) | „Einstieg empfohlen: Starter 40 % bei $… → Aufstocken 40 % … Stop-Loss unter $…“ | **E** in Public / **G** — konkreter Einstiegs- und Stop-Plan pro Titel |
| 2.4 | Regime-Tooltip „Selektiv“ (~Z. 23358) | „Nur Setups mit Score ≥75 … handeln. Positionsgröße reduzieren …“ | **U** |
| 2.5 | `generateDeepDiveKI()` Kontext-Box (~Z. 23006–23010) | „Positionsgröße prüfen“, „Risiko-Exposition prüfen“ | **U** (grenzwertig, aber appellativ) |
| 2.6 | Rechner Hinweiszeile (~Z. 10538, 2195) | „Positionsgröße reduzieren“, „KO-Abstand ≥20 % empfohlen“ | **G** (folgt 1.2) |
| 2.7 | Strategie-Header (~Z. 20273) | „KO-Trading: Hebel 3–8x · … · Positionsgröße max. €2.000“ | **U/E** — persönliche Regel als Produkttext |
| 2.8 | `help.html` (Z. 617) | „Max. 1–2 % des Depots pro KO-Position“ | **U** → als Literatur-/Konventionshinweis kennzeichnen oder **E** |
| 2.9 | `ko-prompts.js` @475cf2a `_getIntermarketPrompt()` Punkt 8 (~Z. 7072) — KI-Makroanalyse (`autoMakro`), **nicht EIC-gated** | Prompt fordert „KONKRETE HANDLUNGSEMPFEHLUNG: … welche Sektoren bevorzugen, welche meiden, Positionsgröße, KO-Abstand“ | **U** — höchste Priorität; Punkt 8 deskriptiv neu fassen (Regime-/Sektorlage, keine Handlungsanweisung) |
| 2.10 | `ko-prompts.js` `STRATEGIES.ko.focus` + `hint` (~Z. 5846/5856) — fließt über `_publicKriterienBlock()` in den **Public**-KO-Prompt | „Positionsgroessen-Passung: … Limit von max. 2.000 EUR (Starter- vs. Aufstockungs-Groesse)“ | **E** aus Public-Kriterien (ggf. nur EIC) |

Geprüft: EIC-Master-Prompt §23 (~Z. 4889) und Ebene 5 (~Z. 5037) **verbieten** konkrete Positionsgrößen ausdrücklich — der EIC-Modus selbst gibt keine Positionsgrößen aus.

## 3. Positionsgrößenlogik

Betrifft 1.1–1.4, 2.2, 2.7, 2.8. Grundsatzentscheidung: Positionsgröße ist in Public **nicht** Teil von UIQ (analog zur EIC-§23-Entscheidung vom 08.09.: „explizit OHNE Positionsgröße“). Umsetzung: Rechenlogik nur im Owner-Pfad, in Public weder Eingabefelder noch abgeleitete Stückzahlen/€-Beträge.

## 4. EIC-/PIN-Architektur

| # | Maßnahme | Bezug |
|---|---|---|
| 4.1 | EIC-Freischaltung serverseitig prüfen (Owner-Token), nicht per `localStorage`-PIN | 0.4 |
| 4.2 | Owner-only UI-Teile (1.1–1.4, 2.3, EIC-Quick-Analysis ~Z. 23716/23770 mit Stop/Ziel/CSP-Strike/KO-Level) erst nach serverseitiger Bestätigung rendern — oder aus dem Public-Build ganz entfernen | 0.4 |
| 4.3 | `verifyUserToken()` fail-closed (`free`) statt `admin` | 0.5 |
| 4.4 | App-Zugang: kein Default-PIN im Quelltext; für eine Testphase echte Nutzer-Authentifizierung | 0.3 |
| 4.5 | Langfristig: getrennter Public-Build ohne Owner-Code (Public-Quelltext enthält dann nichts, was freigeschaltet werden könnte) | Architekturentscheidung, **P** |

## 5. Öffentliche Datenhaltung

| # | Stelle | Maßnahme |
|---|---|---|
| 5.1 | Öffentliches Archiv im `ko-aggregator`-Repo (Ranglisten, Track Record) | **P** — mit Bundesbank-Einschätzung abgleichen; ggf. privat stellen oder nur aggregiert veröffentlichen |
| 5.2 | Sync/KV pro Nutzer (Watchlisten, Journal, Briefing) | **P** — für Testphase Nutzertrennung und Datenschutz klären |
| 5.3 | Hartkodierte Screener-Snapshot-Liste im Quelltext (~Z. 10610) | **P** — Herkunft/Lizenz der Daten prüfen |

---

## Vorgeschlagene Umsetzungsreihenfolge (nach Freeze-Ende)

1. **Sofort, geringer Aufwand:** 4.3 (fail-closed), 2.1 (Kaufsignal-Label), 2.2 (Tagesfazit), 2.7/2.8 — reine Text-/Einzeilen-Änderungen
2. **Owner-Gate:** 4.1 + 4.2 zusammen mit 1.1–1.4 und 2.3 (ein Batch, da dieselbe Gate-Logik)
3. **Zugang:** 4.4 vor jeder Weitergabe der URL an Dritte
4. **Nach Bundesbank-Rückmeldung:** 5.1–5.3 und 4.5

## Offene Punkte für die Anpassung nach dem Gespräch

- Welche der oben gelisteten Funktionen hat die Bundesbank als maßgeblich benannt? → Priorität hier nachziehen
- Gilt die Beurteilung für den heutigen oder den geplanten Umfang? → ggf. erneute Vorlage nach Umbau einplanen
- Vollständigkeit: Suche lief über `index.html`/`help.html` des Frontends; die ko-modules (CDN) und KI-Prompts sind nicht Teil dieser Liste (dort seit Sept. bereits systematisch gehärtet)
