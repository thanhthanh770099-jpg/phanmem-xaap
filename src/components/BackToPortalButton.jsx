import React from 'react';
import { ArrowLeft } from 'lucide-react';

const BackToPortalButton = ({ style }) => {
  return (
    <a 
      href="/cong-dan" 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#475569',
        textDecoration: 'none',
        fontWeight: '600',
        fontSize: '14px',
        padding: '8px 14px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        marginBottom: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        alignSelf: 'flex-start',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#f1f5f9';
        e.currentTarget.style.color = '#0f172a';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#475569';
      }}
    >
      <ArrowLeft size={16} /> Quay lại Mô hình Ấp Thông Minh
    </a>
  );
};

export default BackToPortalButton;
