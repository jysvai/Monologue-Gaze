# Monologue Gaze — 이미지 프롬프트 모음

> 이 파일은 `node tools/prompts.js` 로 자동 생성됩니다. 프롬프트를 고치려면 각 사건 파일(`cases/*.js`)의 `art` 항목을 고친 뒤 다시 생성하세요.
총 **165장**.


## 쓰는 법

1. 아래 프롬프트를 이미지 생성 AI(GPT 등)에 그대로 붙여 넣는다. 각 사건의 **공통 스타일** 문단을 프롬프트 뒤에 이어 붙이면 사건 안에서 그림체가 통일된다.
2. 받은 이미지를 표에 적힌 경로·이름으로 저장한다 (`img/<사건>/<키>.png`, `.jpg` 도 된다).
3. `node tools/optimize-images.js` 를 실행하면 webp 로 줄여 게임에 연결하고, 원본은 `img/_src/` 로 옮긴다. 없는 그림은 SVG 임시 그림으로 남는다.
4. 검수에서 걸린 그림은 `docs/IMAGE_REDO.md` 에 모인다 (사건 파일 `art` 의 `redo` 표시). 다시 뽑아 넣은 뒤 `redo` 를 지운다.

**모든 이미지 공통 원칙**: 실제 인물·실제 피해자의 얼굴을 닮게 만들지 않는다 / 보통 사건의 시신은 가리거나 암시만 / 혐오감 주의 사건은 범행 흔적(비산흔·낙하흔·닦아 낸 자국·피가 밴 포대와 봉투)을 진하게 보여 주고, 시신은 가려진 채 손·발·머리카락처럼 일부가 비치거나 삐져나온 정도까지 (절단면·장기·상처·죽은 사람의 얼굴은 없음) / 실제 상표·로고 없음 / 글자는 넣지 않는다 (신문 제목, 간판 글씨 등은 게임이 HTML 로 따로 쓴다). 글자가 꼭 필요해 보이는 자리는 "no readable text" 를 유지하고 흐릿한 형태만 둔다.

## 생성 규칙 v2 — CASE 03 부터 적용

CASE 00~02 를 실제로 뽑아 보고 보강한 규칙이다. 00~02 는 나중에 필요한 것만 다시 뽑는다.

1. 제목 줄의 설명과 **꼭 보여야 할 것** 이 그 그림의 단서다. 프롬프트의 다른 부분보다 우선한다. 개수(벽돌 네 장, 촛불 세 개)·색·위치를 정확히 지킨다.
2. 흑백 스타일 사건이라도, 프롬프트가 색을 말하는 증거물(붉은 실, 파란 가방 같은)은 그 색이 보여야 한다. 그 물건만 손으로 색칠한 듯 부분 채색하거나 바랜 컬러 사진으로 만든다. (01 의 붉은 무명실이 회색으로 나와 단서가 사라졌다.)
3. 정물·증거물 사진에는 창밖 거리, 걸어가는 사람 실루엣, 먼 도시 스카이라인을 넣지 않는다. 배경은 책상·증거물 판·벽처럼 단순하게. (01 에서 거의 모든 정물 뒤에 같은 창밖 풍경이 반복됐다.)
4. 숫자·날짜가 보이는 그림(달력, 시계, 번호판)은 프롬프트가 준 숫자만 쓴다. 프롬프트가 숫자를 말하지 않으면 숫자를 넣지 않는다. (02 의 달력이 본문의 26일 대신 7로 나왔다.)
5. 신문 제목·전단·쪽지·간판처럼 글자가 들어갈 자리는 뭉개진 회색 띠나 흐린 선으로만 둔다. 또렷한 가짜 한글·한자·가나는 한국·일본 플레이어 눈에 바로 엉터리로 보인다. (08 의 전단·신문·쪽지에서 엉터리 한글이 읽혔다.)
6. 한 장에 장면 하나. 작은 삽입 칸, 여러 칸 조합, 카탈로그식 칸 나누기는 프롬프트가 요구할 때만. (02 의 광고 삽화가 판화 + 사진 두 칸으로 나왔다.)
7. 모두 가상 지명이다. 실존 랜드마크(유명 성당 돔, 타워, 다리)는 프롬프트가 이름을 댈 때만 넣는다.
8. 한 사건 안에서 같은 장소·물건·인물이 여러 장에 나오면 같은 모습으로 맞춘다 (같은 방, 같은 가방 색, 같은 옷 실루엣).
9. 한 장 만들 때마다 위 규칙을 스스로 확인하고, 단서가 빠졌으면 한 번 다시 만든다.

- **추가 스타일** (CASE 03 부터, 공통 스타일 뒤에 이어 붙이기):
```
Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## 공통 이미지

### _global/hero — 기록실(첫 화면) 맨 위에 까는 대표 이미지
- 저장 경로: `img/_global/hero.webp` · 비율: 16:9 (1920×1080)
```
Overhead photograph of a cluttered detective's desk at night in a Korean police station, lit by a single warm desk lamp. An open wooden drawer full of old manila case folders tied with string, a yellowed ruled notebook with a fountain pen, scattered black-and-white photographs face down, a cold cup of instant coffee leaving a ring stain, a brass drawer key on a paper tag. Deep shadows at the edges, warm tungsten light in the center, film grain, muted brown and ochre palette, shot on 35mm film, shallow depth of field. No readable text, no people, no faces.
```

### _global/desk — 사건 화면 뒤에 까는 책상 질감 (반복 타일로 써도 됨)
- 저장 경로: `img/_global/desk.webp` · 비율: 1:1 (2048×2048), 이음매 없는 타일
```
Seamless tileable texture of a dark walnut wooden desk surface, worn varnish, faint scratches and coffee ring stains, seen from directly above, soft even lighting, very subtle, low contrast, dark brown. No objects, no text.
```

### _global/paper — 형사 수첩 종이 질감 (반복 타일)
- 저장 경로: `img/_global/paper.webp` · 비율: 1:1 (1024×1024), 이음매 없는 타일
```
Seamless tileable texture of aged yellowed notebook paper, subtle fibers, faint foxing spots, very light and even, warm cream-ochre tone, scanned flat. No lines, no text, no shadows.
```

### _global/warn — 잔혹한 사건 폴더 표지에 붙는 「혐오감 주의」 스티커의 바탕 (글자는 게임이 위에 올린다)
- 저장 경로: `img/_global/warn.webp` · 비율: 3:1 (600×200), 배경 투명 PNG 권장
```
A single blank rectangular warning sticker label, flat top-down scan, deep brick-red vinyl with a thin white inner border, slightly worn corners, a few fine scratches and a faint crease, subtle paper-tape residue at one edge, even lighting, isolated on a transparent background. Completely blank: no text, no letters, no symbols, no icons.
```

## CASE 00 · 청운하이츠 504호 (2025, 서울 서대문구 (가상))

- 사건 파일: `cases/c00-cheongun.js` · 이미지 9장
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Casual smartphone photo taken in 2025 Seoul, natural window light, slightly soft focus, subtle JPEG compression, warm muted colors, social-media snapshot feel. No faces, no readable text, no logos.
```

### c00/cover — 기록실 폴더 표지 — 증거물 꼬리표가 달린 노트북
- 저장 경로: `img/c00/cover.webp` · 비율: 4:3
```
Top-down photo of a closed silver laptop lying on a grey police evidence table, a yellow paper evidence tag tied to it with white string, a single white cat hair on the lid, cold fluorescent light, clinical and quiet mood.
```

### c00/cup — 서윤 계정의 10.11 "집콕" 게시물 사진
- 저장 경로: `img/c00/cup.webp` · 비율: 4:3
```
A cup of latte on a windowsill of a small Seoul studio apartment on a grey afternoon, a knitted blanket edge in the corner, cozy stay-home mood, shot from slightly above.
```

### c00/cat — 서윤 계정 — 키보드 위의 흰 고양이 "두부"
- 저장 경로: `img/c00/cat.webp` · 비율: 4:3
```
A fluffy white Korean shorthair cat lying across a laptop keyboard on a cluttered illustrator's desk, drawing tablet and pencils nearby, soft daylight, playful.
```

### c00/cake — 서윤 계정 — 3월 17일 생일 케이크 (비밀번호 단서)
- 저장 경로: `img/c00/cake.webp` · 비율: 4:3
```
A small strawberry birthday cake with three lit candles on a white table, a white cat's ear and paw peeking in from the edge of the frame, pink and cream tones, warm evening indoor light.
```

### c00/sketch — 서윤의 2024년 연필 스케치 「버스정류장 연작 #1」 (핵심 증거)
- 저장 경로: `img/c00/sketch.webp` · 비율: 4:3
```
Graphite pencil sketch on off-white drawing paper: a lonely bus stop shelter at night in the rain, a single figure holding an umbrella standing to the right of the shelter beside a round bus-stop sign, a small moon in the upper right, diagonal rain strokes, loose construction lines, tiny initials "SY" in the lower right corner.
```
- 주의: 이 그림과 award 는 반드시 같은 구도여야 한다. sketch 를 먼저 만들고, award 는 이 이미지를 참고 이미지로 넣어 "같은 구도로 채색" 요청할 것.

### c00/award — 재희의 공모전 대상작 〈푸른 정류장〉 — sketch 와 같은 구도의 채색본
- 저장 경로: `img/c00/award.webp` · 비율: 4:3
```
Polished digital painting with exactly the same composition as the reference pencil sketch: a bus stop shelter at night in the rain, a single figure with a yellow umbrella to the right beside a round bus-stop sign, a pale moon upper right. Deep blue night palette with warm yellow accents, soft glow, award-winning illustration. No signature.
```
- 주의: sketch 이미지를 참고 이미지로 넣을 것. 서명(SY)은 넣지 않는다.

### c00/bridge — 강도현 계정 — 10.9 밤 부산 광안리 사진 (알리바이)
- 저장 경로: `img/c00/bridge.webp` · 비율: 4:3
```
Night photo of a long illuminated suspension bridge over a dark sea seen from a sandy beach in Busan, city lights reflecting on the water, slightly tilted handheld shot, a little motion blur.
```

### c00/booth — 윤재희 계정 — 일러스트 페어 부스 사진
- 저장 경로: `img/c00/booth.webp` · 비율: 4:3
```
A small artist booth at a busy illustration fair in a large exhibition hall, a table covered with postcards and art prints, a blue night-scene print pinned on the back wall, a tablet on a stand used as a card reader, visitors blurred in the background.
```

### c00/doorbag — 배달앱 — 504호 문 앞에 놓인 배달봉지 (라이더 촬영)
- 저장 경로: `img/c00/doorbag.webp` · 비율: 4:3
```
Delivery rider's proof-of-delivery photo: a white plastic takeout bag with two soup containers left on the floor in front of a dark grey apartment door with a digital door lock, narrow officetel corridor, harsh flash, slightly crooked framing.
```

## CASE 01 · 화이트게이트의 편지 (1888, 런던 이스트엔드 화이트게이트 (가상 지명))

