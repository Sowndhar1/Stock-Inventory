// test-low-stock.js
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/products/low-stock',
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
      console.log('✅ Low Stock API Response:');
      console.log(`Total products: ${data.products?.length || 0}`);
      console.log(`Pagination: ${JSON.stringify(data.pagination)}`);

      if (data.products && data.products.length > 0) {
        console.log('\n📦 Sample products:');
        data.products.slice(0, 3).forEach(p => {
          console.log(`  - ${p.name}: qty=${p.quantity}, status=${p.stockStatus?.status}, reorder=${p.reorderPoint}`);
        });
      }
    } catch (e) {
      console.log('Response body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
