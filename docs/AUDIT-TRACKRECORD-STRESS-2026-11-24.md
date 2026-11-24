# UIQ — Audit Track Record und Strategy Gates in der Stressphase Oktober/November 2026

**Datum:** 24.11.2026
**Status:** Reine Leseauswertung. Keine Änderung an Code, Schwellen, Workflows, KV oder Archiv. Freeze unverändert. Befunde gehen ins Backlog.
**Zweck:** Antwort auf vier Abnahmefragen (Erkennung, Gates, Vorteil gegenüber Benchmarks, Belastbarkeit für Go-Kriterium 5) nach dem vorab freigegebenen Auswerteplan.
**Hinweis:** Diese Datei enthält bewusst keine Tickernamen. Indizes sind beschreibend benannt.

## 0. Kurzantworten

| Frage | Antwort | Kern |
|---|---|---|
| 1. Stress rechtzeitig erkannt? | **Teilweise** | Erster STRESS am 05.11., 22 Handelstage nach dem Index-Hoch und 8 nach dem Stichtag 26.10., einen Tag vor dem ersten Schluss unter −5 %. Vom 26.–30.10. volle Freigabe (BULL_QUIET); vom 10.–13.11. erneut BULL_QUIET vor dem zweiten, tieferen Rückgang auf −11,5 %. 9 Regimewechsel in 25 Handelstagen. |
| 2. Gates haben Verluste vermieden? | **Nicht nachweisbar** | Deskriptiver Selektionsvergleich, keine Wirkungsanalyse: Ein Portfolio nur aus „grünen“ Strategien lag in allen Fenstern unter dem ungefilterten (h7: −0,19 Pp, SE 0,07; ab 26.10.: −0,37 Pp, SE 0,40). Der Unterschied fällt zusammen mit der Sperre von Mean Reversion und Fading Short in BULL_QUIET; ob er aus der Gate-Logik oder aus unterschiedlicher Marktausrichtung und Signalzahl stammt, ist offen (Abschnitt 6). |
| 3. Vorteil gegenüber Benchmarks? | **Überwiegend nein** | Im einzigen ausgereiften Regime (BULL_QUIET, h30) liegen alle Long-Trend-Strategien unter beiden Benchmarks; positiv nur Mean Reversion, Fading Short und die Optionslisten (gemessen an der Basiswertrendite). Für STRESS und POST_PANIC gibt es nur h7 mit 2–3 Tagen. |
| 4. Belastbar für Go/No-Go? | **Nein** | Schwelle von Go-Kriterium 5 („erste Auswertung ohne Kontaminations-Befund“) nicht erreicht: veraltete Signaldaten an ≥ 21 Tagen, 48 Tage nicht prüfbar, doppelte Options-Ranglisten, Gate-Zustand nicht protokolliert. Statistisch: h30 umfasst 65 überlappende Tage, also etwa drei unabhängige Monate in einem Regime. |

## 1. Datengrundlage und Integrität

| Quelle | Stand | Prüfwert |
|---|---|---|
| `ko-aggregator` `backups/tr_backup_latest.json` | Export 21.11.2026 05:25 UTC, 277 Keys, 0 fehlgeschlagen; Commit `b1728e8` | SHA-256 `ef353d5ada1074ce0f6289ed2b89f423f813215f724de22b8e60a4a00b0c7aa6` |
| `uiq-archive` `data/snapshots/` | 233 Snapshots, 22.07.–24.11.2026; Commit `ba93341` | SHA-256 der Hashliste `5dee3cbc6a77d724f7ba54dee3e57546824aeb4b01cd5688243d778cac7ff158` |
| `UIQ-Suite` | Commit `ce49a74` | Track-Record-Spec v1.2 (in `ko-aggregator/docs`), Übergabe 23.11. |

**Umfang:** 98 Signal-Snapshots (02.07.–20.11.), 11.737 bewertete Empfehlungen; h7 bewertet bis Signaltag 06.11., h30 bis Signaltag 06.10.
**Plausibilitätsprüfung (`crosscheck_stats.py`):** Alle 60 eigenen Zellen Strategie × Regime × Horizont (45 h7, 15 h30) sind in `tr:stats` vorhanden. Geprüft je Zelle: n, nFresh, Trefferquote, Trefferquote frisch, Mittelwert, Alpha gegen den S&P-500-ETF (Toleranzen: Zählwerte exakt, Quoten ±0,006, Renditen ±0,015). Ergebnis: 0 Abweichungen. `tr:stats` enthält 5 weitere h30-Zellen mit n = 0, die nur Ergebnisse der KI-Trade-Simulation tragen; diese Kennzahl ist nicht Gegenstand dieses Berichts.

