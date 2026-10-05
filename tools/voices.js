#!/usr/bin/env node
/* 목소리·효과음 만들기 (ElevenLabs) → audio/ 와 audio/manifest.js
 *   node tools/voices.js --dry      무엇을 몇 글자 만들지 보기만
 *   node tools/voices.js            없는 파일과, 녹음한 뒤로 대사 글자가 바뀐 파일만 만든다
 *   node tools/voices.js --manifest 파일은 그대로 두고 manifest 만 다시 쓴다
 * 목소리는 결정적인 순간에만 쓴다: 증거를 들이밀어 진술이 바뀌는 대사, 주인공의 추궁·결론. 나머지 대사는 게임이 말소리(짧은 합성음)로 채운다.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load } = require('./validate');
const el = require('./eleven');
const { post } = require('./voice-post'); // 녹음한 뒤 소리 크기·주인공 음높이 다듬기

const root = path.join(__dirname, '..');
const OUT = path.join(root, 'audio');
// 파일마다 어떤 글자를 읽혀 만들었는지 적어 둔다: 사건 파일의 대사를 고치면 그 목소리만 다시 녹음한다 (자막과 목소리가 어긋나지 않게)
const SAID = path.join(__dirname, 'voices-said.json');
// eleven_v4_turbo: 억양이 살아 있고 물음표 끝을 올려 읽는다. multilingual_v2 는 음높이가 밋밋해 기계 같았다 (반음 흔들림 2~4 → 5 안팎).
// 받아쓰기로 대본과 맞춰 보았을 때 글자를 바꿔 읽은 줄이 없었다. 값은 v2 의 절반
const MODEL = 'eleven_v4_turbo';
// 받아쓰기로 맞춰 보니 v4_turbo 가 하오체 어미(-소, -오)를 요즘 말(-어, -야)로 바꿔 읽은 줄: 다른 모델로 녹음한다
const PIN = {
  'v/c04/p_irie/k_0628.2': 'eleven_multilingual_v2', 'v/c05/p_pell/k_typewriter': 'eleven_multilingual_v2',
  'v/c12/p_shinji/k_saeki': 'eleven_v4', 'v/c12/p_shinji/k_saeki.2': 'eleven_multilingual_v2',
};
const modelOf = j => j.model || MODEL;
const rate = j => /turbo|flash/.test(modelOf(j)) ? 0.5 : 1; // 글자당 크레딧 (말투 지시도 글자로 센다)
const said_ = j => j.tag && !/multilingual_v2/.test(modelOf(j)) ? `${j.tag} ${j.text}` : j.text; // v2 는 말투 지시를 소리 내어 읽는다
const sig = j => [j.vname, modelOf(j), j.speed, j.stab, j.tag || ''].join(' ').trim();

// 프리셋 목소리 (ElevenLabs premade)
const V = {
  river: 'SAz9YHcvj6GT2YYXdXww', roger: 'CwhRBWXzGAHq8TQ4Fs17', sarah: 'EXAVITQu4vr4xnSDxMaL', charlie: 'IKne3meq5aSn9XLyUdCD',
  george: 'JBFqnCBsd6RMkjVDRZzb', callum: 'N2lVS1w4EtoT3dr4eOWO', harry: 'SOYHLrjzK2X1ezoPC6cr', liam: 'TX3LPaxmHKxFdv7VOQHJ',
  will: 'bIHbv24MWmeRgasZH58o', jessica: 'cgSgspJ2msm6clMCkdW9', eric: 'cjVigY5qzO86Huf0OWal', bella: 'hpp4J3VqNfWAUOO0d1Us',
  chris: 'iP95p4xoKVk53GoZ742B', brian: 'nPczCjzI2devNBz1zQrb', daniel: 'onwK4e9ZLuTAKqWW03F9', lily: 'pFZP5JQG7iQjIQuC4Bku',
  adam: 'pNInz6obpgDQGcFmaJgB', bill: 'pqHfZKP75CvOlQylNhV4', matilda: 'XrExE9yKIg1WjnnlVkGX', alice: 'Xb7hH8MSUJpSbSDYk0k2',
  laura: 'FGY2WhTYpPnrIDTdsKH5',
};

// 사람마다 말소리 높이(Hz, 성별·나이). 목소리가 붙는 사람은 [목소리, 빠르기, 안정도, 말투] 를 더한다 — 낮은 안정도일수록 감정이 흔들린다.
// 말투는 모델에 주는 연기 지시다 (소리로 읽히지 않는다). 한 사건 안에서 같은 목소리를 두 사람에게 주지 않는다.
// 주인공은 성별을 정하지 않은 신입 형사라 차분하고 중성적인 목소리 — v4 는 river 를 높게 읽으므로 [calm] 으로 눌러 둔다.
const HERO = { voice: 'river', speed: 1, stab: 0.6, tone: 150, tag: '[calm]' };
const CAST = {
  'c00/p_manager': [105], 'c00/p_neighbor': [205], 'c00/p_minji': [225], 'c00/p_jaehee': [215, 'laura', 1, 0.3, '[shaky]'], 'c00/p_dohyun': [120],
  'c01/p_quarrell': [110], 'c01/p_bill': [95], 'c01/p_vane': [115, 'daniel', 1.05, 0.45, '[defensive]'], 'c01/p_croft': [92, 'callum', 0.92, 0.35, '[gruff]'], 'c01/p_hannah': [195], 'c01/p_peggy': [185], 'c01/p_dill': [105],
  'c02/p_gerstl': [100], 'c02/p_hubmann': [95], 'c02/p_magdalena': [215], 'c02/p_rottmayr': [88], 'c02/p_pfaenzl': [105, 'harry', 0.95, 0.35, '[sullen]'], 'c02/p_knauer': [90, 'adam', 0.9, 0.45, '[cold]'], 'c02/p_resl': [205],
  'c03/p_park': [125], 'c03/p_baek': [220, 'lily', 0.95, 0.35, '[nervous]'], 'c03/p_seo': [100, 'eric', 0.93, 0.4, '[hesitant]'], 'c03/p_choi': [190], 'c03/p_kwak': [85], 'c03/p_gil': [115],
  'c04/p_okabe': [95, 'roger', 0.95, 0.4, '[tired]'], 'c04/p_kitamura': [100], 'c04/p_ono': [98], 'c04/p_genzo': [95], 'c04/p_shimada': [112], 'c04/p_irie': [120, 'liam', 1, 0.3, '[nervous]'],
  'c05/p_lowell': [200], 'c05/p_dugan': [118], 'c05/p_pell': [92, 'george', 0.95, 0.45, '[defensive]'], 'c05/p_coyle': [122], 'c05/p_osgood': [95], 'c05/p_delgado': [100], 'c05/p_brennan': [110, 'chris', 0.95, 0.35, '[nervous]'],
  'c06/p_kari': [225], 'c06/p_per': [110], 'c06/p_randi': [220], 'c06/p_solveig': [200], 'c06/p_taxi': [100], 'c06/p_remmert': [112, 'chris', 1, 0.4, '[hesitant]'], 'c06/p_brate': [90, 'brian', 0.92, 0.45, '[cold]'],
  'c07/p_mansik': [105, 'roger', 0.9, 0.3, '[tired]'], 'c07/p_madam': [195], 'c07/p_operator': [230, 'jessica', 1.05, 0.35, '[nervous]'], 'c07/p_granny': [175], 'c07/p_seok': [90, 'adam', 0.95, 0.45, '[cold]'], 'c07/p_wife': [205, 'bella', 0.95, 0.3, '[bitter]'], 'c07/p_no': [110, 'chris', 0.95, 0.35, '[hesitant]'],
  'c08/p_mother': [200], 'c08/p_father': [92, 'brian', 1, 0.35, '[defensive]'], 'c08/p_driver': [105], 'c08/p_tutor': [120, 'will', 1, 0.4, '[nervous]'], 'c08/p_shop': [195], 'c08/p_foreman': [95], 'c08/p_tak': [88, 'callum', 0.92, 0.4, '[gruff]'],
  'c09/p_sora': [225, 'sarah', 0.95, 0.3, '[shaky]'], 'c09/p_eunbi': [225], 'c09/p_courier': [120, 'charlie', 1.05, 0.35, '[defensive]'], 'c09/p_jinwoo': [122], 'c09/p_realtor': [190], 'c09/p_tak': [100, 'eric', 0.92, 0.45, '[calm]'],
  'c10/p_miran': [210, 'matilda', 0.95, 0.3, '[sad]'], 'c10/p_sangmin': [115], 'c10/p_myeongsu': [100, 'chris', 0.95, 0.4, '[hesitant]'], 'c10/p_okja': [185], 'c10/p_guard': [98], 'c10/p_bang': [90, 'brian', 0.95, 0.4, '[defensive]'],
  'c11/p_woo': [92, 'adam', 0.92, 0.35, '[gruff]'], 'c11/p_jin': [95], 'c11/p_han': [225], 'c11/p_yeom': [85], 'c11/p_park': [195], 'c11/p_gil': [125, 'liam', 1, 0.3, '[nervous]'], 'c11/p_ham': [95, 'george', 0.9, 0.4, '[tired]'],
  'c12/p_takano': [85], 'c12/p_paperboy': [135], 'c12/p_ishiguro': [215], 'c12/p_ogawa': [125], 'c12/p_murakoshi': [95, 'george', 0.95, 0.4, '[cold]'], 'c12/p_kimura': [92], 'c12/p_toshie': [180], 'c12/p_shinji': [98, 'roger', 0.9, 0.35, '[sullen]'],
  'c13/p_oh': [112, 'brian', 0.95, 0.4, '[defensive]'], 'c13/p_woojin': [138, 'charlie', 1.05, 0.3, '[nervous]'], 'c13/p_jihan': [128, 'will', 1, 0.3, '[hesitant]'], 'c13/p_choi': [205], 'c13/p_kim': [188],
  'c14/p_seok': [118, 'eric', 0.95, 0.4, '[calm]'], 'c14/p_taeo': [135, 'liam', 1, 0.3, '[defensive]'], 'c14/p_siwoo': [148, 'will', 0.95, 0.25, '[shaky]'], 'c14/p_jeongrye': [205], 'c14/p_oksun': [220], 'c14/p_eunju': [195], 'c14/p_changhoon': [108],
  'c15/p_harin': [225], 'c15/p_junhyuk': [118, 'daniel', 0.95, 0.35, '[cold]'], 'c15/p_landlord': [102, 'bill', 0.9, 0.4, '[annoyed]'], 'c15/p_woobin': [138], 'c15/p_minjae': [112, 'callum', 0.9, 0.3, '[hesitant]'], 'c15/p_jisu': [205],
};

// 주인공 대사: 추궁할 때, 결정적인 단서가 맞아떨어질 때, 보고서를 올릴 때
const LINES = {
  press1: '이걸 보시죠. 그래도 같은 말씀입니까?',
  press2: '다시 묻겠습니다. 이건 어떻게 설명하시겠습니까?',
  press3: '기록에 남아 있습니다. 이번엔 사실대로 말씀해 주시죠.',
  press4: '처음 하신 말씀과 다릅니다. 무엇이 사실입니까?',
  recall1: '이걸 한번 봐 주시겠습니까. 떠오르는 게 있으신지요.', // soft: 거짓말한 적 없는 사람에게 메모를 보일 때
  recall2: '천천히 보셔도 됩니다. 이거, 기억나십니까?',
  match1: '…이거다.',
  match2: '맞아떨어진다.',
  match3: '그래, 여기서 이어지는구나.',
  accuse: '범인은… 이 사람입니다.',
  wrong: '…아직 뭔가 빠져 있어.',
  solved: '사건 종결. 선배, 하나 닫았습니다.',
};

// 효과음 (초 단위 길이)
const SFX = {
  clue: ['a single soft low taiko drum hit with a faint paper rustle, subtle discovery cue for a detective game, no music', 1.4],
  match: ['two heavy taiko drum hits, dum... dum, followed by a deep cinematic sub boom and a short rising swell, evidence confirmed sting, no melody', 3],
  confess: ['tense heartbeat thumps speeding up, then a sharp dark orchestral hit with low brass, dramatic interrogation confession sting, no melody', 3.5],
  miss: ['a dull muted wooden thud with a short low descending tone, wrong answer, subtle and dry', 1],
  solved: ['a heavy rubber stamp slammed onto paper, then a deep resolving taiko drum roll and a low warm brass swell, case closed', 4],
  unlock: ['an old metal lock clicking open with a heavy latch, followed by one soft low drum hit', 1.6],
  find: ['a vintage camera shutter click and a quick pencil circling scribble on paper', 1],
  dread: ['a dark low drone swell with a distant metallic scrape and a faint breath, horror reveal, no music', 3],
  // 적는 소리 (엔진의 inkKind 가 사건 시대로 고른다). 받은 뒤 잘라 내고 고음을 깎았다 — 지우고 다시 받으면 쇳소리가 섞일 수 있으니 파형을 보고 넣을 것
  pen: ['one soft graphite pencil stroke on paper, close and quiet, no metal', 0.2],
  write: ['a soft graphite pencil quickly writing one short word on paper in a notebook, gentle papery strokes, close and quiet, dry room, no metal, no ringing', 0.5],
  typewriter: ['three quick keystrokes on an old manual typewriter, mechanical clack of type bars hitting paper, no bell, no carriage return, dry and close', 0.4],
  tw1: ['one single keystroke on an old manual typewriter, dry and close', 0.12],
  oldkbd: ['three quick keystrokes on a 1990s beige office computer keyboard, plastic clicky keys, dry and close, no echo', 0.4],
  kbd: ['three quick keystrokes on a 2000s office desktop keyboard, soft plastic membrane keys, dry and close, no echo', 0.4],
  tap: ['three quick soft keystrokes on a thin modern laptop keyboard, quiet low taps, dry and close, no echo', 0.45],
  page: ['a single old paper page turned quickly', 0.6],
  click: ['a single soft computer mouse button click, dry and close, no echo', 0.5],
  key: ['one single keystroke on an old heavy mechanical computer keyboard, dry and close, no echo', 0.5],
  // 빨간 별 사건 (잔혹 표현 켜짐): 끔찍한 기록을 처음 펼칠 때, 그리고 사건 배경에 이따금
  gore: ['a sudden swarm of flies lifting off close to the ear, a low dissonant cello scrape and one heavy wet drip, horror discovery stinger, no melody', 3.5],
  bonesaw: ['a hand saw rasping slowly back and forth through bone, muffled as if heard through a thin wall, a wet crack at the end, then silence, no music', 4],
  flies: ['a few flies buzzing slowly around something rotting in a cold quiet room, drifting close past the ear and away, no music', 6],
  creak: ['an old wooden barn door creaking slowly on rusted hinges in a winter wind, a loose chain knocking faintly, no music', 5],
  crackle: ['charred wood still hissing and crackling faintly in cold mountain mist after a fire has burned out, a gust of wind, no music', 5],
  static: ['a car radio left on in a parked car at night, soft hissing static between stations, the engine ticking as it cools, lonely, no music', 5],
};

const strip = s => String(s || '').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/\*\*|~~/g, '');
const say = s => strip(s).replace(/\([^()]*\)/g, ' ').replace(/[「」『』"]/g, '').replace(/\s+/g, ' ').trim();
const bl = b => (b == null ? [] : Array.isArray(b) ? b : [b]).map(x => (typeof x === 'string' ? x : x && x.p != null ? x.p : x && x.say != null ? x.say : null));
const DASH = /^\s*(\([^()]*\)\s*)?—/;
// 목소리로 읽을 때만 바꿔 읽는 것 (화면 글자는 그대로): 삐삐 번호·번호판·단위
const SPEAK = [[/300m/g, '삼백 미터'], [/2330/g, '이삼삼공'], [/H-24/g, '에이치 이십사'], [/0시 31분/g, '영 시 삼십일 분']];
const speak = t => SPEAK.reduce((s, [re, w]) => s.replace(re, w), t);
// 번복 대사에서 목소리를 입힐 부분: 첫 말풍선, 너무 짧으면 둘째까지. 170자를 넘으면 문장 끝에서 자른다.
function pickText(blocks) {
  const lines = bl(blocks);
  let t = '', span = 0;
  for (const l of lines) {
    if (l == null) break;
    if (DASH.test(strip(l))) break; // 「— 」 는 형사가 끼어든 말: 용의자 목소리로 읽지 않는다
    const s = say(l);
    if (!/[가-힣A-Za-z0-9]/.test(s)) { span++; continue; } // 몸짓·말줄임표뿐인 줄
    if (t && (t.length >= 30 || (t + ' ' + s).length > 170)) break;
    t = t ? t + ' ' + s : s; span++;
  }
  if (t.length > 170) { const cut = t.slice(0, 170); const i = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '), cut.lastIndexOf('다.'), cut.lastIndexOf('요.')); t = cut.slice(0, i > 60 ? i + 1 : 170).trim(); span = 1; }
  return { t, span };
}

function jobs() {
  const files = fs.readdirSync(path.join(root, 'cases')).filter(f => /^c\d+.*\.js$/.test(f)).sort();
  const cases = files.flatMap(f => load(path.join(root, 'cases', f)));
  const list = [];
  Object.entries(SFX).forEach(([k, [text, secs]]) => list.push({ key: `sfx/${k}`, file: `audio/sfx/${k}.mp3`, kind: 'sfx', text, secs }));
  const HEROV = { vname: HERO.voice, voice: V[HERO.voice], speed: HERO.speed, stab: HERO.stab, tag: HERO.tag };
  Object.entries(LINES).forEach(([k, text]) => list.push({ key: `hero/${k}`, file: `audio/voice/hero/${k}.mp3`, kind: 'tts', ...HEROV, text }));
  const tone = {};
  for (const c of cases) for (const [pid, p] of Object.entries(c.people || {})) {
    const cast = CAST[`${c.id}/${pid}`];
    if (!cast) { console.warn('목소리 배정 없음:', c.id, pid); continue; }
    tone[`${c.id}/${pid}`] = cast[0];
    for (const [k, a] of Object.entries(p.ask || {})) {
      if (!(a && !Array.isArray(a) && typeof a === 'object' && 'need' in a)) continue;
      const { t, span } = pickText(a.a);
      const who = { vname: cast[1], voice: V[cast[1]], speed: cast[2], stab: cast[3], tag: cast[4] };
      if (t && cast[1]) list.push({ key: `v/${c.id}/${pid}/${k}`, file: `audio/voice/${c.id}/${pid}-${k}.mp3`, kind: 'tts', ...who, text: speak(t), span });
      // 그 뒤: 형사가 끼어든 말(「— 」)은 주인공 목소리로, 그 말에 대한 대꾸는 그 사람 목소리로 — 말풍선 하나씩 (키 끝에 .번호)
      let pushed = false;
      bl(a.a).forEach((l, i) => {
        if (l == null || i < span) return;
        const dash = DASH.test(strip(l)), s = say(l).replace(/^—\s*/, '');
        if (!/[가-힣A-Za-z0-9]/.test(s)) return;
        if (dash) { pushed = true; list.push({ key: `v/${c.id}/${pid}/${k}.${i}`, file: `audio/voice/${c.id}/${pid}-${k}.${i}.mp3`, kind: 'tts', ...HEROV, stab: 0.5, text: speak(s) }); }
        else if (pushed && cast[1]) list.push({ key: `v/${c.id}/${pid}/${k}.${i}`, file: `audio/voice/${c.id}/${pid}-${k}.${i}.mp3`, kind: 'tts', ...who, text: speak(s) });
      });
    }
  }
  list.forEach(j => { if (PIN[j.key]) j.model = PIN[j.key]; });
  return { list, tone };
}

