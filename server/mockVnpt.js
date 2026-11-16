// server/mockVnpt.js
// Máy chủ giả lập VNPT SMS Brandname để kiểm tra luồng gửi nhận tin nhắn
const http = require('http');

const PORT = 8888;
const PATH = '/smsbn/api';

function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

const server = http.createServer((req, res) => {
  // Chỉ nhận POST tới /smsbn/api
  if (req.method !== 'POST' || !req.url.startsWith(PATH)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end(`Mock VNPT chỉ nhận POST tại ${PATH}`);
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    console.log('\n================== [MOCK VNPT NHẬN GÓI TIN] ==================');
    console.log(body);
    console.log('==============================================================');

    const reqId = getTag(body, 'REQID');
    const contractId = getTag(body, 'CONTRACTID');
    const labelId = getTag(body, 'LABELID');
    const templateId = getTag(body, 'TEMPLATEID');
    const mobileList = getTag(body, 'MOBILELIST');
    const apiUser = getTag(body, 'APIUSER');
    const apiPass = getTag(body, 'APIPASS');

    // Đếm số lượng thẻ PARAMS
    const paramsMatches = body.match(/<PARAMS>[\s\S]*?<\/PARAMS>/gi) || [];

    let errorCode = '0';
    let errorDesc = 'Success';

    if (!reqId) {
      errorCode = '-1';
      errorDesc = 'Thiếu REQID (REQID không được để trống)';
    } else if (!apiUser || !apiPass || apiUser !== 'vnpt-vnpvlg' || apiPass !== 'Vnpt@123') {
      errorCode = '1';
      errorDesc = 'Username, password không hợp lệ';
    } else if (!mobileList || !/^84\d{9,10}/.test(mobileList)) {
      errorCode = '23';
      errorDesc = 'Số điện thoại không hợp lệ (phải có dạng 84xxxxxxxxx)';
    } else if (paramsMatches.length === 0) {
      errorCode = '27';
      errorDesc = 'Mẫu tin yêu cầu tham số PARAMS nhưng không tìm thấy';
    }

    const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<RSPN name="send_sms_list">
  <REQID>${reqId || ''}</REQID>
  <ERROR>${errorCode}</ERROR>
  <ERROR_DESC>${errorDesc}</ERROR_DESC>
  <MESSAGEID>${Date.now()}</MESSAGEID>
</RSPN>`;

    console.log('[MOCK VNPT TRẢ VỀ]', `ERROR = ${errorCode} (${errorDesc})`);

    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(responseXml);
  });
});

server.listen(PORT, () => {
  console.log(`[MOCK VNPT] Đang chạy giả lập cổng VNPT tại http://localhost:${PORT}${PATH}`);
  console.log(`[MOCK VNPT] Sẵn sàng nhận gói tin kiểm tra...`);
});
