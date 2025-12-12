/**
 * Database Connection Utility
 *
 * This module handles PostgreSQL database connections using the 'pg' library.
 * Think of it like psycopg in Python!
 *
 * Key Concepts:
 * - Pool: A collection of database connections that can be reused
 *   (more efficient than creating a new connection every time)
 * - Singleton: We create ONE pool for the entire application
 *   (like creating a global connection in Python)
 */

import { Pool } from 'pg'

// TypeScript Type Definitions (like Python's type hints!)
// These help catch errors and provide autocomplete
let pool: Pool | null = null

/**
 * Get a database connection pool
 *
 * Python equivalent:
 * ```python
 * CONN_STRING = os.getenv('DATABASE_URL')
 * conn = psycopg.connect(CONN_STRING)
 * ```
 *
 * @returns PostgreSQL connection pool
 */
export function getPool(): Pool {
  // If pool already exists, reuse it (singleton pattern)
  if (pool) {
    return pool
  }

  // Get the DATABASE_URL from environment variables
  const connectionString = process.env.DATABASE_URL

  // Error handling: make sure DATABASE_URL is set
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please create a .env.local file with your database connection string.'
    )
  }

  // Create a new connection pool
  // This is like creating a psycopg connection, but reusable!
  pool = new Pool({
    connectionString,
    // Optional: configure connection pool
    max: 20, // Maximum number of connections in pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Timeout after 10 seconds if no connection available
    // SSL configuration for production databases (required for most hosted Postgres)
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  })

  // Log successful pool creation (useful for debugging)
  console.log('✅ Database connection pool created')

  return pool
}

/**
 * Execute a database query
 *
 * Python equivalent:
 * ```python
 * cursor.execute("SELECT * FROM articles WHERE id = %s", (article_id,))
 * result = cursor.fetchall()
 * ```
 *
 * @param text - SQL query string
 * @param params - Query parameters (prevents SQL injection!)
 * @returns Query result
 */
export async function query(text: string, params?: any[]) {
  const pool = getPool()

  // Execute the query
  // The pool automatically handles getting/releasing connections
  const result = await pool.query(text, params)

  return result
}

/**
 * Close the database pool
 * (Call this when shutting down the application)
 */
export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('🔌 Database connection pool closed')
  }
}
