/**
 * server/scripts/seed.js
 * Runs all SQL seed files in order.
 * Usage: node scripts/seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const fs   = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')

const SEEDS_DIR = path.join(__dirname, '../../database/seeds')

async function runSeeds() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME     || 'student_marks_portal',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  const files = fs.readdirSync(SEEDS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SEEDS_DIR, file), 'utf8')
    try {
      await conn.query(sql)
      console.log(`🌱 Seeded: ${file}`)
    } catch (err) {
      console.warn(`⚠️  Seed skipped (may already exist): ${file} — ${err.message}`)
    }
  }

  await conn.end()
  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Demo Credentials (all use password: Password@123):')
  console.log('   Super Admin : superadmin@portal.edu')
  console.log('   Admin       : admin@portal.edu')
  console.log('   HOD (CSE)   : hod.cse@portal.edu')
  console.log('   Professor   : prof.ramesh@portal.edu')
  console.log('   Student 1   : student01@portal.edu')
}

runSeeds().catch(err => { console.error(err); process.exit(1) })
