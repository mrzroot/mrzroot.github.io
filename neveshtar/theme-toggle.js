/*mrz-theme-toggle v2*/(function(){if(window.__mrzTheme)return;window.__mrzTheme=1;
var d=document.documentElement,K='mrz-theme',q=window.matchMedia?matchMedia('(prefers-color-scheme: dark)'):null;
function fa(){return d.getAttribute('data-lang')==='fa'||d.lang==='fa'}
function get(){var m=null;try{m=localStorage.getItem(K)}catch(e){}return m==='light'||m==='dark'?m:'system'}
function res(m){return m==='system'?(q&&q.matches?'dark':'light'):m}
var metas=[].slice.call(document.querySelectorAll('meta[name="theme-color"]'));
metas.forEach(function(x){x.setAttribute('data-c',x.getAttribute('content'));x.setAttribute('data-m',x.getAttribute('media')||'')});
function tc(t,m){metas.forEach(function(x){if(m==='system'){x.setAttribute('content',x.getAttribute('data-c'));if(x.getAttribute('data-m'))x.setAttribute('media',x.getAttribute('data-m'))}else{var s=metas.filter(function(y){return /dark/.test(y.getAttribute('data-m'))===(t==='dark')})[0]||x;x.setAttribute('content',s.getAttribute('data-c'));x.removeAttribute('media')}})}
var L={en:{system:'Theme: automatic, follows your system. Click for light',light:'Theme: light. Click for dark',dark:'Theme: dark. Click for automatic'},fa:{system:'پوسته: خودکار (مطابق سیستم). برای حالت روشن کلیک کنید',light:'پوسته: روشن. برای حالت تیره کلیک کنید',dark:'پوسته: تیره. برای حالت خودکار کلیک کنید'}};
function sync(){var m=d.getAttribute('data-theme-mode')||'system',s=L[fa()?'fa':'en'][m],t=d.getAttribute('data-theme')==='dark'?'dark':'light';
document.querySelectorAll('[data-theme-toggle]').forEach(function(x){x.setAttribute('aria-label',s);x.title=s;x.removeAttribute('aria-pressed')});
document.querySelectorAll('picture source[media*="prefers-color-scheme"]').forEach(function(x){if(!x.getAttribute('data-mq'))x.setAttribute('data-mq',x.media);var wd=/dark/.test(x.getAttribute('data-mq'));x.media=(wd===(t==='dark'))?'all':'not all'})}
function apply(m,save){var t=res(m);if(save){try{if(m==='system')localStorage.removeItem(K);else localStorage.setItem(K,m)}catch(e){}}
d.setAttribute('data-theme',t);d.setAttribute('data-theme-mode',m);d.style.colorScheme=t;tc(t,m);sync();try{document.dispatchEvent(new CustomEvent('mrz-theme',{detail:t,mode:m}))}catch(e){}}
var NX={system:'light',light:'dark',dark:'system'};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-theme-toggle]');if(!b)return;apply(NX[get()],true)});
function onq(){if(get()==='system')apply('system',false)}
if(q){if(q.addEventListener)q.addEventListener('change',onq);else if(q.addListener)q.addListener(onq)}
window.addEventListener('storage',function(e){if(e.key===K||e.key===null)apply(get(),false)});
window.addEventListener('pageshow',function(e){if(e.persisted)apply(get(),false)});
if(window.MutationObserver)new MutationObserver(sync).observe(d,{attributes:true,attributeFilter:['data-lang','lang']});
/* normalise whatever the boot script set */apply(get(),false)})();
