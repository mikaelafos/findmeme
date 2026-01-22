const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool to PostgreSQL
// Support both DATABASE_URL (production) and individual credentials (local)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'findmeme',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
      }
);

// Test the connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

module.exports = pool;
