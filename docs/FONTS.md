# 글꼴 — 시대와 매체마다

글자는 그 기록이 **언제, 무엇으로** 만들어졌는지를 먼저 말한다. 1888년 경찰 조서가 코딩 글꼴이거나, 2006년 미니홈피가 2020년대 고딕이면 안 된다.
긴 본문은 읽기 편한 글꼴로 두고, 손글씨·픽셀·붓 글꼴은 제목·도장·짧은 줄·기계 화면에 쓴다.

## 어떻게 불리나

- **공통 여섯** (index.html, 늘 부른다): 나눔고딕 `--f-web` · 나눔고딕코딩 `--f-mono` · 나눔명조 `--f-doc` · 나눔손글씨 펜 `--f-hand` · 나눔손글씨 붓 `--f-hand2` · Special Elite `--f-type`. 기록실·수첩·보고서가 쓴다.
- **사건 글꼴**: `js/fonts.js` 의 키 `k` 는 CSS 변수 `--f-k`(css/base.css `:root`)와 짝이다. 사건 파일 어디든 `f-k` 가 나오면(css 의 `var(--f-k)`, 문서 cls 의 `f-k`) 또는 `fonts: ['k']` 가 있으면 그 사건을 열 때 부른다. Google 글꼴은 한 요청으로 묶이고, jsDelivr 글꼴은 따로 부른다.
- 변수마다 뒤에 대신 쓸 글꼴이 적혀 있어서, 부르지 않았거나 못 받아도 비슷한 글꼴로 나온다.
- 한국어 글꼴은 무겁다. Google 글꼴은 글자 조각(unicode-range)으로 쓰는 글자만 받는다. 갈무리는 쓰는 가족만(한 벌 약 500KB), 둥근모는 44KB 한 벌.

## 시대·매체 → 글꼴

| 시대 · 매체 | 변수 (키) | 글꼴 | 허락 · 출처 |
|---|---|---|---|
| 기록실·수첩·기본 서류 | `--f-web` `--f-mono` `--f-doc` `--f-hand` `--f-hand2` | 나눔고딕 · 나눔고딕코딩 · 나눔명조 · 나눔손글씨 펜/붓 | OFL · Google Fonts |
| 타자기 (폴더 꼬리표, 1960~90년대 타자 서류의 숫자·로마자) | `--f-type` | Special Elite (+한글은 나눔고딕코딩) | Apache 2.0 · Google Fonts |
| 옛 신문 본문 (1980년 전) | `--f-old` (old) | 송명 Song Myung | OFL · Google Fonts |
| 서양 활판 · 신문 날짜 줄 · 1945년 전 서류 머리 | `--f-latin` (latin) | Old Standard TT | OFL · Google Fonts |
| 독일·미국 신문 제호 | `--f-frak` (frak) | UnifrakturMaguntia | OFL · Google Fonts |
| 1945년 전 공문서·조서·감정서 본문 | `--f-batang` (batang) | 고운바탕 Gowun Batang | OFL · Google Fonts |
| 한자 받침 (명조 줄 끝자리) | `--f-hanja` (hanja) | Noto Serif KR | OFL · Google Fonts |
| 일본 활자 1970년대 뒤 (1994 도장·머리 줄) | `--f-jp` (jp) | Noto Serif JP | OFL · Google Fonts |
| 쇼와 시대 일본 명조 (1930~60년대 머리 줄) | `--f-showa` (showa) | New Tegomin | OFL · Google Fonts |
| 신문 제호 붓글씨 (한자·가나) | `--f-fude` (fude) | Yuji Boku | OFL · Google Fonts |
| 전보 가타카나 (타전기) | `--f-kana` (kana) | M PLUS 1 Code | OFL · Google Fonts |
| 1980~90년대 신문 제호 · 전단 제목 | `--f-bhs` (bhs) | 검은고딕 Black Han Sans | OFL · Google Fonts |
| 1980~90년대 도스·워드프로세서 화면, 삐삐 음성사서함 안내 | `--f-dos` (dos) | Neo둥근모 NeoDunggeunmo — **16px 배수** | OFL · jsDelivr `gh/neodgm/neodgm-webfont@1.601` |
| 1990년대 도트 프린터 출력 | `--f-dotprint` (dotprint) | 갈무리 모노11 GalmuriMono11 — **12px** | OFL · jsDelivr `npm/galmuri@2.40.3` |
| 2000년대 굴림 비트맵 화면(윈도 XP), 폴더폰 문자, 미니홈피 본문 | `--f-pixel` (pixel) | 갈무리11 Galmuri11 — **12px** | OFL · jsDelivr `npm/galmuri@2.40.3` |
| 2000년대 미니홈피 글꼴 아이템 (제목) | `--f-gamja` (gamja) | 감자꽃 Gamja Flower | OFL · Google Fonts |
| 2010~20년대 윈도·안드로이드·경찰 전산 · 엑셀 · PC 메신저 (맑은 고딕 결) | `--f-sys` (sys) | Noto Sans KR | OFL · Google Fonts |
| 2020년대 웹·앱 (노트북 화면 기본) | `--f-ui` (ui) | Pretendard (가변, 동적 조각) | OFL · jsDelivr `npm/pretendard@1.3.9` |
| 2020년대 스마트폰 메신저 · 알림 | `--f-phone` (phone) | Pretendard | OFL · 위와 같음 |

