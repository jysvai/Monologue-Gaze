/* Monologue Gaze — 사건 엔진
 * 사건 파일(cases/*.js)은 MG.registerCase({...})로 자신을 등록한다.
 * 데이터 형식은 docs/CASE_AUTHORING.md 참고.
 */
(function () {
  'use strict';

  const MG = (window.MG = window.MG || {});
  const T = MG.T; // 화면 글자: T`한국어 ${x}` — 다른 언어면 i18n/<언어>/ui.js 의 번역 (js/i18n.js)
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
  // 로마자·키릴 문자의 발음 부호는 떼고 비교한다 (Oberröding = Oberroding, ё = е)
  const FOLD = { ä: 'a', ö: 'o', ü: 'u', ß: 'ss', é: 'e', è: 'e', ê: 'e', ë: 'e', à: 'a', á: 'a', â: 'a', å: 'a', æ: 'ae', ø: 'o', œ: 'oe', ç: 'c', ñ: 'n', ï: 'i', í: 'i', ì: 'i', î: 'i', ó: 'o', ò: 'o', ô: 'o', ú: 'u', ù: 'u', û: 'u', ý: 'y', ā: 'a', ē: 'e', ī: 'i', ō: 'o', ū: 'u', ё: 'е' };
  // 일본어 입력기로 친 하이픈(ー)과 여러 대시는 숫자·로마자 옆에서 하이픈으로 본다 (H－24617 = Hー24617), 히라가나는 가타카나로 (はんそゆん = ハンソユン)
  const norm = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[‐-―−]|(?<=[0-9a-z])ー|ー(?=[0-9a-z])/g, '').replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60)).replace(/[\s'"`.,!?·・()[\]{}\-_/@:;~「」『』〈〉《》“”‘’„«»]/g, '').replace(/[äöüßéèêëàáâåæøœçñïíìîóòôúùûýё]/g, c => FOLD[c]);
  // **굵게** — 가린 번호(010-****-3382 · ***-**-4419)의 별표는 굵게 표시로 먹지 않게
  const BOLD = /(?<![\w*-])\*\*(?![\s*-])(.+?)(?<![\s*-])\*\*(?![\w*])/g;
  const plain = s => String(s ?? '').replace(/\[\[([^\]|]+?)(?:\|[\w-]+)?\]\]/g, '$1').replace(BOLD, '$1').replace(/~~(.+?)~~/g, '$1');
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
  const pad = n => String(n).padStart(2, '0');
  const hash = s => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); };
  const KTYPE = ['person', 'place', 'thing', 'time', 'word']; // 수첩의 단어 묶음 순서
  const ktypeName = t => ({ person: T('인물'), place: T('장소'), thing: T('물건'), time: T('때'), word: T('기타') })[t];
  const NUMK = { 10: '열', 11: '열한', 12: '열두', 13: '열세', 14: '열네', 15: '열다섯', 16: '열여섯', 17: '열일곱', 18: '열여덟', 19: '열아홉', 20: '스무' };
  const numk = n => (MG.I18N.lang === 'ko' && NUMK[n]) || String(n); // 한국어만 「열다섯 건」처럼 글로 센다
  // 난이도 ★3~★5. 튜토리얼과 별이 없는 사건은 ★3 규칙을 따른다.
  const lv = () => (C && C.stars) || 3;
  const starsHtml = c => c.kind === 'tutorial' || !c.stars ? '' : `<span class="stars${c.graphic ? ' red' : ''}" role="img" aria-label="${T`난이도 ${c.stars} / 5${c.graphic ? T(' · 혐오감 주의') : ''}`}">${'★'.repeat(c.stars)}<i>${'★'.repeat(5 - c.stars)}</i></span>`;

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
  // 글 한 토막의 잔혹판: { p: '…', gore: '…' } — 잔혹 표현을 켜 두면 gore 가 원래 글 자리(p·note·say·cap·msg)에 들어간다. 사실(f)·단어는 두 판이 같다
  const GTXT = ['p', 'note', 'say', 'cap', 'msg'];
  const gv = b => !(b && typeof b === 'object' && gore()) ? b : b.goreRows ? { ...b, rows: b.goreRows } : b.gore != null ? { ...b, [GTXT.find(k => b[k] != null) || 'p']: b.gore } : b; // 표는 goreRows (행 수·순서는 원래 표와 같게)
  // kinds: 문자열 'abcd' 중에서 고른다. seed 로 위치·각도를 정한다 (같은 문서는 늘 같은 자리).
  // edge: true 면 좌우 가장자리, 'corner' 면 오른쪽 위·아래 모서리만 (글이 꽉 찬 작은 카드용)
  function stains(seed, n, kinds, edge) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = hash(seed + ':' + i);
      const k = kinds[h % kinds.length];
      const side = (h >> 3) % 2;
      const corner = edge === 'corner';
      const x = corner ? 80 + (h % 12) : edge ? (side ? 78 + (h % 17) : -6 + (h % 14)) : 8 + (h % 80);
      const y = corner ? (i % 2 ? 70 + ((h >> 5) % 12) : -12 + ((h >> 5) % 8)) : -4 + ((h >> 5) % 90);
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

  /* ───────── save ─────────
   * 수사관마다 서랍(저장 칸)을 따로 둔다. 한 브라우저를 여럿이 나눠 써도 남의 기록을 이어 하지 않게.
   * 첫 수사관(p0)은 예전 저장 칸을 그대로 써서, 명부가 생기기 전의 기록도 이어진다. */
  const KEY = 'mg-save-v1', ROSTER = 'mg-roster-v1';
  const blank = () => ({ cases: {}, current: null, intro: false });
  const slot = id => (id === 'p0' ? KEY : KEY + '@' + id);
  // 저장소가 막힌 브라우저(사생활 보호 창·쿠키 차단)에서도 이 창 안에서는 명부를 기억한다 (새 서랍 받기가 헛돌지 않게)
  let RMEM = null, RBAD = false;
  function roster() { // 다른 탭이 명부를 고쳤을 수 있으니 쓸 때마다 새로 읽는다
    let r = null;
    try { r = JSON.parse(localStorage.getItem(ROSTER) || 'null'); } catch (e) { RBAD = true; }
    if (RBAD && RMEM) r = JSON.parse(JSON.stringify(RMEM));
    if (!r || !Array.isArray(r.list) || !r.list.length) r = { list: [{ id: 'p0', name: '', no: 1 }], cur: 'p0', n: 2 };
    if (!r.list.some(p => p.id === r.cur)) r.cur = r.list[0].id;
    return r;
  }
  const saveRoster = r => { RMEM = JSON.parse(JSON.stringify(r)); try { localStorage.setItem(ROSTER, JSON.stringify(r)); } catch (e) { RBAD = true; } };
  const who = p => (p && p.name) || T`수사관 ${p ? p.no : 1}`;
  function load(id) {
    try {
      const d = JSON.parse(localStorage.getItem(slot(id)) || 'null');
      if (d && typeof d === 'object' && d.cases) return Object.assign(blank(), d);
    } catch (e) { /* storage unavailable */ }
    return blank();
  }
  let PID = roster().cur; // 이 탭의 수사관. 다른 탭에서 바꿔도 이 탭은 제 서랍에만 쓴다
  let S = load(PID);
  let SYNC = false; // 다른 탭의 기록을 받아 다시 그리는 동안은 쓰지 않는다 (두 탭이 서로 덮어쓰며 핑퐁하지 않게)
  let unsaved = false; // 브라우저가 저장을 막으면(사이트 데이터 차단 등) 한 번만 알린다 — 조용히 잃지 않게
  const save = () => { if (SYNC) return; try { localStorage.setItem(slot(PID), JSON.stringify(S)); } catch (e) { if (!unsaved) { unsaved = true; setTimeout(() => toast(T('이 브라우저가 기록 저장을 막고 있다 — 창을 닫으면 수사가 사라진다'), 6000), 900); } } };

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
    if (c.live) { st.live ??= { t: 0, req: {}, fd: {}, fx: [], rd: {} }; st.live.fx ??= []; st.live.rd ??= {}; }
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
      if (s.type === 'request' || s.type === 'feed') (s.items || []).forEach(x => { x.src = s.id; });
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
  // 이번 창에서만 기억하는 것(잠금에 틀린 횟수 · 재구성의 제자리 표시 · 고른 소명 메모 · 이미 만난 사람)은 사건마다 따로 둔다.
  // 다른 사건에 같은 이름의 칸(talk · tl · rq_cctv · p_park …)이 있어도 섞이지 않게. 「이 사건 처음부터」면 함께 비운다
  const TEMP = {};
  const tmp = () => (TEMP[C.id] ||= { fail: {}, tl: {}, rq: {}, met: new Set() });
  // 비운다: 사건 하나(id) 또는 전부 — 다른 수사관의 서랍을 열거나 기록을 지우면 앞사람의 틀린 횟수·고른 메모·읽던 자리가 따라오지 않게
  function forget(id) {
    Object.keys(TEMP).forEach(k => { if (!id || k === id) delete TEMP[k]; });
    [READPOS, NGSHUT].forEach(m => [...m.keys()].forEach(k => { if (!id || k.startsWith(id + '|')) m.delete(k); }));
  }

  const okOne = n => (n[0] === '~' ? !okOne(n.slice(1)) : n[0] === '?' ? !!(ST.live && ST.live.req[n.slice(1)] && ST.live.req[n.slice(1)].st !== 'no') : n[0] === '#' ? ST.unl.includes(n.slice(1)) : n[0] === '!' ? ST.notes.some(x => x.f === n.slice(1)) : n[0] === '@' ? !!ST.live && ST.live.t >= +n.slice(1) : ST.keys.includes(n)); // '~' = 아직 아님
  const ok = need => !need || !need.length || need.every(okOne);
  const srcVisible = s => ok(s.need);
  const srcOpen = s => !s.lock || ST.unl.includes(s.id);
  const personVisible = p => (!p.key || ST.keys.includes(p.key)) && ok(p.need);
  const curSrc = () => C.sources.find(s => s.id === ST.view.src);
  const narrow = () => { const b = $('#stageBody'); if (!b || !window.getComputedStyle) return false; const g = getComputedStyle(b).gridTemplateColumns; return /\(/.test(g) ? b.clientWidth <= 700 : g.trim().split(/\s+/).length < 2; }; // 칸이 하나뿐인가: CSS 의 @container (≤700px) 가 그린 칸 수 그대로 (그려지기 전이면 너비로)
  const beside = () => !window.matchMedia || matchMedia('(min-width:1100px)').matches; // 수첩이 수사 화면 옆에 있는가 (좁으면 밑으로 내려간다: base.css)

  function census(by) { // by 를 주면 탭마다 몇 개인지도 적는다
    let n = 0;
    const add = (id, k = 1) => { n += k; if (by && k) by[id] = (by[id] || 0) + k; };
    C.sources.forEach(s => {
      if (!srcVisible(s)) return;
      // 감정 대조·사진철은 맡길 것·꺼내 볼 것만 센다 — 빈 탭이 생긴 걸 「새로 열린 것」이라 하면 열어 봐도 아무것도 없다
      if (s.type === 'compare') return add(s.id, (s.sets || []).filter(x => ok(x.need)).length);
      if (s.type === 'photo') return add(s.id, (s.scenes || []).filter(x => ok(x.need)).length);
      add(s.id);
      if (s.type === 'list' && srcOpen(s)) add(s.id, C._srcDocs[s.id].filter(d => ok(d.need)).length);
      if (s.type === 'map') add(s.id, (s.spots || []).filter(sp => ok(sp.need)).length);
    });
    Object.values(C.people).filter(personVisible).forEach(p => add(p.src));
    if (C.live && ST.live) {
      C.sources.filter(s => s.type === 'request' && srcVisible(s)).forEach(s => (s.items || []).forEach(r => { if (ok(r.need)) add(s.id); if (ST.unl.includes(r.id)) add(s.id); }));
      C.sources.filter(s => s.type === 'feed').forEach(s => add(s.id, (s.items || []).filter(it => it.id in ST.live.fd).length));
    }
    return n;
  }
  // 「새로 열린 것 1」만으로는 어디를 봐야 할지 모른다 — 새것이 생긴 탭 이름을 붙인다
  function where(b) {
    const by = {}; census(by);
    const names = Object.keys(by).filter(id => by[id] > (b[id] || 0)).map(id => C.sources.find(x => x.id === id)).filter(Boolean).map(x => quote(plain(x.name)));
    return names.length ? ' — ' + names.slice(0, 2).join(', ') + (names.length > 2 ? ' …' : '') : '';
  }
  const opened = (n, b) => T` · 새로 열린 것 ${n}` + where(b);

  /* ───────── text rendering ───────── */
  // 표 칸의 1,234,000 같은 숫자는 번역되지 않고 남으므로, 독일어·러시아어에서는 그 나라 자릿점으로 (5,600 이 5.6 으로 읽히지 않게)
  const numLocal = x => { const sep = { de: '.', ru: ' ' }[MG.I18N.lang]; return sep && typeof x === 'string' ? x.replace(/(?<![\d.,])\d{1,3}(?:,\d{3})+(?![\d,]|\.\d)/g, m => m.replace(/,/g, sep)) : x; };
  function inline(t) {
    let h = esc(t).replace(/✎/g, () => `<span class="ic-in" role="img" aria-label="${T`연필 표시`}">${IC_PEN}</span>`); // 글 속의 ✎ 도 단추와 같은 연필 그림으로
    // 단어 단추 앞의 여는 괄호·뒤의 닫는 괄호와 문장 부호는 단추와 한 줄에 (「（」만 줄 끝에 남지 않게)
    h = h.replace(/([（「『〈《“‘(]?)\[\[([^\]|]+?)(?:\|([\w-]+))?\]\]([）」』〉》”’)、。，．,.!?！？:;：；]*)/g, (m, pre, label, kid, post) => {
      const id = kid || C._lab[norm(label)];
      const w = !id || !C.keywords[id] ? `<span class="kw-x">${label}</span>` : `<button type="button" class="kw${ST.keys.includes(id) ? ' on' : ''}" data-kw="${id}">${label}</button>`;
      return (pre || post) && w[1] === 'b' ? `<span class="nw">${pre}${w}${post}</span>` : pre + w + post;
    });
    // 11.07-③ · 010-1234-5678 같은 번호는 붙임표에서 줄이 갈리지 않게 (태그 밖 글자에만)
    h = h.replace(/(^|>)([^<]+)/g, (m, a, txt) => a + txt.replace(/\d+(?:[.-]\d+)*-[\d①-⑳]+/g, '<span class="nw">$&</span>'));
    return h.replace(BOLD, '<b>$1</b>').replace(/~~(.+?)~~/g, '<s>$1</s>').replace(/\n/g, '<br>');
  }

  function art(key, cls, svgOnly) {
    const a = C.art[key];
    if (a == null) return '';
    // 잔혹 표현을 끈 사람에게는 <키>_mild 그림(천을 덮은 판)이 있으면 그걸 보인다
    const ik = ST && S.mild && a && a.sensitive && MG.images[`${C.id}/${key}_mild`] ? `${C.id}/${key}_mild` : `${C.id}/${key}`;
    const file = svgOnly && !(a && a.raster) ? null : MG.images[ik];
    const alt = (a && a.alt) || (a && a.use) || '';
    const sz = file && (MG.imageSize || {})[ik]; // 그림이 오기 전에 제 비율만큼 자리를 잡아 둔다 (늦게 뜬 그림이 글·표시점을 밀어내지 않게)
    const img = file ? `<img class="${cls || 'art'}" src="${esc(file)}" alt="${esc(alt)}" loading="lazy" decoding="async"${sz ? ` style="aspect-ratio:auto ${+sz[0]}/${+sz[1]}"` : ''}>` : '';
    // 글자 없는 그림(지도·약도)에는 이름표를 게임이 얹는다: [글자, x%, y%(글자 밑줄), 'l'|'c'|'r']. labelStyle: 'axis' 면 도표의 눈금 글자처럼 (테두리 없이)
    const labs = file && a && a.labels ? `<span class="art-labs${a.labelStyle ? ' ' + esc(a.labelStyle) : ''}" aria-hidden="true">${a.labels.map(([t, x, y, al, sz]) => `<span class="art-lab${al === 'c' ? ' c' : al === 'r' ? ' r' : ''}" style="left:${+x}%;top:${+y}%${sz ? `;font-size:${+sz}cqw` : ''}">${esc(t)}</span>`).join('')}</span>` : ''; // sz: 글자 크기 (그림 너비의 %, labelStyle 이 있을 때)
    const body = file ? (labs ? `<span class="art-wrap">${img}${labs}</span>` : img) : typeof a === 'string' ? a : a.svg || '';
    if (!(a && a.sensitive) || !ST || !S.mild) return body; // 잔혹 표현을 켜 두었으면 가리지 않고 바로 보인다 (사건 들머리의 혐오감 주의에서 이미 동의했다)
    return `<span class="cens" data-cens="${esc(key)}">${body}<span class="cens-l">${T`<b>열람 주의</b>잔혹 표현을 끈 상태`}</span></span>`;
  }

  // 연필·체크 표시는 글꼴의 기호(✎ ✓)가 아니라 그림으로: 기호는 어느 웹 글꼴에도 없어 운영체제마다 다른 기호 글꼴로 찍힌다
  const IC_PEN = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 12.8l.9-3.1 7.2-7.2a1.2 1.2 0 0 1 1.7 0l.5.5a1.2 1.2 0 0 1 0 1.7L6.3 11.9z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M9.9 3.9l2.2 2.2M4.1 9.7l2.2 2.2" stroke="currentColor" stroke-width="1.1"/></svg>';
  const IC_TICK = '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.6 8.4c1.4.9 2.4 2.1 3.2 3.6 1.8-4.2 4.3-7.3 7.6-9.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function pinBtn(ref, t, f, src) {
    if (NOPIN) return '';
    PIN[ref] = { t: plain(t).trim(), f: f || null, src };
    const on = ST.notes.some(n => n.ref === ref);
    const lab = on ? T('수첩에 적음') : T('수첩에 적기');
    return `<button type="button" class="pin${on ? ' on' : ''}" data-pin="${esc(ref)}" aria-label="${lab}" data-tip="${lab}">${on ? IC_TICK : IC_PEN}</button>`;
  }

  function blocks(arr, base, src) {
    if (arr == null) return '';
    if (!Array.isArray(arr)) arr = [arr];
    return arr.map((b, i) => block(b, `${base}#${i}`, src)).join('');
  }

  function block(b, ref, src) {
    if (b == null) return '';
    if (typeof b === 'string') b = { p: b };
    b = gv(b);
    if (b.need && !ok(b.need)) return ''; // 조건이 붙은 문단 (결말에서 플레이어가 실제로 한 일에 맞춰)
    const cls = b.cls ? ' ' + esc(b.cls) : '';
    if (b.h != null) return `<h4 class="b-h${cls}">${inline(b.h)}</h4>`;
    if (b.sep) return `<hr class="b-sep">`;
    if (b.divider != null) return `<p class="b-div"><span>${inline(b.divider)}</span></p>`;
    if (b.note != null) return `<p class="b-note${cls}">${inline(b.note)}</p>`;
    if (b.stamp != null) return `<p class="b-stamp${cls}"><span>${inline(b.stamp)}</span></p>`;
    if (b.sign != null) return `<p class="b-sign${cls}">${inline(b.sign)}</p>`;
    if (b.m != null) {
      // 선배의 글씨를 처음 만나는 때: 잉크가 배어 나오듯 나타나고, 한마디 (기록실의 「M의 메모」에 모인다)
      const first = !ST.m;
      if (first) { ST.m = true; save(); const c0 = C; setTimeout(() => { if (C === c0) { sfx('write'); toast(c0.frame === 'laptop' || c0.frame === 'crt' ? T('화면에 포스트잇 한 장이 붙어 있다. 낯익은 글씨 — M') : T('여백에 낯익은 글씨가 있다 — M')); } }, 1100); }
      return `<p class="b-m${first ? ' fresh' : ''}">${inline(b.m)}<span class="b-m-sig">— M</span></p>`;
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
      const rows = b.rows.map((r, ri) => { r = r.map(numLocal); return `<tr>${r.map(x => `<td>${inline(x)}</td>`).join('')}<td class="pc">${pinBtn(`${ref}.${ri}`, r.join(' · '), b.f && b.f[ri], src)}</td></tr>`; }).join('');
      return `<div class="b-tbl${cls}"><table>${b.cap ? `<caption>${inline(b.cap)}</caption>` : ''}${head}<tbody>${rows}</tbody></table></div>`;
    }
    if (b.list) {
      return `<ul class="b-list${cls}">${b.list.map((x, li) => `<li>${inline(x)}${pinBtn(`${ref}.${li}`, x, b.f && b.f[li], src)}</li>`).join('')}</ul>`;
    }
    if (b.msg != null) {
      const who = b.who && !b.me ? `<span class="b-who">${esc(b.who)}</span>` : '';
      const at = b.at ? `<time>${esc(b.at)}</time>` : '';
      return `<div class="b-msg${b.me ? ' me' : ''}${cls}">${who}<div class="b-row"><div class="b-bub">${inline(b.msg)}</div>${b.unr ? `<span class="b-at"><b class="b-unr" aria-label="${T`안 읽은 사람 ${b.unr}명`}">${b.unr}</b>${at}</span>` : at}${pinBtn(ref, (b.who ? b.who + ': ' : b.me ? (C.me || T('나')) + ': ' : '') + b.msg, b.f, src)}</div></div>`;
    }
    if (b.say != null) {
      return `<p class="b-say${cls}">${b.at ? `<time>${esc(b.at)}</time>` : ''}${b.who ? `<span class="b-who">${esc(b.who)}</span>` : ''}<span class="b-line">${inline(b.say)}</span>${pinBtn(ref, (b.who ? b.who + ': ' : '') + b.say, b.f, src)}</p>`;
    }
    if (b.cipher != null) return `<p class="b-cipher${cls}">${esc(b.cipher)}</p>`;
    const t = b.p != null ? b.p : '';
    return `<p class="b-p${cls}">${inline(t)}${b.nopin ? '' : pinBtn(ref, t, b.f, src)}</p>`;
  }

  /* ───────── documents / locks / people / cipher ───────── */
  // 틀렸을 때의 말: 기계가 띄우는 잠금이면 기계의 말투로 (lock.err 가 있으면 그것)
  // 가려 적는 비밀번호: 진짜 password 칸이면 브라우저가 로그인 창으로 알고 「비밀번호 저장」·자동 채우기를 띄운다 → 보통 칸에 글자만 점으로 (못 하는 브라우저만 password)
  const PWMASK = window.CSS && CSS.supports && CSS.supports('-webkit-text-security', 'disc') ? ' class="pw"' : ' type="password"';
  const lockErr = lock => lock.err || (lock.style === 'phone' ? T('"비밀번호가 틀렸습니다. 다시 누르십시오."') : lock.style === 'lcd' ? T('「암호가 다릅니다」') : C.frame === 'papers' ? T('맞지 않는다.') : T('비밀번호가 올바르지 않습니다.'));
  function lockHtml(id, lock, title) {
    const fails = tmp().fail[id] || 0;
    // style: 'phone' 이면 전화 번호판(누르면 칸에 들어가고 # 은 확인, * 은 지우기), 'lcd' 면 워드프로세서 액정
    const pad = lock.style === 'phone' ? `<div class="lock-pad" role="group" aria-label="${T`번호판`}">${'123456789*0#'.split('').map(k => `<button type="button" data-pad="${k}"${k === '#' ? T(' aria-label="확인"') : k === '*' ? T(' aria-label="지우기"') : ''}>${k}</button>`).join('')}</div>` : '';
    return `<div class="lock${lock.style ? ' lock-' + esc(lock.style) : ''}"><p class="lock-t">${inline(lock.title || title || T('잠겨 있다'))}</p>${lock.desc ? `<p class="lock-d">${inline(lock.desc)}</p>` : ''}
      <form class="lock-f" data-lock="${esc(id)}"><label for="lk-${esc(id)}">${esc(lock.label || T('비밀번호'))}</label><input id="lk-${esc(id)}" aria-describedby="le-${esc(id)}" autocomplete="off"${lock.password ? PWMASK : ''}${lock.style === 'phone' || lock.style === 'lcd' ? ' inputmode="numeric" maxlength="8"' : (lock.code || []).length && lock.code.every(c => /^\d+$/.test(c)) ? ' inputmode="numeric"' : ''}><button type="submit">${esc(lock.button || T('열기'))}</button>${pad}</form>
      ${lock.hint ? `<p class="lock-h">${inline(lock.hint)}</p>` : ''}<p class="lock-e" id="le-${esc(id)}">${fails ? T`${esc(lockErr(lock))} (${fails}회)` : ''}</p>${lock.hint2 && fails >= ({ 3: 2, 4: 3 }[lv()] || Infinity) ? `<p class="lock-h2">${inline(lock.hint2)}</p>` : ''}</div>`;
  }

  function docHtml(d) {
    const s = C.sources.find(x => x.id === d.src) || {};
    if (d.lock && !ST.unl.includes(d.id)) return lockHtml(d.id, d.lock, d.title);
    if (!ST.seen.includes(d.id)) {
      ST.seen.push(d.id); save();
      // 빨간 별 사건에서 끔찍한 기록을 처음 펼칠 때: 파리 떼·긁는 현 (문서가 sting 을 정하면 그 소리 — 뼈 켜는 톱 등)
      if (gore() && (d.sting || (d.body || []).some(b => b && typeof b === 'object' && (b.gore != null || b.goreRows || (b.img && C.art[b.img] && C.art[b.img].sensitive))))) { const c0 = C; setTimeout(() => { if (C === c0) cue(d.sting || 'gore'); }, 350); } // 소리와 함께 화면 가장자리가 잠깐 검붉게 가라앉는다
    }
    const skin = d.skin || s.skin || 'plain';
    const paper = d.paper || s.paper;
    const marks = docMarks(d, skin);
    return `<article class="doc skin-${esc(skin)}${d.cls ? ' ' + esc(d.cls) : ''}${marks ? ' marked' : ''}"${d.bar ? ` style="--bar:${esc(d.bar)}"` : ''}>${docStains(d)}${marks}
      <header class="doc-h">${paper ? `<p class="doc-paper">${inline(paper)}</p>` : ''}${d.kicker ? `<p class="doc-k">${inline(d.kicker)}</p>` : ''}<h3 class="doc-t">${inline(d.title)}</h3>${d.meta ? `<p class="doc-m">${inline(d.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(d.body, d.id, plain(d.title))}</div></article>`;
  }

  const rawAns = (p, k) => { let a = p.ask && p.ask[k]; if (a == null && k === p.key) a = p.self; return a; };
  const isCond = a => a && !Array.isArray(a) && typeof a === 'object' && 'need' in a;
  // 수첩을 내밀기 전에 먼저 그냥 묻는다 — 처음 듣는 사람에게 「처음 하신 말씀과 다릅니다」가 나가지 않게 (기억을 되살리는 soft 는 바로 보여 준다)
  // 같은 기록(!f)으로 이미 털어놓은 사람은, 그 기록에 걸린 다른 낱말을 처음 물어도 다시 시치미 떼지 않는다
  const pressedOn = (p, a) => (ST.asked[p.id] || []).some(e => { if (!e.endsWith('!')) return false; const b = rawAns(p, e.slice(0, -1)); return isCond(b) && (b.need || []).some(n => n[0] === '!' && (a.need || []).includes(n)); });
  const askEntry = (p, k) => { const a = rawAns(p, k), asked = ST.asked[p.id] || []; return isCond(a) && ok(a.need) && (a.soft || asked.includes(k) || asked.includes(k + '!') || pressedOn(p, a)) ? k + '!' : k; };
  // idle 이 여러 줄이면 돌아가며 한 줄씩 — 모르는 걸 스무 번 물어도 똑같은 말만 되풀이하지 않게 (앞서 모른다고 한 횟수로 고르니 다시 그려도 같은 줄)
  const fallsIdle = (p, e) => { const a = rawAns(p, e.replace(/!$/, '')); return a == null || (isCond(a) && !e.endsWith('!') && a.else == null); };
  const idleFor = (p, k) => {
    if (!Array.isArray(p.idle) || p.idle.length < 2) return p.idle;
    let n = 0; for (const e of ST.asked[p.id] || []) { if (e === k) break; if (fallsIdle(p, e)) n++; }
    return [p.idle[(n + hash(p.id)) % p.idle.length]];
  };
  function ansBlocks(p, entry) {
    const conf = entry.endsWith('!');
    const k = conf ? entry.slice(0, -1) : entry;
    const a = rawAns(p, k);
    if (isCond(a)) return conf ? a.a : a.else ?? idleFor(p, k) ?? T('…글쎄요.');
    return a ?? idleFor(p, k) ?? T('…글쎄요, 잘 모르겠네요.');
  }
  function portrait(p, big) {
    if (p.art && C.art[p.art]) return `<span class="per-art${big ? ' lg' : ''}">${art(p.art)}</span>`;
    return `<span class="ava${big ? ' lg' : ''}" style="--c:${esc(p.color || '#6b6155')}">${esc(p.initial || p.name[0])}</span>`;
  }
  // 사람을 펼칠 때: 아직 묻지 않은 단어를 앞에, 물어본 것은 뒤로. 펼쳐 둔 동안에는 차례를 그대로 둔다 (누를 때마다 칩이 손 밑에서 움직이지 않게)
  let CHIPS = null;
  function chipOrder(p, ks) {
    if (!CHIPS || CHIPS.id !== C.id + '|' + p.id) {
      const asked = ST.asked[p.id] || [], fresh = ks.filter(k => !asked.includes(askEntry(p, k)));
      CHIPS = { id: C.id + '|' + p.id, keys: [...fresh, ...ks.filter(k => !fresh.includes(k))], cut: fresh.length };
    }
    const extra = ks.filter(k => !CHIPS.keys.includes(k)); // 이야기 도중에 새로 적은 단어는 아직 묻지 않은 단어 끝에
    if (extra.length) { CHIPS.keys.splice(CHIPS.cut, 0, ...extra); CHIPS.cut += extra.length; }
    return CHIPS.keys.filter(k => ks.includes(k));
  }
  function askChips(p) {
    const asked = ST.asked[p.id] || [];
    return chipOrder(p, ST.keys.filter(k => C.keywords[k] && (k !== p.key || rawAns(p, k) != null))).map(k => { // 제 이름은 따로 할 말(self)이 있을 때만 묻는다 — 없으면 「모르겠다」가 되돌아와 어색하다
      const e = askEntry(p, k);
      const state = asked.includes(e) ? ' done' : e.endsWith('!') && asked.includes(k) ? ' again' : '';
      return `<button type="button" class="chip${state}" data-ask="${k}">${esc(C.keywords[k].label)}${state === ' done' ? T('<span class="sr"> (물어봄)</span>') : state ? T('<span class="sr"> (메모를 들이밀어 다시 물을 수 있음)</span>') : ''}</button>`; // 테두리·흐림은 눈에만 보이니 말로도
    }).join('');
  }
  /* 탐문은 대화처럼: 내가 묻는 말풍선 → 상대가 한 글자씩 답한다. 앞의 (…) 는 몸짓, 「— 」 로 시작하면 내가 끼어든 말 */
  const jong = w => { // 받침이 있나 (조사 고르기)
    const c = String(w).replace(/[^0-9A-Za-z가-힣]+$/, '').slice(-1);
    if (/[가-힣]/.test(c)) return (c.charCodeAt(0) - 0xac00) % 28 !== 0;
    if (/[0-9]/.test(c)) return '013678'.includes(c);
    return /[lmnr]/i.test(c);
  };
  // 조사만 돌려준다: T`${L}${josa(L, '과', '와')} …` — 다른 언어의 번역은 조사 자리({1})를 빼고 쓴다
  const josa = (w, a, b) => (MG.I18N.lang !== 'ko' ? '' : jong(w) ? a : b);
  const QT = {
    // 사람 물음은 가족에게도, 낯선 이에게도, 산 사람에게도 죽은 사람에게도 어색하지 않게 (어머니에게 「아드님을 아십니까?」가 되지 않게)
    person: [L => T`${L} 얘기를 좀 여쭙겠습니다.`, L => T`${L}에 대해 아시는 대로 말씀해 주시죠.`, L => T`${L}${josa(L, '과', '와')} 관련해서 여쭙겠습니다.`],
    place: [L => T`${L}, 거기에 대해 아시는 대로 말씀해 주시죠.`, L => T`${L} 얘기를 좀 들려주시죠.`], // 가게 주인에게 「그 가게에 가 보신 적 있습니까?」가 되지 않게
    time: [L => T`${L}, 그때 얘기를 좀 들려주시죠.`, L => T`${L}에 무슨 일이 있었습니까?`], // 그날 밤을 겪은 피해자에게 「그때 어디서 뭘 하고 계셨습니까?」가 되지 않게
    thing: [L => T`${L} 말입니다. 아시는 대로 말씀해 주시죠.`, L => T`${L}에 대해 짚이는 게 있습니까?`], // 몸값을 들고 나간 어머니에게 「몸값, 이게 뭔지 아십니까?」가 되지 않게
    word: [L => T`${L} 얘기를 좀 여쭙겠습니다.`, L => T`${L}에 대해 아시는 대로 말씀해 주시죠.`], // 회사·신문·절차 이름에 「~이라는 말」은 어색하다 — 은어나 인용구는 단어가 q 로 그 물음을 가진다
  };
  const PRESS = ['press1', 'press2', 'press3', 'press4'];
  const RECALL = ['recall1', 'recall2']; // soft: 거짓말한 적 없는 사람(피해자·유족·목격자)에게 메모를 보여 기억을 되살릴 때
  const isSoft = (p, k) => !!(rawAns(p, k) || {}).soft;
  const pressKey = (p, k) => { const L = isSoft(p, k) ? RECALL : PRESS; return L[hash(p.id + k) % L.length]; };
  function qText(p, e) {
    const k = e.replace(/!$/, ''), kw = C.keywords[k] || {}, L = kw.label || k;
    if (e.endsWith('!')) return (MG.sound && MG.sound.line(pressKey(p, k))) || (isSoft(p, k) ? T('이걸 한번 봐 주시겠습니까. 떠오르는 게 있으신지요.') : T('이걸 보시죠. 그래도 같은 말씀입니까?'));
    if (k === p.key) return T('본인 이야기를 좀 듣고 싶습니다.');
    if (kw.q) { const qs = [].concat(kw.q); return qs[hash(p.id + k) % qs.length]; } // 틀에 안 맞는 단어(기한·판결·통금 등)는 단어가 제 물음을 가진다
    const t = QT[kw.type] || QT.word;
    return t[hash(p.id + k) % t.length](L);
  }
  // 추궁할 때 내미는 증거: 조건(need)에 걸린 수첩 메모
  function evidence(p, k) {
    const a = rawAns(p, k);
    return ((a && a.need) || []).filter(n => n[0] === '!').map(n => ST.notes.find(x => x.f === n.slice(1))).filter(Boolean);
  }
  const DASH = /^\s*—\s*/;
  const MIDACT = MG.I18N.lang === 'ko' ? /\(([^()<>\d]*[가-힣][^()<>\d]*)\)/g : /[(（]([^()（）<>\d]*\p{L}[^()（）<>\d]*)[)）]/gu; // 말 도중의 몸짓 (숫자가 든 괄호 — 나이·번호 — 는 말 그대로 둔다). 중국어·일본어 번역은 전각 괄호（…）도
  function chatLines(arr, base, src) {
    if (arr == null) return '';
    if (!Array.isArray(arr)) arr = [arr];
    return arr.map((b0, i) => {
      const b = gv(b0);
      const ref = `${base}#${i}`;
      if (!(typeof b === 'string' || (b && b.p != null && !b.cls && !b.nopin))) return block(b, ref, src);
      const t = typeof b === 'string' ? b : b.p, fid = typeof b === 'string' ? null : b.f;
      const m = t.match(/^[(（]([^()（）]*)[)）]\s*/);
      const rest = m ? t.slice(m[0].length) : t;
      if (!rest.trim()) return m ? `<p class="c-act" data-i="${i}">${inline(m[1])}${fid ? pinBtn(ref, t, fid, src) : ''}</p>` : '';
      const me = DASH.test(rest);
      // 말 도중의 몸짓 「(고개를 숙인다)」은 말이 아니다: 말풍선 안에서 흐린 기울임꼴로, 수첩에 적을 때는 뺀다
      const said = inline(me ? rest.replace(DASH, '') : rest).replace(MIDACT, '<i class="c-mid">$&</i>');
      return `${m ? `<p class="c-act" data-i="${i}">${inline(m[1])}</p>` : ''}<div class="c-bub${me ? ' me' : ''}" data-i="${i}" data-bub="${esc(ref)}"><span class="c-t">${said}</span>${pinBtn(ref, rest.replace(MIDACT, ' ').replace(/\s{2,}/g, ' '), fid, src)}</div>`;
    }).join('');
  }
  function personHtml(p) {
    const asked = (ST.asked[p.id] || []).filter(e => { const k = e.replace(/!$/, ''); return k === p.key || C.keywords[k]; }); // 예전 판 저장에 남은, 지금은 없는 단어는 건너뛴다 (단어 id 가 글로 새지 않게)
    const src = T`${p.name} 탐문`;
    let tr = `<div class="qa qa-first" data-qa="_">${chatLines(p.intro, `${p.id}@_`, src)}</div>`;
    tr += asked.map(e => {
      const k = e.replace(/!$/, ''), press = e.endsWith('!');
      const ev = press ? evidence(p, k) : [];
      return `<div class="qa${press ? ' press' : ''}" data-qa="${esc(e)}"><div class="c-q"><span class="c-t">${esc(qText(p, e))}</span>${press ? '' : `<small class="c-k">${esc((C.keywords[k] || {}).label || k)}</small>`}</div>
        ${ev.map(n => `<p class="c-ev"><span class="c-ev-k">${isSoft(p, k) ? T('수첩을 펴 보인다') : T('수첩을 내민다')}</span>${esc(n.t)}</p>`).join('')}
        <div class="c-ans">${chatLines(ansBlocks(p, e), `${p.id}@${e}`, src)}</div></div>`;
    }).join('');
    return `<article class="person skin-${esc(p.skin || 'talk')}"><header class="per-h">${portrait(p, true)}<div><h3>${esc(p.name)}</h3>${p.role ? `<p>${inline(p.role)}</p>` : ''}${p.where ? `<p class="per-w">${inline(p.where)}</p>` : ''}</div></header>
      <div class="per-tr" data-who="${esc(p.id)}">${tr}</div>
      <div class="per-ask"><p class="per-ask-t">${T`무엇을 물어볼까? <small>수첩의 단어${T(' · 붉은 테: 메모를 들이밀어 다시 물을 수 있다')}${liveOn() ? T` · 물을 때마다 ${hm(lcost('ask'))}` : ''}</small>`}</p><div class="chips" id="askChips">${askChips(p)}</div></div></article>`;
  }

  /* 대화 재생: 몸짓은 스르르, 말은 한 글자씩(사람마다 다른 말소리). 목소리가 있는 말풍선은 재생 시각에 맞춰 찍는다. 누르면 건너뛴다 */
  let TALK = null;
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  function stopTalk() { if (TALK) TALK.finish(true); }
  function playTalk(qa, opt) {
    stopTalk();
    const box = qa && (qa.querySelector('.c-ans') || qa);
    const items = box ? [...box.children] : [];
    if (!items.length) return;
    const p = opt.p, snd = MG.sound;
    const tone = snd ? snd.tone(`${C.id}/${p.id}`) : 130, htone = snd ? snd.tone('hero') : 150;
    const fast = reduced();
    const pr = $('#paneRead');
    // 말이 나오는 대로 따라 내려간다 — 단, 앞의 대답을 다시 보려고 위로 올려 둔 동안은 끌어내리지 않는다 (끝까지 다시 내려오면 또 따라간다)
    let auto = null;
    const keep = el => {
      if (!pr || !el.isConnected) return;
      if (auto != null && pr.scrollTop < auto - 24 && pr.scrollHeight - pr.clientHeight - pr.scrollTop > 60) return;
      const r = el.getBoundingClientRect(), b = pr.getBoundingClientRect();
      if (r.bottom > b.bottom - 36) pr.scrollTop += r.bottom - b.bottom + 36;
      auto = pr.scrollTop;
    };
    const dots = document.createElement('p'); dots.className = 'c-dots'; dots.setAttribute('aria-hidden', 'true'); dots.innerHTML = '<i></i><i></i><i></i>';
    const me = { timer: 0, saved: new Map() };
    let cur = null; // 지금 나오는 목소리 구간 { key, v, chars, done }
    me.finish = quiet => {
      if (quiet && cur && cur.v && !cur.over && snd) snd.stopVoice(); // 다른 것을 물으면 앞사람 목소리는 거기서 끊는다
      if (!quiet && TALK === me && qa.isConnected) say(items.map(el => { const c = el.cloneNode(true); c.querySelectorAll('[data-pin],[aria-hidden="true"]').forEach(x => x.remove()); return c.textContent.trim(); }).filter(Boolean).join(' ')); // 화면 읽기 프로그램에 대답을 읽어 준다 (다른 곳으로 옮겨 가며 끊은 것은 말고)
      if (TALK === me) TALK = null;
      clearTimeout(me.timer);
      dots.remove();
      items.forEach(el => { el.classList.remove('wait', 'typing'); const h = me.saved.get(el); if (h != null) el.querySelector('.c-t').innerHTML = h; });
      me.saved.clear();
      qa.classList.remove('live');
    };
    TALK = me;
    const alive = () => TALK === me && qa.isConnected;
    me.alive = alive; // 다시 그려져 사라진 대답은 더는 「건너뛰기」 대상이 아니다 (그 뒤의 첫 누름을 먹지 않게)
    const later = (ms, fn) => { me.timer = setTimeout(() => { if (alive()) fn(); else if (TALK === me) TALK = null; }, fast && ms < 60000 ? Math.min(ms, 40) : ms); };
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
    let n = 0;
    const next = () => {
      if (n >= items.length) return me.finish();
      const el = items[n++];
      dots.remove();
      el.classList.remove('wait');
      keep(el);
      const tt = el.classList.contains('c-bub') && el.querySelector('.c-t');
      if (!tt) return later(el.classList.contains('c-act') ? 520 : 200, next);
      const i = +el.dataset.i, isMe = el.classList.contains('me');
      const sg = seg(i);
      if (sg && (!cur || cur.key !== sg.key)) {
        const bubs = items.filter(x => x.classList.contains('c-bub') && +x.dataset.i >= sg.from && +x.dataset.i <= sg.to);
        const c = cur = { key: sg.key, v: snd.voice(sg.key), chars: bubs.reduce((s, x) => s + x.querySelector('.c-t').textContent.length, 0), done: 0, last: bubs[bubs.length - 1], over: false };
        if (c.v) { // 재생이 막히거나 끊겨도 글자는 끝까지
          c.v.done.then(() => { c.over = true; clearInterval(c.watch); });
          // 목록으로 돌아가거나 다른 문서·탭으로 옮겨 이 사람 화면을 떠나면 목소리도 멈춘다
          const st0 = ST, o0 = JSON.stringify(ST.view && ST.view.open);
          c.watch = setInterval(() => { if (c.over || qa.isConnected || (ST === st0 && JSON.stringify(ST.view && ST.view.open) === o0 && $('.per-tr'))) return; clearInterval(c.watch); snd.stopVoice(); }, 200);
        }
      } else if (!sg) cur = null;
      const v = cur && cur.v;
      if (fast) { const wait = v && cur.last === el ? v.done : Promise.resolve(); return void wait.then(() => { if (alive()) later(200, next); }); }
      me.saved.set(el, tt.innerHTML);
      // 글자마다 감싸 두고 하나씩 보이게 (자리는 미리 잡혀 있어 줄이 흔들리지 않는다)
      const chars = [];
      const walk = node => [...node.childNodes].forEach(c => {
        if (c.nodeType !== 3) { if (c.classList && c.classList.contains('c-mid')) { c.classList.add('ch'); chars.push(c); return; } return walk(c); } // 몸짓은 한 번에 스르르
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
        me.timer = setTimeout(step, v ? 30 : chars[k - 1].classList.contains('c-mid') ? 420 : /[.?!…。？！]/.test(ch) ? 230 : /[,、，；]/.test(ch) ? 120 : 34);
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
    const soft = isSoft(p, k);
    cue(soft ? 'clue' : 'confess');
    const st = document.createElement('div'); st.className = 'cue-stamp press'; st.setAttribute('aria-hidden', 'true'); st.innerHTML = `<span>${soft ? T('확인') : T('추궁')}</span>`;
    document.body.appendChild(st); setTimeout(() => st.remove(), 1900);
    const t = playTalk(qa, { p, lead: 600000 }); // 대답은 내 말이 끝난 뒤
    const go = () => { if (t && TALK === t && qa.isConnected) { t.finish(true); playTalk(qa, { p, voice: `v/${C.id}/${p.id}/${k}`, lead: 1000 }); } };
    setTimeout(() => {
      if (t && (TALK !== t || !qa.isConnected)) return;
      const hv = MG.sound ? MG.sound.voice('hero/' + pressKey(p, k)) : null;
      if (hv) hv.done.then(go); else setTimeout(go, 1050);
    }, 450);
  }

  function cipherParts(s) {
    const toks = Array.from(s.cipher || '');
    const keep = new Set([' ', '\n', ...Array.from(s.keep || '')]);
    const syms = [...new Set(toks.filter(t => !keep.has(t)))];
    return { toks, keep, syms };
  }
  let CIPHL = null; // 글자를 넣고 있는 기호: 암호문 속 같은 기호에 형광펜
  const cipherHl = sym => { CIPHL = sym; const g = $('#cGrid'); if (g) $$('.cc:not(.sp)', g).forEach(c => c.classList.toggle('hl', c.firstChild.textContent === sym)); };
  function cipherGrid(s) {
    const { toks, keep } = cipherParts(s);
    const g = ST.ciph[s.id] || {};
    const given = s.given || {};
    const solved = ST.unl.includes(s.id);
    return toks.map(t => {
      if (t === '\n') return '<br>';
      if (keep.has(t)) return `<span class="cc sp">${t === ' ' ? '&nbsp;' : esc(t)}</span>`;
      const v = solved ? s.key[t] : given[t] || g[t] || '';
      return `<span class="cc${v ? ' has' : ''}${t === CIPHL ? ' hl' : ''}"><b>${esc(t)}</b><i>${esc(v || '·')}</i></span>`;
    }).join('');
  }
  function cipherHtml(s) {
    if (!s) return '';
    const { syms } = cipherParts(s);
    const g = ST.ciph[s.id] || {};
    const given = s.given || {};
    const solved = ST.unl.includes(s.id);
    const form = solved ? `<div class="c-done">${blocks(s.solved, `${s.id}@s`, s.name)}</div>` : `<form class="c-form" data-cipher="${esc(s.id)}"><div class="c-keys">${syms.map(y => `<label class="ck"><span>${esc(y)}</span><input data-sym="${esc(y)}" value="${esc(given[y] || g[y] || '')}" maxlength="${s.max || 2}"${given[y] ? ' readonly' : ''} aria-label="${T`기호 ${esc(y)}에 맞는 글자`}"></label>`).join('')}</div><p class="c-act"><button type="submit">${T`대조해 보기`}</button><span class="c-msg"></span></p></form>`;
    return `<article class="doc skin-${esc(s.skin || 'cipher')}"><header class="doc-h"><h3 class="doc-t">${inline(s.title || s.name)}</h3>${s.meta ? `<p class="doc-m">${inline(s.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(s.intro, `${s.id}@i`, s.name)}<div class="c-grid" id="cGrid">${cipherGrid(s)}</div>${form}</div></article>`;
  }

  /* ── 사건 재구성 (timeline): 사건 카드를 순서대로 맞춘다 */
  function tlOrder(s) {
    const ids = (s.events || []).map(e => e.id);
    let o = ST.tl[s.id];
    if (!o || o.length !== ids.length || !ids.every(id => o.includes(id))) {
      // 사건마다 같은 순서로 섞되, 카드 한두 장만 옮기면 맞는 판은 다시 섞는다 (옮길 장수 = 전체 − 이미 제자리 순서인 가장 긴 줄)
      const need = ord => { const r = ord.map(id => ids.indexOf(id)), L = r.map(() => 1); r.forEach((v, i) => { for (let j = 0; j < i; j++) if (r[j] < v) L[i] = Math.max(L[i], L[j] + 1); }); return r.length - Math.max(0, ...L); };
      const want = Math.min(ids.length - 1, Math.max(2, Math.ceil(ids.length / 2)));
      for (let k = 0; k < 40; k++) {
        let seed = hash(s.id + '#' + k) || 1;
        const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x80000000;
        o = [...ids];
        for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
        if (need(o) >= want) break;
      }
      ST.tl[s.id] = o;
    }
    return o;
  }
  function timelineHtml(s) {
    if (!s) return '';
    const solved = ST.unl.includes(s.id);
    const ev = Object.fromEntries((s.events || []).map(e => [e.id, e]));
    const order = solved ? s.events.map(e => e.id) : tlOrder(s);
    const hit = tmp().tl[s.id] || [];
    const rows = order.map((id, i) => `<li class="tl-e${solved ? ' ok' : hit.includes(id) ? ' hit' : ''}" data-ev="${esc(id)}"><span class="tl-slot">${inline((s.slots || [])[i] || String(i + 1))}</span><span class="tl-t">${inline(ev[id].t)}</span>${solved ? '' : `<span class="tl-mv"><button type="button" data-tl="${esc(s.id)}|${esc(id)}|-1" aria-label="${T`${esc(trunc(plain(ev[id].t), 40))} — 앞 칸으로`}"${i === 0 ? ' disabled' : ''}>▲</button><button type="button" data-tl="${esc(s.id)}|${esc(id)}|1" aria-label="${T`${esc(trunc(plain(ev[id].t), 40))} — 뒤 칸으로`}"${i === order.length - 1 ? ' disabled' : ''}>▼</button></span>`}</li>`).join('');
    const act = solved ? `<div class="c-done">${blocks(s.solved, `${s.id}@s`, s.name)}</div>` : `<p class="c-act"><button type="button" data-tl-check="${esc(s.id)}">${T`이 순서로 맞춰 보기`}</button><span class="c-msg"></span></p>`;
    return `<article class="doc skin-${esc(s.skin || 'board')}"><header class="doc-h"><h3 class="doc-t">${inline(s.title || s.name)}</h3>${s.meta ? `<p class="doc-m">${inline(s.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(s.intro, `${s.id}@i`, s.name)}<ol class="tl">${rows}</ol>${act}</div></article>`;
  }

  /* ── 대조 감정 (compare): 증거와 일치하는 시료를 고른다 */
  const cmpState = x => (ST.cmp[x.id] ||= { x: [], at: -1 });
  // 대조 감정 재시도 조건: 새 단어나 새 사실(아무 메모가 아니라 증거가 되는 메모)을 얻었는가
  const progress = () => ST.keys.length + new Set(ST.notes.map(n => n.f).filter(Boolean)).size;
  function compareList(s) {
    const sets = (s.sets || []).filter(x => ok(x.need));
    if (!sets.length) return `<p class="res-none">${esc(s.empty || T('아직 맡길 감정이 없다.'))}</p>`;
    const o = ST.view.open;
    return sets.map(x => `<button type="button" class="item${o && o.t === 'compare' && o.id === x.id ? ' on' : ''}${ST.seen.includes(x.id) ? '' : ' new'}" data-cmp="${esc(x.id)}"><span class="item-t">${ST.unl.includes(x.id) ? '✓ ' : ''}${esc(plain(x.title))}${NEWSR(x.id)}</span>${x.meta ? `<span class="item-m">${esc(plain(x.meta))}</span>` : ''}</button>`).join('');
  }
  function compareHtml(x) {
    if (!x) return '';
    if (!ST.seen.includes(x.id)) { ST.seen.push(x.id); save(); }
    const solved = ST.unl.includes(x.id);
    const st = cmpState(x);
    const wait = !solved && lv() >= 4 && st.at >= 0 && progress() <= st.at;
    const opt = o => {
      const cls = solved && o.id === x.answer ? ' ok' : st.x.includes(o.id) ? ' no' : '';
      return `<div class="cmp-o${cls}">${o.art ? `<div class="cmp-art">${art(o.art, 'art', true)}</div>` : ''}<p class="cmp-n">${inline(o.label)}</p>${o.t ? `<p class="cmp-d">${inline(o.t)}</p>` : ''}${solved || st.x.includes(o.id) ? '' : `<button type="button" data-cmp-pick="${esc(x.id)}|${esc(o.id)}"${wait ? ' disabled' : ''}>${T`이것과 일치`}</button>`}</div>`;
    };
    const fails = st.x.length;
    const hintAt = { 3: 1, 4: 2 }[lv()] || Infinity;
    const msg = solved ? '' : wait ? T('감정 결과 불일치. 다시 맡기려면 새 단서가 하나 더 있어야 한다.') : fails ? T`불일치 ${fails}회.` : '';
    const ev = x.evidence || {};
    return `<article class="doc skin-${esc(x.skin || 'lab')}"><header class="doc-h"><p class="doc-k">${T`대조 감정`}</p><h3 class="doc-t">${inline(x.title)}</h3>${x.meta ? `<p class="doc-m">${inline(x.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(x.intro, `${x.id}@i`, plain(x.title))}
        <div class="cmp-ev"><p class="cmp-lab">${esc(ev.label || T('대조할 증거'))}</p>${ev.art ? `<div class="cmp-art">${art(ev.art, 'art', true)}</div>` : ''}${ev.t ? `<p class="cmp-d">${inline(ev.t)}</p>` : ''}</div>
        <p class="cmp-q">${inline(x.q || T('어느 것과 일치하는가?'))}</p>
        <div class="cmp-opts">${(x.options || []).map(opt).join('')}</div>
        <p class="c-msg">${esc(msg)}</p>${!solved && x.hint && fails >= hintAt ? `<p class="lock-h2">${inline(x.hint)}</p>` : ''}
        ${solved ? `<div class="c-done">${blocks(x.solved, `${x.id}@s`, plain(x.title))}</div>` : ''}</div></article>`;
  }

  /* ── 기록 조회 (query): 정확한 번호·이름을 넣어 대장을 조회한다 */
  // 이름을 성·이름 순서를 뒤집어 쳐도 (Deok-su Kang = Kang Deok-su) 같은 사람으로 찾는다: 낱말 두세 개면 거꾸로 한 번 더 맞춰 본다
  const flipWords = v => { const w = String(v ?? '').trim().split(/[\s,]+/).filter(Boolean); return w.length > 1 && w.length < 4 ? w.reverse().join(' ') : null; };
  function queryHits(s, inp) {
    if (!Object.values(inp).some(v => norm(v))) return null;
    const bare = v => String(v ?? '').replace(/\s*[(（][^()（）]*[)）]\s*$/, ''); // 「1968.12.15 (일)」 「31 007 (역 안내)」처럼 기록에 보이는 대로 옮겨 친 것
    const hon = v => bare(v).replace(/\s*(댁|께|씨|님|에게|한테)$/, ''); // 「개성 어머니 댁」 「서 선생께」처럼 말하듯 붙인 꼬리
    const fits = (vals, v) => { const L = (Array.isArray(vals) ? vals : [vals]).map(norm); return [v, bare(v), hon(v)].some(x => L.includes(norm(x)) || (flipWords(x) != null && L.includes(norm(flipWords(x))))); };
    return (s.records || []).filter(r => Object.entries(r.match || {}).every(([f, vals]) => fits(vals, inp[f]))).map(r => r.doc).filter((id, i, a) => C.docs[id] && a.indexOf(id) === i);
  }
  function queryList(s) {
    const inp = ST.view.qin[s.id] || {};
    const res = ST.view.qres[s.id];
    const found = (ST.found[s.id] || []).filter(id => !(res || []).includes(id)).map(id => C.docs[id]).filter(Boolean); // 방금 조회한 결과는 위에만
    const fields = (s.fields || []).map(f => `<label class="qf"><span>${esc(f.label)}</span><input data-qf="${esc(f.id)}" value="${esc(inp[f.id] || '')}" placeholder="${esc(f.placeholder || '')}" autocomplete="off"></label>`).join('');
    let out = '';
    if (res) out = res.filter(id => C.docs[id]).length ? `<p class="res-n">${T`조회 결과 ${res.filter(id => C.docs[id]).length}건`}</p>${res.filter(id => C.docs[id]).map(id => itemBtn(C.docs[id])).join('')}` : `<p class="res-none">${esc(s.none || T('해당하는 기록이 없다.'))}</p>`;
    return `<form class="q-f" data-query="${esc(s.id)}" data-slip="${esc(s.slip || s.name || '')}">${fields}<button type="submit">${esc(s.button || T('조회'))}</button></form>
      <div class="res">${out}</div>${found.length ? `<p class="res-n">${esc(s.foundLabel || T('조회해 둔 기록'))}</p>${found.map(itemBtn).join('')}` : ''}`;
  }

  /* ── 정밀 관찰 (photo): 현장 스케치·사진에서 숨은 지점을 찾는다 */
  const sceneSpots = x => (x.spots || []).filter(sp => ok(sp.need));
  function photoList(s) {
    const scenes = (s.scenes || []).filter(x => ok(x.need));
    if (!scenes.length) return `<p class="res-none">${esc(s.empty || T('아직 살펴볼 사진이 없다.'))}</p>`;
    const o = ST.view.open;
    return scenes.map(x => {
      const n = (x.spots || []).filter(sp => ST.unl.includes(sp.id)).length;
      const tot = lv() >= 5 ? '' : ` / ${sceneSpots(x).length}`;
      return `<button type="button" class="item${o && o.t === 'photo' && o.id === x.id ? ' on' : ''}${ST.seen.includes(x.id) ? '' : ' new'}" data-scene="${esc(x.id)}"><span class="item-t">${esc(plain(x.title))}${NEWSR(x.id)}</span><span class="item-m">${T`찾은 것 ${n}${tot}${x.meta ? ' · ' + esc(plain(x.meta)) : ''}`}</span></button>`;
    }).join('');
  }
  const PHGRID = new Set(); // 「칸을 나눠 살피기」를 펼쳐 둔 사진 (찾을 때마다 다시 그려져도 펼친 채로 — 키보드로 칸을 옮겨 다니는 중이므로)
  function photoHtml(x) {
    if (!x) return '';
    if (!ST.seen.includes(x.id)) { ST.seen.push(x.id); save(); }
    const found = (x.spots || []).filter(sp => ST.unl.includes(sp.id));
    const tot = sceneSpots(x).length;
    const marks = found.map((sp, i) => `<span class="ph-mk" style="left:${+sp.x}%;top:${+sp.y}%" aria-hidden="true">${i + 1}</span>`).join('');
    const cells = [];
    for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) cells.push(`<button type="button" class="ph-cell" data-ph-cell="${esc(x.id)}|${q}|${r}" aria-label="${T`${r + 1}행 ${q + 1}열 살피기`}"></button>`);
    return `<article class="doc skin-${esc(x.skin || 'photo')} scene"><header class="doc-h"><p class="doc-k">${T`정밀 관찰`}</p><h3 class="doc-t">${inline(x.title)}</h3>${x.meta ? `<p class="doc-m">${inline(x.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(x.intro, `${x.id}@i`, plain(x.title))}
        <div class="ph" data-ph="${esc(x.id)}">${art(x.art, 'art', true)}${marks}<div class="ph-grid"${PHGRID.has(x.id) ? '' : ' hidden'}>${cells.join('')}</div></div>
        <p class="ph-bar"><span>${T`찾은 것 ${found.length}${lv() >= 5 ? '' : ` / ${tot}`}`}</span><button type="button" data-ph-grid="${esc(x.id)}" aria-pressed="${PHGRID.has(x.id)}">${T`칸을 나눠 살피기`}</button></p>
        <ol class="ph-found">${found.map(sp => `<li><p class="ph-l">${inline(sp.label)}</p>${blocks(sp.body, `${sp.id}@b`, plain(x.title))}</li>`).join('')}</ol></div></article>`;
  }

  /* ───────── 실시간 수사 (live) ─────────
   * 지금 벌어지는 사건: 시계가 간다. C.live = { start: [년, 월, 일, 시, 분], deadline: { at: 분, label, who, miss }, cost: { … } }
   * 시간은 행동만큼 흐른다 (문서를 처음 읽기·탐문·검색·조회·감정). 영장·공문은 소명 자료(수첩 메모)를 붙여 신청하고,
   * 받아들여지면 eta 분 뒤에 회신이 온다. 단톡방(feed)에는 시간이 지나거나 조건이 채워지면 새 말이 온다. */
  const LIVE_COST = { doc: 8, ask: 15, search: 4, query: 12, compare: 40, timeline: 10, photo: 6, write: 20 };
  const liveOn = () => !!(C && C.live && ST && ST.live);
  const lcost = k => { const c = (C.live && C.live.cost) || {}; return c[k] != null ? c[k] : LIVE_COST[k]; };
  const liveDate = t => { const s = (C.live && C.live.start) || [2024, 1, 1, 9, 0]; return new Date(s[0], s[1] - 1, s[2], s[3], s[4] + t); };
  const hm = m => { m = Math.max(0, Math.round(m)); const h = Math.floor(m / 60), r = m % 60; return h ? (r ? T`${h}시간 ${r}분` : T`${h}시간`) : T`${r}분`; };
  const lstamp = t => MG.I18N.date(liveDate(t), 'mdwhm'); // 11월 22일(금) 15:40
  const ltime = t => { const d = liveDate(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const reqItems = () => C.sources.filter(s => s.type === 'request').flatMap(s => s.items || []);
  const reqById = id => reqItems().find(r => r.id === id);
  const feedItems = () => C.sources.filter(s => s.type === 'feed').flatMap(s => s.items || []);
  const reqState = id => (ST.live && ST.live.req[id]) || null;
  const lvAll = n => (n || []).filter(x => x[0] !== '@'); // 시간 조건을 뺀 나머지
  const feedName = id => { const s = C.sources.find(x => x.id === id); return s ? s.name : T('단톡방'); };
  const firstFeed = () => { const s = C.sources.find(x => x.type === 'feed'); return s && s.id; };

  let stepMin = 0; // 방금 한 일에 든 시간: 시계 옆에 잠깐 「+15분」으로 (무엇에 얼마가 드는지 몸으로 알게)
  function advance(kind, min) {
    if (!liveOn() || ST.solved) return liveSync();
    const m = min != null ? min : lcost(kind);
    const prev = ST.live.t;
    ST.live.t += m || 0;
    if (m > 0 && kind !== 'wait') stepMin += m;
    liveSync(prev);
  }
  // 시간이 흐르거나 새 단서가 생겼을 때: 회신 도착, 단톡방 새 말, 기한 넘김
  function liveSync(prev) {
    if (!liveOn()) return;
    const L = ST.live, news = [], end = L.t;
    if (prev == null) prev = end;
    // 한 걸음(문서 읽기·조회·기다리기) 사이에 생긴 일은 일어난 차례대로 푼다: 먼저 온 회신·말이 뒤에 올 말의 조건('#' · '~#' · '@')을 바꾸므로,
    // 조건은 그 말이 올 시각의 상태로 따진다 (회신이 늦게 오는 줄 알고 먼저 온 「놓쳤다」 말이, 한꺼번에 푼다고 「잡았다」로 바뀌지 않게)
    const reqs = reqItems(), feeds = feedItems();
    const okAt = (it, t) => { L.t = t; try { return ok(it.need); } finally { L.t = end; } };
    const fresh = new Set(feeds.filter(it => !(it.id in L.fd) && (it.at || 0) <= end && okAt(it, Math.max(it.at || 0, prev))).map(it => it.id)); // 이 걸음의 수사로 조건이 찬 말
    let now = prev;
    for (let n = 0; n < 400; n++) {
      let best = null;
      reqs.forEach(r => { const q = L.req[r.id]; if (q && q.st === 'wait' && q.due <= end) { const t = Math.max(q.due, prev); if (!best || t < best.t) best = { t, r }; } });
      feeds.forEach(it => {
        if (it.id in L.fd || (it.at || 0) > end) return;
        const t = Math.max(it.at || 0, now);
        if ((!best || t < best.t) && okAt(it, t)) best = { t, it };
      });
      if (!best) break;
      now = Math.max(now, best.t);
      if (best.r) {
        const r = best.r, q = L.req[r.id];
        q.st = 'done';
        if (!ST.unl.includes(r.id)) ST.unl.push(r.id);
        (r.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
        const who = (r.feed && r.feed.who) || r.from || plain(r.to || '') || T('회신'), msg = (r.feed && r.feed.msg) || T`회신 — ${plain(r.title)}`;
        L.fx.push({ t: q.due, who, msg, doc: r.doc, src: (r.feed && r.feed.src) || null });
        news.push({ who, msg, app: r.app || T('회신'), t: 'doc', id: r.doc, src: r.src, at: q.due });
        continue;
      }
      const it = best.it;
      // backdate: 조건이 늦게 채워져도 적힌 시각 그대로 · 이 걸음의 수사로 조건이 찬 지난 말은 걸음이 끝난 지금 · 앞선 회신·말로 조건이 찬 말은 그때
      L.fd[it.id] = it.backdate ? it.at || 0 : fresh.has(it.id) ? ((it.at || 0) > prev ? it.at || 0 : end) : best.t;
      if (!ST.unl.includes(it.id)) ST.unl.push(it.id); // '#말id' 조건: 그 말이 왔음
      (it.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
      const o = ST.view.open, here = o && o.t === 'feed' && o.id === it.src; // 지금 펼쳐 둔 단톡방의 말은 알림으로 또 띄우지 않는다 (방에 바로 뜬다)
      if (!it.me && !here && !ST.solved) news.push({ who: it.who || '', msg: plain(it.msg || ''), app: it.app || feedName(it.src), t: 'feed', id: it.src, src: it.src, at: L.fd[it.id] });
    }
    L.t = end;
    const dl = C.live.deadline;
    if (dl && !L.late && !ST.solved && L.t > dl.at) {
      L.late = true;
      const who = dl.who || T('팀장'), msg = dl.miss || T`${dl.label || T('기한')}이 지났다.`;
      L.fx.push({ t: dl.at, who, msg, late: true });
      news.push({ who, msg, app: ok(dl.need) ? dl.label || T('기한') : feedName(firstFeed()), late: true, at: dl.at, t: 'feed', id: firstFeed(), src: firstFeed() }); // 누르면 그 말이 적힌 단톡방으로 (몰랐던 기한은 이름을 대지 않는다)
    }
    save();
    renderBar();
    if (!news.length) return;
    notify(news);
    const o = ST.view.open; // 보고 있는 단톡방을 먼저 그려야 탭의 안 읽은 수가 맞다
    if (o && (o.t === 'feed' || o.t === 'req')) { const pr = $('#paneRead'), top = pr ? pr.scrollTop : 0; renderRead(); if (pr && o.t === 'req') pr.scrollTop = top; } // 단톡방의 굴림은 renderRead 가 맡는다
    renderTabs(); renderList(); renderNotebook();
  }
  let NOTEGEN = 0;
  function newBelow(pr) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'lv-more'; b.textContent = T('새 메시지 ↓');
    pr.appendChild(b);
    const off = () => { if (pr.scrollHeight - pr.clientHeight - pr.scrollTop < 40) { b.remove(); pr.removeEventListener('scroll', off); } };
    pr.addEventListener('scroll', off, { passive: true });
  }
  // 새 소식: 화면 오른쪽 위에 휴대폰 알림처럼 (누르면 그곳으로)
  function notify(news) {
    const box = statusBox('lvNotes', 'lv-notes');
    const gen = NOTEGEN, now = ST.live.t;
    news = news.map((n, i) => [n, i]).sort((a, b) => (a[0].at ?? now) - (b[0].at ?? now) || a[1] - b[1]).map(x => x[0]); // 온 차례대로, 각자 온 시각을 달고
    const cap = window.matchMedia && matchMedia('(max-width:560px) and (orientation:portrait)').matches ? 1 : 3; // 휴대폰 세로: 한 장씩 (석 장이면 화면 반을 덮고 손가락에 걸린다)
    const more = news.length - cap; // 한꺼번에 너무 많이 오면 앞의 것은 접고 「+N」 — 회신(서류가 열리는 것)과 기한 알림은 접지 않는다
    if (more > 0) { const keep = new Set(news.filter(n => n.late || n.t === 'doc').slice(-cap)); news.slice().reverse().forEach(n => { if (keep.size < cap) keep.add(n); }); news = news.filter(n => keep.has(n)); }
    news.forEach((n, i) => setTimeout(() => {
      if (!C || !box.isConnected || gen !== NOTEGEN) return;
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'lv-note' + (n.late ? ' late' : '');
      if (n.t) { el.dataset.lvT = n.t; el.dataset.lvId = n.id || ''; el.dataset.lvSrc = n.src || ''; }
      el.innerHTML = `<span class="lv-app"><span>${esc(n.app || '')}${i === 0 && more > 0 ? T` <small>외 ${more}건</small>` : ''}</span><time>${esc(ltime(n.at ?? now))}</time></span><b>${esc(n.who)}</b><span class="lv-msg">${esc(trunc(n.msg, 70))}</span>`;
      box.appendChild(el); swipeAway(el);
      while (box.children.length > cap) box.firstChild.remove();
      requestAnimationFrame(() => el.classList.add('on'));
      // 마우스를 올려 읽고 있거나 초점이 있는 알림은 붙들어 둔다 (손을 떼면 조금 뒤에 걷힌다)
      let held = 0;
      const gone = () => { if (!el.isConnected) return; if ((el.matches(':hover') && held++ < 3) || el === document.activeElement || el.classList.contains('drag')) return void setTimeout(gone, 1500); el.classList.remove('on'); setTimeout(() => el.remove(), 400); };
      setTimeout(gone, cap === 1 ? 4500 : 6500);
      if (i === 0) {
        sfx(n.late ? 'miss' : 'buzz');
        if (S.sound && navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) try { navigator.vibrate([90, 60, 90]); } catch (e) { /* not allowed */ }
      }
    }, i * 450));
  }
  // 알림은 위로(또는 옆으로) 밀어 치운다 — 실제 휴대폰 배너처럼. 끌었다 놓은 것은 누른 것으로 치지 않는다
  function swipeAway(el) {
    let id = null, x0 = 0, y0 = 0, dx = 0, dy = 0;
    el.addEventListener('pointerdown', e => { if (e.button) return; id = e.pointerId; x0 = e.clientX; y0 = e.clientY; dx = dy = 0; delete el.dataset.moved; });
    el.addEventListener('pointermove', e => {
      if (e.pointerId !== id) return;
      dx = e.clientX - x0; dy = e.clientY - y0;
      if (!el.classList.contains('drag')) { if (Math.hypot(dx, dy) < 8) return; el.classList.add('drag'); el.dataset.moved = '1'; try { el.setPointerCapture(id); } catch (err) { /* gone */ } }
      const side = Math.abs(dx) > -dy;
      el.style.transform = side ? `translateX(${dx}px)` : `translateY(${Math.min(dy, 0)}px)`;
      el.style.opacity = Math.max(0.2, 1 - (side ? Math.abs(dx) / 260 : -dy / 110));
    });
    const up = e => {
      if (e.pointerId !== id) return;
      id = null;
      if (!el.classList.contains('drag')) return;
      el.classList.remove('drag');
      const side = Math.abs(dx) > -dy;
      if (side ? Math.abs(dx) > 80 : dy < -30) {
        el.style.transform = side ? `translateX(${dx > 0 ? 110 : -110}%)` : 'translateY(-130%)';
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 280);
      } else { el.style.transform = ''; el.style.opacity = ''; }
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('keydown', e => { // 키보드로 알림에 와 있으면 Esc 로 치운다 (옆 알림이 있으면 그리로)
      if (e.key !== 'Escape') return;
      e.preventDefault(); e.stopPropagation();
      const sib = el.nextElementSibling || el.previousElementSibling;
      el.remove(); if (sib) sib.focus(); else land(['#paneList .item.on', '#srcTabs .tab.on']); // 마지막 알림이었으면 보던 자리로
    });
  }
  function clearNotes() { NOTEGEN++; const b = $('#lvNotes'); if (b) b.innerHTML = ''; } // 아직 뜰 차례를 기다리던 알림도 거둔다
  function nextDue() {
    if (!liveOn()) return null;
    const L = ST.live, c = [];
    reqItems().forEach(r => { const q = L.req[r.id]; if (q && q.st === 'wait' && q.due > L.t - 1) c.push(Math.max(q.due, L.t)); }); // 사건 자료에 없는 옛 신청은 세지 않는다
    feedItems().forEach(it => { if (!(it.id in L.fd) && (it.at || 0) > L.t && ok(lvAll(it.need))) c.push(it.at); });
    // 시각 조건('@분')이 붙은 것들 — 문서·사람·도구·신청서·단톡방 말(시각 없이 조건만 있는 것)·사진 장면과 지점·대조 묶음·지도 지점·조회 기록
    const timed = [...Object.values(C.docs), ...Object.values(C.people), ...C.sources, ...reqItems(), ...feedItems().filter(it => !(it.id in L.fd))];
    C.sources.forEach(s => { (s.scenes || []).forEach(x => { timed.push(x, ...(x.spots || [])); }); timed.push(...(s.sets || []), ...(s.spots || []), ...(s.records || [])); });
    timed.forEach(x => (x.need || []).forEach(n => { if (n[0] === '@' && +n.slice(1) > L.t && ok(lvAll(x.need))) c.push(+n.slice(1)); }));
    return c.length ? Math.min(...c) : null;
  }
  // 다음 것을 기다리면 (보이는) 기한을 넘기게 되는가
  function waitsPast() {
    if (!liveOn() || ST.solved || ST.live.late) return false;
    const dl = C.live.deadline, nd = nextDue();
    return !!(dl && ok(dl.need) && nd != null && ST.live.t <= dl.at && nd > dl.at);
  }
  function waitNext() {
    const d = nextDue();
    if (d == null || ST.solved) { toast(T('지금은 기다릴 것이 없다')); renderBar(); return; }
    const prev = ST.live.t;
    ST.live.t = Math.max(ST.live.t, d);
    sfx('page');
    toast(T`${hm(ST.live.t - prev)}이 지났다`);
    liveSync(prev);
    renderList(); renderRead();
  }
  // 화면 아래 줄: 수사 시계 · 기한 · 기다리기
  function liveBar() {
    const L = ST.live, dl = C.live.deadline && ok(C.live.deadline.need) ? C.live.deadline : null, t = L.t, nd = nextDue(); // 기한은 need 가 채워져야 보인다
    const left = dl ? dl.at - t : 0;
    const waits = Object.values(L.req).filter(q => q.st === 'wait').map(q => q.due);
    const pend = waits.length && nd === Math.min(...waits); // 「회신 기다리기」는 다음에 오는 것이 회신일 때만 (먼저 단톡방 말이 끼면 「시간 보내기」)
    const over = waitsPast(); // 이번 기다림이 기한을 넘긴다: 단추를 붉게, 한 번 더 눌러야 간다
    const d0 = liveDate(0), d1 = liveDate(t), dday = Math.round((new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()) - new Date(d0.getFullYear(), d0.getMonth(), d0.getDate())) / 864e5); // 달력 날짜로 센다 (자정을 넘기면 D+1)
    return `<div class="scr-bar live"><span class="lv-clock"><b>D+${dday}</b> ${esc(lstamp(t))}</span>${dl ? `<span class="lv-dl${ST.solved ? ' done' : left < 0 ? ' over' : left < 360 ? ' hot' : ''}">${esc(dl.label || T('기한'))} · ${ST.solved ? T('종결') : left >= 0 ? T`${hm(left)} 남음` : T`${hm(-left)} 넘김`}</span>` : ''}${nd != null && !ST.solved ? `<button type="button" class="lv-wait${over ? ' over' : ''}" data-wait>${pend ? T('회신 기다리기') : T('시간 보내기')} · ${hm(nd - t)}${over ? T(' · 기한 넘김') : ''}</button>` : ''}</div>`;
  }
  function renderBar() {
    if (!liveOn()) return;
    const b = $('.scr-bar.live');
    if (!b) return;
    const was = ($('.scr-bar.live .lv-clock') || {}).textContent;
    b.outerHTML = liveBar();
    const c = $('.scr-bar.live .lv-clock'); // 수사 시각이 넘어가는 순간 시계가 잠깐 밝아진다
    if (c && was && c.textContent !== was) { c.classList.add('tick'); if (stepMin) c.insertAdjacentHTML('beforeend', `<span class="lv-step" aria-hidden="true">+${esc(hm(stepMin))}</span>`); }
    stepMin = 0;
  }
  const NEWSR = id => (ST.seen.includes(id) ? '' : T('<span class="sr"> (새 자료)</span>')); // 붉은 점은 눈에만 보이니
  const feedCount = s => { const L = ST.live; return L ? (s.items || []).filter(it => it.id in L.fd && !it.me).length + L.fx.filter(x => (x.src || firstFeed()) === s.id).length : 0; }; // 내가 보낸 말은 안 읽은 말이 아니다
  const feedUnread = s => { const o = ST.view.open; if (!ST.live || (o && o.t === 'feed' && o.id === s.id)) return 0; return Math.max(0, feedCount(s) - ((ST.live.rd || {})[s.id] || 0)); }; // 보고 있는 방은 다 읽은 것
  const reqUnread = s => (s.items || []).filter(r => { const q = reqState(r.id); return q && q.st === 'done' && C.docs[r.doc] && !ST.seen.includes(r.doc); }).length;

  function feedHtml(s) {
    if (!s || !ST.live) return '';
    const L = ST.live;
    const rows = [...(s.items || []).filter(it => it.id in L.fd).map((it, i) => ({ t: L.fd[it.id], i, it })),
      ...L.fx.filter(x => (x.src || firstFeed()) === s.id).map((x, i) => ({ t: x.t, i: i - 1000, x }))].sort((a, b) => a.t - b.t || a.i - b.i); // 같은 시각이면 회신 알림이 먼저
    if ((L.rd ||= {})[s.id] !== feedCount(s)) { L.rd[s.id] = feedCount(s); save(); }
    // 방 이름의 (인원) 으로 안 읽은 사람 수: 보낸 사람과 나를 뺀 동료들이 저마다 몇 분 안에 읽는다 (수사 시각이 흐르면 줄어든다)
    const N = +(((s.title || '').match(/\((\d+)\)\s*$/) || [])[1] || 0);
    const unread = (it, t) => { let u = 0; for (let k = 0; k < N - (it.me ? 1 : 2); k++) if (L.t - t < 2 + hash(`${it.id}#${k}`) % 18) u++; return u; };
    let day = null;
    const body = rows.map(r => {
      const d = liveDate(r.t), dk = d.toDateString();
      const div = dk !== day ? (day = dk, `<p class="b-div"><span>${esc(MG.I18N.date(d, 'ymdw'))}</span></p>`) : '';
      if (r.x) return `${div}<p class="lv-sys${r.x.late ? ' late' : ''}"><time>${esc(ltime(r.t))}</time> <b>${esc(r.x.who)}</b> ${esc(r.x.msg)}${r.x.doc && C.docs[r.x.doc] ? ` <button type="button" class="lv-att" data-doc="${esc(r.x.doc)}">${T`열어 보기`}</button>` : ''}</p>`;
      const it = r.it;
      const att = it.doc && C.docs[it.doc] ? `<p class="lv-attrow${it.me ? ' me' : ''}"><button type="button" class="lv-att" data-doc="${esc(it.doc)}">${esc(it.att || T('첨부 · ') + plain(C.docs[it.doc].title))}</button></p>` : '';
      return `${div}${block({ msg: it.msg, who: it.who, me: it.me, at: ltime(r.t), unr: unread(it, r.t), f: it.f }, `${it.id}@fd`, s.name)}${att}`;
    }).join('');
    return `<article class="doc skin-${esc(s.skin || 'chat')} lv-feed"><header class="doc-h"><p class="doc-k">${esc(s.kicker || T('메신저'))}</p><h3 class="doc-t">${inline(s.title || s.name)}</h3>${s.meta ? `<p class="doc-m">${inline(s.meta)}</p>` : ''}</header>
      <div class="doc-b">${body || `<p class="res-none">${esc(s.empty || T('아직 아무 말이 없다.'))}</p>`}</div></article>`;
  }
  function feedList(s) {
    const n = feedUnread(s), L = ST.live;
    const last = (s.items || []).filter(it => it.id in L.fd).sort((a, b) => L.fd[b.id] - L.fd[a.id])[0];
    const o = ST.view.open;
    const atts = (s.items || []).filter(it => it.id in L.fd && it.doc && C.docs[it.doc]).map(it => C.docs[it.doc]);
    return `<button type="button" class="item lv-room${o && o.t === 'feed' && o.id === s.id ? ' on' : ''}${n ? ' new' : ''}" data-feed="${esc(s.id)}"><span class="item-t">${esc(s.title || s.name)}${n ? ` <span class="lv-n">${n}</span>` : ''}</span><span class="item-m">${last ? esc(`${last.who ? last.who + ': ' : ''}${trunc(plain(last.msg || ''), 40)}`) : esc(s.empty || T('아직 아무 말이 없다.'))}</span></button>
      ${atts.length ? `<p class="res-n">${T`받은 첨부`}</p>${atts.map(itemBtn).join('')}` : ''}`;
  }

  // 신청서 칸의 기다리기 단추: 아래 줄 단추처럼 다음에 오는 것이 회신일 때만 「회신」이라 하고, 기한을 넘기게 되면 붉게
  function waitRow(lab) {
    const L = ST.live, nd = nextDue();
    if (nd == null || ST.solved) return '';
    const waits = Object.values(L.req).filter(q => q.st === 'wait').map(q => q.due), pend = waits.length && nd === Math.min(...waits), over = waitsPast();
    return `<p class="lv-waitrow"><button type="button"${over ? ' class="over"' : ''} data-wait>${pend ? lab : T('시간 보내기')} · ${hm(nd - L.t)}${over ? T(' · 기한 넘김') : ''}</button></p>`;
  }
  function requestList(s) {
    const items = (s.items || []).filter(r => ok(r.need));
    if (!items.length) return `<p class="res-none">${esc(s.empty || T('아직 신청할 근거가 없다.'))}</p>`;
    const o = ST.view.open;
    const st = r => reqState(r.id);
    const btn = (r, meta, cls) => `<button type="button" class="item rq-i${cls ? ' ' + cls : ''}${o && o.t === 'req' && o.id === r.id ? ' on' : ''}" data-req="${esc(r.id)}"><span class="item-t">${esc(plain(r.title))}</span><span class="item-m">${meta}</span></button>`;
    const draft = items.filter(r => !st(r) || st(r).st === 'no'), wait = items.filter(r => st(r) && st(r).st === 'wait'), done = items.filter(r => st(r) && st(r).st === 'done');
    return `${draft.length ? `<p class="res-n">${ST.solved ? T('올리지 않은 신청서') : T('쓸 수 있는 신청서')}</p>${draft.map(r => btn(r, `${esc(r.kind || T('요청'))}${ST.solved ? '' : T` · 회신까지 약 ${hm(r.eta != null ? r.eta : 120)}`}${st(r) ? T(' · 기각됨') : ''}`, st(r) ? 'no' : '')).join('')}` : ''}
      ${wait.length ? `<p class="res-n">${T`회신 기다리는 중`}</p>${wait.map(r => btn(r, T`회신 예정 ${esc(lstamp(st(r).due))}`, 'wait')).join('')}${waitRow(T('회신 기다리기'))}` : ''}
      ${done.length ? `<p class="res-n">${T`도착한 회신`}</p>${done.map(r => (C.docs[r.doc] ? itemBtn(C.docs[r.doc]) : '')).join('')}` : ''}`;
  }
  function requestHtml(r) {
    if (!r || !ST.live) return '';
    const L = ST.live, q = reqState(r.id), notes = ST.notes, why = (r.why || []).length;
    const row = (k, v) => (v ? `<tr><th>${esc(k)}</th><td>${inline(v)}</td></tr>` : '');
    let foot;
    if (q && q.st === 'wait') foot = `<p class="rq-stamp" aria-hidden="true"><span>${T`접수`}</span></p><p class="rq-st">${T`접수 ${esc(lstamp(q.at))} · ${ST.solved ? T('회신 전에 사건 종결') : T`회신 예정 ${esc(lstamp(q.due))} <small>(${hm(q.due - L.t)} 뒤)</small>`}`}</p>${ST.solved ? '' : waitRow(T('회신 기다리기'))}`;
    else if (q && q.st === 'done') foot = `<p class="rq-stamp ok" aria-hidden="true"><span>${T`회신`}</span></p><p class="rq-st">${T`회신 ${esc(lstamp(q.due))}`}</p>${C.docs[r.doc] ? itemBtn(C.docs[r.doc]) : ''}`;
    else if (ST.solved) foot = `${q && q.st === 'no' ? `<p class="rq-no">${T`<b>기각</b> ${inline(r.deny || T('소명이 부족하다.'))} <small>${esc(lstamp(q.at))}</small>`}</p>` : ''}<p class="rq-st">${T`${q ? T('다시 올리기 전에') : T('올리기 전에')} 사건 종결`}</p>`; // 종결된 사건에는 신청할 것이 없다
    else {
      const sel = tmp().rq[r.id] != null ? tmp().rq[r.id] : ''; // 신청서마다 고른 소명 메모 (올리기 전)
      const pick = !why ? '' : `<section class="rq-why"><h4 id="rqh-${esc(r.id)}">${T`소명 자료 <small>이 요청이 왜 필요한지 보여 줄 메모 하나</small>`}</h4>${notes.length ? `<div role="radiogroup" aria-labelledby="rqh-${esc(r.id)}">` + noteGroups(notes).map(g => `<details class="rep-grp" open><summary>${esc(g.src)} <small>${g.items.length}</small></summary>${g.items.map(([n, j]) => `<label class="rep-opt${String(sel) === String(n.id) ? ' on' : ''}"><input type="radio" name="rq-${esc(r.id)}" value="${n.id}" data-rq-pick="${esc(r.id)}"${String(sel) === String(n.id) ? ' checked' : ''}><span class="n">${j + 1}.</span> <span class="t">${esc(n.t)}</span></label>`).join('')}</details>`).join('') + '</div>' : T('<p class="rep-empty">수첩에 메모가 없다. 근거가 될 문장을 먼저 적어 둔다.</p>')}</section>`;
      const no = q && q.st === 'no' ? `<p class="rq-no">${T`<b>기각</b> ${inline(r.deny || T('소명이 부족하다.'))} <small>${esc(lstamp(q.at))}</small>`}</p>` : '';
      foot = `${no}${pick}<p class="submit-row"><button type="button" class="btn-hand" data-rq-go="${esc(r.id)}">${esc(r.button || (q ? T('다시 신청하기') : T('신청서 올리기')))}</button><span class="c-msg"></span></p>`;
    }
    return `<article class="doc skin-${esc(r.skin || 'form')} rq"><header class="doc-h"><p class="doc-k">${esc(r.kind || T('수사 요청'))}</p><h3 class="doc-t">${inline(r.title)}</h3>${r.meta ? `<p class="doc-m">${inline(r.meta)}</p>` : ''}</header>
      <div class="doc-b">${blocks(r.intro, `${r.id}@i`, plain(r.title))}<table class="rq-t"><tbody>${row(T('신청'), r.by || T('강력2팀'))}${row(T('수신'), r.to)}${row(T('대상'), r.target)}${row(T('요청 내용'), r.what)}${row(T('회신까지'), r.eta != null ? T('약 ') + hm(r.eta) : '')}</tbody></table>${foot}</div></article>`;
  }
  function submitReq(id) {
    const r = reqById(id);
    if (!r || !liveOn() || ST.solved) return;
    const L = ST.live, q = reqState(id);
    if (q && q.st !== 'no') return;
    const why = (r.why || []).length;
    const n = why ? ST.notes.find(x => String(x.id) === String(tmp().rq[id])) : null;
    if (why && !n) { sayMsg(T('소명 자료로 붙일 메모를 먼저 고른다.')); sfx('miss'); return; }
    if (n && q && q.st === 'no' && String(q.note) === String(n.id)) { sayMsg(T('방금 기각된 그 소명 그대로다. 다른 메모를 붙여야 한다.')); sfx('miss'); return; } // 같은 신청서를 또 올려 시간만 쓰지 않게
    const prev = L.t;
    L.t += lcost('write') + (q && lv() >= 5 ? 60 : 0);
    stepMin += L.t - prev;
    const eta = r.eta != null ? r.eta : 120;
    if (!why || r.why.includes(n.f)) {
      L.req[id] = { st: 'wait', at: L.t, due: L.t + eta, note: n ? n.id : null, tries: q ? q.tries || 0 : 0 };
      cue('unlock', r.stamp || T('접수'));
      toast(eta ? T`접수됐다 · 회신 예정 ${lstamp(L.t + eta)}` : T('접수됐다'));
    } else {
      L.req[id] = { st: 'no', at: L.t, note: n.id, tries: (q ? q.tries || 0 : 0) + 1 };
      cue('miss');
      { const w = /^(ko|ja|zh)/.test(MG.I18N.lang) ? 1 : 2.4, ss = plain(r.deny || T('소명이 부족하다.')).split(/(?<=[.?!])\s|(?<=[。？！])/), why1 = ss[0] + (ss[1] && ss[1].length <= 45 * w ? (/^(ja|zh)/.test(MG.I18N.lang) ? '' : ' ') + ss[1] : ''); toast(T('기각 — ') + (why1.length > 100 * w ? trunc(why1, 100 * w) : why1), Math.min(9000, 4000 + why1.length * 40 / w)); } // 글자가 넓게 퍼지는 언어는 같은 말이 두세 배 길다 // 사유는 첫 문장까지 (전문은 신청서에)
    }
    delete tmp().rq[id];
    save(); liveSync(prev); renderTabs(); renderList(); renderRead();
    const st = L.req[id].st === 'wait' && $('#paneRead .rq-stamp');
    if (st) st.classList.add('fresh'); // 서류의 접수 도장은 화면 가운데 큰 도장이 걷힐 때 찍힌다
  }

  /* ───────── panes ───────── */
  const itemBtn = d => {
    const o = ST.view.open;
    const on = o && o.t === 'doc' && o.id === d.id;
    return `<button type="button" class="item${on ? ' on' : ''}${ST.seen.includes(d.id) ? '' : ' new'}" data-doc="${d.id}"><span class="item-t">${esc(plain(d.title))}${NEWSR(d.id)}</span>${d.meta ? `<span class="item-m">${esc(plain(d.meta))}</span>` : ''}</button>`;
  };
  // 자료실의 「수첩의 단어로 찾기」: 찾아본 단어는 탐문에서 물어본 단어처럼 흐리게. 단, 그 단어로 걸리는 자료 가운데 안 읽은 것이 생기면 다시 진하게
  const keyChips = s => { const sq = (ST.view.sq || {})[s.id] || []; return ST.keys.filter(k => C.keywords[k]).map(k => { const L = C.keywords[k].label, done = sq.includes(norm(L)) && archiveHits(s, L).every(d => ST.seen.includes(d.id)); return `<button type="button" class="chip${done ? ' done' : ''}" data-search="${k}">${esc(L)}${done ? T('<span class="sr"> (찾아봄)</span>') : ''}</button>`; }).join(''); };

  function matchKeys(q) {
    const n = norm(q);
    if (!n) return [];
    const f = flipWords(q), nf = f == null ? '' : norm(f); // 성·이름을 거꾸로 쳐도 (Seo-yun Han) 이름 전체가 맞으면 찾힌다
    // 수첩에 적은 단어는 일부만 쳐도 찾히고, 아직 모르는 단어는 온전히 쳐야만 찾힌다 (추적을 건너뛰지 못하게).
    // 로마자·키릴 문자로만 된 세 글자 이하 별칭(S.C., Ann)은 다른 언어에서 낱말 속에 섞여 걸리므로 통째로 쳐야 한다.
    const inside = l => l.length >= 2 && (MG.I18N.lang === 'ko' || l.length >= 4 || !/^[a-zа-яёäöüßéè]+$/.test(l)) && n.includes(l);
    return Object.entries(C.keywords).filter(([id, k]) => {
      const labels = [k.label, ...(k.alias || [])].map(norm).filter(Boolean);
      if (!ST.keys.includes(id)) return labels.some(l => l === n || l === nf || inside(l));
      return labels.some(l => l === n || l === nf || (n.length >= 2 && l.includes(n)) || inside(l));
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
      const scr = C.frame !== 'papers'; // 화면 속 검색창은 소프트웨어의 말투, 종이 자료실은 서고 담당의 말투
      res = hits.length ? `<p class="res-n">${scr ? T`'${esc(q)}' 검색 결과 ${hits.length}건` : T`「${esc(q)}」 ${hits.length}건`}</p>${hits.map(itemBtn).join('')}` : `<p class="res-none">${scr ? T`'${esc(q)}'에 대한 검색 결과가 없습니다.` : T`「${esc(q)}」에 해당하는 자료가 없다.`}</p>`;
    }
    const start = (s.start || []).map(id => C.docs[id]).filter(d => d && ok(d.need));
    const chips = keyChips(s);
    return `<div class="arch"><form class="arch-f" data-arch="${esc(s.id)}" role="search"><input id="aq-${esc(s.id)}" value="${esc(q)}" placeholder="${esc(s.placeholder || T('찾을 단어'))}" aria-label="${T`${esc(s.name)} 검색어`}" autocomplete="off"><button type="submit">${C.frame !== 'papers' ? T('검색') : T('찾기')}</button></form>
      ${chips ? `<p class="chips-t">${T`수첩의 단어로 찾기`}</p><div class="chips">${chips}</div>` : ''}
      <div class="res">${res}</div>
      ${start.length ? `<p class="res-n">${esc(s.startLabel || T('처음부터 있던 자료'))}</p>${start.map(itemBtn).join('')}` : ''}</div>`;
  }
  function listList(s) {
    const docs = C._srcDocs[s.id].filter(d => ok(d.need));
    return docs.length ? docs.map(itemBtn).join('') : `<p class="res-none">${esc(s.empty || T('아직 아무것도 없다.'))}</p>`;
  }
  function peopleList(s) {
    const ps = Object.values(C.people).filter(p => p.src === s.id && personVisible(p));
    const o = ST.view.open;
    if (!ps.length) return `<p class="res-none">${esc(s.empty || T('아직 찾아갈 사람이 없다. 이름을 알아내야 한다.'))}</p>`;
    return ps.map(p => `<button type="button" class="item person${o && o.t === 'person' && o.id === p.id ? ' on' : ''}${ST.asked[p.id] ? '' : ' new'}" data-person="${p.id}">${portrait(p)}<span class="item-t">${esc(p.name)}${ST.asked[p.id] ? '' : T('<span class="sr"> (아직 안 만남)</span>')}</span>${p.role ? `<span class="item-m">${esc(plain(p.role))}</span>` : ''}</button>`).join('');
  }
  // 지도: 목록 칸에는 작은 지도(점만), 아무것도 펼치지 않았을 때는 읽기 칸에 크게(이름까지)
  function mapHtml(s, big) {
    const spots = (s.spots || []).filter(sp => ok(sp.need));
    return `<div class="map${big ? ' big' : ''}">${art(s.art)}${spots.map(sp => `<button type="button" class="spot${+sp.x < 22 ? ' at-l' : +sp.x > 78 ? ' at-r' : ''}" style="left:${+sp.x}%;top:${+sp.y}%" data-spot="${esc(sp.id)}" aria-label="${esc(sp.label)}" data-tip="${esc(sp.label)}"><span>${esc(sp.label)}</span></button>`).join('')}</div>`;
  }
  function mapList(s) {
    const spots = (s.spots || []).filter(sp => ok(sp.need));
    return `${mapHtml(s)}
      ${spots.map(sp => { const d = C.docs[sp.doc]; return d ? itemBtn(d) : ''; }).join('')}`;
  }

  const tabBadge = s => { const n = s.type === 'feed' ? feedUnread(s) : s.type === 'request' ? reqUnread(s) : 0; return n ? `<span class="tab-n" aria-label="${T`새 소식 ${n}`}">${n}</span>` : ''; };
  // 탭마다 지금 보이는 항목 ('@' = 탭 자체). 새로 열린 자료가 어느 탭에 생겼는지 점으로 알리는 데 쓴다
  function srcKeys(s) {
    if (!srcVisible(s)) return [];
    const k = ['@'], add = (list, pass) => (list || []).forEach(x => { if (pass(x)) k.push(x.id); });
    if (s.type === 'list' && srcOpen(s)) add(C._srcDocs[s.id], d => ok(d.need));
    else if (s.type === 'map') add(s.spots, x => ok(x.need));
    else if (s.type === 'compare') add(s.sets, x => ok(x.need));
    else if (s.type === 'photo') add(s.scenes, x => ok(x.need));
    else if (s.type === 'people') add(Object.values(C.people), p => p.src === s.id && personVisible(p));
    return k;
  }
  function renderTabs() {
    const vis = C.sources.filter(srcVisible);
    if (!vis.find(s => s.id === ST.view.src)) ST.view.src = vis[0] && vis[0].id;
    const bar = $('#srcTabs');
    // 다른 탭에 새 자료가 생기면 탭에 작은 점 (그 탭을 열면 지워진다). 처음 열 때 이미 있던 것은 조용히
    const kn = (ST.view.known ||= {}), first = !Object.keys(kn).length;
    const fresh = s => {
      const k = srcKeys(s);
      if (first || s.id === ST.view.src) { kn[s.id] = k; return false; }
      const was = kn[s.id] || [];
      return k.some(x => !was.includes(x));
    };
    if (first) C.sources.forEach(s => { kn[s.id] = srcKeys(s); });
    bar.innerHTML = vis.map(s => { const b = tabBadge(s); return `<button type="button" role="tab" class="tab${s.id === ST.view.src ? ' on' : ''}" aria-selected="${s.id === ST.view.src}" tabindex="${s.id === ST.view.src ? 0 : -1}" aria-controls="paneList" id="tab-${esc(s.id)}" data-src="${esc(s.id)}"><span class="tab-t">${esc(s.name)}</span>${s.lock && !ST.unl.includes(s.id) ? T('<span class="tab-lock">잠김</span>') : ''}${b || (fresh(s) ? T('<span class="tab-new" role="img" aria-label="새로 열린 자료"></span>') : '')}</button>`; }).join('');
    tabShow(bar);
    tabEdge(bar);
    const pl = $('#paneList'); if (pl && ST.view.src) { pl.setAttribute('aria-labelledby', 'tab-' + ST.view.src); } // 목록 칸 = 고른 탭의 내용
  }
  // 탭 이름이 긴 말(영어·독일어·러시아어)이라 넓은 화면에서도 넘치면: 고르지 않은 탭의 긴 이름부터 줄여 한 줄에 다 보이게 하고, 줄인 탭에는 온 이름을 말풍선으로
  function tabFit(bar) {
    bar.classList.remove('t1', 't2');
    if (bar.clientWidth >= 600 && bar.scrollWidth > bar.clientWidth + 1) { bar.classList.add('t1'); if (bar.scrollWidth > bar.clientWidth + 1) bar.classList.add('t2'); }
    bar.querySelectorAll('.tab').forEach(t => { const x = t.querySelector('.tab-t'); if (x && x.scrollWidth > x.clientWidth + 1) t.dataset.tip = x.textContent; else delete t.dataset.tip; });
  }
  // 탭이 넘쳐 옆으로 밀리는 좁은 화면: 고른 탭이 가려져 있으면 보이는 데까지 민다 (화면을 돌려 폭이 바뀌어도)
  function tabShow(bar) {
    if (bar) tabFit(bar);
    const on = bar && bar.querySelector('.tab.on');
    if (!on || bar.scrollWidth <= bar.clientWidth) return;
    const b = bar.getBoundingClientRect(), r = on.getBoundingClientRect();
    if (r.left < b.left + 8) bar.scrollLeft -= b.left + 8 - r.left;
    else if (r.right > b.right - 8) bar.scrollLeft += r.right - (b.right - 8);
  }
  // 가려진 탭이 남은 쪽 끝을 흐리게 한다 (옆으로 밀면 더 있다는 표시)
  function tabEdge(bar) {
    if (!bar) return;
    const x = Math.abs(bar.scrollLeft), m = bar.scrollWidth - bar.clientWidth;
    bar.classList.toggle('more-l', x > 2);
    bar.classList.toggle('more-r', x < m - 2);
    // 새 자료 점이 찍힌 탭이 가려져 있으면, 그쪽 끝에 작은 점을 따로 띄운다 (좁은 화면에서 옆으로 밀어 볼 곳을 알려 준다)
    const scr = bar.parentElement, b = bar.getBoundingClientRect();
    if (!scr || !scr.querySelector || !b.width) return;
    const dots = [...bar.querySelectorAll('.tab-new')].map(d => d.getBoundingClientRect());
    scr.classList.toggle('new-r', x < m - 2 && dots.some(r => r.left > b.right - 24));
    scr.classList.toggle('new-l', x > 2 && dots.some(r => r.right < b.left + 24));
    scr.style.setProperty('--tabs-mid', Math.round(bar.offsetTop + bar.offsetHeight / 2) + 'px');
  }
  // 옆으로 넘는 표(폰): 오른쪽에 붙은 ✎ 칸에 문서 종이 빛깔을 깔고(밑으로 지나가는 글자가 ✎ 와 겹치지 않게),
  // 뒤로 더 있으면 그 칸 가장자리에 그늘을 드리운다 (폰에서는 가로 스크롤 막대가 숨어 있어 표가 더 있는 줄 모른다)
  function tblEdge(t) {
    const m = t.scrollWidth - t.clientWidth, x = Math.abs(t.scrollLeft);
    t.classList.toggle('scrolls', m > 2);
    t.classList.toggle('more-r', m > 2 && x < m - 2);
    if (m > 2 && !t.style.getPropertyValue('--pc-bg')) {
      for (let e = t.parentElement; e && e !== document.body; e = e.parentElement) {
        const c = getComputedStyle(e).backgroundColor, a = c.match(/rgba?\(([^)]+)\)/);
        const v = a ? a[1].split(',').map(Number) : null;
        if (v && (v.length < 4 || v[3] > 0.6)) { const i = getComputedStyle(e).backgroundImage; t.style.setProperty('--pc-bg', `rgb(${v[0]},${v[1]},${v[2]})`); if (i && i !== 'none') t.style.setProperty('--pc-bgi', i); break; } // 종이 결(무늬)도 같이
      }
    }
  }
  // 세로쓰기 신문: 오른쪽에서 왼쪽으로 읽어 나가므로, 왼쪽에 기사가 더 있으면 그쪽 끝을 흐린다 (다 읽어 가면 오른쪽 끝을)
  function colEdge(b) {
    const m = b.scrollWidth - b.clientWidth, x = Math.abs(b.scrollLeft);
    b.classList.toggle('more-l', m > 2 && x < m - 2);
    b.classList.toggle('more-r', m > 2 && x > 2);
  }
  // 지도 위 그림 이름표가 조사 지점(빨간 점·점 이름)에 깔리면 그 이름표는 접어 둔다 — 폰의 작은 지도에서 글자가 겹쳐 뭉개지지 않게 (크게 보기에는 다 나온다)
  function mapTidy() {
    $$('.case-view .map').forEach(m => {
      const labs = $$('.art-lab', m);
      // 점 이름이 다른 점·이름표에 깔리거나 지도 밖으로 나가면, 아래 · 위 · 오른쪽 · 왼쪽 가운데 가장 덜 겹치는 자리로 옮긴다
      const sps = $$('.spot', m), box = m.getBoundingClientRect(), POS = ['lab-up', 'lab-r', 'lab-l'];
      const hit = (r, b, pad) => r.left < b.right + pad && r.right > b.left - pad && r.top < b.bottom + pad && r.bottom > b.top - pad;
      const area = (r, b) => Math.max(0, Math.min(r.right, b.right) - Math.max(r.left, b.left)) * Math.max(0, Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top));
      sps.forEach(sp => sp.classList.remove(...POS));
      sps.forEach(sp => {
        const lab = sp.querySelector('span'); if (!lab || lab.offsetParent === null) return;
        const cost = () => { const r = lab.getBoundingClientRect(); return sps.filter(o => o !== sp).flatMap(o => [o, o.querySelector('span')]).filter(e => e && e.offsetParent !== null).reduce((n, e) => n + area(r, e.getBoundingClientRect()), 0) + (r.width * r.height - area(r, box)) * 2; };
        let best = '', low = cost();
        if (!low) return;
        POS.forEach(c => { sp.classList.add(c); const v = cost(); sp.classList.remove(c); if (v < low) { low = v; best = c; } });
        if (best) sp.classList.add(best);
      });
      if (!labs.length) return;
      labs.forEach(l => l.classList.remove('hid'));
      const pad = 2, spots = $$('.spot', m).flatMap(sp => [sp, sp.querySelector('span')]).filter(e => e && e.offsetParent !== null).map(e => e.getBoundingClientRect());
      labs.forEach(l => { const r = l.getBoundingClientRect(); if (r.width && spots.some(b => hit(r, b, pad))) l.classList.add('hid'); });
    });
  }
  // 읽기 칸의 넘치는 것들을 다시 잰다 (그림·글꼴이 늦게 와 너비가 바뀐 때도)
  function edges() { mapTidy(); const el = $('#paneRead'); if (!el) return; $$('.b-tbl', el).forEach(tblEdge); $$('.skin-news.vertical .doc-b', el).forEach(colEdge); }
  function renderList() {
    const s = curSrc();
    const el = $('#paneList');
    if (!s) { el.innerHTML = ''; return; }
    const dsc = s.descOpen && s.lock && srcOpen(s) ? s.descOpen : s.desc; // 잠금을 푼 뒤의 안내 (「다시 로그인해야 한다」가 남지 않게)
    let h = dsc ? `<p class="src-desc">${inline(dsc)}</p>` : '';
    if (s.type === 'archive') h += archiveList(s);
    else if (s.type === 'list') h += srcOpen(s) ? listList(s) : lockHtml(s.id, s.lock, s.name);
    else if (s.type === 'people') h += peopleList(s);
    else if (s.type === 'map') h += mapList(s);
    else if (s.type === 'cipher') h += `<button type="button" class="item" data-open-cipher="${esc(s.id)}"><span class="item-t">${esc(s.openLabel || T('해독지 펼치기'))}</span></button>`;
    else if (s.type === 'timeline') h += `<button type="button" class="item" data-open-tl="${esc(s.id)}"><span class="item-t">${ST.unl.includes(s.id) ? IC_TICK + ' ' : ''}${esc(s.openLabel || T('재구성 판 펼치기'))}</span></button>`;
    else if (s.type === 'compare') h += compareList(s);
    else if (s.type === 'query') h += queryList(s);
    else if (s.type === 'photo') h += photoList(s);
    else if (s.type === 'request') h += requestList(s);
    else if (s.type === 'feed') h += feedList(s);
    el.innerHTML = h;
    el.dataset.type = s.type;
    if (s.type === 'map') mapTidy();
    if (NUDGE) renderNudge(); // 짚은 곳을 해냈으면 수첩의 쪽지를 거둔다
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
    else if (o && o.t === 'req' && reqById(o.id)) h = requestHtml(reqById(o.id));
    else if (o && o.t === 'feed' && C.sources.find(s => s.id === o.id)) h = feedHtml(C.sources.find(s => s.id === o.id));
    else if (curSrc() && curSrc().type === 'map' && srcOpen(curSrc()) && !narrow()) { const s = curSrc(); h = `<div class="map-read">${s.desc ? `<p class="map-desc">${inline(s.desc)}</p>` : ''}${mapHtml(s, true)}</div>`; }
    else h = `<div class="read-empty"><p>${inline(C.emptyRead || T('왼쪽에서 자료를 고르면 여기에 펼쳐진다.'))}</p></div>`;
    // 보던 단톡방에 새 말이 오면: 맨 아래를 보고 있었으면 따라 내려가고, 위의 말을 읽던 중이면 그 자리에 두고 「새 메시지 ↓」만 (메신저처럼)
    const rows = () => { const b = el.querySelector('.lv-feed .doc-b'); return b ? b.children.length : 0; };
    const fd = o && o.t === 'feed' && el.dataset.fd === o.id ? { low: el.scrollHeight - el.clientHeight - el.scrollTop < 80, n: rows(), pill: !!el.querySelector('.lv-more') } : null;
    el.innerHTML = `<button type="button" class="back-list" data-back>${T`← 목록으로`}</button>${h}`;
    el.dataset.fd = o && o.t === 'feed' ? o.id : '';
    if (fd && (rows() > fd.n || fd.pill)) { if (fd.low) el.scrollTop = el.scrollHeight; else newBelow(el); }
    $('#stageBody').classList.toggle('reading', !!(o && h));
    edges();
  }

  /* ───────── 수사 보고서 (읽기 칸에 넓게) ───────── */
  let REPOPEN = null; // 메모 고르기가 펼쳐진 주장
  let PTR = false; // 마지막 손길이 마우스·손가락이었나 (키보드면 false)
  const FORM = () => Object.assign({ title: T('수사 보고서'), culprit: T('범인은'), short: T('범인'), submit: T('보고서 올리기'), open: T('보고서 펼쳐 쓰기'), lead: T('범인을 고르고, 주장마다 증거가 될 메모를 하나씩 붙인다.'), judging: T('보고서를 올렸다. 팀장이 한 장씩 넘긴다…') }, C.solution.form || {});
  // 결말 끝줄의 「→ …」 는 눌러서 기록실로 돌아가는 단추 (빨간 손글씨 그대로)
  function nextHtml(t) {
    const i = t.lastIndexOf('→'), head = i >= 0 ? t.slice(0, i).trimEnd() : t, go = i >= 0 ? t.slice(i) : T('→ 기록실로');
    return `<p class="epi-next">${head ? inline(head) + ' ' : ''}<button type="button" class="epi-go" data-cabinet>${esc(go)}</button></p>`;
  }
  function reportHtml() {
    const sol = C.solution, notes = ST.notes, FM = FORM();
    if (!ST.solved && ST.report.culprit && ((C.keywords[ST.report.culprit] || {}).nick || (C.keywords[ST.report.culprit] || {}).victim)) ST.report.culprit = null;
    const persons = ST.keys.filter(k => C.keywords[k] && C.keywords[k].type === 'person' && !C.keywords[k].nick && !C.keywords[k].victim); // 별명(온라인 닉네임)과 피해자는 범인 칸에 내지 않는다 // 온라인 별명은 계정일 뿐, 영장에 적을 사람이 아니다
    const roleOf = k => { const p = Object.values(C.people || {}).find(x => x.key === k), r = (p && p.role) || (C.keywords[k] || {}).role; return r ? plain(r) : ''; }; // 찾아갈 수 없는 사람도 단어에 role 이 있으면 한 줄 붙인다
    const groups = noteGroups(notes);
    const shut = ST.solved; // 종결된 보고서는 결재가 끝난 서류: 고칠 수 없다
    // 다른 주장에 이미 붙인 메모는 고를 때 알 수 있게 (같은 메모를 두 주장에 붙여도 되지만, 모르고 겹치지 않게)
    const usedBy = (n, i) => { const u = sol.claims.map((c, j) => (j !== i && String(ST.report.claims[c.id]) === String(n.id) ? j + 1 : 0)).filter(Boolean); return u.length ? T` <small class="rep-used">· ${u.join('·')}번에 붙임</small>` : ''; };
    const claim = (cl, i) => {
      const cur = notes.find(n => String(n.id) === String(ST.report.claims[cl.id])) || (shut && ST.report.kept && ST.report.kept[String(ST.report.claims[cl.id])]) || null;
      const open = !shut && REPOPEN === cl.id;
      const list = groups.map(g => `<details class="rep-grp" open><summary>${esc(g.src)} <small>${g.items.length}</small></summary>${g.items.map(([n, j]) => `<label class="rep-opt${cur && cur.id === n.id ? ' on' : ''}"><input type="radio" name="rep-${esc(cl.id)}" value="${n.id}" data-rep="${esc(cl.id)}"${cur && cur.id === n.id ? ' checked' : ''}><span class="n">${j + 1}.</span> <span class="t">${esc(n.t)}</span>${usedBy(n, i)}</label>`).join('')}</details>`).join('');
      return `<section class="rep-claim${cur ? ' filled' : ''}${open ? ' open' : ''}" data-claim="${esc(cl.id)}">
        <h4 id="rh-${esc(cl.id)}"><span class="no">${i + 1}</span> ${inline(cl.q)}</h4>
        <div class="rep-pick">${cur ? `<p class="rep-memo"><span class="n">${notes.includes(cur) ? notes.indexOf(cur) + 1 + '.' : '—'}</span> ${esc(cur.t)} <span class="src">— ${esc(cur.src || '')}</span></p>` : T('<p class="rep-empty">아직 붙인 메모가 없다.</p>')}
          ${shut ? '' : `<button type="button" class="rep-tog" data-rep-open="${esc(cl.id)}" aria-expanded="${open}">${open ? T('접기') : cur ? T('다른 메모로 바꾸기') : T('메모에서 고르기')} <small>${notes.length}</small></button>`}</div>
        ${open ? `<div class="rep-acc">${notes.length ? `<input type="search" class="rep-filter" placeholder="${T`메모에서 낱말 찾기`}" data-rep-filter aria-label="${T`메모 찾기`}"><div role="radiogroup" aria-labelledby="rh-${esc(cl.id)}">${list}</div><p class="rep-empty rep-none" hidden>${T`그 낱말이 든 메모가 없다.`}</p>` : T('<p class="rep-empty">수첩에 메모가 없다. 문서와 탐문에서 문장을 눌러 적어 둔다.</p>')}</div>` : ''}
      </section>`;
    };
    // 화면 속(모니터·노트북) 보고서는 전산 양식이라 머리에 결재란: 담당은 지금 서랍 주인, 종결되면 팀장·과장 칸에 결재 도장
    const me = roster().list.find(p => p.id === PID), back = !ST.solved && ST.tries && VERDICT;
    const sign = C.frame === 'crt' || C.frame === 'laptop' ? `<table class="rep-sign" aria-label="${T`결재`}"><tr><th>${T`담당`}</th><th>${T`팀장`}</th><th>${T`과장`}</th></tr><tr><td>${esc(who(me))}</td><td>${ST.solved ? T('<span class="ok">결재</span>') : back ? T('<span class="no">반려</span>') : ''}</td><td>${ST.solved ? T('<span class="ok">결재</span>') : ''}</td></tr></table>` : '';
    return `<article class="doc skin-report rep-view"><header class="doc-h">${sign}<p class="doc-k">${esc(FM.title)}</p><h3 class="doc-t">${esc(C.title)}</h3><p class="doc-m">${esc(FM.lead)}</p></header>
      <div class="doc-b"><form id="rep" autocomplete="off"${shut ? ' class="shut"' : ''}>
        <section class="rep-sec"><h4 id="rh-culprit">${esc(FM.culprit)}</h4><div class="rep-people" role="radiogroup" aria-labelledby="rh-culprit">${(shut ? persons.filter(k => k === ST.report.culprit) : persons).map(k => `<label class="rep-per${ST.report.culprit === k ? ' on' : ''}"><input type="radio" name="rep-culprit" value="${k}" data-rep="culprit"${ST.report.culprit === k ? ' checked' : ''}${shut ? ' disabled' : ''}><b>${esc(C.keywords[k].label)}</b>${roleOf(k) ? `<small>${esc(roleOf(k))}</small>` : ''}</label>`).join('') || T('<p class="rep-empty">수첩에 적힌 인물이 없다.</p>')}</div></section>
        ${sol.claims.map(claim).join('')}
        <p class="submit-row">${shut ? `<span class="rep-filed">${esc(FM.filed || (C.frame === 'papers' ? T('종결 · 철해 둠') : T('결재 완료')))}</span>` : `<button type="submit" class="btn-hand">${esc(FM.submit)}</button>`}<span class="tries">${ST.tries ? T`올린 횟수 ${ST.tries}` : ''}</span></p>
      </form><p class="verdict">${esc(VERDICT)}</p>${ST.solved ? `<div class="rep-solved">${solvedHtml(false)}</div>` : ''}</div></article>`;
  }
  function renderRep() {
    const a = document.activeElement, k = focusKey(a);
    renderNotebook();
    const o = ST.view.open;
    if (o && o.t === 'report') { const pr = $('#paneRead'), top = pr.scrollTop; renderRead(); pr.scrollTop = top; }
    // 다시 그려도 초점은 같은 칸에 (보고서의 범인 칸을 방향키로 고르는 중에 초점이 사라지지 않게)
    if (k && !a.isConnected) {
      const el = $$(k).find(x => x.offsetParent !== null) || (() => { const id = a.closest && a.closest('[data-claim]') && a.closest('[data-claim]').dataset.claim; return id && $(`[data-rep-open="${CSS.escape(id)}"]`); })(); // 접힌 메모 목록 안에 있었으면 그 주장의 단추로
      if (el) el.focus({ preventScroll: true });
    }
  }
  // 초점이 있던 칸을 다시 그린 뒤에도 찾을 수 있게 적어 둔다: id, 아니면 이름·값·data-* (같은 form 안에서)
  function focusKey(a) {
    if (!a || a === document.body || !a.closest || !a.closest('#app')) return '';
    const q = v => (window.CSS && CSS.escape ? CSS.escape(v) : v);
    if (a.id) return '#' + q(a.id);
    const at = [...a.attributes].filter(x => (x.name.startsWith('data-') && !/^data-(tip|ui|ui-key)$/.test(x.name)) || x.name === 'name' || x.name === 'type' || (x.name === 'value' && a.type === 'radio'));
    if (!at.length) return '';
    const f = a.closest('form[id]');
    return (f ? '#' + q(f.id) + ' ' : '') + a.tagName.toLowerCase() + at.map(x => `[${x.name}="${q(x.value)}"]`).join('');
  }

  /* ───────── notebook ───────── */
  function solvedHtml(fresh) {
    const sol = C.solution;
    NOPIN = true;
    const late = !!(C.live && ST.live && ST.live.late);
    // 현행 사건 결말의 {{t}} · {{d}} = 보고서를 올린 시각. 결말은 글이라 시계 숫자 대신 글로 (15시 40분 · 11월 22일 금요일 15시 40분 · 새벽이면 「새벽 3시 10분」)
    const ptime = t => MG.I18N.date(liveDate(t), 'ptime');
    const pstamp = t => MG.I18N.date(liveDate(t), 'pstamp');
    const when = x => (C.live && ST.live && typeof x === 'string' ? x.replace(/\{\{t\}\}/g, ptime(ST.live.t)).replace(/\{\{d\}\}/g, pstamp(ST.live.t)) : x);
    const stamped = arr => (arr || []).map(b => (typeof b === 'string' ? when(b) : b && typeof b.p === 'string' ? { ...b, p: when(b.p), ...(typeof b.gore === 'string' ? { gore: when(b.gore) } : {}) } : b));
    const epi = blocks(stamped(late && sol.late ? sol.late : sol.epilogue), 'epi', T('결말'));
    NOPIN = false;
    const dl = C.live && C.live.deadline, dlSeen = dl && (late || ok(dl.need)); // 끝내 몰랐던 기한은 말하지 않는다
    const cjk = /^(ja|zh)$/.test(MG.I18N.lang), dlName = esc(dl && dl.label || T('기한')); // 일본어·중국어는 전각 괄호
    const fin = C.live && ST.live ? `<p class="lv-fin">${T`수사 개시부터 ${hm(ST.live.t)}${dlSeen ? ` · ${late ? T('기한 넘김') : T('기한 안에 종결')}${cjk ? `<small>（${dlName}）</small>` : ` <small>(${dlName})</small>`}` : ''}`}</p>` : '';
    return `<div class="stamp${fresh ? ' fresh' : ''}"><div>${T`사건<br>종결<small>${esc(sol.stamp || '')}</small>`}</div></div>${fin}<div class="epi">${epi}</div>${shareHtml()}${sol.next ? nextHtml(sol.next) : ''}`;
  }
  // 종결한 사람이 결과를 옮겨 적을 수 있게: 범인·결말은 빼고 사건 번호, 제목, 별, 제출 횟수, 짚어 보기 횟수, 링크만
  const ITCH_URL = 'https://jysvai.itch.io/monologue-gaze';
  function shareText() {
    const head = `Monologue Gaze · CASE ${pad(C.no)} ${plain(C.title)}${C.kind !== 'tutorial' && C.stars ? ' ' + '★'.repeat(C.stars) : ''}`;
    const live = C.live && ST.live ? ' · ' + T`수사 ${hm(ST.live.t)}` : '';
    return `${head}\n${T`종결 · 보고서 제출 ${ST.tries || 1}회 · 짚어 보기 ${ST.nudges || 0}회`}${live}\n${ITCH_URL} #MonologueGaze`;
  }
  const shareHtml = () => `<p class="epi-share"><button type="button" class="epi-sh" data-card>${T('결과 카드 저장')}</button><button type="button" class="epi-sh" data-share>${T('결과 복사')}</button><a class="epi-sh" href="https://x.com/intent/post?text=${encodeURIComponent(shareText())}" target="_blank" rel="noopener">${T('X에 올리기')}</a></p>`;
  // 종결 결과 카드: 사건 사진 · 종결 도장 · 기록을 한 장 그림으로 (휴대폰은 공유 창, 컴퓨터는 내려받기). 범인·결말은 넣지 않는다
  async function resultCard() {
    const W = 1200, H = 630, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), cs = getComputedStyle(document.documentElement), fam = v => cs.getPropertyValue(v).trim() || 'serif';
    const fDoc = fam('--f-doc'), fType = fam('--f-type'), fMono = fam('--f-mono');
    const title = plain(C.title), stars = C.kind !== 'tutorial' && C.stars ? '★'.repeat(C.stars) + '☆'.repeat(Math.max(0, 5 - C.stars)) : '';
    const rows = [T`보고서 제출 ${ST.tries || 1}회 · 짚어 보기 ${ST.nudges || 0}회`, C.live && ST.live ? T`수사 ${hm(ST.live.t)}` : ''].filter(Boolean);
    const stampT = T('사건 종결');
    try { await Promise.all([`800 44px ${fDoc}`, `22px ${fType}`, `20px ${fMono}`].map(f => document.fonts.load(f, title + rows.join('') + stampT + 'CASE Monologue Gaze'))); } catch (e) { /* 글꼴을 못 불러도 기본 글꼴로 그린다 */ }
    const shadow = (b, y) => { g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = b; g.shadowOffsetY = y; }, plainShadow = () => { g.shadowColor = 'transparent'; g.shadowBlur = 0; g.shadowOffsetY = 0; };
    // 책상
    g.fillStyle = '#1c1815'; g.fillRect(0, 0, W, H);
    const vg = g.createRadialGradient(W * 0.45, H * 0.4, 60, W * 0.5, H * 0.5, W * 0.75); vg.addColorStop(0, 'rgba(125,88,52,.42)'); vg.addColorStop(1, 'rgba(0,0,0,.6)');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    // 사건 사진 (잔혹 표현이 있는 사건은 기록실 폴더처럼 흐리게)
    const src = MG.images[`${C.id}/cover`] || MG.images[`${C.id}/cover_s`];
    const img = src ? await new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }) : null;
    let cx = W / 2 - 270;
    if (img) {
      cx = 600;
      const pw = 470, ph = 352, ar = img.width / img.height; let sx = 0, sy = 0, sw = img.width, sh = img.height;
      if (ar > pw / ph) { sw = img.height * pw / ph; sx = (img.width - sw) / 2; } else { sh = img.width * ph / pw; sy = (img.height - sh) / 2; }
      g.save(); g.translate(305, 300); g.rotate(-0.045);
      shadow(30, 14); g.fillStyle = '#f3eee0'; g.fillRect(-pw / 2 - 14, -ph / 2 - 14, pw + 28, ph + 56); plainShadow();
      if (C.graphic) g.filter = 'sepia(.25) blur(5px) brightness(.8)';
      g.drawImage(img, sx, sy, sw, sh, -pw / 2, -ph / 2, pw, ph); g.filter = 'none';
      g.restore();
    }
    // 종결 기록 종이
    g.save(); g.translate(cx, 92); g.rotate(0.015);
    shadow(26, 12); g.fillStyle = '#ece2c6'; g.fillRect(0, 0, 540, 420); plainShadow();
    g.fillStyle = 'rgba(120,90,40,.22)'; g.fillRect(0, 62, 540, 1.5);
    g.textBaseline = 'alphabetic'; g.fillStyle = '#6b5b45'; g.font = `22px ${fType}`; g.fillText(`CASE ${pad(C.no)} · ${C.year}`, 34, 46);
    // 제목: 두 줄까지 (띄어쓰기가 없는 말은 글자 단위로 끊는다)
    g.fillStyle = '#221d17'; g.font = `800 42px ${fDoc}`;
    const words = /\s/.test(title) ? title.split(/(?<=\s)/) : [...title], tl = [''];
    words.forEach(w => { const k = tl.length - 1; if (g.measureText(tl[k] + w).width > 470 && tl[k]) tl.push(w.trimStart()); else tl[k] += w; });
    if (tl.length > 2) { tl.length = 2; while (g.measureText(tl[1] + '…').width > 470) tl[1] = tl[1].slice(0, -1); tl[1] += '…'; }
    tl.forEach((l, i) => g.fillText(l.trim(), 34, 128 + i * 52));
    let y = 128 + tl.length * 52 + 8;
    if (stars) { g.fillStyle = '#b0342a'; g.font = `26px ${fDoc}`; g.fillText(stars, 34, y); y += 44; }
    g.fillStyle = '#3a342c'; g.font = `20px ${fMono}`; rows.forEach(r => { g.fillText(r, 34, y); y += 32; });
    // 종결 도장
    g.save(); g.translate(430, 330); g.rotate(-0.22); g.globalAlpha = 0.85; g.strokeStyle = '#b0342a'; g.fillStyle = '#b0342a';
    g.lineWidth = 4; g.beginPath(); g.arc(0, 0, 74, 0, Math.PI * 2); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 64, 0, Math.PI * 2); g.stroke();
    g.textAlign = 'center'; g.textBaseline = 'middle'; let fs = 26; g.font = `800 ${fs}px ${fDoc}`; while (g.measureText(stampT).width > 112 && fs > 14) g.font = `800 ${--fs}px ${fDoc}`;
    g.fillText(stampT, 0, 0); g.restore();
    g.restore();
    // 아래 줄: 게임 이름과 주소
    g.fillStyle = '#efe3c8'; g.font = `34px ${fType}`; g.textBaseline = 'alphabetic'; g.fillText('Monologue Gaze', 56, H - 40);
    g.fillStyle = '#bda983'; g.font = `18px ${fMono}`; g.textAlign = 'right'; g.fillText(ITCH_URL.replace(/^https:\/\//, ''), W - 56, H - 44);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) return void toast(T('그림을 만들지 못했다.'));
    const name = `monologue-gaze-case${pad(C.no)}.png`, file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
    if (file && matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: shareText() }); } catch (e) { /* 공유 창을 닫았다 */ } return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    toast(T('결과 카드를 내려받았다.'), 2600);
  }
  function copyText(t) {
    const old = () => { const a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } a.remove(); return ok; };
    return navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t).then(() => true, () => old()) : Promise.resolve(old());
  }
  // 메모는 어디서 적었는지(문서·사람)끼리 묶는다. 접어 둔 묶음은 기억한다
  const NGSHUT = new Set();
  function noteGroups(notes) {
    const groups = [];
    notes.forEach((n, i) => { const src = n.src || T('기타'); let g = groups.find(x => x.src === src); if (!g) groups.push(g = { src, items: [] }); g.items.push([n, i]); });
    return groups;
  }
  function renderNotebook() {
    const nb = $('#nb');
    if (!nb) return;
    const b = C.brief || {};
    const keys = ST.keys.filter(k => C.keywords[k]);
    const groups = KTYPE.map(t => [t, keys.filter(k => (C.keywords[k].type || 'word') === t)]).filter(([, a]) => a.length);
    const persons = keys.filter(k => C.keywords[k].type === 'person');
    const notes = ST.notes;
    const sol = C.solution;
    const onRep = {}; // 보고서 주장에 증거로 붙인 메모: 끝에 주장 번호를 빨간 연필로 (지우면 그 칸이 빈다는 것도 보이게)
    sol.claims.forEach((cl, i) => { const v = ST.report.claims[cl.id]; if (v !== '' && v != null) (onRep[String(v)] ||= []).push(i + 1); });
    const repMark = n => { const u = onRep[String(n.id)]; if (!u) return ''; const t = T`${FORM().title} ${u.join('·')}번에 붙인 메모`; return `<span class="n-rep" role="img" aria-label="${t}" data-tip="${t}">${u.join('·')}</span>`; };
    const top = nb.firstChild ? nb.scrollTop : 0;
    nb.innerHTML = `
      <div class="nb-rings" aria-hidden="true"></div>
      <div class="nb-top"><button type="button" class="nb-back" data-cabinet>${T`← 기록실`}</button><span class="nb-case"><span class="nb-id">${starsHtml(C)} CASE ${pad(C.no)}</span><span class="nb-ctl">${soundBtn()}${C.graphic ? mildBtn() : ''}</span></span></div>
      <article class="brief"><svg class="clip" viewBox="0 0 24 64" aria-hidden="true"><path d="M8 20 V50 a6 6 0 0 0 12 0 V12 a8 8 0 0 0 -16 0 V46" fill="none" stroke="#8d918f" stroke-width="2.6" stroke-linecap="round"/></svg>
        ${gore() ? `<span class="brief-blood" aria-hidden="true">${stains(C.id + 'brief', 1, 'bd', true)}</span>` : ''}<h2>${esc(b.title || C.title)} <small>${esc(b.no || '')}</small></h2>
        <dl>${(b.lines || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${inline(v)}</dd>`).join('')}</dl>${b.scrawl ? `<p class="scrawl">${inline(b.scrawl)}</p>` : ''}</article>
      <section class="ruled nb-sec"><h3 class="hh">${T`단어 <small>${keys.length}</small>`}</h3>
        ${groups.map(([t, a]) => `<p class="kg"><span class="kg-t">${ktypeName(t)}</span> ${a.map(k => `<button type="button" class="kchip" data-chip="${k}">${esc(C.keywords[k].label)}</button>`).join(' ')}</p>`).join('')}
      </section>
      <section class="ruled nb-sec"><h3 class="hh">${T`메모 <small>${notes.length}</small>`}</h3>
        ${(C.tips || []).length ? `<ol class="notes">${C.tips.map(t => `<li class="tip">※ ${inline(t)}</li>`).join('')}</ol>` : notes.length ? '' : T('<ol class="notes"><li class="tip">아직 적은 메모가 없다.</li></ol>')}
        ${noteGroups(notes).map(g => `<details class="ng" data-ng="${esc(g.src)}"${NGSHUT.has(C.id + '|' + g.src) ? '' : ' open'}><summary><span class="ng-t">${esc(g.src)}</span> <small>${g.items.length}</small></summary><ol class="notes">${g.items.map(([n, i]) => `<li data-nid="${n.id}" style="--r:${(hash(n.ref) % 5 - 2) * 0.25}deg"><span class="n">${i + 1}.</span> ${esc(n.t)}${repMark(n)}<button type="button" class="del" data-del="${n.id}" aria-label="${T`메모 ${i + 1} 지우기`}">×</button></li>`).join('')}</ol></details>`).join('')}
      </section>
      <section class="ruled nb-sec nb-rep"><h3 class="hh">${esc(FORM().title)}</h3>
        <p class="rep-sum">${T`${esc(FORM().short)} <b>${ST.report.culprit && C.keywords[ST.report.culprit] ? esc(C.keywords[ST.report.culprit].label) : '—'}</b> · 증거 <b>${sol.claims.filter(cl => ST.report.claims[cl.id] && (ST.notes.some(n => String(n.id) === String(ST.report.claims[cl.id])) || (ST.solved && ST.report.kept && ST.report.kept[String(ST.report.claims[cl.id])]))).length}</b> / ${sol.claims.length}`}</p>
        <p class="submit-row"><button type="button" class="btn-hand" data-open-rep>${esc(ST.solved ? T`올린 ${FORM().title} 보기` : FORM().open)}</button><span class="tries">${ST.tries ? T`올린 횟수 ${ST.tries}` : ''}</span></p>
        <p class="verdict">${esc(VERDICT)}</p>
        ${ST.solved ? '' : nudgeRow()}
        <div id="solvedBox">${ST.solved ? solvedHtml(false) : ''}</div>
      </section>
      <footer class="nb-foot"><button type="button" class="reset" data-reset>${T`이 사건 처음부터`}</button><p>${esc(C.disclaimer || T('실제 미제 사건의 모티프만 빌린 창작입니다. 인물·장소·기관은 모두 지어낸 것입니다.'))}</p></footer>`;
    if (top) nb.scrollTop = top;
  }

  /* ───────── 막혔을 때: 짚어 보기 ─────────
   * 지금 수첩과 읽은 기록으로 앞으로 나갈 수 있는 곳을 하나 짚는다. 처음엔 어느 쪽인지만 (어느 철, 누구), 한 번 더 누르면 무엇인지 (문서 제목, 단어).
   * ★5 는 어느 쪽인지만. 보고서의 정답 증거는 짚지 않는다 — 쓸 메모가 없는 주장 번호만 (★3·★4). */
  let NUDGE = null; // { c: 사건 id, key: 짚은 곳, more: 자세히 펼쳤나 }
  // 기록 한 덩이(문서·대답·지점…)에 든 단어 링크와 사실
  function bagOf(parts) {
    const o = { k: new Set(), f: new Set() };
    const kw = t => String(t ?? '').replace(/\[\[([^\]|]+?)(?:\|([\w-]+))?\]\]/g, (m, l, kid) => { const id = kid || C._lab[norm(l)]; if (id && C.keywords[id]) o.k.add(id); return m; });
    const walk = arr => (Array.isArray(arr) ? arr : [arr]).forEach(b => {
      if (b == null) return;
      if (typeof b === 'string') return kw(b);
      if (typeof b !== 'object') return;
      ['p', 'note', 'say', 'msg', 'cap', 'h', 'divider', 'stamp', 'sign', 'm'].forEach(x => { if (b[x] != null) kw(b[x]); });
      (b.list || []).forEach(kw);
      (b.rows || []).forEach(r => (r || []).forEach(kw));
      (b.f == null ? [] : typeof b.f === 'string' ? [b.f] : Object.values(b.f)).forEach(f => { if (f) o.f.add(f); }); // 표·목록은 줄마다: 배열이나 { 줄 번호: 사실 }
    });
    parts.forEach(walk);
    return o;
  }
  // 사건마다 한 번: 플레이어가 볼 수 있는 글 덩이 목록. seen() = 이미 읽었나, go = 거기로 가는 길
  function nudgeIndex() {
    if (C._nix) return C._nix;
    const bags = [], br = C.brief || {};
    bags.push({ ...bagOf([...(br.lines || []).map(l => l[1]), br.scrawl]), title: T('사건 개요'), go: null, seen: () => true }); // 수첩 맨 위 개요 카드
    C.sources.forEach(s => bags.push({ ...bagOf([s.desc, s.intro || []]), title: plain(s.name), go: { t: 'src', src: s.id }, seen: () => srcVisible(s) })); // 탭 안내 글
    C.sources.forEach(s => [...(s.sets || []), ...(s.scenes || [])].forEach(x => bags.push({ ...bagOf([x.intro || [], x.meta]), title: plain(x.title), go: { t: s.type === 'photo' ? 'scene' : 'src', id: x.id, src: s.id }, seen: () => srcVisible(s) && ok(x.need) })));
    Object.values(C.docs).forEach(d => bags.push({ ...bagOf([d.title, d.meta, d.kicker, d.body || []]), title: plain(d.title), go: { t: 'doc', id: d.id, src: d.src }, seen: () => ST.seen.includes(d.id) && (!d.lock || ST.unl.includes(d.id)) }));
    Object.values(C.people).forEach(p => {
      const go = { t: 'person', id: p.id, src: p.src };
      bags.push({ ...bagOf([p.intro || []]), title: p.name, go, seen: () => ST.asked[p.id] != null });
      const ans = (e, arr) => bags.push({ ...bagOf([arr || []]), title: p.name, go, seen: () => (ST.asked[p.id] || []).includes(e), ask: { p: p.id, e } });
      Object.entries(p.ask || {}).forEach(([k, a]) => { if (isCond(a)) { ans(k + '!', a.a); if (a.else != null) ans(k, a.else); } else ans(k, a); });
      if (p.self && !(p.ask || {})[p.key]) ans(p.key, p.self);
    });
    C.sources.forEach(s => {
      const go = { t: 'src', src: s.id };
      if (s.type === 'timeline' || s.type === 'cipher') bags.push({ ...bagOf([s.solved || []]), title: plain(s.title || s.name), go, seen: () => ST.unl.includes(s.id) });
      (s.sets || []).forEach(x => bags.push({ ...bagOf([x.solved || []]), title: plain(x.title), go, seen: () => ST.unl.includes(x.id) }));
      (s.scenes || []).forEach(x => (x.spots || []).forEach(sp => bags.push({ ...bagOf([sp.body || []]), title: plain(x.title), go: { t: 'scene', id: x.id, src: s.id }, seen: () => ST.unl.includes(sp.id) })));
      (s.type === 'feed' ? s.items || [] : []).forEach(it => bags.push({ ...bagOf([it.msg]), title: plain(s.name), go, seen: () => !!(ST.live && it.id in ST.live.fd), ...(it.f ? { f: new Set([it.f, ...bagOf([it.msg]).f]) } : {}) }));
    });
    return (C._nix = bags);
  }
  // 앞을 막고 있는 조건들: 조건 목록과, 그 조건이 열어 주는 것
  function gates() {
    const g = [];
    Object.values(C.docs).forEach(d => g.push(d.need));
    C.sources.forEach(s => {
      g.push(s.need, s.solveNeed);
      [...(s.spots || []), ...(s.sets || []), ...(s.scenes || []), ...(s.records || []), ...(s.items || [])].forEach(x => g.push(x.need, x.solveNeed));
      (s.scenes || []).forEach(x => (x.spots || []).forEach(sp => g.push(sp.need)));
    });
    Object.values(C.people).forEach(p => { g.push(p.need); Object.values(p.ask || {}).forEach(a => { if (isCond(a)) g.push(a.need); }); });
    return g.filter(n => n && n.length);
  }
  const quote = x => ({ en: `“${x}”`, ru: `«${x}»`, de: `„${x}“` }[MG.I18N.lang] || `「${x}」`); // 이름 하나만 짚을 때의 따옴표 (그 언어의 것)
  function leads() {
    const out = [], add = (key, a, b, go) => { if (!out.some(x => x.key === key)) out.push({ key, a, b, go }); };
    const bags = nudgeIndex(), seen = bags.filter(b => b.seen());
    const noted = f => ST.notes.some(n => n.f === f);
    const factHome = f => seen.find(b => b.f.has(f));
    const vis = C.sources.filter(srcVisible);
    // 1. 보이는데 아직 펼치지 않은 기록, 아직 만나지 않은 사람
    vis.forEach(s => {
      const docs = [];
      if (s.type === 'list' && srcOpen(s)) docs.push(...C._srcDocs[s.id].filter(d => ok(d.need)));
      if (s.type === 'archive') docs.push(...(s.start || []).map(id => C.docs[id]).filter(d => d && ok(d.need)));
      if (s.type === 'map') docs.push(...(s.spots || []).filter(sp => ok(sp.need)).map(sp => C.docs[sp.doc]).filter(Boolean));
      if (s.type === 'query') docs.push(...(ST.found[s.id] || []).map(id => C.docs[id]).filter(Boolean));
      if (s.type === 'request') docs.push(...(s.items || []).filter(r => { const q = reqState(r.id); return q && q.st === 'done'; }).map(r => C.docs[r.doc]).filter(Boolean));
      if (s.type === 'feed' && ST.live) docs.push(...(s.items || []).filter(it => it.doc && it.id in ST.live.fd).map(it => C.docs[it.doc]).filter(Boolean)); // 단톡방에 온 첨부
      docs.filter(d => (!d.lock || ST.unl.includes(d.id)) && !ST.seen.includes(d.id)).forEach(d => add('doc:' + d.id, T`「${plain(s.name)}」에 아직 펼쳐 보지 않은 기록이 있다.`, quote(plain(d.title)), { t: 'doc', id: d.id, src: s.id }));
    });
    Object.values(C.people).filter(p => personVisible(p) && srcVisible(C.sources.find(s => s.id === p.src) || {}) && ST.asked[p.id] == null).forEach(p => add('meet:' + p.id, T('아직 찾아가 보지 않은 사람이 있다.'), p.name, { t: 'person', id: p.id, src: p.src }));
    // 2. 읽은 기록 속에 있는데 아직 수첩에 적지 않은 단어
    //    앞으로 이어지는 단어(그 말로 찾으면 나오는 기록이 있거나, 조건에 걸려 있거나, 누군가 그 말에 따로 대답하는 것)를 먼저 짚는다. 아무 데도 안 이어지는 단어부터 짚으면 헛걸음이 된다
    const opens = k => Object.values(C.docs).some(d => (d.find || []).includes(k) && !ST.seen.includes(d.id)) || gates().some(need => need.includes(k)) || Object.values(C.people).some(p => rawAns(p, k) != null);
    const words = []; seen.forEach(b => b.k.forEach(k => { if (!ST.keys.includes(k) && C.keywords[k]) words.push([k, b]); }));
    [...words.filter(([k]) => opens(k)), ...words.filter(([k]) => !opens(k))].forEach(([k, b]) => add('word:' + k, T('읽은 기록 속에 아직 수첩에 적지 않은 단어가 있다.'), T`「${b.title}」 속 「${C.keywords[k].label}」`, b.go));
    // 3·4. 탐문 — 수첩을 내밀어 다시 물을 것, 새 단어나 쓸 만한 사실이 나올 물음
    const useful = new Set([...gates().flat().filter(n => n[0] === '!').map(n => n.slice(1)), ...C.solution.claims.flatMap(cl => cl.accept || [])]); // 앞을 여는 사실, 보고서에 쓸 사실 (어느 쪽인지는 말하지 않는다)
    const people = Object.values(C.people).filter(p => personVisible(p) && ST.asked[p.id] != null);
    people.forEach(p => ST.keys.forEach(k => {
      const e = askEntry(p, k), asked = ST.asked[p.id] || [];
      if (e.endsWith('!') && !asked.includes(e) && asked.includes(k)) add(`press:${p.id}|${k}`, T('수첩을 내밀어 다시 물어볼 사람이 있다.'), T`${p.name} — 「${C.keywords[k].label}」`, { t: 'person', id: p.id, src: p.src });
    }));
    people.forEach(p => ST.keys.forEach(k => {
      if (!C.keywords[k] || (k === p.key && rawAns(p, k) == null)) return;
      const e = askEntry(p, k);
      if ((ST.asked[p.id] || []).includes(e)) return;
      const b = bags.find(x => x.ask && x.ask.p === p.id && x.ask.e === e);
      const a0 = rawAns(p, k), pre = isCond(a0) && ok(a0.need); // 내밀 메모가 있으면 그냥 묻는 것부터
      if (pre || (b && ([...b.k].some(x => !ST.keys.includes(x)) || [...b.f].some(f => useful.has(f) && !noted(f)) || e.endsWith('!')))) add(`ask:${p.id}|${e}`, T('수첩의 단어로 아직 물어보지 않은 것이 있다.'), T`${p.name} — 「${C.keywords[k].label}」`, { t: 'person', id: p.id, src: p.src });
    }));
    // 5. 자료실 — 수첩의 단어로 찾으면 새 기록이 나오는 곳 (잠긴 문서는 잠금 쪽(7)에서 짚는다)
    vis.filter(s => s.type === 'archive').forEach(s => ST.keys.forEach(k => {
      if (!C.keywords[k]) return;
      if (C._srcDocs[s.id].some(d => ok(d.need) && (d.find || []).includes(k) && !ST.seen.includes(d.id) && (!d.lock || ST.unl.includes(d.id)))) add(`find:${s.id}|${k}`, T`「${plain(s.name)}」에서 수첩의 단어로 아직 찾아보지 않은 것이 있다.`, quote(C.keywords[k].label), { t: 'find', src: s.id, id: k });
    }));
    // 6. 앞을 막는 조건 가운데 수첩 메모 하나만 모자란 것 — 그 대목은 이미 읽은 기록에 있다
    gates().forEach(need => {
      const miss = need.filter(n => !okOne(n));
      if (!miss.length || !miss.every(n => n[0] === '!')) return;
      miss.forEach(n => { const h = factHome(n.slice(1)); if (h) add('fact:' + n.slice(1), T('읽은 기록 가운데 수첩에 적어 둘 대목이 남아 있다.'), T`「${h.title}」의 한 대목`, h.go); });
    });
    reqItems().forEach(r => { // 소명 메모가 모자란 신청서
      const q = reqState(r.id);
      if (!ok(r.need) || (q && q.st !== 'no') || !(r.why || []).length || r.why.some(noted)) return;
      const h = r.why.map(factHome).find(Boolean);
      if (h) add('why:' + r.id, T('읽은 기록 가운데 수첩에 적어 둘 대목이 남아 있다.'), T`「${h.title}」의 한 대목`, h.go);
    });
    // 7. 잠금 — 열 단서가 이미 모였다
    vis.forEach(s => { if (s.lock && !ST.unl.includes(s.id) && ok(s.lock.need)) add('lock:' + s.id, T`「${plain(s.name)}」 잠금을 열 단서는 이미 모였다.`, plain(s.lock.hint2 || s.lock.hint || ''), { t: 'src', src: s.id }); });
    Object.values(C.docs).forEach(d => {
      if (!d.lock || ST.unl.includes(d.id) || !ok(d.lock.need) || !ok(d.need)) return;
      const s = C.sources.find(x => x.id === d.src);
      if (s && srcVisible(s) && (s.type !== 'archive' || (s.start || []).includes(d.id) || (d.find || []).some(k => ST.keys.includes(k)))) add('lock:' + d.id, T`「${plain(d.title)}」 잠금을 열 단서는 이미 모였다.`, plain(d.lock.hint2 || d.lock.hint || ''), { t: 'doc', id: d.id, src: d.src });
    });
    // 8. 재구성·암호·대조·관찰·조회 — 풀 거리가 모였는데 아직 안 푼 것
    vis.forEach(s => {
      if ((s.type === 'timeline' || s.type === 'cipher') && !ST.unl.includes(s.id) && ok(s.solveNeed)) add('solve:' + s.id, T`「${plain(s.name)}」에 필요한 기록은 이미 모였다.`, '', { t: 'src', src: s.id });
      if (s.type === 'compare') (s.sets || []).forEach(x => { if (ok(x.need) && !ST.unl.includes(x.id) && ok(x.solveNeed)) add('cmp:' + x.id, T`「${plain(s.name)}」에 아직 가려내지 못한 감정이 있다.`, quote(plain(x.title)), { t: 'src', src: s.id }); });
      if (s.type === 'photo') (s.scenes || []).forEach(x => { if (!ok(x.need)) return; const sp = (x.spots || []).find(y => ok(y.need) && !ST.unl.includes(y.id)); if (sp) add('spot:' + sp.id, T`「${plain(x.title)}」에 아직 찾지 못한 곳이 있다.`, sp.label ? quote(plain(sp.label)) : '', { t: 'scene', id: x.id, src: s.id }); });
      if (s.type === 'query') (s.records || []).forEach(r => {
        if (!ok(r.need) || !C.docs[r.doc] || ST.seen.includes(r.doc) || (ST.found[s.id] || []).includes(r.doc)) return;
        const k = (r.need || []).filter(n => C.keywords[n] && !(s.need || []).includes(n)).pop();
        add('query:' + r.doc, T`「${plain(s.name)}」에 넣어 볼 값이 이미 기록에 나와 있다.`, k ? T`「${C.keywords[k].label}」에 얽힌 ${(s.fields || []).map(f => plain(f.label)).join(' · ')}` : '', { t: 'src', src: s.id });
      });
    });
    // 9. 현행 사건 — 올릴 수 있는 신청서, 기다리면 오는 것
    if (liveOn()) {
      reqItems().forEach(r => { const q = reqState(r.id), s = C.sources.find(x => x.id === r.src); if (s && srcVisible(s) && ok(r.need) && (!q || q.st === 'no') && (!(r.why || []).length || r.why.some(noted))) add('req:' + r.id, T`「${plain(s.name)}」에 올릴 수 있는 신청서가 있다.`, quote(plain(r.title)), { t: 'req', id: r.id, src: r.src }); });
      if (nextDue() != null) add('wait', T('지금은 기다릴 차례다. 회신이나 새 소식이 오고 있다.'), T('화면 아래 단추로 시간을 넘길 수 있다.'), null);
    }
    return out;
  }
  function nudgeHtml() {
    if (ST.solved || !NUDGE || NUDGE.c !== C.id) return '';
    const L = leads(), sol = C.solution, fm = FORM();
    let n = NUDGE.key ? L.find(x => x.key === NUDGE.key) : L[0];
    // 짚은 곳을 해냈으면 쪽지를 거둔다 (다음 곳은 다시 눌러야 — 저절로 다음 곳을 보여 주지 않게)
    if (!n && NUDGE.key && (NUDGE.key !== 'done' || L.length)) { NUDGE = null; return ''; }
    if (!n) { // 더 열 것이 없으면 보고서 쪽으로: 쓸 메모가 아직 없는 주장 번호만
      const empty = sol.claims.map((cl, i) => ((cl.accept || []).some(f => ST.notes.some(x => x.f === f)) ? 0 : i + 1)).filter(Boolean);
      n = { key: 'done', a: T`더 열어 볼 기록은 없다. 적은 메모로 ${fm.title}${josa(fm.title, '을', '를')} 쓴다.`, b: empty.length ? T`${empty.join('·')}번을 받칠 메모가 아직 수첩에 없다.` : T('쓸 메모는 수첩에 다 있다. 메모끼리 맞대 본다.') };
    }
    NUDGE.key = n.key;
    const more = lv() < 5 && n.b;
    const go = n.go ? `<button type="button" class="nudge-go" data-nudge-go="${esc([n.go.t, n.go.src || '', n.go.id || ''].join('|'))}">${T`펼치기`}</button>` : '';
    return `<div class="nudge" role="status"><p class="nudge-a">${esc(n.a)}</p>${more ? (NUDGE.more ? `<p class="nudge-b">${esc(n.b)} ${go}</p>` : `<button type="button" class="nudge-more" data-nudge-more>${T`더 짚어 보기`}</button>`) : ''}</div>`;
  }
  function nudgeRow() { const box = nudgeHtml(); return `<div class="nudge-row"><button type="button" class="nudge-btn" data-nudge aria-expanded="${!!box}" aria-controls="nudgeBox">${T`막혔을 때 짚어 보기`}</button><div id="nudgeBox">${box}</div></div>`; }
  function renderNudge() {
    const b = $('#nudgeBox'); if (!b) return;
    const was = b.innerHTML, h = nudgeHtml();
    if (h !== was) b.innerHTML = h;
    const btn = $('[data-nudge]'); if (btn) btn.setAttribute('aria-expanded', String(!!h));
  }
  function toggleNudge() {
    if (NUDGE && NUDGE.c === C.id) NUDGE = null;
    else { NUDGE = { c: C.id, key: null, more: false }; ST.nudges = (ST.nudges || 0) + 1; save(); sfx('ink'); }
    renderNudge();
  }
  function nudgeGo(v) {
    const [t, src, id] = v.split('|');
    if (src && C.sources.some(s => s.id === src && srcVisible(s))) { keepPos(); ST.view.src = src; }
    if (t === 'find' && C.keywords[id]) { setQ(src, C.keywords[id].label); if (narrow()) { ST.view.open = null; renderRead(); } } // 짚은 단어로 바로 찾아 준다
    else if (t === 'doc' || t === 'person' || t === 'req') openItem({ t, id });
    else if (t === 'scene') openItem({ t: 'photo', id });
    else { const s = curSrc(); ST.view.open = s && (s.type === 'cipher' || s.type === 'timeline') ? { t: s.type, id: s.id } : narrow() ? null : ST.view.open; save(); renderRead(); }
    renderTabs(); renderList();
    if (!beside()) $('.stage').scrollIntoView({ block: 'start' });
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
    // 현행 사건: 당직 책상 — 무전기, 증거 봉투, 출입증 목줄, 캔 음료
    c13: ['radio', 'evidencebag', 'smartphone', 'energy'], c14: ['takeaway', 'lanyard', 'radio', 'evidencebag'],
    c15: ['radio', 'smartphone', 'lanyard', 'energy'],
  };
  const PROPW = { mug: 210, teacup: 230, takeaway: 170, pocketwatch: 170, magnifier: 240, inkpen: 230, ashtray: 200, matchbox: 120, cassette: 200, pager: 130, flipphone: 120, smartphone: 150, pencil: 300, clips: 120, stamp: 190, glasses: 210, radio: 140, evidencebag: 190, lanyard: 230, energy: 115 };
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
    if (C.live && ST && ST.live) return liveBar();
    const c = C.clock || CLOCK[C.id];
    if (!c || C.frame === 'papers') return '';
    const ico = C.frame === 'laptop' ? '<svg viewBox="0 0 34 12" aria-hidden="true"><path d="M2 5.5a7 7 0 0 1 10 0M4 7.5a4.2 4.2 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="7" cy="9.6" r="1.1" fill="currentColor"/><rect x="17" y="3" width="13" height="7" rx="1.4" fill="none" stroke="currentColor" stroke-width="1.1"/><rect x="18.6" y="4.6" width="7" height="3.8" fill="currentColor"/><rect x="30.4" y="5" width="1.6" height="3" fill="currentColor"/></svg>' : '';
    return `<div class="scr-bar" aria-hidden="true">${ico}<time class="scr-clock" data-t0="${new Date(c[0], c[1] - 1, c[2], c[3], c[4]).getTime()}" data-at="${Date.now()}"></time></div>`;
  }
  function tickClock() {
    const el = $('.scr-clock');
    if (!el) { clearInterval(clockT); clockT = null; return; }
    const d = new Date(+el.dataset.t0 + (Date.now() - +el.dataset.at));
    el.textContent = MG.I18N.date(d, 'clock');
  }
  function renderCase() {
    document.body.dataset.screen = 'case';
    if (gore() && MG.sound && MG.sound.preload) MG.sound.preload(['sfx/gore', 'sfx/bonesaw']); // 끔찍한 기록을 처음 펼칠 때 날 소리
    app.innerHTML = `${deskProps()}${gore() ?`<div class="gore-bg" aria-hidden="true">${stains(C.id + 'bg', 5, 'aacb', true)}</div>` : ''}<div class="case-view" data-case="${esc(C.id)}" data-frame="${esc(C.frame || 'papers')}" data-era="${(y => y < 1945 ? 'old' : y < 1980 ? 'mid' : '')(parseInt(C.year, 10) || 2000)}"${gore() ? ' data-graphic' : ''}>
      <main class="stage" aria-label="${T`조사 자료`}">
        <div class="stage-frame"><span class="cam" aria-hidden="true"></span>
          <div class="screen">
            <nav class="src-tabs" role="tablist" id="srcTabs" aria-label="${T`조사 도구`}"></nav><span class="tabs-new l" aria-hidden="true"></span><span class="tabs-new r" aria-hidden="true"></span>
            <div class="stage-body" id="stageBody"><section class="pane-list" id="paneList" role="tabpanel"></section><section class="pane-read" id="paneRead" aria-label="${T`읽기`}"></section></div>${clockBar()}
          </div>
        </div>
        <div class="frame-foot" aria-hidden="true"></div>
        ${C.tag ? `<div class="evtag">${inline(C.tag)}</div>` : ''}
      </main>
      <aside class="nb" id="nb" aria-label="${T`형사 수첩`}"></aside>
    </div>`;
    PIN = {};
    { const pr = $('#paneRead'); if (pr && pr.addEventListener && MG._vwheel) pr.addEventListener('wheel', MG._vwheel, { passive: false }); } // 세로 신문: 휠을 읽는 방향으로
    renderTabs(); renderList(); renderRead(); renderNotebook();
    if ($('.scr-clock')) { tickClock(); clockT ||= setInterval(tickClock, 15000); }
  }
  // 사건마다 쓰는 특수 글꼴은 그 사건을 열 때만 부른다 (공통 글꼴은 index.html). 신문 양식은 송명·옛 로마자를 쓴다.
  // 손글씨 편지는 쓴 사람마다 필체가 다르다 (문서 cls 의 f-yeon · f-dokdo …)
  const fontOn = {};
  function caseFonts(c) {
    const FONTS = MG.fonts || {};
    if (!c._fonts) {
      const j = JSON.stringify(c), y = parseInt(c.year, 10) || 2000, news = y < 1980 && j.includes('"skin":"news"');
      // 화면 틀·시대가 부르는 글꼴 (css/skins.css 의 시대 기본값, css/live.css 가 쓴다)
      const auto = [...(c.frame === 'laptop' ? ['ui'] : c.frame === 'crt' ? ['pixel'] : []), ...(y < 1945 ? ['batang', 'latin'] : []), ...(c.live ? ['phone', 'sys'] : [])];
      // 나눔 글꼴에 없는 글자가 든 사건은 받침 글꼴을 부른다: 한자·외국 글자 → Noto Sans KR, 가나 → Noto Sans JP, 암호 기호 → 수학 기호 조각
      if (/[一-鿿À-ɏ−]/.test(j)) auto.push('sys');
      if (/[぀-ヿ]/.test(j)) auto.push('jpsans');
      if (/[◐⊕⌖⋈⋔⊓♁⊞⧗]/.test(j)) auto.push('cipher');
      c._fonts = Object.keys(FONTS).filter(k => (c.fonts || []).includes(k) || auto.includes(k) || new RegExp('\\bf-' + k + '\\b').test(j) || news && (k === 'old' || k === 'latin') || k === 'latin' && j.includes('f-frak'));
    }
    const need = c._fonts.filter(k => !fontOn[k]);
    if (!need.length) return;
    need.forEach(k => { fontOn[k] = 1; });
    const link = href => { if (fontOn[href]) return; fontOn[href] = 1; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); };
    const g = need.filter(k => typeof FONTS[k] === 'string');
    if (g.length) link('https://fonts.googleapis.com/css2?' + g.map(k => 'family=' + FONTS[k]).join('&') + '&display=swap');
    need.filter(k => FONTS[k] && FONTS[k].css).forEach(k => link(FONTS[k].css)); // 같은 주소(Pretendard·갈무리)는 한 번만
  }

  // intro: 기록실에서 폴더를 눌러 열 때만 여는 장면을 보여 준다 (새로 고침·처음부터 다시는 바로)
  function openCase(id, intro) {
    const c = MG.byId[id];
    if (!c) return cabinet();
    stopTalk(); if (MG.sound) MG.sound.stopVoice();
    caseFonts(c);
    if (c.graphic && !cs(c).cw) return warnScreen(c);
    C = c; ST = cs(c); VERDICT = '';
    S.current = id; save();
    document.title = `CASE ${pad(c.no)} ${quote(c.title)} — Monologue Gaze`;
    renderCase();
    liveSync();
    guard();
    // 기록실에서 화면 속 사건(모니터·노트북)을 열면: 여는 장면 동안 꺼져 있다가, 장면이 걷힐 때 켜진다
    const scr = intro && MG.mood && (c.frame === 'crt' || c.frame === 'laptop') && $('.screen');
    if (scr) {
      scr.classList.add('off');
      const on = () => {
        document.removeEventListener('mg:intro-out', on);
        if (!scr.isConnected) return;
        scr.classList.replace('off', 'boot');
        if (c.frame === 'crt') sfx('crton');
        setTimeout(() => scr.classList.remove('boot'), 1000);
      };
      document.addEventListener('mg:intro-out', on);
    }
    if (MG.mood) MG.mood.enter(C, intro);
    if (scr && !document.querySelector('.case-intro')) document.dispatchEvent(new Event('mg:intro-out'));
    window.scrollTo(0, 0);
  }

  function warnScreen(c, again) {
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    document.title = 'Monologue Gaze';
    app.innerHTML = `<div class="cw"><div class="cw-card" role="region" aria-labelledby="cwH" tabindex="-1">${S.mild ? '' : stains(c.id + 'cw', 2, 'acd', 'corner')}<p class="cw-t">${T`혐오감 주의`}</p><h2 id="cwH">CASE ${pad(c.no)} ${quote(esc(c.title))} ${starsHtml(c)}</h2>
      <p>${esc(c.warn || T('이 사건 기록에는 시신 훼손 같은 잔혹한 내용과 강한 묘사가 들어 있습니다.'))}</p><p class="cw-s">${T`모든 인물과 사건은 지어낸 것입니다. 불편하면 언제든 기록실로 돌아가도 됩니다. 핏자국, 가림 없는 사진, 참혹한 묘사와 소리는 「잔혹 표현」 단추로 끌 수 있습니다. 끄면 사진은 가려지고 기록은 건조한 판으로 바뀝니다.`}</p><p>${mildBtn()}</p>
      <p class="cw-b"><button type="button" class="btn-hand" data-cw-ok="${esc(c.id)}">${T`기록을 연다`}</button> <button type="button" class="reset" data-cabinet>${T`돌아간다`}</button></p></div></div>`;
    window.scrollTo(0, 0);
    guard();
    const card = !again && app.querySelector('.cw-card'); if (card) card.focus({ preventScroll: true }); // 처음 열 때 경고문부터 읽히고, Tab 으로 두 단추에
  }

  /* ── 근무 명부: 이 브라우저를 쓰는 수사관들. 고르기 · 새 서랍 받기 · 이름 고치기 · 지우기 */
  function rosterHtml(ask) { // ask: 들어오자마자 누가 앉았는지 묻는 때
    const r = roster(), main = MG.cases.filter(c => c.kind !== 'tutorial' && !c.live), live = MG.cases.filter(c => c.live); // 기록실 위쪽 셈과 같게: 미제 기록 · 현행 따로
    const row = p => {
      const s = p.id === PID ? S : load(p.id), sts = Object.values(s.cases);
      const done = list => list.filter(c => s.cases[c.id] && s.cases[c.id].solved).length;
      const going = sts.some(st => st && !st.solved && ((st.notes || []).length || (st.seen || []).length));
      const stat = `<span class="ro-stat">${T`종결 ${done(main)} / ${main.length}${live.length ? T` · 현행 ${done(live)} / ${live.length}` : ''}${going ? T(' · 수사 중') : ''}`}</span>`;
      if (p.id === PID) return `<li class="ro-me"><form data-pname><input maxlength="12" value="${esc(p.name)}" placeholder="${esc(who(p))}" aria-label="${T`내 이름 (고칠 수 있다)`}"></form>${stat}<span class="ro-now">${T`지금 서랍`}</span></li>`;
      return `<li><button type="button" class="ro-pick" data-player="${esc(p.id)}">${esc(who(p))}</button>${stat}<button type="button" class="reset" data-drop="${esc(p.id)}">${T`명부에서 지우기`}</button></li>`;
    };
    return `<section class="roster" aria-label="${T`근무 명부`}"><h2>${T`강력2팀 근무 명부`}</h2><p class="ro-sub">${T`서랍은 수사관마다 따로다. 한 컴퓨터를 나눠 써도 남의 수첩을 이어 쓰지 않는다.`}</p>${ask ? `<p class="ro-ask">${T`지금 열린 서랍은 ${esc(who(r.list.find(p => p.id === PID)))}의 것이다. 다른 사람이 앉았으면 제 이름을 누르거나 새 서랍을 받는다.`}</p>` : ''}
      <ul>${r.list.map(row).join('')}</ul>
      <form class="ro-new" data-pnew><input maxlength="12" placeholder="${T`새 수사관 이름`}" aria-label="${T`새 수사관 이름`}"><button type="submit" class="btn-hand">${T`새 서랍 받기`}</button></form></section>`;
  }
  function toggleRoster(open) {
    const top = $('.cab-top'), cur = $('.roster');
    if (!top) return;
    if (cur) cur.remove();
    if (open ?? !cur) { top.insertAdjacentHTML('afterend', rosterHtml()); sfx('page'); }
    const b = $('[data-roster]');
    if (b) b.setAttribute('aria-expanded', String(!!$('.roster')));
  }
  function usePlayer(id) {
    const r = roster(), p = r.list.find(x => x.id === id);
    if (!p) return;
    save();
    r.cur = id; saveRoster(r);
    PID = id; S = load(id); forget();
    if (MG.sound) MG.sound.stopVoice();
    cabinet();
    if (MG.mood) MG.mood.sound();
    window.scrollTo(0, 0);
    toast(T`${who(p)}의 서랍`);
  }
  function newPlayer(name) {
    const r = roster(), id = 'p' + Date.now().toString(36), no = r.n || r.list.length + 1;
    r.list.push({ id, name: name.trim().slice(0, 12), no }); r.n = no + 1;
    saveRoster(r);
    usePlayer(id);
  }
  function renamePlayer(name) {
    const r = roster(), p = r.list.find(x => x.id === PID);
    if (!p) return;
    p.name = name.trim().slice(0, 12);
    saveRoster(r);
    const b = $('[data-roster]');
    if (b) b.outerHTML = whoBtn(true);
    toast(T`명부 고침 — ${who(p)}`);
  }
  function dropPlayer(id) {
    const r = roster();
    if (id === PID || !r.list.some(p => p.id === id)) return;
    r.list = r.list.filter(p => p.id !== id);
    saveRoster(r);
    try { localStorage.removeItem(slot(id)); } catch (e) { /* ignore */ }
    toggleRoster(true);
    if (r.list.length < 2) { const w = $('[data-wipe]'); if (w) w.textContent = T('모든 기록 지우기'); }
  }

  /* ── 편지 밑의 물음: M 은 기록 속 누구였나. 맞히면 추신 */
  function mWho(fresh) {
    const W = MG.finaleWho;
    if (!W) return '';
    if (S.mwho) return `<div class="m-ps${fresh ? ' reveal' : ''}">${W.ps.map(p => `<p>${esc(p)}</p>`).join('')}<p class="m-sig">${esc(W.sig)}</p></div>`;
    const tried = S.mwhoTried || []; // 틀리게 적은 이름은 연필로 그어 편지에 남는다
    return `<form class="m-who" data-mwho><label><span>${esc(W.q)}</span><input maxlength="16" placeholder="${esc(W.placeholder)}" aria-label="${esc(W.q)}"></label><button type="submit" class="btn-hand">${T`적는다`}</button>${tried.length ? `<p class="m-tried">${tried.map(x => `<s>${esc(x)}</s>`).join('')}</p>` : ''}${(S.mwhoTries || 0) >= 3 ? `<p class="m-hint">${esc(W.hint)}</p>` : ''}</form>`;
  }
  function guessM(f) {
    const W = MG.finaleWho, raw = f.querySelector('input').value.trim(), v = norm(raw), fl = flipWords(raw), vf = fl == null ? '' : norm(fl);
    if (!W || !v) return;
    if (W.answer.some(a => norm(a) === v || norm(a) === vf)) {
      S.mwho = true; save();
      f.outerHTML = mWho(true);
      sfx('stamp');
      const ps = $('.m-ps'); if (ps) { ps.tabIndex = -1; ps.focus({ preventScroll: true }); } // 적는다 단추가 사라진 자리에서 초점을 잃지 않게, 추신부터 읽히게
      say(W.ps[0] || '');
      return;
    }
    const again = (S.mwhoTried || []).some(x => norm(x) === v);
    if (!again) S.mwhoTries = (S.mwhoTries || 0) + 1; // 이미 그어 둔 이름을 또 적은 것은 세지 않는다
    S.mwhoTried = [...(S.mwhoTried || []).filter(x => norm(x) !== v), raw].slice(-6); save();
    f.outerHTML = mWho();
    const nf = $('[data-mwho]');
    if (nf) { nf.classList.add('bounced'); const i = nf.querySelector('input'); if (i) i.focus(); }
    sfx('miss'); toast(again ? T('이미 적었다가 그어 둔 이름이다') : W.miss);
  }

  function cabinet(showRoster) {
    clearNotes(); unguard();
    stopTalk(); if (MG.sound) MG.sound.stopVoice(); // 추궁 도중 기록실로 나가도 그 사람 목소리가 기록실까지 따라오지 않는다
    C = null; ST = null; S.current = null; save();
    if (MG.mood) MG.mood.leave();
    document.body.dataset.screen = 'cabinet';
    document.title = 'Monologue Gaze';
    const main = MG.cases.filter(c => c.kind !== 'tutorial' && !c.live); // M 의 서랍: 미제 기록
    const live = MG.cases.filter(c => c.live); // 당직: 지금 강력2팀에 떨어진 사건
    const solvedMain = main.filter(c => S.cases[c.id] && S.cases[c.id].solved).length;
    const solvedLive = live.filter(c => S.cases[c.id] && S.cases[c.id].solved).length;
    const mList = MG.cases.filter(c => c._m && S.cases[c.id] && S.cases[c.id].m);
    // 처음 보는 종결 도장·M의 메모는 한 번만 찍히고 스며 나온다 (전부터 있던 것은 조용히)
    const doneIds = MG.cases.filter(c => S.cases[c.id] && S.cases[c.id].solved).map(c => c.id), mIds = mList.map(c => c.id);
    const allShut = main.length >= 10 && solvedMain === main.length; // 서랍이 전부 닫히면 맨 밑에서 M의 편지가 나온다
    if (!S.seen) S.seen = { done: doneIds, m: mIds, letter: allShut };
    const newDone = doneIds.filter(id => !S.seen.done.includes(id)), newM = mIds.filter(id => !S.seen.m.includes(id)), newLetter = allShut && !S.seen.letter;
    S.seen.done.push(...newDone); S.seen.m.push(...newM); S.seen.letter = allShut; save();
    // 연습 사건만 닫고 아직 서랍을 하나도 안 열었으면, 다음에 열 폴더에 팀장이 연필로 표시해 둔다
    const touched = c => { const st = S.cases[c.id]; return st && (st.solved || (st.notes || []).length || (st.seen || []).length); };
    const tut = MG.cases.find(c => c.kind === 'tutorial');
    const nextId = tut && S.cases[tut.id] && S.cases[tut.id].solved && !main.concat(live).some(touched) && main[0] ? main[0].id : null;
    const folder = c => {
      const st = S.cases[c.id];
      const status = st && st.solved ? 'done' : st && ((st.notes || []).length || (st.seen || []).length) ? 'going' : 'new'; // 예전 판의 저장에 칸이 빠져 있어도 기록실은 열린다
      const kind = c.kind === 'tutorial' ? T('신입 교육') : c.live ? T('현행') : c.region === 'overseas' ? T('해외') : T('국내');
      // 현행 사건 폴더에는 사건 속 시계가 멈춘 시각을 연필로 적어 둔다 (다시 열면 거기서부터 흐른다)
      const stop = c.live && st && st.live ? (([y, mo, d, h, mi]) => { const t = new Date(y, mo - 1, d, h, mi + (st.live.t || 0)); return MG.I18N.date(t, 'mdhm'); })(c.live.start || [2024, 1, 1, 9, 0]) : '';
      const coverFile = MG.images[`${c.id}/cover_s`] || MG.images[`${c.id}/cover`]; // 폴더 표지는 작게 (cover_s)
      const cover = coverFile ? `<img src="${esc(coverFile)}" alt="" loading="lazy" decoding="async">` : c.art && c.art.cover ? (typeof c.art.cover === 'string' ? c.art.cover : c.art.cover.svg || '') : '';
      return `<button type="button" class="folder ${status}${c.kind === 'tutorial' ? ' tutorial' : ''}" data-open="${esc(c.id)}" style="--tilt:${(hash(c.id) % 7 - 3) * 0.4}deg">
        ${cover ? `<span class="f-cover${c.graphic ? ' graphic' : ''}" aria-hidden="true">${cover}</span>` : ''}${c.graphic && !S.mild ? `<span class="f-blood" aria-hidden="true">${stains(c.id + 'f', 2, 'dac', false)}</span>` : ''}${c.graphic ? T('<span class="f-warn">혐오감 주의</span>') : ''}
        <span class="f-tab">CASE ${pad(c.no)}</span>
        <span class="f-body"><span class="f-kind">${kind} · ${esc(c.year)} ${c.kind === 'tutorial' ? T('<span class="stars t">연습</span>') : starsHtml(c)}</span><span class="f-label"><span class="f-title">${esc(c.title)}</span><span class="f-place">${esc(c.place)}</span></span>
        <span class="f-motif">${esc(c.motif || '')}</span>${c.length ? `<span class="f-len">${esc(c.length)}</span>` : ''}
        ${status === 'done' ? `<span class="f-stamp${newDone.includes(c.id) ? ' fresh' : ''}">${T`종결`}</span>` : status === 'going' ? `<span class="f-going">${T`수사 중${stop ? `<small>${stop}</small>` : ''}`}</span>` : c.id === nextId ? `<span class="f-going f-next">${T`다음은 여기부터`}</span>` : ''}</span></button>`;
    };
    const intro = S.intro ? '' : `<div class="intro"><p>${T`서울서부경찰서 강력2팀. 은천서로 전출 간 선배 <b>M</b>이 책상 서랍 열쇠 하나를 남기고 갔다.`}</p><p>${T`서랍 속에는 한 세기에 걸친 미제 기록 ${numk(main.length)} 건. 신문 스크랩, 진술서, 편지, 사진. 선배가 끝내 풀지 못하고 두고 간 것들이다.`}</p><p class="intro-hand">${T`처음이면 CASE 00부터. 조사하는 법을 거기서 익힐 것. — 팀장`}</p><button type="button" class="btn-hand" data-intro-ok>${T`서랍을 연다`}</button></div>`;
    const letter = allShut ? `<article class="m-letter${newLetter ? ' fresh' : ''}"><h3>${T`서랍 맨 밑의 편지`}</h3>${(MG.finale || []).map(p => `<p>${esc(p.replace(/{n}/g, numk(main.length)).replace(/{next}/g, numk(main.length + 1)))}</p>`).join('')}<p class="m-sig">— M</p>${mWho()}</article>` : '';
    // 사건을 하나라도 닫은 사람에게만 (기록실에만, 사건 안에는 넣지 않는다). itch 는 별점·댓글이 쌓인 게임을 목록에 더 자주 올린다. 닫으면 다시 안 나온다
    const onItch = typeof location !== 'undefined' && /(^|\.)itch\.(zone|io)$/.test(location.hostname);
    const solvedAny = MG.cases.some(c => S.cases[c.id] && S.cases[c.id].solved); // 연습 사건(CASE 00)만 닫은 사람에게도: 긴 사건 하나를 끝까지 가는 사람은 적다
    const rate = solvedAny && !S.rateOff ? `<p class="cab-rate">${onItch ? T('재미있으셨다면 이 화면 아래 itch.io 페이지에서 별점이나 댓글을 남겨 주세요. 평가가 쌓이면 itch 목록에 더 자주 뜹니다.') : T('재미있으셨다면 <a href="https://jysvai.itch.io/monologue-gaze" target="_blank" rel="noopener">itch.io 페이지</a>에서 별점이나 댓글을 남겨 주세요. 평가가 쌓이면 itch 목록에 더 자주 뜹니다.')}<button type="button" class="cab-rate-x" data-rate-off aria-label="${T('이 안내 닫기')}">×</button></p>` : '';
    const hero = MG.images['_global/hero'];
    app.innerHTML = `<div class="cabinet">
      ${hero ? `<div class="cab-hero" aria-hidden="true"><img src="${esc(hero)}" alt="" decoding="async" fetchpriority="high"></div>` : ''}
      <header class="cab-top"><p class="cab-kicker">${T`서울서부경찰서 강력2팀 · 미제사건 기록실`}</p><h1 class="cab-title">Monologue Gaze</h1><p class="cab-sub">${T`시간은 흐르지만, 새겨진 기록은 거짓말을 하지 않는다.`}</p>
        <p class="cab-ctl">${whoBtn(showRoster)}${soundBtn()}${MG.cases.some(c => c.graphic) ? mildBtn() : ''}${langSel()}</p><p class="cab-stat">${T`종결 <b>${solvedMain}</b> / ${main.length}${live.length ? T` · 현행 <b>${solvedLive}</b> / ${live.length}` : ''} · M의 메모 <b>${mList.length}</b> / ${MG.cases.filter(c => c._m).length}`}</p>${rate}</header>
      ${showRoster ? rosterHtml(showRoster === 'ask') : ''}
      ${intro}
      <section class="drawer" aria-label="${T`사건 파일`}">${MG.cases.filter(c => !c.live).map(folder).join('')}</section>
      ${live.length ? `<section class="duty" aria-label="${T`현행 사건`}"><h2 class="duty-h">${T`당직 · 현행 사건`}</h2><p class="duty-sub">${T`몇 해 전 실제로 돌았던 현행 사건을 그날 그 시각부터 다시 돌리는 당직 훈련이다. 지원으로 붙은 형사 자리에 앉는다. 문서를 읽고 묻고 조회할 때마다 수사 시계가 돈다.`}</p><div class="drawer">${live.map(folder).join('')}</div></section>` : ''}
      ${mList.length ? `<section class="mbox"><h2>${T`M의 메모`}</h2><p class="mbox-sub">${T`기록 여백과 화면에 붙은 포스트잇에 남아 있던, 선배의 글씨.`}</p><ul>${mList.map(c => `<li${newM.includes(c.id) ? ' class="fresh"' : ''}><span class="mbox-case">CASE ${pad(c.no)}</span> ${esc(plain(c._m))}</li>`).join('')}</ul></section>` : ''}
      ${letter}
      <footer class="cab-foot">${unsaved ? T('<p class="unsaved" role="note">이 브라우저가 기록 저장을 막고 있다 — 창을 닫으면 수사가 사라진다.</p>') : ''}<p>${T`모든 사건은 실제 미제 사건의 모티프만 빌려 새로 지은 이야기입니다. 등장하는 인물·장소·기관·사이트는 모두 허구이며, 실제 인물이나 피해자와 관계가 없습니다.`}</p><p class="credit">${T`목소리·효과음`} <a href="https://elevenlabs.io" target="_blank" rel="noopener">ElevenLabs</a></p><button type="button" class="reset" data-wipe>${roster().list.length > 1 ? T('내 기록 지우기') : T('모든 기록 지우기')}</button></footer>
    </div>`;
    // 막 종결한 사건이면 그 폴더까지 내려가 도장을 찍는다
    const fresh = $('.f-stamp.fresh');
    if (fresh) { setTimeout(() => { fresh.closest('.folder').scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); }, 150); setTimeout(() => sfx('stamp'), 700); }
    // 마지막 서랍을 막 닫았으면: 도장 다음에 편지가 나왔다고 알리고, 편지는 눈에 들어오는 순간 서랍 밑에서 밀려 나온다
    const ml = $('.m-letter.fresh');
    if (ml) {
      const out = () => { ml.classList.add('out'); sfx('page'); };
      if ('IntersectionObserver' in window) { const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); out(); } }, { threshold: 0.15 }); io.observe(ml); } else out();
      setTimeout(() => { if (ml.isConnected) toast(T('서랍 맨 밑에서 편지 한 통이 밀려 나왔다')); }, fresh ? 2000 : 600);
    }
  }

  /* ───────── sound (기본 꺼짐) — audio/ 의 효과음 파일이 있으면 그것을, 없으면 합성음 ───────── */
  let actx = null;
  // 합성음 판. 새로 고침 뒤 아직 아무것도 누르지 않았으면(현행 사건의 알림 진동 등) 브라우저가 막으므로 내지 않고 — 멈춘 판에 쌓였다가 첫 누름에 한꺼번에 울리지 않게 —
  // 판이 멈춰 있으면 낼 때마다 깨운다 (한 번 멈춘 판이 끝까지 멈춰 전화 신호음·브라운관 소리가 내내 안 나지 않게)
  const ac = () => {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume().catch(() => {});
    return actx;
  };
  const SFXFILE = { stamp: 'solved', lock: 'unlock' };
  // 수첩·보고서에 적는 소리는 사건의 시대를 따른다: 1950년 앞은 연필, 1990년 앞의 종이 사건은 타자기, 90년대 종이 사건은 옛 컴퓨터 자판, 2006년 모니터는 사무용 자판, 노트북은 얕은 자판
  const inkKind = () => {
    if (!C) return 'write';
    if (C.frame === 'laptop') return 'tap';
    if (C.frame === 'crt') return 'kbd';
    const y = parseInt(C.year, 10) || 2000;
    return y < 1950 ? 'write' : y < 1990 ? 'typewriter' : 'oldkbd';
  };
  const SMALL = /^(pen|page|click|key|ink|write|typewriter|tw1|oldkbd|kbd|tap)$/;
  function sfx(kind) {
    if (!S.sound) return;
    if (kind === 'page' && C) kind = C.frame === 'laptop' ? 'click' : C.frame === 'crt' ? 'key' : 'page'; // 화면 속 문서는 종이 넘기는 소리 대신 딸깍
    if (kind === 'ink') kind = inkKind();
    if (MG.sound && MG.sound.play('sfx/' + (SFXFILE[kind] || kind), SMALL.test(kind) ? 0.5 : 0.9)) return;
    if (kind === 'write') kind = 'pen';
    else if (/^(typewriter|tw1|oldkbd|kbd|tap)$/.test(kind)) kind = 'key';
    try {
      if (!ac()) return;
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
      if (kind === 'pen') { noise(0.09, 'bandpass', 1900, 0.9, 0.16); setTimeout(() => noise(0.07, 'bandpass', 1600, 0.9, 0.11), 90); }
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
      } else if (kind === 'buzz') { // 휴대폰 진동 두 번: 낮은 사각파가 책상 위에서 드르륵
        [0, 0.26].forEach(at => {
          const o = actx.createOscillator(); const g = actx.createGain(); const f = actx.createBiquadFilter();
          o.type = 'square'; o.frequency.setValueAtTime(148, t + at); f.type = 'lowpass'; f.frequency.value = 420;
          g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(0.09, t + at + 0.02); g.gain.setValueAtTime(0.09, t + at + 0.16); g.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.2);
          o.connect(f).connect(g).connect(actx.destination); o.start(t + at); o.stop(t + at + 0.22);
        });
      } else if (kind === 'crton') { // 브라운관이 켜질 때: 툭(소자 제거) + 가늘게 우는 고음 + 지직
        const o = actx.createOscillator(); const g = actx.createGain();
        o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.35);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.32, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.42);
        const w = actx.createOscillator(); const wg = actx.createGain();
        w.frequency.value = 9600; wg.gain.setValueAtTime(0.0001, t + 0.1); wg.gain.exponentialRampToValueAtTime(0.012, t + 0.3); wg.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
        w.connect(wg).connect(actx.destination); w.start(t + 0.1); w.stop(t + 1.55);
        noise(0.5, 'highpass', 2400, 0.7, 0.07);
      } else if (kind === 'deny' || kind === 'lcdbeep' || kind === 'reorder') { // 비밀번호가 틀렸을 때
        const tone = (at, fs, len, type, v, lp) => {
          const g = actx.createGain(), f = actx.createBiquadFilter();
          f.type = 'lowpass'; f.frequency.value = lp;
          g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(v, t + at + 0.008); g.gain.setValueAtTime(v, t + at + len - 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + at + len);
          f.connect(g).connect(actx.destination);
          fs.forEach(([f0, f1]) => { const o = actx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t + at); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + at + len); o.connect(f); o.start(t + at); o.stop(t + at + len + 0.02); });
        };
        if (kind === 'reorder') [0, 0.22, 0.44].forEach(at => tone(at, [[480], [620]], 0.12, 'sine', 0.06, 2400)); // 전화: 뚜뚜뚜 (끊긴 신호)
        else if (kind === 'lcdbeep') [0, 0.13].forEach(at => tone(at, [[1250]], 0.07, 'square', 0.035, 3000)); // 워드프로세서: 삑삑
        else tone(0, [[330, 210]], 0.17, 'triangle', 0.14, 1200); // 화면 속 잠금: 낮게 툭
      } else if (kind === 'radio') { // 무전: 치익 — 삑
        noise(0.28, 'bandpass', 1900, 1.4, 0.16);
        const o = actx.createOscillator(); const g = actx.createGain();
        o.type = 'square'; o.frequency.value = 1320;
        g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.exponentialRampToValueAtTime(0.035, t + 0.31); g.gain.setValueAtTime(0.035, t + 0.38); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        o.connect(g).connect(actx.destination); o.start(t + 0.3); o.stop(t + 0.42);
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
      if (!ac()) return;
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
    if (lines && MG.sound) { HEROI = (HEROI + 1 + (Date.now() & 1)) % lines.length; const k = lines[HEROI], c0 = C, s0 = ST; setTimeout(() => { if (C === c0 && ST === s0) MG.sound.hero(k); }, 1300); }
  }
  const whoBtn = open => `<button type="button" class="snd who" data-roster aria-expanded="${!!open}">${T`담당 · ${esc(who(roster().list.find(p => p.id === PID)))}`}</button>`;
  const mildBtn = () => `<button type="button" class="snd mild" data-mild aria-pressed="${!S.mild}">${S.mild ? T('잔혹 표현 꺼짐') : T('잔혹 표현 켜짐')}</button>`;
  const soundBtn = () => `<button type="button" class="snd" data-sound aria-pressed="${!!S.sound}">${S.sound ? T('소리 켜짐') : T('소리 꺼짐')}</button>${S.sound ? voiceBtn() : ''}`;
  // 언어: 고르면 새로 불러온다 (js/i18n.js). 언어 이름은 늘 그 언어의 글자로
  const langSel = () => `<label class="snd lang"><select data-lang aria-label="${T`언어`} · Language">${MG.I18N.langs.map(([id, n]) => `<option value="${id}" lang="${id}"${id === MG.I18N.lang ? ' selected' : ''}>${n}</option>`).join('')}</select></label>`;
  const voiceBtn = () => `<button type="button" class="snd voice" data-voice aria-pressed="${S.voice !== false}">${S.voice !== false ? T('목소리 켜짐') : T('목소리 꺼짐')}</button>`;

  // 그림 크게 보기: 누르면 화면 가득, 다시 누르거나 Esc 로 닫는다
  function zoom(img) {
    const z = document.createElement('div');
    z.className = 'zoom'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-label', T('그림 크게 보기')); z.tabIndex = -1;
    const w = img.closest('.art-wrap');
    const fc = img.closest('figure') && img.closest('figure').querySelector('figcaption');
    const cap = fc ? [...fc.childNodes].filter(n => !(n.classList && n.classList.contains('pin'))).map(n => n.textContent).join('').trim() : '';
    if (C) z.dataset.frame = C.frame;
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    z.innerHTML = `<figure>${w ? w.outerHTML : `<img src="${esc(img.getAttribute('src'))}" alt="${esc(img.alt || '')}">`}</figure>${cap ? `<p class="z-cap">${esc(cap)}</p>` : ''}<p>${fine ? T('누르거나 Esc — 닫힌다') : T('그림을 누르면 두 배로 · 바깥을 누르면 닫힌다')}</p>`;
    const close = () => { z.remove(); document.removeEventListener('keydown', key); };
    const key = e => { if (e.key === 'Escape') close(); };
    // 손가락 화면: 그림을 누르면 누른 자리를 가운데 두고 두 배로 (옆으로 밀어 본다), 다시 누르면 원래대로 — 작은 휴대폰에서 사진 구석을 들여다보게
    z.addEventListener('click', e => {
      const f = !fine && e.isTrusted && e.target.closest && e.target.closest('figure');
      if (!f) return close();
      const r = f.getBoundingClientRect(), rx = (e.clientX - r.left) / r.width, ry = (e.clientY - r.top) / r.height;
      z.classList.toggle('big');
      if (z.classList.contains('big')) { const q = f.getBoundingClientRect(); z.scrollLeft = rx * q.width - z.clientWidth / 2; z.scrollTop = ry * q.height - z.clientHeight / 2; }
    });
    document.addEventListener('keydown', key);
    document.body.appendChild(z); z.focus();
    sfx('page');
  }

  /* ───────── 브라우저·휴대폰의 뒤로 가기: 게임 밖으로 나가지 않고 한 칸씩 물러난다 (크게 보기 → 읽던 문서 → 기록실) ───────── */
  let backSelf = false; // 게임이 스스로 물린 뒤로 가기 (기록실에 돌아올 때 남은 한 칸을 걷는다)
  function guard() { try { if (!(history.state && history.state.mg)) history.pushState({ mg: 1 }, ''); } catch (e) { /* ignore */ } }
  function unguard() { try { if (history.state && history.state.mg) { backSelf = true; history.back(); } } catch (e) { /* ignore */ } }
  function onBack() {
    if (backSelf) { backSelf = false; return; }
    const z = $('.zoom');
    if (z) { z.click(); guard(); return; }
    const b = C && $('#paneRead [data-back]');
    if (b && b.offsetParent !== null && narrow()) { b.click(); guard(); return; } // 좁은 화면: 문서 → 목록
    const home = (C || $('.cw')) && $('[data-cabinet]');
    if (home) home.click();
  }

  /* ───────── actions ───────── */
  let toastTimer;
  // 알림 쪽지·휴대폰 알림 칸은 처음부터 깔아 둔다 (화면 읽기 프로그램은 미리 있던 칸에 새로 든 글만 읽어 주므로, 첫 알림도 들리게)
  function statusBox(id, cls) {
    let b = $('#' + id);
    if (!b) { b = document.createElement('div'); b.id = id; b.className = cls; b.setAttribute('role', 'status'); document.body.appendChild(b); }
    return b;
  }
  // 화면 읽기 프로그램에만 들리는 한 줄 (판정처럼 칸을 새로 그리며 바뀌는 말은 새로 그린 칸에서 읽히지 않으므로 여기로)
  function say(t) { const b = statusBox('srSay', 'sr'); b.textContent = ''; if (t) setTimeout(() => { b.textContent = t; }, 60); }
  function toast(msg, ms) {
    const t = statusBox('toast', 'toast');
    t.textContent = msg;
    t.classList.add('on');
    document.documentElement.style.setProperty('--toast-h', t.offsetHeight + 'px'); // 속말 자막이 이만큼 비켜 선다 (css/drama.css)
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), ms || 2200);
  }
  function refreshAll() { renderTabs(); renderList(); renderRead(); renderNotebook(); }

  // 누른 말과 수첩에 적히는 이름이 다르면 둘 다 보인다 (「켈바흐 장」을 눌렀는데 「장날」만 뜨면 어디 갔나 찾게 된다)
  // 같은 말로 치는 것: 한쪽이 다른 쪽을 품을 때(「크로프트 씨」 · 「크로프트」), 아니면 짧은 쪽 글자 쌍의 7할 이상이 겹칠 때.
  // 「전화」 하나만 겹치는 「신고 전화 → 공중전화」, 성만 겹치는 「헬레순 택시 → 오드 헬레」는 다른 것이라 화살표를 단다
  const flat = w => String(w).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const bigrams = s => (s.length < 2 ? [s] : [...s].slice(1).map((c, i) => s[i] + c));
  const saidAs = (said, label) => {
    if (!said) return label;
    const sa = flat(said), sb = flat(label);
    if (!sa || !sb || sa.includes(sb) || sb.includes(sa)) return label;
    const a = new Set(bigrams(sa)), b = new Set(bigrams(sb)), [lo, hi] = a.size <= b.size ? [a, b] : [b, a];
    return [...lo].filter(x => hi.has(x)).length >= 0.7 * lo.size ? label : `${said.trim()} → ${label}`;
  };
  function addKey(id, quiet, said) {
    const k = C.keywords[id];
    if (!k) return;
    const shown = saidAs(said, k.label);
    if (ST.keys.includes(id)) {
      if (quiet) return;
      toast(T`이미 수첩에 있다: ${shown}`);
      const kc = $(`.kchip[data-chip="${id}"]`); // 수첩의 그 단어에 형광펜 한 번
      if (kc) { kc.classList.remove('again'); void kc.offsetWidth; kc.classList.add('again'); if (beside()) kc.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }
      return;
    }
    const BY = {}, before = census(BY);
    ST.keys.push(id); save();
    const gained = census() - before;
    if (gained > 0) cue('clue'); else sfx('ink');
    $$('.kw').forEach(b => { if (b.dataset.kw === id) b.classList.add('on'); });
    renderTabs(); renderList(); renderNotebook();
    const kc = $(`.kchip[data-chip="${id}"]`); // 방금 적은 단어는 연필로 써 넣듯 (메모와 같게)
    if (kc) { kc.classList.add('fresh'); if (beside()) kc.scrollIntoView({ block: 'nearest' }); }
    const chips = $('#askChips');
    if (chips && ST.view.open && ST.view.open.t === 'person') chips.innerHTML = askChips(C.people[ST.view.open.id]);
    if (!quiet) toast(T`수첩에 적었다: ${shown}${gained > 0 ? opened(gained, BY) : ''}`);
    liveSync();
  }
  function pin(ref) {
    const p = PIN[ref];
    if (!p) return;
    const had = ST.notes.findIndex(n => n.ref === ref);
    if (had >= 0) { // 이미 적은 줄: 수첩의 그 메모를 짚어 준다 (접힌 묶음이면 펼쳐서)
      toast(T`이미 적어 둔 메모다 — ${had + 1}번`);
      const li = $(`.notes li[data-nid="${ST.notes[had].id}"]`);
      if (li) { const d = li.closest('details'); if (d && !d.open) d.open = true; li.classList.remove('again'); void li.offsetWidth; li.classList.add('again'); if (beside()) li.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); }
      return;
    }
    const BY = {}, before = census(BY);
    ST.notes.push({ id: ++ST.nid, ref, t: p.t, f: p.f, src: p.src });
    save();
    if (census() > before) cue('clue'); else sfx('ink');
    $$('.pin').forEach(b => { if (b.dataset.pin === ref) { b.classList.add('on'); b.innerHTML = IC_TICK; b.setAttribute('aria-label', T('수첩에 적음')); b.dataset.tip = T('수첩에 적음'); } });
    renderNotebook();
    const li = $(`.notes li[data-nid="${ST.nid}"]`);
    if (li) { const d = li.closest('details'); if (d && !d.open) { NGSHUT.delete(C.id + '|' + d.dataset.ng); d.open = true; } if (!(MG.writeIn && MG.writeIn(li, { duration: 900 }))) li.classList.add('fresh'); if (beside()) li.scrollIntoView({ block: 'nearest' }); }
    const gained = census() - before;
    if (gained > 0) { renderTabs(); renderList(); }
    const chips = $('#askChips');
    if (chips && ST.view.open && ST.view.open.t === 'person') chips.innerHTML = askChips(C.people[ST.view.open.id]);
    toast(T`메모 ${ST.notes.length}번을 적었다${gained > 0 ? opened(gained, BY) : ''}`);
    liveSync();
  }
  // 메모 지우기: 연필로 줄을 긋고 나서 지운다
  function delNote(id) {
    const li = $(`.notes li[data-nid="${id}"]`);
    // 보고서에 붙여 둔 메모는 한 번에 지우지 않는다 (작은 × 를 잘못 누르면 붙여 둔 증거까지 빠지므로): 한 번 더 누르면 지운다
    const on = ST.solved ? [] : C.solution.claims.map((c, j) => (String(ST.report.claims[c.id]) === String(id) ? j + 1 : 0)).filter(Boolean);
    if (li && on.length && !li.classList.contains('arm')) {
      li.classList.add('arm');
      toast(T`${FORM().title} ${on.join('·')}번에 붙인 메모다 — × 를 한 번 더 누르면 지운다`);
      setTimeout(() => li.classList.remove('arm'), 3000);
      return;
    }
    if (!li || reduced()) return dropNote(id);
    if (li.classList.contains('gone')) return;
    li.classList.add('gone'); sfx('pen');
    const c0 = C;
    setTimeout(() => { if (C === c0 && ST.notes.some(x => x.id === id)) dropNote(id); }, 420);
  }
  function dropNote(id) {
    const n = ST.notes.find(x => x.id === id);
    // 지운 메모의 × 에 초점이 있었으면 (키보드) 옆 메모의 × 로, 없으면 그 묶음 제목으로 옮긴다
    const li = $(`.notes li[data-nid="${id}"]`), had = li && li.contains(document.activeElement);
    const sib = li && (li.nextElementSibling || li.previousElementSibling), grp = li && li.closest('.ng');
    const to = had && (sib ? `.notes li[data-nid="${sib.dataset.nid}"] .del` : grp ? `.ng[data-ng="${CSS.escape(grp.dataset.ng)}"] > summary` : '');
    ST.notes = ST.notes.filter(x => x.id !== id);
    // 종결된 보고서는 결재가 끝난 서류: 수첩에서 메모를 지워도 보고서에 붙은 증거는 그대로 남는다 (지운 메모의 글은 보고서 쪽에 옮겨 둔다)
    if (ST.solved) { if (n && Object.values(ST.report.claims).some(v => String(v) === String(id))) (ST.report.kept ||= {})[String(id)] = { id: n.id, t: n.t, src: n.src }; }
    else Object.keys(ST.report.claims).forEach(k => { if (String(ST.report.claims[k]) === String(id)) ST.report.claims[k] = ''; });
    save();
    if (n) $$('.pin').forEach(b => { if (b.dataset.pin === n.ref) { b.classList.remove('on'); b.innerHTML = IC_PEN; b.setAttribute('aria-label', T('수첩에 적기')); b.dataset.tip = T('수첩에 적기'); } });
    renderRep();
    const f = to && ($(to) || $('[data-open-rep]'));
    if (f && (document.activeElement === document.body || !document.activeElement)) f.focus({ preventScroll: true });
  }
  // 읽던 자리: 다른 자료를 펼쳤다가 돌아오면 읽던 데서 다시 (이번 창에서만 — 새로 고치면 처음부터)
  const READPOS = new Map();
  const posKey = o => (o && ['doc', 'person', 'photo', 'compare'].includes(o.t) ? `${C.id}|${o.t}|${o.id}` : '');
  function keepPos() { const k = posKey(ST.view.open), pr = $('#paneRead'); if (k && pr) READPOS.set(k, pr.scrollTop); }
  function openItem(o) {
    const first = (o.t === 'doc' || o.t === 'photo') && !ST.seen.includes(o.id);
    keepPos();
    ST.view.open = o;
    if (o.t === 'person' && C.people[o.id]) { ST.asked[o.id] ||= []; CHIPS = null; } // 찾아가 첫마디를 들었으면 목록의 빨간 표시는 걷힌다 (문서를 펼치면 걷히듯)
    save(); sfx('page');
    renderRead(); renderList();
    if (o.t === 'feed') { renderTabs(); const pr = $('#paneRead'); if (pr) setTimeout(() => { pr.scrollTop = pr.scrollHeight; }, 0); }
    if (first && ST.seen.includes(o.id)) advance(o.t === 'photo' ? 'photo' : 'doc');
    $('#paneRead').scrollTop = READPOS.get(posKey(o)) || 0;
    const doc = $('#paneRead > :not(.back-list)'); if (doc) doc.classList.add('enter');
    // 검색 결과에서 연 문서: 찾은 말에 형광펜이 한 번 지나가고, 처음 펼친 문서면 그 말이 있는 데까지 내려 준다
    const sr = curSrc(), sq = sr && sr.type === 'archive' && o.t === 'doc' ? ST.view.q[sr.id] : '';
    if (sq) {
      const ks = matchKeys(sq), pr = $('#paneRead'), ws = $$('#paneRead .kw').filter(b => ks.includes(b.dataset.kw));
      ws.forEach(b => b.classList.add('hitw'));
      if (ws[0] && !READPOS.get(posKey(o))) { const r = ws[0].getBoundingClientRect(), pb = pr.getBoundingClientRect(); if (r.bottom > pb.bottom - 24) pr.scrollTop += r.top - pb.top - pb.height / 3; }
    }
    if (!beside()) $('.stage').scrollIntoView({ block: 'start' }); // 수첩이 밑에 있으면 (수첩에서 열었을 수 있으니) 화면으로 올라간다
    // 처음 만나는 사람은 첫마디를 재생한다
    const p = o.t === 'person' && C.people[o.id];
    if (p && !tmp().met.has(p.id)) { tmp().met.add(p.id); if (!(ST.asked[p.id] || []).length) playTalk($('.per-tr .qa-first'), { p, lead: 650 }); }
  }
  function setQ(srcId, q) {
    ST.view.src = srcId; ST.view.q[srcId] = q;
    const n = norm(q), sq = ((ST.view.sq ||= {})[srcId] ||= []), again = sq.includes(n); if (n && !again) { sq.push(n); if (sq.length > 120) sq.splice(0, sq.length - 120); } // 찾아본 말 (칩을 흐리게) — 기록이 한없이 불지 않게 최근 것만
    save();
    renderTabs(); renderList();
    const hit = n && $('.arch .res .item, .arch .res .res-none'); // 수첩 칩이 많아지면 결과가 화면 밑으로 밀린다 — 첫 결과가 보이게
    if (hit) { const b = hit.getBoundingClientRect(); if (b.top < 0 || b.bottom > innerHeight - 90) hit.scrollIntoView({ block: 'center', behavior: reduced() ? 'auto' : 'smooth' }); } // 화면 아래 증거물 꼬리표에 가리지 않게
    if (n && !again) { const src = C.sources.find(x => x.id === srcId); advance('search', src && archiveHits(src, q).length ? undefined : 1); } // 한 번 찾아본 말을 다시 찾는 데는 수사 시간이 들지 않는다 (결과를 다시 펼칠 뿐) · 아무것도 안 나온 검색은 1분만 (표기를 바꿔 몇 번 쳐 보다 시계가 한 시간씩 가지 않게)
  }
  function search(kid) {
    let s = curSrc();
    if (!s || s.type !== 'archive') s = C.sources.find(x => x.type === 'archive' && srcVisible(x));
    if (!s) { toast(T('이 사건에는 단어로 찾아볼 검색창이 없다 — 단어는 사람을 펼쳐 두고 물을 때 쓴다')); return; }
    setQ(s.id, C.keywords[kid].label);
    if (narrow()) { ST.view.open = null; renderRead(); }
    if (!beside()) $('.stage').scrollIntoView({ block: 'start' });
  }
  function ask(k) {
    const o = ST.view.open;
    if (!o || o.t !== 'person') return;
    const p = C.people[o.id];
    const e = askEntry(p, k);
    const a = (ST.asked[p.id] ||= []);
    const fresh = !a.includes(e);
    // 이미 물은 것을 다시 누르면(두 번 톡 누름 포함) 그 대답만 짚어 준다 — 한창 나오는 대답을 다시 그려 끊지 않는다
    if (!fresh && TALK && TALK.alive()) {
      const q0 = $$('.per-tr .qa').find(x => x.dataset.qa === e);
      if (q0) { q0.classList.remove('flash'); void q0.offsetWidth; q0.classList.add('flash'); }
      return;
    }
    if (fresh) a.push(e);
    save();
    const BY = {}, before = census(BY);
    tmp().met.add(p.id);
    renderRead(); renderList();
    const qa = $$('.per-tr .qa').find(x => x.dataset.qa === e);
    if (qa) $('#paneRead').scrollTop = qa.offsetTop - 12;
    if (census() > before) renderTabs();
    if (fresh) playAsk(p, e);
    else if (qa) { qa.classList.remove('flash'); void qa.offsetWidth; qa.classList.add('flash'); }
    if (fresh) advance('ask');
  }
  function chip(k) {
    const o = ST.view.open;
    if (o && o.t === 'person') { ask(k); if (!beside()) $('.stage').scrollIntoView({ block: 'start' }); return; }
    search(k);
  }
  // 한글 자판인 채로 영문 비밀번호를 치면 (dubu → 여ㅠㅕ) 같은 자리의 영문 글쇠로 되돌려 본다 (두벌식)
  const QW = { cho: 'r R s e E f a q Q t T d w W c z x v g'.split(' '), jung: 'k o i O j p u P h hk ho hl y n nj np nl b m ml l'.split(' '), jong: ['', ...'r R rt s sw sg e f fr fa fq ft fx fv fg a q qt t T d w c z x v g'.split(' ')] };
  const JAMO = 'ㄱㄲㄳㄴㄵㄶㄷㄸㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅃㅄㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JKEY = 'r R rt s sw sg e E f fr fa fq ft fx fv fg a q Q qt t T d w W c z x v g k o i O j p u P h hk ho hl y n nj np nl b m ml l'.split(' ');
  // \ub7ec\uc2dc\uc544\uc5b4 \uc790\ud310(\u0419\u0426\u0423\u041a\u0415\u041d)\uc73c\ub85c \uce5c \uae00\uc790\ub3c4 \uac19\uc740 \uc790\ub9ac\uc758 \ub85c\ub9c8\uc790\ub85c (\u0435\u0449\u0430\u04330317 = tofu0317)
  const JCUK = '\u0439\u0446\u0443\u043a\u0435\u043d\u0433\u0448\u0449\u0437\u0445\u044a\u0444\u044b\u0432\u0430\u043f\u0440\u043e\u043b\u0434\u0436\u044d\u044f\u0447\u0441\u043c\u0438\u0442\u044c\u0431\u044e', JCUK_Q = "qwertyuiop[]asdfghjkl;'zxcvbnm,.";
  const qwerty = v => String(v ?? '').replace(/[\u0430-\u044f\u0451\u0410-\u042f\u0401]/g, ch => { const c = ch.toLowerCase(); return JCUK_Q[JCUK.indexOf(c === '\u0451' ? '\u0435' : c)] ?? ch; }).replace(/[\uac00-\ud7a3\u3131-\u3163]/g, ch => { const c = ch.charCodeAt(0); if (c < 0xac00) return JKEY[JAMO.indexOf(ch)] || ch; const x = c - 0xac00; return QW.cho[Math.floor(x / 588)] + QW.jung[Math.floor((x % 588) / 28)] + QW.jong[x % 28]; });
  function tryLock(id, v) {
    const target = C.docs[id] || C.sources.find(s => s.id === id);
    const lock = target && target.lock;
    if (!lock) return;
    if (!norm(v)) { const i = $(`#lk-${CSS.escape(id)}`); if (i) i.focus(); return; } // 아무것도 넣지 않고 누른 것은 틀린 번호로 세지 않는다
    const codes = (lock.code || []).map(norm);
    if ([v, qwerty(v), String(v).replace(/[#*]/g, '')].some(x => codes.includes(norm(x)))) {
      const BY = {}, before = census(BY);
      if (!ST.unl.includes(id)) ST.unl.push(id);
      (lock.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
      save(); refreshAll(); cue('unlock', T('열림')); land(C.docs[id] ? ['#paneRead .doc-t', '#paneList .item.on'] : ['#paneList .item', '#srcTabs .tab.on']);
      const gained = census() - before;
      toast((lock.ok || T('열렸다.')) + (gained > 0 ? opened(gained, BY) : ''));
      liveSync();
    } else {
      tmp().fail[id] = (tmp().fail[id] || 0) + 1;
      renderList(); renderRead();
      say(T`${plain(lockErr(lock))} (${tmp().fail[id]}회)`);
      // 틀리면 그 기계답게 거절한다: 전화는 짧게 끊기는 신호음, 워드프로세서는 삑삑, 노트북은 입력창이 도리질 (커서는 js/ui.js 가 칸에 돌려준다)
      sfx(lock.style === 'phone' ? 'reorder' : lock.style === 'lcd' ? 'lcdbeep' : C.frame === 'papers' ? 'miss' : 'deny');
      const f = $$('[data-lock]').find(x => x.dataset.lock === id), box = f && f.closest('.lock');
      if (box) box.classList.add('denied');
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
      const BY = {}, before = census(BY);
      ST.unl.push(s.id);
      ((s.reward && s.reward.keys) || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
      save(); refreshAll(); liveSync(); cue('match', T('해독')); land(['#paneRead .c-done', '#paneRead .doc-t']); showDone();
      const gained = census() - before;
      toast(T`해독했다${gained > 0 ? opened(gained, BY) : ''}`);
    } else {
      sfx('miss');
      sayMsg((s.feedback || (lv() >= 5 ? 'none' : 'count')) === 'none' ? T('아직 문장이 되지 않는다.') : T`기호 ${syms.length}개 중 ${right}개가 맞는 것 같다.`);
    }
  }
  // 대조·재구성 결과 한 줄: 같은 말이 되풀이돼도 다시 맞춰 봤다는 게 보이게 새로 적는다
  function sayMsg(t) {
    const m = $('.c-msg');
    if (!m) return;
    m.textContent = t;
    m.classList.remove('again'); void m.offsetWidth; m.classList.add('again');
    say(t); // 칸을 새로 그린 바로 뒤라 그 칸에서는 읽히지 않을 수 있다
  }
  // 풀어서 칸·단추가 사라져 초점이 몸통으로 떨어졌으면 새로 드러난 것으로 (force: 떨어지지 않았어도)
  const showDone = () => { const d = beside() && $('#paneRead .c-done'); if (d) d.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' }); };
  function land(sels, force) {
    const a = document.activeElement;
    if (!force && a && a !== document.body && a.isConnected) return;
    const el = [].concat(sels).map(x => $(x)).find(x => x && x.offsetParent !== null);
    if (!el) return;
    if (!el.matches('a[href],button,input,select,textarea,[tabindex]')) el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }
  function solveThing(id, reward, msg, stamp) {
    const BY = {}, before = census(BY);
    if (!ST.unl.includes(id)) ST.unl.push(id);
    ((reward && reward.keys) || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); refreshAll(); cue('match', stamp || T('일치')); land(['#paneRead .c-done', '#paneRead .doc-t']); showDone();
    const gained = census() - before;
    toast(msg + (gained > 0 ? opened(gained, BY) : ''));
    liveSync();
  }
  function moveTl(arg) {
    const [sid, eid, dir] = arg.split('|');
    const s = C.sources.find(x => x.id === sid);
    if (!s || ST.unl.includes(sid)) return;
    const o = tlOrder(s), i = o.indexOf(eid), j = i + +dir;
    if (i < 0 || j < 0 || j >= o.length) return;
    [o[i], o[j]] = [o[j], o[i]];
    delete tmp().tl[sid];
    // 바뀐 두 장이 제자리로 미끄러져 들어간다 (다시 그리기 전후의 자리 차이만큼 거슬러 올라갔다가)
    const at = () => Object.fromEntries($$('.tl-e[data-ev]').map(li => [li.dataset.ev, li.getBoundingClientRect().top]));
    const was = at();
    save(); sfx('page'); renderRead();
    if (!reduced()) {
      const now = at();
      $$('.tl-e[data-ev]').forEach(li => {
        const d = was[li.dataset.ev] - now[li.dataset.ev];
        if (!d || !li.animate) return;
        const mine = li.dataset.ev === eid; // 손에 든 카드는 다른 카드 위로 지나간다
        if (mine) { li.style.position = 'relative'; li.style.zIndex = '2'; }
        const how = { duration: 240, easing: 'cubic-bezier(.2,.75,.3,1)' };
        li.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], how).onfinish = () => { if (mine) { li.style.position = ''; li.style.zIndex = ''; } };
        const sl = li.querySelector('.tl-slot'); // 칸의 시각은 판에 적힌 것: 제자리에 둔 채 스며 나온다
        if (sl) sl.animate([{ transform: `translateY(${-d}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], how);
      });
    }
    const b = $(`[data-tl="${sid}|${eid}|${dir}"]:not(:disabled)`) || $(`[data-tl="${sid}|${eid}|${-dir}"]`); // 맨 끝에 닿아 그 쪽 단추가 잠기면 반대쪽 단추로
    if (b) b.focus();
  }
  function checkTimeline(sid) {
    const s = C.sources.find(x => x.id === sid);
    if (!s) return;
    if (tmp().tl[sid]) { sayMsg(T('방금 맞춰 본 그대로다. 카드를 옮긴 뒤에 다시 맞춰 본다.')); return; } // 카드를 옮기면 지워지는 표: 그대로면 시간을 또 쓰지 않는다
    const o = tlOrder(s);
    const hit = o.filter((id, i) => id === s.events[i].id);
    advance('timeline');
    if (hit.length === o.length) return solveThing(sid, s.reward, s.ok || T('앞뒤가 맞아떨어졌다'), T('재구성'));
    tmp().tl[sid] = lv() <= 3 ? hit : [];
    renderRead();
    sfx('miss');
    sayMsg(lv() >= 5 ? T('아직 앞뒤가 맞지 않는다.') : T`${o.length}개 중 ${hit.length}개가 제자리인 것 같다.`);
  }
  function pickCompare(arg) {
    const [xid, oid] = arg.split('|');
    const x = C._sets[xid];
    if (!x || ST.unl.includes(xid)) return;
    const st = cmpState(x);
    if (lv() >= 4 && st.at >= 0 && progress() <= st.at) return;
    advance('compare');
    if (oid === x.answer) return solveThing(xid, x.reward, x.ok || T('감정 결과 일치'), T('일치'));
    if (!st.x.includes(oid)) st.x.push(oid);
    st.at = progress();
    save(); cue('miss'); renderRead();
    const m = $('.c-msg'); if (m && m.textContent) say(m.textContent);
  }
  function runQuery(form) {
    const s = C.sources.find(x => x.id === form.dataset.query);
    if (!s) return;
    const inp = {};
    (s.fields || []).forEach(fl => { const i = form.querySelector(`[data-qf="${fl.id}"]`); inp[fl.id] = i ? i.value.trim() : ''; });
    const hits = queryHits(s, inp);
    if (!hits) { toast(T('조회할 것을 먼저 적는다')); const i = form.querySelector('input'); if (i) i.focus(); return; } // 빈칸 조회는 시간도 쓰지 않는다
    // 같은 조회를 다시 하면 결과만 다시 펼친다 (수사 시간이 들지 않는다)
    const sig = JSON.stringify((s.fields || []).map(fl => norm(inp[fl.id]))), done = ((ST.view.qdone ||= {})[s.id] ||= []), again = done.includes(sig);
    if (!again) { done.push(sig); if (done.length > 120) done.splice(0, done.length - 120); }
    ST.view.qin[s.id] = inp;
    ST.view.qres[s.id] = hits || [];
    const BY = {}, before = census(BY);
    const fr = (ST.found[s.id] ||= []);
    (hits || []).forEach(id => { if (!fr.includes(id)) fr.push(id); });
    (s.records || []).filter(r => (hits || []).includes(r.doc)).forEach(r => (r.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); }));
    save(); sfx('page');
    renderTabs(); renderList(); renderNotebook();
    if (hits && hits.length === 1) openItem({ t: 'doc', id: hits[0] });
    if (census() > before) { cue('clue'); toast(T`새로 열린 것 ${census() - before}` + where(BY)); }
    if (!again) advance('query');
  }
  function photoFind(xid, test) {
    const x = C._scenes[xid];
    if (!x) return false;
    const sp = sceneSpots(x).find(p => !ST.unl.includes(p.id) && test(p));
    if (!sp) return false;
    const BY = {}, before = census(BY);
    ST.unl.push(sp.id);
    (sp.keys || []).forEach(k => { if (!ST.keys.includes(k)) ST.keys.push(k); });
    save(); refreshAll(); liveSync(); // 현행 사건: 사진에서 찾은 것으로 조건이 찬 단톡방 말·기한도 바로
    const gained = census() - before;
    const all = sceneSpots(x).every(p => ST.unl.includes(p.id));
    if (all) cue('match', T('관찰 끝')); else if (gained > 0) cue('clue'); else sfx('find');
    toast(T`눈에 걸리는 것: ${plain(sp.label)}${gained > 0 ? opened(gained, BY) : ''}`);
    const li = $$('.ph-found li').pop();
    if (li && !(MG.writeIn && MG.writeIn(li, { duration: 500 }))) li.classList.add('fresh');
    return true;
  }
  function photoClick(el, e) {
    // 테두리를 뺀 안쪽(그림) 기준으로 잰다
    const r = el.getBoundingClientRect(), w = el.clientWidth || r.width, h = el.clientHeight || r.height;
    const px = ((e.clientX - r.left - el.clientLeft) / w) * 100, py = ((e.clientY - r.top - el.clientTop) / h) * 100;
    const near = p => Math.hypot(px - p.x, (py - p.y) * (h / w)) <= (p.r || 7);
    const hit = photoFind(el.dataset.ph, near);
    const x = !hit && C._scenes[el.dataset.ph], old = x && (x.spots || []).find(sp => ST.unl.includes(sp.id) && near(sp));
    if (old) { // 이미 찾은 자리: 헛짚었다고 하지 않고 그 번호 동그라미를 한 번 짚는다
      const i = (x.spots || []).filter(sp => ST.unl.includes(sp.id)).indexOf(old), mk = el.querySelectorAll('.ph-mk')[i];
      toast(T`이미 찾은 것: ${plain(old.label)}`);
      if (mk) { mk.classList.remove('again'); void mk.offsetWidth; mk.classList.add('again'); }
      return;
    }
    if (!hit) {
      const d = document.createElement('span');
      d.className = 'ph-miss'; d.style.left = px + '%'; d.style.top = py + '%';
      el.appendChild(d); setTimeout(() => d.remove(), 700);
    }
  }
  function photoCell(arg) {
    const [xid, q, r] = arg.split('|').map((v, i) => (i ? +v : v));
    const inCell = p => Math.min(3, Math.floor(p.x / 25)) === q && Math.min(2, Math.floor(p.y / (100 / 3))) === r;
    if (photoFind(xid, inCell)) return;
    const x = C._scenes[xid], old = x && sceneSpots(x).find(sp => ST.unl.includes(sp.id) && inCell(sp)); // 이미 찾은 것만 있는 칸
    toast(old ? T`이 칸에서는 이미 찾았다: ${plain(old.label)}` : T('이 칸에는 눈에 걸리는 것이 없다'));
  }
  // 보고서 올리기: 주인공이 범인을 지목하고(목소리), 한 박자 쉰 뒤 판정
  let JUDGING = false;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function submitReport() {
    if (JUDGING) return;
    const sol = C.solution, c0 = C, s0 = ST, fm = FORM(); // 판정이 나오기 전에 다른 수사관 서랍으로 바뀌면 그 사람 화면에 이 결말을 띄우지 않는다
    const has = id => ST.notes.some(n => String(n.id) === String(id));
    if (!ST.report.culprit || sol.claims.some(cl => !ST.report.claims[cl.id] || !has(ST.report.claims[cl.id]))) { VERDICT = T`빈칸이 남아 있다. ${fm.short}${josa(fm.short, '을', '를')} 고르고, 칸마다 메모를 붙여야 올릴 수 있다.`; renderRep(); say(VERDICT); sfx('miss'); return; }
    // 방금 반려된 보고서를 한 칸도 고치지 않고 다시 올리면: 제출 횟수를 쓰지 않고 그렇다고만 알려 준다
    const sig = JSON.stringify([ST.report.culprit, sol.claims.map(cl => String(ST.report.claims[cl.id]))]);
    if (!ST.solved && ST.lastRep === sig) { VERDICT = T`방금 반려된 ${fm.title} 그대로다. 어딘가 고쳐서 올린다.`; renderRep(); say(VERDICT); sfx('miss'); return; }
    ST.tries++;
    const bad = ST.report.culprit === sol.culprit ? [] : [fm.short];
    sol.claims.forEach((cl, i) => {
      const n = ST.notes.find(x => String(x.id) === String(ST.report.claims[cl.id]));
      if (!n || !(cl.accept || []).includes(n.f)) bad.push(T`${i + 1}번`);
    });
    const wrong = bad.length;
    const fresh = wrong === 0 && !ST.solved;
    ST.lastRep = wrong ? sig : null;
    if (wrong === 0) { ST.solved = true; VERDICT = ''; }
    else if (lv() >= 5) VERDICT = sol.far || T('반려. 어디가 틀렸는지는 적혀 있지 않다.');
    else {
      VERDICT = wrong === 1 ? sol.near || T('딱 한 군데가 어긋난다.') : sol.far || T('아직 이야기가 이어지지 않는다. 더 쫓아가 보자.');
      // ★3 은 한 칸만 남았을 때 그 칸을 짚어 준다. 여러 칸이 틀렸을 때까지 칸을 알려 주면 칸마다 메모를 바꿔 끼워 찍기로 풀린다 (연습 사건만 전부 알려 준다)
      if (lv() <= 3 && (wrong === 1 || C.kind === 'tutorial')) VERDICT += T` (어긋난 칸: ${bad.join(', ')})`;
    }
    save();
    // 연출: 지목 → 침묵 → 판정
    JUDGING = true;
    $$('.verdict').forEach(v => { v.textContent = FORM().judging; v.classList.add('wait'); });
    say(FORM().judging);
    const view = $('.rep-view'); if (view) view.classList.add('judging');
    sfx('page');
    const v = MG.sound ? MG.sound.hero('accuse') : null;
    (v ? v.done.then(() => wait(900)) : wait(1800)).then(() => {
      JUDGING = false;
      if (C !== c0 || ST !== s0) return;
      renderRep();
      if (fresh) {
        const box = $('.rep-view .rep-solved') || $('#solvedBox');
        if (box) {
          box.innerHTML = solvedHtml(true); box.scrollIntoView({ block: 'nearest', behavior: reduced() ? 'auto' : 'smooth' });
          if (document.activeElement === document.body) { box.tabIndex = -1; box.focus({ preventScroll: true }); } // 키보드로 올렸으면 결말부터 읽히게
        }
        cue('solved', T('사건 종결')); say(T('사건 종결')); renderBar(); // 아래 줄의 시계도 「종결」로
        if (MG.sound) setTimeout(() => { if (C === c0 && ST === s0) MG.sound.hero('solved'); }, 2000);
      } else if (wrong === 0) toast(T('이미 닫힌 사건이다'));
      else {
        cue('miss'); say(VERDICT);
        const r = $('.rep-view'); if (r) { r.classList.remove('bounced'); void r.offsetWidth; r.classList.add('bounced'); }
        if (MG.sound) setTimeout(() => { if (C === c0 && ST === s0) MG.sound.hero('wrong'); }, 500);
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
  let TYPED = 0; // 마지막으로 칸에 적는 소리를 낸 때
  function bind() {
    document.addEventListener('click', e => {
      const t = e.target;
      let el;
      if ((el = t.closest('[data-open]'))) return openCase(el.dataset.open, true);
      if ((el = t.closest('[data-cw-ok]'))) { const c = MG.byId[el.dataset.cwOk]; if (c) { cs(c).cw = true; save(); openCase(c.id, true); } return; }
      if (t.closest('[data-cabinet]')) { // 기록실로: 방금 보던 사건 폴더가 있는 자리로 돌아간다 (서랍에 도로 꽂듯)
        const cw = t.closest('.cw') && app.querySelector('[data-cw-ok]');
        const from = C ? C.id : cw ? cw.dataset.cwOk : null; // 혐오감 주의 앞에서 돌아가도 그 폴더로
        cabinet(); window.scrollTo(0, 0);
        const f = from && !$('.f-stamp.fresh') && $$('[data-open]').find(x => x.dataset.open === from);
        const off = f && f.getBoundingClientRect().bottom > window.innerHeight;
        if (off) f.scrollIntoView({ block: 'center' });
        if (f && (off || e.detail === 0)) f.focus({ preventScroll: true }); // 키보드로 돌아온 때는 화면 안에 있어도 그 폴더에
        return;
      }
      if ((el = t.closest('[data-mild]'))) { S.mild = !S.mild; save(); if (C) { renderCase(); if (MG.mood) MG.mood.enter(C); } else if (t.closest('.cw')) { const id = app.querySelector('[data-cw-ok]'); if (id) warnScreen(MG.byId[id.dataset.cwOk], true); } else cabinet(); return; }
      if ((el = t.closest('[data-voice]'))) { S.voice = S.voice === false; save(); if (!S.voice && MG.sound) MG.sound.stopVoice(); el.outerHTML = voiceBtn(); return; }
      if ((el = t.closest('[data-sound]'))) { S.sound = !S.sound; save(); const vb = el.parentNode && el.parentNode.querySelector('[data-voice]'); if (vb) vb.remove(); if (!S.sound && MG.sound) MG.sound.stopVoice(); el.outerHTML = soundBtn(); if (S.sound) sfx('pen'); if (MG.mood) MG.mood.sound(); return; }
      if (t.closest('[data-roster]')) return toggleRoster();
      if ((el = t.closest('[data-player]'))) return usePlayer(el.dataset.player);
      if ((el = t.closest('[data-drop]'))) return armed(el, T('한 번 더 누르면 그 서랍이 비워진다'), () => dropPlayer(el.dataset.drop));
      if (t.closest('[data-card]')) { resultCard(); return; }
      if (t.closest('[data-share]')) { copyText(shareText()).then(ok => toast(ok ? T('결과를 복사했다. 붙여 넣어 올리면 된다.') : T('복사하지 못했다. 이 브라우저가 복사를 막고 있다.'), 3200)); return; }
      if (t.closest('[data-rate-off]')) { S.rateOff = true; save(); cabinet(); return; }
      if (t.closest('[data-intro-ok]')) { S.intro = true; save(); cabinet(); if (e.detail === 0) { const c0 = $('[data-open="c00"]'); if (c0) c0.focus(); } return; } // 키보드로 서랍을 열었으면 쪽지가 가리킨 CASE 00 폴더로
      if ((el = t.closest('[data-wipe]'))) return armed(el, roster().list.length > 1 ? T('한 번 더 누르면 내 기록이 지워진다') : T('한 번 더 누르면 전부 지워진다'), () => { S = Object.assign(blank(), { sound: S.sound, voice: S.voice, mild: S.mild }); forget(); save(); cabinet(); /* 수사 기록만 지운다: 소리·목소리·잔혹 표현 설정은 그대로 */ });
      if (!C) return;
      if ((el = t.closest('.lv-more'))) { const pr = $('#paneRead'); if (pr) pr.scrollTo({ top: pr.scrollHeight, behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); el.remove(); land('#paneRead'); return; }
      if ((el = t.closest('.lv-note'))) { // 휴대폰 알림: 누르면 그곳으로
        if (el.dataset.moved) { delete el.dataset.moved; return; } // 밀어 치우던 것
        const tt = el.dataset.lvT, id = el.dataset.lvId, src = el.dataset.lvSrc;
        el.remove();
        if (!tt || !id) return land(['#lvNotes .lv-note', '#paneList .item.on', '#srcTabs .tab.on']);
        if (src && C.sources.some(s => s.id === src)) { ST.view.src = src; renderTabs(); renderList(); }
        openItem({ t: tt, id }); land(['#paneList .item.on', '#srcTabs .tab.on']); return;
      }
      if ((el = t.closest('[data-wait]'))) return waitsPast() ? armed(el, T('한 번 더 누르면 기한을 넘긴다'), waitNext) : waitNext();
      if ((el = t.closest('[data-req]'))) return openItem({ t: 'req', id: el.dataset.req });
      if ((el = t.closest('[data-rq-go]'))) return submitReq(el.dataset.rqGo);
      if ((el = t.closest('[data-feed]'))) return openItem({ t: 'feed', id: el.dataset.feed });
      if (TALK && !TALK.alive()) TALK = null;
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
      if (t.closest('[data-nudge]')) return toggleNudge();
      if (t.closest('[data-nudge-more]')) { if (NUDGE) { NUDGE.more = true; renderNudge(); const g = $('#nudgeBox .nudge-go'); if (g && e.detail === 0) g.focus(); } return; }
      if ((el = t.closest('[data-nudge-go]'))) return nudgeGo(el.dataset.nudgeGo);
      if ((el = t.closest('[data-pin]'))) return pin(el.dataset.pin);
      if ((el = t.closest('[data-kw]'))) return addKey(el.dataset.kw, false, el.textContent);
      if ((el = t.closest('[data-bub]')) && !getSelection().toString()) return pin(el.dataset.bub); // 말풍선을 누르면 수첩에
      if ((el = t.closest('[data-src]'))) {
        if (ST.view.src !== el.dataset.src) sfx('page'); // 다른 철·다른 창으로 넘어갈 때만
        const kept = el.closest('#srcTabs') && document.activeElement && document.activeElement.closest && document.activeElement.closest('#srcTabs'); // 탭 줄을 다시 그려도 초점은 고른 탭에
        keepPos();
        ST.view.src = el.dataset.src;
        const s = curSrc();
        if (s.type === 'cipher' || s.type === 'timeline') ST.view.open = { t: s.type, id: s.id };
        else if (narrow()) ST.view.open = null;
        else if (s.type === 'feed') ST.view.open = { t: 'feed', id: s.id }; // 단톡방 탭은 방이 하나뿐: 넓은 화면이면 누르자마자 방이 열린다 (읽기 칸에 사건 안내만 남지 않게)
        save(); renderTabs(); renderList(); renderRead();
        if (kept) { const on = $('#srcTabs .tab.on'); if (on) on.focus({ preventScroll: true }); }
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
      if (t.closest('[data-ph-grid]')) { const b = t.closest('[data-ph-grid]'), g = $('.ph-grid'); if (g) { g.hidden = !g.hidden; b.setAttribute('aria-pressed', String(!g.hidden)); if (b.dataset.phGrid) { if (g.hidden) PHGRID.delete(b.dataset.phGrid); else PHGRID.add(b.dataset.phGrid); } } return; }
      if ((el = t.closest('[data-cens]')) && !el.classList.contains('open') && !(S.mild && el.closest('[data-ph]'))) {
        if (S.mild) { toast(T('잔혹 표현이 꺼져 있다')); return; }
        if (!ST.cens.includes(el.dataset.cens)) ST.cens.push(el.dataset.cens);
        save(); $$(`[data-cens="${el.dataset.cens}"]`).forEach(x => x.classList.add('open', 'reveal')); sfx('dread');
        return;
      }
      if ((el = t.closest('[data-ph]'))) return photoClick(el, e);
      if ((el = t.closest('[data-ask]'))) return ask(el.dataset.ask);
      if ((el = t.closest('[data-search]'))) return search(el.dataset.search);
      if ((el = t.closest('[data-chip]'))) return chip(el.dataset.chip);
      if ((el = t.closest('[data-del]'))) return delNote(+el.dataset.del);
      if (t.closest('[data-open-rep]')) { REPOPEN = null; openItem({ t: 'report' }); if (!e.detail) land(['#paneRead .rep-view input:checked', '#paneRead .rep-view input', '#paneRead .rep-view'], true); return; } // 키보드로 펼쳤으면 초점도 보고서로
      if ((el = t.closest('[data-rep-open]'))) { REPOPEN = REPOPEN === el.dataset.repOpen ? null : el.dataset.repOpen; renderRep(); const a = $('.rep-claim.open'); if (a) { a.scrollIntoView({ block: 'nearest' }); const q = a.querySelector('[data-rep-filter]'); if (q && !narrow()) q.focus({ preventScroll: true }); } return; }
      if (t.closest('[data-back]')) {
        const was = ST.view.open;
        keepPos(); ST.view.open = null; save(); renderRead(); renderList();
        // 목록에 돌아오면 방금 읽던 항목이 보이는 자리로 (긴 목록 아래쪽에서 열었어도), 키보드로 왔으면 초점도 그 항목에
        const at = was && { doc: 'doc', person: 'person', req: 'req', feed: 'feed', compare: 'cmp', photo: 'scene', cipher: 'open-cipher', timeline: 'open-tl' }[was.t];
        const it = at && $(`#paneList [data-${at}="${CSS.escape(String(was.id))}"]`);
        if (it) { it.scrollIntoView({ block: 'nearest' }); if (e.detail === 0) it.focus({ preventScroll: true }); }
        return;
      }
      if ((el = t.closest('[data-reset]'))) return armed(el, T('한 번 더 누르면 이 사건 기록이 지워진다'), () => {
        if (JUDGING) return; // 보고서를 넘기는 중에는 (판정이 새 기록 위에 떨어지지 않게)
        const cw = S.cases[C.id] && S.cases[C.id].cw; // 혐오감 주의는 이미 읽고 들어왔으니 다시 묻지 않는다
        delete S.cases[C.id]; if (cw) S.cases[C.id] = { cw: true };
        forget(C.id); clearNotes(); // 틀린 횟수·읽던 자리·접어 둔 묶음, 아직 떠 있는 휴대폰 알림도 처음으로
        if (S.seen) { S.seen.done = S.seen.done.filter(x => x !== C.id); S.seen.m = S.seen.m.filter(x => x !== C.id); } save(); openCase(C.id); toast(T('처음부터 다시')); });
    });
    document.addEventListener('submit', e => {
      const f = e.target;
      if (f.matches('[data-mwho]')) { e.preventDefault(); return guessM(f); }
      if (f.matches('[data-pnew]')) { e.preventDefault(); return newPlayer(f.querySelector('input').value); }
      if (f.matches('[data-pname]')) { e.preventDefault(); const i = f.querySelector('input'); i.blur(); if (matchMedia('(pointer:fine)').matches) i.focus(); return; } // 흐려지면서 change 로 이름이 적힌다 (키보드면 칸에 그대로 남는다)
      if (!C) return;
      if (f.matches('[data-arch]')) { e.preventDefault(); setQ(f.dataset.arch, f.querySelector('input').value.trim()); const i = $(`#aq-${f.dataset.arch}`); if (i) { if (matchMedia('(pointer:fine)').matches) i.focus(); else i.blur(); } } // 손가락으로 쓰면 자판을 내려 결과가 보이게
      else if (f.matches('[data-lock]')) { e.preventDefault(); tryLock(f.dataset.lock, f.querySelector('input').value); }
      else if (f.matches('[data-cipher]')) { e.preventDefault(); checkCipher(f.dataset.cipher); }
      else if (f.matches('[data-query]')) { e.preventDefault(); runQuery(f); }
      else if (f.id === 'rep') { e.preventDefault(); submitReport(); }
    });
    window.addEventListener('popstate', onBack);
    // 같은 서랍을 다른 탭(창)에서도 열어 두었을 때: 그쪽에서 기록하면 이 탭도 그 기록으로 바꿔 든다.
    // 그러지 않으면 묵은 이 탭이 다음에 저장하면서 저쪽에서 푼 것·적은 것을 지워 버린다.
    window.addEventListener('storage', e => {
      if (e.key === ROSTER) { // 다른 창에서 이 창의 서랍을 명부에서 지웠으면: 그 창이 쓰는 서랍으로 옮겨 앉는다 (지워진 자리에 계속 적지 않게)
        const r = roster();
        if (r.list.some(p => p.id === PID)) return;
        PID = r.cur; S = load(PID); forget(); clearNotes(); stopTalk();
        if (MG.sound) MG.sound.stopVoice();
        SYNC = true;
        try { cabinet(); } finally { SYNC = false; }
        toast(T`다른 창에서 이 서랍을 명부에서 지웠다 — ${who(r.list.find(p => p.id === PID))}의 서랍으로`);
        return;
      }
      if (e.key !== slot(PID) || e.newValue == null) return;
      const cur = C && C.id, ro = !!$('.roster');
      const v = cur && ST && ST.view ? { src: ST.view.src, open: ST.view.open } : null, pr = $('#paneRead'), pl = $('#paneList'), top = [pr ? pr.scrollTop : 0, pl ? pl.scrollTop : 0]; // 무엇을 펼쳐 보고 있는지는 창마다 제 것
      const snap = id => (id && S.cases && S.cases[id] ? JSON.stringify(Object.assign({}, S.cases[id], { view: 0 })) : null);
      const was = snap(cur);
      S = load(PID);
      // 다른 창이 다른 사건을 만졌거나 보는 자리만 바뀌었으면 이 창은 다시 그리지 않는다 (쓰던 칸·나오던 대답이 끊기지 않게)
      if (cur && was === snap(cur)) { S.current = cur; ST = cs(C); if (v) Object.assign(ST.view, v); return; }
      // 다시 그려도 치던 칸은 그대로: 적던 글자와 커서 자리를 새 칸에 옮긴다
      const ae = document.activeElement, q = x => (window.CSS && CSS.escape ? CSS.escape(x) : x);
      const dsel = el => [...el.attributes].filter(t => t.name.startsWith('data-') && !/^data-(ui|1p|lp|bw|form-type|miss)/.test(t.name)).map(t => `[${t.name}="${q(t.value)}"]`).join('');
      const typing = ae && ae.matches && ae.matches('input:not([type="radio"]):not([type="checkbox"]),textarea') ? { sel: ae.id ? '#' + q(ae.id) : (ae.closest('form') ? 'form' + dsel(ae.closest('form')) + ' ' : '') + ae.tagName.toLowerCase() + dsel(ae), val: ae.value, a: ae.selectionStart, b: ae.selectionEnd } : null;
      SYNC = true;
      try {
        if (cur) { S.current = cur; ST = cs(C); if (v) Object.assign(ST.view, v); if (TEMP[cur]) TEMP[cur].tl = {}; clearNotes(); stopTalk(); renderCase();
          if (typing) { const n = $(typing.sel); if (n) { n.value = typing.val; n.focus({ preventScroll: true }); try { n.setSelectionRange(typing.a, typing.b); } catch (err) { /* type 이 달라 못 옮기면 그만 */ } } } const a = $('#paneRead'), b = $('#paneList'); if (a) a.scrollTop = top[0]; if (b) b.scrollTop = top[1]; } // 다른 창에서 판을 옮겼을 수 있으니 「방금 맞춰 본 판」 표는 비운다
        else if ($('.cabinet')) cabinet(ro);
      } finally { SYNC = false; }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && TALK && TALK.alive() && !$('.zoom')) TALK.finish(); }); // 대화 건너뛰기 (키보드)
    // Ctrl+S: 브라우저의 「다른 이름으로 저장」 창 대신 — 수첩과 진행은 서랍에 저절로 남는다
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); toast(T('적은 것은 서랍에 저절로 남는다. 따로 저장할 것은 없다.')); } });
    // 보고서는 「올리기」 단추로만 올린다: 범인·메모를 고르다가, 메모를 찾다가 Enter 를 눌러 모르고 올라가지 않게 (양식의 Enter 제출을 막는다).
    // 메모 찾기 칸의 Enter 는 걸린 메모가 하나뿐이면 그것을 고른다
    document.addEventListener('keydown', e => {
      const t = e.target;
      if (e.key !== 'Enter' || e.isComposing || e.keyCode === 229 || !C || !t.matches || !t.matches('#rep input')) return; // 229: 사파리는 한글 조합을 끝내는 Enter 를 조합이 끝난 뒤에 보낸다
      e.preventDefault();
      if (!t.matches('[data-rep-filter]')) return;
      const hits = [...t.parentNode.querySelectorAll('.rep-opt:not([hidden]) input')].filter(i => !i.closest('.rep-grp[hidden]'));
      if (hits.length === 1 && !hits[0].checked) { hits[0].checked = true; hits[0].dispatchEvent(new Event('change', { bubbles: true })); }
    });
    // 탭 줄: ← → 로 옆 탭, Home·End 로 처음·끝 탭 (Tab 키는 고른 탭 하나에만 들렀다 본문으로 넘어간다)
    document.addEventListener('keydown', e => {
      const t = e.target;
      if (!C || e.altKey || e.ctrlKey || e.metaKey || !t.matches || !t.matches('#srcTabs .tab')) return;
      const tabs = $$('#srcTabs .tab'), i = tabs.indexOf(t);
      const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (j === null || i < 0) return;
      e.preventDefault();
      const n = tabs[(j + tabs.length) % tabs.length];
      if (n !== t) n.click();
    });
    document.addEventListener('scroll', e => { const t = e.target; if (t.id === 'srcTabs') tabEdge(t); else if (t.classList && t.classList.contains('b-tbl')) tblEdge(t); else if (t.matches && t.matches('.skin-news.vertical .doc-b')) colEdge(t); }, { capture: true, passive: true });
    window.addEventListener('resize', () => { tabShow($('#srcTabs')); tabEdge($('#srcTabs')); edges(); }, { passive: true });
    if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', () => { tabShow($('#srcTabs')); tabEdge($('#srcTabs')); edges(); }); // 글꼴이 늦게 와 탭·표 너비가 바뀐 때
    // 세로쓰기 신문 위에서 휠을 굴리면 읽는 방향(왼쪽)으로 넘긴다. 끝까지 읽었으면 휠은 원래대로 칸을 내린다
    // (문서 전체가 아니라 읽기 칸에만 건다: 문서 전체에 걸면 어디서 굴리든 브라우저가 이 손을 기다리느라 굴림이 굼떠진다)
    const vwheel = e => {
      const b = e.target.closest && e.target.closest('.skin-news.vertical .doc-b');
      if (!b || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const m = b.scrollWidth - b.clientWidth, x = Math.abs(b.scrollLeft), dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? b.clientWidth : 1);
      if (m <= 2 || (dy > 0 && x >= m - 1) || (dy < 0 && x <= 1)) return;
      e.preventDefault();
      b.scrollLeft -= dy;
    };
    MG._vwheel = vwheel;
    document.addEventListener('load', e => { if (e.target.tagName === 'IMG' && e.target.closest && e.target.closest('#paneRead, .map')) edges(); }, true); // 늦게 뜬 그림이 세로 신문을 밀어낸 때
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (!C || !d.matches || !d.matches('details[data-ng]')) return;
      const k = C.id + '|' + d.dataset.ng;
      if (d.open) NGSHUT.delete(k); else NGSHUT.add(k);
    }, true);
    document.addEventListener('pointerdown', () => { PTR = true; }, true);
    document.addEventListener('keydown', () => { PTR = false; }, true);
    document.addEventListener('change', e => {
      if (e.target.closest('[data-pname]')) return renamePlayer(e.target.value);
      if (e.target.matches('[data-lang]')) return MG.I18N.set(e.target.value);
      const rq = e.target.closest('[data-rq-pick]');
      if (rq && C) { tmp().rq[rq.dataset.rqPick] = rq.value; $$(`[data-rq-pick="${rq.dataset.rqPick}"]`).forEach(x => x.closest('.rep-opt').classList.toggle('on', x.checked)); sfx('ink'); return; }
      const s = e.target.closest('[data-rep]');
      if (!s || !C) return;
      // 마우스·손가락으로 고르면 목록을 접는다. 방향키로 고르는 중이면 펼쳐 둔다 (방향키는 옮기는 대로 골라지므로, 접으면 첫 메모에서 멈춘다 — 접기는 「접기」 단추로)
      if (s.dataset.rep === 'culprit') ST.report.culprit = s.value; else { ST.report.claims[s.dataset.rep] = s.value; if (PTR) REPOPEN = null; }
      save(); sfx('ink'); renderRep();
    });
    document.addEventListener('focusin', e => { const i = e.target.closest && e.target.closest('[data-sym]'); if (i) cipherHl(i.dataset.sym); });
    document.addEventListener('focusout', e => { if (CIPHL != null && e.target.closest && e.target.closest('[data-sym]') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-sym]'))) cipherHl(null); });
    document.addEventListener('input', e => {
      // 칸에 적는 소리: 노트북은 얕은 자판, 2006년 모니터와 90년대 종이 사건은 자판, 그 앞은 타자기, 1950년 앞은 연필 (소리 파일이 있을 때만, 너무 잦지 않게)
      if (C && S.sound && e.data && e.target.closest('.lock-phone')) dtmf(e.data.slice(-1));
      else if (C && S.sound && MG.sound && e.target.matches('input:not([type="radio"])') && e.target.closest('.case-view')) {
        const ink = inkKind(), now = Date.now(), f = ink === 'tap' ? ['click', 0.16, 45] : ink === 'kbd' || ink === 'oldkbd' ? ['key', 0.24, 45] : ink === 'typewriter' ? ['tw1', 0.24, 60] : ['pen', 0.14, 120];
        if (now - TYPED > f[2]) { TYPED = now; MG.sound.play('sfx/' + f[0], f[1]); }
      }
      const q = e.target.closest('[data-rep-filter]');
      if (q) { // 메모 찾기: 낱말이 든 메모만 남긴다
        const w = q.value.trim().toLowerCase(), box = q.parentNode;
        box.querySelectorAll('.rep-grp').forEach(g => { let any = 0; g.querySelectorAll('.rep-opt').forEach(o => { const hit = !w || o.textContent.toLowerCase().includes(w); o.hidden = !hit; any += hit; }); g.hidden = !any; });
        const none = box.querySelector('.rep-none'); if (none) none.hidden = !!box.querySelector('.rep-grp:not([hidden])');
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
    MG.cases.forEach(MG.I18N.applyCase); // 다른 언어면 번역을 원문 위에 덮는다 (prep 이 단어 이름을 읽기 전에)
    MG.I18N.applyFinale();
    MG.cases.forEach(prep);
    injectCss();
    // CSS 변수 안의 상대 주소는 css/ 폴더 기준으로 풀리므로, 페이지 기준 절대 주소로 바꿔 넣는다.
    [['desk', '--desk-img'], ['paper', '--paper-img'], ['warn', '--warn-img']].forEach(([k, v]) => { const u = MG.images['_global/' + k]; if (u) { document.documentElement.style.setProperty(v, 'url("' + new URL(u, document.baseURI).href + '")'); document.documentElement.classList.add('has-' + k); } });
    app = document.getElementById('app');
    statusBox('toast', 'toast'); statusBox('lvNotes', 'lv-notes'); statusBox('srSay', 'sr');
    bind();
    // 명부에 둘 이상이면 누가 앉았는지부터 묻는다: 마지막 사람의 사건을 바로 열지 않는다
    // 새로 고침하면 브라우저가 전에 보던 자리로 스크롤을 되돌린다. 누가 앉았는지 묻는 명부가 위에 가려지면 안 되므로 그때만 맨 위에서
    const ask = roster().list.length > 1;
    try { history.scrollRestoration = ask ? 'manual' : 'auto'; } catch (e) { /* ignore */ }
    if (ask) { cabinet('ask'); window.scrollTo(0, 0); }
    else if (S.current && MG.byId[S.current]) openCase(S.current); else cabinet();
  };
  MG.state = () => S;
  MG.sfx = kind => sfx(kind); // 여는 장면(js/mood.js)의 무전 소리
  MG.dev = { leads: () => leads(), nudge: () => nudgeHtml(), st: () => ST, advance: (k, m) => advance(k, m), wait: () => waitNext(), toggle: () => toggleNudge(), more: () => { if (NUDGE) NUDGE.more = true; } }; // tools/nudge-sim.js 가 짚어 보기만 따라 사건을 끝까지 가 본다
})();
