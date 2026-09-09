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
 * ====================================================================
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

function computeDist200(candidate) {
  if (candidate.ma200 && candidate.price) {
    return +(((candidate.price - candidate.ma200) / candidate.ma200) * 100).toFixed(2);
  }
  return null;
}

function buildSignals(strategy, candidate) {
  const fields = STRATEGY_SIGNAL_MAP[strategy] || [];
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
  return {
    date: snapshot.date,
    strategy,
    sym: candidate.sym,
    rank,
    strategy_score: candidate[STRAT_SCORE_FIELD[strategy]] ?? candidate.score ?? null,
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

function buildAiOutput(strategy, snapshot, apiResult, candidateSyms, promptVersion) {
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
    filter_preset: null, // nur bei Options-Strategien befuellt, s. Abschnitt 9 — hier immer null (nur Equity-/KO-Strategien)
    disclaimer: 'Daten-Synthese - Keine Anlageberatung gem. Section 1 WpHG - Eigene Pruefung erforderlich',
    generation_error: apiResult.ok ? null : apiResult.error,
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
async function callAnthropicWithRetry(prompt, { apiKey } = {}) {
  let result = await callAnthropic(prompt, { apiKey });
  if (result.ok && !result.truncated) return result;

  const reason = result.ok ? 'Antwort abgeschnitten (max_tokens)' : result.error.message;
  console.warn(`  ⚠️  Anthropic-Call fehlgeschlagen/unvollstaendig (${reason}) — einmaliger Retry nach 10s...`);
  await new Promise((r) => setTimeout(r, 10000));
  result = await callAnthropic(prompt, { apiKey });
  return result;
}

// ─── Baustein 19: Eine Strategie komplett durchlaufen ─────────────────────
//
// Fehlerisoliert: wirft NIE — bei jedem Fehlschlag wird { ok:false, ... }
// zurueckgegeben, main() entscheidet dann pro Strategie weiter (s.
// Abschnitt 8: "Ein Fehlschlag blockiert nicht den gesamten Lauf").
async function runStrategy(strategy, masterData, snapshot, promptVersion) {
  try {
    const { top10, top3Syms } = selectCandidates(strategy, masterData);
    if (top3Syms.length === 0) {
      return { ok: false, strategy, error: 'keine Kandidaten nach Filterung/Sortierung' };
    }

    const tickerListStr = buildTickerListString(top10);
    const prompt = buildPromptForStrategy(strategy, snapshot, tickerListStr, top10.length);
    const apiResult = await callAnthropicWithRetry(prompt);

    if (!apiResult.ok) {
      return { ok: false, strategy, error: apiResult.error };
    }

    const decisionSnapshots = top3Syms.map((sym, i) => {
      const candidate = top10.find((c) => c.sym === sym);
      return buildDecisionSnapshot(strategy, candidate, i + 1, snapshot);
    });
    const aiOutput = buildAiOutput(strategy, snapshot, apiResult, top3Syms, promptVersion);
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
  const masterDataPath = process.env.MASTER_DATA_PATH || path.join(process.cwd(), 'master_market_data.json');
  console.log(`Lese Aggregator-Output: ${masterDataPath}`);
  const rawJson = fs.readFileSync(masterDataPath, 'utf-8');
  const masterData = parsePythonStyleJson(rawJson);
  const rawTickers = masterData.tickers || masterData.results || [];
  console.log(`  ${rawTickers.length} Ticker geladen.`);

  console.log('\nBaue Daily Market Snapshot...');
  const snapshot = await buildDailyMarketSnapshot(masterData);
  console.log(`  ${snapshot.snapshot_id} — Regime: ${snapshot.mcm_regime}, QQQ: ${snapshot.qqq_markov_regime?.regime ?? 'n/a'}`);

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

  const successful = results.filter((r) => r.ok);
  console.log(`\n${successful.length}/${EQUITY_STRATEGIES.length} Strategien erfolgreich.`);

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
