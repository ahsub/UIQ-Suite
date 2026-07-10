referenz: siehe UEBERGABE-HEADER-TEMPLATE.md (ahsub/UIQ-Suite/docs/) — Pflicht-Header,
an den Anfang jeder neuen Session-Verarbeitung dieses Protokolls zu stellen.
Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.

---

# ÜBERGABEPROTOKOLL — 10.07.2026 (Freitag)

**Session-Spanne:** ca. 06:30 Uhr bis 22:15 Uhr (mit Unterbrechungen: Praxis/Arztarbeit,
Mittagspause-Arbeit, Präsentationsvorbereitung)
**Frontend:** v273 → **v297** (axel-scanner, Cloudflare Pages)
**Aggregator:** v4.7 → **v4.9** (ko-aggregator)
**Anlass für morgen:** UIQ-Vorstellung vor kleinem Publikum, 11.07.2026 14:00 Uhr

---

## 1. GRÖSSTER FORTSCHRITT DES TAGES: Echter DIX via FINRA-API

Nach initialer Datenqualitäts-Arbeit am Vormittag/Nachmittag entstand am Abend aus
einem Pine-Script-Brainstorming (Freund von Axel schickte 8+ GEX/DIX-Indikatoren zur
Bewertung) der Durchbruch beim seit Wochen ungelösten DIX-Problem:

- **FINRA hat die alte `.txt`-Datei-Methode (regsho.finra.org) durch eine offizielle,
  dokumentierte REST-API mit OAuth2 ersetzt** — `regShoDaily`-Dataset, Credential-Typ
  "Public" (kostenlos, für Einzelnutzer ohne FINRA-Mitgliedschaft vorgesehen).
- Axel hat sich registriert (`developer.finra.org`), Client ID + Secret erstellt,
  beide als GitHub Secrets gesetzt (`FINRA_CLIENT_ID`, `FINRA_CLIENT_SECRET`).
- Nach drei Iterationen (Feldnamen erraten → falsch, HTTP 400 → GET ohne Filter,
  Ticker nicht gefunden → Pagination + richtige Feldnamen aus Metadata-Diagnose)
  **läuft `fetch_finra_dix()` in Produktion und liefert echte Werte:**

```
DIX (ETF-Korb SPY/QQQ/IWM/DIA): 57.38%
├─ SPY: 54.82%  │  QQQ: 62.59%  │  IWM: 55.58%  │  DIA: 66.54%
```

**⚠️ Wichtige methodische Einordnung (noch nicht in UI/Prompt umgesetzt — siehe §4):**
Dieser Wert ist **strukturell höher** als SqueezeMetrics' klassischer DIX (dort ~35-50%),
weil wir nur 4 hochliquide ETFs messen statt ~550 S&P-500-Einzelaktien. ETFs haben
bekanntermaßen einen überdurchschnittlichen Dark-Pool-Anteil. **Nicht 1:1 mit
"dem echten DIX" vergleichbar — muss im Label klar als "DIX-ETF-Proxy" ausgewiesen
werden**, sonst wiederholen wir das Mislabeling-Muster, das wir heute selbst an
anderer Stelle (Volumen-Heuristik in ko-darkpool.js) korrigiert haben.

