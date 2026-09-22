/**
 * generate_public_recommendations.js
 * ====================================================================
 * Server-seitiges Gegenstück zu openKiBriefing() (index.html) für den
 * AI_delivery_public-Flow. Läuft als GHA-Schritt DIREKT NACH
 * market_aggregator.py, im selben Job (liest master_market_data.json
 * vom lokalen Filesystem, kein HTTP-Roundtrip nötig).
 *
 * Spec: docs/UIQ Public Daily Recommendations — Technical Implementation v1.0
 * Abschnitte 3 (Datenmodelle), 6 (GHA-Integration), 9 (Options-Preset).
 *
 * Status: Baustein 1 von mehreren — Daily Market Snapshot Builder
 * (Abschnitt 3.1, strategie-unabhängiger, einmal pro Lauf berechneter
 * Teil). Ticker-Payload/Prompt-Bau/API-Call folgen als nächste Bausteine.
 * [HINWEIS 10.09.2026: dieser Status-Absatz ist veraltet — das Skript
 * deckt inzwischen alle Bausteine bis 21 ab (main(), Python-JSON-Kompat.
 * etc.), s. CHANGELOG unten. Nicht im Rahmen dieser Änderung bereinigt,
 * um den Diff auf den Trading-Day-Skip-Check zu beschränken.]
 * ====================================================================
 *
 * Skript-Version: v1.12
 *
 * CHANGELOG (neueste zuerst):
 * v1.12 (22.09.2026, Claude + Axel, KRITISCHER PUBLISH-BUG-FIX): Fund
 *      beim Debugging eines GHA-Laufs mit vier von fünf Options-Strategien
 *      auf REPAIR-FAILED (csp_wheel/atmna/weekly_income/cc) — trotzdem
 *      liefen alle vier als "✅ Top-3" durch. Root Cause: im REPAIR-LOOP
 *      (v1.7) wurde `apiResult = repairResult` VOR der Prüfung des
 *      repairCheck-Ergebnisses zugewiesen — sowohl bei REPAIR-FAILED
 *      (weiterhin nicht-konformer Repair-Text ersetzt den Original) als
 *      auch bei REPAIR-ERROR (Original, ebenfalls nicht-konform, bleibt
 *      unveraendert) lief runStrategy() mit `{ ok: true, ... }` durch —
 *      der Text landete unveraendert in buildAiOutput() -> Archiv ->
 *      public/ai_output/latest/{strategy} -> Public Digest. Das einzige
 *      sichtbare Signal war aiOutput.repair_status, das buildPublicDigest()
 *      NICHT in die oeffentlichen opportunities[]-Eintraege uebernimmt —
 *      ein Leser des Public Digest hatte keine Moeglichkeit, einen
 *      fehlgeschlagenen Compliance-Check zu erkennen. Das unterlaeuft die
 *      mit v2.53.30/v1.10 eingefuehrte Grundgarantie ("Score-Engine
 *      entscheidet, Modell erklaert nur") genau an der Stelle, an der sie
 *      zaehlt: der tatsaechlichen Veroeffentlichung.
 *      FIX: `apiResult = repairResult` nur noch bei repairCheck.status
 *      === 'PASS'. Bei REPAIR-FAILED oder REPAIR-ERROR gibt runStrategy()
 *      jetzt { ok: false, strategy, error, repairStatus } zurueck — die
 *      Strategie wird fuer diesen Lauf uebersprungen (Archiv-/Digest-/KV-
 *      Schreibvorgaenge finden fuer sie nicht statt), exakt dasselbe
 *      Fehlerisolations-Muster, das main() fuer jeden anderen Fehlerfall
 *      bereits nutzt (eine fehlerhafte Strategie blockiert nie den
 *      Gesamtlauf der uebrigen 14). KEIN neues Konzept, nur konsequente
 *      Anwendung des bestehenden Prinzips auf einen bisher uebersehenen
 *      Fall. Noch KEIN Live-Test (naechster GHA-Lauf mit einem erneuten
 *      REPAIR-FAILED-Fall zeigt, ob die betroffene Strategie jetzt korrekt
 *      als uebersprungen statt als erfolgreich geloggt wird).
 * v1.11 (21.09.2026, Backlog #1 — API-Kosten-Auswertung): Preis-Konstanten
 *      (ANTHROPIC_PRICE_PER_INPUT_TOKEN_USD/..._OUTPUT_...) kalibriert
 *      gegen https://docs.claude.com/en/docs/about-claude/pricing — waren
 *      seit ihrer Einfuehrung (Baustein 8b, 15.09.2026) durchgehend `null`.
 *      Claude Sonnet 4.6: $3/MTok Input, $15/MTok Output — dieses Skript
 *      nutzt ausschliesslich dieses eine Modell (ANTHROPIC_MODEL-Konstante,
 *      keine Strategie-abhaengige Variation), daher genuegt ein einziges
 *      globales Preispaar (anders als ko-ai.js, das mehrere Modelle mischt
 *      und deshalb in v1.28 eine modellabhaengige Lookup-Tabelle bekam).
 *      estimated_cost_usd in AI_BUDGET_LOG/internal/ai_budget/{date}
 *      liefert ab sofort echte Dollarbetraege statt durchgehend `null`.
 * v1.10 (21.09.2026, Claude + Axel, LLM-Auswahl-Drift-Fix): Der v1.9-
 *      Diagnose-Log lieferte den Beweis: top3Syms und der daraus gebaute
 *      Faktor-Block wurden korrekt berechnet und korrekt an Anthropic
 *      uebergeben (JNJ/MRK/MDT mit echten BB-/Tightness-Werten) — das
 *      Modell ersetzte in Abschnitt 3 dennoch eigenmaechtig MRK durch CSCO
 *      und begruendete aktiv, warum MRK "die Kriterien nicht erfuellt".
 *      Kein Datenfluss-Bug (runStrategy()/buildOptionsPromptForStrategy()
 *      liefern nachweislich korrekt), sondern freie Modell-Neuinterpretation
 *      trotz bereits abgeschlossener Score-Rang-Entscheidung. Zweifach
 *      reproduziert (Runs #321 und #322, 20./21.09.2026). Gegenstueck zu
 *      ko-prompts.js v2.53.30 + ko-ai.js v1.26 (dort der vollstaendige
 *      Architektur-Kommentar): Score-Engine entscheidet, Modell erklaert
 *      nur noch — keine Entscheidungsrolle mehr fuer die Kandidatenauswahl.
 *      - buildOptionsPromptForStrategy(): setzt jetzt ctx.top3Syms fuer
 *        ALLE fuenf Options-Strategien (nicht nur atmnaFactors bei atmna) —
 *        ko-prompts.js v2.53.30 injiziert daraus die neue Pflichtzeile
 *        "VERBINDLICHE TOP-3-KANDIDATEN FÜR ABSCHNITT 3".
 *      - runStrategy(): uebergibt top3Syms als options.expectedTop3 an
 *        KoPrompts.validateBriefingCompliance() (Erst- UND Repair-Check) —
 *        direkter Aufruf der in ko-prompts.js v2.53.30 bereits erweiterten
 *        Funktion, KEIN Duplikat noetig (anders als bei ko-ai.js), da
 *        dieses Skript KoPrompts ohnehin per require() laedt.
 *      - buildRepairPrompt(): neue Fehlerklasse "top3-ticker-konsistenz"
 *        mit explizitem Ersetzungshinweis (identische Logik zu ko-ai.js
 *        v1.26, dort zwangslaeufig dupliziert — s. bestehender Wartungslast-
 *        Kommentar bei dieser Funktion).
 *      Noch KEIN Live-Test.
 * v1.9 (20.09.2026, Claude + Axel, Reviewer-Vorgabe "erst beweisen, dann
 *      reparieren"): Rein diagnostische Logging-Ergaenzung, KEINE
 *      Verhaltensaenderung. Live-Fund (Run #321, 20.09.2026): Abschnitt 3
 *      des atmna-Outputs nannte JNJ/CSCO/MDT, waehrend der deterministische
 *      Faktor-Block (Abschnitt 4, VERPFLICHTENDE FAKTORENPRUEFUNG) fuer
 *      JNJ/MRK/MDT Bollinger-/Tightness-Werte auswies — zwei widerspre-
 *      chende "Top-3"-Listen im selben Dokument. Bevor daraus eine
 *      Architekturaenderung (z.B. Abschnitt-3-Kandidaten deterministisch
 *      erzwingen, s. Diskussion) oder ein neuer Validator-Check wird, muss
 *      erst zweifelsfrei bewiesen sein, WO genau top3Syms und der tat-
 *      saechlich verwendete Prompt-Inhalt auseinanderlaufen — ob bereits
 *      zwischen selectOptionsCandidates() und buildOptionsPromptForStrategy()
 *      (dann waere runStrategy() selbst der Bug, nicht das Modell) oder erst
 *      beim LLM (freie Uminterpretation trotz korrekt uebergebener Daten).
 *      Zwei neue console.log()-Zeilen in runStrategy() (nur fuer atmna, das
 *      einzige bisher betroffene Strategie) protokollieren top3Syms/top10-
 *      Symbole direkt nach der Kandidatenauswahl UND den fertigen
 *      atmnaFactors.summary-String direkt vor dem Anthropic-Call — beide
 *      Werte muessen im naechsten Lauf gegen den tatsaechlichen Abschnitt-3-
 *      Inhalt der Antwort abgeglichen werden. Absichtlich NICHTS sonst
 *      geaendert (kein Fix, kein neuer Validator-Check) — das waere
 *      verfrueht, solange die Fehlerquelle nicht bewiesen ist.
 * v1.8 (20.09.2026, Claude + Axel): KO_MODULES_VENDOR_DRIFT_COMMIT auf den
 *      aktuellen Stand gezogen (a5473ac -> c4f7c93). Root Cause fuer den
 *      eigentlichen ATMNA-Explainability-Gap-Live-Fund war eine veraltete
 *      scripts/vendor/ko-prompts.js (haengengeblieben bei v2.53.25, ohne
 *      den deterministischen Faktor-Block aus v2.53.29) — die Vendor-Kopie
 *      selbst wurde bereits separat nachgezogen (Commit 5ae24e3), aber
 *      DIESE Konstante (die Referenz, gegen die checkVendorDrift() beim
 *      naechsten Update vergleicht) zeigte noch auf den alten Stand vom
 *      10.09.2026 und wurde nie mitgezogen — der Drift-Check meldete
 *      dadurch bei jedem Lauf einen technisch falschen, aber inhaltlich
 *      zufaellig richtigen Alarm (die Warnung war zum Zeitpunkt ihrer
 *      Einfuehrung korrekt, wurde aber selbst nie aktualisiert und haette
 *      nach dem naechsten legitimen ko-prompts.js-Update erneut faelschlich
 *      angeschlagen). Verifiziert: ko-markov.js ist bei c4f7c93 weiterhin
 *      byte-identisch zur Vendor-Kopie (unveraendert seit a5473ac) — beide
 *      Vendor-Dateien passen jetzt zu genau demselben Referenz-Commit.
 * v1.7 (20.09.2026, Claude + Axel): ATMNA-Explainability-Gap-Fix, Teil 3 —
 *      REPAIR-Loop fuer den naechtlichen Batch-Pfad (Live-Fund desselben
 *      Tages: ein echter atmna-Output aus dem Digest-Cache — also aus
 *      GENAU diesem Skript, nicht aus dem separaten ko-ai.js-Live-Pfad —
 *      liess trotz v1.6/ko-prompts.js v2.53.29 alle drei Pflichtangaben
 *      aus (optionsmarkt-validierungsstatus, bollinger-position,
 *      tightness) und wurde unkorrigiert in den KV-Cache geschrieben.
 *      Root Cause: der REPAIR-Loop existierte bisher AUSSCHLIESSLICH in
 *      ko-ai.js (dem Live-On-Demand-Worker fuer interaktive Nutzer-
 *      Aufrufe) — dieser Batch-Pfad hier ruft Anthropic komplett
 *      eigenstaendig auf (callAnthropicWithRetry()) und hatte dadurch
 *      NULL Schutz gegen dasselbe Versagensmuster, das der urspruengliche
 *      Fix eigentlich beheben sollte. Fix: nach jedem erfolgreichen
 *      Options-Strategie-Call in runStrategy() wird jetzt zusaetzlich
 *      KoPrompts.validateBriefingCompliance(strategy, apiResult.text)
 *      geprueft (direkter Aufruf der bereits in ko-prompts.js v2.53.29
 *      exportierten Funktion — HIER kein Duplikat noetig, anders als in
 *      ko-ai.js, weil dieses Skript ko-prompts.js ohnehin per require()
 *      laedt). Bei FAIL: EIN Repair-Call mit buildRepairPrompt() (Logik
 *      identisch zu ko-ai.js v1.25s buildRepairPrompt() — inkl. dem dort
 *      bereits gefundenen Wortlaut-Hinweis fuer "nicht verifiziert" statt
 *      "nicht verfuegbar" — hier zwangslaeufig ein drittes Mal dupliziert,
 *      da KoPrompts diese Prompt-Bau-Funktion nicht exportiert; bekannte,
 *      bewusst in Kauf genommene Wartungslast, s. Kommentar bei
 *      buildRepairPrompt() unten). Der Repair-Call laeuft ueber
 *      callAnthropicWithRetry() (nicht die einfachere rohe callAnthropic()
 *      wie in ko-ai.js) — das gibt dem Repair-Versuch selbst noch den
 *      bestehenden Truncation-Retry-Schutz kostenlos mit, ohne die
 *      "genau ein Repair-Versuch fuer Non-Compliance"-Grenze aufzuweichen
 *      (das ist ein separates, orthogonales Retry-Konzept). Repair-Call
 *      wird im Budget-Log unter eigenem Label "<strategy>_REPAIR" erfasst
 *      (analog zu ko-ai.js), damit die Zusatzkosten sichtbar bleiben statt
 *      sich unter dem strategy-Eintrag zu verstecken. Ergebnis landet als
 *      neues Feld aiOutput.repair_status (null | "REPAIR-SUCCESS" |
 *      "REPAIR-FAILED:<fehlend>" | "REPAIR-ERROR:<meldung>") im Archiv UND
 *      im 'latest'-Pointer — damit ist das Ergebnis genauso sichtbar wie
 *      ko-ai.js' complianceFlags, nur an der fuer diesen Batch-Pfad
 *      passenden Stelle (kein KV-Request-Log hier, aber der aiOutput
 *      selbst wird ohnehin bereits archiviert). [KORRIGIERT 22.09.2026,
 *      s. v1.12: dieses Feld war zwar vorhanden, aber der Publish-Pfad
 *      selbst pruefte es nicht ab — s. dortiger Fix.] Noch KEIN Live-Test
 *      (naechster GHA-Lauf bzw. FORCE_REGENERATE=true zeigt, ob der Fix in
 *      der Praxis greift).
 * v1.6 (20.09.2026, Claude + Axel): ATMNA-Explainability-Gap-Fix, Teil 2 —
 *      echte BB-/Tightness-Datenanbindung fuer den in ko-prompts.js
 *      v2.53.29 ("Deterministic Briefing Compliance") bereits vorbereiteten
 *      deterministischen Faktor-Block (_deterministicOptionsFactBlock()).
 *      Neue Funktion buildAtmnaFactorsSummary() baut aus den Top-3-
 *      Kandidaten (top10/top3Syms aus selectOptionsCandidates()) einen
 *      fertig formatierten Summary-String ("SYM: BB X%, Tightness Y%"),
 *      NUR fuer atmna (die einzige Options-Strategie mit tightnessPct als
 *      eigenem Signalfeld, s. OPTIONS_STRATEGY_SIGNAL_MAP). bbPos-Umrechnung
 *      (*100 fuer %) 1:1 aus buildTickerListString() uebernommen (dort
 *      bereits verifiziert: 0-1-normiert) — keine separate Semantik-Pruefung
 *      fuer den Options-Pfad noetig, gleiche Aggregator-Felder. Reviewer-
 *      Feedback (20.09.2026) umgesetzt: (1) Plausibilitaetswarnung statt
 *      stillschweigendem Vertrauen, falls ein bbPos-Wert klar ausserhalb
 *      des 0-1-Bereichs liegt (>1.5) — wird dann als bereits-Prozent
 *      behandelt statt erneut mit 100 multipliziert, mit Konsolen-Warnung.
 *      (2) Ein Top-3-Kandidat, der nicht in top10 gefunden wird, wird NICHT
 *      stillschweigend aus dem Summary weggelassen, sondern als
 *      Datenintegritaetsfehler geworfen — landet ueber runStrategy()s
 *      bestehendes try/catch als { ok:false, error } NUR fuer diese eine
 *      Strategie, ohne die uebrigen 14 Strategien oder den Gesamtlauf zu
 *      beeintraechtigen (gleiches Fehlerisolations-Muster wie ueberall
 *      sonst in diesem Skript). buildOptionsPromptForStrategy() bekommt
 *      zwei neue Parameter (top10, top3Syms), setzt ctx.atmnaFactors =
 *      { summary } NUR bei strategy==='atmna'. Aufrufstelle in runStrategy()
 *      entsprechend angepasst. Noch KEIN Live-Test.
 * v1.5 (16.09.2026, Claude + Axel): Thema-3-Abschlusstest — End-to-End-
 *      Validierung bestanden (Cache genutzt, kein zweiter Anthropic-Call,
 *      options_atmna/options_csp nachweislich getrennte Kandidatenlisten
 *      0/10 Überlappung, Owner/EIC-Pfad unverändert). ATMNA Explainability
 *      Gap als Backlog-Befund dokumentiert (s. Kommentar bei
 *      OPTIONS_STRATEGY_SIGNAL_MAP) — Score/Pipeline korrekt, KI-Erklärung
 *      nennt ATMNA-spezifische Treiber (bbPos/tightnessPct) noch nicht
 *      explizit. Bewusst kein Prompt-Fix in dieser Version.
 *
 * CHANGELOG (neueste zuerst):
 * v1.4 (16.09.2026, Claude + Axel): Thema 3 — die fünf Options-Strategien
 *      (csp_wheel/atmna/weekly_income/cc/collar) in den nächtlichen Public-
 *      Digest aufgenommen (Spec Abschnitt 9, "Options-Preset", war bereits
 *      vorgesehen, nie implementiert). Eigene Strategieklasse
 *      (OPTIONS_STRATEGIES), NICHT in EQUITY_STRATEGIES gemischt — eigene
 *      Kandidatenauswahl (selectOptionsCandidates(), ohne die equity-
 *      spezifische Mehrfach-Quellen-Anreicherung, nicht noetig), eigene
 *      Ticker-Listen-Formatierung (buildOptionsTickerListString(), 1:1 aus
 *      index.html runOptionsKiBriefing() portiert, inkl. Strike-Heuristik
 *      EMA200-1.5xATR mit n/a-Sicherung — KEINE erfundenen echten
 *      Optionsketten-Daten, UIQ hat keine). Score-Zuordnung 1:1 gegen den
 *      echten market_aggregator.py-Code verifiziert (nicht anhand von
 *      Namen vermutet): csp_wheel/weekly_income/collar -> sCsp, atmna ->
 *      sAtmna (Backlog #64), cc -> sCc. runStrategy()/main() teilen sich
 *      weiterhin dieselbe Infrastruktur (Retry, AI-Budget-Logging, Ledger-/
 *      Digest-Bau) — keine zweite parallele Pipeline. Fund dabei: ohne
 *      OPTIONS_STRAT_SCORE_FIELD waere buildDecisionSnapshot() fuer
 *      Options-Strategien still auf den equity-generischen candidate.score
 *      zurueckgefallen statt auf sCsp/sAtmna/sCc — mit synthetischen
 *      Kandidatendaten explizit gegengetestet, kein stiller Fallback mehr.
 *      filter_preset (Spec Abschnitt 9, bisher immer null) jetzt fuer
 *      Options-Strategien tatsaechlich befuellt. NICHT Teil dieser Version:
 *      Frontend-Cache-Anbindung (index.html runOptionsKiBriefing()) — s.
 *      separater Commit/Changelog dort.
 * v1.3 (13.09.2026, Claude + Axel): neuer 'latest'-Pointer-Key pro Strategie
 *      (public/ai_output/latest/{strategy}) zusätzlich zum bestehenden
 *      Archiv-Key (archive/recommendations/{date}/{strategy}_ai_output.json)
 *      — enthält dasselbe aiOutput-Objekt inkl. vollem recommendation_text.
 *      Grund: der bisherige Public Digest (buildPublicDigest()) enthält nur
 *      eine kurze, statisch-templatete rationale, NICHT die volle KI-
 *      Narrative — für die eigentliche Sprint-Absicht (openKiBriefing()/
 *      runAlphaLbKI() sollen die bereits generierte volle Narrative zeigen,
 *      Cache-First statt täglich doppeltem Anthropic-Call) reichte das
 *      Archiv allein nicht, da es keine öffentliche Route hat und nicht
 *      tagesaktuell unter einem stabilen Key liegt. Neue Route dafür:
 *      ko-sync-worker.js v2.3, GET /public/ai_output/:strategy. Platzierung
 *      bewusst im bestehenden 'latest'-Pointer-Block (Archiv zuerst, s.
 *      Kommentar dort) — gleiche Reihenfolge-Garantie wie bei
 *      public/digest/latest und public/recommendations/latest.
 * v1.2 (10.09.2026, Axel + Claude): Vendor-Drift-Check ergänzt (Punkt 11
 *      Übergabeprotokoll 09.09.2026) — checkVendorDrift() vergleicht
 *      scripts/vendor/ko-prompts.js und ko-markov.js beim Start gegen den
 *      kanonischen Stand in ko-modules@a5473ac und warnt LAUT bei
 *      Abweichung, statt still zu veralten. Bewusst KEIN reiner
 *      Fetch-at-Runtime-Ersatz für require()/vm (hätte dieselbe
 *      "Pin muss von Hand nachgezogen werden"-Schwäche wie
 *      KO_INDICATORS_JSON_COMMIT und würde eine neue harte Netzwerk-
 *      Abhängigkeit für etwas zwingend Benötigtes einführen) — die
 *      Vendor-Kopie bleibt die tatsächlich ausgeführte Quelle. Getestet
 *      gegen echte ko-modules-Daten (10.09.2026: kein Drift vorhanden,
 *      beide Dateien byte-identisch zu main) sowie mit künstlich
 *      erzeugtem Drift (Warnpfad verifiziert).
 * v1.1 (10.09.2026, Axel + Claude): Trading-Day-Skip-Check ergänzt —
 *      Baustein 16b (readFromCloudflareKV) + Skip-Logik in main() direkt
 *      nach dem Snapshot-Aufbau. Verhindert alle zehn Anthropic-Calls an
 *      Tagen ohne neuen Handelstag (Wochenende, jeder Börsenfeiertag in
 *      jedem beteiligten Markt) — rein datengetrieben über snapshot.date
 *      (= masterData.meta.last_trading_day, von market_aggregator.py
 *      bereits ueber echte SPY-Handelsdaten bestimmt), bewusst OHNE
 *      Feiertagskalender. Vergleicht gegen date-Feld im zuletzt
 *      veröffentlichten /public/digest/latest — kein neuer KV-Key.
 *      FORCE_REGENERATE=true als Escape-Hatch für manuelle Neuerzeugung.
 *      Fail-open bei KV-Lesefehlern (kein Skip, normaler Lauf), um einen
 *      stillen Lese-Bug nicht tagelang unbemerkt Digests unterdrücken zu
 *      lassen — Alternative ("fail-closed") noch mit Axel zu klären.
 * v1.0 (Datum unbekannt — Datei war bisher unversioniert, dieser
 *      Changelog-Kopf wurde erst mit v1.1 eingeführt): Basis-Skript
 *      (Snapshot-Bau, 10 Strategien, Anthropic-Calls, Public Digest,
 *      KV-Push, Archiv-Schreibfunktionen).
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

// ─── Modul-Loader für ko-modules (browser-style `var X = {...}`) ──────────────
//
// ko-prompts.js hat einen echten CommonJS-Export (module.exports = KoPrompts),
// kann also direkt per require() geladen werden (s. Spec Abschnitt 6, Punkt 1
// — bereits heute mehrfach in dieser Session gegen den echten Dateiinhalt
// verifiziert: "if (typeof module !== 'undefined' && module.exports) {...}").
//
// ko-markov.js hat DAGEGEN keinen expliziten module.exports-Zweig — nur
// `var KoMarkov = {...}` im globalen Scope (Browser: window.KoMarkov). Für
// Node laden wir es deshalb über vm.runInContext in einem Sandbox-Objekt und
// lesen die Variable danach aus. Getestet: KEINE DOM-Abhängigkeit im Modul
// (einzige window-Referenz hat einen sicheren Fallback), läuft sauber unter
// Node.
function loadBrowserStyleModule(filePath, varName) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(src + `\nthis.${varName} = ${varName};`, sandbox, { filename: filePath });
  if (!sandbox[varName]) {
    throw new Error(`loadBrowserStyleModule: ${varName} wurde in ${filePath} nicht gefunden`);
  }
  return sandbox[varName];
}

// KoPrompts: echter CommonJS-Export vorhanden -> normales require()
const KoPrompts = require(path.join(__dirname, 'vendor', 'ko-prompts.js'));

// KoMarkov: browser-style -> über den Loader
const KoMarkov = loadBrowserStyleModule(
  path.join(__dirname, 'vendor', 'ko-markov.js'),
  'KoMarkov'
);

// ko-indicators.json: eigene, von master_market_data.json GETRENNTE Datei
// im ko-modules-Repo (gefunden 09.09.2026 — indicator_registry_version war
// zuvor ein TODO). Enthält KEINEN aggregatorKey-Wert, sondern eine reine
// Versionsnummer unter _meta.version. Commit-Hash hier bewusst identisch zu
// dem Hash, den ko-indicators-loader.js aktuell in index.html verwendet
// (Stand 09.09.2026: "1027955") — bei künftigen index.html-Updates mit
// neuerem Loader-Hash MUSS dieser Wert mitgezogen werden, sonst driftet die
// hier gemeldete Registry-Version von der tatsächlich im Frontend aktiven
// auseinander.
const KO_INDICATORS_JSON_COMMIT = '1027955';
const KO_INDICATORS_JSON_URL =
  `https://raw.githubusercontent.com/ahsub/ko-modules/${KO_INDICATORS_JSON_COMMIT}/ko-indicators.json`;

async function fetchIndicatorRegistryVersion() {
  try {
    const resp = await fetch(KO_INDICATORS_JSON_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    const version = data?._meta?.version;
    if (!version) throw new Error('_meta.version fehlt in ko-indicators.json');
    return version;
  } catch (err) {
    // Fehlerisoliert wie alle anderen Teilbausteine — ein Netzwerkfehler
    // hier darf den Hauptlauf nicht brechen (§4-Grundsatz).
    return null;
  }
}

// ─── Vendor-Drift-Check (10.09.2026, Punkt 11 Übergabeprotokoll 09.09.2026) ─
// scripts/vendor/ko-prompts.js und ko-markov.js sind Kopien aus dem
// ko-modules-Repo (dort Quelle der Wahrheit) — bisheriges Risiko: können
// stillschweigend veralten, wenn ko-modules sich weiterentwickelt.
//
// BEWUSST KEIN reiner Fetch-at-Runtime-Ersatz für require()/vm: das hätte
// dieselbe "muss von Hand nachgezogen werden"-Schwäche wie der Pin unten
// (s. KO_INDICATORS_JSON_COMMIT-Kommentar oben — ein gepinnter Commit kann
// genauso veralten wie eine Vendor-Kopie) UND würde eine harte Netzwerk-
// Abhängigkeit für etwas zwingend Benötigtes einführen, das heute felsenfest
// lokal vorhanden ist (anders als die rein optionale Indicator-Registry-
// Version oben). Stattdessen: Vendor-Kopie bleibt die tatsächlich
// ausgeführte Quelle, zusätzlich aber gegen den kanonischen Stand
// verglichen — bei Abweichung LAUT warnen statt still zu veralten.
// Netzwerkfehler beim Vergleich selbst dürfen den Hauptlauf nicht brechen
// (§4-Grundsatz, wie bei fetchIndicatorRegistryVersion oben).
const KO_MODULES_VENDOR_DRIFT_COMMIT = 'aa8521c';  // Stand 21.09.2026 (ko-prompts.js v2.53.30, LLM-Auswahl-Drift-Fix)
const KO_MODULES_VENDOR_FILES = ['ko-prompts.js', 'ko-markov.js'];

async function checkVendorDrift() {
  for (const file of KO_MODULES_VENDOR_FILES) {
    try {
      const canonicalUrl =
        `https://raw.githubusercontent.com/ahsub/ko-modules/${KO_MODULES_VENDOR_DRIFT_COMMIT}/${file}`;
      const resp = await fetch(canonicalUrl);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const canonical = await resp.text();
      const local = fs.readFileSync(path.join(__dirname, 'vendor', file), 'utf-8');
      if (canonical === local) {
        console.log(`  ✓ Vendor-Kopie ${file} identisch zu ko-modules@${KO_MODULES_VENDOR_DRIFT_COMMIT}`);
      } else {
        console.warn(`  ⚠ VENDOR-DRIFT: scripts/vendor/${file} weicht von `
          + `ko-modules@${KO_MODULES_VENDOR_DRIFT_COMMIT} ab! Vendor-Kopie aktualisieren `
          + `und KO_MODULES_VENDOR_DRIFT_COMMIT auf den neuen Stand ziehen.`);
      }
    } catch (err) {
      console.warn(`  ⚠ Vendor-Drift-Check für ${file} fehlgeschlagen (Netzwerk?): `
        + `${err.message} — übersprungen, Lauf geht mit lokaler Vendor-Kopie weiter.`);
    }
  }
}

// ─── Konfiguration ─────────────────────────────────────────────────────────

// Die zehn Equity-/KO-Strategien mit eigenem serverseitigen Score-Feld
// (identisch zu STRAT_SCORE_FIELD in index.html, openKiBriefing() —
// Fund B, 07.09.2026, Axel-Entscheidung. NICHT die fünf Options-Strategien,
// die laufen über den separaten runOptionsKiBriefing()-Pfad, s. Abschnitt 9).
const STRAT_SCORE_FIELD = {
  ko:           'sKoLong',
  momentum:     'sMinervini',
  breakout:     'sBreakout',
  vcp:          'sVcp',
  swing:        'sSwing',
  meanrev:      'sMrLong',
  breakdown:    'sBreakdown',
  fading_short: 'sFading',
  dividend:     'sDividend',
  value:        'sValue',
};

const EQUITY_STRATEGIES = Object.keys(STRAT_SCORE_FIELD);

// Sektor-ETF -> Klarname (Teilmenge von SEKTOREN in index.html — nur die für
// den Rotationssignal-Kern relevanten fünf; volle Liste bei Bedarf ergänzbar,
// s. index.html L18095ff für alle 33 Einträge).
const SEKTOR_NAMEN = {
  SMH: 'Halbleiter', XLK: 'Technologie', XLV: 'Gesundheit', XLF: 'Finanzen',
  XLE: 'Energie', XLI: 'Industrie', XLC: 'Kommunikation', XLY: 'Konsum zyklisch',
  XLP: 'Konsum stabil', XLB: 'Materialien', XLRE: 'Immobilien', XBI: 'Biotech',
};

// ─── Baustein 1: QQQ Markov-2.0-Regime ────────────────────────────────────
//
// Live-Yahoo-Fetch (öffentliche Chart-API, kein Auth) + KoMarkov.calc() —
// End-to-End gegen echte Daten verifiziert (09.09.2026). Exakt derselbe
// Pfad wie index.html's Fallback bei Proxy-Ausfall (fetchQqqRegime()),
// nur ohne den my-cors-proxy-Umweg, den Node nicht braucht (kein CORS
// im Server-Kontext).

async function fetchQqqCloses(days = 90) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/QQQ?range=6mo&interval=1d`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!resp.ok) {
    throw new Error(`Yahoo QQQ-Fetch fehlgeschlagen: HTTP ${resp.status}`);
  }
  const data = await resp.json();
  const result = data?.chart?.result?.[0];
  if (!result) throw new Error('Yahoo QQQ-Fetch: unerwartete Antwortstruktur');
  const closes = (result.indicators?.quote?.[0]?.close || []).filter((c) => c != null);
  if (closes.length < 30) {
    throw new Error(`Yahoo QQQ-Fetch: zu wenig Closes (${closes.length}, brauche >=30)`);
  }
  return closes.slice(-days);
}

async function buildQqqMarkovRegime() {
  try {
    const closes = await fetchQqqCloses(90);
    const regime = KoMarkov.calc(closes);
    if (!regime) return { ok: false, reason: 'KoMarkov.calc() lieferte null (zu wenig Daten oder deaktiviert)' };
    return {
      ok: true,
      regime:     regime.regime === 1 ? 'BULL' : regime.regime === -1 ? 'BEAR' : 'SIDE',
      signal:     regime.signal,
      sticky:     regime.sticky,
      filterMode: regime.filterMode,
      warnLevel:  regime.warnLevel,
    };
  } catch (err) {
    // Fehlerisoliert, analog zum Fehlerbehandlungs-Grundsatz in
    // market_aggregator.py (§4: ein Fehler in einem Teilschritt darf den
    // Hauptlauf nie brechen) — Snapshot bekommt ok:false statt den ganzen
    // GHA-Schritt abzubrechen.
    return { ok: false, reason: err.message };
  }
}

// ─── Baustein 2: Sektor-Rotation ───────────────────────────────────────────
//
// Quelle: masterData.sectorRS (bereits von market_aggregator.py berechnet,
// RS_SECTOR_ETFS — heute verifiziert, kein Live-Fetch nötig). Struktur je
// Eintrag: { sym, rs5, ret5, price } (s. index.html loadSektorRS(), KV-Pfad).
// Rotationssignal-Schwellenwerte 1:1 aus openKiBriefing() übernommen
// (Tech/Semis vs. Staples/Health, s. index.html ~L18260ff).

function buildSectorRotation(sectorRS) {
  if (!sectorRS || Object.keys(sectorRS).length < 5) {
    return { ok: false, reason: 'sectorRS fehlt oder hat zu wenig Einträge im Aggregator-Output' };
  }

  const entries = Object.values(sectorRS)
    .filter((s) => s.rs5 != null)
    .map((s) => ({
      sym: s.sym,
      name: SEKTOR_NAMEN[s.sym] || s.sym,
      rs5d: s.rs5,
    }))
    .sort((a, b) => b.rs5d - a.rs5d);

  if (entries.length < 5) {
    return { ok: false, reason: 'sectorRS hat nach Filterung zu wenig verwertbare Einträge' };
  }

  const fmt = (s) => `${s.sym} ${s.rs5d >= 0 ? '+' : ''}${s.rs5d.toFixed(1)}%`;
  const top3 = entries.slice(0, 3).map(fmt);
  const bottom3 = entries.slice(-3).reverse().map(fmt);

  const bySym = Object.fromEntries(entries.map((e) => [e.sym, e.rs5d]));
  const techRS = bySym_get(bySym, 'XLK');
  const semRS  = bySym_get(bySym, 'SMH');
  const stapRS = bySym_get(bySym, 'XLP');
  const hlthRS = bySym_get(bySym, 'XLV');

  let signal;
  if ((stapRS > 2 || hlthRS > 2) && techRS < -2) {
    signal = 'DEFENSIVE_ROTATION';
  } else if (techRS > 2 && semRS > 1) {
    signal = 'OFFENSIVE_ROTATION';
  } else if (techRS < 0) {
    signal = 'LEICHT_DEFENSIV';
  } else {
    signal = 'NEUTRAL';
  }

  return { ok: true, signal, top3, bottom3 };
}

function bySym_get(bySym, sym) {
  return bySym[sym] != null ? bySym[sym] : 0;
}

// ─── Baustein 3: Daily Market Snapshot (Canonical Snapshot, 3.1) ──────────
//
// Strategie-unabhängiger Teil, EINMAL pro Lauf berechnet und an alle zehn
// Equity-/KO-Strategien unverändert weitergegeben (Architekturentscheidung
// von heute: gemeinsame Kontextfunktion statt Doppelarbeit — VIX/Regime/
// Sektor-RS/QQQ-Regime ändern sich nicht pro Strategie).

function buildSnapshotId(now) {
  // Format: SNAP-{YYYYMMDD}-{HHMMSS}Z (s. Spec 3.5 ID-Schema)
  const pad = (n) => String(n).padStart(2, '0');
  const y = now.getUTCFullYear();
  const m = pad(now.getUTCMonth() + 1);
  const d = pad(now.getUTCDate());
  const hh = pad(now.getUTCHours());
  const mm = pad(now.getUTCMinutes());
  const ss = pad(now.getUTCSeconds());
  return `SNAP-${y}${m}${d}-${hh}${mm}${ss}Z`;
}

async function buildDailyMarketSnapshot(masterData) {
  const now = new Date();

  const qqqRegime = await buildQqqMarkovRegime();
  const sectorRotation = buildSectorRotation(masterData.sectorRS);
  const indicatorRegistryVersion = await fetchIndicatorRegistryVersion();

  const snapshot = {
    snapshot_id: buildSnapshotId(now),
    date: masterData.meta?.last_trading_day || now.toISOString().slice(0, 10),
    generated_at: now.toISOString().replace(/\.\d+Z$/, 'Z'),
    aggregator_version: masterData.meta?.version ?? null,
    // Aufgelöst 09.09.2026: eigene Datei ko-indicators.json (ko-modules-Repo),
    // NICHT Teil von master_market_data.json — s. Kommentar bei
    // KO_INDICATORS_JSON_URL oben.
    indicator_registry_version: indicatorRegistryVersion,
    gha_run_id: process.env.GITHUB_RUN_ID ?? null,
    ticker_universe_size: masterData.meta?.total ?? masterData.tickers?.length ?? null,
    mcm_regime: masterData.strategyMeta?.regime ?? null,
    mcm_context_downgrades: masterData.strategyMeta?.context_downgrades ?? [],
    vix: masterData.market?.vixTerm?.vix ?? null,
  };

  if (qqqRegime.ok) {
    snapshot.qqq_markov_regime = {
      regime: qqqRegime.regime,
      signal: qqqRegime.signal,
      sticky: qqqRegime.sticky,
      filterMode: qqqRegime.filterMode,
    };
  } else {
    snapshot.qqq_markov_regime = null;
    snapshot._qqq_markov_error = qqqRegime.reason;
  }

  if (sectorRotation.ok) {
    snapshot.sector_rotation = {
      signal: sectorRotation.signal,
      top3: sectorRotation.top3,
      bottom3: sectorRotation.bottom3,
    };
  } else {
    snapshot.sector_rotation = null;
    snapshot._sector_rotation_error = sectorRotation.reason;
  }

  // DCE (ERGÄNZT 09.09.2026, Zusatzfund) — markt-weiter Wert, bereits von
  // market_aggregator.py berechnet (dce_layer.run_dce()), ohne
  // Zusatzkosten übernommen.
  if (masterData.dce) {
    snapshot.dce = {
      confidence: masterData.dce.confidence ?? null,
      mode: masterData.dce.mode ?? null,
      direction: masterData.dce.direction ?? null,
    };
  } else {
    snapshot.dce = null;
  }

  return snapshot;
}

// ─── Baustein 4: Ticker-Normalisierung (raw KV-Objekt -> Kandidat) ────────
//
// market_aggregator.py liefert je Ticker ein raw-Objekt (master.tickers[]).
// Die Feldnamen weichen an einigen Stellen von denen ab, die
// buildTickerListString() unten erwartet (identisch zum client-seitigen
// topResults-Objekt aus openKiBriefing()) — z.B. heißt es aggregator-seitig
// "ema200"/"ema50"/"high52"/"low52", client-seitig "ma200"/"ma50"/
// "high52w"/"low52w". Diese Funktion überbrückt das, analog zur
// kvToScannerState()-Normalisierung im Client (erster Code-Fund von heute).
//
// WICHTIG, nicht stillschweigend gelöst: Ein Feld in topResults.push()
// (index.html) — `markov` (per-Ticker-Regime aus calcMarkovRegime(raw.closes_full))
// — braucht eine vollständige historische Closes-Reihe PRO TICKER
// (raw.closes_full), nicht nur den aktuellen Snapshot-Wert. Ob
// master_market_data.json das für alle ~716 Ticker mitführt (Payload-Größe!)
// oder nur für eine Teilmenge, konnte ich bisher nicht verifizieren (kein
// Zugriff auf echte Live-Daten). Diese Funktion behandelt closes_full als
// OPTIONAL: wenn vorhanden, werden markov/fibo berechnet; wenn nicht,
// bleiben beide Felder null (die bestehende Formatierungslogik ist an
// beiden Stellen bereits null-sicher, s. `if (r.markov)`/`if(r.fibo)`
// unten — kein Strategiewechsel nötig, nur ggf. weniger Kontext im Prompt).
// `fibo` selbst IST vollständig portiert (detectSwing/calcFiboLevels/
// fiboZone, 09.09.2026 nachgetragen, s. weiter unten im Modul) — nur die
// closes_full-Verfügbarkeit ist der verbleibende offene Punkt, nicht die
// Berechnung selbst.
function normalizeTicker(raw) {
  const n = {
    sym: raw.sym,
    score: raw.score ?? null,
    grade: raw.grade ?? null,
    price: raw.price ?? 0,
    ma200: raw.ema200 ?? null,
    ma50: raw.ema50 ?? null,
    // KORRIGIERT (09.09.2026, echte Daten geprueft): 'sepa'/'sepaScore'
    // existiert serverseitig NIRGENDS (0/735 im echten Aggregator-Output,
    // auch nicht in leaderboards/masterShortlist/valueScanner) — reiner
    // client-seitiger Live-Wert (calcMinerviniSepa() im Browser), den es im
    // GHA-Server-Kontext schlicht nicht gibt. Bleibt bewusst `null` statt
    // eines irrefuehrenden `0` — die SEPA-Zeile in buildTickerListString()
    // wird deshalb jetzt bedingt gerendert (nur wenn vorhanden), s. dort.
    sepa: null,
    // KORRIGIERT (09.09.2026): 'bullCount' existiert nicht — das echte Feld
    // heisst 'bullSignals' (Werte 0-3, 100% Praesenz verifiziert).
    bullCount: raw.bullSignals ?? 0,
    homeMarket: raw.homeMarket || 'US',
    rsi: raw.rsi ?? null,
    atr: raw.atr ?? null,
    hvp: raw.hvp ?? null,
    macdHist: raw.macdHist ?? null,
    histVal: raw.macdHist ?? null, // buildTickerListString liest r.histVal für die MACD-Zeile
    // KORRIGIERT (09.09.2026): 'macdBull' existiert nicht als eigenes Feld
    // — aus macdHist abgeleitet (identische Semantik zur Client-Logik).
    macdBull: raw.macdHist != null ? raw.macdHist > 0 : null,
    obvTrend: raw.obvTrend ?? null,
    obvSlope: raw.obvTrend ?? null,
    volRatio: raw.volRatio ?? null,
    high52w: raw.high52 ?? null,
    low52w: raw.low52 ?? null,
    dist52wHigh: raw.pctFromHigh52 ?? null,
    above50: raw.dist50 != null ? raw.dist50 > 0 : null,
    rsRating: raw.rsRating ?? null,
    rs: raw.rs ?? null, // bestaetigt: existiert serverseitig nie (Live-Scan-only) — Fallback-Zweig bleibt bewusst tot
    tightnessPct: raw.tightnessPct ?? null,
    sma150: raw.sma150 ?? null,
    bbPos: raw.bbPos ?? null,
    overheat: raw.overheat ?? null,
    vcpDetected: raw.vcpDetected || false,
    vcpContractions: raw.vcpContractions ?? null,
    vcpLastPct: raw.vcpLastPct ?? null,
    vcpAvgPrevPct: raw.vcpAvgPrevPct ?? null,
    vcpVolContraction: raw.vcpVolContraction ?? null,
    vcpBreakoutVol: raw.vcpBreakoutVol ?? null,
    ivpPercentile: raw.ivpPercentile ?? null,
    ivpDays: raw.ivpDays ?? null,
    ivpCurIv: raw.ivpCurIv ?? null,
    ivpHv20: raw.ivpHv20 ?? null,
    ivpHv50: raw.ivpHv50 ?? null,
    ivpHv100: raw.ivpHv100 ?? null,
    ivp: raw.ivRank ?? null, // alter HVP-Proxy-Fallback (nur genutzt wenn ivpPercentile fehlt)
    _ivp: (raw.ivAtm != null) ? {
      ivp: raw.ivRank, atmIV: Math.round(raw.ivAtm), isHV: false,
    } : null,
    // Die zehn strategie-eigenen Scores — direkter Passthrough. KORRIGIERT
    // (09.09.2026): sMinervini/sSwing/sMrLong/sBreakout/sBreakdown/sFading/
    // sVcp sind auf dem FLACHEN tickers[]-Array vorhanden (100% verifiziert)
    // — sKoLong/sDividend/sValue dagegen NICHT (0/735!), die existieren
    // ausschliesslich innerhalb der jeweiligen leaderboards[strategie]-
    // Eintraege. `raw` ist deshalb ab jetzt bereits das Ergebnis von
    // mergeTickerSources() (s. selectCandidates), nicht mehr der reine
    // flache Ticker — dort werden leaderboard-Feld und Flach-Feld
    // zusammengefuehrt, sodass dieser Zugriff hier unveraendert funktioniert.
    sMinervini: raw.sMinervini ?? null,
    sSwing: raw.sSwing ?? null,
    sMrLong: raw.sMrLong ?? null,
    sBreakout: raw.sBreakout ?? null,
    sBreakdown: raw.sBreakdown ?? null,
    sFading: raw.sFading ?? null,
    sVcp: raw.sVcp ?? null,
    sKoLong: raw.sKoLong ?? null,
    sDividend: raw.sDividend ?? null,
    sValue: raw.sValue ?? null,
    // Value-Felder — KORRIGIERT (09.09.2026): Quelle ist masterData.valueScanner
    // .shortlist[] (per sym gemergt in mergeTickerSources()), NICHT der rohe
    // Ticker selbst (dort 0% Praesenz fuer alle sechs Felder). pe/pb/roicProxy/
    // revGrowth/fcfYield/grossMargin sind dort 100% (fuer die 50 gelisteten
    // Symbole) verifiziert vorhanden.
    pe: raw.pe ?? null,
    pb: raw.pb ?? null,
    roicProxy: raw.roicProxy ?? null,
    revGrowth: raw.revGrowth ?? null,
    fcfYield: raw.fcfYield ?? null,
    grossMargin: raw.grossMargin ?? null,
    // NEU (09.09.2026, echter Fund): zusaetzliche Value-/Dividend-Felder,
    // die NUR in leaderboards.long_value/long_dividend mitgeliefert werden
    // (nicht in valueScanner.shortlist) — echte, bisher ungenutzte Daten.
    peForward: raw.peForward ?? null,
    roe: raw.roe ?? null,
    analystUpside: raw.analystUpside ?? null,
    ownerEarningsYield: raw.ownerEarningsYield ?? null,
    divYield: raw.divYield ?? null,
    payoutRatio: raw.payoutRatio ?? null,
    debtToEquity: raw.debtToEquity ?? null,
    // IOS Foundation — KORRIGIERT (09.09.2026): Quelle ist masterData
    // .masterShortlist[] (per sym gemergt), NICHT der rohe Ticker/leaderboard-
    // Eintrag (dort beide 0%). Nur fuer die ~20 global kuratierten Symbole
    // ueberhaupt verfuegbar — bei den meisten Kandidaten bleibt das null,
    // das ist normal, kein Fehler (Formatierung ist dafuer bereits
    // null-sicher).
    iosRating: raw.iosRating ?? null,
    iosDecision: raw.iosDecision ?? null,
    iosQuality: raw.iosQuality ?? null,
    iosEntry: raw.iosEntry ?? null,
    scoreLabel: raw.scoreLabel ?? raw.grade ?? null,
    // KORRIGIERT (09.09.2026): '_er' als verschachteltes Objekt existiert
    // nicht — earningsDate/earningsDTE liegen FLACH auf dem Ticker (27%
    // Praesenz, nur wenn ein Earnings-Termin bekannt ist — nicht jeder
    // Ticker hat demnaechst welche, daher <100% korrekt und erwartet).
    er: raw.earningsDTE != null ? { days: raw.earningsDTE, date: raw.earningsDate ?? null } : null,
    // NEU (09.09.2026, echter Fund): server-seitiges Fibonacci-Aequivalent
    // (f_lvls/f_score/f_setup/f_next_p/f_dist_atr, 100% Praesenz) — deutlich
    // wertvoller als mein client-portiertes detectSwing()/calcFiboLevels()
    // unten, das mangels closes_full (0% Praesenz, bestaetigt) in der Praxis
    // NIE greift. Ersetzt NICHT den alten `fibo`-Mechanismus (bleibt als
    // Fallback bestehen, falls closes_full in einer kuenftigen Aggregator-
    // Version doch mitgeliefert wird) — beide Felder existieren parallel.
    fLvls: raw.f_lvls ?? null,
    fNextName: raw.f_next_name ?? null,
    fNextP: raw.f_next_p ?? null,
    fDistAtr: raw.f_dist_atr ?? null,
    fScore: raw.f_score ?? null,
    fSetup: raw.f_setup ?? null,
    fStrike: raw.f_strike ?? null, // nur ~6% Praesenz — nicht jeder Titel hat einen sinnvollen Strike-Vorschlag
    markov: null,
    fibo: null,
  };

  return n;
}

// Per-Ticker-Markov + Fibonacci nachträglich ergänzen (separate Funktion,
// da sie Zugriff auf KoMarkov braucht, das oben im Modul-Scope lebt — hier
// bewusst NICHT in normalizeTicker() selbst, um die Kernnormalisierung
// testbar zu halten ohne KoMarkov jedes Mal mitzuladen).
//
// EHRLICHER STAND (09.09.2026): Fibonacci (detectSwing/calcFiboLevels/
// fiboZone aus index.html) ist HIER NICHT PORTIERT — drei weitere
// Funktionen, deren genauer Fundort ich in dieser Session nicht mehr
// verifiziert habe. `fibo` bleibt deshalb bewusst immer `null` (die
// Formatierung ist dafür bereits null-sicher, s. `if (r.fibo)` oben) statt
// eine Teilimplementierung vorzutäuschen. Per-Ticker-Markov IST portiert,
// da KoMarkov.calc() ohnehin schon für QQQ geladen ist — reine
// Wiederverwendung, kein Zusatzaufwand.
function enrichWithMarkov(candidate, closesFullByCandidate, KoMarkovModule) {
  const closes = closesFullByCandidate;
  if (Array.isArray(closes) && closes.length >= 30) {
    try {
      const m = KoMarkovModule.calc(closes);
      if (m) {
        candidate.markov = {
          regime: m.regime, signal: m.signal,
          sticky: m.sticky, bullSticky: m.bullSticky,
          filterMode: m.filterMode, labelCheck: m.labelCheck,
        };
      }
    } catch (e) {
      // fehlerisoliert — ein einzelner Ticker mit kaputten Closes darf
      // den restlichen Lauf nicht stören
    }
  }
  return candidate;
}

// ─── Baustein 5: Kandidatenauswahl je Strategie ───────────────────────────
//
// UMGEBAUT (09.09.2026, echte Daten geprueft): Primaerquelle ist jetzt
// masterData.leaderboards[strategie] statt eigener Sortierung ueber alle
// 735 Roh-Ticker. Grund: leaderboards ist bereits korrekt nach dem
// jeweiligen Strategie-Score sortiert (verifiziert fuer long_dividend/
// long_value/ko_long/long_minervini) UND enthaelt sKoLong/sDividend/sValue,
// die im flachen tickers[]-Array GAR NICHT existieren (0/735 bestaetigt).
// Die alte "selbst sortieren"-Logik haette fuer ko/dividend/value also
// IMMER auf den Composite-Score zurueckfallen muessen — stiller
// Qualitaetsverlust ohne Fehlermeldung.
//
// leaderboards-Eintraege sind aber KLEINER als der flache Ticker (kein
// bullSignals/earnings*/f_lvls* dort, 0% verifiziert) — deshalb Merge mit
// dem flachen Datensatz (per sym) fuer volle Feldabdeckung, plus Merge mit
// valueScanner.shortlist (pe/pb/roicProxy/revGrowth/fcfYield/grossMargin)
// und masterShortlist (ios*-Felder) — beide ebenfalls nur per sym-Lookup
// erreichbar, nicht auf dem Ticker/leaderboard-Eintrag selbst.
const LEADERBOARD_KEY = {
  ko:           'ko_long',
  momentum:     'long_minervini',
  breakout:     'long_breakout',
  vcp:          'vcp_setups',
  swing:        'long_swing',
  meanrev:      'long_mr',
  breakdown:    'short_breakdown',
  fading_short: 'short_fading',
  dividend:     'long_dividend',
  value:        'long_value',
};

