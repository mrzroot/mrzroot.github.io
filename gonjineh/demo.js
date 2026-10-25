/* gonjineh demo: capture -> scrub -> digest -> file -> ask, in the browser, using the JS port in gj.js (parity-checked against the Python tool). */
(function(){'use strict';
var GJ=window.GJ,SEED=window.GJ_SEED;if(!GJ||!SEED||!document.getElementById('dm'))return;
var $=function(i){return document.getElementById(i)},R=document.documentElement;
var T=function(en,fa){return R.lang==='fa'?fa:en};
function samples(){
  var sk='sk_'+'live_'+'51HqXv9TnLm2PzR4aB7cD8eF', gh='gh'+'p_'+'a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8';
  return {
   en:[
    'You: Add a refund button to the order details page.',
    'You: For local testing my Stripe key is '+sk+'. Call me on 09121234567 if it breaks.',
    'AI: Added RefundButton in web/components/RefundButton.tsx. It calls the existing POST /api/orders/{id}/refund endpoint, so no new backend work is needed.',
    'I decided to disable the button after the first click instead of debouncing, because a double refund is worse than a slow UI.',
    'Careful: the endpoint takes integer cents, never floats.',
    'TODO: add the partial-refund amount picker before release.',
    '[edit] web/components/RefundButton.tsx',
    '[edit] web/pages/orders/[id].tsx',
    '[bash] curl -H "Authorization: Bearer 8f3kd9A2lQxZ7mPq41" -X POST localhost:8000/api/orders/42/refund',
    '[bash] git push https://maryam:'+gh+'@github.com/shop/app.git'
   ].join('\n'),
   fa:[
    'من: در صفحهٔ سبد خرید یک فیلد کد تخفیف اضافه کن.',
    'دستیار: فیلد کد تخفیف را در web/components/CouponField.tsx اضافه کردم و آن را به POST /api/cart/coupon وصل کردم.',
    'تصمیم گرفتم اعتبارسنجی کد را فقط در سرور انجام بدهم، چون کلاینت نباید قوانین تخفیف را بداند.',
    'دقت کن: مبلغ تخفیف باید به ریال و به‌صورت عدد صحیح ارسال شود.',
    'TODO: پیام خطای کد منقضی‌شده هنوز ترجمه نشده است.',
    '[edit] web/components/CouponField.tsx',
    '[edit] web/pages/cart.tsx'
   ].join('\n'),
   priv:[
    'You: #private Try replacing the session store with a quick experiment, this is just for me.',
    'AI: Sure, I swapped the session store for an in-memory map in server/session.py.',
    '[edit] server/session.py'
   ].join('\n')
  };
}
var S=samples(),cur='en',brain=SEED.slice(),pending=null,justFiled=null;
var ta=$('dm-text'),au=$('dm-author'),tl=$('dm-tool'),scr=$('dm-scr'),kinds=$('dm-kinds'),md=$('dm-md'),fname=$('dm-fname'),fileB=$('dm-file'),msg=$('dm-msg');
var me=$('dm-me'),q=$('dm-q'),hits=$('dm-hits'),hook=$('dm-hook'),who=$('dm-who'),whor=$('dm-whor'),cnt=$('dm-count'),cat=$('dm-cat');
var KL={'stripe-key':'Stripe key','github-token':'GitHub token','aws-key':'AWS key','bearer':'Bearer token','token':'token','password':'password','url-credentials':'URL credentials','phone':'phone number','card':'card number','private-key':'private key','jwt':'JWT','email':'email'};
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function today(){var d=new Date(),p=function(n){return(n<10?'0':'')+n};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function pk(a){var s=el('span','pk '+({maryam:'m',reza:'r',sara:'s'}[a]||'a'));s.setAttribute('aria-hidden','true');return s}

function renderScrub(){
  var rep={},text=ta.value,out=GJ.scrub(text,{report:{hit:function(k){rep[k]=(rep[k]||0)+1}}});
  scr.textContent='';
  out.split(/(\[REDACTED:[^\]]+\])/).forEach(function(p){if(!p)return;if(/^\[REDACTED:/.test(p)){var m=el('mark','rd',p);scr.appendChild(m)}else scr.appendChild(document.createTextNode(p))});
  var ks=Object.keys(rep),n=ks.reduce(function(a,k){return a+rep[k]},0);
  kinds.textContent=n?T('Masked '+n+': ','پوشانده شد '+n+': ')+ks.map(function(k){return (KL[k]||k)+(rep[k]>1?' ×'+rep[k]:'')}).join(', '):T('Nothing masked in this text.','چیزی در این متن پوشانده نشد.');
}
function renderDigest(){
  var s=GJ.parseDemo(ta.value,{tool:tl.value,sessionId:'demo-'+cur+'-'+au.value,ended:today()});
  var r=GJ.digest(s,{author:au.value,project:'shop-app'});pending=r?r.entry:null;
  fileB.disabled=!pending;
  if(!r){
    var priv=/(#private\b|gonjineh:off|#نهان)/u.test(ta.value);
    fname.textContent='(nothing written)';
    md.textContent=priv?T('Skipped on purpose: the session contains #private, so no note is created and nothing is committed.','عمداً نادیده گرفته شد: جلسه #private دارد، پس یادداشتی ساخته و چیزی کامیت نمی‌شود.')
      :T('Skipped: no user message, or nothing worth filing (no files touched and no assistant reply).','نادیده گرفته شد: پیام کاربر نیست یا چیزی ارزش بایگانی ندارد (نه فایلی تغییر کرده، نه پاسخی از دستیار).');
    return}
  fname.textContent='entries/shop-app/'+pending.area+'/'+pending.date+'-'+pending.author+'-'+pending.tool+'-'+pending.id+'.md';
  md.textContent=GJ.render(pending);
}
function renderAsk(){
  var res=GJ.search(brain,q.value,{limit:5}),h=hookContext();
  hits.textContent='';
  if(!q.value.trim()||!res.length){var li=el('li','empty',q.value.trim()?T('No note shares a word with this prompt.','هیچ یادداشتی با این پرسش واژهٔ مشترک ندارد.'):T('Type a prompt.','یک پرسش بنویسید.'));hits.appendChild(li)}
  res.forEach(function(r){
    var li=el('li'),top=el('div','ht'),mine=r.author===me.value,pass=!mine&&h.hits.some(function(x){return x.id===r.id});
    top.appendChild(el('span','sc',r.score.toFixed(2)));
    var b=el('b','t',r.title);top.appendChild(b);
    var pp=el('span','pp '+(pass?'y':'n'),pass?T('injected','افزوده شد'):mine?T('your own note','یادداشت خودتان'):T('below the gate','زیر آستانه'));top.appendChild(pp);li.appendChild(top);
    var me2=el('div','me');me2.appendChild(pk(r.author));me2.appendChild(document.createTextNode(r.author+' · '+r.tool+' · '+r.date+' · '+r.area));li.appendChild(me2);
    var m=[].concat((r.files||[]).slice(0,2),(r.endpoints||[]).slice(0,1)).join('  ');if(m)li.appendChild(el('div','mm',m));
    hits.appendChild(li)});
  hook.textContent=h.text||T('(nothing is added to the prompt)','(چیزی به پرسش افزوده نمی‌شود)');
}
function hookContext(){return GJ.hookContext(brain,q.value,me.value)}
function renderWho(){
  var r=who.value.trim()?GJ.whoKnows(brain,who.value.trim(),3):[];
  whor.textContent=r.length?r.map(function(a){return a.author+' ('+a.entries+', '+a.tools.join('/')+')'}).join(' · '):(who.value.trim()?T('nobody yet','هنوز کسی'):'');
}
function renderCat(){
  cnt.textContent=brain.length;cat.textContent='';
  brain.slice().sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0}).forEach(function(e){var li=el('li',e===justFiled?'new':'',e.date+'  '+e.author+'  '+e.area+'  '+e.title.slice(0,64));cat.appendChild(li)});
}
var t1=0;function later(f){clearTimeout(t1);t1=setTimeout(f,120)}
function all(){renderScrub();renderDigest();renderAsk();renderWho();renderCat()}
function setSample(k){cur=k;ta.value=S[k];[].forEach.call(document.querySelectorAll('[data-s]'),function(b){b.classList.toggle('on',b.getAttribute('data-s')===k)});msg.textContent='';all()}
[].forEach.call(document.querySelectorAll('[data-s]'),function(b){b.addEventListener('click',function(){setSample(b.getAttribute('data-s'))})});
[].forEach.call(document.querySelectorAll('[data-q]'),function(b){b.addEventListener('click',function(){q.value=b.getAttribute('data-q');renderAsk()})});
ta.addEventListener('input',function(){later(function(){renderScrub();renderDigest()})});
au.addEventListener('change',renderDigest);tl.addEventListener('change',renderDigest);
me.addEventListener('change',renderAsk);q.addEventListener('input',function(){later(renderAsk)});who.addEventListener('input',renderWho);
fileB.addEventListener('click',function(){
  if(!pending)return;var i=brain.findIndex(function(e){return e.id===pending.id}),was=i>=0;
  if(was)brain[i]=pending;else brain.push(pending);justFiled=pending;
  msg.textContent=T('Filed in the in-memory brain ('+brain.length+' notes). Now set "I am" to someone else and ask about it below.','در حافظهٔ درون‌مرورگری بایگانی شد ('+brain.length+' یادداشت). حالا «من» را روی نفر دیگری بگذارید و پایین دربارهٔ آن بپرسید.');
  renderAsk();renderWho();renderCat()});
document.addEventListener('mrz-lang',function(){renderScrub();renderDigest();renderAsk();renderWho();if(msg.textContent)msg.textContent='';});
window.GJ_DEMO={samples:S,brain:function(){return brain}};
setSample('en');
})();

/* keyboard access for scrollable regions */
(function(){function f(){document.querySelectorAll('#dm-scr,.tblw,.code pre,.dm pre').forEach(function(e){if(!e.hasAttribute('tabindex'))e.setAttribute('tabindex','0')})}
f();if(document.readyState!=='complete')addEventListener('load',f);addEventListener('mrz-lang',f)})();
