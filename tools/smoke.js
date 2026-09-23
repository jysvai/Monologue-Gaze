#!/usr/bin/env node
/* 화면 점검 — 가짜 DOM 위에서 엔진을 돌려 사건의 모든 문서·인물·조사 도구 화면을 그려 본다.
 * 사용: node tools/smoke.js cases/c01-....js [...]   (undefined, 못 찾은 [[단어]], 깨진 화면을 찾는다)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..');

const els = {};
const stub = () => ({ innerHTML: '', textContent: '', dataset: {}, scrollTop: 0, clientWidth: 1200, offsetTop: 0, style: { setProperty() {} },
  classList: { toggle() {}, add() {}, remove() {}, contains() { return false; } }, scrollIntoView() {}, focus() {}, setAttribute() {}, appendChild() {} });
const el = s => (els[s] ||= stub());
global.window = global;
global.localStorage = { getItem() { return null; }, setItem() {} };
global.scrollTo = () => {};
global.document = { body: stub(), head: stub(), documentElement: stub(), getElementById: el, querySelector: el, querySelectorAll: () => [], createElement: stub, addEventListener() {} };

vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/engine.js'), 'utf8'));
const files = process.argv.slice(2);
files.forEach(f => vm.runInThisContext(fs.readFileSync(path.resolve(ROOT, f), 'utf8')));

let problems = 0;
const check = (label, html, mustHave) => {
  const bad = [];
  if (/undefined|NaN|\[object Object\]/.test(html)) bad.push('undefined/NaN/object');
  const x = html.match(/class="kw-x">[^<]*/g); if (x) bad.push('unresolved kw: ' + x.join(', '));
  if (mustHave && !html.includes(mustHave)) bad.push('missing: ' + mustHave);
  if (bad.length) { problems++; console.log('✗', label, bad.join(' | ')); }
};

for (const c of MG.cases.filter(c => files.some(f => f.includes(c.id)))) {
  const keys = Object.keys(c.keywords);
  const unl = [...Object.keys(c.docs).filter(id => c.docs[id].lock), ...c.sources.filter(s => s.lock).map(s => s.id)];
  const extra = [];
  c.sources.forEach(s => {
    if (s.type === 'timeline' || s.type === 'cipher') extra.push(s.id);
    if (s.type === 'compare') (s.sets || []).forEach(x => extra.push(x.id));
    if (s.type === 'photo') (s.scenes || []).forEach(x => (x.spots || []).forEach(sp => extra.push(sp.id)));
  });
  const boot = view => {
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, keys: [...keys], unl: [...unl], view, asked: view.asked || {} } } } });
  };
  let n = 0;
  for (const [id, d] of Object.entries(c.docs)) {
    boot({ src: d.src, open: { t: 'doc', id }, q: {} });
    check(`${c.id} doc ${id}`, el('#paneRead').innerHTML, 'class="doc-t"'); n++;
  }
  for (const [id, p] of Object.entries(c.people)) {
    const asked = [];
    Object.entries(p.ask || {}).forEach(([k, a]) => { asked.push(k); if (a && !Array.isArray(a) && a.need) asked.push(k + '!'); });
    asked.push('k_zzz_unknown'); // idle
    const view = { src: p.src, open: { t: 'person', id }, q: {} };
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, keys: [...keys], unl: [...unl], view, asked: { [id]: asked } } } } });
    check(`${c.id} person ${id}`, el('#paneRead').innerHTML.replace(/k_zzz_unknown/g, ''), p.name); n++;
  }
  const views = [];
  c.sources.forEach(s => {
    if (s.type === 'timeline') views.push([s.id, { t: 'timeline', id: s.id }]);
    if (s.type === 'cipher') views.push([s.id, { t: 'cipher', id: s.id }]);
    if (s.type === 'compare') (s.sets || []).forEach(x => views.push([s.id, { t: 'compare', id: x.id }]));
    if (s.type === 'photo') (s.scenes || []).forEach(x => views.push([s.id, { t: 'photo', id: x.id }]));
  });
  for (const solved of [false, true]) for (const [src, open] of views) {
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, keys: [...keys], unl: solved ? [...unl, ...extra] : [...unl], view: { src, open, q: {} } } } } });
    check(`${c.id} ${open.t} ${open.id}${solved ? ' (solved)' : ''}`, el('#paneRead').innerHTML, 'class="doc-t"'); n++;
  }
  for (const s of c.sources) {
    boot({ src: s.id, q: s.type === 'archive' ? { [s.id]: c.keywords[keys[0]].label } : {} });
    check(`${c.id} source ${s.id}`, el('#paneList').innerHTML); n++;
  }
  check(`${c.id} notebook`, el('#nb').innerHTML, 'CASE ' + String(c.no).padStart(2, '0'));
  // cabinet folder
  MG.boot({ S: { intro: true, current: null, cases: {} } });
  check(`${c.id} cabinet`, document.getElementById('app').innerHTML, c.title);
  const tagHtml = (() => { boot({ src: c.sources[0].id, q: {} }); return document.getElementById('app').innerHTML; })();
  if (/&lt;b&gt;/.test(tagHtml)) { problems++; console.log('✗', c.id, 'tag shows escaped <b>'); }
  console.log(`${c.id}: rendered ${n} views`);
}
console.log(problems ? `FAIL: ${problems} problem(s)` : 'SMOKE OK');
