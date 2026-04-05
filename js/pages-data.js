// ============================================
// Beneficiaries + Follow-ups Page Renderers
// ============================================

function renderBeneficiaries() {
  if (currentUser.role !== 'admin') return '<div class="empty-state"><h3>Access Denied</h3></div>';
  const cid = getCompanyId();
  const bens = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
  const companies = DB.getCompanies();
  const compMap = {}; companies.forEach(c => compMap[c.id] = c.name);

  const rows = bens.map(b => {
    const fups = DB.getFollowupsByBeneficiary(b.id);
    const m1 = fups.find(f => f.month === 1), m2 = fups.find(f => f.month === 2), m3 = fups.find(f => f.month === 3);
    const statusBadge = (fu) => {
      if (!fu) return '<span class="badge badge-muted">Pending</span>';
      if (fu.usageStatus === 'using comfortably') return '<span class="badge badge-success">✓ Using</span>';
      if (fu.usageStatus === 'using with some issues') return '<span class="badge badge-warning">~ Issues</span>';
      return '<span class="badge badge-danger">✗ Stopped</span>';
    };
    return `<tr>
      <td><strong>${b.fcpId}</strong></td>
      <td>${b.fullName}</td>
      <td>${DB.maskPhone(b.phone)}</td>
      <td>${compMap[b.companyId] || '—'}</td>
      <td>${b.ageGroup}</td>
      <td>${b.cupSize}</td>
      <td>${statusBadge(m1)}</td><td>${statusBadge(m2)}</td><td>${statusBadge(m3)}</td>
      <td><button class="btn btn-sm btn-ghost" onclick="viewBeneficiary('${b.id}')">👁</button></td>
    </tr>`;
  }).join('');

  return `<div class="page-header"><h1>Beneficiary Registry</h1>
    <button class="btn btn-primary" onclick="showAddBeneficiaryModal()">+ Register Beneficiary</button></div>
    <div class="table-card">
      <div class="table-toolbar"><div class="toolbar-left">
        <div class="search-wrapper"><input type="text" class="search-input" placeholder="Search by name/ID..." oninput="filterTable(this, 'benTable')"></div>
      </div><div class="toolbar-right"><span class="text-muted">${bens.length} beneficiaries</span></div></div>
      <div class="table-overflow"><table class="data-table" id="benTable"><thead><tr>
        <th>FCP ID</th><th>Name</th><th>Phone</th><th>Company</th><th>Age</th><th>Cup</th><th>M1</th><th>M2</th><th>M3</th><th>Actions</th>
      </tr></thead><tbody>${rows}</tbody></table></div>
      <div class="table-footer"><span>Showing ${bens.length} records</span></div>
    </div>`;
}

