
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/insert profiles (no-password auth model)
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);

-- User roles table
CREATE TYPE public.app_role AS ENUM ('employee', 'leader');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  role app_role NOT NULL DEFAULT 'employee'
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert roles" ON public.user_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update roles" ON public.user_roles FOR UPDATE USING (true);

-- DiSC results table
CREATE TABLE public.disc_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_style TEXT NOT NULL CHECK (primary_style IN ('D', 'I', 'S', 'C')),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disc_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read disc results" ON public.disc_results FOR SELECT USING (true);
CREATE POLICY "Anyone can insert disc results" ON public.disc_results FOR INSERT WITH CHECK (true);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if any users exist (for first-user-is-leader logic)
CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER FROM public.profiles
$$;
