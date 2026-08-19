# Übergabeprotokoll — 2026-08-18

**Fokus des Tages:** Literaturrecherche zu Marketstate-Prognose-Instrumenten,
Ableitung eines Backlogs für UIQ, Wiederherstellung und Validierung zweier
verlorener Analyse-Skripte (`voranalyse_regime.py`, `regime_v2_backtest.py`)
gegen echte Daten.

**Bezug SUITE.md §4:** Ergänzende Arbeit außerhalb des Track-Record-
Kernbetriebs (UIQ Phase 0 bleibt Lead-Projekt). Kein Eingriff in
`market_aggregator.py` oder die laufende Produktion.

---

## 1. Literaturrecherche: Marketstate-Prognose-Instrumente

Ausgangspunkt war eine Gemini-Zusammenfassung zum Wert von Konjunkturdaten
für die Marktregime-Prognose. Mehrere darin zitierte Studien wurden über
Websuche und Volltext-Verifikation (teils via Claude in Chrome direkt am
PDF/HTML) gegengeprüft:

| Quelle | Kernbefund | Verifikationsstatus |
|---|---|---|
| Miyashita, Sakemoto, Yamamoto (2026), *Finance Research Letters* | Hochfrequente japanische Konsumdaten sagen Equity-Risikoprämien voraus; Market-Timing-Strategie erhöht Sharpe Ratio um 0,27/Jahr | ✅ am Volltext bestätigt (Highlights-Zitat exakt) |
| Bustarviejo et al. (2026), *Financial Innovation* | Cross-sektionale Marktzustands-Repräsentation (MSE-1) schlägt Kalman-Zeitreihenmodell für DJ, nicht für Nasdaq-100 — regimeabhängig | ✅ am Volltext bestätigt; für UIQ nur indirekt relevant (anderes "State"-Konzept als Regime-Klassifikation) |
| Xie, Wu, Sun, Wang (2025), *De Gruyter SNDE* | Realized Probability Index informativer als 0/1-Binärindikator, vorhersagbarer als reine Rendite | ✅ am Volltext bestätigt |
| Haase & Neuenkirch (2021), CESifo WP 8828 | Markov-Switching mit 115 Makro-/Finanz-Diffusionsindizes erreicht AUC=0,828 bei S&P-500-Regime-Klassifikation | ✅ AUC-Wert direkt aus Google-Snippets des PDFs bestätigt; exakter Prognosehorizont ("2-6 Monate") nicht abschließend verifizierbar |
| Pagliaro (2026), *Electronics/MDPI* 15(6):1334 | Regime-Aware LightGBM: Rolling-HMM (kein Look-Ahead), BTC als stärkstes Ablations-Feature, Deflated-Sharpe-Ratio-Reporting | ✅ am Volltext bestätigt, methodisch am nächsten an UIQ-Stack |

**Wichtige Einordnung:** Eine ungeprüfte Folgeaussage in derselben
Gemini-Kette (Scoring-Formel mit Gewichten w1=0.3/w2=0.2/w3=0.3/w4=0.2 aus
VIX/Credit-Spreads/IVR/Term-Structure) wurde am selben Tag als **nicht
verifizierbare Eigenkonstruktion** identifiziert — die zitierten
Basis-Paper (Whaley 2000, Gilchrist & Zakrajšek 2012, Estrella & Mishkin
1998, Bates 1991) sind real, die konkreten Gewichte/Schwellenwerte sind
das jedoch nicht. **Nicht ungeprüft in eine UIQ-Scoring-Formel übernehmen.**

---

## 2. Backlog abgeleitet (`docs/Backlog-marketstate-2026-08-18.md`)

Vier Einträge basierend auf Pagliaro (2026), da methodisch am nächsten am
UIQ-Stack:

1. **Rolling/Online HMM** als zusätzlicher Regime-Klassifikator neben dem
   bestehenden Z-Score-Modell (Aufwand: ~4-6h Prototyp + 1-2 Sessions
   Vergleichsbacktest). Voraussetzung vor Umsetzung: Klären, ob die
   Produktionsklassifikation überhaupt ein Look-Ahead-Problem hat.
2. **BTC als Cross-Asset-Feature** (Aufwand: ~1-2h Datenanbindung + Check).
   Vorbehalt: Effekt in der Quelle spezifisch für High-Beta-Tech-Einzeltitel
   (NVDA/TSLA/AMD/MSTR), nicht automatisch auf SEPA-Screening-Universum
   übertragbar — Korrelationscheck nötig vor Umsetzung.
