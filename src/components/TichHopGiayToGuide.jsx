import React from 'react';
import { ExternalLink, FolderOpen } from 'lucide-react';
import BackToPortalButton from './BackToPortalButton';

const DRIVE_FOLDER_ID = '1XxOD_vUWCmBbo30yMBNJknf3UY6S-im7';
const DRIVE_URL = `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}?usp=sharing`;
const DRIVE_EMBED_URL = `https://drive.google.com/embeddedfolderview?id=${DRIVE_FOLDER_ID}#list`;

const TichHopGiayToGuide = () => {
  return (
    <div style={{
      height: '100vh',
      overflowY: 'auto',
      backgroundColor: '#f0f4f8',
      backgroundImage: 'linear-gradient(135deg, #e8f5ec 0%, #f4f7f6 100%)',
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
        <div style={{ padding: '24px 30px', borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>
          <img src="/images/vneid.png" alt="VNeID" style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '10px' }} />
          <h2 style={{
            margin: 0,
            color: '#16a34a',
            fontSize: '22px',
            fontWeight: '700',
            textTransform: 'uppercase',
            lineHeight: 1.4
          }}>
            Hướng dẫn tích hợp 13 loại giấy tờ trên VNeID
          </h2>
          <p style={{ margin: '10px 0 0', color: '#475569', fontSize: '15px', lineHeight: 1.6 }}>
            Hướng dẫn từng bước tích hợp giấy tờ cá nhân lên ứng dụng VNeID, dễ làm, làm được ngay.
          </p>
        </div>

        <div style={{ padding: '24px 30px 30px', color: '#334155', fontSize: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#16a34a',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(22,163,74,0.3)'
              }}
            >
              <FolderOpen size={18} /> Mở tài liệu hướng dẫn <ExternalLink size={16} />
            </a>
          </div>

          <p style={{ margin: '0 0 10px', fontWeight: '600', color: '#1e293b' }}>
            Danh sách tài liệu (bấm vào từng tài liệu để xem):
          </p>
          <iframe
            src={DRIVE_EMBED_URL}
            title="Tài liệu hướng dẫn tích hợp giấy tờ trên VNeID"
            style={{
              width: '100%',
              height: '520px',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              backgroundColor: '#fff'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TichHopGiayToGuide;
