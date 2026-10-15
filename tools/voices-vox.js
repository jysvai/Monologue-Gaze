#!/usr/bin/env node
/* 조연 목소리 (VoxCPM2, 로컬 · Apache-2.0) → audio/voice/<사건>/sub.mp3 + audio/vox-clips.json → audio/manifest.js 의 clips
 *   node tools/voices-vox.js --dry               무엇을 만들지 보기만
 *   node tools/voices-vox.js [--case=c00,c01]    없는 줄과 글자 · 설명이 바뀐 줄만 만들고, 사건마다 다시 묶는다
 *   node tools/voices-vox.js --redo=키,키        그 줄만 다시 (첫인사를 다시 지으면 그 사람의 다른 줄도 다시)
 *   node tools/voices-vox.js --pack              만들지 않고 묶기만
 * 주연은 ElevenLabs (tools/voices.js) — 한 사람 안에서 두 엔진을 섞지 않는다 (음질이 달라 바로 티가 난다).
 * 조연 목록과 목소리 설명은 tools/vox-cast.js. 사람마다: 첫인사를 설명대로 세 번 지어 받아쓰기 · 음높이로 가장 나은 것을 고르고
 * (그 사람 목소리의 견본), 대답은 그 견본을 이어 읽혀 두 번 중 나은 것. 형사가 끼어든 말(「— 」)은 주인공 목소리라 여기서 만들지 않는다.
 * itch 는 파일이 1000개까지라, 한 사건의 조연 목소리는 파일 하나에 이어 붙이고 manifest 에 [파일, 시작 초, 길이 초] 로 적는다 (js/audio.js clip).
 * 파이썬: VOXCPM_PY (기본 C:/Users/yunseok/voxcpm/.venv/Scripts/python.exe, torch cu128 · voxcpm · openai-whisper)
 * 만든 wav 는 VOXCPM_CACHE (기본 C:/Users/yunseok/voxcpm/cache) 에 둔다. 다시 묶을 때 다시 만들지 않는다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync, execFileSync } = require('child_process');
const { load } = require('./validate');
const V = require('./voices');
const DESC = require('./vox-cast');
const TONE = require('./vox-tone');
const { koNum } = require('./ko-num');
const KEEP = new Set(require('./vox-keep'));
const { pack: packFile } = require('./voice-pack');

const root = path.join(__dirname, '..');
const PY = process.env.VOXCPM_PY || 'C:/Users/yunseok/voxcpm/.venv/Scripts/python.exe';
const CACHE = process.env.VOXCPM_CACHE || 'C:/Users/yunseok/voxcpm/cache';
const SAID = path.join(__dirname, 'voices-vox-said.json');
const CLIPS = path.join(root, 'audio', 'vox-clips.json');
const SR = 44100, LUFS = -22.5; // 소리 크기는 ElevenLabs 대사와 같게 (tools/voice-post.js)
// 씨앗: VOX_INTRO / VOX_INTRO_MORE (쉼표) 로 늘릴 수 있다 (잘 안 잡히는 목소리를 몇 사람만 다시 지을 때)
const seedsOf = (v, d) => (v ? v.split(',').map(Number) : d);
const STEPS = 12; // 확산 단계 (기본 10): 조금 올리면 낱말이 덜 뭉개진다 (16 은 한 번에 30초 넘게 걸렸다)
const INTRO_SEEDS = seedsOf(process.env.VOX_INTRO, [11, 23, 37, 41]), INTRO_MORE = seedsOf(process.env.VOX_INTRO_MORE, [53, 67, 79]), LINE_SEEDS = [5, 19], MORE_SEEDS = seedsOf(process.env.VOX_LINE_MORE, [41, 53]);

// 설명(tools/vox-cast.js)에서 성별 · 나이를 읽는다: "Elderly male voice, a man of about 65" / "A woman in her fifties"
const NUM = { seventeen: 17, twenty: 20, 'twenty-three': 23, 'twenty-five': 25, 'twenty-seven': 27, 'thirty-one': 31, 'thirty-five': 35, fifty: 50, 'fifty-five': 55, 'sixty-four': 64, 'seventy-one': 71 };
const DEC = { teens: 16, twenties: 25, thirties: 35, forties: 45, fifties: 55, sixties: 65, seventies: 75 };
function meta(d) {
  const f = /^(elderly |young |teenage )?female\b/i.test(d) || (!/^(elderly |young |teenage )?(male|boy)\b/i.test(d) && /\b(woman|her|mother|madam|landlady|waitress|maid|hostess)\b/i.test(d));
  let m = d.match(/(?:about|of) (\d+)/i), age = m ? +m[1] : null;
  if (age == null && (m = d.match(/(early|mid|late)?\s*(teens|twenties|thirties|forties|fifties|sixties|seventies)/i))) age = DEC[m[2].toLowerCase()] + ({ early: -3, mid: 0, late: 3 }[(m[1] || 'mid').toLowerCase()]);
  if (age == null && (m = d.match(/(seventeen|twenty-three|twenty-five|twenty-seven|thirty-one|thirty-five|fifty-five|sixty-four|seventy-one|twenty|fifty)/i))) age = NUM[m[1].toLowerCase()];
  return { f, age: age || 40 };
}

function jobs() {
  const files = fs.readdirSync(path.join(root, 'cases')).filter(f => /^c\d+.*\.js$/.test(f)).sort();
  const cases = files.flatMap(f => load(path.join(root, 'cases', f)));
  const list = [];
  for (const c of cases) for (const [pid, p] of Object.entries(c.people || {})) {
    const who = `${c.id}/${pid}`;
    if (!DESC[who]) continue;
    const cast = V.CAST[who];
    if (cast && cast[1]) { console.warn('주연(ElevenLabs)이라 건너뜀:', who); continue; }
    const base = { who, c: c.id, pid, tone: cast ? cast[0] : 150, ...meta(DESC[who]) };
    const it = V.pickText(p.intro);
    if (it.t) list.push({ ...base, key: `v/${who}/_intro`, text: V.speak(it.t), span: it.span, intro: true });
    for (const [k, a] of Object.entries(p.ask || {})) {
      if (!(a && !Array.isArray(a) && typeof a === 'object' && 'need' in a)) continue; // 메모를 내밀어야 나오는 대답 (추궁 · 「확인」)만
      const { t, span } = V.pickText(a.a);
      if (t) list.push({ ...base, key: `v/${who}/${k}`, text: V.speak(t), span });
      let pushed = false;
      V.bl(a.a).forEach((l, i) => {
        if (l == null || i < span) return;
        const dash = V.DASH.test(V.strip(l)), s = V.say(l).replace(/^—\s*/, '');
        if (!/[가-힣A-Za-z0-9]/.test(s)) return;
        if (dash) { pushed = true; return; }
        if (pushed) list.push({ ...base, key: `v/${who}/${k}.${i}`, text: V.speak(s) });
      });
    }
  }
  // 숫자는 한글 읽기로 (VoxCPM2 는 「14일」을 엉뚱하게 읽는다). 어조 뒤에 나이에 맞는 말 빠르기와 「탐문에 대답하는 말」을 붙인다
  // ("clear articulation, every word pronounced" 를 붙였더니 글 읽는 소리가 났다: 관리인 A · B · C 견본에서 사용자가 이 말을 골랐다)
  return list.map(j => ({ ...j, text: koNum(j.text), tone: [TONE[j.key.slice(2)], pace(j), TALK].filter(Boolean).join(', ') }));
}
const TALK = "answering a detective's question in person, casual spoken conversation, not reading aloud, natural pauses";
// 나이 든 사람이 가볍고 빠르게 말하면 나이가 안 맞게 들린다 (어조가 빠르다고 한 줄은 그대로)
function pace(j) {
  if (/fast|quick|hurried|rush|breathless/i.test(TONE[j.key.slice(2)] || '')) return '';
  return j.age >= 60 ? 'the unhurried way an older person talks' : j.age >= 45 ? 'a settled mature way of talking' : '';
}

