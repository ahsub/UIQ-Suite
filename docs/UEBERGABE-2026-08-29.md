# UEBERGABE-2026-08-29.md

Fortsetzung von `UEBERGABE-2026-08-28.md`. Heute: kompletter Tag im Zeichen
der Fortsetzung des Legal-Briefing-Audits — fünf externe Review-Zyklen am
CSP(ATM/NA)-Output, daraus destilliert eine konsolidierte
`UIQ-REGULATORY-LANGUAGE-SPEC.md`, ein kritischer Live-Bug (HVP/IVR-Label-
Kollision) samt neuem Audit-Werkzeug, ein strukturelles Coaching-Upgrade
für alle Options-Strategien, und drei weitere Live-Test-Zyklen (CSP/Wheel,
Covered Call ×2, Collar/Protective Put). Kein Rewrite des Gesamtsystems —
durchgängig additive, versionierte Einzelschritte.

---

## 1. Ausgangslage

Gestern (№65) wurde der wichtigste strukturelle Fund gemacht: ein
clientseitig eingebetteter EIC-Instruktionsblock lief unabhängig vom
serverseitigen isOwner-Gate. Heute ging es darum, die verbliebene, damals
offen gelassene Frage zu klären: verlangen die 14 Strategie-Templates in
`ko-prompts.js` selbst — unabhängig vom System-Prompt-Fix — noch konkrete
Handlungsparameter? Antwort: ja, bei allen 14, nicht nur den 6 zuvor
gesichteten.

---

## 2. Fünf Review-Zyklen CSP(ATM/NA) — `ko-prompts.js` v2.6.0 → v2.9.0

Ein durchgängiger Kreislauf: Public-Output generieren → extern reviewen →
Fund beheben → erneut generieren → nächster Review. Kernstationen:

- **v2.6.0:** 14-Template-Public/EIC-Split fertiggestellt (`ctx.isEic`-Weiche,
  zwei geteilte Builder `_publicEquityPrompt`/`_publicOptionsPrompt`) — drei
  Zusatzfunde dabei behoben (hart verdrahtetes `expert_mode:true` für
  `atmna`, `runValueKiBriefing()` rief eine nicht-existente Action auf und
  lief dadurch permanent über einen ungeschützten Direkt-API-Fallback,
  `value`-Template serialisierte `ctx.tickers` nie).
- **v2.6.1:** Ein unaufgefordertes "Fazit" mit Ranking-Charakter am Ende
  jeder Antwort verboten.
- **v2.7.0/v2.8.0:** Sechs lexikalische Einzelfunde (u.a. "optimal",
  "Prämienerwartung", Andienungs-Kausalsprünge) mit wörtlichen
  Pflicht-Ersatzformulierungen behoben.
- **v2.9.0:** Neue Kategorien **Begriffs-Integrität** und
  **Kausalitäts-Integrität** — ausgelöst durch einen Reviewer-Fund (RSI 77
  fälschlich "überverkauft" genannt, HVP mit "IV-Percentile" verwechselt).
  Codeprüfung ergab: die HVP-Definition selbst
  (`calc_hv_percentile()`) ist sauber — der eigentliche Bug lag in
  `axel-scanner/index.html::runOptionsKiBriefing()`, wo das Label-Präfix
  `"IVR:"` auch im HVP-Fallback-Zweig fest verdrahtet war und dadurch
  wörtlich "IVR:HVP96%" in den Prompt schrieb. Ein zweiter, unabhängiger
  Fundort derselben Logik (`runBestOptionsOpportunityKI()`) wurde erst durch
  gezielte Nachsuche gefunden — nicht durch den ersten Fix.

**Zwischenfall:** Ein Commit (`ko-modules@3fbf685`) enthielt versehentlich
den Text einer `.diff`-Datei statt validem JavaScript — vermutlich Diff
statt Volltext ins GitHub-Web-UI eingefügt. Legte alle KI-Strategie-Buttons
lahm (Syntaxfehler beim Laden). Behoben durch Wiederherstellung der letzten
bekannt guten Volltextdatei. Seitdem: bei jeder Übergabe **immer** Diff UND
Volltext getrennt liefern, Volltext ist die Commit-Quelle.

