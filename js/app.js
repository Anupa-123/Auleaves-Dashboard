// ============================================
// Auleaves Freedom Circle Program — Main App
// SPA Router, Page Renderers, Business Logic
// ============================================

let currentPage = 'dashboard';
let currentUser = null;
let activeCompanyFilter = '';
let chartInstances = {};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  initEmailJS();
  // Check for Supabase auth session
  if (supabase) {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadUserProfile(session.user);
      } else {
        // Fallback: check localStorage
        currentUser = DB.getCurrentUser();
        if (currentUser) { showApp(); } else { showLogin(); }
      }
    });
    // Listen for auth changes (e.g. Google redirect)
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadUserProfile(session.user);
      }
    });
  } else {
    currentUser = DB.getCurrentUser();
    if (currentUser) { showApp(); } else { showLogin(); }
  }
});

// Load user profile from Supabase
async function loadUserProfile(authUser) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  currentUser = {
    id: authUser.id,
    email: authUser.email,
    name: profile?.full_name || authUser.user_metadata?.full_name || authUser.email,
    role: profile?.role || 'company',
    companyId: profile?.company_id || '',
    companyName: ''
  };

  if (currentUser.companyId) {
    const { data: comp } = await supabase.from('companies').select('name').eq('id', currentUser.companyId).single();
    if (comp) currentUser.companyName = comp.name;
  }

  // Save locally for quick access
  DB.setCurrentUser(currentUser);
  showApp();
}

// ---- AUTH TAB SWITCHING ----
function switchAuthTab(tab) {
  const signIn = document.getElementById('signInForm');
  const signUp = document.getElementById('signUpForm');
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  hideAuthMessage();

  if (tab === 'signin') {
    signIn.classList.remove('hidden');
    signUp.classList.add('hidden');
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
  } else {
    signIn.classList.add('hidden');
    signUp.classList.remove('hidden');
    tabSignIn.classList.remove('active');
    tabSignUp.classList.add('active');
  }
}

function showAuthMessage(msg, type) {
  const el = document.getElementById('authMessage');
  el.textContent = msg;
  el.className = 'auth-message show ' + type;
}

function hideAuthMessage() {
  document.getElementById('authMessage').className = 'auth-message';
}

// ---- SIGN IN ----
async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) {
      showAuthMessage(error.message, 'error');
      return false;
    }
    // Profile will be loaded by onAuthStateChange
  } else {
    // Fallback to localStorage
    const user = DB.login(email, pw);
    if (user) {
      currentUser = user;
      showApp();
    } else {
      showAuthMessage('Invalid credentials. Please try again.', 'error');
    }
  }
  return false;
}

// ---- SIGN UP ----
async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pw = document.getElementById('signupPassword').value.trim();

  if (!supabase) {
    showAuthMessage('Sign up requires Supabase connection.', 'error');
    return false;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: pw,
    options: { data: { full_name: name } }
  });

  if (error) {
    showAuthMessage(error.message, 'error');
    return false;
  }

  showAuthMessage('✅ Account created! Check your email to verify, then sign in.', 'success');
  // Switch to sign in tab after 2 seconds
  setTimeout(() => switchAuthTab('signin'), 3000);
  return false;
}

// ---- GOOGLE SIGN IN ----
async function handleGoogleSignIn() {
  if (!supabase) {
    showAuthMessage('Google Sign-In requires Supabase connection.', 'error');
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) showAuthMessage(error.message, 'error');
}

// ---- LOGOUT ----
function handleLogout() {
  if (supabase) { supabase.auth.signOut(); }
  DB.logout();
  currentUser = null;
  showLogin();
}

function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appLayout').classList.add('hidden');
  hideAuthMessage();
}

function showApp() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('appLayout').classList.remove('hidden');
  setupAppForRole();
  navigateTo('dashboard');
}

function setupAppForRole() {
  const isAdmin = currentUser.role === 'admin';
  document.getElementById('adminNav').classList.toggle('hidden', !isAdmin);
  document.getElementById('companyNav').classList.toggle('hidden', isAdmin);
  document.getElementById('companySelector').classList.toggle('hidden', !isAdmin);
  document.getElementById('btnHeaderLogSession').classList.toggle('hidden', !isAdmin);
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = isAdmin ? 'Super Admin' : 'Company User';
  document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
  if (isAdmin) {
    populateCompanySelector();
    activeCompanyFilter = '';
  } else {
    activeCompanyFilter = currentUser.companyId;
    document.getElementById('headerCompanyName').textContent = currentUser.companyName || '';
  }
  updateBadges();
}

function populateCompanySelector() {
  const sel = document.getElementById('activeCompanySelect');
  const companies = DB.getCompanies();
  sel.innerHTML = '<option value="">All Companies</option>' +
    companies.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function onCompanyFilterChange() {
  activeCompanyFilter = document.getElementById('activeCompanySelect').value;
  const comp = activeCompanyFilter ? DB.getCompany(activeCompanyFilter) : null;
  document.getElementById('headerCompanyName').textContent = comp ? comp.name : 'All Companies';
  navigateTo(currentPage);
}

function updateBadges() {
  const sc = document.getElementById('sessionsCount');
  const nc = document.getElementById('notifCount');
  if (sc) sc.textContent = DB.getSessions().length;
  if (nc) { const u = DB.getUnreadNotifications().length; nc.textContent = u; nc.style.display = u > 0 ? '' : 'none'; }
}

// ---- NAVIGATION ----
function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.page === page));
  destroyCharts();
  updateBadges();
  const content = document.getElementById('pageContent');
  const renderers = {
    'dashboard': renderDashboard,
    'sessions': renderSessions,
    'log-session': renderLogSession,
    'companies': renderCompanies,
    'beneficiaries': renderBeneficiaries,
    'followups': renderFollowups,
    'notifications': renderNotifications,
    'impact-report': renderImpactReport,
    'import': renderImportPage
  };
  const renderer = renderers[page];
  if (renderer) { content.innerHTML = '<div class="page-view">' + renderer() + '</div>'; afterRender(page); }
  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function destroyCharts() {
  Object.values(chartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
  chartInstances = {};
}

// ---- TOAST ----
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// ---- MODAL ----
function openModal(title, bodyHtml, footerHtml) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHtml;
  document.getElementById('modalFooter').innerHTML = footerHtml || '';
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeModal() { document.getElementById('modalOverlay').classList.add('hidden'); }
function closeModalOverlay(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }

// ---- EXPORT ----
function exportReport() { navigateTo('impact-report'); setTimeout(() => window.print(), 300); }

// ---- HELPER ----
function getCompanyId() {
  return currentUser.role === 'admin' ? activeCompanyFilter : currentUser.companyId;
}
