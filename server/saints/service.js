'use strict';
const {episodes,products}=require('./catalog');
class AccessError extends Error{constructor(status,message){super(message);this.status=status;}}
function checkLine(line,product,priceId){const p=line?.price;return line?.quantity===1&&p?.id===priceId&&p.currency==='usd'&&p.unit_amount===product.amount&&(product.mode==='payment'?!p.recurring:p.recurring?.interval==='month'&&p.recurring.interval_count===product.months||product.months===12&&p.recurring?.interval==='year'&&p.recurring.interval_count===1);}
function paidCharge(pi){const c=pi?.latest_charge;return pi?.status==='succeeded'&&c&&typeof c==='object'&&c.paid===true&&!c.refunded&&!c.disputed&&c.amount_refunded===0;}
function createService({db,stripe,env,sign,mailer,now=()=>Math.floor(Date.now()/1000)}){
 const priceFor=sku=>env[products[sku]?.priceEnv];
 async function verifiedSession(id,userId){
  const s=await stripe.checkout.sessions.retrieve(id,{expand:['line_items.data.price','payment_intent.latest_charge']});
  const sku=s.metadata?.saints_sku,p=Object.hasOwn(products,sku)?products[sku]:null;
  if(s.metadata?.saints_user!==userId||s.client_reference_id!==userId||!p||s.status!=='complete'||s.mode!==p.mode||s.line_items?.data?.length!==1||!checkLine(s.line_items.data[0],p,priceFor(sku)))return null;
  if(s.livemode!==env.STRIPE_SECRET_KEY?.startsWith('sk_live_'))return null;
  return {s,sku,p};
 }
 async function settledMembership(s,p,sku,userId){
  if(typeof s.subscription!=='string')return null;
   const sub=await stripe.subscriptions.retrieve(s.subscription,{expand:['latest_invoice']});
   const item=sub.items?.data?.[0],invoice=sub.latest_invoice;
   if(sub.customer!==s.customer||sub.metadata?.saints_user!==userId||sub.items?.data?.length!==1||!checkLine({quantity:item?.quantity,price:item?.price},p,priceFor(sku)))return null;
   if(sub.status!=='active'||!Number.isFinite(item?.current_period_end)||item.current_period_end<=now()||invoice?.status!=='paid'||invoice.amount_paid<p.amount||invoice.paid_out_of_band)return {sub,invoice,item,settled:false};
   // Require a real settled invoice payment; a manually marked paid invoice cannot grant access.
   const payments=await stripe.invoicePayments.list({invoice:invoice.id,status:'paid',limit:10});
   let settled=false;
   for(const payment of payments.data){const piId=payment.payment?.payment_intent;if(typeof piId==='string'){const pi=await stripe.paymentIntents.retrieve(piId,{expand:['latest_charge']});if(paidCharge(pi)&&pi.amount_received>=p.amount){settled=true;break;}}}
  return {sub,invoice,item,settled};
 }
 async function access(userId){
  const owned=new Set(),customers=new Set(),membershipCustomers=new Set(),activeMembershipCustomers=new Set();let member=false;
  for(const row of await db.receipts(userId)){
   const v=await verifiedSession(row.session_id,userId);if(!v)continue;const {s,p}=v;if(typeof s.customer==='string')customers.add(s.customer);
   if(p.mode==='payment'){if(s.payment_status==='paid'&&paidCharge(s.payment_intent))owned.add(p.episode);continue;}
   const membership=await settledMembership(s,p,v.sku,userId);
   if(membership&&typeof s.customer==='string'){membershipCustomers.add(s.customer);if(membership.settled){member=true;activeMembershipCustomers.add(s.customer);}}
  }
  const billing=activeMembershipCustomers.size?activeMembershipCustomers:membershipCustomers.size?membershipCustomers:customers;
  return {owned,member,customers,billingCustomer:billing.size===1?[...billing][0]:null};
 }
 async function fulfill(sessionId){
  const s=await stripe.checkout.sessions.retrieve(sessionId);const uid=s.metadata?.saints_user;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid||''))return;
  const v=await verifiedSession(sessionId,uid);if(!v)return;
  // Store the receipt, not an unconditional entitlement. Live payment state governs access.
  await db.saveReceipt({session_id:s.id,user_id:uid,sku:v.sku});
  if(!mailer)return;
  if(v.p.mode==='payment'){
   if(v.s.payment_status==='paid'&&paidCharge(v.s.payment_intent))await mailer.confirm(v,uid);
  }else{
   const membership=await settledMembership(v.s,v.p,v.sku,uid);
   if(membership?.settled)await mailer.confirm(v,uid,membership.item.current_period_end);
  }
 }
 async function checkout(user,sku,requestId){
  if(env.SAINTS_SALES_ENABLED!=='true')throw new AccessError(409,'Purchases are not open yet.');
  const p=Object.hasOwn(products,sku)?products[sku]:null;if(!p)throw new AccessError(400,'Unknown product.');
  if(p.mode==='subscription'&&env.SAINTS_MEMBERSHIPS_ENABLED!=='true')throw new AccessError(409,'Memberships are not available yet.');
  const episode=episodes.find(e=>e.id===p.episode);const preorder=!!(episode&&!episode.released&&episode.preorder&&env.SAINTS_PREORDERS_ENABLED==='true');
  if(p.episode&&!episode?.released&&!preorder)throw new AccessError(409,'Preorders are not open yet.');
  if(!priceFor(sku))throw new AccessError(503,'This purchase option is not configured.');
  const ent=await access(user.id);if((p.episode&&(ent.owned.has(p.episode)||ent.member))||(!p.episode&&ent.member))throw new AccessError(409,'You already have access.');
  const price=await stripe.prices.retrieve(priceFor(sku));if(!price.active||!checkLine({quantity:1,price},p,priceFor(sku)))throw new AccessError(503,'The purchase price needs review.');
  const metadata={saints_user:user.id,saints_sku:sku,...(preorder?{saints_preorder:'true'}:{})};
  const params={mode:p.mode,line_items:[{price:price.id,quantity:1}],client_reference_id:user.id,...(ent.billingCustomer?{customer:ent.billingCustomer}:{customer_email:user.email,...(p.mode==='payment'?{customer_creation:'always'}:{})}),...(p.mode==='subscription'?{subscription_data:{metadata}}:{}),metadata,...(p.mode==='subscription'?{custom_text:{submit:{message:'Automatic renewal. Access to all released Saints episodes while subscribed. Cancel through Manage billing in your library; access continues until the end of your paid period.'}}}:{}),...(preorder?{custom_text:{submit:{message:'Preorder: charged $2.99 now. Episode 2 unlocks when released. Release date is not yet announced.'}}}:{}),success_url:env.SITE_ORIGIN+'/saints-library?checkout=complete',cancel_url:env.SITE_ORIGIN+'/saints-library?checkout=cancelled'};
  // The database chooses one persistent attempt per account/product. Different
  // browser request IDs and different Vercel instances share its Stripe key.
  const attempt=await db.reserveCheckout(user.id,p.mode==='subscription'?'membership':sku,params);
  if(!attempt?.id||!attempt.params||!Number.isFinite(attempt.expires_at))throw new AccessError(503,'Checkout is temporarily unavailable.');
  const session=attempt.session_id
   ?await stripe.checkout.sessions.retrieve(attempt.session_id)
   :await stripe.checkout.sessions.create({...attempt.params,expires_at:attempt.expires_at},{idempotencyKey:`saints:${attempt.id}`});
  if(!attempt.session_id)await db.saveCheckout(attempt.id,session.id);
  if(session.status==='complete'){
   await fulfill(session.id);
   const previous=await verifiedSession(session.id,user.id),charge=previous?.s.payment_intent?.latest_charge;
   if(previous?.p.mode==='subscription'&&typeof previous.s.subscription==='string'){
    const sub=await stripe.subscriptions.retrieve(previous.s.subscription);
    if(sub.status==='canceled'){await db.retireCheckout(attempt.id);throw new AccessError(409,'Your previous membership has ended. Please try again to start a new membership.');}
   }
   if(previous?.p.mode==='payment'&&charge?.refunded===true&&!charge.disputed&&charge.amount_refunded>=previous.p.amount){
    await db.retireCheckout(attempt.id);
    throw new AccessError(409,'Your previous purchase was refunded. Please try again to make a new purchase.');
   }
   throw new AccessError(409,'This checkout is complete. Refresh your library to see the payment status.');
  }
  if(session.status==='expired'){
   await db.retireCheckout(attempt.id);
   throw new AccessError(409,'This checkout has expired. Please try again.');
  }
  if(p.mode==='subscription'&&attempt.params.metadata?.saints_sku!==sku)throw new AccessError(409,'A different membership checkout is already open. Complete it or let it expire before choosing another plan.');
  if(!session.url)throw new AccessError(503,'Checkout is temporarily unavailable.');
  return {url:session.url};
 }
 async function library(user){const a=await access(user.id),progress=await db.progress(user.id);return {email:user.email,membership:a.member,episodes:episodes.map(e=>({id:e.id,title:e.title,number:e.number,free:e.free,released:e.released,preorder:!!(e.preorder&&env.SAINTS_SALES_ENABLED==='true'&&env.SAINTS_PREORDERS_ENABLED==='true'),poster:e.poster,duration:e.duration,accessible:e.released&&(e.free||a.member||a.owned.has(e.id)),purchased:a.owned.has(e.id),position:progress.find(p=>p.episode_id===e.id)?.position||0}))};}
 async function playback(user,id){const e=episodes.find(e=>e.id===id);if(!e||!e.released)throw new AccessError(404,'Episode is not available.');if(!e.free){if(!user)throw new AccessError(401,'Sign in to watch this episode.');const a=await access(user.id);if(!a.member&&!a.owned.has(id))throw new AccessError(403,'Purchase this episode or a membership to watch.');}const playbackId=env[e.playbackEnv];if(!playbackId)throw new AccessError(503,'This video is not ready for streaming yet.');const expires=now()+900;return {url:`https://stream.mux.com/${playbackId}.m3u8?token=${sign(playbackId,expires)}`,expires,title:e.title,duration:e.duration};}
 async function portal(user){const a=await access(user.id);if(!a.billingCustomer)throw new AccessError(409,'Contact support to manage billing for this account.');return {url:(await stripe.billingPortal.sessions.create({customer:a.billingCustomer,configuration:env.STRIPE_SAINTS_PORTAL_CONFIGURATION||undefined,return_url:env.SITE_ORIGIN+'/saints-library'})).url};}
 async function saveProgress(user,id,position){const e=episodes.find(e=>e.id===id);if(!e?.released||!Number.isFinite(position)||position<0||position>(e.duration||0))throw new AccessError(400,'Invalid playback position.');if(!e.free){const a=await access(user.id);if(!a.member&&!a.owned.has(id))throw new AccessError(403,'No access.');}await db.saveProgress({user_id:user.id,episode_id:id,position});return {ok:true};}
 return {access,checkout,fulfill,library,playback,portal,saveProgress};
}
module.exports={createService,AccessError,checkLine,paidCharge};
