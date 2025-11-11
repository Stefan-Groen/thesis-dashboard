/**
 * Migration Script: Add last_dashboard_visit column to users table
 *
 * This script adds a 'last_dashboard_visit' TIMESTAMPTZ column to track
 * when users last visited the dashboard, allowing us to show "new since last visit" counts.
 *
 * Usage:
 *   npx tsx scripts/add-last-dashboard-visit.ts
 */

import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file from the dashboard directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { query } from '@/lib/db'

async function migrate() {
  try {
    console.log('\n📊 Adding last_dashboard_visit column to users table')
    console.log('==========================================\n')

    // Add the last_dashboard_visit column
    console.log('🔄 Adding last_dashboard_visit column...')
    await query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS last_dashboard_visit TIMESTAMPTZ
    `)

    console.log('✅ Successfully added last_dashboard_visit column!')

    // Initialize with current timestamp for existing users (optional)
    console.log('🔄 Initializing last_dashboard_visit for existing users...')
    await query(`
      UPDATE users
      SET last_dashboard_visit = COALESCE(last_login, NOW())
      WHERE last_dashboard_visit IS NULL
    `)

    console.log('✅ Successfully initialized last_dashboard_visit!')
    console.log('\n🎉 Migration completed successfully!\n')

  } catch (error: any) {
    console.error('\n❌ Error running migration:', error.message)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run the migration
migrate()
