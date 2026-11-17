// server/smsService.js
// Gửi SMS Brandname qua API VNPT (định dạng XML send_sms_list)
require('dotenv').config();

const VNPT_SMS_URL = process.env.VNPT_SMS_URL || 'http://113.185.0.35:8888/smsbn/api';
const VNPT_API_USER = process.env.VNPT_API_USER || 'vnpt-vnpvlg';
const VNPT_API_PASS = process.env.VNPT_API_PASS || 'Vnpt@123';
const VNPT_USERNAME = process.env.VNPT_USERNAME || 'vnpt-vnpvlg';
const VNPT_AGENT_ID = process.env.VNPT_AGENT_ID || '268';
const VNPT_CONTRACT_ID = process.env.VNPT_CONTRACT_ID || '495';
const VNPT_CONTRACT_TYPE_ID = process.env.VNPT_CONTRACT_TYPE_ID || '1';
const VNPT_LABEL_ID = process.env.VNPT_LABEL_ID || '87826';
const VNPT_TEMPLATE_ID = process.env.VNPT_TEMPLATE_ID || '11474554';

// Cờ chế độ test: true = luôn gửi đến số test 84911759134
const SMS_TEST_MODE = process.env.SMS_TEST_MODE !== 'false';
const SMS_TEST_PHONE = process.env.SMS_TEST_PHONE || '84911759134';

