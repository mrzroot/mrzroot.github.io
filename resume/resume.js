(function () {
  'use strict';
  var d = document.documentElement;
  var PDF = { fa: '/resume/Mohammadreza-Zare-Resume-FA.pdf', en: '/resume/Mohammadreza-Zare-Resume-EN.pdf' };
  var TITLE = { fa: 'رزومه · محمدرضا زارع امرغانی', en: 'Resume · Mohammadreza Zare' };
  var langBtn = document.getElementById('lang-btn');
  var themeBtn = document.getElementById('theme-btn');
  var pdfBtn = document.getElementById('pdf-btn');
  function setLang(l, push) {
    d.setAttribute('data-lang', l); d.lang = l; d.dir = l === 'fa' ? 'rtl' : 'ltr';
    document.title = TITLE[l];
    langBtn.textContent = l === 'fa' ? 'EN' : 'فا';
    langBtn.setAttribute('aria-label', l === 'fa' ? 'Switch to English' : 'تغییر به فارسی');
    pdfBtn.href = PDF[l];
    document.querySelectorAll('[data-fa]').forEach(function (el) { el.textContent = el.getAttribute('data-' + l); });
    themeBtn.setAttribute('aria-label', l === 'fa' ? 'تغییر تم روشن/تاریک' : 'Toggle light/dark theme');
    if (push) {
      var u = new URL(location.href);
      if (l === 'fa') u.searchParams.delete('lang'); else u.searchParams.set('lang', l);
      history.replaceState(null, '', u);
    }
  }
  langBtn.addEventListener('click', function () { setLang(d.getAttribute('data-lang') === 'fa' ? 'en' : 'fa', true); });
  themeBtn.addEventListener('click', function () {
    var t = d.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    d.setAttribute('data-theme', t);
    try { localStorage.setItem('mrz-theme', t); } catch (e) { /* private mode */ }
  });
  document.getElementById('print-btn').addEventListener('click', function () { window.print(); });
  var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
  setLang(d.getAttribute('data-lang') || 'fa', false);
})();
