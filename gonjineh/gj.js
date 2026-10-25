/* gonjineh: JavaScript port of the real rules (textnorm.py, scrub.py, digest.py, store.py search) for the in-browser demo.
   Parity with the Python source is checked by parity/gonjineh/run.sh (same inputs, same outputs). Nothing here touches the network. */
(function (root, factory) { var G = factory(); if (typeof module === 'object' && module.exports) module.exports = G; else root.GJ = G; })(typeof self !== 'undefined' ? self : this, function () {
'use strict';
var B = '(?<![\\p{L}\\p{N}_])', E = '(?![\\p{L}\\p{N}_])'; // Python's Unicode-aware \b at a word edge

/* ---------- textnorm ---------- */
var MAP = { '\u064a': '\u06cc', '\u0649': '\u06cc', '\u0643': '\u06a9', '\u0629': '\u0647', '\u06c0': '\u0647', '\u200c': ' ', '\u200d': '', '\u200f': '', '\u200e': '', '\u0640': '' };
'۰۱۲۳۴۵۶۷۸۹'.split('').forEach(function (c, i) { MAP[c] = String(i); });
'٠١٢٣٤٥٦٧٨٩'.split('').forEach(function (c, i) { MAP[c] = String(i); });
var TASHKEEL = /[\u064b-\u065f\u0670]/g;
var STOP = {}; ('the a an and or of to in on for with is are was were be been it this that as at by from not no را و در به از که این آن با برای یک است بود شد می های ها تا هم یا اگر').split(/\s+/).forEach(function (w) { STOP[w] = 1; });
function translate(s, map) { var o = ''; for (var ch of s) o += (ch in map) ? map[ch] : ch; return o; }
function normalize(t) { return translate(t, MAP).replace(TASHKEEL, ''); }
function tokenize(t) {
  t = translate(t, { '_': ' ', '-': ' ', '/': ' ', '.': ' ' }).replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ');
  t = normalize(t).toLowerCase();
  var m = t.match(/[0-9a-z\u0600-\u06ff]+/g) || [];
  return m.filter(function (x) { return !STOP[x] && x.length > 0 && !(x.length === 1 && x.charCodeAt(0) < 128); });
}

/* ---------- scrub ---------- */
var PLACEHOLDER = /^(?:\$\{?\w+\}?|\$\(.*\)|<[^>]*>|\[REDACTED[^\]]*\]|\*{3,}|x{4,}|\.{3,}|your[-_ ].*|process\.env\..*|os\.environ.*|getenv.*|env\(.*|null|none|nil|true|false|undefined|example.*|changeme|todo|string|str|int|bool|password|secret|token)$/i;
var STRONG = /(secret|token|passw(?:or)?d|passwd|pwd|api[_-]?key|apikey|private[_-]?key|access[_-]?key|credential|bearer|signature)/i;
var PRIVATE_KEY = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----[\s\S]*?(?:-----END [A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----|$)/g;
function rx(src, f) { return new RegExp(src, f || 'gu'); }
var TOKEN_RULES = [
  ['aws-access-key', rx(B + '(?:AKIA|ASIA|AGPA|AIDA|AROA)[0-9A-Z]{16}' + E)],
  ['github-token', rx(B + '(?:gh[pousr]_[A-Za-z0-9]{30,255}|github_pat_[A-Za-z0-9_]{40,255})' + E)],
  ['gitlab-token', rx(B + 'glpat-[A-Za-z0-9_\\-]{20,}' + E)],
  ['slack-token', rx(B + 'xox[abprs]-[A-Za-z0-9-]{10,}' + E)],
  ['stripe-key', rx(B + '(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}' + E)],
  ['anthropic-key', rx(B + 'sk-ant-[A-Za-z0-9_\\-]{20,}' + E)],
  ['openai-key', rx(B + 'sk-(?:proj-)?[A-Za-z0-9_\\-]{32,}' + E)],
  ['google-api-key', rx(B + 'AIza[0-9A-Za-z_\\-]{35}' + E)],
  ['npm-token', rx(B + 'npm_[A-Za-z0-9]{36}' + E)],
  ['sendgrid-key', rx(B + 'SG\\.[A-Za-z0-9_\\-]{16,}\\.[A-Za-z0-9_\\-]{16,}' + E)],
  ['twilio-key', rx(B + 'SK[0-9a-f]{32}' + E)],
  ['jwt', rx(B + 'eyJ[A-Za-z0-9_\\-]{8,}\\.eyJ[A-Za-z0-9_\\-]{8,}\\.[A-Za-z0-9_\\-]{4,}' + E)],
  ['telegram-bot-token', rx(B + '\\p{Nd}{8,10}:[A-Za-z0-9_\\-]{35}' + E)]
];
var URL_CREDS = rx('(' + B + '[a-z][a-z0-9+.\\-]*://)([^\\s/:@]+):([^\\s/@]+)@', 'giu');
var BEARER = rx(B + '(Bearer|Basic|Token)\\s+([A-Za-z0-9._~+/=\\-]{12,})', 'giu');
var ASSIGN = rx('(["\']?)([A-Za-z0-9_.\\-]*(?:secret|token|passw(?:or)?d|passwd|pwd|key|auth|cred|salt|dsn|cookie|session|signature)[A-Za-z0-9_.\\-]*)\\1(\\s*(?::|=|=>|:=)\\s*)(["\']?)([^\\s"\'`,;&)}\\]]{4,})', 'giu');
var CARD = rx('(?<![0-9۰-۹])(?:[0-9۰-۹]{4}[ \\-]?){3}[0-9۰-۹]{4}(?![0-9۰-۹])');
var PHONE_IR = rx('(?<![0-9۰-۹])(?:\\+98|0098|0)?[9۹][0-9۰-۹]{9}(?![0-9۰-۹])');
var EMAIL = rx(B + '[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}' + E);
var LONG = rx('(?<![A-Za-z0-9+_=\\-])[A-Za-z0-9+_=\\-]{32,}(?![A-Za-z0-9+_=\\-])');
var FAD = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };
function entropy(s) { if (!s) return 0; var f = {}, n = s.length, h = 0, c; for (var i = 0; i < n; i++) f[s[i]] = (f[s[i]] || 0) + 1; for (c in f) { var p = f[c] / n; h -= p * Math.log2(p); } return h; }
function luhn(d) { var t = 0, alt = false; for (var i = d.length - 1; i >= 0; i--) { var x = +d[i]; if (alt) { x *= 2; if (x > 9) x -= 9; } t += x; alt = !alt; } return t % 10 === 0; }
function red(k) { return '[REDACTED:' + k + ']'; }
function count(max) { var c = {}; return { c: c, hit: function (k) { c[k] = (c[k] || 0) + 1; } }; }
function scrub(text, opt) {
  opt = opt || {}; var pii = opt.pii !== false, maskEmail = !!opt.maskEmail, rep = opt.report || count();
  if (!text) return text;
  function sub(re, kind, s, f) { re.lastIndex = 0; return s.replace(re, function () { var m = [].slice.call(arguments); rep.hit(kind); return f ? f(m) : red(kind); }); }
  text = sub(PRIVATE_KEY, 'private-key', text);
  TOKEN_RULES.forEach(function (r) { text = sub(r[1], r[0], text); });
  text = sub(URL_CREDS, 'url-credentials', text, function (m) { return m[1] + m[2] + ':' + red('password') + '@'; });
  text = sub(BEARER, 'bearer', text, function (m) { return m[1] + ' ' + red('token'); });
  ASSIGN.lastIndex = 0;
  text = text.replace(ASSIGN, function (all, quote, key, sep, vq, val) {
    if (PLACEHOLDER.test(val) || val.indexOf('[REDACTED') === 0) return all;
    if (!STRONG.test(key)) {
      var mixed = /\p{Nd}/u.test(val) && /\p{L}/u.test(val);
      if (!(val.length >= 12 && mixed && !/^(?:http:\/\/|https:\/\/|\/|\.\/)/.test(val))) return all;
    }
    rep.hit('assigned-secret');
    return quote + key + quote + sep + vq + red('secret');
  });
  LONG.lastIndex = 0;
  text = text.replace(LONG, function (t) {
    if (/^[0-9a-fA-F]+$/.test(t)) return t;
    if (!(/\p{Nd}/u.test(t) && /\p{L}/u.test(t))) return t;
    var dashes = (t.split('-').length - 1) + (t.split('_').length - 1);
    if (dashes > 6 && entropy(t) < 4.4) return t;
    if (entropy(t) >= 4.0) { rep.hit('high-entropy'); return red('high-entropy'); }
    return t;
  });
  if (pii) {
    CARD.lastIndex = 0;
    text = text.replace(CARD, function (m) { var d = translate(m, FAD).replace(/[ \-]/g, ''); if (luhn(d)) { rep.hit('card-number'); return red('card'); } return m; });
    text = sub(PHONE_IR, 'phone', text, function () { return red('phone'); });
  }
  if (maskEmail) text = sub(EMAIL, 'email', text);
  return text;
}

/* ---------- digest ---------- */
var DEFAULT_AREAS = [
  ['frontend', ['*.tsx', '*.jsx', '*.vue', '*.svelte', '*.css', '*.scss', '*.html', '*/components/*', '*/pages/*', '*/public/*', 'frontend/*', 'web/*', 'client/*', 'ui/*', 'app/*']],
  ['backend', ['*.py', '*.go', '*.rs', '*.java', '*.php', '*.rb', '*.sql', '*/api/*', '*/routes/*', '*/models/*', '*/migrations/*', 'backend/*', 'server/*', 'api/*', 'services/*']],
  ['infra', ['Dockerfile*', 'docker-compose*', '*.tf', '.github/*', 'k8s/*', 'deploy/*', 'infra/*', '*.yml', '*.yaml', 'nginx*']],
  ['docs', ['*.md', 'docs/*']]
];
var DECISION = rx(B + "(decided|chose|choosing|we(?:'ll| will) use|i(?:'ll| will) use|instead of|switched to|going with|opted for|rather than|the reason|because)" + E + '|تصمیم|انتخاب کرد|به جای|استفاده می[‌ ]?کنیم|به این دلیل|چون', 'iu');
var TODO = rx(B + '(TODO|FIXME|still need|not yet|next step|follow[- ]up|left to do|remaining)' + E + '|باقی[‌ ]?مانده|هنوز|بعداً|مرحله بعد', 'iu');
var GOTCHA = rx(B + '(gotcha|careful|caveat|watch out|beware|warning|note that|breaking|workaround|must not|never)' + E + '|حواست|دقت|نکته|مراقب', 'iu');
var ENDPOINT = [
  rx(B + '(GET|POST|PUT|PATCH|DELETE)\\s+(/[\\w\\-./:{}<>\\[\\]]*)', 'gu'),
  rx('@(?:\\w+)\\.(get|post|put|patch|delete)\\(\\s*["\'](/[^"\']*)', 'gu'),
  rx(B + '(?:app|router)\\.(get|post|put|patch|delete)\\(\\s*["\'](/[^"\']*)', 'gu'),
  rx(B + '(?:fetch|axios\\.(get|post|put|patch|delete))\\(\\s*[`"\'](/[\\w\\-./:{}$]*)', 'gu')
];
var SHELL_WRITE = [
  rx('(?<![0-9&<>])>>?\\s*([\'"]?)([\\w./\\-~]+\\.\\w+|[\\w./\\-]+/[\\w./\\-]+)\\1', 'gu'),
  rx(B + 'tee\\s+(?:-a\\s+)?([\'"]?)([\\w./\\-]+)\\1', 'gu'),
  rx(B + 'sed\\s+-i\\S*\\s+(?:-e\\s+)?(?:\'[^\']*\'|"[^"]*")\\s+([\'"]?)([\\w./\\-]+)\\1', 'gu'),
  rx(B + '(?:touch|mkdir -p)\\s+([\'"]?)([\\w./\\-]+\\.\\w+)\\1', 'gu')
];
var NOTABLE_CMD = /^\s*(git (?!status|diff|log|add)|npm (?:i|install|run|test)|pnpm|yarn|pip|pytest|python -m|docker|make|cargo|go (?:test|build)|alembic|prisma|migrate|curl|kubectl|terraform)\b/;
function ws(s) { return s.trim().split(/\s+/).filter(Boolean).join(' '); }
function first(text, n) { var t = ws(text); return t.length <= n ? t : t.slice(0, n - 1).replace(/\s+$/, '') + '…'; }
function rel(p, cwd) { p = p.replace(/\\/g, '/'); var c = (cwd || '').replace(/\\/g, '/').replace(/\/+$/, ''); if (c && p.indexOf(c + '/') === 0) p = p.slice(c.length + 1); return p.indexOf('./') === 0 ? p.replace(/^[./]+/, '') : p; }
function fnmatch(name, pat) {
  var re = '', i = 0, n = pat.length, c;
  while (i < n) { c = pat[i++];
    if (c === '*') re += '[\\s\\S]*'; else if (c === '?') re += '[\\s\\S]';
    else if (c === '[') { var j = i; if (j < n && pat[j] === '!') j++; if (j < n && pat[j] === ']') j++; while (j < n && pat[j] !== ']') j++;
      if (j >= n) re += '\\['; else { var st = pat.slice(i, j).replace(/\\/g, '\\\\'); i = j + 1; if (st[0] === '!') st = '^' + st.slice(1); else if (st[0] === '^') st = '\\' + st; re += '[' + st + ']'; } }
    else re += c.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); }
  return new RegExp('^' + re + '$').test(name);
}
function inferAreas(files, rules, def) {
  rules = rules || DEFAULT_AREAS; def = def || 'general'; var counts = {}, order = [];
  files.forEach(function (f) {
    for (var r = 0; r < rules.length; r++) { var area = rules[r][0], globs = rules[r][1];
      if (globs.some(function (g) { return fnmatch(f, g) || fnmatch('/' + f, g) || fnmatch(f, '*/' + g); })) { if (!(area in counts)) { counts[area] = 0; order.push(area); } counts[area]++; break; } } });
  if (!order.length) return [def];
  return order.sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : a > b ? 1 : 0); });
}
function sentences(text) { return text.split(/(?<=[.!?؟۔\n])\s+/).map(ws).filter(Boolean); }
function uniqPush(arr, v) { if (arr.indexOf(v) < 0) arr.push(v); }
/* sha1 (sync) so entry ids equal the Python ones */
function sha1hex(str) {
  var b = new TextEncoder().encode(str), l = b.length, w = [], i, j;
  for (i = 0; i < l; i++) w[i >> 2] |= b[i] << (24 - (i % 4) * 8);
  w[l >> 2] |= 0x80 << (24 - (l % 4) * 8); w[(((l + 8) >> 6) + 1) * 16 - 1] = l * 8;
  var h0 = 0x67452301, h1 = 0xefcdab89 | 0, h2 = 0x98badcfe | 0, h3 = 0x10325476, h4 = 0xc3d2e1f0 | 0;
  function rl(x, n) { return (x << n) | (x >>> (32 - n)); }
  for (i = 0; i < w.length; i += 16) {
    var a = h0, bb = h1, c = h2, d = h3, e = h4, x = [];
    for (j = 0; j < 80; j++) { x[j] = j < 16 ? (w[i + j] | 0) : rl(x[j - 3] ^ x[j - 8] ^ x[j - 14] ^ x[j - 16], 1);
      var f, k; if (j < 20) { f = (bb & c) | (~bb & d); k = 0x5a827999; } else if (j < 40) { f = bb ^ c ^ d; k = 0x6ed9eba1; } else if (j < 60) { f = (bb & c) | (bb & d) | (c & d); k = 0x8f1bbcdc | 0; } else { f = bb ^ c ^ d; k = 0xca62c1d6 | 0; }
      var t = (rl(a, 5) + f + e + k + x[j]) | 0; e = d; d = c; c = rl(bb, 30); bb = a; a = t; }
    h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  return [h0, h1, h2, h3, h4].map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); }).join('');
}
var FILE_TOOLS = { Edit: 1, Write: 1, MultiEdit: 1, NotebookEdit: 1, apply_patch: 1 };
/* s: {tool, sessionId, cwd, branch, ended, messages:[[role,text]], toolCalls:[[name,{...}]]} */
function digest(s, o) {
  o = o || {}; var ignorePatterns = o.ignore || [], pii = o.pii !== false;
  var users = s.messages.filter(function (m) { return m[0] === 'user'; }).map(function (m) { return m[1]; });
  var assistants = s.messages.filter(function (m) { return m[0] === 'assistant'; }).map(function (m) { return m[1]; });
  if (!users.length) return null;
  if (/(#private\b|gonjineh:off|#نهان(?![\p{L}\p{N}_]))/u.test(users.join('\n'))) return null;
  var files = [], seen = {};
  s.toolCalls.forEach(function (tc) { var inp = tc[1] || {}, fp = inp.file_path || inp.path || inp.notebook_path;
    if (FILE_TOOLS[tc[0]] && fp) { fp = rel(String(fp), s.cwd); if (!seen[fp]) { seen[fp] = 1; files.push(fp); } } });
  s.toolCalls.forEach(function (tc) { var c = (tc[1] || {}).command;
    if (tc[0] === 'Bash' && typeof c === 'string') SHELL_WRITE.forEach(function (re) { re.lastIndex = 0; var m; while ((m = re.exec(c))) { var fp = rel(m[2], s.cwd);
      if (/^\/(dev|tmp|proc)\//.test(fp) || seen[fp]) continue; seen[fp] = 1; files.push(fp); } }); });
  var allFiles = files;
  files = files.filter(function (f) { return !ignorePatterns.some(function (p) { return fnmatch(f.replace(/^\/+/, ''), p) || fnmatch('/' + f.replace(/^\/+/, ''), p) || fnmatch(f.split('/').pop(), p); }); });
  if (allFiles.length && !files.length) return null;
  var commands = [];
  s.toolCalls.forEach(function (tc) { var c = (tc[1] || {}).command;
    if (tc[0] === 'Bash' && typeof c === 'string' && NOTABLE_CMD.test(c)) uniqPush(commands, first(c.split('\n')[0], 140)); });
  if (o.minSignal !== false && !files.length && assistants.length < 1) return null;
  var corpus = assistants.concat(s.toolCalls.map(function (tc) { var i = tc[1] || {}; return String(i.content === undefined ? '' : i.content) + String(i.new_string === undefined ? '' : i.new_string); }));
  var endpoints = [];
  assistants.concat(corpus.filter(Boolean)).forEach(function (text) {
    ENDPOINT.forEach(function (re) { re.lastIndex = 0; var m;
      while ((m = re.exec(text))) { var g = m.slice(1).filter(Boolean), verb, path;
        if (g.length >= 2) { verb = g[g.length - 2].toUpperCase(); path = g[g.length - 1]; } else { verb = ''; path = g[g.length - 1]; }
        path = path.replace(/[.,;:)'"`]+$/, ''); var e = (verb + ' ' + path).trim();
        if (endpoints.indexOf(e) < 0 && path.length > 1) endpoints.push(e);
        if (m[0].length === 0) re.lastIndex++; } }); });
  var decisions = [], todos = [], gotchas = [];
  assistants.forEach(function (text) { sentences(text).forEach(function (sent) {
    var n = Array.from(sent).length; if (n < 25 || n > 260) return;
    if (DECISION.test(sent)) uniqPush(decisions, sent); if (TODO.test(sent)) uniqPush(todos, sent); if (GOTCHA.test(sent)) uniqPush(gotchas, sent); }); });
  var normal = (o.detail || 'normal') === 'normal', nUser = normal ? 8 : 3, nLen = normal ? 280 : 160;
  var asks = users.slice(0, nUser).map(function (u) { return first(u, nLen); });
  var outcome = assistants.length ? first(assistants[assistants.length - 1], normal ? 700 : 300) : '';
  var title = first(users[0].split('\n')[0], 90), areas = inferAreas(files, o.areaRules, o.defaultArea);
  var when = s.ended || '', date = /^\d{4}-\d{2}-\d{2}/.test(when) ? when.slice(0, 10) : new Date().toISOString().slice(0, 10);
  var entry = { id: sha1hex(s.tool + ':' + s.sessionId).slice(0, 10), title: title, author: o.author, tool: s.tool, session: s.sessionId.slice(0, 12), date: date, project: o.project, area: areas[0], areas: areas, branch: s.branch || '',
    files: files.slice(0, 40), endpoints: endpoints.slice(0, 12), tags: [], asks: asks, outcome: outcome, decisions: decisions.slice(0, 6), gotchas: gotchas.slice(0, 5), todos: todos.slice(0, 6), commands: commands.slice(0, 8), turns: users.length };
  var rep = count(), out = {}, plain = { id: 1, author: 1, tool: 1, session: 1, date: 1, project: 1, area: 1, areas: 1, branch: 1, turns: 1 };
  Object.keys(entry).forEach(function (k) { var v = entry[k];
    if (plain[k]) out[k] = v; else if (Array.isArray(v)) out[k] = v.map(function (x) { return typeof x === 'string' ? scrub(x, { pii: pii, maskEmail: o.maskEmail, report: rep }) : x; });
    else if (typeof v === 'string') out[k] = scrub(v, { pii: pii, maskEmail: o.maskEmail, report: rep }); else out[k] = v; });
  return { entry: out, report: rep.c };
}

/* ---------- demo-format transcript (a simplified stand-in for Claude Code / Codex files) ----------
   "You: ..." / "AI: ..." start a message; "[edit] path", "[write] path", "[bash] cmd" are tool calls; other lines continue the last message. */
function parseDemo(text, base) {
  var s = { tool: base.tool || 'claude-code', sessionId: base.sessionId || 'demo', cwd: base.cwd || '', branch: base.branch || '', ended: base.ended || '', messages: [], toolCalls: [] }, cur = null;
  text.split(/\r?\n/).forEach(function (line) { var m;
    if ((m = /^\s*(?:You|User|من|کاربر)\s*[:：]\s?(.*)$/.exec(line))) { cur = ['user', m[1]]; s.messages.push(cur); }
    else if ((m = /^\s*(?:AI|Assistant|Claude|Codex|دستیار)\s*[:：]\s?(.*)$/.exec(line))) { cur = ['assistant', m[1]]; s.messages.push(cur); }
    else if ((m = /^\s*\[(edit|write)\]\s+(\S+)\s*$/i.exec(line))) { s.toolCalls.push([m[1].toLowerCase() === 'edit' ? 'Edit' : 'Write', { file_path: m[2] }]); cur = null; }
    else if ((m = /^\s*\[bash\]\s+(.+)$/i.exec(line))) { s.toolCalls.push(['Bash', { command: m[1] }]); cur = null; }
    else if (cur) cur[1] += '\n' + line; });
  s.messages.forEach(function (m) { m[1] = m[1].replace(/\s+$/, ''); });
  return s;
}

/* ---------- search (BM25 over entry fields) ---------- */
var FIELD_W = [['title', 3.0], ['tags', 3.0], ['files', 2.5], ['endpoints', 2.5], ['decisions', 1.6], ['gotchas', 1.6], ['outcome', 1.3], ['asks', 1.2], ['todos', 1.0], ['text', 1.4], ['area', 2.0], ['author', 1.0], ['commands', 0.6]];
function fields(e) {
  var c = new Map();
  FIELD_W.forEach(function (fw) { var v = e[fw[0]]; if (!v || (Array.isArray(v) && !v.length)) return;
    var txt = Array.isArray(v) ? v.join(' ') : String(v); tokenize(txt).forEach(function (t) { c.set(t, (c.get(t) || 0) + fw[1]); }); });
  return c;
}
function search(entries, query, o) {
  o = o || {}; var limit = o.limit || 8, q = tokenize(query); if (!q.length) return [];
  var pool = entries.filter(function (e) { return (!o.area || (e.areas || [e.area]).indexOf(o.area) >= 0) && (!o.author || e.author === o.author); });
  if (!pool.length) return [];
  var docs = pool.map(fields), lens = docs.map(function (d) { var s = 0; d.forEach(function (v) { s += v; }); return s || 1; });
  var avg = lens.reduce(function (a, b) { return a + b; }, 0) / lens.length, n = pool.length, df = new Map();
  docs.forEach(function (d) { d.forEach(function (_, t) { df.set(t, (df.get(t) || 0) + 1); }); });
  var vocab = Array.from(df.keys());
  var expanded = q.map(function (t) { var exp = df.has(t) ? [[t, 1.0]] : [];
    if (t.length >= 3) exp = exp.concat(vocab.filter(function (v) { return v !== t && (v.indexOf(t) === 0 || (v.length >= 4 && t.indexOf(v) === 0)); }).slice(0, 6).map(function (v) { return [v, 0.6]; }));
    return exp; });
  var k1 = 1.4, b = 0.75, scored = [];
  pool.forEach(function (e, i) { var d = docs[i], ln = lens[i], sc = 0;
    expanded.forEach(function (exp) { exp.forEach(function (tw) { var f = d.get(tw[0]) || 0;
      if (f) { var idf = Math.log(1 + (n - df.get(tw[0]) + 0.5) / (df.get(tw[0]) + 0.5)); sc += tw[1] * idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * ln / avg)); } }); });
    if (sc > 0) scored.push([sc, e, i]); });
  scored.sort(function (a, c) { return c[0] - a[0] || a[2] - c[2]; });
  return scored.slice(0, limit).map(function (x) { var r = Object.assign({}, x[1]); r.score = Math.round(x[0] * 1000) / 1000; return r; });
}
var MIN_SCORE = 2.5;
/* the per-prompt hook gate (hooks.py): score >= MIN_SCORE, or >= 2 distinct query tokens found in the entry's fields */
function gate(entry, query) { var qt = new Set(tokenize(query)), ft = fields(entry), k = 0; qt.forEach(function (t) { if (ft.has(t)) k++; }); return entry.score >= MIN_SCORE || k >= 2; }
function whoKnows(entries, target, limit) {
  var t = target.toLowerCase(), by = {};
  entries.forEach(function (e) {
    var hit = (e.files || []).some(function (f) { return f.toLowerCase().indexOf(t) >= 0; }) || (e.endpoints || []).some(function (x) { return x.toLowerCase().indexOf(t) >= 0; }) || t === (e.area || '').toLowerCase() || (e.title || '').toLowerCase().indexOf(t) >= 0;
    if (hit) { var a = by[e.author] || (by[e.author] = { author: e.author, entries: 0, last: '', tools: {}, ids: [] }); a.entries++; a.last = a.last > (e.date || '') ? a.last : (e.date || ''); a.tools[e.tool || ''] = 1; a.ids.push(e.id); } });
  return Object.keys(by).map(function (k) { var a = by[k]; a.tools = Object.keys(a.tools).sort(); return a; })
    .sort(function (a, b) { return b.entries - a.entries || (a.author < b.author ? -1 : 1); }).slice(0, limit || 5);
}
/* ---------- render (store.render) and the per-prompt hook text (hooks.py UserPromptSubmit) ---------- */
var ORDER = ['id', 'title', 'author', 'tool', 'session', 'date', 'project', 'area', 'areas', 'branch', 'files', 'endpoints', 'tags', 'turns'];
function pyJson(v) { // json.dumps(ensure_ascii=False) spacing
  if (Array.isArray(v)) return '[' + v.map(pyJson).join(', ') + ']';
  return JSON.stringify(v);
}
function render(e) {
  var head = ['---'];
  ORDER.forEach(function (k) { if (k in e && e[k] !== '' && e[k] !== null && e[k] !== undefined) head.push(k + ': ' + pyJson(e[k])); });
  head.push('---');
  var body = ['# ' + e.title, '', '> **' + e.author + '** · ' + e.tool + ' · ' + e.date + ' · area: **' + e.area + '**' + (e.branch ? ' · branch `' + e.branch + '`' : ''), ''];
  function sec(name, items, code) { if (!items || !items.length) return; body.push('## ' + name); items.forEach(function (it) { body.push(code ? '- `' + it + '`' : '- ' + it); }); body.push(''); }
  if (e.outcome) body.push('## Outcome', e.outcome, '');
  sec('What was asked', e.asks); sec('Decisions', e.decisions); sec('Files touched', e.files, true); sec('API / contracts', e.endpoints, true);
  sec('Gotchas', e.gotchas); sec('Open TODOs', e.todos); sec('Commands', e.commands, true);
  if (e.text) body.push('## Note', e.text, '');
  return head.concat([''], body).join('\n').replace(/\s+$/, '') + '\n';
}
function hookContext(entries, prompt, me) {
  if (Array.from(prompt).length < 12) return { hits: [], text: '' };
  var hits = search(entries, prompt, { limit: 6 }).filter(function (h) { return h.author !== me && gate(h, prompt); }).slice(0, 3);
  if (!hits.length) return { hits: [], text: '' };
  var lines = ['Team brain: related work by teammates (check before you build or assume):'];
  hits.forEach(function (h) { lines.push('- [' + h.area + '] ' + h.author + ' ' + h.date + ': ' + h.title + ((h.files || []).length ? ' (files: ' + h.files.slice(0, 3).join(', ') + ')' : '') + ((h.endpoints || []).length ? ' (api: ' + h.endpoints.slice(0, 3).join(', ') + ')' : '') + ' [id ' + h.id + ']'); });
  var t = lines.join('\n'); return { hits: hits, text: t.slice(0, 1200) };
}
return { normalize: normalize, tokenize: tokenize, scrub: scrub, digest: digest, parseDemo: parseDemo, search: search, gate: gate, whoKnows: whoKnows, fields: fields, fnmatch: fnmatch, inferAreas: inferAreas, sha1hex: sha1hex, MIN_SCORE: MIN_SCORE, render: render, hookContext: hookContext };
});
