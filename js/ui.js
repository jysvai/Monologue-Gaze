/* Monologue Gaze — 브라우저 기본 부품 대신 쓰는 것들 (css/ui.css 와 짝)
 * 1. 말풍선: title 대신 data-tip. 마우스를 올리거나 키보드로 옮겨 가면 종이쪽지가 뜬다.
 * 2. 입력칸: 브라우저 자동 완성 목록·맞춤법 밑줄이 뜨지 않게 한다.
 * 3. 그림: 크게 볼 수 있는 그림·열람 주의 사진도 키보드(Tab → Enter)로 닿게 한다.
 * 4. 크게 보기 창: 열려 있는 동안 Tab 이 뒤로 새지 않고, 닫히면 보던 그림으로 돌아간다.
 * 5. 잠금·조회 칸: 틀린 번호를 넣어 칸이 다시 그려져도 커서가 그 칸에 남는다.
 */
(function () {
  let tip = null, cur = null, wait = 0;
  function show(el) {
    const s = el.getAttribute('data-tip');
    if (!s) return;
    // 이름표가 이미 보이면(큰 지도의 지점 등) 말풍선을 따로 띄우지 않는다
    const lab = el.querySelector(':scope > span');
    if (lab && lab.offsetParent !== null && lab.textContent.trim() === s.trim()) return;
    // 수첩의 「※ 요령」 줄이 .tip 을 쓰므로 말풍선은 .ui-tip 으로 따로 부른다 (겹치면 요령 줄이 투명해진다)
    if (!tip) { tip = document.createElement('div'); tip.className = 'ui-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
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

  // 엔진이 누르면 크게 보여 주는 그림 (js/engine.js zoom 과 같은 고르기)
  const ZOOMABLE = '.cmp-art img, .b-img img, .map img';
  function tidy(root) {
    if (!root || !root.querySelectorAll) return;
    const list = root.matches && root.matches('input,textarea') ? [root] : root.querySelectorAll('input,textarea');
    list.forEach(i => {
      if (i.dataset.ui) return;
      i.dataset.ui = '1';
      i.setAttribute('autocomplete', 'off'); i.setAttribute('spellcheck', 'false'); i.setAttribute('autocorrect', 'off'); i.setAttribute('autocapitalize', 'off');
    });
    const imgs = root.matches && root.matches(ZOOMABLE) ? [root] : root.querySelectorAll(ZOOMABLE);
    imgs.forEach(img => {
      if (img.hasAttribute('data-ui-key') || img.closest('.zoom')) return;
      img.setAttribute('data-ui-key', ''); img.tabIndex = 0; img.setAttribute('role', 'button');
      label(img);
    });
  }
  // 열람 주의 사진은 가려져 있는 동안 「눌러서 보기」, 걷힌 뒤에는 「크게 보기」
  function label(img) {
    const shut = img.closest('.cens:not(.open)');
    img.setAttribute('aria-label', shut ? '열람 주의 사진 — 눌러서 보기' : (img.alt ? img.alt + ' — ' : '') + '크게 보기');
  }
  new MutationObserver(ms => ms.forEach(m => {
    m.addedNodes.forEach(n => { if (n.nodeType !== 1) return; tidy(n); if (n.classList.contains('zoom')) n.setAttribute('aria-modal', 'true'); });
    m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('zoom')) back(); });
  })).observe(document.documentElement, { childList: true, subtree: true });

  // 키보드: 그림 위에서 Enter·Space 는 누른 것과 같다
  let before = null; // 크게 보기 창이 뜨기 전에 초점이 있던 곳
  document.addEventListener('focusin', e => {
    const t = e.target;
    if (t && t.matches && t.matches('img[data-ui-key]')) label(t);
    if (t && t.closest && !t.closest('.zoom')) before = t;
  });
  function back() {
    const el = before;
    if (el && el.isConnected && el !== document.body && document.activeElement === document.body) el.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', e => {
    const z = document.querySelector('.zoom');
    if (z) {
      if (e.key === 'Tab') { e.preventDefault(); z.focus(); } // 크게 보기 창이 떠 있는 동안 초점은 창 안에
      return;
    }
    const t = e.target;
    if ((e.key === 'Enter' || e.key === ' ') && t && t.matches && t.matches('img[data-ui-key]')) {
      e.preventDefault();
      t.click();
      if (t.isConnected) label(t);
    }
  });

  // 잠금·조회 칸에 번호를 넣고 Enter: 엔진이 칸을 새로 그려 초점이 사라지면, 같은 자리의 새 칸으로 돌려준다.
  // (전화 번호판을 눌러 확인한 때는 돌려주지 않는다 — 폰에서 자판이 다시 튀어나오므로. 조회 칸은 마우스로 쓸 때만)
  const fine = () => !!(window.matchMedia && matchMedia('(pointer:fine)').matches);
  document.addEventListener('submit', e => {
    const f = e.target, a = document.activeElement;
    if (!f || !f.matches || !a || !f.contains(a)) return;
    const typed = a.matches('input'), clicked = a.matches('button[type="submit"]') && fine(); // 「열기」를 마우스로 누른 때도
    if (!typed && !clicked) return;
    let sel = '';
    const q = v => (window.CSS && CSS.escape ? CSS.escape(v) : v);
    if (f.matches('[data-lock]')) sel = `form[data-lock="${q(f.dataset.lock)}"] input`;
    else if (f.matches('[data-query]') && typed && fine() && a.name) sel = `form[data-query="${q(f.dataset.query)}"] input[name="${q(a.name)}"]`;
    if (!sel) return;
    setTimeout(() => { // 엔진이 이 submit 을 받아 칸을 다시 그린 뒤 (rAF 는 가려진 탭에서 멈추므로 쓰지 않는다)
      const now = document.activeElement;
      if (now && now !== document.body && now.isConnected) return;
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) el.focus({ preventScroll: true });
    }, 0);
  }, true);
})();
