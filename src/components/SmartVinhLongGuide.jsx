import React from 'react';

const SmartVinhLongGuide = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f4f8', 
      backgroundImage: 'linear-gradient(135deg, #e0e8f5 0%, #f4f7f6 100%)',
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
          borderBottom: '1px solid #edf2f7',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            margin: 0, 
            color: '#dc2626', 
            fontSize: '24px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            Hướng dẫn cài đặt SMART Vĩnh Long
          </h2>
        </div>
        
        <div style={{ 
          padding: '30px', 
          overflowY: 'auto', 
          lineHeight: '1.7',
          color: '#334155',
          fontSize: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '20px', color: '#1e293b', textAlign: 'center' }}>
            HƯỚNG DẪN CÀI ĐẶT VÀ SỬ DỤNG ỨNG DỤNG SMART VĨNH LONG
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', maxWidth: '600px' }}>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0369a1', marginTop: 0, marginBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: '#0369a1', color: 'white', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '14px' }}>1</span>
                Tải và Cài đặt ứng dụng
              </h3>
              <p style={{ marginBottom: '15px', color: '#475569' }}>
                Truy cập vào <strong>CH Play</strong> (đối với điện thoại Android) hoặc <strong>App Store</strong> (đối với iPhone). Tìm kiếm từ khóa <strong>"SMART Vĩnh Long"</strong> và nhấn nút Cài đặt/Nhận.
              </p>
              <img src="/smart_vinh_long_1.jpg" alt="Bước 1" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0369a1', marginTop: 0, marginBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: '#0369a1', color: 'white', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '14px' }}>2</span>
                Cấp quyền cho ứng dụng
              </h3>
              <p style={{ marginBottom: '15px', color: '#475569' }}>
                Sau khi tải xong, mở ứng dụng lên. Ứng dụng sẽ yêu cầu một số quyền truy cập (như gửi thông báo, vị trí...). Bạn nhấn <strong>"Cho phép"</strong> để ứng dụng hoạt động đầy đủ tính năng.
              </p>
              <img src="/smart_vinh_long_2.jpg" alt="Bước 2" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#0369a1', marginTop: 0, marginBottom: '10px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: '#0369a1', color: 'white', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '14px' }}>3</span>
                Đăng nhập và Sử dụng
              </h3>
              <p style={{ marginBottom: '15px', color: '#475569' }}>
                Đăng nhập bằng số điện thoại hoặc tài khoản định danh điện tử VNeID. Tại màn hình chính, bạn có thể dễ dàng sử dụng các tiện ích như: Phản ánh hiện trường, Cổng dịch vụ công, Y tế, Giáo dục...
              </p>
              <img src="/smart_vinh_long_3.jpg" alt="Bước 3" style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartVinhLongGuide;