- 사건 파일: `cases/c01-london-1888.js` · 이미지 13장 · 난이도 ★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
19th-century British newspaper wood engraving, dense cross-hatched black ink on off-white newsprint, Victorian London East End c.1888: gas-lit fog, wet cobblestones, soot-dark brick. Evidence items are drawn like engraved catalogue plates with the same hatching. Figures only as silhouettes, from behind or with faces hidden in shadow. No faces, no blood, no wounds, no bodies, no readable text, no real brands.
```

### c01/cover — 기록실 폴더 표지 — 끈으로 묶인 붉은 잉크 편지 다발
- 저장 경로: `img/c01/cover.webp` · 비율: 4:3
```
A bundle of old handwritten letters in red ink, tied crosswise with coarse string, lying on a scarred wooden police desk beside a brass oil lamp and a police constable's whistle on a chain, a folded Victorian newspaper underneath, 1888 London, low warm lamplight, deep shadows, still life seen from slightly above. The handwriting is an illegible scrawl.
```

### c01/s_court — 호외 삽화 — 가스등이 꺼진 로프워크 코트 입구
- 저장 경로: `img/c01/s_court.webp` · 비율: 4:3
```
Night view into a narrow dead-end court off a London alley in 1888, seen through a low brick archway, a single cast-iron gas lamp at the far end unlit, wet cobblestones catching faint light from the street behind the viewer, drifting fog, tall soot-black brick walls with shuttered windows, empty of people.
```

### c01/s_tanners — 9월 17일 자 삽화 — 새벽의 태너스 야드
- 저장 경로: `img/c01/s_tanners.webp` · 비율: 4:3
```
Dawn in a cramped tannery yard in the Victorian East End, an empty two-wheeled carter's cart with its shafts resting on the ground, stacked hides under a lean-to roof, puddles, low grey sky, a lone carter seen from behind at a distance holding a lantern. Nothing on the ground.
```

### c01/s_candle — 10월 8일 자 삽화 — 캔들 마켓 뒤 통 창고 마당
- 저장 경로: `img/c01/s_candle.webp` · 비율: 4:3
```
A cooperage yard behind a Victorian street market at first light, pyramids of wooden barrels and casks bound with iron hoops, a heavy gate with a loose hanging chain, cobbles, mist, gas lamp on the wall, no people.
```

### c01/s_patrol — 10월 16일 자 삽화 — 손등불을 든 자경단원 두 사람
- 저장 경로: `img/c01/s_patrol.webp` · 비율: 4:3
```
Two men of a Victorian neighbourhood vigilance patrol walking away from the viewer down a foggy East End street at night, each carrying a small hand lantern, white cloth bands tied around their left upper arms, heavy coats and caps, gas lamps receding into the fog. Seen from behind.
```

### c01/s_fundbox — 10월 13일 자 삽화 — 스리 키스 뒷방의 모금함
- 저장 경로: `img/c01/s_fundbox.webp` · 비율: 4:3
```
A sturdy tin collection box with a coin slot and a brass padlock standing on a pub back-room table, beside a pewter tankard, a stub of candle and a ledger, Victorian public-house back room with panelled walls.
```

### c01/s_sailor — 10월 29일 자 삽화 — 목격담으로 그린 「챙모자 선원」 (얼굴 없는 실루엣)
- 저장 경로: `img/c01/s_sailor.webp` · 비율: 4:3
```
Victorian newspaper "likeness from a witness description": a tall man in a sailor's pea coat and a peaked cap, standing full-length, drawn as a solid black silhouette with no facial features, plain background, engraved border.
```

### c01/q_lamp — 10월 25일 자 삽화 — 꼭지 달린 코트 안쪽 가스등
- 저장 경로: `img/c01/q_lamp.webp` · 비율: 4:3
```
A single cast-iron Victorian gas street lamp on a short post against a brick wall at the end of a narrow court, a small brass gas tap sticking out from the side of the post, the lantern glass dark, damp stones, engraved detail study.
```

### c01/l_letter — 투서함 — 붉은 잉크의 첫 편지 (왼쪽 끝이 잘린 괘선지)
- 저장 경로: `img/c01/l_letter.webp` · 비율: 4:3
```
A single sheet of ruled writing paper covered in an illegible rounded scrawl in red ink, the left edge visibly cut off with scissors leaving a sliver of a printed red vertical margin rule, a small knot doodle at the bottom, lying on dark blotting paper, Victorian evidence still life.
```

### c01/l_postcard — 투서함 — 매듭장이의 엽서
- 저장 경로: `img/c01/l_postcard.webp` · 비율: 4:3
```
A Victorian halfpenny postcard lying on a desk, a small stamp in the corner overlapped by a round black postmark, a few lines of illegible red-ink scrawl, worn corners.
```

### c01/l_slip — 투서함 — 스타 편집국 원고 용지 쪽지
- 저장 경로: `img/c01/l_slip.webp` · 비율: 4:3
```
A newspaper office copy slip from 1888: ruled paper with a printed red vertical margin rule and a narrow strip of small vertical printed lettering beyond it (unreadable), a short note in rounded black handwriting (illegible), pinned with a brass pin to a bundle of envelopes.
```

### c01/b_register — 압수 장부 — 공동숙소 숙박부
- 저장 경로: `img/c01/b_register.webp` · 비율: 4:3
```
An open common lodging-house register on a scrubbed kitchen table, columns ruled in faded red and blue, rows of cramped illegible entries, a stub of pencil and a few copper pennies beside it, a coal fire glowing out of focus in the background.
```

### c01/q_thread — 경찰의 소견 — 증거물 붉은 무명실 🔁 다시 뽑기
- 저장 경로: `img/c01/q_thread.webp` · 비율: 4:3
```
A short length of red cotton thread tied in a small knot, laid on a plain white evidence card with a blank paper label, on a police surgeon's wooden table beside a magnifying glass, clinical still life. The thread is bright red, the only colour in the image, as if hand-tinted.
```
- **꼭 보여야 할 것**: 실은 붉은색 (흑백 판화라도 실만 붉게)

## CASE 02 · 하젤외드의 열흘 (1923, 바이에른 켈바흐 군 오버뢰딩 (가상 지명))

- 사건 파일: `cases/c02-bavaria-1922.js` · 이미지 13장 · 난이도 ★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Early 1920s Bavarian police and press photography: silver gelatin print from a glass-plate camera, heavy grain, warm sepia toning, soft vignetting, faint dust and scratches, cold overcast winter daylight and deep snow. Documentary, still and quiet. No readable text, no faces, no bodies, no blood.
```

### c02/cover — 기록실 폴더 표지 — 눈 덮인 외딴 농가 사진
- 저장 경로: `img/c02/cover.webp` · 비율: 4:3
```
Evidence photograph from a 1920s police file: a remote Bavarian farmstead in deep snow at the edge of a dark fir forest, seen across an open white field under a flat grey sky. A long low farmhouse with a steep roof and attached stable, a separate wooden barn, no smoke from the chimney, no people. A small manila evidence tag on a string lies slightly out of focus in the lower corner of the print.
```

### c02/farm — 주보 2월 7일자 기사 사진 — 하젤외드 농가 원경
- 저장 경로: `img/c02/farm.webp` · 비율: 4:3
```
Newspaper photograph of an isolated farmstead in Upper Bavaria, January 1923, seen from a distance across a snowy field: whitewashed farmhouse with a steep shingled roof, attached stable and a separate wooden barn, a dense fir forest pressing right up behind it. Flat grey sky, a single snowy footpath leading to the gate, utterly still and empty. Coarse newsprint halftone feel.
```

### c02/kitchen — 부엌 검증 조서 — 접힌 주보와 반쯤 잘린 빵이 놓인 식탁
- 저장 경로: `img/c02/kitchen.webp` · 비율: 4:3
```
Interior of a 1920s Bavarian farmhouse kitchen photographed for a police inspection: a heavy scrubbed wooden table with a folded, unopened local newspaper, a half-cut round loaf of dark bread with a knife, a single earthenware cup; a cold tiled stove heaped with ash in the background, pale window light. No people.
```

### c02/stall — 외양간 검증 조서 — 야윈 소들과 빈 여물통
- 저장 경로: `img/c02/stall.webp` · 비율: 4:3
```
Dim interior of an old Bavarian cattle stable in winter 1923: a row of thin brown cows standing in straw, wooden hay racks holding only scraps of hay, an overturned tin milk pail beside a pig trough, a wooden ladder leading up to a hay loft, weak light from a small frosted window. Documentary police photograph.
```

### c02/suitcase — 하녀 방 검증 조서 — 짐을 풀지 않은 가방
- 저장 경로: `img/c02/suitcase.webp` · 비율: 4:3
```
A servant's small bare room in a 1920s Bavarian farmhouse: a narrow wooden bed with a plain sheet, and beside it an old brown leather-cornered suitcase with its straps undone but still fully packed, the edge of a folded white apron showing, an empty candlestick on the windowsill. Cold, quiet, no people.
```

### c02/calendar — 안방 검증 조서 — 벽의 뜯는 달력과 십자가 🔁 다시 뽑기
- 저장 경로: `img/c02/calendar.webp` · 비율: 4:3
```
Corner of a Bavarian farmhouse living room in 1923: a simple wooden crucifix on a whitewashed wall and beside it a tear-off daily wall calendar with a thick block of unturned pages, its top sheet showing the large date numeral 26 (the only legible mark). Below, the edge of a treadle sewing machine and an unopened envelope on a table. No other readable text.
```
- **꼭 보여야 할 것**: 달력 맨 위 장은 26 (1월 26일에서 멈췄다). 다른 숫자가 나오면 이야기와 어긋난다.

### c02/kasten — 증거물 카드 — 지폐 다발이 그대로 든 쇠 금고 🔁 다시 뽑기
- 저장 경로: `img/c02/kasten.webp` · 비율: 4:3
```
Evidence photograph: a small iron strongbox standing open on a table, holding thick bundles of 1920s German inflation banknotes tied with string, a few old silver coins and folded papers; a blank police evidence card beside it, flat overhead light, heavy grain. Plain wall behind, no window.
```

### c02/attic — 다락 검증 조서 — 사람이 누웠던 건초 자국과 들창
- 저장 경로: `img/c02/attic.webp` · 비율: 4:3
```
The hay loft of a Bavarian farmhouse in 1923: steep rafters under a shingled roof, loose hay with a shallow hollow pressed into it where someone had lain, a few bread crusts nearby, and a small square hatch window through which the edge of a snowy fir forest is visible. Dusty beams of light, no people.
```

### c02/mailbox — 우편함 검증 조서 — 넘친 대문 우편함
- 저장 경로: `img/c02/mailbox.webp` · 비율: 4:3
```
A weathered wooden mailbox nailed to the gatepost of a snowbound Bavarian farm in 1923, stuffed so full that folded newspapers and an envelope stick out of its slot, snow drifted on its little roof, an untrodden snowy yard and farmhouse blurred behind. Grey winter light.
```

### c02/hut — 오두막 수색 기록 — 발자국 없는 눈 속의 나무꾼 오두막
- 저장 경로: `img/c02/hut.webp` · 비율: 4:3
```
A small woodcutter's log hut at the edge of a fir forest in deep fresh snow, Bavaria 1923: door shut, the snow in front perfectly smooth and untrodden, a stack of old grey weathered firewood under the eaves, no smoke from the stovepipe. Police documentation photograph, overcast light.
```

### c02/hausbuch — 미하엘의 가계 수첩 — 우유·달걀 셈 사이의 연필 메모
- 저장 경로: `img/c02/hausbuch.webp` · 비율: 4:3
```
Close-up of a small open farmer's household account book with faded pencil entries in old German handwriting, blurred and illegible, columns of little numbers, a stub of pencil lying across the pages, on a scrubbed wooden table. Shallow depth of field, no readable text.
```

### c02/sledge — 주보 광고면 삽화 — 장작 실은 말썰매 (목판화풍) 🔁 다시 뽑기
- 저장 경로: `img/c02/sledge.webp` · 비율: 4:3
```
Small-town newspaper advertisement illustration from the 1920s in woodcut style: a white horse pulling a wooden work sledge loaded with split firewood through snow, bold black lines on off-white paper, letterpress printing texture. One single woodcut panel only: no photograph, no second panel. No text.
```
- **꼭 보여야 할 것**: 흰 말이 끄는 장작 썰매, 목판화 한 칸만

### c02/lock — 대장간 주문 장부 — 찾아가지 않은 새 자물쇠 🔁 다시 뽑기
- 저장 경로: `img/c02/lock.webp` · 비율: 4:3
```
A new hand-forged iron box lock for a farmhouse door with two large iron keys, lying on a sooty wooden shelf in a village blacksmith's forge in 1923, faint glowing embers out of focus in the background. The lock and keys are brand-new and unrusted: bright freshly filed iron, crisp edges, clearly never used.
```
- **꼭 보여야 할 것**: 새것인 자물쇠 (찾아가지 않은 새 주문품)

## CASE 03 · 백난초 사건 (1935, 경성 종로 3정목 뒤 수남골 (가상 골목))

