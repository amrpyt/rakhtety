-- Hardening from production-readiness audit.
-- Keeps helper functions internal, makes key RLS policies cheaper, and blocks duplicate workflows.

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path = public, auth, pg_temp';
    EXECUTE 'REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated';
  END IF;

  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = pg_catalog';
    EXECUTE 'REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_workflows_unique_client_type
  ON public.workflows(client_id, type);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_created_by
  ON public.dashboard_alerts(created_by);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "clients_insert" ON public.clients;
CREATE POLICY "clients_insert" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "clients_update" ON public.clients;
CREATE POLICY "clients_update" ON public.clients
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "clients_delete" ON public.clients;
CREATE POLICY "clients_delete" ON public.clients
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DO $$
BEGIN
  IF to_regclass('public.device_permits') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "device_permits_insert" ON public.device_permits';
    EXECUTE $policy$
      CREATE POLICY "device_permits_insert" ON public.device_permits
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "device_permits_update" ON public.device_permits';
    EXECUTE $policy$
      CREATE POLICY "device_permits_update" ON public.device_permits
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "device_permits_delete" ON public.device_permits';
    EXECUTE $policy$
      CREATE POLICY "device_permits_delete" ON public.device_permits
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;
  END IF;

  IF to_regclass('public.excavation_permits') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "excavation_permits_insert" ON public.excavation_permits';
    EXECUTE $policy$
      CREATE POLICY "excavation_permits_insert" ON public.excavation_permits
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "excavation_permits_update" ON public.excavation_permits';
    EXECUTE $policy$
      CREATE POLICY "excavation_permits_update" ON public.excavation_permits
        FOR UPDATE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "excavation_permits_delete" ON public.excavation_permits';
    EXECUTE $policy$
      CREATE POLICY "excavation_permits_delete" ON public.excavation_permits
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;
  END IF;

  IF to_regclass('public.permit_logs') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "permit_logs_insert" ON public.permit_logs';
    EXECUTE $policy$
      CREATE POLICY "permit_logs_insert" ON public.permit_logs
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;
  END IF;

  IF to_regclass('public.permit_files') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "permit_files_insert" ON public.permit_files';
    EXECUTE $policy$
      CREATE POLICY "permit_files_insert" ON public.permit_files
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;

    EXECUTE 'DROP POLICY IF EXISTS "permit_files_delete" ON public.permit_files';
    EXECUTE $policy$
      CREATE POLICY "permit_files_delete" ON public.permit_files
        FOR DELETE TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('employee', 'admin')
          )
        )
    $policy$;
  END IF;
END $$;

DROP POLICY IF EXISTS "workflows_select" ON public.workflows;
CREATE POLICY "workflows_select" ON public.workflows
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR assigned_to = (select auth.uid())
  );

DROP POLICY IF EXISTS "workflows_insert" ON public.workflows;
CREATE POLICY "workflows_insert" ON public.workflows
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflows_update" ON public.workflows;
CREATE POLICY "workflows_update" ON public.workflows
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR assigned_to = (select auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR assigned_to = (select auth.uid())
  );

DROP POLICY IF EXISTS "workflows_delete" ON public.workflows;
CREATE POLICY "workflows_delete" ON public.workflows
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "workflow_steps_select" ON public.workflow_steps;
CREATE POLICY "workflow_steps_select" ON public.workflow_steps
  FOR SELECT TO authenticated
  USING (
    assigned_to = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND w.assigned_to = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "workflow_steps_insert" ON public.workflow_steps;
CREATE POLICY "workflow_steps_insert" ON public.workflow_steps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('admin', 'manager')
          )
          OR w.assigned_to = (select auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "workflow_steps_update" ON public.workflow_steps;
CREATE POLICY "workflow_steps_update" ON public.workflow_steps
  FOR UPDATE TO authenticated
  USING (
    assigned_to = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND w.assigned_to = (select auth.uid())
    )
  )
  WITH CHECK (
    assigned_to = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND w.assigned_to = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "workflow_steps_delete" ON public.workflow_steps;
CREATE POLICY "workflow_steps_delete" ON public.workflow_steps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = (select auth.uid())
            AND role = 'admin'
        )
    )
  );

