const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbConfig = {
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
};

const departments = [
  {
    username: 'phongvanhoaxahoi',
    name: 'Phòng Văn hóa - Xã hội',
    role: 'department'
  },
  {
    username: 'phongkinhte',
    name: 'Phòng Kinh tế',
    role: 'department'
  },
  {
    username: 'vanphonghdndubnd',
    name: 'Văn phòng HĐND và UBND',
    role: 'department'
  },
  {
    username: 'hanhchinhcong',
    name: 'Trung tâm Phục vụ Hành chính công',
    role: 'department'
  }
];

async function addDepartmentUsers() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Connected to PostgreSQL database...");

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync('123456', salt);

    for (const dept of departments) {
      const existing = await client.query(
        'SELECT id, username, name, role FROM users WHERE username = $1',
        [dept.username]
      );

      if (existing.rows.length > 0) {
        console.log(`Account ${dept.username} already exists (ID: ${existing.rows[0].id}). Updating role and name...`);
        await client.query(
          'UPDATE users SET name = $1, role = $2 WHERE id = $3',
          [dept.name, dept.role, existing.rows[0].id]
        );
      } else {
        const res = await client.query(
          'INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4) RETURNING id, username, name, role',
          [dept.username, hashPassword, dept.role, dept.name]
        );
        console.log(`Created account ${dept.username} (ID: ${res.rows[0].id}) for ${dept.name}`);
      }
    }

    // Verify all department accounts in database
    const allDept = await client.query("SELECT id, username, name, role FROM users WHERE role = 'department' ORDER BY id ASC");
    console.log("\n--- Danh sách tài khoản phòng ban đã tạo ---");
    console.table(allDept.rows);

  } catch (err) {
    console.error("Lỗi khi thêm tài khoản phòng ban:", err);
  } finally {
    await client.end();
  }
}

addDepartmentUsers();
