# Investment-Suite — Dachdokument

**Version:** 3.1
**Stand:** 03.08.2026
**Ablage:** `ahsub/UIQ-Suite/SUITE.md` (Single Source; Kopie in ko-aggregator/docs ist Verweis-Stub)
**Geltung:** Verbindlich für alle Suite-Module. Bei Widerspruch zwischen diesem Dokument und einer Modul-STRATEGIE gilt: Grundgesetze und Konsistenz-Standards aus SUITE.md schlagen Modul-Regeln; fachliche Modul-Spezifika bleiben Sache der Module.
**Fortschreibung:** Claude, versioniert, analog den Modul-Strategiedokumenten.

---

## 0. UIQ-Leitprinzip (verbindlich, schlägt alle anderen Abschnitte)

### Die Mission

> **UIQ unterstützt Investoren dabei, in jeder Marktphase die zu ihrer persönlichen Situation passende Investmentstrategie zu finden und vermeidbare Fehler zu reduzieren – nicht indem es Entscheidungen ersetzt, sondern indem es den Entscheidungsprozess verbessert.**

UIQ ist kein Aktien-Finder, kein Rendite-Maximierer, kein Signal-Generator. UIQ ist ein **Fehler-Reduzierer**. Zuerst die großen, vermeidbaren Fehler reduzieren — dann erst nach zusätzlicher Rendite suchen.

> *"Regel 1: Verliere kein Geld. Regel 2: Vergiss Regel 1 nicht."* — Warren Buffett

### Das diagnostische Entscheidungssystem

> UIQ ist ein diagnostisches Entscheidungssystem, das Marktzustand, Anlegerprofil und Handelsstrategien miteinander verbindet, um Investoren dabei zu helfen, bessere und risikoärmere Entscheidungen zu treffen.

UIQ entscheidet über drei Dinge — in dieser Reihenfolge:

```
1. OB gehandelt werden sollte.
2. WIE gehandelt werden sollte.
3. WAS gehandelt werden sollte.
```

**Die Reihenfolge ist Architektur, nicht Konvention.** Gate 1 (Ob) ist ein echter Filter: wenn der Marktkontext gegen aktives Handeln spricht, werden Gate 2 und 3 nicht geöffnet. Die stärkste Aussage, die UIQ machen kann, ist manchmal eine leere Liste.

### Die Design-Regel (fast heilig)

Jede neue Funktion muss genau eine dieser drei Fragen beantworten:

1. Hilft sie, **den Markt besser zu verstehen?**
2. Hilft sie, **die richtige Strategie auszuwählen?**
3. Hilft sie, **Fehler zu vermeiden?**

Wenn keine dieser drei Fragen mit Ja beantwortet werden kann — kommt die Idee nicht ins Produkt, oder muss heraus.

### Die UIQ Decision Pyramid

UIQ ist ein vollständiger Investmentprozess in sieben Ebenen — kein Scanner, kein Chart-Tool:

```
Ebene 1 · MARKT        → Ist der Markt heute gesund?
Ebene 2 · STRATEGIE    → Welche Strategien passen heute?
Ebene 3 · INVESTOR     → Welche Strategie passt zu mir?
Ebene 4 · UNDERLYING   → Welche Titel erfüllen die Bedingungen?
Ebene 5 · TRADE        → Wie steige ich ein?
Ebene 6 · MANAGEMENT   → Wie verhalte ich mich, wenn sich der Markt ändert?
Ebene 7 · LERNEN       → War die Entscheidung richtig?
```

Fehler auf Ebene 1 propagieren durch alle sechs weiteren Ebenen. Oben ist wichtiger als unten.

### Der Erfolgsmaßstab

> *„UIQ hat mich nicht reich gemacht. Aber es hat mich mehrfach davor bewahrt, in den falschen Markt mit der falschen Strategie einzusteigen."*

Das ist ein Schutz-Versprechen, kein Rendite-Versprechen.

---

## 1. Zielbild: Der geschlossene Anlegerzyklus (3 + 2)

Die Suite bildet den vollständigen Lebenszyklus eines selbstentscheidenden Privatanlegers ab — jedes Modul besetzt genau eine Phase, kein Modul überlappt:

| Phase | Modul | Repo | Status |
|---|---|---|---|
| **Entscheiden** | UnderlyingIQ — Regime → Strategie → Underlying → Instrument | `ko-aggregator` (App: `axel-scanner`) | Produktiv (underlyingiq.com) |
| **Bewirtschaften** | Premium Options — steuerbewusster Options-Doktor | `premium-options` | Sanierung (P1) vor Publikation |
| **Abrechnen** | Refundex — Anlage KAP + Quellensteuer-Rückholung | `refundex` | Öffentliche Beta |
| **Bilanzieren** | DepotIQ *(Arbeitstitel)* — Strategie-Bilanz netto EUR nach Steuer, Risiko-Cockpit; die Rückkopplung, die den Zyklus schließt | — | Zukunftsprojekt, hohe Prio |
| **Vorsorgen** | Ruhestandsmodul — Entnahmeplanung | — | Zukunftsprojekt, hohe Prio; StBerG-sensibelstes Modul der Suite, eigenes Gate zwingend |

**Der Kreislauf-Gedanke:** Bilanzieren füttert Entscheiden — die ehrliche Netto-EUR-Bilanz je Strategie ist der Input für die nächste Strategie-Router-Entscheidung. Erst mit DepotIQ wird aus der Werkzeugkiste ein lernendes System.

**Funnel-Strategie (Axel + Claude, 16.07.2026 — strategische Klarstellung, hohe Architektur-Relevanz):** UIQ und die tieferen Suite-Module verfolgen bewusst unterschiedliche Zielgruppen-Logiken, die nicht vermischt werden dürfen:

