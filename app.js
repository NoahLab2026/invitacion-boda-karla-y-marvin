const entrance=document.getElementById('entrance'),main=document.getElementById('invitation'),seal=document.getElementById('seal'),music=document.getElementById('music');let opened=false;const openingTimers=[];
function fitVisibleScreen(){const height=Math.round(window.visualViewport?.height || window.innerHeight);document.documentElement.style.setProperty('--screen-height',height+'px');}
fitVisibleScreen();window.addEventListener('resize',fitVisibleScreen);window.visualViewport?.addEventListener('resize',fitVisibleScreen);
const engagementIntro=document.getElementById('engagement-intro'),continueInvitation=document.getElementById('continue-invitation');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
if(reducedMotion.matches)document.querySelectorAll('.photo-wave animate').forEach(animation=>animation.remove());
seal.addEventListener('click',()=>{
 if(opened)return;opened=true;music.volume=.65;
 music.play().catch(()=>document.addEventListener('pointerdown',()=>music.play().catch(()=>{}),{once:true}));
 seal.disabled=true;entrance.hidden=false;entrance.classList.remove('finished');entrance.classList.add('opening');
 openingTimers.push(setTimeout(()=>{
  main.hidden=false;fitVisibleScreen();document.body.classList.remove('closed');
  window.scrollTo({top:0,behavior:'instant'});engagementIntro.classList.add('revealing');
  revealPhotoByZones();entrance.classList.add('finished');animateScroll();
 },reducedMotion.matches?0:1900));
 openingTimers.push(setTimeout(()=>{entrance.hidden=true;engagementIntro.setAttribute('tabindex','-1');engagementIntro.focus({preventScroll:true});},reducedMotion.matches?0:2900));
});
continueInvitation.addEventListener('click',()=>{
 document.getElementById('story').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});
});
const wedding=new Date('2026-12-19T16:45:00-06:00').getTime();function countdown(){let n=Math.max(0,Math.floor((wedding-Date.now())/1000));const values=[Math.floor(n/86400),Math.floor(n/3600)%24,Math.floor(n/60)%60,n%60];['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,'0'));if(n===0)document.getElementById('countdown-caption').textContent='¡Llegó nuestro gran día!';}countdown();setInterval(countdown,1000);


const letter=document.getElementById('personal-letter'),letterTrigger=document.getElementById('open-letter');
let letterOpening=false;
letterTrigger.addEventListener('click',()=>{
 if(letter.open||letterOpening)return;letterOpening=true;letterTrigger.classList.add('letter-opening');
 setTimeout(()=>{letter.showModal();letterOpening=false;},reducedMotion.matches?0:650);
});
letter.addEventListener('close',()=>letterTrigger.classList.remove('letter-opening'));
document.getElementById('close-letter').addEventListener('click',()=>letter.close());
letter.addEventListener('click',event=>{const r=letter.getBoundingClientRect();if(event.target===letter&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))letter.close();});
function applyInvitationData(data={}){
 const spaces=Number.isInteger(Number(data.spaces))&&Number(data.spaces)>0?Number(data.spaces):1;
 const label=spaces===1?'espacio':'espacios';
 const digit=document.createElement('span');digit.className='space-number';digit.textContent=spaces;
 document.getElementById('reservation-copy').replaceChildren(document.createTextNode('Estamos muy felices de poder compartir este día contigo, por ser un evento íntimo y especial hemos reservado exclusivamente '),digit,document.createTextNode(` ${label} para ti.`));
 document.getElementById('reserved-count').textContent=spaces;
 document.getElementById('reserved-label').textContent=`${label} reservado${spaces===1?'':'s'} para ti`;
 const guest=typeof data.guestName==='string'?data.guestName.trim():'';
 document.getElementById('letter-title').textContent=guest?`Para ${guest}`:'Para ti';
 const message=typeof data.message==='string'&&data.message.trim()?data.message.trim():'Hay personas que hacen nuestra historia más bonita. Tú eres una de ellas y nos encantará tenerte cerca al comenzar esta nueva etapa.';
 document.getElementById('letter-message').textContent=message;
 const confirmation=`¡Hola! ${guest?`Soy ${guest}. `:''}Confirmo mi asistencia a la boda de Karla y Marvin. Tengo ${spaces} ${label} reservado${spaces===1?'':'s'}. 🤍`;
 document.getElementById('confirm-link').href='https://wa.me/50373171809?text='+encodeURIComponent(confirmation);
}
applyInvitationData(window.invitationData);
window.addEventListener('invitation:data',event=>applyInvitationData(event.detail));


// A single continuous paper, with gentle entrances while reading.
if(!reducedMotion.matches&&'IntersectionObserver' in window){
 main.classList.add('motion-ready');
 const reveal=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target);}});},{threshold:.12});
 main.querySelectorAll('.art-panel').forEach(panel=>reveal.observe(panel));
}

