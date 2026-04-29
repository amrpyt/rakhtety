ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_clients_created_by
  ON public.clients(created_by);

NOTIFY pgrst, 'reload schema';