// ─── Options-Strategien (16.09.2026, Thema 3 — Spec Abschnitt 9) ──────────
//
// Eigene Strategieklasse, bewusst NICHT in EQUITY_STRATEGIES/LEADERBOARD_KEY
// hineingemischt (Axel-Entscheidung, Ontologie-Review-Session): Options-
// Strategien haben andere Datenfelder (kein SEPA/Score-Composite, sondern
// RSI/ATR/HVP/IVP/BB-Position) und teils eine andere Score-Zuordnung
// (weekly_income/collar teilen sich sCsp mit csp_wheel, s. market_
// aggregator.py Backlog #64-Kommentar, 16.09.2026).
//
// WICHTIG: UIQ besitzt aktuell KEINE vollstaendige Optionskette — keine
// echten Strike/Delta/Bid-Ask/PoP/Breakeven-Daten. Der einzige "Strike"-
// Wert unten (EMA200-1.5xATR) ist eine bereits im Live-Pfad (index.html
// runOptionsKiBriefing()) verwendete HEURISTIK aus vorhandenen UIQ-Feldern,
// keine echte Optionsketten-Ableitung — 1:1 von dort portiert, nicht neu
// erfunden, mit derselben n/a-Sicherung falls der Wert ueber dem Kurs liegt
// (waere fuer CSP unbrauchbar, bereits im Geld).
const OPTIONS_STRATEGIES = ['csp_wheel', 'atmna', 'weekly_income', 'cc', 'collar'];

