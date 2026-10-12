const entrance=document.getElementById('entrance'),main=document.getElementById('invitation'),seal=document.getElementById('seal'),music=document.getElementById('music');let opened=false;
function fitVisibleScreen(){const height=Math.round(window.visualViewport?.height || window.innerHeight);document.documentElement.style.setProperty('--screen-height',height+'px');}
fitVisibleScreen();window.addEventListener('resize',fitVisibleScreen);window.visualViewport?.addEventListener('resize',fitVisibleScreen);
const engagementIntro=document.getElementById('engagement-intro'),continueInvitation=document.getElementById('continue-invitation');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
seal.addEventListener('click',()=>{
 if(opened)return;opened=true;music.volume=.65;
 music.play().catch(()=>document.addEventListener('pointerdown',()=>music.play().catch(()=>{}),{once:true}));
 seal.disabled=true;entrance.classList.add('opening');
 setTimeout(()=>{revealPhotoByZones();engagementIntro.hidden=false;engagementIntro.classList.add('revealing');},reducedMotion.matches?0:2600);
 setTimeout(()=>{entrance.classList.add('finished');continueInvitation.focus({preventScroll:true});},reducedMotion.matches?0:3100);
 setTimeout(()=>entrance.remove(),reducedMotion.matches?0:5100);
});
continueInvitation.addEventListener('click',()=>{
 continueInvitation.disabled=true;main.hidden=false;fitVisibleScreen();window.scrollTo({top:0,behavior:'instant'});
 main.classList.add('paper-emerging');engagementIntro.classList.add('leaving');
 setTimeout(()=>{engagementIntro.hidden=true;document.body.classList.remove('closed');document.getElementById('home').focus({preventScroll:true});},reducedMotion.matches?0:1800);
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


// Soft, overlapping openings reveal different areas at staggered times.
function revealPhotoByZones(){
 const photo=engagementIntro.querySelector('.engagement-frame img');
 if(reducedMotion.matches)return;
 const zones=[{x:38,y:51,delay:0},{x:73,y:66,delay:.13},{x:20,y:23,delay:.27},{x:80,y:18,delay:.4},{x:17,y:85,delay:.51},{x:83,y:87,delay:.61}];
 const duration=6500;let start;
 photo.style.maskImage=photo.style.webkitMaskImage='linear-gradient(transparent,transparent)';
 photo.style.filter='blur(9px)';
 function frame(now){
  start??=now;const t=Math.min(1,(now-start)/duration);
  if(t===1||reducedMotion.matches){photo.style.removeProperty('mask-image');photo.style.removeProperty('-webkit-mask-image');photo.style.removeProperty('filter');return;}
  const bounds=photo.getBoundingClientRect(),reach=Math.hypot(bounds.width,bounds.height)*1.45;
  const masks=zones.map(zone=>{
   const p=Math.max(0,Math.min(1,(t-zone.delay)/(1-zone.delay))),eased=p*p*(3-2*p),radius=Math.max(.01,reach*eased);
   return `radial-gradient(circle ${radius.toFixed(2)}px at ${zone.x}% ${zone.y}%,#000 0%,#000 38%,rgba(0,0,0,.65) 62%,transparent 100%)`;
  }).join(',');
  photo.style.maskImage=photo.style.webkitMaskImage=masks;
  photo.style.filter=`blur(${(9*Math.pow(1-t,2)).toFixed(2)}px)`;
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
