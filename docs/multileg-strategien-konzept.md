# Neue Multi-Leg-Strategien für das Options-Modul — Chen/Sebastian Kap. 9

**Quelle:** Konzeptionell abgeleitet aus Chen/Sebastian et al., "The Option
Trader's Hedge Fund", Kap. 9 ("Most Used Strategies") — in eigenen Worten
strukturiert, keine Textübernahme.

**Status:** Konzeptentwurf, noch nicht implementiert.

---

## 0. Kritischer Scope-Hinweis — vor allem Weiteren

**Alle fünf Strategien sind Multi-Leg** (2–4 Optionsbeine, teils über
mehrere Verfallstermine). UIQ hat aktuell **keinen echten
Optionsketten-Feed** — das ist bereits bei `collar`/`csp_wheel` explizit so
dokumentiert ("keine echten Optionsketten verfügbar", nur ATR/HVP-basierte
Näherungen). Für einen echten Kandidaten-Scan bräuchte jede dieser fünf
Strategien tatsächliche Strike-für-Strike-Deltas und -Prämien über
mehrere Beine hinweg — das ist eine andere Größenordnung als die
bisherige Single-Leg-Näherung.

**Zwei realistische Wege:**
- **(a) Weiterhin Näherung, wie bei `collar`:** ATR/HVP-basierte
  Strike-Abstände statt echter Delta-Werte, mit noch deutlicherer
  Kennzeichnung als grobe Orientierung — die Delta-Feinheiten, auf denen
  diese Strategien laut Quelle beruhen (z. B. "10–11 Delta" beim Iron
  Condor), lassen sich ohne Chain-Daten nicht sauber nachbilden.
- **(b) Echten Optionsketten-Feed anbinden** (IBKR/CapTrader-API oder
  einen Datenanbieter) — größerer Aufwand, aber erst damit werden diese
  fünf Strategien wirklich das, was die Quelle beschreibt.

Ohne Klärung dieser Frage sollte keine der fünf Strategien 1:1 als neue
`ko-prompts.js`-Strategie umgesetzt werden — sie würden sonst Genauigkeit
suggerieren, die die Datenbasis nicht hergibt.

---

## 1. Vertical Credit Spread (Put- oder Call-Spread)

**Marktbedingung:** Stabile oder fallende Volatilität; braucht eine
Richtungsmeinung zum Basiswert.
**Spread-Breite:** Abhängig von der Skew-Steilheit — bei steiler Skew
engere Spreads (geringere Vola-Differenz zwischen den Beinen), bei
flacherer Skew können breitere Spreads sinnvoll sein (Kommissionen sparen).
**Laufzeit:** 30–60 Tage bis Verfall (je weiter OTM, desto eher Richtung
60 Tage — Theta-Verfall ist bei weit-OTM-Spreads linearer).
**Exit-Beispiel aus der Quelle:** Bei Erreichen von ca. 80%+ des
vereinnahmten Credits schließen (konkretes Beispiel zeigte 83%
Gewinnmitnahme nach 22 Tagen, Return on Margin 15,4%).

## 2. Iron Condor

**Marktbedingung:** IV muss nicht absolut hoch sein, nur höher als der
ATR des Basiswerts — funktioniert daher in fast jedem Vola-Regime.
Entscheidend: stabile oder fallende Vola beim Einstieg, nicht steigende.
**Strike-Wahl:** 10–15 Delta für die Shorts als Richtwert.
**Laufzeit:** ~60 Tage als optimaler Ausgangspunkt.
**Skew-Warnsignal:** Eine ungewöhnlich steile Skew-Kurve (v. a. wenn IV
selbst noch nicht mitgezogen hat) gilt als Warnsignal für einen
bevorstehenden Vola-Spike — dann eher nicht einsteigen.
**Absicherung:** Wenn die aktuelle Vola im unteren Viertel ihrer
historischen Bandbreite liegt, wird empfohlen, einen kleinen Teil
(bis zu ~10% des vereinnahmten Credits) in zusätzliche OTM-Puts als
Versicherung zu investieren.

## 3. ATM Iron Butterfly

**Marktbedingung:** Wie beim Iron Condor (IV > ATR als Grundvoraussetzung),
aber der Erfolg hängt stärker von der Skew ab als bei anderen Strategien.
**Skew-Regel (Beispiel SPX):** Wenn der Put-Skew deutlich flacher als
üblich notiert (z. B. 6% Rabatt gegenüber ATM-IV = günstiger Einstieg,
10% Rabatt = sehr günstiger Einstieg), gilt das als attraktiver
Einstiegszeitpunkt. Gewünscht: flache Put-Kurve, steile Call-Kurve.
**Laufzeit:** Unter 30 Tagen, da die Strategie vom exponentiellen
Zeitwertverfall am Geld lebt.

