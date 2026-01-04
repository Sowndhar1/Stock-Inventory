// test-dashboard-revenue.js
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
      console.log('Today\'s Sales:', data.todaySales);
      console.log('Today\'s Revenue: ₹', data.todayRevenue);
      console.log('Monthly Sales:', data.monthlySales);
      console.log('Monthly Revenue: ₹', data.monthlyRevenue);
      console.log('Total Products:', data.totalProducts);
      console.log('Low Stock Products:', data.lowStockProducts);
    } catch (e) {
      console.log('Response body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
