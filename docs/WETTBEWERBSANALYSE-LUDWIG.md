# Wettbewerbsanalyse — Eric Ludwig (5-Star-Options / Planet Options)

*Erstellt: 09.08.2026, Anlass: Axel entdeckte Bezug zum "Ludwig"-Legacy-Namen
im `premium-options`-Repo (Rename zu "atmna" bereits als Publikations-Blocker
bekannt). Recherche via Live-Browser-Besuch von ericludwig.de, 09.08.2026.*

---

## 1. Anbieter-Einordnung

Eric Ludwig — Diplom-Ingenieur (Luftfahrt), seit 2014 hauptberuflich im
Optionshandel aktiv. Kein Nebenprojekt, sondern etablierter Player:

- Gründer & Redakteur: Planet Options (Optionsdienst)
- Gründer & Leiter: Tradehelden-Akademie
- 3 Bücher publiziert (u. a. "Optionen unschlagbar handeln",
  "Hedging mit Optionen: Crashsicher handeln")
- Redakteur bei LYNX Broker: 450+ veröffentlichte Artikel zum Optionshandel
- Traders'-Magazin: Coverstory (09/2020), zwei weitere Interviews (06/2020, 11/2020)
- Eigene Konto-Verifikation behauptet ("handle meine eigenen Trading-Ideen")

**Einordnung: Realer, glaubwürdiger Wettbewerber mit Distributionsvorteil**
(Marke, Reichweite, 20 Jahre Erfahrung) — kein Zufallsfund, ernst zu nehmen.

---

## 2. Produktbeschreibung

### 5-Star-Options (45–47 €/Monat, gestaffelt nach Laufzeit)
- Wöchentliche kuratierte Liste der besten Short-Put- und
  Bull-Put-Spread-Kandidaten
- Rein quantitativ, kein Charting (bis 6 Jahre Backtest-Historie)
- 5-Sterne-Rating auf vier Dimensionen: Score, Rendite, Sicherheitspolster,
  Trefferquote
- Feste Auswahlkriterien: Prämie ≥50 $, Laufzeit 30–60 Tage, Delta <20,
  Trefferquote ≥80 % (flexibel bis 90 %), Kurs Basiswert <100 $ (Short Puts)
- TWS-Copy-Paste-Funktion für Short Puts
- Bonus: 3 "Börsenampeln" inkl. "Kassandra-Indikator"

### Planet Options (45 €/Monat, Schwesterprodukt)
- Kombination Charttechnik (SuperTrend, RSI, MACD, TradingView-Ratings) +
  statistisches Backtesting
- Zusätzlich: Bear Put Spreads (Hedging), Gold-/Cash-Strategie-Integration
- Eigener TradingView-Indikator ("Planet Options Navigator")
- Stärker selektiv, weniger Trade-Ideen als 5-Star-Options

### Kassandra-Indikator (Kernstück beider Dienste)
40+ Sub-Indikatoren aus Momentum, Marktbreite, Volatilität, Sentiment,
Konjunktur → **ein** kombinierter Ampel-Score. Konzeptionell verwandt mit
UIQs Unified Metric Foundation (Backlog №44) und DCE — aber ein einzelner
Score/Ampel, nicht ein probabilistisch kalibriertes 4-Regime-Modell.

---

## 3. Strukturvergleich mit UIQ

| Dimension | Ludwig | UIQ |
|---|---|---|
| Grundmodell | Push: kuratierte Wochenliste, alle Abonnenten identisch | Diagnostisch: individuelle Empfehlung je Nutzer/Regime/Position |
| Personalisierung | Keine | Zentral (6-Stufen-Kaskade, Investor-Profil) |
| Marktzustand-Logik | 1 kombinierter Ampel-Score (40+ Sub-Indikatoren) | 4-Regime-Markov-Modell, Brier-Score-kalibriert |
| KI-Interaktion | Keine (statischer Report) | Kern-Baustein: KI-Diagnose, Coaching, Fehleranalyse |
| Lernt aus eigenem Trading | Nein | Ja (OptionsDoktor-Vision) |
| Steuerintegration Deutschland | Keine | Refundex — eigenständiger Mehrwert, den Ludwig nicht adressiert |
| Öffentlicher Live-Track-Record | Nicht erkennbar (nur Backtest-Marketing) | Läuft seit 02.07.2026, dokumentiert, Sharpe 1,66 vs. 0,63 |
| Preis | 45–47 €/Monat | Hypothese 30–50 €/Monat (unvalidiert) |
| Reichweite/Marke | Etabliert (LYNX-Partnerschaft, 20 J. Erfahrung) | Bei null |
| Optionstypen | Short Puts, Bull Put Spreads (+ Bear Put Spreads bei Planet Options) | Breiter angelegt (Strategiekatalog A-E, Optionsmodul-Architektur №49) |

---

## 4. Bewertung — zwei gegenläufige Signale

**Nachteil für UIQ:** Ludwig hat einen strukturell *einfacheren* Dienst
(kuratierte Liste ohne Software/KI/Personalisierung) und trägt damit
offenbar ein Geschäft bei vergleichbarem Preis — dank Marke und Reichweite,
die UIQ fehlen. Das ist ein echter Distributionsnachteil.

**Vorteil für UIQ (indirekt):** Dass ein strukturell einfacheres Produkt zu
45–47 €/Monat in exakt dieser Nische (deutschsprachige Optionshändler,
Short-Put/Prämien-Strategien) offenbar zahlende Abonnenten findet, ist ein
**positives Validierungssignal für UIQs eigene Preis-Hypothese**
(30-50 €/Monat) — der Markt zahlt nachweislich in dieser Größenordnung für
Options-Entscheidungshilfe. Relevant für Go/No-Go-Kriterium 4
(Zahlungsbereitschaft), auch wenn es kein Ersatz für eigene Beta-Validierung ist.

**Kernunterschied bleibt real, nicht nur behauptet:** Ludwig verkauft eine
Liste, UIQ will ein Diagnosesystem sein, das erklärt, warum eine Strategie
zur individuellen Situation passt, und aus eigenen Fehlern lernt. Das ist
ein anderes Produktversprechen — ob der Markt den Unterschied honoriert,
ist offen, aber die Prämisse "identischer Ansatz" trifft nicht zu.

---

## 5. Korrektur an bestehender Dokumentation

`docs/OPTIONSMODUL-ARCHITEKTUR.md` §8 / Chancen-Abschnitt behauptet:
"Kein bekannter Wettbewerber bietet einen 'Regime-Router' ... als Kernprodukt."
**Das ist zu korrigieren** — Ludwigs Kassandra-Indikator ist ein
Markt-Regime-Signal, wenn auch strukturell einfacher (ein Score statt
adaptivem Strategie-Gating über vier probabilistische Regimes). Die
Grenze ist unschärfer als die ursprüngliche Aussage suggeriert.

---

## 6. Offene Fragen / nächste Schritte

- Kein Abo abgeschlossen, keine Testberichte eingesehen — Bewertung basiert
  ausschließlich auf öffentlicher Marketing-Seite. Tatsächliche
  Trefferquote/Performance nicht unabhängig verifizierbar.
- Subscriber-Zahl unbekannt (nicht öffentlich einsehbar) — Marktgrößen-
  Validierung für UIQs eigene Nutzerkreis-Schätzung (SWOT §Business-Fakten)
  bleibt dadurch nicht direkt möglich.
- Empfehlung: keine Kaufentscheidung nötig, um Positionierung zu schärfen —
  aber UIQs Kommunikation sollte den Personalisierungs-/KI-Unterschied
  explizit herausstellen, nicht nur implizit voraussetzen.
