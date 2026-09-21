UIQ — Backlog & Prioritätenliste (Stand 21.09.2026, Ende Arbeitstag)

## Hinweis zur Methodik

Diese Liste basiert auf gespeicherten Session-Notizen der letzten ca. 8 Wochen, ergänzt um den tatsächlichen Verifikations-/Bearbeitungsstand vom heutigen Nachmittag. Punkte ohne ✅-Markierung sind weiterhin unverifizierte Behauptungen aus älteren Notizen — vor Planung damit gegen den aktuellen Repo-Stand gegenchecken.

---

## Heute abgeschlossen und live verifiziert (nicht nur behauptet)

- ✅ **#1 API-Kosten-Reduktion** — Preise kalibriert (Haiku 4.5: $1/$5 pro MTok, Sonnet 4.6: $3/$15 pro MTok, verifiziert gegen docs.claude.com). `ko-ai.js` v1.28 bekam eine modellabhängige `MODEL_PRICING`-Lookup-Tabelle (Fund: ein globales Preispaar wäre falsch gewesen, da Haiku/Sonnet dort gemischt genutzt werden). `generate_public_recommendations.js` v1.11 kalibriert (nutzt nur ein Modell). Live verifiziert: exakte $-Übereinstimmung zwischen Formel und persistiertem Wert. **Zentraler Fund: Public Digest (~$68/Monat) ist der dominierende Kostentreiber, nicht der Live-Pfad (~$0,67/6 Tage).**
- ✅ **#7 `/logs`-Route-Paginierung** — Root Cause bewiesen (KV `list()` sortiert lexikographisch, nicht chronologisch; bei mehreren `tokenHash`-Präfixen lieferte die Route bei überschrittenem `limit` systematisch veraltete Daten). `ko-ai.js` v1.27, zweistufiger Fix (Key-Namen sammeln → Zeitstempel aus Namen extrahieren → sortieren → erst dann `get()`). Live verifiziert.
- ✅ **#10 Compliance-Scanner-Fehlalarm bei Verneinungen ("Top-Kandidat")** — `ko-ai.js` v1.29, klausel-lokale Negationsprüfung nur für dieses eine Pattern (`negationAware`-Flag), alle anderen Patterns unverändert. 11/11 lokale Tests + 2/2 Live-Tests bestanden, inkl. Edge Case "Nicht X, sondern Y ist Top-Kandidat".

## Heute geprüft und Status korrigiert (kein Code-Fix nötig)

- ✅ **Scanner-Tab vs. Alpha-Desk Score-Feld-Mismatch** (war nicht mehr in dieser Liste, aber zur Vollständigkeit) — bereits erledigt, `STRAT_SCORE_FIELD`-Mapping live bestätigt inkl. Dividend/Value.
- ✅ **Dividend/Value im Scanner-Dropdown** — bereits erledigt, beide im Dropdown vorhanden.
- ✅ **Freshness-Check Vormittag/Nachmittag-Lücke** — gegenstandslos durch die 11.09.-Umstellung auf einen Tageslauf.
- 🔄 **#2 Client-seitige API-Key-Exponierung** — **umbenannt und entschärft.** Code-Prüfung zeigt: Finnhub/TwelveData sind bereits Per-Nutzer-Keys (BYOK via `localStorage`), keine geteilten Secrets. `loadSektorRS()` nutzt bereits KV-Cache-First, Live-Fetch nur als Fallback. Kein akuter Sicherheitsfund mehr — jetzt **reine Produktentscheidung**: "BYOK vs. zentraler Key" als UX-Frage für die Beta, kein P0-Bug. Verschoben nach P2/Produktentscheidung, siehe unten.
- ❓ **#23 STYLE/SETUP/VEHICLE-Ontologie** — weiterhin nicht verifizierbar mit verfügbarem Zugriff (keine Code-Spuren gefunden, vermutlich reine `SUITE.md`-Dokumentationsentscheidung). Vor weiterer Planung dort direkt nachschauen.

## Neu entstanden

- 🆕 **#27 Anthropic Batch API — Public-Digest A/B-Test** (Status: Research/Optimization, nicht Bugfix) — 50% Rabatt auf Input+Output, passt strukturell zum ohnehin nächtlichen, asynchronen Digest-Lauf. Rechnerisch ~$34/Monat Ersparnis allein durch Transportweg-Wechsel. Drei-Stufen-Plan (Reviewer-Konsens, morgen zu beginnen):
  1. Synchroner Pfad bleibt unangetastet als Referenz
  2. Batch-Modus danebenbauen (15 Prompts → Message Batch → Polling → JSONL → `custom_id`→Strategie-Mapping → bestehende Post-Processing-Logik unverändert), `recordBudgetEntry()` um `apiMode`/`batchId`/`customId` erweitert (nicht ersetzt)
  3. Echter A/B-Vergleich (Erfolgsrate, Validatoren, Repair-Rate, Tokenverbrauch, echte Kosten, Laufzeit, KV-Äquivalenz) — erst danach Umstellung auf Batch als Standard
  Bewusst NICHT gleichzeitig mit Prompt Caching (zweiter möglicher Kostenhebel) — erst Batch messen, dann Caching separat testen, damit die Wirkung beider Mechanismen trennbar bleibt.

