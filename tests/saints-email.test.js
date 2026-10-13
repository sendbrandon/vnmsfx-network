const {test}=require('node:test');
const assert=require('node:assert/strict');
const {purchaseEmail}=require('../server/saints/purchase-email');
const {createProviders}=require('../server/saints/providers');
const {createService}=require('../server/saints/service');
const uid='11111111-1111-4111-8111-111111111111';
function payment(){return {id:'cs_email',mode:'payment',status:'complete',livemode:true,client_reference_id:uid,customer_details:{email:'wrong@example.test'},metadata:{saints_user:uid,saints_sku:'saints-02'},line_items:{data:[{quantity:1,price:{id:'price_ep',currency:'usd',unit_amount:299}}]},payment_status:'paid',payment_intent:{status:'succeeded',latest_charge:{paid:true,refunded:false,disputed:false,amount_refunded:0}}};}
const env={SUPABASE_URL:'https://database.example.test',SUPABASE_SERVICE_ROLE_KEY:'service-test',STRIPE_SECRET_KEY:'sk_live_example',STRIPE_SAINTS_02_PRICE:'price_ep',RESEND_API_KEY:'email-test'};
async function emailHarness(run){
 const original=global.fetch;let entry, sends=0,requests=[],fail=false,pause;
 global.fetch=async(url,options={})=>{
  const path=new URL(url).pathname;let payload;
  if(path.includes('/auth/v1/admin/users/'))payload={id:uid,email:'owner@example.test',email_confirmed_at:'2026-10-13T00:00:00Z'};
  else if(path.includes('/rpc/saints_claim_purchase_email')){
   const input=JSON.parse(options.body);entry||={payload:input.p_payload};
   payload=entry.sent?{state:'sent'}:entry.busy?{state:'busy'}:{state:'claimed',payload:entry.payload,token:'lease'};
   if(payload.state==='claimed')entry.busy=true;
  }else if(path==='/emails'){
   requests.push({headers:options.headers,payload:JSON.parse(options.body)});sends++;
   if(pause)await pause;
   if(fail)return new Response('{}',{status:503});
   payload={id:'email_ok'};
  }else if(path.includes('/rest/v1/saints_purchase_emails')){
   const patch=JSON.parse(options.body);if(patch.sent_at)entry.sent=true;entry.busy=false;payload=null;
  }else throw Error('Unexpected request '+path);
  return new Response(JSON.stringify(payload),{status:200,headers:{'content-type':'application/json'}});
 };
 const db={saveReceipt:async()=>{},receipts:async()=>[]};const session=payment();const stripe={checkout:{sessions:{retrieve:async()=>session}}};
 const mailer=createProviders(env).mailer;const service=createService({db,stripe,env,mailer});
 try{await run({service,mailer,session,get sends(){return sends},get requests(){return requests},setFail(v){fail=v},hold(p){pause=p}});}finally{global.fetch=original;}
}
test('confirmation uses supplied logos, plain-text fallback and canonical token-free library link',()=>{
 const m=purchaseEmail({sku:'saints-02',email:'owner@example.test'});
 assert.match(m.html,/vnmsfx-originals-wordmark.png/);assert.match(m.html,/press-sobl-title.png/);assert.match(m.html,/https:\/\/vnmsfx.com\/saints-library/);assert.match(m.text,/No recurring subscription/);assert.doesNotMatch(m.html,/token_hash|access_token|checkout.stripe/);
 assert.match(m.text,/become available when the episode is released/);
});
test('membership confirmation clearly states recurring price, renewal and paid-period cancellation',()=>{
 const m=purchaseEmail({sku:'six',email:'owner@example.test',renewalDate:1800000000});
 assert.match(m.text,/\$39.99 USD every six months/);assert.match(m.text,/Renews automatically on/);assert.match(m.text,/end of your paid period/);assert.match(m.html,/Watch in my library/);
});
test('confirmed payment emails verified owner and a later duplicate webhook does not resend',async()=>emailHarness(async f=>{
 await f.service.fulfill('cs_email');await f.service.fulfill('cs_email');
 assert.equal(f.sends,1);assert.deepEqual(f.requests[0].payload.to,['owner@example.test']);assert.equal(f.requests[0].headers['Idempotency-Key'],'saints-purchase/cs_email');
}));
test('email failure preserves receipt and allows retry with exactly the same payload and provider key',async()=>emailHarness(async f=>{
 f.setFail(true);await assert.rejects(f.service.fulfill('cs_email'),{status:503});f.setFail(false);await f.service.fulfill('cs_email');
 assert.deepEqual(f.requests[0],f.requests[1]);
}));
test('overlapping webhooks cannot send two confirmations concurrently',async()=>emailHarness(async f=>{
 let release;f.hold(new Promise(r=>release=r));const first=f.service.fulfill('cs_email');
 while(f.sends===0)await new Promise(r=>setImmediate(r));
 await assert.rejects(f.service.fulfill('cs_email'),{name:'PurchaseEmailBusy'});release();await first;assert.equal(f.sends,1);
}));
test('unpaid, refunded and disputed payments never send an unlock confirmation',async()=>{
 for(const change of [s=>s.payment_status='unpaid',s=>s.payment_intent.latest_charge.refunded=true,s=>s.payment_intent.latest_charge.disputed=true])await emailHarness(async f=>{change(f.session);await f.service.fulfill('cs_email');assert.equal(f.sends,0)});
});
test('forged metadata and wrong canonical price never send a confirmation',async()=>{
 for(const change of [s=>s.client_reference_id='someone-else',s=>s.line_items.data[0].price.unit_amount=1])await emailHarness(async f=>{change(f.session);await f.service.fulfill('cs_email');assert.equal(f.sends,0)});
});
test('sandbox payment sends no customer email without a named setup inbox',async()=>emailHarness(async f=>{
 f.session.livemode=false;const testService=createService({db:{saveReceipt:async()=>{}},stripe:{checkout:{sessions:{retrieve:async()=>f.session}}},env:{...env,STRIPE_SECRET_KEY:'sk_test_example'},mailer:f.mailer});await testService.fulfill('cs_email');assert.equal(f.sends,0);
}));
