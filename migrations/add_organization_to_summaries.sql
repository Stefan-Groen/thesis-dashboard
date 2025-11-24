-- Add multi-tenant support to summaries table
-- This ensures each organization has their own summaries

-- Add organization_id column
ALTER TABLE summaries ADD COLUMN IF NOT EXISTS organization_id INTEGER;

-- Add foreign key constraint
ALTER TABLE summaries ADD CONSTRAINT fk_summaries_organization
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Drop old unique constraint (date + version only)
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_date_version_unique;

-- Add new unique constraint (date + version + organization)
ALTER TABLE summaries ADD CONSTRAINT summaries_date_version_org_unique
  UNIQUE (summary_date, version, organization_id);

-- Create index for efficient querying by organization
CREATE INDEX IF NOT EXISTS idx_summaries_org_date ON summaries(organization_id, summary_date, version);

-- Add comment
COMMENT ON COLUMN summaries.organization_id IS 'Links summary to specific organization for multi-tenant isolation';
