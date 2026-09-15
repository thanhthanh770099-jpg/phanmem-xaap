import React from 'react';
import { Landmark, MessageSquare, Shield, Users } from 'lucide-react';
import styles from './PublicPortal.module.css';

const MenuCard = ({ href, title, description, icon: Icon, imageSrc, color, isExternal }) => {
  const content = (
    <>
      {imageSrc ? (
        <div className={styles.iconImageWrapper} style={{ borderColor: color }}>
          <img src={imageSrc} alt={title} className={styles.iconImage} />
        </div>
      ) : (
        <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
          <Icon size={32} color="white" />
        </div>
      )}
      <div className={styles.cardContent}>
        <h3 style={{ color: color }}>{title}</h3>
        <p>{description}</p>
      </div>
    </>
  );

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.menuCard} style={{ borderLeftColor: color }}>
        {content}
      </a>
    );
  }

  return (
    <a href={href} className={styles.menuCard} style={{ borderLeftColor: color }}>
      {content}
    </a>
  );
};

const PublicPortal = () => {
  return (
    <div className={styles.portalContainer}>
      <div className={styles.header}>
        <h2>ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH</h2>
        <h1>ẤP THÔNG MINH</h1>
        <p className={styles.subtitle}>CÔNG NGHỆ SỐ - KẾT NỐI NGƯỜI DÂN</p>
      </div>

      <div className={styles.menuGrid}>
        <MenuCard 
          href="https://dichvucong.gov.vn/"
          title="CỔNG DỊCH VỤ CÔNG QUỐC GIA"
          description="Thực hiện thủ tục hành chính mọi lúc, mọi nơi"
          icon={Landmark}
          color="#c2410c"
          isExternal={true}
        />

        <MenuCard 
          href="/huong-dan-vneid"
          title="ỨNG DỤNG ĐỊNH DANH ĐIỆN TỬ (VNeID)"
          description="Đăng ký, đăng nhập, sử dụng các tiện ích trên VNeID"
          imageSrc="/images/vneid.png"
          color="#16a34a"
        />

        <MenuCard 
          href="/phan-anh"
          title="PHẢN ÁNH - KIẾN NGHỊ CỦA NGƯỜI DÂN"
          description="Phản ánh kịp thời các vấn đề để chính quyền xử lý"
          icon={MessageSquare}
          color="#ea580c"
        />

        <MenuCard 
          href="/huong-dan-thanh-toan"
          title="THANH TOÁN KHÔNG DÙNG TIỀN MẶT"
          description="Thanh toán hóa đơn, học phí, viện phí, phí dịch vụ công..."
          imageSrc="/images/thanh-toan.png"
          color="#9333ea"
        />

        <MenuCard 
          href="/huong-dan-smart-vinh-long"
          title="ỨNG DỤNG SMART VĨNH LONG"
          description="Cài đặt và sử dụng các tiện ích đô thị thông minh"
          imageSrc="/images/smart.png"
          color="#0284c7"
        />

        <MenuCard 
          href="/danh-sach-lanh-dao"
          title="THÔNG TIN BÍ THƯ VÀ TRƯỞNG BAN NHÂN DÂN CÁC ẤP"
          description="Cập nhật thông tin lãnh đạo, thông báo mới nhất của ấp"
          icon={Users}
          color="#059669"
        />

        <MenuCard 
          href="/an-ninh"
          title="AN NINH TRẬT TỰ"
          description="Số điện thoại trực ban Công an xã và liên hệ bảo đảm ANTT"
          icon={Shield}
          color="#dc2626"
        />
      </div>
      
      <div className={styles.footer}>
        <p>MỖI NGƯỜI DÂN LÀ MỘT CÔNG DÂN SỐ</p>
        <p>MỖI GIA ĐÌNH LÀ MỘT GIA ĐÌNH SỐ</p>
      </div>
    </div>
  );
};

export default PublicPortal;
