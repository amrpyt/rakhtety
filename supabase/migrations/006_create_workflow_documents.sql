CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO storage.buckets (id, name, public)
VALUES ('workflow-documents', 'workflow-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.workflow_document_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  label TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_name, document_type)
);

CREATE TABLE IF NOT EXISTS public.workflow_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  workflow_step_id UUID NOT NULL REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  label TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_documents_workflow_id
  ON public.workflow_documents(workflow_id);

CREATE INDEX IF NOT EXISTS idx_workflow_documents_step_id
  ON public.workflow_documents(workflow_step_id);

CREATE INDEX IF NOT EXISTS idx_workflow_documents_type
  ON public.workflow_documents(workflow_step_id, document_type);

CREATE INDEX IF NOT EXISTS idx_workflow_document_requirements_step
  ON public.workflow_document_requirements(step_name)
  WHERE is_active = true;

INSERT INTO public.workflow_document_requirements (step_name, document_type, label, is_required) VALUES
  ('بيان الصلاحية', 'eligibility_statement', 'بيان الصلاحية', true),
  ('تقديم الملف', 'submission_receipt', 'إيصال تقديم الملف', true),
  ('دفع إذن الرخصة وشراء عقد مخلفات', 'payment_receipt', 'إيصال الدفع', true),
  ('استلام الرخصة', 'license_copy', 'صورة الرخصة', true),
  ('تقديم واستلام شهادة الإشراف', 'supervision_certificate', 'شهادة الإشراف', true),
  ('تقديم واستلام التأمينات', 'insurance_certificate', 'شهادة التأمينات', true),
  ('التقديم على العداد الإنشائي', 'meter_application', 'إيصال تقديم العداد', true),
  ('تقديم ودفع واستلام تصريح الحفر', 'excavation_permit', 'تصريح الحفر', true),
  ('تصريح التعدين', 'mining_permit', 'تصريح التعدين', true),
  ('تصريح التعدين', 'army_inspection_note', 'متابعة معاينة الجيش', false)
ON CONFLICT (step_name, document_type) DO NOTHING;

ALTER TABLE public.workflow_document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_document_requirements_select" ON public.workflow_document_requirements;
CREATE POLICY "workflow_document_requirements_select" ON public.workflow_document_requirements
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflow_document_requirements_manage" ON public.workflow_document_requirements;
CREATE POLICY "workflow_document_requirements_manage" ON public.workflow_document_requirements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

DROP POLICY IF EXISTS "workflow_documents_select" ON public.workflow_documents;
CREATE POLICY "workflow_documents_select" ON public.workflow_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND w.assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workflow_documents_insert" ON public.workflow_documents;
CREATE POLICY "workflow_documents_insert" ON public.workflow_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND w.assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "workflow_documents_delete" ON public.workflow_documents;
CREATE POLICY "workflow_documents_delete" ON public.workflow_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR uploaded_by = auth.uid()
  );

DROP POLICY IF EXISTS "workflow_document_files_select" ON storage.objects;
CREATE POLICY "workflow_document_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'workflow-documents');

DROP POLICY IF EXISTS "workflow_document_files_insert" ON storage.objects;
CREATE POLICY "workflow_document_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'workflow-documents');

DROP POLICY IF EXISTS "workflow_document_files_delete" ON storage.objects;
CREATE POLICY "workflow_document_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'workflow-documents');

COMMENT ON TABLE public.workflow_documents IS
  'Stores workflow step document metadata; binary files live in Supabase Storage bucket workflow-documents.';
