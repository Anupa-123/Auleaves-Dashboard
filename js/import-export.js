// ============================================
// Excel / CSV Import Feature
// Allows bulk import of companies, sessions, beneficiaries
// ============================================

function renderImportPage() {
  if (currentUser.role !== 'admin') return '<div class="empty-state"><h3>Access Denied</h3></div>';
  return `
    <div class="page-header">
      <h1>Import Data from Excel/CSV</h1>
      <div class="page-subtitle">Bulk import companies, sessions, or beneficiaries from your Excel sheets</div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:24px">

      <!-- Import Companies -->
      <div class="chart-card">
        <div class="chart-header">
          <div><div class="chart-title">Import Companies</div>
          <div class="chart-subtitle">CSV format required</div></div>
          <span style="font-size:24px">🏢</span>
        </div>
        <div class="form-group">
          <label>Required columns:</label>
          <code style="font-size:11px;color:var(--text-muted);display:block;padding:8px;background:var(--bg-input);border-radius:4px;margin-top:4px">
            name, csrContactName, contactEmail, city, industry, targetWomenCount, programmeStartDate, loginId, loginPassword
          </code>
        </div>
        <div class="form-group">
          <input type="file" id="importCompaniesFile" accept=".csv" class="form-control" style="padding:6px">
        </div>
        <div class="form-actions" style="margin-top:8px">
          <button class="btn btn-primary" onclick="importCSV('companies')">📥 Import</button>
          <button class="btn btn-secondary" onclick="downloadTemplate('companies')">📄 Download Template</button>
        </div>
      </div>

      <!-- Import Sessions -->
      <div class="chart-card">
        <div class="chart-header">
          <div><div class="chart-title">Import Sessions</div>
          <div class="chart-subtitle">CSV format required</div></div>
          <span style="font-size:24px">📅</span>
        </div>
        <div class="form-group">
          <label>Required columns:</label>
          <code style="font-size:11px;color:var(--text-muted);display:block;padding:8px;background:var(--bg-input);border-radius:4px;margin-top:4px">
            companyLoginId, sessionDate, facilitator, department, city, womenAttended, cupsPurchased, sessionType, revenueCollected, csrSubsidy, notes
          </code>
        </div>
        <div class="form-group">
          <input type="file" id="importSessionsFile" accept=".csv" class="form-control" style="padding:6px">
        </div>
        <div class="form-actions" style="margin-top:8px">
          <button class="btn btn-primary" onclick="importCSV('sessions')">📥 Import</button>
          <button class="btn btn-secondary" onclick="downloadTemplate('sessions')">📄 Download Template</button>
        </div>
      </div>

      <!-- Import Beneficiaries -->
      <div class="chart-card">
        <div class="chart-header">
          <div><div class="chart-title">Import Beneficiaries</div>
          <div class="chart-subtitle">CSV format required</div></div>
          <span style="font-size:24px">👩</span>
        </div>
        <div class="form-group">
          <label>Required columns:</label>
          <code style="font-size:11px;color:var(--text-muted);display:block;padding:8px;background:var(--bg-input);border-radius:4px;margin-top:4px">
            companyLoginId, fullName, phone, ageGroup, cupSize, firstTimeUser, language, consentDate
          </code>
        </div>
        <div class="form-group">
          <input type="file" id="importBeneficiariesFile" accept=".csv" class="form-control" style="padding:6px">
        </div>
        <div class="form-actions" style="margin-top:8px">
          <button class="btn btn-primary" onclick="importCSV('beneficiaries')">📥 Import</button>
          <button class="btn btn-secondary" onclick="downloadTemplate('beneficiaries')">📄 Download Template</button>
        </div>
      </div>

    </div>

    <!-- Import Log -->
    <div class="chart-card" id="importLog" style="display:none">
      <div class="chart-title" style="margin-bottom:12px">Import Results</div>
      <div id="importLogContent"></div>
    </div>

    <!-- Instructions -->
    <div class="integrity-statement mt-16">
      <p><strong>How to convert Excel to CSV:</strong> In Excel → File → Save As → Choose "CSV (Comma delimited) (*.csv)". 
      Make sure the first row has the exact column names listed above. 
      For Excel (.xlsx) files, save as CSV first before importing here.</p>
    </div>`;
}

// ---- Parse CSV ----
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const obj = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  }).filter(row => Object.values(row).some(v => v));
}

