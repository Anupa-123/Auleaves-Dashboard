# Auleaves Freedom Circle Program — Dashboard Application

## Goal
Build a fully functional, production-ready dashboard for Auleaves' menstrual health CSR programme. The app must be deployed on Vercel with a shareable link so that company clients can log in and access their own data.

## Reference Layout
The design follows the dark-themed dashboard layout from the reference image, with the Auleaves branding:
- **Primary color**: Deep Rose `#C2185B`
- **Secondary color**: Sage Green `#2E7D5A`  
- **Typography**: Cormorant Garamond (headings) + DM Sans (body)
- **Dark mode theme** with card-based layout, sidebar navigation, stats cards, charts, and adoption funnel

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | **Next.js 14** (App Router) |
| Backend/DB | **Supabase** (PostgreSQL + Auth + RLS) |
| Styling | CSS Modules + Vanilla CSS |
| Charts | Chart.js (via react-chartjs-2) |
| PDF Export | Browser Print API + @react-pdf/renderer |
| Email | EmailJS (client-side, simple setup) |
| Hosting | **Vercel** (free tier) |

---

## User Review Required

> [!IMPORTANT]
> **Supabase Project Required**: You need to create a free Supabase project at https://supabase.com. I will need:
> 1. Your **Supabase Project URL** (e.g., `https://xxxxx.supabase.co`)
> 2. Your **Supabase Anon Key** (found in Project Settings → API)
> 3. Your **Supabase Service Role Key** (for admin operations)

> [!IMPORTANT]  
> **EmailJS Setup**: For email notifications when companies submit data, you'll need a free EmailJS account (https://emailjs.com). I'll need:
> 1. EmailJS Service ID
> 2. EmailJS Template ID  
> 3. EmailJS Public Key
> 4. Admin email address to receive notifications

> [!WARNING]
> **Without Supabase credentials, I can build a fully working demo using localStorage** so you can see everything working. Then we connect Supabase later for production deployment. **Which approach do you prefer?**
> - **Option A**: Build with localStorage first (instant demo, connect Supabase later)
> - **Option B**: Wait for your Supabase credentials and build production-ready directly

---

## Proposed Changes

### Phase 1: Project Setup

#### [NEW] Next.js Project Initialization
- Initialize Next.js 14 project in `D:\Auleaves`
- Install dependencies: `react-chartjs-2`, `chart.js`, `@react-pdf/renderer`, `emailjs-com`
- Configure Google Fonts (Cormorant Garamond + DM Sans)

---

### Phase 2: Design System & Layout

#### [NEW] `app/globals.css` — Design System
- CSS custom properties for the brand palette (rose, sage green, dark backgrounds)
- Typography scale with Cormorant Garamond + DM Sans
- Card styles, button variants, form controls
- Responsive grid system
- Animations and transitions

#### [NEW] `app/layout.js` — Root Layout  
- Font loading, meta tags, SEO
- Global providers (auth context)

#### [NEW] `components/Sidebar.js` — Navigation Sidebar
- Auleaves branding at top
- Active Company selector (admin only)
- Navigation sections: Overview, Data Entry, Reporting
- Badge counts for sessions, notifications
- Current user info at bottom
- Responsive: collapses to hamburger on mobile

#### [NEW] `components/Header.js` — Top Header Bar
- Company name display
- Period selector (Q1 2026, etc.)
- Action buttons: Log Session, Export Report
- User menu

---

### Phase 3: Authentication System

#### [NEW] `app/login/page.js` — Login Page
- Branded login form with Auleaves logo
- Company ID + Password fields
- Admin login option
- Error handling

#### [NEW] `lib/auth.js` — Auth Context & Logic
- Session-based login with role detection (admin vs company)
- Company data isolation
- Protected route wrapper
- Login/logout functions

---

### Phase 4: Data Layer

#### [NEW] `lib/database.js` — Data Management
- CRUD operations for all entities
- localStorage adapter (for demo) with easy swap to Supabase
- Data seeded with realistic demo data for 3-4 companies
- Indian number formatting, date formatting utilities

#### [NEW] `lib/seed.js` — Demo Data
- 4 sample companies (TechWave Solutions, GreenLeaf Corp, etc.)
- 24 sessions across companies
- 312 registered beneficiaries  
- Month 1, 2, 3 follow-up data
- Activity logs and notifications

---

### Phase 5: Admin Pages (All Fully Functional)

