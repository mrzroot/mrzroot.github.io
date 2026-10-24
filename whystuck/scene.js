/* whystuck scene: a tangle of seven strands (one per kind of stall) that the slider, the drag or the loop pulls straight. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');
  var V = [['pager', 'صفحه‌خوان (pager)'], ['editor', 'ویرایشگر'], ['y/N prompt', 'پرسش y/N'], ['password', 'رمز عبور'], ['watch mode', 'حالت watch'], ['lock', 'قفل'], ['network connect', 'اتصال شبکه']];
  /* ticker */
  var hero = $('.hero'), tk = d.createElement('div'); tk.className = 'ticker'; tk.setAttribute('aria-hidden', 'true');
  var inner = d.createElement('div'); for (var r = 0; r < 4; r++) V.forEach(function (v) { var s = d.createElement('span'); s.innerHTML = '<span class="l-en" style="padding:0">' + v[0] + '</span><span class="l-fa" lang="fa" style="padding:0">' + v[1] + '</span>'; s.style.cssText = ''; inner.appendChild(s); });
  tk.appendChild(inner); hero.parentNode.insertBefore(tk, hero.nextSibling);
  /* reveal */
  var rvs = $$('main section:not(.hero) .wrap > *, .how .card, .grid .card, .kpis li').filter(function (e) { return !e.closest('.hero'); }); rvs.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px' }); rvs.forEach(function (e) { io.observe(e); }); } else rvs.forEach(function (e) { e.classList.add('in'); });
  var links = $$('.nav a[href^="#"]'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) { var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a, i) { a.classList.toggle('on', secs[i] === e.target); }); }); }, { rootMargin: '-45% 0px -50% 0px' }); secs.forEach(function (x) { if (x) spy.observe(x); }); }

  /* ---- tangle ---- */
  var cv = $('#tangle'), pull = $('#pull'), out = $('#pull-out'); if (!cv) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, N = V.length, u = 0, manual = 0, hover = -1;
  var COL = ['#141210', '#ff3b1f', '#ffc933'], P = [];
  for (var i = 0; i < N; i++) P.push({ f1: 2 + (i * 3) % 5 + .3 * i, f2: 3 + (i * 2) % 4 + .2 * i, p1: i * 1.7, p2: i * .9 + 1, s1: .25 + i * .03, s2: -.2 - i * .02, w: 1.08 + (i % 3) * .08 });
  function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function fg() { return getComputedStyle(d.body).getPropertyValue('--ink').trim() || '#141210'; }
  function draw(t) {
    var ink = fg(), fa = root.lang === 'fa'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var cx = W * .42, cy = H * .5, Rx = W * .34, Ry = H * .36, x0 = W * .06, x1 = W * (W < 420 ? .64 : .7), gap = (H - 44) / (N + 1);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (var i = 0; i < N; i++) {
      var q = P[i], k = Math.max(0, Math.min(1, ease(Math.max(0, Math.min(1, u * 1.5 - i * .075))))), lw = Math.max(6, H * .028), hi = hover === i;
      ctx.beginPath();
      for (var j = 0; j <= 90; j++) {
        var s = j / 90, tx = cx + Rx * Math.sin(q.f1 * 6.283 * s * .5 + q.p1 + t * q.s1) * (.55 + .45 * Math.sin(s * 3 + i)), ty = cy + Ry * Math.sin(q.f2 * 6.283 * s * .5 + q.p2 + t * q.s2) * (.55 + .45 * Math.cos(s * 2.6 + i)),
          sx = x0 + (x1 - x0) * s, sy = 34 + gap * (i + 1) + Math.sin(s * 6 + t * 2 + i) * (1 - k) * 0, x = tx + (sx - tx) * k, y = ty + (sy - ty) * k;
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.strokeStyle = ink; ctx.lineWidth = lw + 5; ctx.stroke();
      ctx.strokeStyle = i === 1 ? COL[1] : (i % 3 === 2 ? COL[2] : (hi ? COL[1] : (ink === '#141210' ? '#fffaf0' : '#201c17'))); ctx.lineWidth = lw; ctx.stroke();
      if (k > .98) { ctx.font = '700 ' + (W < 420 ? 11 : 13) + 'px ' + (fa ? 'Vazirmatn' : '"Space Mono"') + ', monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.direction = fa ? 'rtl' : 'ltr'; ctx.fillText((fa ? '' : '') + V[i][fa ? 1 : 0], x1 + 14, 34 + gap * (i + 1)); }
    }
    if (out) out.textContent = Math.round(u * 100) + '%';
  }
  function setU(v, fromUser) { u = Math.max(0, Math.min(1, v)); if (pull && +pull.value !== Math.round(u * 100)) pull.value = Math.round(u * 100); }
  size(); addEventListener('resize', function () { size(); draw(tt); });
  var tt = 0, raf = 0, on = false, t0 = 0;
  function loopU(now) { var c = ((now - t0) / 1000) % 9.5; if (c < 3.2) return ease(c / 3.2); if (c < 6) return 1; if (c < 8.2) return 1 - ease((c - 6) / 2.2); return 0; }
  function frame(now) { if (!on) return; tt = (now - t0) / 1000; if (!manual || now - manual > 3500) { manual = 0; setU(loopU(now)); } draw(tt); raf = requestAnimationFrame(frame); }
  function start() { if (on || d.hidden) return; on = true; t0 = performance.now() - tt * 1000; raf = requestAnimationFrame(frame); }
  function stop() { on = false; cancelAnimationFrame(raf); }
  if (pull) pull.addEventListener('input', function () { manual = performance.now(); setU(pull.value / 100); if (reduce) draw(0); });
  var drag = false;
  cv.addEventListener('pointerdown', function (e) { drag = true; cv.setPointerCapture(e.pointerId); mv(e); });
  cv.addEventListener('pointermove', function (e) { if (drag) mv(e); else { var r = cv.getBoundingClientRect(), y = (e.clientY - r.top) / r.height, k = Math.round(y * (N + 1)) - 1; hover = u > .9 && k >= 0 && k < N ? k : -1; } });
  cv.addEventListener('pointerup', function () { drag = false; }); cv.addEventListener('pointerleave', function () { hover = -1; });
  function mv(e) { var r = cv.getBoundingClientRect(); manual = performance.now(); setU((e.clientX - r.left) / r.width * 1.15 - .05); if (reduce) draw(0); }
  new MutationObserver(function () { draw(tt); }).observe(root, { attributes: true, attributeFilter: ['lang', 'data-theme'] });
  if (reduce) { setU(1); draw(0); return; }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(cv); else start();
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
})();
