/* whyenv scene: a stack of frosted env-file sheets fans out, the shell export wins, the edited .env.local is ignored. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');
  var rvs = $$('main section .wrap > *, .how .card, .grid .card').filter(function (e) { return !e.closest('.hero'); }); rvs.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' }); rvs.forEach(function (e) { io.observe(e); }); } else rvs.forEach(function (e) { e.classList.add('in'); });
  /* scroll spy */
  var links = $$('.nav a[href^="#"]'), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  if ('IntersectionObserver' in window) { var spy = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a, i) { a.classList.toggle('on', secs[i] === e.target); }); }); }, { rootMargin: '-45% 0px -50% 0px' }); secs.forEach(function (x) { if (x) spy.observe(x); }); }

  var stage = $('#sheets'); if (!stage) return;
  var caps = $$('#cap p'), sheets = $$('.sheet', stage), vEl = $('.sheet[data-k=local] .v'), info = $('#sinfo');
  function show(n) { caps.forEach(function (c, i) { c.classList.toggle('on', i === n); }); }
  var steps = [
    [0, 'stack', 0, 1800], [0, 'fan', 1, 1800], [0, 'fan look', 2, 1700], [0, 'fan verdict', 3, 3400],
    [0, 'fan verdict edit', 4, 2600], [0, 'fan verdict', 5, 3200], [0, 'fan', 0, 900]
  ];
  var idx = 0, timer = 0, paused = false, vis = true;
  function apply(s) {
    stage.className = 'sheets ' + s[1]; show(s[2]);
    if (s[1].indexOf('edit') > -1) { vEl.textContent = 'http://localhost:4001'; vEl.classList.remove('flash'); void vEl.offsetWidth; vEl.classList.add('flash'); }
    if (s[1] === 'stack') vEl.textContent = 'http://localhost:4000';
  }
  function tick() {
    clearTimeout(timer); if (paused || !vis) return;
    var s = steps[idx]; apply(s); idx = (idx + 1) % steps.length; if (idx === 0) idx = 1; timer = setTimeout(tick, s[3]);
  }
  if (reduce) { apply(steps[3]); } else { idx = 0; tick(); }
  /* pointer tilt */
  var box = stage.parentNode;
  box.addEventListener('pointermove', function (e) { if (reduce) return; var r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; stage.style.setProperty('--ry', (x * 10).toFixed(2)); stage.style.setProperty('--rx', (-y * 6).toFixed(2)); });
  box.addEventListener('pointerleave', function () { stage.style.setProperty('--ry', 0); stage.style.setProperty('--rx', 0); paused = false; tick(); });
  box.addEventListener('pointerenter', function () { paused = true; clearTimeout(timer); });
  /* click or focus a sheet to read it */
  sheets.forEach(function (sh) {
    function pick() { var t = $('template[data-k=' + sh.dataset.k + ']'); info.innerHTML = ''; info.appendChild(t.content.cloneNode(true)); }
    sh.addEventListener('click', pick); sh.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) tick(); else clearTimeout(timer); }).observe(box);
  d.addEventListener('visibilitychange', function () { vis = !d.hidden; if (vis) tick(); else clearTimeout(timer); });
})();
