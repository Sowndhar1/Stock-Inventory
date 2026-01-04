// test-sale-details.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reports/sale/68e099c7bad6620e2bf3b65c',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer test',
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      console.log('✅ Sale Details Response:');
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Response body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
