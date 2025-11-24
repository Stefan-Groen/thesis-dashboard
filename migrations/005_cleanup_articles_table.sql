-- Migration: Clean up articles table
-- Purpose: Remove organization-specific columns that have been moved to article_classifications
-- Date: 2025-11-16
--
-- WARNING: Only run this AFTER you've verified migration 004 worked correctly!
-- This will permanently delete the classification columns from the articles table.

-- Remove the organization-specific columns
ALTER TABLE articles
DROP COLUMN IF EXISTS classification,
DROP COLUMN IF EXISTS explanation,
DROP COLUMN IF EXISTS advice,
DROP COLUMN IF EXISTS reasoning,
DROP COLUMN IF EXISTS starred,
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS classification_date;

-- Keep these columns in articles table (they're article-specific, not org-specific):
-- - id
-- - title
-- - link
-- - summary
-- - source
-- - date_published
-- - date_added

-- Add comment to document the simplified table
COMMENT ON TABLE articles IS 'Stores raw articles from RSS feeds (organization-agnostic)';