---

## 3. `docs/UIQ-REGULATORY-LANGUAGE-SPEC.md` v1.0 → v1.1

Auf Axels und des Reviewers Vorschlag: statt weiterer Einzelfall-Reviews ein
konsolidiertes, modulübergreifendes Regelwerk. Struktur: §1 Universalprinzipien
(inkl. neu Begriffs-/Kausalitäts-Integrität), §2/§3 Verbotsliste +
Pflicht-Ersatzformulierungen, §4 Datenhoheit (was UIQ nie bestimmt), §5
Pflicht-Abschlussformulierung, §6 Modul-Rollout-Status, §7 Spec-vor-Code-
Prinzip, §8 Herkunft der vier Zyklen, §9 offene Punkte. v1.1 ergänzt einen
**adversarialen Belastungstest** (§10) gegen 12 vom Reviewer benannte
Grenzfälle — Ergebnis: Multi-Kandidaten-Kontexte halten gut stand,
Restrisiko konzentriert sich auf Einzeltitel-Kontexte ohne Vergleichsrahmen
(v.a. Deep Dive bei nutzerinitiierter Ticker-Wahl, höchstes Risiko im
System) — plus §11 priorisierte 8-Punkte-Maßnahmenliste.

Diese Spec ist jetzt in `SUITE.md` §3.8 ("Public Safety Boundary") und
Grundgesetz #11 (Analyse/Execution-Trennung, UIQ/Broker-Funktionsmatrix)
verankert (v4.23→v4.25) — inkl. Public-safe Ersatzformulierung für die
interne "OB/WIE/WAS"-Sprache und einer Vorsichtsregel für
"wissenschaftlich validiert"-Sprache.

---

## 4. Audit-Werkzeug — `uiq-devtools/ki-prompt-audit/`

Neues AST-basiertes (acorn) Analyse-Skript, Geschwister zu
`backlog-19-analyse/`: (1) katalogisiert alle 18 KI-Prompt-Aufrufstellen in
`index.html`/`ko-modules`, (2) findet das Doppel-Label-Fallback-Muster
mechanisch. Vor Produktiveinsatz verifiziert: synthetischer True-Positive-
Test (nach einem eigenen Implementierungsfehler bei verschachtelten
`+`-Ketten behoben), Regressionstest gegen den echten, bereits gefixten
Code (0 Funde), und dabei einen Extraktions-Bug in der wiederverwendeten
`extractInlineScripts()`-Funktion gefunden+behoben (HTML-Kommentare mit
script-ähnlichem Prosatext verschluckten ganze Codeblöcke — Fix auch in
`backlog-19-analyse/analyze.js` nachgezogen, da dieselbe Funktion).

---

## 5. Deep Dive — Sprachregeln vor jedem Rollout (Spec §11 Punkt 1+2+7)

Größerer Fund in `generateDeepDiveKI()`: direktive Handlungshinweise
("keine aggressiven CSPs", "Momentum-Strategien bevorzugen") steckten in
den Messwert-Zeilen, die **vor** der Public/Expert-Weiche gebaut wurden —
liefen dadurch unabhängig vom Modus in beide Prompts. Neutralisiert für
beide, direktive Fassung in einen sauber `isExpert`-gated EIC-Zusatzblock
verschoben. Universums-Bezugspflicht ergänzt (Public-Antwort referenziert
jetzt `window._alphaData.tickers.length`) plus explizite Anweisung, nicht
auf die erkennbare Nutzer-Ticker-Wahl einzugehen. Leitunterscheidung
("Strategy Fit ≠ Gewinnwahrscheinlichkeit ≠ Anlageempfehlung") jetzt an
drei UI-Stellen sichtbar, nicht nur im internen Dokument
(`index.html` v485). **Noch nicht live mit echtem Output getestet.**

---

## 6. Morning Briefing — Review-Zyklus-1-Nachzug + größerer Nebenfund

Drei zwei Tage alte, nie umgesetzte Punkte behoben (`ko-prompts.js`
v2.11.0, `ko-market-state.js` v2.6/v2.7): CSP-Weekly-Contango-Regel um
VIX-Perzentil-Schwelle ergänzt, explizite Regime-vs-Distribution-Spannungs-
Pflicht, "Gesamteinschätzung"-Zeile umformuliert.

