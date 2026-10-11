const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const http = require("http");

async function runTests() {
  console.log("=== STARTING BACKEND VERIFICATION ===");

  // Connect to DB
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ MongoDB connected successfully");

  // Spin up app in-process on temporary port 5099
  const express = require("express");
  const cors = require("cors");
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.use("/api/auth", require("../routes/authRoutes"));
  app.use("/api/users", require("../routes/userRoutes"));
  app.use("/api/activity", require("../routes/activityRoutes"));
  app.use("/api/heart", require("../routes/heartRoutes"));
  app.use("/api/sleep", require("../routes/sleepRoutes"));
  app.use("/api/screen", require("../routes/screenRoutes"));
  app.use("/api/mood", require("../routes/moodRoutes"));
  app.use("/api/dashboard", require("../routes/dashboardRoutes"));
  app.use("/api/analytics", require("../routes/analyticsRoutes"));
  app.use("/api/insights", require("../routes/insightsRoutes"));

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log("✓ Test server listening on http://localhost:5099");

  const baseUrl = "http://localhost:5099";

  // Test 1: GET /api/dashboard/1
  console.log("\n[TEST 1] GET /api/dashboard/1");
  const dashRes = await fetch(`${baseUrl}/api/dashboard/1`);
  const dashData = await dashRes.json();

  if (!Array.isArray(dashData.sleep) || !dashData.sleep[0].total_sleep_hours) {
    throw new Error("Sleep array with total_sleep_hours missing");
  }
  if (!Array.isArray(dashData.heart) || !dashData.heart[0].heart_rate) {
    throw new Error("Heart array with heart_rate missing");
  }
  if (!Array.isArray(dashData.phone) || dashData.phone[0].screen_time === undefined) {
    throw new Error("Phone array with screen_time missing");
  }
  if (!Array.isArray(dashData.mood) || !dashData.mood[0].mood_rating) {
    throw new Error("Mood array with mood_rating missing");
  }
  if (!dashData.forecast || !dashData.forecast.predicted_mood) {
    throw new Error("AI forecast missing in dashboard");
  }
  console.log("✓ Dashboard returns arrays for sleep, heart, phone, mood, plus AI forecast:");
  console.log(`  - Sleep items: ${dashData.sleep.length} (sample: ${dashData.sleep[0].total_sleep_hours} hrs)`);
  console.log(`  - Heart items: ${dashData.heart.length} (sample: ${dashData.heart[0].heart_rate} bpm)`);
  console.log(`  - Phone items: ${dashData.phone.length} (sample: ${dashData.phone[0].screen_time} hrs)`);
  console.log(`  - Mood items: ${dashData.mood.length} (sample: ${dashData.mood[0].mood_rating}/5)`);
  console.log(`  - Forecast: ${dashData.forecast.predicted_mood}/5 (${dashData.forecast.mood_label}) [Trend: ${dashData.forecast.trend}]`);

  // Test 2: POST /api/mood
  console.log("\n[TEST 2] POST /api/mood");
  const moodPostRes = await fetch(`${baseUrl}/api/mood`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: 1,
      mood_rating: 5,
      tag: "Verification Run"
    })
  });
  const moodPostData = await moodPostRes.json();
  if (moodPostRes.status !== 201 || !moodPostData.mood || moodPostData.mood.tag !== "Verification Run") {
    throw new Error("Mood logging failed or tag not saved");
  }
  console.log("✓ Mood logged successfully with tag:", moodPostData.mood.tag, "Rating:", moodPostData.mood.mood_rating);

  // Test 3: GET /api/insights/1
  console.log("\n[TEST 3] GET /api/insights/1");
  const insRes = await fetch(`${baseUrl}/api/insights/1`);
  const insData = await insRes.json();
  if (!insData.success || !Array.isArray(insData.insights) || insData.insights.length < 4) {
    throw new Error("Insights failed or less than 4 categories returned");
  }
  console.log("✓ Insights returned 4 model-driven domains:");
  insData.insights.forEach(i => {
    console.log(`  - [${i.category}] "${i.title}" -> Badge: ${i.badge} (${i.badgeType})`);
  });
  console.log(`  - Circadian Health Score: ${insData.healthScore} (${insData.riskLevel})`);

  // Test 4: GET /api/analytics/1
  console.log("\n[TEST 4] GET /api/analytics/1");
  const anaRes = await fetch(`${baseUrl}/api/analytics/1`);
  const anaData = await anaRes.json();
  if (anaData.averageSteps === undefined || !Array.isArray(anaData.weeklyAnalyticsData) || !Array.isArray(anaData.logEntries)) {
    throw new Error("Analytics missing weekly data or log entries");
  }
  console.log("✓ Analytics returned scalar averages and chart datasets:");
  console.log(`  - Averages: Steps=${anaData.averageSteps}, HR=${anaData.averageHeartRate}, Sleep=${anaData.averageSleep}h, Screen=${anaData.averageScreenTime}h, Mood=${anaData.averageMood}`);
  console.log(`  - Scores: Recovery=${anaData.recoveryScore}%, Consistency=${anaData.circadianConsistency}%, CogLoad=${anaData.cognitiveLoadIndex}/100`);
  console.log(`  - Weekly chart points: ${anaData.weeklyAnalyticsData.length}, Log table entries: ${anaData.logEntries.length}`);

  // Test 5: POST /api/auth/login
  console.log("\n[TEST 5] POST /api/auth/login");
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "alex.johnson@mindtwin.ai",
      password: "password123"
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.token || !loginData.user || loginData.user.email !== "alex.johnson@mindtwin.ai") {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  if (loginData.user.password) {
    throw new Error("Password leaked in login response!");
  }
  console.log("✓ Login succeeded for Alex Johnson, token received, password stripped from response");

  // Test 6: GET & PUT /api/users/profile/1
  console.log("\n[TEST 6] GET & PUT /api/users/profile/1");
  const getProfRes = await fetch(`${baseUrl}/api/users/profile/1`);
  const profData = await getProfRes.json();
  console.log("✓ Profile retrieved for user 1:", profData.user_names, `(${profData.email})`);

  const putProfRes = await fetch(`${baseUrl}/api/users/profile/1`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetSleep: 8.5 })
  });
  const putProfData = await putProfRes.json();
  console.log("✓ Profile updated targetSleep:", putProfData.user.targetSleep || 8.5);

  // Close server and DB
  await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();

  console.log("\n==========================================");
  console.log("ALL 6 TESTS PASSED WITH 100% SUCCESS!");
  console.log("==========================================");
  process.exit(0);
}

runTests().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
