# UIQ — Übergabeprotokoll 24.09.2026 → TT.MM.JJJJ

**Datum:** 24.09.2026
**Status:** ENTWURF — wird am Session-Ende komplettiert
**Zweck:** Übergabe der GitHub-Recherche (Owner Earnings / Infrastruktur) und der daraus beschlossenen Pareto-Roadmap (SUITE.md №69, v4.27) an die nächste UIQ-Session

---

<!-- PFLICHT-HEADER: hier unverändert aus docs/UEBERGABE-HEADER-TEMPLATE.md einfügen.
     (Template lag dieser Session nicht vor — bewusst nicht nachgebaut.) -->

[PFLICHT-HEADER aus `UEBERGABE-HEADER-TEMPLATE.md` einfügen]

---

## 1. Ergebnis dieser Session (Kurzfassung)

- 16 öffentliche GitHub-Repos zu Owner Earnings / Buffett-/Value-Tools gesichtet. Code und Inhalte jeweils selbst gelesen, **nichts ausgeführt**.
- Pareto-Auswahl gemeinsam mit Axel beschlossen und als **SUITE.md №69** verankert (Version 4.26 → 4.27).
- Leitlinie: **Beweisbarkeit und Determinismus vor neuen Features.**
- Sicherheitsfund: ein Repo war Malware (s. Abschnitt 4).

## 2. Beschlossene Reihenfolge (verbindlich, Details in SUITE.md №69)

| Schritt | Inhalt | Aufwand (Schätzung) | Status |
|---|---|---|---|
| 0 | Abschnitt-7/8-Templating fertigstellen und testen (Restpunkt `finalizeStrategyResult()`) | offen | läuft (Stand in dieser Session **nicht** im Code verifiziert) |
| A | Aggregator-Robustheit: RUN ≠ DATA ≠ DATA QUALITY SUCCESS; relative Mindestabdeckung vor KV-Write; Same-Date-Fallback; Heartbeat. Dazu Point-in-Time-Regel in der Fair-Value-Spec | ~1 Session | offen |
| B | Faber-10M-SMA vs. VIX3M/VIX-Gate vs. Buy-and-Hold, ohne Tuning, Erfolgskriterium vorab fixiert | ~0,5–1 Session | offen |
| C | Automatische Feldprüfung in `uiq-devtools` (PASS / MISSING / AMBIGUOUS) | ~1 Session | offen |
| D | JSON-Sidecar + deterministischer Prüfer (LLM liefert nur Behauptungen, Code setzt `match`) | ~1,5–2 Sessions | offen |

**Vor Schritt B schriftlich festzulegen:** Zeitraum (18.09.2009–05.08.2026), Faber-Regel (SPY-Monatsschluss, Umsetzung Folgemonat), Kostenannahme, Kennzahlen (Sharpe, Max Drawdown, Umschlag) und Entscheidungsregel.

## 3. Stoffsammlung (Bewertung je Repo)

