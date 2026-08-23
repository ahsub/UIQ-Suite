# Sinclair, "Positional Option Trading" — Auswertung für das Options-Modul

**Quelle:** Kap. 5 ("Finding Trades with Positive Expected Value"), Kap. 6
("Volatility Positions", Adjustment-Exkurs) und Kap. 9 ("Trade Sizing") —
in eigenen Worten zusammengefasst, keine Textübernahme.

**Besonderheit dieses Buchs gegenüber den bisherigen fünf:** Sinclair
ordnet jeden Effekt einer von drei Konfidenzstufen zu (Level Drei = gut
belegt über viele Märkte/Zeiträume + plausible Theorie, bis Level Eins =
statistisch auffällig, aber Ursache unklar). Diese Selbsteinschätzung des
Autors übernehme ich unten 1:1 mit, weil sie genau die Art von
Kalibrierung ist, die für eine spätere KI-Prompt-Formulierung wichtig ist
(nicht alles gleich sicher darstellen).

---

## 1. Empirische Edge-Faktoren (Kap. 5)

### Konfidenzstufe Drei (am besten belegt)

**VIX-Terminstruktur als Signal — direkt an UIQ anschlussfähig:**
Wenn die Terminstruktur in Contango ist, historisch profitabel: VIX-Futures/
Index-Optionen verkaufen. Bei Backwardation: kaufen. UIQ hat das
VIX/VIX3M-Ratio (`vix_term`/`ratio_3m_spot`) bereits als Kernsignal für
`regime_v2` — das ist genau dieselbe Terminstruktur-Kennzahl, hier aber
als eigenständiges, empirisch begründetes Handelssignal beschrieben, nicht
nur als Regime-Label.

**Fundamentale Faktoren für Volatilitätshandel:** Eigene Backtest-Ergebnisse
des Autors (S&P 100, 2000–2012, wöchentliche ATM-Straddles, long/short
nach Quartilen sortiert) zeigen brauchbare Sharpe-Ratios (0,7–1,2 einzeln,
1,44 kombiniert) für: Long Vola bei niedrigem KGV, niedrigem P/CF, hoher
Marktkapitalisierung, hohem RoE, hohem RoA, hoher Verschuldung — jeweils
gegen die entgegengesetzte Ausprägung. **UIQ hat divYield, payoutRatio,
fcfYield, roe, debtToEquity, peForward, pb bereits für die Dividend/Value-
Strategien im Datenbestand** — dieselben Felder ließen sich für eine
optionsbasierte statt aktienbasierte Strategie zweitverwerten.

### Konfidenzstufe Zwei

