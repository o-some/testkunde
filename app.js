'use strict';
const language=document.documentElement.lang;
const ui={de:{open:'Menü öffnen',close:'Menü schließen',pause:'Laufband pausieren',resume:'Laufband fortsetzen',selection:'Deine Demo-Auswahl',level:'Level',price:'50 € pro Monat.',notice:'Dies ist nur eine Vorschau: Es wurde kein Platz reserviert und nichts übermittelt.'},en:{open:'Open menu',close:'Close menu',pause:'Pause scrolling text',resume:'Resume scrolling text',selection:'Your demo selection',level:'Level',price:'€50 per month.',notice:'This is only a preview: no place was reserved and no data was sent.'},tr:{open:'Menüyü aç',close:'Menüyü kapat',pause:'Kayan yazıyı duraklat',resume:'Kayan yazıyı sürdür',selection:'Demo seçimin',level:'Seviye',price:'Ayda 50 €.',notice:'Bu yalnızca önizlemedir: yer ayrılmadı ve veri gönderilmedi.'}}[language]||null;
document.querySelectorAll('.language-switch a').forEach(a=>a.addEventListener('click',()=>{if(location.hash)a.hash=location.hash;}));
document.querySelectorAll('.wisdom-toggle').forEach(button=>button.addEventListener('click',()=>{const paused=button.getAttribute('aria-pressed')!=='true';document.getElementById(button.getAttribute('aria-controls')).classList.toggle('is-paused',paused);button.setAttribute('aria-pressed',String(paused));button.textContent=paused?ui.resume:ui.pause;}));
const nav=document.querySelector('#mobile-nav'),menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?ui.open:ui.close);nav.hidden=open;});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.hidden=true;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',ui.open);}));
const dialog=document.querySelector('#booking'),form=document.querySelector('#booking-form'),result=document.querySelector('#booking-result');
document.querySelectorAll('[data-book]').forEach(button=>button.addEventListener('click',()=>{form.hidden=false;result.hidden=true;if(button.dataset.session)document.querySelector('#session').value=button.dataset.session;dialog.showModal();}));
document.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
form.addEventListener('submit',event=>{event.preventDefault();result.textContent=`${ui.selection}: ${document.querySelector('#session').value}. ${ui.level}: ${document.querySelector('#level').value}. ${ui.price} ${ui.notice}`;form.hidden=true;result.hidden=false;});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelectorAll('.session').forEach(s=>s.hidden=button.dataset.filter!=='all'&&s.dataset.type!==button.dataset.filter);}));

// CAF Module 103: native scroll, once-only reveals, bounded depth and factual counters.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const root=document.documentElement;
let motionObserver=null,motionFrame=0;
const revealTargets=[...document.querySelectorAll('.reveal')];
const depthTargets=[...document.querySelectorAll('.hero>img,.manifesto>img,.coach-image img,.gallery img')].filter(el=>!el.classList.contains('parallax-photo'));
const parallaxScenes=[...document.querySelectorAll('.parallax-scene')];
const counters=[...document.querySelectorAll('.stats strong')].slice(0,3);
const completedCounters=new WeakSet();
function finishMotion(){
 root.classList.remove('motion','caf-motion');
 revealTargets.forEach(el=>el.classList.add('visible'));
 depthTargets.forEach(el=>{el.style.removeProperty('--caf-depth');});
 parallaxScenes.forEach(el=>el.style.removeProperty('--scene-depth'));
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
 const scenes=innerWidth>=900?parallaxScenes.map(el=>({el,rect:el.getBoundingClientRect()})):[];
 root.style.setProperty('--caf-progress',String(total>0?Math.min(scroll/total,1):0));
 records.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/height));
  el.style.setProperty('--caf-depth',`${(progress*48).toFixed(1)}px`);
 });
 scenes.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/height));
  el.style.setProperty('--scene-depth',`${(progress*80).toFixed(1)}px`);
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

// Native modal guides keep card heights stable and return focus to the opener.
document.querySelectorAll('[data-exercise]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.exercise).showModal()));
document.querySelectorAll('.exercise-dialog').forEach(guide=>{guide.querySelector('.exercise-close').addEventListener('click',()=>guide.close());guide.addEventListener('click',event=>{if(event.target!==guide)return;const r=guide.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)guide.close();});});
