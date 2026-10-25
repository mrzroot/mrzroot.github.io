/* gonjineh vault lab: two simulated terminals + a shared "brain" repo, all in the browser.
   REAL logic (JS port in gj.js, parity-checked against the Python tool): scrub, digest, BM25 search, who-knows, per-prompt hook gate, note rendering.
   SCRIPTED (a simulation): the AI replies, the terminal look-alikes and the git remote. No model is called and nothing touches the network. */
(function () {
'use strict';
var GJ = window.GJ, SEED = window.GJ_SEED, R = document.documentElement;
if (!GJ || !SEED) return;
var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
var T = function (en, fa) { return R.lang === 'fa' ? fa : en; };
var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var KEY = 'sk_' + 'live_' + '51HqXv9TnLm2PzR4aB7cD8eF';
var BASE_IDS = ['820363512b', '010f2737e4', '777476f6bf', 'a51ce27a07'];
var BASE = SEED.filter(function (e) { return BASE_IDS.indexOf(e.id) >= 0; });
var PROJECT = 'shop-app', TODAY = '2026-10-25';
var P_ALICE = 'Add a login button to the header: phone number + OTP.\nMy sandbox SMS key is ' + KEY + ', put it in .env.local.';
var P_BOB = 'Add the login endpoint for the app.';

/* ---------- small ports of store.briefing / paths / git-log ---------- */
function briefing(entries, me) {
  var mine = !entries.some(function (e) { return e.author !== me; });
  var o = (mine ? entries : entries.filter(function (e) { return e.author !== me; })).slice().sort(function (a, b) { return (b.date + b.id) < (a.date + a.id) ? -1 : 1; }).slice(0, 6);
  if (!o.length) return '';
  var out = ['Team brain (gonjineh): ' + (mine ? 'recent entries (only yours so far)' : 'recent work by your teammates in this project') + '. Search before you assume something is missing: `gonjineh search "<words>"` or MCP tool search_memory.'];
  o.forEach(function (e) { var b = '- ' + e.date + ' ' + e.author + ' [' + e.area + '] ' + e.title; if ((e.files || []).length) b += ' (files: ' + e.files.slice(0, 3).join(', ') + ')'; if ((e.endpoints || []).length) b += ' (api: ' + e.endpoints.slice(0, 3).join(', ') + ')'; out.push(b); });
  var t = out.join('\n'); return t.length <= 1800 ? t : t.slice(0, 1799) + '…';
}
function pathOf(e) { return 'entries/' + e.project + '/' + e.area + '/' + e.date + '-' + e.author + '-' + e.tool + '-' + e.id + '.md'; }
function hash7(s) { return GJ.sha1hex('c:' + s).slice(0, 7); }
function short(e, withScore) { var s = '[' + e.id + '] ' + e.date + ' ' + e.author + ' (' + e.tool + ') · ' + e.area + ' · ' + e.title + (withScore ? '  (score ' + e.score + ')' : ''); if ((e.files || []).length) s += '\n    files: ' + e.files.slice(0, 5).join(', '); if ((e.endpoints || []).length) s += '\n    api:   ' + e.endpoints.slice(0, 5).join(', '); if ((e.decisions || []).length) s += '\n    decision: ' + e.decisions[0].slice(0, 160); return s; }
function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id.indexOf(id) === 0) return list[i]; return null; }
function upsert(list, e) { for (var i = 0; i < list.length; i++) if (list[i].id === e.id) { list[i] = e; return 'updated'; } list.push(e); return 'new'; }

/* ---------- state ---------- */
var S, TA, TB, mcpLog;
function fresh() {
  S = { remote: BASE.slice(), commits: BASE.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).map(function (e) { return { h: hash7(e.id), id: e.id, who: e.author, msg: e.title, state: 'pushed' }; }), sel: null, steps: {}, compare: {} };
  mcpLog = [];
}

