// ============================================
// Auleaves Freedom Circle Program — Database Layer
// localStorage-based CRUD with easy Supabase swap
// ============================================

const DB = {
  // ---- Storage Keys ----
  KEYS: {
    companies: 'fcp_companies',
    sessions: 'fcp_sessions',
    beneficiaries: 'fcp_beneficiaries',
    followups: 'fcp_followups',
    activityLog: 'fcp_activity_log',
    notifications: 'fcp_notifications',
    currentUser: 'fcp_current_user',
    seeded: 'fcp_seeded'
  },

  // ---- Helpers ----
  _get(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch { return []; }
  },
  _set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },
  generateFCPId(existingBeneficiaries) {
    const num = (existingBeneficiaries || []).length + 1;
    return 'FCP-' + String(num).padStart(3, '0');
  },
  timestamp() {
    return new Date().toISOString();
  },

  // ---- Format Helpers ----
  formatINR(amount) {
    if (!amount && amount !== 0) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
  },
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },
  maskPhone(phone) {
    if (!phone) return '—';
    return '****' + phone.slice(-4);
  },

  // ============ COMPANIES ============
  getCompanies() { return this._get(this.KEYS.companies); },
  getCompany(id) { return this.getCompanies().find(c => c.id === id); },
  addCompany(data) {
    const companies = this.getCompanies();
    const company = {
      ...data,
      id: this.generateId(),
      createdAt: this.timestamp()
    };
    companies.push(company);
    this._set(this.KEYS.companies, companies);
    this.logActivity('admin', 'Admin', 'Added company: ' + data.name);
    return company;
  },
  updateCompany(id, data) {
    let companies = this.getCompanies();
    companies = companies.map(c => c.id === id ? { ...c, ...data } : c);
    this._set(this.KEYS.companies, companies);
    this.logActivity('admin', 'Admin', 'Updated company: ' + data.name);
  },
  deleteCompany(id) {
    const company = this.getCompany(id);
    let companies = this.getCompanies().filter(c => c.id !== id);
    this._set(this.KEYS.companies, companies);
    // Cascade delete
    let sessions = this.getSessions().filter(s => s.companyId !== id);
    this._set(this.KEYS.sessions, sessions);
    let bens = this.getBeneficiaries().filter(b => b.companyId !== id);
    this._set(this.KEYS.beneficiaries, bens);
    let fups = this.getFollowups().filter(f => f.companyId !== id);
    this._set(this.KEYS.followups, fups);
    if (company) this.logActivity('admin', 'Admin', 'Deleted company: ' + company.name + ' (cascaded all data)');
  },
  getCompanyStats(companyId) {
    const sessions = this.getSessions().filter(s => s.companyId === companyId);
    const bens = this.getBeneficiaries().filter(b => b.companyId === companyId);
    const followups = this.getFollowups().filter(f => f.companyId === companyId);
    const totalAttended = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const totalCups = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const month3 = followups.filter(f => f.month === 3 && (f.usageStatus === 'using comfortably' || f.usageStatus === 'using with some issues'));
    return {
      sessionsCount: sessions.length,
      womenAttended: totalAttended,
      cupsPurchased: totalCups,
      registeredBeneficiaries: bens.length,
      conversionRate: totalAttended > 0 ? ((totalCups / totalAttended) * 100).toFixed(1) : 0,
      month3Active: month3.length,
      retentionRate: bens.length > 0 ? ((month3.length / bens.length) * 100).toFixed(1) : 0
    };
  },

  // ============ SESSIONS ============
  getSessions() { return this._get(this.KEYS.sessions); },
  getSession(id) { return this.getSessions().find(s => s.id === id); },
  getSessionsByCompany(companyId) { return this.getSessions().filter(s => s.companyId === companyId); },
  addSession(data) {
    const sessions = this.getSessions();
    const session = {
      ...data,
      id: this.generateId(),
      loggedAt: this.timestamp()
    };
    sessions.push(session);
    this._set(this.KEYS.sessions, sessions);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.loggedBy || 'admin', data.loggedByName || 'Admin', `Logged session for ${company ? company.name : 'Unknown'}`);
    this.addNotification({
      type: 'session_logged',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `New session logged: ${data.womenAttended} women attended, ${data.cupsPurchased} cups distributed`,
      actor: data.loggedByName || 'Admin',
      actorRole: data.loggedBy === 'admin' ? 'Admin' : 'Company'
    });
    return session;
  },
  updateSession(id, data) {
    let sessions = this.getSessions();
    sessions = sessions.map(s => s.id === id ? { ...s, ...data } : s);
    this._set(this.KEYS.sessions, sessions);
  },
  deleteSession(id) {
    let sessions = this.getSessions().filter(s => s.id !== id);
    this._set(this.KEYS.sessions, sessions);
  },

  // ============ BENEFICIARIES ============
  getBeneficiaries() { return this._get(this.KEYS.beneficiaries); },
  getBeneficiary(id) { return this.getBeneficiaries().find(b => b.id === id); },
  getBeneficiariesByCompany(companyId) { return this.getBeneficiaries().filter(b => b.companyId === companyId); },
  addBeneficiary(data) {
    const bens = this.getBeneficiaries();
    const fcpId = this.generateFCPId(bens);
    const ben = {
      ...data,
      id: this.generateId(),
      fcpId: fcpId,
      registeredAt: this.timestamp()
    };
    bens.push(ben);
    this._set(this.KEYS.beneficiaries, bens);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.registeredBy || 'admin', 'Admin', `Registered beneficiary ${fcpId}: ${data.fullName}`);
    this.addNotification({
      type: 'beneficiary_registered',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `New beneficiary registered: ${fcpId} - ${data.fullName}`,
      actor: 'Admin',
      actorRole: 'Admin'
    });
    return ben;
  },
  updateBeneficiary(id, data) {
    let bens = this.getBeneficiaries();
    bens = bens.map(b => b.id === id ? { ...b, ...data } : b);
    this._set(this.KEYS.beneficiaries, bens);
  },

  // ============ FOLLOW-UPS ============
  getFollowups() { return this._get(this.KEYS.followups); },
  getFollowupsByCompany(companyId) { return this.getFollowups().filter(f => f.companyId === companyId); },
  getFollowupsByBeneficiary(beneficiaryId) { return this.getFollowups().filter(f => f.beneficiaryId === beneficiaryId); },
  hasFollowup(beneficiaryId, month) {
    return this.getFollowups().some(f => f.beneficiaryId === beneficiaryId && f.month === month);
  },
  addFollowup(data) {
    if (this.hasFollowup(data.beneficiaryId, data.month)) {
      return { error: 'A check-in for this month already exists for this beneficiary.' };
    }
    const followups = this.getFollowups();
    const followup = {
      ...data,
      id: this.generateId(),
      loggedAt: this.timestamp(),
      verified: false,
      verifiedBy: null,
      verifiedAt: null
    };
    followups.push(followup);
    this._set(this.KEYS.followups, followups);
    const ben = this.getBeneficiary(data.beneficiaryId);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.loggedByRole || 'company', data.loggedByName || 'HR', `Submitted Month ${data.month} check-in for ${ben ? ben.fcpId : 'Unknown'}`);
    this.addNotification({
      type: 'followup_submitted',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `Month ${data.month} check-in submitted for ${ben ? ben.fcpId + ' (' + ben.fullName + ')' : 'Unknown'}: ${data.usageStatus}`,
      actor: data.loggedByName || 'Company HR',
      actorRole: data.loggedByRole === 'admin' ? 'Admin' : 'Company'
    });
    return followup;
  },
  verifyFollowup(id, verifierName) {
    let followups = this.getFollowups();
    followups = followups.map(f => f.id === id ? { ...f, verified: true, verifiedBy: verifierName, verifiedAt: this.timestamp() } : f);
    this._set(this.KEYS.followups, followups);
    this.logActivity('admin', verifierName, `Verified follow-up record ${id}`);
  },

  // ============ ACTIVITY LOG ============
  getActivityLog() { return this._get(this.KEYS.activityLog); },
  logActivity(role, actorName, description) {
    const log = this.getActivityLog();
    log.unshift({
      id: this.generateId(),
      timestamp: this.timestamp(),
      role: role,
      actorName: actorName,
      description: description
    });
    // Keep last 500
    if (log.length > 500) log.length = 500;
    this._set(this.KEYS.activityLog, log);
  },

  // ============ NOTIFICATIONS ============
  getNotifications() { return this._get(this.KEYS.notifications); },
  getUnreadNotifications() { return this.getNotifications().filter(n => !n.read); },
  addNotification(data) {
    const notifs = this.getNotifications();
    notifs.unshift({
      ...data,
      id: this.generateId(),
      timestamp: this.timestamp(),
      read: false
    });
    if (notifs.length > 200) notifs.length = 200;
    this._set(this.KEYS.notifications, notifs);
  },
  markNotificationRead(id) {
    let notifs = this.getNotifications();
    notifs = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    this._set(this.KEYS.notifications, notifs);
  },
  markAllNotificationsRead() {
    let notifs = this.getNotifications().map(n => ({ ...n, read: true }));
    this._set(this.KEYS.notifications, notifs);
  },

  // ============ AUTH ============
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.currentUser)); }
    catch { return null; }
  },
  login(loginId, password) {
    // Admin login
    if (loginId === 'admin' && password === 'auleaves2026') {
      const user = { role: 'admin', name: 'Auleaves Admin', companyId: null };
      localStorage.setItem(this.KEYS.currentUser, JSON.stringify(user));
      this.logActivity('admin', 'Admin', 'Admin logged in');
      return user;
    }
    // Company login
    const company = this.getCompanies().find(c => c.loginId === loginId && c.loginPassword === password);
    if (company) {
      const user = { role: 'company', name: company.csrContactName, companyId: company.id, companyName: company.name };
      localStorage.setItem(this.KEYS.currentUser, JSON.stringify(user));
      this.logActivity('company', company.csrContactName, `${company.name} logged in`);
      this.addNotification({
        type: 'login',
        companyId: company.id,
        companyName: company.name,
        message: `${company.name} (${company.csrContactName}) logged in`,
        actor: company.csrContactName,
        actorRole: 'Company'
      });
      return user;
    }
    return null;
  },
  logout() {
    const user = this.getCurrentUser();
    if (user) this.logActivity(user.role, user.name, `${user.name} logged out`);
    localStorage.removeItem(this.KEYS.currentUser);
  },

  // ============ IMPACT FUNNEL ============
  getImpactFunnel(companyId) {
    const sessions = companyId ? this.getSessionsByCompany(companyId) : this.getSessions();
    const bens = companyId ? this.getBeneficiariesByCompany(companyId) : this.getBeneficiaries();
    const followups = companyId ? this.getFollowupsByCompany(companyId) : this.getFollowups();

    const attended = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const cupsPurchased = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const registered = bens.length;

    const month1Using = followups.filter(f => f.month === 1 && (f.usageStatus === 'using comfortably' || f.usageStatus === 'using with some issues')).length;
    const month2Using = followups.filter(f => f.month === 2 && (f.usageStatus === 'using comfortably' || f.usageStatus === 'using with some issues')).length;
    const month3Using = followups.filter(f => f.month === 3 && (f.usageStatus === 'using comfortably' || f.usageStatus === 'using with some issues')).length;
    const month3Comfortable = followups.filter(f => f.month === 3 && f.usageStatus === 'using comfortably').length;
    const recommended = followups.filter(f => f.month === 3 && f.recommendedToOthers === 'yes').length;

    return {
      attended,
      cupsPurchased,
      registered,
      month1Using,
      month2Using,
      month3Using,
      month3Comfortable,
      recommended,
      conversionRate: attended > 0 ? ((cupsPurchased / attended) * 100).toFixed(1) : 0,
      adoptionRate: registered > 0 ? ((month3Comfortable / registered) * 100).toFixed(1) : 0,
      referralRate: month3Using > 0 ? ((recommended / month3Using) * 100).toFixed(1) : 0,
      retentionRate: registered > 0 ? ((month3Using / registered) * 100).toFixed(1) : 0
    };
  },

  // ============ AGGREGATE STATS ============
  getDashboardStats(companyId) {
    const sessions = companyId ? this.getSessionsByCompany(companyId) : this.getSessions();
    const bens = companyId ? this.getBeneficiariesByCompany(companyId) : this.getBeneficiaries();
    const followups = companyId ? this.getFollowupsByCompany(companyId) : this.getFollowups();
    const companies = this.getCompanies();

    const totalAttended = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const totalCups = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const totalRevenue = sessions.reduce((s, x) => s + (parseFloat(x.revenueCollected) || 0), 0);
    const totalSubsidy = sessions.reduce((s, x) => s + (parseFloat(x.csrSubsidy) || 0), 0);

    const month3Active = followups.filter(f => f.month === 3 && (f.usageStatus === 'using comfortably' || f.usageStatus === 'using with some issues')).length;
    const month3Verified = followups.filter(f => f.month === 3 && f.verified).length;
    const month3Total = followups.filter(f => f.month === 3).length;

    return {
      totalSessions: sessions.length,
      totalCups,
      totalAttended,
      companiesCount: companies.length,
      registeredBeneficiaries: bens.length,
      month3Active,
      adoptionRate: bens.length > 0 ? ((month3Active / bens.length) * 100).toFixed(1) : 0,
      totalRevenue,
      totalSubsidy,
      month3Verified,
      month3Total,
      dataIntegrity: month3Total > 0 ? ((month3Verified / month3Total) * 100).toFixed(1) : 0
    };
  },

  // ============ Clear All ============
  clearAll() {
    Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
  }
};
