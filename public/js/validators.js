export function notEmpty(value, field) {
  if (value === undefined || value === null) throw `${field} is required`;
  if (typeof value !== 'string') value = String(value);
  if (!value.trim()) throw `${field} is required`;
  return value.trim();
}

export function validUsername(value) {
  value = notEmpty(value, 'Username');
  if (!/^[a-z0-9_]{3,25}$/i.test(value)) throw 'Username must be 3–25 letters/numbers/_';
  return value;
}

export function validPassword(value) {
  value = notEmpty(value, 'Password');
  if (value.length < 8) throw 'Password must be at least 8 characters';
  return value;
}
