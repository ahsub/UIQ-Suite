# UIQ — Technical Implementation Spec v1.1: Cost-Optimized AI Architecture

**Datum:** 13.09.2026
**Autoren:** Axel + Claude, unter Einbeziehung der Vorschläge des externen Reviewers
**Bezug:** ergänzt/verfeinert die bestehende „Technical Implementation Spec v1.0"
(Canonical Snapshot → Decision Snapshot → Prediction Ledger → Presentation).
Diese Spec ändert NICHT die Grundarchitektur — sie verkleinert ausschließlich
die AI-Komponente innerhalb des bestehenden, 1× täglichen Public-Digest-Laufs.

**Status:** Entwurf für die nächste Coding-Session. Noch nicht umgesetzt.

---

## 0. Ausgangslage

Am 13.09.2026 wurde `openKiBriefing()`/`runAlphaLbKI()` an einen neu
generierten Cache-Key (`public/ai_output/latest/{strategy}`, geschrieben von
`generate_public_recommendations.js` v1.3) angebunden — Cache-First statt
eines zweiten Live-Calls am selben Handelstag. Diese Arbeit bleibt
bestehen und wird durch diese Spec NICHT verworfen, sondern ergänzt.

Der externe Reviewer wies darauf hin, dass die eigentliche Kostenquelle
nicht primär die Cache-Frage ist, sondern dass mehrere Strategien täglich
volle, lange KI-Narrative erzeugen, obwohl UIQ die zugrundeliegende
Entscheidung (Score, Regime, Fit) bereits selbst deterministisch berechnet
hat. Diese Spec adressiert genau das — ohne das Produktversprechen
"1× täglich generierte, gecachte KI-Einordnung, Public-Modus" aufzugeben.

**Ausdrücklich NICHT Teil dieser Spec** (bewusst zurückgestellt, s. Diskussion
13.09.2026):
- **Punkt 6 (AI komplett aus der Daily Pipeline entfernen, nur noch On-Demand)**
  — als strategische Option offengehalten, keine Entscheidung jetzt.
- **Punkt 5 (15 Strategien → 1 gemeinsamer AI-Call)** — Risiko von
  Ticker-Scope-Vermischung zwischen Strategien zu hoch, bleibt vorerst bei
  1 Call = 1 Strategie.

---

## 1. Sofort umsetzbar, unabhängig vom Rest (kein Architekturrisiko)

### 1.1 AI-Budget-Logging

**Ziel:** Sichtbarkeit, bevor weiter optimiert wird — "welche UIQ-Funktion
kostet eigentlich Geld?"

Pro Anthropic-Call (in `callAnthropicWithRetry()`/`callAnthropic()`,
`generate_public_recommendations.js`, und äquivalent in `ko-ai-worker.js`
für die Live-Pfade) protokollieren:

```
{
  "date": "2026-09-13",
  "caller": "public_digest" | "morning_briefing" | "eic_on_demand" | ...,
  "strategy": "momentum" | null,
  "calls_used": 1,
  "token_input": 1234,
  "token_output": 87,
  "estimated_cost_usd": 0.0041
}
```

Aggregiert pro Tag in einer neuen KV/Log-Struktur (z.B.
`internal/ai_budget/{date}.json`, Owner-only, kein Public-Key). Am
einfachsten als zusätzliches Feld im bestehenden Digest-Lauf mitgeschrieben,
kein neuer Workflow-Step nötig.

**Kein Rollout-Risiko, keine Abhängigkeit zu den übrigen Punkten dieser
Spec — kann als separater, kleinster erster Schritt vorgezogen werden.**

---

## 2. Kern-Patch: Gate → Kurzprompt → Cache

Die Pipeline für den Public Digest (nur die 10 Equity-/KO-Strategien,
`generate_public_recommendations.js`) ändert sich von:

```
Decision Snapshot → voller Strategiekontext → langer Prompt → AI Call
→ volle 9-Punkte-Narrative → Cache
```

zu:

```
Decision Snapshot
       │
       ▼
normalisierte Signal-Teilmenge extrahieren
       │
       ▼
Score-Gate (strategie-granular)
       │
   score < Schwelle? ──── JA ──→ kein AI Call, kein Cache-Eintrag für
       │                          diese Strategie (Digest zeigt nur die
       │                          deterministischen Kennzahlen, s. §3)
       │ NEIN
       ▼
material_change_hash bilden
       │
   Hash == gestriger Hash? ── JA ──→ kein neuer AI Call, alter Cache-
       │                              Eintrag bleibt gültig (Datum wird
       │                              NICHT hochgezogen — s. Hinweis 2.3)
       │ NEIN
       ▼
Kurzprompt (≤ 40–50 Wörter Instruktion + JSON-Daten)
       │
       ▼
AI Call (max_tokens 50–80, temperature niedrig/0)
       │
       ▼
kurzer, komprimierter Text (1–2 Sätze)
       │
       ▼
Cache: public/ai_output/latest/{strategy}  (unveraendert, bestehender Key)
```

