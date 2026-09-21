UIQ — Übergabeprotokoll 21.09.2026 (final, ersetzt die Vormittagsversion)

## Pflicht-Header

Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:

1. Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten. Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen. Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.
2. Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad: Prüfe die Verbindung, nicht nur die Existenz. "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert. "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet. Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor du sagst "das funktioniert".
3. Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft. Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt "erledigt". Der Unterschied ist der ganze Punkt.
4. Skepsis ist keine Unhöflichkeit gegenüber der Vorsession. Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.
5. Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle Plausibilitäts-Antwort. Nicht raten, woran es liegen könnte — nachsehen, woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt ist, gilt sie als gefunden.

Kurzform, die für den Rest der Session gilt: Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.

---

## Teil 1 — LLM-Auswahl-Drift-Fix (vormittags, Details bereits im ersten Protokoll-Entwurf von heute)

ATM/NA zeigte einen zweifach reproduzierten Bug: das Modell ersetzte einen der drei deterministisch vorgegebenen Kandidaten (MRK) durch einen anderen (CSCO) in Abschnitt 3 — mit aktiver Begründung, warum der Original-Kandidat "die Kriterien nicht erfüllt". Root Cause zweifelsfrei bewiesen (Diagnose-Logging `[ATMNA-CANDIDATES]`/`[ATMNA-FACTORS]`): Datenfluss korrekt, reine Modell-Neuinterpretation.

**Fix, live verifiziert (`REPAIR-SUCCESS` im echten `/logs`-Eintrag bestätigt):**
- `ko-modules/ko-prompts.js` v2.53.30 (`aa8521c`) — verbindliche Top-3-Kandidatenliste im deterministischen Faktor-Block, Abschnitt-3-Instruktion verbietet Ticker-Ersatz, `validateBriefingCompliance()` um Top-3-Konsistenzcheck erweitert
- `axel-scanner/workers/ko-ai.js` v1.26 (`ec1cc79`) — Extraktion aus `payload`, Repair-Hinweis mit konkreter Ersetzungsanweisung
- `UIQ-Suite/scripts/generate_public_recommendations.js` v1.10 (`2c037f6`) — gleiche Logik im Batch-Pfad
- Nebenbefund behoben: fehlerhaft mit hochgeladene `scripts/vendor/generate_public_recommendations.js` gelöscht

**Bewusst dokumentierte, nicht umgesetzte Folge-Tickets (Reviewer-Konsens):**
- Candidate Selection Integrity — Equity/KO Audit (Beobachtungsmodus, kein Live-Beleg für Equity)
- Model-Refusal Detection im REPAIR-Loop (nur künstlicher Testfund, kein Produktionsfall)
- Repair Data Provenance Guard (architektonisch wichtigster der drei, aber nur Prinzip dokumentiert: "Repair darf keine fehlenden Daten erzeugen")

---

## Teil 2 — Backlog-Bereinigung (nachmittags)

Vollständige 26-Punkte-Backlog-Analyse aus den letzten ~8 Wochen Session-Notizen erstellt, mit Reviewer-Priorisierung in P0–P3 + Statusklassen (Bug/technische Schuld/Produktentscheidung/Research/externe Abhängigkeit). **Separates Dokument:** `UIQ-BACKLOG-2026-09-21.md` (heute Vormittag erstellt) — dort steht die vollständige Liste mit Begründungen; dieses Protokoll enthält nur den **Status-Nachtrag** für die Punkte, die heute Nachmittag tatsächlich bearbeitet wurden.

### Heute abgeschlossen und live verifiziert

**#7 — `/logs`-Route-Paginierung** (`ko-ai.js` v1.27, Commit `56457df`)
Root Cause: `AUTH_KV.list()` sortiert lexikographisch, nicht chronologisch — bei mehreren `tokenHash`-Präfixen und überschrittenem `limit` wurden systematisch veraltete Daten geliefert (live bestätigt: `limit=300` zeigte tagelang denselben 269-Eintrage-Stand vom 01.09., obwohl neue Daten unter einem anderen Hash existierten). Fix: zweistufig — erst alle Key-Namen einsammeln, Zeitstempel aus dem Namen selbst extrahieren, sortieren, dann erst `get()`. **Live verifiziert:** `limit=300`-Abfrage zeigt jetzt korrekt bis zum aktuellen Zeitpunkt durchgehend chronologische Daten, `listTruncated: false`.

