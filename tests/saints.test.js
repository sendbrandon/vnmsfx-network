const {test}=require('node:test');const assert=require('node:assert/strict');const {Readable}=require('node:stream');const Stripe=require('stripe');const {createService,paidCharge,checkLine}=require('../server/saints/service');const {createHandler}=require('../api/saints');
const uid='11111111-1111-4111-8111-111111111111';
function fixture(){const env={SITE_ORIGIN:'https://vnmsfx.com',SAINTS_SALES_ENABLED:'true',SAINTS_MEMBERSHIPS_ENABLED:'true',STRIPE_SECRET_KEY:'sk_test_example',STRIPE_SAINTS_MONTHLY_PRICE:'price_month',STRIPE_SAINTS_02_PRICE:'price_ep',MUX_SAINTS_01_PLAYBACK_ID:'free-id'};const price={id:'price_month',currency:'usd',unit_amount:799,recurring:{interval:'month',interval_count:1},active:true};const session={id:'cs_ok',metadata:{saints_user:uid,saints_sku:'monthly'},client_reference_id:uid,status:'complete',mode:'subscription',livemode:false,customer:'cus_ok',subscription:'sub_ok',line_items:{data:[{price,quantity:1}]}};const sub={status:'active',customer:'cus_ok',metadata:{saints_user:uid},items:{data:[{quantity:1,price,current_period_end:2000}]},latest_invoice:{id:'in_ok',status:'paid',amount_paid:799,paid_out_of_band:false}};const pi={status:'succeeded',amount_received:799,latest_charge:{paid:true,refunded:false,disputed:false,amount_refunded:0}};const rows=[{session_id:'cs_ok'}];let saves=0;let attempt;const db={reserveCheckout:async(_uid,_sku,params)=>attempt||(attempt={id:'test-attempt',params,expires_at:4600}),saveCheckout:async()=>{},receipts:async()=>rows,saveReceipt:async r=>{saves++;},progress:async()=>[],saveProgress:async()=>{}};const stripe={checkout:{sessions:{retrieve:async()=>session,create:async()=>({url:'https://checkout.stripe.com/test'})}},subscriptions:{retrieve:async()=>sub},invoicePayments:{list:async()=>({data:[{payment:{payment_intent:'pi_ok'}}]})},paymentIntents:{retrieve:async()=>pi},prices:{retrieve:async()=>price},billingPortal:{sessions:{create:async()=>({url:'https://billing.stripe.com/test'})}}};const service=createService({db,stripe,env,sign:()=> 'signed',now:()=>1000});return {service,env,session,sub,pi,price,rows,db,stripe,get saves(){return saves}};}
test('free episode needs no user and has expiring canonical URL',async()=>{const f=fixture();const r=await f.service.playback(null,'saints-01');assert.match(r.url,/free-id/);assert.equal(r.expires,1900);});
test('unreleased episode denied even to member',async()=>{const f=fixture();await assert.rejects(f.service.playback({id:uid},'saints-02'),{status:404});});
test('active settled membership grants access',async()=>assert.equal((await fixture().service.access(uid)).member,true));
for(const state of ['past_due','canceled','unpaid','incomplete','trialing'])test(state+' membership denied',async()=>{const f=fixture();f.sub.status=state;assert.equal((await f.service.access(uid)).member,false)});
test('expired period denied',async()=>{const f=fixture();f.sub.items.data[0].current_period_end=999;assert.equal((await f.service.access(uid)).member,false)});
test('scheduled cancellation retains current paid period',async()=>{const f=fixture();f.sub.cancel_at_period_end=true;assert.equal((await f.service.access(uid)).member,true)});
for(const flag of ['refunded','disputed'])test(flag+' invoice payment denied',async()=>{const f=fixture();f.pi.latest_charge[flag]=true;assert.equal((await f.service.access(uid)).member,false)});
test('partial refund denied',async()=>{const f=fixture();f.pi.latest_charge.amount_refunded=1;assert.equal((await f.service.access(uid)).member,false)});
test('manually paid invoice denied',async()=>{const f=fixture();f.sub.latest_invoice.paid_out_of_band=true;assert.equal((await f.service.access(uid)).member,false)});
test('another user cannot inherit session',async()=>assert.equal((await fixture().service.access('22222222-2222-4222-8222-222222222222')).member,false));
test('price mismatch denied',async()=>{const f=fixture();f.price.unit_amount=1;assert.equal((await f.service.access(uid)).member,false)});
test('wrong customer denied',async()=>{const f=fixture();f.sub.customer='cus_other';assert.equal((await f.service.access(uid)).member,false)});
test('live/test mismatch denied',async()=>{const f=fixture();f.session.livemode=true;assert.equal((await f.service.access(uid)).member,false)});
test('unpaid one-time receipt does not unlock episode',async()=>{const f=fixture();f.session.mode='payment';f.session.metadata.saints_sku='saints-02';f.session.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};f.session.payment_status='unpaid';f.session.payment_intent=f.pi;assert.equal((await f.service.access(uid)).owned.size,0)});
test('paid one-time receipt grants only purchased episode',async()=>{const f=fixture();f.session.mode='payment';f.session.metadata.saints_sku='saints-02';f.session.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};f.session.payment_status='paid';f.session.payment_intent=f.pi;assert.deepEqual([...(await f.service.access(uid)).owned],['saints-02'])});
test('sales disabled blocks checkout',async()=>{const f=fixture();f.env.SAINTS_SALES_ENABLED='false';await assert.rejects(f.service.checkout({id:uid},'monthly','request'),{status:409})});
test('unreleased product cannot be sold',async()=>await assert.rejects(fixture().service.checkout({id:uid},'saints-02','request'),{status:409}));
test('unknown sku rejected',async()=>await assert.rejects(fixture().service.checkout({id:uid},'hacked','request'),{status:400}));
test('dependency failure does not grant access',async()=>{const f=fixture();f.stripe.subscriptions.retrieve=async()=>{throw Error('offline')};await assert.rejects(f.service.access(uid));});
test('NaN progress and out-of-range position rejected',async()=>{const f=fixture();for(const n of [NaN,-1,312])await assert.rejects(f.service.saveProgress({id:uid},'saints-01',n),{status:400});});
test('wrong signature rejected by actual Stripe verifier',()=>{const stripe=new Stripe('sk_test_example');assert.throws(()=>stripe.webhooks.constructEvent(Buffer.from('{}'),'t=1,v1=bad','whsec_test'));});
async function request(handler,action,method='POST',body='{}',headers={}){const req=Readable.from([body]);Object.assign(req,{url:'/api/saints?action='+action,method,headers});let out={};const res={setHeader(){},status(s){out.status=s;return this},json(b){out.body=b;return this}};await handler(req,res);return out;}
test('cross-origin mutation rejected before providers',async()=>{const r=await request(createHandler({SITE_ORIGIN:'https://vnmsfx.com'},()=>{throw Error('must not call')}),'checkout','POST','{}',{origin:'https://evil.example'});assert.equal(r.status,403)});
test('library requires verified authentication',async()=>{const f=fixture();const handler=createHandler(f.env,()=>({...f,user:async()=>{const e=new (require('../server/saints/service').AccessError)(401,'Sign in');throw e}}));assert.equal((await request(handler,'library','GET')).status,401)});
test('missing service configuration fails closed',async()=>{const r=await request(createHandler({SITE_ORIGIN:'https://vnmsfx.com'}),'playback','POST','{"episode":"saints-01"}',{origin:'https://vnmsfx.com'});assert.equal(r.status,503)});
test('config never exposes server secrets',async()=>{const r=await request(createHandler({STRIPE_SECRET_KEY:'secret',SUPABASE_SERVICE_ROLE_KEY:'private'}),'config','GET');assert.equal(JSON.stringify(r.body).includes('secret'),false);assert.equal(JSON.stringify(r.body).includes('private'),false)});
test('prototype names are not purchasable products',async()=>{for(const sku of ['constructor','toString','__proto__'])await assert.rejects(fixture().service.checkout({id:uid},sku,'request'),{status:400});});
test('checkout reuses verified billing customer and server price',async()=>{const f=fixture();f.sub.status='canceled';let sent,options;f.stripe.checkout.sessions.create=async(a,b)=>{sent=a;options=b;return {url:'https://checkout.stripe.com/test'}};await f.service.checkout({id:uid,email:'viewer@example.test'},'monthly','request-123');assert.equal(sent.customer,'cus_ok');assert.equal(sent.customer_email,undefined);assert.equal(sent.payment_method_types,undefined);assert.deepEqual(sent.line_items,[{price:'price_month',quantity:1}]);assert.equal(sent.client_reference_id,uid);assert.equal(options.idempotencyKey,'saints:test-attempt');});
test('all raw-body forms enforce the same size limit',async()=>{const {rawBody}=require('../api/saints');for(const body of [Buffer.alloc(262145),'x'.repeat(262145)])await assert.rejects(rawBody({body}),{status:413});await assert.rejects(rawBody(Readable.from([Buffer.alloc(262145)])),{status:413});});
test('free playback signs a verifiable JWT without Stripe or Supabase',async()=>{const crypto=require('node:crypto'),{createProviders}=require('../server/saints/providers');const keys=crypto.generateKeyPairSync('rsa',{modulusLength:2048});const pem=keys.privateKey.export({type:'pkcs8',format:'pem'});const env={MUX_SIGNING_KEY_ID:'test-kid',MUX_SIGNING_PRIVATE_KEY_BASE64:Buffer.from(pem).toString('base64'),MUX_SAINTS_01_PLAYBACK_ID:'free-id'};const providers=createProviders(env);assert.equal(await providers.user({headers:{}},true),null);const svc=createService({...providers,env,now:()=>1000});const playback=await svc.playback(null,'saints-01');const jwt=new URL(playback.url).searchParams.get('token'),parts=jwt.split('.');assert.equal(crypto.verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),keys.publicKey,Buffer.from(parts[2],'base64url')),true);assert.deepEqual(JSON.parse(Buffer.from(parts[1],'base64url')),{sub:'free-id',aud:'v',exp:1900});});
test('signed webhook validates and stores the verified session owner',async()=>{const f=fixture();f.env.STRIPE_WEBHOOK_SECRET='whsec_test';f.stripe.webhooks=new Stripe('sk_test_example').webhooks;let saved;f.db.saveReceipt=async r=>{saved=r};const body=JSON.stringify({type:'checkout.session.completed',data:{object:{id:'cs_ok'}}});const sig=f.stripe.webhooks.generateTestHeaderString({payload:body,secret:'whsec_test'});const handler=createHandler(f.env,()=>({...f,sign:()=>'',user:async()=>null}));const r=await request(handler,'webhook','POST',body,{'stripe-signature':sig});assert.equal(r.status,200);assert.deepEqual(saved,{session_id:'cs_ok',user_id:uid,sku:'monthly'});});
test('enabled preorder charges canonical price but cannot play before release',async()=>{const f=fixture();f.env.SAINTS_PREORDERS_ENABLED='true';f.rows.length=0;f.stripe.prices.retrieve=async()=>({id:'price_ep',currency:'usd',unit_amount:299,active:true});let sent;f.stripe.checkout.sessions.create=async a=>{sent=a;return {url:'https://checkout.stripe.com/test'}};await f.service.checkout({id:uid,email:'viewer@example.test'},'saints-02','preorder');assert.equal(sent.mode,'payment');assert.equal(sent.metadata.saints_preorder,'true');assert.deepEqual(sent.line_items,[{price:'price_ep',quantity:1}]);assert.match(sent.custom_text.submit.message,/Release date is not yet announced/);await assert.rejects(f.service.playback({id:uid},'saints-02'),{status:404});});
test('paid preorder is listed as purchased but unavailable until release',async()=>{const f=fixture();f.env.SAINTS_PREORDERS_ENABLED='true';f.session.mode='payment';f.session.metadata.saints_sku='saints-02';f.session.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};f.session.payment_status='paid';f.session.payment_intent=f.pi;const e=(await f.service.library({id:uid})).episodes.find(e=>e.id==='saints-02');assert.equal(e.purchased,true);assert.equal(e.accessible,false);await assert.rejects(f.service.checkout({id:uid},'saints-02','again'),{status:409});});

