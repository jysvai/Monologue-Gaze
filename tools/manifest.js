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
// 같은 이름으로 그림을 바꿔 넣어도 브라우저가 옛 그림을 붙들지 않게, 내용 해시를 주소 뒤에 붙인다.
const crypto = require('crypto');
Object.keys(map).forEach(k => { map[k] += '?v=' + crypto.createHash('md5').update(fs.readFileSync(path.join(root, map[k]))).digest('hex').slice(0, 8); });

const body = `/* 자동 생성 파일 — node tools/manifest.js 로 다시 만든다.
 * img/<사건id>/<키>.(webp|png|jpg) 파일이 있으면 SVG 대신 그 이미지를 쓴다. */
window.MG = window.MG || {};
window.MG.images = ${JSON.stringify(map, null, 2)};
`;
fs.writeFileSync(path.join(imgDir, 'manifest.js'), body, 'utf8');
console.log(`img/manifest.js — 이미지 ${Object.keys(map).length}장 연결`);
