'use strict';
const nav=document.querySelector('#mobile-nav'),menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'Menü öffnen':'Menü schließen');nav.hidden=open;});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Menü öffnen');}));
const dialog=document.querySelector('#booking'),form=document.querySelector('#booking-form'),result=document.querySelector('#booking-result');
document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>{form.hidden=false;result.hidden=true;if(button.dataset.session)document.querySelector('#session').value=button.dataset.session;dialog.showModal();}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
form.addEventListener('submit',event=>{event.preventDefault();result.textContent=`Deine Demo-Auswahl: ${document.querySelector('#session').value}. Level: ${document.querySelector('#level').value}. 50 € pro Monat. Dies ist nur eine Vorschau: Es wurde kein Platz reserviert und nichts übermittelt.`;form.hidden=true;result.hidden=false;});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelectorAll('.session').forEach(s=>s.hidden=button.dataset.filter!=='all'&&s.dataset.type!==button.dataset.filter);}));

// CAF Module 103: native scroll, once-only reveals, bounded depth and factual counters.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const root=document.documentElement;
let motionObserver=null,motionFrame=0;
const revealTargets=[...document.querySelectorAll('.reveal')];
const depthTargets=[...document.querySelectorAll('.hero>img,.manifesto>img,.coach-image img,.gallery img')];
const counters=[...document.querySelectorAll('.stats strong')].slice(0,3);
const completedCounters=new WeakSet();
function finishMotion(){
 root.classList.remove('motion','caf-motion');
 revealTargets.forEach(el=>el.classList.add('visible'));
 depthTargets.forEach(el=>{el.style.removeProperty('--caf-depth');});
 if(motionObserver)motionObserver.disconnect();
 cancelAnimationFrame(motionFrame);motionFrame=0;
}
function countFact(el){
 if(completedCounters.has(el)||motionPreference.matches)return;
 completedCounters.add(el);
 const final=el.textContent,number=parseInt(final,10),suffix=final.replace(/^\d+/,'');
 const start=performance.now();
 el.setAttribute('aria-label',final);el.setAttribute('aria-live','off');
 function frame(now){
  if(motionPreference.matches){el.textContent=final;return;}
  const p=Math.min((now-start)/1100,1),eased=1-Math.pow(1-p,3);
  el.textContent=Math.round(number*eased)+suffix;
  if(p<1)requestAnimationFrame(frame);else el.textContent=final;
 }
 requestAnimationFrame(frame);
}
function paintScroll(){
 motionFrame=0;
 if(motionPreference.matches||document.hidden)return;
 const height=innerHeight,scroll=scrollY,total=root.scrollHeight-height;
 const records=innerWidth>=900?depthTargets.map(el=>({el,rect:el.parentElement.getBoundingClientRect()})):[];
 root.style.setProperty('--caf-progress',String(total>0?Math.min(scroll/total,1):0));
 records.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/height));
  el.style.setProperty('--caf-depth',`${(progress*48).toFixed(1)}px`);
 });
 document.querySelector('header').classList.toggle('scrolled',scroll>80);
}
function queueScroll(){if(!motionFrame&&!motionPreference.matches)motionFrame=requestAnimationFrame(paintScroll);}
function startMotion(){
 if(motionPreference.matches||!('IntersectionObserver' in window)){finishMotion();return;}
 root.classList.add('motion','caf-motion');
 revealTargets.forEach(el=>{
  // Never hide a section already passed when motion starts or changes.
  if(el.getBoundingClientRect().bottom<=0)el.classList.add('visible');
 });
 motionObserver=new IntersectionObserver(entries=>{
  entries.forEach(({isIntersecting,target})=>{
   if(!isIntersecting)return;
   target.classList.add('visible');
   motionObserver.unobserve(target);
  });
 },{threshold:0.12,rootMargin:'0px 0px -30px 0px'});
 revealTargets.filter(el=>!el.classList.contains('visible')).forEach(el=>motionObserver.observe(el));
 const countObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){countFact(e.target);countObserver.unobserve(e.target);}}),{threshold:.5});
 counters.forEach(el=>countObserver.observe(el));
 queueScroll();
}
addEventListener('scroll',queueScroll,{passive:true});
addEventListener('resize',queueScroll,{passive:true});
document.addEventListener('visibilitychange',queueScroll);
motionPreference.addEventListener('change',()=>{finishMotion();if(!motionPreference.matches)startMotion();});
startMotion();

// Static-first goal selector: all panels remain available when JavaScript is off.
const goalButtons=[...document.querySelectorAll('[data-goal]')];
const goalPanels=[...document.querySelectorAll('[data-goal-panel]')];
function selectGoal(key){goalButtons.forEach(b=>{const active=b.dataset.goal===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});goalPanels.forEach(p=>p.hidden=p.dataset.goalPanel!==key);}
goalButtons.forEach(b=>b.addEventListener('click',()=>selectGoal(b.dataset.goal)));
if(goalPanels.length)selectGoal('basis');
