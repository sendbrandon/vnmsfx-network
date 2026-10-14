'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../api/_lead-store');
const handler = require('../api/saints-club');
const valid = {name:'A Film Fan',email:'fan@example.com',moment:'Brick going back with Nix.',roles:['share'],social:'',consent:true};
async function request(body=valid, options={}) {
  const req={method:'POST',headers:{origin:'https://vnmsfx.com','content-type':'application/json'},body,...options};
  const result={headers:{}};
  const res={setHeader(k,v){result.headers[k]=v},status(code){result.status=code;return this},json(body){result.body=body;return this}};
  await handler(req,res);return result;
}
test('valid application is normalized, privately stored and only then acknowledged',async t=>{
  let recorded;t.mock.method(store,'configured',()=>true);t.mock.method(store,'createLead',async lead=>{recorded=lead;return {persisted:true,recordId:'private-record'}});
  const result=await request({...valid,name:'  A Film Fan  ',email:'FAN@EXAMPLE.COM',roles:['share','create','share']});
  assert.equal(result.status,200);assert.equal(result.body.persisted,true);assert.equal(recorded.firstName,'A Film Fan');assert.equal(recorded.email,'fan@example.com');
  assert.equal(recorded.channelLabel,'Bad Luck Club');assert.equal(recorded.source,'saints-of-bad-luck/club');assert.match(recorded.transcriptText,/Consent: may email/);assert.match(recorded.transcriptText,/Make something; Share the film/);
  assert.equal(result.body.recordId,undefined);assert.equal(result.body.email,undefined);assert.equal(result.headers['Cache-Control'],'no-store');
});
test('invalid fields, missing consent and unwanted roles never reach storage',async t=>{
  const save=t.mock.method(store,'createLead',async()=>{throw new Error('unexpected write')});
  for(const change of [{name:''},{email:'bad'},{moment:''},{roles:[]},{roles:['unknown']},{roles:['toString']},{roles:'share'},{consent:false},{name:'one\ntwo'},{moment:'a'.repeat(1401)},{company_website:'spam'}]){
    const result=await request({...valid,...change});assert.equal(result.status,400,JSON.stringify(change));assert.equal(result.body.ok,false);
  }
  assert.equal(save.mock.callCount(),0);
});
test('bad origin, media type, body and method are rejected',async t=>{
  const save=t.mock.method(store,'createLead',async()=>{throw new Error('unexpected write')});
  assert.equal((await request(valid,{headers:{origin:'https://other.example','content-type':'application/json'}})).status,403);
  assert.equal((await request(valid,{headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await request('{bad')).status,400);assert.equal((await request([])).status,400);
  assert.equal((await request({...valid,extra:'x'.repeat(12001)})).status,413);
  assert.equal((await request(valid,{method:'DELETE'})).status,405);assert.equal(save.mock.callCount(),0);
});
test('store unavailable or failed never returns a saved application',async t=>{
  const config=t.mock.method(store,'configured',()=>false);
  assert.equal((await request()).status,503);
  config.mock.mockImplementation(()=>true);
  const save=t.mock.method(store,'createLead',async()=>({persisted:false}));
  assert.equal((await request()).body.ok,false);
  save.mock.mockImplementation(async()=>{throw new Error('provider down')});
  t.mock.method(console,'error',()=>{});const failed=await request();assert.equal(failed.status,503);assert.equal(failed.body.persisted,undefined);
});
test('equivalent retries produce one stable store fingerprint',async t=>{
  const records=new Map();t.mock.method(store,'configured',()=>true);t.mock.method(store,'createLead',async lead=>{records.set(lead.fingerprint,lead);return {persisted:true}});
  const first=await request({...valid,roles:['create','share']});const second=await request({...valid,email:'FAN@EXAMPLE.COM',roles:['share','create','share']});
  assert.equal(first.body.submissionId,second.body.submissionId);assert.equal(records.size,1);
});
test('availability endpoint exposes only readiness',async t=>{
  t.mock.method(store,'configured',()=>true);assert.deepEqual((await request(undefined,{method:'GET'})).body,{acceptingApplications:true});
});