### 2.1 Normalisierte Signal-Teilmenge

Statt des vollen Strategiekontexts (komplette Aggregator-Daten, sämtliche
Indikatoren, vollständige Strategy-Definition, Macro-Daten) nur der
Decision Snapshot der Top-Kandidaten:

```json
{
  "strategy": "momentum",
  "regime": "BULL_QUIET",
  "top": [
    { "sym": "RKLB", "score": 94, "rs": 96, "macdHist": 1.23,
      "obvTrend": "UP", "volRatio": 1.8, "dist200": 34 },
    { "sym": "NVDA", "score": 91, ... },
    { "sym": "PLTR", "score": 88, ... }
  ]
}
```

Exakte Feldliste je Strategie: siehe die bereits bestehenden
`tickerLines`-Bauschleifen (`openKiBriefing()`, `runAlphaLbKI()`,
`generate_public_recommendations.js`) — hier NICHT neu erfinden, sondern
auf die schon vorhandenen, pro Strategie relevanten Felder reduzieren
(Single-Source-of-Truth-Risiko beachten, s. bekannte Sieben-Feldlisten-
Problematik in `index.html`).

### 2.2 Score-Gate (strategie-granular, NICHT pro Kandidat)

**Wichtig, Präzisierung gegenüber der Reviewer-Formulierung:** Da ein
AI-Call pro Strategie (nicht pro Kandidat) erfolgt, muss das Gate auf den
**besten Kandidaten der Strategie** greifen, nicht auf einzelne Ticker:

```
bester Score der Top-3 einer Strategie < Schwelle (Vorschlag: 70)
       → gesamte Strategie überspringen, kein AI Call
```

Schwellenwert ist ein Produkt-/Kalibrierungsentscheidung, kein technischer
Fixwert — Vorschlag 70 als Ausgangspunkt, nach den ersten Live-Tagen anhand
der AI-Budget-Logs (§1.1) nachjustieren.

### 2.3 `material_change_hash`

```
hash = sha256(normalisierte Signal-Teilmenge, gerundet auf sinnvolle
              Präzision — z.B. Score auf ganze Zahl, keine Nachkomma-
              Rauschen-Artefakte, die staendig neue Hashes erzeugen)
```

Vergleich gegen den Hash des letzten tatsächlich generierten Cache-Eintrags
(im `aiOutput`-Objekt mitspeichern, neues Feld `signal_hash`). Bei
Übereinstimmung: alter `recommendation_text` bleibt im Cache stehen,
**aber das `date`-Feld wird nicht aktualisiert** — sonst würde die
Freshness-Prüfung im Frontend (`fetchDigestAiOutput()`, s. `index.html`
v511) einen inhaltlich unveränderten, alten Text fälschlich als
"heutigen" Stand ausgeben. Für den Fall "Hash gleich, aber neuer
Handelstag" bewusst festlegen, ob das Digest-`date`-Feld trotzdem auf den
aktuellen Handelstag gesetzt wird (Anzeige "Stand: heute", Inhalt
unverändert) oder auf dem Datum der letzten tatsächlichen Generierung
bleibt (transparenter, aber ggf. verwirrend "veraltet" wirkend) — **diese
Entscheidung ist Teil der nächsten Coding-Session, hier bewusst offen
gelassen.**

### 2.4 Kurzprompt

Ersetzt `_publicNinePointPrompt()` für den Public-Digest-Pfad (NICHT für
EIC/On-Demand, s. §3). Beispielhafte Instruktion (Feinschliff der
konkreten Formulierung inkl. WpHG-Konformität ist Teil der Umsetzung, nicht
dieser Spec):

> "Du bist die sprachliche Zusammenfassung eines bereits berechneten
> UIQ-Decision-Snapshots. Verwende ausschließlich die gelieferten Daten.
> Keine neuen Informationen. Keine Kursprognosen. Keine Anlageempfehlung.
> Maximal 40 Wörter."

Die regulatorischen Pflichtformulierungen (WpHG §1, Modell-Grenze etc.)
werden — analog zum separat geplanten Boilerplate-Fix aus
`_publicNinePointPrompt()` — nicht mehr vom Modell neu formuliert, sondern
als fester Text app-seitig um den kurzen KI-Satz herum ergänzt (Anzeige,
nicht Teil des AI-Outputs selbst).

