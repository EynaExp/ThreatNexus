/* ═══════════════════════════════════════════════════════
   ThreatNexus — Main Application JavaScript
   ═══════════════════════════════════════════════════════ */

'use strict';

// ── State ──────────────────────────────────────────────
const State = {
  user: null,
  groups: [],
  cveRecords: [],
  cveCustomCols: [],
  dashEntries: [],
  dashCustomCols: [],
  credentials: [],
  credCustomCols: [],
  users: [],
  editingId: null,
  tags: { cve: [], dash: [], cred: [] },
  pocs: [],
  refs: [],
  sortState: { cve: {col:null,dir:1}, dash: {col:null,dir:1}, cred: {col:null,dir:1} },
  page: { cve: 1, dash: 1, cred: 1 },
  pageSize: 25,
  currentPage: 'dashboard',
  globeData: [],
  globeInstance: null,
  globeRotating: true,
  globeSelectedCountry: null,
  globeFilterCountry: null,
};

// ── Country Database ───────────────────────────────────
const COUNTRIES = [
  {name:"Afghanistan",code:"AF",tld:".af"},{name:"Albania",code:"AL",tld:".al"},{name:"Algeria",code:"DZ",tld:".dz"},
  {name:"Andorra",code:"AD",tld:".ad"},{name:"Angola",code:"AO",tld:".ao"},{name:"Argentina",code:"AR",tld:".ar"},
  {name:"Armenia",code:"AM",tld:".am"},{name:"Australia",code:"AU",tld:".au"},{name:"Austria",code:"AT",tld:".at"},
  {name:"Azerbaijan",code:"AZ",tld:".az"},{name:"Bahrain",code:"BH",tld:".bh"},{name:"Bangladesh",code:"BD",tld:".bd"},
  {name:"Belarus",code:"BY",tld:".by"},{name:"Belgium",code:"BE",tld:".be"},{name:"Bolivia",code:"BO",tld:".bo"},
  {name:"Bosnia",code:"BA",tld:".ba"},{name:"Brazil",code:"BR",tld:".br"},{name:"Bulgaria",code:"BG",tld:".bg"},
  {name:"Cambodia",code:"KH",tld:".kh"},{name:"Cameroon",code:"CM",tld:".cm"},{name:"Canada",code:"CA",tld:".ca"},
  {name:"Chile",code:"CL",tld:".cl"},{name:"China",code:"CN",tld:".cn"},{name:"Colombia",code:"CO",tld:".co"},
  {name:"Croatia",code:"HR",tld:".hr"},{name:"Cuba",code:"CU",tld:".cu"},{name:"Cyprus",code:"CY",tld:".cy"},
  {name:"Czech Republic",code:"CZ",tld:".cz"},{name:"Denmark",code:"DK",tld:".dk"},{name:"Ecuador",code:"EC",tld:".ec"},
  {name:"Egypt",code:"EG",tld:".eg"},{name:"Estonia",code:"EE",tld:".ee"},{name:"Ethiopia",code:"ET",tld:".et"},
  {name:"Finland",code:"FI",tld:".fi"},{name:"France",code:"FR",tld:".fr"},{name:"Georgia",code:"GE",tld:".ge"},
  {name:"Germany",code:"DE",tld:".de"},{name:"Ghana",code:"GH",tld:".gh"},{name:"Greece",code:"GR",tld:".gr"},
  {name:"Guatemala",code:"GT",tld:".gt"},{name:"Honduras",code:"HN",tld:".hn"},{name:"Hong Kong",code:"HK",tld:".hk"},
  {name:"Hungary",code:"HU",tld:".hu"},{name:"Iceland",code:"IS",tld:".is"},{name:"India",code:"IN",tld:".in"},
  {name:"Indonesia",code:"ID",tld:".id"},{name:"Iran",code:"IR",tld:".ir"},{name:"Iraq",code:"IQ",tld:".iq"},
  {name:"Ireland",code:"IE",tld:".ie"},{name:"Israel",code:"IL",tld:".il"},{name:"Italy",code:"IT",tld:".it"},
  {name:"Japan",code:"JP",tld:".jp"},{name:"Jordan",code:"JO",tld:".jo"},{name:"Kazakhstan",code:"KZ",tld:".kz"},
  {name:"Kenya",code:"KE",tld:".ke"},{name:"Kuwait",code:"KW",tld:".kw"},{name:"Latvia",code:"LV",tld:".lv"},
  {name:"Lebanon",code:"LB",tld:".lb"},{name:"Libya",code:"LY",tld:".ly"},{name:"Lithuania",code:"LT",tld:".lt"},
  {name:"Luxembourg",code:"LU",tld:".lu"},{name:"Malaysia",code:"MY",tld:".my"},{name:"Mexico",code:"MX",tld:".mx"},
  {name:"Morocco",code:"MA",tld:".ma"},{name:"Myanmar",code:"MM",tld:".mm"},{name:"Nepal",code:"NP",tld:".np"},
  {name:"Netherlands",code:"NL",tld:".nl"},{name:"New Zealand",code:"NZ",tld:".nz"},{name:"Nigeria",code:"NG",tld:".ng"},
  {name:"North Korea",code:"KP",tld:".kp"},{name:"Norway",code:"NO",tld:".no"},{name:"Oman",code:"OM",tld:".om"},
  {name:"Pakistan",code:"PK",tld:".pk"},{name:"Palestine",code:"PS",tld:".ps"},{name:"Panama",code:"PA",tld:".pa"},
  {name:"Peru",code:"PE",tld:".pe"},{name:"Philippines",code:"PH",tld:".ph"},{name:"Poland",code:"PL",tld:".pl"},
  {name:"Portugal",code:"PT",tld:".pt"},{name:"Qatar",code:"QA",tld:".qa"},{name:"Romania",code:"RO",tld:".ro"},
  {name:"Russia",code:"RU",tld:".ru"},{name:"Saudi Arabia",code:"SA",tld:".sa"},{name:"Serbia",code:"RS",tld:".rs"},
  {name:"Singapore",code:"SG",tld:".sg"},{name:"Slovakia",code:"SK",tld:".sk"},{name:"Slovenia",code:"SI",tld:".si"},
  {name:"South Africa",code:"ZA",tld:".za"},{name:"South Korea",code:"KR",tld:".kr"},{name:"Spain",code:"ES",tld:".es"},
  {name:"Sri Lanka",code:"LK",tld:".lk"},{name:"Sudan",code:"SD",tld:".sd"},{name:"Sweden",code:"SE",tld:".se"},
  {name:"Switzerland",code:"CH",tld:".ch"},{name:"Syria",code:"SY",tld:".sy"},{name:"Taiwan",code:"TW",tld:".tw"},
  {name:"Thailand",code:"TH",tld:".th"},{name:"Tunisia",code:"TN",tld:".tn"},{name:"Turkey",code:"TR",tld:".tr"},
  {name:"Ukraine",code:"UA",tld:".ua"},{name:"UAE",code:"AE",tld:".ae"},{name:"United Kingdom",code:"GB",tld:".uk"},
  {name:"United States",code:"US",tld:".us"},{name:"Uruguay",code:"UY",tld:".uy"},{name:"Uzbekistan",code:"UZ",tld:".uz"},
  {name:"Venezuela",code:"VE",tld:".ve"},{name:"Vietnam",code:"VN",tld:".vn"},{name:"Yemen",code:"YE",tld:".ye"},
  {name:"Zimbabwe",code:"ZW",tld:".zw"}
];

// Lat/Lon for 3D globe markers (country code → [lat, lon])
const COUNTRY_COORDS = {
  AF:[33.93,67.71],AL:[41.15,20.17],AD:[42.55,1.60],DZ:[28.03,1.66],AR:[-38.42,-63.62],AM:[40.07,45.04],
  AU:[-25.27,133.78],AT:[47.52,14.55],AZ:[40.14,47.58],BH:[26.03,50.55],BD:[23.68,90.36],
  BY:[53.71,27.95],BE:[50.50,4.47],BO:[-16.29,-63.59],BA:[43.92,17.68],BR:[-14.24,-51.93],
  BG:[42.73,25.49],KH:[12.57,104.99],CM:[3.85,11.50],CA:[56.13,-106.35],CL:[-35.68,-71.54],
  CN:[35.86,104.19],CO:[4.57,-74.30],HR:[45.10,15.20],CU:[21.52,-77.78],CY:[35.13,33.43],
  CZ:[49.82,15.47],DK:[56.26,9.50],EC:[-1.83,-78.18],EG:[26.82,30.80],EE:[58.60,25.01],
  ET:[9.15,40.49],FI:[61.92,25.75],FR:[46.23,2.21],GE:[42.31,43.36],DE:[51.17,10.45],
  GH:[7.95,-1.02],GR:[39.07,21.82],GT:[15.78,-90.23],HN:[15.20,-86.24],HK:[22.40,114.11],
  HU:[47.16,19.50],IS:[64.96,-19.02],IN:[20.59,78.96],ID:[-0.79,113.92],IR:[32.43,53.69],
  IQ:[33.22,43.68],IE:[53.41,-8.24],IL:[31.05,34.85],IT:[41.87,12.57],JP:[36.20,138.25],
  JO:[30.59,36.24],KZ:[48.02,66.92],KE:[-0.02,37.91],KW:[29.31,47.48],LV:[56.88,24.60],
  LB:[33.85,35.86],LY:[26.34,17.23],LT:[55.17,23.88],LU:[49.82,6.13],MY:[4.21,108.96],
  MX:[23.63,-102.55],MA:[31.79,-7.09],MM:[21.92,95.96],NP:[28.39,84.12],NL:[52.13,5.29],
  NZ:[-40.90,174.89],NG:[9.08,8.68],KP:[40.34,127.51],NO:[60.47,8.47],OM:[21.51,55.92],
  PK:[30.38,69.35],PS:[31.95,35.23],PA:[8.54,-80.78],PE:[-9.19,-75.02],PH:[12.88,121.77],
  PL:[51.92,19.15],PT:[39.40,-8.22],QA:[25.35,51.18],RO:[45.94,24.97],RU:[61.52,105.32],
  SA:[23.89,45.08],RS:[44.02,21.01],SG:[1.35,103.82],SK:[48.67,19.70],SI:[46.15,14.99],
  ZA:[-30.56,22.94],KR:[35.91,127.77],ES:[40.46,-3.75],LK:[7.87,80.77],SD:[12.86,30.22],
  SE:[60.13,18.64],CH:[46.82,8.23],SY:[34.80,38.99],TW:[23.70,120.96],TH:[15.87,100.99],
  TN:[33.89,9.54],TR:[38.96,35.24],UA:[48.38,31.17],AE:[23.42,53.85],GB:[55.38,-3.44],
  US:[37.09,-95.71],UY:[-32.52,-55.77],UZ:[41.38,64.59],VE:[6.42,-66.59],VN:[14.06,108.28],
  YE:[15.55,48.52],ZW:[-19.01,29.15]
};

