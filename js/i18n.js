// Bilingual support (English / Nepali). Strings are looked up by key via t().
// Active language is persisted in localStorage so the choice survives reloads.
// Detailed input field labels remain in English; translating them is a content
// task that can follow once domain reviewers approve terminology.

const LANG_KEY = 'niyatra_lang_v1';

const STRINGS = {
  // -------- Chrome / banners --------
  app_title:        { en: 'Water Supply M&E – KPI Performance Tool',
                      np: 'खानेपानी अनुगमन र मूल्याङ्कन – KPI प्रदर्शन उपकरण' },
  app_subtitle:     { en: 'Enter performance data for the 23 KPIs. Scores, category averages and the Career Path Chart update live.',
                      np: '२३ वटा KPI को प्रदर्शन तथ्याङ्क प्रविष्ट गर्नुहोस्। अंक, श्रेणीगत औसत र करियर पथ चार्ट तत्कालै अद्यावधिक हुन्छ।' },
  admin_title:      { en: 'Admin Dashboard – Submitted KPI Reports',
                      np: 'एडमिन ड्यासबोर्ड – पेश गरिएका KPI प्रतिवेदन' },
  admin_subtitle:   { en: 'Review utility submissions, open detailed reports, and export.',
                      np: 'उपयोगिताका पेशहरू हेर्नुहोस्, विस्तृत प्रतिवेदन खोल्नुहोस्, निर्यात गर्नुहोस्।' },
  sign_in:          { en: 'Sign In', np: 'साइन इन' },
  sign_out:         { en: 'Sign out', np: 'लग आउट' },
  email:            { en: 'Email',  np: 'इमेल' },
  password:         { en: 'Password', np: 'पासवर्ड' },
  login_subtitle:   { en: 'KPI Performance Monitoring & Evaluation Tool',
                      np: 'KPI प्रदर्शन अनुगमन र मूल्याङ्कन उपकरण' },
  login_hint:       { en: 'Sign in with your assigned credentials.',
                      np: 'तपाईंलाई दिइएको प्रमाणिकरणसहित साइन इन गर्नुहोस्।' },
  login_invalid:    { en: 'Invalid email or password',
                      np: 'इमेल वा पासवर्ड मिलेन।' },
  powered_by:       { en: 'Powered by', np: 'सञ्चालक:' },
  hosted_at:        { en: 'Hosted at', np: 'होस्ट:' },

  // -------- Sections --------
  utility_info:     { en: '1. Utility Information',
                      np: '१. उपयोगिता विवरण' },
  cat_a_section:    { en: '2. Category A — Level & Quality of Water Supply Service',
                      np: '२. श्रेणी क — पानी आपूर्ति सेवाको स्तर र गुणस्तर' },
  cat_b_section:    { en: '3. Category B — Operational & Management Efficiency',
                      np: '३. श्रेणी ख — सञ्चालन तथा व्यवस्थापन दक्षता' },
  live_chart:       { en: 'Live Career Path', np: 'लाइभ करियर पथ' },
  cat_a_metric:     { en: 'Cat A — Service Level', np: 'श्रेणी क — सेवा स्तर' },
  cat_b_metric:     { en: 'Cat B — O&M Efficiency', np: 'श्रेणी ख — स/व्य दक्षता' },
  zone_label:       { en: 'Service Provider Position', np: 'सेवा प्रदायकको स्थान' },
  submit_export:    { en: 'Submit & Export', np: 'पेश गर्नुहोस् र निर्यात' },
  history_section:  { en: 'Year-wise History', np: 'वार्षिक इतिहास' },
  submissions:      { en: 'Submissions', np: 'पेश गरिएका' },
  selected_sub:     { en: 'Selected Submission', np: 'छनोट गरिएको पेश' },

  // -------- Meta fields --------
  meta_utility:     { en: 'Utility / Service Provider', np: 'उपयोगिता / सेवा प्रदायक' },
  meta_municipality:{ en: 'Municipality', np: 'नगरपालिका' },
  meta_province:    { en: 'Province / District', np: 'प्रदेश / जिल्ला' },
  meta_year:        { en: 'Performance Evaluation Year', np: 'प्रदर्शन मूल्याङ्कन वर्ष' },
  meta_submitted_by:{ en: 'Submitted by', np: 'पेश गर्ने' },
  meta_area:        { en: 'Service Area Type', np: 'सेवा क्षेत्र प्रकार' },
  area_urban:       { en: 'Urban', np: 'शहरी' },
  area_rural:       { en: 'Rural', np: 'ग्रामीण' },

  // -------- Buttons --------
  btn_submit_admin: { en: '📤 Submit to Admin', np: '📤 एडमिनलाई पेश गर्नुहोस्' },
  btn_excel:        { en: '📊 Download Excel (.xlsx)', np: '📊 एक्सेल डाउनलोड (.xlsx)' },
  btn_chart_png:    { en: '🖼️ Download Chart PNG', np: '🖼️ चार्ट PNG डाउनलोड' },
  btn_json:         { en: '💾 Download JSON', np: '💾 JSON डाउनलोड' },
  btn_save_folder:  { en: '📁 Save to Drive Folder…', np: '📁 ड्राइभ फोल्डरमा सेभ…' },
  btn_cloud:        { en: '☁️ POST to Cloud Endpoint', np: '☁️ क्लाउडमा पेश गर्नुहोस्' },
  btn_snapshot:     { en: '➕ Snapshot current year', np: '➕ हालको वर्ष स्न्यापसट' },
  btn_clear:        { en: '🗑️ Clear my data & history', np: '🗑️ मेरो डाटा र इतिहास हटाउनुहोस्' },
  btn_refresh:      { en: '↻ Refresh', np: '↻ रिफ्रेस' },
  btn_export_all:   { en: '⬇ Export ALL as Excel', np: '⬇ सबै एक्सेलमा निर्यात' },
  btn_clear_all:    { en: '🗑️ Clear ALL submissions', np: '🗑️ सबै पेशहरू हटाउनुहोस्' },
  btn_open:         { en: 'Open', np: 'खोल्नुहोस्' },
  btn_delete:       { en: 'Delete', np: 'हटाउनुहोस्' },
  btn_remove:       { en: 'Remove', np: 'हटाउनुहोस्' },
  btn_export_report:{ en: '📊 Export this report (.xlsx)', np: '📊 यो प्रतिवेदन निर्यात (.xlsx)' },

  // -------- Misc --------
  cloud_placeholder:{ en: 'Cloud submission URL (optional)', np: 'क्लाउड पेश URL (वैकल्पिक)' },
  no_history:       { en: 'No history snapshots yet.', np: 'अहिलेसम्म कुनै स्न्यापसट छैन।' },
  no_subs:          { en: 'No submissions yet.', np: 'अहिलेसम्म कुनै पेश छैन।' },
  no_match:         { en: 'No matching submissions.', np: 'मिल्ने पेश छैन।' },
  pick_one:         { en: 'Pick a submission from the list above.', np: 'माथिको सूचीबाट छान्नुहोस्।' },
  filter_ph:        { en: 'Filter by utility / municipality / year…',
                      np: 'उपयोगिता / नगरपालिका / वर्षद्वारा फिल्टर…' },
  th_utility:       { en: 'Utility', np: 'उपयोगिता' },
  th_muni:          { en: 'Municipality', np: 'नगरपालिका' },
  th_year:          { en: 'Year', np: 'वर्ष' },
  th_zone:          { en: 'Zone', np: 'क्षेत्र' },
  th_submitted:     { en: 'Submitted', np: 'पेश मिति' },
  th_kpi:           { en: 'KPI', np: 'KPI' },
  th_name:          { en: 'Name', np: 'नाम' },
  th_cat:           { en: 'Cat', np: 'श्रेणी' },
  th_score:         { en: 'Score %', np: 'अंक %' },
  weight_label:     { en: 'weight', np: 'भार' },
  subset_label:     { en: 'Subset', np: 'उप-अंश' },
  hint_close:       { en: 'Close', np: 'बन्द' },
  toast_submitted:  { en: 'Submitted to admin ✓', np: 'एडमिनलाई पेश गरियो ✓' },
  toast_need_util:  { en: 'Please fill at least the Utility name first.',
                      np: 'पहिले कम्तिमा उपयोगिता नाम भर्नुहोस्।' },
  confirm_clear_self:{ en: 'Clear your data and history?',
                       np: 'तपाईंको डाटा र इतिहास हटाउने हो?' },
  confirm_clear_all:{ en: 'Permanently delete ALL submissions on this device?',
                      np: 'यस यन्त्रमा भएका सबै पेशहरू स्थायी रूपमा हटाउने हो?' },
  confirm_del_one:  { en: 'Delete this submission?', np: 'यो पेश हटाउने हो?' },
  hint_concept:     { en: 'Concept', np: 'अवधारणा' },
  hint_data:        { en: 'Data sources', np: 'स्रोत तथ्याङ्क' },
  hint_tips:        { en: 'Tips', np: 'सुझाव' },
  hint_unavailable: { en: 'No hint available.', np: 'सङ्केत उपलब्ध छैन।' },
};

