-- Add PDF attachment fields to notes
ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_name TEXT;