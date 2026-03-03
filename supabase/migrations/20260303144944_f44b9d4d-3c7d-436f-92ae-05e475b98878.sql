
-- Add approved_by and approved_at columns to profiles
ALTER TABLE public.profiles
ADD COLUMN approved_by text NULL,
ADD COLUMN approved_at timestamp with time zone NULL;
