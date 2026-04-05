// ============================================================
// Auleaves Freedom Circle Program — Database Layer v2
// localStorage CRUD — ready for Supabase drop-in replacement
// ============================================================

const DB = {

  // ---- Storage Keys ----
  KEYS: {
    companies:      'fcp_companies',
    sessions:       'fcp_sessions',
    beneficiaries:  'fcp_beneficiaries',
    cycleRecords:   'fcp_cycle_records',   // replaces fcp_followups
    whatsappLog:    'fcp_whatsapp_log',
    activityLog:    'fcp_activity_log',
    notifications:  'fcp_notifications',
    currentUser:    'fcp_current_user',
    seeded:         'fcp_seeded_v2'        // v2 forces fresh seed
  },

  // ---- Non-adoption Reasons (10 exact options) ----
  NON_ADOPTION_REASONS: [
    'Discomfort / pain during use',
    'Discomfort / pressure sensation',
    'Fear of insertion',
    'Leakage issues',
    'Cultural or family resistance',
    'Partner disapproval',
    'Lost cup',
    'Forgot / not yet tried',
    'Medical advice against use',
    'Other'
  ],

  // ---- localStorage helpers ----
  _get(key)      { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  _set(key, data){ localStorage.setItem(key, JSON.stringify(data)); },

  // ---- Sequential ID generators ----
  _nextSeq(items, prefix, digits) {
    let max = 0;
    (items || []).forEach(item => {
      const code = item.companyCode || item.sessionCode || item.fcpId || item.journeyId || item.dispatchId || '';
      const num = parseInt(code.replace(prefix + '-', '')) || 0;
      if (num > max) max = num;
    });
    return prefix + '-' + String(max + 1).padStart(digits, '0');
  },
  generateCompanyCode() { return this._nextSeq(this.getCompanies(), 'CO', 3); },
  generateSessionCode() { return this._nextSeq(this.getSessions(), 'SE', 3); },
  generateFCPId()       { return this._nextSeq(this.getBeneficiaries(), 'FCP', 3); },
  generateJourneyId()   { return this._nextSeq(this.getCycleRecords(), 'JT', 3); },
  generateDispatchId()  { return this._nextSeq(this.getWhatsappLog(), 'DI', 3); },
  generateId()          { return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); },
  timestamp()           { return new Date().toISOString(); },

  // ---- Format helpers ----
  formatINR(amount) {
    if (!amount && amount !== 0) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
  },
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return '—';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
  },
  maskPhone(phone) {
    if (!phone) return '—';
    const s = phone.replace(/\D/g, '');
    return '****' + s.slice(-4);
  },

  // ============================================================
  // COMPANIES
  // ============================================================
  getCompanies()   { return this._get(this.KEYS.companies); },
  getCompany(id)   { return this.getCompanies().find(c => c.id === id); },

  addCompany(data) {
    const companies = this.getCompanies();
    const company = {
      id:              this.generateId(),
      companyCode:     this.generateCompanyCode(),
      name:            data.name || '',
      csrContactName:  data.csrContactName || '',
      designation:     data.designation || '',
      contactEmail:    data.contactEmail || '',
      contactPhone:    data.contactPhone || '',
      city:            data.city || '',
      state:           data.state || '',
      industry:        data.industry || '',
      targetWomenCount: parseInt(data.targetWomenCount) || 0,
      programmeStartDate: data.programmeStartDate || '',
      csrBudget:       parseFloat(data.csrBudget) || 0,
      programmeStatus: data.programmeStatus || 'active',
      loginId:         data.loginId || '',
      loginPassword:   data.loginPassword || '',
      createdAt:       this.timestamp(),
      createdBy:       data.createdBy || 'admin'
    };
    companies.push(company);
    this._set(this.KEYS.companies, companies);
    this.logActivity('admin', 'Admin', 'Added company: ' + company.name);
    return company;
  },

  updateCompany(id, data) {
    let companies = this.getCompanies();
    companies = companies.map(c => c.id === id ? { ...c, ...data } : c);
    this._set(this.KEYS.companies, companies);
    this.logActivity('admin', 'Admin', 'Updated company: ' + (data.name || id));
  },

  deleteCompany(id) {
    const company = this.getCompany(id);
    this._set(this.KEYS.companies, this.getCompanies().filter(c => c.id !== id));
    this._set(this.KEYS.sessions, this.getSessions().filter(s => s.companyId !== id));
    this._set(this.KEYS.beneficiaries, this.getBeneficiaries().filter(b => b.companyId !== id));
    this._set(this.KEYS.cycleRecords, this.getCycleRecords().filter(r => r.companyId !== id));
    if (company) this.logActivity('admin', 'Admin', 'Deleted company: ' + company.name);
  },

  // ============================================================
  // SESSIONS
  // ============================================================
  getSessions()              { return this._get(this.KEYS.sessions); },
  getSession(id)             { return this.getSessions().find(s => s.id === id); },
  getSessionsByCompany(cid)  { return this.getSessions().filter(s => s.companyId === cid); },

  // Compute session status from cycle records
  computeSessionStatus(sessionId) {
    const bens    = this.getBeneficiaries().filter(b => b.sessionId === sessionId);
    if (!bens.length) return 'open';
    const records = this.getCycleRecords().filter(r => r.sessionId === sessionId);

    // Check overdue: session date > 90 days ago and no Cycle 3 done
    const session   = this.getSession(sessionId);
    if (session) {
      const daysSince = (Date.now() - new Date(session.sessionDate)) / 86400000;
      const cycle3done = records.filter(r => r.cycleNumber === 3 && r.status === 'done').length;
      if (daysSince > 100 && cycle3done < bens.length) return 'overdue';
    }

    const c1done = records.filter(r => r.cycleNumber === 1 && r.status === 'done').length;
    const c2any  = records.filter(r => r.cycleNumber === 2).length;
    const c3any  = records.filter(r => r.cycleNumber === 3).length;
    const c3done = records.filter(r => r.cycleNumber === 3 && (r.status === 'done' || r.status === 'not-adopted')).length;

    if (c3any > 0)       return 'cycle3';
    if (c2any > 0)       return 'cycle2';
    if (c1done > 0)      return 'cycle1';
    if (c3done === bens.length && bens.length > 0) return 'complete';
    return 'open';
  },

  addSession(data) {
    const sessions = this.getSessions();
    const session = {
      id:               this.generateId(),
      sessionCode:      this.generateSessionCode(),
      companyId:        data.companyId,
      sessionDate:      data.sessionDate || '',
      facilitator:      data.facilitator || '',
      department:       data.department || '',
      city:             data.city || '',
      sessionType:      data.sessionType || 'awareness workshop',
      language:         data.language || 'Hindi',
      womenInvited:     parseInt(data.womenInvited) || 0,
      womenAttended:    parseInt(data.womenAttended) || 0,
      cupsPurchased:    parseInt(data.cupsPurchased) || 0,
      cupSizeSmall:     parseInt(data.cupSizeSmall) || 0,
      cupSizeMedium:    parseInt(data.cupSizeMedium) || 0,
      cupSizeLarge:     parseInt(data.cupSizeLarge) || 0,
      firstTimeUsersCount: parseInt(data.firstTimeUsersCount) || 0,
      revenueCollected: parseFloat(data.revenueCollected) || 0,
      csrSubsidy:       parseFloat(data.csrSubsidy) || 0,
      notes:            data.notes || '',
      loggedBy:         data.loggedBy || 'admin',
      loggedByName:     data.loggedByName || 'Admin',
      loggedAt:         this.timestamp()
    };
    sessions.push(session);
    this._set(this.KEYS.sessions, sessions);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.loggedBy || 'admin', data.loggedByName || 'Admin',
      `Logged session ${session.sessionCode} for ${company ? company.name : 'Unknown'}`);
    this.addNotification({
      type: 'session_logged',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `Session logged: ${session.sessionCode} — ${data.womenAttended} women, ${data.cupsPurchased} cups`,
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
    this._set(this.KEYS.sessions, this.getSessions().filter(s => s.id !== id));
  },

  // Session adoption stats (for table display)
  getSessionAdoptionStats(sessionId) {
    const bens    = this.getBeneficiaries().filter(b => b.sessionId === sessionId);
    const records = this.getCycleRecords().filter(r => r.sessionId === sessionId);
    let adopted = 0, notAdopted = 0, tracking = 0;
    bens.forEach(b => {
      const status = this._getBenAdoptionStatus(b.id, records);
      if (status === 'adopted')      adopted++;
      else if (status === 'not-adopted') notAdopted++;
      else                           tracking++;
    });
    const nonAdoptionReasons = {};
    records.filter(r => r.nonAdoptionReason).forEach(r => {
      nonAdoptionReasons[r.nonAdoptionReason] = (nonAdoptionReasons[r.nonAdoptionReason] || 0) + 1;
    });
    return { total: bens.length, adopted, notAdopted, tracking, nonAdoptionReasons };
  },

  _getBenAdoptionStatus(benId, records) {
    const benRecords = (records || this.getCycleRecords()).filter(r => r.beneficiaryId === benId);
    // If any cycle explicitly sets adopted
    const explicit = benRecords.find(r => r.adopted !== null && r.adopted !== undefined);
    if (explicit) return explicit.adopted ? 'adopted' : 'not-adopted';
    // If Cycle 1 done → adopted
    if (benRecords.some(r => r.cycleNumber === 1 && r.status === 'done')) return 'adopted';
    if (benRecords.some(r => r.status === 'not-adopted')) return 'not-adopted';
    return 'tracking';
  },

  // ============================================================
  // BENEFICIARIES
  // ============================================================
  getBeneficiaries()             { return this._get(this.KEYS.beneficiaries); },
  getBeneficiary(id)             { return this.getBeneficiaries().find(b => b.id === id); },
  getBeneficiariesByCompany(cid) { return this.getBeneficiaries().filter(b => b.companyId === cid); },
  getBeneficiariesBySession(sid) { return this.getBeneficiaries().filter(b => b.sessionId === sid); },

  addBeneficiary(data) {
    const bens = this.getBeneficiaries();
    const fcpId = this.generateFCPId();
    const ben = {
      id:                  this.generateId(),
      fcpId:               fcpId,
      companyId:           data.companyId,
      sessionId:           data.sessionId || '',
      fullName:            data.fullName || '',
      phone:               data.phone || '',
      ageGroup:            data.ageGroup || '25-34',
      cupSize:             data.cupSize || 'medium',
      firstTimeUser:       data.firstTimeUser === true || data.firstTimeUser === 'yes',
      language:            data.language || 'Hindi',
      phoneAccessType:     data.phoneAccessType || 'smartphone',
      whatsappMethod:      data.whatsappMethod || 'self-fills form',
      consentGiven:        true,
      consentStatement:    'Participant verbally consented to Auleaves collecting her name, phone number, and menstrual health journey data for programme impact tracking. This data is confidential and will not be shared with the employer company.',
      consentRecordedBy:   data.consentRecordedBy || 'Admin',
      consentDate:         data.consentDate || new Date().toISOString().split('T')[0],
      registeredBy:        data.registeredBy || 'admin',
      registeredAt:        this.timestamp(),
      optedOut:            false,
      optOutDate:          null,
      optOutReason:        null
    };
    bens.push(ben);
    this._set(this.KEYS.beneficiaries, bens);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.registeredBy || 'admin', data.consentRecordedBy || 'Admin',
      `Registered beneficiary ${fcpId}: ${data.fullName}`);
    this.addNotification({
      type: 'beneficiary_registered',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `New beneficiary: ${fcpId} — ${data.fullName}`,
      actor: data.consentRecordedBy || 'Admin',
      actorRole: 'Admin'
    });
    return ben;
  },

  updateBeneficiary(id, data) {
    let bens = this.getBeneficiaries();
    bens = bens.map(b => b.id === id ? { ...b, ...data } : b);
    this._set(this.KEYS.beneficiaries, bens);
  },

  deleteBeneficiary(id) {
    const bens = this.getBeneficiaries().filter(b => b.id !== id);
    this._set(this.KEYS.beneficiaries, bens);
  },

  getBenAdoptionStatus(benId) {
    return this._getBenAdoptionStatus(benId);
  },

  // ============================================================
  // CYCLE RECORDS (replaces followups)
  // ============================================================
  getCycleRecords()                  { return this._get(this.KEYS.cycleRecords); },
  getCycleRecord(id)                 { return this.getCycleRecords().find(r => r.id === id); },
  getCyclesByBeneficiary(benId)      { return this.getCycleRecords().filter(r => r.beneficiaryId === benId); },
  getCyclesByCompany(cid)            { return this.getCycleRecords().filter(r => r.companyId === cid); },
  getCyclesBySession(sid)            { return this.getCycleRecords().filter(r => r.sessionId === sid); },
  hasCycleRecord(benId, cycleNum)    { return this.getCycleRecords().some(r => r.beneficiaryId === benId && r.cycleNumber === cycleNum); },

  addCycleRecord(data) {
    // Prevent duplicate
    if (this.hasCycleRecord(data.beneficiaryId, data.cycleNumber)) {
      return { error: `Cycle ${data.cycleNumber} record already exists for this beneficiary.` };
    }
    // Enforce: Cycle 2/3 locked until previous is done
    if (data.cycleNumber > 1) {
      const prev = this.getCycleRecords().find(r => r.beneficiaryId === data.beneficiaryId && r.cycleNumber === data.cycleNumber - 1);
      if (!prev || prev.status === 'pending') {
        return { error: `Cycle ${data.cycleNumber - 1} must be completed before logging Cycle ${data.cycleNumber}.` };
      }
    }

    const records = this.getCycleRecords();
    // Auto-set adopted based on status
    let adopted = data.adopted !== undefined ? data.adopted : null;
    if (data.status === 'done' && adopted === null)         adopted = true;
    if (data.status === 'not-adopted' && adopted === null)  adopted = false;

    const record = {
      id:                    this.generateId(),
      journeyId:             this.generateJourneyId(),
      beneficiaryId:         data.beneficiaryId,
      companyId:             data.companyId,
      sessionId:             data.sessionId || '',
      cycleNumber:           data.cycleNumber,
      status:                data.status || 'pending',      // pending|done|not-adopted
      adopted:               adopted,                        // null|true|false
      nonAdoptionReason:     data.nonAdoptionReason || null,
      checkInDate:           data.checkInDate || new Date().toISOString().split('T')[0],
      usageStatus:           data.usageStatus || '',
      recommendedToOthers:   data.recommendedToOthers || '',
      peersCount:            parseInt(data.peersCount) || 0,
      comfortInsertion:      data.comfortInsertion || '',
      comfortRemoval:        data.comfortRemoval || '',
      leakage:               data.leakage || '',
      physicalDiscomfort:    data.physicalDiscomfort || '',
      discomfortDescription: data.discomfortDescription || '',
      periodPainChange:      data.periodPainChange || '',
      trackingPeriod:        data.trackingPeriod || '',
      confidence:            data.confidence || '',
      infections:            data.infections || false,
      likesMost:             data.likesMost || '',
      challenge:             data.challenge || '',
      messageToAuleaves:     data.messageToAuleaves || '',
      whatsappSent:          data.whatsappSent || false,
      whatsappSentDate:      data.whatsappSentDate || null,
      responseReceived:      data.responseReceived || false,
      responseDate:          data.responseDate || null,
      responseMethod:        data.responseMethod || '',
      dataCollectionMethod:  data.dataCollectionMethod || '',
      loggedBy:              data.loggedBy || 'admin',
      loggedByName:          data.loggedByName || 'Admin',
      loggedAt:              this.timestamp(),
      verifiedByAuleaves:    false,
      verifiedByName:        null,
      verifiedAt:            null,
      facilitatorNotes:      data.facilitatorNotes || ''
    };
    records.push(record);
    this._set(this.KEYS.cycleRecords, records);

    const ben     = this.getBeneficiary(data.beneficiaryId);
    const company = this.getCompany(data.companyId);
    this.logActivity(data.loggedBy || 'admin', data.loggedByName || 'Admin',
      `Cycle ${data.cycleNumber} check-in: ${ben ? ben.fcpId : 'Unknown'} — ${data.status}`);
    this.addNotification({
      type: 'cycle_submitted',
      companyId: data.companyId,
      companyName: company ? company.name : 'Unknown',
      message: `Cycle ${data.cycleNumber} submitted for ${ben ? ben.fcpId + ' (' + ben.fullName + ')' : 'Unknown'}: ${data.status}`,
      actor: data.loggedByName || 'Admin',
      actorRole: data.loggedBy === 'admin' ? 'Admin' : 'Company'
    });
    return record;
  },

  updateCycleRecord(id, data) {
    let records = this.getCycleRecords();
    records = records.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...data };
      // Re-apply adoption logic
      if (data.status === 'done'         && r.adopted === null) updated.adopted = true;
      if (data.status === 'not-adopted'  && r.adopted === null) updated.adopted = false;
      return updated;
    });
    this._set(this.KEYS.cycleRecords, records);
  },

  verifyCycleRecord(id, verifierName) {
    let records = this.getCycleRecords();
    records = records.map(r => r.id === id
      ? { ...r, verifiedByAuleaves: true, verifiedByName: verifierName, verifiedAt: this.timestamp() }
      : r);
    this._set(this.KEYS.cycleRecords, records);
    this.logActivity('admin', verifierName, `Verified cycle record ${id}`);
  },

  // ============================================================
  // WHATSAPP DISPATCH LOG
  // ============================================================
  getWhatsappLog()     { return this._get(this.KEYS.whatsappLog); },
  getWhatsappLogByCompany(cid) { return this.getWhatsappLog().filter(l => l.companyId === cid); },

  addWhatsappDispatch(data) {
    const log = this.getWhatsappLog();
    const entry = {
      id:                  this.generateId(),
      dispatchId:          this.generateDispatchId(),
      beneficiaryId:       data.beneficiaryId,
      companyId:           data.companyId,
      cycleNumber:         data.cycleNumber,
      messageType:         data.messageType || 'reminder',
      language:            data.language || 'Hindi',
      sentDate:            data.sentDate || new Date().toISOString().split('T')[0],
      sentBy:              data.sentBy || 'Admin',
      responseReceived:    data.responseReceived || false,
      responseDate:        data.responseDate || null,
      responseMethod:      data.responseMethod || '',
      dataEnteredInSystem: data.dataEnteredInSystem || false,
      notes:               data.notes || '',
      createdAt:           this.timestamp()
    };
    log.push(entry);
    this._set(this.KEYS.whatsappLog, log);
    return entry;
  },

  updateWhatsappDispatch(id, data) {
    let log = this.getWhatsappLog();
    log = log.map(l => l.id === id ? { ...l, ...data } : l);
    this._set(this.KEYS.whatsappLog, log);
  },

  // Overdue dispatches: sent, no reply after 7 days
  getOverdueWhatsappDispatches() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    return this.getWhatsappLog().filter(l =>
      !l.responseReceived && l.sentDate < sevenDaysAgo
    );
  },

  // ============================================================
  // ACTIVITY LOG
  // ============================================================
  getActivityLog() { return this._get(this.KEYS.activityLog); },
  logActivity(role, actorName, description) {
    const log = this.getActivityLog();
    log.unshift({ id: this.generateId(), timestamp: this.timestamp(), role, actorName, description });
    if (log.length > 500) log.length = 500;
    this._set(this.KEYS.activityLog, log);
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  getNotifications()        { return this._get(this.KEYS.notifications); },
  getUnreadNotifications()  { return this.getNotifications().filter(n => !n.read); },
  addNotification(data) {
    const notifs = this.getNotifications();
    notifs.unshift({ ...data, id: this.generateId(), timestamp: this.timestamp(), read: false });
    if (notifs.length > 200) notifs.length = 200;
    this._set(this.KEYS.notifications, notifs);
  },
  markNotificationRead(id) {
    this._set(this.KEYS.notifications, this.getNotifications().map(n => n.id === id ? { ...n, read: true } : n));
  },
  markAllNotificationsRead() {
    this._set(this.KEYS.notifications, this.getNotifications().map(n => ({ ...n, read: true })));
  },

  // ============================================================
  // AUTH
  // ============================================================
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.currentUser)); } catch { return null; }
  },
  login(loginId, password) {
    if (loginId === 'admin' && password === 'auleaves2026') {
      const user = { role: 'admin', name: 'Auleaves Admin', companyId: null };
      localStorage.setItem(this.KEYS.currentUser, JSON.stringify(user));
      this.logActivity('admin', 'Admin', 'Admin logged in');
      return user;
    }
    const company = this.getCompanies().find(c => c.loginId === loginId && c.loginPassword === password);
    if (company) {
      const user = { role: 'company', name: company.csrContactName, companyId: company.id, companyName: company.name };
      localStorage.setItem(this.KEYS.currentUser, JSON.stringify(user));
      this.logActivity('company', company.csrContactName, `${company.name} logged in`);
      this.addNotification({
        type: 'login', companyId: company.id, companyName: company.name,
        message: `${company.name} (${company.csrContactName}) logged in`,
        actor: company.csrContactName, actorRole: 'Company'
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

  // ============================================================
  // AGGREGATE STATS
  // ============================================================
  getDashboardStats(companyId) {
    const companies  = this.getCompanies();
    const sessions   = companyId ? this.getSessionsByCompany(companyId) : this.getSessions();
    const bens       = companyId ? this.getBeneficiariesByCompany(companyId) : this.getBeneficiaries();
    const records    = companyId ? this.getCyclesByCompany(companyId) : this.getCycleRecords();

    const totalAttended = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const totalCups     = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const totalRevenue  = sessions.reduce((s, x) => s + (parseFloat(x.revenueCollected) || 0), 0);
    const totalSubsidy  = sessions.reduce((s, x) => s + (parseFloat(x.csrSubsidy) || 0), 0);

    const adopted    = bens.filter(b => this._getBenAdoptionStatus(b.id, records) === 'adopted').length;
    const notAdopted = bens.filter(b => this._getBenAdoptionStatus(b.id, records) === 'not-adopted').length;

    const c3done     = records.filter(r => r.cycleNumber === 3 && r.status === 'done').length;
    const c3verified = records.filter(r => r.cycleNumber === 3 && r.verifiedByAuleaves).length;
    const c3total    = records.filter(r => r.cycleNumber === 3).length;

    return {
      companiesCount: companies.length,
      sessionsCount: sessions.length,
      totalAttended, totalCups, totalRevenue, totalSubsidy,
      registeredBeneficiaries: bens.length,
      adopted, notAdopted,
      adoptionRate: bens.length > 0 ? ((adopted / bens.length) * 100).toFixed(1) : 0,
      cycle3Completions: c3done,
      cycle3Verified: c3verified,
      cycle3Total: c3total,
      dataIntegrity: c3total > 0 ? ((c3verified / c3total) * 100).toFixed(1) : 0
    };
  },

  getCompanyStats(companyId) {
    const sessions = this.getSessionsByCompany(companyId);
    const bens     = this.getBeneficiariesByCompany(companyId);
    const records  = this.getCyclesByCompany(companyId);
    const totalAttended = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const totalCups     = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const adopted       = bens.filter(b => this._getBenAdoptionStatus(b.id, records) === 'adopted').length;
    const c3done        = records.filter(r => r.cycleNumber === 3 && r.status === 'done').length;
    // Overdue: any session > 90 days with no Cycle 3
    const overdue = sessions.some(s => {
      const daysSince = (Date.now() - new Date(s.sessionDate)) / 86400000;
      return daysSince > 100 && records.filter(r => r.sessionId === s.id && r.cycleNumber === 3 && r.status === 'done').length === 0;
    });
    return {
      sessionsCount: sessions.length,
      womenAttended: totalAttended,
      cupsPurchased: totalCups,
      registeredBeneficiaries: bens.length,
      conversionRate: totalAttended > 0 ? ((totalCups / totalAttended) * 100).toFixed(1) : 0,
      adoptionRate:   bens.length > 0 ? ((adopted / bens.length) * 100).toFixed(1) : 0,
      cycle3Complete: c3done,
      hasOverdue: overdue,
      // 3M data status
      has3MData: records.some(r => r.cycleNumber === 3)
    };
  },

  getImpactFunnel(companyId) {
    const sessions = companyId ? this.getSessionsByCompany(companyId) : this.getSessions();
    const bens     = companyId ? this.getBeneficiariesByCompany(companyId) : this.getBeneficiaries();
    const records  = companyId ? this.getCyclesByCompany(companyId) : this.getCycleRecords();

    const attended     = sessions.reduce((s, x) => s + (parseInt(x.womenAttended) || 0), 0);
    const cups         = sessions.reduce((s, x) => s + (parseInt(x.cupsPurchased) || 0), 0);
    const registered   = bens.length;
    const adopted      = bens.filter(b => this._getBenAdoptionStatus(b.id, records) === 'adopted').length;
    const c3done       = records.filter(r => r.cycleNumber === 3 && r.status === 'done').length;
    const recommended  = records.filter(r => r.recommendedToOthers === 'yes').length;

    const nonAdoptionBreakdown = {};
    this.NON_ADOPTION_REASONS.forEach(r => nonAdoptionBreakdown[r] = 0);
    records.filter(r => r.nonAdoptionReason).forEach(r => {
      nonAdoptionBreakdown[r.nonAdoptionReason] = (nonAdoptionBreakdown[r.nonAdoptionReason] || 0) + 1;
    });

    return {
      attended, cups, registered, adopted,
      cycle1Adoption: records.filter(r => r.cycleNumber === 1 && r.status === 'done').length,
      cycle2Adoption: records.filter(r => r.cycleNumber === 2 && r.status === 'done').length,
      cycle3Done: c3done,
      recommended,
      conversionRate: attended > 0 ? ((cups / attended) * 100).toFixed(1) : 0,
      adoptionRate:   registered > 0 ? ((adopted / registered) * 100).toFixed(1) : 0,
      cycle3Rate:     registered > 0 ? ((c3done / registered) * 100).toFixed(1) : 0,
      referralRate:   adopted > 0 ? ((recommended / adopted) * 100).toFixed(1) : 0,
      nonAdoptionBreakdown
    };
  },

  // Overdue sessions across all companies (for dashboard panel)
  getOverdueSessions() {
    return this.getSessions().filter(s => this.computeSessionStatus(s.id) === 'overdue');
  },

  // ============================================================
  // UTILITY
  // ============================================================
  clearAll() { Object.values(this.KEYS).forEach(key => localStorage.removeItem(key)); }
};
