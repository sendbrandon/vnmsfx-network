'use strict';
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',weekday:'long',month:'long',day:'numeric',hour:'numeric'}).format(new Date(value)) + ' ET';
function welcome({name,drop,unsubscribeUrl,now = new Date()}) {
  const page = 'https://vnmsfx.com/drops/' + drop.id;
  const early = new Date(drop.early), released = new Date(drop.release);
  const timing = now < early
    ? `${drop.title}: your early-access email arrives ${date(early)}. Public release: ${date(released)}.`
    : now < released
      ? `${drop.title} is ready for you now. Public release: ${date(released)}.`
      : `${drop.title} is out now. Future early-access releases will arrive by email.`;
  const url = now >= early && now < released ? 'https://vnmsfx.com' + drop.film : page;
  const cta = now < early ? 'See the preview' : 'Watch the ad';
  const blocks = [
    ['Watch first.','New releases arrive 24 hours before the public release.'],
    ['See how I made it.','The idea, the opening, and the choices behind the finished ad.'],
    ['Save $500 on your first ad.','First-time clients get an eligible 15-second commercial for $1,500 instead of $2,000. We agree the scope, eligibility and delivery date before payment.']
  ];
  const subject = "You’re in — your VNMSFX Season Pass";
  const text = `Hi ${name || 'there'},\n\nYou’re on the free VNMSFX Season Pass.\n\n${blocks.map(([h,p])=>h+'\n'+p).join('\n\n')}\n\n${timing}\n${cta}: ${url}\n\nHave a product in mind? Tell me what you want the ad to do:\nhttps://vnmsfx.com/#project-inquiry\n\nBrandon Adams\nFounder, VNMSFX\n\nNew ads and production notes by email. Unsubscribe: ${unsubscribeUrl}`;
  const html = `<!doctype html><html><body style="margin:0;background:#101010;color:#fff;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;padding:32px 24px"><p style="color:#d9ff5d;font-size:14px">FREE VNMSFX SEASON PASS</p><h1 style="font-size:40px;margin:14px 0 24px">YOU’RE IN.</h1><p style="font-size:17px;line-height:1.5">Hi ${esc(name || 'there')}, here’s what you get:</p>${blocks.map(([h,p])=>`<section style="border-top:1px solid #444;margin-top:22px;padding-top:18px"><h2 style="font-size:22px;margin:0 0 8px">${esc(h)}</h2><p style="font-size:16px;line-height:1.5;margin:0;color:#ddd">${esc(p)}</p></section>`).join('')}<p style="font-size:17px;line-height:1.5;margin-top:28px">${esc(timing)}</p><a href="${esc(url)}" style="display:inline-block;background:#d9ff5d;color:#101010;padding:15px 20px;text-decoration:none;font-weight:bold">${cta} ↗</a><p style="font-size:16px;line-height:1.5;margin-top:28px">Have a product in mind? <a href="https://vnmsfx.com/#project-inquiry" style="color:#d9ff5d">Tell me what you want the ad to do.</a></p><p style="font-size:16px;line-height:1.5;margin-top:28px"><strong>Brandon Adams</strong><br>Founder, VNMSFX</p><p style="font-size:13px;color:#aaa;line-height:1.5;margin-top:32px">New ads and production notes by email. <a href="${esc(unsubscribeUrl)}" style="color:#aaa">Unsubscribe</a>.</p></div></body></html>`;
  return {subject,text,html};
}
module.exports = {welcome};
