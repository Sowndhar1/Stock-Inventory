// test-dashboard.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/reports/dashboard',
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
      console.log('✅ Dashboard API Response:');
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
