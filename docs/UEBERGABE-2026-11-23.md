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

7. **Tests für öffentlichen Output prüfen den Inhalt, nicht nur die Struktur.**
   "Überschrift 7 ist vorhanden" beweist nicht, dass unter Überschrift 7 der
   richtige Text steht. Präzedenzfall (24.09.2026):
   `generate_public_recommendations.js` v1.22 bestand Golden-Test,
   Szenario-Tests und E2E-Test — alle prüften nur, ob die Abschnitts-
   Überschriften vorhanden waren. Live standen in Abschnitt 7+8 aller 15
   Strategien die Prompt-Anweisungen an das Modell ("PFLICHT-SATZMUSTER",
   "Grundgesetz #11", "EIC-exklusiv") statt fertigem Text. Root Cause: derselbe
   String wurde für zwei Rollen benutzt (Anweisung ans Modell UND öffentlicher
   Text). Konsequenz: Prüfungen für öffentlichen Text gegen echte historische
   Outputs kalibrieren — mit positiven Fällen (gültige Texte müssen bestehen)
   UND negativen Fällen (bekannt fehlerhafte Texte müssen durchfallen), bevor
   sie live Strategien blockieren dürfen. Und: Prompt-Anweisung ≠ Output — nie
   denselben String für beide Rollen verwenden.

8. **Pro Nacht nur eine Produktionsänderung.**
   Wenn zwei Änderungen gemeinsam in denselben Nachtlauf gehen und etwas
   abweicht, lässt sich die Abweichung keiner der beiden eindeutig zuordnen.
   Weitere fertige Änderungen warten, bis die vorherige live bestätigt ist —
   notfalls über einen manuellen Lauf, damit nicht auf den nächsten Nachtlauf
   gewartet werden muss. Präzedenzfall (24.09.2026): Phase C der
   TICKER_MASTER-Migration wurde fertig gebaut und getestet, aber bewusst erst
   nach der Live-Bestätigung von v1.23 zum Commit freigegeben.

**Kurzform, die für den Rest der Session gilt:**
*Verifiziert vor behauptet. Geprüft vor plausibel. Gezeigt vor versprochen.*

---


# UIQ — Übergabeprotokoll 23.11.2026 → 24.11.2026

**Datum:** 23.11.2026 (Montag), Sessionstand abends (ca. 21:30 Uhr MEZ)
**Status:** Keine Änderung an Produktionscode, Workflows, Worker, KV, Archiv oder `SUITE.md`. Der P0-Code-Audit lief **rein lesend** (keine Codeänderungen, keine Commits, keine Neuberechnungen). Neue Dateien dieser Session liegen als Ablagepaket vor; Axel prüft sie vor dem Commit inhaltlich.
**Zweck:** Festhalten von vier Strängen: Survivorship-Messung, externes Review der Machbarkeitsanalyse, P0-Code-Audit zu Go-Kriterium 2 und Backlog-Entwurf „Quellenbasierte Regelwerke“. Grundlage für die Go/No-Go-Entscheidung im Dezember 2026 und für Version 1.1 der Review-Unterlage.

> Quellenhinweis: Repo-Stände aus frischen Klonen (Tiefe 1) vom 23.11.2026. Survivorship-Zahlen stammen aus Axels lokalem Lauf von `survivorship_gap.py` v1.1.1 und sind hier nicht neu gemessen. Diese Datei enthält bewusst keine Tickernamen (Repo öffentlich).

## 1. Stand der Repos und Dateien

