import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import styles from './Feedback.module.css';

const Feedback = ({ user, refreshUnreadFeedbackCount }) => {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'handle'
  const [feedbacks, setFeedbacks] = useState([]);
  const [hamlets, setHamlets] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hamletId: user?.role === 'user' ? user.id : '',
    content: ''
  });
  
  // Handle Form State
  const [handleData, setHandleData] = useState({
    responseNote: '',
    responseFileUrl: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);

  useEffect(() => {
    if (viewMode === 'list') {
      fetchFeedbacks();
      if (refreshUnreadFeedbackCount) {
        refreshUnreadFeedbackCount();
      }
    } else if (viewMode === 'form') {
      fetchHamlets();
    }
  }, [viewMode]);

  const fetchFeedbacks = async () => {
    setIsLoadingFeedbacks(true);
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setFeedbacks(data);
      } else {
        console.error("API error:", data);
        setFeedbacks([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ý kiến:', error);
      setFeedbacks([]);
    } finally {
      setIsLoadingFeedbacks(false);
    }
  };

  const fetchHamlets = async () => {
    try {
      const res = await fetch('https://phanmem-xaap.onrender.com/api/users/hamlets');
      const data = await res.json();
      setHamlets(data);
      if (data.length > 0 && !formData.hamletId && user.role !== 'user') {
        setFormData(prev => ({ ...prev, hamletId: data[0].id }));
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ấp:', error);
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleHandleChange = (e) => {
    const { name, value } = e.target;
    setHandleData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHandleData(prev => ({ ...prev, responseFileUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('https://phanmem-xaap.onrender.com/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setStatus({ type: 'success', message: 'Ghi nhận ý kiến thành công!' });
      
      setFormData(prev => ({
        ...prev,
        name: '',
        phone: '',
        content: ''
      }));
      
      setTimeout(() => setViewMode('list'), 2000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi gửi ý kiến.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitHandle = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${selectedFeedback.id}/handle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handleData)
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      
      setStatus({ type: 'success', message: 'Xử lý ý kiến thành công!' });
      
      setTimeout(() => setViewMode('list'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi xử lý.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openHandleView = (fb) => {
    setSelectedFeedback(fb);
    setHandleData({
      responseNote: fb.response_note || '',
      responseFileUrl: fb.response_file_url || ''
    });
    setStatus({ type: '', message: '' });
    setViewMode('handle');
  };

  const renderList = () => (
    <>
      <div className={styles.header}>
        <h2 className={styles.title}>Danh Sách Ý Kiến, Kiến Nghị</h2>
        <button className={styles.primaryBtn} onClick={() => {
          setViewMode('form');
          setStatus({ type: '', message: '' });
        }}>
          + Ghi nhận ý kiến mới
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th width="12%">Thời gian</th>
              <th width="15%">Họ và tên</th>
              {user.role === 'admin' && <th width="15%">Gửi đến</th>}
              <th width="25%">Nội dung</th>
              <th width="15%">Trạng thái</th>
              <th width="15%">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingFeedbacks ? (
              <tr>
                <td colSpan={user.role === 'admin' ? 6 : 5} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : !Array.isArray(feedbacks) || feedbacks.length === 0 ? (
              <tr>
                <td colSpan={user.role === 'admin' ? 6 : 5}>
                  <div className={styles.emptyState}>Chưa có ý kiến nào được ghi nhận.</div>
                </td>
              </tr>
            ) : (
              feedbacks.map(fb => (
                <tr key={fb.id}>
                  <td>{new Date(fb.created_at).toLocaleString('vi-VN')}</td>
                  <td>
                    <strong>{fb.name}</strong><br/>
                    <small>{fb.phone}</small>
                  </td>
                  {user.role === 'admin' && <td>{fb.hamlet_name}</td>}
                  <td style={{ whiteSpace: 'pre-wrap' }}>{fb.content}</td>
                  <td>
                    {fb.status === 'handled' ? (
                      <span className={`${styles.badge} ${styles.badgeHandled}`}><CheckCircle size={12} style={{marginRight:4, verticalAlign:'middle'}}/> Đã xử lý</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgePending}`}><Clock size={12} style={{marginRight:4, verticalAlign:'middle'}}/> Chờ xử lý</span>
                    )}
                  </td>
                  <td>
                    {fb.status === 'pending' ? (
                      <button className={styles.actionBtn} onClick={() => openHandleView(fb)}>
                        Xử lý ý kiến
                      </button>
                    ) : (
                      <button className={styles.secondaryBtn} style={{margin:0, padding:'6px 12px'}} onClick={() => openHandleView(fb)}>
                        Xem kết quả
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderForm = () => (
    <>
      <button className={styles.secondaryBtn} onClick={() => setViewMode('list')}>
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>
      
      <h2 className={styles.title} style={{ marginBottom: 24 }}>Ghi Nhận Ý Kiến Người Dân</h2>
      
      {status.message && (
        <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
          {status.message}
        </div>
      )}

      <form className={styles.form} onSubmit={submitCreate}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Họ và tên người gửi</label>
          <input type="text" name="name" value={formData.name} onChange={handleCreateChange} className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Số điện thoại liên hệ</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleCreateChange} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Gửi đến Ấp</label>
          <select name="hamletId" value={formData.hamletId} onChange={handleCreateChange} className={styles.select} required disabled={user.role === 'user'}>
            {user.role === 'user' ? (
              <option value={user.id}>{user.name}</option>
            ) : (
              hamlets.map(hamlet => <option key={hamlet.id} value={hamlet.id}>{hamlet.name}</option>)
            )}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nội dung ý kiến, kiến nghị</label>
          <textarea name="content" value={formData.content} onChange={handleCreateChange} className={styles.textarea} required />
        </div>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu Ý Kiến'}
        </button>
      </form>
    </>
  );

  const renderHandle = () => (
    <>
      <button className={styles.secondaryBtn} onClick={() => setViewMode('list')}>
        <ArrowLeft size={16} /> Quay lại
      </button>
      
      <h2 className={styles.title} style={{ marginBottom: 24 }}>Xử Lý Ý Kiến</h2>
      
      {status.message && (
        <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
          {status.message}
        </div>
      )}

      {selectedFeedback && (
        <div className={styles.feedbackInfo}>
          <div className={styles.infoRow}><span className={styles.infoLabel}>Người gửi:</span> {selectedFeedback.name} ({selectedFeedback.phone})</div>
          <div className={styles.infoRow}><span className={styles.infoLabel}>Thời gian gửi:</span> {new Date(selectedFeedback.created_at).toLocaleString('vi-VN')}</div>
          <div className={styles.infoRow}><span className={styles.infoLabel}>Nội dung:</span> <br/><span style={{whiteSpace:'pre-wrap'}}>{selectedFeedback.content}</span></div>
          {selectedFeedback.status === 'handled' && selectedFeedback.handled_at && (
             <div className={styles.infoRow} style={{marginTop: 16, color: '#155724'}}><span className={styles.infoLabel}>Đã xử lý lúc:</span> {new Date(selectedFeedback.handled_at).toLocaleString('vi-VN')}</div>
          )}
        </div>
      )}

      {selectedFeedback?.status === 'handled' ? (
        <div className={styles.form}>
           <div className={styles.formGroup}>
            <label className={styles.label}>Nội dung trả lời / xử lý:</label>
            <div className={styles.feedbackInfo} style={{backgroundColor: '#fff'}}>{selectedFeedback.response_note || 'Không có ghi chú'}</div>
          </div>
          {selectedFeedback.response_file_url && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Công văn đính kèm:</label>
              {selectedFeedback.response_file_url.startsWith('data:') ? (
                <a href={selectedFeedback.response_file_url} download={`CongVan_${selectedFeedback.id}`} style={{color:'#1e3c72', textDecoration:'underline'}}>Tải xuống công văn</a>
              ) : (
                <a href={selectedFeedback.response_file_url} target="_blank" rel="noreferrer" style={{color:'#1e3c72', textDecoration:'underline'}}>Xem công văn</a>
              )}
            </div>
          )}
        </div>
      ) : (
        <form className={styles.form} onSubmit={submitHandle}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nội dung trả lời / xử lý</label>
            <textarea 
              name="responseNote"
              value={handleData.responseNote}
              onChange={handleHandleChange}
              className={styles.textarea} 
              placeholder="Nhập ghi chú xử lý..."
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Up công văn xử lý (Tùy chọn)</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={handleFileUpload}
              className={styles.input} 
            />
            {handleData.responseFileUrl && <small style={{color:'green'}}>Đã chọn file đính kèm</small>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất Xử Lý'}
          </button>
        </form>
      )}
    </>
  );

  return (
    <div className={styles.container}>
      {viewMode === 'list' && renderList()}
      {viewMode === 'form' && renderForm()}
      {viewMode === 'handle' && renderHandle()}
    </div>
  );
};

export default Feedback;
