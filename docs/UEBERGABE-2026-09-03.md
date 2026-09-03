# UEBERGABE-2026-09-03.md

Fortsetzung von `UEBERGABE-2026-09-02.md`. Heute: die zwei kleinen
Guardrail-Fixes aus dem 02.09.-Plan abgeschlossen, dann der große
9-Punkte-Prompt-Architektur-Sprint gestartet und über mehrere
Live-Test-Zyklen für alle 5 Options-Strategien plus die erste
Equity-Strategie (KO) durchgeführt. Am Ende des Tages ein wichtiger,
unabhängiger Sicherheitsfund: eine zweite, bislang ungehärtete
Prompt-Familie (`_getSystemPrompt()`), die mindestens 6 "Quick-Take"-
Features speist und laut Axel auch für Beta-/Public-User zugänglich
ist — heute geschlossen.

---

## 1. Zwei kleine Guardrail-Fixes aus dem 02.09.-Plan (v2.19.0-Basis)

- **"Andienungswahrscheinlichkeit"**: neue Regel gegen RSI→Assignment-
  Wahrscheinlichkeit-Kurzschluss, Kausal-Konditional-Pflichtformat.
- **"maximiert"/"optimiert"**: konkretes NIEMALS/STATTDESSEN-Beispielpaar
  an beiden Stellen (holding_review + scan) ergänzt — Wortverbot
  existierte bereits seit 29.08., wurde aber live ignoriert (gleiches
  Muster wie attraktiv/Prämienerwartung).
- Scanner-Nachzug in `ko-ai.js`: zwei neue `COMPLIANCE_PATTERNS`.

---

## 2. 9-Punkte-Prompt-Architektur-Sprint

### 2.1 Grundsatzentscheidungen (vor dem ersten Code)

- **Ein gemeinsamer Block je Abschnitt (4-8) für alle Kandidaten**,
  NICHT pro Kandidat wiederholt (Reviewer-Referenzmodell) — hält den
  Output über alle 14 Strategien handhabbar in der Länge.
- **"Geringer Fit"/"Beobachtungsliste"** als kurzer Absatz am Ende von
  Abschnitt 3 integriert, kein eigener 10. Abschnitt (Konsistenz-
  Versprechen: "wie ein konsistentes DSS", nicht 9-oder-manchmal-10).
- Neue gemeinsame Funktion `_publicNinePointPrompt()` ersetzt
  schrittweise `_publicOptionsPrompt()` und `_publicEquityPrompt()`
  (beide bleiben vorerst als Fallback für noch nicht migrierte
  Equity-Strategien bestehen).
- Struktur: 1. Markt-/Regime-Kontext (neu, generisch) → 2. Strategy Fit
  (bisheriges "MARKTUMFELD" hierher verschoben) → 3. Kandidaten (inkl.
  Ausschluss-Absatz) → 4. Positive Modellfaktoren → 5. Gegenargumente/
  Risiken → 6. Strategischer Trade-off → 7. Was UIQ ableiten kann (NEU)
  → 8. Modell-Grenze → 9. Entscheidungsrahmen.

### 2.2 Migrationsreihenfolge und Live-Test-Ergebnisse

**csp_wheel** (v2.19.0 → v2.19.3, vier Testläufe): erste Migration,
mehrere Wiederholungsfunde trotz Wortverbots — "keine strukturellen
Hemmnisse", "ATM-orientiert", Synonym-Umgehungen ("verdichtet" statt
"komprimiert", "gehemmt" statt "Hemmnisse"), "Modell bevorzugt"
außerhalb des bekannten Strike-Kontexts, "Strike-Annäherung" aus
D200 (dritter Beleg). Jeweils mit Proximity-Fix (direkt im
Abschnitt-Template) + Scanner-Nachzug behoben. **Eigener Fehler
gefunden und korrigiert:** Überschrift "HÖCHSTE...STRATEGY-FITS" +
"Reihenfolge ohne Wertung" im selben Satz war ein Widerspruch (scan-
Zweig hat eine echte Rangfolge, holding_review nicht) — aufgelöst
durch Attribution ("Rangfolge gemäß UIQ-Kriterien-Score") statt
Verschleierung, nur im scan-Zweig.