- 사건 파일: `cases/c03-gyeongseong-1930s.js` · 이미지 10장 · 난이도 ★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Colonial-era Gyeongseong (Seoul), autumn 1935. Newspaper pictures look like 1930s Korean newspaper halftone photographs on cheap yellowed newsprint: coarse dot screen, heavy black ink, slight misregistration, faded contrast. Police photographs look like grainy silver gelatin prints with soft vignetting. Tiled-roof hanok shopfronts, narrow dirt alleys, electric poles, trams, paper-covered lattice doors. People only as silhouettes, from behind or blurred. No faces, no blood, no bodies, no readable text or signage, no real brands.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c03/cover — 기록실 폴더 표지 — 증거물 꼬리표가 달린 1930년대 진공관 라디오와 전보 뢰신지
- 저장 경로: `img/c03/cover.webp` · 비율: 4:3
```
A 1930s wooden cathedral-style vacuum-tube radio with a cloth speaker grille and a small lit tuning dial, standing on a low lacquered table in a Korean hanok room at night, a yellow paper evidence tag tied to its knob with string, a few blank telegram forms and a folded newspaper beside it, single warm electric bulb, deep shadows.
```

### c03/n_jodk — 11월 4일 자 편성표 사진 — 정동 경성방송국 안테나 철탑
- 저장 경로: `img/c03/n_jodk.webp` · 비율: 4:3
```
A modest two-storey 1930s radio broadcasting station building on a hillside in Seoul with two tall steel lattice antenna towers and a long wire strung between them, bare autumn trees, seen from a distance, overcast sky.
```

### c03/n_singer — 10월 20일 자 학예면 — 마이크 앞에 선 가수 (뒷모습)
- 저장 경로: `img/c03/n_singer.webp` · 비율: 4:3
```
A young woman singer in a 1930s modern-style dress with a short permed bob, seen from behind, standing before a large ribbon microphone on a tall stand in a small draped radio studio, a studio window glowing in the background.
```

### c03/n_boheol — 광고면 — 보춘당 보혈환 약 봉지
- 저장 경로: `img/c03/n_boheol.webp` · 비율: 4:3
```
Advertisement-style halftone of a paper packet of traditional Korean herbal pills beside a small ceramic medicine jar and scattered dried roots on a wooden tray, plain background, no lettering on the packet.
```

### c03/p_shop — 현장 사진 — 수남골에서 본 보춘당 앞
- 저장 경로: `img/c03/p_shop.webp` · 비율: 4:3
```
Early morning police photograph of a small traditional Korean herbal medicine shop in a narrow alley off Jongno, 1935: tiled roof, wooden shutter boards stacked by the door, paper lattice doors, a blank wooden signboard, a neighbouring tailor shop sharing the wall, dirt lane, no people.
```

### c03/p_radio — 현장 사진 — 안방의 라디오 수신기 🔁 다시 뽑기
- 저장 경로: `img/c03/p_radio.webp` · 비율: 4:3
```
Police photograph of the same 1930s wooden cathedral-style vacuum-tube radio as on the folder cover, left switched on with its small tuning dial glowing warm, on a low table in a Korean ondol room, lattice paper doors behind, a floor cushion pushed aside, a cold brass ashtray, flat flash lighting, nobody in the frame.
```
- **꼭 보여야 할 것**: 표지와 같은 모양의 라디오, 다이얼 불이 켜진 채 (스위치가 켜져 있었다)

### c03/p_safe — 현장 사진 — 열린 안방 금고
- 저장 경로: `img/c03/p_safe.webp` · 비율: 4:3
```
Police photograph of a small old iron safe standing in the corner of a Korean room with its heavy door swung open, empty shelves inside, a scatter of loose papers on the floor mat, harsh flash.
```

### c03/p_well — 현장 사진 — 두 집이 같이 쓰는 뒷마당 우물
- 저장 경로: `img/c03/p_well.webp` · 비율: 4:3
```
Police photograph of a small stone well with a wooden frame and a wet wooden bucket on a rope in a cramped shared backyard between two hanok shops, two back doors facing each other, a brushwood fence behind, damp ground, grey morning light.
```

### c03/b_sewing — 압수 장부 — 전당포 선반의 재봉틀
- 저장 경로: `img/c03/b_sewing.webp` · 비율: 4:3
```
A black cast-iron treadle sewing machine head with gold-painted decoration (no brand name) on a shelf in a 1930s pawnshop storeroom, a paper pawn tag tied to its handwheel, other pawned goods blurred behind, dim window light.
```

### c03/b_cafe — 압수 장부 — 본정 카페 흑조 안
- 저장 경로: `img/c03/b_cafe.webp` · 비율: 4:3
```
Interior of a small 1930s Seoul cafe at night: bentwood chairs, round marble tables with beer bottles, frosted glass lamps, a gramophone on a side table, patrons only as dark silhouettes in the background, smoky warm light.
```

## CASE 04 · 빗속의 흰 오토바이 (1968, 도쿄도 미즈오시 (가상 지명))

- 사건 파일: `cases/c04-tokyo-1968.js` · 이미지 11장 · 난이도 ★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Late-1960s Japanese press and police evidence photography, Tokyo suburbs in the rainy season of 1968: black-and-white 35mm Tri-X film, pushed grain, slightly soft focus, flat overcast light, wet asphalt sheen, muted grey tonality; evidence-card shots on a plain board with a small ruler, occasionally as faded early color prints with a cyan shift. Showa-era details only. No readable text, no logos, no recognizable faces.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c04/cover — 기록실 폴더 표지 — 빗속에 버려진 흰 오토바이
- 저장 경로: `img/c04/cover.webp` · 비율: 4:3
```
A white-painted 250cc motorcycle left alone on a narrow wet road beside a tall grey concrete wall, heavy rainy-season drizzle, a small acrylic windshield on the handlebars, a wooden box on the rear rack, puddles reflecting an overcast sky, no people, documentary press-photo framing from across the road.
```

### c04/bike — 유류품 카드 No.1 — 붓으로 흰색 덧칠한 가짜 백바이 (증거 사진)
- 저장 경로: `img/c04/bike.webp` · 비율: 4:3
```
Police evidence photograph of a 1960s 250cc two-cylinder motorcycle crudely hand-painted white with visible brush strokes, dark green original paint peeking out under the fender, a small clear acrylic windshield, an empty wooden box strapped to the rear rack, parked against a plain grey wall in a police garage, a scale ruler on the floor, flat flash lighting. The dark green original paint under the white brush strokes must stay clearly visible: make this a faded early colour print, or hand-tint only that green.
```
- **꼭 보여야 할 것**: 흰 붓칠 사이로 보이는 원래 색(암녹색). 흑백으로 뽑으면 이 단서가 사라진다.

### c04/montage — 신문에 실린 몽타주 사진 (특정 인물 아님) 🔁 다시 뽑기
- 저장 경로: `img/c04/montage.webp` · 비율: 3:4
```
A 1960s police photo-composite portrait printed in a newspaper: a generic young man in a white open-face helmet and black leather jacket, face assembled from mismatched photo fragments with faint seams, coarse halftone dots, flat grey tones, deliberately generic features that resemble no real person. Make the composite obvious: eyes, nose and mouth come from three different photos that do not match in scale or tone, with visible cut lines, and the whole print is coarse, blurry newspaper halftone on yellowed newsprint rather than a clean photo.
```
- 주의: 실존 인물(특히 실제 사건 몽타주의 얼굴)을 닮지 않게. 여러 얼굴을 조합한 듯 어색하게.

### c04/scene — 실황조사서 — 비 오는 정수장 담장길 현장
- 저장 경로: `img/c04/scene.webp` · 비율: 16:9
```
A long narrow single-lane road running beside a tall featureless concrete wall of a water purification plant, open vegetable fields on the other side, steady rain, grey sky, a few police officers in raincoats far in the distance measuring the road, 1968 Tokyo suburb, wide documentary shot. The plant wall runs along the LEFT side of the road, the fields on the right.
```
- **꼭 보여야 할 것**: 정수장 담은 길 왼쪽 (본문 캡션: 왼쪽이 정수장 담)

### c04/wind — 유류품 카드 No.2 — 가격표 스티커를 긁어낸 바람막이
- 저장 경로: `img/c04/wind.webp` · 비율: 4:3
```
Evidence photograph of a clear acrylic motorcycle windshield with two metal clamps lying on a grey evidence board, a scraped-off remnant of a small paper price sticker on its lower corner, raking light showing faint scratches, a small scale ruler beside it.
```

### c04/flare — 유류품 카드 No.3 — 타고 남은 도로용 발연통
- 저장 경로: `img/c04/flare.webp` · 비율: 4:3
```
Evidence photograph of a burnt-out red road emergency flare cylinder, blackened at one end, rain-soaked cardboard casing, lying on a grey evidence board next to a small ruler, even overhead lighting, no readable labels.
```

### c04/matchbox — 유류품 카드 No.41 — 다방 성냥갑
- 저장 경로: `img/c04/matchbox.webp` · 비율: 4:3
```
Evidence photograph of a small half-wet 1960s Japanese coffee-shop promotional matchbox with a simple decorative angel motif (no readable text), a few pencil marks on the back, lying on a grey evidence board beside a ruler.
```

### c04/boxes — 유류품 카드 No.113~115 — 빈 두랄루민 현금 상자 3개
- 저장 경로: `img/c04/boxes.webp` · 비율: 4:3
```
Three empty dented duralumin cash-transport cases with their clasps sawn off, sitting open in the cargo area of a dusty navy-blue 1960s light van, bundled old newspapers and a single cotton work glove beside them, harsh flash, police evidence photo.
```

### c04/letter — 협박장 봉투 — 자를 대고 쓴 가타카나 (글자는 흐리게)
- 저장 경로: `img/c04/letter.webp` · 비율: 4:3
```
Close-up of a plain 1960s Japanese envelope on a police desk, the address written in angular stencil-like katakana strokes that are illegible and blurred, a 15-yen postage stamp with a round postmark, one small white paint speck on the back corner, tweezers beside it.
```
- 주의: 글자는 읽을 수 없게 흐릿하게.

### c04/siteboard — 사카에초 공사 현장 안내판과 교통정리 깃발
- 저장 경로: `img/c04/siteboard.webp` · 비율: 4:3
```
A white roadside construction information board at a street intersection under grey sky, 1968 Tokyo suburb, a small wooden prefab site office and a tiny post office building beside it, a yellow signal flag leaning against a barricade, orange traffic cones, trenches with water pipes, the board text illegible.
```

### c04/kurotaki — 구로타키 신사 뒤 숲길에 버려진 수송차
- 저장 경로: `img/c04/kurotaki.webp` · 비율: 4:3
```
A black four-door 1960s sedan abandoned on a muddy forest path behind a small Shinto shrine, tall cedar trees, rain dripping, doors left ajar, a transparent plastic raincoat crumpled on the ground nearby, two plainclothes detectives in the distance, no faces visible.
```

## CASE 05 · 모래시계의 편지 (1968–1969, 캘리포니아 카브릴로 만 연안 (가상 지명))

- 사건 파일: `cases/c05-westcoast-1969.js` · 이미지 11장 · 난이도 ★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
1969 American newspaper wire photo and police file photography, Northern California coast: black-and-white 35mm Tri-X, heavy grain, harsh on-camera flash at night, coastal fog and sodium streetlight glow, halftone dot texture when reproduced in the newspaper, late-1960s cars, phone booths and street furniture without brand logos. No readable text, no recognizable faces, no bodies, no blood, no weapons shown.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c05/cover — 기록실 폴더 표지 — 편집국 책상 위의 봉투 더미와 모래시계
- 저장 경로: `img/c05/cover.webp` · 비율: 4:3
```
Night-time newsroom desk under a single green-shaded desk lamp: a small pile of opened airmail-style envelopes with 6-cent stamps and round postmarks, a manual typewriter at the edge, a brass sand hourglass standing beside the letters, cigarette smoke, 1969 American newspaper city desk, no readable text.
```

### c05/letter1 — 편지 (1) — 파란 볼펜 대문자 편지와 봉투 (글자 흐리게)
- 저장 경로: `img/c05/letter1.webp` · 비율: 4:3
```
Photostat copy of a one-page handwritten letter in blue ballpoint block capitals, completely illegible and blurred, with its envelope beside it showing a 6-cent stamp and a round postmark, lying on a grey police evidence table, a small hand-drawn hourglass shape at the bottom of the letter, harsh overhead light. The ballpoint ink must read as blue: a colour photostat, or hand-tint only the ink blue.
```
- **꼭 보여야 할 것**: 파란 볼펜 글씨 (글자는 여전히 읽히지 않게)
- 주의: 글자는 읽을 수 없게.

