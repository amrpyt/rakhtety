DROP POLICY IF EXISTS "workflow_documents_select" ON public.workflow_documents;
CREATE POLICY "workflow_documents_select" ON public.workflow_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'employee')
    )
  );

DROP POLICY IF EXISTS "workflow_documents_insert" ON public.workflow_documents;
CREATE POLICY "workflow_documents_insert" ON public.workflow_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'manager', 'employee')
    )
  );
