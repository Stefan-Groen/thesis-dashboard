/**
 * User Creation Script
 *
 * This script allows you to create users with hashed passwords.
 * Run it from the command line to add users to your database.
 *
 * Usage:
 *   npx tsx scripts/create-user.ts
 */

// Load environment variables from .env.local file
import dotenv from 'dotenv'
import path from 'path'

// Load .env.local file from the dashboard directory
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })

import bcrypt from 'bcrypt'
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

async function createUser() {
  try {
    console.log('\n🔐 User Creation Script')
    console.log('========================\n')

    // First, fetch and display available organizations
    console.log('📋 Available organizations:')
    const orgSql = `
      SELECT id, name
      FROM organizations
      ORDER BY name ASC;
    `
    const orgResult = await query(orgSql)

    if (orgResult.rows.length === 0) {
      console.error('\n❌ Error: No organizations found!')
      console.error('   Please create an organization first using: npx tsx scripts/create-organization.ts')
      rl.close()
      process.exit(1)
    }

    console.log('─────────────────────────────────────────')
    orgResult.rows.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name} (ID: ${org.id})`)
    })
    console.log('─────────────────────────────────────────\n')

    // Get user details
    const username = await askQuestion('Enter username: ')
    const password = await askQuestion('Enter password: ')
    const fullName = await askQuestion('Enter full name (optional): ')
    const email = await askQuestion('Enter email (optional): ')

    // Get organization selection
    const orgChoice = await askQuestion(`Select organization (1-${orgResult.rows.length}): `)

    // Validate required fields
    if (!username || !password) {
      console.error('\n❌ Error: Username and password are required!')
      rl.close()
      process.exit(1)
    }

    // Validate organization selection
    const orgIndex = parseInt(orgChoice) - 1
    if (isNaN(orgIndex) || orgIndex < 0 || orgIndex >= orgResult.rows.length) {
      console.error('\n❌ Error: Invalid organization selection!')
      rl.close()
      process.exit(1)
    }

    const selectedOrg = orgResult.rows[orgIndex]

    // Validate username (only letters, numbers, dots, underscores)
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      console.error('\n❌ Error: Username can only contain letters, numbers, dots, and underscores!')
      rl.close()
      process.exit(1)
    }

    // Check password strength
    if (password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters long!')
      rl.close()
      process.exit(1)
    }

    console.log('\n🔒 Hashing password...')

    // Hash the password (bcrypt automatically adds salt)
    // Salt rounds = 10 (good balance between security and speed)
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('💾 Saving user to database...')

    // Insert user into database
    const sql = `
      INSERT INTO users (username, password_hash, full_name, email, organization_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, email, organization_id, created_at;
    `

    const result = await query(sql, [
      username,
      passwordHash,
      fullName || null,
      email || null,
      selectedOrg.id
    ])

    const user = result.rows[0]

    console.log('\n✅ User created successfully!\n')
    console.log('User Details:')
    console.log('─────────────────────────')
    console.log(`ID:           ${user.id}`)
    console.log(`Username:     ${user.username}`)
    console.log(`Full Name:    ${user.full_name || 'Not provided'}`)
    console.log(`Email:        ${user.email || 'Not provided'}`)
    console.log(`Organization: ${selectedOrg.name}`)
    console.log(`Created:      ${user.created_at}`)
    console.log('\n🎉 You can now use these credentials to log in!\n')

  } catch (error: any) {
    console.error('\n❌ Error creating user:', error.message)

    // Check for common errors
    if (error.code === '23505') {
      console.error('   This username already exists. Please choose a different username.')
    }

    process.exit(1)
  } finally {
    rl.close()
    process.exit(0)
  }
}

// Run the script
createUser()
