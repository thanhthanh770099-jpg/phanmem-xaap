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
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', alignItems: 'center' }}>
            <img src="/smart_vinh_long_1.jpg" alt="Hướng dẫn Smart Vĩnh Long 1" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <img src="/smart_vinh_long_2.jpg" alt="Hướng dẫn Smart Vĩnh Long 2" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
            <img src="/smart_vinh_long_3.jpg" alt="Hướng dẫn Smart Vĩnh Long 3" style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartVinhLongGuide;
