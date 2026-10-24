(function(){'use strict';
/* ---- engine: a port of arjaa's structure.py / cites.py / checks.py (paragraph = one line; "# " = Heading 1) ---- */
var W='[\\p{L}\\p{N}_]',NW='(?<!'+W+')',NA='(?!'+W+')';
var FAD='۰۱۲۳۴۵۶۷۸۹',ARD='٠١٢٣٤٥٦٧٨٩',LET={'ي':'ی','ى':'ی','ك':'ک','ۀ':'ه','ة':'ه'};
function norm(s){var o='';for(var i=0;i<s.length;i++){var c=s.charAt(i),k=FAD.indexOf(c);if(k<0)k=ARD.indexOf(c);o+=k>=0?String(k):(LET[c]||c)}return o}
function faDigits(s){return s.replace(/[0-9]/g,function(d){return FAD.charAt(+d)})}
var DROP=/[\u200c-\u200f\u0640\u064b-\u065f]/g;
function key(s){return norm(s).replace(DROP,'').toLowerCase().replace(/\s+/g,' ').trim()}
function alnumKey(s){return key(s).replace(/[^\p{L}\p{N}_]+/gu,'')}
function isPersian(s){return /[\u0600-\u06ff]/.test(s)}
function show(s,n){n=n||90;s=s.replace(/\s+/g,' ').trim().replace(/\u200c/g,'⸱');return s.length<=n?s:s.slice(0,n-1).replace(/\s+$/,'')+'…'}
var ORD={'اول':1,'دوم':2,'سوم':3,'چهارم':4,'پنجم':5,'ششم':6,'هفتم':7,'هشتم':8,'نهم':9,'دهم':10,'یازدهم':11,'دوازدهم':12,first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10};
var LABEL='شکل|جدول|نمودار|تصویر|Figure|Fig\\.?|Table|Chart',NUM='(\\d+)(?:\\s*[-–‐./]\\s*(\\d+))?';
var CAP_RE=new RegExp('^\\s*('+LABEL+')\\s*'+NUM+'(?<tail>[\\s\\S]*)$','iu');
var MENTION=NW+'('+LABEL+')(?:[\\u200c ]?(?:ها|های))?\\s*(?<list>'+NUM+'(?:\\s*(?:،|,|و|تا|and|to)\\s*'+NUM+')*)';
var LEADER_RE=/(?:\t|\.{3,}|…|\s{3,})\s*[0-9۰-۹٠-٩]+\s*$/;
var APPENDIX_RE=/^\s*(پیوست|ضمیمه|appendix|appendices)/i;
var REF_HEAD_RE=/^(?:فصل\s+\S+\s*[:\-–]?\s*)?(?:\d+[\s.\-–)]*)?(منابع(?:\s+و\s+(?:مآخذ|مراجع))?|مراجع|فهرست\s+منابع(?:\s+و\s+مآخذ)?|کتابنامه|references?|bibliography|works\s+cited)\s*:?\s*$/i;
var STOP_RE=new RegExp('^\\s*(پیوست|ضمیمه|واژه\\s*نامه|واژه‌نامه|abstract|appendix|چکیده\\s+انگلیسی|index)'+NA,'iu');
function canon(l){l=l.trim().replace(/\.+$/,'');var c={fig:'Figure',figure:'Figure',table:'Table',chart:'Chart'}[l.toLowerCase()];return c||l}
function headingNumber(p){var t=norm(p.text).trim(),m=t.match(/^(?:فصل|chapter)\s+(\S+?)\s*[:\-–.،]?(?:\s|$)/i);
 if(m){var w=m[1].trim().toLowerCase();if(/^\d+$/.test(w))return +w;if(ORD.hasOwnProperty(w))return ORD[w]}
 m=t.match(/^(\d{1,2})\s*[.\-–:)]?\s+\S/);return m?+m[1]:null}
function chaptersOf(P){var o=[];P.forEach(function(p){if(!p.heading||!p.text.trim())return;var n=headingNumber(p);if(n!==null)o.push({para:p.idx,number:n,title:p.text.trim()})});return o}
function isListing(p){return LEADER_RE.test(p.text)}
function captionOf(p){if(p.heading||isListing(p)||!p.text.trim())return null;var t=norm(p.text),m=CAP_RE.exec(t);if(!m)return null;
 var tail=m.groups.tail,sep=/^\s*[:：]/.test(tail)||/^\s+[-–—]\s+\S/.test(tail)||/^\s*\.\s+\S/.test(tail)||/^\s*[)\]]\s*\S/.test(tail);if(!sep)return null;
 var label=canon(m[1]);return {para:p.idx,label:label,chapter:m[3]===undefined?null:+m[2],n:m[3]===undefined?+m[2]:+m[3],text:p.text.trim()}}
function mentionsIn(p){var t=norm(p.text),out=[],re=new RegExp(MENTION,'giu'),m,numre=new RegExp(NUM,'g'),to=new RegExp(NW+'(?:تا|to)'+NA,'u');
 while((m=re.exec(t))){var label=canon(m[1]),lst=m.groups.list,base=m.index+m[0].length-lst.length,items=[],mm;numre.lastIndex=0;
  while((mm=numre.exec(lst)))items.push([mm[1],mm[2],base+mm.index,base+mm.index+mm[0].length]);
  var ex=[];
  items.forEach(function(it,i){var ch=it[1]===undefined?null:+it[0],n=it[1]===undefined?+it[0]:+it[1];
   if(i>0&&to.test(lst.slice(items[i-1][3]-base,it[2]-base))){var pr=ex[ex.length-1];if(pr[0]===ch&&pr[1]<n&&n-pr[1]<=30)for(var k=pr[1]+1;k<n;k++)ex.push([ch,k,it[2],it[3]])}
   ex.push([ch,n,it[2],it[3]])});
  ex.forEach(function(x){out.push({para:p.idx,label:label,chapter:x[0],n:x[1],start:x[2],end:x[3],ls:m.index,raw:p.text.slice(m.index,x[3])})})}
 return out}
