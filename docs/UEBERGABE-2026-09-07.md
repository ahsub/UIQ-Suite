# UEBERGABE-2026-09-07.md

Fortsetzung der `vcpDetected`-Debugging-Session vom Vortagesende. Der Tag
zerfällt in drei große Blöcke: (1) ein Feld-Audit-Marathon, der ein
systemisches "Feld wird beim Hinzufügen an einer von neun Stellen
vergessen"-Muster endgültig eingedämmt hat, (2) die Erstellung und
sofortige Erweiterung des UIQ EIC Master Prompt (Ebenen 1-22 + neuer §23
"Handlungsempfehlung"), und (3) die ersten beiden EIC-Migrationen
(`csp_wheel`, `atmna`) mit fünf aufeinanderfolgenden Live-Test-Runden, die
ein hartnäckiges Umgehungsmuster (erfundene Zahlen in Options-Kontexten)
offenlegten — Empfehlung am Tagesende: serverseitige Zweitkontrolle statt
sechstem Prompt-Patch, analog zur Ticker-Scope-Sperre vom 05.09.

---

## 1. Diagnose-Skript gebaut: `uiq_field_audit.py`

Ausgangspunkt: die `vcpDetected`-Debugging-Session vom Vortag (elf
Fundstellen). Auf Axels Wunsch ein wiederverwendbares Skript gebaut, das
prüft, ob ein Feld an allen bekannten Weiterleitungsstellen (Server +
Client) vorhanden ist, plus CDN-Pin-Frische-Check.

**Das Skript hat sich selbst mehrfach als fehlerhaft erwiesen und wurde
live nachgebessert** (Kommentarzeilen-Verwechslung, Python-Listen- vs.
Dict-Syntax, Punktzugriff bei Konsumenten-Code, mehrere zu klein
bemessene Fenstergrößen — u.a. bei `scored.append()` und
`kvToScannerState()`, wo die ursprüngliche Annahme "26/26 Felder fehlen"
sich als Skript-Fehler herausstellte, nicht als echter Befund). Jede
dieser Selbstkorrekturen ist im Skript-Kommentar dokumentiert.

## 2. Feld-Audit-Vollcheck: neun unabhängige Fundstellen, alle gefixt

Systematischer Lauf über `market_aggregator.py` + `index.html` deckte
folgende echte Lücken auf (jeweils verifiziert vor dem Fix):

1. **`top20()`/`_rebuild_fundamental_lb()`s `_core`-Liste** führte weder
   VCP-Detailfelder noch die zehn Strategie-Scores — betraf v.a.
   `vcp_setups`. Per GHA-Log (VOD:4, GLEN.L:5 Kontraktionen) UND
   Live-Modell-Output nach Deploy bestätigt behoben.
2. **`rs`/`rsRating`-Feldnamens-Mismatch**: `tickerList` prüfte
   ausschließlich `r.rs` (Live-Scan-only), nie `r.rsRating` (KV/
   Aggregator-Pfad) — im KV-Regelfall kam dadurch nie ein RS-Wert an.
   `rsRating` hat jetzt Vorrang, `rs` bleibt Fallback.
3. **`tickerList`-Restfelder + `DATA_LEGENDE`**: `vcpAvgPrevPct`,
   `ivpHv20/50/100`, `tightnessPct`, `sma150`, fünf Strategie-Scores
   fehlten trotz v501-Fix; Legende erklärte weder VCP✓ noch IVP/HV/SMA150.
4. **`kvToScannerState()`-Inline-Fallback** (CDN-Ausfallpfad, bewusste
   byte-identische Doppel-Definition "Scope-Isolation"): fehlten
   `homeMarket`, sechs neue IVP-Felder, `breakout`/`vcp`/`ko` im
   `strategyScores`-Objekt. **Zusatzfund dabei**: `tickerList`s
   Objekt-Zweig fragte nur die ursprünglichen 5 Strategien ab —
   `long_dividend`/`long_value` waren im Fallback längst vorhanden,
   kamen aber trotzdem nie an. Ohne diesen Zweitfix hätte der
   Hauptfix nur kosmetisch gewirkt.
