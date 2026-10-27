const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  max: 5,
  idleTimeoutMillis: 10000,
});

async function addForwardColumns() {
  const query = `
    ALTER TABLE citizen_feedbacks
    ADD COLUMN IF NOT EXISTS forward_note TEXT,
    ADD COLUMN IF NOT EXISTS forwarded_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS forwarded_by VARCHAR(255);
  `;
  try {
    await pool.query(query);
    console.log("Đã cập nhật bảng 'citizen_feedbacks' thành công với các cột forward_note, forwarded_at, forwarded_by.");
  } catch (err) {
    console.error("Lỗi khi cập nhật bảng:", err.message);
  } finally {
    await pool.end();
  }
}

addForwardColumns();
