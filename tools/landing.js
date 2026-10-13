#!/usr/bin/env node
/* 검색 엔진이 읽을 수 있는 소개 페이지 — 언어마다 한 장 (ko/ en/ ja/ zh/ ru/ de/) + sitemap.xml
 * 게임(index.html)은 자바스크립트가 그려서, 그것만으로는 검색 엔진과 AI 검색이 읽을 글이 없다.
 * 사건 목록(제목 · 연도 · 장소 · 걸리는 시간 · 별 · 폴더의 첫 줄)은 사건 파일과 i18n/<언어>/cNN.js 에서 그대로 읽는다.
 * 스포일러 규칙: 폴더를 열기 전에 보이는 것만 (mood.line). 모티프(실제 사건 이름)는 넣지 않는다.
 * 사용: node tools/landing.js   → 고친 뒤에는 생성된 파일도 함께 커밋한다
 */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const SITE = 'https://jysvai.github.io/Monologue-Gaze/';
const ITCH = 'https://jysvai.itch.io/monologue-gaze';
const GIT = 'https://github.com/jysvai/Monologue-Gaze';
const LANGS = ['en', 'ko', 'ja', 'zh', 'ru', 'de'];
const HREFLANG = { en: 'en', ko: 'ko', ja: 'ja', zh: 'zh-Hans', ru: 'ru', de: 'de' };
const NAMES = { en: 'English', ko: '한국어', ja: '日本語', zh: '中文', ru: 'Русский', de: 'Deutsch' };