### c05/typed — 편지 (3) — 타자로 친 가짜 편지
- 저장 경로: `img/c05/typed.webp` · 비율: 4:3
```
Close-up of a typewritten letter on cheap paper, the typed lines blurred and unreadable, some letters faintly broken, a clumsy pen-drawn hourglass at the bottom with uneven triangles, evidence tag string in the corner, flash photo.
```

### c05/sketch — 생존자 진술로 만든 몽타주 (특정 인물 아님)
- 저장 경로: `img/c05/sketch.webp` · 비율: 3:4
```
A 1969 police artist composite pencil sketch of a generic man around thirty with short hair and heavy-rimmed glasses, dark work jacket, frontal view, simple shading on off-white paper, printed in a newspaper with coarse halftone, deliberately generic features that resemble no real person.
```
- 주의: 실존 인물(실제 사건의 몽타주 포함)을 닮지 않게.

### c05/masonhill — 메이슨 힐 전망대 주차장 (사건 뒤 낮 풍경)
- 저장 경로: `img/c05/masonhill.webp` · 비율: 16:9
```
An empty gravel lookout parking area on a coastal hill in the morning fog, a low wooden guard rail, the bay faintly visible below, a single sheriff patrol car parked far away, tire marks in the gravel, 1968 Northern California, desolate and quiet.
```

### c05/cedar — 시더 크릭 트레일 주차장 (다음 날 아침)
- 저장 경로: `img/c05/cedar.webp` · 비율: 16:9
```
A small dirt trailhead parking lot among redwood trees at dawn, mist between the trunks, a wooden trail sign with illegible text, a police barricade sawhorse, no vehicles except a distant patrol car, 1969 Northern California.
```

### c05/payphone — 도크 스트리트 주유소 옆 공중전화 — 줄에 매달린 수화기
- 저장 경로: `img/c05/payphone.webp` · 비율: 3:4
```
A glass-panelled roadside telephone booth next to a closed gas station at night, the receiver hanging down on its metal cord, a sodium streetlight glowing in fog, across the street the lit loading bay of a newspaper distribution warehouse with bundled papers, 1969, harsh police flash, no readable signs.
```

### c05/truck — 쿠리어 배송 트럭 (신문 사고 사진)
- 저장 경로: `img/c05/truck.webp` · 비율: 16:9
```
A late-1960s boxy newspaper delivery truck with bundles of Sunday papers stacked in the open rear door, parked at a warehouse loading dock at night under bare bulbs, a driver seen only from behind in a work jacket, no logos or readable lettering, newspaper halftone reproduction.
```

### c05/lighthouse — 그레이록 등대길 잠복 (8월 새벽)
- 저장 경로: `img/c05/lighthouse.webp` · 비율: 16:9
```
A coastal road leading to a small white lighthouse before dawn, thick fog, the lighthouse beam cutting through it, two unmarked police sedans parked dark on the shoulder, a pair of distant headlights of a delivery truck coming along the road, 1969 Northern California.
```

### c05/depot — 도크 스트리트 배송 창고의 토요일 밤
- 저장 경로: `img/c05/depot.webp` · 비율: 16:9
```
A newspaper distribution warehouse on a waterfront street late on a Saturday night, three loading bays lit with bare bulbs, workers in silhouette stacking tied bundles of thick Sunday newspapers onto trucks, wet pavement, 1969, grainy press photo.
```

### c05/cipherimg — 1면에 실린 암호문 (기호만, 뜻 없는 도형 배열) 🔁 다시 뽑기
- 저장 경로: `img/c05/cipherimg.webp` · 비율: 4:3
```
A newspaper front-page detail printed in halftone: a block of simple geometric hand-drawn symbols (circles, triangles, crossed circles, diamonds) arranged in three uneven rows like a cipher, no letters or readable words, slightly smudged ink, folded newsprint texture. Use about fifteen different symbol shapes (squares with crosses, circles with bars, arrows, half-moons, hourglass marks and so on) in an irregular, non-repeating sequence, like a real substitution cipher.
```
- **꼭 보여야 할 것**: 기호 종류가 많고 불규칙하게 (4 가지가 되풀이되면 암호로 안 보인다)

## CASE 06 · 크비트달의 여인 (1969, 노르웨이 서해안 헬레순 (가상 지명))

- 사건 파일: `cases/c06-norway-1970.js` · 이미지 12장 · 난이도 ★★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
1969 Norwegian police and press photography on 35mm film: Tri-X style black-and-white grain for police documentation, faded early colour film with a cool blue-green cast for everything else; overcast west-coast light, wet rock, heather and harbour mist. Documentary and quiet. No readable text, no faces, no bodies.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c06/cover — 기록실 폴더 표지 — 증거물 꼬리표가 달린 가방 두 개
- 저장 경로: `img/c06/cover.webp` · 비율: 4:3
```
Police evidence photograph, 1969: two worn 1960s suitcases, one brown leather and one grey-blue, standing on a concrete floor under a cold overhead lamp, a paper left-luggage ticket tied to one handle and a manila evidence tag lying in front of them. Slightly soft focus, heavy 35mm black-and-white grain.
```

### c06/valley — 신문 10월 20일자 — 크비트달 등산로 🔁 다시 뽑기
- 저장 경로: `img/c06/valley.webp` · 비율: 4:3
```
Newspaper photograph of a remote rocky valley above a small Norwegian west-coast town in late October 1969: a narrow hiking path winding up between boulders, heather and a few bare birches, low cloud on the ridges, wet stone, no people. Coarse halftone newsprint look.
```

### c06/thermos — 현장 유류품 1호 — 히스 덤불 속 보온병 뚜껑 컵
- 저장 경로: `img/c06/thermos.webp` · 비율: 4:3
```
Police close-up photograph of the screw-on cup lid of a 1960s vacuum flask lying in wet purple heather on a rocky Norwegian hillside, a dark coffee stain inside the cup, a blank evidence number card beside it. Overcast light, 35mm black-and-white film.
```

### c06/suitcases — 역 보관소 가방 두 개의 내용물
- 저장 경로: `img/c06/suitcases.webp` · 비율: 4:3
```
Two 1960s suitcases opened on a police table with their contents laid out for documentation: three wigs of different hair colours, plain-glass spectacles, neatly folded clothes with the labels cut out, small binoculars, a compact camera and a slim notebook. Flat fluorescent light, faded 35mm colour film.
```

### c06/touristmap — 관광 지도 — 연필 동그라미와 기호
- 저장 경로: `img/c06/touristmap.webp` · 비율: 4:3
```
A folded 1968 tourist map of a small Norwegian harbour town lying on a desk, two hand-drawn pencil circles on it, one at a harbour quay and one at a mountain trailhead, a short row of tiny pencil geometric symbols beside the second circle. All printed lettering blurred and illegible. Warm desk-lamp light.
```

### c06/harbor — 현상한 필름 3번 — 새벽 항구와 화물선
- 저장 경로: `img/c06/harbor.webp` · 비율: 4:3
```
Grainy 35mm photograph taken at dawn from a high hotel window: a small Norwegian harbour with a long quay, wooden warehouses and a single rusty coastal freighter moored, a few lights still on, mist on the water. Slightly underexposed, cool colour shift.
```

### c06/stern — 현상한 필름 7번 — 새 페인트 밑 옛 글자 자국이 보이는 고물 🔁 다시 뽑기
- 저장 경로: `img/c06/stern.webp` · 비율: 4:3
```
Close-up 35mm photograph of the stern of a rusty small cargo ship at a quay: freshly painted name letters on the dark hull, and beneath the new paint the faint raised outlines of older, different letters showing in low raking morning light. The two rows must be clearly visible as shapes: a short row of fresh white painted letters, and around and beneath it a longer row of older letter outlines standing out as raised ridges and paint edges in the raking light. Letter shapes only, blurred so no word can be read. Water reflections, cool muted colours.
```
- **꼭 보여야 할 것**: 새로 칠한 글자 한 줄 + 그 밑으로 도드라진 옛 글자 윤곽 (읽히지는 않게)

### c06/station — 신문 10월 23일자 — 역 수하물 보관소 창구 🔁 다시 뽑기
- 저장 경로: `img/c06/station.webp` · 비율: 4:3
```
Interior of a small Norwegian railway station left-luggage office in 1969: a wooden counter with a hinged hatch, shelves behind it holding suitcases and parcels with paper tags, a round wall clock, empty benches. Newspaper halftone photograph, no people.
```

### c06/regcard — 브뤼겐 호텔 외국인 숙박 신고서
- 저장 경로: `img/c06/regcard.webp` · 비율: 4:3
```
A 1960s hotel foreign-guest registration slip on a wooden reception counter, filled in with blue ballpoint handwriting that is blurred and unreadable, a brass room-key tag beside it. Close-up, shallow depth of field, warm lamp light.
```

### c06/hytte — 산장 방명록 — 능선 위의 크비트달 산장
- 저장 경로: `img/c06/hytte.webp` · 비율: 4:3
```
A small red-painted wooden mountain hut on a bare Norwegian ridge above a valley in late October 1969, low cloud, heather and grey rocks, a thin line of smoke from the chimney, no people. Faded 35mm colour film.
```

### c06/ship — 1968년 신문 — 폭풍 속 화물선 (흐린 사진)
- 저장 경로: `img/c06/ship.webp` · 비율: 4:3
```
1968 newspaper photograph of a small coastal cargo ship rolling in heavy North Sea waves at night, lit only by a trawler's searchlight, spray and black water, very grainy and blurred. No text.
```

### c06/fuel — 주유소 외상 장부 — 크비트달 길 주유소
- 저장 경로: `img/c06/fuel.webp` · 비율: 4:3
```
A small roadside petrol station on a rural Norwegian road in 1969: a white wooden building with a red canopy, two old fuel pumps, wet asphalt, mountains behind in low cloud. No logos, no readable signs.
```

## CASE 07 · 송월각 장부 (1971, 서울 서하구 버들개 (가상 지명))

- 사건 파일: `cases/c07-seoul-1970.js` · 이미지 12장 · 난이도 ★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
1971 Seoul in black-and-white: Tri-X 35mm police and press photography, coarse grain, harsh on-camera flash or dim tungsten light, slight motion blur, printed look with a coarse newspaper halftone dot screen and yellowed newsprint tones where it appears in a newspaper. Early-1970s Korean details: unpaved riverside embankment roads, willow trees, wooden utility poles, tile-roofed hanok and tin-roofed shacks, late-1960s four-door sedans with round headlights. No faces (backs, silhouettes or out-of-focus figures only), no readable text, no logos or emblems, no blood or injuries.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c07/cover — 기록실 폴더 표지 — 갱지 서류철 위에 놓인 흑백 현장 사진과 장부
- 저장 경로: `img/c07/cover.webp` · 비율: 4:3
```
Top-down photo of a stack of yellowed Korean police case files on a dark wooden desk, a faded black-and-white photograph of a dark 1960s sedan parked on a dirt riverside road clipped to the top file, an old hand-bound guest ledger with a cloth cover beside it, a red ink seal smudge, a brass paper clip, dim tungsten desk lamp light.
```

### c07/photo_car — 현장 사진 1 — 둑길 버드나무 앞에 선 검정 승용차
- 저장 경로: `img/c07/photo_car.webp` · 비율: 4:3
```
Black-and-white police evidence photo at grey dawn: a dark late-1960s four-door sedan with round headlights parked on the edge of an unpaved riverside embankment road beside two bare willow trees, passenger window half rolled down, headlights off, flat grey river beyond the embankment, a blurred policeman in a long coat standing far off with his back turned, flash falloff and heavy grain.
```

### c07/photo_seat — 현장 사진 2 — 뒷좌석 발판의 담배꽁초 한 개
- 저장 경로: `img/c07/photo_seat.webp` · 비율: 4:3
```
Black-and-white close evidence photo inside the back seat footwell of a 1960s sedan: worn rubber floor mat, a single filtered cigarette butt lying on it, a hand-drawn white arrow on the print pointing at the butt, harsh direct flash, deep shadows under the seat, grainy.
```

