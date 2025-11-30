// scripts/health-check.js
const http = require('http');

const PORT = process.env.PORT || 3000;
const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/health',
  method: 'GET',
  timeout: 3000
};

const req = http.request(options, (res) => {
  console.log(`Health check: STATUS: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check: ERROR:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check: TIMEOUT');
  req.destroy();
  process.exit(1);
});

req.end();