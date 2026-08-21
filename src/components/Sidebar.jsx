import React from 'react';
import styles from './Sidebar.module.css';
import { ChevronRight } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, unreadDocCount, unreadFeedbackCount, user }) => {
  const menuItems = [
    { id: 1, title: 'Quản lý văn bản', isNew: false },
    { id: 2, title: 'Tiếp nhận và xử lý ý kiến của người dân', isNew: false },
    { id: 3, title: 'Mã QR code', isNew: true },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ id: 6, title: 'Quản lý tài khoản', isNew: false });
  }

  return (
    <aside className={styles.sidebar}>
      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li 
            key={item.id} 
            className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className={styles.numberCircle}>{item.id}</div>
            <span className={styles.title}>{item.title}</span>
            {item.isNew && <span className={styles.newBadge}>Mới</span>}
            {item.id === 1 && unreadDocCount > 0 && <span className={styles.newBadge}>{unreadDocCount}</span>}
            {item.id === 2 && unreadFeedbackCount > 0 && <span className={styles.newBadge}>{unreadFeedbackCount}</span>}
            <ChevronRight className={styles.arrowIcon} size={16} />
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
