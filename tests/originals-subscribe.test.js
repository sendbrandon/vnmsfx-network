'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../api/_lead-store');
const handler = require('../api/originals-subscribe');
const valid = {email:'fan@example.com',shows:['satire','horror','saints'],source:'originals'};
async function request(body=valid, options={}) {
  const req={method:'POST',headers:{origin:'https://vnmsfx.com','content-type':'application/json'},body,...options};
  const result={headers:{}};
  const res={setHeader(k,v){result.headers[k]=v},status(code){result.status=code;return this},json(body){result.body=body;return this}};
  await handler(req,res);return result;
}
test('valid sign-up is normalized, privately stored and only then acknowledged',async t=>{
  let recorded;t.mock.method(store,'configured',()=>true);t.mock.method(store,'createLead',async lead=>{recorded=lead;return {persisted:true,recordId:'private-record'}});
  const result=await request({...valid,email:'  FAN@EXAMPLE.COM ',shows:['satire','satire','horror']});
  assert.equal(result.status,200);assert.equal(result.body.persisted,true);assert.equal(recorded.email,'fan@example.com');
  assert.equal(recorded.channelLabel,'VNMSFX Originals');assert.equal(recorded.campaign,'originals-new-episodes');assert.equal(recorded.contentId,'free:horror+satire');
  assert.notEqual(recorded.channelLabel,'Season Pass');assert.equal(result.body.recordId,undefined);assert.equal(result.headers['Cache-Control'],'no-store');
});
test('same email signs up once',async t=>{
  const ids=[];t.mock.method(store,'configured',()=>true);t.mock.method(store,'createLead',async lead=>{ids.push(lead.submissionId);return {persisted:true}});
  await request();await request({...valid,email:'Fan@Example.com',shows:['saints']});
  assert.equal(ids[0],ids[1]);
});
test('invalid email, shows and honeypot never reach storage',async t=>{
  const save=t.mock.method(store,'createLead',async()=>{throw new Error('unexpected write')});
  for(const change of [{email:''},{email:'bad'},{email:5},{shows:[]},{shows:'satire'},{shows:['unknown']},{shows:['toString']},{company_website:'spam'},{tier:'gold'},{tier:5}]){
    const result=await request({...valid,...change});assert.equal(result.status,400,JSON.stringify(change));assert.equal(result.body.ok,false);
  }
  assert.equal(save.mock.callCount(),0);
});
test('bad origin, media type, body and method are rejected',async t=>{
  const save=t.mock.method(store,'createLead',async()=>{throw new Error('unexpected write')});
  assert.equal((await request(valid,{headers:{origin:'https://other.example','content-type':'application/json'}})).status,403);
  assert.equal((await request(valid,{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await request('{bad')).status,400);assert.equal((await request([])).status,400);
  assert.equal((await request({...valid,extra:'x'.repeat(4001)})).status,413);
  assert.equal((await request(valid,{method:'DELETE'})).status,405);assert.equal(save.mock.callCount(),0);
});
test('store unavailable or failed never claims the sign-up',async t=>{
  const config=t.mock.method(store,'configured',()=>false);
  assert.equal((await request()).status,503);
  config.mock.mockImplementation(()=>true);
  t.mock.method(store,'createLead',async()=>({persisted:false}));
  const failed=await request();assert.equal(failed.status,503);assert.equal(failed.body.ok,false);
});
test('VIP is a separate reservation that takes no payment',async t=>{
  const leads=[];t.mock.method(store,'configured',()=>true);t.mock.method(store,'createLead',async lead=>{leads.push(lead);return {persisted:true}});
  const vip=await request({...valid,tier:'vip'});await request(valid);
  assert.equal(vip.body.tier,'vip');assert.equal(leads[0].channelLabel,'VNMSFX Originals VIP');assert.equal(leads[0].campaign,'originals-vip-reserve');
  assert.match(leads[0].transcriptText,/no charge taken/);assert.notEqual(leads[0].submissionId,leads[1].submissionId);
});
