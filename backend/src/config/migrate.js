// Run with: npm run migrate
// Applies schema.sql to the database at DATABASE_URL
const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const client = await pool.connect();
  try {
    console.log('Applying schema.sql...');
    await client.query(sql);
    console.log('✅ Schema applied successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
