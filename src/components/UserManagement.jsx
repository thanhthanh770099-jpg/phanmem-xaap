import React, { useState, useEffect } from 'react';
import styles from './Feedback.module.css'; // Using the same styles as Feedback for consistency

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'create'
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'user'
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchUsers();
    }
  }, [viewMode]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://phanmem-xaap.onrender.com/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài khoản:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://phanmem-xaap.onrender.com/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setStatus({ type: 'success', message: 'Tạo tài khoản thành công!' });
      
      setFormData({
        username: '',
        password: '',
        name: '',
        role: 'user'
      });
      
      setTimeout(() => setViewMode('list'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi tạo tài khoản.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return <div style={{ padding: '24px', color: 'red' }}>Bạn không có quyền truy cập chức năng này.</div>;
  }

  const renderList = () => (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Tài Khoản Người Dùng</h2>
        <button className={styles.primaryBtn} onClick={() => {
          setViewMode('create');
          setStatus({ type: '', message: '' });
        }}>
          + Tạo tài khoản mới
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th width="15%">ID</th>
              <th width="35%">Tên đăng nhập</th>
              <th width="35%">Tên hiển thị / Ấp</th>
              <th width="15%">Quyền</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className={styles.emptyState}>Chưa có tài khoản nào.</div>
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.name}</td>
                  <td>
                    {u.role === 'admin' ? (
                      <span style={{ color: '#155724', backgroundColor: '#d4edda', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Quản trị viên</span>
                    ) : (
                      <span style={{ color: '#004085', backgroundColor: '#cce5ff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Người dùng (Ấp)</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderForm = () => (
    <>
      <button className={styles.secondaryBtn} onClick={() => setViewMode('list')} style={{ marginBottom: '20px' }}>
        Quay lại danh sách
      </button>
      
      <h2 className={styles.title} style={{ marginBottom: 24 }}>Tạo Tài Khoản Mới</h2>
      
      {status.message && (
        <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
          {status.message}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đăng nhập <span style={{color: 'red'}}>*</span></label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Mật khẩu <span style={{color: 'red'}}>*</span></label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên hiển thị / Tên Ấp <span style={{color: 'red'}}>*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required placeholder="Ví dụ: Ấp Hương Phụ A" />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Quyền hạn <span style={{color: 'red'}}>*</span></label>
          <select name="role" value={formData.role} onChange={handleChange} className={styles.select} required>
            <option value="user">Người dùng (Ấp)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
        
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản'}
        </button>
      </form>
    </>
  );

  return (
    <div className={styles.container}>
      {viewMode === 'list' && renderList()}
      {viewMode === 'create' && renderForm()}
    </div>
  );
};

export default UserManagement;
