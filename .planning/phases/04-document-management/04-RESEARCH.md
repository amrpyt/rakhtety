# Phase 4: Document Management - Research

**Phase:** 04-document-management
**Date:** 2026-04-28
**Status:** Research complete

## Summary

Use Supabase Storage for files and a Postgres metadata table for searchable document records.

Why:

- Storage is for the actual file bytes.
- Postgres table is for file type, uploader, step link, and validation.
- Required document rules belong in a config table, not hardcoded only in UI.

## Implementation Notes

- `workflow_documents` stores metadata.
- `workflow_document_requirements` stores required/optional rules.
- Service validation blocks step completion if required document types are missing.
- Storage and database policies must include `TO authenticated`.

## RESEARCH COMPLETE
