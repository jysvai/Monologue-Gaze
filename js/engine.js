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
    // 비산: 한쪽으로 날아가며 작아지는 방울과 꼬리
    e: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 260 120'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.12' numOctaves='2' seed='11'/><feDisplacementMap in='SourceGraphic' scale='4'/></filter></defs><g filter='url(#r)' fill='#5a0e07' stroke='#5a0e07' stroke-linecap='round'><g transform='rotate(-14 130 60)'><ellipse cx='26' cy='62' rx='13' ry='9'/><path d='M36 60 L58 57' stroke-width='3' fill='none'/><circle cx='63' cy='56.5' r='2.4'/><ellipse cx='84' cy='58' rx='8' ry='5.5'/><path d='M91 57 L106 55' stroke-width='2.2' fill='none'/><circle cx='110' cy='54.6' r='1.8'/><ellipse cx='128' cy='56' rx='6' ry='4'/><path d='M133 55.4 L145 54.2' stroke-width='1.6' fill='none'/><ellipse cx='162' cy='54' rx='4.4' ry='3'/><path d='M166 53.6 L175 53' stroke-width='1.2' fill='none'/><ellipse cx='192' cy='52.6' rx='3.2' ry='2.2'/><ellipse cx='216' cy='51.6' rx='2.3' ry='1.6'/><ellipse cx='236' cy='51' rx='1.6' ry='1.1'/><circle cx='70' cy='70' r='2'/><circle cx='118' cy='44' r='1.5'/><circle cx='150' cy='66' r='1.3'/><circle cx='202' cy='60' r='1'/><circle cx='44' cy='44' r='2.2'/></g></g></svg>",
    // 묻어난 자국: 손끝으로 쓸고 지나간 옅은 줄 셋
    f: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 220 150'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.9 .05' numOctaves='2' seed='4' result='n'/><feDisplacementMap in='SourceGraphic' in2='n' scale='7'/></filter></defs><g filter='url(#r)' fill='none' stroke='#662012' stroke-linecap='round'><path d='M20 40 C70 30 120 36 196 30' stroke-width='16' opacity='.5'/><path d='M26 70 C80 62 128 68 188 64' stroke-width='14' opacity='.42'/><path d='M34 98 C84 94 126 98 170 96' stroke-width='12' opacity='.34'/><path d='M20 40 C40 37 52 36 64 36' stroke-width='18' opacity='.35'/></g></svg>",
  };
  // 마른 피는 고르게 칠해지지 않는다: 종이 결을 따라 얼룩덜룩 빠진 자리를 낸다 (a · b · c)
  const MOTTLE = "<feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' seed='9' result='n2'/><feColorMatrix in='n2' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.2 1.42' result='m'/><feComposite in='d' in2='m' operator='in'/>";
  ['a', 'b', 'c'].forEach(k => { STAIN_SVG[k] = STAIN_SVG[k].replace(/<feDisplacementMap in='SourceGraphic' scale='(\d+)'\/>/, `<feDisplacementMap in='SourceGraphic' scale='$1' result='d'/>${MOTTLE}`); });
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
  /* ── 책상에서 오래 굴러다닌 서류의 흔적: 커피잔 자국, (담배를 피우던 시대면) 담뱃불 자국. 몇 장에만, 늘 같은 자리에 */
  const MARK_SVG = {
    ring: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.045' numOctaves='2' seed='6'/><feDisplacementMap in='SourceGraphic' scale='5'/></filter></defs><g filter='url(#r)' fill='none' stroke='#6e4524'><circle cx='60' cy='60' r='45' stroke-width='3.4' opacity='.85'/><circle cx='60' cy='60' r='42.6' stroke-width='1.1' opacity='.45'/><path d='M19 78 A45 45 0 0 1 27 29' stroke-width='6' opacity='.3'/><path d='M96 36 A45 45 0 0 1 100 70' stroke-width='2' opacity='.5'/></g></svg>",
    burn: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'><defs><filter id='r'><feTurbulence type='fractalNoise' baseFrequency='.18' numOctaves='2' seed='2'/><feDisplacementMap in='SourceGraphic' scale='7'/></filter><radialGradient id='g'><stop offset='0' stop-color='#1e1008'/><stop offset='.45' stop-color='#4a2810'/><stop offset='.8' stop-color='#8a5a2c' stop-opacity='.55'/><stop offset='1' stop-color='#a47444' stop-opacity='0'/></radialGradient></defs><ellipse cx='30' cy='31' rx='17' ry='13' fill='url(#g)' filter='url(#r)'/></svg>",
  };
  const PAPER_SKIN = /^(report|ledger|memo|news|lab|transcript|plain)$/; // 증거물인 편지·전보·카드는 깨끗이 둔다
  const SMOKE_ERA = /^c0[4-8]$|^c11$/;
  function docMarks(d, skin) {
    if (!C || C.graphic || d.clean || !PAPER_SKIN.test(skin) || C.frame !== 'papers') return ''; // 화면 속 파일(노트북·모니터)에는 없다
    const h = hash(d.id + '~'), at = (k, x, y) => `<span class="mark mk-${k}" style="--x:${x}%;--y:${y}%;--r:${(h >> 4) % 360}deg" aria-hidden="true"></span>`;
    let out = '';
    if (h % 6 === 1) out += at('ring', (h >> 2) % 2 ? 74 + (h >> 6) % 16 : -10 + (h >> 6) % 12, (h >> 3) % 2 ? -8 + (h >> 8) % 10 : 72 + (h >> 8) % 18);
    if (SMOKE_ERA.test(C.id) && h % 11 === 4) out += at('burn', 6 + (h >> 5) % 84, 8 + (h >> 7) % 80);
    return out;
  }
  function docStains(d) {
    if (!gore() || d.blood === false) return '';
    if (d.blood === 'heavy') return stains(d.id, 4, 'aacbdef', false);
    if (d.blood === true || hash(d.id) % 3 === 0) return stains(d.id, 1 + (hash(d.id) % 2), 'abdef', true);
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
    st.textContent = Object.entries(STAIN_SVG).map(([k, v]) => `.st-${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(v)}")}`)
      .concat(Object.entries(MARK_SVG).map(([k, v]) => `.mk-${k}{background-image:url("data:image/svg+xml,${encodeURIComponent(v)}")}`)).join('\n');
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
    const img = file ? `<img class="${cls || 'art'}" src="${esc(file)}" alt="${esc(alt)}" loading="lazy" decoding="async">` : '';
    // 글자 없는 그림(지도·약도)에는 이름표를 게임이 얹는다: [글자, x%, y%(글자 밑줄), 'l'|'c'|'r']
    const labs = file && a && a.labels ? `<span class="art-labs" aria-hidden="true">${a.labels.map(([t, x, y, al]) => `<span class="art-lab${al === 'c' ? ' c' : al === 'r' ? ' r' : ''}" style="left:${+x}%;top:${+y}%">${esc(t)}</span>`).join('')}</span>` : '';
    const body = file ? (labs ? `<span class="art-wrap">${img}${labs}</span>` : img) : typeof a === 'string' ? a : a.svg || '';
    if (!(a && a.sensitive) || !ST) return body;
    const open = ST.cens.includes(key) && !S.mild;
    return `<span class="cens${open ? ' open' : ''}" data-cens="${esc(key)}">${body}<span class="cens-l"><b>열람 주의</b>${S.mild ? '잔혹 표현을 끈 상태' : '눌러서 보기'}</span></span>`;
  }

  function pinBtn(ref, t, f, src) {
    if (NOPIN) return '';
    PIN[ref] = { t: plain(t).trim(), f: f || null, src };
    const on = ST.notes.some(n => n.ref === ref);
    const lab = on ? '수첩에 적음' : '수첩에 적기';
    return `<button type="button" class="pin${on ? ' on' : ''}" data-pin="${esc(ref)}" aria-label="${lab}" data-tip="${lab}">${on ? '✓' : '✎'}</button>`;
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
      // 감시 카메라·블랙박스 화면: 채널과 날짜·시각을 그림 위에 글자로 얹는다 (그림 안에는 글자를 그리지 않으므로). osd: [채널, 날짜]
      if (Array.isArray(b.osd)) {
        const tm = (String(b.cap || '').slice(0, 24).match(/\d{1,2}:\d{2}:\d{2}/) || [''])[0];
        return `<figure class="b-img has-osd${cls}"><span class="osd-wrap">${art(b.img)}<span class="osd" aria-hidden="true"><span><i></i>REC ${esc(b.osd[0])}</span><span>${esc(b.osd[1])} ${tm}</span></span></span>${cap}</figure>`;
      }
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
    // style: 'phone' 이면 전화 번호판(누르면 칸에 들어가고 # 은 확인, * 은 지우기), 'lcd' 면 워드프로세서 액정
    const pad = lock.style === 'phone' ? `<div class="lock-pad" role="group" aria-label="번호판">${'123456789*0#'.split('').map(k => `<button type="button" data-pad="${k}"${k === '#' ? ' aria-label="확인"' : k === '*' ? ' aria-label="지우기"' : ''}>${k}</button>`).join('')}</div>` : '';
    return `<div class="lock${lock.style ? ' lock-' + esc(lock.style) : ''}"><p class="lock-t">${inline(lock.title || title || '잠겨 있다')}</p>${lock.desc ? `<p class="lock-d">${inline(lock.desc)}</p>` : ''}
      <form class="lock-f" data-lock="${esc(id)}"><label for="lk-${esc(id)}">${esc(lock.label || '비밀번호')}</label><input id="lk-${esc(id)}" autocomplete="off"${lock.password ? ' type="password"' : ''}${lock.style === 'phone' || lock.style === 'lcd' ? ' inputmode="numeric" maxlength="8"' : ''}><button type="submit">${esc(lock.button || '열기')}</button>${pad}</form>
      ${lock.hint ? `<p class="lock-h">${inline(lock.hint)}</p>` : ''}<p class="lock-e" role="status">${fails ? `맞지 않는다. (${fails}회)` : ''}</p>${lock.hint2 && fails >= ({ 3: 2, 4: 3 }[lv()] || Infinity) ? `<p class="lock-h2">${inline(lock.hint2)}</p>` : ''}</div>`;
  }

  function docHtml(d) {
    const s = C.sources.find(x => x.id === d.src) || {};
    if (d.lock && !ST.unl.includes(d.id)) return lockHtml(d.id, d.lock, d.title);
    if (!ST.seen.includes(d.id)) { ST.seen.push(d.id); save(); }
    const skin = d.skin || s.skin || 'plain';
    const paper = d.paper || s.paper;
    const marks = docMarks(d, skin);
    return `<article class="doc skin-${esc(skin)}${d.cls ? ' ' + esc(d.cls) : ''}${marks ? ' marked' : ''}"${d.bar ? ` style="--bar:${esc(d.bar)}"` : ''}>${docStains(d)}${marks}
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
  /* 탐문은 대화처럼: 내가 묻는 말풍선 → 상대가 한 글자씩 답한다. 앞의 (…) 는 몸짓, 「— 」 로 시작하면 내가 끼어든 말 */
  const jong = w => { // 받침이 있나 (조사 고르기)
    const c = String(w).replace(/[^0-9A-Za-z가-힣]+$/, '').slice(-1);
    if (/[가-힣]/.test(c)) return (c.charCodeAt(0) - 0xac00) % 28 !== 0;
    if (/[0-9]/.test(c)) return '013678'.includes(c);
    return /[lmnr]/i.test(c);
  };
  const jo = (w, a, b) => w + (jong(w) ? a : b);
  const QT = {
    person: [L => `${jo(L, '을', '를')} 아십니까?`, L => `${jo(L, '과', '와')}는 어떤 사이였습니까?`, L => `${L}, 어떤 사람입니까?`],
    place: [L => `${L}, 거기에 대해 아시는 대로 말씀해 주시죠.`, L => `${L}에 가 보신 적 있습니까?`],
    time: [L => `${L}, 그때 어디서 뭘 하고 계셨습니까?`, L => `${L}에 무슨 일이 있었습니까?`],
    thing: [L => `${jo(L, '을', '를')} 보신 적 있습니까?`, L => `${L}, 이게 뭔지 아십니까?`],
    word: [L => `${jo(L, '이라는', '라는')} 말, 짚이는 데가 있습니까?`, L => `${L}에 대해 아시는 대로 말씀해 주시죠.`],
  };
  const PRESS = ['press1', 'press2', 'press3', 'press4'];
  const pressKey = (p, k) => PRESS[hash(p.id + k) % PRESS.length];
  function qText(p, e) {
    const k = e.replace(/!$/, ''), kw = C.keywords[k] || {}, L = kw.label || k;
    if (e.endsWith('!')) return (MG.sound && MG.sound.line(pressKey(p, k))) || '이걸 보시죠. 그래도 같은 말씀입니까?';
    if (k === p.key) return '본인 이야기를 좀 듣고 싶습니다.';
    const t = QT[kw.type] || QT.word;
    return t[hash(p.id + k) % t.length](L);
  }
  // 추궁할 때 내미는 증거: 조건(need)에 걸린 수첩 메모
  function evidence(p, k) {
    const a = rawAns(p, k);
    return ((a && a.need) || []).filter(n => n[0] === '!').map(n => ST.notes.find(x => x.f === n.slice(1))).filter(Boolean);
  }
  const DASH = /^\s*—\s*/;
  function chatLines(arr, base, src) {
    if (arr == null) return '';
    if (!Array.isArray(arr)) arr = [arr];
    return arr.map((b, i) => {
      const ref = `${base}#${i}`;
      if (!(typeof b === 'string' || (b && b.p != null && !b.cls && !b.nopin))) return block(b, ref, src);
      const t = typeof b === 'string' ? b : b.p, fid = typeof b === 'string' ? null : b.f;
      const m = t.match(/^\(([^()]*)\)\s*/);
      const rest = m ? t.slice(m[0].length) : t;
      if (!rest.trim()) return m ? `<p class="c-act" data-i="${i}">${inline(m[1])}${fid ? pinBtn(ref, t, fid, src) : ''}</p>` : '';
      const me = DASH.test(rest);
      return `${m ? `<p class="c-act" data-i="${i}">${inline(m[1])}</p>` : ''}<div class="c-bub${me ? ' me' : ''}" data-i="${i}" data-bub="${esc(ref)}"><span class="c-t">${inline(me ? rest.replace(DASH, '') : rest)}</span>${pinBtn(ref, rest, fid, src)}</div>`;
    }).join('');
  }
  function personHtml(p) {
    const asked = ST.asked[p.id] || [];
    const src = `${p.name} 탐문`;
    let tr = `<div class="qa qa-first" data-qa="_">${chatLines(p.intro, `${p.id}@_`, src)}</div>`;
    tr += asked.map(e => {
      const k = e.replace(/!$/, ''), press = e.endsWith('!');
      const ev = press ? evidence(p, k) : [];
      return `<div class="qa${press ? ' press' : ''}" data-qa="${esc(e)}"><div class="c-q"><span class="c-t">${esc(qText(p, e))}</span>${press ? '' : `<small class="c-k">${esc((C.keywords[k] || {}).label || k)}</small>`}</div>
        ${ev.map(n => `<p class="c-ev"><span class="c-ev-k">수첩을 내민다</span>${esc(n.t)}</p>`).join('')}
        <div class="c-ans">${chatLines(ansBlocks(p, e), `${p.id}@${e}`, src)}</div></div>`;
    }).join('');
    return `<article class="person skin-${esc(p.skin || 'talk')}"><header class="per-h">${portrait(p, true)}<div><h3>${esc(p.name)}</h3>${p.role ? `<p>${inline(p.role)}</p>` : ''}${p.where ? `<p class="per-w">${inline(p.where)}</p>` : ''}</div></header>
      <div class="per-tr" data-who="${esc(p.id)}">${tr}</div>
      <div class="per-ask"><p class="per-ask-t">무엇을 물어볼까? <small>수첩의 단어 · 붉은 테: 메모를 들이밀어 다시 물을 수 있다</small></p><div class="chips" id="askChips">${askChips(p)}</div></div></article>`;
  }

  /* 대화 재생: 몸짓은 스르르, 말은 한 글자씩(사람마다 다른 말소리). 목소리가 있는 말풍선은 재생 시각에 맞춰 찍는다. 누르면 건너뛴다 */
  let TALK = null;
  const MET = new Set(); // 이번에 처음 만난 사람 (첫 인사를 재생)
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function stopTalk() { if (TALK) TALK.finish(); }
  function playTalk(qa, opt) {
    stopTalk();
    const box = qa && (qa.querySelector('.c-ans') || qa);
    const items = box ? [...box.children] : [];
    if (!items.length) return;
    const p = opt.p, snd = MG.sound;
    const tone = snd ? snd.tone(`${C.id}/${p.id}`) : 130, htone = snd ? snd.tone('hero') : 150;
    const fast = reduced();
    const pr = $('#paneRead');
    const keep = el => { if (!pr || !el.isConnected) return; const r = el.getBoundingClientRect(), b = pr.getBoundingClientRect(); if (r.bottom > b.bottom - 36) pr.scrollTop += r.bottom - b.bottom + 36; };
    const dots = document.createElement('p'); dots.className = 'c-dots'; dots.setAttribute('aria-hidden', 'true'); dots.innerHTML = '<i></i><i></i><i></i>';
    const me = { timer: 0, saved: new Map() };
    me.finish = () => {
      if (TALK === me) TALK = null;
      clearTimeout(me.timer);
      dots.remove();
      items.forEach(el => { el.classList.remove('wait', 'typing'); const h = me.saved.get(el); if (h != null) el.querySelector('.c-t').innerHTML = h; });
      me.saved.clear();
      qa.classList.remove('live');
    };
    TALK = me;
    const alive = () => TALK === me && qa.isConnected;
    const later = (ms, fn) => { me.timer = setTimeout(() => { if (alive()) fn(); else if (TALK === me) TALK = null; }, fast ? Math.min(ms, 40) : ms); };
    items.forEach(el => el.classList.add('wait'));
    qa.classList.add('live');
    // 목소리 구간: 첫 구간(키 그대로, span 줄) + 줄마다 따로 붙은 것(키.번호)
    const base = opt.voice, A = MG.audio || { files: {}, span: {} };
    const seg = i => {
      if (!base || !snd) return null;
      const span = A.span[base] || 1;
      if (i < span && snd.hasVoice(base)) return { key: base, from: 0, to: span - 1 };
      if (snd.hasVoice(`${base}.${i}`)) return { key: `${base}.${i}`, from: i, to: i };
      return null;
    };
    let cur = null; // { key, v, chars, done }
    let n = 0;
    const next = () => {
      if (n >= items.length) return me.finish();
      const el = items[n++];
      dots.remove();
      el.classList.remove('wait');
      keep(el);
      const tt = el.classList.contains('c-bub') && el.querySelector('.c-t');
      if (!tt || fast) return later(el.classList.contains('c-act') ? 520 : 200, next);
      const i = +el.dataset.i, isMe = el.classList.contains('me');
      const sg = seg(i);
      if (sg && (!cur || cur.key !== sg.key)) {
        const bubs = items.filter(x => x.classList.contains('c-bub') && +x.dataset.i >= sg.from && +x.dataset.i <= sg.to);
        const c = cur = { key: sg.key, v: snd.voice(sg.key), chars: bubs.reduce((s, x) => s + x.querySelector('.c-t').textContent.length, 0), done: 0, last: bubs[bubs.length - 1], over: false };
        if (c.v) c.v.done.then(() => { c.over = true; }); // 재생이 막히거나 끊겨도 글자는 끝까지
      } else if (!sg) cur = null;
      const v = cur && cur.v;
      me.saved.set(el, tt.innerHTML);
      // 글자마다 감싸 두고 하나씩 보이게 (자리는 미리 잡혀 있어 줄이 흔들리지 않는다)
      const chars = [];
      const walk = node => [...node.childNodes].forEach(c => {
        if (c.nodeType !== 3) return walk(c);
        const frag = document.createDocumentFragment();
        [...c.data].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; frag.appendChild(s); chars.push(s); });
        c.replaceWith(frag);
      });
      walk(tt);
      el.classList.add('typing');
      let k = 0;
      const end = () => {
        el.classList.remove('typing'); tt.innerHTML = me.saved.get(el); me.saved.delete(el);
        if (cur && v) cur.done += chars.length;
        const wait = v && cur.last === el ? v.done : Promise.resolve();
        wait.then(() => { if (!alive()) return; if (n < items.length) el.after(dots); later(isMe ? 320 : 480, next); });
      };
      const step = () => {
        if (!alive()) return;
        const d = v && v.audio.duration;
        if (v && cur.over) while (k < chars.length) chars[k++].classList.add('on');
        else if (d && isFinite(d)) { // 목소리 진행만큼 찍는다
          const want = Math.ceil(v.audio.currentTime / d * cur.chars) - cur.done;
          while (k < chars.length && k < want) chars[k++].classList.add('on');
        } else {
          chars[k++].classList.add('on');
          if (!v && /\S/.test(chars[k - 1].textContent) && k % 2 && snd) snd.blip(isMe ? htone : tone);
        }
        if (k % 10 === 1) keep(el);
        if (k >= chars.length) return end();
        const ch = chars[k - 1] ? chars[k - 1].textContent : '';
        me.timer = setTimeout(step, v ? 30 : /[.?!…]/.test(ch) ? 230 : /[,、]/.test(ch) ? 120 : 34);
      };
      step();
    };
    items[0].before(dots);
    later(opt.lead == null ? 450 : opt.lead, next);
    return me;
  }
  // 새로 물은 것 재생. 추궁이면: 북소리·「추궁」 → 내 한마디(목소리) → 침묵 → 대답
  function playAsk(p, e) {
    const qa = $$('.per-tr .qa').find(x => x.dataset.qa === e);
    if (!qa) return;
    const k = e.replace(/!$/, '');
    if (!e.endsWith('!')) return playTalk(qa, { p });
    qa.classList.add('pressing');
    cue('confess');
    const st = document.createElement('div'); st.className = 'cue-stamp press'; st.setAttribute('aria-hidden', 'true'); st.innerHTML = '<span>추궁</span>';
    document.body.appendChild(st); setTimeout(() => st.remove(), 1900);
    const t = playTalk(qa, { p, lead: 600000 }); // 대답은 내 말이 끝난 뒤
    const hv = MG.sound ? MG.sound.voice('hero/' + pressKey(p, k)) : null;
    const go = () => { if (t && TALK === t && qa.isConnected) { t.finish(); playTalk(qa, { p, voice: `v/${C.id}/${p.id}/${k}`, lead: 1000 }); } };
    if (hv) hv.done.then(go); else setTimeout(go, 1500);
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
    return `<form class="q-f" data-query="${esc(s.id)}" data-slip="${esc(s.slip || s.name || '')}">${fields}<button type="submit">${esc(s.button || '조회')}</button></form>
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
  // 지도: 목록 칸에는 작은 지도(점만), 아무것도 펼치지 않았을 때는 읽기 칸에 크게(이름까지)
  function mapHtml(s, big) {
    const spots = (s.spots || []).filter(sp => ok(sp.need));
    return `<div class="map${big ? ' big' : ''}">${art(s.art)}${spots.map(sp => `<button type="button" class="spot" style="left:${+sp.x}%;top:${+sp.y}%" data-spot="${esc(sp.id)}" aria-label="${esc(sp.label)}" data-tip="${esc(sp.label)}"><span>${esc(sp.label)}</span></button>`).join('')}</div>`;
  }
  function mapList(s) {
    const spots = (s.spots || []).filter(sp => ok(sp.need));
    return `${mapHtml(s)}
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
    else if (o && o.t === 'report') h = reportHtml();
    else if (curSrc() && curSrc().type === 'map' && srcOpen(curSrc()) && !narrow()) { const s = curSrc(); h = `<div class="map-read">${s.desc ? `<p class="map-desc">${inline(s.desc)}</p>` : ''}${mapHtml(s, true)}</div>`; }
    else h = `<div class="read-empty"><p>${inline(C.emptyRead || '왼쪽에서 자료를 고르면 여기에 펼쳐진다.')}</p></div>`;
    el.innerHTML = `<button type="button" class="back-list" data-back>← 목록으로</button>${h}`;
    $('#stageBody').classList.toggle('reading', !!(o && h));
  }

  /* ───────── 수사 보고서 (읽기 칸에 넓게) ───────── */
  let REPOPEN = null; // 메모 고르기가 펼쳐진 주장
  function reportHtml() {
    const sol = C.solution, notes = ST.notes;
    const persons = ST.keys.filter(k => C.keywords[k] && C.keywords[k].type === 'person');
    const roleOf = k => { const p = Object.values(C.people || {}).find(x => x.key === k); return p && p.role ? plain(p.role) : ''; };
    const groups = noteGroups(notes);
    const claim = (cl, i) => {
      const cur = notes.find(n => String(n.id) === String(ST.report.claims[cl.id]));
      const open = REPOPEN === cl.id;
      const list = groups.map(g => `<details class="rep-grp" open><summary>${esc(g.src)} <small>${g.items.length}</small></summary>${g.items.map(([n, j]) => `<label class="rep-opt${cur && cur.id === n.id ? ' on' : ''}"><input type="radio" name="rep-${esc(cl.id)}" value="${n.id}" data-rep="${esc(cl.id)}"${cur && cur.id === n.id ? ' checked' : ''}><span class="n">${j + 1}.</span> <span class="t">${esc(n.t)}</span></label>`).join('')}</details>`).join('');
      return `<section class="rep-claim${cur ? ' filled' : ''}${open ? ' open' : ''}">
        <h4><span class="no">${i + 1}</span> ${inline(cl.q)}</h4>
        <div class="rep-pick">${cur ? `<p class="rep-memo"><span class="n">${notes.indexOf(cur) + 1}.</span> ${esc(cur.t)} <span class="src">— ${esc(cur.src || '')}</span></p>` : '<p class="rep-empty">아직 붙인 메모가 없다.</p>'}
          <button type="button" class="rep-tog" data-rep-open="${esc(cl.id)}" aria-expanded="${open}">${open ? '접기' : cur ? '다른 메모로 바꾸기' : '메모에서 고르기'} <small>${notes.length}</small></button></div>
        ${open ? `<div class="rep-acc">${notes.length ? `<input type="search" class="rep-filter" placeholder="메모에서 낱말 찾기" data-rep-filter aria-label="메모 찾기">${list}` : '<p class="rep-empty">수첩에 메모가 없다. 문서와 탐문에서 문장을 눌러 적어 둔다.</p>'}</div>` : ''}
      </section>`;
    };
    return `<article class="doc skin-report rep-view"><header class="doc-h"><p class="doc-k">수사 보고서</p><h3 class="doc-t">${esc(C.title)}</h3><p class="doc-m">범인을 고르고, 주장마다 증거가 될 메모를 하나씩 붙인다.</p></header>
      <div class="doc-b"><form id="rep" autocomplete="off">
        <section class="rep-sec"><h4>범인은</h4><div class="rep-people">${persons.map(k => `<label class="rep-per${ST.report.culprit === k ? ' on' : ''}"><input type="radio" name="rep-culprit" value="${k}" data-rep="culprit"${ST.report.culprit === k ? ' checked' : ''}><b>${esc(C.keywords[k].label)}</b>${roleOf(k) ? `<small>${esc(roleOf(k))}</small>` : ''}</label>`).join('') || '<p class="rep-empty">수첩에 적힌 인물이 없다.</p>'}</div></section>
        ${sol.claims.map(claim).join('')}
        <p class="submit-row"><button type="submit" class="btn-hand">보고서 올리기</button><span class="tries">${ST.tries ? `제출 ${ST.tries}회` : ''}</span></p>
      </form><p class="verdict" role="status">${esc(VERDICT)}</p>${ST.solved ? `<div class="rep-solved">${solvedHtml(false)}</div>` : ''}</div></article>`;
  }
  function renderRep() {
    renderNotebook();
    const o = ST.view.open;
    if (!o || o.t !== 'report') return;
    const pr = $('#paneRead'), top = pr.scrollTop;
    renderRead(); pr.scrollTop = top;
  }

  /* ───────── notebook ───────── */
  function solvedHtml(fresh) {
    const sol = C.solution;
    NOPIN = true;
    const epi = blocks(sol.epilogue, 'epi', '결말');
    NOPIN = false;
    return `<div class="stamp${fresh ? ' fresh' : ''}"><div>사건<br>종결<small>${esc(sol.stamp || '')}</small></div></div><div class="epi">${epi}</div>${sol.next ? `<p class="epi-next">${inline(sol.next)}</p>` : ''}`;
  }
  // 메모는 어디서 적었는지(문서·사람)끼리 묶는다. 접어 둔 묶음은 기억한다
  const NGSHUT = new Set();
  function noteGroups(notes) {
    const groups = [];
    notes.forEach((n, i) => { const src = n.src || '기타'; let g = groups.find(x => x.src === src); if (!g) groups.push(g = { src, items: [] }); g.items.push([n, i]); });
    return groups;
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
    const top = nb.firstChild ? nb.scrollTop : 0;
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
        ${(C.tips || []).length ? `<ol class="notes">${C.tips.map(t => `<li class="tip">※ ${inline(t)}</li>`).join('')}</ol>` : ''}
        ${noteGroups(notes).map(g => `<details class="ng" data-ng="${esc(g.src)}"${NGSHUT.has(C.id + '|' + g.src) ? '' : ' open'}><summary>${esc(g.src)} <small>${g.items.length}</small></summary><ol class="notes">${g.items.map(([n, i]) => `<li data-nid="${n.id}" style="--r:${(hash(n.ref) % 5 - 2) * 0.25}deg"><span class="n">${i + 1}.</span> ${esc(n.t)}<button type="button" class="del" data-del="${n.id}" aria-label="메모 ${i + 1} 지우기">×</button></li>`).join('')}</ol></details>`).join('')}
      </section>
      <section class="ruled nb-sec nb-rep"><h3 class="hh">수사 보고서</h3>
        <p class="rep-sum">범인 <b>${ST.report.culprit && C.keywords[ST.report.culprit] ? esc(C.keywords[ST.report.culprit].label) : '—'}</b> · 증거 <b>${sol.claims.filter(cl => ST.report.claims[cl.id] && ST.notes.some(n => String(n.id) === String(ST.report.claims[cl.id]))).length}</b> / ${sol.claims.length}</p>
        <p class="submit-row"><button type="button" class="btn-hand" data-open-rep>보고서 펼쳐 쓰기</button><span class="tries">${ST.tries ? `제출 ${ST.tries}회` : ''}</span></p>
        <p class="verdict" role="status">${esc(VERDICT)}</p>
        <div id="solvedBox">${ST.solved ? solvedHtml(false) : ''}</div>
      </section>
      <footer class="nb-foot"><button type="button" class="reset" data-reset>이 사건 처음부터</button><p>${esc(C.disclaimer || '실제 미제 사건의 모티프만 빌린 창작입니다. 인물·장소·기관은 모두 지어낸 것입니다.')}</p></footer>`;
    if (top) nb.scrollTop = top;
  }

  /* ───────── screens ───────── */
  // 책상 위 소품: 그 시대 책상에 있을 법한 물건을 종이 밑에 깔린 듯 가장자리에 둔다 (책상이 드러나는 넓은 화면에서만).
  // 자리: 왼쪽 위 · 왼쪽 아래 · 오른쪽 위 · 오른쪽 아래. 사건 파일의 desk: [...] 가 있으면 그것을 쓴다.
  const DESK = {
    c00: ['takeaway', 'pencil', 'smartphone', 'clips'], c01: ['teacup', 'magnifier', 'pocketwatch', 'clips'],
    c02: ['teacup', 'pencil', 'pocketwatch', 'matchbox'], c03: ['inkpen', 'magnifier', 'pocketwatch', 'clips'],
    c04: ['ashtray', 'pencil', 'matchbox', 'clips'], c05: ['mug', 'pencil', 'ashtray', 'glasses'],
    c06: ['mug', 'inkpen', 'magnifier', 'glasses'], c07: ['ashtray', 'pencil', 'stamp', 'matchbox'],
    c08: ['mug', 'cassette', 'ashtray', 'clips'], c09: ['mug', 'pencil', 'flipphone', 'clips'],
    c10: ['takeaway', 'pencil', 'glasses', 'clips'], c11: ['mug', 'pencil', 'ashtray', 'stamp'],
    c12: ['mug', 'glasses', 'pager', 'clips'],
  };
  const PROPW = { mug: 210, teacup: 230, takeaway: 170, pocketwatch: 170, magnifier: 240, inkpen: 230, ashtray: 200, matchbox: 120, cassette: 200, pager: 130, flipphone: 120, smartphone: 150, pencil: 300, clips: 120, stamp: 190, glasses: 210 };
  function deskProps() {
    const list = (C.desk || DESK[C.id] || []).filter(k => MG.images['_desk/' + k]);
    if (!list.length) return '';
    return `<div class="desk-props" aria-hidden="true">${list.slice(0, 4).map((k, i) => {
      const h = hash(C.id + k), r = k === 'pencil' ? 58 + h % 30 : (h % 50) - 25;
      return `<img class="prop p${i} k-${k}" src="${esc(MG.images['_desk/' + k])}" alt="" loading="lazy" decoding="async" style="--w:${PROPW[k] || 180}px;--r:${r}deg">`;
    }).join('')}</div>`;
  }
  // 노트북·모니터 화면 아래 시계: 그 사건을 들여다보는 날의 오후에서 시작해, 실제로 흐른 시간만큼 간다
  const CLOCK = { c00: [2025, 10, 16, 14, 20], c09: [2006, 10, 27, 16, 5], c10: [2014, 12, 4, 15, 40] };
  let clockT = null;
  function clockBar() {
    const c = C.clock || CLOCK[C.id];
    if (!c || C.frame === 'papers') return '';
    const ico = C.frame === 'laptop' ? '<svg viewBox="0 0 34 12" aria-hidden="true"><path d="M2 5.5a7 7 0 0 1 10 0M4 7.5a4.2 4.2 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9.6" r="1.1" fill="currentColor"/><rect x="17" y="3" width="13" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.1"/><rect x="18.6" y="4.6" width="7" height="3.8" fill="currentColor"/><rect x="30.4" y="5" width="1.6" height="3" fill="currentColor"/></svg>' : '';
    return `<div class="scr-bar" aria-hidden="true">${ico}<time class="scr-clock" data-t0="${new Date(c[0], c[1] - 1, c[2], c[3], c[4]).getTime()}" data-at="${Date.now()}"></time></div>`;
  }
  function tickClock() {
    const el = $('.scr-clock');
    if (!el) { clearInterval(clockT); clockT = null; return; }
    const d = new Date(+el.dataset.t0 + (Date.now() - +el.dataset.at)), h = d.getHours();
    el.textContent = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${'일월화수목금토'[d.getDay()]})  ${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad(d.getMinutes())}`;
  }
  function renderCase() {
    document.body.dataset.screen = 'case';
    app.innerHTML = `${deskProps()}${gore() ?`<div class="gore-bg" aria-hidden="true">${stains(C.id + 'bg', 5, 'aacb', true)}</div>` : ''}<div class="case-view" data-case="${esc(C.id)}" data-frame="${esc(C.frame || 'papers')}" data-era="${(y => y < 1945 ? 'old' : y < 1980 ? 'mid' : '')(parseInt(C.year, 10) || 2000)}"${gore() ? ' data-graphic' : ''}>
      <main class="stage" aria-label="조사 자료">
        <div class="stage-frame"><span class="cam" aria-hidden="true"></span>
          <div class="screen">
            <nav class="src-tabs" role="tablist" id="srcTabs" aria-label="조사 도구"></nav>
            <div class="stage-body" id="stageBody"><section class="pane-list" id="paneList" aria-label="목록"></section><section class="pane-read" id="paneRead" aria-label="읽기"></section></div>${clockBar()}
          </div>
        </div>
        <div class="frame-foot" aria-hidden="true"></div>
        ${C.tag ? `<div class="evtag">${inline(C.tag)}</div>` : ''}
      </main>
      <aside class="nb" id="nb" aria-label="형사 수첩"></aside>
    </div>`;
    PIN = {};
    renderTabs(); renderList(); renderRead(); renderNotebook();
    if ($('.scr-clock')) { tickClock(); clockT ||= setInterval(tickClock, 15000); }
  }
  // 사건마다 쓰는 특수 글꼴은 그 사건을 열 때만 부른다 (공통 글꼴은 index.html). 신문 양식은 송명·옛 로마자를 쓴다.
  // 손글씨 편지는 쓴 사람마다 필체가 다르다 (문서 cls 의 f-yeon · f-dokdo …)
  const FONTS = { old: 'Song+Myung', latin: 'Old+Standard+TT:wght@400;700', frak: 'UnifrakturMaguntia', jp: 'Noto+Serif+JP:wght@700;900',
    yeon: 'Yeon+Sung', dokdo: 'Dokdo', gaegu: 'Gaegu:wght@400;700', dohyeon: 'Do+Hyeon', melody: 'Hi+Melody', bhs: 'Black+Han+Sans' };
  const fontOn = {};
  function caseFonts(c) {
    if (!c._fonts) {
      const j = JSON.stringify(c), news = j.includes('"skin":"news"');
      c._fonts = Object.keys(FONTS).filter(k => j.includes('f-' + k) || news && (k === 'old' || k === 'latin') || k === 'latin' && j.includes('f-frak'));
    }
    const need = c._fonts.filter(k => !fontOn[k]);
    if (!need.length) return;
    need.forEach(k => { fontOn[k] = 1; });
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?' + need.map(k => 'family=' + FONTS[k]).join('&') + '&display=swap';
    document.head.appendChild(l);
  }

  // intro: 기록실에서 폴더를 눌러 열 때만 여는 장면을 보여 준다 (새로 고침·처음부터 다시는 바로)
  function openCase(id, intro) {
    const c = MG.byId[id];
    if (!c) return cabinet();
    caseFonts(c);
    if (c.graphic && !cs(c).cw) return warnScreen(c);
    C = c; ST = cs(c); VERDICT = '';
    S.current = id; save();
    document.title = `CASE ${pad(c.no)} 「${c.title}」 — Monologue Gaze`;
    renderCase();
    if (MG.mood) MG.mood.enter(C, intro);
    window.scrollTo(0, 0);
  }

  function warnScreen(c) {
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    document.title = 'Monologue Gaze';
    app.innerHTML = `<div class="cw"><div class="cw-card">${S.mild ? '' : stains(c.id + 'cw', 2, 'acd', true)}<p class="cw-t">혐오감 주의</p><h2>CASE ${pad(c.no)} 「${esc(c.title)}」 ${starsHtml(c)}</h2>
      <p>${esc(c.warn || '이 사건 기록에는 시신 훼손 같은 잔혹한 내용과 강한 묘사가 들어 있습니다.')}</p><p class="cw-s">모든 인물과 사건은 지어낸 것입니다. 불편하면 언제든 기록실로 돌아가도 됩니다. 핏자국 같은 화면 연출과 사진은 「잔혹 표현」 단추로 끌 수 있습니다.</p><p>${mildBtn()}</p>
      <p class="cw-b"><button type="button" class="btn-hand" data-cw-ok="${esc(c.id)}">기록을 연다</button> <button type="button" class="reset" data-cabinet>돌아간다</button></p></div></div>`;
    window.scrollTo(0, 0);
  }

  function cabinet() {
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    document.title = 'Monologue Gaze';
    const main = MG.cases.filter(c => c.kind !== 'tutorial');
    const solvedMain = main.filter(c => S.cases[c.id] && S.cases[c.id].solved).length;
    const mList = MG.cases.filter(c => c._m && S.cases[c.id] && S.cases[c.id].m);
    const folder = c => {
      const st = S.cases[c.id];
      const status = st && st.solved ? 'done' : st && (st.notes.length || st.seen.length) ? 'going' : 'new';
      const kind = c.kind === 'tutorial' ? '튜토리얼' : c.region === 'overseas' ? '해외' : '국내';
      const coverFile = MG.images[`${c.id}/cover_s`] || MG.images[`${c.id}/cover`]; // 폴더 표지는 작게 (cover_s)
      const cover = coverFile ? `<img src="${esc(coverFile)}" alt="" loading="lazy" decoding="async">` : c.art && c.art.cover ? (typeof c.art.cover === 'string' ? c.art.cover : c.art.cover.svg || '') : '';
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
      ${hero ? `<div class="cab-hero" aria-hidden="true"><img src="${esc(hero)}" alt="" decoding="async" fetchpriority="high"></div>` : ''}
      <header class="cab-top"><p class="cab-kicker">서울서부경찰서 강력2팀 · 미제사건 기록실</p><h1 class="cab-title">Monologue Gaze</h1><p class="cab-sub">기록은 혼잣말을 한다. 들어주는 건 당신이다.</p>
        ${soundBtn()}${MG.cases.some(c => c.graphic) ? mildBtn() : ''}<p class="cab-stat">종결 <b>${solvedMain}</b> / ${main.length} · M의 메모 <b>${mList.length}</b> / ${MG.cases.filter(c => c._m).length}</p></header>
      ${intro}
      <section class="drawer" aria-label="사건 파일">${MG.cases.map(folder).join('')}</section>
      ${mList.length ? `<section class="mbox"><h2>M의 메모</h2><p class="mbox-sub">기록 여백에 남아 있던, 선배의 글씨.</p><ul>${mList.map(c => `<li><span class="mbox-case">CASE ${pad(c.no)}</span> ${esc(plain(c._m))}</li>`).join('')}</ul></section>` : ''}
      ${letter}
      <footer class="cab-foot"><p>모든 사건은 실제 미제 사건의 모티프만 빌려 새로 지은 이야기입니다. 등장하는 인물·장소·기관·사이트는 모두 허구이며, 실제 인물이나 피해자와 관계가 없습니다.</p><p class="credit">목소리·효과음 <a href="https://elevenlabs.io" target="_blank" rel="noopener">ElevenLabs</a></p><button type="button" class="reset" data-wipe>모든 기록 지우기</button></footer>
    </div>`;
  }

  /* ───────── sound (기본 꺼짐) — audio/ 의 효과음 파일이 있으면 그것을, 없으면 합성음 ───────── */
  let actx = null;
  const SFXFILE = { stamp: 'solved', lock: 'unlock' };
  function sfx(kind) {
    if (!S.sound) return;
    if (kind === 'page' && C) kind = C.frame === 'laptop' ? 'click' : C.frame === 'crt' ? 'key' : 'page'; // 화면 속 문서는 종이 넘기는 소리 대신 딸깍
    if (MG.sound && MG.sound.play('sfx/' + (SFXFILE[kind] || kind), kind === 'pen' || kind === 'page' || kind === 'click' || kind === 'key' ? 0.5 : 0.9)) return;
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
      else if (kind === 'click' || kind === 'key') noise(kind === 'key' ? 0.06 : 0.03, 'highpass', kind === 'key' ? 1800 : 3500, 0.8, 0.2);
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
      } else { // 북소리: 음높이가 뚝 떨어지는 낮은 사인파 + 가죽 치는 잡음. clue 한 번, match·confess 두 번, miss 짧고 둔하게
        const drum = (at, f0, v, len) => {
          const o = actx.createOscillator(); const g = actx.createGain();
          o.frequency.setValueAtTime(f0, t + at); o.frequency.exponentialRampToValueAtTime(f0 * 0.42, t + at + len);
          g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(v, t + at + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
          o.connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + len + 0.05);
        };
        if (kind === 'clue' || kind === 'find') { drum(0, 110, 0.45, 0.5); noise(0.08, 'bandpass', 900, 1, 0.12); }
        else if (kind === 'match' || kind === 'solved') { drum(0, 95, 0.6, 0.7); drum(0.42, 80, 0.7, 1.1); noise(1.2, 'lowpass', 180, 0.7, 0.2); }
        else if (kind === 'confess') { drum(0, 70, 0.4, 0.25); drum(0.22, 70, 0.3, 0.25); drum(0.8, 70, 0.45, 0.25); drum(1.0, 70, 0.35, 0.25); drum(1.5, 120, 0.7, 1.2); noise(1.4, 'lowpass', 300, 0.8, 0.25); }
        else if (kind === 'miss') { drum(0, 140, 0.35, 0.18); noise(0.12, 'lowpass', 400, 0.8, 0.2); }
        else if (kind === 'unlock') { noise(0.05, 'highpass', 4000, 0.8, 0.15); drum(0.12, 100, 0.4, 0.5); }
      }
    } catch (e) { /* audio unavailable */ }
  }
  // 전화 번호판: 누른 단추의 진짜 신호음(DTMF — 가로줄 낮은 음 + 세로줄 높은 음)
  function dtmf(k) {
    if (!S.sound) return;
    const i = '123456789*0#'.indexOf(k);
    if (i < 0) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime, g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01); g.gain.setValueAtTime(0.07, t + 0.12); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      g.connect(actx.destination);
      [[697, 770, 852, 941][i / 3 | 0], [1209, 1336, 1477][i % 3]].forEach(f => { const o = actx.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + 0.17); });
    } catch (e) { /* audio unavailable */ }
  }
  // 단서가 맞아떨어지는 순간: 소리 + 화면 연출 (+ 주인공 한마디). kind: clue · match · confess · miss · solved · unlock
  const HEROSAY = { match: ['match1', 'match2', 'match3'] };
  let HEROI = 0;
  const BUZZ = { confess: [60, 80, 60, 80, 220], solved: [120, 60, 260], miss: [40], match: [70, 50, 110] };
  function cue(kind, label) {
    sfx(kind);
    if (S.sound && BUZZ[kind] && navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) try { navigator.vibrate(BUZZ[kind]); } catch (e) { /* not allowed */ }
    const app = $('#app');
    if (app) { app.classList.remove('cue-' + kind); void app.offsetWidth; app.classList.add('cue-' + kind); setTimeout(() => app.classList.remove('cue-' + kind), 1600); }
    if (label && (kind === 'match' || kind === 'solved' || kind === 'unlock')) {
      const s = document.createElement('div');
      s.className = 'cue-stamp' + (kind === 'solved' ? ' big' : '');
      s.setAttribute('aria-hidden', 'true');
      s.innerHTML = `<span>${esc(label)}</span>`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1900);
    }
    const lines = HEROSAY[kind];
    if (lines && MG.sound) { HEROI = (HEROI + 1 + (Date.now() & 1)) % lines.length; const k = lines[HEROI]; setTimeout(() => MG.sound.hero(k), 900); }
  }
  const mildBtn = () => `<button type="button" class="snd mild" data-mild aria-pressed="${!S.mild}">${S.mild ? '잔혹 표현 꺼짐' : '잔혹 표현 켜짐'}</button>`;
  const soundBtn = () => `<button type="button" class="snd" data-sound aria-pressed="${!!S.sound}">${S.sound ? '소리 켜짐' : '소리 꺼짐'}</button>${S.sound ? voiceBtn() : ''}`;
  const voiceBtn = () => `<button type="button" class="snd voice" data-voice aria-pressed="${S.voice !== false}">${S.voice !== false ? '목소리 켜짐' : '목소리 꺼짐'}</button>`;

  // 그림 크게 보기: 누르면 화면 가득, 다시 누르거나 Esc 로 닫는다
  function zoom(img) {
    const z = document.createElement('div');
    z.className = 'zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', '그림 크게 보기'); z.tabIndex = -1;
    const w = img.closest('.art-wrap');
    const fc = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    const cap = fc ? [...fc.childNodes].filter(n => !(n.classList && n.classList.contains('pin'))).map(n => n.textContent).join('').trim() : '';
    if (C) z.dataset.frame = C.frame;
    z.innerHTML = `<figure>${w ? w.outerHTML : `<img src="${esc(img.getAttribute('src'))}" alt="${esc(img.alt || '')}">`}</figure>${cap ? `<p class="z-cap">${esc(cap)}</p>` : ''}<p>누르면 닫힌다</p>`;
    const close = () => { z.remove(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); };
    z.addEventListener('click', close);
    document.addEventListener('keydown', key);
    document.body.appendChild(z); z.focus();
    sfx('page');
  }

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
    ST.keys.push(id); save();
    const gained = census() - before;
    if (gained > 0) cue('clue'); else sfx('pen');
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
    save();
    if (census() > before) cue('clue'); else sfx('pen');
    $$('.pin').forEach(b => { if (b.dataset.pin === ref) { b.classList.add('on'); b.textContent = '✓'; b.setAttribute('aria-label', '수첩에 적음'); b.dataset.tip = '수첩에 적음'; } });
    renderNotebook();
    const li = $(`.notes li[data-nid="${ST.nid}"]`);
    if (li) { const d = li.closest('details'); if (d && !d.open) { NGSHUT.delete(C.id + '|' + d.dataset.ng); d.open = true; } li.classList.add('fresh'); if (!narrow()) li.scrollIntoView({ block: 'nearest' }); }
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
    if (n) $$('.pin').forEach(b => { if (b.dataset.pin === n.ref) { b.classList.remove('on'); b.textContent = '✎'; b.setAttribute('aria-label', '수첩에 적기'); b.dataset.tip = '수첩에 적기'; } });
    renderRep();
  }
  function openItem(o) {
    ST.view.open = o; save(); sfx('page');
    renderRead(); renderList();
    $('#paneRead').scrollTop = 0;
    const doc = $('#paneRead > :not(.back-list)'); if (doc) doc.classList.add('enter');
    if (narrow()) $('.stage').scrollIntoView({ block: 'start' });
    // 처음 만나는 사람은 첫마디를 재생한다
    const p = o.t === 'person' && C.people[o.id];
    if (p && !MET.has(p.id)) { MET.add(p.id); if (!(ST.asked[p.id] || []).length) playTalk($('.per-tr .qa-first'), { p, lead: 650 }); }
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
    const fresh = !a.includes(e);
    if (fresh) a.push(e);
    save();
    const before = census();
    MET.add(p.id);
    renderRead(); renderList();
    const qa = $$('.per-tr .qa').find(x => x.dataset.qa === e);
    if (qa) $('#paneRead').scrollTop = qa.offsetTop - 12;
    if (census() > before) renderTabs();
    if (fresh) playAsk(p, e);
    else if (qa) { qa.classList.remove('flash'); void qa.offsetWidth; qa.classList.add('flash'); }
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
      save(); refreshAll(); cue('unlock', '열림');
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
      save(); refreshAll(); cue('match', '해독');
      const gained = census() - before;
      toast(`해독했다${gained > 0 ? ` · 새로 열린 것 ${gained}` : ''}`);
    } else {
      const m = $('.c-msg');
      if (m) m.textContent = (s.feedback || (lv() >= 5 ? 'none' : 'count')) === 'none' ? '아직 문장이 되지 않는다.' : `기호 ${syms.length}개 중 ${right}개가 맞는 것 같다.`;
    }
  }
  function solveThing(id, reward, msg, stamp) {
    const before = census();
    if (!ST.unl.includes(id)) ST.unl.push(id);
    ((reward && reward.keys) || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); refreshAll(); cue('match', stamp || '일치');
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
    if (hit.length === o.length) return solveThing(sid, s.reward, s.ok || '앞뒤가 맞아떨어졌다', '재구성');
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
    if (oid === x.answer) return solveThing(xid, x.reward, x.ok || '감정 결과 일치', '일치');
    if (!st.x.includes(oid)) st.x.push(oid);
    st.at = progress();
    save(); cue('miss'); renderRead();
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
    if (census() > before) { cue('clue'); toast(`새로 열린 것 ${census() - before}`); }
  }
  function photoFind(xid, test) {
    const x = C._scenes[xid];
    if (!x) return false;
    const sp = sceneSpots(x).find(p => !ST.unl.includes(p.id) && test(p));
    if (!sp) return false;
    const before = census();
    ST.unl.push(sp.id);
    (sp.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); refreshAll();
    const gained = census() - before;
    const all = sceneSpots(x).every(p => ST.unl.includes(p.id));
    if (all) cue('match', '관찰 끝'); else if (gained > 0) cue('clue'); else sfx('find');
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
  // 보고서 올리기: 주인공이 범인을 지목하고(목소리), 한 박자 쉰 뒤 판정
  let JUDGING = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function submitReport() {
    if (JUDGING) return;
    const sol = C.solution, c0 = C;
    const has = id => ST.notes.some(n => String(n.id) === String(id));
    if (!ST.report.culprit || sol.claims.some(cl => !ST.report.claims[cl.id] || !has(ST.report.claims[cl.id]))) { VERDICT = '빈칸이 남아 있다. 범인과 모든 주장에 메모를 붙여야 올릴 수 있다.'; renderRep(); sfx('miss'); return; }
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
    save();
    // 연출: 지목 → 침묵 → 판정
    JUDGING = true;
    $$('.verdict').forEach(v => { v.textContent = '보고서를 올렸다. 반장이 한 장씩 넘긴다…'; v.classList.add('wait'); });
    const view = $('.rep-view'); if (view) view.classList.add('judging');
    sfx('page');
    const v = MG.sound ? MG.sound.hero('accuse') : null;
    (v ? v.done.then(() => wait(900)) : wait(1800)).then(() => {
      JUDGING = false;
      if (C !== c0) return;
      renderRep();
      if (fresh) {
        const box = $('.rep-view .rep-solved') || $('#solvedBox');
        if (box) { box.innerHTML = solvedHtml(true); box.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
        cue('solved', '사건 종결');
        if (MG.sound) setTimeout(() => { if (C === c0) MG.sound.hero('solved'); }, 1300);
      } else if (wrong === 0) toast('이미 닫힌 사건이다');
      else {
        cue('miss');
        const r = $('.rep-view'); if (r) { r.classList.remove('bounced'); void r.offsetWidth; r.classList.add('bounced'); }
        if (MG.sound) setTimeout(() => { if (C === c0) MG.sound.hero('wrong'); }, 500);
      }
    });
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
      if ((el = t.closest('[data-voice]'))) { S.voice = S.voice === false; save(); if (!S.voice && MG.sound) MG.sound.stopVoice(); el.outerHTML = voiceBtn(); return; }
      if ((el = t.closest('[data-sound]'))) { S.sound = !S.sound; save(); const vb = el.parentNode && el.parentNode.querySelector('[data-voice]'); if (vb) vb.remove(); if (!S.sound && MG.sound) MG.sound.stopVoice(); el.outerHTML = soundBtn(); if (S.sound) sfx('pen'); if (MG.mood) MG.mood.sound(); return; }
      if (t.closest('[data-intro-ok]')) { S.intro = true; save(); cabinet(); return; }
      if ((el = t.closest('[data-wipe]'))) return armed(el, '한 번 더 누르면 전부 지워진다', () => { S = { cases: {}, current: null, intro: false }; save(); cabinet(); });
      if (!C) return;
      if (TALK && t.closest('.per-tr') && !t.closest('[data-pin]')) { TALK.finish(); return; } // 대화 건너뛰기
      if ((el = t.closest('.cmp-art img, .b-img img, .map img'))) { if (!t.closest('[data-spot], .cens:not(.open)')) return zoom(el); }
      if ((el = t.closest('[data-pad]'))) { // 전화 번호판
        const f = el.closest('form'), i = f && f.querySelector('input'), k = el.dataset.pad;
        if (!i) return;
        dtmf(k);
        if (k === '#') { if (f.requestSubmit) f.requestSubmit(); else tryLock(f.dataset.lock, i.value); }
        else if (k === '*') i.value = '';
        else if (i.value.length < 8) i.value += k;
        return;
      }
      if ((el = t.closest('[data-pin]'))) return pin(el.dataset.pin);
      if ((el = t.closest('[data-kw]'))) return addKey(el.dataset.kw);
      if ((el = t.closest('[data-bub]')) && !getSelection().toString()) return pin(el.dataset.bub); // 말풍선을 누르면 수첩에
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
      if (t.closest('[data-open-rep]')) { REPOPEN = null; return openItem({ t: 'report' }); }
      if ((el = t.closest('[data-rep-open]'))) { REPOPEN = REPOPEN === el.dataset.repOpen ? null : el.dataset.repOpen; renderRep(); const a = $('.rep-claim.open'); if (a) { a.scrollIntoView({ block: 'nearest' }); const q = a.querySelector('[data-rep-filter]'); if (q && !narrow()) q.focus({ preventScroll: true }); } return; }
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
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (!C || !d.matches || !d.matches('details[data-ng]')) return;
      const k = C.id + '|' + d.dataset.ng;
      if (d.open) NGSHUT.delete(k); else NGSHUT.add(k);
    }, true);
    document.addEventListener('change', e => {
      const s = e.target.closest('[data-rep]');
      if (!s || !C) return;
      if (s.dataset.rep === 'culprit') ST.report.culprit = s.value; else { ST.report.claims[s.dataset.rep] = s.value; REPOPEN = null; }
      save(); sfx('pen'); renderRep();
    });
    document.addEventListener('input', e => {
      const q = e.target.closest('[data-rep-filter]');
      if (q) { // 메모 찾기: 낱말이 든 메모만 남긴다
        const w = q.value.trim().toLowerCase(), box = q.parentNode;
        box.querySelectorAll('.rep-grp').forEach(g => { let any = 0; g.querySelectorAll('.rep-opt').forEach(o => { const hit = !w || o.textContent.toLowerCase().includes(w); o.hidden = !hit; any += hit; }); g.hidden = !any; });
        return;
      }
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
