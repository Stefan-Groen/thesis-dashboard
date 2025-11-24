/**
 * Migration Script: Add organization_id to summaries table
 *
 * This script adds multi-tenant support to the summaries table
 * so each organization has their own summaries.
 *
 * Usage:
 *   pnpm tsx scripts/add-organization-to-summaries.ts
 */

// Load environment variables from .env.local file
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file from the dashboard directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { query } from '@/lib/db'

async function migrate() {
  try {
    console.log('\n🏢 Adding organization_id to summaries table')
    console.log('==========================================\n')

    // Add organization_id column
    console.log('🔄 Adding organization_id column...')
    await query(`
      ALTER TABLE summaries ADD COLUMN IF NOT EXISTS organization_id INTEGER
    `)
    console.log('✅ Successfully added organization_id column!')

    // Add foreign key constraint (if organizations table exists)
    console.log('🔄 Adding foreign key constraint...')
    try {
      await query(`
        ALTER TABLE summaries DROP CONSTRAINT IF EXISTS fk_summaries_organization;
        ALTER TABLE summaries ADD CONSTRAINT fk_summaries_organization
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      `)
      console.log('✅ Successfully added foreign key constraint!')
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('⚠️  Skipping foreign key constraint (organizations table not found)')
      } else {
        throw error
      }
    }

    // Drop old unique constraint
    console.log('🔄 Updating unique constraints...')
    await query(`
      ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_date_version_unique
    `)

    // Add new unique constraint
    await query(`
      ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_date_version_org_unique;
      ALTER TABLE summaries ADD CONSTRAINT summaries_date_version_org_unique
        UNIQUE (summary_date, version, organization_id)
    `)
    console.log('✅ Successfully updated unique constraints!')

    // Create index
    console.log('🔄 Creating index on organization_id...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_summaries_org_date ON summaries(organization_id, summary_date, version)
    `)
    console.log('✅ Successfully created index!')

    console.log('\n🎉 Migration completed successfully!\n')

  } catch (error: any) {
    console.error('\n❌ Error running migration:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the migration
migrate()
