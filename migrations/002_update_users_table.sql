-- Migration: Update users table to link to organizations
-- Purpose: Replace the VARCHAR organization field with a proper foreign key relationship
-- Date: 2025-11-16

-- First, let's check if the old organization column exists and rename it temporarily
DO $$
BEGIN
  -- If the old 'organization' VARCHAR column exists, rename it for data migration
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'organization'
  ) THEN
    ALTER TABLE users RENAME COLUMN organization TO organization_legacy;
  END IF;
END $$;

-- Add the new organization_id foreign key column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL;

-- Create index for faster organization lookups
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);

-- Add comment to document the column
COMMENT ON COLUMN users.organization_id IS 'Foreign key linking user to their organization/company';
