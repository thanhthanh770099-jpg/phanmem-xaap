import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className={styles.statInfo}>
      <h3 className={styles.statTitle}>{title}</h3>
      <p className={styles.statValue}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('https://phanmem-xaap.onrender.com/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Lỗi khi tải dữ liệu thống kê:', err));
  }, []);

  if (!stats) return <div style={{ padding: '24px' }}>Đang tải dữ liệu từ máy chủ...</div>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerArea}>
        <h2>Tổng quan tiến độ thực hiện công việc Xã - Ấp</h2>
        <p className={styles.subtitle}>Cập nhật mới nhất: Hôm nay</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard title="Tổng số công văn đi" value={stats.totalDocuments} icon={<FileText size={24} color="white" />} color="#3b82f6" />
        <StatCard title="Ấp đã phản hồi" value={`${stats.respondedHamlets}/${stats.totalHamlets}`} icon={<Users size={24} color="white" />} color="#10b981" />
        <StatCard title="Nhiệm vụ hoàn thành" value={`${stats.completedTaskPercent}%`} icon={<CheckCircle size={24} color="white" />} color="#8b5cf6" />
        <StatCard title="Công văn chờ xử lý" value={stats.pendingDocuments} icon={<Clock size={24} color="white" />} color="#f59e0b" />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Tiến độ thực hiện theo Ấp</h3>
          <div className={styles.placeholderChart}>
            {stats.hamletsProgress.map((hamlet, index) => {
              const progress = hamlet.progress;
              let color = '#3b82f6';
              if (progress < 50) color = '#ef4444';
              else if (progress < 75) color = '#f59e0b';
              else if (progress === 100) color = '#10b981';

              return (
                <div key={index} className={styles.barItem}>
                  <span className={styles.barLabel}>{hamlet.name}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${progress}%`, backgroundColor: color }}></div>
                  </div>
                  <span className={styles.barValue}>{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Công văn mới nhất</h3>
          <ul className={styles.docList}>
            {stats.recentDocs && stats.recentDocs.length > 0 ? (
              stats.recentDocs.map(doc => (
                <li key={doc.id} className={styles.docItem}>
                  <div className={styles.docIcon}><FileText size={18} /></div>
                  <div className={styles.docDetails}>
                    <p className={styles.docName}>{doc.number} - {doc.summary}</p>
                    <span className={styles.docTime}>{new Date(doc.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </li>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Chưa có công văn nào</div>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