const OPTIONS_LEADERBOARD_KEY = {
  csp_wheel:     'options_csp',
  atmna:         'options_atmna',
  weekly_income: 'options_weekly',
  cc:            'options_cc',
  collar:        'options_collar',
};

// s. market_aggregator.py build_leaderboards(): options_atmna nutzt seit
// Backlog #64 (16.09.2026) den eigenen sAtmna-Score, options_weekly/
// options_collar teilen sich bewusst weiterhin sCsp mit options_csp
// (weekly_income: kein konkreter Grund fuer eigene Score-Logik; collar:
// dokumentierte Wissensluecke, s. dortiger Kommentar — NICHT einfach als
// "genauso okay" zu verstehen, aber bewusst nicht Teil dieses Schritts).
const OPTIONS_STRAT_SCORE_FIELD = {
  csp_wheel:     'sCsp',
  atmna:         'sAtmna',
  weekly_income: 'sCsp',
  cc:            'sCc',
  collar:        'sCsp',
};

// Server-seitige Defaults fuer getTargetDteForStrategy() — nutzt die
// bereits bestehende DEFAULT_OPTS_CFG-Konstante (s.o., identisch zu
// index.html getOptionsCfg()s Fallback-Werten), KEINE zweite, unabhaengig
// gepflegte Kopie (waere exakt das Duplikat-Drift-Muster aus der
// Ontologie-Session vom 16.09.2026).

// 1:1 aus index.html getTargetDteForStrategy() portiert (reine Funktion,
// keine DOM-Abhaengigkeit) — ATM/NA hat einen strategie-eigenen, nicht
// konfigurierbaren Zielwert (~30 Tage), die uebrigen nutzen optsCfg.dte.
function getTargetDteForStrategy(stratId, optsCfg) {
  if (stratId === 'atmna') return 30;
  return optsCfg.dte;
}

// 1:1 aus index.html calc3rdFridayExpiration() portiert (reine Funktion).
function calc3rdFridayExpiration(targetDte) {
  targetDte = targetDte || 30;
  const today = new Date();
  const candidateTarget = new Date(today.getTime() + targetDte * 86400000);

  function thirdFridayOfMonth(year, month) {
    const d = new Date(year, month, 1);
    let fridayCount = 0;
    while (true) {
      if (d.getDay() === 5) {
        fridayCount++;
        if (fridayCount === 3) return new Date(d);
      }
      d.setDate(d.getDate() + 1);
      if (d.getMonth() !== month) return null;
    }
  }

  const f1 = thirdFridayOfMonth(candidateTarget.getFullYear(), candidateTarget.getMonth());
  const f2 = thirdFridayOfMonth(candidateTarget.getFullYear(), candidateTarget.getMonth() + 1);
  const f0 = thirdFridayOfMonth(candidateTarget.getFullYear(), candidateTarget.getMonth() - 1);

  const candidates = [f0, f1, f2].filter(Boolean);
  const best = candidates.reduce((a, b) => {
    const diffA = Math.abs((a.getTime() - today.getTime()) / 86400000 - targetDte);
    const diffB = Math.abs((b.getTime() - today.getTime()) / 86400000 - targetDte);
    return diffB < diffA ? b : a;
  });

  const actualDte = Math.round((best.getTime() - today.getTime()) / 86400000);
  const dateStr = best.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { date: best, dateStr, actualDte };
}

function buildLookupMaps(masterData) {
  return {
    bySymFlat: new Map((masterData.tickers || []).map((t) => [t.sym, t])),
    byValueScanner: new Map((masterData.valueScanner?.shortlist || []).map((e) => [e.sym, e])),
    byMasterShortlist: new Map((masterData.masterShortlist || []).map((e) => [e.sym, e])),
  };
}

