# UIQ — Übergabeprotokoll 29.09.2026 → 30.09.2026

**Datum:** 29.09.2026
**Status:** Session-Ende. Roadmap-Punkt 1 (Nachtlauf-Verifikation) bis auf 1c erledigt. Pflicht-Lesen Batch 1b erledigt, **kein Code an Aggregator/Digest/Prompts geändert**. Neuer P0-Befund S6 (vollständige Snapshots mit internen Feldern im öffentlichen Repo) — Gegenmaßnahme eingespielt (Workflow v1.6), **noch nicht live bestätigt**. Forschungsnotiz H12 (Marktbreite-Divergenz) und Track „Signal-Diskrepanzen“ angelegt.
**Zweck:** Kontext-Übergabe für den nächsten Chat — Start mit Verifikation des ersten Nachtlaufs mit v1.6, danach Batch 1b Nacht A

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

## Technische Stolperfallen / Werkzeuge (Stand 29.09.2026)

Alle Punkte aus `UEBERGABE-2026-09-28.md` und `-09-26.md` gelten weiter. Neu:

* **Snapshots liegen ab sofort nur noch im privaten Repo `ahsub/uiq-archive`** (`data/snapshots/YYYY-MM-DD_HH.json.gz`, kein Rolling Window). In einer Claude-Sitzung per `add_repo` (access `push` oder `read`) anhängen — anonym nicht lesbar. `uiq-devtools/breadth-divergenz/analyze.py` liest es per `UIQ_SNAPSHOT_DIR=…/uiq-archive/data/snapshots`.
* **GitHub-Actions-Logs lesen:** anonym nicht möglich (REST-API in der Sandbox gesperrt). Weg, der funktioniert: Claude in Chrome (Axels Chrome, Auswahl „Browser 1 (macOS)“) → `https://github.com/ahsub/ko-aggregator/commit/<VOLLER-SHA>/checks/<JOB-ID>/logs` (kurzer SHA → Server Error) → leitet auf den Rohlog weiter → `get_page_text` mit großem `max_chars`. JavaScript auf der Rohlog-Seite ist wegen der SAS-URL gesperrt.
* **Öffentliche Endpunkte am Mac prüfen** — immer in **einer** Zeile ab `read` kopieren und den HTTP-Status mit ausgeben (ein leerer Treffer ist sonst nicht von „401“ unterscheidbar; so am 29.09. passiert):
  `read -s -p "UIQ-Token: " T; echo; echo "Token-Länge: ${#T}"; for p in digest ai_output/ko; do echo "=== /public/$p ==="; curl -s -o /tmp/uiq_$$.json -w "HTTP %{http_code}, %{size_download} Bytes\n" -H "Authorization: Bearer $T" "https://ko-sync.ahildebrand.workers.dev/public/$p"; python3 -c "import json;d=json.load(open('/tmp/uiq_$$.json'));print('Keys:',list(d)[:12] if isinstance(d,dict) else type(d).__name__);print('mse_regime:',d.get('market_regime',{}).get('mse_regime','—') if isinstance(d,dict) else '—');print('date/generated_at:',d.get('date','—'),d.get('generated_at','—')) if isinstance(d,dict) else None"; echo "Treffer 2.000/Positionsgröße:"; grep -o -i -E "2\.000[^\"]{0,50}|Positionsgr..e[^\"]{0,50}" /tmp/uiq_$$.json | sort | uniq -c; done; rm -f /tmp/uiq_$$.json; unset T`
* **Nachtlauf startet stark verzögert:** Cron 22:00 UTC, Lauf #338 startete tatsächlich 01:35 UTC (GitHub-Scheduler). Für Prüfzeitpunkte einplanen.
* **Kein manueller Aggregator-Lauf während US-Handelszeit** (schreibt Intraday-Stand in KV/Track-Record).
* **Hypothesen-Nummern vor Vergabe gegen die ganze Roadmap UND die Präregistrierungs-Entwürfe prüfen.** Am 29.09. zunächst „H6“ vergeben, obwohl H6 schon der geparkte Entwurf „TIP-Canary“ ist → Umbenennung in **H12** durch eine Parallelsession (`0fff17f`); Register, Skript und README angeglichen.
* **Bash in Workflows:** `set -e` greift in einer Funktion, die in einer `||`-Kette aufgerufen wird, **nicht** → jeder kritische Befehl braucht explizites `|| return 1` (sonst stilles „OK“ nach fehlgeschlagenem Push).
* **Blob-loser Git-Klon (`--filter=blob:none`):** `git commit` und `write-tree` ohne `--missing-ok` laden alle Alt-Blobs nach. Für Archiv-Commits Plumbing verwenden (`hash-object -w`, `update-index --cacheinfo`, `write-tree --missing-ok`, `commit-tree`).
* **Push-Dienst der Sandbox** meldete am Nachmittag über ~1 h `503 authorization temporarily unavailable` — vorübergehend, nicht in Schleife wiederholen; lokal committen und später pushen.
* **Neuer manueller Prüf-Workflow `archive-key-check.yml`** (ko-aggregator): prüft Secret `ARCHIVE_DEPLOY_KEY` gegen den Deploy Key (Fingerprint), Lesezugriff und Schreibrecht per Push-Trockenlauf — ohne Änderung. Bei jedem Schlüsseltausch erneut starten; `EXPECTED_FP` darin mitziehen.

