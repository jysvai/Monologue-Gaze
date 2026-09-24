/* 실시간 수사(live) — 수사 시계 · 영장·공문 신청(request) · 팀 단톡방(feed) · '@분' 조건 · 기한과 늦은 결말 · 보고서 서식(form) 을 한 번씩 써 본 최소 예시.
 * 게임에는 실리지 않는다. 검사: node tools/validate.js docs/examples/live-example.js */
MG.registerCase({
  id: 'c98', no: 98, region: 'domestic', stars: 4, frame: 'laptop',
  title: '시험 현행 사건', year: '2024', place: '시험동', motif: '실시간 수사 시험', length: '5분',
  live: { start: [2024, 3, 8, 22, 40], deadline: { at: 2880, label: '체포 후 48시간', who: '팀장', miss: '48시간이 지났다. 일단 풀어 준다.' } },
  mood: { light: 'fluoro', amb: ['hum'], line: '금요일 밤 열 시 사십 분. 당직실 전화가 울린다.' },
  brief: { title: '112 신고 접수', lines: [['신고', '편의점 앞 [[흰 승합차]]에서 다툼'], ['현장', '[[시험동 편의점]]']] },
  start: ['k_van', 'k_store'],
  sources: [
    { id: 'files', type: 'list', name: '수사 기록', skin: 'report', empty: '아직 없다.' },
    { id: 'talk', type: 'people', name: '탐문' },
    { id: 'room', type: 'feed', name: '팀 단톡방', title: '강력2팀 (4)', kicker: '메신저', skin: 'chat', items: [
      { id: 'm1', at: 0, who: '팀장', msg: '현장 CCTV부터 확보해. 편의점 점주 [[박 점주]] 연락처 올린다.', keys: ['k_owner'] },
      { id: 'm2', at: 30, who: '막내', msg: '점주 가게 도착했습니다. 영상 받으려면 [[영상 제공 요청서]] 필요하답니다.', keys: ['k_form'] },
      { id: 'm3', need: ['#rq_cctv'], who: '막내', msg: '영상 속 번호판 찍어 올립니다.', doc: 'd_plate', att: '사진 1장' },
      { id: 'm4', need: ['!f_plate', '@240'], who: '팀장', msg: '차주 조회해 봐. 새벽이라 회신은 느릴 거다.', f: 'f_late_hint' },
    ] },
    { id: 'rq', type: 'request', name: '영장·공문', empty: '아직 신청할 근거가 없다.', items: [
      { id: 'rq_cctv', kind: '협조 공문', title: '편의점 CCTV 영상 제공 요청', to: '시험동 편의점 점주', target: '3월 8일 22:00~23:00 외부 카메라',
        what: '다툼 장면 확인', eta: 45, need: ['k_form'], doc: 'd_cctv', keys: ['k_plate_word'], feed: { who: '막내', msg: '점주가 영상 넘겨줬습니다.' } },
      { id: 'rq_car', kind: '통신·차량 조회', title: '차량 소유자 조회 요청', to: '관할 차량등록사업소', target: '[[흰 승합차]]',
        what: '소유자 인적사항', eta: 180, need: ['k_plate_word'], why: ['f_plate'], deny: '번호판이 확인된 근거가 없다.', doc: 'd_owner' },
    ] },
  ],
  keywords: {
    k_van: { label: '흰 승합차', type: 'thing' }, k_store: { label: '시험동 편의점', type: 'place' }, k_owner: { label: '박 점주', type: 'person' },
    k_form: { label: '영상 제공 요청서', type: 'word' }, k_plate_word: { label: '번호판', type: 'thing' }, k_x: { label: '차주 정씨', type: 'person' },
  },
  docs: {
    d_brief: { src: 'files', title: '112 신고 사건 처리표', meta: '22:31 접수', body: [{ p: '편의점 앞에서 두 남자가 다툼. 한 명이 [[흰 승합차]]를 타고 떠남.', f: 'f_call' }] },
    d_cctv: { src: 'rq', title: 'CCTV 영상 캡처 (22:36)', meta: '편의점 외부 카메라', skin: 'photo', body: ['승합차 뒷모습. [[번호판]] 일부가 보인다.'] },
    d_plate: { src: 'room', title: '번호판 확대 사진', skin: 'photo', body: [{ p: '번호판 끝 네 자리 4827.', f: 'f_plate' }] },
    d_owner: { src: 'rq', title: '차량 소유자 회신', skin: 'report', body: [{ p: '소유자 [[차주 정씨]], 시험동 거주.', f: 'f_owner' }] },
    d_late: { src: 'files', title: '새벽 탐문 메모', need: ['@600'], body: [{ p: '정씨는 그날 밤 편의점 앞에 있었다고 인정했다.', f: 'f_admit' }] },
  },
  people: {
    p_owner: { src: 'talk', name: '박 점주', role: '편의점 점주', key: 'k_owner', color: '#557', initial: '박', intro: ['영상은 서류 있어야 드려요.'],
      ask: { k_van: ['그 차 자주 와요.'] }, idle: ['모르겠는데요.'] },
  },
  art: { cover: { use: '폴더 표지', ratio: '4:3', svg: '<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="150" fill="#223"/><rect x="60" y="70" width="80" height="40" fill="#ddd"/></svg>' } },
  solution: {
    culprit: 'k_x',
    form: { title: '사건 송치 의견서', culprit: '피의자', short: '피의자', submit: '의견서 올리기', open: '의견서 쓰기', lead: '피의자를 특정하고, 항목마다 근거 메모를 붙인다.', judging: '의견서를 올렸다. 팀장이 읽는다…' },
    claims: [{ id: 'c1', q: '그 차가 현장에 있었다', accept: ['f_plate'] }, { id: 'c2', q: '그 차의 주인', accept: ['f_owner'] }, { id: 'c3', q: '본인의 말', accept: ['f_admit', 'f_call'] }],
    stamp: '2024.03.09 · 강력2팀',
    epilogue: ['기한 안에 송치했다.'],
    late: ['기한을 넘겨 한 번 풀어 준 뒤에야 송치했다.'],
  },
});
