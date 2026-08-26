import React from 'react';
import styles from './QRCodePage.module.css';
import { Globe, MessageSquare, User, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeCard = ({ title, description, icon: Icon, color, qrValue }) => (
  <div className={styles.qrCard}>
    <div className={styles.cardHeader}>
      <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <h3 className={styles.cardTitle}>{title}</h3>
    </div>
    <p className={styles.cardDesc}>{description}</p>
    <div className={styles.qrPlaceholder}>
      {qrValue ? (
        <QRCodeSVG value={qrValue} size={120} level="M" />
      ) : (
        <div style={{width: 120, height: 120, backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>N/A</div>
      )}
      <span className={styles.scanText}>Quét để truy cập</span>
    </div>
  </div>
);

const QRCodePage = () => {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerArea}>
        <h2>Mã QR Cổng Thông Tin Công Dân</h2>
        <p className={styles.subtitle}>Quét mã QR bằng ứng dụng Zalo hoặc Camera điện thoại để truy cập nhanh các dịch vụ (Dịch vụ công, Phản ánh, Thông tin lãnh đạo, An ninh trật tự).</p>
      </div>

      <div className={styles.qrGrid} style={{ display: 'flex', justifyContent: 'center' }}>
        <QRCodeCard 
          title="Cổng Thông Tin Công Dân" 
          description="Quét mã này để truy cập tất cả 4 tiện ích: Dịch vụ công, Phản ánh kiến nghị, Thông tin lãnh đạo các ấp, và An ninh trật tự (không cần đăng nhập)."
          icon={Globe}
          color="#3b82f6"
          qrValue={`${window.location.origin}/cong-dan`}
        />
      </div>
    </div>
  );
};

export default QRCodePage;
