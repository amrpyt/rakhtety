CREATE TABLE IF NOT EXISTS public.client_intake_document_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_type TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.client_intake_document_requirements (document_type, label, is_required) VALUES
  ('handover_minutes', 'صورة محضر الاستلام', true),
  ('id_card', 'صورة البطاقة', true),
  ('power_of_attorney', 'توكيل', true),
  ('engineering_certificate', 'شهادة هندسية', true),
  ('measurement_sheet', 'كشف قياس', true),
  ('receipt_optional', 'صورة إيصال - اختياري لحالات التعلية', false)
ON CONFLICT (document_type) DO UPDATE
SET label = EXCLUDED.label,
    is_required = EXCLUDED.is_required,
    is_active = true,
    updated_at = NOW();

INSERT INTO public.workflow_step_configs (step_name, workflow_type, government_fee, office_profit) VALUES
  ('بيان الصلاحية', 'DEVICE_LICENSE', 150, 50),
  ('تقديم المجمعة العشرية للإسكان المميز', 'DEVICE_LICENSE', 300, 100),
  ('استلام المجمعة العشرية للإسكان المميز', 'DEVICE_LICENSE', 0, 50),
  ('تقديم ملف رخصة الجهاز', 'DEVICE_LICENSE', 200, 75),
  ('دفع إذن الرخصة', 'DEVICE_LICENSE', 500, 100),
  ('شراء عقد مخلفات', 'DEVICE_LICENSE', 250, 50),
  ('استلام رخصة الجهاز', 'DEVICE_LICENSE', 100, 50),
  ('تقديم شهادة الإشراف', 'EXCAVATION_PERMIT', 150, 50),
  ('استلام شهادة الإشراف', 'EXCAVATION_PERMIT', 50, 25),
  ('تقديم التأمينات الاجتماعية', 'EXCAVATION_PERMIT', 250, 75),
  ('استلام وثيقة التأمينات الاجتماعية', 'EXCAVATION_PERMIT', 100, 50),
  ('التقديم على العداد الإنشائي', 'EXCAVATION_PERMIT', 200, 60),
  ('استلام موافقة العداد الإنشائي', 'EXCAVATION_PERMIT', 50, 20),
  ('تقديم تصريح الحفر', 'EXCAVATION_PERMIT', 200, 75),
  ('دفع رسوم تصريح الحفر', 'EXCAVATION_PERMIT', 600, 125),
  ('استلام تصريح الحفر', 'EXCAVATION_PERMIT', 100, 50),
  ('تقديم تصريح التعدين', 'EXCAVATION_PERMIT', 200, 75),
  ('دفع رسوم تصريح التعدين', 'EXCAVATION_PERMIT', 800, 150),
  ('متابعة معاينة الجيش', 'EXCAVATION_PERMIT', 0, 100),
  ('استلام تصريح التعدين', 'EXCAVATION_PERMIT', 100, 50)
ON CONFLICT (step_name, workflow_type) DO UPDATE
SET government_fee = EXCLUDED.government_fee,
    office_profit = EXCLUDED.office_profit,
    is_active = true,
    updated_at = NOW();

INSERT INTO public.workflow_document_requirements (step_name, document_type, label, is_required) VALUES
  ('بيان الصلاحية', 'eligibility_statement', 'بيان الصلاحية', true),
  ('تقديم المجمعة العشرية للإسكان المميز', 'decade_collective_submission', 'إيصال تقديم المجمعة العشرية', true),
  ('استلام المجمعة العشرية للإسكان المميز', 'decade_collective_receipt', 'استلام المجمعة العشرية', true),
  ('تقديم ملف رخصة الجهاز', 'device_license_file_submission', 'إيصال تقديم ملف رخصة الجهاز', true),
  ('دفع إذن الرخصة', 'device_license_payment_receipt', 'إيصال دفع إذن الرخصة', true),
  ('شراء عقد مخلفات', 'waste_contract', 'عقد المخلفات', true),
  ('استلام رخصة الجهاز', 'device_license_copy', 'صورة رخصة الجهاز', true),
  ('تقديم شهادة الإشراف', 'supervision_submission', 'إيصال تقديم شهادة الإشراف', true),
  ('استلام شهادة الإشراف', 'supervision_certificate', 'شهادة الإشراف', true),
  ('تقديم التأمينات الاجتماعية', 'insurance_submission', 'إيصال تقديم التأمينات', true),
  ('استلام وثيقة التأمينات الاجتماعية', 'insurance_certificate', 'وثيقة التأمينات', true),
  ('التقديم على العداد الإنشائي', 'construction_meter_submission', 'إيصال التقديم على العداد الإنشائي', true),
  ('استلام موافقة العداد الإنشائي', 'construction_meter_approval', 'موافقة العداد الإنشائي', true),
  ('تقديم تصريح الحفر', 'excavation_submission', 'إيصال تقديم تصريح الحفر', true),
  ('دفع رسوم تصريح الحفر', 'excavation_payment_receipt', 'إيصال دفع تصريح الحفر', true),
  ('استلام تصريح الحفر', 'excavation_permit', 'تصريح الحفر', true),
  ('تقديم تصريح التعدين', 'mining_submission', 'إيصال تقديم تصريح التعدين', true),
  ('دفع رسوم تصريح التعدين', 'mining_payment_receipt', 'إيصال دفع تصريح التعدين', true),
  ('متابعة معاينة الجيش', 'army_inspection_status', 'حالة معاينة الجيش', true),
  ('استلام تصريح التعدين', 'mining_permit', 'تصريح التعدين', true)
ON CONFLICT (step_name, document_type) DO UPDATE
SET label = EXCLUDED.label,
    is_required = EXCLUDED.is_required,
    is_active = true,
    updated_at = NOW();

ALTER TABLE public.client_intake_document_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_intake_document_requirements_select" ON public.client_intake_document_requirements;
CREATE POLICY "client_intake_document_requirements_select" ON public.client_intake_document_requirements
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "client_intake_document_requirements_manage" ON public.client_intake_document_requirements;
CREATE POLICY "client_intake_document_requirements_manage" ON public.client_intake_document_requirements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')));
