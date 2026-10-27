import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CheckCircle, Clock, MessageCircle, Phone, 
  Copy, Check, Download, Edit, Trash2, X, Send, RotateCcw, 
  Building2, AlertCircle
} from 'lucide-react';
import styles from './Feedback.module.css';

export const DEPARTMENTS = [
  'Phòng Văn hóa - Xã hội',
  'Phòng Kinh tế',
  'Văn phòng HĐND và UBND',
  'Trung tâm Phục vụ Hành chính công'
];

const Feedback = ({ user, refreshUnreadFeedbackCount }) => {
  const isAdmin = user?.role === 'admin' || user?.role === 'ubnd';
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form' | 'handle'
  const [feedbacks, setFeedbacks] = useState([]);
  const [hamlets, setHamlets] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hamletId: user?.role === 'user' ? user.id : '',
    content: '',
    imageUrl: ''
  });
  
  // Handle Form State
  const [handleData, setHandleData] = useState({
    responseNote: '',
    responseFileUrl: ''
  });

  // Department assignment state (Chuyển phòng ban chuyên môn)
  const [targetDepartment, setTargetDepartment] = useState('');
  const [deptNote, setDeptNote] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [isAssigningDept, setIsAssigningDept] = useState(false);
  const [isChangingDept, setIsChangingDept] = useState(false);

  // Forward Modal State (Chuyển lên Xã)
  const [forwardModalFeedback, setForwardModalFeedback] = useState(null);
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  // Edit Modal State (Dành cho Admin)
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hamletId: '',
    content: '',
    status: 'pending',
    responseNote: '',
    forwardNote: '',
    targetDepartment: '',
    departmentNote: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [handledSuccessData, setHandledSuccessData] = useState(null);
  const [zaloNoticeMessage, setZaloNoticeMessage] = useState('');

  useEffect(() => {
    if (viewMode === 'list') {
      fetchFeedbacks();
      fetchHamlets();
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
        email: '',
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

  const generateResultMessage = (name, content, responseNote, hasFile = false) => {
    const shortContent = content ? (content.length > 50 ? content.substring(0, 50) + '...' : content) : '';
    let msg = `UBND Xã Châu Thành thông báo kết quả xử lý phản ánh của ông/bà ${name || 'người dân'}:
- Vấn đề: "${shortContent}"
- Kết quả xử lý: ${responseNote || 'Đã được giải quyết.'}`;
    if (hasFile) {
      msg += `\n- File công văn: (Đã gửi kèm tệp văn bản / hình ảnh bên dưới)`;
    }
    msg += `\nTrân trọng cảm ơn!`;
    return msg;
  };

  const handleSendZalo = (phone, message, hasFile = false) => {
    const clean = getCleanPhone(phone);
    if (!clean) {
      alert('Không tìm thấy số điện thoại của người dân!');
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message);
    }
    if (hasFile) {
      setZaloNoticeMessage('Đã sao chép nội dung tin nhắn! Bạn chỉ cần nhấn Dán (Ctrl + V) và kéo thả file công văn đã tải vào Zalo để gửi cho người dân.');
    } else {
      setZaloNoticeMessage('Đã sao chép nội dung tin nhắn! Bạn chỉ cần nhấn Dán (Ctrl + V) và Gửi trong Zalo.');
    }
    setTimeout(() => setZaloNoticeMessage(''), 10000);
    window.open(`https://zalo.me/${clean}`, '_blank');
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
      
      const hasFile = !!handleData.responseFileUrl;
      const msg = generateResultMessage(selectedFeedback.name, selectedFeedback.content, handleData.responseNote, hasFile);

      setHandledSuccessData({
        phone: selectedFeedback.phone,
        email: selectedFeedback.email,
        name: selectedFeedback.name,
        message: msg,
        note: handleData.responseNote,
        responseFileUrl: handleData.responseFileUrl
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
        message: 'Đã hoàn tất xử lý ý kiến thành công! Bạn có thể bấm "Gửi qua Zalo" để gửi thông báo cho người dân.' 
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Có lỗi xảy ra khi xử lý.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openForwardModal = (fb) => {
    setForwardModalFeedback(fb);
    setTargetDepartment('');
    setForwardNote('Vấn đề vượt quá thẩm quyền giải quyết của Ban nhân dân ấp, kính chuyển UBND xã Châu Thành xem xét chỉ đạo giải quyết.');
  };

  const closeForwardModal = () => {
    setForwardModalFeedback(null);
    setForwardNote('');
    setTargetDepartment('');
  };

  const submitForward = async (e) => {
    e.preventDefault();
    if (!forwardModalFeedback) return;
    setIsForwarding(true);
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${forwardModalFeedback.id}/forward-to-commune`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forwardNote: forwardNote.trim(),
          forwardedBy: user.name || 'Ban nhân dân ấp',
          targetDepartment: targetDepartment || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi chuyển ý kiến lên xã');

      alert('Đã chuyển tiếp ý kiến lên UBND Xã thành công!');
      closeForwardModal();
      
      // Cập nhật selectedFeedback nếu đang mở
      if (selectedFeedback && selectedFeedback.id === forwardModalFeedback.id) {
        setSelectedFeedback(prev => ({
          ...prev,
          status: 'forwarded_to_commune',
          forward_note: forwardNote.trim(),
          forwarded_at: new Date().toISOString(),
          forwarded_by: user.name || 'Ban nhân dân ấp',
          target_department: targetDepartment || null
        }));
      }

      fetchFeedbacks();
      if (refreshUnreadFeedbackCount) {
        refreshUnreadFeedbackCount();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi chuyển tiếp ý kiến');
    } finally {
      setIsForwarding(false);
    }
  };

  const handleAssignDepartment = async (deptToAssign) => {
    if (!selectedFeedback) return;
    const finalDept = deptToAssign || targetDepartment;
    if (!finalDept) {
      alert('Vui lòng chọn phòng ban chuyên môn để chuyển.');
      return;
    }
    setIsAssigningDept(true);
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${selectedFeedback.id}/assign-department`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDepartment: finalDept,
          departmentNote: deptNote.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi chuyển phòng ban');

      alert(`Đã chuyển ý kiến cho ${finalDept} thành công!`);
      setSelectedFeedback(prev => ({
        ...prev,
        target_department: finalDept,
        department_note: deptNote.trim(),
        department_assigned_at: new Date().toISOString()
      }));
      setIsChangingDept(false);
      setDeptNote('');
      fetchFeedbacks();
    } catch (err) {
      alert(err.message || 'Lỗi khi chuyển phòng ban');
    } finally {
      setIsAssigningDept(false);
    }
  };

  const handleRecallForward = async (fb) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thu hồi kiến nghị của "${fb.name || 'người dân'}" về lại ấp để tự xử lý không?`)) {
      return;
    }
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${fb.id}/recall-forward`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi thu hồi');

      alert('Đã thu hồi chuyển tiếp thành công! Ý kiến đã trở về trạng thái Chờ xử lý của ấp.');
      
      if (selectedFeedback && selectedFeedback.id === fb.id) {
        setSelectedFeedback(prev => ({
          ...prev,
          status: 'pending',
          forward_note: null,
          forwarded_at: null,
          forwarded_by: null,
          target_department: null,
          department_note: null,
          department_assigned_at: null
        }));
      }

      fetchFeedbacks();
      if (refreshUnreadFeedbackCount) {
        refreshUnreadFeedbackCount();
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi thu hồi chuyển tiếp');
    }
  };

  const handleDeleteFeedback = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phản ánh của "${name || 'người dân'}" không? Thao tác này sẽ xóa vĩnh viễn dữ liệu.`)) {
      return;
    }
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi xóa');

      setFeedbacks(prev => prev.filter(item => item.id !== id));
      if (refreshUnreadFeedbackCount) {
        refreshUnreadFeedbackCount();
      }
      alert('Đã xóa phản ánh thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa phản ánh');
    }
  };

  const openEditModal = (fb) => {
    setEditingFeedback(fb);
    setEditFormData({
      name: fb.name || '',
      phone: fb.phone || '',
      email: fb.email || '',
      hamletId: fb.hamlet_id || (hamlets[0]?.id || ''),
      content: fb.content || '',
      status: fb.status || 'pending',
      responseNote: fb.response_note || '',
      forwardNote: fb.forward_note || '',
      targetDepartment: fb.target_department || '',
      departmentNote: fb.department_note || ''
    });
  };

  const closeEditModal = () => {
    setEditingFeedback(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editingFeedback) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/${editingFeedback.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật');

      fetchFeedbacks();
      if (refreshUnreadFeedbackCount) {
        refreshUnreadFeedbackCount();
      }
      setEditingFeedback(null);
      alert('Cập nhật phản ánh thành công!');
    } catch (err) {
      alert(err.message || 'Lỗi khi cập nhật ý kiến');
    } finally {
      setIsUpdating(false);
    }
  };

  const openHandleView = (fb) => {
    setSelectedFeedback(fb);
    setHandleData({
      responseNote: fb.response_note || '',
      responseFileUrl: fb.response_file_url || ''
    });
    setTargetDepartment(fb.target_department || '');
    setDeptNote(fb.department_note || '');
    setIsChangingDept(false);
    setHandledSuccessData(null);
    setStatus({ type: '', message: '' });
    setViewMode('handle');
  };

  const renderList = () => {
    const filteredFeedbacks = feedbacks.filter(fb => {
      if (filterDepartment === 'ALL') return true;
      if (filterDepartment === 'UNASSIGNED') return !fb.target_department;
      return fb.target_department === filterDepartment;
    });

    return (
      <>
        <div className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <h2 className={styles.title}>Danh Sách Ý Kiến, Kiến Nghị</h2>
            {isAdmin && (
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className={styles.select}
                style={{ padding: '6px 10px', fontSize: '13px', width: 'auto', borderRadius: '6px', borderColor: '#cbd5e1' }}
              >
                <option value="ALL">-- Tất cả phòng ban ({feedbacks.length}) --</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
                <option value="UNASSIGNED">Chưa chuyển phòng</option>
              </select>
            )}
          </div>
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
                <th width="14%">Họ và tên</th>
                {user.role !== 'user' && <th width="13%">Gửi đến</th>}
                <th width="24%">Nội dung</th>
                <th width="14%">Trạng thái</th>
                <th width={isAdmin ? "23%" : "15%"}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingFeedbacks ? (
                <tr>
                  <td colSpan={user.role !== 'user' ? 6 : 5} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td>
                </tr>
              ) : !Array.isArray(filteredFeedbacks) || filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan={user.role !== 'user' ? 6 : 5}>
                    <div className={styles.emptyState}>Chưa có ý kiến nào được ghi nhận.</div>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map(fb => (
                  <tr key={fb.id}>
                    <td>{new Date(fb.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <strong>{fb.name}</strong><br/>
                      <small>{fb.phone}</small>
                      {fb.email && <><br/><small style={{ color: '#0284c7' }}>{fb.email}</small></>}
                    </td>
                    {user.role !== 'user' && <td>{fb.hamlet_name}</td>}
                    <td style={{ whiteSpace: 'pre-wrap' }}>{fb.content}</td>
                    <td>
                      {fb.status === 'handled' ? (
                        <span className={`${styles.badge} ${styles.badgeHandled}`}>
                          <CheckCircle size={12} style={{marginRight:4, verticalAlign:'middle'}}/> Đã xử lý
                        </span>
                      ) : fb.status === 'forwarded_to_commune' ? (
                        <span className={`${styles.badge} ${isAdmin ? styles.badgeForwardedAlert : styles.badgeForwarded}`} title={`Đã chuyển tiếp lên UBND Xã (${new Date(fb.forwarded_at || fb.created_at).toLocaleDateString('vi-VN')})`}>
                          <Send size={12} style={{marginRight:4, verticalAlign:'middle'}}/> 
                          {isAdmin ? 'Ấp chuyển lên Xã' : 'Đã chuyển lên Xã'}
                        </span>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgePending}`}>
                          <Clock size={12} style={{marginRight:4, verticalAlign:'middle'}}/> Chờ xử lý
                        </span>
                      )}

                      {fb.target_department && (
                        <div style={{ marginTop: '5px' }}>
                          <span className={styles.deptBadge} title={`Chuyển đến: ${fb.target_department}`}>
                            <Building2 size={11} /> {fb.target_department}
                          </span>
                        </div>
                      )}
                    </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {fb.status === 'pending' ? (
                        <>
                          <button className={styles.actionBtn} style={{ padding: '5px 10px', fontSize: '13px' }} onClick={() => openHandleView(fb)}>
                            Xử lý
                          </button>
                          {!isAdmin && (
                            <button 
                              type="button"
                              className={styles.forwardBtn} 
                              style={{ padding: '5px 10px', fontSize: '13px' }} 
                              onClick={() => openForwardModal(fb)}
                              title="Trường hợp ấp không xử lý được thì chuyển tiếp lên UBND Xã"
                            >
                              <Send size={12} style={{ marginRight: 4 }} /> Chuyển lên Xã
                            </button>
                          )}
                        </>
                      ) : fb.status === 'forwarded_to_commune' ? (
                        <>
                          <button className={styles.secondaryBtn} style={{ margin: 0, padding: '5px 10px', fontSize: '13px' }} onClick={() => openHandleView(fb)}>
                            {isAdmin ? 'Xử lý kiến nghị' : 'Xem tình trạng'}
                          </button>
                          {!isAdmin && (
                            <button 
                              type="button"
                              className={styles.recallBtn} 
                              style={{ padding: '5px 8px', fontSize: '12px' }} 
                              onClick={() => handleRecallForward(fb)}
                              title="Thu hồi để ấp tự xử lý"
                            >
                              <RotateCcw size={12} style={{ marginRight: 3 }} /> Thu hồi
                            </button>
                          )}
                        </>
                      ) : (
                        <button className={styles.secondaryBtn} style={{ margin: 0, padding: '5px 10px', fontSize: '13px' }} onClick={() => openHandleView(fb)}>
                          Xem kết quả
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          <button 
                            type="button" 
                            className={styles.editBtn} 
                            onClick={() => openEditModal(fb)}
                            title="Sửa thông tin phản ánh"
                          >
                            <Edit size={13} /> Sửa
                          </button>
                          <button 
                            type="button" 
                            className={styles.deleteBtn} 
                            onClick={() => handleDeleteFeedback(fb.id, fb.name)}
                            title="Xóa phản ánh này"
                          >
                            <Trash2 size={13} /> Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </>
    );
  };

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
          <label className={styles.label}>Số điện thoại liên hệ (có Zalo) <span style={{ color: 'red' }}>*</span></label>
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
          <label className={styles.label}>Địa chỉ Email / Gmail (Tùy chọn)</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleCreateChange} 
            className={styles.input} 
            placeholder="Ví dụ: nguyenvana@gmail.com (không bắt buộc)"
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
          <div className={styles.infoRow}><span className={styles.infoLabel}>Người gửi:</span> {selectedFeedback.name} ({selectedFeedback.phone}) {selectedFeedback.email ? ` - Email: ${selectedFeedback.email}` : ''}</div>
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
            Nội dung thông báo kết quả gửi về Zalo người dân <strong>({handledSuccessData.phone || 'Chưa có SĐT'})</strong>:
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '12px 14px', borderRadius: '6px', fontSize: '13px', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
            {handledSuccessData.message}
          </div>
          <div className={styles.btnGroup}>
            {handledSuccessData.phone && (
              <button 
                type="button" 
                className={styles.zaloBtn}
                onClick={() => handleSendZalo(handledSuccessData.phone, handledSuccessData.message, !!handledSuccessData.responseFileUrl)}
              >
                <MessageCircle size={16} /> Gửi qua Zalo ({handledSuccessData.phone})
              </button>
            )}

            {handledSuccessData.responseFileUrl && (
              <a 
                href={handledSuccessData.responseFileUrl} 
                download={`CongVan_TraLoi_${selectedFeedback?.id || 'XuLy'}`}
                target="_blank"
                rel="noreferrer"
                className={styles.fileDownloadBtn}
              >
                <Download size={16} /> Tải file công văn gửi kèm
              </a>
            )}

            <button 
              type="button" 
              className={styles.copyBtn}
              onClick={() => handleCopyMessage(handledSuccessData.message)}
            >
              {copySuccess ? <Check size={16} color="green" /> : <Copy size={16} />}
              {copySuccess ? 'Đã sao chép!' : 'Sao chép nội dung'}
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
          {zaloNoticeMessage && (
            <div style={{ marginTop: '10px', color: '#0068ff', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <CheckCircle size={16} /> {zaloNoticeMessage}
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
              <div className={styles.sendCardHeader} style={{ color: '#0068ff' }}>
                <MessageCircle size={18} /> Gửi kết quả xử lý qua Zalo người dân ({selectedFeedback.phone}):
              </div>
              <div className={styles.btnGroup}>
                <button 
                  type="button" 
                  className={styles.zaloBtn}
                  onClick={() => handleSendZalo(
                    selectedFeedback.phone, 
                    generateResultMessage(selectedFeedback.name, selectedFeedback.content, selectedFeedback.response_note, !!selectedFeedback.response_file_url),
                    !!selectedFeedback.response_file_url
                  )}
                >
                  <MessageCircle size={16} /> Gửi qua Zalo ({selectedFeedback.phone})
                </button>

                {selectedFeedback.response_file_url && (
                  <a 
                    href={selectedFeedback.response_file_url} 
                    download={`CongVan_TraLoi_${selectedFeedback.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.fileDownloadBtn}
                  >
                    <Download size={16} /> Tải file công văn gửi kèm
                  </a>
                )}

                <button 
                  type="button" 
                  className={styles.copyBtn}
                  onClick={() => handleCopyMessage(generateResultMessage(selectedFeedback.name, selectedFeedback.content, selectedFeedback.response_note, !!selectedFeedback.response_file_url))}
                >
                  {copySuccess ? <Check size={16} color="green" /> : <Copy size={16} />}
                  {copySuccess ? 'Đã sao chép!' : 'Sao chép nội dung'}
                </button>

                {selectedFeedback.phone && (
                  <a 
                    href={`tel:${getCleanPhone(selectedFeedback.phone)}`}
                    className={styles.callBtn}
                  >
                    <Phone size={16} /> Gọi điện
                  </a>
                )}
              </div>
              {zaloNoticeMessage && (
                <div style={{ marginTop: '10px', color: '#0068ff', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', background: '#eff6ff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                  <CheckCircle size={16} /> {zaloNoticeMessage}
                </div>
              )}
            </div>
          )}
        </div>
      ) : selectedFeedback?.status === 'forwarded_to_commune' && !isAdmin ? (
        <div className={styles.forwardStatusCard}>
          <div className={styles.forwardStatusHeader}>
            <Building2 size={28} color="#4f46e5" />
            <div>
              <h3 style={{ margin: 0, color: '#312e81', fontSize: '17px' }}>
                Ý kiến này đã được chuyển lên Ủy ban nhân dân xã Châu Thành
              </h3>
              <p style={{ margin: '6px 0 0', color: '#4b5563', fontSize: '13px' }}>
                Thời gian chuyển: <strong>{new Date(selectedFeedback.forwarded_at || selectedFeedback.created_at).toLocaleString('vi-VN')}</strong>
                {selectedFeedback.forwarded_by && <> &bull; Đơn vị chuyển: <strong>{selectedFeedback.forwarded_by}</strong></>}
              </p>
            </div>
          </div>
          
          <div className={styles.forwardNoteBox}>
            <strong>Lý do chuyển / Ý kiến đề xuất của Ấp:</strong>
            <p>{selectedFeedback.forward_note || 'Vấn đề vượt quá thẩm quyền cấp ấp, kính chuyển UBND xã giải quyết.'}</p>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              className={styles.recallBtn}
              onClick={() => handleRecallForward(selectedFeedback)}
            >
              <RotateCcw size={14} style={{ marginRight: 4 }} /> Thu hồi để ấp tự xử lý
            </button>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              (Hiện tại ý kiến đang chờ UBND Xã tiếp nhận và xử lý)
            </span>
          </div>

          {selectedFeedback?.target_department && (
            <div style={{ marginTop: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 14px', color: '#1e40af', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#2563eb" />
              <span>Phòng ban chuyên môn Xã phụ trách: <strong style={{ color: '#1d4ed8' }}>{selectedFeedback.target_department}</strong></span>
            </div>
          )}
        </div>
      ) : (
        <>
          {selectedFeedback?.status === 'forwarded_to_commune' && isAdmin && (
            <div className={styles.forwardAlertCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold', fontSize: '15px', marginBottom: '6px' }}>
                <AlertCircle size={20} /> Ý KIẾN DO {selectedFeedback.hamlet_name?.toUpperCase() || 'ẤP'} CHUYỂN TIẾP LÊN XÃ
              </div>
              <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#78350f' }}>
                Thời gian chuyển: {new Date(selectedFeedback.forwarded_at || selectedFeedback.created_at).toLocaleString('vi-VN')}
                {selectedFeedback.forwarded_by && ` (Người chuyển: ${selectedFeedback.forwarded_by})`}
              </p>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px 12px', borderRadius: '6px', fontSize: '13px', color: '#92400e' }}>
                <strong>Lý do chuyển của Ấp:</strong> {selectedFeedback.forward_note || 'Vấn đề vượt quá thẩm quyền cấp ấp, kính chuyển UBND xã giải quyết.'}
              </div>
            </div>
          )}

          {/* Phân công / Chuyển cho các phòng ban chuyên môn (Dành cho Xã) */}
          {isAdmin && (
            <>
              {selectedFeedback?.target_department && !isChangingDept ? (
                <div className={styles.assignedDeptBox}>
                  <div className={styles.assignedDeptInfo}>
                    <Building2 size={24} color="#16a34a" />
                    <div>
                      <div>
                        Đơn vị chuyên môn phụ trách: <strong style={{ color: '#15803d', fontSize: '15px' }}>{selectedFeedback.target_department}</strong>
                      </div>
                      {selectedFeedback.department_note && (
                        <div style={{ fontSize: '13px', color: '#475569', fontWeight: 'normal', marginTop: '3px' }}>
                          Ghi chú phân công: <em>"{selectedFeedback.department_note}"</em>
                        </div>
                      )}
                      {selectedFeedback.department_assigned_at && (
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                          Thời gian chuyển: {new Date(selectedFeedback.department_assigned_at).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className={styles.changeDeptBtn}
                    onClick={() => {
                      setIsChangingDept(true);
                      setTargetDepartment(selectedFeedback.target_department || '');
                    }}
                  >
                    Chuyển sang phòng khác
                  </button>
                </div>
              ) : (
                <div className={styles.deptAssignCard}>
                  <div className={styles.deptAssignTitle}>
                    <Building2 size={18} color="#1e3c72" />
                    <span>
                      {selectedFeedback?.target_department ? 'Chuyển sang phòng ban chuyên môn khác:' : 'Chuyển cho phòng ban chuyên môn xử lý theo lĩnh vực:'}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#64748b' }}>
                    Chọn phòng ban phù hợp theo từng lĩnh vực phản ánh của người dân để chuyển phòng đó xử lý:
                  </p>
                  <div className={styles.deptChips}>
                    {DEPARTMENTS.map(dept => (
                      <button
                        key={dept}
                        type="button"
                        className={`${styles.deptChip} ${targetDepartment === dept ? styles.deptChipActive : ''}`}
                        onClick={() => setTargetDepartment(dept)}
                      >
                        🏢 {dept}
                      </button>
                    ))}
                  </div>

                  {targetDepartment && (
                    <div style={{ marginTop: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e3c72', marginBottom: '6px' }}>
                        Ghi chú phân công / giao việc cho {targetDepartment} (Tùy chọn):
                      </div>
                      <input 
                        type="text"
                        placeholder={`Ví dụ: Giao ${targetDepartment} kiểm tra thực địa, tham mưu trả lời trước ngày...`}
                        value={deptNote}
                        onChange={(e) => setDeptNote(e.target.value)}
                        className={styles.input}
                        style={{ marginBottom: '10px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center' }}
                          disabled={isAssigningDept}
                          onClick={() => handleAssignDepartment(targetDepartment)}
                        >
                          <Send size={14} style={{ marginRight: 6 }} />
                          {isAssigningDept ? 'Đang chuyển...' : `Xác Nhận Chuyển Cho ${targetDepartment}`}
                        </button>
                        {isChangingDept && (
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            style={{ margin: 0, padding: '8px 14px', fontSize: '13px' }}
                            onClick={() => setIsChangingDept(false)}
                          >
                            Hủy
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {!isAdmin && selectedFeedback?.status === 'pending' && (
            <div className={styles.forwardSectionCard}>
              <div className={styles.forwardSectionHeader}>
                <Building2 size={24} color="#4f46e5" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ margin: 0, color: '#312e81', fontSize: '15px' }}>
                    Trường hợp ấp không xử lý được (vượt thẩm quyền):
                  </h4>
                  <p style={{ margin: '4px 0 0', color: '#4b5563', fontSize: '13px', lineHeight: 1.5 }}>
                    Nếu nội dung kiến nghị vượt quá thẩm quyền của ấp hoặc cần UBND Xã và các ngành chuyên môn trực tiếp chỉ đạo, giải quyết, bạn có thể chuyển tiếp lên xã.
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                className={styles.forwardActionBtn}
                onClick={() => openForwardModal(selectedFeedback)}
              >
                <Send size={15} style={{ marginRight: 6 }} /> Chuyển Lên Ủy Ban Nhân Dân Xã
              </button>
            </div>
          )}

          <form className={styles.form} onSubmit={submitHandle}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                {isAdmin && selectedFeedback?.status === 'forwarded_to_commune' 
                  ? 'UBND Xã trả lời / xử lý kiến nghị của người dân' 
                  : 'Nội dung trả lời / xử lý của Ấp'}
              </label>
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

            {/* Khung thông báo gửi kết quả qua Zalo */}
            <div className={styles.sendCard}>
              <div className={styles.sendCardHeader} style={{ color: '#0068ff' }}>
                <MessageCircle size={18} /> Kết quả sẽ gửi qua Zalo người dân: <strong style={{ color: '#0f172a' }}>{selectedFeedback?.phone || 'Chưa có SĐT'}</strong>
              </div>
              <p style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Sau khi bấm <strong>Hoàn tất Xử Lý Ý Kiến</strong>, bạn có thể bấm nút <strong>Gửi qua Zalo</strong> để gửi tin nhắn thông báo giải quyết trực tiếp đến người dân (nội dung kết quả đã tự động sao chép, bạn chỉ việc Dán / Ctrl+V và Gửi).
              </p>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất Xử Lý Ý Kiến'}
            </button>
          </form>
        </>
      )}
    </>
  );

  const renderForwardModal = () => {
    if (!forwardModalFeedback) return null;
    
    const quickTemplates = [
      "Vấn đề vượt quá thẩm quyền giải quyết của Ban nhân dân ấp, kính chuyển UBND xã xem xét chỉ đạo giải quyết.",
      "Nội dung liên quan đến quy hoạch đất đai / xây dựng, kính đề nghị UBND xã và bộ phận chuyên môn kiểm tra xử lý.",
      "Tranh chấp, khiếu nại phức tạp giữa các bên, kính chuyển UBND xã giải quyết theo thẩm quyền.",
      "Cần hỗ trợ kinh phí hoặc đầu tư hạ tầng vượt khả năng của ấp, kính trình UBND xã."
    ];

    return (
      <div className={styles.modalOverlay} onClick={closeForwardModal}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
          <div className={styles.modalHeader} style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3c72' }}>
              <Building2 size={20} color="#4338ca" />
              <h3 className={styles.modalTitle} style={{ margin: 0, fontSize: '17px' }}>
                Chuyển Ý Kiến Lên Ủy Ban Nhân Dân Xã
              </h3>
            </div>
            <button type="button" className={styles.closeBtn} onClick={closeForwardModal}>
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={submitForward}>
            <div className={styles.modalBody}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>
                  Người gửi: <strong style={{ color: '#1e293b' }}>{forwardModalFeedback.name}</strong> ({forwardModalFeedback.phone})
                </div>
                <div style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{forwardModalFeedback.content}"
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Chuyển theo lĩnh vực phòng ban (Tùy chọn)
                </label>
                <select 
                  value={targetDepartment} 
                  onChange={(e) => {
                    const dept = e.target.value;
                    setTargetDepartment(dept);
                    if (dept === 'Phòng Văn hóa - Xã hội') {
                      setForwardNote('Phản ánh thuộc lĩnh vực văn hóa - xã hội, y tế, giáo dục, chính sách, kính chuyển UBND xã và Phòng Văn hóa - Xã hội xem xét giải quyết.');
                    } else if (dept === 'Phòng Kinh tế') {
                      setForwardNote('Phản ánh thuộc lĩnh vực kinh tế, sản xuất nông nghiệp, giao thông thủy lợi, thương mại, kính chuyển UBND xã và Phòng Kinh tế xem xét giải quyết.');
                    } else if (dept === 'Văn phòng HĐND và UBND') {
                      setForwardNote('Kiến nghị liên quan đến công tác chỉ đạo điều hành, tổng hợp, kính chuyển Văn phòng HĐND và UBND xã tham mưu giải quyết.');
                    } else if (dept === 'Trung tâm Phục vụ Hành chính công') {
                      setForwardNote('Phản ánh liên quan đến giải quyết thủ tục hành chính, dịch vụ công, kính chuyển Trung tâm Phục vụ Hành chính công xử lý.');
                    }
                  }}
                  className={styles.select}
                >
                  <option value="">-- Để UBND Xã tự phân công --</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                  Nếu xác định được phản ánh thuộc lĩnh vực nào, ấp có thể chọn phòng ban đó để xã phân công ngay.
                </small>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Lý do / Ý kiến đề xuất của Ấp khi chuyển lên Xã <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea 
                  rows={4}
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  className={styles.textarea}
                  placeholder="Nhập lý do chuyển tiếp hoặc ý kiến đề xuất giải quyết..."
                  required
                />
              </div>

              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Chọn nhanh lý do mẫu:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {quickTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        color: '#334155',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onClick={() => setForwardNote(tpl)}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={closeForwardModal} style={{ margin: 0 }}>
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                className={styles.forwardActionBtn}
                disabled={isForwarding || !forwardNote.trim()}
                style={{ margin: 0 }}
              >
                <Send size={15} style={{ marginRight: 6 }} />
                {isForwarding ? 'Đang chuyển...' : 'Xác Nhận Chuyển Lên UBND Xã'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditModal = () => {
    if (!editingFeedback) return null;
    return (
      <div className={styles.modalOverlay} onClick={closeEditModal}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Chỉnh Sửa Ý Kiến Phản Ánh</h3>
            <button type="button" className={styles.closeBtn} onClick={closeEditModal}>
              <X size={20} />
            </button>
          </div>
          <form onSubmit={submitEdit}>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Họ và tên người gửi <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text" 
                  name="name" 
                  value={editFormData.name} 
                  onChange={handleEditChange} 
                  className={styles.input} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Số điện thoại liên hệ <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={editFormData.phone} 
                  onChange={handleEditChange} 
                  className={styles.input} 
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Địa chỉ Email (Tùy chọn)</label>
                <input 
                  type="email" 
                  name="email" 
                  value={editFormData.email} 
                  onChange={handleEditChange} 
                  className={styles.input} 
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Gửi đến Ấp <span style={{ color: 'red' }}>*</span></label>
                <select 
                  name="hamletId" 
                  value={editFormData.hamletId} 
                  onChange={handleEditChange} 
                  className={styles.select} 
                  required
                >
                  {hamlets.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Nội dung phản ánh <span style={{ color: 'red' }}>*</span></label>
                <textarea 
                  name="content" 
                  value={editFormData.content} 
                  onChange={handleEditChange} 
                  className={styles.textarea} 
                  required 
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Trạng thái xử lý</label>
                <select 
                  name="status" 
                  value={editFormData.status} 
                  onChange={handleEditChange} 
                  className={styles.select}
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="forwarded_to_commune">Đã chuyển lên Xã</option>
                  <option value="handled">Đã xử lý</option>
                </select>
              </div>

              {editFormData.status === 'forwarded_to_commune' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Lý do / Ý kiến đề xuất của Ấp khi chuyển lên Xã</label>
                  <textarea 
                    name="forwardNote" 
                    value={editFormData.forwardNote || ''} 
                    onChange={handleEditChange} 
                    className={styles.textarea} 
                    placeholder="Nhập lý do chuyển lên xã..."
                    style={{ minHeight: '60px' }}
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Phòng ban chuyên môn phụ trách</label>
                <select 
                  name="targetDepartment" 
                  value={editFormData.targetDepartment || ''} 
                  onChange={handleEditChange} 
                  className={styles.select}
                >
                  <option value="">-- Chưa chuyển phòng ban --</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {editFormData.targetDepartment && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ghi chú phân công cho phòng ban</label>
                  <input 
                    type="text" 
                    name="departmentNote" 
                    value={editFormData.departmentNote || ''} 
                    onChange={handleEditChange} 
                    className={styles.input} 
                    placeholder="Ghi chú phân công..."
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Nội dung trả lời / giải quyết</label>
                <textarea 
                  name="responseNote" 
                  value={editFormData.responseNote} 
                  onChange={handleEditChange} 
                  className={styles.textarea} 
                  placeholder="Nhập nội dung xử lý giải quyết..."
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={closeEditModal} style={{ margin: 0 }}>
                Hủy bỏ
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isUpdating} style={{ margin: 0 }}>
                {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {viewMode === 'list' && renderList()}
      {viewMode === 'form' && renderForm()}
      {viewMode === 'handle' && renderHandle()}
      {renderEditModal()}
      {renderForwardModal()}
    </div>
  );
};

export default Feedback;
