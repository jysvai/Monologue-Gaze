#!/usr/bin/env node
/* itch.io 에 올릴 묶음 — 게임에 쓰는 파일만 골라 dist/monologue-gaze-itch.zip 하나로 묶는다.
 * 넣는 것: index.html · manifest.webmanifest · 아이콘 · css/ js/ cases/ i18n/ img/ audio/ fonts/
 * 빼는 것: README · docs/ · tools/ · prototype/ · 404.html · 점 파일, 그리고 .gitignore 에 걸린 것 (.env, img/_src/)
 * 묶기 전에 index.html·css·js·사건 파일이 가리키는 그림·소리가 모두 들어갔는지 대소문자까지 맞춰 본다.
 * 윈도는 대소문자를 가리지 않아 로컬에서는 열려도, itch.io 는 가려서 그 파일만 빠진다.
 * itch.io 한도: 파일 1,000개 · 한 파일 200MB · 모두 500MB · 경로 240자 (https://itch.io/docs/creators/html5)
 * 사용: node tools/itch-zip.js
 *       node tools/itch-zip.js --portal          다른 사이트에 올릴 판 (dist/monologue-gaze-portal.zip — Game Jolt · PLiCy · freem!):
 *         itch 별점 · 팔로우 · X 공유와 다른 주소를 가리키는 머리말을 빼고, 잔혹 표현을 꺼 둔 채로 시작한다 (MG.portal)
 *       --no-elevenlabs  ElevenLabs 로 만든 소리를 뺀다 (무료 플랜은 상업적 사용 불가: 광고 수익을 나누는 곳에 올릴 때)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const PORTAL = process.argv.includes('--portal');
const NO11 = process.argv.includes('--no-elevenlabs');
const LOCAL = process.argv.includes('--local-fonts');
if (LOCAL && !PORTAL) { console.error('--local-fonts 는 --portal 과 함께'); process.exit(1); }
if (LOCAL && !fs.existsSync(path.join(root, 'fonts', 'local', 'boot.css'))) { console.error('fonts/local 이 없다 — node tools/font-pack.js 를 먼저'); process.exit(1); }
const OUT = path.join(root, 'dist', `monologue-gaze-${PORTAL ? 'portal' : 'itch'}${LOCAL ? '-local' : ''}${NO11 ? '-no11' : ''}.zip`);
const TOP = ['index.html', 'manifest.webmanifest', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'];
const DIRS = ['css/', 'js/', 'cases/', 'i18n/', 'img/', 'audio/', 'fonts/']; // i18n/: 다른 언어 꾸러미 (js/i18n.js 가 고른 언어의 것만 부른다)
// --portal 판: Game Jolt · PLiCy · freem! 은 파일 수 한도를 밝혀 두지 않았다 (받아 둔 글꼴을 넣으면 1,400개쯤)
const LIMIT = { files: PORTAL ? 2000 : 1000, file: 200 * 2 ** 20, total: 500 * 2 ** 20, name: 240 };
// 묶을 때만 바꿔 넣는 파일
const SWAP = new Map();
if (PORTAL) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), at = '<script src="js/i18n.js"></script>';
  if (!html.includes(at)) { console.error(`index.html 에 ${at} 이 없다`); process.exit(1); }
  // 다른 주소를 가리키는 머리말(canonical · og:url · og:image · 구조화 데이터)과 자바스크립트가 꺼졌을 때의 github 링크도 걷어 낸다: 이 판은 올린 사이트 안에서만 돈다
  let out = html.replace(at, `<script>window.MG = window.MG || {}; MG.portal = true;${LOCAL ? ' MG.localFonts = true;' : ''}</script>\n` + at)
    .replace(/<meta property="og:(?:url|image(?::\w+)?)"[^>]*>\n?/g, '').replace(/<link rel="canonical"[^>]*>\n?/, '')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/, '').replace(/\n<p class="nojs">Monologue Gaze: [^\n]*<\/p>/, '');
  if (LOCAL) { // 글꼴도 바깥에서 받지 않는다: 미리 연결(preconnect)을 걷고, 공통 글꼴 두 줄을 받아 둔 boot.css 한 줄로 (사건·언어 글꼴은 엔진·js/i18n.js 가 MG.localFonts 를 보고)
    out = out.replace(/<link rel="preconnect" href="https:\/\/[^"]+"[^>]*>\n?/g, '');
    let n = 0;
    out = out.replace(/<link rel="stylesheet" data-gf[^>]*>\n?/g, () => (n++ ? '' : '<link rel="stylesheet" href="fonts/local/boot.css">\n'));
    if (!n || /fonts\.googleapis|fonts\.gstatic|jsdelivr/.test(out)) { console.error('--local-fonts 판 index.html 에 바깥 글꼴 주소가 남았다'); process.exit(1); }
  }
  if (/jysvai\.github\.io|itch\.io/.test(out)) { console.error('--portal 판 index.html 에 다른 곳을 가리키는 링크가 남았다'); process.exit(1); }
  SWAP.set('index.html', Buffer.from(out, 'utf8'));
}
if (NO11) {
  // ElevenLabs 로 만든 소리(manifest 의 files: 주인공 대사와 효과음, clips 가운데 lead.mp3: 주연 대사)는 뺀다. 무료 플랜으로 만들어 상업적으로 쓸 수 없다.
  // 빠진 소리는 엔진이 자막·말소리·합성음으로 대신한다 (js/audio.js). 유료 플랜으로 다시 녹음하면 이 거르기를 걷어 낸다.
  // 조연 목소리(VoxCPM2, Apache-2.0, sub.mp3)와 CC0 효과음(js/audio.js 의 FOLEY)은 그대로 둔다.
  const mf = fs.readFileSync(path.join(root, 'audio', 'manifest.js'), 'utf8'), head = mf.indexOf('window.MG.audio = ');
  const box = { window: {} };
  vm.runInNewContext(mf, box);
  const a = box.window.MG.audio;
  // 자주 나는 적는 소리·딸깍만은 같은 이름의 CC0 녹음으로 바꿔 담는다 (audio/sfx/cc0/, 출처는 audio/sfx/CREDITS.md). 주소 뒤 ?v= 는 내용 해시
  a.files = Object.fromEntries(['pen', 'write', 'typewriter', 'tw1', 'oldkbd', 'kbd', 'tap', 'page', 'click', 'key']
    .map(k => [k, path.join(root, 'audio', 'sfx', 'cc0', k + '.mp3')]).filter(([, f]) => fs.existsSync(f))
    .map(([k, f]) => ['sfx/' + k, `audio/sfx/cc0/${k}.mp3?v=${require('crypto').createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8)}`]));
  a.clips = Object.fromEntries(Object.entries(a.clips || {}).filter(([, c]) => !/\/lead\.mp3(?:\?|$)/.test(c[0])));
  a.no11 = true; // 기록실 맨 아래 크레딧에서 ElevenLabs 를 뺀다 (js/engine.js) — 목소리가 든 판은 무료 플랜 조건대로 밝혀 둔다
  SWAP.set('audio/manifest.js', Buffer.from(mf.slice(0, head) + 'window.MG.audio = ' + JSON.stringify(a, null, 1) + ';\n', 'utf8'));
}
const MB = n => (n / 2 ** 20).toFixed(1) + 'MB';

// 저장소에 올라간 파일과 아직 커밋하지 않은 새 파일. .gitignore 에 걸린 것은 git 이 먼저 뺀다.
const listed = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 2 ** 20 })
  .split('\0').filter(Boolean);
// fonts/local/ (tools/font-pack.js 가 받아 둔 글꼴)은 .gitignore 에 걸려 있어 --local-fonts 판에만 직접 넣는다
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
let files = [...new Set([...listed, ...(LOCAL ? walk('fonts/local') : [])])]
  .filter(f => (TOP.includes(f) || DIRS.some(d => f.startsWith(d))) && fs.existsSync(path.join(root, f)))
  .sort();
const have = new Set(files);

// 가리키는 파일 모으기: index.html 의 src·href, 웹 앱 목록의 아이콘, css 의 url(), 글 속의 img/… · audio/… 경로
const refs = new Map(); // 경로 → 처음 나온 파일
const ref = (p, from) => { p = p.split(/[?#]/)[0]; if (p && !refs.has(p)) refs.set(p, from); };
const local = u => !/^(?:[a-z]+:|\/\/|#|%23|\/)/i.test(u); // %23 = data URI 속 SVG 의 url(#필터)
const text = f => SWAP.has(f) ? SWAP.get(f).toString('utf8') : fs.readFileSync(path.join(root, f), 'utf8');
const bare = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'); // 주석 속 예시 경로는 세지 않는다
for (const [, u] of text('index.html').matchAll(/\b(?:src|href)="([^"]+)"/g)) if (local(u)) ref(u, 'index.html');
for (const i of JSON.parse(text('manifest.webmanifest')).icons || []) ref(i.src, 'manifest.webmanifest');
for (const f of files) {
  if (!/\.(?:js|css|html)$/.test(f)) continue;
  const t = f.endsWith('.html') ? text(f) : bare(text(f));
  if (f.endsWith('.css')) for (const [, u] of t.matchAll(/url\(\s*['"]?([^'")]+)/g)) if (local(u)) ref(path.posix.join(path.posix.dirname(f), u), f);
  for (const [p] of t.matchAll(/\b(?:img|audio)\/[\w./-]+\.(?:webp|png|jpe?g|gif|svg|mp3|ogg|wav|m4a)\b/g)) ref(p, f);
}
// 목소리는 사건마다 묶은 파일(lead.mp3 · sub.mp3)과 manifest 가 가리키는 것만: 낱개 대사 파일은 다시 녹음할 때 쓰는 원본이다 (tools/voice-pack.js)
// 효과음도 가리키는 것만: --no-elevenlabs 판은 위에서 manifest 의 ElevenLabs 효과음을 걷어 냈고, 보통 판은 그 대신 넣는 cc0/ 를 쓰지 않는다
const loose = files.filter(f => (f.startsWith('audio/voice/') || /^audio\/sfx\/.+\.mp3$/.test(f)) && !refs.has(f));
files = files.filter(f => !loose.includes(f));
const missing = [...refs].filter(([p]) => !have.has(p)).map(([p, from]) => {
  const near = files.find(f => f.toLowerCase() === p.toLowerCase());
  return `  ${p}  (${from})` + (near ? ` — 실제 파일은 ${near}: 대소문자가 다르다` : fs.existsSync(path.join(root, p)) ? ' — .gitignore 에 걸려 빠졌다' : ' — 파일이 없다');
});

// itch.io 한도
const sizes = files.map(f => SWAP.has(f) ? SWAP.get(f).length : fs.statSync(path.join(root, f)).size);
const total = sizes.reduce((a, b) => a + b, 0);
const over = [];
if (files.length > LIMIT.files) over.push(`  파일 ${files.length}개 — 한도 ${LIMIT.files}개`);
if (total > LIMIT.total) over.push(`  모두 ${MB(total)} — 한도 ${MB(LIMIT.total)}`);
files.forEach((f, i) => {
  if (sizes[i] > LIMIT.file) over.push(`  ${f} ${MB(sizes[i])} — 한 파일 한도 ${MB(LIMIT.file)}`);
  if (f.length > LIMIT.name) over.push(`  ${f} — 경로 ${f.length}자, 한도 ${LIMIT.name}자`);
});
if (missing.length || over.length) {
  if (missing.length) console.error('빠진 파일:\n' + missing.join('\n'));
  if (over.length) console.error((PORTAL ? '--portal 판' : 'itch.io') + ' 한도를 넘는다:\n' + over.join('\n'));
  process.exit(1);
}

// zip 쓰기. 이름은 UTF-8 (일반 목적 비트 11), 이미 눌려 있는 webp·mp3 처럼 줄지 않는 파일은 그대로 담는다.
function dosTime(d) {
  return [(d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()];
}
const parts = [], central = [];
let off = 0;
files.forEach(f => {
  const full = path.join(root, f);
  const data = SWAP.get(f) || fs.readFileSync(full);
  const name = Buffer.from(f, 'utf8');
  const packed = zlib.deflateRawSync(data, { level: 9 });
  const store = packed.length >= data.length;
  const body = store ? data : packed;
  const crc = zlib.crc32(data);
  const [time, date] = dosTime(fs.statSync(full).mtime);
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x0800, 6); head.writeUInt16LE(store ? 0 : 8, 8);
  head.writeUInt16LE(time, 10); head.writeUInt16LE(date, 12); head.writeUInt32LE(crc, 14);
  head.writeUInt32LE(body.length, 18); head.writeUInt32LE(data.length, 22); head.writeUInt16LE(name.length, 26);
  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x0800, 8); cen.writeUInt16LE(store ? 0 : 8, 10);
  cen.writeUInt16LE(time, 12); cen.writeUInt16LE(date, 14); cen.writeUInt32LE(crc, 16);
  cen.writeUInt32LE(body.length, 20); cen.writeUInt32LE(data.length, 24); cen.writeUInt16LE(name.length, 28); cen.writeUInt32LE(off, 42);
  parts.push(head, name, body);
  central.push(cen, name);
  off += head.length + name.length + body.length;
});
const cdSize = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(off, 16);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([...parts, ...central, end]));
console.log(`${path.relative(root, OUT).replace(/\\/g, '/')} — 파일 ${files.length}개 · 풀면 ${MB(total)} · 묶음 ${MB(off + cdSize + 22)} · 가리키는 그림·소리 ${refs.size}개 모두 들어감${loose.length ? ` · 쓰지 않는 소리 파일(목소리의 낱개 원본 포함) ${loose.length}개는 뺌` : ''}`);
