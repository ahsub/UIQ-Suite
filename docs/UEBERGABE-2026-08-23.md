# UEBERGABE-2026-08-23.md

Sehr umfangreiche Session — von der ursprünglichen Regime-Modell-Frage bis
zur Options-Modul-Literaturrecherche. Sieben inhaltliche Blöcke, alle live
verifiziert.

---

## 1. regime_v2 — Korrektur, Neuvalidierung, Rollout

**Ausgangsfrage:** Welches von drei/vier konkurrierenden Regime-Modellen
soll Single Source of Truth für UIQ werden.

**Kritischer Fund unterwegs:** Die vielfach zitierte "Sharpe 1,66 vs. 0,63
— regime_v2 validiert"-Notiz war eine Fehlzuordnung. Der Sharpe-1,66-Wert
gehört zum DCE-Score-Ranking-Backtest (Go-Kriterium 2), hat keine
Regime-Dimension. `regime_v2` war vor dieser Session **nie** quantitativ
validiert.

**Faire Neuvalidierung (23.08.):** `regime_v1`/`regime_v2`/5-Faktor-Modell
auf identischer, primärquellenbasierter Datenbasis (CBOE-CDN + SqueezeMetrics,
3.843 Handelstage 2011–2026) verglichen — echte CBOE-Strategie-Indizes
(PUT/BXM/CLL), DSR-Check mit echter n_trials=3.
**Ergebnis:** `regime_v2` schlägt `regime_v1` konsistent (bes. BULL_FRAGILE),
ist beim 5-Faktor-Modell mindestens gleichwertig, bei BULL_FRAGILE klar
besser — bei einfacherer, robusterer Datenbasis.

**Entscheidung:** `regime_v2` ersetzt `market_regime_str` UIQ-weit (Server +
Client). Track-Record: harter Schnitt (alte Tage behalten alte
Klassifikation), keine rückwirkende Umlabelung.

**Umgesetzt und live verifiziert:**
- `classify_regime_v2()` in `market_aggregator.py`, ersetzt
  `market_regime_str`-Block und `determine_mse_regime()` an beiden
  Aufrufstellen
- `ko-market-state.js` v2.4: `determineRegime()` auf dieselbe Formel
  umgestellt, keine VVIX/SKEW-Abhängigkeit fürs Regime mehr
- `REGIME-BACKTEST-VALIDIERUNG.md`: Nachtrag mit Korrektur + Ergebnis
  (nach einem Zwischenfehler — Nachtrag verwies zunächst fälschlich auf
  bereits committete Analyse-Skripte — korrigiert)
- Analyse-Skripte (`build_panel.py`, `classify.py`, `separation_test.py`,
  `economic_test.py`, `dsr_check.py`) nachträglich committet unter
  `ko-aggregator/analysis/regime_compare/`, aus echtem Checkout verifiziert
- Live-Verifikation: Server (`master_market_data` + `daily_market_snapshot`)
  und Client (Badge, `_lastRegime`) zeigen identisches Regime, keine
  Divergenz mehr möglich

---

## 2. Aufräumen nach regime_v2

- Beide toten `determine_mse_regime()`-Blöcke entfernt (287 Zeilen,
  inkl. `_mse_z_score()`/`_mse_percentile_rank()`/Konstanten)
- Veraltete, sich selbst widersprechende Kommentare an beiden
  `classify_regime_v2()`-Aufrufstellen konsolidiert
- `[SNAPSHOT-DIAG]`-Truncation-Logging vom 21.08. entfernt (Zweck erfüllt)
- `market_aggregator.py` → **v5.37.1**

---

## 3. IWV-Holdings-Update + Matching-Bug gefunden und gefixt

- `data/iwv_holdings.csv` aktualisiert (Jul 24 → Aug 20, 2026)
- **Echter Bug gefunden:** iShares hat die Namenskonvention geändert
  (INC/CORP bei ~49% der 2.579 Ticker entfernt) — hätte das bestehende
  15-Zeichen-Substring-Matching in `build_sector_holdings()` bei 122
  Tickern stillschweigend gebrochen (u. a. ROKU, CLOUDFLARE, GITLAB,
  MASTERCARD).
- Fix: `_norm()`-Hilfsfunktion entfernt Rechtsform-Suffixe vor dem
  Vergleich, als zusätzlicher Fallback. 120/122 Fälle gelöst (2 Restfälle
  sind echte Firmenumbenennungen, kein Matching-Bug).
