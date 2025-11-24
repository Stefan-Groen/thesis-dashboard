/**
 * Organization Creation Script
 *
 * This script allows you to create organizations in the multi-tenant system.
 * Run it from the command line to add organizations to your database.
 *
 * Usage:
 *   npx tsx scripts/create-organization.ts
 */

// Load environment variables from .env.local file
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file from the dashboard directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import { query } from '@/lib/db'
import readline from 'readline'

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Helper function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function createOrganization() {
  try {
    console.log('\n🏢 Organization Creation Script')
    console.log('================================\n')

    // First, show existing organizations
    console.log('📋 Existing organizations:')
    const listSql = `
      SELECT id, name, created_at
      FROM organizations
      ORDER BY created_at DESC;
    `
    const listResult = await query(listSql)

    if (listResult.rows.length === 0) {
      console.log('   No organizations found in the database.\n')
    } else {
      console.log('─────────────────────────────────────────')
      listResult.rows.forEach((org) => {
        console.log(`ID: ${org.id} | Name: ${org.name}`)
        console.log(`   Created: ${new Date(org.created_at).toLocaleDateString()}`)
        console.log('─────────────────────────────────────────')
      })
      console.log('')
    }

    // Get organization details
    const name = await askQuestion('Enter organization name: ')

    console.log('\n📝 Company Context Information:')
    console.log('   This is the business description used to classify articles.')
    console.log('   Describe the company, its products/services, competitors, and relevant context.\n')

    const companyContext = await askQuestion('Enter company context (or paste multi-line text, press Enter when done): ')

    // Validate required fields
    if (!name || name.trim() === '') {
      console.error('\n❌ Error: Organization name is required!')
      rl.close()
      process.exit(1)
    }

    if (!companyContext || companyContext.trim() === '') {
      console.error('\n❌ Error: Company context is required!')
      rl.close()
      process.exit(1)
    }

    console.log('\n💾 Saving organization to database...')

    // Insert organization into database
    const sql = `
      INSERT INTO organizations (name, company_context)
      VALUES ($1, $2)
      RETURNING id, name, created_at;
    `

    const result = await query(sql, [name.trim(), companyContext.trim()])

    const org = result.rows[0]

    console.log('\n✅ Organization created successfully!\n')
    console.log('Organization Details:')
    console.log('─────────────────────')
    console.log(`ID:       ${org.id}`)
    console.log(`Name:     ${org.name}`)
    console.log(`Created:  ${org.created_at}`)
    console.log('\n🎉 You can now assign users to this organization!\n')

  } catch (error: any) {
    console.error('\n❌ Error creating organization:', error.message)

    // Check for common errors
    if (error.code === '23505') {
      console.error('   This organization name already exists. Please choose a different name.')
    }

    process.exit(1)
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Run the script
createOrganization()
