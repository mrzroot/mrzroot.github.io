/* Gosast landing page: language, menu, install tabs, and the self-tearing wordmark. No network, nothing stored except the language choice. */
(function () {
  'use strict';
  var d = document, R = d.documentElement, $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* language (FA first; the choice is remembered under the shared key mrz-lang) */
  var LB = $('#lang-toggle'), SR = $('#lang-sr');
  function setLang(l, save) {
    l = l === 'en' ? 'en' : 'fa'; R.lang = l; R.dir = l === 'fa' ? 'rtl' : 'ltr'; R.setAttribute('data-lang', l);
    var t = R.getAttribute('data-title-' + l); if (t) d.title = t;
    if (SR) SR.textContent = l === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی';
    if (save) { try { localStorage.setItem('mrz-lang', l); } catch (e) {} }
    $$('[data-g]').forEach(function (a) { a.setAttribute('aria-label', a.getAttribute('data-g-' + l) || ''); });
  }
  /* copy buttons for the browser addresses in the install steps (they cannot be clicked as links) */
  var live = d.createElement('span'); live.className = 'sr-only'; live.setAttribute('aria-live', 'polite'); d.body.appendChild(live);
  var IC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M5 15V6a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="2.2"/></svg><svg class="ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    return new Promise(function (ok, no) { var ta = d.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; d.body.appendChild(ta); ta.select(); try { d.execCommand('copy') ? ok() : no(); } catch (e) { no(e); } d.body.removeChild(ta); });
  }
  $$('.panel li code').forEach(function (c) {
    var t = c.textContent.trim(); if (!/^[a-z-]+:/.test(t)) return;
    var b = d.createElement('button'); b.type = 'button'; b.className = 'cpy'; b.innerHTML = IC;
    b.setAttribute('data-g', ''); b.setAttribute('data-g-en', 'Copy ' + t); b.setAttribute('data-g-fa', 'کپی ' + t);
    b.addEventListener('click', function () {
      copyText(t).then(function () {
        b.classList.add('done'); live.textContent = R.lang === 'fa' ? 'کپی شد: ' + t : 'Copied: ' + t;
        setTimeout(function () { b.classList.remove('done'); }, 1600);
      }, function () { live.textContent = R.lang === 'fa' ? 'کپی نشد؛ متن را دستی انتخاب کن.' : 'Could not copy; select the text by hand.'; });
    });
    c.insertAdjacentElement('afterend', b);
  });
  setLang(R.lang, false);
  if (LB) LB.addEventListener('click', function () { setLang(R.lang === 'fa' ? 'en' : 'fa', true); });

  /* menu */
  var MB = $('#menu-btn'), NV = $('#nav');
  if (MB && NV) {
    MB.addEventListener('click', function () { var o = NV.classList.toggle('open'); MB.setAttribute('aria-expanded', o); });
    $$('a', NV).forEach(function (a) { a.addEventListener('click', function () { NV.classList.remove('open'); MB.setAttribute('aria-expanded', 'false'); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && NV.classList.contains('open')) { NV.classList.remove('open'); MB.setAttribute('aria-expanded', 'false'); MB.focus(); } });
  }

  /* install tabs (real tablist: arrows move, one tab in the tab order) */
  var tabs = $$('[role=tab]');
  function pick(t, focus) {
    tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; $('#' + x.getAttribute('aria-controls')).hidden = !on; });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = tabs.length, rtl = R.dir === 'rtl', nx = null;
      if (k === 'ArrowRight') nx = rtl ? -1 : 1; else if (k === 'ArrowLeft') nx = rtl ? 1 : -1; else if (k === 'Home') { pick(tabs[0], true); e.preventDefault(); return; } else if (k === 'End') { pick(tabs[n - 1], true); e.preventDefault(); return; }
      if (nx != null) { pick(tabs[(i + nx + n) % n], true); e.preventDefault(); }
    });
  });
  // preselect Firefox when the visitor uses it
  if (/firefox\//i.test(navigator.userAgent) && tabs[1]) pick(tabs[1]);

  /* the wordmark tears itself into strips, then pastes itself back (CSS animation; skipped for reduced motion) */
  var N = 14, order = [], seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  for (var i = 0; i < N; i++) order.push(i);
  for (i = N - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
  $$('.wm').forEach(function (wm) {
    var word = wm.getAttribute('data-word'), face = wm.querySelector('.sizer'), box = wm.querySelector('.strips');
    if (!box) return; box.textContent = '';
    for (var k = 0; k < N; k++) {
      var l = k / N * 100, r = 100 - (k + 1) / N * 100, el = d.createElement('i'), s = d.createElement('span');
      s.className = 'face'; s.textContent = word;
      el.style.clipPath = 'inset(-30% ' + (k === N - 1 ? -20 : (r - 0.15).toFixed(2)) + '% -30% ' + (k === 0 ? -20 : (l - 0.15).toFixed(2)) + '%)';
      el.style.setProperty('--d', (order[k] * 0.075).toFixed(3) + 's');
      el.style.setProperty('--dx', Math.round((rnd() - 0.5) * 120) + 'px');
      el.style.setProperty('--fy', Math.round(260 + rnd() * 260) + 'px');
      el.style.setProperty('--rot', Math.round((rnd() - 0.5) * 80) + 'deg');
      el.appendChild(s); box.appendChild(el);
    }
  });

  /* falling confetti behind the hero */
  var cf = $('.bits');
  if (cf && !RM) {
    var cols = ['var(--coral)', 'var(--sun)', 'var(--ultra)', 'var(--grass)', 'var(--pink)'];
    for (i = 0; i < 20; i++) {
      var c = d.createElement('i'); c.className = 'conf';
      c.style.cssText = '--x:' + Math.round(rnd() * 100) + '%;--s:' + Math.round(8 + rnd() * 12) + 'px;--c:' + cols[i % 5] + ';--t:' + (9 + rnd() * 9).toFixed(1) + 's;--d:-' + (rnd() * 14).toFixed(1) + 's;--dx:' + Math.round((rnd() - 0.5) * 160) + 'px;--r:' + Math.round(rnd() * 90) + 'deg';
      cf.appendChild(c);
    }
  }
})();
