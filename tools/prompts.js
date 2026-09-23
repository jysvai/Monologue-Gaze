#!/usr/bin/env node
/* 사건 파일의 art[*].prompt 를 모아 docs/IMAGE_PROMPTS.md 를 만든다.
 * 사용: node tools/prompts.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { load } = require('./validate');

const root = path.join(__dirname, '..');

const GLOBAL = [
  {
    key: 'hero', use: '기록실(첫 화면) 맨 위에 까는 대표 이미지', ratio: '16:9 (1920×1080)',
    prompt: 'Overhead photograph of a cluttered detective\'s desk at night in a Korean police station, lit by a single warm desk lamp. An open wooden drawer full of old manila case folders tied with string, a yellowed ruled notebook with a fountain pen, scattered black-and-white photographs face down, a cold cup of instant coffee leaving a ring stain, a brass drawer key on a paper tag. Deep shadows at the edges, warm tungsten light in the center, film grain, muted brown and ochre palette, shot on 35mm film, shallow depth of field. No readable text, no people, no faces.',
  },
  {
    key: 'desk', use: '사건 화면 뒤에 까는 책상 질감 (반복 타일로 써도 됨)', ratio: '1:1 (2048×2048), 이음매 없는 타일',
    prompt: 'Seamless tileable texture of a dark walnut wooden desk surface, worn varnish, faint scratches and coffee ring stains, seen from directly above, soft even lighting, very subtle, low contrast, dark brown. No objects, no text.',
  },
  {
    key: 'paper', use: '형사 수첩 종이 질감 (반복 타일)', ratio: '1:1 (1024×1024), 이음매 없는 타일',
    prompt: 'Seamless tileable texture of aged yellowed notebook paper, subtle fibers, faint foxing spots, very light and even, warm cream-ochre tone, scanned flat. No lines, no text, no shadows.',
  },
  {
    key: 'warn', use: '잔혹한 사건 폴더 표지에 붙는 「혐오감 주의」 스티커의 바탕 (글자는 게임이 위에 올린다)', ratio: '3:1 (600×200), 배경 투명 PNG 권장',
    prompt: 'A single blank rectangular warning sticker label, flat top-down scan, deep brick-red vinyl with a thin white inner border, slightly worn corners, a few fine scratches and a faint crease, subtle paper-tape residue at one edge, even lighting, isolated on a transparent background. Completely blank: no text, no letters, no symbols, no icons.',
  },
];

function block(lines) { return '```\n' + lines + '\n```'; }

function main() {
  const files = fs.readdirSync(path.join(root, 'cases')).filter(f => f.endsWith('.js')).sort();
  const cases = [];
  files.forEach(f => { try { cases.push(...load(path.join(root, 'cases', f))); } catch (e) { console.error(`${f}: ${e.message}`); } });
  cases.sort((a, b) => a.no - b.no);

  let total = GLOBAL.length;
  const out = [];
  out.push('# Monologue Gaze — 이미지 프롬프트 모음');
  out.push('');
  out.push('> 이 파일은 `node tools/prompts.js` 로 자동 생성됩니다. 프롬프트를 고치려면 각 사건 파일(`cases/*.js`)의 `art` 항목을 고친 뒤 다시 생성하세요.');
  out.push('');
  out.push('## 쓰는 법');
  out.push('');
  out.push('1. 아래 프롬프트를 이미지 생성 AI(GPT 등)에 그대로 붙여 넣는다. 각 사건의 **공통 스타일** 문단을 프롬프트 뒤에 이어 붙이면 사건 안에서 그림체가 통일된다.');
  out.push('2. 받은 이미지를 표에 적힌 경로(`img/<사건>/<키>.webp`)로 저장한다. `.png`, `.jpg` 도 된다. 가능하면 webp 로 바꿔 한 장에 300KB 이하로 줄이면 GitHub 에 올리기 좋다.');
  out.push('3. `node tools/manifest.js` 를 실행하면 게임이 SVG 임시 그림 대신 그 이미지를 쓴다.');
  out.push('');
  out.push('**모든 이미지 공통 원칙**: 실제 인물·실제 피해자의 얼굴을 닮게 만들지 않는다 / 보통 사건의 시신은 가리거나 암시만 / 혐오감 주의 사건은 마른 핏자국과 가려진 시신의 일부까지 (절단면·장기·훼손 부위 클로즈업은 없음) / 실제 상표·로고 없음 / 글자는 넣지 않는다 (신문 제목, 간판 글씨 등은 게임이 HTML 로 따로 쓴다). 글자가 꼭 필요해 보이는 자리는 "no readable text" 를 유지하고 흐릿한 형태만 둔다.');
  out.push('');
  out.push('## 공통 이미지');
  out.push('');
  GLOBAL.forEach(g => {
    out.push(`### _global/${g.key} — ${g.use}`);
    out.push(`- 저장 경로: \`img/_global/${g.key}.webp\` · 비율: ${g.ratio}`);
    out.push(block(g.prompt));
    out.push('');
  });

  cases.forEach(c => {
    const arts = Object.entries(c.art || {}).filter(([, a]) => a && typeof a === 'object' && a.prompt);
    out.push(`## CASE ${String(c.no).padStart(2, '0')} · ${c.title} (${c.year}, ${c.place})`);
    out.push('');
    out.push(`- 사건 파일: \`cases/${files.find(f => f.startsWith(c.id)) || c.id}\` · 이미지 ${arts.length}장${c.stars ? ` · 난이도 ${'★'.repeat(c.stars)}` : ''}`);
    if (c.graphic) out.push('- **혐오감 주의 사건**: 폴더 표지(cover) 위에는 게임이 「혐오감 주의」 스티커(`_global/warn`)를 겹쳐 붙이고 흐리게 처리한다. 마른 핏자국, 가려진 시신의 일부(방수포 밖의 손, 자루 속 형체)까지는 괜찮다. 절단면·장기·훼손 부위 클로즈업은 넣지 않는다. 🔞 표시가 붙은 그림은 게임에서 흐리게 가려진 채 나오고 눌러야 보인다.');
    if (c.artStyle) {
      out.push('- **공통 스타일** (각 프롬프트 뒤에 붙이기):');
      out.push(block(c.artStyle));
    }
    out.push('');
    if (!arts.length) { out.push('_이미지 프롬프트 없음 (전부 SVG 로 그린 도면·지도)_'); out.push(''); }
    arts.forEach(([key, a]) => {
      total++;
      out.push(`### ${c.id}/${key} — ${a.use || ''}${a.sensitive ? ' 🔞 열람 주의' : ''}`);
      out.push(`- 저장 경로: \`img/${c.id}/${key}.webp\` · 비율: ${a.ratio || '4:3'}${a.where ? ` · 쓰이는 곳: ${a.where}` : ''}`);
      out.push(block(a.prompt));
      if (a.avoid) out.push(`- 주의: ${a.avoid}`);
      out.push('');
    });
  });

  out.splice(3, 0, `총 **${total}장**.`, '');
  const dest = path.join(root, 'docs', 'IMAGE_PROMPTS.md');
  fs.writeFileSync(dest, out.join('\n'), 'utf8');
  console.log(`${path.relative(root, dest)} 작성 — 이미지 ${total}장`);
}

main();
