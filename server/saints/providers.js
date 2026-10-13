'use strict';
const crypto=require('node:crypto');
const Stripe=require('stripe');
const {createClient}=require('@supabase/supabase-js');
const {AccessError}=require('./service');
const {purchaseEmail}=require('./purchase-email');
function need(env,key){if(!env[key])throw new AccessError(503,'Streaming services are not configured yet.');return env[key];}
function createProviders(env){
 let supabaseClient,stripeClient;
 const getSupabase=()=>supabaseClient||(supabaseClient=createClient(need(env,'SUPABASE_URL'),need(env,'SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}}));
 const stripe=new Proxy({}, {get(_target,key){stripeClient ||= new Stripe(need(env,'STRIPE_SECRET_KEY'),{timeout:10000,maxNetworkRetries:1});return stripeClient[key];}});
 async function result(q){const {data,error}=await q;if(error)throw new AccessError(503,'Your library is temporarily unavailable.');return data;}
 const db={retireCheckout:id=>result(getSupabase().from('saints_checkouts').delete().eq('id',id)),reserveCheckout:(uid,sku,params)=>result(getSupabase().rpc('saints_reserve_checkout',{p_user_id:uid,p_sku:sku,p_params:params}).single()),saveCheckout:(id,sessionId)=>result(getSupabase().from('saints_checkouts').update({session_id:sessionId}).eq('id',id)),receipts:uid=>result(getSupabase().from('saints_receipts').select('session_id,sku').eq('user_id',uid)),saveReceipt:row=>result(getSupabase().from('saints_receipts').upsert(row,{onConflict:'session_id'})),progress:uid=>result(getSupabase().from('saints_progress').select('episode_id,position').eq('user_id',uid)),saveProgress:row=>result(getSupabase().from('saints_progress').upsert({...row,updated_at:new Date().toISOString()},{onConflict:'user_id,episode_id'}))};
 const mailer={
  async confirm(v,uid,renewalDate){
   const {data,error}=await getSupabase().auth.admin.getUserById(uid);
   if(error||!data.user?.email_confirmed_at||!data.user.email)throw new AccessError(503,'Purchase email recipient is unavailable.');
   // Never send sandbox purchase claims to customers. A named setup inbox is required.
   const email=v.s.livemode?data.user.email:env.SAINTS_TEST_EMAIL_TO;
   if(!email){return;}
   const payload=purchaseEmail({sku:v.sku,email,renewalDate});
   if(!v.s.livemode){payload.subject='[Setup test] '+payload.subject;payload.text='SANDBOX TEST — No real payment was made. This email previews the customer confirmation.\n\n'+payload.text;payload.html=payload.html.replace(/(<body[^>]*>)/,'$1<p style="padding:12px;text-align:center;color:#c6a576;font-family:Arial,sans-serif">SANDBOX TEST — No real payment was made.</p>');}
   const claim=await result(getSupabase().rpc('saints_claim_purchase_email',{p_session_id:v.s.id,p_payload:payload}));
   if(claim.state==='sent')return;
   if(claim.state!=='claimed'){const e=new AccessError(503,'Purchase confirmation is pending.');e.name=claim.state==='needs_review'?'PurchaseEmailNeedsReview':'PurchaseEmailBusy';throw e;}
   try{
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+need(env,'RESEND_API_KEY'),'Content-Type':'application/json','Idempotency-Key':'saints-purchase/'+v.s.id},body:JSON.stringify(claim.payload),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new AccessError(503,'Purchase confirmation delivery is pending.');
    const sent=await response.json();if(!sent.id)throw new AccessError(503,'Purchase confirmation delivery is pending.');
    await result(getSupabase().from('saints_purchase_emails').update({provider_id:sent.id,sent_at:new Date().toISOString(),lease_until:null}).eq('session_id',v.s.id).eq('lease_token',claim.token));
   }catch(error){
    // Retain the immutable payload and first attempt for safe provider retries.
    await result(getSupabase().from('saints_purchase_emails').update({lease_until:null}).eq('session_id',v.s.id).eq('lease_token',claim.token));
    throw error;
   }
  }
 };
 async function user(req,optional=false){const auth=req.headers.authorization;if(!auth&&optional)return null;if(!/^Bearer [^\s]+$/.test(auth||''))throw new AccessError(401,'Sign in to continue.');const {data,error}=await getSupabase().auth.getUser(auth.slice(7));if(error||!data.user?.email_confirmed_at)throw new AccessError(401,'Your sign-in has expired. Please sign in again.');return data.user;}
 function sign(id,exp){const kid=need(env,'MUX_SIGNING_KEY_ID'),pem=Buffer.from(need(env,'MUX_SIGNING_PRIVATE_KEY_BASE64'),'base64').toString('utf8');const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');const body=enc({alg:'RS256',typ:'JWT',kid})+'.'+enc({sub:id,aud:'v',exp});return body+'.'+crypto.sign('RSA-SHA256',Buffer.from(body),pem).toString('base64url');}
 return {db,stripe,user,sign,mailer};
}
module.exports={createProviders,need};