function writeManifest(list, tone) {
  const files = {}, span = {};
  list.forEach(j => { if (fs.existsSync(path.join(root, j.file))) { files[j.key] = j.file; if (j.span > 1) span[j.key] = j.span; } });
  const lines = Object.fromEntries(Object.entries(LINES).map(([k, t]) => ['hero/' + k, t])); // 주인공 대사는 속말 자막으로도 띄운다
  const body = `/* 자동 생성: node tools/voices.js — 목소리·효과음 파일 목록, 사람마다 말소리 높이, 주인공 대사 자막 */\nwindow.MG = window.MG || {};\nwindow.MG.audio = ${JSON.stringify({ files, span, tone: { hero: HERO.tone, ...tone }, say: lines }, null, 1)};\n`;
  fs.writeFileSync(path.join(OUT, 'manifest.js'), body);
  console.log(`audio/manifest.js — 파일 ${Object.keys(files).length}개 · 말소리 ${Object.keys(tone).length + 1}명`);
}

async function main() {
  const dry = process.argv.includes('--dry'), only = process.argv.includes('--manifest');
  const { list, tone } = jobs();
  fs.mkdirSync(OUT, { recursive: true });
  const said = fs.existsSync(SAID) ? JSON.parse(fs.readFileSync(SAID, 'utf8')) : {};
  const has = j => fs.existsSync(path.join(root, j.file));
  // 파일마다 읽힌 글자와 목소리(이름·모델·빠르기·안정도)를 적어 둔다. 둘 중 하나라도 바뀌면 다시 녹음한다.
  // 적어 둔 것이 없는 옛 파일은 지금 글자·지금 배정대로 만들었다고 본다
  list.forEach(j => {
    if (j.kind !== 'tts' || !has(j)) return;
    if (said[j.key] == null) said[j.key] = { t: j.text, v: sig(j) };
    else if (typeof said[j.key] === 'string') said[j.key] = { t: said[j.key], v: sig(j) };
  });
  const stale = j => j.kind === 'tts' && has(j) && (said[j.key].t !== j.text || said[j.key].v !== sig(j));
  const todo = list.filter(j => !has(j) || stale(j));
  const keep = () => { const k = new Set(list.map(j => j.key)); fs.writeFileSync(SAID, JSON.stringify(Object.fromEntries(Object.entries(said).filter(([x]) => k.has(x)).sort()), null, 1) + '\n'); };
  const chars = todo.filter(j => j.kind === 'tts').reduce((n, j) => n + said_(j).length * rate(j), 0);
  const secs = todo.filter(j => j.kind === 'sfx').reduce((n, j) => n + j.secs, 0);
  console.log(`만들 것: 대사 ${todo.filter(j => j.kind === 'tts').length}개 (${todo.filter(j => j.kind === 'tts').reduce((n, j) => n + j.text.length, 0)}자) · 효과음 ${todo.filter(j => j.kind === 'sfx').length}개 (${secs}초) — 예상 약 ${Math.round(chars + secs * 10)} 크레딧`);
  if (dry) { todo.forEach(j => console.log(`${stale(j) ? '(다시) ' : ''}${j.key}\t${j.kind === 'sfx' ? j.secs + 's' : j.text.length + '자'}\t${j.text.slice(0, 90)}`)); return; }
  if (!only) {
    let left = (await el.quota()).left;
    console.log(`남은 크레딧 ${left}`);
    for (const j of todo) {
      const cost = j.kind === 'tts' ? Math.ceil(said_(j).length * rate(j)) : j.secs * 10;
      if (left - cost < 150) { console.log('크레딧이 모자라 멈춤:', j.key); break; }
      try {
        if (j.kind === 'sfx') await el.sfx(path.join(root, j.file), j.text, j.secs);
        else await el.tts(j.voice, path.join(root, j.file), said_(j), modelOf(j), j.speed, j.stab);
        if (j.kind === 'tts') { post(path.join(root, j.file), j.vname === 'river'); said[j.key] = { t: j.text, v: sig(j), p: 1 }; }
        left -= cost; console.log('✓', j.key, cost);
      } catch (e) { console.log('✗', j.key, e.message.slice(0, 160)); if (/quota|credits|401|403/.test(e.message)) break; }
    }
  }
  keep();
  writeManifest(list, tone);
}
if (require.main === module) main().catch(e => { console.error(e); process.exit(1); });
module.exports = { jobs, sig, said_ };
