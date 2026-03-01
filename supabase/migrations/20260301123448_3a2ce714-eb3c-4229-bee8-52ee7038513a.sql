ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0;
ALTER TABLE public.papers ADD COLUMN IF NOT EXISTS score_breakdown jsonb DEFAULT '{}'::jsonb;