**#1 — API-Kosten kalibriert** (`ko-ai.js` v1.28 + `generate_public_recommendations.js` v1.11, Commits `289db15`/`d56b078`)
Preise verifiziert gegen `docs.claude.com/en/docs/about-claude/pricing` (Haiku 4.5: $1/$5 pro MTok; Sonnet 4.6: $3/$15 pro MTok). `ko-ai.js` bekam eine **modellabhängige** `MODEL_PRICING`-Lookup-Tabelle (wichtiger Fund: ein einziges globales Preispaar wäre falsch gewesen, da Haiku und Sonnet dort gemischt genutzt werden — `generate_public_recommendations.js` nutzt dagegen nur ein Modell, dort genügt ein globales Preispaar). **Live verifiziert:** exakte Übereinstimmung zwischen manueller Berechnung und tatsächlich persistiertem `estimatedCostUsd`-Wert ($0,001871 für einen Testaufruf).

**Zentrale Erkenntnis aus der Auswertung:** Der nächtliche Public-Digest-Lauf (~$2,26/Nacht, ~$68/Monat hochgerechnet) ist der **dominierende Kostentreiber** — deutlich mehr als der komplette Live-Pfad über 6 Tage (~$0,67).

**#21 — Compliance-Scanner-Negationslogik** (`ko-ai.js` v1.29, Commit `eae1a90`)
"Top-Kandidat" wurde auch bei verneinenden Sätzen fälschlich geflaggt. Fix bewusst klein gehalten (keine NLP-Lösung): klausel-lokale Negationsprüfung nur für dieses eine Pattern (`negationAware`-Flag), alle anderen ~30 Patterns unverändert. **Live verifiziert:** "kein Top-Kandidat" → kein Flag, "ist Top-Kandidat" → Flag korrekt gesetzt, inkl. dem kniffligen Edge Case "Nicht X, sondern Y ist Top-Kandidat" (muss Treffer bleiben) — 11/11 lokale Tests plus 2/2 Live-Tests bestanden.

### Heute geprüft, Status korrigiert (ohne Code-Änderung)

- **#25 Scanner-Tab/Alpha-Desk Score-Feld-Mismatch** → bestätigt bereits erledigt (Code-Beleg: `STRAT_SCORE_FIELD`-Mapping in `index.html`)
- **#26 Dividend/Value im Scanner-Dropdown** → bestätigt bereits erledigt (Code-Beleg: beide im Dropdown)
- **#24 Freshness-Check Vormittag/Nachmittag** → bestätigt gegenstandslos durch die 11.09.-Umstellung auf einen Tageslauf
- **#2 API-Key-Exponierung** → deutlich entschärft als ursprünglich angenommen: Finnhub/TwelveData sind bereits Per-Nutzer-Keys (BYOK, `localStorage`), keine geteilten Secrets; `loadSektorRS()` nutzt bereits KV-Cache-First. Umbenannt zu reiner Produktentscheidung ("BYOK-UX für Public Beta"), kein Sicherheitsfund mehr.
- **#17 STYLE/SETUP/VEHICLE-Ontologie** → nicht verifizierbar mit verfügbarem Zugriff (keine Code-Spuren, vermutlich reine `SUITE.md`-Dokumentationsentscheidung)

### Neu entstanden

**#27 — Anthropic Batch API: Public-Digest A/B-Test** (Status: Research/Optimization, nicht Bugfix)
Batch API bietet 50% Rabatt auf Input+Output, passt strukturell gut zum ohnehin nächtlichen, asynchronen Digest-Lauf. Rechnerisch ~$34/Monat Ersparnis allein durch den Transportweg-Wechsel, ohne Prompt-/Guardrail-Änderung. **Drei-Stufen-Plan (Reviewer-Konsens, noch nicht begonnen):**
1. Synchroner Pfad bleibt unangetastet als Referenz
2. Batch-Modus danebenbauen: 15 Prompts → Anthropic Message Batch → Polling bis `ended` → JSONL-Ergebnisse → `custom_id`→Strategie-Zuordnung → bestehende Post-Processing-/KV-Logik unverändert
3. Echter A/B-Vergleich (Erfolgsrate, Compliance/Candidate-Validatoren, Repair-Rate, Tokenverbrauch, echte Kosten, Laufzeit, KV-Ergebnis-Äquivalenz) — erst danach Umstellung auf Batch als Standard

