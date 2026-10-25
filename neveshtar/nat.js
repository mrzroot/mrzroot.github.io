/* neveshtar landing: UI. The review engine is nat_nev.js (R101-R104, R201, R401, R501 + rhythm numbers), all client side. */
(function(){
'use strict';
var d=document.documentElement,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var N=window.NEV_NAT,D=N.data,RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)'),reduced=function(){return RM&&RM.matches};
var isFa=function(){return d.lang!=='en'};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var nf=function(n){var s=String(n);return isFa()?s.replace(/\d/g,function(c){return '۰۱۲۳۴۵۶۷۸۹'[c]}):s};
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
var KIND={R101:'fill',R104:'fill',R102:'stock',R103:'stock',R401:'calq',R501:'calq',R201:'rhy'};
var T=function(fa,en){return isFa()?fa:en};
/* ---------- page-only readout, not a quality grade ---------- */
function score(text,res){
 var r=res||N.analyse(text);if(!r.rhythm.sentences)return null;
 var w={high:1,medium:.8,low:.4},s=0;r.findings.forEach(function(f){s+=w[f.conf]||.5});
 var p1=Math.min(65,40*s/r.rhythm.sentences),p2=(r.rhythm.sentences>=5&&r.rhythm.variation<.35)?(.35-r.rhythm.variation)*70:0;
 return Math.max(3,Math.min(99,Math.round(100-p1-p2)))}
function setGauge(svg,v,ghost){if(!svg)return;var t=$('.g-num',svg);
 if(v==null){svg.style.setProperty('--v',0);if(t)t.textContent='–';return}
 svg.style.setProperty('--v',v);if(ghost!=null)svg.style.setProperty('--w',ghost);
 var from=parseInt(svg.getAttribute('data-n')||'0',10),t0=performance.now(),dur=reduced()?1:900;svg.setAttribute('data-n',v);
 (function f(n){var k=Math.min(1,(n-t0)/dur),e=1-Math.pow(1-k,3);t.textContent=nf(Math.round(from+(v-from)*e));if(k<1)requestAnimationFrame(f)})(t0)}
/* ---------- hero ---------- */
var HERO='در دنیای پرشتاب امروز، کتابخانه‌های دانشگاهی نقش بسزایی ایفا می‌کنند. لازم به ذکر است که سامانه‌ها بسیار حیاتی هستند. در رابطه با دقت، نتایج مورد بررسی قرار گرفت.';
var sheet=$('#hs'),body=$('#hs-body'),pen=$('.pen',sheet),HF=[],HS=[],run=0,vis=true,cur=0;
function buildHero(){var r=N.analyse(HERO),f=r.findings,h='',p=0;HF=f;
 f.forEach(function(x){var o=x.o,tw=o.match(/\s*$/)[0],oo=o.replace(/\s+$/,''),n=(x.sug||'').replace(/\s+$/,'');
  h+=esc(HERO.slice(p,x.s))+'<span class="f'+(n?'':' empty')+'" data-c="'+x.code+'" data-k="'+KIND[x.code]+'"><span class="o">'+esc(oo)+'</span><span class="n">'+esc(n)+'</span></span>'+esc(tw);p=x.e});
 h+=esc(HERO.slice(p));body.innerHTML=h;
 HS=[];var txt=HERO,off=0;HS.push(score(HERO));
 for(var k=1;k<=f.length;k++){var t='',q=0;f.slice(0,k).forEach(function(x){t+=HERO.slice(q,x.s)+x.sug;q=x.e});t+=HERO.slice(q);HS.push(score(t.replace(/[ \t]{2,}/g,' ')))}
 measure()}
function measure(){$$('.f',body).forEach(function(s){var o=$('.o',s),n=$('.n',s);o.style.maxWidth='none';n.style.maxWidth='none';
 s.style.setProperty('--wo',Math.ceil(o.getBoundingClientRect().width)+2+'px');s.style.setProperty('--wn',Math.ceil(n.getBoundingClientRect().width)+2+'px');o.style.maxWidth='';n.style.maxWidth=''})}
/* decorative rhythm line: the same Catmull-Rom path, tension 0 (corners) -> 1 (smooth) */
var P0=[24,21,26,22,25,21,26,23,24,22,26,23,25,24],P1=[34,10,26,40,8,28,36,12,26,41,14,30,9,24];
function lineAt(t){var pts=P0.map(function(a,i){return [i*400/(P0.length-1),a+(P1[i]-a)*t]}),k=t,dd='M'+pts[0][0]+' '+pts[0][1];
 for(var i=0;i<pts.length-1;i++){var a=pts[Math.max(0,i-1)],b=pts[i],c=pts[i+1],e=pts[Math.min(pts.length-1,i+2)];
  dd+='C'+(b[0]+(c[0]-a[0])/6*k)+' '+(b[1]+(c[1]-a[1])/6*k)+' '+(c[0]-(e[0]-b[0])/6*k)+' '+(c[1]-(e[1]-b[1])/6*k)+' '+c[0]+' '+c[1]}
 $('#hs-line path').setAttribute('d',dd)}
var lt=0;function tweenLine(to,dur){var from=lt,t0=performance.now();return new Promise(function(res){(function f(n){var k=dur?Math.min(1,(n-t0)/dur):1,e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;lt=from+(to-from)*e;lineAt(lt);if(k<1)requestAnimationFrame(f);else res()})(t0)})}
function stateLabel(){$('#hs-state').innerHTML='';var s=cur>=HF.length?T('طبیعی‌شده','Natural'):cur===0?T('پیش‌نویس سفت','Stiff draft'):T('در حال ویرایش…','Editing…');$('#hs-state').textContent=s}
function setStage(k,instant){cur=k;sheet.classList.toggle('noanim',!!instant);
 $$('.f',body).forEach(function(s,i){s.classList.toggle('done',i<k);if(i>=k)s.classList.remove('hit')});
 sheet.classList.toggle('relaxed',k>=HF.length);setGauge($('#hg'),HS[k],HS[0]);tweenLine(HF.length?k/HF.length:0,instant?0:900);stateLabel();
 if(instant)requestAnimationFrame(function(){sheet.classList.remove('noanim')})}
function penTo(el,tilt){var a=sheet.getBoundingClientRect(),b=el.getBoundingClientRect();pen.style.setProperty('--x',Math.round(b.left-a.left+b.width*.5));pen.style.setProperty('--y',Math.round(b.bottom-a.top-8));pen.style.setProperty('--r',(tilt||0)+'deg');pen.classList.add('on')}
function wait(ms){return sleep(ms).then(function(){return new Promise(function(r){(function c(){if(vis&&!document.hidden)r();else setTimeout(c,300)})()})})}
async function play(){var id=++run;setStage(0,true);pen.classList.remove('on');await wait(1500);
 var els=$$('.f',body);
 for(var i=0;i<els.length;i++){if(id!==run)return;penTo(els[i],(i%2?4:-5));await wait(950);if(id!==run)return;els[i].classList.add('hit');await wait(420);if(id!==run)return;measure();els[i].classList.add('done');cur=i+1;setGauge($('#hg'),HS[i+1],HS[0]);tweenLine((i+1)/els.length,900);stateLabel();await wait(750)}
 if(id!==run)return;sheet.classList.add('relaxed');pen.style.setProperty('--x',sheet.clientWidth-40);pen.style.setProperty('--y',sheet.clientHeight-120);await wait(500);pen.classList.remove('on');await wait(5200);if(id===run)play()}
function initHero(){buildHero();lineAt(0);setGauge($('#hg'),HS[0],HS[0]);stateLabel();
 var io=new IntersectionObserver(function(e){vis=e[0].isIntersecting},{threshold:.15});io.observe(sheet);
 $('#hs-replay').addEventListener('click',function(){if(reduced()){run++;setStage(0,true);setTimeout(function(){setStage(HF.length,true)},500)}else play()});
 $('#hs-flip').addEventListener('click',function(){run++;pen.classList.remove('on');var rel=cur<HF.length;setStage(rel?HF.length:0,reduced());this.setAttribute('aria-pressed',rel)});
 if(reduced()){$('#hs-replay').hidden=true;setStage(HF.length,true)}else play();
 var rz;addEventListener('resize',function(){clearTimeout(rz);rz=setTimeout(measure,150)});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
 if(RM&&RM.addEventListener)RM.addEventListener('change',function(){if(reduced()){run++;pen.classList.remove('on');setStage(HF.length,true)}else play()})}
/* ---------- demo ---------- */
var SAMPLES=[
 {fa:'مقدمهٔ پایان‌نامه',en:'Thesis intro',t:'در دنیای پرشتاب امروز، کتابخانه‌های دانشگاهی نقش بسزایی ایفا می‌کنند. همچنین فناوری‌های نوین نقش مهمی در دسترسی به منابع دارند. علاوه بر این، پیشنهاد کتاب یکی از مهم‌ترین چالش‌های این حوزه است. بنابراین، بررسی سامانه‌های پیشنهاد کتاب حائز اهمیت است. در این راستا، این پژوهش به بررسی این موضوع می‌پردازد.\n\nلازم به ذکر است که سامانه‌های توصیه‌گر می‌توانند دقت جست‌وجو را افزایش دهند. این امر باعث افزایش رضایت کاربران می‌شود. این امر باعث کاهش زمان جست‌وجو می‌شود. این امر باعث بهبود تجربهٔ استفاده می‌شود.'},
 {fa:'روش پژوهش',en:'Methods',t:'داده‌ها گردآوری شد. پرسشنامه تهیه گردید. نمونه انتخاب شد. نتایج تحلیل شد. گزارش نهایی تدوین گردید. فهرست منابع بررسی شد.\n\nروش پیشنهادی بر روی ۱۲۰ پرسشنامه مورد استفاده قرار گرفت. در رابطه با دقت، نتایج مورد بررسی قرار گرفت. ما می‌توانیم نتیجه بگیریم که روش بسیار بسیار مناسب است.'},
 {fa:'تأکیدهای تهی',en:'Empty emphasis',t:'این روش بسیار حیاتی است. این مدل بسیار مهم است. این رویکرد فوق‌العاده مؤثر است. این معیار بسیار ضروری است. این شاخص خیلی کلیدی است.\n\nهوش مصنوعی در بسیاری از حوزه‌ها تأثیر زیادی دارد و روزبه‌روز اهمیت آن بیشتر می‌شود. این موضوع گام مهمی در جهت پیشرفت علمی است.'}];
var inp=$('#din'),docv=$('#docv'),dpen=$('.dpen'),finds=$('#finds'),src='',F=[],dec=[],busy=false,tmr,startScore=null,hist0=null;
function altOf(i){var f=F[i],x=dec[i];return x&&x.alt!=null?x.alt:0}
function repl(i){var f=F[i],a=f.alts&&f.alts.length?f.alts[altOf(i)]:f.sug;return a==null?f.sug:a}
function result(){var o='',p=0;F.forEach(function(f,i){o+=src.slice(p,f.s);o+=dec[i]&&dec[i].m==='acc'?repl(i):f.o;p=f.e});o+=src.slice(p);return o.replace(/[ \t]{2,}/g,' ').replace(/^[ \t]+/gm,'').replace(/ ([،.؟!])/g,'$1')}
function renderDoc(){var h='',p=0;F.forEach(function(f,i){h+=esc(src.slice(p,f.s));var m=dec[i]&&dec[i].m,k=KIND[f.code];
  if(m==='acc'){var n=repl(i);h+='<del>'+esc(f.o.replace(/\s+$/,''))+'</del>'+(n.trim()?'<ins>'+esc(n.trim())+'</ins>':'')+esc(f.o.match(/\s*$/)[0])}
  else if(m==='keep')h+='<span class="kept">'+esc(f.o)+'</span>';
  else h+='<mark class="k-'+k+'" data-i="'+i+'" tabindex="0" title="'+f.code+'">'+esc(f.o)+'</mark>';p=f.e});
 h+=esc(src.slice(p));docv.innerHTML=h||'<span style="color:var(--muted)">'+T('متنی نیست.','No text.')+'</span>'}
function conf(c){return {high:T('مطمئن','high'),medium:T('متوسط','medium'),low:T('احتمالی','low')}[c]}
function renderFinds(){var h='';
 if(!F.length){finds.innerHTML=src.trim()?'<li class="empty-s">'+T('چیزی که این ابزار بشناسد پیدا نشد. این یعنی فقط الگوهای بالا دیده نشد، نه اینکه متن بی‌نقص است.','Nothing this tool knows was found. That only means these patterns did not match, not that the text is flawless.')+'</li>':'';return}
 F.forEach(function(f,i){var c=D.cats[f.code]||{},x=dec[i]||{},k=KIND[f.code],m=x.m;
  var why=isFa()?(c.wf||''):(f.note||c.w||''),ask=f.ask&&D.ask&&D.ask[f.code]?D.ask[f.code][isFa()?1:0]:'',n=repl(i);
  var rw='<s>'+esc(f.o.trim())+'</s>'+(f.chg||f.sug?' ← <b>'+(n.trim()?esc(n.trim()):T('(حذف)','(drop)'))+'</b>':'');
  rw=rw.replace(' ← ',' → ');
  var alts='';if(f.alts&&f.alts.length>1)alts='<div class="alts" role="group" aria-label="'+T('گزینه‌ها','Options')+'">'+f.alts.map(function(a,j){return '<button type="button" data-alt="'+j+'" aria-pressed="'+(j===altOf(i))+'">'+(a.trim()?esc(a.trim()):T('حذف','drop'))+'</button>'}).join('')+'</div>';
  h+='<li class="fd k-'+k+(m==='acc'?' acc':'')+'" data-i="'+i+'"><header><span class="code-chip">'+f.code+'</span><span class="cn">'+esc(isFa()?c.nf:c.n)+'</span><span class="cf">'+conf(f.conf)+'</span></header><p class="rw">'+rw+'</p><p class="why">'+esc(why)+'</p>'+(ask?'<p class="ask">'+esc(ask)+'</p>':'')+alts+
  '<div class="bt">'+((f.chg)?'<button class="btn sm pri" type="button" data-m="acc" aria-pressed="'+(m==='acc')+'">'+(m==='acc'?T('پذیرفته شد ✓','Accepted ✓'):T('بپذیر','Accept'))+'</button>':'')+'<button class="btn sm" type="button" data-m="keep" aria-pressed="'+(m==='keep')+'">'+(m==='keep'?T('نگه داشته شد ✓','Kept ✓'):f.chg?T('مال من بماند','Keep mine'):T('همین بماند','Keep as is'))+'</button></div></li>'});
 finds.innerHTML=h}
function fmt(n){return nf(Math.round(n*100)/100).replace('.',isFa()?'٫':'.')}
function renderMeter(){var res=result(),r=N.analyse(res),sc=score(res,r);
 setGauge($('#dg'),sc,startScore);$('#g-now').textContent=sc==null?'–':nf(sc);$('#g-was').textContent=startScore==null?'–':nf(startScore);
 var h=r.rhythm.hist||[0,0,0,0,0,0,0,0,0],h0=hist0||h,mx=Math.max(1,Math.max.apply(0,h),Math.max.apply(0,h0)),b='';
 for(var i=0;i<9;i++){var H0=h0[i]/mx*44,H1=h[i]/mx*44;b+='<rect class="b1" x="'+(i*20+4)+'" width="12" style="y:'+(50-H1)+'px;height:'+H1+'px"/><rect class="b0" x="'+(i*20+2)+'" width="16" style="y:'+(50-H0)+'px;height:'+H0+'px"/>'+((i%2==0)?'<text x="'+(i*20+10)+'" y="60" text-anchor="middle">'+nf(i*5)+(i===8?'+':'')+'</text>':'')}
 $('#bars').innerHTML=b;
 $('#rh-n').textContent=r.rhythm.sentences?T('جمله‌ها ','sentences ')+nf(r.rhythm.sentences)+' · '+T('میانگین ','mean ')+fmt(r.rhythm.mean)+' · '+T('تغییرپذیری ','variation ')+fmt(r.rhythm.variation)+' · '+T('آغاز یکتا ','distinct openers ')+nf(Math.round(r.rhythm.openers*100))+'%':'';
 var wc=(res.match(/\S+/g)||[]).length,acc=dec.filter(function(x){return x&&x.m==='acc'}).length;
 $('#dcount').textContent=nf(wc)+T(' واژه · ',' words · ')+nf(F.length)+T(' یافته · ',' findings · ')+nf(acc)+T(' پذیرفته',' accepted')}
function analyse(){src=inp.value;var r=N.analyse(src);F=r.findings;dec=F.map(function(){return {}});startScore=score(src,r);hist0=r.rhythm.hist||null;full()}
function full(){renderDoc();renderFinds();renderMeter();$('#a-copy').disabled=!src.trim();$('#dstat').textContent=''}
function setM(i,m){dec[i]={m:dec[i]&&dec[i].m===m?null:m,alt:dec[i]&&dec[i].alt};full()}
async function applyMode(mode){if(busy||!F.length)return;busy=true;$$('.acts button').forEach(function(b){b.disabled=true});
 var idx=[];F.forEach(function(f,i){if(f.chg&&(!dec[i]||!dec[i].m)&&(f.conf==='high'||(mode==='bal'&&f.conf==='medium')))idx.push(i)});
 var wrap=dpen.parentNode;
 for(var j=0;j<idx.length;j++){var el=$('mark[data-i="'+idx[j]+'"]',docv);
  if(el&&!reduced()){var a=wrap.getBoundingClientRect(),b=el.getBoundingClientRect();dpen.style.setProperty('--x',Math.round(b.left-a.left+b.width/2));dpen.style.setProperty('--y',Math.round(b.bottom-a.top-6));dpen.classList.add('on');await sleep(520)}
  dec[idx[j]]={m:'acc',alt:dec[idx[j]]&&dec[idx[j]].alt};renderDoc();renderMeter();if(!reduced())await sleep(180)}
 dpen.classList.remove('on');renderFinds();busy=false;$$('.acts button').forEach(function(b){b.disabled=false});$('#a-copy').disabled=!src.trim();
 $('#dstat').textContent=idx.length?T(nf(idx.length)+' تغییر اعمال شد. بقیه با شماست.',idx.length+' applied. The rest is up to you.'):T('مورد مطمئنی برای اعمال نمانده.','Nothing left to apply in this mode.')}
function initDemo(){
 var ch=$('#samples');SAMPLES.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed','false');b.dataset.i=i;b.innerHTML='<span class="l-fa">'+esc(s.fa)+'</span><span class="l-en">'+esc(s.en)+'</span>';ch.appendChild(b)});
 ch.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;$$('button',ch).forEach(function(x){x.setAttribute('aria-pressed',x===b)});inp.value=SAMPLES[b.dataset.i].t;analyse()});
 $('button',ch).click();
 inp.addEventListener('input',function(){clearTimeout(tmr);$$('button',ch).forEach(function(x){x.setAttribute('aria-pressed','false')});tmr=setTimeout(analyse,250)});
 $('#dclear').addEventListener('click',function(){inp.value='';analyse();inp.focus()});
 $('#a-safe').addEventListener('click',function(){applyMode('safe')});$('#a-bal').addEventListener('click',function(){applyMode('bal')});
 $('#a-undo').addEventListener('click',function(){if(busy)return;dec=F.map(function(){return {}});full()});
 $('#a-copy').addEventListener('click',function(){var t=result(),b=this;(navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(t):Promise.reject()).then(function(){$('#dstat').textContent=T('رونوشت شد.','Copied.')},function(){inp.value=t;inp.select();$('#dstat').textContent=T('متن در کادر ورودی گذاشته شد؛ خودتان رونوشت بگیرید.','Result put in the input box; copy it yourself.')})});
 docv.addEventListener('click',function(e){var m=e.target.closest('mark');if(m)focusF(+m.dataset.i)});
 docv.addEventListener('keydown',function(e){var m=e.target.closest&&e.target.closest('mark');if(m&&(e.key==='Enter'||e.key===' ')){e.preventDefault();focusF(+m.dataset.i)}});
 finds.addEventListener('click',function(e){var li=e.target.closest('.fd');if(!li)return;var i=+li.dataset.i,b=e.target.closest('button');
  if(b&&b.dataset.m){setM(i,b.dataset.m);return}
  if(b&&b.dataset.alt!=null){dec[i]={m:'acc',alt:+b.dataset.alt};full();return}
  focusF(i,true)});
 function focusF(i,fromList){$$('.on',docv).forEach(function(x){x.classList.remove('on')});$$('.fd.on').forEach(function(x){x.classList.remove('on')});var m=$('mark[data-i="'+i+'"]',docv),li=$('.fd[data-i="'+i+'"]',finds);
  if(m)m.classList.add('on');if(li){li.classList.add('on');if(!fromList)li.scrollIntoView({block:'nearest',behavior:reduced()?'auto':'smooth'})}}}
