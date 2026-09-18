/* Product visuals packages — standalone page. Stripe links come from checkout-links.js. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const packDialog = $('#pack-dialog');
  const closePanels = () => {}; const preview = { pause(){} }; const updatePreview = () => {};
  const packages = {
    spotlight: {name:'Product Spotlight',price:49,days:3,summary:'One finished product image, with two alternate layouts of that same image.',math:'3 layouts × 2 sizes = 6 image files.',items:['One main product image','Two alternate layouts using that artwork','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One consolidated minor revision']},
    set: {name:'Product Set',price:99,days:3,summary:'Three distinct product images in one coordinated look, with two alternate layouts of the main image.',math:'3 product images + 2 alternate layouts = 5 layouts. Each in 2 sizes = 10 image files.',items:['Three distinct images of the same supplied product','Two alternate layouts of the main image','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One consolidated minor revision across the set']},
    motion: {name:'Product Set + Motion',price:149,days:5,summary:'The complete Product Set, plus a six-second vertical video made from the main image.',math:'5 layouts × 2 sizes = 10 image files, plus 1 video.',items:['Three distinct product images + two alternate layouts of the main image','Every layout in feed (4:5) and Story/Reel (9:16) sizes','One 6-second vertical video with camera or background movement; product unchanged','One consolidated minor revision across the set; music excluded']},
    launch: {name:'Launch Set',price:450,days:5,summary:'A coordinated launch set for one product and one agreed look, with feed images, motion and a Story cutdown.',math:'8 image files + 2 motion files + 1 Story cut.',items:['Eight image files in one coordinated look','Copy direction for the three ready-to-post feed images','Two 6-second motion loops: hero and alternate','One Story-format cutdown','Two rounds of minor revisions']}
  };
  // A signed-in account is not a working purchase link. Only verified live bindings expose Buy.
  function checkoutFor(key) {
    const config=window.VNMSFX_CHECKOUT, binding=config?.packages?.[key], pack=packages[key];
    if(config?.enabled!==true || config.account!=='acct_1PwcwWP2E4gRJNvG' || !pack || !binding || binding.verified!==true || binding.mode!=='live' || binding.currency!=='usd' || binding.amount!==pack.price*100 || typeof binding.url!=='string') return null;
    try {
      const url=new URL(binding.url);
      if(url.protocol!=='https:' || url.hostname!=='buy.stripe.com' || url.port || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9]{12,}$/.test(url.pathname)) return null;
      return url.href;
    } catch { return null; }
  }
  let livePacks=0;
  document.querySelectorAll('[data-checkout-key]').forEach(link=>{
    const key=link.dataset.checkoutKey, url=checkoutFor(key);
    if(!url)return;
    link.href=url;link.hidden=false;livePacks++;
    const details=document.querySelector(`[data-pack="${key}"]`);
    details.classList.add('pack-details-link');
  });
  const setupNote=$('.pack-checkout-note').textContent;
  if(livePacks) $('.starter-status').textContent=livePacks===Object.keys(packages).length
    ? 'One-time payment through Stripe. Send your product photo and brief after payment.'
    : 'Packages with a Buy button accept one-time payment through Stripe. Other packages remain available by inquiry.';
  let packOpener=null;
  const keepPair=text=>text.replace(/ (\S+)$/, '\u00a0$1');
  document.querySelectorAll('[data-pack]').forEach(button=>button.addEventListener('click',()=>{
    const pack=packages[button.dataset.pack];if(!pack)return;
    packOpener=button;closePanels();preview.pause();
    $('#pack-dialog-title').textContent=keepPair(pack.name);
    $('#pack-dialog-price').textContent=`$${pack.price} · one-time · USD`;
    $('#pack-dialog-summary').textContent=keepPair(pack.summary);
    $('#pack-dialog-math').textContent=keepPair(pack.math);
    $('#pack-dialog-delivery').textContent=keepPair(`Delivery: ${pack.days} business days after usable assets and your complete brief arrive.`);
    const list=$('#pack-dialog-deliverables');list.replaceChildren(...pack.items.map(item=>{const li=document.createElement('li');li.textContent=keepPair(item);return li;}));
    const subject=`VNMSFX TV — ${pack.name} ($${pack.price})`;
    const body=`Hi Brandon,\n\nI'm interested in ${pack.name} at $${pack.price}.\n\nProduct / website:\nProduct photo link (or I can attach it):\nWhere I want to post it:\nAny approved words or deadline (optional):\n\nPlease confirm suitability, timing and order terms before payment.\n`;
    $('#pack-email').href=`mailto:brandon@vnmsfx.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const checkout=checkoutFor(button.dataset.pack), checkoutLink=$('#pack-checkout');
    checkoutLink.hidden=!checkout;
    if(checkout){checkoutLink.href=checkout;checkoutLink.textContent=`Buy the $${pack.price} package →`;}else checkoutLink.removeAttribute('href');
    $('.pack-checkout-note').textContent=checkout
      ? 'Continue to Stripe to pay once for this package. After payment, Stripe shows how to send your product photo and brief to Brandon. No subscription.'
      : setupNote;

    packDialog.showModal();document.body.classList.add('modal-open');
  }));
  $('#close-pack').addEventListener('click',()=>packDialog.close());
  packDialog.addEventListener('click',e=>{if(e.target!==packDialog)return;const r=packDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)packDialog.close();});
  packDialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');packOpener?.focus({preventScroll:true});updatePreview();});
})();