---

## Stand nach heutiger Session — laut dieser Session, von dir noch nicht verifiziert

### A. Roadmap-Punkt 1 — Verifikation Nachtlauf #338 (Mo 28.09., Start 29.09. 01:35 UTC)

| Prüfung | Ergebnis | Beleg |
|---|---|---|
| Lauf gesamt | ✅ Success, Exit 0, 15/15 Strategien | Actions-Log Run #338 |
| (a) v1.25 Eingang | ✅ `meta.regimeUsed` = `strategyMeta.regimeUsed` = BULL_QUIET, `last_trading_day` 2026-09-28 | Snapshot `2026-09-29_01` |
| (a) v1.25 Ausgang | ✅ `public/digest` → `market_regime.mse_regime: BULL_QUIET`; Log `SNAP-20260929-014405Z — Regime: BULL_QUIET` | Axels Abruf 08:16, Log |
| (a) `regime` in Decision-Snapshots | 🔎 nur indirekt (gleiche Quelle `snapshot.mcm_regime`); Ledger hat keine öffentliche Route | — |
| (b) v2.55.0 Vendor-Drift | ✅ Log „identisch zu ko-modules@e82508a“ (beide Dateien); lokal byte-identisch; jsDelivr liefert v2.55.0 | Log, `cmp`, WebFetch |
| (b) KO ohne 2.000-€-Kriterium | ✅ `public/ai_output/ko` HTTP 200, einziger Treffer = erlaubter Satz „Positionsgröße … außerhalb von UIQ zu prüfen“ | Axels Abruf 08:16 |
| (c) Scanner-Labels | 🔎 **nur im Code geprüft** (`index.html` v514: „Signallage stark/gemischt/schwach“, Altlabels nur im Kommentar); **Blick ins UI steht aus** | — |

### B. Pflicht-Lesen Batch 1b — erledigt, Ergebnisse (read-only)

* `dce_layer.py` (616 Z.) komplett gelesen. Wege, auf denen das interne DCE-Objekt heute öffentlich wird:
  1. KV `master_market_data` enthält `master["dce"]` vollständig (`market_aggregator.py` ~Z. 11495–11520, inkl. Fallback-Dict mit `position_size 0.5`); `ko-sync` `sanitizeMasterMarketData()` (~Z. 114) entfernt für Nicht-Owner **nur** KI-Felder aus Shortlist/Options — **`dce` bleibt drin**.
  2. Digest: `generate_public_recommendations.js` ~Z. 1330 (`snapshot.dce` = confidence/mode/direction) → Z. 2898 `digest.market_regime.dce`.
  3. Snapshot-Archiv + Workflow-Artefakt im öffentlichen Repo → **S6** (s. C).
  4. Frontend: MB-Client-Prompt `index.html` ~Z. 24227–24231 („Position-Sizing … Richtung“), Alpha Desk ~Z. 26209 ff.
* Stille Fallbacks bestätigt: VIX 20 (`_extract_vix`), VaR −5 % (`_calculate_evt_var` + Except), `_fallback()` mit `position_size 0.5`. BN/HMM/NN reine Platzhalter. Warntexte direktiv („Keine neuen Positionen“, „Reduzierte Positionsgrößen“).
* **D4 belegt:** An allen 38 Handelstagen mit DCE-Objekt im Archiv (04.08.–28.09.) `SELL` + `GREEN`, Confidence 70–72, Konsens 0,203–0,325 → Richtung trägt keine Information (Befundregister-Nachtrag 29.09.).

### C. S6 — Snapshot-Archiv im öffentlichen Repo (P0) — Maßnahme eingespielt, nicht live