const safe = k => k.replace(/^v\//, '').replace(/[\\/]/g, '__');
const wavOf = k => path.join(CACHE, safe(k) + '.wav');
const introKey = who => `v/${who}/_intro`;

// 파이썬을 돌리며 한 줄 JSON 을 받는다
function py(script, file) {
  return new Promise((res, rej) => {
    const ch = spawn(PY, [path.join(__dirname, script), file], { env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } });
    const out = []; let buf = '', err = '';
    ch.stdout.on('data', d => {
      buf += d; let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const l = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!l.startsWith('{')) continue;
        try { out.push(JSON.parse(l)); } catch (e) { /* 다른 출력 */ }
      }
    });
    ch.stderr.on('data', d => { err = (err + d).slice(-3000); });
    ch.on('close', code => (code === 0 ? res(out) : rej(new Error(`${script} 끝남 ${code}\n${err}`))));
  });
}

const semi = (a, b) => (a > 0 && b > 0 ? Math.abs(12 * Math.log2(a / b)) : 12);
// 목소리 높이 범위: 성별과 나이로 (나이 들수록 여자 목소리는 낮아진다). 말소리 높이(CAST)는 짧은 합성음용이라 쓰지 않는다
const band = j => (j.f ? (j.age >= 56 ? [140, 235] : j.age >= 36 ? [155, 250] : [175, 300]) : (j.age <= 30 ? [85, 165] : [70, 160]));
// 나이 · 성별 재기(vox-age.py)는 나이 든 목소리를 실제보다 젊게 재는 편이라 여러 번 지은 것끼리 견주는 데만 쓴다
const sexOk = (r, j) => r.f == null || (j.f ? r.f : r.m) >= 0.5;
const ageOff = (r, j) => (r.age == null ? 0 : Math.max(0, Math.abs(r.age - j.age) - 6));
// 또렷함: 받아쓰기가 낱말마다 얼마나 확신했는지 (Whisper 는 뭉개진 말도 앞뒤 뜻으로 채워 적으므로, 글자만 맞춰 보면 빠진 낱말을 못 잡는다)
const blur = r => (r.pmean == null ? 0 : Math.max(0, 0.85 - r.pmean)) + (r.pmin != null && r.pmin < 0.3 ? 0.15 : 0);
// 글 읽는 소리: 문장 안에서 음높이가 거의 오르내리지 않는다 (주연 ElevenLabs 평균 5.1 반음, 낭독은 2~3)
const flat = r => (r.st_sd == null ? 0 : Math.max(0, 3.5 - r.st_sd));
// 외치는 소리: 그 나이 · 성별의 높이 범위보다 반음 4개 넘게 높다 (게르스틀이 320Hz 로 「시끄럽다」)
const shout = (r, j) => r.hz > band(j)[1] * 1.26;
// 말 빠르기 (초당 음절): 나이 든 사람이 빠르면 나이가 안 맞고, 너무 느리면 처진다 (민지 「쫌 느려」)
const rate = (r, j) => (r.talk ? (j.text.match(/[가-힣]/g) || []).length / r.talk : null);
function rateOff(r, j) {
  const v = rate(r, j); if (v == null || /fast|quick|hurried|rush|breathless/i.test(j.tone)) return 0;
  const [lo, hi] = j.age >= 60 ? [2.8, 5.2] : j.age >= 45 ? [3.2, 6.0] : [3.6, 7.0];
  return v < lo ? lo - v : v > hi ? v - hi : 0;
}
function score(r, j, want) {
  const [lo, hi] = band(j);
  return r.sim - blur(r) - (sexOk(r, j) ? 0 : 0.6) - (r.hz < lo || r.hz > hi ? 0.15 : 0) - (shout(r, j) ? 0.3 : 0) - 0.05 * flat(r) - 0.08 * rateOff(r, j)
    - 0.012 * ageOff(r, j) - (r.gap > 1.0 ? 0.3 : 0) - (want ? 0.03 * semi(r.hz, want) : 0);
}
// 더 지어 볼 줄: 글자가 어긋났거나 뭉개진 낱말이 있거나, 성별이 틀렸거나, 외치거나, 평평하게 읽거나, 빠르기가 나이에 안 맞거나,
// (첫인사) 나이가 많이 다르거나, (대답) 첫인사와 높이가 많이 다르거나. 높이 범위 자체는 견줄 때만 쓴다: 화내거나 놀라는 줄은 높이가 오르는 게 맞다
function weakOf(r, j, want) {
  return r.sim < 0.9 || (r.pmin != null && r.pmin < 0.3) || !sexOk(r, j) || shout(r, j) || flat(r) > 1.2 || rateOff(r, j) > 1
    || (j.intro ? ageOff(r, j) > 12 : semi(r.hz, want) > 5 || ageOff(r, j) > 15);
}
// 받아쓴 글도 숫자를 같은 규칙으로 읽어 견준다 (Whisper 는 「14일」처럼 숫자로 적는다)
const bare = s => koNum(s).replace(/[^0-9A-Za-z가-힣]/g, '');
function ratio(a, b) {
  a = bare(a); b = bare(b);
  if (!a.length && !b.length) return 1;
  const dp = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) { let prev = 0; for (let k = 1; k <= b.length; k++) { const t = dp[k]; dp[k] = a[i - 1] === b[k - 1] ? prev + 1 : Math.max(dp[k], dp[k - 1]); prev = t; } }
  return Math.round((2 * dp[b.length] / (a.length + b.length)) * 1000) / 1000;
}

