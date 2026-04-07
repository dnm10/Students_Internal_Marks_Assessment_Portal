/**
 * server/scripts/migrate.js
 * Runs all SQL migration files in order against the configured MySQL database.
 * Usage: node scripts/migrate.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const fs   = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations')

async function runMigrations() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  // Create database if not exists
  const dbName = process.env.DB_NAME || 'student_marks_portal'
  await conn.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
  await conn.execute(`USE \`${dbName}\``)

  // Track executed migrations
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const [executed] = await conn.execute(`SELECT filename FROM _migrations`)
  const executedSet = new Set(executed.map(r => r.filename))

  // Read and sort migration files
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  let ran = 0
  for (const file of files) {
    if (executedSet.has(file)) {
      console.log(`⏭  Skipping (already run): ${file}`)
      continue
    }
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
    try {
      await conn.execute(sql)
      await conn.execute(`INSERT INTO _migrations (filename) VALUES (?)`, [file])
      console.log(`✅ Migrated: ${file}`)
      ran++
    } catch (err) {
      console.error(`❌ Failed: ${file}`)
      console.error(err.message)
      process.exit(1)
    }
  }

  await conn.end()
  console.log(`\n🎉 Migration complete. ${ran} file(s) run.`)
}

runMigrations().catch(err => { console.error(err); process.exit(1) })