DROP POLICY IF EXISTS "employees_insert" ON public.employees;
CREATE POLICY "employees_insert" ON public.employees
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "employees_update" ON public.employees;
CREATE POLICY "employees_update" ON public.employees
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "employees_delete" ON public.employees;
CREATE POLICY "employees_delete" ON public.employees
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "workflow_step_configs_insert" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_insert" ON public.workflow_step_configs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_step_configs_update" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_update" ON public.workflow_step_configs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_step_configs_delete" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_delete" ON public.workflow_step_configs
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "workflow_document_requirements_manage" ON public.workflow_document_requirements;

DROP POLICY IF EXISTS "workflow_document_requirements_insert" ON public.workflow_document_requirements;
CREATE POLICY "workflow_document_requirements_insert" ON public.workflow_document_requirements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_document_requirements_update" ON public.workflow_document_requirements;
CREATE POLICY "workflow_document_requirements_update" ON public.workflow_document_requirements
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_document_requirements_delete" ON public.workflow_document_requirements;
CREATE POLICY "workflow_document_requirements_delete" ON public.workflow_document_requirements
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "workflow_documents_select" ON public.workflow_documents;
CREATE POLICY "workflow_documents_select" ON public.workflow_documents
  FOR SELECT TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND (
          EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid())
              AND role IN ('admin', 'manager')
          )
          OR w.assigned_to = (select auth.uid())
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps ws
      WHERE ws.id = workflow_step_id
        AND ws.assigned_to = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "workflow_documents_insert" ON public.workflow_documents;
CREATE POLICY "workflow_documents_insert" ON public.workflow_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = (select auth.uid())
    AND (
      EXISTS (
        SELECT 1 FROM public.workflows w
        WHERE w.id = workflow_id
          AND (
            EXISTS (
              SELECT 1 FROM public.profiles
              WHERE id = (select auth.uid())
                AND role IN ('admin', 'manager')
            )
            OR w.assigned_to = (select auth.uid())
          )
      )
      OR EXISTS (
        SELECT 1 FROM public.workflow_steps ws
        WHERE ws.id = workflow_step_id
          AND ws.assigned_to = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "workflow_documents_delete" ON public.workflow_documents;
CREATE POLICY "workflow_documents_delete" ON public.workflow_documents
  FOR DELETE TO authenticated
  USING (
    uploaded_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "financial_events_select" ON public.financial_events;
CREATE POLICY "financial_events_select" ON public.financial_events
  FOR SELECT TO authenticated
  USING (
    created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id
        AND w.assigned_to = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.workflow_steps ws
      WHERE ws.id = workflow_step_id
        AND ws.assigned_to = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "financial_events_insert" ON public.financial_events;
CREATE POLICY "financial_events_insert" ON public.financial_events
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (select auth.uid())
          AND role IN ('admin', 'manager')
      )
      OR EXISTS (
        SELECT 1 FROM public.workflows w
        WHERE w.id = workflow_id
          AND w.assigned_to = (select auth.uid())
      )
      OR EXISTS (
        SELECT 1 FROM public.workflow_steps ws
        WHERE ws.id = workflow_step_id
          AND ws.assigned_to = (select auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "dashboard_alerts_select" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_select" ON public.dashboard_alerts
  FOR SELECT TO authenticated
  USING (
    recipient_id = (select auth.uid())
    OR created_by = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "dashboard_alerts_insert" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_insert" ON public.dashboard_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "dashboard_alerts_update" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_update" ON public.dashboard_alerts
  FOR UPDATE TO authenticated
  USING (
    recipient_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    recipient_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "client_intake_document_requirements_insert" ON public.client_intake_document_requirements;
CREATE POLICY "client_intake_document_requirements_insert" ON public.client_intake_document_requirements
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "client_intake_document_requirements_update" ON public.client_intake_document_requirements;
CREATE POLICY "client_intake_document_requirements_update" ON public.client_intake_document_requirements
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "client_intake_document_requirements_delete" ON public.client_intake_document_requirements;
CREATE POLICY "client_intake_document_requirements_delete" ON public.client_intake_document_requirements
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_action_logs_select" ON public.workflow_action_logs;
CREATE POLICY "workflow_action_logs_select" ON public.workflow_action_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );

DROP POLICY IF EXISTS "workflow_action_logs_insert" ON public.workflow_action_logs;
CREATE POLICY "workflow_action_logs_insert" ON public.workflow_action_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    actor_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid())
        AND role IN ('admin', 'manager')
    )
  );