| Objekt | Stand | Anmerkung |
|---|---|---|
| `ahsub/UIQ-Suite` | `main` `8ab31df` (23.11.2026), nur gelesen | `SUITE.md` v4.44 (letzter Changelog-Eintrag 03.10.2026) |
| `ahsub/ko-aggregator` | `main` `64e2383` (23.11.2026), nur gelesen | unverändert |
| `ahsub/refundex` | nicht geprüft | außerhalb des Auftrags; enthält den überholten Backtest `engine/backtest_2007_2026.py` |
| `docs/AUDIT-GO-K2-SURVIVORSHIP-2026-11-23.md` | neu, 56 Zeilen, SHA-256-Präfix `92a2fed6a2b545d6` | Auditbericht mit Tabelle je Backtest |
| `docs/SUITE-BACKLOG-QUELLENREGELN-ECKERT.md` | neu, 107 Zeilen, `4b64562e7a450b75` | Entwurf eines Backlog-Abschnitts №XX für `SUITE.md`, noch nicht integriert |
| `uiq-devtools/survivorship/survivorship_gap.py` | neu, v1.1.1, 745 Zeilen, `b33f7a8f7289302c` | auf Axels Mac ausgeführt (Gesamtmarkt und S&P-500-Mitglieder) |
| `uiq-devtools/survivorship/README.md` | neu, 80 Zeilen, `86a7eb32421f0df3` | Aufruf, Flags, Indexdatei-Formate |

Die Hashes beziehen sich auf die Dateien im Ablagepaket. Nach dem Commit: Abgleich gegen einen frischen Klon.

## 2. Ergebnisse

1. **Survivorship-Messung (`survivorship_gap.py`):** Datenbasis ist Alpha Vantage `LISTING_STATUS`; SPACs sind ausgeschlossen. Der Anteil der zum Stichtag gelisteten Titel, die heute nicht mehr gelistet sind:

   | Stichtag | Gesamtmarkt | S&P-500-Mitglieder (Listing-Lücke) | S&P-500-Mitglieder (Index-Lücke) |
   |---|---|---|---|
   | 2012 | 47,6 % | 26,5 % | 35,5 % |
   | 2015 | 46,7 % | 23,1 % | 31,9 % |
   | 2018 | 39,4 % | 17,3 % | 25,3 % |
   | 2021 | 29,2 % | 11,8 % | 17,0 % |

   Rate: Gesamtmarkt 4,2–5,7 % p. a., Large Caps rund 2 % p. a.

   Grundlagen und Einschränkungen:
   * Die Indexmitglieder stammen aus `hanshof/sp500_constituents` (453/464/491/501 Mitglieder je Stichtag).
   * „Ungeklärt“ blieben 33/27/29/22 Titel.
   * Die Messung zeigt die **Listing-Lücke, nicht die Renditeverzerrung**; dafür fehlen Delisting-Renditen.
2. **Externes Review:** Das Review der Machbarkeitsanalyse liegt vor (Review-Unterlage als Claude Doc). Übernommen werden:
   * Delisting-Renditen
   * Relativrendite als Quotient
   * Holm/BH/PBO mit Effektgrößen
   * Holdout plus Walk-forward
   * Gate-System
   * Abnahmetest für Datenanbieter
   * gescheiterte Strategien in der Quellenauswahl

   Den Widerspruch „neu berechnen vor Dezember“ gegen „keine Lizenz vor Dezember“ hat Axel durch die Entscheidungsregel aufgelöst (Auditbericht, Abschnitt 1).
3. **P0-Code-Audit Go-Kriterium 2:** Go-Kriterium 2 ist von Survivorship **nicht betroffen**. Der einzige gültige Go-2-Backtest (№34, `regime_gate_backtest_v2.py` v2.2) arbeitet auf Indexebene. Einen Einzeltitel-Ranking-Backtest gibt es nicht. Ergebnis: **keine Neuberechnung**. Go-Kriterium 2 bleibt seit 26.09.2026 *nicht bestanden*. Eingeschränkt betroffen ist der Track Record (Go-Kriterium 5): Austritte ohne Kurs fallen als `noData` aus Trefferquote und Durchschnitt heraus. Einzelheiten stehen in `AUDIT-GO-K2-SURVIVORSHIP-2026-11-23.md`.
4. **Quellenbasierte Regelwerke (Pilot Dividendenstrategie, D. Eckert):** Drei Transkripte wurden ausgewertet und daraus ein Backlog-Entwurf erstellt. Er umfasst die Hypothesen H-DIV-1 bis H-DIV-4, Methodik, Benchmarks, Event-Gate und eine Reihenfolge. Status: Backlog, nicht vor Go/No-Go.