## 2. Datenqualität (D26/D27)

Ein Snapshot trägt das Datum des Handelstags X. Geprüft wurde, auf welchen Schlusskurs sich die Tickerdaten des Laufs tatsächlich beziehen.

| Befund | Tage | Bedeutung |
|---|---|---|
| Daten aktuell (≤ 50 % der Ticker mit Vortageskurs) | 29 | Signal und Bewertungsbasis stimmen überein |
| Daten veraltet (≥ 94 % der Ticker mit Vortageskurs) | 21 | Signal beruht auf X−1, Bewertung startet bei Schlusskurs X: **ein Tag Umsetzungsverzug**, kein Vorgriff auf Zukunftsdaten |
| Nicht prüfbar (02.07.–11.09., ältere Snapshots ohne Kursdatum je Ticker) | 48 | Läufe überwiegend während der US-Handelszeit; Datenstand je Ticker unbekannt |

Die Einteilung in der Tabelle beruht auf dem Kursdatum je Ticker (`stale_share.py`; braucht `archive_prices.json`, im Paket enthalten). Davon zu unterscheiden sind die Laufzeit-Klassen aus `classify_days.py` (Integritätsflag ab 06.10., sonst Laufzeitpunkt); deren Namen „intraday_prevclose“ und „nextday_unverified“ beschreiben nur den Laufzeitpunkt, nicht einen geprüften Datenstand.

**Auswirkung auf die Ergebnisse (`quality_sensitivity.py`, nach Laufzeit-Klassen):** Kein erkennbarer systematischer Unterschied. Die Differenz „nur grün minus alle“ (h7) ist in allen Klassen negativ (−0,08 bis −0,34 Pp). Die Klassen sind klein (10–48 Tage); die Aussage ist deskriptiv, kein Test.
**Weitere Datenbefunde:**
- Die Ranglisten `options_weekly` und `options_collar` sind an allen 44 gemeinsamen Tagen identisch, `options_csp` an denselben 44 Tagen ebenfalls. Drei Optionsstrategien zeigen dadurch dieselben Zahlen.
- Options-Einträge werden an der Rendite des Basiswerts gemessen (Phase D der Spec nicht umgesetzt). Sie belegen keine Options-Ergebnisse.
- Der Gate-Zustand wird nicht protokolliert. Rekonstruierbar ist nur die Basistabelle je Regime; Herabstufungen durch MCM-Faktoren fehlen. Die tatsächlichen Gates waren also höchstens so offen wie hier angenommen.

## 3. Regimeklassifikation und Zeitachse

**Implementierte Logik** (`classify_regime_v2`): Verhältnis VIX3M/VIX < 0,98 → STRESS_UNSTABLE; 0,98–1,05 → POST_PANIC_REVERSION; ≥ 1,05 → BULL_QUIET (BULL_FRAGILE bei VIX > 25, im Zeitraum nie aufgetreten); Override zu STRESS bei negativem GEX.
- **Einen Zustand PANIC gibt es nicht.** Auch der vorgesehene MCM-HMM ist nicht aktiv: `hmm_state` ist in 233 von 233 Snapshots leer.
- POST_PANIC_REVERSION ist ein reines Verhältnis-Band. In dieser Episode trat es **vor** dem Stress auf (16.10., 02.–03.11., 16.–18.11.), nicht danach. Der Name beschreibt den Zustand daher irreführend.
- Die Studie nutzt deshalb die implementierten Labels: NORMAL = BULL_QUIET, STRESS = STRESS_UNSTABLE, Zwischenband = POST_PANIC_REVERSION. VIX über 30 dient nur als externe Referenz, nicht als Klassifikation.

