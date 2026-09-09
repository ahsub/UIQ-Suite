/**
 * ko-markov.js — Markov 2.0 Regime-Analyse
 * Version: 1.1 | ko-scanner v=128+
 * Repository: ahsub/ko-modules
 * Abhängigkeiten: ko-config.js (optional)
 */

function buildTransitionMatrix(regimes, stride) {
  // FIX 1: Stride-Sampling — nur nicht-überlappende Fenster
  // stride=1 → Legacy (überlappend, statistisch unehrlich)
  // stride=lookback → Markov 2.0 (nicht-überlappend, statistisch korrekt)
  let bb=0,bs=0,br=0, sb=0,ss=0,sr=0, rb=0,rs=0,rr=0;
  for (let i = stride; i < regimes.length; i += stride) {
    const prev = regimes[i - stride];
    const curr = regimes[i];
    if      (prev === 1)  { if(curr===1) bb++; else if(curr===0) bs++; else br++; }
    else if (prev === 0)  { if(curr===1) sb++; else if(curr===0) ss++; else sr++; }
    else                  { if(curr===1) rb++; else if(curr===0) rs++; else rr++; }
  }
  const fromBull = bb+bs+br || 1;
  const fromSide = sb+ss+sr || 1;
  const fromBear = rb+rs+rr || 1;
  return {
    // Transition-Wahrscheinlichkeiten (Zeilen summieren auf 1)
    bull: { bull:bb/fromBull, side:bs/fromBull, bear:br/fromBull },
    side: { bull:sb/fromSide, side:ss/fromSide, bear:sr/fromSide },
    bear: { bull:rb/fromBear, side:rs/fromBear, bear:rr/fromBear },
    // Stickiness = Diagonal
    bullSticky: Math.round(bb/fromBull*100),
    sideSticky: Math.round(ss/fromSide*100),
    bearSticky: Math.round(rr/fromBear*100),
    // Rohzahlen für Transparenz
    counts: { bb,bs,br, sb,ss,sr, rb,rs,rr }
  };
}

function verifyMarkovLabels(regimes, closes) {
  // FIX 2: Label-Verifikation gegen bekannte historische Perioden
  // Wir prüfen ob BEAR-Regime in stark fallenden Perioden korrekt detektiert wird
  // Nutzt die letzten 252 Bars (ca. 1 Jahr) als Prüfbereich
  if (!closes || closes.length < 100) return { ok: true, note: 'zu wenig Daten' };

  // Größter Drawdown im verfügbaren Zeitraum
  let maxDrop = 0, maxDropIdx = -1;
  for (let i = 20; i < closes.length; i++) {
    const drop = (closes[i] - closes[i-20]) / closes[i-20] * 100;
    if (drop < maxDrop) { maxDrop = drop; maxDropIdx = i; }
  }
  // Größter Anstieg
  let maxRise = 0, maxRiseIdx = -1;
  for (let i = 20; i < closes.length; i++) {
    const rise = (closes[i] - closes[i-20]) / closes[i-20] * 100;
    if (rise > maxRise) { maxRise = rise; maxRiseIdx = i; }
  }

  const regimeAtDrop = maxDropIdx >= 0 ? regimes[Math.min(maxDropIdx, regimes.length-1)] : null;
  const regimeAtRise = maxRiseIdx >= 0 ? regimes[Math.min(maxRiseIdx, regimes.length-1)] : null;

  const dropOk = regimeAtDrop === -1; // Stärkster Drawdown → BEAR erwartet
  const riseOk = regimeAtRise === 1;  // Stärkster Anstieg → BULL erwartet

  return {
    ok: dropOk && riseOk,
    dropOk, riseOk,
    maxDrop: Math.round(maxDrop*10)/10,
    maxRise: Math.round(maxRise*10)/10,
    regimeAtDrop, regimeAtRise,
    note: (!dropOk || !riseOk) ? 'WARNUNG: Label-Verifikation fehlgeschlagen — Schwellwerte prüfen' : 'Labels verifiziert ✓'
  };
}

function calcMarkovSignal(matrix, currentRegime) {
  // Signal = P(bull morgen) − P(bear morgen) aus aktuellem Regime
  let row;
  if      (currentRegime === 1)  row = matrix.bull;
  else if (currentRegime === 0)  row = matrix.side;
  else                           row = matrix.bear;
  return Math.round((row.bull - row.bear) * 100) / 100; // −1 bis +1
}

