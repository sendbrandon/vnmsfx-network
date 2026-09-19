'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const {welcome}=require('./_season-pass-copy.js'), drops=require('./_drops.js'), dropMail=require('./_drop-mail.js');
const drop=drops.byId('the-recipient');
const args={name:'<Client & Co>',drop,unsubscribeUrl:'https://example.com/?a=1&b=2'};
test('welcome sends preview before early access, film during access, and released page afterward',()=>{
 const before=welcome({...args,now:new Date(Date.parse(drop.early)-1)});
 assert.match(before.text,/early-access email arrives/);assert(!before.text.includes(drop.film));
 const early=welcome({...args,now:new Date(drop.early)});
 assert.match(early.text,/ready for you now/);assert(early.text.includes(drop.film));
 const after=welcome({...args,now:new Date(drop.release)});
 assert.match(after.text,/is out now/);assert(!after.text.includes(drop.film));
 for(const m of [before,early,after]){assert.match(m.text,/First-time clients/);assert.match(m.text,/eligible 15-second commercial/);assert(!/creative-sprint|rate closes/i.test(m.text));assert(!m.html.includes('<Client'));assert.match(m.html,/&lt;Client &amp; Co&gt;/);}
});
test('release note is complete, based on the film, and rejects placeholder notes',()=>{
 assert(dropMail.ready(drop));assert(!dropMail.ready({...drop,notes:[]}));assert(!dropMail.ready({...drop,takeaway:'TBD'}));
 const mail=dropMail.build(drop),text=mail.text('Client','test@example.com');
 assert.match(text,/VNMSFX spec ad/);assert.match(text,/bottle travels with the characters/);assert.match(text,/generated the image assets/);
 assert(!/\$200 million|three actors|35mm|one week|creative-sprint|rate closes/i.test(text));assert(!mail.html('<script>','test@example.com').includes('<script>'));
});
const store=require('./_lead-store.js'),handler=require('./season-pass.js');
const original={configured:store.configured,createLead:store.createLead,markDelivery:store.markDelivery,fetch:global.fetch,key:process.env.RESEND_API_KEY};
let calls,mail,persisted,duplicate,welcomeOk;
test.beforeEach(()=>{
 calls=[];mail=[];persisted=true;duplicate=false;welcomeOk=true;process.env.RESEND_API_KEY='test-only';
 store.configured=()=>true;store.createLead=async()=>{calls.push('save');return{persisted,duplicate,recordId:'test'}};
 store.markDelivery=async()=>{calls.push('mark');return true};
 global.fetch=async(url,init)=>{calls.push('mail');mail.push(JSON.parse(init.body));return{ok:welcomeOk,json:async()=>welcomeOk?{id:'test'}:{error:'offline'}}};
});
test.after(()=>{
 Object.assign(store,{configured:original.configured,createLead:original.createLead,markDelivery:original.markDelivery});global.fetch=original.fetch;
 if(original.key===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=original.key;
});
async function invoke(){const res={setHeader(){},status(n){this.code=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{origin:'https://vnmsfx.com'},body:{email:'test@example.com',drop:drop.id}},res);return res}
test('signup persists before sending the aligned welcome and notification',async()=>{const r=await invoke();assert.equal(r.code,200);assert.equal(r.body.welcomeSent,true);assert.deepEqual(calls,['save','mail','mail','mark']);assert.match(mail[0].text,/eligible 15-second commercial/);assert.equal(mail[0].to[0],'test@example.com')});
test('failed storage sends no email',async()=>{persisted=false;const r=await invoke();assert.equal(r.code,503);assert.equal(mail.length,0)});
test('duplicate signup sends no duplicate email',async()=>{duplicate=true;const r=await invoke();assert.equal(r.body.duplicate,true);assert.equal(mail.length,0)});
test('saved signup reports an email failure honestly',async()=>{welcomeOk=false;const r=await invoke();assert.equal(r.code,200);assert.equal(r.body.ok,true);assert.equal(r.body.welcomeSent,false)});
