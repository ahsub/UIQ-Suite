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

# UIQ — Übergabeprotokoll 03.10.2026 → 06.10.2026

**Datum:** 03.10.2026, Sessionende ca. 23:45 MESZ (Fortsetzung der Sitzung vom 02./03.10.; Abendteil ab ca. 17:10 MESZ)
**Status:** P1 #3 Schritt 1 am Morgen echtdaten-verifiziert (Register-Nachtrag 93b5f8b) · **P1 #5 `ki_eic` fachlich abgeschlossen**: Zugriffsschutz belegt, Herkunft belegt, Kennzeichnung im Owner-UI als **Frontend v516** live (laut Axel in Cloudflare bereitgestellt; Screenshot 23:36 MESZ zeigt „v516“ und den Hinweis unter der EIC-Zeile bei zwei Karten) · Worker-Test und Register-Nachträge auf GitHub `main` · **keine Änderung an Aggregator, Generator, Worker, Scores, Gewichten oder Gates in diesem Abendteil**
**Zweck:** Fortsetzung am Montag/Dienstag nach US-Börsenschluss (Mo 05.10.2026) ohne Rückgriff auf den Arbeitsbereich dieser Session — alles Relevante liegt auf GitHub `main` oder in diesem Dokument

> Quellenhinweis: Das Cloudflare-Deployment von v516 habe ich nicht selbst ausgeführt und nicht in Cloudflare gesehen; belegt ist es durch Axels Aussage und seine zwei Screenshots der Live-Seite. Die Owner-Darstellung (Hinweiszeile) und die Version „v516“ in der Sidebar sind im Screenshot sichtbar. Tests liefen in meiner Sandbox, nicht in der echten CI. Alles Übrige ist nach Pflicht-Header Punkt 1 vom nächsten Chat zu verifizieren.

## 1. Stand der drei Repos (alle sauber, nichts ungepusht)

| Repo | `main` | Inhalt dieses Abends |
|---|---|---|
| `ahsub/UIQ-Suite` | **`8cdbd68`** | Register-Nachtrag P1 #5 (`8cdbd68`), Register-Nachtrag P1 #3 / D20–D23 (`93b5f8b`), SUITE.md №76 (`c7ae9b0`) |
| `ahsub/ko-aggregator` | **`19453e5`** | `tests/test_worker_ki_eic.mjs` (13 Prüfungen, nicht im Workflow); sonst Aggregator v5.47.0 unverändert (`a33dc53`) |
| `ahsub/axel-scanner` | **`d3391e6`** | Frontend **v516** (nur `index.html`, +8/−2). Blob `2b714d3…`, SHA-256 `630e29c47531128a78acc44972fa4ef0ca1952ca96f4ca4c4f670cb93afa0114`. `help.html` unverändert seit v515 (SHA-256 `46f300e7…4fd1`) |

Pushes erfolgten jeweils nach Axels ausdrücklichem „pushen“ (1+2 in der Reihenfolge Suite → Aggregator; `axel-scanner` separat nach „A ist ok, bitte pushen“). Nach dem Push von `d3391e6` stand `main` = `origin/main` (0/0), `index.html` auf GitHub entspricht dem lokalen Stand.

## 2. P1 #5 `ki_eic` — Ergebnis

1. **Zugriffsschutz:** Der Worker (v2.5) entfernt `ki_eic` serverseitig für Nicht-Owner auf `/public/master_market_data` und `/public/options_watchlist` (`stripKiEic` in `sanitizeOptionsItem`); `/sync/*` berührt das Feld nicht. Belegt durch Code, Deep-Compare der Live-Payloads Owner gegen Static (Unterschiede nur `ki_eic` bei 15 Einträgen und die 7 sensiblen `masterShortlist[].ki`-Felder) und den Regressionstest `tests/test_worker_ki_eic.mjs` (13/13, inklusive Mutations-/Negativkontrolle).
2. **Herkunft:** `ki_eic` ist die Ausgabe eines zweiten LLM-Aufrufs (nur Top 15; Eingaben Symbol, Strategie, Kurs, HVP; keine Optionskette, kein IV-Niveau; Felder nicht fachlich validiert). Es sind Modellschätzwerte, keine Marktdaten einer Optionskette.
3. **Kennzeichnung (v516):** Unter der Zeile „EIC: Strike ~$… · DTE … · Δ … · Prämie ~…%“ steht jetzt „Modellschätzung ohne Optionsdaten (Eingabe: Kurs, HVP, Strategie).“ — nur im bestehenden `if (t.ki_eic)`-Zweig, d. h. nur für Owner, Styling `var(--text3)` (bewusst nicht `--text2`), kein Modellname. Darstellungstest (5/5, lokal) liegt **nicht** im öffentlichen Repo (Entscheidung Axel); nur im Arbeitsbereich dieser Session.
4. **Nicht getan / nicht nötig:** Static-Token-Browserdurchgang (von Axel als nicht mehr erforderlich eingestuft). Der Hinweis erscheint für Tester konstruktionsbedingt nicht, weil `ki_eic` dort fehlt; das ist durch Test und Payload belegt, nicht durch Browser.
5. **S6** (historische Exponierung von `ki_eic` über 175 öffentliche Snapshots, 22.07.–29.09.2026; Git-Historie des öffentlichen Repos) ist **unverändert offen** und wird gemeinsam mit №73 entschieden. P1 #5 ändert daran nichts. Ob die Statusspalte von S6 im Register („Maßnahme vorbereitet, nicht live“) inzwischen überholt ist, wurde **nicht geprüft**.

