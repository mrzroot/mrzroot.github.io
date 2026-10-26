/* Gosast landing-page demo.
   It runs the REAL core.js and engine.js (identical copies of the v0.1.1 extension files) on a picture of a made-up
   sample page that is drawn right here. It never touches a real web page, never uses the network, never stores anything. */
(function () {
  'use strict';
  var E = window.GosastEngine, S = window.GosastStrings;
  var stage = document.getElementById('demo-stage');
  if (!stage || !E || !S) { var f = document.getElementById('demo-fallback'); if (f) f.hidden = false; return; }
  var canvas = document.getElementById('demo-canvas'), bar = document.getElementById('demo-bar'), count = document.getElementById('demo-count'),
      hint = document.getElementById('demo-hint'), wrap = document.getElementById('demo-wrap');
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var st = { eng: null, W: 0, H: 0, lang: 'fa', tool: 'strip', gentle: mq.matches, sound: false, touched: false };
  var TOOLS = ['strip', 'confetti', 'broom', 'glue'], KEYS = { strip: '1', confetti: '2', broom: '3', glue: '4' };
  var palette = { desk1: '#4a3328', desk2: '#1a120e', ring: '#ffe08a', glow: '#ff6a5a' };

  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'fa'; }
  function t(k, v) { return S.t(st.lang, k, v); }

  /* ---------- the made-up sample page ---------- */
  var TXT = {
    fa: { brand: 'چایخانهٔ برگ', nav: ['خانه', 'منو', 'درباره'], order: 'سفارش', h: ['چای تازه،', 'هر صبح.'], p: 'هر روز برگ‌های تازه را دم می‌کنیم تا فنجانت همیشه گرم و خوش‌عطر باشد.', cards: ['چای سیاه', 'چای سبز', 'چای گیاهی'], cta: 'ببین چه داریم', foot: 'باز هستیم · هر روز ۷ تا ۲۰' },
    en: { brand: 'Leaf & Cup', nav: ['Home', 'Menu', 'About'], order: 'Order', h: ['Fresh tea,', 'every morning.'], p: 'We brew fresh leaves every day so your cup is always warm and fragrant.', cards: ['Black tea', 'Green tea', 'Herbal'], cta: 'See the menu', foot: 'Open daily · 7am to 8pm' }
  };
  function wrapText(c, text, maxW) {
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { var tt = cur ? cur + ' ' + w : w; if (c.measureText(tt).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tt; });
    if (cur) lines.push(cur); return lines;
  }
  function drawSample(c, W, H, lg) {
    var rtl = lg === 'fa', T = TXT[lg], u = Math.max(0.6, Math.min(1.1, W / 820));
    var FONT = 'Vazirmatn, "Spline Sans Mono", system-ui, sans-serif';
    function X(x, w) { return rtl ? W - x - (w || 0) : x; }
    function font(px, wt) { c.font = (wt || 400) + ' ' + Math.round(px * u) + 'px ' + FONT; }
    function text(s, x, y, color, align) { c.fillStyle = color; c.textAlign = align || (rtl ? 'right' : 'left'); c.fillText(s, x, y); }
    function rr(x, y, w, h, r, fill) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); c.fillStyle = fill; c.fill(); }
    c.direction = rtl ? 'rtl' : 'ltr'; c.textBaseline = 'alphabetic';
    c.fillStyle = '#fffaf0'; c.fillRect(0, 0, W, H);
    var pad = 28 * u, navH = 58 * u;
    // nav
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, navH); c.fillStyle = '#16110e'; c.fillRect(0, navH, W, 2);
    c.beginPath(); c.arc(X(pad + 14 * u, 0), navH / 2, 14 * u, 0, 7); c.fillStyle = '#2aa862'; c.fill();
    font(19, 800); text(T.brand, rtl ? W - pad - 36 * u : pad + 36 * u, navH / 2 + 7 * u, '#16110e');
    var bw = 86 * u, bx = X(W - pad - bw, bw); rr(bx, navH / 2 - 16 * u, bw, 32 * u, 16 * u, '#ff5a4d'); font(14, 800); text(T.order, bx + bw / 2, navH / 2 + 5 * u, '#16110e', 'center');
    if (W > 520) { font(15, 600); var nx = rtl ? W * 0.62 : W * 0.38; for (var i = 0; i < 3; i++) { text(T.nav[i], nx, navH / 2 + 5 * u, '#4a4038', rtl ? 'right' : 'left'); nx += (rtl ? -1 : 1) * (c.measureText(T.nav[i]).width + 26 * u); } }
    // hero
    var hy = navH + 34 * u, colW = W > 520 ? W * 0.5 - pad : W - pad * 2;
    font(46, 800); text(T.h[0], X(pad), hy + 40 * u, '#16110e'); text(T.h[1], X(pad), hy + 40 * u + 52 * u, '#ff5a4d');
    font(16, 400); var ls = wrapText(c, T.p, colW - 10 * u), ly = hy + 40 * u + 52 * u + 34 * u;
    ls.forEach(function (l, k) { text(l, X(pad), ly + k * 24 * u, '#4a4038'); });
    var by = ly + ls.length * 24 * u + 10 * u, cw = 150 * u; rr(X(pad, cw), by, cw, 40 * u, 20 * u, '#3c35ff'); font(15, 800); text(T.cta, X(pad, cw) + cw / 2, by + 26 * u, '#fff', 'center');
    // art block
    if (W > 520) {
      var ax = X(W * 0.55, W * 0.41 - pad * 0.2), aw = W * 0.41 - pad * 0.2, ah = 190 * u, ay = hy + 4 * u;
      rr(ax, ay, aw, ah, 18 * u, '#ffc72c'); c.save(); c.beginPath(); c.roundRect(ax, ay, aw, ah, 18 * u); c.clip();
      c.beginPath(); c.arc(ax + aw * 0.7, ay + ah * 0.34, 34 * u, 0, 7); c.fillStyle = '#ff5a4d'; c.fill();
      c.beginPath(); c.moveTo(ax, ay + ah); c.lineTo(ax + aw * 0.35, ay + ah * 0.5); c.lineTo(ax + aw * 0.65, ay + ah); c.fillStyle = '#2aa862'; c.fill();
      c.beginPath(); c.moveTo(ax + aw * 0.4, ay + ah); c.lineTo(ax + aw * 0.75, ay + ah * 0.58); c.lineTo(ax + aw, ay + ah); c.fillStyle = '#3c35ff'; c.fill(); c.restore();
    }
    // cards
    var cy = Math.max(by + 70 * u, H * 0.58), gap = 16 * u, cwid = (W - pad * 2 - gap * 2) / 3, chh = H - cy - 62 * u, cols = ['#ffa3c8', '#9be3b0', '#ffe08a'];
    for (var k = 0; k < 3; k++) {
      var cx = X(pad + k * (cwid + gap), cwid);
      rr(cx, cy, cwid, chh, 14 * u, '#fff'); c.lineWidth = 2; c.strokeStyle = '#16110e'; c.beginPath(); c.roundRect ? c.roundRect(cx, cy, cwid, chh, 14 * u) : c.rect(cx, cy, cwid, chh); c.stroke();
      rr(cx + 8 * u, cy + 8 * u, cwid - 16 * u, chh * 0.42, 9 * u, cols[k]);
      font(16, 800); text(T.cards[k], X(pad + k * (cwid + gap) + 10 * u, cwid - 20 * u) + (rtl ? cwid - 20 * u : 0), cy + chh * 0.42 + 38 * u, '#16110e');
      rr(cx + 10 * u, cy + chh * 0.42 + 50 * u, cwid * 0.6, 7 * u, 4 * u, '#d9cfbf');
    }
    // footer
    c.fillStyle = '#16110e'; c.fillRect(0, H - 40 * u, W, 40 * u); font(13, 600); text(T.foot, W / 2, H - 15 * u, '#fffaf0', 'center');
  }

  /* ---------- build / rebuild ---------- */
  function sizeNow() { var w = Math.round(Math.max(300, Math.min(900, wrap.clientWidth || 600))); return { W: w, H: w < 520 ? 460 : Math.round(w * 0.58) }; }
  function build() {
    var s = sizeNow(), dpr = Math.min(2, window.devicePixelRatio || 1);
    if (st.eng) { st.eng.destroy(); st.eng = null; }
    st.lang = lang(); st.W = s.W; st.H = s.H;
    var src = document.createElement('canvas'); src.width = Math.round(s.W * dpr); src.height = Math.round(s.H * dpr);
    var c = src.getContext('2d'); c.scale(dpr, dpr); drawSample(c, s.W, s.H, st.lang);
    canvas.style.aspectRatio = s.W + ' / ' + s.H;
    st.eng = E.create({ canvas: canvas, source: src, width: s.W, height: s.H, dpr: dpr, gentle: st.gentle, sound: st.sound, theme: palette, onChange: onChange });
    st.eng.setTool(st.tool);
    canvas.setAttribute('aria-label', t('canvasLabel')); bar.setAttribute('aria-label', t('toolbar'));
    renderBar(); onChange();
    window.__gosastDemo = st;
  }
  var lastN = -1, liveT = 0;
  function onChange() {
    if (!st.eng) return; var s = st.eng.stats();
    count.setAttribute('data-n', s.pieces);
    if (!liveT) liveT = setTimeout(function () { liveT = 0; if (st.eng) { var n = st.eng.stats().pieces; count.textContent = n ? t('pieces', { n: S.num(st.lang, n) }) : t('intact'); } }, count.textContent ? 400 : 0);
    if (s.pieces) hideHint();
    syncPressed();
  }
  function hideHint() { if (hint && !hint.hidden) hint.hidden = true; }

  /* ---------- toolbar (the same words and keys as the extension) ---------- */
  var ACTIONS = [['strip', 'shred', 'shredTip'], ['confetti', 'confetti', 'confettiTip'], ['broom', 'broom', 'broomTip'], ['glue', 'glue', 'glueTip'], ['|'],
    ['shredAll', 'shredAll', 'shredAllTip'], ['rewind', 'rewind', 'rewindTip'], ['|'], ['gentle', 'gentle', 'gentleTip'], ['sound', 'sound', 'soundTip']];
  function renderBar() {
    bar.textContent = '';
    ACTIONS.forEach(function (a) {
      if (a[0] === '|') { var sp = document.createElement('i'); sp.className = 'sep'; sp.setAttribute('aria-hidden', 'true'); bar.appendChild(sp); return; }
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-id', a[0]); b.title = t(a[2]);
      b.className = 'tb tb-' + a[0];
      var l = document.createElement('span'); l.textContent = t(a[1]); b.appendChild(l);
      if (KEYS[a[0]]) { var k = document.createElement('kbd'); k.textContent = S.num(st.lang, KEYS[a[0]]); k.setAttribute('aria-hidden', 'true'); b.appendChild(k); }
      if (TOOLS.indexOf(a[0]) >= 0 || a[0] === 'gentle' || a[0] === 'sound') b.setAttribute('aria-pressed', 'false');
      bar.appendChild(b);
    });
    syncPressed();
  }
  function syncPressed() {
    Array.prototype.forEach.call(bar.querySelectorAll('button[aria-pressed]'), function (b) {
      var id = b.getAttribute('data-id'), on = TOOLS.indexOf(id) >= 0 ? st.tool === id : id === 'gentle' ? st.gentle : st.sound;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  function act(id) {
    if (!st.eng) return;
    if (TOOLS.indexOf(id) >= 0) { st.tool = id; st.eng.setTool(id); }
    else if (id === 'shredAll') { hideHint(); st.eng.shredAll(); }
    else if (id === 'rewind') { st.eng.rewind(); }
    else if (id === 'gentle') { st.gentle = !st.gentle; st.eng.setGentle(st.gentle); }
    else if (id === 'sound') { st.sound = !st.sound; st.eng.setSound(st.sound); }
    syncPressed(); onChange();
  }
  bar.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b) act(b.getAttribute('data-id')); });

  /* keyboard: same keys as the extension, active while focus is inside the demo box */
  wrap.addEventListener('keydown', function (ev) {
    if (ev.ctrlKey || ev.metaKey || ev.altKey || !st.eng) return;
    var onBtn = ev.target && ev.target.tagName === 'BUTTON';
    if (ev.key === 'Tab' || (onBtn && (ev.key === 'Enter' || ev.key === ' '))) return;
    var k = ev.key, step = ev.shiftKey ? 80 : 24, used = true;
    if (k === 'Escape') act('rewind');
    else if (k === '1') act('strip'); else if (k === '2') act('confetti'); else if (k === '3') act('broom'); else if (k === '4') act('glue');
    else if (k === 's' || k === 'S') act('shredAll'); else if (k === 'r' || k === 'R') act('rewind');
    else if (k === 'g' || k === 'G') act('gentle'); else if (k === 'm' || k === 'M') act('sound');
    else if (ev.target === canvas && k === 'ArrowLeft') { hideHint(); st.eng.kbMove(-step, 0); }
    else if (ev.target === canvas && k === 'ArrowRight') { hideHint(); st.eng.kbMove(step, 0); }
    else if (ev.target === canvas && k === 'ArrowUp') { hideHint(); st.eng.kbMove(0, -step); }
    else if (ev.target === canvas && k === 'ArrowDown') { hideHint(); st.eng.kbMove(0, step); }
    else if (ev.target === canvas && (k === 'Enter' || k === ' ')) { hideHint(); st.eng.kbToggle(); }
    else used = false;
    if (used) ev.preventDefault();
  });
  canvas.addEventListener('pointerdown', function () { st.touched = true; hideHint(); });

  /* "show me": a little scripted zig-zag so nobody has to guess what dragging does */
  var showing = 0;
  function showMe() {
    if (!st.eng) return; hideHint(); st.eng.rewind(); var W = st.W, H = st.H, eng = st.eng, i = 0, pts = [];
    var rows = 5; for (var r = 0; r < rows; r++) { var y = H * (0.14 + r * 0.17), a = r % 2 ? W * 0.94 : W * 0.06, b = r % 2 ? W * 0.06 : W * 0.94; for (var s = 0; s <= 24; s++) pts.push([a + (b - a) * s / 24, y + Math.sin(s * 0.9 + r) * 10]); }
    clearInterval(showing);
    showing = setInterval(function () {
      if (st.eng !== eng || i >= pts.length - 1) { clearInterval(showing); return; }
      var p = pts[i], q = pts[i + 1]; eng.tearAt('strip', p[0], p[1], q[0], q[1]); i++;
    }, 28);
  }
  document.getElementById('demo-show').addEventListener('click', showMe);
  document.getElementById('demo-reset').addEventListener('click', function () { act('rewind'); });

  /* rebuild on language or width change (like the real extension, which closes when the window is resized) */
  var rt = 0;
  function maybeRebuild(force) {
    clearTimeout(rt); rt = setTimeout(function () {
      var s = sizeNow(); if (force || lang() !== st.lang || Math.abs(s.W - st.W) >= 2) build();
    }, 220);
  }
  new MutationObserver(function () { if (lang() !== st.lang) maybeRebuild(true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  if (window.ResizeObserver) new ResizeObserver(function () { maybeRebuild(false); }).observe(wrap); else window.addEventListener('resize', function () { maybeRebuild(false); });
  mq.addEventListener && mq.addEventListener('change', function (e) { st.gentle = e.matches; if (st.eng) st.eng.setGentle(st.gentle); renderBar(); });

  var go = function () { build(); stage.setAttribute('data-ready', '1'); };
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 20px Vazirmatn', 'گسست'), document.fonts.load('800 20px Vazirmatn', 'Gosast'), document.fonts.load('400 16px Vazirmatn', 'گسست Gosast')]).then(go, go); else go();
})();
