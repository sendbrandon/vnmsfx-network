'use strict';
const crypto=require('node:crypto');
const Stripe=require('stripe');
const {createClient}=require('@supabase/supabase-js');
const {AccessError}=require('./service');
function need(env,key){if(!env[key])throw new AccessError(503,'Streaming services are not configured yet.');return env[key];}
function createProviders(env){
 let supabaseClient,stripeClient;
 const getSupabase=()=>supabaseClient||(supabaseClient=createClient(need(env,'SUPABASE_URL'),need(env,'SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}}));
 const stripe=new Proxy({}, {get(_target,key){stripeClient ||= new Stripe(need(env,'STRIPE_SECRET_KEY'),{timeout:10000,maxNetworkRetries:1});return stripeClient[key];}});
 async function result(q){const {data,error}=await q;if(error)throw new AccessError(503,'Your library is temporarily unavailable.');return data;}
 const db={receipts:uid=>result(getSupabase().from('saints_receipts').select('session_id,sku').eq('user_id',uid)),saveReceipt:row=>result(getSupabase().from('saints_receipts').upsert(row,{onConflict:'session_id'})),progress:uid=>result(getSupabase().from('saints_progress').select('episode_id,position').eq('user_id',uid)),saveProgress:row=>result(getSupabase().from('saints_progress').upsert({...row,updated_at:new Date().toISOString()},{onConflict:'user_id,episode_id'}))};
 async function user(req,optional=false){const auth=req.headers.authorization;if(!auth&&optional)return null;if(!/^Bearer [^\s]+$/.test(auth||''))throw new AccessError(401,'Sign in to continue.');const {data,error}=await getSupabase().auth.getUser(auth.slice(7));if(error||!data.user?.email_confirmed_at)throw new AccessError(401,'Your sign-in has expired. Please sign in again.');return data.user;}
 function sign(id,exp){const kid=need(env,'MUX_SIGNING_KEY_ID'),pem=Buffer.from(need(env,'MUX_SIGNING_PRIVATE_KEY_BASE64'),'base64').toString('utf8');const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const body=enc({alg:'RS256',typ:'JWT',kid})+'.'+enc({sub:id,aud:'v',exp});return body+'.'+crypto.sign('RSA-SHA256',Buffer.from(body),pem).toString('base64url');}
 return {db,stripe,user,sign};
}
module.exports={createProviders,need};
