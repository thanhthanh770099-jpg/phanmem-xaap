import React from 'react';
import styles from './PublicPortal.module.css';
import { 
  Landmark, ShieldCheck, MessageSquare, 
  CreditCard, Smartphone, Users, 
  Shield, Star, Heart, Users as UsersIcon, Shield as ShieldIcon
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ClickableQRCodeCard = ({ title, description, icon: Icon, imageSrc, color, qrValue, href, isExternal }) => (
  <a href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : ""} className={styles.qrCard} style={{ borderColor: color, textDecoration: 'none', color: 'inherit' }}>
    {imageSrc ? (
      <div className={styles.iconImageWrapper}>
        <img src={imageSrc} alt={title} className={styles.iconImage} />
      </div>
    ) : (
      <div className={styles.iconCircle} style={{ backgroundColor: color }}>
        <Icon size={28} color="white" />
      </div>
    )}
    <h3 className={styles.cardTitle} style={{ color: color }}>{title}</h3>
    <div className={styles.qrWrapper}>
      {qrValue ? (
        <QRCodeSVG value={qrValue} size={130} level="M" />
      ) : (
        <div className={styles.qrPlaceholder}>N/A</div>
      )}
    </div>
    <p className={styles.cardDesc}>{description}</p>
  </a>
);

const PublicPortal = () => {
  return (
    <div className={styles.pageWrapper}>
      {/* Remove fixed width to allow responsive scaling on mobile */}
      <div className={styles.posterContainer}>
        
        {/* Header Section */}
        <div className={styles.posterHeader}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
            <Star size={40} color="#dc2626" fill="#dc2626" />
            <h2 className={styles.orgTitle}>ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH</h2>
            <Star size={40} color="#dc2626" fill="#dc2626" />
          </div>
          <h1 className={styles.mainTitle}>ẤP THÔNG MINH</h1>
          <div className={styles.pillBanner}>
            CHẠM VÀO MÃ QR ĐỂ KẾT NỐI - TIỆN ÍCH TRONG TẦM TAY
          </div>
          <p className={styles.slogan}>
            🌿 CÔNG NGHỆ SỐ - KẾT NỐI NGƯỜI DÂN - XÂY DỰNG ẤP VĂN MINH, HIỆN ĐẠI 🌿
          </p>
        </div>

        {/* QR Code Grid */}
        <div className={styles.qrGrid}>
          <ClickableQRCodeCard 
            title="CỔNG DỊCH VỤ CÔNG QUỐC GIA" 
            description="Thực hiện thủ tục hành chính mọi lúc, mọi nơi"
            icon={Landmark}
            color="#c2410c"
            qrValue="https://dichvucong.gov.vn/"
            href="https://dichvucong.gov.vn/"
            isExternal={true}
          />
          <ClickableQRCodeCard 
            title="ỨNG DỤNG ĐỊNH DANH ĐIỆN TỬ (VNeID)" 
            description="Đăng ký, đăng nhập, sử dụng các tiện ích trên VNeID"
            imageSrc="/images/vneid.png"
            color="#16a34a"
            qrValue={`${window.location.origin}/huong-dan-vneid`}
            href="/huong-dan-vneid"
          />
          <ClickableQRCodeCard 
            title="PHẢN ÁNH - KIẾN NGHỊ CỦA NGƯỜI DÂN" 
            description="Phản ánh kịp thời các vấn đề để chính quyền xử lý"
            icon={MessageSquare}
            color="#ea580c"
            qrValue={`${window.location.origin}/phan-anh`}
            href="/phan-anh"
          />
          <ClickableQRCodeCard 
            title="THANH TOÁN KHÔNG DÙNG TIỀN MẶT" 
            description="Thanh toán hóa đơn, học phí, viện phí, phí dịch vụ công..."
            imageSrc="/images/thanh-toan.png"
            color="#9333ea"
            qrValue={`${window.location.origin}/huong-dan-thanh-toan`}
            href="/huong-dan-thanh-toan"
          />
          <ClickableQRCodeCard 
            title="ỨNG DỤNG SMART VĨNH LONG" 
            description="Cài đặt và sử dụng các tiện ích đô thị thông minh"
            imageSrc="/images/smart.png"
            color="#0284c7"
            qrValue={`${window.location.origin}/huong-dan-smart-vinh-long`}
            href="/huong-dan-smart-vinh-long"
          />
          <ClickableQRCodeCard 
            title="THÔNG TIN BÍ THƯ VÀ TRƯỞNG BAN NHÂN DÂN CÁC ẤP" 
            description="Cập nhật thông tin lãnh đạo, thông báo mới nhất của ấp"
            icon={Users}
            color="#059669"
            qrValue={`${window.location.origin}/danh-sach-lanh-dao`}
            href="/danh-sach-lanh-dao"
          />
          <ClickableQRCodeCard 
            title="AN NINH TRẬT TỰ" 
            description="Số điện thoại trực ban Công an xã và liên hệ bảo đảm ANTT"
            icon={Shield}
            color="#dc2626"
            qrValue={`${window.location.origin}/an-ninh`}
            href="/an-ninh"
          />
        </div>

        {/* Footer Section */}
        <div className={styles.posterFooter}>
          <div className={styles.footerInfo}>
            <div className={styles.footerItem}>
              <UsersIcon size={24} />
              <span>CHUNG TAY CHUYỂN ĐỔI SỐ<br/>VÌ CUỘC SỐNG TỐT ĐẸP HƠN</span>
            </div>
            <div className={styles.footerItem}>
              <ShieldIcon size={24} />
              <span>AN TOÀN - BẢO MẬT<br/>HIỆU QUẢ - TIẾT KIỆM</span>
            </div>
          </div>
          <div className={styles.footerBanner}>
            <Heart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }} />
            MỖI NGƯỜI DÂN LÀ MỘT CÔNG DÂN SỐ - MỖI GIA ĐÌNH LÀ MỘT GIA ĐÌNH SỐ
            <Heart size={18} style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '10px' }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PublicPortal;
