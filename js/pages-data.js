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
  const followups = cid ? DB.getFollowupsByCompany(cid) : DB.getFollowups();
  const isAdmin = currentUser.role === 'admin';
  const compMap = {}; DB.getCompanies().forEach(c => compMap[c.id] = c.name);
  const benMap = {}; DB.getBeneficiaries().forEach(b => benMap[b.id] = b);

  // Find overdue (no month 3 data)
  const overdueCount = bens.filter(b => !DB.hasFollowup(b.id, 3)).length;

  const rows = followups.sort((a,b) => new Date(b.loggedAt) - new Date(a.loggedAt)).map(f => {
    const ben = benMap[f.beneficiaryId];
    return `<tr>
      <td>${ben ? ben.fcpId : '—'}</td>
      <td>${ben ? ben.fullName : '—'}</td>
      <td>${compMap[f.companyId] || '—'}</td>
      <td><span class="badge badge-info">Month ${f.month}</span></td>
      <td>${getStatusBadge(f.usageStatus)}</td>
      <td>${f.recommendedToOthers === 'yes' ? '<span class="badge badge-success">Yes</span>' : f.recommendedToOthers === 'no' ? '<span class="badge badge-danger">No</span>' : '<span class="badge badge-muted">Not sure</span>'}</td>
      <td>${f.verified ? '<span class="badge badge-success">✓ Verified</span>' : '<span class="badge badge-warning">Pending</span>'}</td>
      <td>
        ${isAdmin && !f.verified ? `<button class="btn btn-sm btn-sage" onclick="verifyFollowup('${f.id}')">✓ Verify</button>` : ''}
      </td>
    </tr>`;
  }).join('');

  return `<div class="page-header"><h1>Follow-up Check-ins</h1>
    <div class="d-flex gap-8">
      <button class="btn btn-primary" onclick="showAddFollowupModal()">+ Submit Check-in</button>
      ${overdueCount > 0 ? `<span class="badge badge-warning" style="font-size:12px;padding:6px 12px">⚠ ${overdueCount} overdue (no Month 3)</span>` : ''}
    </div></div>
    <div class="table-card">
      <div class="table-toolbar"><div class="toolbar-left">
        <div class="search-wrapper"><input type="text" class="search-input" placeholder="Search..." oninput="filterTable(this, 'fupTable')"></div>
        <select class="filter-select" onchange="filterFollowupsByMonth(this.value)">
          <option value="">All Months</option><option value="1">Month 1</option><option value="2">Month 2</option><option value="3">Month 3</option>
        </select>
      </div><div class="toolbar-right"><span class="text-muted">${followups.length} records</span></div></div>
      <div class="table-overflow"><table class="data-table" id="fupTable"><thead><tr>
        <th>FCP ID</th><th>Name</th><th>Company</th><th>Month</th><th>Status</th><th>Referred</th><th>Verified</th><th>Actions</th>
      </tr></thead><tbody>${rows}</tbody></table></div>
    </div>`;
}

function getStatusBadge(status) {
  const map = {
    'using comfortably': 'badge-success',
    'using with some issues': 'badge-warning',
    'stopped — discomfort': 'badge-danger',
    'stopped — other reason': 'badge-danger',
    'not yet tried': 'badge-muted',
    'lost/needs replacement': 'badge-danger'
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
          <select class="form-control" id="fu_ben" required>
            ${bens.map(b => `<option value="${b.id}">${b.fcpId} — ${b.fullName}</option>`).join('')}
          </select></div>
        <div class="form-group"><label>Month <span class="required">*</span></label>
          <select class="form-control" id="fu_month" required><option value="1">Month 1</option><option value="2">Month 2</option><option value="3">Month 3</option></select></div>
        <div class="form-group"><label>Date</label>
          <input type="date" class="form-control" id="fu_date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-group full-width"><label>Usage Status <span class="required">*</span></label>
          <select class="form-control" id="fu_status" required>
            <option value="using comfortably">Using comfortably</option>
            <option value="using with some issues">Using with some issues</option>
            <option value="stopped — discomfort">Stopped — discomfort</option>
            <option value="stopped — other reason">Stopped — other reason</option>
            <option value="not yet tried">Not yet tried</option>
            <option value="lost/needs replacement">Lost / Needs replacement</option>
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

function submitFollowup(e) {
  e.preventDefault();
  const benId = document.getElementById('fu_ben').value;
  const ben = DB.getBeneficiary(benId);
  const result = DB.addFollowup({
    beneficiaryId: benId,
    companyId: ben ? ben.companyId : getCompanyId(),
    month: parseInt(document.getElementById('fu_month').value),
    date: document.getElementById('fu_date').value,
    usageStatus: document.getElementById('fu_status').value,
    recommendedToOthers: document.getElementById('fu_recommend').value,
    notes: document.getElementById('fu_notes').value,
    loggedByName: currentUser.name,
    loggedByRole: currentUser.role
  });
  if (result.error) {
    showToast(result.error, 'error');
    return false;
  }
  // Send email notification for company submissions
  const comp = DB.getCompany(ben ? ben.companyId : getCompanyId());
  sendDataEmail(
    comp ? comp.name : 'Unknown',
    currentUser.name,
    `Month ${document.getElementById('fu_month').value} Follow-up Check-in`,
    `Beneficiary: ${ben ? ben.fcpId + ' - ' + ben.fullName : 'Unknown'}\nStatus: ${document.getElementById('fu_status').value}`
  );
  closeModal();
  showToast('Check-in submitted!');
  navigateTo('followups');
  return false;
}

function verifyFollowup(id) {
  DB.verifyFollowup(id, currentUser.name);
  showToast('Follow-up verified!');
  navigateTo('followups');
}
