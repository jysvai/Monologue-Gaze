#!/usr/bin/env node
/* 화면 점검 — 가짜 DOM 위에서 엔진을 돌려 사건의 모든 문서·인물·조사 도구 화면을 그려 본다.
 * 사용: node tools/smoke.js cases/c01-....js [...]   (undefined, 못 찾은 [[단어]], 깨진 화면을 찾는다)
 *       LANG_CODE=en node tools/smoke.js …          (그 언어의 번역을 덮어 그리고, 화면에 남은 한글도 센다)
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
global.localStorage = { getItem(k) { return k === 'mg-lang' ? LANG : null; }, setItem() {} }; // 기본은 한국어 원문 (js/i18n.js)
global.scrollTo = () => {};
global.addEventListener = () => {};
global.document = { baseURI: 'http://localhost/', body: stub(), head: stub(), documentElement: stub(), getElementById: el, querySelector: el, querySelectorAll: () => [], createElement: stub, addEventListener() {} };

vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/i18n.js'), 'utf8'));
if (LANG !== 'ko') { const dir = path.join(ROOT, 'i18n', LANG); fs.readdirSync(dir).filter(f => f.endsWith('.js')).forEach(f => vm.runInThisContext(fs.readFileSync(path.join(dir, f), 'utf8'))); }
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'img/manifest.js'), 'utf8')); // 그림 파일이 있는 자리는 SVG 대신 그림이 뜬다 (남은 한글 목록이 실제 화면과 같게)
vm.runInThisContext(fs.readFileSync(path.join(ROOT, 'js/engine.js'), 'utf8'));
let files = process.argv.slice(2);
if (!files.length) files = fs.readdirSync(path.join(ROOT, 'cases')).filter(f => /^c\d+.*\.js$/.test(f)).sort().map(f => path.join('cases', f)); // 인자가 없으면 사건 전부
const before = MG.cases.length;
files.forEach(f => vm.runInThisContext(fs.readFileSync(path.resolve(ROOT, f), 'utf8')));
const mine = MG.cases.slice(before); // 이 파일들이 등록한 사건 (파일 이름과 id 가 달라도: docs/examples/…)
if (!mine.length) { console.log('✗ 등록된 사건이 없음'); process.exit(1); }

let problems = 0;
const hangul = new Map(); // 번역한 언어로 그렸는데 화면 글자에 남은 한글 (눈으로 볼 목록)
const check = (label, html, mustHave) => {
  const bad = [];
  if (LANG !== 'ko') String(html).replace(/<[^>]*>/g, ' ').replace(/[^\s<>]*[가-힣][^\s<>]*/g, w => { if (!hangul.has(w)) hangul.set(w, label); return w; });
  if (/undefined|NaN|\[object Object\]/.test(html)) bad.push('undefined/NaN/object');
  const x = html.match(/class="kw-x">[^<]*/g); if (x) bad.push('unresolved kw: ' + x.join(', '));
  if (mustHave && !html.includes(mustHave)) bad.push('missing: ' + mustHave);
  if (bad.length) { problems++; console.log('✗', label, bad.join(' | ')); }
};

