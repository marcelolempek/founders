-- Add resolved_by column to reports table
-- This column tracks which admin/moderator resolved the report

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.reports.resolved_by IS 'Admin/Moderador que resolveu a denúncia';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_resolved_by 
ON public.reports(resolved_by) 
WHERE resolved_by IS NOT NULL;