5. **`options_candidates.append()`** (Quelle für `runOptionsKiBriefing()`):
   `ema200` stand direkt neben im Diagnose-Log, wurde aber nie ins Dict
   übernommen — neunte unabhängige Fundstelle desselben Musters.
6. **Strike-Vorberechnung an drei Stellen** ergänzt (`EMA200−1,5×ATR`),
   um Modell-Arithmetik zu vermeiden — dabei **Live-Test-Fund**: Formel
   kann bei Titeln weit unter EMA200 einen Wert ÜBER dem Kurs liefern
   (unbrauchbar für CSP). Gültigkeitsprüfung an allen drei Stellen
   ergänzt (v505).

**Versionsstand nach diesem Block**: `index.html` v494→v505,
`market_aggregator.py` (ema200-Ergänzung), `uiq_field_audit.py` mehrfach
selbstkorrigiert.

## 3. EIC Master Prompt fertiggestellt + §23 "Handlungsempfehlung" ergänzt

Axels eigener Entwurf (`docs/UIQ_EIC_Master_Prompt_Draft_1.0.md`) um 5
Abschnitte erweitert (Metrik-Zweckentfremdung, Temporal Integrity,
Modal-Hedging, Ticker-Scope Integrity, Numeric-Integrity-Erweiterung).

**Wichtige Designentscheidung**: der Draft endet bewusst in einer offenen
Prüfungsfrage (§22 Kernprinzip), nicht in einer Handlung — das steht in
Spannung zu Axels Wunsch nach konkreten Strike-/DTE-/Prämien-Hinweisen im
EIC-Modus. Auflösung: Ebenen 1-22 bleiben unverändert, obendrauf ein
neuer, explizit EIC-exklusiver **§23-Block**, der direktive, aber nur
*berechenbare* Werte erlaubt (Strike aus UIQ-Formel, DTE als benannte
Marktkonvention, IVP/HVP-basierte Prämien-Einordnung) — niemals einen
erfundenen $-Betrag, da UIQ keine Live-Optionskettendaten hat.

## 4. Architektur-Fund: `ki_briefing_expert()` in `ko-ai-worker.js`

Der erste `csp_wheel`-EIC-Test zeigte einen Output, der mit dem
9-Punkte-Schema nichts zu tun hatte. Root Cause: der Cloudflare Worker
(`ko-ai-worker.js`) wählt bei `expert_mode=true` serverseitig einen
eigenen, komplett separaten System-Prompt (`ki_briefing_expert()`) —
lang, eigenständig strukturgebend, **mit Axels realem Portfolio
(NAV, Positionen) fest im Text**.

**Wichtige Korrektur unterwegs**: die zunächst vermutete
Vertraulichkeitslücke (`expert_mode` als ungeprüftes Client-Flag) bestand
bereits nicht mehr — Ursache war eine veraltete Arbeitskopie des Workers
(v1.8 statt real v1.17). Seit v1.11 (27.08.) ist `expert_mode` bereits
hart an `isOwner` gebunden. **Der Worker existiert zudem doppelt in zwei
Repos** (`ahsub/ko-aggregator/workers/ko-ai.js` und
`ahsub/workers/ko-ai-worker.js`) — Axel hat beide aus dem echten
Cloudflare-Stand aktualisiert, welches Repo künftig kanonisch bleibt ist
noch offen.

**Fix** (Axel-Entscheidung): `ki_briefing_expert()` auf kurzen,
generischen Verhaltensboden zurückgebaut (symmetrisch zu
`ki_briefing_public()`) — die Substanz (Master Prompt + §23) lebt jetzt
ausschließlich in `_eicMasterPrompt()` (`ko-prompts.js`), nicht mehr
doppelt an zwei Stellen mit unterschiedlicher Struktur.

**Versionsstand**: `ko-ai-worker.js` v1.17 → v1.19 (v1.18: Migration,
v1.19: `max_tokens` für `ki_briefing`+`expert_mode` auf 5000 erhöht,
Public bleibt bei 3000).

## 5. Zwei Strategien migriert: `csp_wheel`, `atmna`

