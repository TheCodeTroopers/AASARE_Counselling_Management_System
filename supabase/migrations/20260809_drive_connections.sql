-- ============================================================================
-- SQL Migration for AASARE Counselling Management System
-- Creates `drive_connections` and `audit_logs` tables in Supabase Postgres
-- ============================================================================

-- 1. Create `drive_connections` table
CREATE TABLE IF NOT EXISTS public.drive_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    counsellor_email TEXT UNIQUE NOT NULL,
    folder_name TEXT DEFAULT 'AASARE Counselling Case Sheets',
    folder_id TEXT,
    folder_url TEXT,
    encrypted_access_token TEXT,
    encrypted_refresh_token TEXT,
    is_connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on `drive_connections`
ALTER TABLE public.drive_connections ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own drive connection
CREATE POLICY "Users can view and manage their own drive connection" 
ON public.drive_connections 
FOR ALL 
TO authenticated 
USING (auth.jwt() ->> 'email' = counsellor_email OR auth.uid() = user_id)
WITH CHECK (auth.jwt() ->> 'email' = counsellor_email OR auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role full access to drive_connections"
ON public.drive_connections
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);


-- 2. Create `case_sheets` table if not existing
CREATE TABLE IF NOT EXISTS public.case_sheets (
    id TEXT PRIMARY KEY,
    counsellor_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    department TEXT,
    reason_for_visit TEXT,
    is_draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on `case_sheets`
ALTER TABLE public.case_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counsellors can manage case sheets"
ON public.case_sheets
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- 3. Create `audit_logs` table if not existing
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_email TEXT,
    action TEXT NOT NULL,
    category TEXT DEFAULT 'SECURITY',
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on `audit_logs`
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Notify schema cache reload
NOTIFY pgrst, 'reload schema';