3. **Validierung der 7 Makroindikatoren** gegen Revisionsarmut/Frequenz-
   Prinzip aus Pagliaro (2026) (Aufwand: ~30-60 Min, kein Code). **Für
   heute (19.08.2026) geplant.**
4. **Deflated Sharpe Ratio** im Backtest-Reporting (`deflated_sharpe_ratio.py`,
   nach Bailey & López de Prado 2014).

---

## 3. Erster DSR-Testlauf mit echten DIX/GEX-Rohdaten

Vereinfachte GEX<0-Override-Strategie (Long bei GEX≥0 Vortag, sonst Cash)
gegen die hochgeladene DIX/GEX-Zeitreihe (2011-05-03 bis 2026-08-14, 3.844
Handelstage) getestet:

| | Sharpe Ratio | Deflated Sharpe Ratio |
|---|---|---|
| GEX<0-Override (vereinfacht) | 0,76 | 0,00 (n_trials=10, geschätzt) |
| Buy & Hold (Referenz) | 0,75 | 1,00 (n_trials=1) |

**Befund:** Die vereinfachte Override-Regel unterscheidet sich kaum von
Buy & Hold (91 % der Tage "long"). Nach Mehrfachtest-Korrektur verliert
sie die Signifikanz gegenüber der Referenz. **Nur ein Plausibilitätstest**
— `n_trials` geschätzt, kein Abgleich mit echtem `regime_v2_backtest.py`-
Output zu diesem Zeitpunkt möglich (siehe Abschnitt 4).

---

## 4. Wiederentdeckung: `regime_v2_backtest.py` fehlte im Repo

Bei dem Versuch, `deflated_sharpe_ratio.py` gegen den echten Track-Record
des GEX<0-Backtests zu validieren, stellte sich heraus: **Weder
`regime_v2_backtest.py` noch `voranalyse_regime.py` waren jemals
committed worden** — beide existierten nur im Chatverlauf einer früheren
Session sowie als Ergebnisdateien lokal bei Axel
(`~/voranalyse_output/`, `~/regime_v2_output/`).

### Rekonstruktion aus dem Chatverlauf

Beide Dateien wurden per `conversation_search` aus dem Original-Chatverlauf
rekonstruiert, mit expliziter Konfidenz-Kennzeichnung pro Funktion (hoch /
mittel / Lücke) im Kommentarblock jeder Datei. Wichtigster Fund: Das
`FRED_SERIES`-Dict mit allen 6 echten FRED-Series-IDs wurde wörtlich aus
einem echten Fehlerlog derselben Original-Session rekonstruiert (HTTP-400-
Meldungen zeigten die Series-IDs korrekt in der angefragten URL):

| Key | FRED-Series-ID | Lag | Frequenz |
|---|---|---|---|
| nfci | NFCI | 7 Tage | wöchentlich |
| core_cpi_yoy | CPILFESL | 15 Tage | monatlich |
| sahm_rule | SAHMREALTIME | 5 Tage | monatlich |
| oecd_cli | USALOLITOAASTSAM | 45 Tage | monatlich |
| heavy_truck | HTRUCKSSAAR | 20 Tage | monatlich |
| hy_spread | BAMLH0A0HYM2 | 1 Tag | täglich |

**Lücken, nicht rekonstruiert:** Die drei Kern-Analysefunktionen in
`voranalyse_regime.py` (Korrelation/VIF, Random-Forest-Feature-Importance,
Granger-Kausalität) sowie `main()` fehlen — dafür reichte die im
Chatverlauf auffindbare Textmenge nicht für eine verantwortbare
Rekonstruktion.

### Lokaler Validierungslauf mit Axel — zwei echte Bugs gefunden

**Bug 1 (in `voranalyse_regime.py`, `fetch_yf_series()`):**
`yf.download()` lieferte für den Ticker `^VIX3M` nur 1 Zeile (aktueller
Tag) statt der vollen Historie, während `^VIX` mit identischem Code
korrekt 3845 Zeilen lieferte — Ursache: ticker-spezifische Eigenart
dieser yfinance-Version. Per direktem Vergleichstest (`yf.Ticker(ticker)
.history()` vs. `yf.download()`) bestätigt und behoben: Umstellung auf
`yf.Ticker().history()`, das für `^VIX3M` 3826 Zeilen lieferte.

**Bug 2 (in `regime_v2_backtest.py`, `analysis_b_separation()`):**
Die Monotonie-Prüfung sortierte alle vier Trennschärfe-Metriken mit
derselben Richtung (`ascending=False`). Korrekt für Volatilität (höherer
Wert = riskanter), aber falsch für Max-Drawdown (stärker negativer =
kleinerer Wert = riskanter). Fix: metrikspezifisches
`ASCENDING_FOR_RISK_DESCENDING`-Mapping eingeführt.

