#!/usr/bin/env node
/* Monologue Gaze — 번역 도구 (js/i18n.js 와 짝)
 *
 *   node tools/i18n.js src <부분> [파일]      번역할 원문을 JSON 으로 뽑는다 (부분: ui · finale · c00 … c15)
 *   node tools/i18n.js put <언어> <부분> <파일>  번역 JSON 을 i18n/<언어>/<부분>.js 에 넣는다 (검사를 통과한 것만)
 *   node tools/i18n.js check [언어] [부분]      빠진 것 · 낡은 것(원문이 바뀐 것) · 어긋난 것을 알려 준다
 *
 * 원문 JSON (src)
 *   ui:  [{ k: 한국어 열쇠, ph: { 0: '자리 표시의 코드', … }, at: 'js/engine.js:123' }]  — 번역 파일은 { 한국어 열쇠: 번역 }
 *   사건: [{ h: 지문, path: 'docs.d_x.body.3.p', ko: 원문, atom?: true }]           — 번역 파일은 { 지문: 번역 }
 *   사건 원문의 [[이름]] 은 [[이름|k_id]] 로 풀어 둔다. 번역에서도 [[번역된 이름|k_id]] 로 같은 단어들을 그대로 걸 것.
 *   atom(답으로 치는 값: 비밀번호 · 조회 값 · 별칭)의 번역은 문자열 배열. 게임은 한국어 값과 합쳐 둘 다 받는다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const LANGS = ['en', 'ja', 'zh', 'ru', 'de'];
const HAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const rel = p => path.relative(ROOT, p).replace(/\\/g, '/');

/* ── 게임 코드 불러오기 (브라우저 없이) ── */
function sandbox() {
  const MG = {};
  const ctx = { window: null, MG, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  const run = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  run('js/i18n.js');
  ctx.MG.registerCase = c => { (ctx.MG.cases ||= []).push(c); };
  return { ctx, run };
}
const SB = sandbox();
const I = SB.ctx.MG.I18N;
function loadCases() {
  if (SB.ctx.MG.cases) return SB.ctx.MG.cases;
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  [...html.matchAll(/<script src="(cases\/[^"]+)"/g)].forEach(m => SB.run(m[1]));
  SB.run('js/finale.js');
  return SB.ctx.MG.cases;
}
const caseById = id => loadCases().find(c => c.id === id);

/* ── 엔진과 같은 [[이름]] 풀기 (js/engine.js 의 norm · prep) ── */
const norm = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[\s'"`.,!?·・()[\]{}\-_/@:;~「」『』〈〉《》“”‘’„«»]/g, '');
function labMap(c) {
  const lab = {};
  for (const [id, k] of Object.entries(c.keywords || {})) [k.label, ...(k.alias || [])].forEach(l => { const n = norm(l); if (n && !(n in lab)) lab[n] = id; });
  return lab;
}
const LINK = /\[\[([^\]|]+?)(?:\|([\w-]+))?\]\]/g;
const withIds = (s, lab) => s.replace(LINK, (m, l, kid) => (kid ? m : lab[norm(l)] ? `[[${l}|${lab[norm(l)]}]]` : m));

/* ── 사건·편지의 원문 ── */
function caseUnits(part) {
  if (part === 'finale') {
    loadCases();
    const o = { finale: SB.ctx.MG.finale, finaleWho: SB.ctx.MG.finaleWho };
    return units(JSON.parse(JSON.stringify(o)), {});
  }
  const c = caseById(part);
  if (!c) throw new Error('없는 사건: ' + part);
  return units(JSON.parse(JSON.stringify(c)), labMap(c));
}
function units(obj, lab) {
  const out = [], seen = new Set();
  I.walk(obj, (h, k, v, kind, p) => {
    const key = kind === 'text' ? I.hash(v) : I.hash(JSON.stringify(v));
    if (seen.has(key)) return; // 같은 글은 한 번만 (번역도 하나)
    seen.add(key);
    out.push(kind === 'text' ? { h: key, path: p, ko: withIds(v, lab) } : { h: key, path: p, ko: [].concat(v), atom: true });
  });
  return out;
}

/* ── 화면 글자: T`…` · T('…') 를 코드에서 찾는다 ── */
const UI_FILES = ['js/i18n.js', 'js/ui.js', 'js/engine.js', 'js/mood.js', 'js/audio.js', 'index.html'];
function scanJs(src, file, base, out) {
  let i = 0;
  const n = src.length;
  let prev = ''; // 앞의 뜻 있는 글자 (정규식인지 나누기인지 가른다)
  const line = p => base + src.slice(0, p).split('\n').length;
  const isId = ch => /[\w$]/.test(ch || '');
  const cook = raw => Function('return `' + raw + '`')();
  function str(q) { const s = i; i++; while (i < n && src[i] !== q) { if (src[i] === '\\') i++; i++; } i++; return src.slice(s, i); }
  function regex() { i++; let cls = false; while (i < n) { const ch = src[i]; if (ch === '\\') { i += 2; continue; } if (ch === '[') cls = true; else if (ch === ']') cls = false; else if (ch === '/' && !cls) break; else if (ch === '\n') break; i++; } i++; while (isId(src[i])) i++; }
  function template() { // src[i] === '`' → { quasis(raw), exprs(src) }
    i++;
    const quasis = [], exprs = [];
    let s = i;
    while (i < n) {
      const ch = src[i];
      if (ch === '\\') { i += 2; continue; }
      if (ch === '`') { quasis.push(src.slice(s, i)); i++; break; }
      if (ch === '$' && src[i + 1] === '{') { quasis.push(src.slice(s, i)); i += 2; const e0 = i; code(true); exprs.push(src.slice(e0, i).trim()); i++; s = i; continue; }
      i++;
    }
    return { quasis, exprs };
  }
  function code(stopBrace) {
    let depth = 0;
    while (i < n) {
      const ch = src[i];
      if (ch === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (ch === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 2; continue; }
      if (ch === "'" || ch === '"') { str(ch); prev = 'a'; continue; }
      if (ch === '`') { template(); prev = 'a'; continue; }
      if (ch === '/') { if (!prev || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /^(return|typeof|case|in|of|delete|void|throw|new)$/.test(prev)) { regex(); prev = 'a'; } else { i++; prev = '/'; } continue; }
      if (ch === '{') { depth++; i++; prev = '{'; continue; }
      if (ch === '}') { if (stopBrace && depth === 0) return; depth--; i++; prev = '}'; continue; }
      if (isId(ch)) {
        const s = i;
        while (isId(src[i])) i++;
        const w = src.slice(s, i);
        const dot = src[s - 1] === '.';
        const isT = w === 'T' && (!dot || src.slice(s - 3, s) === 'MG.');
        prev = w;
        if (isT) {
          let j = i; while (/\s/.test(src[j])) j++;
          if (src[j] === '`') {
            i = j; const at = line(j);
            const t = template();
            const k = t.quasis.map((q, qi) => (qi ? '{' + (qi - 1) + '}' : '') + cook(q)).join('');
            out.push({ k, ph: Object.fromEntries(t.exprs.map((e, ei) => [ei, e])), at: `${file}:${at}` });
            prev = 'a';
          } else if (src[j] === '(') {
            let k2 = j + 1; while (/\s/.test(src[k2])) k2++;
            if (src[k2] === "'" || src[k2] === '"') { const at = line(k2); i = k2; const lit = str(src[k2]); out.push({ k: Function('return ' + lit)(), ph: {}, at: `${file}:${at}` }); prev = 'a'; }
          }
        }
        continue;
      }
      if (!/\s/.test(ch)) prev = ch;
      i++;
    }
  }
  code(false);
}
function uiUnits() {
  const out = [];
  for (const f of UI_FILES) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (f.endsWith('.html')) { for (const m of src.matchAll(/<script>([\s\S]*?)<\/script>/g)) scanJs(m[1], f, src.slice(0, m.index).split('\n').length - 1, out); }
    else scanJs(src, f, 0, out);
  }
  // 주인공 대사 자막 (audio/manifest.js 의 say) — 목소리는 한국어 그대로, 자막만
  const A = {}; vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'audio/manifest.js'), 'utf8'), { window: { MG: A } });
  Object.entries((A.audio && A.audio.say) || {}).forEach(([k, v]) => out.push({ k: v, ph: {}, at: 'audio/manifest.js say ' + k }));
  const by = new Map();
  for (const u of out) { if (!HAN.test(u.k)) continue; const o = by.get(u.k); if (o) { o.at += ' · ' + u.at; Object.assign(o.ph, u.ph); } else by.set(u.k, u); }
  return [...by.values()];
}