// Links created by the couple's panel carry only this invitation's public copy.
try {
 const payload=new URLSearchParams(location.hash.slice(1)).get('invitacion');
 if(payload&&payload.length<=14000){
  const encoded=payload.replaceAll('-','+').replaceAll('_','/');
  const data=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(encoded),c=>c.charCodeAt(0))));
  if(Number.isInteger(data.spaces)&&data.spaces>=1&&data.spaces<=50&&typeof data.guestName==='string'&&data.guestName.length<=160&&typeof data.message==='string'&&data.message.length<=1500)applyInvitationData(data);
 }
}catch(error){console.warn('El enlace personalizado no es válido; se muestra la invitación general.');}


// The photograph fades in without redrawing pixels or blurring the people.
function revealPhotoByZones(){
 engagementIntro.classList.add('photo-settled');
}
document.getElementById('close-invitation').addEventListener('click',()=>{
 openingTimers.splice(0).forEach(clearTimeout);
 document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
 music.pause();music.currentTime=0;opened=false;seal.disabled=false;
 engagementIntro.classList.remove('revealing','photo-settled');
 main.hidden=true;entrance.hidden=false;
 entrance.classList.remove('opening','finished');document.body.classList.add('closed');
 window.scrollTo({top:0,behavior:'instant'});seal.focus({preventScroll:true});
});

// Each flower is a separate layer; movement follows natural page scrolling.
const animatedPanels=[...main.querySelectorAll('.art-panel')];
animatedPanels.forEach((panel,index)=>{
 for(const corner of panel.querySelector('.flower-corner')?[]:['top-left','bottom-right']){const flower=document.createElement('div');flower.className='flower-corner '+corner;flower.setAttribute('aria-hidden','true');panel.prepend(flower);}
 panel.querySelectorAll('h1 .name-word,h2:not(.sr-only),.cover-celebration,.closing-names,.date-number').forEach(title=>title.classList.add('scroll-title'));
 if(index>0&&index<animatedPanels.length-1){const prompt=document.createElement('button');prompt.className='section-swipe';prompt.innerHTML='Desliza <span class="swipe-arrow" aria-hidden="true">↑</span>';prompt.setAttribute('aria-label','Desliza hacia arriba o toca para continuar');prompt.onclick=()=>animatedPanels[index+1].scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});panel.append(prompt);}
});
let scrollTick=false;
function animateScroll(){
 scrollTick=false;if(reducedMotion.matches)return;
 const viewport=window.visualViewport?.height||innerHeight;
 for(const panel of animatedPanels){
  const r=panel.getBoundingClientRect();if(r.bottom<0||r.top>viewport)continue;
  const progress=Math.max(-1,Math.min(1,(viewport*.5-(r.top+r.height*.5))/viewport));
  panel.querySelectorAll('.flower-corner').forEach((flower,i)=>{const sign=i%2?-1:1;flower.style.transform=`translateY(${progress*22*sign}px) rotate(${progress*3.2*sign}deg)`;});
  const approach=Math.max(0,Math.min(1,(viewport-r.top)/(viewport*.6)));
  const scale=1+.055*Math.sin(approach*Math.PI);
  panel.querySelectorAll('.scroll-title').forEach(title=>title.style.setProperty('--title-scale',scale.toFixed(4)));
 }
}
window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(animateScroll);}},{passive:true});window.addEventListener('resize',animateScroll);
const cropDialog=document.getElementById('venue-croquis');
document.getElementById('open-croquis').addEventListener('click',()=>cropDialog.showModal());document.getElementById('close-croquis').addEventListener('click',()=>cropDialog.close());
cropDialog.addEventListener('click',event=>{if(event.target===cropDialog){const r=cropDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)cropDialog.close();}});
// Titles reveal once as they enter, leaving body copy steady and readable.
if(!reducedMotion.matches&&'IntersectionObserver' in window){
 const titles=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('title-revealed');titles.unobserve(entry.target);}
 }),{threshold:.3});
 main.querySelectorAll('.scroll-title').forEach(title=>{
  if(!engagementIntro.contains(title)){title.classList.add('title-reveal');titles.observe(title);}
 });
}
// Floating leaves and petals remain in the clear side margins.
const petalField=document.createElement('div');petalField.className='petal-field';petalField.setAttribute('aria-hidden','true');
[4,9,91,96,2,98].forEach((x,index)=>{
 const petal=document.createElement('span');petal.className='ambient-petal '+(index%2?'leaf':'petal');
 petal.style.cssText=`--petal-x:${x}%;--fall-time:${14+index*1.7}s;--fall-delay:${-index*3.1}s;--sway:${index%2?-15:15}px;--petal-turn:${index%2?-240:260}deg`;
 petalField.append(petal);
});engagementIntro.append(petalField);

