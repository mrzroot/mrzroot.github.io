(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var isFa=function(){return document.documentElement.lang==='fa'};
var io=('IntersectionObserver'in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12}):null;
$$('.reveal').forEach(function(el){io?io.observe(el):el.classList.add('in')});
/* ---- hero: beam, squiggles, problems, --fix ---- */
var ide=$('#ide');
if(ide){
 var lines=$$('.edl',ide),rows=$$('.pr',ide),sum=$('#idesum'),beam=$('#beam'),btn=$('#idefix'),stat=$('#idestat'),ed=$('#ed');
 var alive=false,run=0,timer=0,total=rows.length;
 var S=function(en,fa){return '<span class="l-en">'+en+'</span><span class="l-fa" lang="fa">'+fa+'</span>'};
 var sleep=function(ms,id){return new Promise(function(r){timer=setTimeout(function(){r(id===run)},ms)})};
 var setN=function(n){sum.textContent=n;sum.classList.toggle('zero',n===0)};
 var showAll=function(){lines.forEach(function(l){$$('.sq',l).forEach(function(s){s.classList.add('on')})});rows.forEach(function(r){r.classList.add('in')});setN(total);stat.innerHTML=S(total+' problems · 1 needs you','۵ مشکل · ۱ مورد با شماست')};
 var reset=function(){beam.classList.remove('on');$$('.sq',ide).forEach(function(s){s.classList.remove('on','fixed');if(s.dataset.orig!=null)s.textContent=s.dataset.orig});rows.forEach(function(r){r.classList.remove('in','ok')});setN(0);stat.innerHTML=S('scanning…','در حال اسکن…');btn.classList.remove('press')};
 var loop=async function(){var id=++run;reset();$$('.sq',ide).forEach(function(s){if(s.dataset.orig==null)s.dataset.orig=s.textContent});
  if(!await sleep(600,id))return;var n=0;beam.classList.add('on');
  for(var i=0;i<lines.length;i++){var L=lines[i];beam.style.transform='translateY('+(L.offsetTop)+'px)';if(!await sleep(480,id))return;
   $$('.sq',L).forEach(function(s){s.classList.add('on')});rows[i].classList.add('in');n++;setN(n);if(!await sleep(700,id))return}
  beam.style.transform='translateY('+(ed.clientHeight)+'px)';if(!await sleep(500,id))return;
  rows[4].classList.add('in');n++;setN(n);beam.classList.remove('on');stat.innerHTML=S(n+' problems · 1 needs you','۵ مشکل · ۱ مورد با شماست');
  if(!await sleep(1100,id))return;btn.classList.add('press');if(!await sleep(250,id))return;btn.classList.remove('press');
  stat.innerHTML=S('fixing a copy…','در حال اصلاح روی یک نسخه…');
  $$('.sq',ide).forEach(function(s){s.textContent=s.dataset.fix;s.classList.add('fixed')});
  for(var j=0;j<4;j++){rows[j].classList.add('ok');n--;setN(n);if(!await sleep(300,id))return}
  stat.innerHTML=S('4 fixed → chapter2.payanlint.docx · 1 left for you','۴ اصلاح → chapter2.payanlint.docx · ۱ مورد با شما');
  if(!await sleep(4200,id))return;if(alive)loop()};
 if(RM||!('IntersectionObserver'in window))showAll();
 else new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!alive){alive=true;loop()}else if(!v&&alive){alive=false;run++;clearTimeout(timer)}},{threshold:.3}).observe(ide);
}
/* ---- x-ray ---- */
var track=$('#xrtrack'),xr=$('#xr'),doc=$('#xrdoc');
if(track&&xr){
 var setP=function(v){doc.style.setProperty('--p',v);xr.value=v};
 var tick=0,upd=function(){tick=0;var r=track.getBoundingClientRect(),h=track.offsetHeight-innerHeight+64;var p=Math.max(0,Math.min(1,-(r.top-64)/Math.max(1,h)));setP(Math.round(Math.min(100,p*130)))};
 if(RM){setP(100)}else{addEventListener('scroll',function(){if(!tick)tick=requestAnimationFrame(upd)},{passive:true});upd()}
 xr.addEventListener('input',function(){doc.style.setProperty('--p',xr.value)});
}
/* ---- the rules (port of textrules.scan) ---- */
var ZW='\u200c',PL='\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC',NONJOIN='اآأإدذرزژوؤء',FAD='۰۱۲۳۴۵۶۷۸۹',ARD='٠١٢٣٤٥٦٧٨٩';
var STOP={'از':1,'را':1,'به':1,'در':1,'که':1,'با':1,'تا':1,'بر':1,'یا':1,'هم':1,'و':1,'این':1,'آن':1,'ها':1,'های':1};
var MSG={P101:['Arabic «ي ك ى» → Persian','«ي ك ى» عربی ← فارسی','arabic-letters'],P102:['Arabic-Indic digits → Persian digits','رقم عربی-هندی ← رقم فارسی','arabic-digits'],P103:['digit set differs from --digits','دستهٔ رقم با --digits فرق دارد','digits'],
 P110:['«می / نمی» needs a half-space','«می / نمی» نیم‌فاصله می‌خواهد','zwnj'],P111:['plural «ها» is attached','«ها»ی جمع باید چسبیده باشد','zwnj'],P112:['stray or doubled half-space','نیم‌فاصلهٔ اضافه یا دوتایی','zwnj'],P113:['tatweel inside text','کشیده داخل متن','tatweel'],
 P120:['space before punctuation','فاصله پیش از نشانه','punct'],P121:['missing space after punctuation','فاصله پس از نشانه نیست','punct'],P122:['Latin punctuation in Persian text','نشانهٔ لاتین در متن فارسی','punct'],P123:['space just inside brackets or quotes','فاصله درون پرانتز یا گیومه','punct'],
 P124:['several spaces in a row','چند فاصلهٔ پیاپی','spaces'],P125:['indent made of spaces or tabs','تورفتگی با فاصله یا تب','spaces'],P126:['straight quotes around Persian text','گیومهٔ مستقیم دور متن فارسی','quotes']};