## 3. Entscheidungslage

* Für die Dezember-Entscheidung ist keine Datenlizenz und keine Neuberechnung nötig (Entscheidungsregel, Fall „nicht betroffen“).
* Die Survivorship-Befunde betreffen künftige Einzeltitel-Tests (H-DIV-1 bis H-DIV-3, Fair-Value-Backtest, №70 earnings_invest). Dort gilt: Point-in-Time-Universum mit Delisting-Renditen, Kandidat ist ein Sharadar-Testmonat. Lizenzprüfung erst nach Go/No-Go.

## 4. Nächste Schritte

1. Ablagepaket prüfen, committen und gegen einen frischen Klon hashen (Axel).
2. Review-Unterlage auf Version 1.1 überarbeiten:
   * Review-Änderungen einarbeiten
   * drei Ebenen trennen
   * Aussagen als nachgewiesen / plausibel / offen kennzeichnen
   * Entscheidungsregel aufnehmen
   * Auditergebnis übernehmen: „geprüft: nicht betroffen“

   Danach als MD unter `docs/` ablegen.
3. Vor Dezember den `noData`-Anteil in `tr:stats` sichten (nur lesen).
4. Backlog-Entwurf bei Gelegenheit als №-Abschnitt in `SUITE.md` integrieren (Nummer und Changelog-Eintrag vergeben).

## 5. Offene Punkte

* `ahsub/refundex` und `ahsub/regime-test` sind nicht geprüft. Klären, ob dort noch Go-relevante Auswertungen liegen.
* Herkunft der festen Regime-Schwellen 0,98 / 1,05 / VIX 25 ist nicht dokumentiert (`regime_gate_backtest_v2.py` Z. 88–90, `market_aggregator.py` Z. 9053). Möglich ist eine Parameterwahl im Testzeitraum.
* Track Record: Für Titel ohne Kurs bei Fälligkeit fehlt eine Regel zur Endbewertung (letzter Kurs bzw. Übernahmepreis statt Ausschluss). Vor externer Nutzung als Beleg lösen.
* Survivorship-Messung: 22–33 ungeklärte Titel je Stichtag. Es fehlen Delisting-Renditen; die Index-Lücke beruht auf einer Community-Quelle (`hanshof`), nicht auf Lizenzdaten.

## 6. Fehler und Korrekturen dieser Session

* `survivorship_gap.py` v1.1: Der SPAC-Filter wurde fälschlich auch auf die Abgleichslisten angewandt und erhöhte „ungeklärt“. In v1.1.1 korrigiert; Axels Neulauf bestätigte den Rückgang.
* Indexlauf zunächst ohne Mitgliederdatei gescheitert; die Datei wurde nachgeladen und das Format geprüft (`date,tickers`, 1996–2025).
* Die Angabe „DCE-Backtest 1,66“ war eine Fehlzuschreibung; laut SUITE betraf sie den Gate-A-Backtest.
* Der Auditbericht wurde zunächst versehentlich als Claude Doc erstellt und wieder gelöscht. Maßgeblich ist die MD-Datei.

## 7. Verweise

* `docs/AUDIT-GO-K2-SURVIVORSHIP-2026-11-23.md` (Auditbericht)
* `docs/SUITE-BACKLOG-QUELLENREGELN-ECKERT.md` (Backlog-Entwurf)
* `SUITE.md` №34 (Z. 397–560), `docs/SWOT-ANALYSE-2026-08-07.md` (Go/No-Go-Kriterien)
* `uiq-devtools/survivorship/` (Skript und README)
