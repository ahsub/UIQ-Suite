# UIQ Backlog: Event Risk Framework — Vorstufe (17.09.2026)

## Ausgangslage

Backlog-Punkt №16 (14.07.2026, "Strategie-spezifische Calendar-Buffer") wurde
heute durch einen echten FOMC-Termin (15.09.2026) wieder aufgegriffen. Ein
Reviewer-Vorschlag für ein generisches "Event Risk Framework v1.0" (drei
Dimensionen: Event-Severity, Time-to-Event, Strategie-Sensitivität; getrennt
nach Market Events vs. Security Events) liegt vor.

**Entscheidung (Axel + Reviewer + Claude, 17.09.2026):** Kein Framework-Bau
jetzt. Stattdessen ein dreiphasiger Weg, der die bestehende UIQ-Philosophie
"beobachten → Evidenz → Modell → Regel" respektiert (analog zur bisherigen
DCE-/MCM-Kalibrierungspraxis).

**Drei klar getrennte Ebenen** (Präzisierung 17.09.2026, wichtig für alles
Folgende):
- **Forward Performance:** Was passiert nach einer Empfehlung? (`r7`/`mfe7`/
  `mae7`/`r30` — für alle 12 Strategien bereits vorhanden.)
- **Trade Simulation:** Was wäre unter einer definierten Positionslogik
  (Entry/Stop/Target) passiert? (Aktuell nur `long_minervini`/`short_fading`.)
- **Event Study:** Verändert ein bestimmtes Ereignis diese Ergebnisse
  systematisch? (Noch nicht implementiert, s. 2b.)

## Tatsächlicher Track-Record-Befund (echte Daten, 17.09.2026 exportiert)

Export: `tr:index` + alle `tr:eval:*` (51 Tage, 02.07.-16.09.2026, 40 davon
bereits ausgewertet).

**Korrigierte Feststellung** (erste Analyse hatte "keine Daten" zu pauschal
formuliert — richtig ist die Unterscheidung zwischen zwei verschiedenen
Dingen):

| Was UIQ misst | Abdeckung |
|---|---|
| Forward-Performance (`r7`/`mfe7`/`mae7`/`r30`) | **Alle 12 Strategien**, inkl. `ko_long`, `options_csp`, `options_cc` — vollständig (340/340 Einträge bei den meisten) |
| Definierte Trade-Simulation (`trade.st` = STOP/TARGET, mit Entry/Stop/Target) | **Nur** `long_minervini` (592 auswertbare Trades) und `short_fading` (6). `ko_long`/Optionsstrategien: keine — weil nur Master-Shortlist-Einträge (`src:"sl"`) die dafür nötigen KI-Parameter (Trigger/SL/Target) bekommen, Leaderboard-Einträge (`src:"lb"`, das schließt KO/Optionen ein) nicht. |
| `atmna`/`weekly_income`/`collar` im Track Record | **Gar nicht erfasst** — weder Forward-Performance noch Trade-Simulation. Eigener, noch offener Punkt, unabhängig von dieser Spezifikation. |

**FOMC-Stichprobenlage:** Track Record deckt bisher genau **einen** FOMC-Termin
mit ausgewerteten Folgedaten ab (28.07.2026) — der 15.09.-Termin ist zu jung,
Horizonte noch nicht fällig. Erste Event-Study-artige Auswertung (nicht
kalibrierbar, nur illustrativ):

- `long_minervini` nahe FOMC (25.-31.07., n=34, 21 eindeutige Ticker):
  Trefferquote 50% Ziel vs. 33% im übrigen Zeitraum (n=249) — **besser**, nicht
  schlechter, nahe FOMC.
- `ko_long` nahe FOMC (n=50, 19 eindeutige Ticker): `r7` Ø -1,39% vs. -0,07%
  im übrigen Zeitraum (n=290) — **schlechter**, in die intuitiv erwartete
  Richtung.

Diese beiden Befunde zeigen **entgegengesetzte Richtungen** bei zwei
verschiedenen Strategien, beide aus **derselben einzelnen** Ereignis-Woche.
Das ist kein Widerspruch, der aufgelöst werden muss — es zeigt nur, wie wenig
eine Ein-Ereignis-Stichprobe hergibt. **Keine Kalibrierung ableitbar.**

## Phase 1 — läuft bereits, keine Änderung nötig

Forward-Performance-Sammlung (`r7`/`mfe7`/`mae7`/`r30`/`r90`) für alle
Strategien läuft unverändert weiter über `tr_layer.py`. Das ist bereits die
Datenbasis für Phase 3.

