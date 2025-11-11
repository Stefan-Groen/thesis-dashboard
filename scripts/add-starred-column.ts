/**
 * Migration Script: Add starred column to articles table
 *
 * This script adds a 'starred' boolean column to the articles table
 * so managers can mark important articles for later reference.
 *
 * Usage:
 *   npx tsx scripts/add-starred-column.ts
 */

// Load environment variables from .env.local file
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file from the dashboard directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { query } from '@/lib/db'

async function migrate() {
  try {
    console.log('\n⭐ Adding starred column to articles table')
    console.log('==========================================\n')

    // Add the starred column with default value of false
    console.log('🔄 Adding starred column...')
    await query(`
      ALTER TABLE articles
      ADD COLUMN IF NOT EXISTS starred BOOLEAN DEFAULT false NOT NULL
    `)

    console.log('✅ Successfully added starred column!')

    // Create an index on starred column for faster queries
    console.log('🔄 Creating index on starred column...')
    await query(`
      CREATE INDEX IF NOT EXISTS idx_articles_starred ON articles(starred)
    `)

    console.log('✅ Successfully created index on starred column!')
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
