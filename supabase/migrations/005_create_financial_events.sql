CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE financial_event_type AS ENUM ('payment', 'refund', 'adjustment');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.financial_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type financial_event_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_method TEXT,
  reference_number TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_events_workflow_id
  ON public.financial_events(workflow_id);

CREATE INDEX IF NOT EXISTS idx_financial_events_workflow_step_id
  ON public.financial_events(workflow_step_id);

CREATE INDEX IF NOT EXISTS idx_financial_events_client_id
  ON public.financial_events(client_id);

CREATE INDEX IF NOT EXISTS idx_financial_events_created_at
  ON public.financial_events(created_at DESC);

ALTER TABLE public.financial_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financial_events_select" ON public.financial_events;
CREATE POLICY "financial_events_select" ON public.financial_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND w.assigned_to = auth.uid()
    )
  );

DROP POLICY IF EXISTS "financial_events_insert" ON public.financial_events;
CREATE POLICY "financial_events_insert" ON public.financial_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
    OR EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND w.assigned_to = auth.uid()
    )
  );

COMMENT ON TABLE public.financial_events IS
  'Append-only payment, refund, and adjustment ledger for workflow finances.';