**atmna** (v2.19.4-v2.19.6, zwei Testläufe): "attraktiv" proaktiv aus
`marktumfeldFrage` entfernt (noch vor dem ersten Live-Test gefunden).
ATM-Verbot greift korrekt nicht (stratName-Kopplung funktioniert).
Zweiter Testlauf bestätigt alle drei vorherigen Fixes stabil — erste
erfolgreiche Regressionsprüfung der Meta-Regel-Strategie.

**weekly_income** (v2.19.7-v2.20.2, ein Testlauf + Terminologie-Klärung):
sehr sauberer erster Lauf. Wichtige Bestätigung: die 01.09.-Model-
Boundary/External-Validation-Vertauschung tritt im neuen Schema nicht
wieder auf. Eigener Fehler gefunden: die "Kein direkter Strike-Bezug"-
Regel widersprach sich selbst (verbot "Strike" auch gehedgt, das
eigene STATTDESSEN-Beispiel nutzte aber genau diese Form) — klargestellt:
verboten ist die Kausalbehauptung, Pflicht ist der explizite
Kenntnis-Vorbehalt. Axel legte danach das Quellbuch vor (T.R. Lawrence,
"Options Trading — How to Turn Every Friday Into Payday"): Mechanik
exakt bestätigt, aber "Diagonal-Put-Spread" als Bezeichnung durch
explizite Quellenangabe ersetzt (das Buch definiert diesen Fachbegriff
selbst mit umgekehrter Strike-Richtung in einem späteren Kapitel —
wäre für options-kundige Leser irreführend gewesen).

**cc** (v2.21.0-v2.21.3, ein Testlauf): migriert inkl. `risikoBegriff`/
`risikenText`-Anpassungen (Ausübung/Assignment statt Andienung, bereits
vor Migration korrekt). Axel ergänzte danach detaillierte Praxis-
Auswahlkriterien (Dividendenqualität, Blue-Chip-Stabilität, IV-basierte
Prämienqualität, Strike-Delta-Trade-off) — zwei Kollisionen mit
bestehender Architektur gefunden und aufgelöst: (1) keine Marktkapital-
isierungs-Daten im Aggregator vorhanden → Grade/D200 als Näherung,
echte Marktkap als Broker-Check gekennzeichnet; (2) "IV"/"IV-Perzentil-
Rang" kollidiert mit der bestehenden HVP≠IV-Regel (UIQ hat keine
Live-Optionsketten-IV) → HVP als tatsächlich verfügbarer Proxy.
Exakte Delta-Zahlen bewusst nicht in den Public-Prompt übernommen
(Public/EIC-Trennung). Reviewer-Review danach: wichtigster Punkt war
die Klarstellung "CC-Strategy-Fit ist keine Kaufempfehlung für die
Aktie" — als principle-Satz ergänzt, bewusst NICHT durch Umstellung
auf `mode:'holding_review'` gelöst (hätte die 30.08.-Entscheidung
revidiert, CC nicht in den Collar-Absicherungsmodus zu verschieben).
Dividenden-Kriterium nachträglich entschärft (war fälschlich als
Voraussetzung formuliert, macht aus CC keine Dividendenstrategie).

**collar** (v2.21.0, ein Testlauf laut Axel "sieht gut aus"): einzige
Strategie im `holding_review`-Modus, erster Test dieses Zweigs im
neuen Schema — keine gemeldeten Probleme.