// Escape ký tự đặc biệt để không làm hỏng XML (&, <, > trong nội dung)
function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Bỏ dấu tiếng Việt (tin Brandname VNPT thường yêu cầu gửi không dấu)
function removeVietnameseTones(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Chuẩn hóa SĐT về dạng 84xxxxxxxxx
function normalizePhone(phone = '') {
  let p = String(phone).replace(/[^\d]/g, '');
  if (p.startsWith('0')) p = '84' + p.slice(1);
  if (!/^84\d{9,10}$/.test(p)) {
    throw new Error(`Số điện thoại không hợp lệ: ${phone}`);
  }
  return p;
}

// Mỗi tham số {D,n} trong mẫu tin là một khối <PARAMS> riêng, NUM = 1, 2, 3...
function buildParams(params = []) {
  return params
    .map(
      (value, i) =>
        `<PARAMS><NUM>${i + 1}</NUM><CONTENT>${xmlEscape(
          removeVietnameseTones(value)
        )}</CONTENT></PARAMS>`
    )
    .join('');
}

function buildXml({ phones, params, reqId, templateId = VNPT_TEMPLATE_ID }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<RQST name="send_sms_list">
  <REQID>${reqId}</REQID>
  <CONTRACTID>${VNPT_CONTRACT_ID}</CONTRACTID>
  <LABELID>${VNPT_LABEL_ID}</LABELID>
  <TEMPLATEID>${templateId}</TEMPLATEID>
  <ISTELCOSUB>0</ISTELCOSUB>
  ${buildParams(params)}
  <CONTRACTTYPEID>${VNPT_CONTRACT_TYPE_ID}</CONTRACTTYPEID>
  <MAXITEM>0</MAXITEM>
  <SCHEDULETIME></SCHEDULETIME>
  <MOBILELIST>${phones.join(',')}</MOBILELIST>
  <AGENTID>${VNPT_AGENT_ID}</AGENTID>
  <APIUSER>${xmlEscape(VNPT_API_USER)}</APIUSER>
  <APIPASS>${xmlEscape(VNPT_API_PASS)}</APIPASS>
  <USERNAME>${xmlEscape(VNPT_USERNAME)}</USERNAME>
</RQST>`;
}

// Lấy giá trị 1 thẻ trong XML phản hồi từ VNPT
function getTag(xml, tag) {
  if (!xml) return null;
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

/**
 * Gửi SMS qua API VNPT
 * @param {string|string[]} phone - 1 số hoặc danh sách số
 * @param {string[]} params - Mảng các tham số tương ứng với từng {D,n} trong mẫu đã duyệt
 * @param {string} [customTemplateId] - ID mẫu tin nếu muốn dùng mẫu khác
 */
async function sendSms(phone, params, customTemplateId) {
  // Nếu ở chế độ test => gửi về SMS_TEST_PHONE (0911759134)
  const originalPhones = (Array.isArray(phone) ? phone : [phone]).map(normalizePhone);
  const targetPhones = SMS_TEST_MODE ? [normalizePhone(SMS_TEST_PHONE)] : originalPhones;

  const reqId = Date.now().toString(); // REQID bắt buộc có và duy nhất mỗi lần gửi
  const templateId = customTemplateId || VNPT_TEMPLATE_ID;
  const xml = buildXml({ phones: targetPhones, params, reqId, templateId });

  console.log(`[SMS] Chế độ test: ${SMS_TEST_MODE} | Người nhận gốc: ${originalPhones.join(',')} -> Gửi tới: ${targetPhones.join(',')}`);
  console.log('[SMS] Request XML:\n', xml.replace(/<APIPASS>.*<\/APIPASS>/, '<APIPASS>***</APIPASS>'));

  if (!VNPT_SMS_URL) {
    console.warn('[SMS CẢNH BÁO] Chưa cấu hình biến môi trường VNPT_SMS_URL trên Render/Server!');
    return {
      success: false,
      isMock: true,
      message: 'Chưa cấu hình biến môi trường VNPT_SMS_URL. Vui lòng bổ sung URL API do VNPT cấp.',
      reqId,
      targetPhones,
      originalPhones,
      xml
    };
  }

  try {
    const res = await fetch(VNPT_SMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      body: xml
    });

    const text = await res.text();
    console.log('[SMS] HTTP Status:', res.status, '\nResponse XML:\n', text);

    const errorCode = getTag(text, 'ERROR');
    const errorDesc = getTag(text, 'ERROR_DESC');

    return {
      success: res.ok && errorCode === '0',
      httpStatus: res.status,
      errorCode,
      errorDesc,
      reqId,
      targetPhones,
      originalPhones,
      raw: text
    };
  } catch (err) {
    console.error('[SMS] Lỗi kết nối VNPT:', err.message);
    return {
      success: false,
      error: err.message,
      reqId,
      targetPhones,
      originalPhones
    };
  }
}

/**
 * Hàm tiện ích gửi thông báo xử lý phản ánh kiến nghị
 * Tự động điều chỉnh params cho phù hợp với mẫu tin đăng ký
 */
async function sendFeedbackNotification(citizenPhone, citizenName, responseNote, feedbackId) {
  const cleanName = removeVietnameseTones(citizenName || 'nguoi dan');
  const cleanNote = removeVietnameseTones(responseNote || 'Da duoc xu ly');

  let params = [];

  if (VNPT_TEMPLATE_ID === '11474554') {
    // Mẫu demo 11474554: "VNPT Vinh Long thong bao: Thu nhap {D,30}. Gom: Luong {D,200}. Thuc lanh: {D,20}"
    // Yêu cầu 3 params: {D,30}, {D,200}, {D,20}
    params = [
      `KN ${feedbackId || ''} cua ${cleanName}`.slice(0, 30),
      `XL: ${cleanNote}`.slice(0, 200),
      `UBND Chau Thanh`.slice(0, 20)
    ];
  } else {
    // Mẫu tin đăng ký chính thức cho phản ánh (thường gồm 2 tham số: Mã ý kiến/Họ tên + Nội dung trả lời)
    params = [
      `${feedbackId || ''} - ${cleanName}`.slice(0, 30),
      cleanNote.slice(0, 300)
    ];
  }

  return sendSms(citizenPhone, params);
}

module.exports = {
  sendSms,
  sendFeedbackNotification,
  normalizePhone,
  removeVietnameseTones,
  SMS_TEST_MODE,
  SMS_TEST_PHONE
};
