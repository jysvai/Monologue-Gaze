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

// CASE 00~02 를 실제로 뽑아 보고 정한 보강 규칙. CASE 03 부터 적용한다.
const V2_FROM = 3;
const V2_RULES = [
  '제목 줄의 설명과 **꼭 보여야 할 것** 이 그 그림의 단서다. 프롬프트의 다른 부분보다 우선한다. 개수(벽돌 네 장, 촛불 세 개)·색·위치를 정확히 지킨다.',
  '흑백 스타일 사건이라도, 프롬프트가 색을 말하는 증거물(붉은 실, 파란 가방 같은)은 그 색이 보여야 한다. 그 물건만 손으로 색칠한 듯 부분 채색하거나 바랜 컬러 사진으로 만든다. (01 의 붉은 무명실이 회색으로 나와 단서가 사라졌다.)',
  '정물·증거물 사진에는 창밖 거리, 걸어가는 사람 실루엣, 먼 도시 스카이라인을 넣지 않는다. 배경은 책상·증거물 판·벽처럼 단순하게. (01 에서 거의 모든 정물 뒤에 같은 창밖 풍경이 반복됐다.)',
  '숫자·날짜가 보이는 그림(달력, 시계, 번호판)은 프롬프트가 준 숫자만 쓴다. 프롬프트가 숫자를 말하지 않으면 숫자를 넣지 않는다. (02 의 달력이 본문의 26일 대신 7로 나왔다.)',
  '한 장에 장면 하나. 작은 삽입 칸, 여러 칸 조합, 카탈로그식 칸 나누기는 프롬프트가 요구할 때만. (02 의 광고 삽화가 판화 + 사진 두 칸으로 나왔다.)',
  '모두 가상 지명이다. 실존 랜드마크(유명 성당 돔, 타워, 다리)는 프롬프트가 이름을 댈 때만 넣는다.',
  '한 사건 안에서 같은 장소·물건·인물이 여러 장에 나오면 같은 모습으로 맞춘다 (같은 방, 같은 가방 색, 같은 옷 실루엣).',
  '한 장 만들 때마다 위 규칙을 스스로 확인하고, 단서가 빠졌으면 한 번 다시 만든다.',
];
const V2_TAIL = 'Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.';

function block(lines) { return '```\n' + lines + '\n```'; }

function main() {
  const files = fs.readdirSync(path.join(root, 'cases')).filter(f => f.endsWith('.js')).sort();
  const cases = [];
  files.forEach(f => { try { cases.push(...load(path.join(root, 'cases', f))); } catch (e) { console.error(`${f}: ${e.message}`); } });
  cases.sort((a, b) => a.no - b.no);

  let total = GLOBAL.length;
  const out = [];
  const redo = [];
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
  out.push(`## 생성 규칙 v2 — CASE ${String(V2_FROM).padStart(2, '0')} 부터 적용`);
  out.push('');
  out.push('CASE 00~02 를 실제로 뽑아 보고 보강한 규칙이다. 00~02 는 나중에 필요한 것만 다시 뽑는다.');
  out.push('');
  V2_RULES.forEach((r, i) => out.push(`${i + 1}. ${r}`));
  out.push('');
  out.push(`- **추가 스타일** (CASE ${String(V2_FROM).padStart(2, '0')} 부터, 공통 스타일 뒤에 이어 붙이기):`);
  out.push(block(V2_TAIL));
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
    if (c.no >= V2_FROM && arts.length) out.push('- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.');
    out.push('');
    if (!arts.length) { out.push('_이미지 프롬프트 없음 (전부 SVG 로 그린 도면·지도)_'); out.push(''); }
    arts.forEach(([key, a]) => {
      total++;
      out.push(`### ${c.id}/${key} — ${a.use || ''}${a.sensitive ? ' 🔞 열람 주의' : ''}${a.redo ? ' 🔁 다시 뽑기' : ''}`);
      if (a.redo) redo.push({ c, key, a });
      out.push(`- 저장 경로: \`img/${c.id}/${key}.webp\` · 비율: ${a.ratio || '4:3'}${a.where ? ` · 쓰이는 곳: ${a.where}` : ''}`);
      out.push(block(a.prompt));
      if (a.must) out.push(`- **꼭 보여야 할 것**: ${a.must}`);
      if (a.avoid) out.push(`- 주의: ${a.avoid}`);
      out.push('');
    });
  });

  out.splice(3, 0, `총 **${total}장**.`, '');
  const dest = path.join(root, 'docs', 'IMAGE_PROMPTS.md');
  fs.writeFileSync(dest, out.join('\n'), 'utf8');
  console.log(`${path.relative(root, dest)} 작성 — 이미지 ${total}장`);
  writeRedo(redo);
}

// 검수에서 걸린 그림(art 의 redo 표시)만 모은 목록. 프롬프트는 [그림 + 사건 공통 스타일 + v2 추가 스타일] 을 합쳐 두어 그대로 붙여 넣으면 된다.
function writeRedo(list) {
  const need = list.filter(r => r.a.redo.level === '필수').length;
  const o = ['# 다시 뽑을 이미지', ''];
  o.push('> `node tools/prompts.js` 가 자동으로 만든다. 사건 파일 `art` 항목의 `redo` 표시를 모은 것이다.');
  o.push('');
  o.push(`총 **${list.length}장** (필수 ${need} · 선택 ${list.length - need}). 같은 경로·같은 이름으로 넣으면 게임 그림이 자동으로 바뀐다. 바꾼 뒤에는 그 항목의 \`redo\` 표시를 지운다.`);
  o.push('');
  o.push('| 그림 | 급함 | 이유 |', '|---|---|---|');
  list.forEach(({ c, key, a }) => o.push(`| \`${c.id}/${key}\` | ${a.redo.level} | ${a.redo.why} |`));
  o.push('');
  list.forEach(({ c, key, a }) => {
    o.push(`## ${c.id}/${key} — ${a.use || ''} (${a.redo.level})`);
    o.push(`- 저장 경로: \`img/${c.id}/${key}.png\` · 비율: ${a.ratio || '4:3'}`);
    o.push(`- 이유: ${a.redo.why}`);
    if (a.must) o.push(`- **꼭 보여야 할 것**: ${a.must}`);
    if (a.avoid) o.push(`- 주의: ${a.avoid}`);
    o.push(block([a.prompt, c.artStyle, V2_TAIL].filter(Boolean).join(' ')));
    o.push('');
  });
  const dest = path.join(root, 'docs', 'IMAGE_REDO.md');
  fs.writeFileSync(dest, o.join('\n'), 'utf8');
  console.log(`${path.relative(root, dest)} 작성 — 다시 뽑을 이미지 ${list.length}장`);
}

if (require.main === module) main();
module.exports = { GLOBAL };