const KPI_NAMES_NP = {
  1:  'पानी सेवा कभरेज',
  2:  'पर्याप्तता',
  3:  'गुणस्तर',
  4:  'पहुँच',
  5:  'भरपर्दोपन',
  6:  'सम्पत्ति व्यवस्थापन',
  7:  'मर्मतसम्भार',
  8:  'औसत मर्मत समय (MTTR)',
  9:  'गैर-राजस्व पानी (NRW)',
  10: 'पानी शुल्क र जडान शुल्क',
  11: 'सञ्चालन अनुपात',
  12: 'लगानीमा योगदान (CTI)',
  13: 'वित्तीय जवाफदेहिता',
  14: 'मिटर अनुपात',
  15: 'बिलिङ र सङ्कलन दक्षता',
  16: 'ग्राहक डाटाबेस व्यवस्थापन',
  17: 'गुनासो व्यवस्थापन',
  18: 'उपभोक्ता सन्तुष्टि सर्वेक्षण',
  19: 'व्यवसाय योजना कार्यान्वयन',
  20: 'मानव संसाधन विकास (HRD)',
  21: 'लैङ्गिक समानता र सामाजिक समावेशीकरण (GESI)',
  22: 'वार्षिक साधारण सभाको नियमितता (AGM)',
  23: 'संगठनात्मक परिपक्वता',
};

