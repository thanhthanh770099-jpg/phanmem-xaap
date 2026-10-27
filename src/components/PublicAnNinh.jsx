import React, { useState, useMemo } from 'react';
import anNinhData from '../data/an-ninh.json';
import styles from './PublicAnNinh.module.css';
import { Shield, Phone, Search } from 'lucide-react';
import BackToPortalButton from './BackToPortalButton';

const PublicAnNinh = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAp, setSelectedAp] = useState('ALL');

  // Danh sách các ấp duy nhất
  const danhSachAp = useMemo(() => {
    const list = Array.from(new Set(anNinhData.map(item => item.ap)));
    return list;
  }, []);

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    return anNinhData.filter(item => {
      const matchAp = selectedAp === 'ALL' || item.ap === selectedAp;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        item.hoTen.toLowerCase().includes(term) ||
        item.ap.toLowerCase().includes(term) ||
        item.sdt.includes(term) ||
        item.sdtRaw.includes(term) ||
        item.chucDanh.toLowerCase().includes(term);
      return matchAp && matchSearch;
    });
  }, [searchTerm, selectedAp]);

  const getBadgeClass = (chucDanh) => {
    if (chucDanh.includes('Trưởng')) return `${styles.badge} ${styles.badgeToTruong}`;
    if (chucDanh.includes('phó')) return `${styles.badge} ${styles.badgeToPho}`;
    return `${styles.badge} ${styles.badgeToVien}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <BackToPortalButton />

        {/* Header Banner */}
        <div className={styles.headerCard}>
          <div className={styles.headerIcon}>
            <Shield size={28} />
          </div>
          <h1 className={styles.title}>Lực Lượng Bảo Vệ An Ninh, Trật Tự Ở Cơ Sở</h1>
          <p className={styles.subtitle}>
            Công an Xã Châu Thành &bull; Danh sách Tổ bảo vệ ANTT các ấp sau kiện toàn
          </p>
        </div>

        {/* Hotline Trực ban Công an xã Châu Thành */}
        <div className={styles.hotlineBox}>
          <div className={styles.hotlineInfo}>
            <h3>
              <Phone size={18} color="#dc2626" />
              Trực ban Công an xã Châu Thành
            </h3>
            <p>Đường dây nóng tiếp nhận tin báo ANTT, phản ánh khẩn cấp 24/7</p>
          </div>
          <a href="tel:02943872064" className={styles.hotlineCallBtn} title="Bấm để gọi ngay">
            <Phone size={16} />
            <span>02943.872.064</span>
          </a>
        </div>

        {/* Search & Filter Controls */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text"
              className={styles.searchInput}
              placeholder="Tìm theo họ tên, số điện thoại, tên ấp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            className={styles.filterSelect}
            value={selectedAp}
            onChange={(e) => setSelectedAp(e.target.value)}
          >
            <option value="ALL">-- Tất cả các ấp ({danhSachAp.length} ấp) --</option>
            {danhSachAp.map((ap) => (
              <option key={ap} value={ap}>{ap}</option>
            ))}
          </select>
        </div>

        {/* Summary Info */}
        <div className={styles.summaryBar}>
          <span>Hiển thị: <strong>{filteredData.length}</strong> / {anNinhData.length} nhân sự</span>
          {selectedAp !== 'ALL' && <span>Đang lọc: <strong>{selectedAp}</strong></span>}
        </div>

        {/* Table View */}
        <div className={styles.tableCard}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>STT</th>
                  <th style={{ minWidth: '150px' }}>Tên Ấp</th>
                  <th style={{ minWidth: '170px' }}>Họ Và Tên</th>
                  <th style={{ minWidth: '130px' }}>Chức Danh</th>
                  <th style={{ minWidth: '160px' }}>Số Điện Thoại (Zalo)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{item.id}</td>
                      <td>
                        <span className={styles.apBadge}>{item.ap}</span>
                      </td>
                      <td>
                        <strong>{item.hoTen}</strong>
                      </td>
                      <td>
                        <span className={getBadgeClass(item.chucDanh)}>
                          {item.chucDanh}
                        </span>
                      </td>
                      <td>
                        <a href={`tel:${item.sdtRaw}`} className={styles.callLink} title="Bấm để gọi điện">
                          <Phone size={14} />
                          <span>{item.sdt}</span>
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className={styles.emptyState}>
                      Không tìm thấy nhân sự phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note / Footer */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          <p>Dữ liệu trích xuất từ Quyết định / Danh sách Tổ bảo vệ ANTT cơ sở Công an xã Châu Thành.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicAnNinh;
