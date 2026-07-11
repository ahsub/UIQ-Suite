# Investment-Suite — Dachdokument

**Version:** 1.1
**Stand:** 03.07.2026
**Ablage:** `ahsub/UIQ-Suite/SUITE.md` (Single Source; Kopie in ko-aggregator/docs ist Verweis-Stub)
**Geltung:** Verbindlich für alle Suite-Module. Bei Widerspruch zwischen diesem Dokument und einer Modul-STRATEGIE gilt: Grundgesetze und Konsistenz-Standards aus SUITE.md schlagen Modul-Regeln; fachliche Modul-Spezifika bleiben Sache der Module.
**Fortschreibung:** Claude, versioniert, analog den Modul-Strategiedokumenten.

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
14. **Echtes RS-Rating für score_long_minervini() — HOCH PRIORISIERT** *(11.07.2026, aus Minervini-Pareto-Check)* — Vollständiger Kriterien-Abgleich gegen das klassische Minervini-Trend-Template (8 Punkte) ergab mehrere Lücken. Drei günstige davon wurden noch am 11.07. behoben (SMA150 in Trend-Kette, 200-Tage-MA-Steigung über ~1 Monat, 52-Wochen-Tief-Abstand ≥30% — `score_long_minervini()` v3, `market_aggregator.py`). **Die vierte, wertvollste Lücke bleibt offen:** ein echtes RS-Rating (Relative-Strength-Perzentil-Ranking ggü. dem gesamten Scan-Universum von ~678 Tickern), das in der Minervini-Literatur oft als das wichtigste Einzelkriterium gilt — aktuell nutzt UIQ stattdessen `pBull2Bear` (Markov-Regime-Wahrscheinlichkeit), was ein Makro-Signal ist, keine Peer-relative Einzeltitel-Kennzahl. **Warum nicht sofort mitgebaut:** strukturell aufwendiger als die drei anderen Ergänzungen — braucht einen zweistufigen Ansatz (1. Rohwert pro Ticker berechnen, z.B. gewichtete 12-Monats-Performance nach IBD-Konvention; 2. erst NACH dem vollständigen Scan-Durchlauf aller Ticker ein Perzentil-Ranking bilden), nicht nur Per-Ticker-Logik wie die bisherigen Scoring-Funktionen. **Auf ausdrücklichen Wunsch von Axel (11.07.2026) hoch priorisiert** — nächster großer Schritt für die Minervini/SEPA-Scan-Qualität, sollte vor anderen offenen Backlog-Punkten dieser Kategorie behandelt werden. Kein Bau heute, aber bewusst NICHT als "irgendwann" eingestuft.
15. **IV-Rank/Percentile pro Einzeltitel — Nischen-Differenzierer Optionsanalyse** *(11.07.2026, aus Deepvue/Trendspider-Konkurrenzanalyse nach der Präsentation)* — **Herkunft der Erkenntnis:** Browser-Recherche deepvue.com + trendspider.com plus Deepvues eigene Vergleichstabelle (HTML-Upload, "How Deepvue Compares 2026" gegen TradingView/MarketSurge/TC2000/Finviz/TrendSpider). Zwei belegte Kernfunde: (1) **Deepvue hat null Optionsanalyse** — in der gesamten eigenen Vergleichstabelle steht bei "Options analytics" ein "—" für Deepvue, während TradingView ✓ und Finviz "Best-in-class" haben; (2) Deepvue ist aktuell 100% US-Aktien (Crypto/Forex/Futures/Int'l alle nur "on roadmap"), keiner der fünf verglichenen Player unterstützt europäische KO-Zertifikate. **Konsequenz:** Die Kombination *Optionsstrategie-Timing + IBD/Minervini-Ratings + KO-Zertifikate in einem Tool* ist eine echte, unbesetzte Marktlücke — kein "kleiner aber ehrlicher"-Trostpreis. **Konkretes Feature:** IV-Rank und IV-Percentile pro Ticker (aktuelle implizite Volatilität relativ zur eigenen 252-Tage-IV-Historie) — die wichtigste Einzelkennzahl für Wheel/CSP/CC-Einstiegstiming ("Prämie verkaufen wenn IV-Rank hoch"). Genau der Kernnutzen von UIQs Options-Strategien, den der direkteste Konkurrent (Deepvue) komplett nicht bedient. **Vorarbeit existiert bereits:** Axels lokaler Options-Screener v3.4 hat eine IV-Rank-Berechnung (inkl. behobenem Off-by-one-Fehler im historischen Fenster, Mai/Juni 2026) — Methodik-Wissen vorhanden, aber an IBKR-Live-Daten via lokalem Flask-Proxy gebunden, nicht im nächtlichen Aggregator-Pipeline. **Datenquellen-Frage (offen, entscheidend):** (a) IBKR/CapTrader-Optionsketten — knüpft direkt an Inverse-Problem-Register №8 + GEX-SCHEMA.md §6 Prio 1b an, Axel hat Zugang, aber Automatisierung im GitHub-Actions-Kontext ungeklärt (Gateway/Auth); (b) yfinance-Optionsketten (kostenlos, aber IV-Qualität/Zuverlässigkeit für 252-Tage-Historie ungeprüft); (c) kostenpflichtige Alternativen erst nach Monetarisierung. **Priorität: direkt NACH RS-Rating (№14)** — beide zusammen bilden die konzentrierte Nischenstrategie aus der Konkurrenzanalyse: №14 schließt die Rating-Lücke zu Deepvue/MarketSurge, №15 baut den Vorsprung dort aus, wo Deepvue strukturell nichts hat. Kein Bau vor Datenquellen-Klärung.

---

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
| 1.3 | 08.07.2026 | Backlog-Punkte №7 (Options-Radar/Doktor — Flex-Query als Live-Risiko-Kanal, PO-Entparkungs-Kern-Feature, Suite-Kohärenz UIQ↔PO↔Refundex) und №8 (Inverse-Problem-Register — offenes Sammelregister für Flex-Query-basierte Fragen, die wir noch nicht gestellt haben) ergänzt. Beide 08.07.2026 nach Nachgespräch zum UX-Review. Kein Bau, reine Verankerung. |
