import { models } from './depth-models.js';

const theme = {
  use:['What it helps you do','به چه کار می‌آید؟'],
  view:['Interactive model','نمای تعاملی'],
  parts:['Inspect a part','بررسی اجزا'],
  split:['Explode view','باز کردن لایه‌ها'],
  turn:['Rotate view','چرخاندن نما'],
  reset:['Reset view','نمای اولیه'],
  diagram:['Drag to turn. Select a part to inspect it.','برای چرخاندن بکش. برای بررسی هر بخش، نامش را انتخاب کن.'],
  step:['Active in this scenario','فعال در این سناریو'],
  retained:['Other part of the model','بخش دیگر مدل']
};

// Geometry in board percentages, with offsets in CSS pixels along the camera axis.
const forms = {
  cassette: {pose:[24,-17], parts:[[26,32,22,51,48,'reel'],[50,53,80,65,-4,'tape'],[74,32,22,51,48,'reel']], links:[[0,2]]},
  columns:  {pose:[26,-17], parts:[[27,59,16,26,6,'bar'],[50,44,18,56,25,'bar'],[74,36,17,72,45,'bar']], links:[]},
  schema:   {pose:[30,-20], parts:[[40,33,49,28,-7,'sheet'],[54,49,49,28,21,'sheet'],[67,65,49,28,49,'sheet']], links:[[0,1],[1,2]]},
  gate:     {pose:[24,22], parts:[[22,60,18,30,12,'token'],[51,47,24,73,42,'gate'],[79,59,24,39,14,'grid']], links:[[0,1],[1,2]]},
  scanner:  {pose:[29,-16], parts:[[23,57,21,47,10,'sheet'],[51,43,22,72,42,'scanner'],[78,57,22,47,13,'sheet']], links:[[0,1],[1,2]]},
  fork:     {pose:[31,-15], parts:[[20,51,22,39,7,'token'],[73,30,25,34,30,'grid'],[75,72,25,34,45,'grid']], links:[[0,1],[0,2]]},
  terminal: {pose:[23,-17], parts:[[24,45,32,52,28,'screen'],[51,63,22,22,0,'token'],[77,45,32,52,42,'screen']], links:[[0,1],[1,2]]},
  archive:  {pose:[33,-18], parts:[[30,62,28,48,10,'folder'],[51,48,28,52,29,'folder'],[72,36,28,56,51,'folder']], links:[[0,1],[1,2]]},
  timeline: {pose:[34,-15], parts:[[19,64,17,27,4,'token'],[53,51,19,31,23,'token'],[82,39,18,28,46,'token']], links:[[0,1],[1,2]]},
  shards:   {pose:[25,18], parts:[[30,45,36,54,17,'shard'],[50,50,25,63,49,'glass'],[70,57,36,54,11,'shard']], links:[]},
  type:     {pose:[18,-11], parts:[[28,47,36,56,14,'type'],[50,64,20,24,44,'token'],[73,47,36,56,26,'type']], links:[[0,1],[1,2]]},
  balance:  {pose:[27,-13], parts:[[25,59,26,32,14,'bar'],[51,43,25,55,31,'bar'],[76,54,26,42,47,'bar']], links:[[0,1],[1,2]]},
  signal:   {pose:[35,12], parts:[[22,57,23,33,17,'token'],[51,41,20,52,40,'antenna'],[78,62,23,33,18,'grid']], links:[[0,1],[1,2]]},
  cache:    {pose:[31,-18], parts:[[23,54,29,42,12,'rack'],[51,49,29,52,34,'rack'],[78,44,26,58,54,'rack']], links:[[0,1],[1,2]]},
  press:    {pose:[28,-21], parts:[[25,54,32,48,8,'sheet'],[53,54,27,64,44,'press'],[76,55,29,45,18,'sheet']], links:[[0,1],[1,2]]},
  folios:   {pose:[28,13], parts:[[25,53,33,55,3,'sheet'],[49,45,34,59,27,'screen'],[73,53,33,55,51,'sheet']], links:[]}
};

const node=(name,className='',text='')=>{
  const result=document.createElement(name);
  result.className=className;
  if(text)result.textContent=text;
  return result;
};

function wireBetween(a,b) {
  const wire=node('i','depth-wire');
  const [x,y]=a,[endX,endY]=b;
  // The plane spans 480 by 210 design units, so percentage axes need different scale factors.
  const dx=endX-x,dy=(endY-y)*210/480;
  wire.style.setProperty('--from-x',x+'%');
  wire.style.setProperty('--from-y',y+'%');
  wire.style.setProperty('--wire-size',Math.hypot(dx,dy)+'%');
  wire.style.setProperty('--wire-angle',Math.atan2(dy,dx)+'rad');
  return wire;
}

function modelPart(part,index) {
  const [x,y,width,height,elevation,shape]=part;
  const object=node('div','depth-part');
  object.dataset.shape=shape;
  object.style.setProperty('--x',x+'%');
  object.style.setProperty('--y',y+'%');
  object.style.setProperty('--w',width+'%');
  object.style.setProperty('--h',height+'%');
  object.style.setProperty('--z',elevation+'px');
  object.style.setProperty('--float-z',(index*15+18)+'px');
  object.style.setProperty('--side',(index-1)*18+'px');
  object.append(node('i','depth-foot'),node('i','depth-slice'),node('i','depth-slice depth-slice-hi'));
  const surface=node('div','depth-face');
  for(let j=0;j<3;j++)surface.append(node('i','depth-detail'));
  surface.append(node('b','depth-pin',String(index+1).padStart(2,'0')));
  object.append(surface);
  return object;
}

