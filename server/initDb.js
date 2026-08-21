const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const dbConfig = {
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require'
};

const hamlets = [
  "Ấp Hương Phụ A", "Ấp Hương Phụ B", "Ấp Hương Phụ C", "Ấp Thanh Trì A",
  "Ấp Thanh Trì B", "Ấp Bàu Sơn", "Ấp Giồng Lức", "Ấp Phú Nhiêu",
  "Ấp Thanh Nguyên A", "Ấp Thanh Nguyên B", "Ấp Cây Dương", "Ấp Phú Thọ",
  "Ấp Ba Tiêu", "Ấp Đa Lộc", "Ấp Tầm Phương", "Ấp Đầu Giồng",
  "Ấp Phú Mỹ", "Ấp Nhà Dựa", "Ấp Ô Tre", "Ấp Thanh Mỹ"
];

function generateUsername(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .replace(/đ/g, "d")             // Xóa chữ đ
    .replace(/\s+/g, "");           // Xóa khoảng trắng
}

async function initDb() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    console.log("Đã kết nối tới PostgreSQL (database KhoXaAp)!");

    // 1. Tạo các bảng
    console.log("Đang tạo các bảng...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50),
        name VARCHAR(255),
        avatar TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        number VARCHAR(255),
        summary TEXT,
        file_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sender_id INT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS document_recipients (
        id SERIAL PRIMARY KEY,
        document_id INT,
        recipient_id INT,
        status VARCHAR(50) DEFAULT 'unread',
        read_at TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id SERIAL PRIMARY KEY,
        document_id INT,
        sender_id INT,
        content TEXT,
        file_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Làm sạch dữ liệu cũ
    console.log("Làm sạch dữ liệu cũ...");
    await client.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE documents RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE document_recipients RESTART IDENTITY CASCADE");
    await client.query("TRUNCATE TABLE feedbacks RESTART IDENTITY CASCADE");

    // 2. Seeding dữ liệu mẫu
    console.log("Đang thêm dữ liệu mẫu...");
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync('123456', salt);

    // Tạo Admin
    await client.query(
      "INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)",
      ['admin', hashPassword, 'admin', 'UBND Xã Châu Thành']
    );

    // Tạo các Ấp
    for (let i = 0; i < hamlets.length; i++) {
      const username = generateUsername(hamlets[i]);
      await client.query(
        "INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)",
        [username, hashPassword, 'user', hamlets[i]]
      );
    }

    console.log("Khởi tạo cơ sở dữ liệu thành công! Đã thêm tài khoản Admin và 20 Ấp (Mật khẩu mặc định: 123456).");
  } catch (error) {
    console.error("Lỗi khi khởi tạo CSDL:", error);
  } finally {
    await client.end();
  }
}

initDb();