Beide von ihrem alten, separat gepflegten `ctx.isEic`-Zweig auf
`_eicMasterPrompt()` umgestellt. Neue, geteilte Funktion analog zu
`_publicNinePointPrompt()` — Symmetrie-Prinzip: Server liefert nur den
Verhaltensboden, die Strategie-Substanz lebt komplett im
Client-Payload.

**Wichtiger Fund bei `atmna`** (von Axel selbst vermutet und mit
hochgeladenem Quellenbeleg bestätigt): die im alten Prompt fest
einprogrammierte Rollregel ("Strike ≈ Kurs − 2,5%") hat **keine Basis**
in Eric Ludwigs Buch ("Optionen unschlagbar handeln"), auf dem die
Strategie beruht. Ludwigs echtes Rollkriterium (Schritt 4) ist zeit-/
moneyness-/prämienökonomiebasiert (5 Tage vor Verfall + Put im Geld +
kein Teilgewinn möglich → rollen, Prämien-Deckungskriterium für den neuen
Put), kein fester Kursabstand. Die "2,5%" stammt vermutlich aus einer
Verwechslung mit einem völlig anderen Ludwig-Kriterium (Strike-
Staffelung ≤5% des Kurses, im Buch an einem $50-Aktien-Beispiel mit
"$2,50-Schritten" illustriert) — korrigiert auf die echten 5%.
`ko-strategies.js` trägt denselben Fehlwert, ist aber seit 18.08.
nachweislich toter Code (nicht mehr eingebunden), bewusst nicht
mitkorrigiert.

## 6. Fünf Live-Test-Runden, vier Fund-Iterationen an §23

Nach der `atmna`-Migration folgten fünf Live-Tests mit vier
aufeinanderfolgenden Nachschärfungen — **die letzten beiden Iterationen
haben dasselbe Grundmuster (erfundene Zahlen) nicht vollständig
gestoppt**, wichtig für morgen:

1. **Rollregeln-Zweckentfremdung** (`csp_wheel`, 1. Test): Modell rechnete
   `Dist200` (reine Ist-Zustand-Beschreibungsgröße) in erfundene
   absolute Preis-Trigger um ("$445"/"$465" für HUBB). Gefixt mit
   PRÜFFRAGE-Dreiteilung (UIQ MODEL-Wert / echte Konvention /
   Rückrechnung aus Beschreibungsgröße → bei Fall 3 weglassen).
2. **Break-even + erfundene %-Prämienschwelle** (`atmna`, 1. Test):
   "Break-even ca. $209–211" (ohne echte Prämie unmöglich zu berechnen)
   und "Prämie >2,5% des Kurses, also >$4,38" — beides umging das
   bestehende Verbot, weil es nicht wörtlich als "Prämie: $X" auftrat.
   Explizite Sperre für beide Muster ergänzt.
3. **Kandidaten-Fokus + Länge** (`atmna`, 2. Test): "3-5 Titel" wurde als
   Zielgröße 5 gelesen, nicht als Obergrenze; Antwort brach trotz
   erhöhtem Token-Limit (5000) mitten im Satz ab. Standard auf 3 gesenkt,
   explizite Pro-Kandidat-Formatbremse (Kennzahlen im Fließtext, keine
   Tabelle pro Kandidat) ergänzt — **dieser Fix griff sofort und
   vollständig** im nächsten Test (3. Test, saubere gemeinsame
   Vergleichstabelle, keine Truncation).
