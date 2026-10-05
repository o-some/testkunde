'use strict';
const language=document.documentElement.lang;
const ui={de:{open:'Menü öffnen',close:'Menü schließen',pause:'Lauftext anhalten',resume:'Lauftext weiterlaufen lassen',selection:'Dein Einstiegsplan',level:'Level',price:'50 € pro Monat.',notice:'Deine Auswahl bleibt in deinem Browser. Sie reserviert keinen Trainingsplatz.'},en:{open:'Open menu',close:'Close menu',pause:'Stop scrolling text',resume:'Continue scrolling text',selection:'Your starting plan',level:'Level',price:'€50 per month.',notice:'Your selection stays in your browser. It does not reserve a training place.'},tr:{open:'Menüyü aç',close:'Menüyü kapat',pause:'Kayan yazıyı durdur',resume:'Kayan yazıyı sürdür',selection:'Başlangıç planın',level:'Seviye',price:'Ayda 50 €.',notice:'Seçimin tarayıcında kalır. Antrenman yeri ayırmaz.'}}[language]||null;
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
const depthTargets=[...document.querySelectorAll('.hero>img,.manifesto>img,.coach-image img,.gallery img')].filter(el=>!el.classList.contains('parallax-photo')&&!el.closest('.depth-window'));
const parallaxScenes=[...document.querySelectorAll('.parallax-scene')];
const depthCards=[...document.querySelectorAll('.depth-window')];
const counters=[...document.querySelectorAll('.stats strong')].slice(0,3);
const completedCounters=new WeakSet();
function finishMotion(){
 root.classList.remove('motion','caf-motion');
 revealTargets.forEach(el=>el.classList.add('visible'));
 depthTargets.forEach(el=>{el.style.removeProperty('--caf-depth');});
 parallaxScenes.forEach(el=>{el.style.removeProperty('--scene-depth');el.style.removeProperty('--scene-angle');});
 depthCards.forEach(el=>{el.style.removeProperty('--card-depth');el.style.removeProperty('--card-angle');});
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
 const scenes=parallaxScenes.map(el=>({el,rect:el.getBoundingClientRect()}));
 const cards=depthCards.map(el=>({el,rect:el.getBoundingClientRect()}));
 root.style.setProperty('--caf-progress',String(total>0?Math.min(scroll/total,1):0));
 records.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/height));
  el.style.setProperty('--caf-depth',`${(progress*48).toFixed(1)}px`);
 });
 scenes.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/((height+rect.height)/2)));
  const distance=innerWidth>=900?180:90;
  el.style.setProperty('--scene-depth',`${(progress*distance).toFixed(1)}px`);
  el.style.setProperty('--scene-angle',`${(progress*22).toFixed(2)}deg`);
 });
 cards.forEach(({el,rect})=>{
  if(rect.bottom<0||rect.top>height)return;
  const progress=Math.max(-1,Math.min(1,(height/2-(rect.top+rect.height/2))/((height+rect.height)/2)));
  const direction=el.dataset.depth==='kit'?-1:1;
  el.style.setProperty('--card-depth',`${(progress*(innerWidth>=900?60:30)*direction).toFixed(1)}px`);
  el.style.setProperty('--card-angle',`${(progress*3*direction).toFixed(2)}deg`);
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

// CAF: progressive enhancement; a native, keyboard-accessible focused reading mode.
const stepLabels={de:{step:'Schritt',all:'Alle Schritte',of:'von',choose:'Bewegungsschritte auswählen'},en:{step:'Step',all:'All steps',of:'of',choose:'Choose movement steps'},tr:{step:'Adım',all:'Tüm adımlar',of:'/',choose:'Hareket adımı seç'}}[language];
document.querySelectorAll('.exercise-dialog').forEach(guide=>{
 const list=guide.querySelector('.exercise-steps'),steps=[...list.children];
 steps.forEach((el,i)=>{el.style.counterReset='step '+i;});
 const tools=document.createElement('div');tools.className='step-controls';tools.setAttribute('role','group');tools.setAttribute('aria-label',stepLabels.choose);
 const status=document.createElement('p');status.className='step-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const buttons=[];
 function show(index){steps.forEach((el,i)=>el.hidden=index!==-1&&i!==index);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i-1)));status.textContent=index===-1?'':`${stepLabels.step} ${index+1} ${stepLabels.of} ${steps.length}`;}
 [-1,...steps.map((_,i)=>i)].forEach(index=>{const button=document.createElement('button');button.type='button';button.className='step-button';button.textContent=index===-1?stepLabels.all:`${stepLabels.step} ${index+1}`;button.addEventListener('click',()=>show(index));tools.append(button);buttons.push(button);});
 list.before(tools,status);show(-1);guide.addEventListener('close',()=>show(-1));
});
