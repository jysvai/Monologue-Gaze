/* Monologue Gaze — 사건마다 따로 부르는 글꼴 목록 (공통 글꼴은 index.html 이 부른다)
 * 키 k 는 CSS 변수 --f-k 와 짝이다 (css/base.css :root). 사건 파일(css·본문 cls 등) 어디든 "f-k" 가 나오면, 그 사건을 열 때 이 글꼴을 부른다.
 * 사건에 fonts: ['k', …] 를 적어 직접 부를 수도 있다 (css/skins.css 의 시대 기본값처럼 공용 css 가 쓰는 글꼴).
 * 값: 문자열 = Google Fonts family 인자 (여럿은 한 번에 묶어 부른다) · { css: '주소' } = 그 스타일시트를 그대로 부른다 (jsDelivr 등)
 * 키 이름은 다른 키의 앞부분이 되면 안 된다 ("f-jp" 는 "f-jpx" 안에도 들어 있어 둘 다 불린다).
 * 모두 비상업 웹 임베드가 허락된 글꼴만 쓴다 (SIL OFL 1.1). 시대·매체별 표와 출처: docs/FONTS.md */
window.MG = window.MG || {};
(function () {
  const PRETENDARD = 'https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
  const GALMURI = 'https://cdn.jsdelivr.net/npm/galmuri@2.40.3/dist/galmuri.css'; // @font-face 만 적힌 3KB. 쓰는 굵기·가족의 파일만 받는다
  const NEODGM = 'https://cdn.jsdelivr.net/gh/neodgm/neodgm-webfont@1.601/neodgm/style.css'; // 44KB 한 벌 (조합형이라 가볍다)
  window.MG.fonts = {
    // 옛 인쇄 · 외국 활자
    old: 'Song+Myung', latin: 'Old+Standard+TT:wght@400;700', frak: 'UnifrakturMaguntia', jp: 'Noto+Serif+JP:wght@400;700',
    batang: 'Gowun+Batang:wght@400;700',  // 1945년 전 공문서·조서 본문
    hanja: 'Noto+Serif+KR:wght@400;700',  // 한자 받침 — 명조 줄 끝자리. 한글은 앞 글꼴이 쓰므로 한자 조각만 받는다
    showa: 'New+Tegomin',                 // 쇼와 시대 일본 명조 (1930~60년대)
    fude: 'Yuji+Boku',                    // 신문 제호 붓글씨
    kana: 'M+PLUS+1+Code',               // 전보 가타카나
    // 기계 글자 · 화면
    dos: { css: NEODGM },                 // 1980~90년대 도스·워드프로세서 화면
    dotprint: { css: GALMURI },           // 1990년대 도트 프린터 출력 (갈무리 모노11)
    pixel: { css: GALMURI },              // 2000년대 굴림 비트맵 · 폴더폰 · 삐삐 액정 (갈무리11)
    sys: 'Noto+Sans+KR:wght@400;500;700', // 2010~20년대 윈도·안드로이드·경찰 전산 (맑은 고딕 결)
    ui: { css: PRETENDARD },              // 2020년대 웹·앱
    phone: { css: PRETENDARD },           // 2020년대 스마트폰 메신저
    // 쓴 사람마다 다른 필체 (문서 cls 'f-키') · 표지 글자
    yeon: 'Yeon+Sung', dokdo: 'Dokdo', gaegu: 'Gaegu:wght@400;700', dohyeon: 'Do+Hyeon', melody: 'Hi+Melody', bhs: 'Black+Han+Sans',
    poor: 'Poor+Story', eastsea: 'East+Sea+Dokdo', single: 'Single+Day', cute: 'Cute+Font', gamja: 'Gamja+Flower',
  };
})();
