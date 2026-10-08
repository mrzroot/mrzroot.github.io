/* M-R-Z // mrzroot · v2 operator UI. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  window.__mrz = true;
  var USER = 'mrzroot';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T0 = Date.now();
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

  /* =====================================================================
     i18n
     ===================================================================== */
  var FA = {
    'skip': 'رفتن به محتوا',
    'nav.origins': 'خاستگاه', 'nav.arsenal': 'جعبه‌ابزار', 'nav.ops': 'عملیات', 'nav.hud': 'پایش زنده', 'nav.log': 'گزارش', 'nav.comms': 'ارتباط', 'nav.cta': 'تلگرام',
    'hero.status': 'آنلاین · آماده همکاری',
    'hero.base': 'مشهد، ایران',
    'hero.sr': 'M-R-Z، محمدرضا زارع: سازنده ابزارهای اتوماسیون پایتون و بک‌اند',
    'hero.name': 'محمدرضا زارع',
    'hero.role': 'سازنده <em>اتوماسیون</em> پایتون و <em>بک‌اند</em>.',
    'hero.lead': 'ابزارهای کوچک و دقیقی می‌سازم که کارهای تکراری را از دوش آدم‌ها برمی‌دارند: اسکریپت، سرویس، افزونه مرورگر و پایپ‌لاین CI. کد تمیز، راه‌اندازی ساده و انتشار متن‌باز.',
    'hero.cta1': 'گفتگو در تلگرام',
    'hero.cta2': 'دیدن عملیات‌ها',
    'spec.class': 'کلاس', 'spec.classV': 'سازنده', 'spec.core': 'هسته', 'spec.repos': 'مخزن عمومی', 'spec.since': 'آنلاین از',
    'hero.hint': 'دستور <kbd>help</kbd> را تایپ کنید و Enter بزنید. با <kbd>/</kbd> از هر جای صفحه به ترمینال بروید.',
    'origins.title': 'ساخته‌شده برای حذف بخش‌های خسته‌کننده.',
    'origins.p1': 'من محمدرضا زارع هستم؛ با نام رمز M-R-Z و شناسه mrzroot. توسعه‌دهنده پایتون ساکن مشهد.',
    'origins.p2': 'کار من جایی است که اتوماسیون و بک‌اند به هم می‌رسند: اسکریپت‌هایی که کارهای تکراری را حذف می‌کنند، سرویس‌ها و APIهای کوچک، و ابزارهای اطرافشان؛ افزونه‌های مرورگر، پایپ‌لاین‌های CI و این اواخر ابزارهایی برای مدیریت ایجنت‌های هوش مصنوعی برنامه‌نویسی.',
    'origins.p3': 'عمداً همه‌چیز را ساده نگه می‌دارم: کد کمتر، نام‌گذاری روشن و راه‌اندازی در چند دقیقه. وقتی ابزاری به کار خودم بیاید، منتشرش می‌کنم تا به کار دیگران هم بیاید.',
    'origins.d1': 'حل مسئله واقعی', 'origins.d1d': 'ابزار کاربردی برای دردسرهای روزمره، نه نمایشی.',
    'origins.d2': 'کمتر، بهتر است', 'origins.d2d': 'کد تمیز، خوانا و ساده بهتر از کد زیرکانه است.',
    'origins.d3': 'یادگیری در جمع', 'origins.d3d': 'یادگیری مداوم و اشتراک آن با جامعه.',
    'dossier.title': 'پرونده اپراتور',
    'dossier.class': 'کلاس', 'dossier.classV': 'سازنده اتوماسیون و بک‌اند',
    'dossier.primary': 'زبان اصلی',
    'dossier.base': 'پایگاه', 'dossier.baseV': 'مشهد، ایران · ۳۶٫۳° شمالی ۵۹٫۶° شرقی',
    'dossier.since': 'روی شبکه', 'dossier.sinceV': 'گیت‌هاب از دی ۱۴۰۲',
    'dossier.learning': 'در حال آموزش', 'dossier.learningV': 'ابزارهای بک‌اند و داده',
    'dossier.channel': 'کانال',
    'arsenal.title': 'تجهیزات.',
    'arsenal.sub': 'پایتون در هسته، همراه با ماژول‌های وب و DevOps که یک ایده را از اسکریپت تا محصول نهایی می‌رسانند.',
    'arsenal.core': 'هسته',
    'arsenal.coreD': 'اسکریپت‌های اتوماسیون، سرویس‌های بک‌اند و ابزارسازی. زبانی که همه‌چیز به آن وصل می‌شود.',
    'arsenal.m1s': 'زبان‌ها', 'arsenal.m1': 'زبان‌ها', 'arsenal.m2': 'بک‌اند و API', 'arsenal.m3': 'داده', 'arsenal.m4': 'فرانت‌اند و مرورگر', 'arsenal.m5': 'DevOps و گردش کار', 'arsenal.m6': 'ابزارهای ایجنت هوش مصنوعی',
    'ops.title': 'عملیات میدانی.',
    'ops.sub': 'مخزن‌های عمومی منتخب. داده‌ها (ستاره، فورک، آخرین push) زنده از گیت‌هاب خوانده می‌شوند.',
    'ops.all': 'همه مخزن‌ها',
    'ops.f.all': 'همه', 'ops.f.tools': 'ابزار', 'ops.f.ext': 'افزونه', 'ops.f.ops': 'DevOps', 'ops.f.intel': 'دانش',
    'ops.t.toolkit': 'ابزار توسعه‌دهنده', 'ops.t.list': 'فهرست گلچین', 'ops.t.ext': 'افزونه مرورگر', 'ops.t.agent': 'ایجنت محلی',
    'ops.s.active': 'فعال', 'ops.s.new': 'تازه', 'ops.s.ref': 'مرجع', 'ops.s.fork': 'فورک',
    'ops.agentforge': 'مجموعه‌ابزاری برای ایجنت‌های هوش مصنوعی برنامه‌نویسی: یک مجموعه قانون را بین Cursor، Claude Code، Windsurf، Copilot، Roo و Aider همگام نگه می‌دارد، کانتکست کد را با تحلیل AST فشرده می‌کند و قوانین را از نظر مشکلات امنیتی و تعارض بررسی می‌کند.',
    'ops.h1': 'همگام‌سازی قوانین', 'ops.h1d': 'یک منبع قوانین برای ۷ ایجنت',
    'ops.h2': 'فشرده‌ساز AST', 'ops.h2d': 'کانتکست کد کوچک‌تر برای LLMها',
    'ops.h3': 'لینتر قوانین', 'ops.h3d': 'شناسایی مشکلات امنیتی و تعارض‌ها',
    'ops.h4': 'مهارت‌های ایجنت', 'ops.h4d': 'بیش از ۵۰ مهارت آماده',
    'ops.awesome': 'مرجعی گلچین‌شده برای توسعه‌دهندگان ایرانی: ابزارها و DNSهای رفع تحریم، APIهای عمومی رایگان ایرانی، فونت‌های فارسی، پکیج‌های پایتون و بک‌اند، و منابع هوش مصنوعی و NLP.',
    'ops.uvd': 'افزونه Manifest V3 برای کروم و اج که استریم‌های ویدیویی صفحه (HLS/M3U8 و MP4) را شناسایی می‌کند و امکان ذخیره آن‌ها را می‌دهد؛ کاملاً سمت کاربر.',
    'ops.smash': 'افزونه‌ای اورجینال و مبتنی بر فیزیک برای کروم، اج و فایرفاکس: با یک آدمک جت‌پک روی هر صفحه وب پرواز کنید و متن و تصویرهایش را خرد کنید.',
    'ops.jenkins': 'مجموعه‌ای جمع‌وجور از پایپ‌لاین‌های declarative جنکینز به زبان Groovy، با مراحل build و نسخه‌ای با SCM polling. نقطه شروعی تمیز برای pipeline-as-code.',
    'ops.printbridge': 'ایجنت چاپ محلی و بی‌صدا که به اپلیکیشن‌های وب اجازه می‌دهد PDF و برچسب حرارتی را بدون پنجره چاپ مرورگر مستقیم به چاپگر بفرستند. فورک‌شده از <a href="https://github.com/AnouarSbia/printbridge" target="_blank" rel="noopener">AnouarSbia/printbridge</a>؛ اعتبار کامل با نویسنده اصلی است.',
    'ops.empty': 'عملیاتی در این دسته نیست.',
    'hud.title': 'داده‌های زنده.',
    'hud.sub': 'داده واقعی از API عمومی گیت‌هاب در هر بازدید (با ۱۰ دقیقه کش)، به‌علاوه ساعت محلی پایگاه.',
    'hud.connecting': 'در حال اتصال به api.github.com…',
    'hud.clock': 'ساعت پایگاه', 'hud.loc': 'موقعیت', 'hud.uptime': 'مدت حضور',
    'hud.radar': 'رادار عملیات', 'hud.repo': 'آمار مخزن‌ها',
    'hud.repos': 'مخزن عمومی', 'hud.stars': 'مجموع ستاره‌ها', 'hud.langs': 'زبان‌ها', 'hud.followers': 'دنبال‌کننده',
    'hud.lastpush': 'آخرین push', 'hud.mix': 'ترکیب زبان‌ها', 'hud.mixNote': 'بر اساس مخزن · عمومی، غیرفورک',
    'hud.signal': 'سیگنال فعالیت', 'hud.signalNote': 'رویدادهای عمومی · ۳۰ روز اخیر', 'hud.today': 'امروز',
    'hud.feed': 'جریان رویدادها',
    'log.title': 'گزارش مأموریت و پروتکل.',
    'log.sub': 'خط زمانی برگرفته مستقیم از تاریخ ساخت مخزن‌ها، و پروتکلی که در هر کار اجرا می‌کنم.',
    'log.e1': 'پیوستن به گیت‌هاب', 'log.e1d': 'اولین مخزن: نمونه پایپ‌لاین‌های جنکینز.',
    'log.e2': 'پروفایل و پایگاه دانش', 'log.e2d': 'README پروفایل منتشر شد؛ Awesome Persian Developer Resources راه‌اندازی شد؛ PrintBridge فورک شد.',
    'log.e3': 'استقرار ابزارها', 'log.e3d': 'Universal Video Downloader و AgentForge منتشر شدند.',
    'log.e4': 'Page Smash و همین سایت', 'log.e4d': 'یک افزونه فیزیکی مرورگر، و نسخه ۲ سایت mrzroot.github.io.',
    'log.next': 'بعدی', 'log.e5': 'در حال آموزش', 'log.e5d': 'تعمیق در ابزارهای بک‌اند و داده.',
    'log.protocol': 'پروتکل عملیاتی',
    'log.p1': 'شناسایی', 'log.p1d': 'شناخت مسئله واقعی و کوچک‌ترین نتیجه مفید.',
    'log.p2': 'ساخت کوچک', 'log.p2d': 'تحویل زودهنگام نسخه‌ای کارا با کد تمیز و خوانا.',
    'log.p3': 'مستندسازی', 'log.p3d': 'README و مراحل نصب روشن تا هرکسی بتواند اجرایش کند.',
    'log.p4': 'بهبود مداوم', 'log.p4d': 'اصلاح بر اساس بازخورد و نگه‌داشتن کد قابل نگهداری.',
    'comms.title': 'یک کانال باز کنید.',
    'comms.sub': 'پروژه، ایده اتوماسیون یا سؤالی درباره یکی از مخزن‌هایم دارید؟ سریع‌ترین راه ارتباط تلگرام است. برای کد، ایشو و پول‌ریکوئست از گیت‌هاب استفاده کنید.',
    'comms.cta': 'پیام به ‎@mrzroot در تلگرام',
    'comms.primary': 'اصلی',
    'footer.built': 'ساخته‌شده با HTML، CSS و جاوااسکریپت خالص.',
    'footer.source': 'سورس'
  };
  var DYN = {
    en: { live: 'Live · api.github.com', cached: 'Cached · api.github.com', offline: 'Offline · showing snapshot values', updated: 'pushed ', title: document.title, toggle: 'تغییر زبان به فارسی', menuOpen: 'Open menu', menuClose: 'Close menu', noEvents: 'no public events in range' },
    fa: { live: 'زنده · api.github.com', cached: 'کش‌شده · api.github.com', offline: 'آفلاین · نمایش مقادیر ذخیره‌شده', updated: 'push ', title: 'M-R-Z // mrzroot · سازنده اتوماسیون پایتون و بک‌اند', toggle: 'Switch language to English', menuOpen: 'باز کردن منو', menuClose: 'بستن منو', noEvents: 'رویداد عمومی در این بازه نیست' }
  };

  var i18nNodes = $$('[data-i18n],[data-i18n-html]');
  var EN = {};
  i18nNodes.forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (k) EN[k] = el.textContent; else { k = el.getAttribute('data-i18n-html'); EN[k] = el.innerHTML; }
  });

  var lang = 'en';
  var faNum = new Intl.NumberFormat('fa-IR', { useGrouping: false });
  var fmtNum = function (n) { return lang === 'fa' ? faNum.format(Number(n)) : String(n); };
  var D = function (k) { return DYN[lang][k]; };

  function applyLang(next, persist) {
    lang = next === 'fa' ? 'fa' : 'en';
    root.lang = lang; root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    i18nNodes.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) { el.textContent = (lang === 'fa' && FA[k]) || EN[k]; return; }
      k = el.getAttribute('data-i18n-html');
      el.innerHTML = (lang === 'fa' && FA[k]) || EN[k];
    });
    document.title = D('title');
    var t = $('#lang-toggle'); t.setAttribute('aria-label', D('toggle'));
    setMenu(menuBtn.getAttribute('aria-expanded') === 'true');
    $$('.num').forEach(function (el) {
      if (!el.hasAttribute('data-raw')) el.setAttribute('data-raw', el.textContent.replace(/[^\d]/g, ''));
      el.textContent = fmtNum(el.getAttribute('data-raw'));
    });
    render();
    tick();
    if (persist) store.set('mrz-lang', lang);
  }

  /* =====================================================================
     Header, menu, scrollspy, rail
     ===================================================================== */
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = $('#menu-toggle');
  var navLinks = $('#nav-links');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? D('menuClose') : D('menuOpen'));
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 960 && navLinks.classList.contains('open')) setMenu(false); });

  var sections = ['root', 'origins', 'arsenal', 'operations', 'hud', 'log', 'comms'];
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        $$('.nav-links a').forEach(function (a) { var on = a.getAttribute('href') === '#' + id; a.classList.toggle('active', on); if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        $$('.rail a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-rail') === id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* =====================================================================
     Reveal + spotlight
     ===================================================================== */
  var reveals = $$('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    $$('.arsenal-grid, .ops-grid, .hud-grid, .hero-copy').forEach(function (g) {
      $$(':scope > .reveal', g).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i * 60, 360) + 'ms'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    $$('.op').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }
  function glitchOnce() {
    if (reduce) return;
    var g = $('.codename'); if (!g) return;
    g.classList.remove('run'); void g.offsetWidth; g.classList.add('run');
  }

  /* =====================================================================
     Operations filter
     ===================================================================== */
  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('.filter').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var shown = 0;
      $$('.op').forEach(function (op) {
        var on = f === 'all' || op.getAttribute('data-cat') === f;
        op.hidden = !on; if (on) { shown++; op.classList.add('in'); }
      });
      $('#ops-empty').hidden = shown > 0;
    });
  });

  /* =====================================================================
     Clock + uptime
     ===================================================================== */
  var TZ = 'Asia/Tehran';
  var fmtLong, fmtShort;
  try {
    fmtLong = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    fmtShort = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) { fmtLong = fmtShort = null; }
  function fmtDate(d) {
    try {
      return lang === 'fa'
        ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { timeZone: TZ, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(d)
        : new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' }).format(d);
    } catch (e) { return d.toDateString(); }
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function uptimeStr() { var s = Math.floor((Date.now() - T0) / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
  function tick() {
    var now = new Date();
    if (fmtLong) {
      $$('[data-clock="long"]').forEach(function (el) { el.textContent = fmtLong.format(now); });
      $$('[data-clock="short"]').forEach(function (el) { el.textContent = fmtShort.format(now); });
    }
    $$('[data-clock="date"]').forEach(function (el) { el.textContent = fmtDate(now); });
    var u = $('#uptime'); if (u) u.textContent = uptimeStr();
  }
  setInterval(function () { if (!document.hidden) tick(); }, 1000);

  /* =====================================================================
     GitHub data (cached, graceful fallback)
     ===================================================================== */
  var SNAPSHOT = {
    user: { public_repos: 16, followers: 0 },
    repos: [
      { name: 'agentforge', language: 'TypeScript', stargazers_count: 3, forks_count: 0, fork: false, pushed_at: '2026-08-16T20:35:33Z' },
      { name: 'awesome-persian-developer-resources', language: null, stargazers_count: 2, forks_count: 0, fork: false, pushed_at: '2026-08-16T06:34:51Z' },
      { name: 'universal-video-downloader', language: 'JavaScript', stargazers_count: 0, forks_count: 0, fork: false, pushed_at: '2026-08-16T06:35:13Z' },
      { name: 'page-smash', language: 'JavaScript', stargazers_count: 0, forks_count: 0, fork: false, pushed_at: '2026-10-04T08:57:16Z' },
      { name: 'jenkins', language: null, stargazers_count: 2, forks_count: 0, fork: false, pushed_at: '2026-08-09T05:25:34Z' },
      { name: 'printbridge', language: 'Python', stargazers_count: 2, forks_count: 0, fork: true, pushed_at: '2026-08-09T06:08:03Z' }
    ],
    events: []
  };
  var LANG_COLORS = { Python: '#3572a5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Groovy: '#4298b8', PHP: '#4f5d95', HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', Other: '#6a788d' };
  var data = { user: SNAPSHOT.user, repos: SNAPSHOT.repos, events: SNAPSHOT.events, state: 'offline', latency: null, full: false };
  var CACHE_KEY = 'mrz-gh-v2', TTL = 10 * 60 * 1000;

  function slim(repos) { return repos.map(function (r) { return { name: r.name, language: r.language, stargazers_count: r.stargazers_count, forks_count: r.forks_count, fork: r.fork, private: r.private, pushed_at: r.pushed_at }; }); }
  function slimEv(evs) { return evs.map(function (e) { return { type: e.type, repo: e.repo && e.repo.name, created_at: e.created_at, action: e.payload && e.payload.action, ref_type: e.payload && e.payload.ref_type }; }); }

  function getJSON(url) {
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' } }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
  }
  function loadData() {
    var cached = null;
    try { cached = JSON.parse(store.get(CACHE_KEY) || 'null'); } catch (e) { cached = null; }
    if (cached && Date.now() - cached.t < TTL) {
      data.user = cached.user; data.repos = cached.repos; data.events = cached.events; data.state = 'cached'; data.full = true;
      render(); return;
    }
    if (!window.fetch) { render(); return; }
    var api = 'https://api.github.com';
    var t1 = performance.now();
    Promise.all([
      getJSON(api + '/users/' + USER),
      getJSON(api + '/users/' + USER + '/repos?per_page=100&type=owner&sort=pushed'),
      getJSON(api + '/users/' + USER + '/events/public?per_page=100').catch(function () { return []; })
    ]).then(function (res) {
      data.latency = Math.round(performance.now() - t1);
      data.user = { public_repos: res[0].public_repos, followers: res[0].followers };
      data.repos = slim(res[1].filter(function (r) { return !r.private; }));
      data.events = slimEv(res[2] || []);
      data.state = 'live'; data.full = true;
      store.set(CACHE_KEY, JSON.stringify({ t: Date.now(), user: data.user, repos: data.repos, events: data.events }));
      render();
    }).catch(function () {
      if (cached) { data.user = cached.user; data.repos = cached.repos; data.events = cached.events; data.state = 'cached'; data.full = true; }
      render();
    });
  }

  function relTime(iso, short) {
    var d = new Date(iso); if (isNaN(d)) return '';
    var diff = (d.getTime() - Date.now()) / 1000;
    var units = [['year', 31536000, 'y'], ['month', 2592000, 'mo'], ['week', 604800, 'w'], ['day', 86400, 'd'], ['hour', 3600, 'h'], ['minute', 60, 'm']];
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(diff) >= units[i][1] || i === units.length - 1) {
        var v = Math.round(diff / units[i][1]);
        if (short) return Math.abs(v) + units[i][2] + ' ago';
        try { return new Intl.RelativeTimeFormat(lang === 'fa' ? 'fa' : 'en', { numeric: 'auto' }).format(v, units[i][0]); } catch (e) { return d.toISOString().slice(0, 10); }
      }
    }
    return '';
  }
  function repoMap() { var m = {}; data.repos.forEach(function (r) { m[r.name] = r; }); return m; }
  function stats() {
    var stars = 0, langs = {}, last = null;
    data.repos.forEach(function (r) {
      stars += r.stargazers_count || 0;
      if (!r.fork) { var l = r.language || 'Other'; langs[l] = (langs[l] || 0) + 1; }
      if (!last || new Date(r.pushed_at) > new Date(last.pushed_at)) last = r;
    });
    var langList = Object.keys(langs).map(function (k) { return [k, langs[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    return { stars: stars, langs: langList, last: last, langCount: langList.filter(function (l) { return l[0] !== 'Other'; }).length };
  }
  function setNum(el, n) { if (!el || n === undefined || n === null) return; el.setAttribute('data-raw', n); el.textContent = fmtNum(n); }

  function render() {
    var m = repoMap();
    // operations telemetry
    $$('[data-repo]').forEach(function (card) {
      var r = m[card.getAttribute('data-repo')]; if (!r) return;
      setNum($('[data-f="stars"]', card), r.stargazers_count);
      setNum($('[data-f="forks"]', card), r.forks_count);
      if (r.language) {
        $('[data-f="language"]', card).textContent = r.language;
        var dot = $('.lang i', card); if (dot && LANG_COLORS[r.language]) dot.style.setProperty('--c', LANG_COLORS[r.language]);
      }
      var u = relTime(r.pushed_at); if (u) $('[data-f="updated"]', card).textContent = D('updated') + u;
    });
    if (!data.full) { setStatus(); return; }
    var s = stats();
    setNum($('[data-stat="repos"]'), data.user.public_repos);
    setNum($('[data-hud="repos"]'), data.user.public_repos);
    setNum($('[data-hud="followers"]'), data.user.followers);
    setNum($('[data-hud="stars"]'), s.stars);
    setNum($('[data-hud="langs"]'), s.langCount);
    if (s.last) { $('[data-hud="lastpush"]').textContent = s.last.name; $('[data-hud="lastpushT"]').textContent = relTime(s.last.pushed_at); }
    // language mix
    var total = s.langs.reduce(function (a, l) { return a + l[1]; }, 0) || 1;
    $('#langbar').innerHTML = s.langs.map(function (l) { return '<span style="flex-grow:' + l[1] + ';--c:' + (LANG_COLORS[l[0]] || '#8b949e') + '" title="' + esc(l[0]) + '"></span>'; }).join('');
    $('#langbar').setAttribute('aria-label', 'Language mix: ' + s.langs.map(function (l) { return l[0] + ' ' + Math.round(l[1] / total * 100) + '%'; }).join(', '));
    $('#langlist').innerHTML = s.langs.slice(0, 6).map(function (l) { return '<li><i style="--c:' + (LANG_COLORS[l[0]] || '#8b949e') + '"></i>' + esc(l[0] === 'Other' ? 'Docs/Other' : l[0]) + '<b>' + Math.round(l[1] / total * 100) + '%</b></li>'; }).join('');
    // activity spark
    var days = new Array(30).fill(0);
    data.events.forEach(function (e) { var d = Math.floor((Date.now() - new Date(e.created_at).getTime()) / 86400000); if (d >= 0 && d < 30) days[29 - d]++; });
    var max = Math.max.apply(null, days) || 1;
    $('#spark').innerHTML = days.map(function (v, i) { return '<span class="' + (v ? '' : 'zero') + '" style="height:' + (v ? Math.max(8, Math.round(v / max * 100)) : 2) + '%" title="' + v + ' events, ' + (29 - i) + 'd ago"></span>'; }).join('');
    // feed
    var feed = $('#feed');
    var evs = data.events.slice(0, 6);
    feed.innerHTML = evs.length ? evs.map(function (e) {
      var map = { PushEvent: ['push', ''], PullRequestEvent: ['pr ' + (e.action || ''), 'pr'], CreateEvent: ['create ' + (e.ref_type || ''), 'cr'], WatchEvent: ['star', 'st'], ForkEvent: ['fork', 'st'], IssuesEvent: ['issue ' + (e.action || ''), 'pr'], ReleaseEvent: ['release', 'cr'], PublicEvent: ['publish', 'cr'], DeleteEvent: ['delete ' + (e.ref_type || ''), 'st'] };
      var t = map[e.type] || [String(e.type || '').replace('Event', '').toLowerCase(), ''];
      return '<li><span class="ev ' + t[1] + '">' + esc(t[0].trim()) + '</span><span class="rp">' + esc((e.repo || '').replace(USER + '/', '')) + '</span><span class="tm">' + esc(relTime(e.created_at, true)) + '</span></li>';
    }).join('') : '<li class="feed-empty">' + esc(D('noEvents')) + '</li>';
    setStatus();
  }
  function setStatus() {
    var led = $('#hud-led'), txt = $('#hud-src-text');
    if (!led || !txt) return;
    if (data.state === 'live' || data.state === 'cached') {
      led.classList.remove('warn');
      txt.textContent = D(data.state) + (data.latency ? ' · ' + data.latency + 'ms' : '');
      txt.removeAttribute('data-i18n');
    } else if (data.full === false && apiTried) {
      led.classList.add('warn'); txt.textContent = D('offline');
    }
  }
  var apiTried = false;

  /* =====================================================================
     Terminal
     ===================================================================== */
  var out = $('#term-out'), input = $('#term-input'), form = $('#term-form');
  var hist = [], hIdx = -1;
  var PROJECTS = [
    ['agentforge', 'AgentForge', 'AI coding-agent toolkit: rule sync, AST compression, rule linter'],
    ['awesome-persian-developer-resources', 'Awesome Persian Developer Resources', 'curated hub for Iranian developers'],
    ['universal-video-downloader', 'Universal Video Downloader', 'MV3 extension: detect & save HLS/MP4 streams'],
    ['page-smash', 'Page Smash', 'physics extension: smash any webpage'],
    ['jenkins', 'Jenkins Pipeline Examples', 'declarative Groovy pipelines'],
    ['printbridge', 'PrintBridge', 'silent local printing agent (fork of AnouarSbia/printbridge)']
  ];
  var CHAPTERS = { root: 'root', origins: 'origins', about: 'origins', arsenal: 'arsenal', stack: 'arsenal', operations: 'operations', ops: 'operations', projects: 'operations', hud: 'hud', log: 'log', comms: 'comms', contact: 'comms' };
  var link = function (href, label) { return '<a href="' + href + '" target="_blank" rel="noopener">' + esc(label || href.replace(/^https?:\/\//, '')) + '</a>'; };
  function print(html, cls) { var p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; out.appendChild(p); out.scrollTop = out.scrollHeight; return p; }
  function printCmd(text) { var p = document.createElement('p'); p.className = 'cmd'; p.textContent = text; out.appendChild(p); }
  function row(k, v, w) { var key = k; while (key.length < (w || 12)) key += ' '; return '<span class="k">' + esc(key) + '</span>' + v; }
  function openUrl(url) { window.open(url, '_blank', 'noopener'); }

  var COMMANDS = {
    help: function () {
      print('<span class="ok">available commands</span>');
      [['whoami', 'identity & role'], ['about', 'short bio'], ['projects', 'list operations with live stats (alias: ops)'], ['open <n>', 'open project n on GitHub'], ['stack', 'loadout / tech stack'], ['hud', 'live GitHub telemetry'], ['contact', 'comms channels'], ['telegram', 'open t.me/mrzroot (alias: tg)'], ['github', 'open github.com/mrzroot'], ['linkedin', 'open linkedin.com/in/mrzroot'], ['ls', 'list chapters'], ['goto <ch>', 'jump to a chapter (alias: cd)'], ['date', 'time at base (Asia/Tehran)'], ['uptime', 'session uptime'], ['lang <en|fa>', 'switch site language'], ['history', 'command history'], ['boot', 'replay boot sequence'], ['clear', 'clear the screen (Ctrl+L)']]
        .forEach(function (c) { print('  ' + row(c[0], esc(c[1]), 14)); });
      print('tip: Tab autocompletes, ↑/↓ recalls history.', 'dim');
    },
    whoami: function () {
      print(row('codename', '<span class="ok">M-R-Z</span>'));
      print(row('handle', '@mrzroot'));
      print(row('name', 'Mohammadreza Zare · محمدرضا زارع'));
      print(row('class', 'Python automation &amp; backend builder'));
      print(row('base', 'Mashhad, IR · Asia/Tehran (UTC+03:30)'));
      print(row('status', '<span class="ok">online</span> · open to collaboration'));
    },
    about: function () {
      print('Python developer from Mashhad, Iran. I build automation scripts, small');
      print('backend services and the tooling around them: browser extensions, CI');
      print('pipelines and tools for AI coding agents. Clean code, simple setup,');
      print('published as open source when it can help someone else.');
    },
    projects: function () {
      var m = repoMap();
      print('<span class="ok">field operations</span> <span class="dim">(' + esc(data.state) + ' telemetry)</span>');
      PROJECTS.forEach(function (p, i) {
        var r = m[p[0]] || {};
        var meta = '★' + (r.stargazers_count != null ? r.stargazers_count : '-') + '  ' + (r.language || 'docs') + (r.fork ? '  <span class="hot">fork</span>' : '');
        print('  <span class="amb">[' + (i + 1) + ']</span> ' + link('https://github.com/mrzroot/' + p[0], p[1]) + '  <span class="dim">' + meta + '</span>');
        print('      <span class="dim">' + esc(p[2]) + '</span>');
      });
      print('tip: <span class="k">open 1</span> opens AgentForge, <span class="k">goto ops</span> scrolls to the cards.', 'dim');
    },
    open: function (args) {
      var a = (args[0] || '').toLowerCase();
      var idx = parseInt(a, 10);
      var p = !isNaN(idx) ? PROJECTS[idx - 1] : PROJECTS.filter(function (x) { return x[0].indexOf(a) === 0 || x[1].toLowerCase().indexOf(a) === 0; })[0];
      if (!a || !p) { print('usage: open <1-' + PROJECTS.length + '|name>', 'amb'); return; }
      var url = 'https://github.com/mrzroot/' + p[0];
      print('opening ' + link(url) + ' …', 'ok'); openUrl(url);
    },
    stack: function () {
      [['core', 'Python · Django · Flask · FastAPI'], ['languages', 'Python · TypeScript · JavaScript · PHP · Groovy · SQL'], ['backend', 'Laravel · Node.js · REST · WebSocket'], ['data', 'MySQL · SQLite · PostgreSQL · Redis'], ['web', 'React · Vue · HTML/CSS · Chrome extensions (MV3)'], ['ops', 'Git · GitHub · Jenkins · Docker · CI/CD'], ['ai', 'Cursor · Claude Code · Copilot · agent rules']]
        .forEach(function (r) { print(row(r[0], esc(r[1]))); });
    },
    hud: function () {
      var s = stats();
      print('<span class="ok">telemetry</span> <span class="dim">· source: api.github.com (' + esc(data.state) + ')</span>');
      print(row('repos', String(data.user.public_repos) + ' public'));
      print(row('stars', String(s.stars)));
      print(row('followers', String(data.user.followers)));
      if (s.last) print(row('last push', esc(s.last.name) + ' <span class="dim">' + esc(relTime(s.last.pushed_at, true)) + '</span>'));
      print(row('languages', esc(s.langs.filter(function (l) { return l[0] !== 'Other'; }).map(function (l) { return l[0]; }).join(' · ') || '-')));
      print(row('events/30d', String(data.events.filter(function (e) { return Date.now() - new Date(e.created_at) < 30 * 86400000; }).length)));
    },
    contact: function () {
      print('<span class="ok">comms channels</span>');
      print(row('telegram', link('https://t.me/mrzroot') + '  <span class="ok">← primary</span>'));
      print(row('github', link('https://github.com/mrzroot')));
      print(row('linkedin', link('https://linkedin.com/in/mrzroot')));
      print('no email: telegram is the fastest way in. type <span class="k">telegram</span> to open a channel.', 'dim');
    },
    telegram: function () { print('opening secure channel → ' + link('https://t.me/mrzroot'), 'ok'); openUrl('https://t.me/mrzroot'); },
    github: function () { print('opening → ' + link('https://github.com/mrzroot'), 'ok'); openUrl('https://github.com/mrzroot'); },
    linkedin: function () { print('opening → ' + link('https://linkedin.com/in/mrzroot'), 'ok'); openUrl('https://linkedin.com/in/mrzroot'); },
    ls: function () { print('<span class="k">origins/  arsenal/  operations/  hud/  log/  comms/</span>'); print('use <span class="k">goto &lt;chapter&gt;</span> to jump.', 'dim'); },
    goto: function (args) {
      var id = CHAPTERS[(args[0] || '').toLowerCase().replace(/\/$/, '')];
      if (!id) { print('usage: goto <origins|arsenal|operations|hud|log|comms>', 'amb'); return; }
      print('→ jumping to ' + esc(id), 'ok');
      var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    },
    date: function () {
      var n = new Date();
      print(row('base', (fmtLong ? fmtLong.format(n) : n.toTimeString()) + ' · ' + esc(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, dateStyle: 'full' }).format(n))));
      print(row('tz', 'Asia/Tehran · UTC+03:30'));
    },
    uptime: function () { print(row('session', uptimeStr())); },
    lang: function (args) {
      var l = (args[0] || '').toLowerCase();
      if (l !== 'en' && l !== 'fa') { print('usage: lang <en|fa>   current: ' + lang, 'amb'); return; }
      applyLang(l, true); print('locale set → ' + (l === 'fa' ? 'fa_IR (RTL)' : 'en_US'), 'ok');
    },
    history: function () { if (!hist.length) { print('(empty)', 'dim'); return; } hist.slice().reverse().forEach(function (h, i) { print('  ' + (i + 1) + '  ' + esc(h)); }); },
    boot: function () { print('rebooting…', 'amb'); setTimeout(function () { runBoot(true); }, 250); },
    clear: function () { out.innerHTML = ''; },
    echo: function (args) { print(esc(args.join(' '))); },
    sudo: function () { print('mrzroot is not in the sudoers file. This incident will be reported. ;)', 'hot'); },
    rm: function () { print('rm: permission denied: this system is read-only.', 'hot'); },
    exit: function () { print('there is no exit. try <span class="k">contact</span> instead.', 'amb'); },
    pwd: function () { print('/home/mrzroot'); },
    hello: function () { print('hey 👋  type <span class="k">contact</span> to reach me.'); }
  };
  var ALIAS = { ops: 'projects', tg: 'telegram', cd: 'goto', cls: 'clear', man: 'help', '?': 'help', hi: 'hello', time: 'date', status: 'hud', bio: 'about', email: 'contact', mail: 'contact' };
  var NAMES = Object.keys(COMMANDS).concat(Object.keys(ALIAS)).filter(function (n) { return ['hello', 'rm', 'exit', 'pwd', 'echo', 'sudo', 'cls', 'man', '?', 'hi', 'bio', 'email', 'mail'].indexOf(n) < 0; });

  function run(raw) {
    var line = String(raw || '').trim();
    printCmd(line);
    if (!line) return;
    hist.unshift(line); if (hist.length > 50) hist.pop(); hIdx = -1;
    var parts = line.split(/\s+/);
    var name = parts[0].toLowerCase();
    name = ALIAS[name] || name;
    var fn = COMMANDS[name];
    if (fn) fn(parts.slice(1));
    else print('command not found: ' + esc(parts[0]) + ". type <span class=\"k\">help</span> for the list.", 'hot');
    out.scrollTop = out.scrollHeight;
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; run(v); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { if (hist.length) { hIdx = Math.min(hIdx + 1, hist.length - 1); input.value = hist[hIdx]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hIdx = Math.max(hIdx - 1, -1); input.value = hIdx >= 0 ? hist[hIdx] : ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      var v = input.value.trim().toLowerCase(); if (!v || v.indexOf(' ') >= 0) return;
      var m = NAMES.filter(function (n) { return n.indexOf(v) === 0; });
      if (m.length === 1) { input.value = m[0] + ' '; e.preventDefault(); }
      else if (m.length > 1) { printCmd(input.value); print(m.join('   '), 'dim'); e.preventDefault(); }
    } else if (e.key === 'l' && e.ctrlKey) { out.innerHTML = ''; e.preventDefault(); }
  });
  $('#term').addEventListener('click', function (e) { if (!e.target.closest('a') && !window.getSelection().toString()) input.focus({ preventScroll: true }); });
  $$('.term-chips button').forEach(function (b) { b.addEventListener('click', function () { run(b.getAttribute('data-cmd')); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault(); $('#root').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); input.focus({ preventScroll: true });
  });

  function termIntro() {
    print('<span class="ok">M-R-Z shell</span> <span class="dim">v2.0 · linked to github.com/mrzroot</span>');
    print('type <span class="k">help</span> to list commands.', 'dim');
    var demo = 'whoami';
    if (reduce) { run(demo); return; }
    var i = 0;
    var typer = setInterval(function () {
      if (document.activeElement === input) { clearInterval(typer); input.value = ''; return; }
      input.value = demo.slice(0, ++i);
      if (i >= demo.length) { clearInterval(typer); setTimeout(function () { if (input.value === demo) { input.value = ''; run(demo); } }, 280); }
    }, 85);
  }

  /* =====================================================================
     Boot sequence
     ===================================================================== */
  var bootEl = $('#boot');
  var mainEl = $('#main');
  var booted = false;
  function runBoot(force) {
    if (!force && !root.classList.contains('booting')) { afterBoot(); return; }
    root.classList.add('booting');
    bootEl.classList.remove('done');
    bootEl.setAttribute('aria-hidden', 'false');
    if (mainEl) mainEl.setAttribute('inert', '');
    var log = $('#boot-log'), fill = $('#boot-fill'), pct = $('#boot-pct'), skip = $('#boot-skip');
    log.innerHTML = '';
    skip.tabIndex = 0; skip.focus({ preventScroll: true });
    var LINES = [
      ['0.000', 'mrz-bios v2.6 · POST', 'ok'],
      ['0.104', 'mounting /home/mrzroot', 'ok'],
      ['0.211', 'loading python3 runtime', 'ok'],
      ['0.318', 'starting automation daemons', 'ok'],
      ['0.426', 'linking github.com/mrzroot', 'ok'],
      ['0.533', 'locale en_US · fa_IR', 'ok'],
      ['0.641', 'tz Asia/Tehran · Mashhad, IR', 'ok'],
      ['0.748', 'handshake t.me/mrzroot', 'ready']
    ];
    var i = 0, done = false;
    function finish() {
      if (done) return; done = true;
      clearInterval(timer);
      document.removeEventListener('keydown', onKey);
      bootEl.removeEventListener('click', finish);
      fill.style.width = '100%'; pct.textContent = '100%';
      store.set('mrz-booted', '1');
      bootEl.classList.add('done');
      setTimeout(function () {
        root.classList.remove('booting');
        bootEl.setAttribute('aria-hidden', 'true');
        skip.tabIndex = -1;
        if (mainEl) mainEl.removeAttribute('inert');
        afterBoot();
      }, 480);
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } }
    document.addEventListener('keydown', onKey);
    bootEl.addEventListener('click', finish);
    var timer = setInterval(function () {
      if (i < LINES.length) {
        var l = LINES[i];
        var dots = ' '; for (var d = l[1].length; d < 34; d++) dots += '.';
        log.innerHTML += '<span class="dim">[ ' + l[0] + ' ]</span> <span class="hl">' + esc(l[1]) + '</span>' + dots + ' <span class="ok">' + l[2] + '</span>\n';
        i++;
        var p = Math.round(i / (LINES.length + 1) * 100);
        fill.style.width = p + '%'; pct.textContent = ('00' + p).slice(-3) + '%';
      } else if (i === LINES.length) {
        log.innerHTML += '\n<span class="hot">&gt;</span> <span class="hl">welcome back, operator.</span>';
        i++;
        fill.style.width = '100%'; pct.textContent = '100%';
      } else { finish(); }
    }, 170);
  }
  function afterBoot() {
    if (booted) { glitchOnce(); return; }
    booted = true;
    glitchOnce();
    termIntro();
  }

  /* =====================================================================
     Init
     ===================================================================== */
  var y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
  var initial = 'en';
  try { initial = new URLSearchParams(location.search).get('lang') || store.get('mrz-lang') || 'en'; } catch (e) { /* ignore */ }
  $('#lang-toggle').addEventListener('click', function () { applyLang(lang === 'fa' ? 'en' : 'fa', true); });
  applyLang(initial, false);
  tick();
  apiTried = false;
  loadData();
  setTimeout(function () { apiTried = true; setStatus(); }, 6000);
  runBoot(false);
})();
