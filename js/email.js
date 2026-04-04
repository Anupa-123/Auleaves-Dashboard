// ============================================
// EmailJS Integration — Login & Data Submission Notifications
// Admin email: care@auleaves.com
// Setup: https://www.emailjs.com (free account needed)
// ============================================

const EMAIL_CONFIG = {
  // ---- Replace these with YOUR EmailJS credentials ----
  // Step 1: Create free account at emailjs.com
  // Step 2: Add Email Service (connect your Gmail)
  // Step 3: Create 2 templates (see instructions below)
  // Step 4: Paste your IDs here
  
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',    // Account -> API Keys
  SERVICE_ID: 'YOUR_SERVICE_ID',             // Email Services tab
  LOGIN_TEMPLATE_ID: 'YOUR_LOGIN_TEMPLATE',  // Template for login alerts
  DATA_TEMPLATE_ID: 'YOUR_DATA_TEMPLATE',    // Template for data submissions
  
  ADMIN_EMAIL: 'care@auleaves.com',
  CONFIGURED: false  // Set to true after adding real credentials above
};

// ---- Initialize EmailJS ----
function initEmailJS() {
  if (!EMAIL_CONFIG.CONFIGURED) return;
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
  }
}

// ---- Send Login Notification ----
function sendLoginEmail(companyName, contactName, loginTime) {
  if (!EMAIL_CONFIG.CONFIGURED) {
    console.log('[EmailJS] Not configured. Would send login notification for:', companyName);
    return;
  }
  if (typeof emailjs === 'undefined') return;

  const templateParams = {
    to_email: EMAIL_CONFIG.ADMIN_EMAIL,
    company_name: companyName,
    contact_name: contactName,
    login_time: new Date(loginTime).toLocaleString('en-IN', {
      dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata'
    }),
    dashboard_url: window.location.href
  };

  emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.LOGIN_TEMPLATE_ID, templateParams)
    .then(() => console.log('[EmailJS] Login notification sent'))
    .catch(err => console.warn('[EmailJS] Failed:', err));
}

// ---- Send Data Submission Notification ----
function sendDataEmail(companyName, contactName, submissionType, details) {
  if (!EMAIL_CONFIG.CONFIGURED) {
    console.log('[EmailJS] Not configured. Would send data notification:', submissionType);
    return;
  }
  if (typeof emailjs === 'undefined') return;

  const templateParams = {
    to_email: EMAIL_CONFIG.ADMIN_EMAIL,
    company_name: companyName,
    contact_name: contactName,
    submission_type: submissionType,
    details: details,
    submission_time: new Date().toLocaleString('en-IN', {
      dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Kolkata'
    }),
    dashboard_url: window.location.href
  };

  emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.DATA_TEMPLATE_ID, templateParams)
    .then(() => console.log('[EmailJS] Data notification sent'))
    .catch(err => console.warn('[EmailJS] Failed:', err));
}