function mergeTickerSources(entry, maps) {
  const flat = maps.bySymFlat.get(entry.sym) || {};
  // flat zuerst (reichhaltigste Basis: bullSignals/earnings*/f_lvls*), dann
  // der leaderboard-Eintrag druebergelegt (gewinnt bei Ueberschneidung —
  // enthaelt die sonst fehlenden sKoLong/sDividend/sValue).
  const merged = { ...flat, ...entry };

  const valueRow = maps.byValueScanner.get(entry.sym);
  if (valueRow) {
    for (const f of ['pe', 'pb', 'roicProxy', 'revGrowth', 'fcfYield', 'grossMargin']) {
      if (valueRow[f] != null) merged[f] = valueRow[f];
    }
  }

  const msRow = maps.byMasterShortlist.get(entry.sym);
  if (msRow) {
    for (const f of ['iosRating', 'iosDecision', 'iosQuality', 'iosEntry']) {
      if (msRow[f] != null) merged[f] = msRow[f];
    }
  }

  return merged;
}

function selectCandidates(strategy, masterData) {
  const leaderboardKey = LEADERBOARD_KEY[strategy];
  if (!leaderboardKey) {
    throw new Error(`selectCandidates: unbekannte oder Options-Strategie "${strategy}" (nur die 10 Equity-/KO-Strategien werden hier unterstützt)`);
  }

  const maps = buildLookupMaps(masterData);
  const lbEntries = masterData.leaderboards?.[leaderboardKey];

  let mergedRawList;
  if (Array.isArray(lbEntries) && lbEntries.length > 0) {
    mergedRawList = lbEntries.map((e) => mergeTickerSources(e, maps));
  } else {
    // Fallback nur falls leaderboards fehlt/leer ist (sollte im Regelfall
    // nicht vorkommen) — alte Sortierlogik ueber den flachen Bestand.
    console.warn(`  ⚠️  masterData.leaderboards.${leaderboardKey} fehlt oder leer — Fallback auf manuelle Sortierung ueber tickers[]`);
    const scoreField = STRAT_SCORE_FIELD[strategy];
    mergedRawList = (masterData.tickers || []).slice()
      .sort((a, b) => (b[scoreField] ?? -Infinity) - (a[scoreField] ?? -Infinity));
  }

  const normalized = mergedRawList.map((raw) => {
    const candidate = normalizeTicker(raw);
    if (Array.isArray(raw.closes_full)) {
      enrichWithMarkov(candidate, raw.closes_full, KoMarkov);
      enrichWithFibo(candidate, raw.closes_full);
    }
    return candidate;
  });

  // Bereits vom leaderboard korrekt sortiert (bzw. im Fallback-Zweig schon
  // oben sortiert) — kein erneutes Sortieren noetig.
  const top25 = normalized.slice(0, 25);
  const top10 = top25.slice(0, 10);
  const top3Syms = top25.slice(0, 3).map((r) => r.sym); // fürs Ledger — mechanisch, nicht aus KI-Text

  return { top10, top3Syms };
}

// Options-Pendant zu selectCandidates() (16.09.2026). BEWUSST kein
// mergeTickerSources()/normalizeTicker()/Markov/Fibo-Anreicherung: alle
// fuer den Options-Prompt benoetigten Felder (rsi/atr/hvp/dist200/bbPos/
// ema200/ivpPercentile/grade/tightnessPct) sind bereits direkt im
// Leaderboard-Eintrag vorhanden (market_aggregator.py top20()s _core-Liste,
// verifiziert 16.09.2026 gegen den echten Aggregator-Code, nicht anhand
// von Namen vermutet) — die equity-spezifische Mehrfach-Quellen-Anreicherung
// (valueScanner/masterShortlist-Merge, SEPA/Markov/Fibo) ist fuer Options-
// Strategien weder vorhanden noch noetig.
function selectOptionsCandidates(strategy, masterData) {
  const leaderboardKey = OPTIONS_LEADERBOARD_KEY[strategy];
  if (!leaderboardKey) {
    throw new Error(`selectOptionsCandidates: unbekannte Options-Strategie "${strategy}"`);
  }

  const lbEntries = masterData.leaderboards?.[leaderboardKey];
  if (!Array.isArray(lbEntries) || lbEntries.length === 0) {
    console.warn(`  ⚠️  masterData.leaderboards.${leaderboardKey} fehlt oder leer — keine Kandidaten fuer ${strategy}`);
    return { top10: [], top3Syms: [] };
  }

  const top20 = lbEntries.slice(0, 20);
  const top10 = top20.slice(0, 10);
  const top3Syms = top20.slice(0, 3).map((r) => r.sym);

  return { top10, top3Syms };
}

// ─── Baustein 6: tickerList-String (Prompt-Kontext) ───────────────────────
//
// Zeile für Zeile aus openKiBriefing() (index.html) portiert — inkl. der
// IVP-vor-HVP-Priorität, VCP-Detail-vs-Ansatz-Unterscheidung, RS-Rating-vor-
// RS-Priorität und aller heute dokumentierten Feld-Audit-Funde. Bewusst NICHT
// portiert: buildParameterPool()/formatPoolForPrompt() (toter Code, s.
// heutiger Fund — poolData wird im Original nie tatsächlich in den Prompt
// übernommen).
function buildTickerListString(top10) {
  return top10.map((r, i) => {
    let line = `${i + 1}. ${r.sym}`
      + ` Kurs:$${r.price ? r.price.toFixed(2) : '?'}`
      + ` S:${r.score}`
      + ` ${r.bullCount}/3`
      + ` Markt:${r.homeMarket}`;
    // KORRIGIERT (09.09.2026): SEPA existiert serverseitig nie (0/735
    // bestaetigt, reiner Client-Live-Wert) — vorher wurde hier IMMER
    // "SEPA:0" ausgegeben (irrefuehrend, sah wie ein echter Nullwert statt
    // fehlender Daten aus). Jetzt komplett weggelassen statt erfunden,
    // konsistent mit der DATA_LEGENDE-Regel "NIEMALS erfinden".
    if (r.sepa != null) line += ` SEPA:${r.sepa}`;

    if (r.markov) {
      const m = r.markov;
      const reg = m.regime === 1 ? 'BULL' : m.regime === -1 ? 'BEAR' : 'SIDE';
      const sticky = m.sticky || m.bullSticky || 0;
      const sig = m.signal != null ? (m.signal > 0 ? '+' : '') + m.signal.toFixed(2) : null;
      let str = ` Markov2:${reg}(${sticky}%)`;
      if (sig) str += ` σ${sig}`;
      if (m.filterMode) str += ` Filter:${m.filterMode}`;
      if (m.labelCheck && !m.labelCheck.ok) str += ' ⚡LabelWarn';
      line += str;
    }
    if (r.er && r.er.days) line += ` ER:${r.er.days}d`;

    if (r.ma200 && r.price) {
      const d200 = +(((r.price - r.ma200) / r.ma200) * 100).toFixed(1);
      const flag = d200 < -15 ? '🔴' : d200 < -5 ? '🟡' : d200 <= 5 ? '🟢' : d200 < 20 ? '🟡' : '🔴';
      line += ` EMA200-Kurs:$${r.ma200.toFixed(0)}(${d200 >= 0 ? '+' : ''}${d200}%${flag})`;
    }

    // RS-Rating (server-seitig, IBD-Stil) hat Vorrang vor rs (Live-Scan-Rohwert)
    // — Feld-Audit-Fund 07.09.2026, s. Kommentar im Original.
    if (r.rsRating != null) line += ` RS-Rating:${r.rsRating}`;
    else if (r.rs != null) line += ` RS:${r.rs}`;

    if (r.atr && r.price) {
      const strikeCSP = r.ma200 ? (r.ma200 - 1.5 * r.atr).toFixed(2) : null;
      line += ` ATR:$${r.atr.toFixed(2)}`;
      if (strikeCSP && parseFloat(strikeCSP) < r.price) {
        line += ` Strike(EMA200-1.5×ATR):$${strikeCSP}`;
      } else if (strikeCSP) {
        line += ` Strike(EMA200-1.5×ATR):n/a (Formel liefert Wert über Kurs — Titel zu weit unter EMA200 fuer sinnvollen CSP-Strike)`;
      }
    }

    if (r.dist52wHigh != null) line += ` 52W-H:${r.dist52wHigh >= 0 ? '+' : ''}${r.dist52wHigh}%`;
    if (r.pe != null) line += ` PE:${r.pe}`;
    if (r.pb != null) line += ` PB:${r.pb}`;
    if (r.roicProxy != null) line += ` ROIC:${r.roicProxy}%`;
    if (r.revGrowth != null) line += ` RG:${r.revGrowth > 0 ? '+' : ''}${r.revGrowth}%`;
    if (r.fcfYield != null) line += ` FCF-Y:${r.fcfYield}%`;
    if (r.grossMargin != null) line += ` GM:${r.grossMargin}%`;
    // NEU (09.09.2026, echter Fund): zusaetzliche Value-/Dividend-Felder aus
    // leaderboards.long_value/long_dividend (nicht in valueScanner.shortlist
    // enthalten) — echte, bisher ungenutzte Daten, nur bei value/dividend-
    // Kandidaten typischerweise vorhanden.
    if (r.peForward != null) line += ` PEfwd:${r.peForward}`;
    if (r.roe != null) line += ` ROE:${r.roe}%`;
    if (r.analystUpside != null) line += ` AnalystUpside:${r.analystUpside >= 0 ? '+' : ''}${r.analystUpside}%`;
    if (r.ownerEarningsYield != null) line += ` OEY:${r.ownerEarningsYield}%`;
    if (r.divYield != null) line += ` DivY:${r.divYield}%`;
    if (r.payoutRatio != null) line += ` Payout:${r.payoutRatio}%`;
    if (r.debtToEquity != null) line += ` D/E:${r.debtToEquity}`;
    if (r.high52w && r.low52w) line += ` [52W:$${r.low52w.toFixed(0)}-$${r.high52w.toFixed(0)}]`;

    if (r.rsi != null) line += ` RSI:${r.rsi.toFixed(1)}`;
    if (r.histVal != null) line += ` MACD:${r.histVal > 0 ? '+' : ''}${r.histVal.toFixed(3)}`;
    if (r.bbPos != null) line += ` BB:${Math.round(r.bbPos * 100)}%`;
    if (r.ma50 && r.price) {
      const d50 = ((r.price - r.ma50) / r.ma50 * 100).toFixed(1);
      line += ` EMA50:$${r.ma50.toFixed(0)}(${d50}%)`;
    }
    if (r.sma150 && r.price) {
      const d150 = ((r.price - r.sma150) / r.sma150 * 100).toFixed(1);
      line += ` SMA150:$${r.sma150.toFixed(0)}(${d150}%)`;
    }
    // KORRIGIERT (09.09.2026, echte Daten geprueft): volRatio ist bereits
    // ein reines Verhaeltnis (z.B. 1.25 = 1.25x), KEIN Prozentwert — die
    // Division durch 100 war falsch (raw.volRatio:1.25 fuer AVGO
    // verifiziert, nicht 125).
    if (r.volRatio != null) line += ` VolR:${r.volRatio.toFixed(2)}x`;
    if (r.overheat != null && r.overheat > 0) line += ` 🔥Overheat:${r.overheat}`;
    if (r.obvSlope != null) line += ` OBV:${r.obvSlope > 0 ? '▲' : '▼'}${Math.abs(r.obvSlope).toFixed(2)}`;
    if (r.hv10 != null) line += ` hv10:${r.hv10}`;

    // Strategie-Scores kompakt (KV-Modus: direkte s*-Felder, Schwelle >30)
    const stratParts = [];
    if (r.sMinervini > 30) stratParts.push(`SEPA:${r.sMinervini}`);
    if (r.sSwing > 30) stratParts.push(`Swing:${r.sSwing}`);
    if (r.sMrLong > 30) stratParts.push(`MR:${r.sMrLong}`);
    if (r.sBreakdown > 30) stratParts.push(`Short⬇:${r.sBreakdown}`);
    if (r.sFading > 30) stratParts.push(`Fade:${r.sFading}`);
    if (r.sBreakout > 30) stratParts.push(`Breakout:${r.sBreakout}`);
    if (r.sVcp > 30) stratParts.push(`VCP:${r.sVcp}`);
    if (r.sKoLong > 30) stratParts.push(`KO:${r.sKoLong}`);
    if (r.sDividend > 30) stratParts.push(`Div:${r.sDividend}`);
    if (r.sValue > 30) stratParts.push(`Value:${r.sValue}`);
    if (stratParts.length) line += ` [Strat:${stratParts.join('|')}]`;

    if (r.iosRating) {
      line += ` IOS:${r.iosRating}`;
      if (r.iosDecision) {
        const short = r.iosDecision
          .replace('LEADER WAIT PULLBACK', 'LWP')
          .replace('BUY FIRST TRANCHE', 'BFT')
          .replace('SELECTIVE ENTRY', 'SE')
          .replace('WATCHLIST', 'WL')
          .replace('NO BUY', 'NO');
        line += `(${short})`;
      }
      if (r.iosQuality != null) line += ` Q:${r.iosQuality}/E:${r.iosEntry}`;
    }
    if (r.scoreLabel) line += ` Grade:${r.scoreLabel}`;
    if (r.fibo) line += ` Fibo:${r.fibo.zone}(${r.fibo.retrace}%)`;
    // NEU (09.09.2026, echter Fund): server-seitiges Fibonacci-Aequivalent,
    // 100% Praesenz (ersetzt in der Praxis das obige `fibo`-Feld, das ohne
    // closes_full nie greift — beide Mechanismen bleiben parallel bestehen,
    // s. Kommentar in normalizeTicker()).
    if (r.fSetup) {
      line += ` FiboSrv:${r.fSetup}`;
      if (r.fNextName) line += `(${r.fNextName}@$${r.fNextP})`;
      if (r.fScore != null) line += ` Score:${r.fScore}`;
      if (r.fStrike != null) line += ` Strike:$${r.fStrike}`;
    }

    if (r.vcpDetected) {
      line += ` VCP✓(${r.vcpContractions || 0}x,letzte:${r.vcpLastPct}%`;
      if (r.vcpAvgPrevPct != null) line += `,⌀vorherige:${r.vcpAvgPrevPct.toFixed(1)}%`;
      if (r.vcpVolContraction != null) line += `,VolKontr:${r.vcpVolContraction.toFixed(2)}`;
      if (r.vcpBreakoutVol != null) line += `,BrkVol:${r.vcpBreakoutVol.toFixed(2)}x`;
      line += ')';
    } else if (r.vcpContractions != null) {
      line += ` VCP-Ansatz(${r.vcpContractions}x, kein vollst. VCP)`;
    }
    if (r.tightnessPct != null) line += ` Tightness:${r.tightnessPct.toFixed(1)}%`;

    // IVP (echt) hat Vorrang vor dem alten HVP-Proxy — konsistent mit
    // ko-prompts.js v2.46.0 ("IVP wo verfuegbar primaer, HVP nur Fallback")
    if (r.ivpPercentile != null) {
      line += ` IVP:${r.ivpPercentile}%ile`;
      if (r.ivpDays != null) line += `(${r.ivpDays}T)`;
      if (r.ivpCurIv != null) line += ` IV:${r.ivpCurIv}%`;
      if (r.ivpHv20 != null || r.ivpHv50 != null || r.ivpHv100 != null) {
        const hvParts = [];
        if (r.ivpHv20 != null) hvParts.push(`20:${r.ivpHv20}`);
        if (r.ivpHv50 != null) hvParts.push(`50:${r.ivpHv50}`);
        if (r.ivpHv100 != null) hvParts.push(`100:${r.ivpHv100}`);
        line += ` HV(${hvParts.join('/')})`;
      }
    } else if (r._ivp != null) {
      const ivpVal = r._ivp.ivp;
      const ivpLabel = r._ivp.isHV ? 'HVP' : 'IVP';
      line += ` ${ivpLabel}:${ivpVal}%`;
      if (r._ivp.atmIV) line += `(IV${r._ivp.atmIV}%)`;
      if (r.markov && r.markov.signal != null && ivpVal != null) {
        const sig = r.markov.signal;
        const filter = r.markov.filterMode || '';
        if (sig > 0.15 && ivpVal > 50) line += ' ★CSP-Setup(BullSignal+HohesIV)';
        else if (sig > 0.15 && ivpVal < 30) line += ' ⚠CSP-Vorsicht(BullSignal+NiedrigesIV)';
        else if (sig < -0.15 && ivpVal > 60) line += ' ★PutDebit-Setup(BearSignal+HohesIV)';
        else if (filter === 'FLAT') line += ' →FLAT(keinMarkovSignal)';
      }
    } else if (r.ivp != null) {
      line += ` HVP:${r.ivp}% (Historical Vol Percentile)`;
    }

    return line;
  }).join('\n');
}

// Options-Pendant zu buildTickerListString() (16.09.2026, Thema 3). 1:1 aus
// index.html runOptionsKiBriefing()s Ticker-Zeilen-Aufbau portiert (gleiche
// Feldpriorität, gleiche Strike-Heuristik samt n/a-Sicherung) — KEINE neuen
// Felder erfunden, nur was der Live-Pfad bereits nutzt und was tatsächlich
// im Leaderboard-Eintrag vorhanden ist (_core-Liste, market_aggregator.py
// top20(), verifiziert 16.09.2026).
function buildOptionsTickerListString(top10) {
  return top10.map((t, i) => {
    const volLabel = (t.ivpPercentile != null) ? `IVP:${t.ivpPercentile}%ile`
                    : (t.hvp != null)          ? `HVP:${t.hvp}%`
                    : 'Vol:--';

    const rawStrike = (t.ema200 != null && t.atr != null) ? (t.ema200 - 1.5 * t.atr) : null;
    const strikeTxt = (rawStrike != null && rawStrike < t.price)
      ? ` Strike(EMA200-1.5xATR):$${rawStrike.toFixed(2)}`
      : (rawStrike != null) ? ' Strike(EMA200-1.5xATR):n/a(Wert über Kurs)' : '';

    return `${i + 1}. ${t.sym}`
      + ` Kurs:$${t.price != null ? t.price : '--'}`
      + ` ${volLabel}`
      + ` RSI:${t.rsi != null ? Math.round(t.rsi) : '--'}`
      + ` ATR:${t.atr != null ? t.atr : '--'}`
      + ` D200:${t.dist200 != null ? t.dist200 + '%' : '--'}`
      + strikeTxt
      + ` Grade:${t.grade || '--'}`;
  }).join('\n');
}

// ─── Fibonacci-Zone (portiert aus index.html, 09.09.2026 nachgetragen) ────
//
// Pure Funktionen, keine DOM-Abhängigkeit — 1:1 aus index.html L17084-17165
// übernommen. Bewusst NICHT verändert (auch nicht die für sich genommen
// etwas ungewöhnliche Swing-Erkennungslogik), um exakte Prompt-Parität zum
// Live-Client zu behalten.
function detectSwing(closes) {
  if (!closes || closes.length < 20) return null;
  const n = closes.length;

  const lookback = Math.min(60, n - 1);
  let swingHigh = -Infinity, swingHighIdx = -1;
  for (let i = n - lookback; i < n; i++) {
    if (closes[i] > swingHigh) { swingHigh = closes[i]; swingHighIdx = i; }
  }

  let swingLow = Infinity, swingLowIdx = -1;
  for (let i = swingHighIdx; i < n; i++) {
    if (closes[i] < swingLow) { swingLow = closes[i]; swingLowIdx = i; }
  }

  if (swingLowIdx <= swingHighIdx || swingHighIdx === n - 1) {
    swingLow = Infinity;
    for (let i = Math.max(0, n - lookback); i <= swingHighIdx; i++) {
      if (closes[i] < swingLow) { swingLow = closes[i]; swingLowIdx = i; }
    }
    return { high: swingHigh, low: swingLow, direction: 'up', highIdx: swingHighIdx, lowIdx: swingLowIdx };
  }

  return { high: swingHigh, low: swingLow, direction: 'down', highIdx: swingHighIdx, lowIdx: swingLowIdx };
}

