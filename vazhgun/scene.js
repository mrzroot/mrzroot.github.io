(function(){
'use strict';
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return[].slice.call((r||document).querySelectorAll(s))};
var RLM='\u200f',LRM='\u200e';
/* ---- bidi classes (ranges generated from the same Unicode data the Python tool uses) ---- */
var RG=[[0,8,"BN"],[9,9,"S"],[10,10,"B"],[11,11,"S"],[12,12,"WS"],[13,13,"B"],[14,27,"BN"],[28,30,"B"],[31,31,"S"],[32,32,"WS"],[33,34,"ON"],[35,37,"ET"],[38,42,"ON"],[43,43,"ES"],[44,44,"CS"],[45,45,"ES"],[46,47,"CS"],[48,57,"EN"],[58,58,"CS"],[59,64,"ON"],[65,90,"L"],[91,96,"ON"],[97,122,"L"],[123,126,"ON"],[127,132,"BN"],[133,133,"B"],[134,159,"BN"],[160,160,"CS"],[161,161,"ON"],[162,165,"ET"],[166,169,"ON"],[170,170,"L"],[171,172,"ON"],[173,173,"BN"],[174,175,"ON"],[176,177,"ET"],[178,179,"EN"],[180,180,"ON"],[181,181,"L"],[182,184,"ON"],[185,185,"EN"],[186,186,"L"],[187,191,"ON"],[192,214,"L"],[215,215,"ON"],[216,246,"L"],[247,247,"ON"],[248,591,"L"],[1424,1424,"L"],[1425,1469,"NSM"],[1470,1470,"R"],[1471,1471,"NSM"],[1472,1472,"R"],[1473,1474,"NSM"],[1475,1475,"R"],[1476,1477,"NSM"],[1478,1478,"R"],[1479,1479,"NSM"],[1480,1487,"L"],[1488,1514,"R"],[1515,1518,"L"],[1519,1524,"R"],[1525,1535,"L"],[1536,1541,"AN"],[1542,1543,"ON"],[1544,1544,"AL"],[1545,1546,"ET"],[1547,1547,"AL"],[1548,1548,"CS"],[1549,1549,"AL"],[1550,1551,"ON"],[1552,1562,"NSM"],[1563,1610,"AL"],[1611,1631,"NSM"],[1632,1641,"AN"],[1642,1642,"ET"],[1643,1644,"AN"],[1645,1647,"AL"],[1648,1648,"NSM"],[1649,1749,"AL"],[1750,1756,"NSM"],[1757,1757,"AN"],[1758,1758,"ON"],[1759,1764,"NSM"],[1765,1766,"AL"],[1767,1768,"NSM"],[1769,1769,"ON"],[1770,1773,"NSM"],[1774,1775,"AL"],[1776,1785,"EN"],[1786,1791,"AL"],[1872,1919,"AL"],[2208,2249,"AL"],[2250,2273,"NSM"],[2274,2274,"AN"],[2275,2303,"NSM"],[8192,8202,"WS"],[8203,8205,"BN"],[8206,8206,"L"],[8207,8207,"R"],[8208,8231,"ON"],[8232,8232,"WS"],[8233,8233,"B"],[8234,8234,"LRE"],[8235,8235,"RLE"],[8236,8236,"PDF"],[8237,8237,"LRO"],[8238,8238,"RLO"],[8239,8239,"CS"],[8240,8244,"ET"],[8245,8259,"ON"],[8260,8260,"CS"],[8261,8286,"ON"],[8287,8287,"WS"],[8288,8292,"BN"],[8293,8293,"L"],[8294,8294,"LRI"],[8295,8295,"RLI"],[8296,8296,"FSI"],[8297,8297,"PDI"],[8298,8303,"BN"],[8352,8384,"ET"],[8385,8399,"L"],[8592,8721,"ON"],[8722,8722,"ES"],[8723,8723,"ET"],[8724,9013,"ON"],[9014,9082,"L"],[9083,9108,"ON"],[9109,9109,"L"],[9110,9215,"ON"],[64285,64285,"R"],[64286,64286,"NSM"],[64287,64296,"R"],[64297,64297,"ES"],[64298,64310,"R"],[64311,64311,"L"],[64312,64316,"R"],[64317,64317,"L"],[64318,64318,"R"],[64319,64319,"L"],[64320,64321,"R"],[64322,64322,"L"],[64323,64324,"R"],[64325,64325,"L"],[64326,64335,"R"],[64336,64450,"AL"],[64451,64466,"L"],[64467,64829,"AL"],[64830,64847,"ON"],[64848,64911,"AL"],[64912,64913,"L"],[64914,64967,"AL"],[64968,64974,"L"],[64975,64975,"ON"],[64976,65007,"L"],[65008,65020,"AL"],[65021,65023,"ON"],[65136,65140,"AL"],[65141,65141,"L"],[65142,65276,"AL"],[65277,65278,"L"],[65279,65279,"BN"]];
function bcls(ch){var c=ch.codePointAt(0),lo=0,hi=RG.length-1;
 if(c===0x2066||c===0x2067||c===0x2068||c===0x2069||(c>=0x202a&&c<=0x202e))return 'X';
 while(lo<=hi){var m=(lo+hi)>>1,r=RG[m];if(c<r[0])hi=m-1;else if(c>r[1])lo=m+1;else return r[2]}return 'L'}
var BR={'(':')','[':']','{':'}'},CL={')':'(',']':'[','}':'{'};
var MIR={'(':')',')':'(','[':']',']':'[','{':'}','}':'{','<':'>','>':'<','\u00ab':'\u00bb','\u00bb':'\u00ab'};
/* ---- UAX #9, one paragraph, implicit levels (port of vazhgun/uba.py) ---- */
function resolve(text,rtl,trace){
 var chars=Array.from(text),n=chars.length,base=rtl?1:0,sos=rtl?'R':'L',eos=sos,cls=chars.map(bcls);
 if(cls.indexOf('X')>=0)return null;
 var keep=[];for(var i=0;i<n;i++)if(cls[i]!=='BN')keep.push(i);
 var t=keep.map(function(i){return cls[i]}),ch=keep.map(function(i){return chars[i]}),m=t.length,snap={};
 if(trace)snap.c0=t.slice();
 var prev=sos,last;
 for(i=0;i<m;i++){if(t[i]==='NSM')t[i]=prev;prev=t[i]}
 last=sos;for(i=0;i<m;i++){if(t[i]==='L'||t[i]==='R'||t[i]==='AL')last=t[i];else if(t[i]==='EN'&&last==='AL')t[i]='AN'}
 t=t.map(function(x){return x==='AL'?'R':x});
 if(trace)snap.c1=t.slice();
 for(i=1;i<m-1;i++){if(t[i]==='ES'&&t[i-1]==='EN'&&t[i+1]==='EN')t[i]='EN';else if(t[i]==='CS'&&t[i-1]===t[i+1]&&(t[i-1]==='EN'||t[i-1]==='AN'))t[i]=t[i-1]}
 i=0;while(i<m){if(t[i]==='ET'){var j=i;while(j<m&&t[j]==='ET')j++;if((i>0&&t[i-1]==='EN')||(j<m&&t[j]==='EN'))for(var k=i;k<j;k++)t[k]='EN';i=j}else i++}
 t=t.map(function(x){return(x==='ES'||x==='ET'||x==='CS')?'ON':x});
 last=sos;for(i=0;i<m;i++){if(t[i]==='L'||t[i]==='R')last=t[i];else if(t[i]==='EN'&&last==='L')t[i]='L'}
 if(trace)snap.c2=t.slice();
 var e=rtl?'R':'L',strong=function(x){return(x==='R'||x==='EN'||x==='AN')?'R':(x==='L'?'L':'')};
 var pairs=[],stack=[];
 for(i=0;i<m;i++){if(t[i]!=='ON')continue;var c=ch[i];
  if(BR[c]){if(stack.length>=63)break;stack.push([BR[c],i])}
  else if(CL[c]){for(k=stack.length-1;k>=0;k--){if(stack[k][0]===c){pairs.push([stack[k][1],i]);stack.length=k;break}}}}
 pairs.sort(function(a,b){return a[0]-b[0]});
 pairs.forEach(function(p){var o=p[0],cc=p[1],ins={};t.slice(o+1,cc).forEach(function(x){var s=strong(x);if(s)ins[s]=1});
  if(!Object.keys(ins).length)return;var nw;
  if(ins[e])nw=e;else{var ctx=sos;for(var q=o-1;q>=0;q--){var s=strong(t[q]);if(s){ctx=s;break}}nw=ctx!==e?ctx:e}
  t[o]=t[cc]=nw;[o,cc].forEach(function(pos){var q=pos+1;while(q<m&&cls[keep[q]]==='NSM'){t[q]=nw;q++}})});
 var neutral={B:1,S:1,WS:1,ON:1,LRI:1,RLI:1,FSI:1,PDI:1};
 i=0;while(i<m){if(neutral[t[i]]){var j2=i;while(j2<m&&neutral[t[j2]])j2++;var bf=i>0?strong(t[i-1]):sos,af=j2<m?strong(t[j2]):eos,nw2=(bf===af&&bf)?bf:e;for(k=i;k<j2;k++)t[k]=nw2;i=j2}else i++}
 if(trace)snap.c3=t.slice();
 var lv=t.map(function(x){return base===0?(x==='L'?0:(x==='R'?1:2)):(x==='R'?1:2)});
 var tail={WS:1,S:1,B:1,FSI:1,LRI:1,RLI:1,PDI:1};
 for(k=m-1;k>=0;k--){if(tail[cls[keep[k]]])lv[k]=base;else break}
 for(k=0;k<m;k++){if(cls[keep[k]]==='S'||cls[keep[k]]==='B'){lv[k]=base;var q2=k-1;while(q2>=0&&cls[keep[q2]]==='WS'){lv[q2]=base;q2--}}}
 var out=[],ll=base,kk=0;for(i=0;i<n;i++){if(kk<m&&keep[kk]===i){ll=lv[kk];kk++}out.push(ll)}
 return{chars:chars,cls:cls,levels:out,snap:snap,keep:keep,base:base}}
function order(levels){var o=levels.map(function(_,i){return i});if(!levels.length)return o;
 var hi=Math.max.apply(null,levels),odd=levels.filter(function(l){return l%2}),lo=odd.length?Math.min.apply(null,odd):hi+1;
 for(var lev=hi;lev>=lo;lev--){var i=0;while(i<o.length){if(levels[o[i]]>=lev){var j=i;while(j<o.length&&levels[o[j]]>=lev)j++;var seg=o.slice(i,j).reverse();for(var k=0;k<seg.length;k++)o[i+k]=seg[k];i=j}else i++}}return o}
function positions(levels){var o=order(levels),p=[];o.forEach(function(ix,slot){p[ix]=slot});return p}
/* ---- chains (port of vazhgun/checks.py) ---- */
var DIGIT='0-9\u06f0-\u06f9\u0660-\u0669',SEP='\\-\u2013\u2212/.:\u066b\u066c,\u060c',MARK='\u200e\u200f';
var CAP=['شکل','جدول','نمودار','رابطه','معادله','فرمول','فصل','بخش','پیوست','تصویر','عکس','figure','fig','table','eq','equation','chapter','section','appendix'],PAGE=['صفحه','صفحات','ص','صص','p','pp','page','pages'];
function chainRe(){return new RegExp('['+DIGIT+']+(?:['+MARK+']*['+SEP+']['+MARK+']*['+DIGIT+']+)+','g')}
function minusRe(){return new RegExp('(?<![' +DIGIT+'\\p{L}\\p{N}_'+MARK+'])([\\-\u2212+])(?=['+DIGIT+'])','gu')}
function kindOf(text,m){var chain=m[0],clean=chain.replace(new RegExp('['+MARK+']','g'),''),comps=clean.split(new RegExp('['+SEP+']')),seps=clean.match(new RegExp('['+SEP+']','g'))||[];
 var before=text.slice(Math.max(0,m.index-14),m.index),bw=before.match(/\p{L}+\.?/gu)||[],lastw=bw.length?bw[bw.length-1].replace(/\.$/,'').toLowerCase():'';
 var only=function(set){return seps.every(function(s){return set.indexOf(s)>=0})};
 if(comps.length===2&&only(['.','\u066b']))return'decimal';if(only([':'])&&comps.length<=3)return'time';
 if(comps.length>=4||comps.some(function(c){return c.length>=6}))return'id';
 if(CAP.indexOf(lastw)>=0)return'caption-number';
 var st=text.trim(),esc=chain.replace(/[.*+?^${}()|[\]\\\/-]/g,'\\$&');
 if(new RegExp('^[(\\[]?\\s*'+esc+'\\s*[)\\]]?$').test(st))return'caption-number';
 if(PAGE.indexOf(lastw)>=0)return'page-range';
 if(comps.length===3&&(comps[0].length===4||comps[2].length===4))return'date';
 if(comps.length===2&&comps.every(function(c){return c.length===4}))return'year-range';
 if(comps.length===2&&only(['-','\u2013','\u2212']))return'range';return'other'}
var KIND={'caption-number':['caption number','شمارهٔ شکل/جدول'],'page-range':['page range','بازهٔ صفحه'],'year-range':['year range','بازهٔ سال'],'date':['date','تاریخ'],'range':['numeric range','بازهٔ عددی']};
function analyseLine(T,rtl){var R=resolve(T,rtl);if(!R)return{unsupported:true,chains:[],signs:[]};var pos=positions(R.levels),chars=R.chars,chains=[],signs=[];
 if(!rtl)return{R:R,pos:pos,chains:[],signs:[],ltrBase:true};
 /* indices are in code units for regex; chars is by code point. Persian text has no astral chars, so equal */
 var m,cre=chainRe();while((m=cre.exec(T))){var kd=kindOf(T,m);if(kd==='decimal'||kd==='time'||kd==='id'||kd==='other')continue;
  var ds=[];for(var i=m.index;i<m.index+m[0].length;i++)if(new RegExp('['+DIGIT+']').test(T[i]))ds.push(i);if(ds.length<2)continue;
  var marked=m[0].indexOf(RLM)>=0||m[0].indexOf(LRM)>=0||/[\u200e\u200f]/.test(T.slice(Math.max(0,m.index-1),m.index));
  chains.push({s:m.index,e:m.index+m[0].length,txt:m[0],kind:kd,order:pos[ds[0]]<pos[ds[ds.length-1]]?'ltr':'rtl',marked:marked})}
 var mr=minusRe();while((m=mr.exec(T))){var j=m.index+1;if(pos[m.index]>pos[j])signs.push({s:m.index,e:m.index+1,txt:m[1]})}
 return{R:R,pos:pos,chains:chains,signs:signs}}
function fixLine(T,rtl,policy,signs){var A=analyseLine(T,rtl);if(A.unsupported||A.ltrBase)return T;var dels={},ins={};
 A.chains.forEach(function(c){var re=new RegExp('['+MARK+']*(['+SEP+'])['+MARK+']*','g'),mm,seg=T.slice(c.s,c.e);
  while((mm=re.exec(seg))){for(var i=c.s+mm.index;i<c.s+mm.index+mm[0].length;i++)if(T[i]===RLM||T[i]===LRM)dels[i]=1;if(policy==='reading'){var p=c.s+mm.index+mm[0].length;ins[p]=(ins[p]||'')+RLM}}
  if(policy==='ltr'){if(T.slice(Math.max(0,c.s-1),c.s)!==LRM)ins[c.s]=(ins[c.s]||'')+LRM;if(T.slice(c.e,c.e+1)!==LRM)ins[c.e]=(ins[c.e]||'')+LRM}});
 if(signs)A.signs.forEach(function(s){ins[s.s]=(ins[s.s]||'')+LRM});
 var out='';for(var i=0;i<=T.length;i++){if(ins[i])out+=ins[i];if(i<T.length&&!dels[i])out+=T[i]}return out}
/* ---- chip rows ---- */
var CELL=44;
var GRP=function(c){return c==='R'||c==='AL'?'r':(c==='L'?'l':(c==='EN'||c==='AN'?'n':'o'))};
var SHOW=function(c){return c===' '?'␣':c==='\u200e'?'LRM':c==='\u200f'?'RLM':c==='\u200c'?'ZWNJ':c==='\n'?'¶':c};
function chipsTyped(R,cls){return R.chars.map(function(c,i){return '<span class="ch g-'+GRP(cls[i])+(c.length&&/^[\u200c\u200e\u200f ]$/.test(c)?' ctl':'')+'" data-i="'+i+'" style="--x:'+i*CELL+'px"><b>'+SHOW(c)+'</b><i>'+cls[i]+'</i></span>'}).join('')}
function chipsDrawn(R){var o=order(R.levels),pos=positions(R.levels);
 return o.map(function(ix,slot){var c=R.chars[ix],lv=R.levels[ix],mc=(lv%2&&MIR[c])?MIR[c]:c;
  return '<span class="ch g-'+GRP(R.snap.c3?'':R.cls[ix])+'" data-i="'+ix+'" data-d="'+(ix-slot)*CELL+'" style="--x:'+slot*CELL+'px"><b>'+SHOW(mc)+'</b><u>'+lv+'</u></span>'}).join('')}
function drawnHTML(R){var o=order(R.levels);
 return o.map(function(ix,slot){var c=R.chars[ix],lv=R.levels[ix],mc=(lv%2&&MIR[c])?MIR[c]:c,k=R.cls[ix];
  return '<span class="ch g-'+GRP(k)+(/^[\u200c\u200e\u200f ]$/.test(c)?' ctl':'')+'" data-i="'+ix+'" data-d="'+(ix-slot)*CELL+'" style="--x:'+slot*CELL+'px"><b>'+SHOW(mc)+'</b><u>'+lv+'</u></span>'}).join('')}
function typedHTML(R){return R.chars.map(function(c,i){var k=R.cls[i];return '<span class="ch g-'+GRP(k)+(/^[\u200c\u200e\u200f ]$/.test(c)?' ctl':'')+'" data-i="'+i+'" style="--x:'+i*CELL+'px"><b>'+SHOW(c)+'</b><i>'+k+'</i></span>'}).join('')}
function fly(row){if(RM||!row.animate)return;$$('.ch',row).forEach(function(el,k){var d=+el.dataset.d;if(!d)return;el.animate([{transform:'translate('+d+'px,-46px)',opacity:.35},{transform:'none',opacity:1}],{duration:760,delay:k*40,easing:'cubic-bezier(.5,.05,.2,1)',fill:'backwards'})})}
function link(box){box.addEventListener('mouseover',function(e){var c=e.target.closest('.ch');if(!c)return;$$('.ch[data-i="'+c.dataset.i+'"]',box).forEach(function(x){x.classList.add('hl')})});box.addEventListener('mouseout',function(){$$('.ch.hl',box).forEach(function(x){x.classList.remove('hl')})})}
var isFa=function(){return document.documentElement.lang==='fa'};
var T2=function(en,fa){return '<span class="l-en">'+en+'</span><span class="l-fa" lang="fa">'+fa+'</span>'};
/* ---- hero stage ---- */
var stage=$('#stage');
if(stage){
 var CTX=[['شکل ۲-۳',true],['Fig. ۲-۳',true],['(۲-۴)',true],['صفحات ۱۲-۱۵',true]],ci=0,tT=$('#stgT'),tD=$('#stgD'),tV=$('#stgV'),btns=$$('#ctxs button'),timer=0,alive=false,user=false;
 var show=function(i,anim){ci=i;btns.forEach(function(b,k){b.setAttribute('aria-pressed',k===i)});var T=CTX[i][0],A=analyseLine(T,true),R=A.R;
  tT.innerHTML=typedHTML(R);tD.innerHTML=drawnHTML(R);var w=R.chars.length*CELL+'px';tT.style.width=tD.style.width=w;
  var c=A.chains[0],left=c&&c.order==='ltr';
  tV.innerHTML=c?(left?T2('first number drawn on the <b>left</b> → «۲-۳» reads as typed on screen','عدد اول سمت <b>چپ</b> دیده می‌شود'):T2('first number drawn on the <b>right</b> → a Persian reader sees «'+T.replace(/[^۰-۹\-]/g,'').replace(/(\d+)-(\d+)/,'$1-$2')+'» in reading order','عدد اول سمت <b>راست</b> دیده می‌شود (ترتیب خواندن)')):'';
  tV.className='stg-v '+(c?(left?'is-ltr':'is-rtl'):'');
  if(anim)fly(tD)};
 var next=function(){show((ci+1)%CTX.length,true)};
 var start=function(){if(RM||user||timer||!alive)return;timer=setInterval(next,4600)},stop=function(){clearInterval(timer);timer=0};
 btns.forEach(function(b,k){b.addEventListener('click',function(){user=true;stop();show(k,true)})});
 link(stage);show(0,false);
 if(!RM&&'IntersectionObserver'in window)new IntersectionObserver(function(es){var v=es[0].isIntersecting;alive=v;if(v){setTimeout(function(){fly(tD)},300);start()}else stop()},{threshold:.35}).observe(stage);
 $('#stgReplay').addEventListener('click',function(){fly(tD)});
}
/* ---- lab ---- */
var lin=$('#lab-in');
if(lin){
 var out=$('#lab-out'),sum=$('#lab-sum'),fixbar=$('#lab-fix');
 var SAMPLE='در شکل ۲-۳ نتایج آمده است.\nFig. ۲-۳ shows the setup.\nصفحات ۱۲-۱۵ را ببینید.\nدما -۵ درجه بود.';
 var rtl=function(){var r=$('input[name=labdir]:checked');return !r||r.value==='rtl'};
 var esc=function(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};
 var deb=0,first=true;
 function render(anim){
  var lines=lin.value.split('\n'),h='',all=[],shown=0,R0=rtl();
  lines.forEach(function(L,li){if(!L.trim())return;var A=analyseLine(L,R0);
   if(shown>=8)return;shown++;
   if(A.unsupported){h+='<article class="lcard"><p class="lc-t" dir="auto">'+esc(L)+'</p><p class="lc-e">'+T2('Explicit embedding or isolate characters: outside what vazhgun interprets, it reports and stops.','نویسه‌های embedding یا isolate: خارج از دامنهٔ واژگون؛ گزارش می‌دهد و پیش نمی‌رود.')+'</p></article>';return}
   var tags='';A.chains.forEach(function(c){all.push(c);tags+='<span class="tag '+(c.order==='ltr'?'t-l':'t-r')+'"><b>'+esc(c.txt.replace(/[\u200e\u200f]/g,''))+'</b> '+T2(KIND[c.kind][0]+' · first number on the '+(c.order==='ltr'?'LEFT':'RIGHT')+(c.marked?' · marked':''),KIND[c.kind][1]+' · عدد اول سمت '+(c.order==='ltr'?'چپ':'راست')+(c.marked?' · نشانه‌دار':''))+'</span>'});
   A.signs.forEach(function(s){tags+='<span class="tag t-s"><b>'+esc(s.txt)+'۵</b> '+T2('V203 · the sign is drawn after its number','V203 · علامت پس از عدد دیده می‌شود')+'</span>'});
   h+='<article class="lcard" data-l="'+li+'"><div class="lc-h mono">¶'+(li+1)+'</div><div class="lc-scroll" tabindex="0"><div class="rowl mono">'+T2('typed','تایپ‌شده')+'</div><div class="row typed" style="width:'+A.R.chars.length*CELL+'px">'+typedHTML(A.R)+'</div><div class="rowl mono">'+T2('drawn','دیده‌شده')+'</div><div class="row drawn" style="width:'+A.R.chars.length*CELL+'px">'+drawnHTML(A.R)+'</div></div>'+(tags?'<div class="tags">'+tags+'</div>':'')+'</article>'});
  if(lines.filter(function(l){return l.trim()}).length>8)h+='<p class="hint">'+T2('Showing the first 8 lines.','فقط ۸ خط اول نمایش داده می‌شود.')+'</p>';
  out.innerHTML=h||'<p class="hint">'+T2('Type a line with a number chain, such as «شکل ۲-۳».','خطی با زنجیرهٔ عددی بنویسید، مثلاً «شکل ۲-۳».')+'</p>';
  link(out);
  var by={};all.forEach(function(c){(by[c.kind]=by[c.kind]||[]).push(c)});var incon=[],unm=0;
  Object.keys(by).forEach(function(k){var o={};by[k].forEach(function(c){o[c.order]=1;if(!c.marked)unm++});if(Object.keys(o).length>1)incon.push(k)});
  var nSign=0;$$('.t-s',out).forEach(function(){nSign++});
  sum.innerHTML=!R0?T2('Left-to-right page: vazhgun only analyses right-to-left paragraphs for chains.','صفحهٔ چپ‌به‌راست: واژگون زنجیره‌ها را فقط در پاراگراف راست‌به‌چپ بررسی می‌کند.'):
   (incon.length?'<b class="warn">V202</b> '+T2('The same kind of number is drawn two ways: '+incon.map(function(k){return KIND[k][0]}).join(', ')+'.','یک نوع عدد در دو ترتیب دیده می‌شود: '+incon.map(function(k){return KIND[k][1]}).join('، ')+'.'):(all.length?'<b>V201</b> '+T2(all.length+' chain'+(all.length>1?'s':'')+' drawn consistently; the order still rests on the renderer.',all.length+' زنجیره یکدست دیده می‌شود؛ ترتیب همچنان به نمایشگر بستگی دارد.'):T2('No number chain found yet.','هنوز زنجیرهٔ عددی پیدا نشد.')))+(nSign?' · <b class="warn">V203</b> '+T2(nSign+' sign'+(nSign>1?'s':'')+' jumping behind a number.',nSign+' علامت پشت عدد می‌پرد.'):'');
  if(anim!==false&&!first){$$('.lcard .row.drawn',out).slice(0,4).forEach(fly)}
  first=false}
 var sched=function(){clearTimeout(deb);deb=setTimeout(function(){render(true)},260)};
 lin.addEventListener('input',sched);$$('input[name=labdir]').forEach(function(r){r.addEventListener('change',function(){render(true)})});
 var apply=function(policy){var R0=rtl();lin.value=lin.value.split('\n').map(function(L){return L.trim()?fixLine(L,R0,policy,true):L}).join('\n');render(true)};
 $('#lab-rd').addEventListener('click',function(){apply('reading')});$('#lab-ltr').addEventListener('click',function(){apply('ltr')});
 $('#lab-sample').addEventListener('click',function(){lin.value=SAMPLE;render(true)});$('#lab-clear').addEventListener('click',function(){lin.value='';render(false);lin.focus()});
 lin.value=SAMPLE;render(false);
 new MutationObserver(function(){render(false)}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 if(!RM&&'IntersectionObserver'in window){var seen=false;new IntersectionObserver(function(es){if(es[0].isIntersecting&&!seen){seen=true;$$('.lcard .row.drawn',out).slice(0,4).forEach(fly)}},{threshold:.3}).observe(out)}
}
/* ---- trace: scroll story, the real resolution phases ---- */
var tr=$('#trace');
if(tr){
 var board=$('#trb'),stepEls=$$('.trs',tr),trk=$('#trtrack'),cur=-1,TS=['شکل ۲-۳','Fig. ۲-۳'],ti=0,TR=null;
 var build=function(){var R=resolve(TS[ti],true,true);TR=R;var o=order(R.levels);R._pos=positions(R.levels);
  board.innerHTML=R.chars.map(function(c,i){return '<span class="tc" data-i="'+i+'" style="--x:'+i*CELL+'px"><b>'+SHOW(c)+'</b><i></i><u></u></span>'}).join('');board.style.width=R.chars.length*CELL+'px';set(cur<0?0:cur,true)};
 var LAB=function(R,s){var arr=s===0?R.snap.c0:s===1?R.snap.c1:s===2?R.snap.c2:s===3?R.snap.c3:null;return arr};
 function set(s,force){if(s===cur&&!force)return;cur=s;tr.setAttribute('data-step',s);stepEls.forEach(function(e,k){e.classList.toggle('on',k===s);e.setAttribute('aria-current',k===s?'step':'false')});
  var R=TR,tcs=$$('.tc',board),a=LAB(R,s);
  tcs.forEach(function(el,i){var ix=R.keep.indexOf(i),lbl='',g='o';
   if(s<=3){var k=a[ix];lbl=k;g=GRP(k)}else{g=GRP(R.snap.c3[ix])}
   var prevL=el.querySelector('i').textContent;el.querySelector('i').textContent=lbl;el.querySelector('u').textContent=s>=4?R.levels[i]:'';
   el.className='tc g-'+g+(s>=4?' lv'+R.levels[i]:'')+(s>=2&&s<=3&&prevL&&prevL!==lbl?' chg':'');
   el.style.setProperty('--dx',(s>=5?(R._pos[i]-i)*CELL:0)+'px');
   var c=R.chars[i];el.firstChild.textContent=(s>=5&&R.levels[i]%2&&MIR[c])?MIR[c]:SHOW(c)});
  var v=$('#trv');v.innerHTML=s===5?(R._pos[R.chars.length-1]<R._pos[R.chars.length-3]?T2('first number on the LEFT','عدد اول سمت چپ'):T2('first number on the RIGHT','عدد اول سمت راست')):''}
 $$('#trsample button').forEach(function(b,k){b.addEventListener('click',function(){ti=k;$$('#trsample button').forEach(function(x,j){x.setAttribute('aria-pressed',j===k)});build()})});
 stepEls.forEach(function(e,k){e.addEventListener('click',function(){if(sticky()){var top=trk.getBoundingClientRect().top+scrollY,h=trk.offsetHeight-innerHeight;scrollTo({top:top+h*(k+.5)/stepEls.length,behavior:RM?'auto':'smooth'})}else set(k)})});
 var mq=matchMedia('(min-width:861px)'),sticky=function(){return mq.matches&&!RM};
 var tick=0,upd=function(){tick=0;if(!sticky())return;var r=trk.getBoundingClientRect(),h=Math.max(1,trk.offsetHeight-innerHeight),p=Math.max(0,Math.min(.9999,-(r.top)/h));set(Math.floor(p*stepEls.length))};
 addEventListener('scroll',function(){if(!tick)tick=requestAnimationFrame(upd)},{passive:true});
 $('#trnext').addEventListener('click',function(){set((cur+1)%stepEls.length)});
 build();upd();
}
/* ---- slider-in + reveal ---- */
var io=('IntersectionObserver'in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12}):null;
$$('.reveal').forEach(function(el){io?io.observe(el):el.classList.add('in')});
/* ---- before/after slider (as before) ---- */
var cmp=$('#cmp');
if(cmp){var r=cmp.querySelector('input');r.addEventListener('input',function(){cmp.style.setProperty('--p',r.value+'%')});
 if('IntersectionObserver'in window&&!RM){var done=false,io2=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!done){done=true;var t0=null;(function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/1200,1),v=50+Math.sin(k*Math.PI*2)*30*(1-k);r.value=v;cmp.style.setProperty('--p',v+'%');if(k<1)requestAnimationFrame(step)})(performance.now())}},{threshold:.6});io2.observe(cmp)}}
})();
