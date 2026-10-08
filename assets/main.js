/* M-R-Z · mrzroot · v3. Vanilla JS, no dependencies, no trackers. */
(function () {
  'use strict';

  window.__mrz = true;
  var USER = 'mrzroot';
  var TZ = 'Asia/Tehran';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var T0 = Date.now();
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  root.classList.add('rv');

  /* =====================================================================
     i18n
     ===================================================================== */
  var FA = {
    'skip': 'رفتن به محتوا',
    'nav.about': 'درباره', 'nav.work': 'پروژه‌ها', 'nav.stack': 'ابزارها', 'nav.live': 'زنده', 'nav.contact': 'ارتباط', 'nav.cta': 'تلگرام',
    'hero.base': 'مشهد، ایران',
    'hero.name': 'محمدرضا زارع',
    'hero.kicker': 'توسعه‌دهنده پایتون · مشهد، ایران',
    'hero.title': 'کارهای تکراری را به ابزارهای پایتونی کوچک و قابل‌اعتماد تبدیل می‌کنم.',
    'hero.lead': 'محمدرضا زارع هستم. اتوماسیون، سرویس‌های بک‌اند، افزونه مرورگر و ابزار توسعه می‌سازم و بخش‌هایی را که به کار دیگران هم می‌آید متن‌باز منتشر می‌کنم.',
    'hero.cta1': 'پیام در تلگرام',
    'hero.cta2': 'دیدن پروژه‌ها',
    'hero.m1': 'آماده همکاری', 'hero.m2': 'مخزن عمومی', 'hero.m3': 'ساعت محلی',
    'about.label': 'خاستگاه',
    'about.title': 'اجزای کمتر، چیزهایی که بی‌دردسر کار می‌کنند.',
    'about.statement': 'جایی کار می‌کنم که <span class="hl">اتوماسیون</span> و <span class="hl">بک‌اند</span> به هم می‌رسند: اسکریپت‌هایی که کارهای تکراری را حذف می‌کنند، سرویس‌ها و APIهای کوچک، و ابزارهایی که آن‌ها را سرپا نگه می‌دارند.',
    'about.p2': 'کارهای اخیرم افزونه‌های مرورگر، پایپ‌لاین‌های CI و ابزارهایی برای یکدست نگه‌داشتن ایجنت‌های هوش مصنوعی برنامه‌نویسی را در بر می‌گیرد. رویکرد همه‌جا یکی است: مسئله واقعی را بفهم، کد را کوچک و خوانا نگه دار و راه‌اندازی را به چند دقیقه برسان، نه چند ساعت.',
    'about.k1': 'حل مسئله واقعی', 'about.k1d': 'ابزار کاربردی برای دردسرهای روزمره، نه نمایشی.',
    'about.k2': 'کمتر، بهتر است', 'about.k2d': 'کد تمیز و خوانا بهتر از کد زیرکانه است.',
    'about.k3': 'یادگیری در جمع', 'about.k3d': 'یادگیری مداوم و اشتراک چیزهایی که جواب می‌دهند.',
    'f.role': 'نقش', 'f.roleV': 'توسعه‌دهنده پایتون',
    'f.focus': 'تمرکز', 'f.focusV': 'اتوماسیون، بک‌اند، ابزارسازی',
    'f.base': 'محل', 'f.since': 'در گیت‌هاب', 'f.sinceV': 'از دی ۱۴۰۲',
    'f.learning': 'در حال یادگیری', 'f.learningV': 'ابزارهای بک‌اند و داده',
    'f.contact': 'بهترین راه ارتباط: تلگرام',
    'work.label': 'عملیات',
    'work.title': 'پروژه‌های منتخب.',
    'work.sub': 'مخزن‌های عمومی که هرکدام یک مسئله مشخص را حل می‌کنند. ستاره، فورک و آخرین فعالیت زنده از گیت‌هاب خوانده می‌شود.',
    'work.problem': 'مسئله', 'work.does': 'چه می‌کند', 'work.repo': 'مخزن', 'work.fork': 'فورک',
    'work.cat.toolkit': 'ابزار توسعه‌دهنده', 'work.cat.list': 'فهرست گلچین', 'work.cat.ext': 'افزونه مرورگر', 'work.cat.agent': 'ایجنت محلی',
    'work.af.p': 'هر ایجنت هوش مصنوعی برنامه‌نویسی قوانینش را در فایل و قالب متفاوتی می‌خواهد و دستورالعمل‌ها بین ابزارها از هم فاصله می‌گیرند.',
    'work.af.d': 'یک منبع واحد قوانین را بین ایجنت‌ها همگام نگه می‌دارد، کانتکست کد را با تحلیل AST فشرده می‌کند و قوانین را از نظر مشکلات امنیتی و تعارض بررسی می‌کند.',
    'work.ap.p': 'ابزارهایی که توسعه‌دهندگان ایرانی به آن‌ها نیاز دارند در فروم‌ها و کانال‌ها پراکنده‌اند.',
    'work.ap.d': 'یک مرجع گلچین و دسته‌بندی‌شده: ابزارها و DNSهای رفع تحریم، APIهای رایگان ایرانی، فونت‌های فارسی، پکیج‌های پایتون و منابع هوش مصنوعی و NLP.',
    'work.uv.p': 'پخش‌کننده‌های وب آدرس واقعی استریم (پلی‌لیست HLS و فایل MP4) را پشت اسکریپت‌ها پنهان می‌کنند.',
    'work.uv.d': 'افزونه Manifest V3 برای کروم و اج که استریم‌های صفحه را شناسایی و ذخیره می‌کند؛ کاملاً سمت کاربر.',
    'work.ps.p': 'بعضی صفحه‌های وب حقشان است.',
    'work.ps.d': 'یک اسباب‌بازی فیزیکی اورجینال برای کروم، اج و فایرفاکس: با یک آدمک جت‌پک روی هر صفحه پرواز کنید و متن و تصویرهایش را خرد کنید.',
    'work.jk.p': 'pipeline-as-code را راحت‌تر می‌شود با مثال‌های کوچک و خوانا یاد گرفت.',
    'work.jk.d': 'پایپ‌لاین‌های declarative جنکینز به زبان Groovy با مراحل build، به‌علاوه نسخه‌ای با SCM polling.',
    'work.pb.p': 'مرورگرها نمی‌توانند بی‌صدا روی چاپگر POS یا برچسب چاپ کنند.',
    'work.pb.d': 'ایجنتی محلی که کار چاپ را از اپلیکیشن‌های وب می‌گیرد و PDF و برچسب حرارتی را بدون پنجره چاپ می‌فرستد. فورک‌شده از <a href="https://github.com/AnouarSbia/printbridge" target="_blank" rel="noopener">AnouarSbia/printbridge</a>؛ اعتبار با نویسنده اصلی است.',
    'work.all': 'همه مخزن‌ها در گیت‌هاب',
    'stack.label': 'جعبه‌ابزار',
    'stack.title': 'ابزارها.',
    'stack.sub': 'پایتون در هسته، همراه با ابزارهای وب و DevOps که یک ایده را از اسکریپت تا محصول می‌رسانند.',
    'stack.g1': 'هسته و بک‌اند', 'stack.g2': 'داده', 'stack.g3': 'وب و مرورگر', 'stack.g4': 'عملیات و ابزار',
    'stack.python': 'اتوماسیون، سرویس‌ها', 'stack.web': 'بک‌اند وب و API', 'stack.php': 'اپلیکیشن وب', 'stack.proto': 'رابط‌ها',
    'stack.rel': 'رابطه‌ای', 'stack.cache': 'کش', 'stack.query': 'کوئری و گزارش',
    'stack.ts': 'افزونه‌ها، CLI', 'stack.node': 'ابزارسازی', 'stack.ui': 'رابط کاربری', 'stack.ext': 'کروم، اج، فایرفاکس',
    'stack.git': 'گردش کار', 'stack.ci': 'CI/CD', 'stack.groovy': 'پایپ‌لاین', 'stack.ai': 'توسعه با کمک هوش مصنوعی',
    'live.label': 'تله‌متری',
    'live.title': 'زنده از گیت‌هاب.',
    'live.connecting': 'در حال اتصال به گیت‌هاب…',
    'live.k1': 'مخزن عمومی', 'live.k2': 'پروژه اورجینال', 'live.k2c': 'بدون احتساب فورک‌ها',
    'live.k3': 'زبان‌ها', 'live.k3c': 'زبان اصلی هر مخزن', 'live.k4': 'آخرین push',
    'live.activity': 'فعالیت عمومی', 'live.activityMeta': 'رویداد در روز · ۳۰ روز اخیر',
    'live.ax1': '۳۰ روز پیش', 'live.ax2': '۱۵ روز', 'live.today': 'امروز',
    'live.eventsTotal': 'رویداد در ۳۰ روز اخیر',
    'live.clock': 'ساعت محلی', 'live.city': 'شهر', 'live.coords': 'مختصات', 'live.coordsV': '۳۶٫۳۰° شمالی، ۵۹٫۶۰° شرقی', 'live.session': 'حضور شما',
    'live.langs': 'زبان‌ها', 'live.langsMeta': 'مخزن‌های اورجینال',
    'live.feed': 'رویدادهای اخیر', 'live.waiting': 'در انتظار داده…',
    'proc.label': 'گزارش میدانی',
    'proc.title': 'روش کار من، و مسیر پیش رو.',
    'proc.s1': 'شناخت', 'proc.s1d': 'مسئله واقعی و کوچک‌ترین نتیجه مفید را پیدا می‌کنم.',
    'proc.s2': 'ساخت کوچک', 'proc.s2d': 'نسخه‌ای کارا را زود تحویل می‌دهم، با کد تمیز و خوانا.',
    'proc.s3': 'مستندسازی', 'proc.s3d': 'README روشن و مراحل نصبی که هرکسی بتواند دنبال کند.',
    'proc.s4': 'بهبود', 'proc.s4d': 'اصلاح بر اساس بازخورد و حفظ قابلیت نگهداری.',
    'proc.logTitle': 'گزارش، برگرفته از تاریخچه مخزن‌ها',
    'proc.t1': 'دی ۱۴۰۲', 'proc.e1': 'پیوستن به گیت‌هاب. اولین مخزن: نمونه پایپ‌لاین‌های جنکینز.',
    'proc.t2': 'مرداد ۱۴۰۵', 'proc.e2': 'راه‌اندازی پروفایل. انتشار Awesome Persian Developer Resources، Universal Video Downloader و AgentForge؛ فورک PrintBridge.',
    'proc.t3': 'مهر ۱۴۰۵', 'proc.e3': 'انتشار Page Smash. بازسازی کامل همین سایت.',
    'proc.t4': 'بعدی', 'proc.e4': 'تعمیق در ابزارهای بک‌اند و داده.',
    'contact.label': 'ارتباط',
    'contact.title': 'کاری دارید که باید خودش انجام شود؟',
    'contact.sub': 'از کار، ابزار یا ایده‌تان بگویید. سریع‌ترین راه ارتباط با من تلگرام است.',
    'contact.cta': 'پیام به ‎@mrzroot',
    'footer.note': 'دست‌ساز. بدون ردیاب، بدون فریم‌ورک.',
    'footer.source': 'سورس'
  };
  var DYN = {
    en: {
      title: document.title, toggle: 'Switch language to Persian', menuOpen: 'Open menu', menuClose: 'Close menu',
      live: 'Live', cached: 'Cached', offline: 'Offline · showing saved values', loading: 'Connecting to GitHub…',
      pushed: 'Updated ', noEvents: 'No public events in the last 30 days.', noLang: 'No language (docs/config)',
      events: function (n, d) { return n + (n === 1 ? ' event · ' : ' events · ') + d; }, refresh: 'Refresh data'
    },
    fa: {
      title: 'M-R-Z · محمدرضا زارع: توسعه‌دهنده اتوماسیون و بک‌اند پایتون', toggle: 'Switch language to English', menuOpen: 'باز کردن منو', menuClose: 'بستن منو',
      live: 'زنده', cached: 'کش‌شده', offline: 'آفلاین · نمایش مقادیر ذخیره‌شده', loading: 'در حال اتصال به گیت‌هاب…',
      pushed: 'به‌روزرسانی ', noEvents: 'در ۳۰ روز اخیر رویداد عمومی ثبت نشده.', noLang: 'بدون زبان (مستندات/پیکربندی)',
      events: function (n, d) { return toFa(n) + ' رویداد · ' + d; }, refresh: 'به‌روزرسانی داده'
    }
  };

  var lang = 'en';
  var i18nNodes = $$('[data-i18n],[data-i18n-html]');
  var EN = {};
  i18nNodes.forEach(function (el) {
    var k = el.getAttribute('data-i18n') || el.getAttribute('data-i18n-html');
    if (!(k in EN)) EN[k] = el.hasAttribute('data-i18n-html') ? el.innerHTML : el.textContent;
  });
  function toFa(v) { return String(v).replace(/[0-9]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }).replace(/\./g, '٫'); }
  function N(v) { return lang === 'fa' ? toFa(v) : String(v); }
  function D(k) { return DYN[lang][k]; }
  var numNodes = $$('.num');
  numNodes.forEach(function (el) { if (!el.hasAttribute('data-raw')) el.setAttribute('data-raw', el.textContent); });

  function applyLang(next, persist) {
    lang = next === 'fa' ? 'fa' : 'en';
    root.lang = lang; root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    i18nNodes.forEach(function (el) {
      var html = el.hasAttribute('data-i18n-html');
      var k = el.getAttribute(html ? 'data-i18n-html' : 'data-i18n');
      var v = lang === 'fa' && FA[k] ? FA[k] : EN[k];
      if (v === undefined) return;
      if (html) el.innerHTML = v; else el.textContent = v;
    });
    numNodes.forEach(function (el) { el.textContent = N(el.getAttribute('data-raw')); });
    document.title = D('title');
    var t = $('#lang-sr'); if (t) t.textContent = D('toggle');
    var rb = $('#live-refresh'); if (rb) rb.setAttribute('aria-label', D('refresh'));
    syncMenuLabel();
    makeFormatters();
    if (persist) store.set('mrz-lang', lang);
    tick();
    render();
  }

  /* =====================================================================
     Header, menu, scroll-spy
     ===================================================================== */
  var header = $('#top'), menuBtn = $('#menu-btn'), nav = $('#nav');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); requestAnimationFrame(onScroll);
  function menuOpen() { return root.classList.contains('menu-open'); }
  function syncMenuLabel() { if (menuBtn) menuBtn.setAttribute('aria-label', D(menuOpen() ? 'menuClose' : 'menuOpen')); }
  function setMenu(open) { root.classList.toggle('menu-open', open); menuBtn.setAttribute('aria-expanded', String(open)); syncMenuLabel(); }
  menuBtn.addEventListener('click', function () { setMenu(!menuOpen()); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) { setMenu(false); menuBtn.focus(); } });
  window.addEventListener('resize', function () { if (window.innerWidth > 860 && menuOpen()) setMenu(false); });

  var navLinks = $$('#nav > a');
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id === 'process' ? 'live' : en.target.id;
        navLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['hero', 'about', 'work', 'stack', 'live', 'process', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* =====================================================================
     Motion: reveals, spotlight, magnetic, scramble
     ===================================================================== */
  var reveals = $$('.reveal');
  $$('.work-grid, .stack-grid, .dash, .steps, .principles').forEach(function (g) {
    $$(':scope > .reveal', g).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i * 70, 420) + 'ms'); });
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  if (finePointer && !reduce) {
    $$('.spot').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    $$('.magnetic').forEach(function (el) {
      var raf = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () { el.style.transform = 'translate(' + (dx * 6).toFixed(2) + 'px,' + (dy * 5).toFixed(2) + 'px)'; });
      });
      el.addEventListener('pointerleave', function () { cancelAnimationFrame(raf); el.style.transform = ''; });
    });
  }

  function scramble(el, finalText, dur) {
    if (!el || reduce) return;
    var chars = '01<>/_-=+*#%', start = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - start) / dur), out = '';
      for (var i = 0; i < finalText.length; i++) {
        var c = finalText[i];
        out += (c === '-' || i / finalText.length < p) ? c : chars[(Math.random() * chars.length) | 0];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = finalText;
    })(start);
  }

  /* AgentForge diagram: ping each target in turn while visible. */
  (function () {
    var items = $$('.sync-targets li'); if (!items.length || reduce || !('IntersectionObserver' in window)) return;
    var k = 0, timer = 0;
    var vis = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting && !timer) {
        timer = setInterval(function () { items.forEach(function (li, i) { li.classList.toggle('ping', i === k); }); k = (k + 1) % items.length; }, 700);
      } else if (!en[0].isIntersecting && timer) { clearInterval(timer); timer = 0; }
    });
    vis.observe($('.case-visual'));
  })();

  /* =====================================================================
     Hero field: perspective dot grid (Canvas 2D, no WebGL)
     ===================================================================== */
  function startField() {
    var c = $('#field'); if (!c || !c.getContext) return;
    var ctx = c.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, dpr = 1, cols = 120, rows = 34, spacing = 12, dz = 30, zMin = 140;
    var mx = 0, my = 0, tx = 0, ty = 0, px = -1e4, py = -1e4;
    var running = false, visible = true, raf = 0;
    function size() {
      var r = c.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      c.width = Math.max(1, Math.round(W * dpr)); c.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = W < 700 ? 64 : 120; rows = W < 700 ? 28 : 34;
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      var fov = Math.max(W, 700) * 0.85;
      var horizon = H * 0.34 + my * 14;
      var camY = 120, zMax = zMin + rows * dz;
      var shift = reduce ? 0 : (t * 0.018) % dz;
      var cx = W * (W > 1080 ? (root.dir === 'rtl' ? 0.38 : 0.62) : 0.5) + mx * 30;
      for (var j = 0; j < rows; j++) {
        var z = zMin + j * dz - shift;
        var depth = (z - zMin) / (zMax - zMin);
        var fade = Math.min(1, (z - zMin + dz) / (dz * 3)) * Math.pow(1 - depth, 1.1);
        if (fade <= 0.01) continue;
        var s = fov / z;
        for (var i = 0; i < cols; i++) {
          var x = (i - (cols - 1) / 2) * spacing;
          var y = Math.sin(i * 0.09 + t * 0.00055) * 14 + Math.cos(j * 0.3 - t * 0.0004 + i * 0.03) * 16;
          var sx = cx + x * s;
          if (sx < -10 || sx > W + 10) continue;
          var sy = horizon + (camY - y) * s * 0.55;
          if (sy > H + 10) continue;
          var dxm = sx - px, dym = sy - py, near = 1 - Math.min(1, Math.sqrt(dxm * dxm + dym * dym) / 160);
          var a = Math.min(0.9, fade * 0.85 + near * 0.6 * fade);
          var r = Math.max(1, 3 * (zMin / z));
          ctx.fillStyle = near > 0.05 ? 'rgba(74,232,189,' + Math.min(0.95, a + 0.15).toFixed(3) + ')' : 'rgba(170,184,198,' + a.toFixed(3) + ')';
          ctx.fillRect(sx - r / 2, sy - r / 2, r, r);
        }
      }
    }
    function loop(t) { if (!running) return; draw(t); raf = requestAnimationFrame(loop); }
    function play() { if (running || reduce || !visible || document.hidden) return; running = true; raf = requestAnimationFrame(loop); }
    function pause() { running = false; cancelAnimationFrame(raf); }
    size(); draw(0); c.classList.add('on');
    var rt = 0;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { size(); draw(performance.now()); }, 120); });
    if (reduce) return;
    if (finePointer) {
      var hero = $('#hero');
      hero.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
        tx = (px / W - 0.5) * 2; ty = (py / H - 0.5) * 2;
      });
      hero.addEventListener('pointerleave', function () { px = py = -1e4; tx = ty = 0; });
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) play(); else pause(); }).observe(c);
    document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); else play(); });
    play();
  }

  /* =====================================================================
     Clock (Asia/Tehran)
     ===================================================================== */
  var fmtHM, fmtS, fmtDate;
  function makeFormatters() {
    try {
      var loc = lang === 'fa' ? 'fa-IR' : 'en-GB';
      fmtHM = new Intl.DateTimeFormat(loc, { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false });
      fmtS = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, second: '2-digit' });
      fmtDate = new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { fmtHM = fmtS = fmtDate = null; }
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function uptimeStr() { var s = Math.floor((Date.now() - T0) / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60); }
  function tick() {
    var now = new Date();
    if (fmtHM) {
      var hm = fmtHM.format(now);
      $$('[data-clock="hm"],[data-clock="short"]').forEach(function (el) { el.textContent = hm; });
      $$('[data-clock="s"]').forEach(function (el) { el.textContent = ':' + N(pad(parseInt(fmtS.format(now), 10) || 0)); });
      $$('[data-clock="date"]').forEach(function (el) { el.textContent = fmtDate.format(now); });
    }
    var u = $('#uptime'); if (u) u.textContent = N(uptimeStr());
  }
  setInterval(function () { if (!document.hidden) tick(); }, 1000);

  /* =====================================================================
     GitHub data: probe, 8s timeout, 10 min cache, snapshot fallback
     ===================================================================== */
  var SNAPSHOT = {
    user: { public_repos: 16 },
    repos: [
      { name: 'agentforge', language: 'TypeScript', stargazers_count: 3, forks_count: 0, fork: false, pushed_at: '2026-08-16T20:35:33Z' },
      { name: 'awesome-persian-developer-resources', language: null, stargazers_count: 2, forks_count: 0, fork: false, pushed_at: '2026-08-16T06:34:51Z' },
      { name: 'universal-video-downloader', language: 'JavaScript', stargazers_count: 0, forks_count: 0, fork: false, pushed_at: '2026-08-16T06:35:13Z' },
      { name: 'page-smash', language: 'JavaScript', stargazers_count: 0, forks_count: 0, fork: false, pushed_at: '2026-10-04T08:57:16Z' },
      { name: 'jenkins', language: null, stargazers_count: 2, forks_count: 0, fork: false, pushed_at: '2026-08-09T05:25:34Z' },
      { name: 'printbridge', language: null, stargazers_count: 2, forks_count: 0, fork: true, pushed_at: '2026-08-09T06:08:03Z' }
    ],
    events: []
  };
  var LANG_COLORS = { Python: '#3572a5', JavaScript: '#f1e05a', TypeScript: '#3178c6', Groovy: '#4298b8', PHP: '#4f5d95', HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', Other: '#4b5563' };
  var data = { user: SNAPSHOT.user, repos: SNAPSHOT.repos, events: SNAPSHOT.events, state: 'loading', latency: null, full: false };
  var CACHE_KEY = 'mrz-gh-v3', TTL = 10 * 60 * 1000;

  function slim(repos) { return repos.map(function (r) { return { name: r.name, language: r.language, stargazers_count: r.stargazers_count, forks_count: r.forks_count, fork: r.fork, pushed_at: r.pushed_at }; }); }
  function slimEv(evs) { return evs.map(function (e) { return { type: e.type, repo: e.repo && e.repo.name, created_at: e.created_at, action: e.payload && e.payload.action, ref_type: e.payload && e.payload.ref_type }; }); }
  function getJSON(url) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { clearTimeout(timer); return r.ok ? r.json() : Promise.reject(r.status); }, function (e) { clearTimeout(timer); return Promise.reject(e); });
  }
  var loading = false;
  function loadData(force) {
    if (loading) return;
    var cached = null;
    try { cached = JSON.parse(store.get(CACHE_KEY) || 'null'); } catch (e) { cached = null; }
    if (!force && cached && Date.now() - cached.t < TTL) {
      data.user = cached.user; data.repos = cached.repos; data.events = cached.events; data.state = 'cached'; data.full = true; data.t = cached.t;
      render(); return;
    }
    if (!window.fetch) { data.state = 'offline'; render(); return; }
    loading = true; data.state = 'loading'; setStatus();
    var api = 'https://api.github.com', t1 = performance.now();
    getJSON(api + '/users/' + USER).then(function (user) {
      return Promise.all([
        user,
        getJSON(api + '/users/' + USER + '/repos?per_page=100&type=owner&sort=pushed'),
        getJSON(api + '/users/' + USER + '/events/public?per_page=100').catch(function () { return []; })
      ]);
    }).then(function (res) {
      loading = false;
      data.latency = Math.round(performance.now() - t1);
      data.user = { public_repos: res[0].public_repos };
      data.repos = slim(res[1].filter(function (r) { return !r.private; }));
      data.events = slimEv(res[2] || []);
      data.state = 'live'; data.full = true; data.t = Date.now();
      store.set(CACHE_KEY, JSON.stringify({ t: data.t, user: data.user, repos: data.repos, events: data.events }));
      render();
    }).catch(function () {
      loading = false;
      if (cached) { data.user = cached.user; data.repos = cached.repos; data.events = cached.events; data.state = 'cached'; data.full = true; data.t = cached.t; }
      else data.state = 'offline';
      render();
    });
  }
  function relTime(iso, style) {
    var d = new Date(iso); if (isNaN(d)) return '';
    var diff = (d.getTime() - Date.now()) / 1000;
    var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
    for (var i = 0; i < units.length; i++) {
      if (Math.abs(diff) >= units[i][1] || i === units.length - 1) {
        var v = Math.round(diff / units[i][1]);
        if (v === 0 && units[i][0] === 'minute') v = -0;
        try { return new Intl.RelativeTimeFormat(lang === 'fa' ? 'fa' : 'en', { numeric: 'auto', style: style || 'long' }).format(v, units[i][0]); } catch (e) { return d.toISOString().slice(0, 10); }
      }
    }
    return '';
  }
  function repoMap() { var m = {}; data.repos.forEach(function (r) { m[r.name] = r; }); return m; }
  function stats() {
    var langs = {}, last = null, original = 0;
    data.repos.forEach(function (r) {
      if (!r.fork) { original++; var l = r.language || 'Other'; langs[l] = (langs[l] || 0) + 1; }
      if (!last || new Date(r.pushed_at) > new Date(last.pushed_at)) last = r;
    });
    var list = Object.keys(langs).map(function (k) { return [k, langs[k]]; }).sort(function (a, b) { return (a[0] === 'Other') - (b[0] === 'Other') || b[1] - a[1]; });
    return { langs: list, last: last, original: original, langCount: list.filter(function (l) { return l[0] !== 'Other'; }).length };
  }
  function setNum(el, n) { if (!el || n === undefined || n === null) return; el.setAttribute('data-raw', n); el.textContent = N(n); }
  function dayLabel(daysAgo) {
    var d = new Date(Date.now() - daysAgo * 86400000);
    try { return new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR-u-ca-persian' : 'en-GB', { timeZone: TZ, day: 'numeric', month: 'short' }).format(d); } catch (e) { return d.toISOString().slice(5, 10); }
  }

  function render() {
    var m = repoMap();
    $$('[data-repo]').forEach(function (card) {
      var r = m[card.getAttribute('data-repo')]; if (!r) return;
      setNum($('[data-f="stars"]', card), r.stargazers_count);
      setNum($('[data-f="forks"]', card), r.forks_count);
      if (r.language) {
        $('[data-f="language"]', card).textContent = r.language;
        var dot = $('.stat-lang i', card); if (dot && LANG_COLORS[r.language]) dot.style.setProperty('--c', LANG_COLORS[r.language]);
      }
      var u = relTime(r.pushed_at); var ue = $('[data-f="updated"]', card); if (u && ue) ue.textContent = D('pushed') + u;
    });
    var s = stats();
    if (data.full) {
      setNum($('[data-stat="repos"]'), data.user.public_repos);
      setNum($('[data-hud="repos"]'), data.user.public_repos);
      setNum($('[data-hud="original"]'), s.original);
      setNum($('[data-hud="langs"]'), s.langCount);
    }
    if (s.last) { $('[data-hud="last"]').textContent = s.last.name; $('[data-hud="lastT"]').textContent = relTime(s.last.pushed_at); }

    // Language distribution (original repos only)
    var total = s.langs.reduce(function (a, l) { return a + l[1]; }, 0) || 1;
    var name = function (l) { return l === 'Other' ? D('noLang') : l; };
    var bar = $('#lang-bar'), list = $('#lang-list');
    bar.innerHTML = s.langs.map(function (l) { return '<span style="flex-grow:' + l[1] + ';--c:' + (LANG_COLORS[l[0]] || '#8b949e') + '"></span>'; }).join('');
    bar.setAttribute('aria-label', s.langs.map(function (l) { return name(l[0]) + ' ' + Math.round(l[1] / total * 100) + '%'; }).join(', '));
    list.innerHTML = s.langs.map(function (l) { return '<li><i style="--c:' + (LANG_COLORS[l[0]] || '#8b949e') + '"></i><span class="ln">' + esc(name(l[0])) + '</span><b>' + N(Math.round(l[1] / total * 100)) + '%</b></li>'; }).join('');

    // 30-day activity
    var days = []; for (var i = 0; i < 30; i++) days.push(0);
    data.events.forEach(function (e) { var d = Math.floor((Date.now() - new Date(e.created_at).getTime()) / 86400000); if (d >= 0 && d < 30) days[29 - d]++; });
    var max = Math.max.apply(null, days) || 1, sum = days.reduce(function (a, b) { return a + b; }, 0);
    $('#chart-bars').innerHTML = days.map(function (v, i) {
      var h = v ? Math.max(6, Math.round(v / max * 100)) : 0;
      var tip = D('events')(v, dayLabel(29 - i));
      return '<span class="bar' + (v ? ' has' : '') + '" style="--h:' + h + '%" tabindex="-1"><i></i><span class="tip">' + esc(tip) + '</span></span>';
    }).join('');
    $('#chart').setAttribute('aria-label', (lang === 'fa' ? 'رویدادهای عمومی گیت‌هاب در ۳۰ روز اخیر: ' : 'Public GitHub events, last 30 days: ') + N(sum));
    setNum($('[data-hud="events"]'), sum);

    // Event stream
    var feed = $('#feed'), evs = data.events.slice(0, 6);
    if (evs.length) {
      feed.innerHTML = evs.map(function (e) {
        var map = { PushEvent: 'push', PullRequestEvent: 'pr ' + (e.action || ''), CreateEvent: 'create ' + (e.ref_type || ''), WatchEvent: 'star', ForkEvent: 'fork', IssuesEvent: 'issue ' + (e.action || ''), ReleaseEvent: 'release', PublicEvent: 'publish', DeleteEvent: 'delete ' + (e.ref_type || ''), IssueCommentEvent: 'comment' };
        var t = (map[e.type] || String(e.type || '').replace('Event', '').toLowerCase()).trim();
        var repo = e.repo || '';
        return '<li><span class="ev">' + esc(t) + '</span><span class="rp" dir="ltr"><a href="https://github.com/' + esc(repo) + '" target="_blank" rel="noopener">' + esc(repo.replace(USER + '/', '')) + '</a></span><span class="tm">' + esc(relTime(e.created_at, 'narrow')) + '</span></li>';
      }).join('');
    } else if (data.state !== 'loading') {
      feed.innerHTML = '<li class="feed-empty">' + esc(D('noEvents')) + '</li>';
    }
    setStatus();
  }
  function setStatus() {
    var pill = $('#live-pill'), txt = $('#live-text'); if (!pill || !txt) return;
    pill.setAttribute('data-state', data.state);
    txt.removeAttribute('data-i18n');
    var s = D(data.state) || '';
    if (data.state === 'live') s += ' · api.github.com' + (data.latency ? ' · ' + N(data.latency) + (lang === 'fa' ? ' میلی‌ثانیه' : 'ms') : '');
    else if (data.state === 'cached' && data.t) s += ' · ' + relTime(new Date(data.t).toISOString());
    txt.textContent = s;
  }
  $('#live-refresh').addEventListener('click', function () {
    var b = this; b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
    loadData(true);
  });

  /* =====================================================================
     Terminal
     ===================================================================== */
  var out = $('#term-out'), input = $('#term-input'), form = $('#term-form');
  var hist = [], hIdx = -1;
  var PROJECTS = [
    ['agentforge', 'AgentForge', 'one rules source for every AI coding agent'],
    ['awesome-persian-developer-resources', 'Awesome Persian Dev Resources', 'curated hub for Iranian developers'],
    ['universal-video-downloader', 'Universal Video Downloader', 'MV3 extension: detect & save HLS/MP4'],
    ['page-smash', 'Page Smash', 'physics toy: smash any webpage'],
    ['jenkins', 'Jenkins Pipeline Examples', 'declarative Groovy pipelines'],
    ['printbridge', 'PrintBridge', 'silent local printing (fork of AnouarSbia/printbridge)']
  ];
  var SECTIONS = { home: 'hero', root: 'hero', about: 'about', origins: 'about', work: 'work', projects: 'work', ops: 'work', operations: 'work', stack: 'stack', arsenal: 'stack', live: 'live', hud: 'live', process: 'process', log: 'process', contact: 'contact', comms: 'contact' };
  var link = function (href, label) { return '<a href="' + href + '" target="_blank" rel="noopener">' + esc(label || href.replace(/^https?:\/\//, '')) + '</a>'; };
  var cmdBtn = function (c) { return '<button type="button" class="t-link" data-cmd="' + esc(c) + '">' + esc(c) + '</button>'; };
  function print(html, cls) { var p = document.createElement('p'); if (cls) p.className = cls; p.innerHTML = html; out.appendChild(p); out.scrollTop = out.scrollHeight; return p; }
  function printCmd(text) { var p = document.createElement('p'); p.className = 't-cmd'; p.innerHTML = '<b>›</b> ' + esc(text); out.appendChild(p); }
  function row(k, v) { print('<span class="t-dim">' + esc(k) + '</span><span>' + v + '</span>', 't-row'); }
  function openUrl(url) { window.open(url, '_blank', 'noopener'); }
  function go(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }

  var COMMANDS = {
    help: function () {
      [['whoami', 'identity & role'], ['about', 'short bio'], ['projects', 'selected work with live stats'], ['open <n>', 'open project n on GitHub'], ['stack', 'tools I use'], ['stats', 'live GitHub numbers'], ['contact', 'how to reach me'], ['telegram', 'open t.me/mrzroot'], ['goto <section>', 'scroll to a section'], ['date', 'local time in Mashhad'], ['lang <en|fa>', 'switch site language'], ['boot', 'replay the boot sequence'], ['clear', 'clear the screen']]
        .forEach(function (c) { row(c[0], esc(c[1])); });
      print('Tab completes · ↑ ↓ history · Ctrl+L clears', 't-dim');
    },
    whoami: function () {
      row('codename', '<span class="t-acc">M-R-Z</span>');
      row('name', 'Mohammadreza Zare · محمدرضا زارع');
      row('role', 'Python developer: automation &amp; backend');
      row('base', 'Mashhad, IR · UTC+03:30');
      row('reach', link('https://t.me/mrzroot') + ' <span class="t-dim">(primary)</span>');
      print('next: ' + cmdBtn('projects') + '  ' + cmdBtn('stack') + '  ' + cmdBtn('contact'), 't-dim');
    },
    about: function () {
      print('Python developer from Mashhad, Iran. I build automation, small backend');
      print('services and the tooling around them: browser extensions, CI pipelines');
      print('and tools that keep AI coding agents consistent. Small code, simple setup,');
      print('open source when it can help someone else.');
    },
    projects: function () {
      var m = repoMap();
      PROJECTS.forEach(function (p, i) {
        var r = m[p[0]] || {};
        var meta = '★ ' + (r.stargazers_count != null ? r.stargazers_count : '–') + (r.fork ? ' · fork' : '');
        print('<span class="t-acc">' + (i + 1) + '</span>  ' + link('https://github.com/mrzroot/' + p[0], p[1]) + '  <span class="t-dim">' + esc(meta) + '</span>');
        print('   <span class="t-dim">' + esc(p[2]) + '</span>');
      });
      print('open one: ' + cmdBtn('open 1') + '  or ' + cmdBtn('goto work'), 't-dim');
    },
    open: function (args) {
      var a = (args[0] || '').toLowerCase(), idx = parseInt(a, 10);
      var p = !isNaN(idx) ? PROJECTS[idx - 1] : PROJECTS.filter(function (x) { return a && (x[0].indexOf(a) === 0 || x[1].toLowerCase().indexOf(a) === 0); })[0];
      if (!p) { print('usage: open <1-' + PROJECTS.length + '|name>', 't-err'); return; }
      var url = 'https://github.com/mrzroot/' + p[0];
      print('opening ' + link(url) + ' …', 't-acc'); openUrl(url);
    },
    stack: function () {
      [['core', 'Python · Django · Flask · FastAPI'], ['also', 'PHP · Laravel · TypeScript · JavaScript · Node.js'], ['data', 'PostgreSQL · MySQL · SQLite · Redis'], ['web', 'React · Vue · Chrome extensions (MV3)'], ['ops', 'Git · GitHub · Jenkins · Docker'], ['ai', 'Cursor · Claude Code · Copilot']]
        .forEach(function (r) { row(r[0], esc(r[1])); });
    },
    stats: function () {
      var s = stats();
      print('source: api.github.com (' + esc(data.state) + ')', 't-dim');
      row('public repos', String(data.user.public_repos));
      row('original', String(s.original));
      row('languages', esc(s.langs.filter(function (l) { return l[0] !== 'Other'; }).map(function (l) { return l[0]; }).join(' · ') || '–'));
      if (s.last) row('last push', esc(s.last.name) + ' <span class="t-dim">' + esc(relTime(s.last.pushed_at)) + '</span>');
    },
    contact: function () {
      row('telegram', link('https://t.me/mrzroot') + ' <span class="t-acc">← fastest</span>');
      row('github', link('https://github.com/mrzroot'));
      row('linkedin', link('https://linkedin.com/in/mrzroot'));
      print('no email. ' + cmdBtn('telegram') + ' opens a chat.', 't-dim');
    },
    telegram: function () { print('opening ' + link('https://t.me/mrzroot') + ' …', 't-acc'); openUrl('https://t.me/mrzroot'); },
    github: function () { print('opening ' + link('https://github.com/mrzroot') + ' …', 't-acc'); openUrl('https://github.com/mrzroot'); },
    linkedin: function () { print('opening ' + link('https://linkedin.com/in/mrzroot') + ' …', 't-acc'); openUrl('https://linkedin.com/in/mrzroot'); },
    ls: function () { print(['about/', 'work/', 'stack/', 'live/', 'process/', 'contact/'].map(function (x) { return cmdBtn('goto ' + x.slice(0, -1)).replace('>goto ', '>'); }).join('  ')); },
    goto: function (args) {
      var id = SECTIONS[(args[0] || '').toLowerCase().replace(/\/$/, '')];
      if (!id) { print('usage: goto <about|work|stack|live|process|contact>', 't-err'); return; }
      print('→ ' + esc(id), 't-acc'); go(id);
    },
    date: function () {
      var n = new Date();
      row('mashhad', esc(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, dateStyle: 'full', timeStyle: 'medium' }).format(n)));
      row('session', uptimeStr());
    },
    lang: function (args) {
      var l = (args[0] || '').toLowerCase();
      if (l !== 'en' && l !== 'fa') { print('usage: lang <en|fa> · current: ' + lang, 't-err'); return; }
      applyLang(l, true); print('locale → ' + (l === 'fa' ? 'fa_IR (RTL)' : 'en_US'), 't-acc');
    },
    history: function () { if (!hist.length) { print('(empty)', 't-dim'); return; } hist.slice().reverse().forEach(function (h, i) { print((i + 1) + '  ' + esc(h)); }); },
    boot: function () { print('rebooting…', 't-dim'); setTimeout(function () { runBoot(true); }, 250); },
    clear: function () { out.innerHTML = ''; },
    echo: function (args) { print(esc(args.join(' '))); },
    sudo: function () { print('mrz is not in the sudoers file. Nice try.', 't-err'); },
    rm: function () { print('rm: read-only file system', 't-err'); },
    exit: function () { print('there is no exit. try ' + cmdBtn('contact') + ' instead.', 't-dim'); },
    pwd: function () { print('/home/mrzroot'); },
    hello: function () { print('hey. ' + cmdBtn('contact') + ' to reach me.'); }
  };
  var ALIAS = { ops: 'projects', work: 'projects', tg: 'telegram', cd: 'goto', cls: 'clear', man: 'help', '?': 'help', hi: 'hello', time: 'date', hud: 'stats', status: 'stats', bio: 'about', email: 'contact', mail: 'contact' };
  var NAMES = Object.keys(COMMANDS).filter(function (n) { return ['hello', 'rm', 'exit', 'pwd', 'echo', 'sudo'].indexOf(n) < 0; });

  function run(raw) {
    var line = String(raw || '').trim();
    printCmd(line);
    if (!line) return;
    hist.unshift(line); if (hist.length > 50) hist.pop(); hIdx = -1;
    var parts = line.split(/\s+/), name = parts[0].toLowerCase();
    name = ALIAS[name] || name;
    var fn = COMMANDS.hasOwnProperty(name) ? COMMANDS[name] : null;
    if (fn) fn(parts.slice(1));
    else print('command not found: ' + esc(parts[0]) + ' · try ' + cmdBtn('help'), 't-err');
    out.scrollTop = out.scrollHeight;
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value; input.value = ''; run(v); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { if (hist.length) { hIdx = Math.min(hIdx + 1, hist.length - 1); input.value = hist[hIdx]; } e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hIdx = Math.max(hIdx - 1, -1); input.value = hIdx >= 0 ? hist[hIdx] : ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      var v = input.value.trim().toLowerCase(); if (!v || v.indexOf(' ') >= 0) return;
      var mm = NAMES.filter(function (n) { return n.indexOf(v) === 0; });
      if (mm.length === 1) { input.value = mm[0] + ' '; e.preventDefault(); }
      else if (mm.length > 1) { printCmd(input.value); print(mm.join('   '), 't-dim'); e.preventDefault(); }
    } else if (e.key === 'l' && e.ctrlKey) { out.innerHTML = ''; e.preventDefault(); }
  });
  $('#term').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cmd]');
    if (b) { run(b.getAttribute('data-cmd')); if (finePointer) input.focus({ preventScroll: true }); return; }
    if (!e.target.closest('a') && !String(window.getSelection() || '') && finePointer) input.focus({ preventScroll: true });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.preventDefault(); go('hero'); input.focus({ preventScroll: true });
  });
  function termIntro() {
    print('<span class="t-acc">mrz shell</span> <span class="t-dim">v3 · connected to github.com/mrzroot</span>');
    var demo = 'whoami';
    if (reduce) { run(demo); return; }
    var i = 0;
    setTimeout(function () {
      var typer = setInterval(function () {
        if (document.activeElement === input) { clearInterval(typer); return; }
        input.value = demo.slice(0, ++i);
        if (i >= demo.length) { clearInterval(typer); setTimeout(function () { if (input.value === demo) { input.value = ''; run(demo); } }, 260); }
      }, 80);
    }, 700);
  }

  /* =====================================================================
     Boot → hero
     ===================================================================== */
  var bootEl = $('#boot'), mainEl = $('#main'), started = false;
  function heroIn() {
    root.classList.add('hero-ready');
    var cn = $('#codename'); if (cn) scramble(cn, 'M-R-Z', 700);
  }
  function runBoot(force) {
    if (!force && !root.classList.contains('booting')) { requestAnimationFrame(function () { heroIn(); afterBoot(); }); return; }
    if (force) { window.__mrzReplay = true; root.classList.remove('hero-ready'); }
    root.classList.remove('boot-out');
    root.classList.add('booting');
    bootEl.setAttribute('aria-hidden', 'false');
    if (mainEl) mainEl.setAttribute('inert', '');
    var log = $('#boot-log'), fill = $('#boot-fill'), pct = $('#boot-pct'), skip = $('#boot-skip');
    log.innerHTML = ''; fill.style.width = '0%'; pct.textContent = '000';
    skip.tabIndex = 0;
    var LINES = [
      ['init', 'mrz runtime'], ['mount', '/home/mrzroot'], ['load', 'python3 · automation'], ['link', 'github.com/mrzroot'],
      ['locale', 'en_US · fa_IR'], ['tz', 'Asia/Tehran · Mashhad'], ['open', 't.me/mrzroot']
    ];
    var i = 0, done = false;
    function finish() {
      if (done) return; done = true;
      clearInterval(timer); clearTimeout(cap);
      document.removeEventListener('keydown', onKey);
      bootEl.removeEventListener('click', finish);
      fill.style.width = '100%'; pct.textContent = '100';
      store.set('mrz-booted', '1');
      window.__mrzReplay = false;
      root.classList.add('boot-out');
      root.classList.remove('booting');
      bootEl.setAttribute('aria-hidden', 'true');
      skip.tabIndex = -1;
      if (mainEl) mainEl.removeAttribute('inert');
      setTimeout(heroIn, 120);
      setTimeout(function () { root.classList.remove('boot-out'); }, 950);
      afterBoot();
    }
    function onKey(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } }
    document.addEventListener('keydown', onKey);
    bootEl.addEventListener('click', finish);
    var cap = setTimeout(finish, 3200); // hard cap, independent of the line timer
    var timer = setInterval(function () {
      if (i < LINES.length) {
        var li = document.createElement('li');
        li.innerHTML = '<span>' + esc(LINES[i][0]) + ' &nbsp;' + esc(LINES[i][1]) + '</span><b>ok</b>';
        log.appendChild(li);
        i++;
        var p = Math.round(i / LINES.length * 100);
        fill.style.width = p + '%'; pct.textContent = ('00' + p).slice(-3);
      } else { finish(); }
    }, 190);
  }
  function afterBoot() {
    if (started) return;
    started = true;
    startField();
    termIntro();
  }

  /* =====================================================================
     Init
     ===================================================================== */
  var y = $('#year'); if (y) y.textContent = String(new Date().getFullYear());
  var initial = 'en';
  try { initial = new URLSearchParams(location.search).get('lang') || store.get('mrz-lang') || 'en'; } catch (e) { /* ignore */ }
  $('#lang-toggle').addEventListener('click', function () { applyLang(lang === 'fa' ? 'en' : 'fa', true); });
  makeFormatters();
  applyLang(initial, false);
  loadData(false);
  // If the API neither answers nor fails within 9s, show the snapshot as offline.
  setTimeout(function () { if (data.state === 'loading') { data.state = 'offline'; render(); } }, 9000);
  runBoot(false);
})();
