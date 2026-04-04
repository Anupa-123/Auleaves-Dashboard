-- ============================================
-- Auleaves Freedom Circle Program
-- Supabase Database Schema
-- ============================================

-- 1. Profiles table (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'company' CHECK (role IN ('admin', 'company')),
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  city TEXT,
  csr_contact_name TEXT,
  contact_email TEXT,
  target_women_count INTEGER DEFAULT 0,
  programme_start_date DATE,
  login_id TEXT UNIQUE,
  login_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  facilitator TEXT,
  department TEXT,
  city TEXT,
  session_type TEXT DEFAULT 'awareness workshop',
  women_attended INTEGER DEFAULT 0,
  cups_purchased INTEGER DEFAULT 0,
  revenue_collected NUMERIC DEFAULT 0,
  csr_subsidy NUMERIC DEFAULT 0,
  notes TEXT,
  logged_by TEXT,
  logged_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Beneficiaries table
CREATE TABLE beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fcp_id TEXT UNIQUE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  age_group TEXT DEFAULT '25-34',
  cup_size TEXT DEFAULT 'medium',
  first_time_user TEXT DEFAULT 'yes',
  language TEXT DEFAULT 'Hindi',
  consent_recorded_by TEXT,
  consent_date DATE,
  registered_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Follow-ups table
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month IN (1, 2, 3)),
  follow_date DATE,
  usage_status TEXT,
  recommended_to_others TEXT DEFAULT 'not sure',
  notes TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  logged_by_name TEXT,
  logged_by_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(beneficiary_id, month)
);

-- 6. Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT,
  message TEXT,
  actor TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_name TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Auto-generate FCP IDs
CREATE OR REPLACE FUNCTION generate_fcp_id()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(fcp_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_num FROM beneficiaries;
  NEW.fcp_id := 'FCP-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_fcp_id
  BEFORE INSERT ON beneficiaries
  FOR EACH ROW
  WHEN (NEW.fcp_id IS NULL)
  EXECUTE FUNCTION generate_fcp_id();

-- 8. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'company'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 9. Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admin can see everything, company sees only their data
CREATE POLICY "Admin full access companies" ON companies FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Company can view own company" ON companies FOR SELECT
  USING (id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admin full access sessions" ON sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Company can view own sessions" ON sessions FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admin full access beneficiaries" ON beneficiaries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Company can view own beneficiaries" ON beneficiaries FOR SELECT
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admin full access followups" ON followups FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Company can manage own followups" ON followups FOR ALL
  USING (company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admin full access notifications" ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 10. Insert admin user's company seed data (optional demo)
-- You can run this later to seed demo data

-- Insert the admin profile after they sign up:
-- UPDATE profiles SET role = 'admin' WHERE email = 'anupadevda3@gmail.com';