**쓴 사람마다 다른 필체** (문서 `cls: 'f-키 ink-색'`, css/skins.css): `f-yeon` 연성 · `f-dokdo` 독도 · `f-gaegu` 개구 · `f-dohyeon` 도현(자로 그은 듯한 협박장) · `f-melody` 하이멜로디 · `f-poor` 서툰이야기 · `f-eastsea` 동해독도(굵은 사인펜) · `f-single` 싱글데이 · `f-cute` 귀여운 · `f-gamja` 감자꽃 · `f-pen` 나눔펜 · `f-old` 송명 · `typed` 타자. 모두 OFL · Google Fonts.
잉크: `ink-red` `ink-purple` `ink-blue` `ink-navy` `ink-sepia` `ink-black` `ink-pencil`.

## 저절로 붙는 기본값

- **시대** (`.case-view[data-era]`, css/skins.css 맨 아래): 1945년 전 사건은 조서·감정서·물품 카드 본문이 고운바탕, 머리 줄·표 머리가 활판 로마자 (`fonts: ['batang']` 을 적는다). 1980년 뒤 신문은 본문·제목·날짜 줄이 나눔명조.
- **화면** (`data-frame`, css/base.css): 노트북 화면 안에서는 `--f-web` 이 `--f-ui`(Pretendard)로 바뀐다 — 화면 속 목록·탭·웹·메신저·양식이 모두 따라온다 (`fonts: ['ui']`). 수첩·꼬리표는 화면 밖이라 그대로. 다른 시대 노트북은 `[data-case="cNN"][data-frame="laptop"] .screen{--f-web:var(--f-sys)}` 처럼 다시 바꾼다 (c10). 종이 기록철은 목록 제목이 명조, 날짜가 타자.
- **스킨**: `sms`(폴더폰)와 `home`(미니홈피)은 갈무리 비트맵이 기본이다 (`fonts: ['pixel']`, 미니홈피는 `'gamja'` 도).
- 신문·조서·카드·감정서·녹취록·전보 속 표와 사진 설명은 그 서류의 본문 활자를 따른다.

## 사건별 (c00~c12)

