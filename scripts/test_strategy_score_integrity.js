/**
 * test_strategy_score_integrity.js — Regressionstest strategy_score (SUITE №72, G1)
 * Version 1.1.0 (29.09.2026, Claude + Axel). Nur Lesen, keine Netzwerkzugriffe.
 *   1.1.0: T6 (Konsistenz Wert/Basis, zufaellig) und T7 (Quelltext-Sperre) ergaenzt.
 *
 * Prueft: strategy_score ist entweder der strategieeigene Ranking-Score (RANKING_SCORE)
 * oder null (UNAVAILABLE) — niemals der Composite-Score als stiller Ersatz.
 *
 *   T1  resolveStrategyScore: Feld vorhanden -> Wert + RANKING_SCORE (alle 15 Strategien)
 *   T2  resolveStrategyScore: Feld fehlt, Composite `score` vorhanden -> null + UNAVAILABLE
 *   T3  buildDecisionSnapshot und leanCandidateEntry uebernehmen genau dieses Verhalten
 *   T4  digest.strategy_score === Ranking-Score der Leaderboard-Zeile (fuenf Options-Strategien,
 *       synthetische Zeilen; Ledger/Digest-Kette)
 *   T6  Invariante Wert/Basis (zufaellige Kandidaten, alle 15 Strategien): basis === 'RANKING_SCORE'
 *       genau dann, wenn value !== null; value ist dann exakt der Feldwert, sonst null — der Composite
 *       `score` beeinflusst das Ergebnis nie
 *   T7  Quelltext-Sperre: im Generator darf strategy_score/score in Decision-Snapshot, Ledger, Digest
 *       und Kandidaten-Pool an keiner Stelle aus `.score` (Composite) abgeleitet werden — auch nicht
 *       ueber einen neuen Codepfad neben resolveStrategyScore() (Kommentarzeilen ausgenommen)
 *   T5  optional, echter Snapshot (UIQ_SNAPSHOT=/pfad/2026-09-29_01.json.gz): Top 3 je Options-
 *       Leaderboard muessen das Sortierfeld tragen und im Digest exakt wiedergeben.
 *       SCHLAEGT MIT AGGREGATOR < v5.44.1 FEHL (Feld fehlt in den Zeilen) — gewollt.
 *
 * Aufruf:  node scripts/test_strategy_score_integrity.js
 *          UIQ_SNAPSHOT=... node scripts/test_strategy_score_integrity.js
 * Exit 0 = alle Tests gruen, 1 = Fehler.
 */
const fs = require('fs');
const zlib = require('zlib');
const G = require('./generate_public_recommendations.js');

const EQ = G.EQUITY_STRATEGIES;
const OP = G.OPTIONS_STRATEGIES;
const ALL = [...EQ, ...OP];
const FIELD = (s) => G.STRAT_SCORE_FIELD[s] ?? G.OPTIONS_STRAT_SCORE_FIELD[s];

let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };
const snap = { date: '2026-09-29', snapshot_id: 'SNAP-TEST', mcm_regime: 'BULL_QUIET', vix: 15.0,
               qqq_markov_regime: null, sector_rotation: null, dce: null };

console.log('T1 Feld vorhanden -> RANKING_SCORE');
for (const s of ALL) {
  const r = G.resolveStrategyScore(s, { sym: 'AAA', score: 59, [FIELD(s)]: 100 });
  ok(r.value === 100 && r.basis === 'RANKING_SCORE', `${s}: erwartet 100/RANKING_SCORE, war ${r.value}/${r.basis}`);
}
console.log('T2 Feld fehlt -> null/UNAVAILABLE, kein Composite-Ersatz');
for (const s of ALL) {
  const r = G.resolveStrategyScore(s, { sym: 'AAA', score: 59 });
  ok(r.value === null && r.basis === 'UNAVAILABLE', `${s}: erwartet null/UNAVAILABLE, war ${r.value}/${r.basis}`);
}
console.log('T3 buildDecisionSnapshot / leanCandidateEntry');
for (const s of ALL) {
  const withF = { sym: 'AAA', score: 59, grade: 'B', [FIELD(s)]: 97 };
  const noF = { sym: 'BBB', score: 59, grade: 'B' };
  const d1 = G.buildDecisionSnapshot(s, { ...withF }, 1, snap);
  const d2 = G.buildDecisionSnapshot(s, { ...noF }, 2, snap);
  ok(d1.strategy_score === 97 && d1.strategy_score_basis === 'RANKING_SCORE', `${s}: Decision-Snapshot mit Feld`);
  ok(d2.strategy_score === null && d2.strategy_score_basis === 'UNAVAILABLE', `${s}: Decision-Snapshot ohne Feld`);
  const l1 = G.leanCandidateEntry(s, { ...withF }, 1);
  const l2 = G.leanCandidateEntry(s, { ...noF }, 2);
  ok(l1.score === 97 && l1.scoreBasis === 'RANKING_SCORE', `${s}: lean mit Feld`);
  ok(l2.score === null && l2.scoreBasis === 'UNAVAILABLE', `${s}: lean ohne Feld`);
}