test('memberships remain unavailable until separately enabled',async()=>{
 const f=fixture();f.rows.length=0;f.env.SAINTS_MEMBERSHIPS_ENABLED='false';
 await assert.rejects(f.service.checkout({id:uid,email:'viewer@example.test'},'monthly','member-request'),{status:409});
});
test('two concurrent episode requests share one Stripe session across service instances',async()=>{
 const f=fixture();f.rows.length=0;f.env.SAINTS_PREORDERS_ENABLED='true';
 f.stripe.prices.retrieve=async()=>({id:'price_ep',currency:'usd',unit_amount:299,active:true});
 let reservation,created=0;const sessions=new Map();
 f.db.reserveCheckout=async(_user,_sku,params)=>reservation||(reservation={id:'attempt-1',params:structuredClone(params),expires_at:4600,session_id:null});
 f.db.saveCheckout=async(_id,sessionId)=>{reservation.session_id=sessionId};
 f.stripe.checkout.sessions.create=async(params,options)=>{
  if(!sessions.has(options.idempotencyKey)){created++;sessions.set(options.idempotencyKey,{id:'cs_shared',status:'open',url:'https://checkout.stripe.com/shared'})}
  return sessions.get(options.idempotencyKey);
 };
 f.stripe.checkout.sessions.retrieve=async()=>sessions.values().next().value;
 const other=createService({db:f.db,stripe:f.stripe,env:f.env,sign:()=>'',now:()=>1000});
 const responses=await Promise.all([f.service.checkout({id:uid,email:'viewer@example.test'},'saints-02','request-one'),other.checkout({id:uid,email:'viewer@example.test'},'saints-02','request-two')]);
 assert.equal(created,1);assert.equal(responses[0].url,responses[1].url);
});
test('completed pending checkout is reconciled instead of charging again',async()=>{
 const f=fixture();f.rows.length=0;f.env.SAINTS_PREORDERS_ENABLED='true';
 f.stripe.prices.retrieve=async()=>({id:'price_ep',currency:'usd',unit_amount:299,active:true});
 f.db.reserveCheckout=async()=>({id:'old-attempt',params:{},expires_at:999,session_id:'cs_old'});
 f.session.id='cs_old';f.session.mode='payment';f.session.metadata.saints_sku='saints-02';f.session.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};
 f.stripe.checkout.sessions.create=async()=>{throw Error('must not create another payment')};
 await assert.rejects(f.service.checkout({id:uid,email:'viewer@example.test'},'saints-02','another-request'),{status:409});
 assert.equal(f.saves,1);
});
test('only a Stripe-confirmed expired session retires the reservation',async()=>{
 const f=fixture();f.rows.length=0;f.env.SAINTS_PREORDERS_ENABLED='true';
 f.stripe.prices.retrieve=async()=>({id:'price_ep',currency:'usd',unit_amount:299,active:true});
 f.db.reserveCheckout=async()=>({id:'expired-attempt',params:{},expires_at:999,session_id:'cs_expired'});
 f.stripe.checkout.sessions.retrieve=async()=>({id:'cs_expired',status:'expired'});let retired;
 f.db.retireCheckout=async id=>{retired=id};
 await assert.rejects(f.service.checkout({id:uid,email:'viewer@example.test'},'saints-02','another-request'),{status:409});
 assert.equal(retired,'expired-attempt');
});

 test('raw webhook bytes survive a Vercel-style lazy parsed body getter',async()=>{const {Readable}=require('node:stream');const {rawBody}=require('../api/saints');const bytes=Buffer.from('{ "spacing" : true }\n');const req=Readable.from([bytes]);Object.defineProperty(req,'body',{get(){throw new Error('Parsed body must not be touched');}});assert.deepEqual(await rawBody(req),bytes);});

