#!/usr/bin/env node
/* 이미지 다듬기 — img/<폴더>/ 에 넣은 .png/.jpg 를 게임용 .webp 로 줄이고, 원본은 img/_src/ 로 옮긴다.
 * 그다음 tools/manifest.js 를 돌려 게임에 연결한다. ffmpeg 가 필요하다.
 * 사용: node tools/optimize-images.js          (같은 이름으로 다시 넣으면 다시 변환한다)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const img = path.join(root, 'img');
const SRC = '_src';
// 가로 최대 픽셀과 품질. 화면에서 가장 넓게 쓰이는 곳(문서 폭 760px)의 두 배 정도면 충분하다.
const RULE = { '_global/hero': [1920, 80], '_global/desk': [1024, 80], '_global/paper': [1024, 82], '_global/warn': [600, 90] };
const DEF = [1280, 78];

let n = 0, before = 0, after = 0;
fs.readdirSync(img, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== SRC).forEach(dir => {
  fs.readdirSync(path.join(img, dir.name)).filter(f => /\.(png|jpe?g)$/i.test(f)).forEach(f => {
    const key = path.basename(f, path.extname(f));
    const id = `${dir.name}/${key}`;
    const [w, q] = RULE[id] || DEF;
    const inp = path.join(img, dir.name, f);
    const out = path.join(img, dir.name, key + '.webp');
    const alpha = id === '_global/warn' || /\.png$/i.test(f) && fs.readFileSync(inp).readUInt8(25) === 6; // PNG 색 형식 6 = RGBA
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', inp, '-vf', `scale='min(${w},iw)':-2`, '-c:v', 'libwebp', '-quality', String(q), '-compression_level', '6', ...(alpha ? ['-pix_fmt', 'yuva420p'] : []), out]);
    const keep = path.join(img, SRC, dir.name);
    fs.mkdirSync(keep, { recursive: true });
    const b = fs.statSync(inp).size, a = fs.statSync(out).size;
    fs.renameSync(inp, path.join(keep, f));
    n++; before += b; after += a;
    console.log(`✓ ${id}.webp  ${(b / 1048576).toFixed(1)}MB → ${(a / 1024).toFixed(0)}KB${alpha ? ' (투명)' : ''}`);
  });
});
if (n) console.log(`${n}장 변환 · ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB · 원본은 img/${SRC}/ 에 보관`);
else console.log('변환할 .png/.jpg 가 없다.');
execFileSync(process.execPath, [path.join(__dirname, 'manifest.js')], { stdio: 'inherit' });
