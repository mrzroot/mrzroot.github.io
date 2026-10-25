(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var isFa=function(){return document.documentElement.lang==='fa'};
/* parallax glyph */
if(!RM){var tk=0;addEventListener('scroll',function(){if(tk)return;tk=requestAnimationFrame(function(){tk=0;document.documentElement.style.setProperty('--sy',scrollY)})},{passive:true})}
/* reveal */
var io=('IntersectionObserver'in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15}):null;
$$('.reveal').forEach(function(el){io?io.observe(el):el.classList.add('in')});
/* hero tilt */
var sh=$('#nvsheet');
if(sh&&!RM&&matchMedia('(pointer:fine)').matches){sh.addEventListener('pointermove',function(e){var r=sh.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;sh.style.setProperty('--ry',(x*7).toFixed(2)+'deg');sh.style.setProperty('--rx',(-y*6).toFixed(2)+'deg')});sh.addEventListener('pointerleave',function(){sh.style.setProperty('--ry','0deg');sh.style.setProperty('--rx','0deg')})}
/* hero pen sequence */
if(sh){
 var ws=$$('.w',sh),nib=$('#nvnib'),sum=$('#nvsum'),timer=0,alive=false,run=0;
 var hi=ws.filter(function(w){return w.dataset.c==='high'}).length;
 var setSum=function(n){sum.textContent=n+' / '+hi};
 var finish=function(){ws.forEach(function(w){var h=w.dataset.c==='high';w.classList.add('on');if(h){w.classList.add('x');if(!w.nextElementSibling||!w.nextElementSibling.classList.contains('nw'))addIns(w,true)}else w.classList.add('sgx')});setSum(hi);nib.classList.remove('show')};
 var addIns=function(w,now){var s=document.createElement('span');s.className='nw';s.textContent=w.dataset.to;s.setAttribute('lang','fa');w.after(s);if(now){s.classList.add('in')}else requestAnimationFrame(function(){requestAnimationFrame(function(){s.classList.add('in')})})};
 var reset=function(){$$('.nw',sh).forEach(function(n){n.remove()});ws.forEach(function(w){w.classList.remove('on','x','sgx')});setSum(0)};
 var moveTo=function(w){var r=w.getBoundingClientRect(),b=sh.getBoundingClientRect();nib.style.transform='translate('+(r.left-b.left+r.width/2-15)+'px,'+(r.top-b.top+r.height-8)+'px) rotate(28deg)';nib.classList.add('show')};
 var sleep=function(ms,id){return new Promise(function(r){timer=setTimeout(function(){r(id===run)},ms)})};
 var loop=async function(){var id=++run,n=0;reset();await sleep(700,id);
  for(var i=0;i<ws.length;i++){var w=ws[i];if(id!==run)return;moveTo(w);if(!await sleep(560,id))return;w.classList.add('on');
   if(w.dataset.c==='high'){w.classList.add('x');if(!await sleep(380,id))return;addIns(w);n++;setSum(n);if(!await sleep(620,id))return}
   else{w.classList.add('sgx');if(!await sleep(700,id))return}}
  nib.classList.remove('show');await sleep(3200,id);if(id===run&&alive)loop()};
 if(RM||!('IntersectionObserver'in window)){finish()}
 else{new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!alive){alive=true;loop()}else if(!v&&alive){alive=false;run++;clearTimeout(timer)}},{threshold:.25}).observe(sh)}
 addEventListener('resize',function(){if(RM)return});
}
/* story */
var ss=$('#stsheet'),steps=$$('.st-step');
if(ss&&'IntersectionObserver'in window){
 var titles=[['draft','پیش‌نویس'],['1 · protect','۱ · محافظت'],['2 · match','۲ · تطبیق'],['3 · tier','۳ · سطح'],['4 · write','۴ · نوشتن']];
 var setStep=function(n){ss.dataset.step=n;var t=titles[n];$('#sttitle').innerHTML='<span class="l-en">'+t[0]+'</span><span class="l-fa" lang="fa">'+t[1]+'</span>';steps.forEach(function(s){s.classList.toggle('act',+s.dataset.s===n)})};
 var sio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)setStep(+e.target.dataset.s)})},{rootMargin:'-42% 0px -42% 0px'});
 steps.forEach(function(s){sio.observe(s)});
 if(RM){steps.forEach(function(s){s.classList.add('act')})}
}
/* ---- the engine (port of engine.py + four style checks) ---- */
var D=null,RX=null,TB=null;
var L='\u0621-\u063A\u0640-\u0652\u0670-\u06D3\u06D5\u200c',ZW='\u200c';
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function nk(s){return s.replace(/ي/g,'ی').replace(/ك/g,'ک').replace(/ى/g,'ی').replace(/ۀ/g,'هٔ').replace(/\u00a0/g,' ').replace(/[ \u200c]/g,'')}
function sx(s){var o='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch===' ')o+='[ '+ZW+']';else if(ch===ZW)o+='[ '+ZW+']?';else if(ch==='ی')o+='[یي]';else if(ch==='ک')o+='[کك]';else o+=ch.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}return o}
function build(){var rs=D.r,keys=rs.map(function(r){return r[0]});keys=keys.filter(function(k,i){return keys.indexOf(k)===i}).sort(function(a,b){return b.length-a.length});
 RX=new RegExp('(?<![' +L+'])(?:'+keys.map(sx).join('|')+')(?![' +L+'])','g');TB={};rs.forEach(function(r){var k=nk(r[0]);if(!(k in TB))TB[k]=r})}
var PROT=/«[^»\n]*»|“[^”\n]*”|"[^"\n]*"|`[^`\n]*`|https?:\/\/\S+|www\.\S+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b|\]\([^)\n]*\)/g;
var DIRB={'در':1,'این':1,'همین':1,'هر':1,'آن':1,'همان':1,'دو':1,'سه':1,'چند':1,'یک':1,'هم':1,'بدین':1,'به':1,'از':1,'برخلاف':1,'خلاف':1};
var RO=new RegExp('(?<=['+L+'] )رو(?!['+L+'])(?! به)','g');
function spans(t){var o=[],m;PROT.lastIndex=0;while((m=PROT.exec(t)))o.push([m.index,m.index+m[0].length]);return o}
function inS(p,sp){for(var i=0;i<sp.length;i++)if(sp[i][0]<=p&&p<sp[i][1])return true;return false}
function find(t){var sp=spans(t),c=[],m;RX.lastIndex=0;
 while((m=RX.exec(t))){if(inS(m.index,sp))continue;var r=TB[nk(m[0])];if(!r)continue;var alts=r[1].split('/'),w=alts[0],end=m.index+m[0].length;
  if(r[0]==='جهت'){var pv=t.slice(0,m.index).match(new RegExp('['+L+']+','g'));if(pv&&DIRB[pv[pv.length-1]])continue}
  if(w==='‹حذف›'){var tl=/^[،,]?[ \t]*/.exec(t.slice(end));end+=tl[0].length;w='';alts=['']}
  c.push({s:m.index,e:end,o:t.slice(m.index,end),w:w,alts:alts,c:r[2],cat:r[3],note:r[4],surf:r[0]})}
 RO.lastIndex=0;while((m=RO.exec(t))){if(inS(m.index,sp))continue;c.push({s:m.index,e:m.index+2,o:'رو',w:'را',alts:['را'],c:'h',cat:'N104',note:'',surf:'رو'})}
 c.sort(function(a,b){return a.s-b.s||(b.e-b.s)-(a.e-a.s)});var out=[],last=-1;c.forEach(function(x){if(x.s>=last){out.push(x);last=x.e}});return out}
