const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

async function addEmailColumn() {
  const query = `
    ALTER TABLE citizen_feedbacks
    ADD COLUMN IF NOT EXISTS email VARCHAR(255);
  `;
  try {
    await pool.query(query);
    console.log("Column 'email' added to 'citizen_feedbacks' table successfully.");
  } catch (err) {
    console.error("Error adding email column:", err);
  } finally {
    await pool.end();
  }
}

addEmailColumn();