**ko** (v2.22.0-v2.22.1, erste Equity-Strategie, noch nicht live
getestet im 9-Punkte-Schema selbst — der gemeldete Output stammte aus
einer anderen Funktion, s. §3): migriert mit `istOptionsStrategie:
false`. Axel lieferte Marktzugangs-Charakteristik (US-Emissions-
beschränkung seit 2017, DE/EU-Marktfokus, Open-End-Präferenz,
Trend-vs-Seitwärts-Regime-Eignung) — übernommen, aber bewusst OHNE
die genannten Einzeltitel/Sektoren (SAP/ASML/Infineon, Rheinmetall/
Renk/Siemens Energy, Nvidia/Tesla/Alphabet): zeitlich instabil und
regulatorisch näher an einer Empfehlung konkreter Wertpapiere als an
einer Sektor-Charakteristik. Sicherheitshinweis ergänzt (Axel:
"verantwortungsvolle Coaches"): Totalverlust-Charakteristik von
KO-Ereignissen + generelle Stop-Loss-Empfehlung OHNE konkreten Wert
(sauber von Grundgesetz #11 abgegrenzt) — dabei eine Architektur-
Lücke behoben: `risikenText` war bisher nur für Options-Strategien
verdrahtet, jetzt auch für Equity/Zertifikate nutzbar.

**Noch offen:** 8 Equity-Strategien (momentum, breakout, vcp, swing,
meanrev, dividend, value, fading_short) — unverändert auf
`_publicEquityPrompt()`.

### 2.3 Nachtrag: `ko` tatsächlich live getestet (v2.22.4)

Nach Klärung des §3-Verwechslungsfundes (falscher Code-Pfad) lieferte
Axel den echten `ko`-9-Punkte-Output über den richtigen Weg
("KI-Briefing" → KO-Trading). Reviewer-Urteil: Struktur trägt auch bei
einer dritten, strukturell andersartigen Strategie-Klasse (Richtungs-/
Hebel-Trend statt Prämien- oder Bestandspositions-Logik). Fünf
Guardrails ergänzt:

- **KO-1 (wichtigster Fund): Underlying ≠ Produkt** — UIQ bewertet den
  Basiswert, nicht ein konkretes KO-Zertifikat (Barriere/Hebel/Spread/
  Finanzierungskosten/Emittent/Liquidität unbekannt). Dafür neuer
  generischer Erweiterungspunkt `o.modellGrenzeText` in Abschnitt 8
  ergänzt (analog `risikenText` für Abschnitt 5) — jetzt für alle
  Strategien nutzbar, nicht nur KO.
- **KO-2: EMA200 ≠ KO-Abstand** — EMA200-Distanz ist ein Underlying-
  Trendindikator, nie mit dem tatsächlichen Barriere-Puffer
  gleichzusetzen; "Rückkehr-/Korrekturrisiko"-Sprache verboten.
- **KO-3: HVP ≠ Hebel/Produktvolatilität/KO-Wahrscheinlichkeit.**
- **KO-4: Score/Strategy-Fit ≠ Gewinnwahrscheinlichkeit** — klärt die
  vom Reviewer bemängelte Ungereimtheit (Top-3-Kandidat gleichzeitig
  als "weniger geeignet" markiert): kein Widerspruch, zwei getrennte
  Ebenen.
- **KO-5: Gap-/Overnight-Risiko** — Zeitzonen-Versatz DE/US als
  KO-spezifisch verschärftes Risiko.

Zusätzlich: "Open End bevorzugen" von kategorischer Regel auf
Prüfliste umformuliert (Laufzeit, Finanzierungskosten, Barriere,
Abstand, Emittentenbedingungen, Liquidität), 2.000-EUR-Limit explizit
als Totalverlust-Obergrenze geklärt (kein Stop-Loss-Mechanismus).
Funktional per Node-Smoke-Test verifiziert (alle fünf Guardrail-Marker
im generierten Prompt vorhanden). **`ko` damit inhaltlich vertieft,
aber noch nicht mit den neuen v2.22.4-Guardrails live getestet** —
das wäre der nächste sinnvolle Schritt vor der Equity-Migration.

---

## 3. Wichtiger Sicherheitsfund (unabhängig vom 9-Punkte-Sprint)

Ein von Axel gemeldeter KO-Output ("Top-15 Kandidaten", "KI-basierte
Markt-Einschätzung — undefined") stammte NICHT aus `STRATEGIES.ko.
prompt()`, sondern aus einer komplett separaten, älteren Funktion
(`runAlphaLbKI()` in `index.html`, Alpha-Desk → Master-Shortlist →
Leaderboard → KO-Long). Untersuchung ergab zwei Funde:

1. **`label`-Bug** (klein, vorbestehend, alle 14 Strategien betroffen):
   `STRATEGIES`-Einträge hatten nie ein `label`-Feld, nur `hint` —
   heute behoben (v2.22.3), Wert = `stratName` aus dem jeweiligen
   `prompt()`. Funktional verifiziert.

2. **Fehlende Guardrail-Härtung in einer zweiten Prompt-Familie**
   (deutlich wichtiger): `_getSystemPrompt()` — aufgerufen über
   `getKiSystemPrompt()` in `index.html`, speist mindestens 6
   "Quick-Take"-Features (Alpha-Desk-Leaderboard-KI, Einzeltitel-
   Deep-Dive, Beste Options-Kombination, Beste Chancen über alle
   Strategien, Dark Pool) — enthielt bislang NICHTS von der heutigen
   9-Punkte-Guardrail-Härtung, nur 5 generische Basisregeln. Axel
   bestätigte: diese Features sind "general", auch für Beta-/Public-
   User zugänglich (aktuell aber nur Axel selbst als Nutzer — kein
   akuter Schaden, aber ein struktureller Gap). Live-Beleg: der
   gemeldete KO-Output enthielt trotz bestehender "keine direkten
   Kauf-/Verkaufsempfehlungen"-Regel eine direkte Handlungsempfehlung.

   **Lösung (Axel-Entscheidung, "Option C" verfeinert):** nicht das
   volle 9-Punkte-Schema erzwingen (unpassend für kompakte Quick-Takes),
   sondern die eine gemeinsame Basisfunktion härten, die bereits alle
   6 Stellen speist. `_getSystemPrompt()` bindet jetzt bedingungslos
   `PUBLIC_REGULATORY_GUARDRAIL` + `KI_ANTI_HALLUZINATION` ein —
   unabhängig vom `eic`-Parameter (konsistent mit dem 28.08.-Sicherheits-
   Fix: Client-Flags sind nicht vertrauenswürdig, nur `ko-ai.js`
   entscheidet serverseitig wirklich über Owner-Status). Einleitungssatz
   entschärft ("ob ein Setup heute handlungswürdig ist" widersprach der
   neuen Guardrail direkt). Funktional per Node-Smoke-Test verifiziert
   (Guardrail vorhanden, identisch für `eic=true/false`).

   **Noch offen:** die serverseitige `SYSTEM_PROMPTS.ki_briefing_public()`
   in `ko-ai.js` ist ebenfalls nur 5 Regeln stark — zweite
   Verteidigungslinie, heute nicht angefasst (separates Deployment,
   kann `PUBLIC_REGULATORY_GUARDRAIL` nicht direkt importieren).

---

## 4. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `ko-modules/ko-prompts.js` | 2.22.4 | Fertig gepatcht + geliefert; **Commit + jsDelivr-Hash-Pin-Update in `index.html` noch durch Axel durchzuführen** |
| `ko-aggregator/workers/ko-ai.js` | — | Zwei neue COMPLIANCE_PATTERNS (§1), unverändert seit v2.19.3-Stand sonst; von Axel zu deployen |

**Migrationsstand 9-Punkte-Schema: 6 von 14 Strategien** (csp_wheel,
atmna, weekly_income, cc, collar, ko) — alle 5 Options-Strategien
vollständig, 1 von 9 Equity-Strategien. `ko` zusätzlich inhaltlich um
fünf Guardrails vertieft (s. §2.3), diese aber noch ungetestet.

---

## 5. Plan für morgen

**Priorität 0 — `ko` mit den fünf neuen v2.22.4-Guardrails live
testen.** Der erste echte 9-Punkte-Test lief bereits erfolgreich über
den richtigen Weg ("KI-Briefing" → KO-Trading, s. §2.3) — jetzt prüfen,
ob KO-1 bis KO-5 (Underlying≠Produkt, EMA200≠KO-Abstand, HVP≠Hebel,
Score≠Gewinnwahrscheinlichkeit, Gap-Risiko) im nächsten Lauf sauber
greifen, nach demselben Muster wie bei den Options-Strategien.

**Priorität 1 — Equity-Migration fortsetzen.**
8 verbleibende Strategien (momentum, breakout, vcp, swing, meanrev,
dividend, value, fading_short) auf `_publicNinePointPrompt()`
umstellen. Nach `ko`s Erfahrung: proaktiv auf "attraktiv" und andere
bereits bekannte Problemwörter in `marktumfeldFrage`/`rolle`/`focus`
prüfen, bevor der erste Live-Test läuft (spart eine Iterationsrunde).

**Priorität 2 — Serverseitige zweite Verteidigungslinie (`ko-ai.js`).**
`SYSTEM_PROMPTS.ki_briefing_public()` (und vermutlich `deep_dive_
public()`, `morning_public()` — noch zu prüfen) sind ebenfalls nur
minimal gehärtet. Da `ko-ai.js` `PUBLIC_REGULATORY_GUARDRAIL` nicht
direkt aus `ko-prompts.js` importieren kann (separates Deployment),
braucht das eine eigene Lösung — entweder eine kompakte, eigenständig
gepflegte Kopie der Kernregeln in `ko-ai.js`, oder ein Laufzeit-Fetch
von der jsDelivr-CDN-URL (Latenz-/Fehlerfall-Abwägung). Keine
Zeitnot laut Axel (aktuell nur er selbst als Nutzer), aber sollte vor
echtem Beta-Traffic geschlossen sein.

**Priorität 3 — `label`-Konsistenz stichprobenartig im UI prüfen.**
Der Fix ist funktional verifiziert (Node-Smoke-Test), aber noch nicht
im echten Browser gesehen — beim nächsten Alpha-Desk-Leaderboard-KI-Test
kurz bestätigen, dass der Modal-Titel jetzt für alle 14 Strategien
korrekt erscheint, nicht nur für KO.

**Nach vollständiger 14/14-Migration (nicht Teil des unmittelbaren
Plans, aber im Hinterkopf):** Reviewer-Vorschlag eines Cross-Strategy-
Reviews — alle 14 Outputs nebeneinanderlegen und prüfen, ob HVP/RSI/
D200/Strategy-Fit überall konsistent interpretiert werden, obwohl
jede Strategie ihre eigene ökonomische Logik behält.

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
- `degraded_status`-Route in `ko-sync-worker.js` (Ursache seit 02.09.
  bekannt, KV-Key/Struktur noch zu klären).
- Finnhub/TwelveData serverseitig (Cloudflare-Worker-Secrets statt
  Client-seitigem Key) — v2.0/Commercial-Launch-Backlog.
- Kanonische Metriken-Pipeline (v2.0/Phase 3).
- Repo-Privatstellung (`ko-modules` erst nach Auslieferungs-Umbau).
- VIX/VVIX/SKEW Client/Server-Aufspaltung, CC-Wheel-Kontext-Flag,
  EIC-Schritt-7, ~38 verbleibende Ampel-Texte, `my-cors-proxy`
  versionieren, Legal-Briefing-Vorbereitung.

**Parallel-Projekt (`ahsub/regime-test`):** unverändert, heute nicht
bearbeitet.
