#!/usr/bin/env node
/* ElevenLabs 호출 도우미 — 키는 .env 의 ELEVENLABS_API_KEY (저장소에 올리지 않는다).
 *   node tools/eleven.js quota                     남은 크레딧
 *   node tools/eleven.js voices                    쓸 수 있는 목소리 목록
 *   node tools/eleven.js tts <voice> <out.mp3> "대사" [model] [speed] [stability]
 *   node tools/eleven.js sfx <out.mp3> "설명" [초]
 */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

function key() {
  const env = fs.existsSync(path.join(root, '.env')) ? fs.readFileSync(path.join(root, '.env'), 'utf8') : '';
  const m = env.match(/ELEVENLABS_API_KEY\s*=\s*(\S+)/) || [null, process.env.ELEVENLABS_API_KEY || ''];
  const k = String(m[1]).replace(/^['"]+|['"]+$/g, '');
  if (!k) throw new Error('.env 에 ELEVENLABS_API_KEY 가 없다');
  return k;
}
async function api(p, opt = {}) {
  const r = await fetch('https://api.elevenlabs.io' + p, { ...opt, headers: { 'xi-api-key': key(), 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 300)}`);
  return r;
}
async function quota() { const j = await (await api('/v1/user/subscription')).json(); return { used: j.character_count, limit: j.character_limit, left: j.character_limit - j.character_count, tier: j.tier }; }
async function voices() {
  const j = await (await api('/v1/voices?page_size=100')).json();
  return j.voices.map(v => ({ id: v.voice_id, name: v.name, cat: v.category, ...v.labels }));
}
async function tts(voice, out, text, model = 'eleven_v3', speed = 1, stability = 0.5) {
  const body = { text, model_id: model, voice_settings: { stability: +stability, similarity_boost: 0.75, speed: +speed } };
  if (model !== 'eleven_multilingual_v2') body.language_code = 'ko';
  const r = await api(`/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, { method: 'POST', body: JSON.stringify(body) });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  return out;
}
async function sfx(out, text, secs) {
  const body = { text, model_id: 'eleven_text_to_sound_v2', prompt_influence: 0.5 };
  if (secs) body.duration_seconds = +secs;
  const r = await api('/v1/sound-generation?output_format=mp3_44100_128', { method: 'POST', body: JSON.stringify(body) });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
  return out;
}
module.exports = { quota, voices, tts, sfx };

if (require.main === module) {
  const [cmd, ...a] = process.argv.slice(2);
  const run = { quota, voices, tts: () => tts(...a), sfx: () => sfx(...a) }[cmd];
  if (!run) { console.log('사용: quota | voices | tts <voice> <out> "대사" [model] [speed] [stability] | sfx <out> "설명" [초]'); process.exit(1); }
  run().then(x => console.log(typeof x === 'string' ? x : JSON.stringify(x, null, 1))).catch(e => { console.error(e.message); process.exit(1); });
}