- `market_aggregator.py` → **v5.37.2**
- GHA-Lauf #242 committet und erfolgreich — Sektor-Holdings-Match-Rate
  noch nicht erneut live geprüft (offener Punkt, s. u.)

---

## 4. Rechtsgutachten-Screenshots (Public-Modus)

Fünf Screenshots aufgenommen (Light-Mode, wie gewünscht):
1. Übersicht — Regime-Badge + Sektoren + Strategie-Ampel
2. Morning Briefing — Marktlage/Sentiment (IOS Market Score im Fließtext)
3. Morning Briefing — Top-Kandidaten + WpHG-Disclaimer
4. Alpha Desk — CSP/Wheel-Scan mit objektiven Filterkriterien
5. Deep-Dive TGT — MARKTLAGE/SETUP-BEWERTUNG/EINSCHÄTZUNG, deskriptiv

Vorherige Formulierungs-Fixes (18.08., "SELEKTIV KAUFEN" → "OFFENSIV —
Trendfolge & Breakouts begünstigt") live bestätigt aktiv.

---

## 5. Deep-Dive-Crash gefunden und in beiden Modi behoben

**Nebenfund beim Screenshot-Machen:** `generateDeepDiveKI()` crashte für
**alle 14 Strategien in beiden Modi** — eine tote Zeile
(`strat.focus.join('\n')`, Ergebnis nirgends verwendet) crashte
unconditional, weil `KoPrompts.STRATEGIES` seit der Umstellung auf
`.prompt()`-Funktionen kein `.focus`-Array mehr hatte.

**Public-Modus-Fix:** Tote Zeile aus `index.html` entfernt. → **v476**
**EIC-/Expert-Modus-Fix:** Allen 14 Strategien ein `focus`-Array ergänzt
(3 Analysepunkte + 1 Risikopunkt, aus vorhandenem Strategie-Wissen
abgeleitet) in `ko-prompts.js` → **v2.5.6**
**CDN-Pin-Nachzug:** Pin für `ko-prompts.js` in `index.html` war
eingefroren (`caa701f`), nicht mitgezogen — nachgezogen auf `9dcf33b`.
→ **v477**

**Vollständig live verifiziert, beide Modi:** Echter Klick-Durchlauf gegen
TGT — Public-Modus deskriptiv mit Disclaimer, Expert-Modus mit allen 5
Punkten (inkl. der neuen `focus`-Inhalte) und konkreter Handlungsempfehlung.

---

## 6. Options-Modul — Literaturrecherche (6 Bücher)

Axel hat 6 Bücher zur Verfügung gestellt, alle auf Verwendbarkeit geprüft:

| Buch | Verdikt |
|---|---|
| Jansen, ML for Trading | Zu allgemein, für Regime-Forschungsprojekt ggf. später relevant |
| **Friedenheim, Optionen mit Köpfchen** | Kap. 9 (Reparaturen/Rollen) → Options-Doktor-Konzept |
| Chen/Sebastian, Option Trader's Hedge Fund | Kap. 9 → Multi-Leg-Strategien-Konzept |
| Lowell, Get Rich with Options | Zweitquelle für Credit-Spread-Zahlen, kein Primärquelle-Kandidat |
| Harris, Trading and Exchanges | Kein Options-Buch, zurückgestellt |
| Van Der Post, Butterfly Spread | Intro generisch, aber Kap. 5 hat substanziellen Python-Pricing-Code — für spätere Backtest-Komponente vorgemerkt |
| **Sinclair, Positional Option Trading** | Stärkster Fund — empirische Edge-Faktoren, teils mit vorhandenen UIQ-Daten sofort nutzbar |

**Drei Konzeptdokumente erstellt** (alle als Download bereitgestellt,
nicht committed):
1. `options-doktor-konzept.md` — Reparatur-Entscheidungsbaum
   (Friedenheim), inkl. Mermaid-Flowchart + `ko-prompts.js`-Skizze
2. `multileg-strategien-konzept.md` — Vertical Spread/Iron Condor/Iron
   Butterfly/Calendar/Ratio Spread (Chen), inkl. kritischem Scope-Hinweis:
   alle fünf brauchen echte Optionsketten-Daten, die UIQ nicht hat
3. `sinclair-edge-faktoren.md` — VIX-Terminstruktur-Signal,
   VVIX-Perzentil-Signal, Earnings-Vola-Effekte, Fundamentalfaktoren,
   Kelly-Sizing — mehrere Punkte mit vorhandenen UIQ-Daten sofort
   umsetzbar, plus ein wichtiger Gegenpunkt zur "Reparatur"-Terminologie
   im Options-Doktor-Konzept

---

## Infrastruktur-Stand (23.08.2026 Abend)

| Komponente | Version |
|---|---|
| `ko-aggregator/market_aggregator.py` | v5.37.2 |
| `ko-modules/ko-market-state.js` | v2.4 |
| `ko-modules/ko-prompts.js` | v2.5.6 |
| `axel-scanner/index.html` | v477 |
| `data/iwv_holdings.csv` | Aug 20, 2026 |
| `UIQ-Suite/docs/REGIME-BACKTEST-VALIDIERUNG.md` | Nachtrag 23.08. |
| Letzter verifizierter GHA-Lauf | #242 ✅ |

---

## Offene Punkte für morgen

1. **Sektor-Holdings-Match-Rate nach IWV-Update noch nicht live geprüft**
   — sollte nach dem nächsten GHA-Lauf verifiziert werden (Soll: ≥93%,
   mit dem `_norm()`-Fix eher besser).
2. **Options-Doktor-Konzept:** Offene Frage aus dem Dokument — wie kommen
   Positionsdaten rein (manuelle Eingabe vs. neues UI-Formular)? Noch
   nicht entschieden.
3. **Multi-Leg-Strategien (Iron Condor etc.):** Grundsatzfrage offen —
   ATR-Näherung wie bei `collar`, oder echten Optionsketten-Feed
   anbinden? Nichts davon sollte ohne diese Entscheidung umgesetzt werden.
4. **Sinclair-Priorisierung:** VVIX-Perzentil-Signal und
   VIX-Terminstruktur-als-Handelssignal (nicht nur Regime-Input) sind mit
   vorhandenen Daten sofort umsetzbar — guter Einstiegspunkt fürs
   Options-Modul, falls morgen daran weitergearbeitet wird.
5. **Alte `determine_mse_regime()`-Funktionsdefinitionen** (nicht die
   Aufrufstellen, die sind weg) könnten bei Gelegenheit noch entfernt
   werden — aktuell bewusst als toter Code stehen gelassen.
6. Konzeptdokumente (Options-Doktor, Multi-Leg, Sinclair) sind **nicht
   committed**, nur als Downloads verfügbar — bei Bedarf noch ins Repo
   aufnehmen (z. B. `UIQ-Suite/docs/`).

---

## Analyse-Skripte / Reproduzierbarkeit

`ko-aggregator/analysis/regime_compare/` — vollständig committet und aus
frischem Checkout verifiziert, README mit Ablaufreihenfolge vorhanden.

---

## Nachtrag — Plan für 24.08.2026 (Abendabsprache)

**Schwerpunkt morgen: Options-Modul weiter, zwei zusammenhängende Stränge:**

1. **Zweistufiges Sieb-Verfahren für Multi-Leg-Kandidaten** (löst das
   "alle 700+ Ticker brauchen Volatilitätsdaten"-Problem):
   - Stufe 1 (günstig, alle Ticker): Vorfilterung rein aus bereits
     vorhandenen Aggregator-Daten (HVP, Score, Regime-Kompatibilität) —
     analog zum bestehenden CSP/Wheel-Filter (`HVP≥50%` etc.)
   - Stufe 2 (teuer, nur Shortlist): Erst hier echte Optionsketten-Daten
     laden (Delta/Strike, IV-Skew, Bid/Ask, OI) — löst direkt "Abschnitt 0"
     aus `multileg-strategien-konzept.md` (fehlende Chain-Daten)
2. **CapTrader-Anbindung etablieren:**
   - Klärungspunkt: CapTrader ist IBKR-Introducing-Broker, keine eigene
     API — läuft über TWS-API (`ib_insync`/`ib_async`, braucht laufendes
     TWS/IB Gateway) oder IBKR Web API (REST, Client Portal Gateway)
   - Wichtig für die Einbindung in den bestehenden GHA-Lauf (headless,
     läuft nicht auf Axels eigenem Rechner) — welcher Weg ist
     GHA-tauglich?
   - Sobald etabliert: direkte Grundlage für Stufe 2 des Siebs oben