### c07/handbag — 유류품 사진 — 검정 비닐 핸드백과 내용물
- 저장 경로: `img/c07/handbag.webp` · 비율: 4:3
```
Black-and-white evidence table photo, top-down: a small black vinyl handbag with a short strap, next to it a round compact mirror, a lipstick, a folded handkerchief, a thin cloth wallet, a few paper bus tokens and two old keys on a string, laid out in a row on grey paper with a small blank evidence card, flat flash, grain.
```

### c07/news_car — 신문 1보 사진 — 현장에 남은 승용차 (망점 인쇄)
- 저장 경로: `img/c07/news_car.webp` · 비율: 4:3
```
A 1971 Korean newspaper photograph printed with a coarse halftone dot screen on yellowed newsprint: a dark sedan standing alone on a dark unpaved road at night lit by a single flash, a few blurred onlookers in hats at the edge, heavy contrast, ink spread.
```

### c07/songwol_gate — 신문 사진 — 닫힌 요정 대문
- 저장 경로: `img/c07/songwol_gate.webp` · 비율: 4:3
```
Black-and-white newspaper photo of the closed wooden double gate of an upscale traditional Korean restaurant-house in 1970s Seoul: tiled hanok roof over the gate, high plastered walls, two unlit paper lanterns, a black sedan partly visible at the edge, overcast daylight, halftone dots.
```

### c07/ledger_page — 송월각 손님 장부 펼친 면 (글씨는 흐릿하게)
- 저장 경로: `img/c07/ledger_page.webp` · 비율: 4:3
```
Close photo of an open handwritten guest ledger from a 1970s Korean restaurant-house: thread-bound mulberry paper, faint blue ruled columns, neat brush-pen strokes that are blurred and illegible, one final line written in a thicker crooked pencil, a small red star-like mark in the margin, dim desk light, shallow depth of field.
```
- 주의: 글씨가 읽히지 않게. 마지막 줄만 다른 필체로.

### c07/switchboard — 송월각 교환실의 사설 교환대
- 저장 경로: `img/c07/switchboard.webp` · 비율: 4:3
```
Black-and-white photo of a small wooden 1970s private telephone switchboard in a dim back room of a Korean restaurant-house, rows of jacks and dangling patch cords, a desk lamp, a pencil and a ruled log sheet on the shelf, a young woman operator seen from behind wearing a headset, soft tungsten light, grain.
```

### c07/shop — 버들개 강변의 판잣집 담배가게 "우물집" — 공중전화와 흑백 TV
- 저장 경로: `img/c07/shop.webp` · 비율: 4:3
```
Night photo of a tiny tin-roofed roadside shack shop near a riverside embankment in 1971 Seoul outskirts: an open front window with cigarettes and candy on shelves, a boxy black-and-white television glowing inside, an old public payphone mounted on the outside wall by the door, one bare bulb, empty dirt road in front, grainy black and white.
```

### c07/tv — 신문 편성표 옆의 흑백 TV 월부 광고 그림
- 저장 경로: `img/c07/tv.webp` · 비율: 1:1
```
A 1971 Korean newspaper advertisement illustration printed in black ink: a boxy wooden-cabinet black-and-white television set on four splayed legs with rabbit-ear antenna and two round dials, simple line engraving with halftone shading, generic, no brand, no readable text.
```

### c07/seokcar — 대양흥업 차고의 검정 코로나 (1972년 봄)
- 저장 경로: `img/c07/seokcar.webp` · 비율: 4:3
```
Black-and-white photo inside a 1970s company garage in Seoul: a polished dark late-1960s luxury sedan being washed, a bucket and rag on the concrete floor, dried pale mud caked under the front bumper and wheel arches, a man in a work jacket seen from behind crouching by the wheel, window light, grain.
```

### c07/house — 솔밭동 전셋집 — 지붕 위 새 TV 안테나
- 저장 경로: `img/c07/house.webp` · 비율: 4:3
```
Black-and-white photo of a modest tile-roofed single-storey house in an early-1970s Seoul alley, cement wall and blue-painted iron gate, a brand-new television antenna mast standing out on the roof, laundry line, overcast spring day, a child's bicycle leaning on the wall, grainy.
```

## CASE 08 · 목소리의 지도 (1991, 서울 한울구 새터·가람 (가상 지명))

- 사건 파일: `cases/c08-seoul-1991.js` · 이미지 13장 · 난이도 ★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Early-1990s Seoul, shot on a consumer compact 35mm film camera: color negative film look, on-camera flash at night, slight green-orange color cast from sodium street lamps, visible grain, soft focus; police evidence photos are flat flash on grey paper; newspaper images are coarse black-and-white halftone. 1991 Korean street details: card-and-coin public phone booths, an elevated steel subway bridge, red-brick multi-family houses, small corner shops with sliding aluminium-glass doors, tangled utility wires, a church bell tower with a red neon cross. No faces (backs, silhouettes or blurred figures only), no readable text, no logos or brand marks.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c08/cover — 기록실 폴더 표지 — 카세트 녹음기와 라벨 붙은 테이프, 전화기
- 저장 경로: `img/c08/cover.webp` · 비율: 4:3
```
Top-down photo on a grey police desk in 1991 Seoul: a black portable cassette recorder with a small microphone clipped to a beige push-button home telephone handset by a suction-cup pickup, six audio cassette tapes in clear cases with handwritten labels that are blurred and unreadable, a ballpoint pen, harsh overhead fluorescent light, slight color cast.
```

### c08/booth — 새터역 2번 출구 앞 공중전화 부스 두 대 — 머리 위 2호선 철교
- 저장 경로: `img/c08/booth.webp` · 비율: 4:3
```
Dusk photo in 1991 Seoul: two glass-and-aluminium public telephone booths standing side by side under a massive elevated steel subway bridge, the lit window of a small corner shop next to them, a church bell tower with a red neon cross in the distant background, wet pavement, a lone figure in a work jacket seen from behind inside one booth with a handkerchief raised to his mouth, on-camera flash falloff, grain.
```

### c08/rail — 신문 사진 — 새터역과 가람역을 잇는 2호선 철교
- 저장 경로: `img/c08/rail.webp` · 비율: 4:3
```
A 1991 Korean newspaper photograph in coarse black-and-white halftone: an elevated steel subway bridge running over a crowded low-rise shopping street, a four-car commuter train crossing overhead, shop awnings and tangled wires below, overcast daylight, ink spread on newsprint.
```

### c08/church — 신문 사진 — 종탑이 남아 있는 새터제일교회
- 저장 경로: `img/c08/church.webp` · 비율: 3:4
```
Black-and-white newspaper photograph of a modest red-brick church in a dense early-1990s Seoul residential neighbourhood, a square bell tower with an open belfry and a real cast bronze bell visible, a cross on top, surrounded by multi-family brick houses and rooftop water tanks, halftone dots.
```

### c08/note_paper — 가람역 부스 전화번호부 사이에서 나온 쪽지 (복사본) 🔁 다시 뽑기
- 저장 경로: `img/c08/note_paper.webp` · 비율: 4:3
```
Photocopy-style evidence photo of a small torn scrap of lined notebook paper lying on the open pages of a thick public telephone directory, a short message written in stiff angular ballpoint strokes drawn along a ruler, the strokes blurred so nothing is readable, flat flash, grey tones.
```
- **꼭 보여야 할 것**: 자를 대고 그은 듯 곧은 획 (읽히지는 않게)
- 주의: 글자가 읽히지 않게.

### c08/warehouse — 가람동 현장 뒤편 가설창고 — 풀린 자물쇠
- 저장 경로: `img/c08/warehouse.webp` · 비율: 4:3
```
Night flash photo at a halted apartment construction site in 1991 Seoul: a corrugated steel site storage shed behind a blue temporary fence, its door slightly ajar, an open padlock still hanging on the hasp, scattered rebar and concrete forms, a police flashlight beam, rain-wet mud, grain and color cast.
```

### c08/ransom_bag — 몸값 1억 원이 든 여행 가방 두 개
- 저장 경로: `img/c08/ransom_bag.webp` · 비율: 4:3
```
Police evidence photo, 1991: two cheap vinyl travel bags, one brown and one navy, standing on a grey table, one unzipped showing tightly packed bundles of used banknotes held with rubber bands (denominations and designs not identifiable), flat on-camera flash, slight color cast.
```
- 주의: 지폐 도안이 알아볼 수 있게 나오지 않게.

### c08/montage — 몽타주 — 얼굴은 흐릿한 연필 선만 (특정인을 닮지 않게)
- 저장 경로: `img/c08/montage.webp` · 비율: 3:4
```
Early-1990s Korean police composite sketch on off-white paper in soft graphite: a deliberately generic, unfinished head-and-shoulders outline of a man, only thick black-rimmed glasses, a hairline and the collar of a work jacket with pens in the chest pocket drawn clearly, the facial features left faint, smudged and unfinished so no real person is depicted, paper clipped to a police form.
```
- 주의: 실존 인물을 닮지 않게, 얼굴은 미완성으로.

### c08/montage_print — 신문에 실린 몽타주 (망점 인쇄) 🔁 다시 뽑기
- 저장 경로: `img/c08/montage_print.webp` · 비율: 3:4
```
The same generic police composite sketch reproduced small in a 1991 Korean newspaper with a coarse halftone dot screen on yellowed newsprint, blurred and low-detail, only the black-rimmed glasses and work-jacket collar clearly visible.
```
- 주의: 제목·본문 모두 뭉개진 회색 줄로만. montage 이미지를 참고 이미지로 넣어 같은 그림을 신문 인쇄 느낌으로.

### c08/news_site — 신문 사진 — 피해자가 발견된 가람동 공사 현장
- 저장 경로: `img/c08/news_site.webp` · 비율: 4:3
```
Black-and-white 1991 newspaper photograph with coarse halftone: an unfinished concrete apartment block skeleton at night behind a temporary fence, a still tower crane, police car headlights and a few blurred officers in the foreground, no faces.
```

### c08/shop_ledger — 새터슈퍼 계산대 밑에서 나온 외상 장부
- 저장 경로: `img/c08/shop_ledger.webp` · 비율: 4:3
```
Close photo of a cheap spiral-bound ledger notebook from a tiny Seoul corner shop in 1991, ruled pages filled with a shopkeeper's blue ballpoint and pencil entries that are blurred and unreadable, a red ballpoint pen and a prepaid telephone card lying on the page, shop counter with candy jars out of focus, warm fluorescent light.
```
- 주의: 글씨가 읽히지 않게, 전화카드에 상표 없게.

### c08/keys — 가설창고 열쇠 — 꼬리표 두 개, 세 번째 자리는 비어 있다
- 저장 경로: `img/c08/keys.webp` · 비율: 4:3
```
Evidence photo on grey card: two old brass padlock keys hanging from hooks on a wooden key board, each with a small paper tag on string, and a third empty hook with a blank tag and no key, flat flash, 1991 construction company storeroom.
```

### c08/flyer — 실종 전단 사진 자리 — 인쇄가 번져 얼굴은 알아볼 수 없음 🔁 다시 뽑기
- 저장 경로: `img/c08/flyer.webp` · 비율: 3:4
```
A 1991 photocopied missing-person flyer lying on a police desk: the student ID photo area is a heavily smeared, over-copied grey blob so no face can be made out, dense lines of Korean text below reduced to illegible grey stripes, a thumbtack hole at the top, flat light.
```
- 주의: 얼굴이 드러나지 않게. 제목도 뭉개진 회색 띠로만.

## CASE 09 · 열세 칸 (2006, 서울 서남부 은골동 (가상 지명))

- 사건 파일: `cases/c09-seoul-2006.js` · 이미지 15장 · 난이도 ★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Photo taken in 2006 with a cheap compact digital camera: 3-megapixel, visible sensor noise, flat on-camera flash at night with dark falloff behind the subject, slightly blown highlights, cool white balance, mild JPEG blockiness, casual amateur framing like a Korean mini-homepage photo album or a police canvass snapshot. Seoul low-rise residential alleys of the late 1980s–90s: red-brick multi-family houses with external iron staircases. People only from behind, blurred or out of frame; no faces, no readable text, no logos, nothing graphic.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c09/cover — 기록실 폴더 표지 — 비 오는 밤, 다가구 주택의 바깥 철계단
- 저장 경로: `img/c09/cover.webp` · 비율: 4:3
```
Rainy night in a narrow Seoul residential alley in 2006: the side of an old red-brick multi-family house with an external iron staircase that turns once halfway up, white styrofoam planter boxes with green onions on the landing, a single yellow streetlight, wet asphalt reflecting light, an empty black umbrella lying at the foot of the stairs. Quiet, ominous, no people.
```

