# SUITE №72 — Equity-Strategien: Inventur (Stand 30.09.2026)

**Rein lesend, keine Änderung an Produktivdateien.** Methode wie bei den Optionen (Inventur, Herkunft, drei Datenchecks).
**Gelesen:** `market_aggregator.py` v5.45.0 (Score-Funktionen, `build_leaderboards`, Anreicherung), `ko-strategy-registry.js`, Prompt-Texte und Versionskommentare in `ko-prompts.js`, `STRATEGIE.md`.
**Daten:** Snapshot `2026-09-30_01` (738 Ticker), Verlauf der letzten 14 Tage (letzter Snapshot je Tag), Snapshots 26.09./29.09. für die Nachrechnung.
**Reproduzierbar:** `equity-audit/equity_inventory_check.py` (Import der echten Score-Funktionen, Ergebnis `result_2026-09-30_01.json`), `saturation_history.txt`.
**Herkunftstags:** `CITED` Quelle im Repo genannt · `INHERITED` aus Blueprint/Review übernommen ohne Quellenprüfung · `DECISION` dokumentierte Entscheidung ohne Fachquelle · `UNVERIFIED` nicht belegbar. „Nicht belegbar“ heißt nicht „falsch“.

---

## 1. Ergebnis in Kürze

| # | Befund | Gewicht |
|---|---|---|
| E1 | **VCP-Leaderboard vollständig gesättigt:** 20 von 20 Zeilen = 100, an allen 14 geprüften Tagen (heute 24 Titel am Deckel). Rohmaximum 130 → Deckel 100. Die „Top 3“ (AAPL, PG, PM) sind reine Listenposition. | **hoch** |
| E2 | **Minervini/KO-Long stark gesättigt:** 5–19 Titel bei 100 (14 Tage). `sKoLong` ist der Minervini-Score (vor dem IOS-Boost) ×1,0 bzw. ×0,7 ab Kurs 500 — keine eigene Bewertung; heute nur zwei Scorestufen (99/100) in den 20 Zeilen. | **hoch** |
| E3 | **IOS-Leader-Boost erklärt die geparkte ARM-Abweichung:** `sMinervini` wird nach dem Sigmoid um +10 (Deckel 100) angehoben, wenn `iosIsLeader`. In drei Snapshots sind alle Abweichungen der Nachrechnung (4 / 2 / 2 Titel) exakt `min(100, roh+10)`. `iosIsLeader` ist in `tickers[]` nicht gespeichert → **konsistent, aber nicht unabhängig bewiesen**. Der Boost fehlt im Docstring; Beispiel MOG-A: roh 96 → 100. | **hoch** (schließt den geparkten Punkt) |
| E4 | **Dividend/Value ranken nur ~16 Titel:** Fundamentaldaten für 16 von 738 Titeln (2,2 %), Leaderboards 3–12 Zeilen. Ranking nur innerhalb Shortlist ∪ Options-Watchlist (max. 50), nicht über das Universum. `sDividend`/`sValue` stehen nicht in `tickers[]`. | **hoch** |
| E5 | **ETF-/Krypto-Präfixfilter der Anreicherung trifft Einzeltitel:** `startswith/endswith` auf „SH“, „XL“, „GLD“ … schließt SHOP, SHW, SHEL, DASH, RGLD, FRSH von der Fundamentalanreicherung aus (heute nicht in der Kandidatenliste, strukturell aber nie erreichbar). | mittel |
| E6 | **Sektor-RS-Boost bei Fading ist toter Code:** `_sector_rs5` wird in `score_short_fading` gelesen (Z. 4110), aber nirgends gesetzt; der Kommentar behauptet die Setzung in `build_leaderboards()`. | mittel |
| E7 | **Squeeze-Gate:** Docstring/Kommentare sprechen von einem harten Gate „für alle Short-Strategien“; im Code prüft nur `score_short_fading` `squeezeRisk ≥ 70`, `score_short_breakdown` ignoriert es. Ob gewollt, ist offen. | mittel |
| E8 | **Fehlender Wert = kein Bonus, kein `UNKNOWN`:** `distToAvwapPct` fehlt bei 26 % aller Titel (30 % der Minervini-Kandidaten); der Gate-9-Bonus (bis +15 Rohpunkte) entfällt still. Dieselbe Semantik-Lücke wie beim Earnings-Gate der Optionen. | mittel |
| E9 | **Liquiditäts-Malus, unerreichbarer Zweig, jetzt quantifiziert:** Minervini (−35) und Breakout (−25) sind nie erreichbar. 60 Titel mit `avgVol20 < 250k`, davon 11 mit Minervini > 0 und 20 mit Breakout > 0 erhalten den milderen Malus. Für Minervini bereits in №72 dokumentiert, für Breakout neu. | mittel |
| E10 | **Universum und Strategiesemantik:** 13 Krypto-Ticker und ETFs laufen durch Aktienstrategien (heute `LINK-USD`, `LTC-USD` in den Top 3 von `long_breakout`; Energie-ETFs bei Swing, TLT bei Breakdown). Fundamentale Strategien schließen sie aus, technische nicht. | mittel |
| E11 | **Herkunft:** Konzeptquellen stehen im Prompt-Layer (`CITED`), die **Zahlenschwellen** der Score-Funktionen stammen überwiegend aus „Gemini-Blueprint/-Fix“-Kommentaren (`INHERITED`/`UNVERIFIED`). Die Registry hat für alle zehn Strategien `rules: null`, also keine maschinenlesbare Definition. | mittel |
| E12 | **Reproduzierbarkeit positiv:** `sSwing`, `sMrLong`, `sBreakout`, `sBreakdown`, `sFading`, `sVcp` werden mit den echten Funktionen für alle 738 Titel exakt reproduziert; `sMinervini` bis auf E3. | entlastend |

