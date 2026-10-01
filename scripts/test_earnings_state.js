#!/usr/bin/env node
/**
 * test_earnings_state.js — earnings_state im Decision Snapshot / Digest (SUITE №72, P1 #3 Schritt 1, Generator v1.30)
 * Lauf: node scripts/test_earnings_state.js   (optional: UIQ_SNAPSHOT=<snapshot.json.gz> fuer den Echtdaten-Fall)
 */
const assert = require('assert');
const fs = require('fs');
const zlib = require('zlib');
const g = require('./generate_public_recommendations.js');

let fails = 0;
function t(name, fn) {
  try { fn(); console.log('PASS', name); } catch (e) { fails++; console.log('FAIL', name, '-', e.message); }
}
const snap = { date: '2026-10-01', mcm_regime: 'BULL_QUIET', snapshot_id: 'S' };
const mk = (rows) => g.buildEarningsInfo({ tickers: rows });

t('T1 Zustandstabelle inkl. Grenzen 0/1/7/8/14/15', () => {
  const rows = [
    ['A0', 'KNOWN_FUTURE', 0], // inkonsistent -> UNKNOWN
    ['A1', 'KNOWN_FUTURE', 1], ['A7', 'KNOWN_FUTURE', 7], ['A8', 'KNOWN_FUTURE', 8], ['A14', 'KNOWN_FUTURE', 14],
    ['A15', 'KNOWN_FUTURE', 15], ['A90', 'KNOWN_FUTURE', 90],
  ].map(([sym, earningsStatus, earningsDTE]) => ({ sym, earningsStatus, earningsDTE }));
  const info = mk(rows);
  const want = { A0: 'UNKNOWN', A1: 'BLOCKED', A7: 'BLOCKED', A8: 'IN_WINDOW_SOFT', A14: 'IN_WINDOW_SOFT', A15: 'NONE_IN_WINDOW', A90: 'NONE_IN_WINDOW' };
  for (const [s, w] of Object.entries(want)) assert.strictEqual(g.resolveEarningsState(s, info).state, w, s);
});
t('T2 UNKNOWN fuer alle Nicht-Termin-Zustaende; nie NONE_IN_WINDOW', () => {
  const rows = [
    { sym: 'P', earningsStatus: 'STALE_PAST', earningsDTE: -30 }, { sym: 'N', earningsStatus: 'NOT_QUERIED', earningsDTE: null },
    { sym: 'D', earningsStatus: 'NO_DATE', earningsDTE: null }, { sym: 'E', earningsStatus: 'LOOKUP_ERROR', earningsDTE: null },
    { sym: 'M', earningsDTE: 40 }, // Statusfeld fehlt (Aggregator < v5.47.0): kein Raten
    { sym: 'S', earningsStatus: 'KNOWN_FUTURE', earningsDTE: '20' }, { sym: 'B', earningsStatus: 'KNOWN_FUTURE', earningsDTE: null },
  ];
  const info = mk(rows);
  for (const r of rows) {
    const e = g.resolveEarningsState(r.sym, info);
    assert.strictEqual(e.state, 'UNKNOWN', r.sym);
    assert.strictEqual(e.dte, null);
  }
  assert.strictEqual(g.resolveEarningsState('M', info).source_status, 'NO_STATUS_FIELD');
  assert.strictEqual(g.resolveEarningsState('NIX', info).state, 'UNKNOWN'); // Symbol nicht im Master
  assert.strictEqual(g.resolveEarningsState('X', undefined).state, 'UNKNOWN');
});
t('T3 Decision Snapshot/Digest tragen earnings_state; Rang, Score, tie_group unveraendert', () => {
  const cand = { sym: 'MCO', sCsp: 100, score: 65, grade: 'A' };
  const META = { topScore: 100, topTieCount: 31 };
  const a = g.buildDecisionSnapshot('csp_wheel', cand, 1, snap, META);
  const b = g.buildDecisionSnapshot('csp_wheel', cand, 1, snap, META, mk([{ sym: 'MCO', earningsStatus: 'KNOWN_FUTURE', earningsDTE: 30 }]));
  assert.strictEqual(a.earnings_state.state, 'UNKNOWN');
  assert.strictEqual(b.earnings_state.state, 'NONE_IN_WINDOW');
  const strip = (x) => { const c = { ...x }; delete c.earnings_state; return c; };
  assert.deepStrictEqual(strip(a), strip(b));
  const res = { strategy: 'csp_wheel', top10: [], top3Syms: ['MCO'], apiResult: { ok: true, text: '' }, promptVersion: 'x', decisionSnapshots: [b], aiOutputId: 'A' };
  const opp = g.buildPublicDigest({ date: snap.date, snapshot_id: 'S', mcm_regime: 'X' }, [res]).strategies[0].opportunities[0];
  assert.strictEqual(opp.earnings_state.state, 'NONE_IN_WINDOW');
  assert.strictEqual(opp.earnings_state.dte, 30);
  assert.strictEqual(opp.rank, 1);
  assert.strictEqual(g.buildRationale('csp_wheel', a).summary, g.buildRationale('csp_wheel', b).summary); // Text unveraendert
});
t('T4 Gate/Auswahl unveraendert: mit vs. ohne earningsStatus identisch (Lookup, Ausschluesse, Kandidaten)', () => {
  const base = ['A', 'B', 'C', 'D', 'E', 'F'].map((s, i) => ({ sym: s, earningsDTE: [null, -5, 0, 3, 10, 40][i] }));
  const withS = base.map((r, i) => ({ ...r, earningsStatus: ['NOT_QUERIED', 'STALE_PAST', 'STALE_PAST', 'KNOWN_FUTURE', 'KNOWN_FUTURE', 'KNOWN_FUTURE'][i] }));
  assert.deepStrictEqual([...g.buildEarningsLookup({ tickers: base })], [...g.buildEarningsLookup({ tickers: withS })]);
  const rows = base.map((r) => ({ sym: r.sym, sCsp: 100, score: 50 }));
  const sel = (tk) => { const md = { tickers: tk, leaderboards: { options_csp: rows } };
    return g.selectOptionsCandidates('csp_wheel', md, g.buildEarningsLookup(md)); };
  const x = sel(base), y = sel(withS);
  assert.deepStrictEqual(x.secondary.map((c) => c.sym), y.secondary.map((c) => c.sym));
  assert.deepStrictEqual(x.exclusions, y.exclusions);
  assert.ok(x.exclusions.length > 0, 'Gate muss weiterhin ausschliessen (DTE<7)');
});
if (process.env.UIQ_SNAPSHOT) {
  const raw = fs.readFileSync(process.env.UIQ_SNAPSHOT);
  const d = JSON.parse((process.env.UIQ_SNAPSHOT.endsWith('.gz') ? zlib.gunzipSync(raw) : raw).toString('utf8'));
  const md = d.masterData || d;
  const tk = md.tickers || [];
  t('T5 Echtdaten: Verteilung; Altsnapshot ohne Statusfeld -> alles UNKNOWN (kein Raten)', () => {
    const hasField = tk.some((x) => x.earningsStatus);
    const info = g.buildEarningsInfo(md);
    const cnt = {};
    for (const x of tk) { const s = g.resolveEarningsState(x.sym, info).state; cnt[s] = (cnt[s] || 0) + 1; }
    console.log('  Statusfeld vorhanden:', hasField, '| Verteilung:', JSON.stringify(cnt));
    if (!hasField) assert.deepStrictEqual(Object.keys(cnt), ['UNKNOWN']);
    else assert.ok(!('NONE_IN_WINDOW' in cnt) || tk.filter((x) => x.earningsStatus === 'KNOWN_FUTURE' && x.earningsDTE > 14).length === cnt.NONE_IN_WINDOW);
  });
  t('T6 Echtdaten, simulierter Status aus Altfeldern (wie Aggregator v5.47.0): Mapping + Gate unveraendert', () => {
    const sim = tk.map((x, i) => ({ ...x, earningsStatus: i >= 200 || x.earningsDate == null ? 'NOT_QUERIED' : (x.earningsDTE >= 1 ? 'KNOWN_FUTURE' : 'STALE_PAST') }));
    const info = g.buildEarningsInfo({ tickers: sim });
    const cnt = {};
    for (const x of sim) { const s = g.resolveEarningsState(x.sym, info).state; cnt[s] = (cnt[s] || 0) + 1; }
    console.log('  simuliert:', JSON.stringify(cnt));
    assert.strictEqual(cnt.UNKNOWN, tk.filter((x, i) => !(i < 200 && x.earningsDate != null && x.earningsDTE >= 1)).length);
    assert.deepStrictEqual([...g.buildEarningsLookup({ tickers: tk })], [...g.buildEarningsLookup({ tickers: sim })]);
    // jeder NONE_IN_WINDOW hat einen belastbaren Termin > 14
    for (const x of sim) if (g.resolveEarningsState(x.sym, info).state === 'NONE_IN_WINDOW') assert.ok(x.earningsDTE > 14 && x.earningsDate);
  });
}
console.log(fails ? `\n${fails} FEHLER` : '\nalle Tests gruen');
process.exit(fails ? 1 : 0);