### c09/cctv — 은골시장 입구 방범 CCTV 캡처 — 우산 하나 아래 두 사람
- 저장 경로: `img/c09/cctv.webp` · 비율: 4:3
```
Grainy low-resolution black-and-white security camera frame from 2006, high angle over a rain-soaked market alley entrance at night, two small indistinct figures walking close together under one large black umbrella, streetlight glare, heavy rain streaks, interlaced video noise, faces and clothing unidentifiable. No readable timestamp text.
```

### c09/busstop — 은골시장 정류장 탐문 사진
- 저장 경로: `img/c09/busstop.webp` · 비율: 4:3
```
Flash-lit night snapshot of a small bus stop on a narrow road beside a closed traditional market in 2006 Seoul, one pole sign, a bench, wet pavement, dark shuttered shop fronts, the mouth of a residential alley on the left. Taken by a detective with a compact digital camera.
```

### c09/sora_photo — 민소라 미니홈피 사진첩 — 새로 산 우산 셀카 대신 우산만 찍은 사진
- 저장 경로: `img/c09/sora_photo.webp` · 비율: 4:3
```
Cute early-2000s Korean mini-homepage photo: a brand-new pink folding umbrella opened on a small studio-apartment floor next to a single bed, fluorescent room light, slightly overexposed, playful and ordinary. No people.
```

### c09/haeun_photo — 주하은 미니홈피 사진첩 — 학원 교무실 책상
- 저장 경로: `img/c09/haeun_photo.webp` · 비율: 4:3
```
Snapshot of a cram-school teacher's desk in 2006: stacked English workbooks, a CRT monitor, a red marker, a few small chocolate boxes left by students, a sticky note with a heart doodle, fluorescent office light, compact camera flash. No people, no readable text.
```

### c09/mt_photo — 하진우 미니홈피 — 8월 가평 동아리 MT 사진 (알리바이)
- 저장 경로: `img/c09/mt_photo.webp` · 비율: 4:3
```
Summer 2006 group outing by a mountain river in Gapyeong-like countryside: orange dome tents on a pebble riverbank, a yellow rafting boat pulled onto the shore, a dozen people seen from behind in life vests waving, bright midday sun, compact camera snapshot with slight lens flare.
```

### c09/courier_room — 구민재 미니홈피 — 반지하 자취방 (계단 세 칸)
- 저장 경로: `img/c09/courier_room.webp` · 비율: 4:3
```
Cramped Seoul semi-basement studio room in 2006, a high window half below street level showing wet pavement and passing feet, a folded blue delivery vest hanging on a hook, a motorcycle helmet on the floor, three concrete steps leading up to the door, dim fluorescent light.
```

### c09/roof — 표구쟁이 미니홈피 — 철계단 꺾이는 곳의 스티로폼 텃밭
- 저장 경로: `img/c09/roof.webp` · 비율: 4:3
```
Sunny daytime photo of the turning landing of an external iron staircase on an old red-brick house: six white styrofoam boxes planted with chili peppers and green onions crowded on the landing, rusty handrail, laundry line above, blue summer sky. Proud amateur gardener's snapshot, compact digital camera.
```

### c09/door — 표구쟁이 미니홈피 — 현관문의 노란 웃음 스티커
- 저장 경로: `img/c09/door.webp` · 비율: 4:3
```
Close flash photo of an old varnished wooden apartment door with a brass keyhole lock (no digital lock), a round yellow smiley-face sticker stuck at eye level, slightly crooked, scuffed paint around it. Plain everyday snapshot. No readable text, no logos.
```

### c09/frames — 표구쟁이 미니홈피 — 집 작업실 벽에 기대 둔 액자 틀들
- 저장 경로: `img/c09/frames.webp` · 비율: 4:3
```
Cluttered home workshop of a picture framer in 2006: many empty wooden frame mouldings and backing boards leaning against a papered wall, a pot of wheat-starch paste and wide brushes on newspaper, rolls of silk mounting fabric, warm incandescent light mixed with flash. No people, no artwork visible inside the frames.
```

### c09/house217 — 일제 탐문 카드 사진 — 217-3
- 저장 경로: `img/c09/house217.webp` · 비율: 4:3
```
Police canvass snapshot at night, 2006: an old red-brick two-story multi-family house with an external iron staircase of thirteen steps that turns once at a small landing, soil stains and a few styrofoam crumbs on the landing, a varnished wooden door at the top with a pale round mark where a sticker was peeled off. Harsh on-camera flash, dark background.
```

### c09/house204 — 일제 탐문 카드 사진 — 204-11
- 저장 경로: `img/c09/house204.webp` · 비율: 4:3
```
Police canvass snapshot at night, 2006: a light-brick multi-family house with a straight external iron staircase of twelve steps and no landing, a newly installed metal door with a digital keypad lock at the top, rolled-up old linoleum by the wall. Harsh flash.
```

### c09/house219 — 일제 탐문 카드 사진 — 219-8
- 저장 경로: `img/c09/house219.webp` · 비율: 4:3
```
Police canvass snapshot at night, 2006: a multi-family house with a poured concrete external staircase that turns once, three potted red geraniums on the landing, a door at the top with a small yellow square newspaper-subscription sticker. Harsh flash.
```

### c09/house226 — 일제 탐문 카드 사진 — 226-2
- 저장 경로: `img/c09/house226.webp` · 비율: 4:3
```
Police canvass snapshot at night, 2006: a multi-family house on an uphill alley with a long external iron staircase turning once, many potted plants crowded in the small front yard below, a metal door with keypad lock. Harsh flash.
```

### c09/house230 — 일제 탐문 카드 사진 — 230-5
- 저장 경로: `img/c09/house230.webp` · 비율: 4:3
```
Police canvass snapshot at night, 2006: an older brick house with a tall external iron staircase that switches back twice up to a rooftop, styrofoam vegetable boxes visible at the roof edge, a plain door with a key lock. Harsh flash.
```

## CASE 10 · 마지막 통화 (2014, 해진시 신항 일대 (가상 항구 도시))

- 사건 파일: `cases/c10-harbor-2014.js` · 이미지 10장 · 난이도 ★★★★
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Stills from a 2014 Korean provincial port city. Dashcam and CCTV frames: wide-angle fisheye distortion, low-light sensor noise, sodium-vapor orange streetlights, smeared headlight flare, H.264 compression blocking, slightly washed-out blacks. Smartphone photos: early-2010s phone camera, over-sharpened, mild HDR haze, cool grey sea light. Wet concrete, container cranes, apartment parking lots. No on-screen timestamps or overlays, no readable text or license plates, no logos, no identifiable faces (people only from behind or as silhouettes), nothing graphic.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c10/cover — 기록실 폴더 표지 — 증거물 꼬리표가 달린 노트북과 항구 불빛
- 저장 경로: `img/c10/cover.webp` · 비율: 4:3
```
A closed dark-grey office laptop with a yellow paper evidence tag tied on with string, lying on a cluttered seafood-trading office desk beside a window at dusk; outside the window, blurred container cranes and orange harbor lights of a Korean port city, rain drops on the glass. Quiet, heavy mood.
```

### c10/cam_a — 피해자 차량 블랙박스 — 23:55 대리 기사가 혼자 걸어 나감
- 저장 경로: `img/c10/cam_a.webp` · 비율: 16:9
```
Dashcam still from inside a parked car at night, wide-angle fisheye view over an outdoor apartment-complex parking lot in Korea, rows of parked cars, sodium streetlights, a lone man in a dark jacket seen from behind walking away toward the lit barrier gate. Grainy, compressed, no overlays.
```

### c10/cam_b — 피해자 차량 블랙박스 — 00:14 검은 SUV 조수석에 타는 피해자
- 저장 경로: `img/c10/cam_b.webp` · 비율: 16:9
```
Dashcam still at night from a parked car: a black SUV with a roof rack stopped crosswise in the parking aisle just ahead, its front passenger door open, a man's silhouette in a navy padded jacket stepping in from the left, license plate lost in streetlight glare. Fisheye distortion, noise, compression artifacts.
```

### c10/cam_taxi — 택시 블랙박스 제보 — 신항대로에서 마주 지나가는 검은 SUV (안개등 한쪽 꺼짐)
- 저장 경로: `img/c10/cam_taxi.webp` · 비율: 16:9
```
Taxi dashcam still on a wide coastal road at night: an oncoming black SUV with a roof rack in the opposite lane, headlights on, only its left front fog lamp lit and the right front fog lamp dark, sodium streetlights, dark sea on one side, container cranes far away. Fisheye, noise, headlight flare, no readable plate.
```

### c10/cam_pier — 신항 3부두 공사장 정문 CCTV — 안쪽으로 들어가는 헤드라이트
- 저장 경로: `img/c10/cam_pier.webp` · 비율: 4:3
```
Fixed CCTV frame, high angle, of a construction-site gate at a dark container pier at night: temporary fencing, unlit lamp posts, a single pair of car headlights passing through the gate toward the pitch-black interior of the pier, the vehicle itself invisible. Black-and-white-ish low-light noise, heavy compression.
```

### c10/cam_store — 구항동 편의점 CCTV — 00:40 계산대 앞 차명수 (뒷모습, 알리바이)
- 저장 경로: `img/c10/cam_store.webp` · 비율: 4:3
```
Overhead convenience-store CCTV frame at night, 2014 Korea: a middle-aged man in a padded work jacket seen from behind at the counter, two small hangover-drink bottles and a pack of cigarettes on the counter, bright fluorescent light, shelves of snacks, fisheye distortion, grainy. No readable text or logos.
```

### c10/cap — 카페 실종 글 — 피해자가 늘 쓰던 경매 번호 모자
- 저장 경로: `img/c10/cap.webp` · 비율: 4:3
```
Smartphone photo of a worn navy baseball cap with a small white rectangular number patch on the front (number not legible), lying on a wooden table in a small apartment, soft window light, slightly over-sharpened early-2010s phone camera look.
```

### c10/hoesik — 단체 대화방 사진 — 등대횟집 큰방 회식 자리
- 저장 경로: `img/c10/hoesik.webp` · 비율: 4:3
```
Smartphone snapshot of a private room in a Korean seaside raw-fish restaurant: low table crowded with a big sashimi platter, side dishes, green soju bottles and beer glasses, several men seen only from behind or cropped at the shoulders, warm fluorescent light, a little motion blur. No faces, no readable labels.
```

### c10/crates — 나에게 보내기 사진 — 냉동창고 안 상자를 바꿔 담은 흔적 (동기)
- 저장 경로: `img/c10/crates.webp` · 비율: 4:3
```
Dim smartphone photo taken inside a cold-storage warehouse at night: stacks of brown cardboard boxes with foreign-language printing (illegible) on one side and fresh plain white boxes on the other, frozen fish being moved between them, frost haze, harsh ceiling lights, taken hurriedly and slightly tilted. No readable text, no logos.
```

### c10/pier_day — 카페 민원 글 사진 — 신항 3부두 공사 현장 낮 풍경
- 저장 경로: `img/c10/pier_day.webp` · 비율: 16:9
```
Overcast daytime smartphone photo of an unfinished container pier in a Korean port: temporary fencing, unlit lamp posts, piles of concrete tetrapods along the breakwater, grey sea, gulls, distant cranes. Bleak and empty.
```

## CASE 11 · 물길을 거슬러 (1986, 은천시 목골동 · 은천강 (가상 지명))

