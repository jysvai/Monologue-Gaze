/* Monologue Gaze — 언어 (한국어가 원문, 영어·일본어·중국어·러시아어·독일어는 번역을 덮는다)
 * 1. 화면 글자: 코드에 T`한국어 ${x}` 또는 T('한국어') 로 적는다. 번역 꾸러미 i18n/<언어>/ui.js 의 열쇠는 그 한국어
 *    (자리 표시는 {0} {1} …). 번역이 없으면 한국어 그대로 나온다.
 * 2. 사건 기록: i18n/<언어>/<사건 id>.js 가 한국어 글 한 토막마다 지문(hash) → 번역을 둔다. 원문을 고치면 그 토막만
 *    한국어로 돌아가고, node tools/i18n.js check 가 빠진 곳을 알려 준다. 편지(js/finale.js)는 i18n/<언어>/finale.js.
 * 3. 답으로 치는 값(잠금 비밀번호 code · 조회 match · 편지의 answer · 단어 alias)은 번역을 더한다 — 한국어로 쳐도 맞는다.
 * 4. 글꼴은 css/i18n.css (html[lang] 마다), 날짜·시각은 MG.I18N.date 가 그 언어의 꼴로.
 * 고르는 순서: 주소의 ?lang=xx → 전에 고른 언어(mg-lang) → 브라우저 언어 → 영어. 바꾸면 새로 불러온다. */
