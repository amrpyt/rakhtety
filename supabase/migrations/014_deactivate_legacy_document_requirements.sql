-- Keep old workflow-document requirements from blocking the newer real-office flow.
-- The new construction-meter step uses construction_meter_submission.
UPDATE public.workflow_document_requirements
SET is_active = false,
    updated_at = now()
WHERE step_name = 'التقديم على العداد الإنشائي'
  AND document_type = 'meter_application';
