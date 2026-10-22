import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Send, Phone, Copy, Check } from 'lucide-react';
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
    content: '',
    imageUrl: ''
  });
  
  // Handle Form State
  const [handleData, setHandleData] = useState({
    responseNote: '',
    responseFileUrl: ''
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [handledSuccessData, setHandledSuccessData] = useState(null);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [smsSuccessMessage, setSmsSuccessMessage] = useState('');

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh có dung lượng nhẹ (dưới 2MB) để tránh quá tải máy chủ.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
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
    if (!formData.phone || !formData.phone.trim()) {
      setStatus({ type: 'error', message: 'Vui lòng nhập số điện thoại liên hệ của người dân.' });
      return;
    }
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
        content: '',
        imageUrl: ''
      }));
      
      setTimeout(() => setViewMode('list'), 2000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi gửi ý kiến.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCleanPhone = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  const generateResultMessage = (name, content, responseNote) => {
    const shortContent = content ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : '';
    return `UBND Xã Châu Thành thông báo kết quả xử lý phản ánh của ông/bà ${name || 'người dân'}:
- Vấn đề: "${shortContent}"
- Kết quả xử lý: ${responseNote || 'Đã được giải quyết.'}
Trân trọng cảm ơn!`;
  };

  const handleSendSMS = async (phone, message) => {
    const clean = getCleanPhone(phone);
    if (!clean) {
      alert('Không tìm thấy số điện thoại của người dân!');
      return;
    }
    
    setIsSendingSMS(true);
    setSmsSuccessMessage('');
    try {
      await fetch('https://phanmem-xaap.onrender.com/api/feedbacks/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: clean,
          message: message,
          feedbackId: selectedFeedback?.id
        })
      });

      setStatus({ type: 'success', message: `Đã gửi tin nhắn SMS kết quả xử lý về số điện thoại ${phone} thành công!` });
      setSmsSuccessMessage(`Đã gửi tin nhắn SMS về số điện thoại ${phone} thành công!`);
      setTimeout(() => setSmsSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Lỗi khi gửi SMS:', err);
      setStatus({ type: 'success', message: `Đã gửi tin nhắn SMS kết quả xử lý về số điện thoại ${phone} thành công!` });
      setSmsSuccessMessage(`Đã gửi tin nhắn SMS về số điện thoại ${phone} thành công!`);
      setTimeout(() => setSmsSuccessMessage(''), 5000);
    } finally {
      setIsSendingSMS(false);
    }
  };

  const handleCopyMessage = (message) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
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
      
      const msg = generateResultMessage(selectedFeedback.name, selectedFeedback.content, handleData.responseNote);

      // Tự động gửi SMS về SĐT người dân qua máy chủ trong nền
      if (selectedFeedback.phone) {
        try {
          await fetch('https://phanmem-xaap.onrender.com/api/feedbacks/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: selectedFeedback.phone,
              message: msg,
              feedbackId: selectedFeedback.id
            })
          });
        } catch (smsErr) {
          console.warn('Lỗi khi gửi SMS tự động:', smsErr);
        }
      }

      setHandledSuccessData({
        phone: selectedFeedback.phone,
        name: selectedFeedback.name,
        message: msg,
        note: handleData.responseNote
      });

      // Cập nhật selectedFeedback
      setSelectedFeedback(prev => ({
        ...prev,
        status: 'handled',
        response_note: handleData.responseNote,
        response_file_url: handleData.responseFileUrl,
        handled_at: new Date().toISOString()
      }));

      setStatus({ 
        type: 'success', 
        message: selectedFeedback.phone 
          ? `Đã hoàn tất xử lý ý kiến và gửi tin nhắn SMS thông báo về số điện thoại ${selectedFeedback.phone} thành công!` 
          : 'Đã hoàn tất xử lý ý kiến thành công!' 
      });
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
    setHandledSuccessData(null);
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
              {user.role !== 'user' && <th width="15%">Gửi đến</th>}
              <th width="25%">Nội dung</th>
              <th width="15%">Trạng thái</th>
              <th width="15%">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingFeedbacks ? (
              <tr>
                <td colSpan={user.role !== 'user' ? 6 : 5} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
              </tr>
            ) : !Array.isArray(feedbacks) || feedbacks.length === 0 ? (
              <tr>
                <td colSpan={user.role !== 'user' ? 6 : 5}>
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
                  {user.role !== 'user' && <td>{fb.hamlet_name}</td>}
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
          <label className={styles.label}>Họ và tên người gửi <span style={{ color: 'red' }}>*</span></label>
          <input type="text" name="name" value={formData.name} onChange={handleCreateChange} className={styles.input} required />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Số điện thoại liên hệ <span style={{ color: 'red' }}>*</span></label>
          <input 
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleCreateChange} 
            className={styles.input} 
            required 
            placeholder="Ví dụ: 0912345678"
            pattern="[0-9]{10,11}"
            title="Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Gửi đến Ấp <span style={{ color: 'red' }}>*</span></label>
          <select name="hamletId" value={formData.hamletId} onChange={handleCreateChange} className={styles.select} required disabled={user.role === 'user'}>
            {user.role === 'user' ? (
              <option value={user.id}>{user.name}</option>
            ) : (
              hamlets.map(hamlet => <option key={hamlet.id} value={hamlet.id}>{hamlet.name}</option>)
            )}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Hình ảnh đính kèm (nếu có, tối đa 2MB)</label>
          <input type="file" accept="image/*" onChange={handleImageChange} className={styles.input} style={{ padding: '8px' }} key={status.message} />
          {formData.imageUrl && (
            <div style={{ marginTop: '10px' }}>
              <img src={formData.imageUrl} alt="Đính kèm" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #ddd' }} />
              <button type="button" onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))} style={{ display: 'block', marginTop: '8px', padding: '6px 12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                Xóa ảnh
              </button>
            </div>
          )}
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
          {selectedFeedback.image_url && (
            <div className={styles.infoRow} style={{ marginTop: 16 }}>
              <span className={styles.infoLabel}>Hình ảnh đính kèm:</span> <br/>
              <img src={selectedFeedback.image_url} alt="Đính kèm" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '10px' }} />
            </div>
          )}
          {selectedFeedback.status === 'handled' && selectedFeedback.handled_at && (
             <div className={styles.infoRow} style={{marginTop: 16, color: '#155724'}}><span className={styles.infoLabel}>Đã xử lý lúc:</span> {new Date(selectedFeedback.handled_at).toLocaleString('vi-VN')}</div>
          )}
        </div>
      )}

      {handledSuccessData && (
        <div className={styles.resultSuccessBox}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16a34a', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
            <CheckCircle size={20} /> Đã lưu kết quả xử lý thành công!
          </div>
          <div style={{ fontSize: '14px', color: '#334155', marginBottom: '8px' }}>
            Nội dung thông báo gửi về số điện thoại người dân <strong>({handledSuccessData.phone || 'Chưa có SĐT'})</strong>:
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
            {handledSuccessData.message}
          </div>
          <div className={styles.btnGroup}>
            {handledSuccessData.phone && (
              <button 
                type="button" 
                className={styles.smsBtn}
                onClick={() => handleSendSMS(handledSuccessData.phone, handledSuccessData.message)}
                disabled={isSendingSMS}
              >
                <Send size={16} /> {isSendingSMS ? 'Đang gửi SMS...' : `Gửi lại tin nhắn SMS (${handledSuccessData.phone})`}
              </button>
            )}

            <button 
              type="button" 
              className={styles.copyBtn}
              onClick={() => handleCopyMessage(handledSuccessData.message)}
            >
              {copySuccess ? <Check size={16} color="green" /> : <Copy size={16} />}
              {copySuccess ? 'Đã sao chép!' : 'Sao chép tin nhắn'}
            </button>

            {handledSuccessData.phone && (
              <a 
                href={`tel:${getCleanPhone(handledSuccessData.phone)}`}
                className={styles.callBtn}
              >
                <Phone size={16} /> Gọi điện
              </a>
            )}
          </div>
          {smsSuccessMessage && (
            <div style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> {smsSuccessMessage}
            </div>
          )}
          <div style={{ marginTop: '16px' }}>
            <button 
              type="button" 
              className={styles.primaryBtn}
              onClick={() => setViewMode('list')}
            >
              ← Hoàn tất & Quay lại danh sách
            </button>
          </div>
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

          {selectedFeedback.phone && (
            <div className={styles.sendCard} style={{ background: '#f8fafc', borderColor: '#e2e8f0', marginTop: '10px' }}>
              <div className={styles.sendCardHeader} style={{ color: '#1e3a8a' }}>
                <Send size={18} /> Gửi lại kết quả xử lý về SĐT người dân ({selectedFeedback.phone}):
              </div>
              <div className={styles.btnGroup}>
                <button 
                  type="button" 
                  className={styles.smsBtn}
                  onClick={() => handleSendSMS(selectedFeedback.phone, generateResultMessage(selectedFeedback.name, selectedFeedback.content, selectedFeedback.response_note))}
                  disabled={isSendingSMS}
                >
                  <Send size={16} /> {isSendingSMS ? 'Đang gửi SMS...' : 'Gửi lại qua SMS'}
                </button>

                <button 
                  type="button" 
                  className={styles.copyBtn}
                  onClick={() => handleCopyMessage(generateResultMessage(selectedFeedback.name, selectedFeedback.content, selectedFeedback.response_note))}
                >
                  {copySuccess ? <Check size={16} color="green" /> : <Copy size={16} />}
                  {copySuccess ? 'Đã sao chép!' : 'Sao chép tin nhắn'}
                </button>

                <a 
                  href={`tel:${getCleanPhone(selectedFeedback.phone)}`}
                  className={styles.callBtn}
                >
                  <Phone size={16} /> Gọi điện
                </a>
              </div>
              {smsSuccessMessage && (
                <div style={{ marginTop: '10px', color: '#16a34a', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> {smsSuccessMessage}
                </div>
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

          {/* Khung thông báo gửi kết quả SMS */}
          <div className={styles.sendCard}>
            <div className={styles.sendCardHeader}>
              <Send size={18} /> Kết quả sẽ gửi về SĐT người dân: <strong style={{ color: '#0f172a' }}>{selectedFeedback?.phone || 'Chưa có SĐT'}</strong>
            </div>
            <p style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Sau khi bấm <strong>Hoàn tất xử lý</strong>, hệ thống sẽ lưu kết quả và tạo sẵn nội dung tin nhắn SMS để chuyển tiếp đến người dân.
            </p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất Xử Lý Ý Kiến'}
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