/* ── 번역 파일 ── */
const packFile = (lang, part) => path.join(ROOT, 'i18n', lang, part + '.js');
function readPack(lang, part) {
  const f = packFile(lang, part);
  if (!fs.existsSync(f)) return {};
  const got = {};
  vm.runInNewContext(fs.readFileSync(f, 'utf8'), { MG: { I18N: { put: (l, p, d) => Object.assign(got, d) } } });
  return got;
}
const NAMES = { en: 'English', ja: '日本語', zh: '简体中文', ru: 'Русский', de: 'Deutsch' };
function writePack(lang, part, data, order) {
  const f = packFile(lang, part);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const keys = [...order.filter(k => k in data), ...Object.keys(data).filter(k => !order.includes(k))];
  const what = part === 'ui' ? '화면 글자: 한국어 → 번역' : part === 'finale' ? '서랍 맨 밑의 편지 (js/finale.js): 한국어 글의 지문 → 번역' : `사건 ${part}: 한국어 글 한 토막의 지문 → 번역`;
  const body = keys.map(k => `${JSON.stringify(k)}: ${JSON.stringify(data[k])}`).join(',\n');
  fs.writeFileSync(f, `/* 자동 생성: node tools/i18n.js put ${lang} ${part} — ${NAMES[lang]} · ${what} */\nMG.I18N.put(${JSON.stringify(lang)}, ${JSON.stringify(part)}, {\n${body}\n});\n`);
}

