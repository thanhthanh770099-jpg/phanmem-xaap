const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123',
  database: 'KhoXaAp',
  port: 5432,
});

async function updateTable() {
  const query = `
    ALTER TABLE citizen_feedbacks
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS response_note TEXT,
    ADD COLUMN IF NOT EXISTS response_file_url TEXT,
    ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP;
  `;
  try {
    await pool.query(query);
    console.log("Table 'citizen_feedbacks' updated successfully.");
  } catch (err) {
    console.error("Error updating table:", err);
  } finally {
    await pool.end();
  }
}

updateTable();
