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
    c._m = null;
    const scan = arr => (Array.isArray(arr) ? arr : [arr]).forEach(b => { if (b && typeof b === 'object' && b.m != null && !c._m) c._m = b.m; });
    Object.values(c.docs).forEach(d => scan(d.body || []));
    Object.values(c.people).forEach(p => { scan(p.intro || []); Object.values(p.ask || {}).forEach(a => { if (Array.isArray(a)) scan(a); else if (a && typeof a === 'object') { scan(a.a || []); scan(a.else || []); } }); });
  }

  function injectCss() {
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

  function art(key, cls) {
    const a = C.art[key];
    if (a == null) return '';
    const file = MG.images[`${C.id}/${key}`];
    const alt = (a && a.alt) || (a && a.use) || '';
    if (file) return `<img class="${cls || 'art'}" src="${esc(file)}" alt="${esc(alt)}" loading="lazy">`;
    return typeof a === 'string' ? a : a.svg || '';
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
      ${lock.hint ? `<p class="lock-h">${inline(lock.hint)}</p>` : ''}<p class="lock-e" role="status">${fails ? `맞지 않는다. (${fails}회)` : ''}</p>${fails >= 3 && lock.hint2 ? `<p class="lock-h2">${inline(lock.hint2)}</p>` : ''}</div>`;
  }

  function docHtml(d) {
    const s = C.sources.find(x => x.id === d.src) || {};
    if (d.lock && !ST.unl.includes(d.id)) return lockHtml(d.id, d.lock, d.title);
    if (!ST.seen.includes(d.id)) { ST.seen.push(d.id); save(); }
    const skin = d.skin || s.skin || 'plain';
    const paper = d.paper || s.paper;
    return `<article class="doc skin-${esc(skin)}${d.cls ? ' ' + esc(d.cls) : ''}"${d.bar ? ` style="--bar:${esc(d.bar)}"` : ''}>
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
      const state = asked.includes(e) ? ' done' : e.endsWith('!') && asked.includes(k) ? ' again' : '';
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
    return Object.entries(C.keywords).filter(([, k]) => [k.label, ...(k.alias || [])].map(norm).filter(Boolean)
      .some(l => l === n || (n.length >= 2 && l.includes(n)) || (l.length >= 2 && n.includes(l)))).map(([id]) => id);
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
      <div class="nb-top"><button type="button" class="nb-back" data-cabinet>← 기록실</button><span class="nb-case">CASE ${pad(C.no)}</span></div>
      <article class="brief"><svg class="clip" viewBox="0 0 24 64" aria-hidden="true"><path d="M8 20 V50 a6 6 0 0 0 12 0 V12 a8 8 0 0 0 -16 0 V46" fill="none" stroke="#8d918f" stroke-width="2.6" stroke-linecap="round"/></svg>
        <h2>${esc(b.title || C.title)} <small>${esc(b.no || '')}</small></h2>
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
    app.innerHTML = `<div class="case-view" data-case="${esc(C.id)}" data-frame="${esc(C.frame || 'papers')}">
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
  function openCase(id) {
    const c = MG.byId[id];
    if (!c) return cabinet();
    C = c; ST = cs(c); VERDICT = '';
    S.current = id; save();
    renderCase();
    window.scrollTo(0, 0);
  }

  function cabinet() {
    C = null; ST = null; S.current = null; save();
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
        ${cover ? `<span class="f-cover" aria-hidden="true">${cover}</span>` : ''}
        <span class="f-tab">CASE ${pad(c.no)}</span>
        <span class="f-body"><span class="f-kind">${kind} · ${esc(c.year)}</span><span class="f-label"><span class="f-title">${esc(c.title)}</span><span class="f-place">${esc(c.place)}</span></span>
        <span class="f-motif">${esc(c.motif || '')}</span>${c.length ? `<span class="f-len">${esc(c.length)}</span>` : ''}
        ${status === 'done' ? '<span class="f-stamp">종결</span>' : status === 'going' ? '<span class="f-going">수사 중</span>' : ''}</span></button>`;
    };
    const intro = S.intro ? '' : `<div class="intro"><p>서울서부경찰서 강력2팀. 전출 간 선배 <b>M</b>이 책상 서랍 열쇠 하나를 남기고 갔다.</p><p>서랍 속에는 한 세기에 걸친 미제 기록 열 건. 사진 한 장, 편지 한 통, 누군가의 혼잣말 같은 기록들. 기록은 대답하지 않는다. 쫓아가는 사람에게만 조금씩 입을 연다.</p><p class="intro-hand">처음이면 CASE 00부터. 조사하는 법을 거기서 익힐 것. — 팀장</p><button type="button" class="btn-hand" data-intro-ok>서랍을 연다</button></div>`;
    const letter = main.length >= 10 && solvedMain === main.length ? `<article class="m-letter"><h3>서랍 맨 밑의 편지</h3>${(MG.finale || []).map(p => `<p>${esc(p)}</p>`).join('')}<p class="m-sig">— M</p></article>` : '';
    const hero = MG.images['_global/hero'];
    app.innerHTML = `<div class="cabinet">
      ${hero ? `<div class="cab-hero" aria-hidden="true"><img src="${esc(hero)}" alt=""></div>` : ''}
      <header class="cab-top"><p class="cab-kicker">서울서부경찰서 강력2팀 · 미제사건 기록실</p><h1 class="cab-title">Monologue Gaze</h1><p class="cab-sub">기록은 혼잣말을 한다. 들어주는 건 당신이다.</p>
        <p class="cab-stat">종결 <b>${solvedMain}</b> / ${main.length} · M의 메모 <b>${mList.length}</b> / ${MG.cases.filter(c => c._m).length}</p></header>
      ${intro}
      <section class="drawer" aria-label="사건 파일">${MG.cases.map(folder).join('')}</section>
      ${mList.length ? `<section class="mbox"><h2>M의 메모</h2><p class="mbox-sub">기록 여백에 남아 있던, 선배의 글씨.</p><ul>${mList.map(c => `<li><span class="mbox-case">CASE ${pad(c.no)}</span> ${esc(plain(c._m))}</li>`).join('')}</ul></section>` : ''}
      ${letter}
      <footer class="cab-foot"><p>모든 사건은 실제 미제 사건의 모티프만 빌려 새로 지은 이야기입니다. 등장하는 인물·장소·기관·사이트는 모두 허구이며, 실제 인물이나 피해자와 관계가 없습니다.</p><button type="button" class="reset" data-wipe>모든 기록 지우기</button></footer>
    </div>`;
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
    ST.view.open = o; save();
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
      save(); refreshAll();
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
      if (m) m.textContent = s.feedback === 'none' ? '아직 문장이 되지 않는다.' : `기호 ${syms.length}개 중 ${right}개가 맞는 것 같다.`;
    }
  }
  function submitReport() {
    const sol = C.solution;
    if (!ST.report.culprit || sol.claims.some(cl => !ST.report.claims[cl.id])) { VERDICT = '빈칸이 남아 있다.'; renderNotebook(); return; }
    ST.tries++;
    let wrong = ST.report.culprit === sol.culprit ? 0 : 1;
    sol.claims.forEach(cl => {
      const n = ST.notes.find(x => String(x.id) === String(ST.report.claims[cl.id]));
      if (!n || !(cl.accept || []).includes(n.f)) wrong++;
    });
    const fresh = wrong === 0 && !ST.solved;
    if (wrong === 0) { ST.solved = true; VERDICT = ''; }
    else VERDICT = wrong === 1 ? sol.near || '딱 한 군데가 어긋난다.' : sol.far || '아직 이야기가 이어지지 않는다. 더 쫓아가 보자.';
    save(); renderNotebook();
    if (fresh) {
      const box = $('#solvedBox');
      if (box) { box.innerHTML = solvedHtml(true); box.scrollIntoView({ block: 'nearest' }); }
      toast('사건 종결');
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
      if ((el = t.closest('[data-open]'))) return openCase(el.dataset.open);
      if (t.closest('[data-cabinet]')) { cabinet(); window.scrollTo(0, 0); return; }
      if (t.closest('[data-intro-ok]')) { S.intro = true; save(); cabinet(); return; }
      if ((el = t.closest('[data-wipe]'))) return armed(el, '한 번 더 누르면 전부 지워진다', () => { S = { cases: {}, current: null, intro: false }; save(); cabinet(); });
      if (!C) return;
      if ((el = t.closest('[data-pin]'))) return pin(el.dataset.pin);
      if ((el = t.closest('[data-kw]'))) return addKey(el.dataset.kw);
      if ((el = t.closest('[data-src]'))) {
        ST.view.src = el.dataset.src;
        const s = curSrc();
        if (s.type === 'cipher') ST.view.open = { t: 'cipher', id: s.id };
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
    if (MG.images['_global/desk']) document.documentElement.style.setProperty('--desk-img', `url("${MG.images['_global/desk']}")`);
    if (MG.images['_global/paper']) document.documentElement.style.setProperty('--paper-img', `url("${MG.images['_global/paper']}")`);
    app = document.getElementById('app');
    bind();
    if (S.current && MG.byId[S.current]) openCase(S.current); else cabinet();
  };
  MG.state = () => S;
})();
