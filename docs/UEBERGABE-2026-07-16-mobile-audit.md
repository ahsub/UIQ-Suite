## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v353 deployed", "X funktioniert") ist eine Aussage der
   letzten Session über sich selbst — nicht dein eigenes Wissen. Behandle es
   wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Axel führt heute (16.07.2026) in der Praxis einen kompletten Durchklick-
   Test durch.** Falls dieses Protokoll VOR den Ergebnissen dieses Tests
   gelesen wird: die hier dokumentierten Fixes (v351-v353, ko-modules@f6e398e,
   ko-aggregator@f38f3e4) sind NODE-getestet, aber NICHT auf einem echten
   Smartphone/Emulator visuell verifiziert. Erwarte, dass Axel mit weiteren
   Befunden zurückkommt — das ist der Plan, kein Fehlschlag.

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. Axel: bitte bei nächster Gelegenheit fragen "hast du das verifiziert oder
   übernommen?", wenn ich etwas aus diesem Protokoll unkritisch wiederhole.

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

# ÜBERGABEPROTOKOLL — 16.07.2026, Mobile-Audit + kleinere Fixes

## Kontext

Fortsetzung der Phase-0.5-Arbeit vom Vortag (15.07.2026, siehe
`UEBERGABE-2026-07-15-phase05-abschluss.md` für den vollständigen Verlauf
A-J + die dort gefundenen kritischen Bugs). Diese Session: Mobile-Audit
(Arbeitspaket J), ein von Axel selbst gefundener echter Mobile-Bug, und
zwei kleinere Feature-Anfragen.

**axel-scanner-Version am Ende: v353** (war v350 zu Sessionbeginn)
**ko-aggregator-Version am Ende: v5.11.0** (war v5.10.0 zu Sessionbeginn)
**ko-modules: ko-scanner.js** Dropdown-Clamping-Fix (Commit `f6e398e`)

---

## 1. Mobile-Ist-Zustand-Audit (Arbeitspaket J)

Da kein echter Browser/Emulator zur Verfügung steht, wurde per Code-Analyse
geprüft (nicht visuell getestet):

**Bereits gut:** Navigation-Grundmechanismus (Sidebar → Bottom-Bar),
Leaderboard-Tab-Leisten nutzen bereits `flex-wrap`.

**Gefundene Probleme, in Prioritätsreihenfolge:**
1. Touch-Targets systemweit klein (2-4px Padding, hunderte Stellen)
2. 34 `grid-template-columns`-Definitionen, mehrere mit 4-5 festen Spalten
3. 1 echtes Überlauf-Risiko: Handelsplatz-Dropdown (gestern gebaut) klemmte
   nur den linken Rand, nicht den rechten — auf schmalen Screens konnte es
   rechts abgeschnitten werden
4. 6 Tabellen ohne `overflow-x:auto`-Wrapper (niedriges Risiko, nur 2-5 Spalten,
   NICHT behoben — bei Gelegenheit)

**Umgesetzt (axel-scanner v351):**
- Dropdown-Rechts-Clamping ergänzt (ko-modules@f6e398e)
- Touch-Target-Erweiterung: unsichtbare `::after`-Klickflächen-Erweiterung
  (5px) für alle Buttons/`[onclick]`-Elemente im Mobile-Breakpoint — CSS-only,
  keine Änderung an den Einzelstellen. Bewusst ausgeschlossen: Elemente mit
  eigener Inline-Positionierung (sonst würde die unsichtbare Fläche an
  falscher Stelle rendern).
- Grid-Spalten-Reduktion per Attribut-Selektor (`[style*="grid-template-
  columns:repeat(4"]` etc. → 2 Spalten via `!important`)

**NICHT visuell verifiziert** — nur Syntax-/Klammer-Balance-geprüft.

---

## 2. Echter Bug, von Axel selbst gefunden: Bottom-Bar-Überlauf (axel-scanner v352)

**Root Cause:** 9 Nav-Buttons × `min-width:60px` = 540px Mindestbreite — passt
nicht auf typische Handybreite (375-414px). Die Leiste hatte zwar bereits
`overflow-x:auto`, aber ein horizontal scrollender Bottom-Tab-Bar ist ein sehr
unübliches Mobile-Muster. Items an den Rändern wirkten wie "nicht klickbar/
sichtbar".

**Fix:** Standard-Mobile-Pattern (wie Instagram/Twitter): 4 Kern-Workflow-Items
bleiben immer sichtbar (Übersicht, Alpha Desk, Scanner, Makro), 5 seltener
genutzte Items (Fibonacci, KO-Rechner, Backlog, Einstellungen, Cloud Sync)
wandern hinter einen neuen "Mehr"-Button (`toggleMobileMoreMenu()`).

**Von Axel bestätigt:** "genau die Art von Lösung, die ich mir vorgestellt
habe" — aber NICHT bestätigt ist, ob es auf dem echten Gerät tatsächlich
korrekt aussieht (nur die Konzept-Richtung wurde gutgeheißen, noch vor dem
heutigen Durchklick-Test).

