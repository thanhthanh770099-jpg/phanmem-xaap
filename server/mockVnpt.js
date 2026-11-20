// server/mockVnpt.js
// Máy chủ giả lập VNPT SMS Brandname (hỗ trợ cả JSON và XML) để kiểm tra luồng gửi nhận tin nhắn
const http = require('http');

const PORT = 8888;
const PATH = '/smsbn/api';

function getTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : null;
}

function parseIncoming(body) {
  const trimmed = body.trim();
  if (trimmed.startsWith('{')) {
    const json = JSON.parse(trimmed);
    const rq = json.RQST || json;
    return {
      isJson: true,
      reqId: rq.REQID || '',
      mobileList: rq.MOBILELIST || '',
      apiUser: rq.APIUSER || '',
      apiPass: rq.APIPASS || '',
      paramsCount: Array.isArray(rq.PARAMS) ? rq.PARAMS.length : 0
    };
  }
  const paramsMatches = trimmed.match(/<PARAMS>[\s\S]*?<\/PARAMS>/gi) || [];
  return {
    isJson: false,
    reqId: getTag(trimmed, 'REQID'),
    mobileList: getTag(trimmed, 'MOBILELIST'),
    apiUser: getTag(trimmed, 'APIUSER'),
    apiPass: getTag(trimmed, 'APIPASS'),
    paramsCount: paramsMatches.length
  };
}

const server = http.createServer((req, res) => {
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

    let parsed;
    try {
      parsed = parseIncoming(body);
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ RPLY: { name: 'ERROR', ERROR: '-1', ERROR_DESC: 'exception' } }));
    }

    let errorCode = '0';
    let errorDesc = 'Success';

    if (!parsed.reqId) {
      errorCode = '-1';
      errorDesc = 'Thiếu REQID (REQID không được để trống)';
    } else if (parsed.apiUser !== 'vnpt-vnpvlg' || parsed.apiPass !== 'Vnpt@123') {
      errorCode = '1';
      errorDesc = 'user, pass, ip, status khong hop le';
    } else if (!parsed.mobileList || !/^84\d{9,10}/.test(parsed.mobileList)) {
      errorCode = '23';
      errorDesc = 'Số điện thoại không hợp lệ (phải có dạng 84xxxxxxxxx)';
    } else if (parsed.paramsCount === 0) {
      errorCode = '27';
      errorDesc = 'Mẫu tin yêu cầu tham số PARAMS nhưng không tìm thấy';
    }

    console.log('[MOCK VNPT TRẢ VỀ]', `ERROR = ${errorCode} (${errorDesc})`);

    if (parsed.isJson) {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({
        RPLY: {
          name: 'send_sms_list',
          ERROR: errorCode,
          ERROR_DESC: errorDesc,
          REQID: parsed.reqId
        }
      }));
    }

    const responseXml = `<?xml version="1.0" encoding="utf-8"?>
<RSPN name="send_sms_list">
  <REQID>${parsed.reqId || ''}</REQID>
  <ERROR>${errorCode}</ERROR>
  <ERROR_DESC>${errorDesc}</ERROR_DESC>
  <MESSAGEID>${Date.now()}</MESSAGEID>
</RSPN>`;
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(responseXml);
  });
});

server.listen(PORT, () => {
  console.log(`[MOCK VNPT] Đang chạy giả lập cổng VNPT tại http://localhost:${PORT}${PATH}`);
  console.log('[MOCK VNPT] Hỗ trợ cả JSON và XML...');
});
