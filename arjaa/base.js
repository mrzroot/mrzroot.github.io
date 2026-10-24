(function(){'use strict';
var d=document,R=d.documentElement;R.classList.add('js');
function $(s,c){return(c||d).querySelector(s)}function $$(s,c){return[].slice.call((c||d).querySelectorAll(s))}
/* language */
var LB=$('#lang-toggle'),SR=$('#lang-sr');
function setLang(l,save){R.lang=l==='fa'?'fa':'en';R.dir=l==='fa'?'rtl':'ltr';R.setAttribute('data-lang',R.lang);
 var t=R.getAttribute('data-title-'+R.lang);if(t)d.title=t;
 if(SR)SR.textContent=l==='fa'?'Switch language to English':'تغییر زبان به فارسی';
 if(save){try{localStorage.setItem('mrz-lang',R.lang)}catch(e){}}
 try{d.dispatchEvent(new CustomEvent('mrz-lang',{detail:R.lang}))}catch(e){}}
setLang(R.lang,false);
if(LB)LB.addEventListener('click',function(){setLang(R.lang==='fa'?'en':'fa',true)});
/* menu */
var MB=$('#menu-btn'),NV=$('#nav');
if(MB&&NV){MB.addEventListener('click',function(){var o=NV.classList.toggle('open');MB.setAttribute('aria-expanded',o)});
 $$('a',NV).forEach(function(a){a.addEventListener('click',function(){NV.classList.remove('open');MB.setAttribute('aria-expanded','false')})})}
/* copy */
$$('.code .cp').forEach(function(b){b.addEventListener('click',function(){var t=$('pre',b.parentNode).innerText.replace(/\n$/,'');
 function ok(){b.classList.add('done');setTimeout(function(){b.classList.remove('done')},1400)}
 if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(ok,function(){});else{var a=d.createElement('textarea');a.value=t;d.body.appendChild(a);a.select();try{d.execCommand('copy');ok()}catch(e){}a.remove()}})});
/* reveal */
var rv=$$('main section .sec-body > *, .hero .stage');
rv.forEach(function(e){e.classList.add('rv')});
if('IntersectionObserver' in window&&!(matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)){
 var io=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{rootMargin:'0px 0px -5% 0px'});rv.forEach(function(e){io.observe(e)});
 setTimeout(function(){rv.forEach(function(e){e.classList.add('in')})},4500)}
else rv.forEach(function(e){e.classList.add('in')});
/* nav highlight */
var secs=$$('main section[id]'),links=$$('.nav a');
if('IntersectionObserver' in window){var so=new IntersectionObserver(function(es){es.forEach(function(x){if(x.isIntersecting){links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+x.target.id)})}})},{rootMargin:'-40% 0px -55% 0px'});secs.forEach(function(s){so.observe(s)})}
})();
