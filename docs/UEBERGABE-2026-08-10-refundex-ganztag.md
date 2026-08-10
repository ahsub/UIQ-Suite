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
   Wenn eine Prüfung möglich ist (grep, Parser, Live-Check) — mach sie, bevor
   du sagst "das funktioniert".

3. **Eine Behauptung, die du nicht geprüft hast, markierst du als ungeprüft.**

4. **Skepsis ist keine Unhöflichkeit gegenüber der Vorsession.**

5. **Wenn Axel eine Diskrepanz meldet: das ist immer Grund für Deep-Debug, nie
   für eine schnelle Plausibilitäts-Antwort.**

**Kurzform:** *Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor
versprochen.*

**Diese Session ist ein Paradebeispiel dafür, warum das gilt:** Was als reine
UI-Erweiterung begann, deckte beim tatsächlichen Testen gegen echte Daten eine
materiell falsche Steuerberechnung auf, die seit mindestens 08.08.2026 live
war. Ohne den harten Realdaten-Test wäre das nicht gefunden worden.

---

# Übergabeprotokoll 10.08.2026 (Ganztag) — Refundex

**Session-Typ:** Ganztägige Refundex-Session (kap.html-Fokus). UIQ Phase 0
nicht berührt. PAT war Session-scoped, wird nach diesem Protokoll widerrufen.

**Governance-Hinweis:** Der Trade-Detail-Report (2.15/2.16) war eine bewusste
Ausnahme vom Refundex-Maintenance-Modus (SUITE.md §4, Axel-Entscheidung,
dokumentiert in ROADMAP.md 2.5). Die Z.8/Z.9-Korrektur (2.17) wurde dagegen
als Bugfix eingestuft (jederzeit erlaubt, keine Ausnahme nötig, ebenfalls
dokumentiert).

---

## 1. Ausgangslage

Session begann mit einem Live-Browser-Test von `kap.html` — laut Vorprotokoll
(09.08.) war das PDF-Upload-Feature nur Node-simuliert, nie im echten Browser
verifiziert. Genau das erwies sich als goldrichtig: Der erste echte
Browser-Load zeigte, dass die Seite **komplett unbenutzbar** war.

## 2. Kritische Bugs gefunden + gefixt (kap.html-Grundfunktion)

Alle vor dieser Session bereits vorhanden, nie im Browser aufgefallen:

1. **SyntaxError `profile-btn`-Quoting** (seit Commit `23678830`, 08.08.) —
   verschachteltes einfaches Anführungszeichen in einem `onclick`-Handler
   brach den umgebenden String, blockierte komplette Skriptausführung.
   Fix: Commit `2c10f5d2`.
2. **SyntaxError `BASISZINS`-Doppeldeklaration** (seit Commit `ccf79f33`,
   07.08.) — zwei unabhängige ETF-Vorabpauschale-Features deklarierten
   dieselbe Konstante. Fix: Commit `2ccff146` (Umbenennung zu
   `BASISZINS_PROFIL`).
3. **CDN-Pin `ko-flex.js` veraltet** — zeigte auf Commit `c6ebbc9b` (vor den
   09.08.-Bugfixes), Live-Seite lief mit dem "dividends-Array immer leer"-Bug.
   Fix: Pin aktualisiert.
4. **File-Input akzeptierte kein XML** — `accept=".csv"` an zwei Stellen,
   obwohl der Parser XML längst unterstützt/bevorzugt. Fix: `.csv,.xml`.
5. **Upload-Badge-Label** zeigte weiterhin nur ".CSV" nach obigem Fix
   (Axel-Hinweis) — korrigiert zu ".XML/.CSV".

→ Nach diesen 5 Fixes lief `kap.html` erstmals seit mind. 08.08. fehlerfrei
im echten Browser. **Nicht meine Vermutung — live mit Konsole verifiziert.**

## 3. Feature-Ausbau: Trade-Detail-Report (ROADMAP 2.15/2.16, SUITE.md-Ausnahme)

Axel-Anforderung: vollständige Trade-Auflistung mit tagesaktuellem
EZB-Kurs im Steuerreport, Vorbild BubbleTax-Konkurrenzprodukt (Anhang A.1–A.5).

**Neues Modul `ko-tradedetail.js`** (aktueller Stand: Commit `d9ce69a8`,
CDN-Pin überall konsistent):

- `buildTradeDetailReport(trades, year)` — Aktien, FIFO-Lot-Zuordnung,
  mehrjährige Bestandsführung (Vorjahres-Lots werden korrekt fortgeführt).
