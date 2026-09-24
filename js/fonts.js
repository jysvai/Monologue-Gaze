/* Monologue Gaze — 사건마다 따로 부르는 글꼴 목록 (공통 글꼴은 index.html 이 부른다)
 * 키 k 는 CSS 변수 --f-k 와 짝이다. 사건 파일(css·본문 cls 등) 어디든 "f-k" 가 나오면, 그 사건을 열 때 이 글꼴을 부른다.
 * 사건에 fonts: ['k', …] 를 적어 직접 부를 수도 있다.
 * 값: 문자열 = Google Fonts family 인자 (여럿은 한 번에 묶어 부른다) · { css: '주소' } = 그 스타일시트를 그대로 부른다 (jsDelivr 등)
 * 모두 비상업 무료 배포가 허락된 글꼴만 쓴다 (OFL · 무료 배포 글꼴). */
window.MG = window.MG || {};
window.MG.fonts = {
  old: 'Song+Myung', latin: 'Old+Standard+TT:wght@400;700', frak: 'UnifrakturMaguntia', jp: 'Noto+Serif+JP:wght@700;900',
  yeon: 'Yeon+Sung', dokdo: 'Dokdo', gaegu: 'Gaegu:wght@400;700', dohyeon: 'Do+Hyeon', melody: 'Hi+Melody', bhs: 'Black+Han+Sans',
};
