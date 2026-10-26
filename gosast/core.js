/*
 * Gosast core: the pure maths of tearing a page into pieces.
 *
 * Nothing in this file touches the DOM, the canvas or the network, so it can
 * be unit-tested in plain Node. The engine (engine.js) wires it to a canvas.
 *
 * Vocabulary
 *   grid   - the page cut into small square cells (CELL px). A cell is either
 *            still on the sheet (cut = 0) or has been torn out (cut = 1).
 *   piece  - a torn-out run of cells that now moves on its own. A "strip" is
 *            a tall run of cells (like paper from a shredder), "confetti" is
 *            a single cell.
 *   field  - a height map of the pile on the floor, used so pieces land on
 *            top of each other instead of passing through.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GosastCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var CELL = 14;          // width/height of one grid cell in CSS px
  var STRIP_ROWS = 8;     // a strip is at most this many cells tall (112 px)
  var FIELD_STEP = 4;     // pile height map resolution in px
  var HALF_PI = Math.PI / 2;

  /** Create a grid that covers a w x h px area. */
  function makeGrid(w, h, cell) {
    cell = cell || CELL;
    var cols = Math.ceil(w / cell), rows = Math.ceil(h / cell);
    return { w: w, h: h, cell: cell, cols: cols, rows: rows, cut: new Uint8Array(cols * rows) };
  }

  /** Pixel rectangle of the cell range [c0..c1] x [r0..r1], clipped to the grid area. */
  function cellRect(grid, c0, r0, c1, r1) {
    var x = c0 * grid.cell, y = r0 * grid.cell;
    var x2 = Math.min((c1 + 1) * grid.cell, grid.w), y2 = Math.min((r1 + 1) * grid.cell, grid.h);
    return { x: x, y: y, w: x2 - x, h: y2 - y };
  }

  /** Indices of every cell whose square touches the circle (cx, cy, r). */
  function cellsInCircle(grid, cx, cy, r) {
    var out = [], cell = grid.cell;
    var c0 = Math.max(0, Math.floor((cx - r) / cell)), c1 = Math.min(grid.cols - 1, Math.floor((cx + r) / cell));
    var r0 = Math.max(0, Math.floor((cy - r) / cell)), r1 = Math.min(grid.rows - 1, Math.floor((cy + r) / cell));
    for (var row = r0; row <= r1; row++) {
      for (var col = c0; col <= c1; col++) {
        // distance from the circle centre to the nearest point of the cell square
        var nx = Math.max(col * cell, Math.min(cx, (col + 1) * cell));
        var ny = Math.max(row * cell, Math.min(cy, (row + 1) * cell));
        var dx = cx - nx, dy = cy - ny;
        if (dx * dx + dy * dy <= r * r) out.push(row * grid.cols + col);
      }
    }
    return out;
  }

  /** Cells touched by a circle swept from (x0,y0) to (x1,y1), no duplicates. */
  function cellsAlongSegment(grid, x0, y0, x1, y1, r) {
    var dist = Math.hypot(x1 - x0, y1 - y0);
    var steps = Math.max(1, Math.ceil(dist / (grid.cell * 0.5)));
    var seen = Object.create(null), out = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var hit = cellsInCircle(grid, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r);
      for (var k = 0; k < hit.length; k++) if (!seen[hit[k]]) { seen[hit[k]] = 1; out.push(hit[k]); }
    }
    return out;
  }

  var nextId = 1;
  function newPiece(grid, c0, r0, c1, r1, cells, kind) {
    var rect = cellRect(grid, c0, r0, c1, r1);
    return {
      id: nextId++, kind: kind, cells: cells,
      sx: rect.x, sy: rect.y, w: rect.w, h: rect.h,            // source rectangle in the page, in CSS px
      hx: rect.x + rect.w / 2, hy: rect.y + rect.h / 2,        // home centre (where glue sends it back)
      x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, ang: 0,  // current centre and angle
      vx: 0, vy: 0, va: 0, alpha: 1, state: 'fall', delay: 0, t: 0, seed: Math.random()
    };
  }

  /**
   * Tear the given cells out of the sheet.
   * mode 'confetti': one piece per cell.
   * mode 'strip'   : every cell hit pulls out the whole uncut run of its
   *                  column inside its 8-row block, so you get tall strips.
   * Marks the cells as cut and returns the new pieces.
   */
  function extractPieces(grid, indices, mode) {
    var pieces = [], i, idx, col, row;
    if (mode === 'confetti') {
      for (i = 0; i < indices.length; i++) {
        idx = indices[i];
        if (grid.cut[idx]) continue;
        grid.cut[idx] = 1;
        col = idx % grid.cols; row = (idx - col) / grid.cols;
        pieces.push(newPiece(grid, col, row, col, row, [idx], 'confetti'));
      }
      return pieces;
    }
    for (i = 0; i < indices.length; i++) {
      idx = indices[i];
      if (grid.cut[idx]) continue;
      col = idx % grid.cols; row = (idx - col) / grid.cols;
      // grow the run of uncut cells up and down from the hit cell, staying inside its block
      var block = Math.floor(row / STRIP_ROWS);
      var top = row, bottom = row, rowStart = block * STRIP_ROWS, rowEnd = Math.min(grid.rows - 1, rowStart + STRIP_ROWS - 1);
      while (top > rowStart && !grid.cut[(top - 1) * grid.cols + col]) top--;
      while (bottom < rowEnd && !grid.cut[(bottom + 1) * grid.cols + col]) bottom++;
      var cells = [];
      for (var q = top; q <= bottom; q++) { cells.push(q * grid.cols + col); grid.cut[q * grid.cols + col] = 1; }
      pieces.push(newPiece(grid, col, top, col, bottom, cells, 'strip'));
    }
    return pieces;
  }

  /** Put a piece's cells back on the sheet (called when it has flown home). */
  function restoreCells(grid, piece) {
    for (var i = 0; i < piece.cells.length; i++) grid.cut[piece.cells[i]] = 0;
  }

  /** Number of cells still on the sheet. */
  function uncutCount(grid) {
    var n = 0;
    for (var i = 0; i < grid.cut.length; i++) if (!grid.cut[i]) n++;
    return n;
  }

  // ---------- the pile ----------

  function makeField(w) {
    return { step: FIELD_STEP, n: Math.ceil(w / FIELD_STEP) + 1, h: new Float32Array(Math.ceil(w / FIELD_STEP) + 1) };
  }

  function fieldSpan(field, x0, x1) {
    var a = Math.max(0, Math.floor(x0 / field.step)), b = Math.min(field.n - 1, Math.floor(x1 / field.step));
    return [a, Math.max(a, b)];
  }

  /** Height of the pile (px above the floor) under the horizontal span [x0, x1]. */
  function pileHeight(field, x0, x1) {
    var s = fieldSpan(field, x0, x1), m = 0;
    for (var i = s[0]; i <= s[1]; i++) if (field.h[i] > m) m = field.h[i];
    return m;
  }

  /** Raise the pile under [x0, x1] to at least `top` px above the floor. */
  function raisePile(field, x0, x1, top) {
    var s = fieldSpan(field, x0, x1);
    for (var i = s[0]; i <= s[1]; i++) if (field.h[i] < top) field.h[i] = top;
  }

  /** Half-extents of a w x h rectangle rotated by `ang`. */
  function extents(w, h, ang) {
    var c = Math.abs(Math.cos(ang)), s = Math.abs(Math.sin(ang));
    return { hw: (c * w + s * h) / 2, hh: (s * w + c * h) / 2 };
  }

  /** Nearest orientation where a piece lies flat (multiple of 90 degrees). */
  function flatAngle(ang) { return Math.round(ang / HALF_PI) * HALF_PI; }

  /**
   * Re-derive the whole pile from the resting pieces, lowest first. A resting
   * piece that no longer has anything under it (it was swept or glued away)
   * is woken up so it falls again. Returns how many pieces were woken.
   */
  function settleAll(field, pieces, floorY) {
    field.h.fill(0);
    var rest = pieces.filter(function (p) { return p.state === 'rest'; });
    rest.sort(function (a, b) { return b.y - a.y; });
    var woken = 0;
    for (var i = 0; i < rest.length; i++) {
      var p = rest[i], e = extents(p.w, p.h, p.ang);
      var bottom = floorY - (p.y + e.hh);                 // gap between the piece and the floor
      var support = pileHeight(field, p.x - e.hw, p.x + e.hw);
      if (bottom > support + 3) { p.state = 'fall'; p.vy = 0; p.va = 0; woken++; continue; }
      raisePile(field, p.x - e.hw, p.x + e.hw, floorY - (p.y - e.hh));
    }
    return woken;
  }

  // ---------- motion ----------

  var GRAVITY = 1500;      // px/s^2
  var GENTLE_DRIFT = 26;   // px/s, slow sink in gentle mode
  var GENTLE_FADE = 0.9;   // alpha lost per second in gentle mode

  /**
   * Advance one piece by dt seconds.
   * ctx = { W, H, field, gentle }. Returns 'landed' on the frame a piece
   * comes to rest, 'gone' when a gentle piece has faded out, 'arrived' when a
   * piece reaches home, otherwise null.
   */
  function stepPiece(p, dt, ctx) {
    p.t += dt;
    if (p.delay > 0) { p.delay -= dt; return null; }
    var e;

    if (p.state === 'home') {
      if (ctx.gentle || p.fadeHome) {
        // gentle: the piece reappears in place
        p.x = p.hx; p.y = p.hy; p.ang = 0; p.alpha = Math.min(1, p.alpha + dt * 1.6);
        return p.alpha >= 1 ? 'arrived' : null;
      }
      // critically damped spring toward home
      var k = 90, c = 2 * Math.sqrt(k);
      p.vx += ((p.hx - p.x) * k - p.vx * c) * dt;
      p.vy += ((p.hy - p.y) * k - p.vy * c) * dt;
      var da = (0 - p.ang);
      p.va += (da * k - p.va * c) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.ang += p.va * dt;
      p.alpha = 1;
      if (Math.hypot(p.hx - p.x, p.hy - p.y) < 0.8 && Math.hypot(p.vx, p.vy) < 12 && Math.abs(p.ang) < 0.02) {
        p.x = p.hx; p.y = p.hy; p.ang = 0;
        return 'arrived';
      }
      return null;
    }

    if (p.state === 'rest') return null;

    if (ctx.gentle) {
      // calm mode: no spin, no pile, just drift down and fade away
      p.vx *= Math.pow(0.2, dt);
      p.vy = GENTLE_DRIFT; p.va = 0;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.alpha -= GENTLE_FADE * dt;
      if (p.alpha <= 0) { p.alpha = 0; p.state = 'gone'; return 'gone'; }
      return null;
    }

    // falling: gravity, a flutter that turns tall strips toward flat, walls, then the pile
    p.vy += GRAVITY * dt;
    p.vx *= Math.pow(0.55, dt);
    var target = flatAngle(p.ang + p.va * 0.15) + Math.sin(p.t * 7 + p.seed * 6.28) * 0.18;
    p.va += ((target - p.ang) * 22 - p.va * 3.2) * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.ang += p.va * dt;

    e = extents(p.w, p.h, p.ang);
    if (p.x - e.hw < 0) { p.x = e.hw; p.vx = Math.abs(p.vx) * 0.4; }
    if (p.x + e.hw > ctx.W) { p.x = ctx.W - e.hw; p.vx = -Math.abs(p.vx) * 0.4; }

    var floorTop = ctx.H - pileHeight(ctx.field, p.x - e.hw, p.x + e.hw);
    if (p.vy >= 0 && p.y + e.hh >= floorTop) {   // only while moving down, so a shoved piece can leave the floor
      if (p.vy > 260) {                       // a small bounce first
        p.y = floorTop - e.hh; p.vy = -p.vy * 0.22; p.va *= 0.5; p.vx *= 0.6;
        return null;
      }
      p.ang = flatAngle(p.ang) + (p.seed - 0.5) * 0.16;
      e = extents(p.w, p.h, p.ang);
      p.y = floorTop - e.hh; p.vx = p.vy = p.va = 0;
      p.state = 'rest';
      raisePile(ctx.field, p.x - e.hw, p.x + e.hw, ctx.H - (p.y - e.hh));
      return 'landed';
    }
    return null;
  }

  /** Push a piece with a broom: wake it and give it a sideways shove and a little lift. */
  function shove(p, vx, vy) {
    if (p.state === 'gone') return;
    p.state = 'fall';
    p.vx += vx; p.vy += vy - 120 - 160 * p.seed; p.va += (p.seed - 0.5) * 6;
  }

  /** Send a piece back to where it came from. `delay` staggers the return. */
  function sendHome(p, delay) {
    var wasGone = p.state === 'gone';
    p.state = 'home'; p.delay = delay || 0;
    if (wasGone) p.alpha = 0;           // gentle mode: it fades back in from nothing
  }

  return {
    CELL: CELL, STRIP_ROWS: STRIP_ROWS, FIELD_STEP: FIELD_STEP,
    makeGrid: makeGrid, cellRect: cellRect, cellsInCircle: cellsInCircle, cellsAlongSegment: cellsAlongSegment,
    extractPieces: extractPieces, restoreCells: restoreCells, uncutCount: uncutCount,
    makeField: makeField, pileHeight: pileHeight, raisePile: raisePile, extents: extents, flatAngle: flatAngle,
    settleAll: settleAll, stepPiece: stepPiece, shove: shove, sendHome: sendHome
  };
});
