import React from 'react';
import { ExternalLink } from 'lucide-react';
import BackToPortalButton from './BackToPortalButton';

const IMG = '/images/chung-thuc';
const DVC_URL = 'https://dichvucong.gov.vn/';

const sectionTitle = {
  color: '#c2410c',
  fontSize: '19px',
  fontWeight: '700',
  textTransform: 'uppercase',
  margin: '10px 0 18px',
  paddingBottom: '8px',
  borderBottom: '2px solid #fed7aa'
};

const Step = ({ number, children, images = [] }) => (
  <div style={{ marginBottom: '28px' }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
      <span style={{
        flexShrink: 0,
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#c2410c',
        color: '#fff',
        fontWeight: '700',
        fontSize: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>{number}</span>
      <div style={{ fontWeight: '600', color: '#1e293b', paddingTop: '3px' }}>{children}</div>
    </div>
    {images.length > 0 && (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        {images.map((src) => (
          <img
            key={src}
            src={`${IMG}/${src}`}
            alt={`Bước ${number}`}
            loading="lazy"
            style={{
              maxWidth: images.length > 1 ? 'calc(50% - 6px)' : '100%',
              maxHeight: '560px',
              objectFit: 'contain',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          />
        ))}
      </div>
    )}
  </div>
);

const ChungThucGuide = () => {
  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: '#f0f4f8',
      backgroundImage: 'linear-gradient(135deg, #fdf2e9 0%, #f4f7f6 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', display: 'flex', justifyContent: 'flex-start' }}>
        <BackToPortalButton />
      </div>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}>
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid #edf2f7',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: '#dc2626',
            fontSize: '22px',
            fontWeight: '700',
            textTransform: 'uppercase',
            lineHeight: 1.4
          }}>
            Hướng dẫn nộp hồ sơ chứng thực bản sao trên Cổng Dịch vụ công quốc gia
          </h2>
        </div>

        <div style={{ padding: '30px', lineHeight: '1.7', color: '#334155', fontSize: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <a
              href={DVC_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#c2410c',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(194,65,12,0.3)'
              }}
            >
              Truy cập Cổng Dịch vụ công quốc gia <ExternalLink size={18} />
            </a>
          </div>

          <h3 style={sectionTitle}>Phần I. Đăng nhập Cổng Dịch vụ công quốc gia</h3>
          <Step number={1}>
            Truy cập Cổng Dịch vụ công quốc gia (bấm nút ở trên hoặc vào địa chỉ <b>dichvucong.gov.vn</b>).
          </Step>
          <Step number={2} images={['dang-nhap-1.jpg', 'dang-nhap-2.jpg']}>
            Bấm vào nút <b>Đăng nhập</b>, chọn đăng nhập bằng <b>VNeID</b>.
          </Step>
          <Step number={3} images={['nhap-cccd.png']}>
            Nhập số <b>Căn cước công dân</b> và <b>mật khẩu</b>.
          </Step>
          <Step number={4} images={['nhap-otp.png']}>
            Nhập <b>mã xác thực (OTP)</b> được gửi về số điện thoại của bạn để hoàn tất đăng nhập.
          </Step>

          <h3 style={{ ...sectionTitle, marginTop: '36px' }}>Phần II. Thực hiện thủ tục chứng thực bản sao</h3>
          <Step number={1} images={['b1-tim-thu-tuc.png']}>
            Gõ tìm kiếm tên thủ tục <b>CHỨNG THỰC BẢN SAO</b>.
          </Step>
          <Step number={2} images={['b2-co-quan.jpg']}>
            Nhập thông tin cơ quan thực hiện: <b>tỉnh Vĩnh Long</b>, <b>xã Châu Thành</b>, bấm <b>Nộp hồ sơ</b>.
          </Step>
          <Step number={3} images={['b3-nop-truc-tuyen.jpg']}>
            Bấm <b>Nộp trực tuyến</b>.
          </Step>
          <Step number={4} images={['b4-chia-se-du-lieu.png']}>
            Hệ thống yêu cầu xác nhận chia sẻ dữ liệu dân cư sang hệ thống của Bộ Tư pháp. Tích chọn đồng ý,
            bấm <b>Xác nhận chia sẻ</b> và nhập <b>Passcode VNeID</b>.
          </Step>
          <Step number={5} images={['b5-thong-tin.png']}>
            Hệ thống tự động chuyển sang Hệ thống giải quyết thủ tục hành chính dùng chung của Bộ Tư pháp.
            Nhập thông tin <b>ngày cấp CCCD</b>, <b>số điện thoại</b>. Bấm <b>Bước tiếp theo</b>.
          </Step>
          <Step number={6} images={['b6-chon-tep-1.jpg', 'b6-chon-tep-2.jpg']}>
            Bấm <b>Chọn tệp</b> → <b>Tải lên từ thiết bị</b>, chụp ảnh giấy tờ cần chứng thực.
          </Step>
          <Step number={7} images={['b7-them-vao-vi.jpg']}>
            Sau khi chụp ảnh, bấm <b>Thêm vào ví</b> và chọn <b>(Không cần kí số)</b>.
          </Step>
          <Step number={8} images={['b8-gui-ho-so.jpg']}>
            Bấm <b>Bước tiếp theo</b> → <b>Gửi hồ sơ</b>. Hoàn tất nộp hồ sơ.
          </Step>
        </div>
      </div>
    </div>
  );
};

export default ChungThucGuide;
