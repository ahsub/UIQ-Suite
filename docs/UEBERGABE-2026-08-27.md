# UEBERGABE-2026-08-27.md

Ausgangspunkt heute: Rückmeldung von Axels Anwalts-Freund (kein Fachanwalt,
mündliche Vorabeinschätzung) zum `UIQ_Legal_Briefing_Fachanwalt_Draft_1_0.docx`
— Abschnitte 9–11 seien korrekturbedürftig, KI-generierte UIQ-Texte hätten
"(viel) zu nah den Charakter von Handlungsempfehlungen". Daraus wurde ein
vollständiger Audit- und Fix-Tag mit drei technischen Sicherheits-/
Compliance-Fixes, einer Rechtsgutachten-Ergänzung und einer offenen
Produktentscheidung.

---

## 1. Audit — Bestandsaufnahme vor jeder Änderung

Alle vier Repos (`ko-aggregator`, `ko-modules`, `axel-scanner`, `ko-sync`)
systematisch nach "Handlungsempfehlungscharakter" durchsucht. Wichtigster
Befund: **Die Public/Expert-Trennung im gesamten System war rein
clientseitig** — drei unabhängige Schwachstellen, alle heute behoben (s.u.).

---

## 2. Backlog №60 — ✅ ERLEDIGT: `expert_mode` im `ko-ai.js`-Worker

**Befund:** `expert_mode` war ein reines Client-Boolean, ungeprüft im Worker
verwendet. Der EIC-PIN davor ist rein clientseitig (`localStorage`,
selbstgesetzt) — jeder Beta-Tester mit dem geteilten `STATIC_TOKEN` konnte
sich selbst freischalten und Axels reale Portfoliodaten (NAV ~€212K, aktive
Positionen) aus den Expert-Prompts einsehen.

**Fix (`ko-ai.js` v1.10 → v1.11, Commit `63aa38c`):** `expert_mode` jetzt
hart auf `expertModeRequested && isOwner` geprüft. `OWNER_TOKEN` ist das
einzige Merkmal, das Axel von den STATIC_TOKEN-Beta-Testern unterscheidet
(Token-Hash-Allowlist verworfen — STATIC_TOKEN ist für alle identisch).
Zusatzfund: `eic`-Action hatte gar keinen Public/Expert-Split — jetzt
ebenfalls owner-only (403 für Nicht-Owner). Abgelehnte Anfragen werden
geloggt (`<action>_EXPERT_DENIED`).

**Deploy-Stolperstein (wiederholte sich bei jedem der drei Worker heute):**
Cloudflare legt bei Secret-Änderungen automatisch eine neue Version an, die
NICHT automatisch auf 100% Traffic geht — "committed" ≠ "live". Muss jedes
Mal explizit beim Worker unter "Bereitstellungen" befördert werden.

**Verifiziert:** CSP-ATM/NA-Live-Abfrage liefert für Axel (Owner) weiterhin
volle Expert-Ausgabe; Public/Expert-Trennung für alle anderen jetzt
serverseitig hart.

---

## 3. Backlog №61 — ✅ ERLEDIGT: Aggregator-Enrichment ohne Public/Expert-Split

**Ursprünglicher Befund:** `enrich_shortlist_with_ai()` /
`enrich_options_watchlist_with_ai()` (`market_aggregator.py`) erzeugen im
nächtlichen Batch für alle Nutzer identisch konkrete Trade-Parameter
(trigger/stopLoss/target/positionPct/leverageRec bzw.
strikeSuggestion/dte/deltaTarget/premiumEstimate) — kein Modus-Split im
Code.

**Schwerwiegenderer Zusatzfund beim Umsetzen:** Die Auslieferung lief über
drei `/public/*`-Endpunkte im **separaten** `ko-sync`-Worker
(`master_market_data`, `options_watchlist`, `daily_market_snapshot[_us]`),
die **komplett unauthentifiziert** waren — wörtlich "öffentlich, kein Token
nötig" im Code kommentiert. Nicht nur Beta-intern sichtbar, sondern für
jeden im Internet mit der URL. Vermutlich der konkreteste Einzelfall dessen,
was der Anwalt kritisiert hat.