**Größerer Nebenfund:** Die Strategie-Ampel-Texte (`ko-market-state.js`
Gate-Objekt) sind **statische, direkt im UI gerenderte Strings** — kein
KI-Text, keine der heutigen Guardrails greift dort. Systematisch
ausgewertet: 42 von 65 Texten enthalten mindestens ein Risiko-Muster. Nur
die 4 eindeutigsten (2× "optimal", 2× konkrete Delta-Schwellen Δ<0.25/0.15)
wurden heute gefixt. **~38 verbleibende Treffer** (GESPERRT/NICHT
EMPFOHLEN/PRIORITÄT-N/direktive Verben ohne Zahl) sind eine offene
Grundsatzfrage — s. Plan für morgen.

---

## 7. Drei Live-Test-Zyklen — CSP/Wheel, Covered Call (×2), Collar

Nach der Spec kam die Feuerprobe: dieselben Regeln gegen drei weitere,
bisher ungetestete Strategien laufen lassen.

**CSP/Wheel (`ko-prompts.js` v2.10.0):** Zwei bereits **wortwörtlich
verbotene** Begriffe ("attraktiv", "Prämienerwartung") erschienen trotzdem
— Beweis, dass Wortverbote allein keine 100%ige Zuverlässigkeit haben, auch
bei exakter Übereinstimmung. Reaktion: allgemeine Regel statt nur
Wortliste ("keine Handlungsschwelle jeglicher Art, unabhängig von der
Formulierung") **plus** dritte, deterministische Ebene — Compliance-Scanner
in `ko-ai.js` (v1.12), der Public-Antworten nach der Generierung mechanisch
gegen bekannte Verstoßmuster scannt. Bewusst **nicht blockierend** — nur
Logging über den bestehenden `/logs`-Mechanismus (`?flagged=1`), da
Blockieren ohne Fallback-Plan ein neues Risiko in einem aktiv genutzten
Produkt wäre.

**Covered Call, erster Test (v2.11.0→v2.12.0):** Neue Fehlerklasse ohne
Einzelwort-Verstoß — "Modell favorisiert aggressivere Strike-Wahl" und
"günstiges Prämien-Umfeld" sind indirekte Optionsentscheidungen bzw.
ökonomische Tatsachenbehauptungen. Reviewer-Kernidee: **Trade-off-Prinzip**
statt Präferenz-Sprache — bei Strike-/Laufzeit-Aussagen immer beide Seiten
neutral gegenüberstellen, nie eine Richtung bevorzugen.

**Covered Call, zweiter Test (v2.13.0):** Reviewer schlägt vor, die
gewonnene regulatorische Distanz für **besseres Coaching statt weiterer
Entschärfung** zu nutzen — ein 8-teiliges Zielmuster (Market Context →
Strategy Fit → Positive Factors → Risk Factors → Strategic Trade-offs →
Model Boundary → External Validation → Summary). Umgesetzt: Trade-off
("Strategischer Zielkonflikt:") und Modell-Grenze ("Modell-Grenze:") sind
jetzt **verpflichtend gelabelte Unterpunkte** je Kandidat, nicht mehr freie
Prosa — das war die Fehlerquelle für "maximiert" (Superlativ in freier
Formulierung) und "beide Richtungen sind haltbar" (freie Paraphrase statt
Pflichtsatz). Zusätzlich: CC-spezifische Begriffs-Integrität (Assignment
bei Kursanstieg ≠ Andienung bei Kursverfall — entgegengesetzte Konzepte,
neuer Parameter `o.risikoBegriff`/`o.risikenText`), Upside-Cap-Zielkonflikt
als explizit zu erklärender Kernpunkt verankert.

**Collar/Protective Put (v2.14.0, letzter Test des Tages):** Struktur
(Punkte c/d) funktioniert bereits sehr gut — vom Reviewer explizit als
"echter Durchbruch" bestätigt, keine Änderung nötig. Drei neue Funde:
(1) **wichtigster Fund des ganzen Tages** — "HVP 96% zeigt
Volatilitätskompression" ist **faktisch falsch** (Bedeutungsumkehr: ein
hoher HVP-Wert bedeutet HOHE, nicht komprimierte Volatilität) und erschien
konsistent in mehreren Strategien heute, obwohl nirgends im Prompt-Text so
vorgegeben — reines, wiederkehrendes LLM-Fehlkonzept; (2) Beobachtung-vs-
Einordnung-Pflicht bei Extremwerten (ein Extremwert darf nicht direkt zu
einer einseitigen strategischen Interpretation führen); (3) zwei weitere
ökonomische Tatsachenbehauptungen ("prämieneffizient", "strukturell
unnötig"). Alle drei auch im Compliance-Scanner ergänzt (`ko-ai.js` v1.14).

---

## 8. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Commit |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.14.0 | *ausstehend, s. Anhang dieser Übergabe* |
| `ko-modules/ko-market-state.js` | 2.7 | `4e2b895` |
| `ko-aggregator/workers/ko-ai.js` | 1.14 | *ausstehend* |
| `axel-scanner/index.html` | v485 | *CDN-Pins nach v2.14.0-Commit nachzuziehen* |
| `UIQ-Suite/SUITE.md` | 4.25 | committed |
| `UIQ-Suite/docs/UIQ-REGULATORY-LANGUAGE-SPEC.md` | 1.1 | committed |
| `uiq-devtools/` | — | committed (`ki-prompt-audit/` neu) |

---

## 9. Plan für morgen

**Priorität 1 — "UIQ Options Coaching Standard" vereinheitlichen (Reviewer-
Vorschlag, Spec-Punkt 7 aus dem Collar-Review).** CSP/Wheel und ATM/NA
wurden vor dem a-d-Struktur-Upgrade (v2.13.0) getestet — nicht bekannt, ob
sie mit der aktuellen Struktur sauber laufen. Systematisch alle 5
Options-Strategien (csp_wheel, atmna, weekly_income, cc, collar) gegen
denselben aktuellen Stand (v2.14.0) nochmal laufen lassen, bevor wir sie
als stabil betrachten — nicht nur die zuletzt geänderten.

**Priorität 2 — Die ~38 verbleibenden Strategie-Ampel-Texte in
`ko-market-state.js`.** Grundsatzfrage noch offen: sind GESPERRT/NICHT
EMPFOHLEN/PRIORITÄT-N strukturell das validierte Ampel+Begründung-Muster
(vertretbar) oder zu direktiv? Braucht eine Entscheidung, dann ggf. Fix in
einem Rutsch (statische Daten, kein iterativer Live-Test nötig).

**Priorität 3 — Deep Dive live testen.** Sprachregeln stehen (Punkt 5),
aber noch nie mit echtem Output verifiziert — das higheres-Risiko-Modul
laut Belastungstest 10.12.

**Priorität 4 — `weekly_income` und `collar`s `risikoBegriff`.**
`weekly_income` nutzt noch den generischen `csp_wheel`-artigen Prompt-Stil,
nicht extra live getestet. `collar` kombiniert eigentlich beide
Risikorichtungen (Put- und Call-Seite) — der cc-artige `risikoBegriff`-
Ansatz wurde dafür nicht geprüft.

**Priorität 5 — Master Shortlist.** Kompletter blinder Fleck: wird über
`market_aggregator.py` (Python, nächtlicher Batch) erzeugt, nicht über
`ko-ai.js` — der heutige Compliance-Scanner deckt das nicht ab. Braucht ein
eigenes, Python-seitiges Äquivalent oder eine architektonische Entscheidung.

**Laufend:** `/logs?flagged=1` in den nächsten Tagen beobachten — erste
echte Messdaten, wie oft die Guardrail trotz allem durchbrochen wird,
statt nur Zufallsfunde aus Live-Tests.

**Danach:** Legal Briefing an den Fachanwalt vorbereiten (Backlog №36),
sobald die Options-Strategien einheitlich stabil sind — die Spec (`v1.1`)
plus die fünf Review-Zyklen sind die Grundlage dafür.
