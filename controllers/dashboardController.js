const User = require("../models/User");
const Activity = require("../models/Activity");
const Heart = require("../models/Heart");
const Sleep = require("../models/Sleep");
const PhoneUsage = require("../models/PhoneUsage");
const Mood = require("../models/Mood");
const { getMoodPrediction } = require("../services/predictionService");

// Default realistic telemetry fallback if user has no data yet
const defaultFallback = {
  sleep: [
    { total_sleep_hours: 6.8, total_sleep: 6.8, sleep_efficiency: 85 },
    { total_sleep_hours: 7.2, total_sleep: 7.2, sleep_efficiency: 88 },
    { total_sleep_hours: 8.0, total_sleep: 8.0, sleep_efficiency: 92 },
    { total_sleep_hours: 6.5, total_sleep: 6.5, sleep_efficiency: 80 },
    { total_sleep_hours: 7.5, total_sleep: 7.5, sleep_efficiency: 86 },
    { total_sleep_hours: 7.8, total_sleep: 7.8, sleep_efficiency: 90 },
    { total_sleep_hours: 8.2, total_sleep: 8.2, sleep_efficiency: 94 },
  ],
  heart: [
    { heart_rate: 68 },
    { heart_rate: 72 },
    { heart_rate: 70 },
    { heart_rate: 75 },
    { heart_rate: 69 },
    { heart_rate: 66 },
    { heart_rate: 71 },
  ],
  phone: [
    { screen_time: 4.2 },
    { screen_time: 3.5 },
    { screen_time: 4.8 },
    { screen_time: 3.9 },
    { screen_time: 2.8 },
    { screen_time: 3.1 },
    { screen_time: 2.4 },
  ],
  mood: [
    { mood_rating: 4, tag: "Well Rested" },
    { mood_rating: 3, tag: "Work Stress" },
    { mood_rating: 4, tag: "Deep Focus" },
    { mood_rating: 4, tag: "Post-Workout" },
    { mood_rating: 5, tag: "Social Time" },
    { mood_rating: 4, tag: "Deep Focus" },
    { mood_rating: 5, tag: "Well Rested" },
  ],
};

const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;
    const numUserId = Number(userId) || 1;

    // 1. Fetch user profile
    let user = await User.findOne({ user_id: numUserId });
    if (!user && numUserId === 1) {
      // Fallback profile for user 1 if not found
      user = {
        user_id: 1,
        user_names: "Alex Johnson",
        email: "alex.johnson@mindtwin.ai",
        age: 26,
        gender: "Non-binary",
      };
    }

    let userSafe = null;
    if (user) {
      userSafe = user.toObject ? user.toObject() : { ...user };
      delete userSafe.password;
    }

    // 2. Fetch recent historical arrays (up to 7 latest entries, in chronological order)
    const [rawSleep, rawHeart, rawScreen, rawMood, latestActivity] = await Promise.all([
      Sleep.find({ user_id: numUserId }).sort({ sleep_start: -1 }).limit(7),
      Heart.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(7),
      PhoneUsage.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(7),
      Mood.find({ user_id: numUserId }).sort({ timestamp: -1 }).limit(7),
      Activity.findOne({ user_id: numUserId }).sort({ timestamp: -1 })
    ]);

    // Format sleep data: ensure both total_sleep_hours and total_sleep exist
    let sleep = rawSleep.reverse().map(s => {
      const hours = s.total_sleep_hours !== undefined && s.total_sleep_hours !== null
        ? Number(s.total_sleep_hours)
        : Number(s.total_sleep || 7.5);
      return {
        _id: s._id,
        user_id: s.user_id,
        sleep_start: s.sleep_start,
        sleep_end: s.sleep_end,
        total_sleep_hours: Number(hours.toFixed(1)),
        total_sleep: Number(hours.toFixed(1)),
        sleep_efficiency: s.sleep_efficiency || 85,
        movement: s.movement || 5,
        sleep_rating: s.sleep_rating || 4
      };
    });
    if (sleep.length === 0) sleep = defaultFallback.sleep;

    // Format heart data
    let heart = rawHeart.reverse().map(h => ({
      _id: h._id,
      user_id: h.user_id,
      timestamp: h.timestamp,
      heart_rate: h.heart_rate || 70,
      max_heart: h.max_heart || h.max_heart_rate || 85,
      min_heart: h.min_heart || h.min_heart_rate || 55,
      heart_rate_variability: h.heart_rate_variability || 50
    }));
    if (heart.length === 0) heart = defaultFallback.heart;

    // Format phone / screen data: convert minutes to hours if > 24 so the recharts [0, 8] domain displays cleanly
    let phone = rawScreen.reverse().map(p => {
      let screenTimeHours = p.screen_time || 3.0;
      if (screenTimeHours > 24) {
        screenTimeHours = Math.round((screenTimeHours / 60) * 10) / 10;
      }
      return {
        _id: p._id,
        user_id: p.user_id,
        timestamp: p.timestamp,
        screen_time: Number(screenTimeHours),
        app_usage_time: p.app_usage_time || 0
      };
    });
    if (phone.length === 0) phone = defaultFallback.phone;

    // Format mood data
    let mood = rawMood.reverse().map(m => ({
      _id: m._id,
      user_id: m.user_id,
      timestamp: m.timestamp,
      mood_rating: m.mood_rating || 4,
      tag: m.tag || undefined
    }));
    if (mood.length === 0) mood = defaultFallback.mood;

    // 3. Obtain ML Prediction & Forecast from trained HistGradientBoostingRegressor model
    let prediction = null;
    try {
      prediction = await getMoodPrediction(numUserId);
    } catch (e) {
      console.warn("Prediction service error in dashboard:", e.message);
    }

    // 4. Return complete, synchronized payload compatible with both frontend and legacy consumers
    res.status(200).json({
      profile: userSafe,
      sleep,
      heart,
      phone,
      screen: phone, // Provide both phone and screen for backward compatibility
      mood,
      activity: latestActivity || {
        steps: 8500,
        calories: 2240,
        distance: 6.2
      },
      forecast: prediction ? prediction.forecast : null,
      insights: prediction ? prediction.insights : []
    });

  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getDashboardData
};