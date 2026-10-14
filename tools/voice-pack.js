/* 목소리 묶기 — 한 사건의 대사 파일들을 mp3 하나로 이어 붙이고 [파일, 시작 초, 길이 초] 를 돌려준다 (js/audio.js 의 clip)
 * itch 는 파일이 1000개까지라 대사마다 파일 하나로는 모자란다. 낱개 파일은 저장소에 그대로 두고(다시 녹음하는 단위),
 * tools/itch-zip.js 는 manifest 가 가리키지 않는 audio/voice/ 파일을 묶음에서 뺀다.
 *  - 조각 사이에 GAP 초 침묵. 적는 시작 · 길이에는 앞뒤로 PAD 초씩 침묵을 더 넣는다: 브라우저가 mp3 앞의 인코더 지연을
 *    덜어 내는지에 따라 몇십 ms 어긋나도 말이 잘리지 않게.
 *  - 다시 누를 때는 원본(64kbps)보다 높은 96kbps 로: 두 번 누른 티가 나지 않게.
 *  - 넣을 것이 그대로면(열쇠와 파일 내용이 같으면) 다시 만들지 않는다 (tools/voice-pack.json 에 적어 둔다).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const SR = 44100, GAP = 0.35, PAD = 0.06;

const IDX = path.join(__dirname, 'voice-pack.json');
// items: [{ key, file, load? }] — load 가 있으면 그것이 돌려주는 PCM(Buffer, s16le 44.1kHz 모노)을, 없으면 file 을 풀어 쓴다
function pack(items, out, opt = {}) {
  const root = opt.root || path.join(__dirname, '..');
  const rel = path.relative(root, out).replace(/\\/g, '/');
  const all = fs.existsSync(IDX) ? JSON.parse(fs.readFileSync(IDX, 'utf8')) : {};
  const sig = crypto.createHash('md5').update(JSON.stringify(items.map(i => [i.key, crypto.createHash('md5').update(fs.readFileSync(i.file)).digest('hex')]).concat(opt.salt || ''))).digest('hex'); // 내용으로 (git 이 고친 때를 바꿔도 다시 만들지 않게)
  if (fs.existsSync(out) && all[rel] && all[rel].sig === sig) return all[rel].clips;
  const gap = Buffer.alloc(Math.round(GAP * SR) * 2), at = {}, parts = [];
  let pos = 0;
  for (const it of items) {
    const b = it.load ? it.load() : execFileSync('ffmpeg', ['-v', 'error', '-i', it.file, '-ar', String(SR), '-ac', '1', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
    parts.push(gap, b); pos += gap.length;
    at[it.key] = [pos / 2 / SR, b.length / 2 / SR]; pos += b.length;
  }
  parts.push(gap);
  const raw = out + '.pcm';
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(raw, Buffer.concat(parts));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', raw, '-c:a', 'libmp3lame', '-b:a', '96k', out]);
  fs.unlinkSync(raw);
  const v = crypto.createHash('md5').update(fs.readFileSync(out)).digest('hex').slice(0, 8);
  const clips = {};
  for (const it of items) clips[it.key] = [`${rel}?v=${v}`, +(at[it.key][0] - PAD).toFixed(3), +(at[it.key][1] + 2 * PAD).toFixed(3)];
  all[rel] = { sig, clips };
  fs.writeFileSync(IDX, JSON.stringify(Object.fromEntries(Object.entries(all).sort()), null, 1) + '\n');
  return clips;
}

module.exports = { pack, SR, GAP, PAD };
