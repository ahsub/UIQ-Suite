# UIQ Suite — Coding Rules & Session Protocol

**Version:** 1.1  
**Stand:** 08.08.2026  
**Ablage:** `ahsub/UIQ-Suite/docs/CODING-RULES.md`  
**Geltung:** Verbindlich für alle Entwicklungsarbeiten in UIQ Suite.  
**Ergänzt:** SUITE.md §2 (Grundgesetze) + LEITBILD.md (Produkt-Identität)

---

## 1. Der wichtigste Grundsatz

> **Erst verstehen, dann anfassen.**

Kein Code wird geändert ohne bewiesene Root Cause.  
Kein Feature wird gebaut ohne klaren Entscheidungs-Pfad-Bezug (LEITBILD.md §3).  
Kein Deploy ohne Verifikation.

---

## 2. Architektur-Regeln

### 2.1 ES6-Zielarchitektur (verbindlich)
- Neuer Code ausschließlich `const`/`let`, Arrow Functions, keine `var` außer in Legacy-Blöcken
- Keine Inline-Event-Handler (`onclick=` im HTML verboten für neuen Code)
- Zentrale String-Objekte statt Inline-Strings
- JSDoc-Kommentare für alle exportierten Funktionen

### 2.2 UIQ-spezifische Konventionen

**KV-Adapter (index.html):**
- Es gibt **immer zwei** KV-Adapter-Instanzen im Code (Standard-Scanner + Alpha-Desk)
- Beide müssen bei jedem neuen Feld gepatcht werden — nie nur eine
- Mapping-Muster: `feldName: r.feldName != null ? r.feldName : null`
- Neue Felder immer mit Kommentar und Datum

**DOM-Elemente für DeepDive-Blöcke:**
- DOM-Element **vor** dem JavaScript-Block definieren (Reihenfolge: `dd-pattern-entry` → `dd-rs-rank` → `dd-avwap` → `dd-ob` → `dd-tva`)
- ID-Konvention: `dd-{feature}` (Kleinbuchstaben, Bindestrich)
- Initiale Sichtbarkeit: `display:none` — JS setzt auf `block` wenn Daten vorhanden

**Aggregator-Funktionen:**
- Eine Funktion = eine Verantwortung (Detection, Scoring, Output streng getrennt)
- Jede neue `compute_*()`-Funktion: try/except mit `log.debug(...)`, immer Null-Dict als Fallback
- ETF/Krypto-Filter explizit dokumentieren wenn eine Funktion nur für Einzel-Aktien gilt
- Neue Felder in `_write_market_snapshot()` als `pick(r, "feldName")` + Kommentar

### 2.3 Versionierung
- **Aggregator:** `AGGREGATOR_VERSION` in `market_aggregator.py` bei jedem Feature-Commit bumpen
- **Frontend:** `<meta name="version" content="YYYYMMDD-v{N}">` + Changelog-Eintrag v{N} vor v{N-1}
- **Changelog-Format:** `v{N}: Kurzbeschreibung (Datum): Details. GHA Run #{N} wenn relevant.`
- **Commit-Messages:** `feat/fix/chore/docs(scope): Beschreibung vX.Y.Z` — scope = aggregator/frontend/docs


### 2.4 Externe Signal-Ideen (Pine Script, Paper, Drittcode)

**Gewichte niemals übernehmen:**
Punktgewichte aus externen Quellen (Pine Scripts, Papers, fremde
Scoring-Systeme) sind per Definition unvalidiert. Signal-Idee und
Implementierungsgewicht sind strikt zu trennen:
- Signal-Logik (Regel, Bedingung): kann als Kandidat ins Backlog
- Gewicht/Score-Beitrag: erst nach Backtest via `backtest_2007_2026.py`
  in den `compositeScore` integrieren — nie direkt übernehmen.

**Scores immer server-seitig:**
Jede Scoring-Berechnung, die in den `compositeScore` einfließt, läuft
ausschließlich im Aggregator (Python/GHA). Kein Score-Gewicht darf im
Frontend sichtbar oder rekonstruierbar sein (IP-Schutz, v454).

