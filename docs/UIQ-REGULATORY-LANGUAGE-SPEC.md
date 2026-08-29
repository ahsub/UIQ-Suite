# UIQ Regulatory Language Specification

**Version:** 1.1
**Stand:** 29.08.2026
**Status:** Entwurf — Grundlage für das Legal Briefing an den Fachanwalt (vgl. SUITE.md Backlog №36)
**Ablage:** `ahsub/UIQ-Suite/docs/UIQ-REGULATORY-LANGUAGE-SPEC.md`
**Geltung:** Verbindlich für alle KI-generierten Public-Mode-Outputs der UIQ-Suite (Options Desk, Morning Briefing, Master Shortlist, Deep Dive). Single Source für Sprachregeln — Modul-Prompts implementieren diese Spec, sie ersetzen sie nicht. Bei Widerspruch zwischen einem Modul-Prompt und dieser Spec gilt die Spec.
**Fortschreibung:** Claude, versioniert, analog SUITE.md.
**Nicht Gegenstand dieses Dokuments:** der EIC/Owner-Modus. Dieser bleibt bewusst unverändert und direktiv (s. SUITE.md Backlog №65/№66) — diese Spec gilt ausschließlich für Public-Mode-Output.

---

## 0. Zweck

Vier Review-Zyklen am CSP(ATM/NA)-Output (28.–29.08.2026, externe Rechtsberatung) haben denselben Fehlermodus wiederholt aufgedeckt: einzelne, unabhängig voneinander problematische Formulierungen, die sich mit jeder Runde verschoben statt strukturell verschwunden sind. Dieses Dokument beendet den Einzelfall-Zyklus und definiert **einmal, für alle Module**, was UIQ im Public-Modus sagen darf, was nicht, und mit welchen Ersatzformulierungen. Der Fachanwalt bekommt damit kein abstraktes Produktversprechen, sondern ein konkret geprüftes Sprachverhalten.

**Leitunterscheidung, die die gesamte Spec trägt** (Review-Zyklus 4, 29.08.2026):

> „hoher Strategy Fit" ≠ „hohe Gewinnwahrscheinlichkeit" ≠ „gute Anlage"

UIQ bewertet ausschließlich die erste Größe — Übereinstimmung eines Titels mit einem definierten, offengelegten Kriterienkatalog. Die zweite und dritte Größe sind ökonomische bzw. individuelle Urteile, die UIQ nicht besitzt (keine Live-Optionskette, keine Kenntnis der individuellen Risikolage) und deshalb nicht formulieren darf.

---

## 1. Universelle Prinzipien (gelten für ALLE Module)

Diese Prinzipien gelten für Morning Briefing, Master Shortlist, Deep Dive, CSP/Wheel, CSP(ATM/NA), Covered Call, Collar, Momentum, Swing, Breakout, VCP, Mean-Reversion, Dividend, Value, Fading-Short und KO gleichermaßen.

### 1.1 UIQ darf

- Strategy Fit / Score / Ranking berechnen und offenlegen
- Kandidaten anhand transparenter Kriterien ordnen
- positive und negative Faktoren je Kandidat benennen
- Titel wegen Nichterfüllung der Kriterien ausschließen
- Marktregime und Strategie-Kompatibilität bewerten
- erklären, **warum** ein Titel modellintern höher oder niedriger steht
- Risiken und Modellsignale benennen

### 1.2 UIQ darf NICHT

- zu Kauf, Verkauf, Eröffnen, Schließen, Rollen oder Halten einer konkreten Position auffordern — weder direkt noch indirekt (ESMA fasst „Investment Recommendation" auch bei indirekter/nicht-technischer Sprache weit; ein „Keine Anlageberatung"-Disclaimer hebt das nicht auf)
- konkrete Optionsparameter bestimmen oder in Aussicht stellen (Strike, Delta, Prämie, PoP, Break-even, Assignment-Wahrscheinlichkeit) — UIQ hat keine Live-Optionskette
- unbelegte Kausalketten behaupten (s. §1.4)
- eine individuelle Eignung des Nutzers beurteilen (UIQ bewertet ein Modell, nicht die Person)
- Modellwerte quantitativ „verrechnen", ohne dass diese Methodik im Output offengelegt ist (z. B. „Grade C wird durch X kompensiert" suggeriert eine Rechenoperation, die nicht sichtbar ist)

### 1.3 Begriffs-Integrität (Review-Zyklus 4, neu — kein Sprach-, sondern Faktenproblem)

Ein Fehler dieser Klasse ist gefährlicher als eine zu direktive Formulierung, weil er die fachliche Glaubwürdigkeit trifft, nicht nur die regulatorische Einordnung:

