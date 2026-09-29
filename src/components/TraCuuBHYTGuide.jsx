import React from 'react';
import { ExternalLink } from 'lucide-react';

const TraCuuBHYTGuide = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f9ff', 
      backgroundImage: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        maxWidth: '800px', 
        width: '100%',
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        <div style={{ 
          padding: '24px 30px', 
          backgroundColor: '#fff',
          borderBottom: '1px solid #e0f2fe',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            margin: 0, 
            color: '#0369a1', 
            fontSize: '24px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            Hướng dẫn Tra cứu thời hạn sử dụng thẻ BHYT
          </h2>
        </div>
        
        <div style={{ 
          padding: '30px', 
          overflowY: 'auto', 
          lineHeight: '1.7',
          color: '#334155',
          fontSize: '16px'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            ĐỂ TRA CỨU GIÁ TRỊ SỬ DỤNG THẺ BẢO HIỂM Y TẾ, VUI LÒNG THỰC HIỆN THEO CÁC BƯỚC SAU:
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
            <a 
              href="https://baohiemxahoi.gov.vn/tracuu/Pages/tra-cuu-thoi-han-su-dung-the-bhyt.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#0284c7',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                boxShadow: '0 4px 6px rgba(2, 132, 199, 0.25)',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
            >
              Truy cập trang tra cứu BHYT <ExternalLink size={18} />
            </a>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <img 
              src="/images/bhyt-guide.jpg" 
              alt="Hướng dẫn tra cứu BHYT" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '8px', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
              }} 
            />
          </div>

          <h3 style={{ color: '#0369a1', marginTop: '25px', marginBottom: '15px', fontSize: '18px' }}>Các bước thực hiện trên Cổng thông tin BHXH Việt Nam:</h3>
          
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '20px', 
            borderRadius: '12px', 
            borderLeft: '4px solid #0284c7',
            marginBottom: '20px'
          }}>
            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '15px' }}>
                <strong>Bước 1: Nhập Mã số BHXH/thẻ BHYT</strong><br/>
                <span style={{ color: '#475569' }}>Đây là mã số CCCD của bạn hoặc mã số in trên thẻ BHYT.</span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>Bước 2: Nhập Họ và tên</strong><br/>
                <span style={{ color: '#475569' }}>Nhập đầy đủ họ và tên tiếng Việt có dấu (Ví dụ: Nguyễn Văn A).</span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>Bước 3: Nhập Ngày/tháng/năm sinh</strong><br/>
                <span style={{ color: '#475569' }}>Bạn có thể nhập đầy đủ ngày tháng năm (ví dụ: 31/12/1950) hoặc chỉ nhập năm sinh (ví dụ: 1950).</span>
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>Bước 4: Nhập Mã xác nhận</strong><br/>
                <span style={{ color: '#475569' }}>Nhập đúng các ký tự hiển thị trong ô hình ảnh mờ bên cạnh.</span>
              </li>
              <li style={{ marginBottom: '0' }}>
                <strong>Bước 5: Bấm nút "Tra cứu"</strong><br/>
                <span style={{ color: '#475569' }}>Hệ thống sẽ hiển thị kết quả bao gồm thông tin cá nhân và thời hạn sử dụng thẻ BHYT của bạn.</span>
              </li>
            </ol>
          </div>

          <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', padding: '15px 20px', marginTop: '30px', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ color: '#b91c1c', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>Lưu ý:</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#7f1d1d' }}>
              <li style={{ marginBottom: '6px' }}>Các trường có dấu <span style={{ color: 'red' }}>*</span> là bắt buộc phải nhập.</li>
              <li style={{ marginBottom: '6px' }}>Nếu mã xác nhận khó đọc, bạn có thể tải lại trang (nhấn F5) để lấy mã mới.</li>
              <li style={{ marginBottom: '6px' }}>Để sử dụng quyền lợi khám chữa bệnh BHYT, bạn cũng có thể sử dụng thẻ BHYT điện tử trên ứng dụng VNeID.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraCuuBHYTGuide;