**Pre-Earnings-Volatilitätsanstieg + Post-Earnings-Kollaps:** Vor
Earnings-Terminen steigt die implizite Vola typischerweise an, danach
kollabiert sie. Long-Straddle vor dem Termin bzw. Short-Straddle kurz
davor sind beide (unterschiedlich) profitabel — Profitabilität steigt mit
der Streuung der Analystenschätzungen (mehr Unsicherheit = mehr Edge).
**UIQ trackt Earnings-Termine bereits** (`earningsDTE`) — die Logik "kein
neuer CSP, wenn Earnings <7 Tage" könnte um eine positive Variante
ergänzt werden ("Straddle/Strangle interessant, wenn Earnings in 3–10
Tagen").

**FOMC-Effekt:** VIX/VIX-Futures fallen zuverlässig nach FOMC-Ankündigungen,
S&P-Renditen sind in den 1–2 Tagen davor überdurchschnittlich hoch.

**Wochenend-Effekt:** Optionen verlieren übers Wochenende überdurchschnittlich
an Wert — Freitag verkaufen, was am Montag verfällt, ist ein
dokumentierter, robuster Vorteil.

**Volatility-of-Volatility-Prämie:** Optionen auf Titel mit hoher
VVIX-artiger Schwankung sind tendenziell überteuert. **UIQ trackt VVIX
bereits** — die vom Autor beschriebene VVIX-Perzentil-Logik (bei
Extremwerten VIX-Futures/Straddles gegen die Erwartung von Mean-Reversion
handeln) wäre mit vorhandenen Daten sofort umsetzbar, unabhängig vom
5-Faktor-Regime-Modell.

### Konfidenzstufe Eins (schwächer belegt, aber real)

**Earnings-Induced Reversal:** Titel, die vor Earnings stark gelaufen sind,
tendieren dazu, nach der Veröffentlichung zurückzudrehen.
**Pre-Earnings Announcement Drift:** Titel folgen der Kursbewegung von
Branchenkollegen, die bereits berichtet haben.

---

## 2. Wichtiger Gegenpunkt zum Options-Doktor-Konzept (Kap. 6)

Der Autor kritisiert den Begriff "Reparatur" explizit als irreführend:
Eine verlorene Position lässt sich nicht rückwirkend "reparieren" — das
Geld ist bereits weg. Seine Empfehlung: bei jeder Anpassungsentscheidung
die ursprüngliche Position komplett ausblenden und nur fragen "Welche
Position will ich jetzt, gegeben was ich heute weiß?" — unabhängig davon,
ob die bisherige Position gewonnen oder verloren hat.

**Relevanz für das Options-Doktor-Dokument von heute:** Das ist kein
Widerspruch zu Friedenheims Entscheidungsbaum, aber eine wichtige
Rahmung, die dort ergänzt werden sollte — die einzelnen Pfade (Rollen,
Schließen etc.) bleiben gültig, aber die KI-Prompt-Formulierung sollte
explizit vermeiden, den Eindruck zu erwecken, es gäbe eine Möglichkeit,
den ursprünglichen Trade "zu retten" — sondern klarstellen, dass jede
Entscheidung eine neue, unabhängige Positionsentscheidung ist.

---

## 3. Trade-Sizing (Kap. 9) — mögliche Erweiterung der ATR-Positionsgröße

Kernaussage: Volle Kelly-Positionsgröße maximiert zwar die langfristige
Wachstumsrate, führt aber zu unangenehm hoher Volatilität/Drawdown. Ein
fester Bruchteil `f` der vollen Kelly-Quote (z. B. Halb-Kelly) reduziert
Wachstumsrate UND Drawdown überproportional — das ist der übliche
Praxis-Kompromiss. Eine Kombination aus fraktionalem Kelly + festem Stop
mildert zusätzlich das Risiko einer falsch geschätzten Edge-Größe.

**Für UIQ:** Die bestehende ATR-Positionsgrößen-Berechnung (Depot €,
Risiko %, KO-Barriere) ist ein anderer Ansatz (volatilitätsbasiert, nicht
edge-basiert) — beides ließe sich kombinieren, bräuchte aber eine
geschätzte Edge/Gewinnwahrscheinlichkeit pro Strategie als zusätzlichen
Input, die UIQ aktuell nicht hat (nur Scores, keine kalibrierten
Wahrscheinlichkeiten).

---

## 4. Priorisierungsvorschlag

Direkt umsetzbar mit vorhandenen Daten, ohne neue Datenquelle:
1. **VVIX-Perzentil-Signal** — vorhandene VVIX-Historie, neue eigenständige
   Handelslogik (Level Drei/Zwei, gut belegt).
2. **VIX-Terminstruktur als Signal statt nur Regime-Input** — vorhandene
   Daten, andere Verwendung.
3. **Earnings-Vola-Logik erweitern** (`earningsDTE` bereits vorhanden) um
   die positive Long-Vola-Variante vor dem Termin.

Bräuchten mehr Aufbereitung:
4. Fundamentale-Faktoren-Optionsstrategie (Daten vorhanden, aber neue
   Scoring-Logik nötig, kein Quick-Win).
5. Kelly-basierte Positionsgröße (bräuchte erst kalibrierte
   Erfolgswahrscheinlichkeiten je Strategie — abhängig vom laufenden
   Track Record, frühestens nach ausreichend Datenpunkten sinnvoll).
