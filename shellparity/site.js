/* mrzroot project site: language, theme, menu, copy, demo viewers, hero player, glyph emblem. No network, no dependencies. */
(function () {
  'use strict';
  var root = document.documentElement, S = window.SITE || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFa = function () { return root.lang === 'fa'; };
  var esc = function (s) { return String(s).replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); };

  /* ---------- language ---------- */
  function applyLang(l, persist) {
    root.lang = l; root.dir = l === 'fa' ? 'rtl' : 'ltr';
    var t = root.getAttribute('data-title-' + l); if (t) document.title = t;
    var sr = $('#lang-sr'); if (sr) sr.textContent = l === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی';
    var mb = $('#menu-btn'); if (mb) mb.setAttribute('aria-label', l === 'fa' ? 'باز کردن منو' : 'Open menu');
    $$('.cp').forEach(function (b) { b.setAttribute('aria-label', l === 'fa' ? 'کپی' : 'Copy'); });
    if (persist) store.set('mrz-lang', l);
  }
  $('#lang-toggle').addEventListener('click', function () { applyLang(isFa() ? 'en' : 'fa', true); });
  applyLang(root.lang === 'fa' ? 'fa' : 'en', false);

  /* ---------- theme ---------- */
  $('#theme-toggle').addEventListener('click', function () {
    var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', n); root.style.colorScheme = n; store.set('mrz-theme', n);
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', n === 'light' ? '#f7f5ef' : '#070b1a'); });
    drawEmblem();
  });

  /* ---------- menu ---------- */
  var mb = $('#menu-btn');
  mb.addEventListener('click', function () { var o = document.body.classList.toggle('menu-open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { document.body.classList.remove('menu-open'); mb.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.body.classList.remove('menu-open'); mb.setAttribute('aria-expanded', 'false'); } });

  /* ---------- copy ---------- */
  $$('.cp').forEach(function (b) {
    b.addEventListener('click', function () {
      var code = $('code', b.parentNode); var txt = code ? code.textContent : '';
      var done = function () { b.classList.add('done'); setTimeout(function () { b.classList.remove('done'); }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () {});
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); }
    });
  });

  /* ---------- colourise terminal text ---------- */
  function colour(line) {
    var e = esc(line);
    if (/^\s*▸ STUCK|✖|ERROR|NOT UTF-8|not found|STALE/.test(line)) return '<span class="c-err">' + e + '</span>';
    if (/^\s*▸ NOT STUCK|✓|OK\b/.test(line)) return '<span class="c-ok">' + e + '</span>';
    if (/⚠|WARN/.test(line)) return '<span class="c-warn">' + e + '</span>';
    if (/^─── |^\$ |^\s+(Evidence|Fix \(non-interactive\)|If you need it)/.test(line)) return '<span class="c-acc">' + e + '</span>';
    if (/^\s*(human|agent|why|found|fix|newer|proof|note)\b/.test(line)) return e.replace(/^(\s*)(\w+)/, '$1<span class="c-dim">$2</span>');
    return e;
  }
  function colourBlock(lines) { return lines.map(colour).join('\n'); }

  /* ---------- demo: whystuck scenarios ---------- */
  var D = S.demo || {};
  var tabs = $('#demo-tabs');
  if (D.scenarios && tabs) {
    var pre = $('#demo-pre code'), desc = $('#demo-desc'), foot = $('#demo-foot'), bar = $('#demo-bar');
    D.scenarios.forEach(function (sc, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.setAttribute('role', 'tab'); b.textContent = sc.id; b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () { show(i); });
      tabs.appendChild(b);
    });
    var show = function (i) {
      var sc = D.scenarios[i];
      $$('.tab', tabs).forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
      pre.innerHTML = colourBlock(sc.out); desc.textContent = sc.desc; bar.textContent = '$ whystuck -- ' + sc.cmd; foot.textContent = sc.check;
    };
    show(0);
  }
  /* ---------- demo: shellparity findings ---------- */
  var fl = $('#findings');
  if (D.findings && fl) {
    D.findings.forEach(function (f, i) {
      var d = document.createElement('div'); d.className = 'finding'; d.setAttribute('data-open', i === 0 ? 'true' : 'false'); d.setAttribute('data-sev', f.sev);
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
      b.innerHTML = '<span class="sev ' + f.sev + '">' + ({ e: 'ERROR', w: 'WARN', n: 'NOTE' })[f.sev] + '</span><span>#' + f.n + ' ' + esc(f.title) + '</span>';
      var p = document.createElement('pre'); p.innerHTML = colourBlock(f.body);
      b.addEventListener('click', function () { var o = d.getAttribute('data-open') !== 'true'; d.setAttribute('data-open', o ? 'true' : 'false'); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
      d.appendChild(b); d.appendChild(p); fl.appendChild(d);
    });
    $$('.fl-filter').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-f');
        $$('.fl-filter').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('.finding', fl).forEach(function (d) { d.style.display = (v === 'all' || d.getAttribute('data-sev') === v) ? '' : 'none'; });
      });
    });
  }
  /* ---------- demo: whystale timeline ---------- */
  var tl = $('#tl');
  if (D.rows && tl) {
    var tlHtml = '';
    D.rows.forEach(function (r) {
      var w = Math.round(100 * Math.log10(r.secs + 1) / Math.log10(7201));
      tlHtml += '<div class="tl-row"><h4>' + esc(r.kind) + ' <span>· STALE</span></h4><p>' + esc(r.subject) + '</p>' +
        '<div class="tl-bar" aria-hidden="true"><span class="pt" style="inset-inline-start:2%"></span><span class="seg" data-w="' + Math.max(8, w - 6) + '" style="inset-inline-start:2%"></span><span class="pt e" data-x="' + (2 + Math.max(8, w - 6)) + '"></span>' +
        '<small style="inset-inline-start:2%">' + esc(r.from) + '</small><small class="r" style="inset-inline-start:2%">' + esc(r.to) + '</small></div>' +
        '<p style="margin:8px 0 0">' + esc(r.why) + '</p><div class="tl-fix">fix  ' + esc(r.fix) + '</div></div>';
    });
    tl.innerHTML = tlHtml;
    var grow = function () { $$('.tl-bar', tl).forEach(function (b) { var s = $('.seg', b), e = $('.pt.e', b); s.style.width = s.getAttribute('data-w') + '%'; e.style.insetInlineStart = e.getAttribute('data-x') + '%'; }); };
    if (reduce || !('IntersectionObserver' in window)) grow();
    else new IntersectionObserver(function (en, o) { if (en[0].isIntersecting) { grow(); o.disconnect(); } }, { threshold: 0.2 }).observe(tl);
  }

  /* ---------- hero player ---------- */
  var hp = $('#hero-pre');
  if (hp && S.hero && S.hero.lines) {
    var code = $('code', hp), lines = S.hero.lines, timer = 0, alive = true;
    var render = function (n, typed) {
      var out = lines.slice(0, n).map(function (l) { return l.t === 'cmd' ? '<span class="c-cmd">' + esc(l.s) + '</span>' : colour(l.s); });
      if (typeof typed === 'string') out.push('<span class="c-cmd">' + esc(typed) + '</span><span class="caret"></span>');
      code.innerHTML = out.join('\n');
    };
    var run = function () {
      if (reduce) { render(lines.length); return; }
      var i = 0, c = 0;
      (function step() {
        if (!alive) return;
        var l = lines[i];
        if (!l) { timer = setTimeout(function () { run(); }, 4200); return; }
        if (l.t === 'cmd') { c++; render(i, l.s.slice(0, c)); if (c < l.s.length) { timer = setTimeout(step, 38); return; } c = 0; i++; timer = setTimeout(step, 420); return; }
        i++; render(i); timer = setTimeout(step, l.d || 130);
      })();
    };
    document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(timer); } else { clearTimeout(timer); run(); } });
    run();
  }
  var sp = $('#split-rows');
  if (sp && S.hero && S.hero.rows) {
    var H = $('#split-h'), A = $('#split-a'), n = 0;
    var add = function () {
      if (n >= S.hero.rows.length) { if (reduce) return; setTimeout(function () { H.innerHTML = ''; A.innerHTML = ''; n = 0; add(); }, 4200); return; }
      var r = S.hero.rows[n++];
      var li = function (cls) { var e = document.createElement('li'); e.className = 'row-in'; return e; };
      var a = li(), b = li();
      a.innerHTML = '<small>' + esc(r.k) + '</small>' + esc(r.h); b.innerHTML = '<small>' + esc(r.k) + '</small><span class="bad">' + esc(r.a) + '</span>';
      H.appendChild(a); A.appendChild(b);
      setTimeout(add, reduce ? 0 : 650);
    };
    add();
  }

  /* ---------- glyph emblem (same particle look as the portfolio cards) ---------- */
  var GL = {
    whystuck: function (o, w, h, u) { var cx = w / 2, cy = h / 2 - u * 0.08; o.lineCap = 'round'; o.lineWidth = u * 0.04; o.beginPath(); o.arc(cx, cy, u * 0.3, 0, Math.PI * 2); o.stroke(); o.fillRect(cx - u * 0.12, cy - u * 0.14, u * 0.075, u * 0.28); o.fillRect(cx + u * 0.045, cy - u * 0.14, u * 0.075, u * 0.28); var by = cy + u * 0.46; o.lineWidth = u * 0.055; o.beginPath(); o.moveTo(cx - u * 0.42, by); o.lineTo(cx + u * 0.02, by); o.stroke(); o.lineWidth = u * 0.03; o.setLineDash([u * 0.03, u * 0.06]); o.beginPath(); o.moveTo(cx + u * 0.08, by); o.lineTo(cx + u * 0.42, by); o.stroke(); o.setLineDash([]); },
    shellparity: function (o, w, h, u) { var cx = w / 2, cy = h / 2, rootY = cy + u * 0.4, ty = cy - u * 0.2, ww = u * 0.32, hh = u * 0.26; o.lineCap = 'round'; o.lineJoin = 'round'; o.beginPath(); o.arc(cx, rootY, u * 0.045, 0, Math.PI * 2); o.fill(); [-1, 1].forEach(function (s) { var x = cx + s * u * 0.27; o.lineWidth = u * 0.03; o.beginPath(); o.moveTo(cx, rootY); o.bezierCurveTo(cx, cy + u * 0.18, x, cy + u * 0.2, x, ty + hh / 2 + u * 0.02); o.stroke(); o.lineWidth = u * 0.035; if (s > 0) o.setLineDash([u * 0.05, u * 0.045]); o.beginPath(); o.rect(x - ww / 2, ty - hh / 2, ww, hh); o.stroke(); o.setLineDash([]); o.lineWidth = u * 0.032; o.beginPath(); o.moveTo(x - ww * 0.3, ty - hh * 0.18); o.lineTo(x - ww * 0.12, ty); o.lineTo(x - ww * 0.3, ty + hh * 0.18); o.stroke(); o.fillRect(x, ty + hh * 0.12, ww * 0.26, u * 0.03); }); o.lineWidth = u * 0.03; o.beginPath(); o.moveTo(cx - u * 0.05, ty - u * 0.05); o.lineTo(cx + u * 0.05, ty - u * 0.05); o.moveTo(cx - u * 0.05, ty + u * 0.03); o.lineTo(cx + u * 0.05, ty + u * 0.03); o.moveTo(cx + u * 0.04, ty - u * 0.11); o.lineTo(cx - u * 0.04, ty + u * 0.09); o.stroke(); },
    whystale: function (o, w, h, u) { var cx = w / 2, cy = h / 2, x0 = cx - u * 0.36, x1 = cx + u * 0.08, y0 = cy - u * 0.4, y1 = cy + u * 0.22, f = u * 0.14; o.lineJoin = 'round'; o.lineCap = 'round'; o.lineWidth = u * 0.04; o.beginPath(); o.moveTo(x0, y0); o.lineTo(x1 - f, y0); o.lineTo(x1, y0 + f); o.lineTo(x1, y1); o.lineTo(x0, y1); o.closePath(); o.stroke(); o.lineWidth = u * 0.03; o.beginPath(); o.moveTo(x1 - f, y0); o.lineTo(x1 - f, y0 + f); o.lineTo(x1, y0 + f); o.stroke(); [0.1, 0.22, 0.34].forEach(function (k, i) { o.fillRect(x0 + u * 0.07, y0 + u * (0.2 + k), u * (0.24 - i * 0.05), u * 0.03); }); var kx = cx + u * 0.2, ky = cy + u * 0.18, r = u * 0.24; o.save(); o.globalCompositeOperation = 'destination-out'; o.beginPath(); o.arc(kx, ky, r + u * 0.05, 0, Math.PI * 2); o.fill(); o.restore(); o.lineWidth = u * 0.04; o.beginPath(); o.arc(kx, ky, r, 0, Math.PI * 2); o.stroke(); o.lineWidth = u * 0.035; o.beginPath(); o.moveTo(kx, ky); o.lineTo(kx, ky - r * 0.62); o.moveTo(kx, ky); o.lineTo(kx + r * 0.46, ky + r * 0.2); o.stroke(); o.beginPath(); o.arc(kx, ky, u * 0.02, 0, Math.PI * 2); o.fill(); }
  };
  var em = $('#emblem'), pts = null, ph = null, raf = 0, eW = 0, eH = 0, ctx = null;
  function buildEmblem() {
    if (!em || !GL[S.slug]) return;
    var r = em.getBoundingClientRect(); if (r.width < 4) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2); eW = Math.round(r.width); eH = Math.round(r.height);
    em.width = eW * dpr; em.height = eH * dpr; ctx = em.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var oc = document.createElement('canvas'); oc.width = 240; oc.height = 240; var o = oc.getContext('2d'); o.fillStyle = '#fff'; o.strokeStyle = '#fff';
    GL[S.slug](o, 240, 240, 240); var d = o.getImageData(0, 0, 240, 240).data, px = [];
    for (var y = 0; y < 240; y += 2) for (var x = 0; x < 240; x += 2) if (d[(y * 240 + x) * 4 + 3] > 120) px.push(x / 240, y / 240);
    var m = px.length / 2, n = 520; pts = new Float32Array(n * 3); ph = new Float32Array(n);
    for (var i = 0; i < n; i++) { var k = (Math.random() * m) | 0; pts[i * 3] = px[k * 2] + (Math.random() - .5) / 120; pts[i * 3 + 1] = px[k * 2 + 1] + (Math.random() - .5) / 120; pts[i * 3 + 2] = Math.random(); ph[i] = Math.random() * 6.28; }
  }
  function paintEmblem(t) {
    raf = 0; if (!pts || !ctx) return;
    var light = root.getAttribute('data-theme') === 'light', cs = getComputedStyle(document.body);
    var main = cs.getPropertyValue(light ? '--p-light' : '--p-dark').trim() || '#3fd0c9', hot = light ? '#9a5f08' : '#f0be5e';
    ctx.clearRect(0, 0, eW, eH); var ins = .12, bw = eW * (1 - 2 * ins), bh = eH * (1 - 2 * ins), n = ph.length;
    for (var pass = 0; pass < 2; pass++) { ctx.fillStyle = pass ? hot : main;
      for (var i = 0; i < n; i++) { var sp = pts[i * 3 + 2] > .93; if (sp !== !!pass) continue; var tw = reduce ? 1 : .7 + .3 * Math.sin(t * .0021 + ph[i]); ctx.globalAlpha = Math.min(1, (.62 + pts[i * 3 + 2] * .25) * tw); ctx.beginPath(); ctx.arc(eW * ins + pts[i * 3] * bw, eH * ins + pts[i * 3 + 1] * bh + (reduce ? 0 : Math.sin(t * .0011 + ph[i]) * .8), 1.2 + pts[i * 3 + 2] * 1.1, 0, 6.28); ctx.fill(); } }
    ctx.globalAlpha = 1; if (!reduce && !document.hidden) raf = requestAnimationFrame(paintEmblem);
  }
  function drawEmblem() { buildEmblem(); if (!raf) raf = requestAnimationFrame(paintEmblem); }
  if (em) { drawEmblem(); window.addEventListener('resize', function () { drawEmblem(); }); document.addEventListener('visibilitychange', function () { if (!document.hidden && !raf) raf = requestAnimationFrame(paintEmblem); }); }
})();