## 3. Hosting und Deployment (geklärt am Abend)

- `underlyingiq.com` wird per **Cloudflare Workers & Pages, Direct Upload** bedient: Axel zippt `index.html` + `help.html` und lädt sie manuell hoch. **Ein GitHub-Push deployt nichts.** GitHub `axel-scanner` ist die Sicherung des Stands, nicht der Auslieferungsweg.
- `ROADMAP.md` im Repo nennt noch GitHub Pages (veraltet). `netlify.toml`, `vercel.json`, `api/scan.js`, `netlify/functions/scan.js`, `functions/scan.js` sind laut Beobachtung Altlast aus früheren Hosting-Phasen: in `index.html` fand ich keinen aktiven Aufruf (`API_BASE` `/api/scan` ist laut Kommentar entfernt), und Pages Functions kämen im reinen Zwei-Dateien-Zip ohnehin nicht mit. **Nicht abschließend geprüft; keine Bereinigung beschlossen.**
- **Wichtig:** `macro-calendar.json` wird laut Changelog v323.2 **direkt von `raw.githubusercontent.com/ahsub/axel-scanner/main/macro-calendar.json`** geladen, nicht aus dem Zip. GitHub `main` ist für diese Datei die Live-Quelle; jeder Push, der sie ändert, wirkt sofort. Letzter Commit der Datei: `9f016bd` (28.09.2026). Ob die Repo-Fassung der lokal von Axel gepflegten entspricht, ist nicht abgeglichen.
- Unterschied der Commit-Links, den Axel am Abend geprüft hat: `2b1052c` ist v323 vom 14.07.2026 (alter Commit, unveränderlich, kein Aktualisierungsbedarf); der aktuelle Stand ist der Kopf von `main` (`d3391e6`).

## 4. Nächste Schritte (Reihenfolge; je eine Produktionsänderung pro Nacht, Pflicht-Header Punkt 8)

