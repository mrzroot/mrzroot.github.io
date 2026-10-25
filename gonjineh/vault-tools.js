/* gonjineh page glue: language, menu, copy, reveal, hero vault + particles, setup wizard, Persian playground, privacy bench.
   Everything here is local; no network. Simulations are labelled as such on the page. */
(function () {
'use strict';
var d = document, R = d.documentElement; R.classList.add('js');
var $ = function (s, c) { return (c || d).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || d).querySelectorAll(s)); };
var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, GJ = window.GJ;
var T = function (en, fa) { return R.lang === 'fa' ? fa : en; };
/* language */
var LB = $('#lang-toggle'), SR = $('#lang-sr');
function setLang(l, save) { R.lang = l === 'fa' ? 'fa' : 'en'; R.dir = l === 'fa' ? 'rtl' : 'ltr'; R.setAttribute('data-lang', R.lang); var t = R.getAttribute('data-title-' + R.lang); if (t) d.title = t; if (SR) SR.textContent = l === 'fa' ? 'Switch language to English' : 'تغییر زبان به فارسی'; if (save) { try { localStorage.setItem('mrz-lang', R.lang); } catch (e) {} } try { d.dispatchEvent(new CustomEvent('mrz-lang', { detail: R.lang })); } catch (e) {} }
setLang(R.lang, false);
if (LB) LB.addEventListener('click', function () { setLang(R.lang === 'fa' ? 'en' : 'fa', true); });
/* menu */
var MB = $('#menu-btn'), NV = $('#nav');
if (MB && NV) { MB.addEventListener('click', function () { var o = NV.classList.toggle('open'); MB.setAttribute('aria-expanded', o); }); $$('a', NV).forEach(function (a) { a.addEventListener('click', function () { NV.classList.remove('open'); MB.setAttribute('aria-expanded', 'false'); }); }); }
/* copy */
function copyText(t, b) { function ok() { b.classList.add('done'); setTimeout(function () { b.classList.remove('done'); }, 1400); } if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, function () {}); else { var a = d.createElement('textarea'); a.value = t; d.body.appendChild(a); a.select(); try { d.execCommand('copy'); ok(); } catch (e) {} a.remove(); } }
d.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('.cp'); if (!b) return; var pre = $('pre', b.parentNode); if (pre) copyText(pre.innerText.replace(/\n$/, ''), b); });
/* reveal + nav highlight */
var rv = $$('main .rvl');
if ('IntersectionObserver' in window && !RM) { var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -6% 0px' }); rv.forEach(function (e) { io.observe(e); }); setTimeout(function () { rv.forEach(function (e) { e.classList.add('in'); }); }, 5000); } else rv.forEach(function (e) { e.classList.add('in'); });
var secs = $$('main section[id]'), links = $$('.nav a');
if ('IntersectionObserver' in window) { var so = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + x.target.id); }); }); }, { rootMargin: '-40% 0px -55% 0px' }); secs.forEach(function (s) { so.observe(s); }); }
/* lazy init of the lab */
var lab = $('#lab');
if (lab) { if ('IntersectionObserver' in window) { var lo = new IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { window.VaultLab.init(); lo.disconnect(); } }, { rootMargin: '400px 0px' }); lo.observe(lab); } else window.VaultLab.init(); }
/* ---- note particles flying between panes ---- */
d.addEventListener('gj-fly', function (ev) {
  if (RM || !ev.detail) return; var a = ev.detail.from.getBoundingClientRect(), b = ev.detail.to.getBoundingClientRect();
  for (var k = 0; k < 4; k++) (function (k) {
    var e = d.createElement('div'); e.className = 'fly'; e.setAttribute('aria-hidden', 'true'); e.innerHTML = '<i></i><b></b>'; d.body.appendChild(e);
    var x0 = a.left + a.width * (.3 + .1 * k) - 18, y0 = a.top + a.height / 2 - 12, x1 = b.left + b.width * (.35 + .1 * k) - 18, y1 = b.top + b.height / 2 - 12, my = Math.min(y0, y1) - 70 - k * 18;
    var an = e.animate([{ transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.5) rotate(-10deg)', opacity: 0 }, { opacity: 1, offset: .15 }, { transform: 'translate(' + ((x0 + x1) / 2) + 'px,' + my + 'px) scale(1.1) rotate(8deg)', offset: .55 }, { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(.45) rotate(0)', opacity: 0 }], { duration: 950, delay: k * 90, easing: 'cubic-bezier(.45,.05,.3,1)', fill: 'both' });
    an.onfinish = function () { e.remove(); };
  })(k);
});
/* ---- hero: vault door opens, notes flow Alice -> brain -> Bob ---- */
(function () {
  var svg = $('#vault'); if (!svg) return;
  var pa = $('#fx-p1'), pb = $('#fx-p2'), g = $('#fx-parts'); if (!pa || !pb || !g) return;
  var N = 16, parts = [], NS = 'http://www.w3.org/2000/svg', la = pa.getTotalLength(), lb = pb.getTotalLength();
  for (var i = 0; i < N; i++) { var c = d.createElementNS(NS, 'rect'); c.setAttribute('width', 11); c.setAttribute('height', 8); c.setAttribute('rx', 1.5); c.setAttribute('class', 'pt ' + (i % 3 === 0 ? 'ruby' : 'gold')); g.appendChild(c); parts.push({ el: c, t: i / N, sp: .05 + (i % 5) * .006 }); }
  function place(p) { var t = p.t % 1, path = t < .5 ? pa : pb, L = t < .5 ? la : lb, u = (t < .5 ? t : t - .5) * 2, pt = path.getPointAtLength(u * L), s = .45 + Math.sin(u * Math.PI) * .75, a = (u - .5) * 40 * (t < .5 ? 1 : -1);
    p.el.setAttribute('transform', 'translate(' + (pt.x - 5.5).toFixed(1) + ' ' + (pt.y - 4).toFixed(1) + ') rotate(' + a.toFixed(0) + ' 5.5 4) scale(' + s.toFixed(2) + ')'); p.el.style.opacity = (Math.sin(u * Math.PI) * 1).toFixed(2); }
  if (RM) { parts.forEach(function (p, i) { p.t = (i + .5) / N; place(p); p.el.style.opacity = 1; }); svg.classList.add('opening', 'open', 'static'); return; }
  var run = true, last = 0;
  function frame(ts) { if (!run) return; var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; parts.forEach(function (p) { p.t += dt * p.sp * (svg.classList.contains('open') ? 1 : .15); place(p); }); requestAnimationFrame(frame); }
  parts.forEach(place);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !run) { run = true; last = 0; requestAnimationFrame(frame); } else if (!v) run = false; }).observe(svg);
  requestAnimationFrame(frame);
  function open() { svg.classList.add('opening'); setTimeout(function () { svg.classList.add('open'); }, 1150); }
  setTimeout(open, 350); var rb = $('#vault-replay'); if (rb) rb.addEventListener('click', function () { svg.classList.remove('open', 'opening'); void svg.getBoundingClientRect(); setTimeout(open, 80); });
  /* pointer parallax on the stage */
  var st = $('.stage'); if (st && matchMedia('(pointer:fine)').matches) st.addEventListener('pointermove', function (e) { var r = st.getBoundingClientRect(); st.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3)); st.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3)); });
})();
if (!GJ) return;
/* ---- setup wizard ---- */
(function () {
  var f = $('#wiz'); if (!f) return;
  var o1 = $('#wiz-1'), o2 = $('#wiz-2'), files = $('#wiz-files'), note = $('#wiz-note');
  function val(n) { var e = f.elements[n]; return e ? e.value : ''; }
  function chk(n) { return !!(f.elements[n] && f.elements[n].checked); }
  function run() {
    var area = (val('area') || 'backend').replace(/[^\w.-]/g, '') || 'backend', size = val('size') || 'team', claude = chk('claude'), codex = chk('codex'), mcp = chk('mcp'), recall = chk('recall'), local = chk('local');
    var flags = []; if (size !== 'solo') flags.push('--brain git@github.com:your-team/team-brain.git'); flags.push('--area ' + area);
    if (!claude) flags.push('--no-claude'); if (!mcp) flags.push('--no-mcp'); if (claude && !recall) flags.push('--no-prompt-recall'); if (claude && local) flags.push('--local-hooks');
    var me = ['gonjineh init'].concat(flags.filter(function (x) { return x.indexOf('--brain') !== 0; }));
    var first = 'gonjineh init ' + flags.join(' ') + (codex ? ' --codex' : '');
    var add = ['.gonjineh.json']; var inst = ['CLAUDE.md', 'AGENTS.md', 'GEMINI.md', '.github/copilot-instructions.md', '.cursor/rules/gonjineh.mdc']; add = add.concat(inst);
    if (mcp) add.push('.mcp.json', '.cursor/mcp.json', '.gemini/settings.json', '.vscode/mcp.json'); if (claude && !local) add.push('.claude/settings.json');
    var t1;
    if (size === 'solo') t1 = [first, '# solo: no remote, the brain is a local git repo; add one later with  gonjineh init --brain <url>'].join('\n');
    else t1 = [first, 'git add ' + add.join(' '), 'git commit -m "Add gonjineh" && git push'].join('\n');
    var t2 = size === 'solo' ? 'gonjineh search "login endpoint"\ngonjineh who-knows auth' : ['git pull', 'gonjineh init --area <your-area>' + (codex ? ' --codex' : '') + (claude && !recall ? ' --no-prompt-recall' : '') + (claude && local ? ' --local-hooks' : ''), 'gonjineh search "login endpoint"'].join('\n');
    $('code', o1).textContent = t1; $('code', o2).textContent = t2;
    var L = [['.gonjineh.json', T('project config (brain URL, areas)', 'پیکربندی پروژه (نشانی brain، حوزه‌ها)')], ['~ user config', T('your author name and brain clone path (not committed)', 'نام نویسنده و مسیر کلون brain (کامیت نمی‌شود)')]];
    inst.forEach(function (x) { L.push([x, T('instruction block: "search before you assume"', 'بلوک دستورالعمل: «پیش از فرض، جست‌وجو کن»')]); });
    if (mcp) ['.mcp.json', '.cursor/mcp.json', '.gemini/settings.json', '.vscode/mcp.json'].forEach(function (x) { L.push([x, T('MCP server entry (5 tools)', 'ورودی سرور MCP (۵ ابزار)')]); });
    if (claude) L.push([local ? '.claude/settings.local.json' : '.claude/settings.json', T('5 hooks: SessionStart, UserPromptSubmit' + (recall ? '' : ' (off)') + ', Stop, SessionEnd, PreCompact', '۵ هوک: SessionStart، UserPromptSubmit' + (recall ? '' : ' (خاموش)') + '، Stop، SessionEnd، PreCompact')]);
    if (codex) L.push(['~/.codex/config.toml', T('notify hook + MCP server (user-level, between markers)', 'هوک notify + سرور MCP (سطح کاربر، میان نشانه‌ها)')]);
    files.textContent = ''; L.forEach(function (r) { var li = d.createElement('li'), c = d.createElement('code'); c.textContent = r[0]; var s = d.createElement('span'); s.textContent = r[1]; li.appendChild(c); li.appendChild(s); files.appendChild(li); });
    var picks = ['claude', 'codex', 'gemini', 'cursor', 'copilot'].filter(chk), msgs = [];
    if (chk('codex')) msgs.push(T('Codex: no session-start hook exists, so it gets the AGENTS.md block plus the MCP tool search_memory; capture happens through its notify hook.', 'Codex: هوک شروع نشست ندارد؛ بلوک AGENTS.md و ابزار MCP به نام search_memory را می‌گیرد و ثبت با هوک notify انجام می‌شود.'));
    if (chk('gemini')) msgs.push(T('Gemini CLI: MCP + GEMINI.md only; capture is manual (gonjineh capture --format gemini, best-effort parser).', 'Gemini CLI: فقط MCP و GEMINI.md؛ ثبت دستی است (تحلیل‌گر تقریبی).'));
    if (chk('cursor') || chk('copilot')) msgs.push(T('Cursor / Copilot: config files are written but were never launched in my tests; use gonjineh note or MCP add_note to record.', 'Cursor / Copilot: فایل‌های پیکربندی نوشته می‌شود اما هرگز اجرا نشده؛ برای ثبت از gonjineh note یا add_note استفاده کنید.'));
    if (size === 'many') msgs.push(T('Bigger teams: every person picks their own --area. Entries are one file per author and session, so rebases do not conflict; sync is debounced 45 s and retried 4 times.', 'تیم بزرگ‌تر: هر نفر --area خودش را برمی‌دارد. هر ورودی یک فایلِ جدا برای هر نویسنده و نشست است، پس rebase تداخل ندارد؛ همگام‌سازی ۴۵ ثانیه تأخیر دارد و ۴ بار تلاش می‌شود.'));
    msgs.push(T('init always writes all five instruction files and (unless unticked) all four MCP files, so a mixed-tool team shares one commit. Ticking tools here only changes the flags.', 'init همیشه هر پنج فایل دستورالعمل و (مگر خاموش شود) هر چهار فایل MCP را می‌نویسد، پس تیمِ چند‌ابزاره یک کامیت مشترک دارد. تیک ابزارها فقط پرچم‌ها را عوض می‌کند.'));
    note.textContent = ''; msgs.forEach(function (m) { var p = d.createElement('p'); p.textContent = m; note.appendChild(p); });
    f.setAttribute('data-picks', picks.join(','));
  }
  f.addEventListener('input', run); f.addEventListener('change', run); d.addEventListener('mrz-lang', run); run();
})();
/* ---- Persian playground (uses the real normalize/tokenize/search of the tool) ---- */
(function () {
  var inp = $('#fa-in'); if (!inp) return;
  var SEED = window.GJ_SEED || [], target = SEED.filter(function (e) { return e.id === '777476f6bf'; });
  function vis(s) { return Array.from(s).map(function (c) { var n = c.codePointAt(0); if (n === 0x200c) return '‹ZWNJ›'; if (n === 0x200d) return '‹ZWJ›'; if (n === 0x200f || n === 0x200e) return '‹' + (n === 0x200f ? 'RLM' : 'LRM') + '›'; if (n === 0x640) return '‹TATWEEL›'; if (n === 0xa0) return '‹NBSP›'; return c; }).join(''); }
  function naive(s) { return s.toLowerCase().split(/[\s.,;:!?()\[\]{}"'«»،؛؟\/\\-]+/).filter(Boolean); }
  function run() {
    var v = inp.value, n = GJ.normalize(v), tk = GJ.tokenize(v);
    $('#fa-raw').textContent = vis(v) || '—'; $('#fa-norm').textContent = n || '—';
    var box = $('#fa-tok'); box.textContent = ''; tk.forEach(function (t) { var s = d.createElement('span'); s.textContent = t; box.appendChild(s); }); if (!tk.length) box.textContent = '—';
    var hit = GJ.search(target, v, {}), sc = hit.length ? hit[0].score : 0;
    var doc = new Set(naive((target[0].title + ' ' + target[0].outcome + ' ' + target[0].files.join(' ') + ' ' + target[0].endpoints.join(' ')))), nv = naive(v).filter(function (w) { return doc.has(w); });
    $('#fa-cmp').textContent = T('gonjineh score against the Persian note "' + target[0].title.slice(0, 22) + '…": ' + sc.toFixed(2) + '  ·  naive split-and-lowercase would match ' + nv.length + ' word(s)', 'امتیاز گنجینه در برابر یادداشت فارسی «' + target[0].title.slice(0, 22) + '…»: ' + sc.toFixed(2) + '  ·  تقسیم و حروف‌کوچک‌سازی ساده ' + nv.length + ' واژه را تطبیق می‌داد');
    $('#fa-cmp').className = 'cmp-line ' + (sc > 0 && !nv.length ? 'win' : '');
  }
  inp.addEventListener('input', run); $$('#fa-presets button').forEach(function (b) { b.addEventListener('click', function () { inp.value = b.getAttribute('data-v').replace(/\\u200c/g, '\u200c'); run(); inp.focus(); }); }); d.addEventListener('mrz-lang', run); run();
})();
/* ---- privacy bench ---- */
(function () {
  var f = $('#priv'); if (!f) return;
  var KEY = 'sk_' + 'live_' + '51HqXv9TnLm2PzR4aB7cD8eF';
  var FILES = ['api/contracts/auth.yaml', 'web/api/auth.ts', 'web/components/LoginButton.tsx', 'web/mocks/auth.ts', '.env.local'];
  function sess(priv) { return { tool: 'claude-code', sessionId: 'alice-priv', cwd: '/home/alice/shop-app', branch: 'feat/login-button', ended: '2026-10-25T21:30:00', messages: [['user', 'Add a login button to the header: phone number + OTP.' + (priv ? ' #private' : '') + '\nMy sandbox SMS key is ' + KEY + ', put it in .env.local.'], ['assistant', 'The button calls POST /api/auth/login with {phone, otp}. I decided to write the contract in api/contracts/auth.yaml. Careful: normalize the phone to 09xxxxxxxxx.']], toolCalls: FILES.map(function (p) { return ['Write', { file_path: p }]; }) }; }
  function run() {
    var ig = []; if (f.elements.env.checked) ig.push('.env*'); if (f.elements.mocks.checked) ig.push('web/mocks/**');
    $('#bi-file').textContent = ig.length ? ig.join('\n') : T('(empty)', '(خالی)');
    var r = GJ.digest(sess(f.elements.priv.checked), { author: 'alice', project: 'shop-app', defaultArea: 'frontend', ignore: ig }), ul = $('#priv-files'); ul.textContent = '';
    FILES.forEach(function (p) { var gone = ig.some(function (g) { return GJ.fnmatch(p, g) || GJ.fnmatch(p.split('/').pop(), g); }) || !r; var li = d.createElement('li'); li.className = gone ? 'gone' : ''; li.textContent = p; ul.appendChild(li); });
    var o = $('#priv-note'); if (!r) { o.textContent = T('No note written. The whole session was marked #private, nothing leaves this machine.', 'هیچ یادداشتی نوشته نشد. کل نشست #private علامت خورده و چیزی از این دستگاه بیرون نمی‌رود.'); o.className = 'note-out empty'; }
    else { o.className = 'note-out'; o.innerHTML = ''; var pre = d.createElement('pre'), txt = GJ.render(r.entry), parts = txt.split(/(\[REDACTED:[a-z-]+\])/); parts.forEach(function (s) { if (/^\[REDACTED/.test(s)) { var m = d.createElement('mark'); m.className = 'redacted'; m.textContent = s; pre.appendChild(m); } else pre.appendChild(d.createTextNode(s)); }); o.appendChild(pre); }
  }
  f.addEventListener('change', run); d.addEventListener('mrz-lang', run); run();
  /* scrub bench */
  var si = $('#sb-in'), so = $('#sb-out'), sn = $('#sb-n');
  function bench() { var rp = { c: {}, hit: function (k) { rp.c[k] = (rp.c[k] || 0) + 1; } }, out = GJ.scrub(si.value, { report: rp }), ks = Object.keys(rp.c); so.textContent = ''; out.split(/(\[REDACTED:[a-z-]+\])/).forEach(function (s) { if (/^\[REDACTED/.test(s)) { var m = d.createElement('mark'); m.className = 'redacted'; m.textContent = s; so.appendChild(m); } else so.appendChild(d.createTextNode(s)); }); sn.textContent = ks.length ? ks.map(function (k) { return k + ' ×' + rp.c[k]; }).join(' · ') : T('nothing to mask', 'چیزی برای پوشاندن نیست'); }
  if (si) { si.addEventListener('input', bench); $$('#sb-presets button').forEach(function (b) { b.addEventListener('click', function () { si.value = b.getAttribute('data-v').replace('{KEY}', KEY); bench(); si.focus(); }); }); si.value = 'export STRIPE_KEY=' + KEY + '\nmail me at alice@example.com or call +98 912 345 6789'; bench(); }
})();
  document.querySelectorAll('.code pre,.note-out,.nfile,.mclog,.sb-out,.tm-out,.glog,.gtree,.tblw').forEach(function (e) { e.setAttribute('tabindex', '0'); });
})();
