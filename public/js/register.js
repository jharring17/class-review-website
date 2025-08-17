document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const first = (form.firstName?.value || '').trim();
    const last  = (form.lastName?.value || '').trim();
    const user  = (form.username?.value || '').trim();
    const pass  = (form.password?.value || '').trim();

    if (!first || !last || !user || !pass) {
      e.preventDefault();
      alert('First name, Last name, Username, and Password are required.');
    }
  });
});
