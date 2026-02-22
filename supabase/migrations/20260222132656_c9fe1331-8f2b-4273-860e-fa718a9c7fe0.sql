
-- Add CASCADE to disc_results foreign key
ALTER TABLE public.disc_results
  DROP CONSTRAINT IF EXISTS disc_results_user_id_fkey,
  ADD CONSTRAINT disc_results_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add CASCADE to user_roles foreign key
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Allow UPDATE on disc_results for test retake
CREATE POLICY "Anyone can update disc results"
ON public.disc_results FOR UPDATE
USING (true)
WITH CHECK (true);
