/* AMANAILS / approved model 2 GESTO. Buildless, no external runtime. */
(() => {
 'use strict';
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
 const mix=(a,b,p)=>a+(b-a)*p;
 const smooth=x=>{const p=clamp(x);return p*p*(3-2*p);};
 const range=(p,a,b)=>smooth((p-a)/(b-a));
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const hero=$('.hero'),stage=$('.hero-stage'),copy=$('.hero-copy'),note=$('.hero-note'),bottom=$('.hero-bottom');
 const heroCameras=$$('.hero-camera'),cameras=$$('.scene-camera'),word=$('.work-word');
 const thread=$('.gesture'),paths=$$('path',thread),threadBody=$('.gesture-body');
 const button=$('.motion-button'),progress=$('.reading-progress'),servicesLogo=$('.services-logo');
 let geometry=null,frame=0,eased=scrollY,userPaused=false,paused=media.matches,previousLine='';
 const top=el=>el.getBoundingClientRect().top+scrollY;
 function measure(){
  const detail=$('#detail'),work=$('#arbeiten'),services=$('#leistungen'),studio=$('#studio'),main=$('#journey');
  geometry={width:main.clientWidth,height:main.offsetHeight,view:innerHeight,mainTop:top(main),heroTop:top(hero),travel:Math.max(1,hero.offsetHeight-stage.offsetHeight),
   total:Math.max(1,document.documentElement.scrollHeight-innerHeight),
   detail:{top:top(detail),height:detail.offsetHeight},work:{top:top(work),height:work.offsetHeight},
   services:{top:top(services),height:services.offsetHeight},studio:{top:top(studio),height:studio.offsetHeight},
   cameras:cameras.map(el=>({el,scene:el.closest('.scene'),top:top(el.closest('.scene')),height:el.closest('.scene').offsetHeight}))};
  thread.setAttribute('viewBox','0 0 '+geometry.width+' '+geometry.height);
  previousLine='';schedule();
 }
 function lineAt(y){
  const g=geometry,w=g.width,v=g.view,h=g.height,m=g.mainTop;
  const a=clamp(y-g.heroTop,0,g.travel),d=g.detail.top-m,dh=g.detail.height;
  const q=g.work.top-m,qh=g.work.height,s=g.services.top-m,sh=g.services.height;
  const t=g.studio.top-m,th=g.studio.height;
  // A single editable vector gesture crosses all five scenes.
  return 'M '+(-.035*w)+' '+(a+.29*v)+
   ' C '+(.12*w)+' '+(a+.35*v)+', '+(.28*w)+' '+(a+.18*v)+', '+(.32*w)+' '+(a+.35*v)+
   ' S '+(.28*w)+' '+(a+.77*v)+', '+(.57*w)+' '+(a+.67*v)+
   ' Q '+(.71*w)+' '+(a+.78*v)+', '+(.78*w)+' '+(a+.69*v)+
   ' C '+(.62*w)+' '+(a+.95*v)+', '+(.14*w)+' '+(d+.05*dh)+', '+(-.03*w)+' '+(d+.13*dh)+
   ' C '+(.36*w)+' '+(d+.02*dh)+', '+(.51*w)+' '+(d+.33*dh)+', '+(.59*w)+' '+(d+.61*dh)+
   ' S '+(.81*w)+' '+(q+.13*qh)+', '+(1.035*w)+' '+(q+.17*qh)+
   ' M '+(1.035*w)+' '+(q+.17*qh)+
   ' C '+(.72*w)+' '+(q+.11*qh)+', '+(.53*w)+' '+(q+.57*qh)+', '+(.78*w)+' '+(q+.75*qh)+
   ' S '+(.95*w)+' '+(s+.19*sh)+', '+(1.035*w)+' '+(s+.25*sh)+
   ' M '+(1.035*w)+' '+(s+.25*sh)+
   ' C '+(.71*w)+' '+(s+.26*sh)+', '+(.77*w)+' '+(t+.21*th)+', '+(.51*w)+' '+(t+.43*th)+
   ' S '+(.2*w)+' '+(t+.56*th)+', '+(-.035*w)+' '+(t+.61*th);
 }
 function render(y){
  if(!geometry)return;
  const g=geometry,mobile=g.width<=760;
  progress.style.transform='scaleX('+clamp(scrollY/g.total)+')';
  const d=lineAt(paused?0:y);
  if(d!==previousLine){paths.forEach(p=>p.setAttribute('d',d));previousLine=d;}
  if(paused)return;
  const p=clamp((y-g.heroTop)/g.travel),zoom=range(p,0,1);
  const transform='translate3d('+mix(0,mobile?-3:-18,zoom)+'px,'+mix(0,-8,zoom)+'px,0) scale('+mix(1,mobile?1.065:1.11,zoom)+')';
  heroCameras.forEach(el=>el.style.transform=transform);
  copy.style.opacity=String(1-range(p,.48,.93));
  copy.style.transform='translate3d(0,'+mix(0,-42,range(p,.4,.95))+'px,0)';
  [note,bottom].forEach(el=>el.style.opacity=String(1-range(p,.08,.55)));
  const draw=clamp((y+g.view*.92)/g.height);
  paths.forEach(path=>path.style.strokeDashoffset=String(1-draw));
  for(const s of g.cameras){
   const r=s.top-y;if(r>g.view+150||r+s.height< -150)continue;
   const q=clamp((y+g.view-s.top)/(g.view+s.height));
   const original=s.scene.classList.contains('work')||s.scene.classList.contains('studio');
   s.el.style.transform='translate3d(0,'+mix(original?2:3.4,original?-2:-3.4,q)+'%,0)';
  }
  const wp=clamp((y+g.view-g.work.top)/(g.view+g.work.height));
  word.style.transform='translate3d('+mix(-1.2,1.2,wp)+'%,0,0)';
  const sp=clamp((y+g.view-g.services.top)/(g.view+g.services.height));
  servicesLogo.style.transform='rotate('+mix(3,-3,sp)+'deg)';
 }
 function tick(){
  frame=0;const target=scrollY;eased=mix(eased,target,.2);
  if(Math.abs(target-eased)<.2)eased=target;
  render(eased);if(!paused&&Math.abs(target-eased)>.2)schedule();
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(tick);}
 function motionState(){
  paused=media.matches||userPaused;
  document.documentElement.classList.toggle('motion-paused',paused);
  button.disabled=media.matches;button.setAttribute('aria-pressed',String(paused));
  const label=media.matches?'Reduzierte Bewegung in deinen Geräteeinstellungen aktiviert':paused?'Animation fortsetzen':'Animation pausieren';
  button.setAttribute('aria-label',label);button.title=label;button.firstElementChild.textContent=paused?'▷':'Ⅱ';
  if(paused){[...heroCameras,...cameras,copy,note,bottom,word,servicesLogo].forEach(el=>{el.style.transform='';el.style.opacity='';});paths.forEach(p=>p.style.strokeDashoffset='0');}
  eased=scrollY;measure();
 }
 button.addEventListener('click',()=>{userPaused=!userPaused;motionState();});
 media.addEventListener('change',motionState);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',measure,{passive:true});
 addEventListener('load',measure,{once:true});document.fonts?.ready.then(measure);
 if('ResizeObserver'in window)new ResizeObserver(measure).observe($('#journey'));
 if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12,rootMargin:'0px 0px -18px 0px'});
  $$('.reveal').forEach(el=>observer.observe(el));document.documentElement.classList.add('enhanced');
 }
 const menu=$('#mobile-menu'),toggle=$('.menu-toggle');
 function closeMenu(focus=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(focus)toggle.focus();}
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';menu.hidden=open;toggle.setAttribute('aria-expanded',String(!open));});
 $$('a,button',menu).forEach(el=>el.addEventListener('click',()=>closeMenu()));
 addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true);});
 addEventListener('resize',()=>{if(innerWidth>760)closeMenu();});
 let returnFocus=null;
 function openDialog(id,trigger){
  const dialog=document.getElementById(id);if(!dialog)return;
  const active=$('dialog[open]');if(!active||!active.contains(trigger))returnFocus=trigger||document.activeElement;
  $$('dialog[open]').forEach(d=>d.close());
  dialog.showModal();document.body.classList.add('modal-open');$('.dialog-close',dialog).focus();
 }
 $$('[data-dialog]').forEach(el=>el.addEventListener('click',()=>openDialog(el.dataset.dialog,el)));
 $$('[data-close]').forEach(el=>el.addEventListener('click',()=>el.closest('dialog').close()));
 $$('dialog').forEach(d=>{
  d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});
  d.addEventListener('close',()=>{if(!$('dialog[open]')){document.body.classList.remove('modal-open');if(returnFocus?.isConnected)returnFocus.focus();}});
 });
 const services={
  manicure:['Maniküre','Besprich deine gewünschte Form, Länge und Farbe direkt mit Amanails. Gemeinsam finden wir den Look, der zu deiner Idee passt.'],
  pedicure:['Pediküre','Ein Moment für gepflegte Füße. Frage bei Amanails nach den verfügbaren Möglichkeiten und einem passenden Termin.'],
  design:['Nageldesign','Dezent, mit Glitzer oder mit einer individuellen Idee: Zeig uns, welchen Look du dir wünschst.']
 };
 $$('[data-service]').forEach(el=>el.addEventListener('click',()=>{const service=services[el.dataset.service];$('#service-title').textContent=service[0];$('#service-description').textContent=service[1];openDialog('service-info',el);}));
 motionState();
})();

