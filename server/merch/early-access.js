'use strict';
const {createHash}=require('node:crypto');
const PRODUCTS=new Set(['nix','rook']);
const SIZES=new Set(['S','M','L','XL','2XL','3XL']);
const CONSENT='saints-hoodies-early-access-v1';
function createHandler({env=process.env,store=require('../../api/_lead-store'),readBody}={}){
 return async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const reply=(n,b)=>res.status(n).json(b);
  if(req.method==='GET')return reply(200,{acceptingSignups:store.configured()});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return reply(405,{ok:false,error:'Please use the signup form.'});}
  const origins=new Set(['https://vnmsfx.com','https://www.vnmsfx.com']);
  for(const key of ['VERCEL_URL','VERCEL_BRANCH_URL'])if(env[key])origins.add('https://'+env[key]);
  if(env.MERCH_SITE_ORIGIN)origins.add(new URL(env.MERCH_SITE_ORIGIN).origin);
  const origin=req.headers.origin;
  if(!origins.has(origin)&&!(env.NODE_ENV!=='production'&&/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin||'')))return reply(403,{ok:false,error:'Please sign up from the Saints page.'});
  if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return reply(415,{ok:false,error:'Please use the signup form.'});
  let body;
  try{const raw=await readBody(req);if(raw.length>4096)return reply(413,{ok:false,error:'Please shorten your signup.'});body=JSON.parse(raw.toString());if(!body||Array.isArray(body)||typeof body!=='object')throw Error();}catch{return reply(400,{ok:false,error:'Please check your signup and try again.'});}
  if(body.company_website)return reply(400,{ok:false,error:'We could not accept this signup.'});
  const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
  if(email.length>254||!email||/[\s<>\x00-\x1f\x7f]/.test(email)||!/^[^@]+@[^@]+\.[^@]{2,}$/.test(email))return reply(400,{ok:false,error:'Enter a valid email address.'});
  if(!PRODUCTS.has(body.product)||!SIZES.has(body.size))return reply(400,{ok:false,error:'Choose Nix or Rook and your size.'});
  if(body.consent!==true)return reply(400,{ok:false,error:'Please allow us to email you about this hoodie release.'});
  if(!store.configured())return reply(503,{ok:false,error:'Signups are temporarily unavailable. Please try again shortly.'});
  const now=new Date(),fp=createHash('sha256').update(JSON.stringify([CONSENT,email,body.product,body.size])).digest('hex').slice(0,32);
  let saved;
  try{saved=await store.createLead({submissionId:'HOODIE-'+fp,fingerprint:fp,email,firstName:'',channelLabel:'Saints hoodie early access',nextAction:'Notify when selected hoodie orders open',replyDueIso:null,process:'Hoodie release signup',points:0,answered:3,financeTouched:false,notedText:body.product.toUpperCase()+' / '+body.size,transcriptText:'Character: '+body.product+'\nSize: '+body.size+'\nConsent: email about this hoodie release\nConsent version: '+CONSENT+'\nNo purchase or stock reservation.',receivedIso:now.toISOString(),source:'saints-hoodies/early-access',campaign:'saints-hoodies-release-2026',contentId:body.product,surveyVersion:CONSENT});}catch{console.error('Hoodie early-access storage failed');}
  if(!saved?.persisted)return reply(503,{ok:false,error:'We could not confirm your signup was saved. Please try again.'});
  return reply(200,{ok:true,persisted:true,message:'You’re on the list. We’ll email you when orders open.'});
 };
}
module.exports={createHandler,CONSENT};
