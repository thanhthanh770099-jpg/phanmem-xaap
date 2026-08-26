import React from 'react';

const PublicAnNinh = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ef4444', textAlign: 'center', marginBottom: '30px' }}>Công An - An Ninh Trật Tự</h1>
      
      <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#b91c1c', marginTop: 0 }}>Trực ban Công an Xã</h2>
        <p style={{ fontSize: '18px' }}><strong>Điện thoại:</strong> <a href="tel:0123456789" style={{ color: '#dc2626', textDecoration: 'none' }}>0123.456.789</a> (Cập nhật số điện thoại thực tế tại đây)</p>
        <p>Phục vụ 24/7 tiếp nhận các tin báo về tội phạm, vi phạm pháp luật và các vấn đề an ninh trật tự trên địa bàn.</p>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#374151', marginTop: 0 }}>Thông tin liên hệ các ấp</h2>
        <ul style={{ lineHeight: '1.8', color: '#4b5563' }}>
          <li><strong>Công an viên Ấp 1:</strong> 0901.xxx.xxx</li>
          <li><strong>Công an viên Ấp 2:</strong> 0902.xxx.xxx</li>
          <li><strong>Công an viên Ấp 3:</strong> 0903.xxx.xxx</li>
          {/* Add more as needed */}
        </ul>
        <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#9ca3af' }}>Danh sách đang được cập nhật...</p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/cong-dan" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Quay lại Cổng Thông Tin</a>
      </div>
    </div>
  );
};

export default PublicAnNinh;
