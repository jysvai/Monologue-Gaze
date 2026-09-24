/* Monologue Gaze — 효과음·목소리·말소리 (audio/manifest.js 의 MG.audio 를 읽는다)
 * 모두 「소리 켜짐」일 때만 난다. 목소리는 「목소리」 단추로 따로 끌 수 있다.
 * 파일이 없으면 play() 는 false 를 돌려주고, 엔진이 합성음으로 대신한다.
 */
(function () {
  const MG = window.MG;
  const S = () => MG.state();
  const A = () => MG.audio || { files: {}, span: {}, tone: {} };
  const pool = {};
  const url = k => A().files[k];

  function get(k) {
    const u = url(k);
    if (!u) return null;
    if (!pool[k]) { pool[k] = new Audio(u); pool[k].preload = 'auto'; }
    return pool[k];
  }
  // 효과음: 겹쳐 울려도 되게 복제해서 튼다
  function play(k, vol) {
    if (!S().sound) return false;
    const a0 = get(k);
    if (!a0) return false;
    const a = a0.paused ? a0 : a0.cloneNode();
    a.volume = vol == null ? 0.9 : vol;
    // 자주 나는 잔소리(종이·연필·딸깍)는 매번 조금씩 다르게: 같은 녹음이 되풀이되는 티가 덜 난다
    const small = /^sfx\/(pen|page|click|key)$/.test(k);
    a.preservesPitch = !small;
    a.playbackRate = small ? 0.92 + Math.random() * 0.16 : 1;
    if (small) a.volume *= 0.85 + Math.random() * 0.15;
    try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
    a.play().catch(() => {});
    return true;
  }

  // 목소리: 한 번에 하나. 나오는 동안 배경음을 낮춘다. 끝나면 resolve.
  let cur = null;
  function stopVoice() {
    if (!cur) return;
    const a = cur; cur = null;
    a.pause(); if (a._done) a._done();
    if (MG.mood) MG.mood.duck(false);
  }
  function voice(k) {
    const st = S();
    if (!st.sound || st.voice === false) return null;
    const a = get(k);
    if (!a) return null;
    stopVoice();
    cur = a;
    try { a.currentTime = 0; } catch (e) { /* not loaded yet */ }
    a.volume = 1;
    if (MG.mood) MG.mood.duck(true);
    const done = new Promise(res => {
      a._done = () => { a._done = null; res(); };
      a.onended = () => { if (cur === a) { cur = null; if (MG.mood) MG.mood.duck(false); } if (a._done) a._done(); };
      a.onerror = a.onended;
    });
    a.play().catch(() => { if (a.onended) a.onended(); });
    return { audio: a, done, span: A().span[k] || 1 };
  }
  const hasVoice = k => !!url(k) && S().sound && S().voice !== false;

  // 주인공의 결정적인 한마디: 목소리(켜져 있으면) + 화면 아래 속말 자막(늘)
  let capN = 0, capT = null;
  function caption(t, v) {
    let el = document.getElementById('monoCap');
    if (!el) { el = document.createElement('div'); el.id = 'monoCap'; el.className = 'mono-cap'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
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
  let ax = null;
  function blip(hz) {
    if (!S().sound) return;
    try {
      ax = ax || new (window.AudioContext || window.webkitAudioContext)();
      if (ax.state === 'suspended') ax.resume().catch(() => {});
      const t = ax.currentTime, o = ax.createOscillator(), g = ax.createGain(), f = ax.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = hz * (0.93 + Math.random() * 0.14);
      f.type = 'lowpass'; f.frequency.value = 1800;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      o.connect(f).connect(g).connect(ax.destination); o.start(t); o.stop(t + 0.05);
    } catch (e) { /* audio unavailable */ }
  }
  const tone = id => A().tone[id] || 130;

  // 자주 쓰는 효과음은 미리 받아 둔다
  function warm() { ['sfx/clue', 'sfx/match', 'sfx/confess', 'sfx/miss', 'sfx/find', 'sfx/pen', 'sfx/page'].forEach(get); }
  document.addEventListener('pointerdown', function once() { warm(); document.removeEventListener('pointerdown', once); }, { passive: true });

  MG.sound = { play, voice, stopVoice, hasVoice, blip, tone, hero, caption, line: k => (A().say || {})['hero/' + k] || '' };
})();