/* ---------- habits ---------- */
function initHabits(){$$('.hab').forEach(function(c){var code=c.dataset.c,a=c.dataset.a,b=c.dataset.b,t=$('.hx-t',c),btn=$('.hflip',c),nat=false;
  function draw(){var cat=D.cats[code]||{};$('[data-cat]',c).textContent=isFa()?cat.nf:cat.n;$('[data-why]',c).textContent=isFa()?cat.wf:cat.w;
   var r=N.analyse(a).findings[0];
   if(!nat){t.innerHTML=r?esc(a.slice(0,r.s))+'<span class="old">'+esc(a.slice(r.s,r.e).trim())+'</span> '+esc(a.slice(r.e)):esc(a)}
   else t.innerHTML='<span class="new">'+esc(b)+'</span>';
   btn.textContent=nat?T('نسخهٔ سفت','Show stiff'):T('نسخهٔ طبیعی','Show natural');btn.setAttribute('aria-pressed',nat)}
  c._draw=draw;btn.addEventListener('click',function(){nat=!nat;draw()});draw();
  if(!reduced()&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(e){if(e[0].isIntersecting){io.disconnect();setTimeout(function(){nat=true;draw()},700+Math.random()*700)}},{threshold:.6});io.observe(c)}})}
/* ---------- chrome ---------- */
function setLang(l){d.lang=l;d.dir=l==='fa'?'rtl':'ltr';d.setAttribute('data-lang',l);try{localStorage.setItem('mrz-lang',l)}catch(e){}
 document.title=d.getAttribute(l==='fa'?'data-title-fa':'data-title-en');$('#lang-sr').textContent=l==='fa'?'Switch language to English':'تغییر زبان به فارسی';
 $$('[data-lang-attr]').forEach(function(x){});
 stateLabel();$$('.hab').forEach(function(c){c._draw()});renderFinds();renderMeter();renderDoc();setTimeout(measure,60);
 var u=new URL(location.href);u.searchParams.set('lang',l);history.replaceState(null,'',u)}