// js/i18n.js 와 같은 지문 (cyrb53)
function hash(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/* ── 사건과 번역 ── */
const cases = [];
for (const f of fs.readdirSync(path.join(root, 'cases')).filter(f => /^c\d\d.*\.js$/.test(f)).sort()) {
  const MG = { registerCase: c => cases.push(c), images: {} };
  vm.runInContext(fs.readFileSync(path.join(root, 'cases', f), 'utf8'), vm.createContext({ MG, window: { MG }, console }), { filename: f });
}
const packs = {};
for (const l of LANGS) {
  packs[l] = {};
  if (l === 'ko') continue;
  for (const c of cases) {
    const f = path.join(root, 'i18n', l, c.id + '.js');
    if (!fs.existsSync(f)) continue;
    const MG = { I18N: { put: (ll, part, d) => { packs[l][part] = d; } } };
    vm.runInContext(fs.readFileSync(f, 'utf8'), vm.createContext({ MG, window: { MG } }), { filename: f });
  }
}
const tr = (l, id, s) => {
  if (!s || l === 'ko') return s;
  const t = (packs[l][id] || {})[hash(s)];
  if (t == null) throw new Error(`${l}/${id}: 번역 없음 — ${s}`);
  return t;
};

/* ── 언어마다 쓰는 글 ── */
const L = {
  en: {
    locale: 'en_US',
    title: 'Free browser detective game: 16 cases from the records | Monologue Gaze',
    desc: 'Free browser detective game. Twelve cold cases across a century and three live cases on a clock, solved from newspapers, statements, letters and transcripts.',
    kicker: 'Free browser game · 16 cases · 1888–2025',
    tag: 'A detective game where you solve cases by reading the records.',
    play: 'Play in your browser', itch: 'itch.io page',
    video: 'Gameplay, 1 min',
    about: ['About', 'A drawer of cold cases'],
    p: [
      'You are a new detective in Violent Crimes Unit 2 at Seoul Seobu Police Station. M, a senior member of the unit, has transferred out and left you the key to a desk drawer of unsolved cases going back more than a hundred years.',
      'There is no map to walk around. Each case comes as the documents of its period: a halfpenny paper in 1888 London, police files and telegrams from 1930s Gyeongseong, a guest ledger in 1971 Seoul, a police PC in 2006, a group chat in 2023. Click an underlined word to write it in your notebook, then search the archives with it or ask the people involved about it.',
      'To close a case you file a report. You name the culprit, mark anyone who took part or covered it up, and attach an evidence note to each claim, and the case closes once all of it is right. After the twelve cold cases are closed you can read the letter M left behind.',
    ],
    facts: [
      ['Price', 'Free'],
      ['Platform', 'Web browser, no download (desktop recommended, phones work)'],
      ['Cases', '16 · a 25-minute practice case, then 35–50 min each · about 10 hours in total'],
      ['Languages', 'Korean (original), English, Japanese, Simplified Chinese, Russian, German'],
      ['Voices', 'Korean, with subtitles in every language'],
      ['Saves', 'Progress stays in this browser'],
    ],
    feat: ['Features', 'What you do'],
    features: [
      'Read the documents of each period: newspapers, statements, letters, telegrams, ledgers, transcripts, old personal homepages and messenger logs.',
      'Keep a notebook of words and search with them. A word you have not found yet has to be typed in full, so you cannot skip ahead.',
      'Interview people face to face. Each one has a painted portrait. Hold out a note that contradicts what they said and their story changes; after a few wrong notes they stop talking. When a note breaks a statement, the scene cuts to them across the interview table.',
      'A whereabouts board sets what each person said about the night next to what the records caught, hour by hour.',
      'Open questions on the notebook’s first page fill in as you find things.',
      'Use each era’s tools: handwriting, footprint and voiceprint comparison, vehicle and phone lookups, close study of scene photos, cipher work, case timelines.',
      'Three live cases (2021–2024) run on an investigation clock. You apply for warrants and records, some get rejected, and you have to finish before the deadline.',
      'Difficulty goes from ★3 to ★5. On harder cases a rejected report tells you less about what was wrong.',
      'If you get stuck, the notebook’s “Stuck? Go over what’s left” line points to a place where there is still something to do.',
    ],
    cs: ['Cases', 'The drawer'],
    th: ['No.', 'Case', 'Year', 'Setting', 'Length', 'Difficulty'],
    groups: ['Practice case', 'Cold cases', 'Live cases'], practice: 'practice',
    note: 'Red stars mark cases with graphic descriptions and crime scene photos showing bodies. The Graphic content switch in the records room covers the photos and swaps the text for a toned-down version with the same clues. Every case is a new story that borrows only motifs from real unsolved cases; all people, places and organizations are fictional.',
    sh: ['Screenshots', 'On screen'],
    cap: { interview: 'Interviewing a witness', room: 'The records room', board: 'The whereabouts board', scene: 'A statement breaks across the table', with: 'The report: others involved' },
    cr: ['Credits', 'How it was made'],
    credits: 'Images were generated with AI and checked one by one against the case records. Voices: ElevenLabs. Sound effects: CC0 recordings from Freesound and Kenney. The text and code were written with AI assistance.',
    foot: ['Press kit', 'itch.io', 'Source (GitHub)'],
  },
  ko: {
    locale: 'ko_KR',
    title: '무료 웹 추리 게임, 기록으로 푸는 사건 16건 | Monologue Gaze',
    desc: '한 세기에 걸친 미제 사건 열두 건을 기록만으로 쫓고, 시계가 도는 현행 사건 세 건을 직접 수사하는 무료 웹 추리 게임. 신문, 진술서, 편지, 녹취록을 뒤지고, 현행 사건에서는 기한 안에 영장을 신청한다.',
    kicker: '무료 웹 게임 · 사건 16건 · 1888–2025',
    tag: '기록을 읽어 사건을 푸는 추리 게임.',
    play: '브라우저에서 하기', itch: 'itch.io 페이지',
    video: '플레이 영상, 1분',
    about: ['소개', '미제 사건 서랍'],
    p: [
      '서울서부경찰서 강력2팀의 신입 형사가 되어, 전출 간 선배 M이 서랍에 남기고 간 미제 사건 기록을 연다. 백 년 넘게 거슬러 올라가는 사건들이다.',
      '직접 걸어 다니지 않는다. 사건마다 그 시대의 기록이 온다. 1888년 런던의 반 페니 신문, 1930년대 경성의 경찰 서류와 전보, 1971년 서울의 숙박부, 2006년의 경찰 PC, 2023년의 단체 대화방. 밑줄 친 단어를 눌러 수첩에 적고, 그 단어로 기록을 찾거나 사람에게 묻는다.',
      '수사 보고서에 범인을 고르고, 함께 저지르거나 알고도 감춘 사람이 있으면 그 사람도 적고, 주장마다 증거 메모를 붙인다. 전부 맞아야 사건이 종결된다. 미제 사건 열두 건을 모두 종결하면 M이 남긴 편지를 읽을 수 있다.',
    ],
    facts: [
      ['가격', '무료'],
      ['플랫폼', '웹 브라우저, 내려받기 없음 (PC 권장, 휴대폰도 된다)'],
      ['사건', '16건 · 연습 사건 약 25분, 나머지는 한 건에 35–50분 · 모두 열 시간 남짓'],
      ['언어', '한국어(원문), 영어, 일본어, 중국어(간체), 러시아어, 독일어'],
      ['목소리', '한국어 음성, 모든 언어에 자막'],
      ['저장', '진행 상황은 이 브라우저에 저장된다'],
    ],
    feat: ['특징', '하는 일'],
    features: [
      '그 시대의 기록을 읽는다. 신문, 진술서, 편지, 전보, 숙박부, 녹취록, 미니홈피, 메신저.',
      '단어를 수첩에 적고 그 단어로 찾는다. 아직 찾지 못한 단어는 끝까지 쳐 넣어야 나오므로 건너뛸 수 없다.',
      '사람을 찾아가 탐문한다. 저마다 그려진 얼굴로 대답한다. 그 말과 어긋나는 메모를 내밀면 말이 바뀌고, 엉뚱한 메모를 몇 번 내밀면 입을 닫는다. 메모로 말이 깨지면 테이블 건너편에 앉은 그 사람의 모습이 뜬다.',
      '행적표에는 그날 누가 어디 있었다고 했는지와 기록에 남은 것이 시각별로 나란히 적힌다.',
      '수첩 첫 장의 의문은 찾은 것만큼 빈칸이 채워진다.',
      '시대마다 조사 도구가 따로 있다. 필적·족적·성문 대조 감정, 차량·전화번호 조회, 현장 사진 정밀 관찰, 암호 해독, 사건 재구성.',
      '현행 사건 세 건(2021–2024)은 수사 시계가 돈다. 영장과 자료를 신청하고, 기각되기도 하고, 기한 안에 끝내야 한다.',
      '난이도는 ★3부터 ★5까지. 별이 많을수록 보고서가 틀렸을 때 알려 주는 것이 줄어든다.',
      '막히면 수첩의 「막혔을 때 짚어 보기」가 아직 할 게 남은 곳을 알려 준다.',
    ],
    cs: ['사건', '서랍 속 사건'],
    th: ['번호', '사건', '연도', '장소', '시간', '난이도'],
    groups: ['연습 사건', '미제 사건', '현행 사건'], practice: '연습',
    note: '별이 빨간 사건에는 잔혹한 묘사와 시신이 드러난 현장 사진이 나온다. 기록실의 「잔혹 표현」 단추로 끄면 사진은 가려지고 글은 건조한 판으로 바뀐다. 단서는 같다. 모든 사건은 실제 미제 사건의 모티프만 빌려 새로 지은 이야기이고, 인물·장소·기관은 모두 허구다.',
    sh: ['스크린숏', '화면'],
    cap: { interview: '목격자 탐문', room: '기록실', board: '행적표', scene: '메모로 깨진 진술, 마주 앉은 사람', with: '보고서의 「함께 엮인 사람」 칸' },
    cr: ['크레디트', '만든 방법'],
    credits: '그림은 AI로 만들고 사건 기록과 한 장씩 대조해 고쳤다. 목소리는 ElevenLabs, 효과음은 Freesound·Kenney의 CC0 녹음이다. 글과 코드는 AI의 도움을 받아 썼다.',
    foot: ['보도 자료 (영어)', 'itch.io', '소스 코드 (GitHub)'],
  },
  ja: {
    locale: 'ja_JP',
    title: '記録だけで解く無料ブラウザ推理ゲーム（全16事件） | Monologue Gaze',
    desc: 'ブラウザで遊べる無料の推理ゲーム。新聞、供述調書、手紙、録取記録だけを手がかりに、一世紀にわたる未解決事件12件と、捜査時計が進む現行事件3件を追う。',
    kicker: '無料ブラウザゲーム · 16事件 · 1888–2025',
    tag: '記録を読んで事件を解く推理ゲーム。',
    play: 'ブラウザで遊ぶ', itch: 'itch.io のページ',
    video: 'プレイ映像、1分',
    about: ['概要', '未解決事件の引き出し'],
    p: [
      'ソウル西部警察署 強行犯二係の新人刑事として、異動した先輩Mが引き出しに残していった未解決事件の記録を開く。百年以上さかのぼる事件だ。',
      '現場を歩き回ることはない。事件ごとに、その時代の記録が届く。1888年ロンドンの半ペニー新聞、1930年代京城の警察書類と電報、1971年ソウルの宿泊台帳、2006年の警察のパソコン、2023年のグループチャット。下線の引かれた言葉を押して手帳に書き留め、その言葉で記録を探したり、関係者に尋ねたりする。',
      '捜査報告書で犯人を選び、共犯や知っていて隠した者がいればその人も記し、主張ごとに証拠メモを添える。すべて正しければ事件は解決となる。未解決事件12件をすべて解決すると、Mが残した手紙を読める。',
    ],
    facts: [
      ['価格', '無料'],
      ['動作環境', 'ウェブブラウザ、ダウンロード不要（PC推奨、スマートフォンでも遊べる）'],
      ['事件', '16件 · 練習事件は約25分、ほかは1件35〜50分 · 合計約10時間'],
      ['言語', '韓国語（原文）、英語、日本語、中国語（簡体字）、ロシア語、ドイツ語'],
      ['音声', '韓国語の音声、全言語に字幕'],
      ['セーブ', '進行状況はこのブラウザに保存される'],
    ],
    feat: ['特徴', 'やること'],
    features: [
      'その時代の記録を読む。新聞、供述調書、手紙、電報、宿泊台帳、録取記録、昔の個人ホームページ、メッセンジャー。',
      '言葉を手帳に書き留め、その言葉で探す。まだ見つけていない言葉は最後まで打ち込まないと出てこないので、先回りはできない。',
      '関係者に聞き込みをする。相手にはそれぞれ描かれた顔がある。話と食い違うメモを突きつけると話が変わり、見当違いのメモを重ねると口を閉ざす。メモで証言が崩れると、机の向こうに座るその人の姿が映る。',
      '行動表には、その日だれがどこにいたと言ったかと、記録に残ったことが時刻ごとに並ぶ。',
      '手帳の最初のページにある「疑問」は、見つけたぶんだけ空欄が埋まっていく。',
      '時代ごとに捜査の道具がある。筆跡・足跡・声紋の鑑定、車両・電話番号の照会、現場写真の精査、暗号解読、事件の再構成。',
      '現行事件3件（2021〜2024年）は捜査時計が進む。令状や資料を請求し、却下されることもあり、期限内に終えなければならない。',
      '難易度は★3から★5まで。星が多いほど、報告書が間違っていたときに教えてくれることが減る。',
      '行き詰まったら、手帳の「行き詰まったら見直す」で、まだやることが残っている場所がわかる。',
    ],
    cs: ['事件', '引き出しの中身'],
    th: ['番号', '事件', '年', '場所', '所要時間', '難易度'],
    groups: ['練習事件', '未解決事件', '現行事件'], practice: '練習',
    note: '赤い星の事件には残酷な描写と、遺体が写った現場写真が出てくる。記録室の「残酷表現」ボタンでオフにすると、写真は隠され、文章は抑えた版に変わる。手がかりは同じ。すべての事件は実在の未解決事件のモチーフだけを借りた創作で、人物・場所・機関はすべて架空のもの。',
    sh: ['スクリーンショット', '画面'],
    cap: { interview: '目撃者への聞き込み', room: '記録室', board: '行動表', scene: 'メモで崩れた証言、向かいに座る相手', with: '報告書の「共に関わった者」欄' },
    cr: ['クレジット', '制作について'],
    credits: '画像はAIで生成し、事件の記録と一枚ずつ照らし合わせて直した。音声はElevenLabs、効果音はFreesoundとKenneyのCC0録音。文章とコードはAIの助けを借りて書いた。',
    foot: ['プレスキット（英語）', 'itch.io', 'ソースコード（GitHub）'],
  },
  zh: {
    locale: 'zh_CN',
    title: '只凭档案破案的免费浏览器推理游戏（16起案件） | Monologue Gaze',
    desc: '可在浏览器中免费游玩的推理游戏。只凭报纸、口供、信件和笔录，追查横跨一个世纪的12起悬案，以及侦查时钟不停走动的3起现案。',
    kicker: '免费浏览器游戏 · 16起案件 · 1888–2025',
    tag: '一款靠阅读档案破案的推理游戏。',
    play: '在浏览器中开始', itch: 'itch.io 页面',
    video: '游戏实录，1分钟',
    about: ['简介', '一抽屉悬案'],
    p: [
      '你是首尔西部警察署重案二组的新人刑警。调走的前辈M把一抽屉悬案档案的钥匙留给了你，最早的案子要追溯到一百多年前。',
      '不用四处走动。每起案件都以那个年代的档案呈现：1888年伦敦的半便士小报、1930年代京城的警察文书和电报、1971年首尔的住宿登记簿、2006年的警用电脑、2023年的群聊。点击带下划线的词记入笔记本，再用它检索档案，或去问相关的人。',
      '在调查报告里选出凶手，若有共犯或知情隐瞒的人也一并写上，并为每条主张附上证据笔记。全部正确才能结案。12起悬案全部结案后，可以读到M留下的信。',
    ],
    facts: [
      ['价格', '免费'],
      ['平台', '网页浏览器，无需下载（推荐电脑，手机也能玩）'],
      ['案件', '16起 · 练习案件约25分钟，其余每起35–50分钟 · 共约10小时'],
      ['语言', '韩语（原文）、英语、日语、简体中文、俄语、德语'],
      ['语音', '韩语配音，所有语言均有字幕'],
      ['存档', '进度保存在当前浏览器中'],
    ],
    feat: ['特色', '你要做的事'],
    features: [
      '阅读那个年代的档案：报纸、口供、信件、电报、住宿登记簿、笔录、旧个人主页和聊天记录。',
      '把词记进笔记本，再用它检索。还没找到的词必须完整输入才会出现，没法跳步。',
      '当面问询相关的人。每个人都有一张画出来的脸。拿出与其说法矛盾的笔记，说法就会改变；拿错几次笔记，对方就不再开口。笔记一旦戳破证词，画面就会切到坐在桌子对面的那个人。',
      '行踪表按时间把每个人自称当时在哪里，和档案里记下的内容并排列出。',
      '笔记本首页的「疑点」会随着你的发现一格格填满。',
      '每个年代都有自己的调查工具：笔迹、足迹、声纹比对，车辆和电话号码查询，现场照片细查，密码破译，案件重建。',
      '三起现案（2021–2024）有侦查时钟在走：申请搜查令和资料，可能被驳回，必须在期限内完成。',
      '难度从★3到★5。星越多，报告出错时给出的提示越少。',
      '卡住时，笔记本里的「卡住时盘点线索」会指出还有事可做的地方。',
    ],
    cs: ['案件', '抽屉里的案子'],
    th: ['编号', '案件', '年份', '地点', '时长', '难度'],
    groups: ['练习案件', '悬案', '现案'], practice: '练习',
    note: '红色星级的案件包含血腥描写和露出遗体的现场照片。用档案室里的「血腥内容」按钮关闭后，照片会被遮住，文字换成克制的版本，线索不变。所有案件都只借用真实悬案的母题，是全新的故事，人物、地点和机构均为虚构。',
    sh: ['截图', '画面'],
    cap: { interview: '问询目击者', room: '档案室', board: '行踪表', scene: '被笔记戳破的证词，坐在对面的人', with: '报告里的“一同牵涉的人”一栏' },
    cr: ['制作', '制作方式'],
    credits: '图像由AI生成，并逐张对照案件档案修改。语音来自ElevenLabs，音效是Freesound和Kenney的CC0录音。文字和代码在AI协助下写成。',
    foot: ['媒体资料（英文）', 'itch.io', '源代码（GitHub）'],
  },
  ru: {
    locale: 'ru_RU',
    title: 'Бесплатный браузерный детектив: 16 дел по документам | Monologue Gaze',
    desc: 'Бесплатный детектив в браузере. Двенадцать нераскрытых дел за целый век и три оперативных дела с жёстким сроком, всё по документам: газеты, показания, письма, протоколы.',
    kicker: 'Бесплатная браузерная игра · 16 дел · 1888–2025',
    tag: 'Детектив, в котором дела раскрывают чтением документов.',
    play: 'Играть в браузере', itch: 'Страница на itch.io',
    video: 'Как это выглядит в игре, 1 мин',
    about: ['Об игре', 'Ящик с нераскрытыми делами'],
    p: [
      'Вы только что пришли во 2-ю группу по тяжким преступлениям полицейского участка Сеул-Собу. После перевода M в другой участок вам достаётся ключ от ящика стола с нераскрытыми делами, самым старым из которых больше ста лет.',
      'Ходить никуда не нужно. Каждое дело приходит в виде документов своего времени: грошовая газета Лондона 1888 года, полицейские бумаги и телеграммы Кёнсона 1930-х, книга постояльцев Сеула 1971 года, полицейский компьютер 2006 года, групповой чат 2023 года. Нажмите на подчёркнутое слово, чтобы записать его в блокнот, а потом ищите по нему в архивах или спрашивайте о нём людей.',
      'В рапорте о расследовании вы называете виновного, отмечаете соучастников и тех, кто знал и скрыл, и прикладываете к каждому утверждению заметку-доказательство. Дело закрывается, только когда всё верно. Когда закрыты все двенадцать нераскрытых дел, можно прочитать письмо от M.',
    ],
    facts: [
      ['Цена', 'Бесплатно'],
      ['Платформа', 'Веб-браузер, без загрузки (лучше на компьютере, телефон тоже подойдёт)'],
      ['Дела', '16 · учебное дело около 25 минут, остальные по 35–50 минут · всего около 10 часов'],
      ['Языки', 'корейский (оригинал), английский, японский, китайский (упрощённый), русский, немецкий'],
      ['Озвучка', 'корейские голоса, субтитры на всех языках'],
      ['Сохранения', 'прогресс хранится в этом браузере'],
    ],
    feat: ['Особенности', 'Что вы делаете'],
    features: [
      'Читаете документы эпохи: газеты, показания, письма, телеграммы, книги постояльцев, протоколы, старые личные страницы и переписку в мессенджере.',
      'Записываете слова в блокнот и ищете по ним. Слово, которое вы ещё не нашли, нужно набрать целиком, поэтому забежать вперёд не получится.',
      'Опрашиваете людей лично. У каждого своё нарисованное лицо. Предъявите заметку, которая противоречит их словам, и рассказ изменится. После нескольких неверных заметок человек замолчит. Когда заметка разбивает показания, вы видите этого человека напротив, за столом для допроса.',
      'Таблица передвижений по часам ставит рядом то, где люди, по их словам, были, и то, что зафиксировали документы.',
      'Вопросы на первой странице блокнота заполняются по мере того, как вы что-то находите.',
      'В каждой эпохе свои инструменты: сравнение почерка, следов и голосов, проверка машин и телефонных номеров, изучение снимков с места, расшифровка, восстановление хода событий.',
      'Три оперативных дела (2021–2024) идут по часам: вы запрашиваете ордера и сведения, часть запросов отклоняют, а уложиться нужно в срок.',
      'Сложность от ★3 до ★5. Чем больше звёзд, тем меньше подсказок, когда рапорт неверен.',
      'Если застряли, строка «Застряли? Что осталось» в блокноте покажет, где ещё есть что делать.',
    ],
    cs: ['Дела', 'Содержимое ящика'],
    th: ['№', 'Дело', 'Год', 'Место', 'Время', 'Сложность'],
    groups: ['Учебное дело', 'Нераскрытые дела', 'Оперативные дела'], practice: 'учебное',
    note: 'Дела с красными звёздами содержат жестокие описания и снимки с места преступления, на которых видны тела. Переключатель «Жестокие сцены» в архиве скрывает снимки и заменяет текст сдержанной версией с теми же уликами. Все дела — новые истории, которые берут у реальных нераскрытых дел только мотивы; все люди, места и организации вымышлены.',
    sh: ['Скриншоты', 'Экран'],
    cap: { interview: 'Опрос свидетеля', room: 'Архив', board: 'Таблица передвижений', scene: 'Показания рушатся — человек напротив', with: 'Рапорт: графа «Причастные»' },
    cr: ['Создание', 'Как это сделано'],
    credits: 'Изображения созданы с помощью ИИ и сверены с материалами дел по одному. Голоса: ElevenLabs. Звуковые эффекты: записи CC0 с Freesound и Kenney. Текст и код написаны с помощью ИИ.',
    foot: ['Пресс-кит (англ.)', 'itch.io', 'Исходный код (GitHub)'],
  },
  de: {
    locale: 'de_DE',
    title: 'Gratis-Detektivspiel im Browser: 16 Fälle aus Akten | Monologue Gaze',
    desc: 'Kostenloses Detektivspiel im Browser. Zwölf ungelöste Fälle aus einem Jahrhundert und drei Echtzeitfälle auf der Uhr, nur anhand von Akten: Zeitungen, Aussagen, Briefe, Protokolle.',
    kicker: 'Kostenloses Browserspiel · 16 Fälle · 1888–2025',
    tag: 'Ein Detektivspiel, in dem Sie Fälle lösen, indem Sie die Akten lesen.',
    play: 'Im Browser spielen', itch: 'Seite auf itch.io',
    video: 'Spielszenen, 1 Min.',
    about: ['Über das Spiel', 'Eine Schublade voller ungelöster Fälle'],
    p: [
      'Sie sind neu im Team 2 des Gewaltdezernats im Polizeirevier Seoul-Seobu. M, schon länger im Team, ist versetzt worden und hat Ihnen den Schlüssel zu einer Schreibtischschublade mit ungelösten Fällen hinterlassen, die mehr als hundert Jahre zurückreichen.',
      'Herumlaufen müssen Sie nicht. Jeder Fall kommt als Akten seiner Zeit: ein Halfpenny-Blatt im London von 1888, Polizeipapiere und Telegramme aus dem Gyeongseong der 1930er, ein Gästebuch im Seoul von 1971, ein Polizei-PC von 2006, ein Gruppenchat von 2023. Klicken Sie ein unterstrichenes Wort an, um es ins Notizbuch zu schreiben, und suchen Sie damit in den Archiven oder fragen Sie die Beteiligten danach.',
      'Im Ermittlungsbericht benennen Sie den Täter, vermerken Mittäter und Mitwisser, die es vertuscht haben, und belegen jede Behauptung mit einer Beweisnotiz. Der Fall ist erst gelöst, wenn alles stimmt. Sind alle zwölf ungelösten Fälle abgeschlossen, können Sie den Brief von M lesen.',
    ],
    facts: [
      ['Preis', 'Kostenlos'],
      ['Plattform', 'Webbrowser, kein Download (am besten am Computer, das Handy geht auch)'],
      ['Fälle', '16 · ein Übungsfall von etwa 25 Min., die übrigen je 35–50 Min. · insgesamt etwa 10 Stunden'],
      ['Sprachen', 'Koreanisch (Original), Englisch, Japanisch, Chinesisch (vereinfacht), Russisch, Deutsch'],
      ['Stimmen', 'koreanische Sprachausgabe, Untertitel in allen Sprachen'],
      ['Speichern', 'der Fortschritt bleibt in diesem Browser'],
    ],
    feat: ['Merkmale', 'Was Sie tun'],
    features: [
      'Akten der jeweiligen Zeit lesen: Zeitungen, Aussagen, Briefe, Telegramme, Gästebücher, Protokolle, alte private Homepages und Messenger-Verläufe.',
      'Wörter ins Notizbuch schreiben und damit suchen. Ein Wort, das Sie noch nicht gefunden haben, müssen Sie vollständig eintippen, Vorgreifen ist also nicht möglich.',
      'Die Beteiligten persönlich befragen. Jede Person hat ein gemaltes Gesicht. Halten Sie eine Notiz vor, die einer Aussage widerspricht, und die Geschichte ändert sich. Nach mehreren falschen Notizen schweigt die Person. Bricht eine Notiz eine Aussage, sitzt Ihnen die Person am Vernehmungstisch gegenüber.',
      'Die Aufenthaltstafel stellt Stunde für Stunde nebeneinander, wo jemand nach eigener Aussage war und was die Akten festhalten.',
      'Die Fragen auf der ersten Seite des Notizbuchs füllen sich mit dem, was Sie finden.',
      'Die Werkzeuge jeder Epoche nutzen: Handschrift-, Fußabdruck- und Stimmvergleich, Fahrzeug- und Telefonabfragen, genaue Prüfung von Tatortfotos, Entschlüsselung, Rekonstruktion des Ablaufs.',
      'Drei Echtzeitfälle (2021–2024) haben eine Ermittlungsuhr: Sie beantragen Beschlüsse und Unterlagen, manches wird abgelehnt, und Sie müssen vor Fristende fertig sein.',
      'Schwierigkeit von ★3 bis ★5. Je mehr Sterne, desto weniger verrät Ihnen das Spiel, wenn der Bericht falsch ist.',
      'Wenn Sie festsitzen, zeigt die Zeile „Festgefahren? Nachsehen“ im Notizbuch, wo noch etwas zu tun ist.',
    ],
    cs: ['Fälle', 'Die Schublade'],
    th: ['Nr.', 'Fall', 'Jahr', 'Ort', 'Dauer', 'Schwierigkeit'],
    groups: ['Übungsfall', 'Ungelöste Fälle', 'Echtzeitfälle'], practice: 'Übung',
    note: 'Fälle mit roten Sternen enthalten drastische Beschreibungen und Tatortfotos, auf denen Leichen zu sehen sind. Der Schalter „Drastische Inhalte“ im Archiv deckt die Fotos ab und ersetzt den Text durch eine zurückhaltende Fassung mit denselben Hinweisen. Alle Fälle sind neue Geschichten, die von echten ungelösten Fällen nur Motive leihen; alle Personen, Orte und Einrichtungen sind erfunden.',
    sh: ['Screenshots', 'Bilder'],
    cap: { interview: 'Befragung eines Zeugen', room: 'Das Archiv', board: 'Die Aufenthaltstafel', scene: 'Eine Aussage bricht am Vernehmungstisch', with: 'Der Bericht: weitere Beteiligte' },
    cr: ['Mitwirkende', 'Wie es gemacht wurde'],
    credits: 'Die Bilder wurden mit KI erzeugt und einzeln mit den Fallakten abgeglichen. Stimmen: ElevenLabs. Geräusche: CC0-Aufnahmen von Freesound und Kenney. Text und Code entstanden mit Unterstützung von KI.',
    foot: ['Pressemappe (Englisch)', 'itch.io', 'Quellcode (GitHub)'],
  },
};

/* 스크린숏: press/media 의 그림 (사건 번호가 있는 것은 그 사건의 연도 · 장소를 그대로 붙인다) */
const SHOTS = [
  ['01-london-1888.jpg', 'c01'], ['02-gyeongseong-1935.jpg', 'c03'], ['06-tokyo-1968.jpg', 'c04'], ['03-seoul-1971.jpg', 'c07'],
  ['04-euncheon-2006.jpg', 'c09'], ['05-live-2023.jpg', 'c13'], ['10-across-the-table-1888.jpg', 'scene'], ['08-interview-room-1888.jpg', 'interview'], ['09-whereabouts-board-c05.jpg', 'board'],
  ['11-others-involved.jpg', 'with'], ['00-records-room.jpg', 'room'],
];
const VIDEO = {}; // 언어별 영상이 생기면 여기에 (지금은 영어 화면 하나)

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = l => `${SITE}${l}/`;
const FONT = {
  ko: 'Nanum+Myeongjo:wght@400;700', ja: 'Noto+Serif+JP:wght@400;600', zh: 'Noto+Serif+SC:wght@400;600',
};
const BODYFONT = { ko: '"Nanum Myeongjo", ', ja: '"Noto Serif JP", ', zh: '"Noto Serif SC", ' };

function caseRows(l, t) {
  const grp = c => (c.kind === 'tutorial' ? 0 : c.live ? 2 : 1);
  let out = '', last = -1;
  for (const c of [...cases].sort((a, b) => grp(a) - grp(b) || a.no - b.no)) {
    const g = grp(c);
    if (g !== last) { out += `<tr class="group"><td colspan="5">${esc(t.groups[g])}</td></tr>\n`; last = g; }
    const stars = c.stars ? `<span class="stars${c.graphic ? ' red' : ''}" aria-label="${c.stars}/5">${'★'.repeat(c.stars)}</span>` : `<span class="stars">${esc(t.practice)}</span>`;
    out += `<tr><td class="no">${String(c.no).padStart(2, '0')}</td><td><a class="case" href="../?lang=${l}&amp;case=${c.id}">${esc(tr(l, c.id, c.title))}</a><span class="line">${esc(tr(l, c.id, (c.mood || {}).line || ''))}</span></td>`
      + `<td class="yr">${esc(c.year)}</td><td>${esc(tr(l, c.id, c.place))}<span class="len">${esc(tr(l, c.id, c.length))}</span></td><td>${stars}</td></tr>\n`;
  }
  return out;
}

function shotHtml(l, t) {
  const by = Object.fromEntries(cases.map(c => [c.id, c]));
  return SHOTS.map(([f, k]) => {
    const c = by[k];
    const cap = c ? `CASE ${String(c.no).padStart(2, '0')} · ${c.year} · ${tr(l, c.id, c.place)}` : t.cap[k];
    return `<a href="../press/media/${f}"><img src="../press/media/${f}" alt="${esc(cap)}" width="1280" height="760" loading="lazy" decoding="async"><span>${esc(cap)}</span></a>`;
  }).join('\n');
}

function page(l) {
  const t = L[l];
  const alt = LANGS.map(x => `<link rel="alternate" hreflang="${HREFLANG[x]}" href="${url(x)}">`).join('\n')
    + `\n<link rel="alternate" hreflang="x-default" href="${url('en')}">`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'VideoGame', name: 'Monologue Gaze', url: url(l), inLanguage: HREFLANG[l],
    description: t.desc, genre: ['Detective', 'Mystery', 'Puzzle'], gamePlatform: 'Web browser', applicationCategory: 'Game',
    operatingSystem: 'Any', playMode: 'SinglePlayer', author: { '@type': 'Person', name: 'jysvai' },
    image: `${SITE}img/og.jpg`, screenshot: SHOTS.slice(0, 6).map(([f]) => `${SITE}press/media/${f}`),
    sameAs: [ITCH, GIT, SITE], offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    availableLanguage: ['ko', 'en', 'ja', 'zh-Hans', 'ru', 'de'],
  };
  const video = VIDEO[l] || 'gameplay-en.mp4';
  const fonts = 'family=Special+Elite&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500' + (FONT[l] ? '&family=' + FONT[l] : '');
  return `<!doctype html>
<!-- 자동 생성: node tools/landing.js — 이 파일을 직접 고치지 말고 tools/landing.js 를 고친다 -->
<html lang="${HREFLANG[l]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${esc(t.desc)}">
<link rel="canonical" href="${url(l)}">
${alt}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Monologue Gaze">
<meta property="og:locale" content="${t.locale}">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:url" content="${url(l)}">
<meta property="og:image" content="${SITE}img/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Monologue Gaze">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#20150e">
<link rel="icon" href="../icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}&display=swap">
<link rel="stylesheet" href="../press/landing.css">
<style>body { font-family: ${BODYFONT[l] || ''}"Crimson Pro", Georgia, serif; }</style>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
</head>
<body>
<div class="wrap">
<header>
<p class="kicker">${esc(t.kicker)}</p>
<h1>Monologue Gaze</h1>
<p class="tag">${esc(t.tag)}</p>
<p class="cta"><a class="btn" href="../?lang=${l}">${esc(t.play)}</a> <a class="btn ghost" href="${ITCH}">${esc(t.itch)}</a></p>
<p class="langs">${LANGS.map(x => (x === l ? `<b>${NAMES[x]}</b>` : `<a href="../${x}/" hreflang="${HREFLANG[x]}" lang="${HREFLANG[x]}">${NAMES[x]}</a>`)).join(' · ')}</p>
</header>

<figure class="reel">
<video src="../press/media/${video}" poster="../press/media/gameplay-en-poster.jpg" controls playsinline preload="none" width="1280" height="760"></video>
<figcaption>${esc(t.video)}</figcaption>
</figure>

<section class="sheet">
<h2><small>${esc(t.about[0])}</small>${esc(t.about[1])}</h2>
<div class="cols">
<div class="prose">${t.p.map(x => `<p>${esc(x)}</p>`).join('\n')}</div>
<dl class="facts">${t.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
</div>
</section>

<section class="sheet">
<h2><small>${esc(t.feat[0])}</small>${esc(t.feat[1])}</h2>
<ul class="feat">${t.features.map(x => `<li>${esc(x)}</li>`).join('\n')}</ul>
</section>

<section class="sheet">
<h2><small>${esc(t.cs[0])}</small>${esc(t.cs[1])}</h2>
<div class="tablewrap"><table>
<thead><tr><th>${esc(t.th[0])}</th><th>${esc(t.th[1])}</th><th>${esc(t.th[2])}</th><th>${esc(t.th[3])} · ${esc(t.th[4])}</th><th>${esc(t.th[5])}</th></tr></thead>
<tbody>
${caseRows(l, t)}</tbody></table></div>
<p class="note">${esc(t.note)}</p>
</section>

<section class="sheet">
<h2><small>${esc(t.sh[0])}</small>${esc(t.sh[1])}</h2>
<div class="shots">
${shotHtml(l, t)}
</div>
</section>

<section class="sheet">
<h2><small>${esc(t.cr[0])}</small>${esc(t.cr[1])}</h2>
<p class="prose">${esc(t.credits)}</p>
</section>

<footer><a href="../press/">${esc(t.foot[0])}</a> · <a href="${ITCH}">${esc(t.foot[1])}</a> · <a href="${GIT}">${esc(t.foot[2])}</a></footer>
</div>
</body>
</html>
`;
}

/* sitemap.xml — 언어마다 서로를 가리키는 hreflang 묶음, 게임 첫 화면, 보도 자료 */
function sitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const alts = LANGS.map(x => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[x]}" href="${url(x)}"/>`).join('\n')
    + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en')}"/>`;
  const one = (loc, extra = '') => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${extra}  </url>\n`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 자동 생성: node tools/landing.js -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${LANGS.map(l => one(url(l), alts + '\n')).join('')}${one(SITE)}${one(SITE + 'press/')}</urlset>
`;
}

for (const l of LANGS) {
  fs.mkdirSync(path.join(root, l), { recursive: true });
  fs.writeFileSync(path.join(root, l, 'index.html'), page(l));
}
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap());
console.log(`소개 페이지 ${LANGS.length}장 (${LANGS.join(' ')}) · sitemap.xml · 사건 ${cases.length}건`);
