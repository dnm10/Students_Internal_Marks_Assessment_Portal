/**
 * config/db.js — MySQL connection pool using mysql2/promise
 */
const mysql  = require('mysql2/promise');
const logger = require('../utils/logger');

let pool;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'student_marks_portal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  timezone: '+05:30',
  charset: 'utf8mb4',
};

async function connectDB() {
  try {
    pool = mysql.createPool(dbConfig);

    // Test connection
    const conn = await pool.getConnection();
    logger.info(`Connected to MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    conn.release();

    return pool;
  } catch (err) {
    logger.error('MySQL connection failed:', err.message);
    throw err;
  }
}

function getPool() {
  if (!pool) throw new Error('Database not initialised. Call connectDB() first.');
  return pool;
}

async function getConnection() {
  return getPool().getConnection();
}

/**
 * Safe query execution
 */
async function query(sql, params = []) {
  try {
    // 🔥 Ensure params is always an array
    if (!Array.isArray(params)) {
      params = [params];
    }

    // 🔥 Log query for debugging
    // console.log("SQL:", sql);
    // console.log("PARAMS:", params);

    const [rows] = await getPool().execute(sql, params);
    return rows;
  } catch (err) {
    logger.error("DB QUERY ERROR:", err.message);
    logger.error("SQL:", sql);
    logger.error("PARAMS:", params);
    throw err;
  }
}

/**
 * Transaction wrapper
 */
async function withTransaction(fn) {
  const conn = await getConnection();

  try {
    await conn.beginTransaction();

    const result = await fn(conn);

    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    logger.error("TRANSACTION ERROR:", err.message);
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  connectDB,
  getPool,
  getConnection,
  query,
  withTransaction,
};