function calcFiboLevels(swing) {
  const diff = swing.high - swing.low;
  if (swing.direction === 'down') {
    return {
      p0: swing.high, p236: swing.high - diff * 0.236, p382: swing.high - diff * 0.382,
      p500: swing.high - diff * 0.500, p618: swing.high - diff * 0.618,
      p786: swing.high - diff * 0.786, p100: swing.low, direction: 'down',
    };
  }
  return {
    p0: swing.low, p236: swing.low + diff * 0.236, p382: swing.low + diff * 0.382,
    p500: swing.low + diff * 0.500, p618: swing.low + diff * 0.618,
    p786: swing.low + diff * 0.786, p100: swing.high, direction: 'up',
  };
}

function fiboZone(price, levels) {
  if (levels.direction === 'down') {
    if (price >= levels.p382 && price <= levels.p618) return 'buy';
    if (price > levels.p236 && price < levels.p382) return 'watch';
    if (price < levels.p618 && price >= levels.p786) return 'watch';
    if (price > levels.p618) return 'early';
    return 'deep';
  }
  if (price >= levels.p382 && price <= levels.p500) return 'buy';
  if (price > levels.p236 && price < levels.p382) return 'watch';
  if (price > levels.p500 && price <= levels.p618) return 'watch';
  if (price < levels.p236) return 'early';
  return 'deep';
}

function enrichWithFibo(candidate, closesFull) {
  if (!Array.isArray(closesFull) || closesFull.length < 20) return candidate;
  try {
    const swing = detectSwing(closesFull);
    if (!swing) return candidate;
    const levels = calcFiboLevels(swing);
    const price = closesFull[closesFull.length - 1];
    const zone = fiboZone(price, levels);
    const retrace = swing.direction === 'down'
      ? Math.round((swing.high - price) / (swing.high - swing.low) * 100)
      : Math.round((price - swing.low) / (swing.high - swing.low) * 100);
    candidate.fibo = { zone, retrace, direction: swing.direction };
  } catch (e) {
    // fehlerisoliert, wie enrichWithMarkov
  }
  return candidate;
}

// ─── Baustein 7: Marktkontext-String + Prompt-Aufruf ──────────────────────

// getOptionsCfg()-Defaults aus index.html (L21070) — dort liest die
// Funktion aus localStorage, das es im GHA-Kontext nicht gibt. Diese
// Konstante ist exakt der Fallback-Zweig der Originalfunktion (leeres
// localStorage). Wird an KoPrompts.get() durchgereicht, auch für die zehn
// Equity-/KO-Strategien (der Client tut das genauso — nur die
// options-spezifischen Prompt-Zweige lesen die Werte tatsächlich aus).
const DEFAULT_OPTS_CFG = {
  minPrice: 15, maxPrice: 150, minHvp: 30, goodHvp: 50, idealHvp: 70,
  erDays: 30, dte: 30,
};

// 1:1 aus openKiBriefing() (index.html) übernommen — die Feldlegende, die
// der KI vor der Ticker-Liste erklärt, was welches Kürzel bedeutet.
const DATA_LEGENDE = 'FELDERKLÄRUNG (NUR diese Felder sind verfügbar — nichts anderes verwenden!):\n'
  + '  Kurs:$XX       = aktueller Handelskurs aus Scanner (EINZIGE Kursquelle)\n'
  + '  S:XX           = Composite Score 0-100\n'
  + '  X/3            = Bullish-Signale (MACD/OBV/MA50)\n'
  + '  Markt:XX       = Handelsboerse/-zeit des Titels: US (NYSE/NASDAQ/OTC — GILT AUCH für ADRs nicht-amerikanischer Unternehmen wie SAP/ASML/RIO, da diese selbst auf US-Boersen handeln!) oder DE/FR/NL/IT/CH/UK/DK/SE/AU (Heimatboerse). Massgeblich fuer Zeitzonen-/Gap-Risiko ist AUSSCHLIESSLICH dieses Feld — NIEMALS aus dem Tickersymbol selbst erraten (z.B. Ticker "DE" = Deere & Co., NYSE, NICHT das Laenderkuerzel Deutschland).\n'
  + '  Markov2:REG(X%) σ±Y = Markov 2.0 Regime (Stride-sampled, statistisch korrekt). REG=BULL/BEAR/SIDE, X%=Stickiness (Persistenz des Regimes), σ=Signal (-1 bis +1: positiv=bullisch, negativ=bärisch)\n'
  + '  Filter:LONG_OK/SHORT_OK/FLAT = Markov 2.0 Filter-Mode. LONG_OK: Signal stark genug für Longs. FLAT: kein klares Signal → keine neuen Positionen empfohlen\n'
  + '  ★CSP-Setup = Markov bullisch UND IV hoch → optimales Prämien-Verkauf Setup\n'
  + '  ★PutDebit-Setup = Markov bärisch UND IV hoch → Put-Kauf mit Prämienunterstützung\n'
  + '  ⚡LabelWarn = Markov Label-Verifikation fehlgeschlagen → Regime-Signal mit Vorsicht interpretieren\n'
  + '  ER:Xd          = Earnings in X Tagen\n'
  + '  EMA200-Kurs:$XX= 200-Tage-EMA Kurswert (≠ Handelskurs!)\n'
  + '  RS-Rating:XX   = Relative Staerke-Rating vs Gesamtmarkt, IBD-Stil-Perzentil-Rating (0-99, hoeher=staerker)\n'
  + '  RS:XX          = Relative Performance vs S&P500 in % (Live-Scan-Modus, ROH-Prozentwert, kann negativ sein — NICHT mit RS-Rating verwechseln)\n'
  + '  52W-H:X%       = Abstand vom 52-Wochen-Hoch\n'
  + '  HVP:XX%        = Historical Volatility Percentile (NÄHERUNG — kein echter IV-Rank!). >50%: erhöhte Vola → CSP-Prämien tendenziell höher. <30%: niedrige Vola → CSP meiden. Wenn HVP fehlt: NIEMALS IV-Wert erfinden.\n'
  + '  Fibo:zone(X%)  = Fibonacci-Zone\n'
  + '  FiboSrv:SETUP(NAME@$P) Score:X Strike:$Y = server-seitiges Fibonacci-Setup (z.B. CSP_ZONE), naechstes relevantes Level mit Name+Preis, Score 0-100, optionaler Strike-Vorschlag (nur bei manchen Titeln)\n'
  + '  PEfwd:XX / ROE:XX% / AnalystUpside:+XX% / OEY:XX% = zusaetzliche Value-Kennzahlen (Forward-KGV, Eigenkapitalrendite, Analysten-Kursziel-Abstand, Owner-Earnings-Rendite) — nur bei manchen Value-/Dividend-Kandidaten vorhanden\n'
  + '  DivY:XX% / Payout:XX% / D/E:X = Dividendenrendite, Ausschuettungsquote, Verschuldungsgrad — nur bei manchen Dividend-Kandidaten vorhanden\n'
  + '  VCP✓(Nx,letzte:X%,⌀vorherige:Y%,VolKontr:Z,BrkVol:W) = Volatility-Contraction-Pattern bestaetigt: N Kontraktionen, letzte Kontraktion X% Kursspanne (Y%=Durchschnitt der vorherigen Kontraktionen, zum Vergleich ob die Kontraktion enger wird), VolKontr=Volumen-Kontraktionsfaktor, BrkVol=Volumen-Multiplikator am (potenziellen) Ausbruchstag\n'
  + '  VCP-Ansatz(Nx, kein vollst. VCP) = Kontraktionsmuster erkannt, aber Tightening-Kriterium NICHT erfuellt — NIEMALS als bestaetigtes VCP werten\n'
  + '  Tightness:X%   = Kurs-Tightness-Kennzahl (je niedriger, desto enger die juengste Konsolidierung)\n'
  + '  IVP:XX%ile(YT) IV:Z% HV(20:A/50:B/100:C) = echtes IV-Perzentil (Y=Tage Historie), aktuelle IV, dahinterliegende historische Volatilitaeten ueber 20/50/100 Tage (Referenz zur Einordnung, ob Vola kurzfristig oder strukturell erhoeht/erniedrigt ist)\n'
  + '  SMA150:$XX(Y%) = 150-Tage-Linie (Minervini Stage-2-Kriterium), Y%=Abstand Kurs zur Linie\n'
  + '  [Strat:...]    = Strategie-Fit-Scores (>30) fuer: SEPA=Minervini, Swing=Swing-Pullback, MR=Mean-Reversion, Short⬇=Breakdown, Fade=Fading-Short, Breakout=Breakout, VCP=VCP-Setup-Score (numerischer Fit, ergaenzt die VCP✓-Detailmetriken oben), KO=KO-Zertifikat-Long, Div=Dividend-Growth, Value=Value\n'
  + 'NICHT VERFÜGBAR (niemals erfinden): EPS, Umsatz (ausser Value-/Dividend-Kandidaten mit expliziten Feldern oben)\n\n';

// Sektor-Rotationswarnung — 1:1-Logik aus openKiBriefing() übernommen
// (dieselben Schwellenwerte, dieselbe Handlungsregel-Textinjektion).
function buildSektorStrAndWarning(sectorRotation) {
  if (!sectorRotation) return { sektorStr: '', rotationWarning: '' };

  const { signal, top3, bottom3 } = sectorRotation;
  const rotLabels = {
    DEFENSIVE_ROTATION: '⚠️ DEFENSIV-ROTATION AKTIV — Kapital flieht aus Tech/Semis in Defensive. Risk-OFF.',
    OFFENSIVE_ROTATION: '✅ OFFENSIV-ROTATION — Tech/Semis führen, Risk-ON Umfeld.',
    LEICHT_DEFENSIV: '⚡ LEICHT DEFENSIV — Tech schwächer als SPY, selektiv vorgehen.',
    NEUTRAL: 'NEUTRAL — keine klare Sektorrotation.',
  };

  let rotationWarning = '';
  if (signal === 'DEFENSIVE_ROTATION') {
    rotationWarning = '\n\nKRITISCHE HANDLUNGSREGEL: Aktive Defensiv-Rotation — KEINE neuen Long-Positionen in Tech/Semis/AI empfehlen. Nur defensive oder nicht-korrelierte Sektoren berücksichtigen. KO-Abstand auf ≥25% erhöhen.';
  } else if (signal === 'LEICHT_DEFENSIV') {
    rotationWarning = '\n\nHINWEIS: Tech underperformt SPY — nur die stärksten Einzeltitel mit 3/3 Signal empfehlen.';
  }

  const sektorStr = '\n\nSEKTOR-RS 5d vs SPY (PRIMÄRES MARKTSIGNAL):\n'
    + `Rotations-Signal: ${rotLabels[signal] || rotLabels.NEUTRAL}\n`
    + `Top-3: ${top3.join(', ')}\n`
    + `Bottom-3: ${bottom3.join(', ')}`;

  return { sektorStr, rotationWarning };
}

function buildQqqMarkovStr(qqqRegime) {
  if (!qqqRegime) return '';
  const sig = qqqRegime.signal != null ? (qqqRegime.signal > 0 ? '+' : '') + qqqRegime.signal.toFixed(2) : '—';
  const sticky = qqqRegime.sticky || 0;
  return `- QQQ Markov 2.0: ${qqqRegime.regime}(${sticky}% Stickiness) σ${sig} → Filter:${qqqRegime.filterMode || 'FLAT'}\n`;
}

// Setzt den kompletten marktkontext-String zusammen — Reihenfolge und
// Formulierung 1:1 aus openKiBriefing() (index.html), NUR die drei
// bewusst ausgeschlossenen Bausteine (Breadth/Sektor-Overheat/Bull-Score,
// s. heutige Entscheidung) fehlen hier bewusst.
function buildMarktkontext(snapshot, tickerListStr, top10Count) {
  const { sektorStr, rotationWarning } = buildSektorStrAndWarning(snapshot.sector_rotation);
  const qqqMarkovStr = buildQqqMarkovStr(snapshot.qqq_markov_regime);
  const vixStr = snapshot.vix != null ? snapshot.vix.toFixed(1) : 'unbekannt';

  const heute = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' });

  const marktkontext = `HEUTIGES DATUM: ${heute}\n\n`
    + DATA_LEGENDE
    + `TOP ${top10Count} SCANNER-ERGEBNISSE:\n`
    + tickerListStr + '\n\n'
    + 'MARKTKONTEXT:\n'
    + `- QQQ-Regime: ${snapshot.qqq_markov_regime ? snapshot.qqq_markov_regime.regime : 'unbekannt'}\n`
    + qqqMarkovStr
    + `- VIX: ${vixStr}${parseFloat(vixStr) > 20 ? ' ⚠️ ERHÖHT — erhöhte Vorsicht geboten' : ' (normal)'}\n`
    + sektorStr
    + rotationWarning;

  return { marktkontext, vixStr };
}

// Baut den fertigen Prompt für eine der zehn Equity-/KO-Strategien.
// isEic ist im Public-Modus IMMER false (s. Spec Abschnitt 6, Fix
// 29.08.2026 in ko-prompts.js v2.6.0 — muss für ALLE Strategien explizit
// gesetzt werden, sonst undefined).
function buildPromptForStrategy(strategy, snapshot, tickerListStr, top10Count) {
  const { marktkontext, vixStr } = buildMarktkontext(snapshot, tickerListStr, top10Count);
  const ctx = { marktkontext, vixStr, optsCfg: DEFAULT_OPTS_CFG, isEic: false, mode: 'public' };
  const prompt = KoPrompts.get(strategy, ctx);
  if (!prompt) {
    throw new Error(`KoPrompts.get("${strategy}", ctx) lieferte null — unbekannte Strategie-ID?`);
  }
  return prompt;
}

// Options-Pendant zu buildMarktkontext() (16.09.2026). Kein Sektor-Rotation/
// QQQ-Markov-Block (die equity-spezifischen Bausteine oben) — stattdessen
// das ZIEL-VERFALLSDATUM, das der Live-Pfad (runOptionsKiBriefing()) allen
// fünf Options-Prompts mitgibt, damit die KI nicht selbst rechnen muss
// (Datums-Arithmetik ohne harten Anker ist fuer Sprachmodelle unzuverlaessig
// — s. der bereits bestehende v350-Fix-Kommentar in index.html).
function buildOptionsMarktkontext(snapshot, tickerListStr, strategy, optsCfg) {
  const vixStr = snapshot.vix != null ? snapshot.vix.toFixed(1) : 'unbekannt';
  const heute = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long' });
  const targetDte = getTargetDteForStrategy(strategy, optsCfg);
  const expInfo = calc3rdFridayExpiration(targetDte);

  const marktkontext = `HEUTIGES DATUM: ${heute}\n\n`
    + 'MARKTKONTEXT:\n'
    + `VIX: ${vixStr}${parseFloat(vixStr) > 20 ? ' ⚠️ ERHÖHT — erhöhte Vorsicht geboten' : ' (normal)'}\n\n`
    + `OPTIONS-KANDIDATEN aus dem ${OPTIONS_LEADERBOARD_KEY[strategy]}-Leaderboard (Top-${tickerListStr.split('\n').length}):\n`
    + tickerListStr
    + `\n\nZIEL-VERFALLSDATUM (bereits berechnet, NICHT selbst berechnen): `
    + `${expInfo.dateStr} (Freitag, ${expInfo.actualDte} Tage ab heute) — dieses Datum in der Analyse verwenden.`;

  return { marktkontext, vixStr };
}

// Baut die BB-/Tightness-Zusammenfassung für die Top-3-Kandidaten einer
// Options-Strategie (16.09.2026, ATMNA-Explainability-Gap-Fix, Teil 2 —
// die eigentliche Datenanbindung zum in ko-prompts.js v2.53.29 bereits
// vorbereiteten deterministischen Faktor-Block). Nur für atmna relevant
// (s. OPTIONS_STRATEGY_SIGNAL_MAP — atmna ist die einzige Options-
// Strategie mit tightnessPct als eigenem Signalfeld). bbPos/tightnessPct
// stehen direkt auf den rohen Leaderboard-Einträgen (top10), keine
// Normalisierung/Merge nötig, s. Kommentar bei selectOptionsCandidates().
//
// Umrechnung 1:1 aus buildTickerListString() übernommen (dort bereits
// verifiziert: bbPos ist 0-1-normiert (*100 für %), tightnessPct liegt
// bereits in Prozentpunkten (.toFixed(1), kein *100)) — dieselben
// Aggregator-Felder, keine separate Semantik für den Options-Pfad zu
// erwarten. Sicherheitshalber trotzdem eine Plausibilitätswarnung, falls
// ein bbPos-Wert klar außerhalb des 0-1-Bereichs liegt (Reviewer-Hinweis
// 20.09.2026, vgl. euer eigenes "nie stillschweigend vertrauen"-Prinzip).
//
// FEHLT ein Top-3-Kandidat in top10 (sollte laut Aufrufkontrakt nicht
// vorkommen — top3Syms wird direkt aus top10 abgeleitet, s. selectOptions
// Candidates()), wird das NICHT stillschweigend als fehlender Faktor
// behandelt, sondern als Datenintegritätsfehler geworfen (Reviewer-Punkt
// 20.09.2026) — landet über runStrategy()s bestehendes try/catch als
// { ok:false, error } für GENAU diese eine Strategie, ohne die übrigen
// 14 Strategien oder den Gesamtlauf zu beeinträchtigen.
function buildAtmnaFactorsSummary(top10, top3Syms) {
  if (!top3Syms || top3Syms.length === 0) return null;

  const bySym = new Map(top10.map((c) => [c.sym, c]));
  const missing = top3Syms.filter((sym) => !bySym.has(sym));
  if (missing.length > 0) {
    throw new Error(
      `buildAtmnaFactorsSummary: ${missing.length} Top-Kandidat(en) `
      + `(${missing.join(', ')}) nicht in top10 gefunden — `
      + `Datenintegritätsfehler zwischen top3Syms und top10.`
    );
  }

  const parts = top3Syms.map((sym) => {
    const c = bySym.get(sym);
    let bb = 'n/a';
    if (c.bbPos != null) {
      if (c.bbPos > 1.5) {
        // Plausibilitätswarnung statt stillschweigender Fehlrechnung: ein
        // Wert deutlich über 1 spricht gegen die erwartete 0-1-Normierung.
        console.warn(`  ⚠ buildAtmnaFactorsSummary: bbPos für ${sym} = ${c.bbPos} `
          + `— außerhalb des erwarteten 0-1-Bereichs, wird als bereits-Prozent `
          + `behandelt statt erneut mit 100 multipliziert.`);
        bb = `${Math.round(c.bbPos)}%`;
      } else {
        bb = `${Math.round(c.bbPos * 100)}%`;
      }
    }
    const tight = (c.tightnessPct != null) ? `${c.tightnessPct.toFixed(1)}%` : 'n/a';
    return `${sym}: BB ${bb}, Tightness ${tight}`;
  });
  return parts.join(' | ');
}

