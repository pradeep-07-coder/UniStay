const { Pool } = require('pg');
require('dotenv').config();

// Debug check to make sure variables are actually loaded
if (!process.env.PG_PASSWORD) {
  console.error("⚠️ WARNING: PG_PASSWORD is missing or undefined in process.env!");
}

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  // 1. Force password to be a string (fixes SASL error)
  password: String(process.env.PG_PASSWORD || ''),
  // 2. Convert port to a number
  port: Number(process.env.PG_PORT) || 5432,
});

pool.on('connect', () => {
  console.log('⚡ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};