### 2.5 Ratio-Konvention (verbindlich)

Jede Variable, die ein VIX-Term-Verhältnis trägt, **muss** die Richtung
im Namen kodieren:
- `ratio_vix_vix3m` = VIX / VIX3M (steigt bei Stress)
- `ratio_3m_spot` = VIX3M / VIX (fällt bei Stress — Backwardation-Proxy)

Generische Namen wie `ratio` oder `vix_ratio` sind **verboten**.
Bei jedem neuen Consumer einer Ratio-Variable: Richtung explizit
im Kommentar bestätigen (`# ratio_vix_vix3m: >1 = Stress`).

### 2.6 Regime-Klassifikator-Singularität

Es darf **genau einen** autoritativen Regime-Klassifikator geben:
den Server-MSE im Aggregator. Neue Regime-Logik im Frontend oder in
separaten Modulen ist verboten, solange sie dieselben Label-Namen
verwendet (BULL_QUIET, STRESS_UNSTABLE usw.). Anzeige-/Hilfslogik
darf Regime-Werte *darstellen*, aber nicht *berechnen*.
Zuwiderhandlungen erzeugen das "Dual/Triple Truth"-Problem (SWOT W3).

### 2.7 Track-Record-Integrität

**Regeländerungen versionieren:**
Jede Änderung an Scoring-Gewichten, Regime-Schwellen oder
Klassifikationslogik erhält einen expliziten Versions-Timestamp im
Aggregator-Changelog *und* einen Eintrag im Track-Record-Log
(`tr:meta`-Key in KV): `{"version": "v5.x", "changed": "...", "from": "YYYY-MM-DD"}`.
Ohne diesen Eintrag ist der Track-Record für den betroffenen Zeitraum
nicht interpretierbar.

**Universum-Archiv:**
Die monatlich aktualisierten IWV-Holdings-CSVs müssen point-in-time
referenzierbar bleiben. `ex_iwv_tickers.csv` + Monats-CSVs in
Git-History reichen nur, wenn der Backtest-Code explizit das
historisch gültige Universum je Datum lädt (Survivorship-Fix T3c).

---

## 3. Patch-Protokoll (Pflicht vor jedem Push)

### 3.1 Vor dem Patch
1. **Aktuelle Datei laden** — nie aus dem Gedächtnis arbeiten, immer frisch von GitHub
2. **Zielpunkt exakt identifizieren** — `grep -n` oder `python3 -c "content.find(...)"` 
3. **Kontext lesen** — 10-20 Zeilen vor/nach dem Zielpunkt verstehen

### 3.2 Während des Patchens
4. **String-Matches verifizieren** — `content.count(old)` muss exakt 1 ergeben (nie 0, nie >1)
5. **Python für komplexe Patches** — bei gequoteten Strings in JS/HTML immer Python-Script statt str_replace
6. **Klammer-Balance prüfen** bei JS-Funktionen — neue Blöcke müssen **innerhalb** der Funktion sein

### 3.3 Nach dem Patch (Pflicht vor Push)
7. **Syntax-Check:** `python3 -c "import ast; ast.parse(open('file.py').read()); print('OK')"` für Python
8. **Verifikations-Check:** Alle eingefügten Strings per `content.count(needle)` bestätigen
9. **Bekannte Fehlerquellen prüfen** (siehe §6)
10. **Erst dann pushen**

---

## 4. Session-Protokoll

### 4.1 Session-Start
- **PAT** wird vom Nutzer übergeben — nie im Code speichern, nach Session revozieren
- **Aktuellen Stand laden:** SHA von `main` holen, Datei frisch downloaden
- **Handover lesen** wenn vorhanden (`docs/UEBERGABE-YYYY-MM-DD.md`)
- **Verification-Reminder:** "hast du das verifiziert oder übernommen?"

### 4.2 Während der Session
- **Brainstorm/Collect-Modus zuerst** — Konzept vor Code, nie direkt ins Tippen
- **Deployment-Schwelle:** Einzelne Bugfixes sofort; Features erst wenn Batch ≥3 Änderungen
- **Exception:** Kritische Bugs (Syntax-Error, App lädt nicht) → sofort fixen
- **Warnpflicht:** Claude warnt aktiv wenn Arbeit vom Lead-Projekt (UIQ Phase 0) abweicht

