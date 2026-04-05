# Auleaves Freedom Circle Program — Complete Guide

## ✅ Sab Ready Hai!

Aapka dashboard fully functional hai — sab buttons kaam karte hain, data localStorage mein store hota hai.

---

## 🚀 Permanent Link Kaise Banaye (FREE — No Time Limit)

### Step 1: Netlify pe Free Account banao
1. Jao: **https://app.netlify.com/signup**
2. Email se sign up karo (FREE hai)
3. Verify email

### Step 2: Deploy karo
1. Login ke baad → **"Sites"** section mein jao
2. **"Add new site" → "Deploy manually"** click karo
3. `D:\Auleaves` folder drag-and-drop karo
4. 30 second mein **permanent link** mil jayegi!

> [!IMPORTANT]
> Netlify account ke saath **link kabhi expire nahi hogi** — jab tak aap delete nahi karoge tab tak live rahegi.
> Custom domain bhi laga sakte ho jaise `dashboard.auleaves.com`

---

## 📧 Email Notification Setup (care@auleaves.com)

Jab bhi koi company login kare ya data submit kare, aapko email aayegi. Setup:

### Step 1: EmailJS Account (FREE — 200 emails/month)
1. Jao: **https://www.emailjs.com** → Sign up free
2. **"Email Services"** tab → **"Add New Service"** → Gmail connect karo
3. Service ID note karo (jaise `service_abc123`)

### Step 2: Templates banao
4. **"Email Templates"** tab → **"Create New Template"**

**Template 1 — Login Alert:**
```
Subject: 🔑 {{company_name}} logged into FCP Dashboard
Body:
Company: {{company_name}}
Person: {{contact_name}}
Time: {{login_time}}
Dashboard: {{dashboard_url}}
```

**Template 2 — Data Submission:**
```
Subject: 📋 New data submitted by {{company_name}}
Body:
Company: {{company_name}}
Submitted by: {{contact_name}}
Type: {{submission_type}}
Details: {{details}}
Time: {{submission_time}}
```

### Step 3: Credentials paste karo
5. **"Account"** → API Keys se **Public Key** copy karo
6. `D:\Auleaves\js\email.js` file open karo
7. Ye 4 values fill karo:

```javascript
PUBLIC_KEY: 'paste_your_public_key_here',
SERVICE_ID: 'paste_your_service_id_here',
LOGIN_TEMPLATE_ID: 'paste_login_template_id_here',
DATA_TEMPLATE_ID: 'paste_data_template_id_here',
CONFIGURED: true   // ← ye true karo!
```

8. Save karo → Netlify pe re-deploy karo → Done! ✅

---

## 📥 Excel Data Import

Dashboard mein **"Import Data"** page hai sidebar mein. 3 tarike se data import kar sakte ho:

### CSV se Import:
1. Sidebar → **Import Data** click karo
2. **"Download Template"** button se template download karo
3. Excel mein template open karo → data fill karo
4. **File → Save As → CSV (Comma delimited)** se save karo
5. Dashboard pe wapas aao → **"Choose File"** → CSV select karo → **"Import"** click karo

### Supported Imports:
| Type | Required Columns |
|------|-----------------|
| Companies | name, csrContactName, contactEmail, city, industry, loginId, loginPassword |
| Sessions | companyLoginId, sessionDate, facilitator, womenAttended, cupsPurchased, sessionType |
| Beneficiaries | companyLoginId, fullName, phone, ageGroup, cupSize, language |

---

## ⚠️ Important Note — localStorage Limitation

Abhi data **browser ke localStorage** mein store hota hai. Iska matlab:
- Har user ka data **sirf uske browser mein** hai
- Agar browser clear kare to data chala jayega
- Alag-alag devices pe alag data hoga

### Production Ke Liye (Supabase):
Jab aap ready ho, hum **Supabase** connect karenge — tab:
- ✅ Data server pe permanently store hoga
- ✅ Sab users same data dekhenge
- ✅ Real multi-user support
- ✅ Company data isolation (RLS)

---

## 🔑 Login Credentials

| Role | ID | Password |
|------|------|----------|
| **Admin** | `admin` | `auleaves2026` |
| TechWave Solutions | `techwave` | `techwave123` |
| GreenLeaf Industries | `greenleaf` | `greenleaf123` |
| Skyline Pharma | `skyline` | `skyline123` |
| Zenith Financial | `zenith` | `zenith123` |

## 📂 Project Files

All files are in `D:\Auleaves\`:

| File | Purpose |
|------|---------|
| [index.html](file:///D:/Auleaves/index.html) | Main app |
| [css/styles.css](file:///D:/Auleaves/css/styles.css) | Design system |
| [js/database.js](file:///D:/Auleaves/js/database.js) | Data layer |
| [js/seed.js](file:///D:/Auleaves/js/seed.js) | Demo data |
| [js/email.js](file:///D:/Auleaves/js/email.js) | Email notifications |
| [js/import-export.js](file:///D:/Auleaves/js/import-export.js) | CSV import/export |
| [js/app.js](file:///D:/Auleaves/js/app.js) | Core app logic |
| [js/pages-*.js](file:///D:/Auleaves/js/) | Page renderers |
