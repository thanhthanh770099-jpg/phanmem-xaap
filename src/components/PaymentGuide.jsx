import React from 'react';

const PaymentGuide = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f4f8', 
      backgroundImage: 'linear-gradient(135deg, #e0e8f5 0%, #f4f7f6 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <div style={{ 
        maxWidth: '800px', 
        width: '100%',
        backgroundColor: '#ffffff', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        <div style={{ 
          padding: '24px 30px', 
          backgroundColor: '#fff',
          borderBottom: '1px solid #edf2f7',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            margin: 0, 
            color: '#dc2626', 
            fontSize: '24px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            Hướng dẫn thanh toán không dùng tiền mặt
          </h2>
        </div>
        
        <div style={{ 
          padding: '30px', 
          overflowY: 'auto', 
          lineHeight: '1.7',
          color: '#334155',
          fontSize: '16px'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
            HƯỚNG DẪN THANH TOÁN KHÔNG DÙNG TIỀN MẶT QUA CÁC HÌNH THỨC SAU: CHUYỂN KHOẢN NGÂN HÀNG, QUÉT MÃ QR, VÍ ĐIỆN TỬ, VÀ THẺ NGÂN HÀNG.
          </p>
          
          <h3 style={{ color: '#0369a1', marginTop: '25px', marginBottom: '15px', fontSize: '18px' }}>1. Chuyển khoản ngân hàng (qua Internet Banking/Mobile Banking)</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Mở ứng dụng ngân hàng trên điện thoại, đăng nhập bằng mã PIN/vân tay/Face ID.</li>
            <li style={{ marginBottom: '8px' }}>Chọn mục "Chuyển tiền" → chọn loại chuyển khoản (cùng ngân hàng, khác ngân hàng, hoặc theo số thẻ).</li>
            <li style={{ marginBottom: '8px' }}>Nhập số tài khoản người nhận (hoặc chọn từ danh bạ đã lưu), kiểm tra kỹ tên chủ tài khoản hiện ra để tránh chuyển nhầm.</li>
            <li style={{ marginBottom: '8px' }}>Nhập số tiền cần chuyển, thêm nội dung chuyển khoản nếu cần.</li>
            <li style={{ marginBottom: '8px' }}>Xác nhận giao dịch bằng mã OTP (gửi qua SMS) hoặc Smart OTP trong app.</li>
            <li style={{ marginBottom: '8px' }}>Lưu lại biên lai/ảnh chụp màn hình giao dịch để đối chiếu khi cần.</li>
          </ol>

          <h3 style={{ color: '#0369a1', marginTop: '25px', marginBottom: '15px', fontSize: '18px' }}>2. Thanh toán bằng mã QR (VietQR, QR ví điện tử...)</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Mở app ngân hàng hoặc ví điện tử, chọn tính năng "Quét mã QR".</li>
            <li style={{ marginBottom: '8px' }}>Đưa camera hướng vào mã QR của người bán (dán tại quầy hoặc hiện trên máy POS).</li>
            <li style={{ marginBottom: '8px' }}>Kiểm tra thông tin người nhận và số tiền hiện ra (một số mã QR cho phép người bán nhập sẵn số tiền, một số cần bạn tự nhập).</li>
            <li style={{ marginBottom: '8px' }}>Nhấn xác nhận, nhập mã PIN hoặc OTP để hoàn tất.</li>
            <li style={{ marginBottom: '8px' }}>Chờ màn hình báo "Giao dịch thành công" và cho người bán xem để đối chiếu.</li>
          </ol>

          <h3 style={{ color: '#0369a1', marginTop: '25px', marginBottom: '15px', fontSize: '18px' }}>3. Ví điện tử (MoMo, ZaloPay, VNPay...)</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Tải và đăng ký tài khoản ví điện tử, liên kết với thẻ ngân hàng hoặc tài khoản ngân hàng.</li>
            <li style={{ marginBottom: '8px' }}>Nạp tiền vào ví (nếu cần) qua liên kết ngân hàng.</li>
            <li style={{ marginBottom: '8px' }}>Chọn tính năng thanh toán: quét QR, chuyển tiền, hoặc thanh toán hóa đơn/dịch vụ ngay trong app.</li>
            <li style={{ marginBottom: '8px' }}>Nhập số tiền, kiểm tra thông tin giao dịch.</li>
            <li style={{ marginBottom: '8px' }}>Xác nhận bằng mã PIN của ví hoặc sinh trắc học.</li>
          </ol>

          <h3 style={{ color: '#0369a1', marginTop: '25px', marginBottom: '15px', fontSize: '18px' }}>4. Thẻ ngân hàng (thẻ ATM/thẻ tín dụng) tại cửa hàng</h3>
          <ol style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Đưa thẻ cho nhân viên hoặc tự quẹt/chạm thẻ vào máy POS.</li>
            <li style={{ marginBottom: '8px' }}>Nếu thanh toán không tiếp xúc (contactless/chạm thẻ) dưới hạn mức quy định, không cần nhập mã PIN.</li>
            <li style={{ marginBottom: '8px' }}>Với giao dịch lớn hơn, nhập mã PIN của thẻ trên máy POS.</li>
            <li style={{ marginBottom: '8px' }}>Chờ máy in hóa đơn hoặc gửi thông báo xác nhận qua tin nhắn/app ngân hàng.</li>
            <li style={{ marginBottom: '8px' }}>Giữ lại hóa đơn giao dịch để đối chiếu nếu cần.</li>
          </ol>

          <div style={{ backgroundColor: '#fff8f1', borderLeft: '4px solid #f97316', padding: '15px 20px', marginTop: '30px', borderRadius: '0 8px 8px 0' }}>
            <h4 style={{ color: '#c2410c', marginTop: 0, marginBottom: '10px', fontSize: '16px' }}>Một vài lưu ý an toàn chung:</h4>
            <ul style={{ paddingLeft: '20px', margin: 0, color: '#9a3412' }}>
              <li style={{ marginBottom: '6px' }}>Luôn kiểm tra kỹ tên người nhận/số tiền trước khi xác nhận.</li>
              <li style={{ marginBottom: '6px' }}>Không chia sẻ mã OTP, mã PIN cho bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng.</li>
              <li style={{ marginBottom: '6px' }}>Bật thông báo biến động số dư để theo dõi giao dịch kịp thời.</li>
              <li style={{ marginBottom: '6px' }}>Với giao dịch giá trị lớn, nên xác minh lại thông tin người nhận qua kênh khác (gọi điện, nhắn tin) trước khi chuyển.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentGuide;
