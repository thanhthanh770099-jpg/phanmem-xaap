const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  max: 5,
  idleTimeoutMillis: 10000,
});

async function addDepartmentColumns() {
  const query = `
    ALTER TABLE citizen_feedbacks
    ADD COLUMN IF NOT EXISTS target_department VARCHAR(255),
    ADD COLUMN IF NOT EXISTS department_note TEXT,
    ADD COLUMN IF NOT EXISTS department_assigned_at TIMESTAMP;
  `;
  try {
    await pool.query(query);
    console.log("Đã cập nhật bảng 'citizen_feedbacks' thành công với target_department, department_note, department_assigned_at.");
  } catch (err) {
    console.error("Lỗi khi cập nhật bảng:", err.message);
  } finally {
    await pool.end();
  }
}

addDepartmentColumns();
