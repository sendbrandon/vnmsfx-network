(() => {
  'use strict';
  const form = document.querySelector('#club-form');
  const submit = form.querySelector('[type="submit"]');
  const error = document.querySelector('#club-error');
  const success = document.querySelector('#club-success');
  const roles = [...form.querySelectorAll('[name="roles"]')];
  const validateRoles = () => roles[0].setCustomValidity(roles.some(input => input.checked) ? '' : 'Choose at least one way you would enjoy taking part.');
  roles.forEach(input => input.addEventListener('change', validateRoles));
  validateRoles();
  let sending = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !form.reportValidity()) return;
    sending = true;
    error.hidden = true;
    submit.disabled = true;
    submit.textContent = 'Sending your application…';
    form.setAttribute('aria-busy', 'true');
    const values = new FormData(form);
    const payload = {
      name: values.get('name'), email: values.get('email'), moment: values.get('moment'),
      roles: values.getAll('roles'), social: values.get('social'),
      consent: values.get('consent') === 'on', company_website: values.get('company_website')
    };
    try {
      const response = await fetch('/api/saints-club', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload), signal: AbortSignal.timeout(25000)
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok || !result.persisted) throw new Error(result?.error || 'We couldn’t confirm your application was saved. Please try again.');
      form.hidden = true;
      success.hidden = false;
      document.querySelector('#club-reference').textContent = 'Your reference: ' + result.submissionId;
      success.focus({preventScroll: true});
      success.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
    } catch (problem) {
      error.textContent = problem.name === 'TimeoutError' || problem.name === 'AbortError'
        ? 'The connection timed out. Your answers are still here. Please try again; repeat submissions are checked against your saved application.'
        : problem instanceof TypeError ? 'We couldn’t connect. Your answers are still here. Please try again, or email brandon@vnmsfx.com.' : problem.message;
      error.hidden = false;
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = 'Send my application ↗';
      form.removeAttribute('aria-busy');
    }
  });
})();
