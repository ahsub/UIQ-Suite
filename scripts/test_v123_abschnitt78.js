const G = require('./generate_public_recommendations.js');
const K = require('./vendor/ko-prompts.js');
const EQ = ['ko','momentum','breakout','vcp','swing','meanrev','breakdown','fading_short','dividend','value'];
const OP = ['csp_wheel','atmna','weekly_income','cc','collar'];
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('  FAIL', m); } };

console.log('T1 Prompt-Bau: String, voller Prompt inkl. 7+8-Anweisung, Cache-Praefix vorne');
const snap = { vix: 15.2, date: '2026-09-23', mcm_regime: 'BULL', qqq_markov_regime: { regime: 'FLAT' }, sector_rotation: null };
for (const s of EQ) {
  let r;
  try { r = G.buildPromptForStrategy(s, snap, 'AAA | Grade A', 10); }
  catch (e) { // Fallback: gleicher ctx direkt gegen ko-prompts, falls Fake-Snapshot nicht reicht
    r = G.normalizePromptResult(K.get(s, { marktkontext: 'X', vixStr: '15.2', optsCfg: G.DEFAULT_OPTS_CFG, isEic: false, mode: 'public', skipAbschnitt78: false }), s);
    r._viaFallback = e.message.slice(0, 60);
  }
  ok(typeof r.prompt === 'string', s + ' prompt string');
  ok(r.abschnitt7 === null && r.abschnitt8 === null, s + ' abschnitt null');
  ok(r.prompt.includes('7. WAS UIQ ABLEITEN KANN') && r.prompt.includes('8. WAS UIQ NICHT ABLEITEN KANN'), s + ' 7+8-Anweisung im Prompt');
  ok(r.prompt.startsWith(K.SHARED_STATIC_PREFIX), s + ' Cache-Praefix');
  ok(Array.isArray(G.buildCacheableContent(r.prompt)), s + ' cacheable');
  console.log('  ', s.padEnd(14), r.prompt.length, r._viaFallback ? '(ctx direkt: ' + r._viaFallback + ')' : '(buildPromptForStrategy)');
}
for (const s of OP) {
  // gleicher ctx wie buildOptionsPromptForStrategy() (nicht exportiert)
  const r = G.normalizePromptResult(K.get(s, { marktkontext: 'X', vixStr: '15.2', optsCfg: G.DEFAULT_OPTS_CFG, isEic: false, mode: 'public', skipAbschnitt78: false, top3Syms: ['A','B','C'] }), s);
  ok(r.prompt.includes('7. WAS UIQ ABLEITEN KANN') && r.prompt.startsWith(K.SHARED_STATIC_PREFIX) && r.abschnitt7 === null, s + ' options prompt');
  console.log('  ', s.padEnd(14), r.prompt.length);
}
let threw = false; try { G.normalizePromptResult({ prompt: 'x', abschnitt7: 'y', abschnitt8: 'z' }, 'vcp'); } catch (e) { threw = true; }
ok(threw, 'normalizePromptResult wirft bei Objekt');

console.log('T2 v1.22-Fehler reproduziert: echter Anweisungstext eingefuegt -> Struktur-Check PASS (blind), Inhalts-Check FAIL');
const body = (s) => `STRATEGIEPRINZIP\n\nText.\n\n---\n\n**1. MARKT**\n\nx\n\n**6. STRATEGISCHER TRADE-OFF**\n\nTrade-off-Text.\n\n**9. ENTSCHEIDUNGSRAHMEN**\n\nAbschluss.`;
for (const s of [...EQ, ...OP]) {
  const parts = K.get(s, { marktkontext: 'X', vixStr: '15.2', optsCfg: G.DEFAULT_OPTS_CFG, isEic: false, mode: 'public', skipAbschnitt78: true, top3Syms: ['A','B','C'] });
  const bad = G.insertAbschnitt78(body(s), parts.abschnitt7, parts.abschnitt8);
  const st = G.validateAbschnitt78Structure(bad);
  const ct = G.validatePublicSections78Content(bad);
  ok(st.ok === true, s + ' alter Strukturcheck war blind (erwartet PASS)');
  ok(ct.ok === false, s + ' neuer Inhaltscheck muss FAIL');
  if (s === 'vcp' || s === 'ko') console.log('   ', s, '->', ct.errors.join(' | '));
}

console.log('T3 plausibler Modelltext (Format wie v1.21-Modell-Output) -> PASS');
const good = (name) => `STRATEGIEPRINZIP\n\nText.\n\n---\n\n**1. MARKT**\n\nx\n\n**6. STRATEGISCHER TRADE-OFF**\n\nTrade-off.\n\n**7. WAS UIQ ABLEITEN KANN**\n\nDie genannten Titel weisen innerhalb des analysierten Universums die höchste Übereinstimmung mit den definierten ${name}-Kriterien auf.\n\n**8. WAS UIQ NICHT ABLEITEN KANN („Modell-Grenze")**\n\nDas Modell liefert hier keinen eindeutigen Hinweis, diesen Zielkonflikt zugunsten eines aggressiveren oder konservativeren Ansatzes aufzulösen. Einstiegszeitpunkt, Positionsgröße und individuelle Risikolage sind außerhalb von UIQ zu prüfen.\n\n**9. ENTSCHEIDUNGSRAHMEN**\n\nAbschluss.`;
const g = good('VCP-Setups');
ok(G.validateAbschnitt78Structure(g).ok, 'good struktur');
const gc = G.validatePublicSections78Content(g); ok(gc.ok && gc.warnings.length === 0, 'good inhalt ' + JSON.stringify(gc));

console.log('T4 Randfaelle');
ok(!G.validatePublicSections78Content(g.replace(/\*\*8\. WAS UIQ NICHT[\s\S]*?(?=\*\*9\.)/, '')).ok, 'fehlender Abschnitt 8 -> FAIL');
ok(!G.validatePublicSections78Content(g.replace('Die genannten Titel weisen innerhalb des analysierten Universums die höchste Übereinstimmung mit den definierten VCP-Setups-Kriterien auf.', 'Ja.')).ok, 'zu kurzer Abschnitt 7 -> FAIL');
const w = G.validatePublicSections78Content(g.replace('keinen eindeutigen Hinweis', 'keinen klaren Hinweis'));
ok(w.ok && w.warnings.length === 1, 'abweichender Modell-Grenze-Satz -> nur Warnung');
ok(!G.validatePublicSections78Content(g.replace('auf.\n', 'auf (Grundgesetz #11).\n')).ok, 'einzelner Marker -> FAIL');

console.log('T5 Ueberschrift und Text in derselben Zeile (moegliches Modellformat) -> PASS');
const same = g.replace('**7. WAS UIQ ABLEITEN KANN**\n\nDie', '**7. WAS UIQ ABLEITEN KANN:** Die')
              .replace('**8. WAS UIQ NICHT ABLEITEN KANN („Modell-Grenze")**\n\nDas', '**8. WAS UIQ NICHT ABLEITEN KANN („Modell-Grenze"):** Das');
const sc = G.validatePublicSections78Content(same); ok(sc.ok && G.validateAbschnitt78Structure(same).ok, 'same-line ' + JSON.stringify(sc));

console.log(fails === 0 ? '\nALLE TESTS GRUEN' : `\n${fails} FEHLER`);
process.exit(fails ? 1 : 0);
