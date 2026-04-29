UPDATE storage.buckets
SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']
WHERE id = 'workflow-documents';

DROP POLICY IF EXISTS "workflow_document_files_select" ON storage.objects;
CREATE POLICY "workflow_document_files_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'workflow-documents'
    AND EXISTS (
      SELECT 1
      FROM public.workflow_documents d
      JOIN public.workflows w ON w.id = d.workflow_id
      WHERE d.storage_path = name
        AND (
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
          OR w.assigned_to = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "workflow_document_files_insert" ON storage.objects;
CREATE POLICY "workflow_document_files_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'workflow-documents'
    AND EXISTS (
      SELECT 1
      FROM public.workflow_steps ws
      JOIN public.workflows w ON w.id = ws.workflow_id
      WHERE w.id::text = (storage.foldername(name))[1]
        AND ws.id::text = (storage.foldername(name))[2]
        AND ws.workflow_id = w.id
        AND (
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
          OR w.assigned_to = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS "workflow_document_files_delete" ON storage.objects;
CREATE POLICY "workflow_document_files_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'workflow-documents'
    AND EXISTS (
      SELECT 1
      FROM public.workflow_documents d
      JOIN public.workflows w ON w.id = d.workflow_id
      WHERE d.storage_path = name
        AND (
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
          OR d.uploaded_by = auth.uid()
          OR w.assigned_to = auth.uid()
        )
    )
  );
