-- Migration: Migrate existing classification data to new multi-tenant structure
-- Purpose: Move existing article classifications to the article_classifications table
-- Date: 2025-11-16
--
-- IMPORTANT: This migration requires manual configuration!
-- You must first insert your organization into the organizations table,
-- then update the organization_id value below before running this script.

-- Step 1: Insert your default organization (CUSTOMIZE THIS!)
-- Uncomment and customize the following INSERT statement:

/*
INSERT INTO organizations (name, company_context, is_active)
VALUES (
  'Biclou Prestige',  -- Change this to your organization name
  'YOUR_COMPANY_CONTEXT_HERE',  -- Paste your company_case.txt content here
  true
)
ON CONFLICT (name) DO NOTHING
RETURNING id;
*/

-- Step 2: Link existing users to this organization (CUSTOMIZE THIS!)
-- Replace 1 with the actual organization_id from Step 1

/*
UPDATE users
SET organization_id = 1  -- Replace with actual organization_id
WHERE organization_id IS NULL;
*/

-- Step 3: Migrate existing article classifications to the new table
-- This copies classifications from articles table to article_classifications table
-- Replace 1 with the actual organization_id from Step 1

/*
INSERT INTO article_classifications (
  article_id,
  organization_id,
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  created_at
)
SELECT
  id,
  1,  -- Replace with actual organization_id
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  NOW()
FROM articles
WHERE classification IS NOT NULL  -- Only migrate classified articles
ON CONFLICT (article_id, organization_id) DO NOTHING;
*/

-- After running this migration manually:
-- 1. Verify the data was migrated correctly
-- 2. Check that article_classifications table has the expected number of rows
-- 3. Then proceed to migration 005 to clean up the articles table
