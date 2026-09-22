-- Run using the project's DATABASE_URL or the Supabase SQL Editor.
-- Only application-owned schema is changed; Supabase Auth tables are untouched.
CREATE TABLE IF NOT EXISTS public.applyflow_profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL CHECK (length(btrim(full_name)) BETWEEN 1 AND 100),
    birth_date date NOT NULL CHECK (birth_date >= DATE '1900-01-01' AND birth_date <= CURRENT_DATE),
    email text NOT NULL,
    email_confirmed_at timestamptz,
    confirmation_token_hash text UNIQUE,
    confirmation_expires_at timestamptz,
    confirmation_sent_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.applyflow_profiles ENABLE ROW LEVEL SECURITY;
-- The Next.js server accesses this table via DATABASE_URL. No browser role may
-- read birthdates or grant itself registration/email-confirmation status.
REVOKE ALL ON public.applyflow_profiles FROM PUBLIC, anon, authenticated;
