// Simple front-end role gate. Note: this is a UI-level gate only — the JS source
// is visible to anyone with browser devtools, so do not treat it as a real security
// boundary. Move credential validation server-side for production.

const USERS = [
  { email: 'User@user.com',  password: 'User',       role: 'user',  name: 'Utility User' },
  { email: 'Admin@admin.com', password: 'M@nsangkot', role: 'admin', name: 'Administrator' },
];

const SESSION_KEY = 'niyatra_kpi_session_v1';

window.Auth = {
  current() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  },
  login(email, password) {
    const u = USERS.find(x =>
      x.email.toLowerCase() === String(email).trim().toLowerCase() && x.password === password);
    if (!u) return { ok: false, error: 'Invalid email or password' };
    const session = { email: u.email, role: u.role, name: u.name, since: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  },
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },
  is(role) {
    const s = this.current();
    return s && s.role === role;
  },
};
