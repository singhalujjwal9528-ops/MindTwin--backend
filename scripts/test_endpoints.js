const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log("Checking API endpoints...");
  const dash = await get('http://localhost:5000/api/dashboard/1');
  console.log("Dashboard [", dash.status, "]: Forecast:", dash.body.forecast);
  
  const ins = await get('http://localhost:5000/api/insights/1');
  console.log("Insights [", ins.status, "]: HealthScore:", ins.body.healthScore, "Insights Count:", ins.body.insights?.length);

  const ana = await get('http://localhost:5000/api/analytics/1');
  console.log("Analytics [", ana.status, "]: Recovery:", ana.body.recoveryScore, "Consistency:", ana.body.circadianConsistency, "CogLoad:", ana.body.cognitiveLoadIndex);

  const pro = await get('http://localhost:5000/api/users/profile/1');
  console.log("Profile [", pro.status, "]: Name:", pro.body.user_names, "Email:", pro.body.email, "TargetSleep:", pro.body.targetSleep);
}

run().catch(console.error);
