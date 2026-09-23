# 다시 뽑을 이미지

> `node tools/prompts.js` 가 자동으로 만든다. 사건 파일 `art` 항목의 `redo` 표시를 모은 것이다.

총 **15장** (필수 3 · 선택 12). 같은 경로·같은 이름으로 넣으면 게임 그림이 자동으로 바뀐다. 바꾼 뒤에는 그 항목의 `redo` 표시를 지운다.

| 그림 | 급함 | 이유 |
|---|---|---|
| `c01/q_thread` | 필수 | 실이 회색으로 나와 「붉은 무명실」 단서가 안 보인다. |
| `c04/montage` | 필수 | 너무 사실적인 한 사람의 깨끗한 증명사진처럼 나왔다. 신문 망점 느낌이 없고, 실제 사건 몽타주와 닮아 보일 위험이 있다. |
| `c06/stern` | 필수 | 캡션은 「새 페인트 밑으로 다른 글자 자국이 도드라짐」인데 그림에 글자 흔적이 아예 없다. 이 사건의 핵심 단서다. |
| `c02/calendar` | 선택 | 숫자 7 로 나와서 지워 두었다. 지금도 쓸 만하지만 26 이 보이면 더 좋다. |
| `c02/kasten` | 선택 | 외딴 농가인데 창밖에 실제 뮌헨 대성당 쌍탑이 보인다. |
| `c02/sledge` | 선택 | 판화+사진 두 칸으로 나와서 판화 칸만 잘라 두었다. 지금도 쓸 만하다. |
| `c02/lock` | 선택 | 「새 자물쇠」인데 녹슨 헌 자물쇠처럼 보인다. |
| `c03/p_radio` | 선택 | 캡션은 「스위치 켜진 채」인데 다이얼 불이 안 보이고, 표지 라디오와 모양이 다르다. |
| `c05/cipherimg` | 선택 | 기호가 네 가지뿐이고 규칙적으로 되풀이돼 무늬처럼 보인다. 게임 속 암호문(글자마다 다른 기호)과 안 맞는다. |
| `c06/valley` | 선택 | 신문 사진인데 요즘 디지털 컬러 사진처럼 선명하게 나왔다 (망점·흑백 인쇄 느낌 없음). |
| `c06/station` | 선택 | 신문 사진인데 깨끗한 컬러 사진으로 나왔다 (망점·흑백 인쇄 느낌 없음). |
| `c08/note_paper` | 선택 | 쪽지 글씨가 크고 삐뚤어 엉터리 한글로 읽혀서 흐리게 해 두었다. 캡션은 「자로 대고 쓴 듯 반듯하다」. |
| `c08/montage_print` | 선택 | 신문 제목이 엉터리 한글로 읽혀서 흐리게 지워 두었다. 지금도 쓸 만하다. |
| `c08/flyer` | 선택 | 제목이 엉터리 한글로 읽혀서 흐리게 지워 두었다. 지금도 쓸 만하다. |
| `c11/items_table` | 선택 | 본문은 「등판 아래쪽 혈흔에 톱밥과 반짝이는 가루」인데 사진은 앞판(지퍼)이 보이고 반짝이 가루가 없다. 자개 작업장으로 이어지는 단서다. |

