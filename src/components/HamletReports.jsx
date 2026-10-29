import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  BarChart3, FileSpreadsheet, Download, RefreshCw, 
  Search, CheckCircle2, Clock, AlertCircle, 
  FileText, MessageSquare, Award, Eye, 
  TrendingUp, Users, Building2, Check, ExternalLink
} from 'lucide-react';
import styles from './HamletReports.module.css';

const API_BASE = 'https://phanmem-xaap.onrender.com';

const HamletReports = ({ user }) => {
  const isHamlet = user?.role === 'user';

  // Filters state
  const [selectedHamlet, setSelectedHamlet] = useState(isHamlet ? String(user.id) : 'ALL');
  const [period, setPeriod] = useState('ALL'); // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Active view tab
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents' | 'feedbacks'

  // Sub filters
  const [filterDocStatus, setFilterDocStatus] = useState('ALL'); // 'ALL' | 'completed' | 'read' | 'unread'
  const [filterFbStatus, setFilterFbStatus] = useState('ALL'); // 'ALL' | 'handled' | 'pending' | 'forwarded_to_commune'

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [hamletsList, setHamletsList] = useState([]);
  const [hamletStats, setHamletStats] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState({
    totalHamlets: 20,
    totalDocsAssigned: 0,
    totalDocsCompleted: 0,
    totalDocsRead: 0,
    totalDocsUnread: 0,
    avgDocProgress: 0,
    totalFeedbacks: 0,
    totalFeedbacksHandled: 0,
    totalFeedbacksPending: 0,
    totalFeedbacksForwarded: 0,
    avgFeedbackProgress: 0,
    overallScore: 0
  });

  // Calculate dates based on period
  const handlePeriodChange = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    const now = new Date();
    let start = '';
    let end = '';

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (selectedPeriod === 'TODAY') {
      start = formatDate(now);
      end = formatDate(now);
    } else if (selectedPeriod === 'THIS_WEEK') {
      const dayOfWeek = now.getDay() || 7; // 1 (Mon) to 7 (Sun)
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek + 1);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      start = formatDate(monday);
      end = formatDate(sunday);
    } else if (selectedPeriod === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (selectedPeriod === 'THIS_QUARTER') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const firstDay = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const lastDay = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
      start = formatDate(firstDay);
      end = formatDate(lastDay);
    } else if (selectedPeriod === 'THIS_YEAR') {
      start = `${now.getFullYear()}-01-01`;
      end = `${now.getFullYear()}-12-31`;
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Fetch report data with smart fallback
  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // 1. Try dedicated report API endpoint
      let url = `${API_BASE}/api/reports/hamlet-stats?`;
      const params = new URLSearchParams();
      if (selectedHamlet !== 'ALL') params.append('hamletId', selectedHamlet);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += params.toString();

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHamletStats(data.hamletStats || []);
        setSummary(data.summary || {});
        setDocuments(data.documents || []);
        setFeedbacks(data.feedbacks || []);

        if (hamletsList.length === 0 && data.hamletStats) {
          setHamletsList(data.hamletStats.map(h => ({ id: h.hamletId, name: h.hamletName })));
        }
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Report API endpoint not ready or error, calculating client-side fallback:', e.message);
    }

    // 2. Client-side Fallback calculation (seamless)
    try {
      const [hamletsRes, docsRes, fbsRes] = await Promise.all([
        fetch(`${API_BASE}/api/users/hamlets`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/documents?userId=${user.id}&type=sent`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/api/feedbacks?userId=${user.id}&role=admin`).then(r => r.json()).catch(() => [])
      ]);

      const hamlets = Array.isArray(hamletsRes) ? hamletsRes : [];
      setHamletsList(hamlets);

      // Parse and filter docs
      const rawDocs = Array.isArray(docsRes) ? docsRes : [];
      let docDetails = [];
      rawDocs.forEach(d => {
        if (d.recipients && Array.isArray(d.recipients)) {
          d.recipients.forEach(r => {
            const docDate = d.created_at ? d.created_at.split('T')[0] : '';
            if (startDate && docDate < startDate) return;
            if (endDate && docDate > endDate) return;

            docDetails.push({
              id: d.id,
              number: d.number,
              summary: d.summary,
              file_url: d.file_url,
              created_at: d.created_at,
              sender_name: 'UBND Xã Châu Thành',
              hamlet_id: r.recipient_id,
              hamlet_name: r.name,
              status: r.status,
              read_at: r.read_at
            });
          });
        }
      });

      // Parse and filter feedbacks
      const rawFbs = Array.isArray(fbsRes) ? fbsRes : [];
      const fbDetails = rawFbs.filter(f => {
        const fbDate = f.created_at ? f.created_at.split('T')[0] : '';
        if (startDate && fbDate < startDate) return false;
        if (endDate && fbDate > endDate) return false;
        return true;
      });

      // Calculate stats per hamlet
      const computedStats = hamlets.map(h => {
        const hDocs = docDetails.filter(d => d.hamlet_id === h.id || d.hamlet_name === h.name);
        const hFbs = fbDetails.filter(f => f.hamlet_id === h.id || f.hamlet_name === h.name);

        const totalDocs = hDocs.length;
        const completedDocs = hDocs.filter(d => d.status === 'completed').length;
        const readDocs = hDocs.filter(d => d.status === 'read').length;
        const unreadDocs = hDocs.filter(d => d.status === 'unread').length;
        const docProgress = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 100;

        const totalFeedbacks = hFbs.length;
        const handledFeedbacks = hFbs.filter(f => f.status === 'handled').length;
        const pendingFeedbacks = hFbs.filter(f => f.status === 'pending').length;
        const forwardedFeedbacks = hFbs.filter(f => f.status === 'forwarded_to_commune').length;
        const feedbackProgress = totalFeedbacks > 0 ? Math.round((handledFeedbacks / totalFeedbacks) * 100) : 100;

        const avgScore = Math.round((docProgress + feedbackProgress) / 2);
        let rating = 'Xuất sắc';
        if (avgScore >= 90) rating = 'Xuất sắc';
        else if (avgScore >= 75) rating = 'Tốt';
        else if (avgScore >= 50) rating = 'Khá';
        else rating = 'Cần đôn đốc';

        return {
          hamletId: h.id,
          hamletName: h.name,
          totalDocs,
          completedDocs,
          readDocs,
          unreadDocs,
          docProgress,
          totalFeedbacks,
          handledFeedbacks,
          pendingFeedbacks,
          forwardedFeedbacks,
          feedbackProgress,
          avgScore,
          rating
        };
      });

      // If hamlet filter is selected
      const filteredHamletStats = selectedHamlet === 'ALL'
        ? computedStats
        : computedStats.filter(h => String(h.hamletId) === String(selectedHamlet));

      const totalHamlets = filteredHamletStats.length;
      const totalDocsAssigned = filteredHamletStats.reduce((s, h) => s + h.totalDocs, 0);
      const totalDocsCompleted = filteredHamletStats.reduce((s, h) => s + h.completedDocs, 0);
      const totalDocsRead = filteredHamletStats.reduce((s, h) => s + h.readDocs, 0);
      const totalDocsUnread = filteredHamletStats.reduce((s, h) => s + h.unreadDocs, 0);
      const avgDocProgress = totalDocsAssigned > 0 ? Math.round((totalDocsCompleted / totalDocsAssigned) * 100) : 100;

      const totalFeedbacks = filteredHamletStats.reduce((s, h) => s + h.totalFeedbacks, 0);
      const totalFeedbacksHandled = filteredHamletStats.reduce((s, h) => s + h.handledFeedbacks, 0);
      const totalFeedbacksPending = filteredHamletStats.reduce((s, h) => s + h.pendingFeedbacks, 0);
      const totalFeedbacksForwarded = filteredHamletStats.reduce((s, h) => s + h.forwardedFeedbacks, 0);
      const avgFeedbackProgress = totalFeedbacks > 0 ? Math.round((totalFeedbacksHandled / totalFeedbacks) * 100) : 100;

      setHamletStats(filteredHamletStats);
      setDocuments(docDetails);
      setFeedbacks(fbDetails);
      setSummary({
        totalHamlets,
        totalDocsAssigned,
        totalDocsCompleted,
        totalDocsRead,
        totalDocsUnread,
        avgDocProgress,
        totalFeedbacks,
        totalFeedbacksHandled,
        totalFeedbacksPending,
        totalFeedbacksForwarded,
        avgFeedbackProgress,
        overallScore: Math.round((avgDocProgress + avgFeedbackProgress) / 2)
      });
    } catch (err) {
      console.error('Error during client report fallback calculation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedHamlet, startDate, endDate]);

  // Initial load of hamlets list if empty
  useEffect(() => {
    fetch(`${API_BASE}/api/users/hamlets`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHamletsList(data);
      })
      .catch(console.error);
  }, []);

  // Filtered documents list
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      if (selectedHamlet !== 'ALL' && String(doc.hamlet_id) !== String(selectedHamlet)) return false;
      if (filterDocStatus !== 'ALL' && doc.status !== filterDocStatus) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const num = (doc.number || '').toLowerCase();
        const sum = (doc.summary || '').toLowerCase();
        const ham = (doc.hamlet_name || '').toLowerCase();
        if (!num.includes(kw) && !sum.includes(kw) && !ham.includes(kw)) return false;
      }
      return true;
    });
  }, [documents, selectedHamlet, filterDocStatus, searchKeyword]);

  // Filtered feedbacks list
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      if (selectedHamlet !== 'ALL' && String(fb.hamlet_id) !== String(selectedHamlet)) return false;
      if (filterFbStatus !== 'ALL' && fb.status !== filterFbStatus) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const name = (fb.name || '').toLowerCase();
        const phone = (fb.phone || '').toLowerCase();
        const content = (fb.content || '').toLowerCase();
        const ham = (fb.hamlet_name || '').toLowerCase();
        if (!name.includes(kw) && !phone.includes(kw) && !content.includes(kw) && !ham.includes(kw)) return false;
      }
      return true;
    });
  }, [feedbacks, selectedHamlet, filterFbStatus, searchKeyword]);

  // Status badges helpers
  const getDocStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><CheckCircle2 size={12} /> Đã hoàn thành</span>;
      case 'read':
        return <span className={`${styles.badge} ${styles.badgeGood}`}><Eye size={12} /> Đang xử lý</span>;
      case 'unread':
      default:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><Clock size={12} /> Chưa xem</span>;
    }
  };

  const getFbStatusBadge = (status) => {
    switch (status) {
      case 'handled':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><Check size={12} /> Đã giải quyết</span>;
      case 'forwarded_to_commune':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}><Building2 size={12} /> Chuyển UBND Xã</span>;
      case 'pending':
      default:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><Clock size={12} /> Đang chờ xử lý</span>;
    }
  };

  const getRatingBadge = (rating) => {
    switch (rating) {
      case 'Xuất sắc':
        return <span className={`${styles.badge} ${styles.badgeSuccess}`}><Award size={12} /> Xuất sắc</span>;
      case 'Tốt':
        return <span className={`${styles.badge} ${styles.badgeGood}`}><CheckCircle2 size={12} /> Tốt</span>;
      case 'Khá':
        return <span className={`${styles.badge} ${styles.badgeWarning}`}><TrendingUp size={12} /> Khá</span>;
      case 'Cần đôn đốc':
      default:
        return <span className={`${styles.badge} ${styles.badgeDanger}`}><AlertCircle size={12} /> Cần đôn đốc</span>;
    }
  };

  const getProgressColor = (percent) => {
    if (percent >= 90) return '#10b981';
    if (percent >= 75) return '#3b82f6';
    if (percent >= 50) return '#f59e0b';
    return '#ef4444';
  };

  // ==========================================
  // EXCEL EXPORT ENGINE (SheetJS / xlsx)
  // ==========================================
  const generateTimestamp = () => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${y}${m}${d}_${hh}${mm}`;
  };

  const getExportScopeText = () => {
    if (selectedHamlet === 'ALL') return 'Toàn xã (20 Ấp)';
    const found = hamletsList.find(h => String(h.id) === String(selectedHamlet));
    return found ? found.name : 'Ấp được chọn';
  };

  const getExportTimeText = () => {
    if (startDate && endDate) return `Từ ngày ${startDate} đến ngày ${endDate}`;
    if (startDate) return `Từ ngày ${startDate}`;
    if (endDate) return `Đến ngày ${endDate}`;
    return 'Toàn bộ thời gian';
  };

  // 1. Export Full Workbook (3 Sheets: Overview, Documents, Feedbacks)
  const handleExportFullReport = () => {
    try {
      const wb = XLSX.utils.book_new();
      const exportTime = new Date().toLocaleString('vi-VN');
      const scopeText = getExportScopeText();
      const periodText = getExportTimeText();

      // --- SHEET 1: TỔNG HỢP THEO ẤP ---
      const summaryRows = [
        ['ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['HỆ THỐNG QUẢN LÝ ĐIỀU HÀNH XÃ - ẤP THÔNG MINH', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        ['BÁO CÁO TỔNG HỢP TIẾN ĐỘ THỰC HIỆN NHIỆM VỤ THEO ẤP', '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [`Phạm vi: ${scopeText} | Thời gian: ${periodText} | Xuất ngày: ${exportTime}`, '', '', '', '', '', '', '', '', '', '', '', '', ''],
        [],
        [
          'STT', 
          'Tên Ấp', 
          'Tổng VB nhận', 
          'VB hoàn thành', 
          'VB đang xử lý', 
          'VB chưa xem', 
          'Tỷ lệ HT VB (%)', 
          'Tổng ý kiến dân', 
          'Ý kiến đã xử lý', 
          'Ý kiến chờ xử lý', 
          'Ý kiến chuyển xã', 
          'Tỷ lệ GQ ý kiến (%)', 
          'Điểm trung bình', 
          'Xếp loại thi đua'
        ]
      ];

      hamletStats.forEach((h, index) => {
        summaryRows.push([
          index + 1,
          h.hamletName,
          h.totalDocs,
          h.completedDocs,
          h.readDocs,
          h.unreadDocs,
          `${h.docProgress}%`,
          h.totalFeedbacks,
          h.handledFeedbacks,
          h.pendingFeedbacks,
          h.forwardedFeedbacks,
          `${h.feedbackProgress}%`,
          `${h.avgScore}%`,
          h.rating
        ]);
      });

      // Total row
      summaryRows.push([
        '',
        'TỔNG CỘNG TOÀN XÃ',
        summary.totalDocsAssigned,
        summary.totalDocsCompleted,
        summary.totalDocsRead,
        summary.totalDocsUnread,
        `${summary.avgDocProgress}%`,
        summary.totalFeedbacks,
        summary.totalFeedbacksHandled,
        summary.totalFeedbacksPending,
        summary.totalFeedbacksForwarded,
        `${summary.avgFeedbackProgress}%`,
        `${summary.overallScore}%`,
        summary.overallScore >= 90 ? 'Xuất sắc' : summary.overallScore >= 75 ? 'Tốt' : summary.overallScore >= 50 ? 'Khá' : 'Cần đôn đốc'
      ]);

      summaryRows.push([]);
      summaryRows.push(['', 'Người lập biểu', '', '', '', '', '', '', '', '', '', 'Chủ tịch UBND Xã', '', '']);
      summaryRows.push(['', '(Ký, ghi rõ họ tên)', '', '', '', '', '', '', '', '', '', '(Ký, đóng dấu)', '', '']);

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [
        { wch: 6 },  // STT
        { wch: 22 }, // Ten Ap
        { wch: 14 }, // Tong VB
        { wch: 14 }, // VB hoan thanh
        { wch: 14 }, // VB dang xu ly
        { wch: 14 }, // VB chua xem
        { wch: 16 }, // Ty le HT VB
        { wch: 16 }, // Tong y kien
        { wch: 16 }, // Y kien da xu ly
        { wch: 16 }, // Y kien cho xu ly
        { wch: 16 }, // Y kien chuyen xa
        { wch: 18 }, // Ty le GQ y kien
        { wch: 16 }, // Diem TB
        { wch: 18 }  // Xep loai thi dua
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, '1_TongHop_TheoAp');

      // --- SHEET 2: CHI TIẾT VĂN BẢN / NHIỆM VỤ ---
      const docRows = [
        ['ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH', '', '', '', '', '', '', ''],
        ['DANH SÁCH CHI TIẾT CÔNG VĂN / NHIỆM VỤ THEO ẤP', '', '', '', '', '', '', ''],
        [`Phạm vi: ${scopeText} | Thời gian: ${periodText} | Xuất ngày: ${exportTime}`, '', '', '', '', '', '', ''],
        [],
        [
          'STT',
          'Số ký hiệu VB',
          'Trích yếu nội dung',
          'Người / Đơn vị gửi',
          'Ấp tiếp nhận',
          'Ngày ban hành',
          'Trạng thái của Ấp',
          'Thời gian xác nhận'
        ]
      ];

      filteredDocuments.forEach((doc, idx) => {
        let statusText = 'Chưa xem';
        if (doc.status === 'completed') statusText = 'Đã hoàn thành';
        else if (doc.status === 'read') statusText = 'Đang xử lý';

        docRows.push([
          idx + 1,
          doc.number || '---',
          doc.summary || '',
          doc.sender_name || 'UBND Xã Châu Thành',
          doc.hamlet_name || '',
          doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : '',
          statusText,
          doc.read_at ? new Date(doc.read_at).toLocaleString('vi-VN') : '---'
        ]);
      });

      const wsDocs = XLSX.utils.aoa_to_sheet(docRows);
      wsDocs['!cols'] = [
        { wch: 6 },
        { wch: 16 },
        { wch: 42 },
        { wch: 24 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsDocs, '2_ChiTiet_VanBan');

      // --- SHEET 3: CHI TIẾT Ý KIẾN PHẢN ÁNH NHÂN DÂN ---
      const fbRows = [
        ['ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH', '', '', '', '', '', '', '', '', '', ''],
        ['DANH SÁCH Ý KIẾN, PHẢN ÁNH CỦA NHÂN DÂN THEO ẤP', '', '', '', '', '', '', '', '', '', ''],
        [`Phạm vi: ${scopeText} | Thời gian: ${periodText} | Xuất ngày: ${exportTime}`, '', '', '', '', '', '', '', '', '', ''],
        [],
        [
          'STT',
          'Thời gian gửi',
          'Họ tên người dân',
          'Số điện thoại',
          'Email',
          'Địa bàn Ấp',
          'Nội dung phản ánh, kiến nghị',
          'Trạng thái giải quyết',
          'Phòng ban phụ trách',
          'Ghi chú / Kết quả giải quyết',
          'Thời gian xử lý'
        ]
      ];

      filteredFeedbacks.forEach((fb, idx) => {
        let statusText = 'Đang chờ xử lý';
        if (fb.status === 'handled') statusText = 'Đã giải quyết';
        else if (fb.status === 'forwarded_to_commune') statusText = 'Chuyển UBND Xã';

        fbRows.push([
          idx + 1,
          fb.created_at ? new Date(fb.created_at).toLocaleString('vi-VN') : '',
          fb.name || '',
          fb.phone || '',
          fb.email || '',
          fb.hamlet_name || '',
          fb.content || '',
          statusText,
          fb.target_department || 'Ban Lãnh đạo Ấp',
          fb.response_note || fb.forward_note || '---',
          fb.handled_at ? new Date(fb.handled_at).toLocaleString('vi-VN') : '---'
        ]);
      });

      const wsFbs = XLSX.utils.aoa_to_sheet(fbRows);
      wsFbs['!cols'] = [
        { wch: 6 },
        { wch: 18 },
        { wch: 22 },
        { wch: 14 },
        { wch: 24 },
        { wch: 18 },
        { wch: 45 },
        { wch: 20 },
        { wch: 24 },
        { wch: 35 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(wb, wsFbs, '3_ChiTiet_YKienDan');

      // Save file
      const fileName = `Bao_Cao_Tong_Hop_Xa_Ap_${generateTimestamp()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      console.error('Lỗi khi xuất file Excel:', e);
      alert('Đã xảy ra lỗi khi xuất file Excel: ' + e.message);
    }
  };

  // 2. Export Single Table or Single Hamlet Report
  const handleExportSingleHamlet = (hamlet) => {
    try {
      const wb = XLSX.utils.book_new();
      const exportTime = new Date().toLocaleString('vi-VN');
      const periodText = getExportTimeText();

      // Hamlet Summary Sheet
      const summaryRows = [
        ['ỦY BAN NHÂN DÂN XÃ CHÂU THÀNH', '', '', '', ''],
        [`BÁO CÁO HOẠT ĐỘNG VÀ KẾT QUẢ THỰC HIỆN - ${hamlet.hamletName.toUpperCase()}`, '', '', '', ''],
        [`Thời gian: ${periodText} | Xuất ngày: ${exportTime}`, '', '', '', ''],
        [],
        ['CHỈ SỐ THỐNG KÊ', 'KẾT QUẢ', 'ĐƠN VỊ TÍNH', 'GHI CHÚ / ĐÁNH GIÁ'],
        ['Tổng văn bản nhận từ Xã', hamlet.totalDocs, 'Văn bản', ''],
        ['Số văn bản đã hoàn thành', hamlet.completedDocs, 'Văn bản', ''],
        ['Số văn bản đang xử lý', hamlet.readDocs, 'Văn bản', ''],
        ['Số văn bản chưa xem', hamlet.unreadDocs, 'Văn bản', ''],
        ['Tiến độ hoàn thành văn bản', `${hamlet.docProgress}%`, 'Tỷ lệ %', hamlet.docProgress >= 90 ? 'Tốt' : 'Cần đôn đốc'],
        ['Tổng ý kiến nhân dân tiếp nhận', hamlet.totalFeedbacks, 'Ý kiến', ''],
        ['Ý kiến đã giải quyết', hamlet.handledFeedbacks, 'Ý kiến', ''],
        ['Ý kiến đang chờ xử lý', hamlet.pendingFeedbacks, 'Ý kiến', ''],
        ['Ý kiến chuyển tiếp lên Xã', hamlet.forwardedFeedbacks, 'Ý kiến', ''],
        ['Tỷ lệ giải quyết ý kiến', `${hamlet.feedbackProgress}%`, 'Tỷ lệ %', ''],
        ['Điểm đánh giá trung bình', `${hamlet.avgScore}%`, 'Điểm %', ''],
        ['Xếp loại thi đua', hamlet.rating, 'Xếp loại', '']
      ];

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      wsSummary['!cols'] = [{ wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'ThongKe_Ap');

      // Hamlet Documents Sheet
      const hDocs = documents.filter(d => d.hamlet_id === hamlet.hamletId || d.hamlet_name === hamlet.hamletName);
      const docRows = [
        [`DANH SÁCH VĂN BẢN CỦA ${hamlet.hamletName.toUpperCase()}`, '', '', '', ''],
        [],
        ['STT', 'Số hiệu VB', 'Trích yếu nội dung', 'Ngày gửi', 'Trạng thái', 'Ngày đọc / Hoàn thành']
      ];
      hDocs.forEach((d, idx) => {
        docRows.push([
          idx + 1,
          d.number || '---',
          d.summary || '',
          d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : '',
          d.status === 'completed' ? 'Đã hoàn thành' : d.status === 'read' ? 'Đang xử lý' : 'Chưa xem',
          d.read_at ? new Date(d.read_at).toLocaleString('vi-VN') : '---'
        ]);
      });
      const wsDocs = XLSX.utils.aoa_to_sheet(docRows);
      wsDocs['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 45 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsDocs, 'VanBan');

      // Hamlet Feedbacks Sheet
      const hFbs = feedbacks.filter(f => f.hamlet_id === hamlet.hamletId || f.hamlet_name === hamlet.hamletName);
      const fbRows = [
        [`DANH SÁCH Ý KIẾN NGƯỜI DÂN TẠI ${hamlet.hamletName.toUpperCase()}`, '', '', '', '', ''],
        [],
        ['STT', 'Ngày gửi', 'Họ tên người dân', 'Số ĐT', 'Nội dung phản ánh', 'Trạng thái giải quyết', 'Kết quả xử lý']
      ];
      hFbs.forEach((f, idx) => {
        fbRows.push([
          idx + 1,
          f.created_at ? new Date(f.created_at).toLocaleDateString('vi-VN') : '',
          f.name || '',
          f.phone || '',
          f.content || '',
          f.status === 'handled' ? 'Đã giải quyết' : f.status === 'forwarded_to_commune' ? 'Chuyển UBND Xã' : 'Đang chờ xử lý',
          f.response_note || f.forward_note || '---'
        ]);
      });
      const wsFbs = XLSX.utils.aoa_to_sheet(fbRows);
      wsFbs['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 22 }, { wch: 14 }, { wch: 45 }, { wch: 20 }, { wch: 35 }];
      XLSX.utils.book_append_sheet(wb, wsFbs, 'YKienDan');

      const safeName = hamlet.hamletName.replace(/\s+/g, '_');
      const fileName = `Bao_Cao_${safeName}_${generateTimestamp()}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) {
      console.error('Lỗi khi xuất file Excel ấp:', e);
      alert('Đã xảy ra lỗi khi xuất file Excel: ' + e.message);
    }
  };

  return (
    <div className={styles.container}>
      {/* 1. Header & Quick Actions */}
      <div className={styles.headerArea}>
        <div className={styles.headerTitleWrapper}>
          <div className={styles.headerIcon}>
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 className={styles.mainTitle}>
              Báo cáo & Thống kê theo Ấp
            </h2>
            <p className={styles.subTitle}>
              Theo dõi toàn diện tiến độ giải quyết văn bản và tiếp nhận, xử lý ý kiến phản ánh của nhân dân
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button 
            className={styles.excelBtn}
            onClick={handleExportFullReport}
            title="Xuất file Excel đầy đủ gồm Bảng tổng hợp, Danh sách văn bản và Danh sách ý kiến người dân"
          >
            <FileSpreadsheet size={18} />
            <span>Xuất toàn bộ sổ Excel (3 Sheets)</span>
          </button>
          
          <button 
            className={styles.refreshBtn}
            onClick={fetchReportData}
            title="Làm mới số liệu"
          >
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          {/* Hamlet Select Filter */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Đơn vị / Ấp:</span>
            <select
              className={styles.selectInput}
              value={selectedHamlet}
              onChange={(e) => setSelectedHamlet(e.target.value)}
            >
              {!isHamlet && <option value="ALL">-- Tất cả 20 Ấp (Toàn xã) --</option>}
              {hamletsList.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Period Filter Pills */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Kỳ báo cáo:</span>
            <div className={styles.periodPills}>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'TODAY', label: 'Hôm nay' },
                { id: 'THIS_WEEK', label: 'Tuần này' },
                { id: 'THIS_MONTH', label: 'Tháng này' },
                { id: 'THIS_QUARTER', label: 'Quý này' },
                { id: 'THIS_YEAR', label: 'Năm 2026' },
                { id: 'CUSTOM', label: 'Tùy chọn' }
              ].map(p => (
                <button
                  key={p.id}
                  className={`${styles.periodPill} ${period === p.id ? styles.periodPillActive : ''}`}
                  onClick={() => handlePeriodChange(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Inputs (when CUSTOM or defined) */}
          {period === 'CUSTOM' && (
            <div className={styles.dateInputsWrapper}>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Từ ngày"
              />
              <span style={{ fontSize: '13px', color: '#64748b' }}>đến</span>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Đến ngày"
              />
            </div>
          )}

          {/* Search Box */}
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo tên ấp, số VB, người dân..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Stat Cards */}
      <div className={styles.kpiGrid}>
        {/* Card 1: Document Completion Rate */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiCardTop}>
              <span className={styles.kpiTitle}>Tiến độ văn bản & nhiệm vụ</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                <FileText size={20} />
              </div>
            </div>
            <div className={styles.kpiValueArea}>
              <span className={styles.kpiMainValue}>{summary.avgDocProgress}%</span>
              <span className={styles.kpiUnit}>hoàn thành</span>
            </div>
            <div className={styles.kpiDetails}>
              <span className={styles.kpiDetailItem}>
                <CheckCircle2 size={13} color="#10b981" /> <strong>{summary.totalDocsCompleted}</strong> hoàn thành
              </span>
              <span>•</span>
              <span className={styles.kpiDetailItem}>
                <Clock size={13} color="#f59e0b" /> <strong>{summary.totalDocsRead + summary.totalDocsUnread}</strong> đang xử lý
              </span>
            </div>
          </div>
          <div className={styles.kpiProgressBar}>
            <div 
              className={styles.kpiProgressFill} 
              style={{ width: `${summary.avgDocProgress}%`, backgroundColor: getProgressColor(summary.avgDocProgress) }}
            />
          </div>
        </div>

        {/* Card 2: Citizen Feedback Resolution Rate */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiCardTop}>
              <span className={styles.kpiTitle}>Giải quyết ý kiến nhân dân</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
                <MessageSquare size={20} />
              </div>
            </div>
            <div className={styles.kpiValueArea}>
              <span className={styles.kpiMainValue}>{summary.avgFeedbackProgress}%</span>
              <span className={styles.kpiUnit}>đã giải quyết</span>
            </div>
            <div className={styles.kpiDetails}>
              <span className={styles.kpiDetailItem}>
                <Check size={13} color="#10b981" /> <strong>{summary.totalFeedbacksHandled}</strong> đã xong
              </span>
              <span>•</span>
              <span className={styles.kpiDetailItem}>
                <Clock size={13} color="#f59e0b" /> <strong>{summary.totalFeedbacksPending + summary.totalFeedbacksForwarded}</strong> đang chờ/chuyển
              </span>
            </div>
          </div>
          <div className={styles.kpiProgressBar}>
            <div 
              className={styles.kpiProgressFill} 
              style={{ width: `${summary.avgFeedbackProgress}%`, backgroundColor: getProgressColor(summary.avgFeedbackProgress) }}
            />
          </div>
        </div>

        {/* Card 3: Overall Performance Score & Rating */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiCardTop}>
              <span className={styles.kpiTitle}>Điểm đánh giá thi đua</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <Award size={20} />
              </div>
            </div>
            <div className={styles.kpiValueArea}>
              <span className={styles.kpiMainValue}>{summary.overallScore}</span>
              <span className={styles.kpiUnit}>/ 100 điểm</span>
            </div>
            <div className={styles.kpiDetails}>
              <span>Xếp loại chung:</span>
              <strong>{summary.overallScore >= 90 ? 'Xuất sắc' : summary.overallScore >= 75 ? 'Tốt' : summary.overallScore >= 50 ? 'Khá' : 'Cần đôn đốc'}</strong>
            </div>
          </div>
          <div className={styles.kpiProgressBar}>
            <div 
              className={styles.kpiProgressFill} 
              style={{ width: `${summary.overallScore}%`, backgroundColor: getProgressColor(summary.overallScore) }}
            />
          </div>
        </div>

        {/* Card 4: Total Units & Excellent Hamlets */}
        <div className={styles.kpiCard}>
          <div>
            <div className={styles.kpiCardTop}>
              <span className={styles.kpiTitle}>Quy mô theo dõi</span>
              <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                <Users size={20} />
              </div>
            </div>
            <div className={styles.kpiValueArea}>
              <span className={styles.kpiMainValue}>{summary.totalHamlets}</span>
              <span className={styles.kpiUnit}>Ấp</span>
            </div>
            <div className={styles.kpiDetails}>
              <span>Ấp hoàn thành 100%:</span>
              <strong style={{ color: '#059669' }}>
                {hamletStats.filter(h => h.docProgress === 100).length} / {summary.totalHamlets} ấp
              </strong>
            </div>
          </div>
          <div className={styles.kpiProgressBar}>
            <div 
              className={styles.kpiProgressFill} 
              style={{ 
                width: `${summary.totalHamlets > 0 ? (hamletStats.filter(h => h.docProgress === 100).length / summary.totalHamlets) * 100 : 0}%`, 
                backgroundColor: '#8b5cf6' 
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          <span>Bảng tổng hợp theo Ấp</span>
          <span className={styles.tabCountBadge}>{hamletStats.length}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'documents' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <FileText size={16} />
          <span>Chi tiết Văn bản & Nhiệm vụ</span>
          <span className={styles.tabCountBadge}>{filteredDocuments.length}</span>
        </button>

        <button
          className={`${styles.tabBtn} ${activeTab === 'feedbacks' ? styles.tabBtnActive : ''}`}
          onClick={() => setActiveTab('feedbacks')}
        >
          <MessageSquare size={16} />
          <span>Ý kiến phản ánh của Nhân dân</span>
          <span className={styles.tabCountBadge}>{filteredFeedbacks.length}</span>
        </button>
      </div>

      {/* 5. Main Content Area */}
      {isLoading ? (
        <div className={styles.contentCard}>
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <span>Đang tải và tổng hợp dữ liệu báo cáo thống kê...</span>
          </div>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW TABLE & VISUAL CHARTS */}
          {activeTab === 'overview' && (
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <Award size={18} color="#1e3c72" />
                    Bảng Thống kê & Xếp loại Thi đua theo từng Ấp
                  </h3>
                  <span className={styles.cardSub}>
                    Dữ liệu tổng hợp tiến độ hoàn thành các chỉ tiêu được giao trên địa bàn xã
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={styles.excelBtnOutline}
                    onClick={handleExportFullReport}
                  >
                    <Download size={14} /> Xuất bảng tổng hợp Excel
                  </button>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                      <th>Tên Ấp</th>
                      <th style={{ textAlign: 'center' }}>Tổng VB nhận</th>
                      <th style={{ textAlign: 'center' }}>Đã xong</th>
                      <th style={{ textAlign: 'center' }}>Đang xử lý</th>
                      <th style={{ textAlign: 'center' }}>Chưa xem</th>
                      <th style={{ minWidth: '130px' }}>Tiến độ VB</th>
                      <th style={{ textAlign: 'center' }}>Ý kiến dân</th>
                      <th style={{ textAlign: 'center' }}>Đã xử lý</th>
                      <th style={{ textAlign: 'center' }}>Chờ / Chuyển</th>
                      <th style={{ minWidth: '130px' }}>Tỷ lệ GQ ý kiến</th>
                      <th style={{ textAlign: 'center' }}>Điểm TB</th>
                      <th style={{ textAlign: 'center' }}>Xếp loại</th>
                      <th style={{ textAlign: 'center', width: '130px' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hamletStats.map((h, idx) => {
                      const isSelected = String(h.hamletId) === String(selectedHamlet);
                      return (
                        <tr key={h.hamletId} className={isSelected ? styles.selectedRow : ''}>
                          <td style={{ textAlign: 'center', fontWeight: '500', color: '#64748b' }}>{idx + 1}</td>
                          <td className={styles.hamletNameCell}>{h.hamletName}</td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{h.totalDocs}</td>
                          <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{h.completedDocs}</td>
                          <td style={{ textAlign: 'center', color: '#2563eb' }}>{h.readDocs}</td>
                          <td style={{ textAlign: 'center', color: h.unreadDocs > 0 ? '#dc2626' : '#64748b' }}>
                            {h.unreadDocs}
                          </td>
                          <td>
                            <div className={styles.miniProgressWrapper}>
                              <div className={styles.miniProgressBar}>
                                <div 
                                  className={styles.miniProgressFill} 
                                  style={{ width: `${h.docProgress}%`, backgroundColor: getProgressColor(h.docProgress) }}
                                />
                              </div>
                              <span className={styles.miniProgressText} style={{ color: getProgressColor(h.docProgress) }}>
                                {h.docProgress}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '600' }}>{h.totalFeedbacks}</td>
                          <td style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{h.handledFeedbacks}</td>
                          <td style={{ textAlign: 'center', color: (h.pendingFeedbacks + h.forwardedFeedbacks) > 0 ? '#d97706' : '#64748b' }}>
                            {h.pendingFeedbacks + h.forwardedFeedbacks}
                          </td>
                          <td>
                            <div className={styles.miniProgressWrapper}>
                              <div className={styles.miniProgressBar}>
                                <div 
                                  className={styles.miniProgressFill} 
                                  style={{ width: `${h.feedbackProgress}%`, backgroundColor: getProgressColor(h.feedbackProgress) }}
                                />
                              </div>
                              <span className={styles.miniProgressText} style={{ color: getProgressColor(h.feedbackProgress) }}>
                                {h.feedbackProgress}%
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '700', color: '#1e3c72' }}>
                            {h.avgScore}%
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {getRatingBadge(h.rating)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                className={styles.excelBtnOutline}
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => handleExportSingleHamlet(h)}
                                title={`Xuất báo cáo Excel riêng cho ${h.hamletName}`}
                              >
                                <Download size={12} /> Excel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className={styles.totalRow}>
                      <td style={{ textAlign: 'center' }}>∑</td>
                      <td>TỔNG CỘNG TOÀN XÃ</td>
                      <td style={{ textAlign: 'center' }}>{summary.totalDocsAssigned}</td>
                      <td style={{ textAlign: 'center', color: '#16a34a' }}>{summary.totalDocsCompleted}</td>
                      <td style={{ textAlign: 'center', color: '#2563eb' }}>{summary.totalDocsRead}</td>
                      <td style={{ textAlign: 'center', color: summary.totalDocsUnread > 0 ? '#dc2626' : '#64748b' }}>
                        {summary.totalDocsUnread}
                      </td>
                      <td>
                        <div className={styles.miniProgressWrapper}>
                          <div className={styles.miniProgressBar}>
                            <div 
                              className={styles.miniProgressFill} 
                              style={{ width: `${summary.avgDocProgress}%`, backgroundColor: getProgressColor(summary.avgDocProgress) }}
                            />
                          </div>
                          <span className={styles.miniProgressText} style={{ color: getProgressColor(summary.avgDocProgress) }}>
                            {summary.avgDocProgress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>{summary.totalFeedbacks}</td>
                      <td style={{ textAlign: 'center', color: '#16a34a' }}>{summary.totalFeedbacksHandled}</td>
                      <td style={{ textAlign: 'center', color: (summary.totalFeedbacksPending + summary.totalFeedbacksForwarded) > 0 ? '#d97706' : '#64748b' }}>
                        {summary.totalFeedbacksPending + summary.totalFeedbacksForwarded}
                      </td>
                      <td>
                        <div className={styles.miniProgressWrapper}>
                          <div className={styles.miniProgressBar}>
                            <div 
                              className={styles.miniProgressFill} 
                              style={{ width: `${summary.avgFeedbackProgress}%`, backgroundColor: getProgressColor(summary.avgFeedbackProgress) }}
                            />
                          </div>
                          <span className={styles.miniProgressText} style={{ color: getProgressColor(summary.avgFeedbackProgress) }}>
                            {summary.avgFeedbackProgress}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: '800', color: '#1e3c72' }}>
                        {summary.overallScore}%
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {getRatingBadge(summary.overallScore >= 90 ? 'Xuất sắc' : summary.overallScore >= 75 ? 'Tốt' : summary.overallScore >= 50 ? 'Khá' : 'Cần đôn đốc')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={styles.excelBtnOutline}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={handleExportFullReport}
                          title="Xuất trọn bộ file Excel"
                        >
                          <Download size={12} /> Toàn xã
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Visual Comparison Charts */}
              <div className={styles.chartGrid}>
                {/* Chart 1: Document Completion Rate Comparison */}
                <div className={styles.chartCard}>
                  <div className={styles.chartTitle}>
                    <span>Tiến độ Hoàn thành Văn bản theo Ấp</span>
                    <FileText size={16} color="#3b82f6" />
                  </div>
                  <div className={styles.chartBarsContainer}>
                    {hamletStats.map(h => (
                      <div key={h.hamletId} className={styles.chartBarItem}>
                        <span className={styles.chartBarLabel} title={h.hamletName}>{h.hamletName}</span>
                        <div className={styles.chartBarTrack}>
                          <div 
                            className={styles.chartBarFill} 
                            style={{ width: `${h.docProgress}%`, backgroundColor: getProgressColor(h.docProgress) }}
                          />
                        </div>
                        <span className={styles.chartBarValue} style={{ color: getProgressColor(h.docProgress) }}>
                          {h.docProgress}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart 2: Citizen Feedback Resolution Rate Comparison */}
                <div className={styles.chartCard}>
                  <div className={styles.chartTitle}>
                    <span>Tỷ lệ Giải quyết Ý kiến Dân theo Ấp</span>
                    <MessageSquare size={16} color="#10b981" />
                  </div>
                  <div className={styles.chartBarsContainer}>
                    {hamletStats.map(h => (
                      <div key={h.hamletId} className={styles.chartBarItem}>
                        <span className={styles.chartBarLabel} title={h.hamletName}>{h.hamletName}</span>
                        <div className={styles.chartBarTrack}>
                          <div 
                            className={styles.chartBarFill} 
                            style={{ width: `${h.feedbackProgress}%`, backgroundColor: getProgressColor(h.feedbackProgress) }}
                          />
                        </div>
                        <span className={styles.chartBarValue} style={{ color: getProgressColor(h.feedbackProgress) }}>
                          {h.feedbackProgress}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED DOCUMENTS LIST */}
          {activeTab === 'documents' && (
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <FileText size={18} color="#1e3c72" />
                    Danh sách Chi tiết Văn bản & Nhiệm vụ theo Ấp
                  </h3>
                  <span className={styles.cardSub}>
                    Hiển thị các văn bản đã phân giao và tiến độ xử lý của từng ấp ({filteredDocuments.length} văn bản)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className={styles.selectInput}
                    style={{ minWidth: '140px', padding: '6px 10px', fontSize: '12px' }}
                    value={filterDocStatus}
                    onChange={(e) => setFilterDocStatus(e.target.value)}
                  >
                    <option value="ALL">-- Tất cả trạng thái --</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="read">Đang xử lý (Đã đọc)</option>
                    <option value="unread">Chưa xem (Chưa đọc)</option>
                  </select>

                  <button 
                    className={styles.excelBtnOutline}
                    onClick={handleExportFullReport}
                  >
                    <Download size={14} /> Xuất Excel văn bản
                  </button>
                </div>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText className={styles.emptyIcon} size={42} />
                  <span className={styles.emptyText}>Không tìm thấy văn bản nào phù hợp với bộ lọc</span>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                        <th style={{ width: '130px' }}>Số ký hiệu</th>
                        <th>Trích yếu nội dung</th>
                        <th>Ấp tiếp nhận</th>
                        <th style={{ width: '150px' }}>Ngày gửi</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ width: '160px' }}>Thời gian xác nhận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc, idx) => (
                        <tr key={`${doc.id}-${doc.hamlet_id}-${idx}`}>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ fontWeight: '600', color: '#1e3c72' }}>{doc.number || '---'}</td>
                          <td>
                            <div style={{ fontWeight: '500', color: '#1e293b' }}>{doc.summary}</div>
                            {doc.file_url && (
                              <a 
                                href={doc.file_url} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ fontSize: '11px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                              >
                                <ExternalLink size={11} /> Tệp đính kèm
                              </a>
                            )}
                          </td>
                          <td style={{ fontWeight: '600' }}>{doc.hamlet_name}</td>
                          <td style={{ color: '#475569', fontSize: '12px' }}>
                            {doc.created_at ? new Date(doc.created_at).toLocaleString('vi-VN') : '---'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {getDocStatusBadge(doc.status)}
                          </td>
                          <td style={{ color: '#475569', fontSize: '12px' }}>
                            {doc.read_at ? new Date(doc.read_at).toLocaleString('vi-VN') : '---'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DETAILED CITIZEN FEEDBACKS LIST */}
          {activeTab === 'feedbacks' && (
            <div className={styles.contentCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardTitle}>
                    <MessageSquare size={18} color="#1e3c72" />
                    Danh sách Ý kiến Phản ánh của Nhân dân theo Ấp
                  </h3>
                  <span className={styles.cardSub}>
                    Chi tiết các nội dung phản ánh, kiến nghị và kết quả xử lý ({filteredFeedbacks.length} ý kiến)
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className={styles.selectInput}
                    style={{ minWidth: '150px', padding: '6px 10px', fontSize: '12px' }}
                    value={filterFbStatus}
                    onChange={(e) => setFilterFbStatus(e.target.value)}
                  >
                    <option value="ALL">-- Tất cả trạng thái --</option>
                    <option value="handled">Đã giải quyết</option>
                    <option value="forwarded_to_commune">Chuyển UBND Xã</option>
                    <option value="pending">Đang chờ xử lý</option>
                  </select>

                  <button 
                    className={styles.excelBtnOutline}
                    onClick={handleExportFullReport}
                  >
                    <Download size={14} /> Xuất Excel ý kiến dân
                  </button>
                </div>
              </div>

              {filteredFeedbacks.length === 0 ? (
                <div className={styles.emptyState}>
                  <MessageSquare className={styles.emptyIcon} size={42} />
                  <span className={styles.emptyText}>Không có ý kiến phản ánh nào phù hợp với bộ lọc</span>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th style={{ width: '45px', textAlign: 'center' }}>STT</th>
                        <th style={{ width: '140px' }}>Thời gian gửi</th>
                        <th style={{ width: '180px' }}>Người dân & SĐT</th>
                        <th style={{ width: '150px' }}>Địa bàn Ấp</th>
                        <th>Nội dung phản ánh</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Trạng thái</th>
                        <th>Kết quả / Ghi chú xử lý</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedbacks.map((fb, idx) => (
                        <tr key={fb.id || idx}>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ color: '#475569', fontSize: '12px' }}>
                            {fb.created_at ? new Date(fb.created_at).toLocaleString('vi-VN') : '---'}
                          </td>
                          <td>
                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{fb.name}</div>
                            {fb.phone && (
                              <div style={{ fontSize: '12px', color: '#2563eb' }}>
                                📞 {fb.phone}
                              </div>
                            )}
                            {fb.email && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                ✉️ {fb.email}
                              </div>
                            )}
                          </td>
                          <td style={{ fontWeight: '600', color: '#1e3c72' }}>{fb.hamlet_name}</td>
                          <td>
                            <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap' }}>{fb.content}</div>
                            {fb.image_url && (
                              <a 
                                href={fb.image_url} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ fontSize: '11px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}
                              >
                                <ExternalLink size={11} /> Xem ảnh đính kèm
                              </a>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {getFbStatusBadge(fb.status)}
                          </td>
                          <td>
                            {fb.response_note ? (
                              <div style={{ color: '#15803d', fontSize: '13px', background: '#f0fdf4', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #16a34a' }}>
                                <strong>Kết quả:</strong> {fb.response_note}
                              </div>
                            ) : fb.forward_note ? (
                              <div style={{ color: '#b45309', fontSize: '13px', background: '#fefce8', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #eab308' }}>
                                <strong>Chuyển xã:</strong> {fb.forward_note}
                                {fb.target_department && <span style={{ display: 'block', fontSize: '11px', color: '#854d0e', marginTop: '2px' }}>Đơn vị: {fb.target_department}</span>}
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>Chưa có phản hồi</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HamletReports;
