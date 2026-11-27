(() => {
  const fullTurn = Math.PI * 2;
  const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

  window.mountMrzOrbit = function mountMrzOrbit(map, buttons, toggle, reduced) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx || !window.ResizeObserver) return null;
    const backdrop = document.createElement('canvas');
    const backdropContext = backdrop.getContext('2d');
    canvas.className = 'atlas-radar';
    canvas.setAttribute('aria-hidden','true');
    map.prepend(canvas);
    map.classList.add('has-radar');
    const tools = toggle.closest('.atlas-orbit-tools');
    tools.hidden = false;

    let width = 0, height = 0, frame = 0, previous = 0;
    let phase = -.77, scan = -1.5, selected = 0, pulseStart = -Infinity;
    let onscreen = true, overButton = false, keyboard = false, disposed = false;
    let palette, hue = 35, deckDirty = true;
    const nodes = buttons.map((button,index) => ({
      button,
      index,
      elevation: index % 2 ? .19 : .10,
      x:0, y:0, baseX:0, baseY:0, near:0
    }));

    function theme() {
      palette = {
        ink:'217,180,123', beam:'255,203,117',
        rim:'#a58155', deck:'#15303d', lower:'#091922',
        upper:'#294c5a', hub:'#eeba70', hubGlow:'#fff1c1'
      };
      deckDirty = true;
      invalidate();
    }

    // The plane has two horizontal axes and an independent height for tracks and targets.
    function project(x,z,elevation) {
      const factor = 1 + z * .105;
      return [
        width * .50 + x * width * .351 * factor,
        height * .52 + (.82 * z - elevation) * height * .335 * factor
      ];
    }

    function polar(radius,angle,elevation) {
      return project(radius*Math.cos(angle),radius*Math.sin(angle),elevation);
    }

    function path(points, context = ctx) {
      context.beginPath();
      for (const [index, point] of points.entries()) {
        if (index) context.lineTo(point[0],point[1]);
        else context.moveTo(point[0],point[1]);
      }
    }

    function arc(radius,start,end,elevation,steps = 36) {
      return Array.from({length:steps+1},(_,i)=>polar(radius,start+(end-start)*i/steps,elevation));
    }

    function circle(radius,elevation,rgb,alpha,context = ctx) {
      path(arc(radius,0,fullTurn,elevation,64),context);
      context.strokeStyle='rgba('+rgb+','+alpha+')';
      context.lineWidth=1;
      context.stroke();
    }

    function stage() {
      const context=backdropContext;
      context.clearRect(0,0,width,height);
      const top = arc(1.22,0,fullTurn,-.08,72);
      const rimTop = arc(1.22,0,Math.PI,-.08);
      const rimBase = arc(1.22,Math.PI,0,-.18);
      path([...rimTop,...rimBase],context);context.closePath();
      context.fillStyle=palette.lower;context.fill();
      context.strokeStyle=palette.rim;context.lineWidth=1;context.stroke();
      const surface=context.createLinearGradient(0,height*.15,0,height*.89);
      surface.addColorStop(0,palette.upper);
      surface.addColorStop(1,palette.deck);
      path(top,context);context.closePath();context.fillStyle=surface;context.fill();
      context.strokeStyle=palette.rim;context.stroke();

      for(let i=0;i<12;i++){
        const angle=i * fullTurn/12;
        path([polar(.2,angle,-.078),polar(1.16,angle,-.078)],context);
        context.strokeStyle='rgba('+palette.ink+',.23)';context.stroke();
      }
      for(let i=0;i<60;i++){
        const angle=i * fullTurn/60;
        path([polar(i%5===0?1.10:1.15,angle,-.075),polar(1.20,angle,-.075)],context);
        context.strokeStyle='rgba('+palette.ink+','+(i%5===0?.63:.30)+')';context.stroke();
      }
      for(const radius of [.24,.43,.63,.83,1.03])circle(radius,-.078,palette.ink,.31,context);
      for(const radius of [.76,1.02])circle(radius,.14,palette.ink,.45,context);
    }

    function scanDeck() {
      for(let i=0;i<20;i++){
        const from=scan-.95+i*.0475;
        path([project(0,0,-.075),...arc(1.19,from,from+.049,-.075,4)]);
        ctx.closePath();
        ctx.fillStyle='rgba('+palette.beam+','+(.025+i*.010)+')';
        ctx.fill();
      }
      path([project(0,0,-.07),polar(1.19,scan,-.07)]);
      ctx.lineWidth=1.65;ctx.strokeStyle='rgba('+palette.beam+',.83)';ctx.stroke();
    }

    function hub() {
      const [x,y]=project(0,0,.02);
      const [highX,highY]=project(0,0,.235);
      path(arc(.14,0,fullTurn,.045,24));
      ctx.fillStyle=palette.lower;ctx.fill();
      path(arc(.14,0,fullTurn,.19,24));
      ctx.fillStyle=palette.hub;ctx.fill();
      circle(.149,.195,palette.beam,.73);
      const radius=clamp(width*.014,5,12);
      const core=ctx.createRadialGradient(highX,highY,0,highX,highY,radius*3);
      core.addColorStop(0,palette.hubGlow);
      core.addColorStop(.25,palette.hub);
      core.addColorStop(1,'rgba('+palette.beam+',0)');
      ctx.fillStyle=core;ctx.fillRect(x-radius*3,y-radius*5,radius*6,radius*8);
      ctx.fillStyle=palette.hubGlow;ctx.beginPath();
      ctx.arc(highX,highY,radius*.43,0,fullTurn);ctx.fill();
    }

    function render(now) {
      frame=0;
      if (!onscreen || !width || disposed || document.hidden) return;
      const dt=previous ? clamp(now-previous,0,45) : 0;
      previous=now;
      const rotating=!pauseRequested() && !overButton && !keyboard;
      if(rotating){
        phase=(phase+dt*.000115)%fullTurn;
        scan=(scan+dt*.00082)%fullTurn;
      }
      ctx.clearRect(0,0,width,height);
      if(deckDirty){stage();deckDirty=false;}
      ctx.drawImage(backdrop,0,0,width,height);
      scanDeck();
      const labelWidths=nodes.map(node=>node.button.offsetWidth*.5);

      for(const node of nodes){
        const angle=phase+node.index*fullTurn/nodes.length;
        const radius=nodes.length===1 ? .8 : 1;
        const x=radius*Math.cos(angle), z=radius*Math.sin(angle);
        const rise=node.elevation + Math.sin(phase*2+node.index)*.038;
        [node.x,node.y]=project(x,z,rise);
        [node.baseX,node.baseY]=project(x,z,-.07);
        node.near=z;
        node.heading=angle;
      }
      const ordered=[...nodes].sort((a,b)=>a.near-b.near);
      const rayAge=now-pulseStart;
      for(const node of ordered){
        const active=node.index===selected;
        path([[node.baseX,node.baseY],[node.x,node.y]]);
        ctx.strokeStyle='rgba('+palette.ink+','+(active?.77:.33)+')';ctx.lineWidth=1.1;ctx.stroke();
        ctx.beginPath();ctx.ellipse(node.baseX,node.baseY,4,2.3,0,0,fullTurn);ctx.fillStyle=palette.rim;ctx.fill();
        const alignment = Math.acos(clamp(Math.cos(node.heading - scan),-1,1));
        if(alignment < .35) {
          const glow = 1 - alignment / .35;
          ctx.beginPath();ctx.ellipse(node.baseX,node.baseY,4+glow*9,2+glow*5,0,0,fullTurn);
          ctx.strokeStyle='rgba('+palette.beam+','+(.85*glow)+')';ctx.stroke();
        }
        if(active){
          const [x0,y0]=project(0,0,.22);
          path([[x0,y0],[node.baseX,node.baseY],[node.x,node.y]]);
          ctx.strokeStyle='hsl('+hue+' 58% '+'74%'+' / .78)';
          ctx.lineWidth=1.35;ctx.stroke();
          if(!reduced.matches && rayAge<680){
            const progress=clamp(rayAge/640,0,1);
            const x=x0+(node.baseX-x0)*progress;
            const y=y0+(node.baseY-y0)*progress;
            ctx.fillStyle=palette.hubGlow;ctx.beginPath();ctx.arc(x,y,2.9,0,fullTurn);ctx.fill();
          }
        }
        const halfLabel=labelWidths[node.index];
        node.button.style.setProperty('--radar-x',clamp(node.x,halfLabel+4,width-halfLabel-4)+'px');
        node.button.style.setProperty('--radar-y',clamp(node.y,26,height-26)+'px');
        node.button.style.setProperty('--radar-z',String(Math.round(12+node.near*5)+(active?13:0)));
      }
      hub();
      map.classList.add('radar-ready');
      if(rotating || (!reduced.matches && rayAge<680))invalidate();
      else previous=0;
    }

    function invalidate() {
      if(!frame && width && onscreen && !disposed && !document.hidden)frame=requestAnimationFrame(render);
    }

    function updateMotion() {
      toggle.setAttribute('aria-pressed',String(pauseRequested()));
      invalidate();
    }

    function pauseRequested() {
      return reduced.matches || toggle.dataset.paused === 'true';
    }

    function toggleMotion() {
      toggle.dataset.paused=String(toggle.dataset.paused !== 'true');
      updateMotion();
    }

    function mediaChanged() {
      toggle.disabled=reduced.matches;
      updateMotion();
    }

    function pointerCheck(event) {
      overButton=event.type!=='pointerleave' && event.target.closest('.atlas-point')!==null;
      invalidate();
    }

    function focusCheck(event) {
      keyboard=Boolean((event.type==='focusout' ? event.relatedTarget : event.target)?.closest('.atlas-point:focus-visible'));
      invalidate();
    }

    function visibilityChanged() {
      previous=0;
      invalidate();
    }

    const resize = new ResizeObserver(([entry])=>{
      width=entry.contentRect.width;height=entry.contentRect.height;
      if(!width||!height)return;
      const dpr=Math.min(2,devicePixelRatio||1);
      canvas.width=backdrop.width=Math.round(width*dpr);
      canvas.height=backdrop.height=Math.round(height*dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      backdropContext.setTransform(dpr,0,0,dpr,0,0);
      deckDirty=true;
      invalidate();
    });
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry])=>{
      onscreen=entry.isIntersecting;previous=0;invalidate();
    },{rootMargin:'40px'}) : null;
    const themeObserver=new MutationObserver(theme);
    resize.observe(map);
    observer?.observe(map);
    themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    map.addEventListener('pointerover',pointerCheck);
    map.addEventListener('pointerleave',pointerCheck);
    map.addEventListener('focusin',focusCheck);
    map.addEventListener('focusout',focusCheck);
    toggle.addEventListener('click',toggleMotion);
    reduced.addEventListener('change',mediaChanged);
    document.addEventListener('visibilitychange',visibilityChanged);
    theme();
    mediaChanged();
    return {
      select(index,color,motion){
        selected=index;hue=color;
        if(motion && !reduced.matches)pulseStart=performance.now();
        invalidate();
      },
      destroy(){
        disposed=true;cancelAnimationFrame(frame);
        resize.disconnect();observer?.disconnect();themeObserver.disconnect();
        document.removeEventListener('visibilitychange',visibilityChanged);
        reduced.removeEventListener('change',mediaChanged);
        toggle.removeEventListener('click',toggleMotion);
        map.removeEventListener('pointerover',pointerCheck);
        map.removeEventListener('pointerleave',pointerCheck);
        map.removeEventListener('focusin',focusCheck);
        map.removeEventListener('focusout',focusCheck);
        map.classList.remove('has-radar','radar-ready');
        tools.hidden=true;
        canvas.remove();
      }
    };
  };
})();
