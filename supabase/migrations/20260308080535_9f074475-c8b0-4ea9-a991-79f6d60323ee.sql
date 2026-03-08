
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  text text NOT NULL,
  subject text NOT NULL,
  subject_code text,
  unit text NOT NULL,
  difficulty text NOT NULL DEFAULT 'Medium',
  marks integer NOT NULL DEFAULT 2,
  type text NOT NULL DEFAULT 'Short',
  bloom text DEFAULT 'Remember',
  source text NOT NULL DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own questions" ON public.questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON public.questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions" ON public.questions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_questions_user_id ON public.questions(user_id);
CREATE INDEX idx_questions_subject ON public.questions(subject);
