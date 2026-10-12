'use strict';
const {createService,AccessError}=require('../server/saints/service');
const {createProviders,need}=require('../server/saints/providers');
const crypto=require('node:crypto');
async function rawBody(req){if(Buffer.isBuffer(req.body)||typeof req.body==='string'){const b=Buffer.from(req.body);if(b.length>262144)throw new AccessError(413,'Request too large.');return b;}if(req.body&&typeof req.body==='object')throw new AccessError(400,'Raw request body required.');const chunks=[];let size=0;for await(const c of req){const b=Buffer.from(c);size+=b.length;if(size>262144)throw new AccessError(413,'Request too large.');chunks.push(b);}return Buffer.concat(chunks);}
function createHandler(env=process.env,providerFactory=createProviders){return async(req,res)=>{
 res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','Authorization');res.setHeader('X-Content-Type-Options','nosniff');const requestId=crypto.randomUUID();res.setHeader('X-Request-Id',requestId);
 try{
  const action=new URL(req.url,'https://vnmsfx.com').searchParams.get('action')||'config';
  const methods={config:'GET',library:'GET',playback:'POST',checkout:'POST',portal:'POST',progress:'POST',webhook:'POST'};
  if(!methods[action])throw new AccessError(404,'Not found.');
  if(req.method!==methods[action]){res.setHeader('Allow',methods[action]);throw new AccessError(405,'Method not allowed.');}
  const origin=env.SITE_ORIGIN||'https://vnmsfx.com';
  if(action!=='webhook'&&req.method==='POST'&&req.headers.origin!==origin)throw new AccessError(403,'Invalid request origin.');
  if(action==='config')return res.status(200).json({playbackReady:!!(env.MUX_SAINTS_01_PLAYBACK_ID&&env.MUX_SIGNING_KEY_ID&&env.MUX_SIGNING_PRIVATE_KEY_BASE64),authReady:!!(env.SUPABASE_URL&&env.SUPABASE_ANON_KEY),supabaseUrl:env.SUPABASE_URL||null,supabaseKey:env.SUPABASE_ANON_KEY||null,salesEnabled:env.SAINTS_SALES_ENABLED==='true',preordersEnabled:env.SAINTS_SALES_ENABLED==='true'&&env.SAINTS_PREORDERS_ENABLED==='true',siteOrigin:origin});
  const p=providerFactory(env),service=createService({...p,env:{...env,SITE_ORIGIN:origin}});
  if(action==='webhook'){
   const raw=await rawBody(req);let event;try{event=p.stripe.webhooks.constructEvent(raw,req.headers['stripe-signature'],need(env,'STRIPE_WEBHOOK_SECRET'));}catch(e){if(e instanceof AccessError)throw e;throw new AccessError(400,'Invalid webhook signature.');}
   if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))await service.fulfill(event.data.object.id);
   return res.status(200).json({received:true});
  }
  const user=await p.user(req,action==='playback');let body={};if(req.method==='POST'){const raw=await rawBody(req);try{body=JSON.parse(raw.toString()||'{}');}catch{throw new AccessError(400,'Invalid JSON.');}if(!body||Array.isArray(body)||typeof body!=='object')throw new AccessError(400,'Invalid request.');}
  let result;
  if(action==='library')result=await service.library(user);
  if(action==='playback')result=await service.playback(user,body.episode);
  if(action==='checkout'){if(!/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId||''))throw new AccessError(400,'Invalid checkout request.');result=await service.checkout(user,body.sku,body.requestId);}
  if(action==='portal')result=await service.portal(user);
  if(action==='progress')result=await service.saveProgress(user,body.episode,body.position);
  return res.status(200).json(result);
 }catch(e){const status=e instanceof AccessError?e.status:503;console.error(JSON.stringify({scope:'saints',requestId,status,errorClass:e.name}));return res.status(status).json({error:status===503?'Service temporarily unavailable. Please try again shortly.':e.message,requestId});}
};}
module.exports=createHandler();module.exports.createHandler=createHandler;module.exports.rawBody=rawBody;module.exports.config={api:{bodyParser:false}};
