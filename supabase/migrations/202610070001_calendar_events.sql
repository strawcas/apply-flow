-- Calendar events are private to the account that creates them. Access is
-- through authenticated Next.js queries / actions using DATABASE_URL.
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    title text NOT NULL CONSTRAINT calendar_events_title_check CHECK (length(btrim(title)) BETWEEN 1 AND 120),
    type text NOT NULL CONSTRAINT calendar_events_type_check CHECK (type IN ('interview', 'deadline', 'follow-up', 'other')),
    event_date date NOT NULL CONSTRAINT calendar_events_event_date_check CHECK (event_date BETWEEN DATE '1900-01-01' AND DATE '9999-12-31'),
    start_time text NOT NULL DEFAULT '' CONSTRAINT calendar_events_start_time_check CHECK (start_time = '' OR start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    end_time text NOT NULL DEFAULT '' CONSTRAINT calendar_events_end_time_check CHECK (end_time = '' OR end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
    company text NOT NULL DEFAULT '' CONSTRAINT calendar_events_company_check CHECK (length(company) <= 120),
    location text NOT NULL DEFAULT '' CONSTRAINT calendar_events_location_check CHECK (length(location) <= 500),
    notes text NOT NULL DEFAULT '' CONSTRAINT calendar_events_notes_check CHECK (length(notes) <= 2000),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT calendar_events_check CHECK (end_time = '' OR (start_time <> '' AND end_time > start_time))
);

CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx ON public.calendar_events (user_id, event_date);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_events FROM PUBLIC, anon, authenticated;
