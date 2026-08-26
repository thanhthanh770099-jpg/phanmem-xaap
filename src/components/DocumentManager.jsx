import React, { useState, useEffect, useRef } from 'react';
import styles from './DocumentManager.module.css';

const DocumentManager = ({ user, unreadDocCount, refreshUnreadCount }) => {
  const [isSending, setIsSending] = useState(false);
  const isAdmin = user.role === 'admin' || user.role === 'ubnd';
  const [currentTab, setCurrentTab] = useState('inbox'); // 'inbox' hoặc 'sent'
  const [documents, setDocuments] = useState([]);
  const [hamlets, setHamlets] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);

  const [number, setNumber] = useState('');
  const [summary, setSummary] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [selectedHamlets, setSelectedHamlets] = useState([]);

  // For Reply Feature
  const [replySummary, setReplySummary] = useState('');
  const [replyFileBase64, setReplyFileBase64] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchDocuments();
    if (isAdmin) fetchHamlets();
  }, [user, currentTab]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/documents?userId=${user.id}&type=${currentTab}`);
      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHamlets = async () => {
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/users/hamlets`);
      const data = await res.json();
      setHamlets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplyFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReplyFileBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendDocument = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://phanmem-xaap.onrender.com/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number, 
          summary, 
          fileUrl: fileBase64, 
          senderId: user.id, 
          senderRole: user.role,
          recipientIds: isAdmin ? selectedHamlets : undefined
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNumber(''); setSummary(''); setFileBase64(''); setSelectedHamlets([]);
        alert('Gửi văn bản thành công!');
        fetchDocuments();
      } else {
        const errorData = await res.text();
        alert('Lỗi khi gửi văn bản: ' + errorData);
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi kết nối: ' + e.message);
    }
  };

  const handleRowClick = async (doc) => {
    setShowDetail(doc);
    if (currentTab === 'inbox' && doc.status === 'unread') {
      try {
        await fetch(`https://phanmem-xaap.onrender.com/api/documents/${doc.id}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        });
        setDocuments(docs => docs.map(d => d.id === doc.id ? { ...d, status: 'read' } : d));
        if (refreshUnreadCount) refreshUnreadCount();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCompleteDocument = async () => {
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/documents/${showDetail.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        setDocuments(docs => docs.map(d => d.id === showDetail.id ? { ...d, status: 'completed' } : d));
        setShowDetail({ ...showDetail, status: 'completed' });
        alert('Đã xác nhận hoàn thành!');
      } else {
        alert('Có lỗi xảy ra');
      }
    } catch (e) {
      console.error(e);
      alert('Lỗi: ' + e.message);
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replySummary) return alert('Vui lòng nhập nội dung phản hồi');
    setIsReplying(true);
    
    try {
      // 1. Send the reply document
      const postRes = await fetch('https://phanmem-xaap.onrender.com/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: 'PH-' + showDetail.number, 
          summary: replySummary, 
          fileUrl: replyFileBase64, 
          senderId: user.id, 
          senderRole: user.role,
        })
      });

      if (!postRes.ok) {
        throw new Error('Lỗi khi gửi phản hồi');
      }

      // 2. Mark the original document as completed
      const putRes = await fetch(`https://phanmem-xaap.onrender.com/api/documents/${showDetail.id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!putRes.ok) {
        throw new Error('Lỗi khi xác nhận hoàn thành');
      }

      setDocuments(docs => docs.map(d => d.id === showDetail.id ? { ...d, status: 'completed' } : d));
      setShowDetail({ ...showDetail, status: 'completed' });
      setReplySummary('');
      setReplyFileBase64('');
      alert('Đã gửi phản hồi và hoàn thành công văn!');
      fetchDocuments(); // Refresh to see it in outbox
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản Lý Văn Bản</h2>
        <button className={styles.btn} onClick={() => setShowModal(true)}>
          + Tạo văn bản mới
        </button>
      </div>

      <div className={styles.tabContainer}>
        <div 
          className={`${styles.tab} ${currentTab === 'inbox' ? styles.activeTab : ''}`}
          onClick={() => setCurrentTab('inbox')}
        >
          Văn bản đến {unreadDocCount > 0 && <span className={styles.tabBadge}>{unreadDocCount}</span>}
        </div>
        <div 
          className={`${styles.tab} ${currentTab === 'sent' ? styles.activeTab : ''}`}
          onClick={() => setCurrentTab('sent')}
        >
          Văn bản đi
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              {currentTab === 'inbox' && <th>Người gửi</th>}
              <th>Số/Ký hiệu</th>
              <th>Trích yếu</th>
              <th>Ngày {currentTab === 'inbox' ? 'nhận' : 'gửi'}</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Không có văn bản nào.</td></tr>
            ) : documents.map(doc => {
              const isUnread = currentTab === 'inbox' && doc.status === 'unread';
              return (
                <tr key={doc.id} onClick={() => handleRowClick(doc)} className={isUnread ? styles.unreadRow : ''}>
                  {currentTab === 'inbox' && <td>{doc.sender_name}</td>}
                  <td>{doc.number}</td>
                  <td>{doc.summary.length > 50 ? doc.summary.substring(0, 50) + '...' : doc.summary}</td>
                  <td>{new Date(doc.created_at).toLocaleString('vi-VN')}</td>
                  <td>
                    {currentTab === 'sent' ? (
                      <span className={styles.badgeRead}>{doc.read_count} / {doc.total_recipients} đã đọc/hoàn thành</span>
                    ) : (
                      <span className={isUnread ? `${styles.badge} ${styles.badgeNew}` : doc.status === 'completed' ? `${styles.badge} ${styles.badgeCompleted}` : `${styles.badge} ${styles.badgeRead}`}>
                        {isUnread ? 'Mới' : doc.status === 'completed' ? 'Hoàn thành' : 'Đã đọc'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Tạo văn bản mới</h3>
            <form onSubmit={handleSendDocument}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Số/Ký hiệu văn bản</label>
                <input required className={styles.input} value={number} onChange={e => setNumber(e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Trích yếu nội dung</label>
                <textarea required className={styles.textarea} value={summary} onChange={e => setSummary(e.target.value)}></textarea>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>File đính kèm (PDF/Word)</label>
                <input required type="file" onChange={handleFileChange} />
              </div>
              
              {isAdmin && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Chọn người nhận (Để trống nếu gửi tất cả các ấp)</label>
                  <div className={styles.recipientList}>
                    {hamlets.map(h => (
                      <label key={h.id} className={styles.recipientItem}>
                        <input 
                          type="checkbox" 
                          checked={selectedHamlets.includes(h.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedHamlets([...selectedHamlets, h.id]);
                            else setSelectedHamlets(selectedHamlets.filter(id => id !== h.id));
                          }}
                        />
                        {h.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {!isAdmin && (
                <div style={{ marginBottom: '16px', color: '#1557b0', fontSize: '14px' }}>
                  * Văn bản này sẽ được gửi trực tiếp đến UBND Xã (Admin).
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className={styles.btn}>Gửi văn bản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ width: '600px' }}>
            <h3 className={styles.modalTitle}>Chi tiết văn bản</h3>
            <p><strong>Số/Ký hiệu:</strong> {showDetail.number}</p>
            {currentTab === 'inbox' && <p><strong>Người gửi:</strong> {showDetail.sender_name}</p>}
            <p><strong>Ngày gửi:</strong> {new Date(showDetail.created_at).toLocaleString('vi-VN')}</p>
            <p><strong>Trích yếu:</strong> {showDetail.summary}</p>
            
            {showDetail.file_url && (
              <div style={{ marginTop: '20px' }}>
                <a href={showDetail.file_url} download={`VanBan_${showDetail.number}`} className={styles.btn} style={{ textDecoration: 'none' }}>
                  Tải file đính kèm
                </a>
              </div>
            )}

            {currentTab === 'sent' && showDetail.recipients && (
              <div style={{ marginTop: '20px' }}>
                <h4>Thống kê người nhận</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>Người nhận</th><th>Trạng thái</th><th>Thời gian xem</th></tr>
                    </thead>
                    <tbody>
                      {showDetail.recipients.map((r, i) => (
                        <tr key={i}>
                          <td>{r.name}</td>
                          <td>
                            <span className={r.status === 'completed' ? styles.badgeCompleted : r.status === 'read' ? styles.badgeRead : styles.badgeNew} style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>
                              {r.status === 'completed' ? 'Hoàn thành' : r.status === 'read' ? 'Đã đọc' : 'Chưa đọc'}
                            </span>
                          </td>
                          <td>{r.read_at ? new Date(r.read_at).toLocaleString('vi-VN') : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isAdmin && currentTab === 'inbox' && showDetail.status !== 'completed' && (
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Phản hồi công văn</h4>
                <form onSubmit={handleSubmitReply}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Nội dung phản hồi báo cáo</label>
                    <textarea 
                      required 
                      className={styles.textarea} 
                      value={replySummary} 
                      onChange={e => setReplySummary(e.target.value)}
                      placeholder="Nhập nội dung báo cáo tiến độ..."
                    ></textarea>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>File đính kèm báo cáo (tùy chọn)</label>
                    <input type="file" onChange={handleReplyFileChange} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className={styles.btn} style={{ backgroundColor: '#10b981' }} disabled={isReplying}>
                      {isReplying ? 'Đang gửi...' : 'Gửi phản hồi & Hoàn thành'}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className={styles.modalActions}>
              <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => {
                setShowDetail(null);
                setReplySummary('');
                setReplyFileBase64('');
              }}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
