// ============================================
// Supabase Client — Replaces localStorage DB
// ============================================

const SUPABASE_URL = 'https://tcslfhyyfswduidsfibt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_bud7Wp4L_2mtobeLbWhacw_7ZzN9YzK';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ---- AUTH FUNCTIONS ----
const Auth = {
  // Sign up with email/password
  async signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    });
    if (error) return { error: error.message };
    return { data, message: 'Check your email for verification link!' };
  },

  // Sign in with email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { data };
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) return { error: error.message };
    return { data };
  },

  // Sign out
  async signOut() {
    await supabase.auth.signOut();
  },

  // Get current session
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Get current user profile (with role)
  async getProfile() {
    const session = await this.getSession();
    if (!session) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*, companies(name)')
      .eq('id', session.user.id)
      .single();
    return data;
  },

  // Listen to auth changes
  onAuthChange(callback) {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }
};

// ---- DATABASE FUNCTIONS (replaces localStorage DB) ----
const SupaDB = {
  // ---- COMPANIES ----
  async getCompanies() {
    const { data } = await supabase.from('companies').select('*').order('name');
    return data || [];
  },

  async getCompany(id) {
    const { data } = await supabase.from('companies').select('*').eq('id', id).single();
    return data;
  },

  async addCompany(company) {
    const { data, error } = await supabase.from('companies').insert([{
      name: company.name,
      industry: company.industry,
      city: company.city,
      csr_contact_name: company.csrContactName,
      contact_email: company.contactEmail,
      target_women_count: company.targetWomenCount || 0,
      programme_start_date: company.programmeStartDate || null,
      login_id: company.loginId,
      login_password: company.loginPassword
    }]).select().single();
    if (error) return { error: error.message };
    return data;
  },

  async updateCompany(id, updates) {
    const { error } = await supabase.from('companies').update({
      name: updates.name,
      industry: updates.industry,
      city: updates.city,
      csr_contact_name: updates.csrContactName,
      contact_email: updates.contactEmail,
      target_women_count: updates.targetWomenCount || 0,
      login_id: updates.loginId,
      login_password: updates.loginPassword
    }).eq('id', id);
    return !error;
  },

  async deleteCompany(id) {
    await supabase.from('companies').delete().eq('id', id);
  },

  // ---- SESSIONS ----
  async getSessions(companyId) {
    let q = supabase.from('sessions').select('*').order('session_date', { ascending: false });
    if (companyId) q = q.eq('company_id', companyId);
    const { data } = await q;
    return data || [];
  },

  async addSession(session) {
    const { data, error } = await supabase.from('sessions').insert([{
      company_id: session.companyId,
      session_date: session.sessionDate,
      facilitator: session.facilitator,
      department: session.department,
      city: session.city,
      session_type: session.sessionType,
      women_attended: session.womenAttended || 0,
      cups_purchased: session.cupsPurchased || 0,
      revenue_collected: session.revenueCollected || 0,
      csr_subsidy: session.csrSubsidy || 0,
      notes: session.notes,
      logged_by: session.loggedBy,
      logged_by_name: session.loggedByName
    }]).select().single();
    if (error) return { error: error.message };
    // Add notification
    const comp = await this.getCompany(session.companyId);
    await this.addNotification('session_logged',
      `New session logged: ${session.womenAttended} women attended`,
      session.loggedByName, session.companyId, comp?.name || '');
    return data;
  },

  // ---- BENEFICIARIES ----
  async getBeneficiaries(companyId) {
    let q = supabase.from('beneficiaries').select('*').order('created_at', { ascending: false });
    if (companyId) q = q.eq('company_id', companyId);
    const { data } = await q;
    return data || [];
  },

  async getBeneficiary(id) {
    const { data } = await supabase.from('beneficiaries').select('*').eq('id', id).single();
    return data;
  },

  async addBeneficiary(ben) {
    const { data, error } = await supabase.from('beneficiaries').insert([{
      company_id: ben.companyId,
      session_id: ben.sessionId || null,
      full_name: ben.fullName,
      phone: ben.phone,
      age_group: ben.ageGroup,
      cup_size: ben.cupSize,
      first_time_user: ben.firstTimeUser,
      language: ben.language,
      consent_recorded_by: ben.consentRecordedBy,
      consent_date: ben.consentDate,
      registered_by: ben.registeredBy
    }]).select().single();
    if (error) return { error: error.message };
    return data;
  },

  // ---- FOLLOW-UPS ----
  async getFollowups(companyId) {
    let q = supabase.from('followups').select('*').order('created_at', { ascending: false });
    if (companyId) q = q.eq('company_id', companyId);
    const { data } = await q;
    return data || [];
  },

  async getFollowupsByBeneficiary(benId) {
    const { data } = await supabase.from('followups').select('*')
      .eq('beneficiary_id', benId).order('month');
    return data || [];
  },

  async addFollowup(fu) {
    // Check for duplicate
    const { data: existing } = await supabase.from('followups')
      .select('id').eq('beneficiary_id', fu.beneficiaryId).eq('month', fu.month);
    if (existing && existing.length > 0) {
      return { error: `Month ${fu.month} follow-up already exists for this beneficiary.` };
    }
    const { data, error } = await supabase.from('followups').insert([{
      beneficiary_id: fu.beneficiaryId,
      company_id: fu.companyId,
      month: fu.month,
      follow_date: fu.date,
      usage_status: fu.usageStatus,
      recommended_to_others: fu.recommendedToOthers,
      notes: fu.notes,
      logged_by_name: fu.loggedByName,
      logged_by_role: fu.loggedByRole
    }]).select().single();
    if (error) return { error: error.message };
    // Notification
    const comp = await this.getCompany(fu.companyId);
    await this.addNotification('followup_submitted',
      `Month ${fu.month} follow-up submitted`,
      fu.loggedByName, fu.companyId, comp?.name || '');
    return data;
  },

  async verifyFollowup(id, verifierName) {
    await supabase.from('followups').update({
      verified: true,
      verified_by: verifierName,
      verified_at: new Date().toISOString()
    }).eq('id', id);
  },

  // ---- NOTIFICATIONS ----
  async getNotifications() {
    const { data } = await supabase.from('notifications').select('*')
      .order('created_at', { ascending: false }).limit(50);
    return data || [];
  },

  async addNotification(type, message, actor, companyId, companyName) {
    await supabase.from('notifications').insert([{
      type, message, actor,
      company_id: companyId,
      company_name: companyName
    }]);
  },

  async markNotificationRead(id) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
  },

  async getUnreadCount() {
    const { count } = await supabase.from('notifications')
      .select('*', { count: 'exact', head: true }).eq('is_read', false);
    return count || 0;
  },

  // ---- STATS ----
  async getDashboardStats(companyId) {
    const sessions = await this.getSessions(companyId);
    const bens = await this.getBeneficiaries(companyId);
    const followups = await this.getFollowups(companyId);
    const companies = await this.getCompanies();

    const totalAttended = sessions.reduce((s, x) => s + (x.women_attended || 0), 0);
    const totalCups = sessions.reduce((s, x) => s + (x.cups_purchased || 0), 0);
    const totalRevenue = sessions.reduce((s, x) => s + parseFloat(x.revenue_collected || 0), 0);
    const totalSubsidy = sessions.reduce((s, x) => s + parseFloat(x.csr_subsidy || 0), 0);

    const m3Comfortable = followups.filter(f => f.month === 3 && f.usage_status === 'using comfortably').length;
    const m3Total = followups.filter(f => f.month === 3).length;
    const m3Verified = followups.filter(f => f.month === 3 && f.verified).length;

    return {
      totalSessions: sessions.length,
      totalAttended,
      totalCups,
      registeredBeneficiaries: bens.length,
      totalRevenue,
      totalSubsidy,
      adoptionRate: bens.length > 0 ? ((m3Comfortable / bens.length) * 100).toFixed(1) : '0',
      month3Verified: m3Verified,
      month3Total: m3Total,
      dataIntegrity: m3Total > 0 ? ((m3Verified / m3Total) * 100).toFixed(1) : '0',
      companiesCount: companyId ? 1 : companies.length
    };
  },

  async getImpactFunnel(companyId) {
    const sessions = await this.getSessions(companyId);
    const bens = await this.getBeneficiaries(companyId);
    const followups = await this.getFollowups(companyId);

    const attended = sessions.reduce((s, x) => s + (x.women_attended || 0), 0);
    const cupsPurchased = sessions.reduce((s, x) => s + (x.cups_purchased || 0), 0);
    const registered = bens.length;
    const m3Comfortable = followups.filter(f => f.month === 3 &&
      (f.usage_status === 'using comfortably' || f.usage_status === 'using with some issues')).length;
    const recommended = followups.filter(f => f.recommended_to_others === 'yes').length;

    return {
      attended, cupsPurchased, registered, month3Comfortable: m3Comfortable, recommended,
      conversionRate: attended > 0 ? ((cupsPurchased / attended) * 100).toFixed(1) : '0',
      referralRate: registered > 0 ? ((recommended / registered) * 100).toFixed(1) : '0'
    };
  },

  // ---- HELPERS ----
  formatDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  formatINR(n) {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  },

  maskPhone(p) {
    if (!p || p.length < 4) return '****';
    return '****' + p.slice(-4);
  }
};