---

## P0 — Wirtschaftlich/strukturell, blockierend für Kommerzialisierung

1. ~~API-Kosten-Reduktion~~ → **DONE, s. oben.** Nachfolge-Arbeit läuft jetzt unter #27.
2. ~~Client-seitige API-Key-Exponierung~~ → **entschärft, s. oben**, jetzt unter P2/Produktentscheidung geführt.
3. **BaFin-Erlaubnispflicht-Voranfrage** (17.09., laufend) — unverändert reiner Wartestand, keine Aktion von unserer Seite möglich, blockiert weiterhin die Beta-Freigabe-Entscheidung.

---

## P1 — Direkte Fortsetzung des LLM-Auswahl-Drift-Fixes (18.–21.09.)

4. **Candidate Selection Integrity — Equity/KO Audit** — weiterhin bewusst im Beobachtungsmodus (kein Live-Beleg für Equity-Strategien). Diagnose-Logging analog `[ATMNA-CANDIDATES]` für eine Equity-Strategie wäre der nächste Schritt, sobald Zeit ist.
5. ~~`/logs`-Route-Paginierung~~ → **DONE, s. oben.**
6. **Repair Data Provenance Guard** — architektonisch wichtigster offener Punkt aus dem Drift-Fix: "Repair darf keine fehlenden Daten erzeugen." Bisher nur Prinzip dokumentiert, nicht codiert. Kein aktueller Anlass (kein Produktionsfall), aber langfristig wichtig.
7. **Model-Refusal Detection im REPAIR-Loop** — niedrigere Dringlichkeit als #6, nur ein künstlicher Testfund (eigener Adversarial-Test heute), kein Produktionsbeleg.

---

## P1 — Sonstige offene Technik-/Infrastruktur-Punkte

8. **`my-cors-proxy` in GitHub versionieren** — weiterhin offen, kein Abschlussdatum.
9. **Ticker-Automatisierungs-Skript** — weiterhin offen, nie begonnen.
11. **CBOE-PCR-Fehlerstring** — weiterhin offen, Ursache nie untersucht.
12. **Morning-Briefing-Laufzeit-Anomalie** — weiterhin offen, nie abschließend reproduziert.

---

## P2 — Architektur, bewusst auf „später" verschoben

13. **v2.0/Phase-3: generische kanonische Metrik-Pipeline** — unverändert zurückgestellt.
14. **Config-Data-DRY-Verletzung** — unverändert zurückgestellt, gleiche Musterklasse wie #13.
15. **Ticker-Feld-Weiterleitung, strukturelle Vereinheitlichung (Option B)** — unverändert zurückgestellt.
16. **Options-Strategie-Erweiterung** (Bull Put Spread/Iron Condor/Calendar Spread) — unverändert zurückgestellt, bis EIC-Master-Prompts sich bewährt haben.
17. **KO-Short als eigenständiges Konzept** — unverändert zurückgestellt.
18. **Fair-Value-Engine Phase B** — unverändert eingefroren.
19. **CoT-Data-Collector, Feature-Engineering/Scoring** — unverändert eingefroren.
20. **DCE-Redesign mit Fair-Value** — wartet weiterhin auf #18.

---

## P2 — Produkt-/Feature-Wünsche, unentschieden

21. **Öffentliches Literaturverzeichnis** — unverändert unentschieden.
22. **Boilerplate-Templating Abschnitt 7+8** — jetzt mit echter Kostendatenbasis (s. #1-Auswertung) planbar, aber noch nicht begonnen. Sinnvoller Kandidat für nach #27.
NEU: **BYOK vs. zentraler Key** (ehem. #2) — Produktentscheidung für die Beta-Phase, kein technischer Bugfix.

---

## Unklar / nicht abschließend verifizierbar

23. **STYLE/SETUP/VEHICLE-Ontologie** — s. oben, weiterhin ungeklärt.

---

## Für morgen — konkrete Reihenfolge (s. Übergabeprotokoll für Details)

1. Kurzer Bestätigungscheck: `generate_public_recommendations.js` v1.11 liefert im nächsten GHA-Lauf echte `estimated_cost_usd`-Werte
2. **#27** Stufe 1+2 (Batch-Modus bauen, synchroner Pfad bleibt Referenz)
3. **#27** Stufe 3 (A/B-Vergleich, danach Entscheidung über Standard-Umstellung)
4. Bei Zeit übrig: #4 (Equity/KO-Diagnose-Logging) oder #22 (jetzt mit echten Kostendaten planbar)