/* ---------- terminal ---------- */
function Term(root, cfg) {
  var t = this; t.root = root; t.name = cfg.name; t.tool = cfg.tool; t.area = cfg.area; t.out = $('.tm-out', root); t.inp = $('.tm-in', root); t.form = $('form', root);
  t.q = []; t.timer = null; t.busy = 0; t.sess = null; t.n = 0; t.clone = BASE.slice(); t.unpushed = []; t.on = true; t.hist = []; t.hi = 0;
  t.form.addEventListener('submit', function (ev) { ev.preventDefault(); var v = t.inp.value; t.inp.value = ''; if (v.trim()) t.exec(v, true); });
  t.inp.addEventListener('keydown', function (ev) { if (ev.key === 'ArrowUp' && t.hist.length) { t.hi = Math.max(0, t.hi - 1); t.inp.value = t.hist[t.hi] || ''; ev.preventDefault(); } else if (ev.key === 'ArrowDown') { t.hi = Math.min(t.hist.length, t.hi + 1); t.inp.value = t.hist[t.hi] || ''; ev.preventDefault(); } });
  t.out.addEventListener('click', function () { t.flush(); });
}
Term.prototype.reset = function () { this.q = []; clearTimeout(this.timer); this.timer = null; this.busy = 0; this.sess = null; this.n = 0; this.clone = BASE.slice(); this.unpushed = []; this.out.textContent = ''; this.root.setAttribute('data-busy', '0'); this.inp.value = ''; };
Term.prototype.line = function (text, cls) { var d = document.createElement('div'); d.className = 'ln' + (cls ? ' ' + cls : ''); d.textContent = text; this.out.appendChild(d); this.out.scrollTop = this.out.scrollHeight; return d; };
Term.prototype.say = function (lines, cls, gap) { var t = this; (Array.isArray(lines) ? lines : String(lines).split('\n')).forEach(function (l) { t.q.push({ l: l, c: cls, g: gap }); }); t.pump(); };
Term.prototype.cmd = function (fn, wait) { this.q.push({ fn: fn, g: wait || 0 }); this.pump(); };
Term.prototype.pump = function () {
  var t = this; if (t.timer || !t.q.length) { return; }
  t.busy = 1; t.root.setAttribute('data-busy', '1');
  (function step() {
    var it = t.q.shift();
    if (!it) { t.timer = null; t.busy = 0; t.root.setAttribute('data-busy', '0'); t.root.dispatchEvent(new CustomEvent('idle')); return; }
    if (it.fn) it.fn(); else t.line(it.l, it.c);
    var g = RM || window.__GJ_FAST ? 0 : (it.g === undefined ? 16 : it.g);
    t.timer = setTimeout(function () { step(); }, g);
  })();
};
Term.prototype.flush = function () { var t = this; if (!t.q.length) return; clearTimeout(t.timer); t.timer = null; while (t.q.length) { var it = t.q.shift(); if (it.fn) it.fn(); else t.line(it.l, it.c); } t.busy = 0; t.root.setAttribute('data-busy', '0'); t.root.dispatchEvent(new CustomEvent('idle')); };
Term.prototype.idle = function () { var t = this; return new Promise(function (res) { if (!t.busy && !t.q.length) return res(); t.root.addEventListener('idle', function f() { t.root.removeEventListener('idle', f); res(); }); }); };
Term.prototype.type = function (text, then) {
  var t = this, i = 0, first = text.split('\n')[0];
  if (RM || window.__GJ_FAST) { t.inp.value = first; then(); return; }
  t.inp.value = ''; t.busy = 1; t.root.setAttribute('data-busy', '1');
  var iv = setInterval(function () { i += 2; t.inp.value = first.slice(0, i); if (i >= first.length) { clearInterval(iv); t.busy = 0; t.root.setAttribute('data-busy', '0'); then(); } }, 14);
};
/* a chip: type the text into the prompt, then submit it as if the visitor had typed it */
Term.prototype.auto = function (text, full) { var t = this; return new Promise(function (res) { t.type(text, function () { t.inp.value = ''; t.exec(full || text, true); t.idle().then(res); }); }); };