// Baut den Repair-Prompt fuer den REPAIR-Loop (v1.7, 20.09.2026,
// ATMNA-Explainability-Gap-Fix Teil 3). Logik 1:1 identisch zu ko-ai.js
// v1.25s buildRepairPrompt() (dort entstanden nach demselben Live-Test-
// Fund: "nicht verfuegbar" statt der von KoPrompts.validateBriefingCompliance()
// woertlich verlangten Formulierung "nicht verifiziert") — HIER zwangslaeufig
// dupliziert, weil KoPrompts diese Prompt-Bau-Funktion nicht exportiert
// (nur validateBriefingCompliance() selbst ist Teil der oeffentlichen API).
// Bekannte, bewusst in Kauf genommene Wartungslast: bei kuenftigen Aenderungen
// an dieser Logik muss diese Kopie UND die in ko-ai.js von Hand synchron
// gehalten werden (dieselbe Klasse von Risiko wie schon bei der vendor/
// ko-prompts.js-Kopie selbst, s. checkVendorDrift() oben).
// ERWEITERT (v1.10, 21.09.2026, LLM-Auswahl-Drift-Fix): neuer optionaler
// 4. Parameter `details` — s. identischer Kommentar in ko-ai.js v1.26
// buildRepairPrompt() fuer den vollstaendigen Kontext.
function buildRepairPrompt(strategy, missing, originalText, details) {
  const missingDesc = missing.join(', ');
  const hints = [];

  if (missing.includes('optionsmarkt-validierungsstatus')) {
    hints.push(
      '- Für "optionsmarkt-validierungsstatus": Verwende im Text ' +
      'WÖRTLICH die Formulierung "nicht verifiziert". ' +
      'Nicht durch "nicht verfügbar", "nicht geprüft" oder andere ' +
      'Umschreibungen ersetzen.'
    );
  }

  if (
    missing.includes('bollinger-position') ||
    missing.includes('tightness')
  ) {
    hints.push(
      '- Für "bollinger-position"/"tightness": Verwende die Begriffe ' +
      '"Bollinger-Position" und "Tightness" WÖRTLICH.'
    );
  }

  if (missing.includes('top3-ticker-konsistenz') && details && details.top3Mismatch) {
    const { expected, missingTickers, unexpectedTickers } = details.top3Mismatch;
    hints.push(
      '- Für "top3-ticker-konsistenz": Für ' + strategy + ' ist die ' +
      'Kandidatenauswahl deterministisch vorgegeben. Die verbindlichen ' +
      'drei Kandidaten für Abschnitt 3 sind: ' + expected.join(', ') + '. ' +
      'Deine vorherige Antwort verwendete stattdessen ' +
      (unexpectedTickers.length ? unexpectedTickers.join(', ') : '(unvollständige Liste)') +
      '. Das ist nicht zulässig. Ersetze ' +
      (unexpectedTickers.length ? unexpectedTickers.join(', ') : 'die falschen Ticker') +
      ' durch ' + (missingTickers.length ? missingTickers.join(', ') : 'die fehlenden Ticker') +
      '. Verwende in Abschnitt 3 EXAKT: ' + expected.join(', ') + '. ' +
      'Falls einer der vorgegebenen Kandidaten zuvor als "erfüllt die ' +
      'Kriterien nicht" dargestellt wurde, entferne diese Aussage — die ' +
      'Kandidatenauswahl selbst steht nicht zur Debatte, nur ihre ' +
      'Erläuterung.'
    );
  }

  const hintText = hints.length
    ? '\n\nWICHTIG — exakter Wortlaut:\n' + hints.join('\n')
    : '';

  return (
    'Deine vorherige Antwort zur Strategie "' + strategy +
    '" ließ folgende Pflichtangabe(n) aus: ' + missingDesc +
    '. Hier ist deine vorherige Antwort:\n\n' +
    '---\n' + originalText + '\n---\n\n' +
    'Ergänze GENAU die fehlende(n) Pflichtangabe(n) an der dafür ' +
    'vorgesehenen Stelle (Abschnitt 3 für den Optionsmarkt-' +
    'Validierungsstatus bzw. die verbindlichen Top-3-Kandidaten, ' +
    'Abschnitt 4 für Bollinger-Position/Tightness bei atmna). Ändere ' +
    'sonst NICHTS an der Antwort, auch nicht Formulierungen, ' +
    'Reihenfolge oder Länge anderer Abschnitte.' +
    hintText +
    '\nGib die VOLLSTÄNDIGE, korrigierte Antwort zurück, nicht nur ' +
    'den Zusatz und nicht nur den betroffenen Abschnitt.'
  );
}

// Options-Pendant zu buildPromptForStrategy() (16.09.2026, Thema 3).
// isEic ist im Public-Digest-Pfad IMMER false — dieser Lauf erzeugt
// ausschliesslich den nächtlichen, für alle Nutzer identischen Public-
// Output, nie einen Owner-/EIC-spezifischen.
//
// ERWEITERT (20.09.2026, ATMNA-Explainability-Gap-Fix, Teil 2): top10/
// top3Syms als neue Parameter — Voraussetzung für buildAtmnaFactorsSummary().
// Nur bei strategy==='atmna' wird ctx.atmnaFactors gesetzt (ko-prompts.js
// v2.53.29s _deterministicOptionsFactBlock() liest dieses Feld ohnehin nur
// für stratId==='atmna'), die übrigen vier Options-Strategien bleiben
// unverändert ohne ctx.atmnaFactors.
function buildOptionsPromptForStrategy(strategy, snapshot, tickerListStr, top10, top3Syms) {
  const { marktkontext, vixStr } = buildOptionsMarktkontext(snapshot, tickerListStr, strategy, DEFAULT_OPTS_CFG);
  const ctx = { marktkontext, vixStr, optsCfg: DEFAULT_OPTS_CFG, isEic: false, mode: 'public' };
  // NEU (v1.10, 21.09.2026, LLM-Auswahl-Drift-Fix): top3Syms fuer ALLE
  // fuenf Options-Strategien an ctx durchreichen (nicht nur atmnaFactors
  // fuer atmna) — ko-prompts.js v2.53.30 injiziert daraus die verbindliche
  // Top-3-Kandidatenliste in den deterministischen Faktor-Block, damit das
  // Modell die bereits getroffene Score-Rang-Entscheidung nicht mehr durch
  // eine eigene Auswahl ersetzen kann (s. dortiger Changelog-Eintrag).
  ctx.top3Syms = top3Syms;
  if (strategy === 'atmna') {
    ctx.atmnaFactors = { summary: buildAtmnaFactorsSummary(top10, top3Syms) };
  }
  const prompt = KoPrompts.get(strategy, ctx);
  if (!prompt) {
    throw new Error(`KoPrompts.get("${strategy}", ctx) lieferte null — unbekannte Options-Strategie-ID?`);
  }
  return prompt;
}

// ─── Baustein 8: Anthropic-API-Call ────────────────────────────────────────
//
// Direkter Aufruf (kein Umweg über ko-ai-worker.js — der ist für
// Nutzer-Token-Auth aus dem Client gebaut, nicht für Server-zu-Server-
// Aufrufe, s. Spec Abschnitt 6 Punkt 5: GHA nutzt das eigene
// ANTHROPIC_API_KEY-Secret direkt).
//
// Modell exakt wie im bestehenden AI-Output-Beispiel der Spec (3.3)
// dokumentiert: "claude-sonnet-4-6".
const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_API_VERSION = '2023-06-01';
const ANTHROPIC_MAX_TOKENS = 4096; // ERHOEHT 09.09.2026 nach echtem API-Test:
// 2000 war zu knapp — der Prompt verlangt eine strukturierte 1-9-Antwort
// (max. 450 Woerter it. Prompt-Vorgabe), echte Antwort wurde bei genau
// 2000 output_tokens mitten im Satz abgeschnitten (Live-Test mit Axels
// Key, momentum-Strategie, synthetische Daten). 4096 gibt ausreichend
// Puffer fuer Markdown-Formatierung/Ueberschriften obendrauf.

// ─── Baustein 8b: AI-Budget-Logging (UIQ Spec v1.1 §1.1, 15.09.2026) ──────
//
// Ziel: Sichtbarkeit, bevor weiter optimiert wird — "welche UIQ-Funktion
// kostet eigentlich Geld?". Owner-only, kein Public-Key.
//
// GEAENDERT (v1.11, 21.09.2026, Backlog #1 — API-Kosten-Auswertung):
// verifiziert gegen https://docs.claude.com/en/docs/about-claude/pricing
// (21.09.2026). Dieses Skript nutzt durchgaengig NUR ein einziges Modell
// fuer alle 15 Strategien (ANTHROPIC_MODEL = 'claude-sonnet-4-6' oben,
// keine Strategie-abhaengige Variation) — anders als ko-ai.js (dort
// mischen sich Haiku/Sonnet je Action, s. dortige v1.28-Aenderung mit
// modellabhaengiger MODEL_PRICING-Lookup-Tabelle), reicht hier EIN
// globales Preispaar tatsaechlich aus, keine Modell-Lookup-Logik noetig.
// Claude Sonnet 4.6: $3/MTok Input, $15/MTok Output.
const ANTHROPIC_PRICE_PER_INPUT_TOKEN_USD = 3 / 1e6;
const ANTHROPIC_PRICE_PER_OUTPUT_TOKEN_USD = 15 / 1e6;

const AI_BUDGET_LOG = [];

function estimateCostUsd(inputTokens, outputTokens) {
  if (ANTHROPIC_PRICE_PER_INPUT_TOKEN_USD == null || ANTHROPIC_PRICE_PER_OUTPUT_TOKEN_USD == null) {
    return null;
  }
  return +(inputTokens * ANTHROPIC_PRICE_PER_INPUT_TOKEN_USD
    + outputTokens * ANTHROPIC_PRICE_PER_OUTPUT_TOKEN_USD).toFixed(6);
}

// `caller` folgt der Spec-Vorgabe: "public_digest" | "morning_briefing" |
// "eic_on_demand" | ... . Dieses Skript deckt ausschließlich den
// public_digest-Pfad ab (s. Changelog-Hinweis unten) — morning_briefing/
// eic_on_demand laufen über ko-ai-worker.js und sind hier NICHT erfasst.
function recordBudgetEntry({ date, caller, strategy = null, usage, truncated = false, retried = false }) {
  const inputTokens = usage?.input_tokens ?? null;
  const outputTokens = usage?.output_tokens ?? null;
  AI_BUDGET_LOG.push({
    date,
    caller,
    strategy,
    calls_used: 1,
    token_input: inputTokens,
    token_output: outputTokens,
    estimated_cost_usd: estimateCostUsd(inputTokens ?? 0, outputTokens ?? 0),
    truncated,
    retried,
  });
}

async function callAnthropic(prompt, { apiKey, maxTokens = ANTHROPIC_MAX_TOKENS } = {}) {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('callAnthropic: kein API-Key (weder Parameter noch ANTHROPIC_API_KEY gesetzt)');
  }

  // BUGFIX (09.09.2026, Live-Test-Fund): fetch() selbst war bisher NICHT in
  // try/catch — ein reiner Netzwerkfehler ("fetch failed": DNS, Connection
  // Reset, TLS, Timeout etc., kein HTTP-Fehlerstatus von Anthropic) wurde
  // dadurch als Exception direkt durchgereicht, BEVOR callAnthropicWithRetry()
  // ueberhaupt die Chance bekam, den in Abschnitt 8 vorgeschriebenen Retry
  // auszuloesen (der pruefte nur `result.ok`, wurde bei einem Wurf nie
  // erreicht). Live beobachtet: 2 von 10 Strategien scheiterten so an
  // transienten Netzwerkfehlern OHNE dass der Retry je griff. Jetzt wird
  // ein Netzwerkfehler wie ein regulaerer API-Fehler behandelt (ok:false
  // mit strukturiertem error-Objekt) statt zu werfen — damit greift der
  // Retry in callAnthropicWithRetry() korrekt.
  let resp;
  try {
    resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': ANTHROPIC_API_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch (networkErr) {
    return {
      ok: false,
      error: { status: null, type: 'network_error', message: networkErr.message },
    };
  }

  const body = await resp.json();

  if (!resp.ok) {
    // Landet 1:1 in ai_output.generation_error (Spec Abschnitt 8)
    return {
      ok: false,
      error: { status: resp.status, type: body?.error?.type ?? null, message: body?.error?.message ?? `HTTP ${resp.status}` },
    };
  }

  const textBlock = (body.content || []).find((b) => b.type === 'text');
  if (!textBlock || !textBlock.text) {
    return { ok: false, error: { status: resp.status, type: 'empty_response', message: 'Keine Text-Content-Block in der Antwort' } };
  }

  return {
    ok: true,
    text: textBlock.text,
    stop_reason: body.stop_reason,
    usage: body.usage,
    // ERGÄNZT 09.09.2026 nach Live-Test-Fund: stop_reason "max_tokens"
    // bedeutet, die Antwort wurde MITTEN IM SATZ abgeschnitten — darf bei
    // einem öffentlich ausgespielten Text nicht stillschweigend als
    // "erfolgreich" durchgehen. Aufrufer MUSS truncated prüfen, bevor der
    // Text in recommendation_text/rationale landet.
    truncated: body.stop_reason === 'max_tokens',
  };
}

// ─── Baustein 9: Decision Snapshot (3.2) ──────────────────────────────────
//
// `signals` NUR mit Feldern befüllen, die laut Abschnitt 3.6 tatsächlich
// für die jeweilige Strategie-Familie verifiziert sind — 1:1 aus der
// heutigen Tabelle übernommen. Einige dort gelistete Felder haben wir in
// dieser Pipeline (noch) nicht verfügbar (kein Rekonstruktionsrisiko wie
// bei den s*-Scores, sondern schlicht nicht im heute portierten
// Feld-Set) — die werden bewusst weggelassen, nicht als null eingetragen
// (entspricht der Spec-Vorgabe "kein Feld spekulativ als null").
// FEHLENDE FELDER, HIER OFFEN GEFLAGGT statt stillschweigend ignoriert:
// squeezeRisk (fading_short/breakdown), analystUpside (value), divYield/
// payoutRatio/roe (dividend), regime als Ticker-Einzelfeld (meanrev —
// hier wird stattdessen das Snapshot-weite mcm_regime verwendet, was
// inhaltlich dasselbe meint).
const STRATEGY_SIGNAL_MAP = {
  momentum: ['rsRating', 'macdHist', 'obvTrend', 'volRatio', 'hvp', 'rsi', 'dist200', 'dist52wHigh', 'sma150', 'above50'],
  vcp:      ['rsRating', 'macdHist', 'obvTrend', 'volRatio', 'hvp', 'rsi', 'dist200', 'dist52wHigh', 'sma150', 'above50',
             'vcpContractions', 'vcpLastPct', 'vcpAvgPrevPct', 'vcpVolContraction', 'vcpBreakoutVol'],
  swing:    ['rsRating', 'macdHist', 'obvTrend', 'volRatio', 'hvp', 'rsi', 'dist200', 'dist52wHigh', 'sma150', 'above50'],
  breakout: ['rsRating', 'macdHist', 'obvTrend', 'volRatio', 'hvp', 'rsi', 'dist200', 'dist52wHigh', 'sma150', 'above50'],
  ko:       ['dist200', 'bbPos', 'dist52wHigh', 'rsRating'],
  fading_short: ['atr', 'rsi', 'macdHist', 'obvTrend', 'volRatio', 'bbPos', 'hvp'],
  breakdown:    ['atr', 'rsi', 'macdHist', 'obvTrend', 'volRatio', 'bbPos', 'hvp'],
  meanrev:  ['rsi', 'dist200'], // + regime, s. Kommentar oben — kommt aus snapshot, nicht candidate
  value:    ['pe', 'pb', 'fcfYield', 'roicProxy', 'revGrowth', 'grossMargin'],
  dividend: ['fcfYield'],
};

// Options-Pendant zu STRATEGY_SIGNAL_MAP (16.09.2026) — nur Felder, die
// tatsächlich in der Leaderboard-_core-Liste vorhanden sind (verifiziert,
// nicht anhand von Namen vermutet). atmna bekommt zusätzlich tightnessPct
// (der neue Stabilitaetsfaktor aus score_options_atmna(), Backlog #64) —
// die uebrigen vier nutzen dieselbe Basis wie csp_wheel.
//
// ═══ BACKLOG-BEFUND: ATMNA EXPLAINABILITY GAP (16.09.2026, Thema-3-
// Abschlusstest, Reviewer-Formulierung) — ABGESCHLOSSEN (20.09.2026), s.
// buildAtmnaFactorsSummary()/buildOptionsPromptForStrategy() oben UND
// ko-prompts.js v2.53.29 (_deterministicOptionsFactBlock). ═══
// Score-/Pipeline-Test bestanden: die mechanische sAtmna-Rangfolge bevorzugt
// erwartungsgemaess neutrale/stabile Setups (RSI 42-59, BB-Mittelzone 0.3-
// 0.7, plausible Tightness — live gegen echte Kandidaten verifiziert, 16.09.
// 2026, master_market_data.json vom selben Tag). Der urspruengliche Befund
// (KI-Erklaerung nannte ATMNA-spezifische Treiber bbPos/tightnessPct nicht
// explizit) ist mit v1.6 dieses Skripts + ko-prompts.js v2.53.29 behoben:
// die Werte werden jetzt deterministisch vorberechnet und in den Prompt
// injiziert, statt dem Modell die Erinnerung/Gewichtung zu ueberlassen.
const OPTIONS_STRATEGY_SIGNAL_MAP = {
  csp_wheel:     ['rsi', 'atr', 'bbPos', 'hvp', 'dist200', 'ivpPercentile'],
  atmna:         ['rsi', 'atr', 'bbPos', 'hvp', 'dist200', 'ivpPercentile', 'tightnessPct'],
  weekly_income: ['rsi', 'atr', 'bbPos', 'hvp', 'dist200', 'ivpPercentile'],
  cc:            ['rsi', 'atr', 'bbPos', 'hvp', 'dist200', 'ivpPercentile'],
  collar:        ['rsi', 'atr', 'bbPos', 'hvp', 'dist200', 'ivpPercentile'],
};

function computeDist200(candidate) {
  if (candidate.ma200 && candidate.price) {
    return +(((candidate.price - candidate.ma200) / candidate.ma200) * 100).toFixed(2);
  }
  return null;
}

function buildSignals(strategy, candidate) {
  const fields = STRATEGY_SIGNAL_MAP[strategy] || OPTIONS_STRATEGY_SIGNAL_MAP[strategy] || [];
  const signals = {};
  const derived = { dist200: computeDist200(candidate) };

  for (const f of fields) {
    const val = f in derived ? derived[f] : candidate[f];
    if (val != null) signals[f] = val;
  }
  if (strategy === 'meanrev' && candidate._snapshotRegime) {
    signals.regime = candidate._snapshotRegime;
  }
  return signals;
}