| # | Repo | Lizenz | Urteil | Verwertbar für UIQ |
|---|---|---|---|---|
| 1 | ChenFindling/tragic-algebra-analyzer | keine | **Kern (Stufe C)** | SBC-Korrektur Ω, OE = N + G − Ω; implizite Rendite (IVB); EDGAR-Regeln (Jahresberichte, 330–400 Tage, Tag-Rangfolge mit Auffüllen, Splits); Look-ahead-Hinweis |
| 2 | TurtleDaddy69/owner-earnings-dcf | keine | streichen | nur Sensitivitätsmatrix als UI-Idee; OE-Definition fachlich falsch |
| 3 | quyaoshun/value-investing-research | keine | **Kern (Stufe B/C)** | Selbstwiderlegung mit Kippschwelle; Realitätsanker; [R]/[C]/[E]/[3P]-Kennzeichnung; Unsicherheit nicht im Diskontsatz verstecken |
| 4 | rogerbartumeu/quantamental-equity-value-screener | MIT | Randnotiz | zinsabhängige FCF-Hürde (nur README); README ≠ Code |
| 5 | 1998x-stack/buffett-value-investing | keine | streichen | Persona, direktiv; Owner-Earnings-Quelle falsch datiert (1984 statt 1986) |
| 6 | michaelgiovannisie/WormToDragon | keine | Randnotiz | Endwert doppelt (ewige Rente vs. Exit-Multiple); DCA-Signal direktiv → nicht übernehmen |
| 7 | agi-now/buffett-skills | keine | **Kern (Stufe B/C)** | Value-Fallen-Warnzeichen; Gewinnqualitäts-Warnsignale; Stresstest Umsatz −30 % |
| 8 | strapi/buffet | – | themenfremd | React-UI-Bibliothek |
| 9 | will2025btc/buffett-perspective | MIT | streichen | Ich-Persona einer realen Person |
| 10 | vikd1000/investment-council | MIT | **Kern (Schritt C)** | `validate.py`-Feldprüfung; Belege pro Kriterium + `missing_fields`; Uneinigkeit der Scores |
| 11 | ketan1741/Benjamin-Graham-and-Warren-Buffett-Model-Stock-Exchange- | GPL-3.0 | streichen | Indien, 5 feste Filter, Scraper veraltet; GPL → kein Code |
| 12 | j-poc/buffet-scanner | keine | **Kern (Schritt A)** | Mindestzeilen-Sperre; Universum aus Wikipedia/iShares IWB; sektorabhängige Schwellen; Veto-Deckel; yfinance-Insider-Datenfehler |
| 13 | Choppy-superfamilymuscoidea9021/buffett-skills | – | **⚠️ MALWARE** | s. Abschnitt 4 |
| 14 | kdtmac/buffett-engine | MIT | **Kern (A/B/C)** | OE-Spanne (gesamter Capex vs. Erhaltungs-Capex ≈ Abschreibungen); Herkunft pro Wert; Daten → Schema → Rechenschicht; Faber-10M-SMA; Heartbeat-Mail |
| 15 | 397367315-hub/ai-buffett-quant | keine | themenfremd | nur Datumsdisziplin: Quelldaten getrennt anzeigen, Ersatzquelle nur mit gleichem Datum |
| 16 | georgeztian/buffett-equity-research-graph | MIT | **Kern (Schritt D)** | JSON-Sidecar + Schemaprüfung + Text↔JSON-Abgleich; Aktualitätsprüfung; „Code owns control flow, LLM owns content" |

## 4. Sicherheitswarnung

`Choppy-superfamilymuscoidea9021/buffett-skills` ist eine Kopie von #7 mit einer ZIP-Datei `skills/skills-buffett-3.3.zip`. Inhalt: `Application.bat` (`start compiler.exe gc.txt`), `compiler.exe`, `lua51.dll` und ein verschleiertes `gc.txt`. Das ist das LuaJIT-Loader-Muster, über das Infostealer verteilt werden.

- In dieser Session nur gelesen, nicht entpackt; die lokale Kopie wurde gelöscht.
- **Falls irgendwo ausgeführt:** Rechner isolieren und scannen. Dann von einem sauberen Gerät aus alle Tokens wechseln (GitHub inkl. PAT „croncf", Cloudflare, Anthropic, Finnhub/TwelveData, OWNER_TOKEN, Broker) und alle Sitzungen abmelden.
- Prüfregel für künftige Repo-Sichtungen: Konto mit Zufallsnamen? Kopie eines bekannten Repos? ZIP/EXE im Repo? Anleitung, SmartScreen zu übergehen?

## 5. Offene Punkte / zu klären in der nächsten Session

- [ ] Stand Abschnitt-7/8-Templating im Code verifizieren (Schritt 0), dann abschließen und testen
- [ ] Entscheidungsregel für den Faber-Vergleich final festlegen (vor Schritt B)
- [ ] Schwellen für die Mindestabdeckung in Schritt A bestätigen (Vorschlag ≥95 % / ≥98 %)
- [ ] PFLICHT-HEADER aus dem Template einsetzen
- [ ] _[weitere Punkte am Session-Ende ergänzen]_

## 6. Geänderte / neue Dateien

| Datei | Änderung | Commit |
|---|---|---|
| `UIQ-Suite/SUITE.md` | v4.26 → v4.27: №69 neu; Historienzeile 4.27; versehentlich im Kopfbereich stehende 4.26-Zeile in die Historientabelle verschoben | offen (durch Axel) |
| `UIQ-Suite/docs/UEBERGABE-2026-09-24.md` | neu (dieser Entwurf) | offen |

## 7. Nachträge aus dem weiteren Sessionverlauf

_[am Session-Ende komplettieren]_