var CATS=['arabic-letters','arabic-digits','digits','zwnj','punct','spaces','quotes','tatweel'];
var re=function(s,f){return new RegExp(s,f||'g')};
function isPersian(T){var r=(T.match(/[\u0600-\u06FF]/g)||[]).length,l=(T.match(/[A-Za-z]/g)||[]).length;return r>=3&&r>=l}
function digitCtx(T){var toks=[],m,rx=/\S+/g;while((m=rx.exec(T)))toks.push([m.index,m.index+m[0].length,m[0]]);var where=[];
 toks.forEach(function(t,k){var latin=/[A-Za-z]/.test(t[2]);if(!latin&&/^[\W\d_]*$/.test(t[2])&&k>0){var pt=toks[k-1][2];if(/[A-Za-z]/.test(pt)&&!re('['+PL+']','').test(pt))latin=true}where[k]=latin});
 var out=[];toks.forEach(function(t,k){var r2=/[0-9]+|[۰-۹]+|[٠-٩]+/g,mm;while((mm=r2.exec(t[2]))){var c=mm[0][0];out.push([t[0]+mm.index,t[0]+mm.index+mm[0].length,'0123456789'.indexOf(c)>=0?'en':(FAD.indexOf(c)>=0?'fa':'ar'),where[k]])}});return out}
