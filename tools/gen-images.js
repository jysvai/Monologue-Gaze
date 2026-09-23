#!/usr/bin/env node
/* 이미지 일괄 생성 — 사건 파일의 art[*].prompt 를 OpenAI 이미지 API 로 한꺼번에 그려 img/ 에 저장한다.
 *
 * 준비: OpenAI API 키 (platform.openai.com 의 API 결제, ChatGPT 구독과는 별도)
 *   PowerShell:  $env:OPENAI_API_KEY = "sk-..."
 *   bash:        export OPENAI_API_KEY=sk-...
 *
 * 사용:
 *   node tools/gen-images.js --dry                 # 무엇을 몇 장 그릴지, 예상 비용만 본다 (API 호출 없음)
 *   node tools/gen-images.js                       # 없는 이미지만 전부 그린다 (기본: gpt-image-1-mini, low)
 *   node tools/gen-images.js --only c04,c05        # 특정 사건만 (_global 도 가능)
 *   node tools/gen-images.js --only c00/cover      # 특정 그림 하나만
 *   node tools/gen-images.js --quality medium      # 품질 low | medium | high
 *   node tools/gen-images.js --model gpt-image-1   # 모델 바꾸기
 *   node tools/gen-images.js --force               # 이미 있는 것도 다시 그린다
 *   node tools/gen-images.js --limit 5             # 앞에서 5장만 (시험용)
 *   옵션: --concurrency 3  --compression 80  --moderation low
 *
 * 끝나면 tools/manifest.js 를 자동으로 돌려 게임에 연결한다. 실패한 그림은 목록으로 알려 주고 건너뛴다
 * (정책에 걸린 그림은 docs/IMAGE_PROMPTS.md 의 프롬프트를 조금 고쳐서 GPT 앱에서 따로 만들면 된다).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { load } = require('./validate');
const { GLOBAL } = require('./prompts');

const root = path.join(__dirname, '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i < 0 ? def : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true; };
const MODEL = opt('model', 'gpt-image-1-mini');
const QUALITY = opt('quality', 'low');
const ONLY = opt('only', '') ? String(opt('only')).split(',').map(s => s.trim()).filter(Boolean) : [];
const FORCE = !!opt('force', false);
const DRY = !!opt('dry', false);
const LIMIT = +opt('limit', 0) || 0;
const CONC = Math.max(1, +opt('concurrency', 3) || 3);
const COMP = Math.min(100, Math.max(0, +opt('compression', 80)));
const MODERATION = opt('moderation', 'auto');

// 장당 가격 (USD). gpt-image-1-mini 는 OpenAI 모델 문서 기준. 다른 모델은 가격표를 확인할 것.
const PRICE = { 'gpt-image-1-mini': { low: [0.005, 0.006], medium: [0.011, 0.015], high: [0.036, 0.052] } };

function sizeOf(ratio) {
  const m = String(ratio || '4:3').match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  const r = m ? +m[1] / +m[2] : 4 / 3;
  if (r > 1.15) return '1536x1024';
  if (r < 0.87) return '1024x1536';
  return '1024x1024';
}
const exists = (dir, key) => ['.webp', '.png', '.jpg', '.jpeg'].some(e => fs.existsSync(path.join(root, 'img', dir, key + e)));

// ── 그릴 목록
const jobs = [];
GLOBAL.forEach(g => jobs.push({ dir: '_global', key: g.key, prompt: g.prompt, size: sizeOf(g.ratio), transparent: g.key === 'warn' }));
fs.readdirSync(path.join(root, 'cases')).filter(f => f.endsWith('.js')).sort().forEach(f => {
  load(path.join(root, 'cases', f)).forEach(c => {
    Object.entries(c.art || {}).forEach(([key, a]) => {
      if (!a || typeof a !== 'object' || !a.prompt) return;
      const prompt = [a.prompt, c.artStyle, 'No readable text, no letters, no logos, no watermarks.'].filter(Boolean).join('\n\n');
      jobs.push({ dir: c.id, key, prompt, size: sizeOf(a.ratio), ref: a.ref });
    });
  });
});
let todo = jobs.filter(j => (!ONLY.length || ONLY.some(o => o === j.dir || o === `${j.dir}/${j.key}`)) && (FORCE || !exists(j.dir, j.key)));
// 참고 이미지(ref)가 필요한 그림은 뒤로
todo.sort((a, b) => (a.ref ? 1 : 0) - (b.ref ? 1 : 0));
if (LIMIT) todo = todo.slice(0, LIMIT);

const price = PRICE[MODEL] && PRICE[MODEL][QUALITY];
const cost = price ? todo.reduce((n, j) => n + (j.size === '1024x1024' ? price[0] : price[1]), 0) : null;
console.log(`전체 프롬프트 ${jobs.length}장 · 이번에 그릴 것 ${todo.length}장 · 모델 ${MODEL} · 품질 ${QUALITY}`);
console.log(cost != null ? `예상 비용 약 $${cost.toFixed(2)}` : '예상 비용: 이 모델/품질의 가격은 OpenAI 가격표에서 확인');
if (DRY) { todo.forEach(j => console.log(`  ${j.dir}/${j.key}  ${j.size}${j.ref ? `  (참고: ${j.ref})` : ''}`)); process.exit(0); }
if (!todo.length) { console.log('그릴 것이 없다. (이미 있는 그림은 --force 로 다시 그린다)'); process.exit(0); }
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('OPENAI_API_KEY 환경 변수가 없다. 파일 맨 위 주석을 볼 것.'); process.exit(1); }

// ── API
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function call(j) {
  const fmt = j.transparent ? 'png' : 'webp';
  const common = { model: MODEL, prompt: j.prompt, size: j.size, quality: QUALITY, output_format: fmt, n: 1 };
  if (fmt === 'webp') common.output_compression = COMP;
  if (j.transparent) common.background = 'transparent';
  if (MODERATION !== 'auto') common.moderation = MODERATION;
  let res;
  const refFile = j.ref && ['.webp', '.png', '.jpg', '.jpeg'].map(e => path.join(root, 'img', j.dir, j.ref + e)).find(p => fs.existsSync(p));
  if (refFile) {
    const fd = new FormData();
    Object.entries(common).forEach(([k, v]) => { if (k !== 'moderation') fd.append(k, String(v)); });
    const type = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }[path.extname(refFile)];
    fd.append('image', new Blob([fs.readFileSync(refFile)], { type }), path.basename(refFile));
    res = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${KEY}` }, body: fd });
  } else {
    res = await fetch('https://api.openai.com/v1/images/generations', { method: 'POST', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify(common) });
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error((body.error && body.error.message) || `HTTP ${res.status}`); e.status = res.status; throw e; }
  const b64 = body.data && body.data[0] && body.data[0].b64_json;
  if (!b64) throw new Error('응답에 이미지가 없다');
  const dir = path.join(root, 'img', j.dir);
  fs.mkdirSync(dir, { recursive: true });
  ['.webp', '.png', '.jpg', '.jpeg'].forEach(e => { const p = path.join(dir, j.key + e); if (fs.existsSync(p)) fs.unlinkSync(p); });
  const out = path.join(dir, `${j.key}.${fmt}`);
  fs.writeFileSync(out, Buffer.from(b64, 'base64'));
  return out;
}
async function run(j) {
  for (let t = 1; ; t++) {
    try { return await call(j); } catch (e) {
      const retry = (e.status === 429 || e.status >= 500 || !e.status) && t < 4;
      if (!retry) throw e;
      await sleep(4000 * t);
    }
  }
}

(async () => {
  const fails = [];
  let done = 0, i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const j = todo[i++];
      try { const out = await run(j); done++; console.log(`✓ ${done}/${todo.length}  ${path.relative(root, out)}`); }
      catch (e) { fails.push([j, e.message]); console.log(`✗ ${j.dir}/${j.key} — ${e.message}`); }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONC, todo.length) }, worker));
  execFileSync(process.execPath, [path.join(__dirname, 'manifest.js')], { stdio: 'inherit' });
  console.log(`\n완료 ${done}장 · 실패 ${fails.length}장`);
  if (fails.length) {
    console.log('실패한 그림 (정책 거절이면 프롬프트를 조금 순하게 고쳐 GPT 앱에서 따로 만들 것):');
    fails.forEach(([j, m]) => console.log(`  ${j.dir}/${j.key}: ${m}`));
    process.exitCode = 1;
  }
})();