// 한 묶음: 줄마다 여러 번 만들고 받아쓰기로 재어 가장 나은 것을 cache 에 둔다
// reuse: 이미 지어 둔 같은 씨앗은 다시 짓지 않고 함께 견준다 (더 지어 볼 때)
async function takes(list, said, make, wantOf, reuse) {
  const dir = path.join(CACHE, 'takes'); fs.mkdirSync(dir, { recursive: true });
  const runs = list.flatMap(j => make(j).map(r => ({ ...r, key: `${j.key}#${r.seed}`, out: path.join(dir, `${safe(j.key)}#${r.seed}.wav`) })));
  const fresh = runs.filter(r => !(reuse && fs.existsSync(r.out)));
  const jf = path.join(CACHE, 'jobs.json'); fs.writeFileSync(jf, JSON.stringify(fresh));
  const t0 = Date.now();
  console.log(`VoxCPM2: ${list.length}줄 · ${fresh.length}번 짓기 …`);
  const made = fresh.length ? await py('vox.py', jf) : [];
  made.filter(m => !m.ok).forEach(m => console.log('  ✗', m.key, m.err));
  const ok = new Set([...made.filter(m => m.ok).map(m => m.key), ...runs.filter(r => !fresh.includes(r)).map(r => r.key)]);
  const cf = path.join(CACHE, 'checks.json');
  fs.writeFileSync(cf, JSON.stringify(runs.filter(r => ok.has(r.key)).map(r => ({ key: r.key, wav: r.out, text: r.text }))));
  const heard = Object.fromEntries((await py('vox-check.py', cf)).map(r => [r.key, r]));
  for (const r of runs) if (heard[r.key]) heard[r.key].sim = ratio(heard[r.key].heard, r.text);
  for (const r of await py('vox-age.py', cf)) if (heard[r.key]) Object.assign(heard[r.key], { age: r.age, f: r.f, m: r.m });
  console.log(`  ${Math.round((Date.now() - t0) / 1000)}초`);
  const weak = [];
  for (const j of list) {
    const want = wantOf(j);
    const cand = make(j).map(r => heard[`${j.key}#${r.seed}`] && { ...heard[`${j.key}#${r.seed}`], seed: r.seed }).filter(Boolean);
    if (!cand.length) { console.log('  ✗ 못 만듦', j.key); continue; }
    const best = cand.reduce((a, b) => (score(b, j, want) > score(a, j, want) ? b : a));
    fs.copyFileSync(path.join(dir, `${safe(j.key)}#${best.seed}.wav`), wavOf(j.key));
    said[j.key] = { t: j.text, d: DESC[j.who], o: j.tone, seed: best.seed, hz: best.hz, sim: best.sim, p: best.pmin, age: best.age, ...(j.intro ? {} : { a: said[introKey(j.who)].seed }) };
    const bad = weakOf(best, j, want);
    console.log(`  ${bad ? '△' : '✓'} ${j.key} · ${best.sim} · 또렷 ${best.pmean}/${best.pmin} · 오르내림 ${best.st_sd} · ${(rate(best, j) || 0).toFixed(1)}음절/초 · ${best.hz}Hz · ${best.age}세(${j.age}) ${best.f >= 0.5 ? '여' : '남'}(${j.f ? '여' : '남'}) · ${best.secs}초${best.sim < 0.8 ? ` · 들린 말: ${best.heard}` : ''}`);
    if (bad) weak.push(j);
  }
  fs.writeFileSync(SAID, JSON.stringify(Object.fromEntries(Object.entries(said).sort()), null, 1) + '\n');
  return weak;
}

