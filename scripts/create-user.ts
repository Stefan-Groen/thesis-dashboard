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

    // Get user details
    const username = await askQuestion('Enter username: ')
    const password = await askQuestion('Enter password: ')
    const fullName = await askQuestion('Enter full name (optional): ')
    const email = await askQuestion('Enter email (optional): ')

    // Validate required fields
    if (!username || !password) {
      console.error('\n❌ Error: Username and password are required!')
      rl.close()
      process.exit(1)
    }

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
      INSERT INTO users (username, password_hash, full_name, email)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, full_name, email, created_at;
    `

    const result = await query(sql, [
      username,
      passwordHash,
      fullName || null,
      email || null
    ])

    const user = result.rows[0]

    console.log('\n✅ User created successfully!\n')
    console.log('User Details:')
    console.log('─────────────')
    console.log(`ID:         ${user.id}`)
    console.log(`Username:   ${user.username}`)
    console.log(`Full Name:  ${user.full_name || 'Not provided'}`)
    console.log(`Email:      ${user.email || 'Not provided'}`)
    console.log(`Created:    ${user.created_at}`)
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
