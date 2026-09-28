/* Monologue Gaze — 효과음·목소리·말소리 (audio/manifest.js 의 MG.audio 를 읽는다)
 * 모두 「소리 켜짐」일 때만 난다. 목소리는 「목소리」 단추로 따로 끌 수 있다.
 * 파일이 없으면 play() 는 false 를 돌려주고, 엔진이 합성음으로 대신한다.
 * 파일은 <audio> 가 아니라 Web Audio 로 튼다: <audio> 로 틀면 브라우저가 「미디어 재생 중」으로 알고
 * 도구 모음의 재생 단추·휴대폰 잠금 화면의 재생 막대·윈도 미디어 창에 이 사이트 이름을 띄운다 (건너뛴 자백이 거기서 다시 재생되기도).
 */
(function () {
  const MG = window.MG;
  const S = () => MG.state();
  const A = () => MG.audio || { files: {}, span: {}, tone: {} };
  const url = k => A().files[k];

  let ax = null, out = null;
  function ctx() {
    try {
      if (!ax) { ax = new (window.AudioContext || window.webkitAudioContext)(); out = ax.createGain(); out.connect(ax.destination); }
      if (ax.state === 'suspended' && !document.hidden) ax.resume().catch(() => {});
      return ax;
    } catch (e) { return null; } // 소리를 낼 수 없는 브라우저
  }
  // 받아서 풀어 둔 소리 (한 번만 받는다)
  const bufs = {};
  function load(k) {
    const u = url(k);
    if (!u) return null;
    if (!bufs[k]) {
      const c = ctx();
      if (!c) return null;
      bufs[k] = fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(b => new Promise((res, rej) => { const p = c.decodeAudioData(b, res, rej); if (p && p.then) p.then(res, rej); }))
        .then(buf => (bufs[k].buf = buf))
        .catch(() => { bufs[k].bad = true; return null; });
    }
    return bufs[k];
  }

  // 효과음: 겹쳐 울려도 된다. 아직 받는 중이면 받는 대로 (너무 늦으면 그 소리는 건너뛴다)
  let play = function (k, vol) {
    if (!S().sound || !url(k)) return false;
    const c = ctx(), p = load(k);
    if (!c || !p) return false;
    const asked = Date.now();
    const go = buf => {
      if (!buf || Date.now() - asked > 450) return;
      const src = c.createBufferSource(), g = c.createGain();
      src.buffer = buf;
      // 자주 나는 잔소리(종이·연필·딸깍)는 매번 조금씩 다르게: 같은 녹음이 되풀이되는 티가 덜 난다
      const small = /^sfx\/(pen|page|click|key)$/.test(k);
      let v = vol == null ? 0.9 : vol;
      if (small) { src.playbackRate.value = 0.92 + Math.random() * 0.16; v *= 0.85 + Math.random() * 0.15; }
      g.gain.value = v;
      src.connect(g).connect(out);
      src.start();
    };
    if (p.buf) go(p.buf); else p.then(go);
    return true;
  };

  // 목소리: 한 번에 하나. 나오는 동안 배경음을 낮춘다. 끝나면 done 이 풀린다.
  // 엔진은 v.audio.currentTime / duration 으로 글자를 목소리 진행에 맞춰 찍는다 (<audio> 와 같은 이름으로 내어 준다)
  let cur = null;
  let stopVoice = function () {
    if (!cur) return;
    const v = cur; cur = null;
    v.halt();
    if (MG.mood) MG.mood.duck(false);
  };
  let voice = function (k) {
    const st = S();
    if (!st.sound || st.voice === false || !url(k)) return null;
    const c = ctx(), p = load(k);
    if (!c || !p) return null;
    stopVoice();
    let src = null, startAt = 0, offset = 0, over = false, held = false, resolve;
    const done = new Promise(res => { resolve = res; });
    const v = {
      done, span: A().span[k] || 1,
      audio: {
        get duration() { return p.buf ? p.buf.duration : NaN; },
        get currentTime() { return src ? Math.min(offset + c.currentTime - startAt, p.buf.duration) : offset; },
      },
      halt() { over = true; if (src) { src.onended = null; try { src.stop(); } catch (e) { /* already stopped */ } src = null; } resolve(); },
      hold() { if (!src || over) return; offset = v.audio.currentTime; src.onended = null; try { src.stop(); } catch (e) { /* */ } src = null; held = true; },
      unhold() { if (!held || over) return; held = false; start(); },
    };
    const finish = () => { if (over) return; over = true; src = null; if (cur === v) { cur = null; if (MG.mood) MG.mood.duck(false); } resolve(); };
    function start() {
      if (over || !p.buf) return;
      if (document.hidden) { held = true; return; }
      src = c.createBufferSource(); src.buffer = p.buf; src.connect(out);
      src.onended = finish;
      startAt = c.currentTime;
      src.start(0, offset);
    }
    cur = v;
    if (MG.mood) MG.mood.duck(true);
    p.then(buf => { if (!buf) finish(); else if (cur === v) start(); });
    return v;
  };
  const hasVoice = k => !!url(k) && S().sound && S().voice !== false;
  // 다른 탭에 가 있는 동안 목소리는 멈춰 둔다 (배경음처럼). 돌아오면 그 자리부터 이어서 — 자막도 목소리가 끝날 때까지 기다린다
  document.addEventListener('visibilitychange', () => {
    if (!cur) return;
    if (document.hidden) cur.hold(); else { if (ax && ax.state === 'suspended') ax.resume().catch(() => {}); cur.unhold(); }
  });

  // 파일로 바로 연 때(file://)는 fetch 가 막혀 Web Audio 로 받을 수 없다 → 그때만 <audio> 로
  if (location.protocol === 'file:') {
    const pool = {};
    const get = k => { const u = url(k); if (!u) return null; if (!pool[k]) { pool[k] = new Audio(u); pool[k].preload = 'auto'; } return pool[k]; };
    play = (k, vol) => {
      if (!S().sound) return false;
      const a0 = get(k); if (!a0) return false;
      const a = a0.paused ? a0 : a0.cloneNode();
      const small = /^sfx\/(pen|page|click|key)$/.test(k);
      a.volume = (vol == null ? 0.9 : vol) * (small ? 0.85 + Math.random() * 0.15 : 1); a.preservesPitch = !small; a.playbackRate = small ? 0.92 + Math.random() * 0.16 : 1;
      try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
      a.play().catch(() => {}); return true;
    };
    let fa = null;
    stopVoice = () => { if (!fa) return; const a = fa; fa = null; a.pause(); if (a._done) a._done(); if (MG.mood) MG.mood.duck(false); };
    voice = k => {
      const st = S(); if (!st.sound || st.voice === false) return null;
      const a = get(k); if (!a) return null;
      stopVoice(); fa = a;
      try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
      if (MG.mood) MG.mood.duck(true);
      const done = new Promise(res => { a._done = () => { a._done = null; res(); }; a.onended = () => { if (fa === a) { fa = null; if (MG.mood) MG.mood.duck(false); } if (a._done) a._done(); }; a.onerror = a.onended; });
      a.play().catch(() => { if (a.onended) a.onended(); });
      return { audio: a, done, span: A().span[k] || 1 };
    };
    document.addEventListener('visibilitychange', () => { if (fa) { if (document.hidden) fa.pause(); else fa.play().catch(() => {}); } });
  }

  // 주인공의 결정적인 한마디: 목소리(켜져 있으면) + 화면 아래 속말 자막(늘)
  let capN = 0, capT = null;
  // 자막 칸은 처음부터 깔아 둔다 (화면 읽기 프로그램이 첫 한마디도 읽어 주게)
  const capBox = () => {
    let el = document.getElementById('monoCap');
    if (!el) { el = document.createElement('div'); el.id = 'monoCap'; el.className = 'mono-cap'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    return el;
  };
  if (document.body) capBox();
  function caption(t, v) {
    const el = capBox();
    const my = ++capN;
    clearTimeout(capT);
    el.textContent = t; el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
    const hide = ms => { if (my === capN) capT = setTimeout(() => { if (my === capN) el.classList.remove('on'); }, ms); };
    if (v) v.done.then(() => hide(900)); else hide(1500 + t.length * 80);
  }
  function hero(k) {
    const t = (A().say || {})['hero/' + k];
    const v = voice('hero/' + k);
    if (t) caption(t, v);
    return v;
  }

  // 말소리: 글자가 찍힐 때 나는 아주 짧은 음 (사람마다 높이가 다르다)
  function blip(hz) {
    if (!S().sound) return;
    const c = ctx();
    if (!c) return;
    try {
      const t = c.currentTime, o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = hz * (0.93 + Math.random() * 0.14);
      f.type = 'lowpass'; f.frequency.value = 1800;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      o.connect(f).connect(g).connect(out); o.start(t); o.stop(t + 0.05);
    } catch (e) { /* audio unavailable */ }
  }
  const tone = id => A().tone[id] || 130;

  // 자주 쓰는 효과음은 첫 손길에 미리 받아 둔다 (소리가 꺼져 있으면 받지 않는다)
  function warm() { if (S().sound) ['sfx/clue', 'sfx/match', 'sfx/confess', 'sfx/miss', 'sfx/find', 'sfx/pen', 'sfx/page', 'sfx/click', 'sfx/key'].forEach(load); }
  document.addEventListener('pointerdown', function once() { ctx(); warm(); document.removeEventListener('pointerdown', once); }, { passive: true });

  MG.sound = { play, voice, stopVoice, hasVoice, blip, tone, hero, caption, warm, line: k => (A().say || {})['hero/' + k] || '' };
})();