## c01/q_thread — 경찰의 소견 — 증거물 붉은 무명실 (필수)
- 저장 경로: `img/c01/q_thread.png` · 비율: 4:3
- 이유: 실이 회색으로 나와 「붉은 무명실」 단서가 안 보인다.
- **꼭 보여야 할 것**: 실은 붉은색 (흑백 판화라도 실만 붉게)
```
A short length of red cotton thread tied in a small knot, laid on a plain white evidence card with a blank paper label, on a police surgeon's wooden table beside a magnifying glass, clinical still life. The thread is bright red, the only colour in the image, as if hand-tinted. 19th-century British newspaper wood engraving, dense cross-hatched black ink on off-white newsprint, Victorian London East End c.1888: gas-lit fog, wet cobblestones, soot-dark brick. Evidence items are drawn like engraved catalogue plates with the same hatching. Figures only as silhouettes, from behind or with faces hidden in shadow. No faces, no blood, no wounds, no bodies, no readable text, no real brands. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c04/montage — 신문에 실린 몽타주 사진 (특정 인물 아님) (필수)
- 저장 경로: `img/c04/montage.png` · 비율: 3:4
- 이유: 너무 사실적인 한 사람의 깨끗한 증명사진처럼 나왔다. 신문 망점 느낌이 없고, 실제 사건 몽타주와 닮아 보일 위험이 있다.
- 주의: 실존 인물(특히 실제 사건 몽타주의 얼굴)을 닮지 않게. 여러 얼굴을 조합한 듯 어색하게.
```
A 1960s police photo-composite portrait printed in a newspaper: a generic young man in a white open-face helmet and black leather jacket, face assembled from mismatched photo fragments with faint seams, coarse halftone dots, flat grey tones, deliberately generic features that resemble no real person. Make the composite obvious: eyes, nose and mouth come from three different photos that do not match in scale or tone, with visible cut lines, and the whole print is coarse, blurry newspaper halftone on yellowed newsprint rather than a clean photo. Late-1960s Japanese press and police evidence photography, Tokyo suburbs in the rainy season of 1968: black-and-white 35mm Tri-X film, pushed grain, slightly soft focus, flat overcast light, wet asphalt sheen, muted grey tonality; evidence-card shots on a plain board with a small ruler, occasionally as faded early color prints with a cyan shift. Showa-era details only. No readable text, no logos, no recognizable faces. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c06/stern — 현상한 필름 7번 — 새 페인트 밑 옛 글자 자국이 보이는 고물 (필수)
- 저장 경로: `img/c06/stern.png` · 비율: 4:3
- 이유: 캡션은 「새 페인트 밑으로 다른 글자 자국이 도드라짐」인데 그림에 글자 흔적이 아예 없다. 이 사건의 핵심 단서다.
- **꼭 보여야 할 것**: 새로 칠한 글자 한 줄 + 그 밑으로 도드라진 옛 글자 윤곽 (읽히지는 않게)
```
Close-up 35mm photograph of the stern of a rusty small cargo ship at a quay: freshly painted name letters on the dark hull, and beneath the new paint the faint raised outlines of older, different letters showing in low raking morning light. The two rows must be clearly visible as shapes: a short row of fresh white painted letters, and around and beneath it a longer row of older letter outlines standing out as raised ridges and paint edges in the raking light. Letter shapes only, blurred so no word can be read. Water reflections, cool muted colours. 1969 Norwegian police and press photography on 35mm film: Tri-X style black-and-white grain for police documentation, faded early colour film with a cool blue-green cast for everything else; overcast west-coast light, wet rock, heather and harbour mist. Documentary and quiet. No readable text, no faces, no bodies. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c02/calendar — 안방 검증 조서 — 벽의 뜯는 달력과 십자가 (선택)
- 저장 경로: `img/c02/calendar.png` · 비율: 4:3
- 이유: 숫자 7 로 나와서 지워 두었다. 지금도 쓸 만하지만 26 이 보이면 더 좋다.
- **꼭 보여야 할 것**: 달력 맨 위 장은 26 (1월 26일에서 멈췄다). 다른 숫자가 나오면 이야기와 어긋난다.
```
Corner of a Bavarian farmhouse living room in 1923: a simple wooden crucifix on a whitewashed wall and beside it a tear-off daily wall calendar with a thick block of unturned pages, its top sheet showing the large date numeral 26 (the only legible mark). Below, the edge of a treadle sewing machine and an unopened envelope on a table. No other readable text. Early 1920s Bavarian police and press photography: silver gelatin print from a glass-plate camera, heavy grain, warm sepia toning, soft vignetting, faint dust and scratches, cold overcast winter daylight and deep snow. Documentary, still and quiet. No readable text, no faces, no bodies, no blood. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c02/kasten — 증거물 카드 — 지폐 다발이 그대로 든 쇠 금고 (선택)
- 저장 경로: `img/c02/kasten.png` · 비율: 4:3
- 이유: 외딴 농가인데 창밖에 실제 뮌헨 대성당 쌍탑이 보인다.
```
Evidence photograph: a small iron strongbox standing open on a table, holding thick bundles of 1920s German inflation banknotes tied with string, a few old silver coins and folded papers; a blank police evidence card beside it, flat overhead light, heavy grain. Plain wall behind, no window. Early 1920s Bavarian police and press photography: silver gelatin print from a glass-plate camera, heavy grain, warm sepia toning, soft vignetting, faint dust and scratches, cold overcast winter daylight and deep snow. Documentary, still and quiet. No readable text, no faces, no bodies, no blood. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c02/sledge — 주보 광고면 삽화 — 장작 실은 말썰매 (목판화풍) (선택)
- 저장 경로: `img/c02/sledge.png` · 비율: 4:3
- 이유: 판화+사진 두 칸으로 나와서 판화 칸만 잘라 두었다. 지금도 쓸 만하다.
- **꼭 보여야 할 것**: 흰 말이 끄는 장작 썰매, 목판화 한 칸만
```
Small-town newspaper advertisement illustration from the 1920s in woodcut style: a white horse pulling a wooden work sledge loaded with split firewood through snow, bold black lines on off-white paper, letterpress printing texture. One single woodcut panel only: no photograph, no second panel. No text. Early 1920s Bavarian police and press photography: silver gelatin print from a glass-plate camera, heavy grain, warm sepia toning, soft vignetting, faint dust and scratches, cold overcast winter daylight and deep snow. Documentary, still and quiet. No readable text, no faces, no bodies, no blood. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c02/lock — 대장간 주문 장부 — 찾아가지 않은 새 자물쇠 (선택)
- 저장 경로: `img/c02/lock.png` · 비율: 4:3
- 이유: 「새 자물쇠」인데 녹슨 헌 자물쇠처럼 보인다.
- **꼭 보여야 할 것**: 새것인 자물쇠 (찾아가지 않은 새 주문품)
```
A new hand-forged iron box lock for a farmhouse door with two large iron keys, lying on a sooty wooden shelf in a village blacksmith's forge in 1923, faint glowing embers out of focus in the background. The lock and keys are brand-new and unrusted: bright freshly filed iron, crisp edges, clearly never used. Early 1920s Bavarian police and press photography: silver gelatin print from a glass-plate camera, heavy grain, warm sepia toning, soft vignetting, faint dust and scratches, cold overcast winter daylight and deep snow. Documentary, still and quiet. No readable text, no faces, no bodies, no blood. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c03/p_radio — 현장 사진 — 안방의 라디오 수신기 (선택)
- 저장 경로: `img/c03/p_radio.png` · 비율: 4:3
- 이유: 캡션은 「스위치 켜진 채」인데 다이얼 불이 안 보이고, 표지 라디오와 모양이 다르다.
- **꼭 보여야 할 것**: 표지와 같은 모양의 라디오, 다이얼 불이 켜진 채 (스위치가 켜져 있었다)
```
Police photograph of the same 1930s wooden cathedral-style vacuum-tube radio as on the folder cover, left switched on with its small tuning dial glowing warm, on a low table in a Korean ondol room, lattice paper doors behind, a floor cushion pushed aside, a cold brass ashtray, flat flash lighting, nobody in the frame. Colonial-era Gyeongseong (Seoul), autumn 1935. Newspaper pictures look like 1930s Korean newspaper halftone photographs on cheap yellowed newsprint: coarse dot screen, heavy black ink, slight misregistration, faded contrast. Police photographs look like grainy silver gelatin prints with soft vignetting. Tiled-roof hanok shopfronts, narrow dirt alleys, electric poles, trams, paper-covered lattice doors. People only as silhouettes, from behind or blurred. No faces, no blood, no bodies, no readable text or signage, no real brands. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c05/cipherimg — 1면에 실린 암호문 (기호만, 뜻 없는 도형 배열) (선택)
- 저장 경로: `img/c05/cipherimg.png` · 비율: 4:3
- 이유: 기호가 네 가지뿐이고 규칙적으로 되풀이돼 무늬처럼 보인다. 게임 속 암호문(글자마다 다른 기호)과 안 맞는다.
- **꼭 보여야 할 것**: 기호 종류가 많고 불규칙하게 (4 가지가 되풀이되면 암호로 안 보인다)
```
A newspaper front-page detail printed in halftone: a block of simple geometric hand-drawn symbols (circles, triangles, crossed circles, diamonds) arranged in three uneven rows like a cipher, no letters or readable words, slightly smudged ink, folded newsprint texture. Use about fifteen different symbol shapes (squares with crosses, circles with bars, arrows, half-moons, hourglass marks and so on) in an irregular, non-repeating sequence, like a real substitution cipher. 1969 American newspaper wire photo and police file photography, Northern California coast: black-and-white 35mm Tri-X, heavy grain, harsh on-camera flash at night, coastal fog and sodium streetlight glow, halftone dot texture when reproduced in the newspaper, late-1960s cars, phone booths and street furniture without brand logos. No readable text, no recognizable faces, no bodies, no blood, no weapons shown. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c06/valley — 신문 10월 20일자 — 크비트달 등산로 (선택)
- 저장 경로: `img/c06/valley.png` · 비율: 4:3
- 이유: 신문 사진인데 요즘 디지털 컬러 사진처럼 선명하게 나왔다 (망점·흑백 인쇄 느낌 없음).
```
Newspaper photograph of a remote rocky valley above a small Norwegian west-coast town in late October 1969: a narrow hiking path winding up between boulders, heather and a few bare birches, low cloud on the ridges, wet stone, no people. Coarse halftone newsprint look. 1969 Norwegian police and press photography on 35mm film: Tri-X style black-and-white grain for police documentation, faded early colour film with a cool blue-green cast for everything else; overcast west-coast light, wet rock, heather and harbour mist. Documentary and quiet. No readable text, no faces, no bodies. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c06/station — 신문 10월 23일자 — 역 수하물 보관소 창구 (선택)
- 저장 경로: `img/c06/station.png` · 비율: 4:3
- 이유: 신문 사진인데 깨끗한 컬러 사진으로 나왔다 (망점·흑백 인쇄 느낌 없음).
```
Interior of a small Norwegian railway station left-luggage office in 1969: a wooden counter with a hinged hatch, shelves behind it holding suitcases and parcels with paper tags, a round wall clock, empty benches. Newspaper halftone photograph, no people. 1969 Norwegian police and press photography on 35mm film: Tri-X style black-and-white grain for police documentation, faded early colour film with a cool blue-green cast for everything else; overcast west-coast light, wet rock, heather and harbour mist. Documentary and quiet. No readable text, no faces, no bodies. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c08/note_paper — 가람역 부스 전화번호부 사이에서 나온 쪽지 (복사본) (선택)
- 저장 경로: `img/c08/note_paper.png` · 비율: 4:3
- 이유: 쪽지 글씨가 크고 삐뚤어 엉터리 한글로 읽혀서 흐리게 해 두었다. 캡션은 「자로 대고 쓴 듯 반듯하다」.
- **꼭 보여야 할 것**: 자를 대고 그은 듯 곧은 획 (읽히지는 않게)
- 주의: 글자가 읽히지 않게.
```
Photocopy-style evidence photo of a small torn scrap of lined notebook paper lying on the open pages of a thick public telephone directory, a short message written in stiff angular ballpoint strokes drawn along a ruler, the strokes blurred so nothing is readable, flat flash, grey tones. Early-1990s Seoul, shot on a consumer compact 35mm film camera: color negative film look, on-camera flash at night, slight green-orange color cast from sodium street lamps, visible grain, soft focus; police evidence photos are flat flash on grey paper; newspaper images are coarse black-and-white halftone. 1991 Korean street details: card-and-coin public phone booths, an elevated steel subway bridge, red-brick multi-family houses, small corner shops with sliding aluminium-glass doors, tangled utility wires, a church bell tower with a red neon cross. No faces (backs, silhouettes or blurred figures only), no readable text, no logos or brand marks. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c08/montage_print — 신문에 실린 몽타주 (망점 인쇄) (선택)
- 저장 경로: `img/c08/montage_print.png` · 비율: 3:4
- 이유: 신문 제목이 엉터리 한글로 읽혀서 흐리게 지워 두었다. 지금도 쓸 만하다.
- 주의: 제목·본문 모두 뭉개진 회색 줄로만. montage 이미지를 참고 이미지로 넣어 같은 그림을 신문 인쇄 느낌으로.
```
The same generic police composite sketch reproduced small in a 1991 Korean newspaper with a coarse halftone dot screen on yellowed newsprint, blurred and low-detail, only the black-rimmed glasses and work-jacket collar clearly visible. Early-1990s Seoul, shot on a consumer compact 35mm film camera: color negative film look, on-camera flash at night, slight green-orange color cast from sodium street lamps, visible grain, soft focus; police evidence photos are flat flash on grey paper; newspaper images are coarse black-and-white halftone. 1991 Korean street details: card-and-coin public phone booths, an elevated steel subway bridge, red-brick multi-family houses, small corner shops with sliding aluminium-glass doors, tangled utility wires, a church bell tower with a red neon cross. No faces (backs, silhouettes or blurred figures only), no readable text, no logos or brand marks. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c08/flyer — 실종 전단 사진 자리 — 인쇄가 번져 얼굴은 알아볼 수 없음 (선택)
- 저장 경로: `img/c08/flyer.png` · 비율: 3:4
- 이유: 제목이 엉터리 한글로 읽혀서 흐리게 지워 두었다. 지금도 쓸 만하다.
- 주의: 얼굴이 드러나지 않게. 제목도 뭉개진 회색 띠로만.
```
A 1991 photocopied missing-person flyer lying on a police desk: the student ID photo area is a heavily smeared, over-copied grey blob so no face can be made out, dense lines of Korean text below reduced to illegible grey stripes, a thumbtack hole at the top, flat light. Early-1990s Seoul, shot on a consumer compact 35mm film camera: color negative film look, on-camera flash at night, slight green-orange color cast from sodium street lamps, visible grain, soft focus; police evidence photos are flat flash on grey paper; newspaper images are coarse black-and-white halftone. 1991 Korean street details: card-and-coin public phone booths, an elevated steel subway bridge, red-brick multi-family houses, small corner shops with sliding aluminium-glass doors, tangled utility wires, a church bell tower with a red neon cross. No faces (backs, silhouettes or blurred figures only), no readable text, no logos or brand marks. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```

## c11/items_table — 증거물 사진 — 잠바와 주머니 속 물건 (선택)
- 저장 경로: `img/c11/items_table.png` · 비율: 4:3
- 이유: 본문은 「등판 아래쪽 혈흔에 톱밥과 반짝이는 가루」인데 사진은 앞판(지퍼)이 보이고 반짝이 가루가 없다. 자개 작업장으로 이어지는 단서다.
- **꼭 보여야 할 것**: 잠바 등판이 위로 (지퍼 안 보이게). 왼쪽 깃·어깨의 흐름흔, 등판 아래의 넓은 문질린 혈흔에 흰 톱밥과 반짝이는 가루
```
Top-down black-and-white evidence photograph under flat flash: a wet navy quilted vinyl jacket laid face-down on grey paper so its back panel faces the camera (no zipper visible), dark dried stains running down its left collar and shoulder and a wide smeared stain across the lower back with pale sawdust and tiny glittering flecks of mother-of-pearl dust stuck in it, beside it in a neat row a small soggy paper matchbox, two brass bus tokens, a few coins and a folded handkerchief, a numbered evidence card and a ruler, grain. Provincial South Korea in 1986, a slow river city in late autumn: 35mm press and police photography on Kodak Tri-X black-and-white or faded Fujicolor negative film, coarse grain, harsh on-camera flash or flat overcast light, slightly lifted blacks, a coarse newspaper halftone dot screen and yellowed newsprint where it appears in print. Period details: cement-block and tin-roof houses, stacks of coal briquettes, reed beds, concrete bridges on piers, an old iron sluice gate, hand carts, white woven polypropylene rice sacks, green-and-cream city buses with round headlights. No readable text, no logos or emblems, no recognizable faces (backs, silhouettes or out-of-focus figures only). Graphic content is limited to dried bloodstains on surfaces and covered or sacked remains seen at a distance: no wounds, no cut surfaces, no gore close-ups. Show exactly what the prompt names: counts, colours and positions. If the style is black-and-white but an object has a named colour, keep that colour on that object only, as if hand-tinted. For still-life and evidence shots use a simple background: no window view, no street scene, no passers-by, no city skyline. Show no numerals or dates except those the prompt gives. Wherever text would appear (headlines, flyers, notes, signs), render it only as smeared grey bands or soft blurred strokes, never as crisp pseudo-Hangul, pseudo-kanji or pseudo-kana. One single image, no inset panels, no collage, no second version of the scene. No recognizable real landmarks unless the prompt names them.
```
