-- Migration: Create organizations table
-- Purpose: Store company information and their business context for multi-tenant support
-- Date: 2025-11-16

CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  company_context TEXT NOT NULL,  -- Stores the company case (previously in company_case.txt)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name);

-- Create index for active organizations
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active);

-- Add comment to document the table
COMMENT ON TABLE organizations IS 'Stores company/organization information for multi-tenant dashboard';
COMMENT ON COLUMN organizations.company_context IS 'The business context used for article classification (replaces company_case.txt file)';
