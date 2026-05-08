// Front-end role gate. Credentials are stored as salted SHA-256 hashes — the raw
// passwords do not appear in the source. NOTE: this is a UI-level gate only.
// In production, enforce credential checks on a server.

const SALT = 'niyatra-kpi-2026';

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

// Pure-JS SHA-256. Works in any browser (no Web Crypto / HTTPS dependency).
// ASCII-only inputs, which suffices for our salt+password.
function sha256(ascii) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const maxWord = Math.pow(2, 32);
  let result = '', words = [], asciiBitLength = ascii.length * 8;
  let hash = [], k = [], primeCounter = 0;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++]  = (Math.pow(candidate, 1/3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return null;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength);
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16), oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
                  + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

window.Auth = {
  current() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  },
  login(email, password) {
    const e = String(email).trim().toLowerCase();
    const u = USERS.find(x => x.email.toLowerCase() === e);
    if (!u) return { ok: false, error: 'Invalid email or password' };
    const h = sha256(SALT + ':' + String(password));
    if (h !== u.hash) return { ok: false, error: 'Invalid email or password' };
    const session = { email: u.email, role: u.role, name: u.name, since: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { ok: true, session };
  },
  logout() { sessionStorage.removeItem(SESSION_KEY); },
  is(role) { const s = this.current(); return s && s.role === role; },
};