Nebenbefund ohne Wirkung: `calc_mcm_intermarket_score` ist zweimal definiert (Z. 424 und Z. 9419), beide Fassungen sind identisch.

---

## 2. Übersicht der zehn Strategien

| Strategie | Leaderboard | Score-Funktion | Sortierfeld / min. Score | Deckel-Risiko | Konzeptquelle im Prompt-Layer |
|---|---|---|---|---|---|
| Momentum/SEPA | `long_minervini` | `score_long_minervini` | `sMinervini` / 40 | Sigmoid + IOS-Boost → hoch | Minervini, George & Hwang 2004, Jegadeesh & Titman 1993 (`CITED`) |
| KO-Long | `ko_long` | Minervini-Score (roh, ohne Boost) | `sKoLong` / 50 | hoch (folgt Minervini) | wie Minervini (abgeleitet) |
| Breakout | `long_breakout` | `score_long_breakout` | `sBreakout` / 40 | mittel (max. 100 exakt) | Lo/Mamaysky/Wang 2000, George & Hwang 2004, Park & Irwin 2007 |
| VCP | `vcp_setups` | `score_vcp` | `sVcp` / — | **voll gesättigt** | Lo/Mamaysky/Wang 2000, Bollinger; Prompt: „keine vergleichbare akademische Evidenz“ |
| Swing | `long_swing` | `score_long_swing` | `sSwing` / 35 | gering (heute max. 95) | Jegadeesh & Titman 1993/1995, Jegadeesh 1990 |
| Mean Reversion | `long_mr` | `score_long_mean_reversion` | `sMrLong` / 30 | gering–mittel (1× 100) | Chan, Leung/Li (Konzepte, bewusst keine Zahl übernommen) |
| Dividend | `long_dividend` | `score_long_dividend` | `sDividend` / — | gering | keine Quelle; Prompt: unbelegte Schwellen bewusst nicht übernommen |
| Value | `long_value` | `score_long_value` | `sValue` / — | gering | Fama/French 1992/98, Lakonishok/Shleifer/Vishny 1994, Novy-Marx 2013 |
| Breakdown (Short) | `short_breakdown` | `score_short_breakdown` | `sBreakdown` / 35 | mittel (Sigmoid; heute max. 96) | Jegadeesh & Titman 1993, George & Hwang 2004 |
| Fading (Short) | `short_fading` | `score_short_fading` | `sFading` / 35 | gering (max. 93; nur 19 Titel > 0) | Jegadeesh 1990, Lehmann 1990, De Bondt/Thaler 1989 |

---

## 3. Inventur je Strategie (tragende Kriterien)

