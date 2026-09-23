#!/usr/bin/env node
/* 사건 파일 검사기 — 형식 검사 + 추적 경로(풀이 가능성) 검사
 * 사용: node tools/validate.js [cases/c01-....js ...]   (인자 없으면 cases/ 전부)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const norm = s => String(s ?? '').toLowerCase().replace(/[\s'"`.,!?·・()[\]{}\-_/@:;~「」『』〈〉《》“”‘’]/g, '');
const BLOCK_KEYS = new Set(['p', 'h', 'sep', 'divider', 'note', 'stamp', 'sign', 'm', 'img', 'cap', 'rows', 'head', 'list', 'msg', 'who', 'at', 'me', 'say', 'cipher', 'f', 'cls', 'nopin']);
const TEXT_KEYS = ['p', 'h', 'divider', 'note', 'stamp', 'sign', 'm', 'cap', 'msg', 'say'];
const SKINS = new Set(['plain', 'report', 'news', 'letter', 'telegram', 'ledger', 'card', 'transcript', 'memo', 'photo', 'web', 'chat', 'sms', 'home', 'files', 'cipher', 'board', 'lab']);
const TYPES = new Set(['archive', 'list', 'people', 'map', 'cipher', 'timeline', 'compare', 'query', 'photo']);
const KT = new Set(['person', 'place', 'thing', 'time', 'word']);
const FRAMES = new Set(['papers', 'laptop', 'crt']);

function load(file) {
  const cases = [];
  const MG = { registerCase: c => cases.push(c), images: {} };
  const ctx = vm.createContext({ MG, window: { MG }, console });
  vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
  return cases;
}

function check(c) {
  const E = [], W = [];
  const err = m => E.push(m), warn = m => W.push(m);
  for (const k of ['id', 'no', 'title', 'year', 'place', 'motif', 'brief', 'sources', 'keywords', 'docs', 'solution'])
    if (c[k] == null) err(`필수 항목 없음: ${k}`);
  if (E.length) return { E, W, stats: null };
  if (c.kind !== 'tutorial' && !['domestic', 'overseas'].includes(c.region)) err('region 은 domestic 또는 overseas');
  if (c.frame && !FRAMES.has(c.frame)) err(`frame "${c.frame}" 은 papers | laptop | crt 중 하나`);
  if (!/^c\d\d$/.test(c.id)) warn(`id "${c.id}" 는 c01 같은 형식을 권장`);
  if (c.kind !== 'tutorial' && ![3, 4, 5].includes(c.stars)) warn('stars(난이도 3·4·5)가 없음');
  if (c.graphic != null && typeof c.graphic !== 'boolean') err('graphic 은 true/false');

  const K = c.keywords, D = c.docs, P = c.people || {}, A = c.art || {};
  const sources = c.sources || [];
  const srcById = Object.fromEntries(sources.map(s => [s.id, s]));
  const unlIds = {};   // '#id' 로 가리킬 수 있는 것: 자료 출처, 대조 세트, 관찰 장면·지점 (잠금 문서는 D 로 확인)
  const claimId = (id, what) => { if (!id) return err(`${what}: id 없음`); if (unlIds[id]) err(`id "${id}" 가 ${unlIds[id]} 와 ${what} 에서 겹침`); else unlIds[id] = what; };
  sources.forEach(s => {
    claimId(s.id, `source ${s.id}`);
    if (s.type === 'compare') (s.sets || []).forEach(x => claimId(x.id, 'compare set'));
    if (s.type === 'photo') (s.scenes || []).forEach(x => { claimId(x.id, 'photo scene'); (x.spots || []).forEach(sp => claimId(sp.id, 'photo spot')); });
  });
  Object.keys(D).forEach(id => { if (unlIds[id]) err(`문서 id "${id}" 가 ${unlIds[id]} 와 겹침`); });

  // ── 단어 라벨 색인
  const lab = {};
  for (const [id, k] of Object.entries(K)) {
    if (!/^k_[a-z0-9_]+$/.test(id)) warn(`단어 id "${id}" 는 k_소문자 형식을 권장`);
    if (!k.label) err(`단어 ${id}: label 없음`);
    if (k.type && !KT.has(k.type)) err(`단어 ${id}: type "${k.type}" 은 ${[...KT].join('|')} 중 하나`);
    [k.label, ...(k.alias || [])].forEach(l => {
      const n = norm(l);
      if (!n) return;
      if (lab[n] && lab[n] !== id) warn(`라벨/별칭 겹침 "${l}": ${lab[n]} ↔ ${id} (앞쪽이 우선)`);
      if (!(n in lab)) lab[n] = id;
    });
  }
  (c.start || []).forEach(k => { if (!K[k]) err(`start: 없는 단어 ${k}`); });

  // ── 텍스트 컨테이너 수집
  const box = {};           // name -> { k:Set, f:Set }
  const factWhere = {};     // fid -> [where]
  const mWhere = [];
  const allText = [];
  const mk = name => (box[name] ||= { k: new Set(), f: new Set() });
  const scanText = (t, where, b) => {
    t = String(t ?? '');
    allText.push([where, t]);
    const re = /\[\[([^\]|]+?)(?:\|([\w-]+))?\]\]/g;
    let m;
    while ((m = re.exec(t))) {
      const id = m[2] || lab[norm(m[1])];
      if (!id || !K[id]) err(`${where}: [[${m[1]}${m[2] ? '|' + m[2] : ''}]] 에 해당하는 단어가 없음`);
      else b.k.add(id);
    }
  };
  const addFact = (fid, where, b) => {
    if (typeof fid !== 'string' || !/^f_[a-z0-9_]+$/.test(fid)) warn(`${where}: 사실 id "${fid}" 는 f_소문자 형식을 권장`);
    (factWhere[fid] ||= []).push(where);
    b.f.add(fid);
  };
  const scanBlocks = (arr, where, b) => {
    if (arr == null) return;
    if (!Array.isArray(arr)) arr = [arr];
    arr.forEach((x, i) => {
      const w = `${where}#${i}`;
      if (typeof x === 'string') return scanText(x, w, b);
      if (!x || typeof x !== 'object') return err(`${w}: 블록은 문자열이나 객체여야 함`);
      Object.keys(x).forEach(k => { if (!BLOCK_KEYS.has(k)) warn(`${w}: 모르는 블록 속성 "${k}"`); });
      TEXT_KEYS.forEach(k => { if (x[k] != null) scanText(x[k], w, b); });
      if (x.img != null && A[x.img] == null) err(`${w}: art "${x.img}" 가 없음`);
      if (x.m != null) mWhere.push(w);
      if (x.rows) {
        if (!Array.isArray(x.rows)) return err(`${w}: rows 는 배열`);
        x.rows.forEach((r, ri) => {
          if (!Array.isArray(r)) return err(`${w}: rows[${ri}] 가 배열이 아님`);
          if (x.head && r.length !== x.head.length) warn(`${w}: rows[${ri}] 칸 수(${r.length})가 head(${x.head.length})와 다름`);
          r.forEach(cell => scanText(cell, w, b));
        });
        (x.head || []).forEach(h => scanText(h, w, b));
        if (x.f != null) {
          if (typeof x.f !== 'object' || Array.isArray(x.f)) err(`${w}: rows 의 f 는 {행번호: "f_id"} 객체`);
          else Object.entries(x.f).forEach(([ri, fid]) => { if (!x.rows[ri]) err(`${w}: f 의 행 ${ri} 가 없음`); addFact(fid, `${w}.${ri}`, b); });
        }
      } else if (x.list) {
        if (!Array.isArray(x.list)) return err(`${w}: list 는 배열`);
        x.list.forEach(t => scanText(t, w, b));
        if (x.f != null) {
          if (typeof x.f !== 'object' || Array.isArray(x.f)) err(`${w}: list 의 f 는 {항목번호: "f_id"} 객체`);
          else Object.entries(x.f).forEach(([li, fid]) => { if (x.list[li] == null) err(`${w}: f 의 항목 ${li} 가 없음`); addFact(fid, `${w}.${li}`, b); });
        }
      } else if (x.f != null) {
        if (typeof x.f !== 'string') err(`${w}: f 는 "f_id" 문자열`);
        else addFact(x.f, w, b);
      }
      if (x.f != null && x.h != null) err(`${w}: 제목(h) 블록에는 f 를 붙일 수 없음 (적을 수 없는 블록)`);
    });
  };

  // brief + tips
  const brief = mk('brief');
  (c.brief.lines || []).forEach(([, v], i) => scanText(v, `brief.lines[${i}]`, brief));
  if (c.brief.scrawl) scanText(c.brief.scrawl, 'brief.scrawl', brief);
  (c.tips || []).forEach((t, i) => scanText(t, `tips[${i}]`, brief));
  if (!(c.brief.lines || []).length) err('brief.lines 가 비어 있음');

  // sources
  const tokenOk = n => (n[0] === '#' ? unlIds[n.slice(1)] || D[n.slice(1)] : n[0] === '!' ? true : K[n]);
  const needCheck = (need, where) => {
    if (need == null) return;
    if (!Array.isArray(need)) return err(`${where}: need 는 배열`);
    need.forEach(n => { if (!tokenOk(n)) err(`${where}: need "${n}" 대상이 없음`); if (n[0] === '!') factRefs.push([n.slice(1), where]); });
  };
  const factRefs = [];
  if (!sources.length) err('sources 가 비어 있음');
  const seenSrc = new Set();
  sources.forEach(s => {
    const w = `source ${s.id}`;
    if (!s.id) return err('id 없는 source');
    seenSrc.add(s.id);
    if (!TYPES.has(s.type)) err(`${w}: type "${s.type}" 은 ${[...TYPES].join('|')} 중 하나`);
    if (s.skin && !SKINS.has(s.skin)) warn(`${w}: skin "${s.skin}" 은 기본 스킨이 아님 (사건 css 에서 직접 정의해야 함)`);
    needCheck(s.need, w);
    const b = mk(`src:${s.id}`);
    if (s.desc) scanText(s.desc, `${w}.desc`, b);
    if (s.lock) {
      if (!Array.isArray(s.lock.code) || !s.lock.code.length) err(`${w}: lock.code 는 정답 문자열 배열`);
      ['hint', 'hint2', 'desc', 'title'].forEach(k => s.lock[k] && scanText(s.lock[k], `${w}.lock.${k}`, b));
      needCheck(s.lock.need, `${w}.lock`);
      (s.lock.keys || []).forEach(k => { if (!K[k]) err(`${w}.lock.keys: 없는 단어 ${k}`); });
      if (!s.lock.need) warn(`${w}: lock.need(비밀번호를 알 수 있게 되는 조건)가 없어 처음부터 풀 수 있다고 가정함`);
    }
    if (s.type === 'archive') (s.start || []).forEach(d => { if (!D[d]) err(`${w}.start: 없는 문서 ${d}`); else if (D[d].src !== s.id) err(`${w}.start: 문서 ${d} 의 src 가 ${D[d].src}`); });
    if (s.type === 'map') {
      if (!s.art || A[s.art] == null) err(`${w}: 지도 art "${s.art}" 가 없음`);
      (s.spots || []).forEach(sp => { if (!D[sp.doc]) err(`${w}.spot ${sp.id}: 문서 ${sp.doc} 없음`); needCheck(sp.need, `${w}.spot ${sp.id}`); if (!(sp.x >= 0 && sp.x <= 100 && sp.y >= 0 && sp.y <= 100)) err(`${w}.spot ${sp.id}: x,y 는 0~100 (%)`); });
      if (!(s.spots || []).length) err(`${w}: spots 가 비어 있음`);
    }
    const rewardCheck = (r, where) => ((r && r.keys) || []).forEach(k => { if (!K[k]) err(`${where}.reward.keys: 없는 단어 ${k}`); });
    if (s.type === 'timeline') {
      const ev = s.events || [];
      if (ev.length < 3) err(`${w}: events 가 3개 이상 필요`);
      const ids = new Set();
      const ib = mk(`tl:${s.id}:i`);
      ev.forEach((e, i) => { if (!e.id || ids.has(e.id)) err(`${w}.events[${i}]: id 없음/중복`); ids.add(e.id); if (!e.t) err(`${w}.events[${i}]: t 없음`); scanText(e.t, `${w}.events[${i}]`, ib); });
      (s.slots || []).forEach((t, i) => scanText(t, `${w}.slots[${i}]`, ib));
      if (s.slots && s.slots.length !== ev.length) warn(`${w}: slots 수(${s.slots.length})가 events 수(${ev.length})와 다름`);
      scanBlocks(s.intro, `${w}.intro`, ib);
      scanBlocks(s.solved, `${w}.solved`, mk(`tl:${s.id}:s`));
      needCheck(s.solveNeed, `${w}.solveNeed`);
      if (!s.solveNeed) warn(`${w}: solveNeed(순서를 알 수 있게 되는 조건)가 없어 처음부터 풀 수 있다고 가정함`);
      rewardCheck(s.reward, w);
    }
    if (s.type === 'compare') {
      if (!(s.sets || []).length) err(`${w}: sets 가 비어 있음`);
      (s.sets || []).forEach(x => {
        const xw = `${w}.set ${x.id}`;
        if (!x.title) err(`${xw}: title 없음`);
        const opts = x.options || [];
        if (opts.length < 2) err(`${xw}: options 가 2개 이상 필요`);
        else if (opts.length < 3) warn(`${xw}: 선택지가 ${opts.length}개뿐 — 3개 이상 권장`);
        if (!opts.some(o => o.id === x.answer)) err(`${xw}: answer "${x.answer}" 가 options 에 없음`);
        const ib = mk(`cmp:${x.id}:i`);
        ['title', 'meta', 'q', 'hint'].forEach(k => x[k] && scanText(x[k], `${xw}.${k}`, ib));
        const ev = x.evidence || {};
        if (ev.t) scanText(ev.t, `${xw}.evidence`, ib);
        [ev.art, ...opts.map(o => o.art)].forEach(a => { if (a != null && A[a] == null) err(`${xw}: art "${a}" 가 없음`); });
        opts.forEach(o => { if (!o.id || !o.label) err(`${xw}: 선택지에 id/label 필요`); ['label', 't'].forEach(k => o[k] && scanText(o[k], `${xw}.option ${o.id}`, ib)); });
        scanBlocks(x.intro, `${xw}.intro`, ib);
        scanBlocks(x.solved, `${xw}.solved`, mk(`cmp:${x.id}:s`));
        needCheck(x.need, xw);
        needCheck(x.solveNeed, `${xw}.solveNeed`);
        if (!x.solveNeed) warn(`${xw}: solveNeed(무엇과 일치하는지 알 수 있게 되는 조건)가 없음`);
        rewardCheck(x.reward, xw);
      });
    }
    if (s.type === 'query') {
      const fids = new Set((s.fields || []).map(fl => fl.id));
      if (!fids.size) err(`${w}: fields 가 비어 있음`);
      if (!(s.records || []).length) err(`${w}: records 가 비어 있음`);
      (s.records || []).forEach((r, i) => {
        const rw = `${w}.records[${i}]`;
        if (!D[r.doc]) err(`${rw}: 문서 ${r.doc} 없음`);
        else if (D[r.doc].src !== s.id) err(`${rw}: 문서 ${r.doc} 의 src 가 ${s.id} 가 아님`);
        const m = Object.entries(r.match || {});
        if (!m.length) err(`${rw}: match 가 비어 있음`);
        m.forEach(([fl, v]) => { if (!fids.has(fl)) err(`${rw}: match 의 칸 "${fl}" 이 fields 에 없음`); if (!(Array.isArray(v) ? v : [v]).some(x => norm(x))) err(`${rw}: match.${fl} 값이 비어 있음`); });
        needCheck(r.need, rw);
        if (!r.need) warn(`${rw}: need(조회할 값을 알게 되는 조건)가 없어 처음부터 조회할 수 있다고 가정함`);
        (r.keys || []).forEach(k => { if (!K[k]) err(`${rw}.keys: 없는 단어 ${k}`); });
      });
    }
    if (s.type === 'photo') {
      if (!(s.scenes || []).length) err(`${w}: scenes 가 비어 있음`);
      (s.scenes || []).forEach(x => {
        const xw = `${w}.scene ${x.id}`;
        if (!x.art || A[x.art] == null) err(`${xw}: art "${x.art}" 가 없음`);
        else if (typeof A[x.art] === 'object' && A[x.art].prompt && !A[x.art].raster) warn(`${xw}: 관찰 장면은 좌표가 맞아야 해서 SVG 로만 그린다 — prompt 는 쓰이지 않음 (지우거나 raster:true)`);
        if (!(x.spots || []).length) err(`${xw}: spots 가 비어 있음`);
        const ib = mk(`ph:${x.id}:i`);
        ['title', 'meta'].forEach(k => x[k] && scanText(x[k], `${xw}.${k}`, ib));
        scanBlocks(x.intro, `${xw}.intro`, ib);
        needCheck(x.need, xw);
        (x.spots || []).forEach(sp => {
          const pw = `${xw}.spot ${sp.id}`;
          if (!(sp.x >= 0 && sp.x <= 100 && sp.y >= 0 && sp.y <= 100)) err(`${pw}: x,y 는 0~100 (%)`);
          if (sp.r != null && !(sp.r >= 3 && sp.r <= 25)) warn(`${pw}: r 은 3~25 권장`);
          if (!sp.label) err(`${pw}: label 없음`);
          const pb = mk(`ph:${sp.id}`);
          if (sp.label) scanText(sp.label, `${pw}.label`, pb);
          scanBlocks(sp.body, pw, pb);
          needCheck(sp.need, pw);
          (sp.keys || []).forEach(k => { if (!K[k]) err(`${pw}.keys: 없는 단어 ${k}`); });
        });
      });
    }
    if (s.type === 'cipher') {
      if (!s.cipher || !s.key) err(`${w}: cipher 와 key 가 필요`);
      else {
        const keep = new Set([' ', '\n', ...Array.from(s.keep || '')]);
        const syms = [...new Set(Array.from(s.cipher).filter(t => !keep.has(t)))];
        syms.forEach(y => { if (s.key[y] == null) err(`${w}: 기호 "${y}" 의 key 가 없음`); });
        Object.keys(s.given || {}).forEach(y => { if (!syms.includes(y)) warn(`${w}: given 의 "${y}" 가 암호문에 없음`); });
        if (syms.length > 26) warn(`${w}: 기호가 ${syms.length}개 — 너무 많으면 지루하다`);
      }
      scanBlocks(s.intro, `${w}.intro`, mk(`cip:${s.id}:i`));
      scanBlocks(s.solved, `${w}.solved`, mk(`cip:${s.id}:s`));
      needCheck(s.solveNeed, `${w}.solveNeed`);
      ((s.reward && s.reward.keys) || []).forEach(k => { if (!K[k]) err(`${w}.reward.keys: 없는 단어 ${k}`); });
    }
  });

  // docs
  Object.entries(D).forEach(([id, d]) => {
    const w = `doc ${id}`;
    if (!srcById[d.src]) err(`${w}: src "${d.src}" 가 없음`);
    if (!d.title) err(`${w}: title 없음`);
    if (!Array.isArray(d.body)) err(`${w}: body 는 블록 배열`);
    if (d.skin && !SKINS.has(d.skin)) warn(`${w}: skin "${d.skin}" 은 기본 스킨이 아님`);
    (d.find || []).forEach(k => { if (!K[k]) err(`${w}.find: 없는 단어 ${k}`); });
    needCheck(d.need, w);
    if (d.blood != null && ![true, false, 'heavy'].includes(d.blood)) err(`${w}: blood 는 true | false | 'heavy'`);
    if (d.blood && !c.graphic) warn(`${w}: blood 는 graphic 사건에서만 보인다`);
    const s = srcById[d.src];
    if (s && s.type === 'query' && !(s.records || []).some(r => r.doc === id)) err(`${w}: 조회(query) 문서인데 어느 record 도 가리키지 않음`);
    if (s && s.type === 'archive' && !(d.find || []).length && !(s.start || []).includes(id)) err(`${w}: 자료실(archive) 문서인데 find 도 없고 start 도 아님 → 찾을 방법이 없음`);
    const b = mk(`doc:${id}`);
    ['title', 'meta', 'paper', 'kicker'].forEach(k => d[k] && scanText(d[k], `${w}.${k}`, b));
    scanBlocks(d.body, w, b);
    if (d.lock) {
      if (!Array.isArray(d.lock.code) || !d.lock.code.length) err(`${w}: lock.code 는 정답 문자열 배열`);
      const lb = mk(`lock:${id}`);
      ['hint', 'hint2', 'desc', 'title'].forEach(k => d.lock[k] && scanText(d.lock[k], `${w}.lock.${k}`, lb));
      needCheck(d.lock.need, `${w}.lock`);
      (d.lock.keys || []).forEach(k => { if (!K[k]) err(`${w}.lock.keys: 없는 단어 ${k}`); });
    }
  });

  // people
  Object.entries(P).forEach(([id, p]) => {
    const w = `person ${id}`;
    if (!p.name) err(`${w}: name 없음`);
    if (p.key && !K[p.key]) err(`${w}: key "${p.key}" 가 없음`);
    if (p.key && K[p.key] && K[p.key].type !== 'person') warn(`${w}: key 단어의 type 이 person 이 아님`);
    const ps = p.src || (sources.find(s => s.type === 'people') || {}).id;
    if (!srcById[ps] || srcById[ps].type !== 'people') err(`${w}: people 타입 source 가 없음`);
    needCheck(p.need, w);
    if (p.art && A[p.art] == null) err(`${w}: art "${p.art}" 없음`);
    const bi = mk(`per:${id}:_`);
    ['role', 'where'].forEach(k => p[k] && scanText(p[k], `${w}.${k}`, bi));
    scanBlocks(p.intro, `${w}.intro`, bi);
    if (p.idle) scanBlocks(p.idle, `${w}.idle`, mk(`per:${id}:idle`));
    if (p.self) scanBlocks(p.self, `${w}.self`, mk(`per:${id}:self`));
    Object.entries(p.ask || {}).forEach(([k, a]) => {
      if (!K[k]) err(`${w}.ask: 없는 단어 ${k}`);
      if (a && !Array.isArray(a) && typeof a === 'object' && 'need' in a) {
        needCheck(a.need, `${w}.ask.${k}`);
        scanBlocks(a.a, `${w}.ask.${k}.a`, mk(`per:${id}:${k}!`));
        if (a.else != null) scanBlocks(a.else, `${w}.ask.${k}.else`, mk(`per:${id}:${k}?`));
      } else scanBlocks(a, `${w}.ask.${k}`, mk(`per:${id}:${k}`));
    });
  });

  // art
  Object.entries(A).forEach(([k, a]) => {
    const svg = typeof a === 'string' ? a : a && a.svg;
    if (!svg || !/<svg[\s>]/.test(svg)) err(`art ${k}: svg 가 없음`);
    else {
      if (/<script|on\w+=|href="http/i.test(svg)) err(`art ${k}: svg 안에 스크립트/외부 링크 금지`);
      if (svg.length > 9000) warn(`art ${k}: svg 가 ${svg.length}자 — 가볍게 줄일 것`);
    }
    if (a && typeof a === 'object') {
      if (a.prompt && !a.use) warn(`art ${k}: prompt 는 있는데 use(용도 설명)가 없음`);
      if (a.prompt && !a.ratio) warn(`art ${k}: ratio 가 없음`);
      if (a.sensitive != null && typeof a.sensitive !== 'boolean') err(`art ${k}: sensitive 는 true/false`);
    }
  });

  // solution
  const sol = c.solution;
  if (!sol.culprit || !K[sol.culprit]) err(`solution.culprit "${sol.culprit}" 가 단어 목록에 없음`);
  else if (K[sol.culprit].type !== 'person') err('solution.culprit 단어의 type 이 person 이 아님');
  if (!Array.isArray(sol.claims) || sol.claims.length < 3) err('solution.claims 는 3개 이상');
  (sol.claims || []).forEach(cl => {
    if (!cl.id || !cl.q) err(`claim ${cl.id}: id 와 q 필요`);
    if (!Array.isArray(cl.accept) || !cl.accept.length) err(`claim ${cl.id}: accept 가 비어 있음`);
    (cl.accept || []).forEach(f => { if (!factWhere[f]) err(`claim ${cl.id}: 사실 ${f} 가 어느 블록에도 없음`); });
    if ((cl.accept || []).length === 1) warn(`claim ${cl.id}: 인정되는 증거가 1개뿐 — 경로를 하나 더 두는 편이 안전`);
  });
  if (!Array.isArray(sol.epilogue) || !sol.epilogue.length) err('solution.epilogue 가 비어 있음');
  factRefs.forEach(([f, w]) => { if (!factWhere[f]) err(`${w}: !${f} 사실이 없음`); });
  if (mWhere.length === 0 && c.kind !== 'tutorial') warn('M 의 메모({m:...}) 블록이 없음');
  if (mWhere.length > 1) warn(`M 의 메모가 ${mWhere.length}개 — 사건당 1개`);

  // leak heuristics
  const leak = /(범인은\s*(바로\s*)?[가-힣A-Za-z]+(이다|다)\b)|(내가\s*(죽였|살해했|죽인))|(제가\s*(죽였|죽인))|자백(했|합니다|한다)/;
  allText.forEach(([w, t]) => { if (leak.test(t)) warn(`${w}: 정답을 대놓고 말하는 문장처럼 보임 → "${t.slice(0, 40)}"`); });

  // ── 추적 경로 시뮬레이션
  const KN = new Set(c.start || []), F = new Set(), U = new Set(), docsSeen = new Set(), perSeen = new Set();
  const roundK = {}, roundF = {}, roundD = {};
  (c.start || []).forEach(k => (roundK[k] = 0));
  const okN = need => !need || need.every(n => (n[0] === '#' ? U.has(n.slice(1)) : n[0] === '!' ? F.has(n.slice(1)) : KN.has(n)));
  let round = 0;
  for (;;) {
    round++;
    const uBefore = U.size;
    const reach = new Set(['brief']);
    const unlock = (id, lock) => { if (!U.has(id)) { U.add(id); (lock.keys || []).forEach(k => reach.add(`__key:${k}`)); } };
    const openDoc = d => {
      if (!d) return;
      if (d.lock && !U.has(d.id)) { reach.add(`lock:${d.id}`); if (okN(d.lock.need)) unlock(d.id, d.lock); else return; }
      reach.add(`doc:${d.id}`);
      if (!(d.id in roundD)) roundD[d.id] = round;
      docsSeen.add(d.id);
    };
    Object.entries(D).forEach(([id, d]) => (d.id = id));
    sources.forEach(s => {
      if (!okN(s.need)) return;
      reach.add(`src:${s.id}`);
      if (s.lock && !U.has(s.id)) { if (okN(s.lock.need)) unlock(s.id, s.lock); else return; }
      const docs = Object.values(D).filter(d => d.src === s.id);
      if (s.type === 'archive') docs.filter(d => okN(d.need) && ((s.start || []).includes(d.id) || (d.find || []).some(k => KN.has(k)))).forEach(openDoc);
      if (s.type === 'list') docs.filter(d => okN(d.need)).forEach(openDoc);
      if (s.type === 'map') (s.spots || []).filter(sp => okN(sp.need)).forEach(sp => openDoc(D[sp.doc]));
      const reward = r => ((r && r.keys) || []).forEach(k => reach.add(`__key:${k}`));
      if (s.type === 'timeline') { reach.add(`tl:${s.id}:i`); if (okN(s.solveNeed)) { U.add(s.id); reach.add(`tl:${s.id}:s`); reward(s.reward); } }
      if (s.type === 'compare') (s.sets || []).forEach(x => { if (!okN(x.need)) return; reach.add(`cmp:${x.id}:i`); if (okN(x.solveNeed)) { U.add(x.id); reach.add(`cmp:${x.id}:s`); reward(x.reward); } });
      if (s.type === 'query') (s.records || []).forEach(r => { if (okN(r.need)) { openDoc(D[r.doc]); (r.keys || []).forEach(k => reach.add(`__key:${k}`)); } });
      if (s.type === 'photo') (s.scenes || []).forEach(x => { if (!okN(x.need)) return; reach.add(`ph:${x.id}:i`); (x.spots || []).forEach(sp => { if (okN(sp.need)) { U.add(sp.id); reach.add(`ph:${sp.id}`); (sp.keys || []).forEach(k => reach.add(`__key:${k}`)); } }); });
      if (s.type === 'cipher') {
        reach.add(`cip:${s.id}:i`);
        if (okN(s.solveNeed)) { U.add(s.id); reach.add(`cip:${s.id}:s`); ((s.reward && s.reward.keys) || []).forEach(k => reach.add(`__key:${k}`)); }
      }
      if (s.type === 'people') {
        Object.entries(P).forEach(([id, p]) => {
          const ps = p.src || (sources.find(x => x.type === 'people') || {}).id;
          if (ps !== s.id || (p.key && !KN.has(p.key)) || !okN(p.need)) return;
          perSeen.add(id);
          reach.add(`per:${id}:_`);
          reach.add(`per:${id}:idle`);
          KN.forEach(k => {
            const a = (p.ask || {})[k];
            if (a && !Array.isArray(a) && typeof a === 'object' && 'need' in a) { reach.add(`per:${id}:${k}?`); if (okN(a.need)) reach.add(`per:${id}:${k}!`); }
            else if (a != null) reach.add(`per:${id}:${k}`);
            if (k === p.key && p.self) reach.add(`per:${id}:self`);
          });
        });
      }
    });
    let changed = false;
    reach.forEach(name => {
      if (name.startsWith('__key:')) { const k = name.slice(6); if (!KN.has(k)) { KN.add(k); roundK[k] = round; changed = true; } return; }
      const b = box[name];
      if (!b) return;
      b.k.forEach(k => { if (!KN.has(k)) { KN.add(k); roundK[k] = round; changed = true; } });
      b.f.forEach(f => { if (!F.has(f)) { F.add(f); roundF[f] = round; changed = true; } });
    });
    if (U.size !== uBefore) changed = true;
    if (!changed || round > 60) break;
  }

  const unreachD = Object.keys(D).filter(id => !docsSeen.has(id));
  const unreachP = Object.keys(P).filter(id => !perSeen.has(id));
  const unreachK = Object.keys(K).filter(id => !KN.has(id));
  const unreachF = Object.keys(factWhere).filter(f => !F.has(f));
  unreachD.forEach(id => warn(`도달 불가 문서: ${id} 「${D[id].title}」`));
  unreachP.forEach(id => warn(`도달 불가 인물: ${id} (${P[id].name})`));
  unreachK.forEach(id => warn(`도달 불가 단어: ${id} (${K[id].label})`));
  unreachF.forEach(f => warn(`도달 불가 사실: ${f}`));

  // 검색 지름길: 적어 둔 단어 A 의 라벨이 아직 모르는 단어 B 의 라벨/별칭을 품으면, A 로 검색할 때 B 문서가 먼저 뜬다.
  const finds = new Set(Object.values(D).flatMap(d => d.find || []));
  const labs = id => [K[id].label, ...(K[id].alias || [])].map(norm).filter(Boolean);
  Object.keys(K).filter(a => a in roundK).forEach(a => labs(a).forEach(la => Object.keys(K).forEach(b => {
    if (b === a || !finds.has(b) || !((roundK[b] ?? Infinity) > roundK[a])) return;
    const hit = labs(b).find(lb => lb.length >= 2 && la.includes(lb));
    if (hit) warn(`검색 지름길: "${K[a].label}"(${a}) 로 찾으면 "${hit}" 가 걸려 ${b} 문서가 먼저 뜬다 — 라벨을 겹치지 않게`);
  })));

  let depth = 0;
  if (sol.culprit && !KN.has(sol.culprit)) err(`범인 단어 ${sol.culprit} 에 도달할 수 없음 → 보고서에서 고를 수 없다`);
  else if (sol.culprit) depth = Math.max(depth, roundK[sol.culprit] || 0);
  (sol.claims || []).forEach(cl => {
    const r = (cl.accept || []).filter(f => F.has(f)).map(f => roundF[f]);
    if (!r.length) err(`claim ${cl.id}: 인정 증거 중 도달 가능한 것이 없음 → 풀 수 없다`);
    else depth = Math.max(depth, Math.min(...r));
  });
  const minDepth = { 3: 3, 4: 4, 5: 5 }[c.stars] || 3;
  if (depth && depth < minDepth && c.kind !== 'tutorial') warn(`추적 깊이가 ${depth} — ★${c.stars || 3} 사건은 ${minDepth} 이상이 되도록 단서가 단서를 여는 사슬을 늘릴 것`);
  const persons = Object.values(K).filter(k => k.type === 'person').length;
  const minPersons = c.stars === 5 ? 6 : 4;
  if (persons < minPersons && c.kind !== 'tutorial') warn(`인물 단어가 ${persons}개뿐 — ★${c.stars || 3} 사건에는 ${minPersons}명 이상`);
  const methods = [...new Set(sources.map(s => s.type))];
  const prompts = Object.values(A).filter(a => a && typeof a === 'object' && a.prompt).length;

  return {
    E, W,
    stats: { docs: Object.keys(D).length, docsR: docsSeen.size, people: Object.keys(P).length, peopleR: perSeen.size, keys: Object.keys(K).length, keysR: KN.size, facts: Object.keys(factWhere).length, factsR: F.size, depth, rounds: round, prompts, stars: c.stars, graphic: !!c.graphic, methods, chars: allText.reduce((n, [, t]) => n + t.length, 0) },
  };
}

function main() {
  const root = path.join(__dirname, '..');
  let files = process.argv.slice(2);
  if (!files.length) files = fs.readdirSync(path.join(root, 'cases')).filter(f => f.endsWith('.js')).map(f => path.join('cases', f));
  let failed = 0;
  for (const file of files) {
    let cases;
    try { cases = load(path.resolve(file)); } catch (e) { console.log(`\n== ${file} ==\n✗ 불러오기 실패: ${e.message}`); failed++; continue; }
    if (!cases.length) { console.log(`\n== ${file} ==\n✗ MG.registerCase 호출이 없음`); failed++; continue; }
    for (const c of cases) {
      const { E, W, stats } = check(c);
      console.log(`\n== ${file} — ${c.id} 「${c.title}」 ==`);
      if (stats) console.log(`문서 ${stats.docs}(도달 ${stats.docsR}) · 인물 ${stats.people}(도달 ${stats.peopleR}) · 단어 ${stats.keys}(도달 ${stats.keysR}) · 사실 ${stats.facts}(도달 ${stats.factsR}) · 추적 깊이 ${stats.depth} · ${stats.stars ? '★' + stats.stars + (stats.graphic ? '(혐오감 주의)' : '') : '연습'} · 조사 방식 ${stats.methods.join('/')} · 이미지 프롬프트 ${stats.prompts} · 글자 수 ${stats.chars.toLocaleString()}`);
      E.forEach(m => console.log('✗ ' + m));
      W.forEach(m => console.log('△ ' + m));
      console.log(E.length ? '결과: FAIL' : W.length ? '결과: PASS (경고 있음)' : '결과: PASS');
      if (E.length) failed++;
    }
  }
  process.exit(failed ? 1 : 0);
}

if (require.main === module) main();
module.exports = { load, check };
