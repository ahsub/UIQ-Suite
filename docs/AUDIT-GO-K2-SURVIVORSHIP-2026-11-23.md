# UIQ — P0-Code-Audit Go-Kriterium 2 (Survivorship & Look-ahead)

**Datum:** 23.11.2026
**Status:** abgeschlossen (Bestandsaufnahme und Beweissicherung, rein lesend)
**Zweck:** Grundlage für die Go/No-Go-Entscheidung im Dezember 2026 und für Version 1.1 der Machbarkeitsanalyse (Review-Unterlage)

---

## 1. Prüfrahmen

Die Prüfung erfolgte rein lesend: keine Codeänderungen, keine Commits, keine Neuberechnungen.

* **Geprüfter Stand:** `ko-aggregator` @ `64e2383` und `UIQ-Suite` @ `8ab31df` (SUITE.md v4.44), beide vom 23.11.2026.
* **Go-Kriterium 2 (Fassung 4.33):** täglicher Überschuss gegenüber Buy & Hold, Newey-West-SE mit 5 Lags, einseitig 5 %, Lag 1 mit 5 bp Kosten. Zusätzlich muss der Mittelwert bei Lag 2 und bei 20 bp positiv sein.
* **Entscheidungsregel:**
  * Backtest nicht betroffen: Das bisherige Ergebnis bleibt hinsichtlich Survivorship verwendbar.
  * Backtest betroffen, Sharadar-Testmonat ausreichend: korrigierte Neuberechnung.
  * Backtest betroffen, Datenbasis nicht rechtzeitig verfügbar: Go/No-Go mit ausdrücklichem Vorbehalt oder Verschiebung.
* **Prüfschritte:**
  1. Go-Kriterium 2 lokalisieren
  2. Abhängigkeiten ermitteln
  3. Universumsbildung prüfen
  4. Survivorship prüfen (delistete Titel, terminale Renditen)
  5. Look-ahead prüfen
  6. Befunde mit Datei, Funktion und Zeilen festhalten
  7. Risiko einstufen (unbetroffen / eingeschränkt / betroffen / ungeklärt)

## 2. Ergebnis vorweg

**Go-Kriterium 2 ist vom Survivorship-Problem nicht betroffen.** Der einzige gültige Go-2-Backtest arbeitet mit einer Indexreihe, nicht mit Einzeltiteln. Einen Einzeltitel-Ranking-Backtest (den früher genannten „DCE-Backtest“) gibt es in keinem der beiden Repos. Das bestätigen SUITE 4.32 und die eigene Codesuche.

Nach der Entscheidungsregel folgt daraus: **keine Neuberechnung und keine vorgezogene Datenbeschaffung.** Go-Kriterium 2 ist ohnehin seit 26.09.2026 *nicht bestanden*. Eine Verzerrung, die Ergebnisse zu günstig darstellt, könnte dieses negative Ergebnis nur bestätigen, nicht kippen.

**Einen Befund gibt es an anderer Stelle:** Der Track Record (Go-Kriterium 5) arbeitet mit Einzeltiteln und ist eingeschränkt betroffen. Der Effekt ist klein und messbar (Zeile 4 der Tabelle).

## 3. Inventar je Backtest

Von fünf geprüften Positionen ist keine für Go-Kriterium 2 von Survivorship betroffen. Einzig der Track Record (Go-Kriterium 5) ist eingeschränkt betroffen.