**Bekannte Einschränkung:** Die Auswahl der 4 "Kern"-Items ist meine
Einschätzung (angelehnt ans Reifekriterium-Workflow). Falls Axel eine andere
Priorisierung will, ist das eine triviale Klassen-Umsortierung
(`.nav-mobile-secondary`), kein struktureller Umbau.

---

## 3. ETF-Modul-Lösung für Sektor-Holdings (ko-aggregator v5.11.0)

**Axel-Anfrage:** Sektor-ETF-Ticker-Listen vervollständigen (bisher nur XLK
als Proof-of-Concept), idealerweise als Modul statt Einzelfall.

**Umsetzung:** Die Kernfunktion `build_sector_holdings()` war schon immer
generisch — nur der Aufruf war XLK-only. Jetzt: `SECTOR_ETF_LIST = ['XLK',
'XLY','XLF','XLE','XLV','XLI','XLU']` (identisch zur bereits bestehenden
Sektor-Überhitzungs-Liste in axel-scanner), Schleife statt Einzelfall.

**Zweistufiger Ansatz pro ETF:**
1. Automatischer Download-Versuch von der öffentlichen SSGA-URL
   (`ssga.com/.../holdings-daily-us-en-{ticker}.xlsx`, Standardmuster für alle
   SPDR-Sektor-ETFs)
2. Fallback auf lokal abgelegte Datei (`data/holdings_{ETF}.xlsx`, wie bisher
   bei XLK)

**⚠️ WICHTIGSTE OFFENE VERIFIKATION dieser Session:** Der automatische
Download-URL-Pfad ist **NICHT verifiziert**. Mein eigener Sandbox-
Netzwerkzugriff blockiert `ssga.com` (Host nicht in Allowlist) — ich konnte
nur die Fallback-LOGIK selbst testen (3 Szenarien, alle korrekt), nicht den
echten HTTP-Request gegen SSGA. **Nach dem nächsten echten Aggregator-Lauf
unbedingt die Logs prüfen:** zeigen sie "automatischer Download erfolgreich"
oder "Fallback auf lokale Datei" pro ETF? Falls der Download nirgends
funktioniert, müsste Axel für XLY/XLF/XLE/XLV/XLI/XLU (XLK ist bereits da)
die SSGA-Holdings-XLSX manuell besorgen und ablegen — kein Code-Aufwand, nur
Datei-Beschaffung, analog zum bestehenden XLK-Vorgehen.

---

## 4. Versionsnummer beim Home-Button (Kosmetik, axel-scanner v353)

Kleiner Tag neben dem "UnderlyingIQ"-Titel, liest dynamisch aus dem
bestehenden `<meta name="version">`-Tag. Kein zweiter, potenziell
veraltender Versions-String. Funktional getestet (String-Parsing), nicht
visuell verifiziert.

---

## Infrastruktur-Stand (Ende Session, 16.07.2026)

| Komponente | Version/Hash |
|---|---|
| axel-scanner | v353, Commit `08370a6` |
| ko-aggregator (Python) | v5.11.0, Commit `f38f3e4` |
| ko-scanner.js | Commit `f6e398e` (Dropdown-Clamping-Fix) |

---

## Pendente Punkte für nächste Session

1. **[HÖCHSTE PRIORITÄT]** Ergebnisse aus Axels heutigem Durchklick-Test
   (Praxis, 16.07.2026 nachmittags) abarbeiten — das war der ganze Zweck des
   Mobile-Audits heute.
2. **[PENDING]** ETF-Holdings-Aggregator-Lauf-Logs prüfen: hat der
   automatische SSGA-Download funktioniert? (siehe Abschnitt 3 oben)
3. **[PENDING]** Optionen-Watchlist-KI-Anreicherung (aus Vortag, F) nach
   echtem Aggregator-Lauf verifizieren — auch das noch nicht bestätigt.
4. **[PENDING]** Dead-Code-Audit Priorität 4 (kosmetisch, siehe SUITE.md) —
   niedrige Dringlichkeit.
5. **[PENDING]** 6 Tabellen ohne `overflow-x:auto`-Wrapper (niedriges Risiko,
   siehe Abschnitt 1) — bei Gelegenheit nachziehen.
6. **[STRATEGISCH]** Nach Bestätigung des Phase-0.5-Reifekriteriums:
   KI-Kontingent-Skalierung (Phase-1-Blocker, siehe STRATEGIE.md §Phase 1)
   als nächster inhaltlicher Schwerpunkt — Request-Queue, aggressives
   Ergebnis-Caching, Pro-Nutzer-Budget. Baut direkt auf Arbeitspaket B
   (Cache-Disziplin) auf.

## Wiederkehrendes Prinzip aus den letzten beiden Sessions

Bei jeder Erweiterung/jedem neuen Feature: objektiv berechenbare/prüfbare
Werte (Daten, URLs, Datumsarithmetik) client-/server-seitig verifizieren wo
möglich, nicht blind der KI oder der eigenen Annahme überlassen. Wo eine
echte Verifikation (Netzwerk-Test, Browser-Test) nicht möglich war, das
EXPLIZIT als offene Lücke markieren (wie hier bei der SSGA-URL) statt es
stillschweigend als erledigt zu behandeln.