**Umsetzung (mehrstufig, mit zwei Nacharbeiten aus Live-Fehlern):**

1. `ko-sync-worker.js` v2.0 → v2.1: alle drei `/public/*`-Endpunkte
   verlangen jetzt `Authorization: Bearer <STATIC_TOKEN|OWNER_TOKEN>`.
   `masterShortlist[].ki` / `optionsWatchlist[].ki` werden für Nicht-Owner
   gefiltert (nur `strategy/riskClass/keyRisk/note` bleiben, konkrete Zahlen
   raus). Owner bekommt weiterhin alles.
2. `axel-scanner/index.html` v480/v481: neue Helper-Funktion
   `_publicKvAuthHeaders()`, an sechs Aufrufstellen ergänzt.
3. **Live-Fehler nach Deploy:** Morning Briefing hing >8 Min, Konsole zeigte
   `KV 401` sowohl bei `ko-market-state.js` als auch bei `loadKVMasterData`.
   Ursache doppelt: (a) `ko-modules/ko-market-state.js::
   loadHistoryFromAggregator()` — siebte, zunächst übersehene Aufrufstelle
   in einem separaten, CDN-hash-gepinnten Repo — sendete gar keinen Header;
   gefixt in v2.5, CDN-Pin in `index.html` auf `a834eb47...` aktualisiert
   (v481). (b) Der `ko-sync`-Worker hatte **überhaupt keine**
   `STATIC_TOKEN`/`OWNER_TOKEN`-Secrets (separater Worker von `ko-ai`, keine
   gemeinsame Secret-Verwaltung) — nachträglich mit denselben Werten
   ergänzt, plus erneut das Promote-auf-100%-Problem von №60.

**Verifiziert (Konsole):** `[MSE v2] History aus Aggregator geladen — 175
Tage`, `[KV-Scanner] 732 Ticker geladen`, Morning Briefing lädt sauber ohne
Hänger. Zwei unabhängige Restmeldungen bewusst nicht weiterverfolgt (siehe
Offene Punkte).

---

## 4. Backlog №62 — Vorschlag vorliegend, Umsetzung zurückgestellt

Systematische Durchsicht aller "Empfehlung"/"Handlungsempfehlung"-Fundstellen
in `index.html` abgeschlossen (Dev-Changelog-Kommentare und Expert/EIC-only-
Text bewusst ausgenommen). Konkrete Umbenennungsliste mit Axel abgestimmt
(u.a. "HANDLUNGSEMPFEHLUNGEN"-Badge → "MODELLBEWERTUNG", "Beste Chance..."
→ "Höchste Modellkompatibilität..."). **Umsetzung bewusst zurückgestellt**,
bis die Grundsatzfrage aus №36 (s.u.) beantwortet ist — das Ergebnis
bestimmt mit, wie weit die Sprachbereinigung gehen muss/darf.

---

## 5. Backlog №36 — Rechtsgutachten um 5 konkrete Fragen ergänzt

Auslöser: Axels Idee, regelbasierte Metriken (RSI/MACD/HVP/Minervini-Score)
ohne UIQ-Interpretation plus vorformulierte "Prompt-Empfehlungen" zur
Weiterverarbeitung in einer externen KI-Umgebung des Nutzers bereitzustellen
— mit dem Ziel, die eigentliche Kauf-/Verkaufsentscheidung dorthin zu
verlagern und damit aus der regulatorischen Grauzone zu kommen.

**Claudes Einschätzung (kein Rechtsrat):** Skeptisch — das WpHG-Konzept der
Anlageempfehlung dürfte weniger an der wörtlichen Kauf-/Verkaufssprache
hängen als an der Selektion/Rankierung selbst aus einem großen Universum
mit erkennbarer Entscheidungsabsicht. Der Umweg über eine externe KI mit
UIQ-seitig mitgelieferter Anleitung könnte als Umgehungskonstruktion
gewertet werden — potenziell schlechter als die jetzige ehrliche,
deskriptive Variante.