var MODES={safe:'h',balanced:'hm',all:'hml'};
var STYLE={S101:['First-person singular. Many universities ask for «نگارنده» or an impersonal passive.','اول‌شخص مفرد. بسیاری از دانشگاه‌ها «نگارنده» یا ساخت مجهول می‌خواهند.'],
 S301:['Booster: claims more certainty than a thesis can usually show.','واژهٔ قطعیت‌ساز: یقینی بیش از آنچه پایان‌نامه معمولاً نشان می‌دهد.'],
 S401:['Vague quantifier with no number or citation. Give the count or the source.','کمیت‌نمای مبهم، بی‌عدد و بی‌منبع. شمار یا منبع را بیاورید.'],
 S901:['Exclamation, emoji or repeated punctuation is out of register.','علامت تعجب، شکلک یا تکرار نشانه‌گذاری نابه‌جاست.']};
var B0='(?<!['+L+'])',B1='(?!['+L+'])';
var SR=[['S101',new RegExp(B0+'(?:به نظر(?:م| من)|فکر[ ‌]?می[ ‌]?کنم|معتقدم|من|مرا|کردم|دیدم|گرفتم|نوشتم)'+B1,'g')],
 ['S301',new RegExp(B0+'(?:قطعاً|قطعا|بی[ ‌]?شک|بی[ ‌]?گمان|بدون شک|بدون تردید|مسلماً|بدیهی است|واضح است که|روشن است که|همه می[ ‌]?دانند|ثابت (?:شد|کرد)|صد[ ‌]?درصد|صد در صد|هرگز|همیشه|همواره|کاملاً|کاملا)'+B1,'g')],
 ['S401',new RegExp(B0+'(?:بسیاری از|تعداد زیادی|تعدادی از|عده[‌ ]?ای|برخی از|اکثر|اغلب|بیشتر مردم|چندین|مقدار زیادی|درصد بالایی|درصد زیادی|تعداد کمی)'+B1,'g')],
 ['S901',/[!！]+|[؟?]{2,}|\.{3,}|…/g]];
