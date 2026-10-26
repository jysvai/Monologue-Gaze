#!/usr/bin/env node
/* 바깥 서버에 묻지 않는 판의 글꼴 — 게임이 부르는 글꼴을 모두 fonts/local/ 에 받아 둔다 (freem! 은 외부 통신이 있는 브라우저 게임을 받지 않는다).
 * Google Fonts 글꼴은 게임 글에 실제로 나오는 글자만: css2 의 text= 로 600자씩 잘라 받고, 조각마다 unicode-range 를 단다 (1,000자쯤 넘기면 text= 를 무시하고 통째로 준다).
 *   한글 글꼴은 한글 + 한국어 원문의 한자, 일본어 글꼴은 가나 + 한자, 중국어 글꼴은 한자, 키릴 글꼴은 키릴 — 어느 글꼴이 어떤 글자를 갖는지는 Google Fonts 메타데이터의 subsets 로 본다.
 * jsDelivr 글꼴(Pretendard · 갈무리 · 둥근모 · LXGW WenKai)과 이미 text= 로 부르는 것(East Sea Dokdo 기호 · 암호 기호)은 그대로 옮겨 받는다.
 * 만드는 것: fonts/local/boot.css (index.html 공통 글꼴) · f-<키>.css (js/fonts.js) · lang-<언어>.css (js/i18n.js) · g/ m/ 아래 글꼴 파일
 * 게임 글이 바뀌어 새 글자가 생기면 다시 돌린다. 묶기: node tools/itch-zip.js --portal --local-fonts
 * 사용: node tools/font-pack.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const OUT = path.join(root, 'fonts', 'local');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CHUNK = 600;

/* ── 게임 글에 나오는 글자 ── */
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : /\.(?:js|css|html)$/.test(e.name) ? [path.join(d, e.name)] : []);
const charsOf = files => { const s = new Set(); for (const f of files) for (const ch of fs.readFileSync(path.join(root, f), 'utf8')) s.add(ch.codePointAt(0)); return s; };
const koFiles = [...walk('cases'), ...walk('js'), ...walk('css'), 'index.html', 'audio/manifest.js'];
const ko = charsOf(koFiles), ja = charsOf(walk('i18n/ja')), zh = charsOf(walk('i18n/zh')), west = charsOf(['en', 'ru', 'de'].flatMap(l => walk('i18n/' + l)));
const all = new Set([...ko, ...ja, ...zh, ...west]);
const isHan = c => (c >= 0x4E00 && c < 0xA000) || (c >= 0x3400 && c < 0x4DC0) || (c >= 0xF900 && c < 0xFB00) || (c >= 0x20000 && c < 0x2FA20);
const isHangul = c => (c >= 0xAC00 && c < 0xD7A4) || (c >= 0x1100 && c < 0x1200) || (c >= 0x3130 && c < 0x3190);
const isKana = c => (c >= 0x3040 && c < 0x3100) || (c >= 0x31F0 && c < 0x3200) || (c >= 0xFF66 && c < 0xFFA0);
const isCyr = c => c >= 0x400 && c < 0x530;
const pick = (set, f) => [...set].filter(f).sort((a, b) => a - b);
const POOL = {
  base: [...new Set([...Array.from({ length: 95 }, (_, i) => 0x20 + i), ...pick(all, c => c >= 0xA0 && !isHan(c) && !isHangul(c) && !isKana(c) && !isCyr(c) && c !== 0xFEFF)])].sort((a, b) => a - b),
  korean: [...pick(all, isHangul), ...pick(ko, isHan)],
  japanese: [...pick(all, isKana), ...pick(new Set([...ja, ...ko]), isHan)],
  chinese: pick(new Set([...zh, ...ko]), isHan),
  cyrillic: pick(all, isCyr),
};