**5 Fragen bei Punkt 36 in `SUITE.md` ergänzt:** (a) Wo verläuft die Grenze
Scanner/Screener vs. Finanzanalyse/Anlageempfehlung (Art. 3 Abs. 1 Nr. 34/35
MAR)? (b) Verschärft namentliche Ticker-Selektion aus großem Universum die
Einordnung? (c) Bring-your-own-AI-Idee — zulässig oder Umgehung? (d) Wo darf
die Grenze zwischen Datenbeschreibung und Interpretation für Public-User
liegen, ohne den Produktwert zu zerstören? (e) Reichen die bestehenden
§1-WpHG-Klauseln in den Public-Prompts inhaltlich aus?

---

## 6. Backlog №63 (neu) — Beobachtungsposten, kein akuter Punkt

Nebenfund bei der №61-Verifikation: `ko-auth`-Worker existiert noch nicht.
`verifyUserToken()` fällt bei Nichterreichbarkeit auf Tier `admin` mit allen
Features zurück (inkl. `expertMode: true`). **Aktuell komplett folgenlos**
— verifiziert, dass `_userTier`/`getUserFeatures()` nirgends im Code
gelesen werden; totes Vorbereitungs-Gerüst für ein künftiges Abomodell.
Wichtig für später: Sobald `ko-auth` gebaut und verdrahtet wird, muss der
"Fail-Open auf admin"-Fallback bewusst überdacht werden — sonst entsteht
dort strukturell dasselbe Problem wie bei №60.

---

## Infrastruktur-Stand (27.08.2026 Abend)

| Komponente | Stand |
|---|---|
| `UIQ-Suite/SUITE.md` | v4.20 (dieser Übergabe folgend zu committen) |
| `ko-aggregator/workers/ko-ai.js` | v1.11, Commit `63aa38c`, deployed + verifiziert |
| `ko-sync/ko-sync-worker.js` | v2.1, deployed + verifiziert (Secrets nachträglich ergänzt) |
| `axel-scanner/index.html` | v481, deployed + verifiziert |
| `ko-modules/ko-market-state.js` | v2.5, Commit `a834eb47...`, CDN-Pin aktualisiert, verifiziert |
| `ko-aggregator/market_aggregator.py` | unverändert (Enrichment-Logik selbst nicht angetastet, nur Serving-Layer) |

---

## Offene Punkte für morgen / die nächste Session

1. **SUITE.md v4.20 committen** (liegt vor, noch nicht auf `origin/main` —
   Claude hat in dieser Sitzung keinen Push-Zugriff).
2. **Backlog №62 (UI-Terminologie) umsetzen** — sobald Rückmeldung vom
   Fachanwalt zu №36 vorliegt und die Grundsatzfrage geklärt ist.
3. **`[HomeSektorKondensat] nicht verfügbar: KV nicht erreichbar`** —
   vermutlich ein weiterer KV-Key-Aufruf (`sectorRS`) ohne Auth-Header,
   analog zum heutigen `ko-market-state.js`-Fund. Noch nicht geprüft.
4. **Die drei toten `/public/*`-Pfade in `index.html`**
   (`market:snapshot:latest`, `market:snapshot:{date}`, `degraded_status`)
   — existieren in `ko-sync-worker.js` gar nicht als Route, waren schon vor
   den heutigen Änderungen tot (404). Kein neues Problem, aber ungeklärter
   Altbestand.
5. **Rückmeldung vom Fachanwalt** zu Punkt 36 abwarten (jetzt mit 5
   konkreten Fragen) — weiterhin der einzige verbleibende echte
   Kommerzialisierungs-Blocker.
6. Kein akuter Code-Patch aus der heutigen Sitzung offen, der nicht bereits
   umgesetzt und verifiziert wäre — №62 ist die einzige bewusst
   zurückgestellte Umsetzung.