// ── API Helper ─────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, credentials: 'include', headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch('/api' + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

// ── Toast ──────────────────────────────────────────────
function toast(msg, type='info') {
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'●'}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Clock ──────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('clock');
  const tick = () => { el.textContent = new Date().toUTCString().replace('GMT','UTC'); };
  tick(); setInterval(tick, 1000);
}

// ── Toggle Password ────────────────────────────────────
function togglePwd(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

// ── Sidebar ────────────────────────────────────────────
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('collapsed');
}

// ── Navigation ─────────────────────────────────────────
function navigate(page) {
  State.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + page);
  if (pg) pg.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  const titles = {
    dashboard: 'Access Map', worldmap: 'Global Threat Map',
    cve: 'CVE Records', credentials: 'Credential Manager', users: 'Users & Groups'
  };
  document.getElementById('topbar-title').textContent = titles[page] || page;
  document.getElementById('topbar-sub').textContent = '';

  if (page === 'dashboard') loadDashboard();
  else if (page === 'worldmap') { loadGlobeData(); initGlobe(); }
  else if (page === 'cve') loadCve();
  else if (page === 'credentials') loadCredentials();
  else if (page === 'users') loadUsers();
}

function switchTab(section, tabId) {
  const parent = document.getElementById('page-' + section);
  parent.querySelectorAll('.panel-tab').forEach((t, i) => {
    const panes = parent.querySelectorAll('.pane');
    if (t.getAttribute('onclick').includes(tabId)) {
      t.classList.add('active');
      panes[i] && panes[i].classList.add('active');
    } else {
      t.classList.remove('active');
      panes[i] && panes[i].classList.remove('active');
    }
  });
}

// ── Modal ──────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    State.editingId = null;
  }
});

// ── Confirm Dialog ─────────────────────────────────────
function confirmAction(msg, onOk) {
  document.getElementById('confirm-msg').textContent = msg;
  const btn = document.getElementById('confirm-ok-btn');
  btn.onclick = () => { closeModal('confirm-modal'); onOk(); };
  openModal('confirm-modal');
}

// ── Country Selects ────────────────────────────────────
function populateCountrySelects() {
  const selects = ['cve-country', 'dash-country'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">— None —</option>';
    COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.dataset.code = c.code;
      opt.dataset.tld = c.tld;
      opt.textContent = `${c.name} (${c.code}) ${c.tld}`;
      sel.appendChild(opt);
    });
  });
  // Populate filter dropdowns
  ['dash-filter-country', 'cve-filter-country'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    // Keep existing first option
    const existing = sel.innerHTML;
    sel.innerHTML = '<option value="">All Countries</option>';
    COUNTRIES.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = `${c.name} (${c.code})`;
      sel.appendChild(opt);
    });
  });
}

function updateCountryCode(selectId, codeId) {
  const sel = document.getElementById(selectId);
  const codeEl = document.getElementById(codeId);
  const selected = sel.options[sel.selectedIndex];
  codeEl.value = selected ? (selected.dataset.code || '') : '';
}

// ── Tags ───────────────────────────────────────────────
function renderTags(prefix) {
  const container = document.getElementById(`${prefix}-tags-display`);
  if (!container) return;
  container.innerHTML = '';
  (State.tags[prefix] || []).forEach((tag, i) => {
    const span = document.createElement('span');
    span.className = 'tag';
    span.innerHTML = `${esc(tag)} <span class="tag-remove" onclick="removeTag('${prefix}',${i})">✕</span>`;
    container.appendChild(span);
  });
}

function addTag(prefix) {
  const input = document.getElementById(`${prefix}-tag-input`);
  const val = input.value.trim();
  if (val && !State.tags[prefix].includes(val)) {
    State.tags[prefix].push(val);
    renderTags(prefix);
  }
  input.value = '';
}

function removeTag(prefix, i) {
  State.tags[prefix].splice(i, 1);
  renderTags(prefix);
}

// ── PoC Entries ────────────────────────────────────────
function renderPocs() {
  const container = document.getElementById('cve-pocs-list');
  if (!container) return;
  container.innerHTML = '';
  State.pocs.forEach((poc, i) => {
    const div = document.createElement('div');
    div.className = 'poc-entry';
    div.innerHTML = `
      <div class="poc-header" onclick="togglePoc(${i})">
        <span>${esc(poc.title || `PoC #${i+1}`)}</span>
        <div style="display:flex;gap:6px;">
          <span onclick="event.stopPropagation();removePoc(${i})" style="color:var(--red);cursor:pointer;">✕</span>
          <span>▼</span>
        </div>
      </div>
      <div class="poc-body" id="poc-body-${i}">
        <div class="form-group" style="margin-bottom:8px;">
          <label class="form-label">Title</label>
          <input class="form-input" value="${esc(poc.title||'')}" oninput="State.pocs[${i}].title=this.value" placeholder="PoC title / description" />
        </div>
        <div class="form-group" style="margin-bottom:8px;">
          <label class="form-label">Language</label>
          <select class="form-select" onchange="State.pocs[${i}].language=this.value">
            <option ${poc.language==='python'?'selected':''}>python</option>
            <option ${poc.language==='bash'?'selected':''}>bash</option>
            <option ${poc.language==='ruby'?'selected':''}>ruby</option>
            <option ${poc.language==='go'?'selected':''}>go</option>
            <option ${poc.language==='js'?'selected':''}>js</option>
            <option ${poc.language==='c'?'selected':''}>c</option>
            <option ${poc.language==='other'?'selected':''}>other</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Code</label>
          <textarea class="form-textarea" rows="6" style="font-family:var(--font-mono);font-size:11px;" oninput="State.pocs[${i}].code=this.value" placeholder="# Paste PoC code here...">${esc(poc.code||'')}</textarea>
        </div>
      </div>`;
    container.appendChild(div);
  });
}

function addPocEntry() {
  State.pocs.push({ title: '', language: 'python', code: '' });
  renderPocs();
  const idx = State.pocs.length - 1;
  document.getElementById(`poc-body-${idx}`).classList.add('open');
}

function removePoc(i) { State.pocs.splice(i, 1); renderPocs(); }
function togglePoc(i) {
  const el = document.getElementById(`poc-body-${i}`);
  el.classList.toggle('open');
}

// ── Refs ───────────────────────────────────────────────
function renderRefs() {
  const container = document.getElementById('cve-refs-list');
  if (!container) return;
  container.innerHTML = '';
  State.refs.forEach((ref, i) => {
    const div = document.createElement('div');
    div.className = 'ref-entry';
    div.innerHTML = `
      <input class="form-input" value="${esc(ref)}" oninput="State.refs[${i}]=this.value" placeholder="https://..." />
      <button class="btn-icon" onclick="State.refs.splice(${i},1);renderRefs()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    container.appendChild(div);
  });
}

function addRefEntry() { State.refs.push(''); renderRefs(); }

// ── Severity Badge ─────────────────────────────────────
function severityBadge(s) {
  const map = { Critical:'badge-critical', High:'badge-high', Medium:'badge-medium', Low:'badge-low' };
  return `<span class="badge ${map[s]||'badge-unknown'}">${esc(s||'Unknown')}</span>`;
}

function typeBadge(t) {
  if (!t) return '';
  const map = { RCE:'badge-rce', LPE:'badge-lpe' };
  return `<span class="badge ${map[t]||'badge-info'}">${esc(t)}</span>`;
}

function statusBadge(s) {
  if (s === 'Active') return `<span class="pill pill-active">● ${esc(s)}</span>`;
  if (s === 'Inactive') return `<span class="pill pill-inactive">● ${esc(s)}</span>`;
  return `<span class="badge badge-unknown">${esc(s||'Unknown')}</span>`;
}

// ── Escape HTML ────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Sort Helper ────────────────────────────────────────
function sortData(data, col, dir) {
  if (!col) return data;
  return [...data].sort((a, b) => {
    let va = getNestedVal(a, col);
    let vb = getNestedVal(b, col);
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va||'').localeCompare(String(vb||'')) * dir;
  });
}