/* ── 게임이 부르는 글꼴 ── */
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const boot = [...html.matchAll(/<link rel="stylesheet" data-gf[^>]*href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js', 'fonts.js'), 'utf8'), box);
const KEYS = box.window.MG.fonts;
const i18n = fs.readFileSync(path.join(root, 'js', 'i18n.js'), 'utf8');
const at = i18n.indexOf('const GF ='), end = i18n.indexOf('FONTS.de = FONTS.en;');
if (at < 0 || end < 0) throw new Error('js/i18n.js 에서 FONTS 목록을 못 찾았다');
const LANG = vm.runInNewContext(i18n.slice(at, end) + '; FONTS');
// 파일 하나 = 받을 주소들 (Google 가족 인자는 { g: 'Family:wght@…', display }, 그 밖은 { css: 주소 })
const gsplit = (u, display) => {
  const q = new URL(u);
  if (q.hostname !== 'fonts.googleapis.com' || q.searchParams.has('text')) return [{ css: u }];
  return q.searchParams.getAll('family').map(g => ({ g: g.replace(/ /g, '+'), display: q.searchParams.get('display') || display }));
};
const JOBS = { boot: boot.flatMap(u => gsplit(u, 'block')) };
for (const [k, v] of Object.entries(KEYS)) JOBS['f-' + k] = typeof v === 'string' ? v.split('&family=').map(g => ({ g, display: 'swap' })) : gsplit(v.css, 'swap');
for (const [l, list] of Object.entries(LANG)) JOBS['lang-' + l] = list.flatMap(u => gsplit(u, 'swap'));

/* ── 받기 ── */
const get = async (u, bin) => {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(u, { headers: { 'user-agent': UA } });
      if (!r.ok) throw new Error(r.status + ' ' + u.slice(0, 120));
      return bin ? Buffer.from(await r.arrayBuffer()) : r.text();
    } catch (e) { if (i >= 3) throw e; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
  }
};
const range = cps => { const out = []; for (let i = 0; i < cps.length;) { let j = i; while (j + 1 < cps.length && cps[j + 1] === cps[j] + 1) j++; const h = c => c.toString(16).toUpperCase(); out.push(j > i ? `U+${h(cps[i])}-${h(cps[j])}` : `U+${h(cps[i])}`); i = j + 1; } return out.join(','); };
const save = (sub, name, buf) => { const f = path.join(OUT, sub, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); return sub + '/' + name; };
const faces = css => [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]);

