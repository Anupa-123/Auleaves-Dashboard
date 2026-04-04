// ============================================
// Auleaves Freedom Circle Program — Demo Seed Data
// Realistic sample data for 4 companies
// ============================================

function seedDemoData() {
  if (localStorage.getItem(DB.KEYS.seeded)) return;

  // ---- Companies ----
  const companies = [
    {
      id: 'comp_techwave',
      name: 'TechWave Solutions',
      csrContactName: 'Priya Sharma',
      contactEmail: 'priya.sharma@techwave.in',
      city: 'Mumbai',
      industry: 'Information Technology',
      targetWomenCount: 150,
      programmeStartDate: '2026-01-05',
      loginId: 'techwave',
      loginPassword: 'techwave123',
      createdAt: '2026-01-04T10:00:00Z'
    },
    {
      id: 'comp_greenleaf',
      name: 'GreenLeaf Industries',
      csrContactName: 'Anita Desai',
      contactEmail: 'anita.d@greenleaf.co.in',
      city: 'Pune',
      industry: 'Manufacturing',
      targetWomenCount: 100,
      programmeStartDate: '2026-01-15',
      loginId: 'greenleaf',
      loginPassword: 'greenleaf123',
      createdAt: '2026-01-14T09:00:00Z'
    },
    {
      id: 'comp_skyline',
      name: 'Skyline Pharmaceuticals',
      csrContactName: 'Dr. Meera Joshi',
      contactEmail: 'meera.joshi@skylinepharma.com',
      city: 'Hyderabad',
      industry: 'Pharmaceuticals',
      targetWomenCount: 80,
      programmeStartDate: '2026-02-01',
      loginId: 'skyline',
      loginPassword: 'skyline123',
      createdAt: '2026-01-30T11:00:00Z'
    },
    {
      id: 'comp_zenith',
      name: 'Zenith Financial Services',
      csrContactName: 'Kavita Reddy',
      contactEmail: 'kavita.r@zenithfs.in',
      city: 'Bengaluru',
      industry: 'Financial Services',
      targetWomenCount: 60,
      programmeStartDate: '2026-02-15',
      loginId: 'zenith',
      loginPassword: 'zenith123',
      createdAt: '2026-02-14T08:30:00Z'
    }
  ];

  // ---- Sessions (24 total) ----
  const sessionTypes = ['awareness workshop', 'hands-on training', 'follow-up session', 'one-on-one counselling', 'group Q&A'];
  const facilitators = ['Sneha Kulkarni', 'Ritu Patel', 'Anjali Verma', 'Deepa Nair'];

  const sessions = [
    // TechWave - 8 sessions
    { id: 'sess_1', companyId: 'comp_techwave', sessionDate: '2026-01-10', facilitator: 'Sneha Kulkarni', department: 'Engineering', city: 'Mumbai', womenAttended: 45, cupsPurchased: 42, sessionType: 'awareness workshop', revenueCollected: 21000, csrSubsidy: 15000, notes: 'Great engagement from engineering team', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-01-10T16:00:00Z' },
    { id: 'sess_2', companyId: 'comp_techwave', sessionDate: '2026-01-18', facilitator: 'Ritu Patel', department: 'HR & Admin', city: 'Mumbai', womenAttended: 30, cupsPurchased: 28, sessionType: 'hands-on training', revenueCollected: 14000, csrSubsidy: 10000, notes: 'Follow-up training requested', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-01-18T17:00:00Z' },
    { id: 'sess_3', companyId: 'comp_techwave', sessionDate: '2026-02-05', facilitator: 'Sneha Kulkarni', department: 'Sales', city: 'Mumbai', womenAttended: 25, cupsPurchased: 22, sessionType: 'awareness workshop', revenueCollected: 11000, csrSubsidy: 8000, notes: 'Sales team very enthusiastic', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-05T16:30:00Z' },
    { id: 'sess_4', companyId: 'comp_techwave', sessionDate: '2026-02-14', facilitator: 'Anjali Verma', department: 'Engineering', city: 'Mumbai', womenAttended: 20, cupsPurchased: 18, sessionType: 'follow-up session', revenueCollected: 9000, csrSubsidy: 6000, notes: 'Month 1 follow-up check', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-14T15:00:00Z' },
    { id: 'sess_5', companyId: 'comp_techwave', sessionDate: '2026-02-25', facilitator: 'Deepa Nair', department: 'Operations', city: 'Mumbai', womenAttended: 18, cupsPurchased: 16, sessionType: 'group Q&A', revenueCollected: 8000, csrSubsidy: 5500, notes: 'Addressed common concerns', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-25T14:30:00Z' },
    { id: 'sess_6', companyId: 'comp_techwave', sessionDate: '2026-03-05', facilitator: 'Sneha Kulkarni', department: 'Cross-functional', city: 'Mumbai', womenAttended: 15, cupsPurchased: 13, sessionType: 'one-on-one counselling', revenueCollected: 6500, csrSubsidy: 4500, notes: 'Individual sessions for new adopters', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-05T16:00:00Z' },
    { id: 'sess_7', companyId: 'comp_techwave', sessionDate: '2026-03-15', facilitator: 'Ritu Patel', department: 'All Departments', city: 'Mumbai', womenAttended: 35, cupsPurchased: 30, sessionType: 'follow-up session', revenueCollected: 15000, csrSubsidy: 10000, notes: 'Quarter-end comprehensive review', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-15T17:00:00Z' },
    { id: 'sess_8', companyId: 'comp_techwave', sessionDate: '2026-03-25', facilitator: 'Anjali Verma', department: 'Engineering', city: 'Mumbai', womenAttended: 12, cupsPurchased: 10, sessionType: 'group Q&A', revenueCollected: 5000, csrSubsidy: 3500, notes: 'New joiners orientation', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-25T15:30:00Z' },

    // GreenLeaf - 7 sessions
    { id: 'sess_9', companyId: 'comp_greenleaf', sessionDate: '2026-01-20', facilitator: 'Anjali Verma', department: 'Production', city: 'Pune', womenAttended: 40, cupsPurchased: 36, sessionType: 'awareness workshop', revenueCollected: 18000, csrSubsidy: 12000, notes: 'Factory floor workers — need vernacular support', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-01-20T16:00:00Z' },
    { id: 'sess_10', companyId: 'comp_greenleaf', sessionDate: '2026-02-01', facilitator: 'Deepa Nair', department: 'Quality', city: 'Pune', womenAttended: 25, cupsPurchased: 23, sessionType: 'hands-on training', revenueCollected: 11500, csrSubsidy: 8000, notes: 'Quality team very receptive', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-01T14:00:00Z' },
    { id: 'sess_11', companyId: 'comp_greenleaf', sessionDate: '2026-02-12', facilitator: 'Sneha Kulkarni', department: 'Admin', city: 'Pune', womenAttended: 18, cupsPurchased: 15, sessionType: 'awareness workshop', revenueCollected: 7500, csrSubsidy: 5000, notes: 'Admin staff session', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-12T15:30:00Z' },
    { id: 'sess_12', companyId: 'comp_greenleaf', sessionDate: '2026-02-28', facilitator: 'Ritu Patel', department: 'Production', city: 'Pune', womenAttended: 30, cupsPurchased: 27, sessionType: 'follow-up session', revenueCollected: 13500, csrSubsidy: 9000, notes: 'Follow-up with production batch 1', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-28T16:00:00Z' },
    { id: 'sess_13', companyId: 'comp_greenleaf', sessionDate: '2026-03-08', facilitator: 'Anjali Verma', department: 'All', city: 'Pune', womenAttended: 22, cupsPurchased: 19, sessionType: 'group Q&A', revenueCollected: 9500, csrSubsidy: 6500, notes: 'Cross-department Q&A', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-08T15:00:00Z' },
    { id: 'sess_14', companyId: 'comp_greenleaf', sessionDate: '2026-03-18', facilitator: 'Deepa Nair', department: 'Production', city: 'Pune', womenAttended: 15, cupsPurchased: 13, sessionType: 'one-on-one counselling', revenueCollected: 6500, csrSubsidy: 4500, notes: 'Individual check-ins', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-18T14:00:00Z' },
    { id: 'sess_15', companyId: 'comp_greenleaf', sessionDate: '2026-03-28', facilitator: 'Sneha Kulkarni', department: 'Quality', city: 'Pune', womenAttended: 10, cupsPurchased: 8, sessionType: 'follow-up session', revenueCollected: 4000, csrSubsidy: 2800, notes: 'Quarter close follow-up', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-28T16:30:00Z' },

    // Skyline - 5 sessions
    { id: 'sess_16', companyId: 'comp_skyline', sessionDate: '2026-02-05', facilitator: 'Ritu Patel', department: 'Research', city: 'Hyderabad', womenAttended: 35, cupsPurchased: 33, sessionType: 'awareness workshop', revenueCollected: 16500, csrSubsidy: 11000, notes: 'Research team — very scientific approach appreciated', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-05T16:00:00Z' },
    { id: 'sess_17', companyId: 'comp_skyline', sessionDate: '2026-02-18', facilitator: 'Sneha Kulkarni', department: 'Manufacturing', city: 'Hyderabad', womenAttended: 28, cupsPurchased: 25, sessionType: 'hands-on training', revenueCollected: 12500, csrSubsidy: 8500, notes: 'Practical training for manufacturing staff', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-18T15:00:00Z' },
    { id: 'sess_18', companyId: 'comp_skyline', sessionDate: '2026-03-01', facilitator: 'Deepa Nair', department: 'Quality & Research', city: 'Hyderabad', womenAttended: 20, cupsPurchased: 18, sessionType: 'follow-up session', revenueCollected: 9000, csrSubsidy: 6000, notes: 'Month 1 follow-up', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-01T14:30:00Z' },
    { id: 'sess_19', companyId: 'comp_skyline', sessionDate: '2026-03-12', facilitator: 'Anjali Verma', department: 'All', city: 'Hyderabad', womenAttended: 15, cupsPurchased: 12, sessionType: 'group Q&A', revenueCollected: 6000, csrSubsidy: 4000, notes: 'Open Q&A for all departments', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-12T16:00:00Z' },
    { id: 'sess_20', companyId: 'comp_skyline', sessionDate: '2026-03-22', facilitator: 'Ritu Patel', department: 'Research', city: 'Hyderabad', womenAttended: 10, cupsPurchased: 9, sessionType: 'one-on-one counselling', revenueCollected: 4500, csrSubsidy: 3000, notes: 'New adopter support', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-22T15:30:00Z' },

    // Zenith - 4 sessions
    { id: 'sess_21', companyId: 'comp_zenith', sessionDate: '2026-02-20', facilitator: 'Anjali Verma', department: 'Operations', city: 'Bengaluru', womenAttended: 22, cupsPurchased: 20, sessionType: 'awareness workshop', revenueCollected: 10000, csrSubsidy: 7000, notes: 'First session — great turnout', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-02-20T16:00:00Z' },
    { id: 'sess_22', companyId: 'comp_zenith', sessionDate: '2026-03-03', facilitator: 'Deepa Nair', department: 'Finance', city: 'Bengaluru', womenAttended: 18, cupsPurchased: 16, sessionType: 'hands-on training', revenueCollected: 8000, csrSubsidy: 5500, notes: 'Finance team training', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-03T15:00:00Z' },
    { id: 'sess_23', companyId: 'comp_zenith', sessionDate: '2026-03-14', facilitator: 'Sneha Kulkarni', department: 'All', city: 'Bengaluru', womenAttended: 15, cupsPurchased: 13, sessionType: 'follow-up session', revenueCollected: 6500, csrSubsidy: 4500, notes: 'Follow-up session', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-14T14:00:00Z' },
    { id: 'sess_24', companyId: 'comp_zenith', sessionDate: '2026-03-26', facilitator: 'Ritu Patel', department: 'Operations', city: 'Bengaluru', womenAttended: 10, cupsPurchased: 8, sessionType: 'group Q&A', revenueCollected: 4000, csrSubsidy: 2800, notes: 'Quarter review Q&A', loggedBy: 'admin', loggedByName: 'Admin', loggedAt: '2026-03-26T16:30:00Z' },
  ];

  // ---- Beneficiaries (generate realistic data) ----
  const firstNames = ['Aarti','Bharti','Chitra','Deepika','Ekta','Fatima','Gayatri','Hema','Isha','Jaya','Kamla','Lakshmi','Meena','Neeta','Padma','Radha','Sita','Sunita','Uma','Vandana','Yamini','Zara','Anjali','Bhavna','Divya','Geeta','Kavita','Lata','Nandini','Poonam','Rashmi','Sarita','Tara','Usha','Varsha','Anu','Babita','Chandni','Devi','Falguni','Hemlata','Indira','Juhi','Kiran','Madhuri','Nisha','Pallavi','Rekha','Shanti','Tulsi','Vineeta','Archana','Bindu','Damini','Ganga','Harsha','Jyoti','Komal','Malini','Neha','Pooja','Renu','Savita','Tanvi','Urmila','Vidya','Asha','Chhaya','Durga','Gouri','Hansa','Indu','Janki','Kusum','Mina','Namita','Prerna','Rani','Seema','Trupti','Urvashi'];
  const lastNames = ['Sharma','Patel','Gupta','Singh','Kumar','Devi','Nair','Joshi','Reddy','Rao','Kaur','Mehta','Das','Mishra','Verma','Iyer','Menon','Shah','Pillai','Bhat','Deshmukh','Chauhan','Pandey','Kulkarni','Trivedi'];
  const ageGroups = ['18-24','25-34','35-44','45+'];
  const cupSizes = ['small','medium','large'];
  const languages = ['Hindi','English','Marathi','Telugu','Kannada','Tamil','Bengali','Gujarati'];

  const beneficiaries = [];
  let benCounter = 0;

  function createBeneficiaries(companyId, sessionId, count, city) {
    const langMap = { 'Mumbai': ['Hindi','Marathi','English'], 'Pune': ['Marathi','Hindi','English'], 'Hyderabad': ['Telugu','Hindi','English'], 'Bengaluru': ['Kannada','Hindi','English'] };
    const cityLangs = langMap[city] || ['Hindi','English'];
    for (let i = 0; i < count; i++) {
      benCounter++;
      const fn = firstNames[benCounter % firstNames.length];
      const ln = lastNames[benCounter % lastNames.length];
      beneficiaries.push({
        id: 'ben_' + benCounter,
        fcpId: 'FCP-' + String(benCounter).padStart(3, '0'),
        companyId: companyId,
        sessionId: sessionId,
        fullName: fn + ' ' + ln,
        phone: '98' + String(7000000000 + Math.floor(Math.random() * 999999999)).slice(0, 8),
        ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
        cupSize: cupSizes[Math.floor(Math.random() * cupSizes.length)],
        firstTimeUser: Math.random() > 0.3 ? 'yes' : 'no',
        language: cityLangs[Math.floor(Math.random() * cityLangs.length)],
        consentRecordedBy: 'Sneha Kulkarni',
        consentDate: '2026-01-10',
        registeredBy: 'admin',
        registeredAt: new Date('2026-01-10T10:' + String(i % 60).padStart(2, '0') + ':00Z').toISOString()
      });
    }
  }

  // TechWave: 120 beneficiaries
  createBeneficiaries('comp_techwave', 'sess_1', 35, 'Mumbai');
  createBeneficiaries('comp_techwave', 'sess_2', 25, 'Mumbai');
  createBeneficiaries('comp_techwave', 'sess_3', 20, 'Mumbai');
  createBeneficiaries('comp_techwave', 'sess_4', 15, 'Mumbai');
  createBeneficiaries('comp_techwave', 'sess_5', 12, 'Mumbai');
  createBeneficiaries('comp_techwave', 'sess_6', 13, 'Mumbai');

  // GreenLeaf: 95 beneficiaries
  createBeneficiaries('comp_greenleaf', 'sess_9', 30, 'Pune');
  createBeneficiaries('comp_greenleaf', 'sess_10', 20, 'Pune');
  createBeneficiaries('comp_greenleaf', 'sess_11', 15, 'Pune');
  createBeneficiaries('comp_greenleaf', 'sess_12', 18, 'Pune');
  createBeneficiaries('comp_greenleaf', 'sess_13', 12, 'Pune');

  // Skyline: 65 beneficiaries
  createBeneficiaries('comp_skyline', 'sess_16', 25, 'Hyderabad');
  createBeneficiaries('comp_skyline', 'sess_17', 20, 'Hyderabad');
  createBeneficiaries('comp_skyline', 'sess_18', 12, 'Hyderabad');
  createBeneficiaries('comp_skyline', 'sess_19', 8, 'Hyderabad');

  // Zenith: 32 beneficiaries
  createBeneficiaries('comp_zenith', 'sess_21', 16, 'Bengaluru');
  createBeneficiaries('comp_zenith', 'sess_22', 10, 'Bengaluru');
  createBeneficiaries('comp_zenith', 'sess_23', 6, 'Bengaluru');

  // ---- Follow-ups ----
  const usageStatuses = ['using comfortably', 'using with some issues', 'stopped — discomfort', 'stopped — other reason', 'not yet tried'];
  const followups = [];

  beneficiaries.forEach((ben, idx) => {
    // Month 1 for ~85% of beneficiaries
    if (Math.random() < 0.85) {
      const statusRoll = Math.random();
      let status;
      if (statusRoll < 0.65) status = 'using comfortably';
      else if (statusRoll < 0.85) status = 'using with some issues';
      else if (statusRoll < 0.92) status = 'stopped — discomfort';
      else if (statusRoll < 0.96) status = 'stopped — other reason';
      else status = 'not yet tried';

      followups.push({
        id: 'fu_m1_' + idx,
        beneficiaryId: ben.id,
        companyId: ben.companyId,
        month: 1,
        date: '2026-02-10',
        usageStatus: status,
        recommendedToOthers: Math.random() < 0.4 ? 'yes' : (Math.random() < 0.5 ? 'no' : 'not sure'),
        notes: '',
        loggedByName: ben.companyId === 'comp_techwave' ? 'Priya Sharma' : (ben.companyId === 'comp_greenleaf' ? 'Anita Desai' : (ben.companyId === 'comp_skyline' ? 'Dr. Meera Joshi' : 'Kavita Reddy')),
        loggedByRole: Math.random() < 0.5 ? 'company' : 'admin',
        loggedAt: '2026-02-10T10:00:00Z',
        verified: Math.random() < 0.8,
        verifiedBy: Math.random() < 0.8 ? 'Sneha Kulkarni' : null,
        verifiedAt: Math.random() < 0.8 ? '2026-02-12T10:00:00Z' : null
      });
    }
    // Month 2 for ~70% of beneficiaries
    if (Math.random() < 0.70) {
      const statusRoll = Math.random();
      let status;
      if (statusRoll < 0.60) status = 'using comfortably';
      else if (statusRoll < 0.82) status = 'using with some issues';
      else if (statusRoll < 0.90) status = 'stopped — discomfort';
      else if (statusRoll < 0.95) status = 'stopped — other reason';
      else status = 'not yet tried';

      followups.push({
        id: 'fu_m2_' + idx,
        beneficiaryId: ben.id,
        companyId: ben.companyId,
        month: 2,
        date: '2026-03-10',
        usageStatus: status,
        recommendedToOthers: Math.random() < 0.55 ? 'yes' : (Math.random() < 0.5 ? 'no' : 'not sure'),
        notes: '',
        loggedByName: ben.companyId === 'comp_techwave' ? 'Priya Sharma' : (ben.companyId === 'comp_greenleaf' ? 'Anita Desai' : (ben.companyId === 'comp_skyline' ? 'Dr. Meera Joshi' : 'Kavita Reddy')),
        loggedByRole: Math.random() < 0.5 ? 'company' : 'admin',
        loggedAt: '2026-03-10T10:00:00Z',
        verified: Math.random() < 0.7,
        verifiedBy: Math.random() < 0.7 ? 'Ritu Patel' : null,
        verifiedAt: Math.random() < 0.7 ? '2026-03-12T10:00:00Z' : null
      });
    }
    // Month 3 for ~55% of beneficiaries
    if (Math.random() < 0.55) {
      const statusRoll = Math.random();
      let status;
      if (statusRoll < 0.58) status = 'using comfortably';
      else if (statusRoll < 0.78) status = 'using with some issues';
      else if (statusRoll < 0.88) status = 'stopped — discomfort';
      else if (statusRoll < 0.94) status = 'stopped — other reason';
      else status = 'not yet tried';

      followups.push({
        id: 'fu_m3_' + idx,
        beneficiaryId: ben.id,
        companyId: ben.companyId,
        month: 3,
        date: '2026-04-01',
        usageStatus: status,
        recommendedToOthers: Math.random() < 0.65 ? 'yes' : (Math.random() < 0.5 ? 'no' : 'not sure'),
        notes: '',
        loggedByName: ben.companyId === 'comp_techwave' ? 'Priya Sharma' : (ben.companyId === 'comp_greenleaf' ? 'Anita Desai' : (ben.companyId === 'comp_skyline' ? 'Dr. Meera Joshi' : 'Kavita Reddy')),
        loggedByRole: Math.random() < 0.5 ? 'company' : 'admin',
        loggedAt: '2026-04-01T10:00:00Z',
        verified: Math.random() < 0.6,
        verifiedBy: Math.random() < 0.6 ? 'Anjali Verma' : null,
        verifiedAt: Math.random() < 0.6 ? '2026-04-02T10:00:00Z' : null
      });
    }
  });

  // ---- Notifications ----
  const notifications = [
    { id: 'notif_1', type: 'followup_submitted', companyId: 'comp_techwave', companyName: 'TechWave Solutions', message: 'Month 2 check-ins submitted for 28 beneficiaries', actor: 'Priya Sharma', actorRole: 'Company', timestamp: '2026-03-10T11:00:00Z', read: false },
    { id: 'notif_2', type: 'followup_submitted', companyId: 'comp_greenleaf', companyName: 'GreenLeaf Industries', message: 'Month 1 check-ins submitted for 22 beneficiaries', actor: 'Anita Desai', actorRole: 'Company', timestamp: '2026-02-12T09:30:00Z', read: true },
    { id: 'notif_3', type: 'session_logged', companyId: 'comp_skyline', companyName: 'Skyline Pharmaceuticals', message: 'New session logged: 35 women attended, 33 cups distributed', actor: 'Admin', actorRole: 'Admin', timestamp: '2026-02-05T16:00:00Z', read: true },
    { id: 'notif_4', type: 'followup_submitted', companyId: 'comp_zenith', companyName: 'Zenith Financial Services', message: 'Month 1 check-ins submitted for 12 beneficiaries', actor: 'Kavita Reddy', actorRole: 'Company', timestamp: '2026-03-22T14:00:00Z', read: false },
    { id: 'notif_5', type: 'login', companyId: 'comp_techwave', companyName: 'TechWave Solutions', message: 'TechWave Solutions (Priya Sharma) logged in', actor: 'Priya Sharma', actorRole: 'Company', timestamp: '2026-04-03T09:15:00Z', read: false },
    { id: 'notif_6', type: 'followup_submitted', companyId: 'comp_skyline', companyName: 'Skyline Pharmaceuticals', message: 'Month 3 check-ins submitted for 15 beneficiaries', actor: 'Dr. Meera Joshi', actorRole: 'Company', timestamp: '2026-04-01T10:30:00Z', read: false },
  ];

  // ---- Activity Log ----
  const activityLog = [
    { id: 'act_1', timestamp: '2026-04-03T09:15:00Z', role: 'company', actorName: 'Priya Sharma', description: 'TechWave Solutions logged in' },
    { id: 'act_2', timestamp: '2026-04-01T10:30:00Z', role: 'company', actorName: 'Dr. Meera Joshi', description: 'Submitted Month 3 check-ins for Skyline Pharmaceuticals' },
    { id: 'act_3', timestamp: '2026-03-28T16:30:00Z', role: 'admin', actorName: 'Admin', description: 'Logged session for GreenLeaf Industries' },
    { id: 'act_4', timestamp: '2026-03-26T16:30:00Z', role: 'admin', actorName: 'Admin', description: 'Logged session for Zenith Financial Services' },
    { id: 'act_5', timestamp: '2026-03-22T14:00:00Z', role: 'company', actorName: 'Kavita Reddy', description: 'Submitted Month 1 check-ins for Zenith Financial Services' },
    { id: 'act_6', timestamp: '2026-03-15T17:00:00Z', role: 'admin', actorName: 'Admin', description: 'Logged follow-up session for TechWave Solutions' },
  ];

  // ---- Save Everything ----
  DB._set(DB.KEYS.companies, companies);
  DB._set(DB.KEYS.sessions, sessions);
  DB._set(DB.KEYS.beneficiaries, beneficiaries);
  DB._set(DB.KEYS.followups, followups);
  DB._set(DB.KEYS.notifications, notifications);
  DB._set(DB.KEYS.activityLog, activityLog);
  localStorage.setItem(DB.KEYS.seeded, 'true');

  console.log('✅ Demo data seeded successfully!');
  console.log(`Companies: ${companies.length}`);
  console.log(`Sessions: ${sessions.length}`);
  console.log(`Beneficiaries: ${beneficiaries.length}`);
  console.log(`Follow-ups: ${followups.length}`);
}
