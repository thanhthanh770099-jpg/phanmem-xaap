import React, { useState } from 'react';
import styles from './Header.module.css';
import { Home } from 'lucide-react';

const Header = ({ user, onLogout, setActiveTab }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <div 
          className={styles.logo} 
          onClick={() => setActiveTab(0)} 
          style={{ cursor: 'pointer' }}
          title="Về Trang chủ"
        >
          <Home size={20} color="white" />
        </div>
      </div>
      <h1 className={styles.title}>
        PHẦN MỀM QUẢN LÝ CÁC ẤP THUỘC XÃ CHÂU THÀNH
      </h1>
      <div className={styles.userMenu}>
        <div 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px', position: 'relative' }}
          onClick={() => setShowDropdown(!showDropdown)}
          title="Tùy chọn tài khoản"
        >
          <span className={styles.userName}>{user ? user.name : 'Admin Xã'}</span>
          {user && user.avatar ? (
            <img src={user.avatar} alt="Avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatar}>
              {user ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          )}

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <div 
                className={styles.dropdownItem} 
                onClick={() => { setActiveTab(5); setShowDropdown(false); }}
              >
                Tài khoản của tôi
              </div>
              <div 
                className={styles.dropdownItem} 
                onClick={() => { onLogout(); setShowDropdown(false); }}
                style={{ color: '#d32f2f' }}
              >
                Đăng xuất
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
