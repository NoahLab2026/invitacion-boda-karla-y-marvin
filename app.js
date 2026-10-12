const entrance=document.getElementById('entrance'),main=document.getElementById('invitation'),seal=document.getElementById('seal'),music=document.getElementById('music');let opened=false;
function fitVisibleScreen(){const height=Math.round(window.visualViewport?.height || window.innerHeight);document.documentElement.style.setProperty('--screen-height',height+'px');}
fitVisibleScreen();window.addEventListener('resize',fitVisibleScreen);window.visualViewport?.addEventListener('resize',fitVisibleScreen);
const engagementIntro=document.getElementById('engagement-intro'),continueInvitation=document.getElementById('continue-invitation');
seal.addEventListener('click',()=>{if(opened)return;opened=true;music.volume=.65;music.play().catch(()=>{document.addEventListener('pointerdown',()=>music.play().catch(()=>{}),{once:true});});seal.disabled=true;entrance.classList.add('opening');engagementIntro.hidden=false;engagementIntro.classList.add('revealing');setTimeout(()=>{entrance.classList.add('finished');continueInvitation.focus({preventScroll:true});},1700);setTimeout(()=>entrance.remove(),3500);});
continueInvitation.addEventListener('click',()=>{continueInvitation.disabled=true;main.hidden=false;fitVisibleScreen();main.scrollTo({top:0,behavior:'instant'});engagementIntro.classList.add('leaving');setTimeout(()=>{engagementIntro.hidden=true;document.body.classList.remove('closed');document.querySelector('#home a').focus({preventScroll:true});},1800);});
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

// One deliberate, slower transition per gesture, with no skipped sheets.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let sheetMoving=false,wheelDistance=0,wheelReset,touchOrigin=null;
function moveToSheet(index){
 if(sheetMoving||main.hidden||letter.open)return;
 const sheets=[...main.children],last=sheets.length-1;
 index=Math.max(0,Math.min(last,index));
 const start=main.scrollTop,target=sheets[index].offsetTop;
 if(Math.abs(target-start)<1)return;
 sheetMoving=true;main.style.scrollSnapType='none';
 const duration=reducedMotion.matches?0:1500,startTime=performance.now();
 function frame(now){
  const progress=duration?Math.min(1,(now-startTime)/duration):1;
  const eased=progress<.5?4*progress**3:1-(-2*progress+2)**3/2;
  main.scrollTop=start+(target-start)*eased;
  if(progress<1)requestAnimationFrame(frame);
  else{main.scrollTop=target;main.style.scrollSnapType='';setTimeout(()=>sheetMoving=false,180);}
 }
 requestAnimationFrame(frame);
}
function stepSheet(direction){moveToSheet(Math.round(main.scrollTop/main.clientHeight)+direction);}
main.addEventListener('wheel',event=>{
 if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
 event.preventDefault();if(sheetMoving)return;
 wheelDistance+=event.deltaY*(event.deltaMode===1?16:1);
 clearTimeout(wheelReset);wheelReset=setTimeout(()=>wheelDistance=0,160);
 if(Math.abs(wheelDistance)>35){const direction=Math.sign(wheelDistance);wheelDistance=0;stepSheet(direction);}
},{passive:false});
main.addEventListener('touchstart',event=>{touchOrigin=event.touches.length===1?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
main.addEventListener('touchend',event=>{
 if(!touchOrigin||event.touches.length){touchOrigin=null;return;}
 const end=event.changedTouches[0],dy=touchOrigin.y-end.clientY,dx=touchOrigin.x-end.clientX;touchOrigin=null;
 if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(dx)){event.preventDefault();stepSheet(Math.sign(dy));}
},{passive:false});
main.addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select'))return;
 if(event.key==='PageDown'||event.key==='ArrowDown'){event.preventDefault();stepSheet(1);}
 if(event.key==='PageUp'||event.key==='ArrowUp'){event.preventDefault();stepSheet(-1);}
});
main.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const destination=document.querySelector(link.getAttribute('href'));
 if(!destination)return;
 event.preventDefault();const sheet=destination.closest('.invitation-sheet,.opening-sheet');
 moveToSheet([...main.children].indexOf(sheet));
}));
