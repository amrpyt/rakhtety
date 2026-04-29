ALTER TABLE public.clients
  ALTER COLUMN plot_number DROP NOT NULL,
  ALTER COLUMN area DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