function getNestedVal(obj, col) {
  if (col.startsWith('custom.')) return (obj.custom || {})[col.slice(7)];
  return obj[col];
}

function renderSortIcon(section, col) {
  const s = State.sortState[section];
  if (s.col !== col) return '<span class="sort-icon">⇅</span>';
  return `<span class="sort-icon">${s.dir === 1 ? '↑' : '↓'}</span>`;
}

function handleSort(section, col) {
  const s = State.sortState[section];
  if (s.col === col) s.dir *= -1;
  else { s.col = col; s.dir = 1; }
  if (section === 'cve') renderCveTable();
  else if (section === 'dash') renderDashTable();
  else if (section === 'cred') renderCredTable();
}

// ── Pagination ─────────────────────────────────────────
function renderPagination(containerId, section, totalItems) {
  const total = Math.ceil(totalItems / State.pageSize) || 1;
  const current = State.page[section];
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (total <= 1) return;
  const sectionPageMap = { cve: 'cve', dash: 'dashboard', cred: 'credentials' };
  const addBtn = (label, pg, active) => {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.onclick = () => { State.page[section] = pg; navigate(sectionPageMap[section] || section); };
    container.appendChild(btn);
  };
  if (current > 1) addBtn('‹', current - 1, false);
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let i = start; i <= end; i++) addBtn(i, i, i === current);
  if (current < total) addBtn('›', current + 1, false);
  const info = document.createElement('span');
  info.className = 'page-info';
  info.textContent = `${((current-1)*State.pageSize)+1}–${Math.min(current*State.pageSize, totalItems)} of ${totalItems}`;
  container.appendChild(info);
}

function paginateData(data, section) {
  const pg = State.page[section];
  const ps = State.pageSize;
  return data.slice((pg-1)*ps, pg*ps);
}

// ══════════════════════════════════════════════════════
// CVE Records
// ══════════════════════════════════════════════════════
async function loadCve() {
  try {
    const res = await api('GET', '/cve');
    State.cveRecords = res.records || [];
    State.cveCustomCols = res.custom_columns || [];
    renderCveTable();
  } catch(e) { toast(e.message, 'error'); }
}

function filterCve() {
  State.page.cve = 1;
  renderCveTable();
}