1. **Mo 05.10.2026 22:00 UTC** — planmäßiger Aggregator-Lauf (läuft in der Nacht auf Di 06.10.). Es steht **keine** Aggregator-/Generator-/Worker-Änderung dafür an; v516 ist reines Frontend. Check nach dem Lauf wie gewohnt (`payload_snapshot.sh nachher`, Digest, Log), insbesondere: Lauf grün, `earnings_state` weiter vorhanden, `dce_public` vorhanden, kein `"dce":`, `/owner/dce` mit Static-Token → 403.
2. **Danach, einzeln und jeweils erst nach Entscheidung Axel** (aus Runmap und Registern, nicht in dieser Session begonnen): Rationale „Earnings-Termin unbekannt“ · P1 #3 Schritt 2 (Earnings-Gate, mit Präregistrierung, verändert potenziell die Auswahl) · Paket zur 200er-Abfragegrenze bei Earnings (D16 (b), Ursache des hohen `UNKNOWN`-Anteils) · `tie_group` für Equity (D23) · Equity Q1–Q10 · P2.
3. **Qualitätsliste Options-Desk/EIC (eigene Runde, außerhalb P1 #5, nichts davon beschlossen):** ATM-Doppeltilde „ATM ~~$10“ · $5-Rundung des ATM-Strikes · Vorzeichenkonvention Δ (Puts negativ, Credit-Spreads positiv) · Credit-Spread ohne Breite/Leg-Definition · Prämie ohne IV-Eingang · `ki.note` wird nicht gerendert · Basis-Label „% des Strikes“ bei der Prämie · doppelte `generate_daily_snapshot`-Definition im Aggregator · Changelog-Teaser auf der Übersichtsseite zeigt einen alten Eintrag („15.07.2026 — Ölpreis-Anzeige korrigiert (1/4)“, älterer Fehler, bei Gelegenheit bereinigen; Ursache nicht geprüft).

## 5. Offene Entscheidungen / offene Punkte

- **Register-Nachtrag zu P1 #5 Teil 2:** Entscheidung (Variante A, Text, `var(--text3)`), v516 und Live-Bestätigung stehen **noch nicht im Befundregister**. Der Abendnachtrag (`8cdbd68`) endet mit „Offene Entscheidung (Axel)“ und ist insoweit überholt, nicht falsch. Kurznachtrag sinnvoll (nur Doku).
- **`tests/test_worker_ki_eic.mjs` in den Workflow hängen** — bewusst zurückgestellt, eigener Schritt.
- **Darstellungstest** (`test_options_eic_hint.mjs`) bleibt außerhalb des öffentlichen Repos; möglicher Ort `uiq-devtools`, nicht entschieden.
- **S6 / №73:** Git-Historie des öffentlichen Repos; Statuszeile im Register ggf. aktualisieren.
- **D20–D23 (Nachtrag 03.10.)** unverändert offen: veralteter Zeitstempel `daily_market_snapshot_us.json` (11 Tage alt), `TR-Backup (Samstag)` Run mit `failure`, KLAC-52W-Abstand, Gleichstände ohne Kennzeichnung bei Ko/Momentum/VCP.
- Alte lokale Branches im Suite-Arbeitsbereich (`befund-nachtrag-2026-09-30`, `fix/strategy-score-integrity`, `nacht-a-dce-digest`, `p1-2-tie-group`, `p1-3-earnings-state`) wurden nicht angefasst und nicht bewertet; der Arbeitsbereich ist nach Sessionende nicht verfügbar — relevant ist nur, was auf GitHub liegt.
- Nicht in Scope und nicht angefasst: `help.html`, Scanner-Tab-Befunde D18/D19, Research-Frage №75.

## 6. Entscheidungen Axel (03.10. abends)

Keine Implementierung vor Worker-Test und UI-Prüfung · Worker-Test ins Repo, **nicht** in den Workflow · Hinweistext Variante A „Modellschätzung ohne Optionsdaten (Eingabe: Kurs, HVP, Strategie).“, Variante D verworfen · `var(--text3)` ohne zusätzliche `font-size`-Angabe · Darstellungstest nicht ins öffentliche Repo · Owner-Browserprüfung per Screenshot ausreichend, Static-Token-Browserdurchgang entfällt · ATM-Doppeltilde, $5-Rundung, Δ-Vorzeichen, Credit-Spread, Prämie ohne IV: „klassischer Scope Creep“, nicht in P1 #5 · Push 1+2 (Suite, Aggregator) freigegeben; Push `axel-scanner` („A ist ok, bitte pushen“) freigegeben; Cloudflare-Upload von v516 durch Axel selbst · v516 ist live bestätigt (Screenshot 23:36 MESZ) · Übergabeprotokoll für Montag/Dienstag nach US-Börsenschluss.

## 7. Fehler und Korrekturen dieser Session (zur Nachvollziehbarkeit)

- Ich hatte angenommen, die Frage nach der Git-Historie sei offen; das Register dokumentiert sie bereits als S6 (175 Snapshots). Korrigiert, im Register-Nachtrag getrennt dargestellt.
- Ein Größenunterschied Owner- gegen Static-Payload (716 KB) war zunächst ungeklärt; der Deep-Compare zeigte, dass er reine Whitespace-Differenz ist.
- Diffgröße zunächst als „−1 Zeile“ genannt, richtig +8/−2.
- Hosting zunächst unklar (Repo-Dateien deuteten auf Netlify, Vercel oder GitHub Pages); aufgelöst durch Axels Angabe (Cloudflare Direct Upload).
- Meine Einschätzung, die leeren Felder Regime/VIX/F&G/PCR-GEX auf der Übersicht seien „plausibel“, war eine Vermutung; Axel klärte: Marktbriefing nach dem Neuladen noch nicht gestartet. Kein Befund.
- Axels Link auf `2b1052c` als „aktuelle Version“ zeigte auf einen alten Commit (v323, 14.07.); aktuell ist `d3391e6`.
- Das Stop-Hook-Verhalten bei ungepushten Commits wurde jeweils ohne eigenmächtigen Push behandelt; gepusht wurde nur auf ausdrückliche Anweisung.
- Ein `git fetch` brach zweimal mit „Recv failure: Connection reset by peer“ ab (Sandbox/Proxy, transient); der Push selbst ging durch und wurde über Fetch, Blob-Vergleich und SHA-256 verifiziert. Eine weitere Fetch-Abfrage nach dem Push brach erneut ab; der Kopf von `main` wurde stattdessen über die GitHub-API bestätigt.

## 8. Verweise

- `docs/BEFUNDREGISTER-2026-09-28.md` (Nachträge 03.10. P1 #3 / D20–D23; 03.10. abends P1 #5)
- `docs/UEBERGABE-2026-10-02.md`, `docs/UEBERGABE-HEADER-TEMPLATE.md`
- Commits: UIQ-Suite `8cdbd68`, `93b5f8b`, `c7ae9b0`; ko-aggregator `19453e5`; axel-scanner `d3391e6` (v516, parent `84fb72f`)
