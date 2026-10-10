# 효과음 출처

## 수사 소리 (실제 녹음 · 2026-10-10)

모두 **CC0 1.0 (퍼블릭 도메인)** 녹음을 잘라 다듬은 것이다. 상업·비상업 어디에 써도 되고 출처 표기 의무도 없지만, 녹음한 사람을 적어 둔다.
CC0: https://creativecommons.org/publicdomain/zero/1.0/

받은 곳: Freesound(로그인 없이 받을 수 있는 128kbps 미리 듣기 파일), Kenney 「RPG Audio」 묶음.
다듬기: 한 채널(mono) · 44.1kHz · 앞뒤 무음과 잔향을 자르고 짧게 페이드 · 낮은 웅웅거림은 고역 통과(120~350Hz)로 걷어 냄 · 소리 크기는 게임 안 종이 넘기는 소리(`page`)에 맞춤 · mp3 80kbps.
엔진은 사건의 시대에 따라 `_paper`(종이 기록 사건)와 `_screen`(모니터·노트북 사건)을 고르고, 1980년 앞 종이 사건은 재생할 때 높은 소리를 조금 더 깎는다 (`js/engine.js` 의 `sfxFile`·`eraDark`).

| 파일 | 언제 | 무슨 소리 | 원본 · 녹음한 사람 · 라이선스 |
|---|---|---|---|
| `find_paper.mp3` | 사진에서 무언가 찾음 (종이 사건) | 연필로 동그라미 치기 0.5초 | [Pencil Circle](https://freesound.org/people/sokworks/sounds/860361/) · sokworks · CC0 |
| `clue_paper.mp3` | 새 단서·메모 (종이) | 수첩에 연필로 체크 표시 | [pencil_check_mark_2.wav](https://freesound.org/people/jakobhandersen/sounds/181056/) · jakobhandersen · CC0 |
| `match_paper.mp3` | 「유력」 연결·물음 풀림 (종이) | 스테이플러로 두 장을 찍음 | [stapler.wav](https://freesound.org/people/skynproduction/sounds/91490/) · skynproduction · CC0 |
| `unlock_paper.mp3` | 잠긴 기록이 열림 (종이) | 서랍 자물쇠에 열쇠를 돌리고 서랍이 밀려 나옴 | [Key Twist in lock](https://freesound.org/people/KieranKeegan/sounds/418846/) · KieranKeegan · CC0 + [Opening/closing a wooden drawer](https://freesound.org/people/fleurescence/sounds/573161/) · fleurescence · CC0 |
| `miss_paper.mp3` | 헛짚음·막힘·반려 (종이) | 연필로 덧그어 지우기 | [Scribble](https://freesound.org/people/Tomoyo%20Ichijouji/sounds/211247/) · Tomoyo Ichijouji · CC0 |
| `find_screen.mp3` | 사진에서 무언가 찾음 (화면 사건) | 마우스 딸깍 + 작게 사진기 셔터 | [mouse-click-double-00.flac](https://freesound.org/people/pbimal/sounds/534104/) · pbimal · CC0 + [shutter click canon eos 5D](https://freesound.org/people/chrisvink/sounds/270435/) · chrisvink · CC0 |
| `clue_screen.mp3` | 새 단서·메모 (화면) | 노트북 엔터 키 | [laptop keyboard enter.wav](https://freesound.org/people/Sorinious_Genious/sounds/561101/) · Sorinious_Genious · CC0 |
| `match_screen.mp3` | 「유력」 연결·물음 풀림 (화면) | 화이트보드에 자석을 붙임 | [11 Magnet on whiteboard.wav](https://freesound.org/people/15FPanska_Hecl_Filip/sounds/461145/) · 15FPanska_Hecl_Filip · CC0 |
| `unlock_screen.mp3` | 잠긴 기록이 열림·조회 신청 접수 (화면) | 마우스 두 번 눌러 파일 열기 | [mouse-click-double-00.flac](https://freesound.org/people/pbimal/sounds/534104/) · pbimal · CC0 |
| `miss_screen.mp3` | 헛짚음·막힘·반려 (화면) | 노트북 백스페이스 두 번 | [Laptop backspace.WAV](https://freesound.org/people/14FPanskaVesecka_Karolina/sounds/419963/) · 14FPanskaVesecka_Karolina · CC0 |
| `solved_stamp.mp3` | 사건 종결·기록실 폴더 도장 (모든 시대) | 고무도장을 종이에 찍고 떼기 | [Stamp](https://freesound.org/people/kermite607/sounds/362624/) · kermite607 · CC0 |
| `confess_desk.mp3` | 증거를 내밀어 추궁 (모든 시대) | 기록철을 책상에 내려놓는 탁 | `bookPlace1.ogg` · [Kenney RPG Audio](https://kenney.nl/assets/rpg-audio) · Kenney Vleugels · CC0 |
| `dread_envelope.mp3` | 가려 둔 끔찍한 사진을 열 때, 끔찍한 기록을 처음 펼칠 때 (모든 시대) | 봉투가 책상 위로 미끄러짐 | [Sliding Envelope.wav](https://freesound.org/people/MTJohnson/sounds/444431/) · MTJohnson · CC0 |
| `radio_squelch.mp3` | 현행 사건을 열 때 무전 | 무전 끝의 치익 | [End radio transmission](https://freesound.org/people/ReadeOnly/sounds/47646/) · ReadeOnly · CC0 |
| `buzz_phone.mp3` | 현행 사건 단톡방 알림 | 휴대폰이 유리 탁자 위에서 드르륵 두 번 | [cell phone vibrate glass_loopable.wav](https://freesound.org/people/mobaudio/sounds/384487/) · mobaudio · CC0 |

## ElevenLabs 로 만든 소리 (tools/voices.js 의 SFX)

`pen` `write` `typewriter` `tw1` `oldkbd` `kbd` `tap` `page` `click` `key` — 적는 소리·넘기는 소리·딸깍. 지금도 쓴다.

`clue` `match` `confess` `miss` `solved` `unlock` `find` `dread` `gore` `bonesaw` `flies` `creak` `crackle` `static` — 엔진이 더는 틀지 않는다
(북·낮은 울림·공포 효과음이라 위의 실제 녹음으로 바꿨다). 파일을 지우면 `node tools/voices.js` 가 없는 효과음을 다시 만들며 크레딧을 쓰므로,
지울 때는 tools/voices.js 의 SFX 에서 먼저 뺄 것.