/* ---------- command dispatch ---------- */
Term.prototype.prompt = function () { return this.name + '@' + (this.name === 'alice' ? 'laptop' : 'desktop') + ' ' + (this.sess ? '›' : '$'); };
Term.prototype.exec = function (raw, echo) {
  var t = this, v = raw.trim(); t.hist.push(v); t.hi = t.hist.length;
  if (t.sess) { t.say(v.split('\n')[0] + (v.indexOf('\n') > 0 ? ' …' : ''), 'u'); } else t.say(t.prompt() + ' ' + v, 'cmd');
  var m = /^gonjineh(?:\s+(.*))?$/i.exec(v);
  if (m) return t.cli((m[1] || '').trim());
  if (/^clear$/i.test(v)) return t.cmd(function () { t.out.textContent = ''; });
  if (/^\/(exit|quit)$/i.test(v)) return t.sess ? t.end() : t.say('no session to end', 'dim');
  if (/^(claude|codex)\b/i.test(v) && !t.sess) return t.start();
  if (/^help$/i.test(v)) return t.say(['gonjineh search "<words>"   gonjineh who <file|endpoint|area>   gonjineh recall', 'gonjineh capture   gonjineh sync   gonjineh show <id>   gonjineh note "<text>"', 'gonjineh scrub "<text>"   gonjineh doctor   gonjineh init', 'anything else is sent to the (scripted) AI once a session is running'], 'dim');
  if (!t.sess) return t.say(T('No session is running. Press "Start session" (or type: ' + (t.tool === 'codex' ? 'codex' : 'claude') + ').', 'هیچ نشستی در جریان نیست. «شروع نشست» را بزنید (یا بنویسید: ' + (t.tool === 'codex' ? 'codex' : 'claude') + ').'), 'er');
  t.ask(v);
};
Term.prototype.cli = function (a) {
  var t = this, m = /^(\S+)\s*(.*)$/.exec(a) || [0, '', ''], c = m[1], rest = m[2].replace(/^["']|["']$/g, '');
  if (c === 'who-knows') c = 'who';
  var entries = t.clone;
  if (!c || c === '--help' || c === '-h') return t.say(['usage: gonjineh [-h] {init,capture,note,sync,search,recall,who,show,scrub,doctor,mcp} ...', '(simulated subset: search, recall, who, show, capture, sync, note, scrub, doctor, init)'], 'dim');
  if (c === 'search') {
    if (!rest) return t.say('usage: gonjineh search QUERY...', 'er');
    var hits = GJ.search(entries.filter(function (e) { return e.project === PROJECT; }), rest, { limit: 8 });
    return t.say(hits.length ? hits.map(function (h) { return short(h, true); }).join('\n') : 'no matches');
  }
  if (c === 'recall') return t.say(briefing(entries, t.name) || 'brain is empty');
  if (c === 'who') { if (!rest) return t.say('usage: gonjineh who TARGET', 'er'); var w = GJ.whoKnows(entries, rest); return t.say(w.length ? w.map(function (r) { return r.author + ': ' + r.entries + ' entries (last ' + r.last + '; ' + r.tools.join(', ') + ')'; }) : ['nobody has recorded work on that']); }
  if (c === 'show') { var e = byId(entries, rest); if (!e) return t.say('not found', 'er'); return t.say(GJ.render(e).split('\n')); }
  if (c === 'capture') return t.capture(false);
  if (c === 'sync') return t.sync();
  if (c === 'note') { if (!rest) return t.say('usage: gonjineh note TEXT', 'er'); return t.note(rest); }
  if (c === 'scrub') { var rp = { c: {} }, out = GJ.scrub(rest, { report: { c: rp.c, hit: function (k) { rp.c[k] = (rp.c[k] || 0) + 1; } } }); return t.say([out, Object.keys(rp.c).length ? '# masked: ' + Object.keys(rp.c).map(function (k) { return k + '×' + rp.c[k]; }).join(', ') : '# nothing to mask'], 'ok'); }
  if (c === 'doctor') return t.say(['brain      : ~/team-brain (origin git@github.com:acme/team-brain.git)', 'author     : ' + t.name + ' · area ' + t.area, 'hooks      : ' + (t.tool === 'codex' ? 'codex notify → gonjineh hook (user-level)' : 'claude: SessionStart UserPromptSubmit Stop SessionEnd PreCompact'), 'mcp        : search_memory read_entry add_note who_knows_about recent', 'entries    : ' + entries.length + ' in this clone', '(simulated output)'], 'dim');
  if (c === 'init') return t.say(['wrote CLAUDE.md AGENTS.md GEMINI.md .github/copilot-instructions.md .cursor/rules/gonjineh.mdc', 'wrote .claude hooks (5 events) · .mcp.json .cursor/mcp.json .gemini/settings.json .vscode/mcp.json', '(simulated output; see the setup wizard below for the exact command)'], 'dim');
  if (c === 'mcp') return t.say('gonjineh mcp speaks JSON-RPC on stdio. In this page: use the MCP panel on the right.', 'dim');
  t.say("gonjineh: error: argument command: invalid choice: '" + c + "'", 'er');
};

/* ---------- sessions ---------- */
Term.prototype.start = function () {
  var t = this; if (t.sess) return t.say('a session is already running', 'dim');
  t.n++; t.sess = { id: t.name + '-s' + t.n, cwd: '/home/' + t.name + '/shop-app', branch: t.name === 'alice' ? 'feat/login-button' : 'feat/login-endpoint', messages: [], toolCalls: [], tool: t.tool, hooked: false };
  t.root.setAttribute('data-session', '1'); markStep(t.name === 'alice' ? 'a-start' : 'b-start');
  var cc = t.tool === 'claude-code';
  function box(ls) { var w = 46; return ['╭' + '─'.repeat(w) + '╮'].concat(ls.map(function (l) { return '│ ' + l + ' '.repeat(Math.max(0, w - 1 - l.length)) + '│'; }), ['╰' + '─'.repeat(w) + '╯']); }
  t.say(cc ? box(['✻ Claude Code · look-alike · NO MODEL', '  ~/shop-app · ' + t.sess.branch]) : box(['>_ Codex · look-alike · NO MODEL', '   ~/shop-app · ' + t.sess.branch]), 'box', 30);
  if (!t.on) return t.say('(gonjineh is off for this run: no hooks, no AGENTS.md block, no MCP server)', 'dim');
  if (cc) {
    t.say('⚙ hook SessionStart → gonjineh hook (git pull in the brain, 4 s max)', 'hook', 120);
    t.cmd(function () { if (t.name === 'bob' || true) { /* a real SessionStart pulls first */ var before = t.clone.length; t.pullInto(); var n = t.clone.length - before; if (n > 0) t.line('  pulled ' + n + ' new ' + (n === 1 ? 'entry' : 'entries') + ' from origin/main', 'hook'); } }, 120);
    t.cmd(function () { var b = briefing(t.clone, t.name); t.line('┌ injected into the model context ─────────────', 'ctx'); (b || 'brain is empty').split('\n').forEach(function (l) { t.line('│ ' + l, 'ctx'); }); t.line('└──────────────────────────────────────────────', 'ctx'); }, 60);
  } else {
    t.say(['AGENTS.md → gonjineh block loaded: "Before you assume a feature or endpoint is missing, call the MCP tool search_memory."', 'MCP server gonjineh: 5 tools ready', 'note: Codex has no session-start hook, so nothing is injected here. The model has to call search_memory itself.'], 'hook', 100);
  }
};
Object.defineProperty(Term.prototype, 'session', { get: function () { return this.sess; } });
Term.prototype.pullInto = function () { var t = this; S.remote.forEach(function (e) { if (!byId(t.clone, e.id) || byId(t.clone, e.id) !== e) { var i = -1; t.clone.forEach(function (c, k) { if (c.id === e.id) i = k; }); if (i < 0) t.clone.push(e); else t.clone[i] = e; } }); render(); };
Term.prototype.end = function () {
  var t = this; if (!t.sess) return t.say('no session to end', 'dim');
  t.say(t.tool === 'codex' ? '✔ turn complete' : '✻ session ended', 'dim', 120);
  if (t.on) { t.say(t.tool === 'codex' ? '⚙ notify → gonjineh hook agent-turn-complete' : '⚙ hook SessionEnd → gonjineh hook', 'hook', 120); t.capture(true); }
  t.cmd(function () { t.sess = null; t.root.setAttribute('data-session', '0'); markStep(t.name === 'alice' ? 'a-end' : 'b-end'); }, 0);
};
Term.prototype.capture = function (viaHook) {
  var t = this, s = t.sess;
  t.cmd(function () {
    if (!s || !s.messages.length) { t.line('capture: no transcript yet (ask the AI something first)', 'er'); return; }
    var tr = { tool: s.tool, sessionId: s.id, cwd: s.cwd, branch: s.branch, ended: TODAY + 'T21:30:00', messages: s.messages, toolCalls: s.toolCalls };
    var r = GJ.digest(tr, { author: t.name, project: PROJECT, defaultArea: t.area });
    if (!r) { t.line('skipped: session marked #private, only ignored files, or no signal (nothing was written)', 'ok'); render(); return; }
    var e = r.entry, st = upsert(t.clone, e); if (t.unpushed.indexOf(e.id) < 0) t.unpushed.push(e.id);
    t.line('digest  : ' + e.files.length + ' files · ' + e.endpoints.length + ' endpoint(s) · ' + e.decisions.length + ' decision(s) · ' + e.gotchas.length + ' gotcha(s) · ' + e.todos.length + ' TODO(s)', 'hook');
    var ks = Object.keys(r.report); t.line('scrub   : ' + (ks.length ? ks.map(function (k) { return k + ' ×' + r.report[k] + ' masked'; }).join(', ') : 'nothing to mask'), ks.length ? 'scr' : 'hook');
    t.line('filed   : ' + pathOf(e) + (st === 'updated' ? '  (updated)' : ''), 'ok');
    t.line(viaHook ? 'sync    : scheduled in 45 s (debounced); run `gonjineh sync` to push now' : 'stored ' + e.id + ' area=' + e.area + ' files=' + e.files.length + ' redactions=' + ks.reduce(function (n, k) { return n + r.report[k]; }, 0), 'hook');
    S.sel = e.id; markStep(t.name === 'alice' ? 'a-cap' : 'b-cap'); render(true); fly(t.root, $('#brain'));
  }, 80);
};
Term.prototype.sync = function () {
  var t = this;
  t.say(['$ git fetch origin', '$ git rebase origin/main', '$ git push origin main'], 'dim', 140);
  t.cmd(function () {
    var committed = t.unpushed.length > 0, pulled = S.remote.some(function (e) { return !byId(t.clone, e.id); });
    t.unpushed.forEach(function (id) { var e = byId(t.clone, id); upsert(S.remote, e); var c = null; S.commits.forEach(function (x) { if (x.id === id) c = x; }); if (c) c.msg = e.title; else S.commits.push({ h: hash7(id + e.date), id: id, who: e.author, msg: e.title, state: 'pushed', fresh: 1 }); });
    var pushed = committed; t.unpushed = []; t.pullInto();
    t.line(JSON.stringify({ committed: committed, pulled: pulled, pushed: pushed, remote: true, error: '' }), 'ok');
    markStep(t.name === 'alice' ? 'a-sync' : 'b-sync'); render(true); if (pushed) fly(t.root, $('#brain')); if (pulled) fly($('#brain'), t.root);
  }, 80);
};
Term.prototype.note = function (text) {
  var t = this;
  t.cmd(function () {
    var rp = { c: {} }, clean = GJ.scrub(text, { report: { c: rp.c, hit: function (k) { rp.c[k] = (rp.c[k] || 0) + 1; } } });
    var e = { id: GJ.sha1hex('note:' + t.name + ':' + text).slice(0, 10), title: clean.split('\n')[0].slice(0, 90), author: t.name, tool: 'mcp-note', session: 'note', date: TODAY, project: PROJECT, area: t.area, areas: [t.area], branch: '', files: [], endpoints: [], tags: [], asks: [], outcome: '', decisions: [], gotchas: [], todos: [], commands: [], text: clean, turns: 0 };
    upsert(t.clone, e); t.unpushed.push(e.id); var ks = Object.keys(rp.c);
    t.line('saved ' + e.id + ' area=' + e.area + (ks.length ? ' redacted=' + JSON.stringify(rp.c) : ''), 'ok'); render(true);
  }, 60);
};

/* ---------- the scripted AI ---------- */
Term.prototype.ask = function (prompt) {
  var t = this, s = t.sess, cc = t.tool === 'claude-code', intent = /login|log in|sign.?in|لاگین|ورود/i.test(prompt);
  s.messages.push(['user', prompt]);
  var ctxText = '';
  if (t.on && cc) {
    var hc = GJ.hookContext(t.clone.filter(function (e) { return e.project === PROJECT; }), prompt, t.name);
    t.say('⚙ hook UserPromptSubmit → gonjineh hook', 'hook', 140);
    if (hc.hits.length) { ctxText = hc.text; t.cmd(function () { t.line('┌ added to the model context (' + hc.hits.length + ' related note' + (hc.hits.length > 1 ? 's' : '') + ' by teammates) ─', 'ctx'); hc.text.split('\n').forEach(function (l) { t.line('│ ' + l, 'ctx'); }); t.line('└──────────────────────────────────────────────', 'ctx'); }, 80); }
    else t.say('  no teammate note passed the relevance gate; nothing injected', 'hook', 60);
  }
  if (!intent) { t.say(['● (simulation) No model is running here. I only have scripted replies for the login scenario;', '  your text was still recorded in this session, so capture / scrub / #private all work on it.'], 'ai', 90); s.messages.push(['assistant', 'Noted.']); return; }
  if (t.name === 'alice') return t.aliceReply(s);
  t.bobReply(s, cc, ctxText);
};
Term.prototype.edit = function (verb, file, note) { var t = this; t.say('● ' + verb + '(' + file + ')' + (note ? '  ' + note : ''), 'tool', 150); };
Term.prototype.aliceReply = function (s) {
  var t = this, sec = KEY;
  t.say('● I will add the button, a typed API client, and write the contract down for the backend.', 'ai', 200);
  t.edit('Write', 'api/contracts/auth.yaml', '⎿ wrote 28 lines'); t.edit('Write', 'web/api/auth.ts', '⎿ wrote 31 lines'); t.edit('Edit', 'web/components/LoginButton.tsx', '⎿ +46 lines'); t.edit('Edit', 'web/mocks/auth.ts', '⎿ +12 lines');
  t.edit('Bash', 'echo "SMS_KEY=' + sec + '" >> .env.local'); t.edit('Bash', 'npm test -- LoginButton', '⎿ 3 passed');
  var final = 'I added LoginButton in web/components/LoginButton.tsx and a typed client in web/api/auth.ts. The button calls POST /api/auth/login with {phone, otp} and expects {token}. I decided to write the contract down in api/contracts/auth.yaml so the backend can implement it without guessing. Careful: the phone number must be normalized to 09xxxxxxxxx before it is sent. TODO: the backend endpoint POST /api/auth/login does not exist yet, so I mocked it in web/mocks/auth.ts.';
  t.say('● ' + final, 'ai', 200);
  t.cmd(function () {
    s.messages.push(['assistant', final]);
    [['Write', 'api/contracts/auth.yaml'], ['Write', 'web/api/auth.ts'], ['Edit', 'web/components/LoginButton.tsx'], ['Edit', 'web/mocks/auth.ts']].forEach(function (x) { s.toolCalls.push([x[0], { file_path: x[1] }]); });
    s.toolCalls.push(['Bash', { command: 'echo "SMS_KEY=' + sec + '" >> .env.local' }], ['Bash', { command: 'npm test -- LoginButton' }]);
    markStep('a-ask');
  }, 0);
};
Term.prototype.mcp = function (from, name, args) { var out = mcpCall(this, name, args); mcpLog.push({ from: from, name: name, args: args, out: out }); renderMcp(); return out; };
Term.prototype.bobReply = function (s, cc, ctxText) {
  var t = this, query = 'login endpoint', found = null, hitsOut = '';
  if (t.on && !cc) {
    t.say('● Before writing code I will check the team brain (AGENTS.md asks for it).', 'ai', 200);
    t.cmd(function () {
      hitsOut = t.mcp('bob · codex', 'search_memory', { query: query });
      t.line('● mcp gonjineh.search_memory({"query":"' + query + '"})', 'tool');
      hitsOut.split('\n').forEach(function (l) { t.line('  ⎿ ' + l, 'ctx'); });
      found = GJ.search(t.clone, query, { limit: 6 }).filter(function (h) { return h.author !== t.name && /login/.test((h.endpoints || []).join(' ')); })[0] || null;
    }, 120);
  } else if (t.on && cc) { found = GJ.hookContext(t.clone, s.messages[s.messages.length - 1][1], t.name).hits.filter(function (h) { return /login/.test((h.endpoints || []).join(' ')); })[0] || null; }
  t.cmd(function () {
    var alice = t.clone.some(function (e) { return e.author === 'alice' && /login/.test((e.endpoints || []).join(' ')); }), remoteHas = S.remote.some(function (e) { return e.author === 'alice'; });
    var reply, calls, verdict, res;
    if (found) {
      var ep = found.endpoints[0].replace(/^[A-Z]+ /, ''), contract = (found.files.filter(function (f) { return /contract/.test(f); })[0] || 'api/contracts/auth.yaml');
      t.line('● ' + found.author + "'s frontend already calls POST " + ep + ' with {phone, otp} → {token}; the contract is ' + contract + '. I will implement exactly that instead of inventing a route.', 'ai');
      t.line('● Bash(git show origin/' + (found.branch || 'feat/login-button') + ':' + contract + ')', 'tool'); t.line('● ' + (t.tool === 'codex' ? 'apply_patch' : 'Edit') + '(server/routes/auth.py)  ⎿ +POST ' + ep + ' {phone, otp} → {token}', 'tool'); t.line('● ' + (t.tool === 'codex' ? 'apply_patch' : 'Write') + '(server/tests/test_login.py)  ⎿ +3 tests', 'tool');
      res = { ok: true, route: 'POST ' + ep, body: '{phone, otp} → {token}', why: T('Reused the contract from ' + found.author + "'s note.", 'قرارداد یادداشت ' + found.author + ' دوباره استفاده شد.') };
      reply = 'I implemented POST ' + ep + ' with {phone, otp} and {token} as in ' + contract + '.';
    } else {
      t.line('● I will add a login endpoint.', 'ai');
      t.line('● ' + (t.tool === 'codex' ? 'apply_patch' : 'Write') + '(server/routes/login.py)  ⎿ +POST /api/login {username, password} → {session}', 'tool'); t.line('● ' + (t.tool === 'codex' ? 'apply_patch' : 'Write') + '(server/tests/test_login.py)  ⎿ +3 tests', 'tool');
      res = { ok: false, route: 'POST /api/login', body: '{username, password} → {session}', why: alice ? T('The note was there, but nothing surfaced it: gonjineh is off or the clone is stale.', 'یادداشت بود اما چیزی آن را نشان نداد: گنجینه خاموش است یا کلون کهنه است.') : T('No teammate note was in this clone yet (Alice has not synced, or this clone has not pulled).', 'هنوز یادداشت هم‌تیمی در این کلون نبود (آلیس همگام نکرده یا این کلون نکشیده).') };
      reply = 'I created POST /api/login with {username, password}.';
    }
    s.messages.push(['assistant', reply]);
    [['Edit', 'server/routes/' + (found ? 'auth.py' : 'login.py')], ['Write', 'server/tests/test_login.py']].forEach(function (x) { s.toolCalls.push([x[0], { file_path: x[1] }]); });
    var key = (t.on ? 'on' : 'off') + (t.tool === 'codex' ? ' · codex' : ' · claude code');
    if (!t.on) key = 'off'; else key = 'on';
    S.compare[key] = res; t.line(res.ok ? '  ✓ result: the new route matches what the frontend calls' : '  ✗ result: the frontend (alice) calls POST /api/auth/login with {phone, otp}; this route will not match it', res.ok ? 'ok' : 'er');
    if (!res.ok && !t.on) t.line('  (gonjineh was off for this run)', 'dim');
    markStep('b-ask'); renderCompare();
  }, 200);
};

/* ---------- MCP ---------- */
function mcpCall(term, name, args) {
  var es = term.clone, a = args || {};
  if (name === 'search_memory') { var h = GJ.search(es, a.query || '', { limit: +a.limit || 6, area: a.area }); return h.map(function (x) { return short(x).split('\n')[0] + '  (score ' + x.score + ')' + ((x.endpoints || []).length ? '\n  api: ' + x.endpoints.slice(0, 6).join(', ') : ''); }).join('\n') || 'No matching memory. Nothing recorded about this yet.'; }
  if (name === 'who_knows_about') { var w = GJ.whoKnows(es, a.target || ''); return w.map(function (r) { return r.author + ': ' + r.entries + ' entries, last ' + r.last + ', tools ' + r.tools.join(', ') + ', ids ' + r.ids.slice(0, 3).join(', '); }).join('\n') || 'Nobody has recorded work on that.'; }
  if (name === 'recent') { var rr = es.slice().sort(function (x, y) { return (y.date + y.id) < (x.date + x.id) ? -1 : 1; }); if (a.area) rr = rr.filter(function (e) { return (e.areas || [e.area]).indexOf(a.area) >= 0; }); return rr.slice(0, +a.limit || 8).map(function (e) { return short(e).split('\n')[0]; }).join('\n') || 'Empty brain.'; }
  if (name === 'read_entry') { var e = byId(es, a.id || ''); return e ? GJ.render(e) : 'Not found.'; }
  return 'unknown tool';
}
var mcpN = 0;
function renderMcp() {
  var box = $('#mcp-log'); if (!box) return; box.textContent = '';
  mcpLog.slice(-6).forEach(function (m, i) {
    var d = document.createElement('div'); d.className = 'mc';
    var rq = document.createElement('div'); rq.className = 'mc-rq'; rq.textContent = '→ ' + m.from + '  ' + JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', params: { name: m.name, arguments: m.args } });
    var rs = document.createElement('pre'); rs.className = 'mc-rs'; rs.textContent = '← ' + m.out; d.appendChild(rq); d.appendChild(rs); box.appendChild(d);
  });
  if (!mcpLog.length) { var e = document.createElement('p'); e.className = 'empty'; e.textContent = T('No calls yet. Run Bob (Codex) with the login prompt, or call a tool below.', 'هنوز فراخوانی نشده. Bob (Codex) را با درخواست ورود اجرا کنید یا یک ابزار را پایین صدا بزنید.'); box.appendChild(e); }
  box.scrollTop = box.scrollHeight;
}

/* ---------- brain pane ---------- */
function esc(s) { return s.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); }
function render(pulse) {
  var log = $('#brain-log'); if (!log) return; log.textContent = '';
  function row(c, cls) { var li = document.createElement('li'); li.className = cls || ''; var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-id', c.id); b.className = 'cm' + (S.sel === c.id ? ' sel' : ''); var h = document.createElement('span'); h.className = 'hs'; h.textContent = c.h; var w = document.createElement('span'); w.className = 'who who-' + c.who; w.textContent = c.who; var m = document.createElement('span'); m.className = 'mg'; m.textContent = c.msg; b.appendChild(h); b.appendChild(w); b.appendChild(m); b.addEventListener('click', function () { S.sel = c.id; render(); }); li.appendChild(b); return li; }
  [[TA, 'alice'], [TB, 'bob']].forEach(function (p) { p[0].unpushed.forEach(function (id) { var e = byId(p[0].clone, id); if (e) log.appendChild(row({ h: 'local', id: id, who: p[1], msg: e.title }, 'loc')); }); });
  S.commits.slice().reverse().forEach(function (c) { var li = row(c, c.fresh ? 'fresh' : ''); log.appendChild(li); c.fresh = 0; });
  var tree = $('#brain-tree'); tree.textContent = '';
  S.remote.slice().sort(function (a, b) { return pathOf(a) < pathOf(b) ? -1 : 1; }).forEach(function (e) { var li = document.createElement('li'); li.textContent = pathOf(e).replace('entries/' + PROJECT + '/', ''); li.className = e.id === S.sel ? 'sel' : ''; tree.appendChild(li); });
  var e = byId(TA.clone, S.sel || '') || byId(TB.clone, S.sel || '') || byId(S.remote, S.sel || ''), pre = $('#brain-file');
  if (e) { pre.innerHTML = esc(GJ.render(e)).replace(/\[REDACTED:[a-z-]+\]/g, function (m) { return '<mark class="redacted">' + m + '</mark>'; }); $('#brain-fname').textContent = pathOf(e); }
  else { pre.textContent = T('Pick a commit to read its note.', 'یک کامیت را برای خواندن یادداشتش انتخاب کنید.'); $('#brain-fname').textContent = '—'; }
  $('#brain-count').textContent = S.remote.length;
  if (pulse && !RM) { var b = $('#brain'); b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
  document.dispatchEvent(new CustomEvent('gj-brain', { detail: { n: S.remote.length } }));
}
function renderCompare() {
  ['off', 'on'].forEach(function (k) { var box = $('#cmp-' + k), r = S.compare[k]; if (!box) return; box.className = 'cmp-c' + (r ? (r.ok ? ' good' : ' bad') : ''); $('.cmp-r', box).textContent = r ? r.route : '—'; $('.cmp-b', box).textContent = r ? r.body : T('not run yet', 'هنوز اجرا نشده'); $('.cmp-w', box).textContent = r ? (r.ok ? '✓ ' : '✗ ') + r.why : T('Run Bob with this setting.', 'Bob را با این تنظیم اجرا کنید.'); });
}

/* ---------- steps + story ---------- */
var STEPS = ['a-start', 'a-ask', 'a-end', 'a-sync', 'b-sync', 'b-start', 'b-ask'];
function fly(a, b) { document.dispatchEvent(new CustomEvent('gj-fly', { detail: { from: a, to: b } })); }
function markStep(k) { S.steps[k] = 1; $$('#steps li').forEach(function (li) { li.classList.toggle('done', !!S.steps[li.getAttribute('data-k')]); }); }
var playing = 0;
function story() {
  var btn = $('#story'); if (playing) { playing = 0; btn.setAttribute('aria-pressed', 'false'); return; }
  playing = 1; btn.setAttribute('aria-pressed', 'true'); resetAll(true);
  var seq = [
    function () { return TA.auto('claude', 'claude').then(function () { return TA.idle(); }); },
    function () { return TA.auto('Add a login button to the header: phone number + OTP. My sandbox SMS key is ' + KEY.slice(0, 12) + '…', P_ALICE); },
    function () { return TA.auto('/exit', '/exit'); },
    function () { return TA.auto('gonjineh sync'); },
    function () { return TB.auto('gonjineh sync'); },
    function () { return TB.auto(TB.tool === 'codex' ? 'codex' : 'claude'); },
    function () { return TB.auto(P_BOB); }
  ];
  (function run(i) { if (!playing || i >= seq.length) { playing = 0; btn.setAttribute('aria-pressed', 'false'); return; } seq[i]().then(function () { setTimeout(function () { run(i + 1); }, RM ? 0 : 350); }); })(0);
}
function resetAll(keepOn) {
  fresh(); TA.reset(); TB.reset(); TA.on = true; if (!keepOn) { TB.on = true; TB.tool = 'codex'; syncBobUI(); }
  TA.root.setAttribute('data-session', '0'); TB.root.setAttribute('data-session', '0');
  $$('#steps li').forEach(function (li) { li.classList.remove('done'); });
  banner(TA); banner(TB); render(); renderMcp(); renderCompare();
}
function banner(t) { t.say([t.name === 'alice' ? '# Alice · laptop · frontend · Claude Code' : '# Bob · desktop · backend · ' + (t.tool === 'codex' ? 'Codex' : 'Claude Code'), '# SIMULATION in your browser: the memory logic is real, the AI replies are scripted.'], 'dim', 0); }
function syncBobUI() {
  $$('#bob-tool button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === TB.tool ? 'true' : 'false'); });
  $$('#bob-on button').forEach(function (b) { b.setAttribute('aria-pressed', (b.getAttribute('data-v') === 'on') === TB.on ? 'true' : 'false'); });
  $('#bob-title').textContent = 'bob@desktop — ' + (TB.tool === 'codex' ? 'codex' : 'claude') + ' · backend';
  $('#bob-start').textContent = T('Start session', 'شروع نشست');
}

/* ---------- init ---------- */
var done = 0;
window.VaultLab = { init: function () {
  if (done) return; done = 1; fresh();
  TA = new Term($('#term-alice'), { name: 'alice', tool: 'claude-code', area: 'frontend' });
  TB = new Term($('#term-bob'), { name: 'bob', tool: 'codex', area: 'backend' });
  window.__gj = { A: function () { return TA; }, B: function () { return TB; }, state: function () { return S; }, mcpLog: function () { return mcpLog; } };
  banner(TA); banner(TB); render(); renderMcp(); renderCompare(); syncBobUI();
  $('#a-start').addEventListener('click', function () { TA.auto('claude', 'claude').then(function () { markStep('a-start'); }); });
  $('#a-ask').addEventListener('click', function () { TA.auto('Add a login button to the header: phone number + OTP. My sandbox SMS key is ' + KEY.slice(0, 12) + '…', P_ALICE); });
  $('#a-key').addEventListener('click', function () { TA.inp.value = 'My sandbox SMS key is ' + KEY + ' (use it for login)'; TA.inp.focus(); });
  $('#a-end').addEventListener('click', function () { TA.auto('/exit'); });
  $('#a-cap').addEventListener('click', function () { TA.auto('gonjineh capture'); });
  $('#a-sync').addEventListener('click', function () { TA.auto('gonjineh sync'); });
  $('#a-search').addEventListener('click', function () { TA.auto('gonjineh search "login endpoint"'); });
  $('#a-who').addEventListener('click', function () { TA.auto('gonjineh who-knows auth'); });
  $('#bob-start').addEventListener('click', function () { TB.auto(TB.tool === 'codex' ? 'codex' : 'claude').then(function () { markStep('b-start'); }); });
  $('#b-ask').addEventListener('click', function () { TB.auto(P_BOB); });
  $('#b-end').addEventListener('click', function () { TB.auto('/exit'); });
  $('#b-cap').addEventListener('click', function () { TB.auto('gonjineh capture'); });
  $('#b-sync').addEventListener('click', function () { TB.auto('gonjineh sync'); });
  $('#b-search').addEventListener('click', function () { TB.auto('gonjineh search "login endpoint"'); });
  $('#b-who').addEventListener('click', function () { TB.auto('gonjineh who-knows auth'); });
  $$('#bob-tool button').forEach(function (b) { b.addEventListener('click', function () { if (TB.sess) { TB.say('finish the running session first (End session)', 'er'); return; } TB.tool = b.getAttribute('data-v'); syncBobUI(); TB.say('# Bob now uses ' + (TB.tool === 'codex' ? 'Codex (no session-start hook; MCP + AGENTS.md)' : 'Claude Code (hooks inject the briefing)'), 'dim'); }); });
  $$('#bob-on button').forEach(function (b) { b.addEventListener('click', function () { if (TB.sess) { TB.say('finish the running session first (End session)', 'er'); return; } TB.on = b.getAttribute('data-v') === 'on'; syncBobUI(); TB.say('# gonjineh ' + (TB.on ? 'ON for Bob' : 'OFF for Bob (simulates a teammate without it)'), 'dim'); }); });
  $('#story').addEventListener('click', story); $('#reset').addEventListener('click', function () { playing = 0; $('#story').setAttribute('aria-pressed', 'false'); resetAll(false); });
  var mf = $('#mcp-form'); mf.addEventListener('submit', function (ev) { ev.preventDefault(); var name = $('#mcp-tool').value, v = $('#mcp-arg').value.trim(), args = name === 'search_memory' ? { query: v } : name === 'who_knows_about' ? { target: v } : name === 'read_entry' ? { id: v } : { limit: 5 }; var who = $('#mcp-as').value === 'bob' ? TB : TA; var out = mcpCall(who, name, args); mcpLog.push({ from: who.name + ' · manual', name: name, args: args, out: out }); renderMcp(); });
  $('#mcp-tool').addEventListener('change', function () { var n = this.value; $('#mcp-arg').disabled = n === 'recent'; $('#mcp-arg').placeholder = n === 'who_knows_about' ? 'auth' : n === 'read_entry' ? 'id prefix' : 'login endpoint'; });
  document.addEventListener('mrz-lang', function () { syncBobUI(); renderMcp(); renderCompare(); render(); });
  $$('.lab-tabs button').forEach(function (b) { b.addEventListener('click', function () { $('#lab').setAttribute('data-view', b.getAttribute('data-v')); $$('.lab-tabs button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); }); });
} };
})();