function mapD(s,from){return s.replace(/[0-9۰-۹٠-٩]/g,function(c){var i='0123456789'.indexOf(c);if(i<0)i=FAD.indexOf(c);if(i<0)i=ARD.indexOf(c);return from==='fa'?FAD[i]:String(i)})}
function scanLine(T,digits){
 if(!isPersian(T))return[];var fx=[],add=function(code,s,e,rep,auto){fx.push({code:code,s:s,e:e,rep:rep,auto:auto!==false})},m;
 if(!/[\u064B-\u065F\u0670]/.test(T)){var r=/[يىك]/g;while((m=r.exec(T)))add('P101',m.index,m.index+1,m[0]==='ك'?'ک':'ی')}
 digitCtx(T).forEach(function(d){var s=T.slice(d[0],d[1]);if(d[2]==='ar')add('P102',d[0],d[1],mapD(s,digits==='en'?'en':'fa'));else if(d[2]==='en'&&!d[3]&&digits==='fa')add('P103',d[0],d[1],mapD(s,'fa'));else if(d[2]==='fa'&&!d[3]&&digits==='en')add('P103',d[0],d[1],mapD(s,'en'))});
 var r1=re('(?<![' +PL+ZW+'])(نمی|می) (?=([' +PL+']{2,}))');while((m=r1.exec(T))){var nx=T.slice(m.index+m[0].length).match(re('^['+PL+']+',''))[0];if(STOP[nx])continue;add('P110',m.index+m[0].length-1,m.index+m[0].length,ZW)}
 var r2=re('(?<=['+PL+']) (ها|های|هایی|هایم|هایت|هایش|هایمان|هایتان|هایشان)(?!['+PL+'])');while((m=r2.exec(T))){var pv=T[m.index-1];add('P111',m.index,m.index+1,NONJOIN.indexOf(pv)>=0?'':ZW)}
 var r3=re(ZW+'+');while((m=r3.exec(T))){var a=m.index,b=a+m[0].length,edge=a===0||/\s/.test(T[a-1])||b>=T.length||/\s/.test(T[b]);if(edge)add('P112',a,b,'');else if(b-a>1)add('P112',a,b,ZW)}
 var r4=/\u0640+/g;while((m=r4.exec(T)))add('P113',m.index,m.index+m[0].length,'');
 var r5=re('(?<=['+PL+'۰-۹]) +(?=[،؛؟!»)\\]])|(?<=['+PL+']) +(?=[:.](?:\\s|$))');while((m=r5.exec(T)))add('P120',m.index,m.index+m[0].length,'');
 var r6=re('(?<=['+PL+'])[،؛؟!:](?=['+PL+'])|(?<=['+PL+'۰-۹])[،؛؟!](?=[0-9A-Za-z۰-۹])');while((m=r6.exec(T))){var e=m.index+m[0].length;if(FAD.indexOf(T[m.index-1])>=0&&FAD.indexOf(T[e])>=0)continue;add('P121',e,e,' ')}
 var r7=re('(?<=['+PL+']{2})\\.(?=['+PL+']{2})');while((m=r7.exec(T))){var e2=m.index+1;add('P121',e2,e2,' ')}
 var r8=re('(?<=['+PL+']),(?=\\s*['+PL+'])|(?<=['+PL+']);(?=\\s|$)|(?<=['+PL+'])\\?(?=\\s|$)');while((m=r8.exec(T)))add('P122',m.index,m.index+1,{',':'،',';':'؛','?':'؟'}[m[0]]);
 var r9=re('(?<=\\() +(?=['+PL+'۰-۹])|(?<=['+PL+'۰-۹]) +(?=\\))|(?<=«) +(?=['+PL+'])|(?<=['+PL+'۰-۹.،؟!]) +(?=»)');while((m=r9.exec(T)))add('P123',m.index,m.index+m[0].length,'');
 var r10=/(?<=\S)[ ]{2,}(?=\S)/g;while((m=r10.exec(T)))add('P124',m.index,m.index+m[0].length,' ');
 var t=T.match(/[ \t]+$/);if(t&&t.index>0)add('P124',t.index,T.length,'');
 var ind=T.match(/^([ \t\u00a0]{2,}|\t)/);if(ind)add('P125',0,ind[0].length,'',false);
 var r11=re('"(?=\\S)([^"\\n]{2,}?)(?<=\\S)"');while((m=r11.exec(T))){if(re('['+PL+']','').test(m[1])){add('P126',m.index,m.index+1,'«');add('P126',m.index+m[0].length-1,m.index+m[0].length,'»')}}
 fx.sort(function(a,b){return a.s-b.s||a.e-b.e});var out=[],last=-1;fx.forEach(function(f){if(f.s<last)return;out.push(f);last=Math.max(last,f.e,f.s)});return out}
