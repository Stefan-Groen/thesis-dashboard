-- Add versioning support to summaries table
-- This allows multiple summaries per date with auto-incrementing versions

-- First, add version column with default value of 1
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Drop the old unique constraint on summary_date
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_summary_date_key;

-- Add new unique constraint on the combination of date and version
ALTER TABLE summaries ADD CONSTRAINT summaries_date_version_unique UNIQUE (summary_date, version);

-- Create index for efficient querying by date
CREATE INDEX IF NOT EXISTS idx_summaries_date_version ON summaries(summary_date, version);