- **UIQ = breiter, broker-unabhängiger Einstiegspunkt.** Muss für jeden Nutzer funktionieren, unabhängig vom Broker — das ist der Kern seines eigenständigen Werts als "Tipp-Geber für gute Trades", auch für Nutzer, die keine IBKR/CapTrader/Lynx-Kunden sind.
- **Refundex/Premium Options = IBKR-spezifischer Mehrwert-Hebel.** Durch Flex-Query-Integration (IBKR/CapTrader/Lynx-Broker-Export, enthält alle steuerlich relevanten Transaktionsdaten vollständig und autoritativ vom Broker) entsteht ein Anreiz, überhaupt diese Broker-Plattformen zu nutzen oder dorthin zu wechseln — nicht weil UIQ das verlangt, sondern weil die *anderen* Module dann zusätzlichen, spürbaren Mehrwert liefern. Im Kern eine Funnel-Logik: UIQ zieht breit an, die Tiefe der Suite wird zum Bindungs-/Wechselargument für eine bestimmte Broker-Wahl.
- **Datenfluss-Konsequenz:** Flex Query ist die autoritative externe Datenquelle für alles Trade-/Steuerbezogene — kein UIQ→Refundex- oder UIQ→Premium-Options-Datenexport nötig oder gewünscht. Jedes Modul, das Trade-Daten braucht, liest direkt aus Flex Query, nicht über ein anderes Suite-Modul vermittelt.
- **Architektur-Regel (verbindlich, ergänzt Grundgesetz #1):** UIQ darf niemals eine harte Abhängigkeit von Flex Query oder anderen IBKR-spezifischen Datenquellen für seine Kernfunktionen bekommen — das würde die "funktioniert für jeden, unabhängig vom Broker"-Eigenschaft zerstören, die den strategischen Wert als breiter Einstiegspunkt ausmacht. Jede IBKR-spezifische Tiefe (echtes Positions-Tracking, Flex-Query-Anbindung, Broker-Transaktionshistorie) gehört ausschließlich in Refundex/Premium Options, niemals in UIQ. Konkret für die Phasengrenze Entscheiden/Bewirtschaften: UIQs Options Desk bleibt bei broker-agnostischen Strategie-Vorschlägen (Kandidatenfindung, KI-Einschätzung) — Premium Options ist der Ort für den realen, broker-spezifischen Positions-Lebenszyklus (Rollen, Steueroptimierung über die Haltedauer, Flex-Query-basiertes Tracking). Claude-Pflicht: aktiv warnen, falls künftige UIQ-Erweiterungen (z.B. weiterer Ausbau des Options Desk) in Richtung echter Positionsführung/Broker-Anbindung driften.

---

## 2. Suite-Grundgesetze (konsolidiert, für alle Module verbindlich)

1. **Streng-modularer Aufbau.** Kein Modul kennt Interna eines anderen; Austausch nur über definierte Kontrakte (JSON-Schemata, ko-* Suite-Module). Fachlogik, die zwei Module brauchen, lebt in genau **einem** Suite-Modul.
2. **ES6-Zielarchitektur.** Neuer Code ausschließlich ES6-konform (const/let, Arrow Functions, zentrale String-Objekte, keine Inline-Handler, JSDoc). Monolithen werden schrittweise migriert, nie big-bang.
3. **80/20-Vorbehalt.** Jedes Feature nur, wenn ≤ 20 % Aufwand ≥ 80 % Nutzerwert liefern. Randfälle werden dokumentierte Grenzen, keine Features.
4. **No-Hallucination auf allen Ebenen.** Zahlen entstehen deterministisch aus Daten + belegten Konstanten (GZ, Norm, Preisliste mit Standdatum). KI erklärt und formuliert — sie rechnet, schätzt und zitiert nie ohne Quelle. Näherungen sind sichtbar markiert (~). Gilt auch fürs Marketing („verifiziert" nur nach echtem Lauf).
5. **Compliance by Design im Public-Bereich.** Je Modul die einschlägige Schranke: WpHG/BaFin (UIQ, PO — Public/EIC-Split, „Statistische Kontext-Analyse"), StBerG (Refundex, PO, künftig Ruhestand — Rechenwerk mit Szenarien nebeneinander, nie Ratschlag). Empfehlungssprache existiert ausschließlich hinter dem EIC-PIN.
6. **Datensouveränität.** Browser-first; Depot- und Steuerdaten verlassen den Rechner des Nutzers nicht. Kein Suite-Server hält Nutzerdaten.
7. **Belegkette.** Jeder ausgewiesene Wert ist rückführbar auf Datenzeile, Modul und Rechts-/Datenquelle.
8. **Governance-Muster.** Jedes Modul führt `docs/STRATEGIE.md` + `docs/ROADMAP.md` (versioniert, Fortschreibung Claude), Entscheidungen laufen durch den Vier-Fragen-Filter (Belegkette / 80-20 / ES6-Modularität / Compliance). Deploy nach Zwei-Vorgänge-Prinzip: GitHub = Quellcode, Cloudflare-Pages-Zip = Publikation.
9. **Debug-Protokoll (Laufzeit-Bugs).** Bei jedem Laufzeit-Bug gilt zwingend: **IMMER zuerst Konsolen-Check, dann Code anfassen. Kein Fix ohne bewiesene Root Cause.** Weder Claude noch Axel tippen Code-Änderungen ins Blaue — erst das Symptom im Browser-/Aggregator-Log sichern, dann gezielt fixen. Herleitung: Strategie-Ampel-Farb-Diskrepanz (v354–v364, 4 Fehlversuche) — die korrekte Root-Cause (`ko:regimeChanged` nicht dispatched nach `calcStrategyGates()`) war erst nach explizitem Console-Diagnostic sichtbar.

---

## 3. Konsistenz-Standards — „wie aus einem Guss"

Konsistenz ist Governance, nicht Geschmack: Divergenz entsteht, wo es keine verbindliche Quelle gibt. Deshalb gilt für vier Ebenen das **Single-Source-Prinzip** — je Ebene existiert genau eine Quelle, alle Apps konsumieren sie.

### 3.1 Terminologie-Standard (eine Sprache)

Ein zentrales, versioniertes **Suite-Glossar** definiert jeden fachlichen Begriff genau einmal — Bezeichnung, Definition, ggf. verbotene Alt-Bezeichnung:

| Begriff (verbindlich) | Definition | Verboten/Altlast |
|---|---|---|
| atmna-Systematik | Stillhalter-Regelwerk (Checkliste, 3-Stufen-Roll) | „Ludwig" (Namensrecht; UIQ bereinigt, PO offen → P1.1) |
| Statistische Kontext-Analyse | Public-Output aller Analyse-Features | „Handlungsempfehlung", „Empfehlung" (nur EIC) |
| EIC-Modus | PIN-gated Expertenbereich, suiteweit ein Konzept | app-eigene Bezeichnungen |
| Regime-Namen | BULL_QUIET, BULL_FRAGILE, STRESS_UNSTABLE, POST_PANIC_REVERSION | freie Übersetzungen im UI ohne Glossar-Eintrag |
| Ampel-Status | OK / WATCH / ROLLEN / DRINGEND (PO-Doktor); Break-even-Ampel grün/rot (Refundex QSt) | abweichende Stufenzahl je App |
| Verlusttöpfe | Allgemein / Aktien / Termingeschäfte (+ 20k-Cap) | umgangssprachliche Mischbegriffe |
| Belegkette, Recherche-Gate, Suite-Modul | wie in den Strategiedokumenten definiert | — |

**Regel:** Neue Begriffe werden erst ins Glossar eingetragen, dann im Code/UI verwendet. Das Glossar startet als Abschnitt dieses Dokuments und wandert bei Wachstum nach `suite-core/glossar.md`.

### 3.2 Regelwerk-Einheit (eine Wahrheit je Fachfrage)

Jede fachliche Beurteilungsregel existiert genau **einmal**, implementiert in einem ko-Suite-Modul, konsumiert von allen Apps:

| Fachfrage | Single Source | Konsumenten |
|---|---|---|
| IV-Rank-Schwellen (z. B. Skip < 25 %) | ko-Modul (Ziel: ko-scoring o. ä.) | UIQ, PO |
| FIFO / EUR-Umrechnung / Töpfe / 20k-Cap | ko-fifo, ko-fx, (Topf-Logik als Suite-Modul, ROADMAP Refundex 2.1 / PO 2.3) | Refundex, PO, künftig DepotIQ |
| DBA-Sätze, Voucher-Kosten, Fristen | ko-dba + versionierte Referenztabellen mit Standdatum | Refundex, künftig DepotIQ |
| Regime-Erkennung, Scoring | ko-market-state, ko-scoring, ko-strategies | UIQ, perspektivisch PO (Markt-Tab) |
| Ampel-Schwellwerte (ITM-%, DTE) | zentrale Konstanten-Objekte im jeweiligen ko-Modul, nie hart im UI | PO |

**Regel:** Findet sich dieselbe Schwelle/Formel in zwei Apps, ist das ein Bug — Konsolidierungs-Item in die nächste Roadmap-Fortschreibung.

### 3.3 Prompt-Bibliothek (ein Prompt je Frage-Typ)

KI-Prompts sind Regelwerk und werden wie Code behandelt: zentral, versioniert, mit Public-/EIC-Variante je Frage-Typ — nie app-individuell formuliert.

- **Struktur:** `suite-core/prompts/` (bzw. bis dahin ko-modules) mit z. B. `position-analyse.public.md`, `position-analyse.eic.md`, `strategie-erklaerung.public.md`, `briefing.eic.md` — inkl. Versionskopf und Änderungshistorie.
- **Bau-Regeln für jeden Suite-Prompt:** (1) Rollendefinition ohne geschützte Namen; (2) Public-Prompts enthalten strukturell keinen Empfehlungsauftrag — nicht nur eine Bitte um Zurückhaltung; (3) Strict-Source: „Verwende ausschließlich die mitgelieferten Zahlen; erfinde keine Werte, Quellen oder Paragraphen; kennzeichne fehlende Daten als fehlend"; (4) Ausgabeformat und Maximallänge definiert; (5) deutsche Fachbegriffe gemäß Glossar 3.1.
- **Regel:** Ein neuer KI-Einsatzzweck beginnt mit einem Bibliothekseintrag, nicht mit einem Inline-String im App-Code.

### 3.4 Design-System (ein Erscheinungsbild)

Ziel: Ein Nutzer, der von UIQ zu Refundex wechselt, muss nichts neu lernen — gleiche Farben, gleiche Interaktionsmuster, gleiche Anordnungslogik.

- **Design-Tokens:** Ein zentrales `:root`-Token-Set (Farben, Radius, Mono-Font, Ampelfarben) als `suite-core/tokens.css`; Referenz-Kandidat ist das Refundex-Set (bg/bg2/bg3, border, text/muted, accent, green/amber/red). ⚠️ **Vor Festschreibung: Bestandsaufnahme der UIQ- und PO-Tokens** (Konsolidierungs-Item, kein Blindtausch).
- **UI-Muster-Katalog (verbindliche Bausteine):** Beta-/Status-Banner mit aufklappbarem Haftungsblock (Muster: Refundex v139); EIC-PIN-Dialog (Muster: UIQ); Scanner-/Positions-Karten mit einheitlicher Anatomie (Titel · Status-Badge · Kennzahlen · Aktionen rechts unten); Ampel-Badges; Hilfe-Zugang einheitlich (❓ oben rechts, modales Fenster, Markdown-Module); Disclaimer-Vier-Punkte-Struktur.
- **Usability-Konventionen:** Primäraktion je Ansicht genau ein farbiger Button (accent), destruktive Aktionen nie primär gefärbt und nie ohne Bestätigung; Dropdowns für Auswahl, Buttons für Aktionen — nie gemischt; identische Reihenfolge wiederkehrender Elemente über Apps hinweg (z. B. Feedback/Bug/Schließen im Banner); Zahlen rechtsbündig in Mono; ~ kennzeichnet suiteweit Näherungswerte.
- **Regel:** Neues UI wird gegen den Muster-Katalog gebaut; ein neues Muster wird erst hier eingetragen, dann verwendet.

### 3.5 Umsetzungspfad der Konsistenz (realistisch, 80/20)

Konsistenz wird **nicht** als Big-Bang-Redesign erzwungen, sondern in drei Wellen: **(K1)** Dieses Dokument + Glossar-Kern gilt ab sofort für alles Neue. **(K2)** Bestandsaufnahme-Session: Token-, Begriffs- und Prompt-Inventur über die drei Apps, Abweichungsliste mit Prioritäten (Konsolidierungs-Backlog). **(K3)** Konsolidierung huckepack: Abweichungen werden im Zuge ohnehin anstehender Arbeiten bereinigt (z. B. PO-P1-Rename erledigt Glossar-Konformität gleich mit), nie als Selbstzweck-Deploy.

---

### 3.6 Web-Präsenz & Rechtsseiten (ein Auftritt nach außen)

Die einzelnen App-Domains (underlyingiq.com, refundex-app, künftig Premium Options / GuidelineIQ) sind heute noch Insellösungen. Für die Außenwirkung braucht es ein einheitliches Präsentationsgerüst mit klarer Trennung von App und Web-Präsenz:

- **Domain-Architektur:** Suite-Portal als Klammer (siehe §6, Titel offen), Apps unter Subdomains/Modulnamen. Konkrete Zuordnung Teil des K2-Konsolidierungs-Backlogs.
- **Rechtsseiten (verbindlich für alle Modul-Auftritte):** Impressum (TMG §5), Datenschutzerklärung (DSGVO Art. 13/14, ergänzt um KI-Verarbeitungshinweise), Kontaktseite (Formular + direkter Kanal), FAQ je Modul (aus vorhandenen Bedienungsanleitungen und Support-Rückläufen destilliert). Eine gemeinsame Vorlagenstruktur, jeweils modulspezifisch ausgefüllt.
- **Internationalisierung (i18n):** Suite-weit **DACH-first** (deutsch), englische Fassung als zweite Stufe pro Modul; keine Simultan-Pflege bis Rollout-Reife. Die Aufteilung pro Modul folgt dem Modul-i18n-Plan (UIQ: DACH → EN-Europa → USA optional; Refundex: DE-nur bis GST/QSt-Cockpit; PO: DE-nur bis Fall D2.a-Freigabe).
- **Corporate Identity:** Ein Wortmarken-/Farbsystem für die Suite als Ganze; die vier Modul-Identitäten sind Varianten davon, keine Eigengewächse. Ableitung aus dem Design-Token-Set (§3.4).
- **Content-Governance:** Kontakt, Impressum und Datenschutz haben genau **eine Quelle** je Rechtsträger — Änderungen dort werden per Include/Fetch in alle Modul-Auftritte gespiegelt, nicht parallel gepflegt.
- **Öffentliche vs. geschlossene Bereiche:** Marketing-/Info-Seiten sind öffentlich; App-Zugang und Expert-Modi bleiben authentifiziert (EIC-PIN-Konzept). Die Trennung ist Architektur, keine URL-Konvention.
- **Regel:** Neue öffentliche Seiten werden gegen dieses Kapitel gebaut; Abweichungen sind begründungspflichtig und wandern in den K2-Backlog.

### 3.7 Timeframe des Design- und Web-Präsenz-Rollouts

Corporate Design und Web-Präsenz sind **suite-übergreifend, nicht produktkritisch** und werden bewusst *nicht* in den v1.x-Monolithen zurückgebaut. Kopplung an ohnehin anstehende Migrationen minimiert Doppelarbeit und respektiert die Prioritäten-Wirbelsäule (§4).

| Phase | Zeitfenster | Aktivität | Bewusst nicht |
|---|---|---|---|
| **D0 — Sammelbecken** | ab sofort bis UIQ h7-Reife (~14.07.2026) | Ideen, Farbkandidaten, FAQ-Rohentwürfe, Rechtsseiten-Muster kommen in dieses Kapitel und den K2-Backlog. Denk-Kapazität, keine Build-Kapazität. | Kein Design-Sprint, kein CSS-Refactor, kein neuer öffentlicher Auftritt. |
| **D1 — Konzept** | nach erster hit30-Auswertung (ab ~Ende Juli / August 2026) | Design-Token-Set finalisieren (Bestandsaufnahme UIQ/Refundex/PO), Typografie-Skala, i18n-Struktur, Impressum/Datenschutz/Kontakt/FAQ als Konzept-Dokumente je Modul. | Noch keine breite Umsetzung; Modul-Auftritte laufen im Ist-Look weiter. |
| **D2 — Rollout im Zuge UIQ v2.0** | Q4 2026, gekoppelt an Vite/React-Migration (STRATEGIE.md Phase 3) | Design-System als Component-Library implementiert; UIQ-Web-Präsenz + Rechtsseiten gehen mit v2.0 live. Effizient, weil die Component-Library ohnehin entsteht. | Kein Rollout in v1.x-Monolithen — bewusst nicht, weil doppelt gebaut. |
| **D3 — Suite-weit** | 2027 | Refundex, Premium Options, GuidelineIQ ziehen huckepack aufs Design-System nach; Suite-Portal (§6) wird sichtbar. | Kein Selbstzweck-Redesign bestehender Module ohne anstehende inhaltliche Arbeit. |

**Warnpflicht-Verankerung:** Corporate Design bleibt bis Phase D2 strikt Denk-Kapazität. Sollte ein Modul-Auftritt vor Q4 2026 unabweisbar werden (z. B. Refundex-Publikumsöffnung), wird das als bewusste Ausnahme in §7 dokumentiert — nicht situativ vorgezogen.

---

## 4. Prioritäten-Wirbelsäule (modulübergreifende Rangfolge)

Die Suite hat mehr berechtigte Vorhaben als Kapazität. Diese Rangfolge gilt für jede Entwicklungs-Session und wird nur durch bewusste, hier dokumentierte Entscheidung geändert — nicht situativ.

**Grundunterscheidung: Build-Kapazität vs. Denk-Kapazität.** Die Wirbelsäule rationiert das **Bauen** (Code, Deploys). Recherche-Gates, Support-Ticket-Auswertungen und Dokument-Fortschreibungen bleiben jederzeit erlaubt — sie sind billig, enthalten ohnehin Wartezeiten (Ticket-Antworten, BMF-Recherche) und zahlen beim späteren Bau sofort aus.

| Rang | Modul | Modus | Regel |
|---|---|---|---|
| 1 | **UIQ Phase 0** | **Leitprojekt** | Absolute Build-Priorität. Track-Record-Uhr läuft (Tag 0 = 02.07.2026); Code-Arbeit hier schlägt alles. Dazu zählt ko-ai-Worker-Infrastruktur (Rate-Limiting, Logging) |
| 2 | **Refundex** | Wartungsmodus | Bugfixes und Kleinstaufgaben (< ~1 h) jederzeit; keine neuen Großfeatures (inkl. QSt-Cockpit-Bau) bis UIQ Phase 1 erreicht. Recherche-Gates laufen weiter |
| 3 | **Premium Options** | Geparkt | Kein Build bis definiertem Trigger (frühestens UIQ Phase 1); Ausnahme P1.1-Rename, falls Publikation vorgezogen würde. Gates (Multi-Leg-Steuer) laufen weiter |
| 4 | **DepotIQ / Ruhestandsmodul** | Eingefroren | Build-Verbot bis UIQ Phase 3 (Launch). Nur Gate-Definition erlaubt |

**Claude-Pflicht:** In jeder Session aktiv warnen, wenn Build-Arbeit vom Leitprojekt abdriftet („Wirbelsäulen-Hinweis").

---

## 5. Suite-SWOT (Meta-Ebene: die Strategie selbst)

Kurzfassung der Meta-Analyse vom 03.07.2026 (Claude, cross-gecheckt mit Gemini — Konvergenz in allen Kernpunkten):

**Stärken:** Track-Record-first mit laufender Uhr (wichtigste Einzelentscheidung); Reihenfolge-Disziplin (Nachweis → Gutachten → Kommerzialisierung); durchgängige Gate-Governance; Suite-Bundling auf identischer Zielgruppe; ehrliche Selbstdiagnose; realistische Marktgeografie (DACH → EN-Europa; USA Fernstufe).

**Schwächen:** ① Frontbreite vs. Solo-Kapazität → mitigiert durch §4 Wirbelsäule; ② Track-Record-Statistik kann je Strategie×Regime-Zelle dünn bleiben → Mindest-n-Regel: Zellen unter Mindeststichprobe werden nicht veröffentlicht (No-Hallucination für Statistik); ③ Erfolgsdefinition unquantifiziert → harte Ziel-Abonnentenzahl vor Phase 2 festlegen (entscheidet über Datenlizenz-Tragfähigkeit); ④ SPOF-Personalfrage untermininiert → Testballon Mitgründung mit weichem Datum vor Phase-1-Ende.

**Chancen:** Ruhestand/Aktivrente ab 2026 als Kapazitäts-Turbo exakt zur Track-Record-Reife (Zeitachsen konvergieren — Planungsgröße, kein Zufall); zeitlich uneinholbarer Track-Record-Burggraben; DepotIQ als LTV-Anker nach Launch; Investmentclub als validierter Beta-Pool.

**Risiken:** ① Scope-Creep als Systemrisiko → Wirbelsäule + Claude-Warnpflicht; ② Track-Record kann Strategien falsifizieren → Rekalibrierung ist Feature des Plans, kein Scheitern; ③ yfinance-Ausfall vor Phase-2-Migration → Plan B light (UIQ-STRATEGIE v1.3, R-Register); ④ KI-Kosten-Skalierung unkalkuliert → Rate-Limiting im ko-ai Worker + Kosten/Nutzer als Phase-1-Metrik; ⑤ Datenlizenz-Fixkosten vs. Nischengröße → Break-even gegen Ziel-Abonnentenzahl (Schwäche ③) rechnen.

---

## 6. Suite-Portal (Zielbild, P-Item)

Eine gemeinsame Einstiegsseite als Klammer nach außen: die vier/fünf Module mit Ein-Satz-Beschreibung, gemeinsames Design-Token-Set, ein EIC-Login-Konzept, und die Suite-Prinzipien (Belegkette, No-Hallucination, Datensouveränität) als öffentliches Qualitätsversprechen — sie sind das Verkaufsargument an die Zielgruppe, nicht nur Interna. Voraussetzung: K2-Bestandsaufnahme und Namens-/Domainfragen (siehe Refundex-Backlog) geklärt.

---

## 7. Offene Suite-Entscheidungen (Backlog)

1. ✅ **ENTSCHIEDEN (03.07.2026):** Heimat von SUITE.md und künftig `suite-core` ist das Meta-Repo `ahsub/UIQ-Suite` (durch Inhaber angelegt). ko-aggregator/docs/SUITE.md wird Verweis-Stub.
2. **Suite-Name nach außen** (das Portal braucht einen Titel) — zusammen mit der Refundex-Namensrecherche (DENIC/DPMA) behandeln.
3. **DepotIQ-Gate** definieren, bevor Konzeptarbeit beginnt (u. a. Methodik-Recherche TWR vs. MWR mit Quellen).
4. **Ruhestandsmodul-Gate:** StBerG-Abgrenzung ist hier Existenzfrage — vor jeder Zeile Konzept.
5. Verlinkung dieses Dokuments aus den drei Modul-STRATEGIEs — bei deren jeweils nächster Fortschreibung (kein Extra-Push).
6. **Corporate Design & Web-Präsenz (§3.6/§3.7):** Sammelbecken offen ab 06.07.2026; erste Bestandsaufnahme (UIQ/Refundex/PO-Tokens, existierende Rechtsseiten-Bausteine, FAQ-Fragmente) im Zuge der D1-Konzeptphase (Ende Juli / August 2026). Bis dahin: Ideen und Referenzen hier sammeln, nicht bauen.
7. **Cross-Modul-Konzept: Options-Radar / Options-Doktor** *(Konzeptvorschlag 08.07.2026, aus Nachgespräch nach UX-Review)* — Flex-Query-Daten (IBKR/CapTrader/Lynx) werden nicht nur rückwärts für Steuer (Refundex) genutzt, sondern **vorwärts als Live-Risiko-Kanal** für offene Options-Positionen. Trigger deterministisch aus Flex + Marktdaten: Delta-Drift, DTE-Bänder (30/21/7/2), IV-Rank-Sprünge, Kursabstand-zu-Strike relativ zu Restlaufzeit, Earnings-/Ex-Div-Fenster (Frühassignment-Risiko bei CC), Regime-Wechsel aus UIQ. LLM-Rolle: nicht Zahlen erfinden, sondern Handlungsoptionen formulieren (rollen / schließen / halten) mit Kosten-Nutzen aus Options-Chain. Frequenz: nightly Grundtakt, 2–3×/Woche verdichtet nahe kritischer Strikes. **Suite-Kohärenz:** Refundex ↔ PO ↔ UIQ teilen denselben Kunden, dasselbe Konto, dieselbe Flex-Infrastruktur; UIQ-Regime-Wechsel wird PO-Radar-Trigger, PO-Assignment wird Refundex-Steuerposition. **Verortung:** Kern-Feature der PO-Entparkung (nicht v1.x-Retrofit; wandert in PO-Roadmap wenn PO wieder aktiv wird). **Zielgruppen-Argument:** IBKR-Retail in DACH stark wachsend, Klientel technikaffin und aktiv, „Doktor mit Therapieoption + Zahlen" ist Marktlücke gegenüber reiner Bestandsansicht der Broker. Kern-Idee: Diagnose ist billig, dokumentierter Handlungspfad mit Zahlen daneben ist das eigentliche Produkt. Dokumentiert im PO-Log 08.07.2026.
8. **Inverse-Problem-Register (Flex-Query als unterschätzter Datenkanal)** *(offen ab 08.07.2026)* — Umkehrung der üblichen Frage-Daten-Reihenfolge: Statt „Ich habe Frage X → welche Daten brauche ich?" wird gefragt „Ich habe reichhaltigen Datenkanal Y → welche Fragen könnte er beantworten, die ich noch nicht gestellt habe?" Kein Konzept, kein Roadmap-Punkt, sondern **offenes Sammelregister**. Trigger: Wenn im Gespräch oder in der Praxis Fragen auftauchen, die Flex-Query strukturell abdecken könnte, hier notieren. Wenn genug Einträge zusammenkommen, entstehen daraus möglicherweise eigene Konzepte, möglicherweise Verstärkungen bestehender Module. Erste Kandidaten (nur Anregung, keine Zusagen): Kontokosten-Analyse aggregiert je Instrument-Klasse; Ausübungs-Post-Mortem (was wäre die Handlungsalternative gewesen?); Portfolio-Konzentrations-Radar aus Ist-Positionen; Corporate-Actions-Trigger (Splits/Special Dividends); Silent-Drift-Erkennung (Positionen ohne Aktivität >N Tage); Steuer-Antizipation (YTD-Gewinne gegen 20k-Termingeschäfte-Cap projiziert). **Verwandter Kandidat, aber anderer Kanal** *(10.07.2026, aus Pine-Script-Review zur GEX-Thematik)*: IBKR/CapTrader **Live-Optionsketten-API** (nicht Flex-Query, sondern TWS-/Client-Portal-API) als potenziell kostengünstige Quelle für echte Open-Interest/Volumen-pro-Strike-Daten — Axel hat diesen Zugang bereits für eigenes Wheel/CSP-Trading bezahlt/verfügbar. Könnte einen serverseitigen POC/VAH/Max-Pain-Rechner ohne Quiver-Quant-Abo ermöglichen, vermutlich aber nur für aktiv gehandelte Ticker (SPY/QQQ/Wheel-Kandidaten), nicht marktweit. Noch unverifiziert ob die API Open-Interest liefert. Details siehe `ko-aggregator/docs/GEX-SCHEMA.md` §6 (Prio 1b).

9. **Track-Record-Phase-C: Papertrading Modus A+B** *(09.07.2026)* — Auswertung der Strategie-Entscheidungsmatrix (MB-STATEMENT-DATA-MATRIX.md §4.3) im Signal-Track (Modus A: tägl. Logging von Regime × Sektorstatus × Strategieliste → Forward-Returns je Sektor-ETF über 5/10/20 Handelstage) und ETF-Regel-Portfolio (Modus B: simuliertes Portfolio GRÜN-Sektoren gleichgewichtet, Cash-Quote über Regime-Multiplikator ×1.0/×0.5/×0, wöchentl. Rebalancing). Logging-Zusatz im nightly Snapshot (Cron läuft seit 02.07.2026) hat Priorität; Evaluator-Erweiterung + Report-Karte nach Phase-0.5-Abschluss. Mindest-n-Regel: Zellen unter 20 Regime-Tagen zeigen „unzureichende Datenbasis", keine Pseudo-Trefferquote. Backfill-Prüfung (rückwirkende Matrix-Anwendung auf archivierte Snapshots) in nächster PAT-Session. Referenz: `docs/MB-STATEMENT-DATA-MATRIX.md`.
10. **IV/Earnings-Folgesprint** *(09.07.2026)* — Datenlücken für AK-6 (Options-Income Ticker-Ebene): IV Rank/Percentile, Earnings-Kalender, Options-Liquidität. Prüfreihenfolge: (1) Twelve Data — Abdeckung im bestehenden Plan; (2) Alternativen. Crosscheck-Referenz vor Go-Live: IBKR/CapTrader. Startet erst nach Phase-0.5-Abschluss; AK-6 im JSON-Schema bereits als optionales Feld angelegt (kein Umbau bei Aktivierung). Referenz: `docs/MB-STATEMENT-DATA-MATRIX.md` §3 AK-6.
11. **MSE-Regime vs. IOS-Market-Score: Kommunikation von Teil-Widersprüchen** *(10.07.2026, aus MB-Tearsheet-Review v297)* — Beobachtung: MSE-Regime zeigt "NEUTRAL — Kein klares Signal", IOS Market Score zeigt gleichzeitig "83/100 — SELEKTIV KAUFEN". Beide Scores sind methodisch unabhängig (unterschiedliche Inputs/Gewichtung), technisch kein Fehler — aber für den Anwender wirkt die Wortwahl widersprüchlich, ohne dass der Tearsheet erklärt warum. Anforderung (Axel, 10.07.2026): Widersprüchlichkeiten zwischen unabhängigen Sub-Scores müssen **mindestens erklärt und thematisiert** werden, nicht stillschweigend nebeneinander stehen bleiben. Denkrichtung (kein Konzept, nur Einstieg): (a) kurzer Erklärtext im Tearsheet, der methodische Differenz benennt, sobald zwei Kern-Scores >X Punkte/Kategorien auseinanderliegen; (b) oder ein dediziertes "Divergenz-Signal" analog zum SKEW/VVIX-Divergenz-Detektor (09.07., Aggregator v4.9) — Regime-Score-Divergenz selbst als Informationsgehalt statt Störgeräusch framen. Betrifft ggf. auch andere Score-Paare (Bull-Indikator vs. MSE, Treasury Stress vs. Intermarket Risk) — Bestandsaufnahme aller Score-Paare mit Divergenz-Potential nötig, bevor Lösung gebaut wird. Kein Bau vor Phase-0.5-Abschluss.
12. **UIQ-eigener Breadth-Oszillator (NYMO/McClellan-Methodik aus Eigenbestand)** *(10.07.2026, aus Pine-Script-Brainstorming zur GEX/DIX-Problematik)* — Bei der Durchsicht mehrerer GEX-Indikatoren (u.a. "Prism Intelligence SPX") fiel auf: Der Ansatz nutzt TradingView-interne Symbole (`USI:ADVN.NY`/`USI:DECL.NY`) für einen echten McClellan-Oszillator (EMA19 minus EMA39 des Netto-Advance-Verhältnisses) — diese Symbole sind aber nicht außerhalb TradingViews eigener Dateninfrastruktur nutzbar (kein öffentliches API-Äquivalent bekannt). **Kernidee für UIQ:** Wir brauchen keine externe Advance/Decline-Quelle — der Aggregator scannt bereits ~678 Ticker jede Nacht und hat damit die Rohdaten für einen **eigenen, UIQ-spezifischen Breadth-Oszillator** direkt im eigenen Bestand (wie viele Ticker im Universum heute im Plus vs. Minus, EMA19/EMA39-Differenz nach McClellan-Methodik). Kein neuer Datenfeed, keine Abhängigkeit von Dritt-Websites — nur Anwendung existierender Scan-Ergebnisse auf ein etabliertes Verfahren. Abzugrenzen vom offiziellen NYSE-weiten NYMO (eigene Universum-Basis, nicht 1:1 vergleichbar, aber intern konsistent und für UIQs Strategie-Logik ausreichend). Ergänzend im selben Brainstorming: eine kostenlose Drittanbieter-Quelle für tägliche GEX-Level-Strings (`gexdash.wealthbuilders.group`) wurde genannt, aber bewusst nicht übernommen — Legitimität/Verlässlichkeit ungeprüft, kein Automatisierungskandidat ohne vorherige manuelle Prüfung durch Axel. DIX bleibt strukturell ungelöst — keins der bislang sieben+ gesichteten Pine-Scripts hat Zugriff auf echte FINRA-Dark-Pool-Daten (Pine kennt keine solche `request.security()`-Quelle). Kein Bau vor Phase-0.5-Abschluss.
13. **Präsentations-Feedback 11.07.2026** *(Live-Vorstellung, kleines interessiertes Publikum — Konzept insgesamt sehr positiv aufgenommen, als "innovativ" bezeichnet)* — fünf konkrete Rückmeldungen, alle noch unbewertet/nicht gebaut:
    - **(a) Strategie-Ampel-Reihenfolge, thematisch statt beliebig:** Gewünschte Gruppierung: KO → Momentum/Minervini → Breakout → Swing → Mean Reversion → Dividende → Value → CSP (ATM/NA) → CSP (Weekly) → Covered Call (CC) → Short-Strategien (KO-Short, ggf. weitere). **Wichtige Taxonomie-Entscheidung dabei:** CC (Covered Call) wird als **eigenständiger 12. Strategie-Slot** eingeführt, nicht als Teil von `csp_wheel` — Begründung (Axel): CC ist auch ohne vorherigen CSP-Zuteilungspfad sinnvoll, bei bereits gehaltenen oder bewusst gekauften größeren Aktienpaketen (Buy-Write). Andere Einstiegslogik/Screening-Kriterien als der Wheel-Pfad, methodisch anerkannte Trennung in der Optionshandel-Praxis. Betrifft die vier bekannten Kopien der Strategie-Label-Map (siehe Übergabeprotokoll 10.07., Punkt 2 "Was nicht vergessen werden darf") — Reihenfolge + neue Kategorie müssten in allen vier synchron nachgezogen werden, guter Anlass die Konsolidierung endlich anzugehen statt weiter zu duplizieren.
    - **(b) Fehlende Strategiemodule ausarbeiten:** Dividende und Value existieren als Ampel-Gates (Farblogik in `getStrategyGates()`), aber es fehlt die dahinterliegende **Scan-Logik** (kein `score_long_dividend()`/`score_long_value()` in `market_aggregator.py`, analog zu `score_long_minervini()`/`score_long_swing()`). Ampel zeigt aktuell nur eine Regime-Einschätzung ohne echte Ticker-Auswahl dahinter für diese zwei Strategien.
    - **(c) Ein-/Ausstiegskurs-Empfehlungen für Kurzzeit-Strategien:** Zwei Modi gewünscht — **User-Modus**: ATR-Bereichsangabe (relativ); **EIC-Modus**: konkrete EUR/USD-Kursangaben (absolut). Direkte Überschneidung mit der bereits portierten, aber noch nicht eingehängten Pattern/Entry-Engine (`ios_pattern_entry_engine.py`, 10.07.2026) — die liefert bereits `entry.suggested/buyStop/limitPullback/normalEntry/deepPullback/maxBuy` als Preispunkte; ATR-Bereichslogik wäre eine sinnvolle Ergänzung beim Einhängen. Stärkt das Argument für eine baldige Integrations-Entscheidung (siehe Roadmap Phase 1, Praesentation 11.07.).
    - **(d) Feature-Vergleich mit anderen Finanz-Apps gewünscht:** Trendspider.com und Deepvue explizit genannt. Noch nicht recherchiert — bei Bedarf per Browser-Recherche machbar (kein aktiver Web-Search-Zugriff ohne Browser-Tool).
    - **(e) Makro-Tab: ETF/Sektor-Klick zeigt Top-10-15-Holdings, optional als Watchlist ins Scanner-Tab übernehmbar. ✅ ERLEDIGT (11.07.2026, gleicher Abend).** Proof-of-Concept mit XLK vollständig gebaut und verifiziert: `parse_ssga_holdings_xlsx()` + `resolve_company_name_to_ticker()` (Yahoo Search, serverseitig, kein CORS-Proxy nötig) im Aggregator (`market.sectorHoldings.XLK`), Klick auf Sektor-RS-Zeile im Frontend zeigt Modal mit Top-15 + "In Watchlist übernehmen"-Button (`index.html` v301). 14/15 Ticker sofort aufgelöst, 15/15 nach Fallback-Fix (Aktienklassen-Zusätze wie "Class A" verwirrten die Suche). **Wichtige Einschränkung:** Quelle ist der State-Street-**UCITS**-Wrapper (europäische Notierung ZPDT GY), nicht der US-XLK direkt — Konstituenten nahezu identisch, Gewichtung kann wegen UCITS-Diversifikationsregeln leicht abweichen, im UI transparent ausgewiesen. **Noch offen:** weitere Sektor-ETFs (XLF, XLE, XLV, ...) brauchen jeweils eigene, von Axel zu beschaffende Holdings-Datei (monatliches Update-Muster wie `iwv_holdings.csv`).
    - **(f) Call-/Put-Level-Bestimmung im Enrichment-Lauf (Aggregator + Scanner-Shortlists):** Wunsch, für Einzelaktien im Enrichment-Lauf bereits Call-/Put-Level zu visualisieren/bestimmen, um Realize-Profit- und Stop-Loss-Entscheidungen zu unterstützen. Direkte fachliche Überschneidung mit (c) — die bereits portierte Pattern/Entry-Engine (`ios_pattern_entry_engine.py`) liefert schon `entry.suggested/buyStop/limitPullback/normalEntry/deepPullback/maxBuy`. Zusätzlicher Aspekt hier: explizit auf Enrichment-/Shortlist-Ebene (nicht nur Einzelticker-Scan), also mehrere Ticker gleichzeitig im nächtlichen Lauf. Beide Punkte (c)+(f) sollten bei der Integrations-Entscheidung zur Pattern/Entry-Engine zusammen behandelt werden, nicht getrennt.
    - **(g) Klarnamen der Ticker (mehrfach geäußert). ✅ ERLEDIGT (11.07.2026, gleicher Abend).** Reverse-Lookup Ticker→Klarname via bestehende Yahoo-Search-Infrastruktur gebaut (`getTickerDisplayName()`, gecacht), progressiv nachgeladen in Scanner-Karten (`ticker-name`-Feld) und Shortlist-Tabelle (`index.html` v300) — blockiert nichts, aktualisiert DOM sobald einzelne Namen eintreffen.
    Kein Bau vor eigener Priorisierungs-Session. Reine Verankerung.
14. **✅ ERLEDIGT (12.07.2026) — Echtes RS-Rating für score_long_minervini()** *(hoch priorisiert auf Axels Wunsch, 11.07.2026)* — Zweistufige IBD-Annäherung (gewichtete 12M-Performance: 0.4×3M + 0.2×6M + 0.2×9M + 0.2×12M) als Batch-Perzentil-Ranking über alle ~678 Scan-Ticker. Stufe 1: `perfRsRaw` + Perioden-Performance in `process_ticker()`; Stufe 2: einmaliges `bisect`-Ranking nach Ticker-Schleife in `main()` → `rsRating` 0–99. Gate 6 in `score_long_minervini()`: ≥85 SEPA-Ideal (+25), ≥70 IBD-Minimum (+15), ≥50 (+5), <50 (-10). Markov bleibt als Gate 6b (reduziert). Frontend v302: `rsRating` in `kvToScannerState()` gemappt. Aggregator v5.0, deployed 12.07.2026. Erster Produktiv-Lauf Run #87: 660/678 Ticker gerankt, Verteilung statistisch korrekt (15%≥85 / 15% 70–84 / 20% 50–69 / 50%<50).
15. **✅ ERLEDIGT Phase 1 (12.07.2026) — IV-Rank/Percentile — Archiv-Aufbau gestartet** *(Nischen-Differenzierer Optionsanalyse, direkt nach №14)* — **Datenquellen-Entscheidung (12.07.2026):** yfinance Optionsketten (kostenlos, kein Auth-Problem in GitHub Actions) als Point-in-Time-Archiv — kein IBKR-Auftank-Lauf möglich (historische IV nicht rückwirkend beschaffbar, strukturell identisches Problem wie FIN-Archiv). **Implementierung:** `iv_layer.py` v1.0 (299 Zeilen): täglich ATM-IV via Front-Month-Optionskette (7–60 DTE), Call+Put gemittelt, 8 parallele Worker, Sanity-Filter; Snapshot nach `data/iv_history/YYYY-MM-DD.json` (Git-History = Archiv). Aus wachsendem Archiv: `ivRank` (tastytrade-Formel, Min/Max-Fenster) + `ivPercentile` (TOS, Anteil Tage niedriger) ab ≥30 Archiv-Tagen. Felder: `ivAtm`, `ivExpiry`, `ivDte`, `ivRank`, `ivPercentile`, `ivArchiveDays`. Aggregator v5.1, Workflow um `data/iv_history/` erweitert. Frontend v302: Options-Desk zeigt `IVR XX%` wenn Archiv reif, sonst `HVP XX%` als Fallback mit Countdown-Tooltip; KI-Briefing-Prompt auf `IVR` umgestellt; `_ivp`-Objekt mit echten Options-IV-Werten. **Zeitleiste:** Tag 0 = 12.07.2026; ab ~12.08.2026 (30T): erster IV-Rank; ab ~13.09.2026 (63T): IV-Percentile vollwertig; ab ~10.07.2027 (252T): volles 1-Jahres-Fenster. **Marktlücke bestätigt (Deepvue-Analyse):** Kombination Optionsstrategie-Timing + IBD/Minervini-Ratings + KO-Zertifikate in einem Tool — kein direkter Wettbewerber abgedeckt.
16. **Strategie-spezifische Calendar-Buffer — Track-Record-Trigger** *(14.07.2026, aus MCM-Implementierung/Renderer-Vereinheitlichung)* — Im Zuge des Market Context Module (MCM, siehe axel-scanner v322/v323) wurde die Karenzzeit um FOMC/NFP/CPI-Termine einheitlich festgelegt (FOMC 15min, NFP/CPI 10min, symmetrisch um den Decision-Zeitpunkt), gültig für **alle** betroffenen Strategien gleichermaßen (`ko`, `momentum`, `breakout`, `csp_wheel`, `atmna`, `weekly_income` etc.). **Offene Frage (Axel + Claude, 14.07.2026):** Diese Einheitlichkeit ist vermutlich zu grob für zwei gegenläufige Fälle — (a) **Theta-Strategien** (`csp_wheel`/`atmna`/`weekly_income`): das eigentliche Timing-Risiko ist nicht die Sekunden um die Decision, sondern der gesamte Handelstag davor (IV-Aufbau vor dem Event ist ökonomisch gewünscht, nicht zu meiden); (b) **Hebelprodukte** (`ko`): das Risiko ist Spread-Ausweitung/Slippage exakt im Decision-Fenster — hier könnte die 15min-Karenz *danach* sogar zu kurz sein, falls Market Maker den Spread länger als 15min weit halten. **Kein Bau jetzt** — bewusst als Kandidat für **Track-Record-getriebene Kalibrierung** vorgemerkt: erst wenn die laufende Track-Record-Infrastruktur (seit 02.07.2026) zeigt, ob z. B. KO-Positionen um FOMC-Termine tatsächlich unerwartet ausgestoppt wurden oder CSP/Wheel-Prämien vor Events systematisch attraktiver waren, gibt es empirische statt geratene Basis für strategie-spezifische Puffer. Verwandtes Prinzip wie Backlog-Punkt zur `weight`-Feld-Kalibrierung in `ko-indicators.json` (ebenfalls Track-Record-getriggert). **Unbedingt im nächsten Track-Record-Review prüfen (Axel, 14.07.2026).**
17. **✅ ERLEDIGT (21.07.2026) — Server-seitige Berechnung von Breadth/TSI/Bull-Indikator/Intermarket/DarkPool-Score — MCM-Parität Client↔Server** *(14.07.2026, aus MCM-Server-Port/Bugfix-Session)* — Im Zuge des MCM-Python-Ports (`ko-aggregator` v5.8.2, `build_server_market_context()`) wurde festgestellt: fünf Faktoren des Market Context Module existieren **ausschließlich als Client-seitige DOM-Berechnung** im Frontend (`loadIntermarket()`, `calcBullIndicator()`, `calcTreasuryStress()`, `loadNasdaqBreadth()`, DarkPool-Flow-Score) — der Python-Aggregator hat dafür **keine eigene Berechnungslogik**, diese Werte fehlen daher im serverseitig generierten `daily_market_snapshot`-Briefing vollständig (bewusst fail-closed, kein Platzhalterwert). **Auswirkung:** Das nächtliche/automatische Server-Briefing (Cache-Pfad, Regelfall für Beta-Tester) ist dadurch inhaltlich schmaler als das Browser-Briefing (das bei manueller Auslösung alle Werte berechnet). **Entscheidung (Axel, 14.07.2026): mittelfristig verbindlich serverseitig nachbauen** — kein Dauerzustand, sondern klar als Zwischenschritt markiert, bis Python-Äquivalente für alle fünf Faktoren existieren und `build_server_market_context()` volle Parität zum Client-`buildMarketContext()` erreicht. **Umsetzungsschritte (grobe Reihenfolge, noch nicht sprint-committed):** (1) NDX Breadth — serverseitig bereits Rohdaten für viele Ticker vorhanden (Aggregator-Universum), Berechnungslogik (% über EMA20/50) müsste nur portiert werden, vermutlich der einfachste der fünf; (2) Intermarket-Score + Bull-Indikator — Formel-Port aus JS, Datenbasis (Sektor-RS, VIX-Struktur) liegt serverseitig teilweise schon vor; (3) Treasury Stress Index (TSI) — ggf. zusätzliche FRED-Datenreihen nötig, die der Server noch nicht zieht; (4) DarkPool-Score — abhängig von bestehender `dixGex`-Datenquelle (FINRA ATS/TRF, siehe Backlog-Historie), Scoring-Formel muss identisch zur Client-Logik sein. **Kein Bau in diesem Sprint** — Reihenfolge/Priorisierung im nächsten UIQ-Planungsschritt festlegen.
18. **VCP Detection (Volatility Contraction Pattern) — Volumen-Bestätigung als Sprint 2 vorgemerkt** *(14.07.2026, Konzeptentscheidung Axel + Claude)* — Neue Erkennungslogik für Minervini-VCP-Setups (mehrere aufeinanderfolgende, enger werdende Kurskorrekturen im Aufwärtstrend). **Architekturentscheidung:** eigenständiges 9. Leaderboard „VCP-Setups" (nicht nur Gate/Bonus im bestehenden Momentum-Score) — macht das Muster sichtbar und separat auswertbar für den Track Record. **Verengungs-Logik mit Toleranz:** letzte Contraction < Durchschnitt der vorherigen Contractions (nicht streng monoton je einzelne kleiner als die direkt vorherige) — robuster gegen Datenrauschen, vermeidet False Negatives bei real leicht unregelmäßigen Mustern. **Sprint 1 (jetzt):** reine Preis-Struktur (Swing-Hoch/Tief-Erkennung, Contractions, Trend-Kontext-Gate). **✅ Sprint 1 UI (14.07.2026):** Leaderboard-Tab „📐 VCP" im Alpha Desk ergänzt (axel-scanner v329). **Sprint 2 (vorgemerkt, NICHT vergessen):** Volumen-Bestätigung (abnehmendes Volumen in späteren Contractions) als zweite Schicht daraufsetzen, sobald Praxis-Erfahrung mit Sprint 1 vorliegt (Pareto-Prinzip: Struktur zuerst, Verfeinerung wenn Feedback da ist — analog zum MCM-Vorgehen vom selben Tag).
19. **Systematischer Dead-Code- & Konsistenz-Audit für index.html (23.000 Zeilen)** *(14.07.2026, Axel-Initiative nach einem sehr fundreichen Session-Tag)* — Ausgangsbeobachtung: Der heutige Sprint hat mehrfach ZUFÄLLIG strukturelle Probleme aufgedeckt, ohne gezielt danach gesucht zu haben (4 duplizierte Ampel-Renderer, toter `KoMarkov`-Namespace, 9 fehlende Cache-Buster, 2 Return-Arity-Bugs in Python, tote DOM-ID-Referenzen bereits aus v282 bekannt). Diese Trefferquote bei reinem Nebenprodukt-Finden deutet auf eine relevante Dunkelziffer noch nicht gefundener Probleme hin — erwartbare Konsequenz einer über Monate organisch gewachsenen, monolithischen Codebasis ohne Modul-Grenzen. **Ehrlicher Rahmen (Claude, 14.07.2026):** Eine Vollständigkeitsgarantie („garantiert sauberer Code") ist bei dieser Größenordnung realistisch nicht möglich — weder maschinell noch durch menschliches Audit. Realistisch UND wirksam ist ein dreistufiges Vorgehen: **(1) Automatisierte Dead-Code-Erkennung** (schnell, maschinell, objektiv) — Skript das (a) jede Funktionsdefinition gegen tatsächliche Aufrufstellen im gesamten Code prüft, (b) jede `getElementById()`-Referenz gegen tatsächlich existierende `id=`-Attribute validiert, (c) duplizierte Code-Blöcke über Textähnlichkeits-Heuristik identifiziert — liefert eine konkrete priorisierte Fundliste statt vagem Bauchgefühl. **(2) Systematischer Modul-Audit** (mittlerer Aufwand, mehrere Sessions) — das erfolgreiche `calc_markov()`-Auditmuster vom heutigen Tag auf weitere kritische Funktionsgruppen ausweiten (alle `calc_*()`-Funktionen im Aggregator auf Return-Arity-Konsistenz, alle Fetch-Aufrufe systemweit, alle DOM-ID-Referenzen). **(3) Strukturelle Präventivmaßnahme (langfristig, Multi-Wochen-Projekt, NICHT Feierabend-Task):** Migration von Monolith zu ES6-Modulen (analog zum bereits laufenden `ko-modules`-Ansatz für gemeinsame Bausteine) — der eigentliche strukturelle Grund für die Fehleranfälligkeit ist die fehlende Modul-Trennung, nicht Stil/Sauberkeit im engeren Sinne. **Nächster konkreter Schritt (kommende Session, nicht heute):** Claude baut das Analyse-Skript aus (1), liefert eine faktenbasierte Fundliste, daraus wird ein priorisierter Cleanup-Sprint abgeleitet (gleiches Vorgehen wie der heutige Bug-Sprint). **Ergänzung (14.07.2026, Gemini-Vorschlag zur Diskussion gestellt, kein Beschluss):** Gemini schlug als Alternative eine sofortige Vollmigration vor — Vite-Build-Toolchain, ES6-Modul-Struktur (state/api/components getrennt), Pub/Sub-Store nach Redux-Vorbild, HTML-Partials statt Monolith. **Bewertung (Claude):** Technische Diagnose korrekt, Lösung ist Standard-Praxis und funktional richtig — aber teuerste/riskanteste Variante (neue Tool-Chain, neuer Deploy-Workflow, Multi-Wochen-Aufwand) für ein Problem, dessen tatsächliche Größe noch unbekannt ist. Zusätzliches Risiko: mitten in UIQ Phase 0 (laufender Track-Record-Uhr seit 02.07.) bindet eine Vollmigration Zeit und schafft Regressionsrisiko im Produkt, das gerade seinen Track Record aufbaut. **Reihenfolge bleibt wie oben festgelegt: erst Audit-Fakten, dann Entscheidung über den Reaktionsumfang** — Vollmigration ist eine mögliche, aber keine vorausgesetzte Konsequenz des Audits, und würde falls gewünscht als eigene STRATEGIE.md-Entscheidung mit explizitem Zeitrahmen behandelt, nicht parallel zu Phase 0. **Isoliert übernehmenswert unabhängig von der großen Frage:** das Pub/Sub-Store-Pattern aus dem Gemini-Vorschlag könnte inkrementell (ohne Build-Step/Migration) an einzelnen Stellen eingeführt werden, z.B. für die Ampel-/Regime-Daten, die informell bereits so funktionieren (`window._lastMseResult` + Custom Event `ko:regimeChanged`, siehe v323-Renderer-Vereinheitlichung selbigen Tages).

**✅ Audit durchgeführt + Priorität 1-3 umgesetzt (15.07.2026):** Skript aus (1) gebaut und ausgeführt — 557 Funktionsdefinitionen, 47 DOM-ID-Referenzen, 343 Duplikat-Fenster analysiert (axel-scanner v330/v331, ko-modules Commit 02644b8). **Wichtigster Fund:** calcMarkovRegime()/buildTransitionMatrix()/verifyMarkovLabels()/calcMarkovSignal() waren komplett inline in index.html dupliziert, byte-identisch zur CDN-Version aus ko-markov.js — da spätere function-Deklarationen im selben Scope frühere überschreiben, lief NUR die Inline-Kopie, die CDN-Version war toter Code trotz Ladens. Genau das von Gemini beschriebene "Multiple Sources of Truth"-Risiko, hier konkret nachgewiesen statt nur theoretisch. Behoben: Inline-Kopie entfernt. Weitere Fixes: updateRegimeCockpit() (totes Legacy-Widget, lief bei jedem Morning-Briefing-Abschluss unnötig mit inkl. echtem Yahoo-VIX-API-Call) entfernt; m-oil→m-oil2-Namensdrift in 2 aktiv genutzten Funktionen korrigiert (WTI-Ölpreis war immer "—"); 27 bestätigt tote Funktionen + 2 ungenutzte Exports entfernt (~560 Nettozeilen); Intermarket-Auto-Load-Gate in autoMakro() ergänzt (KI bekam sonst still Platzhalter-Daten ohne Nutzer-Warnung, analog MCM-Polling-Gate). Bewusst NICHT entfernt: listIndicators()/listByCategory() — vermutlich absichtlich vorbereitete Infrastruktur (Debug-Tool bzw. dokumentierte Zukunfts-Nutzung), nicht versehentlich tot. **Priorität 4 (offen, niedrige Dringlichkeit, rein kosmetisch):** mehrere sicher geguardete, aber dauerhaft wirkungslose Fundstellen — r-portfolio-rec/r-port-details (calcPortfolioRec zeigt nie etwas an), list-select (updateExistingWatchlist niemals aktiv), ki-dropdown-wrap (Dropdown-Sichtbarkeits-Toggle feuert nie), overheat-text/sektor-overheat-content (Sektor-Overheat-Text wird nie gerendert, beide Ziel-IDs fehlen), Reste der preset-select/ticker-preset-Namensdrift. Kein funktionaler Gewinn bei Fix, nur Code-Ehrlichkeit — bei Gelegenheit, kein eigener Sprint nötig.





20. **dataQuality-Flag im MCM-Context** *(21.07.2026, aus KIMI-Analyse-Reflexion)* — Heute generiert das Morning-Briefing manchmal mit unvollständigen MCM-Daten (einzelne Fetches fehlgeschlagen, DOM-Elemente noch nicht befüllt) ohne das dem Nutzer zu kommunizieren. Ein systematisches `dataQuality: 'full' | 'partial' | 'minimal'`-Flag in `buildMarketContext()` würde transparent machen wenn das Briefing auf unvollständiger Datenbasis erstellt wurde. **Umsetzungsort:** `ko-indicators-loader.js` — Zähle befüllte vs. erwartete Faktoren, leite daraus drei Qualitätsstufen ab, exponiere als `ctx.dataQuality`. Im MB-Tearsheet als kleiner Hinweis anzeigen wenn `partial` oder `minimal`. **Timing:** Post-Phase-0.5, beim nächsten ko-indicators-loader-Sprint (ein Nachmittag, niedrige Hürde, blockiert nichts). Quelle: KIMI-Analyse Juli 2026, destilliert auf den implementierbaren Kern.

21. **regimeConfidence-Anzeige** *(21.07.2026, aus KIMI-Analyse-Reflexion)* — Die MSE gibt heute ein Regime aus ohne Konfidenz-Information. An Tagen mit widersprüchlichen Signalen (z.B. BULL_QUIET bei ndx_breadth-caution) wäre „BULL_QUIET (62%)" informativer als nur „BULL_QUIET". Berechnung: (dominanter Score-Anteil / Gesamt-Score) × 100, adjustiert für Datenqualität. **Voraussetzung:** Track-Record-Daten aus ~60 Tagen Betrieb (Anfang September 2026) um Schwellen zu kalibrieren — was ist eine „hohe" vs. „niedrige" Konfidenz empirisch, nicht geraten. **Timing:** Phase-1-Einstieg, nach erstem Track-Record-Review (~Anfang September). Quelle: KIMI-Analyse Juli 2026.

22. **sizingMultiplier in der Strategie-Ampel** *(21.07.2026, aus KIMI-Analyse-Reflexion)* — Die Ampel zeigt heute nur Farben (grün/amber/rot). Ein numerischer Sizing-Faktor pro Gate (z.B. Momentum 🟡 0.6×) würde die Trading-Entscheidung direkt unterstützen: wie groß soll die Position sein, nicht nur ob sie erlaubt ist. **Voraussetzung:** Kalibrierung der Multiplikatoren erfordert empirische Treffer/Fehlschlag-Raten pro Strategie pro Regime — mindestens 60-90 Tage Track-Record. Jeder Wert vor diesem Zeitpunkt wäre geraten, nicht evidenzbasiert. Die MB-STATEMENT-DATA-MATRIX.md §4.3 hat Regime-basierte Positions-Sizing-Multiplikatoren konzeptionell bereits vorgedacht — das ist die Grundlage für die spätere Implementierung. **Timing:** Phase-1-Einstieg, nach erstem Track-Record-Review (~Anfang September), gemeinsam mit №21. Quelle: KIMI-Analyse Juli 2026.

23. **✅ ERLEDIGT (30.07.2026) — ko-prompts-registry Sprint 2 (Modularisierung Stufe 1)** — Drei verbliebene Inline-Prompt-Strings aus index.html in ko-prompts.js externalisiert: (1) `getIntermarketPrompt(ctx)` — der lange Intermarket/Makro-Analyse-Prompt aus `autoMakro()` (JSON-Output: verdict/verdictText/factors). (2) `getOversoldPrompt(ctx)` — Oversold-Rebound-Scan-Prompt aus `runOversoldScan()`. (3) `getMetaAnalysisPrompt(ctx)` — Backtesting Meta-Analyse-Prompt aus `runMetaAnalysis()`. **Ergebnis:** Alle KI-Call-Prompts in index.html sind vollständig über `KoPrompts.*` gesteuert — kein einziger Inline-Prompt-String mehr in index.html. ko-prompts.js v2.4.0, axel-scanner v414 (30.07.2026).

24. **✅ ERLEDIGT (30.07.2026) — ko-indicators-registry Sprint (Modularisierung Stufe 2)** — Bidirektionales Strategie↔Leaderboard-Mapping als Single Source of Truth in ko-prompts.js verankert. Zwei separate, manuell gepflegte Tabellen (`STRATEGY_TO_LB` und `_lbToStrat`) hatten bereits mehrfach zu Bugs geführt (Bugfix 21.07.: `short_fading → fading_short`; Bugfix 17.07.: Namensdrift `options_csp`). **Lösung:** `lbKey`-Feld zu allen 14 Strategie-Objekten in `STRATEGIES` ergänzt; neue API-Methoden `KoPrompts.getLbKey(stratId)`, `KoPrompts.stratFromLb(lbKey)`, `KoPrompts.getStratToLbMap()`. Beide Tabellen aus index.html entfernt, 5 aktive Call-Sites umgestellt (`renderGateWidget`, `runBestOpportunityKI`, `runAlphaLbKI`). ko-prompts.js v2.5.0, axel-scanner v415 (30.07.2026). **Bestandsaufnahme-Lernpunkt:** Ursprünglich als DOM-Read-Umbau (→ `getIndicatorValue()`) geplant — Analyse ergab dass `getIndicatorValue()` intern ebenfalls `getElementById()` macht und für reine DOM-Reads ohne aggregatorKey-Fallback keinen funktionalen Gewinn bringt. Scope auf das tatsächliche Multiple-Sources-of-Truth-Problem (Mapping-Tabellen) umgelenkt.


28. ➡️ UMGEWIDMET → Refundex (05.08.2026) **Journal-Modul** *(02.08.2026)* — Architektur-Entscheidung: Trade-Journal gehört nicht in UIQ (DSS §0-Filtertest: ein Journal-Eintrag ist kein Entscheidungs-Werkzeug, sondern Positions-Bewirtschaftung nach dem Trade). Richtige Heimat: **Refundex** — dort ist Flex-Query-Anbindung vorhanden, P&L kommt automatisch aus IBKR-Export statt manuell, und die Steuerrelevanz ist direkt angebunden. UIQ-Grundgesetz §3 (Funnel-Strategie): Entscheiden=UIQ, Bewirtschaften=Refundex/Premium Options. Kein UIQ-Code nötig oder gebaut. Refundex-Backlog-Eintrag folgt in separater Session.

29. **MSE Regime-History-Flag + NEUTRAL als 5. Regime** *(07.08.2026, aus Analyse MSE-Zustandslosigkeit)* — **Kernproblem:** Der MSE klassifiziert jeden Tag zustandslos — er kennt nur den aktuellen VIX3M/VIX-Ratio und VIX-Wert, aber nicht den Übergangsvektor. Zwei Tage mit identischem Ratio=1.03 bekommen das gleiche Label `POST_PANIC_REVERSION`, obwohl sie fundamental verschiedene Marktphasen sein können: (A) Markt erholt sich aus Backwardation (`STRESS → POST_PANIC`, Ratio steigt) vs. (B) Markt schwächt ab aus Bull (`BULL_QUIET → POST_PANIC`, Ratio fällt). Heute erhalten beide **identische Strategie-Gates** — das ist suboptimal.

30. **Makro-Regime-Trendanalyse + Meta-Signal-Architektur** *(07.08.2026, aus Analyse Datensatz-Inventar)* — Natürliche Erweiterung von Backlog №29: Die History-Flag-Logik (Übergangsvektor aus Zeitreihen) systematisch auf alle UIQ-Datensätze anwenden und in einer Meta-Beziehung bündeln.

   **Inventar — drei Klassen von Datensätzen:**

   *Klasse A — Zeitreihen mit Verlauf (sofort vektorisierbar):*
   VIX/VIX3M/VVIX/SKEW (252T, täglich), VIX3M/VIX-Ratio (252T, regimeContext bereits implementiert №29), HY-Spread FRED (300 Obs, wöchentlich), Net Liquidity FRED (120 Obs, wöchentlich), Zinsstruktur 10J-2J/10J-3M (FRED, täglich)

31. **IBKR API-Erweiterung — Marktdaten, Fundamentals, Options-Chains** *(07.08.2026, frühe Morgenstunden)* — Konzeptionelle Weichenstellung: Klare Trennung zwischen dem was wir haben und dem was möglich wäre.

   **Was wir haben — Flex Web Service (implementiert, v5.30.0):**
   Reporting-Export für abgeschlossene Trades, Positionen, Dividenden, QSt.
   Kein Live-Zugang, kein Ticker-Universum, keine Marktdaten.
   Zweck: Refundex (Steuer, Journal), nicht UIQ (Entscheidung).

   **Was möglich wäre — IBKR Client Portal (CP) API:**
   REST-API ohne TWS-Installation, OAuth2, JSON-Responses.
   Basis-URL: `https://localhost:5000/v1/api/` (CP Gateway lokal) oder
   `https://api.ibkr.com/v1/api/` (Cloud-Variante, beta).

   *Globale Ebene (Market-Regime + Macro-Regime):*
   - Historische OHLCV für beliebige globale Indizes (DAX, Nikkei, EM, etc.)
     → Macro-Regime nicht mehr US-zentrisch (nur VIX/FRED)
     → Globale Breadth: wie viele Märkte sind gleichzeitig im Bull-Modus?
   - Sektoren-Rotation aus globalen ETFs (MSCI World Sectors)
   - FX-Crosses (EUR/USD, USD/JPY) als Makro-Signal

32. **Testgürtel Regime-Pfad** *(SWOT W1/W2/T3, 07.08.2026)* — Unit-Tests für: `_ratio_to_regime()`-Äquivalent, Regime-Klassifikation mit beiden Ratio-Konventionen (VIX/VIX3M und VIX3M/VIX), `calc_regime_history_flag()` (alle 5 Szenarien bereits manuell getestet → formalisieren). Ablage: `ko-aggregator/tests/test_regime.py`. Schützt das wertvollste Asset: jeder Scoring-Bug der rückwirkend entdeckt wird kontaminiert den Track-Record. **~1–2 Sessions. Höchste Prio nach Beta-Start.**

33. **Ratio-Konvention härten** *(SWOT W2, 07.08.2026)* — `vix_term['ratio']` umbenennen zu `vix_term['ratio_vix_vix3m']` (oder zweites Feld `ratio_3m_1m` ergänzen). Dem Bug-Klasse den Namen wegnehmen: aktuell koexistieren VIX/VIX3M (fetch_vix_term) und VIX3M/VIX (Regime-Klassifikation) im selben Datenobjekt — jede neue Funktion die `ratio` konsumiert kann den v4.3-Bug reproduzieren. **Kleiner PR, große Wirkung.**

34. **Backtest-Skript 2007–2026** *(SWOT W7/O2/Go-Kriterium 2, 07.08.2026)* — Historischer Regime-Backtest auf VIX3M-Historie (Yahoo: ^VIX3M ab 2007). Metrik: hätte die Regime-Gate-Logik eine naive Baseline (200T-Momentum × Volatilität) über rollende 12M-Fenster geschlagen? Ersetzt den unterpowerten prospektiven Validierungsrahmen (Ebene 1 braucht n=20 je Kategorie — historisch sofort verfügbar). Output: Equity-Kurve je Regime, Trefferquote, Max-Drawdown. **Go-Kriterium 2 für Kommerzialisierung.**

35. **yfinance pinnen + Degradations-Pfad** *(SWOT W4/T2, 07.08.2026)* — Zwei Maßnahmen: (a) `pip install yfinance==X.Y.Z` im GHA-Workflow (aktuell ungepinnt → Breaking-Changes schlagen ungefiltert durch); (b) Bei yfinance-Fetch-Fehlern: Vortages-KV weiterverwenden statt Lauf-Abbruch (`degraded_mode: true` im Output). Ein yfinance-Ausfall ist heute Totalausfall, nicht degradierter Lauf. **Defensive Maßnahme, ~1h.**

36. **Rechtsgutachten beauftragen** *(SWOT T1/Go-Kriterium 1, 07.08.2026)* — WpHG/WpIG-Grenze: Finanzanalyse vs. Anlageberatung. Laut STRATEGIE.md ~800 €, laut SWOT billigster existenzieller Risiko-Abbau der gesamten Roadmap. Muss vor dem ersten zahlenden Kunden stehen — kein Grund zu warten da unabhängig vom Feature-Stand. **Nicht-technisch, aber Kommerzialisierungs-Blocker.**



   *Ticker-Ebene (Aggregator-Universum):*
   - **Fundamentaldaten**: EPS, Revenue-Wachstum, KGV, Debt/Equity direkt von IBKR
     → ersetzt fehlende Fundamentals in Composite Score
     → Value-Leaderboard auf echten Daten statt Näherungswerten
   - **Earnings-Kalender**: Earnings-Date + EPS-Estimate direkt je Ticker
     → Strategie-Gates: automatisch kein Entry 5T vor Earnings (heute manuell)
     → Earnings-Surprise-Historie für Qualitäts-Score
   - **Options-Chain**: IV, Greeks (Delta/Theta/Vega), OI, Volume je Strike
     → IV-Rank aus echten Daten (heute: Approximation via HV-Percentile)
     → CSP/CC: optimale Strike-Wahl automatisiert (Delta-Target statt Daumenregel)
     → PCR direkt je Ticker (nicht nur Markt-PCR)
   - **Short Interest**: Days-to-Cover, Short-Float
     → Squeeze-Risk-Indikator auf echten Daten (heute: calc_squeeze_risk approximiert)

   *Universum-Ebene:*
   - **Dynamischer Scanner**: IBKR-eigener Scanner (Volumen-Ausreißer, Gap-Up, etc.)
     → Ticker-Universum nicht mehr auf ~700 fixiert
     → Tägliche Ergänzung von Momentum-Kandidaten die noch nicht im Universum sind
   - **Corporate Actions**: Splits, Mergers, Spin-Offs direkt (heute: CorporateActions aus Flex-XML, nur eigene Positionen)

   **Technische Voraussetzungen:**
   ```
   Option A — CP Gateway (lokal, empfohlen für Privatanleger):
     1. Client Portal Gateway herunterladen (IBKR)
     2. Lokal starten: java -jar root/bin/run.sh root/conf.yaml
     3. OAuth2-Login einmalig im Browser
     4. API auf localhost:5000 verfügbar (Session ~24h)
     Nachteil: läuft nur wenn Mac läuft — nicht für GHA-Nachtlauf

   Option B — Cloud-API (beta, kein lokales Gateway):
     Noch eingeschränkt, nicht alle Endpoints verfügbar
     Besser für automatisierte Nachtläufe (GHA)

   Option C — Hybrid:
     CP Gateway für Fundamentals/Earnings (wöchentlich, manuell angestoßen)
     yfinance bleibt für Daily-OHLCV (GHA-Nachtlauf)
     FRED bleibt für Makro
   ```

   **Empfehlung: Option C (Hybrid), stufenweise:**
   ```
   Stufe 1 (~Q4 2026): Earnings-Kalender via CP API
     → höchster sofortiger Nutzen, einfachste Integration
     → wöchentlicher Pull, in KV gespeichert, Gate-Logik nutzt es

   Stufe 2 (~Q1 2027): IV-Rank aus echten Options-Chains
     → ersetzt HV-Percentile-Approximation
     → Voraussetzung: CP Gateway stabil im Betrieb

   Stufe 3 (~Q2 2027): Fundamentaldaten + Short Interest
     → Value-Leaderboard auf echten Daten
     → Composite Score erweitern

   Stufe 4 (offen): Globale Indizes für Macro-Regime
     → Macro-Regime nicht mehr US-zentrisch
   ```

   **Abgrenzung zu Flex Web Service (wichtig):**
   Flex Web Service → Refundex (was war: abgeschlossene Trades, Steuer)
   CP API          → UIQ (was ist + was kommt: Live-Daten, Entscheidung)
   Beide nutzen IBKR-Credentials, sind aber völlig verschiedene Systeme.

   **Nächster Schritt:** CP Gateway lokal installieren + Earnings-Endpoint testen.
   Kein Bau vor Abschluss der Meta-Signal-Validierung Ebene 1 (~01.10.2026) —
   Prioritätsspine: UIQ Phase 0 zuerst, CP API ist Erweiterung nicht Fundament.
   Verwandt mit: №29+30 (Meta-Signal), ML_KONZEPT.md §3b, Refundex 2.10 (Flex Web Service)



   *Klasse B — Momentaufnahmen ohne History-Tracking (nachrüstbar):*
   PCR (täglich, KV-Speicherung nötig), Fear&Greed (täglich), MOVE Index (täglich), McClellan Breadth Oscillator (täglich), IOS Market Score (täglich), Distribution Days (täglich)

   *Klasse C — Ticker-Ebene (Markt-Aggregat extrahierbar):*
   RS-Rank-Verteilung (Median/Top-Quartil über alle Ticker), Composite-Score-Trend (Durchschnitt über Universum), VCP-Dichte (Anzahl aktiver VCP-Muster)

   **Schritt 1 — Signal-Trend-Funktion (universell, analog History-Flag):**
   ```python
   def calc_signal_trend(series, window=10, threshold=0.5):
       """Steigungsvektor für beliebige Zeitreihe."""
       # delta über window → RISING | FALLING | STABLE | UNKNOWN
       # Normalisierung: absolut oder Z-Score-Delta je nach Skala
   ```

   **Schritt 2 — Makro-Regime-Kontext (`calc_macro_regime_context`):**
   6 Makro-Regime regelbasiert aus Klasse-A-Vektoren:
   ```
   EXPANSION:      HY stabil/fallend, Net-Liq expandiert, Kurve steilt, VIX niedrig
   LATE_CYCLE:     HY steigt leicht, Net-Liq stabil, Breadth schwächelt
   STRESS_BUILDING: HY steigt schnell, Net-Liq schrumpft, VIX steigt, Ratio fällt
   ACUTE_STRESS:   HY > 5%, VIX > 30, Ratio < 0.98, Net-Liq stark negativ
   RECOVERY:       HY fällt, Net-Liq erholt, VIX fällt, Ratio steigt
   NEUTRAL_MACRO:  Alle Signale nahe 0, keine klare Richtung
   ```
   Output: `master.market.macroRegime` im KV-Store

   **Schritt 3 — Breadth-Trend-Kontext (`calc_breadth_context`):**
   Klasse-B-Signale als Verlauf (KV-History nötig, 30T rolling):
   McClellan-Trend (EXPANDING/CONTRACTING), Distribution-Days-Dichte, IOS-Score-Trend
   Output: `master.market.breadthContext`

   **Schritt 4 — Markt-Breite-Aggregat aus Ticker-Ebene (`calc_universe_context`):**
   Klasse-C: RS-Rank-Median aller Ticker, Anteil VCP-aktiver Ticker, Composite-Score-Trend
   Output: `master.market.universeContext`

   **Schritt 5 — Meta-Signal-Architektur (`calc_meta_signal`):**
   Die eigentliche Kernidee: alle Vektoren in eine Meta-Beziehung setzen.
   ```
   Dimension 1 (Makro-Fundament):  macroRegime      — Wochen/Monate
   Dimension 2 (Mikro-Struktur):   mseRegime        — Tage
   Dimension 3 (Übergangsvektor):  regimeContext    — Richtung des MSE
   Dimension 4 (Markt-Breite):     breadthContext   — Partizipation
   Dimension 5 (Universum):        universeContext  — Ticker-Qualität
   ```

   Meta-Signal-Logik (regelbasiert → später HMM-Input):
   ```
   macroRegime=STRESS_BUILDING + mseRegime=BULL_QUIET + vector=STABLE
     → "Oberfläche trügt" — Gate-Reduktion auch bei ruhigem MSE

   macroRegime=EXPANSION + mseRegime=BULL_FRAGILE + vector=RECOVERING
     → "Kurze Volatilitätsspitze im strukturellen Bull" — weniger defensiv

   macroRegime=RECOVERY + breadth=EXPANDING + universe=RS_IMPROVING
     → "Breite Erholung" — Momentum-Gates grün

   macroRegime=LATE_CYCLE + breadth=CONTRACTING + universe=RS_DETERIORATING
     → "Breite bröckelt" — Positionsgröße reduzieren trotz positiver Oberfläche
   ```
   Output: `master.market.metaSignal` — Konfidenz + narrative Erklärung für Morning Briefing

   **Beziehung zu ML-Architektur (ML_KONZEPT.md §3b):**
   Das Meta-Signal ist der natürliche Input-Vektor für das MCM-HMM (Phase 2, Okt. 2026):
   statt einzelner Indikatoren bekommt das HMM den 5-dimensionalen Meta-Signal-Vektor.
   Das verbessert HMM-Qualität erheblich gegenüber Einzelsignalen.

   **Implementierungsreihenfolge:**
   1. `calc_signal_trend()` universal (20 Zeilen) — sofort möglich
   2. `mse_history` um FRED-Zeitreihen erweitern (HY-Spread + Net-Liq als Arrays)
   3. `calc_macro_regime_context()` (Klasse A, ~80 Zeilen)
   4. KV-History für Klasse-B-Signale (30T rolling, separater KV-Key)
   5. `calc_breadth_context()` + `calc_universe_context()`
   6. `calc_meta_signal()` — Komposition aller Dimensionen
   **Trigger: nach Backlog №29 im Betrieb (~01.09.2026), parallel zu BN-Analyse**

   Verwandt mit: №29 (Regime-History-Flag), ML_KONZEPT.md §3b (Staffel-Sequenz), DCE (nutzt meta_signal als Input)



   **Lösungsansatz 1 — Regime-History-Flag (bevorzugt):** Statt eines neuen statischen Labels wird der Übergangsvektor als Kontext-Objekt mitgeführt:
   ```python
   regime_context = {
       "current":       "POST_PANIC_REVERSION",
       "previous":      ["STRESS_UNSTABLE", "STRESS_UNSTABLE", "BULL_FRAGILE"],
       "vector":        "RECOVERING",   # RECOVERING | DETERIORATING | STABLE
       "stress_days_ago": 2,            # Tage seit letztem STRESS_UNSTABLE
       "consecutive":   3,              # Tage im aktuellen Regime
   }
   ```
   `vector` wird aus `mse_history` (bereits im KV-Store, 30 Tage) abgeleitet — die Datenbasis ist **schon vorhanden**, es fehlt nur die Auswertungslogik. Konsequenz für Strategie-Gates: `POST_PANIC + RECOVERING` → Mean-Reversion-Gates grün, CSP rot (Vola noch hoch); `POST_PANIC + DETERIORATING` → defensiv, CSP amber; `POST_PANIC + STABLE + consecutive≥5` → funktionales NEUTRAL, Theta-Strategien bevorzugt.

   **Lösungsansatz 2 — `NEUTRAL` als 5. Regime:** Eigenständiges Label für stabile Seitwärtsphasen ohne vorherigen Stress-Schock (Ratio ≥ 1.02, VIX 15–22, letzten N Tage kein STRESS_UNSTABLE). Konzeptionell sauberer als History-Flag, aber erfordert ein weiteres Label das den Track-Record-Aufbau verlangsamt (n≥20 pro Regime dauert länger).

   **Bewertung:** Lösungsansatz 1 (History-Flag) ist vorzuziehen — kein neues Label nötig, mehr Information pro Label, Datenbasis bereits vorhanden. Mit dem Flag wird NEUTRAL überflüssig: `POST_PANIC + vector=STABLE + consecutive≥5` ist das funktionale Äquivalent. `NEUTRAL` als separates Label nur wenn der Track Record zeigt, dass die Gate-Unterschiede zwischen den vector-Varianten nicht ausreichen.

   **Validierung:** Siehe `docs/VALIDIERUNG_META_SIGNAL.md` Ebene 1 — Vector-Return-Unterschied (Welch-t-Test, p<0.10, Mindest-n=20 je Kategorie, ~01.10.2026).

   **Sofort:** regimeContext in tr:snap speichern (v5.30.0) — damit Forward-Return je vector-Kategorie messbar wird.

   **Voraussetzung für Implementierung:** Track-Record-Daten aus ≥90 Tagen Betrieb (ab ~01.10.2026) — erst dann ist empirisch prüfbar ob `POST_PANIC(RECOVERING)` vs. `POST_PANIC(DETERIORATING)` tatsächlich unterschiedliche Hit-Rates erzeugen. Kein Bau vor diesem Zeitpunkt — jede Grenzlinie vorher wäre geraten. **Trigger: erstes vollständiges Track-Record-Review mit h30-Daten (~01.10.2026).** Verwandt mit №16 (Calendar-Buffer), №21 (regimeConfidence), №22 (sizingMultiplier) — alle Track-Record-getriggert.


27. **Mindest-Volumen-Filter AVWAP + OB-Detector** *(02.08.2026)* — Illiquide Titel (z.B. AIVAF: ADX 45.6 aber ER 0%) erzeugen unplausible TVA-Regime-Signale. Fix: `compute_anchored_vwap()` und `compute_orderblocks()` nur für Ticker mit `avgVol20 >= 100_000` (Tages-Durchschnittsvolumen). Analoge Logik zu `_is_etf_or_crypto`. **Priorität: Niedrig** — bei nächster passender Session implementieren.

26. ✅ ERLEDIGT (03.08.2026, Aggregator v5.25.0) **TVA MathLibrary — Score-Refactoring Sprint A** *(02.08.2026, aus Pine-Script-Analyse)* — Referenzdokument in `docs/TVA_MATHLIB_ANALYSE.md` (vollständige Python-Port-Snippets). Vier hochrelevante Funktionen portierbar ohne neue Datenquellen:
   - `f_stdTrendScore`: Trend Score −100..+100 aus EMA+RSI+ADX — neues Feld `trendScore` in `process_ticker()`; kompakter und einheitlicher als aktueller Composite Score
   - `f_marketRegime`: 8 Regime + 3-Bar-Hold-Filter — Ergänzung zu Markov, reduziert Regime-Flipping-Rauschen
   - `f_chopIndex`: Chop Index 0–100 aus ADX+DI+ER+BB — neuer MCM-Faktor, ersetzt implizite HVP/bbPos-Kombination
   - `f_sellProbability`: Sigmoid für `score_short_breakdown()` — analog dem bereits in v5.23.0 aktiven Minervini-Sigmoid
   **Offene Lücken für vollständige f_buyProbability:** ADX-Wert fehlt noch in `process_ticker()`; `distToAvwapPct` (seit v5.22.0 live!) als Support-Distanz-Faktor in Minervini eintragen. **Kein Bau vor Backlog-Priorisierungs-Session** — reine Verankerung damit der Sprint nicht in Vergessenheit gerät. Quelle: TVA MathLibrary (Pine Script v6 Library), analysiert 02.08.2026.


## Fortschreibungshistorie

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 03.07.2026 | Erstfassung: Zielbild 3+2 (inkl. DepotIQ und Ruhestandsmodul als Zukunftsprojekte hoher Prio), konsolidierte Grundgesetze, Konsistenz-Standards (Glossar, Regelwerk-Einheit, Prompt-Bibliothek, Design-System, K1–K3-Umsetzungspfad), Suite-Portal-Zielbild, offene Entscheidungen |
| 1.1 | 03.07.2026 | Umzug ins Meta-Repo UIQ-Suite (Single Source, Entscheidung №1 ✓); §4 Prioritäten-Wirbelsäule (Build- vs. Denk-Kapazität, UIQ Phase 0 = Leitprojekt, Claude-Warnpflicht); §5 Suite-SWOT Meta-Ebene (Claude + Gemini-Cross-Check) |
| 1.2 | 06.07.2026 | §3.6 Web-Präsenz & Rechtsseiten (Domain-Architektur, Impressum/Datenschutz/Kontakt/FAQ, i18n-Suite-Regel DACH-first, Corporate Identity, Content-Governance mit Single-Source-Prinzip) + §3.7 Timeframe Design/Web-Rollout in vier Phasen D0–D3 (D0 Sammelbecken sofort, D2 Rollout gekoppelt an UIQ v2.0 Q4 2026 — bewusste Effizienz-Kopplung, keine Doppelarbeit im v1.x-Monolithen). Backlog-Punkt №6 ergänzt. |
| 1.4 | 09.07.2026 | §3.1 Terminologie-Fix: POST_CRACK_REVERSION → POST_PANIC_REVERSION (Abgleich mit Produktiv-Code v278). §7 Backlog-Punkte №9 (Track-Record-Phase-C, Papertrading Modus A+B) und №10 (IV/Earnings-Folgesprint) ergänzt. `docs/MB-STATEMENT-DATA-MATRIX.md` als erstes Konzeptdokument in UIQ-Suite committet (Statement→Data-Matrix v0.2, §4.3 eingefroren, Evidenz-Register §8). |
| 1.5 | 10.07.2026 | §7 Backlog-Punkt №11 ergänzt: MSE-Regime vs. IOS-Market-Score — Widersprüchlichkeiten zwischen unabhängigen Sub-Scores müssen erklärt/thematisiert werden, nicht stillschweigend nebeneinander stehen (Anforderung Axel, aus MB-Tearsheet-Review v297). Kein Bau, reine Verankerung. |
| 1.6 | 10.07.2026 | §7 Backlog-Punkt №12 ergänzt: UIQ-eigener Breadth-Oszillator (NYMO/McClellan-Methodik aus dem bereits gescannten 678-Ticker-Eigenbestand statt externer Advance/Decline-Quelle) — aus Pine-Script-Brainstorming zur GEX/DIX-Problematik (Prism Intelligence SPX u.a.). DIX bleibt strukturell ungelöst, erneut bestätigt. Kein Bau, reine Verankerung. |
| 1.7 | 10.07.2026 | §7 Backlog-Punkt №8 (Inverse-Problem-Register) um Kandidat ergänzt: IBKR/CapTrader Live-Optionsketten-API als potenziell kostengünstige GEX-Datenquelle (Axel hat Zugang bereits für eigenes Trading) — aus weiterem Pine-Script-Review. Details in GEX-SCHEMA.md §6 Prio 1b. Kein Bau, reine Verankerung. |
| 1.8 | 11.07.2026 | §7 Backlog-Punkt №13 ergänzt: Präsentations-Feedback (11.07.) — Strategie-Ampel thematisch sortieren + neue 12. Kategorie "Covered Call" (eigenständig, nicht Teil von csp_wheel); fehlende Scan-Logik für Dividende/Value; Ein-/Ausstiegskurs-Empfehlungen (ATR-Range User-Modus, EUR/USD EIC-Modus) — Überschneidung mit Pattern/Entry-Engine; Feature-Vergleich Trendspider/Deepvue gewünscht; Makro-Tab ETF/Sektor-Holdings-Klickthrough + Watchlist-Übernahme. Konzept insgesamt positiv aufgenommen. Kein Bau, reine Verankerung. |
| 1.9 | 11.07.2026 | §7 Backlog-Punkt №14 ergänzt (HOCH PRIORISIERT auf Axels Wunsch): echtes RS-Rating für score_long_minervini() — Perzentil-Ranking ggü. Scan-Universum statt Markov-Regime-Proxy. Aus Minervini-Pareto-Check: drei günstige Erweiterungen (SMA150, 200er-Steigung, 52W-Tief-Abstand) bereits umgesetzt (score_long_minervini v3), RS-Rating als vierte, wertvollste aber aufwendigste Lücke separat vorgemerkt. |
| 2.0 | 11.07.2026 | §7 Backlog-Punkt №13 (e)+(g) als ✅ ERLEDIGT markiert: ETF-Holdings-Klickthrough (Proof-of-Concept XLK, serverseitige Yahoo-Namensauflösung, Frontend-Modal + Watchlist-Übernahme) und Ticker-Klarnamen-Anzeige (Reverse-Lookup, Scanner-Karten + Shortlist-Tabelle) beide gleichentags fertig gebaut und produktiv verifiziert (index.html v300/v301, market_aggregator.py). Pattern/Entry-Engine (c)+(f) ebenfalls produktiv verifiziert (660/660 Ticker, realistische Score-Verteilung). Strategie-Ampel-Umbau (12 Strategien inkl. CC, 5 Label-Map-Kopien auf eine Quelle konsolidiert) und FINRA-DIX-Frontend-Integration zuvor am selben Abend abgeschlossen. |
| 2.1 | 11.07.2026 | §7 Backlog-Punkt №15 ergänzt: IV-Rank/Percentile pro Einzeltitel — aus Deepvue/Trendspider-Konkurrenzanalyse (Browser + Deepvues eigene Vergleichstabelle). Belegter Kernfund: Deepvue hat null Optionsanalyse, keiner der fünf großen Player deckt Optionsstrategie-Timing + IBD-Ratings + KO-Zertifikate kombiniert ab — echte unbesetzte Marktlücke. IV-Rank direkt nach RS-Rating (№14) priorisiert; Datenquellen-Frage (IBKR vs. yfinance-Optionsketten) vor Bau zu klären. Vorarbeit: IV-Rank-Methodik aus Axels Options-Screener v3.4 vorhanden. |
| 2.2 | 12.07.2026 | §7 Backlog-Punkte №14 + №15 als ✅ ERLEDIGT markiert. №14: RS-Rating zweistufig deployed (Aggregator v5.0, IBD-Perzentil 0–99, 660 Ticker gerankt, Gate 6 in score_long_minervini(), Frontend v302). №15 Phase 1: iv_layer.py v1.0 deployed (Aggregator v5.1), ATM-IV-Archiv gestartet (Tag 0 = 12.07.2026), IV-Rank/IVP ab ~30 Archiv-Tagen, Frontend v302 mit graceful Degrading (IVR→HVP-Fallback). |
| 2.3 | 14.07.2026 | §7 Backlog-Punkt №16 ergänzt: Strategie-spezifische Calendar-Buffer (FOMC/NFP/CPI-Karenzzeit derzeit einheitlich für alle Strategien, vermutlich zu grob für Theta- vs. Hebelprodukt-Strategien) — Track-Record-getriggerte Kalibrierung vorgemerkt, kein Bau. Kontext: Market Context Module (MCM) in axel-scanner v322/v323 fertiggestellt — market_context als Single Source of Truth für Strategie-Ampel UND KI-Prompt (ko-indicators.json v2.1.0, ko-indicators-loader v1.2.0, ko-market-state v2.1 mit calcStrategyGates()); Renderer-Vereinheitlichung (4 duplizierte Ampel-Render-Blöcke → 1, Event-Bus `ko:regimeChanged`); macro-calendar.json mit FOMC/CPI-Terminen gegen federalreserve.gov/bls.gov verifiziert (Axel, 14.07.2026). |
| 2.4 | 14.07.2026 | §7 Backlog-Punkt №17 ergänzt: Server-seitige Berechnung von Breadth/TSI/Bull-Indikator/Intermarket/DarkPool-Score (MCM-Parität Client↔Server) — Axel-Entscheidung: mittelfristig verbindlich nachbauen, kein Dauerzustand. Kontext: 3 permanente Feldpfad-Bugs in generate_daily_snapshot() gefixt (VIX/Regime/PCR waren seit Feature-Launch immer "n/v", ko-aggregator v5.8.2), MCM-Python-Port (build_server_market_context()/calc_server_strategy_gates(), 1:1-Portierung aus ko-modules@b70ca70, Versions-Lock dokumentiert), 4. übersehener Ampel-Renderer in showMSEDetail()-Modal gefixt (axel-scanner v323.1). |
| 2.5 | 14.07.2026 | Zwei Sprint-ready-Backlog-Punkte aus Übergabeprotokoll 13.07.2026 erledigt: (1) Intraday-Vergleich Morgen vs. NYSE im Morning-Briefing-Tearsheet (axel-scanner v327, renderIntradayComparison() — Regime/VIX/Fear&Greed/PCR/Risk-Level aus marketContext.factors, 3 Fallback-Fälle getestet). (2) RUNBOOK.md v1.3 fortgeschrieben (ko-watchdog, zweiter Cron, 8 Leaderboards, daily_market_snapshot-Schritt, §7.5a/§7.5b neue Störungs-Einträge für die heutige Bugklasse, §7.6-Korrektur: CF Pages deployt NICHT automatisch aus Git, sondern manueller ZIP-Upload — Grundsatz ergänzt, laufzeit-geladene Dateien künftig von raw.githubusercontent zu fetchen statt vom Deploy-Zip abhängig zu machen). Zusätzlich in axel-scanner v324–v326 behoben: VIX-Session-Freeze (Guard verhinderte erneuten fetchVix()-Aufruf nach erstem Fetch der Session), systemweiter Cache-Buster-Fix (9 corsProxy-Stellen), Gold-Formatierungsbug (Faktor-100-Fehler durch falsche Locale-Annahme). |
| 2.6 | 14.07.2026 | calc_markov()-Aufrufer-Audit (Backlog-Punkt 3, Übergabe 12.07.2026): 2 Return-Arity-Bugs in ko-aggregator gefunden+gefixt (calc_markov() + Zufallsfund calc_ksi(), v5.8.3) — betraf Ticker mit unzureichender Historie, kompletter Datensatzverlust statt nur fehlender Markov-Felder. JS-seitiger KoMarkov-Cleanup (axel-scanner v328): toter Namespace jetzt genutzt (4 Call-Sites routen über KoMarkov.calc() statt Direktaufruf), duplizierte Farblogik konsolidiert. §7 Backlog-Punkt №18 ergänzt: VCP Detection (Volatility Contraction Pattern) — Konzeptentscheidung getroffen (eigenständiges 9. Leaderboard, Toleranz-basierte Verengungs-Logik, Volumen-Bestätigung explizit als Sprint 2 vorgemerkt), Implementierung folgt. |
| 2.7 | 14.07.2026 | VCP Detection implementiert (ko-aggregator v5.9.0: calc_vcp()/score_vcp(), 9. Leaderboard vcp_setups, 4 Funktionstests) + Frontend-Tab (axel-scanner v329). CPI-Termine gegengecheckt (vollständig, kein Fix nötig). help.html v328 fortgeschrieben (war seit 13.07. veraltet — MCM/VCP-Sektion neu, Aggregator-Beschreibung korrigiert: zweimal täglich statt einmal, v5.9.0 statt v5.8.1, daily_market_snapshot_us + zweiter ko-watchdog-Cron ergänzt). §7 Backlog-Punkt №19 ergänzt: Systematischer Dead-Code-/Konsistenz-Audit für index.html — Axel-Initiative nach fundreichem Session-Tag (mehrere Zufallsfunde: 4 duplizierte Renderer, toter KoMarkov-Code, 9 fehlende Cache-Buster, 2 Return-Arity-Bugs). Dreistufiger Ansatz vorgeschlagen: automatisierte Dead-Code-Erkennung (Skript, nächste Session) → systematischer Modul-Audit (calc_markov()-Muster ausweiten) → ES6-Modul-Migration (langfristig, Multi-Wochen-Projekt). Ehrlich kommuniziert: keine Vollständigkeitsgarantie möglich bei dieser Codegröße, aber faktenbasierte Fundlisten statt Bauchgefühl erreichbar. |
| 2.8 | 14.07.2026 | Backlog-Punkt №19 ergänzt um Gemini-Vollmigrationsvorschlag (Vite-Toolchain, ES6 state/api/components-Trennung, Pub/Sub-Store, HTML-Partials) — als Diskussionsbeitrag eingeordnet, KEIN Beschluss. Claude-Bewertung: technisch korrekt, aber teuerste/riskanteste Variante für ein Problem unbekannter Größe, zusätzliches Timing-Risiko mitten in UIQ Phase 0 (Track-Record-Uhr seit 02.07.). Reihenfolge bleibt: erst Audit-Fakten, dann Entscheidung über Reaktionsumfang; Vollmigration falls je gewünscht als eigene STRATEGIE.md-Entscheidung mit Zeitrahmen, nicht parallel zu Phase 0. Pub/Sub-Store-Idee isoliert als potenziell inkrementell übernehmbar vermerkt (ohne Build-Step), da informell bereits ähnlich existent (window._lastMseResult + Custom Event ko:regimeChanged aus v323 desselben Tages). |
| 3.0 | 21.07.2026 | MCM-Parität Sprint abgeschlossen: Backlog №17 ✅ ERLEDIGT (ko-aggregator v5.13.0: 4 neue Server-Faktoren ndx_breadth/intermarket_score/treasury_stress/bull_indicator in build_server_market_context(), hist_data via master["_hist_data"] injiziert). Bugfix parseFloat x/100 (ko-indicators-loader v1.3.2, split('/')[0] vor Regex — intermarket_score/bull_indicator wurden fälschlich als RISK statt CAUTION klassifiziert, axel-scanner v386). KIMI-Analyse-Reflexion: drei destillierbare Backlog-Items aus KIMI-TypeScript-Proposal ergänzt (№20 dataQuality-Flag, №21 regimeConfidence, №22 sizingMultiplier) — alle anderen KIMI-Vorschläge bewusst nicht übernommen (falsche Architektur-Voraussetzungen, nicht verfügbare Datenquellen, Phase-3-Relevanz). |
| 2.9 | 15.07.2026 | Dead-Code-/Konsistenz-Audit (Backlog №19) durchgeführt und Priorität 1-3 umgesetzt. Analyse-Skript gebaut: 557 Funktionsdefinitionen, 47 DOM-ID-Referenzen, 343 Duplikat-Fenster geprüft. Kritischster Fund: calcMarkovRegime()-Familie war komplett inline in index.html dupliziert (byte-identisch zur CDN-Version aus ko-markov.js) — die CDN-Version lief dadurch nie, klassisches Multiple-Sources-of-Truth-Risiko, wie von Gemini vorhergesagt, hier konkret nachgewiesen. Behoben (axel-scanner v330/v331, ko-modules@02644b8): Markov-Duplikat entfernt, totes updateRegimeCockpit()-Legacy-Widget entfernt (sparte einen unnötigen API-Call pro Morning Briefing), m-oil→m-oil2-Namensdrift korrigiert (WTI-Ölpreis war immer "—"), 27 tote Funktionen + 2 ungenutzte Exports entfernt (~560 Nettozeilen), Intermarket-Auto-Load-Gate in autoMakro() ergänzt (KI bekam sonst stillschweigend Platzhalter-Daten). Priorität 4 (rein kosmetische Restfunde, niedrige Dringlichkeit) im Backlog-Eintrag dokumentiert für spätere Gelegenheit. |
| 3.0 | 16.07.2026 | **Funnel-Strategie als verbindlicher Architektur-Grundsatz verankert** (Zielbild-Abschnitt §1, ergänzt Grundgesetz #1). Auslöser: Axel-Klarstellung zur Modul-Integrationsfrage (UIQ↔Refundex↔Premium-Options-Datenfluss). Kernaussage: UIQ ist bewusst broker-unabhängiger, breiter Einstiegspunkt ("Tipp-Geber für gute Trades" auch für Nicht-IBKR-Kunden) — Refundex/Premium Options sind der IBKR-spezifische Mehrwert-Hebel über Flex-Query-Integration, der einen Anreiz fürs Bleiben/Wechseln zu IBKR/CapTrader/Lynx schafft. Datenfluss-Konsequenz: Flex Query ist die autoritative externe Quelle fürs Trade-/Steuerbezogene, kein UIQ→Refundex-Export nötig oder gewünscht (ursprünglich von Claude vorgeschlagen, von Axel korrigiert). Verbindliche Architektur-Regel: UIQ darf niemals eine harte Flex-Query-/IBKR-Abhängigkeit fürs Kerngeschäft bekommen — jede broker-spezifische Tiefe (echtes Positions-Tracking, Broker-Anbindung) gehört ausschließlich in Refundex/Premium Options. Schärft die Phasengrenze Entscheiden/Bewirtschaften: UIQs Options Desk bleibt bei broker-agnostischen Strategie-Vorschlägen, Premium Options übernimmt den realen Positions-Lebenszyklus. Neue Claude-Pflicht: aktiv warnen, falls künftige UIQ-Erweiterungen in Richtung echter Positionsführung/Broker-Anbindung driften. |
| 1.3 | 08.07.2026 | Backlog-Punkte №7 (Options-Radar/Doktor — Flex-Query als Live-Risiko-Kanal, PO-Entparkungs-Kern-Feature, Suite-Kohärenz UIQ↔PO↔Refundex) und №8 (Inverse-Problem-Register — offenes Sammelregister für Flex-Query-basierte Fragen, die wir noch nicht gestellt haben) ergänzt. Beide 08.07.2026 nach Nachgespräch zum UX-Review. Kein Bau, reine Verankerung. |
| 3.2 | 01.08.2026 | **Session 01.08.2026 — DE-Modus + MCM-Parität + 3 Bugfixes.** (1) §7 Backlog-Punkt №25 (DE-Modus) als ✅ ERLEDIGT: TRADEGATE_MAP +18 verifizierte Einträge (BRKB→BRY, KO→CCC3, PG→PGG, PM→PM1, C→CIT, CSCO→CSC0, T→RHAT, TMUS→T1MU, CMCSA→CBC3, SPGI→SPG1, BX→BXD, ABNB→AB9, LULU→LUL, BIIB→BII, MO→PHM1, WM→WM2, CI→CI1, GD→GD1); TG-Premarket-Preset auf IWV-Top-100 erweitert (vorher nur TRADEGATE_MAP-Keys); Symbole live im Browser verifiziert (getTradegateSym-Test, alle 5 korrekt). (2) §7 Backlog-Punkt №17 (MCM-Parität) vollständig geschlossen: `net_liquidity` als letzter fehlender Faktor in `_MCM_SIGNAL_RULES` + `build_server_market_context()` ergänzt (ko-aggregator v5.20.0); alle 10 Kern-Faktoren + 3 Calendar-Faktoren jetzt Server↔Client-parität. Die 4 ursprünglich fehlenden Faktoren (ndx_breadth, intermarket_score, treasury_stress, bull_indicator) waren bereits seit v5.13.0 (21.07.) implementiert — nur net_liquidity fehlte noch. (3) Bugfix-Sprint: ko-trackrecord.js `export{}`-SyntaxError (v418); autoSyncOnStart 401 fehlender Auth-Header (v419); updateScoreDivergenceDisplay `divs.slice()` self-reference TypeError (v420). Frontend jetzt v420, Aggregator v5.20.0. |
| 3.1 | 30.07.2026 | §7 Backlog-Punkte №23+24 als ✅ ERLEDIGT markiert: (1) ko-prompts-registry Sprint 2 — alle KI-Call-Prompts aus index.html externalisiert (`getIntermarketPrompt`, `getOversoldPrompt`, `getMetaAnalysisPrompt`), ko-prompts.js v2.4.0, axel-scanner v414. (2) ko-indicators-registry Sprint — `STRATEGY_TO_LB` + `_lbToStrat` als Single Source of Truth in ko-prompts.js v2.5.0 (`lbKey`-Felder + `getLbKey`/`stratFromLb`/`getStratToLbMap`), axel-scanner v415. IWV Holdings CSV aktualisiert (Stand 24.07.2026, `ahsub/ko-aggregator/data/iwv_holdings.csv`). Bestandsaufnahme-Methodik bestätigt: Scope-Analyse vor Bau verhinderte nutzlosen DOM-Read-Umbau und lenkte auf das tatsächliche Modularisierungsproblem. |
| 3.5 | 05.08.2026 | **Session 05.08.2026 — Morning Briefing Coaching-Ton + Aufräum + Architektur-Entscheidung Journal.** (1) ko-prompts v2.6.0: `_getMorningPrompt` EIC auf Coaching-Sprache (Mentor-Stil, Metrik-Erklärungspflicht, Handlungshaltung je Abschnitt) umgestellt; Public-Modus: Erklär-Pflicht pro Messwert, TOP-KANDIDATEN-Begründungspflicht. API unverändert. (2) ko-ai Worker v1.9: erstmals versioniert in `workers/ko-ai.js` (SPOF §7 behoben); `max_tokens` morning 2000→3000, deep_dive 800→2500, eic 1200→2000 (Abbrüche durch Coaching-Ton v2.6 behoben). (3) help.html auf v451/Aggregator v5.28 aktualisiert: neue Sektion „Aktuelle Indikatoren v5.9–v5.28" (RS-Rank, DD, AVWAP, OB, TVA, IV-Rank, Earnings, DCE, DE-Modus, Coaching-KI, Modularisierung). (4) Backlog #26 TVA Sprint A als ✅ ERLEDIGT markiert. (5) Backlog #19 Prio-4-Restfunde vollständig bereinigt (v452): ki-dropdown-wrap 3 tote getElementById-Aufrufe, overheat-text/sektor-overheat-content OR-Fallback vereinfacht. (6) **Architektur-Entscheidung Journal-Modul**: #28 aus UIQ-Backlog herausgelöst → Refundex. DSS §0-Filtertest: Journal ist Positions-Bewirtschaftung, nicht Entscheidungs-Tool; Flex-Query-Anbindung macht es in Refundex wertvoller (P&L automatisch statt manuell). Frontend v452, ko-prompts v2.6.0 @610192d. |
| 3.6 | 07.08.2026 | §7 Backlog-Punkt №29
| 3.7 | 07.08.2026 | §7 Backlog-Punkt №30
| 3.8 | 07.08.2026 | `docs/VALIDIERUNG_META_SIGNAL.md`
| 3.9 | 07.08.2026 | §7 Backlog №31
| 4.0 | 07.08.2026 | Externe SWOT-Analyse
| 4.1 | 07.08.2026 | Backtest 2007–2026 ausgeführt: Go-Kriterium 2 ✅ ERFÜLLT (Sharpe 1,66 vs 0,63, MaxDD -23% vs -55%, Gate schützt 4/5 Krisen) | (Claude Mythos Preview) → `docs/SWOT_2026_08_07.md` v1.0; 6 Go/No-Go-Kriterien definiert; 7 Pareto-Empfehlungen; Backlog №32–36 ergänzt |: IBKR CP API — Fundamentals, Options-Chains, Earnings-Kalender, globale Indizes; Hybrid-Strategie Option C; Abgrenzung Flex Web Service vs. CP API | v1.0 erstellt: 4 Validierungsebenen (Vector-Returns, Makro-Lead-Time, Brier-Score, HMM-A/B), Entscheidungsmatrix, Zeitplan bis Feb. 2027; №29-Verweis ergänzt (regimeContext in tr:snap) | ergänzt: Makro-Regime-Trendanalyse + Meta-Signal-Architektur (5 Dimensionen: Makro/Mikro/Vektor/Breite/Universum → Meta-Signal als HMM-Input-Vektor) | ergänzt: MSE Regime-History-Flag (Übergangsvektor RECOVERING/DETERIORATING/STABLE aus mse_history) + NEUTRAL als 5. Regime — Konzeptanalyse, Datenbasis bereits vorhanden (mse_history KV), Implementierung Track-Record-getriggert (~01.10.2026). |
| 3.4 | 03.08.2026 | **Session 03.08.2026 — TVA Sprint A + DSS-Leitprinzip.** **(1)** TVA Sprint A abgeschlossen (Aggregator v5.25.0, Run #183 ✅, 711/711 Ticker): `calc_std_trend_score()` → `trendScore` (−100..+100, EMA-Stack×ADX-Konviktion); `calc_confluence_score()` → `confluenceScore` (0–100, 5 Faktoren: Trend/Momentum/Volumen/AVWAP/OB); Sigmoid in `score_short_breakdown()` (`sellProbability`, TVA f_sellProbability); AVWAP-Gate 9 in `score_long_minervini()` (`distToAvwapPct` als Support-Distanz, +15 Punkte in AVWAP-Zone). **(2) DSS-Leitprinzip als §0 in SUITE.md verankert** (verbindlich, schlägt alle anderen Abschnitte): UIQ ist ein diagnostisches Entscheidungssystem — Ob → Wie → Was (Reihenfolge ist Architektur, nicht Konvention). Filtertest für jede neue Idee: Hilft es zu entscheiden ob/wie/was gehandelt werden soll? Wenn nein: kommt nicht ins Produkt. UIQ-Erfolgsmaßstab explizit als Schutz-Versprechen, nicht Rendite-Versprechen. **(3) ML_KONZEPT.md v1.0** angelegt (`ahsub/UIQ-Suite/docs/ML_KONZEPT.md`): BN/HMM/NN als Signal-Kalibrierung im DSS-Framework, 3-Phasen-Plan (BN-Analyse Sept. 2026, MCM-HMM Okt. 2026, NN frühestens Q1 2027), Datenbasis-Constraints, Ausschlussliste. TVA_MATHLIB_ANALYSE.md um ML-Konzept-Abschnitt erweitert. Kernbotschaft: UIQ wird nicht besser durch mehr Metriken — Ziel ist Reduktion auf unabhängige Signale bei steigender Entscheidungsqualität. |
| 3.3 | 02.08.2026 | **Session 02.08.2026 — IOS-Konzept-Integration + Order Blocks + DE-Modus.** Aggregator v5.24.0, Frontend v408. **(1)** RS-Rank Score (`compute_rs_rank_score()`, v5.21.0): 6 Bedingungen analog IOS Institutional Momentum Engine, Dual-Benchmark SPY+IWM, 703/711 Ticker live. Frontend: Badge + DeepDive rs001–rs006. **(2)** Distribution Days (`compute_distribution_days()`, v5.21.0): O'Neil/IBD 25T-Lookback, SPY 7 / QQQ 9 DD = DANGER (02.08.2026), Tearsheet-Warnblock. **(3)** Anchored VWAP (`compute_anchored_vwap()`, v5.22.0): EWMA nach Zeiierman, Anker = 52W-Tief, α=1−e^(−ln(2)/20), ETF/Krypto-gefiltert (v5.23.0). Frontend: Badge ⚡🔥⚓⚠ + DeepDive-Block + KI-Prompt. **(4)** Minervini Sigmoid (v5.23.0): TVA MathLibrary `f_buyProbability`-Konzept, `s=100/(1+e^(−0.06×(raw−50)))`. **(5)** Order Block Detector (`compute_orderblocks()`, v5.24.0): Hybrid Zeiierman+BigBeluga+Flux, 17 KV-Felder, 507/711 Ticker live, 12 CSP-Confluence-Kandidaten (AVWAP+OB). **(6)** DE-Modus: TG-Delta-Badge `🇩🇪 TG +1.23%` (grün/rot), TRADEGATE_MAP +25 Einträge (IWV Top-100 ~96% abgedeckt). **(7) TVA MathLibrary Sprint A vorgemerkt** (Backlog №26, s.u.): `f_stdTrendScore`, `f_marketRegime`, `f_chopIndex`, `f_sellProbability` — Referenzdokument in `docs/TVA_MATHLIB_ANALYSE.md`, Python-Port-Snippets vorhanden. Sofort umsetzbar sobald Zeit. |

