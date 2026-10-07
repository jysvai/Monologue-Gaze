#!/usr/bin/env node
/* 짚어 보기 점검 — 「막혔을 때 짚어 보기」가 짚는 곳만 차례로 따라가는 가상의 수사관을 돌린다.
 * 사용: node tools/nudge-sim.js [cases/c01-....js ...]   (인자가 없으면 사건 전부)
 *       LANG_CODE=en node tools/nudge-sim.js …          (번역을 덮어서)
 * 짚어 보기가 더 짚을 곳이 없다고 할 때까지 따라간 뒤, 그때까지 못 본 문서·단어와
 * 쓸 메모가 아직 하나도 보이지 않는 보고서 주장을 알려 준다 (짚어 보기가 놓치는 길).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

const els = {};
const stub = () => ({ innerHTML: '', textContent: '', dataset: {}, scrollTop: 0, clientWidth: 1200, offsetTop: 0, style: { setProperty() {}, removeProperty() {} },
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, scrollIntoView() {}, focus() {}, getBoundingClientRect() { return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }; }, setAttribute() {}, appendChild() {}, querySelector() { return null; }, querySelectorAll() { return []; } });
const el = s => (els[s] ||= stub());
global.window = global;
const LANG = process.env.LANG_CODE || 'ko';
global.localStorage = { getItem(k) { return k === 'mg-lang' ? LANG : null; }, setItem() {} };
global.scrollTo = () => {};
global.addEventListener = () => {};
global.setTimeout = () => 0; // 연출 지연은 건너뛴다
global.document = { baseURI: 'http://localhost/', body: stub(), head: stub(), documentElement: stub(), getElementById: el, querySelector: el, querySelectorAll: () => [], createElement: stub, addEventListener() {} };

vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8'));
if (LANG !== 'ko') { const dir = path.join(ROOT, 'i18n', LANG); fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => vm.runInThisContext(fs.readFileSync(path.join(dir, f), 'utf8'))); }
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'img/manifest.js'), 'utf8'));
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/engine.js'), 'utf8'));
let files = process.argv.slice(2);
if (!files.length) files = fs.readdirSync(path.join(ROOT, 'cases')).filter(f => /^c\d+.*\.js$/.test(f)).sort().map(f => path.join('cases', f));
const before = MG.cases.length;
files.forEach(f => vm.runInThisContext(fs.readFileSync(path.resolve(ROOT, f), 'utf8')));
const mine = MG.cases.slice(before);

const D = MG.dev;
let bad = 0;
for (const c of mine) {
  Object.keys(els).forEach(k => delete els[k]);
  MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true } } } });
  const ST = D.st();
  const push = (a, x) => { if (!a.includes(x)) a.push(x); };
  const keys = ks => (ks || []).forEach(k => push(ST.keys, k));
  const src = id => c.sources.find(s => s.id === id);
  const fIs = (f, w) => !!f && (f === w || f.startsWith(w + '.'));
  const okAll = need => (need || []).every(n => (n[0] === '!' ? ST.notes.some(x => fIs(x.f, n.slice(1))) : n[0] === '#' ? ST.unl.includes(n.slice(1)) : n[0] === '@' || n[0] === '~' || n[0] === '?' ? true : ST.keys.includes(n)));
  let steps = 0, last = '', same = 0, waits = 0;
  const kinds = {};
  for (; steps < 3000; steps++) {
    const L = D.leads();
    if (!L.length) break;
    const x = L[0], [kind, rest] = [x.key.split(':')[0], x.key.slice(x.key.indexOf(':') + 1)];
    // 수첩에 뜨는 쪽지 그대로: 깨진 글자·번역이 빠진 한글이 없나
    D.toggle(); D.more(); const note = D.nudge(); D.toggle();
    const txt = note.replace(/<[^>]*>/g, ' ');
    if (/undefined|NaN|\[object/.test(note) || (LANG !== 'ko' && /[가-힣]/.test(txt)) || !note.includes(x.a.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])))) { console.log(`✗ ${c.id}: 쪽지가 이상하다 — ${txt.trim().slice(0, 160)}`); bad++; }
    kinds[kind] = (kinds[kind] || 0) + 1;
    if (x.key === last) { if (++same > 3) { console.log(`✗ ${c.id}: 같은 곳을 계속 짚는다 — ${x.key} (${x.a} / ${x.b})`); bad++; break; } } else { last = x.key; same = 0; }
    let cost = 'doc';
    if (kind === 'doc') push(ST.seen, rest);
    else if (kind === 'meet') ST.asked[rest] ||= [];
    else if (kind === 'word') push(ST.keys, rest);
    else if (kind === 'press' || kind === 'ask') {
      const [p, e0] = rest.split('|'), e = kind === 'press' ? e0 + '!' : e0;
      push((ST.asked[p] ||= []), e); cost = 'ask';
    } else if (kind === 'find') {
      const [s, k] = rest.split('|');
      c.docs && Object.values(c.docs).filter(d => d.src === s && (d.find || []).includes(k) && okAll(d.need) && (!d.lock || ST.unl.includes(d.id))).forEach(d => push(ST.seen, d.id));
      cost = 'search';
    } else if (kind === 'fact') ST.notes.push({ id: ++ST.nid, f: rest, t: rest, ref: 'sim#' + rest });
    else if (kind === 'why') { const r = c.sources.flatMap(s => s.items || []).find(i => i.id === rest); ST.notes.push({ id: ++ST.nid, f: r.why[0], t: r.why[0], ref: 'sim#' + r.why[0] }); }
    else if (kind === 'lock') {
      push(ST.unl, rest);
      const lk = (src(rest) || {}).lock || (c.docs[rest] || {}).lock || {};
      keys(lk.keys);
    } else if (kind === 'solve') { push(ST.unl, rest); keys(((src(rest) || {}).reward || {}).keys); }
    else if (kind === 'cmp') { const x2 = c.sources.flatMap(s => s.sets || []).find(s => s.id === rest); push(ST.unl, rest); keys((x2.reward || {}).keys); cost = 'compare'; }
    else if (kind === 'spot') { const sp = c.sources.flatMap(s => (s.scenes || []).flatMap(sc => sc.spots || [])).find(s => s.id === rest); push(ST.unl, rest); keys(sp.keys); cost = 'photo'; }
    else if (kind === 'query') {
      const s = c.sources.find(s2 => (s2.records || []).some(r => r.doc === rest)), r = s.records.find(r2 => r2.doc === rest);
      push((ST.found[s.id] ||= []), rest); keys(r.keys); cost = 'query';
    } else if (kind === 'req') {
      const r = c.sources.flatMap(s => s.type === 'request' ? s.items || [] : []).find(i => i.id === rest), L2 = ST.live;
      L2.req[rest] = { st: 'wait', at: L2.t, due: L2.t + (r.eta || 0), note: null, tries: 0 }; cost = 'write';
    } else if (kind === 'wait') { D.wait(); waits++; continue; }
    else { console.log(`✗ ${c.id}: 모르는 짚기 ${x.key}`); bad++; break; }
    D.advance(cost);
  }
  // 짚어 보기가 끝났다고 할 때 남은 것. 갈림길(둘 중 하나만 오는 결말)은 어느 쪽이든 하나만 보면 된다
  const FORK = { c14: [['d_fd_stakeout', 'd_fd_lost']] };
  const forked = id => (FORK[c.id] || []).some(g => g.includes(id) && g.some(x => ST.seen.includes(x)));
  const docs = Object.keys(c.docs).filter(id => !ST.seen.includes(id) && !forked(id));
  const ks = Object.keys(c.keywords).filter(k => !ST.keys.includes(k));
  const D2 = MG.dev.nudge; // 끝 쪽지 (보고서 쪽으로) 가 제대로 그려지나
  D.toggle(); D.more(); const end = D2();
  const claims = c.solution.claims.filter(cl => !(cl.accept || []).some(f => {
    const RX = new RegExp('"' + f + '[".]'), RXF = new RegExp('"f":"' + f + '[".]'); // 「갈래.세부」 사실도 갈래 이름으로 찾는다
    // 그 사실이 든 덩이를 이미 읽었나 — 문서는 seen, 대답은 asked
    const inDoc = Object.values(c.docs).some(d => ST.seen.includes(d.id) && JSON.stringify(d.body || []).match(RXF) || ST.seen.includes(d.id) && JSON.stringify(d.body || []).match(RX));
    const inAns = Object.values(c.people).some(p => Object.entries(p.ask || {}).some(([k, a]) => JSON.stringify(a).match(RX) && (ST.asked[p.id] || []).some(e => e.replace(/!$/, '') === k)) || (ST.asked[p.id] && JSON.stringify(p.intro || []).match(RX)));
    const inSpot = c.sources.some(s => (s.scenes || []).some(sc => (sc.spots || []).some(sp => ST.unl.includes(sp.id) && JSON.stringify(sp.body || []).match(RX))));
    const inMisc = c.sources.some(s => (ST.unl.includes(s.id) && JSON.stringify(s.solved || []).match(RX)) || (s.sets || []).some(x => ST.unl.includes(x.id) && JSON.stringify(x.solved || []).match(RX)) || (s.items || []).some(it => fIs(it.f, f) && ST.live && it.id in ST.live.fd));
    return inDoc || inAns || inSpot || inMisc;
  })).map(cl => cl.id);
  const ok = !docs.length && !claims.length && /nudge/.test(end);
  if (!ok) bad++;
  console.log(`${ok ? '✓' : '✗'} ${c.id} · 짚기 ${steps}번${waits ? ` (기다리기 ${waits})` : ''} · ${Object.entries(kinds).map(([k, n]) => `${k} ${n}`).join(' ')}`);
  if (docs.length) console.log(`   못 본 문서 ${docs.length}: ${docs.join(', ')}`);
  if (ks.length) console.log(`   못 얻은 단어 ${ks.length}: ${ks.join(', ')}`);
  if (claims.length) console.log(`   쓸 메모가 안 보이는 주장: ${claims.join(', ')}`);
}
console.log(bad ? `짚어 보기 점검: ${bad}건 문제` : '짚어 보기 점검: OK');
process.exit(bad ? 1 : 0);