- **Kein Indikator-Alias.** UIQs eigene, definierte Indikatoren (z. B. HVP = Historical Volatility Percentile) dürfen niemals durch einen ähnlich klingenden, aber fachlich anderen Begriff ersetzt werden (z. B. "IV-Percentile" = Implied Volatility Percentile — eine andere Größe, die UIQ nicht hat). Jeder Indikator wird ausschließlich mit seinem im Suite-Glossar definierten Namen verwendet (SUITE.md §3.1).
- **Richtungskonsistenz bei Extremwert-Labeln.** RSI > 70 ist **überkauft**, RSI < 30 ist **überverkauft** — ein Label muss zur tatsächlichen Zahl passen. Vor Ausgabe: Richtung gegen den Zahlenwert prüfen, nicht aus dem Kontext raten.
- **Keine Verwechslung von Modellsignal und Tatsachenaussage.** "Das Modell bewertet X als Risikofaktor" ist zulässig; "X ist riskant" ohne Modellbezug ist eine Tatsachenbehauptung, die UIQ nicht belegen kann.

### 1.4 Kausalitäts-Integrität (Review-Zyklus 4, neu)

Verboten sind mehrgliedrige Kausalketten, die aus den dargestellten Daten nicht folgen — unabhängig davon, ob sie regulatorisch harmlos wirken. Beispiel aus dem Review: *"komprimierte Prämie → höhere Wahrscheinlichkeit → zügige Gewinnmitnahme"* ist aus HVP/RSI/ATR-Werten nicht ableitbar. Ebenso verboten: *"RSI 30 → Gegenbewegung → keine Andienung"* — eine mögliche Gegenbewegung schließt eine Andienung nicht aus, das Modell kann das nicht vorhersagen. Regel: jede Aussage endet an der Stelle, die die vorliegenden Daten tatsächlich hergeben; die nächste inferentielle Stufe ("und deshalb passiert dann Y") wird nicht mitgeliefert, auch wenn sie plausibel klingt.

### 1.5 Ausschluss-Framing

Nichterfüllung von Kriterien wird immer modellbezogen begründet, nie als Urteil über die Aktie oder den Nutzer:

- Richtig: "Erfüllt die Kriterien nicht" / "reduziert den Strategy Fit"
- Falsch: "ist für dich nicht geeignet" / "disqualifiziert" (suggeriert harte algorithmische Verwerfung statt Kriterien-Abwägung)

### 1.6 Zahlen- und Parameterhoheit

Siehe §4 — konkrete, handelsrelevante Zahlen (Strike, Delta, Prämie, Stop-Loss-Kurs, PoP, Break-even, Positionsgröße) werden **nie** von UIQ ausgegeben, auch nicht gehedgt oder als Schätzung. Objektive Scan-Rohdaten (HVP, RSI, ATR, D200, Kurs, Score) sind KEINE handelsrelevanten Parameter in diesem Sinne und bleiben zulässig — sie beschreiben die Datenlage, nicht die Handlung.

**Ergänzung Review-Zyklus 4:** Auch gehedgte Prämien-Richtungsaussagen ("kann grundsätzlich mit höheren Prämien einhergehen") sind zu vermeiden, wo sie keinen zusätzlichen Erkenntniswert liefern — Regel: wenn der einzige Inhalt der Aussage eine unbelegte Prämien-Richtung ist, ersatzlos durch den reinen Broker-Verweis ersetzen (§4).

### 1.7 Abschließender Abschnitt

Ein zusammenfassender Abschnitt ist zulässig, aber ausschließlich im Format "UIQ [Modul/Strategie] ZUSAMMENFASSUNG" (s. §5) — er wiederholt bereits genannte Kriterien-Übereinstimmungen und schließt mit dem Pflichtverweis auf externe Prüfung. Er enthält **niemals** eine neue Präferenz, ein Gesamturteil oder eine Handlungsanweisung.

---

## 2. Verboten — konsolidierte Wortliste (alle vier Review-Zyklen)

Nicht abschließend; sinngemäße Entsprechungen sind ebenso verboten.

**Direkte Handlungsaufforderung:** kaufen, verkaufen, jetzt handeln, Trade eröffnen, einsteigen, aussitzen, Fokus auf, priorisieren, solltest du, Empfehlung, Handlungsorientierte Einschätzung, Handeln:

**Superlative/Werturteile ohne Modellbezug:** optimal, optimalerweise, attraktiv/Attraktivität, beste Aktie/Titel für dich, optimaler Trade, maximale Prämie, beste Rendite, Gewinnwahrscheinlichkeit