/* ── 검사 ── */
const kids = s => [...String(s).matchAll(LINK)].map(m => m[2] || '?').sort().join(',');
const count = (s, re) => (String(s).match(re) || []).length;
const tags = s => (String(s).match(/<\/?[a-z][a-z0-9]*/gi) || []).map(x => x.toLowerCase()).sort().join(',');
const phs = s => [...new Set(String(s).match(/\{\d+\}/g) || [])].sort();
function checkCaseUnit(u, t, c) {
  const errs = [], warns = [];
  if (u.atom) {
    if (!Array.isArray(t) || !t.length || t.some(x => typeof x !== 'string' || !x.trim())) errs.push('답 값은 빈칸 없는 문자열 배열');
    return { errs, warns };
  }
  if (typeof t !== 'string' || !t.trim()) return { errs: ['빈 번역'], warns };
  if (kids(u.ko) !== kids(t)) errs.push(`걸린 단어가 다르다: 원문 [${kids(u.ko)}] · 번역 [${kids(t)}]`);
  if (c) for (const m of t.matchAll(LINK)) if (m[2] && !(c.keywords || {})[m[2]]) errs.push('없는 단어 id: ' + m[2]);
  for (const [re, what] of [[/\*\*/g, '**굵게**'], [/~~/g, '~~줄~~'], [/\{\{t\}\}/g, '{{t}}'], [/\{\{d\}\}/g, '{{d}}'], [/\{n\}/g, '{n}'], [/\{next\}/g, '{next}']]) if (count(u.ko, re) !== count(t, re)) errs.push(what + ' 개수가 다르다');
  if (/^\s*[(（]/.test(u.ko) !== /^\s*[(（]/.test(t)) warns.push('앞의 몸짓 (…) 이 원문과 다르다');
  if (/^\s*—/.test(u.ko) !== /^\s*—/.test(t)) warns.push('앞의 「— 」(끼어든 말) 이 원문과 다르다');
  if (HAN.test(t.replace(LINK, '$1'))) warns.push('한글이 남아 있다');
  return { errs, warns };
}
function checkUiUnit(u, t) {
  const errs = [], warns = [];
  if (typeof t !== 'string') return { errs: ['번역이 문자열이 아니다'], warns };
  const allowed = new Set(Object.keys(u.ph).map(x => '{' + x + '}'));
  for (const p of phs(t)) if (!allowed.has(p)) errs.push('원문에 없는 자리 표시 ' + p);
  for (const [x, e] of Object.entries(u.ph)) if (!/^josa\(/.test(e) && !t.includes('{' + x + '}')) warns.push(`자리 표시 {${x}} (${e}) 가 빠졌다`);
  if (tags(u.k) !== tags(t)) errs.push('태그가 다르다');
  if (count(u.k, /"/g) % 2 !== count(t, /"/g) % 2 && /<|=/.test(u.k)) warns.push('따옴표 짝');
  if (u.k.trim() && !t.trim()) errs.push('빈 번역');
  if (HAN.test(t)) warns.push('한글이 남아 있다');
  return { errs, warns };
}
function partsAll() { return ['ui', 'finale', ...loadCases().map(c => c.id)]; }
function unitsOf(part) { return part === 'ui' ? uiUnits() : caseUnits(part); }
const keyOf = (part, u) => (part === 'ui' ? u.k : u.h);

function cmdSrc(part, file) {
  const us = unitsOf(part);
  const json = JSON.stringify(us, null, 1);
  if (file) { fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true }); fs.writeFileSync(file, json); console.log(`${part}: ${us.length} 토막 → ${file}`); }
  else process.stdout.write(json + '\n');
}
function cmdPut(lang, part, file) {
  if (!LANGS.includes(lang)) throw new Error('언어: ' + LANGS.join(' '));
  const us = unitsOf(part), by = new Map(us.map(u => [keyOf(part, u), u]));
  const incoming = JSON.parse(fs.readFileSync(file, 'utf8'));
  const c = part === 'ui' || part === 'finale' ? null : caseById(part);
  const cur = readPack(lang, part);
  let ok = 0, bad = 0, unknown = 0;
  for (const [k, t] of Object.entries(incoming)) {
    const u = by.get(k);
    if (!u) { unknown++; console.log(`  ? 원문에 없는 열쇠: ${String(k).slice(0, 60)}`); continue; }
    const { errs, warns } = part === 'ui' ? checkUiUnit(u, t) : checkCaseUnit(u, t, c);
    if (errs.length) { bad++; console.log(`  ✗ ${u.path || u.at} — ${errs.join(' · ')}\n     원문: ${JSON.stringify(u.ko ?? u.k).slice(0, 160)}\n     번역: ${JSON.stringify(t).slice(0, 160)}`); continue; }
    warns.forEach(w => console.log(`  ! ${u.path || u.at} — ${w}: ${JSON.stringify(t).slice(0, 100)}`));
    cur[k] = t; ok++;
  }
  writePack(lang, part, cur, us.map(u => keyOf(part, u)));
  const have = us.filter(u => keyOf(part, u) in cur).length;
  console.log(`${lang} ${part}: 넣음 ${ok} · 걸림 ${bad} · 모르는 열쇠 ${unknown} → ${rel(packFile(lang, part))} (${have}/${us.length})`);
}
function cmdCheck(langs, parts) {
  let total = 0;
  for (const part of parts) {
    const us = unitsOf(part), keys = new Set(us.map(u => keyOf(part, u)));
    const c = part === 'ui' || part === 'finale' ? null : caseById(part);
    for (const lang of langs) {
      const pack = readPack(lang, part);
      const miss = us.filter(u => !(keyOf(part, u) in pack));
      const stale = Object.keys(pack).filter(k => !keys.has(k));
      const bad = [];
      for (const u of us) { const t = pack[keyOf(part, u)]; if (t == null) continue; const r = part === 'ui' ? checkUiUnit(u, t) : checkCaseUnit(u, t, c); if (r.errs.length) bad.push(`${u.path || u.at}: ${r.errs.join(' · ')}`); }
      const line = `${lang} ${part.padEnd(6)} ${String(us.length - miss.length).padStart(5)}/${String(us.length).padEnd(5)}` + (miss.length ? ` 빠짐 ${miss.length}` : '') + (stale.length ? ` 낡음 ${stale.length}` : '') + (bad.length ? ` 어긋남 ${bad.length}` : '');
      console.log(line);
      if (process.argv.includes('-v')) { miss.slice(0, 30).forEach(u => console.log('   빠짐 ' + (u.path || u.at) + ' ' + JSON.stringify(u.ko ?? u.k).slice(0, 90))); bad.forEach(b => console.log('   어긋남 ' + b)); }
      total += miss.length + bad.length;
    }
  }
  return total;
}

const [cmd, a, b, c2] = process.argv.slice(2).filter(x => x !== '-v');
try {
  if (cmd === 'src' && a) cmdSrc(a, b);
  else if (cmd === 'put' && a && b && c2) cmdPut(a, b, c2);
  else if (cmd === 'check') {
    const langs = a && LANGS.includes(a) ? [a] : LANGS;
    const part = a && !LANGS.includes(a) ? a : b;
    cmdCheck(langs, part ? [part] : partsAll());
  } else {
    console.log(fs.readFileSync(__filename, 'utf8').split('\n').slice(1, 14).join('\n').replace(/^ ?\*\/?/gm, ''));
    process.exit(1);
  }
} catch (e) { console.error(e.message); process.exit(1); }