| Handelstag | UIQ-Regime | VIX | Verhältnis | Index vom Hoch | Ereignis |
|---|---|---|---|---|---|
| 06.10. | BULL_QUIET | 15,0 | 1,175 | 0,0 % | Hoch des S&P-500-ETF |
| 16.10. | POST_PANIC_REVERSION | 20,0 | 1,026 | −2,0 % | erstes Warnband, nächster Tag zurück auf BULL_QUIET |
| 26.10. | BULL_QUIET | 18,4 | 1,084 | −1,8 % | vorab festgelegter Stichtag (externe Ampel rot) |
| 30.10. | BULL_QUIET | 19,4 | 1,070 | −3,0 % | weiterhin volle Freigabe |
| 02.11. | POST_PANIC_REVERSION | 21,2 | 1,021 | −3,5 % | erster Schluss mit VIX > 20 |
| 04.11. | BULL_QUIET | 16,6 | 1,132 | −1,6 % | Erholung am Wahltag |
| **05.11.** | **STRESS_UNSTABLE** | 28,2 | 0,907 | n. v. | **erster STRESS** |
| 06.11. | STRESS_UNSTABLE | 25,6 | 0,959 | −5,6 % | erster Schluss unter −5 % |
| 10.–13.11. | BULL_QUIET | 17,5–19,5 | 1,06–1,10 | −2,5 bis −3,7 % | Rückkehr zur vollen Freigabe |
| 19.11. | STRESS_UNSTABLE | 28,4 | 0,950 | −8,1 % | |
| 20.11. | STRESS_UNSTABLE | 35,9 | 0,862 | −11,5 % | einziger Schluss mit VIX > 30 |
| 23.11. | STRESS_UNSTABLE | 26,6 | 0,958 | −7,3 % | Stand des letzten Laufs |

**Verzögerung:** Gegenüber der VIX-Termstruktur gibt es keine Verzögerung, weil das Regime direkt daraus berechnet wird. Gegenüber dem Index: 8 Handelstage vom Hoch bis zum ersten Warnband, 22 bis STRESS. Gegenüber dem Stichtag 26.10.: 5 Handelstage bis zum Warnband, 8 bis STRESS.

**Freigaben laut Basistabelle:**
- 26.–30.10. (BULL_QUIET): grün Momentum, Breakout, Swing, KO, CSP/Wheel, ATM/NA, Weekly Income, Covered Call; rot Mean Reversion, Fading Short.
- 05.11. (STRESS): grün Fading Short; gelb Mean Reversion, CSP/Wheel, Value, Covered Call, Dividend; rot Momentum, Swing, Breakout, KO, ATM/NA, Weekly Income.

## 4. Event Study (Stichtag 26.10., vorab festgelegt)

**h7, Signale 26.10.–06.11. (10 Tage) gegen 02.07.–23.10. (78 Tage).** Werte = Mittel der Tagesmittel, in Prozent; Überschuss gegenüber dem gleichgewichteten S&P-500-ETF, richtungsbereinigt; in Klammern der Standardfehler über Tage.

| Strategie | vor 26.10.: Rendite / Überschuss | ab 26.10.: Rendite / Überschuss |
|---|---|---|
| Momentum (Minervini) | +0,1 / −0,2 (0,3) | −1,6 / −2,9 (0,9) |
| Swing | −0,2 / −0,4 (0,3) | −5,8 / −7,3 (1,7) |
| Breakout | −0,5 / −0,7 (0,3) | −2,5 / −3,8 (0,8) |
| KO Long | −0,2 / −0,5 (0,3) | −2,1 / −3,3 (1,0) |
| Mean Reversion | −0,1 / −0,1 (0,3) | +3,4 / +2,6 (0,8) |
| Fading Short | +1,2 / +1,2 (0,4) | +1,4 / +2,5 (1,0) |
| Breakdown Short | +0,5 / +0,6 (0,3) | −0,8 / +0,1 (0,4) |
| Covered Call (Basiswert) | +0,2 / −0,1 (0,3) | +1,6 / +1,1 (0,8) |
| CSP (Basiswert) | 0,0 / −0,3 (0,2) | −1,3 / −1,8 (0,8) |

**h30, Signale 14.09.–06.10. (17 Tage), deren 30-Tage-Fenster in den Stress läuft, gegen Signale vor dem 14.09. (48 Tage):**
- Momentum −5,0 % (Überschuss −9,0, SE 1,9) gegen 0,0 (+0,9).
- Breakout −6,1 (−10,2, SE 2,1) gegen +1,0 (+3,1).
- Fading Short +8,8 (+12,0, SE 2,9) gegen −0,3 (−1,4).
- Mean Reversion +5,1 (+0,9, SE 1,1) gegen +1,0 (+1,6).

## 5. Regime Study

