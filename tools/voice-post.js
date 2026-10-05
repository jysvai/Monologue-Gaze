#!/usr/bin/env node
/* 녹음한 목소리 다듬기 (크레딧 안 씀, ffmpeg)
 *  - 모든 대사: 소리 크기를 -22.5 LUFS 로 맞춘다 (줄마다 들쭉날쭉하지 않게, 순간 최고 -1.5 dB 아래)
 *  - 주인공(river): v4 가 질문을 높게 읽어 여자 목소리처럼 들리는 줄이 있다 → 음높이 중앙값이 195Hz 넘으면 넘는 만큼(최대 3반음) 낮춘다.
 *    음색(포먼트)은 그대로 두므로 같은 사람이 조금 낮게 말하는 소리가 된다
 *  node tools/voice-post.js          voices-said.json 에 다듬었다는 표시(p)가 없는 파일만
 *  node tools/voice-post.js --dry    무엇을 얼마나 바꿀지만
 *  voices.js 가 새로 녹음한 파일마다 post() 를 부른다. 같은 파일을 두 번 다듬지 않게 표시를 남긴다.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const LUFS = -22.5, PEAK = -1.5, HERO_HZ = 195, MAX_SEMI = 3;

function pcm(file, sr) {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(sr), '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.length / 2);
  for (let i = 0; i < x.length; i++) x[i] = raw.readInt16LE(i * 2) / 32768;
  return x;
}

// 말소리 음높이 중앙값 (자기상관, 소리가 큰 구간만, 옥타브 튐은 버린다)
function pitch(file) {
  const SR = 16000, x = pcm(file, SR), W = 640, H = 160, lo = Math.floor(SR / 400), hi = Math.floor(SR / 65);
  const en = [];
  for (let s = 0; s + W + hi < x.length; s += H) { let e = 0; for (let i = 0; i < W; i++) e += x[s + i] * x[s + i]; en.push(Math.sqrt(e / W)); }
  const gate = Math.max(...en) * 0.08, f0 = [];
  for (let s = 0, k = 0; s + W + hi < x.length; s += H, k++) {
    if (en[k] < gate) { f0.push(0); continue; }
    let e0 = 0; for (let i = 0; i < W; i++) e0 += x[s + i] * x[s + i];
    let best = 0, bl = 0;
    for (let l = lo; l <= hi; l++) {
      let c = 0, e1 = 0;
      for (let i = 0; i < W; i++) { c += x[s + i] * x[s + i + l]; e1 += x[s + i + l] * x[s + i + l]; }
      const r = c / Math.sqrt(e0 * e1 + 1e-12);
      if (r > best) { best = r; bl = l; }
    }
    f0.push(best > 0.55 ? SR / bl : 0);
  }
  const v = f0.map((f, i) => {
    if (!f) return 0;
    const nb = f0.slice(Math.max(0, i - 5), i + 6).filter(Boolean).sort((a, b) => a - b);
    return Math.abs(12 * Math.log2(f / nb[nb.length >> 1])) > 7 ? 0 : f;
  }).filter(Boolean).sort((a, b) => a - b);
  return v[v.length >> 1] || 0;
}

function loud(file, pre) {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', (pre ? pre + ',' : '') + 'loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const j = JSON.parse(e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1));
  return { i: +j.input_i, tp: +j.input_tp };
}

// 무엇을 할지: 낮출 반음, 더할 dB
function plan(file, hero) {
  let semi = 0;
  if (hero) { const hz = pitch(file); if (hz > HERO_HZ) semi = Math.min(MAX_SEMI, 12 * Math.log2(hz / HERO_HZ)); }
  const shift = semi > 0.2 ? `rubberband=pitch=${Math.pow(2, -semi / 12).toFixed(4)}:formant=preserved:pitchq=quality` : '';
  const l = loud(file, shift);
  let gain = LUFS - l.i;
  if (l.tp + gain > PEAK) gain = PEAK - l.tp;
  return { semi: +semi.toFixed(2), shift, gain: +gain.toFixed(2) };
}

function post(file, hero) {
  const p = plan(file, hero);
  const af = [p.shift, `volume=${p.gain}dB`].filter(Boolean).join(',');
  const tmp = file + '.tmp.mp3';
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-af', af, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', tmp]);
  fs.renameSync(tmp, file);
  return p;
}

module.exports = { post, plan, pitch };

if (require.main === module) {
  const root = path.join(__dirname, '..');
  const SAID = path.join(__dirname, 'voices-said.json');
  const { jobs } = require('./voices.js');
  const dry = process.argv.includes('--dry');
  const said = JSON.parse(fs.readFileSync(SAID, 'utf8'));
  const todo = jobs().list.filter(j => j.kind === 'tts' && said[j.key] && typeof said[j.key] === 'object' && !said[j.key].p && fs.existsSync(path.join(root, j.file)));
  let n = 0;
  for (const j of todo) {
    const f = path.join(root, j.file), hero = j.vname === 'river';
    const p = dry ? plan(f, hero) : post(f, hero);
    if (!dry) { said[j.key].p = 1; n++; }
    if (dry || p.semi) console.log(`${j.key}\t${p.semi ? '-' + p.semi + '반음 ' : ''}${p.gain > 0 ? '+' : ''}${p.gain}dB`);
  }
  if (!dry) { fs.writeFileSync(SAID, JSON.stringify(said, null, 1) + '\n'); console.log(`다듬음 ${n}개`); }
}