function buildDecisionSnapshot(strategy, candidate, rank, snapshot) {
  candidate._snapshotRegime = snapshot.mcm_regime; // fürs meanrev-Signal, s.o.
  // NEU (16.09.2026): Options-Strategien nutzen OPTIONS_STRAT_SCORE_FIELD
  // (sCsp/sAtmna/sCc) statt STRAT_SCORE_FIELD — ohne diesen Fallback wäre
  // strategy_score fälschlich auf den equity-generischen candidate.score
  // zurückgefallen (STRAT_SCORE_FIELD[strategy] wäre für Options-IDs
  // undefined), nicht auf den tatsächlich fürs Ranking genutzten Score.
  const scoreField = STRAT_SCORE_FIELD[strategy] ?? OPTIONS_STRAT_SCORE_FIELD[strategy];
  return {
    date: snapshot.date,
    strategy,
    sym: candidate.sym,
    rank,
    strategy_score: candidate[scoreField] ?? candidate.score ?? null,
    grade: candidate.grade ?? null,
    regime: snapshot.mcm_regime,
    signals: buildSignals(strategy, candidate),
    signals_note: 'Feldliste je Strategie unterschiedlich - s. 3.6',
  };
}

// ─── Baustein 10: prompt_version aus ko-prompts.js auslesen ───────────────
//
// s. Spec 3.3: "wird beim GHA-Lauf direkt aus der geladenen Datei
// ausgelesen (Regex auf den ersten Version: X.Y.Z-Treffer im
// Kommentarblock), nicht manuell gepflegt".
function readPromptVersion() {
  const src = fs.readFileSync(path.join(__dirname, 'vendor', 'ko-prompts.js'), 'utf-8');
  const head = src.slice(0, 2000); // Header-Kommentarblock reicht, kein Volltext-Scan nötig
  const m = head.match(/Version:\s*([\d.]+)/);
  return m ? m[1] : null;
}

// ─── Baustein 11: AI Output (3.3) ──────────────────────────────────────────

function buildAiOutputId(date, strategy) {
  return `AIOUT-${date.replace(/-/g, '')}-${strategy.toUpperCase()}`;
}

function buildAiOutput(strategy, snapshot, apiResult, candidateSyms, promptVersion, repairStatus) {
  const dateCompact = snapshot.date.replace(/-/g, '');
  return {
    ai_output_id: buildAiOutputId(snapshot.date, strategy),
    date: snapshot.date,
    strategy,
    prompt_version: promptVersion,
    model: ANTHROPIC_MODEL,
    generation_timestamp: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    mode: 'public',
    recommendation_text: apiResult.ok ? apiResult.text : null,
    candidate_syms: candidateSyms,
    // ERFUELLT (16.09.2026, Thema 3): war bisher immer null, s. Abschnitt 9
    // ("Options-Preset") — der Spec-Punkt war bereits vorgesehen, nur nie
    // implementiert. Fuer die fuenf Options-Strategien jetzt tatsaechlich
    // befuellt (DEFAULT_OPTS_CFG, dieselben Werte, die auch in den Prompt
    // eingeflossen sind); fuer Equity-/KO-Strategien weiterhin null.
    filter_preset: OPTIONS_STRATEGIES.includes(strategy) ? DEFAULT_OPTS_CFG : null,
    disclaimer: 'Daten-Synthese - Keine Anlageberatung gem. Section 1 WpHG - Eigene Pruefung erforderlich',
    generation_error: apiResult.ok ? null : apiResult.error,
    // NEU (v1.7, 20.09.2026, ATMNA-Explainability-Gap-Fix Teil 3): null fuer
    // Equity-/KO-Strategien (kein REPAIR-Loop dort) und fuer Options-Strategien,
    // bei denen der Erstversuch bereits compliant war (kein Repair noetig).
    // Sonst "REPAIR-SUCCESS" | "REPAIR-FAILED:<fehlend>" | "REPAIR-ERROR:<meldung>"
    // — s. runStrategy() fuer die Erzeugung. Landet im Archiv UND im
    // 'latest'-Pointer, analog zu ko-ai.js' complianceFlags im /logs-Endpunkt.
    // WICHTIG (v1.12, 22.09.2026): buildAiOutput() wird nach dem Fix in
    // runStrategy() nur noch fuer Strategien aufgerufen, die entweder von
    // Anfang an compliant waren ODER deren Repair tatsaechlich erfolgreich
    // war (repairStatus ist dann null oder "REPAIR-SUCCESS") — der Fall
    // "REPAIR-FAILED"/"REPAIR-ERROR" fuehrt jetzt zu einem fruehen return
    // in runStrategy() und erreicht diese Funktion gar nicht mehr.
    repair_status: repairStatus || null,
  };
}

// ─── Baustein 12: Prediction Ledger Entry (3.4) ───────────────────────────

function buildLedgerId(date, strategy, rank) {
  return `UIQ-${date.replace(/-/g, '')}-${strategy.toUpperCase()}-${String(rank).padStart(3, '0')}`;
}

function buildLedgerEntry(strategy, rank, decisionSnapshot, snapshot, aiOutputId) {
  return {
    ledger_id: buildLedgerId(snapshot.date, strategy, rank),
    snapshot_id: snapshot.snapshot_id,
    ai_output_id: aiOutputId,
    decision: decisionSnapshot,
    created_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    immutable: true,
    outcome: null,
  };
}

// ─── Baustein 13: Public Digest (3.7) — Rationale-Template ────────────────
//
// Templatebasiert aus den signals der Decision Snapshots, KEIN
// zusätzlicher KI-Call (s. heutige Designentscheidung). Deckt die
// Felder ab, die STRATEGY_SIGNAL_MAP tatsächlich liefert — bewusst
// generisch statt für jede Strategie eine eigene Textvorlage, damit neue
// Signalfelder nicht automatisch vergessen werden.
const SIGNAL_LABELS = {
  rsRating: (v) => `RS-Rating ${v}`,
  macdHist: (v) => (v > 0 ? 'positiver MACD-Trend' : 'negativer MACD-Trend'),
  obvTrend: (v) => (v > 0 ? 'OBV in Akkumulation' : 'OBV in Distribution'),
  volRatio: (v) => `Volumen-Ratio ${v.toFixed(2)}x`,
  hvp: (v) => `HVP ${v}%`,
  rsi: (v) => `RSI ${v.toFixed ? v.toFixed(1) : v}`,
  dist200: (v) => `Abstand EMA200 ${v >= 0 ? '+' : ''}${v}%`,
  dist52wHigh: (v) => `Abstand zum 52W-Hoch ${v >= 0 ? '+' : ''}${v}%`,
  sma150: () => 'oberhalb SMA150 (Stage-2-Kriterium)',
  vcpContractions: (v) => `${v} VCP-Kontraktionen`,
  bbPos: (v) => `Bollinger-Position ${Math.round(v * 100)}%`,
  pe: (v) => `KGV ${v}`,
  pb: (v) => `KBV ${v}`,
  fcfYield: (v) => `FCF-Rendite ${v}%`,
  roicProxy: (v) => `ROIC ${v}%`,
  revGrowth: (v) => `Umsatzwachstum ${v >= 0 ? '+' : ''}${v}%`,
  grossMargin: (v) => `Bruttomarge ${v}%`,
  atr: (v) => `ATR $${v.toFixed ? v.toFixed(2) : v}`,
  // NEU (16.09.2026, Thema 3 — Options-Strategien):
  ivpPercentile: (v) => `IV-Perzentil ${v}%ile`,
  tightnessPct: (v) => `Tightness ${v}%`,
};

function buildRationale(strategy, decisionSnapshot) {
  const strategyLabel = strategy.charAt(0).toUpperCase() + strategy.slice(1);
  const summary = `Hohe Übereinstimmung mit den UIQ-Kriterien für ${strategyLabel}.`;
  const signals = [];
  for (const [key, val] of Object.entries(decisionSnapshot.signals || {})) {
    const fmt = SIGNAL_LABELS[key];
    if (fmt) signals.push(fmt(val));
  }
  return { summary, signals };
}

// ─── Baustein 14: Public Digest (3.7) — Gesamtzusammenbau ─────────────────

function buildDigestId(date) {
  return `DIGEST-${date.replace(/-/g, '')}`;
}

// strategyResults: Array von { strategy, top10, top3Syms, apiResult, promptVersion }
// (ein Eintrag pro erfolgreich gelaufener der zehn Equity-/KO-Strategien)
function buildPublicDigest(snapshot, strategyResults) {
  const digest = {
    digest_id: buildDigestId(snapshot.date),
    date: snapshot.date,
    snapshot_id: snapshot.snapshot_id,
    generated_at: new Date().toISOString().replace(/\.\d+Z$/, 'Z'),
    market_regime: {
      mse_regime: snapshot.mcm_regime,
      qqq_markov_regime: snapshot.qqq_markov_regime ? snapshot.qqq_markov_regime.regime : null,
      vix: snapshot.vix,
      sector_rotation_signal: snapshot.sector_rotation ? snapshot.sector_rotation.signal : null,
      dce: snapshot.dce,
    },
    strategies: [],
    data_quality: {
      market_snapshot: 'ok',
      equity_data: strategyResults.length > 0 ? 'ok' : 'error',
      sector_data: snapshot.sector_rotation ? 'ok' : 'error',
      qqq_markov: snapshot.qqq_markov_regime ? 'ok' : 'error',
    },
    disclaimer: 'Daten-Synthese - Keine Anlageberatung gem. Section 1 WpHG - Eigene Pruefung erforderlich',
  };

  for (const res of strategyResults) {
    const { strategy, top10, top3Syms, apiResult, promptVersion, decisionSnapshots, aiOutputId } = res;
    const opportunities = top3Syms.map((sym, idx) => {
      const rank = idx + 1;
      const decisionSnapshot = decisionSnapshots[idx];
      return {
        rank,
        sym,
        strategy_score: decisionSnapshot.strategy_score,
        status: 'active',
        rationale: buildRationale(strategy, decisionSnapshot),
        ledger_id: buildLedgerId(snapshot.date, strategy, rank),
        confidence: null, // Platzhalter fuer kuenftige DCE-pro-Kandidat, s. Spec 3.7
      };
    });
    digest.strategies.push({ strategy, opportunities, ai_output_id: aiOutputId });
  }

  return digest;
}

// ─── Baustein 15: Cloudflare-KV-Schreibfunktion ───────────────────────────
//
// KEIN separater "Sync-Endpunkt" — direkter HTTP PUT gegen die
// Standard-Cloudflare-KV-REST-API, 1:1 aus push_to_cloudflare_kv()
// (market_aggregator.py L8516) portiert, inkl. dem dortigen Retry-Verhalten.
//
// WICHTIGER FUND (09.09.2026): Die Spec-Skizze in Abschnitt 6 nannte das
// Secret "KO_SYNC_WRITE_TOKEN" — das ist FALSCH bzw. veraltet. Der bereits
// produktiv laufende Mechanismus nutzt drei andere, bereits im GHA-Workflow
// hinterlegte Secrets: CF_ACCOUNT_ID, CF_API_TOKEN, CF_KV_NS_ID. Kein neues
// Secret nötig — diese Funktion nutzt bewusst dieselben drei Namen.
async function pushToCloudflareKV(data, key, { retries = 1 } = {}) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const nsId = process.env.CF_KV_NS_ID;

  if (!accountId || !apiToken || !nsId) {
    return { ok: false, error: 'CF_ACCOUNT_ID/CF_API_TOKEN/CF_KV_NS_ID fehlen als Umgebungsvariablen' };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/${key}`;
  const payload = JSON.stringify(data);

  let attempt = 0;
  let lastError = null;
  while (attempt <= retries) {
    attempt += 1;
    try {
      const resp = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
        body: payload,
      });
      if (resp.status === 200 || resp.status === 201) {
        return { ok: true, key, sizeKb: +(payload.length / 1024).toFixed(1), attempt };
      }
      const text = await resp.text().catch(() => '');
      lastError = `HTTP ${resp.status}: ${text.slice(0, 200)}`;
    } catch (err) {
      lastError = err.message;
    }
    if (attempt <= retries) await new Promise((r) => setTimeout(r, 2000));
  }
  return { ok: false, error: lastError, key };
}

// ─── Baustein 16: KV-Read (für Archiv-Kollisionsprüfung) ──────────────────
async function getFromCloudflareKV(key) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const nsId = process.env.CF_KV_NS_ID;
  if (!accountId || !apiToken || !nsId) return { exists: false, error: 'CF-Credentials fehlen' };

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/${key}`;
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiToken}` } });
    if (resp.status === 200) return { exists: true };
    if (resp.status === 404) return { exists: false };
    return { exists: false, error: `HTTP ${resp.status}` };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

// ─── Baustein 16b: KV-Read MIT Value (Trading-Day-Skip-Check, 10.09.2026) ─
// Bewusst "16b" statt 17+ (und Renummerierung aller Folge-Bausteine), um
// den Diff auf den eigentlichen Zweck zu beschränken — inhaltlich gehört
// diese Funktion direkt neben Baustein 16 (ebenfalls ein KV-Read), liefert
// aber zusätzlich den geparsten Value zurück statt nur exists/nicht-exists.
// Nutzt dieselbe URL/Auth wie pushToCloudflareKV() (Baustein 15) — kein
// neues Secret.
async function readFromCloudflareKV(key) {
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  const nsId = process.env.CF_KV_NS_ID;
  if (!accountId || !apiToken || !nsId) {
    return { ok: false, error: 'CF_ACCOUNT_ID/CF_API_TOKEN/CF_KV_NS_ID fehlen als Umgebungsvariablen' };
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/${key}`;
  try {
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${apiToken}` } });
    if (resp.status === 404) {
      // Key existiert noch nicht (z.B. erster Lauf ueberhaupt) — kein
      // Fehler, einfach "kein vorheriger Digest vorhanden".
      return { ok: true, notFound: true };
    }
    if (resp.status !== 200) {
      const text = await resp.text().catch(() => '');
      return { ok: false, error: `HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    const data = await resp.json();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Baustein 17: Archiv-Schreibfunktion mit Immutability-Schutz ──────────
//
// s. Abschnitt 8, Fehlerfall "Ziel-Archiv-Pfad existiert bereits": kein
// Ueberschreiben, Warnung loggen, kein Job-Fehlschlag.
async function writeArchiveIfAbsent(key, data) {
  const check = await getFromCloudflareKV(key);
  if (check.exists) {
    console.warn(`  ⚠️  Archiv-Pfad existiert bereits, Schreibvorgang uebersprungen: ${key}`);
    return { ok: true, skipped: true, key };
  }
  const result = await pushToCloudflareKV(data, key);
  if (!result.ok) console.error(`  ❌ Archiv-Schreibfehler (${key}):`, result.error);
  return result;
}

function archiveDatePath(dateStr) {
  // "2026-09-08" -> "2026/09/08" (s. Abschnitt 4, Pfad-Konvention)
  return dateStr.replace(/-/g, '/');
}

// ─── Baustein 18: Anthropic-Call mit Retry (s. Abschnitt 8, Fehlerfall 1) ─
async function callAnthropicWithRetry(prompt, { apiKey, caller = 'public_digest', strategy = null, date = null } = {}) {
  let result = await callAnthropic(prompt, { apiKey });
  recordBudgetEntry({ date, caller, strategy, usage: result.usage, truncated: result.truncated === true });
  if (result.ok && !result.truncated) return result;

  const reason = result.ok ? 'Antwort abgeschnitten (max_tokens)' : result.error.message;
  console.warn(`  ⚠️  Anthropic-Call fehlgeschlagen/unvollstaendig (${reason}) — einmaliger Retry nach 10s...`);
  await new Promise((r) => setTimeout(r, 10000));
  result = await callAnthropic(prompt, { apiKey });
  // Retry zaehlt budgetseitig als eigener Call (echte Kosten, nicht nur
  // der finale Versuch) — genau der Fall, den ein reines "letzter Call
  // gewinnt"-Logging verschleiern wuerde.
  recordBudgetEntry({ date, caller, strategy, usage: result.usage, truncated: result.truncated === true, retried: true });
  return result;
}

// ─── Baustein 19: Eine Strategie komplett durchlaufen ─────────────────────
//
// Fehlerisoliert: wirft NIE — bei jedem Fehlschlag wird { ok:false, ... }
// zurueckgegeben, main() entscheidet dann pro Strategie weiter (s.
// Abschnitt 8: "Ein Fehlschlag blockiert nicht den gesamten Lauf").
async function runStrategy(strategy, masterData, snapshot, promptVersion) {
  try {
    // NEU (16.09.2026, Thema 3): interne Verzweigung Equity/Options — nur
    // bei Kandidatenauswahl/Prompt-Bau unterschiedlich, alles danach
    // (Retry, Budget-Logging, Ledger-/Output-Bau) bleibt eine einzige,
    // gemeinsame Infrastruktur. Keine zweite parallele runOptionsStrategy()
    // o.ae. — genau das wollten wir vermeiden (Axel-Vorgabe).
    const isOptions = OPTIONS_STRATEGIES.includes(strategy);

    const { top10, top3Syms } = isOptions
      ? selectOptionsCandidates(strategy, masterData)
      : selectCandidates(strategy, masterData);
    if (top3Syms.length === 0) {
      return { ok: false, strategy, error: 'keine Kandidaten nach Filterung/Sortierung' };
    }

    // DIAGNOSE (v1.9, 20.09.2026, rein loggend, keine Verhaltensaenderung —
    // s. Changelog-Eintrag oben): beweist, ob top3Syms bereits an dieser
    // Stelle von dem abweicht, was spaeter tatsaechlich in Abschnitt 3 der
    // Antwort erscheint. Nur fuer atmna (bisher einzige betroffene Strategie).
    if (strategy === 'atmna') {
      console.log(`  [ATMNA-CANDIDATES] top3Syms=${JSON.stringify(top3Syms)} `
        + `top10=${JSON.stringify(top10.map((c) => c.sym))}`);
    }

    const tickerListStr = isOptions
      ? buildOptionsTickerListString(top10)
      : buildTickerListString(top10);
    const prompt = isOptions
      ? buildOptionsPromptForStrategy(strategy, snapshot, tickerListStr, top10, top3Syms)
      : buildPromptForStrategy(strategy, snapshot, tickerListStr, top10.length);

    // DIAGNOSE (v1.9, 20.09.2026, rein loggend): der tatsaechliche
    // atmnaFactors.summary-String, der ins VERPFLICHTENDE FAKTORENPRUEFUNG
    // (ko-prompts.js) einfliesst — direkt vor dem Anthropic-Call, damit
    // ein Vergleich mit dem spaeteren Abschnitt-3-Inhalt der Antwort moeglich
    // ist. Extrahiert den Block direkt aus dem fertigen Prompt-Text (statt
    // buildAtmnaFactorsSummary() ein zweites Mal aufzurufen), damit
    // garantiert genau das geloggt wird, was tatsaechlich an Anthropic ging.
    if (strategy === 'atmna') {
      const _factorBlockMatch = prompt.match(/-\s*Bollinger-Position \(BB\) und Tightness je Kandidat[^\n]*/);
      console.log(`  [ATMNA-FACTORS] ${_factorBlockMatch ? _factorBlockMatch[0] : '(Faktor-Block nicht gefunden im Prompt)'}`);
    }
    let apiResult = await callAnthropicWithRetry(prompt, { caller: 'public_digest', strategy, date: snapshot.date });

    if (!apiResult.ok) {
      return { ok: false, strategy, error: apiResult.error };
    }

    // ── REPAIR-LOOP (v1.7, 20.09.2026, ATMNA-Explainability-Gap-Fix Teil 3) ──
    // Nur fuer die fuenf Options-Strategien relevant (KoPrompts.
    // validateBriefingCompliance() prueft fuer alle anderen ohnehin nichts,
    // s. deren eigene _OPTIONS_STRATEGY_IDS-Pruefung) — die if-Bedingung
    // hier ist trotzdem explizit, damit kein unnoetiger Funktionsaufruf fuer
    // die zehn Equity-/KO-Strategien anfaellt. Analog zu ko-ai.js v1.24/1.25:
    // GENAU EIN Repair-Versuch, kein Repair-of-Repair. Wird die Antwort
    // ersetzt (apiResult = repairResult), fliesst der reparierte Text in
    // ALLES Nachgelagerte ein (aiOutput.recommendation_text, spaeter der
    // 'latest'-Pointer) — nicht nur in ein separates Log wie bei ko-ai.js
    // (dort gibt es kein Aequivalent zu recommendation_text, das ersetzt
    // werden koennte, nur den Response-Text an den Client).
    // NEU (v1.10, 21.09.2026, LLM-Auswahl-Drift-Fix): top3Syms als
    // expectedTop3 an den Validator durchreichen — s. ko-prompts.js
    // v2.53.30 fuer den vollstaendigen Kontext des Live-Funds.
    //
    // KRITISCHER FIX (v1.12, 22.09.2026, PUBLISH-BUG): bis einschliesslich
    // v1.11 wurde `apiResult = repairResult` VOR der Pruefung des
    // repairCheck-Ergebnisses zugewiesen — sowohl bei REPAIR-FAILED
    // (weiterhin nicht-konformer Text ersetzte den Original) als auch bei
    // REPAIR-ERROR (der ORIGINALE, ebenfalls nicht-konforme Text blieb
    // unveraendert in apiResult) lief die Funktion mit { ok: true, ... }
    // durch und der Text landete unveraendert im Public Digest — das
    // einzige sichtbare Signal (aiOutput.repair_status) wird von
    // buildPublicDigest() NICHT in die oeffentlichen opportunities[]
    // uebernommen, war also fuer einen Leser des Digest unsichtbar. Live
    // beobachtet am 21.09.2026: vier von fuenf Options-Strategien liefen
    // mit REPAIR-FAILED durch das Log, wurden aber als "✅ Top-3" geloggt
    // und regulaer archiviert/veroeffentlicht.
    // FIX: bei REPAIR-FAILED oder REPAIR-ERROR wird die Strategie jetzt
    // als { ok: false, ... } zurueckgegeben — main()s bestehender Fehler-
    // isolations-Mechanismus (jede Strategie unabhaengig, ein Fehlschlag
    // blockiert nie die uebrigen) greift dadurch automatisch: kein Archiv-
    // Write, kein Digest-Eintrag, kein 'latest'-Pointer fuer DIESE eine
    // Strategie in DIESEM Lauf. Kein neues Konzept — nur die konsequente
    // Anwendung des bereits ueberall sonst geltenden Prinzips auf einen
    // bisher uebersehenen Fall.
    let repairStatus = null;
    if (isOptions && typeof KoPrompts.validateBriefingCompliance === 'function') {
      const complianceCheck = KoPrompts.validateBriefingCompliance(strategy, apiResult.text, { expectedTop3: top3Syms });
      if (complianceCheck.status === 'FAIL') {
        console.warn(`  ⚠ ${strategy}: Pflichtangaben fehlen (${complianceCheck.missing.join(', ')}) — Repair-Versuch...`);
        try {
          const repairPrompt = buildRepairPrompt(strategy, complianceCheck.missing, apiResult.text, complianceCheck.details);
          const repairResult = await callAnthropicWithRetry(repairPrompt, {
            caller: 'public_digest', strategy: `${strategy}_REPAIR`, date: snapshot.date,
          });
          if (repairResult.ok) {
            const repairCheck = KoPrompts.validateBriefingCompliance(strategy, repairResult.text, { expectedTop3: top3Syms });
            if (repairCheck.status === 'PASS') {
              apiResult = repairResult;
              repairStatus = 'REPAIR-SUCCESS';
            } else {
              repairStatus = `REPAIR-FAILED:${repairCheck.missing.join('+')}`;
              console.warn(`  ⚠ ${strategy}: Repair fehlgeschlagen, fehlt weiterhin: ${repairCheck.missing.join(', ')} — Strategie wird NICHT veröffentlicht.`);
              return { ok: false, strategy, error: `Compliance-Check nach Repair fehlgeschlagen: ${repairCheck.missing.join(', ')}`, repairStatus };
            }
          } else {
            repairStatus = `REPAIR-ERROR:${(repairResult.error && repairResult.error.message) || 'unbekannter Fehler'}`;
            console.error(`  ❌ ${strategy}: Repair-Call fehlgeschlagen:`, repairResult.error);
            return { ok: false, strategy, error: `Repair-Call fehlgeschlagen: ${repairStatus}`, repairStatus };
          }
        } catch (repairErr) {
          repairStatus = `REPAIR-ERROR:${repairErr.message}`;
          console.error(`  ❌ ${strategy}: Repair-Call wirft Exception:`, repairErr.message);
          return { ok: false, strategy, error: `Repair-Call wirft Exception: ${repairErr.message}`, repairStatus };
        }
      }
    }

    const decisionSnapshots = top3Syms.map((sym, i) => {
      const candidate = top10.find((c) => c.sym === sym);
      return buildDecisionSnapshot(strategy, candidate, i + 1, snapshot);
    });
    const aiOutput = buildAiOutput(strategy, snapshot, apiResult, top3Syms, promptVersion, repairStatus);
    const ledgerEntries = decisionSnapshots.map((ds, i) =>
      buildLedgerEntry(strategy, i + 1, ds, snapshot, aiOutput.ai_output_id)
    );

    return {
      ok: true, strategy, top10, top3Syms, apiResult, promptVersion,
      decisionSnapshots, aiOutput, ledgerEntries,
    };
  } catch (err) {
    // Pflichtfeld nicht befuellbar o.ae. (Abschnitt 8, Fehlerfall 2) —
    // kein stiller null-Wert, expliziter Fehler statt Absturz des Laufs.
    // Gilt unveraendert fuer Equity UND Options: eine einzelne fehlerhafte
    // Strategie (egal welcher Klasse) beendet NICHT den gesamten Lauf, s.
    // main()-Schleife unten (for-Schleife pro Strategie, kein Promise.all
    // mit gemeinsamem Fehlschlag).
    return { ok: false, strategy, error: err.message };
  }
}

// ─── Baustein 20: main() — Orchestrierung über alle zehn Strategien ──────
// ─── Baustein 21: Python-JSON-Kompatibilitaet ─────────────────────────────
//
// ECHTER FUND (09.09.2026, Live-Datei-Test): master_market_data.json
// enthält literale `NaN`-Tokens (z.B. bei "ownerEarningsYield") — Pythons
// json.dumps() erlaubt das per Default (allow_nan=True), aber es ist laut
// JSON-Spezifikation UNGÜLTIG. JavaScripts JSON.parse() lehnt es zu Recht
// ab (SyntaxError). Das ist ein eigenständiges Datenqualitätsproblem in
// market_aggregator.py, nicht etwas, das dieses Skript verursacht — aber
// es muss hier abgefangen werden, um mit der real produzierten Datei
// arbeiten zu können, ohne auf einen Fix in market_aggregator.py warten
// zu müssen. WURZEL-FIX-EMPFEHLUNG (nicht Teil dieses Skripts): in
// market_aggregator.py entweder json.dumps(..., allow_nan=False) nutzen
// (bricht dann kontrolliert dort, wo der NaN entsteht) oder NaN-Werte vor
// der Serialisierung explizit zu null normalisieren.
//
// Diese Funktion ersetzt bloße NaN/Infinity/-Infinity-Tokens durch null,
// AUSSERHALB von String-Literalen (simple, aber fuer diesen konkreten Fall
// ausreichend robuste Regex — ersetzt nur Tokens, die als JSON-Wert an
// Komma/Doppelpunkt/Klammer grenzen, nicht Teile von Strings).
function parsePythonStyleJson(text) {
  const sanitized = text.replace(/([:,\[]\s*)(-?Infinity|NaN)(\s*[,\]}])/g, '$1null$3');
  return JSON.parse(sanitized);
}