Schwellenwerte sind Zahlen aus dem Code. **Herkunft der Zahl** unterscheidet sich von der Herkunft des Konzepts: Bei allen technischen Strategien gilt zunächst `INHERITED` (Kommentar „Gemini-Fix v2“ bzw. „Gemini-Blueprint“), sofern nicht anders vermerkt.

### 3.1 Minervini/SEPA (`score_long_minervini`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Kurs > EMA50 > EMA200; mit SMA150: Kurs > SMA150, 50 > 150 > 200 | CITED (Minervini Trend Template, Kommentar v3 11.07.) | AUSSCHLUSS (→ 0) | ja | Gate 1 | ohne SMA150-Daten Rückfall auf 50>200 (+18 statt +25) |
| 200er steigend | CITED (Minervini) | BONUS +8 / MALUS −10 | ja | Gate 1b | Minervini-Kriterium wird nicht zum Ausschluss |
| Nähe 52W-Hoch (≤5 / ≤10 / ≤15 %) | CITED (Konzept), Stufen `UNVERIFIED` | BONUS | ja | Gate 2 | Minervini: Pflicht „≤25 % vom Hoch“; Code: nur Bonus, kein Gate (bereits in №72) |
| ≥30 % über 52W-Tief | CITED (Minervini) | BONUS +10 / MALUS −10 (<15 %) | ja | Gate 2b | – |
| RS-Rating (≥85 / ≥70 / ≥50 / <50) | CITED (IBD/Minervini: ≥70), Stufe 85 `INHERITED` | BONUS bis +25 / MALUS −10 | ja | Gate 6 | Minervini-Mindestwert 70, Code belohnt erst ≥85 am stärksten |
| Volumen, OBV, MACD, HVP, BB-Position, RSI-Malus, Markov | INHERITED / UNVERIFIED | BONUS/MALUS | ja | Gates 3–8 | – |
| Liquidität (<500k / <250k) | DECISION (21.07.) | MALUS | ja | Soft-Gate | −35-Zweig unerreichbar (E9) |
| AVWAP-Distanz | INHERITED (TVA-Konzept) | BONUS bis +15 | teilw. | Gate 9 | fehlt bei 26 % → kein Bonus, kein `UNKNOWN` (E8) |
| Sigmoid k=0,06 (raw 50→50) | DECISION (TVA) | Glättung/Deckel | ja | nach Gates | Sättigung ab raw ≥ 139 |
| IOS-Leader-Boost +10 | DECISION (30.06.) | BONUS nach Sigmoid | teilw. | `build_leaderboards` | nicht im Docstring; `iosIsLeader` nicht persistiert (E3) |

### 3.2 KO-Long
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Score = Minervini-Score | DECISION (Ontologie 16.09.: gleiche Idee, anderes Vehikel) | – | ja | `s_ko_long = s_minervini` | wird **vor** dem IOS-Boost gesetzt; keine eigene KO-Logik (Hebel, Barriere, Gap-Risiko) |
| Preis > 500 → ×0,7 | UNVERIFIED (Kommentar „KO-handelbare Preisspanne“) | MALUS | ja | `int(s*0.7)` | kein Beleg für 500; unabhängig von Hebel/Barriere |

### 3.3 Breakout (`score_long_breakout`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Kurs > EMA50 > EMA200 | INHERITED (Minervini-Kette, ohne 150) | AUSSCHLUSS | ja | Pflicht-Gate | – |
| ≤15 % vom 52W-Hoch (30 / 18 / 8) | CITED (Konzept George & Hwang), Stufen `UNVERIFIED` | AUSSCHLUSS >15 %, sonst BONUS | ja | Gate 1 | – |
| Volumen-Bestätigung ≥1,5 / ≥1,2 | INHERITED | BONUS | ja | Gate 2 | Docstring: „Pflicht-Gate“; Code: nur Bonus, „kein Malus bei niedrigem Volumen“ |
| OBV>0, MACD>0, RS ≥85/≥70, RS<50 → −5 | INHERITED | BONUS/MALUS | ja | Gates 3–5 | −5-Fall nicht im Docstring |
| Liquidität <500k / <250k | DECISION | MALUS | ja | Soft-Gate | −25-Zweig unerreichbar (E9) |

