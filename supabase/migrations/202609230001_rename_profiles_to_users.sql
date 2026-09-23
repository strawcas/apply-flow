-- Rename in place to preserve registration data, RLS, grants, and foreign keys.
-- Supabase's auth.users is unchanged. Refuse to overwrite an existing table.
DO $$
BEGIN
    IF to_regclass('public.applyflow_profiles') IS NOT NULL THEN
        IF to_regclass('public.users') IS NOT NULL THEN
            RAISE EXCEPTION 'Cannot rename applyflow_profiles: public.users already exists.';
        END IF;

        ALTER TABLE public.applyflow_profiles RENAME TO users;
        ALTER TABLE public.users RENAME CONSTRAINT applyflow_profiles_pkey TO users_pkey;
        ALTER TABLE public.users RENAME CONSTRAINT applyflow_profiles_user_id_fkey TO users_user_id_fkey;
        ALTER TABLE public.users RENAME CONSTRAINT applyflow_profiles_full_name_check TO users_full_name_check;
        ALTER TABLE public.users RENAME CONSTRAINT applyflow_profiles_birth_date_check TO users_birth_date_check;
        ALTER TABLE public.users RENAME CONSTRAINT applyflow_profiles_confirmation_token_hash_key TO users_confirmation_token_hash_key;
    ELSIF to_regclass('public.users') IS NULL THEN
        RAISE EXCEPTION 'Apply the initial profile migration before renaming the table.';
    END IF;
END
$$;
