// ============================================================
// Auleaves FCP — Dashboard Page v2
// 6 metrics, Company-wise table, Activity log, Overdue alerts
// ============================================================

function renderDashboard() {
  const cid = getCompanyId();
  const stats = DB.getDashboardStats(cid);
  const overdueSessions = cid ? [] : DB.getOverdueSessions();

  // Overdue Banner
  const overdueBanner = overdueSessions.length > 0 ? `
    <div class="overdue-banner" style="margin-bottom:24px">
      <span>⚠</span>
      <span><strong>${overdueSessions.length} session${overdueSessions.length > 1 ? 's' : ''} overdue</strong> — participants have passed their expect Cycle 3 date with no check-in logged.</span>
      <button class="btn btn-sm" onclick="navigateTo('sessions')" style="background:rgba(255,179,0,0.15);color:#FFB300;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px">View Sessions</button>
    </div>` : '';

  // 6 Metric Cards
  const cardsHtml = `
    <div class="stats-grid">
      ${currentUser.role === 'admin' ? `
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#8B5CF6"></div>
        <div class="stat-label">Companies</div>
        <div class="stat-value">${stats.companiesCount}</div>
        <div class="stat-change">↑ Active partners</div>
        <div class="stat-icon">🏢</div>
      </div>` : ''}
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#3A7BD5"></div>
        <div class="stat-label">Sessions</div>
        <div class="stat-value">${stats.sessionsCount}</div>
        <div class="stat-change">↑ Programme events</div>
        <div class="stat-icon">📅</div>
      </div>
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#D4A039"></div>
        <div class="stat-label">Women Reached</div>
        <div class="stat-value">${stats.totalAttended}</div>
        <div class="stat-change">↑ Total attendance</div>
        <div class="stat-icon">👩</div>
      </div>
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#C2185B"></div>
        <div class="stat-label">Cups Distributed</div>
        <div class="stat-value">${stats.totalCups}</div>
        <div class="stat-change">↑ Subsidised units</div>
        <div class="stat-icon">🏆</div>
      </div>
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#2E7D5A"></div>
        <div class="stat-label">Adoption Rate</div>
        <div class="stat-value text-sage">${stats.adoptionRate}%</div>
        <div class="stat-change">↑ Overall success</div>
        <div class="stat-icon">✅</div>
      </div>
      <div class="stat-card">
        <div class="stat-top-bar" style="background:#43A47A"></div>
        <div class="stat-label">Cycle 3 Completions</div>
        <div class="stat-value">${stats.cycle3Completions}</div>
        <div class="stat-change">↑ Finished track</div>
        <div class="stat-icon">🎯</div>
      </div>
    </div>`;

  // Company-wise table (Admin only)
  let companyTableHtml = '';
  if (currentUser.role === 'admin') {
    const companies = DB.getCompanies();
    const rows = companies.map(c => {
      const cStats = DB.getCompanyStats(c.id);
      return `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td style="color:rgba(255,255,255,0.6);font-size:12px">${c.industry}</td>
          <td>${cStats.sessionsCount}</td>
          <td>${cStats.womenAttended}</td>
          <td>${cStats.cupsPurchased}</td>
          <td><span style="color:rgba(255,255,255,0.6)">${cStats.conversionRate}%</span></td>
          <td><strong style="color:${cStats.adoptionRate >= 50 ? '#4CAF50' : '#FFB300'}">${cStats.adoptionRate}%</strong></td>
          <td>${cStats.has3MData ? '<span class="status-pill" style="background:rgba(76,175,80,0.15);color:#4CAF50">Yes</span>' : '<span class="status-pill" style="background:rgba(255,179,0,0.15);color:#FFB300">Pending</span>'}</td>
          <td>${cStats.hasOverdue ? '<span class="status-pill" style="background:rgba(239,154,154,0.15);color:#EF9A9A">Overdue</span>' : '—'}</td>
        </tr>`;
    }).join('');

    companyTableHtml = `
      <div class="table-card" style="margin-bottom:24px">
        <div class="table-toolbar">
          <div class="toolbar-left"><h3 style="font-family:var(--font-display);font-size:20px;font-weight:600">Company Overview</h3></div>
        </div>
        <div class="table-overflow">
          <table class="data-table">
            <thead>
              <tr><th>Company Name</th><th>Industry</th><th>Sessions</th><th>Women</th><th>Cups</th><th>Conv%</th><th>Adoption%</th><th>3M Data</th><th>Alerts</th></tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="9" class="empty-cell">No companies onboarded.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  // Recent Activity Log
  const activities = DB.getActivityLog().slice(0, 15);
  const activityHtml = `
    <div class="activity-panel">
      <h3 style="font-family:var(--font-display);font-size:20px;font-weight:600;margin-bottom:16px;">Recent Activity</h3>
      <div class="activity-list">
        ${activities.length === 0 ? '<div class="empty-cell">No activity logged yet.</div>' : activities.map(a => `
          <div class="activity-item">
            <div class="activity-time">${new Date(a.timestamp).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            <div class="activity-desc">
              <strong>${a.actorName}</strong> ${a.description}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

  return `
    <div class="page-header">
      <div>
        <h1>Overview Dashboard</h1>
        <div class="page-subtitle">Auleaves Freedom Circle Program Tracking</div>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="DB.addNotification({message:'Hey'})">Sync Data</button>
      </div>
    </div>
    ${overdueBanner}
    ${cardsHtml}
    ${companyTableHtml}
    ${activityHtml}
  `;
}
