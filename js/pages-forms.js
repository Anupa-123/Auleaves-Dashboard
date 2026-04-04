// ============================================
// Log Session + Companies Page Renderers
// ============================================

function renderLogSession() {
  if (currentUser.role !== 'admin') return '<div class="empty-state"><h3>Access Denied</h3></div>';
  const companies = DB.getCompanies();
  return `<div class="page-header"><h1>Log New Session</h1></div>
    <div class="form-card">
      <form id="sessionForm" onsubmit="return submitSession(event)">
        <div class="form-grid">
          <div class="form-group"><label>Company <span class="required">*</span></label>
            <select class="form-control" id="sess_company" required>${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
          <div class="form-group"><label>Session Date <span class="required">*</span></label>
            <input type="date" class="form-control" id="sess_date" required value="${new Date().toISOString().split('T')[0]}"></div>
          <div class="form-group"><label>Facilitator <span class="required">*</span></label>
            <input type="text" class="form-control" id="sess_facilitator" required placeholder="e.g. Sneha Kulkarni"></div>
          <div class="form-group"><label>Department/Unit</label>
            <input type="text" class="form-control" id="sess_department" placeholder="e.g. Engineering"></div>
          <div class="form-group"><label>City</label>
            <input type="text" class="form-control" id="sess_city" placeholder="e.g. Mumbai"></div>
          <div class="form-group"><label>Session Type <span class="required">*</span></label>
            <select class="form-control" id="sess_type" required>
              <option value="awareness workshop">Awareness Workshop</option>
              <option value="hands-on training">Hands-on Training</option>
              <option value="follow-up session">Follow-up Session</option>
              <option value="one-on-one counselling">One-on-One Counselling</option>
              <option value="group Q&A">Group Q&A</option></select></div>
          <div class="form-group"><label>Women Attended <span class="required">*</span></label>
            <input type="number" class="form-control" id="sess_attended" required min="0" placeholder="0" oninput="calcConversion()"></div>
          <div class="form-group"><label>Cups Purchased <span class="required">*</span></label>
            <input type="number" class="form-control" id="sess_cups" required min="0" placeholder="0" oninput="calcConversion()"></div>
          <div class="form-group"><label>Conversion Rate</label>
            <input type="text" class="form-control" id="sess_conversion" readonly value="—" style="color:var(--sage-light)"></div>
          <div class="form-group"><label>Revenue Collected (₹)</label>
            <input type="number" class="form-control" id="sess_revenue" min="0" placeholder="0"></div>
          <div class="form-group"><label>CSR Subsidy (₹)</label>
            <input type="number" class="form-control" id="sess_subsidy" min="0" placeholder="0"></div>
          <div class="form-group full-width"><label>Notes</label>
            <textarea class="form-control" id="sess_notes" placeholder="Session notes..."></textarea></div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">💾 Save Session</button>
          <button type="button" class="btn btn-secondary" onclick="navigateTo('sessions')">Cancel</button>
        </div>
      </form>
    </div>`;
}

function calcConversion() {
  const a = parseInt(document.getElementById('sess_attended')?.value) || 0;
  const c = parseInt(document.getElementById('sess_cups')?.value) || 0;
  const el = document.getElementById('sess_conversion');
  if (el) el.value = a > 0 ? ((c / a) * 100).toFixed(1) + '%' : '—';
}

function submitSession(e) {
  e.preventDefault();
  const data = {
    companyId: document.getElementById('sess_company').value,
    sessionDate: document.getElementById('sess_date').value,
    facilitator: document.getElementById('sess_facilitator').value,
    department: document.getElementById('sess_department').value,
    city: document.getElementById('sess_city').value,
    sessionType: document.getElementById('sess_type').value,
    womenAttended: parseInt(document.getElementById('sess_attended').value) || 0,
    cupsPurchased: parseInt(document.getElementById('sess_cups').value) || 0,
    revenueCollected: parseFloat(document.getElementById('sess_revenue').value) || 0,
    csrSubsidy: parseFloat(document.getElementById('sess_subsidy').value) || 0,
    notes: document.getElementById('sess_notes').value,
    loggedBy: 'admin',
    loggedByName: currentUser.name
  };
  DB.addSession(data);
  showToast('Session logged successfully!');
  navigateTo('sessions');
  return false;
}

