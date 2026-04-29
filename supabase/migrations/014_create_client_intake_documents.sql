CREATE TABLE IF NOT EXISTS public.client_intake_documents (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  label text NOT NULL,
  file_name text NOT NULL,
  storage_path text NOT NULL UNIQUE,
  mime_type text,
  file_size integer,
  uploaded_by uuid REFERENCES public.profiles(id),
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.client_intake_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_intake_documents_select" ON public.client_intake_documents;
CREATE POLICY "client_intake_documents_select"
  ON public.client_intake_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_client_intake_documents_client_id
  ON public.client_intake_documents(client_id);

CREATE INDEX IF NOT EXISTS idx_client_intake_documents_uploaded_by
  ON public.client_intake_documents(uploaded_by);

NOTIFY pgrst, 'reload schema';