### 2.5 `max_tokens` / `temperature`

- `max_tokens: 80` für den Public-Digest-Pfad (aktuell deutlich höher).
- `temperature`: niedrig bis 0 — reduziert Varianz UND das Risiko, dass aus
  einem Kurzsatz wieder ein längerer Fließtext wird.

---

## 3. Zwei-Ebenen-Produktarchitektur (Public vs. EIC)

| Ebene | Inhalt | AI-Aufwand |
|---|---|---|
| **Public Digest** | Kennzahlen-Karte (Score/RS/MACD/OBV/Regime/Fit, deterministisch, 0 AI) **+** ein komprimierter KI-Satz (≤ 40 Wörter, §2) | 1 kurzer Call/Strategie, gegated (§2.2/§2.3) |
| **EIC / On-Demand** | Volle 9-Punkte-Narrative wie bisher (`_publicNinePointPrompt()`/EIC-Pfad unverändert) | 1 Call pro Nutzeraktion, wie heute |

**Unverändert bleibt:** 1× täglicher Lauf, Public-Modus, kein AI-Call pro
Klick im Public-Pfad, bestehende Cache-Struktur
(`public/ai_output/latest/{strategy}`). Diese Spec ändert nur, WAS im
Cache landet (kurz statt lang) und OB überhaupt ein neuer Call nötig ist
(Score-Gate + Hash-Gate) — nicht WANN oder WIE OFT.

### 3.1 Frontend-Konsequenz (Nachtrag, aus der heutigen Cache-First-Arbeit)

`openKiBriefing()`/`runAlphaLbKI()` zeigen den Cache-Inhalt aktuell in
einem für lange Fließtexte ausgelegten Modal an. Mit einem 1–2-Satz-Ergebnis
statt eines vollen Reports wirkt dieses Layout ggf. unpassend leer — **UI-
Anpassung für den Public-Pfad ist Teil der Umsetzung**, EIC-Modal (volle
Narrative) bleibt unverändert.

---

## 4. EIC-Kostenoptimierung (später, eigener Schritt)

**Ergänzung 13.09.2026 (Axel):** die Kostenoptimierung soll perspektivisch
nicht auf den Public-Pfad beschränkt bleiben — auch der EIC-/On-Demand-Modus
soll zu gegebener Zeit möglichst weit optimiert werden.

**Wichtige Einschränkung, die diese Optimierung von §1–§3 unterscheidet:**
Bei EIC ist die ausführliche Narrative selbst der Wert (Axels eigene
Handelsentscheidung stützt sich darauf) — das Kürzen des Outputs, wie es
für Public sinnvoll ist (§2.4/§2.5), ist hier NICHT das richtige Mittel.
"Größtmögliche Senkung" darf für EIC nicht heißen "kürzerer/dünnerer
Output", sondern "gleicher analytischer Wert zu geringerem Preis pro
Call". Die Hebel sind entsprechend andere:

1. **Boilerplate-Extraktion (Abschnitt 7/8) wirkt automatisch auch hier** —
   `_publicNinePointPrompt()` wird von Public UND EIC gemeinsam genutzt
   (`ctx.isEic`-Flag steuert nur Detailunterschiede, nicht die Grundstruktur).
   Der separat geplante Boilerplate-Fix (§6, Schritt 2) spart also Input-
   UND Output-Tokens bei EIC mit, ohne dass EIC etwas Eigenes braucht.

2. **Anthropic Prompt Caching (`cache_control`) für den statischen
   Guardrail-/Instruktionsteil.** Der große, über Monate gehärtete
   Regelblock (`KI_ANTI_HALLUZINATION`, `PUBLIC_REGULATORY_GUARDRAIL`,
   die Abschnitts-1-9-Instruktionen) ändert sich von Call zu Call kaum —
   das ist ein Lehrbuchfall für Prompt-Caching: der stabile Prefix wird
   einmal gecacht, jeder folgende Call mit demselben Prefix zahlt nur noch
   einen Bruchteil des Input-Preises dafür. Betrifft direkt EIC (häufige,
   wiederholte Calls mit demselben Guardrail-Block, unterschiedlichen
   Kandidatendaten) und ist orthogonal zu allem in §2 — reduziert Kosten
   pro Call, ohne den Output anzutasten. Voraussetzung: der Guardrail-Block
   muss als stabiler, unveränderter Prefix VOR den variablen Kandidatendaten
   stehen (aktuell vermutlich schon so, da `_publicNinePointPrompt()` erst
   die Guardrails, dann die dynamischen Teile zusammenbaut — im Detail bei
   Umsetzung prüfen).

