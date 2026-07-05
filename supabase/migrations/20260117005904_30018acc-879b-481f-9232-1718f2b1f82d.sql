-- Create (or update) the PDFs storage bucket as PRIVATE
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdfs', 'pdfs', false)
ON CONFLICT (id) DO UPDATE
SET public = false;