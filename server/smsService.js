// server/smsService.js
// Gửi SMS Brandname qua API VNPT (hỗ trợ cả JSON theo tài liệu 2020 và XML send_sms_list)
const path = require('path');
const net = require('net');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const VNPT_PUBLIC_URL = 'http://113.185.0.35:8888/smsbn/api';
const VNPT_PRIVATE_URL = 'http://192.168.38.134:8888/smsbn/api';

const VNPT_SMS_URL = (process.env.VNPT_SMS_URL || '').trim();
const VNPT_API_USER = process.env.VNPT_API_USER || 'vnpt-vnpvlg';
const VNPT_API_PASS = process.env.VNPT_API_PASS || 'Vnpt@123';
const VNPT_USERNAME = process.env.VNPT_USERNAME || 'vnpt-vnpvlg';
const VNPT_AGENT_ID = process.env.VNPT_AGENT_ID || '268';
const VNPT_CONTRACT_ID = process.env.VNPT_CONTRACT_ID || '495';
const VNPT_CONTRACT_TYPE_ID = process.env.VNPT_CONTRACT_TYPE_ID || '1';
const VNPT_LABEL_ID = process.env.VNPT_LABEL_ID || '87826';
const VNPT_TEMPLATE_ID = process.env.VNPT_TEMPLATE_ID || '11474554';
const VNPT_API_FORMAT = (process.env.VNPT_API_FORMAT || 'auto').toLowerCase(); // 'auto' | 'json' | 'xml'

// Cờ chế độ test: true = luôn gửi đến số test 84911759134
const SMS_TEST_MODE = process.env.SMS_TEST_MODE !== 'false';
const SMS_TEST_PHONE = process.env.SMS_TEST_PHONE || '84911759134';

function xmlEscape(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function removeVietnameseTones(str = '') {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizePhone(phone = '') {
  let p = String(phone).replace(/[^\d]/g, '');
  if (p.startsWith('0')) p = '84' + p.slice(1);
  if (!/^84\d{9,10}$/.test(p)) {
    throw new Error(`Số điện thoại không hợp lệ: ${phone}`);
  }
  return p;
}

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

function buildJson({ phones, params, reqId, templateId = VNPT_TEMPLATE_ID }) {
  return {
    RQST: {
      name: 'send_sms_list',
      REQID: String(reqId),
      LABELID: String(VNPT_LABEL_ID),
      CONTRACTTYPEID: String(VNPT_CONTRACT_TYPE_ID),
      CONTRACTID: String(VNPT_CONTRACT_ID),
      TEMPLATEID: String(templateId),
      PARAMS: params.map((value, i) => ({
        NUM: String(i + 1),
        CONTENT: removeVietnameseTones(value)
      })),
      SCHEDULETIME: '',
      MOBILELIST: phones.join(','),
      ISTELCOSUB: '0',
      AGENTID: String(VNPT_AGENT_ID),
      APIUSER: String(VNPT_API_USER),
      APIPASS: String(VNPT_API_PASS),
      USERNAME: String(VNPT_USERNAME),
      DATACODING: '0'
    }
  };
}

function getTag(xml, tag) {
  if (!xml) return null;
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

// Đọc cả phản hồi JSON (RPLY) lẫn XML (RSPN/RPLY) từ VNPT
function parseVnptResponse(text = '') {
  const trimmed = String(text).trim();
  if (trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      const rply = data.RPLY || data;
      return {
        format: 'json',
        errorCode: rply.ERROR !== undefined ? String(rply.ERROR) : null,
        errorDesc: rply.ERROR_DESC ? String(rply.ERROR_DESC) : null
      };
    } catch {
      // Fallback sang XML nếu parse JSON thất bại
    }
  }
  return {
    format: 'xml',
    errorCode: getTag(trimmed, 'ERROR'),
    errorDesc: getTag(trimmed, 'ERROR_DESC')
  };
}

function resolveCandidateUrls(target) {
  if (target === 'public') return [VNPT_PUBLIC_URL];
  if (target === 'private') return [VNPT_PRIVATE_URL];
  if (VNPT_SMS_URL) {
    // Nếu cấu hình chính là URL Public VNPT thì thêm Private làm đường dự phòng cho server trong IDC VNPT
    if (VNPT_SMS_URL === VNPT_PUBLIC_URL) {
      return [VNPT_PUBLIC_URL, VNPT_PRIVATE_URL];
    }
    return [VNPT_SMS_URL];
  }
  return [VNPT_PUBLIC_URL, VNPT_PRIVATE_URL];
}

async function postToVnpt(url, { phones, params, reqId, templateId, format }) {
  const useJson = format === 'json';
  const body = useJson
    ? JSON.stringify(buildJson({ phones, params, reqId, templateId }))
    : buildXml({ phones, params, reqId, templateId });
  const contentType = useJson ? 'application/json; charset=utf-8' : 'text/xml; charset=utf-8';

  const maskedBody = useJson
    ? body.replace(/"APIPASS"\s*:\s*"[^"]*"/, '"APIPASS":"***"')
    : body.replace(/<APIPASS>.*<\/APIPASS>/, '<APIPASS>***</APIPASS>');
  console.log(`[SMS] -> POST ${url} (${format.toUpperCase()}):\n${maskedBody}`);

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
    signal: AbortSignal.timeout(6000)
  });

  const text = await res.text();
  console.log(`[SMS] <- HTTP ${res.status} (${url}):\n${text}`);

  const parsed = parseVnptResponse(text);
  return {
    success: res.ok && parsed.errorCode === '0',
    httpStatus: res.status,
    errorCode: parsed.errorCode,
    errorDesc: parsed.errorDesc,
    format,
    url,
    raw: text
  };
}

