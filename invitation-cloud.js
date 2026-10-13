'use strict';
// Only personalized cloud links make one read; the generic invitation makes none.
(()=>{
 const code=new URLSearchParams(location.hash.slice(1)).get('invitado');
 if(!code)return;
 const API='https://boda-karla-marvin-api.josenoemejia25.workers.dev';
 const trigger=document.getElementById('confirm-link');let invitation=null,saving=false;
 const info=document.createElement('p');info.className='cloud-response';info.setAttribute('role','status');trigger.after(info);
 trigger.removeAttribute('href');trigger.removeAttribute('target');trigger.setAttribute('role','button');trigger.tabIndex=0;
 trigger.setAttribute('aria-disabled','true');info.textContent='Preparando tu reserva…';
 async function api(method,data){
  const response=await fetch(API+'/guest/'+code,{method,cache:'no-store',headers:data?{'Content-Type':'application/json'}:{},...(data?{body:JSON.stringify(data)}:{}),signal:AbortSignal.timeout(20000)});
  const result=await response.json();if(!response.ok||result.ok!==true)throw Error(result.message||'No se pudo consultar tu reserva.');return result.invitation;
 }
 function update(data){invitation=data;window.dispatchEvent(new CustomEvent('invitation:data',{detail:data}));trigger.removeAttribute('href');trigger.setAttribute('aria-disabled','false');trigger.textContent=data.status==='pending'?'Confirmar asistencia':'Actualizar mi respuesta';info.textContent=data.status==='confirmed'?`¡Gracias! Confirmaste ${data.attending} ${data.attending===1?'persona':'personas'}.`:data.status==='declined'?'Gracias por compartirnos tu respuesta.':'';}
 const dialog=document.createElement('dialog');dialog.className='cloud-rsvp-dialog';dialog.setAttribute('aria-labelledby','cloud-rsvp-title');
 dialog.innerHTML='<button type="button" class="cloud-close" aria-label="Cerrar">×</button><form><p class="cloud-eyebrow">KARLA & MARVIN</p><h2 id="cloud-rsvp-title">¿Nos acompañas?</h2><label>Tu respuesta<select name="status"><option value="confirmed">Sí, asistiré</option><option value="declined">No podré asistir</option></select></label><p class="cloud-note">Tu respuesta se guardará para los novios.</p><p class="cloud-error" role="alert"></p><button type="submit" class="elegant-button">Guardar mi respuesta</button></form>';
 document.body.append(dialog);const form=dialog.querySelector('form'),status=form.elements.status,error=dialog.querySelector('.cloud-error'),submit=form.querySelector('[type=submit]');
 const close=()=>{if(!saving)dialog.close();};dialog.querySelector('.cloud-close').onclick=close;dialog.addEventListener('cancel',e=>{if(saving)e.preventDefault();});
 function open(e){e?.preventDefault();if(!invitation)return;status.value=invitation.status==='declined'?'declined':'confirmed';dialog.querySelector('.cloud-note').textContent=`Tu respuesta corresponde a los ${invitation.spaces} ${invitation.spaces===1?'espacio reservado':'espacios reservados'} de esta invitación.`;error.textContent='';dialog.showModal();}
 trigger.onclick=open;trigger.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
 form.onsubmit=async e=>{e.preventDefault();if(saving||!invitation)return;saving=true;submit.disabled=true;status.disabled=true;error.textContent='';try{update(await api('POST',{status:status.value,attending:status.value==='confirmed'?invitation.spaces:0,version:invitation.version}));dialog.close();}catch(err){error.textContent=err.message||'No se pudo guardar. Intenta nuevamente de forma manual.';}finally{saving=false;submit.disabled=false;status.disabled=false;}};
 if(!/^[a-f0-9]{64}$/.test(code)){info.textContent='Este enlace no es válido. Solicita tu invitación a los novios.';return;}
 api('GET').then(update).catch(err=>{info.textContent=err.message||'No pudimos consultar tu reserva. Recarga la página o contacta a los novios.';});
})();

