(() => {
  const embedded=document.querySelector('[data-embed-project]');
  const data=window.MRZ_PROJECTS || (embedded ? JSON.parse(embedded.textContent) : null);
  const root=document.querySelector('.exhibit-studio');
  if(!root || !data)return;
  const project=data.entries.find(entry=>entry.id===root.dataset.project);
  if(!project)return;
  const evidence=root.querySelector('.stage-evidence');
  const track=root.querySelector('.stage-track');
  const picture=root.querySelector('.stage-picture');
  const result=root.querySelector('.stage-result');
  const languageButton=document.querySelector('[data-exhibit-language]');
  const range=root.querySelector('input[type=range]');
  const choices=[...root.querySelectorAll('[data-stage]')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let state=0,animation;

  const language=()=>{
    const value=document.documentElement.dataset.lang || document.documentElement.lang;
    return value.toLowerCase().startsWith('fa') ? 'fa' : 'en';
  };
  const copy=pair=>pair[language()==='fa'?1:0];
  const element=(name,css,text)=>{
    const node=document.createElement(name);
    node.className=css;
    if(text)node.textContent=text;
    return node;
  };

  function fragments(values) {
    return values.map((value,i)=>{
      const item=element('span','stage-item',value);
      item.dir='auto';
      item.style.setProperty('--stage-step',i);
      const percent=value.match(/^(\d+)%/);
      if(percent)item.style.setProperty('--fill',Math.min(100,Number(percent[1]))+'%');
      return item;
    });
  }

  function backdrop(values) {
    if(project.motif==='pulse'){
      return Array.from({length:24},(_,i)=>{
        const bar=element('i','stage-pulse');
        const duration=state===0?9:state===1?17:13;
        const strength=i<duration ? (i*17+state*7)%35+11 : ((i%3)+3);
        bar.style.setProperty('--pulse-height',strength+'%');
        bar.style.setProperty('--stage-step',i);
        return bar;
      });
    }
    if(project.motif==='film' || project.motif==='route' || project.motif==='layers'){
      return values.map((_,i)=>{
        const node=element('i','stage-node');
        node.style.setProperty('--stage-step',i);
        return node;
      });
    }
    return [];
  }

  function render(next,motion) {
    state=Math.min(2,Math.max(0,next));
    const values=project.evidence[state];
    root.dataset.state=String(state);
    picture.style.setProperty('--reveal',state===1?'72%':state===2?'46%':'100%');
    if(range){
      range.value=String(state);
      range.setAttribute('aria-valuetext',copy(state===0?data.labels.still:project.actions[state-1]));
    }
    choices.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.stage)===state)));
    evidence.replaceChildren(...fragments(values));
    track.replaceChildren(...backdrop(values));
    result.replaceChildren();
    if(state)result.append(element('strong','stage-result-label',copy(data.labels.result)));
    result.append(element('span','stage-result-text',copy(state===0?data.labels.choose:project.outcomes[state-1])));
    picture.classList.remove('stage-play');
    if(motion&&!reduced.matches){
      cancelAnimationFrame(animation);
      animation=requestAnimationFrame(()=>{animation=requestAnimationFrame(()=>picture.classList.add('stage-play'));});
    }
  }

  function setLocale(locale) {
    document.documentElement.lang=locale;
    document.documentElement.dir=locale==='fa'?'rtl':'ltr';
    document.documentElement.dataset.lang=locale;
    languageButton.lang=locale==='fa'?'en':'fa';
    languageButton.textContent=locale==='fa'?'English':'فارسی';
    try { localStorage.setItem('mrz-lang',locale); } catch {}
    for(const link of document.querySelectorAll('.exhibit-next a')){
      const url=new URL(link.href);
      url.searchParams.set('lang',locale);
      link.href=url;
    }
    render(state,false);
  }

  for(const button of choices)button.addEventListener('click',()=>render(Number(button.dataset.stage),true));
  range?.addEventListener('input',()=>render(Number(range.value),true));
  if(languageButton){
    languageButton.addEventListener('click',()=>setLocale(language()==='fa'?'en':'fa'));
    setLocale(language());
  }else{
    new MutationObserver(()=>render(state,false)).observe(document.documentElement,{attributes:true,attributeFilter:['lang','data-lang']});
    render(0,false);
  }
})();