## Phase 2 — Spezifikation, NICHT jetzt implementieren

### 2a. KO-Trade-Simulation (nächster Kandidat für echte Trade-Simulation)

**Warum KO zuerst:** Im Gegensatz zu Optionen hat ein KO-Long eine
vergleichsweise einfache Positionsstruktur — Entry, ein technisches
Stop-Kriterium, ein Ziel. Die MAE/MFE-Infrastruktur, die dafür gebraucht
wird, existiert für `ko_long` bereits (s. Tabelle oben).

**Zu definierende Parameter (Entscheidung noch offen, nicht Teil dieser
Spec):**
- **Entry:** Schlusskurs des Underlyings am Empfehlungstag, oder ein
  definierter UIQ-Trigger (analog zu `long_minervini`s `ki.trig`)?
- **KO-Barriere/Stop:** Abgeleitet aus dem üblichen KO-Abstand (Hebel-
  abhängig) oder aus einem technischen Underlying-Stop? Ein KO-Ereignis ist
  nicht identisch mit einem regulären Stop-Loss — das Underlying kann sich
  um die Barriere technisch anders verhalten (Spread-Ausweitung, Emittenten-
  Pricing) als ein reiner Aktien-Stop.
- **Target:** UIQ-CRV/technisches Ziel, analog zu bestehenden Strategien.

**Architektur-Präzisierung (17.09.2026):** Nicht als Ein-Schritt-Kopie der
`long_minervini`-Simulation bauen, sondern zweischichtig — passend zur
Ontologie-Entscheidung vom 16.09. (Setup/Methodology → Vehicle → Structure):

```
Underlying-Simulation
    ↓
technischer Entry / technischer Stop / technisches Target
    ↓
KO-Translation
    ↓
KO-Barriere (aus Hebel abgeleitet) / KO-Ereignis
```

Das technische Signal kommt vom Underlying (Setup/Methodology-Ebene), das
KO-Zertifikat ist lediglich das Vehicle. Getrennt gehalten, damit UIQ
später nicht versehentlich einen technischen Aktien-Stop mit einer
tatsächlichen KO-Barriere verwechselt — beides sind unterschiedliche
Ereignisse mit unterschiedlicher Pricing-/Spread-Mechanik.

**Explizit NICHT Teil dieser Runde:** Implementierung. Nur die Frage, ob die
Parameter-Definition oben so tragfähig ist, um in einer künftigen Session
tatsächlich gebaut zu werden.

### 2b. FOMC/Makro-Event Study (Datenstruktur, keine Regel)

Statt direkt eine Kalibrierungsregel zu bauen: für jedes künftige
FOMC/CPI/NFP-Ereignis eine strukturierte Beobachtung sammeln, bevor daraus
eine Regel wird.

**T0-Definition (präzisiert, 17.09.2026 — wichtig gerade bei FOMC):** T0 ist
NICHT einfach "der Ereignistag". Festzulegen ist der reguläre Handelstag, an
dem die Entscheidung veröffentlicht wird, PLUS die genaue Veröffentlichungs-
zeit (z.B. FOMC-Statement 14:00 ET). Damit lässt sich später unterscheiden:
Empfehlung vor der Entscheidung / Empfehlung am Entscheidungstag vor der
Bekanntgabe / Empfehlung nach der Bekanntgabe — das kann relevanter sein als
ein pauschales "T0".

**Vorgeschlagene Struktur pro Ereignis, pro Strategie** (erweitert um
r30/r90 und robustere Kennzahlen statt nur Mittelwerte — ein einzelner
extremer Gewinner bei 19-30 Titeln kann den Mittelwert stark verzerren,
Median ist robuster):
```
event_study_entry = {
  event_type: "FOMC" | "CPI" | "NFP",
  event_date: "YYYY-MM-DD",
  event_publish_time_utc: "YYYY-MM-DDTHH:MM:SSZ",  // z.B. FOMC-Statement 14:00 ET
  strategy: "...",
  offsets: {
    "T-5": {
      n_candidates, n_unique_tickers,
      mean_return, median_return,
      hit_rate_positive,
      mfe_mean, mae_mean,
      // je Horizont, sobald faellig:
      r7, r30, r90,
      mfe7, mae7, mfe30, mae30, mfe90, mae90,
      stop_rate,   // nur wenn Trade-Simulation fuer diese Strategie existiert
      regime, vix,
    },
    "T-3": { ... }, "T-1": { ... },
    "T0_before": { ... },  // Empfehlung am Entscheidungstag, vor Bekanntgabe
    "T0_after":  { ... },  // Empfehlung am Entscheidungstag, nach Bekanntgabe
    "T+1": { ... }, "T+3": { ... }, "T+5": { ... },
  }
}
```
`n_unique_tickers` ist Pflichtfeld, nicht optional — genau das hat der
heutige FOMC-Befund gezeigt: n=50 Datenpunkte waren nur 19 unabhängige
Ticker, das haette ohne dieses Feld leicht als groesseres Sample
missverstanden werden koennen.

