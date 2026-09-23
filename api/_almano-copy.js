'use strict';
// Almano enrollment confirmation. In-world copy, VNMSFX creative direction (ink, paper, acid, mono eyebrows).
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function confirmation({ name, applicationId, kin, birthYear, day, unsubscribeUrl }) {
  const first = String(name || '').trim().split(/\s+/)[0] || 'Applicant';
  const dayLabel = day ? 'Day ' + day + ' of county review' : 'County review in progress';
  const subject = 'Almano — Application ' + applicationId + ' received';
  const page = 'https://vnmsfx.com/almano';

  const text = [
    'ALMANO LIFE EXTENSION · EST. 1998',
    '',
    'Dear ' + first + ',',
    '',
    'Almano has received your enrollment application.',
    '',
    'Application number: ' + applicationId,
    'Year of birth: ' + (birthYear || '—'),
    'Next of kin on file: ' + (kin || '—'),
    '',
    'WHAT HAPPENS NOW',
    'Your application has been placed in the enrollment queue in the order it was received. A Steward will contact you when capacity becomes available. Please do not travel to the facility until you are contacted.',
    '',
    'THE COUNTY REVIEW',
    dayLabel + '. Almano does not disconnect a client. Follow the review: ' + page,
    '',
    'Almano thanks you for your patience.',
    '',
    '— The Steward',
    'Almano Life Extension',
    '',
    'Almano is a fictional company from an original series by VNMSFX. This email is part of the story; no service is offered and nothing has been purchased.',
    unsubscribeUrl ? 'Stop these emails: ' + unsubscribeUrl : '',
  ].join('\n');

  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#101010;color:#ffffff;font-family:Archivo,Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#101010"><tr><td align="center" style="padding:0">
<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%">
  <tr><td style="padding:28px 28px 0"><table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="font:700 13px/1 'Courier New',Courier,monospace;letter-spacing:.12em;color:#ffffff">ALMANO</td><td style="padding-left:12px;font:11px/1 'Courier New',Courier,monospace;letter-spacing:.08em;color:#8a8a8a">LIFE EXTENSION · EST. 1998</td></tr></table></td></tr>
  <tr><td style="padding:18px 28px 0"><a href="${page}" style="display:block"><img src="https://vnmsfx.com/almano/media/share.jpg" width="544" alt="The Almano Steward saluting in the lobby" style="display:block;width:100%;max-width:544px;height:auto;border:0;background:#101311"></a></td></tr>
  <tr><td style="padding:36px 28px 0"><p style="margin:0 0 14px;font:11px/1.5 'Courier New',Courier,monospace;letter-spacing:.08em;color:#aaaaaa">APPLICATION RECEIVED</p>
    <h1 style="margin:0;font:400 44px/1.02 Impact,'Anton','Arial Narrow',Arial,sans-serif;letter-spacing:-.01em;color:#ffffff;text-transform:uppercase">Your Steward<br>will be in touch.</h1></td></tr>
  <tr><td style="padding:26px 28px 0"><p style="margin:0;font:400 17px/1.5 Archivo,Arial,sans-serif;color:#dddddd">Dear ${esc(first)}, Almano has received your enrollment application. It has been placed in the queue in the order it was received.</p></td></tr>
  <tr><td style="padding:26px 28px 0">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #2e2e2e;background:#0c0c0c">
      <tr><td style="padding:18px 20px;border-bottom:1px solid #2e2e2e"><p style="margin:0 0 6px;font:11px/1.5 'Courier New',Courier,monospace;letter-spacing:.08em;color:#aaaaaa">APPLICATION NUMBER</p><p style="margin:0;font:400 34px/1 Impact,'Anton','Arial Narrow',Arial,sans-serif;color:#d9ff5d;letter-spacing:.02em">${esc(applicationId)}</p></td></tr>
      <tr><td style="padding:16px 20px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font:400 14px/1.6 Archivo,Arial,sans-serif;color:#dddddd">
        <tr><td style="color:#8a8a8a;width:46%">Year of birth</td><td>${esc(birthYear || '—')}</td></tr>
        <tr><td style="color:#8a8a8a">Next of kin on file</td><td>${esc(kin || '—')}</td></tr>
        <tr><td style="color:#8a8a8a">Status</td><td>In queue · awaiting capacity</td></tr>
      </table></td></tr>
    </table></td></tr>
  <tr><td style="padding:34px 28px 0"><p style="margin:0 0 10px;font:11px/1.5 'Courier New',Courier,monospace;letter-spacing:.08em;color:#aaaaaa">WHAT HAPPENS NOW</p><p style="margin:0;font:400 16px/1.55 Archivo,Arial,sans-serif;color:#dddddd">A Steward will contact you when capacity becomes available. Please do not travel to the facility until you are contacted. Tours run at 10 and 2.</p></td></tr>
  <tr><td style="padding:26px 28px 0"><p style="margin:0 0 10px;font:11px/1.5 'Courier New',Courier,monospace;letter-spacing:.08em;color:#aaaaaa">THE COUNTY REVIEW</p><p style="margin:0;font:400 16px/1.55 Archivo,Arial,sans-serif;color:#dddddd"><strong style="color:#ffffff">${esc(dayLabel)}.</strong> Almano does not disconnect a client.</p></td></tr>
  <tr><td style="padding:26px 28px 0"><a href="${page}" style="display:inline-block;background:#d9ff5d;color:#111111;text-decoration:none;font:700 15px/1 Archivo,Arial,sans-serif;padding:16px 22px">Follow the review ↗</a></td></tr>
  <tr><td style="padding:40px 28px 0"><p style="margin:0;font:400 16px/1.5 Archivo,Arial,sans-serif;color:#dddddd">Almano thanks you for your patience.</p><p style="margin:16px 0 0;font:400 15px/1.5 Archivo,Arial,sans-serif;color:#ffffff">— The Steward<br><span style="color:#8a8a8a">Almano Life Extension</span></p></td></tr>
  <tr><td style="padding:40px 28px 36px"><hr style="border:0;border-top:1px solid #2e2e2e;margin:0 0 18px"><p style="margin:0;font:400 12px/1.6 Archivo,Arial,sans-serif;color:#8a8a8a">Almano is a fictional company from an original series by <a href="https://vnmsfx.com" style="color:#aaaaaa">VNMSFX</a>. This email is part of the story; no service is offered and nothing has been purchased.${unsubscribeUrl ? ' <a href="' + esc(unsubscribeUrl) + '" style="color:#aaaaaa">Stop these emails.</a>' : ''}</p></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
module.exports = { confirmation };