### 3.4 VCP (`score_vcp`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Muster erkannt (`vcpDetected`) | CITED (Minervini-Muster; algorithmisch Lo/Mamaysky/Wang) | AUSSCHLUSS (→ 0) | teilw. (Erkennung in `calc_vcp`, hier nicht gelesen) | Gate | Prompt selbst: keine akademische Evidenz für VCP als Ganzes |
| Basis 40, Kontraktionen bis +30, Enge bis +30, Volumen bis +15+15 | UNVERIFIED (Sprint 1/2 22.07.) | Punktesumme, max. 130 → 100 | ja | Summe | **Deckel bei jedem erkannten Muster praktisch erreicht (E1)** |

### 3.5 Swing (`score_long_swing`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Kurs > EMA200 | INHERITED | AUSSCHLUSS (→ 0) | ja | Gate 1 | – |
| RSI-Pullback-Zone 30–48 (+25), 25–30, 48–58, >70 → −15 | INHERITED; Konzept CITED (Reversal J&T 1995) | BONUS/MALUS | ja | Gate 2 | – |
| Abstand über EMA50 ≤2,5 % / ≤5 %, unter EMA50 → −10 | INHERITED | BONUS/MALUS | ja | Gate 3 | – |
| BB-Position, OBV, MACD, Markov, HVP 20–60 | INHERITED | BONUS/MALUS | ja | Gates 4–8 | – |

### 3.6 Mean Reversion (`score_long_mean_reversion`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Abstand unter EMA200 in ATR: ≥2 / ≥3 / ≥4 | UNVERIFIED (Prompt: Chan, Leung/Li „ohne universelle feste Zahl“) | AUSSCHLUSS <2 ATR, sonst BONUS 15/28/40 | ja | Pflicht-Gate | Schwellen ohne Quelle |
| RSI ≤18/25/30/35, BB ≤0,05/0,15, Volumen ≥2, Überhitzung >30 | INHERITED | BONUS/MALUS | ja | Gates | – |
| HVP ≥80 → +10, <40 → −20 | INHERITED („Value Trap“) | BONUS/MALUS | ja | HVP-Gate | starke Wirkung (−20), keine Quelle |

### 3.7 Dividend / Value
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Dividend: Rendite ≥1 %, Payout 40/60/75/90, FCF ≥0/3/6, ROE 10/20, D/E 150/300 | UNVERIFIED (Prompt: „unbelegte Feldschwellen … bewusst nicht übernommen“) | AUSSCHLUSS (<1 %, >8 % unter EMA200), sonst Punkte | ja, sofern Daten vorhanden | `score_long_dividend` | Prompt verwirft dieselben Schwellen, die der Score nutzt |
| Value: Forward-KGV 10/15/20/25/35, P/B 1/1,5/2,5/4, FCF 3/5/8, ROE 5/12/20, Upside 5/15/30, D/E | INHERITED; Konzept CITED (Fama/French, Lakonishok et al.) | AUSSCHLUSS (>12 % unter EMA200; kein Bewertungsanker), sonst Punkte | ja, sofern Daten vorhanden | `score_long_value` | Zahlenstufen ohne Quelle |
| Datenbasis | – | – | teilw. | Anreicherung nur für Shortlist ∪ Watchlist | 16 von 738 Titeln (E4), Präfixfilter (E5) |

### 3.8 Breakdown (Short, `score_short_breakdown`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Kurs ≤ 0,995·EMA200, ≤ 1,02·EMA50, nicht < −6 ATR (Kapitulation) | INHERITED | AUSSCHLUSS | ja | Gates | – |
| RSI: <20 oder >65 → 0; 30–45 → +15 | INHERITED | AUSSCHLUSS / BONUS | ja | RSI-Gate | – |
| OBV<0, MACD<0, BB≤0,25, Bear-Regime, Volumen >1,3, HVP ≥65 | INHERITED | BONUS | ja | Gates | – |
| Squeeze-Risiko | INHERITED (Blueprint: „für alle Short-Strategien“) | AUSSCHLUSS (Doku) | ja | **nicht implementiert** | E7 |
| Sigmoid k=0,06 | DECISION (v5.25.0) | Glättung | ja | nach Gates | – |

