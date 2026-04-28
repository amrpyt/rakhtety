ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone TEXT;

UPDATE public.profiles
SET full_name = COALESCE(NULLIF(full_name, ''), COALESCE(NULLIF(split_part(email, '@', 1), ''), 'User'))
WHERE full_name = '' OR full_name IS NULL;
