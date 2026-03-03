
-- Update the handle_new_user trigger to auto-promote super admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, status, approved_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    CASE WHEN LOWER(COALESCE(NEW.email, '')) = 'mdr.gemini@gmail.com' THEN 'approved' ELSE 'pending' END,
    CASE WHEN LOWER(COALESCE(NEW.email, '')) = 'mdr.gemini@gmail.com' THEN now() ELSE NULL END
  );
  -- Assign role based on email
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    CASE WHEN LOWER(COALESCE(NEW.email, '')) = 'mdr.gemini@gmail.com' THEN 'admin'::app_role ELSE 'faculty'::app_role END
  );
  RETURN NEW;
END;
$$;

-- Update the existing user if already in database
UPDATE public.profiles SET status = 'approved', approved_at = now() WHERE LOWER(email) = 'mdr.gemini@gmail.com';
UPDATE public.user_roles SET role = 'admin' WHERE user_id IN (SELECT id FROM public.profiles WHERE LOWER(email) = 'mdr.gemini@gmail.com');