## 4. Calendar Spread (Long und Short)

**Long-Calendar-Bedingung:** Unterdurchschnittliche IV, aber nicht die
untersten ~15% der historischen Bandbreite (sonst zu anfällig für
plötzliche Realvola-Spikes). Setup: Frontmonat wird verkauft, wenn er
mit mindestens ~10% Aufschlag zur normalen Front-/Back-Monat-Relation
notiert (Warnsignal bei >25% Aufschlag — dann auf strukturelle Gründe
prüfen statt blind zu handeln).
**Short-Calendar-Bedingung:** Funktioniert bei sehr niedriger ODER sehr
hoher IV gut (Extrembereiche). Setup: gekaufter Frontmonat sollte mit
~10% Abschlag zur normalen ATM-IV-Relation notieren.
**Laufzeit-Faustregel:** Innerhalb von 30 Tagen handeln, Ausnahme bei
extrem verzerrten Monatsrelationen.
**Ziel/Exit:** 5–10% Gewinn anstreben, konsequent aussteigen (nicht auf
mehr hoffen). Harte Verlustgrenze: nie mehr als 10% der Margin verlieren.

## 5. Ratio Back/Front Spread

**Marktbedingung:** Nur einsteigen, wenn IV im unteren 40%-Bereich der
aktuellen Bandbreite liegt — sonst braucht der Trade eine große
Richtungsbewegung, um zu funktionieren.
**Skew-Bedingung:** Flache Skew bevorzugt, idealerweise 7–10%
unterbewertet gegenüber dem Modell.
**Laufzeit:** Für reine Vola-/Hedge-Zwecke mindestens 60 Tage; für einen
gezielten Richtungs-Trade auch kürzer möglich.
**Setup-Prinzip:** Ziel ist ein Netto-Credit oder mindestens Kostenneutralität
beim Aufsetzen — nie für einen "großen Credit" optimieren, das schmälert
nur die Haltedauer-Toleranz der gekauften Beine.
**Ziel/Exit:** ~10% Gewinn als Zielmarke, harte Verlustgrenze bei 10% der
ursprünglichen Margin.

---

## 6. Muster über alle fünf Strategien hinweg

Auffällig, und nützlich für eine einheitliche Config-Struktur:

- **Fast alle fünf nutzen dieselbe harte Exit-Regel:** max. 10% Verlust
  der ursprünglichen Margin, Zielgewinn meist 10% (Ausnahme: Vertical
  Spread mit höherem Gewinnmitnahme-Ziel im gezeigten Beispiel).
- **IV-Regime ist bei allen fünf der wichtigste Einzelfaktor** — jede
  Strategie hat eine klare Präferenz (stabil/fallend, extrem hoch/niedrig,
  unteres 40%-Perzentil etc.), keine ist "immer geeignet".
- **Skew wird bei dreien explizit als zweiter Haupttreiber genannt**
  (Iron Butterfly, Ratio Spread, mit Einschränkung auch Iron Condor) —
  UIQ hat mit der SKEW-Anbindung aus der CBOE-Datenintegration (23.08.)
  bereits eine Datenquelle dafür, die für diese Strategien direkt
  nutzbar wäre, unabhängig vom Optionsketten-Problem aus Abschnitt 0.

---

## 7. Priorisierungsvorschlag, falls trotz Abschnitt 0 mit Näherung
   begonnen werden soll

1. **Iron Condor** — am klarsten regelbasiert, größte Nähe zu bereits
   vorhandenem CSP/Wheel-Baukasten (zwei Credit-Spreads statt einem).
2. **Vertical Credit Spread** — einfachste der fünf, guter Testfall für
   die generelle Multi-Leg-Machbarkeit ohne echte Chain-Daten.
3. Iron Butterfly, Calendar Spread, Ratio Spread — zurückstellen, bis
   Punkt 1–2 sich bewährt haben; alle drei sind skew-/timing-sensibler
   und würden unter der fehlenden Chain-Datenbasis stärker leiden.

---

## 8. Offene Fragen vor jeder Umsetzung

1. Wird Abschnitt 0 (Näherung vs. echter Feed) vorher geklärt?
2. Falls Näherung: Wie wird "10–15 Delta" ohne echte Delta-Werte
   sinnvoll angenähert (z. B. über Distanz in ATR-Einheiten, wie bei
   `collar` bereits gehandhabt)?
3. Sollen die "max. 10% Verlust / ~10% Gewinnziel"-Regeln als feste
   Default-Werte in eine gemeinsame `cfg`-Struktur wandern (ähnlich der
   bereits bestehenden `getEffectiveRules()`-Funktion für CSP/CC), damit
   alle Multi-Leg-Strategien dieselbe Exit-Logik referenzieren, statt sie
   fünfmal zu duplizieren?
