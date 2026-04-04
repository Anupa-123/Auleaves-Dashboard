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
  currentUser = DB.getCurrentUser();
  if (currentUser) { showApp(); } else { showLogin(); }
});

// ---- AUTH ----
function fillLogin(id, pw) {
  document.getElementById('loginId').value = id;
  document.getElementById('loginPassword').value = pw;
}

function handleLogin(e) {
  e.preventDefault();
  const id = document.getElementById('loginId').value.trim();
  const pw = document.getElementById('loginPassword').value.trim();
  const user = DB.login(id, pw);
  if (user) {
    currentUser = user;
    document.getElementById('loginError').classList.remove('show');
    // Send email notification for company logins
    if (user.role === 'company') {
      sendLoginEmail(user.companyName || '', user.name, new Date().toISOString());
    }
    showApp();
  } else {
    document.getElementById('loginError').classList.add('show');
  }
  return false;
}

function handleLogout() {
  DB.logout();
  currentUser = null;
  showLogin();
}

function showLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('appLayout').classList.add('hidden');
  document.getElementById('loginId').value = '';
  document.getElementById('loginPassword').value = '';
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