/* ---- ui ---- */
var inp=$('#plin');
if(inp){
 var bd=$('#plbd'),list=$('#pllist'),cats=$('#plcats'),fn=$('#plfn');
 var off={},sel=null,all=[];
 var SAMPLE='الگوریتم جدید ما سریع‌تر از روش قبلی است ولي نتيجه‌ها را باید بررسی كرد.\nاین نتیجه می شود که داده ها کافی بوده‌اند.  بنابراین، روش "پیشنهادی" در فصل ٤ ارزیابی می‌شود .\nهمهٔ کتاب ها در پیوست آمده‌اند(جدول ۲).';
 var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
 var dig=function(){var r=$('input[name=pldig]:checked');return r?r.value:'keep'};
 function lint(){var T=inp.value,ls=T.split('\n'),pos=0,res=[];ls.forEach(function(L,li){scanLine(L,dig()).forEach(function(f){res.push({code:f.code,s:pos+f.s,e:pos+f.e,rep:f.rep,auto:f.auto,line:li+1,col:f.s+1,cat:MSG[f.code][2],orig:L.slice(f.s,f.e)})});pos+=L.length+1});return res}
 function render(){
  var T=inp.value;all=lint();var vis=all.filter(function(f){return !off[f.cat]});
  var h='',p=0;vis.forEach(function(f,i){h+=esc(T.slice(p,f.s));var seg=esc(T.slice(f.s,f.e));
   h+='<mark class="c-'+f.cat+(f.s===f.e?' z':'')+(sel===i?' hl':'')+'">'+seg+'</mark>';p=f.e});
  h+=esc(T.slice(p))+'\n\u200b';bd.innerHTML=h;vis._=1;
  var cnt={};all.forEach(function(f){cnt[f.cat]=(cnt[f.cat]||0)+1});
  cats.innerHTML=CATS.filter(function(c){return cnt[c]||off[c]}).map(function(c){return '<button type="button" class="c-'+c+'" data-c="'+c+'" aria-pressed="'+(!off[c])+'">'+c+' '+(cnt[c]||0)+'</button>'}).join('');
  list.innerHTML=vis.length?vis.map(function(f,i){var m=MSG[f.code],o=f.orig.replace(ZW,'⸱')||'∅',r=f.rep.replace(ZW,'⸱')||'∅';
   return '<li class="pr c-'+f.cat+'" data-i="'+i+'" tabindex="0"><b class="pc">'+f.code+'</b><span class="pm"><span class="l-en">'+m[0]+'</span><span class="l-fa" lang="fa">'+m[1]+'</span></span><span class="pl mono">'+f.line+':'+f.col+' · '+esc(o)+' → '+esc(r)+'</span>'+(f.auto?'<button class="fxb" type="button" data-i="'+i+'">fix</button>':'<span class="pt mono">by hand</span>')+'</li>'}).join(''):'<li class="empty"><span class="l-en">No typing problems found.</span><span class="l-fa" lang="fa">مشکل تایپی پیدا نشد.</span></li>';
  var autos=all.filter(function(f){return f.auto&&!off[f.cat]}).length;fn.textContent=autos?'('+autos+')':'';
  list._vis=vis;
 }
 function applyFixes(fs){var T=inp.value,out='',p=0;fs.sort(function(a,b){return a.s-b.s}).forEach(function(f){out+=T.slice(p,f.s)+f.rep;p=f.e});out+=T.slice(p);inp.value=out;sel=null;render()}
 inp.addEventListener('input',function(){sel=null;render()});
 inp.addEventListener('scroll',function(){bd.scrollTop=inp.scrollTop});
 list.addEventListener('click',function(e){var b=e.target.closest('.fxb'),li=e.target.closest('.pr');if(!li||li.className.indexOf('empty')>=0)return;var f=list._vis[+li.dataset.i];if(!f)return;
  if(b){applyFixes([f]);return}
  inp.focus();inp.setSelectionRange(f.s,f.e);sel=+li.dataset.i;render();inp.setSelectionRange(f.s,f.e)});
 list.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.classList.contains('pr'))e.target.click()});
 cats.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;off[b.dataset.c]=!off[b.dataset.c];render();var nb=$('[data-c="'+b.dataset.c+'"]',cats);if(nb&&!RM){nb.classList.add('bump');setTimeout(function(){nb.classList.remove('bump')},220)}});
 $$('input[name=pldig]').forEach(function(r){r.addEventListener('change',render)});
 $('#plfix').addEventListener('click',function(){applyFixes(all.filter(function(f){return f.auto&&!off[f.cat]}))});
 $('#plsample').addEventListener('click',function(){inp.value=SAMPLE;sel=null;render();inp.focus()});
 $('#plclear').addEventListener('click',function(){inp.value='';sel=null;render();inp.focus()});
 $('#plcopy').addEventListener('click',function(){var b=this,o=b.innerHTML,d=function(){b.textContent=isFa()?'کپی شد ✓':'Copied ✓';setTimeout(function(){b.innerHTML=o},1400)};if(navigator.clipboard)navigator.clipboard.writeText(inp.value).then(d,d);else d()});
 inp.value=SAMPLE;render();
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
})();