// 사건마다 이어 붙이기: 앞뒤 침묵을 깎고, 크기를 맞춰, GAP 씩 띄워 한 파일로
function pcmOf(file) {
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse';
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', trim + ',loudnorm=print_format=json', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const m = JSON.parse(e.slice(e.lastIndexOf('{'), e.lastIndexOf('}') + 1));
  const gain = Math.min(LUFS - +m.input_i, -1.5 - +m.input_tp + 6); // 한 번에 맞추고, 남는 봉우리는 막이가 누른다
  return execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-af', `${trim},volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=false`, '-ar', String(SR), '-ac', '1', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
}
function pack(list) {
  const clips = {}, span = {};
  for (const c of [...new Set(list.map(j => j.c))].sort()) {
    const items = list.filter(j => j.c === c && fs.existsSync(wavOf(j.key)));
    const out = path.join(root, 'audio', 'voice', c, 'sub.mp3');
    if (!items.length) { if (fs.existsSync(out)) fs.unlinkSync(out); continue; }
    Object.assign(clips, packFile(items.map(j => ({ key: j.key, file: wavOf(j.key), load: () => pcmOf(wavOf(j.key)) })), out, { salt: `vox ${LUFS}` }));
    items.forEach(j => { if (j.span > 1) span[j.key] = j.span; });
    console.log(`audio/voice/${c}/sub.mp3 — ${items.length}줄 · ${(fs.statSync(out).size / 1024).toFixed(0)}KB`);
  }
  fs.writeFileSync(CLIPS, JSON.stringify({ clips, span }, null, 1) + '\n');
  const r = spawnSync('node', [path.join(__dirname, 'voices.js'), '--manifest'], { encoding: 'utf8' });
  process.stdout.write(r.stdout.split('\n').filter(l => /manifest/.test(l)).join('\n') + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const arg = n => ((args.find(a => a.startsWith(`--${n}=`)) || '').split('=')[1] || '').split(',').filter(Boolean);
  const dry = args.includes('--dry'), packOnly = args.includes('--pack'), only = new Set(arg('case')), redo = new Set(arg('redo'));
  const all = jobs(), list = all.filter(j => !only.size || only.has(j.c));
  const said = fs.existsSync(SAID) ? JSON.parse(fs.readFileSync(SAID, 'utf8')) : {};
  fs.mkdirSync(CACHE, { recursive: true });
  const introRedo = new Set(list.filter(j => j.intro && redo.has(j.key)).map(j => j.who));
  const kept = j => KEEP.has(j.who) && !redo.has(j.key) && fs.existsSync(wavOf(j.key)) && said[j.key] && said[j.key].t === j.text; // 고정한 사람은 글자가 같으면 그대로
  const fresh = j => kept(j) || (!redo.has(j.key) && !introRedo.has(j.who) && fs.existsSync(wavOf(j.key)) && said[j.key] && said[j.key].t === j.text && said[j.key].d === DESC[j.who] && (said[j.key].o || '') === j.tone);
  const introOk = who => fresh(all.find(j => j.key === introKey(who)) || {});
  const todo = list.filter(j => !kept(j) && (!fresh(j) || (!j.intro && (!introOk(j.who) || said[j.key].a !== (said[introKey(j.who)] || {}).seed))));
  console.log(`조연 목소리: ${list.length}줄 (${new Set(list.map(j => j.who)).size}명) · 만들 것 ${todo.length}줄 (${todo.reduce((n, j) => n + j.text.length, 0)}자)`);
  if (dry) { todo.forEach(j => console.log(`${j.key}\t${j.text.slice(0, 80)}`)); return; }
  if (!packOnly && todo.length) {
    const intros = todo.filter(j => j.intro);
    const tdir = path.join(CACHE, 'takes'), pre = new Set(todo.map(j => safe(j.key) + '#'));
    if (fs.existsSync(tdir)) for (const f of fs.readdirSync(tdir)) if (pre.has(f.slice(0, f.indexOf('#') + 1))) fs.unlinkSync(path.join(tdir, f)); // 옛 설명으로 지은 것과 섞이지 않게
    // 첫인사: 두 번 지어 보고, 성별 · 나이 · 높이 · 받아쓰기가 어긋나면 세 번 더 지어 다섯 개 중 가장 나은 것
    const design = seeds => j => seeds.map(seed => ({ text: j.text, desc: DESC[j.who] + (j.tone ? ', ' + j.tone : ''), seed, steps: STEPS }));
    const weakIntro = intros.length ? await takes(intros, said, design(INTRO_SEEDS), () => 0) : [];
    if (weakIntro.length) await takes(weakIntro, said, design([...INTRO_SEEDS, ...INTRO_MORE]), () => 0, true);
    // 대답: 그 사람 견본의 목소리 결에 그 줄의 어조(vox-tone.js)를 얹어 한 번, 어긋나면 두 번 더 지어 셋 중 나은 것
    const ref = j => ({ ref: wavOf(introKey(j.who)), ref_text: said[introKey(j.who)].t, ...(j.tone ? { control: j.tone } : {}) });
    const clone = seeds => j => seeds.map(seed => ({ text: j.text, seed, steps: STEPS, ...ref(j) }));
    const rest = todo.filter(j => !j.intro && fs.existsSync(wavOf(introKey(j.who))) && said[introKey(j.who)]);
    const weak = rest.length ? await takes(rest, said, clone(LINE_SEEDS), j => said[introKey(j.who)].hz) : [];
    if (weak.length) await takes(weak, said, clone([...LINE_SEEDS, ...MORE_SEEDS]), j => said[introKey(j.who)].hz, true);
  }
  pack(all);
}
if (require.main === module) main().catch(e => { console.error(e.message || e); process.exit(1); });
module.exports = { jobs };
