/* 목소리로 읽힐 글의 숫자 · 로마자를 한글 읽기로 (조연 목소리 tools/voices-vox.js).
 * VoxCPM2 의 글 다듬기는 중국어 · 영어만 알아서, 「14일」「1시 20분」을 그대로 주면 엉뚱하게 읽는다.
 *   시(1~12) · 시간 · 명 · 개 · 살 · 바퀴 … 는 우리말 수 (한 시, 네 시대, 세 명), 나머지는 한자어 수 (십사 일, 오백삼 호, 이십일 시)
 */
'use strict';
const D = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const U = ['천', '백', '십', ''];
function sino(n) {
  if (n === 0) return '영';
  const four = x => String(x).padStart(4, '0').split('').map(Number).map((d, i) => (d ? (d === 1 && U[i] ? '' : D[d]) + U[i] : '')).join('');
  const man = Math.floor(n / 10000), rest = n % 10000;
  return (man ? (man === 1 ? '' : four(man)) + '만' : '') + (rest ? four(rest) : '');
}
const N1 = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
const N10 = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];
const native = n => (n < 1 || n > 99 ? sino(n) : n === 20 ? '스무' : N10[Math.floor(n / 10)] + N1[n % 10]);
const NATIVE = '시간|시|명|개|살|바퀴|마리|잔|통|장|달|군데|가지|사람|벌|채|켤레|번째';
const LETTER = { A: '에이', B: '비', C: '씨', D: '디', E: '이', F: '에프', G: '지', H: '에이치', I: '아이', J: '제이', K: '케이', L: '엘', M: '엠', N: '엔', O: '오', P: '피', Q: '큐', R: '알', S: '에스', T: '티', U: '유', V: '브이', W: '더블유', X: '엑스', Y: '와이', Z: '지' };

function koNum(t) {
  return String(t)
    .replace(/(\d+)\s*cc\b/gi, (m, n) => `${sino(+n)} 씨씨`)
    .replace(/([가-힣A-Za-z])-(\d)/g, '$1 $2') // 목-3 → 목 3
    .replace(new RegExp(`(\\d+)\\s*(${NATIVE})`, 'g'), (m, n, c) => {
      const v = +n;
      if (c === '시' && (v === 0 || v > 12)) return `${sino(v)} ${c}`; // 0시 · 21시 는 한자어
      return `${native(v)} ${c}`;
    })
    .replace(/(\d+)\s*월/g, (m, n) => ({ 6: '유', 10: '시' }[+n] || sino(+n)) + '월') // 유월 · 시월
    .replace(/(\d+)\s*(펜스|파운드|달러|크로네|엔|년)/g, (m, n, c) => `${sino(+n)} ${c}`) // 「이년」은 욕으로 들린다
    .replace(/\d+/g, n => sino(+n)) // 십사일 · 오백삼호 · 삼층 · 목 삼이
    .replace(/(^|[^A-Za-z])([A-Z])(?=[^A-Za-z]|$)/g, (m, a, l) => a + LETTER[l]) // B구역 → 비구역
    .replace(/ {2,}/g, ' ')
    .trim();
}

module.exports = { koNum, sino, native };
