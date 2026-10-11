const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");
const User = require("../models/User");

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const numUserId = Number(userId) || 1;

    // Fetch records for the user
    const [activities, hearts, sleeps, screens, moods, user] = await Promise.all([
      Activity.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(30),
      Heart.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(30),
      Sleep.find({ user_id: numUserId }).sort({ sleep_start: -1 }).limit(30),
      PhoneUsage.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(30),
      Mood.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(30),
      User.findOne({ user_id: numUserId })
    ]);

    // 1. Calculate scalar averages
    const averageSteps = activities.length > 0
      ? Math.round(activities.reduce((sum, item) => sum + (item.steps || 0), 0) / activities.length)
      : 8500;

    const averageHeartRate = hearts.length > 0
      ? Math.round(hearts.reduce((sum, item) => sum + (item.heart_rate || 0), 0) / hearts.length)
      : 69;

    const averageSleep = sleeps.length > 0
      ? Number((sleeps.reduce((sum, item) => sum + (item.total_sleep_hours || item.total_sleep || 0), 0) / sleeps.length).toFixed(1))
      : 7.4;

    const averageScreenMinutes = screens.length > 0
      ? screens.reduce((sum, item) => sum + (item.screen_time || 0), 0) / screens.length
      : 210;
    const averageScreenTime = Number((averageScreenMinutes > 24 ? averageScreenMinutes / 60 : averageScreenMinutes).toFixed(1));

    const averageMood = moods.length > 0
      ? Number((moods.reduce((sum, item) => sum + (item.mood_rating || 0), 0) / moods.length).toFixed(1))
      : 4.1;

    // 2. Score cards
    const recoveryScore = Math.min(96, Math.max(65, Math.round(100 - (averageHeartRate - 55) * 0.7 + (averageSleep - 6) * 4)));
    const circadianConsistency = Math.min(98, Math.max(70, Math.round(85 + (averageSleep >= 7 ? 7 : -5))));
    const cognitiveLoadIndex = Math.min(80, Math.max(20, Math.round((averageScreenTime / 8) * 40 + (5 - averageMood) * 10)));

    // 3. Weekly comparison data (7 latest days)
    const weeklyAnalyticsData = [];
    const count = Math.max(7, Math.min(sleeps.length, screens.length, 7));
    for (let i = count - 1; i >= 0; i--) {
      const s = sleeps[i] || {};
      const sc = screens[i] || {};
      const d = s.sleep_start ? new Date(s.sleep_start) : new Date(Date.now() - i * 86400000);
      const dayLabel = dayNames[d.getDay()] || `D${count - i}`;

      const rawSleepHours = s.total_sleep_hours || s.total_sleep || (7.0 + (i % 3) * 0.4);
      let rawScreenHours = sc.screen_time || (3.2 + (i % 2) * 0.8);
      if (rawScreenHours > 24) rawScreenHours = rawScreenHours / 60;

      const dailyRecovery = Math.min(98, Math.max(65, Math.round(75 + (rawSleepHours - 6) * 8 - (rawScreenHours - 3) * 3)));

      weeklyAnalyticsData.push({
        day: dayLabel,
        sleep: Number(Number(rawSleepHours).toFixed(1)),
        screenTime: Number(Number(rawScreenHours).toFixed(1)),
        recovery: dailyRecovery
      });
    }

    // 4. Formatted historical log entries with accurate current dates
    const logEntries = [];
    const processedDateKeys = new Set();

    // Prioritize user's recent moods so newly logged entries immediately appear with their current timestamp
    for (const m of moods) {
      if (logEntries.length >= 8) break;
      const mDate = m.timestamp ? new Date(m.timestamp) : new Date();
      const dateKey = mDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (processedDateKeys.has(dateKey)) continue;

      // Match sleep within 24h of mood
      const matchedSleep = sleeps.find(s => {
        if (!s.sleep_start) return false;
        return Math.abs(mDate - new Date(s.sleep_start)) < 24 * 3600 * 1000;
      });
      const sHrs = matchedSleep 
        ? (matchedSleep.total_sleep_hours || matchedSleep.total_sleep || 7.5) 
        : (user?.targetSleep || averageSleep || 8.0);

      // Match heart within 24h
      const matchedHeart = hearts.find(h => {
        if (!h.timestamp) return false;
        return Math.abs(mDate - new Date(h.timestamp)) < 24 * 3600 * 1000;
      });
      const hrVal = matchedHeart ? (matchedHeart.heart_rate || 68) : averageHeartRate;

      // Match screen within 24h
      const matchedScreen = screens.find(sc => {
        if (!sc.timestamp) return false;
        return Math.abs(mDate - new Date(sc.timestamp)) < 24 * 3600 * 1000;
      });
      let scHrs = matchedScreen ? (matchedScreen.screen_time || 210) : (averageScreenTime * 60);
      if (scHrs > 24) scHrs = scHrs / 60;

      const moodVal = m.mood_rating !== undefined ? m.mood_rating : 4;
      const moodDisplay = m.tag ? `${moodVal} / 5 (${m.tag})` : `${moodVal} / 5`;

      let status = "Optimal";
      let statusColor = "emerald";
      if (moodVal <= 2 || sHrs < 6.5 || hrVal > 78) {
        status = "Moderate";
        statusColor = "amber";
      } else if (moodVal >= 4 && sHrs >= 7.0 && hrVal < 72) {
        status = "Optimal";
        statusColor = "emerald";
      } else {
        status = "Normal";
        statusColor = "blue";
      }

      logEntries.push({
        date: dateKey,
        sleep: `${Number(sHrs).toFixed(1)} hrs`,
        hr: `${Math.round(hrVal)} bpm`,
        screen: `${Number(scHrs).toFixed(1)} hrs`,
        mood: moodDisplay,
        status,
        statusColor
      });

      processedDateKeys.add(dateKey);
    }

    // Fill remaining table rows from historical sleeps
    for (const s of sleeps) {
      if (logEntries.length >= 8) break;
      const sDate = s.sleep_start ? new Date(s.sleep_start) : new Date();
      const dateKey = sDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (processedDateKeys.has(dateKey)) continue;

      const sHrs = s.total_sleep_hours || s.total_sleep || 7.5;
      const matchedHeart = hearts.find(h => h.timestamp && Math.abs(sDate - new Date(h.timestamp)) < 24 * 3600 * 1000);
      const hrVal = matchedHeart ? matchedHeart.heart_rate : averageHeartRate;

      const matchedScreen = screens.find(sc => sc.timestamp && Math.abs(sDate - new Date(sc.timestamp)) < 24 * 3600 * 1000);
      let scHrs = matchedScreen ? matchedScreen.screen_time : 210;
      if (scHrs > 24) scHrs = scHrs / 60;

      const matchedMood = moods.find(m => m.timestamp && Math.abs(sDate - new Date(m.timestamp)) < 24 * 3600 * 1000);
      const moodVal = matchedMood ? matchedMood.mood_rating : averageMood;
      const moodDisplay = matchedMood && matchedMood.tag ? `${moodVal} / 5 (${matchedMood.tag})` : `${moodVal} / 5`;

      let status = "Optimal";
      let statusColor = "emerald";
      if (moodVal <= 2 || sHrs < 6.5 || hrVal > 78) {
        status = "Moderate";
        statusColor = "amber";
      } else if (moodVal >= 4 && sHrs >= 7.0 && hrVal < 72) {
        status = "Optimal";
        statusColor = "emerald";
      } else {
        status = "Normal";
        statusColor = "blue";
      }

      logEntries.push({
        date: dateKey,
        sleep: `${Number(sHrs).toFixed(1)} hrs`,
        hr: `${Math.round(hrVal)} bpm`,
        screen: `${Number(scHrs).toFixed(1)} hrs`,
        mood: moodDisplay,
        status,
        statusColor
      });

      processedDateKeys.add(dateKey);
    }

    res.status(200).json({
      // Backward compatible scalar averages
      averageSteps,
      averageHeartRate,
      averageSleep,
      averageScreenTime,
      averageMood,
      // Biometric scores
      recoveryScore,
      circadianConsistency,
      cognitiveLoadIndex,
      // Grouped bar chart & history table datasets
      weeklyAnalyticsData,
      logEntries
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAnalytics
};