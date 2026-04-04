// ============================================
// Dashboard + Sessions Page Renderers
// ============================================

function renderDashboard() {
  const cid = getCompanyId();
  const stats = DB.getDashboardStats(cid);
  const funnel = DB.getImpactFunnel(cid);
  const sessions = cid ? DB.getSessionsByCompany(cid) : DB.getSessions();

  // Monthly data for chart
  const monthlyData = {};
  sessions.forEach(s => {
    const m = new Date(s.sessionDate).toLocaleString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyData[m]) monthlyData[m] = { sessions: 0, cups: 0 };
    monthlyData[m].sessions++;
    monthlyData[m].cups += parseInt(s.cupsPurchased) || 0;
  });
  const chartLabels = Object.keys(monthlyData);
  const chartSessions = chartLabels.map(m => monthlyData[m].sessions);
  const chartCups = chartLabels.map(m => monthlyData[m].cups);

  return `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-top-bar rose"></div>
        <div class="stat-label">Total Sessions</div>
        <div class="stat-value">${stats.totalSessions}</div>
        <div class="stat-change">↑ Active programme</div>
        <div class="stat-icon">📅</div></div>
      <div class="stat-card"><div class="stat-top-bar sage"></div>
        <div class="stat-label">Cups Distributed</div>
        <div class="stat-value">${stats.totalCups}</div>
        <div class="stat-change">↑ ${stats.totalAttended} women attended</div>
        <div class="stat-icon">🏆</div></div>
      <div class="stat-card"><div class="stat-top-bar gold"></div>
        <div class="stat-label">Active Users (3MO)</div>
        <div class="stat-value">${stats.month3Active}</div>
        <div class="stat-change">↑ ${stats.adoptionRate}% adoption</div>
        <div class="stat-icon">👩</div></div>
      <div class="stat-card"><div class="stat-top-bar blue"></div>
        <div class="stat-label">${currentUser.role === 'admin' ? 'Companies Onboarded' : 'Registered Women'}</div>
        <div class="stat-value">${currentUser.role === 'admin' ? stats.companiesCount : stats.registeredBeneficiaries}</div>
        <div class="stat-change">↑ Programme growing</div>
        <div class="stat-icon">${currentUser.role === 'admin' ? '🏢' : '📋'}</div></div>
    </div>

    <div class="month-grid">
      <div class="month-card">
        <div class="month-label">Month 1 · Awareness</div>
        <div class="month-value text-rose">${stats.totalAttended}</div>
        <div class="month-desc">Women attended sessions</div>
        <div class="month-bar"><div class="month-bar-fill" style="width:100%;background:var(--rose)"></div></div>
        <div class="month-watermark">M1</div></div>
      <div class="month-card">
        <div class="month-label">Month 2 · Purchase</div>
        <div class="month-value text-sage">${stats.totalCups}</div>
        <div class="month-desc">Cups purchased / distributed</div>
        <div class="month-bar"><div class="month-bar-fill" style="width:${stats.totalAttended > 0 ? (stats.totalCups/stats.totalAttended*100) : 0}%;background:var(--sage)"></div></div>
        <div class="month-watermark">M2</div></div>
      <div class="month-card">
        <div class="month-label">Month 3 · Active Use</div>
        <div class="month-value text-warning">${stats.month3Active}</div>
        <div class="month-desc">Confirmed active users</div>
        <div class="month-bar"><div class="month-bar-fill" style="width:${stats.registeredBeneficiaries > 0 ? (stats.month3Active/stats.registeredBeneficiaries*100) : 0}%;background:var(--warning)"></div></div>
        <div class="month-watermark">M3</div></div>
    </div>

    <div class="charts-grid">
      <div class="chart-card">
        <div class="chart-header">
          <div><div class="chart-title">Session & Cup Trend</div>
            <div class="chart-subtitle">Monthly distribution across programme</div></div>
          <div class="chart-legend">
            <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--chart-gold)"></div> Sessions</div>
            <div class="chart-legend-item"><div class="chart-legend-dot" style="background:var(--chart-rose)"></div> Cups</div>
          </div>
        </div>
        <div class="chart-container"><canvas id="trendChart"></canvas></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <div><div class="chart-title">Adoption Funnel</div>
            <div class="chart-subtitle">Stage-wise tracking</div></div>
        </div>
        <div class="funnel-list">
          ${renderFunnelBars(funnel)}
        </div>
      </div>
    </div>`;
}

function renderFunnelBars(funnel) {
  const maxVal = Math.max(funnel.attended, 1);
  const stages = [
    { label: 'Attended', value: funnel.attended, color: 'var(--chart-rose)' },
    { label: 'Purchased', value: funnel.cupsPurchased, color: 'var(--chart-gold)' },
    { label: 'Registered', value: funnel.registered, color: 'var(--chart-sage)' },
    { label: 'Month 1 Use', value: funnel.month1Using, color: 'var(--chart-blue)' },
    { label: 'Month 2 Use', value: funnel.month2Using, color: 'var(--chart-coral)' },
    { label: 'Month 3 Use', value: funnel.month3Using, color: 'var(--chart-purple)' },
    { label: 'Recommended', value: funnel.recommended, color: 'var(--sage-light)' }
  ];
  return stages.map(s => `
    <div class="funnel-row">
      <div class="funnel-label">${s.label}</div>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${(s.value/maxVal*100)}%;background:${s.color}"></div></div>
      <div class="funnel-value">${s.value}</div>
    </div>`).join('');
}

