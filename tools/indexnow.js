#!/usr/bin/env node
/* IndexNow — 바뀐 페이지를 Bing · Naver · Yandex · Seznam 에 바로 알린다 (Google 은 받지 않는다. 계정 없이 키 파일만)
 * 키 파일: 저장소 맨 위의 <키>.txt (내용 = 키). GitHub Pages 의 /Monologue-Gaze/ 아래를 덮는다.
 * 사용: node tools/indexnow.js            → sitemap.xml 의 주소 전부
 *       node tools/indexnow.js <주소> …   → 그 주소만
 * GitHub Pages 에 올라간 뒤(키 파일이 열린 뒤)에 돌린다.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE = 'https://jysvai.github.io/Monologue-Gaze/';
const keyFile = fs.readdirSync(root).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('키 파일(<32자리 16진수>.txt)이 저장소 맨 위에 없다');
const key = fs.readFileSync(path.join(root, keyFile), 'utf8').trim();

const urls = process.argv.slice(2).length ? process.argv.slice(2)
  : [...fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

(async () => {
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: 'jysvai.github.io', key, keyLocation: SITE + keyFile, urlList: urls }),
  });
  // 200 = 받음 · 202 = 받았고 키 확인 중 · 400/403/422 = 요청 · 키 · 주소가 잘못됨 · 429 = 너무 잦음
  console.log(`IndexNow ${r.status} ${r.statusText} · 주소 ${urls.length}개`);
  if (r.status >= 400) console.log(await r.text());
})();