test('a fully refunded completed checkout can retire so the viewer can buy again',async()=>{const f=fixture();f.env.SAINTS_PREORDERS_ENABLED='true';f.session.mode='payment';f.session.metadata.saints_sku='saints-02';f.session.payment_status='paid';f.session.payment_intent=f.pi;f.session.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};f.pi.latest_charge.refunded=true;f.pi.latest_charge.amount_refunded=299;f.stripe.prices.retrieve=async()=>({id:'price_ep',currency:'usd',unit_amount:299,active:true});f.db.reserveCheckout=async()=>({id:'refunded-attempt',params:{},expires_at:999,session_id:'cs_ok'});let retired;f.db.retireCheckout=async id=>{retired=id};await assert.rejects(f.service.checkout({id:uid,email:'viewer@example.test'},'saints-02','repurchase'),{status:409});assert.equal(retired,'refunded-attempt');assert.equal((await f.service.access(uid)).owned.size,0);});

test('monthly, six-month and annual recurring prices enforce the approved intervals',()=>{
 for(const [sku,amount,interval,count]of [['monthly',799,'month',1],['six',3999,'month',6],['annual',6999,'year',1]]){
  const product=require('../server/saints/catalog').products[sku];assert.equal(checkLine({quantity:1,price:{id:'price',currency:'usd',unit_amount:amount,recurring:{interval,interval_count:count}}},product,'price'),true);
  assert.equal(checkLine({quantity:1,price:{id:'price',currency:'usd',unit_amount:amount,recurring:{interval:'week',interval_count:count}}},product,'price'),false);
 }
});
test('membership Checkout displays renewal and cancellation terms and shares one reservation across plans',async()=>{
 const f=fixture();f.rows.length=0;let reservationKey,params;
 f.db.reserveCheckout=async(uid,sku,p)=>{reservationKey=sku;params=p;return {id:'member-attempt',params:p,expires_at:4600}};
 await f.service.checkout({id:uid,email:'viewer@example.test'},'monthly','request');assert.equal(reservationKey,'membership');assert.match(params.custom_text.submit.message,/Automatic renewal/);assert.match(params.custom_text.submit.message,/end of your paid period/);
});
test('a competing membership plan cannot open a second checkout',async()=>{
 const f=fixture();f.rows.length=0;f.env.STRIPE_SAINTS_SIX_MONTH_PRICE='price_six';f.stripe.prices.retrieve=async()=>({id:'price_six',currency:'usd',unit_amount:3999,recurring:{interval:'month',interval_count:6},active:true});
 f.db.reserveCheckout=async()=>({id:'member-attempt',params:{metadata:{saints_sku:'monthly'}},expires_at:4600,session_id:'cs_pending'});
 f.stripe.checkout.sessions.retrieve=async()=>({id:'cs_pending',status:'open',url:'https://checkout.stripe.com/pending'});
 await assert.rejects(f.service.checkout({id:uid,email:'viewer@example.test'},'six','request'),{status:409});
});
test('billing portal uses the dedicated Saints configuration and canonical library return',async()=>{
 const f=fixture();f.env.STRIPE_SAINTS_PORTAL_CONFIGURATION='bpc_saints';let p;f.stripe.billingPortal.sessions.create=async args=>{p=args;return {url:'https://billing.stripe.com/manage'}};await f.service.portal({id:uid});assert.equal(p.configuration,'bpc_saints');assert.equal(p.return_url,'https://vnmsfx.com/saints-library');
});

test('a concurrent episode purchase on another owned customer cannot strand membership cancellation',async()=>{
 const f=fixture(),episode=structuredClone(f.session);episode.id='cs_episode';episode.customer='cus_episode';episode.mode='payment';episode.metadata.saints_sku='saints-02';episode.line_items.data[0].price={id:'price_ep',currency:'usd',unit_amount:299};episode.payment_status='paid';episode.payment_intent=f.pi;
 f.rows.push({session_id:'cs_episode'});f.stripe.checkout.sessions.retrieve=async id=>id==='cs_episode'?episode:f.session;
 let portalCustomer;f.stripe.billingPortal.sessions.create=async p=>{portalCustomer=p.customer;return {url:'https://billing.stripe.com/member'}};
 const access=await f.service.access(uid);assert.equal(access.customers.size,2);assert.equal(access.member,true);await f.service.portal({id:uid});assert.equal(portalCustomer,'cus_ok');
});
