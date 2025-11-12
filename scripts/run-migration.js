const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    const migrationPath = path.join(__dirname, '../migrations/add_versioning_to_summaries.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    console.log('Running migration: add_versioning_to_summaries.sql')
    await pool.query(sql)
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
