DROP POLICY IF EXISTS "client_intake_document_requirements_manage" ON public.client_intake_document_requirements;

CREATE POLICY "client_intake_document_requirements_insert" ON public.client_intake_document_requirements
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "client_intake_document_requirements_update" ON public.client_intake_document_requirements
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE POLICY "client_intake_document_requirements_delete" ON public.client_intake_document_requirements
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));

CREATE INDEX IF NOT EXISTS idx_financial_events_created_by
  ON public.financial_events(created_by);

CREATE INDEX IF NOT EXISTS idx_workflow_documents_uploaded_by
  ON public.workflow_documents(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_assigned_to
  ON public.workflow_steps(assigned_to);
