CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE dashboard_alert_status AS ENUM ('unread', 'read');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.dashboard_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'bottleneck',
  message TEXT NOT NULL,
  status dashboard_alert_status NOT NULL DEFAULT 'unread',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_recipient_status
  ON public.dashboard_alerts(recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_workflow_id
  ON public.dashboard_alerts(workflow_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_step_id
  ON public.dashboard_alerts(workflow_step_id);

CREATE INDEX IF NOT EXISTS idx_dashboard_alerts_created_by
  ON public.dashboard_alerts(created_by);

ALTER TABLE public.dashboard_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_alerts_select" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_select" ON public.dashboard_alerts
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "dashboard_alerts_insert" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_insert" ON public.dashboard_alerts
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "dashboard_alerts_update" ON public.dashboard_alerts;
CREATE POLICY "dashboard_alerts_update" ON public.dashboard_alerts
  FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  )
  WITH CHECK (
    recipient_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

COMMENT ON TABLE public.dashboard_alerts IS
  'In-app manager alerts for bottlenecks and dashboard follow-up.';
