/*
 * Gosast engine: draws a picture of a page on a canvas and lets you tear it.
 *
 * It only needs a canvas and an image of the page. It never reads or changes
 * a real web page, never uses the network and never stores anything. The
 * browser extension (content.js) and the landing-page demo both use this very
 * file, so what you try on the website is what the extension does.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.GosastEngine = factory(root.GosastCore);
})(typeof self !== 'undefined' ? self : this, function (Core) {
  'use strict';

  var TOOLS = { strip: { r: 14, mode: 'strip' }, confetti: { r: 22, mode: 'confetti' }, broom: { r: 90 }, glue: { r: 80 } };
  var MAX_PIECES = 5000;

  // ---------- tiny synthesized sounds (WebAudio, no files) ----------
  function makeSfx() {
    var ac = null, noise = null, last = {}, enabled = false;
    function ensure() {
      if (!ac) {
        var AC = (typeof AudioContext !== 'undefined' && AudioContext) || (typeof webkitAudioContext !== 'undefined' && webkitAudioContext);
        if (!AC) return false;
        ac = new AC();
        noise = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate);
        var d = noise.getChannelData(0);
        for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ac.state === 'suspended') ac.resume();
      return true;
    }
    function ready(name, gap) {
      if (!enabled || !ensure()) return false;
      var now = ac.currentTime;
      if (last[name] && now - last[name] < gap) return false;
      last[name] = now; return true;
    }
    function burst(type, freq, q, gain, dur) {
      var src = ac.createBufferSource(); src.buffer = noise;
      var f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      var g = ac.createGain(), t = ac.currentTime;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start(t, Math.random() * 0.2, dur + 0.02);
    }
    return {
      set enabled(v) { enabled = !!v; if (enabled) ensure(); },
      get enabled() { return enabled; },
      cut: function () { if (ready('cut', 0.045)) burst('bandpass', 2600 + Math.random() * 2400, 0.9, 0.05, 0.07); },
      thud: function () { if (ready('thud', 0.07)) burst('lowpass', 500 + Math.random() * 300, 0.7, 0.035, 0.09); },
      sweep: function () { if (ready('sweep', 0.09)) burst('highpass', 1500, 0.5, 0.03, 0.16); },
      glue: function () {
        if (!ready('glue', 0.06)) return;
        var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
        o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(760, t + 0.06);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.1);
      },
      close: function () { if (ac) { try { ac.close(); } catch (e) { /* ignore */ } ac = null; } }
    };
  }

  /**
   * create({ canvas, source, width, height, dpr, gentle, onChange, theme })
   *   canvas  - an HTMLCanvasElement the engine owns while it runs
   *   source  - an image of the page (ImageBitmap, canvas or image)
   *   width/height - size of the page area in CSS px
   */
  function create(opts) {
    var canvas = opts.canvas, W = opts.width, H = opts.height, dpr = opts.dpr || 1;
    var source = opts.source, scale = source.width / W;
    var theme = Object.assign({ desk1: '#3a2a22', desk2: '#1d1511', ring: '#ffd9e6', glow: '#ff7aa8' }, opts.theme || {});
    var ctx = canvas.getContext('2d');
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);

    var grid = Core.makeGrid(W, H), field = Core.makeField(W);
    var pieces = [], tool = 'strip', gentle = !!opts.gentle, down = false;
    var ptr = { x: W / 2, y: H / 2, vx: 0, vy: 0, t: 0, inside: false };
    var kbDown = false, kbRing = false;
    var blade = null, sweepAcc = 0, raf = 0, last = 0, alive = true, dirtyDraw = true, dirtySheet = true, notifyQueued = false;
    var sfx = makeSfx();
    if (opts.sound) sfx.enabled = true;

    // sheet = the page minus torn-out holes; cache = sheet with a soft shadow, redrawn only when the sheet changes
    function mk() { var c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height; return c; }
    var sheet = mk(), sctx = sheet.getContext('2d'), cache = mk(), cctx = cache.getContext('2d'), desk = mk();
    sctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    (function paintDesk() {
      var d = desk.getContext('2d'), g = d.createRadialGradient(canvas.width / 2, canvas.height * 0.45, 20, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.75);
      g.addColorStop(0, theme.desk1); g.addColorStop(1, theme.desk2);
      d.fillStyle = g; d.fillRect(0, 0, desk.width, desk.height);
      d.globalAlpha = 0.05; d.fillStyle = '#fff';                       // faint paper-grain speckle
      for (var i = 0; i < 700; i++) d.fillRect(Math.random() * desk.width, Math.random() * desk.height, dpr, dpr);
    })();

    function redrawCache() {
      cctx.clearRect(0, 0, cache.width, cache.height);
      cctx.save();
      cctx.shadowColor = 'rgba(0,0,0,0.5)'; cctx.shadowBlur = 8 * dpr; cctx.shadowOffsetY = 2 * dpr;
      cctx.drawImage(sheet, 0, 0);
      cctx.restore();
      dirtySheet = false;
    }

    /** The torn-out rectangle in device pixels. Erase and repaint use the very same numbers, so no seam is left behind. */
    function devRect(p) {
      var x0 = Math.floor(p.sx * dpr), y0 = Math.floor(p.sy * dpr);
      var x1 = Math.min(canvas.width, Math.ceil((p.sx + p.w) * dpr)), y1 = Math.min(canvas.height, Math.ceil((p.sy + p.h) * dpr));
      return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
    }
    function eraseCells(p) {
      var r = devRect(p);
      sctx.clearRect(r.x, r.y, r.w, r.h);
      dirtySheet = true;
    }
    function paintBack(p) {
      var r = devRect(p), k = scale / dpr;                    // device pixel -> screenshot pixel
      sctx.clearRect(r.x, r.y, r.w, r.h);
      sctx.drawImage(source, r.x * k, r.y * k, r.w * k, r.h * k, r.x, r.y, r.w, r.h);
      dirtySheet = true;
    }

    function notify() {
      if (notifyQueued || !opts.onChange) return;
      notifyQueued = true;
      Promise.resolve().then(function () { notifyQueued = false; if (alive) opts.onChange(stats()); });
    }

    function stats() {
      var rest = 0, i;
      for (i = 0; i < pieces.length; i++) if (pieces[i].state === 'rest') rest++;
      return { pieces: pieces.length, resting: rest, uncut: Core.uncutCount(grid), total: grid.cols * grid.rows, gentle: gentle, tool: tool };
    }

    // ---------- actions ----------
    function tear(mode, x0, y0, x1, y1, r, vx, vy) {
      if (pieces.length >= MAX_PIECES) return 0;
      var idx = Core.cellsAlongSegment(grid, x0, y0, x1, y1, r);
      var fresh = Core.extractPieces(grid, idx, mode);
      for (var i = 0; i < fresh.length; i++) {
        var p = fresh[i];
        p.vx = Math.max(-300, Math.min(300, vx * 0.12)) + (Math.random() - 0.5) * 60;
        p.vy = Math.max(-100, Math.min(300, vy * 0.12)) + Math.random() * 40;
        p.va = (Math.random() - 0.5) * 4;
        pieces.push(p); eraseCells(p);
      }
      if (fresh.length) { sfx.cut(); dirtyDraw = true; notify(); }
      return fresh.length;
    }

    function shoveNear(x, y, r, vx, vy) {
      var n = 0;
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        if (p.state === 'home' || p.state === 'gone') continue;
        var d = Math.hypot(p.x - x, p.y - y);
        if (d < r) { Core.shove(p, vx * (1 - d / r * 0.4), vy * 0.4); n++; }
      }
      if (n) { sfx.sweep(); Core.settleAll(field, pieces, H); dirtyDraw = true; }
    }

    function glueNear(x, y, r) {
      var n = 0;
      for (var i = 0; i < pieces.length; i++) {
        var p = pieces[i];
        if (p.state === 'home') continue;
        if (Math.hypot(p.x - x, p.y - y) < r) { sendHome(p, Math.random() * 0.12); n++; }
      }
      if (n) { sfx.glue(); Core.settleAll(field, pieces, H); dirtyDraw = true; }
    }

    function sendHome(p, delay) { Core.sendHome(p, delay); if (gentle) p.alpha = 0; }

    function applyTool(x0, y0, x1, y1) {
      var vx = ptr.vx, vy = ptr.vy;
      if (tool === 'strip' || tool === 'confetti') tear(TOOLS[tool].mode, x0, y0, x1, y1, TOOLS[tool].r, vx, vy);
      else if (tool === 'broom') shoveNear(x1, y1, TOOLS.broom.r, Math.max(-900, Math.min(900, vx)) || (x1 - x0) * 8, Math.max(-300, Math.min(300, vy)));
      else if (tool === 'glue') glueNear(x1, y1, TOOLS.glue.r);
    }

    function shredAll() {
      if (blade || pieces.length >= MAX_PIECES) return;
      blade = { y: 0, block: 0 };
      dirtyDraw = true; schedule();
    }

    function rewind() {
      blade = null;
      var i, p;
      for (i = 0; i < pieces.length; i++) {
        p = pieces[i];
        // top of the page returns first, like the page being written back
        sendHome(p, (p.hy / H) * 0.9 + Math.random() * 0.2);
      }
      if (pieces.length) sfx.glue();
      Core.settleAll(field, pieces, H);
      dirtyDraw = true; schedule();
    }

    // ---------- simulation ----------
    function step(dt) {
      var sim = { W: W, H: H, field: field, gentle: gentle }, i, p, ev, moved = false, landed = 0, arrived = false;

      if (blade) {
        blade.y += (gentle ? 520 : 1000) * dt;
        var blockPx = Core.STRIP_ROWS * grid.cell;
        while (blade.block * blockPx <= blade.y && blade.block * Core.STRIP_ROWS < grid.rows) {
          var idx = [], r0 = blade.block * Core.STRIP_ROWS, r1 = Math.min(grid.rows, r0 + Core.STRIP_ROWS);
          for (var r = r0; r < r1; r++) for (var c = 0; c < grid.cols; c++) idx.push(r * grid.cols + c);
          var fresh = Core.extractPieces(grid, idx, 'strip');
          if (pieces.length + fresh.length > MAX_PIECES) fresh.length = Math.max(0, MAX_PIECES - pieces.length);
          for (i = 0; i < fresh.length; i++) {
            p = fresh[i];
            p.delay = Math.random() * 0.35; p.vx = (Math.random() - 0.5) * 80; p.vy = 0; p.va = (Math.random() - 0.5) * 3;
            pieces.push(p); eraseCells(p);
          }
          if (fresh.length) { sfx.cut(); notify(); }
          blade.block++;
        }
        if (blade.block * Core.STRIP_ROWS >= grid.rows && blade.y > H + 40) blade = null;
        moved = true;
      }

      for (i = pieces.length - 1; i >= 0; i--) {
        p = pieces[i];
        if (p.state === 'rest' || (p.state === 'gone')) continue;
        ev = Core.stepPiece(p, dt, sim);
        moved = true;
        if (ev === 'landed') landed++;
        else if (ev === 'arrived') {
          Core.restoreCells(grid, p); paintBack(p);
          pieces.splice(i, 1); arrived = true;
        }
      }
      if (landed) sfx.thud();
      if (arrived) { Core.settleAll(field, pieces, H); notify(); }
      if (landed || arrived) notify();
      if (moved) dirtyDraw = true;
      return moved;
    }

    // ---------- drawing ----------
    function draw() {
      if (dirtySheet) redrawCache();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.drawImage(desk, 0, 0);
      ctx.drawImage(cache, 0, 0);
      var i, p, c, s;
      for (i = 0; i < pieces.length; i++) {
        p = pieces[i];
        if (p.state === 'gone' || p.alpha <= 0.01) continue;
        c = Math.cos(p.ang) * dpr; s = Math.sin(p.ang) * dpr;
        ctx.setTransform(c, s, -s, c, p.x * dpr, p.y * dpr);
        ctx.globalAlpha = p.alpha;
        ctx.drawImage(source, p.sx * scale, p.sy * scale, p.w * scale, p.h * scale, -p.w / 2, -p.h / 2, p.w, p.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 0.6;
        ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      if (blade) {
        var g = ctx.createLinearGradient(0, blade.y - 40, 0, blade.y + 4);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, theme.glow);
        ctx.fillStyle = g; ctx.fillRect(0, blade.y - 40, W, 44);
        ctx.fillStyle = theme.ring; ctx.fillRect(0, blade.y, W, 2);
      }
      if (ptr.inside || kbRing) drawCursor();
    }

    function drawCursor() {
      var r = TOOLS[tool].r;
      ctx.save();
      ctx.translate(ptr.x, ptr.y);
      ctx.lineWidth = 2; ctx.strokeStyle = theme.ring; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 4;
      if (tool === 'strip') { ctx.setLineDash([5, 4]); ctx.strokeRect(-r, -r, r * 2, r * 2); }
      else if (tool === 'confetti') { ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke(); }
      else if (tool === 'broom') {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.setLineDash([2, 7]); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); for (var i = -3; i <= 3; i++) { ctx.moveTo(i * 9, -4); ctx.lineTo(i * 12, 22); } ctx.stroke();
      } else {
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.283); ctx.stroke();
        ctx.fillStyle = theme.glow; ctx.globalAlpha = 0.18; ctx.fill();
      }
      if (down || kbDown) { ctx.globalAlpha = 1; ctx.fillStyle = theme.glow; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 6.283); ctx.fill(); }
      ctx.restore();
    }

    function frame(ts) {
      raf = 0;
      if (!alive) return;
      var dt = last ? Math.min(0.033, (ts - last) / 1000) : 0.016;
      last = ts;
      var moved = step(dt);
      if (dirtyDraw || dirtySheet) { draw(); dirtyDraw = false; }
      if (moved || blade) schedule(); else last = 0;
    }
    function schedule() { if (!raf && alive) raf = requestAnimationFrame(frame); }

    // ---------- input ----------
    function pos(e) {
      var rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
    }
    function move(x, y, t) {
      var dt = Math.max(0.008, (t - ptr.t) / 1000);
      var ox = ptr.x, oy = ptr.y;
      ptr.vx = (x - ox) / dt * 0.6 + ptr.vx * 0.4; ptr.vy = (y - oy) / dt * 0.6 + ptr.vy * 0.4;
      ptr.x = x; ptr.y = y; ptr.t = t;
      if (down || kbDown) applyTool(ox, oy, x, y);
      dirtyDraw = true; schedule();
    }
    function onDown(e) {
      var p = pos(e); ptr.inside = true; ptr.t = e.timeStamp; ptr.vx = ptr.vy = 0; ptr.x = p.x; ptr.y = p.y;
      down = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      applyTool(p.x, p.y, p.x, p.y);
      dirtyDraw = true; schedule(); e.preventDefault();
    }
    function onMove(e) { var p = pos(e); ptr.inside = true; move(p.x, p.y, e.timeStamp); }
    function onUp() { down = false; ptr.vx = ptr.vy = 0; dirtyDraw = true; schedule(); }
    function onLeave() { if (!down) { ptr.inside = false; dirtyDraw = true; schedule(); } }
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('pointerleave', onLeave);

    // keyboard: arrows move a virtual pointer, Enter toggles "pressing"
    function kbMove(dx, dy) {
      kbRing = true;
      var x = Math.max(0, Math.min(W, ptr.x + dx)), y = Math.max(0, Math.min(H, ptr.y + dy));
      ptr.vx = dx * 20; ptr.vy = dy * 20;
      var ox = ptr.x, oy = ptr.y; ptr.x = x; ptr.y = y;
      if (kbDown) applyTool(ox, oy, x, y);
      dirtyDraw = true; schedule();
    }
    function kbToggle() {
      kbRing = true; kbDown = !kbDown;
      if (kbDown) applyTool(ptr.x, ptr.y, ptr.x, ptr.y);
      dirtyDraw = true; schedule();
      return kbDown;
    }

    draw(); dirtyDraw = false;

    return {
      get tool() { return tool; },
      setTool: function (t) { if (TOOLS[t]) { tool = t; dirtyDraw = true; schedule(); notify(); } },
      get gentle() { return gentle; },
      setGentle: function (g) { gentle = !!g; notify(); schedule(); },
      setSound: function (on) { sfx.enabled = !!on; },
      get sound() { return sfx.enabled; },
      shredAll: shredAll, rewind: rewind, kbMove: kbMove, kbToggle: kbToggle,
      step: step, draw: function () { draw(); dirtyDraw = false; },
      /** Tear programmatically (used by tests and the landing-page hero). */
      tearAt: function (mode, x0, y0, x1, y1, r) { var n = tear(mode, x0, y0, x1, y1, r || TOOLS[mode].r, 0, 0); schedule(); return n; },
      stats: stats,
      pieces: function () { return pieces; },
      busy: function () { return !!blade || pieces.some(function (p) { return p.state === 'fall' || p.state === 'home' || p.delay > 0; }); },
      destroy: function () {
        alive = false; if (raf) cancelAnimationFrame(raf);
        canvas.removeEventListener('pointerdown', onDown); canvas.removeEventListener('pointermove', onMove);
        canvas.removeEventListener('pointerup', onUp); canvas.removeEventListener('pointercancel', onUp);
        canvas.removeEventListener('pointerleave', onLeave);
        sfx.close(); pieces.length = 0;
        sheet.width = cache.width = desk.width = 1;
      }
    };
  }

  return { create: create, TOOLS: TOOLS };
});
