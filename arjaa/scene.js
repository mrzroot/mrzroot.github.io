(function(){'use strict';
var xm=document.getElementById('xm');if(!xm)return;
var svg=document.getElementById('xs'),sum=document.getElementById('xsum'),NS='http://www.w3.org/2000/svg';
var red=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var T=[];function at(ms,f){T.push(setTimeout(f,ms))}
var L=[].slice.call(xm.querySelectorAll('.xl .xi')),R={};
[].slice.call(xm.querySelectorAll('.xr .xi')).forEach(function(r){R[r.getAttribute('data-l').split(':')[0]]=r});
var paths=[];
function y(el,box){var b=el.getBoundingClientRect();return b.top+b.height/2-box.top}
function build(){
 svg.innerHTML='';paths=[];
 var box=svg.getBoundingClientRect(),w=box.width,h=box.height;
 svg.setAttribute('viewBox','0 0 '+w+' '+h);
 function mk(d,cls,cap){var p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('class','xp '+cls);svg.appendChild(p);
  var len=p.getTotalLength();p.style.strokeDasharray=cls.indexOf('bad')>-1||cls.indexOf('stub')>-1?'5 5':len;p.style.setProperty('--len',len);return p}
 L.forEach(function(li,i){
  var s=li.getAttribute('data-l').split(':'),id=s[0],kind=s[1],y1=y(li,box),p;
  if(kind==='bad'){p=mk('M0 '+y1+' C '+w*.3+' '+y1+' '+w*.4+' '+y1+' '+w*.52+' '+y1,'bad');
    var x=document.createElementNS(NS,'path');x.setAttribute('d','M'+(w*.52+4)+' '+(y1-6)+'l12 12m0-12l-12 12');x.setAttribute('class','xp bad xx');svg.appendChild(x);paths.push({li:li,p:p,x:x});return}
  var r=R[id];if(!r)return;var y2=y(r,box);
  p=mk('M0 '+y1+' C '+w*.5+' '+y1+' '+w*.5+' '+y2+' '+w+' '+y2,kind);paths.push({li:li,p:p,r:r})});
 ['f','g'].forEach(function(k){paths.push({r:R[k],p:null})});
 reset()}
function reset(){xm.classList.remove('done');L.forEach(function(l){l.classList.remove('on')});Object.keys(R).forEach(function(k){R[k].classList.remove('on')});
 paths.forEach(function(o){if(o.p)o.p.classList.remove('on');if(o.x)o.x.classList.remove('on')});count()}
function count(){var n=xm.querySelectorAll('.xi.on .xc').length;if(sum)sum.textContent=n+' / 5'}
function show(){paths.forEach(function(o){if(o.p)o.p.classList.add('on');if(o.x)o.x.classList.add('on');if(o.li)o.li.classList.add('on');if(o.r)o.r.classList.add('on')});xm.classList.add('done');
 if(sum)sum.textContent='5 / 5'}
function run(){T.forEach(clearTimeout);T=[];reset();
 paths.forEach(function(o,i){at(500+i*750,function(){if(o.p)o.p.classList.add('on');if(o.x)o.x.classList.add('on');if(o.li)o.li.classList.add('on');if(o.r)o.r.classList.add('on');
   count()})});
 at(500+paths.length*750+3800,run)}
var go=false;function start(){if(go)return;go=true;build();red?show():run()}
var rt;window.addEventListener('resize',function(){if(!go)return;clearTimeout(rt);rt=setTimeout(function(){build();show()},200)});
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){if(go){build();red?show():run()}})}
if('IntersectionObserver' in window){new IntersectionObserver(function(es,o){if(es[0].isIntersecting){start();o.disconnect()}},{threshold:.2}).observe(xm)}else start();
})();
