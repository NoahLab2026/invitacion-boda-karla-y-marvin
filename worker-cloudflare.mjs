// Bindings: DB (D1 boda-karla-marvin), PANEL_KEY (Secret, >=32 characters).
// No timers, scheduled handlers, polling or automatic retries.
const ORIGIN = 'https://noahlab2026.github.io';
const TOKEN = /^[a-f0-9]{64}$/;
const ID = /^[a-zA-Z0-9_-]{1,100}$/;
class ApiError extends Error { constructor(status,message){super(message);this.status=status;} }
function check(ok,message){if(!ok)throw new ApiError(400,message);}
function str(value,max){check(value===undefined||typeof value==='string','Texto inválido.');const s=(value||'').trim();check(s.length<=max,'Texto demasiado largo.');return s;}
function record(value){
 check(value && typeof value==='object' && !Array.isArray(value),'Invitación inválida.');
 const id=str(value.id,100),guestName=str(value.guestName,160),message=str(value.message,1500);
 check(ID.test(id),'Identificador inválido.');
 const spaces=value.spaces,status=value.status||'pending',attending=value.attending??0;
 check(Number.isInteger(spaces)&&spaces>=1&&spaces<=50,'Los espacios deben estar entre 1 y 50.');
 check(['pending','confirmed','declined'].includes(status),'Respuesta inválida.');
 check(Number.isInteger(attending)&&(status==='confirmed'?attending>=1&&attending<=spaces:attending===0),'La asistencia debe respetar los espacios reservados.');
 const phone=str(value.phone,30).replace(/[\s()+-]/g,'');check(!phone||/^\d{8,15}$/.test(phone),'WhatsApp inválido.');
 check(value.archived===undefined||typeof value.archived==='boolean','Archivo inválido.');
 return {id,guestName,message,spaces,status,attending,phone,archived:!!value.archived};
}
function map(r){return {id:r.id,code:r.code,guestName:r.guest_name,spaces:r.spaces,phone:r.phone,message:r.message,status:r.status,attending:r.attending,archived:!!r.archived,version:r.version,created:r.created_at,updated:r.updated_at};}
function guest(r){return {guestName:r.guest_name,spaces:r.spaces,message:r.message,status:r.status,attending:r.attending,version:r.version};}
function token(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');}
async function authenticated(request,secret){
 if(typeof secret!=='string'||secret.length<32)throw new ApiError(503,'Configura el secreto PANEL_KEY de al menos 32 caracteres en Cloudflare.');
 const header=request.headers.get('Authorization')||'';
 if(!header.startsWith('Bearer ')||header.length>1031)throw new ApiError(401,'Ingresa la clave del panel.');
 const hashes=await Promise.all([header.slice(7),secret].map(s=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
 // Workers supports constant-time comparison; the fallback keeps local tests portable.
 let equal;if(crypto.subtle.timingSafeEqual)equal=crypto.subtle.timingSafeEqual(...hashes);
 else {let difference=0;const a=new Uint8Array(hashes[0]),b=new Uint8Array(hashes[1]);for(let i=0;i<32;i++)difference|=a[i]^b[i];equal=difference===0;}
 if(!equal)throw new ApiError(401,'La clave no es correcta.');
}
async function body(request){
 check((request.headers.get('Content-Type')||'').startsWith('application/json'),'Envía JSON.');
 if(Number(request.headers.get('Content-Length'))>300000)throw new ApiError(413,'Archivo demasiado grande.');
 const reader=request.body?.getReader();if(!reader)throw new ApiError(400,'Faltan datos.');
 let size=0,chunks=[];for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>300000){await reader.cancel();throw new ApiError(413,'Archivo demasiado grande.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new ApiError(400,'JSON inválido.');}
}
function insert(db,r,code){return db.prepare(`INSERT INTO invitations
 (id,code,guest_name,spaces,phone,message,status,attending,archived)
 VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING *`)
 .bind(r.id,code,r.guestName,r.spaces,r.phone,r.message,r.status,r.attending,r.archived?1:0);}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Vary':'Origin'};
  if(origin===ORIGIN)headers['Access-Control-Allow-Origin']=ORIGIN;
  const send=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin && origin!==ORIGIN)return send({ok:false,message:'Origen no permitido.'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET,POST,PATCH,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type','Access-Control-Max-Age':'86400'}});
  try {
   const url=new URL(request.url),path=url.pathname;
   if(path==='/'&&request.method==='GET')return send({ok:true,message:'API de Karla y Marvin disponible',version:2});
   if(!env.DB)throw new ApiError(503,'Falta el vínculo DB.');
   if(path.startsWith('/admin/')){
    await authenticated(request,env.PANEL_KEY); // BEFORE any database read.
    if(path==='/admin/invitations'&&request.method==='GET'){
     const cursor=url.searchParams.get('after')||'';check(!cursor||ID.test(cursor),'Cursor inválido.');
     const {results}=await env.DB.prepare('SELECT * FROM invitations WHERE id > ? ORDER BY id LIMIT 251').bind(cursor).all();
     return send({ok:true,invitations:results.slice(0,250).map(map),next:results.length>250?results[249].id:null});
    }
    if(path==='/admin/invitations'&&request.method==='POST'){
     const r=record(await body(request));let saved=await insert(env.DB,r,token()).first();
     if(!saved)saved=await env.DB.prepare('SELECT * FROM invitations WHERE id=?').bind(r.id).first();
     return send({ok:true,invitation:map(saved)},201);
    }
    if(path==='/admin/import'&&request.method==='POST'){
     const data=await body(request);check(Array.isArray(data.invitations)&&data.invitations.length>=1&&data.invitations.length<=100,'Importa grupos de hasta 100 invitaciones.');
     const rows=data.invitations.map(record);check(new Set(rows.map(r=>r.id)).size===rows.length,'Hay identificadores repetidos.');
     const codes=data.invitations.map(r=>TOKEN.test(r.code||'')?r.code:token());
     const results=await env.DB.batch(rows.map((r,i)=>insert(env.DB,r,codes[i])));
     return send({ok:true,invitations:results.flatMap(r=>r.results).map(map),skipped:results.filter(r=>!r.results.length).length});
    }
    const match=path.match(/^\/admin\/invitations\/([a-zA-Z0-9_-]{1,100})$/);
    if(match&&request.method==='PATCH'){
     const data=await body(request),r=record({...data,id:match[1]});check(Number.isInteger(data.version)&&data.version>=1,'Versión inválida.');
     const saved=await env.DB.prepare(`UPDATE invitations SET guest_name=?,spaces=?,phone=?,message=?,status=?,attending=?,archived=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=? AND version=? RETURNING *`)
      .bind(r.guestName,r.spaces,r.phone,r.message,r.status,r.attending,r.archived?1:0,r.id,data.version).first();
     if(!saved)throw new ApiError(409,'La invitación cambió en otro dispositivo. Pulsa Actualizar antes de editarla.');
     return send({ok:true,invitation:map(saved)});
    }
   }
   const match=path.match(/^\/guest\/([a-f0-9]{64})$/);
   if(match&&request.method==='GET'){
    const r=await env.DB.prepare('SELECT guest_name,spaces,message,status,attending,version FROM invitations WHERE code=? AND archived=0 LIMIT 1').bind(match[1]).first();
    if(!r)throw new ApiError(404,'Esta invitación no está disponible. Contacta a los novios.');
    return send({ok:true,invitation:guest(r)});
   }
   if(match&&request.method==='POST'){
    const data=await body(request);check(['confirmed','declined'].includes(data.status),'Respuesta inválida.');
    const n=data.status==='confirmed'?data.attending:0;
    check(Number.isInteger(n)&&n>=0&&n<=50&&(data.status!=='confirmed'||n>=1),'Cantidad inválida.');
    check(Number.isInteger(data.version)&&data.version>=1,'Versión inválida.');
    const r=await env.DB.prepare(`UPDATE invitations SET status=?,attending=?,version=version+1,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE code=? AND archived=0 AND version=? AND ?<=spaces RETURNING guest_name,spaces,message,status,attending,version`)
      .bind(data.status,n,match[1],data.version,n).first();
    if(!r)throw new ApiError(409,'Tu invitación cambió o la cantidad supera tu reserva. Recarga la página antes de confirmar.');
    return send({ok:true,invitation:guest(r)});
   }
   throw new ApiError(404,'Ruta no disponible.');
  }catch(error){return send({ok:false,message:error instanceof ApiError?error.message:'No se pudo completar la operación. Intenta nuevamente de forma manual.'},error instanceof ApiError?error.status:503);}
 }
};
