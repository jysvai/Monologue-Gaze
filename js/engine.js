/* Monologue Gaze — 사건 엔진
 * 사건 파일(cases/*.js)은 MG.registerCase({...})로 자신을 등록한다.
 * 데이터 형식은 docs/CASE_AUTHORING.md 참고.
 */
(function () {
  'use strict';

  const MG = (window.MG = window.MG || {});
  MG.cases = MG.cases || [];
  MG.byId = MG.byId || {};
  MG.images = MG.images || {}; // img/manifest.js 가 채운다: { 'c01/key': 'img/c01/key.webp' }
  MG.registerCase = function (c) {
    if (!c || !c.id || MG.byId[c.id]) return;
    MG.cases.push(c);
    MG.byId[c.id] = c;
  };

  /* ───────── utils ───────── */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const norm = s => String(s ?? '').toLowerCase().replace(/[\s'"`.,!?·・()[\]{}\-_/@:;~「」『』〈〉《》“”‘’]/g, '');
  const plain = s => String(s ?? '').replace(/\[\[([^\]|]+?)(?:\|[\w-]+)?\]\]/g, '$1').replace(/\*\*(.+?)\*\*/g, '$1').replace(/~~(.+?)~~/g, '$1');
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const pad = n => String(n).padStart(2, '0');
  const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
  const KTYPE = { person: '인물', place: '장소', thing: '물건', time: '때', word: '기타' };
  const NUMK = { 10: '열', 11: '열한', 12: '열두', 13: '열세', 14: '열네', 15: '열다섯', 16: '열여섯', 17: '열일곱', 18: '열여덟', 19: '열아홉', 20: '스무' };
  const numk = n => NUMK[n] || String(n);
  // 난이도 ★3~★5. 튜토리얼과 별이 없는 사건은 ★3 규칙을 따른다.
  const lv = () => (C && C.stars) || 3;
  const starsHtml = c => c.kind === 'tutorial' || !c.stars ? '' : `<span class="stars${c.graphic ? ' red' : ''}" role="img" aria-label="난이도 ${c.stars} / 5${c.graphic ? ' · 혐오감 주의' : ''}">${'★'.repeat(c.stars)}<i>${'★'.repeat(5 - c.stars)}</i></span>`;

  /* ── 혐오감 주의 사건의 마른 핏자국 (S.mild 이면 끈다) */
  const STAIN_SVG = {
    a: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.07' numOctaves='2' seed='3'/><feDisplacementMap in='SourceGraphic' scale='16'/></filter><radialGradient id='g' cx='.45' cy='.42' r='.62'><stop offset='0' stop-color='#72140b'/><stop offset='.75' stop-color='#5a0e07'/><stop offset='1' stop-color='#3b0804'/></radialGradient></defs><g filter='url(#r)' fill='url(#g)'><ellipse cx='98' cy='102' rx='40' ry='34'/><path d='M126 116 q34 10 50 34 q-28 -6 -54 -24z'/><path d='M70 80 q-26 -22 -34 -46 q18 16 42 36z'/><circle cx='150' cy='70' r='8'/><circle cx='163' cy='57' r='4'/><circle cx='40' cy='142' r='7'/><circle cx='28' cy='155' r='3.5'/><circle cx='137' cy='154' r='5'/><circle cx='62' cy='150' r='3'/><circle cx='174' cy='120' r='3'/><circle cx='118' cy='38' r='3'/><circle cx='90' cy='176' r='4'/></g></svg>",
    b: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 130'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.09' numOctaves='2' seed='7'/><feDisplacementMap in='SourceGraphic' scale='9'/></filter></defs><g filter='url(#r)' fill='none' stroke='#5e0f08' stroke-linecap='round'><path d='M18 42 C90 28 170 34 282 56' stroke-width='15' opacity='.9'/><path d='M22 66 C100 58 180 62 262 80' stroke-width='12' opacity='.8'/><path d='M28 88 C110 84 172 88 232 100' stroke-width='9' opacity='.7'/><path d='M34 108 C100 106 150 110 196 116' stroke-width='6' opacity='.6'/></g></svg>",
    c: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 230'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.06' numOctaves='2' seed='5'/><feDisplacementMap in='SourceGraphic' scale='6'/></filter></defs><g filter='url(#r)' fill='#5c0e08'><path d='M8 0 H152 C152 20 142 26 130 28 C126 64 128 124 122 156 C120 168 108 168 106 156 C102 112 104 62 96 36 C90 44 88 72 84 96 C82 104 74 104 72 96 C70 72 70 46 62 36 C54 42 52 56 48 66 C46 72 40 72 38 66 C36 52 34 36 22 30 C14 26 8 18 8 0 Z'/><circle cx='114' cy='174' r='6'/><circle cx='78' cy='112' r='4'/></g></svg>",
    d: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 150'><defs><clipPath id='c'><ellipse cx='60' cy='75' rx='42' ry='58'/></clipPath><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.2' numOctaves='1' seed='2'/><feDisplacementMap in='SourceGraphic' scale='5'/></filter></defs><g clip-path='url(#c)' filter='url(#r)' fill='none' stroke='#6a120a' stroke-width='3.4'><ellipse cx='60' cy='84' rx='7' ry='9'/><ellipse cx='60' cy='82' rx='13' ry='17'/><ellipse cx='60' cy='80' rx='19' ry='25'/><ellipse cx='60' cy='78' rx='25' ry='33'/><ellipse cx='60' cy='76' rx='31' ry='41'/><ellipse cx='60' cy='74' rx='37' ry='49'/><ellipse cx='60' cy='72' rx='43' ry='57'/></g></svg>",
  };
  const gore = () => !!(C && C.graphic && !S.mild);
  // kinds: 문자열 'abcd' 중에서 고른다. seed 로 위치·각도를 정한다 (같은 문서는 늘 같은 자리).
  function stains(seed, n, kinds, edge) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = hash(seed + ':' + i);
      const k = kinds[h % kinds.length];
      const side = (h >> 3) % 2;
      const x = edge ? (side ? 78 + (h % 17) : -6 + (h % 14)) : 8 + (h % 80);
      const y = -4 + ((h >> 5) % 90);
      out += `<span class="stain st-${k}" style="--x:${x}%;--y:${y}%;--r:${(h >> 7) % 360}deg;--s:${(0.6 + ((h >> 9) % 60) / 100).toFixed(2)}" aria-hidden="true"></span>`;
    }
    return out;
  }
  function docStains(d) {
    if (!gore() || d.blood === false) return '';
    if (d.blood === 'heavy') return stains(d.id, 4, 'aacbd', false);
    if (d.blood === true || hash(d.id) % 3 === 0) return stains(d.id, 1 + (hash(d.id) % 2), 'abd', true);
    return '';
  }

  /* ───────── save ───────── */
  const KEY = 'mg-save-v1';
  let S = { cases: {}, current: null, intro: false };
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (d && typeof d === 'object' && d.cases) S = Object.assign(S, d);
  } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };

  function cs(c) {
    const st = (S.cases[c.id] = S.cases[c.id] || {});
    st.keys ??= [...(c.start || [])];
    st.notes ??= [];
    st.seen ??= [];
    st.asked ??= {};
    st.report ??= { culprit: '', claims: {} };
    st.report.claims ??= {};
    st.tries ??= 0;
    st.solved ??= false;
    st.unl ??= [];
    st.ciph ??= {};
    st.view ??= {};
    st.view.q ??= {};
    st.view.qin ??= {};
    st.view.qres ??= {};
    st.tl ??= {};
    st.found ??= {};
    st.cmp ??= {};
    st.cens ??= [];
    st.m ??= false;
    st.nid ??= 0;
    return st;
  }

  /* ───────── case prep ───────── */
  function prep(c) {
    c.keywords ||= {}; c.docs ||= {}; c.people ||= {}; c.sources ||= []; c.art ||= {}; c.start ||= [];
    c.solution ||= { culprit: '', claims: [] };
    c._lab = {};
    for (const [id, k] of Object.entries(c.keywords)) {
      k.id = id;
      [k.label, ...(k.alias || [])].forEach(l => { const n = norm(l); if (n && !(n in c._lab)) c._lab[n] = id; });
    }
    c._srcDocs = {};
    c.sources.forEach(s => (c._srcDocs[s.id] = []));
    for (const [id, d] of Object.entries(c.docs)) { d.id = id; (c._srcDocs[d.src] ||= []).push(d); }
    const firstPeople = c.sources.find(s => s.type === 'people');
    for (const [id, p] of Object.entries(c.people)) { p.id = id; p.src ||= firstPeople && firstPeople.id; }
    c._sets = {}; c._scenes = {};
    c.sources.forEach(s => {
      if (s.type === 'compare') (s.sets || []).forEach(x => { x.src = s.id; c._sets[x.id] = x; });
      if (s.type === 'photo') (s.scenes || []).forEach(x => { x.src = s.id; c._scenes[x.id] = x; });
    });
    c._m = null;
    const scan = arr => (Array.isArray(arr) ? arr : [arr]).forEach(b => { if (b && typeof b === 'object' && b.m != null && !c._m) c._m = b.m; });
    Object.values(c.docs).forEach(d => scan(d.body || []));
    c.sources.forEach(s => { scan(s.intro || []); scan(s.solved || []); });
    Object.values(c._sets).forEach(x => { scan(x.intro || []); scan(x.solved || []); });
    Object.values(c._scenes).forEach(x => { scan(x.intro || []); (x.spots || []).forEach(sp => scan(sp.body || [])); });
    Object.values(c.people).forEach(p => { scan(p.intro || []); Object.values(p.ask || {}).forEach(a => { if (Array.isArray(a)) scan(a); else if (a && typeof a === 'object') { scan(a.a || []); scan(a.else || []); } }); });
  }

  function injectCss() {
    const st = document.createElement('style');
    st.id = 'stain-css';
    st.textContent = Object.entries(STAIN_SVG).map(([k, v]) => `.st-${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(v)}")}`).join('\n');
    document.head.appendChild(st);
    const css = MG.cases.map(c => c.css || '').join('\n');
    if (!css.trim()) return;
    const el = document.createElement('style');
    el.id = 'case-css';
    el.textContent = css;
    document.head.appendChild(el);
  }

  /* ───────── runtime state ───────── */
  let app = null;
  let C = null;      // current case
  let ST = null;     // current case state
  let PIN = {};      // ref -> { t, f, src }
  let NOPIN = false;
  let VERDICT = '';
  const LOCKFAIL = {};

  const ok = need => {
    if (!need || !need.length) return true;
    return need.every(n => (n[0] === '#' ? ST.unl.includes(n.slice(1)) : n[0] === '!' ? ST.notes.some(x => x.f === n.slice(1)) : ST.keys.includes(n)));
  };
  const srcVisible = s => ok(s.need);
  const srcOpen = s => !s.lock || ST.unl.includes(s.id);
  const personVisible = p => (!p.key || ST.keys.includes(p.key)) && ok(p.need);
  const curSrc = () => C.sources.find(s => s.id === ST.view.src);
  const narrow = () => { const b = $('#stageBody'); return b ? b.clientWidth < 700 : false; };

  function census() {
    let n = 0;
    C.sources.forEach(s => {
      if (!srcVisible(s)) return;
      n++;
      if (s.type === 'list' && srcOpen(s)) n += C._srcDocs[s.id].filter(d => ok(d.need)).length;
      if (s.type === 'map') n += (s.spots || []).filter(sp => ok(sp.need)).length;
      if (s.type === 'compare') n += (s.sets || []).filter(x => ok(x.need)).length;
      if (s.type === 'photo') n += (s.scenes || []).filter(x => ok(x.need)).length;
    });
    n += Object.values(C.people).filter(personVisible).length;
    return n;
  }

  /* ───────── text rendering ───────── */
  function inline(t) {
    let h = esc(t);
    h = h.replace(/\[\[([^\]|]+?)(?:\|([\w-]+))?\]\]/g, (m, label, kid) => {
      const id = kid || C._lab[norm(label)];
      if (!id || !C.keywords[id]) return `<span class="kw-x">${label}</span>`;
      return `<button type="button" class="kw${ST.keys.includes(id) ? ' on' : ''}" data-kw="${id}">${label}</button>`;
    });
    return h.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/~~(.+?)~~/g, '<s>$1</s>').replace(/\n/g, '<br>');
  }

  function art(key, cls, svgOnly) {
    const a = C.art[key];
    if (a == null) return '';
    const file = svgOnly && !(a && a.raster) ? null : MG.images[`${C.id}/${key}`];
    const alt = (a && a.alt) || (a && a.use) || '';
    const body = file ? `<img class="${cls || 'art'}" src="${esc(file)}" alt="${esc(alt)}" loading="lazy">` : typeof a === 'string' ? a : a.svg || '';
    if (!(a && a.sensitive) || !ST) return body;
    const open = ST.cens.includes(key) && !S.mild;
    return `<span class="cens${open ? ' open' : ''}" data-cens="${esc(key)}">${body}<span class="cens-l"><b>열람 주의</b>${S.mild ? '잔혹 표현을 끈 상태' : '눌러서 보기'}</span></span>`;
  }

  function pinBtn(ref, t, f, src) {
    if (NOPIN) return '';
    PIN[ref] = { t: plain(t).trim(), f: f || null, src };
    const on = ST.notes.some(n => n.ref === ref);
    const lab = on ? '수첩에 적음' : '수첩에 적기';
    return `<button type="button" class="pin${on ? ' on' : ''}" data-pin="${esc(ref)}" aria-label="${lab}" title="${lab}">${on ? '✓' : '✎'}</button>`;
  }

  function blocks(arr, base, src) {
    if (arr == null) return '';
    if (!Array.isArray(arr)) arr = [arr];
    return arr.map((b, i) => block(b, `${base}#${i}`, src)).join('');
  }

  function block(b, ref, src) {
    if (b == null) return '';
    if (typeof b === 'string') b = { p: b };
    const cls = b.cls ? ' ' + esc(b.cls) : '';
    if (b.h != null) return `<h4 class="b-h${cls}">${inline(b.h)}</h4>`;
    if (b.sep) return `<hr class="b-sep">`;
    if (b.divider != null) return `<p class="b-div"><span>${inline(b.divider)}</span></p>`;
    if (b.note != null) return `<p class="b-note${cls}">${inline(b.note)}</p>`;
    if (b.stamp != null) return `<p class="b-stamp${cls}"><span>${inline(b.stamp)}</span></p>`;
    if (b.sign != null) return `<p class="b-sign${cls}">${inline(b.sign)}</p>`;
    if (b.m != null) {
      if (!ST.m) { ST.m = true; save(); }
      return `<p class="b-m">${inline(b.m)}<span class="b-m-sig">— M</span></p>`;
    }
    if (b.img != null) {
      const cap = b.cap ? `<figcaption>${inline(b.cap)}${pinBtn(ref, b.cap, b.f, src)}</figcaption>` : '';
      return `<figure class="b-img${cls}">${art(b.img)}${cap}</figure>`;
    }
    if (b.rows) {
      const head = b.head ? `<thead><tr>${b.head.map(x => `<th>${inline(x)}</th>`).join('')}<th class="pc"></th></tr></thead>` : '';
      const rows = b.rows.map((r, ri) => `<tr>${r.map(x => `<td>${inline(x)}</td>`).join('')}<td class="pc">${pinBtn(`${ref}.${ri}`, r.join(' · '), b.f && b.f[ri], src)}</td></tr>`).join('');
      return `<div class="b-tbl${cls}"><table>${b.cap ? `<caption>${inline(b.cap)}</caption>` : ''}${head}<tbody>${rows}</tbody></table></div>`;
    }
    if (b.list) {
      return `<ul class="b-list${cls}">${b.list.map((x, li) => `<li>${inline(x)}${pinBtn(`${ref}.${li}`, x, b.f && b.f[li], src)}</li>`).join('')}</ul>`;
    }
    if (b.msg != null) {
      const who = b.who && !b.me ? `<span class="b-who">${esc(b.who)}</span>` : '';
      return `<div class="b-msg${b.me ? ' me' : ''}${cls}">${who}<div class="b-row"><div class="b-bub">${inline(b.msg)}</div>${b.at ? `<time>${esc(b.at)}</time>` : ''}${pinBtn(ref, (b.who ? b.who + ': ' : b.me ? (C.me || '나') + ': ' : '') + b.msg, b.f, src)}</div></div>`;
    }
    if (b.say != null) {
      return `<p class="b-say${cls}">${b.at ? `<time>${esc(b.at)}</time>` : ''}${b.who ? `<span class="b-who">${esc(b.who)}</span>` : ''}<span class="b-line">${inline(b.say)}</span>${pinBtn(ref, (b.who ? b.who + ': ' : '') + b.say, b.f, src)}</p>`;
    }
    if (b.cipher != null) return `<p class="b-cipher${cls}">${esc(b.cipher)}</p>`;
    const t = b.p != null ? b.p : '';
    return `<p class="b-p${cls}">${inline(t)}${b.nopin ? '' : pinBtn(ref, t, b.f, src)}</p>`;
  }

  /* ───────── documents / locks / people / cipher ───────── */
  function lockHtml(id, lock, title) {
    const fails = LOCKFAIL[id] || 0;
    return `<div class="lock"><p class="lock-t">${inline(lock.title || title || '잠겨 있다')}</p>${lock.desc ? `<p class="lock-d">${inline(lock.desc)}</p>` : ''}
      <form class="lock-f" data-lock="${esc(id)}"><label for="lk-${esc(id)}">${esc(lock.label || '비밀번호')}</label><input id="lk-${esc(id)}" autocomplete="off"${lock.password ? ' type="password"' : ''}><button type="submit">${esc(lock.button || '열기')}</button></form>
      ${lock.hint ? `<p class="lock-h">${inline(lock.hint)}</p>` : ''}<p class="lock-e" role="status">${fails ? `맞지 않는다. (${fails}회)` : ''}</p>${lock.hint2 && fails >= ({ 3: 2, 4: 3 }[lv()] || Infinity) ? `<p class="lock-h2">${inline(lock.hint2)}</p>` : ''}</div>`;
  }

  function docHtml(d) {
    const s = C.sources.find(x => x.id === d.src) || {};
    if (d.lock && !ST.unl.includes(d.id)) return lockHtml(d.id, d.lock, d.title);
    if (!ST.seen.includes(d.id)) { ST.seen.push(d.id); save(); }
    const skin = d.skin || s.skin || 'plain';
    const paper = d.paper || s.paper;
    return `<article class="doc skin-${esc(skin)}${d.cls ? ' ' + esc(d.cls) : ''}"${d.bar ? ` style="--bar:${esc(d.bar)}"` : ''}>${docStains(d)}
      <header class="doc-h">${paper ? `<p class="doc-paper">${inline(paper)}</p>` : ''}${d.kicker ? `<p class="doc-k">${inline(d.kicker)}</p>` : ''}<h3 class="doc-t">${inline(d.title)}</h3>${d.meta ? `<p class="doc-m">${inline(d.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(d.body, d.id, plain(d.title))}</div></article>`;
  }

  const rawAns = (p, k) => { let a = p.ask && p.ask[k]; if (a == null && k === p.key) a = p.self; return a; };
  const isCond = a => a && !Array.isArray(a) && typeof a === 'object' && 'need' in a;
  const askEntry = (p, k) => { const a = rawAns(p, k); return isCond(a) && ok(a.need) ? k + '!' : k; };
  function ansBlocks(p, entry) {
    const conf = entry.endsWith('!');
    const k = conf ? entry.slice(0, -1) : entry;
    const a = rawAns(p, k);
    if (isCond(a)) return conf ? a.a : a.else ?? p.idle ?? '…글쎄요.';
    return a ?? p.idle ?? '…글쎄요, 잘 모르겠네요.';
  }
  function portrait(p, big) {
    if (p.art && C.art[p.art]) return `<span class="per-art${big ? ' lg' : ''}">${art(p.art)}</span>`;
    return `<span class="ava${big ? ' lg' : ''}" style="--c:${esc(p.color || '#6b6155')}">${esc(p.initial || p.name[0])}</span>`;
  }
  function askChips(p) {
    const asked = ST.asked[p.id] || [];
    return ST.keys.filter(k => C.keywords[k]).map(k => {
      const e = askEntry(p, k);
      const state = asked.includes(e) ? ' done' : e.endsWith('!') && asked.includes(k) && lv() < 5 ? ' again' : '';
      return `<button type="button" class="chip${state}" data-ask="${k}">${esc(C.keywords[k].label)}</button>`;
    }).join('');
  }
  function personHtml(p) {
    const asked = ST.asked[p.id] || [];
    const src = `${p.name} 탐문`;
    let tr = blocks(p.intro, `${p.id}@_`, src);
    tr += asked.map(e => {
      const k = e.replace(/!$/, '');
      const label = esc((C.keywords[k] || {}).label || k);
      const q = e.endsWith('!') ? `「${label}」 이야기를 다시 꺼냈다.` : `「${label}」에 대해 물었다.`;
      return `<div class="qa"><p class="q">${q}</p>${blocks(ansBlocks(p, e), `${p.id}@${e}`, src)}</div>`;
    }).join('');
    return `<article class="person skin-${esc(p.skin || 'talk')}"><header class="per-h">${portrait(p, true)}<div><h3>${esc(p.name)}</h3>${p.role ? `<p>${inline(p.role)}</p>` : ''}${p.where ? `<p class="per-w">${inline(p.where)}</p>` : ''}</div></header>
      <div class="per-tr">${tr}</div>
      <div class="per-ask"><p class="per-ask-t">무엇을 물어볼까? <small>수첩의 단어</small></p><div class="chips" id="askChips">${askChips(p)}</div></div></article>`;
  }

  function cipherParts(s) {
    const toks = Array.from(s.cipher || '');
    const keep = new Set([' ', '\n', ...Array.from(s.keep || '')]);
    const syms = [...new Set(toks.filter(t => !keep.has(t)))];
    return { toks, keep, syms };
  }
  function cipherGrid(s) {
    const { toks, keep } = cipherParts(s);
    const g = ST.ciph[s.id] || {};
    const given = s.given || {};
    const solved = ST.unl.includes(s.id);
    return toks.map(t => {
      if (t === '\n') return '<br>';
      if (keep.has(t)) return `<span class="cc sp">${t === ' ' ? '&nbsp;' : esc(t)}</span>`;
      const v = solved ? s.key[t] : given[t] || g[t] || '';
      return `<span class="cc${v ? ' has' : ''}"><b>${esc(t)}</b><i>${esc(v || '·')}</i></span>`;
    }).join('');
  }
  function cipherHtml(s) {
    if (!s) return '';
    const { syms } = cipherParts(s);
    const g = ST.ciph[s.id] || {};
    const given = s.given || {};
    const solved = ST.unl.includes(s.id);
    const form = solved ? `<div class="c-done">${blocks(s.solved, `${s.id}@s`, s.name)}</div>` : `<form class="c-form" data-cipher="${esc(s.id)}"><div class="c-keys">${syms.map(y => `<label class="ck"><span>${esc(y)}</span><input data-sym="${esc(y)}" value="${esc(given[y] || g[y] || '')}" maxlength="${s.max || 2}"${given[y] ? ' readonly' : ''} aria-label="기호 ${esc(y)}에 맞는 글자"></label>`).join('')}</div><p class="c-act"><button type="submit">대조해 보기</button><span class="c-msg" role="status"></span></p></form>`;
    return `<article class="doc skin-${esc(s.skin || 'cipher')}"><header class="doc-h"><h3 class="doc-t">${inline(s.title || s.name)}</h3>${s.meta ? `<p class="doc-m">${inline(s.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(s.intro, `${s.id}@i`, s.name)}<div class="c-grid" id="cGrid">${cipherGrid(s)}</div>${form}</div></article>`;
  }

  /* ── 사건 재구성 (timeline): 사건 카드를 순서대로 맞춘다 */
  const TLHIT = {};
  function tlOrder(s) {
    const ids = (s.events || []).map(e => e.id);
    let o = ST.tl[s.id];
    if (!o || o.length !== ids.length || !ids.every(id => o.includes(id))) {
      o = [...ids].sort((a, b) => hash(s.id + a) - hash(s.id + b));
      if (o.every((id, i) => id === ids[i])) o.push(o.shift());
      ST.tl[s.id] = o;
    }
    return o;
  }
  function timelineHtml(s) {
    if (!s) return '';
    const solved = ST.unl.includes(s.id);
    const ev = Object.fromEntries((s.events || []).map(e => [e.id, e]));
    const order = solved ? s.events.map(e => e.id) : tlOrder(s);
    const hit = TLHIT[s.id] || [];
    const rows = order.map((id, i) => `<li class="tl-e${solved ? ' ok' : hit.includes(id) ? ' hit' : ''}"><span class="tl-slot">${inline((s.slots || [])[i] || String(i + 1))}</span><span class="tl-t">${inline(ev[id].t)}</span>${solved ? '' : `<span class="tl-mv"><button type="button" data-tl="${esc(s.id)}|${esc(id)}|-1" aria-label="앞으로"${i === 0 ? ' disabled' : ''}>▲</button><button type="button" data-tl="${esc(s.id)}|${esc(id)}|1" aria-label="뒤로"${i === order.length - 1 ? ' disabled' : ''}>▼</button></span>`}</li>`).join('');
    const act = solved ? `<div class="c-done">${blocks(s.solved, `${s.id}@s`, s.name)}</div>` : `<p class="c-act"><button type="button" data-tl-check="${esc(s.id)}">이 순서로 맞춰 보기</button><span class="c-msg" role="status"></span></p>`;
    return `<article class="doc skin-${esc(s.skin || 'board')}"><header class="doc-h"><h3 class="doc-t">${inline(s.title || s.name)}</h3>${s.meta ? `<p class="doc-m">${inline(s.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(s.intro, `${s.id}@i`, s.name)}<ol class="tl">${rows}</ol>${act}</div></article>`;
  }

  /* ── 대조 감정 (compare): 증거와 일치하는 시료를 고른다 */
  const cmpState = x => (ST.cmp[x.id] ||= { x: [], at: -1 });
  // 대조 감정 재시도 조건: 새 단어나 새 사실(아무 메모가 아니라 증거가 되는 메모)을 얻었는가
  const progress = () => ST.keys.length + new Set(ST.notes.map(n => n.f).filter(Boolean)).size;
  function compareList(s) {
    const sets = (s.sets || []).filter(x => ok(x.need));
    if (!sets.length) return `<p class="res-none">${esc(s.empty || '아직 맡길 감정이 없다.')}</p>`;
    const o = ST.view.open;
    return sets.map(x => `<button type="button" class="item${o && o.t === 'compare' && o.id === x.id ? ' on' : ''}${ST.seen.includes(x.id) ? '' : ' new'}" data-cmp="${esc(x.id)}"><span class="item-t">${ST.unl.includes(x.id) ? '✓ ' : ''}${esc(plain(x.title))}</span>${x.meta ? `<span class="item-m">${esc(plain(x.meta))}</span>` : ''}</button>`).join('');
  }
  function compareHtml(x) {
    if (!x) return '';
    if (!ST.seen.includes(x.id)) { ST.seen.push(x.id); save(); }
    const solved = ST.unl.includes(x.id);
    const st = cmpState(x);
    const wait = !solved && lv() >= 4 && st.at >= 0 && progress() <= st.at;
    const opt = o => {
      const cls = solved && o.id === x.answer ? ' ok' : st.x.includes(o.id) ? ' no' : '';
      return `<div class="cmp-o${cls}">${o.art ? `<div class="cmp-art">${art(o.art, 'art', true)}</div>` : ''}<p class="cmp-n">${inline(o.label)}</p>${o.t ? `<p class="cmp-d">${inline(o.t)}</p>` : ''}${solved || st.x.includes(o.id) ? '' : `<button type="button" data-cmp-pick="${esc(x.id)}|${esc(o.id)}"${wait ? ' disabled' : ''}>이것과 일치</button>`}</div>`;
    };
    const fails = st.x.length;
    const hintAt = { 3: 1, 4: 2 }[lv()] || Infinity;
    const msg = solved ? '' : wait ? '감정 결과 불일치. 다시 맡기려면 새 단서가 하나 더 있어야 한다.' : fails ? `불일치 ${fails}회.` : '';
    const ev = x.evidence || {};
    return `<article class="doc skin-${esc(x.skin || 'lab')}"><header class="doc-h"><p class="doc-k">대조 감정</p><h3 class="doc-t">${inline(x.title)}</h3>${x.meta ? `<p class="doc-m">${inline(x.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(x.intro, `${x.id}@i`, plain(x.title))}
        <div class="cmp-ev"><p class="cmp-lab">${esc(ev.label || '대조할 증거')}</p>${ev.art ? `<div class="cmp-art">${art(ev.art, 'art', true)}</div>` : ''}${ev.t ? `<p class="cmp-d">${inline(ev.t)}</p>` : ''}</div>
        <p class="cmp-q">${inline(x.q || '어느 것과 일치하는가?')}</p>
        <div class="cmp-opts">${(x.options || []).map(opt).join('')}</div>
        <p class="c-msg" role="status">${esc(msg)}</p>${!solved && x.hint && fails >= hintAt ? `<p class="lock-h2">${inline(x.hint)}</p>` : ''}
        ${solved ? `<div class="c-done">${blocks(x.solved, `${x.id}@s`, plain(x.title))}</div>` : ''}</div></article>`;
  }

  /* ── 기록 조회 (query): 정확한 번호·이름을 넣어 대장을 조회한다 */
  function queryHits(s, inp) {
    if (!Object.values(inp).some(v => norm(v))) return null;
    return (s.records || []).filter(r => Object.entries(r.match || {}).every(([f, vals]) => (Array.isArray(vals) ? vals : [vals]).map(norm).includes(norm(inp[f])))).map(r => r.doc).filter((id, i, a) => C.docs[id] && a.indexOf(id) === i);
  }
  function queryList(s) {
    const inp = ST.view.qin[s.id] || {};
    const res = ST.view.qres[s.id];
    const found = (ST.found[s.id] || []).map(id => C.docs[id]).filter(Boolean);
    const fields = (s.fields || []).map(f => `<label class="qf"><span>${esc(f.label)}</span><input name="${esc(f.id)}" value="${esc(inp[f.id] || '')}" placeholder="${esc(f.placeholder || '')}" autocomplete="off"></label>`).join('');
    let out = '';
    if (res) out = res.length ? `<p class="res-n">조회 결과 ${res.length}건</p>${res.map(id => itemBtn(C.docs[id])).join('')}` : `<p class="res-none">${esc(s.none || '해당하는 기록이 없다.')}</p>`;
    return `<form class="q-f" data-query="${esc(s.id)}">${fields}<button type="submit">${esc(s.button || '조회')}</button></form>
      <div class="res">${out}</div>${found.length ? `<p class="res-n">${esc(s.foundLabel || '조회해 둔 기록')}</p>${found.map(itemBtn).join('')}` : ''}`;
  }

  /* ── 정밀 관찰 (photo): 현장 스케치·사진에서 숨은 지점을 찾는다 */
  const sceneSpots = x => (x.spots || []).filter(sp => ok(sp.need));
  function photoList(s) {
    const scenes = (s.scenes || []).filter(x => ok(x.need));
    if (!scenes.length) return `<p class="res-none">${esc(s.empty || '아직 살펴볼 사진이 없다.')}</p>`;
    const o = ST.view.open;
    return scenes.map(x => {
      const n = (x.spots || []).filter(sp => ST.unl.includes(sp.id)).length;
      const tot = lv() >= 5 ? '' : ` / ${sceneSpots(x).length}`;
      return `<button type="button" class="item${o && o.t === 'photo' && o.id === x.id ? ' on' : ''}${ST.seen.includes(x.id) ? '' : ' new'}" data-scene="${esc(x.id)}"><span class="item-t">${esc(plain(x.title))}</span><span class="item-m">찾은 것 ${n}${tot}${x.meta ? ' · ' + esc(plain(x.meta)) : ''}</span></button>`;
    }).join('');
  }
  function photoHtml(x) {
    if (!x) return '';
    if (!ST.seen.includes(x.id)) { ST.seen.push(x.id); save(); }
    const found = (x.spots || []).filter(sp => ST.unl.includes(sp.id));
    const tot = sceneSpots(x).length;
    const marks = found.map((sp, i) => `<span class="ph-mk" style="left:${+sp.x}%;top:${+sp.y}%" aria-hidden="true">${i + 1}</span>`).join('');
    const cells = [];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) cells.push(`<button type="button" class="ph-cell" data-ph-cell="${esc(x.id)}|${q}|${r}" aria-label="${r + 1}행 ${q + 1}열 살피기"></button>`);
    return `<article class="doc skin-${esc(x.skin || 'photo')} scene"><header class="doc-h"><p class="doc-k">정밀 관찰</p><h3 class="doc-t">${inline(x.title)}</h3>${x.meta ? `<p class="doc-m">${inline(x.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(x.intro, `${x.id}@i`, plain(x.title))}
        <div class="ph" data-ph="${esc(x.id)}">${art(x.art, 'art', true)}${marks}<div class="ph-grid" hidden>${cells.join('')}</div></div>
        <p class="ph-bar"><span>찾은 것 ${found.length}${lv() >= 5 ? '' : ` / ${tot}`}</span><button type="button" data-ph-grid>칸을 나눠 살피기</button></p>
        <ol class="ph-found">${found.map(sp => `<li><p class="ph-l">${inline(sp.label)}</p>${blocks(sp.body, `${sp.id}@b`, plain(x.title))}</li>`).join('')}</ol></div></article>`;
  }

  /* ───────── panes ───────── */
  const itemBtn = d => {
    const o = ST.view.open;
    const on = o && o.t === 'doc' && o.id === d.id;
    return `<button type="button" class="item${on ? ' on' : ''}${ST.seen.includes(d.id) ? '' : ' new'}" data-doc="${d.id}"><span class="item-t">${esc(plain(d.title))}</span>${d.meta ? `<span class="item-m">${esc(plain(d.meta))}</span>` : ''}</button>`;
  };
  const keyChips = attr => ST.keys.filter(k => C.keywords[k]).map(k => `<button type="button" class="chip" ${attr}="${k}">${esc(C.keywords[k].label)}</button>`).join('');

  function matchKeys(q) {
    const n = norm(q);
    if (!n) return [];
    // 수첩에 적은 단어는 일부만 쳐도 찾히고, 아직 모르는 단어는 온전히 쳐야만 찾힌다 (추적을 건너뛰지 못하게).
    return Object.entries(C.keywords).filter(([id, k]) => {
      const labels = [k.label, ...(k.alias || [])].map(norm).filter(Boolean);
      if (!ST.keys.includes(id)) return labels.some(l => l === n || (l.length >= 2 && n.includes(l)));
      return labels.some(l => l === n || (n.length >= 2 && l.includes(n)) || (l.length >= 2 && n.includes(l)));
    }).map(([id]) => id);
  }
  function archiveHits(s, q) {
    const ks = matchKeys(q);
    return C._srcDocs[s.id].filter(d => ok(d.need) && (d.find || []).some(k => ks.includes(k)));
  }
  function archiveList(s) {
    const q = ST.view.q[s.id] || '';
    let res = '';
    if (q) {
      const hits = archiveHits(s, q);
      res = hits.length ? `<p class="res-n">「${esc(q)}」 ${hits.length}건</p>${hits.map(itemBtn).join('')}` : `<p class="res-none">「${esc(q)}」에 해당하는 자료가 없다.</p>`;
    }
    const start = (s.start || []).map(id => C.docs[id]).filter(d => d && ok(d.need));
    const chips = keyChips('data-search');
    return `<form class="arch-f" data-arch="${esc(s.id)}" role="search"><input id="aq-${esc(s.id)}" value="${esc(q)}" placeholder="${esc(s.placeholder || '찾을 단어')}" aria-label="${esc(s.name)} 검색어" autocomplete="off"><button type="submit">찾기</button></form>
      ${chips ? `<p class="chips-t">수첩의 단어로 찾기</p><div class="chips">${chips}</div>` : ''}
      <div class="res">${res}</div>
      ${start.length ? `<p class="res-n">${esc(s.startLabel || '처음부터 있던 자료')}</p>${start.map(itemBtn).join('')}` : ''}`;
  }
  function listList(s) {
    const docs = C._srcDocs[s.id].filter(d => ok(d.need));
    return docs.length ? docs.map(itemBtn).join('') : `<p class="res-none">${esc(s.empty || '아직 아무것도 없다.')}</p>`;
  }
  function peopleList(s) {
    const ps = Object.values(C.people).filter(p => p.src === s.id && personVisible(p));
    const o = ST.view.open;
    if (!ps.length) return `<p class="res-none">${esc(s.empty || '아직 찾아갈 사람이 없다. 이름을 알아내야 한다.')}</p>`;
    return ps.map(p => `<button type="button" class="item person${o && o.t === 'person' && o.id === p.id ? ' on' : ''}${ST.asked[p.id] ? '' : ' new'}" data-person="${p.id}">${portrait(p)}<span class="item-t">${esc(p.name)}</span>${p.role ? `<span class="item-m">${esc(plain(p.role))}</span>` : ''}</button>`).join('');
  }
  function mapList(s) {
    const spots = (s.spots || []).filter(sp => ok(sp.need));
    return `<div class="map">${art(s.art)}${spots.map(sp => `<button type="button" class="spot" style="left:${+sp.x}%;top:${+sp.y}%" data-spot="${esc(sp.id)}" aria-label="${esc(sp.label)}"><span>${esc(sp.label)}</span></button>`).join('')}</div>
      ${spots.map(sp => { const d = C.docs[sp.doc]; return d ? itemBtn(d) : ''; }).join('')}`;
  }

  function renderTabs() {
    const vis = C.sources.filter(srcVisible);
    if (!vis.find(s => s.id === ST.view.src)) ST.view.src = vis[0] && vis[0].id;
    $('#srcTabs').innerHTML = vis.map(s => `<button type="button" role="tab" class="tab${s.id === ST.view.src ? ' on' : ''}" aria-selected="${s.id === ST.view.src}" data-src="${esc(s.id)}">${esc(s.name)}${s.lock && !ST.unl.includes(s.id) ? '<span class="tab-lock">잠김</span>' : ''}</button>`).join('');
  }
  function renderList() {
    const s = curSrc();
    const el = $('#paneList');
    if (!s) { el.innerHTML = ''; return; }
    let h = s.desc ? `<p class="src-desc">${inline(s.desc)}</p>` : '';
    if (s.type === 'archive') h += archiveList(s);
    else if (s.type === 'list') h += srcOpen(s) ? listList(s) : lockHtml(s.id, s.lock, s.name);
    else if (s.type === 'people') h += peopleList(s);
    else if (s.type === 'map') h += mapList(s);
    else if (s.type === 'cipher') h += `<button type="button" class="item" data-open-cipher="${esc(s.id)}"><span class="item-t">${esc(s.openLabel || '해독지 펼치기')}</span></button>`;
    else if (s.type === 'timeline') h += `<button type="button" class="item" data-open-tl="${esc(s.id)}"><span class="item-t">${ST.unl.includes(s.id) ? '✓ ' : ''}${esc(s.openLabel || '재구성 판 펼치기')}</span></button>`;
    else if (s.type === 'compare') h += compareList(s);
    else if (s.type === 'query') h += queryList(s);
    else if (s.type === 'photo') h += photoList(s);
    el.innerHTML = h;
    el.dataset.type = s.type;
  }
  function renderRead() {
    const el = $('#paneRead');
    const o = ST.view.open;
    let h;
    if (o && o.t === 'doc' && C.docs[o.id]) h = docHtml(C.docs[o.id]);
    else if (o && o.t === 'person' && C.people[o.id]) h = personHtml(C.people[o.id]);
    else if (o && o.t === 'cipher') h = cipherHtml(C.sources.find(s => s.id === o.id));
    else if (o && o.t === 'timeline') h = timelineHtml(C.sources.find(s => s.id === o.id));
    else if (o && o.t === 'compare' && C._sets[o.id]) h = compareHtml(C._sets[o.id]);
    else if (o && o.t === 'photo' && C._scenes[o.id]) h = photoHtml(C._scenes[o.id]);
    else h = `<div class="read-empty"><p>${inline(C.emptyRead || '왼쪽에서 자료를 고르면 여기에 펼쳐진다.')}</p></div>`;
    el.innerHTML = `<button type="button" class="back-list" data-back>← 목록으로</button>${h}`;
    $('#stageBody').classList.toggle('reading', !!(o && h));
  }

  /* ───────── notebook ───────── */
  function solvedHtml(fresh) {
    const sol = C.solution;
    NOPIN = true;
    const epi = blocks(sol.epilogue, 'epi', '결말');
    NOPIN = false;
    return `<div class="stamp${fresh ? ' fresh' : ''}"><div>사건<br>종결<small>${esc(sol.stamp || '')}</small></div></div><div class="epi">${epi}</div>${sol.next ? `<p class="epi-next">${inline(sol.next)}</p>` : ''}`;
  }
  function renderNotebook() {
    const nb = $('#nb');
    if (!nb) return;
    const b = C.brief || {};
    const keys = ST.keys.filter(k => C.keywords[k]);
    const groups = Object.keys(KTYPE).map(t => [t, keys.filter(k => (C.keywords[k].type || 'word') === t)]).filter(([, a]) => a.length);
    const persons = keys.filter(k => C.keywords[k].type === 'person');
    const notes = ST.notes;
    const sol = C.solution;
    const top = nb.scrollTop;
    nb.innerHTML = `
      <div class="nb-rings" aria-hidden="true"></div>
      <div class="nb-top"><button type="button" class="nb-back" data-cabinet>← 기록실</button><span class="nb-case">${soundBtn()}${C.graphic ? mildBtn() : ''} ${starsHtml(C)} CASE ${pad(C.no)}</span></div>
      <article class="brief"><svg class="clip" viewBox="0 0 24 64" aria-hidden="true"><path d="M8 20 V50 a6 6 0 0 0 12 0 V12 a8 8 0 0 0 -16 0 V46" fill="none" stroke="#8d918f" stroke-width="2.6" stroke-linecap="round"/></svg>
        ${gore() ? stains(C.id + 'brief', 1, 'bd', true) : ''}<h2>${esc(b.title || C.title)} <small>${esc(b.no || '')}</small></h2>
        <dl>${(b.lines || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${inline(v)}</dd>`).join('')}</dl>${b.scrawl ? `<p class="scrawl">${inline(b.scrawl)}</p>` : ''}</article>
      <section class="ruled nb-sec"><h3 class="hh">단어 <small>${keys.length}</small></h3>
        ${groups.map(([t, a]) => `<p class="kg"><span class="kg-t">${KTYPE[t]}</span> ${a.map(k => `<button type="button" class="kchip" data-chip="${k}">${esc(C.keywords[k].label)}</button>`).join(' ')}</p>`).join('')}
      </section>
      <section class="ruled nb-sec"><h3 class="hh">메모 <small>${notes.length}</small></h3>
        <ol class="notes">${(C.tips || []).map(t => `<li class="tip">※ ${inline(t)}</li>`).join('')}${notes.map((n, i) => `<li data-nid="${n.id}" style="--r:${(hash(n.ref) % 5 - 2) * 0.25}deg"><span class="n">${i + 1}.</span> ${esc(n.t)} <span class="src">— ${esc(n.src || '')}</span><button type="button" class="del" data-del="${n.id}" aria-label="메모 ${i + 1} 지우기">×</button></li>`).join('')}</ol>
      </section>
      <section class="ruled nb-sec nb-rep"><h3 class="hh">수사 보고서</h3>
        <form id="rep" autocomplete="off">
          <p><label for="rep-culprit">범인은</label> <select class="blank" id="rep-culprit" data-rep="culprit"><option value="">— 수첩의 인물 —</option>${persons.map(k => `<option value="${k}"${ST.report.culprit === k ? ' selected' : ''}>${esc(C.keywords[k].label)}</option>`).join('')}</select></p>
          ${sol.claims.map((cl, i) => `<p class="claim"><label for="rep-${esc(cl.id)}"><span class="no">${i + 1}.</span> ${esc(plain(cl.q))}</label><br><select class="blank wide" id="rep-${esc(cl.id)}" data-rep="${esc(cl.id)}"><option value="">— 증거가 될 메모 —</option>${notes.map((n, j) => `<option value="${n.id}"${String(ST.report.claims[cl.id]) === String(n.id) ? ' selected' : ''}>${j + 1}. ${esc(trunc(n.t, 28))}</option>`).join('')}</select></p>`).join('')}
          <p class="submit-row"><button type="submit" class="btn-hand">보고서 올리기</button><span class="tries">${ST.tries ? `제출 ${ST.tries}회` : ''}</span></p>
        </form>
        <p class="verdict" role="status">${esc(VERDICT)}</p>
        <div id="solvedBox">${ST.solved ? solvedHtml(false) : ''}</div>
      </section>
      <footer class="nb-foot"><button type="button" class="reset" data-reset>이 사건 처음부터</button><p>${esc(C.disclaimer || '실제 미제 사건의 모티프만 빌린 창작입니다. 인물·장소·기관은 모두 지어낸 것입니다.')}</p></footer>`;
    nb.scrollTop = top;
  }

  /* ───────── screens ───────── */
  function renderCase() {
    document.body.dataset.screen = 'case';
    app.innerHTML = `${gore() ? `<div class="gore-bg" aria-hidden="true">${stains(C.id + 'bg', 5, 'aacb', true)}</div>` : ''}<div class="case-view" data-case="${esc(C.id)}" data-frame="${esc(C.frame || 'papers')}"${gore() ? ' data-graphic' : ''}>
      <main class="stage" aria-label="조사 자료">
        <div class="stage-frame"><span class="cam" aria-hidden="true"></span>
          <div class="screen">
            <nav class="src-tabs" role="tablist" id="srcTabs" aria-label="조사 도구"></nav>
            <div class="stage-body" id="stageBody"><section class="pane-list" id="paneList" aria-label="목록"></section><section class="pane-read" id="paneRead" aria-label="읽기"></section></div>
          </div>
        </div>
        <div class="frame-foot" aria-hidden="true"></div>
        ${C.tag ? `<div class="evtag">${inline(C.tag)}</div>` : ''}
      </main>
      <aside class="nb" id="nb" aria-label="형사 수첩"></aside>
    </div>`;
    PIN = {};
    renderTabs(); renderList(); renderRead(); renderNotebook();
  }
  // intro: 기록실에서 폴더를 눌러 열 때만 여는 장면을 보여 준다 (새로 고침·처음부터 다시는 바로)
  function openCase(id, intro) {
    const c = MG.byId[id];
    if (!c) return cabinet();
    if (c.graphic && !cs(c).cw) return warnScreen(c);
    C = c; ST = cs(c); VERDICT = '';
    S.current = id; save();
    renderCase();
    if (MG.mood) MG.mood.enter(C, intro);
    window.scrollTo(0, 0);
  }

  function warnScreen(c) {
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    app.innerHTML = `<div class="cw"><div class="cw-card">${S.mild ? '' : stains(c.id + 'cw', 2, 'acd', true)}<p class="cw-t">혐오감 주의</p><h2>CASE ${pad(c.no)} 「${esc(c.title)}」 ${starsHtml(c)}</h2>
      <p>${esc(c.warn || '이 사건 기록에는 시신 훼손 같은 잔혹한 내용과 강한 묘사가 들어 있습니다.')}</p><p class="cw-s">모든 인물과 사건은 지어낸 것입니다. 불편하면 언제든 기록실로 돌아가도 됩니다. 핏자국 같은 화면 연출과 사진은 「잔혹 표현」 단추로 끌 수 있습니다.</p><p>${mildBtn()}</p>
      <p class="cw-b"><button type="button" class="btn-hand" data-cw-ok="${esc(c.id)}">기록을 연다</button> <button type="button" class="reset" data-cabinet>돌아간다</button></p></div></div>`;
    window.scrollTo(0, 0);
  }

  function cabinet() {
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    const main = MG.cases.filter(c => c.kind !== 'tutorial');
    const solvedMain = main.filter(c => S.cases[c.id] && S.cases[c.id].solved).length;
    const mList = MG.cases.filter(c => c._m && S.cases[c.id] && S.cases[c.id].m);
    const folder = c => {
      const st = S.cases[c.id];
      const status = st && st.solved ? 'done' : st && (st.notes.length || st.seen.length) ? 'going' : 'new';
      const kind = c.kind === 'tutorial' ? '튜토리얼' : c.region === 'overseas' ? '해외' : '국내';
      const coverFile = MG.images[`${c.id}/cover`];
      const cover = coverFile ? `<img src="${esc(coverFile)}" alt="" loading="lazy">` : c.art && c.art.cover ? (typeof c.art.cover === 'string' ? c.art.cover : c.art.cover.svg || '') : '';
      return `<button type="button" class="folder ${status}${c.kind === 'tutorial' ? ' tutorial' : ''}" data-open="${esc(c.id)}" style="--tilt:${(hash(c.id) % 7 - 3) * 0.4}deg">
        ${cover ? `<span class="f-cover${c.graphic ? ' graphic' : ''}" aria-hidden="true">${cover}</span>` : ''}${c.graphic && !S.mild ? `<span class="f-blood" aria-hidden="true">${stains(c.id + 'f', 2, 'dac', false)}</span>` : ''}${c.graphic ? '<span class="f-warn">혐오감 주의</span>' : ''}
        <span class="f-tab">CASE ${pad(c.no)}</span>
        <span class="f-body"><span class="f-kind">${kind} · ${esc(c.year)} ${c.kind === 'tutorial' ? '<span class="stars t">연습</span>' : starsHtml(c)}</span><span class="f-label"><span class="f-title">${esc(c.title)}</span><span class="f-place">${esc(c.place)}</span></span>
        <span class="f-motif">${esc(c.motif || '')}</span>${c.length ? `<span class="f-len">${esc(c.length)}</span>` : ''}
        ${status === 'done' ? '<span class="f-stamp">종결</span>' : status === 'going' ? '<span class="f-going">수사 중</span>' : ''}</span></button>`;
    };
    const intro = S.intro ? '' : `<div class="intro"><p>서울서부경찰서 강력2팀. 전출 간 선배 <b>M</b>이 책상 서랍 열쇠 하나를 남기고 갔다.</p><p>서랍 속에는 한 세기에 걸친 미제 기록 ${numk(main.length)} 건. 사진 한 장, 편지 한 통, 누군가의 혼잣말 같은 기록들. 기록은 대답하지 않는다. 쫓아가는 사람에게만 조금씩 입을 연다.</p><p class="intro-hand">처음이면 CASE 00부터. 조사하는 법을 거기서 익힐 것. — 팀장</p><button type="button" class="btn-hand" data-intro-ok>서랍을 연다</button></div>`;
    const letter = main.length >= 10 && solvedMain === main.length ? `<article class="m-letter"><h3>서랍 맨 밑의 편지</h3>${(MG.finale || []).map(p => `<p>${esc(p.replace(/{n}/g, numk(main.length)).replace(/{next}/g, numk(main.length + 1)))}</p>`).join('')}<p class="m-sig">— M</p></article>` : '';
    const hero = MG.images['_global/hero'];
    app.innerHTML = `<div class="cabinet">
      ${hero ? `<div class="cab-hero" aria-hidden="true"><img src="${esc(hero)}" alt=""></div>` : ''}
      <header class="cab-top"><p class="cab-kicker">서울서부경찰서 강력2팀 · 미제사건 기록실</p><h1 class="cab-title">Monologue Gaze</h1><p class="cab-sub">기록은 혼잣말을 한다. 들어주는 건 당신이다.</p>
        ${soundBtn()}${MG.cases.some(c => c.graphic) ? mildBtn() : ''}<p class="cab-stat">종결 <b>${solvedMain}</b> / ${main.length} · M의 메모 <b>${mList.length}</b> / ${MG.cases.filter(c => c._m).length}</p></header>
      ${intro}
      <section class="drawer" aria-label="사건 파일">${MG.cases.map(folder).join('')}</section>
      ${mList.length ? `<section class="mbox"><h2>M의 메모</h2><p class="mbox-sub">기록 여백에 남아 있던, 선배의 글씨.</p><ul>${mList.map(c => `<li><span class="mbox-case">CASE ${pad(c.no)}</span> ${esc(plain(c._m))}</li>`).join('')}</ul></section>` : ''}
      ${letter}
      <footer class="cab-foot"><p>모든 사건은 실제 미제 사건의 모티프만 빌려 새로 지은 이야기입니다. 등장하는 인물·장소·기관·사이트는 모두 허구이며, 실제 인물이나 피해자와 관계가 없습니다.</p><button type="button" class="reset" data-wipe>모든 기록 지우기</button></footer>
    </div>`;
  }

  /* ───────── sound (합성음, 기본 꺼짐) ───────── */
  let actx = null;
  function sfx(kind) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const noise = (dur, type, freq, q, gain) => {
        const len = Math.floor(actx.sampleRate * dur);
        const buf = actx.createBuffer(1, len, actx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = actx.createBufferSource(); src.buffer = buf;
        const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
        const g = actx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(f).connect(g).connect(actx.destination); src.start(t);
      };
      if (kind === 'pen') { noise(0.09, 'bandpass', 3200, 1.2, 0.18); setTimeout(() => noise(0.07, 'bandpass', 2600, 1.2, 0.12), 90); }
      else if (kind === 'page') noise(0.22, 'lowpass', 1400, 0.7, 0.22);
      else if (kind === 'stamp') {
        const o = actx.createOscillator(); const g = actx.createGain();
        o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18);
        g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.26);
        noise(0.12, 'lowpass', 900, 0.8, 0.3);
      } else if (kind === 'lock') noise(0.05, 'highpass', 4000, 0.8, 0.15);
      else if (kind === 'dread') { // 🔞 사진을 열 때: 낮게 가라앉는 울림
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(40, t + 1.9);
        g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.34, t + 0.35); g.gain.exponentialRampToValueAtTime(0.001, t + 2.1);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 2.15);
        noise(1.4, 'lowpass', 260, 0.6, 0.14);
      }
    } catch (e) { /* audio unavailable */ }
  }
  const mildBtn = () => `<button type="button" class="snd mild" data-mild aria-pressed="${!S.mild}">${S.mild ? '잔혹 표현 꺼짐' : '잔혹 표현 켜짐'}</button>`;
  const soundBtn = () => `<button type="button" class="snd" data-sound aria-pressed="${!!S.sound}">${S.sound ? '소리 켜짐' : '소리 꺼짐'}</button>`;

  /* ───────── actions ───────── */
  let toastTimer;
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 2200);
  }
  function refreshAll() { renderTabs(); renderList(); renderRead(); renderNotebook(); }

  function addKey(id, quiet) {
    const k = C.keywords[id];
    if (!k) return;
    if (ST.keys.includes(id)) { if (!quiet) toast(`이미 수첩에 있다: ${k.label}`); return; }
    const before = census();
    ST.keys.push(id); save(); sfx('pen');
    const gained = census() - before;
    $$('.kw').forEach(b => { if (b.dataset.kw === id) b.classList.add('on'); });
    renderTabs(); renderList(); renderNotebook();
    const chips = $('#askChips');
    if (chips && ST.view.open && ST.view.open.t === 'person') chips.innerHTML = askChips(C.people[ST.view.open.id]);
    if (!quiet) toast(`수첩에 적었다: ${k.label}${gained > 0 ? ` · 새로 열린 것 ${gained}` : ''}`);
  }
  function pin(ref) {
    const p = PIN[ref];
    if (!p) return;
    if (ST.notes.some(n => n.ref === ref)) { toast('이미 적어 둔 메모다'); return; }
    const before = census();
    ST.notes.push({ id: ++ST.nid, ref, t: p.t, f: p.f, src: p.src });
    save(); sfx('pen');
    $$('.pin').forEach(b => { if (b.dataset.pin === ref) { b.classList.add('on'); b.textContent = '✓'; b.setAttribute('aria-label', '수첩에 적음'); } });
    renderNotebook();
    const li = $(`.notes li[data-nid="${ST.nid}"]`);
    if (li) li.classList.add('fresh');
    const gained = census() - before;
    if (gained > 0) { renderTabs(); renderList(); }
    const chips = $('#askChips');
    if (chips && ST.view.open && ST.view.open.t === 'person') chips.innerHTML = askChips(C.people[ST.view.open.id]);
    toast(`메모 ${ST.notes.length}번을 적었다${gained > 0 ? ` · 새로 열린 것 ${gained}` : ''}`);
  }
  function delNote(id) {
    const n = ST.notes.find(x => x.id === id);
    ST.notes = ST.notes.filter(x => x.id !== id);
    Object.keys(ST.report.claims).forEach(k => { if (String(ST.report.claims[k]) === String(id)) ST.report.claims[k] = ''; });
    save();
    if (n) $$('.pin').forEach(b => { if (b.dataset.pin === n.ref) { b.classList.remove('on'); b.textContent = '✎'; b.setAttribute('aria-label', '수첩에 적기'); } });
    renderNotebook();
  }
  function openItem(o) {
    ST.view.open = o; save(); sfx('page');
    renderRead(); renderList();
    $('#paneRead').scrollTop = 0;
    if (narrow()) $('.stage').scrollIntoView({ block: 'start' });
  }
  function setQ(srcId, q) {
    ST.view.src = srcId; ST.view.q[srcId] = q; save();
    renderTabs(); renderList();
  }
  function search(kid) {
    let s = curSrc();
    if (!s || s.type !== 'archive') s = C.sources.find(x => x.type === 'archive' && srcVisible(x));
    if (!s) { toast('이 사건에는 검색할 자료실이 없다'); return; }
    setQ(s.id, C.keywords[kid].label);
    if (narrow()) { ST.view.open = null; renderRead(); $('.stage').scrollIntoView({ block: 'start' }); }
  }
  function ask(k) {
    const o = ST.view.open;
    if (!o || o.t !== 'person') return;
    const p = C.people[o.id];
    const e = askEntry(p, k);
    const a = (ST.asked[p.id] ||= []);
    if (!a.includes(e)) a.push(e);
    save();
    const before = census();
    renderRead(); renderList();
    const qa = $$('.qa').pop();
    if (qa) $('#paneRead').scrollTop = qa.offsetTop - 12;
    if (census() > before) renderTabs();
  }
  function chip(k) {
    const o = ST.view.open;
    if (o && o.t === 'person') { ask(k); if (narrow()) $('.stage').scrollIntoView({ block: 'start' }); return; }
    search(k);
  }
  function tryLock(id, v) {
    const target = C.docs[id] || C.sources.find(s => s.id === id);
    const lock = target && target.lock;
    if (!lock) return;
    if ((lock.code || []).map(norm).includes(norm(v))) {
      const before = census();
      if (!ST.unl.includes(id)) ST.unl.push(id);
      (lock.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
      save(); refreshAll(); sfx('lock');
      const gained = census() - before;
      toast((lock.ok || '열렸다.') + (gained > 0 ? ` · 새로 열린 것 ${gained}` : ''));
    } else {
      LOCKFAIL[id] = (LOCKFAIL[id] || 0) + 1;
      renderList(); renderRead();
    }
  }
  function checkCipher(id) {
    const s = C.sources.find(x => x.id === id);
    if (!s) return;
    const { syms } = cipherParts(s);
    const g = ST.ciph[s.id] || {};
    const given = s.given || {};
    const right = syms.filter(y => norm(given[y] || g[y]) === norm(s.key[y])).length;
    if (right === syms.length) {
      const before = census();
      ST.unl.push(s.id);
      ((s.reward && s.reward.keys) || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
      save(); refreshAll();
      const gained = census() - before;
      toast(`해독했다${gained > 0 ? ` · 새로 열린 것 ${gained}` : ''}`);
    } else {
      const m = $('.c-msg');
      if (m) m.textContent = (s.feedback || (lv() >= 5 ? 'none' : 'count')) === 'none' ? '아직 문장이 되지 않는다.' : `기호 ${syms.length}개 중 ${right}개가 맞는 것 같다.`;
    }
  }
  function solveThing(id, reward, msg) {
    const before = census();
    if (!ST.unl.includes(id)) ST.unl.push(id);
    ((reward && reward.keys) || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); refreshAll(); sfx('lock');
    const gained = census() - before;
    toast(msg + (gained > 0 ? ` · 새로 열린 것 ${gained}` : ''));
  }
  function moveTl(arg) {
    const [sid, eid, dir] = arg.split('|');
    const s = C.sources.find(x => x.id === sid);
    if (!s || ST.unl.includes(sid)) return;
    const o = tlOrder(s), i = o.indexOf(eid), j = i + +dir;
    if (i < 0 || j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    delete TLHIT[sid];
    save(); sfx('page'); renderRead();
    const b = $(`[data-tl="${sid}|${eid}|${dir}"]`) || $(`[data-tl="${sid}|${eid}|${-dir}"]`);
    if (b) b.focus();
  }
  function checkTimeline(sid) {
    const s = C.sources.find(x => x.id === sid);
    if (!s) return;
    const o = tlOrder(s);
    const hit = o.filter((id, i) => id === s.events[i].id);
    if (hit.length === o.length) return solveThing(sid, s.reward, s.ok || '앞뒤가 맞아떨어졌다');
    TLHIT[sid] = lv() <= 3 ? hit : [];
    renderRead();
    const m = $('.c-msg');
    if (m) m.textContent = lv() >= 5 ? '아직 앞뒤가 맞지 않는다.' : `${o.length}개 중 ${hit.length}개가 제자리인 것 같다.`;
  }
  function pickCompare(arg) {
    const [xid, oid] = arg.split('|');
    const x = C._sets[xid];
    if (!x || ST.unl.includes(xid)) return;
    const st = cmpState(x);
    if (lv() >= 4 && st.at >= 0 && progress() <= st.at) return;
    if (oid === x.answer) return solveThing(xid, x.reward, x.ok || '감정 결과 일치');
    if (!st.x.includes(oid)) st.x.push(oid);
    st.at = progress();
    save(); sfx('lock'); renderRead();
  }
  function runQuery(form) {
    const s = C.sources.find(x => x.id === form.dataset.query);
    if (!s) return;
    const inp = {};
    (s.fields || []).forEach(fl => { const i = form.querySelector(`[name="${fl.id}"]`); inp[fl.id] = i ? i.value.trim() : ''; });
    ST.view.qin[s.id] = inp;
    const hits = queryHits(s, inp);
    ST.view.qres[s.id] = hits || [];
    const before = census();
    const fr = (ST.found[s.id] ||= []);
    (hits || []).forEach(id => { if (!fr.includes(id)) fr.push(id); });
    (s.records || []).filter(r => (hits || []).includes(r.doc)).forEach(r => (r.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); }));
    save(); sfx('page');
    renderTabs(); renderList(); renderNotebook();
    if (hits && hits.length === 1) openItem({ t: 'doc', id: hits[0] });
    if (census() > before) toast(`새로 열린 것 ${census() - before}`);
  }
  function photoFind(xid, test) {
    const x = C._scenes[xid];
    if (!x) return false;
    const sp = sceneSpots(x).find(p => !ST.unl.includes(p.id) && test(p));
    if (!sp) return false;
    const before = census();
    ST.unl.push(sp.id);
    (sp.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); sfx('pen'); refreshAll();
    const gained = census() - before;
    toast(`눈에 걸리는 것: ${plain(sp.label)}${gained > 0 ? ` · 새로 열린 것 ${gained}` : ''}`);
    const li = $$('.ph-found li').pop();
    if (li) li.classList.add('fresh');
    return true;
  }
  function photoClick(el, e) {
    // 테두리를 뺀 안쪽(그림) 기준으로 잰다
    const r = el.getBoundingClientRect(), w = el.clientWidth || r.width, h = el.clientHeight || r.height;
    const px = ((e.clientX - r.left - el.clientLeft) / w) * 100, py = ((e.clientY - r.top - el.clientTop) / h) * 100;
    const hit = photoFind(el.dataset.ph, p => Math.hypot(px - p.x, (py - p.y) * (h / w)) <= (p.r || 7));
    if (!hit) {
      const d = document.createElement('span');
      d.className = 'ph-miss'; d.style.left = px + '%'; d.style.top = py + '%';
      el.appendChild(d); setTimeout(() => d.remove(), 700);
    }
  }
  function photoCell(arg) {
    const [xid, q, r] = arg.split('|').map((v, i) => (i ? +v : v));
    if (!photoFind(xid, p => Math.min(3, Math.floor(p.x / 25)) === q && Math.min(2, Math.floor(p.y / (100 / 3))) === r)) toast('이 칸에는 눈에 걸리는 것이 없다');
  }
  function submitReport() {
    const sol = C.solution;
    if (!ST.report.culprit || sol.claims.some(cl => !ST.report.claims[cl.id])) { VERDICT = '빈칸이 남아 있다.'; renderNotebook(); return; }
    ST.tries++;
    const bad = ST.report.culprit === sol.culprit ? [] : ['범인'];
    sol.claims.forEach((cl, i) => {
      const n = ST.notes.find(x => String(x.id) === String(ST.report.claims[cl.id]));
      if (!n || !(cl.accept || []).includes(n.f)) bad.push(`${i + 1}번`);
    });
    const wrong = bad.length;
    const fresh = wrong === 0 && !ST.solved;
    if (wrong === 0) { ST.solved = true; VERDICT = ''; }
    else if (lv() >= 5) VERDICT = sol.far || '반려. 어디가 틀렸는지는 아무도 말해 주지 않는다.';
    else {
      VERDICT = wrong === 1 ? sol.near || '딱 한 군데가 어긋난다.' : sol.far || '아직 이야기가 이어지지 않는다. 더 쫓아가 보자.';
      if (lv() <= 3) VERDICT += ` (어긋난 칸: ${bad.join(', ')})`;
    }
    save(); renderNotebook();
    if (fresh) {
      const box = $('#solvedBox');
      if (box) { box.innerHTML = solvedHtml(true); box.scrollIntoView({ block: 'nearest' }); }
      toast('사건 종결'); sfx('stamp');
    }
  }
  function armed(el, label, fn) {
    if (!el.classList.contains('arm')) {
      const orig = el.textContent;
      el.classList.add('arm'); el.textContent = label;
      setTimeout(() => { el.classList.remove('arm'); el.textContent = orig; }, 3000);
      return;
    }
    fn();
  }

  /* ───────── events ───────── */
  function bind() {
    document.addEventListener('click', e => {
      const t = e.target;
      let el;
      if ((el = t.closest('[data-open]'))) return openCase(el.dataset.open, true);
      if ((el = t.closest('[data-cw-ok]'))) { const c = MG.byId[el.dataset.cwOk]; if (c) { cs(c).cw = true; save(); openCase(c.id, true); } return; }
      if (t.closest('[data-cabinet]')) { cabinet(); window.scrollTo(0, 0); return; }
      if ((el = t.closest('[data-mild]'))) { S.mild = !S.mild; save(); if (C) { renderCase(); if (MG.mood) MG.mood.enter(C); } else if (t.closest('.cw')) { const id = app.querySelector('[data-cw-ok]'); if (id) warnScreen(MG.byId[id.dataset.cwOk]); } else cabinet(); return; }
      if ((el = t.closest('[data-sound]'))) { S.sound = !S.sound; save(); el.outerHTML = soundBtn(); if (S.sound) sfx('pen'); if (MG.mood) MG.mood.sound(); return; }
      if (t.closest('[data-intro-ok]')) { S.intro = true; save(); cabinet(); return; }
      if ((el = t.closest('[data-wipe]'))) return armed(el, '한 번 더 누르면 전부 지워진다', () => { S = { cases: {}, current: null, intro: false }; save(); cabinet(); });
      if (!C) return;
      if ((el = t.closest('[data-pin]'))) return pin(el.dataset.pin);
      if ((el = t.closest('[data-kw]'))) return addKey(el.dataset.kw);
      if ((el = t.closest('[data-src]'))) {
        ST.view.src = el.dataset.src;
        const s = curSrc();
        if (s.type === 'cipher' || s.type === 'timeline') ST.view.open = { t: s.type, id: s.id };
        else if (narrow()) ST.view.open = null;
        save(); renderTabs(); renderList(); renderRead();
        return;
      }
      if ((el = t.closest('[data-doc]'))) return openItem({ t: 'doc', id: el.dataset.doc });
      if ((el = t.closest('[data-person]'))) return openItem({ t: 'person', id: el.dataset.person });
      if ((el = t.closest('[data-spot]'))) {
        const sp = (curSrc().spots || []).find(x => x.id === el.dataset.spot);
        if (sp && C.docs[sp.doc]) openItem({ t: 'doc', id: sp.doc });
        return;
      }
      if ((el = t.closest('[data-open-cipher]'))) return openItem({ t: 'cipher', id: el.dataset.openCipher });
      if ((el = t.closest('[data-open-tl]'))) return openItem({ t: 'timeline', id: el.dataset.openTl });
      if ((el = t.closest('[data-tl]'))) return moveTl(el.dataset.tl);
      if ((el = t.closest('[data-tl-check]'))) return checkTimeline(el.dataset.tlCheck);
      if ((el = t.closest('[data-cmp]'))) return openItem({ t: 'compare', id: el.dataset.cmp });
      if ((el = t.closest('[data-cmp-pick]'))) return pickCompare(el.dataset.cmpPick);
      if ((el = t.closest('[data-scene]'))) return openItem({ t: 'photo', id: el.dataset.scene });
      if ((el = t.closest('[data-ph-cell]'))) return photoCell(el.dataset.phCell);
      if (t.closest('[data-ph-grid]')) { const g = $('.ph-grid'); if (g) g.hidden = !g.hidden; return; }
      if ((el = t.closest('[data-cens]')) && !el.classList.contains('open') && !(S.mild && el.closest('[data-ph]'))) {
        if (S.mild) { toast('잔혹 표현이 꺼져 있다'); return; }
        if (!ST.cens.includes(el.dataset.cens)) ST.cens.push(el.dataset.cens);
        save(); $$(`[data-cens="${el.dataset.cens}"]`).forEach(x => x.classList.add('open', 'reveal')); sfx('dread');
        return;
      }
      if ((el = t.closest('[data-ph]'))) return photoClick(el, e);
      if ((el = t.closest('[data-ask]'))) return ask(el.dataset.ask);
      if ((el = t.closest('[data-search]'))) return search(el.dataset.search);
      if ((el = t.closest('[data-chip]'))) return chip(el.dataset.chip);
      if ((el = t.closest('[data-del]'))) return delNote(+el.dataset.del);
      if (t.closest('[data-back]')) { ST.view.open = null; save(); renderRead(); renderList(); return; }
      if ((el = t.closest('[data-reset]'))) return armed(el, '한 번 더 누르면 이 사건 기록이 지워진다', () => { delete S.cases[C.id]; save(); openCase(C.id); toast('처음부터 다시'); });
    });
    document.addEventListener('submit', e => {
      const f = e.target;
      if (!C) return;
      if (f.matches('[data-arch]')) { e.preventDefault(); setQ(f.dataset.arch, f.querySelector('input').value.trim()); const i = $(`#aq-${f.dataset.arch}`); if (i) i.focus(); }
      else if (f.matches('[data-lock]')) { e.preventDefault(); tryLock(f.dataset.lock, f.querySelector('input').value); }
      else if (f.matches('[data-cipher]')) { e.preventDefault(); checkCipher(f.dataset.cipher); }
      else if (f.matches('[data-query]')) { e.preventDefault(); runQuery(f); }
      else if (f.id === 'rep') { e.preventDefault(); submitReport(); }
    });
    document.addEventListener('change', e => {
      const s = e.target.closest('[data-rep]');
      if (!s || !C) return;
      if (s.dataset.rep === 'culprit') ST.report.culprit = s.value; else ST.report.claims[s.dataset.rep] = s.value;
      save();
    });
    document.addEventListener('input', e => {
      const i = e.target.closest('[data-sym]');
      if (!i || !C) return;
      const o = ST.view.open;
      if (!o || o.t !== 'cipher') return;
      (ST.ciph[o.id] ||= {})[i.dataset.sym] = i.value.trim();
      save();
      const g = $('#cGrid');
      if (g) g.innerHTML = cipherGrid(C.sources.find(x => x.id === o.id));
    });
  }

  /* ───────── boot ───────── */
  MG.boot = function (data) {
    if (data && data.S && data.S.cases) S = data.S;
    MG.cases.sort((a, b) => a.no - b.no);
    MG.cases.forEach(prep);
    injectCss();
    // CSS 변수 안의 상대 주소는 css/ 폴더 기준으로 풀리므로, 페이지 기준 절대 주소로 바꿔 넣는다.
    [['desk', '--desk-img'], ['paper', '--paper-img'], ['warn', '--warn-img']].forEach(([k, v]) => { const u = MG.images['_global/' + k]; if (u) { document.documentElement.style.setProperty(v, 'url("' + new URL(u, document.baseURI).href + '")'); document.documentElement.classList.add('has-' + k); } });
    app = document.getElementById('app');
    bind();
    if (S.current && MG.byId[S.current]) openCase(S.current); else cabinet();
  };
  MG.state = () => S;
})();