**Code-Status:** `fetch_finra_dix()` + `_finra_get_token()` in `market_aggregator.py`
(Commit `c349b8e0ea`), schreibt in `master["market"]["dixGex"]["dix"]` +
`dixSource: "finra_regshodaily"` + `dixPerTicker`. **Von mir (dieser Session) via
drei echte Testläufe verifiziert (run#78, #79, #80, #81) — nicht nur behauptet.**

---

## 2. OFFEN FÜR MORGEN (nach der Präsentation) — höchste Priorität

### 2a. FINRA-DIX ins Frontend einbauen
- UI-Label in `ko-darkpool.js`/Dark-Pool-Tab: "DIX (ETF-Korb)" statt nackt "DIX",
  mit Tooltip zur Methodik-Einschränkung (siehe §1)
- Zurück in den KI-Prompt aufnehmen (Morning Briefing + Dark-Pool-KI) — diesmal mit
  **echten** Daten statt der Heuristik, die wir heute Nachmittag bewusst ausgeschlossen
  hatten (Option B, siehe §3). Klar kennzeichnen: "n=4 ETFs, nicht S&P-500-Breite"
- Prüfen: lohnt sich Ausweitung auf mehr Ticker (Pagination ist bereits gebaut,
  aber mehr Seiten = mehr API-Calls = ggf. Rate-Limit-Rücksicht, 10GB/Monat-Limit
  laut FINRA-Doku für Public-Tier nicht explizit genannt — im Zweifel klein anfangen)

### 2b. Minervini-Trend-Score aufwerten (Axels expliziter Wunsch, PARETO-PRÜFUNG NÖTIG)
Aus dem gleichen Pine-Script-Review: das Script "Trend Score" (#2 von 8) hat ein
**vollständiges 7-Kriterien-Minervini-Trend-Template + explizite Weinstein-Stage-
Klassifikation** — UIQs bestehender `score_long_minervini()` (market_aggregator.py,
Zeile ~1167) nähert das nur an (bbPos/HVP-Proxy statt echter VCP-Kontraktion,
kein explizites Stage-2/3/4-Modell). **Vor dem Bauen: Pareto-Check** — wie viel
Verbesserung bei Scan-Qualität ggü. Aufwand? Nicht blind übernehmen, erst bewerten.
(Kein Code heute geschrieben — reine Vormerkung.)

### 2c. Cloudflare Cron-Trigger deployen
Code + `wrangler.toml` liegen in `ahsub/workers/cron-trigger/` (committed heute,
~Vormittag). **Noch nicht deployed** — Axel muss `wrangler secret put GITHUB_PAT`
und `TRIGGER_TOKEN` setzen, dann `wrangler deploy`. Grund: GitHub Actions' eigener
Scheduler ist zweimal in Folge (Nacht 08./09.07. und 09./10.07.) ausgefallen
("Best Effort", kein Fehler-Log). **Von mir verifiziert:** kein `schedule`-Event-Lauf
in den GitHub-Actions-Logs der letzten 10 Läufe zum jeweiligen Ausfallzeitpunkt.

### 2d. ko-ai-worker.js Rate-Limit dauerhaft lösen
Heute Vormittag temporär `morning: 2 → 20` gesetzt (Axel hat selbst `wrangler deploy`
ausgeführt, bestätigt funktionierend). **Sauberere Lösung noch offen:** Axels
Owner-Subject-Hash über `/logs?token=OWNER_TOKEN&rl=1` ermitteln und in
`RATE_LIMIT_EXEMPT_HASHES` eintragen, damit Betreiber-Testen nie wieder gegen
Beta-Tester-Limits läuft. Aktuell nur der pragmatische Sofort-Fix aktiv.

---

## 3. HEUTE ABGESCHLOSSENE ARBEIT (verifiziert, nicht nur behauptet)

### Vormittag/früher Nachmittag — Datenfundament & Bugfixes
- **v273-v278**: Zeitrahmen-Leiste, Eigener-Ticker-Feld, Winners/Losers-Spalten,
  KV-Badge entfernt, Scanner-Hint dynamisch, Home-Tab Versionsnummer + Briefing-Button
- **v279-v283** (aus vorheriger Session, hier nur zur Kenntnis genommen — **nicht von
  mir heute verifiziert**, laut Header-Regel als Fremdbehauptung markiert)
- **Aggregator v4.9**: Market-Snapshot (17 Symbole, Single Source of Truth),
  Z-Scores/Perzentile (252 Handelstage) für VIX/VVIX/SKEW/Ratio, SKEW/VVIX-Divergenz-
  Detektor, FRED-Makrodaten (HY-Spread, Net Liquidity+Trend, echte 10J-2J-Zinskurve
  via DGS2/DGS10/DGS3MO), MOVE Index — **alle von mir gegen echte Aggregator-Läufe
  verifiziert (mehrere JSON-Artefakte geprüft)**
- **Kritischer Bugfix:** `ko-prompts.js` hatte nie einen Script-Tag — Anti-
  Halluzinations-Modul lud seit Einführung nie. Gefunden und gefixt (v286).
- **Kritischer Bugfix:** Doppeltes Komma in `IM_TICKERS`-Array erzeugte ein
  `undefined`-Array-Element, das `loadIntermarket()`/Morning Briefing zum Absturz
  brachte. Gefunden via Node-Array-Test (0 undefined-Elemente danach bestätigt), v291.
- **Kritischer Bugfix:** Scan-Button-ID-Mismatch (`scan-run-btn` vs. erwartetes
  `scan-btn`) — Folgefehler eines eigenen Fixes vom Vortag, v293.
- **Kritischer Bugfix:** KI-Fehler wurde als "erfolgreiches" Briefing gecacht
  (Fehlertext in derselben Variable wie echter Inhalt) — `kiBriefingFailed`-Flag
  eingeführt, v292.
- **Kritischer Bugfix:** Tearsheet-Strategie-Pills zeigten "undefined" für 6 von 11
  Strategien (vierte(!) unabhängige, veraltete Label-Map im Code gefunden) — v297.
  **Von Axel selbst per Screenshot entdeckt, nicht von mir.**
- Lithium-ETF-Mislabeling (LIT als "Lithium" verkauft), USO-ETF als "WTI Öl",
  toter Lumber-Ticker entfernt bzw. korrigiert — alle drei am Vormittag gefunden
  und gefixt, gegen Axels Grundsatz "kein Wert ohne verifizierte Herkunft".

### Nachmittag — Prompt-Tiefe-Review (Axels expliziter Auftrag)
- **DIX/GEX-Volumen-Heuristik in `ko-darkpool.js` gefunden**: 50% Gewichtung im
  Dark-Pool-Score aus einer erfundenen OBV/Volumen-Formel, keine echte Datenbasis.
  **Axel-Entscheidung (Option B):** behalten, aber ehrlich umbenannt ("Volumen-
  Heuristik"), Gewichtung auf 15% gesenkt, aus KI-Prompts komplett ausgeschlossen.
  v295, `ko-darkpool.js` v1.3.
- Tote Registry-Einträge (`pcr_z`, `gex_proxy` in `ko-indicators.json`) entfernt,
  waren seit dem zScore-Null-Fix permanent `null` mit irreführendem "DIX-Proxy"-
  Framing. Registry v1.0.1, v296.
- **GEX-SCHEMA.md** (aus paralleler Session "GEX-Sidekick") gefunden, verifiziert
  gegen Aggregator v4.9 (§7-Punkt 1 abgehakt), auf v0.3 aktualisiert, erstmals
  ins Repo committed (`ko-aggregator/docs/GEX-SCHEMA.md`).

### Abend — Präsentation + Pine-Script-Recherche
- **Präsentation "Strategie & Roadmap" für 11.07.2026** erstellt und committed
  (`ahsub/uiq-presentations/2026-07-11-uiq-strategie-roadmap.html`, 17 Slides,
  gleiches visuelles Gerüst wie 06.07., Inhalt komplett aktualisiert).
- 12+ Pine-Scripts von Axels Freund gesichtet (GEX-Wall-Renderer, Market-Profile,
  Prism-Intelligence-SPX, mehrere "DarkPool"-Fehlbenennungen, schließlich der
  entscheidende FINRA-Fund, siehe §1).
- **Backlog SUITE.md** auf v1.6 fortgeschrieben: Punkt №11 (MSE vs. IOS-Score-
  Widerspruch-Kommunikation), Punkt №12 (UIQ-eigener Breadth-Oszillator aus
  678-Ticker-Eigenbestand statt externer Advance/Decline-Quelle).

---

## 4. WAS NICHT VERGESSEN WERDEN DARF

1. **DIX-ETF-Proxy-Label korrekt setzen**, bevor er sichtbar/promptrelevant wird
   (siehe §2a) — sonst Wiederholung des heute selbst korrigierten Fehlers.
2. **Vier Kopien derselben Strategie-Label-Map** existieren weiterhin im Code
   (nur die betroffenen zwei wurden repariert, nicht konsolidiert). Technische
   Schuld, kein akuter Bug — für einen ruhigeren Sprint vormerken.
3. Pattern/Entry-Engine (`ios_pattern_entry_engine.py`, aus dem Mittagspause-
   Sprint mit dem 8-Pine-Script-Framework eines anderen Freundes) liegt fertig
   portiert und gegen synthetische Daten verifiziert im Repo — **noch nicht in
   `process_ticker()` eingehängt.** Eigene Entscheidung nötig: ersetzt/ergänzt sie
   `score_long_minervini()`?
4. FlashAlpha-Quota (Free Tier, 5/Tag) war heute mehrfach bei 0 wegen Testerei —
   morgen früh automatisch wieder bei 5/5, kein Handlungsbedarf.

---

## 5. STANDING INSTRUCTIONS (unverändert, zur Erinnerung)

- Claude soll proaktiv daran erinnern: **"hast du das verifiziert oder übernommen?"**
  bei jeder Wiedergabe von Übergabeprotokoll-Behauptungen ohne eigene Prüfung.
- SUITE.md ist Single Source of Truth für Backlog/Roadmap-Entscheidungen.
- Kein Bau vor Verifikation — Grundsatz gilt unverändert für morgen.

---

*Ende Übergabeprotokoll 10.07.2026. Nächste Session: bitte §1 (FINRA-DIX-Methodik-
Label) und §2b (Minervini-Pareto-Check) zuerst behandeln, dann Präsentation morgen
14:00 Uhr abwarten/nachbereiten.*