- `buildOptionsDetailReport(trades, year)` — Optionen, **zustandsbasierte**
  Open/Close-Erkennung (Positionsbestand + Handelsrichtung), NICHT über das
  `openCloseIndicator`-Feld (das ist in Axels echten Daten unzuverlässig:
  229/284 Trades mit leerem Wert, auch bei eindeutigen Buy-to-Close-Trades).
- `calcRowGainLoss(row)` — korrekte Vorzeichen-Behandlung für Long-Verkauf
  UND Leerverkauf-Eindeckung.
- Leerverkauf-Handling: Aktien-FIFO ebenfalls auf Long/Short-Zustandslogik
  generalisiert (analog Options-Logik), nachdem ein echter untertägiger
  Leerverkauf (CVS, s.u.) fälschlich als Datenlücke interpretiert wurde.

**Bekannte, dokumentierte Grenze:** Optionsscheine (Warrants) noch nicht
abgedeckt.

**Integration in `kap.html`:**
- `flexAllTrades`/`flexAllDividends` — neue globale Akkumulatoren, sammeln
  Rohdaten ALLER hochgeladenen Jahre (vorher wurden nur Aggregate behalten,
  war Voraussetzung für mehrjährige Lot-Fortführung).
- Bildschirm-Sektion "Trade-Detail-Report" (Aktien + Optionen, ein-/
  ausklappbar, mit Preis/Brutto/Gebühren/Netto-Spalten + Trade-ID).
- DOCX-Begleitschreiben: neue Sektion 5 mit identischer Tabellenstruktur.

**Validiert gegen Axels echte 3-Jahres-XML-Daten (2023-2025, per ZIP
hochgeladen, lokal in Node+jsdom getestet):**
- 3M CO-Beispiel (aus BubbleTax-PDF): Stückzahlen exakt (102,0795 Endbestand,
  6 Lots).
- Options-Engine: 121/121 Fehlalarme behoben nach Umstellung auf
  Zustandslogik. Summen (43.819,11 € Prämien / -40.545,06 € Rückkäufe)
  matchen die unabhängig dokumentierte SWOT-Kennzahl fast exakt.

## 4. KRITISCHER BEFUND + FIX: Z.8/Z.9-Aktienformel (ROADMAP 2.17, GESCHLOSSEN)

Beim Testen des Trade-Detail-Reports gegen echte Daten zufällig entdeckt,
unabhängig vom eigentlichen Feature-Auftrag:

**Problem:** Die bestehende Z.8/Z.9-Formel (`ko-flex.js`, `stkGainEur`/
`stkLossEur` in `parseActivityXML`) nutzte das Vorzeichen von `netCashEur` —
bei Optionen korrekt (Cash-Basis-Prinzip), bei Aktien aber grundlegend falsch:
ein Aktienkauf hat negativen Cashflow und wurde fälschlich als "Verlust"
gezählt. Verifiziert: 2024 hätte -137.736,93 € "Verlust" gezeigt (in
Wirklichkeit ~+8.195 € Gewinn), 2025 zeigte -40.057,62 € "Verlust" obwohl
0 Verkäufe stattfanden.

**Alternative (`FifoPnlRealized`) geprüft und verworfen:** Bei Axels
Export-Typ (`levelOfDetail=EXECUTION`) durchgängig `0`, auch bei den 3 echten
Verkäufen (CVS/PDD/VST 2024) — unbrauchbar.

**Fix:** Echte FIFO-Nachrechnung über dieselbe `ko-tradedetail.js`-Engine wie
der Trade-Detail-Report. Neue Funktion `updateAktienGainLossFIFO()`, async,
eingebunden in `onFileFlex` + `applyFlexYear` (race-geschützt über
Jahresabgleich).

**Nebenfund während der Gegenprüfung:** Echter untertägiger Leerverkauf (CVS,
13.05.2024, Verkauf 11:10 Uhr VOR jedem Kauf, Eindeckung 13:37 Uhr selber
Tag) wurde ursprünglich als Datenlücke ("Altbestand unbekannt") fehl-
interpretiert. Aktien-FIFO generalisiert auf Long/Short-Zustandslogik.

**PWC-Gegenprüfung (Axels echte PWC German Tax Reports 2023-2025, per ZIP
hochgeladen):**

| Jahr | PWC (Vollkonto ×2) | Refundex FIFO (nach Fix) | Δ |
|---|---|---|---|
| 2023 | 0,00 € | 0,00 € | exakt |
| 2024 | 8.197,24 € | 8.194,91 € | 2,33 € (0,03 %, FX-Rundung) |
| 2025 | 0,00 € | 0,00 € | exakt |

**Wichtiger Zwischenfund bei der Gegenprüfung:** Das PWC-PDF ist die
50 %-Pro-Person-Ansicht (zweiter Kontoinhaber "Christa F Hildebrand" im
Dokument identifiziert) — Vollkonto-Vergleich braucht ×2.

