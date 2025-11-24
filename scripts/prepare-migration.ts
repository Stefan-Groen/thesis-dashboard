/**
 * Migration Helper Script
 *
 * This script helps prepare the SQL for migrating to multi-tenant architecture.
 * It reads the company_case.txt file and generates the SQL INSERT statement.
 *
 * Usage:
 *   pnpm tsx scripts/prepare-migration.ts /path/to/company_case.txt
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'

function escapeSQL(text: string): string {
  // Escape single quotes for SQL
  return text.replace(/'/g, "''")
}

function generateMigrationSQL(organizationName: string, companyContext: string) {
  const escapedContext = escapeSQL(companyContext)

  const sql = `
-- Step 1: Insert organization
INSERT INTO organizations (name, company_context, is_active)
VALUES (
  '${escapeSQL(organizationName)}',
  '${escapedContext}',
  true
)
ON CONFLICT (name) DO UPDATE
SET company_context = EXCLUDED.company_context
RETURNING id;

-- Make note of the id returned above, then use it in the following statements:
-- (Replace <ORG_ID> with the actual id)

-- Step 2: Link existing users to this organization
UPDATE users
SET organization_id = <ORG_ID>
WHERE organization_id IS NULL;

-- Step 3: Migrate existing article classifications
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
  <ORG_ID>,
  classification,
  explanation,
  advice,
  reasoning,
  status,
  starred,
  classification_date,
  NOW()
FROM articles
WHERE classification IS NOT NULL
ON CONFLICT (article_id, organization_id) DO NOTHING;

-- Step 4: Verify migration
SELECT
  'Organizations' as table_name,
  COUNT(*) as row_count
FROM organizations
UNION ALL
SELECT
  'Users with organization',
  COUNT(*)
FROM users
WHERE organization_id IS NOT NULL
UNION ALL
SELECT
  'Article Classifications',
  COUNT(*)
FROM article_classifications;
`

  return sql
}

// Main execution
const args = process.argv.slice(2)
const companyContextPath = args[0] || '/Users/stefan/Documents/thesis-classifier/company_case.txt'
const organizationName = args[1] || 'Biclou Prestige'

try {
  console.log('🔍 Reading company context from:', companyContextPath)
  const companyContext = readFileSync(resolve(companyContextPath), 'utf-8')

  console.log('✅ Company context loaded successfully')
  console.log(`📝 Organization name: ${organizationName}`)
  console.log(`📄 Company context length: ${companyContext.length} characters`)
  console.log('\n' + '='.repeat(80))
  console.log('GENERATED SQL:')
  console.log('='.repeat(80) + '\n')

  const sql = generateMigrationSQL(organizationName, companyContext)
  console.log(sql)

  console.log('\n' + '='.repeat(80))
  console.log('📋 Copy the SQL above and run it in your Neon SQL Editor')
  console.log('='.repeat(80))

} catch (error) {
  console.error('❌ Error:', error instanceof Error ? error.message : error)
  console.error('\nUsage: pnpm tsx scripts/prepare-migration.ts [path-to-company-case.txt] [organization-name]')
  console.error('Example: pnpm tsx scripts/prepare-migration.ts /path/to/company_case.txt "Biclou Prestige"')
  process.exit(1)
}
