(function(){'use strict';
var fc=document.getElementById('fc');if(!fc)return;
var line=document.getElementById('fline'),btn=document.getElementById('fbtn');
var gl={};[].forEach.call(line.children,function(e){gl[e.getAttribute('data-k')]=e});
var ORD={a:{3:0,m:1,2:2,w:3},b:{2:0,m:1,3:2,w:3}};
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function apply(s,animate){
 var first={};if(animate&&!red)for(var k in gl)first[k]=gl[k].getBoundingClientRect().left;
 for(var k in gl)gl[k].style.order=ORD[s][k];
 fc.setAttribute('data-state',s);
 if(animate&&!red)for(var k in gl){var dx=first[k]-gl[k].getBoundingClientRect().left;if(Math.abs(dx)>1)gl[k].animate([{transform:'translateX('+dx+'px)'},{transform:'none'}],{duration:620,easing:'cubic-bezier(.6,.05,.2,1)'})}
}
apply('a',false);
var s='a',timer=null,user=false;
function flip(){s=s==='a'?'b':'a';apply(s,true)}
function start(){if(red||user||timer)return;timer=setInterval(flip,3600)}
function stop(){clearInterval(timer);timer=null}
btn.addEventListener('click',function(){user=true;stop();flip()});
fc.addEventListener('mouseenter',stop);fc.addEventListener('mouseleave',start);
document.addEventListener('visibilitychange',function(){document.hidden?stop():start()});
setTimeout(start,1800);
var cmp=document.getElementById('cmp');
if(cmp){var r=cmp.querySelector('input');r.addEventListener('input',function(){cmp.style.setProperty('--p',r.value+'%')});
 if('IntersectionObserver' in window&&!red){var done=false,io=new IntersectionObserver(function(es){if(es[0].isIntersecting&&!done){done=true;var t0=null;(function step(t){if(!t0)t0=t;var k=Math.min((t-t0)/900,1),v=50+Math.sin(k*Math.PI*2)*18*(1-k);r.value=v;cmp.style.setProperty('--p',v+'%');if(k<1)requestAnimationFrame(step)})(performance.now())}},{threshold:.6});io.observe(cmp)}}
})();
