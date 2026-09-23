## PFLICHT-HEADER — an den Anfang jedes neuen Übergabeprotokolls stellen

---

**Bevor du irgendetwas aus diesem Protokoll als gegeben behandelst:**

1. **Dieses Dokument beschreibt einen behaupteten Zustand, keinen verifizierten.**
   Jede Zeile hier ("v281 deployed", "X funktioniert", "Y ist erledigt") ist eine
   Aussage der letzten Session über sich selbst — nicht dein eigenes Wissen.
   Du hast das nicht gesehen. Du hast es nicht getestet. Behandle es wie eine
   Behauptung eines Kollegen, nicht wie dein eigenes Gedächtnis.

2. **Bei jedem neuen Feature/jeder neuen Registry/jedem neuen Datenpfad:
   Prüfe die Verbindung, nicht nur die Existenz.**
   "Der Code ruft `getElementById('x')` auf" beweist nicht, dass `x` existiert.
   "Die Registry sagt `domId: y`" beweist nicht, dass `y` im DOM landet.
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**
   Sag "laut Protokoll erledigt, von mir noch nicht verifiziert" statt
   "erledigt". Der Unterschied ist der ganze Punkt.

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**
   Die letzte Session hat nach bestem Wissen gearbeitet. Trotzdem können
   Registry-Einträge auf tote IDs zeigen, Feldnamen können falsch geschrieben
   sein, "deployed" kann ein stiller Fehlschlag sein. Das Finden solcher
   Lücken ist keine Kritik an der Vorarbeit — es ist der Job dieser Session.

5. **Wenn Axel eine Diskrepanz meldet (Screenshot, Konsolen-Log, "das stimmt
   nicht"): das ist immer Grund für Deep-Debug, nie für eine schnelle
   Plausibilitäts-Antwort.** Nicht raten, woran es liegen könnte — nachsehen,
   woran es liegt. Erst wenn eine Ursache durch Code/Konsole/Parser bestätigt
   ist, gilt sie als gefunden.

6. **Never guess, always correctly diagnose (SUITE.md Grundgesetz #9).**
   Ein plausibler Fix ohne verifizierten Root-Cause-Beleg gilt als Vermutung,
   nicht als Fix — unabhängig davon, wie überzeugend die Erklärung klingt oder
   wie oft ein ähnliches Muster schon funktioniert hat. Präzedenzfall
   (23.09.2026): `ko-prompts.js` v2.54.1 (Fettdruck-Anweisung für Ticker) war
   gut begründet, aber unverifiziert — und schlug live fehl. Erst reines
   Diagnose-Logging (ohne jede Verhaltensänderung) deckte die tatsächliche
   Ursache auf (v2.54.2: fett geschriebene Markdown-Überschriften brachen die
   Ticker-Extraktions-Regex). Erst danach griff der gezielte Fix nachweislich.
   Konsequenz für diese Session: bei unerwartetem Verhalten lieber einen Lauf
   in reine Diagnose investieren (Logging, kein Verhaltenseingriff), als aus
   der ersten plausiblen Hypothese sofort einen Fix zu bauen — auch wenn das
   einen Zyklus länger dauert.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---

## Namenskonvention

* **Dateiname:** `UEBERGABEPROTOKOLL-JJJJ-MM-TT.md` — Großschreibung mit
  Bindestrichen, Datum am Ende im ISO-Format (Datum der Session, an deren
  Ende das Protokoll geschrieben wird — nicht des Folgetags, für den es
  gilt). Beispiel: `UEBERGABEPROTOKOLL-2026-09-23.md`.
* **Ablageort:** `UIQ-Suite/docs/`, neben den anderen Konzept-/Status-
  Dokumenten (`EARNINGS-INVEST-*.md`, `TICKER-MASTER-MIGRATION-*.md`) —
  gleiches Muster, gleiche Groß-mit-Bindestrich-Schreibweise.
* **Überschrift im Dokument selbst:** `# UIQ — Übergabeprotokoll TT.MM.JJJJ →
  TT.MM.JJJJ` (Session-Enddatum → Folgedatum, mit Bindestrich-Pfeil).
* **Kopf-Metadaten direkt darunter:** `**Datum:**`, `**Status:**`,
  `**Zweck:**` — jeweils als eigene Zeile, passend zum Header-Stil der
  übrigen `docs/`-Dokumente dieser Session.
* Dieser PFLICHT-HEADER-Block (inkl. Punkt 6) wird **unverändert** an den
  Anfang jedes neuen Übergabeprotokolls kopiert, vor den eigentlichen
  Session-Inhalt (Stand/Roadmap) — er ist die feste Vorlage, nicht Teil des
  tagesspezifischen Inhalts.