### Validierungsergebnis nach beiden Fixes

Panel: 3826 Handelstage, 2011-05-02 bis 2026-08-18 (Ergebnis archiviert
in `analysis/VALIDIERUNGSLAUF-2026-08-18.json`).

**Analyse A (2022-Fokus) — Abgleich mit bereits dokumentierten Werten aus
`REGIME-BACKTEST-VALIDIERUNG.md`:**

| Kennzahl | Original-Dokumentation | Neuer Lauf | Match |
|---|---|---|---|
| Handelstage 2022 | 251 | 251 | exakt |
| v1 STRESS_UNSTABLE-Tage | 1 | 1 | exakt |
| Reklassifizierte Tage | 35 (13,9%) | 35 (13,9%) | exakt |
| Reklassifiziert: Ø Fwd-Drawdown 21d | −5,0% | −4,89% | nah |
| Nicht reklassifiziert: Ø Fwd-Drawdown 21d | −6,1% | −5,99% | nah |

**Analyse B (Trennschärfe gesamt, nach Bugfix):**

| Metrik | v1 | v2 | Original sagt | Match |
|---|---|---|---|---|
| fwd_maxdd_21d monoton | true | true | "bereits korrekt geordnet" (beide) | exakt |
| fwd_maxdd_63d monoton | false | false | "falsch geordnet" (beide) | exakt |
| fwd_vol_63d monoton | false | false | "falsch geordnet" (beide) | exakt |
| fwd_vol_21d monoton | false | true | — | einzige Abweichung, ändert Kernaussage nicht |

**Gesamtbewertung:** Rekonstruktion ist inhaltlich validiert. 8 von 9
geprüften Kennzahlen/Flags stimmen exakt oder nahezu exakt mit der
bereits vor dem Datenverlust dokumentierten Original-Aussage überein.

---

## 5. Finaler Repo-Stand (verifiziert)

Neuer Ordner `ahsub/ko-aggregator/analysis/`, alle Dateien committed und
gegen den GitHub-Stand geprüft (Syntax-Check, Import-Kette,
Synthetik-Smoketest — alle bestanden):

- `README.md` — Kontext, Dateiliste, Validierungsstatus
- `voranalyse_regime.py` — mit Bugfix 1
- `regime_v2_backtest.py` — mit Bugfix 2
- `deflated_sharpe_ratio.py` — unverändert, DSR-Funktion für Backtest-Reporting
- `VALIDIERUNGSLAUF-2026-08-18.json` — archivierte Ausgabe des finalen Laufs

Backlog-Dokument: `ahsub/UIQ-Suite/docs/Backlog-marketstate-2026-08-18.md`

**Hinweis zur Nachnutzung:** `voranalyse_regime.py` ist trotz Validierung
nicht eigenständig ausführbar (fehlende Analysefunktionen, s. Abschnitt 4).
Für eine vollständige Neuauflage der multivariaten Voranalyse müssten
diese drei Funktionen neu geschrieben werden — die Ergebnisse der
ursprünglichen Analyse (GEX Rang 2 Feature-Importance, oecd_cli-
Kollinearität mit core_cpi_yoy) bleiben unabhängig davon in
`REGIME-BACKTEST-VALIDIERUNG.md` gesichert.

---

## 6. Offene Punkte / Nächste Schritte

- **Für heute (19.08.2026) vorgesehen:** Backlog-Eintrag 3 — Prüfen, ob
  die 7 Makroindikatoren tatsächlich revisionsarm/tagesaktuell sind
  (Abgleich gegen das in Pagliaro 2026 beschriebene Selektionsprinzip).
  Reine Dokumentationsarbeit, kein Code.
- Backlog-Eintrag 1 (Rolling HMM): Vorab-Check noch offen, ob die
  Produktionsklassifikation ein Look-Ahead-Problem hat.
- Backlog-Eintrag 2 (BTC-Feature): Korrelationscheck fürs SEPA-Screening-
  Universum noch offen.
- Optional, nicht priorisiert: Exakte Original-Formel für `fwd_vol_Nd` in
  `build_v1_v2()` finden, um die letzte kleine Abweichung (`fwd_vol_21d`-
  Flag) aufzuklären — nicht kritisch für die Kernaussage.
- **Erinnerung:** *Hast du das verifiziert oder übernommen?* — Für alle
  Angaben zu FRED-Series-IDs, Bugfixes und Validierungswerten in diesem
  Protokoll gilt: direkt am Volltext/Code/Testlauf geprüft, nicht aus
  einer Zusammenfassung übernommen.