function formatFetchError(err) {
  const code = err?.cause?.code || err?.code || '';
  const msg = err?.cause?.message || err?.message || 'Unknown network error';
  return [code, msg].filter(Boolean).join(': ');
}

/**
 * Gửi SMS qua API VNPT
 * @param {string|string[]} phone - 1 số hoặc danh sách số
 * @param {string[]} params - Mảng các tham số tương ứng với từng {D,n} trong mẫu đã duyệt
 * @param {string} [customTemplateId] - ID mẫu tin nếu muốn dùng mẫu khác
 * @param {{ format?: 'auto'|'json'|'xml', target?: 'public'|'private' }} [options]
 */
async function sendSms(phone, params, customTemplateId, options = {}) {
  const originalPhones = (Array.isArray(phone) ? phone : [phone]).map(normalizePhone);
  const targetPhones = SMS_TEST_MODE ? [normalizePhone(SMS_TEST_PHONE)] : originalPhones;

  const templateId = customTemplateId || VNPT_TEMPLATE_ID;
  const reqMode = (options.format || VNPT_API_FORMAT || 'auto').toLowerCase();
  const formats = reqMode === 'auto' ? ['json', 'xml'] : [reqMode];
  const urls = resolveCandidateUrls(options.target);

  console.log(`[SMS] Chế độ test: ${SMS_TEST_MODE} | Gốc: ${originalPhones.join(',')} -> Đích: ${targetPhones.join(',')}`);

  const attempts = [];
  let lastResult = null;

  for (const url of urls) {
    let networkFailed = false;
    for (const fmt of formats) {
      const reqId = `${Date.now()}${attempts.length}`;
      try {
        const res = await postToVnpt(url, { phones: targetPhones, params, reqId, templateId, format: fmt });
        attempts.push({
          url,
          format: fmt,
          httpStatus: res.httpStatus,
          errorCode: res.errorCode,
          errorDesc: res.errorDesc
        });
        lastResult = { ...res, reqId, targetPhones, originalPhones, attempts };

        if (res.success) {
          return lastResult;
        }
        const isFormatRejection = res.httpStatus === 415 || res.httpStatus === 400 || res.errorCode === '-1' || !res.errorCode;
        if (!isFormatRejection || reqMode !== 'auto') {
          return lastResult;
        }
      } catch (err) {
        const detail = formatFetchError(err);
        console.error(`[SMS] Lỗi kết nối tới ${url} (${fmt}):`, detail);
        attempts.push({ url, format: fmt, error: detail });
        lastResult = {
          success: false,
          error: err.message,
          errorDetail: detail,
          url,
          reqId,
          targetPhones,
          originalPhones,
          attempts
        };
        networkFailed = true;
        break;
      }
    }
    if (!networkFailed) break;
  }

  return lastResult;
}

async function sendFeedbackNotification(citizenPhone, citizenName, responseNote, feedbackId) {
  const cleanName = removeVietnameseTones(citizenName || 'nguoi dan');
  const cleanNote = removeVietnameseTones(responseNote || 'Da duoc xu ly');

  let params = [];

  if (VNPT_TEMPLATE_ID === '11474554') {
    // Mẫu demo 11474554: "VNPT Vinh Long thong bao: Thu nhap {D,30}. Gom: Luong {D,200}. Thuc lanh: {D,20}"
    params = [
      `KN ${feedbackId || ''} cua ${cleanName}`.slice(0, 30),
      `XL: ${cleanNote}`.slice(0, 200),
      `UBND Chau Thanh`.slice(0, 20)
    ];
  } else {
    params = [
      `${feedbackId || ''} - ${cleanName}`.slice(0, 30),
      cleanNote.slice(0, 300)
    ];
  }

  return sendSms(citizenPhone, params);
}

function checkTcpPort(host, port, timeoutMs = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = net.createConnection({ host, port });
    let done = false;
    const finish = (reachable, error) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve({ host, port, reachable, elapsedMs: Date.now() - start, ...(error ? { error } : {}) });
    };
    socket.setTimeout(timeoutMs);
    socket.on('connect', () => finish(true));
    socket.on('timeout', () => finish(false, 'TIMEOUT'));
    socket.on('error', (err) => finish(false, err.code || err.message));
  });
}

async function checkSmsConnectivity() {
  const configuredUrl = VNPT_SMS_URL || VNPT_PUBLIC_URL;
  let parsed = null;
  try {
    parsed = new URL(configuredUrl);
  } catch {
    parsed = null;
  }

  const [vnptPublic, vnptPrivate, configuredCheck, ipRes] = await Promise.all([
    checkTcpPort('113.185.0.35', 8888),
    checkTcpPort('192.168.38.134', 8888),
    parsed
      ? checkTcpPort(parsed.hostname, Number(parsed.port) || (parsed.protocol === 'https:' ? 443 : 80))
      : Promise.resolve({ reachable: false, error: 'INVALID_URL' }),
    fetch('https://api.ipify.org', { signal: AbortSignal.timeout(3000) })
      .then((r) => (r.ok ? r.text() : null))
      .catch(() => null)
  ]);

  return {
    configuredUrl,
    usingEnvUrl: Boolean(VNPT_SMS_URL),
    format: VNPT_API_FORMAT,
    testMode: SMS_TEST_MODE,
    testPhone: SMS_TEST_PHONE,
    templateId: VNPT_TEMPLATE_ID,
    serverOutboundIp: ipRes,
    checks: {
      configured: configuredCheck,
      vnptPublic,
      vnptPrivate
    }
  };
}

module.exports = {
  sendSms,
  sendFeedbackNotification,
  checkSmsConnectivity,
  normalizePhone,
  removeVietnameseTones,
  SMS_TEST_MODE,
  SMS_TEST_PHONE
};