console.log('T6 Invariante Wert/Basis (zufaellig)');
{
  let seed = 29;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let n = 0; n < 400; n++) {
    const s = ALL[n % ALL.length];
    const f = FIELD(s);
    const composite = Math.round(rnd() * 100);
    const cand = { sym: 'R' + n, score: composite };
    const mode = n % 4;                       // 0 Feld ok, 1 Feld fehlt, 2 Feld null, 3 Feld NaN
    let expected = null;
    if (mode === 0) { cand[f] = Math.round(rnd() * 100); expected = cand[f]; }
    else if (mode === 2) cand[f] = null;
    else if (mode === 3) cand[f] = NaN;
    const r = G.resolveStrategyScore(s, cand);
    ok(r.value === expected, `${s} mode ${mode}: value ${r.value} != ${expected}`);
    ok((r.basis === 'RANKING_SCORE') === (r.value !== null), `${s} mode ${mode}: Basis ${r.basis} inkonsistent zu value ${r.value}`);
    ok(r.basis === 'RANKING_SCORE' || r.basis === 'UNAVAILABLE', `${s}: unbekannte Basis ${r.basis}`);
    const d = G.buildDecisionSnapshot(s, { ...cand }, 1, snap);
    ok(d.strategy_score === r.value && d.strategy_score_basis === r.basis, `${s} mode ${mode}: Decision-Snapshot weicht ab`);
  }
}

console.log('T7 Quelltext-Sperre gegen Composite-Rueckfall');
{
  const src = fs.readFileSync(require.resolve('./generate_public_recommendations.js'), 'utf8')
    .split('\n').filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join('\n');
  const patterns = [
    [/\?\?\s*[A-Za-z_.]*\.score\b/, 'Fallback "?? x.score"'],
    [/\|\|\s*[A-Za-z_.]*\.score\b/, 'Fallback "|| x.score"'],
    [/strategy_score\s*:\s*[^,\n}]*\.score\b/, 'strategy_score aus .score abgeleitet'],
    [/\bscore\s*:\s*candidate\.score\b/, 'score: candidate.score (Kandidaten-Pool)'],
  ];
  for (const [re, label] of patterns) ok(!re.test(src), `Quelltext enthaelt: ${label}`);
}

function digestFor(strategy, rows, snapshot) {
  const top3 = rows.slice(0, 3);
  const ds = top3.map((c, i) => G.buildDecisionSnapshot(strategy, { ...c }, i + 1, snapshot));
  const digest = G.buildPublicDigest(snapshot, [{
    strategy, top10: top3, top3Syms: top3.map((c) => c.sym), apiResult: null,
    promptVersion: 'test', decisionSnapshots: ds, aiOutputId: 'AI-TEST',
  }]);
  return digest.strategies[0].opportunities;
}

console.log('T4 digest.strategy_score === Ranking-Score (synthetische Options-Zeilen)');
for (const s of OP) {
  const f = FIELD(s);
  const rows = [100, 100, 100, 99].map((v, i) => ({ sym: 'S' + i, score: [59, 95, 65, 40][i], grade: 'B', [f]: v }));
  const opp = digestFor(s, rows, snap);
  opp.forEach((o, i) => {
    ok(o.strategy_score === rows[i][f], `${s} Rang ${o.rank}: digest ${o.strategy_score} != Ranking-Score ${rows[i][f]}`);
    ok(o.strategy_score !== rows[i].score, `${s} Rang ${o.rank}: digest zeigt Composite ${rows[i].score}`);
    ok(o.strategy_score_basis === 'RANKING_SCORE', `${s} Rang ${o.rank}: Basis ${o.strategy_score_basis}`);
  });
}

if (process.env.UIQ_SNAPSHOT) {
  console.log('T5 echter Snapshot:', process.env.UIQ_SNAPSHOT);
  const d = JSON.parse(zlib.gunzipSync(fs.readFileSync(process.env.UIQ_SNAPSHOT)));
  for (const s of OP) {
    const lb = G.OPTIONS_LEADERBOARD_KEY[s];
    const rows = (d.leaderboards || {})[lb] || [];
    const f = FIELD(s);
    const missing = rows.filter((r) => !(f in r)).length;
    ok(rows.length > 0, `${s}: Leaderboard ${lb} leer`);
    ok(missing === 0, `${s}: Sortierfeld ${f} fehlt in ${missing}/${rows.length} Zeilen von ${lb} (Aggregator < v5.44.1?)`);
    if (missing === 0 && rows.length) {
      const opp = digestFor(s, rows, snap);
      opp.forEach((o, i) => ok(o.strategy_score === rows[i][f], `${s} Rang ${o.rank}: digest ${o.strategy_score} != ${rows[i][f]}`));
      // Zusatz: Sortierung der Zeilen entspricht dem Feld (absteigend)
      for (let i = 1; i < rows.length; i++) ok(rows[i - 1][f] >= rows[i][f], `${s}: ${lb} nicht absteigend nach ${f} bei Zeile ${i}`);
    }
  }
} else {
  console.log('T5 uebersprungen (UIQ_SNAPSHOT nicht gesetzt)');
}

console.log(fails === 0 ? '\nOK — alle Tests gruen' : `\n${fails} Fehler`);
process.exit(fails === 0 ? 0 : 1);
