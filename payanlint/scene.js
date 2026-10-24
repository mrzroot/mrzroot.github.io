(function(){'use strict';
var ld=document.getElementById('ld');if(!ld)return;
var rows=[].slice.call(ld.querySelectorAll('.lr')),sum=document.getElementById('ldsum');
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var T=[];function at(ms,f){T.push(setTimeout(f,ms))}
function count(){var n=ld.querySelectorAll('.lr.fixed,.lr[data-kind=manual].lint').length;sum.textContent=n+' / '+rows.length}
function show(){rows.forEach(function(r){r.classList.add('lint');if(r.getAttribute('data-kind')!=='manual')r.classList.add('fixed')});count()}
function reset(){rows.forEach(function(r){r.classList.remove('lint','fixed')});count()}
function run(){reset();rows.forEach(function(r,i){at(700+i*1300,function(){r.classList.add('lint');count()});
  if(r.getAttribute('data-kind')!=='manual')at(1250+i*1300,function(){r.classList.add('fixed');count()})});
 at(700+rows.length*1300+3600,run)}
if(red){show();return}
var go=false;function start(){if(go)return;go=true;run()}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){start();o.disconnect()}},{threshold:.2}).observe(ld)}else start();
})();
