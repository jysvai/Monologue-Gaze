/* 새 조사 방식(timeline · compare · query · photo)과 stars · graphic 을 한 번씩 써 본 최소 예시.
 * 게임에는 실리지 않는다. 검사: node tools/validate.js docs/examples/methods-example.js */
MG.registerCase({
  id: 'c99', no: 99, region: 'domestic', stars: 5, graphic: true, warn: '시험용 경고 문구.',
  title: '시험 사건', year: '1999', place: '시험동', motif: '새 조사 방식 시험', length: '5분',
  brief: { title: '시험', lines: [['시작', '[[재구성]] · [[감정]] · [[조회]] · [[관찰]]']] },
  start: ['k_a'],
  sources: [
    { id: 'tl', type: 'timeline', name: '사건 재구성', title: '그날 밤', slots: ['21:00', '22:00', '23:00', '24:00'],
      events: [{ id: 'e1', t: '첫째' }, { id: 'e2', t: '둘째' }, { id: 'e3', t: '셋째' }, { id: 'e4', t: '넷째 [[감정]]' }],
      intro: ['순서를 맞춰라.'], solved: [{ p: '맞췄다. [[조회]] 해 보자.', f: 'f_tl' }], reward: { keys: ['k_c'] }, solveNeed: ['k_a'] },
    { id: 'lab', type: 'compare', name: '감정 의뢰', sets: [
      { id: 'cm1', title: '족적 대조', meta: '감식과', q: '현장 족적과 일치하는 신발은?', evidence: { label: '현장 족적', t: '왼쪽 뒤꿈치가 닳았다.' },
        options: [{ id: 'a', label: '운동화 A', t: '고르게 닳음' }, { id: 'b', label: '구두 B', t: '왼쪽 뒤꿈치가 닳음' }, { id: 'c', label: '장화 C', t: '새것' }],
        answer: 'b', hint: '뒤꿈치를 보라.', solved: [{ p: '구두 B 와 일치. 주인은 [[관찰]] 사진 속 인물.', f: 'f_cmp' }], reward: { keys: ['k_d'] }, solveNeed: ['k_a'] }] },
    { id: 'reg', type: 'query', name: '차량 조회', fields: [{ id: 'plate', label: '차량 번호', placeholder: '예: 12가3456' }],
      records: [{ match: { plate: ['12가3456'] }, doc: 'd_car', need: ['k_c'] }] },
    { id: 'ph', type: 'photo', name: '현장 사진', scenes: [
      { id: 'sc1', title: '거실', meta: '감식 사진 1', art: 'room', intro: ['자세히 보면 무언가 있다.'],
        spots: [{ id: 'sp1', x: 20, y: 70, label: '재떨이', body: [{ p: '꽁초 두 개. 하나는 [[필터 없는 담배]].', f: 'f_ash' }] }, { id: 'sp2', x: 80, y: 30, r: 9, label: '창틀', body: ['창틀에 흙.'] }] }] },
  ],
  keywords: {
    k_a: { label: '재구성', type: 'word' }, k_b: { label: '감정', type: 'word' }, k_c: { label: '조회', type: 'word' },
    k_d: { label: '관찰', type: 'word' }, k_e: { label: '필터 없는 담배', type: 'thing' }, k_x: { label: '용의자', type: 'person' },
  },
  docs: { d_car: { src: 'reg', title: '차량 12가3456', body: [{ p: '소유자 [[용의자]].', f: 'f_car' }, { m: '시험 메모.' }] } },
  art: { room: '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="250" fill="#e8e0c8"/><rect x="290" y="30" width="80" height="60" fill="none" stroke="#333"/><circle cx="80" cy="175" r="14" fill="#999"/></svg>' },
  solution: { culprit: 'k_x', claims: [{ id: 'c1', q: '순서', accept: ['f_tl', 'f_cmp'] }, { id: 'c2', q: '차', accept: ['f_car'] }, { id: 'c3', q: '재떨이', accept: ['f_ash'] }], epilogue: ['끝.'] },
});
