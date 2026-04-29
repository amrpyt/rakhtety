CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.workflow_step_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_name TEXT NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('DEVICE_LICENSE', 'EXCAVATION_PERMIT')),
  government_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  office_profit DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'EGP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(step_name, workflow_type)
);

CREATE INDEX IF NOT EXISTS idx_workflow_step_configs_lookup
  ON public.workflow_step_configs(workflow_type, step_name)
  WHERE is_active = true;

INSERT INTO public.workflow_step_configs (step_name, workflow_type, government_fee, office_profit) VALUES
  ('بيان الصلاحية', 'DEVICE_LICENSE', 150, 50),
  ('تقديم المجمعة العشرية للإسكان المميز', 'DEVICE_LICENSE', 300, 100),
  ('تقديم الملف', 'DEVICE_LICENSE', 200, 75),
  ('دفع إذن الرخصة وشراء عقد مخلفات', 'DEVICE_LICENSE', 500, 150),
  ('استلام الرخصة', 'DEVICE_LICENSE', 100, 50)
ON CONFLICT (step_name, workflow_type) DO NOTHING;

INSERT INTO public.workflow_step_configs (step_name, workflow_type, government_fee, office_profit) VALUES
  ('تقديم واستلام شهادة الإشراف', 'EXCAVATION_PERMIT', 200, 75),
  ('تقديم واستلام التأمينات', 'EXCAVATION_PERMIT', 350, 100),
  ('التقديم على العداد الإنشائي', 'EXCAVATION_PERMIT', 250, 80),
  ('تقديم ودفع واستلام تصريح الحفر', 'EXCAVATION_PERMIT', 600, 200),
  ('تصريح التعدين', 'EXCAVATION_PERMIT', 800, 250)
ON CONFLICT (step_name, workflow_type) DO NOTHING;

CREATE OR REPLACE FUNCTION public.update_workflow_step_configs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_update_workflow_step_configs_timestamp ON public.workflow_step_configs;
CREATE TRIGGER trg_update_workflow_step_configs_timestamp
  BEFORE UPDATE ON public.workflow_step_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workflow_step_configs_timestamp();

ALTER TABLE public.workflow_step_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workflow_step_configs_select" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_select" ON public.workflow_step_configs
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "workflow_step_configs_insert" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_insert" ON public.workflow_step_configs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "workflow_step_configs_update" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_update" ON public.workflow_step_configs
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

DROP POLICY IF EXISTS "workflow_step_configs_delete" ON public.workflow_step_configs;
CREATE POLICY "workflow_step_configs_delete" ON public.workflow_step_configs
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

COMMENT ON TABLE public.workflow_step_configs IS
  'Stores per-step financial configuration for workflow steps: government_fee and office_profit per step type.';
