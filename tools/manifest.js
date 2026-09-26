#!/usr/bin/env node
/* img/ 폴더를 훑어 img/manifest.js 를 다시 만든다.
 * img/<사건id>/<키>.(webp|png|jpg|jpeg) → MG.images['<사건id>/<키>']
 * 사용: node tools/manifest.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const imgDir = path.join(root, 'img');
const pref = ['.webp', '.png', '.jpg', '.jpeg'];
const map = {};

fs.readdirSync(imgDir, { withFileTypes: true }).filter(d => d.isDirectory() && d.name !== '_src').forEach(dir => {
  fs.readdirSync(path.join(imgDir, dir.name)).forEach(f => {
    const ext = path.extname(f).toLowerCase();
    if (!pref.includes(ext)) return;
    const key = `${dir.name}/${path.basename(f, path.extname(f))}`;
    const cur = map[key];
    if (!cur || pref.indexOf(ext) < pref.indexOf(path.extname(cur.split('?')[0]))) map[key] = `img/${dir.name}/${f}`;
  });
});
// 그림의 가로·세로 픽셀: 엔진이 그림이 오기 전에 자리를 잡아 두는 데 쓴다 (늦게 뜬 그림이 글을 밀어내지 않게)
function dims(buf) {
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buf.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
    if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
    if (kind === 'VP8X') return [buf.readUIntLE(24, 3) + 1, buf.readUIntLE(27, 3) + 1];
  }
  if (buf.readUInt32BE(0) === 0x89504e47) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
  if (buf[0] === 0xff && buf[1] === 0xd8) { // JPEG: SOF 표지를 찾는다
    for (let i = 2; i < buf.length - 9;) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}
// 같은 이름으로 그림을 바꿔 넣어도 브라우저가 옛 그림을 붙들지 않게, 내용 해시를 주소 뒤에 붙인다.
const crypto = require('crypto');
const size = {};
Object.keys(map).forEach(k => {
  const buf = fs.readFileSync(path.join(root, map[k]));
  const d = dims(buf);
  if (d && d[0] && d[1]) size[k] = d;
  map[k] += '?v=' + crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
});

const body = `/* 자동 생성 파일 — node tools/manifest.js 로 다시 만든다.
 * img/<사건id>/<키>.(webp|png|jpg) 파일이 있으면 SVG 대신 그 이미지를 쓴다. imageSize 는 [가로, 세로] 픽셀. */
window.MG = window.MG || {};
window.MG.images = ${JSON.stringify(map, null, 2)};
window.MG.imageSize = ${JSON.stringify(size)};
`;
fs.writeFileSync(path.join(imgDir, 'manifest.js'), body, 'utf8');
console.log(`img/manifest.js — 이미지 ${Object.keys(map).length}장 연결`);
