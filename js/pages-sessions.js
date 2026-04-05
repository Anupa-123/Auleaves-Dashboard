// ============================================================
// Auleaves FCP — Sessions Page v2
// Inline expand panel, cycle dots, adoption logic
// ============================================================

// Track which sessions are expanded
const expandedSessions = new Set();

// ---- Status config ----
const SESSION_STATUS_CONFIG = {
  'open':     { label: 'Open',      bg: 'rgba(33,150,243,0.12)',  color: '#64B5F6' },
  'cycle1':   { label: 'Cycle 1',   bg: 'rgba(255,179,0,0.12)',   color: '#FFB300' },
  'cycle2':   { label: 'Cycle 2',   bg: 'rgba(206,147,216,0.12)', color: '#CE93D8' },
  'cycle3':   { label: 'Cycle 3',   bg: 'rgba(129,199,132,0.12)', color: '#81C784' },
  'overdue':  { label: 'Overdue',   bg: 'rgba(239,154,154,0.12)', color: '#EF9A9A' },
  'complete': { label: 'Complete',  bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
};

const ADOPTION_STATUS_CONFIG = {
  'adopted':     { label: 'Adopted',     bg: 'rgba(76,175,80,0.12)',  color: '#81C784' },
  'not-adopted': { label: 'Not Adopted', bg: 'rgba(239,83,80,0.12)',  color: '#EF9A9A' },
  'tracking':    { label: 'Tracking',    bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }
};

function statusPill(status) {
  const cfg = SESSION_STATUS_CONFIG[status] || SESSION_STATUS_CONFIG['open'];
  return `<span class="status-pill" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`;
}

function adoptionPill(status) {
  const cfg = ADOPTION_STATUS_CONFIG[status] || ADOPTION_STATUS_CONFIG['tracking'];
  return `<span class="status-pill" style="background:${cfg.bg};color:${cfg.color}">${cfg.label}</span>`;
}

function cycleDot(status, locked) {
  // status: 'done' | 'not-adopted' | 'pending' | 'locked'
  let bg, border, title;
  if (locked)                    { bg = 'rgba(255,255,255,0.04)'; border = '1.5px solid rgba(255,255,255,0.1)'; title = 'Locked'; }
  else if (status === 'done')    { bg = 'rgba(76,175,80,0.18)';   border = '1.5px solid #4CAF50'; title = 'Done'; }
  else if (status === 'not-adopted') { bg = 'rgba(239,83,80,0.18)'; border = '1.5px solid #EF5350'; title = 'Not Adopted'; }
  else                           { bg = 'rgba(255,179,0,0.12)';   border = '1.5px solid #FFB300'; title = 'Pending'; }
  return `<span class="cycle-dot" style="background:${bg};border:${border}" title="${title}"></span>`;
}

function whatsappIndicators(benId) {
  const log = DB.getWhatsappLog().filter(l => l.beneficiaryId === benId);
  return [1, 2, 3].map(cycle => {
    const dispatch = log.find(l => l.cycleNumber === cycle);
    if (!dispatch)              return `<span class="wa-dot wa-none" title="Not sent">—</span>`;
    if (dispatch.responseReceived) return `<span class="wa-dot wa-replied" title="Replied">R</span>`;
    return `<span class="wa-dot wa-sent" title="Sent, awaiting reply">S</span>`;
  }).join('');
}

// ============================================================
// MAIN RENDER
// ============================================================
function renderSessions() {
  const cid      = getCompanyId();
  const sessions = (cid ? DB.getSessionsByCompany(cid) : DB.getSessions())
                   .sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

  // --- Summary stats ---
  const allBens    = cid ? DB.getBeneficiariesByCompany(cid) : DB.getBeneficiaries();
  const allRecords = cid ? DB.getCyclesByCompany(cid) : DB.getCycleRecords();
  const allSessions = cid ? DB.getSessionsByCompany(cid) : DB.getSessions();

  const totalAttended = allSessions.reduce((s, x) => s + (parseInt(x.womenAttended)||0), 0);
  const totalCups     = allSessions.reduce((s, x) => s + (parseInt(x.cupsPurchased)||0), 0);
  const adopted       = allBens.filter(b => DB._getBenAdoptionStatus(b.id, allRecords) === 'adopted').length;
  const notAdopted    = allBens.filter(b => DB._getBenAdoptionStatus(b.id, allRecords) === 'not-adopted').length;
  const c3done        = allRecords.filter(r => r.cycleNumber === 3 && r.status === 'done').length;

  const overdueSessions = sessions.filter(s => DB.computeSessionStatus(s.id) === 'overdue');

  const summaryBar = `
    <div class="summary-bar">
      <div class="summary-card">
        <div class="summary-icon">📅</div>
        <div class="summary-value">${sessions.length}</div>
        <div class="summary-label">Sessions</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">👩</div>
        <div class="summary-value">${totalAttended}</div>
        <div class="summary-label">Women Reached</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">🏆</div>
        <div class="summary-value">${totalCups}</div>
        <div class="summary-label">Cups Distributed</div>
      </div>
      <div class="summary-card summary-card--green">
        <div class="summary-icon">✅</div>
        <div class="summary-value" style="color:#4CAF50">${adopted}</div>
        <div class="summary-label">Adopted</div>
      </div>
      <div class="summary-card summary-card--red">
        <div class="summary-icon">❌</div>
        <div class="summary-value" style="color:#EF5350">${notAdopted}</div>
        <div class="summary-label">Not Adopted</div>
      </div>
      <div class="summary-card">
        <div class="summary-icon">🎯</div>
        <div class="summary-value" style="color:#81C784">${c3done}</div>
        <div class="summary-label">Cycle 3 Complete</div>
      </div>
    </div>`;

  // Overdue banner
  const overdueBanner = overdueSessions.length > 0 ? `
    <div class="overdue-banner">
      <span>⚠</span>
      <span><strong>${overdueSessions.length} session${overdueSessions.length > 1 ? 's' : ''} overdue</strong> — women past expected Cycle 3 date with no check-in logged.</span>
      <button class="btn btn-sm" onclick="navigateTo('whatsapp-log')" style="background:rgba(255,179,0,0.15);color:#FFB300;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:11px">Send WhatsApp Reminders</button>
    </div>` : '';

  const filterBar = `
    <div class="filter-bar">
      <div class="search-wrapper" style="flex:1;min-width:200px">
        <input type="text" class="search-input" id="sessionsSearch" placeholder="Search facilitator, department, type..." oninput="filterSessionsTable()">
      </div>
      <select class="filter-select" id="statusFilter" onchange="filterSessionsTable()">
        <option value="">All Statuses</option>
        <option value="open">Open</option>
        <option value="cycle1">Cycle 1</option>
        <option value="cycle2">Cycle 2</option>
        <option value="cycle3">Cycle 3</option>
        <option value="overdue">Overdue</option>
        <option value="complete">Complete</option>
      </select>
      <select class="filter-select" id="typeFilter" onchange="filterSessionsTable()">
        <option value="">All Types</option>
        <option value="awareness workshop">Awareness Workshop</option>
        <option value="hands-on training">Hands-on Training</option>
        <option value="follow-up session">Follow-up Session</option>
        <option value="one-on-one counselling">One-on-One Counselling</option>
        <option value="group Q&A">Group Q&A</option>
      </select>
      <select class="filter-select" id="adoptionFilter" onchange="filterSessionsTable()">
        <option value="">All Adoption Rates</option>
        <option value="high">High (&gt;70%)</option>
        <option value="medium">Medium (40–70%)</option>
        <option value="low">Low (&lt;40%)</option>
      </select>
    </div>`;

  const tableRows = sessions.map(session => buildSessionRow(session)).join('');

  return `
    <div class="page-header" style="margin-bottom:0">
      <h1>Sessions</h1>
      ${currentUser.role === 'admin' ? `<button class="btn btn-primary" onclick="navigateTo('log-session')">+ Log Session</button>` : ''}
    </div>
    ${summaryBar}
    ${overdueBanner}
    ${filterBar}
    <div class="table-card" style="padding:0;overflow:visible">
      <div class="table-overflow">
        <table class="data-table sessions-table" id="sessionsTable">
          <thead>
            <tr>
              <th>Date</th><th>Facilitator</th><th>Department</th><th>Type</th>
              <th>Status</th><th>Attended</th><th>Cups</th><th>Conv%</th>
              <th>Adopted</th><th style="width:40px"></th>
            </tr>
          </thead>
          <tbody id="sessionsBody">
            ${tableRows || '<tr><td colspan="10" class="empty-cell">No sessions logged yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>`;
}

function buildSessionRow(session) {
  const status = DB.computeSessionStatus(session.id);
  const stats  = DB.getSessionAdoptionStats(session.id);
  const conv   = session.womenAttended > 0
    ? ((session.cupsPurchased / session.womenAttended) * 100).toFixed(0)
    : 0;
  const adoptPct = stats.total > 0 ? ((stats.adopted / stats.total) * 100).toFixed(0) : null;
  const adoptColor = adoptPct === null ? 'rgba(255,255,255,0.3)'
    : adoptPct >= 70 ? '#4CAF50' : adoptPct >= 40 ? '#FFB300' : '#EF5350';

  const sessionType = session.sessionType
    ? session.sessionType.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    : '—';

  return `
    <tr class="session-row" id="sr-${session.id}"
        data-status="${status}"
        data-type="${session.sessionType || ''}"
        data-adopt-pct="${adoptPct || 0}"
        data-search="${(session.facilitator + ' ' + session.department + ' ' + session.sessionType).toLowerCase()}">
      <td>${DB.formatDate(session.sessionDate)}</td>
      <td><strong>${session.facilitator || '—'}</strong></td>
      <td style="color:rgba(255,255,255,0.5);font-size:12px">${session.department || '—'}</td>
      <td style="font-size:12px">${sessionType}</td>
      <td>${statusPill(status)}</td>
      <td>${session.womenAttended || 0}</td>
      <td>${session.cupsPurchased || 0}</td>
      <td style="color:rgba(255,255,255,0.6)">${conv}%</td>
      <td>
        ${stats.total > 0
          ? `<span style="color:${adoptColor};font-weight:600">${stats.adopted}<span style="color:rgba(255,255,255,0.35);font-weight:400">/${stats.total}</span></span>`
          : '<span style="color:rgba(255,255,255,0.2)">—</span>'}
      </td>
      <td>
        <button class="expand-btn" id="expand-btn-${session.id}"
          onclick="toggleSessionExpand('${session.id}')" title="Expand participants">▼</button>
      </td>
    </tr>
    <tr class="expand-row hidden" id="expand-${session.id}">
      <td colspan="10" style="padding:0;background:#0f0f1e;border-top:1px solid rgba(255,255,255,0.05)">
        <div class="participant-panel" id="panel-${session.id}">
          ${buildParticipantPanel(session)}
        </div>
      </td>
    </tr>`;
}

// ============================================================
// EXPAND PANEL
// ============================================================
function toggleSessionExpand(sessionId) {
  const expandRow = document.getElementById('expand-' + sessionId);
  const btn       = document.getElementById('expand-btn-' + sessionId);
  const isOpen    = !expandRow.classList.contains('hidden');

  if (isOpen) {
    expandRow.classList.add('hidden');
    btn.textContent = '▼';
    btn.style.transform = '';
    expandedSessions.delete(sessionId);
  } else {
    expandRow.classList.remove('hidden');
    btn.textContent = '▼';
    btn.style.transform = 'rotate(180deg)';
    expandedSessions.add(sessionId);
    refreshParticipantPanel(sessionId);
  }
}

function refreshParticipantPanel(sessionId) {
  const panel = document.getElementById('panel-' + sessionId);
  if (panel) {
    const session = DB.getSession(sessionId);
    if (session) panel.innerHTML = buildParticipantPanel(session);
  }
}

function buildParticipantPanel(session) {
  const bens    = DB.getBeneficiariesBySession(session.id);
  const records = DB.getCyclesBySession(session.id);
  const stats   = DB.getSessionAdoptionStats(session.id);

  // Build reason tags for footer
  const reasonTags = Object.entries(stats.nonAdoptionReasons)
    .filter(([, count]) => count > 0)
    .map(([reason, count]) => `<span class="reason-tag">${reason} <strong>(${count})</strong></span>`)
    .join('');

  const participantRows = bens.map(b => buildParticipantRow(b, records)).join('');

  return `
    <div class="panel-header">
      <div class="panel-header-left">
        <span class="panel-title">Participants</span>
        <span class="count-badge">${bens.length}</span>
      </div>
      <div class="panel-header-right">
        <button class="btn btn-sm btn-primary" onclick="showAddParticipantForm('${session.id}')">
          + Add Participant
        </button>
        <button class="btn btn-sm btn-ghost" onclick="showToast('AI analysis coming soon in Next.js version','info')" title="Coming soon">
          🤖 Analyse Session
        </button>
      </div>
    </div>

    <div id="add-participant-form-${session.id}" class="hidden"></div>

    ${bens.length === 0
      ? '<div class="panel-empty">No participants registered yet. Click "+ Add Participant" to begin.</div>'
      : `<div class="participant-table-wrap">
          <table class="participant-table">
            <thead>
              <tr>
                <th>FCP ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Cup</th>
                <th>First Time</th>
                <th>Cycle 1</th>
                <th>Cycle 2</th>
                <th>Cycle 3</th>
                <th>WhatsApp</th>
                <th>Adoption</th>
                <th>Reason</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${participantRows}
            </tbody>
          </table>
        </div>`}

    <div class="panel-footer">
      <div class="panel-footer-counts">
        <span style="color:#81C784">✅ ${stats.adopted} adopted</span>
        <span style="color:#EF9A9A">✗ ${stats.notAdopted} not adopted</span>
        <span style="color:rgba(255,255,255,0.4)">⏳ ${stats.tracking} tracking</span>
      </div>
      ${reasonTags ? `<div class="reason-tags">${reasonTags}</div>` : ''}
    </div>`;
}

function buildParticipantRow(ben, allRecords) {
  const benRecords = allRecords.filter(r => r.beneficiaryId === ben.id);
  const c1 = benRecords.find(r => r.cycleNumber === 1);
  const c2 = benRecords.find(r => r.cycleNumber === 2);
  const c3 = benRecords.find(r => r.cycleNumber === 3);

  const c1Status    = c1 ? c1.status : 'pending';
  const c2Status    = c2 ? c2.status : (c1 && c1.status === 'done' ? 'pending' : 'locked');
  const c3Status    = c3 ? c3.status : (c2 && c2.status === 'done' ? 'pending' : 'locked');

  const adoptionStatus = DB._getBenAdoptionStatus(ben.id, allRecords);
  const showReason     = adoptionStatus === 'not-adopted';

  const cycleDropdown = (cycleNum, record, status, locked) => {
    if (locked && !record) {
      return `<div class="cycle-cell">${cycleDot('locked', true)}<span class="cycle-locked">—</span></div>`;
    }
    return `<div class="cycle-cell">
      ${cycleDot(status, false)}
      <select class="cycle-select" onchange="updateCycleStatus('${ben.id}','${ben.companyId}','${ben.sessionId}',${cycleNum},'${record ? record.id : ''}',this.value)"
        ${locked ? 'disabled style="opacity:0.35"' : ''}>
        <option value="pending"      ${status==='pending'      ? 'selected' : ''}>Pending</option>
        <option value="done"         ${status==='done'         ? 'selected' : ''}>Done</option>
        <option value="not-adopted"  ${status==='not-adopted'  ? 'selected' : ''}>Not Adopted</option>
      </select>
    </div>`;
  };

  return `<tr class="participant-row" id="prow-${ben.id}">
    <td><span class="fcp-id">${ben.fcpId}</span></td>
    <td>
      <div class="ben-name">${ben.fullName}</div>
      <div class="ben-meta">${ben.language} · ${ben.phoneAccessType === 'smartphone' ? '📱' : '📞'} ${ben.phoneAccessType}</div>
    </td>
    <td class="phone-cell">${DB.maskPhone(ben.phone)}</td>
    <td style="text-transform:capitalize">${ben.cupSize}</td>
    <td>${ben.firstTimeUser
      ? '<span class="first-badge">First</span>'
      : '<span class="return-badge">Return</span>'}</td>
    <td>${cycleDropdown(1, c1, c1Status, false)}</td>
    <td>${cycleDropdown(2, c2, c2Status, c2Status === 'locked')}</td>
    <td>${cycleDropdown(3, c3, c3Status, c3Status === 'locked')}</td>
    <td><div class="wa-indicators">${whatsappIndicators(ben.id)}</div></td>
    <td>
      <select class="adoption-select" onchange="updateAdoptionStatus('${ben.id}','${ben.id}',this.value)">
        <option value="tracking"    ${adoptionStatus==='tracking'    ? 'selected' : ''}>Tracking</option>
        <option value="adopted"     ${adoptionStatus==='adopted'     ? 'selected' : ''}>Adopted</option>
        <option value="not-adopted" ${adoptionStatus==='not-adopted' ? 'selected' : ''}>Not Adopted</option>
      </select>
    </td>
    <td id="reason-cell-${ben.id}">
      ${showReason ? reasonDropdown(ben.id, benRecords) : '<span style="color:rgba(255,255,255,0.2)">—</span>'}
    </td>
    <td><input class="notes-input" placeholder="Notes…" value="${ben.notes || ''}"
         onblur="saveBenNotes('${ben.id}',this.value)"></td>
  </tr>`;
}

function reasonDropdown(benId, benRecords) {
  const existing = benRecords.find(r => r.nonAdoptionReason)?.nonAdoptionReason || '';
  return `<select class="reason-select" onchange="saveNonAdoptionReason('${benId}',this.value)">
    <option value="">Select reason…</option>
    ${DB.NON_ADOPTION_REASONS.map(r =>
      `<option value="${r}" ${r === existing ? 'selected' : ''}>${r}</option>`
    ).join('')}
  </select>`;
}

// ============================================================
// ADD PARTICIPANT INLINE FORM
// ============================================================
function showAddParticipantForm(sessionId) {
  const formDiv = document.getElementById('add-participant-form-' + sessionId);
  if (!formDiv) return;
  formDiv.classList.remove('hidden');
  formDiv.innerHTML = `
    <div class="inline-form">
      <div class="inline-form-title">Register Participant</div>
      <div class="inline-form-grid">
        <div class="form-group">
          <label>Full Name <span class="required">*</span></label>
          <input type="text" class="form-control" id="ip_name_${sessionId}" placeholder="Full name" required>
        </div>
        <div class="form-group">
          <label>Phone <span class="required">*</span></label>
          <input type="tel" class="form-control" id="ip_phone_${sessionId}" placeholder="10-digit number" required>
        </div>
        <div class="form-group">
          <label>Age Group</label>
          <select class="form-control" id="ip_age_${sessionId}">
            <option value="18-24">18–24</option>
            <option value="25-34" selected>25–34</option>
            <option value="35-44">35–44</option>
            <option value="45+">45+</option>
          </select>
        </div>
        <div class="form-group">
          <label>Cup Size</label>
          <select class="form-control" id="ip_cup_${sessionId}">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div class="form-group">
          <label>First-time User?</label>
          <select class="form-control" id="ip_first_${sessionId}">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div class="form-group">
          <label>Language</label>
          <select class="form-control" id="ip_lang_${sessionId}">
            <option>Hindi</option><option>English</option><option>Marathi</option>
            <option>Telugu</option><option>Kannada</option><option>Tamil</option>
            <option>Bengali</option><option>Gujarati</option>
          </select>
        </div>
        <div class="form-group">
          <label>Phone Access</label>
          <select class="form-control" id="ip_phone_type_${sessionId}">
            <option value="smartphone">Smartphone</option>
            <option value="basic phone">Basic Phone</option>
          </select>
        </div>
        <div class="form-group">
          <label>WhatsApp Method</label>
          <select class="form-control" id="ip_wa_method_${sessionId}">
            <option value="self-fills form">Self-fills form</option>
            <option value="WhatsApp reply">WhatsApp reply</option>
            <option value="HR logs">HR logs</option>
          </select>
        </div>
      </div>
      <div class="consent-notice">
        <span>🔒</span>
        <em>"By registering, the woman has verbally consented to Auleaves collecting her name, phone number, and menstrual health journey data for programme impact tracking. This data is confidential and will not be shared with the employer company."</em>
      </div>
      <div class="inline-form-actions">
        <button class="btn btn-primary" onclick="saveParticipantWithConsent('${sessionId}')">
          🔒 Save with Consent
        </button>
        <button class="btn btn-ghost" onclick="cancelAddParticipant('${sessionId}')">Cancel</button>
      </div>
    </div>`;
}

function saveParticipantWithConsent(sessionId) {
  const g  = id => document.getElementById(id + '_' + sessionId);
  const name  = g('ip_name')?.value?.trim();
  const phone = g('ip_phone')?.value?.trim();
  if (!name || !phone) { showToast('Name and phone are required', 'error'); return; }

  const session = DB.getSession(sessionId);
  DB.addBeneficiary({
    companyId:        session.companyId,
    sessionId:        sessionId,
    fullName:         name,
    phone:            phone,
    ageGroup:         g('ip_age')?.value || '25-34',
    cupSize:          g('ip_cup')?.value || 'medium',
    firstTimeUser:    g('ip_first')?.value === 'yes',
    language:         g('ip_lang')?.value || 'Hindi',
    phoneAccessType:  g('ip_phone_type')?.value || 'smartphone',
    whatsappMethod:   g('ip_wa_method')?.value || 'self-fills form',
    consentRecordedBy: currentUser.name,
    consentDate:      new Date().toISOString().split('T')[0],
    registeredBy:     currentUser.role
  });

  cancelAddParticipant(sessionId);
  refreshParticipantPanel(sessionId);

  // Refresh the session row stats
  const row = document.getElementById('sr-' + sessionId);
  if (row) {
    const stats = DB.getSessionAdoptionStats(sessionId);
    row.querySelectorAll('td')[8].innerHTML = stats.total > 0
      ? `<span style="color:#FFB300;font-weight:600">${stats.adopted}<span style="color:rgba(255,255,255,0.35);font-weight:400">/${stats.total}</span></span>`
      : '<span style="color:rgba(255,255,255,0.2)">—</span>';
  }
  showToast('Participant registered with consent ✅');
}

function cancelAddParticipant(sessionId) {
  const formDiv = document.getElementById('add-participant-form-' + sessionId);
  if (formDiv) { formDiv.innerHTML = ''; formDiv.classList.add('hidden'); }
}

// ============================================================
// CYCLE + ADOPTION UPDATES (inline)
// ============================================================
function updateCycleStatus(benId, companyId, sessionId, cycleNum, existingRecordId, newStatus) {
  if (existingRecordId) {
    // Update existing
    DB.updateCycleRecord(existingRecordId, { status: newStatus });
  } else {
    // Create new
    const result = DB.addCycleRecord({
      beneficiaryId: benId, companyId, sessionId,
      cycleNumber: cycleNum, status: newStatus,
      loggedBy: currentUser.role, loggedByName: currentUser.name
    });
    if (result && result.error) { showToast(result.error, 'error'); return; }
  }

  // If not-adopted, require reason
  if (newStatus === 'not-adopted') {
    const reasonCell = document.getElementById('reason-cell-' + benId);
    if (reasonCell) {
      const records = DB.getCyclesByBeneficiary(benId);
      reasonCell.innerHTML = reasonDropdown(benId, records);
    }
  }

  // Refresh whole panel
  refreshParticipantPanel(sessionId);
  updateBadges();
  showToast(`Cycle ${cycleNum} updated`);
}

function updateAdoptionStatus(benId, _unused, newStatus) {
  // Find any cycle record and set adopted on it; if none found, store on beneficiary
  const records = DB.getCyclesByBeneficiary(benId);
  const adoptedVal = newStatus === 'adopted' ? true : newStatus === 'not-adopted' ? false : null;

  if (records.length > 0) {
    // Set on most recent cycle record
    DB.updateCycleRecord(records[records.length - 1].id, { adopted: adoptedVal });
  } else {
    DB.updateBeneficiary(benId, { _adoptionOverride: adoptedVal });
  }

  // Show/hide reason cell
  const reasonCell = document.getElementById('reason-cell-' + benId);
  if (reasonCell) {
    const rec = DB.getCyclesByBeneficiary(benId);
    reasonCell.innerHTML = newStatus === 'not-adopted' ? reasonDropdown(benId, rec)
      : '<span style="color:rgba(255,255,255,0.2)">—</span>';
  }
}

function saveNonAdoptionReason(benId, reason) {
  const records = DB.getCyclesByBeneficiary(benId);
  const notAdoptedRecord = records.find(r => r.status === 'not-adopted') || records[records.length - 1];
  if (notAdoptedRecord) {
    DB.updateCycleRecord(notAdoptedRecord.id, { nonAdoptionReason: reason });
    showToast('Reason saved');
  }
}

function saveBenNotes(benId, notes) {
  DB.updateBeneficiary(benId, { notes });
}

// ============================================================
// FILTER
// ============================================================
function filterSessionsTable() {
  const search  = (document.getElementById('sessionsSearch')?.value || '').toLowerCase();
  const status  = document.getElementById('statusFilter')?.value || '';
  const type    = document.getElementById('typeFilter')?.value || '';
  const adopt   = document.getElementById('adoptionFilter')?.value || '';

  document.querySelectorAll('#sessionsBody .session-row').forEach(row => {
    const rowStatus  = row.dataset.status || '';
    const rowType    = row.dataset.type || '';
    const rowSearch  = row.dataset.search || '';
    const rowAdoptPct = parseFloat(row.dataset.adoptPct || 0);

    let show = true;
    if (search && !rowSearch.includes(search)) show = false;
    if (status && rowStatus !== status) show = false;
    if (type   && rowType   !== type)   show = false;
    if (adopt === 'high'   && rowAdoptPct < 70)  show = false;
    if (adopt === 'medium' && (rowAdoptPct < 40 || rowAdoptPct >= 70)) show = false;
    if (adopt === 'low'    && rowAdoptPct >= 40) show = false;

    row.style.display = show ? '' : 'none';
    // Also hide the expand row if parent is hidden
    const expandRow = document.getElementById('expand-' + row.id.replace('sr-', ''));
    if (expandRow) expandRow.style.display = show ? '' : 'none';
  });
}