// ---- Import Logic ----
function importCSV(type) {
  const fileInput = document.getElementById(`import${type.charAt(0).toUpperCase() + type.slice(1)}File`);
  if (!fileInput || !fileInput.files[0]) {
    showToast('Please select a CSV file first', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const rows = parseCSV(e.target.result);
    if (!rows.length) { showToast('No data found in file', 'error'); return; }

    let successCount = 0, errorCount = 0, errors = [];
    const companies = DB.getCompanies();
    const loginIdToId = {};
    companies.forEach(c => loginIdToId[c.loginId] = c.id);

    if (type === 'companies') {
      rows.forEach((row, i) => {
        try {
          if (!row.name || !row.loginId || !row.loginPassword) {
            errors.push(`Row ${i+2}: Missing name, loginId, or loginPassword`);
            errorCount++; return;
          }
          DB.addCompany({
            name: row.name,
            csrContactName: row.csrContactName || '',
            contactEmail: row.contactEmail || '',
            city: row.city || '',
            industry: row.industry || '',
            targetWomenCount: parseInt(row.targetWomenCount) || 0,
            programmeStartDate: row.programmeStartDate || '',
            loginId: row.loginId,
            loginPassword: row.loginPassword
          });
          successCount++;
        } catch(err) { errors.push(`Row ${i+2}: ${err.message}`); errorCount++; }
      });
    }

    else if (type === 'sessions') {
      // Refresh map after possible company imports
      DB.getCompanies().forEach(c => loginIdToId[c.loginId] = c.id);
      rows.forEach((row, i) => {
        try {
          const compId = loginIdToId[row.companyLoginId];
          if (!compId) { errors.push(`Row ${i+2}: Company '${row.companyLoginId}' not found`); errorCount++; return; }
          DB.addSession({
            companyId: compId,
            sessionDate: row.sessionDate,
            facilitator: row.facilitator || '',
            department: row.department || '',
            city: row.city || '',
            womenAttended: parseInt(row.womenAttended) || 0,
            cupsPurchased: parseInt(row.cupsPurchased) || 0,
            sessionType: row.sessionType || 'awareness workshop',
            revenueCollected: parseFloat(row.revenueCollected) || 0,
            csrSubsidy: parseFloat(row.csrSubsidy) || 0,
            notes: row.notes || '',
            loggedBy: 'admin',
            loggedByName: currentUser.name
          });
          successCount++;
        } catch(err) { errors.push(`Row ${i+2}: ${err.message}`); errorCount++; }
      });
    }

    else if (type === 'beneficiaries') {
      DB.getCompanies().forEach(c => loginIdToId[c.loginId] = c.id);
      rows.forEach((row, i) => {
        try {
          const compId = loginIdToId[row.companyLoginId];
          if (!compId) { errors.push(`Row ${i+2}: Company '${row.companyLoginId}' not found`); errorCount++; return; }
          if (!row.fullName) { errors.push(`Row ${i+2}: Missing fullName`); errorCount++; return; }
          DB.addBeneficiary({
            companyId: compId,
            sessionId: '',
            fullName: row.fullName,
            phone: row.phone || '',
            ageGroup: row.ageGroup || '25-34',
            cupSize: row.cupSize || 'medium',
            firstTimeUser: row.firstTimeUser || 'yes',
            language: row.language || 'Hindi',
            consentRecordedBy: currentUser.name,
            consentDate: row.consentDate || new Date().toISOString().split('T')[0],
            registeredBy: 'admin'
          });
          successCount++;
        } catch(err) { errors.push(`Row ${i+2}: ${err.message}`); errorCount++; }
      });
    }

    // Show results
    const logEl = document.getElementById('importLog');
    const logContent = document.getElementById('importLogContent');
    logEl.style.display = '';
    logContent.innerHTML = `
      <div style="display:flex;gap:12px;margin-bottom:12px">
        <span class="badge badge-success" style="font-size:13px;padding:6px 14px">✅ ${successCount} imported</span>
        ${errorCount > 0 ? `<span class="badge badge-danger" style="font-size:13px;padding:6px 14px">❌ ${errorCount} failed</span>` : ''}
      </div>
      ${errors.length > 0 ? `<div style="background:var(--bg-input);padding:12px;border-radius:6px;font-size:12px;color:var(--text-muted)">${errors.join('<br>')}</div>` : ''}`;

    if (successCount > 0) {
      showToast(`Successfully imported ${successCount} ${type}!`);
      populateCompanySelector();
    }
    if (errorCount > 0) showToast(`${errorCount} rows failed`, 'error');
  };
  reader.readAsText(fileInput.files[0]);
}

// ---- Download CSV Template ----
function downloadTemplate(type) {
  const templates = {
    companies: 'name,csrContactName,contactEmail,city,industry,targetWomenCount,programmeStartDate,loginId,loginPassword\nExample Corp,Priya Sharma,priya@example.com,Mumbai,IT,100,2026-01-01,example,example123',
    sessions: 'companyLoginId,sessionDate,facilitator,department,city,womenAttended,cupsPurchased,sessionType,revenueCollected,csrSubsidy,notes\ntechwave,2026-01-10,Sneha Kulkarni,Engineering,Mumbai,30,28,awareness workshop,14000,10000,Session notes here',
    beneficiaries: 'companyLoginId,fullName,phone,ageGroup,cupSize,firstTimeUser,language,consentDate\ntechwave,Priya Sharma,9876543210,25-34,medium,yes,Hindi,2026-01-10'
  };

  const csv = templates[type];
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `auleaves_${type}_template.csv`;
  a.click();
  showToast(`Template downloaded! Open in Excel, fill data, save as CSV, then import.`);
}

// ---- Export All Data to CSV ----
function exportAllDataCSV() {
  const companies = DB.getCompanies();
  const sessions = DB.getSessions();
  const bens = DB.getBeneficiaries();
  const followups = DB.getFollowups();

  // Create a combined export with sheets (using separate CSVs)
  const compMap = {};
  companies.forEach(c => compMap[c.id] = c.name);

  // Sessions CSV
  const sessHeader = 'Company,Date,Facilitator,Department,City,Type,Attended,Cups,Revenue,Subsidy,Notes';
  const sessRows = sessions.map(s => [
    compMap[s.companyId] || '',
    s.sessionDate, s.facilitator, s.department, s.city,
    s.sessionType, s.womenAttended, s.cupsPurchased,
    s.revenueCollected, s.csrSubsidy, s.notes
  ].join(','));

  const csv = [sessHeader, ...sessRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `auleaves_sessions_export_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('Sessions data exported to CSV!');
}
