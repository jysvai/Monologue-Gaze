/* Monologue Gaze — 사건마다 다른 공기: 조명 색, 날씨, 배경음, 사건을 여는 장면.
 * 사건 파일의 mood: { light, fx, amb: [...], line } 을 읽는다 (docs/CASE_AUTHORING.md 12절).
 * 배경음은 「소리 켜짐」일 때만 난다. 기기에서 움직임 줄이기를 켜 두면 날씨는 멈추고 여는 장면은 짧게 지나간다.
 */
(function () {
  const MG = window.MG;
  const S = () => MG.state();
  const reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rnd = (a, b) => a + Math.random() * (b - a);

  let cur = null;      // 지금 공기가 깔린 사건 id
  let ampSig = '';     // 배경음이 어떤 조건으로 켜졌는지 (사건·소리·잔혹 표현)
  let layer = null;

  /* ───────── 조명·안개 층 ───────── */
  function build(m) {
    layer = document.createElement('div');
    layer.className = 'mood';
    layer.setAttribute('aria-hidden', 'true');
    const fog = /^(fog|mist|steam|smoke)$/.test(m.fx) ? `<div class="mood-fog" data-fx="${esc(m.fx)}"><i></i><i></i><i></i></div>` : '';
    layer.innerHTML = `<div class="mood-light"></div>${fog}<canvas class="mood-fx" data-fx="${esc(m.fx || '')}"></canvas><div class="mood-tint"></div>`;
    document.body.appendChild(layer);
  }

  /* ───────── 날씨 (캔버스) ───────── */
  // 입자를 밝기 몇 단계로 묶어 한 번에 그린다 (입자마다 따로 그리면 느리다).
  // 가운데 읽는 자리는 비워 두는데, CSS 가림막 대신 입자마다 가장자리로 갈수록 짙어지게 한다.
  let cv = null, g = null, parts = [], kind = '', raf = 0, last = 0, W = 0, H = 0, edge = true;
  const LV = 8;
  const bins = Array.from({ length: LV }, () => []);
  const SPEC = {
    rain:    { per: 7000,  make: () => ({ x: rnd(-60, W), y: rnd(-H, H), l: rnd(14, 26), v: rnd(900, 1300), a: rnd(.08, .2) }) },
    drizzle: { per: 15000, make: () => ({ x: rnd(-40, W), y: rnd(-H, H), l: rnd(5, 10), v: rnd(420, 620), a: rnd(.08, .16) }) },
    snow:    { per: 9000,  make: () => ({ x: rnd(0, W), y: rnd(-H, H), r: rnd(.8, 2.6), v: rnd(26, 64), p: rnd(0, 6.3), a: rnd(.25, .6) }) },
    dust:    { per: 38000, make: () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.5, 1.5), vx: rnd(-7, 7), vy: rnd(-6, 4), p: rnd(0, 6.3), a: rnd(.12, .36) }) },
  };
  const MAXA = { rain: .2, drizzle: .16, snow: .6, dust: .36 };
  function size() {
    if (!cv) return;
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W; cv.height = H; // 흐릿한 날씨라 기기 배율은 1 로 충분하다
    const sp = SPEC[kind];
    parts = sp ? Array.from({ length: Math.min(260, Math.round(W * H / sp.per)) }, sp.make) : [];
  }
  // 화면 가운데(가로 60%·세로 58% 타원의 45% 안)는 비우고 바깥으로 갈수록 짙게
  function fade(x, y) {
    if (!edge) return 1;
    const dx = (x - W / 2) / (W * 0.6), dy = (y - H / 2) / (H * 0.58);
    const d = Math.sqrt(dx * dx + dy * dy);
    return d <= 0.45 ? 0 : d >= 1 ? 1 : (d - 0.45) / 0.55;
  }
  function bin(p, a) { const i = Math.min(LV - 1, Math.round(a / MAXA[kind] * (LV - 1))); if (i > 0) bins[i].push(p); }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    g.clearRect(0, 0, W, H);
    for (const b of bins) b.length = 0;
    if (kind === 'rain' || kind === 'drizzle') {
      for (const p of parts) {
        p.y += p.v * dt; p.x += p.v * 0.16 * dt;
        if (p.y > H + 30) { p.y = rnd(-80, -10); p.x = rnd(-60, W); }
        bin(p, p.a * fade(p.x, p.y));
      }
      g.lineWidth = kind === 'rain' ? 1 : .8; g.lineCap = 'round';
      bins.forEach((b, i) => {
        if (!b.length) return;
        g.strokeStyle = `rgba(196,210,226,${(i / (LV - 1) * MAXA[kind]).toFixed(3)})`;
        g.beginPath();
        for (const p of b) { g.moveTo(p.x, p.y); g.lineTo(p.x - p.l * 0.16, p.y - p.l); }
        g.stroke();
      });
      return;
    }
    const col = kind === 'snow' ? '236,240,246' : '255,236,196';
    for (const p of parts) {
      if (kind === 'snow') {
        p.p += dt * 0.9; p.y += p.v * dt; p.x += Math.sin(p.p) * 14 * dt + 6 * dt;
        if (p.y > H + 6) { p.y = -6; p.x = rnd(0, W); }
        if (p.x > W + 6) p.x = -6;
        bin(p, p.a * fade(p.x, p.y));
      } else {
        p.p += dt * 0.7; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < -4) p.x = W + 4; if (p.x > W + 4) p.x = -4; if (p.y < -4) p.y = H + 4; if (p.y > H + 4) p.y = -4;
        bin(p, p.a * (0.55 + 0.45 * Math.sin(p.p)));
      }
    }
    bins.forEach((b, i) => {
      if (!b.length) return;
      g.fillStyle = `rgba(${col},${(i / (LV - 1) * MAXA[kind]).toFixed(3)})`;
      g.beginPath();
      for (const p of b) { g.moveTo(p.x + p.r, p.y); g.arc(p.x, p.y, p.r, 0, 6.283); }
      g.fill();
    });
  }
  function startFx(fx) {
    kind = SPEC[fx] ? fx : '';
    cv = layer && layer.querySelector('.mood-fx');
    if (!kind || !cv || reduce.matches || lite()) return;
    edge = kind !== 'dust';
    g = cv.getContext('2d');
    size(); last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stopFx() { cancelAnimationFrame(raf); raf = 0; parts = []; if (g) g.clearRect(0, 0, W, H); cv = null; g = null; kind = ''; }

  /* ───────── 가벼운 화면 ─────────
   * 그래픽 가속이 약한 기기(또는 절전 모드)에서는 화면 전체 합성·날씨 입자가 버벅임을 만든다.
   * 사건을 연 뒤 잠시 화면이 몇 프레임으로 도는지 재 보고, 느리면 이번 방문 동안 가벼운 화면으로 바꾼다. */
  const LITE = 'mg-lite';
  const lite = () => document.documentElement.classList.contains('lite');
  try { if (sessionStorage.getItem(LITE) === '1') document.documentElement.classList.add('lite'); } catch (e) { /* 저장소 막힘 */ }
  let probeT = 0;
  function probe() {
    clearTimeout(probeT);
    if (lite()) return;
    probeT = setTimeout(() => {
      if (document.hidden || !cur) return;
      const fr = []; let prev = 0, id = 0;
      const step = n => {
        if (document.hidden || !cur) return; // 가려지면 재지 않는다
        if (prev) fr.push(n - prev);
        prev = n;
        if (fr.length < 60) { id = requestAnimationFrame(step); return; }
        fr.sort((x, y) => x - y);
        if (fr[30] > 26) goLite(); // 가운데값이 초당 40프레임 아래
      };
      id = requestAnimationFrame(step);
    }, 1500);
  }
  function goLite() {
    document.documentElement.classList.add('lite');
    try { sessionStorage.setItem(LITE, '1'); } catch (e) { /* ignore */ }
    stopFx();
  }
  window.addEventListener('resize', () => { if (raf) size(); });

  /* ───────── 배경음 (모두 합성음) ───────── */
  let ax = null, bus = null, srcs = [], timers = [];
  const bufs = {};
  function noiseBuf(type) {
    if (bufs[type]) return bufs[type];
    const len = ax.sampleRate * 4, N = 4096, b = ax.createBuffer(1, len, ax.sampleRate), d = b.getChannelData(0), tail = new Float32Array(N);
    let l = 0, p0 = 0, p1 = 0, p2 = 0;
    for (let i = 0; i < len + N; i++) {
      const w = Math.random() * 2 - 1;
      let v;
      if (type === 'brown') { l = (l + 0.02 * w) / 1.02; v = l * 3.5; }
      else if (type === 'pink') { p0 = 0.997 * p0 + 0.029 * w; p1 = 0.985 * p1 + 0.032 * w; p2 = 0.95 * p2 + 0.048 * w; v = (p0 + p1 + p2 + w * 0.05) * 1.6; }
      else v = w;
      if (i < len) d[i] = v; else tail[i - len] = v;
    }
    for (let i = 0; i < N; i++) d[i] = d[i] * (i / N) + tail[i] * (1 - i / N);
    return (bufs[type] = b);
  }
  const filt = (type, f, q) => { const n = ax.createBiquadFilter(); n.type = type; n.frequency.value = f; if (q != null) n.Q.value = q; return n; };
  const gain = v => { const n = ax.createGain(); n.gain.value = v; return n; };
  function chain(first, ...rest) { rest.reduce((a, b) => a.connect(b), first); return rest[rest.length - 1]; }
  function loop(type, ...fx) { // 쉬지 않고 도는 잡음 한 줄기
    const s = ax.createBufferSource(); s.buffer = noiseBuf(type); s.loop = true;
    chain(s, ...fx).connect(bus); s.start(0, rnd(0, 3)); srcs.push(s); return s;
  }
  function tone(type, f, ...fx) { const o = ax.createOscillator(); o.type = type; o.frequency.value = f; chain(o, ...fx).connect(bus); o.start(); srcs.push(o); return o; }
  function every(a, b, fn) { // a~b 초마다 한 번씩
    const h = { id: 0 }; timers.push(h);
    const tick = () => { if (!bus) return; try { fn(ax.currentTime); } catch (e) { /* skip */ } h.id = setTimeout(tick, rnd(a, b) * 1000); };
    h.id = setTimeout(tick, rnd(a * 0.3, b * 0.6) * 1000);
  }
  function burst(t, dur, type, f, q, v) { // 짧은 잡음 한 번
    const s = ax.createBufferSource(); s.buffer = noiseBuf('white');
    const e = gain(0); e.gain.setValueAtTime(v, t); e.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    chain(s, filt(type, f, q), e).connect(bus); s.start(t, rnd(0, 3)); s.stop(t + dur + 0.05);
  }
  function blip(t, type, f0, f1, dur, v, lp) { // 짧은 음 한 번
    const o = ax.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const e = gain(0); e.gain.setValueAtTime(0.0005, t); e.gain.exponentialRampToValueAtTime(v, t + Math.min(0.02, dur / 4)); e.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    chain(o, ...(lp ? [filt('lowpass', lp)] : []), e).connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  const AMB = {
    rain() { loop('white', filt('highpass', 900), filt('lowpass', 7000), gain(0.06)); every(0.06, 0.3, t => burst(t, 0.03, 'bandpass', rnd(2500, 6000), 2, rnd(0.01, 0.03))); },
    drizzle() { loop('white', filt('highpass', 1400), filt('lowpass', 6000), gain(0.025)); every(0.15, 0.6, t => burst(t, 0.025, 'bandpass', rnd(3000, 6500), 2, rnd(0.008, 0.02))); },
    wind() {
      const f = filt('lowpass', 420, 0.9), v = gain(0.07); loop('brown', f, v);
      every(2, 4.5, t => { f.frequency.setTargetAtTime(rnd(220, 900), t, 1.4); v.gain.setTargetAtTime(rnd(0.04, 0.13), t, 1.6); });
    },
    surf() {
      const v = gain(0.03); loop('pink', filt('lowpass', 750), v);
      every(6.5, 10, t => { v.gain.setTargetAtTime(rnd(0.13, 0.2), t, 1.1); v.gain.setTargetAtTime(0.025, t + 2.8, 1.8); });
    },
    harbor() {
      const v = gain(0.03); loop('pink', filt('bandpass', 520, 0.8), v);
      every(1, 2.6, t => { v.gain.setTargetAtTime(rnd(0.04, 0.08), t, 0.3); v.gain.setTargetAtTime(0.02, t + 0.6, 0.5); });
    },
    river() { loop('pink', filt('bandpass', 900, 0.6), gain(0.045)); every(0.4, 1.6, t => blip(t, 'sine', rnd(380, 820), rnd(700, 1400), 0.06, 0.012)); },
    city() {
      loop('brown', filt('lowpass', 170), gain(0.09));
      every(16, 38, t => { // 멀리 지나가는 차 한 대
        const s = ax.createBufferSource(); s.buffer = noiseBuf('brown'); const f = filt('lowpass', 180); const e = gain(0.0005);
        f.frequency.setValueAtTime(180, t); f.frequency.linearRampToValueAtTime(650, t + 2.2); f.frequency.linearRampToValueAtTime(160, t + 4.5);
        e.gain.setValueAtTime(0.0005, t); e.gain.exponentialRampToValueAtTime(0.16, t + 2.2); e.gain.exponentialRampToValueAtTime(0.0005, t + 4.6);
        chain(s, f, e).connect(bus); s.start(t); s.stop(t + 4.7);
      });
    },
    clock() {
      let n = 0;
      const tick = () => { if (!bus) return; const t = ax.currentTime; burst(t, 0.02, 'highpass', n % 2 ? 2600 : 3400, 1, n % 2 ? 0.035 : 0.05); n++; };
      timers.push({ id: setInterval(tick, 1000), iv: true });
    },
    clapper() { // 야경꾼 딱딱이, 멀리서
      every(26, 48, t => { const k = Math.random() < 0.5 ? 2 : 3; for (let i = 0; i < k; i++) { burst(t + i * 0.24, 0.06, 'bandpass', 1150, 6, 0.08); blip(t + i * 0.24, 'triangle', 760, 700, 0.09, 0.035, 1600); } });
    },
    bell() { // 먼 교회 종
      every(42, 80, t => [[196, 0.05], [392, 0.03], [467, 0.022], [588, 0.016], [784, 0.01]].forEach(([f, v]) => {
        const o = ax.createOscillator(); o.frequency.value = f; const e = gain(0.0005);
        e.gain.setValueAtTime(0.0005, t); e.gain.exponentialRampToValueAtTime(v, t + 0.02); e.gain.exponentialRampToValueAtTime(0.0005, t + 5.5);
        chain(o, filt('lowpass', 1500), e).connect(bus); o.start(t); o.stop(t + 5.6);
      }));
    },
    horn() { // 먼 뱃고동·무적
      every(40, 78, t => [98, 147].forEach(f => {
        const o = ax.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const e = gain(0.0005);
        e.gain.setValueAtTime(0.0005, t); e.gain.exponentialRampToValueAtTime(0.045, t + 0.7); e.gain.setValueAtTime(0.045, t + 2.4); e.gain.exponentialRampToValueAtTime(0.0005, t + 3.8);
        chain(o, filt('lowpass', 360), e).connect(bus); o.start(t); o.stop(t + 3.9);
      }));
    },
    hum() { tone('sine', 60, gain(0.014)); tone('sine', 120, gain(0.007)); tone('sine', 180, gain(0.003)); },
    fan() { loop('pink', filt('lowpass', 420), gain(0.03)); tone('sine', 118, gain(0.004)); },
    room() { loop('pink', filt('lowpass', 360), gain(0.02)); },
    drip() { every(1.4, 4.6, t => { blip(t, 'sine', 1500, 460, 0.08, 0.045); if (Math.random() < 0.4) blip(t + 0.11, 'sine', 1900, 700, 0.05, 0.015); }); },
    drone() { // 빨간 별 사건: 낮게 깔린 울림
      tone('sine', 46, gain(0.035)); tone('sine', 46.7, gain(0.03));
      loop('brown', filt('lowpass', 110), gain(0.035));
    },
  };
  function startAmb(list) {
    try {
      ax = ax || new (window.AudioContext || window.webkitAudioContext)();
      if (ax.state === 'suspended') ax.resume().catch(() => {});
      bus = ax.createGain(); bus.gain.value = 0.0001; bus.connect(ax.destination);
      bus.gain.setTargetAtTime(0.8, ax.currentTime + 0.3, 0.9);
      (list || []).forEach(k => AMB[k] && AMB[k]());
    } catch (e) { bus = null; }
  }
  function stopAmb() {
    timers.forEach(h => (h.iv ? clearInterval : clearTimeout)(h.id)); timers = [];
    if (!bus) return;
    const b = bus, ss = srcs; bus = null; srcs = [];
    try { b.gain.setTargetAtTime(0.0001, ax.currentTime, 0.15); } catch (e) { /* ignore */ }
    setTimeout(() => { ss.forEach(s => { try { s.stop(); } catch (e) { /* already stopped */ } }); try { b.disconnect(); } catch (e) { /* ignore */ } }, 700);
  }
  function syncAmb(c) {
    const st = S(), m = (c && c.mood) || {};
    const list = (m.amb || []).filter(k => k !== 'drone' || !st.mild);
    const sig = c && st.sound ? c.id + ':' + list.join(',') : '';
    if (sig === ampSig) return;
    stopAmb(); ampSig = sig;
    if (sig) startAmb(list);
  }
  // 새로 고침으로 사건 화면에서 바로 시작하면 브라우저가 소리를 막아 둔다. 첫 입력 때 풀어 준다.
  const unlock = () => { if (ax && ax.state === 'suspended' && bus) ax.resume().catch(() => {}); };
  ['pointerdown', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { passive: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ax) return;
    if (document.hidden) ax.suspend().catch(() => {}); else if (bus) ax.resume().catch(() => {});
  });

  /* ───────── 사건을 여는 장면 ───────── */
  let introTimer = 0;
  function hideIntro() {
    clearTimeout(introTimer);
    const el = document.querySelector('.case-intro');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => el.remove(), 450);
  }
  function showIntro(c, m) {
    hideIntro();
    const el = document.createElement('div');
    el.className = 'case-intro' + (c.graphic ? ' graphic' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', `CASE ${c.no} ${c.title}`);
    const place = String(c.place || '').replace(/\s*\([^)]*\)\s*$/, '');
    el.innerHTML = `<div class="ci-in">
      <p class="ci-no">CASE ${String(c.no).padStart(2, '0')}${c.kind === 'tutorial' ? ' · 연습' : ''}</p>
      <h2 class="ci-title">${esc(c.title)}</h2>
      <p class="ci-when">${esc(c.year)} · ${esc(place)}</p>
      ${m.line ? `<p class="ci-line">${esc(m.line)}</p>` : ''}
      <p class="ci-skip">눌러서 넘기기</p></div>`;
    el.addEventListener('click', hideIntro);
    document.body.appendChild(el);
    const once = e => { if (e.key !== 'Tab') { hideIntro(); document.removeEventListener('keydown', once); } };
    document.addEventListener('keydown', once);
    introTimer = setTimeout(() => { document.removeEventListener('keydown', once); hideIntro(); }, reduce.matches ? 1600 : 3600);
  }

  /* ───────── 엔진이 부르는 곳 ───────── */
  MG.mood = {
    enter(c, intro) {
      const m = c.mood || {};
      document.body.dataset.light = m.light || '';
      if (cur !== c.id) {
        stopFx(); if (layer) layer.remove();
        cur = c.id; build(m); startFx(m.fx);
        probe();
      }
      syncAmb(c);
      if (intro) showIntro(c, m);
    },
    leave() {
      cur = null; delete document.body.dataset.light;
      stopFx(); syncAmb(null); hideIntro();
      if (layer) { layer.remove(); layer = null; }
    },
    sound() { syncAmb(cur ? MG.byId[cur] : null); },
    duck(on) { if (bus && ax) bus.gain.setTargetAtTime(on ? 0.25 : 0.8, ax.currentTime, 0.25); }, // 목소리가 나오는 동안 배경음을 낮춘다
  };
})();
