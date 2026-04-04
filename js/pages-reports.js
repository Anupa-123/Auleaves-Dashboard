// ============================================
// Notifications + Impact Report + Charts
// ============================================

function renderNotifications() {
  if (currentUser.role !== 'admin') return '<div class="empty-state"><h3>Access Denied</h3></div>';
  const notifs = DB.getNotifications();

  const items = notifs.map(n => {
    const iconClass = n.type === 'session_logged' ? 'session' : n.type === 'followup_submitted' ? 'followup' : n.type === 'login' ? 'login' : 'beneficiary';
    const icon = n.type === 'session_logged' ? '📅' : n.type === 'followup_submitted' ? '📋' : n.type === 'login' ? '🔑' : '👩';
    return `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
      <div class="notif-icon ${iconClass}">${icon}</div>
      <div class="notif-content">
        <div class="notif-message">${n.message}</div>
        <div class="notif-meta">
          <span>👤 ${n.actor}</span>
          <span>🏢 ${n.companyName}</span>
          <span>🕐 ${DB.formatDate(n.timestamp)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="page-header"><h1>Notifications</h1>
    <button class="btn btn-secondary" onclick="markAllRead()">✓ Mark All Read</button></div>
    ${notifs.length > 0 ? `<div class="notif-list">${items}</div>` : '<div class="empty-state"><div class="empty-icon">🔔</div><h3>No notifications</h3></div>'}`;
}

function markNotifRead(id) {
  DB.markNotificationRead(id);
  navigateTo('notifications');
}

function markAllRead() {
  DB.markAllNotificationsRead();
  showToast('All notifications marked as read');
  navigateTo('notifications');
}

// ---- Impact Report ----
function renderImpactReport() {
  const cid = getCompanyId();
  const stats = DB.getDashboardStats(cid);
  const funnel = DB.getImpactFunnel(cid);
  const compName = cid ? (DB.getCompany(cid)?.name || '') : 'All Companies';

  return `<div class="page-header"><h1>CSR Impact Report</h1>
    <div class="d-flex gap-8">
      <button class="btn btn-primary" onclick="window.print()">📄 Export PDF</button>
    </div></div>

    <div class="report-section">
      <h3>Programme Overview — ${compName}</h3>
      <div class="report-metric-grid">
        <div class="report-metric"><div class="metric-value">${stats.totalSessions}</div><div class="metric-label">Sessions Held</div></div>
        <div class="report-metric"><div class="metric-value">${stats.totalAttended}</div><div class="metric-label">Women Reached</div></div>
        <div class="report-metric"><div class="metric-value">${stats.totalCups}</div><div class="metric-label">Cups Distributed</div></div>
        <div class="report-metric"><div class="metric-value">${stats.registeredBeneficiaries}</div><div class="metric-label">Registered Beneficiaries</div></div>
        <div class="report-metric"><div class="metric-value">${stats.totalAttended > 0 ? ((stats.totalCups/stats.totalAttended)*100).toFixed(1) : 0}%</div><div class="metric-label">Conversion Rate</div></div>
        <div class="report-metric"><div class="metric-value">${stats.adoptionRate}%</div><div class="metric-label">3-Month Retention</div></div>
        <div class="report-metric"><div class="metric-value">${funnel.recommended}</div><div class="metric-label">Peer Referrals</div></div>
        <div class="report-metric"><div class="metric-value">${DB.formatINR(stats.totalRevenue)}</div><div class="metric-label">Revenue</div></div>
        <div class="report-metric"><div class="metric-value">${DB.formatINR(stats.totalSubsidy)}</div><div class="metric-label">CSR Subsidy</div></div>
      </div>
    </div>

    <div class="report-section">
      <h3>Impact Funnel — Sustained Behaviour Change</h3>
      <div class="chart-card">
        <div class="funnel-list">
          ${renderReportFunnel(funnel)}
        </div>
      </div>
    </div>

    <div class="integrity-statement">
      <p><strong>Data Integrity Statement:</strong> ${stats.month3Verified} of ${stats.month3Total} Month 3 follow-up records 
      (${stats.dataIntegrity}%) have been independently verified by Auleaves field facilitators. 
      This report was generated on ${DB.formatDate(new Date().toISOString())} via the Auleaves Freedom Circle Program dashboard.</p>
    </div>`;
}

function renderReportFunnel(funnel) {
  const maxVal = Math.max(funnel.attended, 1);
  const stages = [
    { label: 'Women Reached', value: funnel.attended, pct: '100%', color: 'var(--chart-rose)' },
    { label: 'Cups Purchased', value: funnel.cupsPurchased, pct: funnel.conversionRate + '%', color: 'var(--chart-gold)' },
    { label: 'Registered', value: funnel.registered, pct: (funnel.attended > 0 ? (funnel.registered/funnel.attended*100).toFixed(1) : 0) + '%', color: 'var(--chart-sage)' },
    { label: 'Using at Month 3', value: funnel.month3Comfortable, pct: (funnel.registered > 0 ? (funnel.month3Comfortable/funnel.registered*100).toFixed(1) : 0) + '%', color: 'var(--chart-blue)' },
    { label: 'Recommended to Peers', value: funnel.recommended, pct: funnel.referralRate + '%', color: 'var(--chart-purple)' }
  ];
  return stages.map(s => `
    <div class="funnel-row">
      <div class="funnel-label" style="width:130px">${s.label}</div>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${(s.value/maxVal*100)}%;background:${s.color}"></div></div>
      <div class="funnel-value">${s.value} <span class="text-muted" style="font-size:11px">(${s.pct})</span></div>
    </div>`).join('');
}

// ---- CHART INIT (after render) ----
function afterRender(page) {
  if (page === 'dashboard') initDashboardCharts();
}

function initDashboardCharts() {
  const cid = getCompanyId();
  const sessions = cid ? DB.getSessionsByCompany(cid) : DB.getSessions();

  const monthlyData = {};
  sessions.forEach(s => {
    const d = new Date(s.sessionDate);
    const m = d.toLocaleString('en-US', { month: 'short' });
    if (!monthlyData[m]) monthlyData[m] = { sessions: 0, cups: 0 };
    monthlyData[m].sessions++;
    monthlyData[m].cups += parseInt(s.cupsPurchased) || 0;
  });

  const labels = Object.keys(monthlyData);
  const sessData = labels.map(m => monthlyData[m].sessions);
  const cupsData = labels.map(m => monthlyData[m].cups);

  const canvas = document.getElementById('trendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  chartInstances.trend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Sessions',
          data: sessData,
          borderColor: '#D4A039',
          backgroundColor: 'rgba(212, 160, 57, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#D4A039',
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: 'y'
        },
        {
          label: 'Cups',
          data: cupsData,
          borderColor: '#C2185B',
          backgroundColor: 'rgba(194, 24, 91, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#C2185B',
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9CA3B0', font: { family: 'DM Sans' } } },
        y: { position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#D4A039', font: { family: 'DM Sans' } } },
        y1: { position: 'right', grid: { display: false }, ticks: { color: '#C2185B', font: { family: 'DM Sans' } } }
      }
    }
  });
}