function style(t){var sp=spans(t),out=[];SR.forEach(function(p){p[1].lastIndex=0;var m;while((m=p[1].exec(t))){if(!inS(m.index,sp))out.push({code:p[0],s:m.index,t:m[0]})}});out.sort(function(a,b){return a.s-b.s});return out.slice(0,12)}
/* ui */
var inp=$('#nvin'),outEl=$('#nvout'),chips=$('#nvchips'),stl=$('#nvstyle'),stn=$('#nvsn');
var SAMPLE='خب، توی این پژوهش من می‌خوام بررسی کنم که خواب شبانه چه تاثیری روی تمرکز دانشجوها داره. الان خیلی از دانشجوها دیر می‌خوابن و اینجوری صبح‌ها نمی‌تونن تو کلاس تمرکز کنن.\nبه نظرم این موضوع خیلی مهمه چون بخاطر کم‌خوابی، نمره‌ها پایین میاد. قطعاً همه می‌دونن که خواب لازمه، ولی بسیاری از دانشجوها بهش توجه نمی‌کنن!\nیکی از شرکت‌کننده‌ها گفت: «من شب‌ها تا دو نصفه‌شب بیدارم و صبح‌ها نمی‌تونم چشمامو باز کنم».';
var state={rej:{},acc:{}},prev={};
function mode(){var r=$('input[name=nvmode]:checked');return r?r.value:'safe'}
function names(cat){var c=D.c[cat];return c?c:['','','','']}
function render(){
 if(!D||!inp)return;var t=inp.value,ch=find(t),tiers=MODES[mode()],html='',pos=0,applied=0,sug=0,cnt={h:0,m:0,l:0};
 var fin='';
 ch.forEach(function(c,i){cnt[c.c==='h'?'h':c.c==='m'?'m':'l']++;
  var key=c.s+':'+c.o,on=tiers.indexOf(c.c)>=0&&!(c.cat==='N201'&&mode()!=='all');if(state.rej[key])on=false;if(state.acc[key])on=true;
  var cn=names(c.cat),why='<b>'+c.cat+' · '+({h:'high',m:'medium',l:'low'})[c.c]+'</b><span class="l-en">'+esc(cn[2])+(c.note?' '+esc(c.note):'')+'</span><span class="l-fa" lang="fa">'+esc(cn[3])+'</span>'+(c.alts.length>1?'<br><span class="mono">'+esc(c.alts.join(' / '))+'</span>':'');
  var pre=t.slice(pos,c.s);html+=esc(pre);fin+=pre;pos=c.e;
  if(on){applied++;fin+=c.w;html+='<span class="chg" tabindex="0" role="button" data-k="'+esc(key)+'" aria-label="'+esc(c.o+' → '+c.w)+'"><del>'+esc(c.o)+'</del>'+(c.w?'<ins>'+esc(c.w)+'</ins>':'')+'<span class="tip" role="tooltip">'+why+'</span></span>'}
  else{sug++;fin+=c.o;html+='<span class="sug" tabindex="0" role="button" data-k="'+esc(key)+'" data-c="'+({h:'high',m:'medium',l:'low'})[c.c]+'" aria-label="'+esc(c.o)+'"><span>'+esc(c.o)+'</span><span class="tip" role="tooltip">'+why+'<br><span class="mono">→ '+esc(c.alts.join(' / ')||'∅')+'</span></span></span>'}});
 html+=esc(t.slice(pos));fin+=t.slice(pos);outEl.innerHTML=html;outEl.dataset.final=fin;
 var vals={ap:applied,sg:sug,h:cnt.h,m:cnt.m,l:cnt.l};
 chips.innerHTML='<span class="h" data-k="ap">'+applied+' '+(isFa()?'اعمال':'applied')+'</span><span data-k="sg">'+sug+' '+(isFa()?'پیشنهاد':'suggested')+'</span><span class="h">'+cnt.h+' high</span><span class="m">'+cnt.m+' medium</span><span>'+cnt.l+' low</span>';
 $$('span',chips).forEach(function(s,i){var k=s.dataset.k;if(k&&prev[k]!==undefined&&prev[k]!==vals[k]&&!RM){s.classList.add('bump');setTimeout(function(){s.classList.remove('bump')},260)}});prev={ap:applied,sg:sug};
 if(!t.trim())outEl.innerHTML='<span style="color:var(--muted)">'+(isFa()?'اینجا نتیجه می‌آید.':'The result appears here.')+'</span>';
 var st=style(t);stn.textContent=st.length?' · '+st.length:'';
 stl.innerHTML=st.length?st.map(function(x){var m=STYLE[x.code];return '<li><b>'+x.code+'</b><span><q>'+esc(x.t)+'</q> <span class="l-en">'+esc(m[0])+'</span><span class="l-fa" lang="fa">'+esc(m[1])+'</span></span></li>'}).join(''):'<li class="none"><span class="l-en">Nothing flagged.</span><span class="l-fa" lang="fa">مورد خاصی علامت نخورد.</span></li>';
}
function toggle(el){var k=el.dataset.k;if(!k)return;if(el.classList.contains('chg')){state.rej[k]=true;delete state.acc[k]}else{state.acc[k]=true;delete state.rej[k]}render()}
if(inp){
 outEl.addEventListener('click',function(e){var el=e.target.closest('.chg,.sug');if(el)toggle(el)});
 outEl.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){var el=e.target.closest('.chg,.sug');if(el){e.preventDefault();toggle(el)}}});
 inp.addEventListener('input',function(){state={rej:{},acc:{}};render()});
 $$('input[name=nvmode]').forEach(function(r){r.addEventListener('change',function(){state={rej:{},acc:{}};render()})});
 $('#nvsample').addEventListener('click',function(){inp.value=SAMPLE;state={rej:{},acc:{}};render();inp.focus()});
 $('#nvclear').addEventListener('click',function(){inp.value='';state={rej:{},acc:{}};render();inp.focus()});
 $('#nvcopy').addEventListener('click',function(){var b=this,t=outEl.dataset.final||'';var done=function(){var o=b.innerHTML;b.textContent=isFa()?'کپی شد ✓':'Copied ✓';setTimeout(function(){b.innerHTML=o},1400)};if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,done);else done()});
 inp.value=SAMPLE;
 var load=function(){if(D||load.d)return;load.d=1;var s=document.createElement('script');s.src='rules_nev.js';s.onload=function(){D=window.NEV_RULES;build();render()};document.head.appendChild(s)};
 if('IntersectionObserver'in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){load();o.disconnect()}},{rootMargin:'600px'}).observe($('#demo'))}else load();
 new MutationObserver(function(){render()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}

/* ---- naturalness demo (nat_nev.js: R101-R104, R201, R401, R501) ---- */
var nin=$('#natin');
if(nin){
 var NS=null,nOut=$('#natout'),nChips=$('#natchips'),nList=$('#natlist'),nRh=$('#natrh'),nN=$('#natn'),nHint=$('#natmodehint');
 var NSAMPLE='در دنیای پرشتاب امروز، کتابخانه‌های دانشگاهی نقش بسزایی ایفا می‌کنند. همچنین فناوری‌های نوین گام مهمی در دسترسی به منابع هستند. علاوه بر این، پرسشنامه بسیار بسیار مفصل بود و در رابطه با رضایت دانشجویان مورد بررسی قرار گرفت. بنابراین نتایج بسیار حیاتی است. در نهایت ما می‌توانیم نتیجه بگیریم که بر روی این موضوع باید بیشتر کار کرد.\n۱۲ مصاحبه با کتابدار انجام شد و در جدول ۲ آمده است: ۹ نفر ساعت کار را کافی ندانستند.';
 var TN={high:['high','بالا'],medium:['medium','متوسط'],low:['low','پایین']};
 var nmode=function(){var r=$('input[name=natmode]:checked');return r?r.value:'safe'};
 var nrender=function(){
  if(!NS)return;var t=nin.value,res=NS.analyse(t),f=res.findings,tiers=nmode()==='safe'?['high']:['high','medium'],html='',pos=0,list='',ap=0,sg=0;
  f.forEach(function(x,i){x.on=x.chg&&tiers.indexOf(x.conf)>=0;
   var c=NS.data.cats[x.code],why='<b>'+x.code+' · '+TN[x.conf][0]+'</b><span class="l-en">'+esc(c.n)+'</span><span class="l-fa" lang="fa">'+esc(c.nf)+'</span>';
   html+=esc(t.slice(pos,x.s));pos=x.e;
   if(x.on){ap++;html+='<span class="chg" tabindex="0" role="button" data-i="'+i+'" aria-label="'+esc(x.o+' → '+x.sug)+'"><del>'+esc(x.o)+'</del>'+(x.sug?'<ins>'+esc(x.sug)+'</ins>':'')+'<span class="tip">'+why+'</span></span>'}
   else{sg++;html+='<span class="sug" tabindex="0" role="button" data-i="'+i+'" data-c="'+TN[x.conf][0]+'" aria-label="'+esc(x.o)+'">'+esc(x.o)+'<span class="tip">'+why+'</span></span>'}
   var a=NS.data.ask[x.code];
   list+='<li id="nf'+i+'" data-c="'+TN[x.conf][0]+'"><span class="cd mono">'+x.code+'</span><div><p class="cw"><q lang="fa" dir="rtl">'+esc(x.o.trim())+'</q>'+(x.sug?' <span aria-hidden="true">→</span> <q lang="fa" dir="rtl">'+esc(x.sug.trim())+'</q>':'')+
    ' <span class="tr mono">'+TN[x.conf][0]+' · '+(x.on?'<span class="l-en">applied</span><span class="l-fa" lang="fa">اعمال شد</span>':'<span class="l-en">suggestion</span><span class="l-fa" lang="fa">پیشنهاد</span>')+'</span></p>'+
    '<p class="ww"><span class="l-en">'+esc(NS.data.cats[x.code].w+(x.note?' '+x.note:''))+'</span><span class="l-fa" lang="fa">'+esc(NS.data.cats[x.code].wf)+'</span></p>'+
    (x.ask?'<p class="qq"><b class="mono"><span class="l-en">ask yourself</span><span class="l-fa" lang="fa">از خودتان بپرسید</span></b> <span class="l-en">'+esc(a[0])+'</span><span class="l-fa" lang="fa">'+esc(a[1])+'</span></p>':'')+'</div></li>'});
  html+=esc(t.slice(pos));nOut.innerHTML=t.trim()?html:'<span style="color:var(--muted)">'+(isFa()?'اینجا نتیجه می‌آید.':'The result appears here.')+'</span>';
  nList.innerHTML=list||'<li class="none">'+(isFa()?'چیزی پیدا نشد.':'Nothing found. That is a fine result.')+'</li>';
  nChips.innerHTML='<span class="h">'+ap+' '+(isFa()?'اعمال':'applied')+'</span><span>'+sg+' '+(isFa()?'پیشنهاد':'suggested')+'</span><span>'+f.length+' '+(isFa()?'یافته':'findings')+'</span>';
  nN.textContent=f.length?' · '+f.length:'';
  nHint.textContent=nmode()==='safe'?(isFa()?'safe: فقط حذف‌های بی‌ابهام':'safe: unambiguous trims only'):(isFa()?'balanced: سطح medium هم اعمال می‌شود':'balanced: medium tier applied too');
  var r=res.rhythm,L=function(en,fa){return isFa()?fa:en};
  if(!r.sentences){nRh.innerHTML=''}else{var mx=Math.max.apply(0,r.hist)||1,bars=r.hist.map(function(v,i){return '<i style="height:'+Math.round(6+44*v/mx)+'px" title="'+(i<8?i*5+'–'+(i*5+4):'40+')+': '+v+'"></i>'}).join('');
   var cell=function(k,v){return '<div><b class="mono">'+v+'</b><span>'+k+'</span></div>'};
   nRh.innerHTML=cell(L('sentences','جمله'),r.sentences)+cell(L('words per sentence, mean · median','واژه در جمله، میانگین · میانه'),r.mean.toFixed(1)+' · '+r.median)+cell(L('shortest–longest','کوتاه‌ترین–بلندترین'),r.min+'–'+r.max)+cell(L('variation (stdev ÷ mean)','پراکندگی (انحراف ÷ میانگین)'),r.variation.toFixed(2))+cell(L('opener diversity (1.0 = all differ)','تنوع آغازگر (۱٫۰ = همه متفاوت)'),r.openers.toFixed(2))+cell(L('connector openers','آغاز با حرف‌ربط'),r.conn+'%')+cell(L('passive sentences','جملهٔ مجهول'),r.passive+'%')+
    '<div class="hist" role="img" aria-label="'+L('Sentence-length histogram','نمودار طول جمله')+'"><span class="bars">'+bars+'</span><span>'+L('length histogram, 0–4 … 40+ words','نمودار طول، ۰–۴ تا +۴۰ واژه')+'</span></div>'}
 };
 var nfocus=function(el){var s=el.closest('.chg,.sug');if(!s)return;var li=$('#nf'+s.dataset.i);if(li){li.scrollIntoView({block:'nearest',behavior:RM?'auto':'smooth'});li.classList.add('flash');setTimeout(function(){li.classList.remove('flash')},1200)}};
 nOut.addEventListener('click',function(e){nfocus(e.target)});
 nOut.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();nfocus(e.target)}});
 nin.addEventListener('input',nrender);
 $$('input[name=natmode]').forEach(function(r){r.addEventListener('change',nrender)});
 $('#natsample').addEventListener('click',function(){nin.value=NSAMPLE;nrender();nin.focus()});
 $('#natclear').addEventListener('click',function(){nin.value='';nrender();nin.focus()});
 nin.value=NSAMPLE;
 var nload=function(){if(NS||nload.d)return;nload.d=1;var s=document.createElement('script');s.src='nat_nev.js';s.onload=function(){NS=window.NEV_NAT;nrender()};document.head.appendChild(s)};
 if('IntersectionObserver'in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){nload();o.disconnect()}},{rootMargin:'600px'}).observe($('#natural'))}else nload();
 new MutationObserver(function(){nrender()}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
})();