let meta = null;
const subsetsOf = async name => {
  if (!meta) { const t = await get('https://fonts.google.com/metadata/fonts'); meta = new Map(JSON.parse(t.replace(/^\)\]\}'\s*/, '')).familyMetadataList.map(f => [f.family, f.subsets || []])); }
  const s = meta.get(name);
  if (!s) throw new Error('Google Fonts 메타데이터에 없는 가족: ' + name);
  return s;
};
const gcache = new Map(); // 같은 가족 인자는 한 번만 (Old Standard TT · Noto Serif JP 처럼 여러 곳에서 부르는 것)
async function google({ g, display }) {
  const key = g + '|' + display;
  if (gcache.has(key)) return gcache.get(key);
  const name = decodeURIComponent(g.split(':')[0].replace(/\+/g, ' '));
  const subs = await subsetsOf(name);
  const cps = [...new Set([...POOL.base, ...(subs.includes('korean') ? POOL.korean : []), ...(subs.includes('japanese') ? POOL.japanese : []),
    ...(subs.some(s => /^chinese/.test(s)) ? POOL.chinese : []), ...(subs.includes('cyrillic') ? POOL.cyrillic : [])])].sort((a, b) => a - b);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blocks = [];
  let bytes = 0, n = 0;
  for (let i = 0; i < cps.length; i += CHUNK) {
    const part = cps.slice(i, i + CHUNK), text = String.fromCodePoint(...part);
    const css = await get(`https://fonts.googleapis.com/css2?family=${g}&display=${display}&text=${encodeURIComponent(text)}`);
    for (const body of faces(css)) {
      const src = (body.match(/url\((https:[^)]+)\)/) || [])[1];
      if (!src) continue;
      // 잘라 준 파일은 /l/font?kit= 주소에, 그 글꼴이 실제로 가진 글자만 unicode-range 로 적어 준다. /s/ 주소면 text= 를 무시하고 통째로 준 것
      if (!/\/l\/font\?kit=/.test(src)) throw new Error(`${name}: text= 를 무시하고 통째로 줬다 — CHUNK 를 줄일 것`);
      const style = (body.match(/font-style:\s*(\w+)/) || [, 'normal'])[1], weight = (body.match(/font-weight:\s*(\d+)/) || [, '400'])[1];
      const buf = await get(src, true);
      bytes += buf.length; n++;
      const rel = save('g', `${slug}-${style === 'italic' ? 'i' : ''}${weight}-${i / CHUNK}.woff2`, buf);
      const decl = body.trim().replace(/\s*\n\s*/g, '').replace(/src:\s*url\([^)]+\)/, `src:url(${rel})`);
      blocks.push(`@font-face{${/unicode-range/.test(decl) ? decl : `${decl};unicode-range:${range(part)}`}}`);
    }
  }
  console.log(`  ${name} (${subs.filter(s => s !== 'menu').join(' ')}) — ${cps.length}자 · 파일 ${n}개 · ${(bytes / 1024).toFixed(0)}KB`);
  const out = blocks.join('\n');
  gcache.set(key, out);
  return out;
}
const mcache = new Map();
async function mirror(u) { // 스타일시트를 그대로 옮기고, 안의 글꼴 주소를 받은 파일로 바꾼다
  if (mcache.has(u)) return mcache.get(u);
  // src 에 여러 형식이 나란히 적혀 있으면 woff2 만 남긴다 (갈무리는 ttf 도 적어 두어, 다 받으면 40MB 가 된다)
  const css = (await get(u)).replace(/src:\s*([^;}]+)/g, (m, list) => { const w = list.split(/,(?=\s*(?:url|local)\()/).filter(s => /woff2/.test(s)); return 'src:' + (w.length ? w : [list]).join(',').trim(); });
  const files = new Map();
  for (const [, raw] of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const abs = new URL(raw, u).href;
    if (files.has(raw)) continue;
    const q = new URL(abs), base = q.hostname === 'fonts.gstatic.com' ? 'gstatic/' + crypto.createHash('md5').update(abs).digest('hex').slice(0, 12) + '.woff2' : (q.hostname + q.pathname).replace(/^cdn\.jsdelivr\.net\/(?:npm|gh)\//, '').replace(/@/g, '-');
    files.set(raw, save('m', base, await get(abs, true)));
  }
  const out = css.replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (m, raw) => `url(${files.get(raw)})`).replace(/\/\*[\s\S]*?\*\//g, '').trim();
  console.log(`  ${u.slice(0, 90)} — 파일 ${files.size}개`);
  mcache.set(u, out);
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const e of fs.readdirSync(OUT)) fs.rmSync(path.join(OUT, e), { recursive: true, force: true }); // 폴더 자체는 두고 안만 비운다 (윈도에서 누가 그 폴더를 열어 두면 지울 수 없다)
  console.log(`글자: 기본 ${POOL.base.length} · 한글(+한국어 한자) ${POOL.korean.length} · 일본어 ${POOL.japanese.length} · 중국어 ${POOL.chinese.length} · 키릴 ${POOL.cyrillic.length}`);
  for (const [file, jobs] of Object.entries(JOBS)) {
    console.log(file + '.css');
    const parts = [];
    for (const j of jobs) parts.push(j.g ? await google(j) : await mirror(j.css));
    save('.', file + '.css', `/* node tools/font-pack.js 가 만든 파일 — 고치지 말 것 */\n${parts.join('\n')}\n`);
  }
  let n = 0, bytes = 0;
  const count = d => fs.readdirSync(d, { withFileTypes: true }).forEach(e => { const f = path.join(d, e.name); if (e.isDirectory()) count(f); else { n++; bytes += fs.statSync(f).size; } });
  count(OUT);
  console.log(`fonts/local — 파일 ${n}개 · ${(bytes / 2 ** 20).toFixed(1)}MB`);
})().catch(e => { console.error(e.message || e); process.exit(1); });
