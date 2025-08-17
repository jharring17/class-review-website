// public/js/register.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form'); // matches register.handlebars
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const first = (form.firstName?.value || '').trim();
    const last = (form.lastName?.value || '').trim();
    const user = (form.username?.value || '').trim();
    const pass = (form.password?.value || '').trim();
    const confirm = (form.confirmPassword?.value || '').trim();

    const errs = [];
    if (!first) errs.push('First name is required.');
    if (!last) errs.push('Last name is required.');
    if (!user) errs.push('Username is required.');
    if (!pass) errs.push('Password is required.');
    if (pass && pass.length < 8) errs.push('Password must be at least 8 characters.');
    if (confirm && pass !== confirm) errs.push('Passwords must match.');

    if (errs.length) {
      e.preventDefault();
      alert(errs.join('\n'));
    }
  });
});