- **h30 gibt es nur für BULL_QUIET** (65 Signaltage). Die Gate-Logik für STRESS und POST_PANIC lässt sich mit h30 noch gar nicht prüfen.
- **h7 nach Regime:** BULL_QUIET 83 Tage, POST_PANIC_REVERSION 3 Tage, STRESS_UNSTABLE 2 Tage. Die Spec-Schwelle n ≥ 20 ist in den meisten dieser Zellen nach Empfehlungen erfüllt (bis 41; Value und Dividend nur 2–11), nach unabhängigen Tagen nirgends (2–3). Diese Zellen sind nicht bewertbar.

**BULL_QUIET, h30** (Überschuss gegenüber dem gleichgewichteten S&P-500-ETF, Tagesmittel ± Standardfehler):

| Gruppe | Strategien |
|---|---|
| negativ | Momentum −1,9 ± 0,9 · Swing −1,7 ± 0,5 · KO Long −1,9 ± 0,7 · Value −1,0 ± 1,0 · Dividend −0,9 ± 0,9 · Breakout −0,6 ± 1,2 |
| positiv | Mean Reversion +1,4 ± 0,6 · Fading Short +2,3 ± 1,2 · CSP (Basiswert) +1,6 ± 0,8 |
| ATM/NA | −0,7 ± 0,7 |

## 6. Selektionsvergleich der Gates (deskriptiv, keine Wirkungsanalyse)

**Einordnung vorab:** Die Tagesmittel beruhen auf unterschiedlichen Strategiezusammensetzungen (alle / nur grün / grün und gelb). Signalzahlen, Strategiemix und Marktausrichtung (long/short, Beta) sind nicht angeglichen. Die Zahlen beschreiben, wie die freigegebene Auswahl abgeschnitten hat; sie belegen nicht, dass die Gates Verluste verursacht oder verhindert haben. Eine Wirkungsanalyse (Beta-/Benchmark-Bereinigung, gleiche Signalzahlen, Zufallssperren mit gleicher Sperrquote unter vergleichbaren Bedingungen) wird für die zweite Runde vorab festgelegt.

**Vorgehen:** Die Rekonstruktion der Gates je Signaltag erfolgt aus der Basistabelle. Drei Strategien sind keinem Gate zugeordnet und bleiben außen vor: VCP, Breakdown Short, Collar. Verglichen wird je Tag ein gleichgewichtetes Portfolio aus den 12 zugeordneten Strategien, einmal „alle“, einmal „nur grün“, einmal „grün und gelb“.

| Fenster | alle | nur grün | grün + gelb | Differenz grün − alle (SE) |
|---|---|---|---|---|
| h7, vor 26.10. (78 Tage) | +0,09 | −0,10 | −0,04 | −0,19 (0,07) |
| h7, ab 26.10. (10 Tage) | −0,74 | −1,11 | −0,99 | −0,37 (0,40) |
| h30, nur BULL_QUIET (65 Tage) | +0,01 | −0,23 | −0,37 | −0,24 (0,18) |

- **Grün gegen rot je Tag:** h7 −0,90 Pp (SE 0,33; rot an 61 % der Tage besser). Bei h30 für Signale, deren Fenster in den Stress läuft: −8,5 Pp (SE 2,3).
- **Innerhalb einer Strategie** (grüne gegen rote Tage derselben Strategie) gibt es je Strategie nur 2–5 rote Tage. Nicht bewertbar.
- **Einordnung:** Der Unterschied fällt vor allem damit zusammen, dass die Gates in BULL_QUIET Mean Reversion (long) und Fading Short (short) sperren. Beide liefen im ganzen Zeitraum gut; da Fading Short gegen den Markt positioniert ist, kann ein Teil des Unterschieds schlicht die Marktausrichtung in einer fallenden Phase sein. Eine Aussage über die Timing-Qualität der Gates im Stress ist mangels STRESS-Tagen mit reifem Horizont noch nicht möglich. Die Prognosequalität der Strategien (Abschnitt 5) und die Klassifikation (Abschnitt 3) sind deshalb getrennt zu lesen.

## 7. Statistische Einschränkungen

1. **Überlappende Fenster:** Die h30-Fenster täglicher Signale überlappen. 65 Signaltage entsprechen etwa drei unabhängigen Monaten. Die Standardfehler über Tage unterschätzen die Unsicherheit.
2. **Ein Regime:** Alle h30-Werte stammen aus BULL_QUIET. Für die Stressregime gibt es nur h7 mit 2–3 Tagen.
3. **Gemeinsamer Marktfaktor:** Innerhalb eines Tages sind die Empfehlungen stark korreliert. Die effektive Stichprobe entspricht eher der Zahl der Tage als der Zahl der Empfehlungen.
4. **Benchmarks:** Das Alpha der Spec misst gegen den kapitalgewichteten S&P-500-ETF, dieser Bericht zusätzlich gegen den gleichgewichteten. Einen stilgleichen Vergleich je Strategie gibt es noch nicht.
5. **Optionen:** Gemessen ist die Basiswertrendite, nicht das Ergebnis der Optionsposition.