**Implizite Strike-/Parameterbestimmung:** "Strike sollte ... validiert werden", ATM-Strike-Empfehlung, Prämien-Schätzung als Zahl, Prämienerwartung (auch gehedgt, s. §1.6)

**Quantitative Verrechnungs-Suggestion:** "wird kompensiert durch", "disqualifiziert"

**Kausalketten ohne Datenbasis:** jede mehrgliedrige "X führt zu Y führt zu Z"-Konstruktion ohne direkten Datenbeleg (s. §1.4)

**Unnötig dramatisierte Fachsprache:** "forced Assignment", "militärisch präzise", "aggressiv einsatzfähig"

**Ranking-Framing als Empfehlung:** "Top-Kandidaten", "identifiziert als ... top-gerankt", "Kandidat" (isoliert als Empfehlungs-Substitut)

**Marktumfeld-Framing als Handlungssignal:** "strukturelle Attraktivität für [Strategie]", "begünstigt [Parameter]", "unterstützt [Strategie]-Setups"

**Regulatorisch unzulässige Ausschlusssprache:** "ist für dich nicht geeignet" (statt "erfüllt die Kriterien nicht")

---

## 3. Bevorzugte Ersatzformulierungen (Pflichtmuster)

| Statt | Immer | Kontext |
|---|---|---|
| "Fokus auf X + Y" | "X und Y weisen den höchsten Strategy Fit auf" | Ranking-Ergebnis |
| "optimal/attraktiv für [Strategie]" | "hoher Strategy Fit für die betrachtete [Strategie]" / "kompatibel mit den definierten Kriterien" | Marktumfeld-Einschätzung |
| "reduziert Risiko X erheblich" | "wird vom Modell als unterstützender Kontext bewertet; das individuelle Risiko bleibt bestehen" | Risikoreduktions-Aussagen |
| "Andienung nicht auszuschließen" | "Eine Kursbewegung unterhalb des Strike kann zu einer Andienung führen; dieses Ereignis wird durch die im Modell berücksichtigten Faktoren nicht ausgeschlossen." | Assignment-Risiko |
| "RSI 30 → Gegenbewegung → keine Andienung" | "RSI [Wert] weist auf eine kurzfristig [schwache/starke] Kurslage hin. Eine weitere Kursbewegung [unterhalb/oberhalb] des Strike kann daher nicht ausgeschlossen werden." | RSI-Interpretation ohne Kausalsprung |
| "Strike sollte modellseitig validiert werden" | "Die konkrete Strike-Auswahl sowie die zugehörigen Optionsparameter sind außerhalb von UIQ im Broker zu prüfen." | Strike-Referenz |
| "Prämienerwartung: ..." / "Kann mit höheren Prämien einhergehen" | "Die tatsächliche Optionsprämie und Liquidität sind außerhalb von UIQ zu prüfen." | Prämien-Aussagen (Default: ganz weglassen, s. §1.6) |
| "Grade C wird durch X kompensiert" | "Grade C stellt einen negativen Faktor dar; [Kontext] wirkt im Modell jedoch nicht als Ausschlusskriterium." | Gegenläufige Faktoren |
| "disqualifizieren" | "reduzieren den Strategy Fit" | Negative Faktoren-Kombination |
| "forced Assignment" | "kann das Risiko einer Ausübung/Zuteilung erhöhen" | Assignment-Terminologie |
| "ist für dich nicht geeignet" | "erfüllt die Kriterien nicht" | Ausschluss |
| "Die Modell-Analyse identifiziert X als top-gerankt" | "Unter Anwendung der definierten Modellkriterien weisen [Titel] im betrachteten Snapshot den höchsten Strategy Fit innerhalb der untersuchten [Strategie]-Kandidaten auf." | Abschluss-Zusammenfassung (Pflicht-Satzmuster, wortgetreu) |

---

## 4. Datenhoheit — was ausschließlich beim Broker bleibt

UIQ hat keine Live-Optionskette und bestimmt daher **nie**:

- Konkreter Strike-Preis
- Delta-Wert
- Tatsächliche Optionsprämie (Bid/Ask, Mid)
- Probability of Profit (PoP), Break-even
- Open Interest, Spread, Liquidität einer konkreten Serie
- Earnings-Termin als bestätigtes Datum (nur als Modell-Hinweis "im Kalenderfenster zu prüfen")
- Positionsgröße, Kontraktanzahl, Margin-Anforderung in konkreten Zahlen

Jede Nennung dieser Größen im Output — auch als Schätzung, auch gehedgt — ist ein Verstoß. Der Pflichtverweis lautet einheitlich: *"[Größe] sind außerhalb von UIQ im Broker zu prüfen."*

