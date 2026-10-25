/* gonjineh hero: Reza's session is scrubbed, filed in the backend drawer; Maryam's prompt pulls the card back out. */
(function(){'use strict';
var cab=document.getElementById('cab');if(!cab)return;
var $=function(i){return document.getElementById(i)};
var cbn=$('cbn'),drb=$('drb'),rslot=$('rslot'),mctx=$('mctx');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function finalState(){cab.classList.remove('anim','fade');for(var i=1;i<=9;i++)cab.classList.add('s'+i);cbn.textContent='8';drb.classList.add('open')}
if(reduce||!cab.animate){finalState();return}
var visible=true,hidden=document.hidden,run=0,waiters=[];
function canGo(){return visible&&!document.hidden}
function wake(){if(canGo()){var w=waiters;waiters=[];w.forEach(function(f){f()})}}
document.addEventListener('visibilitychange',wake);
if('IntersectionObserver' in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;wake()},{threshold:.15}).observe(cab)}
/* simpler, robust: poll every 100ms and only count time while visible */
function wait(ms,tok){return new Promise(function(res){var left=ms;(function step(){if(tok!==run)return res(false);if(left<=0)return res(true);setTimeout(function(){if(canGo())left-=100;step()},100)})()})}
function rel(el){var a=cab.getBoundingClientRect(),b=el.getBoundingClientRect();return{x:b.left-a.left,y:b.top-a.top,w:b.width,h:b.height}}
function clone(el){var c=el.cloneNode(true);c.removeAttribute('id');c.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id')});c.classList.add('fly');c.style.opacity='1';c.style.transform='none';return c}
function fly(from,to,back,tok){return new Promise(function(res){
  var a=rel(from),b=rel(to),c=clone(back?to:from);
  var big=back?b:a,small=back?a:b;
  c.style.left=big.x+'px';c.style.top=big.y+'px';c.style.width=big.w+'px';
  cab.appendChild(c);
  var sx=.28,dx=(small.x+small.w/2)-(big.x+big.w/2),dy=(small.y+small.h/2)-(big.y+big.h/2);
  var big0={transform:'translate(0,0) scale(1)',opacity:1},sm={transform:'translate('+dx+'px,'+dy+'px) scale('+sx+')',opacity:.0};
  var an=c.animate(back?[sm,big0]:[big0,sm],{duration:950,easing:'cubic-bezier(.5,0,.25,1)',fill:'forwards'});
  an.onfinish=function(){c.remove();res()};an.oncancel=function(){c.remove();res()};
  setTimeout(function(){if(c.parentNode){c.remove();res()}},1400)})}
function reset(){for(var i=1;i<=9;i++)cab.classList.remove('s'+i);cab.classList.remove('fade');drb.classList.remove('open');cbn.textContent='7';cab.querySelectorAll('.fly').forEach(function(n){n.remove()})}
async function loop(){
  var tok=++run;cab.classList.add('anim');
  while(tok===run){
    reset();cab.offsetWidth;
    var steps=[[500,1],[1300,2],[1500,3],[1500,4],[1000,5]];
    for(var k=0;k<steps.length;k++){if(!await wait(steps[k][0],tok))return;cab.classList.add('s'+steps[k][1])}
    if(!await wait(1200,tok))return;
    cab.classList.add('s6');drb.classList.add('open');
    await fly(rslot,drb,false,tok);if(tok!==run)return;cbn.textContent='8';
    if(!await wait(900,tok))return;drb.classList.remove('open');
    if(!await wait(500,tok))return;cab.classList.add('s7');
    if(!await wait(1700,tok))return;
    drb.classList.add('open');
    cab.classList.add('s8');mctx.style.opacity='0';
    await fly(drb,mctx,true,tok);if(tok!==run)return;mctx.style.opacity='';
    if(!await wait(500,tok))return;drb.classList.remove('open');cab.classList.add('s9');
    if(!await wait(5200,tok))return;
    cab.classList.add('fade');
    if(!await wait(900,tok))return;
  }}
loop();
})();
