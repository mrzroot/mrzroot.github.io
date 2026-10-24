/* whystale scene: an hourglass that measures time since the source changed, a ledger whose lines get rubber-stamped STALE (click one to run its fix: FRESH), and a brass age ruler that sepia-tints the page while you scroll. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');
  var rvs = $$('main section:not(.hero) .wrap > *, .how .card, .grid .card, .kpis li').filter(function (e) { return !e.closest('.hero'); }); rvs.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px' }); rvs.forEach(function (e) { io.observe(e); }); } else rvs.forEach(function (e) { e.classList.add('in'); });
  var links = $$('.nav a[href^="#"]'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) { var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a, i) { a.classList.toggle('on', secs[i] === e.target); }); }); }, { rootMargin: '-45% 0px -50% 0px' }); secs.forEach(function (x) { if (x) spy.observe(x); }); }
  /* age ruler */
  var age = d.createElement('div'); age.id = 'age'; age.setAttribute('aria-hidden', 'true');
  var h = ''; for (var i = 0; i <= 24; i++) h += '<i class="' + (i % 6 ? '' : 'm') + '" style="top:' + (i / 24 * 100) + '%"></i>';
  age.innerHTML = h + '<b class="nd"></b><span class="tx"></span>'; d.body.appendChild(age);
  var nd = $('.nd', age), tx = $('.tx', age), qd = 0;
  function fmt(m) { var hh = Math.floor(m / 60), mm = Math.round(m % 60); return '+' + (hh ? hh + 'h ' : '') + (mm < 10 && hh ? '0' : '') + mm + 'm'; }
  function upd() { qd = 0; var mx = Math.max(1, d.documentElement.scrollHeight - innerHeight), f = Math.max(0, Math.min(1, scrollY / mx)); d.body.style.setProperty('--age', f.toFixed(3)); var y = f * age.clientHeight; nd.style.top = y + 'px'; tx.style.top = y + 'px'; tx.textContent = fmt(f * 120); }
  addEventListener('scroll', function () { if (!qd) qd = requestAnimationFrame(upd); }, { passive: true }); addEventListener('resize', upd); upd();
  /* hourglass + ledger */
  var cv = $('#glass'), rows = $$('.ledger li'); if (!cv) return;
  var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, p = 0, rot = 0, on = false, raf = 0, t0 = 0, vis = true, grains = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  function col(n) { return getComputedStyle(d.body).getPropertyValue(n).trim(); }
  function hw(t) { var a = Math.abs(2 * t - 1); return 4 + (W / 2 - 8) * Math.pow(a, 1.7); }
  function glassPath(c) { var top = 6, bot = H - 6, n = 60, k; c.beginPath(); for (k = 0; k <= n; k++) { var t = k / n; c.lineTo(W / 2 + hw(t), top + (bot - top) * t); } for (k = n; k >= 0; k--) { var t2 = k / n; c.lineTo(W / 2 - hw(t2), top + (bot - top) * t2); } c.closePath(); }
  var cyc = 15, stamped = [0, 0, 0, 0], manual = [0, 0, 0, 0];
  function setRow(i, st) { var r = rows[i]; if (!r) return; if (st === 'stale' && !r.classList.contains('stale')) { r.classList.remove('fresh'); r.classList.add('stale'); r.classList.remove('hit'); void r.offsetWidth; r.classList.add('hit'); } else if (st === 'fresh' && !r.classList.contains('fresh')) { r.classList.remove('stale', 'hit'); r.classList.add('fresh'); } else if (st === 'none') r.classList.remove('stale', 'fresh', 'hit'); }
  function draw(t) {
    var sand = col('--sand') || '#d9a441', line = col('--brass') || '#9a6a1a', top = 6, bot = H - 6, hgt = bot - top;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(rot); ctx.translate(-W / 2, -H / 2);
    ctx.save(); glassPath(ctx); ctx.clip();
    var ts = top + hgt * (.05 + .43 * p), tb = top + hgt * (.95 - .43 * p);
    ctx.fillStyle = sand; ctx.globalAlpha = .95;
    ctx.fillRect(0, ts, W, hgt * .5 - (ts - top) + 0); /* top sand: from surface to neck */
    var mound = (1 - p) * 0 + 9 * (1 - Math.min(1, p * 1.2)) + 3; ctx.beginPath(); ctx.moveTo(0, bot + 2); ctx.lineTo(0, tb + mound); ctx.quadraticCurveTo(W / 2, tb - mound * .2, W, tb + mound); ctx.lineTo(W, bot + 2); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    if (p < .995 && p > 0) { var nx = W / 2, ny = top + hgt * .5; ctx.fillStyle = sand; for (var g = 0; g < grains.length; g++) { var gr = grains[g]; var yy = ny + ((t * 140 + gr.o * 300) % (tb - ny + 4)); ctx.fillRect(nx + gr.x, yy, 1.6, 2.6); } ctx.fillRect(nx - .8, ny - 2, 1.6, tb - ny + 2); }
    ctx.restore();
    ctx.strokeStyle = line; ctx.lineWidth = 2; ctx.lineJoin = 'round'; glassPath(ctx); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W * .08, top - 1); ctx.lineTo(W * .92, top - 1); ctx.moveTo(W * .08, bot + 1); ctx.lineTo(W * .92, bot + 1); ctx.stroke();
    ctx.restore();
  }
  for (var q = 0; q < 14; q++) grains.push({ x: (rnd() - .5) * 3, o: rnd() });
  function ease(x) { return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function frame(now) {
    if (!on) return; var c = ((now - t0) / 1000) % cyc;
    if (c < 9.5) { p = c / 9.5; rot = 0; var th = [.12, .34, .56, .78]; for (var i = 0; i < 4; i++) { if (!manual[i]) setRow(i, p > th[i] ? 'stale' : 'none'); } }
    else if (c < 11.2) { p = 1; rot = 0; for (var j = 0; j < 4; j++) if (!manual[j]) setRow(j, 'stale'); }
    else if (c < 13) { var f = (c - 11.2) / 1.8; p = 1; rot = Math.PI * ease(Math.min(1, f * 1.1)); for (var k = 0; k < 4; k++) if (!manual[k] && f > .15 + k * .2) setRow(k, 'fresh'); if (f > .98) p = 1; }
    else { p = 0; rot = 0; for (var m = 0; m < 4; m++) { manual[m] = 0; } if (c > 13.3) for (var z = 0; z < 4; z++) setRow(z, 'none'); }
    if (c >= 13 && c < 13.3) { p = 0; rot = 0; }
    draw((now - t0) / 1000); raf = requestAnimationFrame(frame);
  }
  function start() { if (on || reduce || d.hidden || !vis) return; on = true; t0 = performance.now() - ((p * 9.5) * 1000); raf = requestAnimationFrame(frame); }
  function stop() { on = false; cancelAnimationFrame(raf); }
  rows.forEach(function (r, i) { function run() { manual[i] = 1; setRow(i, 'fresh'); } r.addEventListener('click', run); r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } }); });
  size(); addEventListener('resize', function () { size(); draw(0); });
  if (reduce) { p = .8; rows.forEach(function (r, i) { setRow(i, 'stale'); }); draw(0); new MutationObserver(function () { draw(0); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] }); return; }
  new MutationObserver(function () { if (!on) draw(0); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; vis ? start() : stop(); }, { threshold: .05 }).observe(cv); else start();
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
  draw(0);
})();
