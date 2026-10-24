/* whycached scene: cache onion + request packets, depth rail, reveal. Pauses offscreen; static under reduced motion. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var bi = function (en, fa) { return '<span class="l-en">' + en + '</span><span class="l-fa" lang="fa">' + fa + '</span>'; };
  root.classList.add('js');

  /* ---------- reveal on scroll ---------- */
  var rvEls = $$('main section .wrap > *, .card, .kpis li, .limits li').filter(function (e) { return !e.closest('.hero'); });
  rvEls.forEach(function (e) { e.classList.add('rv'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rvEls.forEach(function (e) { io.observe(e); });
  } else rvEls.forEach(function (e) { e.classList.add('in'); });

  /* ---------- depth rail: scroll spy + packet position ---------- */
  var nav = $('#nav'), links = $$('a[href^="#"]', nav), secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var h = d.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
    nav.style.setProperty('--depth', p.toFixed(4));
    var cur = -1, y = innerHeight * 0.35;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= y) cur = i; });
    links.forEach(function (a, i) { a.setAttribute('aria-current', i === cur ? 'true' : 'false'); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- onion ---------- */
  var host = $('#onion'); if (!host) return;
  var C = 280, L = [
    { id: 'br', r: 262, col: 'var(--l1)', n: 'BROWSER' },
    { id: 'sw', r: 206, col: 'var(--l2)', n: 'SERVICE WORKER' },
    { id: 'cdn', r: 150, col: 'var(--l3)', n: 'CDN' },
    { id: 'or', r: 92, col: 'var(--l4)', n: 'ORIGIN' }
  ];
  var INFO = {
    br: [bi('Browser', 'مرورگر'), bi('May reuse its stored copy for up to max-age without asking the server. Fix: hard reload (Ctrl+Shift+R).', 'تا پایان max-age می‌تواند نسخهٔ ذخیره‌شده را بدون پرسیدن از سرور استفاده کند. راه‌حل: بارگذاری مجدد کامل (Ctrl+Shift+R).')],
    sw: [bi('Service worker', 'سرویس‌ورکر'), bi('A cache-first worker answers before the network, so HTTP headers do not matter. Fix: unregister it and version the cache name.', 'ورکرِ کش‌اول قبل از شبکه پاسخ می‌دهد، پس هدرهای HTTP اهمیتی ندارند. راه‌حل: حذف ثبت آن و نسخه‌دار کردن نام کش.')],
    cdn: [bi('CDN / shared cache', 'CDN / کش مشترک'), bi('An edge such as Cloudflare serves an older copy than the origin; Age and cf-cache-status give it away. Fix: purge that URL.', 'یک edge مثل Cloudflare نسخه‌ای قدیمی‌تر از سرور اصلی می‌دهد؛ Age و cf-cache-status آن را لو می‌دهند. راه‌حل: پاک‌سازی (purge) همان URL.')],
    or: [bi('Origin', 'سرور اصلی'), bi('Your server holds the fresh copy. The cache-busted probe reaches it, and comparing the two answers is the proof.', 'نسخهٔ تازه اینجاست. درخواست با پارامتر ضدکش به آن می‌رسد و مقایسهٔ دو پاسخ همان مدرک است.')]
  };
  var CAP = [
    bi('1 · a normal request travels inward', '۱ · یک درخواست عادی به سمت داخل می‌رود'),
    bi('2 · a shared cache answers first: Age 4120 (68m 40s), cf-cache-status: HIT', '۲ · یک کش مشترک زودتر جواب می‌دهد: Age 4120 (۶۸ دقیقه)، cf-cache-status: HIT'),
    bi('3 · the cache-busted probe (?_whycached=…) reaches the origin: fresh copy, v2', '۳ · درخواست ضدکش (?_whycached=…) به سرور اصلی می‌رسد: نسخهٔ تازه، v2'),
    bi('4 · the two answers differ: the CDN is stale. Here is the purge command.', '۴ · دو پاسخ فرق دارند: CDN کهنه است. این هم دستور پاک‌سازی.')
  ];
  function el(n, a, p) { var e = d.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  var svg = el('svg', { viewBox: '0 0 560 560', role: 'img', 'aria-label': 'Concentric cache layers: browser, service worker, CDN, origin' }, host);
  var rings = {};
  L.forEach(function (l) {
    var g = el('g', { class: 'ring', 'data-id': l.id }, svg);
    var b = el('circle', { class: 'base', cx: C, cy: C, r: l.r, fill: l.col, stroke: l.col }, g);
    el('circle', { class: 'dash', cx: C, cy: C, r: l.r - 9, stroke: l.col }, g);
    var t = el('text', { x: C, y: C - l.r + 24 }, g); t.textContent = l.n;
    rings[l.id] = g;
    g.addEventListener('click', function () { pick(l.id); });
  });
  var core = el('circle', { class: 'core', cx: C, cy: C, r: 20 }, svg);
  var v2 = el('text', { x: C, y: C + 4, style: 'font-family:JetBrains Mono,monospace;font-size:13px;letter-spacing:0;fill:#04120a;font-weight:700;opacity:0' }, svg); v2.textContent = 'v2';
  var tagA = el('text', { class: 'tag', x: C + 12, y: C - 150 + 52, fill: '#ff6b86', style: 'fill:#ff6b86' }, svg); tagA.textContent = 'HIT · Age 4120 · v1';
  var tagB = el('text', { class: 'tag', x: C + 30, y: C + 4, style: 'fill:#4dffa6' }, svg); tagB.textContent = '';
  var TH = 3.7; // approach angle (rad)
  function pos(r) { return [C + r * Math.cos(TH), C + r * Math.sin(TH)]; }
  var trail = [], N = 14;
  for (var i = 0; i < N; i++) trail.push(el('circle', { class: 'pk', r: 7 - i * 0.4, fill: '#fff', opacity: 0 }, svg));
  var head = el('circle', { class: 'pk', r: 8, fill: '#fff', opacity: 0 }, svg);
  var hist = [];
  function setPk(r, col, vis) {
    var p = pos(r); head.setAttribute('cx', p[0]); head.setAttribute('cy', p[1]); head.setAttribute('fill', col); head.setAttribute('opacity', vis ? 1 : 0);
    hist.unshift(p); hist.length = Math.min(hist.length, N);
    trail.forEach(function (t, i) { var q = hist[i]; if (q && vis) { t.setAttribute('cx', q[0]); t.setAttribute('cy', q[1]); t.setAttribute('fill', col); t.setAttribute('opacity', (1 - i / N) * .35); } else t.setAttribute('opacity', 0); });
  }
  var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var capEl = $('#ocap'), infoEl = $('#oinfo'), legend = $('#legend'), capIdx = -1, sel = null, selUntil = 0;
  function cap(i) { if (i !== capIdx) { capIdx = i; if (capEl) capEl.innerHTML = CAP[i]; } }
  function pick(id) {
    sel = id; selUntil = performance.now() + 7000;
    L.forEach(function (l) { rings[l.id].classList.toggle('on', l.id === id); });
    $$('button', legend).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === id ? 'true' : 'false'); });
    infoEl.innerHTML = '<b>' + INFO[id][0] + '</b>' + INFO[id][1];
  }
  legend.innerHTML = L.map(function (l) { return '<li><button type="button" data-id="' + l.id + '" aria-pressed="false" style="--c:' + l.col + '"><i></i>' + l.n + '</button></li>'; }).join('');
  $$('button', legend).forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.id); }); });
  infoEl.innerHTML = '<b>' + bi('Click a layer', 'روی یک لایه بزنید') + '</b>' + bi('Each ring is a place a stale copy can hide. whycached tells you which one answered.', 'هر حلقه جایی است که یک نسخهٔ کهنه می‌تواند پنهان شود. whycached می‌گوید کدام‌یک جواب داده است.');

  // timeline (seconds): A in 0-2.6, hold 2.6-4.4, A back 4.4-5.8, B in 6.4-9.4, hold to 12, reset
  var T = 13;
  function frame(t) {
    if (sel && performance.now() > selUntil) { sel = null; L.forEach(function (l) { rings[l.id].classList.remove('on'); }); $$('button', legend).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); }
    var stale = false, okc = false, vis = false, r = 300, col = '#fff', ci = 0;
    if (t < 2.6) { r = 300 - 150 * ease(t / 2.6); vis = true; col = '#e6d4ff'; ci = 0; }
    else if (t < 4.4) { r = 150; vis = true; stale = true; col = '#ff6b86'; ci = 1; }
    else if (t < 5.8) { r = 150 + 150 * ease((t - 4.4) / 1.4); vis = true; stale = true; col = '#ff6b86'; ci = 1; }
    else if (t < 6.4) { stale = true; ci = 1; }
    else if (t < 9.4) { r = 300 - 270 * ease((t - 6.4) / 3); vis = true; col = '#4dffa6'; ci = 2; stale = true; }
    else { okc = true; stale = true; ci = t < 11 ? 2 : 3; }
    setPk(r, col, vis);
    rings.cdn.classList.toggle('stale', stale);
    tagA.classList.toggle('show', stale && t >= 2.6);
    core.classList.toggle('ok', okc); v2.setAttribute('opacity', okc ? 1 : 0);
    cap(ci);
  }
  function still() { frame(10); }
  if (reduce) { still(); return; }
  var raf = 0, t0 = 0, run = false, hover = false;
  host.addEventListener('pointerenter', function () { hover = true; }); host.addEventListener('pointerleave', function () { hover = false; });
  var acc = 0, last = 0;
  function loop(now) {
    if (!run) return;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!hover) acc = (acc + dt) % T;
    frame(acc);
    raf = requestAnimationFrame(loop);
  }
  function start() { if (run || d.hidden) return; run = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  function stop() { run = false; cancelAnimationFrame(raf); }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(host); else start();
  d.addEventListener('visibilitychange', function () { d.hidden ? stop() : start(); });
  // pointer parallax tilt
  var wrap = host.parentNode;
  wrap.addEventListener('pointermove', function (e) { var b = host.getBoundingClientRect(), x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5; svg.style.transform = 'perspective(900px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 10).toFixed(2) + 'deg)'; });
  wrap.addEventListener('pointerleave', function () { svg.style.transform = ''; });
  svg.style.transition = 'transform .25s ease-out';
})();
