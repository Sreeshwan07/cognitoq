
CREATE POLICY "Admins can view all questions" ON public.questions FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage all questions" ON public.questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