function chapterMentionsIn(p){var t=norm(p.text),out=[],m,re=new RegExp(NW+'فصل\\s+(?:\\u200c?های\\s+)?(\\d{1,2})(?![\\d.\\-–/])','gu');
 while((m=re.exec(t)))out.push([p.idx,+m[1],m.index,m.index+m[0].length]);
 var ow=Object.keys(ORD).filter(function(k){return /^[آ-ی]/.test(k)}).join('|');re=new RegExp(NW+'فصل\\s+('+ow+')'+NA,'gu');
 while((m=re.exec(t)))out.push([p.idx,ORD[m[1]],m.index,m.index+m[0].length]);return out}
function findRefList(P){var cand=P.filter(function(p){return !p.inTable&&p.text.trim().length<=40&&REF_HEAD_RE.test(key(p.text))});if(!cand.length)return {head:null,entries:[],end:0};
 var heads=cand.filter(function(p){return p.heading}),head=(heads.length?heads:cand).slice(-1)[0],entries=[],end=head.idx;
 for(var i=head.idx+1;i<P.length;i++){var p=P[i];if(p.heading&&p.text.trim())break;if(STOP_RE.test(key(p.text))&&p.text.trim().length<=40)break;end=p.idx;if(p.text.trim().length>=12)entries.push(p)}
 return {head:head.idx,entries:entries,end:end}}
function skeleton(P){var sk={chapters:chaptersOf(P),captions:[],mentions:[],chMent:[]},r=findRefList(P);sk.refHead=r.head;sk.refEntries=r.entries;sk.refEnd=r.end;
 P.forEach(function(p){if(sk.refHead!==null&&sk.refHead<=p.idx&&p.idx<=sk.refEnd)return;if(isListing(p))return;var c=captionOf(p);if(c){sk.captions.push(c);return}if(p.heading)return;
  sk.mentions=sk.mentions.concat(mentionsIn(p));sk.chMent=sk.chMent.concat(chapterMentionsIn(p))});
 var starts={};sk.chapters.forEach(function(c){starts[c.para]=c.number});var cur=null;sk.chapterAt=P.map(function(p){if(starts.hasOwnProperty(p.idx))cur=starts[p.idx];else if(p.heading&&APPENDIX_RE.test(p.text.trim()))cur=null;return cur});return sk}
