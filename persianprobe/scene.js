/* persianprobe scene: bidi glyph storm with a code-point lens, and a client-side "xray" inspector (nothing leaves the page). */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');
  /* reveal */
  var els = $$('main section .wrap > *').filter(function (e) { return !e.closest('.hero'); }); els.forEach(function (e) { e.classList.add('reveal-up'); });
  if ('IntersectionObserver' in window && !reduce) { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px' }); els.forEach(function (e) { io.observe(e); }); } else els.forEach(function (e) { e.classList.add('in'); });

  /* ---------- xray ---------- */
  var NAMES = {
    0x64A: ['ARABIC YEH', 'bad', 'use ی U+06CC'], 0x643: ['ARABIC KAF', 'bad', 'use ک U+06A9'], 0x640: ['TATWEEL', 'bad', 'kashida'],
    0x200C: ['ZWNJ', 'inv', 'half-space'], 0x200D: ['ZWJ', 'inv', 'joiner'], 0x200B: ['ZWSP', 'inv', 'zero-width space'], 0xA0: ['NBSP', 'inv', 'no-break space'],
    0x200E: ['LRM', 'inv', 'left-to-right mark'], 0x200F: ['RLM', 'inv', 'right-to-left mark'], 0xFEFF: ['BOM', 'inv', 'byte-order mark'],
    0x6CC: ['PERSIAN YEH', 'ok', ''], 0x6A9: ['PERSIAN KEHEH', 'ok', ''], 0x60C: ['ARABIC COMMA', 'ok', '']
  };
  function info(cp) {
    if (NAMES[cp]) return NAMES[cp];
    if (cp >= 0x660 && cp <= 0x669) return ['ARABIC-INDIC DIGIT ' + (cp - 0x660), 'bad', 'Persian digits are U+06F0..'];
    if (cp >= 0x6F0 && cp <= 0x6F9) return ['PERSIAN DIGIT ' + (cp - 0x6F0), 'ok', ''];
    if (cp >= 0x30 && cp <= 0x39) return ['ASCII DIGIT', '', ''];
    return null;
  }
  var ta = $('#xray-in'), chips = $('#xray-chips'), sum = $('#xray-sum');
  function hex(n) { var s = n.toString(16).toUpperCase(); while (s.length < 4) s = '0' + s; return 'U+' + s; }
  function run() {
    var s = Array.from(ta.value).slice(0, 80), bad = 0, inv = 0, i, html = [];
    chips.textContent = '';
    s.forEach(function (ch, i) {
      var cp = ch.codePointAt(0), inf = info(cp), cls = inf ? inf[1] : '';
      if (cls === 'bad') bad++; if (cls === 'inv') inv++;
      var li = d.createElement('li'); li.className = 'chip ' + cls; li.style.animationDelay = Math.min(i, 30) * 12 + 'ms';
      if (inf) li.title = inf[0] + (inf[2] ? ' · ' + inf[2] : '');
      var b = d.createElement('b'); b.textContent = cls === 'inv' ? inf[0] : (ch === ' ' ? '␣' : ch);
      var sp = d.createElement('span'); sp.textContent = hex(cp);
      li.appendChild(b); li.appendChild(sp); chips.appendChild(li);
    });
    var en = root.lang !== 'fa';
    sum.innerHTML = s.length ? ('<span class="' + (bad ? 'bad' : 'ok') + '">' + bad + (en ? ' look-alike' : ' شبیه‌ساز') + '</span> · <span class="' + (inv ? 'inv' : 'ok') + '">' + inv + (en ? ' invisible' : ' نامرئی') + '</span> · ' + s.length + (en ? ' chars' : ' نویسه')) : (en ? 'type something' : 'چیزی بنویسید');
  }
  ta.addEventListener('input', run); new MutationObserver(run).observe(root, { attributes: true, attributeFilter: ['lang'] }); run();

  /* ---------- storm ---------- */
  var hero = $('.hero'), cv = d.createElement('canvas'); cv.id = 'storm'; cv.setAttribute('aria-hidden', 'true'); hero.insertBefore(cv, hero.firstChild);
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, rows = [], CW = 34, RH = 48, col = {}, lens = { x: -999, y: -999, tx: 0, ty: 0, on: false, r: 150 };
  var POOL = 'ابپتثجچحخدذرزژسشصضطظعغفقگلمنوهی۰۱۲۳۴۵۶۷۸۹ABCDEFabcdef0123456789\u064A\u0643\u200C\u200C\u0660\u0661\u0662\u200B\u0640'.split('');
  function colors() { var s = getComputedStyle(d.body); col = { dim: s.getPropertyValue('--text3').trim(), lime: s.getPropertyValue('--lime').trim(), hot: s.getPropertyValue('--hot').trim(), txt: s.getPropertyValue('--text').trim() }; }
  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function build() {
    var r = hero.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    colors(); rows = []; var n = Math.ceil(H / RH) + 1, cells = Math.ceil(W / CW) + 4;
    for (var i = 0; i < n; i++) {
      var cs = []; for (var j = 0; j < cells; j++) cs.push(rnd(POOL));
      rows.push({ y: i * RH + RH * .7, cells: cs, v: (i % 2 ? 1 : -1) * (14 + (i * 7) % 22), off: Math.random() * 400 });
    }
    draw(0);
  }
  var FONT = '500 24px Vazirmatn, "Martian Mono", monospace', TAG = '600 8px "Martian Mono", monospace';
  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    var R2 = lens.r * lens.r;
    rows.forEach(function (row) {
      var shift = (row.off + row.v * t) % (row.cells.length * CW); if (shift < 0) shift += row.cells.length * CW;
      for (var j = 0; j < row.cells.length; j++) {
        var x = ((j * CW - shift) % (row.cells.length * CW) + row.cells.length * CW) % (row.cells.length * CW) - CW;
        if (x < -CW || x > W + CW) continue;
        var ch = row.cells[j], cp = ch.codePointAt(0), inf = info(cp), cx = x + CW / 2, dx = cx - lens.x, dy = row.y - 8 - lens.y, near = lens.on && dx * dx + dy * dy < R2;
        var flag = inf && (inf[1] === 'bad' || inf[1] === 'inv');
        ctx.font = FONT;
        if (near) {
          var f = 1 - Math.sqrt(dx * dx + dy * dy) / lens.r;
          ctx.globalAlpha = .55 + .45 * f;
          ctx.fillStyle = flag ? (inf[1] === 'bad' ? col.hot : '#ffb020') : col.lime;
          if (inf && inf[1] === 'inv') { ctx.font = TAG; ctx.fillText(inf[0], cx, row.y); ctx.strokeStyle = '#ffb020'; ctx.setLineDash([2, 2]); ctx.strokeRect(cx - 14, row.y - 20, 28, 28); ctx.setLineDash([]); }
          else ctx.fillText(ch, cx, row.y);
          ctx.font = TAG; ctx.globalAlpha = .8 * f + .1; ctx.fillStyle = col.txt; ctx.fillText(hex(cp).slice(2), cx, row.y + 14);
        } else {
          ctx.globalAlpha = flag ? .5 : .22; ctx.fillStyle = flag ? (inf[1] === 'bad' ? col.hot : '#ffb020') : col.dim;
          if (inf && inf[1] === 'inv') { ctx.font = TAG; ctx.fillText('▯', cx, row.y); } else ctx.fillText(ch, cx, row.y);
        }
      }
    });
    ctx.globalAlpha = 1;
    if (lens.on) { ctx.strokeStyle = col.lime; ctx.lineWidth = 1; ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(lens.x, lens.y, lens.r, 0, 6.2832); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lens.x - 8, lens.y); ctx.lineTo(lens.x + 8, lens.y); ctx.moveTo(lens.x, lens.y - 8); ctx.lineTo(lens.x, lens.y + 8); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  build(); var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(build, 150); });
  new MutationObserver(function () { colors(); if (reduce) draw(0); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); lens.tx = e.clientX - r.left; lens.ty = e.clientY - r.top; lens.on = true; lens.manual = performance.now(); });
  hero.addEventListener('pointerleave', function () { lens.manual = 0; });
  if (reduce) { lens.on = true; lens.x = W * .7; lens.y = H * .5; draw(0); return; }
  var raf = 0, run_ = false, t0 = 0;
  function frame(now) {
    if (!run_) return; var t = (now - t0) / 1000;
    if (!lens.manual || now - lens.manual > 4000) { lens.on = true; lens.tx = W * (.62 + .22 * Math.sin(t * .5)); lens.ty = H * (.5 + .3 * Math.cos(t * .37)); }
    lens.x += (lens.tx - lens.x) * .12; lens.y += (lens.ty - lens.y) * .12; if (lens.x < -900) { lens.x = lens.tx; lens.y = lens.ty; }
    draw(t); raf = requestAnimationFrame(frame);
  }
  function start() { if (run_ || d.hidden) return; run_ = true; t0 = performance.now() - (t0 ? 0 : 0); raf = requestAnimationFrame(frame); }
  function stop() { run_ = false; cancelAnimationFrame(raf); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(hero); else start();
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
})();
