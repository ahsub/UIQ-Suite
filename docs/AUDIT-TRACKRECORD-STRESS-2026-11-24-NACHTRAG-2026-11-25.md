# UIQ — Nachtrag zum Track-Record-Audit vom 24.11.2026 (Klarstellungen zur Reproduzierbarkeit)

**Datum:** 25.11.2026 · **Fassung 3** (Korrektur C Nr. 1 und Präzisierung C Nr. 3 nach Review; Vorfassung SHA-256-Präfix `f7e809ad53d147b4`)
**Bezug:** `docs/AUDIT-TRACKRECORD-STRESS-2026-11-24.md` (v2, SHA-256-Präfix `f9060d33cbb8cd98`, UIQ-Suite Commit `df8d2b7`), externes Review vom 25.11.2026.
**Status:** Der Bericht v2 bleibt unverändert und gilt als abgeschlossene historische Bestandsaufnahme. Dieser Nachtrag ändert keine Ergebnisse, keine Methodik für Runde 2 und keine Bewertung von Go-Kriterium 5. Keine Tickernamen.

## A. Datenqualitätsklassen: kein Tag im Zwischenbereich

Abschnitt 4 des Berichts definiert „aktuell“ (höchstens 50 % der Ticker mit Vortageskurs) und „veraltet“ (mindestens 94 %). Der Bereich dazwischen ist leer:

- In den 50 prüfbaren Tagen lag kein Snapshot im Zwischenbereich von mehr als 50 % und weniger als 94 % Vortageskursen.
- Höchster Anteil unter den 29 aktuellen Tagen: 32 %. Niedrigster Anteil unter den 21 veralteten Tagen: 94 %.
- Die Aussage ist so belastbar wie `stale_share.csv` und ihr Manifest-Hash. Quelle: `stale_share.csv` (Ausgabe von `stale_share.py`, uiq-archive `audits/trackrecord-2026-11-24/inputs_derived/`, SHA-256 laut Manifest).

## B. Veraltete und nicht prüfbare Tage sind verschiedene Befunde

| Befund | Tage | Art | Bedeutung |
|---|---|---|---|
| veraltet | 21 | Integritätsbefund | Signal beruht auf dem Vortag, Bewertung beginnt am Signaltag: ein Tag Umsetzungsverzug. **Kein Vorgriff auf Zukunftsdaten (kein Look-ahead).** |
| nicht prüfbar | 48 | Nachweislücke | Es lässt sich nicht feststellen, auf welchem Datenstand die Signale beruhten. |

„Kein Vorgriff auf Zukunftsdaten“ gilt nur für den Mechanismus der 21 veralteten Tage. Es ist kein allgemeiner Nachweis, dass keinerlei Look-ahead-Probleme bestehen; für die 48 nicht prüfbaren Tage ist gerade das offen.

Beide Befunde werden nicht als gleichartige „Kontamination“ behandelt. Die Bewertung von Go-Kriterium 5 („nicht erfüllt“) bleibt bestehen, stützt sich aber auf beide Befunde getrennt sowie auf die übrigen dort genannten Punkte (Options-Ranglisten, fehlende Gate-Protokollierung).

## C. Aggregationsregel des Selektionsvergleichs (Abschnitt 6)

So rechnet `gate_effect.py` (uiq-devtools `trackrecord-audit/`):

1. **Rendite je Empfehlung:** `r7` bzw. `r30`, die richtungsgerechte Rendite aus `tr:eval` (laut `TRACK_RECORD_SPEC.md`: Short mit gedrehtem Vorzeichen). Der Selektionsvergleich in Abschnitt 6 ist nicht benchmarkbereinigt; ein Indexüberschuss wird in `gate_effect.py` nicht berechnet. Bei einer hypothetischen Benchmarkbereinigung würde sich der richtungsgerechte Indexbeitrag innerhalb eines Tages bei getrennt betrachteten Long- bzw. Short-Portfolios jeweils herausheben. Bei einem gemeinsamen Portfolio mit unterschiedlicher Long-/Short-Zusammensetzung kann er sich dagegen nicht vollständig herausheben. Die unterschiedliche Richtungszusammensetzung bleibt deshalb ein möglicher Einflussfaktor des Selektionsvergleichs.
2. **Einheit Strategie × Tag:** Mittel der Renditen ihrer Empfehlungen mit vorhandenem Wert.
3. **Strategie ohne Empfehlung oder ohne vorhandenen `r7`- bzw. `r30`-Wert an einem Tag:** entfällt aus dem Tagesmittel. Sie geht weder als Nullrendite ein noch macht sie den Tag unvollständig.
4. **Tagesportfolio:** gleichgewichtetes Mittel über die verbliebenen Einheiten, getrennt für „alle“, „nur grün“ und „grün + gelb“.
5. **Differenz „grün − alle“:** nur an Tagen, an denen beide Tagesmittel existieren. Mittelwert und Standardfehler werden über diese Tage gebildet.

Folge: Strategiezusammensetzung und Zahl der Einheiten unterscheiden sich zwischen „alle“ und „nur grün“. Das ist der Grund, warum Abschnitt 6 als Selektionsvergleich und nicht als Wirkungsanalyse gekennzeichnet ist. Runde 2 legt die Aggregation eigens fest (`PRAEREG-TR-RUNDE2-GATES-2026-11-24.md` §5a) und nutzt dort Überschüsse gegenüber dem gleichgewichteten Index.
