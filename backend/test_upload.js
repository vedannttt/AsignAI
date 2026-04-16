const fs = require('fs');
const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

fs.writeFileSync('test_dummy.txt', 'This is a test file.');

const body = Buffer.concat([
  Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="files"; filename="test_dummy.txt"\r\nContent-Type: text/plain\r\n\r\n`),
  fs.readFileSync('test_dummy.txt'),
  Buffer.from(`\r\n--${boundary}--\r\n`)
]);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': body.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', responseData);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(body);
req.end();
