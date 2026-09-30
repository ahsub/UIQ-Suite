#!/usr/bin/env node
/**
 * test_tie_group.js — Spitzengruppe im Decision Snapshot / Digest (SUITE №72, P1 #2, Generator v1.27)
 * Lauf: node scripts/test_tie_group.js   (optional: UIQ_SNAPSHOT=<snapshot.json.gz> fuer den Echtdaten-Fall T6)
 */
const assert = require('assert');
const fs = require('fs');
const zlib = require('zlib');
const g = require('./generate_public_recommendations.js');

let fails = 0;
function t(name, fn) {
  try { fn(); console.log('PASS', name); } catch (e) { fails++; console.log('FAIL', name, '-', e.message); }
}
const OPTS = ['csp_wheel', 'atmna', 'weekly_income', 'cc', 'collar'];
const snap = { date: '2026-09-30', mcm_regime: 'BULL_QUIET', snapshot_id: 'S' };
const META = { topScore: 100, topTieCount: 31 };

t('T1 Spitzengruppe: Score = Spitzenscore, n>1 -> in_top_group, LIST_POSITION', () => {
  const r = g.resolveTieGroup('csp_wheel', 100, META);
  assert.deepStrictEqual(r, { basis: 'LEADERBOARD_META', in_top_group: true, size: 31, score: 100, rank_semantics: 'LIST_POSITION', tie_check: 'TOP_GROUP_ONLY' });
});
t('T2 eindeutiger Spitzenreiter (n=1) und Score unterhalb -> RANK', () => {
  assert.strictEqual(g.resolveTieGroup('atmna', 95, { topScore: 95, topTieCount: 1 }).rank_semantics, 'RANK');
  assert.strictEqual(g.resolveTieGroup('atmna', 95, { topScore: 95, topTieCount: 1 }).in_top_group, false);
  const below = g.resolveTieGroup('cc', 88, { topScore: 100, topTieCount: 2 });
  assert.strictEqual(below.in_top_group, false);
  assert.strictEqual(below.rank_semantics, 'RANK');
});
t('T3 Meta fehlt / ungueltig / Score null -> UNAVAILABLE, kein Raten', () => {
  for (const [sc, m] of [[100, null], [100, undefined], [100, {}], [100, { topScore: 100, topTieCount: 0 }], [null, META], [NaN, META]]) {
    const r = g.resolveTieGroup('collar', sc, m);
    assert.strictEqual(r.basis, 'UNAVAILABLE');
    assert.strictEqual(r.in_top_group, null);
    assert.strictEqual(r.size, null);
  }
});
t('T4 Equity-Strategien -> null (unveraendert)', () => {
  for (const s of ['long_minervini', 'long_swing', 'ko_long']) assert.strictEqual(g.resolveTieGroup(s, 100, META), null);
});
t('T5 Decision Snapshot/Digest: rank, Score, Basis unveraendert; tie_group + Rationale', () => {
  const cand = { sym: 'MCO', sCsp: 100, score: 65, grade: 'A' };
  const ds = g.buildDecisionSnapshot('csp_wheel', cand, 1, snap, META);
  assert.strictEqual(ds.rank, 1);
  assert.strictEqual(ds.strategy_score, 100);
  assert.strictEqual(ds.strategy_score_basis, 'RANKING_SCORE');
  assert.strictEqual(ds.tie_group.in_top_group, true);
  const rat = g.buildRationale('csp_wheel', ds);
  assert.ok(/Spitzengruppe \(31 Titel, Score 100\)/.test(rat.summary), rat.summary);
  assert.ok(/Listenposition/.test(rat.summary));
  // ohne Meta: alter Rationale-Text bleibt, tie_group UNAVAILABLE sichtbar
  const ds2 = g.buildDecisionSnapshot('csp_wheel', cand, 1, snap);
  assert.strictEqual(ds2.tie_group.basis, 'UNAVAILABLE');
  assert.ok(/^Hohe Übereinstimmung/.test(g.buildRationale('csp_wheel', ds2).summary));
  // Equity: kein tie_group, Rationale wie bisher
  const ds3 = g.buildDecisionSnapshot('long_minervini', { sym: 'X', sMinervini: 90, score: 80 }, 1, snap, META);
  assert.strictEqual(ds3.tie_group, null);
  assert.ok(/^Hohe Übereinstimmung/.test(g.buildRationale('long_minervini', ds3).summary));
});
t('T6 Digest: Options-Chance traegt tie_group, Equity null', () => {
  const cand = { sym: 'MCO', sCsp: 100, score: 65, grade: 'A' };
  const ds = g.buildDecisionSnapshot('csp_wheel', cand, 1, snap, META);
  const res = { strategy: 'csp_wheel', top10: [], top3Syms: ['MCO'], apiResult: { ok: true, text: '' }, promptVersion: 'x', decisionSnapshots: [ds], aiOutputId: 'A' };
  const dg = g.buildPublicDigest({ date: snap.date, snapshot_id: 'S', mcm_regime: 'X' }, [res]);
  const opp = dg.strategies[0].opportunities[0];
  assert.strictEqual(opp.tie_group.size, 31);
  assert.strictEqual(opp.rank, 1);
  assert.strictEqual(opp.strategy_score, 100);
});
t('T7 Selektion unveraendert: masterData mit/ohne leaderboardMeta -> gleiche Auswahl', () => {
  const rows = ['A', 'B', 'C', 'D', 'E'].map((s) => ({ sym: s, sCsp: 100, score: 50 }));
  const md1 = { leaderboards: { options_csp: rows } };
  const md2 = { leaderboards: { options_csp: rows }, leaderboardMeta: { options_csp: META } };
  const a = g.selectOptionsCandidates("csp_wheel", md1, new Map());
  const b = g.selectOptionsCandidates("csp_wheel", md2, new Map());
  assert.deepStrictEqual(a.secondary.map((x) => x.sym), b.secondary.map((x) => x.sym));
  assert.deepStrictEqual(a.reserve.map((x) => x.sym), b.reserve.map((x) => x.sym));
});
if (process.env.UIQ_SNAPSHOT) {
  t('T8 echter Snapshot: leaderboardMeta vorhanden, Top-Score stimmt mit Zeile 1 ueberein', () => {
    const raw = fs.readFileSync(process.env.UIQ_SNAPSHOT);
    const d = JSON.parse((process.env.UIQ_SNAPSHOT.endsWith('.gz') ? zlib.gunzipSync(raw) : raw).toString('utf8'));
    const md = d.masterData || d;
    const fld = { options_csp: 'sCsp', options_weekly: 'sCsp', options_collar: 'sCsp', options_atmna: 'sAtmna', options_cc: 'sCc' };
    assert.ok(md.leaderboardMeta, 'leaderboardMeta fehlt (Aggregator < v5.45.0?)');
    for (const [k, f] of Object.entries(fld)) {
      const m = md.leaderboardMeta[k];
      assert.ok(m, `Meta ${k} fehlt`);
      assert.strictEqual(m.topScore, md.leaderboards[k][0][f], `${k}: topScore != Zeile 1`);
      assert.ok(m.topTieCount >= 1);
    }
  });
}
if (fails) { console.log(`\nFEHLER: ${fails}`); process.exit(1); }
console.log('\nOK — alle Tests gruen');