/* citations */
var YEAR='(?<!\\d)(1[34]\\d\\d|19\\d\\d|20\\d\\d)(?!\\d)',YEAR_RE=new RegExp(YEAR),SUFFIX='(?:[a-z]|[آ-ی])?';
var STOPN=['سال','در','از','تا','حدود','حدودا','year','since','in','about','around','من','ساعت','مثلا','مانند','بین'];
var SEE='(?:see|cf\\.?|e\\.g\\.,?|i\\.e\\.,?|مثلاً|نک\\.?|ر\\.ک\\.?|رک\\.?|به\\s+نقل\\s+از)\\s+';
var ET_AL=/\s+(?:و\s*همکاران|et\s+al\.?|و\s+دیگران|و\s+ديگران)\s*$/i;
var SEG=new RegExp('^(?:'+SEE+')?(?<name>[^\\d;؛()\\[\\]]+?)\\s*[،,]?\\s*(?<year>'+YEAR+')'+SUFFIX+'(?:\\s*[،,:]\\s*(?:pp?\\.\\s*|ص+\\.?\\s*)?\\d+(?:\\s*[-–]\\s*\\d+)?)?\\s*$','iu');
var STOPN_RE=new RegExp('^\\s*(?:'+STOPN.join('|')+')'+NA,'iu');
function tokens(s){return key(s).split(/[^\p{L}\p{N}_]+/u).filter(function(t){return t.length>1||(t&&!/^[\x00-\x7f]+$/.test(t))}).filter(function(v,i,a){return a.indexOf(v)===i})}
function subset(a,b){return a.length>0&&a.every(function(x){return b.indexOf(x)>=0})}
function parseEntry(p,implicit){var t=p.text.trim(),n=norm(t),num=null,tb=t,nb=n,m=n.match(/^[\[(]?(\d{1,3})[\])\.]\s*/);
 if(m){num=+m[1];tb=t.slice(m[0].length);nb=n.slice(m[0].length)}else num=implicit===undefined?null:implicit;
 var ym=nb.match(new RegExp('\\(\\s*'+YEAR+SUFFIX+'\\s*\\)')),inPar=!!ym;if(!ym)ym=nb.match(YEAR_RE);
 var year=ym?+ym[1]:null,he=ym?ym.index:Math.min(tb.length,70),head=tb.slice(0,he),first=head.split(/[،,(]|\s&\s|\sand\s|\sو\s|\(/)[0],tk=tokens(first);if(!tk.length)tk=tokens(head);
 return {para:p.idx,text:t,number:num,head:head.trim(),tokens:tk,year:year,persian:isPersian(tb.slice(0,60)),cited:0}}
function firstAuthor(name){name=name.trim().replace(/^[،,;؛ ]+|[،,;؛ ]+$/g,'');var et=null,m=ET_AL.exec(name);if(m){et=m[0].indexOf('و')>=0?'fa':'en';name=name.slice(0,m.index)}
 name=name.split(/\s+(?:&|and|و)\s+|[،,]/)[0].trim();return [name,et]}
function citationsIn(p,heads){var t=norm(p.text),raw=p.text,out=[],re=/\(([^()]*)\)/g,m;
 while((m=re.exec(t))){var inner=m[1];if(!YEAR_RE.test(inner))continue;var base=m.index+1,pos=0;
  inner.split(/[;؛]/).forEach(function(seg){var s0=pos;pos+=seg.length+1;var mm=SEG.exec(seg.trim());
   if(mm){var nm=mm.groups.name;if(STOPN_RE.test(nm)||nm.split(/\s+/).filter(Boolean).length>7)return;var fe=firstAuthor(nm);if(!fe[0])return;
    out.push({para:p.idx,kind:'paren',raw:raw.slice(base+s0,base+s0+seg.length).trim(),surname:fe[0],tokens:tokens(fe[0]),year:+mm.groups.year,number:null,etAl:fe[1],start:base+s0,end:base+s0+seg.length})}});
  var ym=inner.match(new RegExp('^\\s*'+YEAR+SUFFIX+'\\s*(?:[،,:]\\s*(?:pp?\\.\\s*|ص+\\.?\\s*)?\\d+(?:\\s*[-–]\\s*\\d+)?)?\\s*$'));
  if(ym){var before=t.slice(0,m.index).replace(/\s+$/,''),mm2=before.match(/(\S+)\s+(?:و\s*همکاران|et\s+al\.?|و\s+دیگران)$/i),et=null,name;
   if(mm2){name=mm2[1];et=before.slice(mm2.index+name.length).indexOf('و')>=0?'fa':'en'}
   else{mm2=before.match(/(\S+)\s+(?:و|and|&)\s+(\S+)$/);if(mm2){name=mm2[1];if(/[\d()\[\]]/.test(name))name=mm2[2]}else{mm2=before.match(/(\S+)$/);name=mm2?mm2[1]:''}}
   name=name.replace(/^[،,;؛:.()\[\]«»"'“”]+|[،,;؛:.()\[\]«»"'“”]+$/g,'');
   if(!name||STOPN.indexOf(name.toLowerCase())>=0||/^\d+$/.test(name))continue;
   var latinCap=/^[A-Z][a-z'’\-]{2,}$/.test(name),tk=tokens(name),known=tk.length&&heads.some(function(h){return subset(tk,h)});
   if(!(latinCap||known))continue;
   out.push({para:p.idx,kind:'narr',raw:name+' ('+inner.trim()+')',surname:name,tokens:tk,year:+inner.match(YEAR_RE)[1],number:null,etAl:et,start:m.index,end:m.index+m[0].length})}}
 return out}
function numericCites(p){var t=norm(p.text),out=[],re=/\[\s*(\d{1,3}(?:\s*[-–,،]\s*\d{1,3})*)\s*\]/g,m;
 while((m=re.exec(t))){var nums=[];m[1].split(/[,،]/).forEach(function(part){var r=part.match(/^\s*(\d+)\s*[-–]\s*(\d+)\s*$/);
  if(r&&+r[2]-+r[1]>0&&+r[2]-+r[1]<=60){for(var k=+r[1];k<=+r[2];k++)nums.push(k)}else(part.match(/\d+/g)||[]).forEach(function(x){nums.push(+x)})});
  nums.forEach(function(n){out.push({para:p.idx,kind:'num',raw:m[0],surname:'',tokens:[],year:null,number:n,etAl:null,start:m.index,end:m.index+m[0].length})})}
 return out}
var META={
A001:['info','chapter headings were not recognised','Chapter-prefix checks need to know where chapters start (a line such as «# فصل دوم»).','Mark chapter titles with # (in a real .docx: Heading 1).'],
A101:['error','the same caption number is used twice','Two figures (or tables) with one number make every in-text reference ambiguous.','Renumber one of them.'],
A102:['warn','caption numbers skip or go backwards','A gap usually means a figure was deleted or moved and the numbers were typed by hand; a backwards step means one was pasted in from another chapter.','Renumber, then update every mention.'],
A103:['warn','caption chapter prefix does not match the chapter it sits in','«شکل ۲-۴» inside chapter 3 usually means the caption was copied from another chapter and not renumbered.','Fix the typed chapter part.'],
A201:['error','mention of a figure/table that has no caption','The text points at a number that does not exist in this document (typo, deleted figure, or a number from another chapter).','Correct the mention or add the missing caption.'],
A202:['warn','figure/table never mentioned in the text','Most universities expect every figure and table to be introduced in the text before it appears.','Add a sentence that mentions it, or remove the figure.'],
A203:['info','mentions use a caption label nobody uses','The text says «نمودار ۲-۱» but the captions say «شکل …» (or the reverse), so the two cannot be matched.','Use one word per kind of float in captions and in text.'],
A210:['warn','mention of a chapter that does not exist','For example «در فصل ۷» in a thesis with five chapters.','Correct the chapter number.'],
A301:['warn','no reference list found','arjaa looks for a heading such as «منابع», «مراجع», «References».','Name the list heading in one of these ways.'],
A311:['error','[n] cited but there is no entry n','The reference list is shorter than the numbers cited, or an entry was deleted.','Add the entry or fix the number.'],
A312:['warn','reference entry never cited','A listed work that the text never cites.','Cite it or remove it.'],
A313:['info','numbers are not in order of first appearance','Fine for an alphabetical list; a problem if your university asks for numbering in order of appearance.','Renumber if your style needs it.'],
A314:['error','reference numbers are not 1…n','Duplicate, skipped, or out-of-order numbers in the list.','Renumber the list.'],
A321:['error','citation without a matching reference entry','No entry has this author (and year) in the list.','Add the entry, or correct the name.'],
A322:['error','citation year differs from the reference entry','The list has this author, but with another year: usually a typo, or one of two works by the same author.','Make the year in the text and in the list agree.'],
A323:['warn','reference entry never cited','Listed in the references but not cited in the text.','Cite it or remove it.'],
A331:['warn','Latin-script entry with a Jalali-range year','A year like 1399 on an English reference is almost always a typo or a pasted Persian entry.','Check the year.'],
A332:['warn','year in the future','Citation or entry year is later than the current year (Gregorian) or Jalali year.','Check the year.'],
A333:['info','Persian-script entry with a Gregorian year','Not wrong, but mixed calendars confuse readers and in-text matching.','Be consistent: Jalali for Persian sources, Gregorian for the others.'],
A334:['info','«و همکاران» vs «et al.» used against the language of the name','Persian names take «و همکاران», Latin names «et al.».','Use the form that matches the author\'s language.'],
A341:['warn','duplicate or near-duplicate reference entries','The same work listed twice.','Keep one entry.']};
var SEV={error:0,warn:1,info:2};
function numStr(ch,n,label){var s=ch!==null?ch+'-'+n:String(n);return isPersian(label)?faDigits(s):s}
function audit(text,curYear){
 var P=text.split('\n').map(function(l,i){var h=/^#\s+/.test(l);return {idx:i,text:h?l.replace(/^#\s+/,''):l,heading:h,inTable:false}});
 var cur=curYear||new Date().getFullYear(),F={},fo=[];
 function f(c){if(!F[c]){var m=META[c];F[c]={code:c,severity:m[0],title:m[1],why:m[2],fix:m[3],count:0,paragraphs:[],examples:[]};fo.push(c)}return F[c]}
 function add(g,para,before,note){g.count++;if(para!==null&&g.paragraphs.indexOf(para+1)<0&&g.paragraphs.length<40)g.paragraphs.push(para+1);if(g.examples.length<5)g.examples.push({where:para!==null?'¶'+(para+1):'doc',before:before,note:note||''})}
 var sk=skeleton(P),byLabel=new Map();sk.captions.forEach(function(c){if(!byLabel.has(c.label))byLabel.set(c.label,[]);byLabel.get(c.label).push(c)});
 var K=function(ch,n){return (ch===null?'-':ch)+'|'+n};
 if(sk.captions.some(function(c){return c.chapter!==null})&&!sk.chapters.length){var g1=f('A001');add(g1,null,'');g1.examples=[]};
 byLabel.forEach(function(caps,label){var seen={},last={};
  caps.forEach(function(c){var k=K(c.chapter,c.n);
   if(seen[k])add(f('A101'),c.para,show(c.text),'same number as ¶'+(seen[k].para+1));
   else{seen[k]=c;var lk=c.chapter===null?'-':c.chapter,prev=last[lk]||0;
    if(c.n>prev+1){var miss=[];for(var q=prev+1;q<c.n;q++)miss.push(q);var ms=miss.slice(0,3).map(function(q2){return numStr(c.chapter,q2,label)}).join(', ')+(miss.length>3?' …':'');
     add(f('A102'),c.para,show(c.text),prev?'skips '+ms:'starts at '+c.n+', not 1 (missing '+ms+')')}
    else if(c.n<prev)add(f('A102'),c.para,show(c.text),'goes back (after '+numStr(c.chapter,prev,label)+')');
    last[lk]=Math.max(prev,c.n)}
   var cc=sk.chapterAt[c.para];if(c.chapter!==null&&cc!==null&&c.chapter!==cc)add(f('A103'),c.para,show(c.text),'sits in chapter '+cc)})});
 var table={};byLabel.forEach(function(caps,l){table[l]={};caps.forEach(function(c){table[l][K(c.chapter,c.n)]=c})});
 var mentioned={},mmap=[],orphan={};
 sk.mentions.forEach(function(m){var t=table[m.label];if(!t){(orphan[m.label]=orphan[m.label]||[]).push(m);m.status='bad';return}
  var k=K(m.chapter,m.n);if(t[k]){mentioned[m.label+'#'+k]=1;m.status='ok';m.target=t[k]}
  else{m.status='bad';var ks=Object.keys(t),hint;
   if(m.chapter===null&&ks.some(function(x){return x.indexOf('-|')!==0}))hint='captions are numbered like «۲-۳», the mention has one number';
   else if(m.chapter!==null&&ks.some(function(x){return x.indexOf('-|')===0}))hint='captions have one running number, the mention has two';
   else{var near=byLabel.get(m.label).map(function(c){return [c.chapter,c.n]}).sort(function(a,b){return (a[0]||0)-(b[0]||0)||a[1]-b[1]});
    near=near.filter(function(x,i,a){return a.findIndex(function(y){return y[0]===x[0]&&y[1]===x[1]})===i});
    hint='captions: '+near.slice(0,6).map(function(x){return numStr(x[0],x[1],m.label)}).join(', ')+(near.length>6?' …':'')}
   add(f('A201'),m.para,ctx(P[m.para].text,m.start,m.end),hint)}});
 Object.keys(orphan).forEach(function(label){var ms=orphan[label],o=Array.from(byLabel.keys()).map(function(l){return '«'+l+'»'}).join(', ')||'none';add(f('A203'),ms[0].para,ctx(P[ms[0].para].text,ms[0].start,ms[0].end),ms.length+'× «'+label+'»; captions use '+o)});
 byLabel.forEach(function(caps,label){caps.forEach(function(c){if(!mentioned[label+'#'+K(c.chapter,c.n)]){c.loose=true;add(f('A202'),c.para,show(c.text),'')}})});
 if(F.A202){var sc={};F.A202.examples=F.A202.examples.filter(function(e){if(sc[e.before])return false;sc[e.before]=1;return true})}
 if(sk.chapters.length>=2){var top=Math.max.apply(null,sk.chapters.map(function(c){return c.number}));
  sk.chMent.forEach(function(x){if(x[1]>top||x[1]<1)add(f('A210'),x[0],ctx(P[x[0]].text,x[2],x[3]),'the thesis has '+top+' chapters')})}
 var entries=[],imp=0;sk.refEntries.forEach(function(p){imp++;entries.push(parseEntry(p))});
 var explicit=entries.filter(function(e){return e.number!==null}).length,mode=!entries.length?'none':(explicit>=0.6*entries.length?'numeric':'author-year');
 var heads=entries.map(function(e){return e.tokens}),cites=[];
 P.forEach(function(p){if((sk.refHead!==null&&sk.refHead<=p.idx&&p.idx<=sk.refEnd)||p.heading)return;
  cites=cites.concat(mode==='numeric'?numericCites(p):citationsIn(p,heads))});
 var jmax=cur-621+1,gmax=cur+1;
 if(sk.refHead===null||!entries.length){var nc=cites.length||P.reduce(function(a,p){return a+(p.heading?0:numericCites(p).length)},0);
  if(nc>=3){add(f('A301'),null,nc+' citation(s) found, no list headed «منابع / مراجع / References»')}
  else{var g=f('A301');g.severity='info';add(g,null,'no reference list found; citation checks skipped')}}
 else if(mode==='numeric'){
  var have={};entries.forEach(function(e){if(e.number!==null)have[e.number]=e});var prev2=0;
  entries.forEach(function(e){if(e.number===null){add(f('A314'),e.para,show(e.text),'entry without a number');return}
   if(e.number===prev2)add(f('A314'),e.para,show(e.text),'number '+e.number+' repeated');else if(e.number!==prev2+1)add(f('A314'),e.para,show(e.text),'expected '+(prev2+1)+', found '+e.number);prev2=e.number});
  var fo2=[];cites.forEach(function(c){if(!have[c.number]){c.status='bad';add(f('A311'),c.para,c.raw,entries.length?'the list has '+entries.length+' entries':'')}else{c.status='ok';c.target=have[c.number];have[c.number].cited++;if(fo2.indexOf(c.number)<0)fo2.push(c.number)}});
  entries.forEach(function(e){if(e.cited===0&&e.number!==null){e.loose=true;add(f('A312'),e.para,show(e.text),'')}});
  if(fo2.length>=3&&fo2.some(function(v,i){return i>0&&fo2[i-1]>v})){var kk=0;for(;kk<fo2.length-1;kk++)if(fo2[kk]>fo2[kk+1])break;
   add(f('A313'),null,'first citations in order: '+fo2.slice(0,8).map(function(x){return '['+x+']'}).join(', ')+(fo2.length>8?' …':''),'['+fo2[kk+1]+'] is first cited after ['+fo2[kk]+']')}}
 else{cites.forEach(function(c){var same=entries.filter(function(e){return subset(c.tokens,e.tokens)}),exact=same.filter(function(e){return e.year===c.year});
   if(exact.length){exact.forEach(function(e){e.cited++});c.status='ok';c.target=exact[0]}
   else if(same.length){var yrs=same.map(function(e){return e.year}).filter(function(y){return y}).sort(function(a,b){return a-b}).filter(function(v,i,a){return a.indexOf(v)===i});
    add(f('A322'),c.para,show(c.raw,80),'list has '+c.surname+' with '+yrs.map(function(y){return isPersian(c.surname)?faDigits(String(y)):String(y)}).join(', '));same.forEach(function(e){e.cited++});c.status='warn';c.target=same[0]}
   else{add(f('A321'),c.para,show(c.raw,80),'');c.status='bad'}});
  entries.forEach(function(e){if(e.cited===0){e.loose=true;add(f('A323'),e.para,show(e.text),'')}})}
 entries.forEach(function(e){if(e.year===null)return;
  if(!e.persian&&e.year>=1300&&e.year<1500)add(f('A331'),e.para,show(e.text),'year '+e.year);
  if((e.year<1900&&e.year>jmax)||(e.year>=1900&&e.year>gmax))add(f('A332'),e.para,show(e.text),'year '+e.year);
  if(e.persian&&e.year>=1900)add(f('A333'),e.para,show(e.text),'year '+e.year)});
 cites.forEach(function(c){if(c.year&&((c.year<1900&&c.year>jmax)||(c.year>=1900&&c.year>gmax)))add(f('A332'),c.para,show(c.raw,80),'year '+c.year);
  if(c.etAl==='en'&&isPersian(c.surname))add(f('A334'),c.para,show(c.raw,80),'Persian name + «et al.»');
  else if(c.etAl==='fa'&&c.surname&&!isPersian(c.surname))add(f('A334'),c.para,show(c.raw,80),'Latin name + «و همکاران»')});
 var seen2={};entries.forEach(function(e){var k1=alnumKey(e.text.replace(/^[\[(]?\d{1,3}[\])\.]\s*/,'')),k2=k1.slice(0,70),hit=seen2[k2];
  if(hit&&k2.length>=25)add(f('A341'),e.para,show(e.text),'same as ¶'+(hit.para+1));else seen2[k2]=e});
 var out=fo.map(function(c){return F[c]}).filter(function(x){return x.count}).sort(function(a,b){return SEV[a.severity]-SEV[b.severity]||(a.code<b.code?-1:1)});
 return {findings:out,sk:sk,entries:entries,cites:cites,mode:mode,P:P}}
function ctx(text,a,b){var w=24;return show(text.slice(Math.max(0,a-w),a)+'⟦'+text.slice(a,b)+'⟧'+text.slice(b,b+w),120)}

/* ---- UI ---- */
if(typeof document==='undefined')return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var TAGS={mention:['A201','A203'],cite:['A311','A321','A322','A332','A334'],caption:['A101','A102','A103','A202'],entry:['A312','A314','A323','A331','A332','A341']};
function bi(en,fa){return '<span class="l-en">'+en+'</span><span class="l-fa" lang="fa">'+fa+'</span>'}
function model(A,max){
 var tagBy={},sev={};A.findings.forEach(function(f){sev[f.code]=f.severity;f.paragraphs.forEach(function(p){(tagBy[p-1]=tagBy[p-1]||[]).push(f.code)})});
 function tags(para,kind){return (tagBy[para]||[]).filter(function(c){return TAGS[kind].indexOf(c)>=0}).filter(function(v,i,a){return a.indexOf(v)===i})}
 var L=[],R=[];
 A.sk.mentions.forEach(function(m){L.push({para:m.para,start:m.start,text:m.raw,status:m.status||'ok',kind:'mention',tid:m.target?'c'+m.target.para:null,tt:m.target?m.target.text:'',tags:tags(m.para,'mention').filter(function(c){return m.status==='bad'?true:false})})});
 A.cites.forEach(function(c){L.push({para:c.para,start:c.start,text:c.raw,status:c.status||'ok',kind:'cite',tid:c.target?'e'+c.target.para:null,tt:c.target?c.target.text:'',tags:c.status==='ok'?[]:tags(c.para,'cite').filter(function(x){return x!=='A332'})})});
 L.sort(function(a,b){return a.para-b.para||a.start-b.start});
 A.sk.captions.forEach(function(c){R.push({id:'c'+c.para,para:c.para,text:c.text,status:c.loose?'warn':'ok',loose:!!c.loose,kind:'caption',tags:tags(c.para,'caption')})});
 A.entries.forEach(function(e){R.push({id:'e'+e.para,para:e.para,text:e.text,status:e.loose?'warn':'ok',loose:!!e.loose,kind:'entry',tags:tags(e.para,'entry')})});
 var hid={};R.forEach(function(r){hid[r.id]=1});
 L.forEach(function(l,i){l.id='l'+i;if(l.tid&&!hid[l.tid]){l.tid=null}});
 R.forEach(function(r){if(r.tags.length&&r.status==='ok')r.status=sev[r.tags[0]]==='error'?'bad':'warn'});
 return {L:L,R:R}}
function chips(it){return it.tags.map(function(c){return '<span class="ch mono">'+c+'</span>'}).join('')}
function liHtml(it,i){var to=it.tid?'→ '+esc(it.tt.slice(0,40)):(it.kind==='mention'||it.kind==='cite'?'✕':'');
 return '<li class="mi st-'+it.status+'" data-id="'+it.id+'" data-p="'+it.para+'" style="--i:'+i+'"><span class="pn mono">¶'+(it.para+1)+'</span><span class="tx" dir="auto">'+esc(it.text.length>70?it.text.slice(0,69)+'…':it.text)+'</span>'+chips(it)+(it.kind==='caption'||it.kind==='entry'?(it.loose?'<span class="to">'+(it.kind==='caption'?'never mentioned':'never cited')+'</span>':''):'<span class="to">'+to+'</span>')+'</li>'}
var live=[];
function renderMap(el,A,o){o=o||{};var M=model(A),max=o.max||14,L=M.L.slice(0,max),R=M.R.slice(0,max),grid=$('.mp-grid',el);
 grid.innerHTML='<ul class="mp-l">'+L.map(liHtml).join('')+(M.L.length>max?'<li class="mp-more mono">+'+(M.L.length-max)+' …</li>':'')+'</ul><svg class="mp-s" aria-hidden="true"></svg><ul class="mp-r">'+R.map(liHtml).join('')+(M.R.length>max?'<li class="mp-more mono">+'+(M.R.length-max)+' …</li>':'')+'</ul>';
 el._M={L:L,R:R};el._anim=o.anim!==false&&!RM;draw(el);
 var st=$('.stamp',el.closest('[data-stamp]')||document.createElement('i'));if(st&&o.stamp!==false)setStamp(st,A)}
function setStamp(st,A){var e=0,w=0;A.findings.forEach(function(f){if(f.severity==='error')e+=f.count;else if(f.severity==='warn')w+=f.count});
 st.className='stamp'+(e+w?'':' ok');st.style.animation='none';void st.offsetWidth;st.style.animation='';
 st.innerHTML=(e+w)?bi(e+' unresolved · '+w+' loose',faDigits(String(e))+' ناجور · '+faDigits(String(w))+' شل'):bi('every string ties','همهٔ ریسمان‌ها بسته شد')}
function draw(el){var grid=$('.mp-grid',el),svg=$('.mp-s',grid),M=el._M;if(!M)return;
 if(!svg.clientWidth||getComputedStyle(svg).display==='none'){svg.innerHTML='';return}
 var w=svg.clientWidth,h=svg.clientHeight,top=svg.getBoundingClientRect().top,out='',n=0,byId={};
 svg.setAttribute('viewBox','0 0 '+w+' '+h);svg.classList.toggle('noanim',!el._anim);
 $$('.mi',grid).forEach(function(li){byId[li.getAttribute('data-id')]=li});
 function cy(li){var r=li.getBoundingClientRect();return r.top-top+r.height/2}
 M.L.forEach(function(l){var li=byId[l.id];if(!li)return;var y=cy(li);
  if(l.tid&&byId[l.tid]){var y2=cy(byId[l.tid]);out+='<path class="d '+(l.status==='ok'?'ok':'warn')+'" data-a="'+l.id+'" data-b="'+l.tid+'" pathLength="1" style="--i:'+n+'" d="M0 '+y+' C'+w*.5+' '+y+' '+w*.5+' '+y2+' '+w+' '+y2+'"/>';n++}
  else{out+='<path class="d bad" data-a="'+l.id+'" pathLength="1" style="--i:'+n+'" d="M0 '+y+' C'+w*.18+' '+y+' '+w*.22+' '+(y+9)+' '+w*.34+' '+(y+4)+'"/><text class="bad" x="'+(w*.34+13)+'" y="'+(y+10)+'" style="--i:'+n+'">✕</text>';n++}});
 M.R.forEach(function(r){if(!r.loose)return;var li=byId[r.id];if(!li)return;var y=cy(li);out+='<path class="loose" data-b="'+r.id+'" style="--i:'+n+'" d="M'+w+' '+y+' L'+w*.62+' '+y+'"/><text class="loose" x="'+(w*.62-12)+'" y="'+(y+5)+'" style="--i:'+n+'">?</text>';n++});
 svg.innerHTML=out;startDots(el,svg,n)}
function startDots(el,svg,n){if(RM)return;var paths=$$('path.ok,path.warn',svg);el._dots=paths.map(function(p,i){var c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('r','3.6');c.style.opacity=0;svg.appendChild(c);return {p:p,c:c,len:p.getTotalLength(),o:i*.37}});
 el._t0=performance.now()+(el._anim?(n*140+1000):0);if(live.indexOf(el)<0)live.push(el);loop()}
var raf=0;
function loop(){if(raf)return;raf=requestAnimationFrame(function tick(t){raf=0;var any=false;live.forEach(function(el){if(!el._dots||!el.isConnected)return;var r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;any=true;
  el._dots.forEach(function(d){if(!d.p.isConnected){return}var k=((t-el._t0)/2600+d.o)%1;if(t<el._t0){d.c.style.opacity=0;return}var pt=d.p.getPointAtLength(d.len*k);d.c.setAttribute('cx',pt.x);d.c.setAttribute('cy',pt.y);d.c.style.opacity=Math.sin(k*Math.PI)})});
 if(live.length){raf=requestAnimationFrame(tick)}})}
function bindHover(el){var grid=$('.mp-grid',el);function clr(){$$('.hl',grid).forEach(function(x){x.classList.remove('hl')})}
 grid.addEventListener('mouseover',function(e){var li=e.target.closest&&e.target.closest('.mi');clr();if(!li)return;var id=li.getAttribute('data-id');li.classList.add('hl');
  $$('path',grid).forEach(function(p){if(p.getAttribute('data-a')===id||p.getAttribute('data-b')===id){p.classList.add('hl');[p.getAttribute('data-a'),p.getAttribute('data-b')].forEach(function(o){if(o&&o!==id){var q=grid.querySelector('[data-id="'+o+'"]');if(q)q.classList.add('hl')}})}})});
 grid.addEventListener('mouseleave',clr)}
var rzT=0;window.addEventListener('resize',function(){clearTimeout(rzT);rzT=setTimeout(function(){$$('.xmapx').forEach(function(el){el._anim=false;draw(el)})},120)});
function vis(el,fn){if(!('IntersectionObserver' in window)){fn(true);return}new IntersectionObserver(function(es){es.forEach(function(e){fn(e.isIntersecting)})},{threshold:.25}).observe(el)}
/* ---- hero ---- */
var H1=['# فصل دوم: روش','نتایج در شکل ۲-۱ و جدول ۲-۱ آمده است (Brown, 2018).','شکل ۲-۱: ساختار شبکه','جدول ۲-۱: پارامترها','# منابع','Brown, T. (2018). Clustering in practice. Data Letters, 3(4), 20–31.'].join('\n');
var H2=['# فصل دوم: روش','نتایج در شکل ۲-۱ و جدول ۲-۱ آمده و مقایسه در شکل ۲-۳ است (Brown, 2031؛ Johnson, 2017).','شکل ۲-۱: ساختار شبکه','شکل ۲-۲: نمودار خطا','جدول ۲-۱: پارامترها','# منابع','Brown, T. (2018). Clustering in practice. Data Letters, 3(4), 20–31.','Wang, L. (2019). A survey of clustering. Survey Quarterly, 7(1), 5–40.'].join('\n');
var hero=$('#hmap');
if(hero){hero.classList.add('xmapx');bindHover(hero);var hs=0,hAuto=true,hTabs=$$('.tabs button',hero.parentNode);
 var setH=function(i,anim){hs=i;hTabs.forEach(function(b,k){b.setAttribute('aria-selected',k===i?'true':'false')});renderMap(hero,audit(i?H2:H1,2026),{anim:anim,max:8})};
 hTabs.forEach(function(b,k){b.addEventListener('click',function(){hAuto=false;setH(k,true)})});
 setH(RM?1:0,true);var iv=0,visible=false;
 if(!RM)vis(hero,function(v){visible=v;if(v&&!iv)iv=setInterval(function(){if(hAuto&&visible)setH(hs?0:1,true)},5600);if(!v&&iv){clearInterval(iv);iv=0}})}
/* ---- lab ---- */
var SAMPLE=['# فصل اول: مقدمه','در این پژوهش روش خوشه‌بندی چگالی‌محور بررسی می‌شود (Brown, 2018؛ احمدی، ۱۴۰۰).','ساختار شبکه در شکل ۱-۱ آمده است.','شکل ۱-۱: ساختار شبکهٔ حسگر','# فصل دوم: روش','نتیجهٔ آزمایش در شکل ۲-۳ آمده و پارامترها در جدول ۲-۱ فهرست شده‌اند.','Johnson (2017) روش مشابهی پیشنهاد کرده و براون (Brown, 2031) آن را بهبود داد.','شکل ۲-۱: مقایسهٔ دو روش','شکل ۲-۴: نمودار خطا','جدول ۲-۱: پارامترهای آزمایش','در فصل ۷ نتایج کامل گزارش می‌شود.','# فصل سوم: نتایج','شکل ۱-۱: ساختار دوم','جدول ۲-۲: پارامترها','# منابع','Brown, T. (2018). Density clustering in practice. Data Letters, 3(4), 20–31.','Wang, L. (2019). A survey of density-based clustering. Survey Quarterly, 7(1), 5–40.','احمدی، رضا (۱۴۰۱). خوشه‌بندی داده‌ها. تهران: انتشارات نمونه.','Miller, A. (1399). Outliers. Data Letters, 3(4), 20–31.'].join('\n');
var ta=$('#lab-in');
if(ta){var lm=$('#lab-map');lm.classList.add('xmapx');bindHover(lm);var first=true,lt=0;
 var run=function(){var A=audit(ta.value);renderMap(lm,A,{anim:first,max:18,stamp:false});first=false;
  var e=0,w=0,i=0;A.findings.forEach(function(f){if(f.severity==='error')e+=f.count;else if(f.severity==='warn')w+=f.count;else i+=f.count});
  $('#lab-sum').innerHTML=(e+w+i)?'<b class="e">'+e+' error</b><b class="w">'+w+' warn</b><b class="i">'+i+' info</b>':'<b class="z">0 findings</b>';
  $('#lab-fds').innerHTML=A.findings.map(function(f,k){return '<article class="fd sev-'+f.severity+'" style="animation-delay:'+k*40+'ms"><header><b>'+f.code+'</b><span>'+esc(f.title)+'</span><i>×'+f.count+'</i></header><ul>'+f.examples.map(function(x){var ln=(x.where.match(/\d+/)||[''])[0];return '<li><button class="ex" type="button" data-line="'+ln+'"><span>'+esc(x.where)+'</span> <span class="tx">'+esc(x.before)+'</span>'+(x.note?'<em>'+esc(x.note)+'</em>':'')+'</button></li>'}).join('')+'</ul><details><summary>why / fix</summary><p>'+esc(f.why)+'</p><p>→ '+esc(f.fix)+'</p></details></article>'}).join('')};
 var go=function(){clearTimeout(lt);lt=setTimeout(run,220)};ta.addEventListener('input',go);ta.value=SAMPLE;run();
 function selLine(n){if(!n)return;var ls=ta.value.split('\n'),a=0;for(var k=0;k<n-1&&k<ls.length;k++)a+=ls[k].length+1;ta.focus();ta.setSelectionRange(a,a+(ls[n-1]||'').length);var y=ta.getBoundingClientRect();if(y.top<60||y.bottom>innerHeight)ta.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'})}
 $('#lab-fds').addEventListener('click',function(e){var b=e.target.closest('.ex');if(b)selLine(+b.getAttribute('data-line'))});
 lm.addEventListener('click',function(e){var li=e.target.closest('.mi');if(li)selLine(+li.getAttribute('data-p')+1)});
 $('#lab-sample').addEventListener('click',function(){ta.value=SAMPLE;first=true;run()});
 $('#lab-clear').addEventListener('click',function(){ta.value='';run();ta.focus()});
 $('#lab-fixone').addEventListener('click',function(){var t=ta.value.split('\n').filter(function(l){return !/^شکل ۲-۴|^شکل ۱-۱: ساختار دوم|^جدول ۲-۲|^Miller|^Johnson|^در فصل ۷/.test(l)}).join('\n').replace(/در شکل ۲-۳/,'در شکل ۲-۱').replace('Brown, 2031','Brown, 2018').replace('احمدی، ۱۴۰۰','احمدی، ۱۴۰۱');ta.value=t;first=true;run()})}
/* ---- story ---- */
var B0=['# فصل دوم: روش','نتایج در شکل ۲-۱ و شکل ۲-۲ آمده است.','پارامترها در جدول ۲-۱ فهرست شده‌اند (Brown, 2018؛ Wang, 2019).','شکل ۲-۱: ساختار شبکه','شکل ۲-۲: نمودار خطا','جدول ۲-۱: پارامترها','# منابع','Brown, T. (2018). Clustering in practice. Data Letters, 3(4), 20–31.','Wang, L. (2019). A survey of clustering. Survey Quarterly, 7(1), 5–40.'];
var ST=[B0.slice()];
var s1=B0.slice();s1.splice(4,1);ST.push(s1);
var s2=s1.slice();s2.splice(4,0,'شکل ۳-۱: مقایسهٔ دو روش');ST.push(s2);
var s3=s2.slice();s3[2]='پارامترها در جدول ۲-۱ فهرست شده‌اند (Brown, 2019؛ Wang, 2019؛ Johnson, 2017).';ST.push(s3);
var s4=s3.slice();s4[2]='پارامترها در جدول ۲-۱ فهرست شده‌اند (Brown, 2019؛ Johnson, 2017).';ST.push(s4);
var SD=['','− شکل ۲-۲: نمودار خطا','+ شکل ۳-۱: مقایسهٔ دو روش','~ (Brown, 2019؛ … Johnson, 2017)','− Wang, 2019'];
var SC=[['Jan · the first draft. Every number and every source points at something.','دی · پیش‌نویس. هر شماره و هر منبع به چیزی اشاره می‌کند.'],['Mar · the figure is cut. The sentence that mentions it stays.','اسفند · شکل حذف می‌شود. جمله‌ای که به آن اشاره می‌کند می‌ماند.'],['May · a caption is pasted in from chapter 3, still numbered 3-1.','اردیبهشت · عنوانی از فصل سوم با همان شمارهٔ ۳-۱ می‌آید.'],['Aug · a source goes into the text, the year is mistyped, the list is not touched.','مرداد · منبعی به متن می‌آید، سال اشتباه تایپ می‌شود و فهرست دست نمی‌خورد.'],['Nov · a sentence is rewritten. The reference list entry outlives it.','آبان · جمله بازنویسی می‌شود. مدخل فهرست منابع از آن بیشتر عمر می‌کند.']];
var sm=$('#smap');
if(sm){sm.classList.add('xmapx');bindHover(sm);var rg=$('#srange'),sa=true,si=-1,sv=false,sti=0;
 var setS=function(i,anim){si=i;rg.value=i;$$('.ticks span').forEach(function(t,k){t.className=k===i?'on':''});var A=audit(ST[i].join('\n'),2026);renderMap(sm,A,{anim:anim,max:10,stamp:false});
  $('#scap').innerHTML=bi(SC[i][0],SC[i][1]);$('#sdiff').textContent=SD[i]||'(no edits yet)';$('#sdiff').style.visibility=i?'visible':'hidden';
  var e=0,w=0;A.findings.forEach(function(f){if(f.severity==='error')e+=f.count;else if(f.severity==='warn')w+=f.count});
  $('#ssum').innerHTML=(e+w)?'<b class="mono" style="color:var(--bad)">'+e+' error</b><b class="mono" style="color:var(--warn)">'+w+' warn</b><span class="mono" style="color:var(--muted)">'+A.findings.map(function(f){return f.code}).join(' ')+'</span>':'<b class="mono" style="color:var(--acc)">0 findings</b>'};
 rg.addEventListener('input',function(){sa=false;setS(+rg.value,true)});setS(RM?4:0,true);
 if(!RM)vis(sm,function(v){sv=v;if(v&&!sti){sti=setInterval(function(){if(sa&&sv)setS((si+1)%5,true)},3000)}if(!v&&sti){clearInterval(sti);sti=0}})}
/* reveal */
if('IntersectionObserver' in window&&!RM){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});$$('.reveal').forEach(function(x){io.observe(x)})}else $$('.reveal').forEach(function(x){x.classList.add('in')});

})();