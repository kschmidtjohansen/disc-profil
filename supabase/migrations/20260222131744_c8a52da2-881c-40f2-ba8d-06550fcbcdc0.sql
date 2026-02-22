
-- Add status column to profiles
ALTER TABLE public.profiles ADD COLUMN status text NOT NULL DEFAULT 'pending_approval';

-- Set all existing profiles to approved
UPDATE public.profiles SET status = 'approved';

-- Allow updates on profiles (for approving)
CREATE POLICY "Anyone can update profiles"
ON public.profiles FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow deletes on profiles (for rejecting)
CREATE POLICY "Anyone can delete profiles"
ON public.profiles FOR DELETE
USING (true);

-- Allow deletes on user_roles (for cascade cleanup)
CREATE POLICY "Anyone can delete user_roles"
ON public.user_roles FOR DELETE
USING (true);
