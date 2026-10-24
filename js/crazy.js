/* CrazyGames 판에만 들어간다 (node tools/itch-zip.js --crazy 가 index.html 의 js/i18n.js 앞에 SDK 와 함께 끼운다).
 * 진행 저장은 SDK 의 data 모듈로: 로그인한 사람은 다른 기기에서도 이어 하고, 손님은 SDK 가 이 브라우저에 둔다.
 * SDK 가 없거나 꺼진 곳(로컬 파일 · 다른 도메인)에서는 아무것도 하지 않아 평소처럼 localStorage 에 쓴다. */
(function () {
  var MG = window.MG = window.MG || {};
  var sdk = window.CrazyGames && window.CrazyGames.SDK;
  if (!sdk || sdk.environment === 'disabled') return;
  MG.crazy = sdk;
  var init;
  try { init = Promise.resolve(sdk.init()); } catch (e) { return; }
  // 준비가 늦어도 책상은 연다: 8초가 지나면 이 브라우저 저장으로 (그동안 쓴 기록이 SDK 쪽과 갈라지지 않게 그 뒤로는 바꾸지 않는다)
  var late = false;
  MG.wait = Promise.race([
    init.then(function () { if (!late && (sdk.environment === 'crazygames' || sdk.environment === 'local')) MG.store = sdk.data; }),
    new Promise(function (r) { setTimeout(function () { late = true; r(); }, 8000); })
  ]).catch(function () { /* SDK 오류: 이 브라우저 저장으로 */ });
})();
