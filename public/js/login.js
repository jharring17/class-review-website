import { validUsername, validPassword } from './validators.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-errors');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const errs = [];
    try { validUsername(form.username.value); } catch (err) { errs.push(err); }
    try { validPassword(form.password.value); } catch (err) { errs.push(err); }

    if (errs.length) {
      e.preventDefault();
      if (errorBox) {
        errorBox.hidden = false;
        errorBox.innerHTML = `<ul>${errs.map(x => `<li>${x}</li>`).join('')}</ul>`;
      } else {
        alert(errs.join('\n'));
      }
    }
  });
});