function initChrome(){
 $('#lang-toggle').addEventListener('click',function(){setLang(isFa()?'en':'fa')});
 var nav=$('#nav'),mb=$('#menu-btn');mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});nav.addEventListener('click',function(e){if(e.target.closest('a')){nav.classList.remove('open');mb.setAttribute('aria-expanded','false')}});
 $$('.cp').forEach(function(b){b.addEventListener('click',function(){var t=$('code',b.parentNode).textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(function(){}).then(function(){b.classList.add('done');setTimeout(function(){b.classList.remove('done')},1400)})})});
 var pr=$('.prog i');function sc(){var h=d.scrollHeight-innerHeight;pr.style.setProperty('--p',h>0?Math.min(1,scrollY/h):0)}addEventListener('scroll',sc,{passive:true});sc();
 var rv=$$('.rv');if('IntersectionObserver' in window&&!reduced()){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});rv.forEach(function(x){io.observe(x)})}else rv.forEach(function(x){x.classList.add('in')});
 var links=$$('.nav a'),secs=links.map(function(a){return $(a.getAttribute('href'))}).filter(Boolean);
 if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id)})})},{rootMargin:'-40% 0px -55% 0px'});secs.forEach(function(s){so.observe(s)})}
 if(!d.getAttribute('data-lang'))d.setAttribute('data-lang',d.lang==='fa'?'fa':'en');
 var l=d.lang==='fa'?'fa':'en';document.title=d.getAttribute(l==='fa'?'data-title-fa':'data-title-en');$('#lang-sr').textContent=l==='fa'?'Switch language to English':'تغییر زبان به فارسی'}
initChrome();initHero();initDemo();initHabits();
window.__nat={score:score,hero:function(){return {cur:cur,n:HF.length,s:HS}}};
})();
