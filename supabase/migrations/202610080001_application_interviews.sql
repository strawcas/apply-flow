-- Interview schedules belong to their application and use local calendar dates
-- and optional wall-clock times, matching the existing calendar.
ALTER TABLE public.applications
    ADD COLUMN IF NOT EXISTS interview_date date
        CONSTRAINT applications_interview_date_check
        CHECK (interview_date BETWEEN DATE '1900-01-01' AND DATE '9999-12-31'),
    ADD COLUMN IF NOT EXISTS interview_time text
        CONSTRAINT applications_interview_time_check
        CHECK (interview_time IS NULL OR
            (interview_date IS NOT NULL AND interview_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'));
