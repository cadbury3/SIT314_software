import http from 'http';

function request(method, path, body) {
  const data = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: 'localhost', port: process.env.PORT || 4000, path, method, headers: { 'Content-Type': 'application/json' } },
      res => {
        let chunks = '';
        res.on('data', d => (chunks += d));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: chunks ? JSON.parse(chunks) : null });
          } catch {
            resolve({ status: res.statusCode, body: chunks });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const created = await request('POST', '/api/readings', {
    temperature: 28.4,
    humidity: 40,
    wind: 5,
    smoke: 0,
    location: 'Melbourne, AU'
  });
  console.log('POST /api/readings', created.status, created.body);

  const latest = await request('GET', '/api/temperature/latest');
  console.log('GET /api/temperature/latest', latest.status, latest.body);

  const byLoc = await request('GET', '/api/readings/location?q=Melbourne');
  console.log('GET /api/readings/location?q=Melbourne', byLoc.status, byLoc.body);

  const weather = await request('GET', '/api/weather?q=Melbourne, AU');
  console.log('GET /api/weather', weather.status, Array.isArray(weather.body) ? weather.body[0] : weather.body);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});


