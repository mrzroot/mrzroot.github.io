(() => {
  const root=document.getElementById('project-signal');
  const data=window.MRZ_PROJECTS;
  if(!root || !data) return;
  const map=root.querySelector('.atlas-map');
  const nav=root.querySelector('.atlas-nav');
  const feature=root.querySelector('.atlas-feature');
  const cover=feature.querySelector('img');
  const title=feature.querySelector('.atlas-project');
  const intro=feature.querySelector('.atlas-summary');
  const open=feature.querySelector('.atlas-open');
  const test=feature.querySelector('.atlas-case');
  const tabs=[...root.querySelectorAll('[data-atlas-group]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pageSize=6;
  const coords=[[22,23],[77,22],[76,51],[76,80],[22,80],[22,51]];
  const layouts={agents:'orbit',language:'specimen',systems:'junction',showcase:'film'};
  let group='agents', page=0, selected=0, controls=[], animation;

  const element=(tag,css,text)=>{
    const item=document.createElement(tag);
    item.className=css;
    if(text) item.textContent=text;
    return item;
  };
  const visible=()=>data.entries.filter(entry=>entry.group===group);
  const partition=()=>visible().slice(page*pageSize,(page+1)*pageSize);
  const lang=()=>document.documentElement.lang==='fa'?'fa':'en';
  const localized=pair=>pair[lang()==='fa'?1:0];

  function orbitDecor() {
    const hud=element('div','map-orbit');
    hud.setAttribute('aria-hidden','true');
    ['scan','outer','middle','inner'].forEach(name=>hud.append(element('i','orbit-'+name)));
    hud.append(element('b','orbit-core','MRZ'));
    return hud;
  }

  function select(index,motion) {
    const entry=partition()[index];
    if(!entry) return;
    selected=index;
    const [x,y]=coords[index];
    map.style.setProperty('--target-x',x+'%');
    map.style.setProperty('--target-y',y+'%');
    const angle=Math.atan2(y-50,x-50)*180/Math.PI;
    map.style.setProperty('--target-angle',angle+'deg');
    map.style.setProperty('--signal-length',Math.hypot(x-50,y-50)+'%');
    root.style.setProperty('--map-hue',entry.hue);
    controls.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    title.textContent=entry.name;
    intro.textContent=localized(entry.intro);
    if(cover.getAttribute('src')!==entry.image)cover.src=entry.image;
    open.href='/projects/guide/'+entry.id+'/?lang='+lang();
    test.href='/projects/guide/'+entry.id+'/?lang='+lang()+'#example';
    map.classList.remove('is-transmitting');
    if(motion && !reduced.matches){
      cancelAnimationFrame(animation);
      animation=requestAnimationFrame(()=>{animation=requestAnimationFrame(()=>map.classList.add('is-transmitting'));});
    }
  }

  function render(motion) {
    map.dataset.group=group;
    map.dataset.layout=layouts[group];
    map.replaceChildren();
    if(group==='agents') map.append(orbitDecor());
    const list=element('div','atlas-points');
    const entries=partition();
    controls=entries.map((entry,i)=>{
      const button=element('button','atlas-point');
      button.type='button';
      button.style.setProperty('--node-hue',entry.hue);
      button.style.setProperty('--position-x',coords[i][0]+'%');
      button.style.setProperty('--position-y',coords[i][1]+'%');
      button.dataset.motif=entry.motif;
      if(group==='showcase'){
        const image=element('img','atlas-cell-image');
        image.src=entry.image;image.alt='';image.loading='lazy';image.decoding='async';
        button.append(image);
      }else{
        const icon=element('i','atlas-point-mark');
        icon.setAttribute('aria-hidden','true');
        button.append(icon);
      }
      const caption=element('span','atlas-point-name',entry.name);
      caption.dir='ltr';button.append(caption);
      button.addEventListener('click',()=>select(i,true));
      button.addEventListener('keydown',event=>{
        if(!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
        event.preventDefault();
        const step=['ArrowRight','ArrowDown'].includes(event.key)?1:-1;
        const index=event.key==='Home'?0:event.key==='End'?entries.length-1:(entries.length+i+step)%entries.length;
        controls[index].focus();select(index,true);
      });
      return button;
    });
    list.append(...controls);
    map.append(list);
    const count=Math.max(1,Math.ceil(visible().length/pageSize));
    nav.hidden=count===1;
    nav.querySelector('.atlas-count').textContent=(page+1)+' / '+count;
    nav.querySelector('[data-atlas-page="-1"]').disabled=page===0;
    nav.querySelector('[data-atlas-page="1"]').disabled=page===count-1;
    select(0,motion);
  }

  tabs.forEach(button=>button.addEventListener('click',()=>{
    group=button.dataset.atlasGroup;
    page=0;
    tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));
    render(true);
  }));
  nav.querySelectorAll('[data-atlas-page]').forEach(button=>button.addEventListener('click',()=>{
    page+=Number(button.dataset.atlasPage);
    render(true);
    controls[0].focus();
  }));
  new MutationObserver(()=>select(selected,false)).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-lang']});
  render(false);
})();