### 4.3 Session-Ende
- **Handover committen** nach `ahsub/UIQ-Suite/docs/UEBERGABE-YYYY-MM-DD.md`
- **SUITE.md Fortschreibungshistorie** aktualisieren
- **PAT revozieren** — immer: https://github.com/settings/tokens
- **Offene Punkte** explizit in Handover dokumentieren

---

## 5. GHA & Deployment

### 5.1 GitHub Actions
- Nightly Cron: ~03:37 UTC täglich
- Manueller Trigger via `workflow_dispatch` (API) wenn sofortige Verifikation nötig
- Nach jedem Aggregator-Feature: manuell triggern und Snapshot inspizieren
- Snapshot-Inspektion: `data/snapshots/YYYY-MM-DD_HH.json.gz` in GitHub Contents API

### 5.2 Cloudflare Pages
- Deploy: automatisch bei Push auf `main` (axel-scanner)
- Cache: Browser-Cache kann alt sein → Hard Refresh (`Ctrl+Shift+R`) oder Inkognito
- Wenn Deployment-Status unklar: Cloudflare Dashboard prüfen, nicht assume

### 5.3 Verifikation nach Deploy
- Snapshot: neue Felder mit Stichprobe (5-10 bekannte Ticker) prüfen
- Coverage: `len([t for t in tickers if t.get('neuesFeld') is not None])` sollte ≥ 90% sein
- Plausibilität: Werte mit bekanntem Marktbild vergleichen

---

## 6. Bekannte Fehlerquellen (Lernfälle)

### F1: Doppelte Anführungszeichen in JS-Strings (02.08.2026)
**Problem:** OB-Badge-Patch erzeugte `onclick="...""+` statt `onclick="..."'+`  
**Ursache:** Python-String mit `"` in JS-String — Escape-Kollision  
**Fix:** Immer Python-Script für JS-Patches mit `'` und `"` gemischt  
**Regel:** Bei JS-Patches mit String-Literalen: Python-File schreiben, nicht inline

### F2: Funktion vorzeitig schließen (02.08.2026)
**Problem:** RS/AVWAP/OB-Blöcke wurden *nach* dem `}` von `renderDeepDiveTech()` eingefügt  
**Ursache:** Patch-Ziel war das Ende des Pattern-Entry-Blocks, aber die Funktion schloss dort bereits  
**Symptom:** `Uncaught SyntaxError: Unexpected token '}'` in Konsole  
**Fix:** Immer Klammer-Balance zählen wenn neue Blöcke in Funktionen eingefügt werden  
**Regel:** `grep -n "function renderDeepDive"` → Funktion vollständig lesen bevor gepacht wird

### F3: Nur eine KV-Adapter-Instanz gepatcht (mehrfach)
**Problem:** Neue Felder erscheinen im Scanner aber nicht im Alpha-Desk (oder umgekehrt)  
**Ursache:** Es gibt zwei `sectors: Array.isArray(r.sectors)...` Blöcke im Code  
**Fix:** Immer nach dem ersten Patch `content.count(new_field)` prüfen — muss 2 sein  
**Regel:** Nach jedem KV-Adapter-Patch: `assert content.count('feldName: r.feldName') == 2`

### F4: Cloudflare-Cache täuscht (02.08.2026)
**Problem:** Bugfix war deployed, Browser zeigte noch alte Fehler  
**Ursache:** Browser-Cache + Cloudflare-Cache hatten alte Version  
**Fix:** Hard Refresh, dann Deployment-ID im CF-Dashboard prüfen  
**Regel:** Bei anhaltenden Fehlern nach Deploy: zuerst Cache prüfen, dann Code

### F5: Walrus-Operator Python-Syntax (Achtung)
**Verwendung:** `**(_tva if (_tva := compute_tva_indicators(...)) else {...})`  
**Nur ab Python 3.8** — GHA-Runner nutzt Python 3.10+, kein Problem  
**Niemals** in Code der Python 3.7 unterstützen muss