// ---- Companies Page ----
function renderCompanies() {
  if (currentUser.role !== 'admin') return '<div class="empty-state"><h3>Access Denied</h3></div>';
  const companies = DB.getCompanies();

  const cards = companies.map(c => {
    const st = DB.getCompanyStats(c.id);
    return `<tr>
      <td><strong>${c.name}</strong><br><span class="text-muted" style="font-size:11px">${c.industry} · ${c.city}</span></td>
      <td>${c.csrContactName}<br><span class="text-muted" style="font-size:11px">${c.contactEmail}</span></td>
      <td>${st.sessionsCount}</td>
      <td>${st.womenAttended}</td>
      <td>${st.cupsPurchased}</td>
      <td>${st.registeredBeneficiaries}</td>
      <td><span class="badge badge-success">${st.conversionRate}%</span></td>
      <td>
        <button class="btn btn-sm btn-ghost" onclick="viewCompanyDetails('${c.id}')">👁</button>
        <button class="btn btn-sm btn-ghost" onclick="editCompany('${c.id}')">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="deleteCompany('${c.id}')">🗑</button>
      </td>
    </tr>`;
  }).join('');

  return `<div class="page-header"><h1>Companies</h1>
    <button class="btn btn-primary" onclick="showAddCompanyModal()">+ Add Company</button></div>
    <div class="table-card">
      <div class="table-toolbar"><div class="toolbar-left">
        <div class="search-wrapper"><input type="text" class="search-input" placeholder="Search companies..." oninput="filterTable(this, 'companiesTable')"></div>
      </div><div class="toolbar-right"><span class="text-muted">${companies.length} companies</span></div></div>
      <div class="table-overflow"><table class="data-table" id="companiesTable"><thead><tr>
        <th>Company</th><th>CSR Contact</th><th>Sessions</th><th>Attended</th><th>Cups</th><th>Registered</th><th>Conv.</th><th>Actions</th>
      </tr></thead><tbody>${cards}</tbody></table></div>
    </div>`;
}

function showAddCompanyModal() {
  openModal('Add New Company', `
    <form id="companyForm" onsubmit="return submitCompany(event)">
      <div class="form-grid">
        <div class="form-group"><label>Company Name <span class="required">*</span></label><input type="text" class="form-control" id="comp_name" required></div>
        <div class="form-group"><label>Industry</label><input type="text" class="form-control" id="comp_industry" placeholder="e.g. IT"></div>
        <div class="form-group"><label>CSR Contact Name <span class="required">*</span></label><input type="text" class="form-control" id="comp_contact" required></div>
        <div class="form-group"><label>Contact Email</label><input type="email" class="form-control" id="comp_email"></div>
        <div class="form-group"><label>City</label><input type="text" class="form-control" id="comp_city"></div>
        <div class="form-group"><label>Target Women Count</label><input type="number" class="form-control" id="comp_target" min="0"></div>
        <div class="form-group"><label>Programme Start Date</label><input type="date" class="form-control" id="comp_start"></div>
        <div class="form-group"><label>Login ID <span class="required">*</span></label><input type="text" class="form-control" id="comp_loginid" required></div>
        <div class="form-group full-width"><label>Login Password <span class="required">*</span></label><input type="text" class="form-control" id="comp_loginpw" required></div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">💾 Save Company</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>`);
}

function submitCompany(e) {
  e.preventDefault();
  DB.addCompany({
    name: document.getElementById('comp_name').value,
    industry: document.getElementById('comp_industry').value,
    csrContactName: document.getElementById('comp_contact').value,
    contactEmail: document.getElementById('comp_email').value,
    city: document.getElementById('comp_city').value,
    targetWomenCount: parseInt(document.getElementById('comp_target').value) || 0,
    programmeStartDate: document.getElementById('comp_start').value,
    loginId: document.getElementById('comp_loginid').value,
    loginPassword: document.getElementById('comp_loginpw').value
  });
  closeModal();
  showToast('Company added successfully!');
  populateCompanySelector();
  navigateTo('companies');
  return false;
}

