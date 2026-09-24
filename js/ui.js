/* Monologue Gaze — 브라우저 기본 부품 대신 쓰는 것들 (css/ui.css 와 짝)
 * 1. 말풍선: title 대신 data-tip. 마우스를 올리거나 키보드로 옮겨 가면 종이쪽지가 뜬다.
 * 2. 입력칸: 브라우저 자동 완성 목록·맞춤법 밑줄이 뜨지 않게 한다.
 */
(function () {
  let tip = null, cur = null, wait = 0;
  function show(el) {
    const s = el.getAttribute('data-tip');
    if (!s) return;
    // 이름표가 이미 보이면(큰 지도의 지점 등) 말풍선을 따로 띄우지 않는다
    const lab = el.querySelector(':scope > span');
    if (lab && lab.offsetParent !== null && lab.textContent.trim() === s.trim()) return;
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
    tip.textContent = s;
    tip.classList.remove('below');
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    const x = Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2));
    let y = r.top - h - 10;
    if (y < 8) { y = r.bottom + 10; tip.classList.add('below'); }
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    tip.style.setProperty('--ax', Math.round(r.left + r.width / 2 - x) + 'px');
    tip.classList.add('on');
    cur = el;
  }
  function hide() { clearTimeout(wait); cur = null; if (tip) tip.classList.remove('on'); }
  const at = e => (e.target && e.target.closest ? e.target.closest('[data-tip]') : null);
  document.addEventListener('pointerover', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const el = at(e);
    if (el === cur) return;
    hide();
    if (el) wait = setTimeout(() => { if (el.isConnected) show(el); }, 260);
  });
  document.addEventListener('pointerout', e => { const el = at(e); if (el && !el.contains(e.relatedTarget)) hide(); });
  document.addEventListener('focusin', e => { const el = at(e); if (el && el.matches(':focus-visible')) show(el); else hide(); });
  document.addEventListener('focusout', hide);
  ['pointerdown', 'scroll', 'keydown', 'wheel'].forEach(ev => document.addEventListener(ev, hide, { capture: true, passive: true }));

  function tidy(root) {
    if (!root || !root.querySelectorAll) return;
    const list = root.matches && root.matches('input,textarea') ? [root] : root.querySelectorAll('input,textarea');
    list.forEach(i => {
      if (i.dataset.ui) return;
      i.dataset.ui = '1';
      i.setAttribute('autocomplete', 'off'); i.setAttribute('spellcheck', 'false'); i.setAttribute('autocorrect', 'off'); i.setAttribute('autocapitalize', 'off');
    });
  }
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1) tidy(n); }))).observe(document.documentElement, { childList: true, subtree: true });
})();
