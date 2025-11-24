-- Migration: Create article_classifications junction table
-- Purpose: Enable many-to-many relationship between articles and organizations
--          One article can have different classifications for different organizations
-- Date: 2025-11-16

CREATE TABLE IF NOT EXISTS article_classifications (
  id SERIAL PRIMARY KEY,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Classification fields (moved from articles table)
  classification VARCHAR(50),
  explanation TEXT,
  advice TEXT,
  reasoning TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  starred BOOLEAN DEFAULT FALSE,

  -- Timestamps
  classification_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one classification per article per organization
  CONSTRAINT unique_article_org UNIQUE(article_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_classifications_article_id ON article_classifications(article_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_organization_id ON article_classifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_article_classifications_status ON article_classifications(status);
CREATE INDEX IF NOT EXISTS idx_article_classifications_classification ON article_classifications(classification);
CREATE INDEX IF NOT EXISTS idx_article_classifications_starred ON article_classifications(starred);
CREATE INDEX IF NOT EXISTS idx_article_classifications_date ON article_classifications(classification_date);

-- Add comments to document the table
COMMENT ON TABLE article_classifications IS 'Stores article classifications per organization (multi-tenant support)';
COMMENT ON CONSTRAINT unique_article_org ON article_classifications IS 'Ensures each organization classifies each article only once';
