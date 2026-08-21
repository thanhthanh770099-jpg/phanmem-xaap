import React from 'react';
import lanhDaoData from '../data/lanh-dao.json';
import styles from './Feedback.module.css';

const PublicDanhSachLanhDao = () => {
  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div className={styles.container} style={{ margin: 0, width: '100%', maxWidth: '800px' }}>
        <h2 className={styles.title} style={{ textAlign: 'center', marginBottom: '10px' }}>Thông Tin Lãnh Đạo Các Ấp</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '24px' }}>
          Danh sách Bí thư chi bộ và Trưởng ban nhân dân các Ấp thuộc Xã Châu Thành.
        </p>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th width="10%">STT</th>
                <th width="25%">Tên Ấp</th>
                <th width="35%">Trưởng ban nhân dân / SĐT</th>
                <th width="30%">Bí thư chi bộ / SĐT</th>
              </tr>
            </thead>
            <tbody>
              {lanhDaoData.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'center' }}>{item.id}</td>
                  <td><strong>{item.ap}</strong></td>
                  <td>
                    <div>{item.truongBan}</div>
                    <div style={{ color: '#0056b3', fontWeight: 'bold' }}>{item.sdtTruongBan}</div>
                  </td>
                  <td>
                    <div>{item.biThu}</div>
                    <div style={{ color: '#0056b3', fontWeight: 'bold' }}>{item.sdtBiThu}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PublicDanhSachLanhDao;