function showAddBeneficiaryModal() {
  const companies = DB.getCompanies();
  const sessions = DB.getSessions();
  openModal('Register Beneficiary', `
    <form id="benForm" onsubmit="return submitBeneficiary(event)">
      <div class="form-grid">
        <div class="form-group"><label>Company <span class="required">*</span></label>
          <select class="form-control" id="ben_company" required onchange="updateSessionsForBen()">
            ${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Session</label>
          <select class="form-control" id="ben_session">
            <option value="">— Select session —</option>
            ${sessions.map(s => `<option value="${s.id}" data-company="${s.companyId}">${DB.formatDate(s.sessionDate)} - ${s.sessionType}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Full Name <span class="required">*</span></label><input type="text" class="form-control" id="ben_name" required></div>
        <div class="form-group"><label>Phone Number <span class="required">*</span></label><input type="tel" class="form-control" id="ben_phone" required placeholder="10-digit number"></div>
        <div class="form-group"><label>Age Group</label>
          <select class="form-control" id="ben_age"><option value="18-24">18–24</option><option value="25-34" selected>25–34</option><option value="35-44">35–44</option><option value="45+">45+</option></select></div>
        <div class="form-group"><label>Cup Size</label>
          <select class="form-control" id="ben_cup"><option value="small">Small</option><option value="medium" selected>Medium</option><option value="large">Large</option><option value="not purchased">Not Purchased</option></select></div>
        <div class="form-group"><label>First-time User?</label>
          <select class="form-control" id="ben_firsttime"><option value="yes">Yes</option><option value="no">No</option></select></div>
        <div class="form-group"><label>Language</label>
          <select class="form-control" id="ben_lang"><option>Hindi</option><option>English</option><option>Marathi</option><option>Telugu</option><option>Kannada</option><option>Tamil</option><option>Bengali</option><option>Gujarati</option></select></div>
      </div>
      <div class="consent-box">
        <p>"By registering, the woman has verbally consented to Auleaves collecting her name, phone number, and menstrual health journey data for programme impact tracking. This data is confidential and will not be shared with the employer company."</p>
        <label><input type="checkbox" id="ben_consent" required> Consent has been verbally recorded</label>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">💾 Register</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>`);
}

function updateSessionsForBen() {
  const compId = document.getElementById('ben_company').value;
  const sessSel = document.getElementById('ben_session');
  const sessions = DB.getSessionsByCompany(compId);
  sessSel.innerHTML = '<option value="">— Select session —</option>' +
    sessions.map(s => `<option value="${s.id}">${DB.formatDate(s.sessionDate)} - ${s.sessionType}</option>`).join('');
}

function submitBeneficiary(e) {
  e.preventDefault();
  DB.addBeneficiary({
    companyId: document.getElementById('ben_company').value,
    sessionId: document.getElementById('ben_session').value,
    fullName: document.getElementById('ben_name').value,
    phone: document.getElementById('ben_phone').value,
    ageGroup: document.getElementById('ben_age').value,
    cupSize: document.getElementById('ben_cup').value,
    firstTimeUser: document.getElementById('ben_firsttime').value,
    language: document.getElementById('ben_lang').value,
    consentRecordedBy: currentUser.name,
    consentDate: new Date().toISOString().split('T')[0],
    registeredBy: 'admin'
  });
  closeModal();
  showToast('Beneficiary registered successfully!');
  navigateTo('beneficiaries');
  return false;
}

function viewBeneficiary(id) {
  const b = DB.getBeneficiary(id);
  if (!b) return;
  const comp = DB.getCompany(b.companyId);
  const fups = DB.getFollowupsByBeneficiary(b.id);
  const fupRows = fups.map(f => `<tr>
    <td>Month ${f.month}</td><td>${f.usageStatus}</td>
    <td>${f.recommendedToOthers}</td>
    <td>${f.verified ? '<span class="badge badge-success">✓ Verified</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
    <td>${DB.formatDate(f.date)}</td>
  </tr>`).join('');

  openModal(`${b.fcpId} — ${b.fullName}`, `
    <div class="form-grid">
      <div class="form-group"><label>Company</label><p>${comp ? comp.name : '—'}</p></div>
      <div class="form-group"><label>Phone</label><p>${currentUser.role === 'admin' ? b.phone : DB.maskPhone(b.phone)}</p></div>
      <div class="form-group"><label>Age Group</label><p>${b.ageGroup}</p></div>
      <div class="form-group"><label>Cup Size</label><p>${b.cupSize}</p></div>
      <div class="form-group"><label>First-time User</label><p>${b.firstTimeUser}</p></div>
      <div class="form-group"><label>Language</label><p>${b.language}</p></div>
      <div class="form-group"><label>Consent Date</label><p>${DB.formatDate(b.consentDate)}</p></div>
      <div class="form-group"><label>Registered</label><p>${DB.formatDate(b.registeredAt)}</p></div>
    </div>
    ${fups.length > 0 ? `<h4 style="margin:16px 0 8px;color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:1px">Follow-up History</h4>
      <table class="data-table"><thead><tr><th>Month</th><th>Status</th><th>Referred</th><th>Verified</th><th>Date</th></tr></thead>
      <tbody>${fupRows}</tbody></table>` : '<p class="text-muted mt-16">No follow-ups recorded yet.</p>'}`,
    '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
}

// ---- Follow-ups Page ----
function renderFollowups() {
  const cid = getCompanyId();
  const bens = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
  const isAdmin = currentUser.role === 'admin';

  // Use new cycleRecords API (with fallback to old followups for compatibility)
  let records;
  if (typeof DB.getCycleRecords === 'function') {
    records = cid ? DB.getCyclesByCompany(cid) : DB.getCycleRecords();
  } else {
    records = cid ? DB.getFollowupsByCompany(cid) : DB.getFollowups();
  }

  const compMap = {}; DB.getCompanies().forEach(c => compMap[c.id] = c.name);
  const benMap = {}; DB.getBeneficiaries().forEach(b => benMap[b.id] = b);

  // Overdue count
  const overdueCount = bens.filter(b => {
    const benRecords = records.filter(r => r.beneficiaryId === b.id);
    return !benRecords.some(r => (r.cycleNumber === 3 || r.month === 3));
  }).length;

  const rows = records.sort((a,b) => new Date(b.loggedAt || b.timestamp || 0) - new Date(a.loggedAt || a.timestamp || 0)).map(f => {
    const ben = benMap[f.beneficiaryId];
    const cycleNum = f.cycleNumber || f.month || '—';
    const usageStatus = f.usageStatus || f.status || '—';
    const verified = f.verifiedByAuleaves || f.verified;
    const recommended = f.recommendedToOthers || '—';
    return `<tr>
      <td>${ben ? ben.fcpId : '—'}</td>
      <td>${ben ? ben.fullName : '—'}</td>
      <td>${compMap[f.companyId] || '—'}</td>
      <td><span class="badge badge-info">Cycle ${cycleNum}</span></td>
      <td>${getStatusBadge(usageStatus)}</td>
      <td>${recommended === 'yes' ? '<span class="badge badge-success">Yes</span>' : recommended === 'no' ? '<span class="badge badge-danger">No</span>' : '<span class="badge badge-muted">Not sure</span>'}</td>
      <td>${verified ? '<span class="badge badge-success">✓ Verified</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
      <td class="d-flex gap-8 align-center">
        ${isAdmin && !verified ? `<button class="btn btn-sm btn-sage" onclick="verifyFollowup('${f.id}')">✓ Verify</button>` : ''}
        <button class="btn-delete-ben" onclick="deleteFollowupRecord('${f.id}','${f.beneficiaryId}')" title="Delete this check-in record">🗑</button>
        ${ben ? `<button class="btn-delete-ben" onclick="deleteFullBeneficiary('${f.beneficiaryId}')" title="Delete beneficiary completely" style="color:rgba(239,83,80,0.4)">👤✕</button>` : ''}
      </td>
    </tr>`;
  }).join('');

  return `<div class="page-header"><h1>Follow-up Check-ins</h1>
    <div class="d-flex gap-8">
      <button class="btn btn-primary" onclick="showAddFollowupModal()">+ Submit Check-in</button>
      <button class="btn btn-secondary" onclick="showExcelImportModal()">📥 Import from Excel</button>
      ${overdueCount > 0 ? `<span class="badge badge-warning" style="font-size:12px;padding:6px 12px">⚠ ${overdueCount} overdue (no Cycle 3)</span>` : ''}
    </div></div>
    <div class="table-card">
      <div class="table-toolbar"><div class="toolbar-left">
        <div class="search-wrapper"><input type="text" class="search-input" placeholder="Search..." oninput="filterTable(this, 'fupTable')"></div>
        <select class="filter-select" onchange="filterFollowupsByMonth(this.value)">
          <option value="">All Cycles</option><option value="1">Cycle 1</option><option value="2">Cycle 2</option><option value="3">Cycle 3</option>
        </select>
      </div><div class="toolbar-right"><span class="text-muted">${records.length} records</span></div></div>
      <div class="table-overflow"><table class="data-table" id="fupTable"><thead><tr>
        <th>FCP ID</th><th>Name</th><th>Company</th><th>Cycle</th><th>Status</th><th>Referred</th><th>Verified</th><th>Actions</th>
      </tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
}

function getStatusBadge(status) {
  const map = {
    'using comfortably': 'badge-success',
    'using with some issues': 'badge-warning',
    'tried-successful': 'badge-success',
    'successful': 'badge-success',
    'not-tried': 'badge-muted',
    'other-issues': 'badge-warning',
    'done': 'badge-success',
    'stopped': 'badge-danger',
    'stopped — discomfort': 'badge-danger',
    'stopped — other reason': 'badge-danger',
    'not yet tried': 'badge-muted',
    'not-adopted': 'badge-danger',
    'pending': 'badge-muted',
    'lost/needs replacement': 'badge-danger',
    'adopted': 'badge-success',
    'fu for cycle 2': 'badge-info',
    'fu for cycle 3': 'badge-info'
  };
  return `<span class="badge ${map[status] || 'badge-muted'}">${status}</span>`;
}

function filterFollowupsByMonth(month) {
  const table = document.getElementById('fupTable');
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    if (!month) { row.style.display = ''; return; }
    const monthCell = row.cells[3]?.textContent || '';
    row.style.display = monthCell.includes(month) ? '' : 'none';
  });
}

function showAddFollowupModal() {
  const cid = getCompanyId();
  const bens = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
  openModal('Submit Monthly Check-in', `
    <form onsubmit="return submitFollowup(event)">
      <div class="form-grid">
        <div class="form-group full-width"><label>Beneficiary <span class="required">*</span></label>
          <select class="form-control" id="fu_ben" required onchange="onFollowupBenChange(this.value)">
            ${bens.map(b => `<option value="${b.id}">${b.fcpId} — ${b.fullName}</option>`).join('')}
            <option value="__new__" style="color:#C2185B;font-weight:600">➕ Register New Beneficiary…</option>
          </select></div>

        <div id="newBenFields" class="hidden" style="grid-column:1/-1">
          <div style="background:rgba(194,24,91,0.06);border:1px solid rgba(194,24,91,0.2);border-radius:8px;padding:16px;margin-bottom:16px">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#E91E72;margin-bottom:12px;font-weight:600">New Beneficiary Details</div>
            <div class="form-grid">
              <div class="form-group"><label>Full Name <span class="required">*</span></label><input type="text" class="form-control" id="fu_new_name" placeholder="Full name"></div>
              <div class="form-group"><label>Phone</label><input type="tel" class="form-control" id="fu_new_phone" placeholder="Optional"></div>
              <div class="form-group"><label>Age Group</label>
                <select class="form-control" id="fu_new_age"><option value="18-24">18–24</option><option value="25-34" selected>25–34</option><option value="35-44">35–44</option><option value="45+">45+</option></select></div>
              <div class="form-group"><label>Cup Size</label>
                <select class="form-control" id="fu_new_cup"><option value="small">Small</option><option value="medium" selected>Medium</option><option value="large">Large</option></select></div>
              <div class="form-group"><label>First-time User?</label>
                <select class="form-control" id="fu_new_first"><option value="yes">Yes</option><option value="no">No</option></select></div>
              <div class="form-group"><label>Language</label>
                <select class="form-control" id="fu_new_lang"><option>Hindi</option><option>English</option><option>Marathi</option><option>Telugu</option><option>Kannada</option><option>Tamil</option><option>Bengali</option><option>Gujarati</option></select></div>
            </div>
          </div>
        </div>

        <div class="form-group"><label>Cycle <span class="required">*</span></label>
          <select class="form-control" id="fu_month" required><option value="1">Cycle 1</option><option value="2">Cycle 2</option><option value="3">Cycle 3</option></select></div>
        <div class="form-group"><label>Date</label>
          <input type="date" class="form-control" id="fu_date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group full-width"><label>Usage Status <span class="required">*</span></label>
          <select class="form-control" id="fu_status" required>
            <option value="tried-successful">Tried but successful</option>
            <option value="successful">Successful</option>
            <option value="not-tried">Not tried at all</option>
            <option value="other-issues">Other issues</option>
          </select></div>
        <div class="form-group"><label>Recommended to Others?</label>
          <select class="form-control" id="fu_recommend"><option value="yes">Yes</option><option value="no">No</option><option value="not sure">Not sure</option></select></div>
        <div class="form-group"><label>Notes</label>
          <textarea class="form-control" id="fu_notes" placeholder="Optional notes..."></textarea></div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">💾 Submit</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>`);
}

function onFollowupBenChange(value) {
  const newBenFields = document.getElementById('newBenFields');
  if (value === '__new__') {
    newBenFields.classList.remove('hidden');
  } else {
    newBenFields.classList.add('hidden');
  }
}

function submitFollowup(e) {
  e.preventDefault();
  let benId = document.getElementById('fu_ben').value;
  let ben;

  // If "Register New" was selected, create beneficiary first
  if (benId === '__new__') {
    const name  = document.getElementById('fu_new_name')?.value?.trim();
    const phone = document.getElementById('fu_new_phone')?.value?.trim() || '';
    if (!name) { showToast('Name is required for new beneficiary', 'error'); return false; }

    const cid = getCompanyId();
    ben = DB.addBeneficiary({
      companyId:         cid,
      sessionId:         '',
      fullName:          name,
      phone:             phone,
      ageGroup:          document.getElementById('fu_new_age')?.value || '25-34',
      cupSize:           document.getElementById('fu_new_cup')?.value || 'medium',
      firstTimeUser:     document.getElementById('fu_new_first')?.value === 'yes',
      language:          document.getElementById('fu_new_lang')?.value || 'Hindi',
      consentRecordedBy: currentUser.name,
      consentDate:       new Date().toISOString().split('T')[0],
      registeredBy:      currentUser.role
    });
    benId = ben.id;
    showToast('New beneficiary registered: ' + ben.fcpId);
  } else {
    ben = DB.getBeneficiary(benId);
  }

  const cycleNum = parseInt(document.getElementById('fu_month').value);
  const usageStatus = document.getElementById('fu_status').value;

  // Use new addCycleRecord if available, fallback to addFollowup
  let result;
  if (typeof DB.addCycleRecord === 'function') {
    const status = usageStatus === 'using comfortably' || usageStatus === 'using with some issues' ? 'done' : 'not-adopted';
    result = DB.addCycleRecord({
      beneficiaryId: benId,
      companyId: ben ? ben.companyId : getCompanyId(),
      cycleNumber: cycleNum,
      status: status,
      usageStatus: usageStatus,
      checkInDate: document.getElementById('fu_date').value,
      recommendedToOthers: document.getElementById('fu_recommend').value,
      facilitatorNotes: document.getElementById('fu_notes').value,
      loggedByName: currentUser.name,
      loggedBy: currentUser.role
    });
  } else {
    result = DB.addFollowup({
      beneficiaryId: benId,
      companyId: ben ? ben.companyId : getCompanyId(),
      month: cycleNum,
      date: document.getElementById('fu_date').value,
      usageStatus: usageStatus,
      recommendedToOthers: document.getElementById('fu_recommend').value,
      notes: document.getElementById('fu_notes').value,
      loggedByName: currentUser.name,
      loggedByRole: currentUser.role
    });
  }

  if (result && result.error) {
    showToast(result.error, 'error');
    return false;
  }

  closeModal();
  showToast('Check-in submitted!');
  navigateTo('followups');
  return false;
}

function verifyFollowup(id) {
  if (typeof DB.verifyCycleRecord === 'function') {
    DB.verifyCycleRecord(id, currentUser.name);
  } else {
    DB.verifyFollowup(id, currentUser.name);
  }
  showToast('Follow-up verified!');
  navigateTo('followups');
}

// ---- DELETE FUNCTIONS ----
function deleteFollowupRecord(recordId, benId) {
  if (!confirm('Delete this check-in record? This cannot be undone.')) return;

  // Delete from cycle records
  if (typeof DB.getCycleRecords === 'function') {
    const records = DB.getCycleRecords().filter(r => r.id !== recordId);
    DB._set(DB.KEYS.cycleRecords, records);
  }

  showToast('Check-in record deleted');
  navigateTo('followups');
}

function deleteFullBeneficiary(benId) {
  const ben = DB.getBeneficiary(benId);
  if (!ben) { showToast('Beneficiary not found', 'error'); return; }
  if (!confirm(`Delete "${ben.fullName}" (${ben.fcpId}) and ALL their records? This cannot be undone.`)) return;

  // Delete cycle records
  if (typeof DB.getCycleRecords === 'function') {
    const records = DB.getCycleRecords().filter(r => r.beneficiaryId !== benId);
    DB._set(DB.KEYS.cycleRecords, records);
  }

  // Delete WhatsApp log
  if (typeof DB.getWhatsappLog === 'function') {
    const waLog = DB.getWhatsappLog().filter(l => l.beneficiaryId !== benId);
    DB._set(DB.KEYS.whatsappLog, waLog);
  }

  // Delete beneficiary
  DB.deleteBeneficiary(benId);

  showToast(`${ben.fullName} deleted completely`);
  navigateTo('followups');
}

// ============================================================
// EXCEL / CSV IMPORT
// ============================================================
function showExcelImportModal() {
  openModal('📥 Import Follow-up Data from Excel', `
    <div style="margin-bottom:16px">
      <p style="color:var(--text-muted);font-size:13px;margin-bottom:12px">
        Upload a CSV or Excel (.csv) file with beneficiary follow-up data.<br>
        Existing entries will be matched by <strong>Name</strong>. New names will be registered as new beneficiaries.
        Columns with no data will be left blank.
      </p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:16px;margin-bottom:16px">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;font-weight:600">Expected CSV Columns</div>
        <code style="color:#C2185B;font-size:12px;word-break:break-all">Name, Phone, Cup Size, Age Group, First Time, Cycle 1 Status, Cycle 2 Status, Cycle 3 Status, Notes</code>
        <div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.4)">
          Status values: Tried but successful, Successful, Not tried at all, Other issues, Adopted, Not Adopted<br>
          Only "Name" is required. All other columns are optional.
        </div>
      </div>
      <div class="form-group">
        <label>Select CSV File <span class="required">*</span></label>
        <input type="file" class="form-control" id="importFile" accept=".csv,.txt" style="padding:10px">
      </div>
    </div>
    <div id="importPreview" style="display:none;margin-bottom:16px">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#4CAF50;margin-bottom:8px;font-weight:600">Preview</div>
      <div id="importPreviewContent" style="max-height:200px;overflow-y:auto;background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;font-size:12px"></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="previewImport()">👁 Preview</button>
      <button class="btn btn-primary" onclick="processImport()">📥 Import Data</button>
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    </div>`);
}

function parseCSV(text) {
  const lines = text.split(/\\r?\\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^\"|\"$/g, ''));
    const row = {};
    headers.forEach((h, i) => row[h] = vals[i] || '');
    return row;
  });
}

function previewImport() {
  const file = document.getElementById('importFile')?.files?.[0];
  if (!file) { showToast('Please select a CSV file first', 'error'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    const rows = parseCSV(e.target.result);
    if (rows.length === 0) { showToast('No data found in file', 'error'); return; }

    const previewDiv = document.getElementById('importPreview');
    const contentDiv = document.getElementById('importPreviewContent');
    previewDiv.style.display = 'block';

    const cid = getCompanyId();
    const existingBens = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
    const existingNames = existingBens.map(b => b.fullName.toLowerCase());

    let html = `<div style="color:rgba(255,255,255,0.6);margin-bottom:8px">${rows.length} rows found</div>`;
    html += '<table style="width:100%;font-size:11px;border-collapse:collapse">';
    html += '<tr style="color:var(--text-muted)"><th style="text-align:left;padding:4px">Name</th><th>Status</th><th>C1</th><th>C2</th><th>C3</th></tr>';
    rows.forEach(r => {
      const name = r['name'] || r['full name'] || r['fullname'] || '';
      const isExisting = existingNames.includes(name.toLowerCase());
      html += `<tr style="border-top:1px solid rgba(255,255,255,0.05)">
        <td style="padding:4px">${name} ${isExisting ? '<span style="color:#4CAF50;font-size:10px">✓ exists</span>' : '<span style="color:#FFB300;font-size:10px">+ new</span>'}</td>
        <td style="padding:4px;color:rgba(255,255,255,0.5)">${r['cycle 1 status'] || r['c1'] || '—'}</td>
        <td style="padding:4px;color:rgba(255,255,255,0.5)">${r['cycle 2 status'] || r['c2'] || '—'}</td>
        <td style="padding:4px;color:rgba(255,255,255,0.5)">${r['cycle 3 status'] || r['c3'] || '—'}</td>
      </tr>`;
    });
    html += '</table>';
    contentDiv.innerHTML = html;
  };
  reader.readAsText(file);
}

function processImport() {
  const file = document.getElementById('importFile')?.files?.[0];
  if (!file) { showToast('Please select a CSV file first', 'error'); return; }

  const reader = new FileReader();
  reader.onload = function(e) {
    const rows = parseCSV(e.target.result);
    if (rows.length === 0) { showToast('No data found', 'error'); return; }

    const cid = getCompanyId();
    const existingBens = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
    let imported = 0, skipped = 0;

    rows.forEach(r => {
      const name = r['name'] || r['full name'] || r['fullname'] || '';
      if (!name) { skipped++; return; }

      // Find or create beneficiary
      let ben = existingBens.find(b => b.fullName.toLowerCase() === name.toLowerCase());
      if (!ben) {
        ben = DB.addBeneficiary({
          companyId: cid,
          sessionId: '',
          fullName: name,
          phone: r['phone'] || '',
          ageGroup: r['age group'] || r['age'] || '25-34',
          cupSize: (r['cup size'] || r['cup'] || 'medium').toLowerCase(),
          firstTimeUser: (r['first time'] || 'yes').toLowerCase() === 'yes',
          language: r['language'] || 'Hindi',
          consentRecordedBy: currentUser.name,
          consentDate: new Date().toISOString().split('T')[0],
          registeredBy: currentUser.role
        });
        existingBens.push(ben);
      }

      // Process cycle statuses
      const cycleFields = [
        { num: 1, keys: ['cycle 1 status', 'c1', 'cycle1'] },
        { num: 2, keys: ['cycle 2 status', 'c2', 'cycle2'] },
        { num: 3, keys: ['cycle 3 status', 'c3', 'cycle3'] }
      ];

      cycleFields.forEach(cf => {
        let val = '';
        cf.keys.forEach(k => { if (r[k]) val = r[k]; });
        if (!val) return; // Skip blank columns

        // Map status text to internal values
        const statusMap = {
          'tried but successful': 'tried-successful',
          'successful': 'successful',
          'not tried at all': 'not-tried',
          'not tried': 'not-tried',
          'other issues': 'other-issues',
          'fu for cycle 2': 'done',
          'fu for cycle 3': 'done',
          'adopted': 'done',
          'not adopted': 'not-adopted'
        };
        const mappedStatus = statusMap[val.toLowerCase()] || val.toLowerCase();

        // Check if cycle record already exists
        const existing = DB.getCycleRecords().find(
          cr => cr.beneficiaryId === ben.id && cr.cycleNumber === cf.num
        );
        if (!existing) {
          DB.addCycleRecord({
            beneficiaryId: ben.id,
            companyId: cid,
            cycleNumber: cf.num,
            status: mappedStatus,
            usageStatus: val,
            loggedByName: currentUser.name,
            loggedBy: currentUser.role
          });
        }
      });

      // Save notes if present
      if (r['notes']) {
        DB.updateBeneficiary(ben.id, { notes: r['notes'] });
      }

      imported++;
    });

    closeModal();
    showToast(`✅ Imported ${imported} records${skipped > 0 ? `, ${skipped} skipped (no name)` : ''}`);
    navigateTo('followups');
  };
  reader.readAsText(file);
}