4. **Dieselbe erfundene 2,5%-Schwelle erneut** (`atmna`, 3. Test), diesmal
   in einem vom Modell selbst ergänzten "Externe Prüfung/IBKR-
   Checklist"-Abschnitt versteckt — die bisherige Sperre war zu eng an
   eine Textstelle gebunden. Übergreifende Regel ergänzt ("gilt für den
   GESAMTEN §23-Block").
5. **Neue erfundene Zahlen an derselben Stelle** (`atmna`, 4. Test):
   "Bid-Ask-Spread <$0,15/<$0,30" (keine Quelle nennt einen Dollarbetrag)
   und "OI mindestens 50 Kontrakte" (falsch UND unnötig — die korrekte
   Zahl, "dreistelliger Bereich", stand bereits im STRATEGIEPRINZIP und
   wurde ignoriert). Mit konkreten SO-NICHT/SO-STATTDESSEN-Beispielpaaren
   nachgeschärft.
6. **5. Test (nach Fund 5s Fix)**: dieselbe Fundklasse ein weiteres Mal,
   mit wieder neuen Zahlen ("1,5%/1,0% des Strikes", "<$0,20/<$0,15"
   Bid-Ask) — UND die Antwort brach erneut mitten im Wort ab, obwohl der
   Längen-Fix aus Iteration 3 in Test 3 sauber funktioniert hatte.

**Axels Entscheidung nach Test 5, identisch zum Präzedenzfall
Ticker-Scope-Sperre vom 05.09.**: keine sechste Prompt-Iteration, statt-
dessen serverseitige Guardrail vorbereiten.

**Versionsstand `ko-prompts.js`**: 2.47.0 → 2.49.4 (siehe Abschnitt 9 für
den vollständigen Versionsverlauf pro Fund).

---

## 7. Korrekturen eigener Fehleinschätzungen (zur Ehrlichkeit vermerkt)

1. Ursprünglich angenommen, `runAlphaLbKI()` rufe *immer*
   `getKiSystemPrompt()` auf (nie `KoPrompts.get()`) — das war der Stand
   *vor* dem `v491`-Umbau vom 06.09., meine gespeicherte Notiz war seit
   diesem Umbau schlicht nicht aktualisiert worden. Am selben Tag (06.09.)
   bereits gefixt, heute (07.09.) live am `csp_wheel`-Output aus Alpha
   Desk erneut bestätigt.
2. `ko-ai-worker.js` initial aus einer veralteten Arbeitskopie (v1.8)
   bearbeitet, ohne das zu erkennen, bis Axel nach der Versionsnummer
   fragte — echte Live-Version war v1.17. Kein Sachschaden (der
   `ki_briefing_expert()`-Funktionstext selbst war zeichengleich zwischen
   beiden Ständen), aber ein Warnsignal: Web-Fetch-Ergebnisse für
   Cloudflare-Worker-Code sind nicht automatisch der Live-Stand, wenn der
   Worker in einem separaten, nicht vorher besuchten Repo liegt.
3. Erste Vermutung, die 2,5%-Rollregel könnte aus Ludwigs Buch stammen,
   war nur zur Hälfte richtig — die Zahl existiert im Buch, aber für ein
   komplett anderes Kriterium (Strike-Staffelung, nicht Rollen) und mit
   anderem Wert (5%, nicht 2,5%). Erst durch tatsächliches Nachlesen im
   hochgeladenen PDF aufgeklärt, nicht durch Plausibilitätsvermutung.

---

## 8. Aktueller Versionsstand (Ende des Tages)

| Datei | Version | Status |
|---|---|---|
| `axel-scanner/index.html` | v505 | Deployed |
| `ko-aggregator/market_aggregator.py` | (ema200-Ergänzung, kein Versionszähler) | Deployed, GHA-Lauf durchgeführt |
| `ko-modules/ko-prompts.js` | 2.49.4 | Deployed |
| `ko-aggregator/workers/ko-ai.js` **und** `workers/ko-ai-worker.js` | v1.19 (beide Repos aktualisiert) | Deployed — **Repo-Kanonisierung noch offen** |
| `uiq_field_audit.py` (Diagnose-Skript) | — | Bereitgestellt, nicht Teil eines Repos |

**Migrationsstand EIC Master Prompt**: 2 von 5 geplanten Optionsstrategien
(`csp_wheel`, `atmna`). Ausstehend: `weekly_income`, `cc`, `collar`.

---

## 9. Plan für morgen

**Priorität 0 — serverseitige Guardrail für erfundene Zahlen in §23.**
Analog zum bestehenden `scanForComplianceViolations()`/
`scanForTickerScopeViolations()`-Mechanismus in `ko-ai-worker.js`: ein
Post-Scan, der $-Beträge/Prozentzahlen im generierten §23-Block gegen die
tatsächlich im Prompt vorhandenen Zahlen (STRATEGIEPRINZIP, Strike-Wert,
IVP/HVP-Perzentil) abgleicht und alles andere als potenziellen Fehlalarm
loggt (nicht blockierend, gleiches Prinzip wie die bestehenden Scans).
Fünf Live-Test-Iterationen haben gezeigt: das Muster ist robuster gegen
Prompt-Text als die bisher gefixten Fundklassen (Ticker-Scope, "stabil"-
Wortfamilie) — reine Prompt-Härtung hat hier schneller ihre Grenze
erreicht.

**Priorität 1 — Repo-Kanonisierung `ko-ai-worker.js`.** Zwei identische
Kopien in zwei Repos (`ko-aggregator/workers/` und `workers/`) — Axel
sollte entscheiden, welches bleibt, das andere entfernen oder klar als
"nicht mehr gepflegt" markieren. Sonst droht dieselbe Zwei-Kopien-Drift,
die heute schon bei `kvToScannerState()` und dem CDN-Pin-Kommentar Zeit
gekostet hat.

**Priorität 2 — verbleibende drei Optionsstrategien migrieren.**
`weekly_income`, `cc`, `collar` auf `_eicMasterPrompt()` — jeweils mit
strategie-eigenem `principle`/`focus`. Reihenfolge nicht fix vorentschieden.
Vor jeder Migration lohnt sich (analog zu `atmna`/Ludwig) eine kurze
Prüfung, ob der jeweilige alte EIC-Zweig ähnliche erfundene/falsch
zugeordnete Konventionen enthält.

**Priorität 3 — Live-Test der Priorität-0-Guardrail.** Sobald gebaut,
denselben `atmna`-Testfall (oder einen neuen) gegenlaufen lassen, um zu
sehen, ob die serverseitige Zweitkontrolle das Muster tatsächlich fängt.

**Weiterhin offen aus früheren Protokollen (heute nicht bearbeitet):**
kanonische Metriken-Pipeline (v2.0/Phase 3), Finnhub/TwelveData
serverseitig, `degraded_status`-Route, Repo-Privatstellung
(`ko-modules`), Legal-Briefing-Vorbereitung.

---

## 10. Methodische Erkenntnisse des Tages

1. **Ein Diagnose-Skript ist nur so gut wie sein zuletzt getestetes
   Fenster.** Mehrere "Feld fehlt komplett"-Befunde des eigenen Skripts
   waren Fenstergrößen-Bugs, nicht echte Funde — jede neue Ergänzung an
   einer geprüften Funktion (z.B. eigene Prompt-Erweiterungen) kann eine
   vorher korrekte Fenstergröße wieder sprengen. Ein Vollcheck nach jedem
   Fix-Batch lohnt sich, nicht nur beim ersten Lauf.
2. **Eine Datenquelle ist nicht automatisch der Live-Stand, nur weil sie
   frisch abgerufen wurde** — wenn eine Datei in einem bisher nicht
   besuchten Repo/Pfad liegt, kann eine alte, verwaiste Kopie an einer
   naheliegenden URL existieren. Bei Versionssprüngen, die nicht zum
   erwarteten Änderungsvolumen passen, lohnt sich eine explizite
   Rückfrage statt der Annahme, der Abruf sei zwangsläufig aktuell.
3. **Ein Verbot an einer Textstelle wird zuverlässig umgangen, indem
   dieselbe Erfindung unter neuer Überschrift wieder auftaucht.** Diese
   Lehre kostete heute drei separate Nachschärfungsrunden, bevor sie
   explizit als übergreifende (statt lokale) Regel formuliert wurde —
   künftige Funde dieser Art sollten direkt strukturell behandelt werden.
4. **Selbst eine im Prompt bereits korrekt vorgegebene Zahl schützt nicht
   davor, dass eine falsche Alternative erfunden wird** ("dreistelliger
   Bereich" stand im STRATEGIEPRINZIP, das Modell erfand trotzdem "50").
   Reine Fakten-Bereitstellung ersetzt keine Durchsetzungsregel.
5. **Ein Quellendokument tatsächlich zu lesen schlägt Plausibilitäts-
   vermutung** — die erste Einschätzung zur Herkunft der 2,5%-Regel wäre
   ohne den hochgeladenen Originaltext falsch geblieben (richtige Zahl,
   falsches Kriterium zugeordnet).
