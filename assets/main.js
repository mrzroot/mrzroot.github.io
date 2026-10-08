/* M-R-Z · mrzroot.github.io: vanilla JS, no dependencies. */
(function () {
  'use strict';

  var USER = 'mrzroot';
  var root = document.documentElement;

  /* ---------------- i18n ---------------- */
  var FA = {
    'skip': 'رفتن به محتوا',
    'nav.about': 'درباره من',
    'nav.stack': 'مهارت‌ها',
    'nav.projects': 'پروژه‌ها',
    'nav.services': 'خدمات',
    'nav.contact': 'تماس',
    'nav.cta': 'پیام بدهید',
    'hero.status': 'آماده همکاری',
    'hero.location': 'مشهد، ایران',
    'hero.name': 'محمدرضا زارع',
    'hero.role': 'ابزارهای <em>اتوماسیون پایتون</em> و <em>بک‌اند</em> می‌سازم که بی‌سروصدا کار را انجام می‌دهند.',
    'hero.lead': 'توسعه‌دهنده پشت \u2068M-R-Z / mrzroot\u2069. کد تمیز و خوانا می‌نویسم، ابزارهای کوچک و کاربردی می‌سازم و آن‌ها را متن‌باز منتشر می‌کنم؛ از افزونه‌های مرورگر تا پایپ‌لاین‌های CI و ابزارهای توسعه‌دهندگان.',
    'hero.cta1': 'گفتگو در تلگرام',
    'hero.cta2': 'دیدن پروژه‌ها',
    'hero.stat1': 'مخزن عمومی',
    'hero.stat2': 'زبان اصلی',
    'hero.stat3': 'عضو گیت‌هاب از',
    'about.eyebrow': 'درباره من',
    'about.title': 'نرم‌افزار کاربردی، نوشته‌شده برای خوانده‌شدن.',
    'about.p1': 'من محمدرضا زارع هستم، با نام آنلاین M-R-Z (mrzroot)، توسعه‌دهنده پایتون ساکن مشهد. بیشتر کارم جایی است که اتوماسیون و بک‌اند به هم می‌رسند: اسکریپت‌هایی که کارهای تکراری را حذف می‌کنند، سرویس‌ها و APIهای کوچک، و ابزارهایی که آن‌ها را سرپا نگه می‌دارند.',
    'about.p2': 'برایم سادگی مهم است: کد کمتر، نام‌گذاری روشن و ابزارهایی که نصب و فهمشان آسان باشد. وقتی چیزی که می‌سازم به درد دیگران هم بخورد، منتشرش می‌کنم؛ چه یک فهرست منابع برای توسعه‌دهندگان فارسی‌زبان باشد، چه یک افزونه مرورگر یا ابزاری برای ایجنت‌های هوش مصنوعی برنامه‌نویسی.',
    'about.k1': 'حل مسئله واقعی',
    'about.k1d': 'ساخت ابزارهای کاربردی برای دردسرهای روزمره.',
    'about.k2': 'کمتر، بهتر است',
    'about.k2d': 'کد تمیز، خوانا و ساده به‌جای پیچیدگی.',
    'about.k3': 'یادگیری در جمع',
    'about.k3d': 'یادگیری مداوم و اشتراک آن با جامعه.',
    'facts.role': 'نقش',
    'facts.roleV': 'توسعه‌دهنده پایتون',
    'facts.focus': 'تمرکز',
    'facts.focusV': 'اتوماسیون · بک‌اند · متن‌باز',
    'facts.base': 'محل زندگی',
    'facts.learning': 'در حال یادگیری',
    'facts.learningV': 'ابزارهای بک‌اند و داده',
    'facts.contact': 'بهترین راه تماس',
    'stack.eyebrow': 'مهارت‌ها و ابزارها',
    'stack.title': 'ابزارهایی که با آن‌ها کار می‌کنم.',
    'stack.sub': 'اول پایتون؛ همراه با ابزارهای وب و DevOps که یک ایده را از اسکریپت تا محصول نهایی می‌رسانند.',
    'stack.g1': 'زبان‌ها',
    'stack.g2': 'بک‌اند و API',
    'stack.g3': 'داده',
    'stack.g4': 'فرانت‌اند و مرورگر',
    'stack.g5': 'DevOps و گردش کار',
    'stack.g6': 'ابزارهای ایجنت هوش مصنوعی',
    'projects.eyebrow': 'پروژه‌های منتخب',
    'projects.title': 'کارهای متن‌باز.',
    'projects.sub': 'مخزن‌های عمومی منتخب. تعداد ستاره‌ها، فورک‌ها و تاریخ به‌روزرسانی مستقیم از گیت‌هاب خوانده می‌شود.',
    'projects.all': 'همه مخزن‌ها',
    'projects.badgeFlag': 'پروژه شاخص',
    'projects.badgeList': 'فهرست گلچین',
    'projects.badgeExt': 'افزونه مرورگر',
    'projects.badgeCI': 'CI/CD',
    'projects.badgeFork': 'فورک',
    'projects.agentforge': 'مجموعه‌ابزاری برای ایجنت‌های هوش مصنوعی برنامه‌نویسی: یک مجموعه قانون را بین Cursor، Claude Code، Windsurf، Copilot، Roo و Aider همگام نگه می‌دارد، کانتکست کد را با تحلیل AST فشرده می‌کند و قوانین را از نظر مشکلات امنیتی و تعارض بررسی می‌کند.',
    'projects.awesome': 'مرجعی گلچین‌شده برای توسعه‌دهندگان ایرانی: ابزارها و DNSهای رفع تحریم، APIهای عمومی رایگان ایرانی، فونت‌های فارسی، پکیج‌های پایتون و بک‌اند، و منابع هوش مصنوعی و NLP.',
    'projects.uvd': 'افزونه Manifest V3 برای کروم و اج که استریم‌های ویدیویی صفحه (HLS/M3U8 و MP4) را شناسایی می‌کند و امکان ذخیره آن‌ها را می‌دهد؛ کاملاً سمت کاربر.',
    'projects.smash': 'افزونه‌ای اورجینال و مبتنی بر فیزیک برای کروم، اج و فایرفاکس: با یک آدمک جت‌پک روی هر صفحه وب پرواز کنید و متن و تصویرهایش را خرد کنید.',
    'projects.jenkins': 'مجموعه‌ای جمع‌وجور از پایپ‌لاین‌های declarative جنکینز به زبان Groovy، با مراحل build و نسخه‌ای با SCM polling. نقطه شروعی تمیز برای pipeline-as-code.',
    'projects.printbridge': 'ایجنت چاپ محلی و بی‌صدا که به اپلیکیشن‌های وب اجازه می‌دهد PDF و برچسب حرارتی را بدون پنجره چاپ مرورگر مستقیم به چاپگر بفرستند. فورک‌شده از <a href="https://github.com/AnouarSbia/printbridge" target="_blank" rel="noopener">AnouarSbia/printbridge</a>؛ اعتبار کامل با نویسنده اصلی است.',
    'projects.h1': 'همگام‌سازی قوانین',
    'projects.h1d': 'یک منبع قوانین برای ۷ ایجنت برنامه‌نویسی',
    'projects.h2': 'فشرده‌ساز AST',
    'projects.h2d': 'کانتکست کد کوچک‌تر برای LLMها',
    'projects.h3': 'لینتر قوانین',
    'projects.h3d': 'شناسایی مشکلات امنیتی و تعارض‌ها',
    'projects.h4': 'مهارت‌های ایجنت',
    'projects.h4d': 'بیش از ۵۰ مهارت قابل استفاده مجدد',
    'services.eyebrow': 'چه کاری انجام می‌دهم',
    'services.title': 'کجا می‌توانم کمک کنم.',
    'services.sub': 'نوع کارهایی که انجام می‌دهم و از آن لذت می‌برم؛ هرکدام با پروژه‌هایی که در گیت‌هاب قابل مشاهده‌اند.',
    'services.s1': 'اتوماسیون با پایتون',
    'services.s1d': 'اسکریپت‌ها و ابزارهای کوچکی که کارهای تکراری را برعهده می‌گیرند: پردازش فایل و داده، کارهای زمان‌بندی‌شده و یکپارچه‌سازی سرویس‌ها.',
    'services.s2': 'بک‌اند و API',
    'services.s2d': 'سرویس‌ها و REST APIهای سبک با Django، Flask یا FastAPI، روی MySQL، SQLite یا PostgreSQL.',
    'services.s3': 'افزونه‌های مرورگر',
    'services.s3d': 'افزونه‌های Manifest V3 برای کروم، اج و فایرفاکس؛ از ابزارهای رسانه تا ابزارهای تعاملی و سرگرم‌کننده.',
    'services.s4': 'CI/CD و ابزارهای توسعه',
    'services.s4d': 'پایپ‌لاین‌های جنکینز، گردش کار Git و ابزارهای خط فرمان، از جمله ابزار برای ایجنت‌های هوش مصنوعی، تا کد با اطمینان منتشر شود.',
    'process.p1': 'درک مسئله',
    'process.p1d': 'شناخت مسئله واقعی و کوچک‌ترین نتیجه مفید.',
    'process.p2': 'ساخت کوچک',
    'process.p2d': 'تحویل زودهنگام نسخه‌ای کارا با کد تمیز و خوانا.',
    'process.p3': 'مستندسازی',
    'process.p3d': 'README و مراحل نصب روشن، تا هرکسی بتواند اجرایش کند.',
    'process.p4': 'بهبود مداوم',
    'process.p4d': 'اصلاح بر اساس بازخورد و نگه‌داشتن کد قابل نگهداری.',
    'contact.eyebrow': 'تماس',
    'contact.title': 'پروژه یا ایده‌ای دارید؟ صحبت کنیم.',
    'contact.sub': 'سریع‌ترین راه ارتباط با من تلگرام است. برای کد، ایشو و پول‌ریکوئست هم در گیت‌هاب هستم.',
    'contact.cta': 'پیام به ‎@mrzroot در تلگرام',
    'contact.primary': 'اصلی',
    'footer.built': 'ساخته‌شده با HTML، CSS و جاوااسکریپت خالص.',
    'footer.source': 'مشاهده سورس'
  };

  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n],[data-i18n-html]'));
  var EN = {};
  nodes.forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    if (k) { EN[k] = el.textContent; } else { k = el.getAttribute('data-i18n-html'); EN[k] = el.innerHTML; }
  });

  var meta = {
    en: { title: document.title, toggle: 'تغییر زبان به فارسی', menuOpen: 'Open menu', menuClose: 'Close menu' },
    fa: { title: 'محمدرضا زارع (M-R-Z) · توسعه‌دهنده پایتون · اتوماسیون و بک‌اند', toggle: 'Switch language to English', menuOpen: 'باز کردن منو', menuClose: 'بستن منو' }
  };

  var lang = 'en';
  var faNum = new Intl.NumberFormat('fa-IR', { useGrouping: false });

  function fmtNum(n) { return lang === 'fa' ? faNum.format(n) : String(n); }

  function applyLang(next, persist) {
    lang = next === 'fa' ? 'fa' : 'en';
    root.lang = lang;
    root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    nodes.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (k) { el.textContent = lang === 'fa' && FA[k] ? FA[k] : EN[k]; return; }
      k = el.getAttribute('data-i18n-html');
      el.innerHTML = lang === 'fa' && FA[k] ? FA[k] : EN[k];
    });
    document.title = meta[lang].title;
    var t = document.getElementById('lang-toggle');
    if (t) { t.setAttribute('aria-label', meta[lang].toggle); t.setAttribute('lang', lang === 'fa' ? 'en' : 'fa'); }
    var m = document.getElementById('menu-toggle');
    if (m) m.setAttribute('aria-label', m.getAttribute('aria-expanded') === 'true' ? meta[lang].menuClose : meta[lang].menuOpen);
    document.querySelectorAll('.num').forEach(function (el) {
      var raw = el.getAttribute('data-raw') || el.textContent.replace(/[^\d]/g, '');
      if (!el.getAttribute('data-raw')) el.setAttribute('data-raw', raw);
      el.textContent = fmtNum(raw);
    });
    renderRepoMeta();
    if (persist) { try { localStorage.setItem('mrz-lang', lang); } catch (e) { /* storage unavailable */ } }
  }

  var initial = 'en';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    initial = q || localStorage.getItem('mrz-lang') || 'en';
  } catch (e) { /* ignore */ }

  document.getElementById('lang-toggle').addEventListener('click', function () {
    applyLang(lang === 'fa' ? 'en' : 'fa', true);
  });

  /* ---------------- Header / nav ---------------- */
  var header = document.querySelector('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = document.getElementById('menu-toggle');
  var navLinks = document.getElementById('nav-links');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? meta[lang].menuClose : meta[lang].menuOpen);
    navLinks.classList.toggle('open', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
  navLinks.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navLinks.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 920) setMenu(false); });

  // Active section highlighting
  if ('IntersectionObserver' in window) {
    var links = {};
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && links[en.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
          links[en.target.id].classList.add('active');
          links[en.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); links[k].removeAttribute('aria-current'); });
      }, { rootMargin: '-45% 0px -50% 0px' }).observe(heroEl);
    }
  }

  /* ---------------- Reveal on scroll ---------------- */
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    // stagger siblings inside grids
    document.querySelectorAll('.stack-grid, .projects-grid, .services-grid, .hero-copy').forEach(function (g) {
      Array.prototype.forEach.call(g.querySelectorAll(':scope > .reveal'), function (el, i) { el.style.setProperty('--d', (i * 70) + 'ms'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------------- Card spotlight ---------------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------------- Live GitHub data (graceful fallback) ---------------- */
  var repoData = null;
  var LANG_COLORS = { Python: '#3572a5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Groovy: '#4298b8', PHP: '#4f5d95', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051' };

  function relTime(iso) {
    var d = new Date(iso); if (isNaN(d)) return '';
    var diff = (d.getTime() - Date.now()) / 1000;
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    var rtf;
    try { rtf = new Intl.RelativeTimeFormat(lang === 'fa' ? 'fa' : 'en', { numeric: 'auto' }); } catch (e) { return d.toISOString().slice(0, 10); }
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(diff) >= units[i][1] || i === units.length - 1) return rtf.format(Math.round(diff / units[i][1]), units[i][0]);
    }
    return '';
  }

  function renderRepoMeta() {
    if (!repoData) return;
    document.querySelectorAll('[data-repo]').forEach(function (card) {
      var r = repoData[card.getAttribute('data-repo')];
      if (!r) return;
      var set = function (f, v) { var el = card.querySelector('[data-f="' + f + '"]'); if (el && v !== undefined && v !== null && v !== '') el.textContent = v; };
      set('stars', fmtNum(r.stargazers_count));
      set('forks', fmtNum(r.forks_count));
      if (r.language) {
        set('language', r.language);
        var dot = card.querySelector('.lang i'); if (dot && LANG_COLORS[r.language]) dot.style.setProperty('--c', LANG_COLORS[r.language]);
      }
      var upd = relTime(r.pushed_at);
      if (upd) set('updated', (lang === 'fa' ? 'به‌روزرسانی ' : 'Updated ') + upd);
    });
    var rs = document.querySelector('[data-stat="repos"]');
    if (rs && repoData.__count) { rs.setAttribute('data-raw', repoData.__count); rs.textContent = fmtNum(repoData.__count); }
  }

  function ingest(list) {
    if (!Array.isArray(list)) return;
    var map = {};
    var count = 0;
    list.forEach(function (r) { if (!r.private) { count++; map[r.name] = { stargazers_count: r.stargazers_count, forks_count: r.forks_count, language: r.language, pushed_at: r.pushed_at }; } });
    map.__count = count;
    repoData = map;
    renderRepoMeta();
  }

  function loadRepos() {
    var KEY = 'mrz-repos-v1', TTL = 60 * 60 * 1000;
    try {
      var cached = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (cached && Date.now() - cached.t < TTL) { ingest(cached.d); return; }
    } catch (e) { /* ignore */ }
    if (!window.fetch) return;
    fetch('https://api.github.com/users/' + USER + '/repos?per_page=100&type=owner', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data) return;
        ingest(data);
        try { localStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: data.map(function (r) { return { name: r.name, private: r.private, stargazers_count: r.stargazers_count, forks_count: r.forks_count, language: r.language, pushed_at: r.pushed_at }; }) })); } catch (e) { /* ignore */ }
      })
      .catch(function () { /* offline or rate-limited: static fallback values stay in place */ });
  }

  /* ---------------- Init ---------------- */
  var y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
  applyLang(initial, false);
  loadRepos();
})();