function getFilteredCve() {
  const search = (document.getElementById('cve-search')?.value || '').toLowerCase();
  const sev = document.getElementById('cve-filter-severity')?.value || '';
  const type = document.getElementById('cve-filter-type')?.value || '';
  const country = document.getElementById('cve-filter-country')?.value || '';
  return State.cveRecords.filter(r => {
    if (sev && r.severity !== sev) return false;
    if (type && r.type !== type) return false;
    if (country && r.country !== country) return false;
    if (search) {
      const hay = JSON.stringify(r).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function renderCveTable() {
  const filtered = sortData(getFilteredCve(), State.sortState.cve.col, State.sortState.cve.dir);
  const cols = ['index','cve_id','severity','type','country','tags','created_at', ...State.cveCustomCols.map(c=>'custom.'+c)];
  const colLabels = { index:'#', cve_id:'CVE ID', severity:'Severity', type:'Type', country:'Country', tags:'Tags', created_at:'Created' };

  // Header
  const thead = document.getElementById('cve-thead');
  thead.innerHTML = '';
  const tr = document.createElement('tr');
  cols.forEach(col => {
    const th = document.createElement('th');
    const displayCol = col.startsWith('custom.') ? col.slice(7) : col;
    const label = colLabels[col] || displayCol;
    th.className = State.sortState.cve.col === col ? 'sorted' : '';
    th.onclick = () => handleSort('cve', col);
    th.innerHTML = `${esc(label)} ${renderSortIcon('cve', col)}`;
    tr.appendChild(th);
  });
  const thAct = document.createElement('th');
  thAct.textContent = 'Actions';
  tr.appendChild(thAct);
  thead.appendChild(tr);

  // Body
  const tbody = document.getElementById('cve-tbody');
  tbody.innerHTML = '';
  const paged = paginateData(filtered, 'cve');
  if (!paged.length) {
    const emptyRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length + 1;
    td.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><p>No CVE records found</p></div>`;
    emptyRow.appendChild(td);
    tbody.appendChild(emptyRow);
  } else {
    paged.forEach(r => {
      const row = document.createElement('tr');
      row.style.cursor = 'pointer';
      row.ondblclick = () => viewCveDetail(r.id);
      cols.forEach(col => {
        const td = document.createElement('td');
        if (col === 'severity') td.innerHTML = severityBadge(r.severity);
        else if (col === 'type') td.innerHTML = typeBadge(r.type);
        else if (col === 'tags') {
          td.innerHTML = (r.tags||[]).map(t=>`<span class="badge badge-tag">${esc(t)}</span>`).join(' ') || '<span class="text-dim">—</span>';
        } else if (col === 'created_at') {
          td.textContent = r.created_at ? r.created_at.split('T')[0] : '—';
        } else if (col.startsWith('custom.')) {
          td.textContent = (r.custom||{})[col.slice(7)] || '—';
        } else {
          td.textContent = r[col] != null ? r[col] : '—';
        }
        row.appendChild(td);
      });
      const tdAct = document.createElement('td');
      tdAct.innerHTML = `<div class="td-actions">
        <button class="btn-icon" title="View" onclick="event.stopPropagation();viewCveDetail('${r.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        <button class="btn-icon" title="Edit" onclick="event.stopPropagation();editCve('${r.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon" title="Delete" onclick="event.stopPropagation();deleteCve('${r.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>`;
      row.appendChild(tdAct);
      tbody.appendChild(row);
    });
  }
  renderPagination('cve-pagination', 'cve', filtered.length);
}

function openCveModal(editId) {
  State.editingId = editId || null;
  State.tags.cve = [];
  State.pocs = [];
  State.refs = [];
  document.getElementById('cve-modal-title').textContent = editId ? 'Edit CVE Record' : 'Add CVE Record';
  document.getElementById('cve-id').value = '';
  document.getElementById('cve-severity').value = 'Medium';
  document.getElementById('cve-type').value = 'RCE';
  document.getElementById('cve-description').value = '';
  document.getElementById('cve-country').value = '';
  document.getElementById('cve-country-code').value = '';

  if (editId) {
    const r = State.cveRecords.find(x => x.id === editId);
    if (r) {
      document.getElementById('cve-id').value = r.cve_id || '';
      document.getElementById('cve-severity').value = r.severity || 'Medium';
      document.getElementById('cve-type').value = r.type || 'RCE';
      document.getElementById('cve-description').value = r.description || '';
      const countryOpt = Array.from(document.getElementById('cve-country').options).find(o => o.value === r.country);
      if (countryOpt) {
        document.getElementById('cve-country').value = r.country || '';
        document.getElementById('cve-country-code').value = r.country_code || countryOpt.dataset.code || '';
      }
      State.tags.cve = [...(r.tags || [])];
      State.pocs = (r.poc_codes || []).map(p => ({...p}));
      State.refs = [...(r.references || [])];
    }
  }

  // Populate groups
  const groupsSel = document.getElementById('cve-groups');
  groupsSel.innerHTML = '';
  State.groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id; opt.textContent = g.name;
    groupsSel.appendChild(opt);
  });

  // Custom fields
  const customDiv = document.getElementById('cve-custom-fields');
  customDiv.innerHTML = '';
  if (State.cveCustomCols.length) {
    customDiv.innerHTML = '<div class="divider"></div><div style="font-size:11px;color:var(--text2);font-family:var(--font-mono);margin-bottom:12px;">CUSTOM FIELDS</div>';
    const grid = document.createElement('div');
    grid.className = 'form-row cols-2';
    const editRecord = editId ? State.cveRecords.find(x => x.id === editId) : null;
    State.cveCustomCols.forEach(col => {
      const fg = document.createElement('div');
      fg.className = 'form-group';
      fg.innerHTML = `<label class="form-label">${esc(col)}</label><input class="form-input" id="cve-custom-${esc(col)}" value="${esc(editRecord?.custom?.[col]||'')}" placeholder="${esc(col)}" />`;
      grid.appendChild(fg);
    });
    customDiv.appendChild(grid);
  }

  renderTags('cve');
  renderPocs();
  renderRefs();

  // Show/hide admin fields
  const isAdmin = State.user?.role === 'admin';
  document.querySelectorAll('#cve-modal .admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  openModal('cve-modal');
}

async function saveCve() {
  const cve_id = document.getElementById('cve-id').value.trim();
  if (!cve_id) { toast('CVE ID is required', 'error'); return; }

  const custom = {};
  State.cveCustomCols.forEach(col => {
    const el = document.getElementById(`cve-custom-${col}`);
    if (el) custom[col] = el.value.trim();
  });

  const groupsSel = document.getElementById('cve-groups');
  const groups = Array.from(groupsSel.selectedOptions).map(o => o.value);

  const countryEl = document.getElementById('cve-country');
  const country = countryEl.value;
  const country_code = document.getElementById('cve-country-code').value;

  const payload = {
    cve_id,
    severity: document.getElementById('cve-severity').value,
    type: document.getElementById('cve-type').value,
    description: document.getElementById('cve-description').value.trim(),
    references: State.refs.filter(r => r.trim()),
    poc_codes: State.pocs,
    country,
    country_code,
    tags: State.tags.cve,
    groups,
    custom
  };

  try {
    if (State.editingId) {
      await api('PUT', `/cve/${State.editingId}`, payload);
      toast('CVE updated', 'success');
    } else {
      await api('POST', '/cve', payload);
      toast('CVE added', 'success');
    }
    closeModal('cve-modal');
    loadCve();
  } catch(e) { toast(e.message, 'error'); }
}

async function editCve(id) { await loadCve(); openCveModal(id); }

async function deleteCve(id) {
  confirmAction('Delete this CVE record?', async () => {
    try {
      await api('DELETE', `/cve/${id}`);
      toast('CVE deleted', 'success');
      loadCve();
    } catch(e) { toast(e.message, 'error'); }
  });
}

function viewCveDetail(id) {
  const r = State.cveRecords.find(x => x.id === id);
  if (!r) return;
  document.getElementById('cve-detail-title').textContent = r.cve_id || 'CVE Detail';
  const body = document.getElementById('cve-detail-body');
  body.innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
      ${severityBadge(r.severity)} ${typeBadge(r.type)}
      ${r.country ? `<span class="badge badge-info">🌍 ${esc(r.country)}</span>` : ''}
    </div>
    ${r.description ? `<div style="margin-bottom:16px;color:var(--text2);font-size:12px;line-height:1.6;">${esc(r.description)}</div>` : ''}
    ${r.references?.length ? `
      <div style="margin-bottom:16px;">
        <div class="form-label" style="margin-bottom:8px;">References</div>
        ${r.references.map(ref => `<div style="margin-bottom:4px;"><a href="${esc(ref)}" target="_blank" style="color:var(--blue);font-size:11px;font-family:var(--font-mono);">${esc(ref)}</a></div>`).join('')}
      </div>` : ''}
    ${r.poc_codes?.length ? `
      <div style="margin-bottom:16px;">
        <div class="form-label" style="margin-bottom:8px;">PoC Codes</div>
        ${r.poc_codes.map((poc, i) => `
          <div class="poc-entry" style="margin-bottom:8px;">
            <div class="poc-header" onclick="this.nextElementSibling.classList.toggle('open')">
              <span>${esc(poc.title||`PoC #${i+1}`)} <span style="color:var(--text3)">[${esc(poc.language||'code')}]</span></span>
              <span>▼</span>
            </div>
            <div class="poc-body ${i===0?'open':''}">
              <div class="code-block">${esc(poc.code||'')}</div>
            </div>
          </div>`).join('')}
      </div>` : ''}
    ${r.tags?.length ? `<div class="tags-container">${r.tags.map(t=>`<span class="badge badge-tag">${esc(t)}</span>`).join('')}</div>` : ''}
    <div style="margin-top:16px;font-size:10px;color:var(--text3);font-family:var(--font-mono);">
      Created: ${r.created_at?.split('T')[0]||'—'} | Updated: ${r.updated_at?.split('T')[0]||'—'}
    </div>`;
  document.getElementById('cve-detail-edit-btn').onclick = () => { closeModal('cve-detail-modal'); editCve(id); };
  openModal('cve-detail-modal');
}

async function addCveColumn() {
  const name = prompt('New column name:');
  if (!name?.trim()) return;
  try {
    await api('POST', '/cve/columns', { name: name.trim() });
    toast('Column added', 'success');
    loadCve();
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════════════
async function loadDashboard() {
  try {
    const [dashRes, cveRes] = await Promise.all([api('GET', '/dashboard'), api('GET', '/cve')]);
    State.dashEntries = dashRes.entries || [];
    State.dashCustomCols = dashRes.custom_columns || [];
    State.cveRecords = cveRes.records || [];
    // Populate CVE selector for the modal
    const sel = document.getElementById('dash-cve-refs');
    sel.innerHTML = '';
    State.cveRecords.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.cve_id} [${r.severity}]`;
      sel.appendChild(opt);
    });
    renderDashStats();
    renderDashTable();
  } catch(e) { toast(e.message, 'error'); }
}

function filterDashboard() {
  State.page.dash = 1;
  renderDashTable();
}

function getFilteredDash() {
  const search = (document.getElementById('dash-search')?.value || '').toLowerCase();
  const status = document.getElementById('dash-filter-status')?.value || '';
  const country = document.getElementById('dash-filter-country')?.value || '';
  return State.dashEntries.filter(e => {
    if (status && e.status !== status) return false;
    if (country && e.country !== country) return false;
    if (search) {
      const hay = JSON.stringify(e).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function renderDashStats() {
  const entries = State.dashEntries;
  const active = entries.filter(e => e.status === 'Active').length;
  const countries = new Set(entries.map(e => e.country).filter(Boolean)).size;
  const cveRefs = new Set(entries.flatMap(e => e.cve_refs||[])).size;
  const container = document.getElementById('dash-stats');
  if (!container) return;
  container.innerHTML = `
    <div class="stat-card"><div class="stat-value">${entries.length}</div><div class="stat-label">Total Entries</div></div>
    <div class="stat-card"><div class="stat-value text-green">${active}</div><div class="stat-label">Active Hosts</div></div>
    <div class="stat-card"><div class="stat-value text-yellow">${countries}</div><div class="stat-label">Countries</div></div>
    <div class="stat-card"><div class="stat-value text-accent">${cveRefs}</div><div class="stat-label">CVE References</div></div>`;
}

function renderDashTable(overrideData) {
  const filtered = overrideData || sortData(getFilteredDash(), State.sortState.dash.col, State.sortState.dash.dir);
  const cols = ['index','host','ip','port','protocol','service','os','country','status','cve_refs','tags',
    ...State.dashCustomCols.map(c => 'custom.' + c)];
  const colLabels = {
    index:'#', host:'Hostname', ip:'IP Address', port:'Port', protocol:'Protocol',
    service:'Service', os:'OS', country:'Country', status:'Status', cve_refs:'CVEs', tags:'Tags'
  };

  const thead = document.getElementById('dash-thead');
  thead.innerHTML = '';
  const tr = document.createElement('tr');
  cols.forEach(col => {
    const th = document.createElement('th');
    const displayCol = col.startsWith('custom.') ? col.slice(7) : col;
    const label = colLabels[col] || displayCol;
    th.className = State.sortState.dash.col === col ? 'sorted' : '';
    th.onclick = () => handleSort('dash', col);
    th.innerHTML = `${esc(label)} ${renderSortIcon('dash', col)}`;
    tr.appendChild(th);
  });
  const thAct = document.createElement('th');
  thAct.textContent = 'Actions';
  tr.appendChild(thAct);
  thead.appendChild(tr);

  const tbody = document.getElementById('dash-tbody');
  tbody.innerHTML = '';
  const paged = overrideData ? filtered : paginateData(filtered, 'dash');
  if (!paged.length) {
    const emptyRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length + 1;
    td.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><p>No entries found</p></div>`;
    emptyRow.appendChild(td);
    tbody.appendChild(emptyRow);
  } else {
    paged.forEach(e => {
      const row = document.createElement('tr');
      cols.forEach(col => {
        const td = document.createElement('td');
        if (col === 'status') td.innerHTML = statusBadge(e.status);
        else if (col === 'tags') {
          td.innerHTML = (e.tags||[]).map(t=>`<span class="badge badge-tag">${esc(t)}</span>`).join(' ') || '<span class="text-dim">—</span>';
        } else if (col === 'cve_refs') {
          const cveIds = (e.cve_refs||[]).map(refId => {
            const cve = State.cveRecords.find(r => r.id === refId);
            return cve ? `<span class="cve-ref-tag">${esc(cve.cve_id)}</span>` : '';
          }).filter(Boolean);
          td.innerHTML = cveIds.join('') || '<span class="text-dim">—</span>';
        } else if (col.startsWith('custom.')) {
          td.textContent = (e.custom||{})[col.slice(7)] || '—';
        } else {
          td.textContent = e[col] != null ? e[col] : '—';
        }
        row.appendChild(td);
      });
      const tdAct = document.createElement('td');
      tdAct.innerHTML = `<div class="td-actions">
        <button class="btn-icon" title="Edit" onclick="editDashEntry('${e.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon" title="Delete" onclick="deleteDashEntry('${e.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>`;
      row.appendChild(tdAct);
      tbody.appendChild(row);
    });
  }
  if (!overrideData) renderPagination('dash-pagination', 'dash', filtered.length);
}

function openDashboardModal(editId) {
  State.editingId = editId || null;
  State.tags.dash = [];
  document.getElementById('dash-modal-title').textContent = editId ? 'Edit Access Entry' : 'Add Access Entry';
  const fields = ['host','ip','port','service','os','notes'];
  fields.forEach(f => { document.getElementById('dash-'+f).value = ''; });
  document.getElementById('dash-protocol').value = '';
  document.getElementById('dash-status').value = 'Active';
  document.getElementById('dash-country').value = '';
  document.getElementById('dash-country-code').value = '';
  // Reset CVE refs
  Array.from(document.getElementById('dash-cve-refs').options).forEach(o => o.selected = false);

  if (editId) {
    const e = State.dashEntries.find(x => x.id === editId);
    if (e) {
      document.getElementById('dash-host').value = e.host || '';
      document.getElementById('dash-ip').value = e.ip || '';
      document.getElementById('dash-port').value = e.port || '';
      document.getElementById('dash-protocol').value = e.protocol || '';
      document.getElementById('dash-service').value = e.service || '';
      document.getElementById('dash-os').value = e.os || '';
      document.getElementById('dash-status').value = e.status || 'Active';
      document.getElementById('dash-notes').value = e.notes || '';
      document.getElementById('dash-country').value = e.country || '';
      document.getElementById('dash-country-code').value = e.country_code || '';
      State.tags.dash = [...(e.tags || [])];
      // Set CVE refs
      const sel = document.getElementById('dash-cve-refs');
      Array.from(sel.options).forEach(o => { o.selected = (e.cve_refs||[]).includes(o.value); });
    }
  }

  // Groups
  const groupsSel = document.getElementById('dash-groups');
  groupsSel.innerHTML = '';
  State.groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id; opt.textContent = g.name;
    groupsSel.appendChild(opt);
  });

  // Custom fields
  const customDiv = document.getElementById('dash-custom-fields');
  customDiv.innerHTML = '';
  if (State.dashCustomCols.length) {
    customDiv.innerHTML = '<div class="divider"></div><div style="font-size:11px;color:var(--text2);font-family:var(--font-mono);margin-bottom:12px;">CUSTOM FIELDS</div>';
    const grid = document.createElement('div');
    grid.className = 'form-row cols-2';
    const editEntry = editId ? State.dashEntries.find(x => x.id === editId) : null;
    State.dashCustomCols.forEach(col => {
      const fg = document.createElement('div');
      fg.className = 'form-group';
      fg.innerHTML = `<label class="form-label">${esc(col)}</label><input class="form-input" id="dash-custom-${esc(col)}" value="${esc(editEntry?.custom?.[col]||'')}" placeholder="${esc(col)}" />`;
      grid.appendChild(fg);
    });
    customDiv.appendChild(grid);
  }

  renderTags('dash');
  const isAdmin = State.user?.role === 'admin';
  document.querySelectorAll('#dash-modal .admin-only').forEach(el => { el.style.display = isAdmin ? '' : 'none'; });
  openModal('dash-modal');
}

async function saveDashboard() {
  const custom = {};
  State.dashCustomCols.forEach(col => {
    const el = document.getElementById(`dash-custom-${col}`);
    if (el) custom[col] = el.value.trim();
  });
  const groupsSel = document.getElementById('dash-groups');
  const groups = Array.from(groupsSel.selectedOptions).map(o => o.value);
  const cveRefsSel = document.getElementById('dash-cve-refs');
  const cve_refs = Array.from(cveRefsSel.selectedOptions).map(o => o.value);
  const country = document.getElementById('dash-country').value;
  const country_code = document.getElementById('dash-country-code').value;

  const payload = {
    host: document.getElementById('dash-host').value.trim(),
    ip: document.getElementById('dash-ip').value.trim(),
    port: document.getElementById('dash-port').value.trim(),
    protocol: document.getElementById('dash-protocol').value,
    service: document.getElementById('dash-service').value.trim(),
    os: document.getElementById('dash-os').value.trim(),
    status: document.getElementById('dash-status').value,
    notes: document.getElementById('dash-notes').value.trim(),
    country, country_code,
    tags: State.tags.dash,
    cve_refs, groups, custom
  };

  try {
    if (State.editingId) {
      await api('PUT', `/dashboard/${State.editingId}`, payload);
      toast('Entry updated', 'success');
    } else {
      await api('POST', '/dashboard', payload);
      toast('Entry added', 'success');
    }
    closeModal('dash-modal');
    loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

async function editDashEntry(id) { await loadDashboard(); openDashboardModal(id); }

async function deleteDashEntry(id) {
  confirmAction('Delete this entry?', async () => {
    try {
      await api('DELETE', `/dashboard/${id}`);
      toast('Entry deleted', 'success');
      loadDashboard();
    } catch(e) { toast(e.message, 'error'); }
  });
}

async function addDashboardColumn() {
  const name = prompt('New column name:');
  if (!name?.trim()) return;
  try {
    await api('POST', '/dashboard/columns', { name: name.trim() });
    toast('Column added', 'success');
    loadDashboard();
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// Credentials
// ══════════════════════════════════════════════════════
async function loadCredentials() {
  try {
    const res = await api('GET', '/credentials');
    State.credentials = res.credentials || [];
    State.credCustomCols = res.custom_columns || [];
    renderCredTable();
  } catch(e) { toast(e.message, 'error'); }
}

function filterCredentials() {
  State.page.cred = 1;
  renderCredTable();
}

function getFilteredCred() {
  const search = (document.getElementById('cred-search')?.value || '').toLowerCase();
  const service = document.getElementById('cred-filter-service')?.value || '';
  return State.credentials.filter(c => {
    if (service && c.service !== service) return false;
    if (search) {
      const hay = JSON.stringify({...c, password:'***'}).toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

function renderCredTable() {
  const filtered = sortData(getFilteredCred(), State.sortState.cred.col, State.sortState.cred.dir);
  const cols = ['index','service','host','port','domain','username','password','notes','tags',
    ...State.credCustomCols.map(c => 'custom.' + c)];
  const colLabels = {
    index:'#', service:'Service', host:'Host', port:'Port', domain:'Domain',
    username:'Username', password:'Password', notes:'Notes', tags:'Tags'
  };

  const thead = document.getElementById('cred-thead');
  thead.innerHTML = '';
  const tr = document.createElement('tr');
  cols.forEach(col => {
    const th = document.createElement('th');
    const displayCol = col.startsWith('custom.') ? col.slice(7) : col;
    const label = colLabels[col] || displayCol;
    th.className = State.sortState.cred.col === col ? 'sorted' : '';
    th.onclick = () => handleSort('cred', col);
    th.innerHTML = `${esc(label)} ${renderSortIcon('cred', col)}`;
    tr.appendChild(th);
  });
  const thAct = document.createElement('th'); thAct.textContent = 'Actions'; tr.appendChild(thAct);
  thead.appendChild(tr);

  const tbody = document.getElementById('cred-tbody');
  tbody.innerHTML = '';
  const paged = paginateData(filtered, 'cred');

  if (!paged.length) {
    const emptyRow = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length + 1;
    td.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><p>No credentials stored</p></div>`;
    emptyRow.appendChild(td);
    tbody.appendChild(emptyRow);
  } else {
    paged.forEach(c => {
      const row = document.createElement('tr');
      cols.forEach(col => {
        const td = document.createElement('td');
        if (col === 'password') {
          td.innerHTML = `<span style="font-family:var(--font-mono);letter-spacing:2px;cursor:pointer;" data-revealed="false" data-val="${esc(c.password)}" onclick="toggleReveal(this)">••••••••</span>`;
        } else if (col === 'tags') {
          td.innerHTML = (c.tags||[]).map(t=>`<span class="badge badge-tag">${esc(t)}</span>`).join(' ') || '<span class="text-dim">—</span>';
        } else if (col === 'service') {
          td.innerHTML = `<span class="badge badge-info">${esc(c.service||'—')}</span>`;
        } else if (col.startsWith('custom.')) {
          td.textContent = (c.custom||{})[col.slice(7)] || '—';
        } else if (col === 'notes') {
          td.textContent = (c.notes||'').substring(0, 40) + (c.notes?.length > 40 ? '…' : '') || '—';
        } else {
          td.textContent = c[col] != null ? c[col] : '—';
        }
        row.appendChild(td);
      });
      const tdAct = document.createElement('td');
      tdAct.innerHTML = `<div class="td-actions">
        <button class="btn-icon" title="Edit" onclick="editCredential('${c.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon" title="Delete" onclick="deleteCredential('${c.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>`;
      row.appendChild(tdAct);
      tbody.appendChild(row);
    });
  }
  renderPagination('cred-pagination', 'cred', filtered.length);
}

function toggleReveal(el) {
  if (el.dataset.revealed === 'false') {
    el.textContent = el.dataset.val;
    el.style.letterSpacing = '0';
    el.dataset.revealed = 'true';
  } else {
    el.textContent = '••••••••';
    el.style.letterSpacing = '2px';
    el.dataset.revealed = 'false';
  }
}

function openCredModal(editId) {
  State.editingId = editId || null;
  State.tags.cred = [];
  document.getElementById('cred-modal-title').textContent = editId ? 'Edit Credential' : 'Add Credential';
  ['service','host','port','username','domain','notes'].forEach(f => {
    const el = document.getElementById('cred-'+f);
    if (el) el.value = '';
  });
  document.getElementById('cred-password').value = '';

  if (editId) {
    const c = State.credentials.find(x => x.id === editId);
    if (c) {
      document.getElementById('cred-service').value = c.service || '';
      document.getElementById('cred-host').value = c.host || '';
      document.getElementById('cred-port').value = c.port || '';
      document.getElementById('cred-username').value = c.username || '';
      document.getElementById('cred-password').value = c.password || '';
      document.getElementById('cred-domain').value = c.domain || '';
      document.getElementById('cred-notes').value = c.notes || '';
      State.tags.cred = [...(c.tags || [])];
    }
  }

  const groupsSel = document.getElementById('cred-groups');
  groupsSel.innerHTML = '';
  State.groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id; opt.textContent = g.name;
    groupsSel.appendChild(opt);
  });

  const customDiv = document.getElementById('cred-custom-fields');
  customDiv.innerHTML = '';
  if (State.credCustomCols.length) {
    customDiv.innerHTML = '<div class="divider"></div><div style="font-size:11px;color:var(--text2);font-family:var(--font-mono);margin-bottom:12px;">CUSTOM FIELDS</div>';
    const grid = document.createElement('div'); grid.className = 'form-row cols-2';
    const editRecord = editId ? State.credentials.find(x => x.id === editId) : null;
    State.credCustomCols.forEach(col => {
      const fg = document.createElement('div'); fg.className = 'form-group';
      fg.innerHTML = `<label class="form-label">${esc(col)}</label><input class="form-input" id="cred-custom-${esc(col)}" value="${esc(editRecord?.custom?.[col]||'')}" placeholder="${esc(col)}" />`;
      grid.appendChild(fg);
    });
    customDiv.appendChild(grid);
  }

  renderTags('cred');
  const isAdmin = State.user?.role === 'admin';
  document.querySelectorAll('#cred-modal .admin-only').forEach(el => { el.style.display = isAdmin ? '' : 'none'; });
  openModal('cred-modal');
}

async function saveCredential() {
  const service = document.getElementById('cred-service').value;
  if (!service) { toast('Service is required', 'error'); return; }

  const custom = {};
  State.credCustomCols.forEach(col => {
    const el = document.getElementById(`cred-custom-${col}`);
    if (el) custom[col] = el.value.trim();
  });
  const groupsSel = document.getElementById('cred-groups');
  const groups = Array.from(groupsSel.selectedOptions).map(o => o.value);

  const payload = {
    service,
    host: document.getElementById('cred-host').value.trim(),
    port: document.getElementById('cred-port').value.trim(),
    username: document.getElementById('cred-username').value.trim(),
    password: document.getElementById('cred-password').value,
    domain: document.getElementById('cred-domain').value.trim(),
    notes: document.getElementById('cred-notes').value.trim(),
    tags: State.tags.cred,
    groups, custom
  };

  try {
    if (State.editingId) {
      await api('PUT', `/credentials/${State.editingId}`, payload);
      toast('Credential updated', 'success');
    } else {
      await api('POST', '/credentials', payload);
      toast('Credential saved', 'success');
    }
    closeModal('cred-modal');
    loadCredentials();
  } catch(e) { toast(e.message, 'error'); }
}

async function editCredential(id) { await loadCredentials(); openCredModal(id); }

async function deleteCredential(id) {
  confirmAction('Delete this credential?', async () => {
    try {
      await api('DELETE', `/credentials/${id}`);
      toast('Credential deleted', 'success');
      loadCredentials();
    } catch(e) { toast(e.message, 'error'); }
  });
}

async function addCredentialColumn() {
  const name = prompt('New column name:');
  if (!name?.trim()) return;
  try {
    await api('POST', '/credentials/columns', { name: name.trim() });
    toast('Column added', 'success');
    loadCredentials();
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// Users & Groups
// ══════════════════════════════════════════════════════
async function loadUsers() {
  try {
    const [users, groups] = await Promise.all([api('GET', '/users'), api('GET', '/groups')]);
    State.users = users;
    State.groups = groups;
    renderUsersTable();
    renderGroupsTable();
  } catch(e) { toast(e.message, 'error'); }
}

function renderUsersTable() {
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '';
  State.users.forEach((u, i) => {
    const groupNames = (u.groups||[]).map(gid => {
      const g = State.groups.find(x => x.id === gid);
      return g ? `<span class="badge badge-info">${esc(g.name)}</span>` : '';
    }).join(' ');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i+1}</td>
      <td><span class="text-mono">${esc(u.username)}</span></td>
      <td><span class="badge ${u.role==='admin'?'badge-high':'badge-low'}">${esc(u.role)}</span></td>
      <td>${groupNames || '<span class="text-dim">—</span>'}</td>
      <td>${u.active ? '<span class="pill pill-active">● Active</span>' : '<span class="pill pill-inactive">● Disabled</span>'}</td>
      <td class="text-mono text-dim">${u.created_at?.split('T')[0]||'—'}</td>
      <td><div class="td-actions">
        <button class="btn-icon" onclick="editUser('${u.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn-icon" onclick="toggleUserActive('${u.id}',${!u.active})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="${u.active?'M18.36 6.64a9 9 0 1 1-12.73 0':'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z'}"/></svg>
        </button>
        <button class="btn-icon" onclick="deleteUser('${u.id}')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div></td>`;
    tbody.appendChild(row);
  });
}

function renderGroupsTable() {
  const tbody = document.getElementById('groups-tbody');
  tbody.innerHTML = '';
  State.groups.forEach((g, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i+1}</td>
      <td><span class="text-mono text-accent">${esc(g.name)}</span></td>
      <td class="text-dim">${esc(g.description||'—')}</td>
      <td class="text-mono text-dim">${g.created_at?.split('T')[0]||'—'}</td>
      <td><button class="btn-icon" onclick="deleteGroup('${g.id}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
      </button></td>`;
    tbody.appendChild(row);
  });
}

function openUserModal(editId) {
  State.editingId = editId || null;
  document.getElementById('user-modal-title').textContent = editId ? 'Edit User' : 'Add User';
  document.getElementById('user-username').value = '';
  document.getElementById('user-password').value = '';
  document.getElementById('user-role').value = 'user';
  const groupsSel = document.getElementById('user-groups');
  groupsSel.innerHTML = '';
  State.groups.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id; opt.textContent = g.name;
    groupsSel.appendChild(opt);
  });
  if (editId) {
    const u = State.users.find(x => x.id === editId);
    if (u) {
      document.getElementById('user-username').value = u.username;
      document.getElementById('user-role').value = u.role;
      Array.from(groupsSel.options).forEach(o => { o.selected = (u.groups||[]).includes(o.value); });
    }
  }
  openModal('user-modal');
}

async function saveUser() {
  const username = document.getElementById('user-username').value.trim();
  const password = document.getElementById('user-password').value;
  const role = document.getElementById('user-role').value;
  const groupsSel = document.getElementById('user-groups');
  const groups = Array.from(groupsSel.selectedOptions).map(o => o.value);
  if (!username) { toast('Username required', 'error'); return; }
  if (!State.editingId && (!password || password.length < 8)) { toast('Password min 8 chars', 'error'); return; }
  try {
    if (State.editingId) {
      const payload = { role, groups };
      if (password) payload.password = password;
      await api('PUT', `/users/${State.editingId}`, payload);
      toast('User updated', 'success');
    } else {
      await api('POST', '/users', { username, password, role, groups });
      toast('User created', 'success');
    }
    closeModal('user-modal');
    loadUsers();
  } catch(e) { toast(e.message, 'error'); }
}

async function editUser(id) { openUserModal(id); }

async function toggleUserActive(id, active) {
  try {
    await api('PUT', `/users/${id}`, { active });
    toast(active ? 'User enabled' : 'User disabled', 'success');
    loadUsers();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteUser(id) {
  confirmAction('Delete this user?', async () => {
    try {
      await api('DELETE', `/users/${id}`);
      toast('User deleted', 'success');
      loadUsers();
    } catch(e) { toast(e.message, 'error'); }
  });
}

function openGroupModal() { openModal('group-modal'); document.getElementById('group-name').value = ''; document.getElementById('group-desc').value = ''; }

async function saveGroup() {
  const name = document.getElementById('group-name').value.trim();
  const description = document.getElementById('group-desc').value.trim();
  if (!name) { toast('Group name required', 'error'); return; }
  try {
    await api('POST', '/groups', { name, description });
    toast('Group created', 'success');
    closeModal('group-modal');
    loadUsers();
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteGroup(id) {
  confirmAction('Delete this group? Users will lose this group assignment.', async () => {
    try {
      await api('DELETE', `/groups/${id}`);
      toast('Group deleted', 'success');
      loadUsers();
    } catch(e) { toast(e.message, 'error'); }
  });
}

// ══════════════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════════════
async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  if (!username || !password) { errEl.textContent = 'Username and password required'; errEl.classList.remove('hidden'); return; }

  const isBootstrap = document.getElementById('login-mode-label').textContent.includes('FIRST BOOT');
  if (isBootstrap) {
    const confirm = document.getElementById('login-confirm').value;
    if (password !== confirm) { errEl.textContent = 'Passwords do not match'; errEl.classList.remove('hidden'); return; }
    if (password.length < 8) { errEl.textContent = 'Password must be at least 8 characters'; errEl.classList.remove('hidden'); return; }
    try {
      await api('POST', '/bootstrap', { username, password });
      toast('Admin account created! Please sign in.', 'success');
      document.getElementById('login-mode-label').textContent = 'Threat Intelligence Platform';
      document.getElementById('bootstrap-extra').classList.add('hidden');
      document.getElementById('login-btn-text').textContent = 'Sign In';
      document.getElementById('login-password').value = '';
      return;
    } catch(e) { errEl.textContent = e.message; errEl.classList.remove('hidden'); return; }
  }

  try {
    const res = await api('POST', '/login', { username, password });
    State.user = res.user;
    initApp();
  } catch(e) {
    errEl.textContent = e.message || 'Invalid credentials';
    errEl.classList.remove('hidden');
  }
}

async function doLogout() {
  try { await api('POST', '/logout'); } catch {}
  State.user = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('login-password').value = '';
}

function openChangePassword() { openModal('changepwd-modal'); ['cp-old','cp-new','cp-confirm'].forEach(id => document.getElementById(id).value = ''); }

async function doChangePassword() {
  const old_password = document.getElementById('cp-old').value;
  const new_password = document.getElementById('cp-new').value;
  const confirm_pw = document.getElementById('cp-confirm').value;
  if (new_password !== confirm_pw) { toast('Passwords do not match', 'error'); return; }
  if (new_password.length < 8) { toast('Min 8 characters required', 'error'); return; }
  try {
    await api('POST', '/change-password', { old_password, new_password });
    toast('Password changed successfully', 'success');
    closeModal('changepwd-modal');
  } catch(e) { toast(e.message, 'error'); }
}

// ══════════════════════════════════════════════════════
// 3D Globe
// ══════════════════════════════════════════════════════
let globeRenderer, globeScene, globeCamera, globeGlobe, globeControls;
let globeArcs = [], globeMarkers = [], globeAnimId = null;
let isDragging = false, prevMouse = { x: 0, y: 0 };
let targetRotation = { x: 0.3, y: 0 }, currentRotation = { x: 0.3, y: 0 };
let zoom = 2.2;

function initGlobe() {
  const canvas = document.getElementById('globe-canvas');
  const container = document.getElementById('globe-container');
  if (!canvas || !container || !window.THREE) return;

  // Cleanup previous
  if (globeAnimId) { cancelAnimationFrame(globeAnimId); globeAnimId = null; }
  if (globeRenderer) { globeRenderer.dispose(); globeRenderer = null; }

  const w = container.clientWidth;
  const h = container.clientHeight;

  globeRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  globeRenderer.setSize(w, h);
  globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  globeRenderer.setClearColor(0x000000, 1);

  globeScene = new THREE.Scene();
  globeCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
  globeCamera.position.set(0, 0, zoom);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  globeScene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 3, 5);
  globeScene.add(dirLight);

  // Globe sphere
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0x0a0a0a,
    emissive: 0x111111,
    specular: 0x333333,
    shininess: 20,
    wireframe: false
  });
  globeGlobe = new THREE.Mesh(globeGeo, globeMat);
  globeScene.add(globeGlobe);

  // Wireframe overlay (subtle)
  const wireGeo = new THREE.SphereGeometry(1.001, 32, 32);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, wireframe: true, transparent: true, opacity: 0.15 });
  globeScene.add(new THREE.Mesh(wireGeo, wireMat));

  // Atmosphere glow
  const atmGeo = new THREE.SphereGeometry(1.08, 32, 32);
  const atmMat = new THREE.MeshPhongMaterial({
    color: 0x222222, transparent: true, opacity: 0.15, side: THREE.BackSide
  });
  globeScene.add(new THREE.Mesh(atmGeo, atmMat));

  // Lat/Lon grid lines
  addGridLines();

  // Draw country outlines from GeoJSON
  loadGeoJSON();

  // Mouse controls
  canvas.addEventListener('mousedown', onGlobeMouseDown);
  canvas.addEventListener('mousemove', onGlobeMouseMove);
  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mouseleave', () => { isDragging = false; });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    zoom = Math.max(1.4, Math.min(5, zoom + e.deltaY * 0.002));
    globeCamera.position.z = zoom;
  }, { passive: false });

  // Touch controls
  let lastTouchDist = 0;
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - prevMouse.x;
      const dy = e.touches[0].clientY - prevMouse.y;
      targetRotation.y += dx * 0.005;
      targetRotation.x = Math.max(-1.4, Math.min(1.4, targetRotation.x + dy * 0.005));
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      zoom = Math.max(1.4, Math.min(5, zoom - (dist - lastTouchDist) * 0.005));
      globeCamera.position.z = zoom;
      lastTouchDist = dist;
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  // Resize
  const resizeObs = new ResizeObserver(() => {
    if (!globeRenderer) return;
    const w2 = container.clientWidth, h2 = container.clientHeight;
    globeRenderer.setSize(w2, h2);
    globeCamera.aspect = w2 / h2;
    globeCamera.updateProjectionMatrix();
  });
  resizeObs.observe(container);

  animate();
  // Markers will be added by loadGlobeData -> rebuildGlobeWithChildren
  if (State.globeData.length) rebuildGlobeWithChildren();
}

function addGridLines() {
  const mat = new THREE.LineBasicMaterial({ color: 0x1e1e1e, transparent: true, opacity: 0.5 });
  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const phi = (90 - lat) * Math.PI / 180;
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      const r = Math.sin(phi);
      points.push(new THREE.Vector3(r * Math.cos(theta), Math.cos(phi), r * Math.sin(theta)));
    }
    globeScene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
  }
  // Longitude lines
  for (let lon = 0; lon < 360; lon += 20) {
    const theta = lon * Math.PI / 180;
    const points = [];
    for (let i = 0; i <= 64; i++) {
      const phi = (i / 64) * Math.PI;
      points.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)
      ));
    }
    globeScene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat));
  }
}

async function loadGeoJSON() {
  // Simplified country outlines via fetch from CDN
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const topo = await res.json();
    drawTopoJSON(topo);
  } catch(e) {
    console.warn('Could not load GeoJSON:', e);
  }
}

function drawTopoJSON(topo) {
  if (!topo || !topo.objects) return;
  try {
    // Parse TopoJSON manually
    const countries = topo.objects.countries;
    if (!countries || !countries.geometries) return;
    const transform = topo.transform;
    const scale = transform?.scale || [1, 1];
    const translate = transform?.translate || [0, 0];

    const lineMat = new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.6 });

    countries.geometries.forEach(geo => {
      const arcs = geo.type === 'Polygon' ? [geo.arcs] : geo.type === 'MultiPolygon' ? geo.arcs : [];
      arcs.forEach(polygon => {
        polygon.forEach(ring => {
          const points = [];
          let cx = 0, cy = 0;
          ring.forEach(arcIdx => {
            const reversed = arcIdx < 0;
            const arc = topo.arcs[reversed ? ~arcIdx : arcIdx];
            if (!arc) return;
            let lx = 0, ly = 0;
            const arcPoints = reversed ? [...arc].reverse() : arc;
            arcPoints.forEach((delta, i) => {
              lx += delta[0]; ly += delta[1];
              const lon = (lx * scale[0] + translate[0]);
              const lat = (ly * scale[1] + translate[1]);
              const pos = latLonToVec3(lat, lon, 1.001);
              if (i > 0 || points.length === 0) points.push(pos);
            });
          });
          if (points.length > 1) {
            const geo3 = new THREE.BufferGeometry().setFromPoints(points);
            globeScene.add(new THREE.Line(geo3, lineMat));
          }
        });
      });
    });
  } catch(e) { console.warn('TopoJSON parse error:', e); }
}

function latLonToVec3(lat, lon, r) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function loadGlobeMarkers() {
  if (!globeGlobe) return rebuildGlobeWithChildren();
  rebuildGlobeWithChildren();
}

function onGlobeMouseDown(e) {
  isDragging = true;
  prevMouse = { x: e.clientX, y: e.clientY };
}

function onGlobeMouseMove(e) {
  if (isDragging) {
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    targetRotation.y += dx * 0.005;
    targetRotation.x = Math.max(-1.4, Math.min(1.4, targetRotation.x + dy * 0.005));
    prevMouse = { x: e.clientX, y: e.clientY };
    hideGlobeTooltip();
    return;
  }

  // Raycasting for hover
  if (!globeCamera || !globeScene || !globeGlobe) return;
  const canvas = document.getElementById('globe-canvas');
  const rect = canvas.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, globeCamera);
  const intersects = raycaster.intersectObjects(globeMarkers, true);
  if (intersects.length > 0) {
    const stat = intersects[0].object.userData;
    if (stat && stat.country) showGlobeTooltip(e, stat);
  } else {
    hideGlobeTooltip();
  }
}

function showGlobeTooltip(e, stat) {
  const tt = document.getElementById('globe-tooltip');
  const container = document.getElementById('globe-container');
  const rect = container.getBoundingClientRect();
  tt.style.left = (e.clientX - rect.left + 12) + 'px';
  tt.style.top = (e.clientY - rect.top - 10) + 'px';
  tt.style.display = 'block';
  tt.innerHTML = `
    <div style="font-weight:600;color:var(--accent);margin-bottom:6px;">${esc(stat.country)} (${esc(stat.country_code)})</div>
    <div style="color:var(--text2);margin-bottom:2px;">● Accesses: <span style="color:var(--accent)">${stat.access_count}</span></div>
    <div style="color:var(--text2);margin-bottom:2px;">● CVEs: <span style="color:var(--yellow)">${stat.cve_count}</span></div>
    ${stat.services?.length ? `<div style="color:var(--text2);margin-bottom:2px;">● Services: <span style="color:var(--blue)">${esc(stat.services.join(', '))}</span></div>` : ''}
    ${stat.cve_types?.length ? `<div style="color:var(--text2);">● Types: <span style="color:var(--red)">${esc(stat.cve_types.join(', '))}</span></div>` : ''}
    <div style="margin-top:6px;color:var(--text3);font-size:10px;">Click to filter table</div>`;
}

function hideGlobeTooltip() {
  const tt = document.getElementById('globe-tooltip');
  if (tt) tt.style.display = 'none';
}

// Click on globe to filter
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('globe-canvas');
  if (canvas) {
    canvas.addEventListener('click', e => {
      if (!globeCamera || !globeScene || !globeGlobe) return;
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, globeCamera);
      const intersects = raycaster.intersectObjects(globeMarkers, true);
      if (intersects.length > 0) {
        const stat = intersects[0].object.userData;
        if (stat?.country) filterByCountry(stat);
      }
    });
  }
});

function filterByCountry(stat) {
  if (!stat || !stat.country) return;
  State.globeSelectedCountry = stat;
  State.globeFilterCountry = stat.country;

  document.getElementById('globe-selected-card').style.display = '';
  document.getElementById('globe-selected-title').textContent = `${stat.country} (${stat.country_code || ''})`;

  const body = document.getElementById('globe-selected-body');
  body.innerHTML = '';

  // Access count
  const accessDiv = document.createElement('div');
  accessDiv.style.marginBottom = '8px';
  accessDiv.innerHTML = `<span class="form-label">Accesses</span><div class="stat-value" style="font-size:24px;">${stat.access_count}</div>`;
  body.appendChild(accessDiv);

  // CVE count
  const cveDiv = document.createElement('div');
  cveDiv.style.marginBottom = '8px';
  cveDiv.innerHTML = `<span class="form-label">CVE Count</span><div style="font-family:var(--font-mono);font-size:18px;color:var(--yellow);">${stat.cve_count}</div>`;
  body.appendChild(cveDiv);

  if (stat.services && stat.services.length) {
    const svcDiv = document.createElement('div');
    svcDiv.style.marginBottom = '8px';
    svcDiv.innerHTML = `<span class="form-label">Services</span><div style="margin-top:4px;">${stat.services.map(s=>`<span class="badge badge-info">${esc(s)}</span>`).join(' ')}</div>`;
    body.appendChild(svcDiv);
  }

  if (stat.cve_types && stat.cve_types.length) {
    const typDiv = document.createElement('div');
    typDiv.innerHTML = `<span class="form-label">Attack Types</span><div style="margin-top:4px;">${stat.cve_types.map(t=>`<span class="badge badge-rce">${esc(t)}</span>`).join(' ')}</div>`;
    body.appendChild(typDiv);
  }

  // Show filtered table
  const countryEntries = State.dashEntries.filter(e => e.country === stat.country);
  document.getElementById('globe-filtered-table').style.display = '';
  document.getElementById('globe-table-title').textContent = `Entries from ${stat.country} (${countryEntries.length})`;
  renderGlobeDashTable(countryEntries);
}

function renderGlobeDashTable(entries) {
  const cols = ['index','host','ip','port','service','country','status','cve_refs'];
  const colLabels = { index:'#', host:'Hostname', ip:'IP', port:'Port', service:'Service', country:'Country', status:'Status', cve_refs:'CVEs' };
  const thead = document.getElementById('globe-dash-thead');
  thead.innerHTML = '';
  const tr = document.createElement('tr');
  cols.forEach(col => {
    const th = document.createElement('th');
    th.textContent = colLabels[col] || col;
    tr.appendChild(th);
  });
  thead.appendChild(tr);

  const tbody = document.getElementById('globe-dash-tbody');
  tbody.innerHTML = '';
  if (!entries.length) {
    const row = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = cols.length;
    td.innerHTML = '<div class="empty-state"><p>No entries for this country</p></div>';
    row.appendChild(td);
    tbody.appendChild(row);
    return;
  }
  entries.forEach(e => {
    const row = document.createElement('tr');
    cols.forEach(col => {
      const td = document.createElement('td');
      if (col === 'status') td.innerHTML = statusBadge(e.status);
      else if (col === 'cve_refs') {
        const cveIds = (e.cve_refs||[]).map(refId => {
          const cve = State.cveRecords.find(r => r.id === refId);
          return cve ? `<span class="cve-ref-tag">${esc(cve.cve_id)}</span>` : '';
        }).filter(Boolean);
        td.innerHTML = cveIds.join('') || '—';
      } else {
        td.textContent = e[col] != null ? e[col] : '—';
      }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function clearGlobeSelection() {
  State.globeSelectedCountry = null;
  document.getElementById('globe-selected-card').style.display = 'none';
}

function clearGlobeFilter() {
  document.getElementById('globe-filtered-table').style.display = 'none';
  State.globeFilterCountry = null;
}

function animate() {
  globeAnimId = requestAnimationFrame(animate);
  if (!globeRenderer || !globeScene || !globeCamera) return;

  if (State.globeRotating && !isDragging) {
    targetRotation.y += 0.002;
  }

  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

  if (globeGlobe) {
    globeGlobe.rotation.x = currentRotation.x;
    globeGlobe.rotation.y = currentRotation.y;
  }

  // Pulse rings (children of globeGlobe)
  const t = Date.now() * 0.002;
  globeMarkers.forEach(m => {
    if (m.name === 'ring' && m.material) {
      m.material.opacity = 0.15 + 0.3 * Math.abs(Math.sin(t + m.id * 0.7));
      m.scale.setScalar(1 + 0.15 * Math.abs(Math.sin(t + m.id * 0.7)));
    }
  });

  globeRenderer.render(globeScene, globeCamera);
}

function resetGlobe() {
  targetRotation = { x: 0.3, y: 0 };
  zoom = 2.2;
  if (globeCamera) globeCamera.position.z = zoom;
}

function toggleGlobeRotation() {
  State.globeRotating = !State.globeRotating;
  document.getElementById('rotation-btn').textContent = State.globeRotating ? '⏸ Pause' : '▶ Resume';
}

async function loadGlobeData() {
  try {
    const data = await api('GET', '/stats/countries');
    State.globeData = data;
    // Load dashboard data too for filtering
    if (!State.dashEntries.length) {
      const res = await api('GET', '/dashboard');
      State.dashEntries = res.entries || [];
    }
    if (!State.cveRecords.length) {
      const cveRes = await api('GET', '/cve');
      State.cveRecords = cveRes.records || [];
    }
    renderGlobeCountryList();
    if (globeGlobe) rebuildGlobeWithChildren();
  } catch(e) { toast(e.message, 'error'); }
}

function renderGlobeCountryList() {
  const container = document.getElementById('globe-country-list');
  if (!container) return;
  const sorted = [...State.globeData].sort((a, b) => b.access_count - a.access_count);
  if (!sorted.length) {
    container.innerHTML = '<div class="empty-state"><p>No country data available.<br>Add entries with country info in Access Map.</p></div>';
    return;
  }
  container.innerHTML = '';
  sorted.forEach((s, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;';
    div.innerHTML = `
      <div>
        <div style="font-family:var(--font-mono);font-size:12px;color:var(--text);">${esc(s.country)} <span style="color:var(--text3)">(${esc(s.country_code)})</span></div>
        <div style="font-size:10px;color:var(--text3);">${s.cve_count} CVEs · ${(s.services||[]).slice(0,2).join(', ')}</div>
      </div>
      <span class="badge ${s.access_count>10?'badge-critical':s.access_count>5?'badge-high':s.access_count>2?'badge-medium':'badge-low'}">${s.access_count}</span>`;
    div.addEventListener('click', () => filterByCountry(s));
    container.appendChild(div);
  });
}

// Rebuild globe with rotation sync — attach markers to globe object
function rebuildGlobeWithChildren() {
  if (!globeGlobe) return;
  // Remove old children markers
  while (globeGlobe.children.length) globeGlobe.remove(globeGlobe.children[0]);
  globeMarkers = [];

  const data = State.globeData;
  if (!data.length) return;
  const maxCount = Math.max(...data.map(d => d.access_count));

  data.forEach(stat => {
    const coords = COUNTRY_COORDS[stat.country_code];
    if (!coords) return;
    const [lat, lon] = coords;
    const pos = latLonToVec3(lat, lon, 1.0);

    const ratio = stat.access_count / maxCount;
    const height = 0.05 + ratio * 0.5;
    const color = ratio > 0.75 ? 0xff0044 : ratio > 0.5 ? 0xff8800 : ratio > 0.25 ? 0xffcc00 : 0x00ff88;

    const geo = new THREE.CylinderGeometry(0.008, 0.015, height, 6);
    const mat = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 });
    const bar = new THREE.Mesh(geo, mat);

    const normal = pos.clone().normalize();
    bar.position.copy(pos.clone().add(normal.clone().multiplyScalar(height / 2)));
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
    bar.userData = stat;
    bar.name = 'marker';
    globeGlobe.add(bar);
    globeMarkers.push(bar);
  });
}

// ══════════════════════════════════════════════════════
// App Init
// ══════════════════════════════════════════════════════
async function initApp() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  document.getElementById('sb-username').textContent = State.user.username;
  document.getElementById('sb-role').textContent = State.user.role === 'admin' ? '[ ADMIN ]' : '[ USER ]';

  // Show/hide admin elements
  const isAdmin = State.user.role === 'admin';
  document.querySelectorAll('.admin-only').forEach(el => {
    el.style.display = isAdmin ? '' : 'none';
  });

  // Load groups
  try {
    State.groups = await api('GET', '/groups');
  } catch {}

  populateCountrySelects();
  startClock();
  navigate('dashboard');
}

// ══════════════════════════════════════════════════════
// Startup
// ══════════════════════════════════════════════════════
async function startup() {
  try {
    const status = await api('GET', '/status');
    if (!status.initialized) {
      // Show bootstrap form
      document.getElementById('login-mode-label').textContent = '⚠ FIRST BOOT — Admin Setup';
      document.getElementById('bootstrap-extra').classList.remove('hidden');
      document.getElementById('login-btn-text').textContent = 'Create Admin Account';
      return;
    }
    // Try to resume session
    try {
      const me = await api('GET', '/me');
      State.user = me;
      initApp();
      return;
    } catch {}
    // Show login
  } catch(e) {
    console.error('Startup error:', e);
  }
}

// Key bindings
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('login-screen').style.display !== 'none'
    && !document.getElementById('login-screen').classList.contains('hidden')) {
    handleLogin();
  }
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
  }
});

// Ensure globe markers are children of the globe mesh so they rotate with it
window.loadGlobeMarkers = function() {
  if (globeGlobe) rebuildGlobeWithChildren();
};

startup();
