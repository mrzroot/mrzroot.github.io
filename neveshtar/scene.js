(function(){'use strict';
var sh=document.getElementById('sh');if(!sh)return;
var rows=[].slice.call(sh.querySelectorAll('.nr')),sum=document.getElementById('shsum');
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function count(){sum.textContent=sh.querySelectorAll('.nr.fixed').length+' / '+rows.length}
function T(ms,f){setTimeout(f,ms)}
function show(){rows.forEach(function(r){r.classList.add('lint');if(r.getAttribute('data-conf')==='high')r.classList.add('fixed')});count()}
function reset(){rows.forEach(function(r){r.classList.remove('lint','fixed')});count()}
function run(){reset();rows.forEach(function(r,i){T(600+i*1200,function(){r.classList.add('lint')});
 if(r.getAttribute('data-conf')==='high')T(1100+i*1200,function(){r.classList.add('fixed');count()})});
 T(600+rows.length*1200+3600,run)}
if(red){show();return}
var go=false;function start(){if(go)return;go=true;run()}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){start();o.disconnect()}},{threshold:.2}).observe(sh)}else start();
})();
