CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE workflow_type AS ENUM ('DEVICE_LICENSE', 'EXCAVATION_PERMIT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE workflow_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE step_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  type workflow_type NOT NULL,
  status workflow_status DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name TEXT NOT NULL,
  status step_status DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  completed_at TIMESTAMPTZ,
  fees NUMERIC(10,2) DEFAULT 0,
  profit NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow_id ON public.workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflows_client_id ON public.workflows(client_id);
CREATE INDEX IF NOT EXISTS idx_workflows_assigned_to ON public.workflows(assigned_to);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflows_select" ON public.workflows;
CREATE POLICY "workflows_select" ON public.workflows FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  OR assigned_to = auth.uid()
);

DROP POLICY IF EXISTS "workflows_insert" ON public.workflows;
CREATE POLICY "workflows_insert" ON public.workflows FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
);

DROP POLICY IF EXISTS "workflows_update" ON public.workflows;
CREATE POLICY "workflows_update" ON public.workflows FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  OR assigned_to = auth.uid()
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  OR assigned_to = auth.uid()
);

DROP POLICY IF EXISTS "workflows_delete" ON public.workflows;
CREATE POLICY "workflows_delete" ON public.workflows FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "workflow_steps_select" ON public.workflow_steps;
CREATE POLICY "workflow_steps_select" ON public.workflow_steps FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "workflow_steps_insert" ON public.workflow_steps;
CREATE POLICY "workflow_steps_insert" ON public.workflow_steps FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "workflow_steps_update" ON public.workflow_steps;
CREATE POLICY "workflow_steps_update" ON public.workflow_steps FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = workflow_id AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
      OR w.assigned_to = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "workflow_steps_delete" ON public.workflow_steps;
CREATE POLICY "workflow_steps_delete" ON public.workflow_steps FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.workflows w
    WHERE w.id = workflow_id
      AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
);

ALTER TABLE public.workflow_steps
  ADD COLUMN IF NOT EXISTS status step_status DEFAULT 'pending';

CREATE OR REPLACE FUNCTION public.enforce_workflow_step_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF OLD.status = 'pending' AND NEW.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Invalid transition from PENDING to %. Can only transition to IN_PROGRESS', NEW.status;
  END IF;

  IF OLD.status = 'in_progress' AND NEW.status NOT IN ('completed', 'blocked') THEN
    RAISE EXCEPTION 'Invalid transition from IN_PROGRESS to %. Can only transition to COMPLETED or BLOCKED', NEW.status;
  END IF;

  IF OLD.status = 'blocked' AND NEW.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Invalid transition from BLOCKED to %. Can only transition to IN_PROGRESS', NEW.status;
  END IF;

  IF OLD.status = 'completed' THEN
    RAISE EXCEPTION 'Invalid transition from COMPLETED. Completed steps are final and cannot be changed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_enforce_workflow_step_transition ON public.workflow_steps;
CREATE TRIGGER trg_enforce_workflow_step_transition
  BEFORE UPDATE OF status ON public.workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_workflow_step_transition();

COMMENT ON FUNCTION public.enforce_workflow_step_transition() IS
  'Enforces valid workflow step state transitions. Prevents invalid transitions such as completed->pending or pending->completed bypassing in_progress.';