* Befund (belegt): Snapshot `2026-09-29_01.json.gz` im **öffentlichen** `ko-aggregator` enthielt `masterShortlist[].ki` (`positionPct`, `leverageRec`, `stopLoss`, `target`, …), `optionsWatchlist[].ki_eic` und das volle DCE-Objekt — genau die Felder, die `ko-sync` für Nicht-Owner entfernt. Zusätzlich 7-Tage-Artefakt. Andere Archivordner (fundamentals, iv_history, breadth_history, TR-Backup) geprüft: unauffällig. Keine weiteren Leser von `data/snapshots` (nur ungenutztes `snapshot_reader.py`).
* Entscheidung Axel: **volles Objekt privat**.
* Umgesetzt:
  - privates Repo `ahsub/uiq-archive`; Bestand 175 Dateien übernommen (`df3921f`, Blob-Vergleich identisch) + README
  - Deploy Key „ko-aggregator nightly“ (nur `uiq-archive`, Read/write), Secret `ARCHIVE_DEPLOY_KEY` in `ko-aggregator`
  - `archive-key-check.yml` (`3694705`, byte-identisch) — **Lauf 17:36 bestanden:** Fingerprint Secret = Deploy Key (`SHA256:r+mC/we4…`), Lesen ok, Schreiben (Trockenlauf) ok; kein Branch zurückgeblieben (geprüft)
  - `market-aggregator.yml` **v1.6** (`1fadfb4`, byte-identisch, SHA-256 `c96e3223…`): neuer Step „Snapshot ins private Archiv“ (lokal in 6 Fällen getestet), öffentlicher Commit ohne Snapshots + `git rm --cached data/snapshots`, Artefakt-Upload entfernt. Aggregator-Code, Digest, KV, Cron unverändert (Grundregel 8 nicht berührt).
* **Offen:** Git-**Historie** des öffentlichen Repos behält die 175 Snapshots → gemeinsam mit №73/S5 entscheiden (History-Rewrite bricht Hashes, erreicht Klone/Forks nicht). `snapshot_reader.py` verweist noch auf das öffentliche Archiv (ungenutzt; bei Gelegenheit anpassen oder entfernen).

### D. Forschung — H12 und Track „Signal-Diskrepanzen“

* Echte Marktbreite-Divergenz belegt (13.08. → 28.09.): SPY −1,6 %, RSP −5,8 %, IWM −7,7 %, XLI −9,2 %, XLU −10,9 %, ITA −16,2 %, XLK +2,0 %, SMH +1,8 %; Anteil > EMA50 68 % → 34 %. Regime an 46/47 Tagen BULL_QUIET (Modell hat keine Breitenachse). 70 % des Universums ohne Sektor-Tag.
* Roadmap (`4c88c0c`, umbenannt `0fff17f`): **Forschungsnotiz H12** — nicht präregistriert, nichts getestet, n_trials unverändert 42; Einordnung als Phase-4-Kanal; Berechnungsebene: Einzelticker → Sektor-Aggregation (keine DCE je Sektor). Neuer **Track „Signal-Diskrepanzen“**: Finden (täglicher Prüfer, vorab festgelegter Katalog) → Klären (Taxonomie-Ursache mit Beleg) → Nutzen (nur präregistriert + Gate + Shadow Mode); Handlungsregeln nur intern, öffentlich nur deskriptiv.
* `uiq-devtools/breadth-divergenz/analyze.py` 1.0.1 (`6dcc299`): Selbsttest reproduziert DCE-Konsens exakt, deterministisch, Archiv- und Altquelle liefern identisches Ergebnis.

### E. Commits dieser Session

| Repo | Commit | Inhalt | Prüfung |
|---|---|---|---|
| uiq-devtools | `0377c72` | breadth-divergenz 1.0.0 | `cmp` ✅ |
| uiq-devtools | `6dcc299` | 1.0.1: H12, `UIQ_SNAPSHOT_DIR` | `cmp` ✅ |
| UIQ-Suite | `4c88c0c` | Roadmap: Notiz H6 (→ H12) + Track Signal-Diskrepanzen | `cmp` ✅ |
| UIQ-Suite | `87c9ae8` | Befundregister-Nachtrag S6 (P0) + Beleg D4 | `cmp` ✅ |
| uiq-archive | `df3921f` | Bestand 175 Snapshots + README | Blob-Vergleich ✅ |
| ko-aggregator (Axel) | `1fadfb4` | market-aggregator.yml v1.6 | `cmp` ✅ |
| ko-aggregator (Axel) | `3694705` | archive-key-check.yml | `cmp` ✅, Lauf ✅ |
| UIQ-Suite (Parallelsession) | `0fff17f` | Umbenennung H6 → H12 | gelesen |

