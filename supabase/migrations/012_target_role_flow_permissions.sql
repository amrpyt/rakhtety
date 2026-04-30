DROP POLICY IF EXISTS "workflows_select" ON public.workflows;
CREATE POLICY "workflows_select" ON public.workflows
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflows_update" ON public.workflows;
CREATE POLICY "workflows_update" ON public.workflows
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')));

DROP POLICY IF EXISTS "workflow_steps_select" ON public.workflow_steps;
CREATE POLICY "workflow_steps_select" ON public.workflow_steps
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflow_steps_update" ON public.workflow_steps;
CREATE POLICY "workflow_steps_update" ON public.workflow_steps
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')));

DROP POLICY IF EXISTS "financial_events_insert" ON public.financial_events;
CREATE POLICY "financial_events_insert" ON public.financial_events
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager', 'employee')));

DROP POLICY IF EXISTS "financial_events_select" ON public.financial_events;
CREATE POLICY "financial_events_select" ON public.financial_events
  FOR SELECT TO authenticated
  USING (true);