function renderSessions() {
  const cid = getCompanyId();
  const sessions = cid ? DB.getSessionsByCompany(cid) : DB.getSessions();
  const companies = DB.getCompanies();
  const compMap = {}; companies.forEach(c => compMap[c.id] = c.name);

  if (sessions.length === 0) {
    return `<div class="page-header"><h1>Sessions</h1></div>
      <div class="empty-state"><div class="empty-icon">📅</div><h3>No sessions yet</h3><p>Start by logging your first session.</p>
      <button class="btn btn-primary mt-16" onclick="navigateTo('log-session')">+ Log Session</button></div>`;
  }

  const rows = sessions.sort((a,b) => new Date(b.sessionDate) - new Date(a.sessionDate)).map(s => `
    <tr>
      <td>${DB.formatDate(s.sessionDate)}</td>
      <td>${compMap[s.companyId] || '—'}</td>
      <td>${s.facilitator}</td>
      <td>${s.department || '—'}</td>
      <td><span class="badge badge-info">${s.sessionType}</span></td>
      <td>${s.womenAttended}</td>
      <td>${s.cupsPurchased}</td>
      <td>${s.womenAttended > 0 ? ((s.cupsPurchased/s.womenAttended)*100).toFixed(0) + '%' : '—'}</td>
      <td>${DB.formatINR(s.revenueCollected)}</td>
      <td>
        ${currentUser.role === 'admin' ? `<button class="btn btn-sm btn-ghost" onclick="viewSession('${s.id}')">👁</button>
        <button class="btn btn-sm btn-danger" onclick="deleteSession('${s.id}')">🗑</button>` : `<button class="btn btn-sm btn-ghost" onclick="viewSession('${s.id}')">👁</button>`}
      </td>
    </tr>`).join('');

  return `<div class="page-header"><h1>Sessions</h1><div class="d-flex gap-8">
    ${currentUser.role === 'admin' ? `<button class="btn btn-primary" onclick="navigateTo('log-session')">+ Log Session</button>` : ''}
    </div></div>
    <div class="table-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <div class="search-wrapper"><input type="text" class="search-input" placeholder="Search sessions..." oninput="filterTable(this, 'sessionsTable')"></div>
          ${currentUser.role === 'admin' ? `<select class="filter-select" onchange="filterSessionsByCompany(this.value)">
            <option value="">All Companies</option>${companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>` : ''}
        </div>
        <div class="toolbar-right"><span class="text-muted">${sessions.length} sessions</span></div>
      </div>
      <div class="table-overflow">
        <table class="data-table" id="sessionsTable">
          <thead><tr><th>Date</th><th>Company</th><th>Facilitator</th><th>Department</th><th>Type</th><th>Attended</th><th>Cups</th><th>Conv.</th><th>Revenue</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="table-footer"><span>Showing ${sessions.length} records</span></div>
    </div>`;
}

function viewSession(id) {
  const s = DB.getSession(id);
  if (!s) return;
  const comp = DB.getCompany(s.companyId);
  openModal('Session Details', `
    <div class="form-grid">
      <div class="form-group"><label>Date</label><p>${DB.formatDate(s.sessionDate)}</p></div>
      <div class="form-group"><label>Company</label><p>${comp ? comp.name : '—'}</p></div>
      <div class="form-group"><label>Facilitator</label><p>${s.facilitator}</p></div>
      <div class="form-group"><label>Department</label><p>${s.department || '—'}</p></div>
      <div class="form-group"><label>Session Type</label><p>${s.sessionType}</p></div>
      <div class="form-group"><label>City</label><p>${s.city || '—'}</p></div>
      <div class="form-group"><label>Women Attended</label><p>${s.womenAttended}</p></div>
      <div class="form-group"><label>Cups Purchased</label><p>${s.cupsPurchased}</p></div>
      <div class="form-group"><label>Conversion Rate</label><p>${s.womenAttended > 0 ? ((s.cupsPurchased/s.womenAttended)*100).toFixed(1) + '%' : '—'}</p></div>
      <div class="form-group"><label>Revenue</label><p>${DB.formatINR(s.revenueCollected)}</p></div>
      <div class="form-group"><label>CSR Subsidy</label><p>${DB.formatINR(s.csrSubsidy)}</p></div>
      <div class="form-group full-width"><label>Notes</label><p>${s.notes || '—'}</p></div>
    </div>`, '<button class="btn btn-secondary" onclick="closeModal()">Close</button>');
}

function deleteSession(id) {
  if (confirm('Delete this session? This cannot be undone.')) {
    DB.deleteSession(id);
    showToast('Session deleted');
    navigateTo('sessions');
  }
}

function filterTable(input, tableId) {
  const filter = input.value.toLowerCase();
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(filter) ? '' : 'none';
  });
}

function filterSessionsByCompany(compId) {
  activeCompanyFilter = compId;
  navigateTo('sessions');
  // Reset global filter after rendering
  if (currentUser.role === 'admin') {
    document.getElementById('activeCompanySelect').value = '';
    activeCompanyFilter = '';
  }
}