3. **Session-lokale Dedup, analog zum Material-Change-Hash aus §2.3, aber
   EIC-spezifisch:** fragt Axel innerhalb desselben Handelstags zweimal
   nach derselben Ticker-/Strategie-Kombination, ohne dass sich die
   zugrundeliegenden Daten geändert haben, kann ein clientseitiger Cache
   (ähnlich dem bestehenden `_kiCache`/`_KI_CACHE_TTL` in `openKiBriefing()`)
   den zweiten Call vermeiden. Ein Teil davon existiert vermutlich schon
   (`_kiCache`) — prüfen, ob die TTL/Invalidierung tatsächlich optimal
   eingestellt ist, oder ob unnötig oft neu geladen wird.

4. **Modellwahl bewusst NICHT pauschal ändern.** Ein günstigeres Modell für
   EIC-Calls einzusetzen wäre der aggressivste Hebel, senkt aber direkt die
   Analysequalität, auf die sich Axels eigene Entscheidungen stützen —
   das widerspricht dem Grundsatz "gleicher Wert, geringerer Preis" und
   wird hier bewusst nicht empfohlen, es sei denn, Axel entscheidet das
   explizit und getestet für einzelne, weniger kritische Anwendungsfälle.

**Reihenfolge:** Punkt 1 kommt automatisch mit dem in §6 geplanten
Boilerplate-Fix. Punkte 2–3 sind eigenständige, spätere Schritte — bewusst
nicht Teil der nächsten Coding-Session (§6), da sie eigene Tests brauchen
(Prompt-Caching-Verhalten ist nicht immer intuitiv, muss live geprüft
werden) und keine Abhängigkeit zum Public-Patch haben.

---

## 5. Explizit zurückgestellt (nicht Teil dieser Session)

- **Punkt 6:** AI vollständig aus der Daily Pipeline entfernen, Public
  Digest komplett ohne AI (reine Kennzahlen-Karte). Bleibt als
  strategische Option im Raum — abhängig davon, wie das Produkt sich
  entwickelt und ob der kurze KI-Satz aus §2/§3 vom Public-Nutzer als
  Mehrwert wahrgenommen wird (lässt sich nach ein paar Wochen anhand
  Nutzungsdaten/Feedback klären, nicht heute vorab entscheiden).
- **Punkt 5:** 15 Strategien in einem gemeinsamen AI-Call. Bleibt bei
  1 Call = 1 Strategie, wegen Ticker-Scope-Risiko.
- **Morning Briefing / Macro Analysis Umbau** (Reviewer-Punkt 8): separates
  Thema, eigene Session — dieselbe Gate/Hash-Logik (§2.2/§2.3) ist
  grundsätzlich übertragbar, aber Morning Briefing hat eine andere
  Architektur (serverseitig, KV-Key `daily_market_snapshot`) und verdient
  eigene Betrachtung.

---

## 6. Umsetzungsreihenfolge (Vorschlag)

1. **§1.1 AI-Budget-Logging** — sofort, unabhängig, kein Risiko.
2. **§2 Kern-Patch, zunächst als vollständiger Vertical Slice für EINE
   Strategie** (Ergänzung Reviewer, 13.09.2026): normalisierte Signale →
   Score-Gate → Hash-Gate → Kurzprompt → `max_tokens`/Temperatur, komplett
   end-to-end für z.B. `momentum` (bereits als Test-Strategie etabliert,
   s. heutige curl-Tests), inklusive Cache-Schreib-/Lesepfad. Erst nach
   erfolgreichem Live-Test dieser einen Strategie auf die übrigen 9
   ausrollen — nicht alle 10 gleichzeitig umstellen. Der separat geplante
   Boilerplate-Fix aus `_publicNinePointPrompt()` (Abschnitt 7/8 app-seitig
   templaten statt vom Modell generieren) gehört in denselben Umbau, da
   beide dieselben Code-Stellen betreffen.
3. **§3.1 Frontend-Anpassung** für das kürzere Cache-Ergebnis.
4. Nach ca. 1–2 Wochen Live-Betrieb: anhand der AI-Budget-Logs (§1.1)
   Score-Schwelle (§2.2) und Hash-Präzision (§2.3) kalibrieren.

Jeder Schritt einzeln testbar — kein „großer Bang"-Umbau an einem Tag.

**Ausdrücklich NICHT Teil dieses Patches** (Reviewer-Ergänzung, 13.09.2026):
Morning Briefing/Macro Analysis bleiben unangetastet, bis der Public-Pfad
sauber läuft (s. §5) — die Kostenoptimierung darf nicht dazu führen, dass
an anderer Stelle neue, unkoordinierte AI-Schichten übereinander entstehen,
während der Public-Pfad noch nicht abgeschlossen ist.
