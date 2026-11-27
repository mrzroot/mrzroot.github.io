(() => {
  const mount = document.querySelector('.mrz-object');
  if (!mount) return;
  const canvas = mount.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const figure = mount.closest('figure');
  const controls = figure.querySelector('.object-controls');
  if (!ctx || !window.ResizeObserver) return;

  // The outlines are sampled at several depths. The hole in the R runs through every layer.
  const parts = [
    { x: -1.66, tone: 0, shape: [[0,0],[0.26,0],[0.26,0.91],[0.54,0.62],[0.63,0.62],[0.9,0.91],[0.9,0],[1.15,0],[1.15,1.42],[0.94,1.42],[0.58,1.02],[0.2,1.42],[0,1.42]] },
    { x: -0.37, tone: 1, shape: [[0,0],[0.25,0],[0.25,0.58],[0.46,0.58],[0.79,0],[1.06,0],[0.71,0.64],[0.89,0.76],[0.98,0.91],[0.98,1.15],[0.86,1.32],[0.66,1.42],[0,1.42]], hole: [[0.25,0.82],[0.25,1.16],[0.59,1.16],[0.71,1.08],[0.71,0.91],[0.59,0.82]] },
    { x: 0.82, tone: 2, shape: [[0,0],[1.03,0],[1.03,0.26],[0.37,0.26],[1.02,1.19],[1.02,1.42],[0,1.42],[0,1.16],[0.66,1.16],[0,0.24]] }
  ];
  const palettes = {
    brass: [[224,161,75],[250,204,123],[199,131,60]],
    copper: [[230,146,89],[249,179,129],[193,107,65]],
    alloy: [[220,199,159],[248,223,170],[179,150,112]]
  };
  const finishes = Object.keys(palettes);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = controls.querySelector('[data-emblem="motion"]');
  const layers = controls.querySelector('[data-emblem="layers"]');
  const finish = controls.querySelector('[data-emblem="finish"]');
  const trigger = controls.querySelector('[data-emblem="burst"]');
  const announcement = figure.querySelector('.object-announcement');
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const maxYaw = .44;
  const depthBands = 8;
  const bins = Array.from({length:depthBands * 6}, () => []);
  let points = [], colors = [];
  let material = 0, expanded = false, paused = reduced.matches;
  let width = 0, height = 0, scale = 1, pixelRatio = 1;
  let frame = 0, lastTime = 0, visible = true, elapsed = 0;
  let yaw = -.17, pitch = .045, targetYaw = yaw, targetPitch = pitch, separation = 0;
  let hover = null, drag = null, impact = null;
  const burstDuration = 1250;

  function polygonContains(outline, x, y) {
    let inside = false;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      const [ax, ay] = outline[i], [bx, by] = outline[j];
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    return inside;
  }

  function buildPoints() {
    const step = .066;
    const depthLayers = width > 680 ? [-.26, -.13, 0, .13, .26] : [-.24, -.08, .08, .24];
    points = [];
    for (const part of parts) {
      for (const [layer,z] of depthLayers.entries()) {
        const front = layer === depthLayers.length - 1;
        for (let row = 0; row < 22; row++) {
          for (let column = 0; column < Math.ceil(1.15 / step); column++) {
            const x = (column + .36 + (front ? 0 : (layer % 2) * .28)) * step;
            const y = (row + .42) * step;
            if (!polygonContains(part.shape,x,y) || (part.hole && polygonContains(part.hole,x,y))) continue;
            // Interior layers sample the solid more sparsely so individual grains stay visible.
            if (!front && (row + column + layer) % 3 === 0) continue;
            const seed = ((row * 97 + column * 59 + layer * 43 + part.tone * 31) % 211) / 211;
            points.push({
              x:x + part.x + (part.tone - 1) * .13 - .09,
              y:y - .71, z, tone:part.tone, front, seed,
              dx:0, dy:0, dz:0, vx:0, vy:0, vz:0, sx:0, sy:0, radius:0
            });
          }
        }
      }
    }
  }

  function updateColors() {
    const light = document.documentElement.dataset.theme === 'light';
    const swatches = palettes[finishes[material]];
    colors = bins.map((_, index) => {
      const depth = Math.floor(index / 6);
      const tone = Math.floor(index % 6 / 2);
      const front = index % 2;
      const strength = light ? .56 + depth * .035 + front * .085 : .60 + depth * .045 + front * .18;
      const alpha = light ? (front ? .98 : .58) : (front ? .99 : .66);
      return 'rgba(' + swatches[tone].map(value => clamp(Math.round(value * strength),0,255)).join(',') + ',' + alpha + ')';
    });
  }

  function request() {
    if (!frame && visible && width && !document.hidden) frame = requestAnimationFrame(render);
  }

  function applyCameraForce(point, x, y, z, sy, cy, sp, cp) {
    // Invert the view rotation so pointer force displaces the points in world space.
    const unpitchedZ = y * sp + z * cp;
    point.vx += x * cy - unpitchedZ * sy;
    point.vy += y * cp - z * sp;
    point.vz += x * sy + unpitchedZ * cy;
  }

  function paintPulse(now) {
    if (!impact || !impact.point) return;
    const age = now - impact.time;
    if (age < 0 || age >= 550) return;
    const amount = age / 550;
    ctx.strokeStyle = 'rgba(198,124,51,' + (.53 * (1 - amount)) + ')';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(impact.point.x,impact.point.y,7 + amount * Math.min(width,height) * .38,0,Math.PI * 2);
    ctx.stroke();
  }

  function render(now) {
    frame = 0;
    if (!visible || !width || document.hidden) return;
    const dt = lastTime ? clamp((now - lastTime) / (1000/60),.25,1.7) : 1;
    lastTime = now;
    if (!paused && !drag) elapsed += dt / 60;
    const auto = paused || drag ? 0 : Math.sin(elapsed * .63) * .155;
    const wantedYaw = clamp(targetYaw + auto,-maxYaw,maxYaw);
    const wantedPitch = targetPitch + (paused || drag ? 0 : Math.sin(elapsed * .49) * .042);
    const wantedSeparation = expanded ? .35 : 0;
    const ease = reduced.matches ? 1 : 1 - Math.pow(.81,dt);
    const settle = (current,target) => Math.abs(target-current) < .0014 ? target : current + (target-current)*ease;
    yaw = settle(yaw,wantedYaw);
    pitch = settle(pitch,wantedPitch);
    separation = settle(separation,wantedSeparation);
    const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
    const damping = Math.pow(.816,dt), spring = .074 * dt;
    const activeHover = !reduced.matches && hover && !drag;
    const hoverRadius = clamp(width * .104,43,109);
    let moving = false;
    for (const bin of bins) bin.length = 0;

    for (const point of points) {
      // The spring pulls each grain back to its own position after a touch or hover.
      const x = point.x + (point.tone - 1) * separation + point.dx;
      const y = point.y + point.dy;
      const z = point.z + point.dz;
      const turnedX = x * cy + z * sy;
      const turnedZ = z * cy - x * sy;
      const depth = y * sp + turnedZ * cp;
      const zoom = 6.8 / (6.8 - clamp(depth,-2.2,2.2));
      point.sx = width * .5 + turnedX * scale * zoom;
      point.sy = height * .48 - (y * cp - turnedZ * sp) * scale * zoom;
      point.radius = clamp(scale * .0165,.72,2.2) * zoom * (point.front ? 1.08 : .77 + point.seed * .20);
      const band = clamp(Math.floor((depth + 1.76) * depthBands / 3.52),0,depthBands - 1);
      bins[band * 6 + point.tone * 2 + Number(point.front)].push(point);

      if (activeHover) {
        const offsetX = point.sx - hover.x, offsetY = hover.y - point.sy;
        const distance = Math.hypot(offsetX,offsetY);
        if (distance < hoverRadius) {
          const magnitude = .020 * (1 - distance / hoverRadius) ** 1.7 * dt;
          applyCameraForce(point,offsetX/Math.max(distance,4)*magnitude,offsetY/Math.max(distance,4)*magnitude,
            -magnitude * (.35 + point.seed),sy,cy,sp,cp);
        }
      }
      point.vx = (point.vx - point.dx * spring) * damping;
      point.vy = (point.vy - point.dy * spring) * damping;
      point.vz = (point.vz - point.dz * spring) * damping;
      point.dx += point.vx * dt;
      point.dy += point.vy * dt;
      point.dz += point.vz * dt;
      const energy = Math.abs(point.dx)+Math.abs(point.dy)+Math.abs(point.dz)+
        Math.abs(point.vx)+Math.abs(point.vy)+Math.abs(point.vz);
      if (energy) {
        moving = true;
        if (energy < .004) point.dx = point.dy = point.dz = point.vx = point.vy = point.vz = 0;
      }
    }

    ctx.clearRect(0,0,width,height);
    bins.forEach((bin,index) => {
      if (!bin.length) return;
      ctx.beginPath();
      ctx.fillStyle = colors[index];
      for (const dot of bin) {
        ctx.moveTo(dot.sx + dot.radius,dot.sy);
        ctx.arc(dot.sx,dot.sy,dot.radius,0,Math.PI * 2);
      }
      ctx.fill();
    });
    paintPulse(now);
    if (impact && now - impact.time >= burstDuration) {
      impact = null;
      mount.dataset.impact = 'idle';
    }
    if (!paused || moving || impact ||
        yaw !== wantedYaw || pitch !== wantedPitch || separation !== wantedSeparation) request();
    else lastTime = 0;
  }

  function announce(strings) {
    announcement.textContent = strings[document.documentElement.lang === 'fa' ? 1 : 0];
  }

  function scatter(origin) {
    if (!points.length) return;
    const hit = origin || {x:width*.5,y:height*.48};
    if (reduced.matches) {
      // Show a stationary response without sending anything across the viewport.
      const wasLit = mount.classList.toggle('particle-highlight');
      announce(wasLit ? ['Logo highlighted','نشان روشن شد'] : ['Logo restored','نشان به حالت اول برگشت']);
      return;
    }
    const sy = Math.sin(yaw), cy = Math.cos(yaw), sp = Math.sin(pitch), cp = Math.cos(pitch);
    for (const point of points) {
      const dx = point.sx - hit.x, dy = hit.y - point.sy;
      const angle = Math.atan2(dy,dx) + (point.seed - .5) * 1.35;
      const distance = Math.hypot(dx,dy) / scale;
      const force = (.078 + .16 / (1 + distance * .76)) * (.6 + point.seed * .75);
      applyCameraForce(point,Math.cos(angle)*force,Math.sin(angle)*force,(point.seed - .45)*force*2.7,sy,cy,sp,cp);
      point.vx = clamp(point.vx,-.24,.24);
      point.vy = clamp(point.vy,-.24,.24);
      point.vz = clamp(point.vz,-.32,.32);
    }
    impact = {point:hit,time:performance.now()};
    mount.dataset.impact = 'burst';
    announce(['Particles scattered and reforming','ذره‌ها پخش شدند و دوباره شکل می‌گیرند']);
    request();
  }

  function localPointer(event) {
    const bounds = mount.getBoundingClientRect();
    return {x:event.clientX - bounds.left - mount.clientLeft,y:event.clientY - bounds.top - mount.clientTop};
  }

  function updateMotion() {
    motion.setAttribute('aria-pressed',String(paused));
    mount.dataset.paused = String(paused);
    request();
  }

  new ResizeObserver(([entry]) => {
    width = entry.contentRect.width;
    height = entry.contentRect.height;
    if (!width || !height) return;
    pixelRatio = Math.min(2,devicePixelRatio || 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    scale = Math.min(width / 5.1,height / 2.51);
    if (!points.length) buildPoints();
    if (!colors.length) updateColors();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    render(performance.now());
    mount.tabIndex = 0;
    controls.hidden = false;
    canvas.classList.add('is-ready');
  }).observe(mount);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = 0;
      if (visible) request();
      else hover = null;
    },{rootMargin:'40px'}).observe(mount);
  }
  new MutationObserver(() => { updateColors(); request(); }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',() => { lastTime = 0; request(); });
  reduced.addEventListener('change',() => {
    paused = reduced.matches;
    if (reduced.matches) {
      impact = null;
      mount.dataset.impact = 'idle';
      for (const point of points) point.dx = point.dy = point.dz = point.vx = point.vy = point.vz = 0;
    } else {
      mount.classList.remove('particle-highlight');
    }
    updateMotion();
  });

  mount.addEventListener('pointerdown',event => {
    if (!event.isPrimary || event.button !== 0) return;
    const position = localPointer(event);
    drag = {id:event.pointerId, start:position, last:position, moved:false};
    mount.setPointerCapture(event.pointerId);
    hover = null;
  });
  mount.addEventListener('pointermove',event => {
    const position = localPointer(event);
    if (drag?.id === event.pointerId) {
      if (!drag.moved && Math.hypot(position.x-drag.start.x,position.y-drag.start.y) < 6) return;
      drag.moved = true;
      targetYaw = clamp(targetYaw + (position.x-drag.last.x)*.006,-maxYaw,maxYaw);
      targetPitch = clamp(targetPitch - (position.y-drag.last.y)*.004,-.27,.27);
      drag.last = position;
    } else if (event.pointerType === 'mouse' && !reduced.matches) {
      hover = position;
    }
    request();
  });
  function release(event) {
    if (drag?.id !== event.pointerId) return;
    const { moved } = drag;
    drag = null;
    if (event.type === 'pointerup' && !moved) scatter(localPointer(event));
    request();
  }
  mount.addEventListener('pointerup',release);
  mount.addEventListener('pointercancel',release);
  mount.addEventListener('lostpointercapture',release);
  mount.addEventListener('pointerleave',() => { hover = null; request(); });
  mount.addEventListener('keydown',event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!event.repeat) scatter();
      return;
    }
    const keys = {ArrowLeft:[-.16,0],ArrowRight:[.16,0],ArrowUp:[0,-.11],ArrowDown:[0,.11]};
    if (!keys[event.key]) return;
    event.preventDefault();
    targetYaw = clamp(targetYaw+keys[event.key][0],-maxYaw,maxYaw);
    targetPitch = clamp(targetPitch+keys[event.key][1],-.27,.27);
    request();
  });
  trigger.addEventListener('click',() => scatter());
  motion.addEventListener('click',() => {
    paused = !paused;
    if (paused) {
      targetYaw = yaw;
      targetPitch = pitch;
    }
    updateMotion();
  });
  layers.addEventListener('click',() => {
    expanded = !expanded;
    layers.setAttribute('aria-pressed',String(expanded));
    announce(expanded ? ['Letters separated','حروف از هم جدا شدند'] : ['Letters joined','حروف کنار هم قرار گرفتند']);
    request();
  });
  finish.addEventListener('click',() => {
    material = (material + 1) % finishes.length;
    mount.dataset.finish = finishes[material];
    announce([['Brass finish','رنگ برنجی'],['Copper finish','رنگ مسی'],['Champagne finish','رنگ شامپاینی']][material]);
    updateColors();
    request();
  });
  updateMotion();
})();
