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
        <h2>Mã QR các phần mềm và Thông tin liên hệ</h2>
        <p className={styles.subtitle}>Quét mã QR bằng ứng dụng Zalo hoặc Camera điện thoại để truy cập nhanh các dịch vụ.</p>
      </div>

      <div className={styles.qrGrid}>
        <QRCodeCard 
          title="Cổng Dịch Vụ Công" 
          description="Truy cập nhanh cổng dịch vụ công trực tuyến để nộp hồ sơ, tra cứu thủ tục hành chính."
          icon={Globe}
          color="#3b82f6"
          qrValue="https://dichvucong.gov.vn/"
        />
        <QRCodeCard 
          title="Phản Ánh, Kiến Nghị" 
          description="Gửi phản ánh, kiến nghị về các vấn đề dân sinh, môi trường, hạ tầng trên địa bàn xã."
          icon={MessageSquare}
          color="#f59e0b"
          qrValue={`${window.location.origin}/phan-anh`}
        />
        <QRCodeCard 
          title="Thông Tin Lãnh Đạo Các Ấp" 
          description="Xem thông tin liên hệ, số điện thoại của trưởng ấp, phó ấp và ban điều hành 20 ấp."
          icon={User}
          color="#10b981"
        />
        <QRCodeCard 
          title="Công An - An Ninh Trật Tự" 
          description="Số điện thoại trực ban Công an xã và thông tin liên hệ đảm bảo an ninh trật tự các ấp."
          icon={Shield}
          color="#ef4444"
        />
      </div>
    </div>
  );
};

export default QRCodePage;
