const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '123',
  database: 'KhoXaAp',
  port: 5432,
});

async function createTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS feedbacks (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      hamlet_id INTEGER,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'feedbacks' created successfully or already exists.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await pool.end();
  }
}

createTable();
