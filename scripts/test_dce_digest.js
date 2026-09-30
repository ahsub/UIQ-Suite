#!/usr/bin/env node
/**
 * test_dce_digest.js — DCE-Trennung im Digest (v1.28, SUITE №72 / Runmap 2 Nacht A, ADR-1)
 * T1 pickDcePublic: nur Whitelist-Schluessel, fremde Schluessel fallen weg; null/Array/String -> null.
 * T2 buildDailyMarketSnapshot liest masterData.dce NICHT (intern gesetzt, dce_public fehlt -> dce_public null,
 *    kein snapshot.dce).
 * T3 buildPublicDigest: market_regime hat dce_public, KEIN Schluessel `dce`; im serialisierten Digest weder
 *    Confidence/Ampel/Richtung/Positionsgroesse noch Warntext des internen Objekts.
 * T4 (optional, UIQ_SNAPSHOT=<file.json.gz>) echter Snapshot: gleiche Pruefungen mit dem realen internen Objekt;
 *    dce_public aus dem Snapshot (Aggregator >= 5.46.0) wird unveraendert durchgereicht.
 * Lauf: node scripts/test_dce_digest.js   |   UIQ_SNAPSHOT=... node scripts/test_dce_digest.js
 */
const fs = require('fs'); const zlib = require('zlib');
const G = require('./generate_public_recommendations.js');
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };

const INTERNAL = { confidence: 73, mode: 'GREEN', direction: 'SELL', position_size: 0.9,
  warnings: ['GELBE AMPEL: Reduzierte Positionsgroessen'], var_95: -0.0136, cusum_alarm: false };
const PUB = { schema: 'dce_public/1', as_of: '2026-09-29', generated: '2026-09-30T01:12:43Z',
  signal_breadth: { status: 'ok', share_pct: 13.1, n: 738, threshold: 55, definition: 'x' },
  cusum: { status: 'n/v', reason: 'r1' }, var: { status: 'n/v', reason: 'r2' } };
const FORBID = ['position_size', 'GELBE AMPEL', 'Reduzierte Positionsgroessen', '"direction"', '"confidence":73', '"mode":"GREEN"'];

console.log('T1 pickDcePublic');
{
  const r = G.pickDcePublic({ ...PUB, confidence: 99, direction: 'BUY', extra: { a: 1 } });
  ok(JSON.stringify(Object.keys(r)) === JSON.stringify(['schema', 'as_of', 'generated', 'signal_breadth', 'cusum', 'var']), 'Whitelist-Schluessel');
  ok(!('confidence' in r) && !('direction' in r) && !('extra' in r), 'fremde Schluessel entfernt');
  ok(JSON.stringify(r.signal_breadth) === JSON.stringify(PUB.signal_breadth), 'signal_breadth unveraendert');
  for (const bad of [null, undefined, [], 'x', 5]) ok(G.pickDcePublic(bad) === null, `Eingabe ${JSON.stringify(bad)} -> null`);
}

async function digestFor(master) {
  const snap = await G.buildDailyMarketSnapshot(master);
  const digest = G.buildPublicDigest(snap, []);
  return { snap, digest, txt: JSON.stringify(digest) };
}
(async () => {
  console.log('T2/T3 synthetisch');
  {
    const m1 = { dce: INTERNAL, dce_public: PUB, meta: {}, tickers: [] };
    const a = await digestFor(m1);
    ok(!('dce' in a.snap), 'snapshot ohne dce'); ok(!('dce' in a.digest.market_regime), 'digest.market_regime ohne dce');
    ok(JSON.stringify(a.digest.market_regime.dce_public) === JSON.stringify(PUB), 'dce_public im Digest');
    for (const f of FORBID) ok(!a.txt.includes(f), `Digest enthaelt nicht: ${f}`);
    const b = await digestFor({ dce: INTERNAL, meta: {}, tickers: [] }); // dce_public fehlt
    ok(b.digest.market_regime.dce_public === null, 'ohne dce_public -> null, kein Ersatz aus dce');
    for (const f of FORBID) ok(!b.txt.includes(f), `(ohne dce_public) Digest enthaelt nicht: ${f}`);
  }
  if (process.env.UIQ_SNAPSHOT) {
    console.log('T4 echter Snapshot');
    const master = JSON.parse(zlib.gunzipSync(fs.readFileSync(process.env.UIQ_SNAPSHOT)).toString());
    const a = await digestFor(master);
    ok(!('dce' in a.digest.market_regime), 'echt: kein dce im Digest');
    if (master.dce_public) ok(JSON.stringify(a.digest.market_regime.dce_public) === JSON.stringify(G.pickDcePublic(master.dce_public)), 'echt: dce_public durchgereicht');
    else console.log('  Hinweis: Snapshot ohne dce_public (Aggregator < 5.46.0) -> Digest dce_public = null:', a.digest.market_regime.dce_public === null);
    if (master.dce) for (const f of ['"position_size"', String(master.dce.warnings?.[0] ?? '\u0000')]) ok(!a.txt.includes(f), `echt: Digest enthaelt nicht ${f}`);
  }
  console.log(fails ? `\n${fails} FEHLER` : '\nalle Tests gruen'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FEHLER', e); process.exit(1); });
