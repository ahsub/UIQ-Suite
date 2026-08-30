# UEBERGABE-2026-08-30.md

Fortsetzung von `UEBERGABE-2026-08-29.md`. Heute: Vereinheitlichung des
"UIQ Options Coaching Standard" über alle 5 Options-Strategien, zwei
strukturelle Design-Weichen (Collar-Bestandsprüfung, Options-Modul-
Abgrenzung), eine Performance-Diagnose ohne abschließenden Befund, und
ein tiefer, mehrstufiger Root-Cause-Fund bei VIX/VVIX/SKEW (Single-
Source-of-Truth-Bruch über drei Dateien hinweg). Zwei vollständige
Live-Test-Zyklen an Collar (vor/nach AUFGABE-Strukturfix). Kein Rewrite
des Gesamtsystems — durchgängig additive, versionierte Einzelschritte.

---

## 1. Ausgangslage

Gestern (№68) wurde der "UIQ Options Coaching Standard" als Reviewer-
Vorschlag formuliert: vier strategiespezifische Framing-Fragen (CSP,
CSP ATM/NA, Covered Call, Collar/Protective Put) über derselben Kette
Model Signal → Evidence → Risk → Trade-off → Model Boundary → External
Validation. Offen gelassener erster Punkt: die Collar-Framing-Frage
("Gibt es modellbasierte Hinweise, eine bestehende Long-Position
hinsichtlich Absicherung zu überprüfen?") ist strukturell anders als
die ersten drei — eine Bestandsprüfung, keine Kandidatensuche über das
Scan-Universum. Genau diese Weiche war der Einstieg für heute.

---

## 2. Design-Diskussion — Mode-Achse und Abgrenzungen

Vor jedem Code-Eingriff mehrere zusammenhängende Entscheidungen geklärt:

- **Collar-Weiche:** Builder braucht eine `mode`-Achse
  (`scan` | `holding_review` | `structure_selection`). `holding_review`
  (Collar) hat im Public-Modus zwingend hypothetische Sprache ("falls
  du hältst"), da UIQ keinen Zugriff auf echte Nutzerpositionen hat
  (24.08.-Vertraulichkeitsentscheidung bleibt in Kraft).
- **CSP/Wheel "Direktkauf für CC":** Axels Idee, per Buy-to-Open gezielt
  eine CC-Position zu eröffnen und den Wheel-Zyklus darüber fortzusetzen,
  ist **kein neuer CSP/Wheel-Fall** — wird als bestehende CC-Framing-Frage
  plus Wheel-Kontext-Flag behandelt (noch nicht implementiert, s. Plan
  für morgen).
- **Reale Positionsdaten (Stückzahl-Eintrag für CC-Tauglichkeit):**
  Out of Scope für UIQ Public/EIC — gehört ins geplante, separate
  Options-Modul, dort aber über die ohnehin vorgesehene IB-Gateway/
  ib_async-Anbindung, nicht per manueller Eingabe. UIQ behält nur die
  leichte Ad-hoc-Variante (Einzelticker im Scanner-Tab).
- **EIC-Schritt-7 "Handlungsempfehlung":** Axel möchte die Coaching-Kette
  auch im EIC-Modus als gemeinsame Erklärschicht nutzen (inkl. Multi-Leg/
  Positionsanalyse), mit einem zusätzlichen, EIC-gated Schritt 7
  (direktive Ableitung aus der Kette) — gilt rückwirkend auch für die
  5 bestehenden Strategien im EIC-Modus. Noch nicht implementiert.
- **`structure_selection`:** dritter Mode-Wert für Multi-Leg (Iron
  Condor etc.), bewusst nur als Platzhalter im Builder reserviert —
  keine inhaltlichen Regeln, die folgen erst mit Options-Modul-Start.
  Multi-Leg-Regeln selbst heute **bewusst nicht** ausgearbeitet
  (Scope-Drift-Risiko, kein Unterbau zum Live-Testen vorhanden).

---

## 3. `ko-ai.js` v1.14 → v1.15 — Performance-Diagnose (ohne Befund)

Axel meldet: Morning-Briefing-Generierung dauert seit einigen Tagen
~10min statt vorher <3min. `callAnthropic()` hatte bislang **keinerlei**
Zeitmessung. Fix: Timing-Instrumentierung um den `fetch()`-Call
(`console.log('[callAnthropic] model=... maxTokens=... durationMs=...')`),
rein additiv, keine Verhaltensänderung.

**Ergebnis nach Deploy:** Erster Messwert zeigte `durationMs=70800`
(70,8s) bei `wallTimeMs=70855` — praktisch die gesamte Laufzeit im
Anthropic-Call selbst, CPU-Zeit nur 3ms (reines I/O-Warten, keine
Datensammlungs-Bottleneck). **Aber:** dieser Lauf fühlte sich nicht wie
die gemeldeten 10 Minuten an — kein Vergleichswert aus einem tatsächlich
"langsamen" Lauf erhalten. **Root Cause weiterhin offen.**

**Nebenfund im selben Log:** `[COMPLIANCE] morning Top-Kandidat`
geflaggt, obwohl der Public-Output korrekt keine Top-Kandidaten nannte
(Satz war eine Verneinung: "kann nicht generiert werden"). Vermuteter
Fehlalarm — der Compliance-Scanner ist reine Textsuche ohne
Verneinungserkennung. Bei Auswertung von `/logs?flagged=1` zu
berücksichtigen.

---

## 4. VIX/VVIX/SKEW — Single-Source-of-Truth-Bruch (mehrstufiger Fund)

Ausgelöst durch einen MB-Text, der explizit zwei widersprüchliche
VIX-Werte im selben Fließtext zitierte ("laut Aggregator-Snapshot 18,77
... gegenüber dem Snapshot-Wert vom 28. August 14,43") und sich dafür
selbst Quellen-Labels ausdachte, die im Code nirgends vorkommen.

### 4.1 Erster Fix-Versuch — `index.html` v485 → v486 (später teilweise obsolet)

Erste Hypothese: zwei UI-Datenpfade für VIX — `#m-vix`
(client-seitiger Live-Fetch, `fetchVix()`) vs. `zscores.vix`
(Aggregator-KV, Kommentar "Single Source of Truth"). Fix: `VIX:`-Zeile
aus der `volatility`-Registry-Kategorie im MB-Prompt-Aufbau
herausgefiltert, da die AGGREGATOR-SNAPSHOT-Sektion ohnehin einen
VIX-Wert liefert. **Später korrigiert:** die Analyse war zunächst
falsch herum — 14,43 (nicht 18,77) stellte sich als der korrekte Wert
heraus (s. 4.2). Der Dedupe-Fix selbst bleibt unschädlich (durch 4.2
größtenteils redundant geworden), war aber nicht die eigentliche
Lösung.

### 4.2 Root-Cause-Fund — `market_aggregator.py` v5.38.0 → v5.39.0

Per Live-Nachstellung (yfinance direkt abgefragt, Intersection-Logik
identisch zu `fetch_mse_history()` reproduziert) zweifelsfrei
nachgewiesen: **14,43 ist korrekt, 18,77 ist falsch.** Kein Tag der
letzten 10 Handelstage lag nahe 18,77; der Wert lag verdächtig nah am
252-Tage-Mittelwert (18,82) — Zufall, keine Verwechslung mit dem
Mittelwert selbst.

**Tatsächliche Ursache, per GHA-Log vom 29.08.2026 10:25 UTC belegt:**
`^VIX3M` lieferte in diesem Lauf nur 147 Tage, während `^VVIX`/`^SKEW`/
`^VIX` 176-177 Tage hatten. `fetch_mse_history()` bildete die
Kern-Schnittmenge bislang gegen **alle vier** Symbole — dadurch wurden
VIX/VVIX/SKEW fälschlich auf VIX3Ms kürzeres, ~1 Monat älteres
gemeinsames Enddatum zurückgezogen. Betrifft dieselbe Fehlerklasse wie
die wiederholten VIX3M-Squeeze-Bugs vom 16./19.08. — diesmal aber die
Intersection-Kopplung selbst, nicht der einzelne Fetch.

**Zwei Fixes:**
1. `fetch_mse_history()`: Kern-Schnittmenge nur noch über VIX/VVIX/SKEW;
   `vixRatio`/VIX3M bekommt eigene Tag-für-Tag-Zuordnung, kann die
   anderen drei Serien nicht mehr beeinflussen. Nicht-blockierende
   Log-Warnung bei Teilabdeckung.
2. `calc_macro_zscores()`: `current` für VIX kommt jetzt kanonisch aus
   `fetch_vix_term()` (unabhängiger, einfacherer Live-Fetch) statt aus
   `vals[-1]` der Intersection-Historie. Z-Score/Perzentil weiterhin aus
   der 252T-Verteilung, aber gegen diesen kanonischen Wert berechnet.
   Log-Warnung bei >10% Abweichung zwischen History-Wert und Live-Wert.

**Verifikation — mehrstufig, nicht nur Syntaxprüfung:**
- Beide Funktionen per AST aus der Datei extrahiert und isoliert gegen
  echte Yahoo-Daten ausgeführt (`current: 14.43`, exakt gleich
  `vix_term.vix`, Z=-1.12, P4 statt vorher Z=-0.01, P63).
- Nach Axels manuellem Aggregator-Run **live im echten Produktionslog**
  bestätigt: `VIX3M deckt nur 146/176 Kern-Tage ab — vixRatio ... VIX/
  VVIX/SKEW davon NICHT betroffen`; `VIX: 14.43` (vorher wäre das auf
  ~18,x zurückgezogen worden).
- Per Chrome-Fernsteuerung (Claude-in-Chrome) direkt im laufenden
  Frontend gegengeprüft: `vixTerm.vix` und `zscores.vix.current` sind
  jetzt identisch (14,43), frischer KV-Zeitstempel bestätigt.

### 4.3 Verbleibender Scope — NICHT UIQ-weit abgeschlossen

Auf Axels Nachfrage ausdrücklich klargestellt, drei offene Punkte:
1. **VVIX/SKEW haben keine Kanonisierung** wie VIX (Fix 2) — es gibt
   keine unabhängige Live-Einzelwert-Quelle für sie. Ein eigenständiger
   (nicht VIX3M-bedingter) Teil-Download von VVIX/SKEW selbst wäre
   weiterhin ungeschützt.
2. **Client/Server-Aufspaltung unverändert:** `#m-vix` + ~40 abhängige
   UI-Stellen laufen weiterhin über einen eigenen, unabhängigen
   clientseitigen Live-Fetch, getrennt von `vixTerm.vix`/`zscores.vix`
   im KV (Axels "Punkt B" von heute Vormittag — bewusst zurückgestellt,
   soll baldmöglich nach Abschluss der Tagesaufgaben erfolgen).
3. Nur **ein** Live-Lauf unter Normalbedingungen verifiziert — kein
   Stresstest für einen eigenständigen VVIX/SKEW-Teildownload.

### 4.4 Nebenfund, vorgemerkt

`WARNING CBOE PCR nicht verfügbar: could not convert string to float:
'\]\n3:I[164171' — nutze VIX-Proxy`. Fehlerstring wirkt wie ein React/
Next.js-RSC-Payload-Fragment (CBOE-Seite evtl. umgebaut). Bestehender
VIX-Proxy-Fallback griff sauber (PCR trotzdem berechnet) — neuer,
andersartiger Bug, noch nicht untersucht.

---

## 5. `ko-prompts.js` v2.14.0 → v2.16.0 — Mode-Achse + zwei Live-Test-Zyklen

### 5.1 v2.14.0 → v2.15.0: Mode-Parameter + VERSION-Drift-Fix

- `_publicOptionsPrompt()`: neuer optionaler Parameter `mode`
  (Default `'scan'`). `holding_review` ergänzt den `rolle`-Text um die
  hypothetische Sprachregel. `structure_selection` reserviert, ohne
  Logik.
- `mode` als lokale Variable am Anfang aller 5 Options-Strategie-
  Funktionen deklariert, für Public **und** EIC-Zweig sichtbar
  (csp_wheel/atmna/weekly_income/cc: `'scan'`; collar:
  `'holding_review'`) — EIC-Zweig bewusst ohne Verhaltensänderung, nur
  Marker für künftige Konsistenz (Bezug: geplanter EIC-Schritt-7, s. §2).
- **VERSION-Drift-Fund:** `KoPrompts.VERSION` stand seit dem gesamten
  Regulatory-Umbau vom 29.08. (9 Versionssprünge, v2.6.0→v2.14.0)
  unverändert auf `'2.5.7'` — der Datei-Header wurde jedes Mal
  aktualisiert, die tatsächlich von `console.log()` ausgelesene
  Konstante nicht. Per Chrome-Konsole live bestätigt (Funktionscode war
  die ganze Zeit aktuell, nur die Selbstauskunft falsch). Jetzt
  synchronisiert.
- Funktional verifiziert: alle 5 Strategien per isolierter
  Node-Ausführung aufgerufen, `holding_review`-Sprachregel nur bei
  Collar vorhanden, `KoPrompts.VERSION === '2.15.0'`.

### 5.2 Collar-Live-Test 1 (nach v2.15.0) — Fehlschlag, Ursache gefunden

Echter Button-Klick im Scanner-Tab. **Ergebnis: `mode` hatte praktisch
keine Wirkung.** Output strukturell identisch zu einem Scan-Ranking
("HÖCHSTE COLLAR/PROTECTIVE PUT SETUPS STRATEGY-FITS", 3 Titel gerankt)
— die neue Sprachregel im `rolle`-Satz ging unter, weil das Modell der
konkreten AUFGABE-Formulierung folgt (Punkt 2: "Welche 3 Titel weisen
die höchste Kriterien-Übereinstimmung auf?"), nicht der einleitenden
Rollenbeschreibung. Exakt dieselbe Fehlerklasse wie der 28.08.-Fund
(eingebetteter EIC-Block widersprach dem System-Prompt).

**Zwei weitere Funde im selben Testlauf:**
- **`risikoBegriff`-Lücke:** Collar nutzt den generischen Fallback
  "Andienung" — begrifflich unpassend für eine Struktur mit Put- UND
  Call-Seite (analog zum bereits gelösten CC-Fund vom 29.08.). Noch
  nicht behoben.
- **Compliance-Scanner-Regex-Lücke (1. Beleg):** "klassifiziert
  Collar-Setups als 'nicht nötig'" — Pattern verlangt zwingend
  "strukturell" davor, greift hier nicht.

### 5.3 v2.15.0 → v2.16.0: AUFGABE-Struktur nach `mode` verzweigt

Punkte 2/3/5 in `_publicOptionsPrompt()` jetzt vollständig nach `mode`
verzweigt, nicht mehr nur der einleitende Satz:
- `holding_review`: Überschrift "TITEL MIT MODELLBASIERTEM
  ABSICHERUNGS-HINWEIS" statt "HÖCHSTE ... STRATEGY-FITS"; Aufgabe
  "liefern die Modellkriterien einen Hinweis, eine — falls gehaltene —
  Position hinsichtlich Absicherung zu überprüfen?" statt
  Ranking-Sprache; Ablehnungs-Punkt "KEIN MODELLBASIERTER
  ABSICHERUNGS-HINWEIS" statt "GERINGER STRATEGY FIT"; Zusammenfassung
  ohne "höchste Übereinstimmung"-Formulierung.
- `scan` (csp_wheel/atmna/weekly_income/cc): strukturell unverändert.
- a-d-Struktur, Pflicht-Satzmuster (Trade-off, Modell-Grenze) und
  Bewertungskriterien identisch zu `scan` beibehalten.

Verifiziert: alle 5 Strategien isoliert ausgeführt — nur `collar` zeigt
die neuen Formulierungen, die anderen 4 exakt die alte Scan-Struktur
(kein Seiteneffekt).

### 5.4 Collar-Live-Test 2 (nach v2.16.0) — Erfolg, zwei neue Funde

Echter Button-Klick nach Deploy. **AUFGABE-Fix bestätigt:** Überschrift,
Aufgabenstellung, Ablehnungs-Sektion und Zusammenfassung durchgängig
hypothetisch/nicht-rankend ("Modellsignale, die eine Überprüfung des
Absicherungsbedarfs nahelegen, falls Positionen gehalten werden").

**Zwei neue Funde, beide für morgen vorgemerkt:**
- **Compliance-Scanner-Regex-Lücke (2. Beleg, bestätigt das Muster):**
  "als Regime-Signal **nicht erforderlich** bewertet" — wieder ohne
  "strukturell" davor, Pattern greift wieder nicht. Zwei unabhängige
  Belege am selben Tag — kein Einzelfall mehr.
- **HVP-Richtungsfehler erneut aufgetreten** (bei NUE, HVP 95% fälschlich
  als "Volatilitäts-Kompressionsrisiko" bezeichnet) — trotz expliziter
  Prompt-Regel seit 29.08. Wird vom Compliance-Scanner korrekt
  geflaggt (bestätigt erneut: Wortverbote allein reichen nicht
  zuverlässig, wie schon am 29.08. für CSP/Wheel festgestellt).

---

## 6. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Commit |
|---|---|---|
| `ko-aggregator/workers/ko-ai.js` | 1.15 | committed, deployed |
| `ko-modules/ko-prompts.js` | 2.16.0 | committed, deployed (CDN-Pin aktualisiert) |
| `axel-scanner/index.html` | v486 | committed, deployed |
| `ko-aggregator/market_aggregator.py` | 5.39.0 | committed, deployed, Lauf erfolgreich verifiziert |
| `UIQ-Suite/SUITE.md` | — | *heute nicht angefasst, Nachzug nötig s. Plan* |

---

## 7. Plan für morgen

**Priorität 1 — Compliance-Scanner-Regex-Lücke schließen (klein,
~5min, zwei unabhängige Live-Belege heute).** `COMPLIANCE_PATTERNS` in
`ko-ai.js`: `strukturell\s+(unnötig|nicht\s+erforderlich)` verlangt
zwingend "strukturell" davor. Fix: Pattern lockern auf
`\b(unnötig|nicht\s+erforderlich)\b` ohne Pflicht-Präfix, oder
zusätzliches Pattern ohne "strukturell" ergänzen.

**Priorität 2 — VIX/VVIX/SKEW Rest-Scope (s. §4.3).** VVIX/SKEW
bekommen keine Kanonisierung wie VIX — prüfen, ob/wie eine äquivalente
Absicherung ohne eigene Live-Einzelwert-Quelle möglich ist. Client/
Server-Aufspaltung (`#m-vix` + ~40 UI-Stellen) bleibt der größere,
separate Architektur-Punkt.

**Priorität 3 — Collar `risikoBegriff`/`risikenText`** analog zum
CC-Fund vom 29.08. — Put- und Call-Seite der Absicherung begrifflich
sauber trennen, nicht "Andienung" verwenden.

**Priorität 4 — Ursprüngliche Priorität 1 von gestern zu Ende bringen:**
csp_wheel/atmna/weekly_income/cc noch nicht gegen den aktuellen Stand
(v2.16.0) live getestet — nur Collar durchlief die beiden heutigen
Test-Zyklen. Strukturell unverändert laut isolierter Prüfung, aber noch
nicht mit echtem Modell-Output verifiziert.

**Priorität 5 — CC-Wheel-Kontext-Flag** (s. §2) — Buy-to-Open-für-CC als
Wheel-Fortsetzung markieren, noch nicht implementiert.

**Priorität 6 — EIC-Schritt-7 "Handlungsempfehlung"** (s. §2) — bislang
nur entschieden, nicht gebaut. Bezug zur `mode`-Achse: `holding_review`
und `structure_selection` müssten dort ebenfalls berücksichtigt werden.

**Weiterhin unverändert aus dem 29.08.-Übergabeprotokoll offen (heute
nicht bearbeitet, nicht vergessen):** die ~38 verbleibenden
Strategie-Ampel-Texte in `ko-market-state.js` (Grundsatzfrage GESPERRT/
NICHT EMPFOHLEN/PRIORITÄT-N), Deep-Dive-Live-Test (höchstes Risiko im
System laut Belastungstest), Master-Shortlist-Python-Äquivalent zum
Compliance-Scanner.

**Laufend:** `/logs?flagged=1` weiter beobachten, jetzt auch mit Blick
auf die Timing-Instrumentierung — nächster "langsamer" MB-Lauf bitte
mit `durationMs`-Wert festhalten, sonst bleibt §3 ungeklärt.

**Danach:** Legal Briefing an den Fachanwalt vorbereiten (Backlog №36) —
weiterhin aufgeschoben, bis die Options-Strategien einheitlich stabil
sind (jetzt näher, aber Priorität 4 oben noch offen).



## Anhang: Priorisierte offene Punkte aus der Session vom 30.08.2026

**Priorität 1 — Compliance-Scanner-Regex-Lücke (klein, ~5min):**
`COMPLIANCE_PATTERNS` in `ko-ai.js` erkennt `strukturell\s+(unnötig|nicht\s+erforderlich)` — verlangt zwingend "strukturell" davor. Zwei belegte Live-Funde ohne "strukturell" liefen durch: "klassifiziert Collar-Setups als 'nicht nötig'" (Collar-Test 1) und "als Regime-Signal nicht erforderlich bewertet" (Collar-Test 2). Fix: Pattern lockern auf `\b(unnötig|nicht\s+erforderlich)\b` ohne Pflicht-Präfix, oder zusätzliches Pattern ohne "strukturell" ergänzen.

**Priorität 2 — VIX/VVIX/SKEW Single-Source-of-Truth, Rest-Scope:**
Heute behoben (v5.39.0): VIX3M-Intersection-Kopplung entkoppelt (VIX/VVIX/SKEW nicht mehr von VIX3M-Verfuegbarkeit abhaengig); VIX `current` kanonisiert gegen `vix_term.vix` (Live-Fetch), inkl. Log-Warnung bei Abweichung >10%. NICHT behoben:
  - VVIX/SKEW haben keine aequivalente Kanonisierung — kein unabhaengiger Live-Einzelwert-Fetch fuer diese beiden vorhanden, daher kein Sicherheitsnetz wie bei VIX. Bei einem eigenstaendigen (nicht VIX3M-bedingten) Teil-Download von VVIX oder SKEW koennte sich dieselbe Fehlerklasse wiederholen, ungeschuetzt.
  - Client/Server-Aufspaltung (`#m-vix` + ~40 abhaengige UI-Stellen vs. `vixTerm.vix`/`zscores.vix` im KV) weiterhin unangetastet — eigener, groesserer Architektur-Punkt (Axel: baldmoeglich nach heutigem Abschluss).
  - Nur unter Normalbedingungen verifiziert (ein Live-Lauf) — kein Stresstest fuer einen eigenstaendigen VVIX/SKEW-Teildownload.

**Priorität 3 — Collar `risikoBegriff` (aus Live-Test 1):**
Collar nutzt den generischen Fallback "Andienung" (`o.risikoBegriff || 'Andienung'`) — begrifflich unpassend fuer eine Struktur mit Put- UND Call-Seite (analog zum bereits geloesten CC-Fund vom 29.08.). Braucht einen eigenen `risikoBegriff`/`risikenText` fuer Collar, der beide Richtungen benennt.

**Priorität 4 — HVP-Richtungsfehler weiterhin nicht 100% zuverlaessig unterbunden:**
Live-Test 2 zeigte erneut "Volatilitäts-Kompressionsrisiko" bei HVP 95% (hohe, nicht komprimierte Vol) — trotz expliziter Prompt-Regel seit 29.08. Wird vom Compliance-Scanner korrekt geflaggt (Logging), bestaetigt aber erneut: Prompt-Regeln allein reichen nicht zuverlaessig.

**Bereits heute abgeschlossen, zur Vollstaendigkeit:**
- `ko-ai.js` v1.15 (Timing-Diagnose) deployed — Root Cause der gemeldeten MB-Verlangsamung (~10min statt <3min) NICHT gefunden, kein "langsamer" Vergleichswert erhalten.
- `ko-prompts.js` v2.15.0 -> v2.16.0: `mode`-Achse (scan/holding_review/structure_selection) + AUFGABE-Struktur fuer Collar/holding_review + VERSION-Drift-Fix (2.5.7 -> aktuell).
- `index.html` v486: VIX-Zeilen-Dedupe im Prompt (durch Priorität 2 z.T. redundant geworden, schadet nicht).
- `market_aggregator.py` v5.39.0: s. Priorität 2.
