# UIQ — Übergabeprotokoll 28.09.2026 → 29.09.2026

**Datum:** 28.09.2026
**Status:** Session-Ende. Externes Telefonat geführt (Ergebnis nur in `uiq-legal`). Codefreeze aufgehoben (Axel). Public-UI-Bereinigung **Batch 1 committet**, Makro-KI live getestet (bestanden), Rest noch nicht live bestätigt. Großreinemachen Phase 1 (Bestandsaufnahme) abgeschlossen: `docs/BEFUNDREGISTER-2026-09-28.md` mit ADR-1 (DCE). Nichts aus dem Register gefixt.
**Zweck:** Kontext-Übergabe für den nächsten Chat — Start mit Batch 1b

---

## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert.
   "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet.
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können
   Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben
   sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher
   Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.

5. **Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt
   nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle
   Plausibilitäts-Antwort.** Nicht raten, woran es liegen könnte — nachsehen,
   woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt
   ist, gilt sie als gefunden.

6. **Never guess, always correctly diagnose (SUITE.md Grundgesetz #9).**
   Ein plausibler Fix ohne verifizierten Root-Cause-Beleg gilt als Vermutung,
   nicht als Fix — unabhängig davon, wie überzeugend die Erklärung klingt oder
   wie oft ein ähnliches Muster schon funktioniert hat. Präzedenzfall
   (23.09.2026): `ko-prompts.js` v2.54.1 (Fettdruck-Anweisung für Ticker) war
   gut begründet, aber unverifiziert — und schlug live fehl. Erst reines
   Diagnose-Logging (ohne jede Verhaltensänderung) deckte die tatsächliche
   Ursache auf (v2.54.2: fett geschriebene Markdown-Überschriften brachen die
   Ticker-Extraktions-Regex). Erst danach griff der gezielte Fix nachweislich.
   Konsequenz für diese Session: bei unerwartetem Verhalten lieber einen Lauf
   in reine Diagnose investieren (Logging, kein Verhaltenseingriff), als aus
   der ersten plausiblen Hypothese sofort einen Fix zu bauen — auch wenn das
   einen Zyklus länger dauert.

7. **Tests für öffentlichen Output prüfen den Inhalt, nicht nur die Struktur.**
   "Überschrift 7 ist vorhanden" beweist nicht, dass unter Überschrift 7 der
   richtige Text steht. Präzedenzfall (24.09.2026):
   `generate_public_recommendations.js` v1.22 bestand Golden-Test,
   Szenario-Tests und E2E-Test — alle prüften nur, ob die Abschnitts-
   Überschriften vorhanden waren. Live standen in Abschnitt 7+8 aller 15
   Strategien die Prompt-Anweisungen an das Modell ("PFLICHT-SATZMUSTER",
   "Grundgesetz #11", "EIC-exklusiv") statt fertigem Text. Root Cause: derselbe
   String wurde für zwei Rollen benutzt (Anweisung ans Modell UND öffentlicher
   Text). Konsequenz: Prüfungen für öffentlichen Text gegen echte historische
   Outputs kalibrieren — mit positiven Fällen (gültige Texte müssen bestehen)
   UND negativen Fällen (bekannt fehlerhafte Texte müssen durchfallen), bevor
   sie live Strategien blockieren dürfen. Und: Prompt-Anweisung ≠ Output — nie
   denselben String für beide Rollen verwenden.

8. **Pro Nacht nur eine Produktionsänderung.**
   Wenn zwei Änderungen gemeinsam in denselben Nachtlauf gehen und etwas
   abweicht, lässt sich die Abweichung keiner der beiden eindeutig zuordnen.
   Weitere fertige Änderungen warten, bis die vorherige live bestätigt ist —
   notfalls über einen manuellen Lauf, damit nicht auf den nächsten Nachtlauf
   gewartet werden muss. Präzedenzfall (24.09.2026): Phase C der
   TICKER_MASTER-Migration wurde fertig gebaut und getestet, aber bewusst erst
   nach der Live-Bestätigung von v1.23 zum Commit freigegeben.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---


---

## Technische Stolperfallen / Werkzeuge (Stand 28.09.2026)

Alle Punkte aus `UEBERGABE-2026-09-26.md` gelten weiter (Cloudflare-Cron-Wochentage, Watchdog-Dispatches als „Manually run“, Web-Upload in Unterordner, anonyme Repo-Lesezugriffe, Token-Handling am Mac). Neu bzw. präzisiert:

* **`ko-prompts.js` hat drei Stellen, die synchron bleiben müssen:** (1) `ko-modules/ko-prompts.js` (Quelle), (2) CDN-Pin in `axel-scanner/index.html` (`ko-modules@<hash>/ko-prompts.js`), (3) `UIQ-Suite/scripts/vendor/ko-prompts.js` **und** `KO_MODULES_VENDOR_DRIFT_COMMIT` in `generate_public_recommendations.js`. Ablauf: erst ko-modules committen → Hash → dann Pin, Vendor-Kopie und Drift-Commit. jsDelivr-Auslieferung eines neuen Hashs mit WebFetch prüfbar.
* **`uiq-legal` ist in dieser Session lesbar gewesen** (per `add_repo` angehängt, Commits verifiziert). Ob das in einer neuen Session wieder freigegeben wird, ist offen.
* **Morning Briefing hat zwei Erzeugungswege:** Server (`market_aggregator.py`, `generate_daily_snapshot()`, eigener Prompt ab ~Z. 9937) und Client (`ko-prompts.js` `_getMorningPrompt()` + Messwerte-Aufbau in `index.html` ~Z. 24200). Änderungen an Sprachregeln müssen in **beide**.
* **`ko-strategies.js` wird von `index.html` nicht mehr geladen** — Treffer dort sind toter Code, nicht live.

---

## Stand nach heutiger Session — laut Vorsession, von dir noch nicht verifiziert

### A. Externes Telefonat 28.09.

* Geführt. Protokoll, Nachtrag und Unterlagen im privaten Repo `uiq-legal`. **Im öffentlichen Repo keine Namen, keine Aktenzeichen, keine Inhalte.**
* Für die Arbeit relevant: Beta-**Vorbereitung** darf beginnen; Beta-**Freigabe** erst nach schriftlicher Rückmeldung (erwartet ca. 05.–08.10.). Dem Nachtrag an die Gegenseite liegen **Zusagen** zugrunde, die vor jeder Testphase erfüllt sein müssen:
  - Owner-Modus serverseitig gesperrt, für Tester nicht zugänglich (Batch 2),
  - private Hilfsrechner aus der Testversion entfernt (Batch 2),
  - Hinweise auf Positionsgrößen aus allgemeinen Textausgaben entfernt (Batch 1/1b/1c),
  - Watchlisten und Deep-Dive mit denselben Kriterien und Risikohinweisen wie die Strategie-Analysen (Batch 3).
* Freeze 1 (bis Telefonat) und laut Axel auch Freeze 2 (№72) sind aufgehoben. **Stand der Abnahme №72 A1 in dieser Session nicht geprüft.**

### B. Batch 1 der Public-UI-Bereinigung — committet, teilweise live getestet

| Repo | Commit | Inhalt | Byte-Vergleich |
|---|---|---|---|
| ko-modules | `e82508a` | `ko-prompts.js` v2.55.0: KI-Makroanalyse (`_getIntermarketPrompt`) deskriptiv, Punkt 8 „Einordnung für Strategie-Typen“, Rolle ohne persönliches Anlegerprofil, Regel gegen Handlungsanweisungen; KO-Kriterium „Positionsgrößen-Passung … 2.000 EUR“ entfernt, KO-Hint ohne Limit | ✅ |
| UIQ-Suite | `37fe725` | Vendor-Kopie `scripts/vendor/ko-prompts.js` = v2.55.0 | ✅ |
| UIQ-Suite | `75717b6` | `generate_public_recommendations.js`: nur `KO_MODULES_VENDOR_DRIFT_COMMIT` → `e82508a` | ✅ |
| UIQ-Suite | `8351a26` | `docs/PUBLIC-UI-BEREINIGUNG-PLAN.md` (Batch-1-Stand, Punkte 2.11–2.13) | ✅ |
| axel-scanner | `c35a6db` | `help.html`: 1–2-%-Depotregel entfernt, Spalte „Einordnung“ | ✅ |
| axel-scanner | `9f016bd` | `index.html` v514: Signallabels „Signallage stark/gemischt/schwach“ (statt Kaufsignal/Kein Einstieg); Makro-Tagesfazit deskriptiv; Tooltip „Selektiv“; KO-Hint; Intermarket-Verdict; QQQ-Markov-Untertitel; `verifyUserToken()` fail-closed (`free` statt `admin`, **derzeit ohne Wirkung**, Tier wird nirgends ausgewertet); CDN-Pin `@e82508a` | ✅ |

* **Live getestet (Axel, 14:11):** KI-Makroanalyse durchgehend deskriptiv, Tagesfazit ohne Positionsgrößen/KO-Abstände, Intermarket „Gemischte Intermarket-Signale“ — **bestanden**.
* **Noch offen:** Scanner-Labels im UI ansehen; **Nachtlauf Mo 28.09. 22:00 UTC** prüfen: keine Vendor-Drift-Warnung im Log, KO-Digest ohne 2.000-€-Kriterium.
* **Hinweis zu Grundregel 8 (eine Produktionsänderung pro Nacht):** Im selben Nachtlauf wird auch v1.25 (`cba63d6`, Regime-Feldpfad, 26.09.) erstmals mit neuem Handelstag vollständig verifiziert. Die Änderungen sind trotzdem trennbar zuzuordnen: v1.25 wirkt auf `market_regime.mse_regime` und `regime` in Decision-Snapshots, v2.55.0 nur auf Prompt-Texte (KO-Kriterium; der Makro-Prompt wird im Digest nicht genutzt). Bei Abweichungen zuerst so trennen.

### C. Großreinemachen Phase 1 — `docs/BEFUNDREGISTER-2026-09-28.md`

* Statischer Scan aller Repos (axel-scanner, ko-modules, ko-aggregator, UIQ-Suite/scripts, workers, ko-sync) nach direktiver Sprache, Positionsgrößen, Zielen/Trefferquoten, veralteten Statustexten; jeder Treffer von Hand eingeordnet; Live-Funde (MB-Briefing und Makro-Tab 28.09.) gegen den Code zurückverfolgt.
* Das Register ist die **eingefrorene Ausgangsbasis**: Befunde werden nicht rückwirkend geändert, Ergebnisse kommen als datierte Nachträge ans Ende.
* Kategorien R (Regulatorik), D (Datenintegrität), U (veraltete Texte/toter Code), S (Sicherheit); Prioritäten P0/P1/P2; Belegstatus ✅/🔎/❓; **Ursachen-Taxonomie** (Quelle · Transformation · Cache · Prompt-Binding · Darstellung) verbindlich für alle D-Befunde.
* **Schwerste Funde (alle P0):**
  - **R1/D4 DCE:** `_derive_action()` liefert BUY/SELL/HOLD + `position_size`; sichtbar im Alpha Desk, im MB-Client-Prompt („Position-Sizing … Richtung“) und im öffentlichen Digest (`buildDecisionSnapshot()`). Confidence ist eine handgewichtete Heuristik (BN/HMM/NN-Platzhalter fließen derzeit **nicht** ein), wird im Prompt aber „kalibriertes Vertrauensmaß“ genannt. BUY-Logik = Mittelwert der Strategie-Scores > 0,55. Stille Fallbacks (VIX = 20, VaR = −5 %).
  - **R3/R4 Morning Briefing:** Server-Prompt ohne jede Regel gegen direktive Sprache; Client-Prompt mit „bevorzugen/meiden“.
  - **R5 Trefferquoten:** „Signal-Qualität A · x % Trefferquote“ auf Scanner-Karten — widerspricht „extern keine Backtest-Kennzahlen“ (26.09.).
  - **D1 Bull-Market-Frühindikator:** Zweig 0,00 % / über 50-EMA 100,00 % / Markov 0,0000 — „Zweig“ ist tatsächlich Anteil MACD-bullischer Titel aus `tickerData`; Ursache der Extremwerte zur Laufzeit offen.
  - **D2/D3 Server-MB:** Termstruktur als „invers“ gedeutet, obwohl Contango; MOVE als IV von ARM missbraucht.
  - **S5 Reale Depotangaben** (NAV-Größenordnung, Broker, aktive Positionen) im Prompt-Text von `workers/ko-ai-worker.js` und `axel-scanner/workers/ko-ai.js` — öffentlich lesbar; Git-Historie behält sie (№73).
* **Geprüft und entlastet:** DIX/GEX aus SqueezeMetrics sind korrekt und täglich frisch (kostenloser Abruf `DIX.csv`, Snapshots 22.–25.09. mit wechselnden Werten). Veraltet ist nur der UI-Hinweis „kostenpflichtig“ (U1).

### D. ADR-1 — DCE (Beschluss 28.09., präzisiert; Volltext im Befundregister)

* **Intern** vollständig weiter: Confidence, Ampel, Richtung, Positionsgröße, Go/No-Go; versioniert und protokolliert.
* **Öffentlich** nur „DCE-Marktdiagnostik“: Signalbreite (x % von n Titeln mit Score > 55), CUSUM-Strukturbruch VIX (ja/nein), EVT-VaR(95) als Schätzung — jeweils mit Methode, Fenster, Datenstand; VaR ausdrücklich keine Verlustobergrenze, keine Prognose.
* **Technisch:** eigenes Schema `dce_public` serverseitig; das interne DCE-Objekt darf nicht in öffentlich ausgelieferte Daten (`master_market_data`, Digest) — „nicht anzeigen“ reicht nicht. Keine stillen Fallbacks (`n/v` mit Ursache). Zwei Freigabestufen; Stufe 1 gibt Stufe 2 nicht frei.

---

## Roadmap ab 29.09.2026 (in dieser Reihenfolge)

1. **Di 29.09. früh — Verifikation (read-only):** Nachtlauf prüfen — (a) v1.25: `mse_regime` im Digest und `regime` in Decision-Snapshots belegt; (b) v2.55.0: keine Vendor-Drift-Warnung, KO-Digest ohne 2.000-€-Kriterium; (c) Scanner-Labels im UI.
2. **Batch 1b (serverseitig + Prompts, eine Produktionsänderung pro Nacht beachten):** ADR-1 umsetzen (`dce_public`, DCE aus Digest/`master_market_data`-Public-Pfad/MB-Prompt/Alpha-Desk), beide MB-Prompts mit Prinzip-Regel gegen direktive Sprache, berechnetes Termstruktur-Label, Metrik-Bindung, templateter Datumskopf, „Fading Short“ statt „KO-Short“; Regime-Aktionstexte (R6), McClellan-Text (R7), Digest-Kontexttexte (R9). **Vorher lesen:** `dce_layer.py` komplett, Aggregator-Stellen, an denen `master["dce"]` gesetzt und ausgeliefert wird, `ko-sync-worker.js` (was wird öffentlich ausgeliefert?). Wegen Grundregel 8 ggf. in zwei Nächte teilen (erst DCE/Digest, dann MB-Prompts). **Vorher-/Nachher-Snapshot** der öffentlichen Payloads sichern. **Abnahme nach AK-1 (Prüfung der tatsächlich ausgelieferten Antworten), AK-2 (Stichprobe echter KI-Ausgaben) und AK-3/D2 (getestete Termstruktur-Funktion)** — Befundregister, Abschnitt „Abnahmekriterien“.
3. **Batch 1c (Frontend):** Trefferquoten raus (R5), Resttexte (R8, R10), U1, U3.
4. **Batch 2 (Owner-Gate — Zusage):** S1 serverseitige EIC-Freischaltung, S2 App-Zugang, **S5 Depotangaben aus öffentlichem Quelltext**, private Rechner/Fibo-Einstiegsplan/EIC-Quick hinter das Gate. **Erfüllt erst nach AK-4:** für einen Nutzer ohne Owner-Berechtigung nachweislich nicht erreichbar, dokumentiert mit Commit, Deployment-Stand und Test in `uiq-legal`.
5. **Batch 3 (Zusage):** Deep-Dive und Watchlisten deskriptiv + Risikohinweise; MAR-Offenlegungsblock (Ersteller, Methodik, Datum, Interessenkonflikte).
6. **№72 Datenintegrität:** D1, D6–D9, D11, D12 — erst Ursachenanalyse mit Taxonomie, dann Fix; A1-Stand vorher klären. D1-Abnahme nach AK-3.
7. **Parallel ab Eingang (ca. 05.–08.10.):** schriftliche Rückmeldung der Aufsicht gegen Zusagen und Befundregister abgleichen; dann Fachanwalt (MAR, Beta-Bedingungen).

Aus `UEBERGABE-2026-09-26.md` weiterhin offen und **nicht** in dieser Session bearbeitet: B1/B2/B2b (Optionsstrategien), Zeitsteuerung/FIN-Entkopplung/Watchdog/cron-trigger, **Runner-Pin vor 19.10.**, `mcm_context_downgrades`, №73. Reihenfolge dort beachten (FIN-Entkopplung vor Watchdog-Reparatur).

---

## Offene Entscheidungen (Axel)

* **Export-Funktion:** Vorschlag — eine gemeinsame JSON-Snapshot-Funktion für MB, Makro und später Deep-Dive mit Zeitstempel und Quelle pro Block (löst auch D10); PDF erst bei Bedarf. Priorität nach Batch 1b. Noch nicht entschieden.
* **Beta-Start** bleibt eine eigene Entscheidung: regulatorisch nach schriftlicher Rückmeldung, fachlich nach Go-Kriterium 2 (nicht bestanden, 26.09.).

---

## Sonstiges

* Alle heutigen Commits in ko-modules, axel-scanner und UIQ-Suite wurden per Byte-Vergleich gegen die gelieferten Dateien geprüft; `uiq-legal`-Commits ebenfalls gelesen und geprüft.