function calcMarkovRegime(closes, lookback, bullThresh, bearThresh, smoothLen) {
  lookback   = lookback   || 21;
  // Adaptiver Lookback: bei wenigen Bars kleineres Lookback
  if (closes && closes.length < 80 && lookback > 10) lookback = 10;
  else if (closes && closes.length < 120 && lookback > 15) lookback = 15;
  bullThresh = bullThresh || 3.0;
  bearThresh = bearThresh || 3.0;
  smoothLen  = smoothLen  || 5;
  if (!closes || closes.length < lookback * 2 + 5) return null; // mind. 47 Bars

  const n = closes.length;

  // ── State Labels ──────────────────────────────────────────────────────
  // Vollständige History labeln (für beide Matrizen)
  const regimes = [];
  for (let i = lookback; i < n; i++) {
    const logRet = Math.log(closes[i] / closes[i - lookback]) * 100;
    regimes.push(logRet >= bullThresh ? 1 : logRet <= -bearThresh ? -1 : 0);
  }
  const rn = regimes.length;

  // FIX 2: Label-Verifikation
  const labelCheck = verifyMarkovLabels(regimes, closes);

  // ── Transition-Matrizen (FIX 1: beide zeigen) ─────────────────────────
  // Legacy: stride=1 (überlappend, statistisch unehrlich)
  const matrixLegacy = buildTransitionMatrix(regimes, 1);
  // Markov 2.0: adaptiver Stride
  // Mindestens 10 nicht-überlappende Übergänge für stabile Matrix
  // Wenn zu wenige Bars: Stride halbieren bis min. 10 Fenster
  let stride20 = lookback;
  while (stride20 > 3 && Math.floor(rn / stride20) < 10) {
    stride20 = Math.max(3, Math.floor(stride20 / 2));
  }
  const strideNote = stride20 < lookback ? ' (adaptiert:' + stride20 + ')' : '';
  const matrix20     = buildTransitionMatrix(regimes, stride20);

  // Primär: Markov 2.0 Matrix für alle Signale
  const currentRegime = regimes[rn - 1];
  const prevRegime    = regimes[rn - 2];

  // FIX 3 FILTER Mode: Signal aus 2.0 Matrix
  const signal = calcMarkovSignal(matrix20, currentRegime);

  // Stickiness aus 2.0 Matrix
  const bullSticky = matrix20.bullSticky;
  const bearSticky = matrix20.bearSticky;
  const sideSticky = matrix20.sideSticky;
  const sticky = currentRegime === 1 ? bullSticky : currentRegime === -1 ? bearSticky : sideSticky;

  // Warnstufe
  const warnBull = 60;
  const warnBear = 55;
  const bullGap  = warnBull - bullSticky;
  const bearGap  = bearSticky - warnBear;
  let warnLevel  = 0;
  if (currentRegime === 1 && bullSticky < warnBull) {
    warnLevel = bullGap > 15 ? 3 : bullGap > 8 ? 2 : 1;
  } else if (currentRegime === -1 && bearSticky > warnBear) {
    warnLevel = bearGap > 15 ? 3 : bearGap > 8 ? 2 : 1;
  }

  // FILTER Mode: Long erlaubt wenn signal > threshold
  const filterThreshold = (typeof window !== 'undefined' && window._markovFilterThreshold) || 0.1;
  const filterMode = signal > filterThreshold ? 'LONG_OK'
                   : signal < -filterThreshold ? 'SHORT_OK'
                   : 'FLAT';

  // Bereinigtes σ-Signal: P(bull)-P(bear) - k×P(Bull→Bear)
  const pBull2Bear = (matrix20 && matrix20.bull) ? matrix20.bull.bear : 0;
  const K_TRENDBRUCH = (typeof KoConfig !== "undefined" && KoConfig.markov) ? KoConfig.markov.kTrendbruch : 2.5; // Gewichtungsfaktor für Trendbruch-Risiko
  const signalBereinigt = Math.max(-1, Math.min(1,
    signal - K_TRENDBRUCH * pBull2Bear
  ));
  // P(Bull→Bear) Alarm: >15% ist Warnung, >25% ist Gefahr
  const bullBearRisk = pBull2Bear > 0.25 ? 'GEFAHR'
    : pBull2Bear > 0.15 ? 'WARNUNG'
    : pBull2Bear > 0.08 ? 'ERHOHT'
    : 'OK';

  return {
    // Kern
    regime: currentRegime,
    signal: signal,               // Rohsignal P(bull)-P(bear)
    signalBereinigt: signalBereinigt, // Bereinigt um Trendbruch-Risiko
    pBull2Bear: pBull2Bear,       // Trendbruch-Wahrscheinlichkeit
    bullBearRisk: bullBearRisk,   // OK/ERHÖHT/WARNUNG/GEFAHR
    filterMode: filterMode,       // 'LONG_OK', 'SHORT_OK', 'FLAT'
    // Stickiness (aus 2.0 Matrix)
    bullSticky: bullSticky,
    bearSticky: bearSticky,
    sideSticky: sideSticky,
    sticky: sticky,
    // Matrizen
    matrix20: matrix20,           // FIX 1: Stride-sampled (statistisch korrekt)
    matrixLegacy: matrixLegacy,   // FIX 1: Legacy (zum Vergleich)
    // Validierung
    labelCheck: labelCheck,       // FIX 2: Label-Verifikation
    // Meta
    warnLevel: warnLevel,
    bullGap: Math.round(bullGap * 10) / 10,
    regimeChanged: currentRegime !== prevRegime,
    strideUsed: stride20,
    strideNote: strideNote,
    // Warnung wenn Legacy vs 2.0 stark abweichen (nur wenn genug Daten)
    matrixDivergence: Math.floor(rn / stride20) >= 8 && Math.abs(matrix20.bullSticky - matrixLegacy.bullSticky) > 15
  };
}

// Markov-Badge HTML fuer Ticker-Karte

// ── KO-MARKOV NAMESPACE ───────────────────────────────────────────────────
var KoMarkov = {

  isEnabled: function() {
    return typeof KoConfig === 'undefined' || KoConfig.isEnabled('markov');
  },

  calc: function(closes) {
    if (!this.isEnabled()) return null;
    if (!closes || closes.length < 30) return null;
    try { return calcMarkovRegime(closes); } catch(e) { return null; }
  },

  levelColor: function(risk) {
    return risk === 'GEFAHR'  ? 'var(--red)'
         : risk === 'WARNUNG' ? 'var(--amber)'
         : risk === 'ERHOHT'  ? '#f59e0b'
         : 'var(--green)';
  },
};

console.log('[ko-markov.js] geladen');
