/* shellparity scene: a split-screen terminal (cursor or finger moves the seam), a spotlight that is cyan on the left half of the screen and amber on the right. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js'); if (reduce) root.classList.add('reduce');
  /* reveal + seam ping + scroll-spy */
  var rvs = $$('main section:not(.hero) .wrap > *, .how .card, .grid .card, .kpis li').filter(function (e) { return !e.closest('.hero'); }); rvs.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    rvs.forEach(function (e) { io.observe(e); });
    var so = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('seen'); so.unobserve(x.target); } }); }, { rootMargin: '0px 0px -85% 0px' });
    $$('main section:not(.hero)').forEach(function (s) { so.observe(s); });
  } else rvs.forEach(function (e) { e.classList.add('in'); });
  var links = $$('.nav a[href^="#"]'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) { var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a, i) { a.classList.toggle('on', secs[i] === e.target); }); }); }, { rootMargin: '-45% 0px -50% 0px' }); secs.forEach(function (x) { if (x) spy.observe(x); }); }
  /* spotlight: cyan on the left half, amber on the right */
  if (!reduce && window.matchMedia && matchMedia('(pointer:fine)').matches) {
    var b = d.body, px = 0, py = 0, qd = 0;
    d.addEventListener('pointermove', function (e) {
      px = e.clientX; py = e.clientY; if (qd) return; qd = requestAnimationFrame(function () {
        qd = 0; var left = px < innerWidth / 2;
        b.style.setProperty('--cx', px + 'px'); b.style.setProperty('--cy2', py + 'px');
        b.style.setProperty('--spot', left ? 'rgba(54,226,255,.09)' : 'rgba(255,176,46,.09)');
      });
    }, { passive: true });
  }
  /* split stage */
  var sp = $('#sp'); if (!sp) return;
  var body = $('.spbody', sp), div = $('#spdiv'), x = 50, user = 0, on = false, raf = 0, t0 = 0, vis = true;
  function set(v) { x = Math.max(4, Math.min(96, v)); body.style.setProperty('--x', x + '%'); div.setAttribute('aria-valuenow', Math.round(x)); }
  function pos(e) { var r = body.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; }
  var drag = false;
  body.addEventListener('pointerdown', function (e) { drag = true; user = performance.now(); try { body.setPointerCapture(e.pointerId); } catch (_) { } set(pos(e)); });
  body.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse' || drag) { user = performance.now(); set(pos(e)); } });
  body.addEventListener('pointerup', function () { drag = false; user = performance.now(); });
  body.addEventListener('pointercancel', function () { drag = false; });
  div.addEventListener('keydown', function (e) { var k = e.key; if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End') { e.preventDefault(); user = performance.now() + 4000; set(k === 'Home' ? 4 : k === 'End' ? 96 : x + (k === 'ArrowLeft' ? -6 : 6)); } });
  function frame(now) { if (!on) return; if (now - user > 3200) set(50 + Math.sin((now - t0) / 1900) * 30); raf = requestAnimationFrame(frame); }
  function start() { if (on || reduce || d.hidden || !vis) return; on = true; t0 = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { on = false; cancelAnimationFrame(raf); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; vis ? start() : stop(); }, { threshold: .1 }).observe(sp);
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
  set(reduce ? 38 : 50); start();
})();
