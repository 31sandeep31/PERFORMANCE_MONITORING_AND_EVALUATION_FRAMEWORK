// Orchestrator: login gating, user form view, admin dashboard view.

const state = {
  meta: { utility: '', municipality: '', province: '', areaType: 'urban',
          year: new Date().getFullYear(), submittedBy: '' },
  kpiVals: {},
};
let history = [];
const STATE_KEY_FOR = (email) => `niyatra_kpi_state_v1::${email || 'anon'}`;
const HISTORY_KEY_FOR = (email) => `niyatra_kpi_history_v1::${email || 'anon'}`;

function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function el(tag, attrs={}, ...children) {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}
function flash(msg, isError=false) {
  const f = $('#flash'); if (!f) return;
  f.textContent = msg;
  f.className = 'flash' + (isError ? ' err' : ' ok');
  f.style.display = 'block';
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { f.style.display = 'none'; }, 2800);
}

// Override storage helpers to scope per-user
window.loadState = function() {
  const s = window.Auth.current();
  try {
    const raw = localStorage.getItem(STATE_KEY_FOR(s?.email));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
window.saveState = function(st) {
  const s = window.Auth.current();
  localStorage.setItem(STATE_KEY_FOR(s?.email), JSON.stringify(st));
};
window.loadHistory = function() {
  const s = window.Auth.current();
  try {
    const raw = localStorage.getItem(HISTORY_KEY_FOR(s?.email));
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
window.appendHistory = function(entry) {
  const s = window.Auth.current();
  const h = window.loadHistory();
  h.push(entry);
  localStorage.setItem(HISTORY_KEY_FOR(s?.email), JSON.stringify(h));
  return h;
};
window.clearHistory = function() {
  const s = window.Auth.current();
  localStorage.removeItem(HISTORY_KEY_FOR(s?.email));
};

// ---------- Routing ----------
function showView(which) {
  for (const id of ['login-view','app-view','admin-view']) {
    document.getElementById(id).hidden = (id !== which);
  }
}

function bootForRole() {
  const s = window.Auth.current();
  if (!s) { showView('login-view'); return; }
  if (s.role === 'admin') { showView('admin-view'); bootAdmin(s); }
  else { showView('app-view'); bootUser(s); }
}

// ---------- Login ----------
function wireLogin() {
  const form = $('#login-form');
  const handleLogin = (ev) => {
    if (ev) ev.preventDefault();
    const email = $('#login-email').value;
    const pwd   = $('#login-password').value;
    const errBox = $('#login-error');
    const r = window.Auth.login(email, pwd);
    if (!r.ok) {
      errBox.textContent = r.error;
      errBox.hidden = false;
      return false;
    }
    errBox.hidden = true;
    bootForRole();
    return false;
  };
  form.addEventListener('submit', handleLogin);
  // Defensive: also attach to the button click in case the form's submit event
  // is intercepted somewhere up the chain.
  form.querySelector('button[type="submit"]')
      .addEventListener('click', (ev) => { handleLogin(ev); });
}
function wireLogout() {
  for (const id of ['btn-logout','btn-logout-2']) {
    const b = document.getElementById(id);
    if (b) b.addEventListener('click', () => {
      window.Auth.logout();
      // Reset working state so the next login starts clean view
      Object.assign(state, { meta:{ utility:'', municipality:'', province:'', areaType:'urban',
        year: new Date().getFullYear(), submittedBy:'' }, kpiVals:{} });
      history = [];
      bootForRole();
    });
  }
}

// ---------- User View ----------
function bootUser(session) {
  $('#who').textContent = `${session.name}  •  ${session.email}`;
  // Hydrate per-user state
  const saved = window.loadState();
  if (saved) Object.assign(state, saved);
  history = window.loadHistory();
  renderMeta(); renderKpis(); renderHistoryList(); wireToolbar(); recompute();
}

function renderMeta() {
  const m = state.meta;
  const root = $('#meta');
  root.innerHTML = '';
  const fields = [
    ['utility',     'meta_utility'],
    ['municipality','meta_municipality'],
    ['province',    'meta_province'],
    ['year',        'meta_year'],
    ['submittedBy', 'meta_submitted_by'],
  ];
  for (const [k, key] of fields) {
    const label = window.I18N.t(key);
    const inp = el('input', { type: 'text', value: m[k] || '', placeholder: label });
    inp.addEventListener('input', () => { m[k] = inp.value; window.saveState(state); });
    root.appendChild(el('label', { class: 'meta-field' },
      el('span', {}, label), inp
    ));
  }
  const sel = el('select');
  for (const opt of ['urban','rural']) {
    const txt = window.I18N.t(opt === 'urban' ? 'area_urban' : 'area_rural');
    const o = el('option', { value: opt }, txt);
    if (m.areaType === opt) o.selected = true;
    sel.appendChild(o);
  }
  sel.addEventListener('change', () => { m.areaType = sel.value; window.saveState(state); recompute(); });
  root.appendChild(el('label', { class: 'meta-field' },
    el('span', {}, window.I18N.t('meta_area')), sel
  ));
}

function ensureBucket(kpiId, subId) {
  state.kpiVals[kpiId] = state.kpiVals[kpiId] || {};
  state.kpiVals[kpiId][subId] = state.kpiVals[kpiId][subId] || {};
}

function buildHintHtml(kpi) {
  const en = window.KPI_HINTS?.[kpi.id];
  if (!en) return `<div class="muted">${window.I18N.t('hint_unavailable')}</div>`;
  const isNp = window.I18N.current === 'np';
  const np = isNp ? window.KPI_HINTS_NP?.[kpi.id] : null;
  const h = {
    concept: (np && np.concept) || en.concept,
    data:    (np && np.data)    || en.data,
    notes:   (np && np.notes)   || en.notes,
  };
  const T = window.I18N.t.bind(window.I18N);
  let out = '';
  if (h.concept) out += `<p><strong>${T('hint_concept')}:</strong> ${escapeHtml(h.concept)}</p>`;
  if (h.data)    out += `<p><strong>${T('hint_data')}:</strong> ${escapeHtml(h.data)}</p>`;
  if (h.notes && h.notes.length) {
    out += `<p><strong>${T('hint_tips')}:</strong></p><ul>` +
      h.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('') + `</ul>`;
  }
  return out;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function showHint(kpi, anchor) {
  const pop = $('#hint-popover');
  $('#hint-title').textContent = `KPI-${kpi.id}: ${window.I18N.kpiName(kpi.id, kpi.name)}`;
  $('#hint-body').innerHTML = buildHintHtml(kpi);
  pop.hidden = false;
  // Position near anchor or center on small screens
  const r = anchor.getBoundingClientRect();
  const isMobile = window.innerWidth < 720;
  if (isMobile) {
    pop.style.top = '50%';
    pop.style.left = '50%';
    pop.style.transform = 'translate(-50%, -50%)';
  } else {
    pop.style.transform = 'none';
    let top = r.bottom + window.scrollY + 6;
    let left = Math.min(window.scrollX + r.left, document.documentElement.scrollWidth - 380);
    pop.style.top = `${top}px`;
    pop.style.left = `${Math.max(8, left)}px`;
  }
}
function hideHint() { $('#hint-popover').hidden = true; }

function renderKpis() {
  const wrapA = $('#cat-a');
  const wrapB = $('#cat-b');
  wrapA.innerHTML = '';
  wrapB.innerHTML = '';
  let lastSubcat = null;

  for (const kpi of window.KPI_CONFIG) {
    const kpiCard = el('div', { class: 'kpi-card', id: `kpi-${kpi.id}` });
    const hintBtn = el('button', { class: 'hint-btn', type: 'button',
      'aria-label': `Hint for KPI-${kpi.id}` }, '?');
    hintBtn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      showHint(kpi, ev.currentTarget);
    });

    const head = el('div', { class: 'kpi-head' },
      el('div', { class: 'kpi-name' },
        el('span', { class: 'kpi-num' }, `KPI-${kpi.id}`),
        el('span', {}, ` ${window.I18N.kpiName(kpi.id, kpi.name)}`)
      ),
      el('div', { class: 'kpi-head-right' },
        hintBtn,
        el('div', { class: 'kpi-score-pill', id: `kpi-${kpi.id}-score` }, '0.00 %')
      )
    );
    kpiCard.appendChild(head);
    if (kpi.description) {
      kpiCard.appendChild(el('div', { class: 'kpi-desc' },
        window.I18N.kpiDesc ? window.I18N.kpiDesc(kpi.id, kpi.description) : kpi.description));
    }

    for (const sub of kpi.subsets) {
      ensureBucket(kpi.id, sub.id);
      const subBox = el('div', { class: 'subset' });
      const subName = window.I18N.subsetName
        ? window.I18N.subsetName(kpi.id, sub.id, sub.name) : sub.name;
      subBox.appendChild(el('div', { class: 'sub-head' },
        el('span', { class: 'sub-id' }, `${window.I18N.t('subset_label')} ${sub.id}`),
        el('span', { class: 'sub-name' }, subName),
        el('span', { class: 'sub-weight' }, `${window.I18N.t('weight_label')} ${sub.weight}`),
        el('span', { class: 'sub-score', id: `sub-${kpi.id}-${sub.id}-score` }, '0.00 %')
      ));
      const grid = el('div', { class: 'inputs' });

      for (const inp of sub.inputs) {
        const lbl = el('label', { class: 'in-row' });
        const labelText = window.I18N.inputLabel
          ? window.I18N.inputLabel(kpi.id, sub.id, inp.id, inp.label) : inp.label;
        lbl.appendChild(el('span', { class: 'in-label' }, labelText));
        let widget;
        const stored = state.kpiVals[kpi.id][sub.id][inp.id];
        if (inp.options) {
          widget = el('select');
          for (const opt of inp.options) {
            const isObj = typeof opt === 'object';
            const value = isObj ? opt.value : opt;
            const baseLabel = isObj ? opt.label : opt;
            const text = window.I18N.optionLabel
              ? window.I18N.optionLabel(kpi.id, sub.id, inp.id, value, baseLabel) : baseLabel;
            const o = el('option', { value }, text);
            const cur = stored ?? inp.default;
            if (cur === value) o.selected = true;
            widget.appendChild(o);
          }
          widget.addEventListener('change', () => {
            state.kpiVals[kpi.id][sub.id][inp.id] = widget.value;
            window.saveState(state); recompute();
          });
        } else {
          const ph = window.I18N.unit ? window.I18N.unit(inp.unit) : (inp.unit || '');
          widget = el('input', { type: 'number', step: 'any',
            inputmode: 'decimal', placeholder: ph });
          if (stored !== undefined && stored !== null && stored !== '') widget.value = stored;
          else if (typeof inp.default === 'number' && inp.default !== 0) widget.value = inp.default;
          widget.addEventListener('input', () => {
            state.kpiVals[kpi.id][sub.id][inp.id] = widget.value === '' ? '' : Number(widget.value);
            window.saveState(state); recompute();
          });
        }
        const unitText = window.I18N.unit ? window.I18N.unit(inp.unit) : (inp.unit || '');
        const unit = el('span', { class: 'in-unit' }, unitText);
        const wrap = el('div', { class: 'in-widget' }, widget, unit);
        lbl.appendChild(wrap);
        grid.appendChild(lbl);
      }
      subBox.appendChild(grid);
      kpiCard.appendChild(subBox);
    }

    if (kpi.category === 'A') {
      wrapA.appendChild(kpiCard);
    } else {
      if (kpi.subcat && kpi.subcat !== lastSubcat) {
        lastSubcat = kpi.subcat;
        wrapB.appendChild(el('h3', { class: 'subcat-head' }, window.I18N.subcat(kpi.subcat)));
      }
      wrapB.appendChild(kpiCard);
    }
  }
}

function recompute() {
  const r = window.computeAll(state);
  for (const k of r.kpis) {
    const pill = document.getElementById(`kpi-${k.id}-score`);
    if (pill) pill.textContent = `${k.score.toFixed(2)} %`;
    for (const s of k.subsets) {
      const sp = document.getElementById(`sub-${k.id}-${s.id}-score`);
      if (sp) sp.textContent = `${s.score.toFixed(2)} %`;
    }
  }
  $('#cat-a-avg').textContent = `${r.catAAvg.toFixed(2)} %`;
  $('#cat-b-avg').textContent = `${r.catBAvg.toFixed(2)} %`;
  $('#zone-name').textContent = r.zone ? window.I18N.zone(r.zone.name) : '—';
  if (r.zone) $('#zone-pill').style.background = r.zone.color;
  $('#zone-pill').style.opacity = r.zone ? 1 : 0.5;
  const canvas = $('#chart');
  if (canvas) window.renderChart(canvas, r, history);
  return r;
}

function renderHistoryList() {
  const list = $('#history-list');
  if (!list) return;
  list.innerHTML = '';
  if (!history.length) {
    list.appendChild(el('div', { class: 'muted' }, window.I18N.t('no_history')));
    return;
  }
  history.forEach((h, i) => {
    const zoneTxt = h.zone ? window.I18N.zone(h.zone) : '—';
    const row = el('div', { class: 'hist-row' },
      el('span', {}, `${i+1}. ${h.label || ''} — A: ${h.catAAvg}%  B: ${h.catBAvg}%  → ${zoneTxt}`),
      el('button', { onclick: () => {
        history.splice(i, 1);
        const s = window.Auth.current();
        localStorage.setItem(HISTORY_KEY_FOR(s?.email), JSON.stringify(history));
        renderHistoryList(); recompute();
      } }, window.I18N.t('btn_remove'))
    );
    list.appendChild(row);
  });
}
function snapshotCurrent() {
  const r = window.computeAll(state);
  const label = state.meta?.year || `Snapshot ${history.length+1}`;
  history = window.appendHistory({
    label: String(label),
    catAAvg: r.catAAvg, catBAvg: r.catBAvg,
    zone: r.zone?.name || ''
  });
  renderHistoryList(); recompute();
}
function clearAllData() {
  if (!confirm(window.I18N.t('confirm_clear_self'))) return;
  state.meta = { utility:'', municipality:'', province:'', areaType:'urban',
                 year: new Date().getFullYear(), submittedBy:'' };
  state.kpiVals = {};
  window.clearHistory();
  history = [];
  window.saveState(state);
  renderMeta(); renderKpis(); renderHistoryList(); recompute();
}

function submitToAdmin() {
  const r = window.computeAll(state);
  if (!state.meta?.utility) {
    flash(window.I18N.t('toast_need_util'), true);
    return;
  }
  const session = window.Auth.current();
  const record = {
    submittedBy: session?.email,
    submittedAt: new Date().toISOString(),
    meta: JSON.parse(JSON.stringify(state.meta)),
    inputs: JSON.parse(JSON.stringify(state.kpiVals)),
    results: r,
  };
  window.Submissions.save(record);
  flash(window.I18N.t('toast_submitted'));
}

function wireToolbar() {
  $('#btn-export-excel').addEventListener('click', async () => {
    recompute();
    await window.exportExcel(state, window.computeAll(state));
  });
  $('#btn-export-png').addEventListener('click', () => window.exportChartPNG(state));
  $('#btn-export-json').addEventListener('click', () =>
    window.exportJSON(state, window.computeAll(state)));
  $('#btn-save-folder').addEventListener('click', async () => {
    const r = window.computeAll(state);
    const payload = JSON.stringify({ meta: state.meta, inputs: state.kpiVals, results: r }, null, 2);
    const utility = (state.meta?.utility || 'utility').replace(/\s+/g,'_');
    const year = state.meta?.year || new Date().getFullYear();
    const res = await window.saveToFolder(`KPI_${utility}_${year}.json`, payload);
    if (res.ok && !res.aborted) flash('Saved to chosen folder.');
    else if (res.error) flash('Save failed: ' + res.error, true);
  });
  $('#btn-cloud').addEventListener('click', async () => {
    const ep = $('#cloud-endpoint').value.trim();
    const r = await window.submitToCloud(state, window.computeAll(state), ep);
    if (r.ok) flash(r.mode === 'http' ? 'Cloud submission OK' : 'Saved JSON for admin upload');
    else flash('Cloud submit failed: ' + r.error, true);
  });
  $('#btn-submit-admin').addEventListener('click', submitToAdmin);
  $('#btn-snapshot').addEventListener('click', snapshotCurrent);
  $('#btn-clear').addEventListener('click', clearAllData);
}

// ---------- Admin View ----------
function bootAdmin(session) {
  $('#who-admin').textContent = `${session.name}  •  ${session.email}`;
  $('#admin-refresh').onclick = renderAdminList;
  $('#admin-search').oninput  = renderAdminList;
  $('#admin-clear-all').onclick = () => {
    if (!confirm(window.I18N.t('confirm_clear_all'))) return;
    window.Submissions.clearAll();
    renderAdminList();
    $('#admin-detail').innerHTML = `<div class="muted">${window.I18N.t('pick_one')}</div>`;
  };
  $('#admin-export-all').onclick = exportAllAdmin;
  renderAdminList();
}

function renderAdminList() {
  const list = $('#admin-list');
  list.innerHTML = '';
  const q = ($('#admin-search')?.value || '').toLowerCase().trim();
  const all = window.Submissions.list().slice().reverse();
  const filtered = q ? all.filter(r => {
    const blob = `${r.meta?.utility} ${r.meta?.municipality} ${r.meta?.province} ${r.meta?.year} ${r.submittedBy}`.toLowerCase();
    return blob.includes(q);
  }) : all;

  if (!filtered.length) {
    list.appendChild(el('div', { class: 'muted' },
      window.I18N.t(all.length ? 'no_match' : 'no_subs')));
    return;
  }

  // Header (desktop)
  const T = window.I18N.t.bind(window.I18N);
  const headers = [T('th_utility'), T('th_muni'), T('th_year'),
                   T('cat_a_metric'), T('cat_b_metric'),
                   T('th_zone'), T('th_submitted'), ''];
  const header = el('div', { class: 'admin-row admin-row-head' },
    ...headers.map(h => el('span', {}, h))
  );
  list.appendChild(header);

  for (const r of filtered) {
    const row = el('div', { class: 'admin-row' },
      el('span', { 'data-l': T('th_utility') },  r.meta?.utility || '—'),
      el('span', { 'data-l': T('th_muni') },     r.meta?.municipality || '—'),
      el('span', { 'data-l': T('th_year') },     String(r.meta?.year || '—')),
      el('span', { 'data-l': T('cat_a_metric') },`${r.results?.catAAvg ?? '—'} %`),
      el('span', { 'data-l': T('cat_b_metric') },`${r.results?.catBAvg ?? '—'} %`),
      el('span', { 'data-l': T('th_zone') },     r.results?.zone?.name ? window.I18N.zone(r.results.zone.name) : '—'),
      el('span', { 'data-l': T('th_submitted') },(r.submittedAt || '').replace('T',' ').slice(0,16)),
      el('span', { class: 'admin-actions' },
        el('button', { onclick: () => showAdminDetail(r.id) }, T('btn_open')),
        el('button', { class: 'danger', onclick: () => {
          if (!confirm(T('confirm_del_one'))) return;
          window.Submissions.remove(r.id);
          renderAdminList();
        } }, T('btn_delete'))
      )
    );
    list.appendChild(row);
  }
}

function showAdminDetail(id) {
  const rec = window.Submissions.get(id);
  window.__lastOpenedSubId = id;
  const root = $('#admin-detail');
  if (!rec) { root.innerHTML = '<div class="muted">Not found.</div>'; return; }
  root.innerHTML = '';
  const T = window.I18N.t.bind(window.I18N);

  const head = el('div', { class: 'detail-head' },
    el('h3', {}, `${rec.meta?.utility || 'Utility'} — ${rec.meta?.year || ''}`),
    el('div', { class: 'muted small' },
      `Submitted by ${rec.submittedBy || '—'} on ${(rec.submittedAt||'').replace('T',' ').slice(0,16)}`)
  );
  root.appendChild(head);

  const summary = el('div', { class: 'summary-grid' },
    el('div', { class: 'metric' },
      el('div', { class:'lab' }, T('cat_a_metric')),
      el('div', { class:'val' }, `${rec.results?.catAAvg ?? '—'} %`)),
    el('div', { class: 'metric' },
      el('div', { class:'lab' }, T('cat_b_metric')),
      el('div', { class:'val' }, `${rec.results?.catBAvg ?? '—'} %`)),
  );
  root.appendChild(summary);
  if (rec.results?.zone) {
    const z = el('div', { class: 'zone-box' },
      el('div', { class:'lab' }, T('zone_label')),
      el('div', { class:'zone-pill' }, window.I18N.zone(rec.results.zone.name)));
    z.querySelector('.zone-pill').style.background = rec.results.zone.color;
    root.appendChild(z);
  }

  // Chart in admin detail
  const wrap = el('div', { id: 'admin-chart-wrap', class: 'chart-wrap' });
  const canvas = el('canvas', { id: 'admin-chart' });
  wrap.appendChild(canvas);
  root.appendChild(wrap);
  // We render with no history (single point)
  setTimeout(() => window.renderChart(canvas, rec.results, []), 50);

  // KPI table
  const table = el('table', { class: 'kpi-table' });
  table.innerHTML = `<thead><tr>
    <th>${T('th_kpi')}</th><th>${T('th_name')}</th>
    <th>${T('th_cat')}</th><th>${T('th_score')}</th></tr></thead>`;
  const tbody = el('tbody');
  for (const k of (rec.results?.kpis || [])) {
    const tr = el('tr', {},
      el('td', {}, String(k.id)),
      el('td', {}, window.I18N.kpiName(k.id, k.name)),
      el('td', {}, k.category),
      el('td', { style: 'text-align:right' }, `${k.score}`));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  root.appendChild(table);

  // Buttons
  const tools = el('div', { class: 'toolbar-inline' },
    el('button', { class: 'primary', onclick: () => exportSubmissionAsExcel(rec) }, T('btn_export_report')),
    el('button', { onclick: () => exportSubmissionAsJson(rec) }, T('btn_json')),
  );
  root.appendChild(tools);
}

async function exportSubmissionAsExcel(rec) {
  // Adapt the user-side exporter by temporarily seeding state + chart
  const tempState = { meta: rec.meta, kpiVals: rec.inputs };
  // Render hidden chart into the user's canvas so the image embeds
  const canvas = document.getElementById('chart');
  if (canvas) window.renderChart(canvas, rec.results, []);
  await window.exportExcel(tempState, rec.results);
}
function exportSubmissionAsJson(rec) {
  const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
  const u = (rec.meta?.utility || 'utility').replace(/\s+/g,'_');
  const y = rec.meta?.year || '';
  window.downloadBlob(blob, `submission_${u}_${y}.json`);
}
async function exportAllAdmin() {
  if (!window.ExcelJS) { alert('ExcelJS failed to load'); return; }
  const wb = new ExcelJS.Workbook();
  const s = wb.addWorksheet('All Submissions');
  s.columns = [
    { header: 'Submitted At', key: 'at',  width: 22 },
    { header: 'Submitted By', key: 'by',  width: 24 },
    { header: 'Utility',      key: 'u',   width: 28 },
    { header: 'Municipality', key: 'm',   width: 22 },
    { header: 'Province',     key: 'p',   width: 18 },
    { header: 'Year',         key: 'y',   width: 8 },
    { header: 'Area',         key: 'a',   width: 8 },
    { header: 'Cat A %',      key: 'ca',  width: 10 },
    { header: 'Cat B %',      key: 'cb',  width: 10 },
    { header: 'Zone',         key: 'z',   width: 22 },
  ];
  s.getRow(1).font = { bold: true };
  for (const r of window.Submissions.list()) {
    s.addRow({
      at: (r.submittedAt||'').replace('T',' ').slice(0,16),
      by: r.submittedBy,
      u: r.meta?.utility, m: r.meta?.municipality, p: r.meta?.province,
      y: r.meta?.year, a: r.meta?.areaType,
      ca: r.results?.catAAvg, cb: r.results?.catBAvg, z: r.results?.zone?.name,
    });
  }
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type:
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  window.downloadBlob(blob, `All_Submissions_${new Date().toISOString().slice(0,10)}.xlsx`);
}

// ---------- Hint popover wiring ----------
function wireHintPopover() {
  document.getElementById('hint-close').addEventListener('click', hideHint);
  document.addEventListener('click', (ev) => {
    const pop = document.getElementById('hint-popover');
    if (pop.hidden) return;
    if (pop.contains(ev.target)) return;
    if (ev.target.classList.contains('hint-btn')) return;
    hideHint();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideHint(); });
}

// ---------- Language toggle wiring ----------
function wireLangToggle() {
  document.querySelectorAll('.lang-bar .lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.I18N.set(btn.dataset.lang);
    });
  });
}

// Called by I18N.set() — re-render views that contain dynamic translated text.
window.onLangChange = function() {
  const s = window.Auth.current();
  if (!s) return;
  if (s.role === 'admin') {
    renderAdminList();
    // If a detail is open, re-render it
    const open = document.querySelector('.detail-head h3');
    if (open) {
      const id = window.__lastOpenedSubId;
      if (id) showAdminDetail(id);
    }
  } else {
    // Re-render meta + KPI cards + history + scores
    renderMeta();
    renderKpis();
    renderHistoryList();
    recompute();
  }
};

// ---------- Boot ----------
document.addEventListener('DOMContentLoaded', () => {
  window.I18N.init();
  window.I18N.applyStatic();
  wireLangToggle();
  wireLogin();
  wireLogout();
  wireHintPopover();
  bootForRole();
});