---

## 7. Feature-Bau-Checkliste

Vor jedem neuen Feature folgende Punkte abhaken:

```
[ ] LEITBILD-Check: Welcher Schritt des Entscheidungs-Pfads wird gestärkt?
[ ] 80/20-Check: ≥80% Nutzerwert bei ≤20% Aufwand?
[ ] Datenquelle: Verfügbar in yfinance/KV ohne neuen API-Call?
[ ] ETF-Filter: Nur für Einzel-Aktien? → _is_etf_or_crypto prüfen
[ ] Aggregator: compute_*() mit try/except + Null-Dict-Fallback
[ ] KV-Schema: Neue Felder in _write_market_snapshot() + pick()
[ ] process_ticker(): Platzhalter-Felder oder direkte Berechnung?
[ ] Frontend DOM: dd-{feature} Element an richtiger Position
[ ] KV-Adapter: BEIDE Instanzen gepatcht (count == 2)
[ ] DeepDive-Block: Innerhalb renderDeepDiveTech() — Klammer-Balance OK
[ ] KI-Prompt: generateDeepDiveKI() erweitert
[ ] Syntax-Check: ast.parse() für Python, Browser-Konsole für JS
[ ] GHA-Trigger: Manuell triggern + Snapshot inspizieren
[ ] Version: AGGREGATOR_VERSION + meta version + Changelog
[ ] Handover: UEBERGABE-*.md aktualisiert
[ ] Gewicht-Quelle: Eigene Backtest-Validierung (backtest_2007_2026.py)?
    Fremde Gewichte → erst validieren, nie direkt übernehmen. (§2.4)
[ ] Score-Berechnung: Läuft server-seitig im Aggregator? Kein Client-Recalc. (§2.4)
[ ] Ratio-Variablen: Richtungs-kodierter Name verwendet? (§2.5)
[ ] Regime-Logik: Kein neuer paralleler Klassifikator eingebaut? (§2.6)
[ ] Regeländerung: tr:meta-Key + Changelog-Eintrag gesetzt? (§2.7)
[ ] Test-Abdeckung: Neue Scoring-Funktion hat Unit-Tests in test_*.py? (W1/SWOT)
[ ] DSS-Filtertest: Feature besteht LEITBILD §3 auch bei eigenem Vorschlag? (T5/SWOT)
```

---

## 8. Backlog-Konventionen

Backlog-Einträge in SUITE.md §4 folgen diesem Format:
```
N. **Feature-Name** *(Datum, Quelle)* — Beschreibung.
   Details, Teilschritte, Abhängigkeiten.
   **Nicht bauen vor:** Bedingung wenn relevant.
```

Prioritäten-Hierarchie (unveränderlich):
1. **Kritische Bugs** (App lädt nicht, Datenverlust)
2. **UIQ Phase 0** (Lead-Projekt, absolute Priorität)
3. **Refundex Maintenance**
4. **Premium Options** (geparkt)
5. **DepotIQ/Ruhestand** (eingefroren)

---

## 9. Offene Backlog-Items (Stand 05.08.2026)

| # | Was | Prio | Bedingung |
|---|---|---|---|
| ~~**#26**~~ | ~~TVA Sprint A Rest: `f_sellProbability`~~ | — | ✅ ERLEDIGT v5.25.0 (03.08.2026) |
| **#27** | Mindest-Volumen-Filter für AVWAP + OB-Detector (illiquide Titel wie AIVAF) | Niedrig | Bei Gelegenheit |
| ~~**#28**~~ | ~~Journal-Modul v1~~ | — | ➡️ Umgewidmet → Refundex (05.08.2026, DSS §0) |
| **#29** | Portfolio Health Score | Mittel | Nach Journal (Refundex) |
| **#30** | Szenario-Simulation (-15% Nasdaq → Optionsportfolio) | Mittel | Nach Portfolio |

---

*UIQ Suite Coding Rules v1.1 · 08.08.2026 · §2.4–2.7 aus SWOT-Fable-Review ergänzt*
