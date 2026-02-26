
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Papers table (generated/saved papers)
CREATE TABLE public.papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  subject TEXT NOT NULL,
  subject_code TEXT,
  college_name TEXT,
  exam_type TEXT,
  duration TEXT,
  max_marks INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT DEFAULT 'mixed',
  theme TEXT DEFAULT 'classic',
  paper_data JSONB NOT NULL DEFAULT '{}',
  questions JSONB NOT NULL DEFAULT '[]',
  version INTEGER NOT NULL DEFAULT 1,
  parent_id UUID REFERENCES public.papers(id) ON DELETE SET NULL,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  paper_id_code TEXT NOT NULL DEFAULT ('CQ-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  watermark TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own papers" ON public.papers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create papers" ON public.papers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own papers" ON public.papers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own papers" ON public.papers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_papers_updated_at BEFORE UPDATE ON public.papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Uploaded papers table
CREATE TABLE public.uploaded_papers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  detected_subject TEXT,
  detected_units JSONB DEFAULT '[]',
  marks_distribution JSONB DEFAULT '{}',
  sections JSONB DEFAULT '[]',
  questions JSONB DEFAULT '[]',
  analysis JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.uploaded_papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads" ON public.uploaded_papers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create uploads" ON public.uploaded_papers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.uploaded_papers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.uploaded_papers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_uploaded_papers_updated_at BEFORE UPDATE ON public.uploaded_papers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public) VALUES ('papers', 'papers', false);

CREATE POLICY "Users can upload own papers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own papers storage" ON storage.objects FOR SELECT USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own papers storage" ON storage.objects FOR DELETE USING (bucket_id = 'papers' AND auth.uid()::text = (storage.foldername(name))[1]);
