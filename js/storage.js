// Local persistence + cloud-stub helpers.

const STORAGE_KEY = 'niyatra_kpi_state_v1';
const HISTORY_KEY = 'niyatra_kpi_history_v1';

window.loadState = function() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
};

window.saveState = function(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

window.loadHistory = function() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
};

window.appendHistory = function(entry) {
  const h = window.loadHistory();
  h.push(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  return h;
};

window.clearHistory = function() {
  localStorage.removeItem(HISTORY_KEY);
};

// Download Blob as file
window.downloadBlob = function(blob, filename) {
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

// Save JSON to chosen folder using File System Access API (Chromium).
window.saveToFolder = async function(filename, content, mime='application/json') {
  if (!window.showSaveFilePicker) {
    // Fallback: regular download
    const blob = new Blob([content], { type: mime });
    window.downloadBlob(blob, filename);
    return { ok: true, fallback: true };
  }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: 'KPI data', accept: { [mime]: [filename.match(/\.\w+$/)?.[0] || '.json'] } }]
    });
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return { ok: true };
  } catch (e) {
    if (e.name === 'AbortError') return { ok: false, aborted: true };
    return { ok: false, error: e.message };
  }
};

// Cloud submission. Reads endpoint from input field; if blank, exports JSON instead.
window.submitToCloud = async function(state, results, endpoint) {
  const payload = {
    submittedAt: new Date().toISOString(),
    meta: state.meta,
    inputs: state.kpiVals,
    results,
  };
  if (!endpoint) {
    // Fall back to JSON download
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const fname = `kpi-submission-${state.meta?.utility || 'utility'}-${state.meta?.year || 'year'}.json`;
    window.downloadBlob(blob, fname.replace(/\s+/g,'_'));
    return { ok: true, mode: 'json-download' };
  }
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return { ok: true, mode: 'http' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
};
