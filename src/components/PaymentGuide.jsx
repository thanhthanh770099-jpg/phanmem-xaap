import React from 'react';

const PaymentGuide = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>HƯỚNG DẪN THANH TOÁN KHÔNG DÙNG TIỀN MẶT</h2>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p><strong>HƯỚNG DẪN THANH TOÁN KHÔNG DÙNG TIỀN MẶT QUA CÁC HÌNH THỨC SAU: CHUYỂN KHOẢN NGÂN HÀNG, QUÉT MÃ QR, VÍ ĐIỆN TỬ, VÀ THẺ NGÂN HÀNG.</strong></p>
        <p><strong>1. Chuyển khoản ngân hàng (qua Internet Banking/Mobile Banking)</strong></p>
        <ol>
          <li>Mở ứng dụng ngân hàng trên điện thoại, đăng nhập bằng mã PIN/vân tay/Face ID.</li>
          <li>Chọn mục "Chuyển tiền" → chọn loại chuyển khoản (cùng ngân hàng, khác ngân hàng, hoặc theo số thẻ).</li>
          <li>Nhập số tài khoản người nhận (hoặc chọn từ danh bạ đã lưu), kiểm tra kỹ tên chủ tài khoản hiện ra để tránh chuyển nhầm.</li>
          <li>Nhập số tiền cần chuyển, thêm nội dung chuyển khoản nếu cần.</li>
          <li>Xác nhận giao dịch bằng mã OTP (gửi qua SMS) hoặc Smart OTP trong app.</li>
          <li>Lưu lại biên lai/ảnh chụp màn hình giao dịch để đối chiếu khi cần.</li>
        </ol>
        <p><strong>2. Thanh toán bằng mã QR (VietQR, QR ví điện tử...)</strong></p>
        <ol>
          <li>Mở app ngân hàng hoặc ví điện tử, chọn tính năng "Quét mã QR".</li>
          <li>Đưa camera hướng vào mã QR của người bán (dán tại quầy hoặc hiện trên máy POS).</li>
          <li>Kiểm tra thông tin người nhận và số tiền hiện ra (một số mã QR cho phép người bán nhập sẵn số tiền, một số cần bạn tự nhập).</li>
          <li>Nhấn xác nhận, nhập mã PIN hoặc OTP để hoàn tất.</li>
          <li>Chờ màn hình báo "Giao dịch thành công" và cho người bán xem để đối chiếu.</li>
        </ol>
        <p><strong>3. Ví điện tử (MoMo, ZaloPay, VNPay...)</strong></p>
        <ol>
          <li>Tải và đăng ký tài khoản ví điện tử, liên kết với thẻ ngân hàng hoặc tài khoản ngân hàng.</li>
          <li>Nạp tiền vào ví (nếu cần) qua liên kết ngân hàng.</li>
          <li>Chọn tính năng thanh toán: quét QR, chuyển tiền, hoặc thanh toán hóa đơn/dịch vụ ngay trong app.</li>
          <li>Nhập số tiền, kiểm tra thông tin giao dịch.</li>
          <li>Xác nhận bằng mã PIN của ví hoặc sinh trắc học.</li>
        </ol>
        <p><strong>4. Thẻ ngân hàng (thẻ ATM/thẻ tín dụng) tại cửa hàng</strong></p>
        <ol>
          <li>Đưa thẻ cho nhân viên hoặc tự quẹt/chạm thẻ vào máy POS.</li>
          <li>Nếu thanh toán không tiếp xúc (contactless/chạm thẻ) dưới hạn mức quy định, không cần nhập mã PIN.</li>
          <li>Với giao dịch lớn hơn, nhập mã PIN của thẻ trên máy POS.</li>
          <li>Chờ máy in hóa đơn hoặc gửi thông báo xác nhận qua tin nhắn/app ngân hàng.</li>
          <li>Giữ lại hóa đơn giao dịch để đối chiếu nếu cần.</li>
        </ol>
        <p><strong>Một vài lưu ý an toàn chung:</strong></p>
        <ul>
          <li>Luôn kiểm tra kỹ tên người nhận/số tiền trước khi xác nhận.</li>
          <li>Không chia sẻ mã OTP, mã PIN cho bất kỳ ai, kể cả người tự xưng là nhân viên ngân hàng.</li>
          <li>Bật thông báo biến động số dư để theo dõi giao dịch kịp thời.</li>
          <li>Với giao dịch giá trị lớn, nên xác minh lại thông tin người nhận qua kênh khác (gọi điện, nhắn tin) trước khi chuyển.</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentGuide;
