#!/usr/bin/env node
/* 조연 목소리 전체 점검: 지금 캐시에 있는 모든 줄을 voices-vox.js 와 같은 잣대로 다시 잰다
 *   node tools/vox-audit.js            걸린 줄과 이유를 찍는다 (마지막 줄: --redo= 에 넣을 키 목록)
 * 잣대: 받아쓰기 · 낱말 확신도 · 성별 · 나이 · 외침 · 평평함(글 읽는 소리) · 말 빠르기 (tools/vox-keep.js 의 사람은 뺀다)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const VV = require('./voices-vox');
const KEEP = new Set(require('./vox-keep'));
const PY = process.env.VOXCPM_PY || 'C:/Users/yunseok/voxcpm/.venv/Scripts/python.exe';
const CACHE = process.env.VOXCPM_CACHE || 'C:/Users/yunseok/voxcpm/cache';
const safe = k => k.replace(/^v\//, '').replace(/[\\/]/g, '__');

const list = VV.jobs().filter(j => !KEEP.has(j.who) && fs.existsSync(path.join(CACHE, safe(j.key) + '.wav')));
const cf = path.join(CACHE, 'audit.json');
fs.writeFileSync(cf, JSON.stringify(list.map(j => ({ key: j.key, wav: path.join(CACHE, safe(j.key) + '.wav'), text: j.text }))));
const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' };
const rows = s => spawnSync(PY, [path.join(__dirname, s), cf], { env, encoding: 'utf8', maxBuffer: 1 << 26 }).stdout.split('\n').filter(l => l.startsWith('{')).map(l => JSON.parse(l));
const R = Object.fromEntries(rows('vox-check.py').map(r => [r.key, r]));
for (const a of rows('vox-age.py')) if (R[a.key]) Object.assign(R[a.key], { age: a.age, f: a.f, m: a.m });
const introHz = Object.fromEntries(list.filter(j => j.intro && R[j.key]).map(j => [j.who, R[j.key].hz]));
const bad = [];
for (const j of list) {
  const r = R[j.key]; if (!r) continue;
  r.sim = VV.ratio(r.heard, j.text);
  const why = VV.why(r, j, j.intro ? 0 : introHz[j.who]);
  if (why.length) { bad.push(j.key); console.log(`${j.key}\t${why.join(', ')}`); }
}
console.log(`\n${list.length}줄 중 ${bad.length}줄 걸림`);
console.log(bad.join(','));
