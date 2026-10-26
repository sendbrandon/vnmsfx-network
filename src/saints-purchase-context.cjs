const plans=Object.freeze({
 monthly:{name:'Monthly membership',price:'$7.99 / month',terms:'Billed monthly. Renews automatically. Cancel before renewal.',membership:true},
 six:{name:'6-month membership',price:'$39.99 / 6 months',terms:'Billed every 6 months. Renews automatically. Cancel before renewal.',membership:true},
 annual:{name:'Annual membership',price:'$69.99 / year',terms:'Billed annually. Renews automatically. Cancel before renewal.',membership:true},
 'saints-02':{name:'Episode 2 — Before the Bad Luck',price:'$2.99',terms:'One episode. No recurring subscription.',membership:false}
});
const KEY='saints-checkout-intent',TTL=60*60*1000;
function planFor(sku){return Object.hasOwn(plans,sku)?plans[sku]:null;}
function readIntent(storage,now=Date.now()){try{const value=JSON.parse(storage.getItem(KEY)||'null');return value&&planFor(value.sku)&&Number.isFinite(value.createdAt)&&now>=value.createdAt&&now-value.createdAt<TTL?value.sku:null;}catch{return null;}}
function rememberIntent(storage,sku,now=Date.now()){if(!planFor(sku))return;try{storage.setItem(KEY,JSON.stringify({sku,createdAt:now}));}catch{}}
function clearIntent(storage){try{storage.removeItem(KEY);}catch{}}
function resolveIntent(params,hash,storage,now=Date.now()){
 if(params.has('checkout')){clearIntent(storage);return null;}
 const requested=params.get('purchase');if(planFor(requested)){rememberIntent(storage,requested,now);return requested;}
 // Only auth callbacks may resume a saved intent. Ordinary library visits stay library visits.
 if(params.has('token_hash')||params.has('code')||params.has('error')||new URLSearchParams(hash.replace(/^#/, '')).has('access_token')||new URLSearchParams(hash.replace(/^#/, '')).has('error'))return readIntent(storage,now);
 return null;
}
module.exports={plans,planFor,readIntent,rememberIntent,clearIntent,resolveIntent};