## 8. Backlog-Vorschläge (keine Umsetzung im Freeze)

| Nr. | Befund | Vorschlag |
|---|---|---|
| B1 | Gate-Zustand nicht im Snapshot | Gates und Herabstufungen je Tag in `tr:snap` mitschreiben (Schema-Version) |
| B2 | D26: Signaldaten an ≥ 21 Tagen vom Vortag | `dataAsOf` je Snapshot und Ticker protokollieren; Bewertung ab tatsächlichem Datenstand ausweisen |
| B3 | Doppelte Options-Ranglisten | Ursache prüfen (Leserichtung: Erzeugung der Ranglisten) |
| B4 | Options-Track-Record = Basiswertrendite | Bis Phase D nicht als Optionsbeleg verwenden; Kennzeichnung im Frontend |
| B5 | Kein PANIC-Zustand, MCM-HMM inaktiv, Label POST_PANIC_REVERSION vor dem Stress | Benennung und Semantik dokumentieren; HMM-Aktivierung als eigener Punkt |
| B6 | 9 Regimewechsel in 25 Handelstagen | Hypothese für `regime-test`: Mindestdauer bzw. Hysterese (präregistriert, nicht in Produktion) |
| B7 | n ≥ 20 zählt Empfehlungen, nicht Tage | Spec-Änderung: Mindestumfang nach Tagen bzw. unabhängigen Perioden (Schema-Version, Changelog) |
| B8 | BULL_QUIET sperrt die beiden besten Strategien | Hypothese für `regime-test`, keine Änderung der Gate-Tabelle vor Validierung |

## 9. Offene Fragen

- Lagen die Herabstufungen durch MCM-Faktoren am 26.–30.10. und 10.–13.11. tatsächlich an? Das ist aus den Archiven nicht rekonstruierbar und bräuchte die Morning-Briefing-Ausgaben dieser Tage.
- Wie sah die Datenlage am 02.07.–11.09. aus (48 nicht prüfbare Tage)?
- Für den Stress-Zeitraum fehlen h30-Werte bis Mitte Dezember (Signale ab 26.10. reifen ab ca. 10.12.). Ein Nachtrag mit unveränderter Methodik ist sinnvoll, sobald sie vorliegen. Er läge allerdings nach dem Go/No-Go-Termin.

## 10. Reproduzierbarkeit

| Abschnitt | Status | Skript | Eingaben |
|---|---|---|---|
| 1 Abgleich `tr:stats` | aus Rohdaten | `crosscheck_stats.py` | KV-Backup (nicht im Paket, 105 MB) + Ausgabe `analyze.py` |
| 2 Laufzeit-Klassen | aus Rohdaten | `classify_days.py` | KV-Backup, `archive_meta.csv` |
| 2 Kursdatum je Ticker | aus Paket | `stale_share.py` | `archive_prices.json`, `day_quality.csv` |
| 2 Empfindlichkeit nach Klassen | aus Paket | `quality_sensitivity.py` | Ausgaben `analyze.py`, `gate_effect.py`, `day_quality.csv` |
| 3 Regime-Zeitachse | aus Paket (Werte), Rohdaten (Herkunft) | Tabellen aus `day_quality.csv`, `market_series.json` | Klassifikationslogik: `market_aggregator.py` `classify_regime_v2`, Commit `b1728e8` |
| 3 „hmm_state leer“ | aus Paket | Spalte `hmm_state` in `archive_meta.csv` | — |
| 4–5 Event und Regime Study | aus Paket | `analyze.py` | `eval_flat.csv`, `market_series.json` |
| 6 Selektionsvergleich | aus Paket | `gate_effect.py` | Ausgabe `analyze.py` |

„Aus Paket“ heißt: vollständig mit den mitgelieferten abgeleiteten Daten nachrechenbar. „Aus Rohdaten“ heißt: braucht Zugriff auf `ko-aggregator` bzw. `uiq-archive`; die Rohdaten sind über die Hashes in `provenance.txt` und `snapshot_hashes.txt` festgelegt. Alle Skripte sind rein lesend und schreiben nur in einen angegebenen Ausgabeordner.