- 사건 파일: `cases/c11-riverside-1986.js` · 이미지 16장 · 난이도 ★★★★★
- **혐오감 주의 사건 (빨간 별)**: 폴더 표지에는 게임이 「혐오감 주의」 스티커를 붙이고 흐리게 처리한다. 🔞 그림은 흐리게 가려진 채 나오고 눌러야 보인다. **수위** — 범행 흔적은 진하게: 벽의 비산흔, 바닥의 낙하흔, 닦아 낸 호 모양 자국, 줄눈·배수구에 스민 피, 피가 밴 포대·봉투, 루미놀 반응. 시신은 천·방수포·포대·봉투에 가려진 채로, 손·아래팔·발, 비닐 너머 비치는 팔다리 윤곽, 매듭에 걸린 머리카락 정도까지. 절단면·장기·상처·죽은 사람의 얼굴은 넣지 않는다. 생성 AI 가 거절하면 한 단계 낮춰(예: 손 → 비닐 너머 윤곽) 다시 만들고 저장한다.
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Provincial South Korea in 1986, a slow river city in late autumn: 35mm press and police photography on Kodak Tri-X black-and-white or faded Fujicolor negative film, coarse grain, harsh on-camera flash or flat overcast light, slightly lifted blacks, a coarse newspaper halftone dot screen and yellowed newsprint where it appears in print. Period details: cement-block and tin-roof houses, stacks of coal briquettes, reed beds, concrete bridges on piers, an old iron sluice gate, hand carts, white woven polypropylene rice sacks, green-and-cream city buses with round headlights. No readable text, no logos or emblems, no recognizable faces (backs, silhouettes or out-of-focus figures only). Graphic content is limited to dried bloodstains on surfaces and covered or sacked remains seen at a distance: no wounds, no cut surfaces, no gore close-ups.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c11/cover — 기록실 폴더 표지 — 새벽 강가의 포대와 통제선 (사진 한 장이 서류철에 클립으로 끼워져 있다)
- 저장 경로: `img/c11/cover.webp` · 비율: 4:3
```
Cold dawn on the muddy bank of a slow, misty river in a 1986 provincial Korean city: three white woven polypropylene rice sacks tied tight at the mouth with twine lying in a row on the mud among cut reeds, a sagging police rope line strung between wooden stakes, a concrete bridge on piers fading into fog behind, an empty wooden rowboat pulled up on the bank, no people, blue-grey light, faded color negative film, grain.
```

### c11/news_reeds — 신문 1보 사진 — 하류 갈대밭 발견 현장 (멀리서) 🔞 열람 주의
- 저장 경로: `img/c11/news_reeds.webp` · 비율: 4:3
```
1986 Korean newspaper photograph printed with a coarse halftone dot screen on yellowed newsprint: a trampled reed bed on a riverbank on a grey morning, seen from a distance, several policemen in dark winter uniforms and a laborer holding a sickle standing in a loose circle with their backs to the camera around a white rice sack lying opened on a straw mat, a grey tarp thrown over what came out of it with only a pale limp shape showing at the tarp edge, heavy contrast, ink spread.
```
- 주의: 잘린 부위나 상처가 보이지 않게. 방수포 가장자리에 창백한 형체만.

### c11/news_bridge — 신문 사진 — 두 번째 포대가 걸린 시장교 교각
- 저장 경로: `img/c11/news_bridge.webp` · 비율: 4:3
```
1986 Korean newspaper halftone photograph on an overcast afternoon: a plain concrete city bridge on square piers over a slow river, two policemen in a small wooden rowboat at the third pier reaching with a boat hook toward a closed white sack snagged on the pier, a long row of onlookers in winter jackets lined along the bridge railing seen from behind, flat grey light, halftone dots.
```

### c11/news_shop — 신문 사진 — 셔터를 반쯤 내린 시장 정육점
- 저장 경로: `img/c11/news_shop.webp` · 비율: 4:3
```
1986 Korean newspaper halftone photograph at dusk in a crowded traditional market alley: the corrugated steel shutter of a small butcher shop half lowered, a bare bulb glowing inside over empty meat hooks, two plainclothes detectives in trench coats seen from behind leading away a stocky man in a white apron, market women watching from their stalls, flash, heavy contrast.
```

### c11/news_divers — 신문 사진 — 목골 나루에서 네 번째 포대를 건지는 잠수부
- 저장 경로: `img/c11/news_divers.webp` · 비율: 4:3
```
1986 Korean newspaper photograph with halftone dots: an old stone ferry landing on a riverbank at midday, two divers in black wetsuits climbing out of cold water, a closed dripping white rice sack and four red clay bricks tied together with twine laid on a tarp on the landing stones, a timber sawmill with stacked logs and a tin roof behind, policemen and onlookers kept at a distance, flat light. The four bricks must read as red: a faded colour newspaper print, or hand-tint only the bricks.
```
- **꼭 보여야 할 것**: 포대에 묶인 붉은 벽돌 네 장

### c11/news_workshop — 신문 연재 사진 — 청학 나전칠기 작업장 (지면에 실린 것)
- 저장 경로: `img/c11/news_workshop.webp` · 비율: 4:3
```
1986 Korean newspaper feature photograph in black and white: the interior of a small traditional mother-of-pearl lacquerware workshop, a craftsman in a grey work coat seen from behind bent over a half-finished black lacquered wardrobe inlaid with iridescent shell cranes, a wall pegboard with chisels and a Japanese-style pull saw, pale sawdust on a cement floor, soft window light, halftone print.
```

### c11/photo_sack — 감식 사진 — 벽돌이 달린 넷째 포대 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c11/photo_sack.webp` · 비율: 4:3
```
Black-and-white 1986 police evidence photograph under harsh flat flash, seen from above: a wet white woven polypropylene rice sack lying on a grey tarp on a concrete floor, the heavy round lump of what is inside pressing hard against the weave, the lower half of the sack soaked through with a dark rust-brown stain that has bled out into a wide watery ring on the tarp, the mouth tied tight with twine, a few strands of long dark wet hair caught in the knot, the twine running on to four red bricks bound together beside it, a small numbered evidence card and a wooden folding ruler, grain. The bricks are the only colour in the image, hand-tinted brick red.
```
- **꼭 보여야 할 것**: 붉은 벽돌 네 장 (벽돌만 붉게) · 아가리 매듭에 걸린 젖은 머리카락 몇 가닥 · 포대 아래로 번진 얼룩
- 주의: 포대는 닫힌 채로. 안은 불룩한 형체만. 절단면·장기·상처·죽은 사람의 얼굴은 보이지 않게.

### c11/autopsy_room — 은천의료원 부검실 — 흰 천 아래 수습된 시신 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c11/autopsy_room.webp` · 비율: 4:3
```
Black-and-white 1986 photograph of a small provincial hospital autopsy room: on a steel table under a single hanging lamp, not one body-shaped form but several separate shapes laid out in order beneath white sheets with clear gaps between them, rust-brown fluid seeping through the cloth in blotches where each covered piece ends, one pale limp hand visible at the edge of a sheet, a bone saw and rib shears on the instrument tray, an enamel basin of cloudy pink-grey water, a floor drain in the white tiles with a dark trickle running to it, a doctor in a gown seen from behind writing on a clipboard, cold light, grain.
```
- **꼭 보여야 할 것**: 천 아래가 한 사람 모양이 아니라 여러 덩어리로 떨어져 놓여 있다 (사이사이 틈) · 덩어리 끝마다 배어 나온 얼룩 · 손 하나
- 주의: 천 아래는 형체와 배어 나온 얼룩만. 절단면·장기·상처·죽은 사람의 얼굴은 보이지 않게.

### c11/items_table — 증거물 사진 — 잠바와 주머니 속 물건 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c11/items_table.webp` · 비율: 4:3
```
Top-down black-and-white evidence photograph under flat flash: a wet navy quilted vinyl jacket laid face-down on grey paper so its back panel faces the camera (no zipper visible), dark dried stains running down its left collar and shoulder and a wide smeared stain across the lower back with pale sawdust and tiny glittering flecks of mother-of-pearl dust stuck in it, beside it in a neat row a small soggy paper matchbox, two brass bus tokens, a few coins and a folded handkerchief, a numbered evidence card and a ruler, grain.
```
- **꼭 보여야 할 것**: 잠바 등판이 위로 (지퍼 안 보이게). 왼쪽 깃·어깨의 흐름흔, 등판 아래의 넓은 문질린 혈흔에 흰 톱밥과 반짝이는 가루

### c11/butcher_floor — 우성정육점 검증 뒤 가게 안 — 톱밥 바닥과 도마 🔞 열람 주의
- 저장 경로: `img/c11/butcher_floor.webp` · 비율: 4:3
```
Night flash photograph inside a tiny 1980s Korean market butcher shop after a police search, no people: a sawdust-covered cement floor, a scarred round wooden chopping block with dark dried stains, a row of empty steel meat hooks on a rail, a hand bone saw hanging on the tiled wall, a pile of empty white rice sacks in the corner, small paper evidence tags on string, harsh flash, grain.
```

### c11/gauge — 은천 수위관측소 앞 수위표와 유속 측정
- 저장 경로: `img/c11/gauge.webp` · 비율: 4:3
```
Photograph from 1986 of a small concrete river gauging station on a riverbank in late autumn: a tall white staff gauge post with black markings standing in slow flat water, a narrow wooden footbridge, a man in a padded jacket seen from behind on the bridge dropping a small wooden float into the water with a stopwatch in his other hand, bare willows, overcast, faded color negative film.
```

### c11/ledger_page — 대원상사 원장 펼친 면 (글씨는 흐릿하게)
- 저장 경로: `img/c11/ledger_page.webp` · 비율: 4:3
```
Close photograph of an open hand-ruled private loan ledger from 1980s Korea on a desk: thin ruled paper with columns of blurred illegible ballpoint entries, the name column left empty, a few red ink circles, a wooden abacus and a red seal ink pad beside it, warm desk lamp light, shallow depth of field, no readable text.
```

### c11/bus — 11번 버스 목골 종점의 밤
- 저장 경로: `img/c11/bus.webp` · 비율: 4:3
```
Night photograph from 1986 at a provincial city bus terminus on a dirt lot: a green-and-cream city bus with round headlights parked under a single street lamp, a young female bus conductor in uniform and cap seen from behind at the rear door, a man carrying a small blue vinyl bag under his arm walking away into a dark narrow alley between cement-block houses, grain, sodium and tungsten light. Faded colour film, so the small vinyl bag reads clearly as blue.
```
- **꼭 보여야 할 것**: 남자가 옆구리에 낀 파란 비닐 가방 (피해자의 수금 가방)

### c11/workshop_floor — 재조사 — 빈 작업장 바닥과 번호표 🔞 열람 주의
- 저장 경로: `img/c11/workshop_floor.webp` · 비율: 4:3
```
Photograph of an empty abandoned small workshop in early spring 1987: a bare cement floor with a round iron drain, a pale bleached patch scrubbed around the drain, dark dried brown bloodstains lingering in the cement joints and around the drain grate, small yellow numbered evidence markers set on the floor, an empty wall pegboard showing dust outlines of tools, one old workbench, cold window light, faded color negative film, grain.
```

### c11/occ_reeds — 제1보 첨부 — 갈밭에서 연 첫 포대 (현장 사진) 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c11/occ_reeds.webp` · 비율: 4:3
```
Black-and-white 1986 police scene photograph taken close with harsh flash on a grey November morning: a trampled reed bed at the edge of a slow river, a wet white woven rice sack lying on a straw mat with its twine untied and its mouth folded back, a pale, water-wrinkled human forearm and hand lying out of the sack mouth on the mat, fingers slightly curled, the rest hidden inside the sack, a grey tarp half pulled back beside it, the muddy rubber boots of policemen and a sickle on the ground at the edge of the frame, cut reeds and river mist behind, grain.
```
- **꼭 보여야 할 것**: 포대 아가리 밖으로 나온 창백한 아래팔과 손 (잘린 쪽은 포대 안에 가려져 안 보이게)
- 주의: 절단면·장기·상처·죽은 사람의 얼굴은 보이지 않게.

### c11/butcher_lumi — 우성정육점 검증 — 루미놀 암실 사진 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c11/butcher_lumi.webp` · 비율: 4:3
```
Darkroom luminol photograph from 1986, a 30-second exposure inside a tiny market butcher shop with every light off: almost the whole sawdust-covered floor glowing an eerie pale blue, a brighter blue ring around the base of the round chopping block, blue streaks running down into the floor drain and smeared hand-height on the front of the refrigerator, the meat hooks and counter only faint dark outlines, grainy, slightly blurred.
```
- **꼭 보여야 할 것**: 불 끈 가게 바닥 거의 전체가 푸르게 빛난다