for (const c of mine) {
  const keys = Object.keys(c.keywords);
  const unl = [...Object.keys(c.docs).filter(id => c.docs[id].lock), ...c.sources.filter(s => s.lock).map(s => s.id)];
  const extra = [];
  // 실시간 수사: 신청서는 기각·접수·회신 상태를 돌아가며, 단톡방은 말이 다 온 상태로
  const reqs = c.sources.filter(s => s.type === 'request').flatMap(s => s.items || []);
  const fitems = c.sources.filter(s => s.type === 'feed').flatMap(s => s.items || []);
  const LIVE = (k = 0) => (c.live ? { t: 900, req: Object.fromEntries(reqs.map((r, i) => [r.id, [null, { st: 'no', at: 30 }, { st: 'wait', at: 40, due: 1200 }, { st: 'done', at: 50, due: 300 }][(i + k) % 4]]).filter(([, v]) => v)), fd: Object.fromEntries(fitems.map(it => [it.id, it.at || 0])), fx: reqs.length ? [{ t: 300, who: MG.T('회신'), msg: MG.T('회신'), doc: reqs[0].doc }] : [], rd: {}, late: true } : undefined);
  c.sources.forEach(s => {
    if (s.type === 'timeline' || s.type === 'cipher') extra.push(s.id);
    if (s.type === 'compare') (s.sets || []).forEach(x => extra.push(x.id));
    if (s.type === 'photo') (s.scenes || []).forEach(x => (x.spots || []).forEach(sp => extra.push(sp.id)));
  });
  const boot = (view, k) => {
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, live: LIVE(k), keys: [...keys], unl: [...unl], view, asked: view.asked || {} } } } });
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
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, live: LIVE(), keys: [...keys], unl: [...unl], view, asked: { [id]: asked } } } } });
    check(`${c.id} person ${id}`, el('#paneRead').innerHTML.replace(/k_zzz_unknown/g, ''), p.name); n++;
  }
  const views = [];
  c.sources.forEach(s => {
    if (s.type === 'timeline') views.push([s.id, { t: 'timeline', id: s.id }]);
    if (s.type === 'cipher') views.push([s.id, { t: 'cipher', id: s.id }]);
    if (s.type === 'compare') (s.sets || []).forEach(x => views.push([s.id, { t: 'compare', id: x.id }]));
    if (s.type === 'photo') (s.scenes || []).forEach(x => views.push([s.id, { t: 'photo', id: x.id }]));
    if (s.type === 'request') (s.items || []).forEach(r => [0, 1, 2, 3].forEach(k => views.push([s.id, { t: 'req', id: r.id }, k]))); // 신청서는 네 가지 상태 모두
    if (s.type === 'feed') views.push([s.id, { t: 'feed', id: s.id }]);
  });
  for (const solved of [false, true]) for (const [src, open, k] of views) {
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, live: LIVE(k), keys: [...keys], unl: solved ? [...unl, ...extra] : [...unl], view: { src, open, q: {} } } } } });
    check(`${c.id} ${open.t} ${open.id}${solved ? ' (solved)' : ''}`, el('#paneRead').innerHTML, 'class="doc-t"'); n++;
  }
  for (const s of c.sources) for (const k of s.type === 'request' ? [0, 1, 2, 3] : [0]) {
    boot({ src: s.id, q: s.type === 'archive' ? { [s.id]: c.keywords[keys[0]].label } : {} }, k);
    check(`${c.id} source ${s.id}${k ? ' #' + k : ''}`, el('#paneList').innerHTML); n++;
  }
  check(`${c.id} notebook`, el('#nb').innerHTML, 'CASE ' + String(c.no).padStart(2, '0'));
  // 수사 보고서: 빈 것 · 반려된 것 · 종결된 것 (화면 속 사건은 결재란까지)
  for (const [tries, solved] of [[0, false], [2, false], [1, true]]) {
    Object.keys(els).forEach(k => delete els[k]);
    MG.boot({ S: { intro: true, current: c.id, cases: { [c.id]: { cw: true, live: LIVE(), keys: [...keys], unl: [...unl], tries, solved, view: { open: { t: 'report' }, q: {} } } } } });
    check(`${c.id} report${solved ? ' (solved)' : tries ? ' (tried)' : ''}`, el('#paneRead').innerHTML, c.frame === 'crt' || c.frame === 'laptop' ? 'rep-sign' : 'rep-view'); n++;
  }
  // cabinet folder
  MG.boot({ S: { intro: true, current: null, cases: {} } });
  check(`${c.id} cabinet`, document.getElementById('app').innerHTML, c.title);
  const tagHtml = (() => { boot({ src: c.sources[0].id, q: {} }); return document.getElementById('app').innerHTML; })();
  if (/&lt;b&gt;/.test(tagHtml)) { problems++; console.log('✗', c.id, 'tag shows escaped <b>'); }
  console.log(`${c.id}: rendered ${n} views`);
}
if (hangul.size) { console.log(`한글이 남은 낱말 ${hangul.size}개:`); [...hangul].slice(0, +process.env.SHOW || 40).forEach(([w, at]) => console.log(`  ${w}   (${at})`)); }
console.log(problems ? `FAIL: ${problems} problem(s)` : 'SMOKE OK');
process.exit(problems ? 1 : 0); // 화면 시계(setInterval)가 프로세스를 붙잡지 않게