function viewCompanyDetails(id) {
  const c = DB.getCompany(id);
  if (!c) return;
  const st = DB.getCompanyStats(id);
  openModal(c.name, `
    <div class="form-grid">
      <div class="form-group"><label>Industry</label><p>${c.industry || '—'}</p></div>
      <div class="form-group"><label>City</label><p>${c.city || '—'}</p></div>
      <div class="form-group"><label>CSR Contact</label><p>${c.csrContactName}</p></div>
      <div class="form-group"><label>Email</label><p>${c.contactEmail || '—'}</p></div>
      <div class="form-group"><label>Target Women</label><p>${c.targetWomenCount || '—'}</p></div>
      <div class="form-group"><label>Start Date</label><p>${DB.formatDate(c.programmeStartDate)}</p></div>
      <div class="form-group"><label>Login ID</label><p><code>${c.loginId}</code></p></div>
      <div class="form-group"><label>Password</label><p><code>${c.loginPassword}</code></p></div>
    </div>
    <div class="stats-grid mt-16">
      <div class="report-metric"><div class="metric-value">${st.sessionsCount}</div><div class="metric-label">Sessions</div></div>
      <div class="report-metric"><div class="metric-value">${st.cupsPurchased}</div><div class="metric-label">Cups</div></div>
      <div class="report-metric"><div class="metric-value">${st.registeredBeneficiaries}</div><div class="metric-label">Registered</div></div>
      <div class="report-metric"><div class="metric-value">${st.conversionRate}%</div><div class="metric-label">Conversion</div></div>
    </div>`, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
}

function editCompany(id) {
  const c = DB.getCompany(id);
  if (!c) return;
  openModal('Edit Company', `
    <form onsubmit="return updateCompany(event, '${id}')">
      <div class="form-grid">
        <div class="form-group"><label>Company Name</label><input type="text" class="form-control" id="ec_name" value="${c.name}" required></div>
        <div class="form-group"><label>Industry</label><input type="text" class="form-control" id="ec_industry" value="${c.industry || ''}"></div>
        <div class="form-group"><label>CSR Contact</label><input type="text" class="form-control" id="ec_contact" value="${c.csrContactName}" required></div>
        <div class="form-group"><label>Email</label><input type="email" class="form-control" id="ec_email" value="${c.contactEmail || ''}"></div>
        <div class="form-group"><label>City</label><input type="text" class="form-control" id="ec_city" value="${c.city || ''}"></div>
        <div class="form-group"><label>Target Women</label><input type="number" class="form-control" id="ec_target" value="${c.targetWomenCount || ''}"></div>
        <div class="form-group"><label>Login ID</label><input type="text" class="form-control" id="ec_loginid" value="${c.loginId}" required></div>
        <div class="form-group"><label>Password</label><input type="text" class="form-control" id="ec_loginpw" value="${c.loginPassword}" required></div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">💾 Update</button>
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      </div>
    </form>`);
}

function updateCompany(e, id) {
  e.preventDefault();
  DB.updateCompany(id, {
    name: document.getElementById('ec_name').value,
    industry: document.getElementById('ec_industry').value,
    csrContactName: document.getElementById('ec_contact').value,
    contactEmail: document.getElementById('ec_email').value,
    city: document.getElementById('ec_city').value,
    targetWomenCount: parseInt(document.getElementById('ec_target').value) || 0,
    loginId: document.getElementById('ec_loginid').value,
    loginPassword: document.getElementById('ec_loginpw').value
  });
  closeModal();
  showToast('Company updated!');
  populateCompanySelector();
  navigateTo('companies');
  return false;
}

function deleteCompany(id) {
  const c = DB.getCompany(id);
  if (!c) return;
  if (confirm(`Delete "${c.name}" and ALL its linked data (sessions, beneficiaries, follow-ups)? This cannot be undone.`)) {
    DB.deleteCompany(id);
    showToast('Company deleted', 'error');
    populateCompanySelector();
    navigateTo('companies');
  }
}
