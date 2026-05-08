// Front-end role gate. Credentials are stored as salted SHA-256 hashes — the raw
// passwords do not appear in the source. Note: this still runs entirely in the
// browser, so a determined attacker can read the hashes and brute-force them.
// Move credential validation server-side for true security.

const SALT = 'niyatra-kpi-2026';

// salted SHA-256 of the configured password (lowercase hex)
const USERS = [
  { email: 'User@user.com',
    role:  'user',
    name:  'Utility User',
    hash:  '45c208a3b943194fe1a4fb69c9996641eb9fed9f150726b7d6e9bbdf4047c2e9' },
  { email: 'Admin@admin.com',
    role:  'admin',
    name:  'Administrator',
    hash:  'a443e40ad7d489bbfda5463abd1d92dafefbbfc12c2dd1684a18abef47835c55' },
];

const SESSION_KEY = 'niyatra_kpi_session_v1';

async function sha256hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

window.Auth = {
  current() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  },
  async login(email, password) {
    const e = String(email).trim().toLowerCase();
    const u = USERS.find(x => x.email.toLowerCase() === e);
    if (!u) return { ok: false, error: 'Invalid email or password' };
    let h = '';
    try { h = await sha256hex(SALT + ':' + String(password)); }
    catch { return { ok: false, error: 'Browser does not support secure auth.' }; }
    if (h !== u.hash) return { ok: false, error: 'Invalid email or password' };
    const session = { email: u.email, role: u.role, name: u.name, since: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  },
  logout() { sessionStorage.removeItem(SESSION_KEY); },
  is(role) { const s = this.current(); return s && s.role === role; },
};
