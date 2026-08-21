import React, { useState, useRef } from 'react';
import styles from './Profile.module.css';

const Profile = ({ user, onUserUpdate }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState(false);
  const [isPwdLoading, setIsPwdLoading] = useState(false);

  const [avatarBase64, setAvatarBase64] = useState(user.avatar || '');
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarError, setAvatarError] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdError(false);

    if (newPassword !== confirmPassword) {
      setPwdError(true);
      setPwdMsg('Mật khẩu mới không khớp!');
      return;
    }

    setIsPwdLoading(true);
    try {
      const response = await fetch(`https://phanmem-xaap.onrender.com/api/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');
      
      setPwdMsg('Đổi mật khẩu thành công!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdError(true);
      setPwdMsg(err.message);
    } finally {
      setIsPwdLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    setAvatarMsg('');
    setAvatarError(false);
    
    if (!avatarBase64) return;

    setIsAvatarLoading(true);
    try {
      const response = await fetch(`https://phanmem-xaap.onrender.com/api/users/${user.id}/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarBase64 })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Cập nhật avatar thất bại');
      
      setAvatarMsg('Cập nhật hình đại diện thành công!');
      // Cập nhật state user trên toàn app
      onUserUpdate({ ...user, avatar: avatarBase64 });
    } catch (err) {
      setAvatarError(true);
      setAvatarMsg(err.message);
    } finally {
      setIsAvatarLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <h2 className={styles.title}>Thông Tin Cá Nhân</h2>
        <div className={styles.formGroup}>
          <label className={styles.label}>Họ và Tên / Đơn vị</label>
          <input className={styles.input} value={user.name} disabled />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Tên đăng nhập</label>
          <input className={styles.input} value={user.username} disabled />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Quyền hạn</label>
          <input className={styles.input} value={user.role === 'admin' ? 'Quản trị viên (Admin)' : user.role === 'ubnd' ? 'Cán bộ UBND Xã' : 'Người dùng (Ấp)'} disabled />
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Cập Nhật Hình Đại Diện</h2>
        <form onSubmit={handleAvatarSubmit}>
          <div className={styles.avatarSection}>
            {avatarBase64 ? (
              <img src={avatarBase64} alt="Avatar" className={styles.avatarPreview} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange}
                ref={fileInputRef}
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                className={styles.btn} 
                onClick={() => fileInputRef.current.click()}
                style={{ background: '#6c757d', marginBottom: '10px' }}
              >
                Chọn ảnh mới
              </button>
              <div style={{ fontSize: '12px', color: '#666' }}>Hỗ trợ JPG, PNG (Dưới 2MB)</div>
            </div>
          </div>
          <button type="submit" className={styles.btn} disabled={isAvatarLoading || !avatarBase64}>
            {isAvatarLoading ? 'Đang lưu...' : 'Lưu hình đại diện'}
          </button>
          {avatarMsg && (
            <div className={`${styles.message} ${avatarError ? styles.error : styles.success}`}>
              {avatarMsg}
            </div>
          )}
        </form>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Đổi Mật Khẩu</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu hiện tại</label>
            <input 
              type="password" 
              className={styles.input} 
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Mật khẩu mới</label>
            <input 
              type="password" 
              className={styles.input} 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nhập lại mật khẩu mới</label>
            <input 
              type="password" 
              className={styles.input} 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.btn} disabled={isPwdLoading}>
            {isPwdLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
          {pwdMsg && (
            <div className={`${styles.message} ${pwdError ? styles.error : styles.success}`}>
              {pwdMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
