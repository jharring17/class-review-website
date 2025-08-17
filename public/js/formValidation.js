document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    let username = form.username.value.trim();
    let password = form.password.value.trim();

    if (!username || !password) {
      e.preventDefault();
      alert("Both username and password are required.");
    }
  });
});