async function main() {
  console.log('\nVendor-Drift-Check (ko-prompts.js/ko-markov.js vs. ko-modules)...');
  await checkVendorDrift();

  const masterDataPath = process.env.MASTER_DATA_PATH || path.join(process.cwd(), 'master_market_data.json');
  console.log(`Lese Aggregator-Output: ${masterDataPath}`);
  const rawJson = fs.readFileSync(masterDataPath, 'utf-8');
  const masterData = parsePythonStyleJson(rawJson);
  const rawTickers = masterData.tickers || masterData.results || [];
  console.log(`  ${rawTickers.length} Ticker geladen.`);

  console.log('\nBaue Daily Market Snapshot...');
  const snapshot = await buildDailyMarketSnapshot(masterData);
  console.log(`  ${snapshot.snapshot_id} — Regime: ${snapshot.mcm_regime}, QQQ: ${snapshot.qqq_markov_regime?.regime ?? 'n/a'}`);

  // ── TRADING-DAY-SKIP-CHECK (Kostenfaktor, s. Session 10.09.2026) ─────────
  // Kein neuer Handelstag seit dem letzten veröffentlichten Digest (Montag
  // vor Xetra-Öffnung hat z.B. denselben last_trading_day wie der Samstag-
  // Lauf, ebenso an jedem US-Feiertag)? Dann wären alle zehn Anthropic-Calls
  // reine Wiederholung des letzten Ergebnisses — überspringen. Bewusst KEIN
  // Feiertagskalender (müsste je Markt gepflegt werden), sondern rein
  // datengetrieben über snapshot.date (= masterData.meta.last_trading_day,
  // von market_aggregator.py bereits via echter SPY-Handelsdaten bestimmt).
  // FORCE_REGENERATE=true als Escape-Hatch für bewusste manuelle
  // Neuerzeugung (z.B. nach einem Prompt-Fix), unabhängig vom Datum.
  if (process.env.FORCE_REGENERATE !== 'true') {
    const lastPublished = await readFromCloudflareKV('public/digest/latest');
    if (lastPublished.ok && !lastPublished.notFound
        && lastPublished.data?.date === snapshot.date) {
      console.log(`\n⏭  Kein neuer Handelstag seit letztem Digest (${snapshot.date}) — `
        + `Anthropic-Calls übersprungen. FORCE_REGENERATE=true erzwingt Neuerzeugung.`);
      process.exit(0);
    }
    if (!lastPublished.ok) {
      // KV-Read fehlgeschlagen (z.B. Netzwerkfehler) — bewusst "fail-open":
      // NICHT stillschweigend überspringen (Risiko: ein verpasster
      // Handelstag bliebe unbemerkt), sondern als Warnung loggen und
      // normal weiterlaufen, wie bisher ohne diesen Check.
      console.warn(`  ⚠ Trading-Day-Skip-Check: KV-Read fehlgeschlagen (${lastPublished.error}) `
        + `— fahre sicherheitshalber normal fort, kein Skip.`);
    }
  }

  const promptVersion = readPromptVersion();
  const datePath = archiveDatePath(snapshot.date);

  // Canonical Snapshot einmal pro Tag archivieren (von allen Strategien referenziert)
  await writeArchiveIfAbsent(`archive/recommendations/${datePath}/snapshot.json`, snapshot);

  const results = [];
  for (const strategy of EQUITY_STRATEGIES) {
    console.log(`\n--- Strategie: ${strategy} ---`);
    const result = await runStrategy(strategy, masterData, snapshot, promptVersion);
    if (result.ok) {
      console.log(`  ✅ Top-3: ${result.top3Syms.join(', ')}`);
    } else {
      console.error(`  ❌ ${strategy} übersprungen: ${JSON.stringify(result.error)}`);
    }
    results.push(result);
  }

  console.log(`\n${results.filter((r) => r.ok).length}/${EQUITY_STRATEGIES.length} Equity-/KO-Strategien erfolgreich.`);

  // NEU (16.09.2026, Thema 3): zweite Schleife für die fünf Options-
  // Strategien — bewusst dieselbe for-Schleife-Struktur wie oben (kein
  // Promise.all/-allSettled), damit ein Fehler in EINER Options-Strategie
  // (z.B. Anthropic-Timeout bei 'collar') weder die übrigen vier Options-
  // Strategien noch die bereits gelaufenen zehn Equity-/KO-Strategien
  // abbricht — runStrategy()s eigenes try/catch fängt das pro Strategie ab,
  // hier kommt nur noch ein { ok:false, ... } zurück statt einer Exception.
  // results ist dasselbe Array wie oben — 15 Einträge insgesamt, keine
  // getrennte zweite Pipeline für Archiv-/Digest-/KV-Schreibvorgänge.
  for (const strategy of OPTIONS_STRATEGIES) {
    console.log(`\n--- Options-Strategie: ${strategy} ---`);
    const result = await runStrategy(strategy, masterData, snapshot, promptVersion);
    if (result.ok) {
      console.log(`  ✅ Top-3: ${result.top3Syms.join(', ')}`);
    } else {
      console.error(`  ❌ ${strategy} übersprungen: ${JSON.stringify(result.error)}`);
    }
    results.push(result);
  }

  console.log(`\n${results.filter((r) => r.ok).length}/${EQUITY_STRATEGIES.length + OPTIONS_STRATEGIES.length} Strategien insgesamt erfolgreich.`);

  const successful = results.filter((r) => r.ok);

  // Archiv-Dateien je erfolgreicher Strategie schreiben
  const manifestStrategies = {};
  for (const res of successful) {
    await writeArchiveIfAbsent(`archive/recommendations/${datePath}/${res.strategy}.json`, res.ledgerEntries);
    await writeArchiveIfAbsent(`archive/recommendations/${datePath}/${res.strategy}_ai_output.json`, res.aiOutput);
    manifestStrategies[res.strategy] = res.aiOutput.ai_output_id;
  }

  // Public Digest bauen (nur aus erfolgreichen Strategien) + Archiv-Kopie
  const digest = buildPublicDigest(snapshot, successful);
  await writeArchiveIfAbsent(`archive/digest/${datePath}.json`, digest);

  // `latest`-Pointer und öffentliche Reads — TÄGLICH ERSETZT, kein
  // Kollisionsschutz (s. Abschnitt 4.2/4.3 — das ist der einzige
  // veraenderliche Key-Typ). Schreibreihenfolge bewusst: Archiv zuerst
  // (oben bereits geschehen), `latest` zuletzt (s. Abschnitt 8, Fehlerfall 4).
  await pushToCloudflareKV(snapshot, 'public/marketstate/latest');
  await pushToCloudflareKV(digest, 'public/digest/latest');
  await pushToCloudflareKV(
    { date: snapshot.date, strategies: manifestStrategies },
    'public/recommendations/latest'
  );
  // NEU (v1.3, 13.09.2026): volle KI-Narrative pro Strategie zusätzlich als
  // eigener 'latest'-Pointer (s. Changelog oben) — ermöglicht Cache-First in
  // openKiBriefing()/runAlphaLbKI() ohne erneuten Anthropic-Call am selben
  // Handelstag. Gleicher Inhalt wie der Archiv-Key oben, nur unter stabilem,
  // täglich ersetztem Key. Bewusst NACH den Archiv-Writes (s. Reihenfolge-
  // Kommentar oben), zusammen mit den übrigen 'latest'-Pointern.
  for (const res of successful) {
    await pushToCloudflareKV(res.aiOutput, `public/ai_output/latest/${res.strategy}`);
  }

  // ── AI-Budget-Log schreiben (UIQ Spec v1.1 §1.1, Baustein 8b) ───────────
  // Owner-only, kein Public-Key. Deckt nur den public_digest-Pfad dieses
  // Skripts ab — morning_briefing/eic_on_demand (ko-ai-worker.js) sind
  // NICHT enthalten, s. Kommentar bei recordBudgetEntry().
  if (AI_BUDGET_LOG.length > 0) {
    const tokenInputTotal = AI_BUDGET_LOG.reduce((sum, e) => sum + (e.token_input || 0), 0);
    const tokenOutputTotal = AI_BUDGET_LOG.reduce((sum, e) => sum + (e.token_output || 0), 0);
    const costUnknown = AI_BUDGET_LOG.some((e) => e.estimated_cost_usd == null);
    const estimatedCostUsdTotal = costUnknown
      ? null
      : +(AI_BUDGET_LOG.reduce((sum, e) => sum + e.estimated_cost_usd, 0)).toFixed(6);

    const budgetSummary = {
      date: snapshot.date,
      calls_used: AI_BUDGET_LOG.length,
      token_input_total: tokenInputTotal,
      token_output_total: tokenOutputTotal,
      estimated_cost_usd_total: estimatedCostUsdTotal,
      entries: AI_BUDGET_LOG,
    };
    await pushToCloudflareKV(budgetSummary, `internal/ai_budget/${snapshot.date}`);
    console.log(`\nAI-Budget-Log geschrieben (internal/ai_budget/${snapshot.date}): `
      + `${AI_BUDGET_LOG.length} Calls, ${tokenInputTotal}/${tokenOutputTotal} `
      + `Input/Output-Tokens` + (costUnknown ? ' (Kosten-Konstanten noch nicht kalibriert)' : `, geschätzt $${estimatedCostUsdTotal}`));
  }

  console.log('\nFertig.');
  return { snapshot, digest, results };
}

if (require.main === module) {
  main().catch((err) => {
    console.error('FATAL:', err);
    process.exit(1);
  });
}

module.exports = {
  loadBrowserStyleModule,
  STRAT_SCORE_FIELD,
  EQUITY_STRATEGIES,
  // NEU (16.09.2026, Thema 3) — Options-Pendants exportiert, damit sie
  // (wie die Equity-Äquivalente auch) unabhängig testbar sind, ohne main()
  // laufen zu lassen.
  OPTIONS_STRATEGIES,
  OPTIONS_LEADERBOARD_KEY,
  OPTIONS_STRAT_SCORE_FIELD,
  OPTIONS_STRATEGY_SIGNAL_MAP,
  selectOptionsCandidates,
  buildOptionsTickerListString,
  buildOptionsMarktkontext,
  buildOptionsPromptForStrategy,
  buildAtmnaFactorsSummary,
  buildRepairPrompt,
  getTargetDteForStrategy,
  calc3rdFridayExpiration,
  fetchQqqCloses,
  buildQqqMarkovRegime,
  buildSectorRotation,
  buildSnapshotId,
  buildDailyMarketSnapshot,
  selectCandidates,
  buildTickerListString,
  normalizeTicker,
  LEADERBOARD_KEY,
  buildLookupMaps,
  mergeTickerSources,
  enrichWithMarkov,
  enrichWithFibo,
  detectSwing,
  calcFiboLevels,
  fiboZone,
  DEFAULT_OPTS_CFG,
  DATA_LEGENDE,
  buildMarktkontext,
  buildPromptForStrategy,
  callAnthropic,
  ANTHROPIC_MODEL,
  recordBudgetEntry,
  estimateCostUsd,
  AI_BUDGET_LOG,
  STRATEGY_SIGNAL_MAP,
  buildSignals,
  buildDecisionSnapshot,
  readPromptVersion,
  buildAiOutputId,
  buildAiOutput,
  buildLedgerId,
  buildLedgerEntry,
  buildRationale,
  buildDigestId,
  buildPublicDigest,
  pushToCloudflareKV,
  getFromCloudflareKV,
  writeArchiveIfAbsent,
  archiveDatePath,
  callAnthropicWithRetry,
  runStrategy,
  parsePythonStyleJson,
  main,
};