`stop_rate` nur befüllbar für Strategien mit echter Trade-Simulation
(aktuell nur `long_minervini`/`short_fading`, künftig ggf. `ko_long` nach
2a).

**Explizit NICHT Teil dieser Runde:** Implementierung der
Sammel-/Aggregationslogik, und erst recht keine daraus abgeleitete
GREEN/CAUTION/RED-Regel. Das kommt erst in Phase 3, nach ausreichend
Ereignissen (Größenordnung: mehrere unabhängige FOMC-Termine, nicht einer).

## Phase 3 — erst nach ausreichender Evidenz

FOMC-/Event-Regel-Kalibrierung. Kein Zeitpunkt festgelegt — abhängig davon,
wie viele unabhängige Ereignisse die Event Study (2b) gesammelt hat, sobald
sie läuft.

## Ausdrücklich zurückgestellt, kein Datum

**Optionssimulation (CSP/Wheel/ATM-NA/Weekly/Collar):** Bewusst NICHT
vorschnell angegangen. Eine Optionsposition ist kein Entry→Stop→Target-
Konstrukt, sondern Entry→Prämie vereinnahmt→Kursentwicklung→DTE→
Gewinnmitnahme/Expiration/Assignment→ggf. Roll→ggf. Wheel-Übergang zu
Stock/CC. Ein einfaches "MAE > X → Stop" wäre für CSP/ATM-NA methodisch
falsch und würde UIQ eine Scheingenauigkeit geben, die nicht durch die
tatsächliche Positionslogik gedeckt ist. Für ATM-NA kommt zusätzlich die
eigene 50/60/70%-Gewinnmitnahme- und Rollogik dazu.

Ein späteres Optionssimulationsmodell bräuchte mindestens: Strike-Auswahl,
DTE, Entry-Prämie, IV, Volatilitätsentwicklung, Expiration, Assignment,
Early Close, Roll, bei Wheel den Übergang zu Stock/CC. Eigenes,
eigenständiges Projekt — nicht Teil von Thema 3 oder dieser Spezifikation.

## Separater Backlog-Punkt: Track-Record Coverage — ATMNA/Weekly/Collar

**Unabhängig vom FOMC-Thema, nicht in Thema 3 hineinziehen.** Aktuelle
Abdeckung im Track Record:

| Strategie | Forward Performance | Trade-Simulation |
|---|---|---|
| `long_minervini` | ✓ | ✓ |
| `short_fading` | ✓ | ✓ (klein, n=6) |
| `ko_long` | ✓ | später (s. 2a) |
| `options_csp` | ✓ | eigenes Optionsmodell |
| `options_cc` | ✓ | eigenes Optionsmodell |
| `atmna` | **noch nicht erfasst** | eigenes Optionsmodell |
| `weekly_income` | **noch nicht erfasst** | eigenes Optionsmodell |
| `collar` | **noch nicht erfasst** | eigenes Optionsmodell |

Reine Datenabdeckungslücke, keine FOMC-Frage — die drei fehlen im Track
Record komplett (nicht mal Forward-Performance-Messung), unabhängig von der
später ohnehin nötigen eigenen Options-Lifecycle-Simulation. Zunächst nur
die normale Forward-Performance-Erfassung (`r7`/`mfe7`/`mae7`) auf diese
drei ausweiten — dafür braucht es noch keine Optionssimulation, nur
dieselbe Erfassungslogik, die `options_csp`/`options_cc` bereits nutzen.
Nicht in dieser Runde umgesetzt, nur als eigener Punkt festgehalten.

## Wichtiger Grundsatz, festgehalten

Keine FOMC-spezifische Regel künstlich einbauen, nur weil ein akuter FOMC-
Termin den Anlass gegeben hat. Der aktuelle Track Record sagt derzeit
schlicht: noch keine Evidenzbasis für eine Kalibrierung. Das ist kein
Versagen des Backtestings, sondern das System zeigt korrekt seine eigene
Evidenzgrenze — genau wie ein wissenschaftlich orientiertes
Entscheidungsunterstützungssystem das tun sollte.