export function enhanceDepth(root,project,locale) {
  const config=models[project.id];
  const picture=root.querySelector('.stage-picture');
  if(!config || !picture || picture.querySelector('.depth-module'))return null;
  const [kind,hue,english,persian,states,useEn,useFa]=config;
  const form=forms[kind];
  const useCopy=root.closest('.atlas-embedded')?.querySelector('.depth-use') || node('div','depth-use');
  useCopy.replaceChildren(node('strong'),node('p'));
  const module=node('section','depth-module');
  module.dataset.model=kind;
  module.style.setProperty('--depth-hue',hue);
  const heading=node('h3','depth-caption');
  const viewport=node('div','depth-viewport');
  viewport.tabIndex=0;
  viewport.setAttribute('role','group');
  const scene=node('div','depth-scene');
  scene.setAttribute('aria-hidden','true');
  const base=node('div','depth-base');
  const grid=node('div','depth-grid');
  const parts=form.parts.map(modelPart);
  const lines=form.links.map(([start,end])=>wireBetween(form.parts[start],form.parts[end]));
  scene.append(base,grid,...lines,...parts);
  viewport.append(scene);
  const hint=node('p','depth-hint');
  const controls=node('div','depth-controls');
  const partButtons=node('div','depth-parts');
  partButtons.setAttribute('role','group');
  const detail=node('p','depth-status');
  detail.setAttribute('aria-live','polite');
  const turn=node('button','depth-turn');
  const split=node('button','depth-split');
  const reset=node('button','depth-reset');
  for(const button of [turn,split,reset])button.type='button';
  split.setAttribute('aria-pressed','false');
  controls.append(turn,split,reset);
  const buttons=parts.map((_,index)=>{
    const button=node('button','depth-part-button');
    button.type='button';
    button.setAttribute('aria-pressed','false');
    button.addEventListener('click',()=>{
      selected=selected===index?-1:index;
      refresh(false);
    });
    partButtons.append(button);
    return button;
  });

  module.append(heading,viewport,controls,partButtons,hint,detail);
  if(!useCopy.isConnected)root.querySelector('.exhibit-lab').before(useCopy);
  picture.querySelector('.stage-evidence').before(module);
  picture.classList.add('has-depth');

  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let state=0,selected=-1,direction=0,isSplit=false,drag;
  let [pitch,yaw]=form.pose;
  const label=entry=>entry[locale()==='fa'?1:0];

  function orient() {
    scene.style.setProperty('--pitch',pitch+'deg');
    scene.style.setProperty('--yaw',yaw+'deg');
  }

  function refresh(translate) {
    const names=(locale()==='fa'?persian:english).split('|');
    const active=states.split('|')[state];
    module.dataset.depthState=String(state);
    for(const [i,part] of parts.entries()){
      part.dataset.active=String(active.includes(i));
      part.dataset.inspect=String(selected===i);
      buttons[i].setAttribute('aria-pressed',String(selected===i));
      if(translate)buttons[i].textContent=names[i];
    }
    detail.hidden=selected<0;
    if(selected>=0)detail.textContent=names[selected]+' · '+label(active.includes(selected)?theme.step:theme.retained);
    if(!translate)return;
    useCopy.firstChild.textContent=label(theme.use);
    useCopy.lastChild.textContent=label([useEn,useFa]);
    heading.textContent=label(theme.view);
    viewport.setAttribute('aria-label',label(theme.diagram));
    partButtons.setAttribute('aria-label',label(theme.parts));
    hint.textContent=label(theme.diagram);
    turn.textContent=label(theme.turn);
    split.textContent=label(theme.split);
    reset.textContent=label(theme.reset);
  }

  turn.addEventListener('click',()=>{
    direction=(direction+1)%4;
    [pitch,yaw]=[[...form.pose],[18,29],[37,3],[21,-31]][direction];
    orient();
  });
  split.addEventListener('click',()=>{
    isSplit=!isSplit;
    module.dataset.split=String(isSplit);
    split.setAttribute('aria-pressed',String(isSplit));
  });
  reset.addEventListener('click',()=>{
    [pitch,yaw]=form.pose;
    direction=0;selected=-1;isSplit=false;
    module.dataset.split='false';
    split.setAttribute('aria-pressed','false');
    orient();refresh(false);
  });

  viewport.addEventListener('pointerdown',event=>{
    if(!event.isPrimary || event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,pitch,yaw};
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove',event=>{
    if(drag?.id!==event.pointerId)return;
    yaw=Math.max(-40,Math.min(40,drag.yaw+(event.clientX-drag.x)*.20));
    pitch=Math.max(12,Math.min(46,drag.pitch-(event.clientY-drag.y)*.14));
    orient();
  });
  for(const name of ['pointerup','pointercancel','lostpointercapture']){
    viewport.addEventListener(name,event=>{if(drag?.id===event.pointerId)drag=null;});
  }
  viewport.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();
    if(event.key==='ArrowLeft')yaw=Math.max(-40,yaw-6);
    if(event.key==='ArrowRight')yaw=Math.min(40,yaw+6);
    if(event.key==='ArrowUp')pitch=Math.max(12,pitch-6);
    if(event.key==='ArrowDown')pitch=Math.min(46,pitch+6);
    orient();
  });

  orient();
  refresh(true);
  return (next,motion)=>{
    const previous=state;
    state=next;
    selected=-1;
    refresh(true);
    if(motion && previous!==next && !reduced.matches){
      for(const part of parts){
        part.getAnimations().filter(animation=>animation.id==='depth-pulse').forEach(animation=>animation.cancel());
        if(part.dataset.active!=='true')continue;
        const animation=part.animate([{filter:'brightness(1.48)'},{filter:'none'}],{duration:460,easing:'ease-out'});
        animation.id='depth-pulse';
      }
    }
  };
}
