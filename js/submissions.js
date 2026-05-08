// Cross-user submission store. Each user "submission" is a snapshot of their
// metadata + inputs + computed results, keyed by utility + year + timestamp.
// Stored in localStorage so the admin (on the same browser) can list/inspect them.
// For multi-device admin access, point a backend at the cloud endpoint and POST there.

const SUB_KEY = 'niyatra_kpi_submissions_v1';

window.Submissions = {
  list() {
    try { return JSON.parse(localStorage.getItem(SUB_KEY)) || []; }
    catch { return []; }
  },
  save(record) {
    const all = this.list();
    record.id = record.id || `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    record.savedAt = record.savedAt || new Date().toISOString();
    all.push(record);
    localStorage.setItem(SUB_KEY, JSON.stringify(all));
    return record;
  },
  remove(id) {
    const all = this.list().filter(r => r.id !== id);
    localStorage.setItem(SUB_KEY, JSON.stringify(all));
  },
  clearAll() {
    localStorage.removeItem(SUB_KEY);
  },
  get(id) {
    return this.list().find(r => r.id === id) || null;
  },
};