### 3.9 Fading (Short, `score_short_fading`)
| Kriterium | Herkunft | Rolle | Prüfbarkeit | Implementierung | Abweichung |
|---|---|---|---|---|---|
| Kurs ≥ 15 $, nicht ≥ 0,99·52W-Hoch, `squeezeRisk` < 70 | INHERITED (Gemini 01.07.) | AUSSCHLUSS | ja | harte Gates | – |
| Abstand über EMA200 ≥ 2,5 ATR (15/20/30), RSI > 68 (10/18/25) | INHERITED; Konzept CITED (Jegadeesh 1990, Lehmann 1990) | AUSSCHLUSS / BONUS | ja | Gates | – |
| BB ≥0,85, Überhitzung 55/75, Volumen <0,8, OBV<0, Markov, HVP | INHERITED | BONUS/MALUS | ja | Gates | – |
| Sektor-RS-Boost (+8/+15) | INHERITED | BONUS | – | liest `_sector_rs5` | **Feld wird nie gesetzt → nie wirksam (E6)** |

---

## 4. Die acht Prüfschritte (Status)

| Schritt | Ergebnis |
|---|---|
| 1 Datenfluss | Score-Funktionen → `scored[]` → Leaderboards: Sortierfelder in `_core` vorhanden. `sDividend`/`sValue` nicht in `tickers[]` (E4). Für `strategy_score` im Generator: Equity nutzt `STRAT_SCORE_FIELD`; Feldfluss im Digest hier **nicht erneut geprüft** (nur Optionen in №74). |
| 2 Semantik | Zwei Bedeutungen desselben Namens: `sMinervini` = Score inkl. IOS-Boost, `sKoLong` = ohne (E2/E3). Docstring/Code-Abweichungen: Breakout „Pflicht-Gate Volumen“, Squeeze-Gate (E7). |
| 3 Filter | Gates deterministisch im Code; Registry `rules: null` → keine zweite, prüfbare Definition (E11). |
| 4 Sättigung/Ties | E1, E2; Breakout/Swing/MR/Breakdown/Fading heute wenig oder nicht gesättigt (Verlauf s. §5). |
| 5 Missing Data | E8 (AVWAP), E4 (Fundamentaldaten), E6 (Sektor-RS). Kein `UNKNOWN`-Zustand irgendwo. |
| 6 Provenienz | E11; Tabellen §3. |
| 7 Historie | Nicht geprüft: Aggregatorversionen vor 22.07., Ledger/Track-Record der Equity-Strategien. |
| 8 Regression | Es gibt keinen Test, der Score-Funktionen gegen feste Fixtures prüft; der neue Prüfer kann das leisten (Vorschlag §7). |

---

## 5. Datenchecks (Snapshot 30.09., 738 Ticker)

**A — Leaderboards:**

| Leaderboard | Zeilen | Top-Score | Gleichstand an der Spitze | Zeilen bei 100 |
|---|---|---|---|---|
| `long_minervini` | 20 | 100 | 5 | 5 (nur Stufen 99/100) |
| `ko_long` | 20 | 100 | 2 | 2 (nur 99/100) |
| `vcp_setups` | 20 | 100 | **20** | **20** |
| `long_breakout` | 20 | 100 | 1 | 1 |
| `long_swing` | 20 | 95 | 3 | 0 |
| `long_mr` | 20 | 100 | 1 | 1 |
| `short_breakdown` | 20 | 96 | 1 | 0 |
| `short_fading` | 16 | 93 | 1 | 0 |
| `long_dividend` | 7 | 77 | 1 | 0 |
| `long_value` | 9 | 69 | 1 | 0 |

Verlauf (Titel am Höchstscore / Zeilen, letzte 14 Tage): VCP durchgehend 20/20 bei 100; Minervini 5–19 bei 100; KO-Long 1–16; Breakout 1–11 (100) bzw. 3–5 (90); Dividend 3–11 Zeilen, Value 4–12 Zeilen (`saturation_history.txt`).
Über alle Ticker: `sVcp` 24 Titel bei 100, `sMinervini` 5, `sMrLong` 1, `sBreakout` 1; `sSwing`, `sBreakdown`, `sFading` erreichen 100 nicht.

**B — Datenlücken (fehlt bei Kandidaten):** `distToAvwapPct`/`avwapAbove` 26 % aller Titel (30 % der Minervini-Kandidaten); `_sector_rs5` 100 %; Fundamentaldaten (`divYield`, `peForward`, `pb`, `fcfYield`, `roe`, `analystUpside`, `debtToEquity`) je ~98 %. Alle anderen Eingangsfelder der technischen Scores fehlen bei weniger als 5 %.

