// ============================================================
// Auleaves FCP — Seed Data v2
// Matches new database.js v2 schema
// ============================================================

function seedDemoData() {
  if (localStorage.getItem(DB.KEYS.seeded)) return;

  // ---- Companies ----
  const companies = [
    {
      name: 'TechWave Solutions',        csrContactName: 'Priya Menon',
      designation: 'VP - People & Culture', contactEmail: 'priya@techwave.in',
      contactPhone: '9876543210',        city: 'Bengaluru', state: 'Karnataka',
      industry: 'Information Technology', targetWomenCount: 150,
      programmeStartDate: '2025-10-01',  csrBudget: 250000,
      programmeStatus: 'active',         loginId: 'techwave', loginPassword: 'techwave123'
    },
    {
      name: 'GreenLeaf Industries',      csrContactName: 'Sneha Patil',
      designation: 'Head - CSR',         contactEmail: 'sneha@greenleaf.in',
      contactPhone: '9123456780',        city: 'Pune', state: 'Maharashtra',
      industry: 'Manufacturing',          targetWomenCount: 200,
      programmeStartDate: '2025-09-15',  csrBudget: 350000,
      programmeStatus: 'active',         loginId: 'greenleaf', loginPassword: 'greenleaf123'
    },
    {
      name: 'Skyline Pharma',            csrContactName: 'Kavitha Rao',
      designation: 'CSR Manager',        contactEmail: 'kavitha@skylinepharma.in',
      contactPhone: '9988776655',        city: 'Hyderabad', state: 'Telangana',
      industry: 'Pharmaceuticals',        targetWomenCount: 100,
      programmeStartDate: '2025-11-01',  csrBudget: 180000,
      programmeStatus: 'active',         loginId: 'skyline', loginPassword: 'skyline123'
    },
    {
      name: 'Zenith Financial',          csrContactName: 'Ananya Sharma',
      designation: 'Director - HR & CSR', contactEmail: 'ananya@zenithfin.in',
      contactPhone: '9012345678',        city: 'Mumbai', state: 'Maharashtra',
      industry: 'Financial Services',     targetWomenCount: 80,
      programmeStartDate: '2025-12-01',  csrBudget: 120000,
      programmeStatus: 'active',         loginId: 'zenith', loginPassword: 'zenith123'
    }
  ];

  const createdCompanies = companies.map(c => DB.addCompany({ ...c, createdBy: 'admin' }));
  const [tw, gl, sp, zf] = createdCompanies;

  // ---- Sessions ----
  // TechWave — 3 sessions, mature programme (started Oct 2025)
  const twS1 = DB.addSession({
    companyId: tw.id, sessionDate: '2025-10-15', facilitator: 'Riya Desai',
    department: 'Engineering', city: 'Bengaluru',
    sessionType: 'awareness workshop', language: 'English',
    womenInvited: 60, womenAttended: 52, cupsPurchased: 44,
    cupSizeSmall: 10, cupSizeMedium: 28, cupSizeLarge: 6,
    firstTimeUsersCount: 38, revenueCollected: 66000, csrSubsidy: 44000,
    notes: 'Excellent engagement. Many questions about insertion technique.',
    loggedBy: 'admin', loggedByName: 'Riya Desai'
  });
  const twS2 = DB.addSession({
    companyId: tw.id, sessionDate: '2025-11-20', facilitator: 'Riya Desai',
    department: 'Operations', city: 'Bengaluru',
    sessionType: 'hands-on training', language: 'Kannada',
    womenInvited: 45, womenAttended: 40, cupsPurchased: 35,
    cupSizeSmall: 8, cupSizeMedium: 22, cupSizeLarge: 5,
    firstTimeUsersCount: 30, revenueCollected: 52500, csrSubsidy: 35000,
    notes: 'Hands-on practice session. Used model demonstrations.',
    loggedBy: 'admin', loggedByName: 'Riya Desai'
  });
  const twS3 = DB.addSession({
    companyId: tw.id, sessionDate: '2026-01-10', facilitator: 'Meera Nair',
    department: 'Marketing', city: 'Bengaluru',
    sessionType: 'group Q&A', language: 'English',
    womenInvited: 30, womenAttended: 25, cupsPurchased: 20,
    cupSizeSmall: 4, cupSizeMedium: 13, cupSizeLarge: 3,
    firstTimeUsersCount: 18, revenueCollected: 30000, csrSubsidy: 20000,
    notes: 'Q&A format worked well. Cultural concerns raised by 3 participants.',
    loggedBy: 'admin', loggedByName: 'Meera Nair'
  });

  // GreenLeaf — 2 sessions
  const glS1 = DB.addSession({
    companyId: gl.id, sessionDate: '2025-09-20', facilitator: 'Pooja Jadhav',
    department: 'Factory Floor - Unit A', city: 'Pune',
    sessionType: 'awareness workshop', language: 'Marathi',
    womenInvited: 80, womenAttended: 72, cupsPurchased: 60,
    cupSizeSmall: 15, cupSizeMedium: 36, cupSizeLarge: 9,
    firstTimeUsersCount: 65, revenueCollected: 90000, csrSubsidy: 60000,
    notes: 'Large group, translated slides to Marathi. Very engaged audience.',
    loggedBy: 'admin', loggedByName: 'Pooja Jadhav'
  });
  const glS2 = DB.addSession({
    companyId: gl.id, sessionDate: '2025-12-05', facilitator: 'Pooja Jadhav',
    department: 'Factory Floor - Unit B', city: 'Pune',
    sessionType: 'hands-on training', language: 'Marathi',
    womenInvited: 55, womenAttended: 48, cupsPurchased: 38,
    cupSizeSmall: 10, cupSizeMedium: 22, cupSizeLarge: 6,
    firstTimeUsersCount: 42, revenueCollected: 57000, csrSubsidy: 38000,
    notes: 'Second batch. Several women from Unit A brought friends.',
    loggedBy: 'admin', loggedByName: 'Pooja Jadhav'
  });

  // Skyline Pharma — 2 sessions
  const spS1 = DB.addSession({
    companyId: sp.id, sessionDate: '2025-11-10', facilitator: 'Lalitha Krishnan',
    department: 'Quality Control', city: 'Hyderabad',
    sessionType: 'awareness workshop', language: 'Telugu',
    womenInvited: 40, womenAttended: 35, cupsPurchased: 28,
    cupSizeSmall: 7, cupSizeMedium: 17, cupSizeLarge: 4,
    firstTimeUsersCount: 25, revenueCollected: 42000, csrSubsidy: 28000,
    notes: 'Good turnout. Hygiene and safety concerns addressed.',
    loggedBy: 'admin', loggedByName: 'Lalitha Krishnan'
  });
  const spS2 = DB.addSession({
    companyId: sp.id, sessionDate: '2026-01-25', facilitator: 'Lalitha Krishnan',
    department: 'R&D', city: 'Hyderabad',
    sessionType: 'one-on-one counselling', language: 'English',
    womenInvited: 20, womenAttended: 18, cupsPurchased: 15,
    cupSizeSmall: 3, cupSizeMedium: 10, cupSizeLarge: 2,
    firstTimeUsersCount: 14, revenueCollected: 22500, csrSubsidy: 15000,
    notes: 'One-on-one format requested by R&D head. More personal discussions.',
    loggedBy: 'admin', loggedByName: 'Lalitha Krishnan'
  });

  // Zenith Financial — 1 session (newer!)
  const zfS1 = DB.addSession({
    companyId: zf.id, sessionDate: '2026-02-14', facilitator: 'Shweta Garg',
    department: 'Operations', city: 'Mumbai',
    sessionType: 'awareness workshop', language: 'Hindi',
    womenInvited: 35, womenAttended: 30, cupsPurchased: 22,
    cupSizeSmall: 5, cupSizeMedium: 14, cupSizeLarge: 3,
    firstTimeUsersCount: 20, revenueCollected: 33000, csrSubsidy: 22000,
    notes: 'First session for Zenith. Enthusiastic HR team. Some hesitation among older employees.',
    loggedBy: 'admin', loggedByName: 'Shweta Garg'
  });

  // ---- Beneficiaries ----
  // TechWave Session 1 — 8 beneficiaries (mature, full cycle data)
  const twBens1 = [
    { fullName: 'Aishwarya Reddy',  phone: '9845012301', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Bhavna Kulkarni',  phone: '9812345011', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Kannada', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Chitra Nayak',     phone: '9741230012', ageGroup: '35-44', cupSize: 'large',  firstTimeUser: false, language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Divya Hegde',      phone: '9632100123', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Kannada', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Esha Menon',       phone: '9551234501', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Fatima Sheikh',    phone: '9490012350', ageGroup: '35-44', cupSize: 'large',  firstTimeUser: false, language: 'English', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' },
    { fullName: 'Geetha Prabhu',    phone: '9388765401', ageGroup: '45+',   cupSize: 'large',  firstTimeUser: false, language: 'Kannada', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' },
    { fullName: 'Harini Shetty',    phone: '9276543210', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: tw.id, sessionId: twS1.id, consentRecordedBy: 'Riya Desai', consentDate: '2025-10-15' }));

  // TechWave Session 2 — 5 beneficiaries
  const twBens2 = [
    { fullName: 'Indira Nair',      phone: '9123456701', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Jyoti Bhat',       phone: '9012345670', ageGroup: '35-44', cupSize: 'medium', firstTimeUser: false, language: 'Kannada', phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Kavya Rao',        phone: '8901234567', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Lakshmi Murthy',   phone: '8890123456', ageGroup: '45+',   cupSize: 'large',  firstTimeUser: false, language: 'Kannada', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' },
    { fullName: 'Meena Subramaniam',phone: '8779012345', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: tw.id, sessionId: twS2.id, consentRecordedBy: 'Riya Desai', consentDate: '2025-11-20' }));

  // TechWave Session 3 — 3 beneficiaries (newest, open status)
  const twBens3 = [
    { fullName: 'Neha Joshi',       phone: '8668901234', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Ojaswi Mishra',    phone: '8557890123', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Padmini Iyer',     phone: '8446789012', ageGroup: '35-44', cupSize: 'large',  firstTimeUser: false, language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: tw.id, sessionId: twS3.id, consentRecordedBy: 'Meera Nair', consentDate: '2026-01-10' }));

  // GreenLeaf Session 1 — 6 beneficiaries (mature, all 3 cycles)
  const glBens1 = [
    { fullName: 'Rekha Jadhav',     phone: '9334567890', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Marathi', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Sunita More',      phone: '9223456789', ageGroup: '35-44', cupSize: 'large',  firstTimeUser: false, language: 'Marathi', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' },
    { fullName: 'Tara Pawar',       phone: '9112345678', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Marathi', phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Uma Shinde',       phone: '9001234567', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Varsha Nimkar',    phone: '8890234567', ageGroup: '45+',   cupSize: 'large',  firstTimeUser: false, language: 'Marathi', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' },
    { fullName: 'Wasima Khan',      phone: '8779123456', ageGroup: '35-44', cupSize: 'medium', firstTimeUser: true,  language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: gl.id, sessionId: glS1.id, consentRecordedBy: 'Pooja Jadhav', consentDate: '2025-09-20' }));

  // GreenLeaf Session 2 — 4 beneficiaries
  const glBens2 = [
    { fullName: 'Yogita Deshmukh',  phone: '8668012345', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Marathi', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Zeba Ansari',      phone: '8557012345', ageGroup: '35-44', cupSize: 'medium', firstTimeUser: false, language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Archana Gaikwad',  phone: '8446012345', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Marathi', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Babita Thorat',    phone: '8335012345', ageGroup: '45+',   cupSize: 'large',  firstTimeUser: false, language: 'Marathi', phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: gl.id, sessionId: glS2.id, consentRecordedBy: 'Pooja Jadhav', consentDate: '2025-12-05' }));

  // Skyline Pharma — 4 beneficiaries
  const spBens1 = [
    { fullName: 'Chaitra Reddy',    phone: '8224012345', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Telugu',  phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Deepthi Rao',      phone: '8113012345', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Telugu',  phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Eshitha Srinivas', phone: '8002012345', ageGroup: '35-44', cupSize: 'large',  firstTimeUser: false, language: 'English', phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Farida Begum',     phone: '7991012345', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Telugu',  phoneAccessType: 'basic phone', whatsappMethod: 'HR logs' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: sp.id, sessionId: spS1.id, consentRecordedBy: 'Lalitha Krishnan', consentDate: '2025-11-10' }));

  // Zenith — 3 beneficiaries (newest, only Cycle 1 partial)
  const zfBens1 = [
    { fullName: 'Garima Singh',     phone: '7880012345', ageGroup: '25-34', cupSize: 'medium', firstTimeUser: true,  language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' },
    { fullName: 'Henna Kapoor',     phone: '7779012345', ageGroup: '35-44', cupSize: 'medium', firstTimeUser: false, language: 'Hindi',   phoneAccessType: 'smartphone', whatsappMethod: 'WhatsApp reply' },
    { fullName: 'Isita Das',        phone: '7668012345', ageGroup: '18-24', cupSize: 'small',  firstTimeUser: true,  language: 'Bengali', phoneAccessType: 'smartphone', whatsappMethod: 'self-fills form' }
  ].map(b => DB.addBeneficiary({ ...b, companyId: zf.id, sessionId: zfS1.id, consentRecordedBy: 'Shweta Garg', consentDate: '2026-02-14' }));

  // ---- Cycle Records ----

  // Helper to add cycle record silently
  const addCycle = (ben, session, cycleNum, status, extraData = {}) => {
    // Directly push to avoid notification spam during seed
    const records = DB.getCycleRecords();
    let adopted = extraData.adopted !== undefined ? extraData.adopted : null;
    if (status === 'done' && adopted === null)        adopted = true;
    if (status === 'not-adopted' && adopted === null) adopted = false;
    const rec = {
      id:                    DB.generateId(),
      journeyId:             DB._nextSeq(records, 'JT', 3),
      beneficiaryId:         ben.id,
      companyId:             ben.companyId,
      sessionId:             session.id,
      cycleNumber:           cycleNum,
      status,
      adopted,
      nonAdoptionReason:     extraData.nonAdoptionReason || null,
      checkInDate:           extraData.checkInDate || '',
      usageStatus:           extraData.usageStatus || (status === 'done' ? 'using comfortably' : status === 'not-adopted' ? 'stopped' : 'pending'),
      recommendedToOthers:   extraData.recommendedToOthers || (status === 'done' ? 'yes' : 'no'),
      peersCount:            extraData.peersCount || 0,
      comfortInsertion:      extraData.comfortInsertion || (status === 'done' ? 'yes' : ''),
      comfortRemoval:        extraData.comfortRemoval || (status === 'done' ? 'yes' : ''),
      leakage:               extraData.leakage || (status === 'done' ? 'never' : ''),
      physicalDiscomfort:    extraData.physicalDiscomfort || 'none',
      discomfortDescription: extraData.discomfortDescription || '',
      periodPainChange:      extraData.periodPainChange || 'better',
      trackingPeriod:        extraData.trackingPeriod || 'yes-started',
      confidence:            extraData.confidence || 'yes',
      infections:            false,
      likesMost:             extraData.likesMost || '',
      challenge:             extraData.challenge || '',
      messageToAuleaves:     '',
      whatsappSent:          true,
      whatsappSentDate:      extraData.checkInDate || '',
      responseReceived:      status !== 'pending',
      responseDate:          status !== 'pending' ? extraData.checkInDate : null,
      responseMethod:        ben.whatsappMethod,
      dataCollectionMethod:  ben.whatsappMethod,
      loggedBy:              'admin',
      loggedByName:          'Admin',
      loggedAt:              new Date().toISOString(),
      verifiedByAuleaves:    extraData.verified || false,
      verifiedByName:        extraData.verified ? 'Admin' : null,
      verifiedAt:            extraData.verified ? new Date().toISOString() : null,
      facilitatorNotes:      ''
    };
    records.push(rec);
    DB._set(DB.KEYS.cycleRecords, records);
    return rec;
  };

  // TechWave S1 — full 3-cycle data (started Oct 2025, all 3 cycles done)
  // Aishwarya — Adopted
  addCycle(twBens1[0], twS1, 1, 'done', { checkInDate: '2025-11-15', recommendedToOthers: 'yes', peersCount: 2, verified: true });
  addCycle(twBens1[0], twS1, 2, 'done', { checkInDate: '2025-12-15', leakage: 'rarely', verified: true });
  addCycle(twBens1[0], twS1, 3, 'done', { checkInDate: '2026-01-15', periodPainChange: 'better', verified: true });

  // Bhavna — Adopted
  addCycle(twBens1[1], twS1, 1, 'done', { checkInDate: '2025-11-16', recommendedToOthers: 'yes', peersCount: 1, verified: true });
  addCycle(twBens1[1], twS1, 2, 'done', { checkInDate: '2025-12-16', verified: true });
  addCycle(twBens1[1], twS1, 3, 'done', { checkInDate: '2026-01-16', verified: false });

  // Chitra — Adopted
  addCycle(twBens1[2], twS1, 1, 'done', { checkInDate: '2025-11-17', usageStatus: 'using with some issues', comfortInsertion: 'getting better', verified: true });
  addCycle(twBens1[2], twS1, 2, 'done', { checkInDate: '2025-12-17', leakage: 'rarely', verified: false });
  addCycle(twBens1[2], twS1, 3, 'done', { checkInDate: '2026-01-17', verified: false });

  // Divya — Adopted
  addCycle(twBens1[3], twS1, 1, 'done', { checkInDate: '2025-11-15', recommendedToOthers: 'yes', peersCount: 3, verified: true });
  addCycle(twBens1[3], twS1, 2, 'done', { checkInDate: '2025-12-15', verified: true });
  addCycle(twBens1[3], twS1, 3, 'done', { checkInDate: '2026-01-15', verified: true });

  // Esha — Not adopted
  addCycle(twBens1[4], twS1, 1, 'not-adopted', { checkInDate: '2025-11-18', nonAdoptionReason: 'Fear of insertion', usageStatus: 'stopped', adopted: false, verified: true });

  // Fatima — Not adopted (cultural)
  addCycle(twBens1[5], twS1, 1, 'not-adopted', { checkInDate: '2025-11-20', nonAdoptionReason: 'Cultural or family resistance', usageStatus: 'stopped', adopted: false, verified: true });

  // Geetha — Pending (basic phone, slow response)
  addCycle(twBens1[6], twS1, 1, 'done', { checkInDate: '2025-12-01', verified: false });
  addCycle(twBens1[6], twS1, 2, 'pending', { checkInDate: '', usageStatus: 'pending' });

  // Harini — Adopted full
  addCycle(twBens1[7], twS1, 1, 'done', { checkInDate: '2025-11-15', recommendedToOthers: 'yes', peersCount: 1, verified: true });
  addCycle(twBens1[7], twS1, 2, 'done', { checkInDate: '2025-12-15', verified: true });
  addCycle(twBens1[7], twS1, 3, 'done', { checkInDate: '2026-01-15', verified: false });

  // TechWave S2 — Cycle 1 and 2 done, Cycle 3 in progress
  addCycle(twBens2[0], twS2, 1, 'done', { checkInDate: '2025-12-20', verified: true });
  addCycle(twBens2[0], twS2, 2, 'done', { checkInDate: '2026-01-20', leakage: 'rarely', verified: false });

  addCycle(twBens2[1], twS2, 1, 'done', { checkInDate: '2025-12-21', verified: true });
  addCycle(twBens2[1], twS2, 2, 'done', { checkInDate: '2026-01-21', verified: false });

  addCycle(twBens2[2], twS2, 1, 'not-adopted', { checkInDate: '2025-12-22', nonAdoptionReason: 'Discomfort / pain during use', adopted: false, verified: true });

  addCycle(twBens2[3], twS2, 1, 'done', { checkInDate: '2025-12-25', verified: false });
  addCycle(twBens2[3], twS2, 2, 'pending', {});

  addCycle(twBens2[4], twS2, 1, 'done', { checkInDate: '2025-12-20', recommendedToOthers: 'yes', verified: true });
  addCycle(twBens2[4], twS2, 2, 'done', { checkInDate: '2026-01-20', verified: false });

  // GreenLeaf S1 — all 3 cycles, mature programme (Sep 2025)
  addCycle(glBens1[0], glS1, 1, 'done', { checkInDate: '2025-10-20', verified: true });
  addCycle(glBens1[0], glS1, 2, 'done', { checkInDate: '2025-11-20', verified: true });
  addCycle(glBens1[0], glS1, 3, 'done', { checkInDate: '2025-12-20', recommendedToOthers: 'yes', peersCount: 2, verified: true });

  addCycle(glBens1[1], glS1, 1, 'not-adopted', { checkInDate: '2025-10-22', nonAdoptionReason: 'Leakage issues', adopted: false, verified: true });

  addCycle(glBens1[2], glS1, 1, 'done', { checkInDate: '2025-10-21', verified: true });
  addCycle(glBens1[2], glS1, 2, 'done', { checkInDate: '2025-11-21', verified: true });
  addCycle(glBens1[2], glS1, 3, 'done', { checkInDate: '2025-12-21', verified: true });

  addCycle(glBens1[3], glS1, 1, 'done', { checkInDate: '2025-10-20', verified: true });
  addCycle(glBens1[3], glS1, 2, 'done', { checkInDate: '2025-11-20', verified: true });
  addCycle(glBens1[3], glS1, 3, 'done', { checkInDate: '2025-12-20', verified: false });

  addCycle(glBens1[4], glS1, 1, 'not-adopted', { checkInDate: '2025-10-25', nonAdoptionReason: 'Cultural or family resistance', adopted: false, verified: true });

  addCycle(glBens1[5], glS1, 1, 'done', { checkInDate: '2025-10-22', verified: true });
  addCycle(glBens1[5], glS1, 2, 'done', { checkInDate: '2025-11-22', verified: false });
  addCycle(glBens1[5], glS1, 3, 'done', { checkInDate: '2025-12-22', verified: false });

  // GreenLeaf S2 — Cycle 1 done, Cycle 2 in progress
  addCycle(glBens2[0], glS2, 1, 'done', { checkInDate: '2026-01-05', verified: false });
  addCycle(glBens2[0], glS2, 2, 'done', { checkInDate: '2026-02-05', verified: false });

  addCycle(glBens2[1], glS2, 1, 'done', { checkInDate: '2026-01-06', usageStatus: 'using with some issues', comfortInsertion: 'getting better', verified: false });

  addCycle(glBens2[2], glS2, 1, 'not-adopted', { checkInDate: '2026-01-07', nonAdoptionReason: 'Fear of insertion', adopted: false, verified: false });

  addCycle(glBens2[3], glS2, 1, 'pending', {});

  // Skyline S1 — Cycle 1 and 2 done
  addCycle(spBens1[0], spS1, 1, 'done', { checkInDate: '2025-12-10', verified: true });
  addCycle(spBens1[0], spS1, 2, 'done', { checkInDate: '2026-01-10', verified: false });

  addCycle(spBens1[1], spS1, 1, 'done', { checkInDate: '2025-12-11', verified: true });
  addCycle(spBens1[1], spS1, 2, 'pending', {});

  addCycle(spBens1[2], spS1, 1, 'not-adopted', { checkInDate: '2025-12-12', nonAdoptionReason: 'Discomfort / pressure sensation', adopted: false, verified: false });

  addCycle(spBens1[3], spS1, 1, 'done', { checkInDate: '2025-12-15', usageStatus: 'using with some issues', verified: false });

  // Zenith — only Cycle 1 partial (newest programme)
  addCycle(zfBens1[0], zfS1, 1, 'done', { checkInDate: '2026-03-14', verified: false });
  addCycle(zfBens1[1], zfS1, 1, 'pending', {});
  // Isita — not yet logged

  // ---- WhatsApp Dispatch Log (sample) ----
  const addDispatch = (ben, cycle, received) => {
    DB.addWhatsappDispatch({
      beneficiaryId: ben.id, companyId: ben.companyId,
      cycleNumber: cycle, messageType: 'reminder',
      language: ben.language === 'English' ? 'English' : 'Hindi',
      sentDate: new Date(Date.now() - (cycle * 30 + 5) * 86400000).toISOString().split('T')[0],
      sentBy: 'Admin',
      responseReceived: received,
      responseDate: received ? new Date(Date.now() - (cycle * 30) * 86400000).toISOString().split('T')[0] : null,
      responseMethod: received ? ben.whatsappMethod : '',
      dataEnteredInSystem: received
    });
  };

  twBens1.slice(0, 4).forEach(b => { addDispatch(b, 1, true); addDispatch(b, 2, true); addDispatch(b, 3, true); });
  twBens1.slice(4).forEach(b => addDispatch(b, 1, true));
  glBens1.forEach(b => { addDispatch(b, 1, true); addDispatch(b, 2, true); addDispatch(b, 3, true); });

  localStorage.setItem(DB.KEYS.seeded, 'true');
  console.log('✅ Auleaves FCP seed data v2 loaded successfully');
}