**Bewusst nicht gleichzeitig:** Prompt Caching als zweiter Kostenhebel — separat nacheinander testen (erst Batch, messen, dann Caching, messen), damit die Wirkung beider Mechanismen sauber trennbar bleibt.

`recordAiBudgetEntry()`/`recordBudgetEntry()` sollen für den Batch-Modus um Metadaten (`apiMode`, `batchId`, `customId`) **erweitert**, nicht ersetzt werden — damit synchroner und Batch-Pfad im selben Dashboard vergleichbar bleiben.

---

## Versionsstand am Ende des Tages

**Hinweis (Pflicht-Header Punkt 1): Diese Tabelle ist eine Behauptung dieser Session.**

| Datei | Version | Letzter Commit |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.53.30 | `aa8521c` |
| `UIQ-Suite/scripts/vendor/ko-prompts.js` | 2.53.30 (synchronisiert) | `2c037f6` |
| `UIQ-Suite/scripts/generate_public_recommendations.js` | v1.11 | `d56b078` |
| `axel-scanner/workers/ko-ai.js` | **v1.29** | `eae1a90` |
| `axel-scanner/index.html` | — | `7fbc11e` (unverändert seit gestern) |

## Deploy-Status
- `ko-ai.js` v1.29: **deployt und live verifiziert** (mehrfach, zuletzt #21-Negationstest)
- `generate_public_recommendations.js` v1.11: **committet**, Preiskalibrierung noch **nicht** durch einen echten GHA-Lauf mit realen Kosten bestätigt — nächster Lauf sollte `estimated_cost_usd` mit echtem Wert statt `null` zeigen
- `index.html`: unverändert seit gestern, kein heutiger Änderungsbedarf

---

## RUNMAP FÜR MORGEN

**Reihenfolge, wie besprochen — nichts davon ist heute begonnen, alles offen:**

### 1. `generate_public_recommendations.js` v1.11 — GHA-Lauf-Verifikation
Kurzer Check: liefert der nächste nächtliche Lauf tatsächlich einen echten `estimated_cost_usd`-Wert in `internal/ai_budget/{date}`? (Reine Bestätigung, kein Code-Änderungsbedarf erwartet.)

### 2. #27 — Anthropic Batch API, Stufe 1+2 (Batch-Modus bauen)
- Neue Funktion(en) in `generate_public_recommendations.js`: Batch-Request-Array aus den 15 Strategie-Prompts bauen, `custom_id` pro Strategie (z. B. `public_{strategy}`), Batch erstellen, Polling-Logik bis `ended`, `results_url` abrufen und JSONL parsen, Ergebnisse per `custom_id` zurück auf Strategien mappen
- **Synchroner Pfad bleibt unangetastet** — Batch-Modus als eigener, parallel existierender Codepfad (z. B. über eine Umgebungsvariable wie `USE_BATCH_API=true` umschaltbar), nicht als Ersatz
- `recordBudgetEntry()` um `apiMode`/`batchId`/`customId` erweitern (rückwärtskompatibel, bestehende Felder unverändert)

### 3. #27 — Stufe 3 (A/B-Test)
- Einen Nachtlauf synchron, einen Nachtlauf Batch — Vergleich anhand der von Axel festgelegten Kriterien (Erfolgsrate, Compliance-/Candidate-Validatoren, Repair-Rate, Tokenverbrauch, echte Kosten, Laufzeit, KV-Ergebnis-Äquivalenz)
- Erst nach sauberem Vergleich: Entscheidung, ob Batch zum Standard wird

### 4. Falls Zeit bleibt — die bewusst zurückgestellten Punkte im Blick behalten (kein aktiver Auftrag, nur nicht vergessen)
- Candidate Selection Integrity — Equity/KO Audit (Diagnose-Logging für eine Equity-Strategie, dann beobachten)
- Prompt Caching als zweiter Kostenhebel (erst NACH dem Batch-A/B-Test, nicht gleichzeitig)
- `UIQ-BACKLOG-2026-09-21.md` enthält weitere P1/P2-Punkte, falls #27 schneller als erwartet durch ist

### Nicht vergessen beim Sessionstart morgen
- Dieses Protokoll UND `UIQ-BACKLOG-2026-09-21.md` zuerst lesen, aber gemäß Pflicht-Header als ungeprüfte Behauptungen behandeln, nicht als bestätigten Zustand
- Bei Bedarf den aktuellen Deploy-/Commit-Stand der vier Hauptdateien kurz gegenchecken, bevor auf dieser Basis weitergearbeitet wird
