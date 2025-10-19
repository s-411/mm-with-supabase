// Verify Supabase connection
const https = require('https');

const options = {
  hostname: 'dmuyymdfpciuqjrarezw.supabase.co',
  path: '/rest/v1/',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sbp_5b47c9a45b39b53c255d9949af02e4d687028828',
    'apikey': 'sbp_5b47c9a45b39b53c255d9949af02e4d687028828'
  }
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Supabase connection successful!');
      console.log('Available endpoints:', data);
    } else {
      console.log('❌ Connection failed');
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();