import React from 'react';
import styles from './QRCodePage.module.css';
import { Globe, MessageSquare, User, Shield, CreditCard } from 'lucide-react';
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
          title="Hướng dẫn Thanh toán không dùng tiền mặt" 
          description="Quét mã để xem hướng dẫn chi tiết các hình thức thanh toán trực tuyến, chuyển khoản, quét mã QR."
          icon={CreditCard}
          color="#06b6d4"
          qrValue={`${window.location.origin}/huong-dan-thanh-toan`}
        />
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
          qrValue={`${window.location.origin}/danh-sach-lanh-dao`}
        />
        <QRCodeCard 
          title="Công An - An Ninh Trật Tự" 
          description="Số điện thoại trực ban Công an xã và thông tin liên hệ đảm bảo an ninh trật tự các ấp."
          icon={Shield}
          color="#ef4444"
        />
      </div>

      <div className={styles.headerArea} style={{ marginTop: '40px' }}>
        <h2>Mã QR Mô hình Ấp Số (Gộp chung)</h2>
        <p className={styles.subtitle}>Sử dụng mã QR này để chia sẻ cho người dân. Người dân có thể truy cập 1 lúc 5 tiện ích bên trên mà không cần đăng nhập.</p>
      </div>

      <div className={styles.qrGrid} style={{ display: 'flex', justifyContent: 'center' }}>
        <QRCodeCard 
          title="Mô hình Ấp Số" 
          description="Quét mã này để truy cập tất cả 5 tiện ích: Thanh toán KDTM, Dịch vụ công, Phản ánh kiến nghị, Thông tin lãnh đạo các ấp, và An ninh trật tự."
          icon={Globe}
          color="#8b5cf6"
          qrValue={`${window.location.origin}/cong-dan`}
        />
      </div>
    </div>
  );
};

export default QRCodePage;