Zulässig bleiben ausschließlich objektive, bereits im Scan berechnete Rohdaten (HVP, RSI, ATR, D200, Kurs, Grade/Score, Distanz zu gleitenden Durchschnitten) — diese beschreiben die Datenlage, nicht die Handlung, und sind Kern des UIQ-USP (s. §0).

---

## 5. Pflicht-Abschlussformulierung

### 5.1 Abschnitt "ZUSAMMENFASSUNG" (sofern vorhanden)

Pflicht-Satzmuster für den Einstieg, wortgetreu zu übernehmen (Platzhalter füllen):

> "Unter Anwendung der definierten Modellkriterien weisen [Titel] im betrachteten Snapshot den höchsten Strategy Fit innerhalb der untersuchten [Strategie]-Kandidaten auf."

Danach ausschließlich der Pflichthinweis auf externe Prüfung (§4), keine weitere Wertung.

### 5.2 Fußzeile (alle Module)

Unverändert: *"Keine Anlageberatung · Eigene Prüfung erforderlich"* (bzw. die längere Fassung im Morning Briefing: *"UnderlyingIQ ist ein privates Analyse-Werkzeug. Alle Inhalte dienen ausschließlich der persönlichen Information und stellen keine Anlageberatung oder Empfehlung im Sinne des WpHG dar. Investitionsentscheidungen liegen allein in der Verantwortung des Nutzers."*)

---

## 6. Modul-spezifische Ergänzungen und Umsetzungsstatus

| Modul | §1–§5 bereits im Code umgesetzt? | Fundstelle | Bemerkung |
|---|---|---|---|
| CSP(ATM/NA) | ✅ Ja, 4 Review-Zyklen durchlaufen | `ko-prompts.js` `atmna` + `_publicOptionsPrompt` | Referenz-Implementierung dieser Spec |
| CSP/Wheel | ✅ Ja (gleicher Builder) | `ko-prompts.js` `csp_wheel` | Noch nicht separat extern reviewed — Struktur identisch zu ATM/NA |
| Covered Call | ✅ Ja (gleicher Builder) | `ko-prompts.js` `cc` | Noch nicht separat extern reviewed |
| Weekly Income | ✅ Ja (gleicher Builder) | `ko-prompts.js` `weekly_income` | Noch nicht separat extern reviewed |
| Collar | ✅ Ja (gleicher Builder) | `ko-prompts.js` `collar` | Noch nicht separat extern reviewed |
| Momentum, Breakout, VCP, Swing, Mean-Reversion, Dividend, Value, Fading-Short, KO | ✅ Ja (`_publicEquityPrompt`) | `ko-prompts.js` je Strategie | Noch nicht extern reviewed — Equity-Builder hat keine Options-spezifischen Probleme (§4 Datenhoheit betrifft primär Options-Module), aber §1.3/§1.4 (Begriffs-/Kausalitäts-Integrität) gelten gleichermaßen und sind dort NICHT explizit getestet |
| Morning Briefing | 🟡 Teilweise | `ko-ai.js` `morning_public` System-Prompt | Extern reviewed (28.08.), gut bewertet; 3 offene Wortlaut-Punkte aus Review 1 noch nicht umgesetzt (s. SUITE.md, "Gesamteinschätzung"-Zeile, CSP-Weekly-Contango-Nuance, BULL_QUIET-vs-Distribution-Spannung) |
| Master Shortlist | ❌ Nein | `market_aggregator.py` `enrich_shortlist_with_ai()` | Backlog №61 filtert bereits die *Zahlen* (t.ki-Feld) für Public — die *Sprache* der verbleibenden Textfelder (`note`, `keyRisk`) ist noch nicht gegen diese Spec geprüft |
| Deep Dive | ❌ Nein | `ko-ai.js` `deep_dive` Actions | Noch nicht begonnen — laut Reviewer (Review 1, Punkt ③) nächster Prüfschritt nach Options-Desk |

**Priorisierung für Fortsetzung** (Vorschlag, nicht entschieden): Master Shortlist vor Deep Dive, weil Master Shortlist bereits eine Teilfilterung hat und der verbleibende Aufwand kleiner ist; Equity-Strategien (Momentum/Breakout/etc.) vor Deep Dive, weil sie denselben Builder wie die bereits geprüften Options-Strategien nutzen und daher wahrscheinlich dieselbe Fehlerklasse aufweisen.

---

## 7. Technische Umsetzung — Single Source