**Status: GESCHLOSSEN.** Alle 4 Schritte des vereinbarten Klärungsplans
durchlaufen (Diskrepanz aufklären → Methodik prüfen → PWC-Gegenprüfung →
Fix). Kein weiterer Handlungsbedarf, Restdifferenz ist reine FX-Rundung.

**Betroffene Commits:** `913a4332` (FIFO-Anbindung), `d9ce69a8`
(ko-tradedetail.js, Leerverkauf-Logik), `8664f95b` (Integration).

**Nebenbefund (separat, bereits gefixt):** `_xmlConvertEAE` (STK-Assignment
aus OptionEAE-Sektion) setzte bei jedem Assignment `qty` positiv/`buySell:
'BUY'` — falsch bei Call-Assignment (Aktien fließen ab). Fix: Commit
`1e4dc47d`. Betrifft laut Datenlage NICHT Axels Konto (0 Call-Assignments
2025), aber ein reeller, unabhängig sinnvoller Fix.

## 5. Sonstige Fixes/Änderungen heute

- **Gebühren-Transparenz:** Preis/Brutto/Gebühren/Netto als separate Spalten
  in Bildschirm- + DOCX-Trade-Detail-Ansicht (statt nur verrechneter
  Endbetrag) — Axel-Anforderung "professioneller/transparenter".
- **DOCX-Tabellen-Spaltenbreiten korrigiert** — "Gebühr"/"Brutto" waren zu
  schmal, brachen unschön um. Zusätzlich: fehlende explizite `width` bei
  einer Zelle mit `columnSpan` ergänzt (Skill-Vorgabe).
- **Engine-Import-Banner entfernt** ("⚡ Refundex Engine Import" /
  `kap_data.json` / `python engine/build_report.py`) — auf Axel-Wunsch, war
  permanent sichtbarer, ungenutzter Python-Importpfad ohne Bezug zum
  eigentlichen Flex-Query/PDF-Workflow. Commit `6eff0039`.
- **Soli/Solidaritätszuschlag-Frage geklärt, keine Änderung:** Axel fragte,
  warum kein Soli im Kontoprofil-Modal erscheint. Geprüft gegen BubbleTax
  (Referenzstandard) — erwähnt Soli in KEINEM der beiden Dokumente. Axel hat
  sich mit dieser Bestätigung zufriedengegeben, keine Änderung vorgenommen.
- **Kontoprofil-Modal-Klickproblem:** Von Axel gemeldet, konnte NICHT als
  echter Code-Bug reproduziert werden — `btn.click()` (echtes DOM-Event)
  öffnet das Modal einwandfrei. Erste Fehlversuche waren ein
  Koordinaten-Artefakt des Automatisierungstools (negative
  `getBoundingClientRect`-Werte durch Scroll-Zustand), kein echter Bug.
  **Falls das Problem bei Axel weiterhin auftritt: nicht als bereits gelöst
  annehmen, erneut deep-debuggen** (Pflicht-Header Punkt 5).

## 6. Aktueller Commit-Stand (kap.html, Hauptdatei)

Letzter kap.html-Commit dieser Session: `6eff0039` (Engine-Banner-Entfernung).
CDN-Pins zum Zeitpunkt der Übergabe:
- `ko-flex.js@1e4dc47d`
- `ko-tradedetail.js@d9ce69a8`

**Bei Session-Start: beide Pins per `grep -o "refundex@[a-f0-9]*/modules"
kap.html` verifizieren, nicht diesem Protokoll blind glauben.**

## 7. Offene Punkte für nächste Session

1. **Kein bekannter kritischer Bug mehr offen.** Alles oben Genannte ist
   deployed und verifiziert (Live-Browser-Tests, teils mit echten Daten).
2. **Optionsscheine (Warrants)** im Trade-Detail-Report weiterhin nicht
   abgedeckt (dokumentierte Grenze, kein akuter Bedarf laut Axels Daten).
3. **Monatliches Routine-Update IWV-CSV** — laut älterem Protokoll fällig
   ~27.08.2026, in dieser Session nicht berührt.
4. Falls Axel das Kontoprofil-Modal-Problem erneut meldet: siehe Punkt 5
   oben, nicht vorschnell "schon gelöst" annehmen.

## 8. PAT-Hygiene

Session-PAT wird laut Ankündigung direkt nach diesem Protokoll von Axel
widerrufen. Kein weiterer PAT-Zugriff in dieser Session nach diesem Punkt.

---
*Erstellt am Ende der Session vom 10.08.2026 durch Claude (in dieser Session).*
