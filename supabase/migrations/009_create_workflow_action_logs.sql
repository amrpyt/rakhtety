CREATE TABLE workflow_action_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  workflow_step_id UUID NOT NULL REFERENCES workflow_steps(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('emergency_complete', 'move_back')),
  reason TEXT NOT NULL CHECK (length(trim(reason)) > 0),
  actor_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_action_logs_workflow_id ON workflow_action_logs(workflow_id);
CREATE INDEX idx_workflow_action_logs_workflow_step_id ON workflow_action_logs(workflow_step_id);
CREATE INDEX idx_workflow_action_logs_actor_id ON workflow_action_logs(actor_id);

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

  IF OLD.status = 'in_progress' AND NEW.status NOT IN ('pending', 'completed', 'blocked') THEN
    RAISE EXCEPTION 'Invalid transition from IN_PROGRESS to %. Can only transition to PENDING, COMPLETED or BLOCKED', NEW.status;
  END IF;

  IF OLD.status = 'blocked' AND NEW.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Invalid transition from BLOCKED to %. Can only transition to IN_PROGRESS', NEW.status;
  END IF;

  IF OLD.status = 'completed' AND NEW.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Invalid transition from COMPLETED to %. Can only move back to IN_PROGRESS', NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

ALTER TABLE workflow_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workflow_action_logs_select" ON workflow_action_logs
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "workflow_action_logs_insert" ON workflow_action_logs
  FOR INSERT TO authenticated WITH CHECK (true);
