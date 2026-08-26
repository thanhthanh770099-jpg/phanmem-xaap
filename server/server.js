const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cấu hình kết nối PostgreSQL (Connection Pool)

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_0VEFa2ZRNKSb@ep-divine-base-axttg396.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
  max: 10,
  idleTimeoutMillis: 30000,
});
// Kiểm tra kết nối CSDL khi khởi động
pool.connect()
  .then(client => {
    console.log("Đã kết nối tới PostgreSQL (database KhoXaAp) thành công!");
    client.release();
  })
  .catch(err => {
    console.error("Lỗi kết nối PostgreSQL:", err.message);
    console.log("Vui lòng đảm bảo PostgreSQL đang chạy và thông tin cấu hình đúng.");
  });

// API 1: Đăng nhập
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tài khoản và mật khẩu' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (rows.length === 0) return res.status(401).json({ error: 'Tài khoản không tồn tại' });

    const user = rows[0];
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) return res.status(401).json({ error: 'Mật khẩu không đúng' });

    // Trong ứng dụng thực tế, nên dùng JWT. Ở đây mockup trả về thông tin user
    res.json({
      message: 'Đăng nhập thành công',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 1.1: Đổi mật khẩu
app.put('/api/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const { rows } = await pool.query('SELECT password FROM users WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' });

    const isValid = bcrypt.compareSync(oldPassword, rows[0].password);
    if (!isValid) return res.status(400).json({ error: 'Mật khẩu cũ không đúng' });

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(newPassword, salt);

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword, id]);
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 1.2: Đổi ảnh đại diện
app.put('/api/users/:id/avatar', async (req, res) => {
  const { id } = req.params;
  const { avatar } = req.body; // Chuỗi base64

  try {
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatar, id]);
    res.json({ message: 'Cập nhật ảnh đại diện thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 2: Lấy thông tin thống kê Dashboard
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalDocsResult = await pool.query('SELECT COUNT(*) FROM documents');
    const totalDocs = parseInt(totalDocsResult.rows[0].count);

    const usersResult = await pool.query("SELECT id, name FROM users WHERE role = 'user' ORDER BY id ASC");
    const hamlets = usersResult.rows;

    const hamletsProgress = [];
    let totalRead = 0;
    let totalRecipientsCount = 0;

    for (const hamlet of hamlets) {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_received,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as total_completed
        FROM document_recipients 
        WHERE recipient_id = $1
      `, [hamlet.id]);

      const total = parseInt(stats.rows[0].total_received) || 0;
      const completed = parseInt(stats.rows[0].total_completed) || 0;

      totalRecipientsCount += total;
      totalRead += completed; // We reuse totalRead variable for completed to avoid changing everything

      const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

      hamletsProgress.push({
        id: hamlet.id,
        name: hamlet.name,
        progress: progress
      });
    }

    const completedTaskPercent = totalRecipientsCount === 0 ? 0 : Math.round((totalRead / totalRecipientsCount) * 100);
    const pendingDocsResult = await pool.query("SELECT COUNT(DISTINCT document_id) FROM document_recipients WHERE status != 'completed'");
    const pendingDocuments = parseInt(pendingDocsResult.rows[0].count) || 0;

    const recentDocsResult = await pool.query('SELECT id, number, summary, created_at FROM documents ORDER BY created_at DESC LIMIT 5');

    res.json({
      totalDocuments: totalDocs,
      respondedHamlets: hamletsProgress.filter(h => h.progress === 100).length,
      totalHamlets: hamlets.length,
      completedTaskPercent: completedTaskPercent,
      pendingDocuments: pendingDocuments,
      hamletsProgress: hamletsProgress,
      recentDocs: recentDocsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 3.1: Lấy danh sách ấp (người nhận)
app.get('/api/users/hamlets', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, name FROM users WHERE role = 'user' ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Lấy danh sách tất cả người dùng (Cho Admin)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, username, name, role FROM users ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Tạo tài khoản mới (Cho Admin)
app.post('/api/users', async (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  }

  try {
    // Kiểm tra xem username đã tồn tại chưa
    const checkUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    await pool.query(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4)',
      [username, hashPassword, name, role]
    );
    res.json({ message: 'Tạo tài khoản thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Xóa tài khoản (Cho Admin)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Ngăn admin tự xóa chính mình nếu cần, nhưng tạm thời cứ cho phép xóa theo id
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Đã xóa tài khoản' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Reset mật khẩu (Cho Admin)
app.put('/api/users/:id/reset-password', async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu mới' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(newPassword, salt);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword, id]);
    res.json({ message: 'Đã đặt lại mật khẩu thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 3.2: Quản lý văn bản (Lấy danh sách inbox hoặc sent)
app.get('/api/documents', async (req, res) => {
  const { userId, type } = req.query; // type: 'inbox' | 'sent'
  try {
    if (type === 'sent') {
      const { rows } = await pool.query(`
        SELECT d.*, 
               (SELECT COUNT(*) FROM document_recipients WHERE document_id = d.id) as total_recipients,
               (SELECT COUNT(*) FROM document_recipients WHERE document_id = d.id AND status = 'read') as read_count
        FROM documents d
        WHERE d.sender_id = $1
        ORDER BY d.created_at DESC
      `, [userId]);

      for (let doc of rows) {
        const recipients = await pool.query(`
          SELECT r.status, r.read_at, u.name 
          FROM document_recipients r 
          JOIN users u ON r.recipient_id = u.id 
          WHERE r.document_id = $1
          ORDER BY u.id ASC
        `, [doc.id]);
        doc.recipients = recipients.rows;
      }
      return res.json(rows);
    } else {
      // type === 'inbox'
      const { rows } = await pool.query(`
        SELECT d.*, r.status, r.read_at, u.name as sender_name
        FROM documents d
        JOIN document_recipients r ON d.id = r.document_id
        JOIN users u ON d.sender_id = u.id
        WHERE r.recipient_id = $1
        ORDER BY d.created_at DESC
      `, [userId]);
      return res.json(rows);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 3.3: Lấy số lượng văn bản chưa đọc
app.get('/api/documents/unread-count', async (req, res) => {
  const { userId } = req.query;
  try {
    const { rows } = await pool.query(`
      SELECT COUNT(*) as count
      FROM document_recipients
      WHERE recipient_id = $1 AND status = 'unread'
    `, [userId]);
    res.json({ unreadCount: parseInt(rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 3.4: Tạo văn bản mới
app.post('/api/documents', async (req, res) => {
  const { number, summary, fileUrl, senderId, recipientIds, senderRole } = req.body;

  try {
    await pool.query('BEGIN');
    const insertDoc = await pool.query(
      'INSERT INTO documents (number, summary, file_url, sender_id) VALUES ($1, $2, $3, $4) RETURNING id',
      [number, summary, fileUrl, senderId]
    );
    const docId = insertDoc.rows[0].id;

    let targets = [];
    if (senderRole === 'admin' || senderRole === 'ubnd') {
      targets = recipientIds;
      if (!targets || targets.length === 0) {
        const users = await pool.query("SELECT id FROM users WHERE role = 'user'");
        targets = users.rows.map(u => u.id);
      }
    } else {
      // Ấp gửi thì người nhận là admin và cán bộ xã (ubnd)
      const admins = await pool.query("SELECT id FROM users WHERE role IN ('admin', 'ubnd')");
      targets = admins.rows.map(a => a.id);
    }

    for (const rid of targets) {
      await pool.query(
        'INSERT INTO document_recipients (document_id, recipient_id) VALUES ($1, $2)',
        [docId, rid]
      );
    }

    await pool.query('COMMIT');
    res.json({ message: 'Gửi văn bản thành công' });
  } catch (error) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// API 3.4: Đánh dấu đã đọc
app.put('/api/documents/:id/read', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await pool.query(
      "UPDATE document_recipients SET status = 'read', read_at = CURRENT_TIMESTAMP WHERE document_id = $1 AND recipient_id = $2",
      [id, userId]
    );
    res.json({ message: 'Đã đánh dấu đọc' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 3.5: Đánh dấu hoàn thành
app.put('/api/documents/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    await pool.query(
      "UPDATE document_recipients SET status = 'completed', read_at = CURRENT_TIMESTAMP WHERE document_id = $1 AND recipient_id = $2",
      [id, userId]
    );
    res.json({ message: 'Đã xác nhận hoàn thành' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 4: Lưu ý kiến người dân
app.post('/api/feedbacks', async (req, res) => {
  const { name, phone, hamletId, content } = req.body;
  if (!name || !hamletId || !content) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO citizen_feedbacks (name, phone, hamlet_id, content) VALUES ($1, $2, $3, $4)',
      [name, phone, hamletId, content]
    );
    res.json({ message: 'Gửi ý kiến thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 5: Lấy danh sách ý kiến
app.get('/api/feedbacks', async (req, res) => {
  const { userId, role } = req.query;

  try {
    let query = `
      SELECT f.*, u.name as hamlet_name 
      FROM citizen_feedbacks f
      LEFT JOIN users u ON f.hamlet_id = u.id
    `;
    let params = [];

    if (role === 'user') {
      query += ` WHERE f.hamlet_id = $1 `;
      params.push(userId);
    }

    query += ` ORDER BY f.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 5.1: Lấy số lượng ý kiến chưa xử lý
app.get('/api/feedbacks/unread-count', async (req, res) => {
  const { userId, role } = req.query;

  try {
    let query = `SELECT COUNT(*) as count FROM citizen_feedbacks WHERE status = 'pending'`;
    let params = [];

    if (role === 'user') {
      query += ` AND hamlet_id = $1`;
      params.push(userId);
    }

    const { rows } = await pool.query(query, params);
    res.json({ unreadCount: parseInt(rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API 5.2: Xử lý ý kiến
app.put('/api/feedbacks/:id/handle', async (req, res) => {
  const { id } = req.params;
  const { responseNote, responseFileUrl } = req.body;

  try {
    await pool.query(
      `UPDATE citizen_feedbacks 
       SET status = 'handled', response_note = $1, response_file_url = $2, handled_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [responseNote, responseFileUrl, id]
    );
    res.json({ message: 'Đã xử lý ý kiến thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Backend server đang chạy tại http://localhost:${port}`);
});
