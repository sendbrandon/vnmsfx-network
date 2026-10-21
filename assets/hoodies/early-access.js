'use strict';
(()=>{
 const dialog=document.createElement('dialog');dialog.id='early-access';dialog.setAttribute('aria-labelledby','early-title');
 dialog.innerHTML=`<div class="dialog-head"><h2 id="early-title">Pick your bad influence.</h2><button type="button" class="icon-button" aria-label="Close early access">✕</button></div><p class="early-intro">Get the first word when hoodie orders open.</p><form><label for="early-email">Email address</label><input id="early-email" name="email" type="email" autocomplete="email" maxlength="254" required><div class="early-choices"><div><label for="early-product">Your character</label><select id="early-product" name="product" required><option value="">Choose character</option><option value="nix">Nix</option><option value="rook">Rook</option></select></div><div><label for="early-size">Your size</label><select id="early-size" name="size" required><option value="">Choose size</option>${['S','M','L','XL','2XL','3XL'].map(s=>`<option>${s}</option>`).join('')}</select></div></div><div class="early-honey" aria-hidden="true"><label>Company website<input name="company_website" tabindex="-1" autocomplete="off"></label></div><label class="early-consent"><input type="checkbox" name="consent" required><span>Email me about the Saints of Bad Luck hoodie release.</span></label><button class="button dark" type="submit">Get early access <span>↗</span></button><p class="early-note">Free signup. No payment, purchase or stock reservation.</p><p id="early-status" role="status" aria-live="polite"></p></form>`;
 document.body.append(dialog);
 let epoch=0;
 const form=dialog.querySelector('form'),status=dialog.querySelector('#early-status'),submit=dialog.querySelector('[type=submit]');
 function open(product='',size='S'){form.reset();form.hidden=false;status.textContent='';submit.disabled=false;submit.innerHTML='Get early access <span>↗</span>';dialog.querySelector('#early-product').value=product;dialog.querySelector('#early-size').value=size;dialog.showModal();dialog.querySelector('#early-email').focus();}
 dialog.querySelector('.icon-button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{epoch++;submitting=false;form.reset();status.textContent='';});
 let submitting=false;
 form.addEventListener('submit',async e=>{e.preventDefault();if(submitting||!form.reportValidity())return;submitting=true;const requestEpoch=++epoch;submit.disabled=true;status.textContent='Saving your signup…';
 const data=new FormData(form);const payload={email:data.get('email'),product:data.get('product'),size:data.get('size'),consent:data.get('consent')==='on',company_website:data.get('company_website')};
 try{const res=await fetch('/api/saints-merch?action=early-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await res.json().catch(()=>{throw Error('Signups are temporarily unavailable. Please try again shortly.');});if(requestEpoch!==epoch)return;if(!res.ok||result.ok!==true||result.persisted!==true)throw Error(result.error||'We could not confirm your signup. Please try again.');form.reset();status.textContent='You’re on the list. We’ll email you when orders open.';submit.textContent='You’re on the list ✓';}
 catch(error){if(requestEpoch!==epoch)return;status.textContent=error.message||'Your signup could not be saved. Please try again.';submit.disabled=false;}
 finally{if(requestEpoch===epoch)submitting=false;}
 });
 document.querySelectorAll('.product').forEach(card=>{card.dataset.size='S';card.querySelector('[data-size="S"]').setAttribute('aria-pressed','true');});
 document.querySelectorAll('.add-bag').forEach(b=>{b.innerHTML='Get early access <span>↗</span>';});
 const header=document.querySelector('#open-bag');header.textContent='Early access';
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.matches('.add-bag,#open-bag')){e.preventDefault();e.stopImmediatePropagation();const card=b.closest('.product');open(card?.dataset.product||'',card?.dataset.size||'S');}},true);
})();