Diese Spec beschreibt das **Soll**; `ko-prompts.js` (Konstante `PUBLIC_REGULATORY_GUARDRAIL`, ab v2.6.0) implementiert es. Eine Abweichung zwischen Spec und Code ist ein Bug, nicht eine Ermessensfrage. Wird ein Regel-Update nötig (z. B. durch einen neuen Fund in einem noch nicht geprüften Modul), wird **zuerst diese Spec fortgeschrieben, danach der Code angepasst** — nicht umgekehrt, damit die Spec ihren Anspruch als Single Source für den Fachanwalt behält (SUITE.md Grundgesetz #1).

Aktueller Code-Stand: `ko-prompts.js` v2.8.0 (Commit-Hash zum Zeitpunkt dieser Fassung: siehe `axel-scanner/index.html` CDN-Pin). §1.3 und §1.4 dieser Spec (Begriffs-/Kausalitäts-Integrität) sind zum Zeitpunkt v1.0 dieses Dokuments **noch nicht** in `PUBLIC_REGULATORY_GUARDRAIL` kodiert — offener Folgeschritt, s. §9.

---

## 8. Herkunft — vier Review-Zyklen

| Zyklus | Datum | Kernbefund | Code-Reaktion |
|---|---|---|---|
| 1 | 28.08.2026 | Morning Briefing gut; ATM/NA enthält direkte Handlungsanweisung ("Handeln: WMT priorisieren", Quelle: `ki_briefing_expert`-System-Prompt) | Entscheidung: EIC-Modus bleibt unverändert (persönlicher Eigengebrauch); Public-Template-Ebene wird geprüft (→ SUITE.md №65) |
| 2 | 29.08.2026 | 14-Template-Public/EIC-Split zeigt Wirkung; Rest-Fund: unaufgefordertes Fazit mit Ranking-Charakter | `ko-prompts.js` v2.6.0→v2.6.1: Fazit-Verbot |
| 3 | 29.08.2026 | Struktur gut; 6 lexikalische Einzelstellen (optimal, Andienung-Kausalsprung, Strike-Validierung, Prämienerwartung, Attraktivitäts-Framing, Zusammenfassungs-Satzbau) | `ko-prompts.js` v2.6.1→v2.7.0→v2.8.0: expliziter Wortfilter + Pflichtsatzmuster |
| 4 | 29.08.2026 | Struktur "deutlich sauberer"; Rest sind Kausalitäts-/Begriffsfehler (unbelegte Kausalketten, RSI-Richtungsfehler, HVP/IV-Verwechslung), kein regulatorisches Problem mehr im engeren Sinne — Reviewer empfiehlt Wechsel von Einzelfall-Review zu dieser Spec | Dieses Dokument (§1.3/§1.4 neu) — Code-Umsetzung offen, s. §9 |

---

## 9. Offene Punkte (v1.0 → v1.1)

1. **§1.3/§1.4 in `PUBLIC_REGULATORY_GUARDRAIL` kodieren** (Begriffs-Integrität, Kausalitäts-Integrität) — noch nicht umgesetzt, da Axel zunächst diese Spec vor dem nächsten Code-Zyklus wollte (s. §7-Prinzip).
2. **Prämienerwartungs-Satz ersatzlos streichen statt hedgen** — v2.8.0 verlangt noch Hedging ("kann grundsätzlich..."), §1.6/§3 dieser Spec verlangt jetzt ersatzlose Streichung zugunsten des reinen Broker-Verweises. Code-Nachzug offen.
3. **Modul-Rollout** gemäß §6-Priorisierung (Master Shortlist → Equity-Strategien → Deep Dive) — noch nicht begonnen.
4. **Verweis aus SUITE.md** — Backlog-Eintrag mit Link auf dieses Dokument ergänzen (analog OPTIONSMODUL-ARCHITEKTUR.md).

---

## 10. Belastungstest v1.0 (29.08.2026, externe Rechtsberatung, Zyklus 5)

Zweck: Nicht mehr fragen "verstößt eine konkrete Formulierung gegen die Spec?", sondern "kann ein Output, der die Spec vollständig einhält, trotzdem als Investment Recommendation gelesen werden?" — die Perspektive eines kritischen BaFin-/ESMA-orientierten Prüfers. Für jeden Grenzfall: (a) was die Spec heute erlaubt, (b) das adversariale Argument dagegen, (c) Verdikt und ggf. Nachschärfung.

### 10.1 "höchster Strategy Fit"

**Erlaubt (§1.1, §5):** als Modellfeststellung, gebunden an das Pflicht-Satzmuster.
**Adversariales Argument:** isoliert zitiert ("AMZN hat den höchsten Strategy Fit") liest sich wie eine Rangfolge-Aussage über die Anlagequalität, unabhängig davon, wie sie im Volltext eingebettet ist — ESMA prüft nicht nur den Volltext, sondern auch, wie eine Aussage isoliert wirken könnte (Screenshot-Weiterleitung, Zitat).
**Verdikt: 🟡 Restrisiko, aber die Leitunterscheidung (§0) mitigiert es strukturell.**
**Nachschärfung:** Die §0-Leitunterscheidung ("Strategy Fit ≠ Gewinnwahrscheinlichkeit ≠ gute Anlage") darf nicht nur im internen Dokument stehen — sie muss im tatsächlichen UI-Output an geeigneter Stelle sichtbar sein (z. B. als fester Kopf- oder Fußtext jedes Strategy-Fit-Outputs), damit sie auch bei isolierter Zitierung mitgelesen wird. **Neuer Punkt für §9/§11 (Umsetzung offen).**

### 10.2 Score 99 / Grade A+

**Erlaubt (§1.6):** objektive Scan-Rohdaten, keine Handlungsparameter.
**Adversariales Argument:** ein prominent, farblich hervorgehobenes "A+" oder "99%" kann als De-facto-Empfehlungssignal wirken, unabhängig vom Fließtext — das ist eine UI-/Design-Frage, keine Sprachfrage, und liegt damit außerhalb des heutigen Geltungsbereichs dieser Spec (Titel: "Language Specification").
**Verdikt: 🟡 Echte Lücke — die Spec deckt nur Text, nicht visuelle Gewichtung ab.**
**Nachschärfung:** Scope-Erweiterung oder Schwesterdokument nötig: eine Prüfung, ob Grade-/Score-Badges im UI (Farbe, Größe, Position) selbst empfehlungsartig wirken (Anschluss an SUITE.md §3.4 Design-System). **Nicht Teil dieser Sprach-Spec — als eigener Punkt vormerken, s. §11.**

### 10.3 Ranking (Platz 1/2/3, TOP 3)

**Erlaubt (§1.1):** Ranking ist ausdrücklich zulässig.
**Adversariales Argument:** eine nummerierte Reihenfolge (auch ohne das Wort "Kandidat") transportiert Präferenzintensität allein durch die Position — Platz 1 wirkt wie "das Beste".
**Verdikt: 🟢 Vertretbar.** Der Reviewer selbst bewertet Ranking als Kernbestandteil des USP und nicht per se problematisch — die Nummerierung beschreibt eine Modell-Sortierung nach offengelegten Kriterien, kein Rendite-Ranking. Solange das Pflicht-Satzmuster (§5.1) die Sortierlogik jedes Mal explizit benennt ("den höchsten Strategy Fit … auf"), bleibt die Zuordnung Modell-Sortierung → Position transparent.
**Keine Nachschärfung nötig.**

### 10.4 Ausschluss einzelner Aktien

**Erlaubt (§1.5):** "erfüllt die Kriterien nicht", nie "ist für dich nicht geeignet".
**Adversariales Argument:** die Nennung eines konkreten Titels mit negativer technischer Begründung (z. B. "BA: RSI 11, erfüllt Kriterien nicht") ist strukturell eine negative Einzeltitel-Aussage — MAR erfasst Kauf- UND Verkaufs-/Meidungs-Empfehlungen gleichermaßen.
**Verdikt: 🟡 Restrisiko, spiegelbildlich zu 10.1.**
**Nachschärfung:** Ausschlussbegründung IMMER explizit auf die betrachtete Strategie skalieren, nie auf den Titel insgesamt — Pflichtformulierung ergänzen: "…erfüllt die Kriterien der [Strategie] nicht" statt nur "erfüllt die Kriterien nicht" (Bezug fehlt sonst). **Kleine Ergänzung zu §3-Tabelle, s. §11.**

### 10.5 Marktregime + Strategie (aggregiert)

**Erlaubt:** Kernarchitektur der Decision Pyramid (SUITE.md §0).
**Adversariales Argument:** keines mit substanziellem Gewicht — Aggregatebene ohne Einzeltitelbezug ist regulatorisch die unkritischste Ebene des gesamten Systems.
**Verdikt: 🟢 Unkritisch.** Deckt sich mit der guten Bewertung des Morning Briefings in Zyklus 1.

### 10.6 "kompatibel mit den definierten Kriterien"

**Erlaubt (§3):** Pflicht-Ersatzformulierung für "attraktiv/optimal".
**Adversariales Argument:** faktisch dieselbe Aussage wie "höchster Strategy Fit" in anderer Formulierung — dieselbe Analyse wie 10.1 gilt sinngemäß.
**Verdikt: 🟢 Vertretbar unter derselben Bedingung wie 10.1** (Leitunterscheidung muss mitgelesen werden können).

### 10.7 Konkrete RSI-/HVP-/ATR-Konstellationen

**Erlaubt (§1.6, §4):** objektive Rohdaten, kein Handlungsparameter.
**Adversariales Argument:** die Kombination mehrerer Rohdaten zu einem Gesamtbild ("RSI 30 + HVP 96% + Grade A") ist faktisch eine sichtbar gemachte Scoring-Formel, die der Nutzer selbst als Kaufsignal interpretieren könnte, auch ohne dass UIQ es ausspricht.
**Verdikt: 🟢 Vertretbar, gut abgesichert durch Präzedenz.** Dieselbe Funktionalität bieten etablierte, nicht als Anlageberatung eingestufte Screener (Finviz, TradingView) — transparente Kriteriendarstellung ohne eigene Schlussfolgerung ist Standard-Screener-Funktionalität, keine Beratung. Diese Präzedenz ist im Legal Briefing ausdrücklich zu nennen.

### 10.8 Roll-Hinweise

**Status:** Im Public-Modus aktuell **gar nicht enthalten** — die Rollstrategie-Sektion existiert ausschließlich im EIC-Zweig (unverändert, s. №65/№66).
**Verdikt: 🟢 Grenzfall entfällt für Public.** Kein Handlungsbedarf; zur Klarheit in §6-Tabelle ergänzen, dass Roll-Hinweise bewusst EIC-exklusiv sind, nicht nur "noch nicht portiert".

### 10.9 CSP/Wheel

**Status:** Gleicher Builder wie ATM/NA (§6-Tabelle), aber **nicht separat live-getestet** — alle vier Review-Zyklen liefen ausschließlich gegen ATM/NA-Output.
**Verdikt: 🟡 Ungeprüfte Annahme.** Strukturelle Identität ist keine Garantie für inhaltliche Gleichwertigkeit (unterschiedliche Kandidaten, unterschiedliche Kriterien-Texte im `focus`-Array könnten andere Formulierungs-Fallstricke hervorbringen).
**Nachschärfung:** Vor Anwaltstermin mindestens einen Live-Test-Zyklus für `csp_wheel` durchführen (analog zu ATM/NA) — s. §11 Priorität 1.

### 10.10 "hoher Strategy Fit" bei einem einzelnen Titel (isolierte Betrachtung)

**Adversariales Argument:** Ohne Vergleichsrahmen (kein "Top 3 von X Kandidaten") wirkt eine Einzeltitel-Aussage deutlich direktiver — es fehlt der relativierende Kontext "im Vergleich zu anderen Titeln".
**Verdikt: 🔴 Höheres Restrisiko als bei Multi-Kandidaten-Rankings.** Dies betrifft strukturell den Deep Dive (s. 10.12) und jede zukünftige Einzeltitel-Ansicht.
**Nachschärfung:** Neue Pflichtregel für Einzeltitel-Kontexte: der Strategy-Fit-Satz muss immer einen Universums-Bezug enthalten ("… im Vergleich zu den im aktuellen Scan erfassten [N] Titeln …"), niemals eine freistehende Aussage ohne Vergleichsrahmen. **Für §3/§4 zu ergänzen, s. §11.**

### 10.11 Morning Briefing mit mehreren Strategien

**Status:** Bereits extern reviewt (Zyklus 1), gut bewertet.
**Verdikt: 🟢 Niedriges Restrisiko.** Aggregatebene ohne Einzeltitelbezug (analog 10.5); die drei in Zyklus 1 offen gebliebenen Wortlaut-Punkte (SUITE.md, "Gesamteinschätzung"-Zeile etc.) bleiben als separater, kleinerer Nachzug bestehen.

### 10.12 Deep Dive eines vom Nutzer selbst gewählten Tickers

**Status:** Noch nicht begonnen (§6-Tabelle: ❌).
**Adversariales Argument — das schärfste im gesamten Test:** Deep Dive kombiniert das Einzeltitel-Risiko aus 10.10 mit einem zusätzlichen Faktor: der Nutzer hat den Titel selbst ausgewählt, bevor UIQ antwortet. Ein "hoher Strategy Fit"-Urteil auf genau den Titel, den der Nutzer erkennbar bereits im Blick hat, liegt inhaltlich sehr nah an einer personalisierten Reaktion auf eine erkennbare Handlungsabsicht — das ist der Bereich, in dem BaFin bei "einfachen digitalen Tools" bereits auf die tatsächliche Funktionalität statt auf den Disclaimer abgestellt hat (s. Review-Zyklus 2, Punkt 10).
**Verdikt: 🔴 Höchstes Restrisiko im gesamten System — höchste Priorität für Rollout.**
**Nachschärfung:** Deep Dive braucht eigene, zusätzliche Sprachregeln über §1–§9 hinaus, bevor Public-Rollout — mindestens: (a) Pflicht-Universumsbezug wie in 10.10, (b) explizite Trennung zwischen "Modellbewertung dieses einen Titels" und jeder Formulierung, die auf die erkennbare Nutzerabsicht eingeht (kein "für deine Position", kein "da du diesen Titel ansiehst"), (c) ggf. ein zusätzlicher, auffälligerer Disclaimer-Satz speziell für nutzerinitiierte Einzeltitel-Abfragen. **Höchste Priorität, s. §11.**

### 10.13 Gesamtverdikt des Belastungstests

Die Spec v1.0 hält der adversarialen Prüfung für **aggregierte und Multi-Kandidaten-Kontexte gut stand** (10.3, 10.5, 10.6, 10.7, 10.11 — durchweg 🟢). Das systematische Restrisiko konzentriert sich auf **Einzeltitel-Kontexte ohne Vergleichsrahmen** (10.1, 10.10, 10.12 — 🟡/🔴) sowie auf zwei Lücken außerhalb des heutigen Geltungsbereichs (10.2 UI/Design, 10.9 fehlender Live-Test für CSP/Wheel). Kein Befund zwingt zu einer strukturellen Neukonzeption — alle Nachschärfungen sind additive Pflichtformulierungen bzw. Scope-Klarstellungen, keine Kurskorrektur. Das bestätigt den Reviewer-Befund: die Architektur ist richtig, es fehlt noch Feinschliff an den Rändern.

---

## 11. Priorisierte Maßnahmenliste (aus §10, vor Anwaltstermin)

1. **Deep Dive — eigene Sprachregeln vor jedem Rollout** (aus 10.12, höchste Priorität; Deep Dive ist ohnehin noch nicht begonnen, s. §6)
2. **Universums-Bezugspflicht für alle Einzeltitel-Kontexte** (aus 10.10, betrifft auch Deep Dive)
3. **CSP/Wheel live testen** (aus 10.9, vor Anwaltstermin, da strukturelle Identität zu ATM/NA nur Annahme ist)
4. **§1.3/§1.4-Kodierung in `PUBLIC_REGULATORY_GUARDRAIL`** (aus §9, von Axel/Reviewer als zwingend vor Anwaltstermin bestätigt)
5. **Prämienerwartungs-Satz ersatzlos streichen statt hedgen** (aus §9, Code-Nachzug)
6. **Ausschlussformulierung auf Strategie skalieren** ("erfüllt die Kriterien der [Strategie] nicht", aus 10.4)
7. **Leitunterscheidung (§0) muss im UI-Output sichtbar sein, nicht nur im internen Dokument** (aus 10.1/10.6)
8. **UI-/Design-Prüfung für Grade-/Score-Badges** als eigenständiger Folgepunkt, außerhalb dieser Sprach-Spec (aus 10.2) — Kandidat für ein Schwesterdokument, kein Blocker für den Anwaltstermin

---



| Version | Datum | Änderung |
|---|---|---|
| 1.1 | 29.08.2026 | §10 (neu): adversarialer Belastungstest gegen 12 vom Reviewer benannte Grenzfälle (Review-Zyklus 5) — Methodik: nicht "verstößt X gegen die Spec", sondern "kann ein spec-konformer Output trotzdem als Investment Recommendation gelesen werden". Ergebnis: Multi-Kandidaten-/Aggregatkontexte halten gut stand (🟢), Restrisiko konzentriert sich auf Einzeltitel-Kontexte ohne Vergleichsrahmen — insbesondere Deep Dive bei nutzerinitiierter Ticker-Wahl (10.12, höchstes Risiko im System) und isolierte Einzeltitel-Strategy-Fit-Aussagen (10.10). Zwei Lücken außerhalb des Sprach-Scopes identifiziert: UI/Design-Wirkung von Grade-Badges (10.2) und fehlender Live-Test für CSP/Wheel (10.9). §11 (neu): priorisierte 8-Punkte-Maßnahmenliste vor Anwaltstermin.
| 1.0 | 29.08.2026 | Erstfassung nach vier externen Review-Zyklen zum CSP(ATM/NA)-Output. Konsolidiert alle bisherigen Wortverbote/Ersatzformulierungen aus `ko-prompts.js` v2.6.0–v2.8.0, ergänzt neue Kategorien Begriffs-Integrität (§1.3) und Kausalitäts-Integrität (§1.4) aus Review-Zyklus 4, die im Code noch nicht abgebildet sind. Modul-Rollout-Status (§6) und offene Punkte (§9) dokumentiert. |
