(() => {
  const mount = document.querySelector('.mrz-object');
  if (!mount) return;
  const canvas = mount.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const controls = mount.parentElement.querySelector('.object-controls');
  if (!ctx || !window.ResizeObserver) {
    controls.hidden = true;
    return;
  }

  // M, R and Z are separate extruded solids. Each face is shaded after rotation.
  const parts = [
    { x: -1.66, tone: 0, shape: [[0,0],[0.26,0],[0.26,0.91],[0.54,0.62],[0.63,0.62],[0.9,0.91],[0.9,0],[1.15,0],[1.15,1.42],[0.94,1.42],[0.58,1.02],[0.2,1.42],[0,1.42]] },
    { x: -0.37, tone: 1, shape: [[0,0],[0.25,0],[0.25,0.58],[0.46,0.58],[0.79,0],[1.06,0],[0.71,0.64],[0.89,0.76],[0.98,0.91],[0.98,1.15],[0.86,1.32],[0.66,1.42],[0,1.42]], hole: [[0.25,0.82],[0.25,1.16],[0.59,1.16],[0.71,1.08],[0.71,0.91],[0.59,0.82]] },
    { x: 0.82, tone: 2, shape: [[0,0],[1.03,0],[1.03,0.26],[0.37,0.26],[1.02,1.19],[1.02,1.42],[0,1.42],[0,1.16],[0.66,1.16],[0,0.24]] }
  ];
  const palettes = {
    brass: [[244,190,116], [245,214,159], [203,135,62]],
    copper: [[239,154,104], [255,200,157], [189,97,58]],
    alloy: [[232,220,185], [255,239,198], [172,161,125]]
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = controls.querySelector('[data-emblem="motion"]');
  const layers = controls.querySelector('[data-emblem="layers"]');
  const finish = controls.querySelector('[data-emblem="finish"]');
  const announcement = mount.parentElement.querySelector('.object-announcement');
  const finishes = Object.keys(palettes);
  let material = 0, expanded = false, paused = reduced.matches;
  let width = 0, height = 0, size = 1, visible = true, frame = 0, lastTime = 0;
  let pitch = -.25, yaw = -.36, targetPitch = -.25, targetYaw = -.36, separation = 0;
  let pointer = null;

  function shade(base, scale, reflect) {
    return 'rgb(' + base.map((value, index) => Math.round(Math.max(0, Math.min(255, value * scale + reflect * [1,.96,.80][index])))).join(',') + ')';
  }

  function project([x, y, z]) {
    const sy = Math.sin(yaw), cy = Math.cos(yaw), sx = Math.sin(pitch), cx = Math.cos(pitch);
    const rotatedX = x * cy + z * sy;
    const rotatedZ = z * cy - x * sy;
    const rotatedY = y * cx - rotatedZ * sx;
    const depth = y * sx + rotatedZ * cx;
    const perspective = 6.3 / (6.3 - depth);
    return [width * .5 + rotatedX * size * perspective, height * .49 - rotatedY * size * perspective, depth];
  }

  function outlines(ctx, rings) {
    ctx.beginPath();
    for (const ring of rings) {
      ring.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.closePath();
    }
  }

  function geometry() {
    const surfaces = [];
    for (const part of parts) {
      const rings = part.hole ? [part.shape,part.hole] : [part.shape];
      const shift = (part.tone - 1) * separation;
      const depth = .28;
      const section = (points, z) => points.map(([x,y]) =>
        project([x + part.x + shift, y - .71 + (part.tone === 1 ? separation * .12 : 0), z]));
      const front = rings.map(ring => section(ring, depth));
      const back = rings.map(ring => section(ring, -depth));
      const submit = (outline, face, index) => {
        const mean = outline[0].reduce((sum, p) => sum + p[2], 0) / outline[0].length;
        surfaces.push({outline, face, index, mean, tone:part.tone});
      };
      if (Math.cos(yaw) * Math.cos(pitch) >= 0) submit(front, 'front', 0);
      else submit(back, 'back', 0);
      front.forEach((ring, j) => {
        for (let i=0; i<ring.length; i++) {
          const end = (i+1) % ring.length;
          const outline = [ring[i], ring[end], back[j][end], back[j][i]];
          const signed = outline.reduce((total, a, i) => {
            const b = outline[(i+1) % outline.length];
            return total + a[0]*b[1] - b[0]*a[1];
          }, 0);
          if (signed > 0) submit([outline], 'edge', i);
        }
      });
    }
    return surfaces.sort((a,b) => a.mean - b.mean);
  }

  function paint() {
    ctx.clearRect(0,0,width,height);
    const colors = palettes[finishes[material]];
    for (const surface of geometry()) {
      const color = colors[surface.tone];
      outlines(ctx,surface.outline);
      if (surface.face === 'edge') {
        ctx.fillStyle = shade(color, .36 + (surface.index % 5)*.065 + surface.mean*.08, 2);
        ctx.fill('evenodd');
        ctx.lineWidth = .7;
        ctx.strokeStyle = shade(color,.56,8);
      } else {
        const swatch = ctx.createLinearGradient(width*.22,height*.24,width*.81,height*.72);
        const glint = Math.max(.1, Math.min(.9,.38 + Math.sin(yaw)*.32));
        swatch.addColorStop(0,shade(color,.75,10));
        swatch.addColorStop(glint,shade(color,1.08,35));
        swatch.addColorStop(Math.min(.985,glint+.15),shade(color,.85,4));
        swatch.addColorStop(1,shade(color,.55,16));
        ctx.fillStyle = swatch;
        ctx.fill('evenodd');
        ctx.lineWidth = 1.05;
        ctx.strokeStyle = shade(color,1.12,25);
      }
      ctx.stroke();
    }
  }

  function draw(time) {
    frame = 0;
    if (!visible || !width || document.hidden) return;
    const dt = Math.min(32, lastTime ? time-lastTime : 16);
    lastTime = time;
    if (!paused && !pointer) targetYaw += dt * .00034;
    const nextSeparation = expanded ? .5 : 0;
    const easing = reduced.matches ? 1 : 1-Math.pow(.86,dt/16);
    yaw += (targetYaw-yaw)*easing;
    pitch += (targetPitch-pitch)*easing;
    separation += (nextSeparation-separation)*easing;
    paint();
    if (!paused || Math.abs(yaw-targetYaw)+Math.abs(pitch-targetPitch)+Math.abs(separation-nextSeparation)>.007) request();
  }

  function request() {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function announce(strings) {
    announcement.textContent = strings[document.documentElement.lang === 'fa' ? 1 : 0];
  }

  function updateMotion() {
    motion.setAttribute('aria-pressed', String(paused));
    mount.dataset.paused = String(paused);
    request();
  }

  controls.hidden = false;
  canvas.classList.add('is-ready');
  updateMotion();
  new ResizeObserver(([entry]) => {
    width = entry.contentRect.width;
    height = entry.contentRect.height;
    const scale = Math.min(2,devicePixelRatio || 1);
    canvas.width = Math.round(width*scale);
    canvas.height = Math.round(height*scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    size = Math.min(width/5.5,height/3.05);
    request();
  }).observe(mount);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = 0;
      if (visible) request();
    }, {rootMargin:'32px'}).observe(mount);
  }
  document.addEventListener('visibilitychange',() => {lastTime=0;request();});
  reduced.addEventListener('change',() => {paused=reduced.matches;updateMotion();});

  mount.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    pointer = {id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
    mount.setPointerCapture(event.pointerId);
  });
  mount.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx=event.clientX-pointer.x, dy=event.clientY-pointer.y;
    if (!pointer.moved && Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<5) return;
    pointer.moved=true;
    pointer.x=event.clientX;pointer.y=event.clientY;
    targetYaw+=dx*.008;
    targetPitch=Math.max(-.8,Math.min(.8,targetPitch-dy*.006));
    request();
  });
  function release(event) {
    if (pointer?.id !== event.pointerId) return;
    pointer=null;
    request();
  }
  mount.addEventListener('pointerup',release);
  mount.addEventListener('pointercancel',release);
  mount.addEventListener('lostpointercapture',release);
  mount.addEventListener('keydown',event => {
    const keys={ArrowLeft:[-.22,0],ArrowRight:[.22,0],ArrowUp:[0,-.14],ArrowDown:[0,.14]};
    if (!keys[event.key]) return;
    event.preventDefault();
    targetYaw+=keys[event.key][0];
    targetPitch=Math.max(-.8,Math.min(.8,targetPitch+keys[event.key][1]));
    request();
  });
  motion.addEventListener('click',() => { paused=!paused;updateMotion(); });
  layers.addEventListener('click',() => {
    expanded=!expanded;
    layers.setAttribute('aria-pressed',String(expanded));
    announce(expanded ? ['Letters separated','حروف از هم جدا شدند'] : ['Letters joined','حروف به هم وصل شدند']);
    request();
  });
  finish.addEventListener('click',() => {
    material=(material+1)%finishes.length;
    mount.dataset.finish=finishes[material];
    announce([['Brass finish','پرداخت برنجی'],['Copper finish','پرداخت مسی'],['Champagne finish','پرداخت شامپاینی']][material]);
    request();
  });
})();