const SUBCAT_NP = {
  'Technical Operation':       'प्राविधिक सञ्चालन',
  'Financial Management':      'वित्तीय व्यवस्थापन',
  'Commercial Operation':      'व्यवसायिक सञ्चालन',
  'Consumer Satisfaction':     'उपभोक्ता सन्तुष्टि',
  'Organizational Management': 'संगठनात्मक व्यवस्थापन',
};

const ZONE_NAMES_NP = {
  'Very Poor':            'धेरै कमजोर',
  'Poor':                 'कमजोर',
  'Inactive':             'निष्क्रिय',
  'Active':               'सक्रिय',
  'Improving':            'सुधार हुँदै',
  'Improved':             'सुधार भएको',
  'Just Efficient':       'मात्र दक्ष',
  'Moderately Efficient': 'मध्यम दक्ष',
  'Highly Efficient':     'उच्च दक्ष',
};

window.I18N = {
  current: 'en',
  init() {
    const saved = localStorage.getItem(LANG_KEY);
    this.current = (saved === 'np' || saved === 'en') ? saved : 'en';
    document.documentElement.lang = this.current === 'np' ? 'ne' : 'en';
  },
  set(lang) {
    if (lang !== 'en' && lang !== 'np') return;
    this.current = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang === 'np' ? 'ne' : 'en';
    this.applyStatic();
    if (typeof window.onLangChange === 'function') window.onLangChange();
  },
  t(key) {
    const e = STRINGS[key];
    if (!e) return key;
    return e[this.current] || e.en || key;
  },
  kpiName(id, fallback) {
    return this.current === 'np' ? (KPI_NAMES_NP[id] || fallback) : fallback;
  },
  subcat(name) {
    return this.current === 'np' ? (SUBCAT_NP[name] || name) : name;
  },
  zone(name) {
    return this.current === 'np' ? (ZONE_NAMES_NP[name] || name) : name;
  },
  // Walk all elements with data-i18n / data-i18n-attr and rewrite text/attribute.
  applyStatic() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.setAttribute('placeholder', this.t(el.dataset.i18nPh));
    });
    // Update lang toggle button state
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === this.current);
    });
    // Update <title>
    document.title = this.t('app_title') + ' | sandeepkafle.com.np';
  },
};