(function () {
  'use strict';
  const MG = (window.MG = window.MG || {});
  const LANGS = [['ko', '한국어'], ['en', 'English'], ['ja', '日本語'], ['zh', '简体中文'], ['ru', 'Русский'], ['de', 'Deutsch']];
  const has = l => LANGS.some(x => x[0] === l);
  const KEY = 'mg-lang';
  const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

  function pick() {
    let q = null, saved = null;
    try { q = new URLSearchParams(location.search).get('lang'); } catch (e) { /* 옛 브라우저 */ }
    try { saved = localStorage.getItem(KEY); } catch (e) { /* 저장소 막힘 */ }
    let nav = [];
    try { nav = [].concat(navigator.languages || [], navigator.language || []).map(x => String(x).toLowerCase().slice(0, 2)); } catch (e) { /* navigator 없음 */ }
    for (const l of [q, saved, ...nav]) if (l && has(l)) return l;
    return 'en';
  }
  const lang = typeof window.document === 'undefined' ? 'ko' : pick();
  const packs = {}; // { ui: { 한국어: 번역 }, c00: { 지문: 번역 }, finale: { … } }

  // 지문: 53비트 (cyrb53) — tools/i18n.js 도 이 함수를 쓴다
  function hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  }

  /* ── 화면 글자 ── */
  const keys = new WeakMap();
  const T = function (s, ...v) {
    if (s == null) return s;
    if (typeof s === 'string') { if (lang === 'ko') return s; const t = (packs.ui || {})[s]; return t == null ? s : t; }
    let k = keys.get(s);
    if (k === undefined) { k = s.reduce((a, x, i) => (i ? a + '{' + (i - 1) + '}' + x : x), ''); keys.set(s, k); }
    const t = lang === 'ko' ? null : (packs.ui || {})[k];
    if (t == null) return s.reduce((a, x, i) => (i ? a + String(v[i - 1]) + x : x), '');
    return t.replace(/\{(\d+)\}/g, (m, n) => (+n < v.length ? String(v[+n]) : m));
  };

  /* ── 사건 기록 ──
   * 번역할 것: 한글이 든 문자열. 그림을 만드는 데만 쓰는 칸(svg·prompt …)은 건너뛴다.
   * 답으로 치는 칸(ATOM, match 의 값)은 통째로 한 토막 — 번역은 배열이고, 한국어 값과 합친다. */
  const SKIP = new Set(['svg', 'prompt', 'css', 'artStyle', 'must', 'avoid', 'redo', 'initial']);
  const ATOM = new Set(['alias', 'code', 'answer']);
  function walk(o, fn, path, inMatch) {
    const arr = Array.isArray(o);
    for (const k of arr ? o.keys() : Object.keys(o)) {
      const v = o[k], p = path ? path + '.' + k : String(k);
      if (!arr && (SKIP.has(k) || k[0] === '_')) continue;
      if (typeof v === 'string') { if (HAN.test(v)) fn(o, k, v, inMatch && !arr ? 'atom' : 'text', p); continue; }
      if (!v || typeof v !== 'object') continue;
      if (Array.isArray(v) && (inMatch || (!arr && ATOM.has(k)))) { if (v.some(x => typeof x === 'string' && HAN.test(x))) fn(o, k, v, 'atom', p); continue; }
      walk(v, fn, p, !arr && k === 'match');
    }
  }
  const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
  function apply(obj, tr) {
    walk(obj, (h, k, v, kind) => {
      if (kind === 'text') { const t = tr[hash(v)]; if (typeof t === 'string') h[k] = t; return; }
      const t = tr[hash(JSON.stringify(v))];
      if (Array.isArray(t)) h[k] = uniq([...t, ...[].concat(v)]);
    });
  }
  /* 한글이 없어 번역 꾸러미에 들지 않는 표 칸의 날짜(10.09 20:31 · 1922.10.14 · ① 11/5 07:40 · 6.20 ~)를
   * 그 언어의 순서로: 독일어·러시아어는 일.월, 영어는 달 이름. 칸 전체가 날짜일 때만 바꾸고, 답으로 치는 칸은 건드리지 않는다. */
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DT = String.raw`(?:(\d{4}|\d{2})\.\s?)?(\d{1,2})(?:\.\s?|\/)(\d{1,2})\.?((?:\s+\d{1,2}:\d{2}(?::\d{2})?)(?:\s·\s\d{1,2}:\d{2})*)?`;
  const CELL = new RegExp(String.raw`^([①-⑳]\s)?(?:${DT})?(\s*~\s*)?(?:${DT})?$`);
  const DKEEP = new Set([...SKIP, 'match', 'code', 'answer', 'alias', 'osd']);
  function cellDate(s) {
    const m = s.match(CELL);
    if (!m || !m[3] && !m[8] || m[3] && m[8] && !m[6]) return null;
    const one = (y, mo, d, t) => {
      if (mo == null) return '';
      if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) throw 0;
      const yy = y && y.length === 2 ? '19' + y : y;
      const s = lang === 'en' ? `${MON[mo - 1]} ${+d}${yy ? ', ' + yy : ''}`
        : lang === 'ru' ? `${p2(d)}.${p2(mo)}${y ? '.' + y : ''}` : `${+d}.${+mo}.${y || ''}`;
      return s + (t || '');
    };
    try { return (m[1] || '') + one(m[2], m[3], m[4], m[5]) + (m[6] || '') + one(m[7], m[8], m[9], m[10]); } catch (e) { return null; }
  }
  const QUOTE = { en: '“”', de: '„“', ru: '«»' };
  function localDates(o) {
    for (const k of Object.keys(o)) {
      if (!Array.isArray(o) && (DKEEP.has(k) || k[0] === '_')) continue;
      const v = o[k];
      if (typeof v === 'string') {
        if (HAN.test(v)) continue;
        if (/\d[./]\s?\d/.test(v)) { const r = cellDate(v.trim()); if (r != null) { o[k] = r; continue; } }
        // 번역에 들지 않는 표 칸의 「2330」·13:02~13:35 도 그 언어의 따옴표와 줄표로
        const q = QUOTE[lang], w = v.replace(/「([^」]*)」/g, (m, x) => q[0] + x + q[1]).replace(/(\d)\s*~\s*(\d)/g, '$1–$2');
        if (w !== v) o[k] = w;
      }
      else if (v && typeof v === 'object') localDates(v);
    }
  }
  function applyCase(c) {
    const tr = packs[c.id];
    if (lang === 'ko' || !tr) return;
    const ko = {};
    Object.entries(c.keywords || {}).forEach(([id, k]) => { ko[id] = k.label; });
    apply(c, tr);
    if (/^(en|de|ru)$/.test(lang) && c.docs) localDates(c.docs);
    // 말 없는 대답 「…….」(한국어 말줄임표 + 마침표)은 번역에 들지 않는다: 일본어·중국어는 「……」, 나머지는 「…」
    const hush = /^(ja|zh)$/.test(lang) ? '……' : '…';
    const quiet = o => { for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === 'string') { if (/^…+\.?$/.test(v) && v !== hush) o[k] = hush; } else if (v && typeof v === 'object') quiet(v); } };
    if (c.people) quiet(c.people);
    // 한국어 이름도 별칭으로 남긴다: 검색창에 한국어로 쳐도, 번역이 빠진 글의 [[한국어]] 도 그 단어를 찾는다
    Object.entries(c.keywords || {}).forEach(([id, k]) => { if (ko[id] && k.label !== ko[id]) k.alias = uniq([...(k.alias || []), ko[id]]); });
    // 얼굴 동그라미의 한 글자: 이름이 번역됐으면 번역된 이름의 첫 글자로 (엔진이 name[0] 을 쓴다)
    Object.values(c.people || {}).forEach(p => { if (p.initial && HAN.test(p.initial) && p.name && !HAN.test(p.name)) delete p.initial; });
    // 세로쓰기 신문은 한자를 쓰는 언어에서만. 라틴·키릴 글자는 가로로
    if (!/^(ja|zh)$/.test(lang)) Object.values(c.docs || {}).forEach(d => { if (d.cls) d.cls = d.cls.replace(/\bvertical\b/g, '').trim(); });
  }
  function applyFinale() {
    if (lang === 'ko' || !packs.finale) return;
    apply({ finale: MG.finale || [], finaleWho: MG.finaleWho || {} }, packs.finale);
  }

  /* ── 날짜·시각 ── */
  const WD = '일월화수목금토', p2 = n => String(n).padStart(2, '0');
  const KO = {
    mdwhm: d => `${d.getMonth() + 1}월 ${d.getDate()}일(${WD[d.getDay()]}) ${p2(d.getHours())}:${p2(d.getMinutes())}`,
    ymdw: d => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일`,
    ymdwhm: d => `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일(${WD[d.getDay()]}) ${p2(d.getHours())}:${p2(d.getMinutes())}`,
    clock: d => `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}. (${WD[d.getDay()]})  ${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${p2(d.getMinutes())}`,
    ptime: d => `${d.getHours() < 6 ? '새벽 ' : ''}${d.getHours()}시${d.getMinutes() ? ` ${d.getMinutes()}분` : ''}`, // 결말의 {{t}}: 글 속의 시각
    pstamp: d => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WD[d.getDay()]}요일 ${KO.ptime(d)}`,
    mdhm: d => `${d.getMonth() + 1}.${d.getDate()} ${p2(d.getHours())}:${p2(d.getMinutes())}`, // 현행 사건 폴더에 연필로 적는 멈춘 시각
  };
  const LOC = { en: 'en-US', de: 'de-DE', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' };
  const OPT = {
    mdwhm: { month: 'short', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
    ymdw: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    ymdwhm: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
    clock: { year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit' },
    ptime: { hour: 'numeric', minute: '2-digit' },
    pstamp: { month: 'long', day: 'numeric', weekday: 'long', hour: 'numeric', minute: '2-digit' },
    mdhm: { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },
  };
  if (lang === 'en') OPT.mdhm.month = 'short'; // 3/14 보다 Mar 14
  const fmts = {};
  function date(d, kind) {
    if (lang === 'ko' || !window.Intl) return KO[kind](d);
    try {
      const s = (fmts[kind] ||= new Intl.DateTimeFormat(LOC[lang], OPT[kind])).format(d);
      // 결말 글 속의 시각은 영어 번역문과 같은 꼴로 (5:40 p.m.) — 화면 시계는 그대로 PM
      if (kind === 'mdhm' && lang !== 'en') return s.replace(/,\s/, ' '); // 연필 메모는 18.11. 03:40 처럼 쉼표 없이
      return lang === 'en' && (kind === 'ptime' || kind === 'pstamp') ? s.replace(/[\s ]?([AP])M\b/g, (m, x) => ` ${x.toLowerCase()}.m.`) : s;
    } catch (e) { return KO[kind](d); }
  }

  /* ── 꾸러미 부르기 ── */
  const BOOT = { en: 'Opening the drawer…', ja: '引き出しを開けています…', zh: '正在打开抽屉…', ru: 'Открываю ящик…', de: 'Die Schublade geht auf…' };
  // 검색 결과·링크 미리보기에 뜨는 설명 (한국어는 index.html 에 적힌 그대로)
  const DESC = {
    en: 'A free detective game in the browser. Follow twelve cold cases across a century and three live cases on a running clock, using only the records: newspapers, statements, letters and transcripts.',
    ja: 'ブラウザで遊べる無料の推理ゲーム。新聞、供述調書、手紙、録取記録だけを手がかりに、一世紀にわたる未解決事件12件と、捜査時計が進む現行事件3件を追う。',
    zh: '可在浏览器中免费游玩的推理游戏。只凭报纸、口供、信件和笔录，追查横跨一个世纪的12起悬案，以及侦查时钟不停走动的3起现案。',
    ru: 'Бесплатный детектив в браузере. Двенадцать нераскрытых дел за целый век и три оперативных дела на часах, только по документам: газеты, показания, письма, протоколы.',
    de: 'Ein kostenloses Detektivspiel im Browser. Zwölf ungelöste Fälle aus einem Jahrhundert und drei laufende Fälle mit tickender Uhr, gelöst nur über Akten: Zeitungen, Aussagen, Briefe, Protokolle.',
  };
  // 글꼴: css/i18n.css 가 쓰는 그 언어의 글꼴 (Google Fonts · 중국어 손글씨는 jsDelivr 의 LXGW WenKai)
  const GF = 'https://fonts.googleapis.com/css2?display=swap&family=';
  const FONTS = {
    en: [GF + 'Caveat:wght@400;600&family=Shadows+Into+Light&family=Patrick+Hand&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Old+Standard+TT:wght@400;700&family=PT+Mono'],
    ru: [GF + 'Caveat:wght@400;600&family=Marck+Script&family=Pangolin&family=PT+Serif:wght@400;700&family=Old+Standard+TT:wght@400;700&family=PT+Sans:wght@400;700&family=PT+Mono&family=IBM+Plex+Mono:wght@400;600'],
    ja: [GF + 'Klee+One:wght@400;600&family=Zen+Kurenaido&family=Yomogi&family=Noto+Serif+JP:wght@400;700&family=New+Tegomin&family=Noto+Sans+JP:wght@400;700&family=Dela+Gothic+One&family=M+PLUS+1+Code&family=DotGothic16'],
    zh: [GF + 'Long+Cang&family=ZCOOL+KuaiLe&family=Noto+Serif+SC:wght@400;700&family=ZCOOL+XiaoWei&family=Noto+Sans+SC:wght@400;700&family=ZCOOL+QingKe+HuangYou&family=Ma+Shan+Zheng',
      'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css', 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-bold.css'],
  };
  FONTS.de = FONTS.en;
  function early() {
    const html = document.documentElement;
    html.lang = lang;
    const md = document.querySelector('meta[name="description"]'); if (md && DESC[lang]) md.setAttribute('content', DESC[lang]);
    (FONTS[lang] || []).forEach(href => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); });
    const b = document.querySelector('#app .boot');
    if (b && BOOT[lang]) b.textContent = BOOT[lang];
  }
  // CSS 의 content 글자 (css/*.css 의 var(--t-…))
  function cssText() {
    const R = document.documentElement.style, put = (k, s) => R.setProperty(k, JSON.stringify(s));
    put('--t-skip', T('누르면 건너뛴다'));
    put('--t-skip-esc', T('누르거나 Esc — 건너뛴다'));
    put('--t-notepad', T(' — 메모장'));
    put('--t-accused', T('지목'));
    put('--t-img-lost', T('사진 유실 — 원본 확인 요망'));
    put('--t-img-fail', T('그림을 표시할 수 없습니다'));
  }
  // 고른 언어의 꾸러미(화면 글자 · 편지 · 사건마다)를 모두 받은 뒤 cb (없는 파일은 건너뛴다 — 그 부분은 한국어로)
  function ready(cb) {
    if (lang === 'ko') return cb();
    const ids = ['ui', 'finale', ...(MG.cases || []).map(c => c.id)];
    let left = ids.length, fired = false;
    const go = () => { if (fired) return; fired = true; cssText(); cb(); };
    const done = () => { if (--left <= 0) go(); };
    // 못 받은 꾸러미는 주소 끝을 바꿔 한 번 더 청한다 (중간 서버가 실패한 응답을 붙들고 있어도 새로 받게)
    const add = (id, again) => {
      const s = document.createElement('script');
      s.src = `i18n/${lang}/${id}.js` + (again ? `?r=${Date.now()}` : '');
      s.onload = done;
      s.onerror = again ? done : () => add(id, true);
      document.head.appendChild(s);
    };
    ids.forEach(id => add(id, false));
    setTimeout(go, 15000); // 꾸러미 하나가 끝내 오지 않아도 책상은 연다
  }
  function set(l) {
    if (!has(l) || l === lang) return;
    try { localStorage.setItem(KEY, l); } catch (e) { /* 저장소 막힘: 주소로 넘긴다 */ }
    let u = null;
    try { u = new URL(location.href); } catch (e) { /* 옛 브라우저 */ }
    if (u && (u.searchParams.has('lang') || (() => { try { return localStorage.getItem(KEY) !== l; } catch (e) { return true; } })())) { u.searchParams.set('lang', l); location.replace(u.href); }
    else location.reload();
  }

  MG.T = T;
  MG.I18N = {
    lang, langs: LANGS, packs, hash, walk, applyCase, applyFinale, date, ready, set,
    put(l, part, data) { if (l === lang) packs[part] = Object.assign(packs[part] || {}, data); },
  };
  if (typeof window.document !== 'undefined' && document.documentElement) early();
})();