**C — Nachrechnung:** 738 von 738 reproduziert für Swing, MR, Breakout, Breakdown, Fading, VCP. Minervini: 2 Abweichungen, beide = `min(100, roh+10)` (BAYN.DE 99→100, MOG-A 98→100); 26.09.: 4 (ARM, QTEC, IYW, MOG-A), 29.09.: 2 — alle nach demselben Muster.

**D — Liquidität:** 60 Titel mit `avgVol20 < 250k`; 11 davon mit Minervini > 0, 20 mit Breakout > 0.

---

## 6. Entscheidungsvorschläge (keine neuen Gewichte/Schwellen)

Zuordnung nach P0/P1/P2 wie im Optionsaudit; **nichts ist umgesetzt**.

| # | Frage | Vorschlag | Stufe |
|---|---|---|---|
| Q1 | **VCP-Sättigung (E1):** Spitzengruppe ausweisen wie bei den Optionen | „Spitzengruppe (n=…, Score …)“ auch für Equity; kein Tie-Breaker jetzt | P1 |
| Q2 | **Sättigung Minervini/KO-Long (E2):** Sichtbarmachen vor Ändern | Spitzengruppe ausweisen; Rohwert vor Sigmoid und Boost zusätzlich ausgeben (für den Prüfer) | P1 |
| Q3 | **IOS-Boost (E3):** dokumentieren und `iosIsLeader` in `tickers[]` persistieren, damit die Nachrechnung geschlossen ist | Docstring ergänzen; Feld additiv speichern; Wirkung des Boosts nicht ändern | P1 |
| Q4 | **`UNKNOWN`-Semantik (E8):** fehlender Wert ≠ nicht erfüllt, analog Earnings | Zustand sichtbar machen (Feld/Flag), Score unverändert | P1 |
| Q5 | **Dividend/Value-Universum (E4, E5):** Rankingbasis kennzeichnen (16 Titel), Präfixfilter durch Typ-Feld ersetzen | zuerst Kennzeichnung im Output, Filterfix als eigenes Paket | P1 / P2 |
| Q6 | **Toter Code (E6, E9):** Sektor-RS-Boost und −35/−25-Zweige | zuerst dokumentieren (Befundregister); Verhalten nicht ändern, da jede Korrektur Scores verschiebt | P2 |
| Q7 | **Squeeze-Gate (E7):** gewollt für Breakdown? | Entscheidung, danach Doku oder Code angleichen | P2 |
| Q8 | **ETF/Krypto in Aktienstrategien (E10):** getrennte Rangliste, Kennzeichnung oder gemeinsam | Kennzeichnung zuerst (`assetClass`), analog Optionen F10 | P1 / P2 |
| Q9 | **Konzept vs. Schwelle (E11):** Herkunft je Zahl im Bestandsregister festhalten (Grundlage für №75, Punkt 1) | Tabellen aus §3 in ein Regelregister überführen | P2 |
| Q10 | **Regressionstest für Score-Funktionen:** feste Fixtures je Strategie | in `uiq-devtools` (Prüfer), read-only | P1 |

Nicht vorgeschlagen: neue Gewichte, Schwellen, Sigmoid-Parameter, Rekalibrierung. Die Werte aus dem Heute-Snapshot (ASML, BAYN.DE, TSM, AAPL, PG, PM) sind Momentaufnahmen und keine Kalibrierungsgrundlage.

---

## 7. Grenzen

- **Herkunft** aus Code-Kommentaren und Prompt-Versionshistorie; die zitierten Quellen selbst habe ich nicht geprüft.
- **`calc_vcp` (Mustererkennung), `calc_ios_score`, RS-Rating-Berechnung, Anreicherung mit KI** nicht im Detail gelesen.
- **E3** ist eine konsistente, aber keine bewiesene Erklärung (kein `iosIsLeader` im Snapshot).
- **Historie:** Equity-Ledger/Track-Record und Aggregatorversionen vor 22.07.2026 nicht untersucht; Verlauf nur 14 Tage.
- **Generator:** Feldfluss `strategy_score` für Equity im Digest nicht erneut geprüft (in №74 nur Optionen behandelt).
- Kein Backtest, keine Aussage über Rendite oder Prognosequalität einer Strategie.
