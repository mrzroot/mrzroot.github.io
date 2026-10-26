/*
 * Gosast UI strings: English and Persian. Plain data plus two helpers, so the
 * unit tests can check that both languages stay in sync.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GosastStrings = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STRINGS = {
    en: {
      name: 'Gosast',
      toolbar: 'Gosast tools',
      canvasLabel: 'The page, ready to be torn. Use the arrow keys to move the tool, Enter to start or stop tearing, Escape to put everything back.',
      shred: 'Strips',
      shredTip: 'Tear tall paper strips (1)',
      confetti: 'Confetti',
      confettiTip: 'Tear small squares (2)',
      broom: 'Broom',
      broomTip: 'Sweep the pile around (3)',
      glue: 'Glue',
      glueTip: 'Glue pieces back where they belong (4)',
      shredAll: 'Shred all',
      shredAllTip: 'Shred the whole page, top to bottom (S)',
      rewind: 'Rewind',
      rewindTip: 'Every piece flies back home (R)',
      gentle: 'Gentle',
      gentleTip: 'Calm mode: pieces fade away softly, no falling or spinning (G)',
      sound: 'Sound',
      soundTip: 'Soft paper sounds, made on the fly (M)',
      language: 'فارسی',
      languageTip: 'Switch to Persian',
      exit: 'Put it back',
      exitTip: 'Close and show the real page again (Esc)',
      pieces: 'pieces torn: {n}',
      intact: 'the page is whole',
      pageIsSafe: 'Your real page is untouched underneath. Esc puts it back.',
      toolOn: 'on',
      toolOff: 'off',
      cannotRun: 'Gosast cannot run on this page',
      actionTitle: 'Tear this page (calm toy)'
    },
    fa: {
      name: 'گسست',
      toolbar: 'ابزارهای گسست',
      canvasLabel: 'صفحه آماده‌ی پاره شدن است. با کلیدهای جهت‌دار ابزار را حرکت بده، با Enter پاره کردن را شروع یا متوقف کن، و با Escape همه چیز را سر جایش برگردان.',
      shred: 'نوار',
      shredTip: 'نوارهای بلند کاغذی ببر (۱)',
      confetti: 'کاغذ‌پاره',
      confettiTip: 'مربع‌های ریز ببر (۲)',
      broom: 'جارو',
      broomTip: 'تلِ تکه‌ها را جارو کن (۳)',
      glue: 'چسب',
      glueTip: 'تکه‌ها را به جای خودشان بچسبان (۴)',
      shredAll: 'همه را خرد کن',
      shredAllTip: 'کل صفحه را از بالا تا پایین خرد کن (S)',
      rewind: 'برگردان',
      rewindTip: 'همه‌ی تکه‌ها به جای خود برمی‌گردند (R)',
      gentle: 'آرام',
      gentleTip: 'حالت آرام: تکه‌ها نرم محو می‌شوند، بدون افتادن و چرخیدن (G)',
      sound: 'صدا',
      soundTip: 'صدای ملایم کاغذ، همان لحظه ساخته می‌شود (M)',
      language: 'English',
      languageTip: 'تغییر به انگلیسی',
      exit: 'سر جایش بگذار',
      exitTip: 'ببند و صفحه‌ی واقعی را دوباره نشان بده (Esc)',
      pieces: 'تکه‌های پاره‌شده: {n}',
      intact: 'صفحه سالم است',
      pageIsSafe: 'صفحه‌ی واقعی زیر این لایه دست‌نخورده است. با Esc برمی‌گردد.',
      toolOn: 'روشن',
      toolOff: 'خاموش',
      cannotRun: 'گسست روی این صفحه کار نمی‌کند',
      actionTitle: 'این صفحه را پاره کن (اسباب‌بازی آرام)'
    }
  };

  /** Pick 'fa' for any Persian locale (fa, fa-IR, ...), otherwise 'en'. */
  function detectLang(locale) {
    return /^fa\b/i.test(String(locale || '')) ? 'fa' : 'en';
  }

  function dir(lang) { return lang === 'fa' ? 'rtl' : 'ltr'; }

  /** Look up a string and fill {placeholders}. Falls back to English, then to the key. */
  function t(lang, key, vars) {
    var s = (STRINGS[lang] && STRINGS[lang][key]);
    if (s == null) s = STRINGS.en[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  /** Format a number for the language (Persian digits for fa). */
  function num(lang, n) {
    return lang === 'fa' ? String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }) : String(n);
  }

  return { STRINGS: STRINGS, detectLang: detectLang, dir: dir, t: t, num: num };
});
