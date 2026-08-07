-- Migration: Seed official counsellors with role = 'counsellor'
-- Runs safely in Supabase SQL Editor or CLI

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  c_user RECORD;
  c_id UUID;
  c_list JSONB := '[
    {
      "name": "Dr. Deepika B V",
      "email": "deepika.civil@sode-edu.in",
      "department": "Civil Engineering"
    },
    {
      "name": "Ms. Shashikala",
      "email": "shashikala.ec@sode-edu.in",
      "department": "Electronics & Communication Engineering"
    },
    {
      "name": "Ms. Savitha Shenoy",
      "email": "savitha.cs@sode-edu.in",
      "department": "Computer Science & Engineering"
    },
    {
      "name": "Ms. ASHWITHA C THOTA",
      "email": "ashwithac.cs@sode-edu.in",
      "department": "Computer Science & Engineering"
    },
    {
      "name": "Mr. Karthik V",
      "email": "karthik.mech@sode-edu.in",
      "department": "Mechanical Engineering"
    },
    {
      "name": "Ms. MAMATHA",
      "email": "mamathas.ml@sode-edu.in",
      "department": "Artificial Intelligence & Machine Learning"
    },
    {
      "name": "Dr. Subbulakshmi N Karanth",
      "email": "snkaranth.chemistry@sode-edu.in",
      "department": "Basic Sciences & Humanities"
    },
    {
      "name": "Ms. Reshma Nayak",
      "email": "reshma.maths@sode-edu.in",
      "department": "Basic Sciences & Humanities"
    },
    {
      "name": "Dr. Neha Lakhotia",
      "email": "nehal.mba@sode-edu.in",
      "department": "Business Administration"
    }
  ]'::jsonb;
BEGIN
  FOR c_user IN SELECT * FROM jsonb_to_recordset(c_list) AS x(name text, email text, department text)
  LOOP
    -- Check if user already exists in auth.users
    SELECT id INTO c_id FROM auth.users WHERE email = c_user.email;
    
    IF c_id IS NULL THEN
      c_id := gen_random_uuid();
      
      -- Insert into auth.users with default password 'Counsellor@123'
      INSERT INTO auth.users (
        id,
        instance_id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        c_id,
        '00000000-0000-0000-0000-000000000000',
        'authenticated',
        'authenticated',
        c_user.email,
        crypt('Counsellor@123', gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', c_user.name, 'department', c_user.department, 'role', 'counsellor'),
        now(),
        now()
      );
    END IF;

    -- Insert into auth.identities for Email provider
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      c_id,
      c_id,
      jsonb_build_object('sub', c_id::text, 'email', c_user.email, 'email_verified', true),
      'email',
      c_user.email,
      now(),
      now(),
      now()
    )
    ON CONFLICT (provider_id, provider) DO UPDATE SET
      identity_data = EXCLUDED.identity_data,
      updated_at = now();

    -- Upsert profile with 'counsellor' role
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      department,
      role,
      created_at,
      updated_at
    ) VALUES (
      c_id,
      c_user.email,
      c_user.name,
      c_user.department,
      'counsellor',
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      department = EXCLUDED.department,
      role = 'counsellor',
      updated_at = now();

  END LOOP;
END $$;
