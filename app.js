const entrance=document.getElementById('entrance'),main=document.getElementById('invitation'),seal=document.getElementById('seal'),music=document.getElementById('music');let opened=false;
function fitVisibleScreen(){const height=Math.round(window.visualViewport?.height || window.innerHeight);document.documentElement.style.setProperty('--screen-height',height+'px');}
fitVisibleScreen();window.addEventListener('resize',fitVisibleScreen);window.visualViewport?.addEventListener('resize',fitVisibleScreen);
const engagementIntro=document.getElementById('engagement-intro'),continueInvitation=document.getElementById('continue-invitation');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
seal.addEventListener('click',()=>{
 if(opened)return;opened=true;music.volume=.65;
 music.play().catch(()=>document.addEventListener('pointerdown',()=>music.play().catch(()=>{}),{once:true}));
 seal.disabled=true;entrance.classList.add('opening');
 setTimeout(()=>{engagementIntro.hidden=false;engagementIntro.classList.add('revealing');},reducedMotion.matches?0:2600);
 setTimeout(()=>{entrance.classList.add('finished');continueInvitation.focus({preventScroll:true});},reducedMotion.matches?0:3100);
 setTimeout(()=>entrance.remove(),reducedMotion.matches?0:5100);
});
continueInvitation.addEventListener('click',()=>{
 continueInvitation.disabled=true;main.hidden=false;fitVisibleScreen();window.scrollTo({top:0,behavior:'instant'});
 main.classList.add('paper-emerging');engagementIntro.classList.add('leaving');
 setTimeout(()=>{engagementIntro.hidden=true;document.body.classList.remove('closed');document.querySelector('#home a').focus({preventScroll:true});},reducedMotion.matches?0:1800);
});
const wedding=new Date('2026-12-19T16:45:00-06:00').getTime();function countdown(){let n=Math.max(0,Math.floor((wedding-Date.now())/1000));const values=[Math.floor(n/86400),Math.floor(n/3600)%24,Math.floor(n/60)%60,n%60];['days','hours','minutes','seconds'].forEach((id,i)=>document.getElementById(id).textContent=String(values[i]).padStart(2,'0'));if(n===0)document.getElementById('countdown-caption').textContent='¡Llegó nuestro gran día!';}countdown();setInterval(countdown,1000);


const letter=document.getElementById('personal-letter'),letterTrigger=document.getElementById('open-letter');
letterTrigger.addEventListener('click',()=>{if(!letter.open)letter.showModal();});
document.getElementById('close-letter').addEventListener('click',()=>letter.close());
letter.addEventListener('click',event=>{const r=letter.getBoundingClientRect();if(event.target===letter&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))letter.close();});
function applyInvitationData(data={}){
 const spaces=Number.isInteger(Number(data.spaces))&&Number(data.spaces)>0?Number(data.spaces):1;
 const label=spaces===1?'espacio':'espacios';
 document.getElementById('reservation-copy').textContent=`Estamos muy felices de poder compartir este día contigo, por ser un evento íntimo y especial hemos reservado exclusivamente ${spaces} ${label} para ti.`;
 document.getElementById('reserved-count').textContent=spaces;
 document.getElementById('reserved-label').textContent=`${label} para ti`;
 const guest=typeof data.guestName==='string'?data.guestName.trim():'';
 document.getElementById('letter-title').textContent=guest?`Para ${guest}`:'Un mensaje para ti';
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