| 사건 | 바꾼 것 |
|---|---|
| c00 2025 서울 · 노트북 | 화면 전체 Pretendard (`fonts: ['ui']`) |
| c01 1888 런던 | 조서·필적 감정 본문 고운바탕, 날짜 줄·표 머리 Old Standard, 편지는 사람마다 필체(그대로) |
| c02 1923 바이에른 | 조서·물품 카드 본문 고운바탕, 문서 머리 Old Standard, 주보 제호 Fraktur(그대로) |
| c03 1935 경성 | 제호 靑丘日報 붓글씨(Yuji Boku — 송명에 없던 丘·報 가 다른 글꼴로 섞이던 것도 고침), 날짜 줄 쇼와 명조, 전보 가타카나 M PLUS 1 Code, 조서 고운바탕, 한자 받침 |
| c04 1968 도쿄 | 제호 붓글씨, 머리 줄 쇼와 명조, 조서·유류품 카드 본문 명조(화문 타자), 전보 가타카나, 도장 Noto Serif JP |
| c05 1968~69 캘리포니아 | 경찰 조서·녹취 본문 숫자·로마자를 타자기로 |
| c06 1969 노르웨이 | 조서·물품 카드 숫자·로마자 타자기 |
| c07 1971 서울 | 조서 숫자 타자기, 한자 받침 |
| c08 1991 서울 | 신문 본문 요즘 명조, 음성사서함 안내 줄·전화기 액정 둥근모, 전단 제목 검은고딕, 조서 숫자 타자기 |
| c09 2006 서울 · 모니터 | 탭·목록·검색·시계·전산 출력·지도 카드 갈무리11 12px(윈도 XP 굴림), 미니홈피 갈무리+감자꽃, 문자 갈무리, 한글 문서(수사 경과) 나눔명조 |
| c10 2014 항구 · 노트북 | 화면 Noto Sans KR(윈도 7 맑은 고딕 결), 카페 글은 나눔고딕, 통신·차량 조회 표 Noto Sans KR |
| c11 1986 강변 | 신문 요즘 명조, 조서·조회 회보 숫자 타자기, 한자 받침 |
| c12 1994 도쿄 | 제호 붓글씨, 조서 본문 명조(워드프로세서 출력), 전산 조회 회신 도트 프린터(갈무리 모노), 압수 워드프로세서 문서·액정 둥근모 |

## 새 사건이 글꼴을 고르는 법 (c13~)

1. **매체부터** 정한다: 누가, 무엇으로 쓴 기록인가 — 손(필체), 타자기, 인쇄소, 도트 프린터, 굴림 화면, 스마트폰.
2. 위 표에서 변수를 고르고 사건에 `fonts: ['키', …]` 를 적는다. 2020년대 노트북 사건이면 `fonts: ['ui']` 만으로 화면이 Pretendard 가 된다. 경찰 전산·엑셀 표는 `--f-sys`, 스마트폰 메신저 모양을 따로 만들면 `--f-phone`.
3. 스킨 기본값과 다르게 할 곳만 `css` 에 적는다 — 글꼴 선언만, 선택자는 `[data-case="cNN"]` 로 시작:
   ```css
   [data-case="c13"] .doc.printed .b-tbl table{font-family:var(--f-sys)}
   [data-case="c13"] .skin-report:not(.rep-view) .doc-b{font-family:var(--f-doc)}  /* 보고서 양식(rep-view)은 빼 둔다 */
   ```
4. 편지·쪽지·수첩은 쓴 사람마다 `cls: 'f-키 ink-색'` 을 붙인다 (한 사건에 같은 필체를 두 사람이 쓰지 않게).
5. 픽셀 글꼴은 크기를 지킨다: 갈무리 12px(24px), 둥근모 16px(32px). 아니면 글자가 번진다.
6. 목록에 없는 글꼴을 더할 때: SIL OFL(또는 Apache) 로 웹 임베드가 허락된 것만. `js/fonts.js` 에 키를 더하고(다른 키의 앞부분이 되지 않는 이름), `:root` 에 `--f-키` 와 대신 쓸 글꼴을 적고, CSS 주소와 글꼴 파일 하나가 200 으로 오는지, 쓰는 한글(과 한자·가나)이 다 들어 있는지 확인한다.
