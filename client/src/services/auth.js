// LoginForm already stores these two keys on successful login -
// this module just gives the rest of the app a clean way to read them.

export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return !!getToken() && !!getCurrentUser();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Convenience: returns the axios Authorization header object
export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