## CASE 12 · 스물한 개의 봉투 (1994, 도쿄도 아사기구 가시와다이 (가상 지명))

- 사건 파일: `cases/c12-tokyo-1994.js` · 이미지 16장 · 난이도 ★★★★★
- **혐오감 주의 사건 (빨간 별)**: 폴더 표지에는 게임이 「혐오감 주의」 스티커를 붙이고 흐리게 처리한다. 🔞 그림은 흐리게 가려진 채 나오고 눌러야 보인다. **수위** — 범행 흔적은 진하게: 벽의 비산흔, 바닥의 낙하흔, 닦아 낸 호 모양 자국, 줄눈·배수구에 스민 피, 피가 밴 포대·봉투, 루미놀 반응. 시신은 천·방수포·포대·봉투에 가려진 채로, 손·아래팔·발, 비닐 너머 비치는 팔다리 윤곽, 매듭에 걸린 머리카락 정도까지. 절단면·장기·상처·죽은 사람의 얼굴은 넣지 않는다. 생성 AI 가 거절하면 한 단계 낮춰(예: 손 → 비닐 너머 윤곽) 다시 만들고 저장한다.
- **공통 스타일** (각 프롬프트 뒤에 붙이기):
```
Tokyo, autumn 1994 (Heisei 6), Japanese police and press documentation: 35mm color negative film with slightly faded Fuji-like greens and magentas, fine grain, harsh on-camera flash for night and interior shots, flat grey dawn light outdoors; press photos reproduced as coarse black-and-white newspaper halftone. Period details only: milky semi-transparent garbage bags, green wire-mesh park trash bins, pink coin payphones, VHS tapes, dedicated word processors, pagers, wooden sento lockers and tiled washing floors. No readable text, no logos, no recognizable faces.
```
- **생성 규칙 v2 적용**: 공통 스타일 뒤에 맨 위 「추가 스타일」 문단도 붙인다.

### c12/cover — 기록실 폴더 표지 — 새벽 공원길의 쓰레기통과 폴리스 라인
- 저장 경로: `img/c12/cover.webp` · 비율: 4:3
```
A narrow sand path through a small Tokyo neighborhood park at grey dawn in autumn 1994, a row of green wire-mesh trash bins along the path with milky semi-transparent garbage bags inside whose contents are indistinct, yellow police tape strung between two cherry trees, a long pond glinting behind, a distant brick bathhouse chimney over low shop roofs, no people, cold flat light, documentary press-photo framing from a low angle.
```
- 주의: 봉투 속은 보이지 않게. 표지는 흐림 처리 없이 보이므로 핏자국·시신 암시를 넣지 않는다.

### c12/n_park — 신문 사진 — 출입이 막힌 공원 동문과 시트 덮인 쓰레기통
- 저장 경로: `img/c12/n_park.webp` · 비율: 4:3
```
Black-and-white 1994 Japanese newspaper halftone photograph of a small park entrance with two concrete gate pillars, police tape across the gate, three trash bins covered with blue plastic sheets, two uniformed officers standing with their backs to the camera, onlookers blurred at the edge, overcast morning, coarse dot screen.
```

### c12/scene_bin — 발생 보고 첨부 — 새벽 쓰레기통 둘레와 시트 위의 봉투 (멀리서) 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c12/scene_bin.webp` · 비율: 4:3
```
Early-morning 1994 Tokyo park crime scene seen from a few metres away: forensic officers in navy uniforms and caps crouching around a green wire-mesh trash bin, a blue tarp on the sand path with a row of milky semi-transparent garbage bags laid out on it, the contents pressing against the film so that some shapes clearly read as parts of human limbs, the bend of a knee, the pale curve of a heel, fingertips flattened against the plastic, blood-tinged moisture beaded inside the film and pooled in the bag corners, dried brown stains smeared on the outside of the bags and on the tarp, small yellow numbered evidence markers, harsh flash mixing with grey dawn light, officers with their backs to the camera.
```
- **꼭 보여야 할 것**: 비닐 너머로 무릎·발뒤꿈치·손가락 끝처럼 사람 팔다리임을 알 수 있는 형태가 비친다
- 주의: 비닐 너머로 비치는 형태까지만. 절단면·장기·상처·죽은 사람의 얼굴은 보이지 않게.

### c12/bagsample — 감정서 첨부 — 번호표를 단 반투명 봉투 21장 (증거 사진) 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c12/bagsample.webp` · 비율: 4:3
```
Overhead police evidence photograph on a grey laboratory bench: a single row of eight tied milky semi-transparent 45-liter garbage bags, each with a small yellow numbered tag, through the frosted plastic the contents read as pale, water-bleached sections of human limbs, in one bag fingers pressed flat against the film, in another the outline of a foot, reddish-brown fluid pooled in the bottom corner of every bag, dried reddish-brown transfer stains on the outer film, one bag with a strip of clear packing tape over a tear, a scale ruler at the edge, flat fluorescent light with a slight green cast.
```
- **꼭 보여야 할 것**: 봉투 여덟 장 한 줄 · 비닐 너머 손가락·발 윤곽 · 봉투 구석에 고인 붉은 물기
- 주의: 비닐 너머로 비치는 형태까지만. 절단면·장기·상처·죽은 사람의 얼굴은 보이지 않게.

### c12/cleancart — 청소 작업 일지 첨부 — 청소 수레와 일지 판
- 저장 경로: `img/c12/cleancart.webp` · 비율: 4:3
```
A municipal park cleaning handcart parked beside a small prefab park office at dawn, a bamboo broom and a long-handled dustpan leaning on it, a clipboard with a handwritten ruled log sheet hanging from a nail on the wall (writing illegible), a folded stack of empty semi-transparent bags on the cart, puddles on the concrete, 1994 Tokyo, color film, soft grey light.
```

### c12/store — 편의점 저널 첨부 — 새벽의 역 앞 편의점
- 저장 경로: `img/c12/store.webp` · 비율: 4:3
```
A small 1994 Japanese convenience store across a quiet street from a suburban train station at 4:30 in the morning, glowing fluorescent interior seen through large windows, magazine rack by the glass, an empty parking space with a single delivery bicycle leaning on the wall, wet asphalt reflecting the light, orange fascia band with no readable lettering, color negative film, no people visible.
```
- 주의: 실제 편의점 체인의 색 배합·로고를 닮지 않게.

### c12/room — 가택 수색 조서 첨부 — 피해자 방 책상의 워드프로세서
- 저장 경로: `img/c12/room.webp` · 비율: 4:3
```
A cramped one-room apartment desk in 1994 Tokyo photographed with on-camera flash: a beige dedicated Japanese word processor with a small green-grey monochrome screen and built-in keyboard, a short stack of dark blue 3.5-inch floppy disks without labels, a wall calendar with pencil marks (illegible), an overflowing ashtray, a business card holder, harsh shadows, police search documentation style.
```

### c12/wp — 압수한 워드프로세서 화면 (글자는 흐리게)
- 저장 경로: `img/c12/wp.webp` · 비율: 4:3
```
Close-up of a 1990s Japanese dedicated word processor on an evidence table, its small backlit monochrome LCD screen glowing green-grey with blurred rows of characters and four empty password boxes, a 3.5-inch floppy disk half inserted in the side slot, an evidence tag string tied to the carrying handle, flash reflection on the screen, the screen text completely illegible.
```

### c12/sento — 신문 사진 — 굴뚝이 선 동네 목욕탕 「가시와유」
- 저장 경로: `img/c12/sento.webp` · 비율: 3:4
```
Black-and-white 1994 newspaper halftone photo of an old wooden Tokyo public bathhouse with a temple-like tiled gable roof and a tall brick chimney, standing alone between empty fenced vacant lots after a land-assembly buyout, a short cloth curtain at the entrance, a stack of scrap firewood by the side wall, late-afternoon light, curtain lettering illegible.
```

### c12/boiler — 가마 일지 첨부 — 가시와유 보일러실 아궁이와 장작 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c12/boiler.webp` · 비율: 4:3
```
Interior of a cramped 1994 Tokyo bathhouse boiler room lit by camera flash: a soot-blackened iron firebox door of a wood-fired water heater with a low orange glow, split scrap firewood stacked to waist height, an iron poker leaning against the wall, a concrete floor with a hose drain, dozens of fine dried dark brown spatter dots on the whitewashed wall 40 to 70 cm above the floor beside the door, their little tails pointing upward, a forensic scale ruler taped beside them, and a line of round dried drip stains leading across the floor from the firebox toward the doorway.
```
- **꼭 보여야 할 것**: 문 옆 벽 낮은 자리의 비산흔 수십 점 (꼬리가 위로) · 바닥을 가로지르는 둥근 낙하흔 한 줄
- 주의: 사람·시신 없음.

### c12/dengon — 역 전언판 (분필 글씨는 읽을 수 없게)
- 저장 경로: `img/c12/dengon.webp` · 비율: 4:3
```
A green chalk message blackboard mounted on a tiled wall beside the ticket gates of a small Tokyo commuter station in 1994, covered with scrawled chalk messages in many hands that are completely illegible, a chalk tray with stubs and an eraser, a row of green and pink payphones below, evening fluorescent light, commuters blurred in motion.
```

### c12/pinkphone — 전화 가입자 회신 첨부 — 탈의실 앞 분홍 공중전화 (참고 사진)
- 저장 경로: `img/c12/pinkphone.webp` · 비율: 3:4
```
A pink 10-yen coin payphone of the early-1990s Japanese type sitting on a worn wooden counter at the entrance of an old public bathhouse changing room, wooden shoe lockers and a folded cloth curtain in the soft-focus background, warm tungsten light, color film, no people.
```

### c12/videocard — 비디오 대여 회원증과 대여 봉투 (참고 사진)
- 저장 경로: `img/c12/videocard.webp` · 비율: 4:3
```
A 1990s Japanese video rental membership card with a cartoon panda mascot silhouette (no readable text) lying on a counter next to two black VHS tapes in a plain rental carry bag, flat flash lighting, evidence-reference photo style, all printing illegible.
```

### c12/butcher — 신문 사진 — 셔터를 반쯤 내린 정육점
- 저장 경로: `img/c12/butcher.webp` · 비율: 4:3
```
Black-and-white 1994 newspaper halftone photo of a small neighborhood butcher shop in a Tokyo shopping street with its metal shutter pulled half down in daytime, an empty refrigerated display case visible below the shutter, a hand-painted shop sign above (illegible), a bicycle parked in front, no people.
```

### c12/luminol — 현장 검증 조서 첨부 — 세척장 배수구와 핏자국, 번호표 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c12/luminol.webp` · 비율: 4:3
```
Forensic documentation photo of an old Japanese bathhouse washing floor of small white square tiles, flash-lit: a round cast-iron drain cover at the center, dried reddish-brown bloodstains smeared in wide sweeping arcs where someone wiped the floor again and again, dark brown lines settled in every grout joint around the drain, a trail of round drip stains 5 to 8 mm wide coming in from a doorway at the edge of the frame, three small yellow triangular numbered evidence markers and a scale ruler, a wooden bath stool and a plastic basin pushed to the side, no people.
```
- **꼭 보여야 할 것**: 닦아 낸 넓은 호 · 줄눈마다 스민 갈색 선 · 문 쪽에서 들어오는 둥근 낙하흔 한 줄
- 주의: 시신·신체 부위 없음. 흥건한 생피 말고 마르고 닦인 자국으로.

### c12/trap — 현장 검증 조서 첨부 — 분해한 세척장 배수구 트랩 🔞 열람 주의 🔁 다시 뽑기
- 저장 경로: `img/c12/trap.webp` · 비율: 4:3
```
Close forensic flash photograph, November 1994: the U-shaped cast-iron drain trap from under an old Japanese bathhouse washing floor taken apart and laid on a white enamel tray, its inside coated with dark red-brown sludge and settled sediment with a fine pale gritty powder mixed in, a few long strands of hair tangled in it, small chips of white tile, a steel ruler and a yellow numbered evidence marker, the gloved hands of a forensic officer at the edge of the frame, white tiles behind.
```
- **꼭 보여야 할 것**: U자 트랩 안의 검붉은 침전물과 섞인 희끄무레한 가루
- 주의: 사람 신체 부위 없음.
