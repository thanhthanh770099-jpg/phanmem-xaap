import React, { useState, useEffect } from 'react';
import styles from './Feedback.module.css';

const PublicFeedback = () => {
  const [hamlets, setHamlets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    hamletId: '',
    content: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHamlets();
  }, []);

  const fetchHamlets = async () => {
    try {
      const res = await fetch('https://phanmem-xaap.onrender.com/api/users/hamlets');
      const data = await res.json();
      setHamlets(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, hamletId: data[0].id }));
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ấp:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
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
      
      setStatus({ type: 'success', message: 'Ghi nhận ý kiến thành công! Cảm ơn bạn đã phản ánh.' });
      
      setFormData(prev => ({
        ...prev,
        name: '',
        phone: '',
        content: ''
      }));
      
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi gửi ý kiến.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f7f6', height: '100vh', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
      <div className={styles.container} style={{ margin: 0, width: '100%', maxWidth: '600px' }}>
        <h2 className={styles.title} style={{ textAlign: 'center', marginBottom: '24px' }}>Cổng Phản Ánh Kiến Nghị</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
          Vui lòng điền thông tin và nội dung phản ánh để gửi đến Ban Lãnh đạo các Ấp thuộc Xã Châu Thành.
        </p>

        {status.message && (
          <div className={`${styles.message} ${status.type === 'success' ? styles.success : styles.error}`}>
            {status.message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit} style={{ margin: '0 auto' }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Họ và tên người gửi <span style={{color: 'red'}}>*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Số điện thoại liên hệ</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.input} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Gửi đến Ấp <span style={{color: 'red'}}>*</span></label>
            <select name="hamletId" value={formData.hamletId} onChange={handleChange} className={styles.select} required>
              {hamlets.map(hamlet => (
                <option key={hamlet.id} value={hamlet.id}>{hamlet.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Nội dung ý kiến, kiến nghị <span style={{color: 'red'}}>*</span></label>
            <textarea name="content" value={formData.content} onChange={handleChange} className={styles.textarea} required />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting} style={{ width: '100%', textAlign: 'center' }}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi Ý Kiến'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublicFeedback;
