/* CASE 06 — 크비트달의 여인 (모티프: 이스달 여인 사건 · 1970 노르웨이) */
(function () {
  const hills = '<path d="M0 70 L30 40 L55 58 L90 22 L125 52 L150 34 L200 66 V150 H0Z" fill="#5f6a5c"/><path d="M0 96 Q60 80 100 92 T200 88 V150 H0Z" fill="#7c7a5e"/>';
  /* 증거물 사진 (정밀 관찰) — 좌표가 맞아야 하므로 SVG 로만. 흑백 감식 사진처럼, 탁자 위에서 내려다본 구도 */
  const card = (x, y) => `<rect x="${x}" y="${y}" width="11" height="7" fill="#efece4" stroke="#8a8780" stroke-width=".6"/>`;
  const bagsTable = '<svg viewBox="0 0 400 300" role="img" aria-label="탁자 위에 펼쳐 놓은 가방 두 개의 내용물, 흑백 감식 사진">'
    + '<defs><radialGradient id="c06v" cx="50%" cy="52%" r="72%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".6"/></radialGradient></defs>'
    + '<rect width="400" height="300" fill="#7a7771"/><path d="M0 60H400M0 150H400M0 240H400" stroke="#6f6c66" stroke-width="1"/><path d="M0 104H400M0 196H400" stroke="#85827c" stroke-width=".8"/>'
    /* 열린 가방 두 개 (관계없음) */
    + '<rect x="10" y="6" width="140" height="80" rx="6" fill="#3c3834"/><rect x="18" y="14" width="124" height="64" rx="3" fill="#6b6761"/><path d="M18 46H142" stroke="#5a5650" stroke-dasharray="3 3"/><rect x="66" y="84" width="28" height="8" rx="3" fill="#2b2825"/>'
    + '<rect x="250" y="6" width="140" height="80" rx="6" fill="#4d4d4d"/><rect x="258" y="14" width="124" height="64" rx="3" fill="#7b7b79"/><path d="M258 30H382M258 62H382" stroke="#6a6a68"/><rect x="306" y="84" width="28" height="8" rx="3" fill="#333"/>'
    + '<path d="M168 20h56v44h-56z" fill="#d9d5cb"/><path d="M174 30h44M174 38h36M174 46h40M174 54h28" stroke="#9c988f" stroke-width="1.5"/>'
    /* 가발 셋 */
    + '<ellipse cx="28" cy="122" rx="17" ry="13" fill="#1c1c1c"/><path d="M14 118q14-8 28 0" stroke="#3a3a3a" stroke-width="2" fill="none"/>'
    + '<ellipse cx="60" cy="130" rx="13" ry="21" fill="#4d4944"/><path d="M52 116q8 16 2 32M60 112q6 18 0 38M68 118q-4 14 2 28" stroke="#393632" stroke-width="1.4" fill="none"/>'
    + '<circle cx="40" cy="152" r="11" fill="#a19d96"/><circle cx="40" cy="144" r="5" fill="#b3afa8"/><path d="M32 154q8 4 16 0" stroke="#86827b" fill="none"/>'
    /* 안경 둘 */
    + '<g fill="none" stroke="#1e1e1e" stroke-width="3"><circle cx="108" cy="116" r="8"/><circle cx="128" cy="116" r="8"/><path d="M116 116h4M100 114l-8-3M136 114l8-3"/></g>'
    + '<g fill="none" stroke="#3c3c3c" stroke-width="1.3"><circle cx="110" cy="134" r="7"/><circle cx="128" cy="134" r="7"/><path d="M117 134h4M103 133l-7-2M135 133l7-2"/></g>'
    /* 쌍안경 */
    + '<rect x="181" y="112" width="12" height="26" rx="4" fill="#232323"/><rect x="198" y="112" width="12" height="26" rx="4" fill="#232323"/><rect x="192" y="120" width="7" height="9" fill="#3a3a3a"/><circle cx="187" cy="140" r="5" fill="#4a4a4a"/><circle cx="204" cy="140" r="5" fill="#4a4a4a"/><path d="M181 116q-14 20 4 34M210 116q14 20-4 34" stroke="#55514b" stroke-width="1.5" fill="none"/>'
    /* 카메라 */
    + '<rect x="254" y="110" width="44" height="26" rx="3" fill="#262626"/><rect x="258" y="104" width="12" height="7" fill="#333"/><rect x="254" y="110" width="44" height="6" fill="#bdbab3"/><circle cx="274" cy="125" r="9" fill="#111" stroke="#8a8a8a" stroke-width="2"/><circle cx="274" cy="125" r="3" fill="#555"/>'
    /* 옷가지 */
    + '<rect x="330" y="112" width="52" height="14" fill="#c2beb6"/><rect x="332" y="126" width="50" height="14" fill="#8e8a84"/><rect x="334" y="140" width="48" height="14" fill="#d2cec6"/><path d="M352 112l4 4 4-4M354 126l4 4 4-4M356 140l4 4 4-4" stroke="#4a4744" fill="none"/>'
    /* 수첩 */
    + '<rect x="28" y="196" width="28" height="38" fill="#d6d2c7" stroke="#4d4a45"/><path d="M32 196v38" stroke="#4d4a45"/><path d="M28 222h28" stroke="#2a2a2a" stroke-width="2"/>'
    /* 관광 지도 */
    + '<rect x="92" y="190" width="54" height="42" fill="#e2ded3" stroke="#8a867e"/><path d="M110 190v42M128 190v42M92 211h54" stroke="#aaa69d"/><path d="M96 222q20-8 44-2" stroke="#8d9aa0" stroke-width="3" fill="none"/><circle cx="134" cy="199" r="5" fill="none" stroke="#333" stroke-width="1.3"/><circle cx="104" cy="222" r="4" fill="none" stroke="#333" stroke-width="1.3"/>'
    /* 열쇠고리 */
    + '<circle cx="182" cy="198" r="5" fill="none" stroke="#9c9383" stroke-width="2"/><rect x="186" y="198" width="20" height="13" rx="4" fill="#aca187"/><path d="M178 202l-8 14m0 0h5m-5-4h4" stroke="#6f685b" stroke-width="2" fill="none"/>'
    /* 비누 포장지 */
    + '<path d="M246 200l14-6 12 8-2 12-16 4-10-8z" fill="#e6e2d8"/><path d="M252 204l10 4 6-4M256 214l6-6" stroke="#b4b0a6" fill="none"/>'
    /* 신발 상자 */
    + '<rect x="310" y="190" width="62" height="44" fill="#9a948a"/><path d="M310 198h62" stroke="#6f6a62"/><path d="M356 190h16v14l-6-4-4 6-6-8z" fill="#5a5650"/>'
    /* 봉투 둘 · 기차표 */
    + '<rect x="40" y="258" width="40" height="26" fill="#d7d3c9" stroke="#8a867e"/><path d="M40 258l20 13 20-13" stroke="#8a867e" fill="none"/><rect x="66" y="262" width="40" height="26" fill="#cbc7bc" stroke="#8a867e" transform="rotate(8 86 275)"/><rect x="52" y="268" width="22" height="11" fill="#a9a59b"/>'
    + '<rect x="148" y="263" width="36" height="18" fill="#dcd8ce" stroke="#77736b"/><path d="M160 263v18" stroke="#77736b" stroke-dasharray="1.5 2"/><path d="M165 269h14M165 274h10" stroke="#9c988f"/>'
    /* 자, 연필, 번호 카드 (관계없음) */
    + '<rect x="236" y="276" width="120" height="9" fill="#e6e3dc"/><path d="M246 276v4M256 276v3M266 276v4M276 276v3M286 276v4M296 276v3M306 276v4M316 276v3M326 276v4M336 276v3M346 276v4" stroke="#333"/>'
    + '<path d="M368 250l24 30" stroke="#3c3c3c" stroke-width="4"/><path d="M390 277l4 6" stroke="#d6d2c7" stroke-width="4"/>'
    + card(58, 100) + card(138, 100) + card(214, 100) + card(300, 98) + card(360, 98) + card(60, 180) + card(150, 180) + card(214, 186) + card(282, 186) + card(88, 248) + card(190, 262)
    + '<rect width="400" height="300" fill="url(#c06v)"/></svg>';

  MG.registerCase({
    id: 'c06', no: 6, region: 'overseas',
    title: '크비트달의 여인', year: '1969', place: '노르웨이 서해안 헬레순 (가상 지명)',
    motif: '모티프: 이스달 여인 사건 (1970, 노르웨이)', length: '약 50분',
    stars: 5,
    frame: 'papers',

    mood: { light: 'sea', fx: 'mist', amb: ['harbor', 'wind', 'horn'], line: '1969년 10월, 노르웨이 서해안. 항구의 안개가 산자락 등산로까지 올라온다.' },
    tag: '**증거철 06** · Sak nr. 2213/69 · Hellesund Politikammer · Kriminalavdelingen',
    disclaimer: '1970년 노르웨이 미제 사건의 모티프만 빌린 창작입니다. 도시·계곡·인물·회사·기관은 모두 지어낸 것이며 실제 인물과 관계가 없습니다.',
    emptyRead: '헬레순 경찰서 강력반의 서류 상자다. 위쪽 탭에서 서류철을 고르고, 왼쪽 목록에서 한 장씩 꺼내 읽는다.',
    brief: {
      title: '변사사건 개요 — 신원 미상 여성', no: 'Sak nr. 2213/69',
      lines: [
        ['발견', '1969년 10월 19일(일) 14:20 · [[헬레순]] 시 동쪽 산자락 [[크비트달]] 등산로 아래 바위 비탈'],
        ['사망자', '[[크비트달의 여인]] — 신원 미상 · 30대 · 키 164cm · 검은 머리'],
        ['상태', '몸 앞쪽과 소지품 일부가 불에 탐 · 옷의 [[상표]]가 모두 떼어짐 · 신분증·손가방 없음'],
        ['사인', '부검 중 (헬레순 시립병원 병리과)'],
        ['관할', 'Hellesund Politikammer · 강력반'],
      ],
      scrawl: '이름 없는 사람은 없다. 이름이 여럿인 사람이 있을 뿐.',
    },
    start: ['k_hellesund', 'k_kvitdal', 'k_woman', 'k_labels'],
    sources: [
      { id: 'politi', type: 'list', name: '헬레순 경찰 수사철', skin: 'report', desc: 'Hellesund Politikammer · Kriminalavdelingen. 강력반이 묶은 보고서와 증거물 목록.', empty: '아직 철해진 서류가 없다.' },
      { id: 'arkiv', type: 'archive', name: '시내 장부 대조', skin: 'ledger', desc: '호텔 숙박부, 항만 기록, 차량 등록부, 주유소 장부, 신문 스크랩. 경찰이 시내 곳곳에서 빌려 온 장부들이다. 이름·장소·배 이름으로 찾는다.', placeholder: '이름, 호텔, 장소, 배 이름' },
      { id: 'telex', type: 'list', name: '텔렉스·전보철', skin: 'telegram', desc: '인터폴 오슬로 사무국을 거친 조회와 회신.', empty: '아직 보낸 조회가 없다.' },
      { id: 'bevis', type: 'photo', name: '증거물 사진', skin: 'photo', need: ['k_garderobe'], desc: '감식반이 찍은 증거물 사진. 눌러서 하나씩 살핀다.', empty: '아직 찍은 증거물 사진이 없다.',
        scenes: [
          { id: 'ph_bags', title: '증거물 11~12호 — 가방 두 개의 내용물', meta: '1969.10.23 · 감식반 · 탁자에 펼쳐 위에서 촬영', art: 'bags_table',
            intro: ['역 보관소에서 나온 가방 두 개를 열어 내용물을 탁자에 늘어놓고 찍은 사진이다. 내용물 목록 원본은 부검 서류와 함께 오슬로로 올라갔다. 여기 남은 것은 이 한 장.'],
            spots: [
              { id: 'sp_wigs', x: 20, y: 34, r: 13, label: '가발', keys: ['k_wigs'], body: ['[[가발]] 셋 — 검은 단발, 밤색 긴 머리, 회색이 섞인 틀어 올린 머리. 셋 다 안쪽에 머리핀이 꽂힌 채다.'] },
              { id: 'sp_glasses', x: 44, y: 36.5, r: 5, label: '안경', body: ['뿔테 하나, 금속테 하나. 알에 도수가 없다 — 그냥 유리.'] },
              { id: 'sp_binoc', x: 54, y: 33.5, r: 5, label: '쌍안경', keys: ['k_binoc'], body: ['8×30 [[쌍안경]]. 가죽끈이 닳았다. 초점이 먼 데에 맞춰진 채다.'] },
              { id: 'sp_camera', x: 64, y: 36, r: 4.5, label: '카메라', keys: ['k_film'], body: ['소형 35mm 카메라. 안에 끝까지 찍은 [[필름]] 한 통이 들어 있었다.'] },
              { id: 'sp_clothes', x: 83, y: 33, r: 11, label: '옷가지', body: ['블라우스, 치마, 스웨터. 목 뒤 상표 자리마다 가위로 오려 낸 자국.'] },
              { id: 'sp_notebook', x: 14, y: 56.5, r: 5, label: '작은 수첩', keys: ['k_notebook'], body: ['손바닥만 한 [[수첩]]. 앞쪽은 비었고, 맨 뒤 한 쪽에만 연필로 기호가 적혀 있다.'] },
              { id: 'sp_map', x: 31.5, y: 57, r: 8, label: '관광 지도', keys: ['k_map'], body: ['접힌 헬레순 [[관광 지도]] (1968년판). 펼친 면에 연필 자국.'] },
              { id: 'sp_key', x: 48.5, y: 58, r: 4, label: '열쇠고리', keys: ['k_bryggen'], body: ['놋쇠 열쇠고리. 새긴 글자: [[브뤼겐 호텔]] 407. 돌려주지 않았다.'] },
              { id: 'sp_soap', x: 62.5, y: 58, r: 5.5, label: '구겨진 종이', keys: ['k_fjordheim'], body: ['구겨진 호텔 비누 포장지. 인쇄된 이름: [[피오르헤임 호텔]].'] },
              { id: 'sp_box', x: 82, y: 60, r: 9, label: '빈 신발 상자', keys: ['k_randi'], body: ['빈 종이 상자. 가게 도장 찍힌 쪽은 찢겨 나갔지만, 안쪽에 붙은 가격표에 가게 이름이 남았다 — [[에이데 신발|k_randi]].'] },
              { id: 'sp_money', x: 37, y: 83, r: 16, label: '봉투 둘', body: [{ p: '돈을 지갑 없이 봉투 둘에 나눠 담았다. 노르웨이 크로네 1,340 · 서독 마르크 200 · 벨기에 프랑 500.', f: 'f_money' }] },
              { id: 'sp_ticket', x: 68, y: 83.7, r: 4, label: '기차표', body: [{ p: '10월 18일(토) 저녁 7시 40분 헬레순 → 오슬로 2등 기차표 한 장. 쓰지 않았다.', f: 'f_ticket' }] },
            ] },
        ] },
      { id: 'kode', type: 'cipher', name: '수첩의 기호', need: ['k_notebook'], skin: 'cipher', title: '가방 속 수첩 — 기호로 적은 쪽', meta: '증거물 11-6 · 연필', openLabel: '해독지 펼치기',
        intro: [
          '수첩 맨 뒤 한 쪽에만 기호가 적혀 있다. 숫자와 = ? 는 그대로 썼다. 기호 하나가 로마자 한 글자로 보인다.',
        ],
        cipher: '▲◆●■◎○□ 18\n◇○◆ 4 11 18 ★☆▽◎▲○●\n◆■ = ◇○◆ ?\n■□△ 24318',
        key: { '▲': 'K', '◆': 'V', '●': 'I', '■': 'T', '◎': 'D', '○': 'A', '□': 'L', '◇': 'H', '★': 'N', '☆': 'O', '▽': 'R', '△': 'F' },
        given: { '△': 'F' },
        keep: '0123456789=?',
        solved: [
          { note: '풀어 쓴 것 (그녀가 쓴 로마자 그대로)' },
          'KVITDAL 18',
          'HAV 4 · 11 · 18 NORDKAI',
          { p: 'VT = HAV ?', f: 'f_cipher_vt' },
          { p: 'TLF [[24318|k_tlf]]', f: 'f_cipher_tlf' },
        ],
        reward: { keys: ['k_tlf'] },
        solveNeed: ['k_map', 'k_havorn', 'k_nordkai'] },
      { id: 'nummer', type: 'query', name: '번호 조회', skin: 'ledger', button: '조회 전화',
        desc: '텔레베르케 번호부의 번호순 부록과 차량 검사소 등록 카드를 전화로 조회한다. 교환수는 번호를 정확히 불러야 찾아 준다.',
        fields: [{ id: 'no', label: '번호 (전화 · 차량)', placeholder: '예: 24 000 · HL-00000' }],
        records: [
          { match: { no: ['24318', '24 318'] }, doc: 'd_katalog', need: ['k_tlf'] },
          { match: { no: ['22140', '22 140'] }, doc: 'd_q_22140', need: ['k_sentralbord'] },
          { match: { no: ['31007', '31 007'] }, doc: 'd_q_31007', need: ['k_sentralbord'] },
          { match: { no: ['HL-24617', 'HL24617', 'HL 24617'] }, doc: 'd_q_hl24617', need: ['k_plate', 'k_rental'] },
          { match: { no: ['HL-24455', 'HL24455', 'HL 24455'] }, doc: 'd_q_hl24455', need: ['k_rental'] },
          { match: { no: ['HL-24133', 'HL24133', 'HL 24133'] }, doc: 'd_q_hl24133', need: ['k_plate', 'k_rental'] },
          { match: { no: ['HL-24902', 'HL24902', 'HL 24902'] }, doc: 'd_q_hl24902', need: ['k_plate', 'k_rental'] },
        ],
        none: '그런 번호는 없다고 한다. 한 자리만 틀려도 교환수는 찾아 주지 않는다.', foundLabel: '조회해 둔 번호' },
      { id: 'skrift', type: 'compare', name: '필적 감정', skin: 'lab', need: ['k_schlosser'], desc: 'Kripos (국가범죄수사국) 필적 감정실에 사본을 보내 대조를 맡긴다.', empty: '아직 맡길 필적이 없다.',
        sets: [
          { id: 'cmp_cards', title: '숙박 신고서 필적 대조', meta: '의뢰 1969.10.28 · Kripos 필적 감정실', need: ['k_schlosser'],
            intro: ['브뤼겐 호텔 407호 손님이 10월 14일에 손수 적은 외국인 숙박 신고서를 기준으로 삼아, 시내 다른 숙박 기록의 글씨와 맞대 본다.'],
            evidence: { label: '기준 — 브뤼겐 호텔 신고서 · 베라 슐로서 (10.14)', t: '파란 볼펜. 숫자 1 에 긴 윗부리, 7 가운데 가로줄. 소문자 a 를 인쇄체로 쓴다. 글줄이 오른쪽 위로 들린다. 여권 번호 숫자 사이에 점을 가운데 높이로 찍는 버릇.' },
            q: '같은 손으로 쓴 것은?',
            options: [
              { id: 'lancier', label: '선원 호텔 장부 · 주느비에브 랑시에 (10.7)', t: '잉크 펜. 1 은 한 획, 7 에 가로줄 없음. 소문자 a 는 필기체. 글줄 수평. 여권 번호 67 AB 30121 — 띄어쓰기만 있고 점은 없다.' },
              { id: 'tielemans', label: '피오르헤임 신고서 · 클라우디아 틸레만스 (10.11)', t: '파란 볼펜. 1 에 긴 윗부리, 7 가로줄. 소문자 a 인쇄체. 글줄이 오른쪽 위로 들린다. 여권 번호 1·211·408 — 점이 가운데 높이.' },
              { id: 'alstrom', label: '피오르헤임 신고서 · 스벤 알스트룀 (10.12)', t: '만년필. 1 에 짧은 윗부리, 7 가로줄. 소문자 a 필기체. 글줄 수평. 필압이 세다.' },
              { id: 'remmert', label: '브뤼겐 신고서 · 클라우스 렘메르트 (10.14)', t: '만년필. 1 에 긴 윗부리, 7 가로줄. 소문자 a 는 필기체, 옛 독일 필기체 버릇이 남았다. 글줄이 오른쪽 아래로 처진다.' },
            ],
            answer: 'tielemans',
            solved: [{ p: '감정 회신 (1969.10.29) — 브뤼겐 407호 신고서와 피오르헤임 21호 신고서는 같은 사람의 글씨로 판단됨. 선원 호텔 장부는 관리인 한 사람의 글씨.', f: 'f_cards_same' }, '벨기에 여권 1.211.408 조회 텔렉스를 오늘 발송함.'],
            solveNeed: ['k_schlosser', 'k_tielemans', 'k_lancier'] },
          { id: 'cmp_fuel', title: '주유소 외상 장부 서명 대조', meta: '의뢰 1969.11.4 · Kripos 필적 감정실', need: ['k_lie', 'k_plate'],
            intro: ['크비트달 길 주유소 외상 장부에서 10월 18일 11시 40분 줄의 서명을 떼어 보냈다. 서명한 손을 찾는다.'],
            evidence: { label: '대조할 서명 — 외상 장부 10.18 11:40 · HL-24617', t: '"E.B." 두 글자. E 를 한 획에, 뒤집힌 3 처럼 쓴다. B 아래 고리가 닫히지 않고 열려 있다. 마침표 대신 짧은 사선. 글씨 전체가 왼쪽으로 기운다.' },
            q: '이 서명을 한 손은?',
            options: [
              { id: 'brate', label: '항만 입항 기록 10.4 · 10.11 — 대리점 서명', t: 'E 를 한 획에, 뒤집힌 3 꼴로. B 아래 고리가 열려 있다. 마침표 자리에 짧은 사선. 왼쪽으로 기운다.' },
              { id: 'lie', label: '항만 입항 기록 10.18 — 대리 서명 "p.p. E.B. / O.L."', t: 'O 를 크고 둥글게. E 는 가로획 셋을 따로 긋는다. B 고리는 닫혀 있다. 동그란 마침표. 오른쪽으로 기운다.' },
              { id: 'ulvset', label: '같은 장부 10.18 08:50 — "K.U."', t: '연필. 대문자를 인쇄체로 또박또박. 마침표 없음. 곧게 선다.' },
              { id: 'mo', label: '같은 장부 10.19 10:20 — "T.M."', t: '만년필. 가로획을 길게 뺀다. 동그란 마침표. 오른쪽으로 기운다.' },
            ],
            answer: 'brate',
            solved: [{ p: '감정 회신 (1969.11.7) — 외상 장부 10.18 11:40 의 "E.B." 는 항만 입항 기록 10.4 · 10.11 의 대리점 서명과 같은 손으로 판단됨. 10.18 대리 서명과는 다른 손.', f: 'f_sig' }],
            solveNeed: ['!f_fuel', 'k_lie'] },
        ] },
      { id: 'ask', type: 'people', name: '탐문', desc: '1969년 10월 말. 수첩에 이름이 적힌 사람만 찾아갈 수 있다.' },
    ],
    keywords: {
      k_hellesund: { label: '헬레순', type: 'place', alias: ['Hellesund', '헬레순 시'] },
      k_kvitdal: { label: '크비트달', type: 'place', alias: ['Kvitdal', '크비트달 계곡', '크비트달 등산로'] },
      k_station: { label: '기차역', type: 'place', alias: ['역 광장', 'NSB'] },
      k_garderobe: { label: '수하물 보관소', type: 'place', alias: ['보관소', '보관표', 'Garderobe'] },
      k_bryggen: { label: '브뤼겐 호텔', type: 'place', alias: ['브뤼겐', 'Hotel Bryggen'] },
      k_sjomann: { label: '선원 호텔', type: 'place', alias: ['Sjømannshjemmet', '선원 숙소'] },
      k_fjordheim: { label: '피오르헤임 호텔', type: 'place', alias: ['피오르헤임', 'Fjordheim'] },
      k_nordkai: { label: '노르카이', type: 'place', alias: ['Nordkai', '북부두'] },
      k_hytte: { label: '산장', type: 'place', alias: ['Kvitdalshytta', '산장 방명록'] },
      k_ulvsetra: { label: '울브세트라', type: 'place', alias: ['Ulvsetra'] },
      k_antwerpen: { label: '앤트워프', type: 'place', alias: ['Antwerpen', 'Anvers'] },
      k_nordvag: { label: '노르보그', type: 'place', alias: ['Nordvåg'] },
      k_rental: { label: '헬레순 자동차 임대', type: 'place', alias: ['Bilutleie', '렌터카', '자동차 임대'] },

      k_woman: { label: '크비트달의 여인', type: 'person', alias: ['신원 미상 여성', '그 여자'] },
      k_kari: { label: '카리 바트네', type: 'person', alias: ['카리', 'Kari Vatne'] },
      k_ingrid: { label: '잉리드 몰란', type: 'person', alias: ['잉리드'] },
      k_halvorsen: { label: '할보르센 경감', type: 'person', alias: ['할보르센'] },
      k_solveig: { label: '솔베이 하우그', type: 'person', alias: ['솔베이', '프런트 직원'] },
      k_taxi: { label: '오드 헬레', type: 'person', alias: ['헬레순 택시', '택시 기사', '7호차'] },
      k_randi: { label: '란디 에이데', type: 'person', alias: ['에이데 신발', '신발 가게'] },
      k_remmert: { label: '클라우스 렘메르트', type: 'person', alias: ['렘메르트', 'Remmert'] },
      k_per: { label: '페르 순데', type: 'person', alias: ['페르', '순데'] },
      k_brate: { label: '에이나르 브라테', type: 'person', alias: ['브라테', 'E. 브라테', '브라테 해운대리점', 'Brate'] },
      k_lie: { label: '올라 리', type: 'person', alias: ['O. 리', '사무원 리'] },
      k_schlosser: { label: '베라 슐로서', type: 'person', alias: ['슐로서', 'Vera Schlosser', '슐로서 부인'] },
      k_lancier: { label: '주느비에브 랑시에', type: 'person', alias: ['랑시에', 'Lancier'] },
      k_tielemans: { label: '클라우디아 틸레만스', type: 'person', alias: ['틸레만스', 'Tielemans'] },
      k_dasson: { label: '미레유 다송', type: 'person', alias: ['다송', 'Dasson'] },

      k_labels: { label: '상표', type: 'thing', alias: ['옷 상표', '라벨'] },
      k_dental: { label: '금니', type: 'thing', alias: ['치과 차트', '치아'] },
      k_pills: { label: '수면제', type: 'thing', alias: ['바르비투르산'] },
      k_thermos: { label: '보온병', type: 'thing', alias: ['보온병 컵', '보온병 뚜껑'] },
      k_wigs: { label: '가발', type: 'thing', alias: ['가발 셋'] },
      k_binoc: { label: '쌍안경', type: 'thing', alias: ['망원경'] },
      k_film: { label: '필름', type: 'thing', alias: ['카메라', '현상'] },
      k_notebook: { label: '수첩', type: 'thing', alias: ['기호 수첩'] },
      k_map: { label: '관광 지도', type: 'thing', alias: ['지도'] },
      k_sentralbord: { label: '교환 기록', type: 'thing', alias: ['전화 교환', '교환대'] },
      k_tlf: { label: '24318', type: 'thing', alias: ['24 318', '전화번호'] },
      k_plate: { label: 'HL-24', type: 'thing', alias: ['번호판', '회색 볼보', '볼보 아마존'] },
      k_havorn: { label: '하브외른', type: 'thing', alias: ['Havørn', '하브외른 호'] },
      k_vesleterne: { label: '베슬레 테르네', type: 'thing', alias: ['Vesle Terne', 'VT'] },
      k_havbris: { label: '하브브리스 해운', type: 'thing', alias: ['하브브리스', 'Havbris'] },
      k_mutuelle: { label: '앤트워프 해상공제', type: 'thing', alias: ['해상공제', 'Mutuelle'] },
      k_kystrute: { label: '연안선', type: 'thing', alias: ['노르비엔 호', '승선 명부'] },

      k_1018: { label: '10월 18일', type: 'time', alias: ['18일', '그 토요일'] },
    },
    docs: {
      /* ── 헬레순 경찰 수사철 ── */
      d_report: { src: 'politi', title: '변사체 발견 보고', kicker: 'HELLESUND POLITIKAMMER · RAPPORT', meta: '1969년 10월 19일(일) 밤 · 강력반 당직', body: [
        '10월 19일 일요일 오후 2시 20분, 대학생 [[카리 바트네]](22)와 [[잉리드 몰란]](22)이 [[크비트달 산장|k_hytte]]에서 내려오다 등산로에서 60미터쯤 떨어진 바위 비탈 아래에서 여성 한 명이 숨져 있는 것을 발견, 3시 5분 들머리 농가 전화로 신고함.',
        '여성은 30대로 보이며, 몸 앞쪽과 곁에 둔 소지품 일부가 불에 탄 상태였음. 둘레의 히스 덤불에 불이 옮은 자국이 있으나 크게 번지지는 않았음.',
        '옷가지의 [[상표]]가 모두 떼어져 있었음. 손가방·지갑·여권 없음. 손가락에 반지 자국은 있으나 반지는 없음.',
        '현장 유류품은 따로 목록을 만듦. 시신은 밤 9시 시립병원 병리과로 옮김.',
        '[[헬레순 역|k_station]]과 부두 둘레의 호텔·하숙에 인상착의를 돌리기로 함.',
        { stamp: 'Hellesund Politikammer' },
      ] },
      d_autopsy: { src: 'politi', title: '부검 소견 (요약)', kicker: 'HELLESUND SYKEHUS · PATOLOGISK AVDELING', meta: '1969년 10월 21일 · 병리과장 Dr. 라우릿센', body: [
        '사인: 수면제 중독이 가장 유력함. 불은 숨지기 직전이나 숨진 뒤에 붙은 것으로 보임.',
        { p: '혈액과 위 내용물에서 [[수면제]](바르비투르산계) 성분이 많이 나옴. 위에서 커피가 조금 나옴.', f: 'f_pills' },
        { p: '사망 추정: [[10월 18일]](토) 낮부터 저녁 사이.', f: 'f_tod' },
        '치아: [[금니]] 여섯 개와 뿌리 치료 자국. 노르웨이에서는 드문 대륙식 시술로 보임. 치과 차트를 만들어 둠.',
        '나이 30~40세. 키 164cm. 귀를 뚫은 자국 있음. 머리카락은 본디 밤색이며 짧게 자름.',
        { sign: 'Dr. H. Lauritsen' },
      ] },
      d_scene: { src: 'politi', skin: 'card', title: '현장 유류품 목록', kicker: 'ÅSTEDSFUNN', meta: '1969.10.19~20 · 증거물 1~6호', body: [
        { img: 'thermos', cap: '1호 — 히스 덤불 속에서 나온 보온병 뚜껑 컵' },
        { rows: [
          ['1', '[[보온병]] 뚜껑 컵 (몸통 없음)', '히스 덤불 속, 시신에서 4미터', '안쪽에 커피 자국'],
          ['2', '타다 남은 접는 우산', '곁', '상표 없음'],
          ['3', '여성용 손목시계', '왼 손목', '태엽이 풀려 멈춤'],
          ['4', '새 가죽 장화', '신고 있음', '밑창이 거의 닳지 않음'],
          ['5', '녹은 플라스틱 병 둘', '곁', '휘발유 냄새'],
          ['6', '타다 남은 성냥갑', '곁', '인쇄 글자 거의 탐'],
        ], head: ['번호', '물건', '자리', '비고'] },
        { note: '감식반: 둘레에서 담배꽁초나 다른 발자국은 가려내지 못함. 전날 밤 비.' },
      ] },
      d_luggage: { src: 'politi', need: ['k_garderobe'], skin: 'card', title: '역 보관소 가방 두 개 — 내용물', kicker: 'NSB HELLESUND · GARDEROBE', meta: '1969.10.23 개봉 · 증거물 11~12호', body: [
        { img: 'suitcases', cap: '헬레순 역 수하물 보관소에서 나온 가방 두 개' },
        { p: '맡긴 때: 10월 18일(토) 오전 11시 5분. 보관표 1147번. 맡긴 사람: 검은 머리 여자, 외국 말씨 (보관소 직원 기억).', f: 'f_deposit' },
        '가방 둘 다 잠겨 있지 않았음. 내용물은 감식반이 탁자에 펼쳐 놓고 위에서 사진으로 남김 (증거물 사진 11~12호).',
        '여권·신분증·편지·지갑은 없음. 옷가지의 [[상표]]는 모두 떼어져 있음.',
      ] },
      d_touristmap: { src: 'politi', need: ['k_map'], skin: 'card', title: '관광 지도의 연필 자국', kicker: 'BEVIS 11-7', meta: '헬레순 관광 지도 · 1968년판', body: [
        { img: 'touristmap', cap: '헬레순 관광 지도. 연필 동그라미 두 곳' },
        '연필 동그라미 두 곳: 항구 북쪽 부두 한 곳, 그리고 동쪽 산자락의 크비트달 등산로 들머리.',
        '크비트달 동그라미 옆에 다음 기호가 연필로 적혀 있음. 그 자리에 인쇄된 지명은 로마자로 KVITDAL.',
        { cipher: '▲◆●■◎○□' },
        { note: '감식반: 수첩의 기호와 같은 연필, 같은 손으로 보임.' },
      ] },
      d_photos: { src: 'politi', need: ['k_film'], skin: 'photo', title: '필름 현상 — 36장 중 11장', meta: '1969.10.24 · 헬레순 포토 현상소 · 경찰 의뢰', body: [
        { img: 'harbor', cap: '3번 — 항구 전경. [[노르카이]] 쪽 부두에 화물선 한 척. 이른 아침으로 보임' },
        { img: 'stern', cap: '7번 — 같은 배의 고물. 배 이름 "HAVØRN · PANAMA" ([[하브외른]]). 비스듬한 빛에 새 페인트 밑으로 다른 글자 자국이 도드라짐 — "VESLE TE…"', f: 'f_repaint' },
        '8~11번 — 같은 고물을 조금씩 다른 각도로. 나머지는 찍히지 않음.',
        { note: '현상소 주인: 부두 건너편 높은 창에서 망원 렌즈 없이 찍은 사진으로 보인다고 함.' },
      ] },

      /* ── 텔렉스·전보철 ── */
      d_tx_out: { src: 'telex', need: ['k_dental'], title: 'TELEX 발신 · HELLESUND → INTERPOL OSLO', meta: '1969.10.24 10:15 · 할보르센', body: [
        '신원 미상 여성 · 30대 · 키 164 · 10월 18일경 사망 · 헬레순 크비트달',
        '금니 여섯 · 대륙식 치과 시술로 보임 · 치과 차트 사본 항공우편 발송',
        '독일어 프랑스어 영어 쓴 것으로 보임 · 가발 씀 · 옷 상표 모두 뗌',
        '서독 오스트리아 프랑스 벨기에 스위스 경찰에 조회 바람 · 끝',
      ] },
      d_tx_wiesbaden: { src: 'telex', need: ['k_dental'], title: 'TELEX 수신 · WIESBADEN → HELLESUND', meta: '1969.10.27 14:02', body: [
        '귀 조회 건 · 인상착의 맞는 실종 신고 없음',
        '치과 차트 대조 · 불일치 · 끝',
      ] },
      d_tx_wien: { src: 'telex', need: ['k_schlosser'], title: 'TELEX 수신 · WIEN → HELLESUND', meta: '1969.10.29 09:48', body: [
        '귀 조회 오스트리아 여권 0418773 · 발급 기록 없음 · 위조 여권으로 판단',
        '베라 슐로서 명의 실종 신고 없음 · 빈 주소 확인 불가 · 끝',
      ] },
      d_tx_bruxelles: { src: 'telex', need: ['#cmp_cards'], title: 'TELEX 수신 · BRUXELLES → HELLESUND', meta: '1969.10.30 16:40', body: [
        '귀 조회 벨기에 여권 1.211.408 · 번호 체계는 진짜이나 기재 이름 틀림',
        { p: '같은 번호 여권은 1966년 앤트워프에서 [[미레유 다송]] 에게 발급 · 1933년생 · 틸레만스 는 다송 의 어머니 결혼 전 성', f: 'f_brussels' },
        '다송 · 10월 21일 고용주 [[앤트워프 해상공제]] 가 실종 신고',
        { p: '앤트워프 치과의사 보관 차트와 귀 차트 예비 대조 · 일치 · 정식 대조 서류 우송 · 끝', f: 'f_brussels' },
      ] },
      d_tx_anvers: { src: 'telex', need: ['k_mutuelle'], title: 'TELEGRAMME · MUTUELLE MARITIME D’ANVERS → HELLESUND POLITI', meta: '1969.10.31 09:05 · 프랑스어 원문 번역', body: [
        { p: '미레유 다송 은 본사 선박 사고 조사원 · 9월 30일부터 노르웨이 출장 · 일 때문에 여러 이름을 씀', f: 'f_anvers_id' },
        { p: '조사 건 · 1968년 2월 북해에서 침몰 신고된 화물선 [[베슬레 테르네]] 호 · 선주 헬레순 [[하브브리스 해운]] · 대표 [[E. 브라테|k_brate]] · 보험금 390만 크로네 지급 끝남', f: 'f_vt_claim' },
        { p: '마지막 연락 · 10월 16일 밤 10시 헬레순 에서 전화 · VT 봤음 · 토요일에 확인하겠음', f: 'f_vt_claim' },
        '본사 조사역 한 사람 11월 3일 헬레순 도착 예정 · 끝',
      ] },
      d_tx_kystrute: { src: 'telex', need: ['k_kystrute'], title: 'TELEGRAM · MS 노르비엔 사무장 → HELLESUND POLITI', meta: '1969.10.29 11:30 · 연안선 선상 무선', body: [
        { p: '승객 클라우스 렘메르트 · 10월 17일 22시 헬레순 승선 · 선실 214 · 20일 09시 [[노르보그]] 하선', f: 'f_remmert_alibi' },
        { p: '항해 중 내린 적 없음 · 18일 아침 점심 저녁 선상 식당 기록 있음 · 끝', f: 'f_remmert_alibi' },
      ] },

      /* ── 시내 장부 대조 : 신문 ── */
      d_avis_1020: { src: 'arkiv', find: ['k_kvitdal', 'k_woman'], skin: 'news', paper: 'Hellesunds Avis', title: '크비트달 등산로 아래서 신원 모를 여인 숨진 채 발견', kicker: '1969년 10월 20일 월요일 · 제243호', meta: '본지 사회부', body: [
        { img: 'valley', cap: '크비트달 등산로. 여인은 오른쪽 바위 비탈 아래에서 발견되었다.' },
        '19일 오후, 헬레순 시 동쪽 크비트달 등산로 아래 바위 비탈에서 30대로 보이는 여인이 숨진 채 발견되었다. 경찰에 따르면 여인의 몸과 소지품 일부가 불에 탔고, 신분을 알 만한 것은 하나도 나오지 않았다.',
        '[[할보르센 경감]]은 "옷에서 상표까지 떼어 낸 것이 이상하다"면서, 지난주 [[헬레순 역|k_station]]이나 부두 둘레에서 검은 머리에 외국 말씨를 쓰는 여인을 본 시민은 알려 달라고 당부했다.',
        '여인을 처음 본 이는 산장에서 내려오던 대학생 두 사람이다. 경찰은 부검 결과를 기다리고 있다.',
        '크비트달 등산로는 가을이면 시민들이 즐겨 찾는 길이나, 들머리에서 한 시간쯤 오르면 인가가 끊긴다.',
      ] },
      d_avis_1023: { src: 'arkiv', find: ['k_station', 'k_garderobe'], skin: 'news', paper: 'Hellesunds Avis', title: '역에 맡긴 가방 두 개 — "크비트달 여인의 것인 듯"', kicker: '1969년 10월 23일 목요일 · 제246호', meta: '본지 사회부', body: [
        { img: 'station', cap: '헬레순 역 수하물 보관소 창구' },
        '헬레순 역 [[수하물 보관소]] 직원이 신문을 보고, 18일 오전에 맡겨진 채 찾아가지 않은 가방 두 개를 경찰에 알렸다.',
        '경찰은 가방 안에서 가발과 옷가지 따위를 찾았다고만 밝히고 자세한 것은 말하지 않았다.',
        '역 앞 광장 매점 주인은 "토요일 오전 광장에 차가 여러 대 서 있었지만 눈여겨보지 않았다"고 했다.',
      ] },
      d_avis_1101: { src: 'arkiv', find: ['k_wigs', 'k_schlosser', 'k_lancier', 'k_tielemans'], need: ['#cmp_cards'], skin: 'news', paper: 'Hellesunds Avis', title: '"이름이 셋인 여인" — 경찰, 호텔 세 곳에서 발자취 찾아', kicker: '1969년 11월 1일 토요일 · 제253호', meta: '본지 사회부', body: [
        '경찰은 크비트달 여인이 이달 초부터 헬레순의 호텔 세 곳을 옮겨 다니며 적어도 세 개의 이름을 썼다고 밝혔다. 오스트리아, 프랑스, 벨기에 여권이 쓰였으나 경찰은 "어느 것도 제 이름은 아닌 듯하다"고 했다.',
        '한 호텔 직원은 "독일어, 프랑스어, 영어를 다 했고, 날마다 머리 모양이 달랐다. 늘 항구 쪽 방을 달라고 했다"고 말했다.',
        '시내에서는 "외국 스파이"라는 말까지 돌지만, 할보르센 경감은 "소문은 수사에 도움이 안 된다"고 잘라 말했다. 경찰은 벨기에 경찰과 연락을 주고받고 있다고만 밝혔다.',
      ] },
      d_avis_ship: { src: 'arkiv', find: ['k_vesleterne', 'k_havbris'], skin: 'news', paper: 'Hellesunds Avis', title: '북해 폭풍 속 "베슬레 테르네" 침몰 — 선원 아홉 명 모두 구조', kicker: '1968년 2월 14일 수요일 · 자료철', meta: '본지 해운 담당', body: [
        { img: 'ship', cap: '구조에 나선 트롤선에서 찍은 사진. 흐릿하다.' },
        { p: '헬레순 선적 화물선 베슬레 테르네 호(1958년 건조)가 12일 밤 북해에서 폭풍을 만나 가라앉았다. 선원 아홉 명은 가까이 있던 트롤선에 모두 구조되었다.', f: 'f_vt_sink' },
        '선주 [[하브브리스 해운]]의 [[에이나르 브라테]] 대표는 "배를 잃은 것은 슬프지만 사람이 다 살았으니 다행"이라고 말했다. 배와 짐은 앤트워프의 보험사에 들어 있었다.',
        '구조된 갑판원 한 사람은 "배가 가라앉는 걸 두 눈으로 보지는 못했다. 어두웠고, 불빛이 멀어졌을 뿐"이라고 말했다.',
      ] },

      /* ── 시내 장부 대조 : 장부 ── */
      d_reg_bryggen: { src: 'arkiv', find: ['k_bryggen', 'k_schlosser'], title: '브뤼겐 호텔 외국인 숙박 신고', kicker: 'HOTEL BRYGGEN · MELDESEDLER FOR UTLENDINGER', meta: '1969년 10월 3일 ~ 18일 · 외국인 손님만 옮겨 적음', body: [
        { img: 'regcard', cap: '외국인 숙박 신고서. 손님이 손수 적는다' },
        { rows: [
          ['10.3 (금) 21:40', '[[베라 슐로서]]', '오스트리아 · 빈 · 골동품상', '0418773', '214 → 412', '이튿날 아침 항구 쪽 방으로 바꿈'],
          ['10.3 (금) 22:10', '헨리 오크스', '영국 · 헐 · 선박 기관사', 'L 208114', '208', '10.5 떠남'],
          ['10.7 (화) 10:00', '슐로서 떠남', '—', '—', '412', '행선지를 물으니 "[[선원 호텔]]"이라 함'],
          ['10.14 (화) 16:20', '[[클라우스 렘메르트]]', '서독 · 함부르크 · 기계 부품 판매', 'C 552190', '305', '단골 · 10.17 떠남'],
          ['10.14 (화) 18:05', '베라 슐로서', '오스트리아 · 빈', '0418773', '407', '항구 쪽 방을 원함'],
          ['10.18 (토) 10:40', '슐로서 계산', '현금 (크로네)', '—', '407', '택시 불러 줌 — [[헬레순 택시]] 7호'],
        ], head: ['들어온 때', '이름', '국적 · 사는 곳', '여권', '방', '비고'], f: { 0: 'f_rooms', 4: 'f_rooms' } },
        { note: '프런트: [[솔베이 하우그]] · 여권 번호는 신고서에 적힌 대로' },
        { m: '이름은 바꿀 수 있어도, 창문이 향한 쪽은 바꾸지 못한다.' },
      ] },
      d_reg_sjomann: { src: 'arkiv', find: ['k_sjomann', 'k_lancier'], title: '선원 호텔 숙박 장부', kicker: 'SJØMANNSHJEMMET HELLESUND · GJESTEPROTOKOLL', meta: '부둣길 8 · 1969년 10월', body: [
        { rows: [
          ['10.6 (월) 19:00', '안데르스 뤼게', '노르웨이 · 갑판원', '—', '5', '배 기다림'],
          ['10.7 (화) 10:40', '[[주느비에브 랑시에]]', '프랑스 · 파리 · 통역사', '67 AB 30121', '3 → 9', '9호는 부두 쪽 창. 여자 손님은 드묾'],
          ['10.9 (목) 22:00', '트롤한 호 선원 둘', '노르웨이', '—', '6', '—'],
          ['10.11 (토) 07:30', '랑시에 떠남', '—', '—', '9', '택시로 [[피오르헤임 호텔]]에 간다 함'],
        ], head: ['들어온 때', '이름', '국적 · 직업', '여권', '방', '비고'], f: { 1: 'f_rooms' } },
        { note: '관리인 메모: 식당에 내려오지 않고 방에서 빵만 먹음. 창가에 의자를 붙여 놓고 지냄.' },
        { note: '장부는 관리인이 손님 여권을 받아 보고 손수 옮겨 적는다.' },
      ] },
      d_reg_fjordheim: { src: 'arkiv', find: ['k_fjordheim', 'k_tielemans'], title: '피오르헤임 호텔 숙박 신고', kicker: 'HOTEL FJORDHEIM · MELDESEDLER', meta: '1969년 10월 11일 ~ 14일', body: [
        { rows: [
          ['10.11 (토) 08:00', '[[클라우디아 틸레만스]]', '벨기에 · [[앤트워프]] · 판매원', '1.211.408', '21', '북부두 쪽 창. 쌍안경을 빌려 달라 함 (없다고 함)'],
          ['10.12 (일) 14:00', '스벤 알스트룀', '스웨덴 · 목재상', 'S 40771', '12', '—'],
          ['10.14 (화) 15:30', '틸레만스 떠남', '—', '—', '21', '"오슬로로 간다" 함'],
        ], head: ['들어온 때', '이름', '국적 · 직업', '여권', '방', '비고'], f: { 0: 'f_rooms' } },
        { note: '지배인: 손님이 두고 간 것은 없음. 방은 늘 창가 쪽 커튼만 반쯤 열려 있었음.' },
      ] },
      d_switch: { src: 'arkiv', find: ['k_sentralbord'], title: '브뤼겐 호텔 전화 교환 기록', kicker: 'HOTEL BRYGGEN · SENTRALBORD', meta: '방에서 건 전화 · 1969년 10월 14일 ~ 18일', body: [
        { rows: [
          ['10.14', '19:02', '305', '22 140', '2', '0.50'],
          ['10.15', '09:15', '407', '31 007 (역 안내)', '1', '0.25'],
          ['10.16', '10:40', '407', '[[24 318|k_tlf]]', '4', '1.00'],
          ['10.16', '22:10', '407', '장거리 — 벨기에', '9', '38.40'],
          ['10.17', '17:25', '407', '24 318', '2', '0.50'],
          ['10.17', '18:00', '305', '장거리 — 함부르크', '6', '24.00'],
          ['10.18', '06:05', '407', '모닝콜 (프런트에서 걺)', '—', '—'],
        ], head: ['날', '시각', '방', '건 번호', '분', '요금 (크로네)'], f: { 2: 'f_callslip', 4: 'f_callslip' } },
        { note: '밤 10시부터 아침 6시까지는 야간 교환수가 적음.' },
      ] },
      d_katalog: { src: 'nummer', title: '헬레순 전화번호부 — 24 3xx 줄', kicker: 'TELEFONKATALOG FOR HELLESUND 1969', meta: '번호순 부록에서 옮겨 적음', body: [
        { rows: [
          ['24 301', '베르게 & 손 해운', '노르카이 2'],
          ['24 312', '헬레순 세관', '세관 거리 1'],
          ['24 318', '[[브라테 해운대리점|k_brate]] A/S', '노르카이 5 · 대표 E. 브라테'],
          ['24 320', 'E. 브라테 (집)', '호바스 언덕 14'],
          ['24 355', '선원 호텔', '부둣길 8'],
          ['24 377', '헬레순 포토 현상소', '장터 거리 3'],
        ], head: ['번호', '이름', '주소'], f: { 2: 'f_phonebook' } },
      ] },
      d_q_22140: { src: 'nummer', title: '전화번호부 — 22 1xx 줄', kicker: 'TELEFONKATALOG FOR HELLESUND 1969', meta: '번호순 부록에서 옮겨 적음', body: [
        { rows: [
          ['22 131', '부두 식당 할보르', '부둣길 3'],
          ['22 140', '[[헬레순 자동차 임대]] (Hellesund Bilutleie)', '부둣길 2'],
          ['22 147', '헬레순 목공소', '부둣길 1'],
        ], head: ['번호', '이름', '주소'] },
      ] },
      d_q_31007: { src: 'nummer', title: '전화번호부 — 31 0xx 줄', kicker: 'TELEFONKATALOG FOR HELLESUND 1969', meta: '번호순 부록에서 옮겨 적음', body: [
        { rows: [['31 001', 'NSB 헬레순 역 · 역장실', '역 광장'], ['31 007', 'NSB 헬레순 역 · 안내', '역 광장']], head: ['번호', '이름', '주소'] },
        '역 안내원: "15일 아침에 외국 말씨 여자가 토요일 저녁 오슬로행 자리가 남았는지 물었어요. 7시 40분 차라고 알려 줬죠."',
      ] },
      d_q_hl24617: { src: 'nummer', title: '차량 등록 카드 · HL-24617', kicker: 'BILTILSYNET HELLESUND · KJORETOYKORT', meta: '1969.11.3 · 차량 검사소 전화 회신', body: [
        { rows: [
          ['차', '볼보 아마존 1967 · 회색 · 4도어'],
          ['소유자', '브라테 해운대리점 A/S · 노르카이 5'],
          ['주 운전자', 'E. 브라테'],
          ['정기 검사', '1969.9.2 — 뒤 범퍼 왼쪽 우그러짐. 수리 권고'],
        ], head: ['항목', '내용'], f: { 3: 'f_bumper' } },
        { note: '수리 완료 신고는 아직 들어오지 않음.' },
      ] },
      d_q_hl24455: { src: 'nummer', title: '헬레순 자동차 임대 — 대여 장부 · HL-24455', kicker: 'HELLESUND BILUTLEIE · UTLEIEPROTOKOLL', meta: '부둣길 2 · 1969년 10월 · 가게에서 옮겨 적음', body: [
        { rows: [
          ['10.6 ~ 10.8', '헬레순 제재소 (업무)', '312 → 498', '—'],
          ['10.15 09:00 ~ 10.17 20:30', '[[클라우스 렘메르트]] · 서독 면허', '1,106 → 1,398', '반납 때 기름 가득 · 현금'],
          ['10.18 ~ 10.21', '— 대여 없음 (차고)', '1,398 → 1,398', '토요일은 가게 쉼 · 차고 잠금'],
        ], head: ['대여 기간', '빌린 사람', '주행계 (km)', '비고'], f: { 1: 'f_rental', 2: 'f_rental_idle' } },
        { note: '차량 검사소 기록: 1969.8.30 정기 검사 — 차체 이상 없음.' },
      ] },
      d_q_hl24133: { src: 'nummer', title: '차량 등록 카드 · HL-24133', kicker: 'BILTILSYNET HELLESUND · KJORETOYKORT', meta: '1969.11.3 · 차량 검사소 전화 회신', body: [
        { rows: [['차', '볼보 아마존 1966 · 회색'], ['소유자', '치과의사 T. 모 · 장터 거리 11'], ['정기 검사', '1969.7.14 — 이상 없음']], head: ['항목', '내용'] },
        '치과 접수부: 10월 18일(토) 오전 9시부터 오후 1시까지 진료, 환자 열한 명.',
      ] },
      d_q_hl24902: { src: 'nummer', title: '차량 등록 카드 · HL-24902', kicker: 'BILTILSYNET HELLESUND · KJORETOYKORT', meta: '1969.11.3 · 차량 검사소 전화 회신', body: [
        { rows: [['차', '볼보 아마존 1964 · 회색'], ['소유자', '농부 K. 울브세트 · 울브세트라'], ['정기 검사', '1969.5.20 — 뒤 범퍼 교체 (새것)']], head: ['항목', '내용'] },
        '10월 18일은 헬레순 가축 시장. 울브세트는 아침부터 오후 네 시까지 장터에 있었다고 이웃 셋이 말함.',
      ] },
      d_havnelogg: { src: 'arkiv', find: ['k_havorn', 'k_nordkai'], title: '항만 입항 기록 — 1969년 10월', kicker: 'HAVNEFOGDEN I HELLESUND · ANLØPSPROTOKOLL', meta: '항만장 사무소 · 노르카이·남부두', body: [
        { rows: [
          ['10.2 (목) 14:00', 'MS 솔바크', '노르웨이', '남부두 1', '헬레순 해운', '—'],
          ['10.4 (토) 06:10', 'MS [[하브외른]] (HAVØRN)', '파나마', '[[노르카이]] 3 (NORDKAI)', '[[브라테 해운대리점|k_brate]]', '서류: E. 브라테 서명 (07:00)'],
          ['10.9 (목) 09:30', 'MS 트롤한', '노르웨이', '노르카이 1', '베르게 & 손', '—'],
          ['10.11 (토) 06:05', 'MS 하브외른', '파나마', '노르카이 3', '브라테 해운대리점', '서류: E. 브라테 서명 (06:50)'],
          ['10.16 (목) 13:20', 'MS 에이데르', '서독', '남부두 2', '헬레순 해운', '—'],
          ['10.18 (토) 06:20', 'MS 하브외른', '파나마', '노르카이 3', '브라테 해운대리점', '서류: [[O. 리|k_lie]] 대리 서명 (11:30) — 대표 부재'],
        ], head: ['들어온 때', '배', '선적', '선석', '대리점', '비고'], f: { 1: 'f_harborlog', 3: 'f_harborlog', 5: 'f_absent' } },
        { note: 'MS 하브외른: 1958년 건조 · 1968년 5월 파나마 선적 등록 · 전 이름 난은 비어 있음 · 토요일마다 들어와 월요일에 나감.' },
      ] },
      d_bilreg: { src: 'arkiv', find: ['k_plate'], title: '차량 등록 조회 — 회색 볼보 아마존, HL-24로 시작하는 번호', kicker: 'BILTILSYNET HELLESUND', meta: '1969.10.27 · 차량 검사소 전화 회신을 받아 적음', body: [
        { rows: [
          ['HL-24133', '볼보 아마존 1966 · 회색', '치과의사 T. 모 · 헬레순'],
          ['HL-24455', '볼보 아마존 1968 · 회색', '[[헬레순 자동차 임대]] (빌려 주는 차)'],
          ['HL-24617', '볼보 아마존 1967 · 회색', '[[브라테 해운대리점|k_brate]] A/S (회사 차) · 주 운전자 E. 브라테'],
          ['HL-24902', '볼보 아마존 1964 · 회색', '농부 K. 울브세트 · 울브세트라'],
        ], head: ['번호', '차', '소유자 · 주 운전자'], f: { 2: 'f_carreg' } },
        { note: '번호별 등록 카드와 검사 기록은 번호를 불러 따로 조회해야 함.' },
      ] },
      d_fuel: { src: 'arkiv', find: ['k_plate'], title: '크비트달 길 주유소 외상 장부', kicker: 'BENSINSTASJON · KVITDALSVEIEN', meta: '1969년 10월 · 외상 손님 서명란', body: [
        { img: 'fuel', cap: '크비트달 길 주유소' },
        { rows: [
          ['10.17 16:10', 'HL-11820', '헬레순 제재소', '42', 'R.S.'],
          ['10.18 08:50', 'HL-24902', 'K. 울브세트', '20', 'K.U.'],
          ['10.18 11:40', 'HL-24617', '브라테 해운대리점', '35', 'E.B.'],
          ['10.18 15:05', 'HL-30455', '헬레순 버스', '80', '—'],
          ['10.19 10:20', 'HL-24133', 'T. 모', '25', 'T.M.'],
        ], head: ['때', '차 번호', '외상 손님', '리터', '서명'], f: { 2: 'f_fuel' } },
        { note: '주인: 외상 손님은 손수 서명함. 여기서 크비트달 등산로 들머리까지 차로 10분.' },
      ] },
      d_hyttebok: { src: 'arkiv', find: ['k_hytte', 'k_per'], title: '크비트달 산장 방명록', kicker: 'HYTTEBOK · KVITDALSHYTTA', meta: '헬레순 등산회 · 1969년 10월 · 옮겨 적음', body: [
        { img: 'hytte', cap: '능선 위의 크비트달 산장' },
        { rows: [
          ['10.11 (토)', '헬레순 등산회 넷', '크비트달 들머리 → 산장', '안개. 아무것도 안 보임'],
          ['10.18 (토) 12:40', '카리 바트네 · 잉리드 몰란', '크비트달 들머리 09:30 → 산장', '장작 넉넉함, 고마워요'],
          ['10.18 (토) 15:30', '[[페르 순데]] · 아르일 네스 · 욘 브레케', '[[울브세트라]] 10:00 → 능선 → 산장', '긴 하루! 두 시쯤 계곡 쪽에 연기 같은 것'],
          ['10.19 (일) 09:00', '페르 · 아르일 · 욘', '→ 울브세트라로 내려감', '—'],
          ['10.19 (일) 13:40', '카리 · 잉리드', '→ 크비트달 들머리로 내려감', '—'],
        ], head: ['날', '적은 사람', '온 길', '남긴 말'], f: { 2: 'f_per_alibi' } },
      ] },

    },
    people: {
      p_kari: { name: '카리 바트네', role: '대학생 · 첫 발견자', where: '헬레순 대학 기숙사', key: 'k_kari', color: '#5b6e7a', initial: '카',
        intro: ['카리 바트네예요. 대학에서 지리학을 해요. 토요일 아침에 친구 잉리드랑 크비트달 들머리에서 올라가 산장에서 자고, 일요일에 내려오다가… 봤어요.'],
        ask: {
          k_kvitdal: ['길에서 60미터쯤 떨어진 바위 비탈 아래였어요. 잉리드가 먼저 봤어요. 불은 벌써 꺼져 있었고 비에 젖어 있었어요.'],
          k_hytte: ['산장엔 토요일 열두 시 사십 분쯤 들어갔어요. 오후 세 시쯤 창밖으로, 계곡 길을 빠르게 내려가는 남자를 봤어요. 검은 외투에 모자. 너무 멀어서 얼굴은 못 봤어요.', '세 시 반에는 [[페르 순데]]라는 사람이 친구 둘이랑 들어왔어요.'],
          k_per: ['옷에서 연기 냄새가 났어요. 그래서 경찰한테 그 사람 얘기를 한 거예요. …지금 생각하면 점심때 불을 피웠다고 했던 것 같기도 해요.'],
          k_thermos: ['그 컵은 저희 것 아니에요. 저희는 보온병을 안 가져갔어요.'],
          k_woman: ['…장화가 새것이었어요. 밑창이 하얬어요. 그런 신발로 오를 길이 아닌데.'],
          k_ingrid: ['잉리드는 그 뒤로 산에 안 가요.'],
          k_1018: ['토요일 아침 아홉 시 반엔 들머리 공터에 차가 한 대도 없었어요. 저흰 버스로 갔거든요.'],
        },
        idle: ['그건 잘 모르겠어요.'] },
      p_per: { name: '페르 순데', role: '중학교 교사 · 18일 산장 투숙객', where: '헬레순 중학교 교무실', key: 'k_per', color: '#6b7458', initial: '페',
        intro: ['페르 순데입니다. 헬레순 중학교 교사예요. 18일에 친구 둘이랑 울브세트라에서 능선을 타고 크비트달 산장까지 갔습니다.'],
        ask: {
          k_kvitdal: ['계곡 바닥으로는 안 내려갔어요. 능선 길로 곧장 산장에 들어갔죠. 방명록에 시각까지 적었습니다.'],
          k_hytte: ['세 시 반쯤 들어갔어요. 아침 열 시에 [[울브세트라]]를 떠났으니 다섯 시간 반 걸린 셈이죠. 아르일과 욘이 줄곧 같이 있었고요.'],
          k_kari: ['대학생 둘요. 우리가 연기 냄새를 풍겼나 봐요. 점심때 능선에서 불을 피워 소시지를 구웠거든요.'],
          k_woman: ['두 시쯤 계곡 쪽에서 연기 같은 게 피어오르는 걸 아르일이 봤어요. 저는 안개인 줄 알았고요. …그때 알았다면.'],
          k_1018: ['그날은 종일 능선에 있었어요. 셋이서요.'],
        },
        idle: ['죄송합니다, 그건 모르겠네요.'] },
      p_randi: { name: '란디 에이데', role: '에이데 신발 가게 점원', where: '헬레순 장터 거리', key: 'k_randi', color: '#8a6a5a', initial: '란',
        intro: ['란디 에이데예요. 아버지 신발 가게에서 일해요. 경찰이 우리 가게 상자를 들고 왔더라고요.'],
        ask: {
          k_woman: ['16일 목요일 오후에 오셨어요. 산에 신을 장화를 찾으셨죠. 토요일에 크비트달이 추울지 물으셨어요. "누가 차로 들머리까지 데려다준대요" 하시면서요.'],
          k_schlosser: ['이름은 안 대셨어요. 현금으로 내셨고요. 독일 말씨가 섞인 영어였어요.'],
          k_labels: ['상자에서 가게 도장 찍힌 종이를 찢어 달라고 하셨어요. 이상한 부탁이라 기억해요.'],
          k_kvitdal: ['그 길은 비 오면 미끄럽다고 말씀드렸어요. 그래서 장화를 사신 거예요.'],
        },
        self: ['우리 가게는 장터 거리에서 30년 됐어요.'],
        idle: ['그건 잘 모르겠어요.'] },
      p_solveig: { name: '솔베이 하우그', role: '브뤼겐 호텔 프런트 직원', where: '브뤼겐 호텔 로비', key: 'k_solveig', color: '#7a5f78', initial: '솔',
        intro: ['솔베이 하우그예요. 브뤼겐 호텔 프런트에서 일한 지 11년 됐어요.'],
        ask: {
          k_schlosser: ['슐로서 부인요. 오스트리아 여권을 내셨어요. 독일어를 쓰다가, 식당 지배인이 프랑스어로 말을 거니 그걸로 대답하시더군요. 영어도 하셨고요.', '방에서 시내 전화를 몇 번 거셨어요. 요금은 [[교환 기록]]에 다 남아요.'],
          k_bryggen: [{ p: '첫날 214호를 드렸는데 이튿날 아침 항구 쪽 방으로 바꿔 달라고 하셨어요. [[노르카이]]가 내려다보이는 쪽으로요. 14일에 다시 오셨을 때도 407호, 같은 쪽이었어요.', f: 'f_rooms' }],
          k_remmert: [{ p: '렘메르트 씨요? 15일 저녁 식당에서 슐로서 부인이랑 둘이 식사를 했어요. 그 뒤로 그분이 두 번이나 부인 방 번호를 물었는데 안 알려 드렸어요.', f: 'f_dinner' }, '늘 검은 외투에 모자 차림이세요. 17일 저녁엔 급하게 계산하고 나가셨고요.'],
          k_taxi: ['18일 오전 열 시 사십 분에 계산하시면서 택시를 불러 달라고 하셨어요. 가방 두 개를 들고 나가셨고요. 방값은 현금, 크로네로.'],
          k_woman: ['조용한 분이었어요. 가발을 쓰신 것 같았어요. 날마다 머리 모양이 조금씩 달랐거든요.'],
          k_labels: ['세탁은 한 번도 맡기지 않으셨어요. 옷은 방에서 손수 빠셨어요.'],
          k_1018: ['그날 아침 여섯 시에 모닝콜을 넣어 달라고 하셨어요. 토요일마다 그러셨던 것 같아요.'],
          k_brate: ['브라테 씨는 이 동네에서 모르는 사람이 없죠. 식당에도 가끔 손님을 모시고 오세요. 슐로서 부인이랑 같이 있는 건 못 봤어요.'],
          k_nordkai: ['407호 창에서는 노르카이 3번 선석이 바로 내려다보여요.'],
        },
        idle: ['죄송해요, 그건 모르겠어요.'] },
      p_taxi: { name: '오드 헬레', role: '헬레순 택시 7호차 기사', where: '헬레순 역 앞 택시 승강장', key: 'k_taxi', color: '#4f5a48', initial: '오',
        intro: ['오드 헬레요. 헬레순 택시 7호차.'],
        ask: {
          k_schlosser: ['18일 토요일 오전 열 시 오십 분에 브뤼겐에서 그 부인을 태웠소. 가방 둘. 역으로 가자더군.'],
          k_woman: ['그 부인 말이오? 18일에 브뤼겐에서 역까지 태워 줬소.'],
          k_station: [{ p: '역에서 가방을 맡기고 나오더니, 광장 끝에 서 있던 회색 볼보 아마존으로 걸어가 탔소. 열한 시 십오 분쯤. 번호판은 [[HL-24]]까지만 봤소. 뒤 범퍼가 찌그러져 있었고.', f: 'f_taxi' }, '운전석 사람은 내리지 않았소. 검은 외투에 모자. 얼굴은 못 봤소.'],
          k_garderobe: [{ p: '보관소 창구 앞까지 가방을 들어다 줬소. 부인은 표를 받고 나서 광장 끝 회색 차로 갔지.', f: 'f_taxi' }],
          k_plate: ['HL은 이 군 번호요. 뒤에 숫자가 24로 시작했소. 나머진 못 봤소.'],
          k_brate: ['브라테 씨 회사 차가 회색 아마존이긴 하지. 하지만 이 동네에 회색 아마존이 한두 대요?'],
          k_1018: ['그날은 비가 그쳐서 손님이 적었소.'],
        },
        idle: ['택시 일 말고는 모르오.'] },
      p_remmert: { name: '클라우스 렘메르트', role: '함부르크 기계 부품 판매원 · 브뤼겐 호텔 투숙객', where: '노르보그 경찰서 (전화 탐문)', key: 'k_remmert', color: '#5a5f78', initial: '렘',
        intro: [{ p: '렘메르트입니다. 함부르크 기계 부품 회사의 영업 담당이에요. 그 부인과는 호텔 로비에서 인사 한 번 한 게 다입니다.', f: 'f_remmert_claim' }],
        ask: {
          k_schlosser: { need: ['!f_dinner'], a: ['…식사를 한 번 했습니다. 15일에. 아내에겐 말하지 말아 주십시오.', '그 부인은 이상한 걸 물었어요. 배에 새로 칠한 페인트는 몇 해가 지나야 옛 글씨가 비쳐 보이느냐고. 저는 기계 부품쟁이라 모른다고 했죠.'], else: ['로비에서 인사 한 번 한 게 다라니까요.'] },
          k_woman: ['신문 보고 놀랐습니다. 정말입니다.'],
          k_1018: ['17일 밤 열 시 [[연안선]]을 탔습니다. 20일에 노르보그에서 내렸고요. 사무장이 승선 명부를 갖고 있을 겁니다.'],
          k_bryggen: ['브뤼겐에는 출장 때마다 묵어요. 305호가 제 방이나 다름없죠.'],
          k_brate: ['브라테? 모르는 이름입니다.'],
          k_havorn: ['배 이름은 몰라요. 저는 기계만 팝니다.'],
          k_rental: { need: ['!f_rental'], a: ['…빌렸습니다. 회색 아마존. 거래처가 시 밖에 있어서요. 15일 아침부터 17일 저녁까지.', '17일 저녁 여덟 시 반에 돌려주고 곧장 부두로 갔습니다. 배에서 내린 적 없어요. 사무장이 압니다.'], else: ['차요? 저는 기차와 배로만 다닙니다. 차는 빌린 적 없어요.'] },
          k_plate: { need: ['!f_rental'], a: ['제가 빌린 차도 HL-24 로 시작했을 겁니다. 하지만 18일엔 제 손에 없었어요. 장부에 반납 시각이 있을 겁니다.'], else: ['번호판 같은 건 눈여겨보지 않습니다.'] },
          k_kvitdal: ['산에는 안 갑니다. 무릎이 나빠서요.'],
        },
        idle: ['그건 모르겠습니다.'] },
      p_brate: { name: '에이나르 브라테', role: '브라테 해운대리점 대표 · 전 하브브리스 해운 대표', where: '노르카이 5 · 대리점 사무실', key: 'k_brate', color: '#3f4a52', initial: '브',
        intro: [{ p: '에이나르 브라테입니다. 노르카이에서 해운대리점을 합니다. 그 외국 여자 일은 신문에서 봤습니다. 18일 토요일요? 아침 아홉 시부터 오후 두 시까지 사무실에 있었고, 그 뒤엔 집에 있었습니다.', f: 'f_brate_claim' }],
        ask: {
          k_woman: ['만난 적 없습니다. 신문에서 본 게 다예요.'],
          k_schlosser: ['슐로서? 처음 듣는 이름입니다.'],
          k_tlf: { need: ['!f_callslip'], a: ['…전화야 하루에도 수십 통 옵니다. 16일요? 배를 빌리고 싶다는 외국 여자가 있긴 했습니다. 오스트리아 골동품상이라던가.', '만나지는 않았습니다. 값이 안 맞았어요.'], else: ['우리 사무실 번호요. 그게 왜요?'] },
          k_plate: { need: ['!f_fuel'], a: ['…회사 차는 그날 사무원 [[리|k_lie]]가 몰고 나갔을 겁니다. 부품을 가지러요. 저는 사무실에 있었고요.'], else: ['회사 차는 회색 아마존입니다. 그게 무슨 상관입니까?'] },
          k_lie: { need: ['!f_absent'], a: ['(한참 말이 없다) …리가 부두에 있었다면, 차는 제가 몰았겠지요. 바람을 쐬러 나갔습니다. 크비트달 쪽은 아닙니다.'], else: ['올라 리는 우리 사무원입니다. 성실한 친구죠.'] },
          k_havorn: ['파나마 선적 화물선입니다. 우리가 대리점을 맡고 있죠. 토요일마다 들어옵니다.'],
          k_vesleterne: { need: ['!f_repaint'], a: ['(사진을 한참 본다) …페인트 자국이야 배마다 있습니다. 헌 배를 사다 이름을 바꾸는 건 흔한 일이고요.', '베슬레 테르네는 북해에서 가라앉았습니다. 보험 조사도 다 끝났어요.'], else: ['베슬레 테르네요? 68년 2월 북해에서 잃었습니다. 선원들은 다 살았고요. 슬픈 일이었죠.'] },
          k_havbris: ['하브브리스는 68년에 정리했습니다. 배를 잃고 나서요.'],
          k_mutuelle: ['앤트워프 보험사요? 68년에 보험금은 제대로 나왔습니다. 조사는 다 끝났다니까요.'],
          k_kvitdal: ['크비트달요? 젊을 때나 올라갔죠.'],
          k_nordkai: ['노르카이 3번 선석은 우리가 늘 쓰는 자리입니다.'],
          k_thermos: ['보온병이야 집집마다 있지요.'],
        },
        idle: ['그건 제 일이 아닙니다.'] },
    },
    solution: {
      culprit: 'k_brate',
      claims: [
        { id: 'c1', q: '그녀가 누구였는지 보여 주는 기록', accept: ['f_brussels', 'f_anvers_id'] },
        { id: 'c2', q: '동기', accept: ['f_vt_claim', 'f_repaint'] },
        { id: 'c3', q: '범인과 그녀를 잇는 기록', accept: ['f_callslip', 'f_phonebook'] },
        { id: 'c4', q: '범인이 스스로 댄 행적과 어긋나는 기록', accept: ['f_fuel', 'f_sig'] },
      ],
      far: '반려. 할보르센 경감은 서류를 말없이 돌려보냈다. 어디가 틀렸는지는 적혀 있지 않다.',
      stamp: '1969.11.14 · Hellesund Politikammer',
      epilogue: [
        '그녀의 이름은 미레유 다송, 서른여섯. 앤트워프 해상공제의 선박 사고 조사원이었다. 1968년 2월 북해에서 "가라앉은" 베슬레 테르네 호의 보험금 390만 크로네가 헬레순의 하브브리스 해운에 지급된 뒤, 그 배를 닮은 파나마 선적 화물선이 토요일마다 헬레순에 들어온다는 말이 앤트워프까지 흘러갔다.',
        '다송은 세 개의 이름과 세 개의 가발로 호텔을 옮겨 다니며, 노르카이가 내려다보이는 창가에서 토요일 새벽마다 하브외른 호를 지켜보았다. 7번 사진, 새 페인트 밑의 VESLE TE…가 그녀가 찾던 것이었다.',
        '16일 아침, 그녀는 오스트리아 골동품상 베라 슐로서로서 24 318에 전화를 걸어 배를 빌리고 싶다고 했다. 그날 밤 앤트워프에는 "VT 봤음, 토요일에 확인"이라고 알렸다. 에이나르 브라테는 다음 날 걸려 온 두 번째 전화에서, 옛 선장이 산다는 크비트달 위쪽 오두막까지 차로 데려다주겠다고 했다.',
        '18일 토요일, 하브외른 호의 서류에는 사무원 올라 리가 대신 서명했다. 11시 15분 역 광장의 회색 아마존 HL-24617, 11시 40분 크비트달 길 주유소 장부의 E.B. 보온병의 커피에는 수면제가 들어 있었다. 브라테는 손가방과 여권을 가져갔고, 남은 것에 불을 붙였다.',
        '역 보관소의 가방 두 개는 그녀가 저녁 7시 40분 오슬로행 기차로 떠나려고 맡겨 둔 것이었다. 보관표 1147번은 끝내 창구로 돌아오지 않았다.',
      ],
    },
    artStyle: '1969 Norwegian police and press photography on 35mm film: Tri-X style black-and-white grain for police documentation, faded early colour film with a cool blue-green cast for everything else; overcast west-coast light, wet rock, heather and harbour mist. Documentary and quiet. No readable text, no faces, no bodies.',
    art: {
      bags_table: { svg: bagsTable, use: '정밀 관찰 사진', ratio: '4:3', prompt: 'Top-down police evidence photograph from 1969: the contents of two suitcases laid out in three neat rows on a grey table, each object with a small blank paper tag, the two empty open suitcases along the top edge. Top row from left to right: three wigs (a black bob, a long chestnut one, a grey one pinned up), two pairs of glasses (horn-rimmed and wire-rimmed), a pair of 8x30 binoculars with a worn leather strap, a small 35mm camera, folded clothes (blouse, skirt, sweater) with small squares cut out at the collar where the labels were. Middle row: a palm-sized notebook, a folded tourist map, a brass hotel key tag with a key, a crumpled soap wrapper, an empty shoe box. Bottom row: two envelopes with banknotes, one train ticket. A ruler at the bottom edge.', must: '세 줄 배열 — 위: 가발 셋·안경 둘·쌍안경·카메라·상표를 오려 낸 옷 / 가운데: 수첩·관광 지도·놋쇠 열쇠고리·구겨진 비누 포장지·빈 신발 상자 / 아래: 돈 봉투 둘·기차표', swap: 'svg', raster: true },
      cover: { use: '기록실 폴더 표지 — 증거물 꼬리표가 달린 가방 두 개', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#8e928c"/><rect y="118" width="200" height="32" fill="#6d706a"/><rect x="30" y="60" width="80" height="58" rx="4" fill="#6b4a2c"/><rect x="60" y="52" width="20" height="10" rx="3" fill="none" stroke="#3a2818" stroke-width="3"/><rect x="104" y="72" width="70" height="46" rx="4" fill="#3f4b52"/><rect x="130" y="64" width="18" height="10" rx="3" fill="none" stroke="#20282c" stroke-width="3"/><path d="M40 124l22-7 6 18-22 7z" fill="#dfb64c"/><path d="M40 124l-8-10" stroke="#ccc" stroke-width="1.5"/></svg>',
        prompt: 'Police evidence photograph, 1969: two worn 1960s suitcases, one brown leather and one grey-blue, standing on a concrete floor under a cold overhead lamp, a paper left-luggage ticket tied to one handle and a manila evidence tag lying in front of them. Slightly soft focus, heavy 35mm black-and-white grain.' },
      valley: { use: '신문 10월 20일자 — 크비트달 등산로', ratio: '4:3',
        svg: `<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#b7bdb6"/>${hills}<path d="M20 150Q70 110 90 96T150 70" fill="none" stroke="#c9c1a4" stroke-width="3" stroke-dasharray="5 4"/><path d="M150 120l20-30 14 36z" fill="#4a4a42"/></svg>`,
        prompt: 'Newspaper photograph of a remote rocky valley above a small Norwegian west-coast town in late October 1969: a narrow hiking path winding up between boulders, heather and a few bare birches, low cloud on the ridges, wet stone, no people. Coarse halftone newsprint look.' },
      thermos: { use: '현장 유류품 1호 — 히스 덤불 속 보온병 뚜껑 컵', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#6e5a4e"/><g fill="#8a5f6e"><circle cx="30" cy="40" r="18"/><circle cx="170" cy="30" r="22"/><circle cx="60" cy="130" r="24"/><circle cx="160" cy="125" r="20"/></g><path d="M78 70h44l-6 44H84z" fill="#b8b9b4"/><ellipse cx="100" cy="70" rx="22" ry="6" fill="#d9dad5"/><ellipse cx="100" cy="72" rx="16" ry="3" fill="#4a3526"/></svg>',
        prompt: 'Police close-up photograph of the screw-on cup lid of a 1960s vacuum flask lying in wet purple heather on a rocky Norwegian hillside, a dark coffee stain inside the cup, a blank evidence number card beside it. Overcast light, 35mm black-and-white film.' },
      suitcases: { use: '역 보관소 가방 두 개의 내용물', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#b9b2a2"/><rect x="24" y="60" width="86" height="60" rx="4" fill="#6b4a2c"/><rect x="56" y="52" width="20" height="10" rx="3" fill="none" stroke="#3a2818" stroke-width="3"/><rect x="104" y="72" width="76" height="50" rx="4" fill="#3f4b52"/><rect x="132" y="64" width="18" height="10" rx="3" fill="none" stroke="#20282c" stroke-width="3"/><rect x="160" y="84" width="14" height="20" fill="#e8dfc6"/></svg>',
        prompt: 'Two 1960s suitcases opened on a police table with their contents laid out for documentation: three wigs of different hair colours, plain-glass spectacles, neatly folded clothes with the labels cut out, small binoculars, a compact camera and a slim notebook. Flat fluorescent light, faded 35mm colour film.' },
      touristmap: { use: '관광 지도 — 연필 동그라미와 기호', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#efe8d2"/><path d="M0 110Q50 96 80 104T150 94T200 100V150H0z" fill="#a9c3cf"/><path d="M60 104h24v6H60zM96 100h20v6H96z" fill="#8a7a60"/><g fill="none" stroke="#8a9a6a"><path d="M120 20q20 10 40 0t40 4"/><path d="M110 40q30 12 60 0t30 2"/></g><circle cx="72" cy="104" r="10" fill="none" stroke="#4a4a4a" stroke-width="2"/><circle cx="150" cy="44" r="10" fill="none" stroke="#4a4a4a" stroke-width="2"/><path d="M162 30h26" stroke="#4a4a4a" stroke-width="2" stroke-dasharray="3 2"/></svg>',
        prompt: 'A folded 1968 tourist map of a small Norwegian harbour town lying on a desk, two hand-drawn pencil circles on it, one at a harbour quay and one at a mountain trailhead, a short row of tiny pencil geometric symbols beside the second circle. All printed lettering blurred and illegible. Warm desk-lamp light.' },
      harbor: { use: '현상한 필름 3번 — 새벽 항구와 화물선', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#aeb4b2"/><rect y="96" width="200" height="54" fill="#6f7c80"/><rect y="86" width="90" height="12" fill="#4a4a46"/><path d="M96 84h76l-8 14h-62z" fill="#2e3336"/><rect x="146" y="64" width="16" height="20" fill="#3a4044"/><rect x="152" y="54" width="4" height="10" fill="#3a4044"/><g fill="#5b5f5c"><rect x="10" y="50" width="30" height="36"/><rect x="46" y="40" width="26" height="46"/></g></svg>',
        prompt: 'Grainy 35mm photograph taken at dawn from a high hotel window: a small Norwegian harbour with a long quay, wooden warehouses and a single rusty coastal freighter moored, a few lights still on, mist on the water. Slightly underexposed, cool colour shift.' },
      stern: { use: '현상한 필름 7번 — 새 페인트 밑 옛 글자 자국이 보이는 고물', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#56605f"/><path d="M20 20h160v90q-80 20-160 0z" fill="#2f3538"/><rect x="46" y="44" width="108" height="8" fill="#3c4346"/><rect x="50" y="62" width="100" height="10" fill="#e8e6de"/><rect x="70" y="80" width="60" height="6" fill="#e8e6de"/><rect y="118" width="200" height="32" fill="#44525a"/></svg>',
        prompt: 'Close-up 35mm photograph of the stern of a rusty small cargo ship at a quay: freshly painted name letters on the dark hull, and beneath the new paint the faint raised outlines of older, different letters showing in low raking morning light. The two rows must be clearly visible as shapes: a short row of fresh white painted letters, and around and beneath it a longer row of older letter outlines standing out as raised ridges and paint edges in the raking light. Letter shapes only, blurred so no word can be read. Water reflections, cool muted colours.',
        must: '새로 칠한 글자 한 줄 + 그 밑으로 도드라진 옛 글자 윤곽 (읽히지는 않게)' },
      station: { use: '신문 10월 23일자 — 역 수하물 보관소 창구', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#8f877a"/><rect x="30" y="30" width="140" height="70" fill="#5b5145"/><rect x="40" y="40" width="120" height="44" fill="#2c2620"/><g fill="#6b5a44"><rect x="46" y="46" width="30" height="16"/><rect x="84" y="46" width="30" height="16"/><rect x="122" y="46" width="30" height="16"/><rect x="46" y="64" width="30" height="16"/><rect x="84" y="64" width="30" height="16"/></g><rect x="20" y="100" width="160" height="12" fill="#a39480"/><rect y="112" width="200" height="38" fill="#6e665a"/></svg>',
        prompt: 'Interior of a small Norwegian railway station left-luggage office in 1969: a wooden counter with a hinged hatch, shelves behind it holding suitcases and parcels with paper tags, a round wall clock, empty benches. Newspaper halftone photograph, no people.' },
      regcard: { use: '브뤼겐 호텔 외국인 숙박 신고서', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#6b5a45"/><g transform="rotate(-3 100 76)"><rect x="36" y="22" width="128" height="108" fill="#f1ecdc"/><path d="M46 40h108M46 56h108M46 72h108M46 88h108M46 104h108" stroke="#a39c86" stroke-width="1.5"/><path d="M60 50q10-6 20 0t20 0M60 66q14-6 28 0M60 82q8-5 16 0t16 0 16 0" stroke="#2d3f6e" stroke-width="2" fill="none"/></g></svg>',
        prompt: 'A 1960s hotel foreign-guest registration slip on a wooden reception counter, filled in with blue ballpoint handwriting that is blurred and unreadable, a brass room-key tag beside it. Close-up, shallow depth of field, warm lamp light.' },
      hytte: { use: '산장 방명록 — 능선 위의 크비트달 산장', ratio: '4:3',
        svg: `<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#c3c9c6"/>${hills}<path d="M84 80V64l16-12 16 12v16z" fill="#7a3b2e"/><path d="M80 66l20-16 20 16" fill="none" stroke="#3a2a22" stroke-width="3"/><rect x="95" y="68" width="8" height="12" fill="#3a2a22"/></svg>`,
        prompt: 'A small red-painted wooden mountain hut on a bare Norwegian ridge above a valley in late October 1969, low cloud, heather and grey rocks, a thin line of smoke from the chimney, no people. Faded 35mm colour film.' },
      ship: { use: '1968년 신문 — 폭풍 속 화물선 (흐린 사진)', ratio: '4:3',
        svg: '<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#6d7475"/><path d="M0 100Q30 84 60 100T120 98T200 96V150H0z" fill="#3f4a4e"/><g transform="rotate(-8 95 100)"><path d="M50 92h90l-10 16H58z" fill="#1f2426"/><rect x="108" y="70" width="18" height="18" fill="#1f2426"/></g><path d="M0 120Q40 106 80 120T160 118T200 116" fill="none" stroke="#9aa5a6" stroke-width="2"/></svg>',
        prompt: '1968 newspaper photograph of a small coastal cargo ship rolling in heavy North Sea waves at night, lit only by a trawler\'s searchlight, spray and black water, very grainy and blurred. No text.' },
      fuel: { use: '주유소 외상 장부 — 크비트달 길 주유소', ratio: '4:3',
        svg: `<svg viewBox="0 0 200 150"><rect width="200" height="150" fill="#9fa7a3"/>${hills}<rect x="60" y="80" width="80" height="40" fill="#e6e1d4"/><rect x="50" y="70" width="100" height="12" fill="#b23a2e"/><rect x="74" y="92" width="10" height="26" fill="#3a3d40"/><rect x="116" y="92" width="10" height="26" fill="#3a3d40"/><rect y="120" width="200" height="30" fill="#55595a"/></svg>`,
        prompt: 'A small roadside petrol station on a rural Norwegian road in 1969: a white wooden building with a red canopy, two old fuel pumps, wet asphalt, mountains behind in low cloud. No logos, no readable signs.' },
    },
    css: `[data-case="c06"] .skin-news .doc-paper{font-family:var(--f-latin);font-weight:700;letter-spacing:.04em}
[data-case="c06"] .skin-telegram .doc-b .b-p{text-transform:uppercase}
[data-case="c06"] .arch-f{--arch-line:#34465a}`,
  });
})();
