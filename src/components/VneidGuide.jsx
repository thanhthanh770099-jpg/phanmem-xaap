import React from 'react';

const VneidGuide = () => {
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
            Hướng dẫn kích hoạt VNEID mức 2
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
            VIDEO HƯỚNG DẪN KÍCH HOẠT TÀI KHOẢN ĐỊNH DANH ĐIỆN TỬ (VNEID) MỨC ĐỘ 2
          </p>
          
          <video 
            controls 
            style={{ width: '100%', maxWidth: '600px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <source src="/vneid_huong_dan.mp4" type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VneidGuide;