#### [NEW] `app/dashboard/page.js` — Admin Dashboard
- 4 KPI cards (Total Sessions, Cups Distributed, Active Users 3MO, Companies Onboarded)
- Month-wise progress cards (Month 1 Awareness, Month 2 Purchase, Month 3 Active Use)
- Session & Cup Trend chart (line chart like reference)
- Adoption Funnel (horizontal bar chart)

#### [NEW] `app/sessions/page.js` — Sessions List
- Table of all sessions with sortable columns
- Filter by company, date range, session type
- Click to view session details

#### [NEW] `app/log-session/page.js` — Log New Session
- Full form: company, date, facilitator, department, city, women attended, cups purchased
- Session type dropdown, revenue, CSR subsidy, notes
- Auto-calculate conversion rate
- Form validation and success feedback

#### [NEW] `app/companies/page.js` — Company Management
- Add new company form with all fields (name, contact, email, city, industry, target, login credentials)
- Company cards/table with live stats
- Edit/remove company (cascading delete)

#### [NEW] `app/beneficiaries/page.js` — Beneficiary Registry
- Register individual women with consent workflow
- FCP-XXX unique ID generation
- Phone masking (show last 4 digits)
- Link to company and session
- Consent statement display
- Filter by company, search by name/ID

#### [NEW] `app/follow-ups/page.js` — Follow-up Management
- Monthly check-in logging per beneficiary
- Duplicate prevention (1 check-in per woman per month)
- Usage status dropdown with all options
- Verify check-in (mark as Auleaves-verified)
- Flag overdue: highlight women without Month 3 data
- Filter by month, company, verification status

#### [NEW] `app/notifications/page.js` — Notifications Panel
- Chronological log of all data submissions
- Who submitted, what, when
- Mark as read/unread
- Filter by company

#### [NEW] `app/impact-report/page.js` — CSR Impact Report
- Filter by company and period (3M/6M/12M/All Time)
- Metrics: sessions, women reached, cups distributed, conversion rate
- 3-month retention %, peer referrals
- Revenue and CSR subsidy totals
- Impact Funnel visualization
- Data integrity statement
- **PDF Export** button (branded PDF with Auleaves header)

---

### Phase 6: Company Role Pages

#### [NEW] `app/company-dashboard/page.js` — Company's Own Dashboard
- Their own metrics (sessions, women attended, cups, registered)
- Impact funnel (Awareness → Purchase → Adoption → Peer Referral)
- Their session list

#### [NEW] `app/company-followups/page.js` — Company Follow-up Submission
- Submit monthly check-ins for their registered women
- See pending vs verified status
- Cannot edit after submission

#### [NEW] `app/company-report/page.js` — Company Impact Report
- Same as admin report but filtered to their company only
- PDF download

---

### Phase 7: Shared Components

#### [NEW] `components/StatsCard.js` — KPI Card
#### [NEW] `components/DataTable.js` — Reusable Data Table  
#### [NEW] `components/Modal.js` — Form Modal
#### [NEW] `components/ImpactFunnel.js` — Funnel Visualization
#### [NEW] `components/SessionChart.js` — Line/Bar Charts
#### [NEW] `components/PDFReport.js` — PDF Template
#### [NEW] `components/ConsentForm.js` — Consent Workflow
#### [NEW] `components/Badge.js` — Status Badge

---

## Impact Funnel Logic

```
Women Reached (attended sessions)
  → Cups Purchased (conversion rate)
    → Registered Beneficiaries
      → Using Comfortably at Month 3
        → Recommended to Peers
```

Each stage shows:
- Absolute number
- Percentage of previous stage

---

## Deployment Plan

1. Build complete app locally with demo data (localStorage)
2. Push to GitHub repository
3. Create Supabase project, run SQL migrations
4. Deploy to Vercel with environment variables
5. Share URL with company clients

---

## Open Questions

> [!IMPORTANT]
> 1. **Do you already have a Supabase account?** If not, should I build with localStorage demo first?
> 2. **Do you have a GitHub account?** (Needed for Vercel deployment)
> 3. **What admin email** should receive notifications?
> 4. **Do you want sample/demo data** pre-loaded so the client can see how it looks with data?
> 5. **Company login credentials** — do you have specific company names/IDs you want me to set up?

---

## Verification Plan

### Automated Tests
- Test all CRUD operations for each data entity
- Test role-based access (admin vs company sees different data)
- Test form validations (duplicate check-in prevention, required fields)
- Test PDF generation

### Manual Verification
- Browser testing of all pages and navigation
- Test login/logout flow for both roles
- Verify mobile responsiveness
- Test PDF export with realistic data
- Verify impact funnel calculations are correct