| # | Backtest / Auswertung | 1. Universum | 2. Ein- und Austritte | 3. Survivorship / Look-ahead | 4. Korrektur | 5. Neuberechnung | Einstufung |
|---|---|---|---|---|---|---|---|
| 1 | **№34 Regime-Gate-Backtest v2.2** (`analysis/regime_gate_backtest_v2.py`), maßgeblich für Go-Kriterium 2 (Fassung 4.33) | Kein Einzeltitel-Universum: S&P-500-Preisindex ohne Dividenden (`DIX_GEX_History.csv`, Spalte `price`) plus CBOE VIX/VIX3M, 02.05.2011–19.08.2026 (`load_panel`, Z. 103–113) | Entfällt; Indexwechsel bildet der Indexanbieter ab | **Survivorship ausgeschlossen.** Look-ahead: Signal t → Position t+1 per `shift(lag)` (`positions`, Z. 145–151); Perturbationstest im Skript (`lookahead_selftest`) mit 0/25 Verletzungen | Keine wegen Survivorship. Offen ist die Herkunft der festen Schwellen 0,98 / 1,05 / VIX 25 (Z. 88–90, identisch `market_aggregator.py` Z. 9053). Sie ist nicht dokumentiert; die Parameter wurden möglicherweise im selben Zeitraum gewählt | **Nein** | **Unbetroffen** (Survivorship); Look-ahead-Rest *eingeschränkt*, dokumentiert |
| 2 | Testfamilie №34: `regime_compare/dsr_check.py` v2.0, `economic_test.py`, `separation_test.py`, `regime_v2_backtest.py` | Indexreihen: S&P-500-Index, CBOE-Optionsstrategie-Indizes (PUT/BXM/CLL), VIX-Familie | Entfällt | Survivorship ausgeschlossen. Laut SUITE zeitlich korrekt (Vorwärtsrenditen ab t); in diesem Audit nur auf Datenquellen geprüft | Keine | Nein | **Unbetroffen** |
| 3 | Ursprünglicher Backtest 07./26.08.2026 (`refundex/engine/backtest_2007_2026.py`) | Laut SUITE S&P-500-ETF plus VIX3M, also Indexebene | Entfällt | Look-ahead-Fehler (kein Lag); seit 26.09.2026 **ungültig** | Ersetzt durch Zeile 1 | Nein | **Überholt**; nicht geprüft (Repo außerhalb des Auftrags) |
| 4 | **Track Record hit30, Go-Kriterium 5** (`tr_layer.py` v1.2) | Einzeltitel aus den nächtlichen Leaderboards, **zum Entscheidungszeitpunkt aufgezeichnet**, also prospektiv; kein rückwirkend projiziertes Universum | **Austritte problematisch:** Fehlen bei Fälligkeit die Kurse (Delisting, Übernahme, Entfernung aus dem Universum), wird die Rendite `None`. Sie zählt als `noData` und fällt **aus Trefferquote und Durchschnitt heraus** (`_eval_horizon` Z. 320–323, `run_evaluation` Z. 536–541, `_aggregate_stats` Z. 420–424) | Survivorship bei der Auswahl ausgeschlossen, **beim Austritt eingeschränkt** (Shumway-Effekt im Kleinen). Look-ahead: durchgängig gleich adjustierte Kursreihe, unkritisch | Regel für die Endbewertung ergänzen (letzter Kurs bzw. Übernahmepreis statt Ausschluss) und `noData`-Anteil je Zelle berichten | **Nein**; vor Dezember nur den `noData`-Anteil in `tr:stats` sichten | **Eingeschränkt** |
| 5 | „DCE-Score-Ranking-Backtest“ | – | – | **Existiert nicht.** Kein Einzeltitel-Ranking-Backtest in beiden Repos (Suche nach `backtest`, `sharpe` und Equity-Kurve in allen .py- und .js-Dateien) | – | – | **Entfällt** |

## 4. Einordnung

* **Größenordnung bei Zeile 4:** Bei rund 2 % Ausfall pro Jahr unter Large Caps betrifft das je 30-Tage-Horizont grob 0,2 % der Empfehlungen. Das ist ein Überschlag, keine Messung.
  * Die Richtung des Effekts ist offen: Übernahmen enden eher positiv, Insolvenzen eher negativ.
  * Weil `noData` mitgezählt wird, ist der Effekt sichtbar und nicht still.
  * Gelöst werden sollte er trotzdem, bevor der Track Record extern als Beleg dient.
* **Bedeutung des Survivorship-Befunds:** Er betrifft künftige Einzeltitel-Tests (H-DIV-1 bis H-DIV-3, Fair-Value-Backtest, №70 earnings_invest), nicht die Dezember-Entscheidung.
* **Nicht geprüft:** das Repository `refundex` (Zeile 3, außerhalb des Auftrags) und das im Aggregator-Code erwähnte `ahsub/regime-test`. Liegen dort noch Go-relevante Auswertungen, wäre das der nächste Prüfschritt.
* **Konsequenz für Review-Unterlage v1.1:** Die Formulierung „möglicherweise bestehende Backtests zu Go-Kriterium 2“ wird ersetzt durch „geprüft: nicht betroffen“.