---

## Roadmap ab 30.09.2026 (in dieser Reihenfolge)

1. **Mi 30.09. früh — Verifikation erster Lauf mit v1.6 (read-only):**
   (a) Log Step „Snapshot ins private Archiv“: „OK archiviert in uiq-archive: <datei>“; neuer Commit in `uiq-archive` von `uiq-nightly`, Datei entpackbar, `meta.last_trading_day` = 2026-09-29;
   (b) öffentliches `ko-aggregator`: Archiv-Commit **ohne** neue Snapshot-Datei, `data/snapshots` aus dem Stand entfernt (einmalig 175 Löschungen im Stand), IV/Breadth wie bisher;
   (c) kein Artefakt am Lauf;
   (d) Digest/KV unverändert: Drift-Check grün, `mse_regime` belegt, 15/15;
   (e) Scanner-Labels im UI (1c von gestern, Axel).
   Falls (a) rot: übriger Lauf intakt; Ursache im Log, ggf. `archive-key-check.yml` erneut starten.
2. **Batch 1b, Nacht A — DCE-Trennung (erst nach bestätigtem 1.):** Entscheidungen stehen (Axel 29.09.): internes DCE-Objekt in **eigenen KV-Key, nur mit Owner-Token abrufbar**; zusätzlich `dce` im Worker für Nicht-Owner entfernen (zweite Sicherung); `dce_public` (Signalbreite, CUSUM ja/nein, VaR mit ehrlicher Bezeichnung gem. D13, jeweils Methode/Fenster/Datenstand, keine stillen Fallbacks) in `master_market_data` und Digest; Frontend (Alpha Desk, MB-Client-Prompt) auf den internen Key bzw. `dce_public` umstellen. **Vorher** Payload-Snapshot aller öffentlichen Routen sichern; Abnahme nach **AK-1** am tatsächlich Ausgelieferten (inkl. `uiq-archive`-freiem öffentlichem Repo).
3. **Batch 1b, Nacht B:** beide MB-Prompts (Prinzip-Regel gegen direktive Sprache), berechnetes Termstruktur-Label (D2, AK-3), Metrik-Bindung, templateter Datumskopf, „Fading Short“, R6/R7/R9; Abnahme AK-2.
4. Batch 1c (Frontend: R5 Trefferquoten, R8, R10, U1, U3).
5. Batch 2 (Owner-Gate, Zusage; S1, S2, S5) — AK-4.
6. Batch 3 (Zusage; Deep-Dive/Watchlisten deskriptiv, MAR-Block).
7. №72 Datenintegrität (D1, D6–D9, D11, D12, D14).
8. **Track Signal-Diskrepanzen, Stufe 1:** Prüfer-Skelett in `uiq-devtools` — nach Batch 1b.
9. Parallel ab Eingang (ca. 05.–08.10.): schriftliche Rückmeldung der Aufsicht gegen Zusagen und Befundregister abgleichen.

Aus `UEBERGABE-2026-09-26.md`/`-28.md` weiterhin offen und nicht bearbeitet: B1/B2/B2b, Zeitsteuerung/FIN-Entkopplung/Watchdog/cron-trigger, **Runner-Pin vor 19.10.**, `mcm_context_downgrades`, №73.

---

## Offene Entscheidungen (Axel)

* **Git-Historie `ko-aggregator` (S6) und Depotangaben (S5/№73):** umschreiben oder belassen — mit Rückmeldung der Aufsicht bzw. Fachanwalt, nicht im Alleingang.
* **H12:** Zielvariable und Testbasis (ETF-Historie) festlegen, bevor präregistriert wird.
* **Sektor-Zuordnung:** GICS-Stammdaten ergänzen oder XL*-Zugehörigkeit als Ersatz (heute 70 % ohne Tag).
* **Export-Funktion** (aus 28.09., weiter offen).
* **Beta-Start** bleibt eigene Entscheidung (regulatorisch nach schriftlicher Rückmeldung, fachlich nach Go-Kriterium 2).

---

## Sonstiges

* Alle Commits dieser Session in UIQ-Suite, uiq-devtools, uiq-archive sowie Axels Commits in ko-aggregator per Byte-/Blob-Vergleich gegen die gelieferten Dateien geprüft.
* Nicht geprüft: Zustand von `uiq-legal` (in dieser Session nicht angehängt).
