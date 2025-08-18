document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const first = (form.firstName?.value || '').trim();
    const last = (form.lastName?.value || '').trim();
    const user = (form.username?.value || '').trim();
    const pass = (form.password?.value || '').trim();
    const confirm = (form.confirmPassword?.value || '').trim();
    const role = (form.role?.value || '').trim();
    const bio = (form.bio?.value || '').trim();
    const imgLink = (form.imgLink?.value || '').trim();

    // Basic validation
    if (!first || !last || !user || !pass || !confirm) {
      e.preventDefault();
      alert('First name, Last name, Username, Password, and Confirm Password are required.');
      return;
    }

    if (pass !== confirm) {
      e.preventDefault();
      alert('Passwords do not match.');
      return;
    }

    if (role && !['user', 'superuser'].includes(role.toLowerCase())) {
      e.preventDefault();
      alert('Role must be either "user" or "superuser".');
      return;
    }

    if (imgLink && !/^https?:\/\/.+/i.test(imgLink)) {
      e.preventDefault();
      alert('Image link must be a valid URL starting with http or https.');
      return;
    }

    // Bio is optional but if present, should not exceed 300 chars
    if (bio && bio.length > 300) {
      e.preventDefault();
      alert('Bio must not exceed 300 characters.');
      return;
    }
  });
});
