import React, { useState } from 'react';
import styles from './Login.module.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại');
      }

      // Đăng nhập thành công, gọi callback
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Đăng Nhập Hệ Thống</h2>
        
        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Tài khoản</label>
            <input 
              type="text" 
              className={styles.input} 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập (vd: admin, ap1)"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu</label>
            <input 
              type="password" 
              className={styles.input} 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <button 
            type="submit" 
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
