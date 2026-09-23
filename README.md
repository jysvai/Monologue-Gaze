# Monologue Gaze

> 기록은 혼잣말을 한다. 들어주는 건 당신이다.

한 세기에 걸친 미제 사건 열 건을 **기록만으로** 쫓는 웹 추리 게임.
플레이어는 서울서부경찰서 강력2팀의 신입 형사가 되어, 전임자 M이 남긴 서랍 속 사건 파일을 연다.
직접 걸어 다니지 않는다. 그 시대의 신문, 진술서, 편지, 숙박부, 녹취록, 미니홈피, 메신저를 뒤지고
수첩에 적은 단어로 다음 기록을 찾아 들어간다.

- **CASE 00** 청운하이츠 504호 (2025, 튜토리얼)
- **CASE 01–10** 1888 런던 · 1922 바이에른 · 1930년대 경성 · 1968 도쿄 · 1969 미국 서부 · 1970 노르웨이 · 1970 서울 · 1991 서울 · 2006 서울 · 2014 항구도시

모든 사건은 실제 미제 사건의 **모티프만** 빌려 새로 지은 이야기다. 인물·장소·기관·사이트는 전부 허구다.

## 플레이

빌드 과정 없는 정적 사이트다.

- 로컬: `index.html` 을 브라우저로 연다. 파일로 바로 열어도 되고, `npx serve .` 같은 정적 서버로 띄워도 된다.
- GitHub Pages: 저장소 Settings → Pages → Branch `main` / root 로 켜면 그 주소에서 바로 플레이할 수 있다.

진행 상황은 브라우저의 localStorage 에 저장된다.

## 조사하는 법

1. 문서 속 점선 밑줄 단어를 누르면 **수첩에 적힌다**. 수첩의 단어로 자료실을 검색하고, 사람을 찾아가 물어본다.
2. 문장·표의 행·말풍선 옆 ✎ 를 누르면 **메모**가 된다. 어떤 메모가 증거가 될지는 알려 주지 않는다.
3. **수사 보고서**에 범인(수첩의 인물)과, 주장마다 증거가 될 메모를 붙여 제출한다. 전부 맞아야 사건이 종결된다.

## 구조

```
index.html            게임 페이지 (스크립트 로드 순서가 곧 사건 목록)
js/engine.js          엔진 — 기록실, 조사 도구, 수첩, 보고서 판정, 저장
js/finale.js          열 건 종결 뒤 나오는 M의 편지
css/base.css          책상·기록실·화면 틀(papers / crt / laptop)·수첩
css/skins.css         문서 스킨 (신문, 진술조서, 편지, 전보, 장부, 녹취록, 미니홈피, 폴더폰 …)
cases/cNN-*.js        사건 데이터 (사건 하나 = 파일 하나)
img/manifest.js       실제 이미지 목록 (자동 생성)
img/<사건>/<키>.webp  AI 로 만든 이미지를 넣는 곳
docs/CASE_AUTHORING.md  사건 작성 가이드 (데이터 형식 전부)
docs/IMAGE_PROMPTS.md   이미지 프롬프트 모음 (자동 생성)
tools/validate.js     사건 검사기 — 형식 + "처음 단서에서 정답 증거까지 실제로 따라갈 수 있는가"
tools/prompts.js      사건 파일의 프롬프트를 모아 docs/IMAGE_PROMPTS.md 생성
tools/manifest.js     img/ 폴더를 훑어 img/manifest.js 생성
```

## 도구

```bash
node tools/validate.js            # 모든 사건 검사 (특정 파일만: node tools/validate.js cases/c01-london-1888.js)
node tools/prompts.js             # docs/IMAGE_PROMPTS.md 다시 만들기
node tools/manifest.js            # img/ 에 넣은 이미지를 게임에 연결
```

## 이미지 넣기

1. `docs/IMAGE_PROMPTS.md` 의 프롬프트로 이미지를 만든다 (사건별 공통 스타일 문단을 뒤에 붙이면 그림체가 맞는다).
2. 표에 적힌 경로, 예: `img/c01/cover.webp` 로 저장한다 (`.png`/`.jpg` 도 됨).
3. `node tools/manifest.js` 실행. 없는 이미지는 SVG 임시 그림으로 남는다.

## 사건 추가

`docs/CASE_AUTHORING.md` 를 읽고 `cases/` 에 파일을 만든 뒤 `index.html` 에 `<script>` 한 줄을 추가한다. `node tools/validate.js` 가 PASS 해야 한다.
