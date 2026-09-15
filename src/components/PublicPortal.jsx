import React from 'react';
import { Globe, MessageSquare, User, Shield, CreditCard, Smartphone, PlayCircle } from 'lucide-react';
import styles from './PublicPortal.module.css';

const PublicPortal = () => {
  return (
    <div className={styles.portalContainer}>
      <div className={styles.header}>
        <img src="/vite.svg" alt="Logo" className={styles.logo} />
        <h1>Mô hình Ấp Số</h1>
        <p>Chọn một trong các mục dưới đây để tiếp tục</p>
      </div>

      <div className={styles.menuGrid}>
        <a href="/huong-dan-thanh-toan" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#06b6d4' }}>
            <CreditCard size={32} color="white" />
          </div>
          <h3>Thanh Toán KDTM</h3>
          <p>Hướng dẫn thanh toán không dùng tiền mặt</p>
        </a>

        <a href="/huong-dan-vneid" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#db2777' }}>
            <PlayCircle size={32} color="white" />
          </div>
          <h3>Kích hoạt VNEID</h3>
          <p>Hướng dẫn kích hoạt tài khoản định danh VNEID mức 2</p>
        </a>

        <a href="/huong-dan-smart-vinh-long" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#8b5cf6' }}>
            <Smartphone size={32} color="white" />
          </div>
          <h3>SMART Vĩnh Long</h3>
          <p>Hướng dẫn cài đặt ứng dụng SMART Vĩnh Long</p>
        </a>

        <a href="https://dichvucong.gov.vn/" target="_blank" rel="noopener noreferrer" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#3b82f6' }}>
            <Globe size={32} color="white" />
          </div>
          <h3>Cổng Dịch Vụ Công</h3>
          <p>Nộp hồ sơ, tra cứu thủ tục hành chính trực tuyến</p>
        </a>

        <a href="/phan-anh" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#f59e0b' }}>
            <MessageSquare size={32} color="white" />
          </div>
          <h3>Phản Ánh, Kiến Nghị</h3>
          <p>Gửi phản ánh về các vấn đề dân sinh, môi trường</p>
        </a>

        <a href="/danh-sach-lanh-dao" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#10b981' }}>
            <User size={32} color="white" />
          </div>
          <h3>Thông tin Bí thư, Trưởng ban nhân dân các ấp</h3>
          <p>Xem thông tin liên hệ của Bí thư, Trưởng ban nhân dân 20 ấp</p>
        </a>

        <a href="/an-ninh" className={styles.menuCard}>
          <div className={styles.iconWrapper} style={{ backgroundColor: '#ef4444' }}>
            <Shield size={32} color="white" />
          </div>
          <h3>An Ninh Trật Tự</h3>
          <p>Thông tin liên hệ Công an xã và trực ban</p>
        </a>
      </div>
    </div>
  );
};

export default PublicPortal;
